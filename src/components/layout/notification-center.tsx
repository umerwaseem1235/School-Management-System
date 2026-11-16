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
  Inbox,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
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
    tone: "text-info bg-info-soft ring-1 ring-info/20",
  },
  {
    id: "n2",
    icon: Wallet,
    title: "Defaulter list exceeded Rs 4.2M limit",
    description: "Fee overdue alerts flagged for the October billing batch.",
    time: "1h ago",
    urgent: true,
    tag: "Finance",
    href: "/fees",
    actionText: "Inspect",
    read: false,
    tone: "text-warning bg-warning-soft ring-1 ring-warning/20",
  },
  {
    id: "n3",
    icon: ShieldAlert,
    title: "3 failed logins detected on HR Admin",
    description: "Suspicious sign-in attempts from IP 182.180.44.12 via Gulberg gateway.",
    time: "2h ago",
    urgent: true,
    tag: "Security",
    href: "/audit-logs",
    actionText: "Investigate",
    read: false,
    tone: "text-danger bg-danger-soft ring-1 ring-danger/20",
  },
];

export function NotificationCenter({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [tab, setTab] = React.useState<"all" | "unread" | "urgent">("all");

  const unreadCount = React.useMemo(
    () => items.filter((i) => !i.read).length,
    [items]
  );
  const urgentCount = React.useMemo(
    () => items.filter((i) => i.urgent).length,
    [items]
  );

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    toast.success("All notifications marked as read");
  };

  const markAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, read: true } : i))
    );
  };

  const filteredItems = React.useMemo(() => {
    if (tab === "urgent") return items.filter((item) => item.urgent);
    if (tab === "unread") return items.filter((item) => !item.read);
    return items;
  }, [items, tab]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        aria-label="Notifications"
        className={cn(
          "group relative grid size-8.5 place-items-center rounded-[4px] border border-[#c28b38]/40 bg-gradient-to-b from-[#7c4424]/80 via-[#5c3118]/90 to-[#381e0f] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_6px_rgba(56,30,15,0.3)] transition-all duration-150 hover:from-[#a05a2c]/90 hover:to-[#5c3118] hover:border-[#ebdcc6]/60 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_4px_12px_rgba(56,30,15,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 data-[popup-open]:border-[#ebdcc6] cursor-pointer",
          className
        )}
      >
        <Bell className="size-4 text-[#f5ebd7] transition-colors group-hover:text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger ring-2 ring-[#381e0f]" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[360px] sm:w-[400px] max-h-[calc(100vh-84px)] flex flex-col p-0 rounded-2xl shadow-[0_20px_48px_-12px_rgba(56,30,15,0.22),0_8px_20px_-6px_rgba(0,0,0,0.08)] border border-border/80 bg-popover text-popover-foreground overflow-hidden overflow-x-hidden overflow-y-hidden"
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-border/70 bg-muted/30 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <p className="font-heading text-sm font-bold text-foreground">
              Notifications
            </p>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-bold text-brand ring-1 ring-brand/20">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand/10 cursor-pointer"
            >
              <CheckCheck className="size-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="shrink-0 flex items-center gap-1.5 border-b border-border/70 px-3 py-1.5 bg-muted/15">
          <button
            type="button"
            onClick={() => setTab("all")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
              tab === "all"
                ? "bg-gradient-to-b from-[#7c4424] to-[#381e0f] text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            )}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("unread")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
              tab === "unread"
                ? "bg-gradient-to-b from-[#7c4424] to-[#381e0f] text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            )}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setTab("urgent")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
              tab === "urgent"
                ? "bg-danger text-white shadow-xs"
                : "text-muted-foreground hover:bg-danger-soft/50 hover:text-danger"
            )}
          >
            Urgent ({urgentCount})
          </button>
        </div>

        {/* Scrollable Notification List */}
        <div className="flex-1 min-h-0 max-h-[calc(100vh-210px)] overflow-y-auto scrollbar-thin-light p-2 space-y-1.5">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground mb-2.5">
                <Inbox className="size-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">
                You&apos;re all caught up
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {tab === "unread"
                  ? "No unread notifications remaining."
                  : tab === "urgent"
                    ? "No urgent system alerts right now."
                    : "No notifications available."}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "group relative flex items-start gap-2.5 rounded-xl p-2.5 border transition-all duration-150",
                    !item.read
                      ? "bg-brand-50/45 border-brand/15 hover:bg-brand-50/75"
                      : "bg-transparent border-transparent hover:bg-muted/50 hover:border-border/60"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-lg mt-0.5",
                      item.tone
                    )}
                  >
                    <Icon className="size-4" />
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                          {item.tag}
                        </span>
                        {item.urgent && (
                          <span className="inline-flex items-center rounded px-1.5 py-px text-[9.5px] font-bold uppercase bg-danger-soft text-danger">
                            Urgent
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="size-2.5" />
                          {item.time}
                        </span>
                        {!item.read && (
                          <span
                            title="Unread"
                            className="size-2 rounded-full bg-brand shrink-0"
                          />
                        )}
                      </div>
                    </div>

                    <p
                      className={cn(
                        "text-[13px] leading-snug mt-1",
                        item.read ? "font-medium text-foreground/85" : "font-semibold text-foreground"
                      )}
                    >
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <Link
                        href={item.href}
                        onClick={() => {
                          markAsRead(item.id);
                          setOpen(false);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                      >
                        <span>{item.actionText}</span>
                        <ArrowRight className="size-3" />
                      </Link>
                      {!item.read && (
                        <button
                          type="button"
                          onClick={(e) => markAsRead(item.id, e)}
                          className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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

        {/* Footer */}
        <Link
          href="/audit-logs"
          onClick={() => setOpen(false)}
          className="shrink-0 flex items-center justify-center gap-1.5 border-t border-border/70 bg-muted/25 px-4 py-2.5 text-xs font-semibold text-brand hover:bg-muted/55 transition-colors"
        >
          <span>View all activity in Audit Logs</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
