# 🛡️ REQFLOW 10x SECURITY PLAN
## Enterprise-Grade Security Architecture for Code, Data, and Information

**Version:** 1.0
**Date:** February 27, 2026
**Classification:** CONFIDENTIAL - Internal Security Document
**Owner:** Security Engineering Team

---

## 📋 EXECUTIVE SUMMARY

This document outlines a comprehensive, defense-in-depth security strategy for Reqflow, covering three critical domains:

| Domain | Focus Area | Current Maturity | Target Maturity |
|--------|------------|------------------|-----------------|
| **CODE** | Application security, CI/CD, supply chain | Level 2 | Level 4 |
| **DATA** | Encryption, access control, retention | Level 3 | Level 4 |
| **DISPLAY** | Frontend security, data exposure, UI | Level 2 | Level 4 |

**Maturity Levels:**
- Level 1: Ad-hoc, reactive
- Level 2: Defined processes, some automation
- Level 3: Proactive, well-documented
- Level 4: Continuous verification, zero-trust
- Level 5: Industry-leading, security-first culture

---

## 🏗️ SECURITY ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ZERO TRUST PERIMETER                               │
│  "Never trust, always verify" - Every request authenticated and authorized   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │   EDGE       │    │  APPLICATION │    │    DATA      │                   │
│  │  SECURITY    │───▶│   LAYER      │───▶│   LAYER      │                   │
│  └──────────────┘    └──────────────┘    └──────────────┘                   │
│         │                   │                   │                            │
│         ▼                   ▼                   ▼                            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │ Cloudflare   │    │   Next.js    │    │  PostgreSQL  │                   │
│  │ WAF + DDoS   │    │   + tRPC     │    │  + R2 + Redis│                   │
│  └──────────────┘    └──────────────┘    └──────────────┘                   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                         SECURITY MONITORING LAYER                            │
│   Sentry | Axiom | Custom Alerts | Audit Logs | SIEM Integration            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# PART 1: CODE SECURITY 🔐

## 1.1 Secure Development Lifecycle (SDL)

### 1.1.1 Pre-Commit Hooks

**Status:** 🔴 Not Implemented
**Priority:** P0 - Critical
**Effort:** 2 days

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
        args: ['--maxkb=500']
      - id: detect-private-key
      - id: detect-aws-credentials
        args: ['--allow-missing-credentials']

  - repo: https://github.com/secretlint/secretlint
    rev: v8.1.0
    hooks:
      - id: secretlint

  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.1
    hooks:
      - id: gitleaks

  - repo: local
    hooks:
      - id: typecheck
        name: TypeScript Type Check
        entry: npm run type-check
        language: system
        pass_filenames: false
        types: [typescript]
```

### 1.1.2 Secret Detection & Management

**Status:** 🟡 Partial (env validation exists)
**Priority:** P0 - Critical
**Effort:** 3 days

**Implementation:**

```typescript
// lib/security/secrets-manager.ts
import { env } from "@/lib/env";

/**
 * Centralized secrets management with rotation support
 */
export class SecretsManager {
  private static instance: SecretsManager;
  private cache: Map<string, { value: string; expiresAt: number }> = new Map();

  static getInstance(): SecretsManager {
    if (!this.instance) {
      this.instance = new SecretsManager();
    }
    return this.instance;
  }

  /**
   * Get secret with automatic rotation check
   */
  async getSecret(key: string): Promise<string> {
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    // Fetch from secure storage (Vault, AWS Secrets Manager, etc.)
    const secret = await this.fetchSecret(key);
    
    this.cache.set(key, {
      value: secret,
      expiresAt: Date.now() + 3600000, // 1 hour cache
    });

    return secret;
  }

  private async fetchSecret(key: string): Promise<string> {
    // Production: Use HashiCorp Vault or AWS Secrets Manager
    // Development: Use environment variables
    if (env.NODE_ENV === "development") {
      return process.env[key] || "";
    }

    // TODO: Implement Vault integration
    throw new Error("Secrets manager not configured for production");
  }
}
```

**Environment Variable Encryption at Rest:**

```bash
# Use SOPS for encrypting .env files in git
# .sops.yaml
creation_rules:
  - path_regex: \.env\.enc$
    kms: arn:aws:kms:us-east-1:123456789012:key/abcd1234
```

### 1.1.3 Dependency Security

**Status:** 🟡 Partial (npm audit exists)
**Priority:** P1 - High
**Effort:** 2 days

```yaml
# .github/dependabot.yml (when migrated to GitHub)
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/app"
    schedule:
      interval: "daily"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    labels:
      - "security"
      - "dependencies"
    commit-message:
      prefix: "security"
      include: "scope"

  - package-ecosystem: "pip"
    directory: "/SWARM"
    schedule:
      interval: "weekly"
```

**Automated Vulnerability Scanning:**

```yaml
# .github/workflows/security-scan.yml
name: Security Scan
on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6am UTC

jobs:
  npm-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd app && npm audit --audit-level=moderate
      - run: cd app && npm audit fix --dry-run

  snyk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  codeql:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript, typescript
      - uses: github/codeql-action/analyze@v3

  semgrep:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/secrets
            p/typescript
```

---

## 1.2 Code Quality & Security Gates

### 1.2.1 Static Analysis (SAST)

**Status:** 🔴 Not Implemented
**Priority:** P1 - High
**Effort:** 2 days

```javascript
// eslint.security.config.js
module.exports = {
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:security/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  plugins: ["security", "@typescript-eslint"],
  rules: {
    // Security-specific rules
    "security/detect-object-injection": "error",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-literal": "error",
    "security/detect-child-process": "error",
    "security/detect-disable-mustache-escape": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-new-buffer": "error",
    "security/detect-no-csrf-before-method-override": "error",
    "security/detect-non-literal-fs-filename": "warn",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-possible-timing-attacks": "error",
    "security/detect-pseudoRandomBytes": "error",

    // TypeScript security rules
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/restrict-template-expressions": "error",
  },
};
```

### 1.2.2 Dynamic Analysis (DAST)

**Status:** 🔴 Not Implemented
**Priority:** P2 - Medium
**Effort:** 1 week

```yaml
# OWASP ZAP Integration
# docker-compose.security.yml
services:
  zap:
    image: zaproxy/zap-stable
    command: >
      zap-baseline.py
      -t https://staging.reqflow.com
      -r zap-report.html
      -w zap-report.md
      -a
      -j
      -l INFO
    volumes:
      - ./reports:/zap/wrk
```

### 1.2.3 Container Security

**Status:** 🔴 Not Implemented
**Priority:** P1 - High
**Effort:** 3 days

```dockerfile
# Dockerfile.secure
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies with integrity checks
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production (minimal attack surface)
FROM gcr.io/distroless/nodejs20-debian12:latest

# Run as non-root
USER nonroot:nonroot

# Copy only built artifacts
COPY --from=builder --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/.next/static ./.next/static
COPY --from=builder --chown=nonroot:nonroot /app/public ./public

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD [ "node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })" ]

