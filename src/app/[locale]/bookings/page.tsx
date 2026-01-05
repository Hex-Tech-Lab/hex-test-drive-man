'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EventNoteIcon from '@mui/icons-material/EventNote';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import { SkeletonTable } from '@/components/skeletons';
import { useLanguageStore } from '@/stores/language-store';
import { useRouter, useParams } from 'next/navigation';

/**
 * Bookings list page showing user's test drive bookings
 * Demonstrates SkeletonTable loading state
 */
export default function BookingsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const language = useLanguageStore((state) => state.language);
  const [loading, setLoading] = useState(true);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleNewBooking = () => {
    router.push(`/${locale}/bookings/new`);
  };

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {language === 'ar' ? 'حجوزاتي' : 'My Bookings'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewBooking}
          >
            {language === 'ar' ? 'حجز جديد' : 'New Booking'}
          </Button>
        </Box>

        {loading ? (
          <SkeletonTable rows={5} />
        ) : (
          <EmptyState
            icon={<EventNoteIcon />}
            title={language === 'ar' ? 'لا توجد حجوزات بعد' : 'No bookings yet'}
            description={
              language === 'ar'
                ? 'ابدأ بحجز أول تجربة قيادة لك واستكشف المركبات المتاحة'
                : 'Start by booking your first test drive and explore available vehicles'
            }
            actionLabel={language === 'ar' ? 'تصفح المركبات' : 'Browse Vehicles'}
            onAction={() => router.push(`/${locale}`)}
            secondaryActionLabel={language === 'ar' ? 'احجز الآن' : 'Book Now'}
            onSecondaryAction={handleNewBooking}
          />
        )}
      </Container>
    </>
  );
}
