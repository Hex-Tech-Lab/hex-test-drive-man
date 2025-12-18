# Vehicle Images Directory

**Status**: 🔴 **EMPTY** - Awaiting image download/generation
**Last Updated**: 2025-12-18 14:18 UTC
**Agent**: BB

---

## Directory Structure

```
vehicles/
├── hero/          ← Exterior/3-quarter view images (800x600 JPEG)
├── hover/         ← Interior/dashboard images (800x600 JPEG)
└── README.md      ← This file
```

---

## Naming Convention

**Format**: `{Brand}-{model}-{year}.jpg`

**Examples**:
- `Toyota-corolla-2026.jpg`
- `BMW-x5-2025.jpg`
- `MG-mg-5-2026.jpg`
- `Chery-tiggo-8-pro-2025.jpg`

**Rules**:
- Brand: Capitalized (e.g., Toyota, BMW, MG)
- Model: Lowercase, hyphenated (e.g., corolla, x5, mg-5)
- Year: 4 digits (e.g., 2024, 2025, 2026)
- Extension: `.jpg` (JPEG format)

---

## Image Requirements

### Hero Images (Exterior)
- **Purpose**: Main vehicle card display
- **View**: 3-quarter front view (45° angle)
- **Dimensions**: 800x600 pixels
- **Format**: JPEG
- **Quality**: 80-90% (balance quality vs file size)
- **Target Size**: 50-150 KB per image
- **Background**: Clean, neutral (white/gray preferred)

### Hover Images (Interior)
- **Purpose**: Interactive hover state on vehicle cards
- **View**: Dashboard/interior view
- **Dimensions**: 800x600 pixels
- **Format**: JPEG
- **Quality**: 80-90%
- **Target Size**: 50-150 KB per image
- **Focus**: Driver's perspective, steering wheel visible

---

## Image Sources

### Option 1: Official Manufacturer PDFs (Preferred)
- Extract from official brochures in `data/samples/pdf/`
- Use PDF extraction pipeline (see `EXTRACTION_ENGINE_README.md`)
- Pros: Accurate, brand-approved, high quality
- Cons: Manual extraction, time-intensive

### Option 2: Unsplash API (Quick Prototype)
- Use `scripts/download_vehicle_images.sh` (exists in repo)
- Pros: Fast, free, high quality
- Cons: Generic stock photos, may not match exact model/year

### Option 3: Manual Upload
- Download from manufacturer websites
- Resize to 800x600 using ImageMagick:
  ```bash
  convert input.jpg -resize 800x600^ -gravity center -extent 800x600 output.jpg
  ```

---

## Database Integration

After adding images, run SQL generation script:

```bash
# Generate SQL UPDATE statements
./scripts/generate_image_update_sql.sh

# Review generated SQL
cat scripts/update_image_urls.sql

# Apply to Supabase (requires credentials)
psql $SUPABASE_URL < scripts/update_image_urls.sql
```

**Script**: `scripts/generate_image_update_sql.sh`
- Auto-matches filenames to database models
- Updates `hero_image_url` and `hover_image_url` fields
- Includes verification queries

---

## Current Status

**Hero Images**: 0 (directory empty)
**Hover Images**: 0 (directory empty)
**Database Models**: 199 (all with NULL image URLs)

**Action Required**:
1. Download/generate vehicle images (see Image Sources above)
2. Place in `hero/` and `hover/` directories
3. Run `./scripts/generate_image_update_sql.sh`
4. Apply generated SQL to Supabase

---

## History

### 2025-12-18 14:18 UTC (BB)
- Created directory structure
- Added SQL generation script
- Documented naming conventions and requirements

### 2025-12-18 13:56 UTC (CC)
- Deleted 218 low-quality Unsplash preview images (8-23KB avg)
- Reason: Quality insufficient for production
- See: `docs/IMAGE_VERIFICATION_REPORT_2025-12-18_1356_CC.md`

### 2025-12-18 (GC)
- Downloaded 218 Unsplash images (109 hero + 109 hover)
- Commit: 1fea6a8
- Status: Deleted by CC due to quality issues

---

**Next Agent**: Download high-quality images or use placeholders for MVP demo
