/**
 * OAuth State Parameter Management
 * Prevents CSRF attacks during OAuth flows
 * 🔒 SECURITY FIX: Implements cryptographically secure state validation
 */

import { cookies } from "next/headers";
import { randomBytes, timingSafeEqual } from "crypto";

const STATE_COOKIE_PREFIX = "__Host-oauth_state_";
const STATE_MAX_AGE = 60 * 10; // 10 minutes

/**
 * Generate cryptographically secure OAuth state token
 * Uses 32 bytes (256 bits) of entropy
 */
export function generateOAuthState(provider: string): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Store OAuth state in httpOnly cookie
 * State is bound to the session and expires in 10 minutes
 */
export async function setOAuthState(provider: string, state: string): Promise<void> {
  const cookieStore = await cookies();
  const cookieName = `${STATE_COOKIE_PREFIX}${provider}`;

  cookieStore.set(cookieName, state, {
    httpOnly: true,
    secure: true, // Always require HTTPS
    sameSite: "lax", // Allow OAuth redirects
    maxAge: STATE_MAX_AGE,
    path: "/",
  });
}

/**
 * Validate OAuth state parameter from callback
 * Uses timing-safe comparison to prevent timing attacks
 * Returns true if state is valid, false otherwise
 */
export async function validateOAuthState(
  provider: string,
  providedState: string | null
): Promise<boolean> {
  if (!providedState) {
    return false;
  }

  const cookieStore = await cookies();
  const cookieName = `${STATE_COOKIE_PREFIX}${provider}`;
  const storedState = cookieStore.get(cookieName)?.value;

  if (!storedState) {
    return false;
  }

  // Delete the state cookie after reading (one-time use)
  cookieStore.delete(cookieName);

  // Timing-safe comparison to prevent timing attacks
  try {
    const providedBuffer = Buffer.from(providedState);
    const storedBuffer = Buffer.from(storedState);

    // Buffers must be same length
    if (providedBuffer.length !== storedBuffer.length) {
      return false;
    }

    return timingSafeEqual(providedBuffer, storedBuffer);
  } catch {
    return false;
  }
}

/**
 * Create OAuth authorization URL with state parameter
 * Helper that ensures state is generated and stored correctly
 */
export async function createOAuthUrl(
  provider: string,
  baseUrl: string,
  params: Record<string, string>
): Promise<string> {
  const state = generateOAuthState(provider);
  await setOAuthState(provider, state);

  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("state", state);

  return url.toString();
}
