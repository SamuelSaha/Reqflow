"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, AlertCircle, CheckCircle } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResend() {
    if (!email) {
      setError("Email address not found. Please log in again.");
      return;
    }

    setResending(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to resend verification email");
        setResending(false);
        return;
      }

      setResent(true);
      setResending(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred. Please try again.";
      setError(message);
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Link href="/" className="text-2xl font-bold text-slate-900">
              Reqflow
            </Link>
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Verify your email</CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {email && (
            <p className="text-center text-sm text-slate-600">
              Click the link in the email sent to{" "}
              <strong className="text-slate-900">{email}</strong>
            </p>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {resent && (
            <div className="flex items-center gap-2 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <p>Verification email sent! Check your inbox.</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleResend}
              variant="outline"
              className="w-full"
              disabled={resending || resent}
            >
              {resending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {resent ? "Email sent" : "Resend verification email"}
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push("/login")}
            >
              Back to login
            </Button>
          </div>

          <p className="text-xs text-center text-slate-500">
            Didn&apos;t receive the email? Check your spam folder or try resending.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
