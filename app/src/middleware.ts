/**
 * Next.js middleware for route protection
 * Enforces authentication on protected routes
 * Gates unonboarded users to the onboarding wizard
 * Gates unverified users from sensitive operations
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth/simple-auth";

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

// Routes that require MFA for finance/admin roles (high-privilege operations)
const mfaRequiredRoutes = [
  "/dashboard/settings",
  "/dashboard/users",
  "/dashboard/vendors",
  "/dashboard/integrations",
];

// Routes exempt from MFA requirement (allow access but show reminder)
const mfaExemptRoutes = ["/dashboard/settings/security"];

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
  "/verify-email",
  "/api/auth", // Auth API routes
  "/api/webhooks", // Webhook integrations (Slack, QuickBooks, etc.)
  "/api/trpc", // tRPC routes handle their own auth via protectedProcedure
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes (exact match or starts with for paths like /api/auth)
  const isPublicRoute = publicRoutes.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(route);
  });

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check session
  const token = request.cookies.get("reqflow_session")?.value;
  const session = token ? await verifySession(token) : null;
  const isAuthenticated = !!session;

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    // Allow auth routes for unauthenticated users
    if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
      return NextResponse.next();
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    const dest = session.onboardingCompleted ? "/dashboard" : "/onboarding";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Onboarding gate: redirect unonboarded users to /onboarding
  if (!session.onboardingCompleted && !pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Redirect completed users away from /onboarding
  if (session.onboardingCompleted && pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 🔒 SECURITY: Email verification gate for sensitive routes (DISABLED — /verify-email page not built yet)
  // TODO: Re-enable once the /verify-email page and email verification flow are implemented
  // Users without verified email will be blocked from:
  //   verificationRequiredRoutes: /dashboard/requests/new, /dashboard/approvals, /dashboard/budgets,
  //   /dashboard/settings, /dashboard/users, /dashboard/vendors, /dashboard/contracts, /dashboard/integrations

  // 🔒 SECURITY: MFA gate for high-privilege routes (DISABLED — /verify-mfa page not built yet)
  // TODO: Re-enable once MFA verification page and TOTP enrollment are implemented
  // Finance and Admin roles will require MFA for sensitive operations:
  //   mfaRequiredRoutes: /dashboard/settings, /dashboard/users, /dashboard/vendors, /dashboard/integrations
  //   mfaExemptRoutes: /dashboard/settings/security

  return NextResponse.next();
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
