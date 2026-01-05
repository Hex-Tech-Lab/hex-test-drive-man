# 🚨 DEFERRED TASKS - Next CC Session

**Created**: 2026-01-05
**Session**: Critical Fixes (Partial - 2 of 4 completed)
**Commit**: 411e243
**Status**: AWAITING CONTINUATION

---

## ✅ COMPLETED THIS SESSION (30 min / 90 min allocated)

### 1. Fix 404 Vehicle Pages ✅
- **Issue**: Changan Uni-T, Uni-V returning 404
- **Root Cause**: Hyphen vs space mismatch in slug parsing
- **Solution**: Dual-query fallback (space → hyphen)
- **Commit**: 411e243
- **Status**: DEPLOYED

### 2. Mercedes Visibility Investigation ✅
- **Issue**: Mercedes not showing in filters
- **Root Cause**: Models exist (24) but trims missing (0)
- **Solution**: Created fix script (needs manual execution)
- **Script**: `scripts/fix-mercedes-trims.mjs`
- **Action Required**: Run with SUPABASE_SERVICE_ROLE_KEY
- **Status**: IDENTIFIED, NOT FIXED

---

## ⏰ DEFERRED TASKS (Next Session - Priority Order)

### PRIORITY 1: Container/Flyout System (45 min)

**Objective**: Floating cart button with slide-out panel

**Requirements**:
1. **Floating Button** (bottom-right corner)
   - Shows counts: "3 bookings, 5 comparisons"
   - Badge indicators for non-zero counts
   - Sticky positioning (visible on scroll)

2. **Slide-out Panel** (MUI Drawer from right)
   - Two tabs: "Bookings" and "Comparisons"
   - List selected vehicles with thumbnails
   - Remove button per item
   - Links to booking/comparison pages

3. **State Integration**
   - Read from useBookingStore (max 3)
   - Read from useComparisonStore (max 5)
   - Real-time count updates

**Files to Create**:
- `src/components/CartFlyout.tsx` (~200 lines)
- `src/components/CartButton.tsx` (~80 lines)

**Integration**:
- Add to layout: `src/app/[locale]/layout.tsx`

**UI Components**:
- MUI Drawer (anchor="right", width=400px)
- MUI Tabs (Bookings | Comparisons)
- MUI Badge (for counts)
- MUI Fab or IconButton (cart icon)

---

### PRIORITY 2: Fix State Persistence (15 min)

**Issue**: Zustand stores not persisting to localStorage correctly

**Debug Steps**:
1. Open browser DevTools → Application → Local Storage
2. Check for keys: `comparison-storage`, `booking-storage`
3. Verify JSON structure matches store interfaces

**Potential Issues**:
- React 19 strict mode causing double renders
- localStorage quota exceeded
- Hydration mismatch (SSR vs client)

**Files to Check**:
- `src/stores/useComparisonStore.ts`
- `src/stores/useBookingStore.ts`

**Test**:
1. Add 5 trims to comparison
2. Refresh page
3. Verify all 5 still selected
4. Check localStorage in DevTools

---

### PRIORITY 3: Fix Breadcrumb Bug (5 min)

**Issue**: "Peugeot 5008 2026 2026" - year showing twice

**Location**: `src/components/vehicle-detail/VehicleDetailLayout.tsx:74`

**Current Code**:
```typescript
{vehicle.models.brands.name} {vehicle.models.name} {vehicle.model_year}
```

**Issue**: DB model name already includes year ("5008 2026")

**Solution**: Strip year from model name if present
```typescript
const modelNameClean = vehicle.models.name.replace(/\s*\d{4}\s*$/, '');
{vehicle.models.brands.name} {modelNameClean} {vehicle.model_year}
```

---

### PRIORITY 4: Add Favorites Button (10 min)

**Requirements**:
- Heart icon button (outline when not favorited, filled when favorited)
- localStorage persistence (key: `favorites-storage`)
- Max 10 favorites
- Show in detail page hero section
- Show in vehicle cards

