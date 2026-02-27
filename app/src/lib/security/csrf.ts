/**
 * CSRF Protection Utilities
 * Prevents Cross-Site Request Forgery attacks on state-changing operations
 * Uses Web Crypto API for Edge Runtime compatibility
 */

import { cookies, headers } from "next/headers";
import { env } from "../env";

const CSRF_SECRET = env.AUTH_SECRET;

/**
 * Generate cryptographically secure CSRF token
 * Uses 32 bytes (256 bits) of entropy
 * Compatible with Edge Runtime (uses Web Crypto API)
 */
export function generateCSRFToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
}

/**
 * Validate CSRF token from request
 * Must be called from server components or API routes
 */
export async function validateCSRFToken(providedToken: string | null): Promise<boolean> {
  if (!providedToken) {
    return false;
  }

  const cookieStore = await cookies();
  const csrfToken = cookieStore.get("csrf_token")?.value;

  if (!csrfToken) {
    return false;
  }

  // Timing-safe comparison to prevent timing attacks
  // Uses Web Crypto API for Edge Runtime compatibility
  try {
    const encoder = new TextEncoder();
    const providedBytes = encoder.encode(providedToken);
    const storedBytes = encoder.encode(csrfToken);

    // Buffers must be same length
    if (providedBytes.length !== storedBytes.length) {
      return false;
    }

    // Constant-time comparison
    let result = 0;
    for (let i = 0; i < providedBytes.length; i++) {
      result |= providedBytes[i] ^ storedBytes[i];
    }
    return result === 0;
  } catch {
    return false;
  }
}

/**
 * Set CSRF token in cookie
 * Call this during session creation
 */
export async function setCSRFToken(): Promise<string> {
  const token = generateCSRFToken();
  const cookieStore = await cookies();

  cookieStore.set("csrf_token", token, {
    httpOnly: false, // Accessible to JavaScript for including in requests
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return token;
}

/**
 * Extract CSRF token from request headers
 */
export async function getCSRFTokenFromRequest(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get("x-csrf-token") || null;
}
