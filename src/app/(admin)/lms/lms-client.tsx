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
  Video,
  FolderArchive,
  Plus,
  Upload,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Download,
  FileCheck,
  Clock,
  MoreVertical,
  Copy,
  ChevronDown,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatNumber, formatPercent } from "@/lib/format";
import type { LmsAssignment, LmsCourse, LmsLiveClass, LmsMaterial } from "@/types";
import { PAKISTANI_SCHOOL_CLASSES, PAKISTANI_SCHOOL_SUBJECTS, sortPakistaniClasses } from "@/lib/mock/lms";
import { CreateAssignmentDialog } from "./create-assignment-dialog";
import { UploadMaterialDialog } from "./upload-material-dialog";
import { ScheduleClassDialog } from "./schedule-class-dialog";
import { CreateCourseDialog } from "./create-course-dialog";
import { ViewSyllabusDialog } from "./view-syllabus-dialog";

interface LmsClientProps {
  initialCourses: LmsCourse[];
  initialAssignments: LmsAssignment[];
  initialMaterials: LmsMaterial[];
  initialLiveClasses: LmsLiveClass[];
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
  const [liveClasses, setLiveClasses] = React.useState<LmsLiveClass[]>(initialLiveClasses);

  // Dialog states
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = React.useState(false);
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = React.useState(false);
  const [isLiveClassDialogOpen, setIsLiveClassDialogOpen] = React.useState(false);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = React.useState(false);

  // Pre-selected course context
  const [selectedCourseForAssignment, setSelectedCourseForAssignment] = React.useState<string | undefined>(undefined);
  const [viewingSyllabusCourse, setViewingSyllabusCourse] = React.useState<LmsCourse | null>(null);

  // Active LMS portion dropdown selector
  const [activeTab, setActiveTab] = React.useState<"courses" | "assignments" | "materials" | "virtual">("courses");

  // Key KPI metrics calculations
  const activeCoursesCount = courses.filter((c) => c.status === "Active").length;
  const activeAssignmentsCount = assignments.filter((a) => a.status === "Active").length;

  const totalSubmissionsSum = assignments.reduce((acc, a) => acc + a.totalSubmissions, 0);
  const totalStudentsSum = assignments.reduce((acc, a) => acc + a.totalStudents, 0);
  const avgSubmissionRate =
    totalStudentsSum > 0 ? (totalSubmissionsSum / totalStudentsSum) * 100 : 0;

  const totalDownloadsSum = materials.reduce((acc, m) => acc + m.downloadCount, 0);

