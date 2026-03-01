/**
 * Security Monitoring and Alerting System
 *
 * Monitors security events, detects anomalies, and triggers alerts.
 * Integrates with Sentry, Axiom, and Slack for notifications.
 */

import { db } from "@/lib/db";
import { authEvents, auditLogs } from "@/lib/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { logger } from "@/lib/monitoring/logger";
import { captureError } from "@/lib/monitoring/sentry";

// ============================================================================
// Types
// ============================================================================

export type SecurityEventType =
  | "auth_failure"
  | "auth_success"
  | "rate_limit_exceeded"
  | "suspicious_activity"
  | "permission_denied"
  | "data_access"
  | "data_export"
  | "config_change"
  | "integration_connected"
  | "integration_disconnected"
  | "session_hijack_suspected"
  | "brute_force_detected"
  | "anomaly_detected";

export type Severity = "low" | "medium" | "high" | "critical";

export interface SecurityEventDetails {
  violationCount?: number;
  denialCount?: number;
  isNewIp?: boolean;
  isUnusualLocation?: boolean;
  requestRate?: number;
  recentAuthFailures?: number;
  sensitiveDataAccessCount?: number;
  reason?: string;
}

export interface SecurityEvent {
  type: SecurityEventType;
  severity: Severity;
  tenantId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: SecurityEventDetails;
  timestamp: Date;
}

export interface SecurityAlert {
  id: string;
  type: SecurityEventType;
  severity: Severity;
  message: string;
  events: SecurityEvent[];
  tenantId?: string;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  resolvedAt?: Date;
}

export interface AnomalyScore {
  score: number; // 0-100
  factors: string[];
  recommendation: string;
}

// ============================================================================
// Thresholds Configuration
// ============================================================================

export const securityThresholds = {
  // Auth failures before alert
  authFailuresPerHour: 5,
  authFailuresPerIpPerHour: 10,

  // Rate limit violations before alert
  rateLimitViolationsPerHour: 20,

  // Suspicious activity thresholds
  ipChangesPerSession: 3,
  rapidRequestsPerMinute: 100,

  // Data access thresholds
  exportRequestsPerDay: 10,
  sensitiveDataAccessPerHour: 50,

  // Anomaly detection
  anomalyScoreThreshold: 70,
};

// ============================================================================
// Security Monitor Class
// ============================================================================

export class SecurityMonitor {
  private alertQueue: SecurityAlert[] = [];
  private isProcessing = false;

  /**
   * Record a security event
   */
  async recordEvent(event: SecurityEvent): Promise<void> {
    try {
      // Log to Axiom
      logger.info("Security event", {
        type: event.type,
        severity: event.severity,
        tenantId: event.tenantId,
        userId: event.userId,
        ipAddress: event.ipAddress,
        details: event.details,
      });

      // Check if this event should trigger an alert
      await this.evaluateAlertConditions(event);

      // Check for anomalies
      if (event.userId) {
        const anomalyScore = await this.calculateAnomalyScore(event);
        if (anomalyScore.score >= securityThresholds.anomalyScoreThreshold) {
          await this.triggerAlert({
            type: "anomaly_detected",
            severity: anomalyScore.score >= 90 ? "critical" : "high",
            message: `Anomaly detected for user ${event.userId}: Score ${anomalyScore.score}`,
            events: [event],
            tenantId: event.tenantId,
          });
        }
      }
    } catch (error) {
      captureError(error, { context: "security_monitor_record_event" });
    }
  }

  /**
   * Evaluate if an event should trigger an alert
   */
  private async evaluateAlertConditions(event: SecurityEvent): Promise<void> {
    switch (event.type) {
      case "auth_failure":
        await this.checkAuthFailurePattern(event);
        break;

      case "rate_limit_exceeded":
        await this.checkRateLimitPattern(event);
        break;

      case "permission_denied":
        await this.checkPermissionDeniedPattern(event);
        break;

      case "data_export":
        await this.checkDataExportPattern(event);
        break;

      case "suspicious_activity":
        await this.checkSuspiciousActivityPattern(event);
        break;
    }
  }

  /**
   * Check for brute force attack pattern
   */
  private async checkAuthFailurePattern(event: SecurityEvent): Promise<void> {
    if (!event.tenantId || !event.ipAddress) return;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Check failures per IP
    const ipFailures = await db
      .select({ count: sql<number>`count(*)` })
      .from(authEvents)
      .where(
        and(
          eq(authEvents.event, "login_failed"),
          eq(authEvents.ipAddress, event.ipAddress),
          gte(authEvents.createdAt, oneHourAgo)
        )
      );

    const failureCount = Number(ipFailures[0]?.count || 0);

    if (failureCount >= securityThresholds.authFailuresPerIpPerHour) {
      await this.triggerAlert({
        type: "brute_force_detected",
        severity: "critical",
        message: `Potential brute force attack from IP ${event.ipAddress}: ${failureCount} failures in last hour`,
        events: [event],
        tenantId: event.tenantId,
      });
    }
  }

