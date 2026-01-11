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
  CardMedia,
  alpha,
  useTheme,
  Chip,
} from '@mui/material';
import { ArrowForward, LocalOffer } from '@mui/icons-material';
import Header from '@/components/Header';
import { useLanguageStore } from '@/stores/language-store';
import { vehicleRepository } from '@/repositories/vehicleRepository';
import { Vehicle } from '@/types/vehicle';

/**
 * Landing Page V3 - Catalog Embedded
 * Features: Hero + featured vehicles preview, direct catalog integration
 */
export default function LandingV3() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    }
    setMounted(true);
  }, [locale, setLanguage]);

  useEffect(() => {
    async function fetchFeaturedVehicles() {
      try {
        const { data } = await vehicleRepository.getAllVehicles();
        if (data) {
          // Get 6 random featured vehicles
          const shuffled = [...(data as Vehicle[])].sort(() => 0.5 - Math.random());
          setFeaturedVehicles(shuffled.slice(0, 6));
        }
      } catch (error) {
        console.error('Failed to fetch featured vehicles:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedVehicles();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <Header />
      <Box sx={{ minHeight: '100vh' }}>
        {/* Compact Hero Section */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.95
            )} 0%, ${alpha(theme.palette.secondary.main, 0.85)} 100%)`,
            py: { xs: 8, md: 12 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          <Box
            sx={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: alpha('#fff', 0.05),
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -150,
              left: -150,
              width: 500,
              height: 500,
              borderRadius: '50%',
              background: alpha('#fff', 0.03),
            }}
          />

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Box
              sx={{
                textAlign: 'center',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s ease-out',
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  fontWeight: 800,
                  mb: 2,
                  color: 'white',
                }}
              >
                {language === 'ar'
                  ? 'اكتشف سيارتك المثالية'
                  : 'Discover Your Perfect Car'}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  color: alpha('#fff', 0.95),
                  maxWidth: 700,
                  mx: 'auto',
                }}
              >
                {language === 'ar'
                  ? 'تصفح، قارن، واحجز من بين 427 موديل'
                  : 'Browse, compare, and book from 427 models'}
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
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.9),
                  },
                }}
              >
                {language === 'ar' ? 'عرض الكتالوج الكامل' : 'View Full Catalog'}
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Featured Vehicles Section */}
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                textAlign: 'center',
              }}
            >
              {language === 'ar' ? 'سيارات مميزة' : 'Featured Vehicles'}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ textAlign: 'center' }}
            >
              {language === 'ar'
                ? 'اختيارات شائعة من كتالوجنا'
                : 'Popular picks from our catalog'}
            </Typography>
          </Box>

          {loading ? (
            <Grid container spacing={3}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ height: 350 }}>
                    <Box
                      sx={{
                        height: 200,
                        bgcolor: alpha(theme.palette.divider, 0.1),
                      }}
                    />
                    <CardContent>
                      <Box
                        sx={{
                          height: 20,
                          bgcolor: alpha(theme.palette.divider, 0.1),
                          mb: 2,
                        }}
                      />
                      <Box
                        sx={{
                          height: 16,
                          bgcolor: alpha(theme.palette.divider, 0.1),
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {featuredVehicles.map((vehicle, index) => {
                // Generate detail page URL
                const brandSlug = vehicle.models.brands.name.toLowerCase().replace(/\s+/g, '-');
                const modelSlug = vehicle.models.name.toLowerCase().replace(/\s+/g, '-');
                const detailUrl = `/${locale}/vehicles/${brandSlug}-${modelSlug}-${vehicle.model_year}`;

                return (
                  <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                        transition: `all 0.6s ease-out ${0.1 + index * 0.1}s`,
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: theme.shadows[8],
                        },
                      }}
                      onClick={() => router.push(detailUrl)}
                    >
                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        vehicle.models?.hero_image_url ||
                        '/images/placeholder-car.png'
                      }
                      alt={`${vehicle.models?.brands?.name} ${vehicle.models?.name}`}
                      sx={{
                        objectFit: 'cover',
                        bgcolor: alpha(theme.palette.divider, 0.05),
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="overline"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 0.5 }}
                      >
                        {vehicle.models?.brands?.name}
                      </Typography>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        {vehicle.models?.name} {vehicle.model_year}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {vehicle.trim_name}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography
                          variant="h6"
                          color="primary"
                          sx={{ fontWeight: 700 }}
                        >
                          {formatPrice(vehicle.price_egp)}
                        </Typography>
                        <Chip
                          icon={<LocalOffer />}
                          label={
                            language === 'ar' ? 'احجز الآن' : 'Book Now'
                          }
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                );
              })}
            </Grid>
          )}

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="outlined"
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
              {language === 'ar'
                ? 'عرض جميع السيارات (427 موديل)'
                : 'View All Vehicles (427 Models)'}
            </Button>
          </Box>
        </Container>

        {/* Quick Stats */}
        <Box
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.03),
            py: { xs: 6, md: 8 },
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                    427
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {language === 'ar' ? 'موديل' : 'Models'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                    95
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {language === 'ar' ? 'علامة تجارية' : 'Brands'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                    20
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {language === 'ar' ? 'وكيل' : 'Dealers'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                    2
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {language === 'ar' ? 'موقعين' : 'Locations'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </>
  );
}
