'use client';

import { Box, Container, Typography, Card, CardContent, CardActions, Button, Grid, Chip } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useLanguageStore } from '@/stores/language-store';
import Header from '@/components/Header';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

/**
 * Landing Page Selector
 * Allows users to preview and choose between different landing page versions
 */
export default function LandingSelectorPage() {
  const router = useRouter();
  const language = useLanguageStore((state) => state.language);

  const versions = [
    {
      id: 'v1',
      name: language === 'ar' ? 'مستوحى من Grok' : 'Grok Inspired',
      description:
        language === 'ar'
          ? 'صفحة تسويقية بتصميم انسيابي مع رسوم متحركة متطورة وجماليات Material Design 3'
          : 'Marketing landing page with fluid motion animations and Material Design 3 aesthetics',
      path: '/landing-v1',
      icon: RocketLaunchIcon,
      color: '#1976d2',
      features:
        language === 'ar'
          ? ['قسم البطل المتحرك', 'عرض الميزات', 'كيف يعمل', 'الإحصائيات', 'دعوة للعمل']
          : ['Animated Hero', 'Features Showcase', 'How It Works', 'Stats Section', 'Call to Action'],
    },
    {
      id: 'v2',
      name: language === 'ar' ? 'إعادة تصميم البطل' : 'Hero Redesign',
      description:
        language === 'ar'
          ? 'قسم بطل سائل مع تكامل كامل للكتالوج - تجربة تصفح غامرة'
          : 'Liquid hero section with full catalog integration - immersive browsing experience',
      path: '/landing-v2',
      icon: ViewQuiltIcon,
      color: '#9c27b0',
      features:
        language === 'ar'
          ? ['بطل PixiJS السائل', 'كتالوج مدمج', 'بحث وتصفية', 'عرض الشبكة', 'فرز متقدم']
          : ['Liquid PixiJS Hero', 'Embedded Catalog', 'Search & Filter', 'Grid View', 'Advanced Sorting'],
    },
    {
      id: 'v3',
      name: language === 'ar' ? 'هجين التسويق + الكتالوج' : 'Marketing + Catalog Hybrid',
      description:
        language === 'ar'
          ? 'يجمع بين البطل المستوحى من Grok ومعاينة المركبات المميزة'
          : 'Combines Grok-inspired hero with featured vehicles preview',
      path: '/landing-v3',
      icon: AutoAwesomeIcon,
      color: '#f57c00',
      features:
        language === 'ar'
          ? ['قسم البطل', 'عرض الميزات', 'معاينة المركبات', 'مركبات مميزة', 'رابط الكتالوج']
          : ['Hero Section', 'Features Display', 'Vehicle Preview', 'Featured Vehicles', 'Catalog Link'],
    },
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {language === 'ar' ? 'اختر تصميم الصفحة الرئيسية' : 'Choose Landing Page Design'}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            {language === 'ar'
              ? 'استكشف ثلاثة تصاميم مختلفة للصفحة الرئيسية واختر المفضل لديك'
              : 'Explore three different landing page designs and choose your favorite'}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {versions.map((version) => {
            const IconComponent = version.icon;
            return (
              <Grid item xs={12} md={4} key={version.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      background: `linear-gradient(135deg, ${version.color} 0%, ${version.color}dd 100%)`,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <IconComponent sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {version.name}
                      </Typography>
                      <Chip
                        label={version.id.toUpperCase()}
                        size="small"
                        sx={{
                          mt: 1,
                          bgcolor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      {version.description}
                    </Typography>

                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      {language === 'ar' ? 'الميزات الرئيسية:' : 'Key Features:'}
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {version.features.map((feature, idx) => (
                        <Typography
                          component="li"
                          variant="body2"
                          color="text.secondary"
                          key={idx}
                          sx={{ mb: 0.5 }}
                        >
                          {feature}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={() => handleNavigate(version.path)}
                      sx={{
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        background: `linear-gradient(135deg, ${version.color} 0%, ${version.color}dd 100%)`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${version.color}dd 0%, ${version.color}bb 100%)`,
                        },
                      }}
                    >
                      {language === 'ar' ? 'عرض التصميم' : 'View Design'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="body2" color="text.secondary">
            {language === 'ar'
              ? 'جميع التصاميم متاحة بشكل دائم • يمكنك التبديل بينها في أي وقت'
              : 'All designs are permanently available • You can switch between them anytime'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
