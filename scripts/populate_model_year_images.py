#!/usr/bin/env python3
"""
Migrate image files to model_year_images table.
Handles multi-year filenames (2024-25) and fuzzy brand/model matching.

Optimizations by CC:
- Fixed regex syntax error
- Added environment variable support for service key
- Improved fuzzy matching with similarity scoring
- Added dry-run mode
- Better error handling and progress tracking
- Fixed coverage calculation (direct REST API)
"""

import os
import re
import sys
import requests
from typing import Optional, List, Tuple
from difflib import SequenceMatcher

# Supabase config - prefer env var, fallback to hardcoded
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "https://lbttmhwckcrfdymwyuhn.supabase.co")
SERVICE_KEY = os.getenv(
    "SUPABASE_SERVICE_ROLE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidHRtaHdja2NyZmR5bXd5dWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYzNjI3MCwiZXhwIjoyMDc4MjEyMjcwfQ.vOteqNu-oD10NRasipllTewUETEjiMsyCFetA3UzW8"
)

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# Cache for brands and models
BRAND_CACHE = {}
MODEL_CACHE = {}

# Dry-run mode
DRY_RUN = "--dry-run" in sys.argv


def load_brands():
    """Load all brands once."""
    global BRAND_CACHE
    if BRAND_CACHE:
        return

    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/brands?select=id,name",
        headers=headers
    )
    response.raise_for_status()

    for brand in response.json():
        BRAND_CACHE[brand['name'].lower()] = brand


def load_models():
    """Load all models once."""
    global MODEL_CACHE
    if MODEL_CACHE:
        return

    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/models?select=id,name,brand_id",
        headers=headers
    )
    response.raise_for_status()

    for model in response.json():
        key = f"{model['brand_id']}:{model['name'].lower()}"
        MODEL_CACHE[key] = model


def fuzzy_similarity(str1: str, str2: str) -> float:
    """Calculate similarity ratio between two strings (0.0 to 1.0)."""
    return SequenceMatcher(None, str1.lower(), str2.lower()).ratio()


def parse_filename(filename: str) -> Optional[Tuple[str, str, List[int], Optional[str]]]:
    """
    Parse filename to extract brand, model, year(s), and optional region.

    Examples:
      toyota-corolla-2025.jpg → ('toyota', 'corolla', [2025], None)
      chery-tiggo-4-pro-2026.jpg → ('chery', 'tiggo-4-pro', [2026], None)
      mg-5-2024-25.jpg → ('mg', '5', [2024, 2025], None)
      byd-seal-2024-2025.jpg → ('byd', 'seal', [2024, 2025], None)
      renault-duster-2026-egypt.jpg → ('renault', 'duster', [2026], 'egypt')
      audi-q3-2025-qatar.jpg → ('audi', 'q3', [2025], 'qatar')
      bmw-x5-2024-25-ksa.jpg → ('bmw', 'x5', [2024, 2025], 'ksa')

    Returns: (brand, model, years, region) or None if unparseable

    Regional suffixes supported (GCC + Europe only):
      - egypt, qatar, ksa, saudiarabia, uae, bahrain, gcc, europe
      - Excluded: singapore, philippines, vietnam, india (different specs/languages)
    """
    # Remove extension
    name = os.path.splitext(filename)[0]

    # Pattern: brand-model-[year(s)]-[region]
    # Both year and region are optional
    # Handles: 2025, 2024-25, 2024-2025, optional region suffix
    # GCC regions: egypt, qatar, ksa, saudiarabia, uae, bahrain, gcc, europe
    # Exclude: singapore, philippines, vietnam, india, china
    pattern = r'^(.+?)-(.+?)(?:-(20\d{2})(?:-(\d{2}|\d{4}))?)?(?:-(egypt|qatar|ksa|saudiarabia|uae|bahrain|gcc|europe|official))?$'
    match = re.match(pattern, name)

    if not match:
        return None

    brand = match.group(1)
    model = match.group(2)
    year1_str = match.group(3)  # Can be None
    year2_str = match.group(4)  # Can be None
    region = match.group(5)  # Can be None

    # Default to current year if no year specified
    import datetime
    current_year = datetime.datetime.now().year

    years = []
    if year1_str:
        year1 = int(year1_str)
        years.append(year1)

        if year2_str:
            # Handle both "25" and "2025" formats
            year2 = int(year2_str) if len(year2_str) == 4 else int(f"20{year2_str}")
            if year2 != year1:
                years.append(year2)
    else:
        # No year specified - use current year as default
        years = [current_year]

    return (brand, model, years, region)


