"use client";

import * as React from "react";
import {
  Award,
  School,
  Building2,
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
  Plus,
  Pencil,
  Calendar,
  GraduationCap,
  X,
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
  isCampusMatch,
} from "@/lib/mock/results";
import { ViewReportCardDialog } from "./view-report-card-dialog";
import { PrintBroadsheetDialog } from "./print-broadsheet-dialog";
import { AddResultDialog } from "./add-result-dialog";
import { useBranches } from "@/context/branches-context";
import { EditResultDialog } from "./edit-result-dialog";

export default function ResultsPage() {
  const [activeTab, setActiveTab] = React.useState("broadsheet");
  const [studentResults, setStudentResults] = React.useState<StudentTermResult[]>(
    INITIAL_STUDENT_RESULTS
  );
  const [declarations, setDeclarations] = React.useState<ClassResultDeclaration[]>(
    INITIAL_CLASS_DECLARATIONS
  );

  // Global Branch / Campus Scope Filter
  const { branches } = useBranches();
  const [branchFilter, setBranchFilter] = React.useState<string>("ALL");

  // Filters for Section 1 (Broadsheet)
  const [termFilter, setTermFilter] = React.useState(RESULT_TERMS[0]);
  const [classFilter, setClassFilter] = React.useState("ALL");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Section 2: Scoped filters for individual Report Cards
  const [reportCardClassFilter, setReportCardClassFilter] = React.useState<string>("ALL");
  const [reportCardTermFilter, setReportCardTermFilter] = React.useState<string>(RESULT_TERMS[0]);
  const [reportCardSearch, setReportCardSearch] = React.useState<string>("");

  // Branch change handler with automatic filter adaptation
  const handleBranchChange = React.useCallback(
    (newBranch: string) => {
      setBranchFilter(newBranch);
      if (newBranch !== "ALL" && classFilter !== "ALL") {
        const hasStudents = studentResults.some(
          (r) => isCampusMatch(r.campus, newBranch) && r.className === classFilter
        );
        if (!hasStudents) {
          setClassFilter("ALL");
        }
      }
      if (newBranch !== "ALL" && reportCardClassFilter !== "ALL") {
        const hasReportStudents = studentResults.some(
          (s) => isCampusMatch(s.campus, newBranch) && s.className === reportCardClassFilter
        );
        if (!hasReportStudents) {
          setReportCardClassFilter("ALL");
        }
      }
    },
    [studentResults, classFilter, reportCardClassFilter]
  );

  // Section 2: Selected student for individual Report Card
  const [selectedStudentId, setSelectedStudentId] = React.useState<string>(
    INITIAL_STUDENT_RESULTS[0].id
  );

  // Dialog states
  const [viewingResult, setViewingResult] = React.useState<StudentTermResult | null>(null);
  const [isPrintBroadsheetOpen, setIsPrintBroadsheetOpen] = React.useState(false);
  const [isAddResultOpen, setIsAddResultOpen] = React.useState(false);
  const [editingResult, setEditingResult] = React.useState<StudentTermResult | null>(null);

  // Section 3: Declarations filtered by branch
  const filteredDeclarations = React.useMemo(() => {
    return declarations.filter((d) => isCampusMatch(d.campus, branchFilter));
  }, [declarations, branchFilter]);

  // Position recalculation utility across class & term
  const recalculatePositions = (results: StudentTermResult[]): StudentTermResult[] => {
    const groups: Record<string, StudentTermResult[]> = {};
    results.forEach((r) => {
      const key = `${r.termName}__${r.className}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });

    const updated: StudentTermResult[] = [];
    Object.values(groups).forEach((group) => {
      const sorted = [...group].sort((a, b) => b.percentage - a.percentage);
      sorted.forEach((item, idx) => {
        updated.push({ ...item, position: idx + 1 });
      });
    });

    return updated;
  };

  const handleAddResult = (newResult: StudentTermResult) => {
    setStudentResults((prev) => {
      const updated = [...prev, newResult];
      return recalculatePositions(updated);
    });
    toast.success(`Result published for ${newResult.studentName} (${newResult.rollNo})`);
  };

  const handleUpdateResult = (updated: StudentTermResult) => {
    setStudentResults((prev) => {
      const next = prev.map((r) => (r.id === updated.id ? updated : r));
      return recalculatePositions(next);
    });
    toast.success(`Result updated for ${updated.studentName} (${updated.rollNo})`);
  };

  const sections = [
    { id: "broadsheet", label: "Broadsheet & Gazette", icon: FileSpreadsheet },
    { id: "report-cards", label: "Student Report Cards", icon: FileText },
    { id: "declarations", label: "Result Declaration", icon: Send },
  ];

  const activeSectionObj =
    sections.find((s) => s.id === activeTab) || sections[0];

  // Filtered students for Broadsheet (respects selected branch)
  const filteredResults = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return studentResults.filter((r) => {
      const matchesBranch = isCampusMatch(r.campus, branchFilter);
      const matchesTerm = termFilter === "ALL" || r.termName === termFilter;
      const matchesClass = classFilter === "ALL" || r.className === classFilter;
      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      const matchesSearch =
        q === "" ||
        r.studentName.toLowerCase().includes(q) ||
        r.rollNo.toLowerCase().includes(q) ||
        r.fatherName.toLowerCase().includes(q);

      return matchesBranch && matchesTerm && matchesClass && matchesStatus && matchesSearch;
    });
  }, [studentResults, branchFilter, termFilter, classFilter, statusFilter, searchQuery]);

  // Overall KPI metrics (dynamically recalculated for the selected branch)
  const kpiStats = React.useMemo(() => {
    const branchStudents = studentResults.filter((r) => isCampusMatch(r.campus, branchFilter));
    const branchDeclarations = declarations.filter((d) => isCampusMatch(d.campus, branchFilter));

    const total = branchStudents.length;
    const passed = branchStudents.filter((r) => r.status === "Passed").length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : "0";
    const topGrades = branchStudents.filter(
      (r) => r.overallGrade === "A+" || r.overallGrade === "A"
    ).length;
    const publishedClasses = branchDeclarations.filter((d) => d.status === "Published").length;

    return {
      totalStudents: total,
      passRate: `${passRate}%`,
      topGrades: `${topGrades} Students`,
      publishedClasses: `${publishedClasses} / ${branchDeclarations.length} Published`,
    };
  }, [studentResults, declarations, branchFilter]);

  // Section 2: Scoped students for individual Report Cards (Class & Branch scoped)
  const reportCardStudents = React.useMemo(() => {
    const q = reportCardSearch.toLowerCase().trim();
    return studentResults.filter((s) => {
      const matchesBranch = isCampusMatch(s.campus, branchFilter);
      const matchesClass =
        reportCardClassFilter === "ALL" || s.className === reportCardClassFilter;
      const matchesTerm =
        reportCardTermFilter === "ALL" || s.termName === reportCardTermFilter;
      const matchesSearch =
        q === "" ||
        s.studentName.toLowerCase().includes(q) ||
        s.rollNo.includes(q) ||
        s.fatherName.toLowerCase().includes(q);

      return matchesBranch && matchesClass && matchesTerm && matchesSearch;
    });
  }, [studentResults, branchFilter, reportCardClassFilter, reportCardTermFilter, reportCardSearch]);

  // Active student for Report Card tab
  const activeReportCardStudent = React.useMemo(() => {
    if (reportCardStudents.length === 0) return null;
    const found = reportCardStudents.find((s) => s.id === selectedStudentId);
    return found || reportCardStudents[0];
  }, [reportCardStudents, selectedStudentId]);

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Results
            </h1>
          </div>

          {/* Global Branch Selector */}
          <div className="flex items-center gap-1.5">
            <Select
              value={branchFilter}
              onValueChange={(val) => {
                if (val) handleBranchChange(val);
              }}
            >
              <SelectTrigger className="h-9 min-w-[210px] sm:min-w-[240px] text-xs font-semibold bg-card border-border/80 shadow-2xs gap-2 cursor-pointer hover:border-brand/40 transition-colors">
                <Building2 className="size-4 text-brand shrink-0" />
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-muted-foreground font-normal">Branch:</span>
                  <span className="truncate">{branchFilter === "ALL" ? "All Branches" : branchFilter}</span>
                </div>
              </SelectTrigger>
              <SelectContent className="w-[280px] max-h-72">
                <SelectItem value="ALL" className="text-xs font-semibold">
                  <div className="flex items-center justify-between w-full">
                    <span>All Branches</span>
                    <span className="text-[10.5px] text-muted-foreground font-mono ml-2">
                      ({branches.length} Campuses)
                    </span>
                  </div>
                </SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.campusName} className="text-xs">
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{b.campusName}</span>
                      {b.campusCode && (
                        <span className="text-[10px] text-muted-foreground font-mono ml-1.5 shrink-0">
                          [{b.campusCode}]
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {branchFilter !== "ALL" && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => handleBranchChange("ALL")}
                className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer h-9 px-2"
                title="View All Branches"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsAddResultOpen(true)}
            className="bg-brand text-brand-foreground hover:bg-brand/90 text-xs h-9 gap-1.5 shadow-xs cursor-pointer font-semibold"
          >
            <Plus className="size-4" />
            <span>Add Result</span>
          </Button>

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
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("declarations")}
            className="text-xs h-9 gap-1.5 shadow-xs cursor-pointer"
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

          {/* Active Branch Indicator Pill */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-muted/40 border border-border/60 text-muted-foreground">
              <Building2 className="size-3.5 text-brand shrink-0" />
              <span>Active Branch:</span>
              <span className="font-semibold text-foreground">
                {branchFilter === "ALL" ? "All Campuses (Consolidated)" : branchFilter}
              </span>
            </div>
          </div>
        </div>

        {/* ================= SECTION 1: Broadsheet & Gazette ================= */}
        <TabsContent value="broadsheet" className="space-y-4 outline-none">
          <Card className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-xs">
            {/* Card Header: Title & Record Counter on Left, Fast Student Search & Reset on Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/70 bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="size-4" />
                </div>
                <h2 className="text-sm font-bold text-foreground whitespace-nowrap">
                  Broadsheet &amp; Gazette
                </h2>
              </div>

              {/* Fast Search & Reset in Header */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search student or roll no…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-8 h-9 text-xs bg-background shadow-2xs rounded-xl border-border/80"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                {(searchQuery ||
                  termFilter !== RESULT_TERMS[0] ||
                  classFilter !== "ALL" ||
                  statusFilter !== "ALL" ||
                  branchFilter !== "ALL") && (
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      setSearchQuery("");
                      setTermFilter(RESULT_TERMS[0]);
                      setClassFilter("ALL");
                      setStatusFilter("ALL");
                      handleBranchChange("ALL");
                    }}
                    className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer rounded-xl border-border/80 hover:bg-muted/60 shrink-0 shadow-2xs"
                    title="Reset all filters"
                  >
                    <RotateCcw className="size-3" />
                    <span className="hidden md:inline">Reset</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Unified Scope & Filter Strip: Equal-width 4-column responsive grid */}
            <div className="px-5 py-3 border-b border-border/60 bg-muted/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {/* 1. Branch / Campus Filter */}
                <Select
                  value={branchFilter}
                  onValueChange={(val) => {
                    if (val) handleBranchChange(val);
                  }}
                >
                  <SelectTrigger className="w-full h-9 text-xs font-medium bg-background shadow-2xs gap-2 rounded-xl border-border/80">
                    <Building2 className="size-3.5 text-brand shrink-0" />
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-muted-foreground font-normal">Branch:</span>
                      <span className="font-semibold truncate">
                        {branchFilter === "ALL" ? "All Branches" : branchFilter}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="w-64 max-h-72">
                    <SelectItem value="ALL" className="text-xs font-semibold">
                      All Branches ({branches.length} Campuses)
                    </SelectItem>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.campusName} className="text-xs">
                        <span className="truncate">{b.campusName}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 2. Exam Term Filter */}
                <Select
                  value={termFilter}
                  onValueChange={(val) => {
                    if (val) setTermFilter(val);
                  }}
                >
                  <SelectTrigger className="w-full h-9 text-xs font-medium bg-background shadow-2xs gap-2 rounded-xl border-border/80">
                    <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-muted-foreground font-normal">Term:</span>
                      <span className="font-semibold truncate">
                        {termFilter === "ALL" ? "All Terms" : termFilter}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="w-64">
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

                {/* 3. Class Filter */}
                <Select
                  value={classFilter}
                  onValueChange={(val) => {
                    if (val) setClassFilter(val);
                  }}
                >
                  <SelectTrigger className="w-full h-9 text-xs font-medium bg-background shadow-2xs gap-2 rounded-xl border-border/80">
                    <GraduationCap className="size-3.5 text-muted-foreground shrink-0" />
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-muted-foreground font-normal">Class:</span>
                      <span className="font-semibold truncate">
                        {classFilter === "ALL" ? "All Classes" : classFilter}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="w-64">
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

                {/* 4. Result Status Filter */}
                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    if (val) setStatusFilter(val);
                  }}
                >
                  <SelectTrigger className="w-full h-9 text-xs font-medium bg-background shadow-2xs gap-2 rounded-xl border-border/80">
                    <CheckCircle2 className="size-3.5 text-muted-foreground shrink-0" />
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-muted-foreground font-normal">Status:</span>
                      <span className="font-semibold truncate">
                        {statusFilter === "ALL" ? "All Statuses" : statusFilter}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="w-48">
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
              </div>
            </div>

            {/* Broadsheet Table */}
            <Table className="w-full min-w-[880px] md:table-fixed">
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="pl-5 md:w-[22%] text-xs font-semibold uppercase tracking-wider">
                    Student Details
                  </TableHead>
                  <TableHead className="md:w-[13%] text-center text-xs font-semibold uppercase tracking-wider">
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
                  <TableHead className="md:w-[12%] text-center text-xs font-semibold uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="text-right pr-6 md:w-[13%] text-xs font-semibold uppercase tracking-wider">
                    Actions
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
                          <span className="text-xs font-semibold text-foreground truncate">
                            {r.studentName}
                          </span>
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
                        />
                      </TableCell>

                      <TableCell className="text-right pr-6 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setEditingResult(r)}
                            title="Edit Student Marks"
                            className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer rounded-lg"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setViewingResult(r)}
                            title="View & Print Detailed Marks Certificate (DMC)"
                            className="size-7 text-muted-foreground hover:text-brand hover:bg-brand/10 cursor-pointer rounded-lg"
                          >
                            <Eye className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-28 text-center text-xs text-muted-foreground"
                    >
                      No student results found {branchFilter !== "ALL" ? `for ${branchFilter}` : "for the selected filters"}.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ================= SECTION 2: Student Report Cards ================= */}
        <TabsContent value="report-cards" className="space-y-4 outline-none">
          {/* Section 2 Scope Card */}
          <Card className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-xs">
            {/* Header: Title on Left, Student Count Badge & Reset on Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/70 bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <FileText className="size-4" />
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-foreground whitespace-nowrap">
                    Student Report Cards
                  </h2>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-background text-muted-foreground border border-border/80 shadow-2xs whitespace-nowrap">
                    {reportCardStudents.length} {reportCardStudents.length === 1 ? "Student" : "Students"}
                  </span>
                </div>
              </div>

              {/* Reset Scope Action */}
              {(branchFilter !== "ALL" || reportCardClassFilter !== "ALL" || reportCardTermFilter !== RESULT_TERMS[0] || reportCardSearch) && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    handleBranchChange("ALL");
                    setReportCardClassFilter("ALL");
                    setReportCardTermFilter(RESULT_TERMS[0]);
                    setReportCardSearch("");
                  }}
                  className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer rounded-xl border-border/80 hover:bg-muted/60 shrink-0 shadow-2xs self-start sm:self-auto"
                  title="Reset scope to all students"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset Scope</span>
                </Button>
              )}
            </div>

            {/* Scope Filter Grid: 3 Equal-Width Columns */}
            <div className="px-5 py-3 bg-muted/10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Branch Selector */}
                <Select
                  value={branchFilter}
                  onValueChange={(val) => {
                    if (val) handleBranchChange(val);
                  }}
                >
                  <SelectTrigger className="w-full h-9 text-xs font-medium bg-background shadow-2xs gap-2 rounded-xl border-border/80">
                    <Building2 className="size-3.5 text-brand shrink-0" />
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-muted-foreground font-normal">Branch:</span>
                      <span className="font-semibold truncate">
                        {branchFilter === "ALL" ? "All Branches" : branchFilter}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="w-64 max-h-72">
                    <SelectItem value="ALL" className="text-xs font-semibold">
                      All Branches ({branches.length} Campuses)
                    </SelectItem>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.campusName} className="text-xs">
                        <span className="truncate">{b.campusName}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 2. Class Selector */}
                <Select
                  value={reportCardClassFilter}
                  onValueChange={(val) => {
                    if (val) {
                      setReportCardClassFilter(val);
                      setReportCardSearch("");
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-9 text-xs font-medium bg-background shadow-2xs gap-2 rounded-xl border-border/80">
                    <GraduationCap className="size-3.5 text-muted-foreground shrink-0" />
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-muted-foreground font-normal">Class:</span>
                      <span className="font-semibold truncate">
                        {reportCardClassFilter === "ALL" ? "All Classes" : reportCardClassFilter}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    <SelectItem value="ALL" className="text-xs font-medium">
                      All Classes
                    </SelectItem>
                    {RESULT_CLASSES.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 3. Term Selector */}
                <Select
                  value={reportCardTermFilter}
                  onValueChange={(val) => {
                    if (val) setReportCardTermFilter(val);
                  }}
                >
                  <SelectTrigger className="w-full h-9 text-xs font-medium bg-background shadow-2xs gap-2 rounded-xl border-border/80">
                    <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-muted-foreground font-normal">Term:</span>
                      <span className="font-semibold truncate">
                        {reportCardTermFilter === "ALL" ? "All Terms" : reportCardTermFilter}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    <SelectItem value="ALL" className="text-xs font-medium">
                      All Exam Terms
                    </SelectItem>
                    {RESULT_TERMS.map((t) => (
                      <SelectItem key={t} value={t} className="text-xs">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            {/* Left Student Selector List */}
            <Card className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-xs lg:col-span-1 lg:sticky lg:top-4 flex flex-col">
              <div className="px-4 py-3 border-b border-border/70 bg-muted/20 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Select Student
                  </h3>
                  <p className="text-[10.5px] text-muted-foreground truncate">
                    {reportCardClassFilter === "ALL"
                      ? "All Classes"
                      : reportCardClassFilter
                          .replace(" (Science - Biology)", " (Bio)")
                          .replace(" (Science - Computer)", " (CS)")}
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-brand bg-brand-50 px-2 py-0.5 rounded shrink-0">
                  {reportCardStudents.length} Found
                </span>
              </div>

              <div className="p-3 border-b border-border/60">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search candidate by name, roll no…"
                    value={reportCardSearch}
                    onChange={(e) => setReportCardSearch(e.target.value)}
                    className="pl-8 h-8 text-xs bg-background/60"
                  />
                </div>
              </div>

              <div className="divide-y divide-border/60 max-h-[540px] overflow-y-auto">
                {reportCardStudents.length > 0 ? (
                  reportCardStudents.map((s) => {
                    const isSelected = activeReportCardStudent?.id === s.id;
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
                            s/o {s.fatherName}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-xs">
                            {s.percentage.toFixed(0)}%
                          </span>
                          <span
                            className={cn(
                              "block text-[10px] font-bold font-mono",
                              s.overallGrade === "A+" || s.overallGrade === "A"
                                ? "text-emerald-700 dark:text-emerald-400"
                                : s.overallGrade === "B"
                                ? "text-blue-700 dark:text-blue-400"
                                : s.overallGrade === "C"
                                ? "text-amber-700 dark:text-amber-400"
                                : "text-rose-700 dark:text-rose-400"
                            )}
                          >
                            Grade {s.overallGrade}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
                    <FileText className="size-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="font-semibold text-foreground">No Students Found</p>
                    <p className="text-[11px] text-muted-foreground">
                      No results for the selected class and examination term.
                    </p>
                  </div>
                )}
              </div>

              {/* Clean Footer Bar */}
              <div className="px-4 py-2.5 border-t border-border/70 bg-muted/20 text-[11px] text-muted-foreground flex items-center justify-between">
                <span className="font-medium text-foreground/80">
                  {reportCardStudents.length} {reportCardStudents.length === 1 ? "candidate" : "candidates"}
                </span>
                <span className="text-[10.5px] text-muted-foreground">
                  Click to view DMC
                </span>
              </div>
            </Card>

            {/* Right Report Card Preview Sheet */}
            <Card className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-xs lg:col-span-2 flex flex-col">
              {activeReportCardStudent ? (
                <>
                  <div className="px-5 py-3.5 border-b border-border/70 bg-muted/20 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Detailed Marks Certificate (DMC)
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activeReportCardStudent.studentName} ({activeReportCardStudent.rollNo})
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingResult(activeReportCardStudent)}
                        className="h-8 text-xs gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Pencil className="size-3.5" />
                        <span>Edit Marks</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setViewingResult(activeReportCardStudent)}
                        className="h-8 text-xs gap-1.5 bg-brand text-cream hover:bg-brand-600 shadow-xs cursor-pointer"
                      >
                        <Printer className="size-3.5" />
                        <span>Print Full DMC</span>
                      </Button>
                    </div>
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
                </>
              ) : (
                <div className="p-12 text-center text-xs text-muted-foreground flex-1 flex flex-col items-center justify-center space-y-2">
                  <Award className="size-12 text-muted-foreground/30 mb-1" />
                  <h4 className="font-bold text-sm text-foreground">No Student Selected</h4>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    {branchFilter !== "ALL"
                      ? `No student records found in ${branchFilter} for ${reportCardClassFilter === "ALL" ? "the selected scope" : reportCardClassFilter}.`
                      : "Select a class and choose a student from the list on the left to preview their Detailed Marks Certificate (DMC)."}
                  </p>
                </div>
              )}
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

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Branch Selector */}
                <Select
                  value={branchFilter}
                  onValueChange={(val) => {
                    if (val) handleBranchChange(val);
                  }}
                >
                  <SelectTrigger className="w-[210px] sm:w-[230px] h-9 text-xs font-semibold bg-background shadow-2xs gap-2">
                    <Building2 className="size-3.5 text-brand shrink-0" />
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-muted-foreground font-normal">Branch:</span>
                      <span className="truncate">{branchFilter === "ALL" ? "All Branches" : branchFilter}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="w-[260px] max-h-72">
                    <SelectItem value="ALL" className="text-xs font-semibold">
                      All Branches ({branches.length} Campuses)
                    </SelectItem>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.campusName} className="text-xs">
                        <span className="truncate">{b.campusName}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand font-mono self-start sm:self-auto border border-brand/20">
                  {filteredDeclarations.filter((d) => d.status === "Published").length} of{" "}
                  {filteredDeclarations.length} Published
                </span>
              </div>
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
                {filteredDeclarations.length > 0 ? (
                  filteredDeclarations.map((d) => (
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
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-28 text-center text-xs text-muted-foreground"
                  >
                    No result declarations found for {branchFilter === "ALL" ? "the selected filters" : branchFilter}.
                  </TableCell>
                </TableRow>
              )}
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
        campusLabel={branchFilter === "ALL" ? "All Campuses" : branchFilter}
      />

      <AddResultDialog
        open={isAddResultOpen}
        onOpenChange={setIsAddResultOpen}
        onAddResult={handleAddResult}
        defaultClassName={classFilter}
        defaultTermName={termFilter}
        defaultCampus={branchFilter !== "ALL" ? branchFilter : undefined}
      />

      <EditResultDialog
        open={Boolean(editingResult)}
        onOpenChange={(open) => {
          if (!open) setEditingResult(null);
        }}
        result={editingResult}
        onUpdateResult={handleUpdateResult}
      />
    </div>
  );
}
