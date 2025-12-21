# Execution Order for MVP 1.x - Immediate Tasks
**Generated**: 2025-12-21 23:55 EET
**Phase**: MVP 1.x (0-Security, Working Demo)
**Note**: CCW quota-locked, all OTP work reassigned to GC
**Security**: Credentials allowed in repo until Post-MVP 3.x

---

## CRITICAL PRIORITY (Next 4-6 hours)

### 1. OTP Regression Investigation + Fix (2-3h, GC + CC supervision)
**Status**: 🔴 BLOCKING - OTP system broken
**Owner**: GC (CC supervises)
**Original Owner**: CCW (quota-locked)

**Task**: Investigate and restore single-SMS behavior

**Steps**:
1. **Verify Current Behavior** (15min):
   ```bash
   # Test booking flow on current main branch
   # Expected: 2 SMS sent per booking
   # Record: Timestamps, phone numbers, OTP codes received
   ```

2. **Identify Root Cause** (30min):
   - Read `src/components/VehicleCard.tsx:130-145`
   - Read `src/app/api/bookings/route.ts:105-130`
   - Confirm duplicate call: Client + Server both send OTP
   - Reference: SMS_OTP_STATUS.md lines 67-106

3. **Apply Fix** (15min):
   ```typescript
   // File: src/components/VehicleCard.tsx
   // Line 134-141: REMOVE this block:
   const otpResult = await requestBookingOtp({
     phone: formData.phone,
     subjectId: booking.id,
   });
   if (!otpResult.success) {
     throw new Error(otpResult.error || 'Failed to send OTP');
   }

   // Line 133: REMOVE unused import
   import { requestBookingOtp } from '@/actions/bookingActions';

   // Line 144: KEEP redirect only
   router.push(`/${language}/bookings/${booking.id}/verify`);
   ```

4. **Test Fix** (45min):
   - Create 5 test bookings
   - Verify each receives EXACTLY 1 SMS
   - Check database: 1 sms_verifications record per booking
   - Verify OTP verification still works
   - Test expiration handling

5. **Document** (15min):
   - Update SMS_OTP_STATUS.md with resolution
   - Create docs/OTP_REGRESSION_FIX.md with before/after

**Success Criteria**:
- [ ] 5 consecutive bookings receive single SMS each
- [ ] Database has 1 OTP record per booking (not 2)
- [ ] OTP verification flow works end-to-end
- [ ] SMS cost: 0.0387 EGP per booking (not 0.0774 EGP)

---

### 2. Database Migration Application (30-45min, GC)
**Status**: 🔴 BLOCKING - Booking tables don't exist in production
**Owner**: GC
**Prerequisite**: Supabase credentials (available in repo per 0-security policy)

**Task**: Apply missing migrations to production database

**Steps**:
1. **Verify Current State** (5min):
   ```sql
   -- Supabase SQL Editor: https://supabase.com/dashboard/project/lbttmhwckcrfdymwyuhn/sql
   SELECT table_name FROM information_schema.tables
   WHERE table_name IN ('bookings', 'sms_verifications');
   -- Expected: 0 rows (tables don't exist)
   ```

2. **Apply Migrations** (15min):
   ```bash
   # Method 1: Supabase Dashboard (Recommended)
   # 1. Open: https://supabase.com/dashboard/project/lbttmhwckcrfdymwyuhn/sql
   # 2. New Query → Copy contents of:
   #    - supabase/migrations/20251211_booking_schema.sql
   #    - supabase/migrations/20251219_add_missing_columns.sql
   #    - supabase/migrations/20251219_fix_otp_columns.sql
   # 3. Execute each in order

   # Method 2: Supabase CLI
   supabase db push

   # Method 3: Python script
   export SUPABASE_SERVICE_KEY="<from_repo_scripts>"
   python3 scripts/apply_migrations.py  # If exists
   ```

3. **Verify Application** (5min):
   ```sql
   -- Check tables exist:
   SELECT table_name, column_name, data_type
   FROM information_schema.columns
   WHERE table_name IN ('bookings', 'sms_verifications')
   ORDER BY table_name, ordinal_position;

   -- Expected: bookings (12 columns), sms_verifications (7 columns)
   ```

