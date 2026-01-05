'use client';

import { Box, Chip } from '@mui/material';
import { useFilterStore } from '@/stores/filter-store';
import { useLanguageStore } from '@/stores/language-store';

interface QuickFilter {
  id: string;
  labelEn: string;
  labelAr: string;
  value: string;
  category: 'transmission' | 'fuelType' | 'bodyStyle';
}

const quickFilters: QuickFilter[] = [
  { id: 'auto', labelEn: 'Automatic', labelAr: 'أوتوماتيك', value: 'Automatic', category: 'transmission' },
  { id: 'manual', labelEn: 'Manual', labelAr: 'يدوي', value: 'Manual', category: 'transmission' },
  { id: 'petrol', labelEn: 'Petrol', labelAr: 'بنزين', value: 'Petrol', category: 'fuelType' },
  { id: 'diesel', labelEn: 'Diesel', labelAr: 'ديزل', value: 'Diesel', category: 'fuelType' },
  { id: 'electric', labelEn: 'Electric', labelAr: 'كهربائي', value: 'Electric', category: 'fuelType' },
  { id: 'hybrid', labelEn: 'Hybrid', labelAr: 'هجين', value: 'Hybrid', category: 'fuelType' },
  { id: 'suv', labelEn: 'SUV', labelAr: 'دفع رباعي', value: 'SUV', category: 'bodyStyle' },
  { id: 'sedan', labelEn: 'Sedan', labelAr: 'سيدان', value: 'Sedan', category: 'bodyStyle' },
  { id: 'hatchback', labelEn: 'Hatchback', labelAr: 'هاتشباك', value: 'Hatchback', category: 'bodyStyle' },
];

/**
 * Horizontal scrollable quick filter chips
 * Provides one-tap filtering for common attributes
 * 
 * Sticky positioning below search bar on mobile
 */
export default function QuickFilters() {
  const language = useLanguageStore((state) => state.language);
  const transmissions = useFilterStore((state) => state.transmissions);
  const fuelTypes = useFilterStore((state) => state.fuelTypes);
  const bodyStyles = useFilterStore((state) => state.bodyStyles);
  const setFilters = useFilterStore((state) => state.setFilters);

  const isSelected = (filter: QuickFilter): boolean => {
    switch (filter.category) {
      case 'transmission':
        return transmissions.includes(filter.value);
      case 'fuelType':
        return fuelTypes.includes(filter.value);
      case 'bodyStyle':
        return bodyStyles.includes(filter.value);
      default:
        return false;
    }
  };

  const handleToggle = (filter: QuickFilter) => {
    const selected = isSelected(filter);
    
    switch (filter.category) {
      case 'transmission':
        setFilters({
          transmissions: selected
            ? transmissions.filter((t) => t !== filter.value)
            : [...transmissions, filter.value],
        });
        break;
      case 'fuelType':
        setFilters({
          fuelTypes: selected
            ? fuelTypes.filter((f) => f !== filter.value)
            : [...fuelTypes, filter.value],
        });
        break;
      case 'bodyStyle':
        setFilters({
          bodyStyles: selected
            ? bodyStyles.filter((b) => b !== filter.value)
            : [...bodyStyles, filter.value],
        });
        break;
    }
  };

  return (
    <Box
      sx={{
        position: { xs: 'sticky', md: 'static' },
        top: { xs: 64, md: 0 }, // Below header on mobile
        zIndex: 1000,
        bgcolor: 'background.paper',
        borderBottom: { xs: '1px solid', md: 'none' },
        borderColor: 'divider',
        py: { xs: 1.5, md: 2 },
        mb: { xs: 0, md: 2 },
        boxShadow: { xs: '0 2px 4px rgba(0,0,0,0.05)', md: 'none' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          px: { xs: 2, md: 0 },
          pb: { xs: 0.5, md: 0 },
          '&::-webkit-scrollbar': {
            height: 4,
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'divider',
            borderRadius: 2,
          },
        }}
      >
        {quickFilters.map((filter) => (
          <Chip
            key={filter.id}
            label={language === 'ar' ? filter.labelAr : filter.labelEn}
            onClick={() => handleToggle(filter)}
            color={isSelected(filter) ? 'primary' : 'default'}
            variant={isSelected(filter) ? 'filled' : 'outlined'}
            sx={{
              fontWeight: isSelected(filter) ? 600 : 400,
              fontSize: { xs: 13, sm: 14 },
              height: { xs: 32, sm: 36 },
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
