# Hero Images Gap Analysis

**Date**: 2025-12-21
**Investigator**: CCW
**Database**: Supabase PostgreSQL (lbttmhwckcrfdymwyuhn)
**Status**: 🔴 CRITICAL GAP - 52.8% Missing

---

## Executive Summary

**Current Coverage**: 47.2% (94/199 models)
**Missing**: 105 models without hero_image_url
**Old Placeholders**: 12 models with /cars/ path
**Total Gap**: 117 models need images (58.8%)

**Target**: 100% (199/199 models)
**Work Required**: Source and upload 117 hero images

---

## Database Statistics

### Overall Status
```sql
Total Models:           199
With Hero Images:        94 (47.2%)
NULL hero_image_url:   105 (52.8%)
Old /cars/ paths:       12 (6.0%)
Ready for Production:   82 (41.2%)
```

### Brand Breakdown

| Brand | Total Models | Missing | Coverage |
|-------|--------------|---------|----------|
| Audi | 18 | 18 | 0% ❌ |
| BMW | 8 | 8 | 0% ❌ |
| HAVAL | 10 | 10 | 0% ❌ |
| Suzuki | 8 | 8 | 0% ❌ |
| Peugeot | 9 | 9 | 0% ❌ |
| Skoda | 7 | 7 | 0% ❌ |
| Changan | 8 | 8 | 0% ❌ |
| Volkswagen | 6 | 6 | 0% ❌ |
| Toyota | 5 | 5 | 0% ❌ |
| Renault | 5 | 5 | 0% ❌ |
| GAC | 5 | 5 | 0% ❌ |
| Cupra | 5 | 5 | 0% ❌ |
| Fiat | 3 | 3 | 0% ❌ |
| BYD | 3 | 3 | 0% ❌ |
| BAIC | 3 | 3 | 0% ❌ |
| Jeep | 1 | 1 | 0% ❌ |

**Critical**: 16 brands have 0% coverage!

---

## Missing Models CSV

**File**: `docs/missing_hero_images.csv`
**Format**: `brand,model,model_id`
**Count**: 105 models

**Sample**:
```csv
brand,model,model_id
Toyota,Fortuner 2026,ffd53327-52b1-4b96-94bb-da0971939b8f
Toyota,Fortuner 2025,b462d521-964e-430e-810f-77f73283a3ef
BMW,320i 2024,ca63ca27-6308-4b01-804d-a60d2219c4fc
Audi,A5 2025,c732daa3-5f38-401b-942c-66d721693b91
...
```

**Usage**: Feed this CSV to automated image download script

---

## Root Cause Analysis

### Why 58.8% Missing?

1. **Recent Database Expansion**: Models added without images
2. **Multi-Year Models**: 2024, 2025, 2026 variants need separate images
3. **New Brands**: Cupra, GAC, BAIC recently added
4. **Premium Brands**: Audi (18 missing), BMW (8 missing) not prioritized

### Previous Image Work

**Dec 18, 2025 Session** (GC):
- Downloaded 218 images (109 hero + 109 hover)
- Covered 15 brands, 152 models targeted
- **Gap**: Only 109 models imaged (43 models failed)
- **Issue**: Database URLs NOT updated after download

**Result**: Images exist locally but DB still points to old paths or NULL

---

## Image Sourcing Strategy

### Automated Approach (Recommended)

**Option 1: Unsplash API** (Used in Dec 18 session)
```bash
#!/bin/bash
# For each model in CSV:
curl "https://api.unsplash.com/search/photos?query=BMW+320i+2024&per_page=1" \
  -H "Authorization: Client-ID YOUR_ACCESS_KEY" | \
  jq -r '.results[0].urls.regular' | \
  xargs wget -O "public/images/vehicles/hero/bmw-320i-2024.jpg"
```

**Pros**: Fast, high-quality stock photos
**Cons**: Not always exact model match, may show wrong year

**Option 2: Manufacturer Websites** (Scraping)
```bash
# Example: BMW USA
curl "https://www.bmwusa.com/vehicles/3-series/sedan/overview.html" | \
  grep -oP 'hero-image.*?src="\K[^"]+' | \
  wget -O "public/images/vehicles/hero/bmw-320i-2024.jpg"
```

**Pros**: Exact official images
**Cons**: Requires brand-specific scraping logic, may violate ToS

**Option 3: Imagemarker.com / Similar Services**
- Paid stock photo service
- Automotive-specific
- Exact model/year matching

### Manual Approach

**For 105 models @ 2 min/model**: ~3.5 hours
1. Search Google Images: "{Brand} {Model} {Year}"
2. Download highest quality image
3. Save to `public/images/vehicles/hero/{brand}-{model}-{year}.jpg`
4. Repeat 105 times

---

## Image Naming Convention

**Format**: `{brand}-{model}-{year}.jpg`
**Examples**:
- `bmw-320i-2024.jpg`
- `audi-a5-2025.jpg`
- `toyota-fortuner-2026.jpg`

**Rules**:
- Lowercase brand and model
- Hyphens for spaces
- Year as-is (4 digits)
- JPEG format
- Minimum 800x600px
- Target file size: 100-200KB

**Storage Path**: `public/images/vehicles/hero/`

---

## Database Update Strategy

### Step 1: Generate SQL UPDATEs

```bash
#!/bin/bash
# For each model in CSV:
while IFS=, read -r brand model model_id; do
  # Skip header
  [ "$brand" = "brand" ] && continue

  # Generate filename
  filename=$(echo "$brand-$model" | tr 'A-Z ' 'a-z-' | tr -d '[:punct:]').jpg

  # Generate SQL
  echo "UPDATE models SET hero_image_url = '/images/vehicles/hero/$filename' WHERE id = '$model_id';"
done < docs/missing_hero_images.csv > /tmp/hero_images_update.sql
```

