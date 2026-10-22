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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCampusDisplay } from "@/lib/format";
import { CAMPUSES } from "@/lib/mock/institution";
import type { FeeStatus, Student, StudentStatus } from "@/types";
import { ChevronDown, GraduationCap, Sparkles, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface NewAdmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStudent: (student: Student) => void;
  existingCount: number;
}

const CLASSES = [
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
];

const SECTIONS = ["A", "B", "C"];

export function NewAdmissionDialog({
  open,
  onOpenChange,
  onAddStudent,
  existingCount,
}: NewAdmissionDialogProps) {
  const [name, setName] = React.useState("");
  const [gender, setGender] = React.useState<"Male" | "Female">("Male");
  const [className, setClassName] = React.useState("Grade 5");
  const [section, setSection] = React.useState("A");
  const [campus, setCampus] = React.useState(CAMPUSES[0].campusName);
  const [guardian, setGuardian] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [rollNo, setRollNo] = React.useState("");
  const [status, setStatus] = React.useState<StudentStatus>("Active");
  const [feeStatus, setFeeStatus] = React.useState<FeeStatus>("Paid");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      setName("");
      setGender("Male");
      setClassName("Grade 5");
      setSection("A");
      setCampus(CAMPUSES[0].campusName);
      setGuardian("");
      setPhone("");
      setRollNo(String(Math.floor(10 + Math.random() * 40)));
      setStatus("Active");
      setFeeStatus("Paid");
      setErrors({});
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Student name is required";
    }
    if (!guardian.trim()) {
      newErrors.guardian = "Guardian name is required";
    }
    if (!phone.trim()) {
      newErrors.phone = "Contact phone is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    const nextNumber = 412 + existingCount + 1;
    const admissionNumber = `SMS-2026-${String(nextNumber).padStart(4, "0")}`;

    const newStudent: Student = {
      id: `s-${Date.now()}`,
      admissionNumber,
      rollNo: rollNo.trim() || String(Math.floor(10 + Math.random() * 40)),
      name: name.trim(),
      gender,
      className,
      section,
      campus,
      guardian: guardian.trim(),
      phone: phone.trim(),
      attendance: 100,
      feeStatus,
      status,
      enrolledOn: new Date().toISOString().slice(0, 10),
    };

    onAddStudent(newStudent);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden sm:max-w-2xl border-border/80 shadow-2xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <DialogHeader className="border-b border-border/70 bg-muted/30 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand ring-1 ring-brand/10">
                <GraduationCap className="size-5" />
              </div>
              <div>
                <DialogTitle className="font-heading text-lg font-bold text-brand flex items-center gap-2">
                  New Student Admission
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand">
                    <Sparkles className="size-3" />
                    Session 2026
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Enroll a new student and generate their academic and fee record.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form Content */}
          <div className="max-h-[68vh] overflow-y-auto px-6 py-5 space-y-5 scrollbar-thin-light">
            {/* Student Info */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Student Profile
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="student-name" className="text-xs font-medium">
                    Full Name <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="student-name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    placeholder="e.g. Daniyal Khan"
                    className={errors.name ? "border-danger focus-visible:ring-danger/20" : ""}
                  />
                  {errors.name && (
                    <p className="text-[11px] text-danger">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="student-gender" className="text-xs font-medium">
                    Gender
                  </Label>
                  <div className="relative">
                    <select
                      id="student-gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value as "Male" | "Female")}
                      className="h-9 w-full appearance-none rounded-lg border border-input bg-background/80 px-3 py-1.5 pr-8 text-sm outline-none transition-colors focus:border-ring focus:bg-white focus:ring-3 focus:ring-ring/20"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Placement */}
            <div className="border-t border-border/60 pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Academic Placement
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-3 space-y-1.5">
                  <Label htmlFor="student-campus" className="text-xs font-medium">
                    Campus Branch
                  </Label>
                  <div className="relative">
                    <select
                      id="student-campus"
                      value={campus}
                      onChange={(e) => setCampus(e.target.value)}
                      className="h-9 w-full appearance-none rounded-lg border border-input bg-background/80 px-3 py-1.5 pr-8 text-sm outline-none transition-colors focus:border-ring focus:bg-white focus:ring-3 focus:ring-ring/20"
                    >
                      {CAMPUSES.map((c) => (
                        <option key={c.campusName} value={c.campusName}>
                          {formatCampusDisplay(c.campusName).label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="student-class" className="text-xs font-medium">
                    Class
                  </Label>
                  <div className="relative">
                    <select
                      id="student-class"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="h-9 w-full appearance-none rounded-lg border border-input bg-background/80 px-3 py-1.5 pr-8 text-sm outline-none transition-colors focus:border-ring focus:bg-white focus:ring-3 focus:ring-ring/20"
                    >
                      {CLASSES.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="student-section" className="text-xs font-medium">
                    Section
                  </Label>
                  <div className="relative">
                    <select
                      id="student-section"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="h-9 w-full appearance-none rounded-lg border border-input bg-background/80 px-3 py-1.5 pr-8 text-sm outline-none transition-colors focus:border-ring focus:bg-white focus:ring-3 focus:ring-ring/20"
                    >
                      {SECTIONS.map((sec) => (
                        <option key={sec} value={sec}>
                          Section {sec}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="student-roll" className="text-xs font-medium">
                    Roll Number
                  </Label>
                  <Input
                    id="student-roll"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g. 24"
                  />
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            <div className="border-t border-border/60 pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Guardian Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="guardian-name" className="text-xs font-medium">
                    Guardian Name <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="guardian-name"
                    value={guardian}
                    onChange={(e) => {
                      setGuardian(e.target.value);
                      if (errors.guardian) setErrors((prev) => ({ ...prev, guardian: "" }));
                    }}
                    placeholder="e.g. Tariq Mahmood"
                    className={errors.guardian ? "border-danger focus-visible:ring-danger/20" : ""}
                  />
                  {errors.guardian && (
                    <p className="text-[11px] text-danger">{errors.guardian}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="guardian-phone" className="text-xs font-medium">
                    Phone Number <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="guardian-phone"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    placeholder="0300-1234567"
                    className={errors.phone ? "border-danger focus-visible:ring-danger/20" : ""}
                  />
                  {errors.phone && (
                    <p className="text-[11px] text-danger">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Status & Billing */}
            <div className="border-t border-border/60 pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Status & Billing
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="student-status" className="text-xs font-medium">
                    Enrollment Status
                  </Label>
                  <div className="relative">
                    <select
                      id="student-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as StudentStatus)}
                      className="h-9 w-full appearance-none rounded-lg border border-input bg-background/80 px-3 py-1.5 pr-8 text-sm outline-none transition-colors focus:border-ring focus:bg-white focus:ring-3 focus:ring-ring/20"
                    >
                      <option value="Active">Active (Attending)</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Transferred">Transferred</option>
                      <option value="Alumni">Alumni</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="student-fee" className="text-xs font-medium">
                    Initial Fee Status
                  </Label>
                  <div className="relative">
                    <select
                      id="student-fee"
                      value={feeStatus}
                      onChange={(e) => setFeeStatus(e.target.value as FeeStatus)}
                      className="h-9 w-full appearance-none rounded-lg border border-input bg-background/80 px-3 py-1.5 pr-8 text-sm outline-none transition-colors focus:border-ring focus:bg-white focus:ring-3 focus:ring-ring/20"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partial</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="border-t border-border/70 bg-muted/20 px-6 py-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="gap-2 bg-brand text-cream hover:bg-brand-600">
              <UserPlus className="size-4" />
              Complete Admission
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
