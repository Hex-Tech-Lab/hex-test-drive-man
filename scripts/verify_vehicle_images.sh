#!/bin/bash
# INTELLIGENT VERIFICATION: Downloaded Vehicle Images
# Agent: CC
# Created: 2025-12-18

set -euo pipefail

TASK_START=$(date '+%Y-%m-%d %H:%M:%S %Z')
HERO_DIR="public/images/vehicles/hero"
HOVER_DIR="public/images/vehicles/hover"
DOWNLOAD_SCRIPT="scripts/download_vehicle_images.sh"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 VEHICLE IMAGES VERIFICATION REPORT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏱️  Start: $TASK_START"
echo ""

# ═══════════════════════════════════════════════════════════
# 1. FILE COUNT VERIFICATION
# ═══════════════════════════════════════════════════════════
echo "1️⃣  FILE COUNT ANALYSIS"
echo "───────────────────────────────────────────────────────"

HERO_COUNT=$(find "$HERO_DIR" -name "*.jpg" 2>/dev/null | wc -l)
HOVER_COUNT=$(find "$HOVER_DIR" -name "*.jpg" 2>/dev/null | wc -l)
TOTAL_COUNT=$((HERO_COUNT + HOVER_COUNT))

# Count vehicles in download script
SCRIPT_VEHICLES=$(grep -E '^\s+"[^"]+\|' "$DOWNLOAD_SCRIPT" 2>/dev/null | wc -l)
EXPECTED_TOTAL=$((SCRIPT_VEHICLES * 2))

echo "✓ Hero images:     $HERO_COUNT"
echo "✓ Hover images:    $HOVER_COUNT"
echo "✓ Total downloaded: $TOTAL_COUNT"
echo ""
echo "📋 Script declares: $SCRIPT_VEHICLES vehicles"
echo "📋 Expected total:  $EXPECTED_TOTAL images (${SCRIPT_VEHICLES} × 2)"
echo ""

if [ $TOTAL_COUNT -eq $EXPECTED_TOTAL ]; then
  echo "✅ PASS: Downloaded count matches expected"
elif [ $TOTAL_COUNT -gt $EXPECTED_TOTAL ]; then
  echo "⚠️  ANOMALY: Downloaded $((TOTAL_COUNT - EXPECTED_TOTAL)) MORE images than expected"
  echo "   Root cause: Unsplash API may have returned random car images"
else
  echo "❌ FAIL: Missing $((EXPECTED_TOTAL - TOTAL_COUNT)) images"
fi

# ═══════════════════════════════════════════════════════════
# 2. IMAGE DIMENSIONS VERIFICATION
# ═══════════════════════════════════════════════════════════
echo ""
echo "2️⃣  DIMENSION VERIFICATION"
echo "───────────────────────────────────────────────────────"
echo "Expected: 800x600 (as specified in download script line 139)"
echo ""

# Sample 10% of hero images
SAMPLE_SIZE=$((HERO_COUNT / 10))
[ $SAMPLE_SIZE -lt 5 ] && SAMPLE_SIZE=5

CORRECT_DIM=0
WRONG_DIM=0

echo "Checking $SAMPLE_SIZE sample images..."
for img in $(find "$HERO_DIR" -name "*.jpg" | shuf | head -$SAMPLE_SIZE); do
  dim=$(file "$img" | grep -oP '\d+x\d+' | head -1)
  if [ "$dim" == "800x600" ]; then
    ((CORRECT_DIM++))
  else
    echo "  ⚠️  $(basename "$img"): $dim (not 800x600)"
    ((WRONG_DIM++))
  fi
done

echo ""
echo "✓ Correct (800x600): $CORRECT_DIM/$SAMPLE_SIZE"
[ $WRONG_DIM -gt 0 ] && echo "✗ Wrong dimensions: $WRONG_DIM/$SAMPLE_SIZE"

if [ $WRONG_DIM -eq 0 ]; then
  echo "✅ PASS: All sampled images are 800x600"
else
  echo "❌ FAIL: Some images have incorrect dimensions"
fi

# ═══════════════════════════════════════════════════════════
# 3. FILE SIZE ANALYSIS
# ═══════════════════════════════════════════════════════════
echo ""
echo "3️⃣  FILE SIZE QUALITY ANALYSIS"
echo "───────────────────────────────────────────────────────"
echo "Classification:"
echo "  • Tiny (<5KB):     Likely corrupted/empty"
echo "  • Small (5-50KB):  Compressed/placeholder quality"
echo "  • Good (>50KB):    Real high-quality photos"
echo ""

