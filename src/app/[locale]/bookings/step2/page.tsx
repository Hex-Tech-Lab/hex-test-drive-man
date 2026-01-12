'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Deprecated: Old step-based booking flow
 * Redirects to new single-page wizard at /bookings/new
 */
export default function Step2Redirect() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  useEffect(() => {
    // Redirect to new wizard
    router.replace(`/${locale}/bookings/new`);
  }, [router, locale]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body1" color="text.secondary">
        {locale === 'ar'
          ? 'جاري التحويل إلى صفحة الحجز الجديدة...'
          : 'Redirecting to new booking page...'}
      </Typography>
    </Box>
  );
}
