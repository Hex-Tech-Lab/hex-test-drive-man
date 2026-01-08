/**
 * Booking OTP Verification Endpoint
 * Created: 2025-12-07
 * Updated: 2026-01-08 (MVP 1.6 - Unified service layer)
 * Handles POST requests to verify OTP for bookings
 */

import { NextRequest, NextResponse } from 'next/server';
import { bookingWorkflow } from '@/services/BookingWorkflowService';

/**
 * POST /api/bookings/[id]/verify
 * Verify OTP code for a booking
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const body = await request.json();

    // Validate OTP format
    if (!body.otp || typeof body.otp !== 'string' || body.otp.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid OTP format. Must be 6 digits.' },
        { status: 400 }
      );
    }

    // Use unified workflow service
    const result = await bookingWorkflow.verifyBooking(bookingId, body.otp);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      bookingId: result.bookingId,
    });
  } catch (error) {
    console.error('[VERIFY_ENDPOINT] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
