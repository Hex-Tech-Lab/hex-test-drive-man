import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '@/services/sms/engine';
import { createClient } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: bookingId } = await params;
    const { otp } = await request.json();

    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid OTP format. Must be 6 digits.' },
        { status: 400 },
      );
    }

    const supabase = createClient();
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('phone_number')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const verified = await verifyOtp(booking.phone_number, otp);

    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP code' },
        { status: 400 },
      );
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ verified_at: new Date().toISOString(), status: 'confirmed' })
      .eq('id', bookingId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, bookingId });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
