import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { env } from "./src/lib/env";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Turbopack configuration (Next.js 16+)
  turbopack: {
    // Enable optimizations for Turbopack
  },

  // Code splitting optimizations
  experimental: {
    // Optimize package imports for better tree-shaking
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "framer-motion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
    ],
  },

  // Webpack optimizations for code splitting
  webpack: (config, { isServer, dev }) => {
    // Enable split chunks for better caching
    if (!isServer && !dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            // Vendor chunks for node_modules
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              priority: 10,
            },
            // Separate chunk for React + core
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              name: "react",
              chunks: "all",
              priority: 20,
            },
            // Separate chunk for tRPC
            trpc: {
              test: /[\\/]node_modules[\\/](@trpc)[\\/]/,
              name: "trpc",
              chunks: "all",
              priority: 15,
            },
            // Separate chunk for Radix UI
            radix: {
              test: /[\\/]node_modules[\\/](@radix-ui)[\\/]/,
              name: "radix",
              chunks: "all",
              priority: 15,
            },
            // Separate chunk for charts (Recharts)
            charts: {
              test: /[\\/]node_modules[\\/](recharts|d3|d3-array)[\\/]/,
              name: "charts",
              chunks: "all",
              priority: 15,
            },
            // Common chunks for shared code
            common: {
              minChunks: 2,
              name: "common",
              chunks: "all",
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },

  // Logging for debugging
  logging: {
    fetches: {
      fullUrl: env.NODE_ENV === "development",
    },
  },

  // 🔒 SECURITY FIX: Comprehensive security headers
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
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
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
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.sentry.io https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.sentry.io https://*.axiom.co https://*.cloudflare.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
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
