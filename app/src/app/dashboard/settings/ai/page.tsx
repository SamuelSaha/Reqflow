"use client";

import { useState } from "react";
import { trpc } from "@/lib/api/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Key, Trash2, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

export default function AiSettingsPage() {
  const [keyInput, setKeyInput] = useState("");
  const utils = trpc.useUtils();

  const { data: status, isLoading } = trpc.ai.status.useQuery();

  const saveKey = trpc.ai.saveKey.useMutation({
    onSuccess: () => {
      toast.success("API key saved", {
        description: "Claude AI is now enabled for your organization.",
      });
      setKeyInput("");
      utils.ai.status.invalidate();
    },
    onError: (err) => {
      toast.error("Failed to save key", { description: err.message });
    },
  });

  const removeKey = trpc.ai.removeKey.useMutation({
    onSuccess: () => {
      toast.success("API key removed", {
        description: "Claude AI has been disabled for your organization.",
      });
      utils.ai.status.invalidate();
    },
    onError: (err) => {
      toast.error("Failed to remove key", { description: err.message });
    },
  });

  const configured = status?.configured ?? false;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900">AI Integration</h2>
        <p className="text-sm text-slate-600 mt-1">
          Connect your Anthropic API key to enable AI-powered purchase request analysis.
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600" />
              Claude AI Status
            </CardTitle>
            {!isLoading && (
              <Badge
                className={
                  configured
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }
              >
                {configured ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" /> Configured</>
                ) : (
                  <><AlertCircle className="h-3 w-3 mr-1" /> Not configured</>
                )}
              </Badge>
            )}
          </div>
          <CardDescription>
            AI analysis gives approvers instant risk assessments, concerns, and suggested questions
            for each purchase request.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Key Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4" />
            Anthropic API Key
          </CardTitle>
          <CardDescription>
            Your API key is encrypted at rest with AES-256-GCM and never returned to the browser.
            Get your key from the{" "}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-0.5"
            >
              Anthropic Console
              <ExternalLink className="h-3 w-3" />
            </a>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {configured ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800">API key configured</p>
                  <p className="text-xs text-green-700 mt-0.5">
                    Your key is stored securely and never shown again.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-key">Replace with a new key</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-key"
                    type="password"
                    placeholder="sk-ant-..."
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    className="font-mono"
                  />
                  <Button
                    onClick={() => saveKey.mutate({ key: keyInput })}
                    disabled={!keyInput.trim() || saveKey.isPending}
                  >
                    {saveKey.isPending ? "Saving..." : "Replace"}
                  </Button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={() => removeKey.mutate()}
                  disabled={removeKey.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  {removeKey.isPending ? "Removing..." : "Remove API key"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-ant-api03-..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-slate-500">
                  Must start with <code className="bg-slate-100 px-1 rounded">sk-ant-</code>
                </p>
              </div>
              <Button
                onClick={() => saveKey.mutate({ key: keyInput })}
                disabled={!keyInput.trim() || saveKey.isPending}
                className="w-full sm:w-auto"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {saveKey.isPending ? "Validating & saving..." : "Enable AI analysis"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* What it does Card */}
      <Card className="bg-violet-50 border-violet-200">
        <CardHeader>
          <CardTitle className="text-base text-violet-900">What AI analysis does</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-violet-800">
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-violet-600 flex-shrink-0" />
              <span>Rates each request as <strong>low, medium, or high</strong> risk based on amount, vendor, and justification quality</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-violet-600 flex-shrink-0" />
              <span>Recommends whether to <strong>approve, review, or flag</strong> the request</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-violet-600 flex-shrink-0" />
              <span>Surfaces <strong>specific concerns</strong> and suggested questions for approvers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-violet-600 flex-shrink-0" />
              <span>Adds <strong>market insights</strong> — pricing benchmarks, vendor reputation, alternatives</span>
            </li>
          </ul>
          <p className="text-xs text-violet-700 mt-4">
            Powered by Claude claude-haiku-4-5-20251001. Billed directly to your Anthropic account at standard API rates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
