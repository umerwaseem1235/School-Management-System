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
import { Badge } from "@/components/ui/badge";
import { formatCampusDisplay } from "@/lib/format";
import type { VisitorPass } from "@/types";
import {
  Calendar,
  Clock,
  Phone,
  User,
  Building2,
  Shield,
  LogOut,
  UserCheck,
} from "lucide-react";

interface ViewVisitorDialogProps {
  visitor: VisitorPass | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckOut?: (passId: string) => void;
}

export function ViewVisitorDialog({
  visitor,
  open,
  onOpenChange,
  onCheckOut,
}: ViewVisitorDialogProps) {
  if (!visitor) return null;

  const isInside = visitor.status === "Inside" || visitor.status === "Overstay";
  const campusInfo = formatCampusDisplay(visitor.campus);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border border-border shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 bg-muted/30 border-b border-border/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Visitor Pass Details
              </DialogTitle>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {visitor.passNumber || `GP-${visitor.id.slice(-4).toUpperCase()}`}
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                isInside
                  ? "bg-warning-soft text-warning border-warning/30 font-semibold"
                  : "bg-muted text-muted-foreground border-border font-semibold"
              }
            >
              {isInside ? "Currently Inside" : "Checked Out"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          {/* Visitor Card */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border/70 bg-card">
            <div className="size-10 rounded-full bg-brand-50 text-brand flex items-center justify-center font-bold text-sm shrink-0 border border-brand/20">
              <User className="size-5 text-brand" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-foreground truncate">
                {visitor.visitorName}
              </h4>
              <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5 mt-0.5">
                <Phone className="size-3 text-muted-foreground/70" />
                {visitor.phone}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-muted text-muted-foreground shrink-0">
              {visitor.purpose}
            </span>
          </div>

          {/* Key Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* CNIC */}
            <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Shield className="size-3.5 text-brand" />
                CNIC Number
              </span>
              <p className="font-mono font-semibold text-foreground truncate">
                {visitor.cnic || "N/A"}
              </p>
            </div>

            {/* Date of Visit */}
            <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5 text-brand" />
                Date of Visit
              </span>
              <p className="font-mono font-semibold text-foreground">
                {visitor.date || "Today"}
              </p>
            </div>

            {/* Check-In Timing */}
            <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Clock className="size-3.5 text-brand" />
                Check-in Time
              </span>
              <p className="font-mono font-semibold text-foreground">
                {visitor.checkInTime || "—"}
              </p>
            </div>

            {/* Check-Out Timing */}
            <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Clock className="size-3.5 text-brand" />
                Check-out Time
              </span>
              <p className="font-mono font-semibold text-foreground">
                {visitor.checkOutTime || "Still Inside"}
              </p>
            </div>

            {/* Whom to Meet */}
            <div className="col-span-2 p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <UserCheck className="size-3.5 text-brand" />
                Whom to Meet
              </span>
              <p className="font-medium text-foreground">
                {visitor.hostPerson}
                {visitor.hostDepartment && (
                  <span className="text-muted-foreground font-normal ml-1">
                    ({visitor.hostDepartment})
                  </span>
                )}
              </p>
            </div>

            {/* Campus Branch */}
            <div className="col-span-2 p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Building2 className="size-3.5 text-brand" />
                Campus Branch
              </span>
              <p className="font-medium text-foreground truncate" title={campusInfo.primary}>
                {campusInfo.primary}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-3.5 bg-muted/30 border-t border-border/60 flex items-center justify-between sm:justify-between gap-2">
          {isInside && onCheckOut ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                onCheckOut(visitor.id);
                onOpenChange(false);
              }}
              className="text-xs gap-1.5 cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span>Check Out Visitor</span>
            </Button>
          ) : (
            <span />
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs ml-auto cursor-pointer"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
