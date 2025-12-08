// Bookings API endpoint
// Created: 2025-12-07
// Handles POST requests to create new test drive bookings

import { NextRequest, NextResponse } from 'next/server';
import { bookingRepository } from '@/repositories/bookingRepository';
import { BookingInput } from '@/types/booking';

interface ValidationData {
  name?: unknown;
  phone?: unknown;
  preferredDate?: unknown;
  vehicleId?: unknown;
  notes?: unknown;
}

/**
 * Validate booking input and collect validation errors.
 *
 * Checks that `name`, `phone`, `preferredDate`, and `vehicleId` are present and correctly typed,
 * that `preferredDate` parses to a valid date, and that `notes` (if provided) is a string.
 *
 * @param data - The raw input to validate (typically the parsed request body).
 * @returns An object with `valid`: `true` if all validations pass, `false` otherwise; `errors`: an array of human-readable validation messages.
 */
function validateBookingInput(
  data: unknown
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const d = data as ValidationData;

  if (!d.name || typeof d.name !== 'string' || d.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (!d.phone || typeof d.phone !== 'string' || d.phone.trim().length === 0) {
    errors.push('Phone is required and must be a non-empty string');
  }

  if (!d.preferredDate || typeof d.preferredDate !== 'string') {
    errors.push('Preferred date is required and must be a valid date string');
  } else {
    const date = new Date(d.preferredDate);
    if (isNaN(date.getTime())) {
      errors.push('Preferred date must be a valid ISO 8601 date string');
    }
  }

  if (!d.vehicleId || typeof d.vehicleId !== 'string' || d.vehicleId.trim().length === 0) {
    errors.push('Vehicle ID is required and must be a non-empty string');
  }

  if (d.notes !== undefined && typeof d.notes !== 'string') {
    errors.push('Notes must be a string if provided');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Creates a new test drive booking from the request body.
 *
 * Expects a JSON body with `name`, `phone`, `preferredDate` (ISO date string), `vehicleId`, and optional `notes`.
 *
 * @returns A JSON HTTP response:
 * - Success (201): `{ booking }` with the created booking object.
 * - Validation failure (400): `{ error: 'Invalid booking data', details: string[] }`.
 * - Invalid JSON (400): `{ error: 'Invalid JSON in request body' }`.
 * - Server error (500): `{ error: 'Internal server error' }`.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateBookingInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Invalid booking data',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Create booking
    const bookingInput: BookingInput = {
      name: body.name.trim(),
      phone: body.phone.trim(),
      preferredDate: body.preferredDate,
      vehicleId: body.vehicleId.trim(),
      notes: body.notes?.trim(),
    };

    const booking = await bookingRepository.createBooking(bookingInput);

    return NextResponse.json(
      { booking },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating booking:', error);

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}