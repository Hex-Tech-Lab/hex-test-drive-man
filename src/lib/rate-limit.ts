/**
 * Simple in-memory rate limiter for API protection
 * Fix #2: Prevent DoS attacks and cost explosion on OCR endpoint
 *
 * Note: For production with multiple instances, use Redis-based rate limiting.
 * This implementation is suitable for single-instance deployments.
 */

interface RateLimitConfig {
  limit: number;      // Max requests per window
  windowMs: number;   // Time window in milliseconds
}

class RateLimiter {
  private requests = new Map<string, number[]>();

  // Clean up old entries periodically to prevent memory growth
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup every 5 minutes
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  /**
   * Check if request is allowed within rate limit
   * @throws Error if rate limit exceeded
   */
  check(identifier: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get existing requests for this identifier
    const userRequests = this.requests.get(identifier) || [];

    // Filter to only requests within the window
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);

    const remaining = Math.max(0, config.limit - validRequests.length);
    const resetAt = validRequests.length > 0 ? Math.min(...validRequests) + config.windowMs : now + config.windowMs;

    if (validRequests.length >= config.limit) {
      return { allowed: false, remaining: 0, resetAt };
    }

    // Record this request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return { allowed: true, remaining: remaining - 1, resetAt };
  }

  /**
   * Clean up old entries to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes

    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(t => now - t < maxAge);
      if (validTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimestamps);
      }
    }
  }

  /**
   * Destroy cleanup interval (for testing)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Singleton instance for the OCR endpoint
export const ocrRateLimiter = new RateLimiter();

// Default configs for different endpoints
export const RATE_LIMIT_CONFIGS = {
  // OCR: 10 requests per minute per IP (scanning 4 documents = 4 requests max expected)
  ocr: { limit: 10, windowMs: 60 * 1000 },
  // OTP: 3 requests per minute per phone (prevent spam)
  otp: { limit: 3, windowMs: 60 * 1000 },
} as const;

export type { RateLimitConfig };
