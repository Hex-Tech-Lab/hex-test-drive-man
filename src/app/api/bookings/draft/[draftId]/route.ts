/**
 * GET /api/bookings/draft/[draftId]
 * Retrieve draft booking details
 * MVP 1.6 - 3-Step Booking Flow
 * Created: 2026-01-10
 * Agent: BB
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * Get draft booking by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ draftId: string }> }
) {
  try {
    const { draftId } = await params;

    const supabase = createClient();

    const { data: draft, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', draftId)
      .eq('status', 'draft')
      .single();

    if (error || !draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      draft: {
        id: draft.id,
        phone: draft.phone_number,
        vehicleId: draft.vehicle_id,
        vehicleName: draft.metadata?.vehicleName || 'Unknown Vehicle',
        datetime: draft.preferred_datetime,
      },
    });
  } catch (error) {
    console.error('Draft retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