def find_model_id(brand_name: str, model_name: str) -> Optional[str]:
    """
    Find model ID with improved fuzzy matching.

    Uses similarity scoring with 0.6 threshold for brand and model.
    """
    load_brands()
    load_models()

    brand_lower = brand_name.lower()
    model_lower = model_name.lower()

    # Find brand with fuzzy matching
    brand_id = None
    best_brand_score = 0.0

    if brand_lower in BRAND_CACHE:
        brand_id = BRAND_CACHE[brand_lower]['id']
    else:
        # Fuzzy match on brand
        for cached_brand_name, cached_brand in BRAND_CACHE.items():
            score = fuzzy_similarity(brand_lower, cached_brand_name)
            if score > best_brand_score and score >= 0.6:
                best_brand_score = score
                brand_id = cached_brand['id']

    if not brand_id:
        return None

    # Find model with fuzzy matching
    best_model_id = None
    best_model_score = 0.0

    # Exact match first
    key = f"{brand_id}:{model_lower}"
    if key in MODEL_CACHE:
        return MODEL_CACHE[key]['id']

    # Fuzzy match on model name within same brand
    for cached_key, model in MODEL_CACHE.items():
        cached_brand_id, cached_model_name = cached_key.split(':', 1)
        if cached_brand_id == brand_id:
            # Calculate similarity
            score = fuzzy_similarity(model_lower, cached_model_name)

            # Boost score for substring matches
            if model_lower in cached_model_name or cached_model_name in model_lower:
                score += 0.2

            # Boost score for matching after removing hyphens/spaces
            if model_lower.replace('-', '').replace(' ', '') == cached_model_name.replace('-', '').replace(' ', ''):
                score += 0.3

            if score > best_model_score and score >= 0.6:
                best_model_score = score
                best_model_id = model['id']

    return best_model_id


def check_existing(model_id: str, year: int) -> bool:
    """Check if record already exists for this model_id + year."""
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/model_year_images?model_id=eq.{model_id}&model_year=eq.{year}&select=id",
        headers=headers
    )
    return response.status_code == 200 and len(response.json()) > 0


def insert_model_year_image(model_id: str, year: int, hero_url: str,
                            hover_url: Optional[str], filename: str,
                            covers_years: List[int], region: Optional[str] = None) -> bool:
    """Insert or update one row in model_year_images."""
    if DRY_RUN:
        return True

    # Flag for review if:
    # 1. Multi-year image (covers_years > 1)
    # 2. Regional variant (region suffix present)
    should_flag = len(covers_years) > 1 or region is not None

    data = {
        "model_id": model_id,
        "model_year": year,
        "hero_image_url": hero_url,
        "hover_image_url": hover_url,
        "source_filename": filename,
        "covers_years": covers_years,
        "extraction_method": "YOLO",
        "is_brochure_official": True,
        "flagged_for_update": should_flag  # Flag multi-year or regional images
    }

    # Check if exists first to avoid 409
    if check_existing(model_id, year):
        # Update existing
        response = requests.patch(
            f"{SUPABASE_URL}/rest/v1/model_year_images?model_id=eq.{model_id}&model_year=eq.{year}",
            headers=headers,
            json=data
        )
        return response.status_code in [200, 204]
    else:
        # Insert new
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/model_year_images",
            headers=headers,
            json=data
        )

        if response.status_code in [200, 201]:
            return True
        else:
            print(f"  ❌ Failed: {response.status_code} - {response.text}")
            return False


