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
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import {
  FileText,
  BookOpen,
  CalendarDays,
  GraduationCap,
  User,
  Building2,
  Award,
  Edit3,
  Printer,
  Clock,
} from "lucide-react";
import type { ClassTest, StudentTestMark } from "@/lib/mock/tests-assessments";

interface ViewTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: ClassTest | null;
  marks: StudentTestMark[];
  onOpenMarks: (testId: string) => void;
  onPrintAwardList: (test: ClassTest) => void;
}

export function ViewTestDialog({
  open,
  onOpenChange,
  test,
  marks,
  onOpenMarks,
  onPrintAwardList,
}: ViewTestDialogProps) {
  const summary = React.useMemo(() => {
    if (!test || marks.length === 0) return null;
    const total = marks.length;
    const absent = marks.filter((m) => m.isAbsent).length;
    const appeared = total - absent;
    const passed = marks.filter((m) => !m.isAbsent && m.status === "Pass").length;
    const passRate =
      appeared > 0 ? ((passed / appeared) * 100).toFixed(1) : "0.0";
    const highest =
      appeared > 0
        ? Math.max(
            ...marks.filter((m) => !m.isAbsent).map((m) => m.obtainedMarks)
          )
        : 0;
    const average =
      appeared > 0
        ? (
            marks
              .filter((m) => !m.isAbsent)
              .reduce((acc, m) => acc + m.obtainedMarks, 0) / appeared
          ).toFixed(1)
        : "0.0";

    return {
      total,
      appeared,
      absent,
      passed,
      passRate,
      highest,
      average,
    };
  }, [test, marks]);

  if (!test) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[88vh] p-0 gap-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-soft/60 via-background to-background px-6 py-4 border-b border-border/70 shrink-0">
          <DialogHeader>
            <div className="flex items-start gap-3 pr-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand text-cream shadow-sm shrink-0 mt-0.5">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-brand">
                    {test.testType}
                  </span>
                  <StatusBadge
                    status={test.status}
                    tone={test.status === "Graded" ? "success" : "info"}
                    dot={false}
                  />
                </div>
                <DialogTitle className="text-base font-bold text-foreground leading-snug">
                  {test.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {test.className} (Section {test.section}) • {test.subject}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Details Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Structured Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-border/70 bg-muted/15 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <GraduationCap className="size-3.5 text-brand" />
                <span>Class & Section</span>
              </div>
              <p className="text-xs font-semibold text-foreground">
                {test.className} — Sec {test.section}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-muted/15 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <BookOpen className="size-3.5 text-brand" />
                <span>Subject & Code</span>
              </div>
              <p className="text-xs font-semibold text-foreground">
                {test.subject}{" "}
                <span className="font-mono text-muted-foreground font-medium">
                  ({test.subjectCode})
                </span>
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-muted/15 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <CalendarDays className="size-3.5 text-brand" />
                <span>Test Date</span>
              </div>
              <p className="text-xs font-semibold text-foreground">
                {formatDate(test.testDate)}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-muted/15 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Award className="size-3.5 text-brand" />
                <span>Marks Allocation</span>
              </div>
              <p className="text-xs font-semibold text-foreground font-mono">
                Total: {test.totalMarks} · Pass: {test.passingMarks} (33%)
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-muted/15 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <User className="size-3.5 text-brand" />
                <span>Subject Teacher</span>
              </div>
              <p className="text-xs font-semibold text-foreground">
                {test.teacherName}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-muted/15 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Building2 className="size-3.5 text-brand" />
                <span>Campus</span>
              </div>
              <p className="text-xs font-semibold text-foreground truncate">
                {test.campus}
              </p>
            </div>
          </div>

          {/* Syllabus / Topics Covered */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground block">
              Syllabus / Chapter Topics Covered
            </span>
            <p className="text-xs font-medium text-foreground leading-relaxed">
              {test.chapterOrTopic}
            </p>
          </div>

          {/* Evaluation Summary */}
          {test.status === "Graded" && summary ? (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground block">
                Result Snapshot
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-xl border border-border/70 bg-background p-3 text-center">
                  <span className="text-[11px] text-muted-foreground block">
                    Appeared
                  </span>
                  <span className="text-sm font-bold font-mono text-foreground mt-0.5 block">
                    {summary.appeared}/{summary.total}
                  </span>
                </div>
                <div className="rounded-xl border border-border/70 bg-background p-3 text-center">
                  <span className="text-[11px] text-muted-foreground block">
                    Pass Rate
                  </span>
                  <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {summary.passRate}%
                  </span>
                </div>
                <div className="rounded-xl border border-border/70 bg-background p-3 text-center">
                  <span className="text-[11px] text-muted-foreground block">
                    Class Avg
                  </span>
                  <span className="text-sm font-bold font-mono text-foreground mt-0.5 block">
                    {summary.average}/{test.totalMarks}
                  </span>
                </div>
                <div className="rounded-xl border border-border/70 bg-background p-3 text-center">
                  <span className="text-[11px] text-muted-foreground block">
                    Highest
                  </span>
                  <span className="text-sm font-bold font-mono text-brand mt-0.5 block">
                    {summary.highest}/{test.totalMarks}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-muted/15 px-3.5 py-3 text-xs text-muted-foreground">
              <Clock className="size-4 text-brand shrink-0" />
              <span>
                Marks have not been recorded yet for this scheduled test. Use{" "}
                <strong className="text-foreground">Enter Marks</strong> once the
                assessment is conducted.
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="m-0 px-6 py-4 border-t border-border/70 bg-muted/20 flex flex-row items-center justify-end gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onPrintAwardList(test);
            }}
            className="h-9 px-4 text-xs font-semibold gap-1.5 rounded-lg cursor-pointer"
          >
            <Printer className="size-3.5" />
            <span>Award List</span>
          </Button>
          <Button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onOpenMarks(test.id);
            }}
            className="h-9 px-5 text-xs font-semibold bg-brand text-cream hover:bg-brand-600 gap-1.5 rounded-lg shadow-xs cursor-pointer"
          >
            <Edit3 className="size-3.5" />
            <span>{test.status === "Graded" ? "View / Edit Marks" : "Enter Marks"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
