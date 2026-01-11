'use client';

import { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Button } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useRouter } from 'next/navigation';
import { useFavoriteStore } from '@/stores/favorite-store';
import { useLanguageStore } from '@/stores/language-store';
import FavoriteLoginModal from '@/components/FavoriteLoginModal';

/**
 * Saved/Favorites page (MVP 1.5 Phase 0)
 * Triggers soft-gate modal on mount (requires auth to view favorites)
 * Currently shows placeholder - full implementation in MVP 1.5+
 */
export default function SavedPage() {
  const router = useRouter();
  const language = useLanguageStore((state) => state.language);
  const favoriteCount = useFavoriteStore((state) => state.getFavoriteCount());
  const [modalOpen, setModalOpen] = useState(false);

  // Trigger soft-gate modal on mount
  useEffect(() => {
    setModalOpen(true);
  }, []);

  const handleModalClose = () => {
    setModalOpen(false);
    // Redirect to home if user closes modal (no auth = can't view favorites)
    router.push('/');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <FavoriteIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          {language === 'ar' ? 'سياراتك المفضلة' : 'Your Favorite Cars'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {language === 'ar'
            ? 'سجّل الدخول لعرض وإدارة سياراتك المفضلة'
            : 'Sign in to view and manage your favorite cars'}
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => setModalOpen(true)}
        >
          {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
        </Button>
      </Box>

      {/* Soft Gate Modal */}
      <FavoriteLoginModal
        open={modalOpen}
        onClose={handleModalClose}
        favoriteCount={favoriteCount}
      />
    </Container>
  );
}
