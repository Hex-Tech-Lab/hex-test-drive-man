// Single booking API endpoint
// Created: 2026-01-08
// Agent: BB
// GET endpoint for retrieving booking details

import { NextRequest, NextResponse } from 'next/server';
import { bookingRepository } from '@/repositories/bookingRepository';
import { captureSentryError } from '@/lib/sentry-user';

/**
 * GET /api/bookings/[id] - Get single booking by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const booking = await bookingRepository.getBookingById(id);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      bookingId: booking.id,
      ...booking
    });
  } catch (error) {
    console.error('GET /api/bookings/[id] error:', error);
    captureSentryError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: '/api/bookings/[id]', method: 'GET' }
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
