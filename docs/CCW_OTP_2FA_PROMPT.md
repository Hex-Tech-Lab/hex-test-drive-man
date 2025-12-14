# CCW MISSION BRIEF - OTP/2FA System Implementation

**Handover Generated At**: 2025-12-14 23:15 UTC
**Session Type**: Feature Implementation (OTP/2FA end-to-end)
**Priority**: HIGH - MVP 1.0 blocker
**Complexity**: MEDIUM-HIGH (persistence + UI/UX + security + bilingual + future microservice)
**Estimated Scope**: 3-5 sessions (incremental delivery)

---

## MAKER-CHECKER VALIDATION

**Before proceeding, you MUST answer:**

Are you at least 95% confident you fully understand:
- Context, rationale, decisions, tradeoffs, and criteria?
- Current technical state, constraints, and risks?
- Next actions and their dependencies?

**If YES (≥95% confidence):**
- State: "I have all the context, rationale, decisions, and criteria needed and do NOT need to ask any clarifying questions."
- Proceed directly to execution planning.

**If NO (<95% confidence):**
- This is a FAILURE OF THE HANDOVER.
- State: "The handover is incomplete in the following specific areas: [list precisely]"
- Ask ONLY ONE focused clarifying question to close the gap.
- After answer, re-evaluate and continue without further questions.

**FORBIDDEN:**
- Generic questions like "Do you run SonarCloud automatically?" or "What did the previous assistant intend?"
- If such info is missing, classify as handover defect and report explicitly.

---

## 1. EXECUTIVE SUMMARY

**Mission**: Implement production-ready OTP/2FA system for booking verification flow with bilingual UI/UX, complete persistence, security hardening, and architecture structured for future microservice spin-off.

**Current State**:
- ✅ requestOtp() working (WhySMS v3, commit ca9da33)
- ✅ Schema defined (supabase/migrations/20251211_booking_schema.sql)
- ❌ Migration NOT applied to production
- ❌ verifyOtp() stub only (no persistence)
- ❌ Verification UI missing
- ❌ RLS policies incomplete
- ❌ No E2E tests

**Success Criteria**:
- User books test drive → receives SMS with 6-digit OTP
- User enters OTP → verified, booking status updated
- Failed OTP → retry logic (max 3 attempts)
- Expired OTP → request new code
- All text in EN/AR with RTL support
- RLS enabled on ALL tables
- Zero TypeScript errors
- Repository pattern maintained
- Structured for future microservice extraction (separate tables/relationships)

**Deliverables**:
1. Applied Supabase migration (bookings + sms_verifications tables)
2. verifyOtp() persistence implementation
3. /bookings/[id]/verify page (MUI, bilingual, RTL)
4. Complete RLS policies
5. E2E booking flow working
6. Quality gates passed (TypeScript strict, ESLint, build)
7. Commit(s) + PR ready for review

---

## 2. TECHNICAL ENVIRONMENT

**Read CLAUDE.md First**: `/home/user/hex-test-drive-man/CLAUDE.md` (2,219 lines, v2.2.4)
- Sections 1-3: Operating Instructions, Tech Stack, GUARDRAILS
- Section 8: Session Timeline (historical context)
- Section 11: Quality Standards & Anti-Patterns

**Tech Stack (Exact)**:
- **Frontend**: Next.js 15.4.8, React 19.2.0, TypeScript 5.7.3
- **UI**: MUI 6.4.3 (NOT v7, NOT Tailwind/shadcn), @emotion
- **State**: Zustand 5.0.3 (primitive selectors ONLY - object selectors cause infinite loops)
- **Backend**: Supabase PostgreSQL, @supabase/supabase-js 2.50.0
- **i18n**: next-intl (bilingual EN/AR with RTL)
- **SMS**: WhySMS v3 API (/api/v3/sms/send)
- **Package Manager**: pnpm 10.25.0 ONLY (NEVER npm/yarn)

**Project Root**: `/home/user/hex-test-drive-man`

