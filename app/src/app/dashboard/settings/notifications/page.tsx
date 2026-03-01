"use client";

import { useState } from "react";
import { Bell, Mail, MessageSquare, Save } from "lucide-react";
import { trpc } from "@/lib/api/react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type NotificationChannel = "email" | "inApp" | "slack";

interface NotificationPreference {
  email: boolean;
  inApp: boolean;
  slack: boolean;
}

interface NotificationPreferences {
  approval_assigned?: NotificationPreference;
  request_approved?: NotificationPreference;
  request_rejected?: NotificationPreference;
  budget_warning?: NotificationPreference;
  trial_expiring?: NotificationPreference;
  renewal_due?: NotificationPreference;
}

const notificationTypes = [
  {
    key: "approval_assigned",
    label: "Approval Assigned",
    description: "When you're assigned to approve a request",
  },
  {
    key: "request_approved",
    label: "Request Approved",
    description: "When your request is approved",
  },
  {
    key: "request_rejected",
    label: "Request Rejected",
    description: "When your request is rejected",
  },
  {
    key: "budget_warning",
    label: "Budget Warning",
    description: "When a budget is running low",
  },
  {
    key: "trial_expiring",
    label: "Trial Expiring",
    description: "When a trial is about to expire",
  },
  {
    key: "renewal_due",
    label: "Renewal Due",
    description: "When a subscription renewal is coming up",
  },
] as const;

const channels: Array<{
  key: NotificationChannel;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: "email", label: "Email", icon: Mail },
  { key: "inApp", label: "In-App", icon: Bell },
  { key: "slack", label: "Slack", icon: MessageSquare },
];

export default function NotificationPreferencesPage() {
  // Fetch current preferences
  const { data: preferences, isLoading } = trpc.notifications.getPreferences.useQuery();
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences>({});

  // Update preferences mutation
  const updatePrefs = trpc.notifications.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Notification preferences saved");
    },
    onError: (error) => {
      toast.error(`Failed to save preferences: ${error.message}`);
    },
  });

  // Initialize local state when data loads
  if (preferences && Object.keys(localPrefs).length === 0) {
    setLocalPrefs(preferences);
  }

  const handleToggle = (
    type: keyof NotificationPreferences,
    channel: NotificationChannel,
    value: boolean
  ) => {
    setLocalPrefs((prev) => ({
      ...prev,
      [type]: {
        ...(prev[type] || { email: true, inApp: true, slack: false }),
        [channel]: value,
      },
    }));
  };

  const handleSave = () => {
    updatePrefs.mutate({ preferences: localPrefs });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Notification Preferences
            </h1>
            <p className="text-sm text-slate-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Notification Preferences
            </h1>
            <p className="text-sm text-slate-600">
              Choose how you want to be notified
            </p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={updatePrefs.isPending}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {updatePrefs.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Preferences Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Notification Type
                </th>
                {channels.map((channel) => (
                  <th
                    key={channel.key}
                    className="px-6 py-3 text-center text-xs font-semibold text-slate-900 uppercase tracking-wider"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <channel.icon className="h-4 w-4" />
                      {channel.label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {notificationTypes.map((type) => {
                const prefs = localPrefs[type.key] || {
                  email: true,
                  inApp: true,
                  slack: false,
                };

                return (
                  <tr key={type.key} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {type.label}
                        </p>
                        <p className="text-sm text-slate-500">
                          {type.description}
                        </p>
                      </div>
                    </td>
                    {channels.map((channel) => (
                      <td key={channel.key} className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={prefs[channel.key]}
                            onCheckedChange={(value) =>
                              handleToggle(type.key, channel.key, value)
                            }
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Bell className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900">
              About notification preferences
            </p>
            <p className="text-sm text-blue-700">
              You can choose to receive notifications via email, in-app, or
              Slack for each type of event. In-app notifications appear in the
              bell icon at the top of the page. Email notifications are sent to
              your registered email address. Slack notifications require a
              connected Slack workspace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
