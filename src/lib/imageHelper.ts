const PLACEHOLDER_IMAGE = '/images/vehicles/hero/placeholder.webp';
const PLACEHOLDER_IMAGE_2X = '/images/vehicles/hero/placeholder@2x.webp';
const PLACEHOLDER_IMAGE_3X = '/images/vehicles/hero/placeholder@3x.webp';

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
 * Get srcSet for vehicle images (only for placeholders with known retina variants)
 * @param imageUrl - The image URL from the database
 * @returns srcSet string for placeholder trio, or undefined for real vehicle images
 */
export function getVehicleImageSrcSet(imageUrl: string | null | undefined): string | undefined {
  // If no image or invalid, return placeholder srcSet (only these have @2x/@3x variants)
  if (!imageUrl || (!imageUrl.startsWith('/') && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
    return `${PLACEHOLDER_IMAGE} 1x, ${PLACEHOLDER_IMAGE_2X} 2x, ${PLACEHOLDER_IMAGE_3X} 3x`;
  }

  // For real vehicle images, don't generate srcSet (retina variants don't exist)
  // Browser will use the single image URL from the 'image' prop
  return undefined;
}

/**
 * Get placeholder srcSet for error fallback
 * @returns srcSet string with placeholder variants
 */
export function getPlaceholderSrcSet(): string {
  return `${PLACEHOLDER_IMAGE} 1x, ${PLACEHOLDER_IMAGE_2X} 2x, ${PLACEHOLDER_IMAGE_3X} 3x`;
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
