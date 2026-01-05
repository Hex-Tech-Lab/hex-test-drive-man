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
  Collapse,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Vehicle } from '@/types/vehicle';
import { useLanguageStore } from '@/stores/language-store';

interface TrimComparisonProps {
  trims: Vehicle[];
  onBookTrim: (trim: Vehicle) => void;
  onAddToComparison: (trim: Vehicle) => void;
}

/**
 * Enhanced trim comparison table with expandable sections
 * Features improved visual design and better mobile responsiveness
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

  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    performance: false,
    features: false,
  });

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

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const SectionHeader = ({ title, section }: { title: string; section: string }) => (
    <TableRow sx={{ backgroundColor: 'grey.50' }}>
      <TableCell
        colSpan={displayedTrims.length + 1}
        sx={{
          position: 'sticky',
          left: 0,
          zIndex: 2,
          cursor: 'pointer',
          '&:hover': { backgroundColor: 'grey.100' },
        }}
        onClick={() => toggleSection(section)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
            {title}
          </Typography>
          <IconButton size="small">
            {expandedSections[section] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: { xs: 2, md: 4 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {language === 'ar' ? 'مقارنة الإصدارات' : 'Compare Trims'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {language === 'ar' 
                ? 'اختر حتى 5 إصدارات لمقارنة المواصفات' 
                : 'Select up to 5 trims to compare specifications'}
            </Typography>
          </Box>

          {/* Trim Selector */}
          {trims.length > 1 && (
            <ToggleButtonGroup
              value={selectedTrims}
              onChange={handleToggleChange}
              aria-label="select trims"
              sx={{ 
                flexWrap: 'wrap',
                '& .MuiToggleButton-root': {
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                },
              }}
            >
              {trims.map((trim) => (
                <ToggleButton key={trim.id} value={trim.id} size="small">
                  {trim.trim_name}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
        </Box>

        <Divider />

        {/* Comparison Table */}
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell 
                  sx={{ 
                    fontWeight: 700, 
                    minWidth: 180, 
                    position: 'sticky', 
                    left: 0, 
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    zIndex: 3,
                  }}
                >
                  {language === 'ar' ? 'المواصفات' : 'Specification'}
                </TableCell>
                {displayedTrims.map((trim) => (
                  <TableCell 
                    key={trim.id} 
                    align="center" 
                    sx={{ 
                      minWidth: 150,
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700}>
                      {trim.trim_name}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      {language === 'ar' ? 'جنيه' : 'EGP'} {trim.price_egp.toLocaleString()}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {/* Basic Specifications Section */}
              <SectionHeader 
                title={language === 'ar' ? 'المواصفات الأساسية' : 'Basic Specifications'} 
                section="basic" 
              />
              
              <Collapse in={expandedSections.basic} timeout="auto" unmountOnExit>
                <TableBody>
                  {/* Body Type */}
                  {displayedTrims.some((t) => t.body_styles) && (
                    <TableRow>
                      <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1, fontWeight: 600 }}>
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
                    <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1, fontWeight: 600 }}>
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
                    <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1, fontWeight: 600 }}>
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
                    <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1, fontWeight: 600 }}>
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
                </TableBody>
              </Collapse>

              {/* Performance Section */}
              <SectionHeader 
                title={language === 'ar' ? 'الأداء' : 'Performance'} 
                section="performance" 
              />
              
              <Collapse in={expandedSections.performance} timeout="auto" unmountOnExit>
                <TableBody>
                  {/* Horsepower */}
                  {displayedTrims.some((t) => t.horsepower) && (
                    <TableRow>
                      <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1, fontWeight: 600 }}>
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
                      <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1, fontWeight: 600 }}>
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
                      <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1, fontWeight: 600 }}>
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
                      <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1, fontWeight: 600 }}>
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
                      <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1, fontWeight: 600 }}>
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
                      <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1, fontWeight: 600 }}>
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
                </TableBody>
              </Collapse>

              {/* Actions Row */}
              <TableRow sx={{ '& > *': { borderBottom: 'unset' }, backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700, position: 'sticky', left: 0, backgroundColor: 'grey.50', zIndex: 1 }}>
                  {language === 'ar' ? 'الإجراءات' : 'Actions'}
                </TableCell>
                {displayedTrims.map((trim) => (
                  <TableCell key={trim.id} align="center">
                    <Stack spacing={1}>
                      <Button
                        variant="contained"
                        size="medium"
                        startIcon={<EventAvailableIcon />}
                        onClick={() => onBookTrim(trim)}
                        fullWidth
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        {language === 'ar' ? 'احجز تجربة' : 'Book Test Drive'}
                      </Button>
                      <Button
                        variant="outlined"
                        size="medium"
                        startIcon={<CompareArrowsIcon />}
                        onClick={() => onAddToComparison(trim)}
                        fullWidth
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        {language === 'ar' ? 'أضف للمقارنة' : 'Add to Compare'}
                      </Button>
                    </Stack>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Selection Hint */}
        {trims.length > 3 && (
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
            {language === 'ar'
              ? `محدد حالياً: ${selectedTrims.length} من ${trims.length} إصدار`
              : `Currently selected: ${selectedTrims.length} of ${trims.length} trims`}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
