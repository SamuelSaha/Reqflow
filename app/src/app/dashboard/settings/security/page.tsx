"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Shield,
  ShieldCheck,
  ShieldOff,
  Loader2,
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

export default function SecuritySettingsPage() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState<MFASetupData | null>(null);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkMFAStatus();
  }, []);

  async function checkMFAStatus() {
    try {
      const response = await fetch("/api/auth/mfa/setup");
      const data = await response.json();
      setMfaEnabled(data.mfaEnabled || false);
    } catch {
      // MFA not set up
      setMfaEnabled(false);
    } finally {
      setLoading(false);
    }
  }

  async function startSetup() {
    setSetupLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/mfa/setup");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to start MFA setup");
        setSetupLoading(false);
        return;
      }

      setSetupData(data);
      setShowSetupDialog(true);
    } catch {
      setError("Failed to start MFA setup");
    } finally {
      setSetupLoading(false);
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

      setMfaEnabled(true);
      setShowSetupDialog(false);
      setShowBackupCodes(true);
    } catch {
      setError("Failed to enable MFA");
    } finally {
      setSetupLoading(false);
    }
  }

  async function disableMFA() {
    if (!confirm("Are you sure you want to disable two-factor authentication? This will make your account less secure.")) {
      return;
    }

    setSetupLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/mfa/setup", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to disable MFA");
        setSetupLoading(false);
        return;
      }

      setMfaEnabled(false);
      setSetupData(null);
    } catch {
      setError("Failed to disable MFA");
    } finally {
      setSetupLoading(false);
    }
  }

  function copyBackupCodes() {
    if (!setupData) return;
    navigator.clipboard.writeText(setupData.backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Security Settings</h2>
        <p className="text-slate-600 mt-1">
          Manage two-factor authentication and security preferences
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {mfaEnabled ? (
              <ShieldCheck className="h-6 w-6 text-green-600" />
            ) : (
              <Shield className="h-6 w-6 text-slate-400" />
            )}
            <div>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                {mfaEnabled
                  ? "Your account is protected with 2FA"
                  : "Add an extra layer of security to your account"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {mfaEnabled ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                <ShieldCheck className="h-4 w-4" />
                <span>Two-factor authentication is enabled</span>
              </div>
              <Button
                variant="outline"
                onClick={disableMFA}
                disabled={setupLoading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {setupLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldOff className="mr-2 h-4 w-4" />
                )}
                Disable 2FA
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Two-factor authentication adds an extra layer of security to your account.
                When enabled, you&apos;ll need to enter a code from your authenticator app
                when signing in.
              </p>
              <Button onClick={startSetup} disabled={setupLoading}>
                {setupLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="mr-2 h-4 w-4" />
                )}
                Enable 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </DialogDescription>
          </DialogHeader>

          {setupData && (
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

              {error && (
                <div className="flex items-center gap-2 p-2 text-sm text-red-700 bg-red-50 rounded">
                  <AlertCircle className="h-4 w-4" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSetupDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={completeSetup}
              disabled={verificationCode.length !== 6 || setupLoading}
            >
              {setupLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Save Your Backup Codes
            </DialogTitle>
            <DialogDescription>
              Store these codes securely. You can use them to access your account if you
              lose your authenticator device.
            </DialogDescription>
          </DialogHeader>

          {setupData && (
            <div className="space-y-4">
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
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowBackupCodes(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