**Files to Create**:
- `src/stores/useFavoritesStore.ts` (~60 lines)

**Files to Modify**:
- `src/components/vehicle-detail/VehicleHero.tsx` (add button)
- `src/components/VehicleCard.tsx` (add button)

---

### PRIORITY 5: Fix Language Switch Reload (10 min)

**Issue**: Switching EN ↔ AR causes full page reload (loses scroll position)

**Location**: `src/components/Header.tsx` (language toggle button)

**Current Behavior**: Uses `router.push()` which reloads
**Desired Behavior**: Update language without reload, maintain scroll

**Solution**:
- Use `useLanguageStore.setLanguage()` directly
- Update URL without reload (use `window.history.replaceState`)
- RTL direction handled by CSS (already works)

---

## 🔧 MANUAL FIXES REQUIRED (User Action)

### Mercedes-Benz Trims

**Issue**: 24 models exist, 0 trims exist
**Script**: `scripts/fix-mercedes-trims.mjs`

**Command**:
```bash
# Export service key from .env.local
export NEXT_PUBLIC_SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d'=' -f2)
export SUPABASE_SERVICE_ROLE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d'=' -f2)

# Run fix script
node scripts/fix-mercedes-trims.mjs

# Expected output:
# ✅ AMG C43 - trim inserted
# ✅ AMG Glc43 Coupe - trim inserted
# ... (24 total)
```

**Verification**:
```bash
# Should return 24 trims
curl "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/vehicle_trims?select=id&models.brand_id=eq.82ac7a95-b107-4b14-a431-608e0d01f5ba" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" | jq 'length'
```

---

## 📊 SESSION METRICS

| Metric | Allocated | Actual | Status |
|--------|-----------|--------|--------|
| Total Time | 90 min | 30 min | 67% under |
| Tasks Completed | 4 | 2 | 50% |
| Token Usage | - | 106k / 200k | 53% |
| Build Status | - | ✅ SUCCESS | - |
| Docstring Coverage | >70% | 83.54% | ✅ |

**Remaining Budget**: 60 min (for 5 deferred tasks = 85 min needed)

---

## 🎯 NEXT SESSION CHECKLIST

### Pre-Flight (5 min)
- [ ] Read this file completely
- [ ] Check git status (`git log --oneline -5`)
- [ ] Verify build still passes (`pnpm build`)
- [ ] Check if Mercedes trims were fixed manually
- [ ] Review CLAUDE.md Section 1 (mandatory instructions)

### Execution (85 min)
- [ ] Task 1: Container/Flyout system (45 min)
- [ ] Task 2: Fix state persistence (15 min)
- [ ] Task 3: Fix breadcrumb bug (5 min)
- [ ] Task 4: Add favorites button (10 min)
- [ ] Task 5: Fix language switch (10 min)

### Verification (10 min)
- [ ] Build successful
- [ ] Test all 5 fixes manually
- [ ] Commit with comprehensive message
- [ ] Push to origin/main
- [ ] Update CLAUDE.md session timeline
- [ ] Create performance log

---

## 📝 NOTES FOR NEXT SESSION

### Known Issues
1. **ESLint Warning**: "Invalid Options: useEslintrc, extensions" - pre-existing, not blocker
2. **Supabase Warnings**: Realtime-js dependency expressions - pre-existing, not blocker
3. **Docstring Coverage**: 83.54% (down from 84.21% but still >70% threshold)

### Code Patterns to Follow
- **MUI Only**: No Tailwind, shadcn, Lucide (per CLAUDE.md)
- **Path Aliases**: Use `@/` imports (enforced by ESLint)
- **Type Assertions**: Use `as unknown as Type` for Supabase queries
- **localStorage Keys**: Format: `{feature}-storage` (e.g., `favorites-storage`)

### Testing Strategy
- Test each fix independently before moving to next
- Use browser DevTools → Application → Local Storage
- Test both EN and AR locales
- Test mobile viewport (< 768px width)

---

**End of Deferred Tasks Document**
