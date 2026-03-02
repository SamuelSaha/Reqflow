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
import type { AiProvider } from "@/lib/api/routers/ai";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PROVIDERS: {
  id: AiProvider;
  label: string;
  description: string;
  keyHint: string;
  keyPrefix?: string;
  docsUrl: string;
}[] = [
  {
    id: "anthropic",
    label: "Claude",
    description: "Best reasoning, nuanced analysis",
    keyHint: "sk-ant-api03-...",
    keyPrefix: "sk-ant-",
    docsUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "openai",
    label: "GPT",
    description: "GPT-4o mini — fast, widely trusted",
    keyHint: "sk-proj-...",
    keyPrefix: "sk-",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "gemini",
    label: "Gemini",
    description: "Gemini 1.5 Flash — cost-efficient",
    keyHint: "AIzaSy...",
    docsUrl: "https://aistudio.google.com/app/apikey",
  },
];

export default function AiSettingsPage() {
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>("anthropic");
  const [keyInput, setKeyInput] = useState("");
  const utils = trpc.useUtils();

  const { data: status, isLoading } = trpc.ai.status.useQuery();

  const saveKey = trpc.ai.saveKey.useMutation({
    onSuccess: () => {
      toast.success("API key saved", {
        description: `${PROVIDERS.find((p) => p.id === selectedProvider)?.label} AI is now enabled.`,
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
      toast.success("API key removed", { description: "AI analysis has been disabled." });
      utils.ai.status.invalidate();
    },
    onError: (err) => {
      toast.error("Failed to remove key", { description: err.message });
    },
  });

  const configured = status?.configured ?? false;
  const activeProvider = PROVIDERS.find((p) => p.id === (status?.provider ?? "anthropic"));
  const inputProvider = PROVIDERS.find((p) => p.id === selectedProvider)!;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900">AI Integration</h2>
        <p className="text-sm text-slate-600 mt-1">
          Connect an AI provider to enable instant risk assessment on purchase requests.
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600" />
              AI Status
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
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {activeProvider?.label} active
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not configured
                  </>
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

      {/* Provider + Key Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4" />
            {configured ? "Change Provider / Key" : "Choose a Provider"}
          </CardTitle>
          <CardDescription>
            Your API key is encrypted at rest with AES-256-GCM and never returned to the browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {configured && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800">
                  {activeProvider?.label} API key configured
                </p>
                <p className="text-xs text-green-700 mt-0.5">
                  Stored securely. Switch providers below to replace it.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 flex-shrink-0"
                onClick={() => removeKey.mutate()}
                disabled={removeKey.isPending}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                {removeKey.isPending ? "Removing…" : "Remove"}
              </Button>
            </div>
          )}

          {/* Provider selector */}
          <div className="space-y-2">
            <Label>Provider</Label>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => { setSelectedProvider(provider.id); setKeyInput(""); }}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-colors",
                    selectedProvider === provider.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <p className={cn(
                    "text-sm font-semibold",
                    selectedProvider === provider.id ? "text-blue-700" : "text-slate-800"
                  )}>
                    {provider.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-tight">
                    {provider.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Key input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="api-key">{inputProvider.label} API Key</Label>
              <a
                href={inputProvider.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 inline-flex items-center gap-0.5"
              >
                Get key <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <Input
              id="api-key"
              type="password"
              placeholder={inputProvider.keyHint}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="font-mono"
            />
            {inputProvider.keyPrefix && (
              <p className="text-xs text-slate-500">
                Must start with{" "}
                <code className="bg-slate-100 px-1 rounded">{inputProvider.keyPrefix}</code>
              </p>
            )}
          </div>

          <Button
            onClick={() => saveKey.mutate({ provider: selectedProvider, key: keyInput })}
            disabled={!keyInput.trim() || saveKey.isPending}
            className="w-full sm:w-auto"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {saveKey.isPending
              ? "Validating & saving…"
              : configured
              ? `Switch to ${inputProvider.label}`
              : `Enable ${inputProvider.label} AI`}
          </Button>
        </CardContent>
      </Card>

      {/* What it does */}
      <Card className="bg-violet-50 border-violet-200">
        <CardHeader>
          <CardTitle className="text-base text-violet-900">What AI analysis does</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-violet-800">
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-violet-600 flex-shrink-0" />
              <span>Rates each request as <strong>low, medium, or high risk</strong> based on amount, vendor, and justification quality</span>
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
            Supports Claude (Anthropic), GPT-4o mini (OpenAI), and Gemini 1.5 Flash (Google).
            Billed directly to your provider account at standard API rates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
