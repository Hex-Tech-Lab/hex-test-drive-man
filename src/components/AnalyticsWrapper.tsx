/**
 * Client-side analytics wrapper component
 * Lazy loads Vercel Analytics and Speed Insights after page interactive
 * to avoid blocking initial render and improve FCP
 * 
 * @returns {React.ReactElement | null} Analytics components or null
 */
'use client';

import dynamic from 'next/dynamic';

// Lazy load analytics to avoid blocking initial render
// These components are client-only and don't need SSR
const Analytics = dynamic(
  () => import('@vercel/analytics/react').then((mod) => mod.Analytics),
  { ssr: false }
);

const SpeedInsights = dynamic(
  () => import('@vercel/speed-insights/next').then((mod) => mod.SpeedInsights),
  { ssr: false }
);

/**
 * Wrapper component that lazy loads analytics tools
 * Marked as 'use client' to allow ssr: false in dynamic imports
 */
export default function AnalyticsWrapper() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
