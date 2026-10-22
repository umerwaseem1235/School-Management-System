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
import { generateStaffPDF } from "@/lib/pdf/generate-staff-pdf";
import type { StaffMember } from "@/types";
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

interface ExportStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffMember[];
  initialCampus?: string;
}

export function ExportStaffDialog({
  open,
  onOpenChange,
  staff,
  initialCampus = "all",
}: ExportStaffDialogProps) {
  const [selectedCampus, setSelectedCampus] = React.useState<string>(initialCampus);
  const [selectedType, setSelectedType] = React.useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [isExporting, setIsExporting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setSelectedCampus(initialCampus);
    }
  }, [open, initialCampus]);

  const uniqueCampuses = React.useMemo(() => {
    return Array.from(new Set(staff.map((s) => s.campus))).sort();
  }, [staff]);

  const uniqueDepartments = React.useMemo(() => {
    return Array.from(new Set(staff.map((s) => s.department))).sort();
  }, [staff]);

  // Compute matching staff based on active filters
  const matchingStaff = React.useMemo(() => {
    return staff.filter((s) => {
      if (selectedCampus !== "all" && s.campus !== selectedCampus) return false;
      if (selectedType !== "all" && s.type !== selectedType) return false;
      if (selectedDepartment !== "all" && s.department !== selectedDepartment) return false;
      if (selectedStatus !== "all" && s.status !== selectedStatus) return false;
      return true;
    });
  }, [staff, selectedCampus, selectedType, selectedDepartment, selectedStatus]);

  const matchingCount = matchingStaff.length;
  const teachingCount = matchingStaff.filter((s) => s.type === "Teaching").length;
  const activeCount = matchingStaff.filter((s) => s.status === "Active").length;

  const handleDownload = () => {
    if (matchingCount === 0) {
      toast.error("No staff members match the selected filters.");
      return;
    }

    setIsExporting(true);
    try {
      const filterParts: string[] = [];
      if (selectedType !== "all") filterParts.push(`${selectedType} Staff`);
      if (selectedDepartment !== "all") filterParts.push(selectedDepartment);
      if (selectedStatus !== "all") filterParts.push(`${selectedStatus} Status`);
      const filterSummary = filterParts.length > 0 ? filterParts.join(" · ") : undefined;

      const campusParam = selectedCampus === "all" ? undefined : selectedCampus;
      const targetCampusInfo = campusParam ? formatCampusDisplay(campusParam) : null;

      generateStaffPDF({
        staff: matchingStaff,
        campusName: campusParam,
        filterSummary,
      });

      toast.success("Staff Directory PDF Generated", {
        description: targetCampusInfo
          ? `Downloaded official directory for ${targetCampusInfo.primary} (${matchingCount} staff).`
          : `Downloaded comprehensive network directory (${matchingCount} staff).`,
      });

      onOpenChange(false);
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const selectedCampusDisplay =
    selectedCampus === "all" ? null : formatCampusDisplay(selectedCampus);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden sm:max-w-xl border-border/80 shadow-2xl">
        {/* Header */}
        <DialogHeader className="border-b border-border/70 bg-gradient-to-r from-brand-50/70 via-background to-background px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-cream shadow-sm ring-2 ring-brand/20">
              <FileDown className="size-5" />
            </div>
            <div>
              <DialogTitle className="font-heading text-lg font-bold text-foreground">
                Export Staff & Faculty Directory
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Generate and download an official landscape PDF dossier for staff records.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-5 space-y-4 max-h-[68vh] overflow-y-auto">
          {/* Primary: Campus Filter */}
          <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <School className="size-3.5 text-brand" />
                <span>Select Campus Scope</span>
              </label>
              {selectedCampus !== "all" && (
                <button
                  type="button"
                  onClick={() => setSelectedCampus("all")}
                  className="text-[11px] font-medium text-brand hover:underline cursor-pointer"
                >
                  Reset to All Campuses
                </button>
              )}
            </div>

            <Select
              value={selectedCampus}
              onValueChange={(val) => {
                if (val) setSelectedCampus(val);
              }}
            >
              <SelectTrigger className="w-full h-9.5 text-xs font-medium">
                <SelectValue placeholder="Choose campus..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs font-medium">
                  🏢 All Campuses (Central Network)
                </SelectItem>
                {uniqueCampuses.map((c) => {
                  const info = formatCampusDisplay(c);
                  return (
                    <SelectItem key={c} value={c} className="text-xs font-medium">
                      📍 {info.primary} {info.secondary ? `(${info.secondary})` : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Secondary Filters */}
          <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <SlidersHorizontal className="size-3.5 text-brand" />
              <span>Refine Records (Optional)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Staff Type */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Staff Type</label>
                <Select
                  value={selectedType}
                  onValueChange={(val) => {
                    if (val) setSelectedType(val);
                  }}
                >
                  <SelectTrigger className="h-8.5 text-xs">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      All Types
                    </SelectItem>
                    <SelectItem value="Teaching" className="text-xs">
                      Teaching Faculty
                    </SelectItem>
                    <SelectItem value="Non-Teaching" className="text-xs">
                      Non-Teaching Staff
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Department</label>
                <Select
                  value={selectedDepartment}
                  onValueChange={(val) => {
                    if (val) setSelectedDepartment(val);
                  }}
                >
                  <SelectTrigger className="h-8.5 text-xs">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      All Departments
                    </SelectItem>
                    {uniqueDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept} className="text-xs">
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Status</label>
                <Select
                  value={selectedStatus}
                  onValueChange={(val) => {
                    if (val) setSelectedStatus(val);
                  }}
                >
                  <SelectTrigger className="h-8.5 text-xs">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      All Statuses
                    </SelectItem>
                    <SelectItem value="Active" className="text-xs">
                      Active
                    </SelectItem>
                    <SelectItem value="Inactive" className="text-xs">
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Export Summary Preview Strip */}
          <div className="rounded-xl border border-brand/20 bg-brand-50/60 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="grid size-8 place-items-center rounded-lg bg-brand text-cream text-xs font-bold">
                {matchingCount}
              </div>
              <div className="text-xs">
                <p className="font-semibold text-foreground">
                  {matchingCount} Staff Record{matchingCount === 1 ? "" : "s"} Ready for PDF
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {selectedCampusDisplay
                    ? `${selectedCampusDisplay.primary} · ${teachingCount} Teaching Faculty`
                    : `Across All Campuses · ${teachingCount} Teaching Faculty`}
                </p>
              </div>
            </div>
            <div className="text-right text-[11px]">
              <span className="font-semibold text-success flex items-center gap-1 justify-end">
                <CheckCircle2 className="size-3" /> {activeCount} Active
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
            disabled={isExporting || matchingCount === 0}
            className="h-9 px-5 rounded-lg text-xs font-semibold bg-brand text-cream hover:bg-brand-600 shadow-sm transition-all active:scale-95 cursor-pointer gap-2"
          >
            <FileDown className="size-4" />
            <span>{isExporting ? "Generating PDF…" : "Download PDF Report"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
