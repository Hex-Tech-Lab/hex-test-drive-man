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
  CardContent,
  alpha,
  useTheme,
} from '@mui/material';
import {
  DirectionsCar,
  Speed,
  Verified,
  TrendingUp,
  ArrowForward,
} from '@mui/icons-material';
import Header from '@/components/Header';
import { useLanguageStore } from '@/stores/language-store';

/**
 * Landing Page V1 - Grok-Inspired Design
 * Features: Animated hero, feature cards, stats section, modern gradient design
 */
export default function LandingV1() {
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

  const features = [
    {
      icon: <DirectionsCar sx={{ fontSize: 48 }} />,
      title: language === 'ar' ? 'أكثر من 400 موديل' : '400+ Models',
      description:
        language === 'ar'
          ? 'اختر من بين مجموعة واسعة من السيارات'
          : 'Choose from a wide range of vehicles',
    },
    {
      icon: <Speed sx={{ fontSize: 48 }} />,
      title: language === 'ar' ? 'حجز سريع' : 'Quick Booking',
      description:
        language === 'ar'
          ? 'احجز تجربة قيادتك في دقائق'
          : 'Book your test drive in minutes',
    },
    {
      icon: <Verified sx={{ fontSize: 48 }} />,
      title: language === 'ar' ? 'وكلاء معتمدون' : 'Verified Dealers',
      description:
        language === 'ar'
          ? 'جميع الوكلاء معتمدون وموثوقون'
          : 'All dealers are verified and trusted',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 48 }} />,
      title: language === 'ar' ? 'أفضل الأسعار' : 'Best Prices',
      description:
        language === 'ar'
          ? 'قارن الأسعار واحصل على أفضل عرض'
          : 'Compare prices and get the best deal',
    },
  ];

  const stats = [
    { value: '427', label: language === 'ar' ? 'موديل' : 'Models' },
    { value: '95', label: language === 'ar' ? 'علامة تجارية' : 'Brands' },
    { value: '20', label: language === 'ar' ? 'وكيل' : 'Dealers' },
    { value: '2', label: language === 'ar' ? 'موقعين' : 'Locations' },
  ];

  return (
    <>
      <Header />
      <Box
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.05,
          )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        }}
      >
        {/* Hero Section */}
        <Container maxWidth="lg">
          <Box
            sx={{
              pt: { xs: 8, md: 12 },
              pb: { xs: 6, md: 10 },
              textAlign: 'center',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s ease-out',
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 800,
                mb: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {language === 'ar'
                ? 'اختبر سيارة أحلامك'
                : 'Test Drive Your Dream Car'}
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ mb: 5, maxWidth: 700, mx: 'auto' }}
            >
              {language === 'ar'
                ? 'اكتشف، قارن، واحجز تجربة قيادة لأكثر من 400 موديل في مصر'
                : 'Discover, compare, and book test drives for 400+ models in Egypt'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => router.push(`/${locale}`)}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                {language === 'ar' ? 'تصفح الكتالوج' : 'Browse Catalog'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push(`/${locale}/compare`)}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                {language === 'ar' ? 'قارن السيارات' : 'Compare Vehicles'}
              </Button>
            </Box>
          </Box>

          {/* Stats Section */}
          <Grid
            container
            spacing={3}
            sx={{
              mb: 8,
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s ease-out 0.2s',
            }}
          >
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Card
                  sx={{
                    textAlign: 'center',
                    py: 3,
                    background: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.primary.main,
                      mb: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Features Section */}
          <Box sx={{ pb: 8 }}>
            <Typography
              variant="h3"
              sx={{
                textAlign: 'center',
                mb: 6,
                fontWeight: 700,
              }}
            >
              {language === 'ar' ? 'لماذا تختارنا؟' : 'Why Choose Us?'}
            </Typography>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      p: 3,
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                      transition: `all 0.8s ease-out ${0.3 + index * 0.1}s`,
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          color: theme.palette.primary.main,
                          mb: 2,
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* CTA Section */}
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              opacity: mounted ? 1 : 0,
              transition: 'all 0.8s ease-out 0.8s',
            }}
          >
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
              {language === 'ar'
                ? 'جاهز لبدء رحلتك؟'
                : 'Ready to Start Your Journey?'}
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
          </Box>
        </Container>
      </Box>
    </>
  );
}
