const PLACEHOLDER_IMAGE = '/images/placeholder-car.jpg';

/**
 * Get vehicle image URL with fallback to placeholder
 * @param imageUrl - The image URL from the database
 * @returns Valid image URL or placeholder
 */
export function getVehicleImage(imageUrl: string | null | undefined): string {
  if (!imageUrl) return PLACEHOLDER_IMAGE;

  // Check if URL is valid
  try {
    new URL(imageUrl);
    return imageUrl;
  } catch {
    return PLACEHOLDER_IMAGE;
  }
}

/**
 * Format price in Egyptian Pounds with K/M suffix
 * @param price - Price in EGP
 * @returns Formatted price string
 */
export function formatEGP(price: number, lang: 'en' | 'ar'): string {
  const rounded = Math.round(price / 100_000) * 100_000;
  if (rounded >= 1_000_000) {
    const m = (rounded / 1_000_000).toFixed(2);
    return lang === 'ar' ? `${m} مليون جنيه` : `EGP ${m}M`;
  }
  const k = Math.round(rounded / 1_000);
  return lang === 'ar' ? `${k} ألف جنيه` : `EGP ${k}K`;
}
