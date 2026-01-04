#!/usr/bin/env python3
"""
Generate SQL to add missing models from image filenames.

Purpose: Extract brand-model combinations from hero images and generate
INSERT statements for models not in database.

Usage:
  python3 scripts/generate_missing_models_sql.py > /tmp/add_missing_models.sql

Created by: CC (Claude Code)
Date: 2026-01-04
"""

import os
import re
from collections import defaultdict
from datetime import datetime

def parse_filename(filename):
    """
    Extract brand and model from filename.

    Examples:
      toyota-hilux-2025.jpg → ('toyota', 'Hilux')
      nissan-qashqai-egypt.jpg → ('nissan', 'Qashqai')
      mg-mg-5-2025.jpg → ('mg', 'MG5') # Special case

    Returns: (brand, model) or None if unparseable
    """
    # Remove extension and -official suffix
    name = os.path.splitext(filename)[0].replace('-official', '')

    # Special case: MG brand has models like MG5, MG6, MG7
    if name.startswith('mg-mg-'):
        # mg-mg-5-2025 → MG5
        match = re.match(r'^mg-mg-(\d+)', name)
        if match:
            return ('mg', f'MG{match.group(1)}')

    # Pattern: brand-model-[year]-[region]
    # Extract first two segments as brand-model
    parts = name.split('-')
    if len(parts) >= 2:
        brand = parts[0]

        # Find where year or region starts (2024, 2025, 2026, egypt, qatar, etc.)
        model_parts = []
        for i, part in enumerate(parts[1:], 1):
            # Stop at year (20XX) or region suffix
            if re.match(r'^20\d{2}$', part) or part in ['egypt', 'qatar', 'ksa', 'bahrain', 'uae', 'gcc']:
                break
            model_parts.append(part)

        if model_parts:
            # Join model parts with spaces and title-case
            model = ' '.join(model_parts).title()
            # Special handling for uppercase abbreviations
            model = model.replace('Suv', 'SUV').replace('Glx', 'GLX')
            return (brand.lower(), model)

    return None


def main():
    """Main execution: scan images and generate SQL."""
    hero_dir = 'public/images/vehicles/hero'

    if not os.path.exists(hero_dir):
        print(f"Error: Directory not found: {hero_dir}", file=sys.stderr)
        return

    models = defaultdict(set)

    # Extract all brand-model combinations from filenames
    jpg_files = [f for f in os.listdir(hero_dir) if f.endswith('.jpg') and not f.startswith('placeholder')]

    for filename in sorted(jpg_files):
        parsed = parse_filename(filename)
        if parsed:
            brand, model = parsed
            models[brand].add(model)

    # Generate SQL header
    print("-- Add missing models to database")
    print(f"-- Generated: {datetime.now().isoformat()}")
    print(f"-- Total brands: {len(models)}")
    print(f"-- Total models: {sum(len(m) for m in models.values())}")
    print("-- Run this in Supabase SQL Editor")
    print()
    print("-- Note: Uses ON CONFLICT DO NOTHING to skip existing models")
    print()

    # Generate INSERT statements by brand
    for brand in sorted(models.keys()):
        model_list = sorted(models[brand])
        print(f"-- {brand.upper()} ({len(model_list)} models)")

        for model in model_list:
            # Escape single quotes in model names
            escaped_model = model.replace("'", "''")

            print(f"""INSERT INTO models (name, brand_id, created_at, updated_at)
SELECT '{escaped_model}', id, NOW(), NOW()
FROM brands
WHERE LOWER(name) = '{brand}'
ON CONFLICT (name, brand_id) DO NOTHING;""")

        print()  # Blank line between brands

    print(f"\n-- Total INSERT statements: {sum(len(m) for m in models.values())}")


if __name__ == '__main__':
    import sys
    main()
