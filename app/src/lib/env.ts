import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables schema
   */
  server: {
    // Database
    DATABASE_URL: z.string().url(),

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
  },

  /**
   * Runtime environment variables
   */
  runtimeEnv: {
    // Server
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,
    JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    ONESIGNAL_APP_ID: process.env.ONESIGNAL_APP_ID,
    ONESIGNAL_API_KEY: process.env.ONESIGNAL_API_KEY,
    SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID,
    SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET,
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    SLACK_WORKSPACE_ID: process.env.SLACK_WORKSPACE_ID,
    SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
    DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    QUICKBOOKS_CLIENT_ID: process.env.QUICKBOOKS_CLIENT_ID,
    QUICKBOOKS_CLIENT_SECRET: process.env.QUICKBOOKS_CLIENT_SECRET,
    QUICKBOOKS_REDIRECT_URI: process.env.QUICKBOOKS_REDIRECT_URI,
    XERO_CLIENT_ID: process.env.XERO_CLIENT_ID,
    XERO_CLIENT_SECRET: process.env.XERO_CLIENT_SECRET,
    XERO_REDIRECT_URI: process.env.XERO_REDIRECT_URI,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    AXIOM_API_TOKEN: process.env.AXIOM_API_TOKEN,
    AXIOM_DATASET: process.env.AXIOM_DATASET,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    FIELD_ENCRYPTION_KEY: process.env.FIELD_ENCRYPTION_KEY,
    RLS_ENABLED: process.env.RLS_ENABLED,
    NODE_ENV: process.env.NODE_ENV,

    // Client
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
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
