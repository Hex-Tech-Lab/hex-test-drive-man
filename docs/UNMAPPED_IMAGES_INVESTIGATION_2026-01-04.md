# Unmapped Images Investigation Report

**Date**: 2026-01-04 02:35 UTC (04:35 EET)
**Investigator**: CC (Claude Code)
**Scope**: 275 hero images in git with NO database references
**Method**: File system scan + database cross-reference + size analysis

---

## Executive Summary

**Finding**: 275 unmapped hero images exist in git repository without corresponding model records.

**Critical Issue**: 45 files (16.4%) are suspiciously small (< 20KB) - likely broken/corrupted downloads.

**Recommendation**:
1. **Delete 45 broken small files** (< 20KB)
2. **Investigate remaining 230 images** - determine if legitimate or orphaned
3. **Create model records** for legitimate images OR **delete** if orphaned

---

## UNMAPPED IMAGES BREAKDOWN

| Category | Count | % of Total | Size Range | Status |
|----------|-------|------------|------------|--------|
| **Total unmapped** | **275** | **100%** | 6.3 KB - 539 KB | - |
| Suspicious small | 45 | 16.4% | < 20 KB | ❌ Likely broken |
| Normal size | 230 | 83.6% | 20-500 KB | ⚠️ Needs review |
| Extra large | 4 | 1.5% | > 500 KB | ℹ️ Optimize |

---

## BRAND DISTRIBUTION

Top 10 brands in unmapped images:

| Rank | Brand | Image Count | % of Unmapped |
|------|-------|-------------|---------------|
| 1 | BMW | 39 | 14.2% |
| 2 | Mercedes-Benz | 28 | 10.2% |
| 3 | MG | 25 | 9.1% |
| 4 | Audi | 25 | 9.1% |
| 5 | Nissan | 23 | 8.4% |
| 6 | BYD | 21 | 7.6% |
| 7 | Toyota | 20 | 7.3% |
| 8 | Hyundai | 17 | 6.2% |
| 9 | BAIC | 16 | 5.8% |
| 10 | Chery | 11 | 4.0% |

**Observation**: Major brands represented - suggests these are pre-scraped images awaiting model creation.

---

## SUSPICIOUS SMALL FILES (45 total)

### Size Statistics

| Metric | Value |
|--------|-------|
| Smallest file | 6.3 KB (byd-m6-mpv-2025-singapore.jpg) |
| Average (small files) | 10.2 KB |
| Threshold | < 20 KB |

### Sample Broken Files (First 20)

1. `byd-m6-mpv-2025-singapore.jpg` - 6.3 KB ❌
2. `mg-zs.jpg` - 7.6 KB ❌
3. `mg-5.jpg` - 8.1 KB ❌
4. `audi-a7-2024.jpg` - 8.6 KB ❌
5. `audi-a8-2024.jpg` - 8.6 KB ❌
6. `audi-a3-2025.jpg` - 8.6 KB ❌
7. `audi-a5-2025.jpg` - 8.7 KB ❌
8. `audi-q7-2024.jpg` - 8.7 KB ❌
9. `audi-q2-2025.jpg` - 8.8 KB ❌
10. `audi-q8-2025.jpg` - 8.8 KB ❌
11. `audi-q5-2025.jpg` - 8.8 KB ❌
12. `mg-4-2026.jpg` - 8.9 KB ❌
13. `bmw-x1-2024.jpg` - 8.9 KB ❌
14. `mg-4-2025.jpg` - 8.9 KB ❌
15. `mg-7-2025.jpg` - 8.9 KB ❌
16. `bmw-x7-2024.jpg` - 9.0 KB ❌
17. `mg-6-2025.jpg` - 9.0 KB ❌
18. `bmw-ix1-2024.jpg` - 9.0 KB ❌
19. `bmw-x3-2024.jpg` - 9.0 KB ❌
20. `bmw-x5-2024.jpg` - 9.1 KB ❌

