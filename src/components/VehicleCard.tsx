'use client';

import { Card, CardMedia, CardContent, Typography, Box, Chip, Button, IconButton } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Vehicle } from '@/types/vehicle';
import { useCompareStore } from '@/stores/compare-store';
import { useLanguageStore } from '@/stores/language-store';
import { BrandLogo } from './BrandLogo';
import { getVehicleImage, formatEGP } from '@/lib/imageHelper';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const language = useLanguageStore((state) => state.language);
  const { compareItems, addToCompare, removeFromCompare } = useCompareStore();

  const isInCompare = compareItems.some((item) => item.id === vehicle.id);
  const canAddMore = compareItems.length < 3;

  const handleCompareToggle = () => {
    if (isInCompare) {
      removeFromCompare(vehicle.id);
    } else if (canAddMore) {
      addToCompare(vehicle);
    }
  };

  

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

      <Box sx={{ position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 8, left: language === 'ar' ? 'auto' : 8, right: language === 'ar' ? 8 : 'auto', zIndex: 1 }}>
          <BrandLogo brandName={vehicle.models.brands.name} logoUrl={vehicle.models.brands.logo_url} size="small" />
        </Box>
        <CardMedia
          component="img"
          height="200"
          image={getVehicleImage(vehicle.models.hero_image_url)}
          alt={`${vehicle.models.brands.name} ${vehicle.models.name}`}
          sx={{ objectFit: 'cover' }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          {vehicle.models.brands.name} {vehicle.models.name}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {vehicle.model_year} • {vehicle.trim_name} • {vehicle.categories?.name ?? (language === 'ar' ? 'غير مصنف' : 'Uncategorized')}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
          {vehicle.fuel_types?.name && (
            <Chip label={vehicle.fuel_types.name} size="small" variant="outlined" />
          )}
          {vehicle.transmissions?.name && (
            <Chip label={vehicle.transmissions.name} size="small" variant="outlined" />
          )}
          {vehicle.seats && <Chip label={`${vehicle.seats} ${language === 'ar' ? 'مقاعد' : 'seats'}`} size="small" variant="outlined" />}
        </Box>

        <Typography variant="h5" color="primary" sx={{ mt: 'auto', fontWeight: 600 }}>
          {formatEGP(vehicle.price_egp, language)}
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
