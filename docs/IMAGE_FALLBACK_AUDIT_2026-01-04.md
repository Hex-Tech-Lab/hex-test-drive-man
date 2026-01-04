# Image Fallback Comprehensive Audit

**Date**: 2026-01-04 01:15 UTC (03:15 EET)
**Auditor**: CC (Claude Code)
**Scope**: All vehicle image rendering paths in production codebase
**Trigger**: User report of grey placeholders persisting after PR #25 deployment

---

## Executive Summary

**Finding**: PR #25 fixed catalog page but **missed compare page** - production still has grey placeholders on `/compare` route.

**Impact**:
- ✅ `/catalog` (main): FIXED - uses local placeholder.webp
- ❌ `/compare`: BROKEN - uses via.placeholder.com with text "No+Image"
- ✅ `/bookings/*`: No vehicle images used
- ✅ `/` (homepage): No vehicle images used

**Recommendation**: Fix compare page + add ESLint rule to prevent future regressions.

---

## Audit Methodology

### Search Patterns
```bash
# 1. All CardMedia usages
grep -r "CardMedia" --include="*.tsx" src/

# 2. All hero_image_url references
grep -r "hero_image_url" --include="*.tsx" src/

# 3. All hover_image_url references
grep -r "hover_image_url" --include="*.tsx" src/

# 4. All <img> tags
grep -r "<img" --include="*.tsx" src/

# 5. All next/image Image imports
grep -r "from 'next/image'" --include="*.tsx" src/
```

### Results
| Pattern | Count | Files |
|---------|-------|-------|
| CardMedia | 4 | 2 files (2 imports, 2 usages) |
| hero_image_url | 5 | 4 files |
| hover_image_url | 2 | 2 files |
| `<img>` tags | 0 | - |
| next/image | 0 | - |

---

## Detailed Findings

### 1. VehicleCard Component ✅ FIXED

**File**: `src/components/VehicleCard.tsx:205-220`

