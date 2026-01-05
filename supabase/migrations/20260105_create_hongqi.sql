-- Hongqi Brand + Model Migration
-- Generated: 2026-01-05
-- Creates Hongqi brand and H9 model with default trim

BEGIN;

DO $$
DECLARE
  v_brand_id UUID;
  v_model_id UUID;
BEGIN
  -- Create Hongqi brand
  INSERT INTO brands (
    name,
    logo_url,
    created_at,
    updated_at
  )
  VALUES (
    'Hongqi',
    '/images/brands/hongqi.png',
    NOW(),
    NOW()
  )
  ON CONFLICT (name) DO UPDATE
  SET
    logo_url = EXCLUDED.logo_url,
    updated_at = NOW()
  RETURNING id INTO v_brand_id;
  
  RAISE NOTICE 'Hongqi brand created/updated: %', v_brand_id;
  
  -- Create H9 model
  -- Image filename: hongqi-hongqi-h9-2025-catalogue-ksa-en.jpg
  -- Parsed model name: H9
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'H9',
    '/images/vehicles/hero/hongqi-hongqi-h9-2025-catalogue-ksa-en.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;
  
  RAISE NOTICE 'Hongqi H9 model created/updated: %', v_model_id;
  
  -- Create default trim
  INSERT INTO vehicle_trims (
    model_id,
    trim_name,
    model_year,
    price_egp,
    created_at,
    updated_at
  )
  VALUES (
    v_model_id,
    'Base',
    2025,
    0,  -- Price TBD
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Hongqi H9 Base trim created';
  
END $$;

COMMIT;

-- Verification query:
-- SELECT b.name, m.name, vt.trim_name, vt.model_year
-- FROM brands b
-- JOIN models m ON b.id = m.brand_id
-- JOIN vehicle_trims vt ON m.id = vt.model_id
-- WHERE b.name = 'Hongqi';
