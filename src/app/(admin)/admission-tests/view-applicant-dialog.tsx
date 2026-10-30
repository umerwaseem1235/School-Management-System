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
import {
  User,
  Phone,
  GraduationCap,
  School,
  Award,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import type {
  AdmissionApplicantRecord,
  AdmissionTestSession,
  AdmissionDecision,
} from "@/lib/mock/admission-tests";

interface ViewApplicantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicant: AdmissionApplicantRecord | null;
  session: AdmissionTestSession | null;
  onUpdateDecision?: (applicantId: string, decision: AdmissionDecision) => void;
  onManualQualification?: (
    applicantId: string,
    status: "Qualified" | "Not Qualified"
  ) => void;
}

export function ViewApplicantDialog({
  open,
  onOpenChange,
  applicant,
  session,
  onUpdateDecision,
  onManualQualification,
}: ViewApplicantDialogProps) {
  if (!applicant) return null;

  const resultTone =
    applicant.resultStatus === "Qualified"
      ? "success"
      : applicant.resultStatus === "Absent"
      ? "neutral"
      : "danger";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[88vh] p-0 gap-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-soft/60 via-background to-background px-6 py-4 border-b border-border/70 shrink-0">
          <DialogHeader>
            <div className="flex items-start gap-3 pr-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand text-cream shadow-sm shrink-0 mt-0.5">
                <User className="size-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono font-semibold text-brand">
                    {applicant.formNo}
                  </span>
                  <StatusBadge
                    status={applicant.resultStatus}
                    tone={resultTone}
                    dot={false}
                  />
                  {applicant.isManualQualification && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/70">
                      Manual Override
                    </span>
                  )}
                </div>
                <DialogTitle className="text-base font-bold text-foreground leading-snug">
                  {applicant.applicantName}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Applied for {applicant.appliedClass}
                  {session ? ` • ${session.title}` : ""}
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
                <User className="size-3.5 text-brand" />
                <span>Father / Guardian Name</span>
              </div>
              <p className="text-xs font-semibold text-foreground">
                {applicant.fatherName}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-muted/15 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Phone className="size-3.5 text-brand" />
                <span>Guardian Contact</span>
              </div>
              <p className="text-xs font-semibold font-mono text-foreground">
                {applicant.phone}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-muted/15 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <GraduationCap className="size-3.5 text-brand" />
                <span>Applied Class</span>
              </div>
              <p className="text-xs font-semibold text-foreground">
                {applicant.appliedClass}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-muted/15 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <School className="size-3.5 text-brand" />
                <span>Previous School</span>
              </div>
              <p className="text-xs font-semibold text-foreground truncate">
                {applicant.previousSchool}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-muted/15 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Award className="size-3.5 text-brand" />
                <span>Entry Test Score</span>
              </div>
              <p className="text-xs font-semibold font-mono text-foreground">
                {applicant.isAbsent
                  ? "Absent"
                  : `${applicant.obtainedMarks} / ${applicant.totalMarks} (${applicant.percentage}%)`}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-muted/15 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <FileText className="size-3.5 text-brand" />
                <span>Admission Decision</span>
              </div>
              <div className="pt-0.5">
                <StatusBadge status={applicant.decision} dot={false} />
              </div>
            </div>
          </div>

          {session && (
            <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground block">
                Subjects Evaluated
              </span>
              <p className="text-xs font-medium text-foreground">
                {session.subjectsTested}
              </p>
            </div>
          )}

          <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground block">
              Evaluation Remarks
            </span>
            <p className="text-xs font-medium text-foreground">
              {applicant.remarks}
            </p>
          </div>
        </div>

        {/* Footer Controls */}
        {(onUpdateDecision || onManualQualification) && !applicant.isAbsent && (
          <DialogFooter className="m-0 px-6 py-4 border-t border-border/70 bg-muted/20 flex flex-row flex-wrap items-center justify-between gap-2.5 shrink-0">
            <div>
              {onManualQualification &&
                applicant.resultStatus === "Qualified" && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      onManualQualification(applicant.id, "Not Qualified");
                      onOpenChange(false);
                    }}
                    className="h-9 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:text-danger hover:bg-danger-soft/60 gap-1.5 cursor-pointer"
                  >
                    <XCircle className="size-3.5" />
                    <span>Mark Not Qualified</span>
                  </Button>
                )}
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              {applicant.resultStatus === "Not Qualified" &&
                onManualQualification && (
                  <Button
                    type="button"
                    onClick={() => {
                      onManualQualification(applicant.id, "Qualified");
                      onOpenChange(false);
                    }}
                    className="h-9 px-5 rounded-lg text-xs font-semibold bg-brand text-cream hover:bg-brand-600 gap-1.5 shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span>Qualify Candidate</span>
                  </Button>
                )}

              {applicant.resultStatus === "Qualified" && onUpdateDecision && (
                <>
                  {applicant.decision !== "Waitlisted" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        onUpdateDecision(applicant.id, "Waitlisted");
                        onOpenChange(false);
                      }}
                      className="h-9 px-4 rounded-lg text-xs font-semibold gap-1.5 cursor-pointer"
                    >
                      <Clock className="size-3.5" />
                      <span>Move to Waitlist</span>
                    </Button>
                  )}
                  {applicant.decision !== "Approved" && (
                    <Button
                      type="button"
                      onClick={() => {
                        onUpdateDecision(applicant.id, "Approved");
                        onOpenChange(false);
                      }}
                      className="h-9 px-5 rounded-lg text-xs font-semibold bg-brand text-cream hover:bg-brand-600 gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>Approve Admission</span>
                    </Button>
                  )}
                </>
              )}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
