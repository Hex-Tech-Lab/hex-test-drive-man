'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  alpha,
  useTheme,
  Chip,
} from '@mui/material';
import {
  Visibility,
  Animation,
  Image as ImageIcon,
  ViewModule,
} from '@mui/icons-material';
import Header from '@/components/Header';
import { useLanguageStore } from '@/stores/language-store';

/**
 * Landing Page Selector
 * Allows users to preview and choose between different landing page versions
 */
export default function LandingSelector() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const theme = useTheme();

  useEffect(() => {
    if (locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    }
  }, [locale, setLanguage]);

  const versions = [
    {
      id: 'v1',
      name: language === 'ar' ? 'تصميم جروك' : 'Grok Inspired',
      description:
        language === 'ar'
          ? 'تصميم حديث مع رسوم متحركة، بطاقات مميزات، وإحصائيات'
          : 'Modern design with animations, feature cards, and stats',
      path: `/${locale}/landing-v1`,
      icon: <Animation sx={{ fontSize: 48 }} />,
      features: [
        language === 'ar' ? 'رسوم متحركة سلسة' : 'Smooth animations',
        language === 'ar' ? 'بطاقات مميزات' : 'Feature cards',
        language === 'ar' ? 'قسم إحصائيات' : 'Stats section',
        language === 'ar' ? 'تدرجات حديثة' : 'Modern gradients',
      ],
      color: theme.palette.primary.main,
    },
    {
      id: 'v2',
      name: language === 'ar' ? 'إعادة تصميم البطل' : 'Hero Redesign',
      description:
        language === 'ar'
          ? 'تركيز على الصور الكبيرة، تصميم بسيط، وتجربة مرئية'
          : 'Focus on large imagery, minimal design, visual experience',
      path: `/${locale}/landing-v2`,
      icon: <ImageIcon sx={{ fontSize: 48 }} />,
      features: [
        language === 'ar' ? 'صورة بطل كبيرة' : 'Large hero image',
        language === 'ar' ? 'تصميم بسيط' : 'Minimal design',
        language === 'ar' ? 'قسم كيف يعمل' : 'How it works section',
        language === 'ar' ? 'علامات تجارية مميزة' : 'Featured brands',
      ],
      color: theme.palette.secondary.main,
    },
    {
      id: 'v3',
      name: language === 'ar' ? 'كتالوج مدمج' : 'Catalog Embedded',
      description:
        language === 'ar'
          ? 'صفحة هبوط مع معاينة مباشرة للسيارات من الكتالوج'
          : 'Landing page with live vehicle preview from catalog',
      path: `/${locale}/landing-v3`,
      icon: <ViewModule sx={{ fontSize: 48 }} />,
      features: [
        language === 'ar' ? 'سيارات مميزة' : 'Featured vehicles',
        language === 'ar' ? 'تكامل مباشر' : 'Live integration',
        language === 'ar' ? 'معاينة الأسعار' : 'Price preview',
        language === 'ar' ? 'إحصائيات سريعة' : 'Quick stats',
      ],
      color: theme.palette.success.main,
    },
  ];

  return (
    <>
      <Header />
      <Box
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.02
          )} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 800,
                mb: 2,
              }}
            >
              {language === 'ar'
                ? 'اختر تصميم الصفحة الرئيسية'
                : 'Choose Landing Page Design'}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              {language === 'ar'
                ? 'اختر من بين 3 تصاميم مختلفة للصفحة الرئيسية'
                : 'Select from 3 different landing page designs'}
            </Typography>
            <Chip
              label={
                language === 'ar'
                  ? 'المزيد من الإصدارات قريباً'
                  : 'More versions coming soon'
              }
              color="primary"
              variant="outlined"
            />
          </Box>

          {/* Version Cards */}
          <Grid container spacing={4}>
            {versions.map((version, index) => (
              <Grid item xs={12} md={4} key={version.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    border: `2px solid ${alpha(version.color, 0.1)}`,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[12],
                      borderColor: alpha(version.color, 0.3),
                    },
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      background: `linear-gradient(135deg, ${alpha(
                        version.color,
                        0.1
                      )} 0%, ${alpha(version.color, 0.05)} 100%)`,
                    }}
                  >
                    <Box sx={{ color: version.color, mb: 2 }}>
                      {version.icon}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      {version.name}
                    </Typography>
                    <Chip
                      label={version.id.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: alpha(version.color, 0.1),
                        color: version.color,
                        fontWeight: 600,
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      {version.description}
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {language === 'ar' ? 'المميزات:' : 'Features:'}
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {version.features.map((feature, idx) => (
                        <Typography
                          component="li"
                          variant="body2"
                          color="text.secondary"
                          key={idx}
                          sx={{ mb: 1 }}
                        >
                          {feature}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Visibility />}
                      onClick={() => router.push(version.path)}
                      sx={{
                        py: 1.5,
                        textTransform: 'none',
                        fontSize: '1rem',
                        bgcolor: version.color,
                        '&:hover': {
                          bgcolor: alpha(version.color, 0.8),
                        },
                      }}
                    >
                      {language === 'ar' ? 'عرض التصميم' : 'View Design'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Info Section */}
          <Box
            sx={{
              mt: 8,
              p: 4,
              textAlign: 'center',
              bgcolor: alpha(theme.palette.info.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {language === 'ar'
                ? 'ملاحظة للمطورين'
                : 'Developer Note'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {language === 'ar'
                ? 'جميع الإصدارات الثلاثة متاحة بشكل دائم. سيتم إضافة المزيد من الإصدارات (v4-v15) بمرور الوقت.'
                : 'All 3 versions are permanently available. More versions (v4-v15) will be added over time.'}
            </Typography>
          </Box>

          {/* Quick Access to Catalog */}
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {language === 'ar'
                ? 'أو انتقل مباشرة إلى الكتالوج'
                : 'Or go directly to the catalog'}
            </Typography>
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
              {language === 'ar' ? 'عرض الكتالوج' : 'View Catalog'}
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
}
