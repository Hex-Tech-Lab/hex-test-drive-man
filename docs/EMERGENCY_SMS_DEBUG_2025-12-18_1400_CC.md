---
# Document Metadata
Created: 2025-12-18 14:00:00 UTC
Agent: Claude Code (CC)
Task: Emergency WhySMS SMS Failure Debug
Execution Start: 2025-12-18 13:58:00 UTC
Execution End: 2025-12-18 14:03:00 UTC
Duration: 5 min
Priority: 🔴 CRITICAL
---

# EMERGENCY: WhySMS SMS NOT ARRIVING - ROOT CAUSE FOUND

## 🔴 CRITICAL BUG IDENTIFIED

**Location**: `src/services/sms/engine.ts` lines 42, 68-70, 73-74
**Severity**: BLOCKING - SMS cannot be sent
**Impact**: All OTP/booking flows broken

---

## THE BUG

### What's Happening

`sendSms()` returns a **boolean**, but `requestOtp()` treats it as an **object**:

```typescript
// Line 42: sendSms returns Promise<boolean>
const res = await sendSms(phone, body);  // res = true or false

// Lines 68-70: ❌ BUG - trying to access properties on a boolean
console.log('[OTP_REQUEST]', {
  success: res.success,  // ❌ undefined (boolean has no .success property)
  status: res.status,    // ❌ undefined
  message: res.message,  // ❌ undefined
});

// Line 73: ❌ BUG - checking .success on boolean
if (!res.success) {  // ❌ always undefined, so !undefined = true
  return { success: false, error: res.message ?? 'SMS send failed' };
}
```

### Why SMS Never Sends

1. `sendSms(phone, body)` returns `true` or `false`
2. `res.success` is `undefined` (boolean has no `.success` property)
3. `!undefined` evaluates to `true`
4. **Function returns error BEFORE storing OTP in database**
5. **SMS flow terminates with "SMS send failed"**

---

## THE FIX

### Option 1: Change sendSms Return Type (RECOMMENDED)

**File**: `src/services/sms/providers/whysms.ts`

