import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  /** Remove inner padding — useful for full-bleed tables. */
  flush?: boolean;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  flush = false,
}: SectionCardProps) {
  const hasHeader = Boolean(title || action);

  return (
    <section
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-brand/10 bg-white",
        "shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_3px_rgb(53_57_85/0.06),0_14px_32px_-18px_rgba(9,29,62,0.18)]",
        "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:-translate-y-1 hover:border-brand/30",
        "hover:shadow-[inset_0_1px_0_rgb(255_255_255/1),0_8px_24px_-4px_rgba(9,29,62,0.12),0_28px_56px_-16px_rgba(9,29,62,0.25)]",
        className
      )}
    >
      {/* Ambient sapphire radial bloom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_40%_at_50%_0%,rgba(30,66,117,0.12),transparent_75%)] opacity-60 transition-all duration-500 ease-out group-hover:scale-105 group-hover:opacity-100"
      />

      {/* Dynamic expanding top light-beam */}
      <span
        aria-hidden
        className="absolute inset-x-1/4 top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#1e4275] to-transparent opacity-80 transition-all duration-500 ease-out group-hover:inset-x-8 group-hover:h-[2.5px] group-hover:via-[#3f6396] group-hover:shadow-[0_0_14px_rgba(30,66,117,0.7)]"
      />

      {/* Subtle glass shimmer sweep on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-full top-0 block h-full w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-all duration-1000 ease-out group-hover:translate-x-[400%] group-hover:opacity-100"
      />

      {hasHeader && (
        <header
          className={cn(
            "relative z-20 flex flex-wrap justify-between gap-4 px-6 pt-5 pb-2.5",
            description ? "items-start" : "items-center"
          )}
        >
          <div className="min-w-0">
            {typeof title === "string" ? (
              <h2 className="font-heading text-[15px] font-semibold text-foreground tracking-tight">
                {title}
              </h2>
            ) : (
              title
            )}
            {description && (
              typeof description === "string" ? (
                <p className="mt-0.5 text-[13px] font-medium text-muted-foreground/90">
                  {description}
                </p>
              ) : (
                description
              )
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div
        className={cn(
          "relative z-10 flex-1",
          !flush && (hasHeader ? "px-6 pt-2.5 pb-5" : "px-6 py-5"),
          flush && (hasHeader ? "pt-2.5" : "pt-5"),
          contentClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}
