import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  description?: string;
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
  return (
    <section
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-brand/10 bg-white shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_1px_2px_rgb(53_57_85/0.08),0_16px_40px_-24px_rgb(53_57_85/0.35)] transition-all duration-300 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_2px_6px_rgb(53_57_85/0.08),0_28px_56px_-20px_rgb(53_57_85/0.4)]",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_40%_at_50%_0%,rgb(96_64_218/0.08),transparent_70%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
      />
      <span
        aria-hidden
        className="absolute inset-x-1/4 top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />

      {(title || action) && (
        <header className="relative z-10 flex items-start justify-between gap-4 px-6 pt-6 pb-2">
          <div className="min-w-0">
            {title && (
              <h2 className="font-heading text-[15px] font-semibold text-foreground tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-[13px] font-medium text-muted-foreground/90">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={cn("relative z-10 flex-1", !flush && "px-6 pb-6 pt-4", flush && "pt-4", contentClassName)}>
        {children}
      </div>
    </section>
  );
}