4. **Test Insert** (10min):
   ```sql
   -- Test booking creation:
   INSERT INTO bookings (vehicle_id, phone_number, test_drive_date, test_drive_location, name)
   VALUES (gen_random_uuid(), '+201234567890', NOW() + INTERVAL '2 days', 'Cairo Showroom', 'Test User')
   RETURNING id;

   -- Test OTP creation:
   INSERT INTO sms_verifications (booking_id, phone_number, otp, expires_at)
   VALUES ('<booking_id>', '+201234567890', '123456', NOW() + INTERVAL '10 minutes')
   RETURNING id;

   -- Cleanup test data:
   DELETE FROM sms_verifications WHERE phone_number = '+201234567890';
   DELETE FROM bookings WHERE phone_number = '+201234567890';
   ```

5. **Document** (5min):
   - Update PRODUCTION_IMAGE_STATUS.md: Migration status = Applied
   - Note: Timestamp of application

**Success Criteria**:
- [ ] bookings table exists with 12 columns
- [ ] sms_verifications table exists with 7 columns
- [ ] Test INSERT/SELECT works
- [ ] RLS policies enabled (verified in Supabase Dashboard)

---

### 3. Fix Missing RLS Policies (1-1.5h, GC + CC review)
**Status**: 🟡 HIGH - Security holes in database
**Owner**: GC (CC reviews SQL before execution)
**Original Owner**: CCW

**Task**: Add missing RLS policies to prevent authorization bypass

**Steps**:
1. **Create Migration File** (30min):
   ```bash
   # File: supabase/migrations/20251222_fix_rls_policies.sql
   ```

   ```sql
   -- Fix 1: Bookings INSERT policy (currently too permissive)
   DROP POLICY IF EXISTS "Users can create bookings" ON bookings;

   -- Allow unauthenticated bookings (phone-based auth for MVP)
   CREATE POLICY "Anyone can create bookings" ON bookings
     FOR INSERT WITH CHECK (true);

   -- Fix 2: sms_verifications policies (currently missing)
   -- INSERT: Service role only (API creates OTPs)
   CREATE POLICY "Service role can insert OTPs" ON sms_verifications
     FOR INSERT TO service_role WITH CHECK (true);

   -- UPDATE: Users can mark their own OTP as verified
   CREATE POLICY "Users can verify own OTP" ON sms_verifications
     FOR UPDATE USING (
       phone_number IN (
         SELECT phone_number FROM bookings
         WHERE phone_number = sms_verifications.phone_number
       )
     );

   -- Fix 3: bookings UPDATE/DELETE policies (currently missing)
   CREATE POLICY "Users can update own bookings" ON bookings
     FOR UPDATE USING (
       phone_number = current_setting('request.jwt.claims', true)::json->>'phone'
     );

   -- DELETE: Service role only (admin cleanup)
   CREATE POLICY "Service role can delete bookings" ON bookings
     FOR DELETE TO service_role USING (true);
   ```

2. **CC Review** (15min):
   - Review SQL for correctness
   - Verify policy logic matches business requirements
   - Approve for execution

3. **Apply Migration** (15min):
   - Execute in Supabase Dashboard
   - Verify no errors

4. **Test Policies** (30min):
   ```sql
   -- Test 1: Anon can create booking
   SET ROLE anon;
   INSERT INTO bookings (...) VALUES (...);  -- Should succeed

   -- Test 2: Anon cannot modify other's booking
   UPDATE bookings SET status = 'cancelled' WHERE id = '<other_user_booking>';  -- Should fail

   -- Test 3: Service role can insert OTP
   SET ROLE service_role;
   INSERT INTO sms_verifications (...) VALUES (...);  -- Should succeed

   -- Test 4: User can update own OTP
   SET ROLE authenticated;
   UPDATE sms_verifications SET verified = true WHERE phone_number = '<own_phone>';  -- Should succeed
   ```

**Success Criteria**:
- [ ] All 5 policies applied without errors
- [ ] Anonymous users can create bookings
- [ ] Users cannot modify others' bookings
- [ ] Service role can manage OTPs
- [ ] Test cases all pass

---

## HIGH PRIORITY (Next 2-4 hours)