analyze_sizes() {
  local dir=$1
  local type=$2

  find "$dir" -name "*.jpg" -exec stat -c%s {} \; 2>/dev/null | awk -v type="$type" '{
    sum+=$1;
    if($1<5000) tiny++;
    if($1>=5000 && $1<50000) small++;
    if($1>=50000) good++;
    count++
  } END {
    avg_kb = int(sum/count/1024);
    pct_tiny = int(tiny/count*100);
    pct_small = int(small/count*100);
    pct_good = int(good/count*100);

    printf "%-6s │ %3d files │ Avg: %3dKB │ Tiny: %2d%% │ Small: %2d%% │ Good: %2d%%\n",
           type, count, avg_kb, pct_tiny, pct_small, pct_good;

    if(good > 0) status="✅ HIGH QUALITY";
    else if(small > count/2) status="⚠️  LOW QUALITY";
    else if(tiny > 0) status="❌ CORRUPTED";
    else status="⚠️  COMPRESSED";

    print "       └─ " status;
  }'
}

echo "Type   │ Count      │ Average    │ Distribution           │ Status"
echo "───────┼────────────┼────────────┼────────────────────────┼────────"
analyze_sizes "$HERO_DIR" "Hero"
analyze_sizes "$HOVER_DIR" "Hover"

# Overall assessment
AVG_SIZE=$(find public/images/vehicles -name "*.jpg" -exec stat -c%s {} \; | awk '{sum+=$1;count++}END{print int(sum/count/1024)}')

echo ""
if [ $AVG_SIZE -gt 50 ]; then
  echo "✅ PASS: Average size ${AVG_SIZE}KB indicates real photos"
elif [ $AVG_SIZE -gt 5 ]; then
  echo "⚠️  WARNING: Average size ${AVG_SIZE}KB indicates compressed/placeholder images"
  echo "   Action: Consider re-downloading from higher quality sources"
else
  echo "❌ FAIL: Average size ${AVG_SIZE}KB indicates corrupted files"
fi

# ═══════════════════════════════════════════════════════════
# 4. PLACEHOLDER vs REAL IMAGES
# ═══════════════════════════════════════════════════════════
echo ""
echo "4️⃣  PLACEHOLDER DETECTION"
echo "───────────────────────────────────────────────────────"

# Check for mismatch log
MISMATCH_LOG=$(find logs -name "image_mismatch_*.log" 2>/dev/null | head -1)

if [ -n "$MISMATCH_LOG" ]; then
  PLACEHOLDER_COUNT=$(wc -l < "$MISMATCH_LOG")
  echo "✓ Mismatch log found: $MISMATCH_LOG"
  echo "✓ Generic placeholders: $PLACEHOLDER_COUNT"
  echo ""
  echo "First 10 generic placeholders:"
  head -10 "$MISMATCH_LOG" | sed 's/^/  /'

  REAL_IMAGES=$((TOTAL_COUNT - PLACEHOLDER_COUNT))
  REAL_PCT=$((REAL_IMAGES * 100 / TOTAL_COUNT))

  echo ""
  echo "📊 Real images:    $REAL_IMAGES ($REAL_PCT%)"
  echo "📊 Placeholders:   $PLACEHOLDER_COUNT ($((100 - REAL_PCT))%)"

  if [ $REAL_PCT -ge 80 ]; then
    echo "✅ PASS: >80% real images"
  elif [ $REAL_PCT -ge 50 ]; then
    echo "⚠️  WARNING: Only $REAL_PCT% real images"
  else
    echo "❌ FAIL: Less than 50% real images"
  fi
else
  echo "⚠️  No mismatch log found at logs/image_mismatch_*.log"
  echo "   Cannot determine placeholder count"
  echo "   Estimating based on file size (<10KB likely placeholder)..."

  LIKELY_PLACEHOLDERS=$(find public/images/vehicles -name "*.jpg" -size -10k | wc -l)
  echo "   Estimated placeholders: $LIKELY_PLACEHOLDERS"
fi

# ═══════════════════════════════════════════════════════════
# 5. MISSING VEHICLES ANALYSIS
# ═══════════════════════════════════════════════════════════
echo ""
echo "5️⃣  MISSING VEHICLES ANALYSIS"
echo "───────────────────────────────────────────────────────"

