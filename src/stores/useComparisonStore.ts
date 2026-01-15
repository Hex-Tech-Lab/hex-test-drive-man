import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Vehicle } from '@/types/vehicle';

interface ComparisonItem {
  trimId: string;
  modelId: string;
  modelName: string;
  brandName: string;
  year: number;
  trimName: string;
  price: number;
  imageUrl: string | null;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  horsepower?: number | null;
  seats?: number | null;
}

interface ComparisonStore {
  items: ComparisonItem[];
  addItem: (item: ComparisonItem) => boolean;
  removeItem: (trimId: string) => void;
  clearAll: () => void;
  isInComparison: (trimId: string) => boolean;
}

/**
 * Comparison store for cross-model vehicle comparison
 * Allows up to 5 vehicles from different models
 * Persists to localStorage for cross-session availability
 */
export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get();

        // Check max limit (5 vehicles)
        if (items.length >= 5) {
          alert('Maximum 5 vehicles can be compared. Please remove one first.');
          return false;
        }

        // Check if already in comparison
        if (items.some((i) => i.trimId === item.trimId)) {
          alert('This trim is already in comparison.');
          return false;
        }

        set({ items: [...items, item] });
        return true;
      },

      removeItem: (trimId) => {
        set((state) => ({ items: state.items.filter((i) => i.trimId !== trimId) }));
      },

      clearAll: () => set({ items: [] }),

      isInComparison: (trimId) => get().items.some((i) => i.trimId === trimId),
    }),
    {
      name: 'comparison-storage',
    },
  ),
);

/**
 * Helper function to create ComparisonItem from Vehicle
 */
export function vehicleToComparisonItem(vehicle: Vehicle): ComparisonItem {
  return {
    trimId: vehicle.id,
    modelId: vehicle.model_id,
    modelName: vehicle.models.name,
    brandName: vehicle.models.brands.name,
    year: vehicle.model_year,
    trimName: vehicle.trim_name,
    price: vehicle.price_egp,
    imageUrl: vehicle.models.hero_image_url,
    bodyType: vehicle.body_styles?.name_en,
    fuelType: vehicle.fuel_types?.name,
    transmission: vehicle.transmissions?.name,
    horsepower: vehicle.horsepower,
    seats: vehicle.seats,
  };
}
