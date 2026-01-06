'use client';

import { Box, Container, alpha, useTheme } from '@mui/material';
import QuickSearch from '@/components/catalog/QuickSearch';
import { Vehicle } from '@/types/vehicle';

interface StickySearchBarProps {
  vehicles: Vehicle[];
  onSearch: (query: string) => void;
}

/**
 * Sticky Search Bar Component
 * Positioned below header, stays visible on scroll
 */
export default function StickySearchBar({ vehicles, onSearch }: StickySearchBarProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 64, // Below header (AppBar height)
        zIndex: 99, // Below tabs (100) but above content
        bgcolor: alpha(theme.palette.background.default, 0.95),
        backdropFilter: 'blur(10px)',
        borderBottom: 1,
        borderColor: 'divider',
        py: 2,
        boxShadow: 1,
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <QuickSearch vehicles={vehicles} onSearch={onSearch} compact={false} />
        </Box>
      </Container>
    </Box>
  );
}
