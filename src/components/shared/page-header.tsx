import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export function PageHeader({
  title,
  actions,
  className,
  titleClassName,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 border-b border-border/70 pb-4 md:flex-row md:items-center md:justify-between lg:mb-7",
        className
      )}
    >
      <div className="min-w-0">
        <h1
          className={cn(
            "font-heading text-base font-bold tracking-tight text-foreground sm:text-lg md:text-[19px]",
            titleClassName
          )}
        >
          {title}
        </h1>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
