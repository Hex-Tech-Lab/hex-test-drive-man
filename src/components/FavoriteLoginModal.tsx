'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useLanguageStore } from '@/stores/language-store';
import { useFavoriteStore } from '@/stores/useFavoriteStore';

interface FavoriteLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Soft-gate modal for favorites feature
 * Triggers when user tries to add 3rd favorite or accesses /saved route
 * UI-only OTP flow (no backend integration in Phase 0)
 */
export default function FavoriteLoginModal({ open, onClose, onSuccess }: FavoriteLoginModalProps) {
  const language = useLanguageStore((state) => state.language);
  const setAuthenticated = useFavoriteStore((state) => state.setAuthenticated);

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = useCallback(() => {
    // Validate Egyptian phone number (11 digits starting with 01)
    const phoneRegex = /^01[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      setError(
        language === 'ar'
          ? 'رقم الهاتف غير صحيح. يجب أن يبدأ بـ 01 ويتكون من 11 رقم'
          : 'Invalid phone number. Must start with 01 and be 11 digits'
      );
      return;
    }

    setError('');
    setLoading(true);

    // Simulate OTP sending
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 500);
  }, [phone, language]);

  const handleOtpChange = useCallback((index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  }, [otp]);

  const handleOtpSubmit = useCallback(() => {
    const otpValue = otp.join('');
    
    // Validate OTP (6 digits)
    if (otpValue.length !== 6) {
      setError(
        language === 'ar'
          ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام'
          : 'Please enter the 6-digit verification code'
      );
      return;
    }

    setError('');
    setLoading(true);

    // Mock OTP verification (accept any 6 digits)
    setTimeout(() => {
      setLoading(false);
      setAuthenticated(true);
      onSuccess?.();
      handleClose();
    }, 500);
  }, [otp, language, setAuthenticated, onSuccess]);

  const handleClose = useCallback(() => {
    setStep('phone');
    setPhone('');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setLoading(false);
    onClose();
  }, [onClose]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  }, []);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FavoriteIcon color="primary" />
        <Typography variant="h6">
          {language === 'ar' ? 'احفظ سياراتك المفضلة' : 'Save Your Favorite Cars'}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {step === 'phone' ? (
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" gutterBottom>
              {language === 'ar'
                ? 'أدخل رقم هاتفك لحفظ سياراتك المفضلة والوصول إليها من أي جهاز'
                : 'Enter your phone number to save your favorite cars and access them from any device'}
            </Typography>

            <TextField
              fullWidth
              label={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handlePhoneSubmit)}
              placeholder="01XXXXXXXXX"
              sx={{ mt: 3 }}
              autoFocus
              disabled={loading}
              inputProps={{
                maxLength: 11,
                inputMode: 'numeric',
                pattern: '[0-9]*',
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        ) : (
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" gutterBottom>
              {language === 'ar'
                ? `تم إرسال رمز التحقق إلى ${phone}`
                : `Verification code sent to ${phone}`}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mt: 3, justifyContent: 'center' }}>
              {otp.map((digit, index) => (
                <TextField
                  key={index}
                  id={`otp-${index}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && index === 5) {
                      handleOtpSubmit();
                    }
                  }}
                  disabled={loading}
                  inputProps={{
                    maxLength: 1,
                    style: { textAlign: 'center', fontSize: '1.5rem' },
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                  }}
                  sx={{ width: 50 }}
                />
              ))}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              variant="text"
              size="small"
              onClick={() => setStep('phone')}
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {language === 'ar' ? 'تغيير رقم الهاتف' : 'Change phone number'}
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {language === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button
          onClick={step === 'phone' ? handlePhoneSubmit : handleOtpSubmit}
          variant="contained"
          disabled={loading || (step === 'phone' ? !phone : otp.some((d) => !d))}
        >
          {loading
            ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...')
            : step === 'phone'
            ? (language === 'ar' ? 'إرسال الرمز' : 'Send Code')
            : (language === 'ar' ? 'تحقق' : 'Verify')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
