import { notFound, redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Vehicles index route.
 *
 * The catalog page lives at `/${locale}` (src/app/[locale]/page.tsx).
 * Keep `/[locale]/vehicles` as a compatibility route that redirects.
 */
export default async function VehiclesIndexPage({ params }: PageProps) {
  const { locale } = await params;

  if (locale !== 'en' && locale !== 'ar') {
    notFound();
  }

  redirect(`/${locale}`);
}
