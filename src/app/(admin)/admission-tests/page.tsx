"use client";

import * as React from "react";
import {
  CalendarClock,
  ClipboardCheck,
  Award,
  Users,
  ShieldCheck,
  Search,
  Plus,
  Printer,
  Eye,
  Trash2,
  Save,
  ChevronDown,
  Check,
  FileText,
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
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import {
  INITIAL_ADMISSION_SESSIONS,
  INITIAL_ADMISSION_APPLICANTS,
  ADMISSION_CLASS_GROUPS,
  ADMISSION_APPLIED_CLASSES,
  evaluateApplicantScore,
  generateDefaultApplicantsForSession,
  type AdmissionTestSession,
  type AdmissionApplicantRecord,
  type AdmissionDecision,
} from "@/lib/mock/admission-tests";
import { ScheduleSessionDialog } from "./schedule-session-dialog";
import { ViewSessionDialog } from "./view-session-dialog";
import { ViewApplicantDialog } from "./view-applicant-dialog";
import {
  PrintMeritListDialog,
  type MeritCandidateRow,
} from "./print-merit-list-dialog";

export default function AdmissionTestsPage() {
  const [activeTab, setActiveTab] = React.useState<string>("sessions");

  // Core data states
  const [sessions, setSessions] = React.useState<AdmissionTestSession[]>(
    INITIAL_ADMISSION_SESSIONS
  );
  const [applicantsMap, setApplicantsMap] = React.useState<
    Record<string, AdmissionApplicantRecord[]>
  >(() => {
    const seeded: Record<string, AdmissionApplicantRecord[]> = {
      ...INITIAL_ADMISSION_APPLICANTS,
    };
    INITIAL_ADMISSION_SESSIONS.forEach((s) => {
      if (!seeded[s.id]) {
        seeded[s.id] = generateDefaultApplicantsForSession(s);
      }
    });
    return seeded;
  });

  // Selected session for Evaluation tab
  const [selectedSessionId, setSelectedSessionId] = React.useState<string>(
    INITIAL_ADMISSION_SESSIONS[0]?.id || ""
  );
  const [activeApplicants, setActiveApplicants] = React.useState<
    AdmissionApplicantRecord[]
  >(INITIAL_ADMISSION_APPLICANTS[INITIAL_ADMISSION_SESSIONS[0]?.id] || []);

  // Filters — Sessions tab
  const [sessionSearch, setSessionSearch] = React.useState("");
  const [groupFilter, setGroupFilter] = React.useState("ALL");
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  // Search — Evaluation tab
  const [applicantSearch, setApplicantSearch] = React.useState("");

  // Filters — Merit List tab
  const [meritSearch, setMeritSearch] = React.useState("");
  const [meritClassFilter, setMeritClassFilter] = React.useState("ALL");
  const [meritDecisionFilter, setMeritDecisionFilter] = React.useState("ALL");

  // Dialog states
  const [isScheduleOpen, setIsScheduleOpen] = React.useState(false);
  const [viewSession, setViewSession] =
    React.useState<AdmissionTestSession | null>(null);
  const [isViewSessionOpen, setIsViewSessionOpen] = React.useState(false);
  const [viewApplicant, setViewApplicant] =
    React.useState<AdmissionApplicantRecord | null>(null);
  const [isViewApplicantOpen, setIsViewApplicantOpen] = React.useState(false);
  const [isPrintMeritOpen, setIsPrintMeritOpen] = React.useState(false);

  // Sync activeApplicants when selectedSessionId changes
  React.useEffect(() => {
    if (selectedSessionId && applicantsMap[selectedSessionId]) {
      setActiveApplicants(applicantsMap[selectedSessionId]);
    }
  }, [selectedSessionId, applicantsMap]);

  // Module portions for dropdown selector
  const sections = React.useMemo(
    () => [
      {
        id: "sessions",
        label: "Test Sessions",
        icon: CalendarClock,
      },
      {
        id: "evaluation",
        label: "Marks & Evaluation",
        icon: ClipboardCheck,
      },
      {
        id: "merit",
        label: "Merit List",
        icon: Award,
      },
    ],
    []
  );

  const activeSectionObj =
    sections.find((s) => s.id === activeTab) || sections[0];

  const currentSession = React.useMemo(() => {
    return (
      sessions.find((s) => s.id === selectedSessionId) || sessions[0] || null
    );
  }, [sessions, selectedSessionId]);

  // KPI summary stats
  const kpiStats = React.useMemo(() => {
    let totalApplicants = 0;
    let totalAppeared = 0;
    let totalQualified = 0;

    sessions.forEach((ses) => {
      const list = applicantsMap[ses.id] || [];
      totalApplicants += list.length;
      if (ses.status === "Completed") {
        list.forEach((a) => {
          if (!a.isAbsent) {
            totalAppeared++;
            if (a.resultStatus === "Qualified") totalQualified++;
          }
        });
      }
    });

    const qualificationRate =
      totalAppeared > 0
        ? `${((totalQualified / totalAppeared) * 100).toFixed(1)}%`
        : "0.0%";

    return {
      sessionCount: sessions.length,
      totalApplicants,
      qualificationRate,
    };
  }, [sessions, applicantsMap]);

  // Filtered sessions
  const filteredSessions = React.useMemo(() => {
    return sessions.filter((s) => {
      const q = sessionSearch.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        s.title.toLowerCase().includes(q) ||
        s.classGroup.toLowerCase().includes(q) ||
        s.roomHall.toLowerCase().includes(q);
      const matchesGroup =
        groupFilter === "ALL" || s.classGroup === groupFilter;
      const matchesStatus =
        statusFilter === "ALL" || s.status === statusFilter;

      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [sessions, sessionSearch, groupFilter, statusFilter]);

  // Filtered applicants in Evaluation tab
  const filteredEvaluationApplicants = React.useMemo(() => {
    return activeApplicants.filter((a) => {
      const q = applicantSearch.toLowerCase().trim();
      return (
        q === "" ||
        a.formNo.toLowerCase().includes(q) ||
        a.applicantName.toLowerCase().includes(q) ||
        a.fatherName.toLowerCase().includes(q)
      );
    });
  }, [activeApplicants, applicantSearch]);

  // Merit list candidates (all Qualified candidates across Completed sessions, sorted by % desc)
  const meritCandidates = React.useMemo<MeritCandidateRow[]>(() => {
    const list: MeritCandidateRow[] = [];
    sessions
      .filter((s) => s.status === "Completed")
      .forEach((s) => {
        const apps = applicantsMap[s.id] || [];
        apps.forEach((a) => {
          if (!a.isAbsent && a.resultStatus === "Qualified") {
            list.push({
              ...a,
              sessionTitle: s.title,
            });
          }
        });
      });

    return list
      .filter((c) => {
        const q = meritSearch.toLowerCase().trim();
        const matchesSearch =
          q === "" ||
          c.formNo.toLowerCase().includes(q) ||
          c.applicantName.toLowerCase().includes(q) ||
          c.fatherName.toLowerCase().includes(q);
        const matchesClass =
          meritClassFilter === "ALL" || c.appliedClass === meritClassFilter;
        const matchesDecision =
          meritDecisionFilter === "ALL" || c.decision === meritDecisionFilter;

        return matchesSearch && matchesClass && matchesDecision;
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [
    sessions,
    applicantsMap,
    meritSearch,
    meritClassFilter,
    meritDecisionFilter,
  ]);

  // Handlers
  const handleAddSession = (newSession: AdmissionTestSession) => {
    setSessions((prev) => [newSession, ...prev]);
    const seeded = generateDefaultApplicantsForSession(newSession);
    setApplicantsMap((prev) => ({ ...prev, [newSession.id]: seeded }));
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success("Admission test session removed.");
    if (selectedSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id);
      if (remaining.length > 0) {
        setSelectedSessionId(remaining[0].id);
      }
    }
  };

  const handleOpenEvaluation = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setActiveTab("evaluation");
  };

  const handleMarkChange = (applicantId: string, value: string) => {
    if (!currentSession) return;
    const numeric = value === "" ? 0 : Number(value);
    const valid = Math.min(Math.max(0, numeric), currentSession.totalMarks);

    setActiveApplicants((prev) =>
      prev.map((a) => {
        if (a.id === applicantId) {
          const ev = evaluateApplicantScore(
            valid,
            currentSession.totalMarks,
            currentSession.qualifyingMarks,
            false
          );
          return {
            ...a,
            obtainedMarks: valid,
            isAbsent: false,
            percentage: ev.percentage,
            resultStatus: ev.resultStatus,
            isManualQualification: false,
            decision: ev.defaultDecision,
            remarks: ev.remarks,
          };
        }
        return a;
      })
    );
  };

  const handleToggleAbsent = (applicantId: string) => {
    if (!currentSession) return;
    setActiveApplicants((prev) =>
      prev.map((a) => {
        if (a.id === applicantId) {
          const nextAbsent = !a.isAbsent;
          const marks = nextAbsent ? 0 : a.obtainedMarks;
          const ev = evaluateApplicantScore(
            marks,
            currentSession.totalMarks,
            currentSession.qualifyingMarks,
            nextAbsent
          );
          return {
            ...a,
            isAbsent: nextAbsent,
            obtainedMarks: marks,
            percentage: ev.percentage,
            resultStatus: ev.resultStatus,
            isManualQualification: false,
            decision: ev.defaultDecision,
            remarks: ev.remarks,
          };
        }
        return a;
      })
    );
  };

  const handleManualQualificationChange = (
    applicantId: string,
    nextStatus: "Qualified" | "Not Qualified"
  ) => {
    let targetName = "Candidate";

    const applyUpdate = (
      a: AdmissionApplicantRecord,
      ses: AdmissionTestSession | undefined
    ): AdmissionApplicantRecord => {
      if (a.id !== applicantId) return a;
      targetName = a.applicantName;
      const qualThreshold = ses?.qualifyingMarks ?? 50;
      const autoStatus =
        a.obtainedMarks >= qualThreshold ? "Qualified" : "Not Qualified";
      const isOverride = nextStatus !== autoStatus;

      if (nextStatus === "Qualified") {
        return {
          ...a,
          isAbsent: false,
          resultStatus: "Qualified",
          isManualQualification: isOverride,
          decision:
            a.decision === "Rejected" || a.decision === "Pending"
              ? "Approved"
              : a.decision,
          remarks: isOverride
            ? "Manually qualified by administration"
            : "Cleared on merit — recommended for admission",
        };
      }

      return {
        ...a,
        isAbsent: false,
        resultStatus: "Not Qualified",
        isManualQualification: isOverride,
        decision: "Rejected",
        remarks: isOverride
          ? "Manually marked not qualified"
          : "Below 50% qualifying threshold",
      };
    };

    const updatedActive = activeApplicants.map((a) =>
      applyUpdate(a, currentSession || undefined)
    );
    setActiveApplicants(updatedActive);

    setApplicantsMap((prev) => {
      const next: Record<string, AdmissionApplicantRecord[]> = {};
      Object.entries(prev).forEach(([sesId, list]) => {
        if (sesId === selectedSessionId) {
          next[sesId] = updatedActive;
        } else {
          const ses = sessions.find((s) => s.id === sesId);
          next[sesId] = list.map((a) => applyUpdate(a, ses));
        }
      });
      return next;
    });

    toast.success(`${targetName} marked as ${nextStatus}.`);
  };

  const handleResetQualificationToAuto = (applicantId: string) => {
    if (!currentSession) return;
    const updatedActive = activeApplicants.map((a) => {
      if (a.id !== applicantId) return a;
      const ev = evaluateApplicantScore(
        a.obtainedMarks,
        currentSession.totalMarks,
        currentSession.qualifyingMarks,
        a.isAbsent
      );
      return {
        ...a,
        percentage: ev.percentage,
        resultStatus: ev.resultStatus,
        isManualQualification: false,
        decision: ev.defaultDecision,
        remarks: ev.remarks,
      };
    });

    setActiveApplicants(updatedActive);
    if (selectedSessionId) {
      setApplicantsMap((prev) => ({
        ...prev,
        [selectedSessionId]: updatedActive,
      }));
    }
    toast.success("Status recalculated automatically from marks.");
  };

  const handleSaveEvaluation = () => {
    if (!selectedSessionId) return;
    setApplicantsMap((prev) => ({
      ...prev,
      [selectedSessionId]: activeApplicants,
    }));
    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSessionId ? { ...s, status: "Completed" } : s
      )
    );
    toast.success("Applicant scores saved and merit list updated.");
  };

  const handleUpdateDecision = (
    applicantId: string,
    decision: AdmissionDecision
  ) => {
    setApplicantsMap((prev) => {
      const next: Record<string, AdmissionApplicantRecord[]> = {};
      Object.entries(prev).forEach(([sesId, list]) => {
        next[sesId] = list.map((a) =>
          a.id === applicantId ? { ...a, decision } : a
        );
      });
      return next;
    });
    setActiveApplicants((prev) =>
      prev.map((a) => (a.id === applicantId ? { ...a, decision } : a))
    );
    toast.success(`Candidate status updated to ${decision}.`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Admission Tests
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPrintMeritOpen(true)}
            className="text-xs h-9 gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="size-3.5" />
            <span>Print Merit List</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsScheduleOpen(true)}
            className="bg-brand text-brand-foreground hover:bg-brand/90 text-xs h-9 gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Schedule Test</span>
          </Button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <StatGrid className="max-w-none">
        <StatCard
          label="Entry Test Sessions"
          value={`${kpiStats.sessionCount} Sessions`}
          icon={CalendarClock}
        />
        <StatCard
          label="Registered Applicants"
          value={`${kpiStats.totalApplicants} Candidates`}
          icon={Users}
        />
        <StatCard
          label="Qualification Rate"
          value={kpiStats.qualificationRate}
          icon={Award}
        />
        <StatCard
          label="Qualifying Standard"
          value="Min. 50% Marks"
          icon={ShieldCheck}
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

        {/* ================= SECTION 1: Test Sessions ================= */}
        <TabsContent value="sessions" className="space-y-4 outline-none">
          <Card className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/70 bg-muted/20">
              <h2 className="text-sm font-semibold text-foreground">
                Admission Test Sessions
              </h2>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand font-mono self-start sm:self-auto">
                {filteredSessions.length}{" "}
                {filteredSessions.length === 1 ? "Session" : "Sessions"}
              </span>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-3.5 border-b border-border/60">
              <div className="relative w-full md:w-72 shrink-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search sessions…"
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  className="pl-9 h-9 text-xs bg-background/60"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 md:ml-auto">
                <Select
                  value={groupFilter}
                  onValueChange={(val) => {
                    if (val) setGroupFilter(val);
                  }}
                >
                  <SelectTrigger className="w-[200px] h-9 text-xs font-medium">
                    <SelectValue placeholder="All Class Wings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" className="text-xs">
                      All Class Wings
                    </SelectItem>
                    {ADMISSION_CLASS_GROUPS.map((g) => (
                      <SelectItem key={g} value={g} className="text-xs">
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    if (val) setStatusFilter(val);
                  }}
                >
                  <SelectTrigger className="w-[135px] h-9 text-xs font-medium">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" className="text-xs">
                      All Status
                    </SelectItem>
                    <SelectItem value="Completed" className="text-xs">
                      Completed
                    </SelectItem>
                    <SelectItem value="Scheduled" className="text-xs">
                      Scheduled
                    </SelectItem>
                  </SelectContent>
                </Select>

                {(sessionSearch ||
                  groupFilter !== "ALL" ||
                  statusFilter !== "ALL") && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setSessionSearch("");
                      setGroupFilter("ALL");
                      setStatusFilter("ALL");
                    }}
                    className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Clean Sessions Table (No Horizontal Scroll) */}
            <div>
              <Table className="w-full md:table-fixed text-sm">
                <TableHeader>
                  <TableRow className="bg-muted/60 border-b border-border/70 hover:bg-muted/60">
                    <TableHead className="font-semibold text-xs text-foreground px-5 py-3 text-left">
                      Session & Class Wing
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-3 py-3 text-center md:w-[165px]">
                      Date & Time
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-3 py-3 text-center md:w-[190px]">
                      Exam Hall
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-2 py-3 text-center md:w-[95px]">
                      Applicants
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-2 py-3 text-center md:w-[110px]">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-5 py-3 text-right md:w-[140px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-12 text-center text-xs text-muted-foreground"
                      >
                        No entry test sessions found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSessions.map((ses) => {
                      const count = (applicantsMap[ses.id] || []).length;
                      return (
                        <TableRow
                          key={ses.id}
                          className="hover:bg-muted/30 transition-colors border-b border-border/60"
                        >
                          <TableCell className="px-5 py-3.5 text-left whitespace-normal">
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-foreground text-[13px] leading-snug truncate">
                                {ses.title}
                              </span>
                              <span className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                {ses.classGroup}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="text-xs px-3 py-3.5 text-center whitespace-normal">
                            <div className="flex flex-col items-center min-w-0">
                              <span className="font-medium text-foreground truncate max-w-full">
                                {formatDate(ses.testDate)}
                              </span>
                              <span className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-full">
                                {ses.timing}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="text-xs px-3 py-3.5 text-center text-muted-foreground whitespace-normal">
                            <span className="block truncate font-medium text-foreground/85 mx-auto">
                              {ses.roomHall}
                            </span>
                          </TableCell>

                          <TableCell className="text-xs px-2 py-3.5 text-center font-mono font-semibold text-foreground">
                            {count}
                          </TableCell>

                          <TableCell className="text-xs px-2 py-3.5 text-center">
                            <StatusBadge
                              status={ses.status}
                              tone={
                                ses.status === "Completed" ? "success" : "info"
                              }
                              dot={false}
                            />
                          </TableCell>

                          <TableCell className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => {
                                  setViewSession(ses);
                                  setIsViewSessionOpen(true);
                                }}
                                className="h-7.5 px-2.5 text-xs font-semibold text-foreground hover:text-brand hover:bg-brand-soft/50 hover:border-brand/30 border-border/80 cursor-pointer shadow-2xs gap-1.5"
                              >
                                <Eye className="size-3.5" />
                                <span>View</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => handleDeleteSession(ses.id)}
                                className="h-7.5 w-7.5 p-0 text-muted-foreground hover:text-danger hover:bg-danger-soft/60 cursor-pointer"
                                title="Delete Session"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* ================= SECTION 2: Marks & Evaluation ================= */}
        <TabsContent value="evaluation" className="space-y-4 outline-none">
          <Card className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-xs">
            {/* Header & Clean Session Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/70 bg-muted/20">
              <h2 className="text-sm font-semibold text-foreground">
                Applicant Test Evaluation
              </h2>

              <DropdownMenu>
                <DropdownMenuTrigger className="group inline-flex items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-background hover:bg-muted/50 px-3.5 h-9 text-xs font-medium shadow-2xs transition-all hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 cursor-pointer w-full sm:w-[290px] md:w-[330px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="size-3.5 text-brand shrink-0" />
                    <span className="truncate font-semibold text-foreground">
                      {currentSession ? currentSession.title : "Select Session"}
                    </span>
                  </div>
                  <ChevronDown className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-[300px] sm:w-[350px] max-h-80 p-1.5 rounded-xl shadow-xl border-border/80 space-y-0.5"
                >
                  {sessions.map((s) => {
                    const isSelected = currentSession?.id === s.id;
                    return (
                      <DropdownMenuItem
                        key={s.id}
                        onClick={() => setSelectedSessionId(s.id)}
                        className={cn(
                          "flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                          isSelected
                            ? "bg-brand-soft text-brand"
                            : "hover:bg-muted/70 text-foreground"
                        )}
                      >
                        <div className="flex flex-col min-w-0 flex-1">
                          <span
                            className={cn(
                              "text-xs truncate leading-snug",
                              isSelected
                                ? "font-semibold text-brand"
                                : "font-medium text-foreground"
                            )}
                          >
                            {s.title}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {s.classGroup} • {formatDate(s.testDate)}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="size-3.5 text-brand shrink-0" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {currentSession && (
              <>
                {/* Search & Save Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/60">
                  <div className="relative w-full sm:w-72">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search applicants…"
                      value={applicantSearch}
                      onChange={(e) => setApplicantSearch(e.target.value)}
                      className="pl-9 h-9 text-xs bg-background/60"
                    />
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="text-xs text-muted-foreground font-medium">
                      Qualifying:{" "}
                      <strong className="font-mono font-semibold text-foreground">
                        {currentSession.qualifyingMarks}/{currentSession.totalMarks}
                      </strong>
                    </span>

                    <Button
                      size="sm"
                      onClick={handleSaveEvaluation}
                      className="bg-brand text-brand-foreground hover:bg-brand/90 text-xs h-9 gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Save className="size-3.5" />
                      <span>Save Evaluation</span>
                    </Button>
                  </div>
                </div>

                {/* Applicant Evaluation Table */}
                <div>
                  <Table className="w-full text-sm">
                    <TableHeader>
                      <TableRow className="bg-muted/60 border-b border-border/70 hover:bg-muted/60">
                        <TableHead className="font-semibold text-xs text-foreground px-5 py-3 text-left">
                          Applicant
                        </TableHead>
                        <TableHead className="font-semibold text-xs text-foreground px-3 py-3 text-center">
                          Form #
                        </TableHead>
                        <TableHead className="font-semibold text-xs text-foreground px-3 py-3 text-center">
                          Applied Class
                        </TableHead>
                        <TableHead className="font-semibold text-xs text-foreground px-3 py-3 text-center">
                          Obtained Marks
                        </TableHead>
                        <TableHead className="font-semibold text-xs text-foreground px-3 py-3 text-center">
                          Attendance
                        </TableHead>
                        <TableHead className="font-semibold text-xs text-foreground px-3 py-3 text-center">
                          Status
                        </TableHead>
                        <TableHead className="font-semibold text-xs text-foreground px-5 py-3 text-right">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEvaluationApplicants.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="py-10 text-center text-xs text-muted-foreground"
                          >
                            No applicants found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEvaluationApplicants.map((app) => (
                          <TableRow
                            key={app.id}
                            className={cn(
                              "text-xs hover:bg-muted/30 transition-colors border-b border-border/60",
                              app.isAbsent && "bg-muted/10 opacity-75"
                            )}
                          >
                            <TableCell className="px-5 py-3 text-left">
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-foreground">
                                  {app.applicantName}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  S/D of {app.fatherName}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell className="px-3 py-3 text-center font-mono font-semibold text-foreground whitespace-nowrap">
                              {app.formNo}
                            </TableCell>

                            <TableCell className="px-3 py-3 text-center font-medium text-foreground whitespace-nowrap">
                              {app.appliedClass}
                            </TableCell>

                            <TableCell className="px-3 py-3 text-center">
                              {app.isAbsent ? (
                                <span className="font-mono text-xs font-semibold text-muted-foreground px-2.5 py-1 rounded bg-muted">
                                  ABS
                                </span>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 font-mono">
                                  <Input
                                    type="number"
                                    min="0"
                                    max={currentSession.totalMarks}
                                    value={app.obtainedMarks}
                                    onChange={(e) =>
                                      handleMarkChange(app.id, e.target.value)
                                    }
                                    className="w-20 h-7.5 text-center font-mono text-xs font-bold"
                                  />
                                  <span className="text-muted-foreground text-[11px]">
                                    / {currentSession.totalMarks}
                                  </span>
                                </div>
                              )}
                            </TableCell>

                            <TableCell className="px-3 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleAbsent(app.id)}
                                className={cn(
                                  "text-[10px] font-semibold px-2.5 py-1 rounded-md border transition-colors cursor-pointer",
                                  app.isAbsent
                                    ? "bg-danger-soft text-danger border-danger/20"
                                    : "bg-muted text-muted-foreground border-border/80 hover:text-foreground"
                                )}
                              >
                                {app.isAbsent ? "ABSENT" : "Mark ABS"}
                              </button>
                            </TableCell>

                            <TableCell className="px-3 py-3 text-center whitespace-nowrap">
                              {app.isAbsent ? (
                                <StatusBadge
                                  status="Absent"
                                  tone="neutral"
                                  dot={false}
                                />
                              ) : (
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    className={cn(
                                      "inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
                                      app.resultStatus === "Qualified"
                                        ? "bg-success-soft text-success ring-success/20 hover:ring-success/45"
                                        : "bg-danger-soft text-danger ring-danger/20 hover:ring-danger/45"
                                    )}
                                    title="Click to manually change qualification status"
                                  >
                                    <span>{app.resultStatus}</span>
                                    <ChevronDown className="size-3 opacity-75 shrink-0" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="center"
                                    className="w-48 p-1 rounded-xl shadow-lg border-border/80 space-y-0.5"
                                  >
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleManualQualificationChange(
                                          app.id,
                                          "Qualified"
                                        )
                                      }
                                      className={cn(
                                        "flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer",
                                        app.resultStatus === "Qualified"
                                          ? "bg-success-soft/70 text-success font-semibold"
                                          : "hover:bg-muted/70 text-foreground font-medium"
                                      )}
                                    >
                                      <span>Qualified</span>
                                      {app.resultStatus === "Qualified" && (
                                        <Check className="size-3.5 text-success shrink-0" />
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleManualQualificationChange(
                                          app.id,
                                          "Not Qualified"
                                        )
                                      }
                                      className={cn(
                                        "flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer",
                                        app.resultStatus === "Not Qualified"
                                          ? "bg-danger-soft/70 text-danger font-semibold"
                                          : "hover:bg-muted/70 text-foreground font-medium"
                                      )}
                                    >
                                      <span>Not Qualified</span>
                                      {app.resultStatus === "Not Qualified" && (
                                        <Check className="size-3.5 text-danger shrink-0" />
                                      )}
                                    </DropdownMenuItem>
                                    {app.isManualQualification && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleResetQualificationToAuto(app.id)
                                        }
                                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/70 cursor-pointer border-t border-border/60 mt-1 pt-1.5"
                                      >
                                        <span>Auto-calculate from marks</span>
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </TableCell>

                            <TableCell className="px-5 py-3 text-right whitespace-nowrap">
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => {
                                  setViewApplicant(app);
                                  setIsViewApplicantOpen(true);
                                }}
                                className="h-7.5 px-2.5 text-xs font-semibold text-foreground hover:text-brand hover:bg-brand-soft/50 hover:border-brand/30 border-border/80 cursor-pointer shadow-2xs gap-1.5"
                              >
                                <Eye className="size-3.5" />
                                <span>View</span>
                              </Button>
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

        {/* ================= SECTION 3: Merit List ================= */}
        <TabsContent value="merit" className="space-y-4 outline-none">
          <Card className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/70 bg-muted/20">
              <h2 className="text-sm font-semibold text-foreground">
                Shortlisted Merit List
              </h2>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand font-mono self-start sm:self-auto">
                {meritCandidates.length} Shortlisted
              </span>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-3.5 border-b border-border/60">
              <div className="relative w-full md:w-72 shrink-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search candidates…"
                  value={meritSearch}
                  onChange={(e) => setMeritSearch(e.target.value)}
                  className="pl-9 h-9 text-xs bg-background/60"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 md:ml-auto">
                <Select
                  value={meritClassFilter}
                  onValueChange={(val) => {
                    if (val) setMeritClassFilter(val);
                  }}
                >
                  <SelectTrigger className="w-[175px] h-9 text-xs font-medium">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" className="text-xs">
                      All Classes
                    </SelectItem>
                    {ADMISSION_APPLIED_CLASSES.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={meritDecisionFilter}
                  onValueChange={(val) => {
                    if (val) setMeritDecisionFilter(val);
                  }}
                >
                  <SelectTrigger className="w-[150px] h-9 text-xs font-medium">
                    <SelectValue placeholder="All Decisions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" className="text-xs">
                      All Decisions
                    </SelectItem>
                    <SelectItem value="Approved" className="text-xs">
                      Approved
                    </SelectItem>
                    <SelectItem value="Waitlisted" className="text-xs">
                      Waitlisted
                    </SelectItem>
                  </SelectContent>
                </Select>

                {(meritSearch ||
                  meritClassFilter !== "ALL" ||
                  meritDecisionFilter !== "ALL") && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setMeritSearch("");
                      setMeritClassFilter("ALL");
                      setMeritDecisionFilter("ALL");
                    }}
                    className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Merit Table */}
            <div>
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow className="bg-muted/60 border-b border-border/70 hover:bg-muted/60">
                    <TableHead className="font-semibold text-xs text-foreground px-5 py-3 text-left w-24">
                      Merit #
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-3 py-3 text-center">
                      Candidate
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-3 py-3 text-center">
                      Form #
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-3 py-3 text-center">
                      Applied Class
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-3 py-3 text-center">
                      Test Score
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-3 py-3 text-center">
                      Decision
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground px-5 py-3 text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meritCandidates.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-12 text-center text-xs text-muted-foreground"
                      >
                        No shortlisted candidates match the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    meritCandidates.map((cand, idx) => {
                      const candSession =
                        sessions.find((s) => s.id === cand.sessionId) || null;
                      return (
                        <TableRow
                          key={cand.id}
                          className="hover:bg-muted/30 transition-colors border-b border-border/60"
                        >
                          <TableCell className="px-5 py-3.5 text-left font-mono font-bold text-xs text-brand">
                            #{idx + 1}
                          </TableCell>

                          <TableCell className="px-3 py-3.5 text-center">
                            <div className="flex flex-col items-center min-w-0">
                              <span className="font-semibold text-foreground text-[13px] leading-snug">
                                {cand.applicantName}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                S/D of {cand.fatherName}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="px-3 py-3.5 text-center font-mono text-xs font-semibold text-foreground whitespace-nowrap">
                            {cand.formNo}
                          </TableCell>

                          <TableCell className="px-3 py-3.5 text-center text-xs font-medium text-foreground whitespace-nowrap">
                            {cand.appliedClass}
                          </TableCell>

                          <TableCell className="px-4 py-3.5 text-center font-mono text-xs whitespace-nowrap">
                            <span className="font-bold text-foreground">
                              {cand.obtainedMarks}/{cand.totalMarks}
                            </span>{" "}
                            <span className="text-muted-foreground">
                              ({cand.percentage}%)
                            </span>
                          </TableCell>

                          <TableCell className="px-3 py-3.5 text-center whitespace-nowrap">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                className={cn(
                                  "inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
                                  cand.decision === "Approved"
                                    ? "bg-success-soft text-success ring-success/20 hover:ring-success/45"
                                    : "bg-brand-50 text-brand ring-brand/15 hover:ring-brand/40"
                                )}
                                title="Click to change admission decision"
                              >
                                <span>{cand.decision}</span>
                                <ChevronDown className="size-3 opacity-75 shrink-0" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="center"
                                className="w-40 p-1 rounded-xl shadow-lg border-border/80 space-y-0.5"
                              >
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateDecision(cand.id, "Approved")
                                  }
                                  className={cn(
                                    "flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer",
                                    cand.decision === "Approved"
                                      ? "bg-success-soft/70 text-success font-semibold"
                                      : "hover:bg-muted/70 text-foreground font-medium"
                                  )}
                                >
                                  <span>Approved</span>
                                  {cand.decision === "Approved" && (
                                    <Check className="size-3.5 text-success shrink-0" />
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateDecision(cand.id, "Waitlisted")
                                  }
                                  className={cn(
                                    "flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer",
                                    cand.decision === "Waitlisted"
                                      ? "bg-brand-soft text-brand font-semibold"
                                      : "hover:bg-muted/70 text-foreground font-medium"
                                  )}
                                >
                                  <span>Waitlisted</span>
                                  {cand.decision === "Waitlisted" && (
                                    <Check className="size-3.5 text-brand shrink-0" />
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>

                          <TableCell className="px-5 py-3.5 text-right whitespace-nowrap">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => {
                                setViewApplicant(cand);
                                setViewSession(candSession);
                                setIsViewApplicantOpen(true);
                              }}
                              className="h-7.5 px-2.5 text-xs font-semibold text-foreground hover:text-brand hover:bg-brand-soft/50 hover:border-brand/30 border-border/80 cursor-pointer shadow-2xs gap-1.5"
                            >
                              <Eye className="size-3.5" />
                              <span>View</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Entry Test Dialog */}
      <ScheduleSessionDialog
        open={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
        onAddSession={handleAddSession}
      />

      {/* View Test Session Dialog */}
      <ViewSessionDialog
        open={isViewSessionOpen}
        onOpenChange={setIsViewSessionOpen}
        session={
          viewSession
            ? sessions.find((s) => s.id === viewSession.id) || viewSession
            : null
        }
        applicants={viewSession ? applicantsMap[viewSession.id] || [] : []}
        onOpenEvaluation={handleOpenEvaluation}
      />

      {/* View Applicant Details Dialog */}
      <ViewApplicantDialog
        open={isViewApplicantOpen}
        onOpenChange={setIsViewApplicantOpen}
        applicant={
          viewApplicant
            ? activeApplicants.find((a) => a.id === viewApplicant.id) ||
              (applicantsMap[viewApplicant.sessionId] || []).find(
                (a) => a.id === viewApplicant.id
              ) ||
              viewApplicant
            : null
        }
        session={
          viewApplicant
            ? sessions.find((s) => s.id === viewApplicant.sessionId) || null
            : null
        }
        onUpdateDecision={handleUpdateDecision}
        onManualQualification={handleManualQualificationChange}
      />

      {/* Print Merit List Dialog */}
      <PrintMeritListDialog
        open={isPrintMeritOpen}
        onOpenChange={setIsPrintMeritOpen}
        candidates={meritCandidates}
        classFilterLabel={
          meritClassFilter === "ALL" ? "All Classes" : meritClassFilter
        }
      />
    </div>
  );
}
