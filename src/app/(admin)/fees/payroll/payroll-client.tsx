"use client";

import * as React from "react";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  Plus,
  Printer,
  Receipt,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { ActionButton } from "@/components/shared/action-button";
import { cn } from "@/lib/utils";
import { formatCurrency, formatCurrencyCompact } from "@/lib/format";
import {
  STAFF_SALARIES,
  DISBURSEMENT_ACCOUNTS,
  PAYROLL_BATCH_SUMMARIES,
  type StaffSalaryRecord,
  type DisbursementAccountRecord,
  type PayrollBatchSummary,
} from "@/lib/mock/payroll";
import { exportPayrollPdf, printPayrollReport, printSinglePayslip } from "./payroll-export";
import { PayslipModal } from "./payslip-modal";
import { AddSalaryModal } from "./add-salary-modal";
import { RunPayrollModal } from "./run-payroll-modal";
import { PayrollCalendarDropdown } from "./payroll-calendar";
import { GenerateSlipModal } from "./generate-slip-modal";

// ─── Constants ────────────────────────────────────────────────────────────────

const CAMPUS_OPTIONS = [
  "All Campuses",
  "Gulberg",
  "DHA Phase 5",
  "F-8 Islamabad",
  "Clifton",
  "Bahria Town",
];

const DEPT_OPTIONS = [
  "All Departments",
  "Sciences",
  "Languages & Literature",
  "Humanities",
  "Technology",
  "Primary",
  "Finance",
  "Admin & Operations",
];

const STATUS_OPTIONS = ["All Statuses", "Paid", "Pending", "Approved", "On Hold"];
const MODE_OPTIONS = ["All Methods", "Bank Transfer", "Cheque", "Cash"];

const TABLE_HEAD_ROW_CLASS =
  "border-y border-[#091d3e] bg-gradient-to-r from-[#1e4275] via-[#12294d] to-[#091d3e] text-white shadow-sm";

