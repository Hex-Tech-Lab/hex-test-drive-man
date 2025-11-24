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

 
