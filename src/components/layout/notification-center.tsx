"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  ShieldAlert,
  UserPlus,
  Wallet,
  ArrowRight,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  time: string;
  urgent: boolean;
  tag: string;
  href: string;
  actionText: string;
  read: boolean;
  tone: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    icon: UserPlus,
    title: "6 admission inquiries awaiting review",
    description: "Main Campus & DHA Phase 5 have pending approvals.",
    time: "10m ago",
    urgent: false,
    tag: "Admissions",
    href: "/admissions",
    actionText: "Review",
    read: false,
    tone: "text-info bg-info-soft",
  },
  {
    id: "n2",
    icon: Wallet,
    title: "Defaulter list exceeded Rs 4.2M limit",
    description: "Fee overdue alerts flagged for October batch.",
    time: "1h ago",
    urgent: true,
    tag: "Finance",
    href: "/fees",
    actionText: "Inspect",
    read: false,
    tone: "text-warning bg-warning-soft",
  },
  {
    id: "n3",
    icon: ShieldAlert,
    title: "3 failed logins detected on HR Admin",
    description: "Suspicious login IP: 182.180.44.12 via Gulberg gateway.",
    time: "2h ago",
    urgent: true,
    tag: "Security",
    href: "/audit-logs",
    actionText: "Investigate",
    read: false,
    tone: "text-danger bg-danger-soft",
  },
];

export function NotificationCenter({ className }: { className?: string }) {
  const [items, setItems] = React.useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [tab, setTab] = React.useState<"all" | "urgent">("all");

  const unreadCount = items.filter((i) => !i.read).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    toast.success("All notifications marked as read");
  };

  const markAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, read: true } : i))
    );
  };

  const filteredItems = items.filter((item) => {
    if (tab === "urgent") return item.urgent;
    return true;
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Notifications"
        className={cn(
          "group relative grid size-8.5 place-items-center rounded-lg border border-border bg-white text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger ring-2 ring-white" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-84 sm:w-92 p-0 rounded-xl shadow-lg border-border bg-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <p className="font-heading text-xs font-bold text-foreground">Notifications</p>
            {unreadCount > 0 && (
              <span className="rounded-full bg-brand px-1.5 py-0.2 text-[10px] font-bold text-cream">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="flex items-center gap-1 text-[11px] font-medium text-brand hover:underline"
            >
              <CheckCheck className="size-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 border-b border-border px-3 py-1.5 bg-muted/10">
          <button
            type="button"
            onClick={() => setTab("all")}
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
              tab === "all"
                ? "bg-brand text-cream"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("urgent")}
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
              tab === "urgent"
                ? "bg-danger text-white"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            Urgent (2)
          </button>
        </div>

        {/* Notification List */}
        <div className="max-h-72 overflow-y-auto divide-y divide-border/50 p-1">
          {filteredItems.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No notifications.
            </div>
          ) : (
            filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "group relative flex items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-muted/40",
                    !item.read && "bg-brand-50/30"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-md mt-0.5",
                      item.tone
                    )}
                  >
                    <Icon className="size-3.5" />
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                        {item.tag}
                      </span>
                      <span className="flex items-center gap-1 text-[10.5px] text-muted-foreground">
                        <Clock className="size-2.5" />
                        {item.time}
                      </span>
                    </div>

                    <p className={cn("text-xs leading-snug mt-0.5", item.read ? "text-foreground/80" : "font-semibold text-brand")}>
                      {item.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                      {item.description}
                    </p>

                    <div className="mt-1.5 flex items-center gap-3">
                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
                      >
                        <span>{item.actionText}</span>
                        <ArrowRight className="size-2.5" />
                      </Link>
                      {!item.read && (
                        <button
                          type="button"
                          onClick={(e) => markAsRead(item.id, e)}
                          className="text-[10.5px] text-muted-foreground hover:text-foreground"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DropdownMenuSeparator className="m-0 border-border" />

        {/* Footer */}
        <Link
          href="/audit-logs"
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-center text-xs font-medium text-brand hover:bg-muted/50 transition-colors"
        >
          <span>View all activity in Audit Logs</span>
          <ArrowRight className="size-3" />
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
