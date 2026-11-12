"use client";

import {
  AlertCircle,
  Award,
  Bus,
  Calculator,
  CheckCircle2,
  Coins,
  CreditCard,
  Dumbbell,
  FileDown,
  FlaskConical,
  History,
  Layers,
  Library,
  Printer,
  ReceiptText,
  School,
  Wallet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, formatOrdinal } from "@/lib/format";
import type { FeeChallan } from "@/types";
import type { FeeFineRecord, FeeRevisionRecord } from "@/lib/mock/finance";
import {
  calculatePreviousMonthDues,
  getChallanCollectionDate,
  getStudentRollNo,
  resolveMatchingTier,
} from "@/lib/mock/finance-storage";

interface FeeChallanDetailsDialogProps {
  challan: FeeChallan | null;
  feeTiers: FeeRevisionRecord[];
  fines: FeeFineRecord[];
  allChallans?: FeeChallan[];
  onClose: () => void;
  onPrint?: (challan: FeeChallan) => void;
  onDownload?: (challan: FeeChallan) => void;
  onProcessPayment?: (challan: FeeChallan) => void;
}

interface ChargeItem {
  key: string;
  label: string;
  amount: number;
  icon: typeof Wallet;
}

export function FeeChallanDetailsDialog({
  challan,
  feeTiers,
  fines,
  allChallans = [],
  onClose,
  onPrint,
  onDownload,
  onProcessPayment,
}: FeeChallanDetailsDialogProps) {
  const isInstallment = Boolean(challan?.installmentPlan);
  const tier =
    challan && !isInstallment
      ? resolveMatchingTier(challan.className, feeTiers)
      : undefined;

  const priorInfo = challan
    ? calculatePreviousMonthDues(challan, allChallans)
    : {
        total: 0,
        count: 0,
        details: "",
        months: [],
        priorChallans: [],
        isClear: true,
      };

  const previousDues =
    challan?.previousDues !== undefined && challan.previousDues > 0
      ? challan.previousDues
      : (priorInfo.total ?? 0);

  // Extract itemized heads cleanly (regular challans)
  const tuitionFee = challan?.tuitionFee ?? tier?.tuitionFee ?? 0;
  const labCharges = challan?.labCharges ?? tier?.labCharges ?? 0;
  const sportsCharges = challan?.sportsCharges ?? tier?.sportsCharges ?? 0;
  const transportCharges = challan?.transportCharges ?? 0;
  const fineCharges = challan?.fineCharges ?? 0;
  const libraryFund = challan?.libraryFund ?? tier?.libraryFund ?? 0;
  const utilitySurcharge = challan?.utilitySurcharge ?? tier?.utilitySurcharge ?? 0;
  const otherCharges = challan?.otherCharges ?? tier?.otherCharges ?? 0;
  const customHeads = challan?.customHeads ?? tier?.customHeads ?? [];
  const customHeadsSum = customHeads.reduce((s, h) => s + (Number(h.amount) || 0), 0);

  const hasItemizedBreakdown =
    !isInstallment &&
    Boolean(
      tier ||
        challan?.tuitionFee !== undefined ||
        challan?.labCharges !== undefined ||
        challan?.sportsCharges !== undefined ||
        challan?.transportCharges !== undefined ||
        challan?.fineCharges !== undefined
    );

  const scholarshipConcession = challan?.scholarshipConcession ?? 0;
  const scholarshipPercent = challan?.scholarshipPercent;
  const scholarshipName = challan?.scholarshipName ?? "Scholarship Concession";

  const grossChargesTotal = hasItemizedBreakdown
    ? tuitionFee +
      labCharges +
      sportsCharges +
      transportCharges +
      fineCharges +
      libraryFund +
      utilitySurcharge +
      otherCharges +
      customHeadsSum
    : (challan?.totalPayable ?? 0) + scholarshipConcession;

  const calculatedChargesTotal = Math.max(0, grossChargesTotal - scholarshipConcession);

  const additionalAdjustments =
    tier && challan && challan.totalPayable > calculatedChargesTotal + previousDues
      ? challan.totalPayable - (calculatedChargesTotal + previousDues)
      : 0;

  const amountDue = calculatedChargesTotal + additionalAdjustments;

  // Match FeesClient.getChallanTotalDueWithFines: installment rows already include fines in split
  const unpaidStudentFines =
    challan && !isInstallment
      ? fines.filter(
          (fine) =>
            fine.student.trim().toLowerCase() === challan.student.trim().toLowerCase() &&
            fine.status === "Unpaid"
        )
      : [];

  const unpaidFineTotal = unpaidStudentFines.reduce((sum, fine) => sum + fine.amount, 0);
  const unattachedFines = Math.max(0, unpaidFineTotal - fineCharges);
  const totalPayableWithFines = amountDue + previousDues + unattachedFines;

  const effectivePaid = challan
    ? Math.min(
        totalPayableWithFines,
        challan.status === "Paid" && challan.paid < amountDue + previousDues
          ? amountDue + previousDues
          : challan.paid
      )
    : 0;

  const remainingBalance = Math.max(0, totalPayableWithFines - effectivePaid);
  const collectionDate = challan ? getChallanCollectionDate(challan) : undefined;

  const paymentChannel =
    challan?.lastPaymentMethod ||
    (challan?.payments && challan.payments.length > 0 && challan.payments[0].paymentMethod
      ? challan.payments[0].paymentMethod
      : effectivePaid > 0 || challan?.status === "Paid"
        ? "Cash Counter"
        : "Cash Counter");

  const paymentsList =
    challan?.payments && challan.payments.length > 0
      ? challan.payments
      : effectivePaid > 0
        ? [
            {
              id: "pay-rec-1",
              receiptNumber:
                challan?.lastReceiptNumber || `RCP-${challan?.challanNumber.slice(-6)}`,
              paymentDate:
                collectionDate ||
                challan?.collectDate ||
                challan?.lastPaymentDate ||
                challan?.dueDate ||
                "",
              paymentMethod: challan?.lastPaymentMethod || "Cash Counter",
              amount: challan?.lastPaymentAmount || effectivePaid,
            },
          ]
        : [];

  const installmentPlanTotal =
    challan?.installmentPlan?.schedule?.reduce((sum, s) => sum + s.amount, 0) ?? amountDue;

  const chargeRows: ChargeItem[] = [];
  if (isInstallment && challan?.installmentPlan) {
    const no = challan.installmentPlan.installmentNumber ?? 1;
    chargeRows.push({
      key: "installment-share",
      label: `${formatOrdinal(no)} Installment Payable (${challan.installmentPlan.parentChallanNumber ?? challan.challanNumber})`,
      amount: amountDue,
      icon: Layers,
    });
  } else if (hasItemizedBreakdown) {
    const standardHeads: ChargeItem[] = [
      { key: "tuition", label: "Tuition Fee", amount: tuitionFee, icon: School },
      { key: "lab", label: "Lab Charges", amount: labCharges, icon: FlaskConical },
      { key: "sports", label: "Sports & Activities", amount: sportsCharges, icon: Dumbbell },
      { key: "transport", label: "Transport Charges", amount: transportCharges, icon: Bus },
      { key: "fine", label: "Fine / Late Charges", amount: fineCharges, icon: AlertCircle },
      { key: "library", label: "Library Fund", amount: libraryFund, icon: Library },
      { key: "utility", label: "Utilities & Maintenance", amount: utilitySurcharge, icon: Wallet },
      { key: "other", label: "Other Charges", amount: otherCharges, icon: Coins },
    ];
    for (const head of standardHeads) {
      if (head.amount > 0 || head.key === "tuition") {
        chargeRows.push(head);
      }
    }
    for (const custom of customHeads) {
      if ((Number(custom.amount) || 0) > 0) {
        chargeRows.push({
          key: `custom-${custom.id}`,
          label: custom.name,
          amount: Number(custom.amount) || 0,
          icon: ReceiptText,
        });
      }
    }
    if (additionalAdjustments > 0) {
      chargeRows.push({
        key: "adjustments",
        label: "Additional Adjustments",
        amount: additionalAdjustments,
        icon: ReceiptText,
      });
    }
  } else {
    chargeRows.push({
      key: "base",
      label: "Consolidated Fee Payable",
      amount: calculatedChargesTotal,
      icon: Wallet,
    });
  }

  return (
    <Dialog
      open={Boolean(challan)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="w-[calc(100vw-2rem)] max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto p-5 sm:max-w-[660px] sm:p-6">
        {challan && (
          <>
            <DialogHeader className="min-w-0 pr-8">
              <DialogTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
                <span>Fee Challan Details</span>
                <span className="inline-flex items-center justify-center rounded-md border border-brand/15 bg-brand-50/60 px-2 py-0.5 font-mono text-xs font-bold tracking-tight text-[#091d3e]">
                  {challan.challanNumber}
                </span>
                {challan.installmentPlan?.installmentNumber && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <Layers className="size-3 text-emerald-600" />
                    <span>
                      {formatOrdinal(challan.installmentPlan.installmentNumber)} of{" "}
                      {challan.installmentPlan.totalInstallments} Installments
                    </span>
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="min-w-0 space-y-4">
              {/* 1. Student & Billing Overview (single source of truth, no duplicates) */}
              <section className="rounded-xl border border-border/80 bg-muted/30 p-3.5 sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-heading text-base font-bold text-foreground truncate">
                        {challan.student}
                      </p>
                      <StatusBadge status={challan.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground truncate">
                      {getStudentRollNo(challan)} · {challan.className} · {challan.campus} Campus
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {remainingBalance === 0 ? "Total Settled" : "Balance Due"}
                    </p>
                    <p
                      className={cn(
                        "font-mono text-base sm:text-lg font-bold tabular-nums",
                        remainingBalance === 0
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      )}
                    >
                      {formatCurrency(
                        remainingBalance === 0 ? totalPayableWithFines : remainingBalance
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border/70 pt-2.5 text-xs sm:grid-cols-4">
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Billing Period</p>
                    <p className="mt-0.5 truncate font-semibold text-foreground">
                      {challan.monthYear}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Due Date</p>
                    <p className="mt-0.5 truncate font-semibold text-foreground">
                      {challan.dueDate ? formatDate(challan.dueDate) : "—"}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Collect Date</p>
                    <p className="mt-0.5 truncate font-semibold text-foreground">
                      {collectionDate
                        ? formatDate(collectionDate)
                        : challan.status === "Unpaid"
                          ? "Pending"
                          : "—"}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Payment Mode</p>
                    <p className="mt-0.5 truncate font-semibold text-foreground">
                      {paymentChannel}
                    </p>
                  </div>
                </div>
              </section>

              {/* 2. Unified Fee Breakdown & Settlement Ledger */}
              <section className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
                <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Calculator className="size-4 text-brand shrink-0" />
                    <h3 className="text-xs sm:text-sm font-bold text-foreground">
                      Fee Breakdown &amp; Summary
                    </h3>
                  </div>
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10.5px] font-semibold text-brand">
                    {isInstallment
                      ? `Plan Total: ${formatCurrency(installmentPlanTotal)}`
                      : tier
                        ? `Session ${tier.academicYear}`
                        : "Challan Statement"}
                  </span>
                </div>

                {/* Charge Heads */}
                <div className="divide-y divide-border/60 px-4">
                  {chargeRows.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.key}
                        className="flex items-center justify-between gap-3 py-2 text-xs sm:text-[13px]"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="grid size-6 shrink-0 place-items-center rounded-md bg-brand-50 text-brand">
                            <Icon className="size-3.5" />
                          </span>
                          <span className="truncate font-medium text-foreground">
                            {item.label}
                          </span>
                        </div>
                        <span className="shrink-0 font-mono font-semibold tabular-nums text-foreground">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    );
                  })}

                  {/* Scholarship Deduction (single unified row) */}
                  {scholarshipConcession > 0 && (
                    <div className="flex items-center justify-between gap-3 py-2 text-xs sm:text-[13px] text-purple-800 dark:text-purple-300">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                          <Award className="size-3.5" />
                        </span>
                        <span className="truncate font-semibold">
                          {scholarshipName}
                          {scholarshipPercent ? ` (${scholarshipPercent}% Off)` : ""}
                        </span>
                      </div>
                      <span className="shrink-0 font-mono font-bold tabular-nums">
                        −{formatCurrency(scholarshipConcession)}
                      </span>
                    </div>
                  )}

                  {/* Unpaid Fines (only shown if applicable) */}
                  {unattachedFines > 0 && (
                    <div className="flex items-center justify-between gap-3 py-2 text-xs sm:text-[13px] text-amber-800 dark:text-amber-300">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                          <AlertCircle className="size-3.5" />
                        </span>
                        <span className="truncate font-medium">
                          Institutional Fines (
                          {unpaidStudentFines.map((f) => f.fineType).join(", ")})
                        </span>
                      </div>
                      <span className="shrink-0 font-mono font-semibold tabular-nums">
                        +{formatCurrency(unattachedFines)}
                      </span>
                    </div>
                  )}

                  {/* Carried-Forward Arrears (only shown when > 0) */}
                  {previousDues > 0 && (
                    <div className="py-2 text-xs sm:text-[13px]">
                      <div className="flex items-center justify-between gap-3 text-amber-800 dark:text-amber-300">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="grid size-6 shrink-0 place-items-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                            <History className="size-3.5" />
                          </span>
                          <span className="truncate font-medium">
                            Previous Unpaid Dues
                            {priorInfo.priorChallans.length > 0
                              ? ` (${priorInfo.priorChallans
                                  .map((p) => `${p.monthYear}: ${formatCurrency(p.balance)}`)
                                  .join(", ")})`
                              : priorInfo.months.length > 0
                                ? ` (${priorInfo.months.join(", ")})`
                                : ""}
                          </span>
                        </div>
                        <span className="shrink-0 font-mono font-semibold tabular-nums">
                          +{formatCurrency(previousDues)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Settlement Summary Footer */}
                <div className="border-t bg-muted/30 px-4 py-3 space-y-1.5 text-xs sm:text-[13px]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-muted-foreground">Total Payable</span>
                    <span className="font-mono font-bold tabular-nums text-foreground">
                      {formatCurrency(totalPayableWithFines)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-muted-foreground">Amount Paid</span>
                    <span className="font-mono font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                      {effectivePaid > 0 ? `−${formatCurrency(effectivePaid)}` : formatCurrency(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-2">
                    <span className="font-bold text-foreground">Remaining Balance</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-mono text-sm sm:text-base font-bold tabular-nums",
                          remainingBalance === 0
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        )}
                      >
                        {formatCurrency(remainingBalance)}
                      </span>
                      {remainingBalance === 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
                          <CheckCircle2 className="size-3" />
                          Settled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. Installment Schedule (only shown for installment challans) */}
              {challan.installmentPlan?.schedule &&
                challan.installmentPlan.schedule.length > 0 && (
                  <section className="overflow-hidden rounded-xl border border-brand/20 bg-card shadow-2xs">
                    <div className="flex items-center justify-between gap-2 border-b bg-brand-50/40 px-4 py-2.5 dark:bg-brand-950/20">
                      <div className="flex items-center gap-2">
                        <Layers className="size-4 text-brand shrink-0" />
                        <h3 className="text-xs sm:text-sm font-bold text-foreground">
                          Installment Schedule (
                          {challan.installmentPlan.totalInstallments} Parts)
                        </h3>
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        Parent: {challan.installmentPlan.parentChallanNumber}
                      </span>
                    </div>
                    <table className="w-full table-fixed text-left text-xs">
                      <thead className="border-b bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                        <tr>
                          <th className="w-[26%] px-3 py-2">Installment</th>
                          <th className="w-[26%] px-2 py-2">Challan ID</th>
                          <th className="w-[18%] px-2 py-2">Due Date</th>
                          <th className="w-[17%] px-2 py-2 text-right">Amount</th>
                          <th className="w-[13%] px-1 py-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {challan.installmentPlan.schedule.map((inst) => {
                          const isCurrentRow =
                            inst.challanNumber === challan.challanNumber ||
                            inst.installmentNo === challan.installmentPlan?.installmentNumber;
                          return (
                            <tr
                              key={inst.installmentNo}
                              className={
                                isCurrentRow ? "bg-brand-50/50 dark:bg-brand-950/30" : ""
                              }
                            >
                              <td className="px-3 py-2 font-semibold text-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                  <span className="truncate">{inst.label}</span>
                                  {isCurrentRow && (
                                    <span className="shrink-0 rounded bg-brand/10 px-1.5 py-0 text-[10px] font-bold text-brand">
                                      Current
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td className="px-2 py-2 font-mono text-[11px] font-bold text-[#091d3e] truncate">
                                {inst.challanNumber || challan.challanNumber}
                              </td>
                              <td className="px-2 py-2 text-muted-foreground whitespace-nowrap">
                                {formatDate(inst.dueDate)}
                              </td>
                              <td className="px-2 py-2 text-right font-mono font-bold tabular-nums text-foreground whitespace-nowrap">
                                {formatCurrency(inst.amount)}
                              </td>
                              <td className="px-1 py-2 text-center">
                                <StatusBadge
                                  status={inst.status === "Paid" ? "Paid" : "Unpaid"}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </section>
                )}

              {/* 4. Payment Receipts (only shown when payments have been made) */}
              {paymentsList.length > 0 && (
                <section className="overflow-hidden rounded-xl border border-emerald-200/80 bg-card shadow-2xs dark:border-emerald-900/50">
                  <div className="flex items-center justify-between gap-2 border-b border-emerald-200/60 bg-emerald-50/40 px-4 py-2.5 dark:bg-emerald-950/20">
                    <div className="flex items-center gap-2">
                      <CreditCard className="size-4 text-emerald-700 shrink-0 dark:text-emerald-400" />
                      <h3 className="text-xs sm:text-sm font-bold text-foreground">
                        Payment Receipts ({paymentsList.length})
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      Cleared
                    </span>
                  </div>
                  <table className="w-full table-fixed text-left text-xs">
                    <thead className="border-b bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                      <tr>
                        <th className="w-[28%] px-3 py-2">Receipt #</th>
                        <th className="w-[24%] px-2 py-2">Date</th>
                        <th className="w-[26%] px-2 py-2">Method</th>
                        <th className="w-[22%] px-3 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {paymentsList.map((p, idx) => (
                        <tr key={p.id || idx}>
                          <td className="px-3 py-2 font-mono text-[11px] font-bold text-foreground truncate">
                            {p.receiptNumber || `RCP-${challan.challanNumber.slice(-6)}`}
                          </td>
                          <td className="px-2 py-2 text-muted-foreground whitespace-nowrap">
                            {p.paymentDate ? formatDate(p.paymentDate) : "—"}
                          </td>
                          <td className="px-2 py-2 font-medium text-foreground truncate">
                            {p.paymentMethod || "Cash Counter"}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                            {formatCurrency(p.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {/* Footer Actions */}
              <DialogFooter className="!mx-0 !mb-0 flex flex-wrap items-center justify-end gap-2 rounded-none border-t border-border/80 bg-transparent px-0 pt-3.5 pb-0">
                {onProcessPayment && challan.status === "Unpaid" && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onProcessPayment(challan);
                    }}
                    className="gap-1.5 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    <Layers className="size-3.5" />
                    Make Installment
                  </Button>
                )}
                {onPrint && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onPrint(challan)}
                    className="gap-1.5 text-xs"
                  >
                    <Printer className="size-3.5" />
                    Print
                  </Button>
                )}
                {onDownload && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onDownload(challan)}
                    className="gap-1.5 text-xs"
                  >
                    <FileDown className="size-3.5" />
                    Download PDF
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  onClick={onClose}
                  className="text-xs"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
