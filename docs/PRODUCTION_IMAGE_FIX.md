# PRODUCTION IMAGE FIX - CRITICAL

**Status**: 🚨 PRODUCTION BROKEN - No images showing on getmytestdrive.com
**Root Causes Identified**: ✅ Complete diagnosis
**Fixes Applied**: ⚙️ Code fix committed, DB update pending

---

## ROOT CAUSE ANALYSIS

### Problem 1: imageHelper.ts Bug (FIXED ✅)
**File**: `src/lib/imageHelper.ts`
**Issue**: Function rejected ALL relative paths

**Before** (Broken):
```typescript
try {
  new URL(imageUrl);  // ❌ FAILS for "/images/hero/x.jpg"
  return imageUrl;
} catch {
  return PLACEHOLDER_IMAGE;  // Returns placeholder for EVERYTHING!
}
```

**After** (Fixed in commit bb08b46):
```typescript
// Accept both relative paths and absolute URLs
if (imageUrl.startsWith('/') || imageUrl.startsWith('http')) {
  return imageUrl;  // ✅ Works for relative + absolute
}
```

### Problem 2: Database Has OLD Paths (PENDING ⏳)
**Tables**: `models.hero_image_url`, `models.hover_image_url`
**Current Values**: `/cars/suzuki_swift.jpg` (files DON'T exist)
**Required Values**: `/images/vehicles/hero/Audi-q3-2025.jpg` (files DO exist)

**SQL Script Ready**: `scripts/update_image_urls.sql` (135 UPDATE statements)

### Problem 3: Images Deployed? (VERIFY ✅)
**Local**: 135 images exist in `public/images/vehicles/hero/*.jpg` and `hover/*.jpg`
**Git**: ✅ Images committed to repository
**Vercel**: ⏳ Need to verify deployment includes images

---

## IMMEDIATE FIX STEPS (15 min)

### Step 1: Execute SQL Updates (5 min) - MANUAL REQUIRED

**Supabase SQL Editor** (Recommended):
1. Open: https://supabase.com/dashboard/project/lbttmhwckcrfdymwyuhn/sql
2. Click "New Query"
3. Open local file: `scripts/update_image_urls.sql`
4. Copy entire contents (BEGIN to COMMIT)
5. Paste into SQL Editor
6. Click "Run" button
7. Wait for "Success" message

**Expected Result**:
```
SUCCESS
Rows affected: 129 rows
```

**Verification Query** (run after):
```sql
SELECT COUNT(*) FROM models WHERE hero_image_url LIKE '/images/vehicles/hero/%';
SELECT COUNT(*) FROM models WHERE hover_image_url LIKE '/images/vehicles/hover/%';
```

**Expected Counts**:
- Hero images: 70+ models
- Hover images: 50+ models

### Step 2: Trigger Vercel Deployment (2 min)

**Option A: Auto-deploy** (if GitHub Actions enabled):
```bash
git push origin main  # Already pushed commit bb08b46
```

**Option B: Manual deploy**:
1. Open: https://vercel.com/hex-tech-lab/hex-test-drive-man
2. Click "Deployments"
3. Click "Redeploy" on latest commit
4. Select "Use existing Build Cache: No"
5. Click "Redeploy"

### Step 3: Verify Production (3 min)

1. **Clear Browser Cache**: Ctrl+Shift+R (hard refresh)
2. **Visit**: https://getmytestdrive.com
3. **Check**:
   - ✅ Vehicle cards show car images (not placeholder)
   - ✅ Browser console has NO 404 errors
   - ✅ Images load quickly (< 2s)
   - ✅ Mobile viewport works

4. **Console Check**:
   - Press F12 → Console tab
   - Look for: `GET /images/vehicles/hero/...` requests
   - Status should be: **200 OK** (not 404)

5. **Sample URLs to test**:
   ```
   https://getmytestdrive.com/images/vehicles/hero/Audi-q3-2025.jpg
   https://getmytestdrive.com/images/vehicles/hero/BMW-x5-lci-2024.jpg
   https://getmytestdrive.com/images/vehicles/hero/Toyota-corolla-2025.jpg
   ```

---

## VERIFICATION CHECKLIST

### Before SQL Update:
- [x] imageHelper.ts accepts relative paths (commit bb08b46)
- [x] 135 images exist locally in public/images/vehicles/
- [x] SQL script generated with 135 UPDATE statements
- [ ] SQL executed in Supabase
- [ ] Database updated with new paths

### After SQL Update:
- [ ] 70+ models have hero_image_url = /images/vehicles/hero/*
- [ ] 50+ models have hover_image_url = /images/vehicles/hover/*
- [ ] Old /cars/* paths replaced
- [ ] NULL values updated

### After Vercel Deploy:
- [ ] Production site shows vehicle images
- [ ] No 404 errors in console
- [ ] Images load in < 2s
- [ ] Mobile responsive images work
- [ ] Placeholder only shows for models without images

---

## ROLLBACK PLAN (if issues occur)

### If SQL Update Fails:
```sql
-- Rollback transaction (if still in session)
ROLLBACK;

-- Or restore old paths
UPDATE models SET hero_image_url = '/cars/' || LOWER(name) || '.jpg'
WHERE hero_image_url LIKE '/images/vehicles/%';
```

### If Deployment Breaks Site:
1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." menu → "Promote to Production"

### If Images Still Don't Show:
Check Vercel build logs for image optimization errors:
```bash
vercel logs --follow
```

---

## FILES CHANGED

### Committed (Ready):
- `src/lib/imageHelper.ts` - Fixed relative path handling
- `scripts/update_image_urls.sql` - 135 SQL UPDATE statements
- `scripts/apply_image_updates.py` - Automated updater (optional)
- `scripts/execute_image_updates.sh` - Execution helper
- `docs/PRODUCTION_IMAGE_FIX.md` - This document

### Database Tables (Pending Update):
- `models.hero_image_url` - 135 rows to update
- `models.hover_image_url` - 135 rows to update

### Vercel Deployment:
- `public/images/vehicles/hero/*.jpg` - 75 files
- `public/images/vehicles/hover/*.jpg` - 60 files

---

## TECHNICAL DETAILS

### Image Path Format:
```
OLD: /cars/suzuki_swift.jpg (doesn't exist)
NEW: /images/vehicles/hero/Audi-q3-2025.jpg (exists)
```

### SQL Update Logic:
```sql
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Audi-q3-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = 'audi')
  AND LOWER(name) LIKE '%q3%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');
```

### Next.js Image Component:
```tsx
<CardMedia
  component="img"
  image={getVehicleImage(vehicle.models.hero_image_url)}
  // getVehicleImage() now accepts relative paths ✅
/>
```

---

## SUCCESS CRITERIA

✅ **DONE** when ALL of these are true:
1. Supabase database has 70+ models with `/images/vehicles/hero/*` paths
2. Production site (getmytestdrive.com) shows vehicle images
3. Browser console has ZERO 404 errors for images
4. Page Load Performance: LCP < 3 seconds
5. Mobile images render correctly

---

## TIMELINE

- **Diagnosis**: 10 min ✅ (completed)
- **Code Fix**: 5 min ✅ (commit bb08b46)
- **SQL Execution**: 5 min ⏳ (manual required)
- **Deployment**: 2-3 min ⏳ (auto or manual)
- **Verification**: 3 min ⏳ (after deploy)
- **Total**: ~25 min

---

**Last Updated**: 2025-12-18 16:45 EET
**Agent**: CC (Claude Code)
**Status**: Code fixed, awaiting SQL execution + deployment
