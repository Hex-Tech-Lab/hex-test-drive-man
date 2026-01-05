'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { requestBookingOtp } from '@/actions/bookingActions';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
} from '@mui/material';

export default function NewBooking() {
  const [vehicleId, setVehicleId] = useState('');
  const [date, setDate] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  async function createBooking() {
    setLoading(true);
    const user = (await supabase.auth.getUser()).data.user;
    
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        vehicle_id: vehicleId,
        test_drive_date: date,
        test_drive_location: 'Cairo Showroom',
        user_id: user?.id,
        phone_number: phone // Add this field to schema later
      })
      .select()
      .single();

    if (data) {
      await requestBookingOtp({ phone, subjectId: data.id });
      // Redirect to /bookings/[id]/verify
      window.location.href = `/en/bookings/${data.id}/verify?phone=${phone}`;
    }
    setLoading(false);
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Book Test Drive
        </Typography>
        
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            createBooking();
          }}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Vehicle ID"
            type="text"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            required
            fullWidth
            sx={{
              '& .MuiInputBase-root': {
                minHeight: { xs: 48, md: 56 },
              },
            }}
          />
          
          <TextField
            label="Test Drive Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: new Date().toISOString().split('T')[0],
            }}
            sx={{
              '& .MuiInputBase-root': {
                minHeight: { xs: 48, md: 56 },
              },
            }}
          />
          
          <TextField
            label="Phone Number"
            type="tel"
            placeholder="+20..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            fullWidth
            sx={{
              '& .MuiInputBase-root': {
                minHeight: { xs: 48, md: 56 },
              },
            }}
          />
          
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            fullWidth
            sx={{
              minHeight: { xs: 48, md: 56 },
              mt: 2,
            }}
          >
            {loading && <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />}
            {loading ? 'Creating...' : 'Book Test Drive'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
