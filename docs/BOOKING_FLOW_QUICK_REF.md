# Booking Flow - Quick Reference
**For:** CCW Session Continuity
**Date:** 2025-12-11

---

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    BOOKING FLOW (END-TO-END)                │
└─────────────────────────────────────────────────────────────┘

  USER JOURNEY                    SYSTEM ACTIONS
  ═════════════                   ═══════════════

  1. Browse Catalog
     │                            ┌─ Fetch vehicles from Supabase
     └─> Click "Book Test Drive"
         │
         v
  2. Fill Booking Form
     ├─ Vehicle (pre-selected)
     ├─ Name
     ├─ Phone (+20...)            ┌─ Validate phone format
     └─ Preferred Date            └─ Check date >= today
         │
         └─> Submit
             │                    ┌─ Insert into bookings table
             v                    ├─ Generate 6-digit OTP
  3. OTP Sent                     ├─ Hash OTP with bcrypt
     │                            ├─ Store in sms_verifications
     └─> "Code sent to xxx"       └─ Call WhySMS API
         │
         v
  4. Enter OTP (6 digits)
     │                            ┌─ Fetch latest OTP from DB
     └─> Verify                   ├─ Check expiry (5 min)
         │                        ├─ Check attempts (max 3)
         │   ✓ Valid              ├─ Compare hash (constant-time)
         │                        └─ Update bookings.phone_verified
         v
  5. Upload KYC Documents
     ├─ National ID (image/PDF)   ┌─ Validate size (max 5MB)
     └─ Driver's License          ├─ Upload to Supabase Storage
         │                        ├─ Insert into kyc_documents
         v                        └─ Update bookings.kyc_verified
  6. Confirmation
     └─> "Booking Reference: XXX" ┌─ Send confirmation email (future)
         ✓ Done                   └─ Status = 'confirmed'
```

---

## Phase Breakdown (Time Estimates)

| Phase | Goal | Tasks | Est. Time | Owner |
|-------|------|-------|-----------|-------|
| **Phase 1** | MVP OTP Flow | Fix booking page + Verify page + OTP persistence | 8-12 hours | CCW |
| **Phase 2** | Polish UX | Side panel + Error handling + Loading states | 6-8 hours | CCW |
| **Phase 3** | KYC + DB | Upload UI + Schema + Supabase integration | 10-14 hours | CCW + CC + BB |
| **TOTAL** | Full Flow | End-to-end booking with OTP and KYC | **24-34 hours** | Multi-agent |

---

## Current vs. Target State

### Booking Creation (`/en/bookings/new/page.tsx`)

#### ❌ Current State (Broken)
```tsx
// Issues:
// 1. Uses two different OTP functions (requestOtp + sendOTP)
// 2. Bypasses repository pattern (direct Supabase call)
// 3. Native HTML inputs (breaks MUI design system)
// 4. No error handling
// 5. Uses window.location.href instead of Next.js router

await sendOTP(phone, '123456'); // sendOTP doesn't exist!
const { data } = await supabase.from('bookings').insert(...); // bypasses repository
window.location.href = `/en/bookings/${data.id}/verify`; // anti-pattern
```

#### ✅ Target State (Fixed)
```tsx
// Solutions:
// 1. Use only requestOtp from engine
// 2. Use bookingRepository
// 3. MUI TextField components
// 4. Proper error/loading states
// 5. Next.js useRouter

const booking = await bookingRepository.createBooking({ vehicleId, date, phone, name });
const otpResult = await requestOtp({ phone, subjectType: 'booking', subjectId: booking.id });

if (!otpResult.success) {
  setError(otpResult.error);
  return;
}

