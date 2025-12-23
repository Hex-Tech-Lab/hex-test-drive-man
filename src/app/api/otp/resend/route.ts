import { NextRequest, NextResponse } from 'next/server';
import { requestOtp } from '@/services/sms/engine';
import { createClient } from '@/lib/supabase';

/**
 * Resend OTP for a booking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Get booking details
    const supabase = createClient();
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('id, phone_number')
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Send OTP
    const otpResult = await requestOtp({
      phone: booking.phone_number,
      subjectType: 'booking',
      subjectId: booking.id
    });

    if (!otpResult.success) {
      console.error('[OTP_RESEND] Failed:', otpResult.error);
      return NextResponse.json(
        { error: otpResult.error || 'Failed to resend OTP' },
        { status: 500 }
      );
    }

    console.log(`[OTP_RESEND] Sent to ${booking.phone_number} for booking ${bookingId}`);

    return NextResponse.json({
      success: true,
      expiresAt: otpResult.expiresAt
    });
  } catch (error) {
    console.error('[OTP_RESEND] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
