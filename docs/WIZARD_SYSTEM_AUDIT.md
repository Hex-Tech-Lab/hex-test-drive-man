# Booking Wizard System Audit
**Date**: 2026-01-12 2150 EET
**Agent**: CC
**Scope**: Comprehensive end-to-end audit of booking wizard system
**Status**: 🚨 CRITICAL REGRESSION ISSUES FOUND

---

## Executive Summary

**Severity**: CRITICAL
**Impact**: Booking wizard is broken for 2 out of 3 entry points
**Root Cause**: URL parameter name inconsistency between components
**Affected Users**: Anyone clicking "Book Test Drive" from vehicle detail pages

**Issues Found**: 6 issues across 3 categories
**Fix Complexity**: LOW (mostly parameter name alignment)
**Estimated Fix Time**: 45 minutes

---

## System Architecture

### Data Flow
```
Catalog Page (AggregatedVehicle)
  ├─> Vehicle.trims[0].id (trim UUID)
  └─> VehicleCard
        └─> Button href="/bookings/new?vehicleId={id}"
              └─> BookingWizardPage
                    └─> DateTimeStep.fetchVehicle(vehicleId)
                          └─> Supabase: vehicle_trims WHERE id = vehicleId

Vehicle Detail Page (Vehicle)
  └─> VehicleDetailLayout
        └─> router.push("/bookings/new?trim={trim.id}")  ❌ WRONG PARAM
              └─> BookingWizardPage (reads 'vehicleId' param)
                    └─> DateTimeStep gets NULL → "No vehicle found" error
```

### Component Map
- **Entry Points**: 3
  - VehicleCard (catalog) ✅
  - VehicleDetailLayout (detail page) ❌
  - bookings/page (redirect) ❌
- **Wizard Steps**: 3
  - DateTimeStep (vehicle fetch, appointment)
  - DocumentUploadStep (ID/license scan)
  - ConfirmStep (OTP, booking creation)
- **State Management**: Zustand (useBookingWizardStore)
- **Persistence**: localStorage (step + vehicleId only)

---

## Issues Identified

### CATEGORY 1: URL Parameter Inconsistency (CRITICAL 🔴)

#### ISSUE #1: VehicleDetailLayout uses wrong param name
**File**: `src/components/vehicle-detail/VehicleDetailLayout.tsx:54`
**Severity**: CRITICAL
**Impact**: Booking from detail page completely broken

**Current Code**:
```typescript
router.push(`/${locale}/bookings/new?trim=${trim.id}`);
```

**Expected Code**:
```typescript
router.push(`/${locale}/bookings/new?vehicleId=${trim.id}`);
```

**Symptoms**:
- User clicks "Book Test Drive" from detail page
- Wizard loads but vehicleId is NULL
- DateTimeStep shows "No vehicle selected" error
- User cannot proceed

**Root Cause**: Parameter name mismatch introduced in commits:
- 5e3d0ef: Changed wizard to read `trim` param
- 6e45b39: Changed wizard BACK to read `vehicleId` param
- But VehicleDetailLayout never updated to match

**Fix**: Change parameter name from `trim` to `vehicleId`

---

#### ISSUE #2: bookings/page loses vehicle context
**File**: `src/app/[locale]/bookings/page.tsx:13`
**Severity**: MEDIUM
**Impact**: Direct navigation to `/bookings` loses vehicle selection

**Current Code**:
```typescript
router.push('/bookings/new')  // No params, no locale
```

**Expected Code**:
```typescript
// Option A: Redirect to catalog (user should select vehicle first)
router.push(`/${locale}/catalog`);

// Option B: Show vehicle selector modal before wizard
// (requires new component)
```

**Symptoms**:
- User navigates to `/ar/bookings`
- Redirects to `/bookings/new` (loses locale, no vehicleId)
- Wizard shows "No vehicle selected" error

**Fix**: Redirect to catalog instead (vehicles must be selected from catalog)

---

### CATEGORY 2: Error Handling (HIGH 🟡)

#### ISSUE #3: No error boundary around wizard steps
**Files**:
- `src/app/[locale]/bookings/new/page.tsx`
- All wizard step components

**Severity**: HIGH
**Impact**: Unhandled errors crash entire wizard, poor UX

**Current State**: No error boundaries

**Expected State**: Error boundary catches:
- Supabase query failures
- Network errors
- Invalid vehicle IDs
- OCR failures

**Symptoms**:
- If Supabase is down, white screen
- If network fails during fetch, no recovery
- User loses all progress

**Fix**: Add ErrorBoundary wrapper around wizard with fallback UI

---

