"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EXTENDED_LEAVE_REQUESTS } from "@/lib/mock/attendance";

export {
  KpiGroupHeading,
  DashboardFeatureCard,
  Field,
  fieldClass,
} from "./attendance-kit";

const SUBNAV_ITEMS: {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: number;
}[] = [
  { title: "Overview", href: "/attendance", icon: LayoutDashboard, exact: true },
  { title: "Student Attendance", href: "/attendance/students", icon: GraduationCap },
  { title: "Staff Attendance", href: "/attendance/staff", icon: UserCheck },
  {
    title: "Leave Requests",
    href: "/attendance/leave-requests",
    icon: CalendarClock,
    badge: EXTENDED_LEAVE_REQUESTS.filter((l) => l.status === "Pending").length,
  },
  { title: "Leave Policy", href: "/attendance/leave-policy", icon: ShieldCheck },
  { title: "Student Attendance Report", href: "/attendance/reports", icon: BarChart3 },
  { title: "Staff Attendance Report", href: "/attendance/staff-reports", icon: FileText },
];

export function AttendanceSubnav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Attendance sub-modules"
      className="mb-4 flex flex-wrap items-center gap-2 border-b border-brand/10 pb-4"
    >
      {SUBNAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-9.5 items-center gap-2 rounded-[4px] border px-4 text-xs font-semibold tracking-[0.01em] whitespace-nowrap transition-all duration-150 select-none",
              active
                ? "border-[#091d3e] bg-gradient-to-b from-[#16345f] to-[#091d3e] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_3px_8px_-2px_rgb(9_29_62/0.38)]"
                : "border-brand/18 bg-white text-foreground/85 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.06)] hover:border-brand/35 hover:bg-brand-50/60 hover:text-brand"
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            <span>{item.title}</span>
            {item.badge ? (
              <span
                className={cn(
                  "inline-flex items-center justify-center rounded-[3px] px-1.5 py-0.5 text-[10px] font-bold leading-none tabular-nums",
                  active
                    ? "bg-white/20 text-white ring-1 ring-white/25"
                    : "bg-brand-50 text-brand ring-1 ring-brand/15"
                )}
              >
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function AttendanceDatePicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (nextDate: string) => void;
  className?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const shiftDate = (days: number) => {
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return;
    parsed.setDate(parsed.getDate() + days);
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, "0");
    const dd = String(parsed.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
  };

  const formattedLabel = React.useMemo(() => {
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [value]);

  return (
    <div
      className={cn(
        "inline-flex h-9 w-[218px] min-w-[218px] max-w-[218px] shrink-0 items-center justify-between rounded-[4px] border border-brand/18 bg-white p-0.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_1px_2px_rgb(9_29_62/0.05)] transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20 select-none",
        className
      )}
    >
      <button
        type="button"
        title="Previous day"
        aria-label="Previous day"
        onClick={() => shiftDate(-1)}
        className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-[3px] text-muted-foreground transition-all hover:bg-brand-50 hover:text-brand active:scale-95"
      >
        <ChevronLeft className="size-4" />
      </button>

      <div
        title="Click to open calendar picker"
        onClick={() => {
          try {
            inputRef.current?.showPicker?.();
          } catch {
            inputRef.current?.focus();
          }
        }}
        className="relative flex h-full flex-1 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-[3px] px-1 text-xs font-semibold text-foreground transition-colors hover:bg-brand-50/60"
      >
        <CalendarDays className="size-3.5 shrink-0 text-brand" />
        <span className="tabular-nums whitespace-nowrap text-center tracking-tight">
          {formattedLabel}
        </span>
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => {
            if (e.target.value) onChange(e.target.value);
          }}
          aria-label="Select attendance date"
          className="sr-only"
        />
      </div>

      <button
        type="button"
        title="Next day"
        aria-label="Next day"
        onClick={() => shiftDate(1)}
        className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-[3px] text-muted-foreground transition-all hover:bg-brand-50 hover:text-brand active:scale-95"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

export function AttendanceDateRangePicker({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
  size = "sm",
  className,
}: {
  fromDate: string;
  toDate: string;
  onFromChange: (nextFrom: string) => void;
  onToChange: (nextTo: string) => void;
  size?: "md" | "sm";
  className?: string;
}) {
  const fromInputRef = React.useRef<HTMLInputElement>(null);
  const toInputRef = React.useRef<HTMLInputElement>(null);

  const isInvalidRange = Boolean(fromDate && toDate && toDate < fromDate);

  const formatShort = (iso: string) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
    if (!match) return iso;
    const parsed = new Date(
      Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    );
    if (Number.isNaN(parsed.getTime())) return iso;
    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center rounded-[4px] border bg-white p-0.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.05)] transition-colors focus-within:ring-3 select-none",
        isInvalidRange
          ? "border-danger/60 focus-within:border-danger focus-within:ring-danger/20"
          : "border-brand/18 hover:border-brand/30 focus-within:border-ring focus-within:ring-ring/20",
        size === "sm" ? "h-8" : "h-9",
        className
      )}
    >
      {/* From Date Trigger */}
      <div
        title="Select From Date"
        onClick={() => {
          try {
            fromInputRef.current?.showPicker?.();
          } catch {
            fromInputRef.current?.focus();
          }
        }}
        className="relative flex h-full cursor-pointer items-center gap-1.5 rounded-[3px] px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-brand-50/60"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          From
        </span>
        <CalendarDays className="size-3.5 shrink-0 text-brand" />
        <span className="tabular-nums whitespace-nowrap tracking-tight">
          {formatShort(fromDate)}
        </span>
        <input
          ref={fromInputRef}
          type="date"
          value={fromDate}
          onChange={(e) => {
            if (e.target.value) onFromChange(e.target.value);
          }}
          aria-label="From Date"
          className="sr-only"
        />
      </div>

      {/* Divider */}
      <div className="mx-0.5 flex items-center gap-1 text-muted-foreground/45">
        <span className="h-3.5 w-px bg-brand/12" />
        <ArrowRight className="size-3 text-brand/60" />
        <span className="h-3.5 w-px bg-brand/12" />
      </div>

      {/* To Date Trigger */}
      <div
        title="Select To Date"
        onClick={() => {
          try {
            toInputRef.current?.showPicker?.();
          } catch {
            toInputRef.current?.focus();
          }
        }}
        className="relative flex h-full cursor-pointer items-center gap-1.5 rounded-[3px] px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-brand-50/60"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          To
        </span>
        <CalendarDays
          className={cn(
            "size-3.5 shrink-0",
            isInvalidRange ? "text-danger" : "text-brand"
          )}
        />
        <span
          className={cn(
            "tabular-nums whitespace-nowrap tracking-tight",
            isInvalidRange && "text-danger"
          )}
        >
          {formatShort(toDate)}
        </span>
        <input
          ref={toInputRef}
          type="date"
          value={toDate}
          onChange={(e) => {
            if (e.target.value) onToChange(e.target.value);
          }}
          aria-label="To Date"
          className="sr-only"
        />
      </div>
    </div>
  );
}