  // LMS portions metadata for dropdown selector
  const sections = React.useMemo(
    () => [
      {
        id: "courses" as const,
        label: "Courses & Syllabus",
        subtitle: `${courses.length} courses`,
        description: "Curriculum plans, subjects & lesson progress",
        icon: BookOpen,
        count: courses.length,
      },
      {
        id: "assignments" as const,
        label: "Homework & Assignments",
        subtitle: `${activeAssignmentsCount} active tasks`,
        description: "Homework submission tracking & evaluations",
        icon: FileText,
        count: assignments.length,
      },
      {
        id: "materials" as const,
        label: "Study Materials & Notes",
        subtitle: `${materials.length} resources`,
        description: "Textbooks, slides, worksheets & PDFs",
        icon: FolderArchive,
        count: materials.length,
      },
      {
        id: "virtual" as const,
        label: "Live Virtual Classes",
        subtitle: `${liveClasses.filter((c) => c.status === "Live Now").length} live now`,
        description: "Digital classrooms, webinars & meetings",
        icon: Video,
        count: liveClasses.length,
      },
    ],
    [courses.length, assignments.length, materials.length, liveClasses, activeAssignmentsCount]
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

  const handleScheduleClass = (newClass: LmsLiveClass) => {
    setLiveClasses((prev) => [newClass, ...prev]);
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

  const handleCopyCourseCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    toast.success(`Copied course code "${code}" to clipboard`);
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

  const handleJoinClass = (liveClass: LmsLiveClass) => {
    toast.info("Connecting to Virtual Class", {
      description: `Opening ${liveClass.platform} for "${liveClass.title}"...`,
    });
    if (liveClass.joinUrl) {
      window.open(liveClass.joinUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Assignment Columns (Responsive 5-Column Zero-Horizontal Scroll Layout)
  const assignmentColumns: Column<LmsAssignment>[] = React.useMemo(
    () => [
      {
        key: "title",
        header: "Assignment & Course",
        cell: (r) => (
          <div className="flex flex-col min-w-0 py-0.5">
            <span className="font-semibold text-foreground text-xs leading-snug truncate" title={r.title}>
              {r.title}
            </span>
            <span className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5" title={r.courseName}>
              <BookOpen className="size-3 shrink-0 text-brand" />
              <span className="truncate">{r.courseName}</span>
            </span>
          </div>
        ),
        sortValue: (r) => r.title,
        className: "px-3 py-2.5 min-w-0 max-w-[240px]",
        headerClassName: "px-3",
      },
      {
        key: "class",
        header: "Class & Instructor",
        cell: (r) => (
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-xs font-medium text-foreground truncate">
              {r.className}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              {r.teacher}
            </span>
          </div>
        ),
        sortValue: (r) => r.className,
        className: "px-2.5 py-2.5 min-w-0 max-w-[150px]",
        headerClassName: "px-2.5",
      },
      {
        key: "dueDate",
        header: "Due & Marks",
        cell: (r) => {
          const isPast = new Date(r.dueDate) < new Date("2026-10-20");
          return (
            <div className="flex flex-col min-w-0 leading-tight">
              <div className="flex items-center gap-1 text-xs whitespace-nowrap">
                <Calendar className="size-3 text-muted-foreground shrink-0" />
                <span className={cn(isPast ? "text-danger font-medium" : "text-foreground")}>
                  {r.dueDate}
                </span>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground tabular-nums mt-0.5">
                {r.maxMarks} marks
              </span>
            </div>
          );
        },
        sortValue: (r) => r.dueDate,
        className: "px-2.5 py-2.5 whitespace-nowrap",
        headerClassName: "px-2.5",
      },
      {
        key: "submissions",
        header: "Submissions",
        cell: (r) => {
          const pct = Math.round((r.totalSubmissions / r.totalStudents) * 100);
          return (
            <div className="flex flex-col gap-1 w-24 sm:w-28 min-w-0">
              <div className="flex items-center justify-between text-[11px] leading-none">
                <span className="font-semibold text-foreground tabular-nums">
                  {r.totalSubmissions}/{r.totalStudents}
                </span>
                <span className="text-muted-foreground tabular-nums">{pct}%</span>
              </div>
              <Meter value={pct} size="xs" />
            </div>
          );
        },
        sortValue: (r) => r.totalSubmissions / r.totalStudents,
        className: "px-2.5 py-2.5",
        headerClassName: "px-2.5",
      },
      {
        key: "actions",
        header: "Status / Action",
        cell: (r) => (
          <div className="flex items-center justify-end gap-2 whitespace-nowrap">
            <StatusBadge status={r.status} dot={false} />
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleMarkAssignmentGraded(r.id)}
              className="h-7 px-2 text-xs font-semibold cursor-pointer border-border/80 hover:bg-muted"
              title={r.status === "Graded" ? "Reopen assignment" : "Mark submissions as graded"}
            >
              <FileCheck className="size-3 mr-1 text-muted-foreground" />
              {r.status === "Graded" ? "Reopen" : "Grade"}
            </Button>
          </div>
        ),
        className: "px-3 py-2.5 text-right whitespace-nowrap",
        headerClassName: "px-3 text-right",
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

  // Materials Columns (Responsive 5-Column Zero-Horizontal Scroll Layout)
  const materialColumns: Column<LmsMaterial>[] = React.useMemo(
    () => [
      {
        key: "title",
        header: "Document & Resource",
        cell: (r) => (
          <div className="flex items-center gap-2.5 min-w-0 py-0.5">
            <div className="size-8 rounded-lg bg-brand-50 text-brand flex items-center justify-center shrink-0">
              <FileText className="size-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-foreground text-xs leading-snug truncate" title={r.title}>
                {r.title}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                By {r.uploadedBy} • {r.uploadDate}
              </span>
            </div>
          </div>
        ),
        sortValue: (r) => r.title,
        className: "px-3 py-2.5 min-w-0 max-w-[260px]",
        headerClassName: "px-3",
      },
      {
        key: "subject",
        header: "Subject & Grade",
        cell: (r) => (
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-xs font-medium text-foreground truncate">
              {r.subject}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              {r.className}
            </span>
          </div>
        ),
        sortValue: (r) => r.subject,
        className: "px-2.5 py-2.5 min-w-0 max-w-[140px]",
        headerClassName: "px-2.5",
      },
      {
        key: "fileType",
        header: "Format & Size",
        cell: (r) => (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Badge variant="secondary" className="text-[10px] font-semibold uppercase px-1.5 py-0">
              {r.fileType}
            </Badge>
            <span className="text-xs text-muted-foreground tabular-nums">
              {r.fileSize || "Link"}
            </span>
          </div>
        ),
        sortValue: (r) => r.fileType,
        className: "px-2.5 py-2.5 whitespace-nowrap",
        headerClassName: "px-2.5",
      },
      {
        key: "downloads",
        header: "Downloads",
        cell: (r) => (
          <div className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
            <Download className="size-3 text-muted-foreground/70" />
            <span>{formatNumber(r.downloadCount)}</span>
          </div>
        ),
        sortValue: (r) => r.downloadCount,
        className: "px-2.5 py-2.5 whitespace-nowrap",
        headerClassName: "px-2.5",
      },
      {
        key: "actions",
        header: "Action",
        cell: (r) => (
          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleDownloadResource(r)}
              className="h-7 px-2.5 text-xs font-semibold cursor-pointer border-border/80 hover:bg-muted"
            >
              <Download className="size-3 mr-1 text-muted-foreground" />
              Download
            </Button>
          </div>
        ),
        className: "px-3 py-2.5 text-right whitespace-nowrap",
        headerClassName: "px-3 text-right",
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

  // Courses Columns (Responsive 5-Column Zero-Horizontal Scroll Layout)
  const courseColumns: Column<LmsCourse>[] = React.useMemo(
    () => [
      {
        key: "title",
        header: "Course & Code",
        cell: (r) => (
          <div className="flex items-center gap-2.5 min-w-0 py-0.5">
            <div className="size-8 rounded-lg bg-brand-50 text-brand dark:bg-brand-soft flex items-center justify-center shrink-0">
              <BookOpen className="size-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setViewingSyllabusCourse(r)}
                  className="font-semibold text-foreground text-xs leading-snug truncate hover:text-brand transition-colors cursor-pointer text-left"
                  title={r.title}
                >
                  {r.title}
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground min-w-0">
                <span className="inline-flex items-center px-1.5 py-0 rounded text-[10px] font-bold tracking-wider uppercase bg-brand-50 text-brand dark:bg-brand-soft ring-1 ring-inset ring-brand/15 shrink-0">
                  {r.courseCode}
                </span>
                <span className="truncate">{r.subject}</span>
                <span>•</span>
                <span className="truncate">{r.campus}</span>
              </div>
            </div>
          </div>
        ),
        sortValue: (r) => r.title,
        className: "px-3 py-2.5 min-w-0 max-w-[260px]",
        headerClassName: "px-3",
      },
      {
        key: "class",
        header: "Class & Instructor",
        cell: (r) => (
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-xs font-medium text-foreground truncate">
              {r.className}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              {r.teacher}
            </span>
          </div>
        ),
        sortValue: (r) => r.className,
        className: "px-2.5 py-2.5 min-w-0 max-w-[160px]",
        headerClassName: "px-2.5",
      },
      {
        key: "enrollment",
        header: "Enrollment & Tasks",
        cell: (r) => (
          <div className="flex flex-col min-w-0 leading-tight whitespace-nowrap">
            <span className="text-xs font-medium text-foreground tabular-nums">
              {r.enrolledStudents} Students
            </span>
            <span className="text-[11px] text-muted-foreground tabular-nums mt-0.5">
              {r.activeAssignments} Active Tasks
            </span>
          </div>
        ),
        sortValue: (r) => r.enrolledStudents,
        className: "px-2.5 py-2.5 whitespace-nowrap",
        headerClassName: "px-2.5",
      },
      {
        key: "progress",
        header: "Curriculum Progress",
        cell: (r) => {
          const pct = Math.round((r.completedLessons / r.totalLessons) * 100);
          return (
            <div className="flex flex-col gap-1 w-28 sm:w-32 min-w-0">
              <div className="flex items-center justify-between text-[11px] leading-none">
                <span className="font-semibold text-foreground tabular-nums">
                  {r.completedLessons}/{r.totalLessons} Lessons
                </span>
                <span className="text-muted-foreground tabular-nums">{pct}%</span>
              </div>
              <Meter value={pct} tone={r.colorTone ?? "brand"} size="xs" />
            </div>
          );
        },
        sortValue: (r) => r.completedLessons / r.totalLessons,
        className: "px-2.5 py-2.5",
        headerClassName: "px-2.5",
      },
      {
        key: "actions",
        header: "Status / Action",
        cell: (r) => (
          <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
            <StatusBadge status={r.status} dot={false} />
            <Button
              variant="outline"
              size="xs"
              onClick={() => setViewingSyllabusCourse(r)}
              className="h-7 px-2 text-xs font-semibold cursor-pointer border-border/80 hover:bg-muted"
              title="View course syllabus & curriculum"
            >
              <BookOpen className="size-3 mr-1 text-muted-foreground" />
              Syllabus
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
                title="Course options"
              >
                <MoreVertical className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() => setViewingSyllabusCourse(r)}
                  className="text-xs cursor-pointer"
                >
                  <BookOpen className="size-3.5 mr-2 text-muted-foreground" />
                  View Curriculum
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleOpenAssignmentForCourse(r)}
                  className="text-xs cursor-pointer"
                >
                  <Plus className="size-3.5 mr-2 text-muted-foreground" />
                  New Assignment
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsMaterialDialogOpen(true)}
                  className="text-xs cursor-pointer"
                >
                  <Upload className="size-3.5 mr-2 text-muted-foreground" />
                  Upload Material
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleCopyCourseCode(r.courseCode)}
                  className="text-xs cursor-pointer"
                >
                  <Copy className="size-3.5 mr-2 text-muted-foreground" />
                  Copy Code ({r.courseCode})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        className: "px-3 py-2.5 text-right whitespace-nowrap",
        headerClassName: "px-3 text-right",
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

  // Live Virtual Classes Columns (Responsive 5-Column Zero-Horizontal Scroll Layout)
  const liveClassColumns: Column<LmsLiveClass>[] = React.useMemo(
    () => [
      {
        key: "title",
        header: "Session & Subject",
        cell: (r) => (
          <div className="flex items-center gap-2.5 min-w-0 py-0.5">
            <div className="size-8 rounded-lg bg-brand-50 text-brand dark:bg-brand-soft flex items-center justify-center shrink-0">
              <Video className="size-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-foreground text-xs leading-snug truncate" title={r.title}>
                {r.title}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                {r.subject}
              </span>
            </div>
          </div>
        ),
        sortValue: (r) => r.title,
        className: "px-3 py-2.5 min-w-0 max-w-[260px]",
        headerClassName: "px-3",
      },
      {
        key: "class",
        header: "Class & Instructor",
        cell: (r) => (
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-xs font-medium text-foreground truncate">
              {r.className}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              {r.teacher}
            </span>
          </div>
        ),
        sortValue: (r) => r.className,
        className: "px-2.5 py-2.5 min-w-0 max-w-[160px]",
        headerClassName: "px-2.5",
      },
      {
        key: "schedule",
        header: "Date & Timing",
        cell: (r) => (
          <div className="flex flex-col min-w-0 leading-tight whitespace-nowrap">
            <div className="flex items-center gap-1 text-xs text-foreground">
              <Calendar className="size-3 text-muted-foreground shrink-0" />
              <span>{r.date}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground mt-0.5">
              <Clock className="size-3 text-muted-foreground/70 shrink-0" />
              <span>{r.startTime} – {r.endTime}</span>
            </div>
          </div>
        ),
        sortValue: (r) => `${r.date} ${r.startTime}`,
        className: "px-2.5 py-2.5 whitespace-nowrap",
        headerClassName: "px-2.5",
      },
      {
        key: "platform",
        header: "Platform",
        cell: (r) => (
          <Badge variant="outline" className="text-[11px] font-semibold gap-1.5 px-2 py-0.5 whitespace-nowrap">
            <Video className="size-3 text-brand" />
            {r.platform}
          </Badge>
        ),
        sortValue: (r) => r.platform,
        className: "px-2.5 py-2.5 whitespace-nowrap",
        headerClassName: "px-2.5",
      },
      {
        key: "actions",
        header: "Status / Action",
        cell: (r) => {
          const isLive = r.status === "Live Now";
          return (
            <div className="flex items-center justify-end gap-2 whitespace-nowrap">
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-success-soft text-success ring-1 ring-inset ring-success/25">
                  <span className="size-1.5 rounded-full bg-success animate-ping" />
                  Live Now
                </span>
              ) : (
                <StatusBadge status={r.status} dot={false} />
              )}
              <Button
                variant={isLive ? "default" : "outline"}
                size="xs"
                onClick={() => handleJoinClass(r)}
                disabled={r.status === "Completed"}
                className={cn(
                  "h-7 px-2.5 text-xs font-semibold cursor-pointer",
                  isLive
                    ? "bg-success hover:bg-success/90 text-white border-transparent"
                    : "border-border/80 hover:bg-muted"
                )}
              >
                <ExternalLink className={cn("size-3 mr-1 shrink-0", isLive ? "text-white" : "text-muted-foreground")} />
                {isLive ? "Join Live" : r.status === "Completed" ? "Ended" : "Launch"}
              </Button>
            </div>
          );
        },
        className: "px-3 py-2.5 text-right whitespace-nowrap",
        headerClassName: "px-3 text-right",
      },
    ],
    []
  );

  const liveClassFilters = React.useMemo<FilterDef<LmsLiveClass>[]>(
    () => [
      {
        key: "status",
        label: "Status",
        allLabel: "All Statuses",
        options: ["Live Now", "Upcoming", "Completed"],
        triggerClassName: "w-[130px] shrink-0",
        getValue: (r) => r.status,
      },
      {
        key: "platform",
        label: "Platform",
        allLabel: "All Platforms",
        options: Array.from(new Set(["Zoom", "Google Meet", "MS Teams", ...liveClasses.map((c) => c.platform)])),
        triggerClassName: "w-[140px] shrink-0",
        getValue: (r) => r.platform,
      },
      {
        key: "class",
        label: "Class",
        allLabel: "All Classes",
        options: sortPakistaniClasses(
          Array.from(
            new Set([
              ...PAKISTANI_SCHOOL_CLASSES,
              ...liveClasses.map((c) => c.className),
            ])
          )
        ),
        triggerClassName: "w-[185px] shrink-0",
        getValue: (r) => r.className,
      },
    ],
    [liveClasses]
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
              variant="outline"
              size="sm"
              onClick={() => setIsLiveClassDialogOpen(true)}
              className="h-9 text-xs font-semibold cursor-pointer"
            >
              <Video className="size-3.5 mr-1.5" />
              Schedule Class
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
              <DropdownMenuTrigger className="group inline-flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-background hover:bg-muted/50 px-3.5 py-2 text-xs font-semibold shadow-2xs transition-all hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 cursor-pointer min-w-[260px] sm:min-w-[300px]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-brand-soft text-brand shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                    <activeSectionObj.icon className="size-4" />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-xs font-bold text-foreground leading-tight truncate">
                      {activeSectionObj.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-normal leading-tight">
                      {activeSectionObj.subtitle}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-bold px-1.5 py-0 tabular-nums"
                  >
                    {activeSectionObj.count}
                  </Badge>
                  <ChevronDown className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="w-[310px] p-1.5 rounded-2xl shadow-xl border-border/80"
              >
                {sections.map((sec) => {
                  const Icon = sec.icon;
                  const isSelected = activeTab === sec.id;
                  return (
                    <DropdownMenuItem
                      key={sec.id}
                      onClick={() => setActiveTab(sec.id)}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-colors my-0.5",
                        isSelected
                          ? "bg-brand-soft text-brand font-semibold"
                          : "hover:bg-muted/70 text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            "flex size-8 items-center justify-center rounded-lg shrink-0",
                            isSelected
                              ? "bg-brand text-cream shadow-xs"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-xs leading-tight truncate">
                            {sec.label}
                          </span>
                          <span className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                            {sec.description}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <Badge
                          variant={isSelected ? "default" : "outline"}
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0 tabular-nums",
                            isSelected ? "bg-brand text-cream" : ""
                          )}
                        >
                          {sec.count}
                        </Badge>
                        {isSelected && <Check className="size-3.5 text-brand" />}
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
            {activeTab === "virtual" && (
              <Button
                size="sm"
                onClick={() => setIsLiveClassDialogOpen(true)}
                className="h-8 text-xs font-semibold bg-brand text-cream hover:bg-brand-600 gap-1.5 shadow-2xs cursor-pointer"
              >
                <Video className="size-3.5" />
                <span>Schedule Class</span>
              </Button>
            )}
          </div>
        </div>

        {/* TAB 1: Courses & Syllabus */}
        <TabsContent value="courses" className="space-y-4 outline-none">
          <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
            {/* Professional Section Header */}
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/70 bg-muted/20">
              <div className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand shrink-0">
                <BookOpen className="size-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Courses & Curriculum Syllabus</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {courses.length} total courses • {activeCoursesCount} active across academic grades
                </p>
              </div>
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
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/70 bg-muted/20">
              <div className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand shrink-0">
                <FileText className="size-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Homework & Assignments</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {assignments.length} total tasks • {activeAssignmentsCount} active • {assignments.filter((a) => a.status === "Graded").length} evaluated
                </p>
              </div>
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
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/70 bg-muted/20">
              <div className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand shrink-0">
                <FolderArchive className="size-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Study Materials & Notes</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {materials.length} learning resources • {totalDownloadsSum} downloads across curricula
                </p>
              </div>
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

        {/* TAB 4: Live Virtual Classes */}
        <TabsContent value="virtual" className="space-y-4 outline-none">
          <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
            {/* Professional Section Header */}
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/70 bg-muted/20">
              <div className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand shrink-0">
                <Video className="size-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Live Virtual Classes & Webinars</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {liveClasses.length} scheduled sessions • {liveClasses.filter((c) => c.status === "Live Now").length} live now
                </p>
              </div>
            </div>

            <DataTable
              data={liveClasses}
              columns={liveClassColumns}
              getRowId={(r) => r.id}
              filters={liveClassFilters}
              searchPlaceholder="Search classes…"
              searchFn={(r, q) =>
                r.title.toLowerCase().includes(q.toLowerCase()) ||
                r.subject.toLowerCase().includes(q.toLowerCase()) ||
                r.teacher.toLowerCase().includes(q.toLowerCase()) ||
                r.className.toLowerCase().includes(q.toLowerCase()) ||
                r.platform.toLowerCase().includes(q.toLowerCase())
              }
              pageSize={8}
              tableClassName="w-full text-sm"
              emptyMessage="No live virtual classes found."
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

      <ScheduleClassDialog
        open={isLiveClassDialogOpen}
        onOpenChange={setIsLiveClassDialogOpen}
        onScheduleClass={handleScheduleClass}
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
    </div>
  );
}
