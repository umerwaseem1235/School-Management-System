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
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand shadow-sm ring-1 ring-brand/10">
        <GraduationCap className="size-5" strokeWidth={2.25} />
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-gold ring-2 ring-white" />
      </div>
      {!collapsed && (
        <div className="min-w-0 leading-tight">
          <p className="font-heading text-[15px] font-bold tracking-tight text-brand">
            EduSphere
          </p>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Super Admin
          </p>
        </div>
      )}
    </div>
  );
}
