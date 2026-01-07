// New booking page with reservation form and ID upload
// Created: 2026-01-07
// Agent: BB
// MVP 1.5: Booking System

'use client';

import { useState } from 'react';
import { Container, Typography, Box, Stepper, Step, StepLabel, Button, Alert } from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import ReservationForm from '@/components/booking/ReservationForm';
import IDUpload from '@/components/booking/IDUpload';
import { useLanguageStore } from '@/stores/language-store';

const steps = ['Select Date & Time', 'Upload ID', 'Confirm'];
const stepsAr = ['اختر التاريخ والوقت', 'رفع البطاقة', 'تأكيد'];

export default function NewBookingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const language = useLanguageStore((state) => state.language);
  const isArabic = language === 'ar';

  const [activeStep, setActiveStep] = useState(0);
  const [reservationData, setReservationData] = useState<{
    vehicleId: string;
    datetime: string;
  } | null>(null);
  const [idData, setIdData] = useState<{
    nationalId: string;
    imageUrl: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReservationSubmit = (data: { vehicleId: string; datetime: string }) => {
    setReservationData(data);
    setActiveStep(1);
  };

  const handleIDUpload = (nationalId: string, imageUrl: string) => {
    setIdData({ nationalId, imageUrl });
    setActiveStep(2);
  };

  const handleConfirm = async () => {
    if (!reservationData || !idData) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vehicle_id: reservationData.vehicleId,
          reservation_datetime: reservationData.datetime,
          national_id: idData.nationalId,
          id_image_url: idData.imageUrl
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create reservation');
      }

      const data = await response.json();
      
      // Redirect to confirmation page
      router.push(`/${locale}/bookings/${data.reservation.id}/confirmed`);
    } catch (err: any) {
      console.error('Reservation error:', err);
      setError(err.message || 'Failed to create reservation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isArabic ? 'حجز جديد' : 'New Booking'}
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {(isArabic ? stepsAr : steps).map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <ReservationForm
            onSubmit={handleReservationSubmit}
            language={language}
          />
        )}

        {activeStep === 1 && (
          <Box>
            <IDUpload
              onUploadComplete={handleIDUpload}
              language={language}
            />
            <Button
              onClick={handleBack}
              sx={{ mt: 2 }}
            >
              {isArabic ? 'رجوع' : 'Back'}
            </Button>
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              {isArabic
                ? 'يرجى مراجعة بياناتك قبل التأكيد'
                : 'Please review your information before confirming'}
            </Alert>

            <Typography variant="h6" gutterBottom>
              {isArabic ? 'ملخص الحجز' : 'Booking Summary'}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body1">
                <strong>{isArabic ? 'التاريخ والوقت:' : 'Date & Time:'}</strong>{' '}
                {reservationData?.datetime}
              </Typography>
              <Typography variant="body1">
                <strong>{isArabic ? 'الرقم القومي:' : 'National ID:'}</strong>{' '}
                {idData?.nationalId}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button onClick={handleBack}>
                {isArabic ? 'رجوع' : 'Back'}
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirm}
                disabled={submitting}
              >
                {submitting
                  ? (isArabic ? 'جاري التأكيد...' : 'Confirming...')
                  : (isArabic ? 'تأكيد الحجز' : 'Confirm Booking')}
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </>
  );
}
