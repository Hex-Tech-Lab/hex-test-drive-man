import { supabase } from '@/lib/supabase';
import { Vehicle } from '@/types/vehicle';
import { getVehicleImages } from '@/config/vehicleImages';
import type { VehicleWithImagesExtension } from '@/types/VehicleImage';

const VEHICLE_SELECT = `
  *,
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
  body_styles(name_en, name_ar, icon_url, display_order),
  countries(name_en, name_ar, flag_url, iso_code, region),
  agents(name_en, name_ar, logo_url, website_url),
  venue_trims(
    vehicle_trim_id,
    venue_id,
    is_available,
    venues(id, name, address)
  ),
  vehicle_images(
    image_url,
    display_order,
    is_primary,
    image_type,
    alt_text_en,
    alt_text_ar
  )
`;

/**
 * Type for vehicles enriched with image configuration
 */
export type VehicleWithImages = Vehicle & VehicleWithImagesExtension;

/**
 * Enriches vehicles with image configuration from the central registry
 * Maps brand, model, and year to static image paths
 */
function enrichWithImageConfig(vehicles: Vehicle[]): VehicleWithImages[] {
  return vehicles.map((vehicle) => ({
    ...vehicle,
    imageConfig: getVehicleImages(
      vehicle.models.brands.name,
      vehicle.models.name,
      vehicle.model_year
    ) ?? undefined,
  }));
}

/**
 * Enriches a single vehicle with image configuration
 */
function enrichSingleVehicleWithImageConfig(vehicle: Vehicle): VehicleWithImages {
  return {
    ...vehicle,
    imageConfig: getVehicleImages(
      vehicle.models.brands.name,
      vehicle.models.name,
      vehicle.model_year
    ) ?? undefined,
  };
}

export const vehicleRepository = {
  async getAllVehicles() {
    const { data, error } = await supabase
      .from('vehicle_trims')
      .select(VEHICLE_SELECT)
      .order('model_year', { ascending: false });

    if (error || !data) {
      return { data: null, error };
    }

    return { data: enrichWithImageConfig(data as Vehicle[]), error: null };
  },

  async getVehicleById(id: string) {
    const { data, error } = await supabase
      .from('vehicle_trims')
      .select(VEHICLE_SELECT)
      .eq('id', id)
      .single();

    if (error || !data) {
      return { data: null, error };
    }

    return { data: enrichSingleVehicleWithImageConfig(data as Vehicle), error: null };
  },

  async getVehiclesByBrand(brandName: string) {
    const { data, error } = await supabase
      .from('vehicle_trims')
      .select(VEHICLE_SELECT)
      .eq('models.brands.name', brandName);

    if (error || !data) {
      return { data: null, error };
    }

    return { data: enrichWithImageConfig(data as Vehicle[]), error: null };
  },

  async getVehiclesByCategory(categoryName: string) {
    const { data, error } = await supabase
      .from('vehicle_trims')
      .select(VEHICLE_SELECT)
      .eq('categories.name', categoryName);

    if (error || !data) {
      return { data: null, error };
    }

    return { data: enrichWithImageConfig(data as Vehicle[]), error: null };
  },

  async getVehiclesByPriceRange(minPrice: number, maxPrice: number) {
    const { data, error } = await supabase
      .from('vehicle_trims')
      .select(VEHICLE_SELECT)
      .gte('price_egp', minPrice)
      .lte('price_egp', maxPrice);

    if (error || !data) {
      return { data: null, error };
    }

    return { data: enrichWithImageConfig(data as Vehicle[]), error: null };
  },

  async getElectricVehicles() {
    const { data, error } = await supabase
      .from('vehicle_trims')
      .select(VEHICLE_SELECT)
      .eq('is_electric', true);

    if (error || !data) {
      return { data: null, error };
    }

    return { data: enrichWithImageConfig(data as Vehicle[]), error: null };
  },

  async getHybridVehicles() {
    const { data, error } = await supabase
      .from('vehicle_trims')
      .select(VEHICLE_SELECT)
      .eq('is_hybrid', true);

    if (error || !data) {
      return { data: null, error };
    }

    return { data: enrichWithImageConfig(data as Vehicle[]), error: null };
  },
};
