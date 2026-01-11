# BUG FIX MASTER PLAN - 2026-01-07

**Version:** 1.0.0  
**Date:** 2026-01-07 1755 UTC  
**Agent:** BB (Blackbox AI)  
**Purpose:** Comprehensive sprint plan for fixing 16 production bugs  
**Total Effort:** 700 minutes (11h 40min) across 5 sprints

---

## EXECUTIVE SUMMARY

**Status:** Sprint 0 COMPLETED ✅ | Sprints 1-4 PENDING 🔴

**Bug Breakdown:**
- **Critical:** 9 bugs (booking system broken)
- **High:** 4 bugs (major UX issues)
- **Medium:** 2 bugs (navigation issues)
- **Low:** 1 bug (polish)

**Sprint Overview:**
- **Sprint 0:** Emergency revert (5 min) - ✅ COMPLETED
- **Sprint 1:** Critical booking bugs (365 min / 6h 5min)
- **Sprint 2:** Navigation & UX (150 min / 2h 30min)
- **Sprint 3:** Polish & nice-to-have (75 min / 1h 15min)
- **Sprint 4:** PR #47 investigation (105 min / 1h 45min)

**Recommended Execution:**
- Parallel execution possible for Sprints 1-3 (different agents)
- Sprint 4 can run independently (investigation task)
- Total calendar time: 2-3 days with parallel execution

---

## TABLE OF CONTENTS

