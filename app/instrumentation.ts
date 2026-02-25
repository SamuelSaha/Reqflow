/**
 * Next.js Instrumentation Hook
 * Runs on server startup for initialization
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Import Sentry server config
    await import("./sentry.server.config");

    // Initialize logger
    const { logger } = await import("@/lib/monitoring/logger");
    logger.info("Application instrumentation initialized", {
      environment: process.env.NODE_ENV,
      runtime: "nodejs",
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
