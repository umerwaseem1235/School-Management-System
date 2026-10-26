"use client";

import * as React from "react";
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  AlertOctagon,
  Printer,
  Download,
  Send,
  Building2,
  CalendarDays,
  Banknote,
  GraduationCap,
  Users,
  Layers,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionButton } from "@/components/shared/action-button";
import { PersonCell } from "@/components/shared/user-avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  CAMPUS_REALIZATION,
  FEE_DEFAULTERS,
  STUDENT_FEE_REPORTS,
  type CampusRealizationSummary,
  type FeeDefaulterRecord,
  type StudentFeeReportRecord,
} from "@/lib/mock/finance";
import { STAFF_SALARIES, type StaffSalaryRecord } from "@/lib/mock/payroll";
import {
  exportFeeReportsPdf,
  printFeeReportsReport,
  printSingleStudentFeeStatement,
  printSingleStaffSalaryStatement,
  type ReportPeriodMode,
  type ReportTabKey,
} from "./reports-export";

const CAMPUS_ITEMS = [
  { value: "All Campuses", label: "All Campuses (Consolidated)" },
  { value: "Main Campus — Gulberg", label: "Main Campus — Gulberg" },
  { value: "DHA Phase 5 Campus", label: "DHA Phase 5 Campus" },
  { value: "F-8 Islamabad Campus", label: "F-8 Islamabad Campus" },
  { value: "Clifton Campus", label: "Clifton Campus" },
  { value: "Bahria Town Campus", label: "Bahria Town Campus" },
];

const REPORT_TYPE_ITEMS: { value: ReportTabKey; label: string }[] = [
  { value: "campus-summary", label: "Campus Fee & Salary Summary" },
  { value: "student-fees", label: "Student Fee Reports (Individual)" },
  { value: "staff-salaries", label: "Staff Salary Reports (Individual)" },
  { value: "defaulters", label: "Aging & Fee Defaulters" },
];

const PERIOD_MODE_ITEMS: { value: ReportPeriodMode; label: string }[] = [
  { value: "monthly", label: "Monthly View (Month-wise)" },
  { value: "annual", label: "Annual View (Jan – Dec | 12M)" },
];

const MONTH_ITEMS = [
  { value: "December 2026", label: "December 2026" },
  { value: "November 2026", label: "November 2026" },
  { value: "October 2026", label: "October 2026" },
  { value: "September 2026", label: "September 2026" },
  { value: "August 2026", label: "August 2026" },
  { value: "July 2026", label: "July 2026" },
  { value: "June 2026", label: "June 2026" },
  { value: "May 2026", label: "May 2026" },
  { value: "April 2026", label: "April 2026" },
  { value: "March 2026", label: "March 2026" },
  { value: "February 2026", label: "February 2026" },
  { value: "January 2026", label: "January 2026" },
];

const MONTH_VARIATION_FACTORS: Record<string, number> = {
  "December 2026": 1.0,
  "November 2026": 1.0,
  "October 2026": 1.0,
  "September 2026": 0.98,
  "August 2026": 0.97,
  "July 2026": 0.95,
  "June 2026": 0.96,
  "May 2026": 0.99,
  "April 2026": 0.94,
  "March 2026": 1.0,
  "February 2026": 1.0,
  "January 2026": 1.0,
};

function matchesSelectedCampus(recordCampus: string, selectedCampus: string): boolean {
  if (!selectedCampus || selectedCampus === "All Campuses") return true;
  const normRecord = recordCampus.toLowerCase();
  const normSelected = selectedCampus.toLowerCase();
  if (normRecord === normSelected) return true;
  if (normSelected.includes("gulberg") && normRecord.includes("gulberg")) return true;
  if (normSelected.includes("dha") && normRecord.includes("dha")) return true;
  if (normSelected.includes("f-8") && normRecord.includes("f-8")) return true;
  if (normSelected.includes("clifton") && normRecord.includes("clifton")) return true;
  if (normSelected.includes("bahria") && normRecord.includes("bahria")) return true;
  return false;
}