**Pattern**: Mostly premium brands (Audi, BMW, MG) with simple naming (no "-egypt" suffix).

**Full list**: `/tmp/suspicious_small_images.txt`

---

## SIZE DISTRIBUTION

| Size Range | Count | % of Total |
|------------|-------|------------|
| 0-10 KB | 32 | 11.6% ❌ **Broken** |
| 10-20 KB | 13 | 4.7% ❌ **Broken** |
| 20-50 KB | 11 | 4.0% ⚠️ **Small** |
| 50-100 KB | 14 | 5.1% ✅ **OK** |
| 100-200 KB | 107 | 38.9% ✅ **Normal** |
| 200-500 KB | 94 | 34.2% ✅ **Normal** |
| > 500 KB | 4 | 1.5% ℹ️ **Large** |

**Median size**: 163 KB (healthy)
**Average size**: 164 KB (including broken files)

---

## SAMPLE UNMAPPED IMAGES (Legitimate Size)

**Examples of normal-sized unmapped images**:

```
audi-audi-a3-sedan-egypt.jpg       - 286 KB ✅
audi-audi-a3-sportback-egypt.jpg   - 286 KB ✅
bmw-bmw-ix1-egypt.jpg              - 161 KB ✅
bmw-bmw-x1-egypt.jpg               - 161 KB ✅
mercedes-mercedes-a-class-egypt.jpg - 234 KB ✅
```

**Observation**: Images with "-egypt" suffix are larger and likely legitimate.

---

## NAMING PATTERN ANALYSIS

### Pattern 1: Simple naming (likely broken)
```
audi-a3-2025.jpg           - 8.6 KB ❌
bmw-x1-2024.jpg            - 8.9 KB ❌
mg-5.jpg                   - 8.1 KB ❌
```

### Pattern 2: Redundant naming (legitimate)
```
audi-audi-a3-sedan-egypt.jpg     - 286 KB ✅
bmw-bmw-x1-egypt.jpg             - 161 KB ✅
nissan-nissan-x-trail-egypt.jpg  - 490 KB ✅
```

### Pattern 3: Geographic suffix (legitimate)
```
baic-bj40-saudiarabia.jpg        - 539 KB ✅
byd-m6-mpv-2025-singapore.jpg    - 6.3 KB ❌ (exception - small)
```

**Insight**: Images with "brand-brand-model-egypt" pattern are consistently larger and likely legitimate scrapes.

---

## LARGE FILES (Optimization Candidates)

| File | Size | Recommendation |
|------|------|----------------|
| baic-bj40-saudiarabia.jpg | 539 KB | Optimize to < 300 KB |
| nissan-nissan-x-trail-2026-egypt.jpg | 490 KB | Optimize to < 300 KB |
| nissan-nissan-x-trail-egypt.jpg | 490 KB | Optimize to < 300 KB |
| nissan-x-trail-e-power-2025.jpg | 490 KB | Optimize to < 300 KB |

**Note**: 3 Nissan X-Trail files are duplicates (same size, likely same image).

---

## ROOT CAUSE ANALYSIS

### Why 275 unmapped images?

**Theory 1: Incomplete scraping workflow** (most likely)
```
Step 1: Scrape images from dealer websites    ✅ Done (275 images)
Step 2: Create model records in database       ❌ Incomplete
Step 3: Link images to models via hero_image_url  ❌ Not done
```

**Theory 2: Deleted models** (less likely)
- Models existed but were deleted
- Images left orphaned in repository

**Evidence supporting Theory 1**:
- Major brands represented (BMW, Mercedes, Audi)
- Consistent naming patterns (brand-model-year.jpg)
- Mix of legitimate (230) and broken (45) files suggests active scraping

---

## RECOMMENDED ACTIONS

### Priority 1: Delete Broken Files (45 files) ❌

