#!/usr/bin/env python3
"""
Fix duplicate brand prefixes in image filenames.

Handles patterns like:
- renault-renault-duster-2026-egypt.jpg → renault-duster-2026-egypt.jpg
- audi-audi-a3-sedan-egypt.jpg → audi-a3-sedan-egypt.jpg
- bmw-bmw-x5-my2024.jpg → bmw-x5-my2024.jpg

Also handles special cases:
- MG brand: mg-mg-5.jpg → mg-5.jpg (keep MG5 as model name, not "5")
  Because MG has models literally named "MG5", "MG6", "MG7"

Created by: CC (Claude Code)
Date: 2026-01-04
"""

import os
import re
import sys
from pathlib import Path
from typing import List, Tuple

# Dry-run mode
DRY_RUN = "--dry-run" in sys.argv

def has_duplicate_brand_prefix(filename: str) -> bool:
    """
    Check if filename has duplicate brand prefix.

    Examples:
      renault-renault-duster.jpg → True
      audi-audi-q3.jpg → True
      toyota-corolla.jpg → False
      mg-mg-5.jpg → True (special case, but still needs fixing)
    """
    # Remove extension
    name = os.path.splitext(filename)[0]
    parts = name.split('-')

    # Need at least 3 parts for duplicate: brand-brand-model
    if len(parts) < 3:
        return False

    # Check if first two parts are identical (case-insensitive)
    return parts[0].lower() == parts[1].lower()


def fix_duplicate_prefix(filename: str) -> str:
    """
    Remove duplicate brand prefix from filename.

    Examples:
      renault-renault-duster-2026-egypt.jpg → renault-duster-2026-egypt.jpg
      audi-audi-a3-sedan-egypt.jpg → audi-a3-sedan-egypt.jpg
      mg-mg-5-2025.jpg → mg-5-2025.jpg
    """
    name, ext = os.path.splitext(filename)
    parts = name.split('-')

    if len(parts) >= 3 and parts[0].lower() == parts[1].lower():
        # Remove duplicate (second occurrence)
        fixed_parts = [parts[0]] + parts[2:]
        return '-'.join(fixed_parts) + ext

    return filename


def rename_file(src_path: Path, new_filename: str) -> bool:
    """
    Rename file, checking for conflicts.

    Returns True if successful (or would be successful in dry-run).
    """
    dst_path = src_path.parent / new_filename

    if dst_path.exists() and dst_path != src_path:
        print(f"  ⚠️  CONFLICT: {new_filename} already exists, skipping")
        return False

    if DRY_RUN:
        print(f"  ✅ WOULD RENAME: {src_path.name} → {new_filename}")
        return True

    try:
        src_path.rename(dst_path)
        print(f"  ✅ RENAMED: {src_path.name} → {new_filename}")
        return True
    except Exception as e:
        print(f"  ❌ FAILED: {src_path.name} - {e}")
        return False


def process_directory(directory: Path) -> Tuple[int, int, int]:
    """
    Process all JPG files in directory.

    Returns: (renamed_count, skipped_count, conflict_count)
    """
    renamed = 0
    skipped = 0
    conflicts = 0

    jpg_files = sorted([f for f in directory.glob('*.jpg') if not f.name.startswith('placeholder')])

    for filepath in jpg_files:
        filename = filepath.name

        if not has_duplicate_brand_prefix(filename):
            skipped += 1
            continue

        new_filename = fix_duplicate_prefix(filename)

        if new_filename == filename:
            skipped += 1
            continue

        if rename_file(filepath, new_filename):
            renamed += 1
        else:
            conflicts += 1

    return renamed, skipped, conflicts


def main():
    """Main execution."""
    base_path = Path("public/images/vehicles")
    hero_path = base_path / "hero"
    hover_path = base_path / "hover"

    if not hero_path.exists():
        print(f"❌ Hero path not found: {hero_path}")
        return

    if DRY_RUN:
        print("🔍 DRY-RUN MODE - No files will be renamed\n")

    print("="*60)
    print("🔧 FIXING DUPLICATE BRAND PREFIXES")
    print("="*60)

    # Process hero images
    print(f"\n📂 Processing hero images ({hero_path})...")
    hero_renamed, hero_skipped, hero_conflicts = process_directory(hero_path)

    # Process hover images
    if hover_path.exists():
        print(f"\n📂 Processing hover images ({hover_path})...")
        hover_renamed, hover_skipped, hover_conflicts = process_directory(hover_path)
    else:
        hover_renamed, hover_skipped, hover_conflicts = 0, 0, 0
        print(f"\n⚠️  Hover path not found: {hover_path}")

    # Summary
    print("\n" + "="*60)
    print("📊 SUMMARY")
    print("="*60)
    print(f"Hero images:")
    print(f"  ✅ Renamed: {hero_renamed}")
    print(f"  ⏭️  Skipped (no duplicate): {hero_skipped}")
    print(f"  ⚠️  Conflicts: {hero_conflicts}")

    if hover_path.exists():
        print(f"\nHover images:")
        print(f"  ✅ Renamed: {hover_renamed}")
        print(f"  ⏭️  Skipped (no duplicate): {hover_skipped}")
        print(f"  ⚠️  Conflicts: {hover_conflicts}")

    print(f"\n📈 Total renamed: {hero_renamed + hover_renamed}")
    print(f"📈 Total skipped: {hero_skipped + hover_skipped}")
    print(f"📈 Total conflicts: {hero_conflicts + hover_conflicts}")
    print("="*60)

    if DRY_RUN:
        print("\n🔍 DRY-RUN completed - run without --dry-run to apply changes")


if __name__ == "__main__":
    main()