### Step 2: Execute SQL

```bash
# Via Supabase REST API
SUPABASE_URL="https://lbttmhwckcrfdymwyuhn.supabase.co"
SERVICE_ROLE_KEY="your-service-role-key"

# Execute each UPDATE statement
psql "$SUPABASE_URL" < /tmp/hero_images_update.sql

# OR via curl (for each UPDATE):
curl -X PATCH "$SUPABASE_URL/rest/v1/models?id=eq.$model_id" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"hero_image_url\":\"/images/vehicles/hero/$filename\"}"
```

### Step 3: Verify 100%

```bash
SUPABASE_ANON_KEY="your-anon-key"

curl -s -H "apikey: $SUPABASE_ANON_KEY" \
  "$SUPABASE_URL/rest/v1/models?select=id,hero_image_url" | \
  jq '[.[] | select(.hero_image_url != null and (.hero_image_url | startswith("/images/")))] | length as $covered | {total: 199, covered: $covered, percentage: (($covered * 100 / 199) | floor)}'

# Expected: {"total":199,"covered":199,"percentage":100}
```

---

## Execution Plan

### Phase 1: Automated Download (2-4 hours)

**Script**: `scripts/download_missing_hero_images.sh`

```bash
#!/bin/bash
# Read CSV, download via Unsplash, save to public/images/vehicles/hero/
# Track successes and failures
# Output: hero_images_download_report.md
```

**Expected Success Rate**: 70-80% (75-84 models)

### Phase 2: Manual Fill Gaps (1-2 hours)

- Review failed downloads from Phase 1
- Manually source images for 21-30 remaining models
- Prioritize: Premium brands (Audi, BMW), Popular models (Fortuner, Prado)

### Phase 3: Database Update (30 min)

1. Generate SQL UPDATE script
2. Execute via Supabase CLI or REST API
3. Verify 100% coverage

### Phase 4: Visual QA (1 hour)

- Browse catalog in production
- Verify all images load correctly
- Check image quality (no pixelation, correct model)
- Replace low-quality images

**Total Time**: 4.5-7.5 hours

---

## Risks & Mitigation

### Risk 1: Image Copyright Issues ⚠️
**Mitigation**: Use royalty-free sources (Unsplash, Pexels) or manufacturer press kits

### Risk 2: Wrong Model Year in Images ⚠️
**Mitigation**: Manual review of automated downloads, replace mismatches

### Risk 3: Large File Sizes (Slow Page Load) ⚠️
**Mitigation**: Compress images to 100-200KB using sharp/imagemagick

### Risk 4: Database Update Failures ⚠️
**Mitigation**: Test UPDATE on 1 model first, verify in production before bulk update

---

## Immediate Next Steps

### Option A: Automated Script (Recommended)
1. Create `scripts/download_missing_hero_images.sh`
2. Integrate Unsplash API
3. Process `docs/missing_hero_images.csv`
4. Generate download report
5. Manual fill gaps
6. Execute database UPDATE

### Option B: Manual Work
1. Open `docs/missing_hero_images.csv`
2. For each model:
   - Google: "{brand} {model} {year} official image"
   - Download best match
   - Save to `public/images/vehicles/hero/`
3. Generate SQL UPDATEs
4. Execute and verify

---

## Success Criteria

✅ **Phase 1 Complete**: 100% models have hero_image_url not null
✅ **Phase 2 Complete**: All images load in production catalog
✅ **Phase 3 Complete**: Image quality meets standards (800x600+, <200KB)
✅ **Phase 4 Complete**: No broken image links, no 404s

**Definition of Done**:
```sql
SELECT COUNT(*) AS total,
       COUNT(hero_image_url) FILTER (WHERE hero_image_url IS NOT NULL) AS covered,
       (COUNT(hero_image_url) FILTER (WHERE hero_image_url IS NOT NULL) * 100.0 / COUNT(*))::int AS percentage
FROM models;

-- Target: {total: 199, covered: 199, percentage: 100}
```

---

## Files Generated

| File | Purpose |
|------|---------|
| `docs/missing_hero_images.csv` | List of 105 models needing images |
| `docs/HERO_IMAGES_GAP_ANALYSIS.md` | This report |
| `scripts/download_missing_hero_images.sh` | Automated download script (pending) |
| `/tmp/hero_images_update.sql` | Generated SQL UPDATEs (pending) |

---

## Recommendations

### For User

**Priority**: 🔴 HIGH - Affects demo visual completeness

**Best Approach**:
1. Use GC agent to create automated download script
2. Leverage Unsplash API (free, high-quality)
3. Manual review and gap-fill
4. Execute database UPDATE via SQL script

**Timeline**: 1 working day (with automation)

**Blockers**: None (all dependencies available)

### For GC Agent

**Task Assignment**:
```bash
# TASK: Complete 100% Hero Image Coverage (GC Vertical)
cd ~/projects/hex-test-drive-man
git checkout -b ccw/complete-hero-images-100pct

# 1) Use docs/missing_hero_images.csv as input
# 2) Create download script using Unsplash API
# 3) Download all 105 images
# 4) Generate SQL UPDATEs
# 5) Execute SQL
# 6) Verify 100% coverage
# 7) Create PR
```

---

**Report Status**: ✅ COMPLETE
**Last Updated**: 2025-12-21 21:30 UTC
**Next Action**: Assign to GC for automated download script creation
