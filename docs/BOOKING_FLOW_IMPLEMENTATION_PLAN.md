# Booking Flow Implementation Plan
**Agent:** CCW (Claude Code Web)
**Date:** 2025-12-11
**Session:** claude/booking-flow-otp-kyc-01N4AuNR1MG1Fs2PWvFBPCSA

---

## Executive Summary

This document outlines the complete implementation plan for the booking flow with OTP verification and KYC upload functionality. The plan is divided into 3 phases with clear ownership boundaries between agents (CCW, CC, GC, BB).

**Current Completion:** ~25% (basic booking creation + SMS engine shell)
**Target:** 100% (end-to-end booking with OTP verification and KYC upload)

---

## Current State Assessment

### ✅ Implemented Components

#### 1. Database Schema (100%)
**Location:** `supabase/migrations/20251211_booking_schema.sql`
- ✅ `bookings` table with all required fields
- ✅ `sms_verifications` table for OTP tracking
- ✅ RLS policies for user-scoped access
- ✅ Status enum: `pending | confirmed | completed | cancelled`
- ✅ Boolean flags: `phone_verified`, `kyc_verified`

**Missing:** KYC document storage table (files/URLs)

#### 2. SMS/OTP Engine (60%)
**Location:** `src/services/sms/engine.ts`

**Working:**
- ✅ `requestOtp()` - generates 6-digit code, calls WhySMS
- ✅ OTP expiry logic (5 minutes)
- ✅ Type-safe interfaces (`RequestOtpParams`, `VerifyOtpParams`)

**Stubbed:**
- ⚠️ `verifyOtp()` - always returns `{ valid: false }` with TODO comment
- ⚠️ Persistence - logs to console instead of DB

#### 3. WhySMS Provider (100%)
**Location:** `src/services/sms/providers/whysms.ts`
- ✅ Correct API v3 `/sms/send` endpoint
- ✅ Proper auth headers (`Bearer ${WHYSMS_TOKEN}`)
- ✅ Type-safe response handling
- ✅ Error handling for non-JSON responses

**Environment:** Requires `WHYSMS_API_TOKEN` and `WHYSMS_SENDER_ID` in `.env.local`

#### 4. Booking Repository (50%)
**Location:** `src/repositories/bookingRepository.ts`

**Status:** In-memory implementation (MVP placeholder)
- ✅ Basic CRUD operations
- ✅ Validation logic
- ❌ No Supabase/Drizzle integration
- ❌ Not used consistently (booking page bypasses it)

#### 5. Booking UI (30%)
**Location:** `src/app/en/bookings/new/page.tsx`

