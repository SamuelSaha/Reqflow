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
 * tRPC API rate limiter - 100 requests per minute per user
 * Prevents API abuse while allowing normal usage
 */
export const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "ratelimit:api",
    })
  : null;

/**
 * tRPC mutation rate limiter - 20 mutations per minute per user
 * More restrictive for write operations (create, update, delete)
 */
export const mutationRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 m"),
      analytics: true,
      prefix: "ratelimit:mutation",
    })
  : null;

/**
 * 🔒 SECURITY FIX: Email verification rate limiter - 3 emails per hour per email
 * Prevents email bombing and token brute-forcing
 */
export const emailVerificationRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      analytics: true,
      prefix: "ratelimit:email-verify",
    })
  : null;

/**
 * 🔒 SECURITY FIX: Invite token rate limiter - 10 attempts per hour per IP
 * Prevents brute-force attacks on invite tokens
 */
export const inviteTokenRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      analytics: true,
      prefix: "ratelimit:invite-token",
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
 * 
 * SECURITY: Fails closed in production if Redis is unavailable
 */
export async function checkAuthRateLimit(
  email: string,
  request: Request
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // SECURITY: Fail closed in production - block auth attempts if rate limiting unavailable
  if (!authRateLimiter) {
    if (env.NODE_ENV === "production") {
      logger.error("CRITICAL: Auth rate limiting unavailable in production - blocking request", {
        email: email.substring(0, 3) + "***",
        message: "Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN",
      });
      // FAIL CLOSED: Return success=false to block the request
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: Date.now() + 900000, // 15 minutes
      };
    } else {
      logger.warn("Auth rate limiting is disabled - Upstash Redis not configured (dev mode)");
      return {
        success: true,
        limit: 999,
        remaining: 999,
        reset: Date.now() + 60000,
      };
    }
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
 * 
 * SECURITY: Fails closed in production if Redis is unavailable
 */
export async function checkSignupRateLimit(
  request: Request
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // SECURITY: Fail closed in production - block signups if rate limiting unavailable
  if (!signupRateLimiter) {
    if (env.NODE_ENV === "production") {
      logger.error("CRITICAL: Signup rate limiting unavailable in production - blocking request");
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: Date.now() + 3600000, // 1 hour
      };
    }
    logger.warn("Signup rate limiting is disabled - Upstash Redis not configured (dev mode)");
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

/**
 * Account Lockout - Progressive lockout after failed login attempts
 * Separate from rate limiting - locks specific accounts regardless of IP
 */

const LOCKOUT_THRESHOLDS = [
  { attempts: 5, duration: 15 * 60 * 1000 },      // 5 attempts = 15 min lockout
  { attempts: 8, duration: 30 * 60 * 1000 },      // 8 attempts = 30 min lockout
  { attempts: 10, duration: 60 * 60 * 1000 },     // 10 attempts = 1 hour lockout
  { attempts: 15, duration: 24 * 60 * 60 * 1000 }, // 15 attempts = 24 hour lockout
];

interface AccountLockoutData {
  failedAttempts: number;
  lockedUntil: number | null;
  lastFailedAt: number;
}

/**
 * Check if account is locked due to failed login attempts
 */
export async function checkAccountLockout(
  email: string
): Promise<{ locked: boolean; lockedUntil?: number; attempts?: number }> {
  if (!redis) {
    return { locked: false };
  }

  const key = `lockout:${email.toLowerCase()}`;
  const data = await redis.get<AccountLockoutData>(key);

  if (!data) {
    return { locked: false, attempts: 0 };
  }

  // Check if lockout has expired
  if (data.lockedUntil && Date.now() < data.lockedUntil) {
    return {
      locked: true,
      lockedUntil: data.lockedUntil,
      attempts: data.failedAttempts,
    };
  }

  // Lockout expired, reset if it was locked
  if (data.lockedUntil && Date.now() >= data.lockedUntil) {
    await redis.del(key);
    return { locked: false, attempts: 0 };
  }

  return { locked: false, attempts: data.failedAttempts };
}

/**
 * Record failed login attempt and lock account if threshold exceeded
 */
export async function recordFailedLogin(
  email: string
): Promise<{ locked: boolean; lockedUntil?: number; attempts: number }> {
  if (!redis) {
    return { locked: false, attempts: 0 };
  }

  const key = `lockout:${email.toLowerCase()}`;
  const data = await redis.get<AccountLockoutData>(key);

  const currentAttempts = (data?.failedAttempts || 0) + 1;
  const now = Date.now();

  // Determine lockout duration based on attempt count
  let lockedUntil: number | null = null;
  for (const threshold of LOCKOUT_THRESHOLDS) {
    if (currentAttempts >= threshold.attempts) {
      lockedUntil = now + threshold.duration;
    }
  }

  const newData: AccountLockoutData = {
    failedAttempts: currentAttempts,
    lockedUntil,
    lastFailedAt: now,
  };

  // Store for 24 hours (max lockout duration)
  await redis.set(key, newData, { ex: 24 * 60 * 60 });

  logger.warn("Failed login attempt recorded", {
    email,
    attempts: currentAttempts,
    locked: !!lockedUntil,
  });

  return {
    locked: !!lockedUntil,
    lockedUntil: lockedUntil || undefined,
    attempts: currentAttempts,
  };
}

/**
 * Clear failed login attempts after successful login
 */
export async function clearFailedAttempts(email: string): Promise<void> {
  if (!redis) {
    return;
  }

  const key = `lockout:${email.toLowerCase()}`;
  await redis.del(key);

  logger.info("Failed login attempts cleared", { email });
}

/**
 * Check rate limit for tRPC API calls (queries)
 * Uses user ID or IP address as identifier
 */
export async function checkApiRateLimit(
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // Allow API queries even if rate limiting unavailable (less critical)
  if (!apiRateLimiter) {
    if (env.NODE_ENV === "production") {
      logger.warn("API rate limiting unavailable - allowing request (non-critical)");
    }
    return {
      success: true,
      limit: 999,
      remaining: 999,
      reset: Date.now() + 60000,
    };
  }

  const result = await apiRateLimiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Check rate limit for tRPC mutations (create, update, delete)
 * More restrictive than query rate limiting
 * 
 * SECURITY: Fails closed in production if Redis is unavailable
 */
export async function checkMutationRateLimit(
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // SECURITY: Fail closed in production - block mutations if rate limiting unavailable
  if (!mutationRateLimiter) {
    if (env.NODE_ENV === "production") {
      logger.error("CRITICAL: Mutation rate limiting unavailable in production - blocking request", {
        identifier,
      });
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: Date.now() + 60000,
      };
    }
    logger.warn("Mutation rate limiting is disabled - Upstash Redis not configured (dev mode)");
    return {
      success: true,
      limit: 999,
      remaining: 999,
      reset: Date.now() + 60000,
    };
  }

  const result = await mutationRateLimiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * 🔒 SECURITY FIX: Check rate limit for email verification requests
 * Prevents email bombing attacks - 3 emails per hour per email address
 * 
 * SECURITY: Fails closed in production if Redis is unavailable
 */
export async function checkEmailVerificationRateLimit(
  email: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // SECURITY: Fail closed in production - block email verification if rate limiting unavailable
  if (!emailVerificationRateLimiter) {
    if (env.NODE_ENV === "production") {
      logger.error("CRITICAL: Email verification rate limiting unavailable in production - blocking request");
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: Date.now() + 3600000, // 1 hour
      };
    }
    logger.warn("Email verification rate limiting is disabled - Upstash Redis not configured (dev mode)");
    return {
      success: true,
      limit: 999,
      remaining: 999,
      reset: Date.now() + 60000,
    };
  }

  const identifier = `email-verify:${email.toLowerCase()}`;
  const result = await emailVerificationRateLimiter.limit(identifier);

  if (!result.success) {
    logger.warn("Email verification rate limit exceeded", {
      email,
      remaining: result.remaining,
      reset: new Date(result.reset).toISOString(),
    });
  }

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * 🔒 SECURITY FIX: Check rate limit for invite token validation attempts
 * Prevents brute-force attacks on invite tokens - 10 attempts per hour per IP
 * 
 * SECURITY: Fails closed in production if Redis is unavailable
 */
export async function checkInviteTokenRateLimit(
  request: Request
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // SECURITY: Fail closed in production - block invite token validation if rate limiting unavailable
  if (!inviteTokenRateLimiter) {
    if (env.NODE_ENV === "production") {
      logger.error("CRITICAL: Invite token rate limiting unavailable in production - blocking request");
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: Date.now() + 3600000, // 1 hour
      };
    }
    logger.warn("Invite token rate limiting is disabled - Upstash Redis not configured (dev mode)");
    return {
      success: true,
      limit: 999,
      remaining: 999,
      reset: Date.now() + 60000,
    };
  }

  const ip = getClientIp(request);
  const identifier = `invite-token:${ip}`;
  const result = await inviteTokenRateLimiter.limit(identifier);

  if (!result.success) {
    logger.warn("Invite token validation rate limit exceeded", {
      ip,
      remaining: result.remaining,
      reset: new Date(result.reset).toISOString(),
    });
  }

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