EXPOSE 3000
CMD ["server.js"]
```

**Container Scanning:**

```yaml
# Trivy container scanning
name: Container Security Scan
on:
  push:
    paths:
      - 'Dockerfile*'
      - 'docker-compose*.yml'

jobs:
  trivy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build image
        run: docker build -t reqflow:${{ github.sha }} .
      - name: Run Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'reqflow:${{ github.sha }}'
          format: 'table'
          exit-code: '1'
          severity: 'CRITICAL,HIGH'
```

---

## 1.3 API Security

### 1.3.1 Input Validation Hardening

**Status:** 🟢 Implemented (Zod + sanitization)
**Priority:** Maintenance
**Effort:** Ongoing

**Additional Hardening:**

```typescript
// lib/security/validators.ts
import { z } from "zod";

/**
 * Enterprise-grade input validation patterns
 */
export const SecureValidators = {
  // UUID with strict format
  uuid: z.string().uuid().min(1).max(36),

  // Email with additional sanitization
  email: z.string()
    .email()
    .transform(val => val.toLowerCase().trim())
    .refine(val => !val.includes('+'), "Plus addressing not allowed"),

  // Currency with bounds
  currency: z.number()
    .positive()
    .max(999999999.99)
    .transform(val => Math.round(val * 100) / 100),

  // Safe string with XSS protection
  safeString: (maxLength: number = 500) =>
    z.string()
      .max(maxLength)
      .transform(val => val.replace(/<[^>]*>/g, '').trim()),

  // File key validation (prevent path traversal)
  fileKey: z.string()
    .regex(/^[a-zA-Z0-9\/\-_\.]+$/)
    .refine(val => !val.includes('..'), "Path traversal detected"),

  // Prevent NoSQL injection
  mongoSafe: z.string().refine(
    val => !val.includes('$') && !val.includes('.'),
    "Invalid characters detected"
  ),
};

/**
 * Request schema with security context
 */
export const secureRequestSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    data: schema,
    _security: z.object({
      timestamp: z.number().max(Date.now() + 5000), // Prevent replay
      nonce: z.string().min(16), // Unique request ID
    }).optional(),
  });
```

### 1.3.2 API Rate Limiting Enhancement

**Status:** 🟢 Implemented (Upstash)
**Priority:** P2 - Enhancement
**Effort:** 2 days

```typescript
// lib/security/advanced-rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Tiered rate limiting with user reputation
 */
export class AdvancedRateLimiter {
  private redis: Redis;
  private limiters: Map<string, Ratelimit>;

  constructor() {
    this.redis = Redis.fromEnv();
    this.limiters = new Map();

    // Standard limits
    this.limiters.set('api', new Ratelimit({
      redis: this.redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "ratelimit:api",
    }));

    // Strict limits for sensitive operations
    this.limiters.set('sensitive', new Ratelimit({
      redis: this.redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "ratelimit:sensitive",
    }));

    // Burst allowance for legitimate users
    this.limiters.set('burst', new Ratelimit({
      redis: this.redis,
      limiter: Ratelimit.tokenBucket(20, "10 s", 200),
      analytics: true,
      prefix: "ratelimit:burst",
    }));
  }

  /**
   * Dynamic rate limit based on user reputation
   */
  async checkLimit(
    identifier: string,
    type: 'api' | 'sensitive' | 'burst',
    userReputation: 'trusted' | 'standard' | 'suspicious'
  ): Promise<{ success: boolean; remaining: number }> {
    const limiter = this.limiters.get(type);
    if (!limiter) return { success: true, remaining: 999 };

    // Apply reputation multipliers
    const reputationMultiplier = {
      trusted: 2.0,     // 2x limits
      standard: 1.0,    // Normal limits
      suspicious: 0.5,  // Half limits
    };

    const result = await limiter.limit(identifier);

    // Adjust based on reputation
    const adjustedRemaining = Math.floor(
      result.remaining * reputationMultiplier[userReputation]
    );

    return {
      success: result.success,
      remaining: adjustedRemaining,
    };
  }

  /**
   * Track and identify suspicious patterns
   */
  async detectAnomalies(identifier: string): Promise<{
    isAnomalous: boolean;
    riskScore: number;
    reasons: string[];
  }> {
    const reasons: string[] = [];
    let riskScore = 0;

    // Check for rapid IP changes
    const ipHistory = await this.redis.lrange(`ip-history:${identifier}`, 0, 10);
    const uniqueIPs = new Set(ipHistory);
    if (uniqueIPs.size > 5) {
      reasons.push('Multiple IP addresses');
      riskScore += 20;
    }

    // Check for unusual request patterns
    const hourCount = await this.redis.get(`hourly:${identifier}`);
    if (Number(hourCount) > 500) {
      reasons.push('High request volume');
      riskScore += 30;
    }

    // Check for known bad patterns
    const blockedPatterns = await this.redis.sismember(
      'blocked:patterns',
      identifier.split(':')[0]
    );
    if (blockedPatterns) {
      reasons.push('Matches blocked pattern');
      riskScore += 50;
    }

    return {
      isAnomalous: riskScore > 50,
      riskScore,
      reasons,
    };
  }
}
```

---

# PART 2: DATA SECURITY 🗄️

## 2.1 Encryption Strategy

### 2.1.1 Data at Rest

**Status:** 🟢 Implemented (Neon AES-256, R2 encryption)
**Priority:** P2 - Enhancement
**Effort:** 3 days

**Application-Level Encryption for Sensitive Fields:**

```typescript
// lib/security/field-encryption.ts
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Field-level encryption for sensitive data
 * Used for: OAuth tokens, API keys, PII
 */
export class FieldEncryption {
  private key: Buffer;

  constructor(secret: string) {
    // Derive key from secret using scrypt
    this.key = scryptSync(secret, "reqflow-salt", 32);
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encrypted
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  }

  decrypt(ciphertext: string): string {
    const [ivHex, authTagHex, encrypted] = ciphertext.split(":");

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
}

// Usage in schema
export const encryptedField = {
  // In Drizzle schema
  slackBotToken: text("slack_bot_token").notNull(),
  
  // Before save
  async beforeInsert(token: string) {
    const encryption = new FieldEncryption(env.AUTH_SECRET);
    return encryption.encrypt(token);
  },
  
  // After read
  async afterRead(encrypted: string) {
    const encryption = new FieldEncryption(env.AUTH_SECRET);
    return encryption.decrypt(encrypted);
  },
};
```

### 2.1.2 Data in Transit

**Status:** 🟢 Implemented (TLS 1.3)
**Priority:** Maintenance
**Effort:** Ongoing

**mTLS for Internal Services:**

```yaml
# docker-compose.mtls.yml
services:
  postgres:
    image: postgres:16-alpine
    command: >
      -c ssl=on
      -c ssl_cert_file=/certs/server.crt
      -c ssl_key_file=/certs/server.key
      -c ssl_ca_file=/certs/ca.crt
    volumes:
      - ./certs:/certs:ro

