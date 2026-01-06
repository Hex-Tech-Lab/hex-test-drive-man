'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Autocomplete,
  Paper,
  Typography,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { useLanguageStore } from '@/stores/language-store';
import { Vehicle } from '@/types/vehicle';

interface QuickSearchProps {
  vehicles: Vehicle[];
  onSearch: (query: string) => void;
  compact?: boolean;
}

/**
 * Quick Search Component
 * Sticky header search with autocomplete and recent searches
 */
export default function QuickSearch({ vehicles, onSearch, compact = false }: QuickSearchProps) {
  const theme = useTheme();
  const language = useLanguageStore((state) => state.language);
  const [searchValue, setSearchValue] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));
  };

  // Generate autocomplete options
  const autocompleteOptions = useMemo(() => {
    const options: string[] = [];
    
    // Add brand names
    const brands = new Set(vehicles.map((v) => v.models.brands.name));
    brands.forEach((brand) => options.push(brand));
    
    // Add model names
    const models = new Set(vehicles.map((v) => v.models.name));
    models.forEach((model) => options.push(model));
    
    // Add recent searches
    recentSearches.forEach((search) => {
      if (!options.includes(search)) {
        options.push(search);
      }
    });
    
    return options;
  }, [vehicles, recentSearches]);

  const handleSearch = (value: string | null) => {
    const query = value || '';
    setSearchValue(query);
    onSearch(query);
    if (query) {
      saveRecentSearch(query);
    }
  };

  const handleClear = () => {
    setSearchValue('');
    onSearch('');
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: compact ? 400 : 600,
      }}
    >
      <Autocomplete
        freeSolo
        options={autocompleteOptions}
        value={searchValue}
        onChange={(_event, newValue) => handleSearch(newValue)}
        onInputChange={(_event, newInputValue) => {
          setSearchValue(newInputValue);
          onSearch(newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={
              language === 'ar'
                ? 'ابحث عن علامة تجارية أو موديل...'
                : 'Search brand or model...'
            }
            variant="outlined"
            size={compact ? 'small' : 'medium'}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: searchValue ? (
                <InputAdornment position="end">
                  <Clear
                    sx={{
                      cursor: 'pointer',
                      color: 'text.secondary',
                      '&:hover': { color: 'text.primary' },
                    }}
                    onClick={handleClear}
                  />
                </InputAdornment>
              ) : null,
              sx: {
                bgcolor: 'background.paper',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.divider, 0.5),
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2,
                },
              },
            }}
          />
        )}
        renderOption={(props, option) => {
          const isRecent = recentSearches.includes(option);
          return (
            <li {...props}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {option}
                </Typography>
                {isRecent && (
                  <Chip
                    label={language === 'ar' ? 'حديث' : 'Recent'}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  />
                )}
              </Box>
            </li>
          );
        }}
        PaperComponent={(props) => (
          <Paper
            {...props}
            sx={{
              mt: 1,
              boxShadow: 3,
              borderRadius: 2,
              '& .MuiAutocomplete-listbox': {
                maxHeight: 300,
                '& .MuiAutocomplete-option': {
                  py: 1.5,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  },
                },
              },
            }}
          />
        )}
      />

      {/* Recent Searches Chips */}
      {!searchValue && recentSearches.length > 0 && !compact && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
            {language === 'ar' ? 'عمليات البحث الأخيرة:' : 'Recent:'}
          </Typography>
          {recentSearches.slice(0, 3).map((search, index) => (
            <Chip
              key={index}
              label={search}
              size="small"
              onClick={() => handleSearch(search)}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
