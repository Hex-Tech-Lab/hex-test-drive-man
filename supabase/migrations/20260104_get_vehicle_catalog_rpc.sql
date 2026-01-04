-- Create RPC function to get vehicle catalog with year-specific images
-- Purpose: Join vehicle_trims with model_year_images on (model_id, model_year)
-- Date: 2026-01-04
-- Author: CC (Claude Code)

CREATE OR REPLACE FUNCTION get_vehicle_catalog()
RETURNS TABLE (
  id uuid,
  trim_name text,
  model_year integer,
  price_egp numeric,
  model_id uuid,
  category_id uuid,
  transmission_id uuid,
  fuel_type_id uuid,
  body_style_id uuid,
  segment_id uuid,
  country_of_origin_id uuid,
  agent_id uuid,
  engine text,
  seats integer,
  horsepower integer,
  torque_nm integer,
  acceleration_0_100 numeric,
  top_speed integer,
  fuel_consumption numeric,
  features jsonb,
  placeholder_image_url text,
  trim_count integer,
  is_imported boolean,
  is_electric boolean,
  is_hybrid boolean,
  hero_image_url text,
  hover_image_url text,
  image_source_filename text,
  image_flagged boolean,
  model_name text,
  brand_id uuid,
  brand_name text,
  brand_logo_url text,
  category_name text,
  transmission_name text,
  fuel_type_name text,
  body_style_name_en text,
  body_style_name_ar text,
  body_style_icon_url text,
  segment_code text,
  segment_name_en text,
  segment_name_local text,
  country_name_en text,
  country_name_ar text,
  country_flag_url text,
  agent_name_en text,
  agent_name_ar text,
  agent_logo_url text
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    vt.id,
    vt.trim_name,
    vt.model_year,
    vt.price_egp,
    vt.model_id,
    vt.category_id,
    vt.transmission_id,
    vt.fuel_type_id,
    vt.body_style_id,
    vt.segment_id,
    vt.country_of_origin_id,
    vt.agent_id,
    vt.engine,
    vt.seats,
    vt.horsepower,
    vt.torque_nm,
    vt.acceleration_0_100,
    vt.top_speed,
    vt.fuel_consumption,
    vt.features,
    vt.placeholder_image_url,
    vt.trim_count,
    vt.is_imported,
    vt.is_electric,
    vt.is_hybrid,
    -- Year-specific images from model_year_images table
    COALESCE(myi.hero_image_url, '/images/vehicles/hero/placeholder.webp') as hero_image_url,
    myi.hover_image_url,
    myi.source_filename as image_source_filename,
    COALESCE(myi.flagged_for_update, false) as image_flagged,
    -- Model and brand info
    m.name as model_name,
    b.id as brand_id,
    b.name as brand_name,
    b.logo_url as brand_logo_url,
    -- Lookup tables
    c.name as category_name,
    t.name as transmission_name,
    ft.name as fuel_type_name,
    bs.name_en as body_style_name_en,
    bs.name_ar as body_style_name_ar,
    bs.icon_url as body_style_icon_url,
    s.code as segment_code,
    s.name_en as segment_name_en,
    s.name_local as segment_name_local,
    co.name_en as country_name_en,
    co.name_ar as country_name_ar,
    co.flag_url as country_flag_url,
    a.name_en as agent_name_en,
    a.name_ar as agent_name_ar,
    a.logo_url as agent_logo_url
  FROM vehicle_trims vt
  -- Year-specific image JOIN (composite key)
  LEFT JOIN model_year_images myi
    ON myi.model_id = vt.model_id
    AND myi.model_year = vt.model_year
  -- Required model and brand
  INNER JOIN models m ON m.id = vt.model_id
  INNER JOIN brands b ON b.id = m.brand_id
  -- Optional lookups
  LEFT JOIN categories c ON c.id = vt.category_id
  LEFT JOIN transmissions t ON t.id = vt.transmission_id
  LEFT JOIN fuel_types ft ON ft.id = vt.fuel_type_id
  LEFT JOIN body_styles bs ON bs.id = vt.body_style_id
  LEFT JOIN segments s ON s.id = vt.segment_id
  LEFT JOIN countries co ON co.id = vt.country_of_origin_id
  LEFT JOIN agents a ON a.id = vt.agent_id
  ORDER BY vt.model_year DESC, b.name, m.name;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_vehicle_catalog() TO authenticated;
GRANT EXECUTE ON FUNCTION get_vehicle_catalog() TO anon;

-- Add comment
COMMENT ON FUNCTION get_vehicle_catalog() IS 'Returns complete vehicle catalog with year-specific images from model_year_images table';
