/**
 * POST /api/bookings/draft
 * Create draft booking (step 2 → step 3)
 * MVP 1.6 - 3-Step Booking Flow
 * Created: 2026-01-10
 * Agent: BB
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * Create draft booking
 * Stores temporary booking data before final confirmation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, phone, vehicleId, datetime } = body;

    // Validate required fields
    if (!sessionId || !phone || !vehicleId || !datetime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get vehicle details
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicle_trims')
      .select(`
        id,
        name_en,
        name_ar,
        model_id,
        models!inner(
          id,
          brand_id,
          brands!inner(
            name_en,
            name_ar
          )
        )
      `)
      .eq('id', vehicleId)
      .single();

    if (vehicleError || !vehicle) {
      console.error('Vehicle fetch error:', vehicleError);
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Extract brand name from nested structure
    const brandName = (vehicle as any).models?.brands?.name_en || 'Unknown Brand';
    const vehicleName = `${brandName} ${vehicle.name_en}`;

    // Store draft in temporary storage (using bookings table with draft status)
    const { data: draft, error: draftError } = await supabase
      .from('bookings')
      .insert({
        phone_number: phone,
        vehicle_id: vehicleId,
        preferred_datetime: datetime,
        status: 'draft',
        metadata: {
          sessionId,
          vehicleName,
        },
      })
      .select()
      .single();

    if (draftError) {
      console.error('Draft creation error:', draftError);
      return NextResponse.json(
        { error: 'Failed to create draft' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      draftId: draft.id,
    });
  } catch (error) {
    console.error('Draft API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
