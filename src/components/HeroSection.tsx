'use client';

import { Box, Container, Typography, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useLanguageStore } from '@/stores/language-store';

interface HeroSectionProps {
  onSearchClick?: () => void;
}

/**
 * Hero section with background image and search CTA
 * Mobile-first design with gradient overlay
 * 
 * @param props - Component props
 * @param props.onSearchClick - Handler for search button click
 */
export default function HeroSection({ onSearchClick }: HeroSectionProps) {
  const language = useLanguageStore((state) => state.language);

  const content = {
    title: language === 'ar' ? 'اعثر على سيارتك المثالية' : 'Find Your Perfect Car',
    subtitle: language === 'ar' 
      ? 'تصفح أكثر من 400 موديل من أفضل العلامات التجارية'
      : 'Browse 400+ models from top brands',
    cta: language === 'ar' ? 'ابدأ البحث' : 'Start Searching',
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 280, sm: 320, md: 400 },
        backgroundImage: 'url(/images/vehicles/hero/audi-audi-a5-egypt.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: { xs: 3, md: 4 },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.85) 0%, rgba(25, 118, 210, 0.65) 50%, rgba(0, 0, 0, 0.4) 100%)',
          zIndex: 1,
        },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          px: { xs: 2, sm: 3 },
        }}
      >
        <Typography
          variant="h1"
          sx={{
            color: 'white',
            fontWeight: 700,
            fontSize: { xs: 28, sm: 36, md: 48 },
            lineHeight: 1.2,
            mb: 2,
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          {content.title}
        </Typography>

        <Typography
          variant="h2"
          sx={{
            color: 'rgba(255, 255, 255, 0.95)',
            fontWeight: 400,
            fontSize: { xs: 16, sm: 18, md: 22 },
            lineHeight: 1.4,
            mb: 4,
            textShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }}
        >
          {content.subtitle}
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<SearchIcon />}
          onClick={onSearchClick}
          sx={{
            bgcolor: 'white',
            color: 'primary.main',
            fontWeight: 600,
            fontSize: { xs: 15, sm: 16 },
            px: { xs: 3, sm: 4 },
            py: { xs: 1.5, sm: 1.75 },
            borderRadius: 2,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {content.cta}
        </Button>
      </Container>
    </Box>
  );
}
