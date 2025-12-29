#!/usr/bin/env python3
"""
Phase 4: Generate SQL to Map 174 Extracted Images to Database Models
Maps YOLO-extracted vehicle images to database, sets NULL for missing
"""

from pathlib import Path
import subprocess
import json
import re

# Supabase connection
SUPABASE_URL = "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidHRtaHdja2NyZmR5bXd5dWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzYyNzAsImV4cCI6MjA3ODIxMjI3MH0.kw9jPN7GuzTlAims_7B_UEnicaVmGklBiQF9IlVE_I4"

def query_database(endpoint, select="*", limit=1000):
    """Query Supabase via REST API"""
    cmd = [
        'curl', '-s',
        f'{SUPABASE_URL}/{endpoint}?select={select}&limit={limit}',
        '-H', f'apikey: {API_KEY}',
        '-H', 'Accept: application/json'
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return json.loads(result.stdout)

def normalize_for_matching(text):
    """Normalize text for fuzzy matching"""
    text = text.lower()
    text = text.replace('_', ' ').replace('-', ' ')
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_year_from_filename(filename):
    """Extract year from filename (e.g., corolla-2025 → 2025)"""
    match = re.search(r'(\d{4})', filename)
    return match.group(1) if match else None

def main():
    print("="*70)
    print("PHASE 4: Generate SQL for Image Mapping")
    print("="*70)
    print()

    # Get all extracted images
    hero_dir = Path("public/images/vehicles/hero")
    hero_images = sorted([f.name for f in hero_dir.glob("*.jpg")])

    print(f"📁 Found {len(hero_images)} hero images")
    print()

    # Get models and brands from database
    print("📊 Fetching models and brands from database...")
    models = query_database("models", "id,name,brand_id")
    brands = query_database("brands", "id,name")

    # Create brand lookup
    brand_lookup = {b['id']: b['name'] for b in brands}

    # Add brand name to each model (no year in models table)
    for model in models:
        model['brand_name'] = brand_lookup.get(model['brand_id'], "Unknown")

    print(f"   ✅ Fetched {len(models)} models")
    print(f"   ✅ Fetched {len(brands)} brands")
    print()

    # Match images to models
    print("🔗 Matching images to models...")
    matched = []
    unmatched_images = []
    unmatched_models = []

    stats = {
        'exact_match': 0,
        'fuzzy_match': 0,
        'no_match': 0,
        'null_required': 0
    }

    for image in hero_images:
        # Parse image filename
        # Format: brand-model-year.jpg or brand-model.jpg
        parts = Path(image).stem.split('-')

        # Extract year if present
        img_year = extract_year_from_filename(image)

        # Try to match
        best_match = None
        match_type = None

        for model in models:
            brand_name = model['brand_name'].lower() if model.get('brand_name') else ""
            model_name = model['name'].lower()

            # Construct expected filename (models don't have year, so match without it)
            expected = f"{brand_name}-{model_name}"
            expected = normalize_for_matching(expected)

            # Normalize image filename (strip year if present)
            img_normalized = normalize_for_matching(Path(image).stem)
            # Remove year from image filename for comparison
            img_no_year = re.sub(r'-?\d{4}', '', img_normalized)
            img_no_year = normalize_for_matching(img_no_year)

            # Exact match (without year)
            if expected == img_no_year:
                best_match = model
                match_type = 'exact'
                break

            # Fuzzy match
            if expected in img_no_year or img_no_year in expected:
                if not best_match:  # Take first fuzzy match
                    best_match = model
                    match_type = 'fuzzy'

        if best_match:
            matched.append({
                'image': image,
                'model_id': best_match['id'],
                'model_name': best_match['name'],
                'brand_name': best_match.get('brand_name', 'Unknown'),
                'match_type': match_type
            })
            if match_type == 'exact':
                stats['exact_match'] += 1
            else:
                stats['fuzzy_match'] += 1
        else:
            unmatched_images.append(image)
            stats['no_match'] += 1

    # Find models without images
    matched_model_ids = {m['model_id'] for m in matched}
    for model in models:
        if model['id'] not in matched_model_ids:
            unmatched_models.append(model)
            stats['null_required'] += 1

    print(f"   ✅ Exact matches: {stats['exact_match']}")
    print(f"   ✅ Fuzzy matches: {stats['fuzzy_match']}")
    print(f"   ❌ Unmatched images: {stats['no_match']}")
    print(f"   ⚪ Models needing NULL: {stats['null_required']}")
    print()

    # Generate SQL
    sql_file = Path("scripts/2025-12-29-0545-CC-phase4-image-mapping.sql")

    with open(sql_file, 'w') as f:
        f.write("-- Phase 4: Image Mapping SQL\\n")
        f.write("-- Generated: 2025-12-29\\n")
        f.write("-- Agent: CC (Claude Code)\\n")
        f.write("--\\n")
        f.write(f"-- Statistics:\\n")
        f.write(f"--   Exact matches: {stats['exact_match']}\\n")
        f.write(f"--   Fuzzy matches: {stats['fuzzy_match']}\\n")
        f.write(f"--   Total mapped: {len(matched)}\\n")
        f.write(f"--   NULL required: {stats['null_required']}\\n")
        f.write("\\n")
        f.write("-- CRITICAL: No hardcoded placeholder paths\\n")
        f.write("-- Architecture: NULL for missing images (UI fallback logic handles placeholders)\\n")
        f.write("\\n")

        # Write mapped images
        f.write("-- ============================================\\n")
        f.write("-- MAPPED IMAGES (174)\\n")
        f.write("-- ============================================\\n\\n")

        for m in sorted(matched, key=lambda x: (x['brand_name'], x['model_name'])):
            hero_url = f"/images/vehicles/hero/{m['image']}"
            hover_url = f"/images/vehicles/hover/{m['image']}"

            f.write(f"-- {m['brand_name']} {m['model_name']} ({m['match_type']})\\n")
            f.write(f"UPDATE models SET\\n")
            f.write(f"  hero_image_url = '{hero_url}',\\n")
            f.write(f"  hover_image_url = '{hover_url}'\\n")
            f.write(f"WHERE id = '{m['model_id']}';\\n\\n")

        # Write NULL for missing
        f.write("\\n-- ============================================\\n")
        f.write(f"-- MISSING IMAGES - SET NULL ({len(unmatched_models)})\\n")
        f.write("-- UI will handle fallback via getVehicleImage()\\n")
        f.write("-- ============================================\\n\\n")

        for model in sorted(unmatched_models, key=lambda x: (x.get('brand_name', ''), x['name'])):
            brand_name = model.get('brand_name', 'Unknown')
            f.write(f"-- {brand_name} {model['name']} (MISSING - UI fallback)\\n")
            f.write(f"UPDATE models SET\\n")
            f.write(f"  hero_image_url = NULL,\\n")
            f.write(f"  hover_image_url = NULL\\n")
            f.write(f"WHERE id = '{model['id']}';\\n\\n")

    print(f"📝 Generated SQL: {sql_file}")
    print(f"   Total UPDATE statements: {len(matched) + len(unmatched_models)}")
    print()

    # Summary
    print("="*70)
    print("📊 PHASE 4 SUMMARY")
    print("="*70)
    print(f"Images matched: {len(matched)}/{len(hero_images)}")
    print(f"Models with images: {len(matched)}/{len(models)}")
    print(f"Models without images: {len(unmatched_models)}/{len(models)}")
    print()

    coverage = len(matched) / len(models) * 100 if models else 0
    print(f"📈 Coverage: {coverage:.1f}% ({len(matched)}/{len(models)})")
    print()

    if unmatched_images:
        print(f"⚠️  UNMATCHED IMAGES ({len(unmatched_images)}):")
        for img in unmatched_images[:10]:
            print(f"   - {img}")
        if len(unmatched_images) > 10:
            print(f"   ... and {len(unmatched_images) - 10} more")
        print()

    print("="*70)
    print("✅ SQL GENERATION COMPLETE")
    print("="*70)
    print()
    print("Next steps:")
    print("1. Review generated SQL")
    print("2. Execute in Supabase Dashboard")
    print("3. Verify no hardcoded placeholders")
    print("4. Proceed to Step 3 (identify missing models)")

if __name__ == '__main__':
    main()
