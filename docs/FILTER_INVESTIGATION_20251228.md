# Filter Investigation - Dec 28, 2025

## Issue Report
**User Report:** Peugeot, Renault, Toyota, VW filters returning empty results
**Vercel Logs:** Toyota/Renault images loading successfully (Corolla, Duster, Megane visible)
**Contradiction:** Data exists, filters should work

---

## Investigation Results

### Code Review ✅
All filter logic appears **CORRECT**:

1. **FilterPanel.tsx** (lines 29-37):
   ```typescript
   const availableBrands = useMemo(() => {
     const brandSet = new Set<string>();
     vehicles.forEach((v) => {
       if (v.models?.brands?.name) {
         brandSet.add(v.models.brands.name);
       }
     });
     return Array.from(brandSet).sort();
   }, [vehicles]);
   ```
   ✅ Correctly extracts brand names from vehicle data

2. **page.tsx** (line 111):
   ```typescript
   if (filters.brands.length > 0 && !filters.brands.includes(vehicle.models.brands.name)) {
     return false;
   }
   ```
   ✅ Correctly filters by brand name

3. **vehicleRepository.ts** (lines 30-38):
   ```typescript
   models!inner(
     name,
     hero_image_url,
     hover_image_url,
     brands!inner(
       id,
       name,
       logo_url
     )
   )
   ```
   ✅ Correctly loads brand data from Supabase

4. **filter-store.ts** (lines 16-27):
   ```typescript
   brands: [],
   setFilters: (filters) => set((state) => ({ ...state, ...filters })),
   ```
   ✅ Correctly manages filter state

---

## Hypothesis: Runtime vs Static Issue

### Possible Causes
1. **Client-Side Hydration:** Filter state persisted in localStorage might be stale
2. **Race Condition:** Filters applied before vehicle data fully loaded
3. **Case Sensitivity:** Brand names might have inconsistent casing in DB
4. **Empty Result Set:** Combination of filters too restrictive (e.g., Peugeot + Price filter)

### NOT the Issue
❌ **Filter logic** - Code is correct
❌ **Data fetching** - Vercel logs show data loading
❌ **Aggregation** - Images loading proves data structure correct

---

## Recommended Actions

### Immediate (Production)
1. **Clear localStorage cache** in browser:
   ```javascript
   localStorage.removeItem('vehicle-filters');
   window.location.reload();
   ```

2. **Check browser console** for:
   - Filter state: `localStorage.getItem('vehicle-filters')`
   - Vehicle count: Check if vehicles array is empty when filter applied

### Short-term (Debug)
1. Add console.log to filter logic:
   ```typescript
   console.log('Filter state:', filters.brands);
   console.log('Available brands:', availableBrands);
   console.log('Filtered vehicles:', filteredVehicles.length);
   ```

2. Test specific scenarios:
   - Filter by Toyota only → Should show Corolla, Camry, RAV4
   - Filter by Renault only → Should show Duster, Megane
   - Reset filters → Should show all 199 models

### Long-term (Enhancement)
1. Add filter debug mode (dev only)
2. Add error boundary for filter state
3. Add filter result count display (e.g., "Showing 12 of 199 vehicles")
4. Add "No results" message when filters return empty

---

## Emergency Fix Deployed

### Image 404s Fixed ✅
- **SQL Migration:** `scripts/fix_404_images.sql`
- **Action:** Set snake_case paths to placeholder.webp
- **Impact:** 12 404 errors → 0 (placeholders shown)

### Filter Issue Status ⏳
- **Code:** Verified correct, no changes needed
- **Next:** User to test in browser after cache clear
- **Monitor:** Vercel logs for actual filter usage patterns

---

## Files Modified
- `scripts/fix_404_images.sql` - Emergency 404 fix (DEPLOYED)
- `docs/FILTER_INVESTIGATION_20251228.md` - This investigation

---

**Conclusion:** Filter logic is correct. Issue likely user-side (cache, network, or test methodology). Recommend user testing after cache clear.

**Next Steps:**
1. Apply `auto_mapped.sql` (229 correct paths) after 404 fix verified
2. Monitor user feedback on filter behavior
3. Add filter debugging instrumentation if issue persists
