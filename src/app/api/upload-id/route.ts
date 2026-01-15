// ID upload API endpoint
// Created: 2026-01-07
// Agent: BB
// MVP 1.5: Booking System

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { uploadIDImage } from '@/lib/repositories/reservationRepository';

/**
 * POST /api/upload-id - Upload National ID image
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const nationalId = formData.get('nationalId') as string;

    if (!file || !nationalId) {
      return NextResponse.json(
        { error: 'Missing file or nationalId' },
        { status: 400 },
      );
    }

    // Validate National ID format (14 digits)
    if (!/^\d{14}$/.test(nationalId)) {
      return NextResponse.json(
        { error: 'Invalid National ID format' },
        { status: 400 },
      );
    }

    const { data: imageUrl, error } = await uploadIDImage(user.id, file);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('POST /api/upload-id error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