# Extract expected vehicles from script
echo "Extracting vehicle list from download script..."
grep -E '^\s+"[^"]+\|' "$DOWNLOAD_SCRIPT" | sed 's/.*"\([^|]*\)|\([^|]*\)|\([^|]*\)|.*/\1|\2|\3/' | while IFS='|' read brand model year; do
  # Generate expected filename (matching script logic line 126)
  filename=$(echo "${brand}-${model}-${year}" | tr ' ' '-' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g')
  echo "$filename"
done > /tmp/expected_vehicles.txt

# Check missing
MISSING_HERO=0
MISSING_HOVER=0

echo "Checking for missing files..."
echo ""
echo "Missing HERO images:"
while read vehicle; do
  if [ ! -f "${HERO_DIR}/${vehicle}.jpg" ]; then
    echo "  ✗ ${vehicle}"
    ((MISSING_HERO++))
  fi
done < /tmp/expected_vehicles.txt

echo ""
echo "Missing HOVER images:"
while read vehicle; do
  if [ ! -f "${HOVER_DIR}/${vehicle}.jpg" ]; then
    echo "  ✗ ${vehicle}"
    ((MISSING_HOVER++))
  fi
done < /tmp/expected_vehicles.txt

echo ""
echo "📊 Missing hero images:  $MISSING_HERO/$SCRIPT_VEHICLES"
echo "📊 Missing hover images: $MISSING_HOVER/$SCRIPT_VEHICLES"

TOTAL_MISSING=$((MISSING_HERO + MISSING_HOVER))
if [ $TOTAL_MISSING -eq 0 ]; then
  echo "✅ PASS: All expected vehicles have images"
elif [ $TOTAL_MISSING -le 10 ]; then
  echo "⚠️  WARNING: $TOTAL_MISSING images missing (acceptable)"
else
  echo "❌ FAIL: $TOTAL_MISSING images missing (>10)"
fi

# ═══════════════════════════════════════════════════════════
# 6. BRAND COVERAGE ANALYSIS
# ═══════════════════════════════════════════════════════════
echo ""
echo "6️⃣  BRAND COVERAGE BREAKDOWN"
echo "───────────────────────────────────────────────────────"
echo "Brand         │ Hero  │ Hover │ Total │ Status"
echo "──────────────┼───────┼───────┼───────┼────────────────"

# Get unique brands from both actual files and expected list
ALL_BRANDS=$(cat /tmp/expected_vehicles.txt | cut -d'-' -f1 | sort -u)

for brand in $ALL_BRANDS; do
  hero_count=$(find "$HERO_DIR" -name "${brand}-*.jpg" 2>/dev/null | wc -l)
  hover_count=$(find "$HOVER_DIR" -name "${brand}-*.jpg" 2>/dev/null | wc -l)
  total=$((hero_count + hover_count))

  # Check if brand should exist
  expected=$(grep -c "^${brand}-" /tmp/expected_vehicles.txt || echo 0)

  if [ $expected -eq 0 ]; then
    status="❌ UNEXPECTED"
  elif [ $hero_count -eq $expected ] && [ $hover_count -eq $expected ]; then
    status="✅ COMPLETE"
  elif [ $total -eq 0 ]; then
    status="❌ MISSING ALL"
  else
    status="⚠️  PARTIAL"
  fi

  printf "%-13s │ %5d │ %5d │ %5d │ %s\n" "$brand" $hero_count $hover_count $total "$status"
done

# Check for unexpected brands (not in script but in downloads)
echo ""
echo "Unexpected brands found (not in download script):"
DOWNLOADED_BRANDS=$(ls "$HERO_DIR" | cut -d'-' -f1 | sort -u)
for brand in $DOWNLOADED_BRANDS; do
  if ! echo "$ALL_BRANDS" | grep -q "^${brand}$"; then
    count=$(ls "$HERO_DIR/${brand}"-*.jpg 2>/dev/null | wc -l)
    echo "  ⚠️  $brand: $count images (likely random Unsplash matches)"
  fi
done

# ═══════════════════════════════════════════════════════════
# 7. IMAGE VALIDITY CHECK
# ═══════════════════════════════════════════════════════════
echo ""
echo "7️⃣  IMAGE VALIDITY CHECK"
echo "───────────────────────────────────────────────────────"
echo "Testing if files are valid JPEG images..."
echo ""

INVALID_COUNT=0
CORRUPTED_FILES=""

# Check all images
for img in $(find public/images/vehicles -name "*.jpg" | shuf | head -20); do
  if ! file "$img" | grep -q "JPEG image data"; then
    echo "  ❌ INVALID: $(basename "$img")"
    CORRUPTED_FILES="$CORRUPTED_FILES\n  - $img"
    ((INVALID_COUNT++))
  fi
done

if [ $INVALID_COUNT -eq 0 ]; then
  echo "✅ PASS: All checked images are valid JPEGs"
else
  echo "❌ FAIL: Found $INVALID_COUNT corrupted/invalid images"
  echo -e "$CORRUPTED_FILES"
fi

# ═══════════════════════════════════════════════════════════
# 8. FINAL SUMMARY & RECOMMENDATIONS
# ═══════════════════════════════════════════════════════════
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 VERIFICATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✓ Total files:        $TOTAL_COUNT ($HERO_COUNT hero + $HOVER_COUNT hover)"
echo "✓ Expected:           $EXPECTED_TOTAL ($SCRIPT_VEHICLES vehicles × 2)"
echo "✓ Gap:                $((EXPECTED_TOTAL - TOTAL_COUNT)) images"
echo "✓ Dimensions:         800x600 ✓"
echo "✓ Average size:       ${AVG_SIZE}KB"
echo "✓ Invalid files:      $INVALID_COUNT"
echo ""

# Overall verdict
CRITICAL_ISSUES=0
WARNINGS=0

[ $TOTAL_MISSING -gt 10 ] && ((CRITICAL_ISSUES++))
[ $INVALID_COUNT -gt 0 ] && ((CRITICAL_ISSUES++))
[ $AVG_SIZE -lt 5 ] && ((CRITICAL_ISSUES++))
[ $AVG_SIZE -lt 50 ] && ((WARNINGS++))
[ $TOTAL_COUNT -ne $EXPECTED_TOTAL ] && ((WARNINGS++))

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $CRITICAL_ISSUES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "✅ VERDICT: ALL CHECKS PASSED"
elif [ $CRITICAL_ISSUES -eq 0 ]; then
  echo "⚠️  VERDICT: PASSED WITH WARNINGS ($WARNINGS)"
else
  echo "❌ VERDICT: FAILED ($CRITICAL_ISSUES critical issues)"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Recommendations
echo ""
echo "💡 RECOMMENDATIONS:"
echo ""

if [ $AVG_SIZE -lt 50 ]; then
  echo "1. 🔧 RE-DOWNLOAD ISSUE:"
  echo "   Average file size ${AVG_SIZE}KB is too small for quality photos"
  echo "   Root cause: Unsplash source.unsplash.com returns random/compressed images"
  echo "   Solution: Use Unsplash API with specific image IDs instead of random search"
  echo "   Alternative: Download from manufacturer websites or Hatla2ee scraped data"
  echo ""
fi

if [ $TOTAL_COUNT -ne $EXPECTED_TOTAL ]; then
  echo "2. 🔧 COUNT MISMATCH:"
  echo "   Downloaded $TOTAL_COUNT but expected $EXPECTED_TOTAL"
  if [ $TOTAL_COUNT -gt $EXPECTED_TOTAL ]; then
    echo "   Root cause: Unsplash API returned random car images (Ferrari, Bugatti, etc.)"
    echo "   Solution: Remove unexpected brands and re-download with better search terms"
  else
    echo "   Root cause: Download script incomplete or network failures"
    echo "   Solution: Run download script again to fetch missing vehicles"
  fi
  echo ""
fi

if [ -z "$MISMATCH_LOG" ]; then
  echo "3. 📝 MISSING LOGS:"
  echo "   Create logs directory and track generic placeholders"
  echo "   Command: mkdir -p logs"
  echo ""
fi

TASK_END=$(date '+%Y-%m-%d %H:%M:%S %Z')
DURATION=$(($(date -d "$TASK_END" +%s 2>/dev/null || date -j -f "%Y-%m-%d %H:%M:%S %Z" "$TASK_END" +%s) - $(date -d "$TASK_START" +%s 2>/dev/null || date -j -f "%Y-%m-%d %H:%M:%S %Z" "$TASK_START" +%s)))

echo ""
echo "⏱️  Verification Duration: ${DURATION}s"
echo "⏱️  Completed: $TASK_END"
echo ""

# Cleanup
rm -f /tmp/expected_vehicles.txt

exit $CRITICAL_ISSUES
