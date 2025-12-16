'use server';

import { requestOtp } from '@/services/sms/engine';

interface RequestBookingOtpParams {
  phone: string;
  subjectId: string;
}

/**
 * Server action to request an OTP for a booking.
 * This wraps the core OTP service to be safely called from client components.
 */
export async function requestBookingOtp(params: RequestBookingOtpParams) {
  return requestOtp({
    phone: params.phone,
    subjectId: params.subjectId,
    subjectType: 'booking',
  });
}
