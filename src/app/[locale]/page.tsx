'use client';

import { useEffect, useState, useMemo } from 'react';
import { Container, Grid, Typography, Box, Button } from '@mui/material';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import VehicleCard from '@/components/VehicleCard';
import VehicleSearch, { SearchFilters } from '@/components/catalog/VehicleSearch';
import CatalogToolbar from '@/components/catalog/CatalogToolbar';
import CatalogHero from '@/components/catalog/CatalogHero';
import CatalogTabs from '@/components/catalog/CatalogTabs';
import StickySearchBar from '@/components/catalog/StickySearchBar';
import { TabPanel, BrandTabPanel, TypeTabPanel, PriceTabPanel, ElectricTabPanel } from '@/components/catalog/TabPanels';
import { SkeletonCard } from '@/components/skeletons';
import FilterPanelSkeleton from '@/components/skeletons/FilterPanelSkeleton';
import { vehicleRepository } from '@/repositories/vehicleRepository';
import { Vehicle, AggregatedVehicle } from '@/types/vehicle';
import { useLanguageStore } from '@/stores/language-store';
import { useFilterStore } from '@/stores/filter-store';
import { useParams } from 'next/navigation';

// Lazy load FilterPanel with transparent skeleton (Amazon-style: no visible flash)
// Client-side only: uses localStorage for filter persistence
const FilterPanel = dynamic(() => import('@/components/FilterPanel'), {
  ssr: false,
  loading: () => <FilterPanelSkeleton sx={{ opacity: 0 }} />,
});

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
  const [gridColumns, setGridColumns] = useState<3 | 4 | 5>(3); // Changed default from 4 to 3 for better spacing
  const [activeTab, setActiveTab] = useState(0);

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

  // Get unique brands count (moved before early returns to fix hooks violation)
  const uniqueBrands = useMemo(() => {
    const brandSet = new Set(vehicles.map(v => v.models.brands.name));
    return brandSet.size;
  }, [vehicles]);

  // Get unique brands and types for tab panels (moved before early returns)
  const uniqueBrandsList = useMemo(() => {
    const brandSet = new Set(vehicles.map(v => v.models.brands.name));
    return Array.from(brandSet);
  }, [vehicles]);

  const uniqueTypesList = useMemo(() => {
    const typeSet = new Set(vehicles.map(v => v.categories?.name).filter(Boolean));
    return Array.from(typeSet) as string[];
  }, [vehicles]);

  const priceStats = useMemo(() => {
    if (vehicles.length === 0) return { min: 0, max: 5000000 };
    const prices = vehicles.map(v => v.price_egp);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [vehicles]);

  // Aggregate trims into model-level cards
  const aggregatedVehicles = useMemo(() => {
    const grouped = vehicles.reduce((acc, vehicle) => {
      // Skip vehicles without model_id or essential data
      if (!vehicle.model_id || !vehicle.models?.name || !vehicle.models?.brands?.name) {
        console.warn('Skipping vehicle with incomplete data:', vehicle.id, vehicle.trim_name);
        return acc;
      }

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

      // Search brand, model, year only (NOT trim names - too many false positives)
      // Example: "AU" in "AUTO", "LUXURY" caused BYD F3 to match "Audi"
      const matchesSearch = (
        brandName.includes(query) ||
        modelName.includes(query) ||
        modelYear.includes(query)
      );

      if (!matchesSearch) {
        return false;
      }

      // When search term is active, skip FilterPanel filters to search ALL vehicles
      // This prevents confusion when persistent FilterPanel selections interfere
      // Apply only VehicleSearch advanced filters below
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
    // Skip FilterPanel filters when VehicleSearch has an active search term
    // This allows searching across ALL vehicles, not just the filtered subset
    const hasActiveSearch = searchFilters.searchTerm?.trim().length > 0;

    if (!hasActiveSearch) {
      // Normalize brand name for comparison (handle "Mercedes-Benz" vs "Mercedes Benz" etc.)
      const normalizeBrand = (name: string) => name.replace(/[-–—\s]/g, '').toLowerCase();
      const vehicleBrandNormalized = normalizeBrand(vehicle.models.brands.name);
      const hasBrandMatch = filters.brands.length === 0 ||
        filters.brands.some(b => normalizeBrand(b) === vehicleBrandNormalized);

      if (!hasBrandMatch) {
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
          {/* Transparent skeleton - reserves space without visible flash (Amazon-style) */}
          <Box sx={{ mb: 4, opacity: 0 }}>
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
              opacity: 0, // Transparent skeleton layer
            }}
          >
            {/* Filter panel placeholder - invisible but reserves space */}
            <Grid item sx={{ xs: 12 }}>
              <Box sx={{ height: 400, bgcolor: 'background.paper', borderRadius: 1 }} />
            </Grid>

            {/* Skeleton vehicle cards - invisible but reserves layout space */}
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

  // Handle category click from hero
  const handleCategoryClick = (category: string) => {
    // Map category to body style filter
    const categoryMap: Record<string, string> = {
      suv: 'SUV',
      sedan: 'Sedan',
      hatchback: 'Hatchback',
      electric: 'Electric', // This would need fuel type filter
    };
    
    const bodyStyleName = categoryMap[category];
    if (bodyStyleName && bodyStyleName !== 'Electric') {
      useFilterStore.getState().setFilters({ bodyStyles: [bodyStyleName] });
    } else if (bodyStyleName === 'Electric') {
      useFilterStore.getState().setFilters({ fuelTypes: ['Electric'] });
    }
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    // Map tab to appropriate view
    const tabMap: Record<string, number> = {
      all: 0,
      brand: 1,
      type: 2,
      price: 3,
      electric: 4,
    };
    setActiveTab(tabMap[tab] || 0);
  };

  return (
    <>
      <Header />
      
      {/* Catalog Hero Section */}
      <CatalogHero
        totalModels={aggregatedVehicles.length}
        totalBrands={uniqueBrands}
        onCategoryClick={handleCategoryClick}
      />

      {/* Sticky Search Bar */}
      <StickySearchBar
        vehicles={vehicles}
        onSearch={(query) => setSearchFilters({ searchTerm: query })}
      />

      {/* Catalog Tabs */}
      <CatalogTabs onTabChange={handleTabChange} />

      <Container
        maxWidth="xl"
        sx={{
          // Mobile-first responsive padding (Expo-compatible approach)
          // Mobile: Tight padding (12px) - maximize screen real estate
          // Tablet: Comfortable padding (24px) - more breathing room
          // Desktop: Generous padding (32px) - professional spacing
          px: { xs: 1.5, sm: 3, md: 4 },
          py: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          {/* All Vehicles - Show search and filters */}
          <VehicleSearch
            vehicles={vehicles}
            onSearch={setSearchFilters}
            totalResults={filteredVehicles.length}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {/* By Brand */}
          <BrandTabPanel brands={uniqueBrandsList} />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {/* By Type */}
          <TypeTabPanel types={uniqueTypesList} />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {/* By Price */}
          <PriceTabPanel minPrice={priceStats.min} maxPrice={priceStats.max} />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          {/* Electric/Hybrid */}
          <ElectricTabPanel />
        </TabPanel>

        {/* Show search for non-All tabs */}
        {activeTab !== 0 && (
          <Box sx={{ mt: 3 }}>
            <VehicleSearch
              vehicles={vehicles}
              onSearch={setSearchFilters}
              totalResults={filteredVehicles.length}
            />
          </Box>
        )}

        <Grid
          container
          spacing={3}
          sx={{
            display: { xs: 'block', md: 'grid' },
            gridTemplateColumns: { xs: '1fr', md: '250px 1fr' },
            // Mobile-first responsive gap (Expo-compatible approach)
            // Mobile: Stacked layout (no gap needed)
            // Tablet/Desktop: 24px gap between filter panel and content
            gap: { xs: 2, md: 3 },
            mt: 2,
          }}
        >
          <Grid item sx={{ xs: 12 }}>
            <FilterPanel vehicles={vehicles} />
          </Grid>

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
              <Grid
                container
                spacing={{
                  xs: 2, // Mobile: 16px spacing (tight but comfortable for small screens)
                  sm: 3, // Tablet: 24px spacing (more breathing room)
                  md: 4, // Desktop: 32px spacing (generous spacing for clarity)
                }}
                sx={{
                  // Mobile-first responsive grid
                  // Touch-friendly: Minimum 44px tap targets (iOS/Android HIG compliant)
                  '& .MuiGrid-item': {
                    minHeight: { xs: 44, sm: 'auto' },
                  },
                }}
              >
                {filteredVehicles.map((vehicle, index) => (
                  <Grid
                    item
                    key={vehicle.id}
                    // Mobile-first column distribution (Expo-compatible approach)
                    // xs (0-600px): 1 column (100% width) - Phones
                    // sm (600-900px): 2 columns (50% width) - Large phones/small tablets
                    // md (900-1200px): 2 columns (50% width) - Tablets
                    // lg (1200-1536px): Dynamic (3-5 columns) - Small desktops
                    // xl (1536px+): Dynamic (3-5 columns) - Large desktops
                    xs={12}
                    sm={6}
                    md={6}
                    lg={gridColumns === 3 ? 4 : gridColumns === 4 ? 3 : 2.4}
                    xl={gridColumns === 3 ? 3 : gridColumns === 4 ? 2.4 : 2}
                  >
                    <VehicleCard vehicle={vehicle} position={index} />
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
