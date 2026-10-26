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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExamTerm } from "@/types";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";

interface AddExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExam: (exam: ExamTerm) => void;
}

export function AddExamDialog({
  open,
  onOpenChange,
  onAddExam,
}: AddExamDialogProps) {
  const [examName, setExamName] = React.useState("");
  const [academicYear, setAcademicYear] = React.useState("2026–2027");
  const [termType, setTermType] = React.useState("Mid-Term");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [campus, setCampus] = React.useState("All Campuses");
  const [classesCount, setClassesCount] = React.useState("14");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) {
      toast.error("Please enter examination name");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    const newExam: ExamTerm = {
      id: `ex-${Date.now()}`,
      examName: examName.trim(),
      academicYear,
      term: termType,
      startDate,
      endDate,
      campus,
      classes: parseInt(classesCount, 10) || 14,
      progress: 0,
      status: "Scheduled",
    };

    onAddExam(newExam);
    toast.success("Examination Scheduled", {
      description: `"${newExam.examName}" has been created successfully.`,
    });

    onOpenChange(false);
    // Reset form
    setExamName("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-soft/60 via-background to-background p-6 border-b border-border/70">
          <DialogHeader>
            <div className="flex items-center gap-3.5 pr-8">
              <div className="flex size-11 items-center justify-center rounded-xl bg-brand text-cream shadow-sm shrink-0">
                <CalendarClock className="size-5.5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground leading-tight truncate">
                  Schedule Examination
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1">
                  Create an academic examination term and configure its schedule.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="examName" className="text-xs font-semibold text-foreground">
              Examination Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="examName"
              placeholder="e.g. Mid-Term Examination 2026–27"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Academic Session</Label>
              <Select value={academicYear} onValueChange={(val) => { if (val) setAcademicYear(val); }}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026–2027">2026–2027</SelectItem>
                  <SelectItem value="2027–2028">2027–2028</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Term Category</Label>
              <Select value={termType} onValueChange={(val) => { if (val) setTermType(val); }}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="First Term">First Term</SelectItem>
                  <SelectItem value="Mid Term">Mid Term</SelectItem>
                  <SelectItem value="Send-Up / Pre-Board">Send-Up / Pre-Board</SelectItem>
                  <SelectItem value="Annual / Final Term">Annual / Final Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDate" className="text-xs font-semibold text-foreground">
                Commencement Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endDate" className="text-xs font-semibold text-foreground">
                Conclusion Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Campus Branch</Label>
              <Select value={campus} onValueChange={(val) => { if (val) setCampus(val); }}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Campuses">All Campuses</SelectItem>
                  <SelectItem value="Main Campus — Gulberg">Main Campus — Gulberg</SelectItem>
                  <SelectItem value="F-8 Islamabad Campus">F-8 Islamabad Campus</SelectItem>
                  <SelectItem value="DHA Phase 5 Campus">DHA Phase 5 Campus</SelectItem>
                  <SelectItem value="Clifton Campus">Clifton Campus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Participating Classes</Label>
              <Select value={classesCount} onValueChange={(val) => { if (val) setClassesCount(val); }}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="14">All Classes (Nursery - 10th)</SelectItem>
                  <SelectItem value="10">Primary & Middle (Class 1 - 8)</SelectItem>
                  <SelectItem value="4">Matric Only (9th & 10th)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border/70 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8.5 px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-brand text-cream hover:bg-brand-600 text-xs h-8.5 px-4 cursor-pointer shadow-2xs"
            >
              Save Examination
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
