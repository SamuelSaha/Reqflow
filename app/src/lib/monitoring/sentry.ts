/**
 * Sentry Error Tracking Helpers
 */

import * as Sentry from "@sentry/nextjs";

export function captureError(
  error: Error | unknown,
  context?: Record<string, unknown>
) {
  if (context) {
    Sentry.setContext("additional", context);
  }

  if (error instanceof Error) {
    Sentry.captureException(error);
  } else {
    Sentry.captureException(new Error(String(error)));
  }
}

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info"
) {
  Sentry.captureMessage(message, level);
}

export function setUser(user: {
  id: string;
  email: string;
  tenantId: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    tenant_id: user.tenantId,
  });
}

export function clearUser() {
  Sentry.setUser(null);
}