  /**
   * Check for rate limit abuse pattern
   */
  private async checkRateLimitPattern(event: SecurityEvent): Promise<void> {
    if (!event.userId) return;

    // Log repeated rate limit violations
    logger.warn("Rate limit violation pattern detected", {
      userId: event.userId,
      tenantId: event.tenantId,
      ipAddress: event.ipAddress,
    });

    // If same user has multiple violations, escalate
    const violationCount = event.details.violationCount ?? 0;
    if (violationCount >= securityThresholds.rateLimitViolationsPerHour) {
      await this.triggerAlert({
        type: "suspicious_activity",
        severity: "high",
        message: `User ${event.userId} exceeded rate limit ${violationCount} times`,
        events: [event],
        tenantId: event.tenantId,
      });
    }
  }

  /**
   * Check for permission probing pattern
   */
  private async checkPermissionDeniedPattern(event: SecurityEvent): Promise<void> {
    if (!event.userId) return;

    const denialCount = Number(event.details.denialCount || 0);

    if (denialCount >= 10) {
      await this.triggerAlert({
        type: "suspicious_activity",
        severity: "medium",
        message: `User ${event.userId} has ${denialCount} permission denials - possible privilege escalation attempt`,
        events: [event],
        tenantId: event.tenantId,
      });
    }
  }

