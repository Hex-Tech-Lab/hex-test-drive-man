# Vehicle Image Mapping Report

**Generated**: 2025-12-18 16:20 EET
**Script**: `scripts/generate_image_updates.py`
**SQL Output**: `scripts/update_image_urls.sql`

---

## Summary

Successfully generated SQL UPDATE statements to map vehicle images from GC's extraction to database models.

### Statistics

| Category | Count |
|----------|-------|
| **Hero Images** | 75 total |
| Hero Matched | 71 |
| Hero Unmatched | 36 |
| **Hover Images** | 60 total |
| Hover Matched | 58 |
| Hover Unmatched | 28 |
| **SQL Statements** | 129 total |

### Files Generated

- **`scripts/update_image_urls.sql`** (8.0 KB)
  - Clean SQL with 129 UPDATE statements
  - Ready to execute via psql or Supabase Dashboard
  - Wrapped in BEGIN/COMMIT transaction

- **`/tmp/image_mapping_warnings.txt`** (6.6 KB)
  - Warnings for unmatched images
  - Multiple match notifications
  - 40 images with no database match

---

## Matching Strategy

The script uses fuzzy matching with the following logic:

### 1. Filename Parsing
Extracts brand, model, year from filename:
- `Audi-q3-2025.jpg` → Brand: Audi, Model: q3, Year: 2025
- `BMW-x5-lci-2024.jpg` → Brand: BMW, Model: x5 lci, Year: 2024
- `Chery-tiggo-4-pro-2025.jpg` → Brand: Chery, Model: tiggo 4 pro, Year: 2025

### 2. Brand Normalization
Handles common variations:
- Mercedes/Mercedes-benz → Mercedes-Benz
- Bmw → BMW
- Vw → Volkswagen

### 3. Model Matching
Two-stage fuzzy matching:
- **Exact match**: Normalized model name equals database name
- **Partial match**: Model name contains search term or vice versa
- **LCI/Facelift removal**: Strips suffixes for better matching

### 4. Multiple Match Handling
When one image matches multiple model years:
- All matches get the same image URL
- Useful for carry-over models (e.g., 2024/2025 same design)

---

## Unmatched Images (40 total)

### BMW Models
- BMW-5-series-i5-2025.jpg (electric 5 Series)
- BMW-x1-ix1-2025.jpg (iX1 electric)
- BMW-x2-ix2-2024.jpg (iX2 electric)

**Reason**: Database may use "i5", "iX1", "iX2" naming without "5 series" prefix

### Hyundai Models
- Hyundai-bayon-2024.jpg
- Hyundai-bayon-2025.jpg
- Hyundai-i10-2024.jpg
- Hyundai-i20-2024.jpg
- Hyundai-i20-2025.jpg

**Reason**: Models not in database or different naming

### Kia Models
- Kia-seltos-2025.jpg
- Kia-sorento-2024.jpg
- Kia-xceed-2024.jpg

**Reason**: Models not in database

### MG Models
- MG-mg-4-ev-2024.jpg
- MG-mg-4-ev-2025.jpg

**Reason**: MG 4 EV not in database

### Mitsubishi Models
- Mitsubishi-accessories-2025.jpg
- Mitsubishi-mirage-2024.jpg
- Mitsubishi-mirage-2025.jpg

**Reason**: Accessories not a model, Mirage not in database

### Nissan Models
- Nissan-juke-2025.jpg
- Nissan-patrol-2025.jpg
- Nissan-qashqai-2025.jpg
- Nissan-sentra-2024-25.jpg
- Nissan-urvan-2025.jpg
- Nissan-x-trail-e-power-2025.jpg

**Reason**: Models not in database or different naming (e-POWER variant)

### Toyota Models
- Toyota-belta-2024.jpg

**Reason**: Belta not in database (rebadged Yaris sedan in some markets)

### Chevrolet
- Chevrolet-move-van-2024.jpg

**Reason**: Move Van not in database

