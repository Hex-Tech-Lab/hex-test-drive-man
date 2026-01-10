/**
 * Step 1: Phone Number + OTP Verification
 * MVP 1.6 - 3-Step Booking Flow
 * Created: 2026-01-10
 * Agent: BB
 */

'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import { useLanguageStore } from '@/stores/language-store';
import { smsService } from '@/services/SmsService';

/**
 * Step 1: Phone Number + OTP Verification
 * User enters phone, receives OTP, verifies code
 * On success: redirect to step2 with sessionId
 */
export default function BookingStep1Page() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const language = useLanguageStore((state) => state.language);
  const isArabic = language === 'ar';

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate phone format
      if (!phone.trim()) {
        setError(isArabic ? 'يرجى إدخال رقم الهاتف' : 'Please enter phone number');
        setLoading(false);
        return;
      }

      // Generate temporary session ID
      const tempId = crypto.randomUUID();
      
      // Request OTP via API
      const result = await smsService.sendOtp(phone.trim(), tempId, 'booking');

      if (!result.success) {
        setError(result.error || 'Failed to send OTP');
        setLoading(false);
        return;
      }

      setSessionId(tempId);
      setExpiresAt(result.expiresAt || null);
      setStep('otp');
    } catch (error) {
      console.error('OTP request failed:', error);
      setError(isArabic ? 'فشل إرسال رمز التحقق' : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!sessionId || otp.length !== 6) return;

    setError(null);
    setLoading(true);

    try {
      const result = await smsService.verifyOtp(phone.trim(), otp, sessionId);

      if (!result.valid) {
        setError(result.error || 'Invalid OTP');
        setLoading(false);
        return;
      }

      // Success - redirect to step 2
      router.push(`/${locale}/bookings/step2?sessionId=${sessionId}&phone=${encodeURIComponent(phone)}`);
    } catch (error) {
      console.error('OTP verification failed:', error);
      setError(isArabic ? 'فشل التحقق من الرمز' : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!sessionId) return;

    setError(null);
    setLoading(true);

    try {
      const result = await smsService.resendOtp(phone.trim(), sessionId);

      if (!result.success) {
        setError(result.error || 'Failed to resend OTP');
        setLoading(false);
        return;
      }

      setExpiresAt(result.expiresAt || null);
    } catch (error) {
      console.error('OTP resend failed:', error);
      setError(isArabic ? 'فشل إعادة إرسال الرمز' : 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isArabic ? 'حجز تجربة قيادة' : 'Book Test Drive'}
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
          {isArabic
            ? 'أدخل رقم هاتفك للبدء'
            : 'Enter your phone number to begin'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={2} sx={{ p: 3 }}>
          {step === 'phone' && (
            <Box component="form" onSubmit={handleSendOtp}>
              <TextField
                fullWidth
                label={isArabic ? 'رقم الهاتف' : 'Phone Number'}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 1XX XXX XXXX"
                disabled={loading}
                sx={{ mb: 3 }}
                helperText={isArabic ? 'أدخل رقم هاتفك المصري' : 'Enter your Egyptian phone number'}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || !phone.trim()}
                sx={{ py: 1.5 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  isArabic ? 'إرسال رمز التحقق' : 'Send Verification Code'
                )}
              </Button>
            </Box>
          )}

          {step === 'otp' && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                {isArabic
                  ? `تم إرسال رمز التحقق إلى ${phone}`
                  : `Verification code sent to ${phone}`}
              </Alert>

              <TextField
                fullWidth
                label={isArabic ? 'رمز التحقق' : 'Verification Code'}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
                disabled={loading}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  fullWidth
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    isArabic ? 'تحقق' : 'Verify'
                  )}
                </Button>
                <Button
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  {isArabic ? 'إعادة إرسال' : 'Resend'}
                </Button>
              </Box>

              <Button
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError(null);
                }}
                size="small"
              >
                {isArabic ? 'تغيير رقم الهاتف' : 'Change Phone Number'}
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
}
