import * as crypto from 'crypto';
import { sendWhySMS } from '@/services/sms/providers/whysms';
import { createClient } from '@/lib/supabase';

export type OtpSubjectType = 'booking' | 'login';

export interface RequestOtpParams {
  phone: string;
  subjectType: OtpSubjectType;
  subjectId: string;
}

export interface RequestOtpResult {
  success: boolean;
  error?: string;
  expiresAt?: string;
}

export interface VerifyOtpParams {
  phone: string;
  subjectType: OtpSubjectType;
  subjectId: string;
  code: string;
}

export interface VerifyOtpResult {
  valid: boolean;
  error?: string;
}

function generateOTP(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

// TODO: replace console-based persistence with real DB writes (sms_otps / sms_attempts)
export async function requestOtp(params: RequestOtpParams): Promise<RequestOtpResult> {
  const { phone, subjectType, subjectId } = params;
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const body = `Your Hex Test Drive code is ${code}. It expires in 5 minutes.`;
  const res = await sendWhySMS(phone, body);

  const supabase = createClient();
  // Store OTP in database for verification
  const { error: dbError } = await supabase
  .from('sms_verifications')
  .insert({
    phone_number: phone,
    otp: code,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min expiry
    verified: false
  });

  if (dbError) {
    console.error('Failed to store OTP:', dbError);
    throw new Error('Failed to store OTP verification');
  }

  // For now, log instead of DB insert; next step will wire DB.
  console.log('[OTP_REQUEST]', {
    phone,
    subjectType,
    subjectId,
    code,
    expiresAt,
    provider: 'whysms',
    success: res.success,
    status: res.status,
    message: res.message,
  });

  if (!res.success) {
    return { success: false, error: res.message ?? 'SMS send failed' };
  }

  return { success: true, expiresAt };
}

export async function verifyOtp(phoneNumber: string, otp: string): Promise<boolean> {
  try {
    const supabase = createClient()

    // Find matching OTP for this phone number
    const { data: verification, error } = await supabase
      .from('sms_verifications')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('otp', otp)
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !verification) {
      console.log('OTP verification failed:', error?.message || 'No matching OTP found')
      return false
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from('sms_verifications')
      .update({
        verified: true,
        verified_at: new Date().toISOString()
      })
      .eq('id', verification.id)

    if (updateError) {
      console.error('Failed to update verification status:', updateError)
      return false
    }

    console.log('OTP verified successfully for:', phoneNumber)
    return true
  } catch (error) {
    console.error('verifyOtp error:', error)
    return false
  }
}