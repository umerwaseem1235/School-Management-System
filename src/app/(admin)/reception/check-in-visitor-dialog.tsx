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
import type { VisitorPass } from "@/types";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

interface CheckInVisitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddVisitor: (newPass: VisitorPass) => void;
  existingCount: number;
}

const PURPOSES = [
  "Parent Meeting",
  "Admission Inquiry",
  "Fee Payment",
  "Official Visit",
  "Other",
] as const;

export function CheckInVisitorDialog({
  open,
  onOpenChange,
  onAddVisitor,
  existingCount,
}: CheckInVisitorDialogProps) {
  const [visitorName, setVisitorName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [hostPerson, setHostPerson] = React.useState("");
  const [purpose, setPurpose] = React.useState<VisitorPass["purpose"]>("Parent Meeting");
  const [campus, setCampus] = React.useState(CAMPUSES[0].campusName);

  const resetForm = () => {
    setVisitorName("");
    setPhone("");
    setHostPerson("");
    setPurpose("Parent Meeting");
    setCampus(CAMPUSES[0].campusName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !phone.trim() || !hostPerson.trim()) {
      toast.error("Please fill in visitor name, phone number, and person to meet.");
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const dateStr = now.toISOString().slice(0, 10);
    const passNumber = `V-${String(existingCount + 1).padStart(3, "0")}`;

    const newPass: VisitorPass = {
      id: `vp-${Date.now()}`,
      passNumber,
      visitorName: visitorName.trim(),
      phone: phone.trim(),
      purpose,
      hostPerson: hostPerson.trim(),
      hostDepartment: "School Office",
      campus,
      checkInTime: timeStr,
      companionsCount: 0,
      status: "Inside",
      date: dateStr,
    };

    onAddVisitor(newPass);
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
              <UserPlus className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Add Visitor Entry
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Record a new visitor arriving at the school front desk.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Visitor Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Visitor Full Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tariq Mehmood"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
            />
          </div>

          {/* Contact Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Phone Number <span className="text-danger">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. 0300-1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
            />
          </div>

          {/* Person / Teacher to Meet */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Whom to Meet <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Principal Office, Class Teacher, Accounts"
              value={hostPerson}
              onChange={(e) => setHostPerson(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
            />
          </div>

          {/* Purpose & Campus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Purpose</label>
              <Select
                value={purpose}
                onValueChange={(val) => {
                  if (val) setPurpose(val as VisitorPass["purpose"]);
                }}
              >
                <SelectTrigger className="w-full h-9 text-xs">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  {PURPOSES.map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Campus Branch</label>
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
              Save Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
