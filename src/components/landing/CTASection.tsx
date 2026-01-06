'use client';

import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguageStore } from '@/stores/language-store';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * Final call-to-action section
 * Encourages users to start browsing the catalog
 */
export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const router = useRouter();
  const language = useLanguageStore((state) => state.language);
  const isRTL = language === 'ar';

  const content = {
    en: {
      title: 'Ready to Find Your Perfect Car?',
      subtitle: 'Start exploring our catalog of 427+ vehicles today',
      cta: 'Browse Catalog',
    },
    ar: {
      title: 'هل أنت مستعد للعثور على سيارتك المثالية؟',
      subtitle: 'ابدأ في استكشاف كتالوجنا الذي يضم أكثر من 427 مركبة اليوم',
      cta: 'تصفح الكتالوج',
    },
  };

  const t = content[language as keyof typeof content];

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 10, md: 14 },
        background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circles */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '-100px',
          left: '-100px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        style={{
          position: 'absolute',
          bottom: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(118, 75, 162, 0.2) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <Stack spacing={4} alignItems="center" textAlign="center">
            {/* Title */}
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 700,
                color: '#1a1a1a',
                lineHeight: 1.2,
              }}
            >
              {t.title}
            </Typography>

            {/* Subtitle */}
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                color: '#666',
                maxWidth: '600px',
                lineHeight: 1.6,
              }}
            >
              {t.subtitle}
            </Typography>

            {/* CTA Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push(`/${language}/catalog`)}
                endIcon={isRTL ? <ArrowBackIcon /> : <ArrowForwardIcon />}
                sx={{
                  px: 6,
                  py: 2.5,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '50px',
                  textTransform: 'none',
                  boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {t.cta}
              </Button>
            </motion.div>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
}