#### ISSUE #4: Missing vehicleId validation
**File**: `src/app/[locale]/bookings/new/page.tsx`
**Severity**: MEDIUM
**Impact**: Poor UX for invalid/missing URLs

**Current State**: vehicleId is set from URL without validation

**Expected State**: Validate vehicleId format (UUID) and existence

**Current Code**:
```typescript
useEffect(() => {
  const urlVehicleId = searchParams.get('vehicleId');
  if (urlVehicleId) {
    setVehicleId(urlVehicleId);
  }
}, [searchParams, vehicleId, setVehicleId]);
```

**Improved Code**:
```typescript
useEffect(() => {
  const urlVehicleId = searchParams.get('vehicleId');
  if (!urlVehicleId) {
    // No vehicle selected - redirect to catalog
    router.push(`/${locale}/catalog`);
    return;
  }

  // UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(urlVehicleId)) {
    setError('Invalid vehicle ID format');
    return;
  }

  setVehicleId(urlVehicleId);
}, [searchParams, router, locale, setVehicleId]);
```

**Fix**: Add URL validation and redirect logic

---

### CATEGORY 3: State Management (MEDIUM 🟡)

#### ISSUE #5: vehicleId dependency causes unnecessary re-fetches
**Files**:
- `src/components/booking/wizard/DateTimeStep.tsx:71`
- `src/components/booking/wizard/ConfirmStep.tsx:74`

**Severity**: LOW
**Impact**: Performance - unnecessary API calls

**Current Code**:
```typescript
useEffect(() => {
  // ... fetchVehicle logic
}, [vehicleId]);  // Re-runs whenever vehicleId changes
```

**Problem**: vehicleId shouldn't change during wizard session, but useEffect depends on it

**Fix**: Remove vehicleId from dependency array (ESLint will warn, add comment explaining why)

---

#### ISSUE #6: No loading state for wizard initialization
**File**: `src/app/[locale]/bookings/new/page.tsx`
**Severity**: LOW
**Impact**: UX - flash of empty wizard before vehicleId loads

**Current State**: Wizard renders immediately, steps show errors briefly

**Expected State**: Show loading spinner until vehicleId is validated and vehicle data is pre-fetched

**Fix**: Add loading state in wizard page before rendering steps

---

## Verification Commands

### Test Entry Point #1: VehicleCard (Catalog)
```bash
# Should work ✅
curl -I "https://hex-test-drive-man.vercel.app/en/bookings/new?vehicleId=abe7f3bc-f421-40fe-8bc4-f865757974d8"
# Expected: 200, wizard loads with vehicle data
```

### Test Entry Point #2: VehicleDetailLayout (Detail Page)
```bash
# Currently broken ❌
# Click "Book Test Drive" from /en/vehicles/toyota-corolla-2025
# URL: /en/bookings/new?trim=X
# Expected: Should be ?vehicleId=X
```

### Test Entry Point #3: Direct /bookings
```bash
# Currently broken ❌
curl -I "https://hex-test-drive-man.vercel.app/ar/bookings"
# Redirects to /bookings/new (loses locale, no vehicleId)
# Expected: Should redirect to catalog
```

