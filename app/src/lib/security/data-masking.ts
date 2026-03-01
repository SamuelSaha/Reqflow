/**
 * Data Masking Utilities
 *
 * Provides masking functions for sensitive data display in UI and logs.
 * Follows the principle of least privilege - only show what's necessary.
 */

// ============================================================================
// Types
// ============================================================================

export type MaskingLevel = "full" | "partial" | "none";

export interface MaskingConfig {
  email: MaskingLevel;
  phone: MaskingLevel;
  name: MaskingLevel;
  apiKey: MaskingLevel;
  cardNumber: MaskingLevel;
  amount: MaskingLevel;
  url: MaskingLevel;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const defaultMaskingConfig: MaskingConfig = {
  email: "partial",
  phone: "partial",
  name: "partial",
  apiKey: "full",
  cardNumber: "full",
  amount: "partial",
  url: "partial",
};

// ============================================================================
// Masking Functions
// ============================================================================

/**
 * Mask an email address
 * Example: "john.doe@example.com" → "j***@e***.com"
 */
export function maskEmail(email: string, level: MaskingLevel = "partial"): string {
  if (!email || level === "none") return email;
  if (level === "full") return "***@***.***";

  const [localPart, domain] = email.split("@");
  if (!domain) return "***";

  const maskedLocal = localPart.charAt(0) + "***";
  const [domainName, tld] = domain.split(".");
  const maskedDomain = domainName.charAt(0) + "***";

  return `${maskedLocal}@${maskedDomain}.${tld || "***"}`;
}

/**
 * Mask a phone number
 * Example: "+1 (555) 123-4567" → "+1 (***) ***-4567"
 */
export function maskPhone(phone: string, level: MaskingLevel = "partial"): string {
  if (!phone || level === "none") return phone;
  if (level === "full") return "***-***-****";

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";

  // Keep last 4 digits
  const lastFour = digits.slice(-4);
  return `***-***-${lastFour}`;
}

/**
 * Mask a name
 * Example: "John Doe" → "John D."
 */
export function maskName(name: string, level: MaskingLevel = "partial"): string {
  if (!name || level === "none") return name;
  if (level === "full") return "***";

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0) + "***";
  }

  // First name + last initial
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

/**
 * Mask an API key or token
 * Example: "sk_live_abc123xyz789" → "sk_l***789"
 */
export function maskApiKey(key: string, level: MaskingLevel = "full"): string {
  if (!key || level === "none") return key;
  if (level === "full") return "***********";

  if (key.length <= 8) return "***";

  // Show prefix and last 3 characters
  const prefix = key.slice(0, 4);
  const suffix = key.slice(-3);
  return `${prefix}***${suffix}`;
}

/**
 * Mask a credit card number
 * Example: "4111111111111111" → "**** **** **** 1111"
 */
export function maskCardNumber(cardNumber: string, level: MaskingLevel = "full"): string {
  if (!cardNumber || level === "none") return cardNumber;
  if (level === "full") return "**** **** **** ****";

  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 4) return "****";

  // Show last 4 digits
  const lastFour = digits.slice(-4);
  return `**** **** **** ${lastFour}`;
}

/**
 * Mask a financial amount (for non-finance users)
 * Example: "12345.67" → "12,***.**"
 */
export function maskAmount(amount: string | number, level: MaskingLevel = "partial"): string {
  if (level === "none") return String(amount);
  if (level === "full") return "***.**";

  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "***.**";

  // Show approximate magnitude
  if (num >= 1000000) return "***M";
  if (num >= 1000) return "***K";
  return "***.**";
}

/**
 * Mask a URL with sensitive parameters
 * Example: "https://api.example.com?token=secret123" → "https://api.example.com?token=***"
 */
export function maskUrl(url: string, level: MaskingLevel = "partial"): string {
  if (!url || level === "none") return url;
  if (level === "full") return "https://***.***";

  try {
    const parsed = new URL(url);

    // Mask sensitive query parameters
    const sensitiveParams = ["token", "key", "secret", "password", "api_key", "access_token"];
    const params = new URLSearchParams(parsed.search);

    for (const param of sensitiveParams) {
      if (params.has(param)) {
        params.set(param, "***");
      }
    }

    parsed.search = params.toString();
    return parsed.toString();
  } catch {
    return "***";
  }
}

/**
 * Mask a database connection string
 * Example: "postgres://user:pass@host:5432/db" → "postgres://***:***@host:5432/db"
 */
export function maskConnectionString(connStr: string, level: MaskingLevel = "full"): string {
  if (!connStr || level === "none") return connStr;
  if (level === "full") return "***********";

  try {
    const url = new URL(connStr);
    url.password = "***";
    url.username = "***";
    return url.toString();
  } catch {
    return "***";
  }
}

/**
 * Generic mask function that auto-detects the type
 */
