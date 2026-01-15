'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import { useBookingWizardStore } from '@/stores/useBookingWizardStore';
import { createClient } from '@/lib/supabase';
import { getVehicleImage } from '@/lib/imageHelper';

interface Models {
  name: string;
  brands: { name: string };
  hero_image_url: string | null;
}

interface VehicleDataRaw {
  id: string;
  trim_name: string;
  model_year: number;
  models: Models | null;
}

interface VehicleData {
  id: string;
  model_name: string;
  brand_name: string;
  year: number;
  hero_image_url: string | null;
}

/**
 * Confirmation step (Step 3)
 * OTP verification and final booking creation
 */
export default function ConfirmStep() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { t } = useTranslation();

  // Use primitive selectors
  const vehicleId = useBookingWizardStore((s) => s.vehicleId);
  const appointment = useBookingWizardStore((s) => s.appointment);
  const documents = useBookingWizardStore((s) => s.documents);
  const customer = useBookingWizardStore((s) => s.customer);
  const setCustomer = useBookingWizardStore((s) => s.setCustomer);
  const otp = useBookingWizardStore((s) => s.otp);
  const setOtp = useBookingWizardStore((s) => s.setOtp);
  const booking = useBookingWizardStore((s) => s.booking);
  const setBooking = useBookingWizardStore((s) => s.setBooking);
  const reset = useBookingWizardStore((s) => s.reset);

  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Fetch vehicle data
  useEffect(() => {
    if (!vehicleId) return;

    const fetchVehicle = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('vehicle_trims')
          .select('id, trim_name, model_year, models(name, brands(name), hero_image_url)')
          .eq('id', vehicleId)
          .single() as { data: VehicleDataRaw | null; error: any };

        if (error) throw error;
        if (!data || !data.models) throw new Error('Vehicle not found');

        // Transform nested data to flat structure for component
        const vehicle = {
          id: data.id,
          model_name: data.models.name,
          brand_name: data.models.brands.name,
          year: data.model_year,
          hero_image_url: data.models.hero_image_url,
        };
        setVehicle(vehicle);
      } catch (err) {
        console.error('Failed to fetch vehicle:', err);
      }
    };

    fetchVehicle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // vehicleId shouldn't change during wizard session - fetch once on mount

  // Cooldown timer for OTP resend
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  /**
   * Send OTP to phone number
   */
  const handleSendOtp = async () => {
    if (!customer.phone || customer.phone.length < 10) {
      setError(t('booking.phoneRequired'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: customer.phone,
          subjectId: vehicleId || 'temp',
          subjectType: 'booking',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setOtp({ sent: true, expiresAt: result.expiresAt });
        setCooldown(60); // 60 second cooldown
      } else {
        setError(result.error || t('wizard.otpSendError'));
      }
    } catch (err) {
      console.error('OTP send error:', err);
      setError(t('wizard.otpSendError'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify OTP and create booking
   */
  const handleConfirmBooking = async () => {
    if (!otp.code || otp.code.length !== 6) {
      setError(t('wizard.otpLabel') + ' ' + t('common.error'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verify OTP
      const verifyResponse = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: customer.phone,
          code: otp.code,
          subjectId: vehicleId || 'temp',
        }),
      });

      const verifyResult = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyResult.valid) {
        const attempts = otp.attempts + 1;
        setOtp({ attempts });

        if (attempts >= 3) {
          setError(t('wizard.maxAttempts'));
        } else {
          setError(verifyResult.error || t('wizard.invalidOTP'));
        }
        return;
      }

      // OTP verified, create booking
      const supabase = createClient();
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          vehicle_id: vehicleId,
          appointment_date: appointment.date,
          appointment_time: appointment.time,
          venue: appointment.venue,
          customer_phone: customer.phone,
          customer_name: documents.extractedData.name || 'N/A',
          national_id: documents.extractedData.nationalIdNumber || 'N/A',
          status: 'confirmed',
        })
        .select('id')
        .single() as { data: { id: string } | null; error: any };

      if (bookingError) throw bookingError;
      if (!bookingData) throw new Error('Failed to create booking');

      // Success!
      setBooking({ id: bookingData.id, confirmed: true });
      setOtp({ verified: true });
    } catch (err) {
      console.error('Booking creation error:', err);
      setError(t('booking.error'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Return to catalog after successful booking
   */
  const handleDone = () => {
    reset();
    router.push(`/${locale}/catalog`);
  };

  // Success state - show reservation details
  if (booking.confirmed && booking.id) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          {t('wizard.successTitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('wizard.successDesc')}
        </Typography>

        <Card sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('wizard.reservationDetails')}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2">
              <strong>{t('wizard.bookingID')}:</strong> {booking.id}
            </Typography>
            <Typography variant="body2">
              <strong>{t('common.vehicle')}:</strong> {vehicle?.brand_name} {vehicle?.model_name}
            </Typography>
            <Typography variant="body2">
              <strong>{t('common.date')}:</strong> {appointment.date}
            </Typography>
            <Typography variant="body2">
              <strong>{t('common.time')}:</strong> {appointment.time}
            </Typography>
            <Typography variant="body2">
              <strong>{t('common.venue')}:</strong> {appointment.venue}
            </Typography>
          </CardContent>
        </Card>

        <Alert severity="success" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
          {t('wizard.smsSent', { phone: customer.phone })}
        </Alert>

        <Button variant="contained" size="large" onClick={handleDone}>
          {t('common.done')}
        </Button>
      </Box>
    );
  }

  // Main confirmation UI
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('wizard.confirmTitle')}
      </Typography>

      {/* Booking Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('wizard.bookingSummary')}
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            {/* Vehicle */}
            {vehicle && (
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 100, height: 75, objectFit: 'contain' }}
                    image={getVehicleImage(vehicle.hero_image_url)}
                    alt={`${vehicle.brand_name} ${vehicle.model_name}`}
                  />
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {vehicle.brand_name} {vehicle.model_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {vehicle.year}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}

            {/* Appointment */}
            <Grid item xs={12} md={6}>
              <Typography variant="body2">
                <strong>{t('common.date')}:</strong> {appointment.date}
              </Typography>
              <Typography variant="body2">
                <strong>{t('common.time')}:</strong> {appointment.time}
              </Typography>
              <Typography variant="body2">
                <strong>{t('common.venue')}:</strong> {appointment.venue}
              </Typography>
            </Grid>

            {/* Documents */}
            <Grid item xs={12}>
              <Typography variant="body2">
                <strong>{t('common.documents')}:</strong> {t('wizard.idLabel')} ✓, {t('wizard.licenseLabel')} ✓
              </Typography>
              {documents.extractedData.name && (
                <Typography variant="body2">
                  <strong>{t('wizard.nameLabel')}:</strong> {documents.extractedData.name}
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Phone Number & OTP */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('wizard.verifyPhone')}
          </Typography>

          <TextField
            fullWidth
            label={t('wizard.phoneLabel')}
            placeholder="+20 1234567890"
            value={customer.phone}
            onChange={(e) => setCustomer({ phone: e.target.value })}
            disabled={otp.sent}
            sx={{ mb: 2 }}
            helperText={t('wizard.phoneHelper')}
          />

          {!otp.sent && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSendOtp}
              disabled={loading || !customer.phone || cooldown > 0}
            >
              {loading ? <CircularProgress size={24} /> : t('wizard.sendOTP')}
            </Button>
          )}

          {otp.sent && !otp.verified && (
            <Box>
              <TextField
                fullWidth
                label={t('wizard.otpLabel')}
                placeholder={t('wizard.otpPlaceholder')}
                value={otp.code}
                onChange={(e) => setOtp({ code: e.target.value })}
                sx={{ mb: 2 }}
                inputProps={{ maxLength: 6 }}
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleConfirmBooking}
                disabled={loading || otp.code.length !== 6}
                sx={{ mb: 1 }}
              >
                {loading ? <CircularProgress size={24} /> : t('wizard.confirmBooking')}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={handleSendOtp}
                disabled={cooldown > 0 || loading}
              >
                {cooldown > 0 ? `${t('wizard.resendOTP')} (${cooldown}s)` : t('wizard.resendOTP')}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}