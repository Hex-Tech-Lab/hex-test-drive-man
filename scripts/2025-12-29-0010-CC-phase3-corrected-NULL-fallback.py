#!/usr/bin/env python3
"""
Phase 3 CORRECTED: Priority-based image-to-database mapping
Priority: exact-year match > multi-year fallback > NULL (not placeholder)

CRITICAL FIX: Missing images set to NULL (let UI fallback handle)
Original violation: Hardcoded placeholder paths in database
"""

import os
import json
import re
import subprocess
from pathlib import Path

def normalize_brand(brand):
    """BMW, bmw -> bmw"""
    return brand.lower().strip()

def normalize_model(model):
    """Remove year, normalize spaces"""
    # Remove 4-digit years
    model = re.sub(r'\b\d{4}\b', '', model)
    return model.lower().strip()

def extract_year_from_name(name):
    """Extract year from model name like 'Fortuner 2026' -> 2026"""
    match = re.search(r'\b(202[4-9])\b', name)
    return int(match.group(1)) if match else None

def extract_year_from_filename(filename):
    """
    Extract year with priority:
    - Single year: 2025 -> 2025
    - Multi-year: 2024-25 -> (2024, 2025)
    - No year: -> None
    """
    # Multi-year pattern: 2024-25
    multi = re.search(r'(\d{4})-(\d{2})\.jpg$', filename)
    if multi:
        y1 = int(multi.group(1))
        y2 = int(f"20{multi.group(2)}")
        return (y1, y2)

    # Single year: 2025
    single = re.search(r'-(\d{4})\.jpg$', filename)
    if single:
        return int(single.group(1))

    return None

def find_best_image(db_brand, db_model, db_year, available_images):
    """
    Find best matching image with priority:
    1. Exact year match
    2. Multi-year range covering db_year
    3. Generic (no year in filename)
    4. None (will be NULL in database, UI handles fallback)
    """
    brand_norm = normalize_brand(db_brand)
    model_norm = normalize_model(db_model)
    model_words = set(model_norm.split())

    # Remove generic filler words
    model_words.discard('')

    candidates = {
        'exact': [],
        'multi': [],
        'generic': []
    }

    for img_path in available_images:
        filename = os.path.basename(str(img_path))

        # Rule 1: Brand must match (case-insensitive)
        if not filename.lower().startswith(brand_norm + '-'):
            continue

        # Rule 2: All model words must be in filename (word boundary check)
        file_norm = normalize_model(filename)

        # Check each word appears as complete word (not substring)
        words_match = True
        for word in model_words:
            if not word:  # Skip empty strings
                continue
            # Use word boundary regex to avoid "5" matching "2025"
            if not re.search(r'\b' + re.escape(word) + r'\b', file_norm):
                words_match = False
                break

        if not words_match:
            continue

        # Rule 3: Year matching with priority
        file_year = extract_year_from_filename(filename)

        if isinstance(file_year, int):
            # Single year file
            if db_year and file_year == db_year:
                candidates['exact'].append(str(img_path))
            elif not db_year:
                candidates['generic'].append(str(img_path))
        elif isinstance(file_year, tuple):
            # Multi-year file (2024-25)
            y1, y2 = file_year
            if db_year and y1 <= db_year <= y2:
                candidates['multi'].append(str(img_path))
        else:
            # No year in filename
            candidates['generic'].append(str(img_path))

    # Return best match by priority
    if candidates['exact']:
        return candidates['exact'][0]
    if candidates['multi']:
        return candidates['multi'][0]
    if candidates['generic']:
        return candidates['generic'][0]

    return None  # No match = NULL (UI will handle fallback)

