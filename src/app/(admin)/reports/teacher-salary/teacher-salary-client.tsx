"use client";

import * as React from "react";
import {
  Calculator,
  Printer,
  Download,
  FileSpreadsheet,
  Search,
  Filter,
  UserCheck,
  Building2,
  Calendar,
  CreditCard,
  TrendingUp,
  Receipt,
  FileText,
  BadgePercent,
  Layers,
  ArrowUpDown,
  Eye,
  CheckCircle2,
  Clock,
  Briefcase,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { UserAvatar } from "@/components/shared/user-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  TEACHER_PROFILES,
  AVAILABLE_YEARS,
  AVAILABLE_CAMPUSES,
  AVAILABLE_DEPARTMENTS,
  getAllTeacherYearlySummaries,
  buildTeacherYearlySummary,
  type TeacherProfile,
  type YearlyTeacherSalarySummary,
  type MonthlyTeacherSalary,
} from "@/lib/mock/teacher-salary";
import {
  printIndividualTeacherAnnualStatement,
  printConsolidatedFacultyAnnualReport,
  printTeacherAnnualTaxCertificate,
  exportTeacherSalaryPdf,
  exportConsolidatedRosterCsv,
  exportIndividualTeacherCsv,
} from "./teacher-salary-export";
import { TeacherSalaryModal } from "./teacher-salary-modal";
import { TaxCertificateModal } from "./tax-certificate-modal";