router.push(`/en/bookings/${booking.id}/verify`);
```

### OTP Verification Engine (`/services/sms/engine.ts`)

#### ❌ Current State (Stubbed)
```typescript
export async function verifyOtp(_params: VerifyOtpParams): Promise<VerifyOtpResult> {
  console.log('[OTP_VERIFY_STUB]', _params);
  return { valid: false, error: 'OTP verification not implemented yet' };
}
```

#### ✅ Target State (Implemented)
```typescript
export async function verifyOtp(params: VerifyOtpParams): Promise<VerifyOtpResult> {
  const otpRecord = await otpRepository.getLatestOtp(params.subjectId);

  // Check expiry, attempts, and code match (bcrypt)
  if (new Date(otpRecord.expires_at) < new Date()) {
    return { valid: false, error: 'OTP expired' };
  }

  const isValid = await bcrypt.compare(params.code, otpRecord.verification_code);
  // ... (see full implementation in main plan)
}
```

---

## File Ownership Matrix

| File Path | Status | Owner | Phase | Priority |
|-----------|--------|-------|-------|----------|
| `src/app/en/bookings/new/page.tsx` | ⚠️ Needs refactor | CCW | 1.1 | 🔴 HIGH |
| `src/services/sms/engine.ts` | ⚠️ Stub (verifyOtp) | CCW | 1.3 | 🔴 HIGH |
| `src/repositories/otpRepository.ts` | ❌ Missing | CCW | 1.4 | 🔴 HIGH |
| `src/app/en/bookings/[id]/verify/page.tsx` | ❌ Missing | CCW | 1.2 | 🟠 MEDIUM |
| `src/components/BookingPanel.tsx` | ❌ Missing | CCW | 2.1 | 🟡 LOW |
| `src/app/en/bookings/error.tsx` | ❌ Missing | CCW | 2.2 | 🟡 LOW |
| `supabase/migrations/20251212_kyc_storage.sql` | ❌ Missing | CC + BB | 3.1 | 🟢 FUTURE |
| `src/app/en/bookings/[id]/kyc/page.tsx` | ❌ Missing | CCW | 3.2 | 🟢 FUTURE |
| `src/repositories/bookingRepository.ts` | ⚠️ In-memory only | CCW | 3.4 | 🟢 FUTURE |

**Legend:**
- ✅ Complete | ⚠️ Needs work | ❌ Missing
- 🔴 HIGH (Phase 1) | 🟠 MEDIUM (Phase 2) | 🟡 LOW (Phase 2) | 🟢 FUTURE (Phase 3)

---

## Decision Matrix: When to Use What

### Supabase vs. Repository
| Scenario | Use | Don't Use |
|----------|-----|-----------|
| Fetch booking by ID | ✅ `bookingRepository.getBookingById()` | ❌ `supabase.from('bookings').select()` |
| Create new booking | ✅ `bookingRepository.createBooking()` | ❌ `supabase.from('bookings').insert()` |
| Update booking status | ✅ `bookingRepository.updateStatus()` | ❌ Direct Supabase call |

**Why?** Repositories provide type safety, validation, and single source of truth for data access.

### requestOtp vs. sendWhySMS
| Scenario | Use | Don't Use |
|----------|-----|-----------|
| Send booking OTP | ✅ `requestOtp({ subjectType: 'booking', ... })` | ❌ `sendWhySMS()` directly |
| Send login OTP | ✅ `requestOtp({ subjectType: 'login', ... })` | ❌ `sendWhySMS()` directly |

**Why?** `requestOtp` handles OTP generation, expiry, and persistence. `sendWhySMS` is a low-level provider.

### MUI vs. Native HTML
| Element | Use | Don't Use |
|---------|-----|-----------|
| Text input | ✅ `<TextField />` | ❌ `<input type="text" />` |
| Button | ✅ `<Button variant="contained" />` | ❌ `<button />` |
| Form container | ✅ `<Box component="form" />` | ❌ `<form />` (unless semantic HTML needed) |
| Error message | ✅ `<Alert severity="error" />` | ❌ `<div className="error" />` |

**Why?** MUI ensures consistent design, theme integration, and accessibility.

### useRouter vs. window.location
| Scenario | Use | Don't Use |
|----------|-----|-----------|
| Navigate to verify page | ✅ `router.push('/en/bookings/123/verify')` | ❌ `window.location.href = '...'` |
| Back to catalog | ✅ `router.back()` | ❌ `window.history.back()` |

**Why?** Next.js router provides client-side navigation (no full reload), prefetching, and better UX.

---

## Environment Variable Checklist

### Required Before Testing
```bash
# .env.local (copy from .env.template)

# 🔴 CRITICAL: WhySMS credentials
WHYSMS_API_TOKEN=your_token_here          # Get from WhySMS dashboard
WHYSMS_SENDER_ID=HexTestDrv               # Max 11 chars, must be approved by WhySMS

# ✅ Already configured (verify they work)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### How to Test Without WhySMS Token (Dev Mode)
```typescript
// src/services/sms/providers/whysms.ts
// Add dev mode bypass (remove before production!)

if (process.env.NODE_ENV === 'development' && !WHYSMS_TOKEN) {
  console.warn('[DEV MODE] WhySMS bypassed - OTP would be:', message);
  return { success: true, status: 'dev_mode', message: 'Bypassed in dev' };
}
```

