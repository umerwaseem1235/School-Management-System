"use client";

import * as React from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import { formatNumber, formatPercent } from "@/lib/format";
import { useBranches } from "@/context/branches-context";
import { cn } from "@/lib/utils";

export function DashboardBranchesCard() {
  const { branches, activeBranches } = useBranches();

  return (
    <SectionCard
      title="Branches"
      description={`${branches.length} registered (${activeBranches.length} active)`}
      action={
        <Link
          href="/branches"
          className="text-xs font-medium text-brand hover:underline"
        >
          View all →
        </Link>
      }
    >
      <div className="space-y-3">
        {branches.slice(0, 3).map((c) => (
          <Link
            key={c.id}
            href="/branches"
            className="group flex items-center gap-3 rounded-xl border border-border/60 bg-cream/40 p-3 transition-all hover:bg-cream/80 hover:border-brand/40 hover:shadow-xs cursor-pointer"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand">
              <Building2 className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-xs font-semibold text-foreground">
                  {c.campusName}
                </p>
                {c.status !== "Active" && (
                  <span
                    className={cn(
                      "rounded px-1 py-0.2 text-[9.5px] font-semibold",
                      c.status === "Pending"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    )}
                  >
                    {c.status}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {formatNumber(c.students)} students · {c.staff} staff
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold tabular-nums text-foreground">
                {formatPercent(c.feeCollectionRate, 1)}
              </p>
              <p className="text-[10px] text-muted-foreground">fee rate</p>
            </div>
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}
