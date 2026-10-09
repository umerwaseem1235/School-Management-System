import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="font-heading text-lg font-bold tracking-tight text-foreground md:text-xl">
          {title}
        </h1>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
