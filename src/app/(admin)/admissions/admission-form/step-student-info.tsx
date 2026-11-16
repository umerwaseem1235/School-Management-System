"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  BLOOD_GROUPS,
  RELIGIONS,
  calculateAgeLabel,
  compressImageToDataUrl,
  formatBytes,
  type AdmissionFormState,
} from "./admission-form-types";
import {
  Calendar,
  Camera,
  CreditCard,
  Droplets,
  Globe,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface StepStudentInfoProps {
  form: AdmissionFormState;
  errors: Record<string, string>;
  onChange: <K extends keyof AdmissionFormState>(
    field: K,
    value: AdmissionFormState[K]
  ) => void;
  onClearError: (field: string) => void;
}

export function StepStudentInfo({
  form,
  errors,
  onChange,
  onClearError,
}: StepStudentInfoProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const ageLabel = React.useMemo(
    () => calculateAgeLabel(form.dateOfBirth),
    [form.dateOfBirth]
  );

  const handlePhotoUpload = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, or WebP).");
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
      toast.success("Student photograph attached");
    } catch {
      toast.error("Could not process image file. Please try another photo.");
    }
  };

  const handleRemovePhoto = () => {
    onChange("photoDataUrl", "");
    onChange("photoFileName", "");
    onChange("documents", {
      ...form.documents,
      studentPhoto: { verified: false },
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-5 animate-in fade-in-0 slide-in-from-right-2 duration-200">
      {/* Photo & Primary Identity Strip */}
      <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Portrait Preview */}
          <div className="relative size-22 shrink-0 rounded-2xl border-2 border-dashed border-brand/30 bg-background overflow-hidden flex items-center justify-center shadow-2xs">
            {form.photoDataUrl ? (
              <img
                src={form.photoDataUrl}
                alt={form.studentFullName || "Student photograph"}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground/70 gap-1">
                <Camera className="size-6 text-brand/60" />
                <span className="text-[10px] font-medium">Photo</span>
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1 space-y-2.5 min-w-0">
            <div>
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                Student Photograph
                <span className="text-[10.5px] font-normal text-muted-foreground">
                  (Passport size · JPG / PNG)
                </span>
              </h4>
              {form.photoFileName && (
                <p className="text-[11.5px] text-muted-foreground mt-0.5 truncate">
                  Attached: {form.photoFileName}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 text-xs gap-1.5 cursor-pointer"
              >
                <Upload className="size-3.5 text-brand" />
                {form.photoDataUrl ? "Change Photo" : "Upload Photo"}
              </Button>
              {form.photoDataUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePhoto}
                  className="h-8 text-xs text-danger hover:bg-danger/10 hover:text-danger gap-1 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Student Core Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Student Full Name */}
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="adm-student-name" className="text-xs font-semibold flex items-center gap-1.5">
            <User className="size-3.5 text-muted-foreground" />
            Student Full Name <span className="text-danger">*</span>
          </Label>
          <Input
            id="adm-student-name"
            value={form.studentFullName}
            onChange={(e) => {
              onChange("studentFullName", e.target.value);
              onClearError("studentFullName");
            }}
            placeholder="e.g. Muhammad Ayaan Tariq"
            className={cn(
              "h-9.5 text-sm",
              errors.studentFullName && "border-danger focus-visible:ring-danger/20"
            )}
          />
          {errors.studentFullName && (
            <p className="text-[11px] text-danger">{errors.studentFullName}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="adm-dob" className="text-xs font-semibold flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" />
              Date of Birth <span className="text-danger">*</span>
            </Label>
            {ageLabel && (
              <span className="text-[10.5px] font-semibold text-brand bg-brand-50 px-1.5 py-0.5 rounded">
                Age: {ageLabel}
              </span>
            )}
          </div>
          <Input
            id="adm-dob"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={form.dateOfBirth}
            onChange={(e) => {
              onChange("dateOfBirth", e.target.value);
              onClearError("dateOfBirth");
            }}
            className={cn(
              "h-9.5 text-sm",
              errors.dateOfBirth && "border-danger focus-visible:ring-danger/20"
            )}
          />
          {errors.dateOfBirth && (
            <p className="text-[11px] text-danger">{errors.dateOfBirth}</p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">
            Gender <span className="text-danger">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {(["Male", "Female"] as const).map((option) => {
              const active = form.gender === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onChange("gender", option)}
                  className={cn(
                    "h-9.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center",
                    active
                      ? "border-brand bg-brand-50 text-brand shadow-2xs ring-2 ring-brand/15"
                      : "border-input bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Blood Group */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <Droplets className="size-3.5 text-muted-foreground" />
            Blood Group
          </Label>
          <Select
            value={form.bloodGroup || "__none__"}
            onValueChange={(val) =>
              onChange("bloodGroup", val === "__none__" || !val ? "" : val)
            }
          >
            <SelectTrigger className="h-9.5 text-sm w-full">
              <SelectValue placeholder="Select blood group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Not Specified</SelectItem>
              {BLOOD_GROUPS.map((bg) => (
                <SelectItem key={bg} value={bg}>
                  {bg}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Religion (Optional) */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">
            Religion{" "}
            <span className="text-[11px] font-normal text-muted-foreground">
              (Optional)
            </span>
          </Label>
          <Select
            value={form.religion || "__none__"}
            onValueChange={(val) =>
              onChange("religion", val === "__none__" || !val ? "" : val)
            }
          >
            <SelectTrigger className="h-9.5 text-sm w-full">
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Prefer not to say</SelectItem>
              {RELIGIONS.map((rel) => (
                <SelectItem key={rel} value={rel}>
                  {rel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nationality */}
        <div className="space-y-1.5">
          <Label htmlFor="adm-nationality" className="text-xs font-semibold flex items-center gap-1.5">
            <Globe className="size-3.5 text-muted-foreground" />
            Nationality <span className="text-danger">*</span>
          </Label>
          <Input
            id="adm-nationality"
            value={form.nationality}
            onChange={(e) => {
              onChange("nationality", e.target.value);
              onClearError("nationality");
            }}
            placeholder="e.g. Pakistani"
            className={cn(
              "h-9.5 text-sm",
              errors.nationality && "border-danger focus-visible:ring-danger/20"
            )}
          />
          {errors.nationality && (
            <p className="text-[11px] text-danger">{errors.nationality}</p>
          )}
        </div>

        {/* B-Form / Birth Certificate Number */}
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="adm-bform" className="text-xs font-semibold flex items-center gap-1.5">
            <CreditCard className="size-3.5 text-muted-foreground" />
            B-Form / Birth Certificate Number <span className="text-danger">*</span>
          </Label>
          <Input
            id="adm-bform"
            value={form.bFormNumber}
            onChange={(e) => {
              onChange("bFormNumber", e.target.value);
              onClearError("bFormNumber");
            }}
            placeholder="e.g. 35202-1234567-1"
            className={cn(
              "h-9.5 text-sm font-mono",
              errors.bFormNumber && "border-danger focus-visible:ring-danger/20"
            )}
          />
          {errors.bFormNumber && (
            <p className="text-[11px] text-danger">{errors.bFormNumber}</p>
          )}
        </div>
      </div>
    </div>
  );
}
