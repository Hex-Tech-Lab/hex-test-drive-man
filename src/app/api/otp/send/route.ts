/**
 * OTP Send Endpoint
 * Created: 2026-01-11 (CC fix for client-side crypto.randomInt issue)
 * Handles POST requests to send OTP codes via SMS
 *
 * Security: Server-side only - uses Node.js crypto for OTP generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { smsService } from '@/services/SmsService';
import { captureSentryError } from '@/lib/sentry-user';

export interface SendOtpRequest {
  phone: string;
  subjectId: string;
  subjectType: 'booking' | 'reservation';
}

/**
 * POST /api/otp/send
 * Send OTP code to phone number
 *
 * @param request - Contains phone, subjectId, subjectType in body
 * @returns Success status and expiry time, or error message
 */
export async function POST(request: NextRequest) {
  try {
    const body: SendOtpRequest = await request.json();

    // Validate required fields
    if (!body.phone || typeof body.phone !== 'string') {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!body.subjectId || typeof body.subjectId !== 'string') {
      return NextResponse.json(
        { error: 'Subject ID is required' },
        { status: 400 }
      );
    }

    if (!body.subjectType || !['booking', 'reservation'].includes(body.subjectType)) {
      return NextResponse.json(
        { error: 'Subject type must be "booking" or "reservation"' },
        { status: 400 }
      );
    }

    // Normalize phone number (remove non-digits)
    const normalizedPhone = body.phone.replace(/\D/g, '');

    if (normalizedPhone.length < 10) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Send OTP via SMS service
    const result = await smsService.sendOtp(
      normalizedPhone,
      body.subjectId,
      body.subjectType
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send OTP',
          warning: result.warning,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error('[OTP_SEND] Unexpected error:', error);

    captureSentryError(
      error instanceof Error ? error : new Error(String(error)),
      {
        endpoint: '/api/otp/send',
        method: 'POST',
      }
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
