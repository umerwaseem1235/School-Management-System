"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCampusDisplay, formatDate, formatNumber } from "@/lib/format";
import type { AdmissionDocumentRecord } from "@/types";
import {
  calculateAdmissionFeeTotals,
  calculateAgeLabel,
  compressImageToDataUrl,
  formatBytes,
  type AdmissionFormState,
  type AdmissionStepId,
} from "./admission-form-types";
import {
  Camera,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  MapPin,
  Pencil,
  Receipt,
  Trash2,
  Upload,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface StepDocumentsReviewProps {
  form: AdmissionFormState;
  onChange: <K extends keyof AdmissionFormState>(
    field: K,
    value: AdmissionFormState[K]
  ) => void;
  onJumpToStep: (step: AdmissionStepId) => void;
}

type DocKey = keyof AdmissionFormState["documents"];

interface DocumentUploadCardProps {
  docKey: DocKey;
  title: string;
  record: AdmissionDocumentRecord;
  accept?: string;
  previewImageUrl?: string;
  onUploadFile: (key: DocKey, file: File) => void;
  onToggleVerified: (key: DocKey, verified: boolean) => void;
  onClearFile: (key: DocKey) => void;
}

function DocumentUploadCard({
  docKey,
  title,
  record,
  accept = ".pdf,.jpg,.jpeg,.png,.webp",
  previewImageUrl,
  onUploadFile,
  onToggleVerified,
  onClearFile,
}: DocumentUploadCardProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const hasFile = Boolean(record.fileName || previewImageUrl);

  return (
    <div
      className={cn(
        "rounded-xl border p-3.5 transition-all",
        record.verified
          ? "border-emerald-300/80 bg-emerald-50/40 dark:bg-emerald-950/20"
          : "border-border/80 bg-card"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {previewImageUrl ? (
            <img
              src={previewImageUrl}
              alt={title}
              className="size-10 rounded-lg object-cover border border-border shrink-0"
            />
          ) : (
            <div
              className={cn(
                "size-10 rounded-lg flex items-center justify-center shrink-0 border",
                record.verified
                  ? "bg-emerald-100/80 text-emerald-700 border-emerald-200"
                  : "bg-muted/60 text-muted-foreground border-border/60"
              )}
            >
              {docKey === "studentPhoto" ? (
                <Camera className="size-4" />
              ) : (
                <FileCheck2 className="size-4" />
              )}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-foreground">{title}</span>
              {record.verified && (
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] px-1.5 py-0 h-4.5 gap-1"
                >
                  <CheckCircle2 className="size-2.5" />
                  Verified
                </Badge>
              )}
            </div>
            {hasFile && (
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                {`${record.fileName || "Attached image"}${record.fileSize ? ` (${record.fileSize})` : ""}`}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer select-none px-2 py-1 rounded-md hover:bg-muted/50">
            <Checkbox
              checked={record.verified}
              onCheckedChange={(checked) => onToggleVerified(docKey, Boolean(checked))}
              className="cursor-pointer"
            />
            <span>Copy Checked</span>
          </label>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUploadFile(docKey, file);
              e.target.value = "";
            }}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            className="h-7.5 text-[11px] gap-1 cursor-pointer"
          >
            <Upload className="size-3 text-brand" />
            {hasFile ? "Replace" : "Attach"}
          </Button>

          {hasFile && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onClearFile(docKey)}
              title="Remove attachment"
              className="size-7.5 text-muted-foreground hover:text-danger hover:bg-danger/10 cursor-pointer"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <span className="text-[10.5px] font-medium text-muted-foreground block">
        {label}
      </span>
      <span
        className={cn(
          "text-xs font-semibold text-foreground block truncate",
          mono && "font-mono",
          !value && "text-muted-foreground/70 font-normal italic"
        )}
        title={value || undefined}
      >
        {value || "Not provided"}
      </span>
    </div>
  );
}

export function StepDocumentsReview({
  form,
  onChange,
  onJumpToStep,
}: StepDocumentsReviewProps) {
  const handleUploadFile = async (key: DocKey, file: File) => {
    if (key === "studentPhoto") {
      if (!file.type.startsWith("image/")) {
        toast.error("Student photograph must be an image file (JPG, PNG, or WebP).");
        return;
      }
      try {
        const dataUrl = await compressImageToDataUrl(file);
        onChange("photoDataUrl", dataUrl);
        onChange("photoFileName", file.name);
        onChange("documents", {
          ...form.documents,
          studentPhoto: {
            fileName: file.name,
            fileSize: formatBytes(file.size),
            fileType: file.type,
            previewUrl: dataUrl,
            verified: true,
          },
        });
        toast.success("Student photograph updated");
      } catch {
        toast.error("Could not process image file.");
      }
      return;
    }

    onChange("documents", {
      ...form.documents,
      [key]: {
        fileName: file.name,
        fileSize: formatBytes(file.size),
        fileType: file.type,
        verified: true,
      },
    });
    toast.success(`${file.name} attached`);
  };

  const handleToggleVerified = (key: DocKey, verified: boolean) => {
    onChange("documents", {
      ...form.documents,
      [key]: {
        ...form.documents[key],
        verified,
      },
    });
  };

  const handleClearFile = (key: DocKey) => {
    if (key === "studentPhoto") {
      onChange("photoDataUrl", "");
      onChange("photoFileName", "");
    }
    onChange("documents", {
      ...form.documents,
      [key]: { verified: false },
    });
  };

  const hasPriorSchool = form.previousSchoolAttended === "Yes";
  const ageLabel = calculateAgeLabel(form.dateOfBirth);
  const feeTotals = calculateAdmissionFeeTotals(form);
  const effectivePermanentAddress = form.sameAsCurrentAddress
    ? form.currentAddress
    : form.permanentAddress;

  const docCountTotal = hasPriorSchool ? 5 : 3;
  const docCountVerified = [
    form.documents.studentPhoto,
    form.documents.birthCertificate,
    form.documents.fatherCnicCopy,
    ...(hasPriorSchool
      ? [form.documents.leavingCertificate, form.documents.academicDocuments]
      : []),
  ].filter((d) => d.verified).length;

  return (
    <div className="space-y-5 animate-in fade-in-0 slide-in-from-right-2 duration-200">
      {/* Section A: Required & Applicable Documents */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <FileCheck2 className="size-4 text-brand" />
            Document Checklist & Attachments
          </h4>
          <Badge variant="secondary" className="text-[11px] font-mono">
            {docCountVerified} / {docCountTotal} Verified
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          <DocumentUploadCard
            docKey="studentPhoto"
            title="Student Photograph"
            accept="image/*"
            record={form.documents.studentPhoto}
            previewImageUrl={form.photoDataUrl}
            onUploadFile={handleUploadFile}
            onToggleVerified={handleToggleVerified}
            onClearFile={handleClearFile}
          />

          <DocumentUploadCard
            docKey="birthCertificate"
            title="Birth Certificate / NADRA B-Form"
            record={form.documents.birthCertificate}
            onUploadFile={handleUploadFile}
            onToggleVerified={handleToggleVerified}
            onClearFile={handleClearFile}
          />

          <DocumentUploadCard
            docKey="fatherCnicCopy"
            title="Father's CNIC Copy"
            record={form.documents.fatherCnicCopy}
            onUploadFile={handleUploadFile}
            onToggleVerified={handleToggleVerified}
            onClearFile={handleClearFile}
          />

          {hasPriorSchool ? (
            <>
              <DocumentUploadCard
                docKey="leavingCertificate"
                title="Previous School Leaving Certificate (TC / SLC)"
                record={form.documents.leavingCertificate}
                onUploadFile={handleUploadFile}
                onToggleVerified={handleToggleVerified}
                onClearFile={handleClearFile}
              />

              <DocumentUploadCard
                docKey="academicDocuments"
                title="Previous Academic Documents / Result Card"
                record={form.documents.academicDocuments}
                onUploadFile={handleUploadFile}
                onToggleVerified={handleToggleVerified}
                onClearFile={handleClearFile}
              />
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/25 px-3.5 py-2.5 text-[11.5px] text-muted-foreground">
              First-time school admission selected — Previous school leaving certificate and previous academic documents are not required.
            </div>
          )}
        </div>
      </div>

      {/* Section B: Final Review Summary */}
      <div className="space-y-3 pt-2 border-t border-border/70">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Final Application Review
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Review Card 1: Student Info */}
          <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <User className="size-3.5 text-brand" />
                <span className="text-xs font-bold text-foreground">
                  1. Student Information
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => onJumpToStep(1)}
                className="h-6 px-2 text-[11px] text-brand hover:bg-brand-50 gap-1 cursor-pointer"
              >
                <Pencil className="size-3" />
                Edit
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {form.photoDataUrl ? (
                <img
                  src={form.photoDataUrl}
                  alt={form.studentFullName}
                  className="size-11 rounded-lg object-cover border border-border shrink-0"
                />
              ) : (
                <div className="size-11 rounded-lg bg-brand-50 text-brand flex items-center justify-center text-xs font-bold shrink-0">
                  {form.studentFullName ? form.studentFullName.slice(0, 2).toUpperCase() : "ST"}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  {form.studentFullName || "Unnamed Student"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {form.gender}
                  {form.dateOfBirth ? ` · DOB: ${formatDate(form.dateOfBirth)}` : ""}
                  {ageLabel ? ` (${ageLabel})` : ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <ReviewField label="B-Form / Birth Cert #" value={form.bFormNumber} mono />
              <ReviewField label="Blood Group" value={form.bloodGroup || "Not Specified"} />
              <ReviewField label="Nationality" value={form.nationality} />
              <ReviewField label="Religion" value={form.religion || "Not Specified"} />
            </div>
          </div>

          {/* Review Card 2: Parent / Guardian */}
          <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Users className="size-3.5 text-brand" />
                <span className="text-xs font-bold text-foreground">
                  2. Parent / Guardian
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => onJumpToStep(2)}
                className="h-6 px-2 text-[11px] text-brand hover:bg-brand-50 gap-1 cursor-pointer"
              >
                <Pencil className="size-3" />
                Edit
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <ReviewField label="Father's Name" value={form.fatherName} />
              <ReviewField label="Father's CNIC" value={form.fatherCnic} mono />
              <ReviewField label="Father's Contact" value={form.fatherContact} mono />
              <ReviewField label="Occupation" value={form.fatherOccupation} />
              <ReviewField label="Mother's Name" value={form.motherName} />
              <ReviewField label="Mother's Contact" value={form.motherContact} mono />
              <ReviewField label="Email Address" value={form.email} />
              <ReviewField
                label="Legal Guardian"
                value={
                  form.hasSeparateGuardian
                    ? `${form.guardianName} (${form.guardianRelation})`
                    : "Same as Parents"
                }
              />
            </div>
          </div>

          {/* Review Card 3: Address */}
          <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 text-brand" />
                <span className="text-xs font-bold text-foreground">
                  3. Address Information
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => onJumpToStep(3)}
                className="h-6 px-2 text-[11px] text-brand hover:bg-brand-50 gap-1 cursor-pointer"
              >
                <Pencil className="size-3" />
                Edit
              </Button>
            </div>

            <div className="space-y-2">
              <ReviewField label="Current Address" value={form.currentAddress} />
              <ReviewField label="Permanent Address" value={effectivePermanentAddress} />
              <div className="grid grid-cols-3 gap-2 pt-1">
                <ReviewField label="City" value={form.city} />
                <ReviewField label="Province" value={form.province} />
                <ReviewField label="Postal Code" value={form.postalCode} mono />
              </div>
            </div>
          </div>

          {/* Review Card 4: Academic & Admission */}
          <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <GraduationCap className="size-3.5 text-brand" />
                <span className="text-xs font-bold text-foreground">
                  4. Academic & Admission
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => onJumpToStep(4)}
                className="h-6 px-2 text-[11px] text-brand hover:bg-brand-50 gap-1 cursor-pointer"
              >
                <Pencil className="size-3" />
                Edit
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <ReviewField label="Academic Session" value={form.academicSession} />
              <ReviewField
                label="Admission Date"
                value={form.admissionDate ? formatDate(form.admissionDate) : ""}
              />
              <ReviewField
                label="Applying Class"
                value={`${form.applyingClass} · Sec ${form.section}`}
              />
              <ReviewField
                label="Campus Branch"
                value={formatCampusDisplay(form.campus).primary}
              />
              <ReviewField label="Admission Category" value={`${form.admissionCategory} Admission`} />
              <ReviewField
                label="Previous School"
                value={
                  hasPriorSchool
                    ? `${form.previousSchoolName} (${form.previousClass})`
                    : "No (First-Time Student)"
                }
              />
              {hasPriorSchool && (
                <>
                  <ReviewField
                    label="Transfer Certificate"
                    value={
                      form.transferCertificateNo
                        ? `${form.transferCertificateStatus} · #${form.transferCertificateNo}`
                        : form.transferCertificateStatus
                    }
                  />
                  <ReviewField label="Academic Record" value={form.previousAcademicRecord} />
                </>
              )}
            </div>
          </div>

          {/* Review Card 5: Fee Details */}
          <div className="md:col-span-2 rounded-xl border border-border/80 bg-card p-3.5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Receipt className="size-3.5 text-brand" />
                <span className="text-xs font-bold text-foreground">
                  5. Fee Details
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => onJumpToStep(5)}
                className="h-6 px-2 text-[11px] text-brand hover:bg-brand-50 gap-1 cursor-pointer"
              >
                <Pencil className="size-3" />
                Edit
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <ReviewField
                label="Admission Fee"
                value={`Rs ${formatNumber(feeTotals.admissionFee)}`}
                mono
              />
              <ReviewField
                label="Monthly Tuition"
                value={`Rs ${formatNumber(feeTotals.tuitionFee)}`}
                mono
              />
              <ReviewField
                label="Security & Annual"
                value={`Rs ${formatNumber(feeTotals.securityDeposit + feeTotals.annualCharges)}`}
                mono
              />
              <ReviewField
                label="Concession"
                value={
                  feeTotals.discount > 0
                    ? `Rs ${formatNumber(feeTotals.discount)}${
                        form.discountReason && form.discountReason !== "None"
                          ? ` (${form.discountReason})`
                          : ""
                      }`
                    : "None"
                }
                mono={feeTotals.discount > 0}
              />
              <ReviewField
                label="Net Payable"
                value={`Rs ${formatNumber(feeTotals.netPayable)}`}
                mono
              />
              <ReviewField
                label="Paid Amount"
                value={`Rs ${formatNumber(feeTotals.paid)}`}
                mono
              />
              <ReviewField
                label="Balance Due"
                value={`Rs ${formatNumber(feeTotals.balanceDue)}`}
                mono
              />
              <ReviewField
                label="Payment Method"
                value={`${form.paymentMethod} (${form.feeStatus})`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
