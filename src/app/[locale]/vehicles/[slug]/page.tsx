import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import VehicleDetailLayout from '@/components/vehicle-detail/VehicleDetailLayout';
import { Vehicle } from '@/types/vehicle';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Supabase select query for vehicle trims with all required fields
const VEHICLE_DETAIL_SELECT = `
  id,
  trim_name,
  model_year,
  price_egp,
  model_id,
  category_id,
  transmission_id,
  fuel_type_id,
  body_style_id,
  segment_id,
  country_of_origin_id,
  agent_id,
  engine,
  seats,
  horsepower,
  torque_nm,
  acceleration_0_100,
  top_speed,
  fuel_consumption,
  features,
  placeholder_image_url,
  trim_count,
  is_imported,
  is_electric,
  is_hybrid,
  models!inner(
    name,
    hero_image_url,
    hover_image_url,
    brands!inner(
      name,
      logo_url
    )
  ),
  categories(name),
  transmissions(name),
  fuel_types(name),
  body_styles(name_en, name_ar),
  segments(code, name_en, name_local),
  countries(name_en, name_ar, flag_url),
  agents(name_en, name_ar, logo_url),
  venue_trims(venues(id, name)),
  vehicle_images(image_url, display_order, is_primary, image_type)
`;

/**
 * Vehicle detail page with trim comparison
 * Route: /[locale]/vehicles/[slug]
 * Slug format: brand-name-model-name-year (e.g., toyota-corolla-2025)
 */
export default async function VehicleDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;

  // Parse slug: brand-name-model-name-year
  const parts = slug.split('-');
  const year = parseInt(parts[parts.length - 1], 10);

  if (isNaN(year)) {
    notFound();
  }

  // Reconstruct model name from middle parts (everything except first part and last part)
  // Example: "toyota-corolla-cross-2025" → brand="toyota", model="corolla cross", year=2025
  // DB inconsistencies: "UNI-T" (hyphen), "Q7 2025" (space+year), "Corolla Cross" (space)
  const brandSlug = parts[0];
  const modelParts = parts.slice(1, -1);

  // Try both space and hyphen patterns
  // Space: "uni t" matches "Uni T" - most common
  // Hyphen: "uni-t" matches "UNI-T" - Changan models
  const modelNameSpace = modelParts.join(' ');
  const modelNameHyphen = modelParts.join('-');

  // Fetch all trims for this model + year
  // Try space-separated first (most common: "Corolla Cross", "Q7 2025")
  let { data: trims, error } = await supabase
    .from('vehicle_trims')
    .select(VEHICLE_DETAIL_SELECT)
    .eq('model_year', year)
    .ilike('models.name', `%${modelNameSpace}%`)
    .order('price_egp', { ascending: true });

  // Fallback: If no results and patterns differ, try hyphen-separated (Changan: "UNI-T", "UNI-V")
  if ((!trims || trims.length === 0) && modelNameSpace !== modelNameHyphen) {
    ({ data: trims, error } = await supabase
      .from('vehicle_trims')
      .select(VEHICLE_DETAIL_SELECT)
      .eq('model_year', year)
      .ilike('models.name', `%${modelNameHyphen}%`)
      .order('price_egp', { ascending: true }));
  }

  if (error || !trims || trims.length === 0) {
    console.error('Error fetching vehicle:', error);
    notFound();
  }

  // Type assertion: Supabase flattens !inner joins at runtime
  // Using unknown intermediate to satisfy TypeScript strict checking
  const vehicleTrims = trims as unknown as Vehicle[];

  // Verify brand matches slug
  const vehicle = vehicleTrims[0];
  const vehicleBrandSlug = vehicle.models.brands.name.toLowerCase().replace(/\s+/g, '-');

  if (vehicleBrandSlug !== brandSlug) {
    notFound();
  }

  // Fetch similar vehicles (same brand, different models)
  const { data: similarVehicles } = await supabase
    .from('vehicle_trims')
    .select(`
      id,
      model_id,
      model_year,
      price_egp,
      models!inner(
        name,
        hero_image_url,
        brands!inner(
          name
        )
      )
    `)
    .eq('models.brands.name', vehicle.models.brands.name)
    .neq('model_id', vehicle.model_id)
    .eq('model_year', year)
    .order('price_egp', { ascending: true })
    .limit(4);

  // Group similar vehicles by model (deduplicate)
  const uniqueSimilar = similarVehicles?.reduce((acc: any[], trim: any) => {
    if (!acc.find((v) => v.model_id === trim.model_id)) {
      acc.push(trim);
    }
    return acc;
  }, []) || [];

  return (
    <VehicleDetailLayout
      trims={vehicleTrims}
      vehicle={vehicle}
      similarVehicles={uniqueSimilar}
      locale={locale}
    />
  );
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const parts = slug.split('-');
  const year = parts[parts.length - 1];
  const brandName = parts[0];
  const modelName = parts.slice(1, -1).join(' ');

  const title = `${brandName.charAt(0).toUpperCase() + brandName.slice(1)} ${modelName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} ${year}`;

  return {
    title: `${title} - Test Drive Egypt`,
    description: `Book a test drive for ${title}. Compare trims, check specs, and schedule your appointment today.`,
  };
}
