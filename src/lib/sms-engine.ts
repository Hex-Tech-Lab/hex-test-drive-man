export interface SendOTPResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an OTP via SMS
 * @param phone - Phone number
 * @param code - OTP code
 * @returns Result of the send operation
 */
export async function sendOTP(phone: string, code: string): Promise<SendOTPResult> {
  // Primary: Native Egyptian OTP provider (TBD)
  // Secondary: Bulk provider encapsulated as OTP (TBD) 
  // Stub for MVP - replace with real providers
  console.log(`[SMS-STUB] Sending ${code} to ${phone}`);
  return { success: true, messageId: 'stub-123' };
}

/**
 * Verify an OTP locally (Stub)
 * @param phone - Phone number
 * @param code - Code to verify
 * @returns Verification result
 */
export async function verifyOTP(phone: string, code: string): Promise<boolean> {
  // Stub: always true for MVP
  return true;
}
