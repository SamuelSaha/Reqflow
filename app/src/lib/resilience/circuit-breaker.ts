/**
 * Circuit Breaker Pattern Implementation
 *
 * Prevents cascading failures when external services are down.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is failing, fail fast without calling service
 * - HALF_OPEN: Testing if service recovered, limited requests allowed
 *
 * Usage:
 * ```ts
 * const breaker = new CircuitBreaker('slack-api', { threshold: 5, timeout: 60000 });
 * const result = await breaker.execute(() => slackApi.sendMessage());
 * ```
 */

import { logger } from "@/lib/monitoring/logger";

export enum CircuitState {
  CLOSED = "CLOSED",     // Normal operation
  OPEN = "OPEN",         // Failing, reject requests
  HALF_OPEN = "HALF_OPEN" // Testing recovery
}

export interface CircuitBreakerOptions {
  /** Number of failures before opening circuit (default: 5) */
  threshold?: number;
  /** Time in ms to wait before attempting recovery (default: 60000 = 1min) */
  timeout?: number;
  /** Time in ms for request timeout (default: 30000 = 30s) */
  requestTimeout?: number;
  /** Function to determine if error should count as failure */
  isFailure?: (error: Error) => boolean;
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  consecutiveFailures: number;
  totalCalls: number;
}

export class CircuitBreakerError extends Error {
  constructor(
    message: string,
    public readonly serviceName: string,
    public readonly state: CircuitState
  ) {
    super(message);
    this.name = "CircuitBreakerError";
  }
}

/**
 * Circuit Breaker for external service calls
 * Implements the classic circuit breaker pattern with 3 states
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;
  private nextAttemptTime: number | null = null;
  private consecutiveFailures = 0;
  private totalCalls = 0;

  private readonly threshold: number;
  private readonly timeout: number;
  private readonly requestTimeout: number;
  private readonly isFailure: (error: Error) => boolean;

  constructor(
    private readonly serviceName: string,
    options: CircuitBreakerOptions = {}
  ) {
    this.threshold = options.threshold ?? 5;
    this.timeout = options.timeout ?? 60000; // 1 minute
    this.requestTimeout = options.requestTimeout ?? 30000; // 30 seconds
    this.isFailure = options.isFailure ?? (() => true);
  }

  /**
   * Execute function with circuit breaker protection
   * Throws CircuitBreakerError if circuit is open
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalCalls++;

    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      // Check if timeout has elapsed to attempt recovery
      if (this.nextAttemptTime && Date.now() >= this.nextAttemptTime) {
        this.state = CircuitState.HALF_OPEN;
        logger.info("Circuit breaker entering HALF_OPEN state", {
          service: this.serviceName,
          consecutiveFailures: this.consecutiveFailures,
        });
      } else {
        // Circuit still open, fail fast
        throw new CircuitBreakerError(
          `Circuit breaker is OPEN for ${this.serviceName}. Service is unavailable.`,
          this.serviceName,
          CircuitState.OPEN
        );
      }
    }

    try {
      // Add timeout to the request
      const result = await this.withTimeout(fn());

      // Success - record and potentially close circuit
      this.onSuccess();
      return result;
    } catch (error) {
      // Failure - record and potentially open circuit
      this.onFailure(error as Error);
      throw error;
    }
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failureCount,
      successes: this.successCount,
      lastFailureTime: this.lastFailureTime,
      consecutiveFailures: this.consecutiveFailures,
      totalCalls: this.totalCalls,
    };
  }

  /**
   * Manually reset circuit breaker to CLOSED state
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.consecutiveFailures = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
    logger.info("Circuit breaker manually reset", { service: this.serviceName });
  }

  /**
   * Record successful call
   */
  private onSuccess(): void {
    this.successCount++;
    this.consecutiveFailures = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      // Successful request in HALF_OPEN state, close the circuit
      this.state = CircuitState.CLOSED;
      logger.info("Circuit breaker recovered and CLOSED", {
        service: this.serviceName,
        totalFailures: this.failureCount,
        totalSuccesses: this.successCount,
      });
    }
  }

  /**
   * Record failed call
   */
  private onFailure(error: Error): void {
    // Check if this error should count as a failure
    if (!this.isFailure(error)) {
      return;
    }

    this.failureCount++;
    this.consecutiveFailures++;
    this.lastFailureTime = Date.now();

    logger.warn("Circuit breaker recorded failure", {
      service: this.serviceName,
      consecutiveFailures: this.consecutiveFailures,
      threshold: this.threshold,
      error: error.message,
    });

    // Open circuit if threshold exceeded
    if (this.consecutiveFailures >= this.threshold) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.timeout;

      logger.error("Circuit breaker OPENED", {
        service: this.serviceName,
        consecutiveFailures: this.consecutiveFailures,
        nextAttemptTime: new Date(this.nextAttemptTime).toISOString(),
      });
    }
  }

  /**
   * Add timeout to promise
   */
  private async withTimeout<T>(promise: Promise<T>): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Request timeout after ${this.requestTimeout}ms`)),
          this.requestTimeout
        )
      ),
    ]);
  }
}

/**
 * Global circuit breaker registry
 * Reuses circuit breakers for the same service
 */
class CircuitBreakerRegistry {
  private breakers = new Map<string, CircuitBreaker>();

  /**
   * Get or create circuit breaker for a service
   */
  getBreaker(serviceName: string, options?: CircuitBreakerOptions): CircuitBreaker {
    if (!this.breakers.has(serviceName)) {
      this.breakers.set(serviceName, new CircuitBreaker(serviceName, options));
    }
    return this.breakers.get(serviceName)!;
  }

  /**
   * Get all circuit breaker statistics
   */
  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    for (const [name, breaker] of this.breakers.entries()) {
      stats[name] = breaker.getStats();
    }
    return stats;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }
}

export const circuitBreakerRegistry = new CircuitBreakerRegistry();

/**
 * Helper function to wrap an API call with circuit breaker
 */
export async function withCircuitBreaker<T>(
  serviceName: string,
  fn: () => Promise<T>,
  options?: CircuitBreakerOptions
): Promise<T> {
  const breaker = circuitBreakerRegistry.getBreaker(serviceName, options);
  return breaker.execute(fn);
}
