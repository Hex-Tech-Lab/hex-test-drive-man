'use client';

import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useLanguageStore } from '@/stores/language-store';
import Image from 'next/image';

/**
 * Landing Page V2 - Hero Redesign
 * Created: 2025-12-XX (extracted from bb-landing-h-cefe4a branch)
 * Style: Enhanced hero section with image background
 */
export default function LandingV2() {
  const router = useRouter();
  const language = useLanguageStore((state) => state.language);

  const handleGetStarted = () => {
    router.push(`/${language}`);
  };

  return (
    <>
      <Header />
      <Box sx={{ minHeight: '100vh' }}>
        {/* Hero Section with Background */}
        <Box
          sx={{
            position: 'relative',
            height: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
              zIndex: 1,
            },
          }}
        >
          <Container
            maxWidth="lg"
            sx={{
              position: 'relative',
              zIndex: 2,
              textAlign: 'center',
              color: 'white',
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '3rem', md: '5rem' },
                fontWeight: 800,
                mb: 3,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              {language === 'ar' ? 'تجربة قيادة استثنائية' : 'Exceptional Test Drive Experience'}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: '1.5rem', md: '2rem' },
                mb: 5,
                fontWeight: 300,
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              {language === 'ar'
                ? 'اكتشف، قارن، واحجز سيارتك المثالية'
                : 'Discover, Compare, and Book Your Perfect Car'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 8,
                py: 2.5,
                fontSize: '1.3rem',
                fontWeight: 700,
                borderRadius: 3,
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                '&:hover': {
                  bgcolor: 'grey.100',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {language === 'ar' ? 'استكشف الآن' : 'Explore Now'}
            </Button>
          </Container>
        </Box>

        {/* Stats Section */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                  400+
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {language === 'ar' ? 'سيارة' : 'Vehicles'}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={3}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                  95
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {language === 'ar' ? 'علامة تجارية' : 'Brands'}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={3}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                  20
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {language === 'ar' ? 'وكيل' : 'Agents'}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={3}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                  2
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {language === 'ar' ? 'دقيقة' : 'Minutes'}
                </Typography>
              </Paper>
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
          Landing V2 (Hero Redesign)
        </Box>
      </Box>
    </>
  );
}
