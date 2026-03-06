/**
 * Content Security Policy utilities
 * 🔒 SECURITY (issue #115): Nonce-based CSP for XSS protection
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";

/**
 * Generate a cryptographically secure nonce
 * 16 bytes = 128 bits of entropy
 */
export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64");
}

/**
 * Build CSP directive string
 */
export function buildCSP(nonce: string, isDev: boolean): string {
  const directives = [
    "default-src 'self'",
    // 🔒 SECURITY: Scripts use nonces, no unsafe-inline in production.
    // In dev: unsafe-eval + unsafe-inline needed for Next.js HMR and RSC hydration bootstrapping.
    // Next.js App Router generates inline <script> tags for RSC payload that have no nonce —
    // those would be blocked without unsafe-inline, preventing React hydration entirely.
    // In production: use strict-dynamic so nonce-authorized scripts can load dynamic chunks.
    // TODO: Track https://github.com/vercel/next.js/issues for native nonce injection into RSC scripts.
    `script-src 'self' 'nonce-${nonce}' https://*.sentry.io${isDev ? " 'unsafe-eval' 'unsafe-inline'" : " 'strict-dynamic'"}`,
    // 🔒 SECURITY: Styles use unsafe-inline for Tailwind CSS and Radix UI runtime styles.
    // NOTE: Do NOT add 'nonce-...' here alongside 'unsafe-inline' — in CSP Level 2+,
    // the presence of a nonce/hash source causes 'unsafe-inline' to be IGNORED by the browser,
    // which breaks Radix UI inline styles and the Next.js devtools rendering.
    `style-src 'self' 'unsafe-inline'`,
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    `connect-src 'self' https://*.sentry.io https://*.axiom.co https://*.cloudflare.com wss://localhost:* ws://localhost:*${isDev ? " ws://*" : ""}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
    "block-all-mixed-content",
  ];

  return directives.join("; ");
}

/**
 * CSP headers to add to response
 */
export function getCSPHeaders(nonce: string, isDev: boolean): Record<string, string> {
  return {
    "Content-Security-Policy": buildCSP(nonce, isDev),
    // Report-only mode for testing (uncomment to test without enforcement)
    // "Content-Security-Policy-Report-Only": buildCSP(nonce, isDev),
  };
}

/**
 * Nonce header name for server components
 */
export const NONCE_HEADER = "x-csp-nonce";

/**
 * Get CSP nonce in server components
 * Reads the nonce from headers set by middleware
 */
export async function getCSPNonce(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get(NONCE_HEADER);
}
