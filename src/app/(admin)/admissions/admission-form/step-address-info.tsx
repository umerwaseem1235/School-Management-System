"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PROVINCES, type AdmissionFormState } from "./admission-form-types";
import { Building, Home, MapPin, Navigation } from "lucide-react";

interface StepAddressInfoProps {
  form: AdmissionFormState;
  errors: Record<string, string>;
  onChange: <K extends keyof AdmissionFormState>(
    field: K,
    value: AdmissionFormState[K]
  ) => void;
  onClearError: (field: string) => void;
}

export function StepAddressInfo({
  form,
  errors,
  onChange,
  onClearError,
}: StepAddressInfoProps) {
  const handleCurrentAddressChange = (val: string) => {
    onChange("currentAddress", val);
    onClearError("currentAddress");
    if (form.sameAsCurrentAddress) {
      onChange("permanentAddress", val);
      onClearError("permanentAddress");
    }
  };

  const handleSameAddressToggle = (checked: boolean) => {
    onChange("sameAsCurrentAddress", checked);
    if (checked) {
      onChange("permanentAddress", form.currentAddress);
      onClearError("permanentAddress");
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in-0 slide-in-from-right-2 duration-200">
      {/* Residential Addresses */}
      <div className="rounded-xl border border-border/80 bg-card p-4 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-brand-50 text-brand flex items-center justify-center">
            <Home className="size-4" />
          </div>
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Residential Addresses
          </h4>
        </div>

        {/* Current Address */}
        <div className="space-y-1.5">
          <Label htmlFor="adm-current-address" className="text-xs font-semibold flex items-center gap-1.5">
            <MapPin className="size-3.5 text-muted-foreground" />
            Current Address <span className="text-danger">*</span>
          </Label>
          <Textarea
            id="adm-current-address"
            rows={2}
            value={form.currentAddress}
            onChange={(e) => handleCurrentAddressChange(e.target.value)}
            placeholder="House #, Street #, Block / Sector / Mohalla"
            className={cn(
              "text-sm resize-none",
              errors.currentAddress && "border-danger focus-visible:ring-danger/20"
            )}
          />
          {errors.currentAddress && (
            <p className="text-[11px] text-danger">{errors.currentAddress}</p>
          )}
        </div>

        {/* Same as current toggle */}
        <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 border border-border/60 px-3 py-2">
          <Checkbox
            id="adm-same-address"
            checked={form.sameAsCurrentAddress}
            onCheckedChange={(checked) => handleSameAddressToggle(Boolean(checked))}
            className="cursor-pointer"
          />
          <label
            htmlFor="adm-same-address"
            className="text-xs font-medium text-foreground cursor-pointer select-none"
          >
            Permanent address is the same as current address
          </label>
        </div>

        {/* Permanent Address */}
        <div className="space-y-1.5">
          <Label htmlFor="adm-permanent-address" className="text-xs font-semibold flex items-center gap-1.5">
            <Navigation className="size-3.5 text-muted-foreground" />
            Permanent Address <span className="text-danger">*</span>
          </Label>
          <Textarea
            id="adm-permanent-address"
            rows={2}
            value={form.sameAsCurrentAddress ? form.currentAddress : form.permanentAddress}
            disabled={form.sameAsCurrentAddress}
            onChange={(e) => {
              onChange("permanentAddress", e.target.value);
              onClearError("permanentAddress");
            }}
            placeholder="Permanent family residence address"
            className={cn(
              "text-sm resize-none",
              form.sameAsCurrentAddress && "bg-muted/50 text-muted-foreground",
              errors.permanentAddress && "border-danger focus-visible:ring-danger/20"
            )}
          />
          {errors.permanentAddress && (
            <p className="text-[11px] text-danger">{errors.permanentAddress}</p>
          )}
        </div>
      </div>

      {/* Region & Postal Info */}
      <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-brand-50 text-brand flex items-center justify-center">
            <Building className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              City, Province & Postal Code
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* City */}
          <div className="space-y-1.5">
            <Label htmlFor="adm-city" className="text-xs font-semibold">
              City <span className="text-danger">*</span>
            </Label>
            <Input
              id="adm-city"
              value={form.city}
              onChange={(e) => {
                onChange("city", e.target.value);
                onClearError("city");
              }}
              placeholder="e.g. Lahore"
              className={cn(
                "h-9.5 text-sm",
                errors.city && "border-danger focus-visible:ring-danger/20"
              )}
            />
            {errors.city && (
              <p className="text-[11px] text-danger">{errors.city}</p>
            )}
          </div>

          {/* Province */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Province / Region <span className="text-danger">*</span>
            </Label>
            <Select
              value={form.province}
              onValueChange={(val) => {
                if (val) {
                  onChange("province", val);
                  onClearError("province");
                }
              }}
            >
              <SelectTrigger className="h-9.5 text-sm w-full">
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {PROVINCES.map((prov) => (
                  <SelectItem key={prov} value={prov}>
                    {prov}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.province && (
              <p className="text-[11px] text-danger">{errors.province}</p>
            )}
          </div>

          {/* Postal Code */}
          <div className="space-y-1.5">
            <Label htmlFor="adm-postal" className="text-xs font-semibold">
              Postal Code
            </Label>
            <Input
              id="adm-postal"
              value={form.postalCode}
              onChange={(e) =>
                onChange(
                  "postalCode",
                  e.target.value.replace(/[^\dA-Za-z-]/g, "").slice(0, 10)
                )
              }
              placeholder="e.g. 54000"
              className="h-9.5 text-sm font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
