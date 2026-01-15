'use client';

import { useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useLanguageStore } from '@/stores/language-store';

interface FavoriteLoginModalProps {
  open: boolean;
  onClose: () => void;
  favoriteCount: number;
}

/**
 * Soft-gate modal for favorites feature (MVP 1.5 Phase 0)
 * Triggers when user has >2 favorites OR visits /saved route
 * UI only - no OTP backend implementation yet
 * 
 * @param props - Component props
 * @param props.open - Modal open state
 * @param props.onClose - Close handler
 * @param props.favoriteCount - Current number of favorites
 */
export default function FavoriteLoginModal({ open, onClose, favoriteCount }: FavoriteLoginModalProps) {
  const language = useLanguageStore((state) => state.language);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Placeholder for future OTP flow (MVP 1.5+)
  const handleContinue = useCallback(() => {
    console.log('OTP flow placeholder - auth not implemented yet');
    // TODO: Implement OTP flow when auth is ready
    onClose();
  }, [onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
        },
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={handleClose}
        sx={{
          position: 'absolute',
          right: language === 'ar' ? 'auto' : 8,
          left: language === 'ar' ? 8 : 'auto',
          top: 8,
          color: 'grey.500',
        }}
        aria-label={language === 'ar' ? 'إغلاق' : 'Close'}
      >
        <CloseIcon />
      </IconButton>

      {/* Header with Icon */}
      <DialogTitle sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <FavoriteIcon sx={{ fontSize: 64, color: 'error.main' }} />
        </Box>
        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
          {language === 'ar' ? 'احفظ سياراتك المفضلة' : 'Save Your Favorite Cars'}
        </Typography>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {language === 'ar'
            ? `لديك ${favoriteCount} سيارات في قائمة المفضلة. سجّل الدخول لحفظها والوصول إليها من أي جهاز.`
            : `You have ${favoriteCount} car${favoriteCount > 1 ? 's' : ''} in your favorites. Sign in to save them and access from any device.`}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {language === 'ar'
            ? 'سنرسل لك رمز التحقق عبر الرسائل القصيرة'
            : 'We\'ll send you a verification code via SMS'}
        </Typography>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          size="large"
          sx={{ minWidth: 120 }}
        >
          {language === 'ar' ? 'ليس الآن' : 'Not Now'}
        </Button>
        <Button
          onClick={handleContinue}
          variant="contained"
          size="large"
          sx={{ minWidth: 120 }}
        >
          {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
        </Button>
      </DialogActions>

      {/* Footer Note */}
      <Box sx={{ textAlign: 'center', pb: 2, px: 3 }}>
        <Typography variant="caption" color="text.secondary">
          {language === 'ar'
            ? 'ملاحظة: ميزة المصادقة قيد التطوير (MVP 1.5)'
            : 'Note: Authentication feature under development (MVP 1.5)'}
        </Typography>
      </Box>
    </Dialog>
  );
}
