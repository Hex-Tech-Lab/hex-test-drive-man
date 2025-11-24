import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
  brands: string[];
  categories: string[];
  priceRange: [number, number];
  bodyStyle?: string | null;
  segmentCode?: string | null;
  agent?: string | null;
  setFilters: (filters: Partial<Omit<FilterState, 'setFilters' | 'resetFilters'>>) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      brands: [],
      categories: [],
      priceRange: [0, 20_000_000],
      bodyStyle: null,
      segmentCode: null,
      agent: null,
      setFilters: (filters) => set((state) => ({ ...state, ...filters })),
      resetFilters: () =>
        set({
          brands: [],
          categories: [],
          priceRange: [0, 5_000_000],
          bodyStyle: null,
          segmentCode: null,
          agent: null,
        }),
    }),
    {
      name: 'vehicle-filters',
    }
  )
);
