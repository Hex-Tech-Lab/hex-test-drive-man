// Supabase booking repository for MVP v1
// Created: 2025-12-19 (replacing in-memory implementation)
// Database persistence for bookings with OTP verification

import { createClient } from '@/lib/supabase';
import { Booking, BookingInput, BookingStatus } from '@/types/booking';

export const bookingRepository = {
  /**
   * Create a new booking
   * @param input - Booking input data
   * @returns Promise resolving to the created booking
   */
  async createBooking(input: BookingInput): Promise<Booking> {
    // Basic input validation
    const errors: string[] = [];

    if (!input.name || !input.name.trim()) {
      errors.push('Name is required');
    }
    if (!input.phone || !input.phone.trim()) {
      errors.push('Phone is required');
    }
    if (!input.vehicleId || !input.vehicleId.trim()) {
      errors.push('Vehicle ID is required');
    }

    const MAX_LEN = 255;
    const fieldsToCheck: Array<keyof BookingInput> = ['name', 'phone', 'vehicleId', 'notes'];
    for (const field of fieldsToCheck) {
      const value = input[field];
      if (typeof value === 'string' && value.length > MAX_LEN) {
        errors.push(`${field} must be at most ${MAX_LEN} characters`);
      }
    }

    const date = new Date(input.preferredDate);
    if (isNaN(date.getTime())) {
      errors.push('Invalid preferred date');
    }

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }

    // Create Supabase client
    const supabase = createClient();

    // Insert into database with column name mapping
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        vehicle_id: input.vehicleId,
        test_drive_date: input.preferredDate,
        test_drive_location: input.notes || 'Showroom',
        phone_number: input.phone.trim(),
        status: 'pending',
        phone_verified: false,
        kyc_verified: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create booking:', error);
      throw new Error(`Failed to create booking: ${error.message}`);
    }

    // Map database columns back to Booking type
    const booking: Booking = {
      id: data.id,
      name: input.name,
      phone: data.phone_number,
      preferredDate: data.test_drive_date,
      vehicleId: data.vehicle_id,
      notes: data.test_drive_location,
      status: data.status as BookingStatus,
      createdAt: data.created_at,
    };

    return booking;
  },

  /**
   * Get booking by ID
   * @param id - Booking ID
   * @returns Promise resolving to booking or null if not found
   */
  async getBookingById(id: string): Promise<Booking | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      name: '',
      phone: data.phone_number,
      preferredDate: data.test_drive_date,
      vehicleId: data.vehicle_id,
      notes: data.test_drive_location,
      status: data.status as BookingStatus,
      createdAt: data.created_at,
    };
  },

  /**
   * Mark booking phone as verified
   * @param id - Booking ID
   */
  async markPhoneVerified(id: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from('bookings')
      .update({
        phone_verified: true,
        verified_at: new Date().toISOString(),
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Failed to mark phone as verified:', error);
      throw new Error(`Failed to mark phone as verified: ${error.message}`);
    }
  },
};
