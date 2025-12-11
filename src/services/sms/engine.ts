import crypto from 'crypto';
import { sendWhySMS } from './providers/whysms';

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

export async function verifyOtp(_params: VerifyOtpParams): Promise<VerifyOtpResult> {
  // Placeholder: will check DB-stored OTP in next step.
  // For now, always fail with explicit message so UI wiring is clear.
  console.log('[OTP_VERIFY_STUB]', _params);
  return { valid: false, error: 'OTP verification not implemented yet' };
}