1. [Sprint 0: Emergency Revert (COMPLETED)](#sprint-0-emergency-revert)
2. [Sprint 1: Critical Booking Bugs](#sprint-1-critical-booking-bugs)
3. [Sprint 2: Navigation & UX Enhancements](#sprint-2-navigation-ux-enhancements)
4. [Sprint 3: UX Polish & Nice-to-Have](#sprint-3-ux-polish-nice-to-have)
5. [Sprint 4: PR #47 Investigation & Proper Fix](#sprint-4-pr-47-investigation)
6. [Testing Strategy](#testing-strategy)
7. [Deployment Plan](#deployment-plan)
8. [Success Metrics](#success-metrics)

---

## SPRINT 0: EMERGENCY REVERT

**Status:** ✅ COMPLETED  
**Duration:** 5 minutes  
**Completed:** 2026-01-07 (commit aa6d1a1)  
**Agent:** BB (Blackbox AI)

### Objective
Revert PR #47 which made drawer always visible (worse than original bug).

### Tasks Completed
1. ✅ Identified problematic commit (a58f897)
2. ✅ Executed revert: `git revert a58f897 --no-edit`
3. ✅ Pushed to GitHub: `git push origin main`
4. ✅ Verified drawer behavior restored

### Outcome
- Drawer no longer always visible
- Reverted to previous state (skeleton flash exists but manageable)
- Production stabilized
- Investigation needed before retry (Sprint 4)

---

## SPRINT 1: CRITICAL BOOKING BUGS

**Status:** 🔴 PENDING  
**Duration:** 365 minutes (6h 5min)  
**Priority:** HIGHEST  
**Agent:** BB (Blackbox AI)  
**Branch:** `bb/sprint1-critical-booking-fixes`

### Objective
Make booking system fully functional end-to-end.

### Success Criteria
- ✅ Users can complete booking without errors
- ✅ QR codes generated successfully
- ✅ Confirmation emails sent
- ✅ No invalid bookings possible (validation working)
- ✅ Time slot availability checked in real-time
- ✅ National ID upload working with feedback

### Tasks (9 bugs)

#### Task 1.1: BUG-020 - National ID Validation Too Strict
**Time:** 20 minutes  
**Priority:** CRITICAL  
**Files:** `src/components/booking/IDUpload.tsx`

**Problem:** Rejects valid IDs with spaces/dashes (e.g., "123 4567 8901 234")

**Fix:**
```typescript
const validateNationalID = (id: string): boolean => {
  const normalized = id.replace(/\D/g, ''); // Remove non-digits
  
  if (normalized.length !== 14) {
    setError('National ID must be 14 digits');
    return false;
  }
  
  return true;
};
```

**Testing:**
- Test with spaces: "123 4567 8901 234" → ✅ Valid
- Test with dashes: "123-4567-8901-234" → ✅ Valid
- Test without separators: "12345678901234" → ✅ Valid
- Test invalid length: "123456789" → ❌ Invalid

---

#### Task 1.2: BUG-021 - Date Picker Allows Past Dates
**Time:** 15 minutes  
**Priority:** CRITICAL  
**Files:** `src/components/booking/ReservationForm.tsx`

**Problem:** Users can select past dates for test drive

**Fix:**
```typescript
import { DatePicker } from '@mui/x-date-pickers';
import { addDays } from 'date-fns';

<DatePicker
  label="Select Date"
  value={selectedDate}
  onChange={setSelectedDate}
  minDate={new Date()} // Today
  maxDate={addDays(new Date(), 30)} // 30 days ahead
  shouldDisableDate={(date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Disable weekends
  }}
/>
```

**Testing:**
- Try selecting yesterday → ❌ Disabled
- Try selecting today → ✅ Enabled
- Try selecting 31 days ahead → ❌ Disabled
- Try selecting weekend → ❌ Disabled

---

#### Task 1.3: BUG-013 - Booking Form Validation Missing
**Time:** 45 minutes  
**Priority:** CRITICAL  
**Files:** `src/components/booking/ReservationForm.tsx`

**Problem:** Form accepts empty/invalid inputs

**Fix:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const bookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^01[0-9]{9}$/, 'Invalid Egyptian phone number'),
  email: z.string().email('Invalid email address'),
  date: z.date().min(new Date(), 'Date cannot be in the past'),
  timeSlot: z.string().min(1, 'Please select a time slot'),
  vehicleId: z.string().min(1, 'Please select a vehicle'),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(bookingSchema),
});
```

**Dependencies:**
```bash
pnpm add react-hook-form zod @hookform/resolvers/zod
```

**Testing:**
- Submit empty form → ❌ Show all errors
- Enter invalid email → ❌ Show email error
- Enter invalid phone → ❌ Show phone error
- Enter valid data → ✅ Submit successful

---

#### Task 1.4: BUG-014 - Time Slot Availability Not Checked
**Time:** 60 minutes  
**Priority:** CRITICAL  
**Files:** 
- `src/components/booking/ReservationForm.tsx`
- `src/app/api/reservations/availability/route.ts`

**Problem:** Users can book already-taken time slots (double-booking)

**Fix:**
```typescript
// Frontend: src/components/booking/ReservationForm.tsx
const [availableSlots, setAvailableSlots] = useState<string[]>([]);

useEffect(() => {
  const fetchAvailability = async () => {
    if (!vehicleId || !date) return;
    
    const response = await fetch(
      `/api/reservations/availability?vehicleId=${vehicleId}&date=${date.toISOString()}`
    );
    const { availableSlots } = await response.json();
    setAvailableSlots(availableSlots);
  };
  
  fetchAvailability();
}, [vehicleId, date]);

// Disable unavailable slots
<Button 
  disabled={!availableSlots.includes(slot.value)}
  onClick={() => setTimeSlot(slot.value)}
>
  {slot.label}
</Button>

// Backend: src/app/api/reservations/availability/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vehicleId = searchParams.get('vehicleId');
  const date = searchParams.get('date');
  
  // Get all booked slots for this vehicle/date
  const { data: bookedSlots } = await supabase
    .from('reservations')
    .select('time_slot')
    .eq('vehicle_id', vehicleId)
    .eq('date', date)
    .eq('status', 'confirmed');
  
  // Generate all possible slots (9AM-6PM)
  const allSlots = generateTimeSlots(); // ['09:00', '10:00', ...]
  
  // Filter out booked slots
  const availableSlots = allSlots.filter(
    slot => !bookedSlots.some(b => b.time_slot === slot)
  );
  
  return Response.json({ availableSlots });
}
```

**Testing:**
- Book slot 10:00 AM for Vehicle X on Date Y
- Open booking form for same vehicle/date
- Verify 10:00 AM is disabled
- Verify other slots are enabled
- Try booking disabled slot → ❌ Button disabled

---

#### Task 1.5: BUG-015 - QR Code Not Generated
**Time:** 30 minutes  
**Priority:** CRITICAL  
**Files:** 
- `src/components/booking/BookingQRCode.tsx`
- `src/app/[locale]/bookings/[id]/confirmed/page.tsx`

**Problem:** QR code shows "Loading..." indefinitely

**Fix:**
```typescript
// src/components/booking/BookingQRCode.tsx
import QRCode from 'qrcode';
import { useState, useEffect } from 'react';

export default function BookingQRCode({ booking }: { booking: Reservation }) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrData = JSON.stringify({
          bookingId: booking.id,
          vehicleId: booking.vehicle_id,
          datetime: booking.datetime,
          status: booking.status,
          nationalId: booking.national_id,
        });
        
        const qrDataURL = await QRCode.toDataURL(qrData, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        
        setQrCode(qrDataURL);
      } catch (err) {
        console.error('QR generation failed:', err);
        setError('Failed to generate QR code. Please contact support.');
      }
    };
    
    if (booking.id) {
      generateQR();
    }
  }, [booking]);
  
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!qrCode) return <CircularProgress />;
  
  return (
    <Box>
      <img src={qrCode} alt="Booking QR Code" />
      <Button onClick={() => downloadQR(qrCode)}>Download QR Code</Button>
    </Box>
  );
}
```

**Testing:**
- Complete booking
- Navigate to confirmation page
- Verify QR code appears within 2 seconds
- Verify QR code is scannable
- Test download button

---

#### Task 1.6: BUG-016 - National ID Upload Fails Silently
**Time:** 45 minutes  
**Priority:** HIGH  
**Files:** 
- `src/components/booking/IDUpload.tsx`
- `src/app/api/upload-id/route.ts`

**Problem:** Upload shows loading spinner indefinitely, no feedback

**Fix:**
```typescript
// src/components/booking/IDUpload.tsx
const [uploading, setUploading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState(false);
const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

const handleUpload = async (file: File) => {
  // Validate file
  if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
    setError('Please upload a JPG or PNG image');
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB
    setError('File size must be less than 5MB');
    return;
  }
  
  setUploading(true);
  setError(null);
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bookingId', bookingId);
    
    const response = await fetch('/api/upload-id', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || 'Upload failed');
    }
    
    const { url } = await response.json();
    setUploadedUrl(url);
    setSuccess(true);
    onUploadComplete(url);
  } catch (err) {
    setError(err.message || 'Failed to upload ID. Please try again.');
  } finally {
    setUploading(false);
  }
};

