#!/usr/bin/env python3
"""
Top 10 Egyptian Market Leaders - Coverage Analysis
Based on registration data (Feb 2025)
"""

import subprocess
import json
from typing import Dict, List

SUPABASE_URL = "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1"

def get_api_key() -> str:
    """Read API key from .env.local"""
    with open('.env.local', 'r') as f:
        for line in f:
            if line.startswith('NEXT_PUBLIC_SUPABASE_ANON_KEY='):
                return line.split('=', 1)[1].strip()
    raise ValueError("API key not found in .env.local")

def get_brand_coverage(brand_name: str, api_key: str) -> Dict:
    """Query database for brand coverage statistics"""
    # Get brand_id
    cmd_brand = [
        'curl', '-s',
        f'{SUPABASE_URL}/brands?select=id,name&name=eq.{brand_name}',
        '-H', f'apikey: {api_key}'
    ]
    result_brand = subprocess.run(cmd_brand, capture_output=True, text=True)
    brands = json.loads(result_brand.stdout)

    if not brands:
        return {
            'brand': brand_name,
            'in_database': False,
            'total_models': 0,
            'with_images': 0,
            'missing_images': 0,
            'coverage_pct': 0
        }

    brand_id = brands[0]['id']

    # Get models count
    cmd_models = [
        'curl', '-s',
        f'{SUPABASE_URL}/models?select=id,name,hero_image_url&brand_id=eq.{brand_id}',
        '-H', f'apikey: {api_key}'
    ]
    result_models = subprocess.run(cmd_models, capture_output=True, text=True)
    models = json.loads(result_models.stdout)

    total = len(models)
    with_images = sum(1 for m in models if m.get('hero_image_url'))
    missing = total - with_images
    coverage_pct = (with_images / total * 100) if total > 0 else 0

    return {
        'brand': brand_name,
        'in_database': True,
        'total_models': total,
        'with_images': with_images,
        'missing_images': missing,
        'coverage_pct': coverage_pct
    }

def main():
    api_key = get_api_key()

    # Top 10 brands by Feb 2025 registrations (Egyptian market)
    top10_brands = [
        ('Hyundai', 1729),
        ('Nissan', 1537),
        ('Chery', 1517),
        ('MG', 1353),
        ('Mercedes-Benz', 966),
        ('Kia', 862),
        ('Jetour', 617),
        ('Volkswagen', 509),
        ('Chevrolet', 484),
        ('Toyota', 417)
    ]

    print("=" * 90)
    print("TOP 10 EGYPTIAN MARKET LEADERS - COVERAGE ANALYSIS")
    print("Source: Egyptian Insurance Pool Registration Data (Feb 2025)")
    print("=" * 90)
    print()

    results = []
    total_models = 0
    total_with_images = 0
    total_missing = 0

    for brand_name, registrations in top10_brands:
        coverage = get_brand_coverage(brand_name, api_key)
        coverage['registrations'] = registrations
        results.append(coverage)

        if coverage['in_database']:
            total_models += coverage['total_models']
            total_with_images += coverage['with_images']
            total_missing += coverage['missing_images']

            status = '✅' if coverage['coverage_pct'] == 100 else '⚠️' if coverage['coverage_pct'] >= 50 else '❌'
            print(f"{status} {brand_name:20s} ({registrations:4d} reg): "
                  f"{coverage['with_images']:2d}/{coverage['total_models']:2d} models "
                  f"({coverage['missing_images']:2d} missing) - "
                  f"{coverage['coverage_pct']:.0f}% coverage")
        else:
            print(f"❌ {brand_name:20s} ({registrations:4d} reg): NOT IN DATABASE")

    print()
    print("=" * 90)
    print("SUMMARY - TOP 10 BRANDS")
    print("=" * 90)
    print(f"Total models: {total_models}")
    print(f"  ✅ With images: {total_with_images} ({total_with_images/total_models*100:.1f}%)")
    print(f"  ❌ Missing images: {total_missing} ({total_missing/total_models*100:.1f}%)")
    print()

    # Priority analysis
    print("=" * 90)
    print("PRIORITY ANALYSIS")
    print("=" * 90)
    print()

    # Sort by missing images (absolute count)
    by_missing = sorted([r for r in results if r['in_database']],
                        key=lambda x: x['missing_images'], reverse=True)

    print("📊 PRIORITY 1A: Most Missing Models (Absolute Count)")
    for i, brand in enumerate(by_missing[:3], 1):
        print(f"  {i}. {brand['brand']:20s}: {brand['missing_images']:2d} missing "
              f"(Market rank #{[b[0] for b in top10_brands].index(brand['brand'])+1}, "
              f"{brand['registrations']} reg)")

    print()

    # Sort by coverage % (worst coverage)
    by_coverage = sorted([r for r in results if r['in_database'] and r['total_models'] > 0],
                         key=lambda x: x['coverage_pct'])

    print("📊 PRIORITY 1B: Worst Coverage % (Among Top 10)")
    for i, brand in enumerate(by_coverage[:3], 1):
        print(f"  {i}. {brand['brand']:20s}: {brand['coverage_pct']:.0f}% coverage "
              f"({brand['missing_images']} missing, Market rank #{[b[0] for b in top10_brands].index(brand['brand'])+1})")

    print()

    # Not in database
    not_in_db = [r for r in results if not r['in_database']]
    if not_in_db:
        print("⚠️ CRITICAL: Top 10 Brands NOT in Database")
        for brand in not_in_db:
            print(f"  ❌ {brand['brand']:20s} ({brand['registrations']} registrations - "
                  f"Market rank #{[b[0] for b in top10_brands].index(brand['brand'])+1})")

    print()
    print("=" * 90)

if __name__ == '__main__':
    main()
