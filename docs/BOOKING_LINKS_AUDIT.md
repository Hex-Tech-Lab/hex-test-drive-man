# Booking System Links Audit

**Date**: 2026-01-12 2030 EET
**Agent**: CC
**Task**: System-wide audit of booking route references

## Audit Scope

Searched for all references to booking routes (`bookings/step*` and `bookings/new`) in the codebase.

**Command Used**:
```bash
rg "bookings/(step|new)" src -g "*.tsx" -n
```

## Findings

### 1. VehicleCard.tsx:350 ✅ CORRECT
**Location**: `src/components/VehicleCard.tsx:350`
**Code**:
```typescript
href={`/${locale}/bookings/new?vehicleId=${vehicle.id}`}
```
**Status**: ✅ Already pointing to new wizard
**Action**: None required

### 2. bookings/page.tsx:13 ❌ FIXED
**Location**: `src/app/[locale]/bookings/page.tsx:13`
**Code (Before)**:
```typescript
router.push('/bookings/step1')
```
**Code (After)**:
```typescript
router.push('/bookings/new')
```
**Status**: ✅ Fixed in this commit
**Action**: Updated redirect to point to new wizard

### 3. bookings/new/page.tsx:17 ✅ COMMENT ONLY
**Location**: `src/app/[locale]/bookings/new/page.tsx:17`
**Code**:
```typescript
* Accessed via /bookings/new?vehicleId=X from catalog
```
**Status**: ✅ Documentation comment only
**Action**: None required

### 4. VehicleDetailLayout.tsx:54 ✅ CORRECT
**Location**: `src/components/vehicle-detail/VehicleDetailLayout.tsx:54`
**Code**:
```typescript
router.push(`/${locale}/bookings/new?trim=${trim.id}`);
```
**Status**: ✅ Already pointing to new wizard
**Action**: None required

## "Show Reservations" Search

**Command Used**:
```bash
rg -i "show.*reserv|reserv.*show" src -g "*.tsx" -B2 -A2
```

**Result**: No "Show Reservations" UI elements found. Only one comment in `ConfirmStep.tsx` saying "show reservation details" (not a link).

## Old Step Route Files

**Status**: DELETED in this commit
- ❌ `src/app/[locale]/bookings/step1/page.tsx` - DELETED
- ❌ `src/app/[locale]/bookings/step2/page.tsx` - DELETED
- ❌ `src/app/[locale]/bookings/step3/page.tsx` - DELETED

**Replacement**: Server-side redirects added to `next.config.mjs`:
```javascript
redirects: async () => [
  {
    source: '/:locale/bookings/step:num(1|2|3)',
    destination: '/:locale/bookings/new',
    permanent: true,
  },
],
```

## Summary

### Total References Found: 4
- ✅ Already correct: 3
- ❌ Fixed in this commit: 1
- ⚠️ Old routes deleted: 3

### Changes Made
1. **Deleted** old step route files (step1/2/3)
2. **Added** server-side redirects in next.config.mjs
3. **Fixed** `/bookings` redirect to point to new wizard

### Verification Status
- ✅ All links now point to `/bookings/new`
- ✅ Old routes will 404 after deletion (then redirect via next.config.mjs)
- ✅ No "Show Reservations" stale links found
- ✅ System-wide audit complete

## Next Steps
1. Run `pnpm build` to verify configuration
2. Deploy to production
3. Test old routes return 404 or redirect
4. Test new wizard loads with vehicle parameter

---

**Audit Completed**: 2026-01-12 2035 EET
**Agent**: CC
**Result**: 1 fix applied, 3 files deleted, redirects added
