# Action Items - Dec 23, 2025

**Created**: 2025-12-23 00:30 UTC
**Session**: MVP 1.0 Final Stabilization
**Branch**: ccw/final-stabilization-dec23

---

## Critical (Do First)

### 1. **370 vs 409 Vehicle Display Discrepancy**
**Priority**: P0 (Blocking)
**Status**: 🔴 Not Started

**Problem**: Catalog displays 370 vehicles instead of 409 from database
**Investigation**:
- Check: `src/repositories/vehicleRepository.ts` - any filters applied?
- Check: `src/app/[locale]/page.tsx` - client-side filtering logic
- Verify: Database query returns all 409 records
- Look for: Active/published/hidden filters in schema

**Action Steps**:
```bash
# 1. Check repository queries
grep -n "where\|filter\|published\|active" src/repositories/vehicleRepository.ts

# 2. Check page filtering logic
grep -n "filter\|length" src/app/[locale]/page.tsx

# 3. Query database directly
curl -H "apikey: $ANON_KEY" "$SUPABASE_URL/rest/v1/vehicle_trims?select=count"
```

**Expected Outcome**: Identify hidden filter and remove/fix

---

### 2. **Image Audit & Scraping**
**Priority**: P0 (User-facing)
**Status**: 🔴 Not Started

**Problem**: 118 models have missing/incorrect images
**Quality Standard**: **BMW iX1 2024** (perfect example)
- Centered placement
- Proper sizing (fills frame without distortion)
- 3/4 angle pose
- High quality
- Correct aspect ratio (4:3)

**Affected Brands**:
- BYD: Missing images
- BAIC: Missing images
- BMW: Some confused images (wrong models)
- VW: Incomplete coverage

**Action Steps**:
1. Generate missing image list:
   ```bash
   node scripts/audit_vehicle_images.js > docs/missing_images_dec23.csv
   ```

2. Scrape from source (same as BMW iX1):
   - Source: Manufacturer websites or Hatla2ee
   - Resolution: 1200x900 minimum
   - Format: WebP (optimized)

3. Implement intelligent cropping:
   - Center detection algorithm
   - 4:3 aspect ratio enforcement
   - Quality validation (min 800x600)

**Expected Outcome**: All 409 vehicles have quality hero images

---

### 3. **Search Functionality Fix**
**Priority**: P1 (High)
**Status**: 🔴 Not Started

**Problem**: Typing 'p' returns Nissan Sunny (incorrect results)
**Location**: `src/components/FilterPanel.tsx` or `src/app/[locale]/page.tsx`

**Investigation**:
```bash
# Find search logic
grep -n "toLowerCase\|search\|query" src/app/[locale]/page.tsx
grep -n "toLowerCase\|search\|query" src/components/FilterPanel.tsx
```

**Action Steps**:
1. Debug search filter logic (case sensitivity, partial match)
2. Test edge cases (single letter, numbers, Arabic)
3. Add search highlighting for matched terms

**Expected Outcome**: Search returns accurate results for all queries

---

## High Priority

### 4. **Sort Dropdown Implementation**
**Priority**: P1 (UX)
**Status**: 🟡 Planned

**Features**:
- Sort by: Price (Low→High, High→Low), Year (Newest→Oldest), Brand (A-Z), Category
- Persistent selection (localStorage)
- Arabic RTL support

**Location**: Add to `src/components/FilterPanel.tsx` or new `SortDropdown.tsx`

**Estimated Effort**: 1-2 hours

---

### 5. **Grid Size Toggle**
**Priority**: P1 (UX)
**Status**: 🟡 Planned

**Features**:
- Toggle: 3/4/5 columns
- Responsive: Mobile (1 col), Tablet (2-3 cols), Desktop (3-5 cols)
- Persistent selection (localStorage)
- Icon: GridView icons from MUI

**Location**: Add to catalog header in `src/app/[locale]/page.tsx`

