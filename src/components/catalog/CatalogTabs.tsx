'use client';

import { useState } from 'react';
import { Box, Tabs, Tab, Chip, alpha, useTheme } from '@mui/material';
import {
  ViewModule,
  DirectionsCar,
  Category,
  AttachMoney,
  ElectricCar,
} from '@mui/icons-material';
import { useLanguageStore } from '@/stores/language-store';
import { useFilterStore } from '@/stores/filter-store';

interface CatalogTabsProps {
  onTabChange?: (tab: string) => void;
}

/**
 * Catalog Tabs Component
 * Amazon.eg / Noon.com style filter tabs
 * Categories: All, By Brand, By Type, By Price, Electric/Hybrid
 */
export default function CatalogTabs({ onTabChange }: CatalogTabsProps) {
  const theme = useTheme();
  const language = useLanguageStore((state) => state.language);
  const [activeTab, setActiveTab] = useState(0);

  // Get active filters count
  const brands = useFilterStore((state) => state.brands);
  const categories = useFilterStore((state) => state.categories);
  const priceRange = useFilterStore((state) => state.priceRange);
  const fuelTypes = useFilterStore((state) => state.fuelTypes);

  const tabs = [
    {
      id: 'all',
      label: language === 'ar' ? 'الكل' : 'All Vehicles',
      icon: <ViewModule />,
      count: 0,
    },
    {
      id: 'brand',
      label: language === 'ar' ? 'حسب العلامة' : 'By Brand',
      icon: <DirectionsCar />,
      count: brands.length,
    },
    {
      id: 'type',
      label: language === 'ar' ? 'حسب النوع' : 'By Type',
      icon: <Category />,
      count: categories.length,
    },
    {
      id: 'price',
      label: language === 'ar' ? 'حسب السعر' : 'By Price',
      icon: <AttachMoney />,
      count: priceRange[0] > 0 || priceRange[1] < 5000000 ? 1 : 0,
    },
    {
      id: 'electric',
      label: language === 'ar' ? 'كهربائي/هجين' : 'Electric/Hybrid',
      icon: <ElectricCar />,
      count: fuelTypes.filter((f) => f === 'Electric' || f === 'Hybrid').length,
    },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    onTabChange?.(tabs[newValue].id);
  };

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 64, // Below header
        zIndex: 100,
        boxShadow: 1,
      }}
    >
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 56,
          '& .MuiTab-root': {
            minHeight: 56,
            textTransform: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
            px: 3,
            '&.Mui-selected': {
              color: theme.palette.primary.main,
              fontWeight: 600,
            },
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        }}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={tab.id}
            icon={tab.icon}
            iconPosition="start"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {tab.label}
                {tab.count > 0 && (
                  <Chip
                    label={tab.count}
                    size="small"
                    sx={{
                      height: 20,
                      minWidth: 20,
                      fontSize: '0.75rem',
                      bgcolor:
                        activeTab === index
                          ? theme.palette.primary.main
                          : alpha(theme.palette.primary.main, 0.1),
                      color:
                        activeTab === index
                          ? theme.palette.primary.contrastText
                          : theme.palette.primary.main,
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>
            }
          />
        ))}
      </Tabs>
    </Box>
  );
}
