/**
 * Next.js middleware for route protection
 * Enforces authentication on protected routes
 * Gates unonboarded users to the onboarding wizard
 * Gates unverified users from sensitive operations
 * 🔒 SECURITY (issue #115): CSP with nonces for XSS protection
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth/simple-auth";
import { generateNonce, buildCSP, NONCE_HEADER } from "@/lib/security/csp";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/onboarding"];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/signup"];

// Routes that require email verification (sensitive operations)
const verificationRequiredRoutes = [
  "/dashboard/requests/new",
  "/dashboard/requests/create",
  "/dashboard/approvals",
  "/dashboard/budgets",
  "/dashboard/settings",
  "/dashboard/users",
  "/dashboard/vendors",
  "/dashboard/contracts",
  "/dashboard/integrations",
];

// Routes that require MFA verification (for users with MFA enabled)
const mfaVerifyRoutes = [
  "/dashboard/settings",
  "/dashboard/users",
  "/dashboard/vendors",
  "/dashboard/integrations",
];

// Routes exempt from MFA verification requirement (but still accessible for MFA setup)
// /onboarding must be exempt so finance/admin users can complete onboarding before setting up MFA
const mfaExemptRoutes = ["/dashboard/settings/security", "/setup-mfa", "/verify-mfa", "/onboarding"];

// Roles that require MFA to be enabled
const mfaRequiredRoles = ["finance", "admin"];

// Public routes (accessible to everyone)
const publicRoutes = [
  "/",
  "/about",
  "/pricing",
  "/features",
  "/beta",
  "/privacy",
  "/terms",
  "/security",
  "/contact",
  "/blog",
  "/changelog",
  "/careers",
  "/status",
  "/integrations",
  "/documentation",
  "/case-studies",
  "/api-reference",
  "/cookies",
  "/support",
  "/verify-email",
  "/api/auth", // Auth API routes
  "/api/webhooks", // Webhook integrations (Slack, QuickBooks, etc.)
  "/api/trpc", // tRPC routes handle their own auth via protectedProcedure
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🔒 SECURITY (issue #115): Generate CSP nonce for each request
  const nonce = generateNonce();
  const isDev = process.env.NODE_ENV === "development";

  // Helper to add CSP headers to any response
  const withCSP = (response: NextResponse) => {
    // Set nonce as request header so server components can access it
    response.headers.set(NONCE_HEADER, nonce);
    // Set CSP header
    response.headers.set("Content-Security-Policy", buildCSP(nonce, isDev));
    return response;
  };

  // Allow public routes (exact match or starts with for paths like /api/auth)
  const isPublicRoute = publicRoutes.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(route);
  });

  if (isPublicRoute) {
    return withCSP(NextResponse.next());
  }

  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return withCSP(NextResponse.next());
  }

  // Check session
  const token = request.cookies.get("reqflow_session")?.value;
  const session = token ? await verifySession(token) : null;
  const isAuthenticated = !!session;

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    // Allow auth routes for unauthenticated users
    if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
      return withCSP(NextResponse.next());
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return withCSP(NextResponse.redirect(loginUrl));
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    const dest = session.onboardingCompleted ? "/dashboard" : "/onboarding";
    return withCSP(NextResponse.redirect(new URL(dest, request.url)));
  }

  // Onboarding gate: redirect unonboarded users to /onboarding
  // Exempt MFA routes so finance/admin can set up MFA even if onboarding isn't complete
  const isMfaFlowRoute = pathname.startsWith("/setup-mfa") || pathname.startsWith("/verify-mfa");
  if (!session.onboardingCompleted && !pathname.startsWith("/onboarding") && !isMfaFlowRoute) {
    return withCSP(NextResponse.redirect(new URL("/onboarding", request.url)));
  }

  // Redirect completed users away from /onboarding
  if (session.onboardingCompleted && pathname.startsWith("/onboarding")) {
    return withCSP(NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  // 🔒 SECURITY (issue #120): Email verification gate for sensitive routes
  // Users without verified email are blocked from creating requests, approvals, budgets, etc.
  const requiresVerification = verificationRequiredRoutes.some(route =>
    pathname.startsWith(route)
  );

  // session.emailVerified can be undefined on old tokens (before the field was added to the payload).
  // Treat undefined as "verified" for backward compatibility; only block when explicitly false.
  if (requiresVerification && session.emailVerified === false) {
    const verifyUrl = new URL("/verify-email", request.url);
    verifyUrl.searchParams.set("email", session.email || "");
    return withCSP(NextResponse.redirect(verifyUrl));
  }

  // 🔒 SECURITY (issue #121): MFA enforcement for Finance/Admin roles
  // 1. Finance/Admin users MUST have MFA enabled - redirect to /setup-mfa if not
  // 2. Users with MFA enabled must verify on sensitive routes

  const requiresMfaRole = mfaRequiredRoles.includes(session.role);
  const isMfaExemptRoute = mfaExemptRoutes.some(route => pathname.startsWith(route));
  const isMfaVerifyRoute = mfaVerifyRoutes.some(route => pathname.startsWith(route));

  // Finance/Admin without MFA enabled must set it up first
  if (requiresMfaRole && !session.mfaEnabled && !isMfaExemptRoute) {
    const setupUrl = new URL("/setup-mfa", request.url);
    return withCSP(NextResponse.redirect(setupUrl));
  }

  // Users with MFA enabled need to verify on sensitive routes (unless already verified this session)
  if (session.mfaEnabled && isMfaVerifyRoute && !isMfaExemptRoute && !session.mfaVerified) {
    const verifyUrl = new URL("/verify-mfa", request.url);
    verifyUrl.searchParams.set("redirect", pathname);
    return withCSP(NextResponse.redirect(verifyUrl));
  }

  return withCSP(NextResponse.next());
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
