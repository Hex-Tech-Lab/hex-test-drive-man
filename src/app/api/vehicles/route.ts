// Vehicles API endpoint
// Created: 2026-01-07
// Agent: BB
// MVP 1.5: Booking System

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * GET /api/vehicles - Get list of available vehicles
 */
export async function GET() {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('vehicle_trims')
      .select(`
        id,
        trim_name,
        models (
          name,
          brands (
            name
          )
        )
      `)
      .limit(100);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Format vehicles for dropdown
    const vehicles = data?.map((vehicle: any) => ({
      id: vehicle.id,
      name: `${vehicle.models?.brands?.name || ''} ${vehicle.models?.name || ''} ${vehicle.trim_name || ''}`.trim()
    })) || [];

    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error('GET /api/vehicles error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
