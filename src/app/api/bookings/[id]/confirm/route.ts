/**
 * POST /api/bookings/[id]/confirm
 * Confirm draft booking (step 3 final action)
 * MVP 1.6 - 3-Step Booking Flow
 * Created: 2026-01-10
 * Agent: BB
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * Confirm booking by changing status from draft to pending
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = createClient();

    // Verify draft exists
    const { data: draft, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .eq('status', 'draft')
      .single();

    if (fetchError || !draft) {
      return NextResponse.json(
        { error: 'Draft booking not found' },
        { status: 404 }
      );
    }

    // Update status to pending
    const { data: confirmed, error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Booking confirmation error:', updateError);
      return NextResponse.json(
        { error: 'Failed to confirm booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: confirmed.id,
        status: confirmed.status,
        phone: confirmed.phone_number,
        vehicleId: confirmed.vehicle_id,
        datetime: confirmed.preferred_datetime,
      },
    });
  } catch (error) {
    console.error('Confirmation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
