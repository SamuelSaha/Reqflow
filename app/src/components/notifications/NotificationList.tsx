"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { CheckCheck, Trash2, ExternalLink, Bell } from "lucide-react";
import { trpc } from "@/lib/api/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NotificationListProps {
  onClose?: () => void;
  compact?: boolean;
  limit?: number;
}

/**
 * Notification list component
 * Shows recent notifications with mark as read and delete actions
 */
export function NotificationList({
  onClose,
  compact = false,
  limit,
}: NotificationListProps) {
  const utils = trpc.useUtils();

  // Fetch notifications
  const { data, isLoading } = trpc.notifications.list.useQuery({
    limit: limit || 50,
    offset: 0,
    unreadOnly: false,
  });

  // Mark as read mutation
  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.getUnreadCount.invalidate();
    },
  });

  // Mark all as read mutation
  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      toast.success("All notifications marked as read");
    },
  });

  // Delete mutation
  const deleteNotification = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      toast.success("Notification deleted");
    },
  });

  const handleNotificationClick = (id: string, actionUrl: string | null, read: boolean) => {
    if (!read) {
      markAsRead.mutate({ id });
    }
    if (actionUrl && typeof window !== "undefined") {
      // Navigate to action URL
      window.location.assign(actionUrl);
    }
    onClose?.();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification.mutate({ id });
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-sm text-slate-500">
        Loading notifications...
      </div>
    );
  }

  const notifications = data?.items || [];
  const hasUnread = notifications.some((n) => !n.read);

  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center">
        <Bell className="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <p className="text-sm font-medium text-slate-900 mb-1">
          No notifications
        </p>
        <p className="text-sm text-slate-500">
          You're all caught up!
        </p>
      </div>
    );
  }

  return (
    <div className={compact ? "" : "bg-white rounded-lg border border-slate-200"}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
        <div className="flex items-center gap-2">
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
              className="h-8 px-3 text-xs"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
              Mark all read
            </Button>
          )}
          {compact && (
            <Link
              href="/dashboard/notifications"
              onClick={onClose}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              See all
            </Link>
          )}
        </div>
      </div>

      {/* List */}
      <div className={cn("divide-y divide-slate-100", compact ? "max-h-[400px] overflow-y-auto" : "")}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "relative px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer group",
              !notification.read && "bg-blue-50/50"
            )}
            onClick={() =>
              handleNotificationClick(
                notification.id,
                notification.actionUrl,
                notification.read
              )
            }
          >
            {/* Unread indicator */}
            {!notification.read && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r" />
            )}

            <div className="flex items-start justify-between gap-3 ml-2">
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm mb-1",
                    notification.read
                      ? "text-slate-600 font-medium"
                      : "text-slate-900 font-semibold"
                  )}
                >
                  {notification.title}
                </p>
                <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                  {notification.message}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                  {notification.actionUrl && (
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Actions */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleDelete(e, notification.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              >
                <Trash2 className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {compact && data && data.hasMore && (
        <div className="px-4 py-3 border-t border-slate-200 text-center">
          <Link
            href="/dashboard/notifications"
            onClick={onClose}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
