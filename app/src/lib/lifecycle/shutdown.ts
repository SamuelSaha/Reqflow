/**
 * Graceful Shutdown Handler
 * Cleanly closes all connections when the app terminates
 */

import { logger } from "../monitoring/logger";
import { closeDbConnections } from "../db";

/**
 * Track shutdown state to prevent duplicate shutdowns
 */
let isShuttingDown = false;

/**
 * Graceful shutdown handler
 * Closes database connections, Redis, and other resources
 */
export async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    logger.warn("Shutdown already in progress, ignoring signal", { signal });
    return;
  }

  isShuttingDown = true;
  logger.info("Graceful shutdown initiated", { signal });

  try {
    // Close database connections
    await closeDbConnections();

    // Close Redis connections (if needed)
    // Note: BullMQ workers handle their own Redis cleanup

    logger.info("Graceful shutdown completed");

    // Exit with success
    process.exit(0);
  } catch (error) {
    logger.error("Error during graceful shutdown", error as Error);

    // Exit with error
    process.exit(1);
  }
}

/**
 * Register shutdown handlers for common signals
 * Call this once at app startup (e.g., in instrumentation.ts)
 */
export function registerShutdownHandlers(): void {
  // SIGTERM - Docker/Kubernetes graceful shutdown
  process.on("SIGTERM", () => {
    gracefulShutdown("SIGTERM");
  });

  // SIGINT - Ctrl+C in terminal
  process.on("SIGINT", () => {
    gracefulShutdown("SIGINT");
  });

  // Uncaught exceptions - last resort
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception", error);
    gracefulShutdown("uncaughtException");
  });

  // Unhandled promise rejections
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection", reason as Error);
    gracefulShutdown("unhandledRejection");
  });

  logger.info("Shutdown handlers registered");
}
