'use client';

import { Box, Container, Typography, Stack, Step, StepLabel, Stepper } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguageStore } from '@/stores/language-store';
import SearchIcon from '@mui/icons-material/Search';
import CompareIcon from '@mui/icons-material/Compare';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

/**
 * How It Works section with animated step-by-step process
 * Uses Material Design Stepper with custom styling
 */
export default function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const language = useLanguageStore((state) => state.language);
  const isRTL = language === 'ar';

  const content = {
    en: {
      title: 'How It Works',
      subtitle: 'Four simple steps to your dream car',
      steps: [
        {
          icon: SearchIcon,
          label: 'Browse & Filter',
          description: 'Explore 427+ vehicles. Filter by brand, price, type, and specs.',
        },
        {
          icon: CompareIcon,
          label: 'Compare Options',
          description: 'Select up to 3 vehicles for side-by-side comparison.',
        },
        {
          icon: EventIcon,
          label: 'Book Test Drive',
          description: 'Choose your preferred date and time. SMS verification included.',
        },
        {
          icon: CheckCircleIcon,
          label: 'Meet & Drive',
          description: 'Meet with verified dealer and experience your dream car.',
        },
      ],
    },
    ar: {
      title: 'كيف يعمل',
      subtitle: 'أربع خطوات بسيطة إلى سيارة أحلامك',
      steps: [
        {
          icon: SearchIcon,
          label: 'تصفح وفلتر',
          description: 'استكشف أكثر من 427 مركبة. فلتر حسب العلامة التجارية والسعر والنوع والمواصفات.',
        },
        {
          icon: CompareIcon,
          label: 'قارن الخيارات',
          description: 'اختر ما يصل إلى 3 مركبات للمقارنة جنبًا إلى جنب.',
        },
        {
          icon: EventIcon,
          label: 'احجز تجربة القيادة',
          description: 'اختر التاريخ والوقت المفضل لديك. التحقق عبر الرسائل القصيرة متضمن.',
        },
        {
          icon: CheckCircleIcon,
          label: 'التقي وقد',
          description: 'التقي بالوكيل الموثوق واختبر سيارة أحلامك.',
        },
      ],
    },
  };

  const t = content[language as keyof typeof content];

  return (
    <Box
      id="how-it-works"
      ref={ref}
      sx={{
        py: { xs: 8, md: 12 },
        background: 'white',
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

        {/* Steps */}
        <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
          <Stepper
            activeStep={-1}
            orientation="vertical"
            sx={{
              '& .MuiStepConnector-line': {
                borderLeftWidth: 2,
                borderColor: '#e0e0e0',
                minHeight: '60px',
              },
            }}
          >
            {t.steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Step key={index} expanded>
                  <StepLabel
                    StepIconComponent={() => (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={isInView ? { scale: 1, opacity: 1 } : {}}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                      >
                        <Box
                          sx={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                          }}
                        >
                          <Icon sx={{ fontSize: 36, color: 'white' }} />
                        </Box>
                      </motion.div>
                    )}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.6, delay: index * 0.2 + 0.2 }}
                    >
                      <Box sx={{ ml: isRTL ? 0 : 3, mr: isRTL ? 3 : 0, pb: 4 }}>
                        <Typography
                          variant="h5"
                          sx={{
                            fontSize: { xs: '1.25rem', sm: '1.5rem' },
                            fontWeight: 600,
                            color: '#1a1a1a',
                            mb: 1,
                          }}
                        >
                          {step.label}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: { xs: '0.95rem', sm: '1rem' },
                            color: '#666',
                            lineHeight: 1.6,
                          }}
                        >
                          {step.description}
                        </Typography>
                      </Box>
                    </motion.div>
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </Box>
      </Container>
    </Box>
  );
}
