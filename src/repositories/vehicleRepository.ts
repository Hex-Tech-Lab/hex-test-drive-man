import { supabase } from '@/lib/supabase';
import { Vehicle } from '@/types/vehicle';

const VEHICLE_SELECT = `
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
      id,
      name,
      logo_url
    )
  ),
  categories(name),
  transmissions(name),
  fuel_types(name),
  body_styles(name_en, name_ar, icon_url),
  segments(code, name_en, name_local),
  countries(name_en, name_ar, flag_url),
  agents(name_en, name_ar, logo_url),
  venue_trims(
    venues(id, name)
  ),
  vehicle_images(
    image_url,
    display_order,
    is_primary,
    image_type
  )
`;

export const vehicleRepository = {
  async getAllVehicles() {
    const { data, error } = await supabase
      .from('vehicle_trims')
      .select(VEHICLE_SELECT)
      .order('model_year', { ascending: false });

    return { data: data as Vehicle[] | null, error };
  },

  async getVehicleById(id: string) {
    const { data, error } = await supabase
      .from('vehicle_trims')
      .select(VEHICLE_SELECT)
      .eq('id', id)
      .single();
    
    return { data: data as Vehicle | null, error };
  },

  async getVehiclesByBrand(brandName: string) {
    const { data, error } = await supabase
      .from('vehicle_trims')
      .select(VEHICLE_SELECT)
      .eq('models.brands.name', brandName);
    
    return { data: data as Vehicle[] | null, error };
  },

  async getVehiclesByCategory(categoryName: string) {
    const { data, error } = await supabase
      .from('vehicle_trims')
      .select(VEHICLE_SELECT)
      .eq('categories.name', categoryName);
    
    return { data: data as Vehicle[] | null, error };
  },

  async getVehiclesByPriceRange(minPrice: number, maxPrice: number) {
    const { data, error } = await supabase
      .from('vehicle_trims')
      .select(VEHICLE_SELECT)
      .gte('price_egp', minPrice)
      .lte('price_egp', maxPrice);
    
    return { data: data as Vehicle[] | null, error };
  },

  async getElectricVehicles() {
    const { data, error } = await supabase
      .from('vehicle_trims')
      .select(VEHICLE_SELECT)
      .eq('is_electric', true);
    
    return { data: data as Vehicle[] | null, error };
  },

  async getHybridVehicles() {
    const { data, error } = await supabase
      .from('vehicle_trims')
      .select(VEHICLE_SELECT)
      .eq('is_hybrid', true);
    
    return { data: data as Vehicle[] | null, error };
  },

  async getFilterOptions() {
    const [brandData, bodyStyleData, segmentData, agentData] = await Promise.all([
      supabase.from('brands').select('name, logo_url').order('name'),
      supabase.from('body_styles').select('name_en, name_ar, icon_url').order('display_order'),
      supabase.from('segments').select('code, name_en, name_local').order('price_min_egp'),
      supabase.from('agents').select('name_en, name_ar, logo_url').order('name_en'),
    ]);

    const error = brandData.error || bodyStyleData.error || segmentData.error || agentData.error;

    return {
      brands: brandData.data ?? [],
      bodyStyles: bodyStyleData.data ?? [],
      segments: segmentData.data ?? [],
      agents: agentData.data ?? [],
      error,
    };
  },
};
