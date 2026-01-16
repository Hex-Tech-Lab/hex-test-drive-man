'use client';

import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  Select,
  MenuItem,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import { useTranslation } from 'react-i18next';

interface CatalogToolbarProps {
  totalCount: number;
  viewMode: 'grid' | 'list';
  gridColumns: 3 | 4 | 5;
  sortBy: string;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onGridColumnsChange: (cols: 3 | 4 | 5) => void;
  onSortChange: (sort: string) => void;
}

/**
 * Catalog toolbar with view controls, sorting, and results count
 * @param props - Component props
 * @param props.totalCount - Total number of filtered results
 * @param props.viewMode - Current view mode (grid/list)
 * @param props.gridColumns - Number of grid columns (3/4/5)
 * @param props.sortBy - Current sort option
 * @param props.onViewModeChange - View mode change callback
 * @param props.onGridColumnsChange - Grid columns change callback
 * @param props.onSortChange - Sort change callback
 */
export default function CatalogToolbar({
  totalCount,
  viewMode,
  gridColumns,
  sortBy,
  onViewModeChange,
  onGridColumnsChange,
  onSortChange,
}: CatalogToolbarProps) {
  const { t } = useTranslation();

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: 'grid' | 'list' | null) => {
    if (newMode !== null) {
      onViewModeChange(newMode);
    }
  };

  const handleGridColumnsChange = (_event: React.MouseEvent<HTMLElement>, newCols: 3 | 4 | 5 | null) => {
    if (newCols !== null) {
      onGridColumnsChange(newCols);
    }
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    onSortChange(event.target.value);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        mb: 3,
        p: 2,
        backgroundColor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
      }}
    >
      {/* Left: View Mode */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
          sx={{ height: 36 }}
        >
          <ToggleButton value="grid" aria-label="grid view">
            <ViewModuleIcon sx={{ mr: 0.5 }} fontSize="small" />
            {t('catalog.view.grid')}
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view">
            <ViewListIcon sx={{ mr: 0.5 }} fontSize="small" />
            {t('catalog.view.list')}
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Grid Size (only in grid mode) */}
        {viewMode === 'grid' && (
          <ToggleButtonGroup
            value={gridColumns}
            exclusive
            onChange={handleGridColumnsChange}
            size="small"
            sx={{ height: 36 }}
          >
            <ToggleButton value={3} aria-label="3 columns">
              {t('catalog.view.cols3')}
            </ToggleButton>
            <ToggleButton value={4} aria-label="4 columns">
              {t('catalog.view.cols4')}
            </ToggleButton>
            <ToggleButton value={5} aria-label="5 columns">
              {t('catalog.view.cols5')}
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>

      {/* Right: Sort + Count */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select value={sortBy} onChange={handleSortChange} displayEmpty>
            <MenuItem value="price_asc">{t('catalog.sort.priceAsc')}</MenuItem>
            <MenuItem value="price_desc">{t('catalog.sort.priceDesc')}</MenuItem>
            <MenuItem value="year_desc">{t('catalog.sort.yearDesc')}</MenuItem>
            <MenuItem value="year_asc">{t('catalog.sort.yearAsc')}</MenuItem>
            <MenuItem value="name_asc">{t('catalog.sort.nameAsc')}</MenuItem>
            <MenuItem value="name_desc">{t('catalog.sort.nameDesc')}</MenuItem>
          </Select>
        </FormControl>

        <Chip
          label={t('catalog.resultsCount', { count: totalCount })}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600, height: 36 }}
        />
      </Box>
    </Box>
  );
}