'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  alpha,
  useTheme,
} from '@mui/material';
import { Search, CompareArrows, EventAvailable, ArrowForward } from '@mui/icons-material';
import Header from '@/components/Header';
import { useLanguageStore } from '@/stores/language-store';
import Image from 'next/image';

/**
 * Landing Page V2 - Hero Redesign
 * Features: Large hero image, minimal design, focus on imagery
 */
export default function LandingV2() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    }
    setMounted(true);
  }, [locale, setLanguage]);

  const steps = [
    {
      icon: <Search sx={{ fontSize: 56 }} />,
      title: language === 'ar' ? 'ابحث' : 'Search',
      description:
        language === 'ar'
          ? 'تصفح كتالوجنا الشامل للسيارات'
          : 'Browse our comprehensive vehicle catalog',
    },
    {
      icon: <CompareArrows sx={{ fontSize: 56 }} />,
      title: language === 'ar' ? 'قارن' : 'Compare',
      description:
        language === 'ar'
          ? 'قارن المواصفات والأسعار جنباً إلى جنب'
          : 'Compare specs and prices side by side',
    },
    {
      icon: <EventAvailable sx={{ fontSize: 56 }} />,
      title: language === 'ar' ? 'احجز' : 'Book',
      description:
        language === 'ar'
          ? 'احجز تجربة قيادتك مع الوكيل'
          : 'Schedule your test drive with dealer',
    },
  ];

  return (
    <>
      <Header />
      <Box sx={{ minHeight: '100vh' }}>
        {/* Hero Section with Large Image */}
        <Box
          sx={{
            position: 'relative',
            height: { xs: '70vh', md: '85vh' },
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.9
            )} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
          }}
        >
          {/* Background Pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage:
                'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Box
              sx={{
                maxWidth: 700,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(-50px)',
                transition: 'all 1s ease-out',
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '3rem', md: '5rem' },
                  fontWeight: 900,
                  mb: 3,
                  color: 'white',
                  textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                {language === 'ar'
                  ? 'سيارتك المثالية في انتظارك'
                  : 'Your Perfect Car Awaits'}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 5,
                  color: 'white',
                  fontWeight: 400,
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                }}
              >
                {language === 'ar'
                  ? 'اكتشف أكثر من 400 موديل من 95 علامة تجارية'
                  : 'Discover 400+ models from 95 brands'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => router.push(`/${locale}`)}
                  sx={{
                    px: 5,
                    py: 2,
                    fontSize: '1.2rem',
                    borderRadius: 2,
                    textTransform: 'none',
                    bgcolor: 'white',
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: alpha('#fff', 0.9),
                    },
                  }}
                >
                  {language === 'ar' ? 'استكشف الآن' : 'Explore Now'}
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* How It Works Section */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              mb: 8,
              fontWeight: 700,
            }}
          >
            {language === 'ar' ? 'كيف يعمل؟' : 'How It Works'}
          </Typography>
          <Grid container spacing={6}>
            {steps.map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box
                  sx={{
                    textAlign: 'center',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'scale(1)' : 'scale(0.8)',
                    transition: `all 0.6s ease-out ${0.2 + index * 0.15}s`,
                  }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      mb: 3,
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Featured Brands Section */}
        <Box
          sx={{
            bgcolor: alpha(theme.palette.background.paper, 0.5),
            py: { xs: 6, md: 10 },
          }}
        >
          <Container maxWidth="lg">
            <Typography
              variant="h3"
              sx={{
                textAlign: 'center',
                mb: 6,
                fontWeight: 700,
              }}
            >
              {language === 'ar' ? 'العلامات التجارية المميزة' : 'Featured Brands'}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ textAlign: 'center', mb: 4 }}
            >
              {language === 'ar'
                ? '95 علامة تجارية عالمية ومحلية'
                : '95 global and local brands'}
            </Typography>
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push(`/${locale}`)}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                {language === 'ar' ? 'عرض جميع العلامات' : 'View All Brands'}
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Final CTA */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Card
            sx={{
              p: { xs: 4, md: 8 },
              textAlign: 'center',
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.05
              )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            }}
          >
            <Typography variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
              {language === 'ar'
                ? 'ابدأ رحلة البحث عن سيارتك اليوم'
                : 'Start Your Car Search Journey Today'}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              {language === 'ar'
                ? 'انضم إلى آلاف العملاء الراضين'
                : 'Join thousands of satisfied customers'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => router.push(`/${locale}`)}
              sx={{
                px: 5,
                py: 2,
                fontSize: '1.2rem',
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
            </Button>
          </Card>
        </Container>
      </Box>
    </>
  );
}
