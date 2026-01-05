/**
 * Skeleton loading components for consistent loading states
 * 
 * Usage:
 * ```tsx
 * import { SkeletonCard, SkeletonTable, SkeletonHero } from '@/components/skeletons';
 * 
 * // In your component
 * {isLoading ? <SkeletonCard /> : <VehicleCard data={vehicle} />}
 * ```
 */

export { default as SkeletonCard } from './SkeletonCard';
export { default as SkeletonTable } from './SkeletonTable';
export { default as SkeletonHero } from './SkeletonHero';
