/**
 * Accessibility utilities for theme configuration
 */

/**
 * Check if user prefers reduced motion (accessibility)
 * Safe for SSR - returns false on server, checks media query on client
 * 
 * @returns true if user prefers reduced motion, false otherwise
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false; // SSR: default to animations enabled
  }
  
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * Get transition duration respecting reduced motion preference
 * Returns 0 if user prefers reduced motion, otherwise returns default duration
 * 
 * @param defaultDuration - Default duration in milliseconds
 * @returns 0 if reduced motion preferred, otherwise defaultDuration
 */
export function getTransitionDuration(defaultDuration: number): number {
  return prefersReducedMotion() ? 0 : defaultDuration;
}
