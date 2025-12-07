'use client';

import { useEffect } from 'react';
import { Container, Typography, Grid, Card, CardMedia, CardContent, Box, Button, IconButton, Table, TableBody, TableRow, TableCell, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Header from '@/components/Header';
import { useCompareStore } from '@/stores/compare-store';
import { useLanguageStore } from '@/stores/language-store';
import { useParams, useRouter } from 'next/navigation';
import { formatEGP } from '@/lib/imageHelper'; // Import formatEGP

export default function ComparePage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const { compareItems, removeFromCompare, clearCompare } = useCompareStore();

  useEffect(() => {
    if (locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    }
  }, [locale, setLanguage]);

  if (compareItems.length === 0) {
    return (
      <>
        <Header />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" gutterBottom>
              {language === 'ar' ? 'لا توجد مركبات للمقارنة' : 'No vehicles to compare'}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {language === 'ar' ? 'أضف ما يصل إلى 3 مركبات للمقارنة' : 'Add up to 3 vehicles to compare'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push(`/${language}`)}
              sx={{ mt: 2 }}
            >
              {language === 'ar' ? 'العودة إلى الكتالوج' : 'Back to Catalog'}
            </Button>
          </Box>
        </Container>
      </>
    );
  }

  const numberOfVehicleColumns = compareItems.length;
  const gridTemplateColumns = `200px repeat(${numberOfVehicleColumns}, 1fr)`; // 200px for labels, 1fr for each vehicle

  return (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {language === 'ar' ? 'مقارنة المركبات' : 'Compare Vehicles'}
          </Typography>
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push(`/${language}`)}
              sx={{ mr: 2 }}
            >
              {language === 'ar' ? 'عودة' : 'Back'}
            </Button>
            <Button variant="outlined" color="error" onClick={clearCompare}>
              {language === 'ar' ? 'مسح الكل' : 'Clear All'}
            </Button>
          </Box>
        </Box>

        {/* Unified Grid for Cards and Specs */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: gridTemplateColumns,
            gap: 2, // Gap between grid items
            alignItems: 'start',
            overflowX: 'auto', // Enable horizontal scrolling for many items
          }}
        >
          {/* Empty cell for the top-left corner (above spec labels) */}
          <Box sx={{ gridColumn: '1 / span 1' }}></Box>

          {/* Vehicle Cards - placed directly into the grid */}
          {compareItems.map((vehicle) => (
            <Box key={vehicle.id} sx={{ gridColumn: 'span 1' }}>
              <Card sx={{ height: '100%' }}>
                <Box sx={{ position: 'relative' }}>
                  <IconButton
                    onClick={() => removeFromCompare(vehicle.id)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: language === 'ar' ? 'auto' : 8,
                      left: language === 'ar' ? 8 : 'auto',
                      zIndex: 1,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <CardMedia
                    component="img"
                    height="200"
                    image={vehicle.models.hero_image_url || 'https://via.placeholder.com/800x600?text=No+Image'}
                    alt={`${vehicle.models.brands.name} ${vehicle.models.name}`}
                  />
                </Box>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {vehicle.models.brands.name} {vehicle.models.name}
                  </Typography>
                  <Typography variant="h5" color="primary" gutterBottom>
                    {formatEGP(vehicle.price_egp, language)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}

          {/* Divider between Cards and Specs */}
          <Divider sx={{ gridColumn: `1 / span ${numberOfVehicleColumns + 1}`, my: 2 }} />

          {/* Specifications - Refactored from Table to Box/Typography for Grid alignment */}
          <Typography variant="h5" sx={{ gridColumn: `1 / span ${numberOfVehicleColumns + 1}`, mt: 2, mb: 2 }}>
            {language === 'ar' ? 'المواصفات' : 'Specifications'}
          </Typography>

          {/* Year */}
          <Typography sx={{ gridColumn: '1 / span 1', p: 1, bgcolor: 'action.hover' }}>
            <strong>{language === 'ar' ? 'السنة' : 'Year'}</strong>
          </Typography>
          {compareItems.map((v) => (
            <Typography key={v.id} sx={{ gridColumn: 'span 1', p: 1, bgcolor: 'action.hover' }}>
              {v.model_year}
            </Typography>
          ))}

          {/* Trim */}
          <Typography sx={{ gridColumn: '1 / span 1', p: 1 }}>
            <strong>{language === 'ar' ? 'الفئة' : 'Trim'}</strong>
          </Typography>
          {compareItems.map((v) => (
            <Typography key={v.id} sx={{ gridColumn: 'span 1', p: 1 }}>
              {v.trim_name}
            </Typography>
          ))}

          {/* Category */}
          <Typography sx={{ gridColumn: '1 / span 1', p: 1, bgcolor: 'action.hover' }}>
            <strong>{language === 'ar' ? 'التصنيف' : 'Category'}</strong>
          </Typography>
          {compareItems.map((v) => (
            <Typography key={v.id} sx={{ gridColumn: 'span 1', p: 1, bgcolor: 'action.hover' }}>
              {v.categories?.name ?? '-'}
            </Typography>
          ))}

          {/* Engine */}
          <Typography sx={{ gridColumn: '1 / span 1', p: 1 }}>
            <strong>{language === 'ar' ? 'المحرك' : 'Engine'}</strong>
          </Typography>
          {compareItems.map((v) => (
            <Typography key={v.id} sx={{ gridColumn: 'span 1', p: 1 }}>
              {v.engine || '-'}
            </Typography>
          ))}

          {/* Transmission */}
          <Typography sx={{ gridColumn: '1 / span 1', p: 1, bgcolor: 'action.hover' }}>
            <strong>{language === 'ar' ? 'ناقل الحركة' : 'Transmission'}</strong>
          </Typography>
          {compareItems.map((v) => (
            <Typography key={v.id} sx={{ gridColumn: 'span 1', p: 1, bgcolor: 'action.hover' }}>
              {v.transmissions?.name ?? '-'}
            </Typography>
          ))}

          {/* Fuel Type */}
          <Typography sx={{ gridColumn: '1 / span 1', p: 1 }}>
            <strong>{language === 'ar' ? 'نوع الوقود' : 'Fuel Type'}</strong>
          </Typography>
          {compareItems.map((v) => (
            <Typography key={v.id} sx={{ gridColumn: 'span 1', p: 1 }}>
              {v.fuel_types?.name ?? '-'}
            </Typography>
          ))}

          {/* Horsepower */}
          <Typography sx={{ gridColumn: '1 / span 1', p: 1, bgcolor: 'action.hover' }}>
            <strong>{language === 'ar' ? 'القوة الحصانية' : 'Horsepower'}</strong>
          </Typography>
          {compareItems.map((v) => (
            <Typography key={v.id} sx={{ gridColumn: 'span 1', p: 1, bgcolor: 'action.hover' }}>
              {v.horsepower ? `${v.horsepower} HP` : '-'}
            </Typography>
          ))}

          {/* Torque */}
          <Typography sx={{ gridColumn: '1 / span 1', p: 1 }}>
            <strong>{language === 'ar' ? 'عزم الدوران' : 'Torque'}</strong>
          </Typography>
          {compareItems.map((v) => (
            <Typography key={v.id} sx={{ gridColumn: 'span 1', p: 1 }}>
              {v.torque_nm ? `${v.torque_nm} Nm` : '-'}
            </Typography>
          ))}

          {/* Acceleration 0-100 */}
          <Typography sx={{ gridColumn: '1 / span 1', p: 1, bgcolor: 'action.hover' }}>
            <strong>{language === 'ar' ? 'التسارع 0-100' : '0-100 km/h'}</strong>
          </Typography>
          {compareItems.map((v) => (
            <Typography key={v.id} sx={{ gridColumn: 'span 1', p: 1, bgcolor: 'action.hover' }}>
              {v.acceleration_0_100 ? `${v.acceleration_0_100}s` : '-'}
            </Typography>
          ))}

          {/* Top Speed */}
          <Typography sx={{ gridColumn: '1 / span 1', p: 1 }}>
            <strong>{language === 'ar' ? 'السرعة القصوى' : 'Top Speed'}</strong>
          </Typography>
          {compareItems.map((v) => (
            <Typography key={v.id} sx={{ gridColumn: 'span 1', p: 1 }}>
              {v.top_speed ? `${v.top_speed} km/h` : '-'}
            </Typography>
          ))}

          {/* Fuel Consumption */}
          <Typography sx={{ gridColumn: '1 / span 1', p: 1, bgcolor: 'action.hover' }}>
            <strong>{language === 'ar' ? 'استهلاك الوقود' : 'Fuel Consumption'}</strong>
          </Typography>
          {compareItems.map((v) => (
            <Typography key={v.id} sx={{ gridColumn: 'span 1', p: 1, bgcolor: 'action.hover' }}>
              {v.fuel_consumption || '-'}
            </Typography>
          ))}

          {/* Seats */}
          <Typography sx={{ gridColumn: '1 / span 1', p: 1 }}>
            <strong>{language === 'ar' ? 'المقاعد' : 'Seats'}</strong>
          </Typography>
          {compareItems.map((v) => (
            <Typography key={v.id} sx={{ gridColumn: 'span 1', p: 1 }}>
              {v.seats || '-'}
            </Typography>
          ))}
        </Box>
      </Container>
    </>
  );
}