/**
 * Attribute-Based Access Control (ABAC) Engine
 *
 * Provides fine-grained authorization based on:
 * - Subject attributes (user role, department, clearance level)
 * - Resource attributes (owner, sensitivity, amount, status)
 * - Action attributes (read, write, delete, approve)
 * - Environment attributes (time, location, device)
 *
 * Combines with existing RBAC for defense-in-depth
 */

import { User } from "@/lib/db/schema";

// ============================================================================
// Types & Interfaces
// ============================================================================

export type ABACAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "approve"
  | "reject"
  | "export"
  | "share"
  | "admin";

export type ABACEffect = "allow" | "deny";

export interface ABACResource {
  type: string;
  id?: string;
  ownerId?: string;
  departmentId?: string;
  sensitivity?: DataSensitivity;
  amount?: number;
  status?: string;
  [key: string]: unknown;
}

export interface ABACEnvironment {
  time: Date;
  ipAddress?: string;
  location?: string;
  deviceId?: string;
  userAgent?: string;
  isMfaVerified?: boolean;
}

export interface ABACRequest {
  subject: ABACSubject;
  action: ABACAction;
  resource: ABACResource;
  environment: ABACEnvironment;
}

export interface ABACSubject {
  id: string;
  tenantId: string;
  role: string;
  departmentId?: string;
  clearanceLevel?: ClearanceLevel;
  permissions?: string[];
  attributes?: Record<string, unknown>;
}

export interface ABACPolicy {
  id: string;
  name: string;
  description?: string;
  effect: ABACEffect;
  priority: number;
  subjects?: SubjectMatcher;
  actions?: ActionMatcher;
  resources?: ResourceMatcher;
  environment?: EnvironmentMatcher;
  conditions?: Condition[];
}

// ============================================================================
// Enums
// ============================================================================

export enum DataSensitivity {
  PUBLIC = "public",
  INTERNAL = "internal",
  CONFIDENTIAL = "confidential",
  RESTRICTED = "restricted",
}

export enum ClearanceLevel {
  STANDARD = 1,
  ELEVATED = 2,
  HIGH = 3,
  CRITICAL = 4,
}

// ============================================================================
// Matcher Types
// ============================================================================

type SubjectMatcher = {
  roles?: string[];
  departments?: string[];
  clearanceLevel?: { min?: ClearanceLevel; max?: ClearanceLevel };
  custom?: (subject: ABACSubject) => boolean;
};

type ActionMatcher = {
  actions?: ABACAction[];
  categories?: ("read" | "write" | "admin" | "sensitive")[];
  custom?: (action: ABACAction) => boolean;
};

type ResourceMatcher = {
  types?: string[];
  sensitivity?: DataSensitivity[];
  owners?: ("self" | "department" | "any")[];
  status?: string[];
  amountRange?: { min?: number; max?: number };
  custom?: (resource: ABACResource) => boolean;
};

type EnvironmentMatcher = {
  timeRange?: { start: number; end: number }; // Hours 0-23
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  locations?: string[];
  requireMfa?: boolean;
  ipWhitelist?: string[];
  custom?: (env: ABACEnvironment) => boolean;
};

type Condition = {
  type: "comparison" | "custom";
  field?: string;
  operator?: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains";
  value?: unknown;
  custom?: (req: ABACRequest) => boolean;
};

// ============================================================================
// ABAC Engine
// ============================================================================

export class ABACEngine {
  private policies: ABACPolicy[] = [];
  private decisionCache: Map<string, ABACDecision> = new Map();

  constructor(policies?: ABACPolicy[]) {
    if (policies) {
      this.policies = policies.sort((a, b) => b.priority - a.priority);
    }
  }

  /**
   * Add a policy to the engine
   */
  addPolicy(policy: ABACPolicy): void {
    this.policies.push(policy);
    this.policies.sort((a, b) => b.priority - a.priority);
    this.decisionCache.clear();
  }

  /**
   * Evaluate access request against all policies
   */
  evaluate(request: ABACRequest): ABACDecision {
    // Check cache first
    const cacheKey = this.getCacheKey(request);
    const cached = this.decisionCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Evaluate policies in priority order
    for (const policy of this.policies) {
      const matches = this.policyMatches(policy, request);

      if (matches) {
        const decision: ABACDecision = {
          allowed: policy.effect === "allow",
          policyId: policy.id,
          policyName: policy.name,
          reason: policy.description,
        };

        // Cache the decision
        this.decisionCache.set(cacheKey, decision);
        return decision;
      }
    }

    // Default deny
    const defaultDecision: ABACDecision = {
      allowed: false,
      policyId: "default-deny",
      policyName: "Default Deny",
      reason: "No matching policy found - access denied by default",
    };

    this.decisionCache.set(cacheKey, defaultDecision);
    return defaultDecision;
  }