// UI feedback
{uploading && <CircularProgress />}
{error && <Alert severity="error">{error}</Alert>}
{success && <Alert severity="success">ID uploaded successfully!</Alert>}
{uploadedUrl && <img src={uploadedUrl} alt="Uploaded ID" />}
```

**Testing:**
- Upload valid JPG → ✅ Success message
- Upload PNG → ✅ Success message
- Upload PDF → ❌ Error: "Please upload JPG or PNG"
- Upload 10MB file → ❌ Error: "File size must be less than 5MB"
- Upload valid file → ✅ Preview shown

---

#### Task 1.7: BUG-023 - Vehicle Selector Shows All Vehicles
**Time:** 30 minutes  
**Priority:** HIGH  
**Files:** 
- `src/components/booking/ReservationForm.tsx`
- `src/app/api/vehicles/route.ts`

**Problem:** Dropdown shows all 408 vehicles including unavailable ones

**Fix:**
```typescript
// Backend: src/app/api/vehicles/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const availableOnly = searchParams.get('availableOnly') === 'true';
  
  let query = supabase
    .from('vehicle_trims')
    .select(`
      id,
      name,
      brand:brands(name),
      model:models(name),
      available_for_test_drive
    `)
    .order('brand.name', { ascending: true });
  
  if (availableOnly) {
    query = query.eq('available_for_test_drive', true);
  }
  
  const { data, error } = await query;
  
  return Response.json({ 
    vehicles: data?.map(v => ({
      id: v.id,
      name: `${v.brand.name} ${v.model.name} ${v.name}`,
      available: v.available_for_test_drive,
    })) 
  });
}

// Frontend: src/components/booking/ReservationForm.tsx
useEffect(() => {
  fetch('/api/vehicles?availableOnly=true')
    .then(res => res.json())
    .then(data => setVehicles(data.vehicles));
}, []);

<Select
  value={vehicleId}
  onChange={(e) => setVehicleId(e.target.value)}
>
  {vehicles.map(vehicle => (
    <MenuItem key={vehicle.id} value={vehicle.id}>
      {vehicle.name}
    </MenuItem>
  ))}
</Select>
```

**Testing:**
- Open vehicle selector
- Verify only available vehicles shown
- Verify count < 408 (only available ones)
- Select vehicle → ✅ Booking proceeds

---

#### Task 1.8: BUG-019 - Booking Cancellation Not Working
**Time:** 45 minutes  
**Priority:** HIGH  
**Files:** 
- `src/app/[locale]/bookings/page.tsx`
- `src/app/api/reservations/[id]/route.ts`

**Problem:** "Cancel Booking" button does nothing

**Fix:**
```typescript
// src/app/[locale]/bookings/page.tsx
const [confirmDialog, setConfirmDialog] = useState<{
  open: boolean;
  bookingId: string | null;
}>({ open: false, bookingId: null });

const handleCancelClick = (bookingId: string) => {
  setConfirmDialog({ open: true, bookingId });
};

