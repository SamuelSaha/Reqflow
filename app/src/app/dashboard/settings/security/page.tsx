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
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Shield,
  ShieldCheck,
  ShieldOff,
  Loader2,
  Copy,
  Check,
  Key,
  Plus,
  Trash2,
  Terminal,
} from "lucide-react";
import { trpc } from "@/lib/api/react";
import { toast } from "sonner";

interface MFASetupData {
  qrCodeDataUrl: string;
  secret: string;
  backupCodes: string[];
  mfaEnabled: boolean;
}

export default function SecuritySettingsPage() {
  // ── MFA state ─────────────────────────────────────────────────────────────
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState<MFASetupData | null>(null);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  // ── API key state ──────────────────────────────────────────────────────────
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyExpiry, setNewKeyExpiry] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);

  // ── tRPC ──────────────────────────────────────────────────────────────────
  const apiKeysList = trpc.apiKeys.list.useQuery();
  const utils = trpc.useUtils();

  const createKey = trpc.apiKeys.create.useMutation({
    onSuccess: (data) => {
      setCreatedKey(data.key);
      setNewKeyName("");
      setNewKeyExpiry("");
      utils.apiKeys.list.invalidate();
    },
    onError: (err) => toast.error("Failed to create key", { description: err.message }),
  });

  const revokeKey = trpc.apiKeys.revoke.useMutation({
    onSuccess: () => {
      toast.success("API key revoked");
      setRevokeId(null);
      utils.apiKeys.list.invalidate();
    },
    onError: (err) => toast.error("Failed to revoke key", { description: err.message }),
  });

  // ── MFA helpers ───────────────────────────────────────────────────────────
  useEffect(() => {
    checkMFAStatus();
  }, []);

  async function checkMFAStatus() {
    try {
      const response = await fetch("/api/auth/mfa/setup");
      const data = await response.json();
      setMfaEnabled(data.mfaEnabled || false);
    } catch {
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
      if (!response.ok) { setError(data.error || "Failed to start MFA setup"); return; }
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
        body: JSON.stringify({ code: verificationCode, backupCodes: setupData.backupCodes }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Failed to enable MFA"); return; }
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
    if (!confirm("Are you sure you want to disable two-factor authentication?")) return;
    setSetupLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/mfa/setup", { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to disable MFA");
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
          Manage two-factor authentication and API access
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* ── MFA ─────────────────────────────────────────────────────────────── */}
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
                When enabled, you&apos;ll need to enter a code from your authenticator app when signing in.
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

      {/* ── API Keys ─────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="h-6 w-6 text-slate-500" />
              <div>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Used by the Reqflow CLI and external scripts to authenticate without a browser
                </CardDescription>
              </div>
            </div>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeysList.isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          )}

          {apiKeysList.data && apiKeysList.data.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              <Key className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">No API keys yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Create one to use the Reqflow CLI
              </p>
            </div>
          )}

          {apiKeysList.data && apiKeysList.data.length > 0 && (
            <div className="divide-y">
              {apiKeysList.data.map((key) => {
                const isExpired = key.expiresAt && new Date(key.expiresAt) < new Date();
                return (
                  <div
                    key={key.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">
                          {key.name}
                        </span>
                        {isExpired && (
                          <Badge variant="destructive" className="text-xs">
                            Expired
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                          {key.keyPrefix}…
                        </code>
                        <span>
                          Created {new Date(key.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </span>
                        {key.lastUsedAt ? (
                          <span>
                            Last used {new Date(key.lastUsedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                        ) : (
                          <span className="text-slate-400">Never used</span>
                        )}
                        {key.expiresAt && !isExpired && (
                          <span>
                            Expires {new Date(key.expiresAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setRevokeId(key.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-slate-400 mt-4 pt-4 border-t">
            API keys grant full access to your account. Treat them like passwords — store them securely and never commit them to version control.
          </p>
        </CardContent>
      </Card>

      {/* ── Create key dialog ─────────────────────────────────────────────────── */}
      <Dialog
        open={showCreateDialog && !createdKey}
        onOpenChange={(open) => { if (!open) { setShowCreateDialog(false); setNewKeyName(""); setNewKeyExpiry(""); } }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Give the key a name so you can identify it later (e.g. "My laptop", "CI pipeline").
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Name</Label>
              <Input
                id="key-name"
                placeholder="My laptop"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key-expiry">
                Expiry{" "}
                <span className="text-slate-400 font-normal">(optional — leave blank for no expiry)</span>
              </Label>
              <Input
                id="key-expiry"
                type="date"
                value={newKeyExpiry}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setNewKeyExpiry(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              disabled={!newKeyName.trim() || createKey.isPending}
              onClick={() =>
                createKey.mutate({
                  name: newKeyName.trim(),
                  expiresAt: newKeyExpiry ? new Date(newKeyExpiry).toISOString() : undefined,
                })
              }
            >
              {createKey.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Show key once dialog ──────────────────────────────────────────────── */}
      <Dialog
        open={!!createdKey}
        onOpenChange={(open) => { if (!open) { setCreatedKey(null); setShowCreateDialog(false); setCopiedKey(false); } }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-green-600" />
              API Key Created
            </DialogTitle>
            <DialogDescription>
              Copy this key now — it won&apos;t be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-slate-100 rounded-lg text-sm font-mono break-all">
                {createdKey}
              </code>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() => {
                  if (!createdKey) return;
                  navigator.clipboard.writeText(createdKey);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
              >
                {copiedKey ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>Store this key securely. Once you close this dialog it cannot be retrieved.</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => { setCreatedKey(null); setShowCreateDialog(false); }}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Revoke confirmation ───────────────────────────────────────────────── */}
      <Dialog open={!!revokeId} onOpenChange={(open) => { if (!open) setRevokeId(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              Any scripts or CLI sessions using this key will stop working immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={revokeKey.isPending}
              onClick={() => revokeId && revokeKey.mutate({ id: revokeId })}
            >
              {revokeKey.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Revoke
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MFA setup dialog ─────────────────────────────────────────────────── */}
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
                <img src={setupData.qrCodeDataUrl} alt="2FA QR Code" className="rounded-lg border" />
              </div>
              <div className="space-y-2">
                <Label>Or enter this code manually:</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-slate-100 rounded text-sm font-mono">
                    {setupData.secret}
                  </code>
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(setupData.secret); setCopiedSecret(true); setTimeout(() => setCopiedSecret(false), 2000); }}>
                    {copiedSecret ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
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
            <Button variant="outline" onClick={() => setShowSetupDialog(false)}>Cancel</Button>
            <Button onClick={completeSetup} disabled={verificationCode.length !== 6 || setupLoading}>
              {setupLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Backup codes dialog ───────────────────────────────────────────────── */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Save Your Backup Codes
            </DialogTitle>
            <DialogDescription>
              Store these codes securely. Use them to access your account if you lose your authenticator device.
            </DialogDescription>
          </DialogHeader>
          {setupData && (
            <div className="space-y-4">
              <div className="bg-slate-100 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {setupData.backupCodes.map((code, i) => (
                    <div key={i} className="text-center">{code}</div>
                  ))}
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => { navigator.clipboard.writeText(setupData.backupCodes.join("\n")); setCopiedBackup(true); setTimeout(() => setCopiedBackup(false), 2000); }}>
                {copiedBackup ? <><Check className="mr-2 h-4 w-4" />Copied!</> : <><Copy className="mr-2 h-4 w-4" />Copy All Codes</>}
              </Button>
              <p className="text-xs text-slate-500 text-center">
                Each backup code can only be used once. Store them securely.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowBackupCodes(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
