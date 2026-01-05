'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableRow,
  TableCell,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Vehicle } from '@/types/vehicle';
import { formatEGP, getVehicleImage, getVehicleImageSrcSet, getPlaceholderSrcSet } from '@/lib/imageHelper';

interface MobileComparisonViewProps {
  vehicles: Vehicle[];
  language: string;
  onRemove: (id: string) => void;
}

interface SpecRow {
  label: string;
  getValue: (vehicle: Vehicle) => string;
}

/**
 * Mobile-optimized comparison view with tab-based navigation
 * Shows one vehicle at a time with swipeable tabs
 * @param props - Component props
 * @param props.vehicles - Vehicles to compare
 * @param props.language - Current language (en/ar)
 * @param props.onRemove - Callback to remove vehicle from comparison
 */
export default function MobileComparisonView({ vehicles, language, onRemove }: MobileComparisonViewProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const theme = useTheme();

  const specRows: SpecRow[] = [
    {
      label: language === 'ar' ? 'السنة' : 'Year',
      getValue: (v) => v.model_year?.toString() || '-',
    },
    {
      label: language === 'ar' ? 'الفئة' : 'Trim',
      getValue: (v) => v.trim_name || '-',
    },
    {
      label: language === 'ar' ? 'التصنيف' : 'Category',
      getValue: (v) => v.categories?.name ?? '-',
    },
    {
      label: language === 'ar' ? 'المحرك' : 'Engine',
      getValue: (v) => v.engine || '-',
    },
    {
      label: language === 'ar' ? 'ناقل الحركة' : 'Transmission',
      getValue: (v) => v.transmissions?.name ?? '-',
    },
    {
      label: language === 'ar' ? 'نوع الوقود' : 'Fuel Type',
      getValue: (v) => v.fuel_types?.name ?? '-',
    },
    {
      label: language === 'ar' ? 'القوة الحصانية' : 'Horsepower',
      getValue: (v) => (v.horsepower ? `${v.horsepower} HP` : '-'),
    },
    {
      label: language === 'ar' ? 'عزم الدوران' : 'Torque',
      getValue: (v) => (v.torque_nm ? `${v.torque_nm} Nm` : '-'),
    },
    {
      label: language === 'ar' ? 'التسارع 0-100' : '0-100 km/h',
      getValue: (v) => (v.acceleration_0_100 ? `${v.acceleration_0_100}s` : '-'),
    },
    {
      label: language === 'ar' ? 'السرعة القصوى' : 'Top Speed',
      getValue: (v) => (v.top_speed ? `${v.top_speed} km/h` : '-'),
    },
    {
      label: language === 'ar' ? 'استهلاك الوقود' : 'Fuel Consumption',
      getValue: (v) => v.fuel_consumption || '-',
    },
    {
      label: language === 'ar' ? 'المقاعد' : 'Seats',
      getValue: (v) => v.seats?.toString() || '-',
    },
  ];

  const currentVehicle = vehicles[selectedTab];

  return (
    <Box>
      {/* Vehicle Tabs */}
      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        variant="fullWidth"
        sx={{
          mb: 2,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            minHeight: 48,
            fontSize: '0.875rem',
          },
        }}
      >
        {vehicles.map((vehicle, index) => (
          <Tab
            key={vehicle.id}
            label={`${vehicle.models.brands.name} ${vehicle.models.name}`}
            sx={{
              textTransform: 'none',
              fontWeight: selectedTab === index ? 600 : 400,
            }}
          />
        ))}
      </Tabs>

      {/* Current Vehicle Card */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => onRemove(currentVehicle.id)}
            sx={{
              position: 'absolute',
              top: 8,
              right: language === 'ar' ? 'auto' : 8,
              left: language === 'ar' ? 8 : 'auto',
              zIndex: 1,
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: 'error.light',
                color: 'error.contrastText',
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
          <CardMedia
            component="img"
            height="240"
            image={getVehicleImage(currentVehicle.models.hero_image_url)}
            srcSet={getVehicleImageSrcSet(currentVehicle.models.hero_image_url)}
            alt={`${currentVehicle.models.brands.name} ${currentVehicle.models.name}`}
            sx={{ objectFit: 'cover', objectPosition: 'center 85%' }}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              const img = e.currentTarget;
              if (!img.src.includes('/images/vehicles/hero/placeholder')) {
                img.src = '/images/vehicles/hero/placeholder.webp';
                img.srcset = getPlaceholderSrcSet();
              }
            }}
          />
        </Box>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {currentVehicle.models.brands.name} {currentVehicle.models.name}
          </Typography>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
            {formatEGP(currentVehicle.price_egp, language as 'ar' | 'en')}
          </Typography>
        </CardContent>
      </Card>

      {/* Specifications Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            {language === 'ar' ? 'المواصفات' : 'Specifications'}
          </Typography>
          <Table size="small">
            <TableBody>
              {specRows.map((spec, index) => (
                <TableRow
                  key={spec.label}
                  sx={{
                    bgcolor: index % 2 === 0 ? 'action.hover' : 'transparent',
                  }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      fontWeight: 600,
                      width: '40%',
                      borderBottom: index === specRows.length - 1 ? 'none' : undefined,
                    }}
                  >
                    {spec.label}
                  </TableCell>
                  <TableCell
                    sx={{
                      borderBottom: index === specRows.length - 1 ? 'none' : undefined,
                    }}
                  >
                    {spec.getValue(currentVehicle)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Swipe Hint */}
      <Box sx={{ textAlign: 'center', mt: 2, opacity: 0.6 }}>
        <Typography variant="caption" color="text.secondary">
          {language === 'ar' ? 'اسحب للتبديل بين المركبات' : 'Swipe to switch between vehicles'}
        </Typography>
      </Box>
    </Box>
  );
}