const handleCancelConfirm = async () => {
  const { bookingId } = confirmDialog;
  if (!bookingId) return;
  
  try {
    const response = await fetch(`/api/reservations/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    
    if (!response.ok) throw new Error('Cancellation failed');
    
    // Refresh bookings list
    await fetchBookings();
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'Booking cancelled successfully',
      severity: 'success',
    });
  } catch (error) {
    setSnackbar({
      open: true,
      message: 'Failed to cancel booking. Please try again.',
      severity: 'error',
    });
  } finally {
    setConfirmDialog({ open: false, bookingId: null });
  }
};

// Confirmation dialog
<Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, bookingId: null })}>
  <DialogTitle>Cancel Booking</DialogTitle>
  <DialogContent>
    Are you sure you want to cancel this booking?
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmDialog({ open: false, bookingId: null })}>
      No, Keep It
    </Button>
    <Button onClick={handleCancelConfirm} color="error">
      Yes, Cancel
    </Button>
  </DialogActions>
</Dialog>
```

**Testing:**
- Click "Cancel" button → ✅ Confirmation dialog appears
- Click "No, Keep It" → ✅ Dialog closes, booking unchanged
- Click "Yes, Cancel" → ✅ Booking status updated to 'cancelled'
- Verify booking moved to "Cancelled" section
- Verify success message shown

---

#### Task 1.9: BUG-017 - Confirmation Email Not Sent
**Time:** 60 minutes  
**Priority:** HIGH  
**Files:** 
- `src/lib/email/sendBookingConfirmation.ts` (new)
- `src/app/api/reservations/route.ts`

**Problem:** No confirmation email sent after booking

**Fix:**
```typescript
// Install Resend
// pnpm add resend

// src/lib/email/sendBookingConfirmation.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingConfirmation(booking: Reservation) {
  const { email, name, vehicle_name, datetime, qr_code_url, locale } = booking;
  
  const subject = locale === 'ar' 
    ? 'تأكيد حجز تجربة القيادة'
    : 'Test Drive Booking Confirmation';
  
  const html = locale === 'ar' ? `
    <div dir="rtl">
      <h1>تم تأكيد حجزك</h1>
      <p>عزيزي ${name}،</p>
      <p>تم تأكيد حجز تجربة القيادة الخاصة بك:</p>
      <ul>
        <li>المركبة: ${vehicle_name}</li>
        <li>التاريخ والوقت: ${datetime}</li>
      </ul>
      <p>رمز QR الخاص بك:</p>
      <img src="${qr_code_url}" alt="QR Code" width="300" />
      <p>يرجى إحضار هذا الرمز معك عند الحضور.</p>
    </div>
  ` : `
    <h1>Booking Confirmed</h1>
    <p>Dear ${name},</p>
    <p>Your test drive booking is confirmed:</p>
    <ul>
      <li>Vehicle: ${vehicle_name}</li>
      <li>Date/Time: ${datetime}</li>
    </ul>
    <p>Your QR Code:</p>
    <img src="${qr_code_url}" alt="QR Code" width="300" />
    <p>Please bring this code with you when you arrive.</p>
  `;
  
  try {
    await resend.emails.send({
      from: 'bookings@testdrive.com',
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    // Don't throw - email failure shouldn't block booking
  }
}

// src/app/api/reservations/route.ts
import { sendBookingConfirmation } from '@/lib/email/sendBookingConfirmation';

export async function POST(request: Request) {
  // ... create reservation ...
  
  const reservation = await createReservation(data);
  
  // Send confirmation email (async, don't await)
  sendBookingConfirmation(reservation).catch(console.error);
  
  return Response.json({ reservation });
}
```

**Environment Variables:**
```bash
# Add to .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Testing:**
- Complete booking
- Check email inbox within 1 minute
- Verify email received with correct details
- Verify QR code image in email
- Test both EN and AR locales

---

#### Task 1.10: Build & Test
**Time:** 15 minutes

**Commands:**
```bash
# Build
pnpm build

# Check for TypeScript errors
pnpm tsc --noEmit

# Run linter
pnpm lint

# Test booking flow end-to-end
pnpm dev
# Navigate to /en/bookings/new
# Complete full booking flow
# Verify all fixes working
```

---

### Sprint 1 Summary

**Total Time:** 365 minutes (6h 5min)  
**Bugs Fixed:** 9  
**Files Modified:** ~15  
**Dependencies Added:** 
- react-hook-form
- zod
- @hookform/resolvers/zod
- resend

**Success Criteria:**
- ✅ All 9 bugs fixed
- ✅ Build successful
- ✅ No TypeScript errors
- ✅ End-to-end booking flow working
- ✅ QR codes generated
- ✅ Emails sent
- ✅ Validation working

**Git Workflow:**
```bash
git checkout -b bb/sprint1-critical-booking-fixes
# ... make changes ...
git add .
git commit -m "fix(booking): resolve 9 critical booking bugs (BUG-013 to BUG-023)

- Add form validation with react-hook-form + zod
- Implement real-time time slot availability checking
- Fix QR code generation
- Add ID upload feedback
- Implement confirmation emails with Resend
- Fix booking cancellation
- Filter vehicle selector to available only
- Normalize National ID validation
- Restrict date picker to future dates only

Fixes: BUG-013, BUG-014, BUG-015, BUG-016, BUG-017, BUG-019, BUG-020, BUG-021, BUG-023"
git push origin bb/sprint1-critical-booking-fixes
# Create PR via GitHub CLI or API
```

---

## SPRINT 2: NAVIGATION & UX ENHANCEMENTS

**Status:** 🔴 PENDING  
**Duration:** 150 minutes (2h 30min)  
**Priority:** HIGH  
**Agent:** BB (Blackbox AI)  
**Branch:** `bb/sprint2-navigation-ux`

### Objective
Improve navigation and mobile UX.

### Success Criteria
- ✅ Header navigation works properly (clickable logo)
- ✅ Mobile UX improved (back button, responsive time slots)
- ✅ Breadcrumbs on all pages
- ✅ Booking dashboard shows data correctly

### Tasks (5 bugs)

#### Task 2.1: BUG-025 - Logo/Platform Name Not Clickable
**Time:** 15 minutes  
**Priority:** HIGH  
**Files:** `src/components/Header.tsx`

**Fix:**
```typescript
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function Header() {
  const { locale } = useParams();
  
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Link 
          href={`/${locale}`} 
          style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <Image src="/logo.svg" alt="Logo" width={40} height={40} />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Test Drive Platform
            </Typography>
          </Box>
        </Link>
      </Toolbar>
    </AppBar>
  );
}
```

---

#### Task 2.2: BUG-027 - No Back Button in Header
**Time:** 20 minutes  
**Priority:** MEDIUM  
**Files:** `src/components/Header.tsx`

**Fix:**
```typescript
import { useRouter, usePathname, useParams } from 'next/navigation';
import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useParams();
  const isHomePage = pathname === `/${locale}`;
  const isRTL = locale === 'ar';
  
  return (
    <AppBar position="sticky">
      <Toolbar>
        {!isHomePage && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.back()}
            sx={{ 
              mr: isRTL ? 0 : 2, 
              ml: isRTL ? 2 : 0,
              display: { xs: 'block', md: 'none' }
            }}
            aria-label="Go back"
          >
            {isRTL ? <ArrowForwardIcon /> : <ArrowBackIcon />}
          </IconButton>
        )}
        {/* Rest of header */}
      </Toolbar>
    </AppBar>
  );
}
```

---

#### Task 2.3: BUG-018 - Booking Dashboard Empty State
**Time:** 30 minutes  
**Priority:** MEDIUM  
**Files:** `src/app/[locale]/bookings/page.tsx`

**Fix:**
```typescript
const [bookings, setBookings] = useState<Reservation[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/reservations');
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      setBookings(data.reservations || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  fetchBookings();
}, []);

