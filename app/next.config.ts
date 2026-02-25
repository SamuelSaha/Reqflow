import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { env } from "./src/lib/env";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Logging for debugging
  logging: {
    fetches: {
      fullUrl: env.NODE_ENV === "development",
    },
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

// Sentry configuration options
const sentryOptions = {
  silent: true,
  org: env.SENTRY_ORG,
  project: env.SENTRY_PROJECT,
  authToken: env.SENTRY_AUTH_TOKEN,
};

// Wrap with Sentry only if DSN is configured
export default env.SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryOptions)
  : nextConfig;
