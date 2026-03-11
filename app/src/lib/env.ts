import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables schema
   */
  server: {
    // Database
    DATABASE_URL: z.string().url(),
    // Optional: Connection pooler URL (Neon, Supabase, PgBouncer)
    // Use this in serverless for better connection management
    DATABASE_POOLER_URL: z.string().url().optional(),

    // Redis (Upstash for BullMQ)
    REDIS_URL: z.string().url(),

    // Better Auth
    AUTH_SECRET: z.string().min(32),
    AUTH_URL: z.string().url(),

    // 🔒 SECURITY (issue #116): JWT RS256 asymmetric keys
    // Private key for signing (base64-encoded PEM)
    JWT_PRIVATE_KEY: z.string().optional(),
    // Public key for verification (base64-encoded PEM)
    JWT_PUBLIC_KEY: z.string().optional(),

    // Cloudflare R2
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET_NAME: z.string().default("reqflow-files"),

    // Resend (Email)
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().optional().default("Reqflow <notifications@reqflow.com>"),

    // OneSignal (Push Notifications)
    ONESIGNAL_APP_ID: z.string().optional(),
    ONESIGNAL_API_KEY: z.string().optional(),

    // Slack (full OAuth integration - optional)
    SLACK_CLIENT_ID: z.string().optional(),
    SLACK_CLIENT_SECRET: z.string().optional(),
    SLACK_SIGNING_SECRET: z.string().optional(),
    SLACK_BOT_TOKEN: z.string().optional(),
    SLACK_WORKSPACE_ID: z.string().optional(),

    // Notifications (simplified webhooks)
    SLACK_WEBHOOK_URL: z.string().url().optional(),
    DISCORD_WEBHOOK_URL: z.string().url().optional(),
    TELEGRAM_BOT_TOKEN: z.string().optional(),
    TELEGRAM_CHAT_ID: z.string().optional(),

    // QuickBooks
    QUICKBOOKS_CLIENT_ID: z.string().optional(),
    QUICKBOOKS_CLIENT_SECRET: z.string().optional(),
    QUICKBOOKS_REDIRECT_URI: z.string().optional(),

    // Xero
    XERO_CLIENT_ID: z.string().optional(),
    XERO_CLIENT_SECRET: z.string().optional(),
    XERO_REDIRECT_URI: z.string().optional(),

    // AI (Claude/Anthropic)
    ANTHROPIC_API_KEY: z.string().optional(),

    // Vercel deployment detection (auto-set by Vercel runtime)
    VERCEL: z.string().optional(),

    // Monitoring
    AXIOM_API_TOKEN: z.string().optional(),
    AXIOM_DATASET: z.string().default("reqflow"),
    SENTRY_DSN: z.string().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),

    // Upstash Redis REST (for rate limiting in serverless)
    UPSTASH_REDIS_REST_URL: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    // Field-level encryption (for OAuth tokens, API keys, PII)
    FIELD_ENCRYPTION_KEY: z.string().min(32).optional(),

    // Row-Level Security (RLS) feature flag
    // SECURITY: Enabled by default. Database-level tenant isolation provides defense-in-depth
    // even if application-level filtering is missed.
    RLS_ENABLED: z.enum(["true", "false"]).default("true"),

    // Environment
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },

  /**
   * Client-side environment variables schema
   * Exposed to the client with NEXT_PUBLIC_ prefix
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: z.string().optional(),
  },

  /**
   * Runtime environment variables
   * Only client-side variables (NEXT_PUBLIC_*) need to be listed here
   * Server variables are automatically read from process.env
   */
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },

  /**
   * Skip validation in build for optional variables
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Makes it so that empty strings are treated as undefined
   */
  emptyStringAsUndefined: true,
});
