"use client";

import * as React from "react";
import { Download, Plus, Printer, Wallet, CreditCard, TrendingUp, UserCheck, Eye, Pencil, Trash2, Clock, CheckCircle2, AlertCircle, CalendarDays, Building2, Receipt, Layers } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { DataTable, ALL, type Column, type FilterDef, type FilterOption } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { SectionCard } from "@/components/shared/section-card";
import { ActionButton } from "@/components/shared/action-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency, formatCurrencyCompact, formatDate, formatNumber, formatOrdinal } from "@/lib/format";
import { FEE_CHALLANS } from "@/lib/mock/operations";
import type { FeeChallan, FeeInstallmentPlan, FeeStatus } from "@/types";
import { exportFeeChallansPdf, printFeeReport, exportStudentFeeStatementPdf, printStudentFeeStatement } from "./fee-export";
import { AddFeeDialog } from "./add-fee-dialog";
import { ProcessPaymentDialog } from "./process-payment-dialog";
import { FeeChallanDetailsDialog } from "./fee-challan-details-dialog";
import { FeeCollectionCalendarDropdown, isAllDateFilter } from "./fee-collection-calendar";
import { getMergedChallans } from "@/lib/mock/historical-collections";
import { FEE_REVISIONS, FEE_FINES, type FeeRevisionRecord, type FeeFineRecord } from "@/lib/mock/finance";
import { readFeeConfiguration, readFeeFines, readFeeChallans, writeFeeChallans, resolveMatchingTier, calculatePreviousMonthDues, getStudentRollNo } from "@/lib/mock/finance-storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

/* ─── Challan Table ─── */
const MONTH_NAMES_MAP: Record<string, string> = {
  jan: "January", feb: "February", mar: "March", apr: "April",
  may: "May", jun: "June", jul: "July", aug: "August",
  sep: "September", oct: "October", nov: "November", dec: "December",
};

function normalizeMonth(m?: string): string {
  if (!m) return "";
  const trimmed = m.trim();
  const match = trimmed.match(/^([a-z]+)\s*(\d{4})$/i);
  if (match) {
    const monthPrefix = match[1].slice(0, 3).toLowerCase();
    const cap = monthPrefix.charAt(0).toUpperCase() + monthPrefix.slice(1);
    return `${cap} ${match[2]}`;
  }
  return trimmed;
}

function getMonthFullLabel(m?: string): string {
  if (!m || m === ALL) return "All Fee Months";
  const norm = normalizeMonth(m);
  const parts = norm.split(" ");
  if (parts.length === 2) {
    const prefix = parts[0].toLowerCase();
    const fullMonth = MONTH_NAMES_MAP[prefix] || parts[0];
    return `${fullMonth} ${parts[1]}`;
  }
  return m;
}

export function getChallanCollectionDate(challan: FeeChallan): string | undefined {
  if (challan.collectDate) return challan.collectDate;
  if (challan.lastPaymentDate) return challan.lastPaymentDate;
  if (challan.payments && challan.payments.length > 0) {
    const valid = challan.payments.filter((p) => p.paymentDate);
    if (valid.length > 0) return valid[valid.length - 1].paymentDate;
  }
  if (challan.dueDate) return challan.dueDate;
  return undefined;
}

export interface CampusMetricStats {
  id: string;
  name: string;
  shortName: string;
  students: number;
  collectionRate: number;
  paidStudents: number;
  totalRevenue: number;
  outstandingDues: number;
  // Daily operational metrics for single-campus view
  collectedToday: number;
  receiptsToday: number;
  collectionRateToday: number;
}

export const CAMPUS_METRIC_CONFIG: Record<string, CampusMetricStats> = {
  all: {
    id: "all",
    name: "All Campuses",
    shortName: "All Campuses",
    students: 5662,
    collectionRate: 94.2,
    paidStudents: 5334,
    totalRevenue: 15_420_000,
    outstandingDues: 2_100_000,
    collectedToday: 383_700,
    receiptsToday: 23,
    collectionRateToday: 95.5,
  },
  main: {
    id: "c1",
    name: "Main Campus - Gulberg",
    shortName: "Main Campus",
    students: 1842,
    collectionRate: 94.2,
    paidStudents: 1735,
    totalRevenue: 5_020_000,
    outstandingDues: 680_000,
    collectedToday: 128_400,
    receiptsToday: 8,
    collectionRateToday: 96.2,
  },
  dha: {
    id: "c2",
    name: "DHA Phase 5 Campus",
    shortName: "DHA Phase 5",
    students: 1420,
    collectionRate: 91.5,
    paidStudents: 1299,
    totalRevenue: 3_870_000,
    outstandingDues: 530_000,
    collectedToday: 94_600,
    receiptsToday: 6,
    collectionRateToday: 94.8,
  },
  islamabad: {
    id: "c3",
    name: "F-8 Islamabad Campus",
    shortName: "F-8 Islamabad",
    students: 1280,
    collectionRate: 96.1,
    paidStudents: 1230,
    totalRevenue: 3_490_000,
    outstandingDues: 470_000,
    collectedToday: 86_200,
    receiptsToday: 5,
    collectionRateToday: 97.5,
  },
  clifton: {
    id: "c4",
    name: "Clifton Karachi Campus",
    shortName: "Clifton",
    students: 1120,
    collectionRate: 89.8,
    paidStudents: 1006,
    totalRevenue: 3_040_000,
    outstandingDues: 420_000,
    collectedToday: 74_500,
    receiptsToday: 4,
    collectionRateToday: 93.4,
  },
};

export function matchCampus(targetCampus: string, rowCampus: string): boolean {
  if (!targetCampus || targetCampus === ALL || targetCampus === "all" || targetCampus.toLowerCase().includes("all")) {
    return true;
  }
  const normTarget = targetCampus.toLowerCase().replace(/campus/g, "").replace(/[-—–]/g, " ").trim();
  const normRow = rowCampus.toLowerCase().replace(/campus/g, "").replace(/[-—–]/g, " ").trim();

  const isTargetMain = normTarget.includes("main") || normTarget.includes("gulberg") || targetCampus === "c1";
  const isRowMain = normRow.includes("main") || normRow.includes("gulberg");
  if (isTargetMain && isRowMain) return true;

  const isTargetDHA = normTarget.includes("dha") || targetCampus === "c2";
  const isRowDHA = normRow.includes("dha");
  if (isTargetDHA && isRowDHA) return true;

  const isTargetISB = normTarget.includes("f 8") || normTarget.includes("f-8") || normTarget.includes("islamabad") || targetCampus === "c3";
  const isRowISB = normRow.includes("f 8") || normRow.includes("f-8") || normRow.includes("islamabad");
  if (isTargetISB && isRowISB) return true;

  const isTargetClifton = normTarget.includes("clifton") || normTarget.includes("karachi") || targetCampus === "c4";
  const isRowClifton = normRow.includes("clifton") || normRow.includes("karachi");
  if (isTargetClifton && isRowClifton) return true;

  return normRow.includes(normTarget) || normTarget.includes(normRow);
}

export function getCampusStats(campusStr?: string): CampusMetricStats {
  if (!campusStr || campusStr === ALL || campusStr === "all" || campusStr.toLowerCase().includes("all")) {
    return CAMPUS_METRIC_CONFIG.all;
  }
  const lower = campusStr.toLowerCase();
  if (lower.includes("main") || lower.includes("gulberg") || campusStr === "c1") {
    return CAMPUS_METRIC_CONFIG.main;
  }
  if (lower.includes("dha") || campusStr === "c2") {
    return CAMPUS_METRIC_CONFIG.dha;
  }
  if (lower.includes("f 8") || lower.includes("f-8") || lower.includes("islamabad") || campusStr === "c3") {
    return CAMPUS_METRIC_CONFIG.islamabad;
  }
  if (lower.includes("clifton") || lower.includes("karachi") || campusStr === "c4") {
    return CAMPUS_METRIC_CONFIG.clifton;
  }
  return CAMPUS_METRIC_CONFIG.all;
}



