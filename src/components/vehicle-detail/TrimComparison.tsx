'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { Vehicle } from '@/types/vehicle';
import { useLanguageStore } from '@/stores/language-store';

interface TrimComparisonProps {
  trims: Vehicle[];
  onBookTrim: (trim: Vehicle) => void;
  onAddToComparison: (trim: Vehicle) => void;
}

/**
 * Trim comparison table with side-by-side specifications
 * Highlights differences between selected trims
 * @param props - Component props
 * @param props.trims - All available trims for this model
 * @param props.onBookTrim - Book test drive callback
 * @param props.onAddToComparison - Add to comparison callback
 */
export default function TrimComparison({ trims, onBookTrim, onAddToComparison }: TrimComparisonProps) {
  const language = useLanguageStore((state) => state.language);

  // Auto-select first 3 trims or all if less than 3
  const [selectedTrims, setSelectedTrims] = useState<string[]>(
    trims.length <= 3 ? trims.map((t) => t.id) : trims.slice(0, 3).map((t) => t.id)
  );

  const displayedTrims = trims.filter((t) => selectedTrims.includes(t.id));

  // Check if values differ across selected trims
  const hasDifference = (field: keyof Vehicle): boolean => {
    if (displayedTrims.length <= 1) return false;
    const values = displayedTrims.map((t) => t[field]);
    return !values.every((v) => v === values[0]);
  };

  const handleToggleChange = (_event: React.MouseEvent<HTMLElement>, newSelection: string[]) => {
    if (newSelection.length > 0 && newSelection.length <= 5) {
      setSelectedTrims(newSelection);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3 }}>
        <Typography variant="h5">
          {language === 'ar' ? 'مقارنة الإصدارات' : 'Compare Trims'}
        </Typography>

        {/* Trim Selector */}
        {trims.length > 1 && (
          <ToggleButtonGroup
            value={selectedTrims}
            onChange={handleToggleChange}
            aria-label="select trims"
            sx={{ flexWrap: 'wrap' }}
          >
            {trims.map((trim) => (
              <ToggleButton key={trim.id} value={trim.id} size="small" sx={{ px: 2 }}>
                {trim.trim_name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
      </Box>

      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 180, position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
                {language === 'ar' ? 'المواصفات' : 'Specification'}
              </TableCell>
              {displayedTrims.map((trim) => (
                <TableCell key={trim.id} align="center" sx={{ minWidth: 150 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {trim.trim_name}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {language === 'ar' ? 'جنيه' : 'EGP'} {trim.price_egp.toLocaleString()}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {/* Body Type */}
            {displayedTrims.some((t) => t.body_styles) && (
              <TableRow>
                <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
                  {language === 'ar' ? 'نوع الهيكل' : 'Body Type'}
                </TableCell>
                {displayedTrims.map((trim) => (
                  <TableCell
                    key={trim.id}
                    align="center"
                    sx={{ bgcolor: hasDifference('body_style_id') ? 'warning.lighter' : 'inherit' }}
                  >
                    {trim.body_styles ? (language === 'ar' ? trim.body_styles.name_ar : trim.body_styles.name_en) : 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
            )}

            {/* Fuel Type */}
            <TableRow>
              <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
                {language === 'ar' ? 'نوع الوقود' : 'Fuel Type'}
              </TableCell>
              {displayedTrims.map((trim) => (
                <TableCell
                  key={trim.id}
                  align="center"
                  sx={{ bgcolor: hasDifference('fuel_type_id') ? 'warning.lighter' : 'inherit' }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                    {trim.fuel_types?.name || 'N/A'}
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {trim.is_electric && <Chip label={language === 'ar' ? 'كهربائي' : 'Electric'} size="small" color="success" />}
                      {trim.is_hybrid && <Chip label={language === 'ar' ? 'هجين' : 'Hybrid'} size="small" color="info" />}
                    </Box>
                  </Box>
                </TableCell>
              ))}
            </TableRow>

            {/* Transmission */}
            <TableRow>
              <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
                {language === 'ar' ? 'ناقل الحركة' : 'Transmission'}
              </TableCell>
              {displayedTrims.map((trim) => (
                <TableCell
                  key={trim.id}
                  align="center"
                  sx={{ bgcolor: hasDifference('transmission_id') ? 'warning.lighter' : 'inherit' }}
                >
                  {trim.transmissions?.name || 'N/A'}
                </TableCell>
              ))}
            </TableRow>

            {/* Seats */}
            <TableRow>
              <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
                {language === 'ar' ? 'المقاعد' : 'Seats'}
              </TableCell>
              {displayedTrims.map((trim) => (
                <TableCell
                  key={trim.id}
                  align="center"
                  sx={{ bgcolor: hasDifference('seats') ? 'warning.lighter' : 'inherit' }}
                >
                  {trim.seats || 'N/A'}
                </TableCell>
              ))}
            </TableRow>

            {/* Horsepower */}
            {displayedTrims.some((t) => t.horsepower) && (
              <TableRow>
                <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
                  {language === 'ar' ? 'القوة الحصانية' : 'Horsepower'}
                </TableCell>
                {displayedTrims.map((trim) => (
                  <TableCell
                    key={trim.id}
                    align="center"
                    sx={{ bgcolor: hasDifference('horsepower') ? 'warning.lighter' : 'inherit' }}
                  >
                    {trim.horsepower ? `${trim.horsepower} ${language === 'ar' ? 'حصان' : 'HP'}` : 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
            )}

            {/* Engine */}
            {displayedTrims.some((t) => t.engine) && (
              <TableRow>
                <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
                  {language === 'ar' ? 'المحرك' : 'Engine'}
                </TableCell>
                {displayedTrims.map((trim) => (
                  <TableCell
                    key={trim.id}
                    align="center"
                    sx={{ bgcolor: hasDifference('engine') ? 'warning.lighter' : 'inherit' }}
                  >
                    {trim.engine || 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
            )}

            {/* Torque */}
            {displayedTrims.some((t) => t.torque_nm) && (
              <TableRow>
                <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
                  {language === 'ar' ? 'عزم الدوران' : 'Torque'}
                </TableCell>
                {displayedTrims.map((trim) => (
                  <TableCell
                    key={trim.id}
                    align="center"
                    sx={{ bgcolor: hasDifference('torque_nm') ? 'warning.lighter' : 'inherit' }}
                  >
                    {trim.torque_nm ? `${trim.torque_nm} Nm` : 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
            )}

            {/* Acceleration */}
            {displayedTrims.some((t) => t.acceleration_0_100) && (
              <TableRow>
                <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
                  {language === 'ar' ? 'التسارع 0-100' : '0-100 km/h'}
                </TableCell>
                {displayedTrims.map((trim) => (
                  <TableCell
                    key={trim.id}
                    align="center"
                    sx={{ bgcolor: hasDifference('acceleration_0_100') ? 'warning.lighter' : 'inherit' }}
                  >
                    {trim.acceleration_0_100 ? `${trim.acceleration_0_100} ${language === 'ar' ? 'ثانية' : 'sec'}` : 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
            )}

            {/* Top Speed */}
            {displayedTrims.some((t) => t.top_speed) && (
              <TableRow>
                <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
                  {language === 'ar' ? 'السرعة القصوى' : 'Top Speed'}
                </TableCell>
                {displayedTrims.map((trim) => (
                  <TableCell
                    key={trim.id}
                    align="center"
                    sx={{ bgcolor: hasDifference('top_speed') ? 'warning.lighter' : 'inherit' }}
                  >
                    {trim.top_speed ? `${trim.top_speed} ${language === 'ar' ? 'كم/س' : 'km/h'}` : 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
            )}

            {/* Fuel Consumption */}
            {displayedTrims.some((t) => t.fuel_consumption) && (
              <TableRow>
                <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
                  {language === 'ar' ? 'استهلاك الوقود' : 'Fuel Consumption'}
                </TableCell>
                {displayedTrims.map((trim) => (
                  <TableCell
                    key={trim.id}
                    align="center"
                    sx={{ bgcolor: hasDifference('fuel_consumption') ? 'warning.lighter' : 'inherit' }}
                  >
                    {trim.fuel_consumption || 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
            )}

            {/* Actions Row */}
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
              <TableCell sx={{ fontWeight: 'bold', position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
                {language === 'ar' ? 'الإجراءات' : 'Actions'}
              </TableCell>
              {displayedTrims.map((trim) => (
                <TableCell key={trim.id} align="center">
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<EventAvailableIcon />}
                      onClick={() => onBookTrim(trim)}
                      fullWidth
                    >
                      {language === 'ar' ? 'احجز تجربة' : 'Book Test Drive'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CompareArrowsIcon />}
                      onClick={() => onAddToComparison(trim)}
                      fullWidth
                    >
                      {language === 'ar' ? 'أضف للمقارنة' : 'Add to Compare'}
                    </Button>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Selection Hint */}
      {trims.length > 3 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          {language === 'ar'
            ? `يمكنك اختيار حتى 5 إصدارات للمقارنة (محدد حالياً: ${selectedTrims.length})`
            : `Select up to 5 trims to compare (currently selected: ${selectedTrims.length})`}
        </Typography>
      )}
    </Paper>
  );
}
