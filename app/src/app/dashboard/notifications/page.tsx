"use client";

import { useState } from "react";
import { Bell, Filter } from "lucide-react";
import { NotificationList } from "@/components/notifications/NotificationList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-sm text-slate-600">
              Stay updated on your requests and approvals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
            <SelectTrigger className="w-[140px]" aria-label="Filter notifications">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All notifications</SelectItem>
              <SelectItem value="unread">Unread only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notification list */}
      <NotificationList compact={false} unreadOnly={filter === "unread"} />
    </div>
  );
}
