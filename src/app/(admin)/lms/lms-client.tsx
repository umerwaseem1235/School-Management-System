"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatGrid, StatCard } from "@/components/shared/stat-card";
import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Meter } from "@/components/shared/meter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BookOpen,
  FileText,
  Video,
  FolderArchive,
  Plus,
  Upload,
  Calendar,
  Users,
  CheckCircle2,
  ExternalLink,
  Download,
  FileCheck,
  Search,
  Layers,
  GraduationCap,
  MapPin,
  Clock,
  MoreVertical,
  Copy,
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

  // Course tab local search & filters
  const [courseSearch, setCourseSearch] = React.useState("");
  const [courseSubjectFilter, setCourseSubjectFilter] = React.useState("ALL");
  const [courseStatusFilter, setCourseStatusFilter] = React.useState("ALL");

  // Key KPI metrics calculations
  const activeCoursesCount = courses.filter((c) => c.status === "Active").length;
  const activeAssignmentsCount = assignments.filter((a) => a.status === "Active").length;

  const totalSubmissionsSum = assignments.reduce((acc, a) => acc + a.totalSubmissions, 0);
  const totalStudentsSum = assignments.reduce((acc, a) => acc + a.totalStudents, 0);
  const avgSubmissionRate =
    totalStudentsSum > 0 ? (totalSubmissionsSum / totalStudentsSum) * 100 : 0;

  const totalDownloadsSum = materials.reduce((acc, m) => acc + m.downloadCount, 0);

  // Filtered courses
  const filteredCourses = React.useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        courseSearch === "" ||
        c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
        c.courseCode.toLowerCase().includes(courseSearch.toLowerCase()) ||
        c.teacher.toLowerCase().includes(courseSearch.toLowerCase()) ||
        c.className.toLowerCase().includes(courseSearch.toLowerCase());

      const matchesSubject =
        courseSubjectFilter === "ALL" || c.subject === courseSubjectFilter;

      const matchesStatus =
        courseStatusFilter === "ALL" || c.status === courseStatusFilter;

      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [courses, courseSearch, courseSubjectFilter, courseStatusFilter]);

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
      <StatGrid>
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
          split={[
            { label: "Files", value: formatNumber(materials.length) },
            { label: "Downloads", value: formatNumber(totalDownloadsSum) },
          ]}
        />
      </StatGrid>

      {/* Main Tabs */}
      <Tabs defaultValue="courses" className="space-y-5">
        <TabsList className="bg-muted/60 p-1 rounded-xl">
          <TabsTrigger value="courses" className="rounded-lg text-xs font-medium px-4">
            <BookOpen className="size-3.5 mr-2" />
            Courses & Syllabus
          </TabsTrigger>
          <TabsTrigger value="assignments" className="rounded-lg text-xs font-medium px-4">
            <FileText className="size-3.5 mr-2" />
            Assignments ({assignments.length})
          </TabsTrigger>
          <TabsTrigger value="materials" className="rounded-lg text-xs font-medium px-4">
            <FolderArchive className="size-3.5 mr-2" />
            Study Materials ({materials.length})
          </TabsTrigger>
          <TabsTrigger value="virtual" className="rounded-lg text-xs font-medium px-4">
            <Video className="size-3.5 mr-2" />
            Live Virtual Classes ({liveClasses.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Courses & Syllabus */}
        <TabsContent value="courses" className="space-y-4 outline-none">
          {/* Professional Clean Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="pl-9 h-9 text-xs w-full"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={courseSubjectFilter}
                onValueChange={(val) => {
                  if (val) setCourseSubjectFilter(val);
                }}
              >
                <SelectTrigger className="h-9 text-xs w-[170px] shrink-0">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="ALL">All Subjects</SelectItem>
                  {courseSubjects.map((sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={courseStatusFilter}
                onValueChange={(val) => {
                  if (val) setCourseStatusFilter(val);
                }}
              >
                <SelectTrigger className="h-9 text-xs w-[130px] shrink-0">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCourseDialogOpen(true)}
                className="h-9 text-xs font-semibold cursor-pointer shrink-0"
              >
                <Plus className="size-3.5 mr-1" />
                Add Course
              </Button>
            </div>
          </div>

          {/* Clean 3-Column Responsive Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => {
              const progressPct = Math.round(
                (course.completedLessons / course.totalLessons) * 100
              );

              return (
                <div
                  key={course.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-brand/40 min-w-0 overflow-hidden"
                >
                  <div className="space-y-3 min-w-0">
                    {/* Header Row: Badges, Status & Context Menu */}
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 truncate">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase bg-brand-50 text-brand ring-1 ring-inset ring-brand/15 shrink-0">
                          {course.courseCode}
                        </span>
                        <Badge variant="outline" className="text-[11px] font-medium truncate max-w-[120px]">
                          {course.subject}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <StatusBadge status={course.status} dot={false} />
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
                            title="Course options"
                          >
                            <MoreVertical className="size-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => setViewingSyllabusCourse(course)}
                              className="text-xs cursor-pointer"
                            >
                              <BookOpen className="size-3.5 mr-2 text-muted-foreground" />
                              View Curriculum
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenAssignmentForCourse(course)}
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
                              onClick={() => handleCopyCourseCode(course.courseCode)}
                              className="text-xs cursor-pointer"
                            >
                              <Copy className="size-3.5 mr-2 text-muted-foreground" />
                              Copy Code ({course.courseCode})
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Course Title & Grade */}
                    <div className="min-w-0">
                      <h3
                        onClick={() => setViewingSyllabusCourse(course)}
                        className="font-heading font-semibold text-sm sm:text-base text-foreground leading-snug truncate group-hover:text-brand transition-colors cursor-pointer"
                        title={course.title}
                      >
                        {course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate flex items-center gap-1">
                        <GraduationCap className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="font-medium text-foreground">{course.className}</span>
                        <span>•</span>
                        <span className="truncate">{course.campus}</span>
                      </p>
                    </div>

                    {/* Teacher Line */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-2.5 py-1.5 rounded-lg truncate">
                      <Users className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="text-foreground font-medium truncate">{course.teacher}</span>
                    </div>

                    {/* Symmetrical 3-Box Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 py-1 text-center">
                      <div className="flex flex-col p-2 bg-muted/40 rounded-lg">
                        <span className="font-bold text-xs text-foreground tabular-nums">
                          {course.enrolledStudents}
                        </span>
                        <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                          Students
                        </span>
                      </div>
                      <div className="flex flex-col p-2 bg-muted/40 rounded-lg">
                        <span className="font-bold text-xs text-foreground tabular-nums">
                          {course.completedLessons}/{course.totalLessons}
                        </span>
                        <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                          Lessons
                        </span>
                      </div>
                      <div className="flex flex-col p-2 bg-muted/40 rounded-lg">
                        <span className="font-bold text-xs text-foreground tabular-nums">
                          {course.activeAssignments}
                        </span>
                        <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                          Tasks
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium text-[11px]">
                          Curriculum Progress
                        </span>
                        <span className="font-semibold text-foreground text-[11px] tabular-nums">
                          {progressPct}%
                        </span>
                      </div>
                      <Meter value={progressPct} tone={course.colorTone ?? "brand"} size="sm" />
                    </div>
                  </div>

                  {/* Symmetrical 2-Button Card Footer (50% / 50% width, never moves outside!) */}
                  <div className="pt-3 mt-3 border-t border-border/70 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingSyllabusCourse(course)}
                      className="flex-1 min-w-0 h-8 text-xs font-semibold cursor-pointer hover:bg-muted/70"
                    >
                      <BookOpen className="size-3.5 mr-1.5 text-muted-foreground shrink-0" />
                      <span className="truncate">Syllabus</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleOpenAssignmentForCourse(course)}
                      className="flex-1 min-w-0 h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-white cursor-pointer shadow-xs"
                    >
                      <Plus className="size-3.5 mr-1 shrink-0 text-white" />
                      <span className="truncate text-white">New Task</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCourses.length === 0 && (
            <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card">
              <BookOpen className="size-8 mx-auto text-muted-foreground/60 mb-2" />
              <p className="text-sm font-medium text-foreground">No courses match your filter.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search query or subject filter.
              </p>
            </div>
          )}
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
              searchPlaceholder="Search assignments..."
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
              searchPlaceholder="Search materials..."
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
          {/* Header toolbar for Live Classes */}
          <div className="flex items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <Video className="size-4 text-brand" />
              <span className="text-xs font-semibold text-foreground">
                Scheduled Digital Classrooms & Webinars
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => setIsLiveClassDialogOpen(true)}
              className="h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-white cursor-pointer"
            >
              <Plus className="size-3.5 mr-1.5 text-white" />
              Schedule Class
            </Button>
          </div>

          {/* Clean 3-Column Virtual Class Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {liveClasses.map((item) => {
              const isLive = item.status === "Live Now";

              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex flex-col justify-between rounded-2xl border p-4 bg-card transition-all duration-200 hover:shadow-md min-w-0 overflow-hidden",
                    isLive
                      ? "border-success/50 ring-1 ring-success/20 bg-success-soft/5"
                      : "border-border/80"
                  )}
                >
                  <div className="space-y-3 min-w-0">
                    {/* Header: Platform & Status */}
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <Badge variant="outline" className="text-xs font-semibold gap-1.5 px-2 py-0.5">
                        <Video className="size-3.5 text-brand" />
                        {item.platform}
                      </Badge>
                      {isLive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-soft text-success ring-1 ring-inset ring-success/25 animate-pulse">
                          <span className="size-2 rounded-full bg-success animate-ping" />
                          Live Now
                        </span>
                      ) : (
                        <StatusBadge status={item.status} dot={false} />
                      )}
                    </div>

                    {/* Topic & Subject */}
                    <div className="min-w-0">
                      <h4 className="font-heading font-semibold text-sm sm:text-base text-foreground leading-snug line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 font-medium truncate">
                        {item.className} • {item.subject}
                      </p>
                    </div>

                    {/* Symmetrical Info Box for Teacher & Timing */}
                    <div className="rounded-xl bg-muted/40 p-2.5 space-y-2 text-xs border border-border/50">
                      <div className="flex items-center gap-1.5 text-foreground font-medium truncate">
                        <Users className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{item.teacher}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground text-[11.5px] border-t border-border/50 pt-1.5">
                        <span className="flex items-center gap-1 truncate">
                          <Calendar className="size-3 shrink-0 text-muted-foreground" />
                          {item.date}
                        </span>
                        <span className="flex items-center gap-1 font-mono font-medium text-foreground shrink-0">
                          <Clock className="size-3 text-muted-foreground" />
                          {item.startTime} – {item.endTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Join Action - Full width button that NEVER overflows */}
                  <div className="pt-3 mt-3 border-t border-border/70">
                    <Button
                      onClick={() => handleJoinClass(item)}
                      disabled={item.status === "Completed"}
                      className={cn(
                        "w-full h-8 text-xs font-semibold cursor-pointer shadow-xs",
                        isLive
                          ? "bg-success hover:bg-success/90 text-white"
                          : "bg-primary hover:bg-primary/90 text-white"
                      )}
                    >
                      <ExternalLink className="size-3.5 mr-1.5 shrink-0 text-white" />
                      <span className="text-white">
                        {isLive
                          ? "Join Live Class"
                          : item.status === "Completed"
                          ? "Session Ended"
                          : "Launch Class Link"}
                      </span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {liveClasses.length === 0 && (
            <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card">
              <Video className="size-8 mx-auto text-muted-foreground/60 mb-2" />
              <p className="text-sm font-medium text-foreground">No live sessions scheduled.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click "Schedule Class" above to set up an online lecture.
              </p>
            </div>
          )}
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
