"use client";

/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { captureError } from "@/lib/monitoring/sentry";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Send to Sentry in all environments
    captureError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error Boundary caught error", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

/**
 * Default Error Fallback UI
 */
function ErrorFallback({ error }: { error: Error | null }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            An unexpected error occurred. Please try refreshing the page.
          </p>

          {process.env.NODE_ENV === "development" && error && (
            <div className="rounded-md bg-slate-50 p-3 border border-slate-200">
              <p className="text-xs font-mono text-slate-700 break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Refresh page
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/dashboard")}
              className="flex-1"
            >
              Go to dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
