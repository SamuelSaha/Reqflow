/**
 * Rate Limiting for Authentication Endpoints
 * Prevents brute force attacks, credential stuffing, and account enumeration
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";
import { logger } from "@/lib/monitoring/logger";

// Check if Upstash Redis is configured
const isRateLimitingEnabled =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN;

// Create Redis client for rate limiting (Upstash REST API)
const redis = isRateLimitingEnabled
  ? Redis.fromEnv()
  : null;

/**
 * Auth rate limiter - 5 attempts per 15 minutes per identifier
 * Uses sliding window for accurate rate limiting
 */
export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "ratelimit:auth",
    })
  : null;

/**
 * Signup rate limiter - 3 signups per hour per IP
 * More restrictive to prevent spam account creation
 */
export const signupRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      analytics: true,
      prefix: "ratelimit:signup",
    })
  : null;

/**
 * Extract client IP address from request headers
 * Checks common proxy headers in order of preference
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  // Cloudflare CF-Connecting-IP (most reliable if using Cloudflare)
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // X-Real-IP (common in nginx proxies)
  if (realIp) {
    return realIp;
  }

  // X-Forwarded-For (can contain multiple IPs, take the first)
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  // Fallback to unknown if no IP headers found
  return "unknown";
}

/**
 * Check rate limit for authentication attempts
 * Uses email + IP combination for better security
 */
export async function checkAuthRateLimit(
  email: string,
  request: Request
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // If rate limiting is not configured, allow all requests
  if (!authRateLimiter) {
    logger.warn("Auth rate limiting is disabled - Upstash Redis not configured");
    return {
      success: true,
      limit: 999,
      remaining: 999,
      reset: Date.now() + 60000,
    };
  }

  const ip = getClientIp(request);
  const identifier = `${email}:${ip}`;

  const result = await authRateLimiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Check rate limit for signup attempts
 * Uses IP address only to prevent abuse
 */
export async function checkSignupRateLimit(
  request: Request
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // If rate limiting is not configured, allow all requests
  if (!signupRateLimiter) {
    logger.warn("Signup rate limiting is disabled - Upstash Redis not configured");
    return {
      success: true,
      limit: 999,
      remaining: 999,
      reset: Date.now() + 60000,
    };
  }

  const ip = getClientIp(request);

  const result = await signupRateLimiter.limit(ip);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
