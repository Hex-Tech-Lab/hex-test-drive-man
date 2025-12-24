# 🚨 EXECUTE THIS SQL NOW - 2 MINUTES

## Current Database State

✅ **bookings table**: EXISTS but MISSING `phone_verified` column
✅ **sms_verifications table**: EXISTS but MISSING `booking_id` column

**These columns are REQUIRED for OTP booking flow to work.**

---

## Option 1: Supabase Dashboard (EASIEST - 2 min)

### Step 1: Open SQL Editor
```
https://supabase.com/dashboard/project/lbttmhwckcrfdymwyuhn/sql
```

### Step 2: Copy this SQL

```sql
-- ADD MISSING COLUMNS TO EXISTING TABLES
BEGIN;

-- Add phone_verified to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- Add booking_id to sms_verifications table
ALTER TABLE sms_verifications
ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_sms_booking ON sms_verifications(booking_id);

COMMIT;
```

### Step 3: Click "RUN"

**Expected output:**
```
Success. 0 rows returned
```

### Step 4: Verify (run this query in same editor)

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'bookings' AND column_name = 'phone_verified';

SELECT column_name FROM information_schema.columns
WHERE table_name = 'sms_verifications' AND column_name = 'booking_id';
```

**Expected output:**
```
phone_verified
booking_id
```

✅ **DONE** - Proceed to deployment

---

## Option 2: Command Line (if you have DB password)

```bash
# Get DB password from: https://supabase.com/dashboard/project/lbttmhwckcrfdymwyuhn/settings/database
# (Look for "Database Password" - you set this when creating the project)

PGPASSWORD='your-db-password' psql \
  -h db.lbttmhwckcrfdymwyuhn.supabase.co \
  -U postgres \
  -d postgres \
  -p 5432 \
  -f /home/user/hex-test-drive-man/supabase/migrations/20251219_add_missing_columns.sql
```

---

## Why This Is Needed

**Without these columns:**
- ❌ `requestOtp()` fails when trying to link OTP to booking
- ❌ `markPhoneVerified()` fails when updating booking status
- ❌ Booking flow breaks after SMS is sent

**With these columns:**
- ✅ OTP links to specific booking ID
- ✅ Phone verification updates booking record
- ✅ Full booking flow works end-to-end

---

## ⏱️ Time Estimate

- Dashboard method: **2 minutes**
- Command line method: **30 seconds** (if you have password)

---

## 🚀 After This

1. Verify columns exist (Step 4 above)
2. Deploy to Vercel (env vars already documented)
3. Test production booking flow
4. ✅ **DONE**

---

**Created**: 2025-12-19 21:47 UTC
**Agent**: CCW
**Migration File**: `supabase/migrations/20251219_add_missing_columns.sql`
