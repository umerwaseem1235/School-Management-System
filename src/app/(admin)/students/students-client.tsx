"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatGrid, StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  UserCheck,
  Activity,
  Plus,
  GraduationCap,
  FileDown,
  Building2,
  ChevronDown,
  School,
  SlidersHorizontal,
} from "lucide-react";
import { formatCampusDisplay, formatNumber, formatPercent } from "@/lib/format";
import { generateStudentsPDF } from "@/lib/pdf/generate-students-pdf";
import type { FeeStatus, Student, StudentStatus } from "@/types";
import { StudentsTable } from "./students-table";
import { NewAdmissionDialog } from "./new-admission-dialog";
import { ExportStudentsDialog } from "./export-students-dialog";
import { toast } from "sonner";

interface StudentsClientProps {
  initialStudents: Student[];
}

export function StudentsClient({ initialStudents }: StudentsClientProps) {
  const [students, setStudents] = React.useState<Student[]>(initialStudents);
  const [isAdmissionOpen, setIsAdmissionOpen] = React.useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = React.useState(false);
  const [exportDialogCampus, setExportDialogCampus] = React.useState<string>("all");

  // Dynamic statistics
  const total = students.length;
  const activeCount = students.filter((s) => s.status === "Active").length;
  const maleCount = students.filter((s) => s.gender === "Male").length;
  const femaleCount = students.filter((s) => s.gender === "Female").length;
  const avgAttendance =
    students.reduce((acc, s) => acc + (s.attendance ?? 0), 0) / (total || 1);

  // Campuses list
  const uniqueCampuses = React.useMemo(() => {
    return Array.from(new Set(students.map((s) => s.campus))).sort();
  }, [students]);

  const handleStatusChange = React.useCallback((id: string, newStatus: StudentStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  }, []);

  const handleFeeStatusChange = React.useCallback((id: string, newFeeStatus: FeeStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, feeStatus: newFeeStatus } : s))
    );
  }, []);

  const handleAddStudent = React.useCallback((newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
    toast.success("Student Enrolled Successfully", {
      description: `${newStudent.name} admitted into ${newStudent.className} - Section ${newStudent.section} (${newStudent.admissionNumber}).`,
    });
  }, []);

  const handleDownloadPDF = React.useCallback(
    (campusName?: string) => {
      try {
        const isAll = !campusName || campusName === "all" || campusName === "All Campuses";
        const campusStudents = isAll
          ? students
          : students.filter((s) => s.campus === campusName);

        if (campusStudents.length === 0) {
          toast.error("No student records found for this campus.");
          return;
        }

        const campusInfo = !isAll && campusName ? formatCampusDisplay(campusName) : null;
        const title = campusInfo
          ? `${campusInfo.primary} Official Directory`
          : "Central Student Directory & Enrollment Report";

        const filename = generateStudentsPDF({
          students: campusStudents,
          title,
          campusName: !isAll ? campusName : undefined,
        });

        toast.success(
          campusInfo ? `${campusInfo.primary} PDF Downloaded` : "All Campuses PDF Downloaded",
          {
            description: `Exported ${campusStudents.length} student records to ${filename}.`,
          }
        );
      } catch (err) {
        console.error("PDF generation failed:", err);
        toast.error("Failed to generate PDF. Please try again.");
      }
    },
    [students]
  );

  return (
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader
        title="Student Information System"
        actions={
          <div className="flex items-center gap-2">
            {/* Professional Export PDF Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 rounded-lg border border-border/80 bg-background px-3.5 py-2 text-xs sm:text-sm font-medium text-foreground shadow-2xs hover:bg-muted/60 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <FileDown className="size-4 text-brand shrink-0" data-icon="inline-start" />
                <span>Export PDF</span>
                <ChevronDown className="size-3.5 text-muted-foreground opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-76 p-1.5 shadow-xl border border-border/80 rounded-xl"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Export Scope
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => handleDownloadPDF("all")}
                    className="flex items-center justify-between rounded-lg px-2.5 py-2 cursor-pointer hover:bg-accent/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="grid size-7 place-items-center rounded-md bg-brand-50 text-brand shrink-0">
                        <Building2 className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-foreground">
                          All Campuses (Entire School)
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Central multi-campus directory
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-full shrink-0">
                      {students.length}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1.5 bg-border/60" />

                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Download by Campus
                  </DropdownMenuLabel>
                  {uniqueCampuses.map((campus) => {
                    const info = formatCampusDisplay(campus);
                    const count = students.filter((s) => s.campus === campus).length;
                    return (
                      <DropdownMenuItem
                        key={campus}
                        onClick={() => handleDownloadPDF(campus)}
                        className="flex items-center justify-between rounded-lg px-2.5 py-2 cursor-pointer hover:bg-accent/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="grid size-7 place-items-center rounded-md bg-muted/80 text-foreground/80 shrink-0">
                            <School className="size-3.5 text-brand" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-foreground truncate">
                              {info.primary}
                            </span>
                            {info.secondary && (
                              <span className="text-[11px] text-muted-foreground truncate">
                                {info.secondary}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-brand bg-brand-50 px-2 py-0.5 rounded-full shrink-0 ml-2">
                          {count}
                        </span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1.5 bg-border/60" />

                <DropdownMenuItem
                  onClick={() => {
                    setExportDialogCampus("all");
                    setIsExportDialogOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                >
                  <SlidersHorizontal className="size-3.5 text-brand shrink-0" />
                  <span>Custom Filters & Class Export…</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={() => setIsAdmissionOpen(true)}
              className="gap-2 bg-brand text-cream hover:bg-brand-600 cursor-pointer shadow-sm"
            >
              <Plus className="size-4" data-icon="inline-start" />
              New Admission
            </Button>
          </div>
        }
      />

      <StatGrid>
        <StatCard label="Total Students" value={formatNumber(total)} icon={Users} />
        <StatCard label="Active Students" value={formatNumber(activeCount)} icon={UserCheck} />
        <StatCard
          label="Gender Split"
          value={`${maleCount} M / ${femaleCount} F`}
          icon={GraduationCap}
        />
        <StatCard
          label="Avg Attendance"
          value={formatPercent(avgAttendance / 100)}
          icon={Activity}
        />
      </StatGrid>

      <SectionCard flush>
        <StudentsTable
          data={students}
          onStatusChange={handleStatusChange}
          onFeeStatusChange={handleFeeStatusChange}
        />
      </SectionCard>

      <NewAdmissionDialog
        open={isAdmissionOpen}
        onOpenChange={setIsAdmissionOpen}
        onAddStudent={handleAddStudent}
        existingCount={students.length}
      />

      <ExportStudentsDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        students={students}
        initialCampus={exportDialogCampus}
      />
    </div>
  );
}
