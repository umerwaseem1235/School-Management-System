import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";

interface ModulePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  points: string[];
}

/**
 * Professional placeholder for newly introduced module workspaces.
 * Keeps every sidebar link functional while the module is being built out.
 */
export function ModulePlaceholder({ title, description, icon: Icon, points }: ModulePlaceholderProps) {
  return (
    <>
      <PageHeader title={title} />
      <SectionCard
        title="Module Overview"
        description="Workspace setup in progress"
      >
        <div className="flex flex-col items-center py-6 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-b from-[#7c4424] via-[#5c3118] to-[#381e0f] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_8px_20px_-4px_rgba(9,29,62,0.4)] ring-1 ring-white/10 transition-transform duration-300">
            <Icon className="size-7" />
          </span>
          <h2 className="mt-4 font-heading text-base font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-muted-foreground">
            {description}
          </p>
          <ul className="mt-6 grid w-full max-w-lg gap-2 text-left sm:grid-cols-2">
            {points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-2 rounded-xl bg-muted/50 px-3 py-2.5 text-[12.5px] font-medium text-foreground/80 ring-1 ring-border/50"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </SectionCard>
    </>
  );
}
