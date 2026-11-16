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
import type { FrontDeskInquiry } from "@/types";
import {
  Calendar,
  Clock,
  Phone,
  User,
  Building2,
  FileText,
  CheckCircle2,
  RotateCcw,
  UserCheck,
} from "lucide-react";

interface ViewInquiryDialogProps {
  inquiry: FrontDeskInquiry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleStatus?: (id: string) => void;
}

export function ViewInquiryDialog({
  inquiry,
  open,
  onOpenChange,
  onToggleStatus,
}: ViewInquiryDialogProps) {
  if (!inquiry) return null;

  const isResolved = inquiry.status === "Closed" || inquiry.status === "Converted";
  const campusInfo = formatCampusDisplay(inquiry.campus);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border border-border shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 bg-muted/30 border-b border-border/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Inquiry Details
              </DialogTitle>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {inquiry.inquiryCode || `INQ-${inquiry.id.slice(-4).toUpperCase()}`}
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                isResolved
                  ? "bg-success-soft text-success border-success/30 font-semibold"
                  : "bg-warning-soft text-warning border-warning/30 font-semibold"
              }
            >
              {isResolved ? "Resolved" : "Pending"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          {/* Caller Profile Card */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border/70 bg-card">
            <div className="size-10 rounded-full bg-brand-50 text-brand flex items-center justify-center font-bold text-sm shrink-0 border border-brand/20">
              <User className="size-5 text-brand" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-foreground truncate">
                {inquiry.callerName}
              </h4>
              <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5 mt-0.5">
                <Phone className="size-3 text-muted-foreground/70" />
                {inquiry.phone}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-50 text-brand shrink-0">
              {inquiry.inquiryType}
            </span>
          </div>

          {/* Key Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Created / Logged Date */}
            <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5 text-brand" />
                Date Logged
              </span>
              <p className="font-mono font-semibold text-foreground">
                {inquiry.createdAt || "N/A"}
              </p>
            </div>

            {/* Follow-up Date */}
            <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Clock className="size-3.5 text-brand" />
                Follow-up Date
              </span>
              <p className="font-mono font-semibold text-foreground">
                {inquiry.followUpDate || "—"}
              </p>
            </div>

            {/* Campus Branch */}
            <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Building2 className="size-3.5 text-brand" />
                Campus Branch
              </span>
              <p className="font-medium text-foreground truncate" title={campusInfo.primary}>
                {campusInfo.primary}
              </p>
            </div>

            {/* Assigned Staff */}
            <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <UserCheck className="size-3.5 text-brand" />
                Assigned Desk
              </span>
              <p className="font-medium text-foreground truncate">
                {inquiry.assignedTo || "Front Desk Staff"}
              </p>
            </div>
          </div>

          {/* Inquiry Notes / Message */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="size-3.5 text-brand" />
              Inquiry Details / Message
            </span>
            <div className="p-3 rounded-xl border border-border/70 bg-background text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap min-h-[70px]">
              {inquiry.notes || "No additional notes provided."}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-3.5 bg-muted/30 border-t border-border/60 flex items-center justify-between sm:justify-between gap-2">
          {onToggleStatus && (
            <Button
              type="button"
              variant={isResolved ? "outline" : "default"}
              size="sm"
              onClick={() => {
                onToggleStatus(inquiry.id);
                onOpenChange(false);
              }}
              className="text-xs gap-1.5 cursor-pointer"
            >
              {isResolved ? (
                <>
                  <RotateCcw className="size-3.5" />
                  <span>Reopen Inquiry</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" />
                  <span>Mark as Resolved</span>
                </>
              )}
            </Button>
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