  redis:
    image: redis:7-alpine
    command: >
      redis-server
      --tls-port 6379
      --port 0
      --tls-cert-file /certs/server.crt
      --tls-key-file /certs/server.key
      --tls-ca-cert-file /certs/ca.crt
      --tls-auth-clients optional
    volumes:
      - ./certs:/certs:ro
```

### 2.1.3 Key Management

**Status:** 🔴 Not Implemented
**Priority:** P0 - Critical
**Effort:** 1 week

```typescript
// lib/security/kms.ts
/**
 * Key Management Service Integration
 * Supports: AWS KMS, HashiCorp Vault, Google Cloud KMS
 */
export interface KeyManagementService {
  encrypt(plaintext: Buffer, keyId: string): Promise<Buffer>;
  decrypt(ciphertext: Buffer, keyId: string): Promise<Buffer>;
  rotateKey(keyId: string): Promise<string>;
  getKeyMetadata(keyId: string): Promise<KeyMetadata>;
}

export interface KeyMetadata {
  id: string;
  algorithm: string;
  createdAt: Date;
  expiresAt?: Date;
  rotationEnabled: boolean;
  lastRotatedAt?: Date;
}

/**
 * AWS KMS Implementation
 */
export class AWSKMS implements KeyManagementService {
  private client: KMSClient;

  constructor() {
    this.client = new KMSClient({ region: "eu-west-1" });
  }

  async encrypt(plaintext: Buffer, keyId: string): Promise<Buffer> {
    const command = new EncryptCommand({
      KeyId: keyId,
      Plaintext: plaintext,
      EncryptionAlgorithm: "AES_256_GCM",
    });

    const result = await this.client.send(command);
    return Buffer.from(result.CiphertextBlob!);
  }

  async decrypt(ciphertext: Buffer, keyId: string): Promise<Buffer> {
    const command = new DecryptCommand({
      KeyId: keyId,
      CiphertextBlob: ciphertext,
    });

    const result = await this.client.send(command);
    return Buffer.from(result.Plaintext!);
  }

  async rotateKey(keyId: string): Promise<string> {
    // KMS automatic key rotation
    const command = new EnableKeyRotationCommand({ KeyId: keyId });
    await this.client.send(command);
    return keyId;
  }
}

/**
 * Automatic Key Rotation Schedule
 */
export const keyRotationSchedule = {
  // Data encryption keys: 90 days
  dataEncryption: 90 * 24 * 60 * 60 * 1000,
  // API keys: 180 days
  apiKeys: 180 * 24 * 60 * 60 * 1000,
  // Session keys: 7 days
  sessionKeys: 7 * 24 * 60 * 60 * 1000,
};
```

---

## 2.2 Access Control

### 2.2.1 Row-Level Security (RLS)

**Status:** 🔴 Not Implemented at DB level
**Priority:** P0 - Critical
**Effort:** 3 days

```sql
-- Enable RLS on all tables
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policy
CREATE POLICY tenant_isolation_policy ON requests
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY tenant_isolation_policy ON budgets
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY tenant_isolation_policy ON vendors
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- Create role-based policies
CREATE POLICY admin_full_access ON requests
  FOR ALL
  TO admin_role
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY finance_read_own ON requests
  FOR SELECT
  TO finance_role
  USING (
    tenant_id = current_setting('app.current_tenant')::uuid
    AND (department_id = current_setting('app.current_department')::uuid 
         OR amount <= 10000)
  );

-- Audit policy for RLS
CREATE POLICY audit_all_access ON audit_logs
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant')::uuid)
  WITH CHECK (false); -- Prevent direct modification
```

### 2.2.2 Attribute-Based Access Control (ABAC)

**Status:** 🔴 Not Implemented
**Priority:** P1 - High
**Effort:** 1 week

```typescript
// lib/security/abac.ts
import { getContext } from "@/lib/auth/session";

/**
 * Attribute-Based Access Control
 * More flexible than RBAC, considers context
 */
export interface AccessRequest {
  subject: {
    id: string;
    role: string;
    departmentId: string;
    permissions: string[];
  };
  resource: {
    type: string;
    id: string;
    tenantId: string;
    ownerId?: string;
    sensitivity?: 'public' | 'internal' | 'confidential' | 'restricted';
    amount?: number;
  };
  action: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export';
  environment: {
    time: Date;
    ip: string;
    device: string;
    location?: string;
  };
}

export class ABACEngine {
  private policies: AccessPolicy[] = [];

  async evaluate(request: AccessRequest): Promise<AccessDecision> {
    const applicablePolicies = this.policies.filter(p =>
      p.matches(request)
    );

    if (applicablePolicies.length === 0) {
      return { allowed: false, reason: "No applicable policy found" };
    }

    // Deny overrides
    const denyPolicy = applicablePolicies.find(p => p.effect === "deny");
    if (denyPolicy) {
      return { allowed: false, reason: denyPolicy.reason };
    }

    // All applicable policies must allow
    const allAllow = applicablePolicies.every(p => p.effect === "allow");
    if (allAllow) {
      return { allowed: true };
    }

    return { allowed: false, reason: "Policy evaluation inconclusive" };
  }
}

/**
 * Example Policies
 */
const policies: AccessPolicy[] = [
  {
    name: "Finance can approve under threshold",
    effect: "allow",
    condition: (req) =>
      req.subject.role === "finance" &&
      req.action === "approve" &&
      (req.resource.amount || 0) <= 10000,
  },
  {
    name: "Cannot approve own requests",
    effect: "deny",
    condition: (req) =>
      req.action === "approve" &&
      req.resource.ownerId === req.subject.id,
  },
  {
    name: "No access outside business hours for sensitive data",
    effect: "deny",
    condition: (req) => {
      if (req.resource.sensitivity !== "restricted") return false;
      const hour = req.environment.time.getHours();
      return hour < 9 || hour > 18;
    },
  },
  {
    name: "Geofencing for restricted operations",
    effect: "deny",
    condition: (req) => {
      const restrictedActions = ["delete", "export"];
      const allowedCountries = ["FR", "DE", "NL", "UK"];
      return (
        restrictedActions.includes(req.action) &&
        !allowedCountries.includes(req.environment.location || "")
      );
    },
  },
];
```

### 2.2.3 Session Security Enhancement

**Status:** 🟢 Implemented (JWT + cookies)
**Priority:** P2 - Enhancement
**Effort:** 2 days

```typescript
// lib/security/session-security.ts
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

/**
 * Session Security Configuration
 */
export const sessionConfig = {
  // Absolute session lifetime
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  
  // Idle timeout
  idleTimeout: 30 * 60 * 1000, // 30 minutes
  
  // Concurrent session limit per user
  maxConcurrentSessions: 3,
  
  // Require re-auth for sensitive operations
  sensitiveOperationTimeout: 5 * 60 * 1000, // 5 minutes
};

/**
 * Session Management Class
 */
export class SessionManager {
  /**
   * Validate session with multiple checks
   */
  async validateSession(sessionId: string, request: Request): Promise<{
    valid: boolean;
    reason?: string;
    session?: Session;
  }> {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
    });

