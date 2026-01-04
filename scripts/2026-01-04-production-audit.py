#!/usr/bin/env python3
"""
Production Database Audit - 2026-01-04
Comprehensive audit to identify critical data integrity issues after CC's fix
Issues to investigate:
1. Duplicate model listings (same brand+model+year with different IDs)
2. Wrong image mappings (brand mismatch in hero_image_url)
3. Brand name inconsistencies (HAVAL vs Haval)
4. Image coverage discrepancies by brand
5. Wrong vehicle names (e.g., BAIC X35 shown as X3)
6. Fuel terminology chaos (Petrol vs Gasoline)
7. Year ordering issues
"""

import os
import json
import requests
from collections import defaultdict
from urllib.parse import quote

# Supabase configuration
SUPABASE_URL = "https://lbttmhwckcrfdymwyuhn.supabase.co"
SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SERVICE_KEY:
    print("❌ ERROR: SUPABASE_SERVICE_ROLE_KEY not set in environment")
    print("Run: export SUPABASE_SERVICE_ROLE_KEY='your-key-here'")
    exit(1)

HEADERS = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type': 'application/json'
}

def query_supabase(table, select="*", filters=None, order=None):
    """Generic Supabase REST API query"""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    params = {'select': select}
    if filters:
        params.update(filters)
    if order:
        params['order'] = order
    
    response = requests.get(url, headers=HEADERS, params=params)
    response.raise_for_status()
    return response.json()

def print_section(title):
    """Print formatted section header"""
    print(f"\n{'='*80}")
    print(f"  {title}")
    print(f"{'='*80}\n")

# ============================================================================
# AUDIT 1: Duplicate Model Listings
# ============================================================================
print_section("AUDIT 1: Duplicate Model Listings")

models = query_supabase('models', select='id,name,year,brand_id,hero_image_url')
brands = query_supabase('brands', select='id,name,slug')

# Create brand lookup
brand_lookup = {b['id']: b for b in brands}

# Group by brand_id + name + year
model_groups = defaultdict(list)
for model in models:
    key = (model['brand_id'], model['name'].strip(), model['year'])
    model_groups[key].append(model)

# Find duplicates
duplicates = {k: v for k, v in model_groups.items() if len(v) > 1}

if duplicates:
    print(f"🔴 CRITICAL: Found {len(duplicates)} duplicate model groups\n")
    for (brand_id, name, year), models_list in sorted(duplicates.items()):
        brand = brand_lookup.get(brand_id, {}).get('name', 'Unknown')
        print(f"  • {brand} {name} {year} ({len(models_list)} entries):")
        for m in models_list:
            img_status = "✓ has image" if m['hero_image_url'] else "✗ no image"
            print(f"    - ID {m['id']: <4} {img_status}")
    print(f"\n📋 ACTION REQUIRED: Delete {sum(len(v)-1 for v in duplicates.values())} duplicate models")
else:
    print("✅ No duplicate models found")

# ============================================================================
# AUDIT 2: Wrong Image Mappings (Brand Mismatch)
# ============================================================================
print_section("AUDIT 2: Wrong Image Mappings")

wrong_mappings = []
for model in models:
    if model['hero_image_url']:
        brand = brand_lookup.get(model['brand_id'], {})
        brand_slug = brand.get('slug', '')
        if brand_slug and brand_slug not in model['hero_image_url'].lower():
            wrong_mappings.append({
                'id': model['id'],
                'name': model['name'],
                'year': model['year'],
                'brand': brand.get('name', 'Unknown'),
                'brand_slug': brand_slug,
                'image_url': model['hero_image_url']
            })

if wrong_mappings:
    print(f"🔴 CRITICAL: Found {len(wrong_mappings)} models with wrong image mappings\n")
    for m in wrong_mappings[:10]:  # Show first 10
        print(f"  • ID {m['id']}: {m['brand']} {m['name']} {m['year']}")
        print(f"    Expected slug: '{m['brand_slug']}' | Image: {m['image_url']}")
    if len(wrong_mappings) > 10:
        print(f"  ... and {len(wrong_mappings)-10} more")
    print(f"\n📋 ACTION REQUIRED: Set {len(wrong_mappings)} image URLs to NULL")
else:
    print("✅ All image mappings match brand slugs")

# ============================================================================
# AUDIT 3: Brand Name Inconsistencies
# ============================================================================
print_section("AUDIT 3: Brand Name Inconsistencies")

# Group brands by normalized name (lowercase, no spaces)
brand_name_groups = defaultdict(list)
for brand in brands:
    normalized = brand['name'].lower().replace(' ', '').replace('-', '')
    brand_name_groups[normalized].append(brand)

# Find potential duplicates (case/spacing variations)
brand_issues = {k: v for k, v in brand_name_groups.items() if len(v) > 1}

if brand_issues:
    print(f"🔴 CRITICAL: Found {len(brand_issues)} brand name inconsistencies\n")
    for normalized, brand_list in sorted(brand_issues.items()):
        print(f"  • Normalized '{normalized}':")
        for b in brand_list:
            model_count = sum(1 for m in models if m['brand_id'] == b['id'])
            print(f"    - ID {b['id']:  <3}: '{b['name']}' (slug: '{b['slug']}', {model_count} models)")
    print(f"\n📋 ACTION REQUIRED: Merge/standardize {len(brand_issues)} brand groups")
else:
    print("✅ No brand name inconsistencies found")

# ============================================================================
# AUDIT 4: Image Coverage by Brand
# ============================================================================
print_section("AUDIT 4: Image Coverage by Brand")

