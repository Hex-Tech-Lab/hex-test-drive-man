# Booking Wizard Specification - Single Page 3-Step Design

**Created**: 2026-01-11 2315 EET by CC
**Status**: SPECIFICATION (implementation pending)
**Target**: MVP 1.7
**Priority**: HIGH (fixes current production UX issues)

---

## Executive Summary

**Revert from**: 3 separate routes (`/step1`, `/step2`, `/step3`)
**Revert to**: Single-page wizard with tab navigation
**Rationale**: Current 3-step flow has:
- OTP bugs (fixed in PR#67)
- Confusing navigation (URL changes mid-flow)
- Lost context between steps
- No visual progress indicator

---

## Architecture Decision

### Current (BROKEN)
```
/bookings/step1  → Phone + OTP (BROKEN - crypto.randomInt)
/bookings/step2  → Vehicle + Date
/bookings/step3  → Confirmation
```

**Issues**:
- ❌ OTP first = friction (user doesn't know what vehicle yet)
- ❌ URL changes = lost state on refresh
- ❌ No global dropdown = per-page reload
- ❌ Each step = separate route = higher bundle

### Proposed (WIZARD)
```
/bookings/new    → Single page, 3 tabs, Zustand state
  ├── Tab 1: Vehicle Selection (via AdvancedSearch reuse)
  ├── Tab 2: Customer Info + ID Upload
  └── Tab 3: OTP Verification (LAST STEP)
```

**Benefits**:
- ✅ OTP last = minimal friction (user committed to vehicle)
- ✅ Single URL = persistent state
- ✅ Tabs = clear progress indicator
- ✅ Single bundle = faster load

---

## Step-by-Step Flow Specification

**⚠️ CORRECTED PER USER FEEDBACK (2026-01-12)**

### Step 1: Date/Time/Venue Selection

**Purpose**: Schedule test drive appointment (vehicle INHERITED from catalog)
**Entry**: `/bookings/new?vehicleId=X` (vehicleId passed from catalog)

**UI Components**:
- Display small vehicle photo (readonly, inherited from query param)
- Display vehicle name/brand (readonly)
- Date picker for test drive date
- Time slot selection dropdown (from API)
- Venue dropdown (Cairo Showroom, Alexandria Showroom, etc)
- "Next" button enabled when all filled

**State**:
```typescript
{
  step: 1,
  vehicleId: string,  // Inherited from URL, not selected by user
  appointment: {
    date: string,      // ISO 8601
    time: string,      // HH:mm
    venue: string,     // Location name
  },
}
```

**Validation**:
- Required: `vehicleId` (from URL), `appointment.date`, `appointment.time`, `appointment.venue`
- Date must be future (minimum: tomorrow)
- Time slots based on venue availability

**Navigation**:
- Next → Step 2 (ID upload)
- Cancel → Catalog

---

### Step 2: ID + Driver's License Upload

**Purpose**: Upload and verify identity documents
**Dependencies**: Step 1 complete (appointment scheduled)

**UI Components**:
- SmartScanner component for National ID capture (reuse from document-verify)
- SmartScanner component for Driver's License capture
- OCR auto-extraction of ID data (name, national ID number, DOB)
- Preview of captured documents
- "Next" button enabled when both documents uploaded

**State**:
```typescript
{
  step: 2,
  documents: {
    nationalId: File | null,
    driversLicense: File | null,
    extractedData: {
      nationalIdNumber: string | null,
      name: string | null,
      dateOfBirth: string | null,
    },
  },
}
```

**Validation**:
- Required: Both `nationalId` and `driversLicense` files must be uploaded
- Optional: OCR-extracted data (if available, used for confirmation step)
- File size limit: 5MB per image
- Supported formats: JPEG, PNG

**Navigation**:
- Back → Step 1 (date/time selection)
- Next → Step 3 (confirm + OTP)
- Cancel → Catalog

---

### Step 3: Confirm + OTP Verification (FINAL STEP)

**Purpose**: Review booking details, verify phone, and finalize booking
**Dependencies**: Step 1 + 2 complete (appointment + documents)

**UI Components**:
- Summary display:
  - Vehicle photo, name, brand
  - Appointment date, time, venue
  - Document previews (National ID + Driver's License thumbnails)
- Phone number input field (E.164 format, +20 prefix)
- "Send OTP" button (enabled when phone valid)
- OTP input field (6 digits, shown after OTP sent)
- "Confirm Booking" button (enabled when OTP entered)
- Success display (after confirmation):
  - Reservation details (booking ID, date/time, venue)
  - SMS confirmation message sent
  - "Done" button → returns to catalog

**Flow**:
1. User reviews summary
2. User enters phone number
3. User clicks "Send OTP"
4. API call to `/api/otp/send` (from PR#67)
5. User receives SMS with 6-digit code
6. User enters code and clicks "Confirm Booking"
7. API call to `/api/otp/verify`
8. If valid: Create booking, show reservation details + SMS sent
9. If invalid: Show error, allow retry (max 3 attempts)

**State**:
```typescript
{
  step: 3,
  customer: {
    phone: string,  // Collected in this step
  },
  otp: {
    sent: boolean,
    code: string,
    verified: boolean,
    attempts: number,
    expiresAt: string | null,
  },
  booking: {
    id: string | null,
    confirmed: boolean,
  },
}
```

**Validation**:
- Required: `phone` (E.164, +20 prefix, 10-11 digits)
- Required: `otp.code.length === 6 && /^\d{6}$/.test(otp.code)`
- Rate limiting: 60s between OTP resends
- Max attempts: 3 failed verifications = lock for 5 minutes

**Navigation**:
- Back → Step 2 (document upload)
- Success → Display reservation details, "Done" returns to catalog
- Cancel → Catalog (with confirmation dialog)

---

## State Management

### Zustand Store

**File**: `src/stores/useBookingWizardStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BookingWizardState {
  // Navigation
  step: 1 | 2 | 3;
  setStep: (step: 1 | 2 | 3) => void;

  // Step 1: Vehicle + Appointment (vehicle inherited from URL)
  vehicleId: string | null;
  setVehicleId: (id: string) => void;

  appointment: {
    date: string;      // ISO 8601 date
    time: string;      // HH:mm format
    venue: string;     // Location name
  };
  setAppointment: (appointment: Partial<BookingWizardState['appointment']>) => void;

  // Step 2: Documents
  documents: {
    nationalId: File | null;
    driversLicense: File | null;
    extractedData: {
      nationalIdNumber: string | null;
      name: string | null;
      dateOfBirth: string | null;
    };
  };
  setDocuments: (documents: Partial<BookingWizardState['documents']>) => void;

  // Step 3: Customer + OTP
  customer: {
    phone: string;
  };
  setCustomer: (customer: Partial<BookingWizardState['customer']>) => void;

  otp: {
    sent: boolean;
    code: string;
    verified: boolean;
    attempts: number;
    expiresAt: string | null;
  };
  setOtp: (otp: Partial<BookingWizardState['otp']>) => void;

  // Booking result
  booking: {
    id: string | null;
    confirmed: boolean;
  };
  setBooking: (booking: Partial<BookingWizardState['booking']>) => void;

  // Actions
  reset: () => void;
  canProceedToStep2: () => boolean;
  canProceedToStep3: () => boolean;
}

export const useBookingWizardStore = create<BookingWizardState>()(
  persist(
    (set, get) => ({
      // Initial state
      step: 1,
      vehicleId: null,
      appointment: {
        date: '',
        time: '',
        venue: 'Cairo Showroom', // Default
      },
      documents: {
        nationalId: null,
        driversLicense: null,
        extractedData: {
          nationalIdNumber: null,
          name: null,
          dateOfBirth: null,
        },
      },
      customer: {
        phone: '',
      },
      otp: {
        sent: false,
        code: '',
        verified: false,
        attempts: 0,
        expiresAt: null,
      },
      booking: {
        id: null,
        confirmed: false,
      },

      // Setters
      setStep: (step) => set({ step }),
      setVehicleId: (id) => set({ vehicleId: id }),
      setAppointment: (appointment) => set((state) => ({
        appointment: { ...state.appointment, ...appointment },
      })),
      setDocuments: (documents) => set((state) => ({
        documents: { ...state.documents, ...documents },
      })),
      setCustomer: (customer) => set((state) => ({
        customer: { ...state.customer, ...customer },
      })),
      setOtp: (otp) => set((state) => ({
        otp: { ...state.otp, ...otp },
      })),
      setBooking: (booking) => set((state) => ({
        booking: { ...state.booking, ...booking },
      })),

      // Validation
      canProceedToStep2: () => {
        const { appointment } = get();
        return (
          appointment.date.length > 0 &&
          appointment.time.length > 0 &&
          appointment.venue.length > 0
        );
      },
      canProceedToStep3: () => {
        const { documents } = get();
        return (
          documents.nationalId !== null &&
          documents.driversLicense !== null
        );
      },

      // Reset
      reset: () => set({
        step: 1,
        vehicleId: null,
        appointment: {
          date: '',
          time: '',
          venue: 'Cairo Showroom',
        },
        documents: {
          nationalId: null,
          driversLicense: null,
          extractedData: {
            nationalIdNumber: null,
            name: null,
            dateOfBirth: null,
          },
        },
        customer: {
          phone: '',
        },
        otp: {
          sent: false,
          code: '',
          verified: false,
          attempts: 0,
          expiresAt: null,
        },
        booking: {
          id: null,
          confirmed: false,
        },
      }),
    }),
    {
      name: 'booking-wizard-storage',
      partialize: (state) => ({
        // Only persist step and vehicleId
        step: state.step,
        vehicleId: state.vehicleId,
        // Don't persist sensitive data (phone, documents, OTP)
      }),
    }
  )
);
```

---

## Component Structure

### Main Component

**File**: `src/app/[locale]/bookings/new/page.tsx`

```typescript
'use client';

import { Box, Stepper, Step, StepLabel, Button } from '@mui/material';
import { useBookingWizardStore } from '@/stores/useBookingWizardStore';
import DateTimeStep from '@/components/booking/wizard/DateTimeStep';
import DocumentUploadStep from '@/components/booking/wizard/DocumentUploadStep';
import ConfirmStep from '@/components/booking/wizard/ConfirmStep';

export default function BookingWizardPage() {
  const step = useBookingWizardStore((s) => s.step);
  const setStep = useBookingWizardStore((s) => s.setStep);
  const canProceedToStep2 = useBookingWizardStore((s) => s.canProceedToStep2);
  const canProceedToStep3 = useBookingWizardStore((s) => s.canProceedToStep3);

  const steps = ['Date & Time', 'ID Upload', 'Confirm'];

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 4 }}>
      <Stepper activeStep={step - 1} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {step === 1 && <DateTimeStep />}
      {step === 2 && <DocumentUploadStep />}
      {step === 3 && <ConfirmStep />}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        {step > 1 && (
          <Button onClick={() => setStep((step - 1) as 1 | 2 | 3)}>
            Back
          </Button>
        )}
        {step < 3 && (
          <Button
            variant="contained"
            onClick={() => setStep((step + 1) as 1 | 2 | 3)}
            disabled={
              (step === 1 && !canProceedToStep2()) ||
              (step === 2 && !canProceedToStep3())
            }
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
}
```

---

## Migration Strategy

### Phase 1: Parallel Routes (1 week)
- Keep existing `/bookings/step1-3` routes (deprecated)
- Add new `/bookings/new` wizard
- Add banner on old routes: "Try new booking experience"
- Monitor adoption rate

### Phase 2: Default Switch (1 week)
- Redirect `/bookings/step1` → `/bookings/new`
- Keep old routes for backward compat (redirects)
- Update all internal links to new route

### Phase 3: Cleanup (1 week)
- Remove old `/step1-3` routes
- Archive old components
- Update docs

---

## Testing Plan

### Unit Tests
- [ ] Zustand store state transitions
- [ ] Validation functions (canProceedToStep2/3)
- [ ] OTP retry logic (max 3 attempts)
- [ ] Resend cooldown (60s)

### Integration Tests
- [ ] Full wizard flow (vehicle → customer → OTP)
- [ ] Back navigation preserves state
- [ ] Cancel clears state
- [ ] Pre-selected vehicle from catalog

### E2E Tests (Playwright)
- [ ] Happy path: Select vehicle → Enter info → Verify OTP → Booking confirmed
- [ ] Error: Invalid OTP (3 attempts → lock)
- [ ] Error: Expired OTP (resend flow)
- [ ] Edge: Refresh mid-flow (state persists from localStorage)

---

## Implementation Checklist

### Preparation
- [ ] Read CLAUDE.md Section 1 (mandatory instructions)
- [ ] Review PR#67 (OTP API fix - dependency)
- [ ] Check catalog AdvancedSearch component (reuse for step 1)
- [ ] Verify SmartScanner component (reuse for step 2 ID upload)

### Development
- [ ] Create Zustand store: `src/stores/useBookingWizardStore.ts`
- [ ] Create main page: `src/app/[locale]/bookings/new/page.tsx`
- [ ] Create step components:
  - [ ] `VehicleSelectionStep.tsx` (reuse AdvancedSearch)
  - [ ] `CustomerInfoStep.tsx` (reuse SmartScanner)
  - [ ] `OtpVerificationStep.tsx` (use /api/otp/send + /api/otp/verify)
- [ ] Add loading states (MUI Skeleton)
- [ ] Add error handling (MUI Alert)
- [ ] Add validation feedback (inline errors)

### Testing
- [ ] Unit tests for store
- [ ] Integration tests for full flow
- [ ] E2E tests for happy path + errors
- [ ] Manual testing on EN/AR locales
- [ ] Mobile responsive testing

### Deployment
- [ ] Create feature branch: `cc/booking-wizard-implementation`
- [ ] Commit incremental changes (one component per commit)
- [ ] Build and lint pass
- [ ] PR review + approval
- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Deploy to production

---

## Related Issues & PRs

- **PR#67**: OTP crypto.randomInt fix (DEPENDENCY - must merge first)
- **PR#54**: Vehicle preselection (complements wizard flow)
- **PR#59**: Booking dropdown fixes (may be obsolete after wizard)
- **PR#55**: GET bookings endpoint (used in confirmation page)

---

## Success Metrics

### Before (Current 3-Step)
- OTP load error: 100% (broken)
- Drop-off rate: Unknown (analytics needed)
- Avg completion time: Unknown

### After (Single-Page Wizard)
- OTP load error: 0% (fixed in PR#67)
- Drop-off rate: Target < 30% (industry standard)
- Avg completion time: Target < 3 minutes
- Bundle size: Expect -50 KB (single route vs 3 routes)

---

## Notes for Implementation Agent (BB)

1. **DO NOT** implement until PR#67 is merged (OTP API dependency)
2. **DO** reuse existing components:
   - `AdvancedSearch` from catalog (vehicle selection)
   - `SmartScanner` from document-verify (ID upload)
   - `/api/otp/send` + `/api/otp/verify` from PR#67
3. **DO** use Zustand primitive selectors (avoid object selectors - React 19 infinite loop bug)
4. **DO** add proper docstrings (≥80% coverage required)
5. **DO** test on both EN and AR locales

---

**Specification by**: CC (Claude Code)
**Implementation**: Assigned to BB (Blackbox)
**Review**: CC final approval before merge
**Target Date**: 2026-01-18 (7 days after PR#67 merge)
