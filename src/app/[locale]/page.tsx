'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { Container, Grid, Typography, Box, Button } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import Header from '@/components/Header';
import VehicleCard from '@/components/VehicleCard';
import FilterPanel from '@/components/FilterPanel';
import VehicleSearch, { SearchFilters } from '@/components/catalog/VehicleSearch';
import CatalogToolbar from '@/components/catalog/CatalogToolbar';
import HeroSection from '@/components/HeroSection';
import CategoryCard from '@/components/CategoryCard';
import QuickFilters from '@/components/QuickFilters';
import BottomNav from '@/components/BottomNav';
import { SkeletonCard } from '@/components/skeletons';
import { vehicleRepository } from '@/repositories/vehicleRepository';
import { Vehicle, AggregatedVehicle } from '@/types/vehicle';
import { useLanguageStore } from '@/stores/language-store';
import { useFilterStore } from '@/stores/filter-store';
import { useParams } from 'next/navigation';

/**
 * Main catalog page component with filtering, sorting, and vehicle grid
 */
export default function CatalogPage() {
  const params = useParams();
  const locale = params.locale as string;
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ searchTerm: '' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [gridColumns, setGridColumns] = useState<3 | 4 | 5>(4);
  const searchRef = useRef<HTMLDivElement>(null);

  // Use persistent filter store
  const brands = useFilterStore((state) => state.brands);
  const priceRange = useFilterStore((state) => state.priceRange);
  const categories = useFilterStore((state) => state.categories);
  const bodyStyles = useFilterStore((state) => state.bodyStyles);
  const fuelTypes = useFilterStore((state) => state.fuelTypes);
  const transmissions = useFilterStore((state) => state.transmissions);
  const bodyStyle = useFilterStore((state) => state.bodyStyle);
  const segmentCode = useFilterStore((state) => state.segmentCode);
  const agent = useFilterStore((state) => state.agent);
  const sortBy = useFilterStore((state) => state.sortBy);
  const filters = { brands, priceRange, categories, bodyStyles, fuelTypes, transmissions, bodyStyle, segmentCode, agent };

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

  // Aggregate trims into model-level cards
  const aggregatedVehicles = useMemo(() => {
    const grouped = vehicles.reduce((acc, vehicle) => {
      const modelKey = vehicle.model_id;
      
      if (!acc[modelKey]) {
        acc[modelKey] = {
          ...vehicle,
          modelId: modelKey,
          trims: [vehicle],
          minPrice: vehicle.price_egp,
          maxPrice: vehicle.price_egp,
          trimCount: 1,
          trimNames: vehicle.trim_name,
        } as AggregatedVehicle;
      } else {
        acc[modelKey].trims.push(vehicle);
        acc[modelKey].minPrice = Math.min(acc[modelKey].minPrice, vehicle.price_egp);
        acc[modelKey].maxPrice = Math.max(acc[modelKey].maxPrice, vehicle.price_egp);
        acc[modelKey].trimCount++;
        acc[modelKey].trimNames += `, ${vehicle.trim_name}`;
      }
      
      return acc;
    }, {} as Record<string, AggregatedVehicle>);

    return Object.values(grouped);
  }, [vehicles]);

  const filteredVehicles = aggregatedVehicles.filter((vehicle: AggregatedVehicle) => {
    // Search filters from VehicleSearch component
    if (searchFilters.searchTerm) {
      const query = searchFilters.searchTerm.toLowerCase().trim();
      const brandName = vehicle.models.brands.name?.toLowerCase() || '';
      const modelName = vehicle.models.name?.toLowerCase() || '';
      const modelYear = vehicle.model_year?.toString() || '';

      const matchesSearch = (
        brandName.includes(query) ||
        modelName.includes(query) ||
        modelYear.includes(query)
      );

      if (!matchesSearch) {
        return false;
      }
    }

    if (searchFilters.brandId && vehicle.models.brands.name !== searchFilters.brandId) {
      return false;
    }

    if (searchFilters.modelId && vehicle.model_id !== searchFilters.modelId) {
      return false;
    }

    if (searchFilters.year && vehicle.model_year !== searchFilters.year) {
      return false;
    }

    if (searchFilters.bodyType && vehicle.body_styles?.name_en !== searchFilters.bodyType) {
      return false;
    }

    if (searchFilters.fuelType && vehicle.fuel_types?.name !== searchFilters.fuelType) {
      return false;
    }

    if (searchFilters.transmission && vehicle.transmissions?.name !== searchFilters.transmission) {
      return false;
    }

    if (searchFilters.minPrice && vehicle.maxPrice < searchFilters.minPrice) {
      return false;
    }

    if (searchFilters.maxPrice && vehicle.minPrice > searchFilters.maxPrice) {
      return false;
    }

    if (searchFilters.minHorsepower) {
      const hasEnoughPower = vehicle.trims.some(t => t.horsepower && t.horsepower >= searchFilters.minHorsepower!);
      if (!hasEnoughPower) {
        return false;
      }
    }

    if (searchFilters.maxHorsepower) {
      const withinPowerLimit = vehicle.trims.some(t => t.horsepower && t.horsepower <= searchFilters.maxHorsepower!);
      if (!withinPowerLimit) {
        return false;
      }
    }

    if (searchFilters.seats) {
      const hasSeats = vehicle.trims.some(t => t.seats === searchFilters.seats);
      if (!hasSeats) {
        return false;
      }
    }

    // FilterPanel filters (multi-select)
    if (filters.brands.length > 0 && !filters.brands.includes(vehicle.models.brands.name)) {
      return false;
    }

    if (vehicle.maxPrice < filters.priceRange[0] || vehicle.minPrice > filters.priceRange[1]) {
      return false;
    }

    if (filters.categories.length > 0 && !vehicle.categories?.name) {
      return false;
    }
    if (filters.categories.length > 0 && !filters.categories.includes(vehicle.categories!.name)) {
      return false;
    }

    if (filters.bodyStyles.length > 0 && !vehicle.body_styles?.name_en) {
      return false;
    }
    if (filters.bodyStyles.length > 0 && !filters.bodyStyles.includes(vehicle.body_styles!.name_en)) {
      return false;
    }

    if (filters.fuelTypes.length > 0 && !vehicle.fuel_types?.name) {
      return false;
    }
    if (filters.fuelTypes.length > 0 && !filters.fuelTypes.includes(vehicle.fuel_types!.name)) {
      return false;
    }

    if (filters.transmissions.length > 0 && !vehicle.transmissions?.name) {
      return false;
    }
    if (filters.transmissions.length > 0 && !filters.transmissions.includes(vehicle.transmissions!.name)) {
      return false;
    }

    if (filters.bodyStyle && vehicle.body_styles?.name_en !== filters.bodyStyle) {
      return false;
    }

    if (filters.segmentCode && vehicle.segments?.code !== filters.segmentCode) {
      return false;
    }

    if (filters.agent && vehicle.agents?.name_en !== filters.agent) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.minPrice - b.minPrice;
      case 'price_desc':
        return b.minPrice - a.minPrice;
      case 'year_desc':
        return b.model_year - a.model_year;
      case 'year_asc':
        return a.model_year - b.model_year;
      case 'brand_asc':
        return a.models.brands.name.localeCompare(b.models.brands.name);
      case 'brand_desc':
        return b.models.brands.name.localeCompare(a.models.brands.name);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <>
        <Header />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Skeleton search bar */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </Typography>
          </Box>

          <Grid
            container
            spacing={3}
            sx={{
              display: { xs: 'block', md: 'grid' },
              gridTemplateColumns: { xs: '1fr', md: '250px 1fr' },
              gap: 3,
            }}
          >
            {/* Filter panel placeholder */}
            <Grid item sx={{ xs: 12 }}>
              <Box sx={{ height: 400, bgcolor: 'background.paper', borderRadius: 1 }} />
            </Grid>

            {/* Skeleton vehicle cards */}
            <Grid item sx={{ xs: 12 }}>
              <Grid container spacing={3}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                    <SkeletonCard />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="h5" color="error" gutterBottom>
              {language === 'ar' ? 'عذراً، حدث خطأ' : 'Oops! Something went wrong'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
              {language === 'ar'
                ? 'لم نتمكن من تحميل المركبات. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.'
                : "We couldn't load the vehicles. Please check your internet connection and try again."}
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
            </Button>
            {error && (
              <Typography variant="caption" color="text.disabled" sx={{ mt: 2 }}>
                {language === 'ar' ? 'تفاصيل الخطأ: ' : 'Error details: '}
                {error}
              </Typography>
            )}
          </Box>
        </Container>
      </>
    );
  }

  const handleSearchClick = () => {
    searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Header />
      
      {/* Hero Section - Mobile First */}
      <HeroSection onSearchClick={handleSearchClick} />

      {/* Category Cards - Mobile First */}
      <Container maxWidth="xl" sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <CategoryCard
              icon={DirectionsCarIcon}
              labelEn="New Cars"
              labelAr="سيارات جديدة"
              count={filteredVehicles.length}
              onClick={() => {
                // Filter logic can be added here
                handleSearchClick();
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <CategoryCard
              icon={ElectricCarIcon}
              labelEn="Electric"
              labelAr="كهربائية"
              count={vehicles.filter(v => v.fuel_types?.name === 'Electric').length}
              onClick={() => {
                useFilterStore.getState().setFilters({ fuelTypes: ['Electric'] });
                handleSearchClick();
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <CategoryCard
              icon={LocalShippingIcon}
              labelEn="SUVs"
              labelAr="دفع رباعي"
              count={vehicles.filter(v => v.body_styles?.name_en === 'SUV').length}
              onClick={() => {
                useFilterStore.getState().setFilters({ bodyStyles: ['SUV'] });
                handleSearchClick();
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <CategoryCard
              icon={TwoWheelerIcon}
              labelEn="Sedans"
              labelAr="سيدان"
              count={vehicles.filter(v => v.body_styles?.name_en === 'Sedan').length}
              onClick={() => {
                useFilterStore.getState().setFilters({ bodyStyles: ['Sedan'] });
                handleSearchClick();
              }}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Search & Filters Section */}
      <Box ref={searchRef}>
        <Container maxWidth="xl" sx={{ mb: 2 }}>
          <VehicleSearch
            vehicles={vehicles}
            onSearch={setSearchFilters}
            totalResults={filteredVehicles.length}
          />
        </Container>

        {/* Quick Filters - Sticky on Mobile */}
        <QuickFilters />
      </Box>

      {/* Main Content Area */}
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 } }}>
        <Grid
          container
          spacing={3}
          sx={{
            display: { xs: 'block', md: 'grid' },
            gridTemplateColumns: { xs: '1fr', md: '250px 1fr' },
            gap: 3,
          }}
        >
          {/* Filter Panel - Desktop Only */}
          <Grid item sx={{ display: { xs: 'none', md: 'block' } }}>
            <FilterPanel vehicles={vehicles} />
          </Grid>

          {/* Vehicle Grid */}
          <Grid item sx={{ xs: 12 }}>
            {/* Catalog Toolbar */}
            <CatalogToolbar
              totalCount={filteredVehicles.length}
              viewMode={viewMode}
              gridColumns={gridColumns}
              sortBy={sortBy}
              onViewModeChange={setViewMode}
              onGridColumnsChange={setGridColumns}
              onSortChange={(sort) => useFilterStore.getState().setFilters({ sortBy: sort })}
            />

            {filteredVehicles.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={{ xs: 2, md: 3 }}>
                {filteredVehicles.map((vehicle) => (
                  <Grid
                    item
                    key={vehicle.id}
                    xs={12}
                    sm={6}
                    md={gridColumns === 3 ? 4 : gridColumns === 4 ? 3 : 2.4}
                  >
                    <VehicleCard vehicle={vehicle} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />
    </>
  );
}
