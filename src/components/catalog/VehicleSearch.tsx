'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  Paper,
  Collapse,
  Grid,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Vehicle } from '@/types/vehicle';
import { useTranslation } from 'react-i18next';

interface VehicleSearchProps {
  vehicles: Vehicle[];
  onSearch: (filters: SearchFilters) => void;
  totalResults: number;
}

export interface SearchFilters {
  // Simple search
  searchTerm: string;
  brandId?: string;
  year?: number;
  bodyType?: string;

  // Advanced search
  modelId?: string;
  fuelType?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  minHorsepower?: number;
  maxHorsepower?: number;
  seats?: number;
  isElectric?: boolean;
  isHybrid?: boolean;
}

/**
 * Two-tier vehicle search component (Simple + Advanced)
 * @param props - Component props
 * @param props.vehicles - Available vehicles for filter options
 * @param props.onSearch - Search callback
 * @param props.totalResults - Current result count
 */
export default function VehicleSearch({ vehicles, onSearch, totalResults }: VehicleSearchProps) {
  const { t } = useTranslation();
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
  });

  // Extract unique brands
  const brands = useMemo(() => {
    const brandMap = new Map<string, { id: string; name: string }>();
    vehicles.forEach((v) => {
      if (v.models?.brands?.name) {
        // Use brand name as ID for now (can be updated to use actual brand_id if available)
        const brandName = v.models.brands.name;
        if (!brandMap.has(brandName)) {
          brandMap.set(brandName, { id: brandName, name: brandName });
        }
      }
    });
    return Array.from(brandMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [vehicles]);

  // Extract unique models (filtered by selected brand in advanced mode)
  const models = useMemo(() => {
    if (!filters.brandId) return [];

    const modelMap = new Map<string, { id: string; name: string }>();
    vehicles.forEach((v) => {
      if (v.models?.brands?.name === filters.brandId && v.models?.name) {
        const modelId = v.model_id;
        const modelName = v.models.name;
        if (!modelMap.has(modelId)) {
          modelMap.set(modelId, { id: modelId, name: modelName });
        }
      }
    });
    return Array.from(modelMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [vehicles, filters.brandId]);

  // Extract unique years
  const years = useMemo(() => {
    const yearSet = new Set<number>();
    vehicles.forEach((v) => {
      if (v.model_year) {
        yearSet.add(v.model_year);
      }
    });
    return Array.from(yearSet).sort((a, b) => b - a); // Newest first
  }, [vehicles]);

  // Extract unique body types
  const bodyTypes = useMemo(() => {
    const typeSet = new Set<string>();
    vehicles.forEach((v) => {
      if (v.body_styles?.name_en) {
        typeSet.add(v.body_styles.name_en);
      }
    });
    return Array.from(typeSet).sort();
  }, [vehicles]);

  // Extract unique fuel types
  const fuelTypes = useMemo(() => {
    const typeSet = new Set<string>();
    vehicles.forEach((v) => {
      if (v.fuel_types?.name) {
        typeSet.add(v.fuel_types.name);
      }
    });
    return Array.from(typeSet).sort();
  }, [vehicles]);

  // Extract unique transmissions
  const transmissions = useMemo(() => {
    const transSet = new Set<string>();
    vehicles.forEach((v) => {
      if (v.transmissions?.name) {
        transSet.add(v.transmissions.name);
      }
    });
    return Array.from(transSet).sort();
  }, [vehicles]);

  // Extract unique seat counts
  const seatOptions = useMemo(() => {
    const seatSet = new Set<number>();
    vehicles.forEach((v) => {
      if (v.seats) {
        seatSet.add(v.seats);
      }
    });
    return Array.from(seatSet).sort((a, b) => a - b);
  }, [vehicles]);

  const handleFilterChange = (key: keyof SearchFilters, value: string | number | boolean | undefined) => {
    const newFilters = { ...filters, [key]: value };

    // Reset model when brand changes
    if (key === 'brandId') {
      newFilters.modelId = undefined;
    }

    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = { searchTerm: '' };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  const handleSelectChange = (key: keyof SearchFilters) => (event: SelectChangeEvent<string | number>) => {
    const value = event.target.value === '' ? undefined : event.target.value;
    handleFilterChange(key, value as string | number | undefined);
  };

  return (
    <Paper elevation={2} sx={{ mb: 3, overflow: 'hidden' }}>
      {/* Simple Search */}
      <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={isAdvanced ? 12 : 4}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('catalog.searchPlaceholder')}
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filters.searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => handleFilterChange('searchTerm', '')}
                      edge="end"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {!isAdvanced && (
            <>
              <Grid item xs={12} sm={4} md={2.5}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('catalog.allBrands')}</InputLabel>
                  <Select
                    value={filters.brandId || ''}
                    onChange={handleSelectChange('brandId')}
                    label={t('catalog.allBrands')}
                  >
                    <MenuItem value="">
                      <em>{t('catalog.all')}</em>
                    </MenuItem>
                    {brands.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('catalog.allYears')}</InputLabel>
                  <Select
                    value={filters.year || ''}
                    onChange={handleSelectChange('year')}
                    label={t('catalog.allYears')}
                  >
                    <MenuItem value="">
                      <em>{t('catalog.all')}</em>
                    </MenuItem>
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4} md={2.5}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('catalog.allBodyTypes')}</InputLabel>
                  <Select
                    value={filters.bodyType || ''}
                    onChange={handleSelectChange('bodyType')}
                    label={t('catalog.allBodyTypes')}
                  >
                    <MenuItem value="">
                      <em>{t('catalog.all')}</em>
                    </MenuItem>
                    {bodyTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          <Grid item xs={12} md={isAdvanced ? 12 : 1}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => setIsAdvanced(!isAdvanced)}
              endIcon={isAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {isAdvanced ? t('catalog.simpleSearch') : t('catalog.advancedSearch')}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Advanced Search */}
      <Collapse in={isAdvanced}>
        <Box sx={{ p: 2, pt: 0, backgroundColor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            {t('catalog.advancedSearch')}
          </Typography>

          <Grid container spacing={2}>
            {/* Row 1: Make, Model, Year */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('catalog.make')}</InputLabel>
                <Select
                  value={filters.brandId || ''}
                  onChange={handleSelectChange('brandId')}
                  label={t('catalog.make')}
                >
                  <MenuItem value="">
                    <em>{t('catalog.all')}</em>
                  </MenuItem>
                  {brands.map((brand) => (
                    <MenuItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small" disabled={!filters.brandId}>
                <InputLabel>{t('catalog.model')}</InputLabel>
                <Select
                  value={filters.modelId || ''}
                  onChange={handleSelectChange('modelId')}
                  label={t('catalog.model')}
                >
                  <MenuItem value="">
                    <em>{t('catalog.all')}</em>
                  </MenuItem>
                  {models.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('catalog.year')}</InputLabel>
                <Select
                  value={filters.year || ''}
                  onChange={handleSelectChange('year')}
                  label={t('catalog.year')}
                >
                  <MenuItem value="">
                    <em>{t('catalog.all')}</em>
                  </MenuItem>
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Row 2: Body Type, Fuel Type, Transmission */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('catalog.bodyType')}</InputLabel>
                <Select
                  value={filters.bodyType || ''}
                  onChange={handleSelectChange('bodyType')}
                  label={t('catalog.bodyType')}
                >
                  <MenuItem value="">
                    <em>{t('catalog.all')}</em>
                  </MenuItem>
                  {bodyTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('catalog.fuelType')}</InputLabel>
                <Select
                  value={filters.fuelType || ''}
                  onChange={handleSelectChange('fuelType')}
                  label={t('catalog.fuelType')}
                >
                  <MenuItem value="">
                    <em>{t('catalog.all')}</em>
                  </MenuItem>
                  {fuelTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('catalog.transmission')}</InputLabel>
                <Select
                  value={filters.transmission || ''}
                  onChange={handleSelectChange('transmission')}
                  label={t('catalog.transmission')}
                >
                  <MenuItem value="">
                    <em>{t('catalog.all')}</em>
                  </MenuItem>
                  {transmissions.map((trans) => (
                    <MenuItem key={trans} value={trans}>
                      {trans}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Row 3: Price Range, Horsepower Range */}
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label={t('catalog.minPrice')}
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                inputProps={{ min: 0, step: 100000 }}
              />
            </Grid>

            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label={t('catalog.maxPrice')}
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                inputProps={{ min: 0, step: 100000 }}
              />
            </Grid>

            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label={t('catalog.minPower')}
                value={filters.minHorsepower || ''}
                onChange={(e) => handleFilterChange('minHorsepower', e.target.value ? Number(e.target.value) : undefined)}
                inputProps={{ min: 0, step: 10 }}
              />
            </Grid>

            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label={t('catalog.maxPower')}
                value={filters.maxHorsepower || ''}
                onChange={(e) => handleFilterChange('maxHorsepower', e.target.value ? Number(e.target.value) : undefined)}
                inputProps={{ min: 0, step: 10 }}
              />
            </Grid>

            {/* Row 4: Seats */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('catalog.seats')}</InputLabel>
                <Select
                  value={filters.seats || ''}
                  onChange={handleSelectChange('seats')}
                  label={t('catalog.seats')}
                >
                  <MenuItem value="">
                    <em>{t('catalog.any')}</em>
                  </MenuItem>
                  {seatOptions.map((seats) => (
                    <MenuItem key={seats} value={seats}>
                      {seats}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleReset}
                  sx={{ color: 'text.secondary' }}
                >
                  {t('catalog.resetAll')}
                </Button>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                  {t('catalog.resultsCount', { count: totalResults })}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
}