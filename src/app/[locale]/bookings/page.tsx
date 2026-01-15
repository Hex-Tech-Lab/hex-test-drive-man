'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

/**
 * Booking redirect page - redirects to catalog
 * Users must select a vehicle from catalog before booking
 */
export default function BookingRedirect() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  useEffect(() => {
    // Redirect to catalog - vehicles must be selected before booking
    router.push(`/${locale}/catalog`);
  }, [router, locale]);

  return null;
}
