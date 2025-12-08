import crypto from 'crypto';
import { Booking, BookingInput, BookingStatus } from '@/types/booking';

// In-memory storage (replace with database in production)
const bookings: Booking[] = [];

/**
 * Validates booking input and returns array of error messages
 */
function validateBookingInput(input: BookingInput): string[] {
  const errors: string[] = [];

  // Validate required fields
  if (!input.name?.trim()) {
    errors.push('Name is required');
  }
  if (!input.phone?.trim()) {
    errors.push('Phone number is required');
  }
  if (!input.vehicleId?.trim()) {
    errors.push('Vehicle ID is required');
  }

  // Validate preferred date
  if (!input.preferredDate) {
    errors.push('Preferred date is required');
  } else {
    const date = new Date(input.preferredDate);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      errors.push('Invalid preferred date format');
    }
    
    // Validate date is in the future
    if (date.getTime() <= Date.now()) {
      errors.push('Preferred date must be in the future');
    }
  }

  return errors;
}

export const bookingRepository = {
  /**
   * Creates a new test drive booking
   */
  async createBooking(input: BookingInput): Promise<Booking> {
    // Validate input
    const validationErrors = validateBookingInput(input);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    const booking: Booking = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      phone: input.phone.trim(),
      preferredDate: new Date(input.preferredDate),
      vehicleId: input.vehicleId.trim(),
      notes: input.notes?.trim(),
      status: 'pending' as BookingStatus,
      createdAt: new Date(),
    };

    bookings.push(booking);
    return booking;
  },

  /**
   * Retrieves all bookings
   */
  async getAllBookings(): Promise<Booking[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return [...bookings];
  },

  /**
   * Retrieves a booking by ID
   */
  async getBookingById(id: string): Promise<Booking | null> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return bookings.find(b => b.id === id) || null;
  },

  /**
   * Retrieves bookings for a specific vehicle
   */
  async getBookingsByVehicleId(vehicleId: string): Promise<Booking[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return bookings.filter(b => b.vehicleId === vehicleId);
  },
};
