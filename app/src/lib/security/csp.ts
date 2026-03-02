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
    // 🔒 SECURITY: Scripts use nonces, no unsafe-inline
    // Note: unsafe-eval removed by disabling Sentry session replay
    `script-src 'self' 'nonce-${nonce}' https://*.sentry.io${isDev ? " 'unsafe-eval'" : ""}`,
    // 🔒 SECURITY: Styles still need unsafe-inline for Tailwind CSS and Radix UI
    // This is a known limitation - Tailwind generates classes at build time but
    // Radix UI injects inline styles at runtime for animations/positioning
    // Future: Migrate to CSS-in-JS with nonce support or use strict-dynamic
    `style-src 'self' 'unsafe-inline' 'nonce-${nonce}'`,
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
