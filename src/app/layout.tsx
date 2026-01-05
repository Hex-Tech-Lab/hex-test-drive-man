import type { Metadata } from 'next';
import AppProviders from '@/components/AppProviders';
import { AnalyticsWrapper } from '@/components/AnalyticsWrapper';

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
        <AnalyticsWrapper />
      </body>
    </html>
  );
}