**Key Files**:
- Migration: `supabase/migrations/20251211_booking_schema.sql` (30 lines, NOT applied)
- Schema: bookings, sms_verifications tables defined
- SMS Engine: `src/services/sms/engine.ts` (requestOtp working, verifyOtp stub)
- Booking Repo: `src/repositories/bookingRepository.ts` (in-memory, needs Supabase)
- API Routes: `src/app/api/bookings/route.ts` (POST exists, verify missing)
- Types: `src/types/booking.ts` (BookingStatus, BookingInput, Booking)

**Existing Work** (Commit ca9da33, 2025-12-11 22:51 EET):
- WhySMS integration working
- requestOtp() sends SMS successfully
- Migration file created (not applied)
- verifyOtp() stub exists

**Credentials**:
- Location: `.env.local` at project root
- Required vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- WhySMS: Already configured (working in requestOtp)
- Note: User has credentials in personal notes (not in repo)

---

## 3. ARCHITECTURAL CONSTRAINTS

### Microservice-Ready Structure (CRITICAL)

**User Requirement** [2025-12-13, from CLAUDE.md]:
> "OTP system: Structure tables for future microservice spin-off (no separate DB yet if complexity high)"

**Implementation**:
- Tables: Independent relationships (no tight coupling to bookings)
- Foreign keys: Use UUID references (not composite keys)
- RLS: Self-contained policies (phone_number in JWT claims)
- Code: Repository pattern (easy to extract to separate service)
- API: RESTful routes (can become external endpoints)

