"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatCampusDisplay } from "@/lib/format";
import { useBranches } from "@/context/branches-context";
import type { StudentStatus } from "@/types";
import {
  ACADEMIC_SESSIONS,
  APPLYING_CLASSES,
  SECTIONS,
  type AdmissionFormState,
} from "./admission-form-types";
import {
  Award,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  GraduationCap,
  History,
  School,
  Sparkles,
} from "lucide-react";

interface StepAcademicInfoProps {
  form: AdmissionFormState;
  errors: Record<string, string>;
  onChange: <K extends keyof AdmissionFormState>(
    field: K,
    value: AdmissionFormState[K]
  ) => void;
  onClearError: (field: string) => void;
}

export function StepAcademicInfo({
  form,
  errors,
  onChange,
  onClearError,
}: StepAcademicInfoProps) {
  const { activeBranches } = useBranches();

  const handlePreviousSchoolChoice = (choice: "Yes" | "No") => {
    onChange("previousSchoolAttended", choice);
    if (choice === "No") {
      // Clear previous school fields cleanly when student is joining for the first time
      onChange("previousSchoolName", "");
      onChange("previousClass", "");
      onChange("previousAcademicRecord", "");
      onChange("transferCertificateStatus", "Not Applicable");
      onChange("transferCertificateNo", "");
      onChange("admissionCategory", "New");
      onClearError("previousSchoolName");
      onClearError("previousClass");
    } else {
      onChange("admissionCategory", "Transfer");
      if (form.transferCertificateStatus === "Not Applicable") {
        onChange("transferCertificateStatus", "Submitted");
      }
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in-0 slide-in-from-right-2 duration-200">
      {/* Admission Placement & Session */}
      <div className="rounded-xl border border-border/80 bg-card p-4 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-brand-50 text-brand flex items-center justify-center">
            <GraduationCap className="size-4" />
          </div>
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Academic Session & Class Placement
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Academic Session */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Academic Session <span className="text-danger">*</span>
            </Label>
            <Select
              value={form.academicSession}
              onValueChange={(val) => {
                if (val) {
                  onChange("academicSession", val);
                  onClearError("academicSession");
                }
              }}
            >
              <SelectTrigger className="h-9.5 text-sm w-full">
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                {ACADEMIC_SESSIONS.map((ses) => (
                  <SelectItem key={ses} value={ses}>
                    {ses}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Admission Date */}
          <div className="space-y-1.5">
            <Label htmlFor="adm-date" className="text-xs font-semibold flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              Admission Date <span className="text-danger">*</span>
            </Label>
            <Input
              id="adm-date"
              type="date"
              value={form.admissionDate}
              onChange={(e) => {
                onChange("admissionDate", e.target.value);
                onClearError("admissionDate");
              }}
              className={cn(
                "h-9.5 text-sm",
                errors.admissionDate && "border-danger focus-visible:ring-danger/20"
              )}
            />
            {errors.admissionDate && (
              <p className="text-[11px] text-danger">{errors.admissionDate}</p>
            )}
          </div>

          {/* Applying Class */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Applying Class <span className="text-danger">*</span>
            </Label>
            <Select
              value={form.applyingClass}
              onValueChange={(val) => {
                if (val) {
                  onChange("applyingClass", val);
                  onClearError("applyingClass");
                }
              }}
            >
              <SelectTrigger className="h-9.5 text-sm w-full">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent className="max-h-[260px]">
                {APPLYING_CLASSES.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.applyingClass && (
              <p className="text-[11px] text-danger">{errors.applyingClass}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
          {/* Campus */}
          <div className="sm:col-span-2 space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Building2 className="size-3.5 text-muted-foreground" />
              Campus Branch
            </Label>
            <Select
              value={form.campus}
              onValueChange={(val) => {
                if (val) onChange("campus", val);
              }}
            >
              <SelectTrigger className="h-9.5 text-sm w-full">
                <SelectValue placeholder="Select campus" />
              </SelectTrigger>
              <SelectContent>
                {activeBranches.map((c) => (
                  <SelectItem key={c.id} value={c.campusName}>
                    {formatCampusDisplay(c.campusName).label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Section */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Section</Label>
            <Select
              value={form.section}
              onValueChange={(val) => {
                if (val) onChange("section", val);
              }}
            >
              <SelectTrigger className="h-9.5 text-sm w-full">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                {SECTIONS.map((sec) => (
                  <SelectItem key={sec} value={sec}>
                    Section {sec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Roll No */}
          <div className="space-y-1.5">
            <Label htmlFor="adm-roll" className="text-xs font-semibold">
              Roll Number
            </Label>
            <Input
              id="adm-roll"
              value={form.rollNo}
              onChange={(e) => onChange("rollNo", e.target.value)}
              placeholder="e.g. 24"
              className="h-9.5 text-sm font-mono"
            />
          </div>
        </div>

        {/* Admission Category (New / Transfer) & Pathway */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Admission Category <span className="text-danger">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {(["New", "Transfer"] as const).map((cat) => {
                const active = form.admissionCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onChange("admissionCategory", cat)}
                    className={cn(
                      "h-9.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                      active
                        ? "border-brand bg-brand-50 text-brand shadow-2xs ring-2 ring-brand/15"
                        : "border-input bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {cat === "New" ? (
                      <Sparkles className="size-3.5" />
                    ) : (
                      <History className="size-3.5" />
                    )}
                    <span>{cat} Admission</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Award className="size-3.5 text-muted-foreground" />
              Admission Pathway
            </Label>
            <div
              className={cn(
                "grid gap-2",
                form.admissionPathway === "Entry Test" ? "grid-cols-2" : "grid-cols-1"
              )}
            >
              <Select
                value={form.admissionPathway}
                onValueChange={(val) => {
                  if (val) {
                    onChange("admissionPathway", val as "Direct Admission" | "Entry Test");
                  }
                }}
              >
                <SelectTrigger className="h-9.5 text-xs w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Direct Admission">Direct Admission</SelectItem>
                  <SelectItem value="Entry Test">Entry Test Merit</SelectItem>
                </SelectContent>
              </Select>

              {form.admissionPathway === "Entry Test" && (
                <Input
                  type="number"
                  min={50}
                  max={100}
                  value={form.entryScore}
                  onChange={(e) => onChange("entryScore", e.target.value)}
                  placeholder="Score %"
                  title="Entry Test Score (%)"
                  className="h-9.5 text-xs font-mono"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Previous School Attended? (Yes / No Conditional Switch) */}
      <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-brand-50 text-brand flex items-center justify-center shrink-0">
              <School className="size-4" />
            </div>
            <h4 className="text-xs font-semibold text-foreground">
              Previous School Attended?
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-2 shrink-0 sm:w-52">
            {(["No", "Yes"] as const).map((choice) => {
              const active = form.previousSchoolAttended === choice;
              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => handlePreviousSchoolChoice(choice)}
                  aria-pressed={active}
                  className={cn(
                    "h-9 rounded-lg border px-3 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                    active
                      ? "border-brand bg-brand text-white shadow-sm"
                      : "border-input bg-background text-foreground hover:bg-muted/60"
                  )}
                >
                  {active && <CheckCircle2 className="size-3.5" />}
                  <span>{choice}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conditional Previous School Fields — Only rendered when Yes is selected */}
        {form.previousSchoolAttended === "Yes" && (
          <div className="pt-3 border-t border-border/60 space-y-3.5 animate-in fade-in-0 slide-in-from-top-1 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Previous School Name */}
              <div className="space-y-1.5">
                <Label htmlFor="adm-prev-school" className="text-xs font-semibold">
                  Previous School Name <span className="text-danger">*</span>
                </Label>
                <Input
                  id="adm-prev-school"
                  value={form.previousSchoolName}
                  onChange={(e) => {
                    onChange("previousSchoolName", e.target.value);
                    onClearError("previousSchoolName");
                  }}
                  placeholder="e.g. Beaconhouse School System"
                  className={cn(
                    "h-9.5 text-sm bg-background",
                    errors.previousSchoolName && "border-danger focus-visible:ring-danger/20"
                  )}
                />
                {errors.previousSchoolName && (
                  <p className="text-[11px] text-danger">{errors.previousSchoolName}</p>
                )}
              </div>

              {/* Previous Class */}
              <div className="space-y-1.5">
                <Label htmlFor="adm-prev-class" className="text-xs font-semibold">
                  Previous Class <span className="text-danger">*</span>
                </Label>
                <Input
                  id="adm-prev-class"
                  value={form.previousClass}
                  onChange={(e) => {
                    onChange("previousClass", e.target.value);
                    onClearError("previousClass");
                  }}
                  placeholder="e.g. KG / Class 4"
                  className={cn(
                    "h-9.5 text-sm bg-background",
                    errors.previousClass && "border-danger focus-visible:ring-danger/20"
                  )}
                />
                {errors.previousClass && (
                  <p className="text-[11px] text-danger">{errors.previousClass}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Transfer Certificate */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <FileText className="size-3.5 text-muted-foreground" />
                  Transfer Certificate (If Applicable)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={form.transferCertificateStatus}
                    onValueChange={(val) => {
                      if (val) {
                        onChange(
                          "transferCertificateStatus",
                          val as AdmissionFormState["transferCertificateStatus"]
                        );
                      }
                    }}
                  >
                    <SelectTrigger className="h-9.5 text-xs w-full bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Submitted">Submitted</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    value={form.transferCertificateNo}
                    onChange={(e) => onChange("transferCertificateNo", e.target.value)}
                    placeholder="TC / SLC # (optional)"
                    disabled={form.transferCertificateStatus === "Not Applicable"}
                    className="h-9.5 text-xs font-mono bg-background"
                  />
                </div>
              </div>

              {/* Enrollment Status (if needed when transferring) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Enrollment Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(val) => {
                    if (val) onChange("status", val as StudentStatus);
                  }}
                >
                  <SelectTrigger className="h-9.5 text-sm w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active (Attending)</SelectItem>
                    <SelectItem value="Transferred">Transferred</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Alumni">Alumni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Previous Academic Record */}
            <div className="space-y-1.5">
              <Label htmlFor="adm-prev-record" className="text-xs font-semibold">
                Previous Academic Record
              </Label>
              <Textarea
                id="adm-prev-record"
                rows={2}
                value={form.previousAcademicRecord}
                onChange={(e) => onChange("previousAcademicRecord", e.target.value)}
                placeholder="e.g. Annual Examination 2025 — Grade A (86%), Promoted to next class, Good conduct."
                className="text-sm resize-none bg-background"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
