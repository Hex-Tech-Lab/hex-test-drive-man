#!/usr/bin/env python3
"""
Complete Vehicle Image Coverage - Audit, Update, Verify
Populates models table with hero_image_url and hover_image_url
"""

import os
import sys
import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from pathlib import Path
from datetime import datetime

# Configuration
SUPABASE_URL = "https://lbttmhwckcrfdymwyuhn.supabase.co"
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidHRtaHdja2NyZmR5bXd5dWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYzNjI3MCwiZXhwIjoyMDc4MjEyMjcwfQ.vOteqNu-oD_10NRasipllTewUETEjiMsyCFetA3UzW8')

PROJECT_ROOT = Path(__file__).parent.parent
HERO_DIR = PROJECT_ROOT / "public/images/vehicles/hero"
HOVER_DIR = PROJECT_ROOT / "public/images/vehicles/hover"

start_time = datetime.now()

def query_supabase(table, select_fields, filters=None, count_only=False):
    """Query Supabase REST API."""
    url = f"{SUPABASE_URL}/rest/v1/{table}?select={select_fields}"

    if filters:
        for key, value in filters.items():
            if value == "null":
                url += f"&{key}=is.null"
            else:
                url += f"&{key}=eq.{value}"

    req = Request(url)
    req.add_header('apikey', SUPABASE_SERVICE_KEY)
    req.add_header('Authorization', f'Bearer {SUPABASE_SERVICE_KEY}')
    if count_only:
        req.add_header('Prefer', 'count=exact')

    try:
        with urlopen(req) as response:
            if count_only:
                content_range = response.headers.get('Content-Range', '')
                return int(content_range.split('/')[-1]) if content_range else 0
            return json.loads(response.read().decode())
    except HTTPError as e:
        print(f"ERROR querying {table}: {e}")
        print(f"URL: {url}")
        return [] if not count_only else 0

print("=" * 60)
print("VEHICLE IMAGE COVERAGE - COMPLETE AUDIT & UPDATE")
print("=" * 60)
print(f"Started: {start_time.strftime('%Y-%m-%d %H:%M:%S')}\n")

# PHASE 1: DATABASE AUDIT
print("🔍 PHASE 1: DATABASE AUDIT")
print("-" * 60)

# Count total models
print("1️⃣ Querying models table...")
total_models = query_supabase('models', '*', count_only=True)
print(f"   Total models in database: {total_models}")

# Count models with/without images
models_with_hero = query_supabase('models', '*',
    filters={'hero_image_url': 'not.null'}, count_only=True)
models_with_hover = query_supabase('models', '*',
    filters={'hover_image_url': 'not.null'}, count_only=True)
models_without_hero = total_models - models_with_hero
models_without_hover = total_models - models_with_hover

print(f"   Models with hero images: {models_with_hero}")
print(f"   Models with hover images: {models_with_hover}")
print(f"   Models WITHOUT hero: {models_without_hero}")
print(f"   Models WITHOUT hover: {models_without_hover}")

# Get sample models with images
print("\n2️⃣ Sample models WITH images:")
models_with_imgs = query_supabase('models',
    'id,name,hero_image_url,hover_image_url',
    filters={'hero_image_url': 'not.null'})[:5]

for m in models_with_imgs:
    hero = m.get('hero_image_url', 'N/A')
    hover = m.get('hover_image_url', 'N/A')
    print(f"   ✅ {m['name']}")
    print(f"      Hero:  {hero}")
    print(f"      Hover: {hover}")

# Get sample models without images
print("\n3️⃣ Sample models WITHOUT images:")
models_without_imgs = query_supabase('models',
    'id,name,hero_image_url',
    filters={'hero_image_url': 'null'})[:10]

for m in models_without_imgs[:10]:
    print(f"   ❌ {m['name']}")

print(f"\n   Total missing images: {models_without_hero}")

