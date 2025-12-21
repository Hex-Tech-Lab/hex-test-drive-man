# PR Implementation Plan - Updated Status
**Updated**: 2025-12-21 19:05 EET
**Agent**: CC (Claude Code)
**Session**: Production triage, SMS verification, image coverage

---

## CRITICAL STATUS SUMMARY

### 🔴 Critical (Deploy Immediately)

1. **Duplicate OTP Bug** 🚨 NEW
   - Status: ✅ Identified, fix ready
   - Impact: 100% cost increase, user confusion
   - ETA: 5 min to implement
   - Priority: **HIGHEST** (affects all bookings)

2. **Image Coverage 0%** 🟡 IMPROVED
   - Status: Code fixed ✅, SQL ready ✅, awaiting execution ⏳
   - Coverage: Currently 0/199 models (0%)
   - After SQL: 137/199 models (69%)
   - ETA: 5-10 min (manual SQL execution)

3. **Secret Rotation** ⚠️ PENDING
   - Status: Not started
   - Files: GitHub tokens, Sentry DSN, API keys in repo
   - ETA: 2 hours
   - Priority: HIGH (security)

### 🟢 Resolved

1. **SMS/OTP System** ✅ FUNCTIONAL
   - Delivery: 3-10 seconds (excellent)
   - Success rate: 100% (5-6 test bookings)
   - Verification: Working
   - Status: **Fully operational** except duplicate bug

---

## PR #21: Production Image Fix & Audit Tools

**URL**: https://github.com/Hex-Tech-Lab/hex-test-drive-man/pull/21
**Status**: ✅ Created, awaiting review
**Branch**: feature/production-image-fix

### Contents
- ✅ imageHelper.ts fix (merged to main via bb08b46)
- ✅ Documentation (PRODUCTION_IMAGE_FIX.md, PRODUCTION_IMAGE_STATUS.md)
- ✅ Audit tool (scripts/complete_vehicle_image_coverage.py)
- ✅ SMS bug analysis (SMS_OTP_STATUS.md)

### Pending Actions
1. **Execute SQL** (5 min - MANUAL REQUIRED)
   - File: scripts/update_image_urls.sql
   - Method: Supabase Dashboard SQL Editor
   - Result: 137 models populated (69% coverage)

2. **Verify Deployment** (2 min)
   - Check Vercel has bb08b46 (imageHelper fix)
   - Trigger redeploy if needed

3. **Verify Live Site** (3 min)
   - URL: https://hex-test-drive-man.vercel.app/en
   - Expect: Vehicle images visible
   - Confirm: No 404 errors

---

## PR #22: Fix Duplicate OTP Bug (NEW)

**Status**: 🔴 NOT CREATED - Ready to implement
**Priority**: CRITICAL
**ETA**: 15 minutes total (5 min code + 5 min test + 5 min commit/PR)

### Changes Required

**File**: src/components/VehicleCard.tsx

**Lines to REMOVE**: 1, 134-141

**Diff**:
```diff
- import { requestBookingOtp } from '@/actions/bookingActions';

  const handleSubmitBooking = async () => {
    // ... validation code ...

    try {
      const response = await fetch('/api/bookings', { ... });
      const booking = await response.json();

-     // Send OTP to phone number
-     const otpResult = await requestBookingOtp({
-       phone: formData.phone,
-       subjectId: booking.id,
-     });
-
-     if (!otpResult.success) {
-       throw new Error(otpResult.error || 'Failed to send OTP');
-     }

-     // Redirect to OTP verification page
+     // Redirect to OTP verification page (server already sent OTP)
      router.push(`/${language}/bookings/${booking.id}/verify`);
    }
  }
```

### Root Cause
- **Server** (src/app/api/bookings/route.ts:106-110): Sends OTP after creating booking
- **Client** (src/components/VehicleCard.tsx:134-137): ALSO sends OTP after API response
- **Result**: 2 SMS messages, 3 seconds apart, 2x cost

### Impact
- **Before fix**: 0.0774 EGP per booking (2 SMS)
- **After fix**: 0.0387 EGP per booking (1 SMS)
- **Savings**: 50% cost reduction
- **UX**: No confusion, single code

### Testing Checklist
- [ ] Remove duplicate OTP call from VehicleCard.tsx
- [ ] Remove unused import (requestBookingOtp)
- [ ] Test booking: Should receive ONLY 1 SMS
- [ ] Verify OTP code works on verification page
- [ ] Check database: ONLY 1 sms_verifications record
- [ ] Test 3 bookings to confirm consistency
- [ ] Commit with detailed message
- [ ] Create PR with "CRITICAL" label
- [ ] Request expedited review
- [ ] Deploy to production immediately after merge

---

## PR #19: Security Hardening (PENDING)

**Status**: ⚠️ Not started
**Priority**: 🔴 CRITICAL
**ETA**: 2-3 hours

### Tasks

#### 1. Rotate All Secrets (2h)
**Files containing secrets**:
- ❌ scripts/comprehensive-pr-scraper.ts (line 5: GitHub token)
- ❌ Repository env vars (Sentry DSN, Anthropic, Supabase)
- ❌ Git history (multiple commits with keys)

**Actions**:
- [ ] Generate new GitHub personal access token
- [ ] Rotate Sentry DSN
- [ ] Rotate Anthropic API key
- [ ] Rotate Supabase service role key
- [ ] Rotate WhySMS credentials
- [ ] Update .env.example with placeholders
- [ ] Update Vercel environment variables
- [ ] Run git-filter-repo to remove from history
- [ ] Force push cleaned history (coordinate with team)

