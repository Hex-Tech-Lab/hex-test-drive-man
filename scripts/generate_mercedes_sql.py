#!/usr/bin/env python3
"""
Generate SQL migration for Mercedes-Benz models.
Creates models and default trims from parsed image data.
"""

import json
import sys
from datetime import datetime

INPUT_FILE = "/vercel/sandbox/scripts/mercedes_models.json"
OUTPUT_FILE = "/vercel/sandbox/supabase/migrations/20260105_mercedes_benz_models.sql"

def generate_sql():
    """Generate SQL migration for Mercedes-Benz models."""
    with open(INPUT_FILE, 'r') as f:
        models = json.load(f)
    
    sql = []
    sql.append("-- Mercedes-Benz Models Migration")
    sql.append(f"-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}")
    sql.append(f"-- Total models: {len(models)}")
    sql.append("-- Source: scripts/parse_mercedes_images.py")
    sql.append("")
    sql.append("-- IMPORTANT: Mercedes-Benz brand already exists in database")
    sql.append("-- Brand ID: 82ac7a95-b107-4b14-a431-608e0d01f5ba")
    sql.append("")
    sql.append("BEGIN;")
    sql.append("")
    
    sql.append("DO $$")
    sql.append("DECLARE")
    sql.append("  v_brand_id UUID := '82ac7a95-b107-4b14-a431-608e0d01f5ba';")
    sql.append("  v_model_id UUID;")
    sql.append("  v_inserted_models INT := 0;")
    sql.append("  v_inserted_trims INT := 0;")
    sql.append("BEGIN")
    sql.append("")
    
    for idx, model in enumerate(models, 1):
        model_name = model['name']
        year = model['year']
        hero_image = model['hero_image']
        
        sql.append(f"  -- Model {idx}/{len(models)}: {model_name}")
        sql.append(f"  INSERT INTO models (")
        sql.append(f"    brand_id,")
        sql.append(f"    name,")
        sql.append(f"    hero_image_url,")
        sql.append(f"    created_at,")
        sql.append(f"    updated_at")
        sql.append(f"  )")
        sql.append(f"  VALUES (")
        sql.append(f"    v_brand_id,")
        sql.append(f"    '{model_name}',")
        sql.append(f"    '/images/vehicles/hero/{hero_image}',")
        sql.append(f"    NOW(),")
        sql.append(f"    NOW()")
        sql.append(f"  )")
        sql.append(f"  ON CONFLICT (brand_id, name) DO UPDATE")
        sql.append(f"  SET")
        sql.append(f"    hero_image_url = EXCLUDED.hero_image_url,")
        sql.append(f"    updated_at = NOW()")
        sql.append(f"  RETURNING id INTO v_model_id;")
        sql.append("")
        sql.append(f"  IF FOUND THEN")
        sql.append(f"    v_inserted_models := v_inserted_models + 1;")
        sql.append(f"  END IF;")
        sql.append("")
        
        # Create default trim
        sql.append(f"  -- Create default trim for {model_name}")
        sql.append(f"  INSERT INTO vehicle_trims (")
        sql.append(f"    model_id,")
        sql.append(f"    trim_name,")
        sql.append(f"    model_year,")
        sql.append(f"    price_egp,")
        sql.append(f"    created_at,")
        sql.append(f"    updated_at")
        sql.append(f"  )")
        sql.append(f"  VALUES (")
        sql.append(f"    v_model_id,")
        sql.append(f"    'Base',")
        sql.append(f"    {year},")
        sql.append(f"    0,  -- Price TBD (user will update)")
        sql.append(f"    NOW(),")
        sql.append(f"    NOW()")
        sql.append(f"  )")
        sql.append(f"  ON CONFLICT DO NOTHING;")
        sql.append("")
        sql.append(f"  IF FOUND THEN")
        sql.append(f"    v_inserted_trims := v_inserted_trims + 1;")
        sql.append(f"  END IF;")
        sql.append("")
    
    sql.append("  -- Summary")
    sql.append("  RAISE NOTICE 'Mercedes-Benz Migration Complete:';")
    sql.append("  RAISE NOTICE '  Models inserted/updated: %', v_inserted_models;")
    sql.append("  RAISE NOTICE '  Trims inserted: %', v_inserted_trims;")
    sql.append("")
    sql.append("END $$;")
    sql.append("")
    sql.append("COMMIT;")
    sql.append("")
    sql.append("-- Verification query:")
    sql.append("-- SELECT COUNT(*) FROM models WHERE brand_id = '82ac7a95-b107-4b14-a431-608e0d01f5ba';")
    
    return '\n'.join(sql)

if __name__ == "__main__":
    try:
        sql = generate_sql()
        
        with open(OUTPUT_FILE, 'w') as f:
            f.write(sql)
        
        print(f"✅ Generated: {OUTPUT_FILE}")
        print(f"   Total INSERT statements: {sql.count('INSERT INTO models')}")
        print(f"   Total lines: {len(sql.splitlines())}")
        
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)
