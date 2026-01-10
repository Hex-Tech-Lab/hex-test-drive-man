/**
 * Step 3: Booking Confirmation
 * MVP 1.6 - 3-Step Booking Flow
 * Created: 2026-01-10
 * Agent: BB
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  Paper,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { useLanguageStore } from '@/stores/language-store';
import { CheckCircle } from '@mui/icons-material';

interface DraftBooking {
  id: string;
  phone: string;
  vehicleId: string;
  vehicleName: string;
  datetime: string;
}

/**
 * Step 3: Booking Confirmation
 * Display summary and confirm booking
 * On success: show confirmation message
 */
export default function BookingStep3Page() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params.locale as string) || 'en';
  const language = useLanguageStore((state) => state.language);
  const isArabic = language === 'ar';

  const draftId = searchParams.get('draftId');

  const [draft, setDraft] = useState<DraftBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!draftId) {
      router.push(`/${locale}/bookings/step1`);
      return;
    }

    loadDraft();
  }, [draftId, locale, router]);

  const loadDraft = async () => {
    try {
      const response = await fetch(`/api/bookings/draft/${draftId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Draft not found');
        setLoading(false);
        return;
      }

      setDraft(data.draft);
    } catch (error) {
      console.error('Failed to load draft:', error);
      setError(isArabic ? 'فشل تحميل الحجز' : 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!draftId) return;

    setError(null);
    setConfirming(true);

    try {
      const response = await fetch(`/api/bookings/${draftId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to confirm booking');
        setConfirming(false);
        return;
      }

      setConfirmed(true);
    } catch (error) {
      console.error('Confirmation failed:', error);
      setError(isArabic ? 'فشل تأكيد الحجز' : 'Failed to confirm booking');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>
            {isArabic ? 'جاري التحميل...' : 'Loading...'}
          </Typography>
        </Container>
      </>
    );
  }

  if (confirmed) {
    return (
      <>
        <Header />
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              {isArabic ? 'تم تأكيد الحجز!' : 'Booking Confirmed!'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {isArabic
                ? 'سيتم التواصل معك قريباً لتأكيد موعد تجربة القيادة'
                : 'We will contact you soon to confirm your test drive appointment'}
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push(`/${locale}`)}
            >
              {isArabic ? 'العودة للرئيسية' : 'Back to Home'}
            </Button>
          </Paper>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isArabic ? 'تأكيد الحجز' : 'Confirm Booking'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {draft && (
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {isArabic ? 'ملخص الحجز' : 'Booking Summary'}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {isArabic ? 'رقم الهاتف' : 'Phone Number'}
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {draft.phone}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {isArabic ? 'المركبة' : 'Vehicle'}
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {draft.vehicleName}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {isArabic ? 'التاريخ والوقت' : 'Date & Time'}
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {new Date(draft.datetime).toLocaleString(isArabic ? 'ar-EG' : 'en-US', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                })}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                onClick={() => router.push(`/${locale}/bookings/step2?sessionId=${draftId}&phone=${draft.phone}`)}
                disabled={confirming}
              >
                {isArabic ? 'رجوع' : 'Back'}
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirm}
                disabled={confirming}
                fullWidth
              >
                {confirming ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  isArabic ? 'تأكيد الحجز' : 'Confirm Booking'
                )}
              </Button>
            </Box>
          </Paper>
        )}
      </Container>
    </>
  );
}
