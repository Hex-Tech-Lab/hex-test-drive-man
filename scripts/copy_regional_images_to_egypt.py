#!/usr/bin/env python3
"""
Copy regional images (qatar, ksa, bahrain, uae) to egypt variants.

Purpose:
- Images from Qatar/KSA/Bahrain may be regionally acceptable for Egypt market
- Copy them with -egypt suffix for use while awaiting Egyptian variants
- Track source region for future verification

Example:
  toyota-corolla-2025-qatar.jpg → toyota-corolla-2025-egypt.jpg (copy)
  Keep original qatar file for reference

Created by: CC (Claude Code)
Date: 2026-01-04
"""

import os
import shutil
import csv
from pathlib import Path
from typing import List, Tuple
import sys

# Dry-run mode
DRY_RUN = "--dry-run" in sys.argv

# Regional suffixes to copy from (GCC markets acceptable for Egypt)
REGIONAL_SUFFIXES = ['qatar', 'ksa', 'saudiarabia', 'bahrain', 'uae', 'gcc']

# Suffixes to exclude (different specs/languages)
EXCLUDED_SUFFIXES = ['singapore', 'vietnam', 'philippines', 'india', 'china',
                     'europe', 'colombia', 'indonesia', 'thailand', 'malaysia',
                     'pakistan', 'lebanon']


def should_copy_to_egypt(filename: str) -> Tuple[bool, str, str]:
    """
    Check if file should be copied to egypt variant.

    Returns: (should_copy, source_region, egypt_filename)
    """
    name = os.path.splitext(filename)[0]

    # Check for regional suffixes
    for suffix in REGIONAL_SUFFIXES:
        if name.endswith(f'-{suffix}'):
            # Build egypt variant filename
            egypt_name = name.replace(f'-{suffix}', '-egypt')
            egypt_filename = f"{egypt_name}.jpg"
            return (True, suffix, egypt_filename)

    return (False, '', '')


def copy_regional_images(directory: Path, log_file: Path) -> Tuple[int, int, int]:
    """
    Copy regional images to egypt variants.

    Returns: (copied_count, skipped_count, already_exists_count)
    """
    copied = 0
    skipped = 0
    already_exists = 0

    jpg_files = sorted([f for f in directory.glob('*.jpg') if not f.name.startswith('placeholder')])

    # Open CSV log file
    log_data = []

    for filepath in jpg_files:
        filename = filepath.name

        should_copy, source_region, egypt_filename = should_copy_to_egypt(filename)

        if not should_copy:
            skipped += 1
            continue

        egypt_path = directory / egypt_filename

        # Check if egypt variant already exists
        if egypt_path.exists():
            print(f"  ⏭️  EXISTS: {egypt_filename} (skipping)")
            already_exists += 1
            continue

        if DRY_RUN:
            print(f"  ✅ WOULD COPY: {filename} → {egypt_filename} [{source_region.upper()}]")
            copied += 1
            log_data.append({
                'original_file': filename,
                'copied_file': egypt_filename,
                'source_region': source_region,
                'action': 'would_copy'
            })
        else:
            try:
                shutil.copy2(filepath, egypt_path)
                print(f"  ✅ COPIED: {filename} → {egypt_filename} [{source_region.upper()}]")
                copied += 1
                log_data.append({
                    'original_file': filename,
                    'copied_file': egypt_filename,
                    'source_region': source_region,
                    'action': 'copied'
                })
            except Exception as e:
                print(f"  ❌ FAILED: {filename} - {e}")

    # Write log file
    if log_data:
        with open(log_file, 'w', newline='') as csvfile:
            fieldnames = ['original_file', 'copied_file', 'source_region', 'action']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(log_data)

    return copied, skipped, already_exists


def main():
    """Main execution."""
    base_path = Path("public/images/vehicles")
    hero_path = base_path / "hero"
    hover_path = base_path / "hover"
    log_dir = Path("/tmp")

    if not hero_path.exists():
        print(f"❌ Hero path not found: {hero_path}")
        return

    if DRY_RUN:
        print("🔍 DRY-RUN MODE - No files will be copied\n")

    print("="*60)
    print("📋 COPYING REGIONAL IMAGES TO EGYPT VARIANTS")
    print("="*60)
    print(f"Source regions: {', '.join(REGIONAL_SUFFIXES)}")
    print(f"Excluded regions: {', '.join(EXCLUDED_SUFFIXES)}")
    print()

    # Process hero images
    print(f"📂 Processing hero images ({hero_path})...")
    hero_log = log_dir / "regional_copy_hero.csv"
    hero_copied, hero_skipped, hero_exists = copy_regional_images(hero_path, hero_log)

    # Process hover images
    if hover_path.exists():
        print(f"\n📂 Processing hover images ({hover_path})...")
        hover_log = log_dir / "regional_copy_hover.csv"
        hover_copied, hover_skipped, hover_exists = copy_regional_images(hover_path, hover_log)
    else:
        hover_copied, hover_skipped, hover_exists = 0, 0, 0
        print(f"\n⚠️  Hover path not found: {hover_path}")

    # Summary
    print("\n" + "="*60)
    print("📊 SUMMARY")
    print("="*60)
    print(f"Hero images:")
    print(f"  ✅ Copied: {hero_copied}")
    print(f"  ⏭️  Already exists: {hero_exists}")
    print(f"  ⏩ Skipped (not regional): {hero_skipped}")

    if hover_path.exists():
        print(f"\nHover images:")
        print(f"  ✅ Copied: {hover_copied}")
        print(f"  ⏭️  Already exists: {hover_exists}")
        print(f"  ⏩ Skipped (not regional): {hover_skipped}")

    print(f"\n📈 Total copied: {hero_copied + hover_copied}")
    print(f"📈 Total already exists: {hero_exists + hover_exists}")
    print(f"📈 Total skipped: {hero_skipped + hover_skipped}")
    print("="*60)

    if not DRY_RUN:
        print(f"\n📄 Log files created:")
        if hero_copied > 0:
            print(f"  - {hero_log}")
        if hover_copied > 0:
            print(f"  - {hover_log}")

    if DRY_RUN:
        print("\n🔍 DRY-RUN completed - run without --dry-run to apply changes")


if __name__ == "__main__":
    main()
