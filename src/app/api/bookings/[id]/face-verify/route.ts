/**
 * Face Verification API Endpoint
 * Created: 2026-01-08
 * Agent: BB
 * MVP 1.5 Phase 2: Face Matching
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * POST /api/bookings/[id]/face-verify - Save face verification result
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const bookingId = params.id;
    const { similarity } = await request.json();

    // Validate similarity score
    if (typeof similarity !== 'number' || similarity < 0 || similarity > 1) {
      return NextResponse.json(
        { error: 'Invalid similarity score' },
        { status: 400 }
      );
    }

    // Check if similarity meets threshold
    const THRESHOLD = 0.85;
    if (similarity < THRESHOLD) {
      return NextResponse.json(
        { error: 'Face verification failed. Similarity below threshold.' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Update booking with face verification result
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        face_verified: true,
        face_similarity: similarity,
        face_verified_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Failed to update booking:', updateError);
      return NextResponse.json(
        { error: 'Failed to save verification result' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      similarity,
      verified: true,
    });
  } catch (error) {
    console.error('POST /api/bookings/[id]/face-verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
