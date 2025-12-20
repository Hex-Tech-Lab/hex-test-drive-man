// Bookings API endpoint
// Created: 2025-12-07
// Handles POST requests to create new test drive bookings

import { NextRequest, NextResponse } from 'next/server';
import { bookingRepository } from '@/repositories/bookingRepository';
import { BookingInput } from '@/types/booking';
import { captureSentryError } from '@/lib/sentry-user';
import { requestOtp } from '@/services/sms/engine';

interface ValidationData {
  name?: unknown;
  phone?: unknown;
  preferredDate?: unknown;
  vehicleId?: unknown;
  notes?: unknown;
}

/**
 * Validate booking input data
 */
function validateBookingInput(
  data: unknown
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof data !== 'object' || data === null) {
    return {
      valid: false,
      errors: ['Body must be a JSON object'],
    };
  }

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
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      if (date < today) {
        errors.push('Preferred date cannot be in the past');
      }
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
 * POST /api/bookings
 * Create a new test drive booking
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

    // Send OTP via SMS
    const otpResult = await requestOtp({
      phone: booking.phone,
      subjectType: 'booking',
      subjectId: booking.id
    });

    if (!otpResult.success) {
      console.error('[BOOKING] OTP send failed:', otpResult.error);
      // Booking created but SMS failed - return partial success
      return NextResponse.json(
        {
          booking,
          warning: 'Booking created but SMS failed to send',
          smsError: otpResult.error
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      booking,
      { status: 201 }
    );
  } catch (error) {
    // Log error to Sentry with context
    captureSentryError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: '/api/bookings', method: 'POST' }
    );

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