// Reservation availability API endpoint
// Created: 2026-01-07
// Agent: BB
// MVP 1.5: Booking System

import { NextRequest, NextResponse } from 'next/server';
import { getAvailableTimeSlots } from '@/lib/repositories/reservationRepository';

/**
 * GET /api/reservations/availability?vehicleId=xxx&date=YYYY-MM-DD
 * Returns available time slots for a vehicle on a specific date
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const date = searchParams.get('date');

    if (!vehicleId || !date) {
      return NextResponse.json(
        { error: 'Missing vehicleId or date parameter' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const { data, error } = await getAvailableTimeSlots(vehicleId, date);

    if (error) {
      // Check if table doesn't exist - return all slots as available
      if (error.message.includes('table') && error.message.includes('not') && error.message.includes('exist')) {
        // Generate default available slots (9 AM - 6 PM)
        const defaultSlots = [];
        for (let hour = 9; hour <= 17; hour++) {
          const time = `${hour.toString().padStart(2, '0')}:00`;
          defaultSlots.push({ time, available: true });
        }
        return NextResponse.json({ 
          slots: defaultSlots,
          message: 'Showing all time slots as available. Booking system is being set up.'
        });
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ slots: data || [] });
  } catch (error) {
    console.error('GET /api/reservations/availability error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