if (loading) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  );
}

if (error) {
  return (
    <Alert severity="error" sx={{ m: 2 }}>
      {error}
      <Button onClick={() => window.location.reload()}>Retry</Button>
    </Alert>
  );
}

if (bookings.length === 0) {
  return <EmptyState />;
}

return (
  <Grid container spacing={2}>
    {bookings.map(booking => (
      <Grid item xs={12} sm={6} md={4} key={booking.id}>
        <BookingCard booking={booking} />
      </Grid>
    ))}
  </Grid>
);
```

---

#### Task 2.4: BUG-022 - Time Slot Grid Not Responsive
**Time:** 20 minutes  
**Priority:** MEDIUM  
**Files:** `src/components/booking/ReservationForm.tsx`

**Fix:**
```typescript
<Grid container spacing={2}>
  {timeSlots.map((slot) => (
    <Grid item xs={6} sm={4} md={3} key={slot.value}>
      <Button
        fullWidth
        variant={selectedSlot === slot.value ? 'contained' : 'outlined'}
        onClick={() => setSelectedSlot(slot.value)}
        disabled={!availableSlots.includes(slot.value)}
        sx={{
          minHeight: 48, // Touch-friendly (44px minimum)
          fontSize: { xs: '0.875rem', sm: '1rem' },
          padding: { xs: '8px', sm: '12px' },
        }}
      >
        {slot.label}
      </Button>
    </Grid>
  ))}
