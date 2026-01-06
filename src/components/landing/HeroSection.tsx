'use client';

import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLanguageStore } from '@/stores/language-store';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * Grok-inspired hero section with fluid motion animations
 * Features parallax scrolling, gradient backgrounds, and smooth transitions
 */
export default function HeroSection() {
  const router = useRouter();
  const language = useLanguageStore((state) => state.language);
  const isRTL = language === 'ar';
  const { scrollY } = useScroll();
  
  // Parallax effects
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

  const content = {
    en: {
      headline: 'Find Your Perfect Drive',
      subheadline: 'Explore 427+ vehicles from 95 premium brands. Book your test drive in seconds.',
      cta: 'Explore Catalog',
      secondary: 'How It Works',
    },
    ar: {
      headline: 'اعثر على قيادتك المثالية',
      subheadline: 'استكشف أكثر من 427 مركبة من 95 علامة تجارية فاخرة. احجز تجربة القيادة في ثوانٍ.',
      cta: 'استكشف الكتالوج',
      secondary: 'كيف يعمل',
    },
  };

  const t = content[language as keyof typeof content];

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Animated background gradient */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          y,
        }}
      />

      {/* Floating orbs for depth */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          style={{ opacity, scale }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Stack spacing={4} alignItems="center" textAlign="center">
            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5.5rem' },
                  fontWeight: 800,
                  color: 'white',
                  lineHeight: 1.1,
                  mb: 2,
                  textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                {t.headline}
              </Typography>
            </motion.div>

            {/* Subheadline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.9)',
                  maxWidth: '800px',
                  lineHeight: 1.6,
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                }}
              >
                {t.subheadline}
              </Typography>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ mt: 4 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push(`/${language}/catalog`)}
                  endIcon={isRTL ? <ArrowBackIcon /> : <ArrowForwardIcon />}
                  sx={{
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: 'white',
                    color: '#667eea',
                    borderRadius: '50px',
                    textTransform: 'none',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.95)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                    },
                  }}
                >
                  {t.cta}
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  sx={{
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.5)',
                    borderRadius: '50px',
                    textTransform: 'none',
                    backdropFilter: 'blur(10px)',
                    background: 'rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'white',
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {t.secondary}
                </Button>
              </Stack>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              style={{ marginTop: '80px' }}
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Box
                  sx={{
                    width: '30px',
                    height: '50px',
                    border: '2px solid rgba(255,255,255,0.5)',
                    borderRadius: '20px',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '8px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '4px',
                      height: '8px',
                      background: 'white',
                      borderRadius: '2px',
                    },
                  }}
                />
              </motion.div>
            </motion.div>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
}
