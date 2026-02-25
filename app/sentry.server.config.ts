import * as Sentry from "@sentry/nextjs";
import { env } from "@/lib/env";

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,

    // Tracing
    tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1.0,

    integrations: [
      Sentry.postgresIntegration(),
    ],

    // Don't send sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers["authorization"];
        delete event.request.headers["cookie"];
      }

      return event;
    },
  });
}
