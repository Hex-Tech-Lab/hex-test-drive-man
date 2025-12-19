#!/usr/bin/env python3
"""
Apply vehicle image URL updates via Supabase REST API.
Parses update_image_urls.sql and executes updates programmatically.
"""

import os
import sys
import re
import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

# Configuration
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://lbttmhwckcrfdymwyuhn.supabase.co')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

if not SUPABASE_SERVICE_KEY:
    print("ERROR: SUPABASE_SERVICE_KEY not set", file=sys.stderr)
    print("", file=sys.stderr)
    print("Set it with:", file=sys.stderr)
    print("  export SUPABASE_SERVICE_KEY='your_service_role_key'", file=sys.stderr)
    print("", file=sys.stderr)
    print("Or run SQL manually in Supabase Dashboard:", file=sys.stderr)
    print("  https://supabase.com/dashboard/project/lbttmhwckcrfdymwyuhn/sql", file=sys.stderr)
    sys.exit(1)


def get_brands():
    """Fetch all brands for ID lookup."""
    url = f"{SUPABASE_URL}/rest/v1/brands?select=id,name"
    req = Request(url)
    req.add_header('apikey', SUPABASE_SERVICE_KEY)
    req.add_header('Authorization', f'Bearer {SUPABASE_SERVICE_KEY}')

    try:
        with urlopen(req) as response:
            brands = json.loads(response.read().decode())
            return {b['name'].lower(): b['id'] for b in brands}
    except (HTTPError, URLError) as e:
        print(f"ERROR fetching brands: {e}", file=sys.stderr)
        return {}


def update_model_images(brand_name, model_pattern, hero_url=None, hover_url=None):
    """Update model images via REST API."""
    brands = get_brands()
    brand_id = brands.get(brand_name.lower())

    if not brand_id:
        print(f"  ⚠️  Brand not found: {brand_name}", file=sys.stderr)
        return 0

    # Find matching models
    models_url = f"{SUPABASE_URL}/rest/v1/models?select=id,name,brand_id&brand_id=eq.{brand_id}"
    req = Request(models_url)
    req.add_header('apikey', SUPABASE_SERVICE_KEY)
    req.add_header('Authorization', f'Bearer {SUPABASE_SERVICE_KEY}')

    try:
        with urlopen(req) as response:
            models = json.loads(response.read().decode())
    except (HTTPError, URLError) as e:
        print(f"  ⚠️  Error fetching models: {e}", file=sys.stderr)
        return 0

    # Filter models by pattern
    pattern_lower = model_pattern.lower().replace('%', '')
    matching_models = [m for m in models if pattern_lower in m['name'].lower()]

    if not matching_models:
        print(f"  ⚠️  No models match: {brand_name} {model_pattern}", file=sys.stderr)
        return 0

    # Update each matching model
    updated_count = 0
    for model in matching_models:
        update_data = {}
        if hero_url:
            update_data['hero_image_url'] = hero_url
        if hover_url:
            update_data['hover_image_url'] = hover_url

        if not update_data:
            continue

        # PATCH request to update model
        update_url = f"{SUPABASE_URL}/rest/v1/models?id=eq.{model['id']}"
        req = Request(update_url, method='PATCH')
        req.add_header('apikey', SUPABASE_SERVICE_KEY)
        req.add_header('Authorization', f'Bearer {SUPABASE_SERVICE_KEY}')
        req.add_header('Content-Type', 'application/json')
        req.add_header('Prefer', 'return=minimal')

        try:
            req.data = json.dumps(update_data).encode('utf-8')
            with urlopen(req) as response:
                print(f"  ✅ Updated: {model['name']} ({', '.join(update_data.keys())})")
                updated_count += 1
        except (HTTPError, URLError) as e:
            print(f"  ❌ Failed to update {model['name']}: {e}", file=sys.stderr)

    return updated_count


def parse_and_execute_sql():
    """Parse SQL file and execute updates."""
    sql_file = 'scripts/update_image_urls.sql'

    if not os.path.exists(sql_file):
        print(f"ERROR: {sql_file} not found", file=sys.stderr)
        sys.exit(1)

    print("Parsing SQL file...")
    print("")

    with open(sql_file, 'r') as f:
        sql_content = f.read()

    # Regex to extract UPDATE statements
    # Pattern: UPDATE models SET (hero|hover)_image_url = '/path' WHERE brand_id = (SELECT ...'BrandName') AND name LIKE '%model%'
    update_pattern = re.compile(
        r"UPDATE models\s+SET\s+(hero|hover)_image_url\s*=\s*'([^']+)'\s+WHERE\s+brand_id\s*=\s*\(SELECT[^)]+LOWER\('([^']+)'\)\)\s+AND\s+LOWER\(name\)\s+LIKE\s+'([^']+)'",
        re.IGNORECASE | re.MULTILINE
    )

    updates = update_pattern.findall(sql_content)

    if not updates:
        print("WARNING: No UPDATE statements found in SQL file", file=sys.stderr)
        print("Trying alternative parsing...", file=sys.stderr)
        return

    print(f"Found {len(updates)} UPDATE statements")
    print("")

    # Group by brand + model for efficiency
    updates_map = {}
    for img_type, img_url, brand, model_pattern in updates:
        key = (brand, model_pattern)
        if key not in updates_map:
            updates_map[key] = {'hero': None, 'hover': None}
        updates_map[key][img_type] = img_url

    print(f"Grouped into {len(updates_map)} unique brand+model combinations")
    print("")

    # Execute updates
    total_updated = 0
    for (brand, model_pattern), urls in updates_map.items():
        print(f"Updating: {brand} {model_pattern}")
        count = update_model_images(brand, model_pattern, urls['hero'], urls['hover'])
        total_updated += count
        print("")

    print("=" * 50)
    print(f"✅ Total models updated: {total_updated}")
    print("=" * 50)
    print("")

    # Verification query
    print("Verification:")
    verify_hero = f"{SUPABASE_URL}/rest/v1/models?select=id&hero_image_url=like./images/vehicles/hero/*"
    verify_hover = f"{SUPABASE_URL}/rest/v1/models?select=id&hover_image_url=like./images/vehicles/hover/*"

    for url, label in [(verify_hero, 'Hero images'), (verify_hover, 'Hover images')]:
        req = Request(url)
        req.add_header('apikey', SUPABASE_SERVICE_KEY)
        req.add_header('Authorization', f'Bearer {SUPABASE_SERVICE_KEY}')
        req.add_header('Prefer', 'count=exact')

        try:
            with urlopen(req) as response:
                count = response.headers.get('Content-Range', '').split('/')[-1]
                print(f"  {label}: {count} models")
        except (HTTPError, URLError) as e:
            print(f"  {label}: Error ({e})", file=sys.stderr)

    print("")
    print("Next: Deploy to Vercel for images to appear in production")


if __name__ == '__main__':
    parse_and_execute_sql()
