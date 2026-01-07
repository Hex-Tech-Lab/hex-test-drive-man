'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Button,
  Card,
  CardMedia,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useBookingStore } from '@/stores/useBookingStore';
import { useCompareStore } from '@/stores/compare-store';
import { useLanguageStore } from '@/stores/language-store';
import { formatEGP } from '@/lib/imageHelper';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * Tab panel component for cart drawer tabs
 */
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cart-tabpanel-${index}`}
      aria-labelledby={`cart-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

/**
 * Cart drawer component showing booking and comparison lists
 * Slides out from right side with tabs for each list type
 */
export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  
  // BUG-008 FIX: Prevent SSR visibility flash
  const [isClient, setIsClient] = useState(false);
  
  // Primitive selectors to avoid React 19 infinite loops
  const bookingItems = useBookingStore((state) => state.items);
  const removeBooking = useBookingStore((state) => state.removeItem);

  const comparisonItems = useCompareStore((state) => state.compareItems);
  const removeComparison = useCompareStore((state) => state.removeFromCompare);
  
  const language = useLanguageStore((state) => state.language);

  const [activeTab, setActiveTab] = useState(0);

  // BUG-008 FIX: Only render drawer after client hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleViewBookings = () => {
    router.push(`/${locale}/bookings`);
    onClose();
  };

  const handleViewComparison = () => {
    router.push(`/${locale}/compare`);
    onClose();
  };

  const isRTL = language === 'ar';

  // BUG-008 FIX: Don't render drawer during SSR to prevent flash
  if (!isClient) {
    return null;
  }

  return (
    <Drawer
      anchor={isRTL ? 'left' : 'right'}
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '85vw', sm: '400px' },
          maxWidth: '100%',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            {isRTL ? 'عربة التسوق' : 'Shopping Cart'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
            <Tab
              label={
                isRTL
                  ? `الحجوزات (${bookingItems.length})`
                  : `Bookings (${bookingItems.length})`
              }
              id="cart-tab-0"
              aria-controls="cart-tabpanel-0"
            />
            <Tab
              label={
                isRTL
                  ? `المقارنات (${comparisonItems.length})`
                  : `Comparisons (${comparisonItems.length})`
              }
              id="cart-tab-1"
              aria-controls="cart-tabpanel-1"
            />
          </Tabs>
        </Box>

        {/* Tab Content - Scrollable */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {/* Bookings Tab */}
          <TabPanel value={activeTab} index={0}>
            {bookingItems.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  {isRTL ? 'لا توجد حجوزات' : 'No bookings yet'}
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {bookingItems.map((item) => (
                  <Card key={item.trimId} variant="outlined">
                    <Box sx={{ display: 'flex', gap: 1.5, p: 1.5 }}>
                      {/* Vehicle Image */}
                      <CardMedia
                        component="img"
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 1,
                          flexShrink: 0,
                        }}
                        image={item.imageUrl || '/placeholder-car.jpg'}
                        alt={`${item.brandName} ${item.modelName}`}
                      />

                      {/* Vehicle Info */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          noWrap
                          sx={{ mb: 0.5 }}
                        >
                          {item.brandName} {item.modelName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {item.trimName} {item.year}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                          {formatEGP(item.price, language)}
                        </Typography>
                      </Box>

                      {/* Remove Button */}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeBooking(item.trimId)}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Card>
                ))}
              </Stack>
            )}
          </TabPanel>

          {/* Comparisons Tab */}
          <TabPanel value={activeTab} index={1}>
            {comparisonItems.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  {isRTL ? 'لا توجد مقارنات' : 'No comparisons yet'}
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {comparisonItems.map((item) => (
                  <Card key={item.id} variant="outlined">
                    <Box sx={{ display: 'flex', gap: 1.5, p: 1.5 }}>
                      {/* Vehicle Image */}
                      <CardMedia
                        component="img"
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 1,
                          flexShrink: 0,
                        }}
                        image={item.models?.hero_image_url || '/placeholder-car.jpg'}
                        alt={`${item.models?.brands?.name} ${item.models?.name}`}
                      />

                      {/* Vehicle Info */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          noWrap
                          sx={{ mb: 0.5 }}
                        >
                          {item.models?.brands?.name} {item.models?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {item.trim_name} {item.model_year}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                          {formatEGP(item.price_egp, language)}
                        </Typography>
                      </Box>

                      {/* Remove Button */}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeComparison(item.id)}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Card>
                ))}
              </Stack>
            )}
          </TabPanel>
        </Box>

        {/* Bottom Actions */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          {activeTab === 0 ? (
            <Button
              variant="contained"
              fullWidth
              disabled={bookingItems.length === 0}
              onClick={handleViewBookings}
            >
              {isRTL ? 'عرض جميع الحجوزات' : 'View All Bookings'}
            </Button>
          ) : (
            <Button
              variant="contained"
              fullWidth
              disabled={comparisonItems.length === 0}
              onClick={handleViewComparison}
            >
              {isRTL ? 'عرض المقارنة' : 'View Comparison'}
            </Button>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
