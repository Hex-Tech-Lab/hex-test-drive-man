'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import Header from '@/components/Header';
import { SkeletonTable } from '@/components/skeletons';
import BookingQRCode from '@/components/booking/BookingQRCode';
import { useLanguageStore } from '@/stores/language-store';
import { useRouter, useParams } from 'next/navigation';
import type { Reservation } from '@/types/reservation';

/**
 * Bookings list page showing user's test drive bookings
 * MVP 1.5: Shows QR codes for confirmed bookings
 */
export default function BookingsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const language = useLanguageStore((state) => state.language);
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isArabic = language === 'ar';

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('/api/reservations');
        if (!response.ok) throw new Error('Failed to fetch reservations');
        
        const data = await response.json();
        setReservations(data.reservations || []);
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError(isArabic ? 'فشل تحميل الحجوزات' : 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [isArabic]);

  const handleNewBooking = () => {
    router.push(`/${locale}/bookings/new`);
  };

  const handleCancelBooking = async (id: string) => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (!response.ok) throw new Error('Failed to cancel');

      // Refresh list
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r))
      );
    } catch (err) {
      console.error('Cancel error:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    if (isArabic) {
      switch (status) {
        case 'confirmed': return 'مؤكد';
        case 'pending': return 'قيد الانتظار';
        case 'cancelled': return 'ملغي';
        case 'completed': return 'مكتمل';
        default: return status;
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {isArabic ? 'حجوزاتي' : 'My Bookings'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewBooking}
          >
            {isArabic ? 'حجز جديد' : 'New Booking'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <SkeletonTable rows={5} />
        ) : reservations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              {isArabic ? 'لا توجد حجوزات بعد' : 'No bookings yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {isArabic 
                ? 'ابدأ بحجز أول تجربة قيادة لك' 
                : 'Start by booking your first test drive'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNewBooking}
              sx={{ mt: 3 }}
            >
              {isArabic ? 'احجز الآن' : 'Book Now'}
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {reservations.map((reservation) => (
              <Grid item xs={12} md={6} key={reservation.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Chip
                        label={getStatusLabel(reservation.status)}
                        color={getStatusColor(reservation.status)}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(reservation.reservation_datetime).toLocaleDateString()}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EventIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {new Date(reservation.reservation_datetime).toLocaleString()}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <DirectionsCarIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {isArabic ? 'معرف السيارة:' : 'Vehicle ID:'} {reservation.vehicle_id.slice(0, 8)}
                      </Typography>
                    </Box>

                    {reservation.status === 'confirmed' && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <BookingQRCode reservation={reservation} size={150} />
                      </Box>
                    )}
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => router.push(`/${locale}/bookings/${reservation.id}/confirmed`)}
                    >
                      {isArabic ? 'عرض التفاصيل' : 'View Details'}
                    </Button>
                    {reservation.status === 'pending' && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleCancelBooking(reservation.id)}
                      >
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
}
