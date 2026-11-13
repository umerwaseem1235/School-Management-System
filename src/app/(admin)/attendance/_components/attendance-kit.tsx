import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Exact match to Dashboard's `KpiGroupHeading` (`src/app/(admin)/dashboard/page.tsx`).
 */
export function KpiGroupHeading({
  title,
  meta,
  className,
}: {
  title: string;
  meta?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="h-4 w-1 shrink-0 rounded-full bg-gradient-to-b from-primary to-primary/40"
      />
      <h2 className="shrink-0 font-heading text-sm font-bold tracking-tight text-foreground">
        {title}
      </h2>
      <span
        aria-hidden
        className="h-px flex-1 bg-gradient-to-r from-border via-border/60 to-transparent"
      />
      {meta && (
        <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-brand ring-1 ring-brand/10">
          {meta}
        </span>
      )}
    </div>
  );
}

/**
 * Dashboard-style feature card with the exact same surface, top radial glow,
 * top 2px gradient accent line, and hover elevation as `StatCard` / `SectionCard`.
 */
export function DashboardFeatureCard({
  icon: Icon,
  monogram,
  title,
  subtitle,
  badge,
  children,
  footer,
  className,
}: {
  icon: LucideIcon;
  monogram?: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-colors duration-200 hover:border-brand/25 hover:shadow-md",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_55%_at_50%_0%,rgb(30_66_117/0.10),transparent_70%)] opacity-80 transition-opacity duration-300 group-hover:opacity-100"
      />
      <span
        aria-hidden
        className="absolute inset-x-8 top-0 h-px rounded-full bg-border"
      />

      <div className="relative z-10 space-y-3.5 p-4 pb-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-to-b from-[#7c4424] via-[#5c3118] to-[#381e0f] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_10px_-2px_rgba(9,29,62,0.35)] ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105">
              {monogram ? (
                <span className="text-[11px] font-bold tracking-tight tabular-nums">
                  {monogram}
                </span>
              ) : (
                <Icon className="size-4" />
              )}
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-[13.5px] font-semibold tracking-tight text-foreground">
                {title}
              </h3>
              {subtitle && (
                <p className="mt-0.5 truncate text-[11.5px] font-medium text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>

        {children && <div>{children}</div>}
      </div>

      {footer && (
        <div className="relative z-10 border-t border-border bg-muted/20 px-4 py-2.5">
          {footer}
        </div>
      )}
    </div>
  );
}

export const fieldClass =
  "h-9 w-full rounded-lg border border-input bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20";

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}