</Grid>
```

---

#### Task 2.5: BUG-026 - No Breadcrumbs Navigation
**Time:** 45 minutes  
**Priority:** MEDIUM  
**Files:** 
- `src/components/Breadcrumbs.tsx` (new)
- `src/app/[locale]/layout.tsx`

**Fix:**
```typescript
// src/components/Breadcrumbs.tsx
import { Breadcrumbs as MUIBreadcrumbs, Link, Typography } from '@mui/material';
import { usePathname, useParams } from 'next/navigation';
import NextLink from 'next/link';
import HomeIcon from '@mui/icons-material/Home';

export default function Breadcrumbs() {
  const pathname = usePathname();
  const { locale } = useParams();
  
  // Don't show breadcrumbs on home page
  if (pathname === `/${locale}`) return null;
  
  const pathSegments = pathname.split('/').filter(Boolean).slice(1); // Remove locale
  
  // Map segments to readable names
  const segmentNames: Record<string, string> = {
    bookings: locale === 'ar' ? 'الحجوزات' : 'Bookings',
    new: locale === 'ar' ? 'جديد' : 'New',
    confirmed: locale === 'ar' ? 'مؤكد' : 'Confirmed',
    catalog: locale === 'ar' ? 'الكتالوج' : 'Catalog',
  };
  
  return (
    <MUIBreadcrumbs 
      sx={{ mb: 2, px: 2, py: 1 }}
      aria-label="breadcrumb"
    >
      <Link 
        component={NextLink} 
        href={`/${locale}`} 
        underline="hover"
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
        {locale === 'ar' ? 'الرئيسية' : 'Home'}
      </Link>
      
      {pathSegments.map((segment, index) => {
        const href = `/${locale}/${pathSegments.slice(0, index + 1).join('/')}`;
        const isLast = index === pathSegments.length - 1;
        const name = segmentNames[segment] || segment;
        
        return isLast ? (
          <Typography key={segment} color="text.primary">
            {name}
          </Typography>
        ) : (
          <Link 
            key={segment} 
            component={NextLink} 
            href={href} 
            underline="hover"
          >
            {name}
          </Link>
        );
      })}
    </MUIBreadcrumbs>
  );
}

// src/app/[locale]/layout.tsx
import Breadcrumbs from '@/components/Breadcrumbs';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <Breadcrumbs />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

---

#### Task 2.6: Build & Test
**Time:** 20 minutes

---

### Sprint 2 Summary

**Total Time:** 150 minutes (2h 30min)  
**Bugs Fixed:** 5  
**Files Modified:** ~5  
**Dependencies Added:** None

**Git Workflow:**
```bash
git checkout -b bb/sprint2-navigation-ux
# ... make changes ...
git commit -m "feat(navigation): improve navigation and mobile UX (BUG-018, BUG-022, BUG-025, BUG-026, BUG-027)

- Make logo/platform name clickable (home navigation)
- Add back button in header (mobile only)
- Fix booking dashboard data fetching
- Make time slot grid responsive
- Add breadcrumbs navigation to all pages

Fixes: BUG-018, BUG-022, BUG-025, BUG-026, BUG-027"
git push origin bb/sprint2-navigation-ux
```

---

## SPRINT 3: UX POLISH & NICE-TO-HAVE

**Status:** 🔴 PENDING  
**Duration:** 75 minutes (1h 15min)  
**Priority:** MEDIUM  
**Agent:** BB (Blackbox AI)  
**Branch:** `bb/sprint3-ux-polish`

### Objective
Add polish features and competitive advantages.

### Success Criteria
- ✅ Calendar integration working
- ✅ Flag icons in language switcher

### Tasks (2 bugs)

#### Task 3.1: BUG-024 - Missing "Add to Calendar" Button
**Time:** 45 minutes  
**Priority:** LOW  
**Files:** 
- `src/lib/calendar/generateICS.ts` (new)
- `src/app/[locale]/bookings/[id]/confirmed/page.tsx`

**Fix:**
```typescript
// src/lib/calendar/generateICS.ts
import { format } from 'date-fns';

export function generateICS(booking: Reservation): string {
  const { vehicle_name, datetime, location, name } = booking;
  const startDate = new Date(datetime);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour
  
  const formatICSDate = (date: Date) => {
    return format(date, "yyyyMMdd'T'HHmmss");
  };
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test Drive Platform//EN
BEGIN:VEVENT
UID:${booking.id}@testdrive.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:Test Drive - ${vehicle_name}
LOCATION:${location || 'Test Drive Center'}
DESCRIPTION:Test drive appointment for ${vehicle_name}\\nBooking ID: ${booking.id}\\nName: ${name}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
}

// src/app/[locale]/bookings/[id]/confirmed/page.tsx
import { generateICS } from '@/lib/calendar/generateICS';
import DownloadIcon from '@mui/icons-material/Download';

const handleAddToCalendar = () => {
  const icsContent = generateICS(booking);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `test-drive-${booking.id}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

