import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SplitMetric {
  label: string;
  value: string;
}

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  className?: string;
  /** Optional split footer (e.g. Today | Month for birthday cards). */
  split?: [SplitMetric, SplitMetric];
}

export function StatCard({
  label,
  value,
  icon: Icon,
  className,
  split,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative flex min-w-0 flex-col items-center overflow-hidden rounded-xl border border-brand/10 bg-white p-3 pt-4 text-center shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_1px_2px_rgb(53_57_85/0.08),0_16px_40px_-24px_rgb(53_57_85/0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_2px_6px_rgb(53_57_85/0.08),0_28px_56px_-20px_rgb(53_57_85/0.4)]",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_55%_at_50%_0%,rgb(30_66_117/0.12),transparent_70%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
      />
      <span
        aria-hidden
        className="absolute inset-x-10 top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary/70 to-transparent"
      />
      <span className="relative grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand shadow-[0_6px_16px_-6px_rgb(53_57_85/0.4)] ring-1 ring-brand/10 transition-transform duration-300 group-hover:scale-105">
        <Icon className="size-4" />
      </span>
      <p className="relative mt-2 min-w-0 text-xs font-semibold leading-snug tracking-[0.01em] text-foreground">
        {label}
      </p>
      <p className="relative mt-1 w-full truncate font-heading text-base font-bold leading-none tracking-tight tabular-nums text-foreground" title={value}>
        {value}
      </p>
      <span
        aria-hidden
        className="relative mt-2 h-[2px] w-8 rounded-full bg-gradient-to-r from-primary/80 to-primary/20"
      />
      {split && (
        <div className="relative mt-2.5 grid w-full grid-cols-2 divide-x divide-border/60 rounded-xl bg-brand-50/60 py-1.5 ring-1 ring-brand/10">
          {split.map((s) => (
            <div key={s.label} className="px-2 text-center">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-0.5 font-heading text-sm font-bold tabular-nums text-foreground">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StatGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid max-w-6xl gap-2.5 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}