export function TeacherSalaryClient() {
  // Global Filter State
  const [selectedYearVal, setSelectedYearVal] = React.useState("2026");
  const [selectedCampus, setSelectedCampus] = React.useState("All Campuses");
  const [selectedDept, setSelectedDept] = React.useState("All Departments");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("individual");

  // Selected Teacher for Individual Statement Tab
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>(
    TEACHER_PROFILES[0].id
  );

  // Modal states
  const [inspectSummary, setInspectSummary] =
    React.useState<YearlyTeacherSalarySummary | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [taxModalOpen, setTaxModalOpen] = React.useState(false);
  const [taxModalSummary, setTaxModalSummary] =
    React.useState<YearlyTeacherSalarySummary | null>(null);

  // Active Year Meta
  const currentYearConfig = React.useMemo(() => {
    return (
      AVAILABLE_YEARS.find((y) => y.value === selectedYearVal) ||
      AVAILABLE_YEARS[0]
    );
  }, [selectedYearVal]);

  const yearNumber = currentYearConfig.year;
  const periodLabel = currentYearConfig.session;

  // Generate all summaries for the selected year
  const allSummaries = React.useMemo(() => {
    return getAllTeacherYearlySummaries(yearNumber, periodLabel);
  }, [yearNumber, periodLabel]);

  // Filtered summaries for Consolidated Roster and Stats
  const filteredSummaries = React.useMemo(() => {
    return allSummaries.filter((s) => {
      const matchCampus =
        selectedCampus === "All Campuses" ||
        s.teacher.campus.toLowerCase().includes(selectedCampus.toLowerCase()) ||
        selectedCampus.toLowerCase().includes(s.teacher.campus.toLowerCase());
      const matchDept =
        selectedDept === "All Departments" ||
        s.teacher.department === selectedDept;
      const matchSearch =
        !searchQuery.trim() ||
        s.teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.teacher.empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.teacher.assignedSubjects.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.teacher.department.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCampus && matchDept && matchSearch;
    });
  }, [allSummaries, selectedCampus, selectedDept, searchQuery]);

  // Selected Teacher Summary
  const currentTeacherSummary = React.useMemo(() => {
    const found = allSummaries.find((s) => s.teacher.id === selectedTeacherId);
    return found || allSummaries[0];
  }, [allSummaries, selectedTeacherId]);

  // KPI Aggregations
  const totalFacultyCount = filteredSummaries.length;
  const grandGross = filteredSummaries.reduce(
    (s, r) => s + r.annualGrossSalary,
    0
  );
  const grandNet = filteredSummaries.reduce(
    (s, r) => s + r.annualNetDisbursed,
    0
  );
  const grandTax = filteredSummaries.reduce(
    (s, r) => s + r.annualTaxDeducted,
    0
  );
  const grandPf = filteredSummaries.reduce(
    (s, r) => s + r.annualProvidentFund + r.annualEobi,
    0
  );
  const avgFacultyPackage =
    totalFacultyCount > 0 ? Math.round(grandGross / totalFacultyCount) : 0;

  // Monthly totals across all filtered teachers (for the analytics chart)
  const monthlyAggregates = React.useMemo(() => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    return months.map((mName, mIdx) => {
      let gross = 0;
      let net = 0;
      let tax = 0;
      filteredSummaries.forEach((s) => {
        const m = s.monthlyRecords[mIdx];
        if (m) {
          gross += m.grossSalary;
          net += m.netSalary;
          tax += m.taxDeduction;
        }
      });
      return { month: mName, gross, net, tax };
    });
  }, [filteredSummaries]);

  // Department-wise breakdown
  const departmentBreakdown = React.useMemo(() => {
    const map: Record<string, { count: number; gross: number; net: number }> = {};
    filteredSummaries.forEach((s) => {
      const dept = s.teacher.department;
      if (!map[dept]) {
        map[dept] = { count: 0, gross: 0, net: 0 };
      }
      map[dept].count += 1;
      map[dept].gross += s.annualGrossSalary;
      map[dept].net += s.annualNetDisbursed;
    });

    return Object.entries(map).map(([department, data]) => ({
      department,
      count: data.count,
      gross: data.gross,
      net: data.net,
      percent: grandGross > 0 ? (data.gross / grandGross) * 100 : 0,
    }));
  }, [filteredSummaries, grandGross]);

  // Handler for opening Inspect Modal
  const handleInspectTeacher = (summary: YearlyTeacherSalarySummary) => {
    setInspectSummary(summary);
    setModalOpen(true);
  };

  // Handler for opening Tax Certificate Modal
  const handleOpenTaxCert = (summary: YearlyTeacherSalarySummary) => {
    setTaxModalSummary(summary);
    setTaxModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Teacher Yearly Salary Reports & Analytics"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (activeTab === "individual" && currentTeacherSummary) {
                  exportIndividualTeacherCsv(currentTeacherSummary);
                } else {
                  exportConsolidatedRosterCsv(filteredSummaries, periodLabel);
                }
                toast.success("CSV report downloaded successfully");
              }}
            >
              <FileSpreadsheet className="size-4 mr-1.5 text-emerald-600" />
              Export CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (currentTeacherSummary) {
                  exportTeacherSalaryPdf(currentTeacherSummary, periodLabel);
                  toast.success(`PDF statement generated for ${currentTeacherSummary.teacher.name}`);
                }
              }}
            >
              <Download className="size-4 mr-1.5 text-blue-600" />
              Teacher PDF
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 h-8 text-xs font-semibold shadow-xs transition-colors cursor-pointer focus:outline-none">
                <Printer className="size-4 mr-1" />
                Print Reports
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Print Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (currentTeacherSummary) {
                      printIndividualTeacherAnnualStatement(
                        currentTeacherSummary,
                        periodLabel
                      );
                    }
                  }}
                >
                  <FileText className="size-4 mr-2 text-blue-600" />
                  Active Teacher Statement (A4)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    printConsolidatedFacultyAnnualReport(
                      filteredSummaries,
                      periodLabel,
                      selectedCampus
                    );
                  }}
                >
                  <Layers className="size-4 mr-2 text-indigo-600" />
                  Consolidated Faculty Roster
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (currentTeacherSummary) {
                      printTeacherAnnualTaxCertificate(
                        currentTeacherSummary,
                        periodLabel
                      );
                    }
                  }}
                >
                  <ShieldCheck className="size-4 mr-2 text-emerald-600" />
                  Annual Tax Certificate (WHT)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      {/* Global Filter Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            {/* Year / Session selector */}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Year / Academic Session
              </label>
              <Select
                value={selectedYearVal}
                onValueChange={(val) => {
                  if (val) setSelectedYearVal(String(val));
                }}
              >
                <SelectTrigger className="w-full bg-background font-medium">
                  <Calendar className="size-4 mr-2 text-blue-600" />
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_YEARS.map((y) => (
                    <SelectItem key={y.value} value={y.value}>
                      {y.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campus filter */}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Campus Location
              </label>
              <Select
                value={selectedCampus}
                onValueChange={(val) => {
                  if (val) setSelectedCampus(String(val));
                }}
              >
                <SelectTrigger className="w-full bg-background">
                  <Building2 className="size-4 mr-2 text-slate-500" />
                  <SelectValue placeholder="All Campuses" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_CAMPUSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department filter */}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Faculty Department
              </label>
              <Select
                value={selectedDept}
                onValueChange={(val) => {
                  if (val) setSelectedDept(String(val));
                }}
              >
                <SelectTrigger className="w-full bg-background">
                  <Briefcase className="size-4 mr-2 text-slate-500" />
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Input */}
          <div className="lg:w-72">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Search Faculty
            </label>
            <div className="relative">
              <Search className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search teacher, code, subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <StatGrid>
        <StatCard
          label={`Annual Faculty Gross (${selectedYearVal})`}
          value={formatCurrency(grandGross)}
          icon={Receipt}
        />
        <StatCard
          label="Net Remuneration Disbursed"
          value={formatCurrency(grandNet)}
          icon={CreditCard}
        />
        <StatCard
          label="Statutory Tax (WHT FBR)"
          value={`-${formatCurrency(grandTax)}`}
          icon={BadgePercent}
        />
        <StatCard
          label="Provident Fund & EOBI"
          value={`-${formatCurrency(grandPf)}`}
          icon={ShieldCheck}
        />
        <StatCard
          label="Teaching Faculty Count"
          value={`${totalFacultyCount} Teachers`}
          icon={GraduationCap}
        />
        <StatCard
          label="Avg Annual Teacher Package"
          value={formatCurrency(avgFacultyPackage)}
          icon={TrendingUp}
        />
      </StatGrid>

      {/* Main Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-2">
          <TabsList className="bg-muted/80 p-1">
            <TabsTrigger value="individual" className="gap-2">
              <UserCheck className="size-4" />
              Individual Teacher Statement
            </TabsTrigger>
            <TabsTrigger value="roster" className="gap-2">
              <Layers className="size-4" />
              Consolidated Faculty Roster
            </TabsTrigger>
            <TabsTrigger value="tax-summary" className="gap-2">
              <ShieldCheck className="size-4" />
              Annual Tax &amp; WHT Summary
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="size-4" />
              Yearly Analytics &amp; Trends
            </TabsTrigger>
          </TabsList>

          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Showing records for: <strong className="text-foreground">{periodLabel}</strong>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            TAB 1: INDIVIDUAL TEACHER STATEMENT (DETAILED 12-MONTH VIEW)
            ───────────────────────────────────────────────────────────────── */}
        <TabsContent value="individual" className="space-y-6 m-0">
          {/* Teacher Selector Toolbar */}
          <SectionCard
            title={
              <div className="flex items-center gap-2">
                <GraduationCap className="size-5 text-blue-600" />
                <span>Select Faculty Member</span>
              </div>
            }
            description="Choose a teacher to generate and print their full 12-month annual compensation statement, statutory tax deductions, and payment vouchers."
            action={
              <div className="flex items-center gap-3">
                <Select
                  value={selectedTeacherId}
                  onValueChange={(val) => {
                    if (val) setSelectedTeacherId(String(val));
                  }}
                >
                  <SelectTrigger className="w-64 bg-background font-medium">
                    <SelectValue placeholder="Choose a Teacher" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {TEACHER_PROFILES.map((tp) => (
                      <SelectItem key={tp.id} value={tp.id}>
                        {tp.name} ({tp.empCode}) &middot; {tp.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
          >
            {/* Teacher Profile Banner */}
            {currentTeacherSummary && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-xl p-5 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                      <UserAvatar
                        name={currentTeacherSummary.teacher.name}
                        className="size-16 text-xl border-2 border-white/20 bg-white/10 text-white font-bold shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-xl font-bold font-heading">
                            {currentTeacherSummary.teacher.name}
                          </h3>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/15 text-blue-200">
                            {currentTeacherSummary.teacher.empCode}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                            {currentTeacherSummary.overallStatus}
                          </span>
                        </div>
                        <p className="text-sm text-blue-200/90 mt-1">
                          {currentTeacherSummary.teacher.designation} &middot; {currentTeacherSummary.teacher.department}
                        </p>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Assigned: {currentTeacherSummary.teacher.assignedSubjects}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/15 hover:bg-white/25 text-white border-0"
                        onClick={() =>
                          printIndividualTeacherAnnualStatement(
                            currentTeacherSummary,
                            periodLabel
                          )
                        }
                      >
                        <Printer className="size-4 mr-1.5" />
                        Print Official Statement
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/15 hover:bg-white/25 text-white border-0"
                        onClick={() =>
                          handleOpenTaxCert(currentTeacherSummary)
                        }
                      >
                        <ShieldCheck className="size-4 mr-1.5" />
                        Tax Cert (WHT)
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/15 hover:bg-white/25 text-white border-0"
                        onClick={() =>
                          exportTeacherSalaryPdf(
                            currentTeacherSummary,
                            periodLabel
                          )
                        }
                      >
                        <Download className="size-4 mr-1.5" />
                        PDF
                      </Button>
                    </div>
                  </div>

                  {/* Profile info grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-white/10 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Campus</span>
                      <span className="font-semibold text-white">{currentTeacherSummary.teacher.campus}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Salary Grade Tier</span>
                      <span className="font-semibold text-white">{currentTeacherSummary.teacher.gradeTier}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">CNIC &amp; NTN</span>
                      <span className="font-mono text-white">{currentTeacherSummary.teacher.cnic} | {currentTeacherSummary.teacher.ntn}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Disbursement Account</span>
                      <span className="font-semibold text-white truncate block">
                        {currentTeacherSummary.teacher.bankName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Teacher Annual Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="rounded-lg border border-border p-3.5 bg-card">
                    <span className="text-[11px] text-muted-foreground block font-medium">
                      Annual Gross Earnings
                    </span>
                    <span className="text-lg font-bold text-foreground font-mono mt-1 block">
                      {formatCurrency(currentTeacherSummary.annualGrossSalary)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">12 months total</span>
                  </div>

                  <div className="rounded-lg border border-border p-3.5 bg-card">
                    <span className="text-[11px] text-muted-foreground block font-medium">
                      Annual Basic Pay
                    </span>
                    <span className="text-lg font-bold text-foreground font-mono mt-1 block">
                      {formatCurrency(currentTeacherSummary.annualBaseSalary)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {Math.round((currentTeacherSummary.annualBaseSalary / currentTeacherSummary.annualGrossSalary) * 100)}% of gross
                    </span>
                  </div>

                  <div className="rounded-lg border border-border p-3.5 bg-card">
                    <span className="text-[11px] text-muted-foreground block font-medium">
                      Income Tax Withheld (WHT)
                    </span>
                    <span className="text-lg font-bold text-red-600 dark:text-red-400 font-mono mt-1 block">
                      -{formatCurrency(currentTeacherSummary.annualTaxDeducted)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {currentTeacherSummary.effectiveTaxRate}% effective rate
                    </span>
                  </div>

                  <div className="rounded-lg border border-border p-3.5 bg-card">
                    <span className="text-[11px] text-muted-foreground block font-medium">
                      Provident Fund &amp; EOBI
                    </span>
                    <span className="text-lg font-bold text-red-600 dark:text-red-400 font-mono mt-1 block">
                      -{formatCurrency(currentTeacherSummary.annualProvidentFund + currentTeacherSummary.annualEobi)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">PF 8.33% matched</span>
                  </div>

                  <div className="rounded-lg border border-emerald-500/30 p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block font-semibold">
                      Net Remuneration Disbursed
                    </span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                      {formatCurrency(currentTeacherSummary.annualNetDisbursed)}
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                      Avg {formatCurrency(currentTeacherSummary.averageMonthlyNet)} / mo
                    </span>
                  </div>
                </div>

                {/* 12-Month Table */}
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="p-3.5 bg-muted/50 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-blue-600" />
                      <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
                        Month-by-Month Remuneration Schedule (January – December {yearNumber})
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      Disbursed: {currentTeacherSummary.monthsPaidCount} / 12 Months
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/80 text-muted-foreground border-b border-border">
                        <tr>
                          <th className="py-2.5 px-3 text-left font-semibold">Month</th>
                          <th className="py-2.5 px-3 text-left font-semibold">Voucher #</th>
                          <th className="py-2.5 px-3 text-right font-semibold">Basic Pay</th>
                          <th className="py-2.5 px-3 text-right font-semibold">House Rent (30%)</th>
                          <th className="py-2.5 px-3 text-right font-semibold">Medical (10%)</th>
                          <th className="py-2.5 px-3 text-right font-semibold">Conv. &amp; Special</th>
                          <th className="py-2.5 px-3 text-right font-semibold">Gross Pay</th>
                          <th className="py-2.5 px-3 text-right font-semibold">Tax (WHT)</th>
                          <th className="py-2.5 px-3 text-right font-semibold">PF &amp; EOBI</th>
                          <th className="py-2.5 px-3 text-right font-semibold">Total Ded.</th>
                          <th className="py-2.5 px-3 text-right font-semibold">Net Disbursed</th>
                          <th className="py-2.5 px-3 text-center font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {currentTeacherSummary.monthlyRecords.map((m, idx) => (
                          <tr
                            key={m.monthKey}
                            className={idx % 2 === 0 ? "bg-card" : "bg-muted/15"}
                          >
                            <td className="py-2.5 px-3 font-semibold text-foreground">
                              {m.monthShort} {yearNumber}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">
                              {m.voucherNo}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              {formatCurrency(m.baseSalary)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              {formatCurrency(m.houseRentAllowance)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              {formatCurrency(m.medicalAllowance)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              {formatCurrency(m.conveyanceAllowance + m.specialAllowance)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                              {formatCurrency(m.grossSalary)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-red-600 dark:text-red-400">
                              -{formatCurrency(m.taxDeduction)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-red-600 dark:text-red-400">
                              -{formatCurrency(m.providentFund + m.eobi)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-red-600 dark:text-red-400 font-medium">
                              -{formatCurrency(m.totalDeductions)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(m.netSalary)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  m.status === "Disbursed"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    : m.status === "Pending"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                }`}
                              >
                                {m.status}
                              </span>
                            </td>
                          </tr>
                        ))}

                        {/* Grand Totals */}
                        <tr className="bg-slate-100 dark:bg-muted font-bold border-t-2 border-border text-foreground">
                          <td colSpan={2} className="py-3 px-3">
                            ANNUAL TOTALS ({yearNumber})
                          </td>
                          <td className="py-3 px-3 text-right font-mono">
                            {formatCurrency(currentTeacherSummary.annualBaseSalary)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono">
                            {formatCurrency(currentTeacherSummary.annualHra)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono">
                            {formatCurrency(currentTeacherSummary.annualMedical)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono">
                            {formatCurrency(
                              currentTeacherSummary.annualConveyance +
                                currentTeacherSummary.annualSpecial
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-blue-900 dark:text-blue-300 text-sm">
                            {formatCurrency(currentTeacherSummary.annualGrossSalary)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-red-600 dark:text-red-400">
                            -{formatCurrency(currentTeacherSummary.annualTaxDeducted)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-red-600 dark:text-red-400">
                            -{formatCurrency(
                              currentTeacherSummary.annualProvidentFund +
                                currentTeacherSummary.annualEobi
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-red-600 dark:text-red-400">
                            -{formatCurrency(currentTeacherSummary.annualTotalDeductions)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                            {formatCurrency(currentTeacherSummary.annualNetDisbursed)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              {currentTeacherSummary.monthsPaidCount}/12
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* ─────────────────────────────────────────────────────────────────
            TAB 2: CONSOLIDATED FACULTY ROSTER (ALL TEACHERS)
            ───────────────────────────────────────────────────────────────── */}
        <TabsContent value="roster" className="space-y-6 m-0">
          <SectionCard
            title={
              <div className="flex items-center gap-2">
                <Layers className="size-5 text-indigo-600" />
                <span>Faculty Consolidated Annual Salary Roster ({periodLabel})</span>
              </div>
            }
            description="Aggregated 12-month remuneration, statutory tax withholding, and net disbursements for all teaching faculty across campuses."
            action={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportConsolidatedRosterCsv(filteredSummaries, periodLabel)
                  }
                >
                  <FileSpreadsheet className="size-4 mr-1.5 text-emerald-600" />
                  Export Roster CSV
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() =>
                    printConsolidatedFacultyAnnualReport(
                      filteredSummaries,
                      periodLabel,
                      selectedCampus
                    )
                  }
                >
                  <Printer className="size-4 mr-1.5" />
                  Print Consolidated Roster
                </Button>
              </div>
            }
          >
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/80 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-3 px-3 text-left font-semibold">Teacher / Faculty</th>
                    <th className="py-3 px-3 text-left font-semibold">Department &amp; Campus</th>
                    <th className="py-3 px-3 text-left font-semibold">Grade Tier</th>
                    <th className="py-3 px-3 text-right font-semibold">Annual Basic</th>
                    <th className="py-3 px-3 text-right font-semibold">Allowances</th>
                    <th className="py-3 px-3 text-right font-semibold">Annual Gross</th>
                    <th className="py-3 px-3 text-right font-semibold">Tax (WHT)</th>
                    <th className="py-3 px-3 text-right font-semibold">PF &amp; Deductions</th>
                    <th className="py-3 px-3 text-right font-semibold">Net Disbursed</th>
                    <th className="py-3 px-3 text-center font-semibold">Paid</th>
                    <th className="py-3 px-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSummaries.map((s, idx) => (
                    <tr
                      key={s.teacher.id}
                      className={`hover:bg-muted/40 transition-colors ${
                        idx % 2 === 0 ? "bg-card" : "bg-muted/10"
                      }`}
                    >
                      {/* Faculty Info */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            name={s.teacher.name}
                            className="size-8 text-xs shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-foreground block">
                              {s.teacher.name}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {s.teacher.empCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department & Campus */}
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-foreground block">
                          {s.teacher.department}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {s.teacher.campus.replace(" Campus", "")}
                        </span>
                      </td>

                      {/* Grade Tier */}
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] font-medium text-foreground">
                          {s.teacher.gradeTier.split(" ")[0]} {s.teacher.gradeTier.split(" ")[1]}
                        </span>
                        <span className="block text-[10px] text-muted-foreground truncate max-w-[130px]">
                          {s.teacher.designation}
                        </span>
                      </td>

                      {/* Annual Basic */}
                      <td className="py-2.5 px-3 text-right font-mono">
                        {formatCurrency(s.annualBaseSalary)}
                      </td>

                      {/* Allowances */}
                      <td className="py-2.5 px-3 text-right font-mono">
                        {formatCurrency(
                          s.annualHra +
                            s.annualMedical +
                            s.annualConveyance +
                            s.annualSpecial
                        )}
                      </td>

                      {/* Annual Gross */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                        {formatCurrency(s.annualGrossSalary)}
                      </td>

                      {/* Tax Deducted */}
                      <td className="py-2.5 px-3 text-right font-mono text-red-600 dark:text-red-400">
                        -{formatCurrency(s.annualTaxDeducted)}
                      </td>

                      {/* PF & Deductions */}
                      <td className="py-2.5 px-3 text-right font-mono text-red-600 dark:text-red-400">
                        -{formatCurrency(s.annualTotalDeductions - s.annualTaxDeducted)}
                      </td>

                      {/* Net Disbursed */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatCurrency(s.annualNetDisbursed)}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            s.overallStatus === "Fully Disbursed"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          }`}
                        >
                          {s.monthsPaidCount}/12M
                        </span>
                      </td>

                      {/* Row Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-7 p-0"
                            title="View 12-Month Statement"
                            onClick={() => handleInspectTeacher(s)}
                          >
                            <Eye className="size-3.5 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-7 p-0"
                            title="Print Statement"
                            onClick={() =>
                              printIndividualTeacherAnnualStatement(s, periodLabel)
                            }
                          >
                            <Printer className="size-3.5 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-7 p-0"
                            title="Tax Certificate"
                            onClick={() => handleOpenTaxCert(s)}
                          >
                            <ShieldCheck className="size-3.5 text-emerald-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Grand Totals */}
                  <tr className="bg-slate-100 dark:bg-muted font-bold border-t-2 border-border text-foreground">
                    <td colSpan={3} className="py-3 px-3">
                      CONSOLIDATED FACULTY TOTALS ({totalFacultyCount} TEACHERS)
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {formatCurrency(
                        filteredSummaries.reduce((s, r) => s + r.annualBaseSalary, 0)
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {formatCurrency(
                        filteredSummaries.reduce(
                          (s, r) =>
                            s +
                            r.annualHra +
                            r.annualMedical +
                            r.annualConveyance +
                            r.annualSpecial,
                          0
                        )
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-blue-900 dark:text-blue-300 text-sm">
                      {formatCurrency(grandGross)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-red-600 dark:text-red-400">
                      -{formatCurrency(grandTax)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-red-600 dark:text-red-400">
                      -{formatCurrency(
                        filteredSummaries.reduce(
                          (s, r) => s + (r.annualTotalDeductions - r.annualTaxDeducted),
                          0
                        )
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 text-sm font-extrabold">
                      {formatCurrency(grandNet)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        100%
                      </span>
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionCard>
        </TabsContent>

        {/* ─────────────────────────────────────────────────────────────────
            TAB 3: ANNUAL TAX & WHT SUMMARY (FBR COMPLIANCE)
            ───────────────────────────────────────────────────────────────── */}
        <TabsContent value="tax-summary" className="space-y-6 m-0">
          <SectionCard
            title={
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-emerald-600" />
                <span>Annual Salary Tax Withholding &amp; FBR Compliance ({periodLabel})</span>
              </div>
            }
            description="Statutory tax computation, exemptions under Clause 139, and formal withholding certificates under Section 149 of the Income Tax Ordinance 2001."
            action={
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    if (currentTeacherSummary) {
                      printTeacherAnnualTaxCertificate(currentTeacherSummary, periodLabel);
                    }
                  }}
                >
                  <Printer className="size-4 mr-1.5" />
                  Print Selected Tax Cert
                </Button>
              </div>
            }
          >
            {/* Tax Highlights Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-muted/40 border border-border mb-5 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Total Taxable Faculty Salary</span>
                <span className="text-base font-bold text-foreground font-mono">
                  {formatCurrency(filteredSummaries.reduce((s, r) => s + r.taxableIncome, 0))}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Medical Exemption (Clause 139)</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatCurrency(filteredSummaries.reduce((s, r) => s + r.taxExemptAllowance, 0))}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Total WHT Deposited to FBR</span>
                <span className="text-base font-bold text-red-600 dark:text-red-400 font-mono">
                  {formatCurrency(grandTax)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Withholding Agent NTN</span>
                <span className="font-mono text-base font-bold text-blue-700 dark:text-blue-300">
                  4192083-7
                </span>
              </div>
            </div>

            {/* Tax Table */}
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/80 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-3 px-3 text-left font-semibold">Teacher Name &amp; Code</th>
                    <th className="py-3 px-3 text-left font-semibold">CNIC &amp; NTN</th>
                    <th className="py-3 px-3 text-right font-semibold">Gross Salary</th>
                    <th className="py-3 px-3 text-right font-semibold">Exempt Medical</th>
                    <th className="py-3 px-3 text-right font-semibold">Net Taxable Income</th>
                    <th className="py-3 px-3 text-right font-semibold">Tax Slab Rate</th>
                    <th className="py-3 px-3 text-right font-semibold">Total Tax Deducted</th>
                    <th className="py-3 px-3 text-left font-semibold">Certificate Ref</th>
                    <th className="py-3 px-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSummaries.map((s, idx) => (
                    <tr
                      key={s.teacher.id}
                      className={idx % 2 === 0 ? "bg-card" : "bg-muted/10"}
                    >
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-foreground block">
                          {s.teacher.name}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {s.teacher.empCode} &middot; {s.teacher.department}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <span className="text-foreground block">{s.teacher.cnic}</span>
                        <span className="text-muted-foreground">NTN: {s.teacher.ntn}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium">
                        {formatCurrency(s.annualGrossSalary)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                        -{formatCurrency(s.taxExemptAllowance)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                        {formatCurrency(s.taxableIncome)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {s.effectiveTaxRate}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(s.annualTaxDeducted)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-muted-foreground">
                        {s.taxCertificateRef}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          onClick={() => handleOpenTaxCert(s)}
                        >
                          <ShieldCheck className="size-3.5 mr-1 text-emerald-600" />
                          Certificate
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </TabsContent>

        {/* ─────────────────────────────────────────────────────────────────
            TAB 4: YEARLY ANALYTICS & TRENDS
            ───────────────────────────────────────────────────────────────── */}
        <TabsContent value="analytics" className="space-y-6 m-0">
          {/* Monthly Spending Trend Bars */}
          <SectionCard
            title={
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-blue-600" />
                <span>Monthly Faculty Salary Disbursement Curve ({yearNumber})</span>
              </div>
            }
            description="Progression of gross vs net disbursements throughout the 12 calendar months."
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
                {monthlyAggregates.map((m) => {
                  const maxGross = Math.max(...monthlyAggregates.map((x) => x.gross));
                  const heightPercent = maxGross > 0 ? (m.gross / maxGross) * 100 : 0;

                  return (
                    <div
                      key={m.month}
                      className="rounded-lg border border-border p-2.5 bg-card flex flex-col justify-between text-center"
                    >
                      <span className="text-[11px] font-bold text-muted-foreground">
                        {m.month}
                      </span>
                      <div className="h-28 flex items-end justify-center py-2 gap-1">
                        {/* Gross bar */}
                        <div
                          className="w-3 rounded-t bg-blue-600/80 transition-all hover:bg-blue-600"
                          style={{ height: `${Math.max(15, heightPercent)}%` }}
                          title={`Gross: ${formatCurrency(m.gross)}`}
                        />
                        {/* Net bar */}
                        <div
                          className="w-3 rounded-t bg-emerald-500/80 transition-all hover:bg-emerald-500"
                          style={{
                            height: `${Math.max(12, heightPercent * 0.85)}%`,
                          }}
                          title={`Net: ${formatCurrency(m.net)}`}
                        />
                      </div>
                      <div className="pt-1 border-t border-border/60">
                        <span className="text-[10px] font-mono font-semibold text-foreground block truncate">
                          {formatCurrency(m.net)}
                        </span>
                        <span className="text-[9px] text-muted-foreground block">
                          Net Disbursed
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded bg-blue-600/80" />
                  <span>Gross Remuneration</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded bg-emerald-500/80" />
                  <span>Net Disbursed</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Department Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard
              title={
                <div className="flex items-center gap-2">
                  <Briefcase className="size-5 text-indigo-600" />
                  <span>Department Salary Allocation</span>
                </div>
              }
              description="Annual faculty budget share by academic discipline."
            >
              <div className="space-y-3.5">
                {departmentBreakdown.map((dept) => (
                  <div key={dept.department} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center font-medium">
                      <span className="text-foreground">
                        {dept.department} ({dept.count} Teachers)
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {formatCurrency(dept.gross)} ({dept.percent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
                        style={{ width: `${dept.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title={
                <div className="flex items-center gap-2">
                  <Calculator className="size-5 text-emerald-600" />
                  <span>Compensation Component Composition</span>
                </div>
              }
              description="Distribution of base pay, statutory allowances, and deductions."
            >
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Basic Salary</span>
                    <span className="font-mono font-bold text-foreground">62.4%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: "62.4%" }} />
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">House Rent Allowance (30%)</span>
                    <span className="font-mono font-bold text-foreground">18.7%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: "18.7%" }} />
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Medical &amp; Conveyance</span>
                    <span className="font-mono font-bold text-foreground">11.3%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "11.3%" }} />
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Special / Academic Bonuses</span>
                    <span className="font-mono font-bold text-foreground">7.6%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "7.6%" }} />
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <TeacherSalaryModal
        summary={inspectSummary}
        periodLabel={periodLabel}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onOpenTaxCert={handleOpenTaxCert}
      />

      <TaxCertificateModal
        summary={taxModalSummary}
        periodLabel={periodLabel}
        open={taxModalOpen}
        onOpenChange={setTaxModalOpen}
      />
    </div>
  );
}
