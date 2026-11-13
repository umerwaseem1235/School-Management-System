"use client";

import * as React from "react";
import {
  AlertCircle,
  CalendarClock,
  Check,
  Layers,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, formatOrdinal } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import type { FeeChallan, FeeInstallmentItem, FeeInstallmentPlan } from "@/types";
import type { FeeFineRecord, FeeRevisionRecord } from "@/lib/mock/finance";
import { calculatePreviousMonthDues, getStudentRollNo } from "@/lib/mock/finance-storage";

interface ProcessPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challan: FeeChallan | null;
  onProcessPayment: (
    challanId: string,
    paymentAmount: number,
    lateFee: number,
    paymentDate: string,
    paymentMethod?: string,
    receiptNumber?: string,
    installmentPlan?: FeeInstallmentPlan
  ) => void;
  fines?: FeeFineRecord[];
  feeTiers?: FeeRevisionRecord[];
  allChallans?: FeeChallan[];
}

const INSTALLMENT_COUNTS = [2, 3, 4, 5] as const;

function addDaysIso(baseIso: string, days: number): string {
  if (!baseIso) return "";
  const d = new Date(`${baseIso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

function buildEqualSplitAmounts(total: number, count: number): number[] {
  if (count <= 0) return [];
  if (total <= 0) return Array.from({ length: count }, () => 0);
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  return Array.from({ length: count }, (_, idx) => base + (idx < remainder ? 1 : 0));
}

export function ProcessPaymentDialog({
  open,
  onOpenChange,
  challan,
  onProcessPayment,
  fines = [],
  allChallans = [],
}: ProcessPaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto p-5 sm:max-w-[680px] sm:p-6">
        {open && challan && (
          <InstallmentPlanForm
            key={`${challan.id}-${challan.challanNumber}`}
            challan={challan}
            fines={fines}
            allChallans={allChallans}
            onClose={() => onOpenChange(false)}
            onProcessPayment={onProcessPayment}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function InstallmentPlanForm({
  challan,
  fines,
  allChallans,
  onClose,
  onProcessPayment,
}: {
  challan: FeeChallan;
  fines: FeeFineRecord[];
  allChallans: FeeChallan[];
  onClose: () => void;
  onProcessPayment: ProcessPaymentDialogProps["onProcessPayment"];
}) {
  const priorInfo = React.useMemo(
    () => calculatePreviousMonthDues(challan, allChallans),
    [challan, allChallans]
  );

  const previousDues = Math.round(
    challan.previousDues !== undefined && challan.previousDues > 0
      ? challan.previousDues
      : (priorInfo.total ?? 0)
  );

  const unattachedFines = React.useMemo(() => {
    if (!fines.length) return 0;
    const name = challan.student.trim().toLowerCase();
    const finesSum = fines
      .filter((f) => f.student.trim().toLowerCase() === name && f.status === "Unpaid")
      .reduce((sum, f) => sum + Math.round(f.amount), 0);
    return Math.max(0, finesSum - (challan.fineCharges || 0));
  }, [challan, fines]);

  const totalDue = Math.max(
    0,
    Math.round((challan.totalPayable ?? 0) + unattachedFines - (challan.paid ?? 0))
  );

  const defaultDue1 = challan.dueDate || "2026-10-10";
  const baseChallanNo = challan.installmentPlan
    ? challan.challanNumber
    : challan.challanNumber.replace(/-[1-5]$/, "");

  const [installmentCount, setInstallmentCount] = React.useState<number>(2);
  const [editableAmounts, setEditableAmounts] = React.useState<string[]>(() =>
    buildEqualSplitAmounts(totalDue, 2)
      .slice(0, 1)
      .map((amt) => (amt > 0 ? String(amt) : ""))
  );
  const [dueDates, setDueDates] = React.useState<string[]>(() => [
    defaultDue1,
    addDaysIso(defaultDue1, 15),
  ]);
  const [error, setError] = React.useState<string | null>(null);

  const parsedEditable = React.useMemo(
    () =>
      Array.from({ length: installmentCount - 1 }, (_, idx) =>
        Math.round(Number(editableAmounts[idx]) || 0)
      ),
    [installmentCount, editableAmounts]
  );

  const editableSum = parsedEditable.reduce((sum, val) => sum + val, 0);
  const finalInstallmentAmt = Math.max(0, totalDue - editableSum);

  const hasInvalidAmount =
    totalDue <= 0 ||
    parsedEditable.some((amt) => amt <= 0) ||
    finalInstallmentAmt <= 0;

  const isCustomSplit = React.useMemo(() => {
    const equal = buildEqualSplitAmounts(totalDue, installmentCount);
    return parsedEditable.some((amt, idx) => amt !== equal[idx]);
  }, [parsedEditable, totalDue, installmentCount]);

  const scheduleItems = React.useMemo<FeeInstallmentItem[]>(() => {
    return Array.from({ length: installmentCount }, (_, idx) => {
      const no = idx + 1;
      const isLast = idx === installmentCount - 1;
      const amount = isLast ? finalInstallmentAmt : (parsedEditable[idx] ?? 0);
      return {
        installmentNo: no,
        label: `${formatOrdinal(no)} Installment`,
        challanNumber: `${baseChallanNo}-${no}`,
        dueDate: dueDates[idx] || addDaysIso(defaultDue1, idx * 15),
        amount,
        status: "Unpaid",
      };
    });
  }, [
    installmentCount,
    finalInstallmentAmt,
    parsedEditable,
    baseChallanNo,
    dueDates,
    defaultDue1,
  ]);

  const handleCountChange = (nextCount: number) => {
    const equal = buildEqualSplitAmounts(totalDue, nextCount);
    setInstallmentCount(nextCount);
    setEditableAmounts(
      equal.slice(0, nextCount - 1).map((amt) => (amt > 0 ? String(amt) : ""))
    );
    setDueDates((prev) =>
      Array.from(
        { length: nextCount },
        (_, idx) => prev[idx] || addDaysIso(defaultDue1, idx * 15)
      )
    );
    setError(null);
  };

  const handleResetEqual = () => {
    const equal = buildEqualSplitAmounts(totalDue, installmentCount);
    setEditableAmounts(
      equal.slice(0, installmentCount - 1).map((amt) => (amt > 0 ? String(amt) : ""))
    );
    setError(null);
  };

  const handleAmountChange = (idx: number, raw: string) => {
    setEditableAmounts((prev) => {
      const next = [...prev];
      next[idx] = raw;
      return next;
    });

    const hypotheticalSum = Array.from(
      { length: installmentCount - 1 },
      (_, i) => Math.round(Number(i === idx ? raw : editableAmounts[i]) || 0)
    ).reduce((s, v) => s + v, 0);

    if (hypotheticalSum >= totalDue && totalDue > 0) {
      setError(
        `First ${installmentCount - 1} installments must total less than ${formatCurrency(totalDue)} so a positive balance remains for the ${formatOrdinal(installmentCount)} installment.`
      );
    } else {
      setError(null);
    }
  };

  const handleDueDateChange = (idx: number, value: string) => {
    setDueDates((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (totalDue <= 0) {
      return setError("There is no unpaid balance remaining on this challan.");
    }

    const missingDateIdx = scheduleItems.findIndex((item) => !item.dueDate);
    if (missingDateIdx !== -1) {
      return setError(
        `Please select a due date for the ${formatOrdinal(missingDateIdx + 1)} installment.`
      );
    }

    const zeroIdx = parsedEditable.findIndex((amt) => amt <= 0);
    if (zeroIdx !== -1) {
      return setError(
        `${formatOrdinal(zeroIdx + 1)} installment amount must be greater than zero.`
      );
    }

    if (finalInstallmentAmt <= 0) {
      return setError(
        `Sum of the first ${installmentCount - 1} installments (${formatCurrency(editableSum)}) must be less than total due (${formatCurrency(totalDue)}) so a balance remains for the ${formatOrdinal(installmentCount)} installment.`
      );
    }

    const firstDue = scheduleItems[0].dueDate;
    const plan: FeeInstallmentPlan = {
      totalInstallments: installmentCount,
      parentChallanNumber: baseChallanNo,
      createdAt: firstDue,
      approvedBy: "Accounts Office",
      remarks: `${installmentCount}-part fee installment plan`,
      schedule: scheduleItems,
    };

    onProcessPayment(
      challan.id,
      scheduleItems[0].amount,
      0,
      firstDue,
      "Cash Counter",
      scheduleItems[0].challanNumber,
      plan
    );
    onClose();
  };

  const arrearsAndFines = previousDues + unattachedFines;

  return (
    <>
      <DialogHeader className="min-w-0 pr-8">
        <DialogTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Layers className="size-4" />
          </span>
          <span>Create Fee Installment Plan</span>
          <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/60 px-2 py-0.5 font-mono text-xs font-bold text-[#381e0f]">
            {challan.challanNumber}
          </span>
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Split unpaid fee dues into 2 to 5 separate Unpaid installment challans.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="min-w-0 space-y-4 pt-1" noValidate>
        {/* Student & Balance Overview */}
        <section className="rounded-xl border border-border/80 bg-muted/30 p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-heading text-sm sm:text-base font-bold text-foreground truncate">
                  {challan.student}
                </p>
                <StatusBadge status="Unpaid" />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground truncate">
                {getStudentRollNo(challan)} · {challan.className} · {challan.campus} Campus
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[11px] font-medium text-muted-foreground">Total Unpaid Due</p>
              <p className="font-mono text-base sm:text-lg font-bold tabular-nums text-rose-600 dark:text-rose-400">
                {formatCurrency(totalDue)}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/70 pt-2.5 text-xs">
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">Billing Period</p>
              <p className="mt-0.5 truncate font-semibold text-foreground">{challan.monthYear}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">Original Due Date</p>
              <p className="mt-0.5 truncate font-semibold text-foreground">
                {challan.dueDate ? formatDate(challan.dueDate) : "—"}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">Arrears &amp; Fines</p>
              <p
                className={cn(
                  "mt-0.5 truncate font-semibold",
                  arrearsAndFines > 0
                    ? "text-amber-800 dark:text-amber-400"
                    : "text-emerald-700 dark:text-emerald-400"
                )}
              >
                {arrearsAndFines > 0 ? formatCurrency(arrearsAndFines) : "Nil (Clear)"}
              </p>
            </div>
          </div>
        </section>

        {/* Installment Count Dropdown & Schedule Table */}
        <section className="rounded-xl border border-border bg-card p-3.5 space-y-3 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarClock className="size-4 text-brand shrink-0" />
              <h3 className="text-xs sm:text-sm font-bold text-foreground">
                Installment Schedule
              </h3>
              {isCustomSplit && (
                <button
                  type="button"
                  onClick={handleResetEqual}
                  className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                  title="Distribute total evenly across selected installments"
                >
                  <RotateCcw className="size-3" />
                  <span>Equal Split</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label
                htmlFor="installment-count-select"
                className="text-xs font-semibold text-muted-foreground whitespace-nowrap"
              >
                Installments
              </label>
              <select
                id="installment-count-select"
                value={installmentCount}
                onChange={(e) => handleCountChange(Number(e.target.value))}
                className="h-8 cursor-pointer rounded-lg border border-input bg-background px-2.5 text-xs font-semibold text-foreground shadow-2xs transition-colors hover:border-brand/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                {INSTALLMENT_COUNTS.map((count) => (
                  <option key={count} value={count}>
                    {count} Installments
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fit-to-width Schedule Table (zero horizontal scroll) */}
          <div className="w-full overflow-hidden rounded-lg border border-border/80">
            <table className="w-full table-fixed text-left text-xs">
              <thead className="border-b bg-muted/50 text-[11px] font-semibold text-muted-foreground">
                <tr>
                  <th className="w-[19%] px-2 py-2">Installment</th>
                  <th className="w-[24%] px-2 py-2">Challan ID</th>
                  <th className="w-[24%] px-1.5 py-2">Due Date</th>
                  <th className="w-[20%] px-1.5 py-2 text-right">Amount (Rs)</th>
                  <th className="w-[13%] px-1 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-card">
                {scheduleItems.map((item, idx) => {
                  const isFinal = idx === installmentCount - 1;
                  const amtInvalid = !isFinal && (parsedEditable[idx] ?? 0) <= 0;
                  return (
                    <tr key={item.installmentNo} className="hover:bg-muted/20">
                      <td className="px-2 py-2 font-semibold text-foreground truncate">
                        {item.label}
                      </td>
                      <td className="px-2 py-2">
                        <span
                          title={item.challanNumber}
                          className="inline-block max-w-full truncate rounded border border-brand/15 bg-brand-50/60 px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#381e0f] align-middle"
                        >
                          {item.challanNumber}
                        </span>
                      </td>
                      <td className="px-1.5 py-2">
                        <input
                          type="date"
                          aria-label={`${item.label} due date`}
                          value={item.dueDate}
                          onChange={(e) => handleDueDateChange(idx, e.target.value)}
                          className="h-7 w-full min-w-0 rounded border border-input bg-background px-1.5 text-[11px] font-medium text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                          required
                        />
                      </td>
                      <td className="px-1.5 py-2 text-right">
                        {isFinal ? (
                          <div
                            title="Automatically balanced remaining dues"
                            className={cn(
                              "flex h-7 w-full items-center justify-end rounded border px-2 font-mono text-xs font-bold tabular-nums",
                              finalInstallmentAmt <= 0
                                ? "border-rose-300 bg-rose-50/70 text-rose-700"
                                : "border-border/70 bg-muted/40 text-foreground"
                            )}
                          >
                            {formatCurrency(item.amount)}
                          </div>
                        ) : (
                          <input
                            type="number"
                            min={1}
                            max={Math.max(1, totalDue - 1)}
                            step={1}
                            aria-label={`${item.label} amount`}
                            value={editableAmounts[idx] ?? ""}
                            onChange={(e) => handleAmountChange(idx, e.target.value)}
                            className={cn(
                              "h-7 w-full min-w-0 rounded border bg-background px-2 text-right font-mono text-xs font-semibold tabular-nums text-foreground focus:outline-none focus:ring-1",
                              amtInvalid
                                ? "border-rose-400 focus:ring-rose-500/30"
                                : "border-input focus:border-brand focus:ring-brand"
                            )}
                            required
                          />
                        )}
                      </td>
                      <td className="px-1 py-2 text-center">
                        <StatusBadge status="Unpaid" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t bg-muted/30 text-[11px] font-semibold text-muted-foreground">
                <tr>
                  <td colSpan={3} className="px-2 py-2 truncate">
                    Creates {installmentCount} separate Unpaid rows in register
                  </td>
                  <td className="px-2 py-2 text-right font-mono font-bold tabular-nums text-foreground whitespace-nowrap">
                    {formatCurrency(totalDue)}
                  </td>
                  <td className="px-1 py-2 text-center text-[10px] whitespace-nowrap">
                    All Unpaid
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {error && (
          <p
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-soft/50 px-3 py-2 text-xs font-medium text-danger"
          >
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        <DialogFooter className="!mx-0 !mb-0 flex flex-row items-center justify-end gap-2 rounded-none border-t border-border/80 bg-transparent px-0 pt-3.5 pb-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={hasInvalidAmount}
            className={cn(
              "gap-1.5 text-xs font-semibold cursor-pointer",
              hasInvalidAmount
                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            )}
          >
            <Check className="size-3.5" />
            <span>Create {installmentCount} Installments</span>
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
