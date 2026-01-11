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

### Step 1: Vehicle Selection

**Purpose**: Select vehicle for test drive
**Entry**: Direct link or catalog pre-selection

**UI Components**:
- Reuse `AdvancedSearch` component from catalog
- Show pre-selected vehicle if `?vehicleId=X` in URL
- Allow changing selection via search/filters
- "Next" button enabled when vehicle selected

**State**:
```typescript
{
  step: 1,
  selectedVehicle: {
    id: string,
    name: string,
    image: string,
    brand: string,
  } | null,
}
```

**Validation**:
- Required: `selectedVehicle !== null`

**Navigation**:
- Next → Step 2 (customer info)
- Cancel → Catalog

---

### Step 2: Customer Info + ID Upload

**Purpose**: Collect customer details and ID verification
**Dependencies**: Step 1 complete

**UI Components**:
- Phone number field (E.164 format)
- Name field
- ID upload (camera/manual/scan via SmartScanner)
- Date/time picker for test drive

**State**:
```typescript
{
  step: 2,
  customer: {
    phone: string,
    name: string,
    idDocument: File | null,
    idData: {
      nationalId: string,
      dateOfBirth: string,
      expiryDate: string,
    } | null,
  },
  appointment: {
    date: string, // ISO 8601
    time: string, // HH:mm
    location: string,
  },
}
```

**Validation**:
- Required: `phone`, `name`, `idDocument`, `date`, `time`
- Optional: Auto-extracted ID data (from OCR)
- Phone format: `+20` prefix, 10-11 digits

**Navigation**:
- Back → Step 1 (vehicle selection)
- Next → Step 3 (OTP verification)
- Cancel → Catalog

---

### Step 3: OTP Verification (LAST STEP)

**Purpose**: Verify phone ownership and finalize booking
**Dependencies**: Step 1 + 2 complete

**UI Components**:
- Display: Selected vehicle summary
- Display: Customer name + phone
- Display: Appointment date/time
- OTP input field (6 digits)
- "Send OTP" button (with 60s cooldown)
- "Verify & Book" button

**Flow**:
1. User clicks "Send OTP"
2. API call to `/api/otp/send` (fixed in PR#67)
3. User receives SMS with 6-digit code
4. User enters code
5. API call to `/api/otp/verify`
6. If valid: Create booking, redirect to confirmation page
7. If invalid: Show error, allow retry (max 3 attempts)

**State**:
```typescript
{
  step: 3,
  otp: {
    sent: boolean,
    code: string,
    verified: boolean,
    attempts: number,
    expiresAt: string, // ISO 8601
  },
}
```

**Validation**:
- Required: `otp.code.length === 6 && /^\d{6}$/.test(otp.code)`
- Rate limiting: 60s between resends
- Max attempts: 3 failed verifications = lock for 5 minutes

**Navigation**:
- Back → Step 2 (customer info)
- Success → `/bookings/[id]/confirmed`
- Cancel → Catalog

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

  // Step 1: Vehicle
  selectedVehicle: {
    id: string;
    name: string;
    image: string;
    brand: string;
  } | null;
  setSelectedVehicle: (vehicle: BookingWizardState['selectedVehicle']) => void;

  // Step 2: Customer + Appointment
  customer: {
    phone: string;
    name: string;
    idDocument: File | null;
    idData: {
      nationalId: string;
      dateOfBirth: string;
      expiryDate: string;
    } | null;
  };
  setCustomer: (customer: Partial<BookingWizardState['customer']>) => void;

  appointment: {
    date: string;
    time: string;
    location: string;
  };
  setAppointment: (appointment: Partial<BookingWizardState['appointment']>) => void;

  // Step 3: OTP
  otp: {
    sent: boolean;
    code: string;
    verified: boolean;
    attempts: number;
    expiresAt: string | null;
  };
  setOtp: (otp: Partial<BookingWizardState['otp']>) => void;

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
      selectedVehicle: null,
      customer: {
        phone: '',
        name: '',
        idDocument: null,
        idData: null,
      },
      appointment: {
        date: '',
        time: '',
        location: 'Cairo Showroom', // Default
      },
      otp: {
        sent: false,
        code: '',
        verified: false,
        attempts: 0,
        expiresAt: null,
      },

      // Setters
      setStep: (step) => set({ step }),
      setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
      setCustomer: (customer) => set((state) => ({
        customer: { ...state.customer, ...customer },
      })),
      setAppointment: (appointment) => set((state) => ({
        appointment: { ...state.appointment, ...appointment },
      })),
      setOtp: (otp) => set((state) => ({
        otp: { ...state.otp, ...otp },
      })),

      // Validation
      canProceedToStep2: () => {
        const { selectedVehicle } = get();
        return selectedVehicle !== null;
      },
      canProceedToStep3: () => {
        const { customer, appointment } = get();
        return (
          customer.phone.length >= 10 &&
          customer.name.length > 0 &&
          customer.idDocument !== null &&
          appointment.date.length > 0 &&
          appointment.time.length > 0
        );
      },

      // Reset
      reset: () => set({
        step: 1,
        selectedVehicle: null,
        customer: {
          phone: '',
          name: '',
          idDocument: null,
          idData: null,
        },
        appointment: {
          date: '',
          time: '',
          location: 'Cairo Showroom',
        },
        otp: {
          sent: false,
          code: '',
          verified: false,
          attempts: 0,
          expiresAt: null,
        },
      }),
    }),
    {
      name: 'booking-wizard-storage',
      partialize: (state) => ({
        // Only persist step and vehicle selection
        step: state.step,
        selectedVehicle: state.selectedVehicle,
        // Don't persist sensitive data (phone, ID, OTP)
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
import VehicleSelectionStep from '@/components/booking/wizard/VehicleSelectionStep';
import CustomerInfoStep from '@/components/booking/wizard/CustomerInfoStep';
import OtpVerificationStep from '@/components/booking/wizard/OtpVerificationStep';

export default function BookingWizardPage() {
  const step = useBookingWizardStore((s) => s.step);
  const setStep = useBookingWizardStore((s) => s.setStep);
  const canProceedToStep2 = useBookingWizardStore((s) => s.canProceedToStep2);
  const canProceedToStep3 = useBookingWizardStore((s) => s.canProceedToStep3);

  const steps = ['Select Vehicle', 'Customer Info', 'Verify OTP'];

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 4 }}>
      <Stepper activeStep={step - 1} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {step === 1 && <VehicleSelectionStep />}
      {step === 2 && <CustomerInfoStep />}
      {step === 3 && <OtpVerificationStep />}

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
