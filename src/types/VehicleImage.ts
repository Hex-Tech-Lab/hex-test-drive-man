/**
 * Vehicle Image Configuration Types
 *
 * Defines image metadata for vehicle hero and hover (dashboard/interior) images.
 * Images should be royalty-free or OEM-approved, matching exact brand/model/year/trim.
 */

export type VehicleImageVariant = 'hero' | 'hover';

export interface VehicleImageConfig {
  /** Vehicle brand (e.g. "BMW", "Mercedes-Benz") */
  brand: string;

  /** Vehicle model (e.g. "X5", "C-Class") */
  model: string;

  /** Model year (e.g. 2024) */
  year: number;

  /** Highest trim label if known (e.g. "M Sport", "AMG") */
  trim?: string;

  /** Path to hero/exterior image (relative to public/) */
  heroPath: string;

  /** Path to hover/interior/dashboard image (relative to public/) */
  hoverPath: string;

  /** License type for legal compliance */
  license: 'royalty_free' | 'oem_approved' | 'unknown_check';

  /** Original source URL for audit and attribution */
  sourceUrl: string;
}

/**
 * Extended vehicle type with image configuration
 * Used to enrich Vehicle data with image metadata
 *
 * This type intersects with the base Vehicle type to add imageConfig
 */
export interface VehicleWithImagesExtension {
  imageConfig?: VehicleImageConfig;
}
