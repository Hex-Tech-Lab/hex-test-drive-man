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
import { useLanguageStore } from '@/stores/language-store';

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
  const language = useLanguageStore((state) => state.language);

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
            {language === 'ar' ? 'شبكة' : 'Grid'}
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view">
            <ViewListIcon sx={{ mr: 0.5 }} fontSize="small" />
            {language === 'ar' ? 'قائمة' : 'List'}
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
              {language === 'ar' ? '3 أعمدة' : '3 Col'}
            </ToggleButton>
            <ToggleButton value={4} aria-label="4 columns">
              {language === 'ar' ? '4 أعمدة' : '4 Col'}
            </ToggleButton>
            <ToggleButton value={5} aria-label="5 columns">
              {language === 'ar' ? '5 أعمدة' : '5 Col'}
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>

      {/* Right: Sort + Count */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select value={sortBy} onChange={handleSortChange} displayEmpty>
            <MenuItem value="price_asc">{language === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low → High'}</MenuItem>
            <MenuItem value="price_desc">{language === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High → Low'}</MenuItem>
            <MenuItem value="year_desc">{language === 'ar' ? 'السنة: الأحدث أولاً' : 'Year: Newest First'}</MenuItem>
            <MenuItem value="year_asc">{language === 'ar' ? 'السنة: الأقدم أولاً' : 'Year: Oldest First'}</MenuItem>
            <MenuItem value="name_asc">{language === 'ar' ? 'الاسم: أ → ي' : 'Name: A → Z'}</MenuItem>
            <MenuItem value="name_desc">{language === 'ar' ? 'الاسم: ي → أ' : 'Name: Z → A'}</MenuItem>
          </Select>
        </FormControl>

        <Chip
          label={`${totalCount} ${language === 'ar' ? 'مركبة' : 'vehicles'}`}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600, height: 36 }}
        />
      </Box>
    </Box>
  );
}
