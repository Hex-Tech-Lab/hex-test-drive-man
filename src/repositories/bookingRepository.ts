// Booking repository - Supabase implementation
// Created: 2025-12-07
// Updated: 2025-12-08 - Migrated from in-memory to Supabase
// Purpose: Lead capture staging area before test_drive_sessions conversion

import { Booking, BookingInput, BookingStatus } from '@/types/booking';
import { supabase } from '@/lib/supabase';

export const bookingRepository = {
  /**
   * Create a new booking
   * @param input - Booking input data
   * @returns Promise resolving to the created booking
   */
  async createBooking(input: BookingInput): Promise<Booking> {
    const { data, error} = await supabase
      .from('bookings')
      .insert({
        customer_name: input.name,
        customer_phone: input.phone,
        vehicle_trim_id: input.vehicleId,
        preferred_date: input.preferredDate,
        notes: input.notes,
        status: 'pending' as BookingStatus,
      })
      .select('id, customer_name, customer_phone, vehicle_trim_id, preferred_date, notes, status, created_at')
      .single();

    if (error) {
      throw new Error(`Failed to create booking: ${error.message}`);
    }

    // Map Supabase column names to TypeScript interface
    return {
      id: data.id,
      name: data.customer_name,
      phone: data.customer_phone,
      vehicleId: data.vehicle_trim_id,
      preferredDate: data.preferred_date,
      notes: data.notes,
      status: data.status as BookingStatus,
      createdAt: data.created_at,
    };
  },

  /**
   * Get all bookings (for admin dashboard)
   * @param status - Optional status filter
   * @returns Promise resolving to array of all bookings
   */
  async getAllBookings(status?: BookingStatus): Promise<Booking[]> {
    let query = supabase
      .from('bookings')
      .select('id, customer_name, customer_phone, vehicle_trim_id, preferred_date, notes, status, created_at')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch bookings: ${error.message}`);
    }

    return (data || []).map(row => ({
      id: row.id,
      name: row.customer_name,
      phone: row.customer_phone,
      vehicleId: row.vehicle_trim_id,
      preferredDate: row.preferred_date,
      notes: row.notes,
      status: row.status as BookingStatus,
      createdAt: row.created_at,
    }));
  },

  /**
   * Get booking by ID
   * @param id - Booking ID
   * @returns Promise resolving to booking or null if not found
   */
  async getBookingById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, customer_name, customer_phone, vehicle_trim_id, preferred_date, notes, status, created_at')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch booking: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.customer_name,
      phone: data.customer_phone,
      vehicleId: data.vehicle_trim_id,
      preferredDate: data.preferred_date,
      notes: data.notes,
      status: data.status as BookingStatus,
      createdAt: data.created_at,
    };
  },

  /**
   * Get bookings by vehicle ID
   * @param vehicleId - Vehicle trim ID
   * @returns Promise resolving to array of bookings for the vehicle
   */
  async getBookingsByVehicleId(vehicleId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, customer_name, customer_phone, vehicle_trim_id, preferred_date, notes, status, created_at')
      .eq('vehicle_trim_id', vehicleId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch bookings for vehicle: ${error.message}`);
    }

    return (data || []).map(row => ({
      id: row.id,
      name: row.customer_name,
      phone: row.customer_phone,
      vehicleId: row.vehicle_trim_id,
      preferredDate: row.preferred_date,
      notes: row.notes,
      status: row.status as BookingStatus,
      createdAt: row.created_at,
    }));
  },

  /**
   * Update booking status
   * @param id - Booking ID
   * @param status - New status
   * @param convertedToSessionId - Optional session ID if converting
   * @returns Promise resolving to updated booking
   */
  async updateBookingStatus(
    id: string,
    status: BookingStatus,
    convertedToSessionId?: string
  ): Promise<Booking> {
    const updateData: Record<string, unknown> = { status };
    if (convertedToSessionId) {
      updateData.converted_to_session_id = convertedToSessionId;
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select('id, customer_name, customer_phone, vehicle_trim_id, preferred_date, notes, status, created_at')
      .single();

    if (error) {
      throw new Error(`Failed to update booking status: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.customer_name,
      phone: data.customer_phone,
      vehicleId: data.vehicle_trim_id,
      preferredDate: data.preferred_date,
      notes: data.notes,
      status: data.status as BookingStatus,
      createdAt: data.created_at,
    };
  },
};
