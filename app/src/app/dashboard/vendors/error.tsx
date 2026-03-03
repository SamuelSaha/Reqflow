"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

export default function VendorsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, { extra: { digest: error.digest } });
  }, [error]);

  return (
    <div className="flex items-center justify-center py-16">
      <Card className="max-w-md w-full">
        <CardContent className="pt-10 pb-8">
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Failed to load vendors</h2>
              <p className="text-sm text-slate-600">
                An error occurred while loading this page.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={reset} size="sm">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
