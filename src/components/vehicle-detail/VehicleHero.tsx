'use client';

import { useState } from 'react';
import { Box, Typography, Chip, Grid, Paper, IconButton, Stack, Divider } from '@mui/material';
import Image from 'next/image';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Vehicle } from '@/types/vehicle';
import { useLanguageStore } from '@/stores/language-store';
import { getVehicleImage } from '@/lib/imageHelper';

interface VehicleHeroProps {
  vehicle: Vehicle;
  trims: Vehicle[];
}

/**
 * Enhanced vehicle hero section with image gallery, favorites, and share functionality
 * Features improved visual design with Material Design 3 principles
 * @param props - Component props
 * @param props.vehicle - Primary vehicle data (first trim)
 * @param props.trims - All available trims for price range calculation
 */
export default function VehicleHero({ vehicle, trims }: VehicleHeroProps) {
  const language = useLanguageStore((state) => state.language);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Build image gallery (hero + hover + vehicle_images)
  const images = [
    vehicle.models.hero_image_url,
    vehicle.models.hover_image_url,
    ...(vehicle.vehicle_images?.map((img) => img.image_url) || []),
  ].filter(Boolean);

  // Calculate price range
  const minPrice = Math.min(...trims.map((t) => t.price_egp));
  const maxPrice = Math.max(...trims.map((t) => t.price_egp));

  const displayTitle = `${vehicle.models.brands.name} ${vehicle.models.name} ${vehicle.model_year}`;

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Persist to localStorage or backend
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: displayTitle,
          text: `Check out this ${displayTitle}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show snackbar notification
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: { xs: 2, md: 4 }, 
        mb: 4,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,250,1) 100%)',
      }}
    >
      <Grid container spacing={4}>
        {/* Left: Hero Image Gallery */}
        <Grid item xs={12} md={7}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: { xs: 300, md: 500 },
              borderRadius: 3,
              overflow: 'hidden',
              backgroundColor: 'grey.50',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            }}
          >
            <Image
              src={getVehicleImage(images[currentImageIndex] || vehicle.models.hero_image_url)}
              alt={displayTitle}
              fill
              style={{ objectFit: 'cover', objectPosition: 'center 85%' }}
              priority
              sizes="(max-width: 768px) 100vw, 60vw"
            />

            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <IconButton
                  onClick={handlePreviousImage}
                  sx={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(8px)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                  }}
                >
                  <NavigateBeforeIcon />
                </IconButton>
                <IconButton
                  onClick={handleNextImage}
                  sx={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(8px)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                  }}
                >
                  <NavigateNextIcon />
                </IconButton>

                {/* Image Indicators */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 1,
                  }}
                >
                  {images.map((_, index) => (
                    <Box
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      sx={{
                        width: index === currentImageIndex ? 32 : 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: index === currentImageIndex ? 'primary.main' : 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  ))}
                </Box>
              </>
            )}

            {/* Favorite & Share Actions */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                display: 'flex',
                gap: 1,
              }}
            >
              <IconButton
                onClick={handleToggleFavorite}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(8px)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                }}
              >
                {isFavorite ? (
                  <FavoriteIcon sx={{ color: 'error.main' }} />
                ) : (
                  <FavoriteBorderIcon />
                )}
              </IconButton>
              <IconButton
                onClick={handleShare}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(8px)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                }}
              >
                <ShareIcon />
              </IconButton>
            </Box>
          </Box>
        </Grid>

        {/* Right: Key Information */}
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            {/* Brand Logo */}
            {vehicle.models.brands.logo_url && (
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  width: 'fit-content',
                }}
              >
                <Image
                  src={vehicle.models.brands.logo_url}
                  alt={vehicle.models.brands.name}
                  width={100}
                  height={60}
                  style={{ objectFit: 'contain' }}
                />
              </Box>
            )}

            {/* Vehicle Title */}
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  fontWeight: 700,
                  lineHeight: 1.2,
                  mb: 1,
                }}
              >
                {vehicle.models.brands.name} {vehicle.models.name}
              </Typography>
              <Typography 
                variant="h5" 
                color="text.secondary" 
                sx={{ 
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  fontWeight: 500,
                }}
              >
                {vehicle.model_year}
              </Typography>
            </Box>

            <Divider />

            {/* Price Range */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                {language === 'ar' ? 'السعر' : 'Price'}
              </Typography>
              <Typography 
                variant="h4" 
                color="primary" 
                sx={{ 
                  fontSize: { xs: '1.75rem', md: '2.25rem' },
                  fontWeight: 700,
                }}
              >
                {language === 'ar' ? 'جنيه' : 'EGP'}{' '}
                {minPrice === maxPrice
                  ? minPrice.toLocaleString()
                  : `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`}
              </Typography>
              {trims.length > 1 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {trims.length} {language === 'ar' ? 'إصدار متاح' : `trim${trims.length > 1 ? 's' : ''} available`}
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Quick Specs Grid */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                {language === 'ar' ? 'المواصفات الرئيسية' : 'Key Specifications'}
              </Typography>
              <Grid container spacing={2}>
                {vehicle.fuel_types?.name && (
                  <Grid item xs={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                      }}
                    >
                      <LocalGasStationIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {language === 'ar' ? 'الوقود' : 'Fuel'}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {vehicle.fuel_types.name}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                {vehicle.transmissions?.name && (
                  <Grid item xs={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                      }}
                    >
                      <SettingsIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {language === 'ar' ? 'ناقل الحركة' : 'Transmission'}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {vehicle.transmissions.name}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                {vehicle.horsepower && (
                  <Grid item xs={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                      }}
                    >
                      <SpeedIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {language === 'ar' ? 'القوة' : 'Power'}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {vehicle.horsepower} {language === 'ar' ? 'حصان' : 'HP'}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                {vehicle.seats && (
                  <Grid item xs={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                      }}
                    >
                      <EventSeatIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {language === 'ar' ? 'المقاعد' : 'Seats'}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {vehicle.seats}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Electric/Hybrid Badges */}
            {(vehicle.is_electric || vehicle.is_hybrid) && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {vehicle.is_electric && (
                  <Chip 
                    label={language === 'ar' ? 'كهربائي' : 'Electric'} 
                    color="success" 
                    size="medium"
                    sx={{ fontWeight: 600 }}
                  />
                )}
                {vehicle.is_hybrid && (
                  <Chip 
                    label={language === 'ar' ? 'هجين' : 'Hybrid'} 
                    color="info" 
                    size="medium"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
