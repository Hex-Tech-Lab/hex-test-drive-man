import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { ocrRateLimiter, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';

/**
 * POST /api/ocr/scan
 * Fix #2: Rate-limited OCR endpoint to prevent DoS attacks
 */
export async function POST(request: Request) {
  // Fix #2: Rate limiting - 10 requests per minute per IP
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

  const rateLimitResult = ocrRateLimiter.check(ip, RATE_LIMIT_CONFIGS.ocr);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please wait before scanning again.',
        retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(RATE_LIMIT_CONFIGS.ocr.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateLimitResult.resetAt)
        }
      }
    );
  }

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock valid result
  const mockResult = {
    valid: true,
    extracted: {
      name: 'Ahmed Mohamed',
      idNumber: '29001011234567',
      licenseNumber: '123456'
    },
    imageUrl: '', // Will be overridden by client service
    confidence: 0.95
  };

  return NextResponse.json(mockResult, {
    headers: {
      'X-RateLimit-Limit': String(RATE_LIMIT_CONFIGS.ocr.limit),
      'X-RateLimit-Remaining': String(rateLimitResult.remaining),
      'X-RateLimit-Reset': String(rateLimitResult.resetAt)
    }
  });
}
