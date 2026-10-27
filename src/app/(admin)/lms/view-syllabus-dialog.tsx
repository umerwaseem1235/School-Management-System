"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LmsCourse } from "@/types";
import { formatCompactClass } from "@/lib/mock/lms";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  GraduationCap,
  MapPin,
  Users,
  Layers,
  Calendar,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ViewSyllabusDialogProps {
  course: LmsCourse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAssignment?: () => void;
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

  if (subject.includes("math") || subject.includes("calculus")) {
    unitTemplates = [
      {
        title: "Unit 1: Number Systems & Algebraic Expressions",
        topics: "Sets, complex numbers, factorization, algebraic identities",
      },
      {
        title: "Unit 2: Quadratic Equations & Variations",
        topics: "Completing square, quadratic formula, direct and inverse variations",
      },
      {
        title: "Unit 3: Matrices, Determinants & Trigonometry",
        topics: "Cramer's rule, matrix inverse, trigonometric ratios, angle formulas",
      },
      {
        title: "Unit 4: Coordinate Geometry & Board Examination Revision",
        topics: "Distance formula, collinear points, 5-year past papers review",
      },
    ];
  } else if (subject.includes("phy")) {
    unitTemplates = [
      {
        title: "Unit 1: Physical Quantities & Kinematics",
        topics: "SI units, precision instruments, velocity, acceleration, motion graphs",
      },
      {
        title: "Unit 2: Dynamics, Work, Energy & Power",
        topics: "Newton's laws of motion, friction, conservation of energy, work done",
      },
      {
        title: "Unit 3: Wave Optics, Electricity & Magnetism",
        topics: "Ohm's law, circuits, electromagnetic induction, optical instruments",
      },
      {
        title: "Unit 4: Atomic Physics, Nuclear Radiation & Practicals",
        topics: "Half-life calculations, radioactivity, laboratory experiment logs",
      },
    ];
  } else if (subject.includes("chem")) {
    unitTemplates = [
      {
        title: "Unit 1: Fundamentals of Chemistry & Atomic Structure",
        topics: "Atomic number, isotopes, electronic configuration, Bohr model",
      },
      {
        title: "Unit 2: Periodic Table, Trends & Chemical Bonding",
        topics: "Ionic/covalent bonds, electronegativity, ionization energy trends",
      },
      {
        title: "Unit 3: States of Matter, Solutions & Electrochemistry",
        topics: "Gas laws, molarity, oxidation-reduction, electrolytic cells",
      },
      {
        title: "Unit 4: Organic Chemistry & Environmental Chemistry",
        topics: "Hydrocarbons, functional groups, atmospheric pollution, lab tests",
      },
    ];
  } else if (subject.includes("bio")) {
    unitTemplates = [
      {
        title: "Unit 1: Introduction to Biology & Cell Structure",
        topics: "Microscopy, organelle functions, plant vs animal cells, enzymes",
      },
      {
        title: "Unit 2: Cell Cycle, Meiosis & Plant Physiology",
        topics: "Mitosis stages, gamete formation, photosynthesis, transpiration",
      },
      {
        title: "Unit 3: Human Organ Systems & Genetics",
        topics: "Digestive/respiratory systems, Mendel's laws, DNA replication",
      },
      {
        title: "Unit 4: Ecology, Biotechnology & Exam Revision",
        topics: "Ecosystems, genetic engineering, high-yield board question bank",
      },
    ];
  } else if (subject.includes("comp") || subject.includes("cs")) {
    unitTemplates = [
      {
        title: "Unit 1: Fundamentals of Computer Architecture & OS",
        topics: "CPU components, memory hierarchy, software types, logic gates",
      },
      {
        title: "Unit 2: Computational Logic & Programming Basics",
        topics: "Flowcharts, algorithms, control structures, loops, data types",
      },
      {
        title: "Unit 3: Relational Database Systems & SQL",
        topics: "Database tables, primary/foreign keys, SELECT queries, JOINs",
      },
      {
        title: "Unit 4: Web Technologies, Networks & Practical Tasks",
        topics: "Network topologies, internet protocols, HTML/CSS, practical labs",
      },
    ];
  } else {
    unitTemplates = [
      {
        title: "Unit 1: Foundational Principles & Core Concepts",
        topics: "Definitions, historical context, core curriculum terminology",
      },
      {
        title: "Unit 2: Theoretical Models & Analytical Applications",
        topics: "Case studies, comparative analysis, standard framework studies",
      },
      {
        title: "Unit 3: Contemporary Practice & Applied Exercises",
        topics: "Guided exercises, essay compositions, critical review problems",
      },
      {
        title: "Unit 4: Syllabus Revision & Examination Preparation",
        topics: "Comprehensive review, past paper walkthroughs, model exam tests",
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
  onAddAssignment,
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
          {/* Executive Syllabus Progress Card */}
          <div className="p-4 rounded-xl border border-border/80 bg-gradient-to-r from-muted/40 via-muted/20 to-card space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-foreground">
                  Curriculum Progress Overview
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {completedLessons} of {totalLessons} planned lessons delivered
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono tracking-tight text-brand">
                  {progressPct}%
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  {completedUnits} of {units.length} Units Complete
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
              <div className="p-2 rounded-lg bg-card/60 border border-border/50">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Total Lessons
                </p>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {totalLessons}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-card/60 border border-border/50">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Completed
                </p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {completedLessons}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-card/60 border border-border/50">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Enrolled
                </p>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {course.enrolledStudents}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-card/60 border border-border/50">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Active Tasks
                </p>
                <p className="text-sm font-bold text-brand mt-0.5">
                  {course.activeAssignments}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Units Outline */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="size-3.5 text-brand" />
                Syllabus Units Breakdown ({units.length} Units)
              </h5>
              <span className="text-[11px] text-muted-foreground font-medium">
                Academic Year 2026-2027
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
