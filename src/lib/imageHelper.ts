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

export function formatEGP(price: number | null | undefined, language: string): string {
  if (!price || price <= 0) {
    return language === 'ar' ? 'السعر عند الطلب' : 'Price on request';
  }
  const formatted = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US').format(price);
  return `${formatted} EGP`;
}
 
