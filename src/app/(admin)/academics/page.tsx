"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CLASSES, SUBJECTS } from "@/lib/mock/academics";
import { PAKISTANI_SCHOOL_CLASSES, sortPakistaniClasses } from "@/lib/mock/lms";
import type { AcademicClass, Subject } from "@/types";
import {
  Plus,
  Users,
  School,
  BookOpen,
  Pencil,
  Trash2,
  Search,
  GraduationCap,
  Building2,
  ArrowRight,
  Layers,
  Eye,
} from "lucide-react";
import { ViewClassDialog } from "./view-class-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { AddClassDialog } from "./add-class-dialog";
import { EditClassDialog } from "./edit-class-dialog";
import { EditSubjectDialog } from "./edit-subject-dialog";
import { AddSubjectDialog } from "./add-subject-dialog";
import { toast } from "sonner";

export default function AcademicsPage() {
  const [classes, setClasses] = React.useState<AcademicClass[]>(CLASSES);
  const [subjects, setSubjects] = React.useState<Subject[]>(SUBJECTS);
  const [activeTab, setActiveTab] = React.useState<string>("classes");

  // Dialog states
  const [isAddClassOpen, setIsAddClassOpen] = React.useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = React.useState(false);
  const [editingClass, setEditingClass] = React.useState<AcademicClass | null>(null);
  const [viewingClass, setViewingClass] = React.useState<AcademicClass | null>(null);
  const [editingSubject, setEditingSubject] = React.useState<Subject | null>(null);

  // Class search & filter state
  const [classSearch, setClassSearch] = React.useState("");
  const [classCampusFilter, setClassCampusFilter] = React.useState("ALL");
  const [classStatusFilter, setClassStatusFilter] = React.useState("ALL");

  // Subject search & filter state
  const [subjectSearch, setSubjectSearch] = React.useState("");
  const [subjectClassFilter, setSubjectClassFilter] = React.useState("ALL");
  const [subjectTypeFilter, setSubjectTypeFilter] = React.useState("ALL");

  // Campuses for classes filter
  const classCampuses = React.useMemo(() => {
    return Array.from(new Set(classes.map((c) => c.campus).filter(Boolean)));
  }, [classes]);

  // Overall stats
  const totalStudents = React.useMemo(() => {
    return classes.reduce((sum, c) => sum + ((c as any).studentsCount || c.students || 0), 0);
  }, [classes]);

  const totalSections = React.useMemo(() => {
    return classes.reduce((sum, c) => sum + ((c as any).sectionsCount || c.sections || 0), 0);
  }, [classes]);

  // Filtered classes
  const filteredClasses = React.useMemo(() => {
    return classes.filter((cls) => {
      const q = classSearch.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        cls.className.toLowerCase().includes(q) ||
        (cls.campus && cls.campus.toLowerCase().includes(q)) ||
        (cls.classTeacher && cls.classTeacher.toLowerCase().includes(q)) ||
        String(cls.gradeLevel).includes(q);

      const matchesCampus =
        classCampusFilter === "ALL" || cls.campus === classCampusFilter;

      const matchesStatus =
        classStatusFilter === "ALL" || (cls.status || "Active") === classStatusFilter;

      return matchesSearch && matchesCampus && matchesStatus;
    });
  }, [classes, classSearch, classCampusFilter, classStatusFilter]);

  const handleUpdateClass = (updated: AcademicClass) => {
    setClasses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteClass = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      setClasses((prev) => prev.filter((c) => c.id !== id && c.className !== name));
      toast.info("Class Removed", {
        description: `"${name}" has been removed from the academic directory.`,
      });
    }
  };

  // Sorted list of all classes for the Subject tab class dropdown
  const availableClasses = React.useMemo(() => {
    const classSet = new Set<string>([
      ...PAKISTANI_SCHOOL_CLASSES,
      ...classes.map((c) => c.className),
      ...subjects.map((s) => s.className).filter(Boolean),
    ]);
    return sortPakistaniClasses(Array.from(classSet));
  }, [classes, subjects]);

  // Handlers for classes
  const handleAddClass = (newClass: AcademicClass) => {
    setClasses((prev) => [newClass, ...prev]);
  };

  const handleViewClassSubjects = (className: string) => {
    setSubjectClassFilter(className);
    setActiveTab("subjects");
  };

  // Handlers for subjects
  const handleAddSubject = (newSubject: Subject) => {
    setSubjects((prev) => [newSubject, ...prev]);
  };

  const handleUpdateSubject = (updated: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteSubject = (id: string) => {
    const target = subjects.find((s) => s.id === id);
    if (target && confirm(`Are you sure you want to delete "${target.subjectName}"?`)) {
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      toast.info("Subject Deleted", {
        description: `"${target.subjectName}" has been removed from the curriculum.`,
      });
    }
  };

  // Filtered subjects
  const filteredSubjects = React.useMemo(() => {
    return subjects.filter((s) => {
      const q = subjectSearch.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        s.subjectName.toLowerCase().includes(q) ||
        s.subjectCode.toLowerCase().includes(q) ||
        (s.className && s.className.toLowerCase().includes(q)) ||
        (s.teacher && s.teacher.toLowerCase().includes(q));

      const matchesClass =
        subjectClassFilter === "ALL" || s.className === subjectClassFilter;

      const matchesType =
        subjectTypeFilter === "ALL" ||
        (subjectTypeFilter === "core" && !s.isElective) ||
        (subjectTypeFilter === "elective" && s.isElective);

      return matchesSearch && matchesClass && matchesType;
    });
  }, [subjects, subjectSearch, subjectClassFilter, subjectTypeFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes & Subjects"
        actions={
          <div className="flex items-center gap-2">
            {activeTab === "classes" ? (
              <Button
                onClick={() => setIsAddClassOpen(true)}
                className="gap-2 bg-primary hover:bg-primary/90 text-white cursor-pointer shadow-sm"
              >
                <Plus className="size-4" />
                Add Class
              </Button>
            ) : (
              <Button
                onClick={() => setIsAddSubjectOpen(true)}
                className="gap-2 bg-primary hover:bg-primary/90 text-white cursor-pointer shadow-sm"
              >
                <Plus className="size-4" />
                Add Subject
              </Button>
            )}
          </div>
        }
      />

      <Tabs
        defaultValue="classes"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-muted/60 p-1 rounded-xl">
          <TabsTrigger value="classes" className="rounded-lg text-xs font-medium px-4">
            <School className="size-3.5 mr-2" />
            Classes ({classes.length})
          </TabsTrigger>
          <TabsTrigger value="subjects" className="rounded-lg text-xs font-medium px-4">
            <BookOpen className="size-3.5 mr-2" />
            Subjects ({subjects.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Classes Table */}
        <TabsContent value="classes" className="space-y-4 outline-none">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border/80 bg-card shadow-2xs">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand shrink-0">
                <School className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-muted-foreground font-medium block">Total Classes</span>
                <span className="text-base font-bold text-foreground tabular-nums">{classes.length}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border/80 bg-card shadow-2xs">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand shrink-0">
                <Users className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-muted-foreground font-medium block">Total Students</span>
                <span className="text-base font-bold text-foreground tabular-nums">{totalStudents.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border/80 bg-card shadow-2xs">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand shrink-0">
                <Layers className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-muted-foreground font-medium block">Total Sections</span>
                <span className="text-base font-bold text-foreground tabular-nums">{totalSections}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border/80 bg-card shadow-2xs">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand shrink-0">
                <BookOpen className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-muted-foreground font-medium block">Curriculum Subjects</span>
                <span className="text-base font-bold text-foreground tabular-nums">{subjects.length}</span>
              </div>
            </div>
          </div>

          <Card className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-xs">
            {/* Table Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/70 bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand shrink-0">
                  <School className="size-4" />
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-foreground">
                    Academic Classes Directory
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand font-mono">
                    {filteredClasses.length} {filteredClasses.length === 1 ? "Class" : "Classes"}
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-3.5 border-b border-border/60">
              <div className="relative w-full sm:w-64 md:w-72 shrink-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search classes…"
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                  className="pl-9 h-9 text-xs w-full bg-background/60"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 md:ml-auto">
                {/* Campus Filter */}
                <Select
                  value={classCampusFilter}
                  onValueChange={(val) => {
                    if (val) setClassCampusFilter(val);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs w-[190px] shrink-0 font-medium">
                    <div className="flex items-center gap-1.5 truncate">
                      <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                      <SelectValue placeholder="All Campuses" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-[260px]">
                    <SelectItem value="ALL">All Campuses</SelectItem>
                    {classCampuses.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                  value={classStatusFilter}
                  onValueChange={(val) => {
                    if (val) setClassStatusFilter(val);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs w-[130px] shrink-0 font-medium">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                {(classSearch || classCampusFilter !== "ALL" || classStatusFilter !== "ALL") && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setClassSearch("");
                      setClassCampusFilter("ALL");
                      setClassStatusFilter("ALL");
                    }}
                    className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Table */}
            <div>
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow className="bg-muted/60 border-b border-border/70">
                    <TableHead className="font-semibold text-xs text-foreground px-5 py-3 text-left">
                      Class & Campus
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-4 py-3 text-center">
                      Class Teacher
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-3 py-3 text-center">
                      Capacity
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-3 py-3 text-center">
                      Subjects
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-3 py-3 text-center">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-5 py-3 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.length > 0 ? (
                    filteredClasses.map((cls) => {
                      const classSubjectsCount =
                        subjects.filter((s) => s.className === cls.className).length ||
                        (cls as any).subjectsCount ||
                        cls.subjects ||
                        0;

                      return (
                        <TableRow
                          key={cls.id || cls.className}
                          className="hover:bg-muted/30 transition-colors border-b border-border/60"
                        >
                          {/* Class & Campus */}
                          <TableCell className="font-medium text-xs text-foreground px-5 py-3 text-left">
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-foreground text-[13px] leading-tight truncate">
                                {cls.className}
                              </span>
                              <span className="text-[11px] text-muted-foreground mt-0.5 truncate flex items-center gap-1.5">
                                <span>Grade {cls.gradeLevel}</span>
                                <span className="text-muted-foreground/60">•</span>
                                <span className="truncate">{cls.campus}</span>
                              </span>
                            </div>
                          </TableCell>

                          {/* Class Teacher */}
                          <TableCell className="text-xs px-4 py-3 text-center">
                            <span className="font-medium text-foreground truncate inline-block max-w-[160px]">
                              {cls.classTeacher || (cls as any).teacher || "Unassigned"}
                            </span>
                          </TableCell>

                          {/* Capacity (Students & Sections) */}
                          <TableCell className="text-xs px-3 py-3 text-center">
                            <div className="inline-flex flex-col items-center justify-center leading-tight">
                              <span className="font-semibold text-xs tabular-nums text-foreground">
                                {(cls as any).studentsCount || cls.students} Students
                              </span>
                              <span className="text-[11px] text-muted-foreground font-medium mt-0.5">
                                {(cls as any).sectionsCount || cls.sections} Sections
                              </span>
                            </div>
                          </TableCell>

                          {/* Subjects */}
                          <TableCell className="text-xs px-3 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleViewClassSubjects(cls.className)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand hover:bg-brand-100/80 transition-all cursor-pointer shadow-2xs group"
                              title={`View ${classSubjectsCount} subjects for ${cls.className}`}
                            >
                              <BookOpen className="size-3 text-brand" />
                              <span className="tabular-nums">{classSubjectsCount}</span>
                              <ArrowRight className="size-2.5 opacity-60 transition-transform group-hover:translate-x-0.5" />
                            </button>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="text-xs px-3 py-3 text-center">
                            <StatusBadge status={cls.status || "Active"} dot={false} />
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="px-5 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => setViewingClass(cls)}
                                className="h-7.5 px-2.5 text-xs font-semibold text-brand hover:bg-brand-soft/50 hover:text-brand border-border/80 cursor-pointer shadow-2xs gap-1.5"
                                title="View full class details & subjects"
                              >
                                <Eye className="size-3.5" />
                                <span>View</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setEditingClass(cls)}
                                className="h-7.5 w-7.5 p-0 text-muted-foreground hover:text-brand hover:bg-brand-soft/40 cursor-pointer"
                                title="Edit Class"
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => handleDeleteClass(cls.id, cls.className)}
                                className="h-7.5 w-7.5 p-0 text-muted-foreground hover:text-danger hover:bg-danger-soft/60 cursor-pointer"
                                title="Delete Class"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-xs text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <School className="size-8 text-muted-foreground/50" />
                          <p className="font-medium text-sm text-foreground">No classes found</p>
                          <p className="text-xs text-muted-foreground">
                            Try adjusting your search query or campus filter.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 2: Subjects Table with Class Dropdown, Search & Editing */}
        <TabsContent value="subjects" className="space-y-4 outline-none">
          <Card className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-xs">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-3.5 border-b border-border/70 bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand shrink-0">
                  <BookOpen className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {subjectClassFilter === "ALL"
                      ? "Curriculum Subjects"
                      : `${subjectClassFilter} — Subjects`}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Showing {filteredSubjects.length} of {subjects.length} registered subjects
                  </p>
                </div>
              </div>
              {subjectClassFilter !== "ALL" && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setSubjectClassFilter("ALL")}
                  className="h-7 px-2.5 text-xs font-medium text-brand hover:bg-brand-soft/40 cursor-pointer self-start sm:self-auto"
                >
                  Show All Classes
                </Button>
              )}
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-4 border-b border-border/60">
              <div className="relative w-full sm:w-64 md:w-72 shrink-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search subjects…"
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  className="pl-9 h-9 text-xs w-full bg-background/60"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Class Selection Dropdown */}
                <Select
                  value={subjectClassFilter}
                  onValueChange={(val) => {
                    if (val) setSubjectClassFilter(val);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs w-[210px] shrink-0 font-medium">
                    <div className="flex items-center gap-1.5 truncate">
                      <GraduationCap className="size-3.5 text-muted-foreground shrink-0" />
                      <SelectValue placeholder="All Classes" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="ALL">All Classes</SelectItem>
                    {availableClasses.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Classification Type Dropdown */}
                <Select
                  value={subjectTypeFilter}
                  onValueChange={(val) => {
                    if (val) setSubjectTypeFilter(val);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs w-[140px] shrink-0 font-medium">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="core">Core Subjects</SelectItem>
                    <SelectItem value="elective">Electives</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subjects Data Table */}
            <div className="overflow-x-auto">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow className="bg-muted/60 border-b border-border/70">
                    <TableHead className="font-semibold text-xs text-foreground px-4 py-3">Subject</TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-3 py-3">Code</TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-3 py-3">Target Class</TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-3 py-3">Classification</TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-3 py-3">Marks (Max / Pass)</TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-3 py-3">Teacher</TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-4 py-3 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((subject) => (
                      <TableRow
                        key={subject.id}
                        className="hover:bg-muted/30 transition-colors border-b border-border/60"
                      >
                        <TableCell className="font-medium text-xs text-foreground px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="size-7 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0">
                              <BookOpen className="size-3.5" />
                            </div>
                            <span className="font-semibold">{subject.subjectName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono px-3 py-3">
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[11px] font-bold uppercase bg-muted text-foreground">
                            {subject.subjectCode}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-foreground px-3 py-3 font-medium">
                          {subject.className || "-"}
                        </TableCell>
                        <TableCell className="px-3 py-3">
                          {subject.isElective ? (
                            <Badge variant="outline" className="text-[10px] font-semibold text-muted-foreground">
                              Elective
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] font-semibold bg-brand-soft text-brand">
                              Core
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground tabular-nums px-3 py-3">
                          <span className="font-medium text-foreground">{subject.maxMarks}</span> /{" "}
                          <span className="text-success font-medium">{subject.passMarks}</span>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-foreground px-3 py-3">
                          <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                            <Users className="size-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{subject.teacher || "Unassigned"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => setEditingSubject(subject)}
                              className="h-7 px-2.5 text-xs font-semibold cursor-pointer border-border/80 hover:bg-muted gap-1 text-foreground"
                              title="Edit Subject"
                            >
                              <Pencil className="size-3 text-muted-foreground" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleDeleteSubject(subject.id)}
                              className="h-7 px-2 text-danger hover:bg-danger-soft/30 hover:text-danger cursor-pointer"
                              title="Delete Subject"
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                        No subjects found for the selected class or filter criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Class Interactive Dialog */}
      <AddClassDialog
        open={isAddClassOpen}
        onOpenChange={setIsAddClassOpen}
        onAddClass={handleAddClass}
      />

      {/* Edit Class Interactive Dialog */}
      <EditClassDialog
        classItem={editingClass}
        open={!!editingClass}
        onOpenChange={(isOpen) => {
          if (!isOpen) setEditingClass(null);
        }}
        onUpdateClass={handleUpdateClass}
      />

      {/* View Class Interactive Dialog */}
      <ViewClassDialog
        classItem={viewingClass}
        open={!!viewingClass}
        onOpenChange={(isOpen) => {
          if (!isOpen) setViewingClass(null);
        }}
      />

      {/* Edit Subject Interactive Dialog */}
      <EditSubjectDialog
        subject={editingSubject}
        open={!!editingSubject}
        onOpenChange={(isOpen) => {
          if (!isOpen) setEditingSubject(null);
        }}
        onUpdateSubject={handleUpdateSubject}
        onDeleteSubject={handleDeleteSubject}
      />

      {/* Add Subject Interactive Dialog */}
      <AddSubjectDialog
        open={isAddSubjectOpen}
        onOpenChange={setIsAddSubjectOpen}
        onAddSubject={handleAddSubject}
        defaultClassName={subjectClassFilter !== "ALL" ? subjectClassFilter : undefined}
      />
    </div>
  );
}
