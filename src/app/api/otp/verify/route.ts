/**
 * OTP Verify Endpoint
 * Created: 2026-01-11 (CC fix for client-side crypto.randomInt issue)
 * Handles POST requests to verify OTP codes
 *
 * Security: Server-side only - validates OTP against database
 */

import { NextRequest, NextResponse } from 'next/server';
import { smsService } from '@/services/SmsService';
import { captureSentryError } from '@/lib/sentry-user';

export interface VerifyOtpRequest {
  phone: string;
  code: string;
  subjectId: string;
}

/**
 * POST /api/otp/verify
 * Verify OTP code for a phone number
 *
 * @param request - Contains phone, code, subjectId in body
 * @returns Validation result
 */
export async function POST(request: NextRequest) {
  try {
    const body: VerifyOtpRequest = await request.json();

    // Validate required fields
    if (!body.phone || typeof body.phone !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!body.code || typeof body.code !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'OTP code is required' },
        { status: 400 }
      );
    }

    if (!body.subjectId || typeof body.subjectId !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Subject ID is required' },
        { status: 400 }
      );
    }

    // Normalize phone number
    const normalizedPhone = body.phone.replace(/\D/g, '');

    if (normalizedPhone.length < 10) {
      return NextResponse.json(
        { valid: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Verify OTP via SMS service
    const result = await smsService.verifyOtp(
      normalizedPhone,
      body.code,
      body.subjectId
    );

    if (!result.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: result.error || 'Invalid or expired OTP',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
    });
  } catch (error) {
    console.error('[OTP_VERIFY] Unexpected error:', error);

    captureSentryError(
      error instanceof Error ? error : new Error(String(error)),
      {
        endpoint: '/api/otp/verify',
        method: 'POST',
      }
    );

    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
