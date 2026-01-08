// Reservation repository for database operations
// Created: 2026-01-07
// Agent: BB
// Pattern: Repository pattern with Supabase

import { createClient } from '@/lib/supabase';
import type { Reservation, ReservationInput, TimeSlot } from '@/types/reservation';

const supabase = createClient();

/**
 * Creates a new reservation
 */
export async function createReservation(
  userId: string,
  input: ReservationInput,
): Promise<{ data: Reservation | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        user_id: userId,
        vehicle_id: input.vehicle_id,
        reservation_datetime: input.reservation_datetime,
        national_id: input.national_id,
        id_image_url: input.id_image_url || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Gets all reservations for a user
 */
export async function getUserReservations(
  userId: string,
): Promise<{ data: Reservation[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', userId)
      .order('reservation_datetime', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Gets a single reservation by ID
 */
export async function getReservationById(
  id: string,
): Promise<{ data: Reservation | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Updates reservation status
 */
export async function updateReservationStatus(
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
): Promise<{ data: Reservation | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Updates reservation with QR code data
 */
export async function updateReservationQRCode(
  id: string,
  qrCodeData: string,
): Promise<{ data: Reservation | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .update({ qr_code_data: qrCodeData })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Checks available time slots for a vehicle on a specific date
 */
export async function getAvailableTimeSlots(
  vehicleId: string,
  date: string, // YYYY-MM-DD format
): Promise<{ data: TimeSlot[] | null; error: Error | null }> {
  try {
    // Get all reservations for this vehicle on this date
    const startOfDay = `${date}T00:00:00Z`;
    const endOfDay = `${date}T23:59:59Z`;

    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('reservation_datetime')
      .eq('vehicle_id', vehicleId)
      .gte('reservation_datetime', startOfDay)
      .lte('reservation_datetime', endOfDay)
      .in('status', ['pending', 'confirmed']);

    if (error) throw error;

    // Generate time slots from 9 AM to 6 PM (1-hour blocks)
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const datetime = `${date}T${time}:00Z`;
      
      const isBooked = reservations?.some(
        (r) => r.reservation_datetime === datetime,
      );

      slots.push({
        time,
        available: !isBooked,
      });
    }

    return { data: slots, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Cancels a reservation
 */
export async function cancelReservation(
  id: string,
): Promise<{ data: Reservation | null; error: Error | null }> {
  return updateReservationStatus(id, 'cancelled');
}

/**
 * Uploads ID image to Supabase Storage
 */
export async function uploadIDImage(
  userId: string,
  file: File,
): Promise<{ data: string | null; error: Error | null }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `id-uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('reservations')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('reservations')
      .getPublicUrl(filePath);

    return { data: publicUrl, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
