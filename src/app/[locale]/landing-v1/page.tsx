'use client';

import { Box, Container, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useLanguageStore } from '@/stores/language-store';

/**
 * Landing Page V1 - Original Design
 * Created: 2025-12-XX (extracted from bb-grok-land-015d56 branch)
 * Style: Grok-inspired design with hero section
 */
export default function LandingV1() {
  const router = useRouter();
  const language = useLanguageStore((state) => state.language);

  const handleGetStarted = () => {
    router.push(`/${language}`);
  };

  return (
    <>
      <Header />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          pt: 8,
        }}
      >
        {/* Hero Section */}
        <Container maxWidth="lg">
          <Box
            sx={{
              textAlign: 'center',
              color: 'white',
              py: 8,
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 700,
                mb: 3,
              }}
            >
              {language === 'ar' ? 'اختبر قيادة سيارتك المثالية' : 'Test Drive Your Dream Car'}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                mb: 5,
                opacity: 0.9,
              }}
            >
              {language === 'ar'
                ? 'اكتشف أكثر من 400 سيارة واحجز تجربة قيادة في دقائق'
                : 'Discover 400+ vehicles and book your test drive in minutes'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
            </Button>
          </Box>

          {/* Features Grid */}
          <Grid container spacing={4} sx={{ mt: 4, pb: 8 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <CardContent>
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    🚗
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {language === 'ar' ? 'كتالوج شامل' : 'Comprehensive Catalog'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {language === 'ar'
                      ? 'تصفح أكثر من 400 سيارة من 95 علامة تجارية'
                      : 'Browse 400+ vehicles from 95 brands'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <CardContent>
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    ⚡
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {language === 'ar' ? 'حجز سريع' : 'Quick Booking'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {language === 'ar'
                      ? 'احجز تجربة قيادتك في أقل من دقيقتين'
                      : 'Book your test drive in under 2 minutes'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <CardContent>
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    🔍
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {language === 'ar' ? 'مقارنة ذكية' : 'Smart Comparison'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {language === 'ar'
                      ? 'قارن حتى 3 سيارات جنبًا إلى جنب'
                      : 'Compare up to 3 vehicles side-by-side'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

        {/* Version Badge */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 2,
            fontSize: '0.875rem',
          }}
        >
          Landing V1 (Grok-inspired)
        </Box>
      </Box>
    </>
  );
}