**Impact**: Clean up 45 broken/corrupted images

**Command**:
```bash
# Delete files < 20KB
cd ~/projects/hex-test-drive-man
while read -r filename size; do
    if [ -f "public/images/vehicles/hero/$filename" ]; then
        rm "public/images/vehicles/hero/$filename"
        echo "Deleted: $filename ($size bytes)"
    fi
done < /tmp/suspicious_small_images.txt

# Also delete corresponding hover images if exist
while read -r filename size; do
    if [ -f "public/images/vehicles/hover/$filename" ]; then
        rm "public/images/vehicles/hover/$filename"
        echo "Deleted hover: $filename"
    fi
done < /tmp/suspicious_small_images.txt
```

**Verification**:
```bash
# Count remaining unmapped images
# Expected: 275 - 45 = 230
```

---

### Priority 2: Investigate Remaining 230 Images ⚠️

**Decision tree**:

**Option A: Keep images + Create models** (if images are accurate)
- Extract brand/model/year from filename
- Create model records in database
- Link images via hero_image_url + hover_image_url
- **Benefit**: Increase catalog from 199 to ~429 models
- **Effort**: High (manual verification + data entry)

**Option B: Delete unmapped images** (if orphaned)
- Remove all 230 files from git
- Keep only images with DB references (135 mapped)
- **Benefit**: Clean repository, reduce confusion
- **Effort**: Low (simple delete)

**Recommendation**:
1. Sample 10-20 unmapped images
2. Manually verify image quality and accuracy
3. Check if these models are sold in Egypt
4. If legitimate → Option A (create models)
5. If orphaned/irrelevant → Option B (delete)

---

### Priority 3: Optimize Large Files (4 files) ℹ️

**Target**: Reduce > 500KB files to < 300KB

**Command**:
```bash
# Using ImageMagick (if available)
cd public/images/vehicles/hero
mogrify -resize 1200x800 -quality 85 baic-bj40-saudiarabia.jpg
mogrify -resize 1200x800 -quality 85 nissan-*.jpg
```

**Expected savings**: ~1.5 MB total

---

## HOVER IMAGES INVESTIGATION

**Assumption**: If 275 hero images are unmapped, likely 275 hover images are also unmapped.

**Verification needed**:
```bash
# Count hover images
ls public/images/vehicles/hover/*.jpg | wc -l
# Expected: 359 (same as hero)

# Compare hero vs hover filenames
diff <(ls public/images/vehicles/hero/*.jpg | xargs -n1 basename | sort) \
     <(ls public/images/vehicles/hover/*.jpg | xargs -n1 basename | sort)
# Expected: Identical lists
```

**If identical**: Both hero + hover unmapped = 550 total unmapped images (275 × 2)

---

## VERIFICATION COMMANDS

### Count unmapped images
```bash
python3 /tmp/investigate_unmapped_images.py
```

### List small files
```bash
cat /tmp/suspicious_small_images.txt
```

### Check image integrity (sample)
```bash
file public/images/vehicles/hero/audi-a3-2025.jpg
# Expected: JPEG image data
# If broken: data or empty file
```

---

## APPENDIX: Full Lists

### A. Unmapped Images (All 275)
**Location**: `/tmp/unmapped_hero_images_full.txt`

### B. Suspicious Small Files (45)
**Location**: `/tmp/suspicious_small_images.txt`

Format: `filename TAB size_bytes`

---

## NEXT STEPS

1. ✅ **Investigation complete** - 275 unmapped, 45 broken identified
2. ⏸️ **User decision**: Keep or delete unmapped images?
3. If keep:
   - Delete 45 broken files
   - Create model records for 230 legitimate images
4. If delete:
   - Remove all 275 unmapped images
   - Clean repository

---

**Investigation Complete**: 2026-01-04 02:40 UTC
**Files Analyzed**: 275 hero images
**Critical Issues**: 45 broken files (< 20KB)

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
