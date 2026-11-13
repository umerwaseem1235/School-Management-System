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
  Clock,
  BookOpen,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  DoorOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewClassDialogProps {
  classItem: AcademicClass | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SECTION_CO_INCHARGES = [
  "Mrs. Nida Farooq",
  "Ms. Ayesha Khan",
  "Mr. Tariq Mehmood",
  "Ms. Sadia Munir",
  "Mr. Bilal Saeed",
];

export function ViewClassDialog({
  classItem,
  open,
  onOpenChange,
}: ViewClassDialogProps) {
  if (!classItem) return null;

  const sectionsCount = (classItem as any).sectionsCount || classItem.sections || 1;
  const studentsCount = (classItem as any).studentsCount || classItem.students || 0;
  const avgStudentsPerSection =
    sectionsCount > 0 ? Math.round(studentsCount / sectionsCount) : 0;

  // Generate sections list based on sectionsCount
  const sectionLetters = ["A", "B", "C", "D", "E", "F"].slice(0, Math.max(1, sectionsCount));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl border border-border shadow-2xl bg-card">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-[#7c4424]/15 via-brand-50/40 to-background p-6 border-b border-border/80">
          <DialogHeader>
            <div className="flex items-center gap-4 pr-8">
              <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-b from-[#6e3b1f] to-[#381e0f] text-white shadow-md shrink-0 ring-1 ring-white/10">
                <GraduationCap className="size-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg font-bold text-foreground leading-tight truncate">
                    {classItem.className}
                  </DialogTitle>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    {classItem.status || "Active"}
                  </span>
                </div>
                <DialogDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground/80">
                    Grade {classItem.gradeLevel}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Building2 className="size-3 text-muted-foreground" />
                    {classItem.campus}
                  </span>
                  <span>•</span>
                  <span>AY 2026–27</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Dialog Body */}
        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-muted/30 rounded-xl border border-border/60 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Users className="size-3 text-brand" />
                <span>Total Students</span>
              </div>
              <span className="text-xl font-bold text-foreground tabular-nums mt-1 block">
                {studentsCount}
              </span>
            </div>

            <div className="p-3 bg-muted/30 rounded-xl border border-border/60 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Layers className="size-3 text-brand" />
                <span>Active Sections</span>
              </div>
              <span className="text-xl font-bold text-foreground tabular-nums mt-1 block">
                {sectionsCount}
              </span>
            </div>

            <div className="p-3 bg-muted/30 rounded-xl border border-border/60 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Award className="size-3 text-brand" />
                <span>Avg. / Section</span>
              </div>
              <span className="text-xl font-bold text-foreground tabular-nums mt-1 block">
                {avgStudentsPerSection}
              </span>
            </div>

            <div className="p-3 bg-muted/30 rounded-xl border border-border/60 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground">
                <BookOpen className="size-3 text-brand" />
                <span>Curriculum</span>
              </div>
              <span className="text-xl font-bold text-foreground tabular-nums mt-1 block">
                {classItem.subjects || 7} Subjects
              </span>
            </div>
          </div>

          {/* Section Information Directory */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="size-3.5 text-brand" />
                <span>Class & Section Roster ({sectionsCount} Sections)</span>
              </h3>
              <span className="text-[11px] text-muted-foreground font-medium">
                Standard Section Capacity: 35 Students
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sectionLetters.map((letter, idx) => {
                const incharge =
                  idx === 0
                    ? classItem.classTeacher || SECTION_CO_INCHARGES[0]
                    : SECTION_CO_INCHARGES[idx % SECTION_CO_INCHARGES.length];
                const roomNo = `Room ${classItem.gradeLevel}0${idx + 1} (Wing A)`;

                return (
                  <div
                    key={letter}
                    className="group relative rounded-xl border border-brand/15 bg-white p-3.5 shadow-2xs hover:border-brand/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-brand text-white text-xs font-bold font-mono shadow-2xs">
                        Section {letter}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Active
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-[10px] font-medium text-muted-foreground block">
                          Section Incharge
                        </span>
                        <span className="font-semibold text-foreground text-xs truncate block">
                          {incharge}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/50">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <DoorOpen className="size-3" />
                          {roomNo}
                        </span>
                        <span className="font-mono font-bold text-brand">
                          {avgStudentsPerSection} / 35
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Academic & Class Overview */}
          <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-brand" />
              <span>Class Profile & Academic Framework</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs pt-1">
              <div>
                <span className="text-[11px] text-muted-foreground block">Academic Level</span>
                <span className="font-semibold text-foreground">Grade {classItem.gradeLevel}</span>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Academic Stream</span>
                <span className="font-semibold text-foreground">
                  {classItem.stream || "General Academic"}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Head Class Teacher</span>
                <span className="font-semibold text-foreground">
                  {classItem.classTeacher || "Not Assigned"}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Medium of Instruction</span>
                <span className="font-semibold text-foreground">English Medium (Oxford/FBISE)</span>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Shift & Timings</span>
                <span className="font-semibold text-foreground">Morning (08:00 AM – 01:45 PM)</span>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Attendance Mandate</span>
                <span className="font-semibold text-brand">75% Mandatory Physical</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-border bg-muted/10">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs font-semibold cursor-pointer"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
