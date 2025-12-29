#!/usr/bin/env python3
"""
List exact models missing images for Top 10 brands
Output: Checklist for PDF downloads
"""

import subprocess
import json

SUPABASE_URL = "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1"

def get_api_key():
    with open('.env.local', 'r') as f:
        for line in f:
            if line.startswith('NEXT_PUBLIC_SUPABASE_ANON_KEY='):
                return line.split('=', 1)[1].strip()

def get_missing_models(brand_name, api_key):
    """Get models without hero images for a brand"""
    # Get brand_id
    cmd_brand = [
        'curl', '-s',
        f'{SUPABASE_URL}/brands?select=id&name=eq.{brand_name}',
        '-H', f'apikey: {api_key}'
    ]
    result = subprocess.run(cmd_brand, capture_output=True, text=True)
    brands = json.loads(result.stdout)

    if not brands:
        return []

    brand_id = brands[0]['id']

    # Get models without images
    cmd = [
        'curl', '-s',
        f'{SUPABASE_URL}/models?select=id,name,hero_image_url&brand_id=eq.{brand_id}&hero_image_url=is.null',
        '-H', f'apikey: {api_key}'
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return json.loads(result.stdout)

def main():
    api_key = get_api_key()

    # Top 10 brands with gaps (excluding Mercedes-Benz - 0 models)
    brands_with_gaps = [
        ('Volkswagen', 8, 509),
        ('Nissan', 2, 1537),
        ('Hyundai', 1, 1729),
        ('Chevrolet', 9, 484),
        ('Jetour', 7, 617)
    ]

    print("=" * 80)
    print("TOP 10 BRANDS - MISSING MODELS CHECKLIST")
    print("=" * 80)
    print()

    total_missing = 0

    for brand_name, rank, registrations in brands_with_gaps:
        models = get_missing_models(brand_name, api_key)

        if models:
            total_missing += len(models)
            print(f"{'='*80}")
            print(f"📋 {brand_name.upper()} (Market Rank #{rank}, {registrations} registrations)")
            print(f"{'='*80}")
            print(f"Missing: {len(models)} model(s)")
            print()

            for i, model in enumerate(models, 1):
                print(f"  [ ] {i}. {model['name']}")
            print()

    print("=" * 80)
    print(f"TOTAL MISSING: {total_missing} models")
    print("=" * 80)

if __name__ == '__main__':
    main()