<Button
  variant="outlined"
  startIcon={<DownloadIcon />}
  onClick={handleAddToCalendar}
  sx={{ mt: 2 }}
>
  Add to Calendar
</Button>
```

---

#### Task 3.2: BUG-028 - Language Switcher Uses Text Not Flags
**Time:** 30 minutes  
**Priority:** LOW  
**Files:** `src/components/LanguageSwitcher.tsx` or `src/components/Header.tsx`

**Fix:**
```typescript
// src/components/LanguageSwitcher.tsx
import { IconButton, Tooltip, Menu, MenuItem, Typography } from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇪🇬' },
];

export default function LanguageSwitcher() {
  const { locale } = useParams();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const currentLanguage = languages.find(lang => lang.code === locale);
  
  const handleLanguageChange = (langCode: string) => {
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(`/${locale}`, `/${langCode}`);
    router.push(newPath);
    setAnchorEl(null);
  };
  
  return (
    <>
      <Tooltip title={currentLanguage?.name || 'Change language'}>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label="Change language"
          color="inherit"
        >
          <Typography variant="h5" component="span">
            {currentLanguage?.flag}
          </Typography>
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={lang.code === locale}
          >
            <Typography variant="h6" component="span" sx={{ mr: 1 }}>
              {lang.flag}
            </Typography>
            {lang.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
```

---

### Sprint 3 Summary

**Total Time:** 75 minutes (1h 15min)  
**Bugs Fixed:** 2  
**Files Modified:** ~3  
**Dependencies Added:** None

**Git Workflow:**
```bash
git checkout -b bb/sprint3-ux-polish
# ... make changes ...
git commit -m "feat(ux): add calendar integration and flag icons (BUG-024, BUG-028)

- Add 'Add to Calendar' button with .ics file generation
- Replace text language switcher with flag icons
- Support Google Calendar, Apple Calendar, Outlook

Fixes: BUG-024, BUG-028"
git push origin bb/sprint3-ux-polish
```

---

## SPRINT 4: PR #47 INVESTIGATION

**Status:** 🔴 PENDING  
**Duration:** 105 minutes (1h 45min)  
**Priority:** MEDIUM  
**Agent:** BB (Blackbox AI)  
**Branch:** `bb/sprint4-drawer-fix`

### Objective
Investigate and properly fix BUG-011 (drawer issue) that PR #47 made worse.

### Success Criteria
- ✅ Root cause identified
- ✅ Proper fix implemented
- ✅ Drawer starts closed
- ✅ No skeleton flash
- ✅ Open/close works correctly
- ✅ Survives page reload

### Tasks

#### Task 4.1: Investigation (30 minutes)

**Steps:**
1. Review PR #47 changes:
   ```bash
   git show a58f897
   ```

2. Read current drawer implementation:
   ```bash
   cat src/components/CartDrawer.tsx
   cat src/components/CartDrawerSkeleton.tsx
   cat src/stores/cartStore.ts
   ```

3. Check localStorage usage:
   ```bash
   grep -r "localStorage.*drawer" src/
   ```

4. Identify issues:
   - State initialization
   - localStorage persistence logic
   - Event handlers
   - Hydration mismatches

---

#### Task 4.2: Implement Proper Fix (45 minutes)

**Likely Fix:**
```typescript
// src/stores/cartStore.ts (Zustand)
interface CartStore {
  items: CartItem[];
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      drawerOpen: false, // Always start closed
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ 
        items: state.items,
        // Don't persist drawerOpen state
      }),
    }
  )
);

// src/components/CartDrawer.tsx
export default function CartDrawer() {
  const { drawerOpen, closeDrawer, items } = useCartStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render until mounted (avoid hydration mismatch)
  if (!mounted) return null;
  
  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={closeDrawer}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
        },
      }}
    >
      {/* Drawer content */}
    </Drawer>
  );
}
```

---

#### Task 4.3: Thorough Testing (30 minutes)

**Test Cases:**
1. ✅ Page load → drawer closed
2. ✅ Add item to cart → drawer opens
3. ✅ Close drawer → stays closed
4. ✅ Reload page → drawer still closed
5. ✅ Add item → drawer opens → close → reload → drawer closed
6. ✅ No skeleton flash on load
7. ✅ Works in both EN and AR locales
8. ✅ Works on mobile and desktop

---

### Sprint 4 Summary

**Total Time:** 105 minutes (1h 45min)  
**Investigation:** 1  
**Files Modified:** ~3  
**Dependencies Added:** None

**Git Workflow:**
```bash
git checkout -b bb/sprint4-drawer-fix
# ... make changes ...
git commit -m "fix(drawer): properly fix cart drawer visibility issue (BUG-011)

