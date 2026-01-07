'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Header from '@/components/Header';
import VehicleCard from '@/components/VehicleCard';
import FavoriteLoginModal from '@/components/FavoriteLoginModal';
import { useFavoriteStore } from '@/stores/useFavoriteStore';
import { useLanguageStore } from '@/stores/language-store';
import { useParams, useRouter } from 'next/navigation';
import { AggregatedVehicle } from '@/types/vehicle';

export default function SavedPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const { favoriteIds, isAuthenticated } = useFavoriteStore();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [vehicles, setVehicles] = useState<AggregatedVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    }
  }, [locale, setLanguage]);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);

  // Fetch favorite vehicles
  useEffect(() => {
    const fetchFavorites = async () => {
      if (favoriteIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch vehicles by IDs
        const response = await fetch('/api/vehicles/by-ids', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: favoriteIds }),
        });

        if (response.ok) {
          const data = await response.json();
          setVehicles(data);
        }
      } catch (error) {
        console.error('Error fetching favorite vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [favoriteIds]);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  if (favoriteIds.length === 0) {
    return (
      <>
        <Header />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <FavoriteIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              {language === 'ar' ? 'لا توجد سيارات مفضلة' : 'No Favorite Cars'}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {language === 'ar'
                ? 'ابدأ بإضافة سيارات إلى قائمة المفضلة لديك'
                : 'Start adding cars to your favorites list'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push(`/${language}`)}
              sx={{ mt: 2 }}
            >
              {language === 'ar' ? 'تصفح السيارات' : 'Browse Cars'}
            </Button>
          </Box>
        </Container>

        {/* Auth Modal */}
        <FavoriteLoginModal
          open={showAuthModal}
          onClose={() => router.push(`/${language}`)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FavoriteIcon color="error" />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {language === 'ar' ? 'سياراتي المفضلة' : 'My Favorite Cars'}
            </Typography>
          </Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push(`/${language}`)}
          >
            {language === 'ar' ? 'عودة' : 'Back'}
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {favoriteIds.length} {language === 'ar' ? 'سيارة' : favoriteIds.length === 1 ? 'car' : 'cars'}
        </Typography>

        <Grid container spacing={3}>
          {vehicles.map((vehicle, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={vehicle.id}>
              <VehicleCard vehicle={vehicle} position={index} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Auth Modal */}
      <FavoriteLoginModal
        open={showAuthModal}
        onClose={() => router.push(`/${language}`)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
