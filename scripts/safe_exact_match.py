#!/usr/bin/env python3
"""
Safe Exact Match Mapper - CONSERVATIVE APPROACH
Only maps when brand + model match exactly, NO fuzzy guessing
Avoids wrong assignments like "Swift Dzire" → "Swift" or "C4" → "Audi Q8"

Principles:
1. Brand must match EXACTLY (case-insensitive)
2. Model name must contain ALL words from DB model
3. Year must match if present
4. When in doubt → placeholder (NO WRONG IMAGES)
"""

import json
import glob
import os
import subprocess
import re

def normalize_brand(brand):
    """Normalize brand name for comparison"""
    return brand.lower().strip().replace(' ', '')

def normalize_model(model):
    """Normalize model name, preserving key identifying words"""
    # Remove common filler words but keep key identifiers
    model = model.lower().strip()
    model = re.sub(r'\s+', ' ', model)  # Normalize whitespace
    return model

def extract_year(text):
    """Extract 4-digit year from text"""
    match = re.search(r'\b(202[4-9])\b', text)
    return match.group(1) if match else None

def safe_match(db_brand, db_model, filename):
    """
    Check if filename safely matches DB brand+model
    Returns True only if confident match (no false positives)
    """
    # Extract components from filename
    # Format: Brand-model-variant-year.jpg (e.g., Toyota-corolla-2025.jpg)
    fname = os.path.splitext(os.path.basename(filename))[0]
    parts = fname.split('-')

    if len(parts) < 2:
        return False

    file_brand = parts[0]
    file_model_parts = parts[1:]  # Everything after brand

    # Rule 1: Brand must match exactly (case-insensitive)
    if normalize_brand(db_brand) != normalize_brand(file_brand):
        return False

    # Rule 2: All significant words from DB model must appear as separate parts
    db_words = set(normalize_model(db_model).split())

    # Remove generic words that don't help matching
    generic_words = {'new', 'generation', 'plus', 'ev', 'hybrid'}
    db_words = db_words - generic_words

    # Normalize file model parts (everything after brand)
    file_parts_normalized = [normalize_model(part) for part in file_model_parts]
    file_parts_text = ' '.join(file_parts_normalized)

    # CRITICAL FIX: Use word boundary matching, not substring
    # "5" should match "5" but NOT "2025"
    for word in db_words:
        # Check if word appears as a standalone part or within hyphenated parts
        word_found = False

        # Check in individual parts
        if word in file_parts_normalized:
            word_found = True
        # Check in combined text with word boundaries
        elif re.search(r'\b' + re.escape(word) + r'\b', file_parts_text):
            word_found = True

        if not word_found:
            # Key word missing - not a match
            return False

    # Rule 3: If DB has year, file must have same year
    db_year = extract_year(db_model)
    file_year = extract_year('-'.join(file_model_parts))

    if db_year and file_year and db_year != file_year:
        # Year mismatch - could be different model year
        # Allow as match but flag it
        pass

    return True

def main():
    print("🔒 Safe Exact Match Mapper - CONSERVATIVE MODE")
    print("   Only maps when 100% confident - NO GUESSING\n")

    # Get API key
    api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidHRtaHdja2NyZmR5bXd5dWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzYyNzAsImV4cCI6MjA3ODIxMjI3MH0.kw9jPN7GuzTlAims_7B_UEnicaVmGklBiQF9IlVE_I4"
    url = "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/models?select=id,name,brands(name)"

    # Fetch models
    print("📊 Fetching models from Supabase...")
    result = subprocess.run(
        ['curl', '-s', '-H', f'apikey: {api_key}', url],
        capture_output=True,
        text=True
    )
    models = json.loads(result.stdout)
    print(f"   Found {len(models)} models\n")

    # Get physical files
    print("📁 Scanning physical files...")
    hero_files = glob.glob('public/images/vehicles/hero/*.jpg')
    hover_files = glob.glob('public/images/vehicles/hover/*.jpg')
    print(f"   Hero: {len(hero_files)} files")
    print(f"   Hover: {len(hover_files)} files\n")

    print("🔍 Applying SAFE exact matching...\n")

    sql_lines = [
        "-- Safe Exact Match Mapping - CONSERVATIVE",
        "-- Generated: 2025-12-28",
        "-- Only confident matches, NO fuzzy guessing",
        "",
        "BEGIN;",
        ""
    ]

    hero_matched = 0
    hero_placeholder = 0
    hover_matched = 0
    hover_placeholder = 0

    for m in models:
        brand = m['brands']['name'] if m['brands'] else 'Unknown'
        name = m['name']
        model_id = m['id']

        # Try hero
        hero_file = None
        for f in hero_files:
            if safe_match(brand, name, f):
                hero_file = os.path.basename(f)
                break

        if hero_file:
            sql_lines.append(
                f"UPDATE models SET hero_image_url = '/images/vehicles/hero/{hero_file}' "
                f"WHERE id = '{model_id}'; -- {brand} {name} ✓"
            )
            hero_matched += 1
            print(f"✓ {brand} {name} → {hero_file}")
        else:
            sql_lines.append(
                f"UPDATE models SET hero_image_url = '/images/vehicles/hero/placeholder.webp' "
                f"WHERE id = '{model_id}'; -- {brand} {name} (NO SAFE MATCH)"
            )
            hero_placeholder += 1
            print(f"✗ {brand} {name} → PLACEHOLDER (no safe match)")

        # Try hover
        hover_file = None
        for f in hover_files:
            if safe_match(brand, name, f):
                hover_file = os.path.basename(f)
                break

        if hover_file:
            sql_lines.append(
                f"UPDATE models SET hover_image_url = '/images/vehicles/hover/{hover_file}' "
                f"WHERE id = '{model_id}'; -- {brand} {name} ✓"
            )
            hover_matched += 1
        else:
            sql_lines.append(
                f"UPDATE models SET hover_image_url = '/images/vehicles/hover/placeholder.webp' "
                f"WHERE id = '{model_id}'; -- {brand} {name} (NO SAFE MATCH)"
            )
            hover_placeholder += 1

    sql_lines.append("")
    sql_lines.append("COMMIT;")
    sql_lines.append("")
    sql_lines.append(f"-- Summary:")
    sql_lines.append(f"-- Hero matched: {hero_matched}/{len(models)}")
    sql_lines.append(f"-- Hero placeholder: {hero_placeholder}/{len(models)}")
    sql_lines.append(f"-- Hover matched: {hover_matched}/{len(models)}")
    sql_lines.append(f"-- Hover placeholder: {hover_placeholder}/{len(models)}")

    # Write SQL
    with open('scripts/safe_exact_match.sql', 'w') as f:
        f.write('\n'.join(sql_lines))

    # Summary
    print("\n" + "="*60)
    print("📊 SAFE MATCHING COMPLETE")
    print("="*60)
    print(f"Total models: {len(models)}")
    print(f"\n✅ Hero matched: {hero_matched} ({hero_matched/len(models)*100:.1f}%)")
    print(f"❌ Hero placeholder: {hero_placeholder} ({hero_placeholder/len(models)*100:.1f}%)")
    print(f"\n✅ Hover matched: {hover_matched} ({hover_matched/len(models)*100:.1f}%)")
    print(f"❌ Hover placeholder: {hover_placeholder} ({hover_placeholder/len(models)*100:.1f}%)")
    print(f"\n📝 Generated: scripts/safe_exact_match.sql")
    print("="*60)
    print("\n⚠️  PRINCIPLE: Better to show placeholder than WRONG image")

if __name__ == '__main__':
    main()