**Issues:**
- ⚠️ Uses Supabase client directly (bypasses repository pattern)
- ⚠️ Mixes two SMS functions (`requestOtp` + `sendOTP` - which doesn't exist)
- ⚠️ Hardcoded redirect to non-existent verify page
- ⚠️ No error handling or loading states
- ⚠️ Direct `window.location.href` instead of Next.js router
- ⚠️ Basic HTML inputs instead of MUI components (breaks design system)

### ❌ Missing Components

1. **Verification Page** - `/en/bookings/[id]/verify`
2. **KYC Upload Flow** - UI + file storage
3. **Booking Side Panel** - Flyover UI for booking creation
4. **OTP Persistence** - DB writes to `sms_verifications` table
5. **KYC Storage Schema** - Table for documents (ID, license, etc.)
6. **Booking Confirmation** - Final success state with booking details
7. **Error Boundaries** - Graceful error handling for SMS/DB failures

---

## Technical Architecture Decisions

### Frozen Stack (from CLAUDE.md)
- **Frontend:** React 19.2.0 + Next.js 15.4.8 (App Router)
- **UI:** Material-UI 6.4.3 (no Tailwind/shadcn)
- **State:** Zustand 5.0.3 with persist middleware
- **Data Fetching:** SWR 2.2.5 (not React Query)
- **Database:** Supabase 2.50.0 (PostgreSQL)
- **ORM:** Drizzle (planned, not yet integrated)
- **Logging:** Pino (planned)
- **Queue:** Upstash (planned for async OTP sends)

### Design Patterns Observed

#### 1. Repository Pattern
**Example:** `src/repositories/bookingRepository.ts`
```typescript
export const bookingRepository = {
  async createBooking(input: BookingInput): Promise<Booking> { ... }
  async getBookingById(id: string): Promise<Booking | null> { ... }
}
```
**Usage:** All DB access should go through repositories, not direct Supabase calls.

#### 2. Zustand Stores (Client State)
**Example:** `src/stores/compare-store.ts`
```typescript
export const useCompareStore = create<CompareStore>()(
  persist(
    (set) => ({ /* state */ }),
    { name: 'compare-storage' }
  )
);
```
**Pattern:** Persist to localStorage for cross-page state (e.g., booking draft).

#### 3. Service Layer (Business Logic)
**Example:** `src/services/sms/engine.ts`
```typescript
export async function requestOtp(params: RequestOtpParams): Promise<RequestOtpResult>
```
**Pattern:** Services orchestrate repositories + external APIs (SMS, email, etc.).

#### 4. Material-UI Standards
**Example:** From `src/app/[locale]/page.tsx`
```typescript
<TextField
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon />
      </InputAdornment>
    ),
  }}
/>
```
**Anti-Pattern:** Native HTML inputs (`<input type="text">`) break design consistency.

---

## Implementation Roadmap

### Phase 1: Minimal Functional Flow (MVP)
**Goal:** End-to-end booking → OTP sent → OTP verified (no KYC yet)
**Duration:** 1 sprint
**Owner:** CCW (with CC for architecture review)

#### 1.1: Fix Booking Creation Page
**File:** `src/app/en/bookings/new/page.tsx`

**Changes:**
```typescript
// BEFORE (current issues):
await sendOTP(phone, '123456'); // sendOTP doesn't exist
const { data } = await supabase.from('bookings').insert(...); // bypasses repository

// AFTER (fixed):
const booking = await bookingRepository.createBooking({
  vehicleId, date, phone, name
});
const otpResult = await requestOtp({
  phone,
  subjectType: 'booking',
  subjectId: booking.id
});
```

**Tasks:**
- [ ] Replace native inputs with MUI `TextField` components
- [ ] Add proper loading states (`CircularProgress`)
- [ ] Add error handling with MUI `Alert`
- [ ] Use `useRouter()` instead of `window.location.href`
- [ ] Remove duplicate OTP call (use only `requestOtp`)
- [ ] Add form validation (phone format, date constraints)

**Files to Touch:**
- `src/app/en/bookings/new/page.tsx` (refactor entire component)

**Constraints:**
- Must match existing catalog page patterns (MUI Grid, Container, Typography)
- Must support bilingual (EN/AR) - use `useLanguageStore`
- No Tailwind classes allowed

---

#### 1.2: Implement OTP Verification Page
**File:** `src/app/en/bookings/[id]/verify/page.tsx` (NEW)

**UI Requirements:**
- Display booking details (vehicle, date, location)
- 6-digit OTP input field (MUI TextField with max length)
- "Verify" button (disabled until 6 digits entered)
- "Resend OTP" button (with cooldown timer, e.g., 60s)
- Error/success states

**Logic Flow:**
```typescript
async function handleVerify() {
  const result = await verifyOtp({
    phone: booking.phone,
    subjectType: 'booking',
    subjectId: bookingId,
    code: otpInput
  });

  if (result.valid) {
    // Update booking.phone_verified = true
    router.push(`/en/bookings/${bookingId}/kyc`); // Phase 2
  } else {
    setError(result.error);
  }
}
```

**Tasks:**
- [ ] Create page component with dynamic `[id]` route
- [ ] Fetch booking details via `bookingRepository.getBookingById()`
- [ ] Implement OTP input with auto-focus on digits
- [ ] Add resend logic with cooldown timer (Zustand store?)
- [ ] Display vehicle info from booking
- [ ] Handle edge cases (booking not found, already verified)

**Files to Touch:**
- `src/app/en/bookings/[id]/verify/page.tsx` (NEW)
- `src/services/sms/engine.ts` (implement `verifyOtp` function)
- `supabase/migrations/` (add trigger to update `bookings.phone_verified`)

**Dependencies:**
- Phase 1.3 (OTP persistence) must be done first

---

#### 1.3: Implement OTP Persistence
**File:** `src/services/sms/engine.ts`

**Current Issue:**
```typescript
// Line 44-54: Logs to console instead of DB
console.log('[OTP_REQUEST]', { phone, code, expiresAt });
```

**Solution:**
```typescript
// Add Supabase insert
await supabase.from('sms_verifications').insert({
  booking_id: subjectId,
  phone_number: phone,
  verification_code: code, // Should be hashed in production
  expires_at: expiresAt,
});
```

**Tasks:**
- [ ] Replace console.log with `supabase.from('sms_verifications').insert()`
- [ ] Implement `verifyOtp()` function:
  - Query `sms_verifications` for latest code
  - Check expiry
  - Check code match (constant-time comparison)
  - Mark as used (set `verified_at`)
- [ ] Add rate limiting (max 3 attempts per booking)
- [ ] Add cooldown logic (prevent rapid resends)

**Security Notes:**
- OTP should be hashed before storage (bcrypt or similar)
- Use constant-time string comparison to prevent timing attacks
- Add attempt tracking to prevent brute force

**Files to Touch:**
- `src/services/sms/engine.ts` (modify `requestOtp` + implement `verifyOtp`)
- `src/lib/supabase.ts` (ensure client is available server-side)

**Owner:** CCW (implementation) + CC (security review)

---

#### 1.4: Add Repository Layer for OTP
**File:** `src/repositories/otpRepository.ts` (NEW)

**Rationale:** Keep DB access in repositories, not services.

**Interface:**
```typescript
export const otpRepository = {
  async createOtp(params: {
    bookingId: string;
    phone: string;
    code: string;
    expiresAt: string;
  }): Promise<void>;

  async getLatestOtp(bookingId: string): Promise<OtpRecord | null>;

  async markVerified(otpId: string): Promise<void>;

  async incrementAttempts(otpId: string): Promise<number>;
};
```

**Tasks:**
- [ ] Create repository file
- [ ] Implement CRUD operations
- [ ] Add attempt tracking queries
- [ ] Update `engine.ts` to use repository instead of direct Supabase

**Files to Touch:**
- `src/repositories/otpRepository.ts` (NEW)
- `src/services/sms/engine.ts` (refactor to use repository)

**Owner:** CCW

---

### Phase 2: Polish UI + Side Panel (UX Improvements)
**Goal:** Professional booking experience with side-panel UI
**Duration:** 1 sprint
**Owner:** CCW

#### 2.1: Create Booking Side Panel Component
**File:** `src/components/BookingPanel.tsx` (NEW)

**Inspiration:** Compare flyover pattern (if it exists, check `src/components/`)

**Requirements:**
- MUI `Drawer` component (anchor="right")
- Responsive width (320px mobile, 480px desktop)
- Header with close button (IconButton with CloseIcon)
- Scrollable content area
- Footer with actions (Cancel, Continue buttons)

**Triggered From:**
- Vehicle detail page (future)
- Catalog page "Book Test Drive" button

**Tasks:**
- [ ] Create reusable `BookingPanel` component
- [ ] Add Zustand store for panel state (`useBookingPanelStore`)
- [ ] Implement booking form inside panel (same fields as Phase 1.1)
- [ ] Add step indicator (1. Details → 2. Verify → 3. KYC)
- [ ] Style with MUI theme (match Header/FilterPanel styles)

**Files to Touch:**
- `src/components/BookingPanel.tsx` (NEW)
- `src/stores/booking-panel-store.ts` (NEW)
- `src/components/VehicleCard.tsx` (add "Book" button trigger)

**Owner:** CCW

---

#### 2.2: Improve Error Handling
**Goal:** Graceful failures for SMS/DB errors

**Scenarios:**
1. WhySMS API fails (network error, invalid token)
2. Supabase insert fails (constraint violation, RLS denial)
3. OTP expired or invalid
4. Rate limit exceeded

**Tasks:**
- [ ] Add error boundary at booking route level
- [ ] Display user-friendly error messages (MUI Snackbar or Alert)
- [ ] Log errors to Sentry (already configured in project)
- [ ] Add retry logic for transient failures
- [ ] Implement fallback UI (e.g., "Try again" button)

**Files to Touch:**
- `src/app/en/bookings/error.tsx` (NEW - Next.js error boundary)
- `src/services/sms/engine.ts` (add retry wrapper)
- `src/lib/sentry-user.ts` (ensure error logging is wired)

**Owner:** CCW (UI) + CC (logging strategy)

---

#### 2.3: Add Loading States
**Goal:** Professional UX during async operations

**Locations:**
1. Booking creation (submitting form)
2. OTP verification (checking code)
3. OTP resend (cooldown timer)

**Tasks:**
- [ ] Add `CircularProgress` during form submission
- [ ] Disable buttons during async operations
- [ ] Show skeleton loaders for booking details fetch
- [ ] Add countdown timer for resend button
- [ ] Optimistic UI updates (mark verified immediately, rollback on error)

**Files to Touch:**
- All booking UI components (page.tsx files)
- Add `src/hooks/useOtpCooldown.ts` (custom hook for timer)

**Owner:** CCW

---

### Phase 3: KYC Upload + Final Persistence (Database Integration)
**Goal:** Complete booking flow with document upload
**Duration:** 1-2 sprints
**Owner:** CCW (UI) + CC (storage architecture) + BB (scripts for Supabase storage setup)

#### 3.1: Design KYC Storage Schema
**File:** `supabase/migrations/20251212_kyc_storage.sql` (NEW)

**Requirements:**
- Store multiple documents per booking (ID, driver's license, etc.)
- Support file metadata (name, size, mime type, upload timestamp)
- Reference Supabase Storage buckets

**Schema:**
```sql
CREATE TABLE kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('national_id', 'drivers_license')),
  storage_path TEXT NOT NULL, -- Supabase Storage path
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  verified_by UUID REFERENCES auth.users(id), -- Admin who verified
  verified_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- RLS: Users can only upload to their own bookings
CREATE POLICY "Users can upload KYC for own bookings"
  ON kyc_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = kyc_documents.booking_id
      AND bookings.user_id = auth.uid()
    )
  );
```

**Tasks:**
- [ ] Write migration SQL
- [ ] Create Supabase Storage bucket (`kyc-documents`)
- [ ] Set bucket RLS policies (user can upload to their folders)
- [ ] Test migration locally

**Files to Touch:**
- `supabase/migrations/20251212_kyc_storage.sql` (NEW)

**Owner:** CC (schema design) + BB (run migration)

---

#### 3.2: Implement KYC Upload UI
**File:** `src/app/en/bookings/[id]/kyc/page.tsx` (NEW)

**Requirements:**
- File upload dropzone (MUI or custom)
- Support 2 documents: National ID + Driver's License
- Preview uploaded images
- Validation: max 5MB, only images (JPG/PNG/PDF)
- Progress indicator during upload

**UI Flow:**
1. User lands on page after OTP verification
2. Display 2 upload zones (ID, License)
3. User selects/drags files
4. Files upload to Supabase Storage
5. Metadata saved to `kyc_documents` table
6. Redirect to confirmation page

**Tasks:**
- [ ] Create upload component with drag-and-drop
- [ ] Integrate Supabase Storage SDK
- [ ] Add client-side validation (file size, type)
- [ ] Show upload progress (percentage)
- [ ] Handle upload errors (network, size limit)
- [ ] Update `bookings.kyc_verified = true` after both files uploaded

**Files to Touch:**
- `src/app/en/bookings/[id]/kyc/page.tsx` (NEW)
- `src/repositories/kycRepository.ts` (NEW)
- `src/components/FileUpload.tsx` (NEW - reusable component)

**Owner:** CCW

---

#### 3.3: Create Booking Confirmation Page
**File:** `src/app/en/bookings/[id]/confirmed/page.tsx` (NEW)

**Content:**
- Success icon (CheckCircleIcon)
- Booking reference number
- Summary: Vehicle, Date, Location
- Next steps: "We'll contact you to confirm", "Check your email"
- CTA: "Back to Catalog" button

**Tasks:**
- [ ] Design confirmation UI (MUI Card, Typography)
- [ ] Fetch final booking details
- [ ] Add print/download option (future enhancement)

**Files to Touch:**
- `src/app/en/bookings/[id]/confirmed/page.tsx` (NEW)

**Owner:** CCW

---

#### 3.4: Replace In-Memory Repository with Supabase
**File:** `src/repositories/bookingRepository.ts`

**Current:** In-memory array (resets on server restart)

**Target:** Full Supabase integration

**Tasks:**
- [ ] Replace all `bookings` array references with Supabase queries
- [ ] Add proper RLS policy enforcement
- [ ] Implement transactions (create booking + send OTP atomically)
- [ ] Add update methods (status changes, verification flags)
- [ ] Test with real Supabase instance

**Files to Touch:**
- `src/repositories/bookingRepository.ts` (complete rewrite)

**Owner:** CCW (implementation) + CC (review transaction logic)

---

## Agent Responsibilities

### CCW (Claude Code Web) - PRIMARY OWNER
**Scope:** All UI/UX implementation + TypeScript editing

**Phase 1 Tasks:**
- All booking page refactors
- OTP verification page
- OTP engine implementation
- Repository layer creation

**Phase 2 Tasks:**
- Side panel component
- Error handling UI
- Loading states

**Phase 3 Tasks:**
- KYC upload UI
- Confirmation page
- Repository Supabase integration

**Deliverables:**
- All `.tsx` components
- All `.ts` service/repository files
- Zustand stores

---

### CC (Claude Code - Terminal) - ARCHITECTURE ADVISOR
**Scope:** Design reviews + security guidance

**Responsibilities:**
- Review OTP security (hashing, rate limiting)
- Approve schema designs (KYC tables)
- Design transaction patterns (atomic booking + OTP)
- Review error handling strategy

**Not Responsible For:**
- Writing UI code (CCW's job)
- Running migrations (GC/BB's job)

---

### GC (GitHub Copilot) - DEPLOYMENT & CI/CD
**Scope:** PR management + production deploys

**Responsibilities:**
- Review and merge CCW's PRs
- Trigger Vercel deployments
- Monitor Sentry for booking-related errors
- Coordinate branch merges

**Not Responsible For:**
- Feature implementation (CCW's job)
- Architecture decisions (CC's job)

---

### BB (Bash Bot) - SCRIPTS & AUTOMATION
**Scope:** Database migrations + environment setup

**Responsibilities:**
- Run Supabase migrations (schema changes)
- Set up Supabase Storage buckets
- Configure RLS policies
- Generate test data (mock bookings)

**Not Responsible For:**
- Writing application code (CCW's job)

---

## File Manifest (Predicted)

### New Files (Phase 1)
```
src/app/en/bookings/[id]/verify/page.tsx
src/repositories/otpRepository.ts
```

### New Files (Phase 2)
```
src/components/BookingPanel.tsx
src/stores/booking-panel-store.ts
src/app/en/bookings/error.tsx
src/hooks/useOtpCooldown.ts
```

### New Files (Phase 3)
```
supabase/migrations/20251212_kyc_storage.sql
src/app/en/bookings/[id]/kyc/page.tsx
src/app/en/bookings/[id]/confirmed/page.tsx
src/repositories/kycRepository.ts
src/components/FileUpload.tsx
```

### Modified Files (All Phases)
```
src/app/en/bookings/new/page.tsx (major refactor)
src/services/sms/engine.ts (implement verifyOtp + persistence)
src/repositories/bookingRepository.ts (replace in-memory with Supabase)
src/components/VehicleCard.tsx (add Book button)
.env.template (add WHYSMS env vars)
```

---

## Dependencies & Blockers

### External Dependencies
1. **WhySMS Credentials** - Need API token + sender ID
   - **Action:** Add to `.env.local` (ask user for credentials)
   - **Blocker:** Cannot test OTP sends without valid token

2. **Supabase Instance** - Need project URL + anon key
   - **Status:** Already configured (seen in codebase)
   - **Action:** Verify credentials work

3. **Supabase Storage** - Need bucket creation permissions
   - **Owner:** BB to run setup script
   - **Blocker:** Cannot upload KYC files until bucket exists

### Internal Dependencies
1. **Phase 1.3 blocks Phase 1.2** - Cannot verify OTPs until persistence is implemented
2. **Phase 3.1 blocks Phase 3.2** - Cannot upload files until schema exists
3. **Vehicle Detail Page** - Booking button needs somewhere to live (use catalog for MVP)

---

## Success Criteria

### Phase 1 (MVP)
- [ ] User can create booking from `/en/bookings/new`
- [ ] OTP is sent to user's phone via WhySMS
- [ ] OTP is stored in `sms_verifications` table
- [ ] User can verify OTP at `/en/bookings/[id]/verify`
- [ ] `bookings.phone_verified` updates to `true` on success
- [ ] All operations use repository pattern (no direct Supabase in UI)
- [ ] Build passes (`pnpm build`)
- [ ] Lint passes (`pnpm lint`)

### Phase 2 (Polish)
- [ ] Booking can be initiated from side panel (Drawer)
- [ ] All error states show user-friendly messages
- [ ] Loading states present during async operations
- [ ] OTP resend has cooldown timer (60s)
- [ ] Errors logged to Sentry with proper context
- [ ] UI matches existing MUI design patterns

### Phase 3 (Complete)
- [ ] KYC upload page functional at `/en/bookings/[id]/kyc`
- [ ] Files upload to Supabase Storage `kyc-documents` bucket
- [ ] Metadata stored in `kyc_documents` table
- [ ] `bookings.kyc_verified` updates to `true` after upload
- [ ] Confirmation page shows final booking details
- [ ] In-memory repository fully replaced with Supabase
- [ ] End-to-end flow tested: Create → OTP → KYC → Confirmed

---

## Testing Strategy

### Manual Testing (Phase 1)
1. Fill booking form → Submit
2. Check console for `[OTP_REQUEST]` log
3. Check `sms_verifications` table for new row
4. Navigate to `/en/bookings/[id]/verify`
5. Enter correct OTP → Should succeed
6. Enter wrong OTP → Should fail with error message
7. Wait 5+ minutes → OTP should expire

### Integration Testing (Phase 2)
1. Test with invalid WhySMS token → Should show error
2. Test with rate limit (send 4 OTPs rapidly) → Should block
3. Test with expired booking date → Should validate
4. Test with missing phone number → Should validate

### E2E Testing (Phase 3)
1. Complete flow: Catalog → Book → OTP → KYC → Confirmed
2. Test file upload errors (too large, wrong type)
3. Test network failure during upload
4. Test RLS policies (user cannot access other user's bookings)

---

## Performance Considerations

### OTP Generation
- **Current:** Crypto.randomInt (synchronous, fast)
- **Concern:** None for MVP (< 1ms per OTP)

### SMS API
- **Current:** Blocking await (user waits for SMS confirmation)
- **Future:** Use Upstash queue for async sends (Phase 4)

### File Upload
- **Concern:** Large files (5MB) block UI during upload
- **Solution:** Use Supabase Storage multipart uploads with progress events

### Database Queries
- **Concern:** N+1 queries when fetching booking + OTP + KYC
- **Solution:** Use Supabase `.select()` joins in repository methods

---

## Security Checklist

- [ ] OTPs hashed before storage (bcrypt with salt)
- [ ] Rate limiting on OTP requests (max 3 per booking per hour)
- [ ] Constant-time OTP comparison (prevent timing attacks)
- [ ] RLS policies prevent cross-user access
- [ ] File uploads validated server-side (mime type, size)
- [ ] KYC files stored with user-scoped paths (`{user_id}/{booking_id}/`)
- [ ] All secrets in `.env.local` (never committed)
- [ ] Sentry error logs exclude PII (phone numbers, OTP codes)

---

## Known Limitations (MVP Scope)

### Out of Scope for Initial Implementation
1. **Email Notifications** - No confirmation emails yet
2. **Admin Dashboard** - No KYC review interface
3. **Payment Integration** - Free bookings only
4. **Calendar Integration** - No venue availability checks
5. **Multi-Language OTP Messages** - English only for SMS body
6. **OTP via Voice Call** - SMS only
7. **Booking Cancellation** - Status updates manual only

### Future Enhancements (Post-MVP)
- Booking reminders (24h before test drive)
- SMS delivery status webhooks (WhySMS callbacks)
- OCR for KYC documents (auto-extract ID numbers)
- Real-time booking slot availability
- Multi-venue support (Cairo, Alexandria, etc.)

---

## Environment Setup Checklist

### Required in `.env.local`
```bash
# WhySMS (for OTP sending)
WHYSMS_API_TOKEN=your_token_here
WHYSMS_SENDER_ID=HexTestDrv  # Max 11 chars, alphanumeric

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Sentry (already configured)
NEXT_PUBLIC_SENTRY_DSN=xxx
```

### Supabase Setup Tasks (BB Responsibility)
```bash
# 1. Run booking schema migration
supabase db push

# 2. Create Storage bucket
supabase storage create kyc-documents

# 3. Set bucket policy (public read for admin, private write)
supabase storage update kyc-documents --public false
```

---

## Session Continuity

### For Next CCW Session
**Priority Order:**
1. Fix `src/app/en/bookings/new/page.tsx` (Phase 1.1)
2. Implement OTP persistence in `src/services/sms/engine.ts` (Phase 1.3)
3. Create verification page (Phase 1.2)
4. Test end-to-end OTP flow

**Context to Preserve:**
- This plan document (`docs/BOOKING_FLOW_IMPLEMENTATION_PLAN.md`)
- Environment variable requirements (`.env.template`)
- Agent responsibilities (CCW owns all UI)

**Handoff to CC:**
- After Phase 1 complete, request security review of OTP implementation
- Before Phase 3, request schema review for KYC tables

**Handoff to GC:**
- After each phase, create PR for review
- Provide testing checklist in PR description

**Handoff to BB:**
- Before Phase 3, request Supabase Storage bucket setup
- Provide exact SQL for KYC migration

---

## Appendix: Code Snippets

### A. Correct OTP Verification Implementation
```typescript
// src/services/sms/engine.ts
import bcrypt from 'bcrypt';
import { otpRepository } from '@/repositories/otpRepository';

export async function verifyOtp(params: VerifyOtpParams): Promise<VerifyOtpResult> {
  const { phone, subjectType, subjectId, code } = params;

  // Fetch latest OTP for this booking
  const otpRecord = await otpRepository.getLatestOtp(subjectId);

  if (!otpRecord) {
    return { valid: false, error: 'No OTP found for this booking' };
  }

  // Check if already used
  if (otpRecord.verified_at) {
    return { valid: false, error: 'OTP already used' };
  }

  // Check expiry
  if (new Date(otpRecord.expires_at) < new Date()) {
    return { valid: false, error: 'OTP expired' };
  }

  // Check attempts
  if (otpRecord.attempts >= 3) {
    return { valid: false, error: 'Too many attempts. Request a new OTP.' };
  }

  // Verify code (constant-time comparison via bcrypt)
  const isValid = await bcrypt.compare(code, otpRecord.verification_code);

  if (!isValid) {
    await otpRepository.incrementAttempts(otpRecord.id);
    return { valid: false, error: 'Invalid OTP code' };
  }

  // Mark as verified
  await otpRepository.markVerified(otpRecord.id);

  // Update booking status
  await supabase
    .from('bookings')
    .update({ phone_verified: true })
    .eq('id', subjectId);

  return { valid: true };
}
```

### B. Booking Panel Store Pattern
```typescript
// src/stores/booking-panel-store.ts
import { create } from 'zustand';

interface BookingPanelStore {
  isOpen: boolean;
  vehicleId: string | null;
  step: 'details' | 'verify' | 'kyc' | 'confirmed';
  open: (vehicleId: string) => void;
  close: () => void;
  setStep: (step: BookingPanelStore['step']) => void;
}

export const useBookingPanelStore = create<BookingPanelStore>((set) => ({
  isOpen: false,
  vehicleId: null,
  step: 'details',
  open: (vehicleId) => set({ isOpen: true, vehicleId, step: 'details' }),
  close: () => set({ isOpen: false, vehicleId: null, step: 'details' }),
  setStep: (step) => set({ step }),
}));
```

### C. MUI File Upload Component
```typescript
// src/components/FileUpload.tsx
import { useState } from 'react';
import { Box, Button, LinearProgress, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface FileUploadProps {
  label: string;
  onUpload: (file: File) => Promise<void>;
}

export default function FileUpload({ label, onUpload }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await onUpload(file);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Box>
      <Button
        component="label"
        variant="outlined"
        startIcon={<CloudUploadIcon />}
        disabled={uploading}
      >
        {label}
        <input type="file" hidden accept="image/*,application/pdf" onChange={handleChange} />
      </Button>
      {uploading && <LinearProgress variant="determinate" value={progress} />}
      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
}
```

---

**End of Implementation Plan**
