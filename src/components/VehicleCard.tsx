'use client';

import { useState } from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Chip, Button, IconButton } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Vehicle } from '@/types/vehicle';
import { VehicleWithImages } from '@/repositories/vehicleRepository';
import { useCompareStore } from '@/stores/compare-store';
import { useLanguageStore } from '@/stores/language-store';
import { getVehicleImage, formatPrice as formatPriceHelper } from '@/lib/imageHelper';

interface VehicleCardProps {
  vehicle: Vehicle | VehicleWithImages;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const language = useLanguageStore((state) => state.language);
  const { compareItems, addToCompare, removeFromCompare } = useCompareStore();
  const [isHover, setIsHover] = useState(false);

  const isInCompare = compareItems.some((item) => item.id === vehicle.id);
  const canAddMore = compareItems.length < 3;

  const handleCompareToggle = () => {
    if (isInCompare) {
      removeFromCompare(vehicle.id);
    } else if (canAddMore) {
      addToCompare(vehicle);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US').format(price);
  };

  // Determine hero and hover images with proper fallback chain
  const vehicleWithImages = vehicle as VehicleWithImages;
  const heroImage =
    vehicleWithImages.imageConfig?.heroPath ||
    vehicle.models.hero_image_url ||
    '/images/placeholders/vehicle-hero.jpg';

  const hoverImage =
    vehicleWithImages.imageConfig?.hoverPath ||
    vehicle.models.hover_image_url ||
    heroImage; // Fallback to hero if no hover available

  const currentImage = isHover ? hoverImage : heroImage;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <IconButton
        onClick={handleCompareToggle}
        disabled={!isInCompare && !canAddMore}
        sx={{
          position: 'absolute',
          top: 8,
          right: language === 'ar' ? 'auto' : 8,
          left: language === 'ar' ? 8 : 'auto',
          zIndex: 1,
          bgcolor: 'background.paper',
          '&:hover': { bgcolor: 'background.paper' },
        }}
      >
        {isInCompare ? <CheckCircleIcon color="primary" /> : <CompareArrowsIcon />}
      </IconButton>

      <CardMedia
        component="img"
        height="200"
        image={currentImage}
        alt={`${vehicle.models.brands.name} ${vehicle.models.name}`}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        sx={{
          objectFit: 'cover',
          transition: 'opacity 0.3s ease-in-out',
          cursor: 'pointer',
        }}
      />

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          {vehicle.models.brands.name} {vehicle.models.name}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {vehicle.model_year} • {vehicle.trim_name} • {vehicle.categories.name}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
          <Chip label={vehicle.fuel_types.name} size="small" variant="outlined" />
          <Chip label={vehicle.transmissions.name} size="small" variant="outlined" />
          {vehicle.seats && <Chip label={`${vehicle.seats} ${language === 'ar' ? 'مقاعد' : 'seats'}`} size="small" variant="outlined" />}
        </Box>

        <Typography variant="h5" color="primary" sx={{ mt: 'auto', fontWeight: 600 }}>
          {formatPrice(vehicle.price_egp)} {language === 'ar' ? 'ج.م' : 'EGP'}
        </Typography>

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
        >
          {language === 'ar' ? 'احجز تجربة قيادة' : 'Book Test Drive'}
        </Button>
      </CardContent>
    </Card>
  );
}
