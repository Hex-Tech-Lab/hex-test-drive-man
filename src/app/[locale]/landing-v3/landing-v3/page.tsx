'use client';

import { useEffect, useState } from 'react';
import { Box, Container, Grid, Typography, Button, CircularProgress } from '@mui/material';
import Header from '@/components/Header';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import VehicleCard from '@/components/VehicleCard';
import { vehicleRepository } from '@/repositories/vehicleRepository';
import { Vehicle } from '@/types/vehicle';
import { useLanguageStore } from '@/stores/language-store';
import { useRouter } from 'next/navigation';

/**
 * Landing Page V3 - Hybrid Marketing + Catalog Preview
 * Combines Grok-inspired hero with featured vehicles catalog preview
 */
export default function LandingV3Page() {
  const language = useLanguageStore((state) => state.language);
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedVehicles = async () => {
      try {
        setLoading(true);
        const data = await vehicleRepository.getAll();
        // Get 8 featured vehicles (mix of segments)
        const featured = data
          .sort(() => Math.random() - 0.5)
          .slice(0, 8);
        setVehicles(featured);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedVehicles();
  }, []);

  const handleViewAllCatalog = () => {
    router.push(`/${language}/catalog`);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'white' }}>
      <Header />
      <HeroSection />
      <FeaturesSection />

      {/* Featured Vehicles Section */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {language === 'ar' ? 'مركبات مميزة' : 'Featured Vehicles'}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            {language === 'ar'
              ? 'اكتشف أحدث السيارات المتاحة للتجربة'
              : 'Discover the latest vehicles available for test drive'}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {vehicles.map((vehicle) => (
                <Grid item xs={12} sm={6} md={3} key={vehicle.id}>
                  <VehicleCard vehicle={vehicle} />
                </Grid>
              ))}
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleViewAllCatalog}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                  },
                }}
              >
                {language === 'ar' ? 'عرض جميع المركبات' : 'View All Vehicles'}
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
