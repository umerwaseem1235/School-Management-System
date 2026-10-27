"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatGrid, StatCard } from "@/components/shared/stat-card";
import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Meter } from "@/components/shared/meter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs";
import {
  BookOpen,
  FileText,
  FolderArchive,
  Plus,
  Upload,
  Calendar,
  CheckCircle2,
  Download,
  FileCheck,
  Eye,
  ChevronDown,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatNumber, formatPercent } from "@/lib/format";
import type { LmsAssignment, LmsCourse, LmsLiveClass, LmsMaterial } from "@/types";
import {
  PAKISTANI_SCHOOL_CLASSES,
  PAKISTANI_SCHOOL_SUBJECTS,
  sortPakistaniClasses,
  formatCompactClass,
  formatCourseSubject,
} from "@/lib/mock/lms";
import { CreateAssignmentDialog } from "./create-assignment-dialog";
import { UploadMaterialDialog } from "./upload-material-dialog";
import { CreateCourseDialog } from "./create-course-dialog";
import { ViewSyllabusDialog } from "./view-syllabus-dialog";
import { ViewAssignmentDialog } from "./view-assignment-dialog";
import { ViewMaterialDialog } from "./view-material-dialog";

interface LmsClientProps {
  initialCourses: LmsCourse[];
  initialAssignments: LmsAssignment[];
  initialMaterials: LmsMaterial[];
  initialLiveClasses?: LmsLiveClass[];
}