#### 2. Fix RLS Policies (1.5h)
**Issues**:
- ❌ bookings INSERT: Uses `WITH CHECK (auth.uid() = user_id)` but user_id can be NULL
- ❌ sms_verifications: Missing UPDATE/DELETE policies
- ❌ bookings: Missing UPDATE/DELETE policies

**SQL Fixes**:
```sql
-- Fix bookings INSERT (allow unauthenticated bookings)
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
CREATE POLICY "Anyone can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Add UPDATE policy (only own bookings)
CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (
    phone_number = current_setting('request.jwt.claims')::json->>'phone'
    OR auth.uid() = user_id
  );

-- Add sms_verifications policies
CREATE POLICY "Users can update own verifications" ON sms_verifications
  FOR UPDATE USING (
    phone_number = current_setting('request.jwt.claims')::json->>'phone'
  );
```

#### 3. Add name Column to bookings (1h)
**Status**: ✅ Already exists (verified in schema)
**Migration**: supabase/migrations/20251219_add_missing_columns.sql

**Actions**:
- [x] Migration created
- [ ] Verify migration applied to production
- [ ] Test booking creation includes name
- [ ] Update TypeScript types if needed

#### 4. Remove PII from Git History (1h)
**File**: BUG_FIXED.md (contains plaintext phone numbers and OTP codes)

**Actions**:
- [ ] Create sanitized version of BUG_FIXED.md
- [ ] Use git-filter-repo: `git filter-repo --path BUG_FIXED.md --invert-paths`
- [ ] Force push to remove from history
- [ ] Coordinate with team (breaks local clones)

---

## EXECUTION PRIORITY ORDER

### Immediate (Next 30 min)
1. **PR #22: Fix Duplicate OTP** (15 min)
   - Critical user-facing bug
   - 50% cost savings
   - Simple fix (remove 9 lines)

2. **Execute SQL for Images** (10 min)
   - Unblocks production image display
   - 0% → 69% coverage
   - Manual Supabase Dashboard task

3. **Verify Deployments** (5 min)
   - Check Vercel has latest code
   - Verify images appear on live site
   - Confirm single OTP per booking

### Short-term (Next 24h)
4. **PR #19: Security Hardening** (3h)
   - Secret rotation
   - RLS policy fixes
   - PII removal from git history

5. **PR #20: Remaining Images** (2-3h)
   - Source 62 additional images (31% gap)
   - PDF extraction preferred
   - Mark if not highest trim

### Medium-term (Next week)
6. **Monitoring & Analytics**
   - SMS delivery webhook tracking
   - Image coverage dashboard
   - Booking funnel analytics

---

## SUCCESS METRICS

### PR #21 (Images) - Target: 100% coverage
- Current: 0/199 models (0%)
- After SQL: 137/199 models (69%) ✅
- Final goal: 199/199 models (100%)

### PR #22 (OTP) - Target: Single SMS per booking
- Current: 2 SMS per booking (100% duplicate rate) 🚨
- After fix: 1 SMS per booking (0% duplicate rate) ✅
- Cost savings: 50% (0.0387 EGP vs 0.0774 EGP)

### PR #19 (Security) - Target: Zero secrets in repo
- Current: 5+ hardcoded secrets ❌
- After fix: 0 secrets, all in env vars ✅
- RLS: All tables have proper policies ✅

### Overall Production Health
- Images: 0% → 69% → 100%
- SMS: Functional ✅, duplicate bug ✅ (fix ready)
- Security: Hardening in progress
- Performance: LCP < 3s (verify after image deploy)

---

## TEAM COORDINATION

### Deployment Order
1. **PR #22 (OTP)**: Deploy immediately after merge (no dependencies)
2. **SQL Execution**: Manual task, coordinate with DB admin
3. **PR #21 Review**: Needs approval, can deploy after SQL
4. **PR #19 (Security)**: Coordinate force push timing (breaks clones)

### Communication
- Slack: Notify team before secret rotation
- Git: Tag all PRs with priority (CRITICAL/HIGH/MEDIUM)
- Vercel: Monitor deployment logs for errors
- Supabase: Verify migrations applied before deployment

---

## ROLLBACK PLANS

### If Duplicate OTP Fix Breaks Bookings
```bash
git revert <commit-sha>
git push origin main
# Redeploy Vercel
```

### If Image SQL Fails
```sql
ROLLBACK; -- If still in transaction
-- Or restore old paths:
UPDATE models SET hero_image_url = NULL WHERE hero_image_url LIKE '/images/%';
```

### If Secret Rotation Breaks Production
- Revert to old keys in Vercel env vars
- Redeploy
- Fix issues, rotate again

---

## OPEN QUESTIONS

1. **Image Coverage**: Is 69% acceptable for MVP launch, or block until 100%?
2. **Secret Rotation**: Can we coordinate downtime window for force push?
3. **OTP Fix**: Should we add idempotency check as defense-in-depth?
4. **RLS Policies**: Allow unauthenticated bookings or require phone-based auth?

---

**Last Updated**: 2025-12-21 19:05 EET
**Next Review**: After PR #22 merge (OTP fix)
**Overall Status**:
- 🟢 SMS/OTP system functional
- 🟡 Image coverage code ready, SQL pending
- 🔴 Duplicate OTP bug identified, fix ready
- 🔴 Security hardening needed
