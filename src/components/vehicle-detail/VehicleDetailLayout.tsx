'use client';

import { Box, Container, Breadcrumbs, Link, Typography, Grid, Card, CardMedia, CardContent, CardActions, Button } from '@mui/material';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import VehicleHero from './VehicleHero';
import TrimComparison from './TrimComparison';
import { useComparisonStore, vehicleToComparisonItem } from '@/stores/useComparisonStore';
import { useBookingStore, vehicleToBookingItem } from '@/stores/useBookingStore';
import { Vehicle } from '@/types/vehicle';
import { useLanguageStore } from '@/stores/language-store';
import { getVehicleImage } from '@/lib/imageHelper';

interface VehicleDetailLayoutProps {
  vehicle: Vehicle;
  trims: Vehicle[];
  similarVehicles: any[];
  locale: string;
}

/**
 * Main layout component for vehicle detail page
 * Integrates hero section, trim comparison, and similar vehicles
 * Manages comparison and booking cart state
 * @param props - Component props
 * @param props.vehicle - Primary vehicle data
 * @param props.trims - All trims for this model
 * @param props.similarVehicles - Similar vehicles from same brand
 * @param props.locale - Current locale (en/ar)
 */
export default function VehicleDetailLayout({
  vehicle,
  trims,
  similarVehicles,
  locale,
}: VehicleDetailLayoutProps) {
  const router = useRouter();
  const language = useLanguageStore((state) => state.language);
  const addToComparison = useComparisonStore((state) => state.addItem);
  const addToBooking = useBookingStore((state) => state.addItem);

  const handleAddToComparison = (trim: Vehicle) => {
    const success = addToComparison(vehicleToComparisonItem(trim));
    if (success) {
      // Optional: Show success message or navigate to comparison page
      console.log('Added to comparison:', trim.trim_name);
    }
  };

  const handleBookTrim = (trim: Vehicle) => {
    const success = addToBooking(vehicleToBookingItem(trim));
    if (success) {
      // Navigate to booking page
      router.push(`/${locale}/bookings/new?trim=${trim.id}`);
    }
  };

  const handleSimilarVehicleClick = (similar: any) => {
    const slug = generateSlug(similar.models.brands.name, similar.models.name, similar.model_year);
    router.push(`/${locale}/vehicles/${slug}`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        sx={{ 
          mb: 3,
          '& .MuiBreadcrumbs-separator': {
            mx: 1,
          },
        }}
      >
        <Link 
          component={NextLink} 
          href={`/${locale}`} 
          underline="hover" 
          color="inherit"
          sx={{ 
            fontWeight: 500,
            '&:hover': { color: 'primary.main' },
          }}
        >
          {language === 'ar' ? 'الرئيسية' : 'Home'}
        </Link>
        <Link 
          component={NextLink} 
          href={`/${locale}`} 
          underline="hover" 
          color="inherit"
          sx={{ 
            fontWeight: 500,
            '&:hover': { color: 'primary.main' },
          }}
        >
          {language === 'ar' ? 'المركبات' : 'Vehicles'}
        </Link>
        <Typography color="text.primary" sx={{ fontWeight: 600 }}>
          {vehicle.models.brands.name} {vehicle.models.name} {vehicle.model_year}
        </Typography>
      </Breadcrumbs>

      {/* Hero Section */}
      <VehicleHero vehicle={vehicle} trims={trims} />

      {/* Trim Comparison */}
      <Box sx={{ mb: 4 }}>
        <TrimComparison trims={trims} onBookTrim={handleBookTrim} onAddToComparison={handleAddToComparison} />
      </Box>

      {/* Similar Vehicles */}
      {similarVehicles.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
            {language === 'ar'
              ? `مركبات ${vehicle.models.brands.name} أخرى`
              : `Other ${vehicle.models.brands.name} Models`}
          </Typography>
          <Grid container spacing={3}>
            {similarVehicles.map((similar) => (
              <Grid item key={similar.id} xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    cursor: 'pointer',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
                    },
                  }} 
                  onClick={() => handleSimilarVehicleClick(similar)}
                  elevation={0}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={getVehicleImage(similar.models.hero_image_url)}
                    alt={`${similar.models.name} ${similar.model_year}`}
                    sx={{ objectFit: 'cover', objectPosition: 'center 85%' }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: '1rem' }}>
                      {similar.models.name} {similar.model_year}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                      {language === 'ar' ? 'جنيه' : 'EGP'} {similar.price_egp.toLocaleString()}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button 
                      size="medium" 
                      fullWidth 
                      variant="outlined"
                      sx={{ 
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
}

/**
 * Generate slug from brand, model, and year
 */
function generateSlug(brandName: string, modelName: string, year: number): string {
  const brandSlug = brandName.toLowerCase().replace(/\s+/g, '-');
  const modelSlug = modelName.toLowerCase().replace(/\s+/g, '-');
  return `${brandSlug}-${modelSlug}-${year}`;
}
