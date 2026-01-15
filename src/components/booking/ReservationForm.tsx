// Reservation form with date/time slots and vehicle selector
// Created: 2026-01-07
// Agent: BB
// MVP 1.5: Booking System

'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import type { TimeSlot } from '@/types/reservation';

interface ReservationFormProps {
  vehicleId?: string;
  onSubmit: (data: {
    vehicleId: string;
    datetime: string;
  }) => void;
  language?: 'en' | 'ar';
}

/**
 * Reservation form component
 * Features: date picker, time slots (9AM-6PM, 1hr blocks), vehicle selector
 * Validates: no double-booking same vehicle/time
 */
export default function ReservationForm({
  vehicleId: initialVehicleId,
  onSubmit,
  language = 'en',
}: ReservationFormProps) {
  const [vehicleId, setVehicleId] = useState(initialVehicleId || '');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Array<{ id: string; name: string }>>([]);

  const isArabic = language === 'ar';

  // Fetch available vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles');
        if (!response.ok) throw new Error('Failed to fetch vehicles');
        const data = await response.json();
        setVehicles(data.vehicles || []);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
      }
    };

    fetchVehicles();
  }, []);

  // Fetch available time slots when date or vehicle changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!vehicleId || !selectedDate) {
        setTimeSlots([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const response = await fetch(
          `/api/reservations/availability?vehicleId=${vehicleId}&date=${dateStr}`,
        );

        if (!response.ok) throw new Error('Failed to fetch availability');

        const data = await response.json();
        setTimeSlots(data.slots || []);
      } catch (err) {
        console.error('Error fetching time slots:', err);
        setError(
          isArabic
            ? 'فشل تحميل الأوقات المتاحة'
            : 'Failed to load available time slots',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, [vehicleId, selectedDate, isArabic]);

  const handleSubmit = () => {
    if (!vehicleId || !selectedDate || !selectedTime) {
      setError(
        isArabic
          ? 'يرجى ملء جميع الحقول'
          : 'Please fill all fields',
      );
      return;
    }

    // Combine date and time into ISO datetime
    const datetime = `${selectedDate.toISOString().split('T')[0]}T${selectedTime}:00Z`;

    onSubmit({
      vehicleId,
      datetime,
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {isArabic ? 'حجز موعد تجربة القيادة' : 'Book Test Drive Appointment'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Vehicle Selector */}
        {!initialVehicleId && (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>
              {isArabic ? 'اختر السيارة' : 'Select Vehicle'}
            </InputLabel>
            <Select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              label={isArabic ? 'اختر السيارة' : 'Select Vehicle'}
              startAdornment={<DirectionsCarIcon sx={{ mr: 1, color: 'action.active' }} />}
            >
              {vehicles.map((vehicle) => (
                <MenuItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Date Picker */}
        <DatePicker
          label={isArabic ? 'اختر التاريخ' : 'Select Date'}
          value={selectedDate}
          onChange={(newDate) => {
            setSelectedDate(newDate);
            setSelectedTime(''); // Reset time when date changes
          }}
          minDate={new Date()}
          slotProps={{
            textField: {
              fullWidth: true,
              sx: { mb: 3 },
              InputProps: {
                startAdornment: <EventIcon sx={{ mr: 1, color: 'action.active' }} />,
              },
            },
          }}
        />

        {/* Time Slots */}
        {selectedDate && vehicleId && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon sx={{ mr: 1, fontSize: 20 }} />
              {isArabic ? 'اختر الوقت' : 'Select Time'}
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={1}>
                {timeSlots.map((slot) => (
                  <Grid item xs={6} sm={4} md={3} key={slot.time}>
                    <Chip
                      label={slot.time}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      color={selectedTime === slot.time ? 'primary' : 'default'}
                      disabled={!slot.available}
                      sx={{
                        width: '100%',
                        cursor: slot.available ? 'pointer' : 'not-allowed',
                        opacity: slot.available ? 1 : 0.5,
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {timeSlots.length === 0 && !loading && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                {isArabic
                  ? 'لا توجد أوقات متاحة لهذا اليوم'
                  : 'No available time slots for this date'}
              </Typography>
            )}
          </Box>
        )}

        {/* Submit Button */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleSubmit}
          disabled={!vehicleId || !selectedDate || !selectedTime}
        >
          {isArabic ? 'متابعة' : 'Continue'}
        </Button>
      </Paper>
    </LocalizationProvider>
  );
}
