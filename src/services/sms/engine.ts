import crypto from 'crypto';
import { sendWhySMS } from './providers/whysms';

function generateOTP(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

export async function sendBookingOTP(phone: string, bookingId: string) {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  // TODO: write to Supabase sms_verifications table via RPC or server-side API route

  const body = `Your Hex Test Drive code is ${code}. It expires in 5 minutes.`;
  const res = await sendWhySMS(phone, body);

  if (!res.success) {
    throw new Error(`WhySMS send failed: ${res.message ?? 'unknown error'}`);
  }

  return { code, expiresAt };
}