export function mask(value: string, type?: keyof MaskingConfig, config: MaskingConfig = defaultMaskingConfig): string {
  const detectedType = type || detectType(value);
  const level = config[detectedType];

  switch (detectedType) {
    case "email":
      return maskEmail(value, level);
    case "phone":
      return maskPhone(value, level);
    case "name":
      return maskName(value, level);
    case "apiKey":
      return maskApiKey(value, level);
    case "cardNumber":
      return maskCardNumber(value, level);
    case "amount":
      return maskAmount(value, level);
    case "url":
      return maskUrl(value, level);
    default:
      return level === "none" ? value : "***";
  }
}

/**
 * Detect the type of sensitive data
 */
function detectType(value: string): keyof MaskingConfig {
  // Email pattern
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "email";
  }

  // Phone pattern (international)
  if (/^\+?[\d\s\-()]{7,}$/.test(value)) {
    return "phone";
  }

  // Card number pattern
  if (/^\d{13,19}$/.test(value.replace(/\s/g, ""))) {
    return "cardNumber";
  }

  // API key patterns
  if (/^(sk_|pk_|api_|token_|secret_)/i.test(value)) {
    return "apiKey";
  }

  // URL pattern
  if (/^https?:\/\//i.test(value)) {
    return "url";
  }

  // Amount pattern
  if (/^\d+(\.\d{1,2})?$/.test(value)) {
    return "amount";
  }

  // Default to name
  return "name";
}

// ============================================================================
// Response Filtering
// ============================================================================

/**
 * Filter sensitive fields from an object based on user role
 */
export function filterResponse<T extends Record<string, unknown>>(
  data: T,
  userRole: string,
  fieldRules: FieldFilterRules
): Partial<T> {
  const result: Partial<T> = {};

  for (const [key, value] of Object.entries(data)) {
    const rule = fieldRules[key];

    if (!rule) {
      result[key as keyof T] = value as T[keyof T];
      continue;
    }

    // Check if field should be included
    if (rule.excludeFor && rule.excludeFor.includes(userRole)) {
      continue;
    }

    // Check if field should be masked
    if (rule.maskFor && rule.maskFor.includes(userRole)) {
      result[key as keyof T] = mask(String(value), rule.type) as T[keyof T];
      continue;
    }

    // Check if field requires specific role
    if (rule.requireRole && !rule.requireRole.includes(userRole)) {
      continue;
    }

    result[key as keyof T] = value as T[keyof T];
  }

  return result;
}

export interface FieldFilterRules {
  [field: string]: {
    excludeFor?: string[];
    maskFor?: string[];
    requireRole?: string[];
    type?: keyof MaskingConfig;
  };
}

// ============================================================================
// Pre-defined Filter Rules for Reqflow Entities
// ============================================================================

export const reqflowFieldFilters: Record<string, FieldFilterRules> = {
  users: {
    email: { maskFor: ["requester"], type: "email" },
    phone: { maskFor: ["requester", "manager"], type: "phone" },
    passwordHash: { excludeFor: ["requester", "manager", "finance", "admin"] },
    mfaSecret: { excludeFor: ["*"] },
    lastLoginAt: { requireRole: ["manager", "finance", "admin"] },
  },

  requests: {
    description: { maskFor: ["requester"], type: "name" },
    amount: { maskFor: ["requester"], type: "amount" },
    vendorName: {},
    attachments: { requireRole: ["manager", "finance", "admin"] },
  },

  invoices: {
    invoiceNumber: {},
    amount: { type: "amount" },
    vendorDetails: { maskFor: ["requester", "manager"] },
    paymentStatus: {},
  },

  integrations: {
    accessToken: { excludeFor: ["*"] },
    refreshToken: { excludeFor: ["*"] },
    providerAccountId: { maskFor: ["manager", "finance"], type: "apiKey" },
    config: { requireRole: ["admin"] },
  },

  slackWorkspaces: {
    botToken: { excludeFor: ["*"] },
    slackTeamId: {},
    slackTeamName: {},
  },

  auditLogs: {
    ipAddress: { maskFor: ["manager", "finance"], type: "apiKey" },
    userAgent: { maskFor: ["manager", "finance"] },
    metadata: { requireRole: ["admin"] },
  },
};

// ============================================================================
// Utility for Logs
// ============================================================================

/**
 * Sanitize an object for safe logging
 * Removes or masks all known sensitive fields
 */
export function sanitizeForLogging(obj: unknown, depth = 0): unknown {
  if (depth > 10) return "[MAX_DEPTH]";

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForLogging(item, depth + 1));
  }

  const sensitiveFields = [
    "password",
    "passwordHash",
    "token",
    "accessToken",
    "refreshToken",
    "secret",
    "apiKey",
    "privateKey",
    "creditCard",
    "cardNumber",
    "cvv",
    "ssn",
    "botToken",
    "mfaSecret",
  ];

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();

    // Check if this is a sensitive field
    const isSensitive = sensitiveFields.some(field =>
      lowerKey.includes(field.toLowerCase())
    );

    if (isSensitive) {
      result[key] = "***REDACTED***";
    } else if (typeof value === "object" && value !== null) {
      result[key] = sanitizeForLogging(value, depth + 1);
    } else {
      result[key] = value;
    }
  }

  return result;
}
