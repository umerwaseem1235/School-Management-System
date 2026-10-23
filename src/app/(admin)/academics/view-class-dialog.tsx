"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AcademicClass } from "@/types";
import {
  Building2,
  User,
  GraduationCap,
  Layers,
  Users,
  Award,
} from "lucide-react";

interface ViewClassDialogProps {
  classItem: AcademicClass | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewClassDialog({
  classItem,
  open,
  onOpenChange,
}: ViewClassDialogProps) {
  if (!classItem) return null;

  const sectionsCount = (classItem as any).sectionsCount || classItem.sections || 1;
  const studentsCount = (classItem as any).studentsCount || classItem.students || 0;
  const avgStudentsPerSection = sectionsCount > 0 ? Math.round(studentsCount / sectionsCount) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-brand-soft/60 via-background to-background p-6 border-b border-border/70">
          <DialogHeader>
            <div className="flex items-center gap-3.5 pr-8">
              <div className="flex size-11 items-center justify-center rounded-xl bg-brand text-cream shadow-sm shrink-0">
                <GraduationCap className="size-5.5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground leading-tight truncate">
                  {classItem.className}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground/80">Grade {classItem.gradeLevel}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Building2 className="size-3 text-muted-foreground" />
                    {classItem.campus}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Dialog Body */}
        <div className="p-6 space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 bg-muted/30 rounded-xl border border-border/60 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Users className="size-3 text-muted-foreground" />
                <span>Total Students</span>
              </div>
              <span className="text-xl font-bold text-foreground tabular-nums mt-1 block">
                {studentsCount}
              </span>
            </div>

            <div className="p-3 bg-muted/30 rounded-xl border border-border/60 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Layers className="size-3 text-muted-foreground" />
                <span>Sections</span>
              </div>
              <span className="text-xl font-bold text-foreground tabular-nums mt-1 block">
                {sectionsCount}
              </span>
            </div>

            <div className="p-3 bg-muted/30 rounded-xl border border-border/60 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Award className="size-3 text-muted-foreground" />
                <span>Avg. / Section</span>
              </div>
              <span className="text-xl font-bold text-foreground tabular-nums mt-1 block">
                {avgStudentsPerSection}
              </span>
            </div>
          </div>

          {/* Allocation Details */}
          <div className="p-4 rounded-xl border border-border/70 bg-card/60 space-y-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider text-muted-foreground">
              Class Faculty & Campus Allocation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
                <div className="flex size-9 items-center justify-center rounded-full bg-brand-soft text-brand shrink-0">
                  <User className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-muted-foreground block">Assigned Class Teacher</span>
                  <span className="font-semibold text-foreground truncate block text-xs mt-0.5">
                    {classItem.classTeacher || (classItem as any).teacher || "Not Assigned"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
                <div className="flex size-9 items-center justify-center rounded-full bg-brand-soft text-brand shrink-0">
                  <Building2 className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-muted-foreground block">Campus Allocation</span>
                  <span className="font-semibold text-foreground truncate block text-xs mt-0.5">
                    {classItem.campus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Profile Details */}
          <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-2.5 text-xs">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider text-muted-foreground">
              Class Information
            </h3>
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 pt-1">
              <div>
                <span className="text-[11px] text-muted-foreground block">Academic Level</span>
                <span className="font-semibold text-foreground">Grade {classItem.gradeLevel}</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Active Status</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  {classItem.status || "Active"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Capacity Distribution</span>
                <span className="font-semibold text-foreground">
                  {sectionsCount} {sectionsCount === 1 ? "Section" : "Sections"} ({avgStudentsPerSection} per section)
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Total Enrollment</span>
                <span className="font-semibold text-foreground">{studentsCount} Enrolled Students</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