  /**
   * Check for data exfiltration pattern
   */
  private async checkDataExportPattern(event: SecurityEvent): Promise<void> {
    if (!event.userId || !event.tenantId) return;

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const exports = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.tenantId, event.tenantId),
          eq(auditLogs.userId, event.userId),
          eq(auditLogs.action, "data.export"),
          gte(auditLogs.createdAt, oneDayAgo)
        )
      );

    const exportCount = Number(exports[0]?.count || 0);

    if (exportCount >= securityThresholds.exportRequestsPerDay) {
      await this.triggerAlert({
        type: "suspicious_activity",
        severity: "high",
        message: `User ${event.userId} has exported data ${exportCount} times today - possible data exfiltration`,
        events: [event],
        tenantId: event.tenantId,
      });
    }
  }

  /**
   * Check for suspicious activity pattern
   */
  private async checkSuspiciousActivityPattern(event: SecurityEvent): Promise<void> {
    // Escalate suspicious activity directly
    await this.triggerAlert({
      type: "suspicious_activity",
      severity: event.severity,
      message: `Suspicious activity detected: ${event.details.reason || "Unknown"}`,
      events: [event],
      tenantId: event.tenantId,
    });
  }

  /**
   * Calculate anomaly score for a user
   */
  async calculateAnomalyScore(event: SecurityEvent): Promise<AnomalyScore> {
    const factors: string[] = [];
    let score = 0;

    // Check for unusual time of access
    const hour = event.timestamp.getHours();
    if (hour < 6 || hour > 22) {
      score += 10;
      factors.push("Unusual access time (outside business hours)");
    }

    // Check for new IP address
    if (event.details.isNewIp) {
      score += 15;
      factors.push("Access from new IP address");
    }

    // Check for rapid successive requests
    const requestRate = event.details.requestRate ?? 0;
    if (requestRate > securityThresholds.rapidRequestsPerMinute) {
      score += 25;
      factors.push("High request rate detected");
    }

    // Check for access from unusual location
    if (event.details.isUnusualLocation) {
      score += 20;
      factors.push("Access from unusual geographic location");
    }

    // Check for multiple failed auth attempts
    const recentAuthFailures = event.details.recentAuthFailures ?? 0;
    if (recentAuthFailures > 3) {
      score += 15;
      factors.push("Multiple recent authentication failures");
    }

    // Check for sensitive data access spike
    const sensitiveDataAccessCount = event.details.sensitiveDataAccessCount ?? 0;
    if (sensitiveDataAccessCount > securityThresholds.sensitiveDataAccessPerHour) {
      score += 20;
      factors.push("High volume of sensitive data access");
    }

    // Generate recommendation
    let recommendation = "Monitor user activity";
    if (score >= 70) {
      recommendation = "Consider requiring re-authentication or MFA verification";
    }
    if (score >= 90) {
      recommendation = "Consider temporarily restricting account and investigating";
    }

    return { score, factors, recommendation };
  }

  /**
   * Trigger a security alert
   */
  private async triggerAlert(alert: Omit<SecurityAlert, "id" | "createdAt" | "acknowledged">): Promise<void> {
    const fullAlert: SecurityAlert = {
      ...alert,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      acknowledged: false,
    };

    this.alertQueue.push(fullAlert);

    // Log alert
    logger.warn("Security alert triggered", {
      alertId: fullAlert.id,
      type: fullAlert.type,
      severity: fullAlert.severity,
      message: fullAlert.message,
      tenantId: fullAlert.tenantId,
    });

    // Send to Sentry for critical/high alerts
    if (fullAlert.severity === "critical" || fullAlert.severity === "high") {
      captureError(new Error(`Security Alert: ${fullAlert.message}`), {
        alertId: fullAlert.id,
        type: fullAlert.type,
        severity: fullAlert.severity,
      });
    }

    // Process alert queue
    await this.processAlertQueue();
  }

  /**
   * Process pending alerts
   */
  private async processAlertQueue(): Promise<void> {
    if (this.isProcessing || this.alertQueue.length === 0) return;

    this.isProcessing = true;

    try {
      // Process alerts by severity
      const criticalAlerts = this.alertQueue.filter(a => a.severity === "critical" && !a.acknowledged);
      const highAlerts = this.alertQueue.filter(a => a.severity === "high" && !a.acknowledged);

      // For critical alerts, send immediate notifications
      for (const alert of criticalAlerts.slice(0, 5)) {
        await this.sendImmediateNotification(alert);
      }

      // For high alerts, batch and send
      if (highAlerts.length > 0) {
        await this.sendBatchNotification(highAlerts.slice(0, 10));
      }

      // Clear processed alerts (in production, would persist to DB)
      this.alertQueue = this.alertQueue.filter(
        a => !criticalAlerts.includes(a) && !highAlerts.includes(a)
      );
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Send immediate notification (Slack, PagerDuty, etc.)
   */
  private async sendImmediateNotification(alert: SecurityAlert): Promise<void> {
    // In production, integrate with Slack webhook, PagerDuty, etc.
    logger.error("IMMEDIATE SECURITY ALERT", {
      alertId: alert.id,
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      tenantId: alert.tenantId,
      events: alert.events.length,
    });

    // TODO: Send Slack notification
    // await slackClient.postMessage({
    //   channel: "#security-alerts",
    //   text: `🚨 CRITICAL SECURITY ALERT\n\n${alert.message}\n\nAlert ID: ${alert.id}`,
    // });
  }

  /**
   * Send batch notification for multiple alerts
   */
  private async sendBatchNotification(alerts: SecurityAlert[]): Promise<void> {
    logger.warn("Batch security alerts", {
      count: alerts.length,
      types: [...new Set(alerts.map(a => a.type))],
      severities: [...new Set(alerts.map(a => a.severity))],
    });

    // TODO: Send batch Slack notification
  }

  /**
   * Get security metrics for a tenant
   */
  async getSecurityMetrics(tenantId: string, since: Date): Promise<{
    authFailures: number;
    permissionDenied: number;
    rateLimitViolations: number;
    suspiciousActivities: number;
    dataExports: number;
    activeSessions: number;
  }> {
    const [authFailureResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(authEvents)
      .where(
        and(
          eq(authEvents.tenantId, tenantId),
          eq(authEvents.event, "login_failed"),
          gte(authEvents.createdAt, since)
        )
      );

    const [permDeniedResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.tenantId, tenantId),
          eq(auditLogs.action, "permission.denied"),
          gte(auditLogs.createdAt, since)
        )
      );

    const [rateLimitResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.tenantId, tenantId),
          eq(auditLogs.action, "rate_limit.exceeded"),
          gte(auditLogs.createdAt, since)
        )
      );

    const [suspiciousResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.tenantId, tenantId),
          eq(auditLogs.action, "security.suspicious"),
          gte(auditLogs.createdAt, since)
        )
      );

    const [exportResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.tenantId, tenantId),
          eq(auditLogs.action, "data.export"),
          gte(auditLogs.createdAt, since)
        )
      );

    return {
      authFailures: Number(authFailureResult?.count || 0),
      permissionDenied: Number(permDeniedResult?.count || 0),
      rateLimitViolations: Number(rateLimitResult?.count || 0),
      suspiciousActivities: Number(suspiciousResult?.count || 0),
      dataExports: Number(exportResult?.count || 0),
      activeSessions: 0, // Would query sessions table
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let securityMonitor: SecurityMonitor | null = null;

export function getSecurityMonitor(): SecurityMonitor {
  if (!securityMonitor) {
    securityMonitor = new SecurityMonitor();
  }
  return securityMonitor;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Record a security event (convenience function)
 */
export async function recordSecurityEvent(event: SecurityEvent): Promise<void> {
  const monitor = getSecurityMonitor();
  await monitor.recordEvent(event);
}

/**
 * Check if IP is in a known bad list
 */
export async function isIpBlacklisted(ip: string): Promise<boolean> {
  // In production, check against threat intelligence feeds
  const knownBadIps: string[] = [
    // Example: Tor exit nodes, known VPNs, etc.
  ];

  return knownBadIps.includes(ip);
}

/**
 * Get risk level for an IP address
 */
export async function getIpRiskLevel(ip: string): Promise<"low" | "medium" | "high"> {
  // In production, integrate with IP reputation services
  // For now, return low
  return "low";
}
