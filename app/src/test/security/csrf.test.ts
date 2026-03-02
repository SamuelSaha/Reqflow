/**
 * CSRF Protection Unit Tests
 * Validates token generation, timing-safe comparison, and withCSRF middleware
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/headers before importing the module under test
const mockCookies = new Map<string, string>();
const mockHeaders = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      const value = mockCookies.get(name);
      return value ? { value } : undefined;
    },
    set: vi.fn((name: string, value: string) => {
      mockCookies.set(name, value);
    }),
  })),
  headers: vi.fn(async () => ({
    get: (name: string) => mockHeaders.get(name) || null,
  })),
}));

vi.mock("@/lib/env", () => ({
  env: {
    AUTH_SECRET: "test-secret-for-csrf-tests-minimum-32-chars",
    NODE_ENV: "test",
  },
}));

import {
  generateCSRFToken,
  validateCSRFToken,
  setCSRFToken,
  getCSRFTokenFromRequest,
  withCSRF,
} from "@/lib/security/csrf";

describe("CSRF Protection", () => {
  beforeEach(() => {
    mockCookies.clear();
    mockHeaders.clear();
  });

  describe("generateCSRFToken", () => {
    it("should produce unique tokens", () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      expect(token1).not.toBe(token2);
    });

    it("should produce base64url-encoded 32-byte tokens", () => {
      const token = generateCSRFToken();
      // 32 bytes in base64url = 43 characters
      expect(token.length).toBe(43);
      // Must be valid base64url (no +, /, =)
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });

  describe("validateCSRFToken", () => {
    it("should return false for null token", async () => {
      expect(await validateCSRFToken(null)).toBe(false);
    });

    it("should return false for empty string", async () => {
      expect(await validateCSRFToken("")).toBe(false);
    });

    it("should return false when no cookie is set", async () => {
      // No csrf_token cookie
      expect(await validateCSRFToken("some-token")).toBe(false);
    });

    it("should return false for mismatched token", async () => {
      mockCookies.set("csrf_token", "real-token-abc123");
      expect(await validateCSRFToken("wrong-token-xyz")).toBe(false);
    });

    it("should return false for different-length tokens", async () => {
      mockCookies.set("csrf_token", "short");
      expect(await validateCSRFToken("much-longer-token-value")).toBe(false);
    });

    it("should return true for matching token", async () => {
      const token = generateCSRFToken();
      mockCookies.set("csrf_token", token);
      expect(await validateCSRFToken(token)).toBe(true);
    });
  });

  describe("setCSRFToken", () => {
    it("should store a token in cookies and return it", async () => {
      const token = await setCSRFToken();
      expect(token.length).toBe(43);
      expect(mockCookies.get("csrf_token")).toBe(token);
    });
  });

  describe("getCSRFTokenFromRequest", () => {
    it("should return null when header is missing", async () => {
      expect(await getCSRFTokenFromRequest()).toBeNull();
    });

    it("should return token from x-csrf-token header", async () => {
      mockHeaders.set("x-csrf-token", "my-token");
      expect(await getCSRFTokenFromRequest()).toBe("my-token");
    });
  });

  describe("withCSRF middleware", () => {
    const mockHandler = vi.fn(async () => Response.json({ ok: true }));

    beforeEach(() => {
      mockHandler.mockClear();
    });

    it("should return 403 when CSRF token is missing", async () => {
      vi.stubEnv("NODE_ENV", "production");

      const wrapped = withCSRF(mockHandler);
      const request = new Request("http://localhost/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const response = await wrapped(request);
      expect(response.status).toBe(403);

      const body = await response.json();
      expect(body.error).toContain("CSRF token");
      expect(mockHandler).not.toHaveBeenCalled();

      vi.unstubAllEnvs();
    });

    it("should return 403 when CSRF token is invalid", async () => {
      vi.stubEnv("NODE_ENV", "production");

      mockCookies.set("csrf_token", "real-token");

      const wrapped = withCSRF(mockHandler);
      const request = new Request("http://localhost/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": "wrong-token",
        },
      });

      const response = await wrapped(request);
      expect(response.status).toBe(403);
      expect(mockHandler).not.toHaveBeenCalled();

      vi.unstubAllEnvs();
    });

    it("should pass through when CSRF token is valid", async () => {
      vi.stubEnv("NODE_ENV", "production");

      const token = generateCSRFToken();
      mockCookies.set("csrf_token", token);

      const wrapped = withCSRF(mockHandler);
      const request = new Request("http://localhost/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": token,
        },
      });

      const response = await wrapped(request);
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalledWith(request);

      vi.unstubAllEnvs();
    });

    it("should skip validation in development mode", async () => {
      vi.stubEnv("NODE_ENV", "development");

      // No CSRF token at all - should still pass in dev
      const wrapped = withCSRF(mockHandler);
      const request = new Request("http://localhost/api/auth/logout", {
        method: "POST",
      });

      const response = await wrapped(request);
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();

      vi.unstubAllEnvs();
    });
  });
});