  /**
   * Check if a single policy matches the request
   */
  private policyMatches(policy: ABACPolicy, request: ABACRequest): boolean {
    // Check subject matcher
    if (policy.subjects && !this.matchSubject(policy.subjects, request.subject)) {
      return false;
    }

    // Check action matcher
    if (policy.actions && !this.matchAction(policy.actions, request.action)) {
      return false;
    }

    // Check resource matcher
    if (policy.resources && !this.matchResource(policy.resources, request.resource)) {
      return false;
    }

    // Check environment matcher
    if (policy.environment && !this.matchEnvironment(policy.environment, request.environment)) {
      return false;
    }

    // Check conditions
    if (policy.conditions) {
      for (const condition of policy.conditions) {
        if (!this.evaluateCondition(condition, request)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Match subject against policy
   */
  private matchSubject(matcher: SubjectMatcher, subject: ABACSubject): boolean {
    if (matcher.roles && !matcher.roles.includes(subject.role)) {
      return false;
    }

    if (matcher.departments && subject.departmentId && !matcher.departments.includes(subject.departmentId)) {
      return false;
    }

    if (matcher.clearanceLevel) {
      const level = subject.clearanceLevel || ClearanceLevel.STANDARD;
      if (matcher.clearanceLevel.min && level < matcher.clearanceLevel.min) {
        return false;
      }
      if (matcher.clearanceLevel.max && level > matcher.clearanceLevel.max) {
        return false;
      }
    }

    if (matcher.custom && !matcher.custom(subject)) {
      return false;
    }

    return true;
  }

  /**
   * Match action against policy
   */
  private matchAction(matcher: ActionMatcher, action: ABACAction): boolean {
    if (matcher.actions && !matcher.actions.includes(action)) {
      return false;
    }

    if (matcher.categories) {
      const actionCategories: Record<ABACAction, ("read" | "write" | "admin" | "sensitive")[]> = {
        read: ["read"],
        create: ["write"],
        update: ["write"],
        delete: ["write", "sensitive"],
        approve: ["sensitive"],
        reject: ["sensitive"],
        export: ["sensitive"],
        share: ["sensitive"],
        admin: ["admin"],
      };

      const categories = actionCategories[action] || [];
      const hasCategory = categories.some(c => matcher.categories!.includes(c));
      if (!hasCategory) {
        return false;
      }
    }

    if (matcher.custom && !matcher.custom(action)) {
      return false;
    }

    return true;
  }

  /**
   * Match resource against policy
   */
  private matchResource(matcher: ResourceMatcher, resource: ABACResource): boolean {
    if (matcher.types && !matcher.types.includes(resource.type)) {
      return false;
    }

    if (matcher.sensitivity && resource.sensitivity && !matcher.sensitivity.includes(resource.sensitivity)) {
      return false;
    }

    if (matcher.owners && resource.ownerId) {
      // This would need the subject context - simplified for now
    }

    if (matcher.status && resource.status && !matcher.status.includes(resource.status)) {
      return false;
    }

    if (matcher.amountRange && resource.amount !== undefined) {
      if (matcher.amountRange.min !== undefined && resource.amount < matcher.amountRange.min) {
        return false;
      }
      if (matcher.amountRange.max !== undefined && resource.amount > matcher.amountRange.max) {
        return false;
      }
    }

    if (matcher.custom && !matcher.custom(resource)) {
      return false;
    }

    return true;
  }

  /**
   * Match environment against policy
   */
  private matchEnvironment(matcher: EnvironmentMatcher, env: ABACEnvironment): boolean {
    if (matcher.timeRange) {
      const hour = env.time.getHours();
      if (hour < matcher.timeRange.start || hour >= matcher.timeRange.end) {
        return false;
      }
    }

    if (matcher.daysOfWeek) {
      const day = env.time.getDay();
      if (!matcher.daysOfWeek.includes(day)) {
        return false;
      }
    }

    if (matcher.locations && env.location && !matcher.locations.includes(env.location)) {
      return false;
    }

    if (matcher.requireMfa && !env.isMfaVerified) {
      return false;
    }

    if (matcher.ipWhitelist && env.ipAddress && !matcher.ipWhitelist.includes(env.ipAddress)) {
      return false;
    }

    if (matcher.custom && !matcher.custom(env)) {
      return false;
    }

    return true;
  }

  /**
   * Evaluate a condition
   */
  private evaluateCondition(condition: Condition, request: ABACRequest): boolean {
    if (condition.type === "custom" && condition.custom) {
      return condition.custom(request);
    }

    if (condition.type === "comparison" && condition.field) {
      const value = this.getFieldValue(request, condition.field);
      return this.compare(value, condition.operator || "eq", condition.value);
    }

    return true;
  }

  /**
   * Get a nested field value from request
   */
  private getFieldValue(request: ABACRequest, field: string): unknown {
    const parts = field.split(".");
    let value: unknown = request;

    for (const part of parts) {
      if (value && typeof value === "object") {
        value = (value as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Compare values with operator
   */
  private compare(left: unknown, operator: string, right: unknown): boolean {
    switch (operator) {
      case "eq":
        return left === right;
      case "neq":
        return left !== right;
      case "gt":
        return (left as number) > (right as number);
      case "gte":
        return (left as number) >= (right as number);
      case "lt":
        return (left as number) < (right as number);
      case "lte":
        return (left as number) <= (right as number);
      case "in":
        return Array.isArray(right) && right.includes(left);
      case "contains":
        return Array.isArray(left) && left.includes(right);
      default:
        return false;
    }
  }

  /**
   * Generate cache key for request
   */
  private getCacheKey(request: ABACRequest): string {
    return JSON.stringify({
      s: request.subject.id,
      a: request.action,
      r: request.resource.type,
      rid: request.resource.id,
    });
  }

  /**
   * Clear the decision cache
   */
  clearCache(): void {
    this.decisionCache.clear();
  }
}

// ============================================================================
// Decision Interface
// ============================================================================

export interface ABACDecision {
  allowed: boolean;
  policyId: string;
  policyName: string;
  reason?: string;
}

// ============================================================================
// Default Policies for Reqflow
// ============================================================================

export const defaultABACPolicies: ABACPolicy[] = [
  // Deny: Cannot approve own requests
  {
    id: "deny-approve-own",
    name: "Cannot Approve Own Requests",
    description: "Users cannot approve their own purchase requests",
    effect: "deny",
    priority: 100,
    actions: { actions: ["approve", "reject"] },
    conditions: [
      {
        type: "custom",
        custom: (req) => req.resource.ownerId === req.subject.id,
      },
    ],
  },

  // Deny: Large amount approvals require elevated clearance
  {
    id: "deny-large-amount-low-clearance",
    name: "Large Amount Requires Elevated Clearance",
    description: "Requests over €10,000 require elevated clearance level",
    effect: "deny",
    priority: 90,
    actions: { actions: ["approve"] },
    conditions: [
      {
        type: "custom",
        custom: (req) => {
          const amount = req.resource.amount || 0;
          const clearance = req.subject.clearanceLevel || ClearanceLevel.STANDARD;
          return amount > 10000 && clearance < ClearanceLevel.ELEVATED;
        },
      },
    ],
  },

  // Deny: Restricted data access outside business hours
  {
    id: "deny-restricted-after-hours",
    name: "Restricted Data Access After Hours",
    description: "Access to restricted data is denied outside business hours (9-18)",
    effect: "deny",
    priority: 80,
    resources: { sensitivity: [DataSensitivity.RESTRICTED] },
    environment: {
      timeRange: { start: 9, end: 18 },
    },
  },

  // Deny: Export operations require MFA
  {
    id: "deny-export-without-mfa",
    name: "Export Requires MFA",
    description: "Export operations require MFA verification",
    effect: "deny",
    priority: 85,
    actions: { actions: ["export"] },
    environment: { requireMfa: true },
  },

  // Deny: Finance operations restricted to finance role
  {
    id: "deny-finance-operations",
    name: "Finance Operations Restricted",
    description: "Finance-related operations require finance or admin role",
    effect: "deny",
    priority: 70,
    resources: {
      types: ["invoice", "budget", "accounting_integration"],
    },
    subjects: {
      roles: ["requester", "manager"],
    },
  },

  // Allow: Users can read own resources
  {
    id: "allow-read-own",
    name: "Read Own Resources",
    description: "Users can always read their own resources",
    effect: "allow",
    priority: 50,
    actions: { actions: ["read"] },
    conditions: [
      {
        type: "custom",
        custom: (req) => req.resource.ownerId === req.subject.id,
      },
    ],
  },

  // Allow: Admins have full access
  {
    id: "allow-admin-full",
    name: "Admin Full Access",
    description: "Administrators have full access to all resources",
    effect: "allow",
    priority: 10,
    subjects: { roles: ["admin"] },
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

let abacEngine: ABACEngine | null = null;

/**
 * Get the global ABAC engine instance
 */
export function getABACEngine(): ABACEngine {
  if (!abacEngine) {
    abacEngine = new ABACEngine(defaultABACPolicies);
  }
  return abacEngine;
}

/**
 * Create ABAC subject from user
 */
export function createABACSubject(user: User): ABACSubject {
  const clearanceMap: Record<string, ClearanceLevel> = {
    requester: ClearanceLevel.STANDARD,
    manager: ClearanceLevel.ELEVATED,
    finance: ClearanceLevel.HIGH,
    admin: ClearanceLevel.CRITICAL,
  };

  return {
    id: user.id,
    tenantId: user.tenantId,
    role: user.role,
    departmentId: user.departmentId || undefined,
    clearanceLevel: clearanceMap[user.role] || ClearanceLevel.STANDARD,
  };
}

/**
 * Create ABAC environment from request
 */
export function createABACEnvironment(request?: Request): ABACEnvironment {
  const headers = request?.headers;

  return {
    time: new Date(),
    ipAddress: headers?.get("x-forwarded-for") || headers?.get("x-real-ip") || undefined,
    userAgent: headers?.get("user-agent") || undefined,
    isMfaVerified: false, // Would be set by auth middleware
  };
}

/**
 * Check if action is allowed
 */
export async function checkABAC(
  user: User,
  action: ABACAction,
  resource: ABACResource,
  environment?: ABACEnvironment
): Promise<ABACDecision> {
  const engine = getABACEngine();
  const subject = createABACSubject(user);
  const env = environment || createABACEnvironment();

  return engine.evaluate({
    subject,
    action,
    resource,
    environment: env,
  });
}
