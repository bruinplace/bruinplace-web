"use client";

import Link from "next/link";
import { Bell, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NotificationItem = {
  id: string;
  text: string;
  timeLabel: string;
  read: boolean;
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    text: "Your favorited listing is available again.",
    timeLabel: "2h ago",
    read: false,
  },
  {
    id: "n2",
    text: "Someone reviewed one of your listings.",
    timeLabel: "Yesterday",
    read: false,
  },
  {
    id: "n3",
    text: "Your profile changes were saved.",
    timeLabel: "3d ago",
    read: true,
  },
];

export default function ProfileTopBar() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  }

  function markAllRead() {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );
  }

  return (
    <header className="bg-[#71C4FF]">
      <div className="mx-auto flex h-[83px] w-full max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-16">
        <Link href="/" className="flex items-center gap-3 text-white">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/70">
            <span className="text-sm font-semibold">B</span>
          </span>
          <span className="text-2xl font-semibold tracking-tight">
            BruinPlace
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/listings/new"
            className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#71C4FF] transition-colors hover:bg-white/90"
          >
            <Plus className="h-4 w-4" />
            <span>Add listing</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Notifications"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#71C4FF] transition-colors hover:bg-white/90"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-[8px] top-[8px] grid h-4 min-w-4 place-items-center rounded-full bg-[#FFCB64] px-1 text-[10px] font-semibold text-[#0369a1]">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[320px]">
              <div className="flex items-center justify-between px-2 py-1">
                <DropdownMenuLabel className="px-0 py-0">
                  Notifications
                </DropdownMenuLabel>
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs font-medium text-[#3EA6FC] hover:opacity-80"
                >
                  Mark all read
                </button>
              </div>
              <DropdownMenuSeparator />

              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  onSelect={() => markRead(notification.id)}
                  className="items-start"
                >
                  <div className="space-y-1">
                    <p
                      className={`text-sm leading-snug ${
                        notification.read
                          ? "text-zinc-500"
                          : "font-medium text-zinc-900"
                      }`}
                    >
                      {notification.text}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {notification.timeLabel}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            aria-label="User profile"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-[#3EA6FC] text-sm font-medium text-white"
          >
            JB
          </button>
        </div>
      </div>
    </header>
  );
}
