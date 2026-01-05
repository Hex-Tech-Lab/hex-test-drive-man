import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Vehicle } from '@/types/vehicle';

interface BookingItem {
  trimId: string;
  modelId: string;
  modelName: string;
  brandName: string;
  year: number;
  trimName: string;
  price: number;
  imageUrl: string | null;
  addedAt: number; // timestamp in milliseconds
}

interface BookingStore {
  items: BookingItem[];
  addItem: (item: Omit<BookingItem, 'addedAt'>) => boolean;
  removeItem: (trimId: string) => void;
  clearAll: () => void;
  isInCart: (trimId: string) => boolean;
  getRecentItems: () => BookingItem[];
}

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Booking cart store for test drive appointments
 * Enforces max 3 bookings within 90-day rolling window
 * Persists to localStorage
 */
export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get();
        const now = Date.now();
        const ninetyDaysAgo = now - NINETY_DAYS_MS;

        // Filter items within 90-day window
        const recentItems = items.filter((i) => i.addedAt > ninetyDaysAgo);

        // Check 90-day limit (max 3 test drives)
        if (recentItems.length >= 3) {
          alert(
            'Maximum 3 test drives can be booked within 90 days. Please wait or complete an existing booking.'
          );
          return false;
        }

        // Check if already in cart
        if (items.some((i) => i.trimId === item.trimId)) {
          alert('This vehicle is already in your booking cart.');
          return false;
        }

        set({ items: [...items, { ...item, addedAt: now }] });
        return true;
      },

      removeItem: (trimId) => {
        set((state) => ({ items: state.items.filter((i) => i.trimId !== trimId) }));
      },

      clearAll: () => set({ items: [] }),

      isInCart: (trimId) => get().items.some((i) => i.trimId === trimId),

      getRecentItems: () => {
        const { items } = get();
        const now = Date.now();
        const ninetyDaysAgo = now - NINETY_DAYS_MS;
        return items.filter((i) => i.addedAt > ninetyDaysAgo);
      },
    }),
    {
      name: 'booking-storage',
    }
  )
);

/**
 * Helper function to create BookingItem from Vehicle
 */
export function vehicleToBookingItem(vehicle: Vehicle): Omit<BookingItem, 'addedAt'> {
  return {
    trimId: vehicle.id,
    modelId: vehicle.model_id,
    modelName: vehicle.models.name,
    brandName: vehicle.models.brands.name,
    year: vehicle.model_year,
    trimName: vehicle.trim_name,
    price: vehicle.price_egp,
    imageUrl: vehicle.models.hero_image_url,
  };
}
