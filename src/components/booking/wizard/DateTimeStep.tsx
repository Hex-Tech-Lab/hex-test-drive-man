'use client';

import { useEffect, useState } from 'react';
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
} from '@mui/material';
import { useBookingWizardStore } from '@/stores/useBookingWizardStore';
import { createClient } from '@/lib/supabase';
import { getVehicleImage } from '@/lib/imageHelper';

interface VehicleData {
  id: string;
  model_name: string;
  brand_name: string;
  year: number;
  hero_image_url: string | null;
}

/**
 * Date/Time/Venue selection step (Step 1)
 * Vehicle is inherited from URL query param (readonly display)
 */
export default function DateTimeStep() {
  // Use primitive selectors
  const vehicleId = useBookingWizardStore((s) => s.vehicleId);
  const appointment = useBookingWizardStore((s) => s.appointment);
  const setAppointment = useBookingWizardStore((s) => s.setAppointment);

  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch vehicle data on mount
  useEffect(() => {
    if (!vehicleId) {
      setError('No vehicle selected. Please select a vehicle from the catalog.');
      setLoading(false);
      return;
    }

    const fetchVehicle = async () => {
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from('vehicle_trims')
          .select('id, trim_name, model_year, models(name, brands(name), hero_image_url)')
          .eq('id', vehicleId)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Vehicle not found');

        // Transform nested data to flat structure for component
        const vehicle: VehicleData = {
          id: data.id as string,
          model_name: (data.models as any)?.name || 'Unknown Model',
          brand_name: ((data.models as any)?.brands as any)?.name || 'Unknown Brand',
          year: data.model_year as number,
          hero_image_url: ((data.models as any)?.hero_image_url as string | null) || null,
        };

        setVehicle(vehicle);
      } catch (err) {
        console.error('Failed to fetch vehicle:', err);
        setError('Failed to load vehicle details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // vehicleId shouldn't change during wizard session - fetch once on mount

  // Time slots (example - could come from API)
  const timeSlots = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  // Venues (example - could come from API)
  const venues = [
    'Cairo Showroom',
    'Alexandria Showroom',
    'Giza Showroom',
    'Zamalek Showroom',
  ];

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !vehicle) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error || 'Vehicle not found'}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Schedule Your Test Drive
      </Typography>

      {/* Vehicle Display (readonly, inherited from catalog) */}
      <Card sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <CardMedia
          component="img"
          sx={{ width: 200, height: 150, objectFit: 'contain' }}
          image={getVehicleImage(vehicle.hero_image_url)}
          alt={`${vehicle.brand_name} ${vehicle.model_name}`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/placeholder-vehicle.png';
          }}
        />
        <CardContent>
          <Typography variant="h6">
            {vehicle.brand_name} {vehicle.model_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {vehicle.year}
          </Typography>
        </CardContent>
      </Card>

      {/* Date Picker */}
      <TextField
        fullWidth
        type="date"
        label="Select Date"
        value={appointment.date}
        onChange={(e) => setAppointment({ date: e.target.value })}
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: minDate }}
        sx={{ mb: 2 }}
        required
      />

      {/* Time Slot Dropdown */}
      <TextField
        fullWidth
        select
        label="Select Time"
        value={appointment.time}
        onChange={(e) => setAppointment({ time: e.target.value })}
        sx={{ mb: 2 }}
        required
      >
        {timeSlots.map((slot) => (
          <MenuItem key={slot} value={slot}>
            {slot}
          </MenuItem>
        ))}
      </TextField>

      {/* Venue Dropdown */}
      <TextField
        fullWidth
        select
        label="Select Venue"
        value={appointment.venue}
        onChange={(e) => setAppointment({ venue: e.target.value })}
        sx={{ mb: 2 }}
        required
      >
        {venues.map((venue) => (
          <MenuItem key={venue} value={venue}>
            {venue}
          </MenuItem>
        ))}
      </TextField>

      <Alert severity="info" sx={{ mt: 2 }}>
        Please arrive 10 minutes before your scheduled time. Bring a valid
        driver&apos;s license and national ID.
      </Alert>
    </Box>
  );
}
