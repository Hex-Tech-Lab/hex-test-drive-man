'use client';

import { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Badge, Button, Container, Tooltip } from '@mui/material';
import dynamic from 'next/dynamic';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useTranslation } from 'react-i18next';
import CartDrawerSkeleton from '@/components/skeletons/CartDrawerSkeleton';
import { useLanguageStore } from '@/stores/language-store';
import { useCompareStore } from '@/stores/compare-store';
import { useBookingStore } from '@/stores/useBookingStore';
import { useRouter, usePathname } from 'next/navigation';

// Lazy load CartDrawer with skeleton (prevents CLS during load)
// Only loads when user clicks cart icon (deferred until interaction)
const CartDrawer = dynamic(() => import('@/components/CartDrawer'), {
  ssr: false,
  loading: () => <CartDrawerSkeleton />,
});

/**
 * Global header component with language switcher, cart, and comparison link
 */
export default function Header() {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const compareItems = useCompareStore((state) => state.compareItems);
  
  // Cart counts - primitive selectors to avoid React 19 infinite loops
  const bookingCount = useBookingStore((state) => state.items.length);
  const comparisonCount = compareItems.length; // Use same store as compare badge
  
  const router = useRouter();
  const pathname = usePathname();
  
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    
    // Update language in Zustand store ONLY (client-state)
    // This triggers AppProviders to update document.dir and document.lang
    // NO navigation needed - language is purely a UI state change
    setLanguage(newLang);
  };

  const goToCompare = () => {
    router.push(`/${language}/compare`);
  };

  const openCartDrawer = () => {
    setCartDrawerOpen(true);
  };

  const closeCartDrawer = () => {
    setCartDrawerOpen(false);
  };

  const totalCartItems = bookingCount + comparisonCount;
  const cartBadgeLabel = `${t('cart.bookingsCount', { count: bookingCount })} | ${t('cart.comparisonsCount', { count: comparisonCount })}`;

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1}>
        <Container maxWidth="xl">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {t('header.title')}
            </Typography>

            <Button
              variant="outlined"
              onClick={toggleLanguage}
              sx={{ mr: 2 }}
            >
              {t('header.switchLanguage')}
            </Button>

            <Tooltip title={cartBadgeLabel} arrow>
              <IconButton color="primary" onClick={openCartDrawer} sx={{ mr: 1 }}>
                <Badge badgeContent={totalCartItems} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <IconButton color="primary" onClick={goToCompare}>
              <Badge badgeContent={compareItems.length} color="error">
                <CompareArrowsIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <CartDrawer open={cartDrawerOpen} onClose={closeCartDrawer} />
    </>
  );
}
