import { NextRequest, NextResponse } from 'next/server'
import { verifyOtp } from '@/services/sms/engine'
import { createClient } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { otp } = await request.json()
    const bookingId = params.id

    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid OTP format. Must be 6 digits.' },
        { status: 400 }
      )
    }

    // Get booking
    const supabase = createClient()
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('phone_number')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify OTP
    const verified = await verifyOtp(booking.phone_number, otp)

    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP code' },
        { status: 400 }
      )
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        verified_at: new Date().toISOString(),
        status: 'confirmed'
      })
      .eq('id', bookingId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      bookingId,
      message: 'Booking confirmed successfully'
    })
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    )
  }
}
