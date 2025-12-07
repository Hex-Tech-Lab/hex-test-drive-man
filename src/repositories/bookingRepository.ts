// In-memory booking repository for MVP v0
// Created: 2025-12-07
// NOTE: This is a temporary implementation. Will be replaced with Supabase/Drizzle in future iterations.

import { Booking, BookingInput, BookingStatus } from '@/types/booking';

// In-memory storage (resets on server restart)
const bookings: Booking[] = [];

export const bookingRepository = {
  /**
   * Create a new booking
   * @param input - Booking input data
   * @returns Promise resolving to the created booking
   */
  async createBooking(input: BookingInput): Promise<Booking> {
    // Simulate async operation (database write)
    await new Promise(resolve => setTimeout(resolve, 100));

    const booking: Booking = {
      id: crypto.randomUUID(),
      name: input.name,
      phone: input.phone,
      preferredDate: input.preferredDate,
      vehicleId: input.vehicleId,
      notes: input.notes,
      status: 'pending' as BookingStatus,
      createdAt: new Date().toISOString(),
    };

    bookings.push(booking);
    return booking;
  },

  /**
   * Get all bookings (for future admin use)
   * @returns Promise resolving to array of all bookings
   */
  async getAllBookings(): Promise<Booking[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return [...bookings];
  },

  /**
   * Get booking by ID
   * @param id - Booking ID
   * @returns Promise resolving to booking or null if not found
   */
  async getBookingById(id: string): Promise<Booking | null> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return bookings.find(b => b.id === id) || null;
  },

  /**
   * Get bookings by vehicle ID
   * @param vehicleId - Vehicle ID
   * @returns Promise resolving to array of bookings for the vehicle
   */
  async getBookingsByVehicleId(vehicleId: string): Promise<Booking[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return bookings.filter(b => b.vehicleId === vehicleId);
  },
};
