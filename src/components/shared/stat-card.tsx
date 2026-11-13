import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SplitMetric {
  label: string;
  value: string;
}

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
  title?: string;
  /** Optional split footer (e.g. Today | Month for birthday cards). */
  split?: [SplitMetric, SplitMetric];
  /** Optional destination route when the card is clicked. */
  href?: string;
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  className,
  iconClassName,
  title,
  split,
  href,
  onClick,
}: StatCardProps) {
  const isClickable = Boolean(href || onClick);

  const cardContent = (
    <>
      {/* Ambient emerald glow bloom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_55%_at_50%_0%,rgba(124,68,36,0.18),transparent_75%)] opacity-60 transition-all duration-500 ease-out group-hover:scale-105 group-hover:opacity-100 dark:opacity-30"
      />

      {/* Dynamic expanding top jewel light-beam */}
      <span
        aria-hidden
        className="absolute inset-x-12 top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#7c4424] to-transparent opacity-80 transition-all duration-500 ease-out group-hover:inset-x-4 group-hover:h-[2.5px] group-hover:via-[#c28b38] group-hover:shadow-[0_0_12px_rgba(194,139,56,0.8)]"
      />

      {/* Premium diagonal glass shimmer pass */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:translate-x-[350%] group-hover:opacity-100"
      />

      {/* Icon with multi-layer physics and tilt */}
      <span
        className={cn(
          "relative grid size-9 shrink-0 place-items-center rounded-lg",
          "bg-gradient-to-b from-[#7c4424] via-[#5c3118] to-[#381e0f] text-white",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_10px_-2px_rgba(56,30,15,0.35)]",
          "ring-1 ring-white/10 border border-[#381e0f]/20",
          "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "group-hover:-translate-y-0.5 group-hover:scale-110 group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.38),0_8px_18px_-2px_rgba(56,30,15,0.5)]",
          iconClassName
        )}
      >
        <Icon className="size-4 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3" />
      </span>

      <p className="relative mt-2 min-w-0 text-xs font-semibold leading-snug tracking-[0.01em] text-foreground transition-colors duration-200">
        {label}
      </p>

      <p
        className="relative mt-1 w-full truncate font-heading text-base font-bold leading-none tracking-tight tabular-nums text-foreground transition-colors duration-200 group-hover:text-[#6e3b1f]"
        title={title ?? (typeof value === "string" ? value : undefined)}
      >
        {value}
      </p>

      {/* Expanding indicator accent line */}
      <span
        aria-hidden
        className="relative mt-2 h-[2px] w-6 rounded-full bg-gradient-to-r from-primary/80 to-primary/20 transition-all duration-300 ease-out group-hover:w-12 group-hover:from-primary group-hover:to-primary/50"
      />

      {split && (
        <div className="relative mt-2.5 grid w-full grid-cols-2 divide-x divide-border/60 rounded-xl bg-brand-50/60 py-1.5 ring-1 ring-brand/10 transition-all duration-300 group-hover:bg-brand-50/90 group-hover:ring-brand/20 dark:bg-muted/40">
          {split.map((s) => (
            <div key={s.label} className="px-2 text-center">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-0.5 font-heading text-sm font-bold tabular-nums text-foreground transition-transform duration-200 group-hover:scale-105">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const sharedClassName = cn(
    "group relative flex min-w-0 flex-col items-center overflow-hidden rounded-xl border border-brand/10 bg-white p-3 pt-4 text-center",
    "shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_3px_rgb(53_57_85/0.06),0_12px_28px_-16px_rgba(9,29,62,0.2)]",
    "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
    "hover:-translate-y-1.5 hover:border-brand/35",
    "hover:shadow-[inset_0_1px_0_rgb(255_255_255/1),0_8px_20px_-4px_rgba(9,29,62,0.14),0_24px_48px_-12px_rgba(9,29,62,0.28)]",
    "active:translate-y-0 active:scale-[0.985] active:duration-100",
    "dark:bg-card dark:border-border/80 dark:shadow-none",
    isClickable && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 select-none",
    className
  );

  if (href) {
    return (
      <Link href={href} className={sharedClassName}>
        {cardContent}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={sharedClassName}>
        {cardContent}
      </button>
    );
  }

  return <div className={sharedClassName}>{cardContent}</div>;
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
