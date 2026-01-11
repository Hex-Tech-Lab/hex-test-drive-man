# Booking Flow Diagnosis - Why It's Broken

**Date**: 2026-01-11 2345 EET
**Agent**: CC
**Status**: DIAGNOSIS COMPLETE

---

## Current State (BROKEN)

### Route Structure
```
/bookings/step1  → Phone + OTP
/bookings/step2  → Vehicle + Date
/bookings/step3  → Confirmation
```

### Why Broken
1. **3 separate routes** = URL changes mid-flow = state loss on refresh
2. **OTP first** = high friction (user doesn't know vehicle yet)
3. **Vehicle selection in step2** = wrong (should inherit from catalog)
4. **No visual progress** = user confused about steps
5. **Client-side OTP** = was broken (fixed in PR#67)

---

## Required State (USER SPEC)

### Single Route with Tabs
```
/bookings/new?vehicleId=X  → Single page, 3 tabs
  Tab 1: Date/Time/Venue (vehicle inherited, show small photo)
  Tab 2: Upload ID + Driver's License
  Tab 3: Confirm + OTP → Reservation details (screen + SMS)
```

### Key Requirements
1. ✅ **One screen** - no route changes
2. ✅ **Vehicle inherited** from catalog (query param)
3. ✅ **3 tabs** marked clearly (1, 2, 3)
4. ✅ **OTP last** - minimal friction
5. ✅ **Reservation output** - screen display + SMS

---

## Fix Strategy

### Phase 1: Create Single-Page Wizard (URGENT)
```typescript
// src/app/[locale]/bookings/new/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { Box, Stepper, Step, StepLabel } from '@mui/material'

export default function BookingWizard() {
  const params = useSearchParams()
  const vehicleId = params.get('vehicleId')  // Inherited from catalog
  const [step, setStep] = useState(1)
  
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 4 }}>
      <Stepper activeStep={step - 1}>
        <Step><StepLabel>Date & Time</StepLabel></Step>
        <Step><StepLabel>ID Upload</StepLabel></Step>
        <Step><StepLabel>Confirm</StepLabel></Step>
      </Stepper>
      
      {step === 1 && <DateTimeStep vehicleId={vehicleId} />}
      {step === 2 && <DocumentUploadStep />}
      {step === 3 && <ConfirmStep />}
    </Box>
  )
}
```

### Phase 2: Update Catalog Links
```typescript
// VehicleCard.tsx
<Button href={`/bookings/new?vehicleId=${vehicle.id}`}>
  Book Test Drive
</Button>
```

### Phase 3: Deprecate Old Routes
```
/bookings/step1 → redirect to /bookings/new
/bookings/step2 → redirect to /bookings/new
/bookings/step3 → redirect to /bookings/new
```

---

## Component Breakdown

### Tab 1: Date & Time
- Display: Small vehicle photo (inherited)
- Input: Date picker
- Input: Time slots (from API)
- Input: Venue dropdown (Cairo/Alexandria/etc)
- Button: Next (enabled when all filled)

### Tab 2: ID Upload
- Component: Reuse `SmartScanner` from document-verify
- Upload: National ID
- Upload: Driver's License
- OCR: Auto-extract data
- Button: Next (enabled when uploaded)

### Tab 3: Confirm + OTP
- Display: Summary (vehicle, date, time, venue, documents)
- Button: Send OTP (uses /api/otp/send from PR#67)
- Input: 6-digit OTP code
- Button: Confirm Booking
- Success: Show reservation details + SMS sent

---

## Files to Create

1. `src/app/[locale]/bookings/new/page.tsx` - Main wizard
2. `src/components/booking/wizard/DateTimeStep.tsx` - Tab 1
3. `src/components/booking/wizard/DocumentUploadStep.tsx` - Tab 2
4. `src/components/booking/wizard/ConfirmStep.tsx` - Tab 3
5. `src/stores/useBookingStore.ts` - Wizard state

---

## Files to Modify

1. `src/components/VehicleCard.tsx` - Update booking link
2. `src/app/[locale]/bookings/step1/page.tsx` - Add redirect
3. `src/app/[locale]/bookings/step2/page.tsx` - Add redirect
4. `src/app/[locale]/bookings/step3/page.tsx` - Add redirect

---

## Dependencies

- ✅ PR#67 merged (OTP API fix)
- ✅ SmartScanner component exists (document-verify)
- ✅ /api/otp/send and /api/otp/verify working
- ⏳ Need: Booking API endpoint for final submission

---

## Time Estimate

- Create wizard page: 2 hours
- Create 3 tab components: 3 hours
- Update catalog links: 30 min
- Add redirects: 30 min
- Testing: 1 hour
- **Total**: 7 hours (1 BB work day)

---

## Critical Correction to BOOKING_WIZARD_SPEC.md

**Original Spec (WRONG)**:
```
Step 1: Vehicle Selection
Step 2: Customer Info
Step 3: OTP
```

**Corrected Spec (RIGHT)**:
```
Step 1: Date/Time/Venue (vehicle INHERITED)
Step 2: ID + License Upload
Step 3: Confirm + OTP
```

---

## Next Actions

1. **BB**: Implement `/bookings/new` wizard per corrected spec
2. **CC**: Update `BOOKING_WIZARD_SPEC.md` with corrections
3. **Test**: EN + AR locales, mobile responsive
4. **Deploy**: Staging → UAT → Production

---

**Diagnosis by**: CC
**Status**: Ready for BB implementation
**Priority**: CRITICAL (production booking broken)
