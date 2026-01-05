-- Mercedes-Benz Models Migration
-- Generated: 2026-01-05 00:19:24 UTC
-- Total models: 24
-- Source: scripts/parse_mercedes_images.py

-- IMPORTANT: Mercedes-Benz brand already exists in database
-- Brand ID: 82ac7a95-b107-4b14-a431-608e0d01f5ba

BEGIN;

DO $$
DECLARE
  v_brand_id UUID := '82ac7a95-b107-4b14-a431-608e0d01f5ba';
  v_model_id UUID;
  v_inserted_models INT := 0;
  v_inserted_trims INT := 0;
BEGIN

  -- Model 1/24: AMG C43
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'AMG C43',
    '/images/vehicles/hero/mercedes-benz-amg-c43.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for AMG C43
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 2/24: AMG Glc43 Coupe
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'AMG Glc43 Coupe',
    '/images/vehicles/hero/mercedes-benz-amg-glc43-coupe.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for AMG Glc43 Coupe
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 3/24: AMG Gt63
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'AMG Gt63',
    '/images/vehicles/hero/mercedes-benz-amg-gt63.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for AMG Gt63
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 4/24: AMG SL Roadster
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'AMG SL Roadster',
    '/images/vehicles/hero/mercedes-benz-amg-sl-roadster.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for AMG SL Roadster
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 5/24: B Class
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'B Class',
    '/images/vehicles/hero/mercedes-benz-b-class.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for B Class
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 6/24: C Class
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'C Class',
    '/images/vehicles/hero/mercedes-benz-c-class.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for C Class
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 7/24: CLS
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'CLS',
    '/images/vehicles/hero/mercedes-benz-cls.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for CLS
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 8/24: E Class Coupe Cabriolet
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'E Class Coupe Cabriolet',
    '/images/vehicles/hero/mercedes-benz-e-class-coupe-cabriolet.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for E Class Coupe Cabriolet
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 9/24: E Class
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'E Class',
    '/images/vehicles/hero/mercedes-benz-e-class.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for E Class
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 10/24: EQA
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'EQA',
    '/images/vehicles/hero/mercedes-benz-eqa.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for EQA
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 11/24: EQB
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'EQB',
    '/images/vehicles/hero/mercedes-benz-eqb.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for EQB
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 12/24: EQE Sedan
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'EQE Sedan',
    '/images/vehicles/hero/mercedes-benz-eqe-sedan.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for EQE Sedan
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 13/24: EQE SUV
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'EQE SUV',
    '/images/vehicles/hero/mercedes-benz-eqe-suv.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for EQE SUV
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 14/24: EQS Saloon
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'EQS Saloon',
    '/images/vehicles/hero/mercedes-benz-eqs-saloon.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for EQS Saloon
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 15/24: EQS SUV
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'EQS SUV',
    '/images/vehicles/hero/mercedes-benz-eqs-suv.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for EQS SUV
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 16/24: G Class
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'G Class',
    '/images/vehicles/hero/mercedes-benz-g-class.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for G Class
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 17/24: GLC Coupe
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'GLC Coupe',
    '/images/vehicles/hero/mercedes-benz-glc-coupe.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for GLC Coupe
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 18/24: GLC SUV
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'GLC SUV',
    '/images/vehicles/hero/mercedes-benz-glc-suv.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for GLC SUV
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 19/24: GLE
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'GLE',
    '/images/vehicles/hero/mercedes-benz-gle.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for GLE
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 20/24: GLS
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'GLS',
    '/images/vehicles/hero/mercedes-benz-gls.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for GLS
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 21/24: Maybach EQS SUV
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'Maybach EQS SUV',
    '/images/vehicles/hero/mercedes-benz-maybach-eqs-suv.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for Maybach EQS SUV
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 22/24: Maybach S Class
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'Maybach S Class',
    '/images/vehicles/hero/mercedes-benz-maybach-s-class.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for Maybach S Class
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 23/24: S Class
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'S Class',
    '/images/vehicles/hero/mercedes-benz-s-class.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for S Class
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Model 24/24: V Class
  INSERT INTO models (
    brand_id,
    name,
    hero_image_url,
    created_at,
    updated_at
  )
  VALUES (
    v_brand_id,
    'V Class',
    '/images/vehicles/hero/mercedes-benz-v-class.jpg',
    NOW(),
    NOW()
  )
  ON CONFLICT (brand_id, name) DO UPDATE
  SET
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING id INTO v_model_id;

  IF FOUND THEN
    v_inserted_models := v_inserted_models + 1;
  END IF;

  -- Create default trim for V Class
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
    0,  -- Price TBD (user will update)
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    v_inserted_trims := v_inserted_trims + 1;
  END IF;

  -- Summary
  RAISE NOTICE 'Mercedes-Benz Migration Complete:';
  RAISE NOTICE '  Models inserted/updated: %', v_inserted_models;
  RAISE NOTICE '  Trims inserted: %', v_inserted_trims;

END $$;

COMMIT;

-- Verification query:
-- SELECT COUNT(*) FROM models WHERE brand_id = '82ac7a95-b107-4b14-a431-608e0d01f5ba';