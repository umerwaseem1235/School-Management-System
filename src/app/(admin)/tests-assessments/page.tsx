"use client";

import * as React from "react";
import {
  FileQuestion,
  CalendarDays,
  CalendarClock,
  Search,
  Plus,
  Printer,
  GraduationCap,
  FileText,
  ShieldCheck,
  Edit3,
  Trash2,
  Save,
  Eye,
  ChevronDown,
  Check,
} from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ActionIconButton } from "@/components/shared/action-icon-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import {
  INITIAL_CLASS_TESTS,
  INITIAL_TEST_MARKS,
  WEEKLY_TEST_ROUTINE,
  PAKISTANI_TEST_CLASSES,
  calculatePakistaniGrade,
  generateMockMarksForTest,
  type ClassTest,
  type StudentTestMark,
} from "@/lib/mock/tests-assessments";
import { ScheduleTestDialog } from "./schedule-test-dialog";
import { PrintAwardListDialog } from "./print-award-list-dialog";
import { ViewTestDialog } from "./view-test-dialog";

export default function TestsAssessmentsPage() {
  const [activeTab, setActiveTab] = React.useState<string>("tests");

  // State for all class tests
  const [tests, setTests] = React.useState<ClassTest[]>(INITIAL_CLASS_TESTS);
  const [testMarksMap, setTestMarksMap] =
    React.useState<Record<string, StudentTestMark[]>>(INITIAL_TEST_MARKS);

  // Selected test for Marks Entry / Award List
  const [marksClassFilter, setMarksClassFilter] = React.useState<string>(
    INITIAL_CLASS_TESTS[0]?.className || PAKISTANI_TEST_CLASSES[0]
  );
  const [marksTestTypeFilter, setMarksTestTypeFilter] = React.useState<string>(
    INITIAL_CLASS_TESTS[0]?.testType || "Weekly Test"
  );
  const [selectedTestId, setSelectedTestId] = React.useState<string>(
    INITIAL_CLASS_TESTS[0]?.id || ""
  );

  // Active marks state being edited
  const [activeMarks, setActiveMarks] = React.useState<StudentTestMark[]>(
    INITIAL_TEST_MARKS[INITIAL_CLASS_TESTS[0]?.id] || []
  );

  // Filters for Tests Tab
  const [testSearch, setTestSearch] = React.useState("");
  const [selectedClassFilter, setSelectedClassFilter] =
    React.useState<string>("ALL");
  const [selectedTypeFilter, setSelectedTypeFilter] =
    React.useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] =
    React.useState<string>("ALL");

  // Search filter for Student Marks Entry
  const [studentSearch, setStudentSearch] = React.useState("");

  // Dialog states
  const [isScheduleOpen, setIsScheduleOpen] = React.useState(false);
  const [isViewTestOpen, setIsViewTestOpen] = React.useState(false);
  const [viewTargetTest, setViewTargetTest] = React.useState<ClassTest | null>(
    null
  );
  const [isPrintAwardListOpen, setIsPrintAwardListOpen] = React.useState(false);
  const [printTargetTest, setPrintTargetTest] = React.useState<ClassTest | null>(
    null
  );

  // Sync activeMarks whenever selectedTestId changes
  React.useEffect(() => {
    if (!selectedTestId) {
      setActiveMarks([]);
      return;
    }
    if (testMarksMap[selectedTestId]) {
      setActiveMarks(testMarksMap[selectedTestId]);
    } else {
      const currentTestItem = tests.find((t) => t.id === selectedTestId);
      if (currentTestItem) {
        const seeded = generateMockMarksForTest(currentTestItem);
        setActiveMarks(seeded);
        setTestMarksMap((prev) => ({ ...prev, [selectedTestId]: seeded }));
      }
    }
  }, [selectedTestId, testMarksMap, tests]);

  // Selected test object matching the selected Class & Test Type
  const currentTest = React.useMemo(() => {
    if (!selectedTestId) return null;
    return tests.find((t) => t.id === selectedTestId) || null;
  }, [tests, selectedTestId]);

  const marksClassOptions = React.useMemo(() => {
    const set = new Set<string>(PAKISTANI_TEST_CLASSES);
    tests.forEach((t) => set.add(t.className));
    return Array.from(set);
  }, [tests]);

  const handleMarksClassChange = (newClass: string | null) => {
    if (!newClass) return;
    setMarksClassFilter(newClass);
    const exactMatch = tests.find(
      (t) => t.className === newClass && t.testType === marksTestTypeFilter
    );
    if (exactMatch) {
      setSelectedTestId(exactMatch.id);
      return;
    }
    const firstForClass = tests.find((t) => t.className === newClass);
    if (firstForClass) {
      setMarksTestTypeFilter(firstForClass.testType);
      setSelectedTestId(firstForClass.id);
    } else {
      setSelectedTestId("");
    }
  };

  const handleMarksTypeChange = (newType: string | null) => {
    if (!newType) return;
    setMarksTestTypeFilter(newType);
    const match = tests.find(
      (t) => t.className === marksClassFilter && t.testType === newType
    );
    setSelectedTestId(match ? match.id : "");
  };

  // Filtered Tests
  const filteredTests = React.useMemo(() => {
    return tests.filter((item) => {
      const q = testSearch.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        item.title.toLowerCase().includes(q) ||
        item.testType.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.chapterOrTopic.toLowerCase().includes(q) ||
        item.teacherName.toLowerCase().includes(q);

      const matchesClass =
        selectedClassFilter === "ALL" || item.className === selectedClassFilter;

      const matchesType =
        selectedTypeFilter === "ALL" || item.testType === selectedTypeFilter;

      const matchesStatus =
        selectedStatusFilter === "ALL" || item.status === selectedStatusFilter;

      return matchesSearch && matchesClass && matchesType && matchesStatus;
    });
  }, [
    tests,
    testSearch,
    selectedClassFilter,
    selectedTypeFilter,
    selectedStatusFilter,
  ]);

  // Filtered Students in Marks Entry tab
  const filteredStudentMarks = React.useMemo(() => {
    return activeMarks.filter((m) => {
      const q = studentSearch.toLowerCase().trim();
      return (
        q === "" ||
        m.rollNo.toLowerCase().includes(q) ||
        m.studentName.toLowerCase().includes(q) ||
        m.fatherName.toLowerCase().includes(q)
      );
    });
  }, [activeMarks, studentSearch]);

  // Module portions for dropdown selector
  const sections = React.useMemo(
    () => [
      {
        id: "tests",
        label: "Test Records",
        icon: FileText,
      },
      {
        id: "marks",
        label: "Marks Entry & Award List",
        icon: Edit3,
      },
      {
        id: "routine",
        label: "Weekly Test Routine",
        icon: CalendarDays,
      },
    ],
    []
  );

  const activeSectionObj =
    sections.find((s) => s.id === activeTab) || sections[0];

  // Overall statistics for Top KPI Cards
  const stats = React.useMemo(() => {
    const totalCount = tests.length;
    const scheduledCount = tests.filter((t) => t.status === "Scheduled").length;
    const gradedCount = tests.filter((t) => t.status === "Graded").length;

    // Calculate overall average pass rate from graded tests
    let totalAppeared = 0;
    let totalPassed = 0;

    Object.values(testMarksMap).forEach((marksList) => {
      marksList.forEach((m) => {
        if (!m.isAbsent) {
          totalAppeared++;
          if (m.status === "Pass") totalPassed++;
        }
      });
    });

    const passRate =
      totalAppeared > 0
        ? `${((totalPassed / totalAppeared) * 100).toFixed(1)}%`
        : "88.5%";

    return {
      totalCount,
      scheduledCount,
      gradedCount,
      passRate,
    };
  }, [tests, testMarksMap]);

  // Handle adding a new test
  const handleAddTest = (newTest: ClassTest) => {
    setTests((prev) => [newTest, ...prev]);
    const seededMarks = generateMockMarksForTest(newTest);
    setTestMarksMap((prev) => ({ ...prev, [newTest.id]: seededMarks }));
    setMarksClassFilter(newTest.className);
    setMarksTestTypeFilter(newTest.testType);
    setSelectedTestId(newTest.id);
  };

  // Handle deleting a test
  const handleDeleteTest = (testId: string) => {
    setTests((prev) => prev.filter((t) => t.id !== testId));
    toast.success("Class test deleted successfully.");
    if (selectedTestId === testId) {
      const remaining = tests.filter((t) => t.id !== testId);
      if (remaining.length > 0) {
        setMarksClassFilter(remaining[0].className);
        setMarksTestTypeFilter(remaining[0].testType);
        setSelectedTestId(remaining[0].id);
      } else {
        setSelectedTestId("");
      }
    }
  };

  // Handle editing a mark for a student
  const handleMarkChange = (studentId: string, value: string) => {
    if (!currentTest) return;
    const numeric = value === "" ? 0 : Number(value);
    const valid = Math.min(Math.max(0, numeric), currentTest.totalMarks);

    setActiveMarks((prev) =>
      prev.map((m) => {
        if (m.studentId === studentId) {
          const pct = Number(
            ((valid / currentTest.totalMarks) * 100).toFixed(1)
          );
          const gradeObj = calculatePakistaniGrade(pct, false);
          return {
            ...m,
            obtainedMarks: valid,
            isAbsent: false,
            percentage: pct,
            grade: gradeObj.grade,
            status: gradeObj.status,
          };
        }
        return m;
      })
    );
  };

  // Toggle student absent status
  const handleToggleAbsent = (studentId: string) => {
    if (!currentTest) return;
    setActiveMarks((prev) =>
      prev.map((m) => {
        if (m.studentId === studentId) {
          const newAbsent = !m.isAbsent;
          const marks = newAbsent ? 0 : m.obtainedMarks || 0;
          const pct = newAbsent
            ? 0
            : Number(((marks / currentTest.totalMarks) * 100).toFixed(1));
          const gradeObj = calculatePakistaniGrade(pct, newAbsent);
          return {
            ...m,
            isAbsent: newAbsent,
            obtainedMarks: marks,
            percentage: pct,
            grade: gradeObj.grade,
            status: gradeObj.status,
            remarks: newAbsent ? "Absent from Assessment" : "Present in Class",
          };
        }
        return m;
      })
    );
  };

  // Save marks to state
  const handleSaveMarks = () => {
    if (!selectedTestId) return;
    setTestMarksMap((prev) => ({
      ...prev,
      [selectedTestId]: activeMarks,
    }));
    // Mark test as Graded
    setTests((prev) =>
      prev.map((t) =>
        t.id === selectedTestId ? { ...t, status: "Graded" } : t
      )
    );
    toast.success("Marks saved and award list updated successfully!");
  };

  // Open test details view dialog
  const handleViewTest = (test: ClassTest) => {
    setViewTargetTest(test);
    setIsViewTestOpen(true);
  };

  // Open award list print dialog for a specific test
  const handleOpenAwardList = (test: ClassTest) => {
    setPrintTargetTest(test);
    setIsPrintAwardListOpen(true);
  };

  // Switch to marks tab for a specific test
  const handleNavigateToMarks = (testId: string) => {
    const target = tests.find((t) => t.id === testId);
    if (target) {
      setMarksClassFilter(target.className);
      setMarksTestTypeFilter(target.testType);
    }
    setSelectedTestId(testId);
    setActiveTab("marks");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold tracking-tight text-foreground sm:text-lg md:text-[19px]">
            Tests & Assessments
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {currentTest && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenAwardList(currentTest)}
              className="text-xs h-9 gap-1.5 shadow-xs"
            >
              <Printer className="size-3.5" />
              <span>Print Award List</span>
            </Button>
          )}

          <Button
            size="lg"
            onClick={() => setIsScheduleOpen(true)}
            className="gap-1.5 cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Schedule Test</span>
          </Button>
        </div>
      </div>

      {/* Top KPI Stat Cards */}
      <StatGrid className="max-w-none">
        <StatCard
          label="Total Tests Recorded"
          value={`${stats.totalCount} Tests`}
          icon={FileQuestion}
        />
        <StatCard
          label="Upcoming / Scheduled"
          value={`${stats.scheduledCount} Scheduled`}
          icon={CalendarClock}
        />
        <StatCard
          label="Institutional Pass Rate"
          value={stats.passRate}
          icon={ShieldCheck}
        />
        <StatCard
          label="Passing Benchmark"
          value="Min. 33% Marks"
          icon={GraduationCap}
        />
      </StatGrid>

      {/* Main Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Module Dropdown Selector Bar */}
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
                className="w-60 p-1 rounded-xl shadow-lg border-border/80"
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

        {/* ================= TAB 1: Test Records & Schedule ================= */}
        <TabsContent value="tests" className="space-y-4 outline-none">
          <Card className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-xs">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/70 bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand shrink-0">
                  <FileText className="size-4" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                  Class Assessment Register
                </h2>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand font-mono self-start sm:self-auto">
                {filteredTests.length} {filteredTests.length === 1 ? "Test" : "Tests"}
              </span>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-3.5 border-b border-border/60">
              {/* Search */}
              <div className="relative w-full md:w-72 shrink-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search test title or subject…"
                  value={testSearch}
                  onChange={(e) => setTestSearch(e.target.value)}
                  className="pl-9 h-9 text-xs bg-background/60"
                />
              </div>

              {/* Dropdown Filters */}
              <div className="flex flex-wrap items-center gap-2 md:ml-auto">
                {/* Class Filter */}
                <Select
                  value={selectedClassFilter}
                  onValueChange={(val) => {
                    if (val) setSelectedClassFilter(val);
                  }}
                >
                  <SelectTrigger className="w-[175px] h-9 text-xs font-medium">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" className="text-xs">
                      All Classes
                    </SelectItem>
                    {PAKISTANI_TEST_CLASSES.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Type Filter */}
                <Select
                  value={selectedTypeFilter}
                  onValueChange={(val) => {
                    if (val) setSelectedTypeFilter(val);
                  }}
                >
                  <SelectTrigger className="w-[155px] h-9 text-xs font-medium">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" className="text-xs">
                      All Types
                    </SelectItem>
                    <SelectItem value="Weekly Test" className="text-xs">
                      Weekly Test
                    </SelectItem>
                    <SelectItem value="Monthly Assessment" className="text-xs">
                      Monthly Assessment
                    </SelectItem>
                    <SelectItem value="Chapter Test" className="text-xs">
                      Chapter Test
                    </SelectItem>
                    <SelectItem value="Class Quiz" className="text-xs">
                      Class Quiz
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                  value={selectedStatusFilter}
                  onValueChange={(val) => {
                    if (val) setSelectedStatusFilter(val);
                  }}
                >
                  <SelectTrigger className="w-[130px] h-9 text-xs font-medium">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" className="text-xs">
                      All Status
                    </SelectItem>
                    <SelectItem value="Graded" className="text-xs">
                      Graded
                    </SelectItem>
                    <SelectItem value="Scheduled" className="text-xs">
                      Scheduled
                    </SelectItem>
                  </SelectContent>
                </Select>

                {(testSearch ||
                  selectedClassFilter !== "ALL" ||
                  selectedTypeFilter !== "ALL" ||
                  selectedStatusFilter !== "ALL") && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setTestSearch("");
                      setSelectedClassFilter("ALL");
                      setSelectedTypeFilter("ALL");
                      setSelectedStatusFilter("ALL");
                    }}
                    className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Clean Assessment Register Table */}
            <div className="w-full overflow-hidden">
              <Table className="w-full md:table-fixed text-sm">
                <TableHeader>
                  <TableRow className="bg-muted/60 border-b border-border/70 hover:bg-muted/60">
                    <TableHead className="font-semibold text-xs text-foreground px-4 py-3 text-left md:w-[19%]">
                      Assessment
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-3 py-3 text-center md:w-[21%]">
                      Class
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-3 py-3 text-center md:w-[15%]">
                      Subject
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-2 py-3 text-center md:w-[14%]">
                      Date
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-2 py-3 text-center md:w-[8%]">
                      Marks
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-1.5 py-3 text-center md:w-[12%]">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-3 py-3 text-center md:w-[11%]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTests.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-12 text-center text-xs text-muted-foreground"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FileText className="size-8 text-muted-foreground/50" />
                          <p className="font-medium text-sm text-foreground">
                            No class tests found
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Try adjusting your filters or schedule a new class test.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTests.map((t) => (
                      <TableRow
                        key={t.id}
                        className="hover:bg-muted/30 transition-colors border-b border-border/60"
                      >
                        {/* Assessment (concise type only; full title & syllabus in View icon) */}
                        <TableCell className="px-4 py-3.5 text-left whitespace-normal">
                          <button
                            type="button"
                            onClick={() => handleViewTest(t)}
                            className="font-semibold text-foreground text-xs leading-snug hover:text-brand transition-colors cursor-pointer text-left"
                            title="View full test details"
                          >
                            {t.testType}
                          </button>
                        </TableCell>

                        {/* Class */}
                        <TableCell className="text-xs px-3 py-3.5 text-center font-medium text-foreground whitespace-normal">
                          {t.className}
                        </TableCell>

                        {/* Subject */}
                        <TableCell className="text-xs px-3 py-3.5 text-center font-medium text-foreground whitespace-normal">
                          {t.subject}
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-xs px-2 py-3.5 text-center text-muted-foreground whitespace-nowrap font-medium">
                          {formatDate(t.testDate)}
                        </TableCell>

                        {/* Total Marks */}
                        <TableCell className="text-xs px-2 py-3.5 text-center font-mono font-semibold text-foreground">
                          {t.totalMarks}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-xs px-2 py-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <StatusBadge
                              status={t.status}
                              tone={t.status === "Graded" ? "success" : "info"}
                              dot={false}
                            />
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="px-3 py-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <ActionIconButton
                              tone="view"
                              onClick={() => handleViewTest(t)}
                              aria-label={`View ${t.title}`}
                              title="View full test details"
                            >
                              <Eye />
                            </ActionIconButton>
                            <ActionIconButton
                              tone="delete"
                              onClick={() => handleDeleteTest(t.id)}
                              aria-label={`Delete ${t.title}`}
                              title="Delete Test"
                            >
                              <Trash2 />
                            </ActionIconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* ================= TAB 2: Marks Entry & Award List ================= */}
        <TabsContent value="marks" className="space-y-4 outline-none">
          <Card className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-xs">
            {/* Header & Two Simple Selectors: Class + Test Type */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/70 bg-muted/20">
              <h2 className="text-sm font-semibold text-foreground">
                Class Marks Evaluation & Award List
              </h2>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {/* 1. Select Class */}
                <Select
                  value={marksClassFilter}
                  onValueChange={handleMarksClassChange}
                >
                  <SelectTrigger className="w-full sm:w-56 h-9 text-xs bg-background">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {marksClassOptions.map((cls) => (
                      <SelectItem key={cls} value={cls} className="text-xs">
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 2. Select Test Type */}
                <Select
                  value={marksTestTypeFilter}
                  onValueChange={handleMarksTypeChange}
                >
                  <SelectTrigger className="w-full sm:w-44 h-9 text-xs bg-background">
                    <SelectValue placeholder="Select Test Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Weekly Test" className="text-xs">
                      Weekly Test
                    </SelectItem>
                    <SelectItem value="Monthly Assessment" className="text-xs">
                      Monthly Assessment
                    </SelectItem>
                    <SelectItem value="Chapter Test" className="text-xs">
                      Chapter Test
                    </SelectItem>
                    <SelectItem value="Class Quiz" className="text-xs">
                      Class Quiz
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {currentTest ? (
              <>
                {/* Student Search & Action Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/60">
                  <div className="relative w-full sm:w-72">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search students…"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="pl-9 h-9 text-xs bg-background/60"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAwardList(currentTest)}
                      className="text-xs h-9 gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Printer className="size-3.5" />
                      <span>Print Award List</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveMarks}
                      className="h-9 gap-1.5 cursor-pointer"
                    >
                      <Save className="size-3.5" />
                      <span>Save Marks</span>
                    </Button>
                  </div>
                </div>

                {/* Marks Entry Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent bg-muted/30">
                        <TableHead className="w-14 text-center text-xs font-semibold">
                          Roll#
                        </TableHead>
                        <TableHead className="w-48 text-xs font-semibold">
                          Student Name
                        </TableHead>
                        <TableHead className="w-40 text-xs font-semibold">
                          Father Name
                        </TableHead>
                        <TableHead className="w-20 text-center text-xs font-semibold">
                          Total
                        </TableHead>
                        <TableHead className="w-32 text-center text-xs font-semibold">
                          Obtained Marks
                        </TableHead>
                        <TableHead className="w-20 text-center text-xs font-semibold">
                          Absent?
                        </TableHead>
                        <TableHead className="w-20 text-center text-xs font-semibold">
                          %
                        </TableHead>
                        <TableHead className="w-20 text-center text-xs font-semibold">
                          Grade
                        </TableHead>
                        <TableHead className="w-24 text-center text-xs font-semibold">
                          Status
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Teacher Remarks
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudentMarks.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={10}
                            className="py-10 text-center text-xs text-muted-foreground"
                          >
                            No students found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStudentMarks.map((m) => (
                          <TableRow
                            key={m.id}
                            className={`text-xs hover:bg-muted/20 ${
                              m.isAbsent ? "bg-muted/10 opacity-70" : ""
                            }`}
                          >
                            <TableCell className="text-center font-mono font-bold">
                              {m.rollNo}
                            </TableCell>
                            <TableCell className="font-semibold text-foreground">
                              {m.studentName}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {m.fatherName}
                            </TableCell>
                            <TableCell className="text-center font-mono text-muted-foreground">
                              {currentTest.totalMarks}
                            </TableCell>
                            <TableCell className="text-center">
                              {m.isAbsent ? (
                                <span className="font-mono text-xs font-bold text-muted-foreground px-3 py-1 rounded bg-muted">
                                  ABS
                                </span>
                              ) : (
                                <Input
                                  type="number"
                                  min="0"
                                  max={currentTest.totalMarks}
                                  value={m.obtainedMarks}
                                  onChange={(e) =>
                                    handleMarkChange(m.studentId, e.target.value)
                                  }
                                  className="w-20 h-7 mx-auto text-center font-mono text-xs font-bold"
                                />
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleAbsent(m.studentId)}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                                  m.isAbsent
                                    ? "bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-400"
                                    : "bg-muted text-muted-foreground border-border/80 hover:bg-muted/80"
                                }`}
                              >
                                {m.isAbsent ? "ABSENT" : "Mark ABS"}
                              </button>
                            </TableCell>
                            <TableCell className="text-center font-mono font-medium">
                              {m.isAbsent ? "—" : `${m.percentage}%`}
                            </TableCell>
                            <TableCell className="text-center font-mono font-bold">
                              {m.isAbsent ? (
                                <span className="text-muted-foreground">ABS</span>
                              ) : (
                                <span
                                  className={
                                    m.grade === "A+" || m.grade === "A"
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : m.grade === "F"
                                      ? "text-rose-600 dark:text-rose-400"
                                      : "text-foreground"
                                  }
                                >
                                  {m.grade}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {m.isAbsent ? (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-2 py-0 rounded font-medium bg-muted text-muted-foreground border-border/80"
                                >
                                  Absent
                                </Badge>
                              ) : m.status === "Pass" ? (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-2 py-0 rounded font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                                >
                                  Pass
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-2 py-0 rounded font-medium bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30"
                                >
                                  Fail
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-[11px]">
                              {m.remarks}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="py-12 px-5 text-center space-y-3">
                <p className="text-xs text-muted-foreground">
                  No {marksTestTypeFilter} record found for {marksClassFilter}.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsScheduleOpen(true)}
                  className="h-8 text-xs gap-1.5 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Schedule Test</span>
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ================= TAB 3: Weekly Test Routine ================= */}
        <TabsContent value="routine" className="space-y-4 outline-none">
          <Card className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-xs">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/70 bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand shrink-0">
                  <CalendarDays className="size-4" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                  Weekly Classroom Testing Timetable
                </h2>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand font-mono">
                Academic Session 2026–27
              </span>
            </div>

            {/* Daily Grid */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {WEEKLY_TEST_ROUTINE.map((day) => (
                  <div
                    key={day.day}
                    className="border border-border/80 rounded-xl p-4 bg-muted/10 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <h3 className="font-bold text-sm text-foreground">
                        {day.day}
                      </h3>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {day.periods.length} Tests
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {day.periods.map((p, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg border border-border/60 bg-card space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">
                              {p.subject}
                            </span>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-brand-50 text-brand font-semibold">
                              {p.marks} Marks
                            </span>
                          </div>
                          <div className="text-muted-foreground text-[11px]">
                            {p.className}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                            <span>{p.timing}</span>
                            <span>{p.teacher}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Test Dialog */}
      <ScheduleTestDialog
        open={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
        onAddTest={handleAddTest}
      />

      {/* View Test Details Dialog */}
      <ViewTestDialog
        open={isViewTestOpen}
        onOpenChange={setIsViewTestOpen}
        test={
          viewTargetTest
            ? tests.find((t) => t.id === viewTargetTest.id) || viewTargetTest
            : null
        }
        marks={viewTargetTest ? testMarksMap[viewTargetTest.id] || [] : []}
        onOpenMarks={handleNavigateToMarks}
        onPrintAwardList={handleOpenAwardList}
      />

      {/* Print Award List Dialog */}
      <PrintAwardListDialog
        open={isPrintAwardListOpen}
        onOpenChange={setIsPrintAwardListOpen}
        test={printTargetTest}
        marks={printTargetTest ? testMarksMap[printTargetTest.id] || [] : []}
      />
    </div>
  );
}