### Database Verification
```bash
# Verify trim ID exists
curl "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/vehicle_trims?select=id,model_name,brand_name&id=eq.abe7f3bc-f421-40fe-8bc4-f865757974d8" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

---

## Fix Plan

### SWEEP 1: Critical Param Alignment (15 min)
**PR Title**: `fix(booking): align URL parameter names across entry points`

**Files to Modify**:
1. `src/components/vehicle-detail/VehicleDetailLayout.tsx:54`
   - Change `?trim=` to `?vehicleId=`
2. `src/app/[locale]/bookings/page.tsx:13`
   - Redirect to catalog instead of wizard
3. Add tests to verify all 3 entry points

**Verification**:
- [ ] VehicleCard → wizard works ✅
- [ ] Detail page → wizard works ✅
- [ ] Direct /bookings → redirects to catalog ✅

---

### SWEEP 2: Error Boundaries & Validation (15 min)
**PR Title**: `feat(booking): add error boundaries and URL validation`

**Files to Modify**:
1. `src/components/booking/BookingErrorBoundary.tsx` (NEW)
   - Create error boundary component
2. `src/app/[locale]/bookings/new/page.tsx`
   - Wrap wizard in error boundary
   - Add vehicleId validation
   - Add redirect logic for missing params

**Verification**:
- [ ] Invalid vehicleId shows error, not crash
- [ ] Missing vehicleId redirects to catalog
- [ ] Network errors show fallback UI

---

### SWEEP 3: State & Performance (15 min)
**PR Title**: `perf(booking): optimize wizard re-renders and loading states`

**Files to Modify**:
1. `src/components/booking/wizard/DateTimeStep.tsx`
   - Remove vehicleId from useEffect deps
2. `src/components/booking/wizard/ConfirmStep.tsx`
   - Remove vehicleId from useEffect deps
3. `src/app/[locale]/bookings/new/page.tsx`
   - Add loading state before wizard renders

**Verification**:
- [ ] Vehicle fetch only runs once per session
- [ ] Loading spinner shows before wizard
- [ ] No flash of error messages

---

## Root Cause Analysis

### Timeline
1. **PR#68** (Jan 12, 1400 EET): Wizard implementation merged
   - Used `?vehicleId=` parameter
   - VehicleCard updated to pass `vehicleId`
   - VehicleDetailLayout NOT updated
2. **5e3d0ef** (Jan 12, 2018 EET): Changed wizard to read `?trim=`
   - Wizard page changed to read `trim` param
   - VehicleCard NOT updated → broke catalog entry point
3. **6e45b39** (Jan 12, 2024 EET): Changed wizard BACK to `?vehicleId=`
   - Wizard page reverted to read `vehicleId` param
   - VehicleCard works again ✅
   - VehicleDetailLayout still broken ❌ (never updated in first place)

### Lesson Learned
**Issue**: Parameter name changes not synchronized across all entry points
**Prevention**:
- Centralize URL parameter names in constants file
- Add integration tests for all entry points
- Use TypeScript const for param names

---

## Testing Checklist

### Manual Tests (Required)
- [ ] Catalog → VehicleCard → "Book Test Drive" → Wizard loads with vehicle ✅
- [ ] Detail page → "Book Test Drive" → Wizard loads with vehicle ✅
- [ ] Direct URL `/en/bookings/new?vehicleId=X` → Works ✅
- [ ] Direct URL `/en/bookings` → Redirects to catalog ✅
- [ ] Invalid vehicleId → Shows error, doesn't crash ✅
- [ ] Missing vehicleId → Redirects to catalog ✅
- [ ] Wizard Step 1 → Vehicle photo/name visible ✅
- [ ] Wizard Step 1 → Date/time selection works ✅
- [ ] Wizard Step 2 → ID upload works ✅
- [ ] Wizard Step 3 → OTP send/verify works ✅
- [ ] Wizard Step 3 → Booking creation succeeds ✅

### Browser Tests
- [ ] Chrome desktop ✅
- [ ] Safari mobile ✅
- [ ] Firefox desktop ✅

### Network Conditions
- [ ] Fast 3G (check loading states)
- [ ] Offline (check error boundaries)
- [ ] Slow API response (check timeouts)

---

## Impact Assessment

### Users Affected
- **Catalog users**: ✅ Working (VehicleCard uses correct param)
- **Detail page users**: ❌ Broken (VehicleDetailLayout uses wrong param)
- **Direct navigation**: ❌ Broken (loses context)

**Estimated affected traffic**: 30-40% (detail page entry point)

### Business Impact
- **Severity**: CRITICAL
- **Revenue Impact**: HIGH (bookings completely broken for detail page users)
- **User Experience**: POOR (confusing error messages, no recovery)

### Deployment Risk
- **Fix Complexity**: LOW (mostly string replacements)
- **Regression Risk**: LOW (fixes are isolated to booking flow)
- **Rollback Plan**: Revert PRs in reverse order (Sweep 3 → Sweep 2 → Sweep 1)

---

## Recommendations

### Immediate (Today)
1. Deploy SWEEP 1 (param alignment) - **CRITICAL**
2. Add monitoring for booking wizard errors
3. Check production logs for "No vehicle selected" errors

### Short-term (This Week)
1. Deploy SWEEP 2 (error boundaries)
2. Deploy SWEEP 3 (performance)
3. Add integration tests for all entry points

### Long-term (Next Sprint)
1. Centralize URL constants (`src/constants/routes.ts`)
2. Add E2E tests with Playwright
3. Create booking wizard documentation
4. Add analytics tracking for wizard drop-off rates

---

## References

- **PR#68**: Booking wizard implementation
- **Commit 5e3d0ef**: Changed to `?trim=` param
- **Commit 6e45b39**: Changed back to `?vehicleId=` param
- **CLAUDE.md Section 11**: UI/UX Reconstruction notes
- **Tech Stack**: Next.js 15.4.10, React 19, MUI 6.4.3, Zustand 5.0.3

---

**Audit Completed**: 2026-01-12 2150 EET
**Next Action**: Execute SWEEP 1 (Critical Param Alignment)
**Agent**: CC
**Status**: 🚀 READY FOR FIXES
