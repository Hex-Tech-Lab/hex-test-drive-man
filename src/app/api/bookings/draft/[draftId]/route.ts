import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * GET /api/bookings/draft/[draftId]
 * Retrieve draft booking details by ID
 */
export async function GET(req: Request, { params }: any) {
  const { draftId } = await params;
  const supabase = createClient();
  const { data } = await supabase.from('bookings').select('*').eq('id', draftId).single();
  return NextResponse.json(data);
}
