// Vehicle types for normalized Supabase schema
// Updated: 2025-11-09
// Matches vehicle_trims table structure

export interface Brand { name: string; logo_url: string | null }

export interface Model {
  name: string;
  hero_image_url: string | null;
  hover_image_url: string | null;
  brands: Brand;
}

export interface Category { name: string }
export interface Transmission { name: string }
export interface FuelType { name: string }

export interface BodyStyle {
  name_en: string;
  name_ar: string;
  icon_url?: string | null;
  display_order?: number;
}

export interface Country {
  name_en: string;
  name_ar: string;
  iso_code?: string;
  flag_url: string | null;
  region?: string;
}

export interface Agent {
  name_en: string;
  name_ar: string;
  logo_url: string | null;
  website_url?: string | null;
}

export interface Venue { id: string; name: string; address?: string | null }

export interface VenueTrim {
  vehicle_trim_id: string;
  venue_id: string;
  is_available?: boolean | null;
  venues: Venue;
}

export interface VehicleImage {
  image_url: string;
  display_order: number;
  is_primary: boolean;
  image_type: 'exterior' | 'interior' | 'detail' | string | null;
  alt_text_en?: string | null;
  alt_text_ar?: string | null;
}

export interface Segment {
  id: string;
  code: 'entry_level' | 'budget' | 'mid_range' | 'premium' | 'luxury' | 'supercar';
  name_en: string;
  name_local?: string | null;
  price_min_egp?: number | null;
  price_max_egp?: number | null;
  typical_models?: string | null;
  consumer_rationale?: string | null;
}

export interface Vehicle {
  id: string;
  trim_name: string;
  model_year: number;
  price_egp: number;
  engine: string | null;
  seats: number | null;
  horsepower: number | null;
  torque_nm: number | null;
  top_speed: number | null;
  acceleration_0_100: number | null;
  fuel_consumption: string | null;
  features: string[] | null;
  body_style_id: string | null;
  country_of_origin_id: string | null;
  agent_id: string | null;
  is_imported: boolean;
  is_electric: boolean;
  is_hybrid: boolean;
  trim_count: number;
  placeholder_image_url: string | null;
  model_id: string;
  category_id: string | null;
  transmission_id: string | null;
  fuel_type_id: string | null;
  models: Model;
  categories: Category | null;
  transmissions: Transmission | null;
  fuel_types: FuelType | null;
  body_styles: BodyStyle | null;
  countries: Country | null;
  agents: Agent | null;
  venue_trims: VenueTrim[] | null;
  vehicle_images: VehicleImage[] | null;
  segment_id?: string | null;
  segments?: Segment | null;
}

/**
 * Aggregated vehicle type for catalog display
 * Groups multiple trims of the same model into a single card
 */
export interface AggregatedVehicle extends Omit<Vehicle, 'id' | 'trim_name' | 'price_egp'> {
  /** Representative vehicle ID (first trim) */
  id: string;
  /** Model ID for grouping */
  modelId: string;
  /** All trims for this model */
  trims: Vehicle[];
  /** Minimum price across all trims */
  minPrice: number;
  /** Maximum price across all trims */
  maxPrice: number;
  /** Number of trims available */
  trimCount: number;
  /** Comma-separated trim names for tooltip */
  trimNames: string;
}
