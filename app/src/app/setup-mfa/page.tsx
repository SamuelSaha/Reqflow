"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  AlertCircle,
  Shield,
  ShieldAlert,
  Copy,
  Check,
  Key,
} from "lucide-react";

interface MFASetupData {
  qrCodeDataUrl: string;
  secret: string;
  backupCodes: string[];
  mfaEnabled: boolean;
}

function MFASetupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState<MFASetupData | null>(null);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    startSetup();
  }, []);

  async function startSetup() {
    setSetupLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/mfa/setup");
      const data = await response.json();

      if (!response.ok) {
        if (data.mfaEnabled) {
          // Already enabled, redirect to dashboard
          router.push("/dashboard");
          return;
        }
        setError(data.error || "Failed to start MFA setup");
        setSetupLoading(false);
        setLoading(false);
        return;
      }

      setSetupData(data);
    } catch {
      setError("Failed to start MFA setup");
    } finally {
      setSetupLoading(false);
      setLoading(false);
    }
  }

  async function completeSetup() {
    if (!setupData || verificationCode.length !== 6) return;

    setSetupLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/mfa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: verificationCode,
          backupCodes: setupData.backupCodes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to enable MFA");
        setSetupLoading(false);
        return;
      }

      setShowBackupCodes(true);
    } catch {
      setError("Failed to enable MFA");
    } finally {
      setSetupLoading(false);
    }
  }

  function finishSetup() {
    router.push("/dashboard");
    router.refresh();
  }

  function copyBackupCodes() {
    if (!setupData) return;
    navigator.clipboard.writeText(setupData.backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (showBackupCodes && setupData) {
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
              <Key className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-center">Save Your Backup Codes</CardTitle>
            <CardDescription className="text-center">
              Store these codes securely. You can use them to access your account if you
              lose your authenticator device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-100 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {setupData.backupCodes.map((code, i) => (
                  <div key={i} className="text-center">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={copyBackupCodes}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy All Codes
                </>
              )}
            </Button>

            <p className="text-xs text-slate-500 text-center">
              Each backup code can only be used once. Store them securely.
            </p>

            <Button onClick={finishSetup} className="w-full">
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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
            <ShieldAlert className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-2xl text-center">Two-Factor Authentication Required</CardTitle>
          <CardDescription className="text-center">
            Your role requires two-factor authentication for security. Please set it up to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {setupData ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={setupData.qrCodeDataUrl}
                  alt="2FA QR Code"
                  className="rounded-lg border"
                />
              </div>

              <div className="space-y-2">
                <Label>Or enter this code manually:</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-slate-100 rounded text-sm font-mono">
                    {setupData.secret}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(setupData.secret);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-code">Enter verification code</Label>
                <Input
                  id="verification-code"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="text-center text-xl tracking-widest font-mono"
                />
              </div>

              <Button
                onClick={completeSetup}
                disabled={verificationCode.length !== 6 || setupLoading}
                className="w-full"
              >
                {setupLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Enable 2FA
              </Button>
            </div>
          ) : (
            <Button onClick={startSetup} disabled={setupLoading} className="w-full">
              {setupLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Setup
            </Button>
          )}

          <div className="mt-6 text-center text-sm">
            <p className="text-slate-500">
              Need help? Contact your administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SetupMFAPage() {
  return (
    <Suspense>
      <MFASetupForm />
    </Suspense>
  );
}
