/**
 * Service Worker Registration Component
 * Created: 2026-01-08
 * Agent: BB
 * MVP 1.5 Phase 2: Offline Support
 */

'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/serviceWorker';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register service worker on mount
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      registerServiceWorker().catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    }
  }, []);

  return null;
}
