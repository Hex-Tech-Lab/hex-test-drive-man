'use client';

import { useEffect } from 'react';
import { Box } from '@mui/material';
import Header from '@/components/Header';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import StatsSection from '@/components/landing/StatsSection';
import CTASection from '@/components/landing/CTASection';
import { useLanguageStore } from '@/stores/language-store';
import { useParams } from 'next/navigation';

/**
 * Grok-inspired marketing landing page
 * Features fluid motion animations, Material Design 3 aesthetics,
 * and world-class UI/UX with bilingual EN/AR support
 */
export default function LandingPage() {
  const params = useParams();
  const locale = params.locale as string;
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  useEffect(() => {
    if (locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    }
  }, [locale, setLanguage]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'white',
      }}
    >
      <Header />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <CTASection />
    </Box>
  );
}
