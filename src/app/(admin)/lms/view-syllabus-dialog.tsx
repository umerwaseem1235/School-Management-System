"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Meter } from "@/components/shared/meter";
import { StatusBadge } from "@/components/shared/status-badge";
import type { LmsCourse } from "@/types";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  GraduationCap,
  MapPin,
  Users,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

interface ViewSyllabusDialogProps {
  course: LmsCourse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAssignment?: () => void;
}

export function ViewSyllabusDialog({
  course,
  open,
  onOpenChange,
  onAddAssignment,
}: ViewSyllabusDialogProps) {
  if (!course) return null;

  const progressPct = Math.round(
    (course.completedLessons / course.totalLessons) * 100
  );

  // Generate mock syllabus units based on course
  const syllabusUnits = [
    {
      unit: "Unit 1: Fundamentals & Terminology",
      lessons: 6,
      status: "Completed",
      topics: ["Concept introduction", "Key definitions", "Standard formulas", "Solved exercise 1.1"],
    },
    {
      unit: "Unit 2: Core Theoretical Principles",
      lessons: 8,
      status: "Completed",
      topics: ["In-depth mechanics", "Derivations & proofs", "Real-world applications", "Mid-unit quiz"],
    },
    {
      unit: "Unit 3: Practical Experiments & Lab Calculations",
      lessons: 10,
      status: course.completedLessons >= 20 ? "Completed" : "In Progress",
      topics: ["Apparatus handling", "Data measurement", "Error margin analysis", "Lab report writing"],
    },
    {
      unit: "Unit 4: Board Examination Preparation & Past Papers",
      lessons: course.totalLessons - 24 > 0 ? course.totalLessons - 24 : 8,
      status: course.completedLessons === course.totalLessons ? "Completed" : "Upcoming",
      topics: ["5-Year past papers review", "High-yield topics", "Model paper mock exam", "Final Q&A session"],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border border-border shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 bg-muted/30 border-b border-border/60">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand shrink-0">
                <BookOpen className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold uppercase bg-brand-50 text-brand ring-1 ring-inset ring-brand/15">
                    {course.courseCode}
                  </span>
                  <StatusBadge status={course.status} dot={false} />
                </div>
                <DialogTitle className="text-base font-semibold text-foreground mt-1 truncate">
                  {course.title}
                </DialogTitle>
              </div>
            </div>
          </div>

          {/* Metadata chips */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 text-foreground font-medium">
              <GraduationCap className="size-3.5 text-muted-foreground" />
              {course.className}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5 text-muted-foreground" />
              {course.teacher}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5 text-muted-foreground" />
              {course.campus}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 p-3 bg-card rounded-xl border border-border/70 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <Layers className="size-3.5 text-brand" />
                Overall Syllabus Completion
              </span>
              <span className="font-bold text-foreground">
                {course.completedLessons} / {course.totalLessons} Lessons ({progressPct}%)
              </span>
            </div>
            <Meter value={progressPct} size="sm" tone={course.colorTone ?? "brand"} />
          </div>
        </DialogHeader>

        {/* Syllabus Units Breakdown */}
        <div className="px-6 py-4 space-y-3 max-h-[50vh] overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Course Curriculum Units ({syllabusUnits.length})
          </p>

          <div className="space-y-2.5">
            {syllabusUnits.map((u, idx) => {
              const isDone = u.status === "Completed";
              const isInProg = u.status === "In Progress";

              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-border/70 bg-card hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isDone ? (
                        <CheckCircle2 className="size-4 text-success shrink-0" />
                      ) : isInProg ? (
                        <Circle className="size-4 text-warning fill-warning/20 shrink-0" />
                      ) : (
                        <Circle className="size-4 text-muted-foreground/60 shrink-0" />
                      )}
                      <span className="text-xs font-semibold text-foreground">
                        {u.unit}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] uppercase font-semibold ${
                        isDone
                          ? "bg-success-soft text-success"
                          : isInProg
                          ? "bg-warning-soft text-warning"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {u.status}
                    </Badge>
                  </div>

                  <div className="mt-2 pl-6 flex flex-wrap items-center gap-1.5">
                    {u.topics.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] bg-muted/60 text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="px-6 py-3 border-t border-border/60 bg-muted/10 flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8 px-3"
          >
            Close
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              if (onAddAssignment) {
                onAddAssignment();
              } else {
                toast.success("Ready to publish a task for this syllabus");
              }
            }}
            className="text-xs h-8 px-3 bg-primary hover:bg-primary/90 text-white shadow-xs font-semibold"
          >
            + New Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
