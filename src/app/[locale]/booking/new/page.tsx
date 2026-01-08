// Complete booking page with OCR + Barcode + Manual Entry
// Created: 2026-01-08
// Agent: BB
// MVP 1.5: Booking System - Phase 1

'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  Paper,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import ReservationForm from '@/components/booking/ReservationForm';
import CameraCapture from '@/components/booking/CameraCapture';
import OCRProcessor from '@/components/booking/OCRProcessor';
import BarcodeReader from '@/components/booking/BarcodeReader';
import ManualEntryForm from '@/components/booking/ManualEntryForm';
import { useLanguageStore } from '@/stores/language-store';
import { useBookingStore } from '@/stores/useBookingStore';

const steps = ['Select Date & Time', 'Capture ID', 'Verify Data', 'Confirm'];
const stepsAr = ['اختر التاريخ والوقت', 'التقاط البطاقة', 'التحقق من البيانات', 'تأكيد'];

type CaptureMode = 'camera' | 'manual';

export default function NewBookingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const language = useLanguageStore((state) => state.language);
  const isArabic = language === 'ar';

  const {
    bookingFlow,
    setBookingFlow,
    clearBookingFlow,
    setCurrentStep,
  } = useBookingStore();

  const [activeStep, setActiveStep] = useState(bookingFlow?.currentStep || 0);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('camera');
  const [capturingSide, setCapturingSide] = useState<'front' | 'back'>('front');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync active step with store
  useEffect(() => {
    if (bookingFlow) {
      setActiveStep(bookingFlow.currentStep);
    }
  }, [bookingFlow]);

  // Step 1: Reservation form submit
  const handleReservationSubmit = (data: { vehicleId: string; datetime: string }) => {
    setBookingFlow({
      vehicleId: data.vehicleId,
      datetime: data.datetime,
      currentStep: 1,
    });
    setActiveStep(1);
  };

  // Step 2: Camera capture
  const handleCameraCapture = (imageData: string, side: 'front' | 'back') => {
    if (side === 'front') {
      setBookingFlow({ idFrontImage: imageData });
      setCapturingSide('back');
    } else {
      setBookingFlow({ idBackImage: imageData });
      // Move to OCR processing
      setActiveStep(2);
      setCurrentStep(2);
    }
  };

  // Step 2: OCR complete
  const handleOCRComplete = (result: {
    name: string;
    nationalId: string;
    birthDate: string;
    confidence: number;
  }) => {
    setBookingFlow({ ocrData: result });
  };

  // Step 2: Barcode complete
  const handleBarcodeComplete = (
    data: {
      nationalId: string;
      name: string;
      birthDate: string;
    },
    verified: boolean
  ) => {
    setBookingFlow({
      barcodeData: { ...data, verified },
    });
  };

  // Step 2: Manual entry submit
  const handleManualSubmit = (data: {
    name: string;
    nationalId: string;
    birthDate: string;
    phone: string;
  }) => {
    setBookingFlow({ manualData: data });
    setActiveStep(3);
    setCurrentStep(3);
  };

  // Step 3: Confirm booking
  const handleConfirm = async () => {
    if (!bookingFlow) return;

    setSubmitting(true);
    setError(null);

    try {
      // Determine which data to use (priority: manual > barcode > OCR)
      const finalData = bookingFlow.manualData || {
        name: bookingFlow.barcodeData?.name || bookingFlow.ocrData?.name || '',
        nationalId:
          bookingFlow.barcodeData?.nationalId ||
          bookingFlow.ocrData?.nationalId ||
          '',
        birthDate:
          bookingFlow.barcodeData?.birthDate ||
          bookingFlow.ocrData?.birthDate ||
          '',
        phone: '', // Required for manual entry
      };

      // Upload images to Supabase Storage
      let idFrontUrl = null;
      let idBackUrl = null;

      if (bookingFlow.idFrontImage) {
        idFrontUrl = await uploadImage(bookingFlow.idFrontImage, 'id-front');
      }

      if (bookingFlow.idBackImage) {
        idBackUrl = await uploadImage(bookingFlow.idBackImage, 'id-back');
      }

      // Create reservation
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicle_id: bookingFlow.vehicleId,
          reservation_datetime: bookingFlow.datetime,
          national_id: finalData.nationalId,
          name: finalData.name,
          birth_date: finalData.birthDate,
          phone: finalData.phone,
          id_front_url: idFrontUrl,
          id_back_url: idBackUrl,
          ocr_confidence: bookingFlow.ocrData?.confidence,
          barcode_verified: bookingFlow.barcodeData?.verified,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create reservation');
      }

      const data = await response.json();

      // Clear booking flow
      clearBookingFlow();

      // Redirect to confirmation page
      router.push(`/${locale}/bookings/${data.reservation.id}`);
    } catch (err: any) {
      console.error('Reservation error:', err);
      setError(err.message || 'Failed to create reservation');
    } finally {
      setSubmitting(false);
    }
  };

  // Upload image to Supabase Storage
  const uploadImage = async (
    imageData: string,
    prefix: string
  ): Promise<string> => {
    const blob = await fetch(imageData).then((r) => r.blob());
    const formData = new FormData();
    formData.append('file', blob, `${prefix}-${Date.now()}.jpg`);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  };

  // Handle back navigation
  const handleBack = () => {
    if (activeStep === 2 && capturingSide === 'back') {
      setCapturingSide('front');
      return;
    }

    const newStep = activeStep - 1;
    setActiveStep(newStep);
    setCurrentStep(newStep);
  };

  // Handle mode switch
  const handleModeSwitch = (mode: CaptureMode) => {
    setCaptureMode(mode);
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
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Step 0: Reservation Form */}
        {activeStep === 0 && (
          <ReservationForm
            vehicleId={bookingFlow?.vehicleId}
            onSubmit={handleReservationSubmit}
            language={language}
          />
        )}

        {/* Step 1: ID Capture */}
        {activeStep === 1 && (
          <Box>
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Tabs
                value={captureMode}
                onChange={(_, value) => handleModeSwitch(value)}
                centered
              >
                <Tab
                  label={isArabic ? 'التقاط بالكاميرا' : 'Camera Capture'}
                  value="camera"
                />
                <Tab
                  label={isArabic ? 'إدخال يدوي' : 'Manual Entry'}
                  value="manual"
                />
              </Tabs>
            </Paper>

            {captureMode === 'camera' && (
              <CameraCapture
                onCapture={handleCameraCapture}
                side={capturingSide}
                language={language}
              />
            )}

            {captureMode === 'manual' && (
              <ManualEntryForm
                initialData={bookingFlow?.manualData || undefined}
                onSubmit={handleManualSubmit}
                language={language}
              />
            )}

            <Button onClick={handleBack} sx={{ mt: 2 }}>
              {isArabic ? 'رجوع' : 'Back'}
            </Button>
          </Box>
        )}

        {/* Step 2: OCR + Barcode Processing */}
        {activeStep === 2 && (
          <Box>
            {bookingFlow?.idFrontImage && !bookingFlow.ocrData && (
              <OCRProcessor
                imageData={bookingFlow.idFrontImage}
                onComplete={handleOCRComplete}
                language={language}
              />
            )}

            {bookingFlow?.idBackImage &&
              bookingFlow.ocrData &&
              !bookingFlow.barcodeData && (
                <Box sx={{ mt: 3 }}>
                  <BarcodeReader
                    imageData={bookingFlow.idBackImage}
                    ocrData={bookingFlow.ocrData}
                    onComplete={handleBarcodeComplete}
                    language={language}
                  />
                </Box>
              )}

            {bookingFlow?.ocrData && bookingFlow?.barcodeData && (
              <Box sx={{ mt: 3 }}>
                <Alert severity="success">
                  {isArabic
                    ? 'تم التحقق من البيانات بنجاح'
                    : 'Data verified successfully'}
                </Alert>

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button onClick={handleBack}>{isArabic ? 'رجوع' : 'Back'}</Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setActiveStep(3);
                      setCurrentStep(3);
                    }}
                  >
                    {isArabic ? 'متابعة' : 'Continue'}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Step 3: Confirmation */}
        {activeStep === 3 && (
          <Box>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {isArabic ? 'ملخص الحجز' : 'Booking Summary'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {isArabic ? 'التاريخ والوقت:' : 'Date & Time:'}
                  </Typography>
                  <Typography variant="body1">
                    {bookingFlow?.datetime}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {isArabic ? 'الاسم:' : 'Name:'}
                  </Typography>
                  <Typography variant="body1">
                    {bookingFlow?.manualData?.name ||
                      bookingFlow?.barcodeData?.name ||
                      bookingFlow?.ocrData?.name}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {isArabic ? 'الرقم القومي:' : 'National ID:'}
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {bookingFlow?.manualData?.nationalId ||
                      bookingFlow?.barcodeData?.nationalId ||
                      bookingFlow?.ocrData?.nationalId}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {isArabic ? 'تاريخ الميلاد:' : 'Birth Date:'}
                  </Typography>
                  <Typography variant="body1">
                    {bookingFlow?.manualData?.birthDate ||
                      bookingFlow?.barcodeData?.birthDate ||
                      bookingFlow?.ocrData?.birthDate}
                  </Typography>
                </Box>

                {bookingFlow?.manualData?.phone && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {isArabic ? 'رقم الهاتف:' : 'Phone:'}
                    </Typography>
                    <Typography variant="body1">
                      {bookingFlow.manualData.phone}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>

            <Alert severity="info" sx={{ mb: 3 }}>
              {isArabic
                ? 'يرجى مراجعة بياناتك قبل التأكيد. سيتم إرسال رسالة تأكيد إلى هاتفك.'
                : 'Please review your information before confirming. A confirmation message will be sent to your phone.'}
            </Alert>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button onClick={handleBack}>{isArabic ? 'رجوع' : 'Back'}</Button>
              <Button
                variant="contained"
                onClick={handleConfirm}
                disabled={submitting}
              >
                {submitting
                  ? isArabic
                    ? 'جاري التأكيد...'
                    : 'Confirming...'
                  : isArabic
                  ? 'تأكيد الحجز'
                  : 'Confirm Booking'}
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </>
  );
}
