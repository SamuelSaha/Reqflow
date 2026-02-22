/**
 * Better Auth Configuration
 * Multi-tenant authentication with MFA support
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import { env } from "../env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  // Email & password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },

  // Social providers (optional, can add later)
  socialProviders: {
    google: {
      enabled: false,
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    microsoft: {
      enabled: false,
      clientId: process.env.MICROSOFT_CLIENT_ID || "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
    },
  },


  // Account management
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "microsoft"],
    },
  },

  // Advanced options
  advanced: {
    cookiePrefix: "reqflow",
    useSecureCookies: env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false,
    },
  },

});

/**
 * Log authentication events to audit trail
 */
async function logAuthEvent(event: {
  event: string;
  userId?: string;
  userEmail?: string;
  success: boolean;
  metadata?: Record<string, unknown>;
}) {
  const { db } = await import("../db");
  const { authEvents } = await import("../db/schema");

  try {
    await db.insert(authEvents).values({
      userId: event.userId,
      userEmail: event.userEmail,
      event: event.event,
      success: event.success ? "true" : "false",
      metadata: event.metadata,
      // IP and user agent would be extracted from request context
    });
  } catch (error) {
    console.error("Failed to log auth event:", error);
  }
}

export type Auth = typeof auth;
