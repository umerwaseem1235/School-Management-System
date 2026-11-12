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
    <div
      className={cn(
        "flex items-center overflow-hidden transition-[gap] duration-200",
        collapsed ? "gap-0" : "gap-3",
        className
      )}
    >
      <div className="relative grid size-9.5 shrink-0 place-items-center rounded-full bg-white text-[#12294d] shadow-[0_2px_8px_rgba(0,0,0,0.28)] ring-2 ring-white/25 transition-all duration-200">
        <GraduationCap className="size-5 text-[#12294d]" strokeWidth={2.4} />
      </div>
      <div
        className={cn(
          "min-w-0 leading-tight whitespace-nowrap overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none",
          collapsed
            ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
            : "max-w-[160px] opacity-100 translate-x-0 delay-75"
        )}
      >
        <p className="font-heading text-[16px] font-bold tracking-tight text-white truncate drop-shadow-xs">
          EduSphere
        </p>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#93c5fd] truncate">
          Super Admin
        </p>
      </div>
    </div>
  );
}
