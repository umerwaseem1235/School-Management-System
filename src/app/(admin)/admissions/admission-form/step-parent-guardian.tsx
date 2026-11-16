"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  GUARDIAN_RELATIONS,
  formatCnicInput,
  formatPhoneInput,
  type AdmissionFormState,
} from "./admission-form-types";
import {
  Briefcase,
  CreditCard,
  Mail,
  Phone,
  ShieldAlert,
  User,
  Users,
} from "lucide-react";

interface StepParentGuardianProps {
  form: AdmissionFormState;
  errors: Record<string, string>;
  onChange: <K extends keyof AdmissionFormState>(
    field: K,
    value: AdmissionFormState[K]
  ) => void;
  onClearError: (field: string) => void;
}

export function StepParentGuardian({
  form,
  errors,
  onChange,
  onClearError,
}: StepParentGuardianProps) {
  return (
    <div className="space-y-5 animate-in fade-in-0 slide-in-from-right-2 duration-200">
      {/* Father's Details */}
      <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-brand-50 text-brand flex items-center justify-center">
            <User className="size-4" />
          </div>
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Father&apos;s Details
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Father's Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="adm-father-name" className="text-xs font-semibold">
              Father&apos;s Full Name <span className="text-danger">*</span>
            </Label>
            <Input
              id="adm-father-name"
              value={form.fatherName}
              onChange={(e) => {
                onChange("fatherName", e.target.value);
                onClearError("fatherName");
              }}
              placeholder="e.g. Tariq Mahmood"
              className={cn(
                "h-9.5 text-sm",
                errors.fatherName && "border-danger focus-visible:ring-danger/20"
              )}
            />
            {errors.fatherName && (
              <p className="text-[11px] text-danger">{errors.fatherName}</p>
            )}
          </div>

          {/* Father's CNIC */}
          <div className="space-y-1.5">
            <Label htmlFor="adm-father-cnic" className="text-xs font-semibold flex items-center gap-1.5">
              <CreditCard className="size-3.5 text-muted-foreground" />
              Father&apos;s CNIC <span className="text-danger">*</span>
            </Label>
            <Input
              id="adm-father-cnic"
              value={form.fatherCnic}
              onChange={(e) => {
                onChange("fatherCnic", formatCnicInput(e.target.value));
                onClearError("fatherCnic");
              }}
              placeholder="35202-1234567-1"
              className={cn(
                "h-9.5 text-sm font-mono",
                errors.fatherCnic && "border-danger focus-visible:ring-danger/20"
              )}
            />
            {errors.fatherCnic && (
              <p className="text-[11px] text-danger">{errors.fatherCnic}</p>
            )}
          </div>

          {/* Father's Occupation */}
          <div className="space-y-1.5">
            <Label htmlFor="adm-father-occ" className="text-xs font-semibold flex items-center gap-1.5">
              <Briefcase className="size-3.5 text-muted-foreground" />
              Father&apos;s Occupation
            </Label>
            <Input
              id="adm-father-occ"
              value={form.fatherOccupation}
              onChange={(e) => onChange("fatherOccupation", e.target.value)}
              placeholder="e.g. Civil Engineer / Business"
              className="h-9.5 text-sm"
            />
          </div>

          {/* Father's Contact Number */}
          <div className="space-y-1.5">
            <Label htmlFor="adm-father-phone" className="text-xs font-semibold flex items-center gap-1.5">
              <Phone className="size-3.5 text-muted-foreground" />
              Father&apos;s Contact Number <span className="text-danger">*</span>
            </Label>
            <Input
              id="adm-father-phone"
              value={form.fatherContact}
              onChange={(e) => {
                onChange("fatherContact", formatPhoneInput(e.target.value));
                onClearError("fatherContact");
              }}
              placeholder="0300-1234567"
              className={cn(
                "h-9.5 text-sm font-mono",
                errors.fatherContact && "border-danger focus-visible:ring-danger/20"
              )}
            />
            {errors.fatherContact && (
              <p className="text-[11px] text-danger">{errors.fatherContact}</p>
            )}
          </div>
        </div>
      </div>

      {/* Mother's Details & Family Email */}
      <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-brand-50 text-brand flex items-center justify-center">
            <Users className="size-4" />
          </div>
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Mother&apos;s Information & Family Email
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Mother's Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="adm-mother-name" className="text-xs font-semibold">
              Mother&apos;s Full Name
            </Label>
            <Input
              id="adm-mother-name"
              value={form.motherName}
              onChange={(e) => onChange("motherName", e.target.value)}
              placeholder="e.g. Ayesha Tariq"
              className="h-9.5 text-sm"
            />
          </div>

          {/* Mother's Contact Number */}
          <div className="space-y-1.5">
            <Label htmlFor="adm-mother-phone" className="text-xs font-semibold flex items-center gap-1.5">
              <Phone className="size-3.5 text-muted-foreground" />
              Mother&apos;s Contact Number
            </Label>
            <Input
              id="adm-mother-phone"
              value={form.motherContact}
              onChange={(e) =>
                onChange("motherContact", formatPhoneInput(e.target.value))
              }
              placeholder="0321-7654321"
              className="h-9.5 text-sm font-mono"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <Label htmlFor="adm-email" className="text-xs font-semibold flex items-center gap-1.5">
              <Mail className="size-3.5 text-muted-foreground" />
              Email Address
            </Label>
            <Input
              id="adm-email"
              type="email"
              value={form.email}
              onChange={(e) => {
                onChange("email", e.target.value);
                onClearError("email");
              }}
              placeholder="parent@example.com"
              className={cn(
                "h-9.5 text-sm",
                errors.email && "border-danger focus-visible:ring-danger/20"
              )}
            />
            {errors.email && (
              <p className="text-[11px] text-danger">{errors.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Guardian Details (If Applicable) */}
      <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="adm-has-guardian"
              checked={form.hasSeparateGuardian}
              onCheckedChange={(checked) => {
                const enabled = Boolean(checked);
                onChange("hasSeparateGuardian", enabled);
                if (!enabled) {
                  onClearError("guardianName");
                  onClearError("guardianContact");
                }
              }}
              className="cursor-pointer"
            />
            <label htmlFor="adm-has-guardian" className="cursor-pointer">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <ShieldAlert className="size-3.5 text-brand" />
                Add Separate Legal Guardian Details (If Applicable)
              </span>
            </label>
          </div>
        </div>

        {form.hasSeparateGuardian && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-border/60 animate-in fade-in-0 slide-in-from-top-1 duration-200">
            <div className="space-y-1.5">
              <Label htmlFor="adm-guardian-name" className="text-xs font-semibold">
                Guardian Full Name <span className="text-danger">*</span>
              </Label>
              <Input
                id="adm-guardian-name"
                value={form.guardianName}
                onChange={(e) => {
                  onChange("guardianName", e.target.value);
                  onClearError("guardianName");
                }}
                placeholder="e.g. Imran Qureshi"
                className={cn(
                  "h-9.5 text-sm bg-background",
                  errors.guardianName && "border-danger focus-visible:ring-danger/20"
                )}
              />
              {errors.guardianName && (
                <p className="text-[11px] text-danger">{errors.guardianName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Relationship to Student
              </Label>
              <Select
                value={form.guardianRelation}
                onValueChange={(val) => {
                  if (val) onChange("guardianRelation", val);
                }}
              >
                <SelectTrigger className="h-9.5 text-sm w-full bg-background">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {GUARDIAN_RELATIONS.map((rel) => (
                    <SelectItem key={rel} value={rel}>
                      {rel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adm-guardian-cnic" className="text-xs font-semibold">
                Guardian CNIC
              </Label>
              <Input
                id="adm-guardian-cnic"
                value={form.guardianCnic}
                onChange={(e) =>
                  onChange("guardianCnic", formatCnicInput(e.target.value))
                }
                placeholder="35202-9876543-1"
                className="h-9.5 text-sm font-mono bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adm-guardian-phone" className="text-xs font-semibold">
                Guardian Contact Number <span className="text-danger">*</span>
              </Label>
              <Input
                id="adm-guardian-phone"
                value={form.guardianContact}
                onChange={(e) => {
                  onChange("guardianContact", formatPhoneInput(e.target.value));
                  onClearError("guardianContact");
                }}
                placeholder="0333-9876543"
                className={cn(
                  "h-9.5 text-sm font-mono bg-background",
                  errors.guardianContact && "border-danger focus-visible:ring-danger/20"
                )}
              />
              {errors.guardianContact && (
                <p className="text-[11px] text-danger">{errors.guardianContact}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
