import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import AppProviders from '@/components/AppProviders';
import { AnalyticsWrapper } from '@/components/AnalyticsWrapper';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';

const cairo = Cairo({
  weight: ['400', '700'],
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-cairo',
});

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
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1976d2" />
      </head>
      <body suppressHydrationWarning>
        <AppProviders>
          {children}
        </AppProviders>
        <AnalyticsWrapper />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
