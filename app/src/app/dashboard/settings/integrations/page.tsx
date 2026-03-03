"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/api/react";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Clock,
  AlertTriangle,
  Sparkles,
  Terminal,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const dynamic = "force-dynamic";

type Provider = "quickbooks" | "xero";

const providerConfig = {
  quickbooks: {
    name: "QuickBooks",
    logo: "💚",
    description: "Sync purchase orders to QuickBooks",
    color: "green",
  },
  xero: {
    name: "Xero",
    logo: "💙",
    description: "Sync purchase orders to Xero",
    color: "blue",
  },
};

export default function IntegrationsPage() {
  const [disconnectDialog, setDisconnectDialog] = useState<{
    open: boolean;
    provider: Provider | null;
  }>({ open: false, provider: null });
  const [logsDialog, setLogsDialog] = useState<{
    open: boolean;
    provider: Provider | null;
  }>({ open: false, provider: null });
  const [copiedConfig, setCopiedConfig] = useState(false);

  const integrationsList = trpc.integrations.list.useQuery();
  const syncLogs = trpc.integrations.getSyncLogs.useQuery(
    {
      provider: logsDialog.provider || undefined,
      limit: 20,
    },
    {
      enabled: logsDialog.open && !!logsDialog.provider,
    }
  );
  const utils = trpc.useUtils();

  const disconnect = trpc.integrations.disconnect.useMutation({
    onMutate: () => {
      toast.loading("Disconnecting...", { id: "disconnect" });
    },
    onSuccess: () => {
      toast.success("Integration disconnected", {
        id: "disconnect",
        description: "Automatic syncing has been stopped",
      });
      utils.integrations.list.invalidate();
      setDisconnectDialog({ open: false, provider: null });
    },
    onError: (error) => {
      toast.error("Failed to disconnect", {
        id: "disconnect",
        description: error.message,
      });
    },
  });

  const toggleAutoSync = trpc.integrations.toggleAutoSync.useMutation({
    onMutate: () => {
      toast.loading("Updating settings...", { id: "toggle-sync" });
    },
    onSuccess: (data) => {
      toast.success(data.autoSync ? "Auto-sync enabled" : "Auto-sync disabled", {
        id: "toggle-sync",
        description: data.autoSync
          ? "Approved requests will automatically sync to accounting"
          : "You'll need to manually sync approved requests",
      });
      utils.integrations.list.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to update settings", {
        id: "toggle-sync",
        description: error.message,
      });
    },
  });

  const connectUrlQuery = trpc.integrations.getConnectUrl.useQuery;

  function handleConnect(provider: Provider) {
    // Open OAuth flow in new window
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      `/api/integrations/${provider}/connect`,
      `${provider}_oauth`,
      `width=${width},height=${height},left=${left},top=${top}`
    );
  }

  function handleDisconnect(provider: Provider) {
    setDisconnectDialog({ open: true, provider });
  }

  function confirmDisconnect() {
    if (!disconnectDialog.provider) return;
    disconnect.mutate({ provider: disconnectDialog.provider });
  }

  function handleViewLogs(provider: Provider) {
    setLogsDialog({ open: true, provider });
  }

  type Integration = NonNullable<typeof integrationsList.data>[0];
  const connectedIntegrations =
    integrationsList.data?.reduce(
      (acc, integration) => {
        acc[integration.provider as Provider] = integration;
        return acc;
      },
      {} as Record<Provider, Integration | undefined>
    ) || ({} as Record<Provider, Integration | undefined>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Accounting Integrations
        </h2>
        <p className="text-slate-600 mt-1">
          Connect QuickBooks or Xero to automatically sync purchase orders
        </p>
      </div>

      {integrationsList.isLoading && (
        <div className="grid md:grid-cols-2 gap-6">
          {["quickbooks", "xero"].map((provider) => (
            <Card key={provider} className="animate-pulse">
              <CardContent className="p-8">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-slate-100 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {integrationsList.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">
              Failed to load integrations
            </p>
            <p className="text-slate-600 text-sm">
              {integrationsList.error.message}
            </p>
          </CardContent>
        </Card>
      )}

      {integrationsList.data && (
        <div className="grid md:grid-cols-2 gap-6">
          {(["quickbooks", "xero"] as Provider[]).map((provider) => {
            const config = providerConfig[provider];
            const integration = connectedIntegrations[provider];
            const isConnected = !!integration && integration.isActive;

            return (
              <Card key={provider} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{config.logo}</span>
                      <div>
                        <CardTitle className="text-xl">{config.name}</CardTitle>
                        <p className="text-sm text-slate-600 mt-1">
                          {config.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Connection Status */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {isConnected ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              Connected
                            </p>
                            {integration.providerAccountName && (
                              <p className="text-xs text-slate-600">
                                {integration.providerAccountName}
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-slate-400" />
                          <p className="text-sm text-slate-600">
                            Not connected
                          </p>
                        </>
                      )}
                    </div>

                    {isConnected && (
                      <Badge
                        variant={integration.autoSync ? "default" : "secondary"}
                      >
                        {integration.autoSync ? "Auto-sync ON" : "Auto-sync OFF"}
                      </Badge>
                    )}
                  </div>

                  {/* Last Sync Status */}
                  {isConnected && integration.lastSyncedAt && (
                    <div className="flex items-start gap-2 text-sm">
                      <Clock className="h-4 w-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-slate-600">
                          Last synced:{" "}
                          {new Date(
                            integration.lastSyncedAt
                          ).toLocaleString()}
                        </p>
                        {integration.lastSyncError && (
                          <p className="text-red-600 text-xs mt-1 flex items-start gap-1">
                            <AlertTriangle className="h-3 w-3 mt-0.5" />
                            {integration.lastSyncError}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    {!isConnected ? (
                      <Button
                        className="w-full"
                        onClick={() => handleConnect(provider)}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Connect {config.name}
                      </Button>
                    ) : (
                      <>
                        {/* Auto-sync Toggle */}
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">
                              Auto-sync on approval
                            </p>
                            <p className="text-xs text-slate-600">
                              Automatically create POs when requests are approved
                            </p>
                          </div>
                          <Switch
                            checked={integration.autoSync}
                            onCheckedChange={(checked) =>
                              toggleAutoSync.mutate({
                                provider,
                                autoSync: checked,
                              })
                            }
                          />
                        </div>

                        {/* View Logs & Disconnect */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleViewLogs(provider)}
                          >
                            <RefreshCw className="mr-2 h-3.5 w-3.5" />
                            View Logs
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDisconnect(provider)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* AI Integration Section */}
      <div className="mt-12">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            AI Integration (MCP Server)
          </h2>
          <p className="text-slate-600 mt-1">
            Use Claude Desktop, Cursor, or other MCP clients to manage procurement through natural language
          </p>
        </div>

        <Card className="mt-6 border-violet-200 bg-gradient-to-br from-violet-50 to-blue-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Sparkles className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Model Context Protocol</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    Expose procurement workflows to AI assistants
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Features */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <h4 className="font-medium text-sm text-slate-900 mb-2">Available Tools</h4>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Create & submit purchase requests</li>
                  <li>• Approve/reject from anywhere (Slack, voice)</li>
                  <li>• Search requests & subscriptions</li>
                  <li>• Get spend analytics & budget status</li>
                </ul>
              </div>
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <h4 className="font-medium text-sm text-slate-900 mb-2">Compatible With</h4>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Claude Desktop (recommended)</li>
                  <li>• Cursor IDE</li>
                  <li>• Any MCP-compatible client</li>
                  <li>• Custom integrations via stdio</li>
                </ul>
              </div>
            </div>

            {/* Setup Instructions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-slate-600" />
                <h4 className="font-medium text-sm text-slate-900">
                  Claude Desktop Setup
                </h4>
              </div>

              <div className="bg-slate-900 rounded-lg p-4 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-slate-400 hover:text-white"
                  onClick={() => {
                    const config = `{
  "mcpServers": {
    "reqflow": {
      "command": "npx",
      "args": ["tsx", "src/mcp/server.ts"],
      "cwd": "/path/to/Reqflow/app",
      "env": {
        "DATABASE_URL": "your-database-url",
        "REQFLOW_USER_EMAIL": "your-email@company.com"
      }
    }
  }
}`;
                    navigator.clipboard.writeText(config);
                    setCopiedConfig(true);
                    setTimeout(() => setCopiedConfig(false), 2000);
                    toast.success("Config copied to clipboard");
                  }}
                >
                  {copiedConfig ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <pre className="text-xs text-slate-300 overflow-x-auto">
                  <code>{`{
  "mcpServers": {
    "reqflow": {
      "command": "npx",
      "args": ["tsx", "src/mcp/server.ts"],
      "cwd": "/path/to/Reqflow/app",
      "env": {
        "DATABASE_URL": "your-database-url",
        "REQFLOW_USER_EMAIL": "your-email@company.com"
      }
    }
  }
}`}</code>
                </pre>
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-900">
                  <p className="font-medium mb-1">Configuration file location:</p>
                  <p className="text-blue-700">
                    macOS: <code className="bg-blue-100 px-1 py-0.5 rounded">~/Library/Application Support/Claude/claude_desktop_config.json</code>
                  </p>
                  <p className="text-blue-700 mt-1">
                    Windows: <code className="bg-blue-100 px-1 py-0.5 rounded">%APPDATA%/Claude/claude_desktop_config.json</code>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-violet-50 border border-violet-200 rounded-lg">
                <Sparkles className="h-4 w-4 text-violet-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-violet-900">
                  <p className="font-medium mb-1">Example conversation:</p>
                  <p className="text-violet-700 italic">
                    "Show me pending approvals" → "Approve the GitHub Copilot request" → "What's our SaaS spend this quarter?"
                  </p>
                </div>
              </div>
            </div>

            {/* Documentation Link */}
            <div className="pt-4 border-t">
              <span className="text-sm text-slate-400 inline-flex items-center gap-1">
                Full documentation coming soon
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disconnect Confirmation Dialog */}
      <Dialog
        open={disconnectDialog.open}
        onOpenChange={(open: boolean) =>
          !open && setDisconnectDialog({ open: false, provider: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Integration</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect{" "}
              {disconnectDialog.provider &&
                providerConfig[disconnectDialog.provider].name}
              ? This will stop all automatic syncing.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDisconnectDialog({ open: false, provider: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDisconnect}
              disabled={disconnect.isPending}
            >
              {disconnect.isPending ? "Disconnecting..." : "Disconnect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sync Logs Dialog */}
      <Dialog
        open={logsDialog.open}
        onOpenChange={(open: boolean) =>
          !open && setLogsDialog({ open: false, provider: null })
        }
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Sync Logs -{" "}
              {logsDialog.provider && providerConfig[logsDialog.provider].name}
            </DialogTitle>
            <DialogDescription>
              Recent synchronization attempts and results
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {syncLogs.isLoading && (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-slate-100 rounded animate-pulse"
                  ></div>
                ))}
              </div>
            )}

            {syncLogs.data && syncLogs.data.length === 0 && (
              <div className="text-center py-12 text-slate-600">
                <RefreshCw className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p>No sync attempts yet</p>
              </div>
            )}

            {syncLogs.data &&
              syncLogs.data.map((log) => (
                <Card
                  key={log.id}
                  className={
                    log.success
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {log.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium text-sm">
                          {log.action.replace(/_/g, " ").toUpperCase()}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {log.entityType}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-600">
                        {new Date(log.syncedAt).toLocaleString()}
                      </span>
                    </div>

                    {log.providerReference && (
                      <p className="text-sm text-slate-700 mb-1">
                        PO Reference: <code>{log.providerReference}</code>
                      </p>
                    )}

                    {log.errorMessage && (
                      <p className="text-sm text-red-700 mt-2">
                        Error: {log.errorMessage}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