export function LmsClient({
  initialCourses,
  initialAssignments,
  initialMaterials,
  initialLiveClasses,
}: LmsClientProps) {
  // Main states
  const [courses, setCourses] = React.useState<LmsCourse[]>(initialCourses);
  const [assignments, setAssignments] = React.useState<LmsAssignment[]>(initialAssignments);
  const [materials, setMaterials] = React.useState<LmsMaterial[]>(initialMaterials);

  // Dialog states
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = React.useState(false);
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = React.useState(false);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = React.useState(false);

  // Pre-selected course context
  const [selectedCourseForAssignment, setSelectedCourseForAssignment] = React.useState<string | undefined>(undefined);
  const [viewingSyllabusCourse, setViewingSyllabusCourse] = React.useState<LmsCourse | null>(null);
  const [viewingAssignment, setViewingAssignment] = React.useState<LmsAssignment | null>(null);
  const [viewingMaterial, setViewingMaterial] = React.useState<LmsMaterial | null>(null);

  // Active LMS portion dropdown selector
  const [activeTab, setActiveTab] = React.useState<"courses" | "assignments" | "materials">("courses");

  // Key KPI metrics calculations
  const activeCoursesCount = courses.filter((c) => c.status === "Active").length;
  const activeAssignmentsCount = assignments.filter((a) => a.status === "Active").length;

  const totalSubmissionsSum = assignments.reduce((acc, a) => acc + a.totalSubmissions, 0);
  const totalStudentsSum = assignments.reduce((acc, a) => acc + a.totalStudents, 0);
  const avgSubmissionRate =
    totalStudentsSum > 0 ? (totalSubmissionsSum / totalStudentsSum) * 100 : 0;

  // LMS portions metadata for dropdown selector
  const sections = React.useMemo(
    () => [
      {
        id: "courses" as const,
        label: "Courses & Syllabus",
        icon: BookOpen,
        count: courses.length,
      },
      {
        id: "assignments" as const,
        label: "Assignments",
        icon: FileText,
        count: assignments.length,
      },
      {
        id: "materials" as const,
        label: "Study Materials",
        icon: FolderArchive,
        count: materials.length,
      },
    ],
    [courses.length, assignments.length, materials.length]
  );

  const activeSectionObj =
    sections.find((s) => s.id === activeTab) || sections[0];

  // Unique subjects for filter (comprehensive Pakistani school subjects + courses)
  const courseSubjects = React.useMemo(() => {
    const set = new Set<string>([...PAKISTANI_SCHOOL_SUBJECTS, ...courses.map((c) => c.subject)]);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [courses]);

  // Handlers
  const handleAddAssignment = (newAssignment: LmsAssignment) => {
    setAssignments((prev) => [newAssignment, ...prev]);
    setCourses((prev) =>
      prev.map((c) =>
        c.title === newAssignment.courseName
          ? { ...c, activeAssignments: c.activeAssignments + 1 }
          : c
      )
    );
  };

  const handleUploadMaterial = (newMaterial: LmsMaterial) => {
    setMaterials((prev) => [newMaterial, ...prev]);
  };

  const handleAddCourse = (newCourse: LmsCourse) => {
    setCourses((prev) => [newCourse, ...prev]);
  };

  const handleOpenAssignmentForCourse = (course: LmsCourse) => {
    setSelectedCourseForAssignment(course.id);
    setIsAssignmentDialogOpen(true);
  };

  const handleOpenNewAssignmentGlobal = () => {
    setSelectedCourseForAssignment(undefined);
    setIsAssignmentDialogOpen(true);
  };

  const handleMarkAssignmentGraded = (assignmentId: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === assignmentId) {
          const nextStatus = a.status === "Graded" ? "Active" : "Graded";
          toast.success(
            nextStatus === "Graded"
              ? "Assignment marked as Graded"
              : "Assignment reopened for submissions"
          );
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  };

  const handleDownloadResource = (material: LmsMaterial) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === material.id ? { ...m, downloadCount: m.downloadCount + 1 } : m
      )
    );
    toast.success("Downloading Resource", {
      description: `"${material.title}" (${material.fileType}) download started.`,
    });
  };

  // Assignment Columns (Professional Enterprise Layout)
  const assignmentColumns: Column<LmsAssignment>[] = React.useMemo(
    () => [
      {
        key: "title",
        header: "Assignment",
        align: "left",
        cell: (r) => (
          <div className="flex flex-col min-w-0 py-0.5 leading-tight">
            <button
              type="button"
              onClick={() => setViewingAssignment(r)}
              className="font-semibold text-foreground text-xs leading-snug truncate hover:text-brand transition-colors cursor-pointer text-left"
              title={r.title}
            >
              {r.title}
            </button>
            <span
              className="text-[11px] text-muted-foreground truncate mt-0.5 text-left"
              title={r.courseName}
            >
              {formatCourseSubject(r.courseName)}
            </span>
          </div>
        ),
        className: "pl-6 pr-3 py-3 text-left min-w-[200px] max-w-[280px]",
        headerClassName: "pl-6 pr-3 text-left",
      },
      {
        key: "class",
        header: "Class & Instructor",
        align: "center",
        cell: (r) => (
          <div className="flex flex-col items-center justify-center min-w-0 leading-tight text-center">
            <span
              className="text-xs font-semibold text-foreground truncate max-w-full text-center"
              title={r.className}
            >
              {formatCompactClass(r.className)}
            </span>
            <span className="text-[11px] text-muted-foreground truncate max-w-full mt-0.5 text-center">
              {r.teacher}
            </span>
          </div>
        ),
        className: "px-3 py-3 text-center min-w-[150px]",
        headerClassName: "px-3 text-center",
      },
      {
        key: "dueDate",
        header: "Due & Marks",
        align: "center",
        cell: (r) => {
          const isPast = new Date(r.dueDate) < new Date("2026-10-20");
          return (
            <div className="flex flex-col items-center justify-center text-center min-w-0 leading-tight whitespace-nowrap">
              <div className="flex items-center justify-center gap-1.5 text-xs">
                <Calendar className="size-3 text-muted-foreground shrink-0" />
                <span className={cn(isPast ? "text-danger font-medium" : "text-foreground font-medium")}>
                  {r.dueDate}
                </span>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground tabular-nums mt-0.5 text-center">
                {r.maxMarks} marks max
              </span>
            </div>
          );
        },
        className: "px-3 py-3 whitespace-nowrap text-center",
        headerClassName: "px-3 text-center",
      },
      {
        key: "submissions",
        header: "Submissions",
        align: "center",
        cell: (r) => {
          const pct = Math.round((r.totalSubmissions / r.totalStudents) * 100);
          return (
            <div className="flex flex-col items-center justify-center text-center min-w-0 leading-tight whitespace-nowrap">
              <span className="text-xs font-semibold text-foreground tabular-nums text-center">
                {r.totalSubmissions} / {r.totalStudents}
              </span>
              <span className="text-[11px] text-muted-foreground tabular-nums mt-0.5 text-center">
                {pct}% Turned In
              </span>
            </div>
          );
        },
        className: "px-3 py-3 text-center whitespace-nowrap",
        headerClassName: "px-3 text-center",
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        cell: (r) => (
          <div className="flex items-center justify-center">
            <StatusBadge status={r.status} dot={false} />
          </div>
        ),
        className: "px-3 py-3 whitespace-nowrap text-center",
        headerClassName: "px-3 text-center",
      },
      {
        key: "actions",
        header: "Action",
        align: "center",
        cell: (r) => (
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setViewingAssignment(r)}
              className="h-7 px-3 text-xs font-semibold cursor-pointer border-border/80 hover:bg-muted gap-1.5 text-foreground"
              title="View assignment details & submissions"
            >
              <Eye className="size-3.5 text-brand" />
              <span>View</span>
            </Button>
          </div>
        ),
        className: "px-4 py-3 text-center whitespace-nowrap",
        headerClassName: "px-4 text-center",
      },
    ],
    []
  );

  const assignmentFilters = React.useMemo<FilterDef<LmsAssignment>[]>(
    () => [
      {
        key: "status",
        label: "Status",
        allLabel: "All Statuses",
        options: ["Active", "Graded", "Past Due"],
        triggerClassName: "w-[130px] shrink-0",
        getValue: (r) => r.status,
      },
      {
        key: "class",
        label: "Class",
        allLabel: "All Classes",
        options: sortPakistaniClasses(
          Array.from(
            new Set([
              ...PAKISTANI_SCHOOL_CLASSES,
              ...assignments.map((a) => a.className),
            ])
          )
        ),
        triggerClassName: "w-[185px] shrink-0",
        getValue: (r) => r.className,
      },
    ],
    [assignments]
  );

  // Materials Columns (Professional Enterprise Layout)
  const materialColumns: Column<LmsMaterial>[] = React.useMemo(
    () => [
      {
        key: "title",
        header: "Document",
        align: "left",
        cell: (r) => (
          <div className="flex flex-col min-w-0 py-0.5 leading-tight">
            <button
              type="button"
              onClick={() => setViewingMaterial(r)}
              className="font-semibold text-foreground text-xs leading-snug truncate hover:text-brand transition-colors cursor-pointer text-left"
              title={r.title}
            >
              {r.title}
            </button>
            <span className="text-[11px] text-muted-foreground truncate mt-0.5 text-left">
              {r.uploadedBy} • {r.uploadDate}
            </span>
          </div>
        ),
        className: "pl-6 pr-3 py-3 text-left min-w-[200px] max-w-[280px]",
        headerClassName: "pl-6 pr-3 text-left",
      },
      {
        key: "subject",
        header: "Subject & Class",
        align: "center",
        cell: (r) => (
          <div className="flex flex-col items-center justify-center min-w-0 leading-tight text-center">
            <span
              className="text-xs font-semibold text-foreground truncate max-w-full text-center"
              title={r.subject}
            >
              {r.subject}
            </span>
            <span
              className="text-[11px] text-muted-foreground truncate max-w-full mt-0.5 text-center"
              title={r.className}
            >
              {formatCompactClass(r.className)}
            </span>
          </div>
        ),
        className: "px-3 py-3 text-center min-w-[150px]",
        headerClassName: "px-3 text-center",
      },
      {
        key: "fileType",
        header: "Format & Size",
        align: "center",
        cell: (r) => (
          <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
            <Badge variant="secondary" className="text-[10px] font-semibold uppercase px-1.5 py-0">
              {r.fileType}
            </Badge>
            <span className="text-xs text-muted-foreground tabular-nums">
              {r.fileSize || "Link"}
            </span>
          </div>
        ),
        className: "px-3 py-3 whitespace-nowrap text-center",
        headerClassName: "px-3 text-center",
      },
      {
        key: "downloads",
        header: "Downloads",
        align: "center",
        cell: (r) => (
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
            <Download className="size-3 text-muted-foreground/70" />
            <span>{formatNumber(r.downloadCount)}</span>
          </div>
        ),
        className: "px-3 py-3 whitespace-nowrap text-center",
        headerClassName: "px-3 text-center",
      },
      {
        key: "actions",
        header: "Action",
        align: "center",
        cell: (r) => (
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setViewingMaterial(r)}
              className="h-7 px-3 text-xs font-semibold cursor-pointer border-border/80 hover:bg-muted gap-1.5 text-foreground"
              title="View resource details & download"
            >
              <Eye className="size-3.5 text-brand" />
              <span>View</span>
            </Button>
          </div>
        ),
        className: "px-4 py-3 text-center whitespace-nowrap",
        headerClassName: "px-4 text-center",
      },
    ],
    []
  );

  const materialFilters = React.useMemo<FilterDef<LmsMaterial>[]>(
    () => [
      {
        key: "subject",
        label: "Subject",
        allLabel: "All Subjects",
        options: Array.from(
          new Set([
            ...PAKISTANI_SCHOOL_SUBJECTS,
            ...materials.map((m) => m.subject),
          ])
        ).sort((a, b) => a.localeCompare(b)),
        triggerClassName: "w-[170px] shrink-0",
        getValue: (r) => r.subject,
      },
      {
        key: "fileType",
        label: "Format",
        allLabel: "All Formats",
        options: ["PDF", "DOCX", "SLIDES", "VIDEO", "LINK"],
        triggerClassName: "w-[120px] shrink-0",
        getValue: (r) => r.fileType,
      },
      {
        key: "class",
        label: "Class",
        allLabel: "All Classes",
        options: sortPakistaniClasses(
          Array.from(
            new Set([
              ...PAKISTANI_SCHOOL_CLASSES,
              ...materials.map((m) => m.className),
            ])
          )
        ),
        triggerClassName: "w-[185px] shrink-0",
        getValue: (r) => r.className,
      },
    ],
    [materials]
  );

  // Courses Columns (Professional Enterprise Layout)
  const courseColumns: Column<LmsCourse>[] = React.useMemo(
    () => [
      {
        key: "title",
        header: "Course",
        align: "left",
        cell: (r) => {
          const courseName =
            r.subject === "Science"
              ? "General Science"
              : r.subject === "Education (Ilm-ut-Taleem)"
              ? "Education"
              : r.subject || r.title;
          return (
            <div className="flex flex-col min-w-0 py-0.5 leading-tight">
              <button
                type="button"
                onClick={() => setViewingSyllabusCourse(r)}
                className="font-semibold text-foreground text-xs leading-snug truncate hover:text-brand transition-colors cursor-pointer text-left"
                title={courseName}
              >
                {courseName}
              </button>
              <span className="text-[11px] text-muted-foreground truncate mt-0.5 text-left" title={r.campus}>
                {r.campus}
              </span>
            </div>
          );
        },
        className: "pl-6 pr-3 py-3 text-left min-w-[200px] max-w-[280px]",
        headerClassName: "pl-6 pr-3 text-left",
      },
      {
        key: "class",
        header: "Class & Instructor",
        align: "center",
        cell: (r) => (
          <div className="flex flex-col items-center justify-center min-w-0 leading-tight text-center">
            <span
              className="text-xs font-semibold text-foreground truncate max-w-full text-center"
              title={r.className}
            >
              {formatCompactClass(r.className)}
            </span>
            <span className="text-[11px] text-muted-foreground truncate max-w-full mt-0.5 text-center">
              {r.teacher}
            </span>
          </div>
        ),
        className: "px-3 py-3 text-center min-w-[150px]",
        headerClassName: "px-3 text-center",
      },
      {
        key: "enrollment",
        header: "Students & Tasks",
        align: "center",
        cell: (r) => (
          <div className="flex flex-col items-center justify-center text-center min-w-0 leading-tight whitespace-nowrap">
            <span className="text-xs font-medium text-foreground tabular-nums text-center">
              {r.enrolledStudents} Students
            </span>
            <span className="text-[11px] text-muted-foreground tabular-nums mt-0.5 text-center">
              {r.activeAssignments} Active {r.activeAssignments === 1 ? "Task" : "Tasks"}
            </span>
          </div>
        ),
        className: "px-3 py-3 whitespace-nowrap text-center",
        headerClassName: "px-3 text-center",
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        cell: (r) => (
          <div className="flex items-center justify-center">
            <StatusBadge status={r.status} dot={false} />
          </div>
        ),
        className: "px-3 py-3 whitespace-nowrap text-center",
        headerClassName: "px-3 text-center",
      },
      {
        key: "actions",
        header: "Action",
        align: "center",
        cell: (r) => (
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setViewingSyllabusCourse(r)}
              className="h-7 px-3 text-xs font-semibold cursor-pointer border-border/80 hover:bg-muted gap-1.5 text-foreground"
              title="View course curriculum & progress"
            >
              <Eye className="size-3.5 text-brand" />
              <span>View</span>
            </Button>
          </div>
        ),
        className: "px-4 py-3 text-center whitespace-nowrap",
        headerClassName: "px-4 text-center",
      },
    ],
    []
  );

  const courseFilters = React.useMemo<FilterDef<LmsCourse>[]>(
    () => [
      {
        key: "subject",
        label: "Subject",
        allLabel: "All Subjects",
        options: courseSubjects,
        triggerClassName: "w-[170px] shrink-0",
        getValue: (r) => r.subject,
      },
      {
        key: "class",
        label: "Class",
        allLabel: "All Classes",
        options: sortPakistaniClasses(
          Array.from(
            new Set([
              ...PAKISTANI_SCHOOL_CLASSES,
              ...courses.map((c) => c.className),
            ])
          )
        ),
        triggerClassName: "w-[185px] shrink-0",
        getValue: (r) => r.className,
      },
      {
        key: "status",
        label: "Status",
        allLabel: "All Statuses",
        options: ["Active", "Completed", "Archived"],
        triggerClassName: "w-[130px] shrink-0",
        getValue: (r) => r.status,
      },
    ],
    [courses, courseSubjects]
  );

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Top Header */}
      <PageHeader
        title="Learning Management System (LMS)"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCourseDialogOpen(true)}
              className="h-9 text-xs font-semibold cursor-pointer"
            >
              <Plus className="size-3.5 mr-1.5" />
              Add Course
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMaterialDialogOpen(true)}
              className="h-9 text-xs font-semibold cursor-pointer"
            >
              <Upload className="size-3.5 mr-1.5" />
              Upload Material
            </Button>
            <Button
              size="sm"
              onClick={handleOpenNewAssignmentGlobal}
              className="h-9 text-xs font-semibold bg-primary hover:bg-primary/90 text-white cursor-pointer shadow-sm"
            >
              <FileText className="size-3.5 mr-1.5 text-white" />
              New Assignment
            </Button>
          </div>
        }
      />

      {/* KPI Stats Row */}
      <StatGrid className="max-w-none">
        <StatCard
          label="Active Courses"
          value={formatNumber(activeCoursesCount)}
          icon={BookOpen}
        />
        <StatCard
          label="Active Assignments"
          value={formatNumber(activeAssignmentsCount)}
          icon={FileText}
        />
        <StatCard
          label="Average Submission Rate"
          value={formatPercent(avgSubmissionRate, 1)}
          icon={CheckCircle2}
        />
        <StatCard
          label="Learning Resources"
          value={formatNumber(materials.length)}
          icon={FolderArchive}
        />
      </StatGrid>

      {/* LMS Controlled Tabs with Single Dropdown Selector */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as any)}
        className="space-y-4"
      >
        {/* Module Dropdown Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="group inline-flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-background hover:bg-muted/50 px-3 h-9 text-xs font-semibold shadow-2xs transition-all hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 cursor-pointer min-w-[200px] sm:min-w-[230px]">
                <div className="flex items-center gap-2 min-w-0">
                  <activeSectionObj.icon className="size-4 text-brand shrink-0" />
                  <span className="text-xs font-semibold text-foreground truncate">
                    {activeSectionObj.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-bold px-1.5 py-0 h-4.5 min-w-4 flex items-center justify-center tabular-nums"
                  >
                    {activeSectionObj.count}
                  </Badge>
                  <ChevronDown className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="w-52 p-1 rounded-xl shadow-lg border-border/80"
              >
                {sections.map((sec) => {
                  const Icon = sec.icon;
                  const isSelected = activeTab === sec.id;
                  return (
                    <DropdownMenuItem
                      key={sec.id}
                      onClick={() => setActiveTab(sec.id)}
                      className={cn(
                        "flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs transition-colors",
                        isSelected
                          ? "bg-brand-soft text-brand font-semibold"
                          : "hover:bg-muted/70 text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon
                          className={cn(
                            "size-3.5 shrink-0",
                            isSelected ? "text-brand" : "text-muted-foreground"
                          )}
                        />
                        <span className="truncate">{sec.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <Badge
                          variant={isSelected ? "default" : "secondary"}
                          className={cn(
                            "text-[10px] font-semibold px-1.5 py-0 h-4 tabular-nums",
                            isSelected ? "bg-brand text-cream" : ""
                          )}
                        >
                          {sec.count}
                        </Badge>
                        {isSelected && <Check className="size-3 text-brand" />}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Context Action for Currently Selected Portion */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {activeTab === "courses" && (
              <Button
                size="sm"
                onClick={() => setIsCourseDialogOpen(true)}
                className="h-8 text-xs font-semibold bg-brand text-cream hover:bg-brand-600 gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Add Course</span>
              </Button>
            )}
            {activeTab === "assignments" && (
              <Button
                size="sm"
                onClick={handleOpenNewAssignmentGlobal}
                className="h-8 text-xs font-semibold bg-brand text-cream hover:bg-brand-600 gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>New Assignment</span>
              </Button>
            )}
            {activeTab === "materials" && (
              <Button
                size="sm"
                onClick={() => setIsMaterialDialogOpen(true)}
                className="h-8 text-xs font-semibold bg-brand text-cream hover:bg-brand-600 gap-1.5 shadow-2xs cursor-pointer"
              >
                <Upload className="size-3.5" />
                <span>Upload Material</span>
              </Button>
            )}
          </div>
        </div>

        {/* TAB 1: Courses & Syllabus */}
        <TabsContent value="courses" className="space-y-4 outline-none">
          <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
            {/* Professional Section Header */}
            <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border/70 bg-muted/20">
              <div className="flex size-7 items-center justify-center rounded-lg bg-brand-soft text-brand shrink-0">
                <BookOpen className="size-3.5" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">
                Courses & Syllabus
              </h2>
            </div>

            <DataTable
              data={courses}
              columns={courseColumns}
              getRowId={(r) => r.id}
              filters={courseFilters}
              searchPlaceholder="Search courses…"
              searchFn={(r, q) =>
                r.title.toLowerCase().includes(q.toLowerCase()) ||
                r.courseCode.toLowerCase().includes(q.toLowerCase()) ||
                r.subject.toLowerCase().includes(q.toLowerCase()) ||
                r.teacher.toLowerCase().includes(q.toLowerCase()) ||
                r.className.toLowerCase().includes(q.toLowerCase())
              }
              pageSize={8}
              tableClassName="w-full text-sm"
              emptyMessage="No courses found."
            />
          </div>
        </TabsContent>

        {/* TAB 2: Assignments & Homework */}
        <TabsContent value="assignments" className="space-y-4 outline-none">
          <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
            {/* Professional Section Header */}
            <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border/70 bg-muted/20">
              <div className="flex size-7 items-center justify-center rounded-lg bg-brand-soft text-brand shrink-0">
                <FileText className="size-3.5" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">
                Homework & Assignments
              </h2>
            </div>

            <DataTable
              data={assignments}
              columns={assignmentColumns}
              getRowId={(r) => r.id}
              filters={assignmentFilters}
              searchPlaceholder="Search assignments…"
              searchFn={(r, q) =>
                r.title.toLowerCase().includes(q.toLowerCase()) ||
                r.courseName.toLowerCase().includes(q.toLowerCase()) ||
                r.teacher.toLowerCase().includes(q.toLowerCase()) ||
                r.className.toLowerCase().includes(q.toLowerCase())
              }
              pageSize={8}
              tableClassName="w-full text-sm"
              emptyMessage="No assignments found."
            />
          </div>
        </TabsContent>

        {/* TAB 3: Study Materials & Notes */}
        <TabsContent value="materials" className="space-y-4 outline-none">
          <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
            {/* Professional Section Header */}
            <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border/70 bg-muted/20">
              <div className="flex size-7 items-center justify-center rounded-lg bg-brand-soft text-brand shrink-0">
                <FolderArchive className="size-3.5" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">
                Study Materials & Notes
              </h2>
            </div>

            <DataTable
              data={materials}
              columns={materialColumns}
              getRowId={(r) => r.id}
              filters={materialFilters}
              searchPlaceholder="Search materials…"
              searchFn={(r, q) =>
                r.title.toLowerCase().includes(q.toLowerCase()) ||
                r.subject.toLowerCase().includes(q.toLowerCase()) ||
                r.uploadedBy.toLowerCase().includes(q.toLowerCase()) ||
                r.className.toLowerCase().includes(q.toLowerCase())
              }
              pageSize={8}
              tableClassName="w-full text-sm"
              emptyMessage="No learning materials found."
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateAssignmentDialog
        open={isAssignmentDialogOpen}
        onOpenChange={setIsAssignmentDialogOpen}
        onAddAssignment={handleAddAssignment}
        courses={courses}
        defaultCourseId={selectedCourseForAssignment}
      />

      <UploadMaterialDialog
        open={isMaterialDialogOpen}
        onOpenChange={setIsMaterialDialogOpen}
        onUploadMaterial={handleUploadMaterial}
      />

      <CreateCourseDialog
        open={isCourseDialogOpen}
        onOpenChange={setIsCourseDialogOpen}
        onAddCourse={handleAddCourse}
      />

      <ViewSyllabusDialog
        course={viewingSyllabusCourse}
        open={!!viewingSyllabusCourse}
        onOpenChange={(open) => {
          if (!open) setViewingSyllabusCourse(null);
        }}
        onAddAssignment={() => {
          if (viewingSyllabusCourse) {
            setSelectedCourseForAssignment(viewingSyllabusCourse.id);
            setIsAssignmentDialogOpen(true);
          }
        }}
      />

      <ViewAssignmentDialog
        assignment={viewingAssignment}
        open={Boolean(viewingAssignment)}
        onOpenChange={(open) => {
          if (!open) setViewingAssignment(null);
        }}
        onToggleGraded={handleMarkAssignmentGraded}
      />

      <ViewMaterialDialog
        material={viewingMaterial}
        open={Boolean(viewingMaterial)}
        onOpenChange={(open) => {
          if (!open) setViewingMaterial(null);
        }}
        onDownload={handleDownloadResource}
      />
    </div>
  );
}
