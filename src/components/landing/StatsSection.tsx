'use client';

import { Box, Container, Typography, Grid, Stack } from '@mui/material';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { useLanguageStore } from '@/stores/language-store';

/**
 * Animated statistics counter section
 * Numbers count up when scrolled into view
 */
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 2000 });
  const displayValue = useTransform(springValue, (latest) => Math.round(latest));

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, motionValue, value]);

  return (
    <span ref={ref}>
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </span>
  );
}

/**
 * Statistics section with animated counters
 * Showcases platform metrics and achievements
 */
export default function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const language = useLanguageStore((state) => state.language);

  const content = {
    en: {
      title: 'Trusted by Thousands',
      subtitle: 'Join the fastest-growing automotive platform in Egypt',
      stats: [
        { value: 427, suffix: '+', label: 'Vehicles Available' },
        { value: 95, suffix: '', label: 'Premium Brands' },
        { value: 20, suffix: '', label: 'Verified Dealers' },
        { value: 199, suffix: '', label: 'Unique Models' },
      ],
    },
    ar: {
      title: 'موثوق به من قبل الآلاف',
      subtitle: 'انضم إلى أسرع منصة سيارات نموًا في مصر',
      stats: [
        { value: 427, suffix: '+', label: 'مركبة متاحة' },
        { value: 95, suffix: '', label: 'علامة تجارية فاخرة' },
        { value: 20, suffix: '', label: 'وكيل موثوق' },
        { value: 199, suffix: '', label: 'موديل فريد' },
      ],
    },
  };

  const t = content[language as keyof typeof content];

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              rgba(255,255,255,0.1) 35px,
              rgba(255,255,255,0.1) 70px
            )
          `,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 700,
                color: 'white',
              }}
            >
              {t.title}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1rem', sm: '1.125rem' },
                color: 'rgba(255,255,255,0.9)',
                maxWidth: '600px',
              }}
            >
              {t.subtitle}
            </Typography>
          </Stack>
        </motion.div>

        {/* Stats Grid */}
        <Grid container spacing={4}>
          {t.stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Stack spacing={1} alignItems="center" textAlign="center">
                  <Typography
                    variant="h2"
                    sx={{
                      fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
                      fontWeight: 800,
                      color: 'white',
                      lineHeight: 1,
                    }}
                  >
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.125rem' },
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.9)',
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Stack>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
