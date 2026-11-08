"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Meter } from "@/components/shared/meter";
import { formatNumber, formatPercent } from "@/lib/format";
import type { Campus } from "@/types";
import {
  Building2,
  Calendar,
  Check,
  Copy,
  GraduationCap,
  Mail,
  MapPin,
  Percent,
  Phone,
  User as UserIcon,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface ViewBranchDialogProps {
  branch: Campus | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewBranchDialog({
  branch,
  open,
  onOpenChange,
}: ViewBranchDialogProps) {
  const [copied, setCopied] = React.useState(false);

  if (!branch) return null;

  const util =
    branch.capacity > 0 ? (branch.students / branch.capacity) * 100 : 0;

  const handleCopy = () => {
    const text = `Branch: ${branch.campusName} (${branch.campusCode})
City: ${branch.city}
Address: ${branch.address}
Principal: ${branch.principal}
Phone: ${branch.phone}
Email: ${branch.contactEmail}
Students: ${branch.students} / ${branch.capacity}
Staff: ${branch.staff}
Status: ${branch.status}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Branch details copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[88vh] p-0 gap-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl flex flex-col">
        {/* Pinned Header Hero Section */}
        <div className="border-b border-border/70 bg-gradient-to-br from-brand-50/60 via-background to-muted/20 p-5 sm:p-6 pb-5 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand text-white shadow-md ring-4 ring-brand/10">
                <Building2 className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="font-heading text-base sm:text-lg font-bold text-foreground">
                    {branch.campusName}
                  </DialogTitle>
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-brand bg-brand-50 px-2 py-0.5 rounded-md border border-brand/20 dark:bg-brand-soft shrink-0">
                    {branch.campusCode}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                    <Calendar className="size-3.5 text-muted-foreground/70" />
                    Est. {branch.established}
                  </span>
                  <span className="text-xs text-muted-foreground/60 shrink-0">•</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                    <MapPin className="size-3.5 text-brand" />
                    <span>{branch.city}{branch.province ? ` · ${branch.province}` : ""}</span>
                  </span>
                </div>
              </div>
            </div>
            <StatusBadge status={branch.status} className="shrink-0 mr-6 sm:mr-4" />
          </div>
        </div>

        {/* Scrollable Content Body (Vertical only, no horizontal scrollbar) */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto overflow-x-hidden flex-1 scrollbar-thin-light">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-[11px] font-medium">
                <GraduationCap className="size-3.5 text-brand" />
                <span>Students</span>
              </div>
              <div className="text-base font-bold text-foreground mt-1">
                {formatNumber(branch.students)}
              </div>
              <div className="text-[10px] text-muted-foreground">Enrolled</div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-[11px] font-medium">
                <Users className="size-3.5 text-brand" />
                <span>Staff</span>
              </div>
              <div className="text-base font-bold text-foreground mt-1">
                {formatNumber(branch.staff)}
              </div>
              <div className="text-[10px] text-muted-foreground">Employed</div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-[11px] font-medium">
                <Building2 className="size-3.5 text-brand" />
                <span>Capacity</span>
              </div>
              <div className="text-base font-bold text-foreground mt-1">
                {formatNumber(branch.capacity)}
              </div>
              <div className="text-[10px] text-muted-foreground">Total Seats</div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-[11px] font-medium">
                <Percent className="size-3.5 text-emerald-500" />
                <span>Fee Rate</span>
              </div>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatPercent(branch.feeCollectionRate)}
              </div>
              <div className="text-[10px] text-muted-foreground">Collection</div>
            </div>
          </div>

          {/* Capacity Utilization Meter Bar */}
          <div className="rounded-xl border border-border/60 bg-card p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-foreground flex items-center gap-1.5 flex-wrap">
                <span>Capacity Utilization</span>
                <span className="text-muted-foreground">
                  ({formatNumber(branch.students)} of {formatNumber(branch.capacity)} seats)
                </span>
              </span>
              <span className="font-bold text-foreground shrink-0">
                {formatPercent(util)}
              </span>
            </div>
            <Meter
              value={util}
              tone={
                util > 90 ? "danger" : util > 75 ? "success" : "ocean"
              }
            />
          </div>

          {/* Detailed Info Grid */}
          <div className="rounded-xl border border-border/60 divide-y divide-border/50 text-xs">
            {/* Leadership */}
            <div className="flex items-center justify-between p-3 gap-2">
              <span className="text-muted-foreground flex items-center gap-2 shrink-0">
                <UserIcon className="size-3.5 text-muted-foreground" />
                Principal / Head of Branch
              </span>
              <span className="font-semibold text-foreground text-right truncate">
                {branch.principal}
              </span>
            </div>

            {/* Address */}
            <div className="flex items-start justify-between p-3 gap-4">
              <span className="text-muted-foreground flex items-center gap-2 shrink-0">
                <MapPin className="size-3.5 text-muted-foreground" />
                Full Address
              </span>
              <span className="font-medium text-foreground text-right break-words">
                {branch.address}, {branch.city}
              </span>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between p-3 gap-2">
              <span className="text-muted-foreground flex items-center gap-2 shrink-0">
                <Phone className="size-3.5 text-muted-foreground" />
                Contact Phone
              </span>
              <span className="font-mono font-medium text-foreground text-right">
                {branch.phone}
              </span>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between p-3 gap-2">
              <span className="text-muted-foreground flex items-center gap-2 shrink-0">
                <Mail className="size-3.5 text-muted-foreground" />
                Contact Email
              </span>
              <span className="font-medium text-brand hover:underline text-right truncate">
                {branch.contactEmail}
              </span>
            </div>
          </div>
        </div>

        {/* Pinned Footer Actions (m-0 to eliminate -mx-4 horizontal overflow) */}
        <DialogFooter className="m-0 border-t border-border/70 bg-muted/20 px-5 py-3.5 sm:px-6 flex flex-row items-center justify-between gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8.5 gap-1.5 px-3.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground border-border/80 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                <span className="text-emerald-600 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span>Copy Details</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8.5 px-5 rounded-lg text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