**Example Table Design**:
```sql
-- sms_verifications (microservice-ready)
CREATE TABLE sms_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,           -- NOT user_id (user might not exist yet)
  verification_code TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT DEFAULT 0,               -- Track retry count
  booking_id UUID,                      -- Optional FK (can be NULL for other use cases)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Quality Standards (MANDATORY)

**From CLAUDE.md Section 11**:

1. **TypeScript Aliases** (100% enforcement):
   - ✅ `import { foo } from '@/components/foo'`
   - ❌ `import { foo } from './foo'` or `import { foo } from '../foo'`
   - ESLint rule: no-restricted-imports (already configured)

2. **Zustand Selectors** (React 19 infinite loop prevention):
   - ✅ `const brands = useFilterStore(s => s.brands);`
   - ❌ `const { brands } = useFilterStore(s => ({ brands: s.brands }));`
   - Reason: Object selectors cause infinite setState loops

3. **MUI Components** (NOT Tailwind):
   - Use MUI 6.4.3 components (TextField, Button, Box, Typography, etc.)
   - Emotion for styling (`sx` prop or styled components)
   - Rationale: Better RTL/Arabic support

4. **Repository Pattern**:
   - NO direct Supabase calls in components/pages
   - ALL database access via `src/repositories/*Repository.ts`
   - Return `{ data, error }` pattern (Supabase convention)

5. **RLS Everywhere**:
   - ENABLE ROW LEVEL SECURITY on EVERY table
   - Policies: Users can only access their own data
   - JWT claims: `current_setting('request.jwt.claims')::json->>'phone'`

### Bilingual & RTL (Egyptian Market)

**Locales**: EN (default), AR (RTL)
- Files: `messages/en.json`, `messages/ar.json`
- Components: Use `useTranslations()` hook
- Layout: Auto-reverse for RTL (`dir="rtl"` applied by next-intl)
- MUI: Supports RTL out-of-box

**Example**:
```json
// messages/en.json
{
  "booking": {
    "verifyOtp": "Enter verification code",
    "otpSent": "We sent a code to {phone}",
    "otpExpired": "Code expired. Request a new one.",
    "otpInvalid": "Invalid code. {attemptsLeft} attempts left."
  }
}

// messages/ar.json
{
  "booking": {
    "verifyOtp": "أدخل رمز التحقق",
    "otpSent": "أرسلنا رمزًا إلى {phone}",
    "otpExpired": "انتهت صلاحية الرمز. اطلب رمزًا جديدًا.",
    "otpInvalid": "رمز غير صحيح. {attemptsLeft} محاولات متبقية."
  }
}
```

---

## 4. IMPLEMENTATION PHASES

### Phase 1: Persistence Layer (Session 1)

**Objective**: Get data persisting to Supabase with RLS

**Tasks**:
1. **Apply migration to Supabase**:
   ```bash
   # Verify connection
   curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/bookings?select=count"

   # If 404, apply migration
   psql $SUPABASE_URL < supabase/migrations/20251211_booking_schema.sql

   # Verify tables exist
   curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/bookings?select=count"
   # Expected: [{"count":0}]
   ```

2. **Add RLS policies to sms_verifications**:
   ```sql
   ALTER TABLE sms_verifications ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can view own verifications"
     ON sms_verifications FOR SELECT
     USING (phone_number = current_setting('request.jwt.claims')::json->>'phone');

   CREATE POLICY "Users can create verifications"
     ON sms_verifications FOR INSERT
     WITH CHECK (phone_number = current_setting('request.jwt.claims')::json->>'phone');
   ```

3. **Implement verifyOtp() with persistence**:
   - File: `src/services/sms/engine.ts`
   - Logic:
     - Query sms_verifications by phone_number + verification_code
     - Check: code matches, not expired, attempts < 3
     - If valid: Update verified_at, return success
     - If invalid: Increment attempts, return error
     - If expired: Return error with "request new code" flag
   - Return: `{ success: boolean, error?: string, attemptsLeft?: number }`

4. **Update bookingRepository to use Supabase**:
   - File: `src/repositories/bookingRepository.ts`
   - Replace in-memory array with Supabase queries
   - Methods: createBooking, getBookingById, updateBookingStatus
   - Use repository pattern: `{ data, error }` return

5. **Create /api/bookings/verify route**:
   - File: `src/app/api/bookings/verify/route.ts`
   - Input: `{ bookingId, phone, code }`
   - Flow:
     1. verifyOtp(phone, code)
     2. If success: updateBookingStatus(bookingId, 'confirmed', phone_verified=true)
     3. Return: `{ success, booking }`

**Success Criteria**:
- Tables exist in Supabase
- RLS enabled on both tables
- verifyOtp() persists to sms_verifications
- bookingRepository uses Supabase (not in-memory)
- /api/bookings/verify route working
- TypeScript strict mode: 0 errors
- pnpm build: success

**Commit Message**:
```
feat(otp): Phase 1 - Persistence layer with Supabase + RLS

- Apply booking schema migration to Supabase production
- Add RLS policies to sms_verifications table
- Implement verifyOtp() with persistence (attempts tracking, expiry)
- Migrate bookingRepository from in-memory to Supabase
- Create /api/bookings/verify route
- All queries use repository pattern
- TypeScript strict: 0 errors, build: green
```

---

### Phase 2: UI/UX Layer (Session 2)

**Objective**: Create verification page with bilingual support

**Tasks**:
1. **Create /bookings/[id]/verify page**:
   - File: `src/app/[locale]/bookings/[id]/verify/page.tsx`
   - Layout:
     - MUI Card with booking details (vehicle, date, location)
     - TextField for 6-digit OTP (numeric, auto-focus)
     - Button: "Verify" (primary, loading state)
     - Link: "Resend code" (disabled for 60s after send)
     - Alert: Success/error messages (MUI Alert component)
   - State: useForm or controlled state (NOT Zustand for this)
   - Validation:
     - Must be 6 digits
     - No spaces/letters
     - Real-time formatting (e.g., "123 456")

2. **Add localization keys**:
   - Files: `messages/en.json`, `messages/ar.json`
   - Keys: verifyOtp, otpSent, otpExpired, otpInvalid, resendCode, verifyButton
   - Format: Include placeholders for dynamic data (`{phone}`, `{attemptsLeft}`)

3. **Implement resend logic**:
   - Button: "Resend Code"
   - Behavior:
     - Disabled for 60s after initial send (countdown timer)
     - On click: Call requestOtp(phone) again
     - Update sms_verifications (new code, reset attempts)
   - UI: Show countdown "Resend in 45s..."

4. **Error handling**:
   - Invalid code: Show attempts left (3-attempts)
   - Expired code: Show "request new code" message + enable resend
   - Network error: Generic error message
   - Max attempts: Lock for 15 minutes (track in sms_verifications)

5. **Success flow**:
   - On verify success: Redirect to /bookings/[id]/confirmed
   - Show confetti animation (optional, MUI Snackbar is fine)
   - Display booking confirmation details

**Success Criteria**:
- /bookings/[id]/verify page renders
- OTP input: 6 digits, numeric only, formatted
- Resend button: Working with 60s countdown
- Error states: All scenarios handled with bilingual messages
- RTL: Works correctly for Arabic
- MUI components only (no Tailwind classes)
- TypeScript: 0 errors
- Build: success

**Commit Message**:
```
feat(otp): Phase 2 - Verification UI with bilingual support

- Create /bookings/[id]/verify page (MUI Card, TextField, Alert)
- Add EN/AR localization keys for all OTP scenarios
- Implement resend logic with 60s countdown
- Error handling: invalid, expired, max attempts
- Success flow: Redirect to /bookings/[id]/confirmed
- RTL support verified for Arabic
- TypeScript strict: 0 errors
```

---

### Phase 3: E2E Flow + Quality Gates (Session 3)

**Objective**: Complete booking → OTP → verification flow with tests

**Tasks**:
1. **Wire VehicleCard modal to new flow**:
   - File: `src/components/VehicleCard.tsx`
   - On "Book Test Drive" submit:
     - POST /api/bookings (create booking)
     - Response: `{ bookingId, phone }`
     - Redirect: `/bookings/${bookingId}/verify`
   - Update localization: "Check your phone for verification code"

2. **Create /bookings/[id]/confirmed page**:
   - File: `src/app/[locale]/bookings/[id]/confirmed/page.tsx`
   - Display:
     - Success message (bilingual)
     - Booking details (vehicle, date, location, reference ID)
     - Next steps (e.g., "Agent will contact you 24h before")
   - Actions: "Add to Calendar" button (optional)

3. **Add retry logic for failed OTP sends**:
   - File: `src/services/sms/engine.ts`
   - WhySMS errors: Retry up to 3 times with exponential backoff (2s, 4s, 8s)
   - If all fail: Log error to Sentry, return user-friendly message

4. **Security hardening**:
   - Rate limiting: Max 5 OTP requests per phone per hour (add to sms_verifications query)
   - Code expiry: 10 minutes default (configurable)
   - Attempts: Max 3 per code, then lock for 15 minutes
   - Audit: Log all verification attempts (success/failure) to sms_verifications

5. **Quality gates**:
   ```bash
   # TypeScript strict
   pnpm tsc --noEmit
   # Expected: 0 errors

   # ESLint
   pnpm eslint src/
   # Expected: 0 errors (warnings OK)

   # Build
   pnpm build
   # Expected: success

   # Manual E2E test
   # 1. Go to localhost:3000
   # 2. Select vehicle → "Book Test Drive"
   # 3. Fill form → Submit
   # 4. Should receive SMS with 6-digit code
   # 5. Enter code on /verify page
   # 6. Should redirect to /confirmed
   # 7. Verify booking status = 'confirmed' in Supabase
   ```

6. **Documentation**:
   - File: `docs/OTP_SYSTEM.md`
   - Sections:
     - Architecture overview (flow diagram)
     - Database schema (tables, RLS policies)
     - API endpoints (request/response examples)
     - Localization keys
     - Security features (rate limiting, attempts, expiry)
     - Future microservice extraction plan

**Success Criteria**:
- Full booking flow: Vehicle → Form → OTP → Confirmation
- SMS received with 6-digit code
- OTP verification working
- All error states handled gracefully
- Bilingual UI (EN/AR) with RTL
- Security: Rate limiting, attempts, expiry enforced
- Quality gates: TypeScript 0 errors, ESLint clean, build success
- Documentation: OTP_SYSTEM.md created

**Commit Message**:
```
feat(otp): Phase 3 - E2E flow + security + quality gates

- Wire VehicleCard modal to OTP verification flow
- Create /bookings/[id]/confirmed success page
- Add retry logic for WhySMS with exponential backoff
- Security: Rate limiting (5/hour), max attempts (3), expiry (10min)
- Quality gates: TypeScript strict ✓, ESLint ✓, Build ✓
- Documentation: OTP_SYSTEM.md with architecture + extraction plan
- Manual E2E test: PASSED (vehicle → OTP → confirmation)
```

---

## 5. CRITICAL CONSTRAINTS

### MUST DO:
1. **Read CLAUDE.md first** (2,219 lines) - sections 1-3, 8, 11
2. **Apply migration before coding** (verify with curl)
3. **Use repository pattern** (no direct Supabase in components)
4. **TypeScript @ aliases** (NO relative imports)
5. **Primitive Zustand selectors** (NO object selectors)
6. **RLS on EVERYTHING** (test with curl + anon key)
7. **Bilingual EN/AR** (all user-facing text in messages/*.json)
8. **MUI 6.4.3 only** (no Tailwind, shadcn, or custom CSS)
9. **Commit after each phase** (incremental, not bulk dump)
10. **Quality gates before PR** (TypeScript, ESLint, build)

### MUST NOT DO:
1. **Use npm/yarn** (pnpm 10.25.0 ONLY)
2. **Use Tailwind classes** (MUI sx prop or Emotion)
3. **Skip RLS policies** (security requirement)
4. **Hard-code text** (use next-intl translations)
5. **Object Zustand selectors** (causes React 19 infinite loops)
6. **Relative imports** (ESLint will error)
7. **Force push to main** (feature branch only)
8. **Skip quality gates** (TypeScript strict required)
9. **Create Supabase client in components** (use repository)
10. **Commit without GPG signing** (if enabled; check git config)

---

## 6. DECISION CRITERIA & TRADEOFFS

### When to Ask User:

**Scenario 1: SMS Provider Costs**
- If WhySMS costs exceed budget, propose alternatives (Twilio, Vonage)
- Provide cost comparison table before switching

**Scenario 2: OTP Code Length**
- Default: 6 digits
- If security concern: Ask if 8 digits preferred (less user-friendly)

**Scenario 3: Code Expiry Time**
- Default: 10 minutes
- If user experience issue: Ask if 15 minutes preferred

**Scenario 4: Rate Limiting**
- Default: 5 OTP requests per phone per hour
- If too restrictive: Ask if 10/hour acceptable

### When to Decide Yourself:

**Scenario 1: UI Layout**
- Use MUI best practices (Card, TextField, Button)
- No need to ask about component choices

**Scenario 2: Error Messages**
- Write clear, user-friendly messages in EN/AR
- User can refine in PR review

**Scenario 3: Database Indexes**
- Add indexes for phone_number, expires_at, booking_id
- Performance optimization, no functional impact

**Scenario 4: Retry Logic**
- Exponential backoff (2s, 4s, 8s) is standard
- Implement without asking

---

## 7. SUCCESS METRICS

### Functional:
- [ ] User receives SMS with 6-digit OTP within 30 seconds
- [ ] User can verify OTP and booking status updates to 'confirmed'
- [ ] User sees error message for invalid/expired OTP with attempts left
- [ ] User can resend OTP after 60s countdown
- [ ] User is locked out after 3 failed attempts for 15 minutes
- [ ] All text displays correctly in EN/AR with RTL support
- [ ] Booking flow: Vehicle → Form → OTP → Confirmation (E2E working)

### Technical:
- [ ] Tables exist in Supabase (bookings, sms_verifications)
- [ ] RLS enabled on both tables with correct policies
- [ ] TypeScript strict mode: 0 errors
- [ ] ESLint: 0 errors (warnings acceptable)
- [ ] pnpm build: success
- [ ] No relative imports (100% @/ aliases)
- [ ] Repository pattern: All DB access via repositories
- [ ] MUI 6.4.3 components only (no Tailwind)

### Security:
- [ ] Rate limiting: 5 OTP requests per phone per hour
- [ ] Max attempts: 3 per code, then 15min lockout
- [ ] Code expiry: 10 minutes
- [ ] RLS: Users can only access their own data
- [ ] Sensitive data: No OTP codes in logs/Sentry

### Documentation:
- [ ] OTP_SYSTEM.md created with architecture diagram
- [ ] Localization keys documented in messages/*.json
- [ ] API endpoints documented (request/response)
- [ ] Future microservice extraction plan documented

---

## 8. REFERENCE INDEX

### Key Files (Read Before Coding):

**Documentation**:
- `/home/user/hex-test-drive-man/CLAUDE.md` (2,219 lines) - source of truth

**Migration**:
- `/home/user/hex-test-drive-man/supabase/migrations/20251211_booking_schema.sql`

**Backend**:
- `/home/user/hex-test-drive-man/src/services/sms/engine.ts` (requestOtp ✅, verifyOtp stub)
- `/home/user/hex-test-drive-man/src/repositories/bookingRepository.ts` (in-memory, needs Supabase)
- `/home/user/hex-test-drive-man/src/types/booking.ts`

**Frontend** (to be created):
- `/home/user/hex-test-drive-man/src/app/[locale]/bookings/[id]/verify/page.tsx`
- `/home/user/hex-test-drive-man/src/app/[locale]/bookings/[id]/confirmed/page.tsx`

**Localization**:
- `/home/user/hex-test-drive-man/messages/en.json`
- `/home/user/hex-test-drive-man/messages/ar.json`

**Existing Work**:
- Commit ca9da33 (2025-12-11 22:51 EET) - WhySMS integration
- PR #4 (open) - Booking MVP v0

### External Resources:

**Supabase**:
- Dashboard: https://lbttmhwckcrfdymwyuhn.supabase.co
- Docs: https://supabase.com/docs/guides/auth/row-level-security

**MUI**:
- Components: https://mui.com/material-ui/getting-started/
- RTL: https://mui.com/material-ui/guides/right-to-left/

**WhySMS**:
- API: /api/v3/sms/send (already integrated)

---

## 9. CONTEXT PRESERVATION

### User Working Style (from CLAUDE.md):
- Prefers ready-to-run commands (no placeholders)
- Wants tools/scripts that do NOT kill shells on failure
- "Plan more, execute less" - avoid troubleshooting loops
- No early celebration; verify outcomes before declaring success
- Short, concrete bullet points (7-15 words)
- Minimal verbosity; focus on decisions, commands, file paths

### Commit Conventions:
- Format: `type(scope): short description`
- Types: feat, fix, chore, docs, refactor, test
- Scopes: otp, booking, sms, ui, db
- GPG signing: Check `git config commit.gpgsign` (true/false)
- Incremental: Commit after each phase, not bulk dump

### Branch Strategy:
- Current: `claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg`
- Feature: Create `ccw/otp-2fa-system` from current branch
- PR: Against current branch (will be reviewed by CC before main)

---

## 10. CRITICAL PATH FORWARD

### Immediate First 3 Actions:

1. **Read CLAUDE.md (10 minutes)**:
   ```bash
   cd /home/user/hex-test-drive-man
   head -200 CLAUDE.md  # Operating Instructions + Tech Stack
   grep -A 50 "GUARDRAILS" CLAUDE.md
   grep -A 100 "Quality Standards" CLAUDE.md
   ```

2. **Verify Supabase connection (2 minutes)**:
   ```bash
   # Check if .env.local exists
   cat .env.local | grep SUPABASE

   # Test connection
   curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/bookings?select=count"

   # If 404: Migration not applied (expected)
   # If 200: Migration already applied (unexpected, verify schema)
   ```

3. **Create feature branch + start Phase 1 (5 minutes)**:
   ```bash
   git checkout -b ccw/otp-2fa-system

   # Apply migration (if not already applied)
   # Note: User will provide actual SUPABASE_URL if needed

   # Verify tables
   curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/bookings?select=count"
   curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/sms_verifications?select=count"

   # Expected: Both return [{"count":0}]
   ```

### Dependencies:
- Supabase credentials: User will provide if .env.local missing
- WhySMS API key: Already in .env.local (working in requestOtp)
- No other blockers

### Success Criteria for Session 1 (Phase 1):
- Migration applied to Supabase
- RLS policies added to sms_verifications
- verifyOtp() implemented with persistence
- bookingRepository migrated to Supabase
- /api/bookings/verify route created
- TypeScript: 0 errors, Build: success
- Commit: Phase 1 complete, pushed to ccw/otp-2fa-system

---

## 11. EDGE CASES & ERROR SCENARIOS

### Handle These Explicitly:

1. **OTP expired mid-verification**:
   - User enters code after 10min expiry
   - Show: "Code expired. Resend code to continue."
   - Enable resend button immediately (skip 60s countdown)

2. **Multiple OTP requests**:
   - User requests code 3 times in 2 minutes
   - Each generates new code, invalidates previous
   - Track: Only latest code is valid

3. **Phone number format**:
   - Input: "+20 123 456 7890" or "01234567890"
   - Normalize: Store as E.164 format "+201234567890"
   - Display: Local format "0123 456 7890"

4. **Concurrent verification attempts**:
   - User opens verify page in 2 tabs
   - Both try to verify same code
   - Use database transaction to prevent double-verification

5. **Network errors during SMS send**:
   - WhySMS API timeout or 5xx error
   - Retry 3 times with exponential backoff
   - If all fail: Show "SMS service unavailable. Try again in 5 minutes."

6. **Booking already verified**:
   - User tries to verify already-confirmed booking
   - Redirect to /bookings/[id]/confirmed immediately
   - Show: "This booking is already confirmed."

7. **Invalid booking ID**:
   - URL: /bookings/invalid-uuid/verify
   - Show 404 page: "Booking not found"

8. **RLS policy violation**:
   - User tries to verify someone else's booking
   - Supabase returns 403
   - Show: "You can only verify your own bookings."

---

## 12. MICROSERVICE EXTRACTION PLAN (Future)

**When to Extract** (Post-MVP 1.5):
- OTP system used by 3+ features (booking, login, KYC, etc.)
- Scaling needs require independent deployment
- Team grows to need separate OTP service ownership

**How to Extract**:
1. **Database**:
   - Copy sms_verifications table to new DB
   - Add replication or dual-write during transition
   - Foreign keys: Use UUID (already prepared)

2. **Code**:
   - Move `src/services/sms/` → new repo
   - Move `src/repositories/smsVerificationRepository.ts` → new repo
   - API: Convert /api/otp/* to external REST service

3. **Dependencies**:
   - WhySMS SDK remains in OTP service
   - Booking service calls OTP service via HTTP

4. **RLS**:
   - JWT claims: Share auth token between services
   - Policy: `phone_number = jwt_claim('phone')` works across services

**This Implementation Prepares For**:
- Independent sms_verifications table (no tight coupling)
- Repository pattern (easy to replace with HTTP client)
- UUID FKs (work across database boundaries)
- RLS on phone_number (JWT-based, portable)

---

**END OF CCW MISSION BRIEF**

**Next Step**: CCW reads this brief, performs Maker-Checker validation, confirms 95%+ confidence, and begins Phase 1 implementation.

**Expected Timeline**:
- Phase 1: 1 session (2-4 hours)
- Phase 2: 1 session (2-4 hours)
- Phase 3: 1 session (2-3 hours)
- Total: 3 sessions, 6-11 hours

**Point of Contact**: User (via chat)
**Escalation**: If blocked >30min, ask user for help (no silent troubleshooting loops)

**Verification Authority**: CLAUDE.md v2.2.4 (2,219 lines, commit 722c5e3)
