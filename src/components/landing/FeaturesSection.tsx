'use client';

import { Box, Container, Typography, Grid, Card, CardContent, Stack } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguageStore } from '@/stores/language-store';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LanguageIcon from '@mui/icons-material/Language';
import SpeedIcon from '@mui/icons-material/Speed';

/**
 * Features section with scroll-triggered animations
 * Showcases key platform capabilities with Material Design cards
 */
export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const language = useLanguageStore((state) => state.language);

  const content = {
    en: {
      title: 'Why Choose GetMyTestDrive',
      subtitle: 'The smartest way to find and test drive your next vehicle',
      features: [
        {
          icon: DirectionsCarIcon,
          title: 'Massive Selection',
          description: '427+ vehicles from 95 premium brands. From budget-friendly to luxury supercars.',
        },
        {
          icon: CompareArrowsIcon,
          title: 'Smart Comparison',
          description: 'Compare up to 3 vehicles side-by-side. See specs, prices, and features instantly.',
        },
        {
          icon: EventAvailableIcon,
          title: 'Instant Booking',
          description: 'Book test drives in seconds. SMS verification and agent assignment included.',
        },
        {
          icon: VerifiedUserIcon,
          title: 'Verified Dealers',
          description: 'All 20 agents are verified Egyptian distributors. Safe and trustworthy.',
        },
        {
          icon: LanguageIcon,
          title: 'Bilingual Support',
          description: 'Full English and Arabic support with native RTL design. Switch anytime.',
        },
        {
          icon: SpeedIcon,
          title: 'Lightning Fast',
          description: 'Built with Next.js 15 and React 19. Instant search, filtering, and navigation.',
        },
      ],
    },
    ar: {
      title: 'لماذا تختار GetMyTestDrive',
      subtitle: 'الطريقة الأذكى للعثور على مركبتك التالية وتجربتها',
      features: [
        {
          icon: DirectionsCarIcon,
          title: 'تشكيلة ضخمة',
          description: 'أكثر من 427 مركبة من 95 علامة تجارية فاخرة. من الاقتصادية إلى السيارات الفائقة الفخامة.',
        },
        {
          icon: CompareArrowsIcon,
          title: 'مقارنة ذكية',
          description: 'قارن ما يصل إلى 3 مركبات جنبًا إلى جنب. شاهد المواصفات والأسعار والميزات فورًا.',
        },
        {
          icon: EventAvailableIcon,
          title: 'حجز فوري',
          description: 'احجز تجارب القيادة في ثوانٍ. التحقق عبر الرسائل القصيرة وتعيين الوكيل متضمن.',
        },
        {
          icon: VerifiedUserIcon,
          title: 'وكلاء موثوقون',
          description: 'جميع الـ 20 وكيلًا هم موزعون مصريون موثوقون. آمن وجدير بالثقة.',
        },
        {
          icon: LanguageIcon,
          title: 'دعم ثنائي اللغة',
          description: 'دعم كامل للإنجليزية والعربية مع تصميم RTL أصلي. التبديل في أي وقت.',
        },
        {
          icon: SpeedIcon,
          title: 'سريع للغاية',
          description: 'مبني باستخدام Next.js 15 و React 19. بحث وتصفية وتنقل فوري.',
        },
      ],
    },
  };

  const t = content[language as keyof typeof content];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
      }}
    >
      <Container maxWidth="lg">
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
                color: '#1a1a1a',
              }}
            >
              {t.title}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1rem', sm: '1.125rem' },
                color: '#666',
                maxWidth: '600px',
              }}
            >
              {t.subtitle}
            </Typography>
          </Stack>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <Grid container spacing={4}>
            {t.features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div variants={itemVariants}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Stack spacing={2}>
                          {/* Icon */}
                          <Box
                            sx={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Icon sx={{ fontSize: 32, color: 'white' }} />
                          </Box>

                          {/* Title */}
                          <Typography
                            variant="h6"
                            sx={{
                              fontSize: '1.25rem',
                              fontWeight: 600,
                              color: '#1a1a1a',
                            }}
                          >
                            {feature.title}
                          </Typography>

                          {/* Description */}
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: '0.95rem',
                              color: '#666',
                              lineHeight: 1.6,
                            }}
                          >
                            {feature.description}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
}
