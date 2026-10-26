"use client";

import * as React from "react";
import {
  Banknote,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  Eye,
  Plus,
  Printer,
  Search,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { ActionButton } from "@/components/shared/action-button";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { exportPayrollPdf, printPayrollReport } from "./payroll-export";
import { PayslipModal } from "./payslip-modal";
import { AddSalaryModal } from "./add-salary-modal";
import { RunPayrollModal } from "./run-payroll-modal";

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

const STATUS_OPTIONS = ["All Statuses", "Disbursed", "Pending", "Approved", "On Hold"];
const MODE_OPTIONS = ["All Methods", "Bank Transfer", "Cheque", "Cash"];

const TABLE_HEAD_ROW_CLASS =
  "border-y border-[#dbe4f0] bg-gradient-to-b from-[#f8fafd] via-[#f4f7fc] to-[#eef3fa] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.95)]";

const TABLE_HEAD_CELL_CLASS =
  "relative whitespace-nowrap px-5 py-3.5 text-center align-middle text-[12.5px] font-bold tracking-[-0.01em] text-[#1e293b] select-none not-last:after:pointer-events-none not-last:after:absolute not-last:after:right-0 not-last:after:top-1/2 not-last:after:h-4 not-last:after:w-px not-last:after:-translate-y-1/2 not-last:after:bg-[#d8e2f0]";

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

  // Filters state
  const [search, setSearch] = React.useState("");
  const [selectedCampus, setSelectedCampus] = React.useState("All Campuses");
  const [selectedDept, setSelectedDept] = React.useState("All Departments");
  const [selectedStatus, setSelectedStatus] = React.useState("All Statuses");
  const [selectedMode, setSelectedMode] = React.useState("All Methods");

  // Pagination state
  const [page, setPage] = React.useState(0);
  const pageSize = 8;

  // Reset page to first page when search or filters change
  React.useEffect(() => {
    setPage(0);
  }, [search, selectedCampus, selectedDept, selectedStatus, selectedMode]);

  // Single disburse
  const handleDisburseSingle = (id: string) => {
    setSalaries((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            status: "Disbursed",
            disbursedDate: new Date().toISOString().slice(0, 10),
            transactionRef: `FT${Math.floor(2600000000 + Math.random() * 99999999)}`,
          };
        }
        return s;
      })
    );
    const item = salaries.find((s) => s.id === id);
    toast.success(
      `Salary disbursed for ${item?.name || "staff"} (${formatCurrency(
        item?.netSalary || 0
      )}) to ${item?.bankName}.`
    );
  };

  // Single unlock
  const handleUnlockSingle = (id: string) => {
    setSalaries((prev) =>
      prev.map((s) => {
        if (s.id === id) {
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
    const item = salaries.find((s) => s.id === id);
    toast.success(
      `Disbursement lock released for ${item?.name || "staff"}. Record reverted to Pending Authorization.`
    );
  };

  // Batch disburse
  const handleBatchDisburse = (campus: string, bankId: string) => {
    const clearingBank = accounts.find((a) => a.id === bankId);
    setSalaries((prev) =>
      prev.map((s) => {
        if (
          (campus === "All Campuses" || s.campus === campus) &&
          s.status !== "Disbursed"
        ) {
          return {
            ...s,
            status: "Disbursed",
            disbursedDate: new Date().toISOString().slice(0, 10),
            transactionRef: `FT${Math.floor(2600000000 + Math.random() * 99999999)}`,
          };
        }
        return s;
      })
    );

    // Update batch summary status
    setBatches((prev) => [
      {
        batchId: `PAY-2026-10-B${prev.length + 1}`,
        monthYear: "October 2026",
        campus: campus,
        staffCount: salaries.filter(
          (s) =>
            (campus === "All Campuses" || s.campus === campus) &&
            s.status !== "Disbursed"
        ).length,
        grossAmount: salaries
          .filter(
            (s) =>
              (campus === "All Campuses" || s.campus === campus) &&
              s.status !== "Disbursed"
          )
          .reduce((a, b) => a + b.grossSalary, 0),
        deductionsAmount: salaries
          .filter(
            (s) =>
              (campus === "All Campuses" || s.campus === campus) &&
              s.status !== "Disbursed"
          )
          .reduce((a, b) => a + b.totalDeductions, 0),
        netAmount: salaries
          .filter(
            (s) =>
              (campus === "All Campuses" || s.campus === campus) &&
              s.status !== "Disbursed"
          )
          .reduce((a, b) => a + b.netSalary, 0),
        processedDate: new Date().toISOString().slice(0, 10),
        authorizedBy: "Chief Financial Officer (CFO)",
        clearingBank: clearingBank?.bankName || "Corporate Account",
        status: "Disbursed",
      },
      ...prev,
    ]);
  };

  // Batch unlock
  const handleBatchUnlock = (campus: string, _reason?: string) => {
    setSalaries((prev) =>
      prev.map((s) => {
        if (
          (campus === "All Campuses" || s.campus === campus) &&
          s.status === "Disbursed"
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

    // Update batch summary status
    setBatches((prev) =>
      prev.map((b) => {
        if (
          (campus === "All Campuses" || b.campus === campus) &&
          b.monthYear === "October 2026"
        ) {
          return {
            ...b,
            status: "Draft",
          };
        }
        return b;
      })
    );
  };

  // Add / Save salary record
  const handleSaveSalary = (record: StaffSalaryRecord) => {
    setSalaries((prev) => {
      const exists = prev.some((s) => s.id === record.id);
      if (exists) {
        return prev.map((s) => (s.id === record.id ? record : s));
      }
      return [record, ...prev];
    });
  };

  // Filtered salaries
  const filteredSalaries = React.useMemo(() => {
    return salaries.filter((s) => {
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
        selectedStatus === "All Statuses" || s.status === selectedStatus;

      const matchesMode =
        selectedMode === "All Methods" || s.paymentMode === selectedMode;

      return (
        matchesSearch &&
        matchesCampus &&
        matchesDept &&
        matchesStatus &&
        matchesMode
      );
    });
  }, [salaries, search, selectedCampus, selectedDept, selectedStatus, selectedMode]);

  // Pagination calculation
  const pageCount = Math.max(1, Math.ceil(filteredSalaries.length / pageSize));
  const safePage = Math.min(Math.max(0, page), pageCount - 1);
  const pagedSalaries = React.useMemo(() => {
    return filteredSalaries.slice(
      safePage * pageSize,
      (safePage + 1) * pageSize
    );
  }, [filteredSalaries, safePage, pageSize]);

  // Print & Export Handlers
  const handlePrint = React.useCallback(() => {
    printPayrollReport({
      salaries: filteredSalaries,
      accounts,
      batches,
      activeTab: "salary-register",
    });
  }, [filteredSalaries, accounts, batches]);

  const handleExportPdf = React.useCallback(() => {
    exportPayrollPdf(filteredSalaries);
    toast.success(
      `Staff Payroll register (${filteredSalaries.length} records) downloaded as PDF.`
    );
  }, [filteredSalaries]);

  // Institutional KPI Aggregates
  const totalGross = 48_620_000;
  const totalDisbursed = 34_800_000;
  const totalPending = 8_410_000;
  const totalDeductions = 5_410_000;
  const totalStaff = 479;
  const disbursedStaffCount = 398;

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header with Upper Right Actions */}
      <PageHeader
        title="Staff Payroll"
        className="mb-0 lg:mb-0"
        actions={
          <>
            <ActionButton
              tone="outline"
              size="md"
              onClick={handlePrint}
            >
              <Printer />
              <span>Print</span>
            </ActionButton>
            <ActionButton
              tone="pdf"
              size="md"
              onClick={handleExportPdf}
            >
              <Download />
              <span>Export PDF</span>
            </ActionButton>
            <ActionButton
              tone="outline"
              size="md"
              onClick={() => {
                setEditingSalary(null);
                setAddSalaryOpen(true);
              }}
            >
              <Plus />
              <span>Add Staff Salary Account</span>
            </ActionButton>
            <ActionButton
              tone="primary"
              size="md"
              onClick={() => setRunPayrollOpen(true)}
            >
              <Banknote />
              <span>Process Monthly Payroll</span>
            </ActionButton>
          </>
        }
      />

      {/* KPI Stat Cards */}
      <StatGrid>
        <StatCard
          label="Total Monthly Payroll"
          value={formatCurrencyCompact(totalGross)}
          icon={Banknote}
          title="Gross: PKR 48.62M | Net: PKR 43.21M"
        />
        <StatCard
          label="Disbursed Salaries"
          value={formatCurrencyCompact(totalDisbursed)}
          icon={CheckCircle2}
          title={`${disbursedStaffCount} of ${totalStaff} staff cleared`}
        />
        <StatCard
          label="Pending Disbursals"
          value={formatCurrencyCompact(totalPending)}
          icon={CreditCard}
          title={`${totalStaff - disbursedStaffCount} staff pending authorization`}
        />
        <StatCard
          label="Taxes & Deductions"
          value={formatCurrencyCompact(totalDeductions)}
          icon={ShieldCheck}
          title="Withholding Tax, Provident Fund & EOBI"
        />
      </StatGrid>

      {/* Standalone Section Heading & Staff Salary Register */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg">
            Monthly Staff Compensation Register
          </h2>
        </div>

        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="grid grid-cols-1 gap-2.5 rounded-lg border border-border/80 bg-white p-3 shadow-xs sm:grid-cols-2 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/70" />
              <input
                type="text"
                placeholder="Search staff, code, bank account, IBAN…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8.5 w-full rounded-[4px] border border-border/80 bg-white pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="h-8.5 w-full rounded-[4px] border border-border/80 bg-white px-2.5 text-xs text-foreground focus:border-brand focus:outline-none"
              >
                {CAMPUS_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="h-8.5 w-full rounded-[4px] border border-border/80 bg-white px-2.5 text-xs text-foreground focus:border-brand focus:outline-none"
              >
                {DEPT_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-8.5 w-full rounded-[4px] border border-border/80 bg-white px-2.5 text-xs text-foreground focus:border-brand focus:outline-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Card */}
          <SectionCard flush>
            <div className="w-full overflow-hidden">
              <table className="w-full table-fixed border-collapse text-left text-xs">
                <thead>
                  <tr className={TABLE_HEAD_ROW_CLASS}>
                    <th className={`w-[13%] ${TABLE_HEAD_CELL_CLASS}`}>
                      Emp Code
                    </th>
                    <th className={`w-[29%] ${TABLE_HEAD_CELL_CLASS}`}>
                      Employee &amp; Role
                    </th>
                    <th className={`w-[20%] ${TABLE_HEAD_CELL_CLASS}`}>
                      Campus &amp; Dept
                    </th>
                    <th className={`w-[14%] ${TABLE_HEAD_CELL_CLASS}`}>
                      Net Pay
                    </th>
                    <th className={`w-[12%] ${TABLE_HEAD_CELL_CLASS}`}>
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
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        No staff salary records match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    pagedSalaries.map((s) => (
                      <tr
                        key={s.id}
                        className="h-[61px] transition-colors hover:bg-cream/60"
                      >
                        <td className="px-5 py-3 text-center align-middle whitespace-nowrap">
                          <span className="inline-flex items-center justify-center rounded-md border border-brand/15 bg-brand-50/50 px-2.5 py-1 font-mono text-xs font-bold tracking-tight text-[#091d3e]">
                            {s.empCode}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center align-middle">
                          <div className="min-w-0 text-center">
                            <p className="truncate font-semibold text-foreground">
                              {s.name}
                            </p>
                            {s.designation && (
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {s.designation}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center align-middle">
                          <span className="block truncate font-semibold text-foreground">
                            {s.campus}
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                            {s.department}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center align-middle whitespace-nowrap">
                          <span className="font-mono text-[13px] font-bold tabular-nums text-emerald-700">
                            {formatCurrency(s.netSalary)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center align-middle whitespace-nowrap">
                          <div className="flex justify-center">
                            <StatusBadge status={s.status} />
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center align-middle whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <ActionButton
                              tone="outline"
                              size="xs"
                              title="View full compensation & payslip details"
                              onClick={() => {
                                setSelectedSalary(s);
                                setPayslipOpen(true);
                              }}
                            >
                              <Eye className="size-3.5" />
                              <span>View</span>
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col gap-3 border-t border-border/70 px-6 py-3.5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-1.5 tabular-nums select-none">
                <span>Showing</span>
                <span className="inline-flex h-6 min-w-[52px] px-1.5 shrink-0 items-center justify-center rounded-[3px] border border-brand/15 bg-white font-semibold tabular-nums text-foreground shadow-2xs">
                  {filteredSalaries.length === 0
                    ? 0
                    : `${safePage * pageSize + 1}–${Math.min(
                        (safePage + 1) * pageSize,
                        filteredSalaries.length
                      )}`}
                </span>
                <span>
                  of <strong className="font-semibold text-foreground">{filteredSalaries.length}</strong> entries
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
                      i === 0 ||
                      i === pageCount - 1 ||
                      Math.abs(i - safePage) <= 1
                  )
                  .map((i, idx, arr) => (
                    <React.Fragment key={i}>
                      {idx > 0 && i - arr[idx - 1] > 1 && (
                        <span className="px-1 text-muted-foreground/60 select-none">
                          …
                        </span>
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
      </div>

      {/* Modals */}
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
      />

      <AddSalaryModal
        open={addSalaryOpen}
        onOpenChange={setAddSalaryOpen}
        onSave={handleSaveSalary}
        initialData={editingSalary}
      />

      <RunPayrollModal
        open={runPayrollOpen}
        onOpenChange={setRunPayrollOpen}
        salaries={salaries}
        accounts={accounts}
        onDisburseAll={handleBatchDisburse}
        onUnlockPayroll={handleBatchUnlock}
      />
    </div>
  );
}

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
        "inline-flex size-8 items-center justify-center rounded-[4px] border text-xs font-semibold tabular-nums transition-all select-none cursor-pointer",
        active
          ? "border-[#091d3e] bg-gradient-to-b from-[#16345f] to-[#091d3e] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_2px_4px_rgb(9_29_62/0.25)]"
          : "border-brand/18 bg-white text-foreground/80 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.05)] hover:border-brand/35 hover:bg-brand-50/50 hover:text-brand",
        disabled &&
          "pointer-events-none cursor-not-allowed border-border/50 bg-muted/30 text-muted-foreground/35 shadow-none opacity-60"
      )}
    >
      {children}
    </button>
  );
}
