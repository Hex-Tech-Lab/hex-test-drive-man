'use client';

import dynamic from 'next/dynamic';

/**
 * Client-side analytics wrapper component
 * Lazy loads Vercel Analytics and Speed Insights after page interactive
 */

// Lazy load analytics after page interactive (non-blocking)
const Analytics = dynamic(
  () => import('@vercel/analytics/react').then((mod) => mod.Analytics),
  { ssr: false },
);

const SpeedInsights = dynamic(
  () => import('@vercel/speed-insights/next').then((mod) => mod.SpeedInsights),
  { ssr: false },
);

/**
 *
 */
export function AnalyticsWrapper() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
