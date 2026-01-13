'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { Box, Stepper, Step, StepLabel, Button, Container, CircularProgress, Alert, Typography } from '@mui/material';
import { useBookingWizardStore } from '@/stores/useBookingWizardStore';
import DateTimeStep from '@/components/booking/wizard/DateTimeStep';
import DocumentUploadStep from '@/components/booking/wizard/DocumentUploadStep';
import ConfirmStep from '@/components/booking/wizard/ConfirmStep';
import BookingErrorBoundary from '@/components/booking/BookingErrorBoundary';

/**
 * Booking wizard page - single page with 3 steps
 * Step 1: Date/Time/Venue (vehicle inherited from catalog)
 * Step 2: ID + Driver's License upload
 * Step 3: Confirm + OTP verification
 *
 * Accessed via /bookings/new?vehicleId=X from catalog
 */
export default function BookingWizardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  // Use primitive selectors to avoid React 19 infinite loop
  const step = useBookingWizardStore((s) => s.step);
  const setStep = useBookingWizardStore((s) => s.setStep);
  const vehicleId = useBookingWizardStore((s) => s.vehicleId);
  const setVehicleId = useBookingWizardStore((s) => s.setVehicleId);
  const canProceedToStep2 = useBookingWizardStore((s) => s.canProceedToStep2);
  const canProceedToStep3 = useBookingWizardStore((s) => s.canProceedToStep3);
  const reset = useBookingWizardStore((s) => s.reset);

  const steps = ['Date & Time', 'ID Upload', 'Confirm'];

  const [validating, setValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  // UUID validation regex
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // Initialize and validate vehicleId from URL on mount
  useEffect(() => {
    const urlVehicleId = searchParams.get('vehicleId');

    // No vehicleId provided - redirect to catalog
    if (!urlVehicleId) {
      router.push(`/${locale}/vehicles`);
      return;
    }

    // Invalid UUID format
    if (!UUID_REGEX.test(urlVehicleId)) {
      setValidationError('Invalid vehicle ID format. Please select a vehicle from the catalog.');
      setValidating(false);
      return;
    }

    // Valid UUID - set in store
    setVehicleId(urlVehicleId);
    setValidating(false);
  }, [searchParams, router, locale, setVehicleId]);

  /**
   * Navigate to next step
   * Validates current step before proceeding
   */
  const handleNext = () => {
    if (step === 1 && canProceedToStep2()) {
      setStep(2);
    } else if (step === 2 && canProceedToStep3()) {
      setStep(3);
    }
  };

  /**
   * Navigate to previous step
   */
  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3);
    }
  };

  /**
   * Cancel booking and return to catalog
   * Resets all wizard state
   */
  const handleCancel = () => {
    reset();
    router.push(`/${locale}/vehicles`);
  };

  // Show loading spinner while validating vehicleId
  if (validating) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading booking wizard...
        </Typography>
      </Container>
    );
  }

  // Show validation error
  if (validationError) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {validationError}
        </Alert>
        <Button variant="contained" onClick={() => router.push(`/${locale}/vehicles`)}>
          Back to Catalog
        </Button>
      </Container>
    );
  }

  return (
    <BookingErrorBoundary fallbackMessage="We encountered an error during the booking process. Please try again or contact support.">
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          {/* Stepper shows progress across 3 steps */}
          <Stepper activeStep={step - 1}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Step content */}
        <Box sx={{ minHeight: 400, mb: 4 }}>
          {step === 1 && <DateTimeStep />}
          {step === 2 && <DocumentUploadStep />}
          {step === 3 && <ConfirmStep />}
        </Box>

        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button onClick={handleCancel} color="inherit">
            Cancel
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {step > 1 && (
              <Button onClick={handleBack} variant="outlined">
                Back
              </Button>
            )}
            {step < 3 && (
              <Button
                onClick={handleNext}
                variant="contained"
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
      </Container>
    </BookingErrorBoundary>
  );
}
