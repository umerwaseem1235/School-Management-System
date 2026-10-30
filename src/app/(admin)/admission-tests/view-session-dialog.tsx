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
  CalendarClock,
  GraduationCap,
  CalendarDays,
  Building2,
  User,
  Award,
  MapPin,
  ClipboardCheck,
  Clock,
} from "lucide-react";
import type {
  AdmissionTestSession,
  AdmissionApplicantRecord,
} from "@/lib/mock/admission-tests";

interface ViewSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: AdmissionTestSession | null;
  applicants: AdmissionApplicantRecord[];
  onOpenEvaluation: (sessionId: string) => void;
}

export function ViewSessionDialog({
  open,
  onOpenChange,
  session,
  applicants,
  onOpenEvaluation,
}: ViewSessionDialogProps) {
  const stats = React.useMemo(() => {
    if (!session || applicants.length === 0) return null;
    const total = applicants.length;
    const absent = applicants.filter((a) => a.isAbsent).length;
    const appeared = total - absent;
    const qualified = applicants.filter(
      (a) => !a.isAbsent && a.resultStatus === "Qualified"
    ).length;
    const passRate =
      appeared > 0 ? ((qualified / appeared) * 100).toFixed(1) : "0.0";

    return { total, appeared, absent, qualified, passRate };
  }, [session, applicants]);

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[88vh] p-0 gap-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-soft/60 via-background to-background px-6 py-4 border-b border-border/70 shrink-0">
          <DialogHeader>
            <div className="flex items-start gap-3 pr-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand text-cream shadow-sm shrink-0 mt-0.5">
                <CalendarClock className="size-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-brand">
                    Session {session.academicSession}
                  </span>
                  <StatusBadge
                    status={session.status}
                    tone={session.status === "Completed" ? "success" : "info"}
                    dot={false}
                  />
                </div>
                <DialogTitle className="text-base font-bold text-foreground leading-snug">
                  {session.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {session.classGroup}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-border/70 bg-muted/15 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <GraduationCap className="size-3.5 text-brand" />
                <span>Class Wing</span>
              </div>
              <p className="text-xs font-semibold text-foreground">
                {session.classGroup}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-muted/15 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <CalendarDays className="size-3.5 text-brand" />
                <span>Date & Timing</span>
              </div>
              <p className="text-xs font-semibold text-foreground">
                {formatDate(session.testDate)} • {session.timing}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-muted/15 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Building2 className="size-3.5 text-brand" />
                <span>Exam Hall / Venue</span>
              </div>
              <p className="text-xs font-semibold text-foreground">
                {session.roomHall}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-muted/15 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Award className="size-3.5 text-brand" />
                <span>Marks Criteria</span>
              </div>
              <p className="text-xs font-semibold text-foreground font-mono">
                Total: {session.totalMarks} · Qualifying: {session.qualifyingMarks}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-muted/15 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <User className="size-3.5 text-brand" />
                <span>Test Supervisor</span>
              </div>
              <p className="text-xs font-semibold text-foreground">
                {session.supervisor}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-muted/15 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <MapPin className="size-3.5 text-brand" />
                <span>Campus</span>
              </div>
              <p className="text-xs font-semibold text-foreground truncate">
                {session.campus}
              </p>
            </div>
          </div>

          {/* Subjects Tested */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground block">
              Subjects Tested
            </span>
            <p className="text-xs font-medium text-foreground">
              {session.subjectsTested}
            </p>
          </div>

          {/* Candidate Summary */}
          {session.status === "Completed" && stats ? (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground block">
                Candidate Summary
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-xl border border-border/70 bg-background p-3 text-center">
                  <span className="text-[11px] text-muted-foreground block">
                    Registered
                  </span>
                  <span className="text-sm font-bold font-mono text-foreground mt-0.5 block">
                    {stats.total}
                  </span>
                </div>
                <div className="rounded-xl border border-border/70 bg-background p-3 text-center">
                  <span className="text-[11px] text-muted-foreground block">
                    Appeared
                  </span>
                  <span className="text-sm font-bold font-mono text-foreground mt-0.5 block">
                    {stats.appeared}
                  </span>
                </div>
                <div className="rounded-xl border border-border/70 bg-background p-3 text-center">
                  <span className="text-[11px] text-muted-foreground block">
                    Qualified
                  </span>
                  <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {stats.qualified}
                  </span>
                </div>
                <div className="rounded-xl border border-border/70 bg-background p-3 text-center">
                  <span className="text-[11px] text-muted-foreground block">
                    Merit Rate
                  </span>
                  <span className="text-sm font-bold font-mono text-brand mt-0.5 block">
                    {stats.passRate}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-muted/15 px-3.5 py-3 text-xs text-muted-foreground">
              <Clock className="size-4 text-brand shrink-0" />
              <span>
                {applicants.length} registered applicants are scheduled for this
                session. Open evaluation once the test is conducted.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="m-0 px-6 py-4 border-t border-border/70 bg-muted/20 flex flex-row items-center justify-end shrink-0">
          <Button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onOpenEvaluation(session.id);
            }}
            className="h-9 px-5 rounded-lg text-xs font-semibold bg-brand text-cream hover:bg-brand-600 gap-1.5 shadow-xs cursor-pointer"
          >
            <ClipboardCheck className="size-3.5" />
            <span>
              {session.status === "Completed"
                ? "View / Edit Evaluation"
                : "Enter Test Marks"}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
