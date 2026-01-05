'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  InputAdornment,
  Paper,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { Vehicle, AggregatedVehicle } from '@/types/vehicle';
import { formatEGP } from '@/lib/imageHelper';
import { BrandLogo } from '@/components/BrandLogo';

interface VehicleAutocompleteProps {
  vehicles: AggregatedVehicle[];
  language: string;
  locale: string;
}

interface AutocompleteOption {
  id: string;
  label: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  slug: string;
  vehicle: AggregatedVehicle;
}

/**
 * Autocomplete search component showing top 5 vehicle suggestions
 * Groups results by brand and navigates to detail page on selection
 * @param props - Component props
 * @param props.vehicles - Available vehicles for search
 * @param props.language - Current language (en/ar)
 * @param props.locale - Current locale for routing
 */
export default function VehicleAutocomplete({ vehicles, language, locale }: VehicleAutocompleteProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');

  // Convert vehicles to autocomplete options
  const options = useMemo<AutocompleteOption[]>(() => {
    return vehicles.map((vehicle) => {
      const brandSlug = vehicle.models.brands.name.toLowerCase().replace(/\s+/g, '-');
      const modelSlug = vehicle.models.name.toLowerCase().replace(/\s+/g, '-');
      const slug = `${brandSlug}-${modelSlug}-${vehicle.model_year}`;

      return {
        id: vehicle.id,
        label: `${vehicle.models.brands.name} ${vehicle.models.name} ${vehicle.model_year}`,
        brand: vehicle.models.brands.name,
        model: vehicle.models.name,
        year: vehicle.model_year,
        price: vehicle.minPrice,
        slug,
        vehicle,
      };
    });
  }, [vehicles]);

  // Filter options based on input (top 5 matches)
  const filteredOptions = useMemo(() => {
    if (!inputValue || inputValue.length < 2) {
      return [];
    }

    const query = inputValue.toLowerCase().trim();
    const matches = options.filter((option) => {
      const searchText = `${option.brand} ${option.model} ${option.year}`.toLowerCase();
      return searchText.includes(query);
    });

    // Return top 5 matches
    return matches.slice(0, 5);
  }, [inputValue, options]);

  // Group options by brand
  const groupedOptions = useMemo(() => {
    const groups: Record<string, AutocompleteOption[]> = {};
    filteredOptions.forEach((option) => {
      if (!groups[option.brand]) {
        groups[option.brand] = [];
      }
      groups[option.brand].push(option);
    });
    return groups;
  }, [filteredOptions]);

  const handleSelect = useCallback(
    (_: unknown, value: string | AutocompleteOption | null) => {
      if (value && typeof value !== 'string') {
        router.push(`/${locale}/vehicles/${value.slug}`);
      }
    },
    [router, locale]
  );

  return (
    <Autocomplete
      freeSolo
      options={filteredOptions}
      inputValue={inputValue}
      onInputChange={(_, newValue) => setInputValue(newValue)}
      onChange={handleSelect}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
      groupBy={(option) => option.brand}
      filterOptions={(x) => x} // Disable built-in filtering (we handle it)
      noOptionsText={
        inputValue.length < 2
          ? language === 'ar'
            ? 'اكتب حرفين على الأقل للبحث'
            : 'Type at least 2 characters to search'
          : language === 'ar'
          ? 'لا توجد نتائج'
          : 'No results found'
      }
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={language === 'ar' ? 'ابحث عن مركبة...' : 'Search for a vehicle...'}
          size="small"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <ListItem
          {...props}
          key={option.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            py: 1.5,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <DirectionsCarIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {option.model}
                </Typography>
                <Chip label={option.year} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
              </Box>
            }
            secondary={
              <Typography variant="caption" color="text.secondary">
                {formatEGP(option.price, language as 'ar' | 'en')}
              </Typography>
            }
          />
        </ListItem>
      )}
      renderGroup={(params) => (
        <Box key={params.key}>
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              bgcolor: 'background.paper',
              px: 2,
              py: 1,
              borderBottom: 1,
              borderColor: 'divider',
              zIndex: 1,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {params.group}
            </Typography>
          </Box>
          {params.children}
        </Box>
      )}
      PaperComponent={(props) => (
        <Paper
          {...props}
          elevation={8}
          sx={{
            mt: 1,
            maxHeight: 400,
            overflow: 'auto',
          }}
        />
      )}
      sx={{
        width: '100%',
        '& .MuiAutocomplete-listbox': {
          maxHeight: 400,
        },
      }}
    />
  );
}
