"use client";

import * as React from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCampusDisplay, formatDate, initials } from "@/lib/format";
import type { AdmissionApplication } from "@/types";
import {
  Award,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  GraduationCap,
  Phone,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

interface AdmissionDetailsDialogProps {
  admission: AdmissionApplication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdmissionDetailsDialog({
  admission,
  open,
  onOpenChange,
}: AdmissionDetailsDialogProps) {
  const [copiedAll, setCopiedAll] = React.useState(false);
  const [copiedPhone, setCopiedPhone] = React.useState(false);

  if (!admission) return null;

  const campusInfo = formatCampusDisplay(admission.campus);
  const admissionNo =
    admission.admissionNumber ||
    `SMS-2026-${admission.id.slice(-4).toUpperCase()}`;

  const handleCopySummary = () => {
    const summary = `Enrolled Student Admission Record:
Student Name: ${admission.applicant}
Admission No: ${admissionNo}
Roll No: ${admission.rollNo || "N/A"}
Gender: ${admission.gender || "N/A"}
Class: ${admission.appliedClass}${admission.section ? ` - Section ${admission.section}` : ""}
Campus: ${campusInfo.primary} (${campusInfo.secondary || admission.campus})
Guardian / Parent: ${admission.guardian} (S/D of ${admission.guardian})
Contact Phone: ${admission.phone}
Admission Pathway: ${admission.admissionType || (admission.score ? "Entry Test" : "Direct Admission")}${admission.score ? ` (Score: ${admission.score}%)` : ""}
Status: Enrolled
Enrolled On: ${formatDate(admission.appliedOn)}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopiedAll(true);
      toast.success("Record Copied", {
        description: `Complete admission details for ${admission.applicant} copied to clipboard.`,
      });
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleCopyPhone = () => {
    if (navigator.clipboard && admission.phone) {
      navigator.clipboard.writeText(admission.phone);
      setCopiedPhone(true);
      toast.success("Phone Number Copied", {
        description: `${admission.phone} copied to clipboard.`,
      });
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const isTest =
    admission.admissionType === "Entry Test" || Boolean(admission.score);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden sm:max-w-2xl border-border/80 shadow-2xl">
        <DialogDescription className="sr-only">
          Detailed admission record and guardian information for {admission.applicant} ({admissionNo})
        </DialogDescription>

        {/* Header Banner */}
        <DialogHeader className="border-b border-border/70 bg-gradient-to-r from-brand-50/70 via-background to-background px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand text-cream shadow-sm font-heading font-bold text-base ring-2 ring-brand/20">
                {initials(admission.applicant)}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="font-heading text-lg font-bold text-foreground">
                    {admission.applicant}
                  </DialogTitle>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="size-3" />
                    Enrolled
                  </span>
                  {isTest ? (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Award className="size-3" />
                      Entry Test {admission.score ? `(${admission.score}%)` : ""}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200">
                      <GraduationCap className="size-3 text-slate-500" />
                      Direct Admission
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono font-semibold text-brand bg-brand-50 px-1.5 py-0.5 rounded border border-brand/20">
                    {admissionNo}
                  </span>
                  {admission.rollNo && (
                    <>
                      <span>·</span>
                      <span className="font-mono">Roll #{admission.rollNo}</span>
                    </>
                  )}
                  {admission.gender && (
                    <>
                      <span>·</span>
                      <span>{admission.gender}</span>
                    </>
                  )}
                  <span>·</span>
                  <span>Enrolled {formatDate(admission.appliedOn)}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="max-h-[66vh] overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin-light">
          {/* Guardian & Contact Card - MOVED FROM TABLE COLUMN */}
          <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <UserCheck className="size-4 text-brand" />
                <span>Guardian & Contact Information</span>
              </div>
              <span className="text-[11px] font-medium text-brand bg-brand-50/80 border border-brand/20 px-2 py-0.5 rounded-full">
                Primary Contact
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Guardian / Father Name
                </span>
                <p className="font-semibold text-foreground text-sm">
                  {admission.guardian || "Not specified"}
                </p>
                <p className="text-[11px] text-muted-foreground font-medium">
                  {admission.guardian ? `S/D of ${admission.guardian}` : "Parent / Legal Guardian"}
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Contact Phone Number
                  </span>
                  {admission.phone && (
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="inline-flex items-center gap-1 text-[11px] text-brand hover:underline font-medium cursor-pointer"
                      title="Copy phone number"
                    >
                      {copiedPhone ? (
                        <>
                          <Check className="size-3 text-success" />
                          <span className="text-success text-[10.5px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5 text-brand shrink-0" />
                  <a
                    href={admission.phone ? `tel:${admission.phone}` : undefined}
                    className="font-mono font-bold text-foreground text-sm hover:text-brand transition-colors"
                  >
                    {admission.phone || "No phone provided"}
                  </a>
                </div>
                <p className="text-[10.5px] text-success font-medium flex items-center gap-1">
                  <Check className="size-3" /> Active for SMS Notifications
                </p>
              </div>
            </div>
          </div>

          {/* Academic & Campus Placement Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Academic Information Card */}
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <GraduationCap className="size-4 text-brand" />
                <span>Academic Placement</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Class & Section:</span>
                  <span className="font-semibold text-foreground">
                    {admission.appliedClass}
                    {admission.section ? ` · Section ${admission.section}` : ""}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Roll Number:</span>
                  <span className="font-mono font-medium text-foreground">
                    {admission.rollNo ? `#${admission.rollNo}` : "Assigned in SIS"}
                  </span>
                </div>
                <div className="flex justify-between items-start py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Campus Branch:</span>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{campusInfo.primary}</p>
                    {campusInfo.secondary && (
                      <p className="text-[11px] text-muted-foreground">
                        {campusInfo.secondary}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Academic Session:</span>
                  <span className="font-medium text-foreground">2026 - 2027</span>
                </div>
              </div>
            </div>

            {/* Admission & Verification Details Card */}
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="size-4 text-brand" />
                <span>Admission Credentials</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Pathway:</span>
                  <span className="font-medium text-foreground">
                    {admission.admissionType || (admission.score ? "Entry Test" : "Direct Admission")}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Test Score:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {admission.score ? `${admission.score}% Merit` : "N/A (Walk-in)"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Enrollment Stage:</span>
                  <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Officially Enrolled
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">SIS Registration:</span>
                  <span className="text-success font-medium flex items-center gap-1">
                    <Check className="size-3" /> Confirmed in System
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="m-0 border-t border-border/70 bg-muted/30 px-6 py-4 flex flex-row items-center justify-between gap-3 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleCopySummary}
            className="gap-2 px-4 cursor-pointer"
          >
            {copiedAll ? (
              <>
                <Check className="size-3.5 text-success" />
                <span className="text-success">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-muted-foreground" />
                <span>Copy Record</span>
              </>
            )}
          </Button>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/students?search=${encodeURIComponent(admission.applicant)}`}
              onClick={() => onOpenChange(false)}
            >
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="gap-1.5 text-brand border-brand/30 hover:bg-brand-50 hover:text-brand cursor-pointer"
              >
                <span>Open in SIS</span>
                <ExternalLink className="size-3.5" />
              </Button>
            </Link>
            <Button
              type="button"
              size="lg"
              onClick={() => onOpenChange(false)}
              className="px-5 cursor-pointer"
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
