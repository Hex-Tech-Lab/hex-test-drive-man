#!/usr/bin/env python3
"""
Egyptian Market Model Enumeration
Phase 5.1 - Research current models sold in Egypt

Approach:
1. Query database for existing models per brand
2. Create checklist for manual verification against Egyptian sources
3. Output CSV for tracking PDF availability
"""

import subprocess
import json
from typing import List, Dict

SUPABASE_URL = "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1"

def get_api_key() -> str:
    """Read API key from .env.local"""
    with open('.env.local', 'r') as f:
        for line in f:
            if line.startswith('NEXT_PUBLIC_SUPABASE_ANON_KEY='):
                return line.split('=', 1)[1].strip()
    raise ValueError("API key not found in .env.local")

def query_models_by_brand(brand_name: str, api_key: str) -> List[Dict]:
    """Query Supabase for all vehicle trims of a specific brand (includes model + year)"""
    # First get brand_id
    cmd_brand = [
        'curl', '-s',
        f'{SUPABASE_URL}/brands?select=id,name&name=eq.{brand_name}',
        '-H', f'apikey: {api_key}'
    ]
    result_brand = subprocess.run(cmd_brand, capture_output=True, text=True)
    brands = json.loads(result_brand.stdout)

    if not brands:
        return []

    brand_id = brands[0]['id']

    # Query vehicle_trims with nested model info (trims have model_year, models have images)
    cmd = [
        'curl', '-s',
        f'{SUPABASE_URL}/vehicle_trims?select=id,model_year,model:models(id,name,hero_image_url,hover_image_url)&model.brand_id=eq.{brand_id}&order=model(name),model_year',
        '-H', f'apikey: {api_key}',
        '-H', 'Accept: application/json'
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    data = json.loads(result.stdout)

    # Transform to flat structure
    flattened = []
    for trim in data:
        model = trim.get('model')
        if model is None:
            continue  # Skip trims without model info

        flattened.append({
            'trim_id': trim['id'],
            'model_id': model.get('id'),
            'name': model.get('name', 'Unknown'),
            'year': trim.get('model_year'),
            'hero_image_url': model.get('hero_image_url'),
            'hover_image_url': model.get('hover_image_url')
        })

    return flattened

def main():
    api_key = get_api_key()

    # Tier 1 brands (mass market - high test drive demand)
    tier1_brands = [
        'Hyundai',
        'Toyota',
        'Nissan',
        'Kia',
        'Chevrolet',
        'MG',
        'Renault',
        'Peugeot'
    ]

    print("=" * 80)
    print("EGYPTIAN MARKET MODEL ENUMERATION - TIER 1 BRANDS")
    print("=" * 80)
    print()

    # CSV output
    csv_lines = ["Brand,Model,Year,In_Database,Has_Image,PDF_Available,Source,Notes"]

    total_models = 0
    models_with_images = 0
    models_without_images = 0

    for brand in tier1_brands:
        print(f"\n{'='*80}")
        print(f"📋 {brand.upper()}")
        print(f"{'='*80}")

        models = query_models_by_brand(brand, api_key)
        brand_total = len(models)
        brand_with_images = sum(1 for m in models if m.get('hero_image_url'))
        brand_without_images = brand_total - brand_with_images

        total_models += brand_total
        models_with_images += brand_with_images
        models_without_images += brand_without_images

        print(f"Total trims in database: {brand_total}")
        print(f"  ✅ With images: {brand_with_images}")
        print(f"  ❌ Missing images: {brand_without_images}")
        print()
        print("Models (unique):")

        # Group by model name for cleaner output
        seen_models = set()
        for model in models:
            name = model['name']
            year = model.get('year', 'N/A')
            has_image = '✅' if model.get('hero_image_url') else '❌'

            model_key = f"{name} {year}"
            if model_key not in seen_models:
                print(f"  {has_image} {name} {year}")
                seen_models.add(model_key)

            # Add to CSV (all trims, not just unique)
            csv_lines.append(
                f"{brand},{name},{year},Yes,"
                f"{'Yes' if model.get('hero_image_url') else 'No'},"
                f",,Database"
            )

    # Summary
    print()
    print("=" * 80)
    print("SUMMARY - TIER 1 BRANDS")
    print("=" * 80)
    print(f"Total models: {total_models}")
    print(f"  ✅ With images: {models_with_images} ({models_with_images/total_models*100:.1f}%)")
    print(f"  ❌ Missing images: {models_without_images} ({models_without_images/total_models*100:.1f}%)")
    print()
    print(f"CSV output: {len(csv_lines)-1} rows")

    # Write CSV
    output_file = 'docs/egyptian-market-tier1-enumeration.csv'
    with open(output_file, 'w') as f:
        f.write('\n'.join(csv_lines))

    print(f"✅ Written to: {output_file}")
    print()
    print("NEXT STEPS:")
    print("1. Research each brand's official Egypt website")
    print("2. Identify models NOT in database (e.g., Peugeot 408)")
    print("3. Note PDF availability for each model")
    print("4. Update CSV with findings")

if __name__ == '__main__':
    main()