def main():
    """Main migration logic."""
    base_path = "public/images/vehicles"
    hero_path = os.path.join(base_path, "hero")
    hover_path = os.path.join(base_path, "hover")

    if not os.path.exists(hero_path):
        print(f"❌ Hero path not found: {hero_path}")
        return

    if DRY_RUN:
        print("🔍 DRY-RUN MODE - No database changes will be made\n")

    print("🔄 Loading brands and models...")
    try:
        load_brands()
        load_models()
    except Exception as e:
        print(f"❌ Failed to load data: {e}")
        return

    print(f"✅ Loaded {len(BRAND_CACHE)} brands, {len(MODEL_CACHE)} models\n")

    # Get image files
    hero_files = sorted([f for f in os.listdir(hero_path)
                        if f.endswith('.jpg') and not f.startswith('placeholder')])
    hover_files = set(os.listdir(hover_path)) if os.path.exists(hover_path) else set()

    success = 0
    failed = 0
    skipped = 0
    updated = 0
    excluded_regions = 0

    # Excluded regions (different specs/languages - not acceptable for Egypt market)
    EXCLUDED_REGIONS = ['singapore', 'vietnam', 'philippines', 'india', 'china',
                       'indonesia', 'thailand', 'malaysia', 'pakistan', 'lebanon',
                       'colombia', 'europe']  # Europe excluded per user requirement

    print(f"📦 Processing {len(hero_files)} hero images...\n")

    for i, hero_file in enumerate(hero_files, 1):
        # Progress indicator every 50 files
        if i % 50 == 0:
            print(f"   ... processed {i}/{len(hero_files)}")

        parsed = parse_filename(hero_file)
        if not parsed:
            print(f"⚠️  Skipped (unparseable): {hero_file}")
            skipped += 1
            continue

        brand, model, years, region = parsed

        # Filter out excluded regions
        if region and region.lower() in EXCLUDED_REGIONS:
            print(f"⚠️  Skipped (excluded region {region.upper()}): {hero_file}")
            excluded_regions += 1
            continue

        model_id = find_model_id(brand, model)

        if not model_id:
            print(f"⚠️  Skipped (model not found): {brand} {model} - {hero_file}")
            skipped += 1
            continue

        # Build URLs
        hero_url = f"/images/vehicles/hero/{hero_file}"
        hover_file_name = hero_file  # Assume same name in hover folder
        hover_url = f"/images/vehicles/hover/{hover_file_name}" if hover_file_name in hover_files else None

        # Insert one row per year
        for year in years:
            exists = check_existing(model_id, year) if not DRY_RUN else False

            if insert_model_year_image(model_id, year, hero_url, hover_url, hero_file, years, region):
                status = "EXISTS" if exists else "NEW"
                region_tag = f" [{region.upper()}]" if region else ""
                if exists:
                    updated += 1
                else:
                    success += 1
                print(f"{'🔄' if exists else '✅'} [{status}]{region_tag} {brand.title()} {model.title()} {year} - {hero_file}")
            else:
                print(f"❌ Failed: {brand} {model} {year}")
                failed += 1

    print(f"\n{'='*60}")
    print(f"✅ Success (new): {success}")
    print(f"🔄 Updated: {updated}")
    print(f"❌ Failed: {failed}")
    print(f"⚠️  Skipped: {skipped}")
    print(f"🚫 Excluded regions: {excluded_regions}")
    print(f"{'='*60}")

    if DRY_RUN:
        print("\n🔍 DRY-RUN completed - run without --dry-run to apply changes")
        return

    # Show coverage using direct REST API query
    print("\n📊 Calculating coverage...")
    try:
        # Get all vehicle_trims with model_id and model_year
        vt_response = requests.get(
            f"{SUPABASE_URL}/rest/v1/vehicle_trims?select=model_id,model_year",
            headers=headers
        )
        vt_response.raise_for_status()
        vehicle_trims = vt_response.json()

        # Get all model_year_images
        myi_response = requests.get(
            f"{SUPABASE_URL}/rest/v1/model_year_images?select=model_id,model_year",
            headers=headers
        )
        myi_response.raise_for_status()
        model_year_images = myi_response.json()

        # Calculate coverage
        total_model_years = set()
        for vt in vehicle_trims:
            total_model_years.add(f"{vt['model_id']}-{vt['model_year']}")

        covered_model_years = set()
        for myi in model_year_images:
            covered_model_years.add(f"{myi['model_id']}-{myi['model_year']}")

        total = len(total_model_years)
        covered = len(covered_model_years & total_model_years)
        pct = round(100.0 * covered / total, 1) if total > 0 else 0

        print(f"📊 Coverage: {covered}/{total} model-years ({pct}%)")
        print(f"📊 Total images inserted: {success + updated}")

    except Exception as e:
        print(f"⚠️  Could not calculate coverage: {e}")


if __name__ == "__main__":
    main()