    if (!session) {
      return { valid: false, reason: "Session not found" };
    }

    // Check expiration
    if (new Date() > session.expiresAt) {
      return { valid: false, reason: "Session expired" };
    }

    // Check idle timeout
    const lastActivity = session.lastActivityAt;
    if (Date.now() - lastActivity.getTime() > sessionConfig.idleTimeout) {
      await this.terminateSession(sessionId);
      return { valid: false, reason: "Session idle timeout" };
    }

    // Check IP consistency (optional, configurable)
    const currentIp = getClientIp(request);
    if (session.ipAddress && session.ipAddress !== currentIp) {
      // Log suspicious activity but don't terminate
      await this.logSuspiciousActivity(session, "ip_change", {
        originalIp: session.ipAddress,
        newIp: currentIp,
      });
    }

    // Update last activity
    await db.update(sessions)
      .set({ lastActivityAt: new Date() })
      .where(eq(sessions.id, sessionId));

    return { valid: true, session };
  }

  /**
   * Enforce concurrent session limit
   */
  async enforceSessionLimit(userId: string): Promise<void> {
    const activeSessions = await db.query.sessions.findMany({
      where: and(
        eq(sessions.userId, userId),
        gt(sessions.expiresAt, new Date())
      ),
      orderBy: (sessions, { desc }) => [desc(sessions.lastActivityAt)],
    });

    if (activeSessions.length >= sessionConfig.maxConcurrentSessions) {
      // Terminate oldest sessions
      const toTerminate = activeSessions.slice(sessionConfig.maxConcurrentSessions - 1);
      for (const session of toTerminate) {
        await this.terminateSession(session.id);
        await this.notifySessionTermination(session, "concurrent_limit");
      }
    }
  }

  /**
   * Check if re-authentication required for sensitive operation
   */
  async requireReauth(sessionId: string): Promise<boolean> {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
    });

    if (!session) return true;

    const timeSinceAuth = Date.now() - session.authenticatedAt.getTime();
    return timeSinceAuth > sessionConfig.sensitiveOperationTimeout;
  }
}
```

---

## 2.3 Data Lifecycle Management

### 2.3.1 Data Classification

**Status:** 🔴 Not Implemented
**Priority:** P1 - High
**Effort:** 3 days

```typescript
// lib/security/data-classification.ts

/**
 * Data Classification Framework
 */
export enum DataClassification {
  PUBLIC = "public",           // No restrictions
  INTERNAL = "internal",       // Company internal use
  CONFIDENTIAL = "confidential", // Sensitive business data
  RESTRICTED = "restricted",   // PII, financial, compliance data
}

/**
 * Field-level classification schema
 */
export const dataClassificationSchema = {
  users: {
    email: DataClassification.RESTRICTED,
    name: DataClassification.CONFIDENTIAL,
    role: DataClassification.INTERNAL,
    createdAt: DataClassification.PUBLIC,
  },
  requests: {
    title: DataClassification.CONFIDENTIAL,
    description: DataClassification.CONFIDENTIAL,
    amount: DataClassification.RESTRICTED,
    vendorName: DataClassification.CONFIDENTIAL,
    attachments: DataClassification.RESTRICTED,
  },
  invoices: {
    invoiceNumber: DataClassification.CONFIDENTIAL,
    amount: DataClassification.RESTRICTED,
    vendorDetails: DataClassification.RESTRICTED,
  },
};

/**
 * Apply classification-based protections
 */
export function applyClassificationProtection(
  data: any,
  classification: DataClassification,
  context: { userRole: string; purpose: string }
): any {
  switch (classification) {
    case DataClassification.RESTRICTED:
      // Require explicit access logging
      logRestrictedAccess(data, context);
      // Mask sensitive fields for non-admins
      if (context.userRole !== "admin") {
        return maskSensitiveFields(data);
      }
      return data;

    case DataClassification.CONFIDENTIAL:
      // Standard access control
      return data;

    case DataClassification.INTERNAL:
      // Available to authenticated users
      return data;

    case DataClassification.PUBLIC:
      // No restrictions
      return data;
  }
}
```

### 2.3.2 Data Retention & Deletion

**Status:** 🔴 Not Implemented
**Priority:** P1 - High
**Effort:** 1 week

```typescript
// lib/security/data-retention.ts

/**
 * Data Retention Policy
 */
export const retentionPolicies = {
  // Audit logs: 7 years (compliance)
  auditLogs: { retentionDays: 2555, archiveAfterDays: 365 },
  
  // Auth events: 2 years
  authEvents: { retentionDays: 730, archiveAfterDays: 180 },
  
  // User data: Until deletion + 30 days
  userData: { retentionDays: 30, afterDeletion: true },
  
  // Invoices: 7 years (tax compliance)
  invoices: { retentionDays: 2555, archiveAfterDays: 365 },
  
  // File attachments: Same as parent entity
  attachments: { inheritFromParent: true },
  
  // Sessions: 7 days
  sessions: { retentionDays: 7 },
};

/**
 * Automated Data Retention Worker
 */
export class DataRetentionWorker {
  /**
   * Process retention policies daily
   */
  async processRetentionPolicy(): Promise<void> {
    // Archive old audit logs
    await this.archiveAuditLogs();
    
    // Delete expired sessions
    await this.deleteExpiredSessions();
    
    // Process GDPR deletion requests
    await this.processDeletionRequests();
    
    // Anonymize old user data
    await this.anonymizeOldUserData();
  }

  /**
   * GDPR Right to Erasure
   */
  async processDeletionRequest(userId: string): Promise<{
    status: "completed" | "pending" | "rejected";
    details: string[];
  }> {
    const details: string[] = [];

    // Check for legal holds
    const hasLegalHold = await this.checkLegalHold(userId);
    if (hasLegalHold) {
      return {
        status: "rejected",
        details: ["Account under legal hold - deletion deferred"],
      };
    }

    // Anonymize instead of delete for audit trail
    await db.update(users)
      .set({
        email: `deleted-${userId}@reqflow.anonymized`,
        name: "Deleted User",
        passwordHash: null,
        deletedAt: new Date(),
      })
      .where(eq(users.id, userId));
    details.push("User profile anonymized");

    // Delete personal data from related tables
    await this.deletePersonalData(userId, details);

    // Schedule attachment deletion
    await this.scheduleAttachmentDeletion(userId);
    details.push("File deletion scheduled");

    return { status: "completed", details };
  }

  /**
   * Data Export for GDPR Portability
   */
  async exportUserData(userId: string): Promise<{
    format: "json";
    data: any;
    exportedAt: Date;
  }> {
    const userData = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        requests: true,
        approvals: true,
        // Include all related data
      },
    });

    return {
      format: "json",
      data: userData,
      exportedAt: new Date(),
    };
  }
}
```

---

# PART 3: INFORMATION DISPLAY SECURITY 🖥️

## 3.1 Frontend Security

### 3.1.1 Content Security Policy (CSP)

**Status:** 🟡 Partial (headers configured)
**Priority:** P1 - High
**Effort:** 2 days

```typescript
// middleware.ts - Enhanced CSP

