'use client';

import { useMemo } from 'react';
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

  // Extract unique categories from live data
  const availableCategories = useMemo(() => {
    const catSet = new Set<string>();
    vehicles.forEach((v) => {
      if (v.categories?.name) {
        catSet.add(v.categories.name);
      }
    });
    return Array.from(catSet).sort();
  }, [vehicles]);

  // Dynamic max price based on available vehicles
  const maxPrice = useMemo(() => {
    if (vehicles.length === 0) return 20_000_000;
    const prices = vehicles.map(v => v.price_egp).filter(p => p > 0);
    return prices.length > 0 ? Math.max(...prices) : 20_000_000;
  }, [vehicles]);

  // Dynamic min price based on available vehicles
  const minPrice = useMemo(() => {
    if (vehicles.length === 0) return 0;
    const prices = vehicles.map(v => v.price_egp).filter(p => p > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  }, [vehicles]);

  const handleBrandToggle = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    
    setFilters({ brands: newBrands });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
      
    setFilters({ categories: newCategories });
  };

  const handlePriceChange = (_event: Event, newValue: number | number[]) => {
    const newRange = newValue as [number, number];
    setFilters({ priceRange: newRange });
  };

  const handleReset = () => {
    setFilters({
      brands: [],
      categories: [],
      priceRange: [minPrice, maxPrice],
    });
  };

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
      top: { md: 80 },
      maxHeight: { md: 'calc(100vh - 96px)' },
      pb: 2,
    }}>
      <Paper elevation={0} sx={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: 1, 
        overflow: 'hidden',
        bgcolor: '#fff'
      }}>
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: '1px solid #e0e0e0',
          bgcolor: '#f9f9f9'
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

        {/* Brands Accordion */}
        <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #e0e0e0' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionSummaryStyle}>
            <Typography sx={sectionTitleStyle}>
              {language === 'ar' ? 'العلامات التجارية' : 'Brands'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 2, px: 2 }}>
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

        {/* Price Range Accordion */}
        <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionSummaryStyle}>
            <Typography sx={sectionTitleStyle}>
              {language === 'ar' ? 'نطاق السعر' : 'Price Range'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 2, px: 2 }}>
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
      </Paper>
    </Box>
  );
}
