import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * POST /api/bookings/[id]/confirm
 * Confirm a draft booking by updating status to pending
 */
export async function POST(req: Request, { params }: any) {
  const { id } = await params;
  const supabase = createClient();
  await supabase.from('bookings').update({ status: 'pending' }).eq('id', id);
  return NextResponse.json({ success: true });
}
