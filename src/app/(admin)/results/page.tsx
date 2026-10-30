"use client";

import * as React from "react";
import {
  Award,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Users,
  Percent,
  Search,
  Printer,
  Eye,
  ChevronDown,
  Check,
  Send,
  RotateCcw,
} from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  INITIAL_STUDENT_RESULTS,
  INITIAL_CLASS_DECLARATIONS,
  RESULT_TERMS,
  RESULT_CLASSES,
  type StudentTermResult,
  type ClassResultDeclaration,
  type ResultStatus,
} from "@/lib/mock/results";
import { ViewReportCardDialog } from "./view-report-card-dialog";
import { PrintBroadsheetDialog } from "./print-broadsheet-dialog";

export default function ResultsPage() {
  const [activeTab, setActiveTab] = React.useState("broadsheet");
  const [studentResults, setStudentResults] = React.useState<StudentTermResult[]>(
    INITIAL_STUDENT_RESULTS
  );
  const [declarations, setDeclarations] = React.useState<ClassResultDeclaration[]>(
    INITIAL_CLASS_DECLARATIONS
  );

  // Filters for Section 1 (Broadsheet)
  const [termFilter, setTermFilter] = React.useState(RESULT_TERMS[0]);
  const [classFilter, setClassFilter] = React.useState(RESULT_CLASSES[0]);
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Section 2: Selected student for individual Report Card
  const [selectedStudentId, setSelectedStudentId] = React.useState<string>(
    INITIAL_STUDENT_RESULTS[0].id
  );

  // Dialog states
  const [viewingResult, setViewingResult] = React.useState<StudentTermResult | null>(null);
  const [isPrintBroadsheetOpen, setIsPrintBroadsheetOpen] = React.useState(false);

  const sections = [
    { id: "broadsheet", label: "Broadsheet & Gazette", icon: FileSpreadsheet },
    { id: "report-cards", label: "Student Report Cards", icon: FileText },
    { id: "declarations", label: "Result Declaration", icon: Send },
  ];

  const activeSectionObj =
    sections.find((s) => s.id === activeTab) || sections[0];

  // Filtered students for Broadsheet
  const filteredResults = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return studentResults.filter((r) => {
      const matchesTerm = termFilter === "ALL" || r.termName === termFilter;
      const matchesClass = classFilter === "ALL" || r.className === classFilter;
      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      const matchesSearch =
        q === "" ||
        r.studentName.toLowerCase().includes(q) ||
        r.rollNo.toLowerCase().includes(q) ||
        r.fatherName.toLowerCase().includes(q);

      return matchesTerm && matchesClass && matchesStatus && matchesSearch;
    });
  }, [studentResults, termFilter, classFilter, statusFilter, searchQuery]);

  // Overall KPI metrics
  const kpiStats = React.useMemo(() => {
    const total = studentResults.length;
    const passed = studentResults.filter((r) => r.status === "Passed").length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : "0";
    const topGrades = studentResults.filter(
      (r) => r.overallGrade === "A+" || r.overallGrade === "A"
    ).length;
    const publishedClasses = declarations.filter((d) => d.status === "Published").length;

    return {
      totalStudents: total,
      passRate: `${passRate}%`,
      topGrades: `${topGrades} Students`,
      publishedClasses: `${publishedClasses} / ${declarations.length} Published`,
    };
  }, [studentResults, declarations]);

  // Active student for Report Card tab
  const activeReportCardStudent = React.useMemo(() => {
    return (
      studentResults.find((s) => s.id === selectedStudentId) ||
      studentResults[0]
    );
  }, [studentResults, selectedStudentId]);

  // Status update handler
  const handleUpdateStatus = (studentId: string, newStatus: ResultStatus) => {
    setStudentResults((prev) =>
      prev.map((r) => (r.id === studentId ? { ...r, status: newStatus } : r))
    );
    toast.success(`Result status updated to ${newStatus}.`);
  };

  // Publication toggle handler
  const handleTogglePublication = (id: string) => {
    setDeclarations((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextStatus = d.status === "Published" ? "Draft" : "Published";
          toast.success(
            nextStatus === "Published"
              ? `Results published for ${d.className}.`
              : `Results for ${d.className} reverted to draft.`
          );
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Results
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPrintBroadsheetOpen(true)}
            className="text-xs h-9 gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="size-3.5" />
            <span>Print Broadsheet</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setActiveTab("declarations")}
            className="bg-brand text-brand-foreground hover:bg-brand/90 text-xs h-9 gap-1.5 shadow-xs cursor-pointer"
          >
            <Send className="size-3.5" />
            <span>Publish Results</span>
          </Button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <StatGrid className="max-w-none">
        <StatCard
          label="Total Students Examined"
          value={`${kpiStats.totalStudents} Students`}
          icon={Users}
        />
        <StatCard
          label="Overall Pass Rate"
          value={kpiStats.passRate}
          icon={Percent}
        />
        <StatCard
          label="Top Achievers (A+ / A)"
          value={kpiStats.topGrades}
          icon={Award}
        />
        <StatCard
          label="Result Declarations"
          value={kpiStats.publishedClasses}
          icon={CheckCircle2}
        />
      </StatGrid>

      {/* Main Module Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Dropdown Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="group inline-flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-background hover:bg-muted/50 px-3 h-9 text-xs font-semibold shadow-2xs transition-all hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 cursor-pointer min-w-[210px] sm:min-w-[230px]">
                <div className="flex items-center gap-2 min-w-0">
                  <activeSectionObj.icon className="size-4 text-brand shrink-0" />
                  <span className="text-xs font-semibold text-foreground truncate">
                    {activeSectionObj.label}
                  </span>
                </div>
                <ChevronDown className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="w-56 p-1 rounded-xl shadow-lg border-border/80"
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
                      {isSelected && (
                        <Check className="size-3.5 text-brand shrink-0 ml-2" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ================= SECTION 1: Broadsheet & Gazette ================= */}
        <TabsContent value="broadsheet" className="space-y-4 outline-none">
          <Card className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-xs">
            {/* Card Header: Title on Left, Primary Scope Selectors on Right */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/70 bg-muted/20">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-foreground">
                  Class Result Broadsheet &amp; Gazette
                </h2>

                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand font-mono">
                  {filteredResults.length}{" "}
                  {filteredResults.length === 1 ? "Student" : "Students"}
                </span>
              </div>

              {/* Symmetrical Primary Filter Selectors */}
              <div className="flex flex-wrap items-center gap-2.5">
                <Select
                  value={termFilter}
                  onValueChange={(val) => {
                    if (val) setTermFilter(val);
                  }}
                >
                  <SelectTrigger className="w-[260px] h-9 text-xs font-medium bg-background shadow-2xs">
                    <SelectValue placeholder="All Exam Terms" />
                  </SelectTrigger>
                  <SelectContent className="w-[260px]">
                    <SelectItem value="ALL" className="text-xs">
                      All Exam Terms
                    </SelectItem>
                    {RESULT_TERMS.map((t) => (
                      <SelectItem key={t} value={t} className="text-xs">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={classFilter}
                  onValueChange={(val) => {
                    if (val) setClassFilter(val);
                  }}
                >
                  <SelectTrigger className="w-[260px] h-9 text-xs font-medium bg-background shadow-2xs">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent className="w-[260px]">
                    <SelectItem value="ALL" className="text-xs">
                      All Classes
                    </SelectItem>
                    {RESULT_CLASSES.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Sub-toolbar: Search on Left, Status Filter & Reset on Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-border/60">
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search students by name, roll no…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs bg-background/60"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    if (val) setStatusFilter(val);
                  }}
                >
                  <SelectTrigger className="w-[150px] h-9 text-xs font-medium bg-background shadow-2xs">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className="w-44">
                    <SelectItem value="ALL" className="text-xs">
                      All Statuses
                    </SelectItem>
                    <SelectItem value="Passed" className="text-xs">
                      Passed
                    </SelectItem>
                    <SelectItem value="Fail" className="text-xs">
                      Fail
                    </SelectItem>
                    <SelectItem value="Compartment" className="text-xs">
                      Compartment
                    </SelectItem>
                  </SelectContent>
                </Select>

                {(searchQuery ||
                  termFilter !== RESULT_TERMS[0] ||
                  classFilter !== RESULT_CLASSES[0] ||
                  statusFilter !== "ALL") && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setSearchQuery("");
                      setTermFilter(RESULT_TERMS[0]);
                      setClassFilter(RESULT_CLASSES[0]);
                      setStatusFilter("ALL");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer h-9 px-2.5"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Broadsheet Table */}
            <Table className="md:table-fixed">
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="pl-5 md:w-[26%] text-xs font-semibold uppercase tracking-wider">
                    Student Details
                  </TableHead>
                  <TableHead className="md:w-[15%] text-center text-xs font-semibold uppercase tracking-wider">
                    Class
                  </TableHead>
                  <TableHead className="md:w-[12%] text-center text-xs font-semibold uppercase tracking-wider">
                    Marks
                  </TableHead>
                  <TableHead className="md:w-[10%] text-center text-xs font-semibold uppercase tracking-wider">
                    Score %
                  </TableHead>
                  <TableHead className="md:w-[9%] text-center text-xs font-semibold uppercase tracking-wider">
                    Grade
                  </TableHead>
                  <TableHead className="md:w-[9%] text-center text-xs font-semibold uppercase tracking-wider">
                    Rank
                  </TableHead>
                  <TableHead className="md:w-[13%] text-center text-xs font-semibold uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="text-right pr-5 md:w-[6%] text-xs font-semibold uppercase tracking-wider">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredResults.length > 0 ? (
                  filteredResults.map((r) => (
                    <TableRow
                      key={r.id}
                      className="group transition-colors hover:bg-muted/30"
                    >
                      <TableCell className="pl-5 py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono text-xs font-bold text-foreground shrink-0 bg-muted px-2 py-0.5 rounded">
                            {r.rollNo}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-foreground truncate">
                              {r.studentName}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate">
                              s/o {r.fatherName}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-center">
                        <span className="inline-flex items-center rounded-md bg-muted/60 px-2 py-0.5 text-xs font-medium text-foreground">
                          {r.className
                            .replace(" (Science - Biology)", " (Bio)")
                            .replace(" (Science - Computer)", " (CS)")}
                        </span>
                      </TableCell>

                      <TableCell className="py-3 text-center">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {r.totalObtainedMarks}{" "}
                          <span className="text-muted-foreground font-normal">
                            / {r.totalMaxMarks}
                          </span>
                        </span>
                      </TableCell>

                      <TableCell className="py-3 text-center">
                        <span className="font-mono text-xs font-bold text-brand">
                          {r.percentage.toFixed(1)}%
                        </span>
                      </TableCell>

                      <TableCell className="py-3 text-center">
                        <span
                          className={cn(
                            "inline-block px-2 py-0.5 rounded text-[11px] font-bold font-mono",
                            r.overallGrade === "A+"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                              : r.overallGrade === "A"
                                ? "bg-teal-500/15 text-teal-700 dark:text-teal-400"
                                : r.overallGrade === "B"
                                  ? "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                                  : r.overallGrade === "C"
                                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                    : "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                          )}
                        >
                          {r.overallGrade}
                        </span>
                      </TableCell>

                      <TableCell className="py-3 text-center">
                        <span
                          className={cn(
                            "inline-block px-2 py-0.5 rounded-full text-[11px] font-bold",
                            r.position === 1
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                              : r.position === 2
                                ? "bg-slate-500/15 text-slate-700 dark:text-slate-300"
                                : r.position === 3
                                  ? "bg-amber-700/15 text-amber-800 dark:text-amber-300"
                                  : "text-muted-foreground font-normal"
                          )}
                        >
                          {r.position === 1
                            ? "1st"
                            : r.position === 2
                              ? "2nd"
                              : r.position === 3
                                ? "3rd"
                                : `${r.position}th`}
                        </span>
                      </TableCell>

                      <TableCell className="py-3 text-center">
                        <StatusBadge
                          status={r.status}
                          tone={
                            r.status === "Passed"
                              ? "success"
                              : r.status === "Compartment"
                                ? "warning"
                                : "danger"
                          }
                          dot
                        />
                      </TableCell>

                      <TableCell className="text-right pr-5 py-3">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setViewingResult(r)}
                          title="View & Print Detailed Marks Certificate (DMC)"
                          className="text-muted-foreground hover:text-brand cursor-pointer"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-28 text-center text-xs text-muted-foreground"
                    >
                      No student results found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ================= SECTION 2: Student Report Cards ================= */}
        <TabsContent value="report-cards" className="space-y-4 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Student Selector List */}
            <Card className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-xs lg:col-span-1 flex flex-col">
              <div className="px-4 py-3 border-b border-border/70 bg-muted/20 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Select Student
                </h3>
                <span className="text-xs font-mono text-muted-foreground">
                  {studentResults.length} Available
                </span>
              </div>

              <div className="p-3 border-b border-border/60">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search candidate…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs bg-background/60"
                  />
                </div>
              </div>

              <div className="divide-y divide-border/60 max-h-[500px] overflow-y-auto flex-1">
                {studentResults
                  .filter(
                    (s) =>
                      searchQuery === "" ||
                      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      s.rollNo.includes(searchQuery)
                  )
                  .map((s) => {
                    const isSelected = s.id === activeReportCardStudent.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedStudentId(s.id)}
                        className={cn(
                          "p-3 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs",
                          isSelected
                            ? "bg-brand-soft text-brand font-semibold"
                            : "hover:bg-muted/40 text-foreground"
                        )}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] bg-muted/80 text-foreground px-1.5 py-0.5 rounded font-bold">
                              {s.rollNo}
                            </span>
                            <span className="font-semibold truncate">
                              {s.studentName}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                            {s.className}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-xs">
                            {s.percentage.toFixed(0)}%
                          </span>
                          <span className="block text-[10px] text-emerald-700 font-bold">
                            Grade {s.overallGrade}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Card>

            {/* Right Report Card Preview Sheet */}
            <Card className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-xs lg:col-span-2 flex flex-col">
              <div className="px-5 py-3.5 border-b border-border/70 bg-muted/20 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Detailed Marks Certificate (DMC)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeReportCardStudent.studentName} ({activeReportCardStudent.rollNo})
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => setViewingResult(activeReportCardStudent)}
                  className="h-8 text-xs gap-1.5 bg-brand text-cream hover:bg-brand-600 shadow-xs cursor-pointer"
                >
                  <Printer className="size-3.5" />
                  <span>Print Full DMC</span>
                </Button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                {/* School Header Badge */}
                <div className="text-center pb-3 border-b border-border/70">
                  <h4 className="font-bold text-sm uppercase tracking-wide text-foreground">
                    EduSphere Grammar High School
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {activeReportCardStudent.campus} • {activeReportCardStudent.termName}
                  </p>
                </div>

                {/* Student Info Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-muted/30 p-3 rounded-xl border border-border/70">
                  <div>
                    <span className="text-muted-foreground">Student: </span>
                    <span className="font-semibold text-foreground">
                      {activeReportCardStudent.studentName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Roll No: </span>
                    <span className="font-mono font-bold text-foreground">
                      {activeReportCardStudent.rollNo}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Father: </span>
                    <span className="font-semibold text-foreground">
                      {activeReportCardStudent.fatherName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Class: </span>
                    <span className="font-semibold text-foreground">
                      {activeReportCardStudent.className}
                    </span>
                  </div>
                </div>

                {/* Subject Scores Table */}
                <div className="rounded-xl border border-border/70 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/70 text-foreground font-semibold">
                        <th className="py-2 px-3 text-left">Subject</th>
                        <th className="py-2 px-2 text-center w-16">Max</th>
                        <th className="py-2 px-2 text-center w-16">Pass</th>
                        <th className="py-2 px-2 text-center w-20 font-bold">Obtained</th>
                        <th className="py-2 px-2 text-center w-16">Grade</th>
                        <th className="py-2 px-3 text-left">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {activeReportCardStudent.subjects.map((sub) => (
                        <tr key={sub.subjectName} className="hover:bg-muted/20">
                          <td className="py-2 px-3 font-medium text-foreground">
                            {sub.subjectName}
                          </td>
                          <td className="py-2 px-2 text-center font-mono text-muted-foreground">
                            {sub.maxMarks}
                          </td>
                          <td className="py-2 px-2 text-center font-mono text-muted-foreground">
                            {sub.passMarks}
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-foreground">
                            {sub.obtainedMarks}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span
                              className={cn(
                                "px-1.5 py-0.5 rounded text-[10px] font-bold font-mono",
                                sub.isPassed
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                  : "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                              )}
                            >
                              {sub.grade}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-muted-foreground text-[11px] truncate">
                            {sub.remarks || (sub.isPassed ? "Pass" : "Compartment")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Score Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded-xl border border-border/70 p-2.5 bg-muted/20">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">
                      Marks Aggregate
                    </span>
                    <p className="font-mono font-bold text-sm text-foreground mt-0.5">
                      {activeReportCardStudent.totalObtainedMarks} /{" "}
                      {activeReportCardStudent.totalMaxMarks}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 p-2.5 bg-muted/20">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">
                      Percentage
                    </span>
                    <p className="font-mono font-bold text-sm text-brand mt-0.5">
                      {activeReportCardStudent.percentage.toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 p-2.5 bg-muted/20">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">
                      Class Rank
                    </span>
                    <p className="font-bold text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                      {activeReportCardStudent.position === 1
                        ? "1st Position"
                        : activeReportCardStudent.position === 2
                          ? "2nd Position"
                          : activeReportCardStudent.position === 3
                            ? "3rd Position"
                            : `${activeReportCardStudent.position}th Position`}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 p-2.5 bg-muted/20">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">
                      Final Decision
                    </span>
                    <div className="mt-0.5">
                      <StatusBadge
                        status={activeReportCardStudent.status}
                        tone={
                          activeReportCardStudent.status === "Passed"
                            ? "success"
                            : activeReportCardStudent.status === "Compartment"
                              ? "warning"
                              : "danger"
                        }
                        dot
                      />
                    </div>
                  </div>
                </div>

                {/* Evaluator Remarks */}
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Class Teacher Remarks:
                  </span>
                  <p className="text-foreground italic leading-relaxed">
                    &ldquo;{activeReportCardStudent.teacherRemarks}&rdquo;
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ================= SECTION 3: Result Declaration ================= */}
        <TabsContent value="declarations" className="space-y-4 outline-none">
          <Card className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/70 bg-muted/20">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Class Result Declarations &amp; Publication Status
                </h2>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand font-mono self-start sm:self-auto">
                {declarations.filter((d) => d.status === "Published").length} of{" "}
                {declarations.length} Published
              </span>
            </div>

            <Table className="md:table-fixed">
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="pl-5 md:w-[32%] text-xs font-semibold uppercase tracking-wider">
                    Class &amp; Campus
                  </TableHead>
                  <TableHead className="md:w-[22%] text-center text-xs font-semibold uppercase tracking-wider">
                    Exam Term
                  </TableHead>
                  <TableHead className="md:w-[14%] text-center text-xs font-semibold uppercase tracking-wider">
                    Pass Rate
                  </TableHead>
                  <TableHead className="md:w-[14%] text-center text-xs font-semibold uppercase tracking-wider">
                    Average Score
                  </TableHead>
                  <TableHead className="md:w-[10%] text-center text-xs font-semibold uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="text-right pr-5 md:w-[8%] text-xs font-semibold uppercase tracking-wider">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {declarations.map((d) => (
                  <TableRow
                    key={d.id}
                    className="group transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="pl-5 py-3.5">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {d.className}
                        </span>
                        <span className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          {d.campus} • {d.compiledBy}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 text-center">
                      <span className="text-xs text-foreground font-medium">
                        {d.termName}
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5 font-mono text-xs">
                        <span className="font-bold text-foreground">
                          {d.passedCount} / {d.totalStudents}
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                          ({d.passPercentage}%)
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 text-center">
                      <span className="font-mono text-xs font-bold text-brand">
                        {d.averagePercentage}% Avg
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                          d.status === "Published"
                            ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
                            : "bg-amber-500/12 text-amber-700 dark:text-amber-400"
                        )}
                      >
                        {d.status === "Published" ? (
                          <CheckCircle2 className="size-3" />
                        ) : (
                          <RotateCcw className="size-3" />
                        )}
                        <span>{d.status}</span>
                      </span>
                    </TableCell>

                    <TableCell className="text-right pr-5 py-3.5">
                      <Button
                        type="button"
                        variant={d.status === "Published" ? "outline" : "default"}
                        size="xs"
                        onClick={() => handleTogglePublication(d.id)}
                        className={cn(
                          "text-xs cursor-pointer shadow-2xs",
                          d.status !== "Published" &&
                            "bg-brand text-cream hover:bg-brand-600"
                        )}
                      >
                        {d.status === "Published" ? "Unpublish" : "Publish"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ViewReportCardDialog
        open={Boolean(viewingResult)}
        onOpenChange={(open) => {
          if (!open) setViewingResult(null);
        }}
        result={viewingResult}
      />

      <PrintBroadsheetDialog
        open={isPrintBroadsheetOpen}
        onOpenChange={setIsPrintBroadsheetOpen}
        results={filteredResults}
        classNameLabel={classFilter === "ALL" ? "All Classes" : classFilter}
        termLabel={termFilter === "ALL" ? "All Terms" : termFilter}
      />
    </div>
  );
}
