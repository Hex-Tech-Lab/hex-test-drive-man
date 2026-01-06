'use client';

import { Box, Grid, Button, Typography, alpha, useTheme } from '@mui/material';
import { useLanguageStore } from '@/stores/language-store';
import { useFilterStore } from '@/stores/filter-store';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`catalog-tabpanel-${index}`}
      aria-labelledby={`catalog-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface BrandTabPanelProps {
  brands: string[];
}

export function BrandTabPanel({ brands }: BrandTabPanelProps) {
  const theme = useTheme();
  const language = useLanguageStore((state) => state.language);
  const selectedBrands = useFilterStore((state) => state.brands);
  const setFilters = useFilterStore((state) => state.setFilters);

  const handleBrandClick = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    setFilters({ brands: newBrands });
  };

  const sortedBrands = [...brands].sort((a, b) => a.localeCompare(b));

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
        {language === 'ar' ? 'اختر العلامة التجارية' : 'Select Brand'}
      </Typography>
      <Grid container spacing={1.5}>
        {sortedBrands.map((brand) => {
          const isSelected = selectedBrands.includes(brand);
          return (
            <Grid item xs={6} sm={4} md={3} lg={2} key={brand}>
              <Button
                variant={isSelected ? 'contained' : 'outlined'}
                fullWidth
                onClick={() => handleBrandClick(brand)}
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: isSelected ? 600 : 500,
                  borderRadius: 2,
                  borderColor: isSelected
                    ? theme.palette.primary.main
                    : alpha(theme.palette.divider, 0.5),
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: isSelected
                      ? theme.palette.primary.dark
                      : alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                {brand}
              </Button>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

interface TypeTabPanelProps {
  types: string[];
}

export function TypeTabPanel({ types }: TypeTabPanelProps) {
  const theme = useTheme();
  const language = useLanguageStore((state) => state.language);
  const selectedTypes = useFilterStore((state) => state.categories);
  const setFilters = useFilterStore((state) => state.setFilters);

  const handleTypeClick = (type: string) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    setFilters({ categories: newTypes });
  };

  const typeLabels: Record<string, { en: string; ar: string }> = {
    SUV: { en: 'SUV', ar: 'SUV' },
    Sedan: { en: 'Sedan', ar: 'سيدان' },
    Hatchback: { en: 'Hatchback', ar: 'هاتشباك' },
    Coupe: { en: 'Coupe', ar: 'كوبيه' },
    Crossover: { en: 'Crossover', ar: 'كروس أوفر' },
    Pickup: { en: 'Pickup', ar: 'بيك أب' },
    Van: { en: 'Van', ar: 'فان' },
    Wagon: { en: 'Wagon', ar: 'واجن' },
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
        {language === 'ar' ? 'اختر نوع السيارة' : 'Select Vehicle Type'}
      </Typography>
      <Grid container spacing={2}>
        {types.map((type) => {
          const isSelected = selectedTypes.includes(type);
          const label = typeLabels[type]
            ? language === 'ar'
              ? typeLabels[type].ar
              : typeLabels[type].en
            : type;

          return (
            <Grid item xs={6} sm={4} md={3} key={type}>
              <Button
                variant={isSelected ? 'contained' : 'outlined'}
                fullWidth
                onClick={() => handleTypeClick(type)}
                sx={{
                  py: 2,
                  textTransform: 'none',
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: '1rem',
                  borderRadius: 2,
                  borderColor: isSelected
                    ? theme.palette.primary.main
                    : alpha(theme.palette.divider, 0.5),
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: isSelected
                      ? theme.palette.primary.dark
                      : alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                {label}
              </Button>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

interface PriceTabPanelProps {
  minPrice: number;
  maxPrice: number;
}

export function PriceTabPanel({ minPrice, maxPrice }: PriceTabPanelProps) {
  const theme = useTheme();
  const language = useLanguageStore((state) => state.language);
  const setFilters = useFilterStore((state) => state.setFilters);

  const priceRanges = [
    { label: language === 'ar' ? 'أقل من 500 ألف' : 'Under 500K', min: 0, max: 500000 },
    { label: language === 'ar' ? '500 ألف - 1 مليون' : '500K - 1M', min: 500000, max: 1000000 },
    { label: language === 'ar' ? '1 - 1.5 مليون' : '1M - 1.5M', min: 1000000, max: 1500000 },
    { label: language === 'ar' ? '1.5 - 2 مليون' : '1.5M - 2M', min: 1500000, max: 2000000 },
    { label: language === 'ar' ? '2 - 3 مليون' : '2M - 3M', min: 2000000, max: 3000000 },
    { label: language === 'ar' ? 'أكثر من 3 مليون' : 'Over 3M', min: 3000000, max: 10000000 },
  ];

  const handlePriceClick = (min: number, max: number) => {
    setFilters({ priceRange: [min, max] });
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
        {language === 'ar' ? 'اختر نطاق السعر' : 'Select Price Range'}
      </Typography>
      <Grid container spacing={2}>
        {priceRanges.map((range, index) => (
          <Grid item xs={6} sm={4} md={3} key={index}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => handlePriceClick(range.min, range.max)}
              sx={{
                py: 2,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
                borderRadius: 2,
                borderColor: alpha(theme.palette.divider, 0.5),
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              {range.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export function ElectricTabPanel() {
  const theme = useTheme();
  const language = useLanguageStore((state) => state.language);
  const selectedFuelTypes = useFilterStore((state) => state.fuelTypes);
  const setFilters = useFilterStore((state) => state.setFilters);

  const fuelOptions = [
    { value: 'Electric', label: language === 'ar' ? 'كهربائي' : 'Electric' },
    { value: 'Hybrid', label: language === 'ar' ? 'هجين' : 'Hybrid' },
    { value: 'Plug-in Hybrid', label: language === 'ar' ? 'هجين قابل للشحن' : 'Plug-in Hybrid' },
  ];

  const handleFuelClick = (fuel: string) => {
    const newFuelTypes = selectedFuelTypes.includes(fuel)
      ? selectedFuelTypes.filter((f) => f !== fuel)
      : [...selectedFuelTypes, fuel];
    setFilters({ fuelTypes: newFuelTypes });
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
        {language === 'ar' ? 'اختر نوع الوقود' : 'Select Fuel Type'}
      </Typography>
      <Grid container spacing={2}>
        {fuelOptions.map((option) => {
          const isSelected = selectedFuelTypes.includes(option.value);
          return (
            <Grid item xs={6} sm={4} md={3} key={option.value}>
              <Button
                variant={isSelected ? 'contained' : 'outlined'}
                fullWidth
                onClick={() => handleFuelClick(option.value)}
                sx={{
                  py: 2,
                  textTransform: 'none',
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: '1rem',
                  borderRadius: 2,
                  borderColor: isSelected
                    ? theme.palette.primary.main
                    : alpha(theme.palette.divider, 0.5),
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: isSelected
                      ? theme.palette.primary.dark
                      : alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                {option.label}
              </Button>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export { TabPanel };
