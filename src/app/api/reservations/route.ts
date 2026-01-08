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
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data, error } = await getUserReservations(user.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ reservations: data });
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
    const {
      vehicle_id,
      reservation_datetime,
      national_id,
      name,
      birth_date,
      phone,
      id_front_url,
      id_back_url,
      ocr_confidence,
      barcode_verified,
    } = body;

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
      id_image_url: id_front_url, // Keep backward compatibility
      name,
      birth_date,
      phone,
      id_front_url,
      id_back_url,
      ocr_confidence,
      barcode_verified,
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
