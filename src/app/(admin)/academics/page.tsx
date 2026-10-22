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
  Layers,
  Pencil,
  Trash2,
  Search,
  GraduationCap,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { AddClassDialog } from "./add-class-dialog";
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
  const [editingSubject, setEditingSubject] = React.useState<Subject | null>(null);

  // Subject search & filter state
  const [subjectSearch, setSubjectSearch] = React.useState("");
  const [subjectClassFilter, setSubjectClassFilter] = React.useState("ALL");
  const [subjectTypeFilter, setSubjectTypeFilter] = React.useState("ALL");

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

        {/* TAB 1: Classes Grid */}
        <TabsContent value="classes" className="space-y-4 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((cls) => (
              <Card
                key={cls.id || cls.className}
                className="rounded-2xl border border-border/80 bg-card hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <CardTitle
                        className="text-base font-semibold text-foreground truncate"
                        title={cls.className}
                      >
                        {cls.className}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5 truncate">
                        Grade {cls.gradeLevel} • {cls.campus}
                      </CardDescription>
                    </div>
                    {cls.stream && (
                      <Badge
                        variant="secondary"
                        className="text-[11px] font-semibold shrink-0 gap-1 px-2 py-0.5"
                      >
                        <Layers className="size-3 text-muted-foreground" />
                        {cls.stream}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3.5">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="flex flex-col p-2 bg-muted/40 rounded-xl">
                      <span className="font-bold text-xs text-foreground tabular-nums">
                        {(cls as any).sectionsCount || cls.sections}
                      </span>
                      <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                        Sections
                      </span>
                    </div>
                    <div className="flex flex-col p-2 bg-muted/40 rounded-xl">
                      <span className="font-bold text-xs text-foreground tabular-nums">
                        {(cls as any).studentsCount || cls.students}
                      </span>
                      <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                        Students
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleViewClassSubjects(cls.className)}
                      className="flex flex-col p-2 bg-muted/40 hover:bg-brand-soft/60 rounded-xl transition-colors cursor-pointer group"
                      title={`View subjects for ${cls.className}`}
                    >
                      <span className="font-bold text-xs text-foreground group-hover:text-brand tabular-nums">
                        {subjects.filter((s) => s.className === cls.className).length ||
                          (cls as any).subjectsCount ||
                          cls.subjects}
                      </span>
                      <span className="text-muted-foreground group-hover:text-brand text-[10px] uppercase font-semibold">
                        Subjects
                      </span>
                    </button>
                  </div>

                  <div className="flex justify-between items-center text-xs bg-muted/20 px-2.5 py-1.5 rounded-lg truncate">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Users className="size-3.5 text-muted-foreground" />
                      Class Teacher
                    </span>
                    <span className="font-medium text-foreground truncate max-w-[160px]">
                      {cls.classTeacher || (cls as any).teacher}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-0.5">
                    <span className="text-muted-foreground font-medium">Class Status</span>
                    <StatusBadge status={cls.status || "Active"} dot={false} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                  placeholder="Search subjects..."
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
