import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoriteStore {
  /** Array of favorited vehicle trim IDs */
  favoriteIds: string[];
  /** Loading state for async operations */
  isLoading: boolean;
  /** Flag indicating if user has "authenticated" via soft-gate */
  isAuthenticated: boolean;
  /** Toggle favorite status for a vehicle trim */
  toggleFavorite: (trimId: string) => boolean;
  /** Check if a trim is favorited */
  isFavorite: (trimId: string) => boolean;
  /** Clear all favorites */
  clearAll: () => void;
  /** Set authenticated status (after soft-gate OTP) */
  setAuthenticated: (value: boolean) => void;
  /** Placeholder for future backend sync */
  syncWithBackend: () => Promise<void>;
}

/**
 * Favorites store with soft-gate authentication
 * - Allows up to 2 favorites without authentication
 * - Triggers soft-gate modal when attempting to add 3rd favorite
 * - After "authentication", allows unlimited favorites
 * - Persists to localStorage for cross-session availability
 */
export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      isLoading: false,
      isAuthenticated: false,

      toggleFavorite: (trimId) => {
        const { favoriteIds, isAuthenticated } = get();
        const isFavorited = favoriteIds.includes(trimId);

        // If removing, always allow
        if (isFavorited) {
          set({ favoriteIds: favoriteIds.filter((id) => id !== trimId) });
          return true;
        }

        // If adding and not authenticated, check limit
        if (!isAuthenticated && favoriteIds.length >= 2) {
          // Return false to trigger soft-gate modal
          return false;
        }

        // Add to favorites
        set({ favoriteIds: [...favoriteIds, trimId] });
        return true;
      },

      isFavorite: (trimId) => {
        return get().favoriteIds.includes(trimId);
      },

      clearAll: () => {
        set({ favoriteIds: [] });
      },

      setAuthenticated: (value) => {
        set({ isAuthenticated: value });
      },

      syncWithBackend: async () => {
        // Placeholder for future backend integration
        // Will sync favorites with user account when auth is implemented
        set({ isLoading: true });
        try {
          // TODO: Implement backend sync
          await new Promise((resolve) => setTimeout(resolve, 500));
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'favorite-storage',
    }
  )
);
