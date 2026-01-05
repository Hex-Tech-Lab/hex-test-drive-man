import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import AppProviders from '@/components/AppProviders';

// Lazy load analytics after page interactive (non-blocking)
const Analytics = dynamic(
  () => import('@vercel/analytics/react').then((mod) => mod.Analytics),
  { ssr: false }
);

const SpeedInsights = dynamic(
  () => import('@vercel/speed-insights/next').then((mod) => mod.SpeedInsights),
  { ssr: false }
);

export const metadata: Metadata = {
  title: 'HEX Test Drive Platform',
  description: 'Book test drives for luxury and premium vehicles in Egypt',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProviders>
          {children}
        </AppProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