Investigation findings:
- localStorage was persisting drawerOpen state
- Hydration mismatch between server and client
- Event handlers working correctly

Solution:
- Don't persist drawerOpen in localStorage
- Always initialize drawer as closed
- Add mounted check to avoid hydration mismatch
- Remove skeleton visibility during SSR

Fixes: BUG-011 (proper fix after PR #47 revert)"
git push origin bb/sprint4-drawer-fix
```

---

## TESTING STRATEGY

### Unit Testing
- Form validation logic
- National ID normalization
- Date validation
- Time slot availability calculation
- QR code generation
- ICS file generation

### Integration Testing
- Booking flow end-to-end
- Email sending
- ID upload to Supabase Storage
- API endpoints

### E2E Testing (Manual)
- Complete booking flow (EN locale)
- Complete booking flow (AR locale)
- Mobile responsive testing
- Navigation testing
- Drawer behavior testing

### Regression Testing
- Existing features still work
- No new console errors
- No TypeScript errors
- Build successful

---

## DEPLOYMENT PLAN

### Pre-Deployment Checklist
- [ ] All sprints completed
- [ ] All tests passing
- [ ] Build successful (`pnpm build`)
- [ ] No TypeScript errors (`pnpm tsc --noEmit`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Environment variables configured (RESEND_API_KEY)

### Deployment Steps

#### Sprint 1 Deployment
```bash
# Merge Sprint 1 PR
gh pr merge <PR_NUMBER> --squash

# Verify production deployment
# Test booking flow on production
```

#### Sprint 2 Deployment
```bash
# Merge Sprint 2 PR
gh pr merge <PR_NUMBER> --squash

# Verify navigation on production
```

#### Sprint 3 Deployment
```bash
# Merge Sprint 3 PR
gh pr merge <PR_NUMBER> --squash

# Test calendar download
```

#### Sprint 4 Deployment
```bash
# Merge Sprint 4 PR
gh pr merge <PR_NUMBER> --squash

# Verify drawer behavior on production
```

### Post-Deployment Verification
- [ ] Booking flow works end-to-end
- [ ] QR codes generated
- [ ] Emails sent
- [ ] Navigation works
- [ ] Drawer behavior correct
- [ ] No console errors
- [ ] Sentry: no new errors

---

## SUCCESS METRICS

### Booking System Health
- **Booking Completion Rate:** Target >90% (currently ~0% due to bugs)
- **QR Code Generation Success:** Target 100%
- **Email Delivery Rate:** Target >95%
- **Form Validation Errors:** Reduced by 80%
- **Double-Booking Incidents:** 0

### User Experience
- **Navigation Clarity:** Breadcrumbs on all pages
- **Mobile Usability:** Touch-friendly buttons (44x44px min)
- **Error Recovery:** Retry button working
- **Calendar Integration:** >50% adoption

### Technical Metrics
- **Build Success:** 100%
- **TypeScript Errors:** 0
- **Linting Errors:** 0
- **Sentry Error Rate:** <1% of sessions
- **Page Load Time:** <3s (FCP)

---

## RISK MITIGATION

### High-Risk Changes
1. **Form Validation (BUG-013):**
   - Risk: Breaking existing form submissions
   - Mitigation: Thorough testing, gradual rollout

2. **Email Integration (BUG-017):**
   - Risk: Email service downtime
   - Mitigation: Don't block booking on email failure, retry mechanism

3. **Time Slot Availability (BUG-014):**
   - Risk: Race conditions in double-booking prevention
   - Mitigation: Database-level constraints, optimistic locking

### Rollback Plan
- Each sprint is independent PR
- Can rollback individual PRs if issues found
- Revert commits available for emergency rollback

---

## APPENDIX: DEPENDENCIES

### New Dependencies (Sprint 1)
```json
{
  "dependencies": {
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "resend": "^3.0.0"
  }
}
```

### Installation
```bash
pnpm add react-hook-form zod @hookform/resolvers/zod resend
```

---

**END OF BUG FIX MASTER PLAN**

**Next Actions:**
1. Execute Sprint 1 (critical booking bugs)
2. Execute Sprint 2 (navigation & UX)
3. Execute Sprint 3 (polish)
4. Execute Sprint 4 (drawer investigation)
5. Update PERFORMANCE_LOG.md after each sprint

**Maintained By:** BB (Blackbox AI)  
**Last Updated:** 2026-01-07 1755 UTC  
**Version:** 1.0.0