**Status**: ✅ **CORRECT** (fixed by PR #25)

**Implementation**:
```typescript
import { getVehicleImage, getVehicleImageSrcSet, getPlaceholderSrcSet } from '@/lib/imageHelper';

<CardMedia
  component="img"
  height="200"
  image={getVehicleImage(vehicle.models.hero_image_url)}
  srcSet={getVehicleImageSrcSet(vehicle.models.hero_image_url)}
  alt={displayTitle}
  sx={{ objectFit: 'cover', objectPosition: 'center 85%' }}
  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img.src.includes('/images/vehicles/hero/placeholder')) {
      img.src = '/images/vehicles/hero/placeholder.webp';
      img.srcset = getPlaceholderSrcSet();
    }
  }}
/>
```

**Features**:
- ✅ Uses `getVehicleImage()` helper (fallback logic)
- ✅ Uses `srcSet` for retina support (placeholder trio only)
- ✅ Has `onError` handler with infinite loop prevention
- ✅ Uses local CDN placeholder (`/images/vehicles/hero/placeholder.webp`)

**Used by**: Catalog page (`/catalog`)

---

### 2. Compare Page ❌ BROKEN

**File**: `src/app/[locale]/compare/page.tsx:109-114`

**Status**: ❌ **BROKEN** (not fixed by PR #25)

**Current implementation**:
```typescript
// ❌ NO IMPORT of image helpers

<CardMedia
  component="img"
  height="200"
  image={vehicle.models.hero_image_url || 'https://via.placeholder.com/800x600?text=No+Image'}
  alt={`${vehicle.models.brands.name} ${vehicle.models.name}`}
/>
```

**Issues**:
1. ❌ Uses `via.placeholder.com` external service (grey box with "No Image" text)
2. ❌ No `getVehicleImage()` helper (missing fallback logic)
3. ❌ No `srcSet` attribute (no retina support)
4. ❌ No `onError` handler (can't recover from 404/CORS)
5. ❌ External dependency (via.placeholder.com could go down)

**Impact**:
- User sees **grey placeholder with text "No+Image"** on compare page
- Inconsistent UX (catalog shows local placeholder, compare shows grey text)
- External dependency risk

**Used by**: Compare page (`/compare`)

---

### 3. Type Definitions ℹ️ INFO ONLY

**File**: `src/types/vehicle.ts:9-10`

**Code**:
```typescript
export interface Model {
  id: string;
  name: string;
  hero_image_url: string | null;  // ← Allows null
  hover_image_url: string | null; // ← Allows null
  brands: Brand;
}
```

**Status**: ℹ️ Informational (correct design, allows null)

---

### 4. Repository Layer ℹ️ INFO ONLY

**File**: `src/repositories/vehicleRepository.ts:32-33`

**Code**:
```typescript
const { data, error } = await supabase
  .from('vehicle_trims')
  .select(`
    *,
    models!inner(
      id,
      name,
      hero_image_url,  // ← Selected from DB
      hover_image_url, // ← Selected from DB
      brands!inner(...)
    )
  `)
```

**Status**: ℹ️ Informational (data layer, no rendering logic)

---

### 5. Other Pages (No Issues Found)

#### Homepage (`src/app/[locale]/page.tsx`)
- ✅ No vehicle images rendered
- ✅ No CardMedia usage

#### Booking Pages
- `src/app/en/bookings/new/page.tsx` - ✅ No images
- `src/app/[locale]/bookings/[id]/confirmed/page.tsx` - ✅ No images
- `src/app/[locale]/bookings/[id]/verify/page.tsx` - ✅ No images

---

## Risk Assessment

### Current Production State

| Page | Grey Placeholders? | User Impact | Severity |
|------|-------------------|-------------|----------|
| `/catalog` | ❌ No | None - working correctly | - |
| `/compare` | ✅ **YES** | **High** - compares broken | 🔴 **CRITICAL** |
| `/bookings/*` | N/A | None - no images used | - |
| `/` (home) | N/A | None - no images used | - |

### User Impact

**Affected user flow**:
1. User browses catalog (works fine ✅)
2. User adds 2-3 vehicles to compare
3. User navigates to `/compare` page
4. **User sees grey "No+Image" boxes** ❌ (broken UX)

**Business impact**:
- Compare feature is core to "test drive booking" value prop
- Grey placeholders erode trust in platform quality
- Users may abandon booking flow

---

## Recommended Fix

### Immediate (PR #26)

**File to fix**: `src/app/[locale]/compare/page.tsx`

**Changes required**:

1. Add import:
```typescript
import { getVehicleImage, getVehicleImageSrcSet, getPlaceholderSrcSet } from '@/lib/imageHelper';
```

2. Replace CardMedia (lines 109-114):
```typescript
<CardMedia
  component="img"
  height="200"
  image={getVehicleImage(vehicle.models.hero_image_url)}
  srcSet={getVehicleImageSrcSet(vehicle.models.hero_image_url)}
  alt={`${vehicle.models.brands.name} ${vehicle.models.name}`}
  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img.src.includes('/images/vehicles/hero/placeholder')) {
      img.src = '/images/vehicles/hero/placeholder.webp';
      img.srcset = getPlaceholderSrcSet();
    }
  }}
/>
```

**Testing checklist**:
- [ ] Compare page shows local placeholder for missing images
- [ ] No grey "No+Image" boxes
- [ ] Retina displays load @2x/@3x variants for placeholder only
- [ ] onError handler prevents infinite loops
- [ ] No 404s in Network tab

---

### Preventive (ESLint Rule)

**Objective**: Prevent direct usage of `hero_image_url` / `hover_image_url` without helper

**Rule location**: `.eslintrc.js`

**Proposed rule**:
```javascript
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "Literal[value=/hero_image_url|hover_image_url/]",
        "message": "Use getVehicleImage() helper instead of direct image URL access"
      },
      {
        "selector": "Literal[value=/via\\.placeholder\\.com/]",
        "message": "Use local placeholder image instead of external via.placeholder.com"
      }
    ]
  }
}
```

**Benefits**:
- CI will catch future violations
- Forces developers to use centralized helper
- Prevents regression of PR #25

---

## Appendix A: Search Commands Used

```bash
# Complete audit trail
cd /home/kellyb_dev/projects/hex-test-drive-man

# 1. Count CardMedia usages
grep -r "CardMedia" --include="*.tsx" src/ | wc -l
# Result: 4

# 2. Count hero_image_url references
grep -r "hero_image_url" --include="*.tsx" --include="*.ts" src/ | wc -l
# Result: 5

# 3. Count hover_image_url references
grep -r "hover_image_url" --include="*.tsx" --include="*.ts" src/ | wc -l
# Result: 2

# 4. Find all CardMedia with context
grep -r -n -B2 -A2 "CardMedia" --include="*.tsx" src/

# 5. Find all hero_image_url direct usage
grep -r -n "hero_image_url" --include="*.tsx" src/

# 6. Check booking pages
grep -l "image\|CardMedia" src/app/en/bookings/new/page.tsx \
  src/app/\[locale\]/bookings/\[id\]/confirmed/page.tsx \
  src/app/\[locale\]/bookings/\[id\]/verify/page.tsx
# Result: No matches
```

---

## Appendix B: Related Documents

- **PR #25**: https://github.com/Hex-Tech-Lab/hex-test-drive-man/pull/25
- **Performance Log**: `docs/PERFORMANCE_LOG_2026-01-03_CARD_FALLBACK_FIX.md`
- **Image Helper**: `src/lib/imageHelper.ts` (getVehicleImage, getVehicleImageSrcSet, getPlaceholderSrcSet)
- **Placeholder Assets**: `/public/images/vehicles/hero/placeholder{@2x,@3x}.webp` (3 files, verified HTTP 200)

---

**Audit Complete**
**Status**: Ready for PR #26 (compare page fix + ESLint rule)
**ETA**: 15 minutes (5 min code + 5 min test + 5 min PR)

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
