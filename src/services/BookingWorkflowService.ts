/**
 * Unified Booking Workflow Service
 * Consolidates booking creation + OTP logic into single atomic service
 * Eliminates duplication across API routes
 * Created: 2026-01-08 (MVP 1.6)
 */

import { createClient } from '@/lib/supabase';
import { bookingRepository } from '@/repositories/bookingRepository';
import { requestOtp, verifyOtp } from '@/services/sms/engine';
import { captureSentryError } from '@/lib/sentry-user';
import { BookingInput, Booking } from '@/types/booking';

export interface InitiateBookingResult {
  bookingId: string;
  booking?: Booking;
  duplicate?: boolean;
  otpSent?: boolean;
  smsError?: string;
  warning?: string;
}

export interface VerifyBookingResult {
  success: boolean;
  bookingId?: string;
  error?: string;
}

/**
 * Unified service for booking workflow operations
 * Handles idempotency, booking creation, OTP sending, and verification
 */
export class BookingWorkflowService {
  /**
   * Initiate a new booking with idempotency check and OTP sending
   * @param data - Booking input data
   * @returns Result object with booking ID and status
   */
  async initiateBooking(data: BookingInput): Promise<InitiateBookingResult> {
    const supabase = createClient();

    try {
      // Idempotency check: prevent duplicate bookings within 60 seconds
      const { data: recentBooking } = await supabase
        .from('bookings')
        .select('id, created_at')
        .eq('phone_number', data.phone)
        .gte('created_at', new Date(Date.now() - 60000).toISOString())
        .maybeSingle();

      if (recentBooking) {
        console.log('[WORKFLOW] Duplicate booking prevented:', {
          phone: data.phone,
          existingBookingId: recentBooking.id,
          createdAt: recentBooking.created_at,
        });

        return {
          bookingId: recentBooking.id,
          duplicate: true,
        };
      }

      // Create booking via repository
      const booking = await bookingRepository.createBooking(data);

      // Send OTP via SMS
      const otpResult = await requestOtp({
        phone: booking.phone,
        subjectType: 'booking',
        subjectId: booking.id,
      });

      if (!otpResult.success) {
        console.error('[WORKFLOW] OTP send failed:', otpResult.error);

        // Booking created but SMS failed - return partial success
        return {
          bookingId: booking.id,
          booking,
          otpSent: false,
          smsError: otpResult.error,
          warning: 'Booking created but SMS failed to send',
        };
      }

      console.log('[WORKFLOW] Booking initiated successfully:', {
        bookingId: booking.id,
        phone: booking.phone,
        otpSent: true,
      });

      return {
        bookingId: booking.id,
        booking,
        otpSent: true,
      };
    } catch (error) {
      console.error('[WORKFLOW] Booking initiation failed:', error);
      captureSentryError(
        error instanceof Error ? error : new Error(String(error)),
        { service: 'BookingWorkflowService', method: 'initiateBooking' }
      );
      throw error;
    }
  }

  /**
   * Verify booking with OTP code
   * @param bookingId - Booking UUID
   * @param code - 6-digit OTP code
   * @returns Verification result
   */
  async verifyBooking(bookingId: string, code: string): Promise<VerifyBookingResult> {
    const supabase = createClient();

    try {
      // Fetch booking to get phone number
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('phone_number, status')
        .eq('id', bookingId)
        .single();

      if (bookingError || !booking) {
        console.error('[WORKFLOW] Booking not found:', bookingId);
        return {
          success: false,
          error: 'Booking not found',
        };
      }

      // Verify OTP
      const isValid = await verifyOtp(booking.phone_number, code);

      if (!isValid) {
        console.log('[WORKFLOW] Invalid OTP:', { bookingId, phone: booking.phone_number });
        return {
          success: false,
          error: 'Invalid or expired OTP',
        };
      }

      // Mark booking as verified via repository
      await bookingRepository.markPhoneVerified(bookingId);

      console.log('[WORKFLOW] Booking verified successfully:', {
        bookingId,
        phone: booking.phone_number,
      });

      return {
        success: true,
        bookingId,
      };
    } catch (error) {
      console.error('[WORKFLOW] Verification failed:', error);
      captureSentryError(
        error instanceof Error ? error : new Error(String(error)),
        { service: 'BookingWorkflowService', method: 'verifyBooking', bookingId }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }
}

// Singleton instance
export const bookingWorkflow = new BookingWorkflowService();