export const securityHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'strict-dynamic'", // Remove unsafe-inline/eval
    "style-src 'self' 'unsafe-inline'", // Tailwind requires this
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.sentry.io https://*.axiom.co wss://*.upstash.io",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; "),

  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "0", // Deprecated but added for legacy browsers
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "payment=()",
    "usb=()",
    "magnetometer=()",
    "gyroscope=()",
    "accelerometer=()",
  ].join(", "),
};

// Nonce-based CSP for scripts
export function generateNonce(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');
}
```

### 3.1.2 XSS Prevention

**Status:** 🟢 Implemented (React auto-escaping, sanitization)
**Priority:** Maintenance
**Effort:** Ongoing

```typescript
// lib/security/xss-protection.ts

/**
 * Comprehensive XSS Prevention
 */
export class XSSProtection {
  private static readonly DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /on\w+\s*=/gi,
    /javascript:/gi,
    /data:/gi,
    /vbscript:/gi,
  ];

  /**
   * Sanitize user input for display
   */
  static sanitize(input: string): string {
    let sanitized = input;

    for (const pattern of this.DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, "");
    }

    return sanitized.trim();
  }

  /**
   * Escape HTML entities
   */
  static escapeHtml(input: string): string {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "/": "&#x2F;",
    };

    return input.replace(/[&<>"'/]/g, (char) => entities[char]);
  }

  /**
   * Sanitize for URL context
   */
  static sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      const allowedProtocols = ["http:", "https:", "mailto:"];
      
      if (!allowedProtocols.includes(parsed.protocol)) {
        return "";
      }
      
      return parsed.href;
    } catch {
      return "";
    }
  }
}

/**
 * React component for safe HTML rendering
 */
export function SafeHtml({ html, allowedTags = [] }: {
  html: string;
  allowedTags?: string[];
}) {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ["href", "title", "class"],
  });

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

### 3.1.3 Sensitive Data Masking

**Status:** 🔴 Not Implemented
**Priority:** P1 - High
**Effort:** 2 days

```typescript
// lib/security/data-masking.ts

/**
 * Data Masking for Display
 */
export class DataMasking {
  /**
   * Mask email for display
   * john.doe@example.com -> j***@example.com
   */
  static maskEmail(email: string): string {
    const [local, domain] = email.split("@");
    const maskedLocal = local[0] + "***";
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Mask credit card
   * 4111111111111111 -> **** **** **** 1111
   */
  static maskCreditCard(cardNumber: string): string {
    const last4 = cardNumber.slice(-4);
    return `**** **** **** ${last4}`;
  }

  /**
   * Mask phone number
   * +33612345678 -> +33 6 ** ** ** 78
   */
  static maskPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    const last2 = cleaned.slice(-2);
    return `${cleaned.slice(0, 4)} *** *** ${last2}`;
  }

  /**
   * Mask API key
   * sk_live_abc123xyz -> sk_live_***xyz
   */
  static maskApiKey(key: string): string {
    if (key.length <= 10) return "***";
    const prefix = key.slice(0, 7);
    const suffix = key.slice(-3);
    return `${prefix}...${suffix}`;
  }

  /**
   * Mask bank account
   * FR7630006000011234567890189 -> FR76 **** **** **** **** **89
   */
  static maskBankAccount(account: string): string {
    const last2 = account.slice(-2);
    const prefix = account.slice(0, 4);
    return `${prefix} **** **** **** **** **${last2}`;
  }
}

/**
 * Conditional masking based on user role
 */
export function maskForRole(data: any, field: string, userRole: string): any {
  const maskingRules: Record<string, string[]> = {
    email: ["admin"],        // Only admin sees full email
    phone: ["admin", "finance"],
    apiKey: ["admin"],
    bankAccount: ["admin", "finance"],
  };

  const allowedRoles = maskingRules[field] || [];
  
  if (allowedRoles.includes(userRole)) {
    return data[field];
  }

  // Apply appropriate mask
  switch (field) {
    case "email":
      return DataMasking.maskEmail(data[field]);
    case "phone":
      return DataMasking.maskPhone(data[field]);
    case "apiKey":
      return DataMasking.maskApiKey(data[field]);
    case "bankAccount":
      return DataMasking.maskBankAccount(data[field]);
    default:
      return "***";
  }
}
```

---

## 3.2 API Response Security

### 3.2.1 Response Filtering

**Status:** 🔴 Not Implemented
**Priority:** P1 - High
**Effort:** 2 days

```typescript
// lib/security/response-filter.ts

/**
 * Response Field Filter
 * Prevents over-exposure of data in API responses
 */
export class ResponseFilter {
  /**
   * Field visibility by role
   */
  private static readonly fieldVisibility: Record<string, Record<string, string[]>> = {
    users: {
      public: ["id", "name", "role"],
      internal: ["id", "name", "email", "role", "departmentId", "createdAt"],
      admin: ["*"], // All fields
    },
    vendors: {
      public: ["id", "name"],
      internal: ["id", "name", "category", "status"],
      finance: ["id", "name", "category", "status", "taxId", "bankAccount"],
      admin: ["*"],
    },
    invoices: {
      internal: ["id", "invoiceNumber", "amount", "status", "vendorId"],
      finance: ["id", "invoiceNumber", "amount", "status", "vendorId", "taxDetails"],
      admin: ["*"],
    },
  };

  /**
   * Filter response based on user role
   */
  static filter<T extends Record<string, any>>(
    entity: string,
    data: T,
    role: string
  ): Partial<T> {
    const visibility = this.fieldVisibility[entity];
    if (!visibility) return data;

    // Determine visibility level
    let allowedFields: string[];
    if (role === "admin" && visibility.admin?.includes("*")) {
      return data;
    } else if (role === "finance" && visibility.finance) {
      allowedFields = visibility.finance;
    } else if (visibility.internal) {
      allowedFields = visibility.internal;
    } else {
      allowedFields = visibility.public || [];
    }

    // Filter fields
    const filtered: Partial<T> = {};
    for (const field of allowedFields) {
      if (field in data) {
        filtered[field as keyof T] = data[field as keyof T];
      }
    }

    return filtered;
  }

  /**
   * Filter array of entities
   */
  static filterArray<T extends Record<string, any>>(
    entity: string,
    data: T[],
    role: string
  ): Partial<T>[] {
    return data.map(item => this.filter(entity, item, role));
  }
}

/**
 * tRPC middleware for automatic response filtering
 */
export const responseFilterMiddleware = t.middleware(async ({ ctx, next, path }) => {
  const result = await next({ ctx });

  // Get entity name from path (e.g., "users.list" -> "users")
  const entity = path.split(".")[0];
  
  // Filter response based on role
  if (result && typeof result === "object") {
    if (Array.isArray(result)) {
      return ResponseFilter.filterArray(entity, result, ctx.user?.role || "public");
    } else {
      return ResponseFilter.filter(entity, result, ctx.user?.role || "public");
    }
  }

  return result;
});
```