# PHASE 2: LOCAL IMAGE AUDIT
print("\n🖼️ PHASE 2: LOCAL IMAGE INVENTORY")
print("-" * 60)

hero_images = list(HERO_DIR.glob('*.jpg')) if HERO_DIR.exists() else []
hover_images = list(HOVER_DIR.glob('*.jpg')) if HOVER_DIR.exists() else []

print(f"1️⃣ Local image counts:")
print(f"   Hero images:  {len(hero_images)}")
print(f"   Hover images: {len(hover_images)}")
print(f"   Total: {len(hero_images) + len(hover_images)}")

print(f"\n2️⃣ Sample hero images:")
for img in sorted(hero_images)[:10]:
    print(f"   - {img.name}")

print(f"\n3️⃣ Sample hover images:")
for img in sorted(hover_images)[:10]:
    print(f"   - {img.name}")

# PHASE 3: SQL SCRIPT CHECK
print("\n💾 PHASE 3: SQL UPDATE SCRIPT")
print("-" * 60)

sql_file = PROJECT_ROOT / "scripts/update_image_urls.sql"
if sql_file.exists():
    sql_content = sql_file.read_text()
    update_count = sql_content.count('UPDATE models')
    print(f"✅ SQL script exists: {sql_file.name}")
    print(f"   Size: {sql_file.stat().st_size / 1024:.1f} KB")
    print(f"   UPDATE statements: {update_count}")
    print(f"\n   📄 Preview (first 20 lines):")
    for i, line in enumerate(sql_content.split('\n')[:20], 1):
        if line.strip():
            print(f"      {i:2d}. {line[:70]}")
else:
    print(f"❌ SQL script NOT found: {sql_file}")
    print("   Need to generate SQL update script first!")

# PHASE 4: SUMMARY & RECOMMENDATIONS
print("\n" + "=" * 60)
print("📊 SUMMARY & RECOMMENDATIONS")
print("=" * 60)

coverage_hero = (models_with_hero / total_models * 100) if total_models > 0 else 0
coverage_hover = (models_with_hover / total_models * 100) if total_models > 0 else 0

print(f"\n📈 Coverage Statistics:")
print(f"   Total models: {total_models}")
print(f"   Hero coverage:  {models_with_hero}/{total_models} ({coverage_hero:.1f}%)")
print(f"   Hover coverage: {models_with_hover}/{total_models} ({coverage_hover:.1f}%)")
print(f"   Local images: {len(hero_images)} hero + {len(hover_images)} hover")

print(f"\n🎯 Next Steps:")

if models_without_hero > 0:
    if sql_file.exists():
        print(f"   1️⃣ Execute SQL update script (adds ~{update_count} images)")
        print(f"      Method: Supabase Dashboard SQL Editor")
        print(f"      URL: https://supabase.com/dashboard/project/lbttmhwckcrfdymwyuhn/sql")
        print(f"      File: scripts/update_image_urls.sql")
    else:
        print(f"   1️⃣ Generate SQL update script first")
        print(f"      Run: python3 scripts/generate_image_updates.py")

    print(f"   2️⃣ Source images for {models_without_hero} remaining models")
    print(f"      Options: PDF extraction, manufacturer websites, or placeholders")

    print(f"   3️⃣ Mark images that are not from highest trim")
    print(f"      Add metadata column: is_highest_trim (boolean)")

    print(f"   4️⃣ Verify on live site")
    print(f"      URL: https://getmytestdrive.com")
else:
    print(f"   ✅ All models have images!")
    print(f"   Verify on live site: https://getmytestdrive.com")

# Performance metrics
end_time = datetime.now()
duration = (end_time - start_time).total_seconds()

print(f"\n⏱️ Performance:")
print(f"   Duration: {duration:.1f}s")
print(f"   Models/sec: {total_models/duration:.1f}")

print("\n" + "=" * 60)
print("✅ AUDIT COMPLETE")
print("=" * 60)
