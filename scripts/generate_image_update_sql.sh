#!/bin/bash
# Auto-generate SQL UPDATE statements for vehicle image URLs
# Agent: BB
# Created: 2025-12-18 14:18 UTC
#
# USAGE:
#   ./scripts/generate_image_update_sql.sh
#
# PREREQUISITES:
#   - Images must exist in public/images/vehicles/{hero,hover}/
#   - Naming convention: {Brand}-{model}-{year}.jpg (e.g., Toyota-corolla-2026.jpg)
#
# OUTPUT:
#   - scripts/update_image_urls.sql (ready to execute on Supabase)

set -euo pipefail

# Configuration
HERO_DIR="public/images/vehicles/hero"
HOVER_DIR="public/images/vehicles/hover"
OUTPUT_SQL="scripts/update_image_urls.sql"
TEMP_HERO="/tmp/hero_list.txt"
TEMP_HOVER="/tmp/hover_list.txt"

echo "🔍 Scanning for vehicle images..."

# Check if directories exist
if [ ! -d "$HERO_DIR" ]; then
    echo "❌ ERROR: $HERO_DIR does not exist"
    echo "   Create directory: mkdir -p $HERO_DIR"
    exit 1
fi

if [ ! -d "$HOVER_DIR" ]; then
    echo "❌ ERROR: $HOVER_DIR does not exist"
    echo "   Create directory: mkdir -p $HOVER_DIR"
    exit 1
fi

# Extract image filenames
ls "$HERO_DIR"/*.jpg 2>/dev/null | xargs -n1 basename | sort > "$TEMP_HERO" || touch "$TEMP_HERO"
ls "$HOVER_DIR"/*.jpg 2>/dev/null | xargs -n1 basename | sort > "$TEMP_HOVER" || touch "$TEMP_HOVER"

HERO_COUNT=$(wc -l < "$TEMP_HERO")
HOVER_COUNT=$(wc -l < "$TEMP_HOVER")

echo "📊 Found:"
echo "   Hero images:  $HERO_COUNT"
echo "   Hover images: $HOVER_COUNT"

if [ "$HERO_COUNT" -eq 0 ] && [ "$HOVER_COUNT" -eq 0 ]; then
    echo ""
    echo "❌ ERROR: No images found in $HERO_DIR or $HOVER_DIR"
    echo ""
    echo "Expected naming convention:"
    echo "   Toyota-corolla-2026.jpg"
    echo "   BMW-x5-2025.jpg"
    echo "   MG-mg-5-2026.jpg"
    echo ""
    echo "Add images first, then re-run this script."
    exit 1
fi

# Generate SQL header
cat > "$OUTPUT_SQL" << SQL_HEADER
-- Auto-generated SQL to update vehicle image URLs
-- Generated: $(date '+%Y-%m-%d %H:%M:%S %Z')
-- Hero images: $HERO_COUNT
-- Hover images: $HOVER_COUNT
-- Agent: BB

BEGIN;

-- Clear old placeholder paths (optional - uncomment if needed)
-- UPDATE models SET hero_image_url = NULL WHERE hero_image_url LIKE '/cars/%';
-- UPDATE models SET hover_image_url = NULL WHERE hover_image_url LIKE '/cars/%';

SQL_HEADER

# Process hero images
if [ "$HERO_COUNT" -gt 0 ]; then
    echo "" >> "$OUTPUT_SQL"
    echo "-- ============================================" >> "$OUTPUT_SQL"
    echo "-- HERO IMAGES ($HERO_COUNT files)" >> "$OUTPUT_SQL"
    echo "-- ============================================" >> "$OUTPUT_SQL"
    
    while IFS= read -r filename; do
        # Extract brand and model from filename
        # Example: "Toyota-corolla-2026.jpg" → brand=Toyota, model=corolla
        brand=$(echo "$filename" | cut -d'-' -f1)
        model_part=$(echo "$filename" | cut -d'-' -f2 | tr '[:upper:]' '[:lower:]')
        
        cat >> "$OUTPUT_SQL" << SQL

-- Update hero for: $filename
UPDATE models
SET hero_image_url = '/images/vehicles/hero/${filename}'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('${brand}'))
  AND LOWER(name) LIKE '%${model_part}%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');

SQL
    done < "$TEMP_HERO"
fi

# Process hover images
if [ "$HOVER_COUNT" -gt 0 ]; then
    echo "" >> "$OUTPUT_SQL"
    echo "-- ============================================" >> "$OUTPUT_SQL"
    echo "-- HOVER IMAGES ($HOVER_COUNT files)" >> "$OUTPUT_SQL"
    echo "-- ============================================" >> "$OUTPUT_SQL"
    
    while IFS= read -r filename; do
        brand=$(echo "$filename" | cut -d'-' -f1)
        model_part=$(echo "$filename" | cut -d'-' -f2 | tr '[:upper:]' '[:lower:]')
        
        cat >> "$OUTPUT_SQL" << SQL

-- Update hover for: $filename
UPDATE models
SET hover_image_url = '/images/vehicles/hover/${filename}'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('${brand}'))
  AND LOWER(name) LIKE '%${model_part}%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');

SQL
    done < "$TEMP_HOVER"
fi

# Generate SQL footer with verification queries
cat >> "$OUTPUT_SQL" << 'SQL_FOOTER'

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count updated models by brand
SELECT
    b.name as brand,
    COUNT(*) as total_models,
    COUNT(CASE WHEN m.hero_image_url LIKE '/images/vehicles/%' THEN 1 END) as with_hero,
    COUNT(CASE WHEN m.hover_image_url LIKE '/images/vehicles/%' THEN 1 END) as with_hover
FROM models m
JOIN brands b ON m.brand_id = b.id
GROUP BY b.name
ORDER BY total_models DESC;

-- List models still missing images
SELECT
    b.name as brand,
    m.name as model,
    m.year,
    CASE WHEN m.hero_image_url IS NULL THEN '❌' ELSE '✅' END as hero,
    CASE WHEN m.hover_image_url IS NULL THEN '❌' ELSE '✅' END as hover
FROM models m
JOIN brands b ON m.brand_id = b.id
WHERE m.hero_image_url IS NULL OR m.hover_image_url IS NULL
ORDER BY b.name, m.name, m.year;

SQL_FOOTER

# Cleanup temp files
rm -f "$TEMP_HERO" "$TEMP_HOVER"

# Report results
echo ""
echo "✅ Generated: $OUTPUT_SQL"
echo "   Lines: $(wc -l < "$OUTPUT_SQL")"
echo "   UPDATE statements: $(grep -c "^UPDATE models" "$OUTPUT_SQL" || echo 0)"
echo ""
echo "📋 Next steps:"
echo "   1. Review: cat $OUTPUT_SQL"
echo "   2. Test on staging: psql \$SUPABASE_URL < $OUTPUT_SQL"
echo "   3. Apply to production (if tests pass)"
echo ""