### 3.2.2 Error Message Sanitization

**Status:** 🟡 Partial (implemented in some places)
**Priority:** P2 - Medium
**Effort:** 1 day

```typescript
// lib/security/error-sanitization.ts

/**
 * Error Sanitization for Production
 */
export class ErrorSanitization {
  private static readonly SENSITIVE_PATTERNS = [
    /password/i,
    /token/i,
    /secret/i,
    /key/i,
    /auth/i,
    /session/i,
    /api[_-]?key/i,
  ];

  private static readonly INTERNAL_PATTERNS = [
    /\/app\/src\//,
    /\/node_modules\//,
    /at \w+ \(/,
    /Error: /,
    /stack:/i,
  ];

  /**
   * Sanitize error for client response
   */
  static sanitize(error: Error, isProduction: boolean): {
    message: string;
    code?: string;
    details?: any;
  } {
    // In development, return full error
    if (!isProduction) {
      return {
        message: error.message,
        details: {
          stack: error.stack,
          name: error.name,
        },
      };
    }

    // In production, sanitize aggressively
    let message = error.message;

    // Remove sensitive patterns
    for (const pattern of this.SENSITIVE_PATTERNS) {
      if (pattern.test(message)) {
        message = "An error occurred";
        break;
      }
    }

    // Remove internal patterns
    for (const pattern of this.INTERNAL_PATTERNS) {
      message = message.replace(pattern, "");
    }

    return {
      message: message || "An unexpected error occurred",
    };
  }
}

/**
 * Global error handler with sanitization
 */
export function handleApiError(error: unknown): Response {
  const isProduction = env.NODE_ENV === "production";

  if (error instanceof TRPCError) {
    return Response.json(
      ErrorSanitization.sanitize(error, isProduction),
      { status: getHttpStatus(error.code) }
    );
  }

  if (error instanceof Error) {
    console.error("Unhandled error:", error);
    
    return Response.json(
      ErrorSanitization.sanitize(error, isProduction),
      { status: 500 }
    );
  }

  return Response.json(
    { message: "An unexpected error occurred" },
    { status: 500 }
  );
}
```

---

## 3.3 Logging & Monitoring Security

### 3.3.1 Secure Logging

**Status:** 🟡 Partial (logger exists)
**Priority:** P1 - High
**Effort:** 2 days

```typescript
// lib/security/secure-logging.ts

/**
 * Secure Logging Configuration
 */
export class SecureLogger {
  private static readonly SENSITIVE_FIELDS = [
    "password",
    "passwordHash",
    "token",
    "accessToken",
    "refreshToken",
    "apiKey",
    "secret",
    "creditCard",
    "ssn",
    "bankAccount",
  ];

  private static readonly MASK_VALUE = "[REDACTED]";

  /**
   * Sanitize object for logging
   */
  static sanitizeForLog<T extends Record<string, any>>(data: T): Partial<T> {
    const sanitized: Partial<T> = {};

    for (const [key, value] of Object.entries(data)) {
      if (this.isSensitive(key)) {
        sanitized[key as keyof T] = this.MASK_VALUE as T[keyof T];
      } else if (typeof value === "object" && value !== null) {
        sanitized[key as keyof T] = this.sanitizeForLog(value) as T[keyof T];
      } else {
        sanitized[key as keyof T] = value;
      }
    }

    return sanitized;
  }

  private static isSensitive(key: string): boolean {
    const lowerKey = key.toLowerCase();
    return this.SENSITIVE_FIELDS.some(field =>
      lowerKey.includes(field.toLowerCase())
    );
  }

  /**
   * Structured logging with security context
   */
  static log(level: "info" | "warn" | "error", message: string, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ? this.sanitizeForLog(data) : undefined,
      environment: env.NODE_ENV,
      service: "reqflow-api",
    };

    // Use structured logging
    console.log(JSON.stringify(logEntry));
  }
}

/**
 * Audit log for security events
 */
export async function logSecurityEvent(event: {
  type: "auth" | "access" | "data" | "admin";
  action: string;
  userId?: string;
  tenantId?: string;
  ip?: string;
  userAgent?: string;
  resource?: string;
  resourceId?: string;
  outcome: "success" | "failure" | "denied";
  metadata?: Record<string, any>;
}) {
  await db.insert(securityEvents).values({
    ...event,
    createdAt: new Date(),
  });

  // Alert on suspicious patterns
  if (event.outcome === "denied") {
    await checkForAnomalousActivity(event.userId, event.ip);
  }
}
```

### 3.3.2 Security Monitoring & Alerting

**Status:** 🔴 Not Implemented
**Priority:** P1 - High
**Effort:** 1 week

```typescript
// lib/security/security-monitoring.ts

/**
 * Security Monitoring & Alerting
 */
export class SecurityMonitor {
  private static alertChannels = {
    slack: process.env.SECURITY_SLACK_WEBHOOK,
    email: process.env.SECURITY_EMAIL,
    pagerduty: process.env.PAGERDUTY_ROUTING_KEY,
  };

  /**
   * Alert severity levels
   */
  private static severityConfig = {
    critical: { notify: ["slack", "pagerduty", "email"], throttle: 0 },
    high: { notify: ["slack", "email"], throttle: 5 * 60 * 1000 }, // 5 min
    medium: { notify: ["slack"], throttle: 30 * 60 * 1000 }, // 30 min
    low: { notify: ["email"], throttle: 60 * 60 * 1000 }, // 1 hour
  };

  /**
   * Detect and alert on security anomalies
   */
  static async detectAnomaly(event: SecurityEvent): Promise<void> {
    const patterns = await this.matchPatterns(event);
    
    for (const pattern of patterns) {
      if (pattern.matched) {
        await this.alert({
          severity: pattern.severity,
          title: pattern.name,
          description: pattern.description,
          event,
        });
      }
    }
  }

  /**
   * Known attack patterns
   */
  private static patterns: SecurityPattern[] = [
    {
      name: "Brute Force Attack",
      description: "Multiple failed login attempts from same IP",
      severity: "high",
      check: async (event) => {
        if (event.type !== "auth" || event.outcome !== "failure") return false;
        
        const recentFailures = await redis.get(`auth-failures:${event.ip}`);
        return Number(recentFailures) >= 10;
      },
    },
    {
      name: "Credential Stuffing",
      description: "Multiple different usernames from same IP",
      severity: "high",
      check: async (event) => {
        if (event.type !== "auth") return false;
        
        const usernames = await redis.smembers(`auth-attempts:${event.ip}`);
        return usernames.length >= 5;
      },
    },
    {
      name: "Privilege Escalation Attempt",
      description: "User attempted to access resource beyond their role",
      severity: "critical",
      check: async (event) => {
        return event.type === "access" && event.outcome === "denied" &&
               event.metadata?.reason === "insufficient_role";
      },
    },
    {
      name: "Data Exfiltration Pattern",
      description: "Unusual data export activity",
      severity: "high",
      check: async (event) => {
        if (event.action !== "export") return false;
        
        const exports = await redis.get(`exports:${event.userId}`);
        return Number(exports) >= 10; // 10 exports in time window
      },
    },
    {
      name: "Geographically Impossible Access",
      description: "Access from two distant locations in short time",
      severity: "medium",
      check: async (event) => {
        const lastLocation = await redis.get(`last-location:${event.userId}`);
        if (!lastLocation) return false;
        
        const distance = calculateDistance(
          JSON.parse(lastLocation),
          event.metadata?.location
        );
        
        const timeDiff = Date.now() - Number(await redis.get(`last-access:${event.userId}`));
        
        // Impossible if distance > 500km and time < 1 hour
        return distance > 500 && timeDiff < 3600000;
      },
    },
  ];

  /**
   * Send alert through configured channels
   */
  private static async alert(alert: SecurityAlert): Promise<void> {
    const config = this.severityConfig[alert.severity];
    
    // Check throttle
    const throttleKey = `alert-throttle:${alert.title}`;
    const lastAlert = await redis.get(throttleKey);
    if (lastAlert && config.throttle > 0) {
      return; // Skip due to throttling
    }

    // Set throttle
    await redis.setex(throttleKey, config.throttle / 1000, "1");

    // Send notifications
    for (const channel of config.notify) {
      switch (channel) {
        case "slack":
          await this.sendSlackAlert(alert);
          break;
        case "email":
          await this.sendEmailAlert(alert);
          break;
        case "pagerduty":
          await this.sendPagerDutyAlert(alert);
          break;
      }
    }
  }
}
```

