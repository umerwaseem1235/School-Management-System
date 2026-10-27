"use client";

import * as React from "react";
import {
  FileQuestion,
  CalendarDays,
  CalendarClock,
  Search,
  Plus,
  Printer,
  BookOpen,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ShieldCheck,
  Edit3,
  Trash2,
  Save,
  RotateCcw,
  Check,
  UserCheck,
  UserX,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
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
  type TestType,
  type TestStatus,
} from "@/lib/mock/tests-assessments";
import { ScheduleTestDialog } from "./schedule-test-dialog";
import { PrintAwardListDialog } from "./print-award-list-dialog";

export default function TestsAssessmentsPage() {
  const [activeTab, setActiveTab] = React.useState<string>("tests");

  // State for all class tests
  const [tests, setTests] = React.useState<ClassTest[]>(INITIAL_CLASS_TESTS);
  const [testMarksMap, setTestMarksMap] =
    React.useState<Record<string, StudentTestMark[]>>(INITIAL_TEST_MARKS);

  // Selected test for Marks Entry / Award List
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
  const [isPrintAwardListOpen, setIsPrintAwardListOpen] = React.useState(false);
  const [printTargetTest, setPrintTargetTest] = React.useState<ClassTest | null>(
    null
  );

  // Sync activeMarks whenever selectedTestId changes
  React.useEffect(() => {
    if (selectedTestId && testMarksMap[selectedTestId]) {
      setActiveMarks(testMarksMap[selectedTestId]);
    } else if (selectedTestId) {
      const currentTest = tests.find((t) => t.id === selectedTestId);
      if (currentTest) {
        const seeded = generateMockMarksForTest(currentTest);
        setActiveMarks(seeded);
        setTestMarksMap((prev) => ({ ...prev, [selectedTestId]: seeded }));
      }
    }
  }, [selectedTestId, testMarksMap, tests]);

  // Selected test object
  const currentTest = React.useMemo(() => {
    return tests.find((t) => t.id === selectedTestId) || tests[0] || null;
  }, [tests, selectedTestId]);

  // Filtered Tests
  const filteredTests = React.useMemo(() => {
    return tests.filter((item) => {
      const q = testSearch.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        item.title.toLowerCase().includes(q) ||
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
    setSelectedTestId(newTest.id);
  };

  // Handle deleting a test
  const handleDeleteTest = (testId: string) => {
    setTests((prev) => prev.filter((t) => t.id !== testId));
    toast.success("Class test deleted successfully.");
    if (selectedTestId === testId) {
      const remaining = tests.filter((t) => t.id !== testId);
      if (remaining.length > 0) {
        setSelectedTestId(remaining[0].id);
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

  // Open award list print dialog for a specific test
  const handleOpenAwardList = (test: ClassTest) => {
    setPrintTargetTest(test);
    setIsPrintAwardListOpen(true);
  };

  // Switch to marks tab for a specific test
  const handleNavigateToMarks = (testId: string) => {
    setSelectedTestId(testId);
    setActiveTab("marks");
  };

  // Summary statistics for currently selected test in Marks Tab
  const selectedTestStats = React.useMemo(() => {
    if (!currentTest || activeMarks.length === 0) return null;
    const total = activeMarks.length;
    const absent = activeMarks.filter((m) => m.isAbsent).length;
    const appeared = total - absent;
    const passed = activeMarks.filter(
      (m) => !m.isAbsent && m.status === "Pass"
    ).length;
    const failed = activeMarks.filter(
      (m) => !m.isAbsent && m.status === "Fail"
    ).length;
    const passPct =
      appeared > 0 ? ((passed / appeared) * 100).toFixed(1) : "0.0";
    const highest =
      appeared > 0
        ? Math.max(
            ...activeMarks.filter((m) => !m.isAbsent).map((m) => m.obtainedMarks)
          )
        : 0;
    const average =
      appeared > 0
        ? (
            activeMarks
              .filter((m) => !m.isAbsent)
              .reduce((acc, m) => acc + m.obtainedMarks, 0) / appeared
          ).toFixed(1)
        : "0";

    return {
      total,
      absent,
      appeared,
      passed,
      failed,
      passPct,
      highest,
      average,
    };
  }, [currentTest, activeMarks]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Tests & Assessments
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Continuous classroom tests, weekly assessments, and monthly evaluation register
          </p>
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
            size="sm"
            onClick={() => setIsScheduleOpen(true)}
            className="bg-brand text-brand-foreground hover:bg-brand/90 text-xs h-9 gap-1.5 shadow-xs"
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
        <TabsList className="bg-muted/70 p-1 rounded-xl h-auto border border-border/60">
          <TabsTrigger value="tests" className="rounded-lg text-xs font-medium px-4">
            <FileText className="size-3.5 mr-2" />
            Test Records ({tests.length})
          </TabsTrigger>
          <TabsTrigger value="marks" className="rounded-lg text-xs font-medium px-4">
            <Edit3 className="size-3.5 mr-2" />
            Marks Entry & Award List
          </TabsTrigger>
          <TabsTrigger value="routine" className="rounded-lg text-xs font-medium px-4">
            <CalendarDays className="size-3.5 mr-2" />
            Weekly Test Routine
          </TabsTrigger>
        </TabsList>

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/60 bg-muted/10">
              {/* Search */}
              <div className="relative w-full md:w-72 shrink-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search subject, title, chapter..."
                  value={testSearch}
                  onChange={(e) => setTestSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              {/* Dropdown Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Class Filter */}
                <Select
                  value={selectedClassFilter}
                  onValueChange={(val) => {
                    if (val) setSelectedClassFilter(val);
                  }}
                >
                  <SelectTrigger className="w-[160px] h-9 text-xs">
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
                  <SelectTrigger className="w-[150px] h-9 text-xs">
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
                  <SelectTrigger className="w-[130px] h-9 text-xs">
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
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-muted/30">
                    <TableHead className="w-12 text-center text-xs font-semibold">
                      #
                    </TableHead>
                    <TableHead className="w-28 text-xs font-semibold">
                      Date
                    </TableHead>
                    <TableHead className="w-44 text-xs font-semibold">
                      Class & Sec
                    </TableHead>
                    <TableHead className="w-36 text-xs font-semibold">
                      Subject
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Test Title & Syllabus
                    </TableHead>
                    <TableHead className="w-28 text-center text-xs font-semibold">
                      Marks
                    </TableHead>
                    <TableHead className="w-36 text-xs font-semibold">
                      Teacher
                    </TableHead>
                    <TableHead className="w-24 text-center text-xs font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="w-32 text-right text-xs font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTests.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="py-12 text-center text-xs text-muted-foreground"
                      >
                        No class tests found matching the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTests.map((t, idx) => (
                      <TableRow key={t.id} className="text-xs hover:bg-muted/30">
                        <TableCell className="text-center font-mono font-medium text-muted-foreground">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                          {formatDate(t.testDate)}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-foreground block">
                            {t.className}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Sec: {t.section}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-foreground block">
                            {t.subject}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                            {t.subjectCode}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 rounded font-medium ${
                                  t.testType === "Monthly Assessment"
                                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                                    : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30"
                                }`}
                              >
                                {t.testType}
                              </Badge>
                              <span className="font-semibold text-foreground">
                                {t.title}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {t.chapterOrTopic}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          <span className="font-bold text-foreground">
                            {t.totalMarks}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            Pass: {t.passingMarks}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {t.teacherName}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              t.status === "Graded"
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                                : "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30"
                            }`}
                          >
                            {t.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigateToMarks(t.id)}
                              className="h-7 px-2 text-[11px] text-brand hover:text-brand hover:bg-brand-soft"
                              title="Enter / View Marks"
                            >
                              <Edit3 className="size-3 mr-1" />
                              Marks
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenAwardList(t)}
                              className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                              title="Print Award List"
                            >
                              <Printer className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTest(t.id)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              title="Delete Test"
                            >
                              <Trash2 className="size-3" />
                            </Button>
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
            {/* Header & Test Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/70 bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand shrink-0">
                  <Edit3 className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Class Marks Evaluation & Award List
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Enter student scores and generate official Pakistani BISE format award list
                  </p>
                </div>
              </div>

              {/* Test Selector Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Selected Test:
                </span>
                <Select
                  value={selectedTestId}
                  onValueChange={(val) => {
                    if (val) setSelectedTestId(val);
                  }}
                >
                  <SelectTrigger className="w-[280px] sm:w-[320px] h-9 text-xs">
                    <SelectValue placeholder="Select test to grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {tests.map((t) => (
                      <SelectItem key={t.id} value={t.id} className="text-xs">
                        {t.subject} ({t.className}) — {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {currentTest && (
              <>
                {/* Active Test Metadata Ribbon */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-muted/10 border-b border-border/60 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                      Class & Section
                    </span>
                    <span className="font-semibold text-foreground">
                      {currentTest.className} (Sec: {currentTest.section})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                      Subject
                    </span>
                    <span className="font-semibold text-foreground">
                      {currentTest.subject} ({currentTest.subjectCode})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                      Date & Max Marks
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatDate(currentTest.testDate)} · Total: {currentTest.totalMarks} (Pass: {currentTest.passingMarks})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                      Teacher Incharge
                    </span>
                    <span className="font-semibold text-foreground">
                      {currentTest.teacherName}
                    </span>
                  </div>
                </div>

                {/* Score Stats Strip */}
                {selectedTestStats && (
                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-muted/30 border-b border-border/60 text-xs">
                    <div className="flex flex-wrap items-center gap-4">
                      <span>
                        Enrolled: <strong className="font-mono">{selectedTestStats.total}</strong>
                      </span>
                      <span>
                        Appeared: <strong className="font-mono">{selectedTestStats.appeared}</strong>
                      </span>
                      <span>
                        Passed:{" "}
                        <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                          {selectedTestStats.passed}
                        </strong>
                      </span>
                      <span>
                        Failed:{" "}
                        <strong className="text-rose-600 dark:text-rose-400 font-mono">
                          {selectedTestStats.failed}
                        </strong>
                      </span>
                      <span>
                        Absent:{" "}
                        <strong className="text-muted-foreground font-mono">
                          {selectedTestStats.absent}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span>
                        Pass Rate:{" "}
                        <strong className="text-foreground font-mono">
                          {selectedTestStats.passPct}%
                        </strong>
                      </span>
                      <span>
                        Avg:{" "}
                        <strong className="text-foreground font-mono">
                          {selectedTestStats.average}/{currentTest.totalMarks}
                        </strong>
                      </span>
                      <span>
                        Highest:{" "}
                        <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                          {selectedTestStats.highest}/{currentTest.totalMarks}
                        </strong>
                      </span>
                    </div>
                  </div>
                )}

                {/* Student Search & Action Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-border/60">
                  <div className="relative w-full sm:w-72">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search student by roll# or name..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="pl-9 h-8 text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAwardList(currentTest)}
                      className="text-xs h-8 gap-1.5 shadow-xs"
                    >
                      <Printer className="size-3.5" />
                      <span>Print Award List</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveMarks}
                      className="bg-brand text-brand-foreground hover:bg-brand/90 text-xs h-8 gap-1.5 shadow-xs"
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
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Weekly Classroom Testing Timetable
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Mandatory weekly assessment schedule for Middle & Secondary wings
                  </p>
                </div>
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
                      <div>
                        <h3 className="font-bold text-sm text-foreground">
                          {day.day}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          {day.focus}
                        </p>
                      </div>
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

              {/* Assessment Guidelines Notice */}
              <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-brand" />
                  Pakistani Academic Assessment Regulations
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-5">
                  <li>
                    <strong>Evaluation Deadline:</strong> Subject teachers must mark tests and upload marks within <strong>48 hours</strong> of conduction.
                  </li>
                  <li>
                    <strong>Passing Benchmark:</strong> Minimum passing mark is <strong>33%</strong> as per Federal and Punjab Board regulations.
                  </li>
                  <li>
                    <strong>Remedial Policy:</strong> Students scoring Grade F (under 33%) are required to attend zero period revision and sit for re-evaluation on Saturday.
                  </li>
                  <li>
                    <strong>Terminal Weightage:</strong> Monthly assessments and weekly tests contribute <strong>20% continuous evaluation marks</strong> toward terminal and mid-term examination report cards.
                  </li>
                </ul>
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
