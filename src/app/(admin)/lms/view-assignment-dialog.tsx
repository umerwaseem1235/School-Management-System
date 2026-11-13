"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { LmsAssignment } from "@/types";
import { formatCompactClass, formatCourseSubject, formatLmsDate } from "@/lib/mock/lms";
import {
  FileText,
  Calendar,
  Users,
  GraduationCap,
  BookOpen,
  FileCheck,
  BellRing,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ViewAssignmentDialogProps {
  assignment: LmsAssignment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleGraded?: (assignmentId: string) => void;
}

export function ViewAssignmentDialog({
  assignment,
  open,
  onOpenChange,
  onToggleGraded,
}: ViewAssignmentDialogProps) {
  if (!assignment) return null;

  const compactClass = formatCompactClass(assignment.className);
  const cleanSubject = formatCourseSubject(assignment.courseName);
  const total = Math.max(assignment.totalStudents, 1);
  const submitted = Math.min(assignment.totalSubmissions, total);
  const pending = Math.max(0, total - submitted);
  const submissionPct = Math.round((submitted / total) * 100);
  const isPast = new Date(assignment.dueDate) < new Date("2026-10-20");
  const dueDateFormatted = formatLmsDate(assignment.dueDate);

  const handleNotifyPending = () => {
    if (pending === 0) {
      toast.info("All homework checked", {
        description: "All students have submitted this homework.",
      });
      return;
    }
    toast.success("Reminder Sent", {
      description: `Reminder sent to ${pending} pending students in ${compactClass}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] w-full p-0 overflow-hidden rounded-2xl border border-border shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 bg-muted/30 border-b border-border/60 pr-12">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand shrink-0">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold text-foreground truncate">
                  {assignment.title}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <GraduationCap className="size-3.5 text-muted-foreground" />
                    {compactClass}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="size-3.5 text-muted-foreground" />
                    {cleanSubject}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5 text-muted-foreground" />
                    {assignment.teacher}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="px-6 py-5 pb-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Submission Progress Card */}
          <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-foreground">
                  Homework Submissions
                </p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Calendar className="size-3 text-muted-foreground" />
                  <span>Due on {dueDateFormatted}</span>
                  <span>•</span>
                  <span>{assignment.maxMarks} Total Marks</span>
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-xl font-bold font-mono tracking-tight text-brand">
                    {submissionPct}%
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    {submitted} of {total} Submitted
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (onToggleGraded) {
                      onToggleGraded(assignment.id);
                    }
                    onOpenChange(false);
                  }}
                  className={cn(
                    "text-xs h-8 px-3 font-semibold cursor-pointer shadow-xs gap-1.5 transition-colors",
                    assignment.status === "Graded"
                      ? "bg-muted hover:bg-muted/80 text-foreground border border-border"
                      : "bg-primary hover:bg-primary/90 text-white"
                  )}
                  title={assignment.status === "Graded" ? "Reopen homework submissions" : "Mark homework as checked"}
                >
                  <FileCheck className="size-3.5" />
                  <span>{assignment.status === "Graded" ? "Reopen" : "Mark Checked"}</span>
                </Button>
              </div>
            </div>

            <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border/40">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  submissionPct === 100
                    ? "bg-emerald-500"
                    : submissionPct >= 75
                    ? "bg-brand"
                    : "bg-amber-500"
                )}
                style={{ width: `${Math.min(100, Math.max(0, submissionPct))}%` }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2.5 pt-2.5 border-t border-border/50 text-center">
              <div className="p-2 rounded-lg bg-card/70 border border-border/50">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Students
                </p>
                <p className="text-sm font-bold text-foreground mt-0.5 tabular-nums">
                  {total}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-card/70 border border-border/50">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Submitted
                </p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                  {submitted}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-card/70 border border-border/50">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Pending
                </p>
                <p className={cn("text-sm font-bold mt-0.5 tabular-nums", pending > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>
                  {pending}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-card/70 border border-border/50">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Marks
                </p>
                <p className="text-sm font-bold text-brand mt-0.5 tabular-nums">
                  {assignment.maxMarks}
                </p>
              </div>
            </div>
          </div>

          {/* Homework Details Card */}
          <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-brand-soft text-brand">
                  <BookOpen className="size-3.5" />
                </div>
                <h5 className="text-xs font-bold text-foreground">
                  Homework Details
                </h5>
              </div>
              {pending > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleNotifyPending}
                  className="h-7 px-2.5 text-[11px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Send reminder to students with pending homework"
                >
                  <BellRing className="size-3" />
                  <span>Send Reminder</span>
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Students should complete the assigned exercises neatly in their classwork/homework notebook and submit on or before the due date.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/50 text-xs">
              <div>
                <span className="text-[11px] text-muted-foreground block">Class</span>
                <span className="font-semibold text-foreground">{compactClass}</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Subject</span>
                <span className="font-semibold text-foreground">{cleanSubject}</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Teacher</span>
                <span className="font-semibold text-foreground">{assignment.teacher}</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Due Date</span>
                <span className={cn("font-semibold", isPast ? "text-rose-600 dark:text-rose-400" : "text-foreground")}>
                  {dueDateFormatted} {isPast && "(Past Due)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
