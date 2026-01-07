import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoriteStore {
  favoriteVehicleIds: string[];
  toggleFavorite: (vehicleId: string) => void;
  isFavorite: (vehicleId: string) => boolean;
  clearFavorites: () => void;
  getFavoriteCount: () => number;
  // Placeholder for future sync with backend
  syncFavorites: () => Promise<void>;
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      favoriteVehicleIds: [],
      
      toggleFavorite: (vehicleId: string) => {
        set((state) => {
          const exists = state.favoriteVehicleIds.includes(vehicleId);
          return {
            favoriteVehicleIds: exists
              ? state.favoriteVehicleIds.filter(id => id !== vehicleId)
              : [...state.favoriteVehicleIds, vehicleId],
          };
        });
      },
      
      isFavorite: (vehicleId: string) => {
        return get().favoriteVehicleIds.includes(vehicleId);
      },
      
      clearFavorites: () => {
        set({ favoriteVehicleIds: [] });
      },
      
      getFavoriteCount: () => {
        return get().favoriteVehicleIds.length;
      },
      
      // Placeholder for MVP 1.5+ backend sync
      syncFavorites: async () => {
        // TODO: Implement backend sync when auth is ready
        console.log('Favorites sync placeholder - auth not implemented yet');
      },
    }),
    {
      name: 'favorite-storage', // localStorage key
    },
  ),
);