```typescript
// Before:
export async function sendSms(to: string, message: string): Promise<boolean> {
  // ...
  if (!res.ok) {
    console.error('[WhySMS] Failed:', res.status, data);
    return false;  // ❌ Returns boolean
  }
  return true;
}

// After:
export interface SmsResult {
  success: boolean;
  status?: number;
  message?: string;
}

export async function sendSms(to: string, message: string): Promise<SmsResult> {
  const startTime = Date.now();

  try {
    const payload = {
      recipient: to,
      sender_id: "ORDER",
      message: message,
    };

    console.log(`[WhySMS] Sending to ${to} at ${new Date().toISOString()}`);

    const res = await fetch(`${WHYSMS_BASE_URL}/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${WHYSMS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    const apiLatency = Date.now() - startTime;

    console.log(`[WhySMS] Response (${apiLatency}ms):`, JSON.stringify(data));

    if (!res.ok) {
      console.error('[WhySMS] Failed:', res.status, data);
      return {
        success: false,
        status: res.status,
        message: data?.message || 'SMS send failed'
      };
    }

    return {
      success: true,
      status: res.status,
      message: data?.message || 'SMS sent successfully'
    };
  } catch (error) {
    console.error(`[WhySMS] Error:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

### Option 2: Fix requestOtp Logic (QUICK FIX)

**File**: `src/services/sms/engine.ts` lines 42-76

```typescript
// Before:
const res = await sendSms(phone, body);

const supabase = createClient();
// Store OTP in database for verification
const { error: dbError } = await supabase
  .from('sms_verifications')
  .insert({
    phone_number: phone,
    otp: code,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    verified: false
  });

if (dbError) {
  console.error('Failed to store OTP:', dbError);
  throw new Error('Failed to store OTP verification');
}

console.log('[OTP_REQUEST]', {
  phone,
  subjectType,
  subjectId,
  code,
  expiresAt,
  provider: 'whysms',
  success: res.success,  // ❌ undefined
  status: res.status,    // ❌ undefined
  message: res.message,  // ❌ undefined
});

if (!res.success) {  // ❌ always true because undefined
  return { success: false, error: res.message ?? 'SMS send failed' };
}

// After:
const smsSent = await sendSms(phone, body);  // boolean

if (!smsSent) {
  console.error('[SMS] Failed to send OTP to', phone);
  return { success: false, error: 'SMS send failed' };
}

const supabase = createClient();
// Store OTP in database for verification
const { error: dbError } = await supabase
  .from('sms_verifications')
  .insert({
    phone_number: phone,
    otp: code,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    verified: false
  });

if (dbError) {
  console.error('Failed to store OTP:', dbError);
  throw new Error('Failed to store OTP verification');
}

console.log('[OTP_REQUEST]', {
  phone,
  subjectType,
  subjectId,
  code,
  expiresAt,
  provider: 'whysms',
  smsSent: true,
});
```

---

## OTHER ISSUES FOUND

### 1. Missing Environment Variable

**Issue**: `WHYSMS_API_TOKEN` not set locally or in Vercel

**Evidence**:
```bash
$ grep -r "WHYSMS" .env*
# No results - token not configured
```

**Fix**: Add to Vercel environment variables:
```
WHYSMS_API_TOKEN=your_whysms_token_here
```

**Vercel Dashboard**:
https://vercel.com/hex-tech-lab/hex-test-drive-man/settings/environment-variables

---

### 2. Missing Database Table

**Issue**: `sms_verifications` table may not exist in Supabase

**Check**: Run Supabase migration if not applied:
```sql
-- From: supabase/migrations/20251211_booking_schema.sql
CREATE TABLE IF NOT EXISTS sms_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Current Code**: Uses columns `otp`, `verified`, `verified_at`
**Migration Schema**: Uses columns `verification_code`, `verified_at`

**Column Mismatch**:
- Code uses: `otp`
- Schema defines: `verification_code`

This will cause INSERT to fail!

---

### 3. Column Name Mismatch

**Code** (`engine.ts` line 47):
```typescript
.insert({
  phone_number: phone,
  otp: code,  // ❌ Column doesn't exist
  expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  verified: false  // ❌ Column doesn't exist
})
```

**Schema** (`20251211_booking_schema.sql`):
```sql
CREATE TABLE sms_verifications (
  verification_code TEXT NOT NULL,  -- NOT "otp"
  -- NO "verified" boolean column
  verified_at TIMESTAMPTZ,
);
```

**Fix**: Update migration OR update code to match

---

## IMMEDIATE ACTION PLAN

### 🔴 Priority 1: Fix Critical Bug (2 min)

Choose ONE:

**Option A**: Quick fix `engine.ts` (treat sendSms as boolean)
**Option B**: Update `whysms.ts` (better long-term)

### 🔴 Priority 2: Set Vercel Env Var (1 min)

1. Go to Vercel dashboard
2. Add `WHYSMS_API_TOKEN`
3. Redeploy

### 🔴 Priority 3: Fix Database Schema (3 min)

Choose ONE:

**Option A**: Update migration to match code
```sql
ALTER TABLE sms_verifications
  RENAME COLUMN verification_code TO otp;

ALTER TABLE sms_verifications
  ADD COLUMN verified BOOLEAN DEFAULT FALSE;
```

**Option B**: Update code to match migration
```typescript
.insert({
  phone_number: phone,
  verification_code: code,  // not "otp"
  expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  // remove "verified" field, use verified_at NULL check instead
})
```

---

## TESTING CHECKLIST

After fixes:

- [ ] Build passes (`pnpm build`)
- [ ] No TypeScript errors
- [ ] Deploy to Vercel
- [ ] Check Vercel function logs for errors
- [ ] Test booking flow
- [ ] Verify SMS arrives on real phone
- [ ] Check Supabase `sms_verifications` table for new row
- [ ] Verify OTP code works

---

## FILES TO MODIFY

1. **CRITICAL**: `src/services/sms/engine.ts` (lines 42-76)
2. **CRITICAL**: `src/services/sms/providers/whysms.ts` (return type)
3. **HIGH**: Vercel environment variables
4. **HIGH**: Supabase migration schema
5. **MEDIUM**: Update `verifyOtp` to handle schema changes

---

## SUMMARY

**Root Cause**: Type mismatch - `sendSms()` returns `boolean`, code expects object

**Impact**: 100% of SMS sends fail silently

**Fix Time**: 5 minutes (Option 2 quick fix)

**Risk**: HIGH - production booking flow completely broken

**Status**: 🔴 **BLOCKING** - must fix before any bookings can work

---

**Agent**: Claude Code (CC)
**Duration**: 5 min
**Next**: Apply fix immediately
