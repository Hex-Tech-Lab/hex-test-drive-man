'use client';

import { Box, Container, Typography, Button, Grid, alpha, useTheme } from '@mui/material';
import { DirectionsCar, TrendingUp, Speed, ElectricCar } from '@mui/icons-material';
import { useLanguageStore } from '@/stores/language-store';

interface CatalogHeroProps {
  totalModels: number;
  totalBrands: number;
  onCategoryClick?: (category: string) => void;
}

/**
 * Catalog Hero Section
 * Features: Stats display, quick category buttons, gradient background
 */
export default function CatalogHero({ totalModels, totalBrands, onCategoryClick }: CatalogHeroProps) {
  const theme = useTheme();
  const language = useLanguageStore((state) => state.language);

  const categories = [
    {
      id: 'suv',
      icon: <DirectionsCar />,
      label: language === 'ar' ? 'SUV' : 'SUV',
      color: theme.palette.primary.main,
    },
    {
      id: 'sedan',
      icon: <Speed />,
      label: language === 'ar' ? 'سيدان' : 'Sedan',
      color: theme.palette.secondary.main,
    },
    {
      id: 'hatchback',
      icon: <TrendingUp />,
      label: language === 'ar' ? 'هاتشباك' : 'Hatchback',
      color: theme.palette.success.main,
    },
    {
      id: 'electric',
      icon: <ElectricCar />,
      label: language === 'ar' ? 'كهربائي' : 'Electric',
      color: theme.palette.info.main,
    },
  ];

  const stats = [
    {
      value: totalModels,
      label: language === 'ar' ? 'موديل' : 'Models',
    },
    {
      value: totalBrands,
      label: language === 'ar' ? 'علامة تجارية' : 'Brands',
    },
    {
      value: '24/7',
      label: language === 'ar' ? 'دعم' : 'Support',
    },
  ];

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
          theme.palette.secondary.main,
          0.05
        )} 100%)`,
        py: { xs: 4, md: 6 },
        mb: 4,
        borderRadius: 2,
      }}
    >
      <Container maxWidth="xl">
        {/* Title & Description */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '3rem' },
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {language === 'ar' ? 'اكتشف سيارتك المثالية' : 'Discover Your Perfect Car'}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: 600,
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.25rem' },
            }}
          >
            {language === 'ar'
              ? 'تصفح أكثر من 400 موديل من أفضل العلامات التجارية'
              : 'Browse over 400 models from the best brands'}
          </Typography>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={4} key={index}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    fontSize: { xs: '1.5rem', md: '2.5rem' },
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', md: '1rem' } }}
                >
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Quick Category Buttons */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{ mb: 2, fontWeight: 600 }}
          >
            {language === 'ar' ? 'تصفح حسب الفئة' : 'Browse by Category'}
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {categories.map((category) => (
              <Grid item xs={6} sm={3} key={category.id}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={category.icon}
                  onClick={() => onCategoryClick?.(category.id)}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: alpha(category.color, 0.3),
                    color: category.color,
                    '&:hover': {
                      borderColor: category.color,
                      bgcolor: alpha(category.color, 0.1),
                    },
                  }}
                >
                  {category.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
