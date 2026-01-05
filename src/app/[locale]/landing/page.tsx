import { Metadata } from 'next';
import LandingPageContent from '@/components/landing/LandingPageContent';

export const metadata: Metadata = {
  title: 'Test Drive in Egypt | GetMyTestDrive.com',
  description: 'Book test drives for 3,000+ vehicles from 30+ brands in Egypt. No pressure, no fees. Cairo, Alexandria, Giza locations.',
  keywords: 'test drive egypt, book test drive cairo, car test drive, egyptian cars',
  openGraph: {
    title: 'Test Drive Your Dream Car in Egypt',
    description: '3,000+ vehicles • 30+ brands • No pressure, just drive',
    images: ['/og-image-landing.jpg'],
  },
};

export default function LandingPage() {
  return <LandingPageContent />;
}