export function ReportsClient() {
  const [activeTab, setActiveTab] = React.useState<ReportTabKey>("campus-summary");
  const [selectedCampus, setSelectedCampus] = React.useState<string>("All Campuses");
  const [periodMode, setPeriodMode] = React.useState<ReportPeriodMode>("monthly");
  const [selectedMonth, setSelectedMonth] = React.useState<string>("October 2026");

  const monthFactor =
    periodMode === "monthly" ? (MONTH_VARIATION_FACTORS[selectedMonth] ?? 1.0) : 1.0;
  const periodMultiplier = periodMode === "annual" ? 12 : monthFactor;
  const salaryMultiplier = periodMode === "annual" ? 12 : 1;

  const periodDisplayLabel =
    periodMode === "annual" ? "Annual AY 2026–27 (12M)" : selectedMonth;

  // Filtered datasets based on selectedCampus
  const filteredCampuses = React.useMemo(
    () =>
      CAMPUS_REALIZATION.filter((c) =>
        matchesSelectedCampus(c.campus, selectedCampus)
      ),
    [selectedCampus]
  );

  const filteredStudentFees = React.useMemo(
    () =>
      STUDENT_FEE_REPORTS.filter((s) =>
        matchesSelectedCampus(s.campus, selectedCampus)
      ),
    [selectedCampus]
  );

  const filteredStaffSalaries = React.useMemo(
    () =>
      STAFF_SALARIES.filter((s) =>
        matchesSelectedCampus(s.campus, selectedCampus)
      ),
    [selectedCampus]
  );

  const filteredDefaulters = React.useMemo(
    () =>
      FEE_DEFAULTERS.filter((d) =>
        matchesSelectedCampus(d.campus, selectedCampus)
      ),
    [selectedCampus]
  );

  // Dynamic KPIs
  const totalBilled = React.useMemo(
    () =>
      Math.round(
        filteredCampuses.reduce((s, c) => s + c.totalBilled, 0) * periodMultiplier
      ),
    [filteredCampuses, periodMultiplier]
  );

  const totalCollected = React.useMemo(
    () =>
      Math.round(
        filteredCampuses.reduce((s, c) => s + c.totalCollected, 0) *
          periodMultiplier
      ),
    [filteredCampuses, periodMultiplier]
  );

  const totalStaffPayroll = React.useMemo(
    () =>
      Math.round(
        filteredCampuses.reduce((s, c) => s + c.staffNetPayroll, 0) *
          salaryMultiplier
      ),
    [filteredCampuses, salaryMultiplier]
  );

  const avgEfficiency =
    totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

  const totalDefaultersCount = React.useMemo(
    () => filteredCampuses.reduce((s, c) => s + c.defaultersCount, 0),
    [filteredCampuses]
  );

  const handleSendReminder = React.useCallback((phone: string, student: string) => {
    toast.success(
      `Fee recovery SMS & WhatsApp notice sent to ${student}'s guardian (${phone}).`
    );
  }, []);

  const handleResetFilters = React.useCallback(() => {
    setSelectedCampus("All Campuses");
    setPeriodMode("monthly");
    setSelectedMonth("October 2026");
    toast.info("Report filters reset to All Campuses (Monthly — October 2026).");
  }, []);

  // 1. Campus-Wise Fee & Staff Payroll Summary Columns
  const campusColumns = React.useMemo<Column<CampusRealizationSummary>[]>(
    () => [
      {
        key: "campus",
        header: "Campus Name",
        align: "center",
        className: "w-[22%] text-center",
        headerClassName: "w-[22%] text-center",
        cell: (r) => (
          <div className="flex flex-col items-center justify-center text-center">
            <p className="font-semibold text-foreground text-xs">{r.campus}</p>
            <p className="text-[11px] text-muted-foreground">
              {r.enrolledStudents} Students · {r.staffCount} Staff
            </p>
          </div>
        ),
      },
      {
        key: "period",
        header: "Cycle",
        align: "center",
        className: "w-[12%] text-center",
        headerClassName: "w-[12%] text-center",
        cell: () => (
          <span className="inline-flex items-center rounded-md bg-brand/8 px-2 py-0.5 text-[11px] font-semibold text-brand whitespace-nowrap">
            {periodMode === "annual" ? "AY 2026–27 (12M)" : selectedMonth}
          </span>
        ),
      },
      {
        key: "totalBilled",
        header: "Fee Billed",
        align: "center",
        className: "w-[13%] text-center",
        headerClassName: "w-[13%] text-center",
        cell: (r) => (
          <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
            {formatCurrency(Math.round(r.totalBilled * periodMultiplier))}
          </span>
        ),
      },
      {
        key: "totalCollected",
        header: "Fee Collected",
        align: "center",
        className: "w-[13%] text-center",
        headerClassName: "w-[13%] text-center",
        cell: (r) => (
          <span className="font-mono text-xs font-bold tabular-nums text-emerald-700">
            {formatCurrency(Math.round(r.totalCollected * periodMultiplier))}
          </span>
        ),
      },
      {
        key: "totalOutstanding",
        header: "Fee Outstanding",
        align: "center",
        className: "w-[13%] text-center",
        headerClassName: "w-[13%] text-center",
        cell: (r) => (
          <span className="font-mono text-xs font-semibold tabular-nums text-danger">
            {formatCurrency(Math.round(r.totalOutstanding * periodMultiplier))}
          </span>
        ),
      },
      {
        key: "staffNetPayroll",
        header: "Staff Payroll",
        align: "center",
        className: "w-[14%] text-center",
        headerClassName: "w-[14%] text-center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-bold tabular-nums text-[#091d3e]">
              {formatCurrency(Math.round(r.staffNetPayroll * salaryMultiplier))}
            </span>
            <p className="text-[10.5px] text-muted-foreground">
              Gross: {formatCurrency(Math.round(r.staffGrossPayroll * salaryMultiplier))}
            </p>
          </div>
        ),
      },
      {
        key: "collectionRate",
        header: "Efficiency",
        align: "center",
        className: "w-[13%] text-center",
        headerClassName: "w-[13%] text-center",
        cell: (r) => (
          <div className="flex flex-col items-center justify-center gap-0.5">
            <span className="font-mono text-xs font-bold text-brand tabular-nums">
              {formatPercent(r.collectionRate)}
            </span>
            <span className="rounded bg-rose-50 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-rose-700 ring-1 ring-rose-500/20">
              {r.defaultersCount} Defaulters
            </span>
          </div>
        ),
      },
    ],
    [periodMode, selectedMonth, periodMultiplier, salaryMultiplier]
  );

  // 2. Student Fee Reports Columns (Month-wise or Annual-wise)
  const studentFeeColumns = React.useMemo<Column<StudentFeeReportRecord>[]>(
    () => [
      {
        key: "rollNo",
        header: "Roll & Challan",
        align: "center",
        className: "w-[13%] text-center",
        headerClassName: "w-[13%] text-center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="font-mono text-xs font-bold text-foreground">
              Roll #{r.rollNo}
            </p>
            <p className="font-mono text-[11px] text-muted-foreground">
              {r.challanNumber}
            </p>
          </div>
        ),
      },
      {
        key: "student",
        header: "Student",
        align: "center",
        className: "w-[17%] text-center",
        headerClassName: "w-[17%] text-center",
        cell: (r) => (
          <PersonCell
            name={r.student}
            subtitle={`${r.className} · F/N: ${r.fatherName}`}
            showAvatar={false}
            className="text-center"
          />
        ),
      },
      {
        key: "campus",
        header: "Campus",
        align: "center",
        className: "w-[14%] text-center",
        headerClassName: "w-[14%] text-center",
        cell: (r) => (
          <span className="text-xs font-semibold text-foreground">
            {r.campus.replace("Main Campus — ", "")}
          </span>
        ),
      },
      {
        key: "cycle",
        header: "Billing Cycle",
        align: "center",
        className: "w-[12%] text-center",
        headerClassName: "w-[12%] text-center",
        cell: () => (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-tight whitespace-nowrap",
              periodMode === "annual"
                ? "border border-brand/25 bg-brand-50 text-brand"
                : "border border-slate-300 bg-slate-100 text-slate-700"
            )}
          >
            {periodMode === "annual" ? "Annual (12M)" : selectedMonth}
          </span>
        ),
      },
      {
        key: "payable",
        header: periodMode === "annual" ? "Annual Fee" : "Monthly Fee",
        align: "center",
        className: "w-[12%] text-center",
        headerClassName: "w-[12%] text-center",
        cell: (r) => {
          const payable =
            periodMode === "annual"
              ? r.annualPayable
              : Math.round(r.monthlyPayable * monthFactor);
          return (
            <div className="space-y-0.5 text-center">
              <span className="font-mono text-xs font-bold tabular-nums text-foreground">
                {formatCurrency(payable)}
              </span>
              {r.scholarshipDiscount > 0 && (
                <p className="text-[10px] font-medium text-emerald-700">
                  Waiver: -{formatCurrency(r.scholarshipDiscount * (periodMode === "annual" ? 12 : 1))}
                </p>
              )}
            </div>
          );
        },
      },
      {
        key: "paid",
        header: "Paid Amount",
        align: "center",
        className: "w-[12%] text-center",
        headerClassName: "w-[12%] text-center",
        cell: (r) => {
          const paid =
            periodMode === "annual"
              ? r.annualPaid
              : Math.round(r.monthlyPaid * monthFactor);
          return (
            <span className="font-mono text-xs font-bold tabular-nums text-emerald-700">
              {formatCurrency(paid)}
            </span>
          );
        },
      },
      {
        key: "balance",
        header: "Balance Due",
        align: "center",
        className: "w-[11%] text-center",
        headerClassName: "w-[11%] text-center",
        cell: (r) => {
          const payable =
            periodMode === "annual"
              ? r.annualPayable
              : Math.round(r.monthlyPayable * monthFactor);
          const paid =
            periodMode === "annual"
              ? r.annualPaid
              : Math.round(r.monthlyPaid * monthFactor);
          const balance = Math.max(0, payable - paid);
          return (
            <span
              className={cn(
                "font-mono text-xs font-bold tabular-nums",
                balance > 0 ? "text-danger" : "text-muted-foreground"
              )}
            >
              {formatCurrency(balance)}
            </span>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        className: "w-[9%] text-center",
        headerClassName: "w-[9%] text-center",
        cell: (r) => (
          <div className="flex justify-center">
            <StatusBadge status={r.status} />
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        className: "w-[10%] text-center",
        headerClassName: "w-[10%] text-center",
        cell: (r) => (
          <div className="flex justify-center">
            <ActionButton
              tone="outline"
              size="xs"
              title={`Print ${periodMode === "annual" ? "Annual (Jan–Dec)" : selectedMonth} Fee Statement for ${r.student}`}
              onClick={() => {
                printSingleStudentFeeStatement(r, periodMode, selectedMonth);
                toast.info(
                  `Opening ${periodMode === "annual" ? "Jan–Dec annual" : selectedMonth} fee statement for ${r.student}…`
                );
              }}
            >
              <Printer className="size-3.5" />
              <span>Statement</span>
            </ActionButton>
          </div>
        ),
      },
    ],
    [periodMode, selectedMonth, monthFactor]
  );

  // 3. Staff Salary Reports Columns (Month-wise or Annual-wise)
  const staffSalaryColumns = React.useMemo<Column<StaffSalaryRecord>[]>(
    () => [
      {
        key: "empCode",
        header: "Emp Code",
        align: "center",
        className: "w-[11%] text-center",
        headerClassName: "w-[11%] text-center",
        cell: (r) => (
          <span className="font-mono text-xs font-bold text-foreground">
            {r.empCode}
          </span>
        ),
      },
      {
        key: "name",
        header: "Staff Member",
        align: "center",
        className: "w-[18%] text-center",
        headerClassName: "w-[18%] text-center",
        cell: (r) => (
          <PersonCell
            name={r.name}
            subtitle={`${r.designation} · ${r.department}`}
            showAvatar={false}
            className="text-center"
          />
        ),
      },
      {
        key: "campus",
        header: "Campus & Type",
        align: "center",
        className: "w-[14%] text-center",
        headerClassName: "w-[14%] text-center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-xs font-semibold text-foreground">{r.campus}</p>
            <p className="text-[11px] text-muted-foreground">{r.type}</p>
          </div>
        ),
      },
      {
        key: "cycle",
        header: "Payroll Cycle",
        align: "center",
        className: "w-[12%] text-center",
        headerClassName: "w-[12%] text-center",
        cell: () => (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-tight whitespace-nowrap",
              periodMode === "annual"
                ? "border border-brand/25 bg-brand-50 text-brand"
                : "border border-slate-300 bg-slate-100 text-slate-700"
            )}
          >
            {periodMode === "annual" ? "Annual (12M)" : selectedMonth}
          </span>
        ),
      },
      {
        key: "grossSalary",
        header: periodMode === "annual" ? "Annual Gross" : "Monthly Gross",
        align: "center",
        className: "w-[13%] text-center",
        headerClassName: "w-[13%] text-center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
              {formatCurrency(r.grossSalary * salaryMultiplier)}
            </span>
            <p className="text-[10px] text-muted-foreground">
              Basic: {formatCurrency(r.baseSalary * salaryMultiplier)}
            </p>
          </div>
        ),
      },
      {
        key: "deductions",
        header: "Deductions",
        align: "center",
        className: "w-[11%] text-center",
        headerClassName: "w-[11%] text-center",
        cell: (r) => (
          <span className="font-mono text-xs font-semibold tabular-nums text-danger">
            -{formatCurrency(r.totalDeductions * salaryMultiplier)}
          </span>
        ),
      },
      {
        key: "netSalary",
        header: periodMode === "annual" ? "Annual Net Pay" : "Monthly Net Pay",
        align: "center",
        className: "w-[13%] text-center",
        headerClassName: "w-[13%] text-center",
        cell: (r) => (
          <span className="font-mono text-xs font-bold tabular-nums text-emerald-700">
            {formatCurrency(r.netSalary * salaryMultiplier)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        className: "w-[9%] text-center",
        headerClassName: "w-[9%] text-center",
        cell: (r) => (
          <div className="flex justify-center">
            <StatusBadge status={r.status === "On Hold" ? "Pending" : r.status} />
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        className: "w-[10%] text-center",
        headerClassName: "w-[10%] text-center",
        cell: (r) => (
          <div className="flex justify-center">
            <ActionButton
              tone="outline"
              size="xs"
              title={`Print ${periodMode === "annual" ? "Annual (Jan–Dec)" : selectedMonth} Salary Statement for ${r.name}`}
              onClick={() => {
                printSingleStaffSalaryStatement(r, periodMode, selectedMonth);
                toast.info(
                  `Opening ${periodMode === "annual" ? "Jan–Dec annual" : selectedMonth} salary statement for ${r.name}…`
                );
              }}
            >
              <Printer className="size-3.5" />
              <span>Pay Slip</span>
            </ActionButton>
          </div>
        ),
      },
    ],
    [periodMode, selectedMonth, salaryMultiplier]
  );

  // 4. Aging & Defaulters Columns
  const defaulterColumns = React.useMemo<Column<FeeDefaulterRecord>[]>(
    () => [
      {
        key: "student",
        header: "Defaulter Student",
        align: "center",
        className: "w-[22%] text-center",
        headerClassName: "w-[22%] text-center",
        cell: (r) => (
          <PersonCell
            name={r.student}
            subtitle={`Challan: ${r.challanNumber} · ${r.className}`}
            showAvatar={false}
            className="text-center"
          />
        ),
      },
      {
        key: "guardian",
        header: "Guardian Contact",
        align: "center",
        className: "w-[16%] text-center",
        headerClassName: "w-[16%] text-center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-xs font-semibold text-foreground">{r.guardianName}</p>
            <p className="font-mono text-[11px] text-muted-foreground">{r.phone}</p>
          </div>
        ),
      },
      {
        key: "campus",
        header: "Campus",
        align: "center",
        className: "w-[14%] text-center",
        headerClassName: "w-[14%] text-center",
        cell: (r) => <span className="text-[13px]">{r.campus}</span>,
      },
      {
        key: "months",
        header: "Overdue Billing",
        align: "center",
        className: "w-[16%] text-center",
        headerClassName: "w-[16%] text-center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-xs font-semibold text-foreground">{r.overdueMonths}</p>
            <p className="text-[11px] font-bold text-danger">
              {r.daysOverdue} days overdue
            </p>
          </div>
        ),
      },
      {
        key: "severity",
        header: "Aging Bracket",
        align: "center",
        className: "w-[12%] text-center",
        headerClassName: "w-[12%] text-center",
        cell: (r) => {
          const isCrit = r.severity.startsWith("Critical");
          const isHigh = r.severity.startsWith("High");
          return (
            <span
              className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${
                isCrit
                  ? "bg-rose-100 text-rose-800 ring-1 ring-rose-500/30"
                  : isHigh
                  ? "bg-amber-100 text-amber-800 ring-1 ring-amber-500/30"
                  : "bg-slate-100 text-slate-800 ring-1 ring-slate-400/30"
              }`}
            >
              {r.severity}
            </span>
          );
        },
      },
      {
        key: "balanceDue",
        header: "Arrears Due",
        align: "center",
        className: "w-[10%] text-center",
        headerClassName: "w-[10%] text-center",
        cell: (r) => (
          <span className="font-mono text-xs font-bold text-danger tabular-nums">
            {formatCurrency(r.balanceDue)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        className: "w-[10%] text-center",
        headerClassName: "w-[10%] text-center",
        cell: (r) => (
          <div className="flex justify-center">
            <ActionButton
              tone="outline"
              size="xs"
              onClick={() => handleSendReminder(r.phone, r.student)}
            >
              <Send className="size-3.5" />
              <span>Send Alert</span>
            </ActionButton>
          </div>
        ),
      },
    ],
    [handleSendReminder]
  );

  // Table Filters
  const studentFeeFilters: FilterDef<StudentFeeReportRecord>[] = [
    {
      key: "status",
      label: "Status",
      options: ["Paid", "Partial", "Unpaid", "Overdue"],
      getValue: (r) => r.status,
    },
    {
      key: "className",
      label: "Class",
      options: [
        "Grade 3-B",
        "Grade 4-A",
        "Grade 4-C",
        "Grade 5-C",
        "Grade 6-B",
        "Grade 7-A",
        "Grade 7-B",
        "Grade 8-A",
        "Grade 8-B",
        "Grade 9-A",
        "Grade 10-A",
        "Grade 11-A",
        "Grade 12-A",
      ],
      getValue: (r) => r.className,
    },
  ];

  const staffSalaryFilters: FilterDef<StaffSalaryRecord>[] = [
    {
      key: "type",
      label: "Category",
      options: ["Teaching", "Non-Teaching"],
      getValue: (r) => r.type,
    },
    {
      key: "status",
      label: "Status",
      options: ["Disbursed", "Approved", "Pending"],
      getValue: (r) => r.status,
    },
  ];

  const handlePrint = React.useCallback(() => {
    const ok = printFeeReportsReport({
      activeTab,
      selectedCampus,
      periodMode,
      selectedMonth,
      campusList: filteredCampuses,
      studentFeesList: filteredStudentFees,
      staffSalariesList: filteredStaffSalaries,
      defaultersList: filteredDefaulters,
    });
    if (ok) {
      toast.info(
        `Opening print preview for ${selectedCampus} (${periodDisplayLabel})…`
      );
    }
  }, [
    activeTab,
    selectedCampus,
    periodMode,
    selectedMonth,
    periodDisplayLabel,
    filteredCampuses,
    filteredStudentFees,
    filteredStaffSalaries,
    filteredDefaulters,
  ]);

  const handleExportPdf = React.useCallback(() => {
    const ok = exportFeeReportsPdf({
      activeTab,
      selectedCampus,
      periodMode,
      selectedMonth,
      campusList: filteredCampuses,
      studentFeesList: filteredStudentFees,
      staffSalariesList: filteredStaffSalaries,
      defaultersList: filteredDefaulters,
    });
    if (ok) {
      toast.success(
        `Report downloaded as PDF (${selectedCampus} · ${periodDisplayLabel}).`
      );
    }
  }, [
    activeTab,
    selectedCampus,
    periodMode,
    selectedMonth,
    periodDisplayLabel,
    filteredCampuses,
    filteredStudentFees,
    filteredStaffSalaries,
    filteredDefaulters,
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fee & Payroll Reports"
        className="mb-0 lg:mb-0"
        actions={
          <>
            <ActionButton tone="outline" size="md" onClick={handlePrint}>
              <Printer />
              <span>Print Report</span>
            </ActionButton>
            <ActionButton tone="pdf" size="md" onClick={handleExportPdf}>
              <Download />
              <span>Export PDF</span>
            </ActionButton>
          </>
        }
      />

      {/* Executive Dropdown Filter Bar */}
      <div className="rounded-xl border border-border/80 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Campus Selector Dropdown */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <Building2 className="size-3.5 text-brand" />
              <span>Select Campus</span>
            </label>
            <Select
              items={CAMPUS_ITEMS}
              value={selectedCampus}
              onValueChange={(v) => setSelectedCampus(String(v))}
            >
              <SelectTrigger className="h-9! w-full rounded-[4px] border-brand/20 bg-white text-xs font-semibold shadow-2xs hover:border-brand/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[var(--anchor-width)] w-auto max-w-[280px]">
                {CAMPUS_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Report Category / View Dropdown */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <Layers className="size-3.5 text-brand" />
              <span>Report Type</span>
            </label>
            <Select
              items={REPORT_TYPE_ITEMS}
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as ReportTabKey)}
            >
              <SelectTrigger className="h-9! w-full rounded-[4px] border-brand/20 bg-white text-xs font-semibold shadow-2xs hover:border-brand/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[var(--anchor-width)] w-auto max-w-[300px]">
                {REPORT_TYPE_ITEMS.map((item) => {
                  const count =
                    item.value === "campus-summary"
                      ? filteredCampuses.length
                      : item.value === "student-fees"
                      ? filteredStudentFees.length
                      : item.value === "staff-salaries"
                      ? filteredStaffSalaries.length
                      : filteredDefaulters.length;
                  return (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label} ({count})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Billing Frequency Dropdown (Monthly vs Annual) */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <BarChart3 className="size-3.5 text-brand" />
              <span>Billing Frequency</span>
            </label>
            <Select
              items={PERIOD_MODE_ITEMS}
              value={periodMode}
              onValueChange={(v) => setPeriodMode(v as ReportPeriodMode)}
            >
              <SelectTrigger className="h-9! w-full rounded-[4px] border-brand/20 bg-white text-xs font-semibold shadow-2xs hover:border-brand/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[var(--anchor-width)] w-auto max-w-[260px]">
                {PERIOD_MODE_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 4. Month / Academic Year Selector Dropdown */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-brand" />
                <span>{periodMode === "annual" ? "Academic Session" : "Select Month"}</span>
              </span>
              {(selectedCampus !== "All Campuses" ||
                periodMode !== "monthly" ||
                selectedMonth !== "October 2026") && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline cursor-pointer"
                >
                  <RotateCcw className="size-2.5" />
                  Reset
                </button>
              )}
            </label>
            {periodMode === "monthly" ? (
              <Select
                items={MONTH_ITEMS}
                value={selectedMonth}
                onValueChange={(v) => setSelectedMonth(String(v))}
              >
                <SelectTrigger className="h-9! w-full rounded-[4px] border-brand/20 bg-white text-xs font-semibold shadow-2xs hover:border-brand/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="min-w-[var(--anchor-width)] w-auto max-w-[240px]">
                  {MONTH_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex h-9 items-center justify-between rounded-[4px] border border-brand/25 bg-brand-50/50 px-3 text-xs font-bold text-brand">
                <span>AY 2026–27 (12 Months)</span>
                <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px]">
                  Annualized
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <StatGrid>
        <StatCard
          label={
            periodMode === "annual"
              ? "Total Fee Billed (Annual)"
              : `Fee Billed (${selectedMonth})`
          }
          value={formatCurrency(totalBilled)}
          icon={CreditCard}
        />
        <StatCard
          label="Realized Fee Collections"
          value={formatCurrency(totalCollected)}
          icon={TrendingUp}
        />
        <StatCard
          label={
            periodMode === "annual"
              ? "Staff Payroll (Annual)"
              : `Staff Payroll (${selectedMonth})`
          }
          value={formatCurrency(totalStaffPayroll)}
          icon={Banknote}
        />
        <StatCard
          label="Collection Efficiency"
          value={`${formatPercent(avgEfficiency)} (${totalDefaultersCount} Due)`}
          icon={AlertOctagon}
        />
      </StatGrid>

      {/* Active Report View (Controlled by Report Type Dropdown) */}
      {activeTab === "campus-summary" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Building2 className="size-4" />
              </span>
              <h2 className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg">
                Campus-Wise Fee &amp; Staff Salary Realization ({periodDisplayLabel})
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-50/70 px-3 py-1 text-xs font-semibold text-brand">
              <span>{filteredCampuses.length} Campuses</span>
              <span>·</span>
              <span>{periodMode === "annual" ? "Jan – Dec (12M)" : selectedMonth}</span>
            </span>
          </div>

          <SectionCard flush contentClassName="pt-5">
            <DataTable
              data={filteredCampuses}
              columns={campusColumns}
              getRowId={(r) => r.campus}
              searchPlaceholder="Search campus name…"
              searchFn={(r, q) => r.campus.toLowerCase().includes(q)}
              pageSize={6}
            />
          </SectionCard>
        </div>
      )}

      {activeTab === "student-fees" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <GraduationCap className="size-4" />
              </span>
              <h2 className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg">
                Student Fee Collection &amp; Billing Ledger — {selectedCampus} ({periodDisplayLabel})
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-50/70 px-3 py-1 text-xs font-semibold text-brand">
              <span>{filteredStudentFees.length} Students</span>
              <span>·</span>
              <span>{periodMode === "annual" ? "Jan – Dec (12M)" : selectedMonth}</span>
            </span>
          </div>

          <SectionCard flush contentClassName="pt-5">
            <DataTable
              data={filteredStudentFees}
              columns={studentFeeColumns}
              getRowId={(r) => r.id}
              filters={studentFeeFilters}
              searchPlaceholder="Search student name, roll #, challan # or father name…"
              searchFn={(r, q) =>
                r.student.toLowerCase().includes(q) ||
                r.rollNo.toLowerCase().includes(q) ||
                r.challanNumber.toLowerCase().includes(q) ||
                r.fatherName.toLowerCase().includes(q) ||
                r.className.toLowerCase().includes(q)
              }
              pageSize={8}
            />
          </SectionCard>
        </div>
      )}

      {activeTab === "staff-salaries" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Users className="size-4" />
              </span>
              <h2 className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg">
                Staff Salary &amp; Compensation Register — {selectedCampus} ({periodDisplayLabel})
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-50/70 px-3 py-1 text-xs font-semibold text-brand">
              <span>{filteredStaffSalaries.length} Staff Members</span>
              <span>·</span>
              <span>{periodMode === "annual" ? "Jan – Dec (12M)" : selectedMonth}</span>
            </span>
          </div>

          <SectionCard flush contentClassName="pt-5">
            <DataTable
              data={filteredStaffSalaries}
              columns={staffSalaryColumns}
              getRowId={(r) => r.id}
              filters={staffSalaryFilters}
              searchPlaceholder="Search staff member, emp code, designation or department…"
              searchFn={(r, q) =>
                r.name.toLowerCase().includes(q) ||
                r.empCode.toLowerCase().includes(q) ||
                r.designation.toLowerCase().includes(q) ||
                r.department.toLowerCase().includes(q)
              }
              pageSize={8}
            />
          </SectionCard>
        </div>
      )}

      {activeTab === "defaulters" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-700">
                <AlertOctagon className="size-4" />
              </span>
              <h2 className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg">
                Fee Defaulters &amp; Aging Bracket Ledger — {selectedCampus}
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/25 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
              <span>{filteredDefaulters.length} Defaulters</span>
              <span>·</span>
              <span>Recovery Queue</span>
            </span>
          </div>

          <SectionCard flush contentClassName="pt-5">
            <DataTable
              data={filteredDefaulters}
              columns={defaulterColumns}
              getRowId={(r) => r.id}
              searchPlaceholder="Search defaulter, challan or guardian…"
              searchFn={(r, q) =>
                r.student.toLowerCase().includes(q) ||
                r.guardianName.toLowerCase().includes(q) ||
                r.challanNumber.toLowerCase().includes(q)
              }
              pageSize={8}
            />
          </SectionCard>
        </div>
      )}
    </div>
  );
}
