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
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCampusDisplay, formatDate, formatNumber, initials } from "@/lib/format";
import type { AdmissionApplication, AdmissionDocumentRecord } from "@/types";
import {
  Award,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileCheck2,
  FileText,
  GraduationCap,
  Hash,
  MapPin,
  Phone,
  Receipt,
  School,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface AdmissionDetailsDialogProps {
  admission: AdmissionApplication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-border/40 last:border-b-0 text-xs">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span
        className={`text-right font-medium text-foreground ${
          mono ? "font-mono" : ""
        }`}
      >
        {value || <span className="text-muted-foreground/70 font-normal">Not provided</span>}
      </span>
    </div>
  );
}

export function AdmissionDetailsDialog({
  admission,
  open,
  onOpenChange,
}: AdmissionDetailsDialogProps) {
  const [copied, setCopied] = React.useState(false);

  if (!admission) return null;

  const dossier = admission.dossier;
  const campusInfo = formatCampusDisplay(admission.campus);
  const admissionNo =
    admission.admissionNumber || `SMS-2026-${admission.id.slice(-4).toUpperCase()}`;
  const isEntryTest =
    admission.admissionType === "Entry Test" || Boolean(admission.score);
  const statusLabel =
    admission.status === "Active" ? "Enrolled" : admission.status || "Enrolled";

  const handleCopyPhone = () => {
    const phoneToCopy = dossier?.fatherContact || admission.phone;
    if (phoneToCopy && navigator.clipboard) {
      navigator.clipboard.writeText(phoneToCopy);
      toast.success("Contact Copied", {
        description: `${phoneToCopy} copied to clipboard.`,
      });
    }
  };

  const handleCopySummary = () => {
    const summary = [
      `Admission Record: ${admission.applicant}`,
      `Admission #: ${admissionNo}`,
      `Roll #: ${admission.rollNo || "N/A"}`,
      `Class & Section: ${admission.appliedClass}${admission.section ? ` - Section ${admission.section}` : ""}`,
      `Campus: ${campusInfo.primary}${campusInfo.secondary ? ` (${campusInfo.secondary})` : ""}`,
      `Pathway: ${isEntryTest ? `Entry Test${admission.score ? ` (${admission.score}%)` : ""}` : "Direct Admission"}`,
      `Guardian / Father: ${dossier?.fatherName || admission.guardian}`,
      `Phone: ${dossier?.fatherContact || admission.phone}`,
      `Enrolled On: ${formatDate(admission.appliedOn)}`,
    ].join("\n");

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      toast.success("Admission Summary Copied", {
        description: `Details for ${admission.applicant} copied to clipboard.`,
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const docEntries: Array<{ key: string; label: string; doc?: AdmissionDocumentRecord }> =
    dossier?.documents
      ? [
          { key: "studentPhoto", label: "Student Photograph", doc: dossier.documents.studentPhoto },
          {
            key: "birthCertificate",
            label: "Birth Certificate / B-Form",
            doc: dossier.documents.birthCertificate,
          },
          {
            key: "fatherCnicCopy",
            label: "Father's CNIC Copy",
            doc: dossier.documents.fatherCnicCopy,
          },
          ...(dossier.previousSchoolAttended === "Yes"
            ? [
                {
                  key: "leavingCertificate",
                  label: "School Leaving Certificate",
                  doc: dossier.documents.leavingCertificate,
                },
                {
                  key: "academicDocuments",
                  label: "Previous Academic Documents",
                  doc: dossier.documents.academicDocuments,
                },
              ]
            : []),
        ]
      : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-2xl lg:max-w-3xl p-0 gap-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card">
        {/* Header Banner */}
        <DialogHeader className="border-b border-border/70 bg-gradient-to-r from-[#7c4424]/12 via-brand-50/50 to-background px-6 py-5">
          <div className="flex items-start gap-4 pr-8">
            {dossier?.photoDataUrl ? (
              <img
                src={dossier.photoDataUrl}
                alt={admission.applicant}
                className="size-13 shrink-0 rounded-xl object-cover shadow-sm ring-2 ring-brand/20"
              />
            ) : (
              <div className="grid size-13 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-[#7c4424] to-[#381e0f] text-white shadow-sm font-heading font-bold text-base ring-1 ring-white/10">
                {initials(admission.applicant)}
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="font-heading text-lg font-bold text-foreground leading-tight">
                  {admission.applicant}
                </DialogTitle>
                <StatusBadge status={statusLabel} dot={false} />
                {admission.admissionCategory && (
                  <span className="inline-flex items-center rounded-full bg-brand-50 border border-brand/20 px-2 py-0.5 text-[10.5px] font-semibold text-brand">
                    {admission.admissionCategory} Admission
                  </span>
                )}
              </div>

              <DialogDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="font-mono font-semibold text-brand bg-brand-50/80 border border-brand/20 px-1.5 py-0.5 rounded">
                  {admissionNo}
                </span>
                {admission.rollNo && (
                  <>
                    <span>·</span>
                    <span className="font-mono font-medium text-foreground/80">
                      Roll #{admission.rollNo}
                    </span>
                  </>
                )}
                {admission.gender && (
                  <>
                    <span>·</span>
                    <span>{admission.gender}</span>
                  </>
                )}
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3 text-muted-foreground" />
                  Enrolled {formatDate(admission.appliedOn)}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="max-h-[68vh] overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin-light">
          {/* Quick Highlight Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-xl border border-border/70 bg-muted/25 p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <GraduationCap className="size-3.5 text-brand" />
                <span>Class & Section</span>
              </div>
              <p className="mt-1 text-xs font-bold text-foreground truncate">
                {admission.appliedClass}
                {admission.section ? ` · Sec ${admission.section}` : ""}
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/25 p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Building2 className="size-3.5 text-brand" />
                <span>Campus Branch</span>
              </div>
              <p className="mt-1 text-xs font-bold text-foreground truncate" title={admission.campus}>
                {campusInfo.primary}
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/25 p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Award className="size-3.5 text-brand" />
                <span>Pathway</span>
              </div>
              <p className="mt-1 text-xs font-bold text-foreground truncate">
                {isEntryTest
                  ? `Entry Test${admission.score ? ` (${admission.score}%)` : ""}`
                  : "Direct Admission"}
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/25 p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Hash className="size-3.5 text-brand" />
                <span>Session</span>
              </div>
              <p className="mt-1 text-xs font-bold text-foreground truncate">
                {dossier?.academicSession || "2026–2027"}
              </p>
            </div>
          </div>

          {/* 2-Column Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Student Information */}
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <User className="size-3.5 text-brand" />
                <span>Student Information</span>
              </div>
              <div>
                <DetailRow label="Full Name" value={admission.applicant} />
                <DetailRow
                  label="Date of Birth"
                  value={dossier?.dateOfBirth ? formatDate(dossier.dateOfBirth) : undefined}
                />
                <DetailRow label="Gender" value={admission.gender} />
                <DetailRow label="Blood Group" value={dossier?.bloodGroup} />
                <DetailRow label="Religion" value={dossier?.religion} />
                <DetailRow label="Nationality" value={dossier?.nationality || "Pakistani"} />
                <DetailRow
                  label="B-Form / Birth Cert #"
                  value={dossier?.bFormNumber}
                  mono
                />
              </div>
            </div>

            {/* Parent / Guardian & Contact */}
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Users className="size-3.5 text-brand" />
                <span>Parent / Guardian Details</span>
              </div>
              <div>
                <DetailRow
                  label="Father / Guardian"
                  value={dossier?.fatherName || admission.guardian}
                />
                <DetailRow label="Father's CNIC" value={dossier?.fatherCnic} mono />
                <DetailRow label="Father's Occupation" value={dossier?.fatherOccupation} />
                <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border/40 text-xs">
                  <span className="text-muted-foreground shrink-0 flex items-center gap-1">
                    <Phone className="size-3" />
                    Primary Contact
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-medium text-foreground">
                      {dossier?.fatherContact || admission.phone}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="text-muted-foreground hover:text-brand transition-colors cursor-pointer p-0.5 rounded"
                      title="Copy contact number"
                    >
                      <Copy className="size-3" />
                    </button>
                  </div>
                </div>
                <DetailRow label="Mother's Name" value={dossier?.motherName} />
                <DetailRow label="Mother's Contact" value={dossier?.motherContact} mono />
                <DetailRow label="Email Address" value={dossier?.email} />
                {dossier?.hasSeparateGuardian && (
                  <DetailRow
                    label="Guardian"
                    value={
                      dossier.guardianName
                        ? `${dossier.guardianName}${
                            dossier.guardianRelation ? ` (${dossier.guardianRelation})` : ""
                          }`
                        : undefined
                    }
                  />
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <MapPin className="size-3.5 text-brand" />
                <span>Address & Residence</span>
              </div>
              <div>
                <DetailRow label="Current Address" value={dossier?.currentAddress} />
                <DetailRow label="Permanent Address" value={dossier?.permanentAddress} />
                <DetailRow label="City" value={dossier?.city} />
                <DetailRow label="Province" value={dossier?.province} />
                <DetailRow label="Postal Code" value={dossier?.postalCode} mono />
              </div>
            </div>

            {/* Academic & Previous School */}
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <School className="size-3.5 text-brand" />
                <span>Academic & Admission Info</span>
              </div>
              <div>
                <DetailRow
                  label="Admission Category"
                  value={admission.admissionCategory || dossier?.admissionCategory || "New"}
                />
                <DetailRow
                  label="Admission Date"
                  value={formatDate(dossier?.admissionDate || admission.appliedOn)}
                />
                <DetailRow
                  label="Previous School?"
                  value={dossier?.previousSchoolAttended || "No (First-time enrollment)"}
                />
                {dossier?.previousSchoolAttended === "Yes" && (
                  <>
                    <DetailRow label="Previous School" value={dossier.previousSchoolName} />
                    <DetailRow label="Previous Class" value={dossier.previousClass} />
                    <DetailRow label="Academic Record" value={dossier.previousAcademicRecord} />
                    <DetailRow
                      label="Transfer Certificate"
                      value={dossier.transferCertificate}
                    />
                  </>
                )}
                {admission.score !== undefined && (
                  <DetailRow label="Entry Test Score" value={`${admission.score}%`} mono />
                )}
              </div>
            </div>
          </div>

          {/* Fee & Billing Details */}
          {dossier?.feeDetails && (
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Receipt className="size-3.5 text-brand" />
                  <span>Fee & Billing Details</span>
                </div>
                <StatusBadge status={dossier.feeDetails.feeStatus} dot={false} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <div>
                  <DetailRow
                    label="Admission Fee"
                    value={`Rs ${formatNumber(dossier.feeDetails.admissionFee)}`}
                    mono
                  />
                  <DetailRow
                    label="Monthly Tuition"
                    value={`Rs ${formatNumber(dossier.feeDetails.tuitionFee)}`}
                    mono
                  />
                  <DetailRow
                    label="Security & Annual"
                    value={`Rs ${formatNumber(
                      dossier.feeDetails.securityDeposit + dossier.feeDetails.annualCharges
                    )}`}
                    mono
                  />
                  {dossier.feeDetails.transportFee > 0 && (
                    <DetailRow
                      label="Transport Fee"
                      value={`Rs ${formatNumber(dossier.feeDetails.transportFee)}`}
                      mono
                    />
                  )}
                </div>
                <div>
                  <DetailRow
                    label="Concession"
                    value={
                      dossier.feeDetails.discountAmount > 0
                        ? `Rs ${formatNumber(dossier.feeDetails.discountAmount)}${
                            dossier.feeDetails.discountReason
                              ? ` (${dossier.feeDetails.discountReason})`
                              : ""
                          }`
                        : "None"
                    }
                    mono={dossier.feeDetails.discountAmount > 0}
                  />
                  <DetailRow
                    label="Net Payable"
                    value={`Rs ${formatNumber(dossier.feeDetails.totalPayable)}`}
                    mono
                  />
                  <DetailRow
                    label="Amount Paid"
                    value={`Rs ${formatNumber(dossier.feeDetails.paidAmount)}`}
                    mono
                  />
                  <DetailRow
                    label="Payment Method"
                    value={
                      dossier.feeDetails.challanNumber
                        ? `${dossier.feeDetails.paymentMethod} · ${dossier.feeDetails.challanNumber}`
                        : dossier.feeDetails.paymentMethod
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Documents Verification */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <FileCheck2 className="size-3.5 text-brand" />
                <span>Documents & Verification</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="size-3" />
                SIS Synced
              </span>
            </div>

            {docEntries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {docEntries.map((item) => {
                  const uploaded = Boolean(item.doc?.fileName || item.doc?.verified);
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-card px-3 py-2 text-xs"
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <FileText className="size-3.5 text-brand shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{item.label}</p>
                          <p className="text-[10.5px] text-muted-foreground truncate">
                            {item.doc?.fileName || (uploaded ? "Verified on file" : "Not attached")}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          uploaded
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {uploaded ? "Attached" : "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Verified student enrollment record synced directly with the Student Information
                System ({admissionNo}).
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="m-0 shrink-0 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 rounded-b-2xl border-t border-border/70 bg-muted/25 px-6 py-3.5">
          <Link
            href={`/students?search=${encodeURIComponent(admission.applicant)}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-[4px] border border-brand/20 bg-white px-3.5 h-9 text-xs font-semibold text-foreground shadow-2xs hover:border-[#7c4424] hover:bg-[#faf6ed] hover:text-[#381e0f] transition-all"
          >
            <ExternalLink className="size-3.5 text-brand" />
            <span>Open in Student Directory</span>
          </Link>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleCopySummary}
              className="gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              <span>{copied ? "Copied" : "Copy Summary"}</span>
            </Button>
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
