// Single booking API endpoint
// Created: 2026-01-08
// Agent: BB
// Updated: 2026-01-11 (CC Security Hardening)
// GET endpoint for retrieving booking details

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { bookingRepository } from '@/repositories/bookingRepository';
import { captureSentryError } from '@/lib/sentry-user';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/bookings/[id] - Get single booking by ID
 * Security: Requires authentication and ownership verification
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Input validation with UUID format check
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: 'Invalid booking ID format' },
        { status: 400 }
      );
    }

    // 2. Authentication check (CRITICAL)
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    // 3. Fetch booking
    const booking = await bookingRepository.getBookingById(id);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // 4. Authorization check (CRITICAL) - Verify ownership
    // Note: Booking type needs userId field added, currently using type assertion
    const bookingWithUser = booking as typeof booking & { user_id?: string };

    if (bookingWithUser.user_id && bookingWithUser.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have access to this booking' },
        { status: 403 }
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
