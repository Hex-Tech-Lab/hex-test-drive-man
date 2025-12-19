const PLACEHOLDER_IMAGE = '/images/placeholder-car.jpg';

/**
 * Get vehicle image URL with fallback to placeholder
 * @param imageUrl - The image URL from the database
 * @returns Valid image URL or placeholder
 */
export function getVehicleImage(imageUrl: string | null | undefined): string {
  if (!imageUrl) return PLACEHOLDER_IMAGE;

  // Accept both relative paths (starting with /) and absolute URLs
  if (imageUrl.startsWith('/') || imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Invalid format
  return PLACEHOLDER_IMAGE;
}

/**
 * Format price in Egyptian Pounds to nearest 1,000
 * @param price - Price in EGP
 * @returns Formatted price string
 */
export function formatEGP(price: number, lang: 'en' | 'ar'): string {
  // Round to nearest 1,000
  const rounded = Math.round(price / 1000) * 1000;
  
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(rounded);
}
