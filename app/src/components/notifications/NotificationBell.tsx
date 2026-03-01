"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { trpc } from "@/lib/api/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { NotificationList } from "./NotificationList";

/**
 * Notification bell with unread count badge
 * Shows dropdown with recent notifications
 */
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  // Get unread count
  const { data: unreadCount = 0, refetch: refetchCount } = trpc.notifications.getUnreadCount.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Poll every 30 seconds as fallback
    }
  );

  // Subscribe to real-time notifications
  trpc.notifications.onNew.useSubscription(undefined, {
    onData: () => {
      // New notification received - refetch count
      refetchCount();
    },
  });

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-10 w-10 rounded-full p-0"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell className="h-5 w-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[400px] p-0">
        <NotificationList
          onClose={() => setIsOpen(false)}
          compact={true}
          limit={5}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