# Calculate coverage per brand
brand_stats = {}
for brand in brands:
    brand_models = [m for m in models if m['brand_id'] == brand['id']]
    if brand_models:
        with_images = sum(1 for m in brand_models if m['hero_image_url'])
        total = len(brand_models)
        coverage = (with_images / total * 100) if total > 0 else 0
        brand_stats[brand['name']] = {
            'total': total,
            'with_images': with_images,
            'coverage': coverage
        }

# Sort by total models (show high-volume brands first)
sorted_brands = sorted(brand_stats.items(), key=lambda x: x[1]['total'], reverse=True)

print("Top 15 brands by model count:\n")
for brand_name, stats in sorted_brands[:15]:
    emoji = "✅" if stats['coverage'] >= 80 else "⚠️" if stats['coverage'] >= 50 else "🔴"
    print(f"  {emoji} {brand_name:20} {stats['with_images']:3}/{stats['total']:3} ({stats['coverage']:5.1f}%)")

# Identify critical gaps (high volume, low coverage)
critical_gaps = [(name, stats) for name, stats in sorted_brands 
                 if stats['total'] >= 10 and stats['coverage'] < 30]

if critical_gaps:
    print(f"\n🔴 CRITICAL GAPS: {len(critical_gaps)} high-volume brands with <30% coverage:")
    for name, stats in critical_gaps:
        print(f"  • {name}: {stats['with_images']}/{stats['total']} ({stats['coverage']:.1f}%)")

# ============================================================================
# AUDIT 5: Fuel Terminology Inconsistencies
# ============================================================================
print_section("AUDIT 5: Fuel Terminology Check")

# Query vehicle_trims for fuel type
trims = query_supabase('vehicle_trims', select='id,model_id,fuel_type')

fuel_types = defaultdict(int)
for trim in trims:
    if trim.get('fuel_type'):
        fuel_types[trim['fuel_type']] += 1

if fuel_types:
    print("Fuel type distribution:\n")
    for fuel_type, count in sorted(fuel_types.items(), key=lambda x: x[1], reverse=True):
        print(f"  • {fuel_type:20} {count:4} trims")
    
    # Check for inconsistencies
    petrol_variants = [ft for ft in fuel_types.keys() 
                       if 'petrol' in ft.lower() or 'gasoline' in ft.lower()]
    if len(petrol_variants) > 1:
        print(f"\n⚠️  WARNING: Found {len(petrol_variants)} variations of petrol/gasoline:")
        for variant in petrol_variants:
            print(f"    - '{variant}' ({fuel_types[variant]} trims)")
        print(f"\n📋 ACTION REQUIRED: Standardize to single terminology")
else:
    print("✅ No fuel type data in vehicle_trims")

# ============================================================================
# AUDIT 6: Body Type Formatting Issues
# ============================================================================
print_section("AUDIT 6: Body Type Formatting Check")

# Query vehicle_trims for body type
trims_body = query_supabase('vehicle_trims', select='id,body_type')

body_types = defaultdict(int)
for trim in trims_body:
    if trim.get('body_type'):
        body_types[trim['body_type']] += 1

if body_types:
    print("Body type distribution:\n")
    for body_type, count in sorted(body_types.items(), key=lambda x: x[1], reverse=True):
        print(f"  • {body_type:25} {count:4} trims")
    
    # Check for formatting issues
    lowercase_types = [bt for bt in body_types.keys() if bt.islower() and len(bt) > 2]
    mixed_case = [bt for bt in body_types.keys() if not bt.isupper() and not bt[0].isupper() and 'SUV' not in bt]
    
    if lowercase_types:
        print(f"\n⚠️  WARNING: Found {len(lowercase_types)} lowercase body types:")
        for bt in lowercase_types[:5]:
            print(f"    - '{bt}' ({body_types[bt]} trims)")
    
    if mixed_case:
        print(f"\n⚠️  WARNING: Found {len(mixed_case)} mixed-case body types:")
        for bt in mixed_case[:5]:
            print(f"    - '{bt}' ({body_types[bt]} trims)")
    
    if lowercase_types or mixed_case:
        print(f"\n📋 ACTION REQUIRED: Standardize body type capitalization")
else:
    print("✅ No body type data in vehicle_trims")

# ============================================================================
# SUMMARY
# ============================================================================
print_section("AUDIT SUMMARY")

total_issues = (
    len(duplicates) + 
    len(wrong_mappings) + 
    len(brand_issues) + 
    len(critical_gaps)
)

print(f"Issues found:")
print(f"  • {len(duplicates)} duplicate model groups")
print(f"  • {len(wrong_mappings)} wrong image mappings")
print(f"  • {len(brand_issues)} brand name inconsistencies")
print(f"  • {len(critical_gaps)} high-volume brands with low coverage")
print(f"  • {'Yes' if len(petrol_variants) > 1 else 'No'} fuel terminology issues")
print(f"  • {'Yes' if (lowercase_types or mixed_case) else 'No'} body type formatting issues")

print(f"\n{'='*80}")
if total_issues > 0:
    print(f"🔴 CRITICAL: {total_issues} high-priority issues require immediate action")
    print(f"{'='*80}\n")
    print("Next steps:")
    print("1. Review duplicate models → Delete extras, keep best image coverage")
    print("2. Fix wrong mappings → Set mismatched hero_image_url to NULL")
    print("3. Merge brand duplicates → Standardize to single case/spacing")
    print("4. Source images for critical gaps → Focus on top 10 brands")
    print("5. Standardize terminology → Choose 'Gasoline' OR 'Petrol' (not both)")
    print("6. Fix body type formatting → Capitalize properly (SUV, Sedan, etc.)")
else:
    print(f"✅ All audits passed - database is clean")
    print(f"{'='*80}\n")

print("\n📊 Full audit complete - save this output for review")
