/**
 * Vehicle Images Configuration
 *
 * Central registry for vehicle hero and hover images.
 * Images are stored in public/images/vehicles/{brand-slug}/{model-slug}/{year}/
 *
 * HOW TO ADD NEW ENTRIES:
 * 1. Add a new VehicleImageConfig object to the array below
 * 2. Source high-quality royalty-free images (same brand, model, year, trim)
 * 3. Place images in: public/images/vehicles/{brand-slug}/{model-slug}/{year}/
 *    - hero.jpg (exterior/side view)
 *    - hover.jpg (interior/dashboard view)
 * 4. Use lowercase kebab-case for brand and model slugs
 * 5. Document the source URL for audit purposes
 *
 * EXAMPLE STRUCTURE:
 *   BMW X5 2024 → public/images/vehicles/bmw/x5/2024/hero.jpg
 *                 public/images/vehicles/bmw/x5/2024/hover.jpg
 */

import type { VehicleImageConfig } from '@/types/VehicleImage';

/**
 * Image configuration registry
 * Add new vehicles here following the pattern below
 */
const vehicleImagesConfig: readonly VehicleImageConfig[] = [
  {
    brand: 'BMW',
    model: 'X5',
    year: 2024,
    trim: 'M Sport',
    heroPath: '/images/vehicles/bmw/x5/2024/hero.jpg',
    hoverPath: '/images/vehicles/bmw/x5/2024/hover.jpg',
    license: 'royalty_free',
    sourceUrl: 'https://example.com/bmw-x5-2024-images',
  },
  {
    brand: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2024,
    trim: 'AMG Line',
    heroPath: '/images/vehicles/mercedes-benz/c-class/2024/hero.jpg',
    hoverPath: '/images/vehicles/mercedes-benz/c-class/2024/hover.jpg',
    license: 'royalty_free',
    sourceUrl: 'https://example.com/mercedes-c-class-2024-images',
  },
  {
    brand: 'Toyota',
    model: 'Camry',
    year: 2024,
    trim: 'XSE',
    heroPath: '/images/vehicles/toyota/camry/2024/hero.jpg',
    hoverPath: '/images/vehicles/toyota/camry/2024/hover.jpg',
    license: 'royalty_free',
    sourceUrl: 'https://example.com/toyota-camry-2024-images',
  },
  {
    brand: 'Audi',
    model: 'Q7',
    year: 2024,
    trim: 'S-Line',
    heroPath: '/images/vehicles/audi/q7/2024/hero.jpg',
    hoverPath: '/images/vehicles/audi/q7/2024/hover.jpg',
    license: 'royalty_free',
    sourceUrl: 'https://example.com/audi-q7-2024-images',
  },
] as const;

/**
 * Normalize string for case-insensitive comparison
 */
function normalize(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, '-');
}

/**
 * Get vehicle image configuration by brand, model, and optional year
 *
 * @param brand - Vehicle brand (case-insensitive)
 * @param model - Vehicle model (case-insensitive)
 * @param year - Optional model year (if omitted, returns latest year match)
 * @returns VehicleImageConfig or null if not found
 *
 * @example
 * getVehicleImages('BMW', 'X5', 2024)
 * // Returns image config for BMW X5 2024
 *
 * getVehicleImages('bmw', 'x5')
 * // Returns latest year BMW X5 config
 */
export function getVehicleImages(
  brand: string,
  model: string,
  year?: number
): VehicleImageConfig | null {
  const normalizedBrand = normalize(brand);
  const normalizedModel = normalize(model);

  // Find all matching brand/model entries
  const matches = vehicleImagesConfig.filter(
    (config) =>
      normalize(config.brand) === normalizedBrand &&
      normalize(config.model) === normalizedModel
  );

  if (matches.length === 0) {
    return null;
  }

  // If year specified, find exact match
  if (year !== undefined) {
    const exactMatch = matches.find((config) => config.year === year);
    if (exactMatch) {
      return { ...exactMatch };
    }
  }

  // Return latest year as fallback
  const latestConfig = matches.reduce((latest, current) =>
    current.year > latest.year ? current : latest
  );

  return { ...latestConfig };
}

/**
 * Get all configured vehicle images
 * Useful for debugging and admin panels
 */
export function getAllVehicleImages(): readonly VehicleImageConfig[] {
  return vehicleImagesConfig;
}

/**
 * Check if vehicle has image configuration
 */
export function hasVehicleImages(
  brand: string,
  model: string,
  year?: number
): boolean {
  return getVehicleImages(brand, model, year) !== null;
}
