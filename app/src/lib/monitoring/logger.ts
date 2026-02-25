/**
 * Structured Logger with Axiom Integration
 * Replaces console.log throughout the application
 */

import { Axiom } from "@axiomhq/js";
import { env } from "../env";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
  tenantId?: string;
  userId?: string;
  requestId?: string;
}

class Logger {
  private axiom: Axiom | null = null;
  private dataset: string;

  constructor() {
    this.dataset = env.AXIOM_DATASET;

    if (env.AXIOM_API_TOKEN) {
      this.axiom = new Axiom({
        token: env.AXIOM_API_TOKEN,
        orgId: env.AXIOM_ORG_ID,
      });
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
      environment: env.NODE_ENV,
    };

    // Always log to console in development
    if (env.NODE_ENV === "development") {
      const emoji = { debug: "🔍", info: "ℹ️", warn: "⚠️", error: "❌" }[level];
      console.log(`${emoji} [${level.toUpperCase()}] ${message}`, context || "");
    }

    // Send to Axiom if configured
    if (this.axiom) {
      this.axiom.ingest(this.dataset, [logEntry]).catch((err) => {
        console.error("Failed to send log to Axiom:", err);
      });
    }
  }

  debug(message: string, context?: LogContext) {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext) {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
    };
    this.log("error", message, errorContext);
  }

  /**
   * Flush pending logs (call before shutdown)
   */
  async flush() {
    if (this.axiom) {
      await this.axiom.flush();
    }
  }
}

export const logger = new Logger();

/**
 * Create child logger with default context
 */
export function createLogger(defaultContext: LogContext) {
  return {
    debug: (msg: string, ctx?: LogContext) =>
      logger.debug(msg, { ...defaultContext, ...ctx }),
    info: (msg: string, ctx?: LogContext) =>
      logger.info(msg, { ...defaultContext, ...ctx }),
    warn: (msg: string, ctx?: LogContext) =>
      logger.warn(msg, { ...defaultContext, ...ctx }),
    error: (msg: string, err?: Error | unknown, ctx?: LogContext) =>
      logger.error(msg, err, { ...defaultContext, ...ctx }),
  };
}