export function getChallanTotalDueWithFines(
  challan: FeeChallan,
  fines: FeeFineRecord[] = []
): {
  basePayable: number;
  unpaidFinesTotal: number;
  lateFeeTotal: number;
  totalDue: number;
  hasFines: boolean;
  fineBreakdown: Array<{ type: string; amount: number }>;
} {
  if (challan.installmentPlan) {
    return {
      basePayable: challan.totalPayable,
      unpaidFinesTotal: 0,
      lateFeeTotal: 0,
      totalDue: challan.totalPayable,
      hasFines: false,
      fineBreakdown: [],
    };
  }

  const studentName = challan.student.trim().toLowerCase();
  const studentUnpaidFines = fines.filter(
    (f) => f.student.trim().toLowerCase() === studentName && f.status === "Unpaid"
  );
  
  const finesSum = studentUnpaidFines.reduce((sum, f) => sum + f.amount, 0);
  const hasExplicitLateFee = studentUnpaidFines.some(
    (f) => f.fineType.toLowerCase().includes("late fee")
  );

  const autoLateFee = 0;

  const lateFeeTotal = studentUnpaidFines
    .filter((f) => f.fineType.toLowerCase().includes("late fee"))
    .reduce((sum, f) => sum + f.amount, autoLateFee);

  // Avoid double-counting if the fine was already synced into challan.fineCharges and totalPayable
  const challanFineCharges = challan.fineCharges || 0;
  const unattachedFines = Math.max(0, finesSum - challanFineCharges);
  const totalAdditional = unattachedFines + (hasExplicitLateFee ? 0 : autoLateFee);
  const totalDue = challan.totalPayable + totalAdditional;

  const fineBreakdown: Array<{ type: string; amount: number }> = studentUnpaidFines.map((f) => ({
    type: f.fineType,
    amount: f.amount,
  }));

  return {
    basePayable: challan.totalPayable,
    unpaidFinesTotal: totalAdditional,
    lateFeeTotal,
    totalDue,
    hasFines: totalAdditional > 0,
    fineBreakdown,
  };
}

function getChallanColumns(
  onProcessPayment: (challan: FeeChallan) => void,
  onViewDetails: (challan: FeeChallan) => void,
  onEdit: (challan: FeeChallan) => void,
  onPrintStatement: (challan: FeeChallan) => void,
  onDownloadStatement: (challan: FeeChallan) => void,
  onChangeStatus: (challan: FeeChallan, nextStatus: "Paid" | "Unpaid") => void,
  fines: FeeFineRecord[]
): Column<FeeChallan>[] {
  return [
    {
      key: "challanNumber",
      header: "Challan #",
      align: "center",
      headerAlign: "center",
      cell: (r) => (
        <span
          title={
            r.installmentPlan?.installmentNumber
              ? `${formatOrdinal(r.installmentPlan.installmentNumber)} of ${r.installmentPlan.totalInstallments} Installments (${r.challanNumber})`
              : r.challanNumber
          }
          className="inline-flex max-w-full items-center justify-center truncate rounded-md border border-brand/15 bg-brand-50/50 px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-tight text-[#091d3e]"
        >
          {r.challanNumber}
        </span>
      ),
      className: "w-[16%] !px-1 text-center whitespace-nowrap",
      headerClassName: "w-[16%] !px-1 text-center whitespace-nowrap",
    },
    {
      key: "student",
      header: "Student",
      align: "center",
      headerAlign: "center",
      cell: (r) => (
        <div className="w-full min-w-0 text-center" title={`${r.student} • ${r.className} • ${r.campus} (${getStudentRollNo(r)})`}>
          <span className="block truncate text-[13px] font-semibold text-foreground">{r.student}</span>
        </div>
      ),
      className: "w-[14%] !px-1.5 text-center",
      headerClassName: "w-[14%] !px-1.5 text-center whitespace-nowrap",
    },
    {
      key: "className",
      header: "Class",
      align: "center",
      headerAlign: "center",
      cell: (r) => (
        <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-border/80 bg-slate-50 px-1.5 py-0.5 text-[11.5px] font-semibold text-foreground">
          {r.className}
        </span>
      ),
      className: "w-[10%] !px-1 text-center whitespace-nowrap",
      headerClassName: "w-[10%] !px-1 text-center whitespace-nowrap",
    },
    {
      key: "collectDate",
      header: "Collect Date",
      align: "center",
      headerAlign: "center",
      cell: (r) => {
        const cDate = getChallanCollectionDate(r);
        if (!cDate) {
          return (
            <span
              className="font-mono text-xs text-muted-foreground/45 select-none"
              title="Not yet assigned"
            >
              —
            </span>
          );
        }
        return (
          <span
            className="text-[12.5px] font-medium tabular-nums text-foreground whitespace-nowrap"
            title={`Due / Collect Date: ${formatDate(cDate)}${r.lastPaymentMethod ? ` via ${r.lastPaymentMethod}` : ""}${r.lastReceiptNumber ? ` (${r.lastReceiptNumber})` : ""}`}
          >
            {formatDate(cDate)}
          </span>
        );
      },
      className: "w-[12%] !px-1 text-center whitespace-nowrap",
      headerClassName: "w-[12%] !px-1 text-center whitespace-nowrap",
    },
    {
      key: "amount",
      header: "Amount Due",
      align: "center",
      headerAlign: "center",
      cell: (r) => {
        const { totalDue } = getChallanTotalDueWithFines(r, fines);
        return (
          <span
            className="font-mono text-[12.5px] font-bold tabular-nums text-rose-600 dark:text-rose-400 whitespace-nowrap"
            suppressHydrationWarning
          >
            {formatCurrency(totalDue)}
          </span>
        );
      },
      className: "w-[11%] !px-1 text-center whitespace-nowrap",
      headerClassName: "w-[11%] !px-1 text-center whitespace-nowrap",
    },
    {
      key: "paid",
      header: "Paid",
      align: "center",
      headerAlign: "center",
      cell: (r) => (
        <span className="font-mono text-[12.5px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400 whitespace-nowrap" suppressHydrationWarning>
          {formatCurrency(r.paid)}
        </span>
      ),
      className: "w-[10%] !px-1 text-center whitespace-nowrap",
      headerClassName: "w-[10%] !px-1 text-center whitespace-nowrap",
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      headerAlign: "center",
      cell: (r) => {
        const currentStatus = r.status === "Paid" ? "Paid" : "Unpaid";
        return (
          <div className="flex justify-center" suppressHydrationWarning>
            <select
              aria-label={`Change status for ${r.challanNumber}`}
              title="Click to manually change status between Unpaid and Paid"
              value={currentStatus}
              onChange={(e) => onChangeStatus(r, e.target.value as "Paid" | "Unpaid")}
              className={cn(
                "cursor-pointer rounded-full px-2 py-0.5 text-[11.5px] font-semibold ring-1 ring-inset transition-colors focus:outline-none focus:ring-2",
                currentStatus === "Paid"
                  ? "bg-success-soft text-success ring-success/15 hover:bg-emerald-100/80 focus:ring-emerald-500/40"
                  : "bg-warning-soft text-warning ring-warning/15 hover:bg-amber-100/80 focus:ring-amber-500/40"
              )}
            >
              <option value="Unpaid" className="bg-background text-foreground font-semibold">
                Unpaid
              </option>
              <option value="Paid" className="bg-background text-foreground font-semibold">
                Paid
              </option>
            </select>
          </div>
        );
      },
      className: "w-[10%] !px-1 text-center whitespace-nowrap",
      headerClassName: "w-[10%] !px-1 text-center whitespace-nowrap",
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      headerAlign: "center",
      cell: (r) => (
        <div className="inline-flex items-center justify-center gap-0.5 whitespace-nowrap xl:gap-1">
          {/* Installment Icon Action (strictly for Unpaid challans only) */}
          {r.status !== "Paid" && (
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => onProcessPayment(r)}
              className="h-[26px] w-[26px] shrink-0 rounded-md border border-emerald-200/80 bg-emerald-50/70 text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60 cursor-pointer"
              aria-label="Make installment"
              title={`Make Installment for ${r.student} (Due: ${formatCurrency(Math.max(0, getChallanTotalDueWithFines(r, fines).totalDue - r.paid))})`}
            >
              <Layers className="size-3.5" />
            </Button>
          )}

          {/* Primary Action - View Details */}
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onViewDetails(r)}
            className="h-[26px] w-[26px] shrink-0 rounded-md border border-blue-200/80 bg-blue-50/70 text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/60 cursor-pointer"
            aria-label="View details"
            title="View Details"
          >
            <Eye className="size-3.5" />
          </Button>

          {/* Edit Action */}
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onEdit(r)}
            className="h-[26px] w-[26px] shrink-0 rounded-md border border-amber-200/80 bg-amber-50/70 text-amber-700 transition-colors hover:border-amber-300 hover:bg-amber-100 hover:text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/60 cursor-pointer"
            aria-label="Edit challan"
            title="Edit Challan"
          >
            <Pencil className="size-3.5" />
          </Button>

          {/* Print Statement Action */}
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onPrintStatement(r)}
            className="h-[26px] w-[26px] shrink-0 rounded-md border border-purple-200/80 bg-purple-50/70 text-purple-700 transition-colors hover:border-purple-300 hover:bg-purple-100 hover:text-purple-800 dark:border-purple-800/60 dark:bg-purple-950/40 dark:text-purple-400 dark:hover:bg-purple-900/60 cursor-pointer"
            aria-label="Print statement"
            title="Print Statement"
          >
            <Printer className="size-3.5" />
          </Button>
        </div>
      ),
      className: "w-[17%] !px-1 text-center whitespace-nowrap",
      headerClassName: "w-[17%] !px-1 text-center whitespace-nowrap",
    },
  ];
}



/* ─── Component ─── */

