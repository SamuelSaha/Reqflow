/**
 * CSP Violation Reporting Endpoint
 * Receives browser reports when Content Security Policy is violated
 * Helps identify XSS attempts and misconfigured CSP rules
 */

import { NextResponse } from "next/server";
import { logger } from "@/lib/monitoring/logger";
import { captureError } from "@/lib/monitoring/sentry";

interface CSPViolationReport {
  "csp-report": {
    "document-uri": string;
    "referrer": string;
    "violated-directive": string;
    "effective-directive": string;
    "original-policy": string;
    "blocked-uri": string;
    "status-code": number;
    "script-sample"?: string;
    "source-file"?: string;
    "line-number"?: number;
    "column-number"?: number;
  };
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type");

    // CSP reports are sent as application/csp-report or application/json
    if (!contentType?.includes("application/csp-report") && !contentType?.includes("application/json")) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    const report: CSPViolationReport = await request.json();
    const cspReport = report["csp-report"];

    if (!cspReport) {
      return NextResponse.json({ error: "Invalid CSP report format" }, { status: 400 });
    }

    // Log the violation for monitoring
    logger.warn("CSP Violation Detected", {
      documentUri: cspReport["document-uri"],
      violatedDirective: cspReport["violated-directive"],
      effectiveDirective: cspReport["effective-directive"],
      blockedUri: cspReport["blocked-uri"],
      sourceFile: cspReport["source-file"],
      lineNumber: cspReport["line-number"],
      columnNumber: cspReport["column-number"],
      scriptSample: cspReport["script-sample"]?.slice(0, 100), // Truncate for logging
      referrer: cspReport["referrer"],
    });

    // Check for potential XSS attempts (suspicious patterns)
    const blockedUri = cspReport["blocked-uri"] || "";
    const scriptSample = cspReport["script-sample"] || "";
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /on\w+\s*=/i, // Event handlers like onclick=
      /<script/i,
      /eval\(/i,
      /document\.(cookie|write)/i,
    ];

    const isSuspicious = suspiciousPatterns.some(
      (pattern) => pattern.test(blockedUri) || pattern.test(scriptSample)
    );

    if (isSuspicious) {
      // Log as security event for potential XSS attack
      logger.error("Potential XSS Attack Blocked by CSP", {
        blockedUri,
        scriptSample: scriptSample.slice(0, 200),
        violatedDirective: cspReport["violated-directive"],
        documentUri: cspReport["document-uri"],
        sourceFile: cspReport["source-file"],
      });

      // Capture in Sentry for alerting
      captureError(new Error("CSP blocked potential XSS attempt"), {
        tags: {
          type: "security",
          category: "csp-violation",
          severity: "high",
        },
        extra: {
          blockedUri,
          scriptSample: scriptSample.slice(0, 500),
          violatedDirective: cspReport["violated-directive"],
          documentUri: cspReport["document-uri"],
        },
      });
    }

    // Return success (browser expects 204 No Content typically, but 200 is fine)
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    // Don't fail loudly - CSP reports should be best-effort
    logger.error("Failed to process CSP report", error as Error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

// Handle OPTIONS for CORS preflight (some browsers send this)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}