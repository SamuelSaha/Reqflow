import * as Sentry from "@sentry/nextjs";

// Use process.env directly — @/lib/env throws when server-side vars are
// accessed from the client bundle. SENTRY_DSN is undefined on the client
// (not a NEXT_PUBLIC_ var), so Sentry init is safely skipped.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,

    // Tracing
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    integrations: [
      Sentry.browserTracingIntegration(),
      // 🔒 SECURITY (issue #115): Session replay disabled for CSP compliance
      // The replay integration uses eval/new Function which requires unsafe-eval
      // Re-enable if needed by accepting the eval risk or using Sentry Loader Script
      // Sentry.replayIntegration({
      //   maskAllText: true,
      //   blockAllMedia: true,
      // }),
    ],

    // 🔒 SECURITY (issue #115): Session replay disabled for CSP compliance
    // replaysSessionSampleRate: 0.1,
    // replaysOnErrorSampleRate: 1.0,

    // Don't report errors from browser extensions
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed",
    ],
  });
}
