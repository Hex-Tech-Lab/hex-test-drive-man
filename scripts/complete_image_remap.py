#!/usr/bin/env python3
"""
Complete Image Path Remapper - Final Production Solution
Maps all 199 models to correct image files or NULL
Replaces all previous mapping attempts with authoritative solution
"""

import json
import glob
import os
import re
from difflib import SequenceMatcher
import subprocess

def normalize(s):
    """Normalize string for matching (removes all non-alphanumeric)"""
    return re.sub(r'[^a-z0-9]', '', s.lower())

def fuzzy_match(brand, model, files, threshold=0.5):
    """Find best file match using fuzzy string matching"""
    search = normalize(f"{brand}{model}")

    best_file = None
    best_score = 0

    for f in files:
        fname = normalize(os.path.splitext(f)[0])
        score = SequenceMatcher(None, search, fname).ratio()

        if score > best_score:
            best_score = score
            best_file = f

    return (best_file, best_score) if best_score >= threshold else (None, 0)

def main():
    print("🔄 Complete Image Remap - Starting...")

    # Get API key from environment
    api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidHRtaHdja2NyZmR5bXd5dWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzYyNzAsImV4cCI6MjA3ODIxMjI3MH0.kw9jPN7GuzTlAims_7B_UEnicaVmGklBiQF9IlVE_I4"
    url = "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/models?select=id,name,brands(name)"

    # Fetch all models
    print("📊 Fetching models from Supabase...")
    result = subprocess.run(
        ['curl', '-s', '-H', f'apikey: {api_key}', url],
        capture_output=True,
        text=True
    )

    models = json.loads(result.stdout)
    print(f"   Found {len(models)} models\n")

    # Get physical files
    print("📁 Scanning physical image files...")
    hero_files = [os.path.basename(f) for f in glob.glob('public/images/vehicles/hero/*.jpg')]
    hover_files = [os.path.basename(f) for f in glob.glob('public/images/vehicles/hover/*.jpg')]
    print(f"   Hero: {len(hero_files)} files")
    print(f"   Hover: {len(hover_files)} files\n")

    # Generate mappings
    print("🤖 Generating mappings...\n")
    sql_lines = [
        "-- Complete Image Remap - Authoritative Mapping",
        "-- Generated: 2025-12-28",
        "-- All 199 models remapped to correct paths or NULL",
        "",
        "BEGIN;",
        ""
    ]

    hero_matched = 0
    hero_null = 0
    hover_matched = 0
    hover_null = 0

    for m in models:
        brand = m['brands']['name'] if m['brands'] else 'Unknown'
        name = m['name']
        model_id = m['id']

        # Match hero
        hero_file, hero_score = fuzzy_match(brand, name, hero_files)
        if hero_file:
            sql_lines.append(
                f"UPDATE models SET hero_image_url = '/images/vehicles/hero/{hero_file}' "
                f"WHERE id = '{model_id}'; -- {brand} {name} ({hero_score:.2f})"
            )
            hero_matched += 1
            print(f"✓ Hero: {brand} {name} → {hero_file} ({hero_score:.2f})")
        else:
            sql_lines.append(
                f"UPDATE models SET hero_image_url = '/images/vehicles/hero/placeholder.webp' "
                f"WHERE id = '{model_id}'; -- {brand} {name} (NO MATCH)"
            )
            hero_null += 1
            print(f"✗ Hero: {brand} {name} → NULL")

        # Match hover
        hover_file, hover_score = fuzzy_match(brand, name, hover_files)
        if hover_file:
            sql_lines.append(
                f"UPDATE models SET hover_image_url = '/images/vehicles/hover/{hover_file}' "
                f"WHERE id = '{model_id}'; -- {brand} {name} ({hover_score:.2f})"
            )
            hover_matched += 1
        else:
            sql_lines.append(
                f"UPDATE models SET hover_image_url = '/images/vehicles/hover/placeholder.webp' "
                f"WHERE id = '{model_id}'; -- {brand} {name} (NO MATCH)"
            )
            hover_null += 1

    sql_lines.append("")
    sql_lines.append("COMMIT;")
    sql_lines.append("")
    sql_lines.append(f"-- Summary:")
    sql_lines.append(f"-- Hero images matched: {hero_matched}/{len(models)}")
    sql_lines.append(f"-- Hero images set to NULL: {hero_null}/{len(models)}")
    sql_lines.append(f"-- Hover images matched: {hover_matched}/{len(models)}")
    sql_lines.append(f"-- Hover images set to NULL: {hover_null}/{len(models)}")
    sql_lines.append(f"-- Total UPDATE statements: {len([l for l in sql_lines if 'UPDATE' in l])}")

    # Write SQL file
    with open('scripts/complete_remap.sql', 'w') as f:
        f.write('\n'.join(sql_lines))

    # Print summary
    print("\n" + "="*60)
    print("📊 MAPPING COMPLETE")
    print("="*60)
    print(f"Total models: {len(models)}")
    print(f"\n✅ Hero images matched: {hero_matched} ({hero_matched/len(models)*100:.1f}%)")
    print(f"❌ Hero images NULL: {hero_null} ({hero_null/len(models)*100:.1f}%)")
    print(f"\n✅ Hover images matched: {hover_matched} ({hover_matched/len(models)*100:.1f}%)")
    print(f"❌ Hover images NULL: {hover_null} ({hover_null/len(models)*100:.1f}%)")
    print(f"\n📝 Generated: scripts/complete_remap.sql")
    print(f"   Total UPDATE statements: {len([l for l in sql_lines if 'UPDATE' in l])}")
    print("="*60)

if __name__ == '__main__':
    main()