const TABLE_HEAD_CELL_CLASS =
  "relative whitespace-nowrap px-5 py-3.5 text-center align-middle text-[12.5px] font-bold tracking-[-0.01em] text-white select-none not-last:after:pointer-events-none not-last:after:absolute not-last:after:right-0 not-last:after:top-1/2 not-last:after:h-4 not-last:after:w-px not-last:after:-translate-y-1/2 not-last:after:bg-white/20";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSlipNo(s: StaffSalaryRecord, index: number): string {
  const parts = s.monthYear.split(" ");
  const months: Record<string, string> = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };
  const monthNum = months[parts[0]] ?? "01";
  const year = parts[1] ?? "2026";
  const seq = String(index + 1).padStart(3, "0");
  return `SLP-${year}${monthNum}-${seq}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PayrollClient() {
  const [salaries, setSalaries] = React.useState<StaffSalaryRecord[]>(STAFF_SALARIES);
  const [accounts] = React.useState<DisbursementAccountRecord[]>(DISBURSEMENT_ACCOUNTS);
  const [batches, setBatches] = React.useState<PayrollBatchSummary[]>(PAYROLL_BATCH_SUMMARIES);

  // Modals state
  const [selectedSalary, setSelectedSalary] = React.useState<StaffSalaryRecord | null>(null);
  const [payslipOpen, setPayslipOpen] = React.useState(false);
  const [addSalaryOpen, setAddSalaryOpen] = React.useState(false);
  const [editingSalary, setEditingSalary] = React.useState<StaffSalaryRecord | null>(null);
  const [runPayrollOpen, setRunPayrollOpen] = React.useState(false);
  const [generateSlipOpen, setGenerateSlipOpen] = React.useState(false);

  // Filters state
  const [selectedCycle, setSelectedCycle] = React.useState("November 2026");
  const [search, setSearch] = React.useState("");
  const [selectedCampus, setSelectedCampus] = React.useState("All Campuses");
  const [selectedDept, setSelectedDept] = React.useState("All Departments");
  const [selectedStatus, setSelectedStatus] = React.useState("All Statuses");
  const [selectedMode] = React.useState("All Methods");

  // Pagination state
  const [page, setPage] = React.useState(0);
  const pageSize = 10;

  // Reset page on filter changes
  React.useEffect(() => {
    setPage(0);
  }, [search, selectedCycle, selectedCampus, selectedDept, selectedStatus, selectedMode]);

  // Status transition handler
  const handleStatusChange = (
    id: string,
    newStatus: "Paid" | "Disbursed" | "Pending" | "Approved" | "On Hold",
    reason?: string
  ) => {
    setSalaries((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return newStatus === "Paid" || newStatus === "Disbursed"
            ? {
                ...s,
                status: "Paid" as const,
                disbursedDate: new Date().toISOString().slice(0, 10),
                transactionRef: `FT${Math.floor(2600000000 + Math.random() * 99999999)}`,
              }
            : {
                ...s,
                status: newStatus,
                disbursedDate: undefined,
                transactionRef: undefined,
              };
        }
        return s;
      })
    );

    const item = salaries.find((s) => s.id === id);
    const staffName = item?.name || "Staff member";

    if (newStatus === "Approved") {
      toast.success(`Salary approved for ${staffName}. Cleared for bank payout.`);
    } else if (newStatus === "On Hold") {
      toast.warning(
        `Salary for ${staffName} placed On Hold.${reason ? ` Reason: ${reason}` : " Excluded from payout until released."}`
      );
    } else if (newStatus === "Pending") {
      toast.info(`Salary for ${staffName} set to Pending Authorization.`);
    } else if (newStatus === "Paid" || newStatus === "Disbursed") {
      toast.success(
        `Salary marked as Paid for ${staffName} (${formatCurrency(item?.netSalary || 0)}) via ${item?.bankName}.`
      );
    }
  };

  const handleDisburseSingle = (id: string) => {
    handleStatusChange(id, "Paid");
  };

  const handleUnlockSingle = (id: string) => {
    handleStatusChange(id, "Pending");
  };

  // Active cycle subset
  const cycleSalaries = React.useMemo(() => {
    if (selectedCycle === "All Cycles") return salaries;
    if (selectedCycle.startsWith("Year ")) {
      const yr = selectedCycle.replace("Year ", "").trim();
      return salaries.filter((s) => s.monthYear.endsWith(yr));
    }
    return salaries.filter((s) => s.monthYear === selectedCycle);
  }, [salaries, selectedCycle]);

  // Batch operations
  const handleBatchDisburse = (campus: string, bankId: string) => {
    const clearingBank = accounts.find((a) => a.id === bankId);
    setSalaries((prev) =>
      prev.map((s) => {
        const matchesCycle =
          selectedCycle === "All Cycles" ||
          (selectedCycle.startsWith("Year ")
            ? s.monthYear.endsWith(selectedCycle.replace("Year ", "").trim())
            : s.monthYear === selectedCycle);
        if (
          matchesCycle &&
          (campus === "All Campuses" || s.campus === campus) &&
          s.status !== "Paid" &&
          s.status !== "Disbursed" &&
          s.status !== "On Hold"
        ) {
          return {
            ...s,
            status: "Paid",
            disbursedDate: new Date().toISOString().slice(0, 10),
            transactionRef: `FT${Math.floor(2600000000 + Math.random() * 99999999)}`,
          };
        }
        return s;
      })
    );

    setBatches((prev) => [
      {
        batchId: `PAY-${selectedCycle.replace(/\s+/g, "-")}-B${prev.length + 1}`,
        monthYear: selectedCycle === "All Cycles" ? "November 2026" : selectedCycle,
        campus: campus,
        staffCount: cycleSalaries.filter(
          (s) =>
            (campus === "All Campuses" || s.campus === campus) &&
            s.status !== "Paid" &&
            s.status !== "Disbursed" &&
            s.status !== "On Hold"
        ).length,
        grossAmount: cycleSalaries
          .filter(
            (s) =>
              (campus === "All Campuses" || s.campus === campus) &&
              s.status !== "Paid" &&
              s.status !== "Disbursed" &&
              s.status !== "On Hold"
          )
          .reduce((a, b) => a + b.grossSalary, 0),
        deductionsAmount: cycleSalaries
          .filter(
            (s) =>
              (campus === "All Campuses" || s.campus === campus) &&
              s.status !== "Paid" &&
              s.status !== "Disbursed" &&
              s.status !== "On Hold"
          )
          .reduce((a, b) => a + b.totalDeductions, 0),
        netAmount: cycleSalaries
          .filter(
            (s) =>
              (campus === "All Campuses" || s.campus === campus) &&
              s.status !== "Paid" &&
              s.status !== "Disbursed" &&
              s.status !== "On Hold"
          )
          .reduce((a, b) => a + b.netSalary, 0),
        processedDate: new Date().toISOString().slice(0, 10),
        authorizedBy: "Chief Financial Officer (CFO)",
        clearingBank: clearingBank?.bankName || "Corporate Account",
        status: "Paid",
      },
      ...prev,
    ]);
  };

  const handleBatchUnlock = (campus: string) => {
    setSalaries((prev) =>
      prev.map((s) => {
        const matchesCycle =
          selectedCycle === "All Cycles" ||
          (selectedCycle.startsWith("Year ")
            ? s.monthYear.endsWith(selectedCycle.replace("Year ", "").trim())
            : s.monthYear === selectedCycle);
        if (
          matchesCycle &&
          (campus === "All Campuses" || s.campus === campus) &&
          (s.status === "Paid" || s.status === "Disbursed")
        ) {
          return {
            ...s,
            status: "Pending",
            disbursedDate: undefined,
            transactionRef: undefined,
          };
        }
        return s;
      })
    );

    setBatches((prev) =>
      prev.map((b) => {
        const matchesCycle =
          selectedCycle === "All Cycles" ||
          (selectedCycle.startsWith("Year ")
            ? b.monthYear.endsWith(selectedCycle.replace("Year ", "").trim())
            : b.monthYear === selectedCycle);
        if ((campus === "All Campuses" || b.campus === campus) && matchesCycle) {
          return {
            ...b,
            status: "Draft",
          };
        }
        return b;
      })
    );
  };

  const handleSaveSalary = (record: StaffSalaryRecord) => {
    setSalaries((prev) => {
      const exists = prev.some((s) => s.id === record.id);
      if (exists) {
        return prev.map((s) => (s.id === record.id ? record : s));
      }
      return [record, ...prev];
    });
    if (record.monthYear && selectedCycle !== "All Cycles" && record.monthYear !== selectedCycle) {
      setSelectedCycle(record.monthYear);
    }
  };

  const handleDeleteRecord = (id: string) => {
    const record = salaries.find((s) => s.id === id);
    setSalaries((prev) => prev.filter((r) => r.id !== id));
    toast.success(`Salary record for ${record?.name || "staff member"} removed.`);
  };

  // Filtered salaries
  const filteredSalaries = React.useMemo(() => {
    return salaries.filter((s) => {
      const matchesCycle =
        selectedCycle === "All Cycles" ||
        (selectedCycle.startsWith("Year ")
          ? s.monthYear.endsWith(selectedCycle.replace("Year ", "").trim())
          : s.monthYear === selectedCycle);

      const matchesSearch =
        search === "" ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.empCode.toLowerCase().includes(search.toLowerCase()) ||
        s.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.bankName.toLowerCase().includes(search.toLowerCase()) ||
        s.designation.toLowerCase().includes(search.toLowerCase());

      const matchesCampus =
        selectedCampus === "All Campuses" || s.campus === selectedCampus;

      const matchesDept =
        selectedDept === "All Departments" || s.department === selectedDept;

      const matchesStatus =
        selectedStatus === "All Statuses" ||
        (selectedStatus === "Paid" && (s.status === "Paid" || s.status === "Disbursed")) ||
        (selectedStatus === "Pending" &&
          (String(s.status) === "Pending" || String(s.status) === "Unpaid")) ||
        s.status === selectedStatus;

      const matchesMode =
        selectedMode === "All Methods" || s.paymentMode === selectedMode;

      return (
        matchesCycle &&
        matchesSearch &&
        matchesCampus &&
        matchesDept &&
        matchesStatus &&
        matchesMode
      );
    });
  }, [salaries, selectedCycle, search, selectedCampus, selectedDept, selectedStatus, selectedMode]);

  // Pagination calculation
  const pageCount = Math.max(1, Math.ceil(filteredSalaries.length / pageSize));
  const safePage = Math.min(Math.max(0, page), pageCount - 1);
  const pagedSalaries = React.useMemo(
    () => filteredSalaries.slice(safePage * pageSize, (safePage + 1) * pageSize),
    [filteredSalaries, safePage, pageSize]
  );

  // ── Print / Export ─────────────────────────────────────────────────────────

  const handlePrint = React.useCallback(() => {
    printPayrollReport({
      salaries: filteredSalaries,
      accounts,
      batches,
      activeTab: "salary-register",
    });
  }, [filteredSalaries, accounts, batches]);

  const handleExportPdf = React.useCallback(() => {
    exportPayrollPdf(filteredSalaries, selectedCycle === "All Cycles" ? undefined : selectedCycle);
    toast.success(`Staff Payroll register (${filteredSalaries.length} records) downloaded as PDF.`);
  }, [filteredSalaries, selectedCycle]);

  // ── Symmetrical Institutional KPI Aggregates ───────────────────────────────

  const totalDisbursed = React.useMemo(
    () =>
      cycleSalaries
        .filter((s) => s.status === "Paid" || s.status === "Disbursed")
        .reduce((sum, s) => sum + s.netSalary, 0),
    [cycleSalaries]
  );

  const totalStaff = cycleSalaries.length;
  const disbursedStaffCount = cycleSalaries.filter(
    (s) => s.status === "Paid" || s.status === "Disbursed"
  ).length;
  const pendingCount = cycleSalaries.filter(
    (s) => s.status !== "Paid" && s.status !== "Disbursed"
  ).length;

  return (
    <div className="flex flex-col gap-8">
      {/* ── Page Header: Symmetrical with Fee Collection ─────────────────── */}
      <PageHeader
        title="Staff Payroll"
        className="mb-0 lg:mb-0"
        actions={
          <>
            <ActionButton tone="outline" size="md" onClick={handlePrint}>
              <Printer />
              <span>Print</span>
            </ActionButton>
            <ActionButton tone="pdf" size="md" onClick={handleExportPdf}>
              <Download />
              <span>Export PDF</span>
            </ActionButton>
            <ActionButton
              tone="primary"
              size="md"
              onClick={() => setGenerateSlipOpen(true)}
            >
              <Plus />
              <span>Generate Salary Slip</span>
            </ActionButton>
          </>
        }
      />

      {/* ── Symmetrical Executive KPI Cards: Clean white design system cards ── */}
      <StatGrid>
        <StatCard
          label="Total Slips"
          value={totalStaff}
          icon={Receipt}
          title={`Cycle: ${selectedCycle} | ${totalStaff} staff enrolled`}
        />
        <StatCard
          label="Paid Slips"
          value={disbursedStaffCount}
          icon={CheckCircle2}
          title={`${disbursedStaffCount} of ${totalStaff} staff paid`}
        />
        <StatCard
          label="Pending Payment"
          value={pendingCount}
          icon={Clock}
          title={`${pendingCount} staff awaiting payment`}
        />
        <StatCard
          label="Total Disbursed"
          value={formatCurrencyCompact(totalDisbursed)}
          icon={Banknote}
          title={`${formatCurrency(totalDisbursed)} disbursed this cycle`}
        />
      </StatGrid>

      {/* ── Standalone Section Heading & Staff Salary Register ─────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg">
              Staff Compensation &amp; Salary Slips Register
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-50/70 px-2.5 py-0.5 text-xs font-semibold text-brand">
              <CalendarDays className="size-3" />
              <span>
                {selectedCycle.startsWith("Year ")
                  ? `Full Year ${selectedCycle.replace("Year ", "")}`
                  : selectedCycle}
              </span>
            </span>
          </div>
        </div>

        {/* ── Table Card ─────────────────────────────────────────────────── */}
        <SectionCard flush>
          {/* Top Filter & Search Toolbar */}
          <div className="flex flex-col gap-3 border-b border-border/70 p-4 bg-white sm:flex-row sm:items-center sm:justify-between">
            {/* Search Box */}
            <div className="relative w-full sm:w-72 lg:w-80 shrink-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/70" />
              <input
                type="text"
                placeholder="Search staff, code, designation, account…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-[4px] border border-brand/18 bg-white pl-9 pr-3 text-xs font-medium text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.05)] outline-none transition-colors placeholder:font-normal placeholder:text-muted-foreground/75 hover:border-brand/30 focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 sm:justify-end">
              <div className="w-44 sm:w-48 shrink-0">
                <PayrollCalendarDropdown
                  value={selectedCycle}
                  onChange={setSelectedCycle}
                  salaries={salaries}
                  className="w-full h-9"
                />
              </div>
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="h-9 rounded-[4px] border border-brand/18 bg-white px-3 text-xs font-medium text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.05)] outline-none hover:border-brand/30 focus:border-brand cursor-pointer"
              >
                {CAMPUS_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="h-9 rounded-[4px] border border-brand/18 bg-white px-3 text-xs font-medium text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.05)] outline-none hover:border-brand/30 focus:border-brand cursor-pointer"
              >
                {DEPT_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 rounded-[4px] border border-brand/18 bg-white px-3 text-xs font-medium text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.05)] outline-none hover:border-brand/30 focus:border-brand cursor-pointer"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[760px] table-fixed border-collapse text-left text-xs">
              <thead>
                <tr className={TABLE_HEAD_ROW_CLASS}>
                  <th className={`w-[14%] ${TABLE_HEAD_CELL_CLASS}`}>
                    Slip No
                  </th>
                  <th className={`w-[22%] ${TABLE_HEAD_CELL_CLASS}`}>
                    Staff
                  </th>
                  <th className={`w-[18%] ${TABLE_HEAD_CELL_CLASS}`}>
                    Campus
                  </th>
                  <th className={`w-[12%] ${TABLE_HEAD_CELL_CLASS}`}>
                    Month
                  </th>
                  <th className={`w-[11%] ${TABLE_HEAD_CELL_CLASS}`}>
                    Basic
                  </th>
                  <th className={`w-[11%] ${TABLE_HEAD_CELL_CLASS}`}>
                    Net Pay
                  </th>
                  <th className={`w-[10%] ${TABLE_HEAD_CELL_CLASS}`}>
                    Status
                  </th>
                  <th className={`w-[12%] ${TABLE_HEAD_CELL_CLASS}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredSalaries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-xs text-muted-foreground"
                    >
                      No salary slips match the selected filters.
                    </td>
                  </tr>
                ) : (
                  pagedSalaries.map((s, idx) => {
                    const globalIdx = safePage * pageSize + idx;
                    return (
                      <tr
                        key={s.id}
                        className="h-[58px] transition-colors hover:bg-cream/60"
                      >
                        {/* Slip No */}
                        <td className="px-5 py-3 text-center align-middle whitespace-nowrap">
                          <span className="inline-flex items-center justify-center rounded-md border border-brand/15 bg-brand-50/50 px-2.5 py-1 font-mono text-xs font-bold tracking-tight text-[#091d3e]">
                            {formatSlipNo(s, globalIdx)}
                          </span>
                        </td>

                        {/* Staff */}
                        <td className="px-5 py-3 text-center align-middle">
                          <span className="block truncate font-semibold text-foreground">
                            {s.name}
                          </span>
                        </td>

                        {/* Campus */}
                        <td className="px-5 py-3 text-center align-middle whitespace-nowrap">
                          <span className="block truncate font-semibold text-foreground">
                            {s.campus}
                          </span>
                        </td>

                        {/* Month */}
                        <td className="px-5 py-3 text-center align-middle whitespace-nowrap">
                          <span className="text-xs font-medium text-foreground">
                            {s.monthYear}
                          </span>
                        </td>

                        {/* Basic */}
                        <td className="px-5 py-3 text-center align-middle whitespace-nowrap">
                          <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
                            {formatCurrency(s.baseSalary)}
                          </span>
                        </td>

                        {/* Net Pay */}
                        <td className="px-5 py-3 text-center align-middle whitespace-nowrap">
                          <span className="font-mono text-[13px] font-bold tabular-nums text-emerald-700">
                            {formatCurrency(s.netSalary)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3 text-center align-middle whitespace-nowrap">
                          <div className="flex justify-center">
                            {s.status === "Paid" || s.status === "Disbursed" ? (
                              <span className="inline-flex items-center justify-center rounded-full border border-emerald-200/90 bg-emerald-50 px-3 py-0.5 text-[11px] font-semibold text-emerald-700">
                                Paid
                              </span>
                            ) : String(s.status) === "Pending" ||
                              String(s.status) === "Unpaid" ? (
                              <span className="inline-flex items-center justify-center rounded-full border border-amber-200/90 bg-amber-50 px-3 py-0.5 text-[11px] font-semibold text-amber-700">
                                Unpaid
                              </span>
                            ) : s.status === "On Hold" ? (
                              <span className="inline-flex items-center justify-center rounded-full border border-rose-200/90 bg-rose-50 px-3 py-0.5 text-[11px] font-semibold text-rose-700">
                                On Hold
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center rounded-full border border-sky-200/90 bg-sky-50 px-3 py-0.5 text-[11px] font-semibold text-sky-700">
                                Approved
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3 text-center align-middle whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <ActionButton
                              tone="outline"
                              size="xs"
                              className="border-purple-200 bg-purple-50/70 text-purple-700 hover:border-purple-400 hover:bg-purple-100 hover:text-purple-800 shadow-2xs"
                              title="Print payslip"
                              onClick={() => printSinglePayslip(s)}
                            >
                              <Printer className="size-3 text-purple-600" />
                            </ActionButton>
                            <ActionButton
                              tone="outline"
                              size="xs"
                              className="border-blue-200 bg-blue-50/70 text-blue-700 hover:border-blue-400 hover:bg-blue-100 hover:text-blue-800 shadow-2xs"
                              title="View full compensation details"
                              onClick={() => {
                                setSelectedSalary(s);
                                setPayslipOpen(true);
                              }}
                            >
                              <Eye className="size-3 text-blue-600" />
                            </ActionButton>
                            <ActionButton
                              tone="danger"
                              size="xs"
                              className="border-rose-200 bg-rose-50/70 text-rose-700 hover:border-rose-400 hover:bg-rose-100 hover:text-rose-800 shadow-2xs"
                              title="Remove salary record"
                              onClick={() => handleDeleteRecord(s.id)}
                            >
                              <Trash2 className="size-3 text-rose-600" />
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col gap-3 border-t border-border/70 px-6 py-3.5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5 tabular-nums select-none">
              <span>Showing</span>
              <span className="inline-flex h-6 min-w-[52px] shrink-0 items-center justify-center rounded-[3px] border border-brand/15 bg-white px-1.5 font-semibold tabular-nums text-foreground shadow-2xs">
                {filteredSalaries.length === 0
                  ? 0
                  : `${safePage * pageSize + 1}–${Math.min(
                      (safePage + 1) * pageSize,
                      filteredSalaries.length
                    )}`}
              </span>
              <span>
                of{" "}
                <strong className="font-semibold text-foreground">
                  {filteredSalaries.length}
                </strong>{" "}
                entries
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <PagerButton
                disabled={safePage === 0}
                onClick={() => setPage(safePage - 1)}
                label="Previous page"
              >
                <ChevronLeft className="size-3.5" />
              </PagerButton>
              {Array.from({ length: pageCount }, (_, i) => i)
                .filter(
                  (i) =>
                    i === 0 || i === pageCount - 1 || Math.abs(i - safePage) <= 1
                )
                .map((i, idx, arr) => (
                  <React.Fragment key={i}>
                    {idx > 0 && i - arr[idx - 1] > 1 && (
                      <span className="select-none px-1 text-muted-foreground/60">…</span>
                    )}
                    <PagerButton
                      active={i === safePage}
                      onClick={() => setPage(i)}
                      label={`Page ${i + 1}`}
                    >
                      {i + 1}
                    </PagerButton>
                  </React.Fragment>
                ))}
              <PagerButton
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage(safePage + 1)}
                label="Next page"
              >
                <ChevronRight className="size-3.5" />
              </PagerButton>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <PayslipModal
        salary={salaries.find((s) => s.id === selectedSalary?.id) ?? selectedSalary}
        open={payslipOpen}
        onOpenChange={setPayslipOpen}
        onDisburse={handleDisburseSingle}
        onUnlock={handleUnlockSingle}
        onEdit={(s) => {
          setEditingSalary(s);
          setAddSalaryOpen(true);
        }}
        onStatusChange={handleStatusChange}
      />

      <AddSalaryModal
        open={addSalaryOpen}
        onOpenChange={setAddSalaryOpen}
        onSave={handleSaveSalary}
        initialData={editingSalary}
        defaultMonthYear={
          selectedCycle === "All Cycles" || selectedCycle.startsWith("Year ")
            ? "November 2026"
            : selectedCycle
        }
      />

      <RunPayrollModal
        open={runPayrollOpen}
        onOpenChange={setRunPayrollOpen}
        salaries={cycleSalaries}
        accounts={accounts}
        onDisburseAll={handleBatchDisburse}
        onUnlockPayroll={handleBatchUnlock}
        cycleMonth={
          selectedCycle === "All Cycles" || selectedCycle.startsWith("Year ")
            ? "November 2026"
            : selectedCycle
        }
      />

      <GenerateSlipModal
        open={generateSlipOpen}
        onOpenChange={setGenerateSlipOpen}
        onGenerate={handleSaveSalary}
        defaultMonthYear={
          selectedCycle === "All Cycles" || selectedCycle.startsWith("Year ")
            ? "November 2026"
            : selectedCycle
        }
        existingStaff={salaries}
      />
    </div>
  );
}

// ─── PagerButton ──────────────────────────────────────────────────────────────

function PagerButton({
  children,
  onClick,
  disabled,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 cursor-pointer select-none items-center justify-center rounded-[4px] border text-xs font-semibold tabular-nums transition-all",
        active
          ? "border-[#091d3e] bg-gradient-to-b from-[#16345f] to-[#091d3e] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_2px_4px_rgb(9_29_62/0.25)]"
          : "border-brand/18 bg-white text-foreground/80 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.05)] hover:border-brand/35 hover:bg-brand-50/50 hover:text-brand",
        disabled &&
          "pointer-events-none cursor-not-allowed border-border/50 bg-muted/30 text-muted-foreground/35 opacity-60 shadow-none"
      )}
    >
      {children}
    </button>
  );
}
