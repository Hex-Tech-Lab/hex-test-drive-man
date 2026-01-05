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
  Paper,
  Collapse,
  Grid,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Vehicle } from '@/types/vehicle';
import { useLanguageStore } from '@/stores/language-store';

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
  const language = useLanguageStore((state) => state.language);
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
              placeholder={language === 'ar' ? 'ابحث عن مركبة...' : 'Search vehicle...'}
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {!isAdvanced && (
            <>
              <Grid item xs={12} sm={4} md={2.5}>
                <FormControl fullWidth size="small">
                  <InputLabel>{language === 'ar' ? 'العلامة التجارية' : 'All Brands'}</InputLabel>
                  <Select
                    value={filters.brandId || ''}
                    onChange={handleSelectChange('brandId')}
                    label={language === 'ar' ? 'العلامة التجارية' : 'All Brands'}
                  >
                    <MenuItem value="">
                      <em>{language === 'ar' ? 'الكل' : 'All'}</em>
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
                  <InputLabel>{language === 'ar' ? 'السنة' : 'All Years'}</InputLabel>
                  <Select
                    value={filters.year || ''}
                    onChange={handleSelectChange('year')}
                    label={language === 'ar' ? 'السنة' : 'All Years'}
                  >
                    <MenuItem value="">
                      <em>{language === 'ar' ? 'الكل' : 'All'}</em>
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
                  <InputLabel>{language === 'ar' ? 'نوع الهيكل' : 'All Body Types'}</InputLabel>
                  <Select
                    value={filters.bodyType || ''}
                    onChange={handleSelectChange('bodyType')}
                    label={language === 'ar' ? 'نوع الهيكل' : 'All Body Types'}
                  >
                    <MenuItem value="">
                      <em>{language === 'ar' ? 'الكل' : 'All'}</em>
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
              {language === 'ar' ? (isAdvanced ? 'بسيط' : 'متقدم') : (isAdvanced ? 'Simple' : 'Advanced')}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Advanced Search */}
      <Collapse in={isAdvanced}>
        <Box sx={{ p: 2, pt: 0, backgroundColor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            {language === 'ar' ? 'البحث المتقدم' : 'Advanced Search'}
          </Typography>

          <Grid container spacing={2}>
            {/* Row 1: Make, Model, Year */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{language === 'ar' ? 'الصانع' : 'Make'}</InputLabel>
                <Select
                  value={filters.brandId || ''}
                  onChange={handleSelectChange('brandId')}
                  label={language === 'ar' ? 'الصانع' : 'Make'}
                >
                  <MenuItem value="">
                    <em>{language === 'ar' ? 'الكل' : 'All'}</em>
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
                <InputLabel>{language === 'ar' ? 'الموديل' : 'Model'}</InputLabel>
                <Select
                  value={filters.modelId || ''}
                  onChange={handleSelectChange('modelId')}
                  label={language === 'ar' ? 'الموديل' : 'Model'}
                >
                  <MenuItem value="">
                    <em>{language === 'ar' ? 'الكل' : 'All'}</em>
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
                <InputLabel>{language === 'ar' ? 'السنة' : 'Year'}</InputLabel>
                <Select
                  value={filters.year || ''}
                  onChange={handleSelectChange('year')}
                  label={language === 'ar' ? 'السنة' : 'Year'}
                >
                  <MenuItem value="">
                    <em>{language === 'ar' ? 'الكل' : 'All'}</em>
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
                <InputLabel>{language === 'ar' ? 'نوع الهيكل' : 'Body Type'}</InputLabel>
                <Select
                  value={filters.bodyType || ''}
                  onChange={handleSelectChange('bodyType')}
                  label={language === 'ar' ? 'نوع الهيكل' : 'Body Type'}
                >
                  <MenuItem value="">
                    <em>{language === 'ar' ? 'الكل' : 'All'}</em>
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
                <InputLabel>{language === 'ar' ? 'نوع الوقود' : 'Fuel Type'}</InputLabel>
                <Select
                  value={filters.fuelType || ''}
                  onChange={handleSelectChange('fuelType')}
                  label={language === 'ar' ? 'نوع الوقود' : 'Fuel Type'}
                >
                  <MenuItem value="">
                    <em>{language === 'ar' ? 'الكل' : 'All'}</em>
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
                <InputLabel>{language === 'ar' ? 'ناقل الحركة' : 'Transmission'}</InputLabel>
                <Select
                  value={filters.transmission || ''}
                  onChange={handleSelectChange('transmission')}
                  label={language === 'ar' ? 'ناقل الحركة' : 'Transmission'}
                >
                  <MenuItem value="">
                    <em>{language === 'ar' ? 'الكل' : 'All'}</em>
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
                label={language === 'ar' ? 'السعر الأدنى (جنيه)' : 'Min Price (EGP)'}
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
                label={language === 'ar' ? 'السعر الأقصى (جنيه)' : 'Max Price (EGP)'}
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
                label={language === 'ar' ? 'القوة الدنيا (حصان)' : 'Min Power (HP)'}
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
                label={language === 'ar' ? 'القوة القصوى (حصان)' : 'Max Power (HP)'}
                value={filters.maxHorsepower || ''}
                onChange={(e) => handleFilterChange('maxHorsepower', e.target.value ? Number(e.target.value) : undefined)}
                inputProps={{ min: 0, step: 10 }}
              />
            </Grid>

            {/* Row 4: Seats */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{language === 'ar' ? 'المقاعد' : 'Seats'}</InputLabel>
                <Select
                  value={filters.seats || ''}
                  onChange={handleSelectChange('seats')}
                  label={language === 'ar' ? 'المقاعد' : 'Seats'}
                >
                  <MenuItem value="">
                    <em>{language === 'ar' ? 'أي' : 'Any'}</em>
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
                  {language === 'ar' ? 'مسح الكل' : 'Reset All'}
                </Button>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                  {totalResults} {language === 'ar' ? 'موديل' : 'models'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
}
