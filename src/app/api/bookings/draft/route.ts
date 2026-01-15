import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * POST /api/bookings/draft
 * Create a draft booking with phone, vehicle, and date
 */
export async function POST(req: Request) {
  const { phone, vehicleId, preferred_date } = await req.json();
  const supabase = createClient();
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      phone_number: phone,
      vehicle_id: vehicleId,
      preferred_date,
      status: 'draft',
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ draftId: data.id });
}
