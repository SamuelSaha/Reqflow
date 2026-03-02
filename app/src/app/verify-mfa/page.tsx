"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, Shield } from "lucide-react";

function MFAVerifyForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isBackupCode, setIsBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, isBackupCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid verification code");
        setLoading(false);
        return;
      }

      // Success - redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred. Please try again.";
      setError(message);
      setLoading(false);
    }
  }

  function handleCodeChange(value: string) {
    // Format code input
    if (isBackupCode) {
      // Backup codes are 8 characters, uppercase
      setCode(value.toUpperCase().slice(0, 8));
    } else {
      // TOTP codes are 6 digits only
      setCode(value.replace(/\D/g, "").slice(0, 6));
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
          <div className="flex items-center justify-center mb-2">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-center">Two-Factor Authentication</CardTitle>
          <CardDescription className="text-center">
            {isBackupCode
              ? "Enter one of your backup codes"
              : "Enter the 6-digit code from your authenticator app"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="code">
                {isBackupCode ? "Backup Code" : "Verification Code"}
              </Label>
              <Input
                id="code"
                type="text"
                inputMode={isBackupCode ? "text" : "numeric"}
                placeholder={isBackupCode ? "XXXXXXXX" : "000000"}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                required
                autoComplete="one-time-code"
                disabled={loading}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || code.length < (isBackupCode ? 8 : 6)}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsBackupCode(!isBackupCode);
                  setCode("");
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {isBackupCode
                  ? "Use authenticator code instead"
                  : "Use a backup code instead"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/login" className="text-slate-600 hover:text-slate-700">
              Cancel and return to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyMFAPage() {
  return (
    <Suspense>
      <MFAVerifyForm />
    </Suspense>
  );
}