**Estimated Effort**: 2-3 hours

---

### 6. **Brand Logo Placeholder**
**Priority**: P2 (Polish)
**Status**: 🟡 Planned

**Requirements**:
- When logo missing: Show brand name initials in circle
- Size: 2-3x current size
- Style: White rounded rectangle background
- Fallback: Automatic if logo_url is null

**Location**: `src/components/BrandLogo.tsx`

**Estimated Effort**: 1 hour

---

### 7. **Accordion Filters**
**Priority**: P2 (UX)
**Status**: 🟡 Planned

**Features**:
- Collapse filter sections (Brands, Categories, Price)
- Default: Brands expanded, others collapsed
- Save screen real estate on mobile
- MUI Accordion component

**Location**: Refactor `src/components/FilterPanel.tsx`

**Estimated Effort**: 2 hours

---

## Medium Priority

### 8. **Price Slider Position Bug**
**Priority**: P2 (Visual)
**Status**: 🔴 Not Started

**Problem**: Slider thumb stuck at 40% when max=3.9M EGP
**Investigation**: MUI Slider calculation with large numbers

**Action Steps**:
1. Test with different max values (1M, 5M, 10M, 20M)
2. Check MUI Slider props (step, scale, marks)
3. Consider logarithmic scale for large ranges

**Expected Outcome**: Slider position accurately reflects price

---

### 9. **Language Reload Fix**
**Priority**: P2 (Performance)
**Status**: 🟡 Planned

**Problem**: Page reloads on language switch (not just locale change)
**Investigation**: Header.tsx language switcher logic

**Action Steps**:
1. Review Next.js i18n routing
2. Check if full page reload necessary
3. Implement soft transition if possible

**Expected Outcome**: Language switch without reload

---

### 10. **Comparison Page Images**
**Priority**: P2 (Feature)
**Status**: 🔴 Not Started

**Problem**: Images not loading on comparison page
**Investigation**: Same logic as catalog (getVehicleImage, onError fallback)

**Action Steps**:
1. Check `src/app/[locale]/compare/page.tsx`
2. Apply same image logic as VehicleCard.tsx
3. Test with 3 vehicles comparison

**Expected Outcome**: Comparison page shows images correctly

---

## Low Priority (Plan for MVP 1.1)

### 11. **One Card Per Model**
**Priority**: P3 (UX Redesign)
**Status**: 🟡 Planned for MVP 1.1

**Features**:
- Single card per model (not per trim)
- Show price range: "From 450K to 1.2M EGP"
- Trim count badge: "5 trims available"
- Expandable accordion for trim comparison

**Estimated Effort**: 4-6 hours (major refactor)

---

### 12. **Enhanced Placeholder Watermark**
**Priority**: P3 (Visual)
**Status**: 🟡 Planned for MVP 1.1

**Features**:
- 80% width watermark (currently 50%)
- 15° slant angle (more dynamic)
- Semi-transparent brand logo overlay
- Higher contrast for visibility

**Location**: Update placeholder.webp generation script

**Estimated Effort**: 1 hour

---

## Reference Quality Standards

### BMW iX1 2024 - Perfect Image Example
- **Placement**: Centered horizontally and vertically
- **Sizing**: Fills frame (~90% coverage)
- **Angle**: 3/4 front view
- **Quality**: High resolution (1200x900+)
- **Background**: Clean, minimal distraction
- **Aspect Ratio**: 4:3 (matches card dimensions)

**Scraping Target**: Replicate this quality for all vehicles

---

## Tracking

**Total Items**: 12
- 🔴 Not Started: 6
- 🟡 Planned: 6
- 🟢 Completed: 0

**Estimated Total Effort**: 15-20 hours
**Target Completion**: Dec 24-25, 2025 (MVP 1.1)

---

**Last Updated**: 2025-12-23 00:30 UTC
**Maintained By**: CC (Claude Code)
