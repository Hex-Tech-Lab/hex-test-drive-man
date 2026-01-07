'use client';

import { useCallback } from 'react';
import { Box, Typography, Chip, Grid, Paper, IconButton } from '@mui/material';
import Image from 'next/image';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Vehicle } from '@/types/vehicle';
import { useLanguageStore } from '@/stores/language-store';
import { useFavoriteStore } from '@/stores/favorite-store';
import { getVehicleImage } from '@/lib/imageHelper';

interface VehicleHeroProps {
  vehicle: Vehicle;
  trims: Vehicle[];
}

/**
 * Vehicle hero section with image, brand logo, title, and key specifications
 * @param props - Component props
 * @param props.vehicle - Primary vehicle data (first trim)
 * @param props.trims - All available trims for price range calculation
 */
export default function VehicleHero({ vehicle, trims }: VehicleHeroProps) {
  const language = useLanguageStore((state) => state.language);
  const { toggleFavorite, isFavorite } = useFavoriteStore();

  // Calculate price range
  const minPrice = Math.min(...trims.map((t) => t.price_egp));
  const maxPrice = Math.max(...trims.map((t) => t.price_egp));

  const displayTitle = `${vehicle.models.brands.name} ${vehicle.models.name} ${vehicle.model_year}`;
  const isFavorited = isFavorite(vehicle.id);

  const handleFavoriteToggle = useCallback(() => {
    toggleFavorite(vehicle.id);
  }, [vehicle.id, toggleFavorite]);

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, mb: 4, position: 'relative' }}>
      {/* Favorite Icon - Top Right/Left (RTL aware) */}
      <IconButton
        onClick={handleFavoriteToggle}
        sx={{
          position: 'absolute',
          top: 16,
          right: language === 'ar' ? 'auto' : 16,
          left: language === 'ar' ? 16 : 'auto',
          zIndex: 1,
          bgcolor: 'background.paper',
          '&:hover': { bgcolor: 'background.paper' },
          boxShadow: 2,
        }}
        aria-label={language === 'ar' ? 'إضافة إلى المفضلة' : 'Add to favorites'}
      >
        {isFavorited ? <FavoriteIcon color="error" sx={{ fontSize: 32 }} /> : <FavoriteBorderIcon sx={{ fontSize: 32 }} />}
      </IconButton>

      <Grid container spacing={4}>
        {/* Left: Hero Image */}
        <Grid item xs={12} md={7}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: { xs: 250, md: 400 },
              borderRadius: 2,
              overflow: 'hidden',
              backgroundColor: 'grey.100',
            }}
          >
            <Image
              src={getVehicleImage(vehicle.models.hero_image_url)}
              alt={displayTitle}
              fill
              style={{ objectFit: 'cover', objectPosition: 'center 85%' }}
              priority
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          </Box>
        </Grid>

        {/* Right: Key Information */}
        <Grid item xs={12} md={5}>
          {/* Brand Logo */}
          {vehicle.models.brands.logo_url && (
            <Box sx={{ mb: 2 }}>
              <Image
                src={vehicle.models.brands.logo_url}
                alt={vehicle.models.brands.name}
                width={80}
                height={60}
                style={{ objectFit: 'contain' }}
              />
            </Box>
          )}

          {/* Vehicle Title */}
          <Typography variant="h3" gutterBottom sx={{ fontSize: { xs: '1.75rem', md: '3rem' } }}>
            {vehicle.models.brands.name} {vehicle.models.name}
          </Typography>
          <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
            {vehicle.model_year}
          </Typography>

          {/* Price Range */}
          <Typography variant="h4" color="primary" sx={{ my: 3, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
            {language === 'ar' ? 'جنيه' : 'EGP'}{' '}
            {minPrice === maxPrice
              ? minPrice.toLocaleString()
              : `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`}
          </Typography>

          {/* Quick Specs */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            {vehicle.fuel_types?.name && (
              <Chip
                icon={<LocalGasStationIcon />}
                label={vehicle.fuel_types.name}
                variant="outlined"
                size="medium"
              />
            )}
            {vehicle.transmissions?.name && (
              <Chip
                icon={<SettingsIcon />}
                label={vehicle.transmissions.name}
                variant="outlined"
                size="medium"
              />
            )}
            {vehicle.horsepower && (
              <Chip
                icon={<SpeedIcon />}
                label={`${vehicle.horsepower} ${language === 'ar' ? 'حصان' : 'HP'}`}
                variant="outlined"
                size="medium"
              />
            )}
            {vehicle.seats && (
              <Chip
                icon={<EventSeatIcon />}
                label={`${vehicle.seats} ${language === 'ar' ? 'مقاعد' : 'seats'}`}
                variant="outlined"
                size="medium"
              />
            )}
          </Box>

          {/* Electric/Hybrid Badges */}
          {(vehicle.is_electric || vehicle.is_hybrid) && (
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              {vehicle.is_electric && (
                <Chip label={language === 'ar' ? 'كهربائي' : 'Electric'} color="success" size="small" />
              )}
              {vehicle.is_hybrid && (
                <Chip label={language === 'ar' ? 'هجين' : 'Hybrid'} color="info" size="small" />
              )}
            </Box>
          )}

          {/* Available Trims Count */}
          <Typography variant="body2" color="text.secondary">
            {trims.length} {language === 'ar' ? 'إصدار متاح' : `trim${trims.length > 1 ? 's' : ''} available`}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
