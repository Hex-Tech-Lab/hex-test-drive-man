/**
 * Step 2: Vehicle & Date Selection
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
  TextField,
  Button,
  Alert,
  Paper,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { useLanguageStore } from '@/stores/language-store';
import { createClient } from '@/lib/supabase';

interface Vehicle {
  id: string;
  name_en: string;
  name_ar: string;
  brand_name_en: string;
  brand_name_ar: string;
}

/**
 * Step 2: Vehicle & Date Selection
 * User selects vehicle and preferred date/time
 * Creates draft booking and redirects to step3
 */
export default function BookingStep2Page() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params.locale as string) || 'en';
  const language = useLanguageStore((state) => state.language);
  const isArabic = language === 'ar';

  const sessionId = searchParams.get('sessionId');
  const phone = searchParams.get('phone');

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validate session
    if (!sessionId || !phone) {
      router.push(`/${locale}/bookings/step1`);
      return;
    }

    // Load vehicles
    loadVehicles();
  }, [sessionId, phone, locale, router]);

  const loadVehicles = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('vehicle_trims')
        .select(`
          id,
          name_en,
          name_ar,
          models!inner(
            brands!inner(
              name_en,
              name_ar
            )
          )
        `)
        .order('name_en');

      if (error) throw error;

      const formattedVehicles = data.map((v: any) => ({
        id: v.id,
        name_en: v.name_en,
        name_ar: v.name_ar,
        brand_name_en: v.models.brands.name_en,
        brand_name_ar: v.models.brands.name_ar,
      }));

      setVehicles(formattedVehicles);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
      setError(isArabic ? 'فشل تحميل المركبات' : 'Failed to load vehicles');
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!selectedVehicle || !selectedDate) {
        setError(isArabic ? 'يرجى اختيار المركبة والتاريخ' : 'Please select vehicle and date');
        setLoading(false);
        return;
      }

      // Create draft booking
      const response = await fetch('/api/bookings/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          phone,
          vehicleId: selectedVehicle.id,
          datetime: selectedDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create draft');
        setLoading(false);
        return;
      }

      // Redirect to step 3
      router.push(`/${locale}/bookings/step3?draftId=${data.draftId}`);
    } catch (error) {
      console.error('Draft creation failed:', error);
      setError(isArabic ? 'فشل إنشاء الحجز' : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (loadingVehicles) {
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

  return (
    <>
      <Header />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isArabic ? 'اختر المركبة والتاريخ' : 'Select Vehicle & Date'}
        </Typography>

        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          {isArabic ? `رقم الهاتف: ${phone}` : `Phone: ${phone}`}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={2} sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Autocomplete
              options={vehicles}
              getOptionLabel={(option) =>
                isArabic
                  ? `${option.brand_name_ar} ${option.name_ar}`
                  : `${option.brand_name_en} ${option.name_en}`
              }
              value={selectedVehicle}
              onChange={(_, newValue) => setSelectedVehicle(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={isArabic ? 'اختر المركبة' : 'Select Vehicle'}
                  required
                />
              )}
              sx={{ mb: 3 }}
              disabled={loading}
            />

            <TextField
              fullWidth
              type="datetime-local"
              label={isArabic ? 'التاريخ والوقت' : 'Date & Time'}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: new Date().toISOString().slice(0, 16),
              }}
              required
              disabled={loading}
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                onClick={() => router.push(`/${locale}/bookings/step1`)}
                disabled={loading}
              >
                {isArabic ? 'رجوع' : 'Back'}
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || !selectedVehicle || !selectedDate}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  isArabic ? 'متابعة' : 'Continue'
                )}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
