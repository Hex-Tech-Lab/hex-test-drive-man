'use client';

import { useMemo, useCallback } from 'react';
import { Box, Typography, Checkbox, FormControlLabel, Slider, Paper, Button, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Vehicle } from '@/types/vehicle';
import { useLanguageStore } from '@/stores/language-store';
import { useFilterStore } from '@/stores/filter-store';

interface FilterPanelProps {
  vehicles: Vehicle[];
}

/**
 * Filter panel for the catalog page
 * @param props - Component props
 * @param props.vehicles - List of available vehicles for filter aggregation
 */
export default function FilterPanel({ vehicles }: FilterPanelProps) {
  const language = useLanguageStore((state) => state.language);
  
  // Use persistent filter store
  const selectedBrands = useFilterStore((state) => state.brands);
  const selectedCategories = useFilterStore((state) => state.categories);
  const selectedBodyStyles = useFilterStore((state) => state.bodyStyles);
  const selectedFuelTypes = useFilterStore((state) => state.fuelTypes);
  const selectedTransmissions = useFilterStore((state) => state.transmissions);
  const priceRange = useFilterStore((state) => state.priceRange);
  const setFilters = useFilterStore((state) => state.setFilters);

  // Extract unique brands from live data
  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>();
    vehicles.forEach((v) => {
      if (v.models?.brands?.name) {
        brandSet.add(v.models.brands.name);
      }
    });
    return Array.from(brandSet).sort();
  }, [vehicles]);

  // Extract unique categories from live data (cascaded by brand selection)
  const availableCategories = useMemo(() => {
    const catSet = new Set<string>();
    vehicles.forEach((v) => {
      // Cascade: Only include categories from selected brands (if any selected)
      if (selectedBrands.length > 0 && !selectedBrands.includes(v.models?.brands?.name || '')) {
        return;
      }
      if (v.categories?.name) {
        catSet.add(v.categories.name);
      }
    });
    return Array.from(catSet).sort();
  }, [vehicles, selectedBrands]);

  // Extract unique body styles from live data (cascaded by brand selection)
  const availableBodyStyles = useMemo(() => {
    const styleSet = new Set<string>();
    vehicles.forEach((v) => {
      // Cascade: Only include body styles from selected brands (if any selected)
      if (selectedBrands.length > 0 && !selectedBrands.includes(v.models?.brands?.name || '')) {
        return;
      }
      if (v.body_styles?.name_en) {
        styleSet.add(v.body_styles.name_en);
      }
    });
    return Array.from(styleSet).sort();
  }, [vehicles, selectedBrands]);

  // Extract unique fuel types from live data (cascaded by brand selection)
  const availableFuelTypes = useMemo(() => {
    const fuelSet = new Set<string>();
    vehicles.forEach((v) => {
      // Cascade: Only include fuel types from selected brands (if any selected)
      if (selectedBrands.length > 0 && !selectedBrands.includes(v.models?.brands?.name || '')) {
        return;
      }
      if (v.fuel_types?.name) {
        fuelSet.add(v.fuel_types.name);
      }
    });
    return Array.from(fuelSet).sort();
  }, [vehicles, selectedBrands]);

  // Extract unique transmissions from live data (cascaded by brand selection)
  const availableTransmissions = useMemo(() => {
    const transSet = new Set<string>();
    vehicles.forEach((v) => {
      // Cascade: Only include transmissions from selected brands (if any selected)
      if (selectedBrands.length > 0 && !selectedBrands.includes(v.models?.brands?.name || '')) {
        return;
      }
      if (v.transmissions?.name) {
        transSet.add(v.transmissions.name);
      }
    });
    return Array.from(transSet).sort();
  }, [vehicles, selectedBrands]);

  // Extract unique years from live data (cascaded by brand selection)
  const availableYears = useMemo(() => {
    const yearSet = new Set<number>();
    vehicles.forEach((v) => {
      // Cascade: Only include years from selected brands (if any selected)
      if (selectedBrands.length > 0 && !selectedBrands.includes(v.models?.brands?.name || '')) {
        return;
      }
      if (v.model_year) {
        yearSet.add(v.model_year);
      }
    });
    return Array.from(yearSet).sort((a, b) => b - a); // Newest first
  }, [vehicles, selectedBrands]);

  // Dynamic max price based on available vehicles (cascaded by brand selection)
  const maxPrice = useMemo(() => {
    if (vehicles.length === 0) return 20_000_000;
    const filteredForPrice = selectedBrands.length > 0
      ? vehicles.filter(v => selectedBrands.includes(v.models?.brands?.name || ''))
      : vehicles;
    const prices = filteredForPrice.map(v => v.price_egp).filter(p => p > 0);
    return prices.length > 0 ? Math.max(...prices) : 20_000_000;
  }, [vehicles, selectedBrands]);

  // Dynamic min price based on available vehicles (cascaded by brand selection)
  const minPrice = useMemo(() => {
    if (vehicles.length === 0) return 0;
    const filteredForPrice = selectedBrands.length > 0
      ? vehicles.filter(v => selectedBrands.includes(v.models?.brands?.name || ''))
      : vehicles;
    const prices = filteredForPrice.map(v => v.price_egp).filter(p => p > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  }, [vehicles, selectedBrands]);

  // PERF-011 FIX: Memoize handlers to prevent re-renders and batch DOM updates
  const handleBrandToggle = useCallback((brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    
    // Use requestAnimationFrame to batch DOM updates and prevent forced reflow
    requestAnimationFrame(() => {
      setFilters({ brands: newBrands });
    });
  }, [selectedBrands, setFilters]);

  const handleCategoryToggle = useCallback((category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];

    requestAnimationFrame(() => {
      setFilters({ categories: newCategories });
    });
  }, [selectedCategories, setFilters]);

  const handleBodyStyleToggle = useCallback((style: string) => {
    const newStyles = selectedBodyStyles.includes(style)
      ? selectedBodyStyles.filter((s) => s !== style)
      : [...selectedBodyStyles, style];

    requestAnimationFrame(() => {
      setFilters({ bodyStyles: newStyles });
    });
  }, [selectedBodyStyles, setFilters]);

  const handleFuelTypeToggle = useCallback((fuel: string) => {
    const newFuels = selectedFuelTypes.includes(fuel)
      ? selectedFuelTypes.filter((f) => f !== fuel)
      : [...selectedFuelTypes, fuel];

    requestAnimationFrame(() => {
      setFilters({ fuelTypes: newFuels });
    });
  }, [selectedFuelTypes, setFilters]);

  const handleTransmissionToggle = useCallback((trans: string) => {
    const newTrans = selectedTransmissions.includes(trans)
      ? selectedTransmissions.filter((t) => t !== trans)
      : [...selectedTransmissions, trans];

    requestAnimationFrame(() => {
      setFilters({ transmissions: newTrans });
    });
  }, [selectedTransmissions, setFilters]);

  const handlePriceChange = useCallback((_event: Event, newValue: number | number[]) => {
    const newRange = newValue as [number, number];
    requestAnimationFrame(() => {
      setFilters({ priceRange: newRange });
    });
  }, [setFilters]);

  const handleReset = useCallback(() => {
    requestAnimationFrame(() => {
      setFilters({
        brands: [],
        categories: [],
        bodyStyles: [],
        fuelTypes: [],
        transmissions: [],
        priceRange: [minPrice, maxPrice],
      });
    });
  }, [minPrice, maxPrice, setFilters]);

  const formatPrice = (value: number): string => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(0)}K`;
    }
    return `${value}`;
  };

  // Compact styles
  const accordionSummaryStyle = {
    margin: '0',
    minHeight: '40px',
    '& .MuiAccordionSummary-content': { margin: '8px 0' },
  };
  
  const sectionTitleStyle = {
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    color: 'text.secondary',
  };

  const checkboxLabelStyle = {
    '& .MuiTypography-root': { fontSize: '13px' },
    '& .MuiCheckbox-root': { padding: '4px' },
    marginLeft: language === 'ar' ? 0 : '-8px',
    marginRight: language === 'ar' ? '-8px' : 0,
  };

  return (
    <Box sx={{
      position: { xs: 'relative', md: 'sticky' },
      top: { md: 184 }, // Updated: Below header (64) + sticky search (60) + tabs (60)
      maxHeight: { md: 'calc(100vh - 200px)' }, // Adjusted for new sticky elements
      overflowY: { md: 'auto' },
      overflowX: 'hidden',
      pb: 2,
      // PERF-011 FIX: Use CSS containment to isolate layout calculations
      contain: 'layout style',
      // PERF-011 FIX: Use will-change to hint browser about scroll optimization
      willChange: 'scroll-position',
      '&::-webkit-scrollbar': { width: 6 }, // Thinner scrollbar
      '&::-webkit-scrollbar-track': {
        backgroundColor: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(0,0,0,0.15)', // Lighter scrollbar
        borderRadius: 3,
        '&:hover': {
          backgroundColor: 'rgba(0,0,0,0.25)',
        },
      },
    }}>
      <Paper elevation={0} sx={{ 
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2, // Slightly more rounded
        overflow: 'hidden',
        bgcolor: 'background.paper',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', // Subtle shadow
      }}>
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: '1px solid #e0e0e0',
          bgcolor: '#f9f9f9',
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {language === 'ar' ? 'تصفية' : 'FILTERS'}
          </Typography>
          <Button 
            size="small" 
            onClick={handleReset} 
            sx={{ fontSize: '11px', minWidth: 'auto', p: '2px 8px' }}
          >
            {language === 'ar' ? 'مسح' : 'Clear'}
          </Button>
        </Box>

        {/* Brands Accordion - BUG-007 FIX: Collapsed by default */}
        <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid', borderColor: 'divider' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />} sx={accordionSummaryStyle}>
            <Typography sx={sectionTitleStyle}>
              {language === 'ar' ? 'العلامات التجارية' : 'Brands'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {availableBrands.map((brand) => (
                <FormControlLabel
                  key={brand}
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                    />
                  }
                  label={brand}
                  sx={checkboxLabelStyle}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Categories Accordion */}
        <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #e0e0e0' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionSummaryStyle}>
            <Typography sx={sectionTitleStyle}>
              {language === 'ar' ? 'الفئات' : 'Categories'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 2, px: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {availableCategories.map((cat) => (
                <FormControlLabel
                  key={cat}
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryToggle(cat)}
                    />
                  }
                  label={cat}
                  sx={checkboxLabelStyle}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Price Range Accordion - BUG-007 FIX: Collapsed by default */}
        <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid', borderColor: 'divider' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />} sx={accordionSummaryStyle}>
            <Typography sx={sectionTitleStyle}>
              {language === 'ar' ? 'نطاق السعر' : 'Price Range'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 2 }}>
            <Slider
              value={priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              min={minPrice}
              max={maxPrice}
              step={100_000}
              valueLabelFormat={formatPrice}
              size="small"
              sx={{ mt: 1, mb: 1 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                {formatPrice(priceRange[0])}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                {formatPrice(priceRange[1])}
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Body Styles Accordion - BUG-007 FIX: Collapsed by default */}
        <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid', borderColor: 'divider' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />} sx={accordionSummaryStyle}>
            <Typography sx={sectionTitleStyle}>
              {language === 'ar' ? 'نوع الهيكل' : 'Body Types'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {availableBodyStyles.map((style) => (
                <FormControlLabel
                  key={style}
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedBodyStyles.includes(style)}
                      onChange={() => handleBodyStyleToggle(style)}
                    />
                  }
                  label={style}
                  sx={checkboxLabelStyle}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Fuel Types Accordion */}
        <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid', borderColor: 'divider' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />} sx={accordionSummaryStyle}>
            <Typography sx={sectionTitleStyle}>
              {language === 'ar' ? 'نوع الوقود' : 'Fuel Type'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {availableFuelTypes.map((fuel) => (
                <FormControlLabel
                  key={fuel}
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedFuelTypes.includes(fuel)}
                      onChange={() => handleFuelTypeToggle(fuel)}
                    />
                  }
                  label={fuel}
                  sx={checkboxLabelStyle}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Transmissions Accordion */}
        <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />} sx={accordionSummaryStyle}>
            <Typography sx={sectionTitleStyle}>
              {language === 'ar' ? 'ناقل الحركة' : 'Transmission'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {availableTransmissions.map((trans) => (
                <FormControlLabel
                  key={trans}
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedTransmissions.includes(trans)}
                      onChange={() => handleTransmissionToggle(trans)}
                    />
                  }
                  label={trans}
                  sx={checkboxLabelStyle}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Box>
  );
}
