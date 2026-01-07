// Reservation types for MVP 1.5 booking system
// Created: 2026-01-07
// Agent: BB

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Reservation {
  id: string;
  user_id: string;
  vehicle_id: string;
  reservation_datetime: string; // ISO 8601 timestamp
  status: ReservationStatus;
  national_id: string;
  id_image_url: string | null;
  qr_code_data: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReservationInput {
  vehicle_id: string;
  reservation_datetime: string;
  national_id: string;
  id_image_url?: string;
}

export interface TimeSlot {
  time: string; // HH:mm format
  available: boolean;
}