type ActionButtonTone =
  | "primary"
  | "outline"
  | "success"
  | "danger"
  | "warning"
  | "info";

type ActionButtonSize = "md" | "sm" | "xs";

const ACTION_TONE_CLASSES: Record<ActionButtonTone, string> = {
  primary:
    "border-[#091d3e] bg-gradient-to-b from-[#16345f] to-[#091d3e] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_2px_6px_-1px_rgb(9_29_62/0.35)] hover:from-[#1e4275] hover:to-[#102848]",
  outline:
    "border-brand/18 bg-white text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.05)] hover:border-brand/35 hover:bg-brand-50/50 hover:text-brand",
  success:
    "border-success/35 bg-success-soft/55 text-success shadow-[inset_0_1px_0_rgb(255_255_255/0.75),0_1px_2px_rgb(47_143_107/0.08)] hover:border-success hover:bg-success hover:text-white",
  danger:
    "border-danger/35 bg-danger-soft/55 text-danger shadow-[inset_0_1px_0_rgb(255_255_255/0.75),0_1px_2px_rgb(200_70_61/0.08)] hover:border-danger hover:bg-danger hover:text-white",
  warning:
    "border-warning/35 bg-warning-soft/55 text-warning shadow-[inset_0_1px_0_rgb(255_255_255/0.75),0_1px_2px_rgb(199_132_31/0.08)] hover:border-warning hover:bg-warning hover:text-white",
  info:
    "border-info/35 bg-info-soft/55 text-info shadow-[inset_0_1px_0_rgb(255_255_255/0.75),0_1px_2px_rgb(60_111_176/0.08)] hover:border-info hover:bg-info hover:text-white",
};

const ACTION_SIZE_CLASSES: Record<ActionButtonSize, string> = {
  md: "h-9 gap-2 rounded-[4px] px-4 text-xs [&_svg]:size-3.5",
  sm: "h-8 gap-1.5 rounded-[4px] px-3 text-xs [&_svg]:size-3.5",
  xs: "h-7 gap-1.5 rounded-[4px] px-2.5 text-[11px] [&_svg]:size-3",
};

export function AttendanceActionButton({
  tone = "outline",
  size = "md",
  className,
  children,
  type = "button",
  ...props
}: React.ComponentProps<"button"> & {
  tone?: ActionButtonTone;
  size?: ActionButtonSize;
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center border font-semibold tracking-[0.01em] whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        ACTION_TONE_CLASSES[tone],
        ACTION_SIZE_CLASSES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface RowSegmentedOption<T extends string> {
  value: T;
  code: string;
  /** Accessible / tooltip action description. */
  label: string;
  activeClassName: string;
  inactiveHoverClassName?: string;
}

export function RowSegmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: RowSegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "md" | "sm" | "xs";
}) {
  const isCompact = size === "sm" || size === "xs";
  return (
    <div
      role="group"
      className={cn(
        "inline-flex items-center justify-end rounded-[5px] border border-brand/12 bg-[#f4f7fb] shadow-[inset_0_1px_2px_rgb(9_29_62/0.05)]",
        isCompact ? "p-0.5 gap-0.5" : "p-1 gap-1"
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            title={o.label}
            aria-label={o.label}
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex cursor-pointer items-center justify-center font-bold whitespace-nowrap transition-all duration-150 select-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none active:translate-y-px",
              isCompact
                ? "h-6 min-w-[26px] rounded-[3px] px-1.5 text-[10px] tracking-normal"
                : "h-7 min-w-[36px] rounded-[4px] px-2.5 text-[11px] tracking-wider",
              active
                ? cn(
                    "text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_2px_5px_-1px_rgb(9_29_62/0.25)]",
                    o.activeClassName
                  )
                : cn(
                    "bg-white text-slate-700 ring-1 ring-inset ring-brand/12 shadow-[0_1px_1px_rgb(9_29_62/0.03)] hover:bg-brand-50/50 hover:text-foreground hover:ring-brand/25",
                    o.inactiveHoverClassName
                  )
            )}
          >
            {o.code}
          </button>
        );
      })}
    </div>
  );
}


