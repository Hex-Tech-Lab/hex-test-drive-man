/**
 * Unified SMS Service Layer
 * Consolidates OTP sending, verification, and resend logic
 * Provides graceful degradation when SMS provider fails
 * Created: 2026-01-09 (MVP 1.6)
 */

import { requestOtp, verifyOtp as engineVerifyOtp, RequestOtpParams } from '@/services/sms/engine';
import { captureSentryError } from '@/lib/sentry-user';
import { createClient } from '@/lib/supabase';

export type SmsSubjectType = 'booking' | 'reservation';

export interface SendOtpResult {
  success: boolean;
  expiresAt?: string;
  error?: string;
  warning?: string;
}

export interface VerifyOtpResult {
  valid: boolean;
  error?: string;
}

export interface ResendOtpResult {
  success: boolean;
  expiresAt?: string;
  error?: string;
  rateLimited?: boolean;
}

/**
 * Unified service for SMS/OTP operations
 * Handles sending, verification, resending with graceful error handling
 */
export class SmsService {
  private readonly RESEND_COOLDOWN_MS = 60000; // 60 seconds between resends

  /**
   * Send OTP to phone number for a specific subject
   * @param phone - Phone number (E.164 format recommended)
   * @param subjectId - UUID of booking or reservation
   * @param subjectType - Type of subject ('booking' or 'reservation')
   * @returns Result object with success status and expiry time
   */
  async sendOtp(
    phone: string,
    subjectId: string,
    subjectType: SmsSubjectType,
  ): Promise<SendOtpResult> {
    try {
      console.log('[SMS_SERVICE] Sending OTP:', {
        phone,
        subjectId,
        subjectType,
      });

      const params: RequestOtpParams = {
        phone: phone.trim(),
        subjectType: subjectType as 'booking' | 'login', // Map to engine types
        subjectId,
      };

      const result = await requestOtp(params);

      if (!result.success) {
        console.error('[SMS_SERVICE] OTP send failed:', result.error);

        // Graceful degradation: log error but don't throw
        captureSentryError(new Error(`SMS send failed: ${result.error}`), {
          service: 'SmsService',
          method: 'sendOtp',
          phone,
          subjectId,
          subjectType,
        });

        return {
          success: false,
          error: result.error,
          warning: 'SMS provider unavailable - verification may be delayed',
        };
      }

      console.log('[SMS_SERVICE] OTP sent successfully:', {
        phone,
        subjectId,
        expiresAt: result.expiresAt,
      });

      return {
        success: true,
        expiresAt: result.expiresAt,
      };
    } catch (error) {
      console.error('[SMS_SERVICE] Unexpected error in sendOtp:', error);

      // Graceful degradation: capture error but return failure result
      captureSentryError(
        error instanceof Error ? error : new Error(String(error)),
        {
          service: 'SmsService',
          method: 'sendOtp',
          phone,
          subjectId,
          subjectType,
        },
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        warning: 'SMS service temporarily unavailable',
      };
    }
  }

  /**
   * Verify OTP code for a phone number
   * @param phone - Phone number that received OTP
   * @param code - 6-digit OTP code
   * @param subjectId - UUID of booking or reservation (for logging)
   * @returns Verification result
   */
  async verifyOtp(
    phone: string,
    code: string,
    subjectId: string,
  ): Promise<VerifyOtpResult> {
    try {
      console.log('[SMS_SERVICE] Verifying OTP:', {
        phone,
        subjectId,
        codeLength: code.length,
      });

      // Validate code format
      if (!/^\d{6}$/.test(code)) {
        console.log('[SMS_SERVICE] Invalid OTP format:', code);
        return {
          valid: false,
          error: 'OTP must be 6 digits',
        };
      }

      const isValid = await engineVerifyOtp(phone.trim(), code);

      if (!isValid) {
        console.log('[SMS_SERVICE] OTP verification failed:', {
          phone,
          subjectId,
        });

        return {
          valid: false,
          error: 'Invalid or expired OTP',
        };
      }

      console.log('[SMS_SERVICE] OTP verified successfully:', {
        phone,
        subjectId,
      });

      return {
        valid: true,
      };
    } catch (error) {
      console.error('[SMS_SERVICE] Unexpected error in verifyOtp:', error);

      captureSentryError(
        error instanceof Error ? error : new Error(String(error)),
        {
          service: 'SmsService',
          method: 'verifyOtp',
          phone,
          subjectId,
        },
      );

      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  /**
   * Resend OTP to phone number with rate limiting
   * @param phone - Phone number to resend OTP to
   * @param subjectId - UUID of booking or reservation
   * @returns Resend result with rate limit status
   */
  async resendOtp(phone: string, subjectId: string): Promise<ResendOtpResult> {
    const supabase = createClient();

    try {
      console.log('[SMS_SERVICE] Resend OTP requested:', {
        phone,
        subjectId,
      });

      // Rate limiting: check last OTP send time
      const { data: lastVerification } = await supabase
        .from('sms_verifications')
        .select('created_at')
        .eq('phone_number', phone.trim())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastVerification) {
        const lastSentAt = new Date(lastVerification.created_at).getTime();
        const now = Date.now();
        const timeSinceLastSend = now - lastSentAt;

        if (timeSinceLastSend < this.RESEND_COOLDOWN_MS) {
          const remainingSeconds = Math.ceil(
            (this.RESEND_COOLDOWN_MS - timeSinceLastSend) / 1000,
          );

          console.log('[SMS_SERVICE] Resend rate limited:', {
            phone,
            remainingSeconds,
          });

          return {
            success: false,
            rateLimited: true,
            error: `Please wait ${remainingSeconds} seconds before requesting another code`,
          };
        }
      }

      // Determine subject type from database
      const { data: booking } = await supabase
        .from('bookings')
        .select('id')
        .eq('id', subjectId)
        .maybeSingle();

      const subjectType: SmsSubjectType = booking ? 'booking' : 'reservation';

      // Send new OTP
      const result = await this.sendOtp(phone, subjectId, subjectType);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      console.log('[SMS_SERVICE] OTP resent successfully:', {
        phone,
        subjectId,
        expiresAt: result.expiresAt,
      });

      return {
        success: true,
        expiresAt: result.expiresAt,
      };
    } catch (error) {
      console.error('[SMS_SERVICE] Unexpected error in resendOtp:', error);

      captureSentryError(
        error instanceof Error ? error : new Error(String(error)),
        {
          service: 'SmsService',
          method: 'resendOtp',
          phone,
          subjectId,
        },
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Resend failed',
      };
    }
  }
}

// Singleton instance
export const smsService = new SmsService();