---

# PART 4: INFRASTRUCTURE SECURITY 🏢

## 4.1 Network Security

### 4.1.1 WAF Configuration

**Status:** 🟡 Partial (Cloudflare in front)
**Priority:** P1 - High
**Effort:** 2 days

```yaml
# Cloudflare WAF Rules
rules:
  # Block known attack patterns
  - action: block
    expression: >
      any(http.request.uri.path[*] contains "wp-admin") or
      any(http.request.uri.path[*] contains "phpmyadmin") or
      any(http.request.uri.path[*] contains ".env")
    description: "Block common vulnerability scans"

  # Rate limit API endpoints
  - action: challenge
    expression: >
      http.request.uri.path contains "/api/" and
      rate_limit(100, 60)
    description: "Rate limit API requests"

  # Block SQL injection patterns
  - action: block
    expression: >
      any(http.request.uri.query[*] contains "'") or
      any(http.request.uri.query[*] contains "UNION") or
      any(http.request.uri.query[*] contains "--")
    description: "Block SQL injection attempts"

  # Block XSS patterns
  - action: block
    expression: >
      any(http.request.uri.query[*] contains "<script") or
      any(http.request.uri.query[*] contains "javascript:")
    description: "Block XSS attempts"

  # Geo-blocking (optional)
  - action: challenge
    expression: >
      not ip.geo.country in {"FR" "DE" "NL" "BE" "LU" "UK" "US" "CA"}
    description: "Challenge non-allowed countries"

  # Bot management
  - action: challenge
    expression: >
      cf.client.bot and not cf.client.verified_bot
    description: "Challenge unverified bots"
```

### 4.1.2 DDoS Protection

**Status:** 🟢 Implemented (Cloudflare)
**Priority:** Maintenance
**Effort:** Ongoing

```yaml
# Cloudflare DDoS Configuration
ddos_protection:
  # HTTP DDoS
  http:
    sensitivity_level: medium
    mitigation_timeout: 600
    
  # Network DDoS (Layer 3/4)
  network:
    enabled: true
    
  # Rate Limiting
  rate_limiting:
    - path: /api/auth/*
      requests_per_minute: 20
      action: challenge
      
    - path: /api/trpc/*
      requests_per_minute: 100
      action: block
      
    - path: /api/webhooks/*
      requests_per_minute: 1000
      action: log
```

---

## 4.2 Backup & Recovery

### 4.2.1 Backup Strategy

**Status:** 🟡 Partial (Neon PITR)
**Priority:** P1 - High
**Effort:** 3 days

```yaml
# Backup Configuration
backups:
  # Database (Neon)
  database:
    type: point_in_time_recovery
    retention: 7d
    frequency: continuous
    
  # File Storage (R2)
  files:
    type: versioning
    retention: 90d
    versions: 10
    
  # Redis (Upstash)
  redis:
    type: snapshot
    frequency: 6h
    retention: 7d

# Backup Verification
verification:
  schedule: weekly
  restore_test: monthly
  compliance_check: quarterly
```

### 4.2.2 Disaster Recovery

**Status:** 🔴 Not Implemented
**Priority:** P1 - High
**Effort:** 1 week

```yaml
# Disaster Recovery Plan
disaster_recovery:
  rpo: 1h  # Recovery Point Objective
  rto: 4h  # Recovery Time Objective
  
  tiers:
    critical:
      services: [database, auth, api]
      rto: 1h
      rpo: 15m
      
    important:
      services: [file_storage, email, webhooks]
      rto: 4h
      rpo: 1h
      
    normal:
      services: [analytics, ai_features]
      rto: 24h
      rpo: 24h

  failover:
    database:
      primary: neon-eu-west
      secondary: neon-eu-central
      automatic: true
      
    application:
      primary: vercel-eu
      secondary: vercel-us
      automatic: false  # Manual DNS switch
```

---

# PART 5: COMPLIANCE & AUDIT 📋

## 5.1 SOC 2 Readiness

**Status:** 🔴 Not Started
**Priority:** P1 - High (for launch)
**Effort:** 2-3 months

```markdown
## SOC 2 Type II Checklist

### Trust Service Criteria

#### Security (CC6.0-CC6.8)
- [ ] CC6.1: Logical and physical access controls
- [ ] CC6.2: System authentication
- [ ] CC6.3: System authorization
- [ ] CC6.4: System boundaries
- [ ] CC6.5: Input/output controls
- [ ] CC6.6: System processing integrity
- [ ] CC6.7: Transmission protection
- [ ] CC6.8: System disposal

#### Availability (A1.0-A1.3)
- [ ] A1.1: System availability
- [ ] A1.2: Backup and recovery
- [ ] A1.3: Environmental protections

#### Confidentiality (C1.0-C1.2)
- [ ] C1.1: Data classification
- [ ] C1.2: Data disposal

### Evidence Collection
- [ ] Access logs (90 days minimum)
- [ ] Change management records
- [ ] Incident response records
- [ ] Vendor assessments
- [ ] Risk assessments
- [ ] Policy acknowledgments
```

## 5.2 GDPR Compliance

**Status:** 🟡 Partial
**Priority:** P0 - Critical
**Effort:** 2 weeks

