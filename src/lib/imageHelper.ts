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
 * Get retina-ready srcSet for vehicle images with fallback
 * @param imageUrl - The image URL from the database
 * @returns srcSet string with 1x, 2x, 3x variants, or placeholder srcSet
 */
export function getVehicleImageSrcSet(imageUrl: string | null | undefined): string {
  // If no image or invalid, return placeholder srcSet
  if (!imageUrl || (!imageUrl.startsWith('/') && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
    return `${PLACEHOLDER_IMAGE} 1x, ${PLACEHOLDER_IMAGE_2X} 2x, ${PLACEHOLDER_IMAGE_3X} 3x`;
  }

  // For valid images, try to generate retina variants
  // Check if URL already has @2x or @3x suffix
  if (imageUrl.includes('@2x') || imageUrl.includes('@3x')) {
    // Already a retina image, return as-is
    return `${imageUrl} 1x`;
  }

  // Generate retina variants by inserting @2x/@3x before extension
  const lastDot = imageUrl.lastIndexOf('.');
  if (lastDot === -1) {
    // No extension found, use as-is
    return `${imageUrl} 1x`;
  }

  const basePath = imageUrl.substring(0, lastDot);
  const extension = imageUrl.substring(lastDot);

  return `${imageUrl} 1x, ${basePath}@2x${extension} 2x, ${basePath}@3x${extension} 3x`;
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
