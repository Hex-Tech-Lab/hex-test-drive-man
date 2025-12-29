#!/bin/bash

# Phase 1: Clean Image Files - Standardize Naming Convention
# Target: lowercase-kebab-case: brand-model-variant-year.jpg

set -e  # Exit on error

HERO_DIR="public/images/vehicles/hero"
HOVER_DIR="public/images/vehicles/hover"
DRY_RUN=${1:-"--dry-run"}  # Pass --execute to actually rename

echo "🧹 PHASE 1: Clean Image Filenames"
echo "   Target: lowercase-kebab-case (brand-model-variant-year.jpg)"
echo "   Mode: $DRY_RUN"
echo ""

# Function to clean a single filename
clean_filename() {
    local file="$1"
    local dir=$(dirname "$file")
    local basename=$(basename "$file")
    local original="$basename"

    # Step 1: Convert to lowercase
    basename=$(echo "$basename" | tr '[:upper:]' '[:lower:]')

    # Step 2: Remove duplicate brand prefix (mg-mg- → mg-)
    basename=$(echo "$basename" | sed -E 's/^([a-z]+)-\1-/\1-/')

    # Step 3: Fix triple dashes (--- → -)
    basename=$(echo "$basename" | sed 's/---/-/g')

    # Step 4: Keep multi-year format (2024-25 is acceptable for unchanged models)
    # No transformation needed

    # Step 5: Remove special suffixes that shouldn't be there
    # Keep: pro, max, lux, ev, hybrid, lci, cn7, i5, ix1, ix2, ix3
    # Remove: amended, 0 (unknown meaning)
    basename=$(echo "$basename" | sed 's/-amended-/-/')
    basename=$(echo "$basename" | sed 's/-0\.jpg$/.jpg/')

    # Return cleaned name
    echo "$dir/$basename"
}

# Collect all rename operations
declare -A rename_map
declare -A duplicates

process_directory() {
    local dir="$1"
    echo "📁 Processing: $dir"

    for file in "$dir"/*.jpg; do
        [ -f "$file" ] || continue

        local original="$file"
        local cleaned=$(clean_filename "$file")

        # Check if rename needed
        if [ "$original" != "$cleaned" ]; then
            # Check for duplicate target
            if [ -f "$cleaned" ]; then
                echo "   ⚠️  DUPLICATE: $original → $cleaned (target exists)"
                duplicates["$cleaned"]=1
                # Keep existing lowercase file, skip Title Case duplicate
                continue
            fi

            rename_map["$original"]="$cleaned"
        fi
    done
}

# Process both directories
process_directory "$HERO_DIR"
process_directory "$HOVER_DIR"

# Report findings
echo ""
echo "=== RENAME PLAN ==="
echo "Files to rename: ${#rename_map[@]}"
echo "Duplicate conflicts: ${#duplicates[@]}"
echo ""

if [ ${#rename_map[@]} -eq 0 ]; then
    echo "✅ No files need renaming - all clean!"
    exit 0
fi

# Show rename plan
echo "RENAME OPERATIONS:"
for original in "${!rename_map[@]}"; do
    cleaned="${rename_map[$original]}"
    echo "   $(basename "$original") → $(basename "$cleaned")"
done | sort

# Handle duplicates
if [ ${#duplicates[@]} -gt 0 ]; then
    echo ""
    echo "DUPLICATES (will be skipped, lowercase version kept):"
    for dup in "${!duplicates[@]}"; do
        echo "   $(basename "$dup")"
    done
fi

# Execute renames if --execute flag passed
if [ "$DRY_RUN" = "--execute" ]; then
    echo ""
    echo "🔄 EXECUTING RENAMES..."

    for original in "${!rename_map[@]}"; do
        cleaned="${rename_map[$original]}"
        echo "   Renaming: $(basename "$original") → $(basename "$cleaned")"
        mv "$original" "$cleaned"
    done

    echo ""
    echo "✅ PHASE 1 COMPLETE"
    echo "   Renamed: ${#rename_map[@]} files"
    echo "   Skipped duplicates: ${#duplicates[@]} files"
else
    echo ""
    echo "⚠️  DRY RUN MODE - No files renamed"
    echo "   Run with --execute to apply changes"
fi