export function FeesClient() {
  const [challans, setChallans] = React.useState<FeeChallan[]>(FEE_CHALLANS);
  const [selectedMonth, setSelectedMonth] = React.useState<string>(ALL);
  const [selectedCampus, setSelectedCampus] = React.useState<string>(ALL);
  const mergedChallans = React.useMemo(() => getMergedChallans(challans), [challans]);
  const [addOpen, setAddOpen] = React.useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
  const [selectedChallan, setSelectedChallan] = React.useState<FeeChallan | null>(null);
  const [detailsChallan, setDetailsChallan] = React.useState<FeeChallan | null>(null);
  const [editingChallan, setEditingChallan] = React.useState<FeeChallan | null>(null);
  const [editTuition, setEditTuition] = React.useState("");
  const [editLab, setEditLab] = React.useState("");
  const [editSports, setEditSports] = React.useState("");
  const [editTransport, setEditTransport] = React.useState("0");
  const [editFines, setEditFines] = React.useState("0");
  const [editLibrary, setEditLibrary] = React.useState("");
  const [editUtilities, setEditUtilities] = React.useState("");
  const [editPreviousDues, setEditPreviousDues] = React.useState("0");
  const [editCustomHeads, setEditCustomHeads] = React.useState<Array<{ id: string; name: string; amount: string }>>([]);
  const [editDueDate, setEditDueDate] = React.useState("");
  const [editRollNo, setEditRollNo] = React.useState("");
  const [editPaid, setEditPaid] = React.useState("0");
  const [editStatus, setEditStatus] = React.useState<"Paid" | "Unpaid">("Unpaid");
  const [editCollectDate, setEditCollectDate] = React.useState("");
  const [editError, setEditError] = React.useState("");
  const [feeTiers, setFeeTiers] = React.useState(FEE_REVISIONS);
  const [fineRecords, setFineRecords] = React.useState(FEE_FINES);
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    const loadedTiers = readFeeConfiguration();
    const loadedChallans = readFeeChallans();
    setFeeTiers(loadedTiers);
    setFineRecords(readFeeFines());
    setChallans(loadedChallans);

    if (typeof window !== "undefined") {
      try {
        const stored = window.sessionStorage.getItem("edusphere:selected-campus");
        if (stored) {
          if (stored === "all" || stored === ALL) {
            setSelectedCampus(ALL);
          } else {
            const stats = getCampusStats(stored);
            setSelectedCampus(stats.shortName);
          }
        }
      } catch {
        // ignore storage errors
      }
    }

    setIsHydrated(true);

    const handleConfigUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ tiers?: FeeRevisionRecord[]; challans?: FeeChallan[] }>;
      if (customEvent.detail) {
        if (customEvent.detail.tiers) setFeeTiers(customEvent.detail.tiers);
        if (customEvent.detail.challans) setChallans(customEvent.detail.challans);
      } else {
        setFeeTiers(readFeeConfiguration());
        setChallans(readFeeChallans());
      }
    };

    const handleChallansUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<FeeChallan[]>;
      if (customEvent.detail) {
        setChallans(customEvent.detail);
      } else {
        setChallans(readFeeChallans());
      }
    };

    const handleFinesUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<FeeFineRecord[]>;
      if (customEvent.detail) {
        setFineRecords(customEvent.detail);
      } else {
        setFineRecords(readFeeFines());
      }
    };

    const handleGlobalCampusChanged = (e: Event) => {
      const detail = (e as CustomEvent<{ campusId?: string; campusName?: string }>).detail;
      if (detail?.campusId) {
        if (detail.campusId === "all") {
          setSelectedCampus(ALL);
        } else {
          const stats = getCampusStats(detail.campusId);
          setSelectedCampus(stats.shortName);
        }
        try {
          window.sessionStorage.setItem("edusphere:selected-campus", detail.campusId);
        } catch {
          // ignore storage errors
        }
      }
    };

    const handleScholarshipsUpdated = () => {
      setChallans(readFeeChallans());
    };

    window.addEventListener("edusphere:fee-config-updated", handleConfigUpdated);
    window.addEventListener("edusphere:fee-challans-updated", handleChallansUpdated);
    window.addEventListener("edusphere:fee-fines-updated", handleFinesUpdated);
    window.addEventListener("edusphere:fee-scholarships-updated", handleScholarshipsUpdated);
    window.addEventListener("edusphere:campus-changed", handleGlobalCampusChanged);

    return () => {
      window.removeEventListener("edusphere:fee-config-updated", handleConfigUpdated);
      window.removeEventListener("edusphere:fee-challans-updated", handleChallansUpdated);
      window.removeEventListener("edusphere:fee-fines-updated", handleFinesUpdated);
      window.removeEventListener("edusphere:fee-scholarships-updated", handleScholarshipsUpdated);
      window.removeEventListener("edusphere:campus-changed", handleGlobalCampusChanged);
    };
  }, []);

  const campusStats = React.useMemo(() => getCampusStats(selectedCampus), [selectedCampus]);

  // Real-time campus-wise financial metrics (reacting dynamically to campus selection & payments)
  const {
    totalRevenue,
    outstanding,
    collectionRate,
    totalStudents,
    paidStudents,
    collectedToday,
    receiptsToday,
    collectionRateToday,
  } = React.useMemo(() => {
    // Dynamic adjustments from user-recorded payments on challans in this campus
    const matchedChallans = challans.filter((c) => matchCampus(selectedCampus, c.campus));
    const deltaPaid = matchedChallans.reduce((sum, c) => {
      const orig = FEE_CHALLANS.find((d) => d.id === c.id);
      const diff = c.paid - (orig?.paid ?? 0);
      return sum + (diff > 0 ? diff : 0);
    }, 0);

    const deltaReceipts = matchedChallans.filter((c) => {
      const orig = FEE_CHALLANS.find((d) => d.id === c.id);
      return (c.paid > (orig?.paid ?? 0)) || (!orig && c.paid > 0);
    }).length;

    // Institutional Macro Metrics (for All Campuses)
    const rev = campusStats.totalRevenue + deltaPaid;
    const dues = Math.max(0, campusStats.outstandingDues - deltaPaid);
    const rate = Math.min(100, Math.max(0, Number(((rev / (rev + dues)) * 100).toFixed(1))));
    const students = campusStats.students;
    const paidCount = Math.min(students, campusStats.paidStudents + (deltaPaid > 0 ? Math.ceil(deltaPaid / 25000) : 0));

    // Daily Operational Metrics (for Individual Campus View)
    const dailyCollected = campusStats.collectedToday + deltaPaid;
    const dailyReceipts = campusStats.receiptsToday + deltaReceipts;
    const dailyRate = Math.min(100, Number((campusStats.collectionRateToday + (deltaPaid > 0 ? 0.3 : 0)).toFixed(1)));

    return {
      totalRevenue: rev,
      outstanding: dues,
      collectionRate: rate,
      totalStudents: students,
      paidStudents: paidCount,
      collectedToday: dailyCollected,
      receiptsToday: dailyReceipts,
      collectionRateToday: dailyRate,
    };
  }, [selectedCampus, campusStats, challans]);

  const handleCreate = React.useCallback((challan: FeeChallan) => {
    setChallans((prev) => {
      if (prev.some((c) => c.id === challan.id || c.challanNumber === challan.challanNumber)) {
        return prev;
      }
      const updated = [challan, ...prev];
      writeFeeChallans(updated);
      return updated;
    });
    toast.success(
      `Fee detail added for ${challan.student} (${challan.challanNumber}).`
    );
  }, []);

  const handleOpenPaymentDialog = React.useCallback((challan: FeeChallan) => {
    setSelectedChallan(challan);
    setPaymentDialogOpen(true);
  }, []);

  const handlePrintStatement = React.useCallback((challan: FeeChallan) => {
    if (printStudentFeeStatement(challan, feeTiers, fineRecords, challans)) {
      toast.success(`Print preview opened for ${challan.student}.`);
    }
  }, [feeTiers, fineRecords, challans]);

  const handleDownloadStatement = React.useCallback((challan: FeeChallan) => {
    if (exportStudentFeeStatementPdf(challan, feeTiers, fineRecords, challans)) {
      toast.success(`Fee statement PDF downloaded for ${challan.student}.`);
    } else {
      toast.error("Unable to create the fee statement PDF.");
    }
  }, [feeTiers, fineRecords, challans]);

  const handleEdit = React.useCallback((challan: FeeChallan) => {
    const tier = challan.installmentPlan ? undefined : resolveMatchingTier(challan.className, feeTiers);
    const priorInfo = challan.installmentPlan
      ? { total: 0, count: 0, details: "", months: [], priorChallans: [], isClear: true }
      : calculatePreviousMonthDues(challan, challans);
    const isPaid = challan.status === "Paid";
    setEditingChallan(challan);
    setEditTuition(String(challan.tuitionFee ?? tier?.tuitionFee ?? challan.totalPayable));
    setEditLab(String(challan.labCharges ?? tier?.labCharges ?? 0));
    setEditSports(String(challan.sportsCharges ?? tier?.sportsCharges ?? 0));
    setEditTransport(String(challan.transportCharges ?? 0));
    setEditFines(String(challan.fineCharges ?? 0));
    setEditLibrary(String(challan.libraryFund ?? tier?.libraryFund ?? 0));
    setEditUtilities(String(challan.utilitySurcharge ?? tier?.utilitySurcharge ?? 0));
    setEditPreviousDues(String(challan.previousDues ?? priorInfo.total ?? 0));
    setEditCustomHeads(
      (challan.customHeads ?? tier?.customHeads ?? []).map((h) => ({
        id: h.id,
        name: h.name,
        amount: String(h.amount),
      }))
    );
    setEditDueDate(challan.dueDate);
    setEditRollNo(challan.rollNo || getStudentRollNo(challan));
    setEditStatus(isPaid ? "Paid" : "Unpaid");
    setEditPaid(String(isPaid ? challan.totalPayable : 0));
    setEditCollectDate(challan.collectDate || challan.lastPaymentDate || challan.dueDate || "2026-10-08");
    setEditError("");
  }, [feeTiers, challans]);

  const editCustomTotal = editCustomHeads.reduce((acc, h) => acc + (Number(h.amount) || 0), 0);
  const editChargesSubtotal =
    (Number(editTuition) || 0) +
    (Number(editLab) || 0) +
    (Number(editSports) || 0) +
    (Number(editTransport) || 0) +
    (Number(editFines) || 0) +
    (Number(editLibrary) || 0) +
    (Number(editUtilities) || 0) +
    editCustomTotal;

  const editTotalCalculated = editChargesSubtotal + Math.max(0, Number(editPreviousDues) || 0);

  const handleChangeStatus = React.useCallback(
    (targetChallan: FeeChallan, nextStatus: "Paid" | "Unpaid") => {
      const todayIso = new Date().toISOString().split("T")[0];
      const { totalDue } = getChallanTotalDueWithFines(targetChallan, fineRecords);
      const parentNo = targetChallan.installmentPlan?.parentChallanNumber;

      const updated = challans.map((c) => {
        if (c.id === targetChallan.id) {
          const isPaid = nextStatus === "Paid";
          const nextPaid = isPaid ? totalDue : 0;
          const receiptNo = c.lastReceiptNumber || `RCP-${c.challanNumber.slice(-6)}`;
          const nextPlan = c.installmentPlan
            ? {
                ...c.installmentPlan,
                schedule: c.installmentPlan.schedule.map((inst) =>
                  inst.challanNumber === c.challanNumber || inst.installmentNo === c.installmentPlan?.installmentNumber
                    ? {
                        ...inst,
                        status: (isPaid ? "Paid" : "Unpaid") as "Paid" | "Unpaid",
                        paidDate: isPaid ? todayIso : undefined,
                      }
                    : inst
                ),
              }
            : undefined;

          return {
            ...c,
            totalPayable: totalDue,
            paid: nextPaid,
            status: nextStatus as FeeStatus,
            collectDate: isPaid ? todayIso : c.dueDate,
            lastPaymentDate: isPaid ? todayIso : undefined,
            lastReceiptNumber: isPaid ? receiptNo : undefined,
            lastPaymentMethod: isPaid ? (c.lastPaymentMethod || "Cash Counter") : undefined,
            lastPaymentAmount: isPaid ? totalDue : undefined,
            payments: isPaid
              ? [
                  {
                    id: `pay-${Date.now()}`,
                    receiptNumber: receiptNo,
                    paymentDate: todayIso,
                    paymentMethod: c.lastPaymentMethod || "Cash Counter",
                    amount: totalDue,
                  },
                ]
              : [],
            installmentPlan: nextPlan,
          };
        }

        // Keep sibling installment schedule synchronized if they share a parent challan
        if (parentNo && c.installmentPlan?.parentChallanNumber === parentNo) {
          const isPaid = nextStatus === "Paid";
          return {
            ...c,
            installmentPlan: {
              ...c.installmentPlan,
              schedule: c.installmentPlan.schedule.map((inst) =>
                inst.challanNumber === targetChallan.challanNumber ||
                inst.installmentNo === targetChallan.installmentPlan?.installmentNumber
                  ? {
                      ...inst,
                      status: (isPaid ? "Paid" : "Unpaid") as "Paid" | "Unpaid",
                      paidDate: isPaid ? todayIso : undefined,
                    }
                  : inst
              ),
            },
          };
        }

        return c;
      });

      setChallans(updated);
      writeFeeChallans(updated);
      toast.success(
        nextStatus === "Paid"
          ? `Challan ${targetChallan.challanNumber} (${targetChallan.student}) marked as Paid (${formatCurrency(totalDue)}).`
          : `Challan ${targetChallan.challanNumber} (${targetChallan.student}) marked as Unpaid.`
      );
    },
    [challans, fineRecords]
  );

  const handleSaveEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingChallan) return;
    const nextTuition = Number(editTuition) || 0;
    const nextLab = Number(editLab) || 0;
    const nextSports = Number(editSports) || 0;
    const nextTransport = Number(editTransport) || 0;
    const nextFines = Number(editFines) || 0;
    const nextLibrary = Number(editLibrary) || 0;
    const nextUtilities = Number(editUtilities) || 0;
    const nextPreviousDues = Math.max(0, Number(editPreviousDues) || 0);
    const cleanedCustom = editCustomHeads
      .filter((h) => h.name.trim() !== "")
      .map((h) => ({
        id: h.id || `head-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: h.name.trim(),
        amount: Number(h.amount) || 0,
      }));
    const nextTotal =
      nextTuition +
      nextLab +
      nextSports +
      nextTransport +
      nextFines +
      nextLibrary +
      nextUtilities +
      nextPreviousDues +
      cleanedCustom.reduce((s, h) => s + h.amount, 0);

    if (nextTotal <= 0) {
      setEditError("Total fee charges must be greater than zero.");
      return;
    }
    if (!editDueDate) {
      setEditError("Select a due date for this challan.");
      return;
    }

    const status: FeeStatus = editStatus === "Paid" ? "Paid" : "Unpaid";
    const nextPaid = status === "Paid" ? nextTotal : 0;
    const parentNo = editingChallan.installmentPlan?.parentChallanNumber;

    const updated = challans.map((item) => {
      if (item.id === editingChallan.id) {
        const nextPlan = item.installmentPlan
          ? {
              ...item.installmentPlan,
              schedule: item.installmentPlan.schedule.map((inst) =>
                inst.challanNumber === item.challanNumber ||
                inst.installmentNo === item.installmentPlan?.installmentNumber
                  ? {
                      ...inst,
                      dueDate: editDueDate,
                      amount: nextTotal,
                      status: (status === "Paid" ? "Paid" : "Unpaid") as "Paid" | "Unpaid",
                      paidDate: status === "Paid" ? (editCollectDate || editDueDate) : undefined,
                    }
                  : inst
              ),
            }
          : undefined;

        return {
          ...item,
          tuitionFee: nextTuition,
          labCharges: nextLab,
          sportsCharges: nextSports,
          transportCharges: nextTransport,
          fineCharges: nextFines,
          libraryFund: nextLibrary,
          utilitySurcharge: nextUtilities,
          otherCharges: 0,
          previousDues: nextPreviousDues,
          previousDuesBreakdown:
            nextPreviousDues === 0
              ? []
              : editingChallan.previousDues === nextPreviousDues
                ? editingChallan.previousDuesBreakdown
                : undefined,
          customHeads: cleanedCustom,
          totalPayable: nextTotal,
          paid: nextPaid,
          dueDate: editDueDate,
          rollNo: editRollNo.trim() || item.rollNo || getStudentRollNo(item),
          status,
          collectDate: editCollectDate || item.collectDate || editDueDate || "2026-10-08",
          lastPaymentDate:
            status === "Paid" ? (editCollectDate || item.lastPaymentDate || item.collectDate || editDueDate) : undefined,
          installmentPlan: nextPlan,
        };
      }

      if (parentNo && item.installmentPlan?.parentChallanNumber === parentNo) {
        return {
          ...item,
          installmentPlan: {
            ...item.installmentPlan,
            schedule: item.installmentPlan.schedule.map((inst) =>
              inst.challanNumber === editingChallan.challanNumber ||
              inst.installmentNo === editingChallan.installmentPlan?.installmentNumber
                ? {
                    ...inst,
                    dueDate: editDueDate,
                    amount: nextTotal,
                    status: (status === "Paid" ? "Paid" : "Unpaid") as "Paid" | "Unpaid",
                    paidDate: status === "Paid" ? (editCollectDate || editDueDate) : undefined,
                  }
                : inst
            ),
          },
        };
      }

      return item;
    });

    setChallans(updated);
    writeFeeChallans(updated);
    toast.success(`Challan ${editingChallan.challanNumber} updated (${status}).`);
    setEditingChallan(null);
  };

  const handleProcessPayment = React.useCallback(
    (
      challanId: string,
      paymentAmount: number,
      lateFee: number,
      paymentDate: string,
      _paymentMethod = "Cash Counter",
      _receiptNumber = "",
      installmentPlan?: FeeInstallmentPlan
    ) => {
      const target = challans.find((c) => c.id === challanId);
      if (!target) return;

      const { totalDue } = getChallanTotalDueWithFines(target, fineRecords);
      const totalWithLate = totalDue + lateFee;
      const baseNo = target.installmentPlan
        ? target.challanNumber
        : target.challanNumber.replace(/-[1-5]$/, "");
      const schedule = installmentPlan?.schedule ?? [];

      const rawSchedule =
        schedule.length >= 2
          ? schedule
          : [
              {
                installmentNo: 1,
                label: "1st Installment",
                challanNumber: `${baseNo}-1`,
                dueDate: paymentDate || target.dueDate,
                amount: paymentAmount,
                status: "Unpaid" as const,
              },
              {
                installmentNo: 2,
                label: "2nd Installment",
                challanNumber: `${baseNo}-2`,
                dueDate: target.dueDate,
                amount: Math.max(0, totalWithLate - paymentAmount),
                status: "Unpaid" as const,
              },
            ];

      const totalCount = rawSchedule.length;
      const normalizedSchedule = rawSchedule.map((item, idx) => {
        const no = idx + 1;
        return {
          ...item,
          installmentNo: no,
          label: item.label || `${formatOrdinal(no)} Installment`,
          challanNumber: item.challanNumber || `${baseNo}-${no}`,
          dueDate: item.dueDate || target.dueDate,
          status: "Unpaid" as const,
        };
      });

      const sharedPlanBase: FeeInstallmentPlan = {
        totalInstallments: totalCount,
        parentChallanNumber: baseNo,
        createdAt: installmentPlan?.createdAt || normalizedSchedule[0].dueDate,
        approvedBy: installmentPlan?.approvedBy || "Accounts Office",
        remarks: installmentPlan?.remarks || `${totalCount}-part fee installment plan`,
        schedule: normalizedSchedule,
      };

      const ts = Date.now();
      const createdChallans: FeeChallan[] = normalizedSchedule.map((item, idx) => {
        const no = idx + 1;
        return {
          ...target,
          id: `${target.id}-inst-${no}-${ts + idx}`,
          challanNumber: item.challanNumber,
          dueDate: item.dueDate,
          collectDate: item.dueDate,
          totalPayable: item.amount,
          tuitionFee: item.amount,
          labCharges: 0,
          sportsCharges: 0,
          libraryFund: 0,
          utilitySurcharge: 0,
          otherCharges: 0,
          transportCharges: 0,
          fineCharges: 0,
          previousDues: 0,
          previousDuesBreakdown: [],
          customHeads: [],
          scholarshipConcession: 0,
          paid: 0,
          status: "Unpaid",
          lastPaymentDate: undefined,
          lastReceiptNumber: undefined,
          lastPaymentMethod: undefined,
          lastPaymentAmount: undefined,
          payments: [],
          installmentPlan: {
            ...sharedPlanBase,
            installmentNumber: no,
          },
        };
      });

      const updated = challans.flatMap((c) => (c.id === challanId ? createdChallans : [c]));
      setChallans(updated);
      writeFeeChallans(updated);

      toast.success(
        `Created ${totalCount} separate Unpaid installments for ${target.student}: ${createdChallans
          .map((c) => `${c.challanNumber} (${formatCurrency(c.totalPayable)})`)
          .join(", ")}.`
      );
    },
    [challans, fineRecords]
  );

  const selectedMonthLabel = React.useMemo(() => {
    if (isAllDateFilter(selectedMonth)) return "All Collection Dates";
    if (selectedMonth.startsWith("date:")) {
      return `Date: ${formatDate(selectedMonth.slice(5))}`;
    }
    if (selectedMonth.startsWith("month:")) {
      const parts = selectedMonth.slice(6).split("-");
      if (parts.length === 2) {
        const mIdx = Number(parts[1]) - 1;
        const shortM = MONTH_NAMES_MAP[Object.keys(MONTH_NAMES_MAP)[mIdx]] || parts[1];
        return `${shortM} ${parts[0]} Collections`;
      }
    }
    if (selectedMonth.startsWith("year:")) {
      return `AY ${selectedMonth.slice(5)} Archive`;
    }
    return getMonthFullLabel(selectedMonth);
  }, [selectedMonth]);

  const availableMonths = React.useMemo<FilterOption[]>(() => {
    const set = new Set<string>();
    challans.forEach((c) => {
      if (c.monthYear) set.add(normalizeMonth(c.monthYear));
    });

    const academicCycle = [
      "Oct 2026",
      "Sep 2026",
      "Aug 2026",
      "Nov 2026",
      "Dec 2026",
      "Jan 2027",
      "Feb 2027",
      "Mar 2027",
      "Apr 2027",
      "May 2027",
      "Jun 2027",
      "Jul 2027",
    ];
    academicCycle.forEach((m) => set.add(m));

    return Array.from(set).map((m) => {
      const fullLabel = getMonthFullLabel(m);
      const isCurrent = m === "Oct 2026";
      return {
        value: m,
        label: isCurrent ? `${fullLabel} (Active)` : fullLabel,
      };
    });
  }, [challans]);

  const challanFilters: FilterDef<FeeChallan>[] = React.useMemo(
    () => [
      {
        key: "collectDate",
        label: "Collection Date",
        allLabel: "All Collection Dates",
        icon: CalendarDays,
        options: availableMonths,
        getValue: (r) => getChallanCollectionDate(r) || "",
        matches: (r, v): boolean => {
          if (isAllDateFilter(v)) return true;
          const cDate = getChallanCollectionDate(r);
          if (v.startsWith("date:")) {
            const targetIso = v.slice(5);
            return Boolean(
              cDate === targetIso ||
              r.lastPaymentDate === targetIso ||
              r.dueDate === targetIso ||
              (r.payments && r.payments.some((p) => p.paymentDate === targetIso))
            );
          }
          if (v.startsWith("month:")) {
            const ym = v.slice(6);
            return Boolean(
              (cDate && cDate.startsWith(ym)) ||
              (r.lastPaymentDate && r.lastPaymentDate.startsWith(ym)) ||
              (r.dueDate && r.dueDate.startsWith(ym)) ||
              (r.monthYear && normalizeMonth(r.monthYear).toLowerCase().includes(ym))
            );
          }
          if (v.startsWith("year:")) {
            const yr = v.slice(5);
            return Boolean(
              (cDate && cDate.startsWith(yr)) ||
              (r.lastPaymentDate && r.lastPaymentDate.startsWith(yr)) ||
              (r.dueDate && r.dueDate.startsWith(yr)) ||
              (r.monthYear && r.monthYear.includes(yr))
            );
          }
          return Boolean(cDate === v || normalizeMonth(r.monthYear) === v);
        },
        value: selectedMonth,
        onChange: (v) => setSelectedMonth(isAllDateFilter(v) ? ALL : v),
        triggerClassName: "w-[170px] sm:w-[210px]",
        renderCustom: ({ value, onChange }) => (
          <FeeCollectionCalendarDropdown
            value={value}
            onChange={onChange}
            challans={mergedChallans}
          />
        ),
      },
      {
        key: "status",
        label: "Status",
        options: ["Paid", "Unpaid"],
        getValue: (r) => (r.status === "Paid" ? "Paid" : "Unpaid"),
      },
      {
        key: "campus",
        label: "Campus",
        allLabel: "All Campuses",
        options: [
          { value: "Main Campus", label: "Main Campus" },
          { value: "DHA Phase 5", label: "DHA Phase 5" },
          { value: "F-8 Islamabad", label: "F-8 Islamabad" },
          { value: "Clifton", label: "Clifton" },
        ],
        getValue: (r) => r.campus,
        matches: (r, v) => matchCampus(v, r.campus),
        value: selectedCampus,
        onChange: (v) => {
          setSelectedCampus(v);
          if (typeof window !== "undefined") {
            const stats = getCampusStats(v);
            try {
              window.sessionStorage.setItem("edusphere:selected-campus", stats.id);
            } catch {
              // ignore storage errors
            }
            window.dispatchEvent(
              new CustomEvent("edusphere:campus-changed", {
                detail: { campusId: stats.id, campusName: stats.shortName },
              })
            );
          }
        },
      },
    ],
    [availableMonths, selectedCampus, selectedMonth, mergedChallans]
  );

  const visibleChallans = React.useMemo(() => {
    return mergedChallans.filter((c) => {
      if (!matchCampus(selectedCampus, c.campus)) return false;
      if (isAllDateFilter(selectedMonth)) return true;
      const cDate = getChallanCollectionDate(c);
      if (selectedMonth.startsWith("date:")) {
        const targetIso = selectedMonth.slice(5);
        return Boolean(
          cDate === targetIso ||
          c.lastPaymentDate === targetIso ||
          c.dueDate === targetIso ||
          (c.payments && c.payments.some((p) => p.paymentDate === targetIso))
        );
      }
      if (selectedMonth.startsWith("month:")) {
        const ym = selectedMonth.slice(6);
        return Boolean(
          (cDate && cDate.startsWith(ym)) ||
          (c.lastPaymentDate && c.lastPaymentDate.startsWith(ym)) ||
          (c.dueDate && c.dueDate.startsWith(ym)) ||
          (c.monthYear && normalizeMonth(c.monthYear).toLowerCase().includes(ym))
        );
      }
      if (selectedMonth.startsWith("year:")) {
        const yr = selectedMonth.slice(5);
        return Boolean(
          (cDate && cDate.startsWith(yr)) ||
          (c.lastPaymentDate && c.lastPaymentDate.startsWith(yr)) ||
          (c.dueDate && c.dueDate.startsWith(yr)) ||
          (c.monthYear && c.monthYear.includes(yr))
        );
      }
      return normalizeMonth(c.monthYear) === selectedMonth || cDate === selectedMonth;
    });
  }, [mergedChallans, selectedMonth, selectedCampus]);

  // Dynamic Cards Data responding dynamically to both Campus selection AND Date/Month/Year Calendar selection!
  const computedCards = React.useMemo(() => {
    const isAllCampuses = selectedCampus === ALL || selectedCampus === "all" || selectedCampus.toLowerCase().includes("all");
    const isFiltered = !isAllDateFilter(selectedMonth);

    // 1. Default View (No specific date/month/year filter applied)
    if (!isFiltered) {
      if (isAllCampuses) {
        return [
          {
            key: "revenue",
            label: "Total Revenue (AY 2026-27)",
            value: formatCurrencyCompact(totalRevenue),
            title: `${formatCurrency(totalRevenue)} · Consolidated Multi-Campus Revenue`,
            icon: Wallet,
          },
          {
            key: "dues",
            label: "Outstanding Dues",
            value: formatCurrencyCompact(outstanding),
            title: `${formatCurrency(outstanding)} pending dues across all campuses`,
            icon: CreditCard,
          },
          {
            key: "rate",
            label: "Collection Rate",
            value: `${collectionRate}%`,
            title: `${collectionRate}% overall institutional fee recovery rate`,
            icon: TrendingUp,
          },
          {
            key: "students",
            label: "Paid Students",
            title: `${formatNumber(paidStudents)} / ${formatNumber(totalStudents)} students paid institutional wide`,
            value: (
              <span className="inline-flex items-baseline justify-center gap-1">
                <span className="font-bold text-foreground">{formatNumber(paidStudents)}</span>
                <span className="text-xs font-semibold text-muted-foreground">/ {formatNumber(totalStudents)}</span>
              </span>
            ),
            icon: UserCheck,
          },
        ];
      } else {
        return [
          {
            key: "collected-today",
            label: "Total Collected Fee Today",
            value: formatCurrency(collectedToday),
            title: `${formatCurrency(collectedToday)} collected today at ${campusStats.name}`,
            icon: Wallet,
          },
          {
            key: "dues",
            label: "Outstanding Dues",
            value: formatCurrencyCompact(outstanding),
            title: `${formatCurrency(outstanding)} pending dues at ${campusStats.name}`,
            icon: CreditCard,
          },
          {
            key: "receipts-today",
            label: "Total Receipts Today",
            value: (
              <span className="inline-flex items-baseline justify-center gap-1">
                <span className="font-bold text-foreground">{formatNumber(receiptsToday)}</span>
                <span className="text-xs font-semibold text-muted-foreground">Receipts</span>
              </span>
            ),
            title: `${receiptsToday} fee payment receipts cleared today at ${campusStats.name}`,
            icon: Receipt,
          },
          {
            key: "rate-today",
            label: "Total Collection Rate Today",
            value: `${collectionRateToday}%`,
            title: `${collectionRateToday}% daily collection target achieved at ${campusStats.name}`,
            icon: TrendingUp,
          },
        ];
      }
    }

    // 2. Specific Date Filter: date:YYYY-MM-DD
    if (selectedMonth.startsWith("date:")) {
      const targetIso = selectedMonth.slice(5);
      const formattedDate = formatDate(targetIso);

      const dateCollected = visibleChallans.reduce((sum, c) => {
        if (c.payments && c.payments.length > 0) {
          const matchPay = c.payments.filter((p) => p.paymentDate === targetIso);
          if (matchPay.length > 0) return sum + matchPay.reduce((s, p) => s + p.amount, 0);
        }
        if (c.collectDate === targetIso || c.lastPaymentDate === targetIso) {
          return sum + (c.lastPaymentAmount || c.paid || 0);
        }
        return sum;
      }, 0);

      const receiptsCount = visibleChallans.filter((c) => {
        if (c.payments && c.payments.some((p) => p.paymentDate === targetIso)) return true;
        return c.collectDate === targetIso || c.lastPaymentDate === targetIso;
      }).length;

      const displayCollected = dateCollected > 0
        ? dateCollected
        : targetIso === "2026-10-08"
          ? (isAllCampuses ? 383700 : campusStats.collectedToday)
          : (visibleChallans.length > 0 ? visibleChallans.reduce((s, c) => s + c.paid, 0) : 0);

      const displayReceipts = receiptsCount > 0
        ? receiptsCount
        : targetIso === "2026-10-08"
          ? (isAllCampuses ? 23 : campusStats.receiptsToday)
          : visibleChallans.length;

      const displayRate = displayCollected > 0 ? (isAllCampuses ? "95.5%" : `${campusStats.collectionRateToday}%`) : "0.0%";

      if (isAllCampuses) {
        return [
          {
            key: "date-collected",
            label: `Total Collected (${formattedDate})`,
            value: formatCurrency(displayCollected),
            title: `${formatCurrency(displayCollected)} collected on ${formattedDate} across all campuses`,
            icon: Wallet,
          },
          {
            key: "date-dues",
            label: "Outstanding Dues",
            value: formatCurrencyCompact(outstanding),
            title: `${formatCurrency(outstanding)} pending dues across all campuses`,
            icon: CreditCard,
          },
          {
            key: "date-receipts",
            label: `Total Receipts (${formattedDate})`,
            value: (
              <span className="inline-flex items-baseline justify-center gap-1">
                <span className="font-bold text-foreground">{formatNumber(displayReceipts)}</span>
                <span className="text-xs font-semibold text-muted-foreground">Receipts</span>
              </span>
            ),
            title: `${displayReceipts} fee receipts recorded on ${formattedDate}`,
            icon: Receipt,
          },
          {
            key: "date-rate",
            label: `Collection Rate (${formattedDate})`,
            value: displayRate,
            title: `${displayRate} collection recovery on ${formattedDate}`,
            icon: TrendingUp,
          },
        ];
      } else {
        return [
          {
            key: "date-collected-campus",
            label: `Total Collected Fee (${formattedDate})`,
            value: formatCurrency(displayCollected),
            title: `${formatCurrency(displayCollected)} collected on ${formattedDate} at ${campusStats.name}`,
            icon: Wallet,
          },
          {
            key: "date-dues-campus",
            label: "Outstanding Dues",
            value: formatCurrencyCompact(outstanding),
            title: `${formatCurrency(outstanding)} pending dues at ${campusStats.name}`,
            icon: CreditCard,
          },
          {
            key: "date-receipts-campus",
            label: `Total Receipts (${formattedDate})`,
            value: (
              <span className="inline-flex items-baseline justify-center gap-1">
                <span className="font-bold text-foreground">{formatNumber(displayReceipts)}</span>
                <span className="text-xs font-semibold text-muted-foreground">Receipts</span>
              </span>
            ),
            title: `${displayReceipts} student receipts processed on ${formattedDate} at ${campusStats.name}`,
            icon: Receipt,
          },
          {
            key: "date-rate-campus",
            label: `Total Collection Rate (${formattedDate})`,
            value: displayRate,
            title: `${displayRate} daily target achieved on ${formattedDate} at ${campusStats.name}`,
            icon: TrendingUp,
          },
        ];
      }
    }

    // 3. Month Filter: month:YYYY-MM
    if (selectedMonth.startsWith("month:")) {
      const ym = selectedMonth.slice(6);
      const parts = ym.split("-");
      const monthLabel = parts.length === 2
        ? `${MONTH_NAMES_MAP[Object.keys(MONTH_NAMES_MAP)[Number(parts[1]) - 1]] || parts[1]} ${parts[0]}`
        : ym;

      const monthCollected = visibleChallans.reduce((sum, c) => sum + (c.paid || 0), 0);
      const monthPaidCount = visibleChallans.filter((c) => c.status === "Paid").length;
      const displayCollected = monthCollected > 0
        ? monthCollected
        : isAllCampuses ? campusStats.totalRevenue : (campusStats.totalRevenue / 12);

      if (isAllCampuses) {
        return [
          {
            key: "month-rev",
            label: `Total Revenue (${monthLabel})`,
            value: formatCurrencyCompact(displayCollected),
            title: `${formatCurrency(displayCollected)} revenue for ${monthLabel}`,
            icon: Wallet,
          },
          {
            key: "month-dues",
            label: `Outstanding Dues (${monthLabel})`,
            value: formatCurrencyCompact(outstanding),
            title: `${formatCurrency(outstanding)} pending dues for ${monthLabel}`,
            icon: CreditCard,
          },
          {
            key: "month-rate",
            label: `Collection Rate (${monthLabel})`,
            value: `${collectionRate}%`,
            title: `${collectionRate}% recovery rate for ${monthLabel}`,
            icon: TrendingUp,
          },
          {
            key: "month-students",
            label: `Paid Students (${monthLabel})`,
            value: (
              <span className="inline-flex items-baseline justify-center gap-1">
                <span className="font-bold text-foreground">{formatNumber(monthPaidCount || paidStudents)}</span>
                <span className="text-xs font-semibold text-muted-foreground">/ {formatNumber(visibleChallans.length || totalStudents)}</span>
              </span>
            ),
            title: `${monthPaidCount} students paid in ${monthLabel}`,
            icon: UserCheck,
          },
        ];
      } else {
        return [
          {
            key: "month-collected-campus",
            label: `Total Collected Fee (${monthLabel})`,
            value: formatCurrencyCompact(displayCollected),
            title: `${formatCurrency(displayCollected)} collected in ${monthLabel} at ${campusStats.name}`,
            icon: Wallet,
          },
          {
            key: "month-dues-campus",
            label: "Outstanding Dues",
            value: formatCurrencyCompact(outstanding),
            title: `${formatCurrency(outstanding)} pending dues at ${campusStats.name}`,
            icon: CreditCard,
          },
          {
            key: "month-receipts-campus",
            label: `Total Receipts (${monthLabel})`,
            value: (
              <span className="inline-flex items-baseline justify-center gap-1">
                <span className="font-bold text-foreground">{formatNumber(visibleChallans.length)}</span>
                <span className="text-xs font-semibold text-muted-foreground">Receipts</span>
              </span>
            ),
            title: `${visibleChallans.length} receipts in ${monthLabel} at ${campusStats.name}`,
            icon: Receipt,
          },
          {
            key: "month-rate-campus",
            label: `Total Collection Rate (${monthLabel})`,
            value: `${campusStats.collectionRate}%`,
            title: `${campusStats.collectionRate}% target achieved in ${monthLabel}`,
            icon: TrendingUp,
          },
        ];
      }
    }

    // 4. Year Filter: year:YYYY
    if (selectedMonth.startsWith("year:")) {
      const yr = selectedMonth.slice(5);
      const yearLabel = `AY ${yr}–${String(Number(yr) + 1).slice(2)}`;
      const yearCollected = visibleChallans.reduce((sum, c) => sum + (c.paid || 0), 0);
      const yearPaidCount = visibleChallans.filter((c) => c.status === "Paid").length;
      const displayCollected = yearCollected > 0 ? yearCollected : (campusStats.totalRevenue * 0.95);

      if (isAllCampuses) {
        return [
          {
            key: "year-rev",
            label: `Total Revenue (${yearLabel})`,
            value: formatCurrencyCompact(displayCollected),
            title: `${formatCurrency(displayCollected)} revenue for ${yearLabel}`,
            icon: Wallet,
          },
          {
            key: "year-dues",
            label: `Outstanding Dues (${yearLabel})`,
            value: formatCurrencyCompact(outstanding),
            title: `${formatCurrency(outstanding)} pending dues for ${yearLabel}`,
            icon: CreditCard,
          },
          {
            key: "year-rate",
            label: `Collection Rate (${yearLabel})`,
            value: `${collectionRate}%`,
            title: `${collectionRate}% recovery rate for ${yearLabel}`,
            icon: TrendingUp,
          },
          {
            key: "year-students",
            label: `Paid Students (${yearLabel})`,
            value: (
              <span className="inline-flex items-baseline justify-center gap-1">
                <span className="font-bold text-foreground">{formatNumber(yearPaidCount || paidStudents)}</span>
                <span className="text-xs font-semibold text-muted-foreground">/ {formatNumber(visibleChallans.length || totalStudents)}</span>
              </span>
            ),
            title: `${yearPaidCount} students paid in ${yearLabel}`,
            icon: UserCheck,
          },
        ];
      } else {
        return [
          {
            key: "year-collected-campus",
            label: `Total Collected Fee (${yearLabel})`,
            value: formatCurrencyCompact(displayCollected),
            title: `${formatCurrency(displayCollected)} collected in ${yearLabel} at ${campusStats.name}`,
            icon: Wallet,
          },
          {
            key: "year-dues-campus",
            label: "Outstanding Dues",
            value: formatCurrencyCompact(outstanding),
            title: `${formatCurrency(outstanding)} pending dues at ${campusStats.name}`,
            icon: CreditCard,
          },
          {
            key: "year-receipts-campus",
            label: `Total Receipts (${yearLabel})`,
            value: (
              <span className="inline-flex items-baseline justify-center gap-1">
                <span className="font-bold text-foreground">{formatNumber(visibleChallans.length)}</span>
                <span className="text-xs font-semibold text-muted-foreground">Receipts</span>
              </span>
            ),
            title: `${visibleChallans.length} receipts in ${yearLabel} at ${campusStats.name}`,
            icon: Receipt,
          },
          {
            key: "year-rate-campus",
            label: `Total Collection Rate (${yearLabel})`,
            value: `${campusStats.collectionRate}%`,
            title: `${campusStats.collectionRate}% target achieved in ${yearLabel}`,
            icon: TrendingUp,
          },
        ];
      }
    }

    return [];
  }, [
    selectedCampus,
    selectedMonth,
    totalRevenue,
    outstanding,
    collectionRate,
    paidStudents,
    totalStudents,
    collectedToday,
    receiptsToday,
    collectionRateToday,
    campusStats,
    visibleChallans,
  ]);

  const challanColumns = React.useMemo(
    () =>
      getChallanColumns(
        handleOpenPaymentDialog,
        setDetailsChallan,
        handleEdit,
        handlePrintStatement,
        handleDownloadStatement,
        handleChangeStatus,
        fineRecords
      ),
    [handleChangeStatus, handleDownloadStatement, handleEdit, handleOpenPaymentDialog, handlePrintStatement, fineRecords]
  );

  const handlePrint = () => {
    const ok = printFeeReport({ challans: visibleChallans });
    if (ok) {
      toast.info(`Opening print preview for ${campusStats.shortName} (${selectedMonthLabel})…`);
    }
  };

  const handleExportPdf = () => {
    const ok = exportFeeChallansPdf(visibleChallans);
    if (ok) {
      toast.success(
        `Fee Challans register (${visibleChallans.length} challans for ${campusStats.shortName}) downloaded as PDF.`
      );
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Fee Collection"
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
              onClick={() => setAddOpen(true)}
            >
              <Plus />
              <span>Add Fee Detail</span>
            </ActionButton>
          </>
        }
      />

      {/* ─── Executive KPI Cards: Dynamic by Campus & Selected Date/Month/Year ─── */}
      <StatGrid>
        {!isHydrated
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={`kpi-skeleton-${idx}`}
                aria-hidden="true"
                className="flex items-start justify-between rounded-xl border border-brand/10 bg-white p-3 pt-4 shadow-sm"
              >
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
                  <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="size-9 shrink-0 animate-pulse rounded-lg bg-slate-100" />
              </div>
            ))
          : computedCards.map((card) => (
              <StatCard
                key={card.key}
                label={card.label}
                value={card.value}
                title={card.title}
                icon={card.icon}
              />
            ))}
      </StatGrid>

      {/* Standalone Section Heading & Table Card */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg">
              Fee Challans & Collection Register
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-50/70 px-2.5 py-0.5 text-xs font-semibold text-brand">
              <CalendarDays className="size-3" />
              <span>{selectedMonthLabel}</span>
            </span>
          </div>
        </div>

        <SectionCard flush contentClassName="pt-5">
          {!isHydrated ? (
            <div aria-busy="true" aria-label="Loading fee collection records">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-4">
                <div className="h-9 w-64 animate-pulse rounded-lg bg-slate-100" />
                <div className="flex flex-wrap items-center gap-2">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={`filter-skeleton-${idx}`}
                      className="h-9 w-28 animate-pulse rounded-lg bg-slate-100"
                    />
                  ))}
                </div>
              </div>
              <div className="h-10 border-y border-[#091d3e] bg-gradient-to-r from-[#1e4275] via-[#12294d] to-[#091d3e]" />
              <div className="divide-y divide-border/50">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={`row-skeleton-${idx}`}
                    className="flex items-center justify-between gap-4 px-5 py-3.5"
                  >
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200/80" />
                    <div className="h-4 w-36 animate-pulse rounded bg-slate-200/80" />
                    <div className="hidden h-4 w-24 animate-pulse rounded bg-slate-100 md:block" />
                    <div className="hidden h-4 w-20 animate-pulse rounded bg-slate-100 sm:block" />
                    <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
                    <div className="h-7 w-20 animate-pulse rounded-lg bg-slate-100" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-border/50 px-5 py-3.5">
                <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />
                <div className="h-8 w-44 animate-pulse rounded-lg bg-slate-100" />
              </div>
            </div>
          ) : (
            <DataTable
              data={mergedChallans}
              columns={challanColumns}
              getRowId={(r) => r.id}
              filters={challanFilters}
              searchPlaceholder="Search challans or students…"
              searchFn={(r, q) =>
                r.student.toLowerCase().includes(q) ||
                r.challanNumber.toLowerCase().includes(q) ||
                r.className.toLowerCase().includes(q) ||
                r.campus.toLowerCase().includes(q) ||
                getStudentRollNo(r).toLowerCase().includes(q) ||
                r.monthYear.toLowerCase().includes(q) ||
                (getChallanCollectionDate(r) ? formatDate(getChallanCollectionDate(r)!).toLowerCase().includes(q) : false) ||
                (r.lastPaymentMethod ? r.lastPaymentMethod.toLowerCase().includes(q) : false)
              }
              pageSize={8}
              hideSortArrows
              tableClassName="w-full table-fixed"
              theadRowClassName="border-y border-[#091d3e] bg-gradient-to-r from-[#1e4275] via-[#12294d] to-[#091d3e] text-white shadow-sm"
            />
          )}
        </SectionCard>
      </div>

      <AddFeeDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        existing={challans}
        onCreate={handleCreate}
        feeTiers={feeTiers}
      />

      <ProcessPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        challan={selectedChallan}
        onProcessPayment={handleProcessPayment}
        fines={fineRecords}
        feeTiers={feeTiers}
        allChallans={challans}
      />

      <FeeChallanDetailsDialog
        challan={detailsChallan}
        feeTiers={feeTiers}
        fines={fineRecords}
        allChallans={challans}
        onClose={() => setDetailsChallan(null)}
        onPrint={handlePrintStatement}
        onDownload={handleDownloadStatement}
        onProcessPayment={(c) => {
          setDetailsChallan(null);
          handleOpenPaymentDialog(c);
        }}
      />

      {editingChallan && (
        <Dialog open={!!editingChallan} onOpenChange={(open) => !open && setEditingChallan(null)}>
          <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Fee Challan</DialogTitle>
              <DialogDescription className="sr-only">
                Edit individual fee charges and heads for this student challan.
              </DialogDescription>
            </DialogHeader>

            {/* Student & Challan Quick Summary Card */}
            <div className="rounded-lg border border-border/80 bg-muted/30 p-3 text-xs flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground text-sm">{editingChallan.student}</p>
                <p className="text-muted-foreground">{getStudentRollNo(editingChallan)} • {editingChallan.className} • {editingChallan.campus} Campus</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center justify-center rounded-md border border-brand/15 bg-brand-50/50 px-2 py-0.5 font-mono text-xs font-bold tracking-tight text-[#091d3e]">
                  {editingChallan.challanNumber}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">Period: {editingChallan.monthYear}</p>
              </div>
            </div>

            {/* Previous Months Dues Status Banner */}
            {Number(editPreviousDues) > 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-900 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="size-3.5 text-amber-600 shrink-0" />
                  <span>Previous months remaining dues (Arrears)</span>
                </span>
                <span className="font-mono font-bold text-amber-900">Rs {Number(editPreviousDues).toLocaleString()}</span>
              </div>
            ) : (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-2 text-xs text-emerald-900 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>Previous months dues status</span>
                </span>
                <span className="font-semibold text-emerald-800">Clear (No Arrears)</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 py-1">
              {/* Row 1: Due Date, Collect Date & Roll No */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Due Date</label>
                  <input
                    type="date"
                    required
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Collect Date</label>
                  <input
                    type="date"
                    value={editCollectDate}
                    onChange={(e) => setEditCollectDate(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Roll Number</label>
                  <input
                    type="text"
                    value={editRollNo}
                    onChange={(e) => setEditRollNo(e.target.value)}
                    placeholder="e.g. Roll #10"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>

              {/* Row 2: Payment Status (Unpaid / Paid) & Amount Paid (Rs) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Payment Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => {
                      const next = e.target.value as "Paid" | "Unpaid";
                      setEditStatus(next);
                      setEditPaid(next === "Paid" ? String(editTotalCalculated) : "0");
                    }}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-semibold shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Settlement Status Preview
                  </label>
                  <div className="h-9 flex items-center justify-between rounded-md border border-border/80 bg-muted/20 px-3 text-xs">
                    <span className="text-muted-foreground font-medium">
                      {editStatus === "Paid"
                        ? `Paid: ${formatCurrency(editTotalCalculated)}`
                        : "Balance Unpaid"}
                    </span>
                    <StatusBadge status={editStatus} />
                  </div>
                </div>
              </div>

              {/* Tuition Fee */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Tuition Fee (Monthly)</label>
                <input
                  type="number"
                  min={0}
                  required
                  placeholder="e.g. 18500"
                  value={editTuition}
                  onChange={(e) => setEditTuition(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              {/* Lab & Sports Charges */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Lab Charges</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 2500"
                    value={editLab}
                    onChange={(e) => setEditLab(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Sports & Activities</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 1000"
                    value={editSports}
                    onChange={(e) => setEditSports(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>

              {/* Library Fund & Utilities Surcharge */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Library Fund</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 1000"
                    value={editLibrary}
                    onChange={(e) => setEditLibrary(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Utilities Surcharge</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 2200"
                    value={editUtilities}
                    onChange={(e) => setEditUtilities(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>

              {/* Transport Charges & Fine Charges */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Transport Charges</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 3500"
                    value={editTransport}
                    onChange={(e) => setEditTransport(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Fine Charges</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 500"
                    value={editFines}
                    onChange={(e) => setEditFines(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>

              {/* Previous Months Dues & Add Custom Fee Head Button */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="size-3.5 text-amber-600" />
                    <span>Previous Months Dues (Arrears)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 0"
                    value={editPreviousDues}
                    onChange={(e) => setEditPreviousDues(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono font-medium"
                  />
                </div>
                <div className="flex items-end pb-0.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setEditCustomHeads((prev) => [
                        ...prev,
                        { id: `head-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: "", amount: "" },
                      ])
                    }
                    className="w-full text-xs h-9 border-dashed border-primary/40 text-primary hover:bg-primary/5 gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Custom Fee Head
                  </Button>
                </div>
              </div>

              {/* Dynamic Custom Fee Heads List */}
              {editCustomHeads.length > 0 && (
                <div className="space-y-2 rounded-md border border-border/70 bg-muted/20 p-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Custom Fee Heads ({editCustomHeads.length})
                    </p>
                    <span className="text-[11px] text-muted-foreground">
                      Subtotal: Rs {editCustomTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {editCustomHeads.map((head, idx) => (
                      <div key={head.id || idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Fee Head (e.g. Examination / Security)"
                          value={head.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditCustomHeads((prev) =>
                              prev.map((h, i) => (i === idx ? { ...h, name: val } : h))
                            );
                          }}
                          className="h-8 flex-1 rounded-md border border-input bg-background px-2.5 text-xs shadow-xs"
                        />
                        <input
                          type="number"
                          min={0}
                          placeholder="Amount"
                          value={head.amount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditCustomHeads((prev) =>
                              prev.map((h, i) => (i === idx ? { ...h, amount: val } : h))
                            );
                          }}
                          className="h-8 w-28 rounded-md border border-input bg-background px-2.5 text-xs shadow-xs"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditCustomHeads((prev) => prev.filter((_, i) => i !== idx))}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Remove head"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Calculation Banner */}
              <div className="rounded-lg border border-brand/20 bg-brand-50/50 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground font-medium">
                  <span>Current month fee charges:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatCurrency(editChargesSubtotal)}
                  </span>
                </div>
                {Number(editPreviousDues) > 0 && (
                  <div className="flex items-center justify-between text-amber-800 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-amber-600 shrink-0" />
                      Previous months remaining dues (arrears):
                    </span>
                    <span className="font-mono font-bold text-amber-900">
                      +{formatCurrency(Number(editPreviousDues))}
                    </span>
                  </div>
                )}
                <div className="border-t border-brand/15 pt-2 flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground font-medium block">Computed Total Payable:</span>
                    <p className="font-heading text-base font-bold text-brand mt-0.5">
                      {formatCurrency(editTotalCalculated)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-muted-foreground block">
                      Paid: {formatCurrency(Number(editPaid) || 0)}
                    </span>
                    <span className="text-[11px] font-bold text-foreground">
                      Remaining: {formatCurrency(Math.max(0, editTotalCalculated - (Number(editPaid) || 0)))}
                    </span>
                  </div>
                </div>
              </div>

              {editError && (
                <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {editError}
                </p>
              )}

              <DialogFooter className="pt-2 flex items-center justify-end gap-2 border-t">
                <Button type="button" variant="outline" onClick={() => setEditingChallan(null)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
