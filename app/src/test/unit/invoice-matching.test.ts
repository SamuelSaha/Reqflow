/**
 * Unit tests for 3-way invoice matching algorithm
 * Critical path: Invoice → PO matching with variance detection
 */

import { describe, it, expect } from "vitest";

// Extract matching logic for testing
function calculateMatch(invoice: {
  totalAmount: string;
}, matchTarget: {
  amount: string;
}) {
  const invoiceTotal = parseFloat(invoice.totalAmount);
  const expectedAmount = parseFloat(matchTarget.amount);

  const variance = invoiceTotal - expectedAmount;
  const variancePercent = Math.abs(variance) / expectedAmount;

  // Exact match (confidence 1.00)
  if (variance === 0) {
    return {
      matchStatus: "auto_matched" as const,
      matchConfidence: 1.0,
      varianceAmount: 0,
      varianceReason: null,
    };
  }

  // Threshold match: ±5% variance (confidence 0.85-0.95)
  if (variancePercent <= 0.05) {
    const confidence = 0.95 - (variancePercent * 2);
    return {
      matchStatus: "auto_matched" as const,
      matchConfidence: Number(confidence.toFixed(2)),
      varianceAmount: Number(variance.toFixed(2)),
      varianceReason: variance > 0 ? "overcharge" : "undercharge",
    };
  }

  // Manual review required: >5% variance
  return {
    matchStatus: "unmatched" as const,
    matchConfidence: 0.5,
    varianceAmount: Number(variance.toFixed(2)),
    varianceReason: variance > 0 ? "significant_overcharge" : "significant_undercharge",
  };
}

describe("Invoice Matching Algorithm", () => {
  describe("Exact matches", () => {
    it("should auto-match when amounts are exactly equal", () => {
      const result = calculateMatch(
        { totalAmount: "1000.00" },
        { amount: "1000.00" }
      );

      expect(result.matchStatus).toBe("auto_matched");
      expect(result.matchConfidence).toBe(1.0);
      expect(result.varianceAmount).toBe(0);
      expect(result.varianceReason).toBeNull();
    });

    it("should auto-match when amounts are equal with different precision", () => {
      const result = calculateMatch(
        { totalAmount: "1000" },
        { amount: "1000.00" }
      );

      expect(result.matchStatus).toBe("auto_matched");
      expect(result.matchConfidence).toBe(1.0);
    });
  });

  describe("Threshold matches (±5%)", () => {
    it("should auto-match with 95% confidence for 0.1% variance", () => {
      const result = calculateMatch(
        { totalAmount: "1001.00" },
        { amount: "1000.00" }
      );

      expect(result.matchStatus).toBe("auto_matched");
      expect(result.matchConfidence).toBeGreaterThanOrEqual(0.94);
      expect(result.matchConfidence).toBeLessThanOrEqual(0.95);
      expect(result.varianceAmount).toBe(1.0);
      expect(result.varianceReason).toBe("overcharge");
    });

    it("should auto-match with 85% confidence for 5% variance", () => {
      const result = calculateMatch(
        { totalAmount: "1050.00" },
        { amount: "1000.00" }
      );

      expect(result.matchStatus).toBe("auto_matched");
      expect(result.matchConfidence).toBeGreaterThanOrEqual(0.84);
      expect(result.matchConfidence).toBeLessThanOrEqual(0.86);
      expect(result.varianceAmount).toBe(50.0);
      expect(result.varianceReason).toBe("overcharge");
    });

    it("should detect undercharge within threshold", () => {
      const result = calculateMatch(
        { totalAmount: "980.00" },
        { amount: "1000.00" }
      );

      expect(result.matchStatus).toBe("auto_matched");
      expect(result.matchConfidence).toBeGreaterThan(0.85);
      expect(result.varianceAmount).toBe(-20.0);
      expect(result.varianceReason).toBe("undercharge");
    });
  });

  describe("Manual review required (>5% variance)", () => {
    it("should require manual review for 6% overcharge", () => {
      const result = calculateMatch(
        { totalAmount: "1060.00" },
        { amount: "1000.00" }
      );

      expect(result.matchStatus).toBe("unmatched");
      expect(result.matchConfidence).toBe(0.5);
      expect(result.varianceAmount).toBe(60.0);
      expect(result.varianceReason).toBe("significant_overcharge");
    });

    it("should require manual review for 10% undercharge", () => {
      const result = calculateMatch(
        { totalAmount: "900.00" },
        { amount: "1000.00" }
      );

      expect(result.matchStatus).toBe("unmatched");
      expect(result.matchConfidence).toBe(0.5);
      expect(result.varianceAmount).toBe(-100.0);
      expect(result.varianceReason).toBe("significant_undercharge");
    });

    it("should require manual review for 50% overcharge", () => {
      const result = calculateMatch(
        { totalAmount: "1500.00" },
        { amount: "1000.00" }
      );

      expect(result.matchStatus).toBe("unmatched");
      expect(result.varianceReason).toBe("significant_overcharge");
    });
  });

  describe("Edge cases", () => {
    it("should handle small amounts correctly", () => {
      const result = calculateMatch(
        { totalAmount: "1.00" },
        { amount: "1.00" }
      );

      expect(result.matchStatus).toBe("auto_matched");
      expect(result.matchConfidence).toBe(1.0);
    });

    it("should handle large amounts correctly", () => {
      const result = calculateMatch(
        { totalAmount: "999999.99" },
        { amount: "999999.99" }
      );

      expect(result.matchStatus).toBe("auto_matched");
    });

    it("should handle decimal precision", () => {
      const result = calculateMatch(
        { totalAmount: "99.99" },
        { amount: "100.00" }
      );

      expect(result.matchStatus).toBe("auto_matched");
      expect(result.varianceAmount).toBe(-0.01);
    });
  });
});
