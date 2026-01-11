# Rebase Strategy: PRs 54, 55, 59

**Generated**: 2026-01-11 2155 EET by CC Auditor
**Target**: Merge 3 conflicting PRs after 3-step booking flow (PR#66, SHA a6d1155)
**Dependencies**: All PRs blocked by `/bookings/new` deletion in main
**Timeline**: 40-55 minutes total (sequential execution required)

---

## Executive Summary

**Conflict Root Cause**: PR#66 (3-step booking flow) deleted `/bookings/new/page.tsx` and restructured booking system:
- **Old**: `/bookings/new` (single-page booking)
- **New**: `/bookings/step1` (OTP) → `/bookings/step2` (vehicle/date) → `/bookings/step3` (confirm)

**Impact**: All 3 PRs (54, 55, 59) reference old booking structure and require adaptation.

**Rebase Order**: PR59 → PR54 → PR55 (easiest to hardest)

---

## Rebase Order & Rationale

### Option A: Difficulty-Based (RECOMMENDED)
```
1. PR59 (easiest) → PR54 (medium) → PR55 (hardest)
```
**Rationale**:
- PR59: Already fixed critical issue (commit 8f20fff), simple rebase
- PR54: Clear fix path (adapt to step2), medium complexity
- PR55: Requires security hardening + schema verification, most complex

**Advantage**: Early wins build confidence, hardest last when main is most stable

### Option B: Dependency-Based (ALTERNATIVE)
```
1. PR54 (preselection) → PR55 (GET endpoint) → PR59 (form fixes)
```
**Rationale**:
- PR54 enables vehicle preselection UX
- PR55 adds GET endpoint for booking retrieval
- PR59 fixes form dropdown issues

**Advantage**: Logical feature flow, preselection → API → form

**Recommendation**: Use Option A (easier PRs first) unless user explicitly requests feature-based order.

---

## PR59: Booking Dropdown + Critical Fix

**Branch**: `agent/task-16-high-critical-pr-59-fix-urgent-booking-dropdown-b-67`
**Status**: CONFLICTING (needs rebase)
**Difficulty**: 🟢 EASY
**Time**: 10-12 minutes

### Files Changed
- `src/components/booking/ReservationForm.tsx` (+15, -3)
  - Line 167: Fixed image fallback (already committed in 8f20fff)
  - Dropdown improvements

### Rebase Steps
```bash
# 1. Checkout branch
git checkout agent/task-16-high-critical-pr-59-fix-urgent-booking-dropdown-b-67
git fetch origin

# 2. Rebase on main
git rebase origin/main

# Expected: Clean rebase (no conflicts likely, form component unchanged in main)

# 3. Verify changes
git log --oneline -3
git diff origin/main...HEAD

# 4. Test build
pnpm install  # In case dependencies changed
pnpm lint
pnpm build

# 5. Re-push
git push --force-with-lease

# 6. Verify PR status
gh pr view 59
```

### Expected Conflicts
**None** - ReservationForm.tsx not modified in 3-step flow (separate component).

### Adaptation Required
**None** - Form component remains compatible with new booking system.

---

## PR54: Vehicle Preselection

**Branch**: `agent/bb/fix-vehicle-preselection`
**Status**: CONFLICTING (needs rebase + adaptation)
**Difficulty**: 🟡 MEDIUM
**Time**: 15-20 minutes

### Files Changed
1. `src/app/[locale]/booking/new/page.tsx` (+23, -2) ❌ **DELETED IN MAIN**
2. `src/components/VehicleCard.tsx` (+2, -1) ✅ Safe
3. `src/components/booking/ReservationForm.tsx` (+67, -2) ✅ Safe

### Rebase Steps
```bash
# 1. Checkout branch
git checkout agent/bb/fix-vehicle-preselection
git fetch origin

# 2. Rebase on main
git rebase origin/main

# Expected conflict:
# CONFLICT (modify/delete): src/app/[locale]/booking/new/page.tsx deleted in HEAD

# 3. Resolve conflict - Remove deleted file
git rm src/app/[locale]/booking/new/page.tsx
git rebase --continue

# 4. Adapt VehicleCard.tsx link
# Current: href={`/${language}/bookings/new?vehicleId=${vehicle.id}`}
# New:     href={`/${language}/bookings/step2?vehicleId=${vehicle.id}`}
```

### Adaptation Code Changes

**File**: `src/components/VehicleCard.tsx`
**Line**: ~180 (booking link)
```typescript
// OLD (PR54):
href={`/${language}/bookings/new?vehicleId=${vehicle.id}`}

// NEW (3-step flow compatible):
href={`/${language}/bookings/step2?vehicleId=${vehicle.id}`}
```

**File**: `src/app/[locale]/bookings/step2/page.tsx` (NEW FILE TO MODIFY)
**Add at top of component**:
```typescript
'use client';
import { useSearchParams } from 'next/navigation';

export default function BookingStep2Page() {
  const searchParams = useSearchParams();
  const preselectedVehicleId = searchParams.get('vehicleId');

  useEffect(() => {
    if (preselectedVehicleId) {
      setSelectedVehicle({
        id: preselectedVehicleId,
        name: 'Loading...', // Fetch full details
      });
    }
  }, [preselectedVehicleId]);

  // ... rest of component
}
```

### Test Plan
```bash
# 1. Build test
pnpm build

# 2. Manual tests
# - Catalog → VehicleCard "Book Test Drive" → Should land on step2 with vehicle preselected
# - Direct step1 entry → Should show full vehicle dropdown on step2
# - Verify vehicleId query param works

# 3. Verify no console errors
pnpm dev
# Open browser → /en/catalog → click "Book Test Drive" → check console
```

---

## PR55: GET Bookings Endpoint + Security

**Branch**: `bb/verify-booking-confirmed-page`
**Status**: CONFLICTING (needs rebase + security hardening)
**Difficulty**: 🔴 HARD
**Time**: 20-25 minutes

### Files Changed
1. `src/app/api/bookings/[id]/route.ts` (+52, new file) ⚠️ Security risk
2. `src/app/[locale]/bookings/[id]/confirmed/page.tsx` (+48, -15) ✅ Safe

### Rebase Steps
```bash
# 1. Checkout branch
git checkout bb/verify-booking-confirmed-page
git fetch origin

# 2. Rebase on main
git rebase origin/main

# Expected: Clean rebase (new file, no conflicts)

# 3. CRITICAL - Add security checks to route.ts
# See security hardening section below

# 4. Verify API compatibility with new schema
# Main now has draft/confirmed booking distinction
```

### Security Hardening (CRITICAL - MUST DO BEFORE MERGE)

**File**: `src/app/api/bookings/[id]/route.ts`
**Current Risk**: 🔴 HIGH - Anonymous users can access any booking by ID

**Required Fixes**:

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Input validation
    if (!params.id || typeof params.id !== 'string') {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    if (!UUID_REGEX.test(params.id)) {
      return NextResponse.json({ error: 'Invalid booking ID format' }, { status: 400 });
    }

    // 2. Authentication check (CRITICAL)
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Fetch booking
    const supabase = await createClient();
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, vehicle:vehicle_trims(*), user:users(*)')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
    }

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // 4. Authorization check (CRITICAL)
    if (booking.userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 5. Handle draft vs confirmed status (NEW - 3-step flow)
    if (booking.status === 'draft') {
      return NextResponse.json({
        ...booking,
        isDraft: true,
        message: 'This booking is not yet confirmed',
      });
    }

    return NextResponse.json(booking);
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Schema Compatibility Verification

**Action**: Verify booking table has draft/confirmed status distinction

```bash
# Check booking schema
curl "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/bookings?select=status&limit=5" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"

# Expected: status field with values 'draft' or 'confirmed'
```

### Test Plan
```bash
# 1. Build test
pnpm build

# 2. Manual API tests (use Postman or curl)

# Test 1: Unauthorized access (should return 401)
curl http://localhost:3000/api/bookings/[valid-uuid]
# Expected: {"error":"Unauthorized"}

# Test 2: Invalid booking ID (should return 400)
curl http://localhost:3000/api/bookings/invalid-id \
  -H "Authorization: Bearer $TOKEN"
# Expected: {"error":"Invalid booking ID format"}

# Test 3: Booking not found (should return 404)
curl http://localhost:3000/api/bookings/[non-existent-uuid] \
  -H "Authorization: Bearer $TOKEN"
# Expected: {"error":"Booking not found"}

# Test 4: Other user's booking (should return 403)
curl http://localhost:3000/api/bookings/[other-user-booking-id] \
  -H "Authorization: Bearer $TOKEN"
# Expected: {"error":"Forbidden"}

# Test 5: Own booking (should return 200)
curl http://localhost:3000/api/bookings/[own-booking-id] \
  -H "Authorization: Bearer $TOKEN"
# Expected: {id, vehicle, date, time, status, ...}
```

---

## Global Conflict Resolution Patterns

### Pattern 1: File Deletion Conflicts
```bash
# Symptom: CONFLICT (modify/delete): file deleted in HEAD
# Solution: Remove file, adapt logic to new structure
git rm <conflicted-file>
git rebase --continue
```

### Pattern 2: Import Path Conflicts
```bash
# Old: import X from '@/app/[locale]/bookings/new/...'
# New: import X from '@/app/[locale]/bookings/step2/...'
```

### Pattern 3: Route URL Conflicts
```bash
# Old: router.push('/bookings/new')
# New: router.push('/bookings/step1')
```

---

## Sequential Test Plan (After All Rebases)

### Phase 1: Build Verification (5 min)
```bash
# On main branch after all PRs merged
git checkout main
git pull origin main
pnpm install
pnpm lint
pnpm build

# Success criteria:
# - 0 lint errors
# - 0 TypeScript errors
# - Build exit code 0
```

### Phase 2: API Security Test (5 min)
```bash
# Test PR55 GET endpoint security
# Use Postman collection or curl (see PR55 test plan above)

# Success criteria:
# - 401 on unauthorized
# - 403 on other user's booking
# - 200 on own booking
# - No sensitive data leaks
```

### Phase 3: User Flow Test (10 min)
```bash
pnpm dev

# Test PR54: Vehicle preselection
# 1. Go to /en/catalog
# 2. Click "Book Test Drive" on any vehicle
# 3. Verify lands on /bookings/step2?vehicleId=X
# 4. Verify vehicle is preselected
# 5. Complete booking flow

# Test PR59: Booking form dropdown
# 1. Go to /bookings/step1
# 2. Enter phone, verify OTP
# 3. On step2, verify dropdown works
# 4. Select vehicle, date, time
# 5. Complete booking

# Test PR55: Booking confirmation page
# 1. Complete booking flow
# 2. Note booking ID from confirmation
# 3. Navigate to /bookings/[id]/confirmed
# 4. Verify booking details displayed
# 5. Verify image fallback works (no grey boxes)
```

---

## Time Estimates Summary

| PR | Rebase | Adaptation | Security | Testing | Total |
|----|--------|------------|----------|---------|-------|
| PR59 | 2 min | 0 min | 0 min | 8 min | 10 min |
| PR54 | 3 min | 7 min | 0 min | 5 min | 15 min |
| PR55 | 2 min | 5 min | 10 min | 8 min | 25 min |
| **Total** | **7 min** | **12 min** | **10 min** | **21 min** | **50 min** |

**Buffer**: +10 min for unexpected issues (total 60 min safe estimate)

---

## Risk Assessment

### PR59: 🟢 LOW RISK
- Simple rebase, no structural changes
- Critical fix already applied
- No breaking changes expected

### PR54: 🟡 MEDIUM RISK
- File deletion conflict (well-defined fix)
- Requires step2 page modification
- Clear adaptation path documented

### PR55: 🔴 HIGH RISK (Security)
- CRITICAL: Missing auth/authz (must fix before merge)
- Schema compatibility verification required
- Potential data exposure if not fixed

**Overall Risk**: 🟡 MEDIUM (manageable with strict adherence to security checklist)

---

## Rollback Plan

### If Rebase Fails (Any PR)
```bash
# Abort rebase
git rebase --abort

# Return to original state
git checkout main

# Report issue with details:
# - Which PR failed
# - Conflict file/line
# - Error message
```

### If Merge Introduces Bugs
```bash
# Revert specific PR merge (use merge commit SHA)
git revert -m 1 <merge-commit-sha>
git push origin main

# Or reset to pre-merge state (emergency only)
git reset --hard <pre-merge-sha>
git push --force-with-lease origin main  # ⚠️ DANGEROUS
```

---

## Post-Merge Actions

1. **Monitor Production**:
   - Vercel deploy status (expect ~30 min build time)
   - Sentry error tracking (first 24 hours)
   - API rate limiting logs (unauthorized access attempts)

2. **Documentation**:
   - Update CLAUDE.md with merge SHAs
   - Add to SESSION_TIMELINE
   - Update PERFORMANCE_LOG.md with rebase durations

3. **Security Audit**:
   - Manual penetration test on GET endpoint
   - Review Supabase logs for unauthorized access
   - Verify RLS policies active on bookings table

4. **User Communication**:
   - Notify user of successful merges
   - Report any deviations from time estimates
   - Document lessons learned

---

## References

- **PR54 Details**: `docs/PR54_ELABORATE.md` (256 lines)
- **PR55 Details**: `docs/PR55_ELABORATE.md` (469 lines)
- **3-Step Flow**: PR#66 (merged as a6d1155)
- **Git Workflow**: `docs/policies/GIT_WORKFLOW_RULES.md`
- **Security Best Practices**: OWASP API Security Top 10

---

**Strategy by**: CC Auditor
**Review Status**: Ready for execution
**Approval Required**: User confirmation before starting rebase sequence
