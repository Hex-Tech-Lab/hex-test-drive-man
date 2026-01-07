// Reservations API endpoint
// Created: 2026-01-07
// Agent: BB
// MVP 1.5: Booking System

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import {
  createReservation,
  getUserReservations
} from '@/lib/repositories/reservationRepository';

/**
 * GET /api/reservations - Get user's reservations
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // MVP 1.0: Auth not implemented yet, return empty array for unauthenticated users
    if (authError || !user) {
      return NextResponse.json({ 
        reservations: [],
        message: 'Authentication required. Please log in to view your reservations.'
      });
    }

    const { data, error } = await getUserReservations(user.id);

    if (error) {
      // Check if table doesn't exist
      if (error.message.includes('table') && error.message.includes('not') && error.message.includes('exist')) {
        return NextResponse.json({ 
          reservations: [],
          message: 'Reservations feature is being set up. Please check back soon.'
        });
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ reservations: data || [] });
  } catch (error) {
    console.error('GET /api/reservations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reservations - Create new reservation
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { vehicle_id, reservation_datetime, national_id, id_image_url } = body;

    // Validate required fields
    if (!vehicle_id || !reservation_datetime || !national_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await createReservation(user.id, {
      vehicle_id,
      reservation_datetime,
      national_id,
      id_image_url
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ reservation: data }, { status: 201 });
  } catch (error) {
    console.error('POST /api/reservations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
