'use client';

import { useEffect, useState } from 'react';
import { Container, Grid, Typography, Box, TextField, InputAdornment, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Header from '@/components/Header';
import VehicleCard from '@/components/VehicleCard';
import FilterPanel from '@/components/FilterPanel';
import { vehicleRepository } from '@/repositories/vehicleRepository';
import { Vehicle } from '@/types/vehicle';
import { useLanguageStore } from '@/stores/language-store';
import { useFilterStore } from '@/stores/filter-store';
import { useParams } from 'next/navigation';

export default function CatalogPage() {
  const params = useParams();
  const locale = params.locale as string;
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use persistent filter store
  const brands = useFilterStore((state) => state.brands);
  const priceRange = useFilterStore((state) => state.priceRange);
  const categories = useFilterStore((state) => state.categories);
  const bodyStyle = useFilterStore((state) => state.bodyStyle);
  const segmentCode = useFilterStore((state) => state.segmentCode);
  const agent = useFilterStore((state) => state.agent);
  const filters = { brands, priceRange, categories, bodyStyle, segmentCode, agent };

  // Scroll persistence
  useEffect(() => {
    // Restore scroll position on mount
    const savedScroll = sessionStorage.getItem('catalog_scroll_pos');
    if (savedScroll) {
      window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' });
    }

    // Save scroll position on scroll
    const handleScroll = () => {
      sessionStorage.setItem('catalog_scroll_pos', window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    }
  }, [locale, setLanguage]);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        setLoading(true);
        const { data, error: fetchError } = await vehicleRepository.getAllVehicles();
        if (fetchError) {
          setError(fetchError.message ?? 'Failed to load vehicles');
        }
        setVehicles((data as Vehicle[]) || []);
      } catch {
        setError('Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles.filter((vehicle: Vehicle) => {
    // Brand filter
    if (filters.brands.length > 0 && !filters.brands.includes(vehicle.models.brands.name)) {
      return false;
    }

    // Price filter
    if (vehicle.price_egp < filters.priceRange[0] || vehicle.price_egp > filters.priceRange[1]) {
      return false;
    }

    // Category filter
    if (filters.categories.length > 0 && !vehicle.categories?.name) {
      return false;
    }
    if (filters.categories.length > 0 && !filters.categories.includes(vehicle.categories!.name)) {
      return false;
    }

    // Body style filter
    if (filters.bodyStyle && vehicle.body_styles?.name_en !== filters.bodyStyle) {
      return false;
    }

    // Segment filter
    if (filters.segmentCode && vehicle.segments?.code !== filters.segmentCode) {
      return false;
    }

    // Agent filter
    if (filters.agent && vehicle.agents?.name_en !== filters.agent) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        vehicle.models.brands.name.toLowerCase().includes(query) ||
        vehicle.models.name.toLowerCase().includes(query) ||
        vehicle.trim_name.toLowerCase().includes(query)
      );
    }

    return true;
  });

  if (loading) {
    return (
      <>
        <Header />
        <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </Typography>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Typography variant="h6" color="error">
            {language === 'ar' ? 'فشل تحميل المركبات' : 'Failed to load vehicles'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          {language === 'ar' ? 'استكشف المركبات' : 'Explore Vehicles'}
        </Typography>

        <TextField
          fullWidth
          placeholder={language === 'ar' ? 'ابحث عن مركبة...' : 'Search for a vehicle...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <Grid
          container
          spacing={3}
          sx={{
            display: { xs: 'block', md: 'grid' },
            gridTemplateColumns: { xs: '1fr', md: '250px 1fr' },
            gap: 3,
            mt: 2, // Add some top margin
          }}
        >
          <Grid item sx={{ xs: 12 }}>
            <FilterPanel vehicles={vehicles} />
          </Grid>

          <Grid item sx={{ xs: 12 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {language === 'ar'
                ? `${filteredVehicles.length} مركبة متاحة`
                : `${filteredVehicles.length} vehicles available`}
            </Typography>

            {filteredVehicles.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredVehicles.map((vehicle) => (
                  <Grid item key={vehicle.id} xs={12} sm={6} md={4}>
                    <VehicleCard vehicle={vehicle} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