### 4. Image Coverage Completion (2-3h, GC)
**Status**: 🟡 HIGH - 0% coverage, production UX broken
**Owner**: GC
**Prerequisite**: OTP regression fixed (Task #1)

**Task**: Execute image SQL and verify production coverage

**Steps**:
1. **Execute Image SQL** (30min):
   ```bash
   # Using Supabase Dashboard:
   # Open: https://supabase.com/dashboard/project/lbttmhwckcrfdymwyuhn/sql
   # Copy: scripts/update_image_urls.sql (137 UPDATE statements)
   # Execute
   # Expected: 137 rows affected

   # OR using Python:
   export SUPABASE_SERVICE_KEY="<from_repo>"
   python3 scripts/apply_image_updates.py --execute
   ```

2. **Verify Coverage** (15min):
   ```bash
   python3 scripts/complete_vehicle_image_coverage.py
   # Expected output:
   # Hero images: 75/199 (38%)
   # Hover images: 60/199 (30%)
   # Total populated: 137/199 (69%)
   ```

3. **Check Live Site** (15min):
   ```bash
   # After Vercel deployment:
   curl https://hex-test-drive-man.vercel.app/en | grep -o '/images/vehicles/hero/[^"]*' | wc -l
   # Expected: 75+ unique paths

   # Browser check:
   # Open: https://hex-test-drive-man.vercel.app/en
   # Verify: Vehicle cards show images (not placeholders)
   # Check console: No 404 errors for images
   ```

4. **Source Remaining Images** (1-2h):
   - 62 models still need images (31% gap)
   - PDF extraction preferred (user requirement)
   - Coordinate with user on priority brands

**Success Criteria**:
- [ ] 137 models populated with images (69% coverage)
- [ ] Live site shows vehicle images
- [ ] No 404 errors in browser console
- [ ] Remaining 31% gap documented with plan

---

### 5. Add Database Indexes (30-45min, GC)
**Status**: 🟡 HIGH - Performance degradation as data grows
**Owner**: GC
**Prerequisite**: Migrations applied (Task #2)

**Task**: Add missing indexes for OTP lookup performance

**Migration**:
```sql
-- File: supabase/migrations/20251222_add_indexes.sql

-- Index 1: Booking phone lookup (for OTP verification)
CREATE INDEX IF NOT EXISTS idx_bookings_phone
  ON bookings(phone_number);

-- Index 2: OTP booking lookup
CREATE INDEX IF NOT EXISTS idx_sms_verifications_booking
  ON sms_verifications(booking_id);

-- Index 3: OTP expiration cleanup
CREATE INDEX IF NOT EXISTS idx_sms_verifications_expires
  ON sms_verifications(expires_at);

-- Index 4: Prevent duplicate active OTPs (defense in depth)
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_otp
  ON sms_verifications(booking_id)
  WHERE verified = false AND expires_at > NOW();
```

**Verification**:
```sql
-- Check indexes exist:
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('bookings', 'sms_verifications');

-- Test performance:
EXPLAIN ANALYZE
SELECT * FROM bookings WHERE phone_number = '+201234567890';
-- Should use Index Scan (not Seq Scan)
```

**Success Criteria**:
- [ ] All 4 indexes created
- [ ] EXPLAIN ANALYZE shows index usage
- [ ] No duplicate OTP creation possible

---

### 6. Fix Missing name Column Handling (30min, GC)
**Status**: 🟡 HIGH - Customer names not persisted
**Owner**: GC
**Original Owner**: CCW

**Task**: Ensure name column exists and is used correctly

**Steps**:
1. **Verify Migration Applied** (5min):
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'bookings' AND column_name = 'name';
   -- Expected: name | text | YES
   ```

2. **Fix Repository Code** (10min):
   ```typescript
   // File: src/repositories/bookingRepository.ts

   // Line 52-60: ADD name to INSERT
   const { data, error } = await supabase
     .from('bookings')
     .insert({
       vehicle_id: input.vehicleId,
       test_drive_date: input.preferredDate,
       test_drive_location: input.notes || 'Showroom',
       phone_number: input.phone.trim(),
       name: input.name.trim(),  // ADD THIS LINE
       status: 'pending',
       phone_verified: false,
       kyc_verified: false,
     })
     .select()
     .single();

   // Line 104: FIX getBookingById
   return {
     id: data.id,
     name: data.name || '',  // Change from: name: ''
     phone: data.phone_number,
     ...
   };
   ```

3. **Test** (15min):
   - Create booking with name "Test User"
   - Query database: `SELECT id, name, phone_number FROM bookings ORDER BY created_at DESC LIMIT 1;`
   - Expected: name = "Test User"

**Success Criteria**:
- [ ] name column exists in database
- [ ] INSERT includes name value
- [ ] SELECT retrieves name correctly
- [ ] Test booking has name persisted

---

## MEDIUM PRIORITY (Next 4-8 hours)

### 7. Add OTP Rate Limiting (1.5-2h, GC)
**Status**: 🟢 MEDIUM - Abuse prevention
**Owner**: GC

**Task**: Prevent OTP spam abuse with Upstash rate limiting

**Steps**:
1. **Setup Upstash** (30min):
   - Create account: https://upstash.com
   - Create Redis instance (free tier)
   - Get credentials: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

2. **Install Dependencies** (5min):
   ```bash
   pnpm add @upstash/ratelimit @upstash/redis
   ```

3. **Implement Rate Limiter** (45min):
   ```typescript
   // File: src/app/api/otp/resend/route.ts

   import { Ratelimit } from "@upstash/ratelimit";
   import { Redis } from "@upstash/redis";

   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(5, "10 m"), // 5 requests per 10 min per phone
   });

   export async function POST(request: NextRequest) {
     const { phone } = await request.json();

     // Rate limit by phone number
     const { success, remaining } = await ratelimit.limit(phone);

     if (!success) {
       return NextResponse.json(
         { error: "Rate limit exceeded. Try again in 10 minutes." },
         { status: 429 }
       );
     }

     // ... rest of OTP resend logic
   }
   ```

4. **Test** (30min):
   - Send 5 OTP requests to same phone
   - 6th request should return 429
   - Wait 10 minutes, 7th request should succeed

**Success Criteria**:
- [ ] Rate limiter installed
- [ ] 5 requests allowed per 10 min per phone
- [ ] 6th request returns 429
- [ ] Error message clear to user

---

### 8. Improve OTP Error Handling (1h, GC)
**Status**: 🟢 MEDIUM - UX improvement
**Owner**: GC

**Task**: Better error messages and status codes

**Changes**:
1. **markPhoneVerified returns boolean** (30min):
   ```typescript
   // File: src/repositories/bookingRepository.ts:118-135

   async markPhoneVerified(id: string): Promise<boolean> {
     const supabase = createClient();
     const { error } = await supabase
       .from('bookings')
       .update({
         phone_verified: true,
         verified_at: new Date().toISOString(),
         status: 'confirmed'
       })
       .eq('id', id);

     if (error) {
       console.error('Failed to mark phone as verified:', error);
       return false;  // Signal failure
     }
     return true;  // Signal success
   }
   ```

2. **Booking route returns 202 on OTP failure** (30min):
   ```typescript
   // File: src/app/api/bookings/route.ts:112-122

   if (!otpResult.success) {
     console.error('[BOOKING] OTP send failed:', otpResult.error);
     return NextResponse.json(
       {
         booking,
         warning: 'Booking created but SMS failed to send',
         smsError: otpResult.error
       },
       { status: 202 }  // 202 Accepted (not 201 Created)
     );
   }
   ```

**Success Criteria**:
- [ ] markPhoneVerified returns success/failure
- [ ] Callers check return value
- [ ] Booking route returns 202 on partial failure
- [ ] Client can distinguish success from partial failure

---

## BACKLOG (After Above Complete)

### 9. Phone E.164 Validation (1.5h, GC)
- Add libphonenumber-js validation
- Normalize to +20XXXXXXXXXX format
- Prevent WhySMS API rejections

### 10. Client-Side OTP Expiration Check (1h, GC)
- Check expires_at before submission
- Show "Code expired, resend?" message
- Better UX than server error

### 11. Code Quality Batch Cleanup (2-3 days, BB)
- ESLint --fix
- Prettier --write
- Remove unused imports
- Add return types

---

## TEAM COORDINATION

**Current Situation**:
- CCW: Quota-locked (~1h), unavailable for OTP work
- GC: Primary executor for all critical tasks
- CC: Supervisor, reviewer, architecture decisions
- BB: Backlog tasks after critical path clear

**Handoff Protocol**:
- When CCW quota resets: GC provides status report
- CCW can resume OTP refinement (rate limiting, abuse protection)
- GC moves to image coverage + performance optimization

**Communication**:
- GC updates status in this document after each task
- CC reviews all SQL migrations before execution
- User signs off on image coverage plan (remaining 31%)

---

## SUCCESS METRICS

**MVP 1.x Completion Criteria**:
- [ ] OTP system: Single SMS per booking (tested with 5 bookings)
- [ ] Database: All tables exist, RLS policies applied
- [ ] Images: 69%+ coverage (137/199 models)
- [ ] Performance: Indexes added, queries fast
- [ ] Security: RLS prevents unauthorized access (non-credential)
- [ ] Demo-ready: Can show working booking + OTP + images

**Time Estimate**:
- Critical Priority: 4-6 hours
- High Priority: 2-4 hours
- Medium Priority: 4-8 hours
- **Total**: 10-18 hours to MVP 1.x demo-ready

---

**Document End**

**Last Updated**: 2025-12-21 23:55 EET
**Next Review**: After Task #1 (OTP regression fix) complete
**Owner**: CC (document), GC (execution), User (approval)
