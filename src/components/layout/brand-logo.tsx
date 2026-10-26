import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandLogo({
  collapsed = false,
  className,
}: {
  collapsed?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 overflow-hidden", className)}>
      <div className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand shadow-sm ring-1 ring-brand/10 transition-colors duration-200">
        <GraduationCap className="size-5" strokeWidth={2.25} />
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-gold ring-2 ring-white" />
      </div>
      <div
        className={cn(
          "min-w-0 leading-tight whitespace-nowrap overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none",
          collapsed
            ? "opacity-0 -translate-x-2 pointer-events-none"
            : "opacity-100 translate-x-0 delay-75"
        )}
      >
        <p className="font-heading text-[15px] font-bold tracking-tight text-brand truncate">
          EduSphere
        </p>
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground truncate">
          Super Admin
        </p>
      </div>
    </div>
  );
}
