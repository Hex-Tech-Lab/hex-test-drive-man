'use client';

import { Box, Container, Typography, Grid, Card, CardContent, CardActions, Button, Chip } from '@mui/material';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useLanguageStore } from '@/stores/language-store';
import PreviewIcon from '@mui/icons-material/Preview';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

/**
 * Landing Page Version Selector
 * Allows navigation between different landing page versions
 */
export default function LandingVersions() {
  const router = useRouter();
  const language = useLanguageStore((state) => state.language);

  const versions = [
    {
      version: 'V1',
      name: language === 'ar' ? 'تصميم Grok الأصلي' : 'Original Grok-inspired Design',
      description:
        language === 'ar'
          ? 'تصميم بطل مع تدرج أرجواني وبطاقات ميزات'
          : 'Hero design with purple gradient and feature cards',
      date: '2025-12-XX',
      branch: 'bb-grok-land-015d56',
      path: '/landing-v1',
      status: 'archived',
    },
    {
      version: 'V2',
      name: language === 'ar' ? 'إعادة تصميم البطل' : 'Hero Redesign',
      description:
        language === 'ar'
          ? 'قسم بطل محسّن مع إحصائيات وتأثيرات تحويم'
          : 'Enhanced hero section with stats and hover effects',
      date: '2025-12-XX',
      branch: 'bb-landing-h-cefe4a',
      path: '/landing-v2',
      status: 'current',
    },
    {
      version: 'V3',
      name: language === 'ar' ? 'الإصدار القادم' : 'Coming Soon',
      description:
        language === 'ar' ? 'الإصدار التالي قيد التطوير' : 'Next version in development',
      date: 'TBD',
      branch: 'TBD',
      path: null,
      status: 'planned',
    },
  ];

  const handlePreview = (path: string | null) => {
    if (path) {
      router.push(`/${language}${path}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'success';
      case 'archived':
        return 'default';
      case 'planned':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'current':
        return language === 'ar' ? 'الحالي' : 'Current';
      case 'archived':
        return language === 'ar' ? 'مؤرشف' : 'Archived';
      case 'planned':
        return language === 'ar' ? 'مخطط' : 'Planned';
      default:
        return status;
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            {language === 'ar' ? 'إصدارات الصفحة المقصودة' : 'Landing Page Versions'}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {language === 'ar'
              ? 'استكشف تطور تصميم صفحتنا المقصودة'
              : 'Explore the evolution of our landing page design'}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {versions.map((version) => (
            <Grid item xs={12} md={4} key={version.version}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: version.path ? 'translateY(-8px)' : 'none',
                    boxShadow: version.path ? 8 : 1,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {version.version}
                    </Typography>
                    <Chip
                      label={getStatusLabel(version.status)}
                      color={getStatusColor(version.status)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {version.name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {version.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarTodayIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {language === 'ar' ? 'التاريخ:' : 'Date:'} {version.date}
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                    {language === 'ar' ? 'الفرع:' : 'Branch:'} {version.branch}
                  </Typography>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={version.status === 'current' ? 'contained' : 'outlined'}
                    startIcon={<PreviewIcon />}
                    onClick={() => handlePreview(version.path)}
                    disabled={!version.path}
                  >
                    {language === 'ar' ? 'معاينة' : 'Preview'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Documentation Section */}
        <Box sx={{ mt: 8, p: 4, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            {language === 'ar' ? 'ملاحظات التطوير' : 'Development Notes'}
          </Typography>
          <Typography variant="body1" paragraph>
            {language === 'ar'
              ? 'تم استخراج هذه الإصدارات من فروع Vercel المنفصلة:'
              : 'These versions were extracted from separate Vercel deployment branches:'}
          </Typography>
          <ul>
            <li>
              <Typography variant="body2">
                <strong>V1:</strong> bb-grok-land-015d56 (Grok-inspired design with gradient hero)
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>V2:</strong> bb-landing-h-cefe4a (Enhanced hero with stats section)
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>V3+:</strong> Future iterations will be added as development progresses
              </Typography>
            </li>
          </ul>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {language === 'ar'
              ? 'الهدف: الحفاظ على سجل كامل لتطور التصميم (10-15 إصدارًا متوقعة)'
              : 'Goal: Maintain complete design evolution history (10-15 versions expected)'}
          </Typography>
        </Box>
      </Container>
    </>
  );
}
