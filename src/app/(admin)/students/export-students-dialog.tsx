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
import { formatCampusDisplay } from "@/lib/format";
import { generateStudentsPDF } from "@/lib/pdf/generate-students-pdf";
import type { Student } from "@/types";
import {
  Building2,
  CheckCircle2,
  FileDown,
  GraduationCap,
  Info,
  Layers,
  School,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface ExportStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  initialCampus?: string;
}

export function ExportStudentsDialog({
  open,
  onOpenChange,
  students,
  initialCampus = "all",
}: ExportStudentsDialogProps) {
  const [selectedCampus, setSelectedCampus] = React.useState<string>(initialCampus);
  const [selectedClass, setSelectedClass] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [selectedFeeStatus, setSelectedFeeStatus] = React.useState<string>("all");
  const [isExporting, setIsExporting] = React.useState(false);

  // Sync initialCampus when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedCampus(initialCampus);
    }
  }, [open, initialCampus]);

  const uniqueCampuses = React.useMemo(() => {
    return Array.from(new Set(students.map((s) => s.campus))).sort();
  }, [students]);

  const uniqueClasses = React.useMemo(() => {
    return Array.from(new Set(students.map((s) => s.className))).sort();
  }, [students]);

  // Compute matching students based on active selection
  const matchingStudents = React.useMemo(() => {
    return students.filter((s) => {
      if (selectedCampus !== "all" && s.campus !== selectedCampus) return false;
      if (selectedClass !== "all" && s.className !== selectedClass) return false;
      if (selectedStatus !== "all" && s.status !== selectedStatus) return false;
      if (selectedFeeStatus !== "all" && s.feeStatus !== selectedFeeStatus) return false;
      return true;
    });
  }, [students, selectedCampus, selectedClass, selectedStatus, selectedFeeStatus]);

  const matchingCount = matchingStudents.length;
  const activeCount = matchingStudents.filter((s) => s.status === "Active").length;
  const avgAttendance = matchingCount
    ? (matchingStudents.reduce((acc, s) => acc + (s.attendance ?? 0), 0) / matchingCount).toFixed(1)
    : "0.0";

  const handleDownload = () => {
    if (matchingCount === 0) {
      toast.error("No students match the selected filters.");
      return;
    }

    setIsExporting(true);
    try {
      // Build filter summary
      const filterParts: string[] = [];
      if (selectedClass !== "all") filterParts.push(selectedClass);
      if (selectedStatus !== "all") filterParts.push(`${selectedStatus} Status`);
      if (selectedFeeStatus !== "all") filterParts.push(`${selectedFeeStatus} Fees`);
      const filterSummary = filterParts.length > 0 ? filterParts.join(" · ") : undefined;

      const campusInfo = selectedCampus !== "all" ? formatCampusDisplay(selectedCampus) : null;
      const title = campusInfo
        ? `${campusInfo.primary} Official Directory`
        : "Central Student Directory & Roster";

      const filename = generateStudentsPDF({
        students: matchingStudents,
        title,
        campusName: selectedCampus !== "all" ? selectedCampus : undefined,
        filterSummary,
      });

      toast.success("PDF Downloaded Successfully", {
        description: `Exported ${matchingCount} student records to ${filename}.`,
      });
      onOpenChange(false);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedCampus("all");
    setSelectedClass("all");
    setSelectedStatus("all");
    setSelectedFeeStatus("all");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden border-border/80 shadow-2xl">
        {/* Header */}
        <DialogHeader className="border-b border-border/70 bg-gradient-to-r from-brand-50/80 via-background to-background px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-cream shadow-sm">
              <FileDown className="size-5" />
            </div>
            <div>
              <DialogTitle className="font-heading text-lg font-bold text-foreground">
                Export Student Records to PDF
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Download official student rosters for all schools or select a specific campus.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 text-xs">
          {/* Campus Selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <School className="size-3.5 text-brand" />
                Select Campus Branch
              </span>
              {selectedCampus !== "all" && (
                <span className="text-[11px] font-normal text-brand font-medium">
                  Dedicated Campus Report
                </span>
              )}
            </label>
            <Select
              value={selectedCampus}
              onValueChange={(val) => setSelectedCampus(String(val))}
            >
              <SelectTrigger className="h-10 w-full rounded-lg border-border/80 bg-background/80 text-xs font-medium shadow-2xs hover:bg-muted/30">
                <SelectValue placeholder="Select Campus" />
              </SelectTrigger>
              <SelectContent className="max-h-60 rounded-xl shadow-xl border border-border/70">
                <SelectItem value="all" className="py-2 cursor-pointer font-semibold">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-3.5 text-brand shrink-0" />
                    <span>All Campuses (Entire School Directory)</span>
                  </div>
                </SelectItem>
                {uniqueCampuses.map((campus) => {
                  const info = formatCampusDisplay(campus);
                  const count = students.filter((s) => s.campus === campus).length;
                  return (
                    <SelectItem key={campus} value={campus} className="py-2 cursor-pointer">
                      <div className="flex items-center justify-between w-full gap-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{info.primary}</span>
                          {info.secondary && (
                            <span className="text-[11px] text-muted-foreground">{info.secondary}</span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-brand bg-brand-50 px-2 py-0.5 rounded-full shrink-0">
                          {count} students
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Secondary Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Class Filter */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground flex items-center gap-1">
                <GraduationCap className="size-3 text-muted-foreground" />
                <span>Class</span>
              </label>
              <Select
                value={selectedClass}
                onValueChange={(val) => setSelectedClass(String(val))}
              >
                <SelectTrigger className="h-9 w-full rounded-lg border-border/80 bg-background/80 text-xs font-medium shadow-2xs">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg border border-border/70">
                  <SelectItem value="all" className="cursor-pointer font-medium">
                    All Classes
                  </SelectItem>
                  {uniqueClasses.map((cls) => (
                    <SelectItem key={cls} value={cls} className="cursor-pointer">
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground flex items-center gap-1">
                <Users className="size-3 text-muted-foreground" />
                <span>Enrollment</span>
              </label>
              <Select
                value={selectedStatus}
                onValueChange={(val) => setSelectedStatus(String(val))}
              >
                <SelectTrigger className="h-9 w-full rounded-lg border-border/80 bg-background/80 text-xs font-medium shadow-2xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg border border-border/70">
                  <SelectItem value="all" className="cursor-pointer font-medium">All Statuses</SelectItem>
                  <SelectItem value="Active" className="cursor-pointer">Active Only</SelectItem>
                  <SelectItem value="Transferred" className="cursor-pointer">Transferred</SelectItem>
                  <SelectItem value="Alumni" className="cursor-pointer">Alumni</SelectItem>
                  <SelectItem value="Suspended" className="cursor-pointer">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fee Status Filter */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground flex items-center gap-1">
                <Layers className="size-3 text-muted-foreground" />
                <span>Fee Status</span>
              </label>
              <Select
                value={selectedFeeStatus}
                onValueChange={(val) => setSelectedFeeStatus(String(val))}
              >
                <SelectTrigger className="h-9 w-full rounded-lg border-border/80 bg-background/80 text-xs font-medium shadow-2xs">
                  <SelectValue placeholder="All Fees" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg border border-border/70">
                  <SelectItem value="all" className="cursor-pointer font-medium">All Fee Statuses</SelectItem>
                  <SelectItem value="Paid" className="cursor-pointer">Paid</SelectItem>
                  <SelectItem value="Partial" className="cursor-pointer">Partial</SelectItem>
                  <SelectItem value="Unpaid" className="cursor-pointer">Unpaid</SelectItem>
                  <SelectItem value="Overdue" className="cursor-pointer">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Live Preview / Summary Card */}
          <div className="rounded-xl border border-brand/20 bg-brand-50/50 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <CheckCircle2 className="size-4 text-brand" />
                <span>Report Preview Summary</span>
              </div>
              {(selectedCampus !== "all" ||
                selectedClass !== "all" ||
                selectedStatus !== "all" ||
                selectedFeeStatus !== "all") && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] font-medium text-brand hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-background/90 p-2 border border-border/60">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wide">
                  Records Selected
                </p>
                <p className="text-base font-bold text-brand tabular-nums mt-0.5">
                  {matchingCount}
                  <span className="text-[10px] font-normal text-muted-foreground ml-1">
                    / {students.length}
                  </span>
                </p>
              </div>

              <div className="rounded-lg bg-background/90 p-2 border border-border/60">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wide">
                  Active Enrolled
                </p>
                <p className="text-base font-bold text-success tabular-nums mt-0.5">
                  {activeCount}
                </p>
              </div>

              <div className="rounded-lg bg-background/90 p-2 border border-border/60">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wide">
                  Avg Attendance
                </p>
                <p className="text-base font-bold text-foreground tabular-nums mt-0.5">
                  {avgAttendance}%
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1 text-[11px] text-muted-foreground border-t border-border/50">
              <Info className="size-3.5 text-brand shrink-0 mt-0.5" />
              <span>
                {selectedCampus === "all" ? (
                  <>Generates a <strong>multi-campus central report</strong> covering all registered students across all branches.</>
                ) : (
                  <>Generates a <strong>dedicated campus report</strong> specifically branded for <strong>{formatCampusDisplay(selectedCampus).primary}</strong>.</>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="m-0 border-t border-border/70 bg-muted/30 px-6 py-4 flex flex-row items-center justify-end gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 rounded-lg text-xs font-semibold border-border/80 bg-background text-foreground/90 hover:bg-muted/70 hover:text-foreground shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDownload}
            disabled={matchingCount === 0 || isExporting}
            className="h-9 gap-2 bg-brand text-cream hover:bg-brand-600 shadow-sm transition-all active:scale-95 cursor-pointer text-xs font-semibold px-4.5 rounded-lg"
          >
            <FileDown className="size-4" />
            <span>Download {selectedCampus !== "all" ? `${formatCampusDisplay(selectedCampus).primary} PDF` : "School PDF"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
