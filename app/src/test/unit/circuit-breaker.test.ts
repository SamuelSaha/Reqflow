/**
 * Circuit Breaker Tests
 * Validates circuit breaker behavior for external service resilience
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock logger to avoid env loading
vi.mock("@/lib/monitoring/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import {
  CircuitBreaker,
  CircuitState,
  CircuitBreakerError,
  circuitBreakerRegistry,
} from "@/lib/resilience/circuit-breaker";

describe("CircuitBreaker", () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    // Create a new breaker with low threshold for testing
    breaker = new CircuitBreaker("test-service", {
      threshold: 3,
      timeout: 1000,
      requestTimeout: 500,
    });
  });

  it("should start in CLOSED state", () => {
    const stats = breaker.getStats();
    expect(stats.state).toBe(CircuitState.CLOSED);
    expect(stats.consecutiveFailures).toBe(0);
  });

  it("should execute successful requests", async () => {
    const fn = vi.fn().mockResolvedValue("success");
    const result = await breaker.execute(fn);

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledOnce();

    const stats = breaker.getStats();
    expect(stats.successes).toBe(1);
    expect(stats.failures).toBe(0);
    expect(stats.state).toBe(CircuitState.CLOSED);
  });

  it("should record failures without opening circuit (below threshold)", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("Service error"));

    // Fail twice (below threshold of 3)
    await expect(breaker.execute(fn)).rejects.toThrow("Service error");
    await expect(breaker.execute(fn)).rejects.toThrow("Service error");

    const stats = breaker.getStats();
    expect(stats.failures).toBe(2);
    expect(stats.consecutiveFailures).toBe(2);
    expect(stats.state).toBe(CircuitState.CLOSED); // Still closed
  });

  it("should open circuit after threshold failures", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("Service error"));

    // Fail 3 times (meets threshold)
    await expect(breaker.execute(fn)).rejects.toThrow("Service error");
    await expect(breaker.execute(fn)).rejects.toThrow("Service error");
    await expect(breaker.execute(fn)).rejects.toThrow("Service error");

    const stats = breaker.getStats();
    expect(stats.state).toBe(CircuitState.OPEN);
    expect(stats.consecutiveFailures).toBe(3);
  });

  it("should reject requests when circuit is OPEN", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("Service error"));

    // Open the circuit
    await expect(breaker.execute(fn)).rejects.toThrow("Service error");
    await expect(breaker.execute(fn)).rejects.toThrow("Service error");
    await expect(breaker.execute(fn)).rejects.toThrow("Service error");

    expect(breaker.getStats().state).toBe(CircuitState.OPEN);

    // Next request should fail fast without calling function
    await expect(breaker.execute(fn)).rejects.toThrow(CircuitBreakerError);
    expect(fn).toHaveBeenCalledTimes(3); // Not called on 4th attempt
  });

  it("should transition to HALF_OPEN after timeout", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("Service error"));

    // Open the circuit
    await expect(breaker.execute(fn)).rejects.toThrow("Service error");
    await expect(breaker.execute(fn)).rejects.toThrow("Service error");
    await expect(breaker.execute(fn)).rejects.toThrow("Service error");

    expect(breaker.getStats().state).toBe(CircuitState.OPEN);

    // Wait for timeout (1000ms + buffer)
    await new Promise((resolve) => setTimeout(resolve, 1100));

    // Now fix the service
    fn.mockResolvedValue("success");

    // Should try again and succeed (HALF_OPEN → CLOSED)
    const result = await breaker.execute(fn);
    expect(result).toBe("success");
    expect(breaker.getStats().state).toBe(CircuitState.CLOSED);
  });

  it("should reset consecutive failures after success", async () => {
    const fn = vi.fn();

    // Fail once
    fn.mockRejectedValueOnce(new Error("Service error"));
    await expect(breaker.execute(fn)).rejects.toThrow("Service error");
    expect(breaker.getStats().consecutiveFailures).toBe(1);

    // Succeed
    fn.mockResolvedValueOnce("success");
    await breaker.execute(fn);
    expect(breaker.getStats().consecutiveFailures).toBe(0);
  });

  it("should timeout long-running requests", async () => {
    const fn = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    // Request should timeout before 1000ms (requestTimeout is 500ms)
    await expect(breaker.execute(fn)).rejects.toThrow("Request timeout");
  });

  it("should manually reset circuit", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("Service error"));

    // Open the circuit
    await expect(breaker.execute(fn)).rejects.toThrow("Service error");
    await expect(breaker.execute(fn)).rejects.toThrow("Service error");
    await expect(breaker.execute(fn)).rejects.toThrow("Service error");

    expect(breaker.getStats().state).toBe(CircuitState.OPEN);

    // Reset manually
    breaker.reset();

    const stats = breaker.getStats();
    expect(stats.state).toBe(CircuitState.CLOSED);
    expect(stats.consecutiveFailures).toBe(0);
  });
});

describe("circuitBreakerRegistry", () => {
  it("should reuse circuit breakers for same service", () => {
    const breaker1 = circuitBreakerRegistry.getBreaker("test-service");
    const breaker2 = circuitBreakerRegistry.getBreaker("test-service");

    expect(breaker1).toBe(breaker2);
  });

  it("should create different circuit breakers for different services", () => {
    const breaker1 = circuitBreakerRegistry.getBreaker("service-1");
    const breaker2 = circuitBreakerRegistry.getBreaker("service-2");

    expect(breaker1).not.toBe(breaker2);
  });

  it("should get all stats", () => {
    circuitBreakerRegistry.getBreaker("service-1");
    circuitBreakerRegistry.getBreaker("service-2");

    const stats = circuitBreakerRegistry.getAllStats();
    expect(Object.keys(stats)).toContain("service-1");
    expect(Object.keys(stats)).toContain("service-2");
  });

  it("should reset all circuit breakers", async () => {
    // Use unique service names to avoid test interference
    const uniqueId = Date.now();
    const breaker1 = circuitBreakerRegistry.getBreaker(`reset-test-1-${uniqueId}`, { threshold: 1 });
    const breaker2 = circuitBreakerRegistry.getBreaker(`reset-test-2-${uniqueId}`, { threshold: 1 });

    // Open both circuits
    const fn = vi.fn().mockRejectedValue(new Error("Error"));
    await expect(breaker1.execute(fn)).rejects.toThrow();
    await expect(breaker2.execute(fn)).rejects.toThrow();

    expect(breaker1.getStats().state).toBe(CircuitState.OPEN);
    expect(breaker2.getStats().state).toBe(CircuitState.OPEN);

    // Reset all
    circuitBreakerRegistry.resetAll();

    expect(breaker1.getStats().state).toBe(CircuitState.CLOSED);
    expect(breaker2.getStats().state).toBe(CircuitState.CLOSED);
  });
});