def main():
    print("🔄 Phase 3 CORRECTED: Priority-Based Image Mapping")
    print("   Priority: exact-year > multi-year > generic > NULL (not placeholder)")
    print("   ✅ FIX: Missing images set to NULL (let UI handle fallback)\n")

    # Fetch all models from Supabase
    API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidHRtaHdja2NyZmR5bXd5dWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzYyNzAsImV4cCI6MjA3ODIxMjI3MH0.kw9jPN7GuzTlAims_7B_UEnicaVmGklBiQF9IlVE_I4"
    URL = "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/models?select=id,name,brands(name)&limit=199"

    print("📊 Fetching models from Supabase...")
    result = subprocess.run(
        ['curl', '-s', '-H', f'apikey: {API_KEY}', URL],
        capture_output=True,
        text=True
    )

    models = json.loads(result.stdout)
    print(f"   Found {len(models)} models\n")

    # Get available image files
    print("📁 Scanning image files...")
    hero_images = list(Path('public/images/vehicles/hero').glob('*.jpg'))
    hover_images = list(Path('public/images/vehicles/hover').glob('*.jpg'))
    print(f"   Hero: {len(hero_images)} files")
    print(f"   Hover: {len(hover_images)} files\n")

    print("🔍 Applying priority-based matching...\n")

    # Generate SQL mappings
    sql_lines = [
        "-- Phase 3 CORRECTED: Priority-Based Image Mapping with NULL Fallback",
        "-- Generated: 2025-12-29 00:10 EET",
        "-- Priority: exact-year > multi-year > generic > NULL (UI handles fallback)",
        "-- CRITICAL FIX: Missing images = NULL (not hardcoded placeholder path)",
        "",
        "BEGIN;",
        ""
    ]

    stats = {
        'exact': 0,
        'multi': 0,
        'generic': 0,
        'null': 0  # Changed from 'placeholder'
    }

    for model in models:
        model_id = model['id']
        model_name = model['name']
        brand_name = model['brands']['name'] if model['brands'] else 'Unknown'

        # Extract year from name field (database has no year column)
        model_year = extract_year_from_name(model_name)

        # Find best hero image
        hero_match = find_best_image(brand_name, model_name, model_year, hero_images)

        if hero_match:
            hero_url = hero_match.replace('public', '')
            # Determine match type for stats
            hero_year = extract_year_from_filename(os.path.basename(hero_match))
            if isinstance(hero_year, int) and hero_year == model_year:
                match_type = 'exact'
            elif isinstance(hero_year, tuple):
                match_type = 'multi'
            else:
                match_type = 'generic'
            stats[match_type] += 1
            print(f"✓ {brand_name:15s} {model_name:30s} → {os.path.basename(hero_match)} [{match_type}]")
        else:
            # CRITICAL FIX: Set to None (will be NULL in DB, not placeholder path)
            hero_url = None
            stats['null'] += 1
            print(f"✗ {brand_name:15s} {model_name:30s} → NULL (UI fallback)")

        # Find best hover image
        hover_match = find_best_image(brand_name, model_name, model_year, hover_images)
        # CRITICAL FIX: None instead of placeholder path
        hover_url = hover_match.replace('public', '') if hover_match else None

        # Generate SQL with NULL handling
        if hero_url and hover_url:
            sql_lines.append(
                f"UPDATE models SET hero_image_url = '{hero_url}', hover_image_url = '{hover_url}' "
                f"WHERE id = '{model_id}'; -- {brand_name} {model_name}"
            )
        elif hero_url:
            sql_lines.append(
                f"UPDATE models SET hero_image_url = '{hero_url}', hover_image_url = NULL "
                f"WHERE id = '{model_id}'; -- {brand_name} {model_name} (hover missing)"
            )
        elif hover_url:
            sql_lines.append(
                f"UPDATE models SET hero_image_url = NULL, hover_image_url = '{hover_url}' "
                f"WHERE id = '{model_id}'; -- {brand_name} {model_name} (hero missing)"
            )
        else:
            # Both missing - set both to NULL
            sql_lines.append(
                f"UPDATE models SET hero_image_url = NULL, hover_image_url = NULL "
                f"WHERE id = '{model_id}'; -- {brand_name} {model_name} (MISSING - UI fallback)"
            )

    sql_lines.append("")
    sql_lines.append("COMMIT;")
    sql_lines.append("")
    sql_lines.append("-- Statistics:")
    sql_lines.append(f"-- Exact year matches: {stats['exact']}/{len(models)}")
    sql_lines.append(f"-- Multi-year matches: {stats['multi']}/{len(models)}")
    sql_lines.append(f"-- Generic matches: {stats['generic']}/{len(models)}")
    sql_lines.append(f"-- NULL (UI fallback): {stats['null']}/{len(models)}")
    sql_lines.append("")
    sql_lines.append("-- ARCHITECTURE COMPLIANCE:")
    sql_lines.append("-- ✅ Data layer: Stores NULL for missing data")
    sql_lines.append("-- ✅ UI layer: Handles NULL with getVehicleImage() fallback")
    sql_lines.append("-- ✅ Separation of concerns: Restored")

    # Write SQL file with corrected naming convention
    output_file = 'scripts/2025-12-29-0010-CC-phase3-corrected-NULL-fallback.sql'
    with open(output_file, 'w') as f:
        f.write('\n'.join(sql_lines))

    # Print summary
    print("\n" + "="*70)
    print("📊 CORRECTED PRIORITY MATCHING COMPLETE")
    print("="*70)
    print(f"Total models: {len(models)}")
    print(f"\n✅ Exact year matches: {stats['exact']} ({stats['exact']/len(models)*100:.1f}%)")
    print(f"✅ Multi-year matches: {stats['multi']} ({stats['multi']/len(models)*100:.1f}%)")
    print(f"✅ Generic matches: {stats['generic']} ({stats['generic']/len(models)*100:.1f}%)")
    print(f"✅ NULL (UI fallback): {stats['null']} ({stats['null']/len(models)*100:.1f}%)")
    print(f"\n📝 Generated: {output_file}")
    print(f"   Total UPDATE statements: {len(models)}")
    print("="*70)
    print("\n✅ ARCHITECTURE COMPLIANCE RESTORED:")
    print("   - Data layer: NULL for missing images (not placeholder path)")
    print("   - UI layer: getVehicleImage() handles NULL → placeholder")
    print("   - Separation of concerns: Maintained")
    print("\n⚡ PRIORITY SYSTEM:")
    print("   1st: Exact year match (mg-5-2025.jpg for 'MG 5 2025')")
    print("   2nd: Multi-year match (audi-q3-2024-25.jpg for 'Q3 2025')")
    print("   3rd: Generic match (mg-5.jpg for any 'MG 5' variant)")
    print("   4th: NULL (UI shows placeholder via getVehicleImage() helper)")

if __name__ == '__main__':
    main()
