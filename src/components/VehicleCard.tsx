'use client';

import { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Vehicle } from '@/types/vehicle';
import { useCompareStore } from '@/stores/compare-store';
import { useLanguageStore } from '@/stores/language-store';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const language = useLanguageStore((state) => state.language);
  const { compareItems, addToCompare, removeFromCompare } = useCompareStore();

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    preferredDate: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Date calculation for min attribute (Local time)
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const minPreferredDate = `${year}-${month}-${day}`;

  const isInCompare = compareItems.some((item) => item.id === vehicle.id);
  const canAddMore = compareItems.length < 3;

  const handleCompareToggle = () => {
    if (isInCompare) {
      removeFromCompare(vehicle.id);
    } else if (canAddMore) {
      addToCompare(vehicle);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US').format(price);
  };

  const handleBookingModalOpen = () => {
    setBookingModalOpen(true);
    setFormData({ name: '', phone: '', preferredDate: '', notes: '' });
    setFormErrors({});
  };

  const handleBookingModalClose = () => {
    setBookingModalOpen(false);
    setFormData({ name: '', phone: '', preferredDate: '', notes: '' });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = language === 'ar' ? 'الاسم مطلوب' : 'Name is required';
    }

    if (!formData.phone.trim()) {
      errors.phone = language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    }

    if (!formData.preferredDate) {
      errors.preferredDate = language === 'ar' ? 'التاريخ المفضل مطلوب' : 'Preferred date is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitBooking = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          preferredDate: formData.preferredDate,
          vehicleId: vehicle.id,
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit booking');
      }

      await response.json();

      setSnackbar({
        open: true,
        message:
          language === 'ar'
            ? 'تم إرسال الحجز بنجاح!'
            : 'Booking submitted successfully!',
        severity: 'success',
      });

      handleBookingModalClose();
    } catch (error) {
      console.error('Error submitting booking:', error);
      setSnackbar({
        open: true,
        message:
          language === 'ar'
            ? 'فشل إرسال الحجز. يرجى المحاولة مرة أخرى.'
            : 'Failed to submit booking. Please try again.',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <IconButton
        onClick={handleCompareToggle}
        disabled={!isInCompare && !canAddMore}
        sx={{
          position: 'absolute',
          top: 8,
          right: language === 'ar' ? 'auto' : 8,
          left: language === 'ar' ? 8 : 'auto',
          zIndex: 1,
          bgcolor: 'background.paper',
          '&:hover': { bgcolor: 'background.paper' },
        }}
      >
        {isInCompare ? <CheckCircleIcon color="primary" /> : <CompareArrowsIcon />}
      </IconButton>

      <CardMedia
        component="img"
        height="200"
        image={vehicle.models.hero_image_url || 'https://via.placeholder.com/800x600?text=No+Image'}
        alt={`${vehicle.models.brands.name} ${vehicle.models.name}`}
        sx={{ objectFit: 'cover' }}
      />

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          {vehicle.models.brands.name} {vehicle.models.name}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {vehicle.model_year} • {vehicle.trim_name} • {vehicle.categories.name}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
          <Chip label={vehicle.fuel_types.name} size="small" variant="outlined" />
          <Chip
            label={vehicle.transmissions.name}
            size="small"
            variant="outlined"
          />
          {vehicle.seats && (
            <Chip
              label={`${vehicle.seats} ${language === 'ar' ? 'مقاعد' : 'seats'}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        <Typography variant="h5" color="primary" sx={{ mt: 'auto', fontWeight: 600 }}>
          {formatPrice(vehicle.price_egp)} {language === 'ar' ? 'ج.م' : 'EGP'}
        </Typography>

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleBookingModalOpen}
        >
          {language === 'ar' ? 'احجز تجربة قيادة' : 'Book Test Drive'}
        </Button>
      </CardContent>

      {/* Booking Modal */}
      <Dialog
        open={bookingModalOpen}
        onClose={handleBookingModalClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {language === 'ar' ? 'احجز تجربة قيادة' : 'Book Test Drive'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {vehicle.models.brands.name} {vehicle.models.name} {vehicle.model_year}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              {vehicle.trim_name}
            </Typography>

            <TextField
              fullWidth
              label={language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              error={!!formErrors.name}
              helperText={formErrors.name}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label={language === 'ar' ? 'التاريخ المفضل' : 'Preferred Date'}
              type="date"
              value={formData.preferredDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, preferredDate: e.target.value }))}
              error={!!formErrors.preferredDate}
              helperText={formErrors.preferredDate}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: minPreferredDate,
              }}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label={language === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBookingModalClose} disabled={submitting}>
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSubmitBooking}
            variant="contained"
            disabled={submitting}
          >
            {submitting
              ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...')
              : (language === 'ar' ? 'إرسال الحجز' : 'Submit Booking')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
}