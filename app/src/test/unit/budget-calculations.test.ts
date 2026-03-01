/**
 * Unit tests for budget calculations
 * Critical path: Budget utilization and availability checks
 */

import { describe, it, expect } from "vitest";

// Budget calculation functions
function calculateUtilization(budget: {
  allocated: string;
  committed: string;
  spent: string;
}): number {
  const allocated = parseFloat(budget.allocated);
  const committed = parseFloat(budget.committed);
  const spent = parseFloat(budget.spent);

  if (allocated === 0) return 0;
  return ((committed + spent) / allocated) * 100;
}

function checkAvailability(
  budget: {
    allocated: string;
    committed: string;
    spent: string;
    softLimit?: string;
  },
  requestedAmount: number
): {
  available: boolean;
  remaining: number;
  utilizationAfter: number;
  exceedsSoftLimit: boolean;
} {
  const allocated = parseFloat(budget.allocated);
  const committed = parseFloat(budget.committed);
  const spent = parseFloat(budget.spent);
  const softLimit = budget.softLimit ? parseFloat(budget.softLimit) : 0.8;

  const remaining = allocated - committed - spent;
  const available = remaining >= requestedAmount;
  const utilizationAfter = ((committed + spent + requestedAmount) / allocated) * 100;
  const exceedsSoftLimit = utilizationAfter > softLimit * 100;

  return {
    available,
    remaining,
    utilizationAfter,
    exceedsSoftLimit,
  };
}

describe("Budget Calculations", () => {
  describe("Utilization calculation", () => {
    it("should calculate 0% utilization for unused budget", () => {
      const utilization = calculateUtilization({
        allocated: "10000.00",
        committed: "0.00",
        spent: "0.00",
      });

      expect(utilization).toBe(0);
    });

    it("should calculate 50% utilization", () => {
      const utilization = calculateUtilization({
        allocated: "10000.00",
        committed: "3000.00",
        spent: "2000.00",
      });

      expect(utilization).toBe(50);
    });

    it("should calculate 100% utilization", () => {
      const utilization = calculateUtilization({
        allocated: "10000.00",
        committed: "6000.00",
        spent: "4000.00",
      });

      expect(utilization).toBe(100);
    });

    it("should handle over-utilization", () => {
      const utilization = calculateUtilization({
        allocated: "10000.00",
        committed: "8000.00",
        spent: "5000.00",
      });

      expect(utilization).toBe(130);
    });

    it("should return 0 for zero-allocated budget", () => {
      const utilization = calculateUtilization({
        allocated: "0.00",
        committed: "1000.00",
        spent: "500.00",
      });

      expect(utilization).toBe(0);
    });
  });

  describe("Budget availability check", () => {
    const baseBudget = {
      allocated: "10000.00",
      committed: "3000.00",
      spent: "2000.00",
    };

    it("should allow request within available budget", () => {
      const result = checkAvailability(baseBudget, 4000);

      expect(result.available).toBe(true);
      expect(result.remaining).toBe(5000);
      expect(result.utilizationAfter).toBe(90);
    });

    it("should block request exceeding available budget", () => {
      const result = checkAvailability(baseBudget, 6000);

      expect(result.available).toBe(false);
      expect(result.remaining).toBe(5000);
      expect(result.utilizationAfter).toBeCloseTo(110, 0);
    });

    it("should detect soft limit exceeded", () => {
      const result = checkAvailability(
        { ...baseBudget, softLimit: "0.8" },
        3500
      );

      expect(result.available).toBe(true);
      expect(result.exceedsSoftLimit).toBe(true);
      expect(result.utilizationAfter).toBeCloseTo(85, 0);
    });

    it("should allow request under soft limit", () => {
      const result = checkAvailability(
        { ...baseBudget, softLimit: "0.8" },
        2000
      );

      expect(result.available).toBe(true);
      expect(result.exceedsSoftLimit).toBe(false);
      expect(result.utilizationAfter).toBe(70);
    });

    it("should handle exact remaining amount", () => {
      const result = checkAvailability(baseBudget, 5000);

      expect(result.available).toBe(true);
      expect(result.remaining).toBe(5000);
      expect(result.utilizationAfter).toBe(100);
    });
  });

  describe("Edge cases", () => {
    const edgeBudget = {
      allocated: "10000.00",
      committed: "3000.00",
      spent: "2000.00",
    };

    it("should handle decimal amounts", () => {
      const utilization = calculateUtilization({
        allocated: "1000.50",
        committed: "500.25",
        spent: "250.10",
      });

      expect(utilization).toBeCloseTo(75, 0);
    });

    it("should handle large budget amounts", () => {
      const result = checkAvailability(
        {
          allocated: "1000000.00",
          committed: "500000.00",
          spent: "250000.00",
        },
        100000
      );

      expect(result.available).toBe(true);
      expect(result.remaining).toBe(250000);
    });

    it("should handle zero request amount", () => {
      const result = checkAvailability(edgeBudget, 0);

      expect(result.available).toBe(true);
      expect(result.utilizationAfter).toBe(50);
    });
  });
});
