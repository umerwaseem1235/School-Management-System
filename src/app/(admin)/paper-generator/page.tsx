"use client";

import * as React from "react";
import {
  FileStack,
  FilePlus2,
  Database,
  CheckCircle2,
  BookOpen,
  Search,
  Plus,
  Printer,
  Eye,
  Trash2,
  ChevronDown,
  Check,
  Wand2,
  Save,
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
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { CAMPUSES } from "@/lib/mock/institution";
import { toast } from "sonner";
import {
  INITIAL_QUESTION_BANK,
  INITIAL_GENERATED_PAPERS,
  PAPER_CLASSES,
  PAPER_SUBJECTS,
  PAPER_EXAM_TERMS,
  PAPER_DURATIONS,
  PAPER_TEACHERS,
  computePaperBreakdown,
  type QuestionBankItem,
  type GeneratedPaper,
  type PaperStatus,
  type QuestionType,
} from "@/lib/mock/paper-generator";
import { AddQuestionDialog } from "./add-question-dialog";
import { ViewQuestionDialog } from "./view-question-dialog";
import { PrintPaperDialog } from "./print-paper-dialog";

export default function PaperGeneratorPage() {
  const [activeTab, setActiveTab] = React.useState("papers");
  const [questionBank, setQuestionBank] = React.useState<QuestionBankItem[]>(
    INITIAL_QUESTION_BANK
  );
  const [papers, setPapers] = React.useState<GeneratedPaper[]>(
    INITIAL_GENERATED_PAPERS
  );
  const [todayIso, setTodayIso] = React.useState("2026-10-29");

  React.useEffect(() => {
    setTodayIso(new Date().toISOString().split("T")[0]);
  }, []);

  // Section 1: Exam Papers filters
  const [paperSearch, setPaperSearch] = React.useState("");
  const [paperClassFilter, setPaperClassFilter] = React.useState("ALL");
  const [paperSubjectFilter, setPaperSubjectFilter] = React.useState("ALL");
  const [paperStatusFilter, setPaperStatusFilter] = React.useState("ALL");

  // Section 2: Create Paper composer state
  const [composerTitle, setComposerTitle] = React.useState(
    "Class 9 Physics — Term Assessment Paper"
  );
  const [composerTerm, setComposerTerm] = React.useState(PAPER_EXAM_TERMS[0]);
  const [composerClass, setComposerClass] = React.useState("Class 9");
  const [composerSubject, setComposerSubject] = React.useState("Physics");
  const [composerDuration, setComposerDuration] = React.useState("2 Hours");
  const [composerCampus, setComposerCampus] = React.useState(
    CAMPUSES[0]?.campusName || "Main Campus — Gulberg"
  );
  const [composerTeacher, setComposerTeacher] = React.useState(
    PAPER_TEACHERS[0]
  );
  const [selectedQuestionIds, setSelectedQuestionIds] = React.useState<
    string[]
  >([
    "qb-phy9-1",
    "qb-phy9-2",
    "qb-phy9-3",
    "qb-phy9-4",
    "qb-phy9-7",
    "qb-phy9-8",
    "qb-phy9-9",
    "qb-phy9-12",
  ]);
  const [composerTypeFilter, setComposerTypeFilter] = React.useState<
    "ALL" | QuestionType
  >("ALL");
  const [composerSearch, setComposerSearch] = React.useState("");

  // Section 3: Question Bank filters
  const [bankSearch, setBankSearch] = React.useState("");
  const [bankClassFilter, setBankClassFilter] = React.useState("ALL");
  const [bankSubjectFilter, setBankSubjectFilter] = React.useState("ALL");
  const [bankTypeFilter, setBankTypeFilter] = React.useState("ALL");

  // Dialog states
  const [isAddQuestionOpen, setIsAddQuestionOpen] = React.useState(false);
  const [viewingQuestion, setViewingQuestion] =
    React.useState<QuestionBankItem | null>(null);
  const [printingPaper, setPrintingPaper] =
    React.useState<GeneratedPaper | null>(null);

  const sections = [
    { id: "papers", label: "Exam Papers", icon: FileStack },
    { id: "composer", label: "Create Paper", icon: FilePlus2 },
    { id: "bank", label: "Question Bank", icon: Database },
  ];

  const activeSectionObj =
    sections.find((s) => s.id === activeTab) || sections[0];

  // KPI metrics
  const kpiStats = React.useMemo(() => {
    const finalizedCount = papers.filter(
      (p) => p.status === "Finalized"
    ).length;
    const uniqueSubjects = new Set(questionBank.map((q) => q.subject)).size;
    return {
      paperCount: papers.length,
      bankCount: questionBank.length,
      finalizedCount,
      uniqueSubjects,
    };
  }, [papers, questionBank]);

  // Filtered Exam Papers
  const filteredPapers = React.useMemo(() => {
    const q = paperSearch.toLowerCase().trim();
    return papers.filter((p) => {
      const matchesSearch =
        q === "" ||
        p.title.toLowerCase().includes(q) ||
        p.subject.toLowerCase().includes(q) ||
        p.examTerm.toLowerCase().includes(q);
      const matchesClass =
        paperClassFilter === "ALL" || p.className === paperClassFilter;
      const matchesSubject =
        paperSubjectFilter === "ALL" || p.subject === paperSubjectFilter;
      const matchesStatus =
        paperStatusFilter === "ALL" || p.status === paperStatusFilter;
      return matchesSearch && matchesClass && matchesSubject && matchesStatus;
    });
  }, [
    papers,
    paperSearch,
    paperClassFilter,
    paperSubjectFilter,
    paperStatusFilter,
  ]);

  // Available questions for Create Paper composer
  const composerAvailableQuestions = React.useMemo(() => {
    const q = composerSearch.toLowerCase().trim();
    return questionBank.filter((item) => {
      const matchesClassSubject =
        item.className === composerClass && item.subject === composerSubject;
      const matchesType =
        composerTypeFilter === "ALL" || item.type === composerTypeFilter;
      const matchesSearch =
        q === "" ||
        item.statement.toLowerCase().includes(q) ||
        item.chapter.toLowerCase().includes(q);
      return matchesClassSubject && matchesType && matchesSearch;
    });
  }, [
    questionBank,
    composerClass,
    composerSubject,
    composerTypeFilter,
    composerSearch,
  ]);

  const composerBreakdown = React.useMemo(
    () => computePaperBreakdown(selectedQuestionIds, questionBank),
    [selectedQuestionIds, questionBank]
  );

  // Filtered Question Bank
  const filteredBank = React.useMemo(() => {
    const q = bankSearch.toLowerCase().trim();
    return questionBank.filter((item) => {
      const matchesSearch =
        q === "" ||
        item.statement.toLowerCase().includes(q) ||
        item.chapter.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q);
      const matchesClass =
        bankClassFilter === "ALL" || item.className === bankClassFilter;
      const matchesSubject =
        bankSubjectFilter === "ALL" || item.subject === bankSubjectFilter;
      const matchesType =
        bankTypeFilter === "ALL" || item.type === bankTypeFilter;
      return matchesSearch && matchesClass && matchesSubject && matchesType;
    });
  }, [
    questionBank,
    bankSearch,
    bankClassFilter,
    bankSubjectFilter,
    bankTypeFilter,
  ]);

  // Handlers
  const handleComposerClassOrSubjectChange = (
    nextClass: string,
    nextSubject: string
  ) => {
    setComposerClass(nextClass);
    setComposerSubject(nextSubject);
    setComposerTitle(`${nextClass} ${nextSubject} — Term Assessment Paper`);

    // Auto-pick matching questions for the newly chosen class & subject
    const matching = questionBank.filter(
      (q) => q.className === nextClass && q.subject === nextSubject
    );
    setSelectedQuestionIds(matching.map((q) => q.id));
  };

  const toggleQuestionSelection = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAutoPickBalanced = () => {
    const pool = questionBank.filter(
      (q) => q.className === composerClass && q.subject === composerSubject
    );
    if (pool.length === 0) {
      toast.error(
        `No questions found for ${composerClass} ${composerSubject}. Add questions first.`
      );
      return;
    }

    const mcqs = pool.filter((q) => q.type === "MCQ").slice(0, 6);
    const shorts = pool.filter((q) => q.type === "Short").slice(0, 4);
    const longs = pool.filter((q) => q.type === "Long").slice(0, 2);
    const picked = [...mcqs, ...shorts, ...longs].map((q) => q.id);

    setSelectedQuestionIds(picked);
    toast.success("Balanced set of MCQs, Short, and Long questions selected.");
  };

  const handlePreviewDraftPaper = () => {
    if (selectedQuestionIds.length === 0) {
      toast.error("Please select at least one question to preview the paper.");
      return;
    }
    const previewObj: GeneratedPaper = {
      id: "preview-temp",
      title: composerTitle.trim() || `${composerClass} ${composerSubject} Paper`,
      examTerm: composerTerm,
      className: composerClass,
      subject: composerSubject,
      duration: composerDuration,
      campus: composerCampus,
      preparedBy: composerTeacher,
      createdDate: todayIso,
      status: "Draft",
      questionIds: selectedQuestionIds,
    };
    setPrintingPaper(previewObj);
  };

  const handleSaveComposedPaper = (status: PaperStatus) => {
    if (!composerTitle.trim()) {
      toast.error("Please enter a paper title.");
      return;
    }
    if (selectedQuestionIds.length === 0) {
      toast.error("Please select at least one question from the bank.");
      return;
    }

    const newPaper: GeneratedPaper = {
      id: `pap-${Date.now()}`,
      title: composerTitle.trim(),
      examTerm: composerTerm,
      className: composerClass,
      subject: composerSubject,
      duration: composerDuration,
      campus: composerCampus,
      preparedBy: composerTeacher,
      createdDate: todayIso,
      status,
      questionIds: selectedQuestionIds,
    };

    setPapers((prev) => [newPaper, ...prev]);
    toast.success(
      status === "Finalized"
        ? "Exam paper finalized and saved."
        : "Paper saved as draft."
    );
    setActiveTab("papers");
  };

  const handleUpdatePaperStatus = (paperId: string, status: PaperStatus) => {
    setPapers((prev) =>
      prev.map((p) => (p.id === paperId ? { ...p, status } : p))
    );
    toast.success(`Paper marked as ${status}.`);
  };

  const handleDeletePaper = (paperId: string) => {
    setPapers((prev) => prev.filter((p) => p.id !== paperId));
    toast.success("Exam paper deleted.");
  };

  const handleAddQuestion = (newQuestion: QuestionBankItem) => {
    setQuestionBank((prev) => [newQuestion, ...prev]);
    if (
      activeTab === "composer" &&
      newQuestion.className === composerClass &&
      newQuestion.subject === composerSubject
    ) {
      setSelectedQuestionIds((prev) => [...prev, newQuestion.id]);
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestionBank((prev) => prev.filter((q) => q.id !== questionId));
    setSelectedQuestionIds((prev) => prev.filter((id) => id !== questionId));
    toast.success("Question removed from bank.");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Paper Generator
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddQuestionOpen(true)}
            className="text-xs h-9 gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Add Question</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setActiveTab("composer")}
            className="bg-brand text-brand-foreground hover:bg-brand/90 text-xs h-9 gap-1.5 shadow-xs cursor-pointer"
          >
            <FilePlus2 className="size-3.5" />
            <span>Create Paper</span>
          </Button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <StatGrid className="max-w-none">
        <StatCard
          label="Generated Papers"
          value={`${kpiStats.paperCount} Papers`}
          icon={FileStack}
        />
        <StatCard
          label="Question Bank"
          value={`${kpiStats.bankCount} Questions`}
          icon={Database}
        />
        <StatCard
          label="Finalized Papers"
          value={`${kpiStats.finalizedCount} Ready`}
          icon={CheckCircle2}
        />
        <StatCard
          label="Subjects Covered"
          value={`${kpiStats.uniqueSubjects} Subjects`}
          icon={BookOpen}
        />
      </StatGrid>

      {/* Main Module Sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Dropdown Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="group inline-flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-background hover:bg-muted/50 px-3 h-9 text-xs font-semibold shadow-2xs transition-all hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 cursor-pointer min-w-[200px] sm:min-w-[220px]">
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

        {/* ================= SECTION 1: Exam Papers ================= */}
        <TabsContent value="papers" className="space-y-4 outline-none">
          <Card className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/70 bg-muted/20">
              <h2 className="text-sm font-semibold text-foreground">
                Exam Question Papers
              </h2>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand font-mono self-start sm:self-auto">
                {filteredPapers.length}{" "}
                {filteredPapers.length === 1 ? "Paper" : "Papers"}
              </span>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-3.5 border-b border-border/60">
              <div className="relative w-full md:w-72 shrink-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search papers…"
                  value={paperSearch}
                  onChange={(e) => setPaperSearch(e.target.value)}
                  className="pl-9 h-9 text-xs bg-background/60"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 md:ml-auto">
                <Select
                  value={paperClassFilter}
                  onValueChange={(val) => {
                    if (val) setPaperClassFilter(val);
                  }}
                >
                  <SelectTrigger className="w-[130px] h-9 text-xs font-medium">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" className="text-xs">
                      All Classes
                    </SelectItem>
                    {PAPER_CLASSES.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={paperSubjectFilter}
                  onValueChange={(val) => {
                    if (val) setPaperSubjectFilter(val);
                  }}
                >
                  <SelectTrigger className="w-[155px] h-9 text-xs font-medium">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" className="text-xs">
                      All Subjects
                    </SelectItem>
                    {PAPER_SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={paperStatusFilter}
                  onValueChange={(val) => {
                    if (val) setPaperStatusFilter(val);
                  }}
                >
                  <SelectTrigger className="w-[130px] h-9 text-xs font-medium">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" className="text-xs">
                      All Status
                    </SelectItem>
                    <SelectItem value="Finalized" className="text-xs">
                      Finalized
                    </SelectItem>
                    <SelectItem value="Draft" className="text-xs">
                      Draft
                    </SelectItem>
                  </SelectContent>
                </Select>

                {(paperSearch ||
                  paperClassFilter !== "ALL" ||
                  paperSubjectFilter !== "ALL" ||
                  paperStatusFilter !== "ALL") && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setPaperSearch("");
                      setPaperClassFilter("ALL");
                      setPaperSubjectFilter("ALL");
                      setPaperStatusFilter("ALL");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Exam Papers Table */}
            <Table className="md:table-fixed">
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="pl-5 md:w-[30%] text-xs font-semibold uppercase tracking-wider">
                    Paper & Exam Term
                  </TableHead>
                  <TableHead className="md:w-[16%] text-center text-xs font-semibold uppercase tracking-wider">
                    Class & Subject
                  </TableHead>
                  <TableHead className="md:w-[21%] text-center text-xs font-semibold uppercase tracking-wider">
                    Structure
                  </TableHead>
                  <TableHead className="md:w-[13%] text-center text-xs font-semibold uppercase tracking-wider">
                    Marks & Time
                  </TableHead>
                  <TableHead className="md:w-[11%] text-center text-xs font-semibold uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="text-right pr-5 md:w-[9%] text-xs font-semibold uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredPapers.length > 0 ? (
                  filteredPapers.map((paper) => {
                    const stats = computePaperBreakdown(
                      paper.questionIds,
                      questionBank
                    );
                    return (
                      <TableRow
                        key={paper.id}
                        className="group transition-colors hover:bg-muted/30"
                      >
                        <TableCell className="pl-5 py-3">
                          <div className="flex flex-col min-w-0">
                            <span
                              className="text-xs font-semibold text-foreground truncate"
                              title={paper.title}
                            >
                              {paper.title}
                            </span>
                            <span
                              className="text-[11px] text-muted-foreground mt-0.5 truncate"
                              title={`${paper.examTerm} • ${formatDate(paper.createdDate)}`}
                            >
                              {paper.examTerm}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 text-center">
                          <div className="flex flex-col items-center min-w-0">
                            <span className="text-xs font-semibold text-foreground">
                              {paper.subject}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {paper.className}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 text-center">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-foreground/90">
                            <span>{stats.mcqCount} MCQ</span>
                            <span className="text-muted-foreground">·</span>
                            <span>{stats.shortCount} Short</span>
                            <span className="text-muted-foreground">·</span>
                            <span>{stats.longCount} Long</span>
                          </span>
                        </TableCell>

                        <TableCell className="py-3 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-mono font-bold text-foreground">
                              {stats.totalMarks} Marks
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {paper.duration}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
                                paper.status === "Finalized"
                                  ? "bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400"
                                  : "bg-amber-500/12 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
                              )}
                            >
                              <span>{paper.status}</span>
                              <ChevronDown className="size-3 opacity-70" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="center"
                              className="w-36 p-1 rounded-xl shadow-lg border-border/80"
                            >
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdatePaperStatus(paper.id, "Finalized")
                                }
                                className="flex items-center justify-between text-xs rounded-lg cursor-pointer"
                              >
                                <span>Finalized</span>
                                {paper.status === "Finalized" && (
                                  <Check className="size-3.5 text-emerald-600" />
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdatePaperStatus(paper.id, "Draft")
                                }
                                className="flex items-center justify-between text-xs rounded-lg cursor-pointer"
                              >
                                <span>Draft</span>
                                {paper.status === "Draft" && (
                                  <Check className="size-3.5 text-amber-600" />
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>

                        <TableCell className="text-right pr-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setPrintingPaper(paper)}
                              title="Preview & Print Paper"
                              className="text-muted-foreground hover:text-brand cursor-pointer"
                            >
                              <Printer className="size-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleDeletePaper(paper.id)}
                              title="Delete Paper"
                              className="text-muted-foreground hover:text-destructive cursor-pointer"
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
                    <TableCell
                      colSpan={6}
                      className="h-28 text-center text-xs text-muted-foreground"
                    >
                      No exam papers match the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ================= SECTION 2: Create Paper ================= */}
        <TabsContent value="composer" className="space-y-4 outline-none">
          {/* Paper Setup Card */}
          <Card className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/70 bg-muted/20">
              <h2 className="text-sm font-semibold text-foreground">
                Paper Details & Marks Summary
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-foreground font-mono">
                  {selectedQuestionIds.length} Questions
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand font-mono">
                  Total: {composerBreakdown.totalMarks} Marks
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="compTitle" className="text-xs font-semibold">
                    Paper Title
                  </Label>
                  <Input
                    id="compTitle"
                    placeholder="e.g. Class 9 Physics — Mid-Term Paper"
                    value={composerTitle}
                    onChange={(e) => setComposerTitle(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Exam Term</Label>
                  <Select
                    value={composerTerm}
                    onValueChange={(val) => {
                      if (val) setComposerTerm(val);
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAPER_EXAM_TERMS.map((t) => (
                        <SelectItem key={t} value={t} className="text-xs">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Time Allowed</Label>
                  <Select
                    value={composerDuration}
                    onValueChange={(val) => {
                      if (val) setComposerDuration(val);
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAPER_DURATIONS.map((d) => (
                        <SelectItem key={d} value={d} className="text-xs">
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Class</Label>
                  <Select
                    value={composerClass}
                    onValueChange={(val) => {
                      if (val)
                        handleComposerClassOrSubjectChange(
                          val,
                          composerSubject
                        );
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAPER_CLASSES.map((c) => (
                        <SelectItem key={c} value={c} className="text-xs">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Subject</Label>
                  <Select
                    value={composerSubject}
                    onValueChange={(val) => {
                      if (val)
                        handleComposerClassOrSubjectChange(composerClass, val);
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAPER_SUBJECTS.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Campus</Label>
                  <Select
                    value={composerCampus}
                    onValueChange={(val) => {
                      if (val) setComposerCampus(val);
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMPUSES.map((c) => (
                        <SelectItem
                          key={c.id}
                          value={c.campusName}
                          className="text-xs"
                        >
                          {c.campusName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Prepared By</Label>
                  <Select
                    value={composerTeacher}
                    onValueChange={(val) => {
                      if (val) setComposerTeacher(val);
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAPER_TEACHERS.map((t) => (
                        <SelectItem key={t} value={t} className="text-xs">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action & Distribution Footer Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/60">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-md bg-muted/60 px-2.5 py-1 font-medium text-foreground">
                    MCQs: <strong>{composerBreakdown.mcqCount}</strong>
                  </span>
                  <span className="rounded-md bg-muted/60 px-2.5 py-1 font-medium text-foreground">
                    Short: <strong>{composerBreakdown.shortCount}</strong>
                  </span>
                  <span className="rounded-md bg-muted/60 px-2.5 py-1 font-medium text-foreground">
                    Long: <strong>{composerBreakdown.longCount}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAutoPickBalanced}
                    className="h-8 text-xs gap-1.5 cursor-pointer"
                  >
                    <Wand2 className="size-3.5 text-brand" />
                    <span>Auto-Select</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePreviewDraftPaper}
                    className="h-8 text-xs gap-1.5 cursor-pointer"
                  >
                    <Printer className="size-3.5" />
                    <span>Preview</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveComposedPaper("Draft")}
                    className="h-8 text-xs cursor-pointer"
                  >
                    Save Draft
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleSaveComposedPaper("Finalized")}
                    className="h-8 text-xs gap-1.5 bg-brand text-cream hover:bg-brand-600 cursor-pointer"
                  >
                    <Save className="size-3.5" />
                    <span>Finalize Paper</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Question Picker List */}
          <Card className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/70 bg-muted/20">
              <h3 className="text-sm font-semibold text-foreground">
                Select Questions — {composerClass} ({composerSubject})
              </h3>

              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setIsAddQuestionOpen(true)}
                className="text-xs gap-1 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="size-3" />
                <span>New Question</span>
              </Button>
            </div>

            {/* Filter Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-border/60">
              <div className="flex flex-wrap items-center gap-1.5">
                {(["ALL", "MCQ", "Short", "Long"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setComposerTypeFilter(t)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                      composerTypeFilter === t
                        ? "bg-brand text-cream shadow-2xs"
                        : "bg-muted/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t === "ALL" ? "All Types" : `${t}s`}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Filter questions…"
                  value={composerSearch}
                  onChange={(e) => setComposerSearch(e.target.value)}
                  className="pl-8 h-8 text-xs bg-background/60"
                />
              </div>
            </div>

            {/* Selectable Questions List */}
            <div className="divide-y divide-border/60">
              {composerAvailableQuestions.length > 0 ? (
                composerAvailableQuestions.map((q) => {
                  const isChecked = selectedQuestionIds.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      onClick={() => toggleQuestionSelection(q.id)}
                      className={cn(
                        "flex items-start justify-between gap-4 px-5 py-3.5 cursor-pointer transition-colors",
                        isChecked ? "bg-brand-soft/25" : "hover:bg-muted/30"
                      )}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={cn(
                            "mt-0.5 flex size-4.5 items-center justify-center rounded border transition-colors shrink-0",
                            isChecked
                              ? "border-brand bg-brand text-cream"
                              : "border-input bg-background"
                          )}
                        >
                          {isChecked && <Check className="size-3" />}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <p className="text-xs font-medium text-foreground leading-relaxed">
                            {q.statement}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                            <span>{q.chapter}</span>
                            <span>•</span>
                            <span className="font-medium text-foreground/80">
                              {q.type}
                            </span>
                            <span>•</span>
                            <span>{q.difficulty}</span>
                          </div>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                        {q.marks}m
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 px-5 text-center space-y-2">
                  <p className="text-xs text-muted-foreground">
                    No questions found in the bank for {composerClass} —{" "}
                    {composerSubject}.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddQuestionOpen(true)}
                    className="h-8 text-xs gap-1.5 cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>
                      Add Question for {composerClass} {composerSubject}
                    </span>
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* ================= SECTION 3: Question Bank ================= */}
        <TabsContent value="bank" className="space-y-4 outline-none">
          <Card className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/70 bg-muted/20">
              <h2 className="text-sm font-semibold text-foreground">
                Subject Question Bank
              </h2>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand font-mono self-start sm:self-auto">
                {filteredBank.length}{" "}
                {filteredBank.length === 1 ? "Question" : "Questions"}
              </span>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-3.5 border-b border-border/60">
              <div className="relative w-full md:w-72 shrink-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search questions…"
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  className="pl-9 h-9 text-xs bg-background/60"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 md:ml-auto">
                <Select
                  value={bankClassFilter}
                  onValueChange={(val) => {
                    if (val) setBankClassFilter(val);
                  }}
                >
                  <SelectTrigger className="w-[130px] h-9 text-xs font-medium">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" className="text-xs">
                      All Classes
                    </SelectItem>
                    {PAPER_CLASSES.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={bankSubjectFilter}
                  onValueChange={(val) => {
                    if (val) setBankSubjectFilter(val);
                  }}
                >
                  <SelectTrigger className="w-[155px] h-9 text-xs font-medium">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" className="text-xs">
                      All Subjects
                    </SelectItem>
                    {PAPER_SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={bankTypeFilter}
                  onValueChange={(val) => {
                    if (val) setBankTypeFilter(val);
                  }}
                >
                  <SelectTrigger className="w-[130px] h-9 text-xs font-medium">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" className="text-xs">
                      All Types
                    </SelectItem>
                    <SelectItem value="MCQ" className="text-xs">
                      MCQ
                    </SelectItem>
                    <SelectItem value="Short" className="text-xs">
                      Short
                    </SelectItem>
                    <SelectItem value="Long" className="text-xs">
                      Long
                    </SelectItem>
                  </SelectContent>
                </Select>

                {(bankSearch ||
                  bankClassFilter !== "ALL" ||
                  bankSubjectFilter !== "ALL" ||
                  bankTypeFilter !== "ALL") && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setBankSearch("");
                      setBankClassFilter("ALL");
                      setBankSubjectFilter("ALL");
                      setBankTypeFilter("ALL");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Question Bank Table */}
            <Table className="md:table-fixed">
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="pl-5 md:w-[39%] text-xs font-semibold uppercase tracking-wider">
                    Question & Chapter
                  </TableHead>
                  <TableHead className="md:w-[16%] text-center text-xs font-semibold uppercase tracking-wider">
                    Class & Subject
                  </TableHead>
                  <TableHead className="md:w-[12%] text-center text-xs font-semibold uppercase tracking-wider">
                    Type
                  </TableHead>
                  <TableHead className="md:w-[12%] text-center text-xs font-semibold uppercase tracking-wider">
                    Difficulty
                  </TableHead>
                  <TableHead className="md:w-[10%] text-center text-xs font-semibold uppercase tracking-wider">
                    Marks
                  </TableHead>
                  <TableHead className="text-right pr-5 md:w-[11%] text-xs font-semibold uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredBank.length > 0 ? (
                  filteredBank.map((q) => (
                    <TableRow
                      key={q.id}
                      className="group transition-colors hover:bg-muted/30"
                    >
                      <TableCell className="pl-5 py-3">
                        <div className="flex flex-col min-w-0">
                          <span
                            className="text-xs font-medium text-foreground truncate"
                            title={q.statement}
                          >
                            {q.statement}
                          </span>
                          <span
                            className="text-[11px] text-muted-foreground mt-0.5 truncate"
                            title={q.chapter}
                          >
                            {q.chapter}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-semibold text-foreground">
                            {q.subject}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {q.className}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-center">
                        <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand">
                          {q.type}
                        </span>
                      </TableCell>

                      <TableCell className="py-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                            q.difficulty === "Easy"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : q.difficulty === "Medium"
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                : "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                          )}
                        >
                          {q.difficulty}
                        </span>
                      </TableCell>

                      <TableCell className="py-3 text-center">
                        <span className="text-xs font-mono font-bold text-foreground">
                          {q.marks}
                        </span>
                      </TableCell>

                      <TableCell className="text-right pr-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setViewingQuestion(q)}
                            title="View Question & Key"
                            className="text-muted-foreground hover:text-brand cursor-pointer"
                          >
                            <Eye className="size-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDeleteQuestion(q.id)}
                            title="Delete Question"
                            className="text-muted-foreground hover:text-destructive cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-28 text-center text-xs text-muted-foreground"
                    >
                      No questions match the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddQuestionDialog
        open={isAddQuestionOpen}
        onOpenChange={setIsAddQuestionOpen}
        onAddQuestion={handleAddQuestion}
        defaultClass={activeTab === "composer" ? composerClass : undefined}
        defaultSubject={activeTab === "composer" ? composerSubject : undefined}
      />

      <ViewQuestionDialog
        open={Boolean(viewingQuestion)}
        onOpenChange={(open) => {
          if (!open) setViewingQuestion(null);
        }}
        question={viewingQuestion}
      />

      <PrintPaperDialog
        open={Boolean(printingPaper)}
        onOpenChange={(open) => {
          if (!open) setPrintingPaper(null);
        }}
        paper={printingPaper}
        questionBank={questionBank}
      />
    </div>
  );
}
