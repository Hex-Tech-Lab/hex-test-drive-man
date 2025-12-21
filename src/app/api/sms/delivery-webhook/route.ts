import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // WhySMS webhook payload:
    // { uid, to, status, delivered_at }
    const { uid, to, status, delivered_at } = body;

    console.log(`[SMS_WEBHOOK] Received delivery update: ${status} for ${to}`);

    const supabase = createClient();

    // Update sms_verifications with delivery status
    const { error } = await supabase
      .from('sms_verifications')
      .update({
        delivery_status: status,
        delivered_at: delivered_at ? new Date(delivered_at * 1000).toISOString() : null
      })
      .eq('phone_number', `+${to}`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('[SMS_WEBHOOK] Update failed:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log(`[SMS_WEBHOOK] Updated delivery status for ${to}: ${status}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SMS_WEBHOOK] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