### Chery
- Chery-eq7-ev-2025.jpg

**Reason**: EQ7 EV not in database

---

## Multiple Matches (Common Cases)

### Year Carry-Over Models
Many models span 2024-2026 with same design:
- Audi Q3: Matches Q3 2025 AND Q3 2026
- BMW X5 LCI: Matches X5 2024 AND X5 2025
- Chery Arrizo 5: Matches all three years (2024/2025/2026)

**Action**: Image applied to all matching years (correct behavior)

### Model Variants
Some images match base + variant models:
- MG-hs-2024.jpg → Matches "MG HS" and "MG HS Luxury"
- MG-rx5-2025.jpg → Matches "MG RX5 Plus 2025" and "RX5 Plus 2026"

**Action**: Base image shared across variants (acceptable for hero/hover images)

---

## How to Execute SQL

### Option 1: psql Command Line
```bash
# Source credentials
source scripts/supabase_helper.sh

# Execute SQL
psql "$SUPABASE_URL" < scripts/update_image_urls.sql
```

### Option 2: Supabase Dashboard
1. Open: https://supabase.com/dashboard/project/lbttmhwckcrfdymwyuhn/editor
2. Click "SQL Editor"
3. Copy contents of `scripts/update_image_urls.sql`
4. Click "Run"

### Option 3: curl (REST API)
```bash
# For each UPDATE statement, convert to REST API call
# Example:
curl -X PATCH "$SUPABASE_URL/rest/v1/models?id=eq.42fbd3d1-fe4d-4e2d-a8b7-fd15eea38619" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"hero_image_url": "/images/vehicles/hero/Audi-q3-2025.jpg"}'
```

---

## Verification After Execution

### Check Updated Models
```sql
-- Count models with hero images
SELECT COUNT(*) FROM models WHERE hero_image_url IS NOT NULL;

-- Count models with hover images
SELECT COUNT(*) FROM models WHERE hover_image_url IS NOT NULL;

-- Sample updated models
SELECT name, hero_image_url, hover_image_url
FROM models
WHERE hero_image_url LIKE '/images/vehicles/%'
ORDER BY name
LIMIT 10;
```

### Expected Results
- Before: Most models have NULL or placeholder image URLs
- After: 71+ models with hero images, 58+ models with hover images
- Total: 129 fields updated across database

---

## Next Steps

1. **Execute SQL** (5 min)
   - Run via Supabase Dashboard or psql
   - Verify 129 rows affected

2. **Verify Frontend** (5 min)
   - Visit catalog: http://localhost:3000
   - Check if hero images display
   - Test hover effect on cards

3. **Handle Unmatched Images** (Optional, 15 min)
   - Review 40 unmatched images in warnings file
   - Add missing models to database
   - Update SQL script with manual mappings
   - Re-run for complete coverage

4. **Commit SQL** (2 min)
   ```bash
   git add scripts/update_image_urls.sql
   git add scripts/generate_image_updates.py
   git add scripts/run_image_mapping.sh
   git commit -m "feat(images): generate SQL mapping for 152 vehicle images

   - Script maps hero/hover images to database models
   - 129 UPDATE statements generated
   - 71 hero + 58 hover images matched
   - Fuzzy matching with brand/model/year parsing"
   ```

---

## Troubleshooting

### Issue: SQL Errors on Execution
**Cause**: Model IDs changed or records deleted
**Fix**: Regenerate SQL script with latest database state

### Issue: Images Not Displaying
**Cause**: Next.js public folder not serving images
**Fix**: Verify images exist in `public/images/vehicles/hero/*.jpg`

### Issue: Too Many Multiple Matches
**Cause**: Model naming inconsistency
**Fix**: Refine normalization rules in `normalize_model_name()` function

### Issue: Missing Models in Database
**Cause**: Images extracted for models not yet in database
**Fix**: Add models via admin interface or SQL INSERT, then regenerate mapping

---

**End of Report**
