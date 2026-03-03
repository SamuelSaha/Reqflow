/**
 * Input Sanitization Utilities
 * Prevents XSS and injection attacks from user inputs
 */

/**
 * Sanitize string input to prevent XSS
 * Removes dangerous HTML tags and scripts
 */
export function sanitizeString(input: string): string {
  if (!input) return "";

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // Remove inline event handlers
    .replace(/javascript:/gi, "")
    .trim();
}

/**
 * Sanitize email to ensure it's safe
 */
export function sanitizeEmail(email: string): string {
  if (!email) return "";

  const cleaned = email.toLowerCase().trim();

  // Basic email validation (more strict validation should use zod)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleaned)) {
    throw new Error("Invalid email format");
  }

  return cleaned;
}

/**
 * Sanitize numeric string to ensure it's actually a number
 */
export function sanitizeNumber(input: string | number): number {
  const num = typeof input === "string" ? parseFloat(input) : input;

  if (isNaN(num) || !isFinite(num)) {
    throw new Error("Invalid number");
  }

  return num;
}

/**
 * Sanitize currency amount - ensure it's a valid decimal with max 2 decimal places
 */
export function sanitizeCurrency(amount: string | number): number {
  const num = sanitizeNumber(amount);

  if (num < 0) {
    throw new Error("Currency amount cannot be negative");
  }

  // Round to 2 decimal places
  return Math.round(num * 100) / 100;
}

/**
 * Sanitize URL to ensure it's safe
 */
export function sanitizeUrl(url: string): string {
  if (!url) return "";

  const cleaned = url.trim();

  // Only allow http(s) and mailto protocols
  const allowedProtocols = ["http:", "https:", "mailto:"];
  try {
    const parsed = new URL(cleaned);
    if (!allowedProtocols.includes(parsed.protocol)) {
      throw new Error("Invalid URL protocol");
    }
    return cleaned;
  } catch {
    throw new Error("Invalid URL format");
  }
}

/**
 * Sanitize JSON string input - ensures it's valid JSON
 */
export function sanitizeJSON<T>(input: string): T {
  try {
    return JSON.parse(input) as T;
  } catch {
    throw new Error("Invalid JSON");
  }
}

/**
 * Sanitize object by applying sanitizeString to all string values recursively
 * Useful for sanitizing form data or API payloads
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "object" && item !== null
          ? sanitizeObject(item)
          : typeof item === "string"
          ? sanitizeString(item)
          : item
      );
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}
