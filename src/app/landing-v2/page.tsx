'use client';

import { useEffect, useState, useMemo } from 'react';
import { Container, Grid, Typography, Box, CircularProgress } from '@mui/material';
import Header from '@/components/Header';
import VehicleCard from '@/components/VehicleCard';
import FilterPanel from '@/components/FilterPanel';
import VehicleSearch, { SearchFilters } from '@/components/catalog/VehicleSearch';
import CatalogToolbar from '@/components/catalog/CatalogToolbar';
import LiquidHeroHybrid from '@/components/LiquidHeroHybrid';
import { vehicleRepository } from '@/repositories/vehicleRepository';
import { Vehicle } from '@/types/vehicle';
import { useLanguageStore } from '@/stores/language-store';
import { useFilterStore } from '@/stores/filter-store';

/**
 * Landing Page V2 - Hero Redesign with Catalog Integration
 * Features liquid hero section with embedded catalog functionality
 */
export default function LandingV2Page() {
  const language = useLanguageStore((state) => state.language);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ searchTerm: '' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [gridColumns, setGridColumns] = useState<3 | 4 | 5>(4);

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

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const data = await vehicleRepository.getAll();
        setVehicles(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError(language === 'ar' ? 'فشل تحميل المركبات' : 'Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [language]);

  const filteredVehicles = useMemo(() => {
    let result = [...vehicles];

    // Apply search filter
    if (searchFilters.searchTerm) {
      const term = searchFilters.searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          v.brand_name?.toLowerCase().includes(term) ||
          v.model_name?.toLowerCase().includes(term) ||
          v.trim_name?.toLowerCase().includes(term)
      );
    }

    // Apply store filters
    if (brands.length > 0) {
      result = result.filter((v) => brands.includes(v.brand_name || ''));
    }

    if (priceRange[0] > 0 || priceRange[1] < 10000000) {
      result = result.filter(
        (v) => v.price_egp >= priceRange[0] && v.price_egp <= priceRange[1]
      );
    }

    // Sort
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price_egp - b.price_egp);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price_egp - a.price_egp);
    } else if (sortBy === 'name_asc') {
      result.sort((a, b) => (a.brand_name || '').localeCompare(b.brand_name || ''));
    }

    return result;
  }, [vehicles, searchFilters, brands, priceRange, sortBy]);

  return (
    <Box sx={{ minHeight: '100vh', background: 'white' }}>
      <Header />
      <LiquidHeroHybrid />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <VehicleSearch onFilterChange={setSearchFilters} />
        
        <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
          <FilterPanel />
          
          <Box sx={{ flex: 1 }}>
            <CatalogToolbar
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              gridColumns={gridColumns}
              onGridColumnsChange={setGridColumns}
              totalCount={filteredVehicles.length}
            />

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error" sx={{ textAlign: 'center', py: 4 }}>
                {error}
              </Typography>
            ) : (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {filteredVehicles.map((vehicle) => (
                  <Grid item xs={12} sm={6} md={12 / gridColumns} key={vehicle.id}>
                    <VehicleCard vehicle={vehicle} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
