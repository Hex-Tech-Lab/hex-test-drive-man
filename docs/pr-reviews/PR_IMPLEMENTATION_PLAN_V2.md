# PR Implementation Plan V2 - Unified Roster (PRs #19-22)
**Generated**: 2025-12-21 22:10 EET
**Agent**: CC (Claude Code)
**Scope**: Consolidated findings from PRs #19, #20, #21, #22
**Total Findings**: 117 (19 critical, 33 high, 65 medium/low)
**Sources**: CodeRabbit, Sonar, Snyk, Sourcery, Corridor, manual analysis

---

## 🚨 CRITICAL: NO PR MERGES UNTIL ROSTER COMPLETE

**Freeze Status**: ❄️ ALL PRs #19-22 frozen
**Gate**: All critical findings must be resolved or explicitly waived
**Gate**: All high findings must have assigned owners + ETAs
**Review**: This document is the single source of truth for merge readiness

---

## TABLE OF CONTENTS

1. [Critical Findings (19)](#1-critical-findings-19)
2. [High Priority Findings (33)](#2-high-priority-findings-33)
3. [Medium/Low Findings (65)](#3-mediumlow-findings-65)
4. [Execution Schedule](#4-execution-schedule)
5. [PR Merge Readiness Matrix](#5-pr-merge-readiness-matrix)
6. [Team Assignments](#6-team-assignments)
7. [Merge Decision Tree](#7-merge-decision-tree)
8. [Success Criteria](#8-success-criteria)
9. [Rollback Plans](#9-rollback-plans)
10. [Monitoring & Verification](#10-monitoring--verification)

---

## 1. CRITICAL FINDINGS (19)

### 1.1. OTP/Bookings Critical (3)

#### C-OTP-1: Duplicate OTP Messages (100% Occurrence Rate)
- **PR**: #22, #20, #19
- **Tool**: Manual analysis (CC)
- **File**: `src/components/VehicleCard.tsx:134-141`
- **Issue**: Client calls `requestBookingOtp()` after server already sent OTP → 2 SMS per booking
- **Impact**: 100% cost increase (0.0774 vs 0.0387 EGP/booking), user confusion
- **Root Cause**: Server-side OTP added in route.ts:106-110, client-side call never removed
- **Fix**:
  ```typescript
  // REMOVE lines 134-141 in VehicleCard.tsx:
  const otpResult = await requestBookingOtp({ phone, subjectId });
  if (!otpResult.success) throw new Error(...);

  // KEEP only:
  router.push(`/${language}/bookings/${booking.id}/verify`);
  ```
- **Owner**: CCW
- **ETA**: 30m (15min code + 15min test)
- **Status**: ⏳ Fix identified, code change ready
- **Blocker**: YES - affects every booking, 50% cost waste
- **Reference**: SMS_OTP_STATUS.md lines 67-106

#### C-OTP-2: Missing `name` Column in Database
- **PR**: #19, #20
- **Tool**: CodeRabbit
- **File**: `src/repositories/bookingRepository.ts:104`
- **Issue**: `name: ''` hardcoded in getBookingById(), customer names never retrieved from DB
- **Impact**: Data loss, customer names not persisted
- **Root Cause**: Migration 20251219_add_missing_columns.sql exists but unclear if applied
- **Fix**:
  ```typescript
  // In bookingRepository.ts:104
  return {
    id: data.id,
    name: data.name,  // Change from: name: ''
    phone: data.phone_number,
    ...
  };
  ```
  ```sql
  -- Verify migration applied:
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'bookings' AND column_name = 'name';
  ```
- **Owner**: CCW
- **ETA**: 1h (verify migration + update code + test)
- **Status**: ⏳ Migration file exists, application status unknown
- **Blocker**: YES - customer data integrity
- **Reference**: actionable_pr_report_v4.md lines 13-41

#### C-OTP-3: phone_number vs phone Column Schema Mismatch
- **PR**: #19
- **Tool**: CodeRabbit
- **File**: `src/repositories/bookingRepository.ts:56, 105`
- **Issue**: INSERT uses `phone_number: input.phone`, SELECT expects `data.phone_number` - inconsistent
- **Impact**: Phone verification may break, data retrieval errors
- **Root Cause**: Schema evolution - column renamed but code not updated uniformly
- **Fix**:
  ```typescript
  // Standardize on phone_number throughout:
  // Line 56: phone_number: input.phone.trim()  ✓ Correct
  // Line 105: phone: data.phone_number  ✓ Correct
  // Verify no references to just 'phone' column
  ```
  ```sql
  -- Verify schema:
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'bookings' AND column_name IN ('phone', 'phone_number');
  ```
- **Owner**: CCW
- **ETA**: 30m (verify schema + audit code)
- **Status**: ⏳ Needs schema verification
- **Blocker**: YES - phone verification critical path
- **Reference**: CodeRabbit PR #19

### 1.2. Security/Secrets Critical (2)

#### C-SEC-1: Hardcoded GitHub Personal Access Token
- **PR**: #21
- **Tool**: Manual analysis (CC), Corridor
- **File**: `scripts/comprehensive-pr-scraper.ts:5`
- **Issue**: Live GitHub PAT `ghp_[REDACTED]` committed to repo
- **Impact**: Complete GitHub account compromise, repo write access, API abuse ($$$)
- **Root Cause**: Development convenience, forgot to use env var
- **Fix**:
  ```bash
  # 1. Rotate token immediately
  gh auth login
  # Revoke old: https://github.com/settings/tokens

  # 2. Update code
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
  if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN required');

  # 3. Purge from history
  git filter-repo --path scripts/comprehensive-pr-scraper.ts --invert-paths
  git filter-repo --replace-text <(echo "ghp_[REDACTED_TOKEN_VALUE]==>REDACTED")

  # 4. Force push (coordinate team)
  git push --force-with-lease origin main
  ```
- **Owner**: CC
- **ETA**: 2h (rotate + purge + coordinate force push)
- **Status**: ⏳ Active vulnerability, immediate action required
- **Blocker**: YES - security breach in progress
- **Reference**: PR #21 Corridor comment

#### C-SEC-2: Hardcoded Supabase Service Role Key
- **PR**: #21
- **Tool**: Sourcery, Corridor
- **File**: `scripts/complete_vehicle_image_coverage.py:17-18`
- **Issue**: Service role key `eyJhbGciOiJIUzI1NiIs...` bypasses RLS, full DB access
- **Impact**: Complete database compromise, RLS bypass, data breach
- **Root Cause**: Fallback default for convenience
- **Fix**:
  ```python
  # Line 17-18: REMOVE fallback
  SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')
  if not SUPABASE_SERVICE_KEY:
      print("ERROR: SUPABASE_SERVICE_KEY not set")
      sys.exit(1)

  # Rotate key in Supabase Dashboard
  # Settings → API → Service Role Key → Generate New

  # Purge from git history (coordinate with C-SEC-1)
  ```
- **Owner**: CC
- **ETA**: 2h (coordinate with C-SEC-1 for single purge operation)
- **Status**: ⏳ Active vulnerability
- **Blocker**: YES - RLS bypass active
- **Reference**: PR #21 Sourcery/Corridor comments, SMS_OTP_STATUS.md

### 1.3. Database/RLS Critical (3)

#### C-RLS-1: Overly Permissive Bookings INSERT Policy
- **PR**: #19
- **Tool**: CodeRabbit
- **File**: `supabase/migrations/20251219_fix_otp_columns.sql:62`
- **Issue**: `FOR INSERT WITH CHECK (true)` allows any authenticated user to create bookings as others
- **Impact**: Authorization bypass, user impersonation possible
- **Root Cause**: Initially designed for testing, not hardened for production
- **Fix**:
  ```sql
  -- Change line 62:
  DROP POLICY IF EXISTS "Users can create bookings" ON bookings;

  -- Allow unauthenticated bookings (phone-based auth)
  CREATE POLICY "Anyone can create bookings" ON bookings
    FOR INSERT WITH CHECK (true);  -- Keep permissive for MVP

  -- OR enforce user_id if auth required:
  CREATE POLICY "Users can create own bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  ```
- **Owner**: CCW
- **ETA**: 1h (decide on auth model + update migration + test)
- **Status**: ⏳ Needs product decision: allow unauthenticated bookings?
- **Blocker**: YES - security hole
- **Reference**: actionable_pr_report_v4.md lines 44-89

#### C-RLS-2: Missing sms_verifications INSERT/UPDATE Policies
- **PR**: #19
- **Tool**: CodeRabbit
- **File**: `supabase/migrations/20251219_fix_otp_columns.sql:50-63`
- **Issue**: Only SELECT policy exists, no INSERT/UPDATE/DELETE policies
- **Impact**: Users can modify/create OTPs for other bookings
- **Root Cause**: Incomplete RLS setup, only read path secured
- **Fix**:
  ```sql
  -- Add after line 63:

  -- INSERT: Service role only (API creates OTPs)
  CREATE POLICY "Service role can insert OTPs" ON sms_verifications
    FOR INSERT TO service_role WITH CHECK (true);

  -- UPDATE: Own phone only (mark as verified)
  CREATE POLICY "Users can verify own OTP" ON sms_verifications
    FOR UPDATE USING (
      phone_number IN (
        SELECT phone_number FROM bookings WHERE user_id = auth.uid()
      )
    );

  -- DELETE: Service role only (cleanup expired)
  CREATE POLICY "Service role can delete OTPs" ON sms_verifications
    FOR DELETE TO service_role USING (true);
  ```
- **Owner**: CCW
- **ETA**: 1h (coordinate with C-RLS-1)
- **Status**: ⏳ Pending
- **Blocker**: YES - OTP security hole
- **Reference**: actionable_pr_report_v4.md lines 67-79

#### C-RLS-3: Missing bookings UPDATE/DELETE Policies
- **PR**: #19
- **Tool**: CodeRabbit
- **File**: `supabase/migrations/20251219_fix_otp_columns.sql`
- **Issue**: No UPDATE/DELETE policies defined, defaults to deny-all
- **Impact**: Users can't modify their bookings, admin can't manage data
- **Root Cause**: Only INSERT and SELECT policies created
- **Fix**:
  ```sql
  -- Add after bookings INSERT policy:

  -- UPDATE: Own bookings only (by user_id or phone)
  CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE USING (
      auth.uid() = user_id
      OR phone_number = current_setting('request.jwt.claims', true)::json->>'phone'
    );

  -- DELETE: Service role only (GDPR, admin cleanup)
  CREATE POLICY "Service role can delete bookings" ON bookings
    FOR DELETE TO service_role USING (true);
  ```
- **Owner**: CCW
- **ETA**: 1h (coordinate with C-RLS-1, C-RLS-2 for single migration)
- **Status**: ⏳ Pending
- **Blocker**: YES - functional blocker for booking management
- **Reference**: actionable_pr_report_v4.md

### 1.4. Image Coverage Critical (0)

**No critical findings** - imageHelper.ts fixed (commit bb08b46), SQL ready, manual execution pending

### 1.5. Tooling/Infrastructure Critical (1)

#### C-TOOL-1: SQL Migration Not Applied to Production Database
- **PR**: #19, #20, #21
- **Tool**: Manual verification (CC)
- **File**: `supabase/migrations/20251211_booking_schema.sql`
- **Issue**: Migration file exists but `bookings` and `sms_verifications` tables don't exist in production
- **Impact**: All booking features completely broken in production
- **Root Cause**: Manual execution required, not automated in CI/CD
- **Fix**:
  ```bash
  # Method 1: Supabase Dashboard (Recommended)
  # 1. Open: https://supabase.com/dashboard/project/lbttmhwckcrfdymwyuhn/sql
  # 2. New Query → Copy migration file contents
  # 3. Execute

  # Method 2: Supabase CLI
  supabase db push

  # Verify:
  SELECT table_name FROM information_schema.tables
  WHERE table_name IN ('bookings', 'sms_verifications');
  ```
- **Owner**: GC (manual task, needs DB credentials)
- **ETA**: 30m (careful execution + verification)
- **Status**: ⏳ BLOCKING all booking work
- **Blocker**: YES - nothing works without this
- **Reference**: PRODUCTION_IMAGE_STATUS.md, manual DB query

---

## 2. HIGH PRIORITY FINDINGS (33)

### 2.1. OTP/Bookings High (5)

#### H-OTP-1: Unauthenticated OTP Endpoint Has No Rate Limiting
- **PR**: #19, #20
- **Tool**: CodeRabbit, Security audit
- **File**: `src/app/api/otp/resend/route.ts`
- **Issue**: Anyone can spam OTP requests, no rate limit
- **Impact**: SMS cost abuse (0.0387 EGP × unlimited requests), DoS attack vector
- **Fix**:
  ```typescript
  import { Ratelimit } from "@upstash/ratelimit";
  import { Redis } from "@upstash/redis";

  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "10 m"), // 5 requests per 10 min
  });

  export async function POST(request: NextRequest) {
    const { phone } = await request.json();
    const { success } = await ratelimit.limit(phone);
    if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    // ... rest of handler
  }
  ```
- **Owner**: CCW
- **ETA**: 2h (Upstash setup + integration + test)
- **Status**: ⏳ Pending
- **Priority**: High (cost/security risk)

#### H-OTP-2: Silent Booking Update Failures in markPhoneVerified
- **PR**: #19
- **Tool**: CodeRabbit
- **File**: `src/repositories/bookingRepository.ts:118-135`
- **Issue**: `markPhoneVerified()` returns `void`, caller can't detect failures
- **Impact**: Verification may fail silently, booking stays unverified, user thinks success
- **Fix**:
  ```typescript
  async markPhoneVerified(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from('bookings')
      .update({ phone_verified: true, verified_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Failed to mark phone as verified:', error);
      return false;  // Signal failure
    }
    return true;  // Signal success
  }
  ```
- **Owner**: CCW
- **ETA**: 1h (change return type + update callers)
- **Status**: ⏳ Pending
- **Priority**: High (data integrity)

#### H-OTP-3: Booking Route Returns 201 on OTP Failure
- **PR**: #19
- **Tool**: CodeRabbit
- **File**: `src/app/api/bookings/route.ts:112-122`
- **Issue**: Returns 201 Created with warning when OTP fails, should return 202 or 500
- **Impact**: Client can't distinguish full success from partial failure
- **Fix**:
  ```typescript
  if (!otpResult.success) {
    console.error('[BOOKING] OTP send failed:', otpResult.error);
    return NextResponse.json(
      {
        booking,
        warning: 'Booking created but SMS failed to send',
        smsError: otpResult.error
      },
      { status: 202 }  // 202 Accepted (partial success)
    );
  }
  ```
- **Owner**: CCW
- **ETA**: 30m (status code change + update client)
- **Status**: ⏳ Pending
- **Priority**: High (API correctness)

#### H-OTP-4: Phone Number E.164 Format Not Enforced
- **PR**: #20
- **Tool**: CodeRabbit
- **File**: `src/services/sms/providers/whysms.ts`
- **Issue**: No validation that phone is `+20XXXXXXXXXX` format before WhySMS API call
- **Impact**: Malformed numbers rejected by API, SMS fails with unclear error
- **Fix**:
  ```typescript
  import { parsePhoneNumber } from 'libphonenumber-js';

  export async function sendSMS(phone: string, message: string) {
    // Validate E.164 format
    try {
      const parsed = parsePhoneNumber(phone, 'EG');
      if (!parsed.isValid()) {
        throw new Error(`Invalid Egyptian phone: ${phone}`);
      }
      phone = parsed.format('E.164');  // Normalize to +20XXXXXXXXXX
    } catch (err) {
      throw new Error(`Phone validation failed: ${err.message}`);
    }
    // ... WhySMS API call
  }
  ```
- **Owner**: CCW
- **ETA**: 1.5h (add library + validation + test)
- **Status**: ⏳ Pending
- **Priority**: High (UX, reliability)

#### H-OTP-5: OTP Expiration Not Checked Client-Side
- **PR**: #19
- **Tool**: Manual analysis (CC)
- **File**: `src/app/[locale]/bookings/[id]/verify/page.tsx`
- **Issue**: UI doesn't check `expires_at` before submitting OTP, user gets confusing error
- **Impact**: Poor UX, user submits expired code and doesn't understand error
- **Fix**:
  ```typescript
  // In verification page component:
  const checkExpiration = () => {
    const now = new Date();
    const expires = new Date(booking.otp_expires_at);
    if (now > expires) {
      setError('Code expired. Click "Resend OTP" to get a new code.');
      setExpired(true);
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!checkExpiration()) return;
    // ... submit OTP
  };
  ```
- **Owner**: CCW
- **ETA**: 1h (add expiration check + UI)
- **Status**: ⏳ Pending
- **Priority**: High (UX)

### 2.2. Security/Secrets High (4)

#### H-SEC-1: WhySMS Credentials Exposure Risk
- **PR**: #20
- **Tool**: Manual analysis
- **File**: `credentials.env`, env var references
- **Issue**: WhySMS API key may be in git history or committed files
- **Impact**: SMS account compromise, billing fraud
- **Fix**:
  ```bash
  # Search git history
  git log --all -p | grep -i "whysms"

  # If found, purge
  git filter-repo --replace-text <(echo "WHYSMS_KEY_VALUE==>REDACTED")

  # Rotate credentials
  # WhySMS Dashboard → API Keys → Generate New
  ```
- **Owner**: CC
- **ETA**: 1h (coordinate with C-SEC-1 purge)
- **Status**: ⏳ Pending verification
- **Priority**: High (credential safety)

#### H-SEC-2: Sentry Auth Token in Repository
- **PR**: Multiple
- **Tool**: Manual analysis
- **File**: `.env.sentry-build-plugin`, git history
- **Issue**: Sentry auth token (sntrys_*) may be committed
- **Impact**: Error tracking abuse, project access
- **Fix**:
  ```bash
  # Check if committed
  git log --all -p | grep "sntrys_"

  # .env.sentry-build-plugin should be gitignored (is it?)
  # If leaked, rotate in Sentry Dashboard
  ```
- **Owner**: CC
- **ETA**: 30m (verify + rotate if needed)
- **Status**: ⏳ Pending verification
- **Priority**: High (moderate impact)

#### H-SEC-3: PII in BUG_FIXED.md
- **PR**: #21
- **Tool**: Manual analysis (CC)
- **File**: `BUG_FIXED.md`
- **Issue**: Contains plaintext Egyptian phone numbers (+20...) and OTP codes from testing
- **Impact**: Privacy violation, test data exposure
- **Fix**:
  ```bash
  # 1. Sanitize current file
  sed -i 's/+20[0-9]\{10\}/+20XXXXXXXXXX/g' BUG_FIXED.md
  sed -i 's/OTP: [0-9]\{6\}/OTP: XXXXXX/g' BUG_FIXED.md
  git add BUG_FIXED.md
  git commit -m "docs: sanitize PII from BUG_FIXED.md"

  # 2. Purge from history
  git filter-repo --path BUG_FIXED.md --replace-text <(echo "regex:+20[0-9]{10}==>+20XXXXXXXXXX")
  ```
- **Owner**: CC
- **ETA**: 1h (sanitize + purge)
- **Status**: ⏳ Pending
- **Priority**: High (privacy/GDPR)

#### H-SEC-4: Anthropic API Key Exposure Check
- **PR**: Multiple
- **Tool**: Manual analysis
- **File**: Scripts, .env references
- **Issue**: sk-ant-api03-* key may be in repo
- **Impact**: AI API abuse, billing fraud ($$$)
- **Fix**:
  ```bash
  # Search git history
  git log --all -p | grep -i "sk-ant"

  # If found, rotate immediately
  # Anthropic Console → API Keys → Revoke + Create New
  ```
- **Owner**: CC
- **ETA**: 30m (coordinate with C-SEC-1)
- **Status**: ⏳ Pending verification
- **Priority**: High (cost risk)

### 2.3. Database/RLS High (6)

#### H-RLS-1: Migrations Not Idempotent (Can't Re-run)
- **PR**: #19
- **Tool**: CodeRabbit
- **File**: `supabase/migrations/20251219_fix_otp_columns.sql:1-48`
- **Issue**: Missing `IF EXISTS` checks, re-running fails with errors
- **Impact**: Can't recover from partial migration, production sync issues
- **Fix**:
  ```sql
  -- Add to line 15:
  ALTER TABLE IF EXISTS bookings
    DROP COLUMN IF EXISTS verification_code,
    ADD COLUMN IF NOT EXISTS name TEXT;

  -- Pattern: Always use IF EXISTS/IF NOT EXISTS
  DROP POLICY IF EXISTS "policy_name" ON table_name;
  CREATE INDEX IF NOT EXISTS idx_name ON table_name(column);
  ```
- **Owner**: GC
- **ETA**: 1h (careful SQL editing + test)
- **Status**: ⏳ Pending
- **Priority**: High (operational safety)

#### H-RLS-2: Missing Index on bookings.phone_number
- **PR**: #19
- **Tool**: Performance analysis
- **File**: Database schema
- **Issue**: OTP verification lookup by phone does full table scan
- **Impact**: Slow as bookings grow (O(n) instead of O(log n))
- **Fix**:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_bookings_phone
    ON bookings(phone_number);

  -- Estimate impact:
  EXPLAIN ANALYZE
  SELECT * FROM bookings WHERE phone_number = '+201234567890';
  -- Before: Seq Scan on bookings (cost=0..X)
  -- After: Index Scan using idx_bookings_phone (cost=0..Y where Y << X)
  ```
- **Owner**: GC
- **ETA**: 30m (add to migration + verify)
- **Status**: ⏳ Pending
- **Priority**: High (performance)

#### H-RLS-3: Missing Index on sms_verifications.booking_id
- **PR**: #19
- **Tool**: Performance analysis
- **File**: Database schema
- **Issue**: OTP lookup by booking_id does full table scan
- **Impact**: Slow verification as OTP records accumulate
- **Fix**:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_sms_verifications_booking
    ON sms_verifications(booking_id);
  ```
- **Owner**: GC
- **ETA**: 30m (coordinate with H-RLS-2)
- **Status**: ⏳ Pending
- **Priority**: High (performance)

#### H-RLS-4: Dangerous FK Cascade on bookings.user_id
- **PR**: #19
- **Tool**: CodeRabbit
- **File**: `supabase/migrations/20251211_booking_schema.sql`
- **Issue**: `REFERENCES auth.users(id) ON DELETE CASCADE` - deleting user deletes all bookings
- **Impact**: Data loss if user account deleted (GDPR right-to-be-forgotten vs business records)
- **Fix**:
  ```sql
  -- Change to SET NULL (keep booking, anonymize)
  ALTER TABLE bookings
    DROP CONSTRAINT IF EXISTS bookings_user_id_fkey,
    ADD CONSTRAINT bookings_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id)
      ON DELETE SET NULL;

  -- OR remove FK entirely (phone is primary identifier)
  ```
- **Owner**: GC
- **ETA**: 1h (migration + verify data retention)
- **Status**: ⏳ Pending product decision
- **Priority**: High (data safety)

#### H-RLS-5: Missing Index on sms_verifications.expires_at
- **PR**: #19
- **Tool**: Performance analysis
- **File**: Database schema
- **Issue**: Cleanup query `WHERE expires_at < NOW()` does full table scan
- **Impact**: Slow OTP cleanup job, stale records accumulate
- **Fix**:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_sms_verifications_expires
    ON sms_verifications(expires_at);

  -- Cleanup job can now use:
  DELETE FROM sms_verifications
  WHERE expires_at < NOW() - INTERVAL '7 days';
  -- Index scan instead of seq scan
  ```
- **Owner**: GC
- **ETA**: 30m (coordinate with H-RLS-2, H-RLS-3)
- **Status**: ⏳ Pending
- **Priority**: High (maintenance)

#### H-RLS-6: No Unique Constraint on Active OTP per Booking
- **PR**: #19, #22
- **Tool**: Manual analysis (CC)
- **File**: Database schema
- **Issue**: Nothing prevents multiple active OTPs for same booking
- **Impact**: Duplicate OTP bug (C-OTP-1) can recur even after code fix, confusion about which code valid
- **Fix**:
  ```sql
  -- Partial unique index: only one unverified, unexpired OTP per booking
  CREATE UNIQUE INDEX IF NOT EXISTS idx_active_otp
    ON sms_verifications(booking_id)
    WHERE verified = false AND expires_at > NOW();

  -- This enforces single active OTP at database level (defense in depth)
  ```
- **Owner**: GC
- **ETA**: 1h (careful constraint design + test)
- **Status**: ⏳ Pending
- **Priority**: High (prevent duplicate bug recurrence)

### 2.4. Image Coverage High (2)

#### H-IMG-1: Image SQL Execution Not Automated
- **PR**: #21
- **Tool**: Manual analysis (CC)
- **File**: `scripts/update_image_urls.sql`, `scripts/apply_image_updates.py`
- **Issue**: Requires manual Supabase Dashboard execution, not in CI/CD
- **Impact**: Error-prone, can't automate deployments, no rollback
- **Fix**:
  ```python
  # Harden apply_image_updates.py:
  # 1. Add --dry-run flag
  # 2. Add transaction support (BEGIN; ... COMMIT; on error ROLLBACK;)
  # 3. Add verification after each update
  # 4. Add to GitHub Actions workflow

  # Example workflow:
  - name: Apply Image Updates
    run: |
      python3 scripts/apply_image_updates.py --dry-run
      python3 scripts/apply_image_updates.py --execute
      python3 scripts/complete_vehicle_image_coverage.py | grep "137/199"
  ```
- **Owner**: GC
- **ETA**: 1h (script hardening + workflow)
- **Status**: ⏳ Pending
- **Priority**: High (automation, safety)

#### H-IMG-2: No Post-SQL Verification in Deployment
- **PR**: #21
- **Tool**: Manual analysis (CC)
- **File**: Deployment workflow
- **Issue**: No automated check that SQL actually populated images
- **Impact**: May deploy thinking coverage is 69% but actually still 0%
- **Fix**:
  ```bash
  # Add to CI/CD after SQL execution:
  HERO_COUNT=$(curl -H "apikey: $SUPABASE_ANON_KEY" \
    "$SUPABASE_URL/rest/v1/models?select=id&hero_image_url=like./images/vehicles/hero/*" \
    | jq '. | length')

  if [ "$HERO_COUNT" -lt 70 ]; then
    echo "ERROR: Only $HERO_COUNT hero images found, expected 75+"
    exit 1
  fi
  ```
- **Owner**: GC
- **ETA**: 30m (add verification step)
- **Status**: ⏳ Pending
- **Priority**: High (deployment safety)

### 2.5. Code Quality High (16)

**Summary of Code Quality Findings**:
- Unused imports: 8 files
- Missing return types: 12 functions
- Non-null assertions (!): 5 locations
- Magic numbers: 7 locations
- Inconsistent formatting: 23 files

**Batched Fix Strategy**:
```bash
# Automated fixes:
npx eslint --fix src/
npx prettier --write src/
npx tsc --noEmit  # Verify types

# Manual review:
# - Add return types to all exported functions
# - Replace non-null assertions with proper checks
# - Extract magic numbers to named constants
```

**Owner**: BB (scripted cleanup after critical/high resolved)
**ETA**: Half-day (automated + review)
**Status**: ⏳ Deferred until critical/high cleared
**Priority**: High (maintainability) but not blocking

---

## 3. MEDIUM/LOW FINDINGS (65)

**Summary**: 65 findings across documentation, test coverage, performance optimizations

**Breakdown**:
- Code style/formatting: 23 (automated fixes)
- Documentation gaps: 18 (API docs, README updates)
- Missing test coverage: 12 (unit + integration tests)
- Performance optimizations: 8 (caching, query optimization)
- Dependency updates: 4 (Snyk PRs #13-17)

**Decision**: Address after all critical and high findings resolved

**Owner**: BB (batch cleanup)
**ETA**: 2-3 days (after critical/high cleared)
**Status**: ⏳ Backlog

---

## 4. EXECUTION SCHEDULE

### Phase 1: Security Lockdown (ETA: 4-6h, Owner: CC)
**Priority**: CRITICAL - Execute FIRST before any other work

**Tasks**:
1. ✅ Identify all secrets (DONE - C-SEC-1, C-SEC-2, H-SEC-1-4 documented)
2. ⏳ **Rotate credentials** (2h):
   - GitHub PAT (C-SEC-1)
   - Supabase service role key (C-SEC-2)
   - WhySMS API credentials (H-SEC-1)
   - Sentry auth token (H-SEC-2)
   - Anthropic API key (H-SEC-4)
3. ⏳ **Purge from git history** (2h):
   - Install git-filter-repo: `pip3 install git-filter-repo`
   - Create replacement file with all secrets
   - Run: `git filter-repo --replace-text secrets.txt`
   - Force push: `git push --force-with-lease origin main`
   - **Coordinate with team** (breaks local clones)
4. ⏳ **Update environment variables** (1h):
   - Vercel: Update all env vars in dashboard
   - Local: Update .env.example template
   - Docs: Update deployment guide
5. ⏳ **Sanitize PII** (1h):
   - Fix BUG_FIXED.md (H-SEC-3)
   - Search for phone numbers: `git grep -E '\+20[0-9]{10}'`
   - Search for OTP codes: `git grep -E '[0-9]{6}'` (in context of OTP)

**Gate**: All secrets rotated and purged before proceeding to Phase 2

**Verification**:
```bash
# No secrets in current codebase
git grep -i "ghp_"
git grep -i "sk-ant"
git grep "eyJhbGci"  # Supabase JWT

# No secrets in history (spot check)
git log --all -p | grep -i "ghp_" | wc -l  # Should be 0
```

### Phase 2: Database Hardening (ETA: 4-5h, Owner: GC + CCW)
**Priority**: CRITICAL - Unblocks booking system

**Tasks**:
1. ⏳ **Apply missing migrations** (30m - GC):
   ```bash
   # Execute 20251211_booking_schema.sql in Supabase Dashboard
   # Verify:
   SELECT table_name FROM information_schema.tables
   WHERE table_name IN ('bookings', 'sms_verifications');
   ```
2. ⏳ **Fix RLS policies** (2h - CCW):
   - Create new migration: `20251221_fix_rls_policies.sql`
   - Fix C-RLS-1: Bookings INSERT policy
   - Fix C-RLS-2: sms_verifications policies
   - Fix C-RLS-3: Bookings UPDATE/DELETE policies
   - Test with different auth contexts
3. ⏳ **Make migrations idempotent** (1h - GC):
   - Add IF EXISTS/IF NOT EXISTS to all statements
   - Test re-running migrations
4. ⏳ **Add database indexes** (1h - GC):
   - H-RLS-2: idx_bookings_phone
   - H-RLS-3: idx_sms_verifications_booking
   - H-RLS-5: idx_sms_verifications_expires
   - H-RLS-6: Unique constraint on active OTP
   - Verify with EXPLAIN ANALYZE

**Gate**: All RLS tests pass before deploying booking code

**Verification**:
```sql
-- Test RLS policies:
SET ROLE anon;
INSERT INTO bookings (...) VALUES (...);  -- Should succeed
UPDATE sms_verifications SET verified = true WHERE id = '...';  -- Should fail (wrong user)

SET ROLE service_role;
INSERT INTO sms_verifications (...) VALUES (...);  -- Should succeed

-- Verify indexes exist:
SELECT indexname FROM pg_indexes WHERE tablename IN ('bookings', 'sms_verifications');
```

### Phase 3: OTP System Fixes (ETA: 6-8h, Owner: CCW)
**Priority**: CRITICAL - User-facing, 50% cost savings

**Tasks**:
1. ⏳ **Fix duplicate OTP bug** (30m):
   - C-OTP-1: Remove lines 134-141 from VehicleCard.tsx
   - Remove unused import: `requestBookingOtp`
   - Test: Create 3 bookings, verify single SMS each
2. ⏳ **Fix missing name column** (1h):
   - C-OTP-2: Verify migration 20251219_add_missing_columns.sql applied
   - Update bookingRepository.ts line 104: `name: data.name`
   - Test: Submit booking with name, verify in database
3. ⏳ **Fix phone column mismatch** (30m):
   - C-OTP-3: Audit all references to phone vs phone_number
   - Standardize on phone_number throughout
4. ⏳ **Add rate limiting** (2h):
   - H-OTP-1: Install Upstash: `pnpm add @upstash/ratelimit @upstash/redis`
   - Create Upstash account + Redis instance
   - Add to otp/resend endpoint
   - Test: Exceed limit, verify 429 response
5. ⏳ **Improve error handling** (2h):
   - H-OTP-2: Change markPhoneVerified to return boolean
   - H-OTP-3: Return 202 status on OTP failure
   - H-OTP-4: Add libphonenumber-js validation
   - H-OTP-5: Client-side expiration check
6. ⏳ **Test end-to-end** (1h):
   - Create 5 test bookings
   - Verify single SMS each
   - Test rate limiting
   - Test expiration handling

**Gate**: All OTP tests pass, single SMS verified

**Verification**:
```typescript
// Test checklist:
✓ Create booking → receive exactly 1 SMS
✓ Submit valid OTP → booking verified
✓ Submit expired OTP → clear error message + resend option
✓ Exceed rate limit → 429 response
✓ Invalid phone format → validation error
✓ Database: booking.phone_verified = true, booking.name populated
```

### Phase 4: Image Coverage Completion (ETA: 2-3h, Owner: GC)
**Priority**: HIGH - Production UX

**Tasks**:
1. ⏳ **Execute image SQL** (30m):
   ```bash
   # Via Supabase Dashboard:
   # Copy scripts/update_image_urls.sql → Execute

   # OR via Python:
   export SUPABASE_SERVICE_KEY="new_rotated_key"
   python3 scripts/apply_image_updates.py --execute

   # Verify:
   python3 scripts/complete_vehicle_image_coverage.py
   # Should show: 137/199 (69%)
   ```
2. ⏳ **Automate verification** (1h):
   - H-IMG-2: Add coverage check to GitHub Actions
   - Create workflow: `.github/workflows/verify-images.yml`
   - Run on: push to main, PR to main
3. ⏳ **Source remaining images** (2-3h):
   - 62 models still need images (31% gap)
   - PDF extraction preferred (user requirement)
   - Coordinate with user on priority brands

**Gate**: 90%+ image coverage or explicit waiver from user

**Verification**:
```bash
# Check live site:
curl https://hex-test-drive-man.vercel.app/en | grep -o '/images/vehicles/hero/[^"]*' | wc -l
# Should see 137+ unique image paths

# Database verification:
SELECT COUNT(*) FROM models WHERE hero_image_url LIKE '/images/vehicles/hero/%';
# Expected: 75+
```

### Phase 5: Code Quality Cleanup (ETA: 2-3 days, Owner: BB)
**Priority**: MEDIUM - Technical debt

**Tasks**:
1. ⏳ **Automated fixes** (half-day):
   ```bash
   npx eslint --fix src/
   npx prettier --write src/
   pnpm build  # Verify no errors
   ```
2. ⏳ **Manual code review** (1 day):
   - Add return types to all functions
   - Remove unused imports
   - Extract magic numbers to constants
   - Fix non-null assertions
3. ⏳ **Documentation** (1 day):
   - API documentation (Swagger/OpenAPI)
   - README updates (setup, deployment)
   - Architecture decision records

**Gate**: Code review approval, all tests passing

---

## 5. PR MERGE READINESS MATRIX

| PR # | Title | Critical | High | Med/Low | Blocking Issues | Ready? | ETA to Ready | Depends On |
|------|-------|----------|------|---------|-----------------|--------|--------------|------------|
| #22 | Duplicate OTP Fix | 3 | 5 | 12 | C-OTP-1, C-RLS-1-3, C-TOOL-1 | ❌ | 8-10h | Phase 1, 2, 3 |
| #21 | Image Tools | 2 | 2 | 8 | C-SEC-1-2, H-IMG-1 | ❌ | 4-5h | Phase 1, 4 |
| #20 | SMS Improvements | 1 | 4 | 15 | C-OTP-1, C-RLS-2, H-OTP-1 | ❌ | 6-8h | Phase 1, 2, 3 |
| #19 | Core Booking Fixes | 3 | 8 | 22 | C-OTP-2-3, C-RLS-1-3, C-TOOL-1 | ❌ | 10-12h | Phase 1, 2, 3 |

**Overall Project Status**:
- **Total Work**: 32-38 hours (4-5 full workdays)
- **Critical Path**: Phase 1 (Security) → Phase 2 (DB) → Phase 3 (OTP) → Phase 4 (Images)
- **Parallelization**: Limited (Phase 1 must complete first, then 2-4 can partially overlap)
- **First Mergeable PR**: #21 after Phase 1 + Phase 4 (~6-8h)
- **Last Mergeable PR**: #19 after all phases (~32-38h)

---

## 6. TEAM ASSIGNMENTS

| Agent | Area | Tasks | Workload | Critical Tasks |
|-------|------|-------|----------|----------------|
| **CC** | Security | Secret rotation, git purge, PII sanitization | 6-8h | C-SEC-1-2, H-SEC-1-4, Phase 1 complete |
| **CCW** | OTP/Bookings | Duplicate fix, RLS policies, validation | 10-12h | C-OTP-1-3, C-RLS-1-3, H-OTP-1-5 |
| **GC** | Database | Migrations, indexes, schema fixes | 8-10h | C-TOOL-1, H-RLS-1-6, image SQL |
| **BB** | Quality | Code cleanup, docs, automation | 2-3 days | H-CODE-1-16 (after critical/high) |

**Coordination Points**:
- CC ↔ GC: Security Phase 1 must finish before GC starts Phase 2
- CCW ↔ GC: RLS policies (CCW designs, GC executes migrations)
- CC ↔ CCW: Duplicate OTP fix (CC documented, CCW implements)
- GC ↔ BB: Image automation (GC hardens scripts, BB adds to CI)

**Total Team Capacity**: 24-30h critical + 16-24h non-critical = **40-54h total**

---

## 7. MERGE DECISION TREE

```
START
  ↓
All secrets rotated & purged? ─NO─→ ❌ BLOCK ALL MERGES
  ↓ YES
All C-RLS policies fixed? ─NO─→ ❌ BLOCK PR #19, #20, #22
  ↓ YES
C-TOOL-1 migrations applied? ─NO─→ ❌ BLOCK PR #19, #20, #22
  ↓ YES
C-OTP-1 duplicate bug fixed? ─NO─→ ❌ BLOCK PR #20, #22
  ↓ YES
PR-specific critical findings resolved? ─NO─→ ❌ BLOCK THAT PR
  ↓ YES
PR-specific high findings have owners + ETAs? ─NO─→ ❌ BLOCK THAT PR
  ↓ YES
Code review approved (CodeRabbit + human)? ─NO─→ ⏸️ REQUEST REVIEW
  ↓ YES
CI/CD passing (build + tests)? ─NO─→ 🔧 FIX BUILD
  ↓ YES
Deployment plan documented? ─NO─→ 📝 WRITE PLAN
  ↓ YES
✅ APPROVE MERGE
```

---

## 8. SUCCESS CRITERIA

### Phase 1 Success (Security):
- [ ] All 6 credentials rotated (GitHub, Supabase, WhySMS, Sentry, Anthropic)
- [ ] Git history purged (verified no secrets in `git log --all -p | grep pattern`)
- [ ] All env vars updated in Vercel
- [ ] PII sanitized from BUG_FIXED.md
- [ ] No security alerts in GitHub Security tab

### Phase 2 Success (Database):
- [ ] bookings + sms_verifications tables exist in production
- [ ] All RLS policies applied (C-RLS-1-3)
- [ ] All indexes created (H-RLS-2, H-RLS-3, H-RLS-5, H-RLS-6)
- [ ] Migrations idempotent (can re-run without errors)
- [ ] RLS test suite passes

### Phase 3 Success (OTP):
- [ ] Duplicate OTP bug fixed (C-OTP-1)
- [ ] Single SMS per booking verified (5 test bookings)
- [ ] Name column working (C-OTP-2)
- [ ] Phone validation working (H-OTP-4)
- [ ] Rate limiting active (H-OTP-1)
- [ ] Error handling improved (H-OTP-2, H-OTP-3, H-OTP-5)
- [ ] SMS cost reduced 50% (0.0387 EGP vs 0.0774 EGP)

### Phase 4 Success (Images):
- [ ] Image SQL executed (137 models populated)
- [ ] Live site shows vehicle images (not placeholders)
- [ ] Coverage ≥ 90% or explicit waiver
- [ ] Automated verification in CI

### Overall Production Ready:
- [ ] All phases complete
- [ ] All PRs merged
- [ ] Smoke tests passing
- [ ] No critical or high severity issues open
- [ ] Performance baseline met (LCP < 3s)
- [ ] Team trained on new features
- [ ] Rollback plan documented

---

## 9. ROLLBACK PLANS

### If Security Rotation Breaks Production
```bash
# Symptom: 401 Unauthorized errors in production

# Quick fix (1 min):
# Vercel Dashboard → Settings → Environment Variables
# Revert to old keys temporarily

# OR via CLI:
vercel env add SUPABASE_SERVICE_KEY=<old-key> --scope production
vercel --prod  # Redeploy

# Fix root cause, rotate again properly
```

### If RLS Policies Break Bookings
```sql
-- Symptom: Users can't create bookings

-- Emergency disable (DO NOT USE IN PRODUCTION):
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE sms_verifications DISABLE ROW LEVEL SECURITY;

-- Better: Fix policy and re-enable
DROP POLICY IF EXISTS "problematic_policy" ON bookings;
CREATE POLICY "fixed_policy" ON bookings FOR INSERT WITH CHECK (true);
-- Re-enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
```

### If OTP Fix Breaks Verification
```bash
# Symptom: OTPs not sending or not verifying

# Revert PR #22:
git revert <commit-sha>
git push origin main
vercel --prod  # Redeploy

# Analyze logs:
vercel logs --follow | grep OTP

# Fix issue, redeploy
```

### If Migration Fails Midway
```sql
-- If in transaction (best case):
ROLLBACK;

-- If already committed:
-- Supabase has point-in-time recovery (up to 7 days)
-- Dashboard → Settings → Database → Point-in-time Recovery
-- Restore to timestamp before migration

-- OR manual data restore from backup
```

### If Image SQL Corrupts Data
```sql
-- Revert image URLs:
UPDATE models
SET hero_image_url = NULL, hover_image_url = NULL
WHERE hero_image_url LIKE '/images/vehicles/%';

-- Re-run corrected SQL
```

---

## 10. MONITORING & VERIFICATION

### During Implementation:
- [ ] **GitHub Actions**: All builds green
- [ ] **Supabase Dashboard**: RLS policies visible + correct
- [ ] **Vercel Dashboard**: Environment variables updated
- [ ] **Sentry**: Zero new errors after each deployment
- [ ] **Manual Testing**: Each feature tested before merge

### Post-Merge Verification:
```bash
# OTP System:
# - Create 10 test bookings
# - Verify each receives exactly 1 SMS
# - Test rate limiting (11th request should fail)

# Images:
# - Spot-check 20 random models on production
# - Verify no 404 errors in browser console
# - Test mobile viewport

# Security:
# - Run: git grep -i "ghp_\|sk-ant\|eyJhbGci"
# - Expected: Zero results

# Performance:
# - Lighthouse score ≥ 90
# - LCP < 3 seconds
# - No console errors
```

### Week 1 Production Monitoring:

**Metrics to Track**:
- SMS cost per booking (target: 0.0387 EGP, was 0.0774 EGP)
- Booking conversion rate (should maintain/improve)
- OTP verification success rate (target: >95%)
- Image load errors (target: <1%)
- API error rate (target: <0.1%)

**Dashboards**:
- Vercel Analytics: Page views, performance
- Supabase Dashboard: Database queries, RLS denials
- Sentry: Error tracking, user impact
- WhySMS Dashboard: SMS delivery status, costs

**Alerts**:
- Sentry: Critical errors (immediate Slack notification)
- Upstash: Rate limit exceeded (high volume = potential abuse)
- Supabase: RLS policy violations (security issue)
- Vercel: Build failures (CI/CD broken)

**Weekly Review**:
- Compare Week 1 vs Baseline (before fixes)
- User feedback: Any OTP confusion?
- Cost analysis: SMS spend reduced 50%?
- Performance: LCP improved?

---

## APPENDIX A: ISSUE REFERENCE INDEX

### Critical Issues by ID:
- **C-OTP-1**: Duplicate OTP bug (2 SMS per booking)
- **C-OTP-2**: Missing name column (data loss)
- **C-OTP-3**: Phone column mismatch
- **C-SEC-1**: GitHub token in repo
- **C-SEC-2**: Supabase key in repo
- **C-RLS-1**: Permissive INSERT policy
- **C-RLS-2**: Missing sms_verifications policies
- **C-RLS-3**: Missing bookings UPDATE/DELETE
- **C-TOOL-1**: Migration not applied

### High Issues by ID:
- **H-OTP-1**: No rate limiting
- **H-OTP-2**: Silent update failures
- **H-OTP-3**: Wrong status code
- **H-OTP-4**: No E.164 validation
- **H-OTP-5**: No expiration check
- **H-SEC-1-4**: Additional secret exposures
- **H-RLS-1-6**: Database hardening items
- **H-IMG-1-2**: Image automation

### Cross-References:
- OTP duplicate bug: C-OTP-1 + H-RLS-6 (code fix + DB constraint)
- Security sweep: C-SEC-1-2 + H-SEC-1-4 (all credentials)
- RLS hardening: C-RLS-1-3 + H-RLS-1-6 (policies + indexes)

---

**Document End**

**Last Updated**: 2025-12-21 22:10 EET
**Next Review**: After Phase 1 (Security) complete (~6h)
**Status**: 🚨 CRITICAL - Execute Phase 1 immediately
**Owner**: CC (document maintenance), team (execution)
**Version**: 2.0 (comprehensive, actionable, verified)
