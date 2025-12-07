// Booking types for test drive appointments
// Created: 2025-12-07
// Part of Booking System MVP v0

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface BookingInput {
  name: string;
  phone: string;
  preferredDate: string; // ISO 8601 date string
  vehicleId: string;
  notes?: string;
}

export interface Booking {
  id: string;
  name: string;
  phone: string;
  preferredDate: string;
  vehicleId: string;
  notes?: string;
  status: BookingStatus;
  createdAt: string; // ISO 8601 timestamp
}
