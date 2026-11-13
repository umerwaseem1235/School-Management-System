"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LmsCourse } from "@/types";
import { formatCompactClass } from "@/lib/mock/lms";
import {
  BookOpen,
  Circle,
  Clock,
  GraduationCap,
  MapPin,
  Users,
  Layers,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewSyllabusDialogProps {
  course: LmsCourse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SyllabusUnit {
  unitNumber: number;
  title: string;
  totalLessons: number;
  completedLessons: number;
  status: "Completed" | "In Progress" | "Upcoming";
  topics: string;
}

function getSubjectUnits(course: LmsCourse): SyllabusUnit[] {
  const total = Math.max(course.totalLessons, 4);
  const completed = Math.min(course.completedLessons, total);

  // Divide total lessons evenly into 4 academic units
  const u1 = Math.round(total * 0.25);
  const u2 = Math.round(total * 0.25);
  const u3 = Math.round(total * 0.25);
  const u4 = Math.max(1, total - (u1 + u2 + u3));
  const unitTotals = [u1, u2, u3, u4];

  const subject = (course.subject || course.title).toLowerCase();

  let unitTemplates: { title: string; topics: string }[] = [];

  if (subject.includes("math")) {
    unitTemplates = [
      {
        title: "Term 1: Numbers & Basic Algebra",
        topics: "Whole numbers, fractions, algebraic expressions, linear equations",
      },
      {
        title: "Term 2: Equations, Ratio & Proportion",
        topics: "Quadratic equations, ratios, percentages, word problems",
      },
      {
        title: "Term 3: Geometry & Measurements",
        topics: "Angles, triangles, area, perimeter, practical geometry",
      },
      {
        title: "Final Review: Practice Exercises & Tests",
        topics: "Chapter worksheets, class tests, annual exam revision",
      },
    ];
  } else if (subject.includes("phy")) {
    unitTemplates = [
      {
        title: "Term 1: Measurement & Motion",
        topics: "Physical quantities, measuring instruments, speed, velocity",
      },
      {
        title: "Term 2: Force, Work & Energy",
        topics: "Newton's laws of motion, friction, work, energy forms",
      },
      {
        title: "Term 3: Heat, Light & Electricity",
        topics: "Temperature, reflection of light, basic circuits, magnets",
      },
      {
        title: "Final Review: Numericals & Class Revision",
        topics: "Textbook numericals, diagram practice, term exam review",
      },
    ];
  } else if (subject.includes("chem")) {
    unitTemplates = [
      {
        title: "Term 1: Matter & Atomic Structure",
        topics: "Elements, compounds, mixtures, atomic number and shells",
      },
      {
        title: "Term 2: Periodic Table & Chemical Bonding",
        topics: "Metals and non-metals, ionic and covalent bonds",
      },
      {
        title: "Term 3: Solutions, Acids & Bases",
        topics: "Acids, bases, salts, pH scale, everyday reactions",
      },
      {
        title: "Final Review: Equations & Chapter Tests",
        topics: "Balancing equations, short questions, annual revision",
      },
    ];
  } else if (subject.includes("bio")) {
    unitTemplates = [
      {
        title: "Term 1: Cells & Living Organisms",
        topics: "Plant and animal cells, microscope use, tissues and organs",
      },
      {
        title: "Term 2: Nutrition & Respiration",
        topics: "Photosynthesis, human digestive system, breathing",
      },
      {
        title: "Term 3: Transport & Coordination",
        topics: "Blood circulation, transport in plants, sense organs",
      },
      {
        title: "Final Review: Labeled Diagrams & Tests",
        topics: "Diagram practice, key terms, annual exam preparation",
      },
    ];
  } else if (subject.includes("comp") || subject.includes("cs")) {
    unitTemplates = [
      {
        title: "Term 1: Computer Basics & Hardware",
        topics: "Input/output devices, CPU, storage, operating systems",
      },
      {
        title: "Term 2: Problem Solving & Flowcharts",
        topics: "Algorithms, flowcharts, binary numbers, logic basics",
      },
      {
        title: "Term 3: Office Tools & Internet Safety",
        topics: "Word processing, spreadsheets, HTML basics, safe browsing",
      },
      {
        title: "Final Review: Practical Exercises & Tests",
        topics: "Lab worksheets, short questions, annual exam revision",
      },
    ];
  } else {
    unitTemplates = [
      {
        title: "Term 1: Reading & Core Chapters",
        topics: "Foundational chapters, key vocabulary, class reading",
      },
      {
        title: "Term 2: Grammar & Written Exercises",
        topics: "Textbook exercises, short questions, comprehension",
      },
      {
        title: "Term 3: Practice & Classwork Activities",
        topics: "Guided notebook work, compositions, class quizzes",
      },
      {
        title: "Final Review: Revision & Model Tests",
        topics: "Full syllabus review, practice tests, exam preparation",
      },
    ];
  }

  let remaining = completed;

  return unitTotals.map((uTotal, idx) => {
    const uDone = Math.min(remaining, uTotal);
    remaining = Math.max(0, remaining - uDone);

    let status: "Completed" | "In Progress" | "Upcoming" = "Upcoming";
    if (uDone === uTotal && uTotal > 0) {
      status = "Completed";
    } else if (uDone > 0) {
      status = "In Progress";
    }

    return {
      unitNumber: idx + 1,
      title: unitTemplates[idx].title,
      totalLessons: uTotal,
      completedLessons: uDone,
      status,
      topics: unitTemplates[idx].topics,
    };
  });
}

export function ViewSyllabusDialog({
  course,
  open,
  onOpenChange,
}: ViewSyllabusDialogProps) {
  if (!course) return null;

  const cleanCourseName =
    course.subject === "Science"
      ? "General Science"
      : course.subject === "Education (Ilm-ut-Taleem)"
      ? "Education"
      : course.subject || course.title;

  const compactClass = formatCompactClass(course.className);
  const totalLessons = Math.max(course.totalLessons, 1);
  const completedLessons = Math.min(course.completedLessons, totalLessons);
  const progressPct = Math.round((completedLessons / totalLessons) * 100);

  const units = getSubjectUnits(course);
  const completedUnits = units.filter((u) => u.status === "Completed").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] md:max-w-[800px] w-full p-0 overflow-hidden rounded-2xl border border-border shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 bg-muted/30 border-b border-border/60 pr-12">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand shrink-0">
                <BookOpen className="size-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold text-foreground truncate">
                  {cleanCourseName}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <GraduationCap className="size-3.5 text-muted-foreground" />
                    {compactClass}
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
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="px-6 py-5 pb-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Syllabus Progress Card */}
          <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-foreground">
                  Syllabus Progress
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {completedLessons} of {totalLessons} lessons taught
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono tracking-tight text-brand">
                  {progressPct}%
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  {completedUnits} of {units.length} Terms Done
                </span>
              </div>
            </div>

            {/* Clean Progress Meter */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border/40">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  progressPct >= 90
                    ? "bg-emerald-500"
                    : progressPct >= 50
                    ? "bg-brand"
                    : "bg-amber-500"
                )}
                style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
              />
            </div>

            {/* 4 Clean Key Metrics */}
            <div className="grid grid-cols-4 gap-2.5 pt-2.5 border-t border-border/50 text-center">
              <div className="p-2 rounded-lg bg-card/70 border border-border/50">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Lessons
                </p>
                <p className="text-sm font-bold text-foreground mt-0.5 tabular-nums">
                  {totalLessons}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-card/70 border border-border/50">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Completed
                </p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                  {completedLessons}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-card/70 border border-border/50">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Students
                </p>
                <p className="text-sm font-bold text-foreground mt-0.5 tabular-nums">
                  {course.enrolledStudents}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-card/70 border border-border/50">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Homework
                </p>
                <p className="text-sm font-bold text-brand mt-0.5 tabular-nums">
                  {course.activeAssignments}
                </p>
              </div>
            </div>
          </div>

          {/* Syllabus Plan */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="size-3.5 text-brand" />
                Term Syllabus Plan ({units.length} Terms)
              </h5>
              <span className="text-[11px] text-muted-foreground font-medium">
                Session 2026-2027
              </span>
            </div>

            <div className="space-y-2">
              {units.map((u) => {
                const isDone = u.status === "Completed";
                const isInProg = u.status === "In Progress";

                return (
                  <div
                    key={u.unitNumber}
                    className="p-3.5 rounded-xl border border-border/70 bg-card hover:bg-muted/15 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <div className="size-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <Check className="size-3 stroke-[2.5]" />
                          </div>
                        ) : isInProg ? (
                          <div className="size-5 rounded-full bg-brand-soft text-brand flex items-center justify-center">
                            <Clock className="size-3 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div className="size-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                            <Circle className="size-2.5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h6 className="text-xs font-bold text-foreground truncate">
                            {u.title}
                          </h6>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          {u.topics}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={cn(
                          "inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border",
                          isDone
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : isInProg
                            ? "bg-brand/10 text-brand border-brand/20"
                            : "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        {u.status}
                      </span>
                      <span className="block text-[11px] font-medium text-muted-foreground mt-1 tabular-nums">
                        {u.completedLessons} / {u.totalLessons} lessons
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
