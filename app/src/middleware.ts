/**
 * Next.js middleware for route protection
 * Enforces authentication on protected routes
 * Gates unonboarded users to the onboarding wizard
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth/simple-auth";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/onboarding"];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/signup"];

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

  // Protect dashboard and onboarding routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Onboarding gate: redirect unonboarded users to /onboarding
    if (
      !session.onboardingCompleted &&
      !pathname.startsWith("/onboarding")
    ) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // Redirect completed users away from /onboarding
    if (
      session.onboardingCompleted &&
      pathname.startsWith("/onboarding")
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated) {
      const dest = session.onboardingCompleted ? "/dashboard" : "/onboarding";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

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