---

## Testing Checklist (Phase 1 MVP)

### Manual Test Flow
```
1. ✅ Start dev server: pnpm dev
2. ✅ Navigate to: http://localhost:3000/en/bookings/new
3. ✅ Fill form:
   - Vehicle ID: (any valid UUID from vehicles table)
   - Name: Test User
   - Phone: +201234567890
   - Date: (tomorrow's date)
4. ✅ Submit form
5. ✅ Check console for: [OTP_REQUEST] log
6. ✅ Check Supabase: SELECT * FROM sms_verifications ORDER BY created_at DESC LIMIT 1;
7. ✅ Copy OTP code from console log
8. ✅ Navigate to: http://localhost:3000/en/bookings/[id]/verify
9. ✅ Enter OTP code
10. ✅ Click Verify
11. ✅ Should see success message or redirect to KYC page
```

### Error Cases to Test
```
❌ Invalid phone format (+20 missing) → Should validate
❌ Past date selected → Should block submission
❌ Wrong OTP code entered → Should show "Invalid OTP"
❌ Expired OTP (wait 6 min) → Should show "OTP expired"
❌ WhySMS token invalid → Should show "SMS send failed"
```

---

## Common Issues & Solutions

### Issue 1: "sendOTP is not a function"
**Location:** `src/app/en/bookings/new/page.tsx:31`
**Cause:** `sendOTP` was never implemented, only `requestOtp` exists
**Fix:** Remove `sendOTP` import and call, use only `requestOtp`

### Issue 2: "middleware.ts deprecated" warning
**Status:** Known issue (Next.js 16)
**Solution:** Ignore for now, will be fixed in Next.js 16 stable
**Impact:** Non-blocking, app works fine

### Issue 3: OTP verification always fails
**Cause:** `verifyOtp()` is stubbed (always returns `{ valid: false }`)
**Fix:** Implement full `verifyOtp` logic (see Phase 1.3 in main plan)

### Issue 4: Booking page looks broken (no styling)
**Cause:** Using native HTML inputs instead of MUI components
**Fix:** Replace all `<input>` with `<TextField>` (see Phase 1.1)

### Issue 5: "bookings.phone_number column doesn't exist"
**Cause:** Schema only has `phone_verified` boolean, not the phone number itself
**Fix:** Add phone number to booking creation params, store in notes field (temporary) or update schema

---

## Next Session Starter (CCW)

### Before You Start
1. ✅ Read this document + main plan (`BOOKING_FLOW_IMPLEMENTATION_PLAN.md`)
2. ✅ Verify you're on correct branch: `claude/booking-flow-otp-kyc-01N4AuNR1MG1Fs2PWvFBPCSA`
3. ✅ Check environment: `cat .env.template` (note missing WhySMS vars)
4. ✅ Review current booking page: `src/app/en/bookings/new/page.tsx`

### First 3 Tasks (in order)
```
1. 🔴 Fix booking page MUI components (30-45 min)
   File: src/app/en/bookings/new/page.tsx
   Action: Replace HTML inputs with TextField, add proper error handling

2. 🔴 Implement OTP persistence (45-60 min)
   File: src/services/sms/engine.ts
   Action: Replace console.log with Supabase insert in requestOtp()

3. 🔴 Create OTP repository (30 min)
   File: src/repositories/otpRepository.ts (NEW)
   Action: Implement CRUD operations for sms_verifications table
```

### Command to Resume Work
```bash
cd /home/user/hex-test-drive-man
git checkout claude/booking-flow-otp-kyc-01N4AuNR1MG1Fs2PWvFBPCSA
pnpm dev  # Start dev server
# Open another terminal for git commits
```

---

## Agent Handoff Protocol

### CCW → CC (Security Review)
**When:** After Phase 1 complete
**Provide:**
- Link to PR with OTP implementation
- Specific files to review: `src/services/sms/engine.ts`, `src/repositories/otpRepository.ts`
- Ask: "Is bcrypt usage correct? Are there timing attack risks?"

### CCW → GC (Deployment)
**When:** After each phase
**Provide:**
- PR title: "feat(booking): [Phase X] [description]"
- PR description with testing checklist
- Link to this plan document

### CCW → BB (Database Setup)
**When:** Before Phase 3 (KYC)
**Provide:**
- SQL file: `supabase/migrations/20251212_kyc_storage.sql`
- Commands to run:
  ```bash
  supabase db push
  supabase storage create kyc-documents
  ```

---

**End of Quick Reference**
