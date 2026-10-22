"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Meter } from "@/components/shared/meter";
import { formatCampusDisplay, formatDate, initials } from "@/lib/format";
import type { Student } from "@/types";
import {
  Activity,
  Building2,
  Calendar,
  Check,
  Copy,
  CreditCard,
  GraduationCap,
  Hash,
  Phone,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

interface StudentDetailsDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentDetailsDialog({
  student,
  open,
  onOpenChange,
}: StudentDetailsDialogProps) {
  const [copied, setCopied] = React.useState(false);

  if (!student) return null;

  const campusInfo = formatCampusDisplay(student.campus);

  const handleCopySummary = () => {
    const summary = `Student Profile: ${student.name}
Admission No: ${student.admissionNumber}
Roll No: ${student.rollNo}
Class: ${student.className} - Section ${student.section}
Campus: ${campusInfo.primary} (${campusInfo.secondary || student.campus})
Guardian: ${student.guardian}
Phone: ${student.phone}
Attendance: ${student.attendance}%
Fee Status: ${student.feeStatus}
Status: ${student.status}
Enrolled: ${student.enrolledOn}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      toast.success("Profile Copied", {
        description: `Complete details for ${student.name} copied to clipboard.`,
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyPhone = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(student.phone);
      toast.success("Phone Number Copied", {
        description: `${student.phone} copied to clipboard.`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden sm:max-w-2xl border-border/80 shadow-2xl">
        {/* Header Banner */}
        <DialogHeader className="border-b border-border/70 bg-gradient-to-r from-brand-50/70 via-background to-background px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand text-cream shadow-sm font-heading font-bold text-base ring-2 ring-brand/20">
                {initials(student.name)}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="font-heading text-lg font-bold text-foreground">
                    {student.name}
                  </DialogTitle>
                  <StatusBadge status={student.status} dot={false} />
                  <StatusBadge status={student.feeStatus} dot={false} />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono font-semibold text-brand bg-brand-50 px-1.5 py-0.5 rounded">
                    {student.admissionNumber}
                  </span>
                  <span>·</span>
                  <span>Roll #{student.rollNo}</span>
                  <span>·</span>
                  <span>{student.gender}</span>
                  <span>·</span>
                  <span>Enrolled {formatDate(student.enrolledOn)}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="max-h-[66vh] overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin-light">
          {/* Grid Cards */}
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
                    {student.className} · Section {student.section}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Roll Number:</span>
                  <span className="font-mono font-medium text-foreground">
                    #{student.rollNo}
                  </span>
                </div>
                <div className="flex justify-between items-start py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Campus Branch:</span>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{campusInfo.primary}</p>
                    {campusInfo.secondary && (
                      <p className="text-[11px] text-muted-foreground">{campusInfo.secondary}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Academic Session:</span>
                  <span className="font-medium text-foreground">2026 - 2027</span>
                </div>
              </div>
            </div>

            {/* Guardian & Contact Card */}
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <UserCheck className="size-4 text-brand" />
                <span>Guardian & Contact</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Guardian Name:</span>
                  <span className="font-semibold text-foreground">{student.guardian}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Relationship:</span>
                  <span className="text-foreground">Parent / Legal Guardian</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Phone Number:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-medium text-foreground">{student.phone}</span>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="text-muted-foreground hover:text-brand transition-colors cursor-pointer p-0.5 rounded"
                      title="Copy phone number"
                    >
                      <Copy className="size-3" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Emergency Alerts:</span>
                  <span className="text-success font-medium flex items-center gap-1">
                    <Check className="size-3" /> Active (SMS / WhatsApp)
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance Overview Card */}
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Activity className="size-4 text-brand" />
                  <span>Attendance Record</span>
                </div>
                <span className="text-sm font-bold font-mono text-brand">
                  {student.attendance}%
                </span>
              </div>
              <div className="space-y-2">
                <Meter value={student.attendance} size="sm" gradient className="w-full" />
                <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-1">
                  <span>
                    {student.attendance >= 85 ? (
                      <span className="text-success font-medium">Excellent Attendance</span>
                    ) : student.attendance >= 75 ? (
                      <span className="text-brand font-medium">Satisfactory Attendance</span>
                    ) : (
                      <span className="text-warning font-medium">Attention Recommended</span>
                    )}
                  </span>
                  <span>Term Benchmark: 75%</span>
                </div>
              </div>
            </div>

            {/* Fee Status Overview Card */}
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <CreditCard className="size-4 text-brand" />
                  <span>Fee & Billing Status</span>
                </div>
                <StatusBadge status={student.feeStatus} dot={false} />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Current Challan:</span>
                  <span className="font-medium text-foreground">October 2026 Cycle</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Payment Clearance:</span>
                  <span className="text-foreground">
                    {student.feeStatus === "Paid"
                      ? "Fully Cleared"
                      : student.feeStatus === "Partial"
                      ? "Partially Received"
                      : "Pending Collection"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="m-0 border-t border-border/70 bg-muted/30 px-6 py-4 flex flex-row items-center justify-end gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopySummary}
            className="h-9 gap-2 px-4 rounded-lg text-xs font-semibold border-border/80 bg-background text-foreground/90 hover:bg-muted/70 hover:text-foreground shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-success" />
                <span className="text-success">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-muted-foreground" />
                <span>Copy Details</span>
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-lg text-xs font-semibold bg-brand text-cream hover:bg-brand-600 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
