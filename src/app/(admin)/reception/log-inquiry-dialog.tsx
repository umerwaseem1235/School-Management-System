"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CAMPUSES } from "@/lib/mock/institution";
import { formatCampusDisplay } from "@/lib/format";
import type { FrontDeskInquiry } from "@/types";
import { PhoneCall } from "lucide-react";
import { toast } from "sonner";

interface LogInquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddInquiry: (newInquiry: FrontDeskInquiry) => void;
  existingCount: number;
}

const INQUIRY_TYPES = [
  "Admission",
  "Fee Structure",
  "General",
  "Transport",
] as const;

export function LogInquiryDialog({
  open,
  onOpenChange,
  onAddInquiry,
  existingCount,
}: LogInquiryDialogProps) {
  const [callerName, setCallerName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [inquiryType, setInquiryType] = React.useState<FrontDeskInquiry["inquiryType"]>("Admission");
  const [campus, setCampus] = React.useState(CAMPUSES[0].campusName);
  const [notes, setNotes] = React.useState("");

  const resetForm = () => {
    setCallerName("");
    setPhone("");
    setInquiryType("Admission");
    setCampus(CAMPUSES[0].campusName);
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callerName.trim() || !phone.trim()) {
      toast.error("Please enter caller name and contact phone number.");
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const inquiryCode = `INQ-${String(existingCount + 1).padStart(3, "0")}`;

    const newInquiry: FrontDeskInquiry = {
      id: `inq-${Date.now()}`,
      inquiryCode,
      callerName: callerName.trim(),
      phone: phone.trim(),
      inquiryType,
      campus,
      assignedTo: "Front Desk Staff",
      followUpDate: dateStr,
      status: "New",
      priority: "Medium",
      notes: notes.trim() || "No additional notes provided.",
      createdAt: dateStr,
    };

    onAddInquiry(newInquiry);
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border border-border shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 bg-muted/30 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 text-brand">
              <PhoneCall className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Log New Inquiry
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Record a phone call or front desk inquiry.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Caller Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Caller / Inquirer Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mrs. Sadia Farooq"
              value={callerName}
              onChange={(e) => setCallerName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Phone Number <span className="text-danger">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. 0321-9876543"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
            />
          </div>

          {/* Type & Campus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Inquiry Category</label>
              <Select
                value={inquiryType}
                onValueChange={(val) => {
                  if (val) setInquiryType(val as FrontDeskInquiry["inquiryType"]);
                }}
              >
                <SelectTrigger className="w-full h-9 text-xs">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {INQUIRY_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Campus</label>
              <Select
                value={campus}
                onValueChange={(val) => {
                  if (val) setCampus(val);
                }}
              >
                <SelectTrigger className="w-full h-9 text-xs">
                  <SelectValue placeholder="Select campus" />
                </SelectTrigger>
                <SelectContent>
                  {CAMPUSES.map((c) => (
                    <SelectItem key={c.id} value={c.campusName} className="text-xs">
                      {formatCampusDisplay(c.campusName).primary}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Inquiry Details / Message</label>
            <textarea
              rows={3}
              placeholder="Brief details about what the parent/caller inquired..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all resize-none"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-border/60 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-brand text-cream hover:bg-brand-600 text-xs px-4"
            >
              Save Inquiry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