```typescript
// lib/compliance/gdpr.ts

/**
 * GDPR Compliance Implementation
 */
export class GDPRCompliance {
  /**
   * Data Processing Records (Article 30)
   */
  static readonly processingActivities = [
    {
      purpose: "User authentication",
      categories: ["identity", "credentials"],
      recipients: ["internal"],
      retention: "7 years",
      lawfulBasis: "contract",
    },
    {
      purpose: "Procurement management",
      categories: ["financial", "vendor"],
      recipients: ["internal", "vendors"],
      retention: "7 years (tax)",
      lawfulBasis: "contract",
    },
    {
      purpose: "Analytics",
      categories: ["usage", "performance"],
      recipients: ["internal"],
      retention: "2 years",
      lawfulBasis: "legitimate-interest",
    },
  ];

  /**
   * Right to Access (Article 15)
   */
  static async handleAccessRequest(userId: string): Promise<{
    data: any;
    purposes: string[];
    recipients: string[];
    retentionPeriods: Record<string, string>;
  }> {
    const userData = await this.collectUserData(userId);
    
    return {
      data: userData,
      purposes: this.processingActivities.map(a => a.purpose),
      recipients: [...new Set(this.processingActivities.flatMap(a => a.recipients))],
      retentionPeriods: Object.fromEntries(
        this.processingActivities.map(a => [a.purpose, a.retention])
      ),
    };
  }

  /**
   * Right to Erasure (Article 17)
   */
  static async handleErasureRequest(userId: string): Promise<{
    status: "completed" | "partial" | "denied";
    details: string[];
    legalExceptions?: string[];
  }> {
    const details: string[] = [];
    const legalExceptions: string[] = [];

    // Check for legal grounds to retain
    const hasActiveContracts = await this.checkActiveContracts(userId);
    const hasTaxObligations = await this.checkTaxObligations(userId);

    if (hasActiveContracts) {
      legalExceptions.push("Active contracts prevent full erasure");
    }
    if (hasTaxObligations) {
      legalExceptions.push("Tax retention requirements apply");
    }

    // Anonymize what we can
    await this.anonymizeUserData(userId, details);

    return {
      status: legalExceptions.length > 0 ? "partial" : "completed",
      details,
      legalExceptions: legalExceptions.length > 0 ? legalExceptions : undefined,
    };
  }

  /**
   * Data Portability (Article 20)
   */
  static async handlePortabilityRequest(userId: string): Promise<{
    format: string;
    data: any;
    downloadUrl?: string;
  }> {
    const data = await this.collectUserData(userId);
    
    // Generate machine-readable export
    const exportData = JSON.stringify(data, null, 2);
    
    // Store temporarily and generate download URL
    const key = `exports/${userId}/gdpr-export-${Date.now()}.json`;
    await uploadToR2(key, exportData, "application/json");
    
    return {
      format: "application/json",
      data,
      downloadUrl: await generatePresignedUrl(key, 3600),
    };
  }
}
```

---

# PART 6: SECURITY ROADMAP 🗓️

## Phase 1: Foundation (Week 1-2)

| Task | Priority | Effort | Status |
|------|----------|--------|--------|
| Implement pre-commit hooks | P0 | 2d | 🔴 |
| Set up secret detection | P0 | 1d | 🔴 |
| Configure SAST in CI/CD | P1 | 2d | 🔴 |
| Enable RLS on all tables | P0 | 3d | 🔴 |
| Implement field-level encryption | P0 | 3d | 🔴 |

## Phase 2: Hardening (Week 3-4)

| Task | Priority | Effort | Status |
|------|----------|--------|--------|
| Implement ABAC engine | P1 | 5d | 🔴 |
| Add response filtering | P1 | 2d | 🔴 |
| Set up security monitoring | P1 | 5d | 🔴 |
| Configure WAF rules | P1 | 2d | 🔴 |
| Implement data masking | P1 | 2d | 🔴 |

## Phase 3: Compliance (Week 5-8)

| Task | Priority | Effort | Status |
|------|----------|--------|--------|
| GDPR compliance audit | P0 | 2w | 🔴 |
| SOC 2 preparation | P1 | 4w | 🔴 |
| Penetration testing | P1 | 1w | 🔴 |
| Security documentation | P1 | 1w | 🔴 |

## Phase 4: Continuous (Ongoing)

| Task | Frequency | Effort |
|------|-----------|--------|
| Dependency audits | Weekly | 1h |
| Security reviews | Per release | 4h |
| Incident response drills | Quarterly | 4h |
| Penetration testing | Annually | 1w |

---

# APPENDIX A: SECURITY CHECKLISTS

## Pre-Launch Security Checklist

### Authentication & Authorization
- [x] CSRF protection on all mutations
- [x] Secure session cookies (httpOnly, secure, sameSite)
- [ ] MFA enforced for admin/finance roles
- [x] OAuth state parameter validation
- [x] Rate limiting on auth endpoints
- [x] Authorization checks on all protected routes

### Data Protection
- [ ] Encryption at rest for sensitive fields
- [x] TLS 1.3 for all connections
- [ ] RLS enabled on all tables
- [x] Audit logging for sensitive operations
- [ ] Data classification implemented
- [x] No sensitive data in logs

### Input/Output
- [x] Input validation with Zod
- [x] XSS prevention (React + sanitization)
- [x] SQL injection prevention (Drizzle ORM)
- [x] File upload validation
- [ ] Response filtering by role
- [x] Error message sanitization

### Infrastructure
- [x] Security headers (CSP, HSTS, etc.)
- [ ] WAF configured
- [x] DDoS protection (Cloudflare)
- [ ] Backup strategy documented
- [ ] Disaster recovery plan

### Monitoring
- [x] Error tracking (Sentry)
- [x] Logging (Axiom)
- [ ] Security event monitoring
- [ ] Alerting for anomalies
- [ ] Audit log integrity

---

# APPENDIX B: INCIDENT RESPONSE PLAN

## Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| P1 - Critical | Active breach, data exfiltration | 15 min | SQL injection, RCE |
| P2 - High | Potential vulnerability exploited | 1 hour | Auth bypass, IDOR |
| P3 - Medium | Security control failure | 4 hours | Rate limit bypass |
| P4 - Low | Policy violation, minor issue | 24 hours | Improper logging |

## Response Process

```
1. DETECT → Alert triggered
2. ASSESS → Determine severity
3. CONTAIN → Isolate affected systems
4. ERADICATE → Remove threat
5. RECOVER → Restore services
6. REVIEW → Post-incident analysis
```

## Contact Escalation

```
Level 1: On-call engineer (auto-alert)
Level 2: Security lead (manual escalation)
Level 3: CTO/CEO (critical incidents)
External: Incident response firm (breach)
```

---

**Document Version:** 1.0
**Last Updated:** February 27, 2026
**Next Review:** March 27, 2026
**Owner:** Security Engineering Team
**Classification:** CONFIDENTIAL - Internal Security Document
