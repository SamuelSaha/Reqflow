import * as Sentry from "@sentry/nextjs";
import { env } from "@/lib/env";

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,

    // Tracing
    tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1.0,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    // Don't report errors from browser extensions
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed",
    ],
  });
}
