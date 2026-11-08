"use client";

import {
  AlertCircle,
  Award,
  CreditCard,
  BookOpen,
  Calculator,
  CalendarDays,
  CheckCircle2,
  Clock,
  Coins,
  Dumbbell,
  Bus,
  FileDown,
  FlaskConical,
  History,
  Library,
  Printer,
  ReceiptText,
  School,
  Wallet,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";
import type { FeeChallan } from "@/types";
import type { FeeFineRecord, FeeRevisionRecord } from "@/lib/mock/finance";
import { resolveMatchingTier, calculatePreviousMonthDues, getStudentRollNo, getChallanCollectionDate } from "@/lib/mock/finance-storage";

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

function Charge({
  label,
  amount,
  icon: Icon,
  description,
}: {
  label: string;
  amount: number;
  icon: typeof Wallet;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-2 py-2.5 transition-colors hover:bg-muted/40 rounded-lg">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand">
          <Icon className="size-4 shrink-0" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{label}</p>
          {description && <p className="truncate text-[11px] text-muted-foreground">{description}</p>}
        </div>
      </div>
      <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-foreground">
        {formatCurrency(amount)}
      </span>
    </div>
  );
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
  const tier = challan ? resolveMatchingTier(challan.className, feeTiers) : undefined;
  const priorInfo = challan ? calculatePreviousMonthDues(challan, allChallans) : { total: 0, count: 0, details: "", months: [], priorChallans: [], isClear: true };
  const previousDues = challan?.previousDues !== undefined && challan.previousDues > 0
    ? challan.previousDues
    : (priorInfo.total ?? 0);

  // Extract individual charge heads from the challan custom override or class configuration
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

  const hasItemizedBreakdown = Boolean(
    tier ||
    challan?.tuitionFee !== undefined ||
    challan?.labCharges !== undefined ||
    challan?.sportsCharges !== undefined ||
    challan?.transportCharges !== undefined ||
    challan?.fineCharges !== undefined
  );

  const scholarshipConcession = challan?.scholarshipConcession ?? 0;
  const scholarshipPercent = challan?.scholarshipPercent;
  const scholarshipName = challan?.scholarshipName ?? "Scholarship / Concession";
  const scholarshipAwardNo = challan?.scholarshipAwardNo;

  // Exact calculated gross sum of all fee heads
  const grossChargesTotal = hasItemizedBreakdown
    ? tuitionFee + labCharges + sportsCharges + transportCharges + fineCharges + libraryFund + utilitySurcharge + otherCharges + customHeadsSum
    : (challan?.totalPayable ?? 0) + scholarshipConcession;

  // Net calculated charges after subtracting scholarship concession
  const calculatedChargesTotal = Math.max(0, grossChargesTotal - scholarshipConcession);

  // Additional adjustments if the challan total includes manual supplemental charges
  const additionalAdjustments =
    tier && challan && challan.totalPayable > (calculatedChargesTotal + previousDues)
      ? challan.totalPayable - (calculatedChargesTotal + previousDues)
      : 0;

  // Amount due is the calculated net sum of all fee heads (+ any adjustments)
  const amountDue = calculatedChargesTotal + additionalAdjustments;

  // Total count of configured fee heads
  const headCount =
    (tuitionFee > 0 ? 1 : 0) +
    (labCharges > 0 ? 1 : 0) +
    (sportsCharges > 0 ? 1 : 0) +
    (transportCharges > 0 ? 1 : 0) +
    (fineCharges > 0 ? 1 : 0) +
    (libraryFund > 0 ? 1 : 0) +
    (utilitySurcharge > 0 ? 1 : 0) +
    (otherCharges > 0 ? 1 : 0) +
    customHeads.length;

  // Fine records matching the student
  const studentFines = challan
    ? fines.filter((fine) => fine.student.trim().toLowerCase() === challan.student.trim().toLowerCase())
    : [];
  const unpaidFineTotal = studentFines
    .filter((fine) => fine.status === "Unpaid")
    .reduce((sum, fine) => sum + fine.amount, 0);

  // Avoid double-counting if fineCharges is already itemized on the challan
  const unattachedFines = Math.max(0, unpaidFineTotal - fineCharges);
  // Total payable including any unpaid institutional fines and previous months dues
  const totalPayableWithFines = amountDue + previousDues + unattachedFines;

  // Effective payment calculation
  const effectivePaid = challan
    ? Math.min(
        totalPayableWithFines,
        challan.status === "Paid" && challan.paid < (amountDue + previousDues)
          ? (amountDue + previousDues)
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
        : "Cash Counter (Designated)");

  const paymentsList = challan?.payments && challan.payments.length > 0
    ? challan.payments
    : effectivePaid > 0
      ? [{
          id: "pay-rec-1",
          receiptNumber: challan?.lastReceiptNumber || `RCP-${challan?.challanNumber.slice(-6)}`,
          paymentDate: collectionDate || challan?.collectDate || challan?.lastPaymentDate || challan?.dueDate || "",
          paymentMethod: challan?.lastPaymentMethod || "Cash Counter",
          amount: challan?.lastPaymentAmount || effectivePaid,
        }]
      : [];

  return (
    <Dialog open={Boolean(challan)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        {challan && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>Fee Challan Details</span>
                <span className="inline-flex items-center justify-center rounded-md border border-brand/15 bg-brand-50/50 px-2 py-0.5 font-mono text-xs font-bold tracking-tight text-[#091d3e]">
                  {challan.challanNumber}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              {/* Student Overview Header */}
              <section className="rounded-xl border bg-muted/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-heading text-base font-bold text-foreground">{challan.student}</p>
                    <div className="mt-1 flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                      <span className="inline-flex items-center rounded-md border border-brand/20 bg-brand-50/60 px-2 py-0.5 font-mono text-xs font-bold text-[#091d3e]">
                        {getStudentRollNo(challan)}
                      </span>
                      <span>•</span>
                      <span>{challan.className}</span>
                      <span>•</span>
                      <span>{challan.campus} Campus</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center justify-center rounded-md border border-brand/15 bg-brand-50/50 px-2.5 py-1 font-mono text-xs font-bold tracking-tight text-[#091d3e]">
                        {challan.challanNumber}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-brand/20 bg-brand-50/70 px-2.5 py-1 text-xs font-semibold text-[#091d3e]">
                        <Wallet className="size-3 text-brand" />
                        <span>Channel:</span>
                        <span className="font-bold">{paymentChannel}</span>
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={challan.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 text-xs sm:grid-cols-3 lg:grid-cols-6">
                  <div>
                    <p className="text-muted-foreground">Billing period</p>
                    <p className="mt-1 font-semibold text-foreground">{challan.monthYear}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due date</p>
                    <p className="mt-1 font-semibold text-foreground">{formatDate(challan.dueDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Collect date</p>
                    <p className="mt-1 font-semibold text-foreground">
                      {collectionDate ? formatDate(collectionDate) : (challan.status === "Unpaid" ? "Pending" : "—")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment channel</p>
                    <p className="mt-1 font-semibold text-foreground flex items-center gap-1.5">
                      <span className={`inline-block h-2 w-2 rounded-full ${effectivePaid > 0 || challan.status === "Paid" ? "bg-emerald-500" : "bg-amber-500"}`} />
                      <span>{paymentChannel}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Previous dues</p>
                    <p className={`mt-1 font-semibold ${previousDues > 0 ? "text-amber-800 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"}`}>
                      {previousDues > 0 ? `${formatCurrency(previousDues)} (${priorInfo.count} ${priorInfo.count === 1 ? "month" : "months"})` : "Rs 0 (Nil / Clear)"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount due</p>
                    <p className="mt-1 font-mono font-bold text-foreground">
                      {formatCurrency(remainingBalance)}
                    </p>
                  </div>
                </div>
              </section>

              {/* Itemized Fee Breakdown Section */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">Current Month Fee Breakdown</h3>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-semibold text-brand">
                    {tier ? `Session ${tier.academicYear}` : "Itemized charges"}
                  </span>
                </div>

                <div className="overflow-hidden rounded-xl border bg-card">
                  <div className="divide-y px-3 py-1">
                    {hasItemizedBreakdown ? (
                      <>
                        <Charge
                          label="Tuition fee"
                          amount={tuitionFee}
                          icon={School}
                          description="Core academic instruction fee"
                        />
                        {labCharges > 0 && (
                          <Charge
                            label="Lab charges"
                            amount={labCharges}
                            icon={FlaskConical}
                            description="Science & computer laboratories"
                          />
                        )}
                        {sportsCharges > 0 && (
                          <Charge
                            label="Sports & activities"
                            amount={sportsCharges}
                            icon={Dumbbell}
                            description="Sports facilities, equipment & activities"
                          />
                        )}
                        {transportCharges > 0 && (
                          <Charge
                            label="Transport charges"
                            amount={transportCharges}
                            icon={Bus}
                            description="School bus & route transport service"
                          />
                        )}
                        {fineCharges > 0 && (
                          <Charge
                            label="Fine charges / Late fee"
                            amount={fineCharges}
                            icon={AlertCircle}
                            description="Institutional fines or late fee surcharge"
                          />
                        )}
                        {libraryFund > 0 && (
                          <Charge
                            label="Library fund"
                            amount={libraryFund}
                            icon={Library}
                            description="Library books & digital catalog access"
                          />
                        )}
                        {utilitySurcharge > 0 && (
                          <Charge
                            label="Utilities & maintenance"
                            amount={utilitySurcharge}
                            icon={Wallet}
                            description="Campus electricity, facilities & amenities"
                          />
                        )}
                        {otherCharges > 0 && (
                          <Charge
                            label="Other charges"
                            amount={otherCharges}
                            icon={Coins}
                            description="General campus & miscellaneous charges"
                          />
                        )}
                        {customHeads.map((head) => (
                          <Charge
                            key={head.id}
                            label={head.name}
                            amount={head.amount}
                            icon={ReceiptText}
                            description="Custom configured fee head"
                          />
                        ))}
                        {scholarshipConcession > 0 && (
                          <div className="flex items-center justify-between rounded-lg border border-purple-200/90 bg-purple-50/70 p-3 my-1.5 dark:border-purple-800 dark:bg-purple-950/30">
                            <div className="flex items-center gap-2.5">
                              <span className="grid size-7 place-items-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                                <Award className="size-4" />
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-purple-950 dark:text-purple-200 sm:text-sm">
                                    Scholarship Concession ({scholarshipName})
                                  </span>
                                  {scholarshipPercent && (
                                    <span className="rounded bg-purple-200/80 px-1.5 py-0.5 text-[10px] font-bold text-purple-900 dark:bg-purple-900/80 dark:text-purple-200">
                                      {scholarshipPercent}% Concession
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-purple-700/90 dark:text-purple-300">
                                  Official fee subsidy deducted from student tuition
                                </p>
                              </div>
                            </div>
                            <span className="font-mono text-sm font-bold tabular-nums text-purple-800 dark:text-purple-300 sm:text-base">
                              −{formatCurrency(scholarshipConcession)}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <Charge
                          label="Fee amount (itemized configuration not found)"
                          amount={calculatedChargesTotal}
                          icon={Wallet}
                        />
                        <p className="py-2.5 text-xs leading-relaxed text-muted-foreground">
                          Showing the total fee payable for this challan.
                        </p>
                      </>
                    )}

                    {additionalAdjustments > 0 && (
                      <Charge
                        label="Additional challan charges / adjustments"
                        amount={additionalAdjustments}
                        icon={ReceiptText}
                        description="Supplemental adjustment applied to this challan"
                      />
                    )}
                  </div>

                  {/* Calculated Subtotal Bar inside Breakdown */}
                  <div className="flex items-center justify-between gap-3 border-t-2 border-brand/15 bg-brand-50/40 px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <Calculator className="size-4 text-brand" />
                      <span className="text-xs font-bold text-foreground sm:text-sm">
                        Total calculated fee charges {scholarshipConcession > 0 ? `(after ${scholarshipPercent}% scholarship)` : ""}
                      </span>
                      <span className="hidden rounded bg-brand-100/70 px-1.5 py-0.5 text-[10px] font-semibold text-brand-900 sm:inline-block">
                        {headCount} heads
                      </span>
                    </div>
                    <span className="font-mono text-sm font-bold tabular-nums text-foreground sm:text-base">
                      {formatCurrency(calculatedChargesTotal + additionalAdjustments)}
                    </span>
                  </div>
                </div>
              </section>

              {/* Dedicated Scholarship & Financial Aid Record Section */}
              {scholarshipConcession > 0 && (
                <section className="space-y-2.5 rounded-xl border border-purple-300/80 bg-gradient-to-br from-purple-50/70 via-purple-50/30 to-background p-4 shadow-xs dark:border-purple-800/60 dark:from-purple-950/20">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                        <Award className="size-4 shrink-0" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">
                          Scholarship & Tuition Concession Award
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          Official institutional fee waiver attached to student account
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-100/80 px-2.5 py-0.5 text-[11px] font-bold text-purple-900 dark:border-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
                      {scholarshipAwardNo || "SCH-ACTIVE"} · {scholarshipPercent}% Concession
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-1 text-xs">
                    <div className="rounded-lg border border-purple-100 bg-card p-2.5 shadow-2xs dark:border-purple-900/40">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Scheme Program</span>
                      <p className="font-semibold text-foreground truncate mt-0.5">{scholarshipName}</p>
                    </div>
                    <div className="rounded-lg border border-purple-100 bg-card p-2.5 shadow-2xs dark:border-purple-900/40">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Concession Rate</span>
                      <p className="font-semibold text-purple-700 dark:text-purple-300 font-mono mt-0.5">{scholarshipPercent}% Off</p>
                    </div>
                    <div className="rounded-lg border border-purple-100 bg-card p-2.5 shadow-2xs dark:border-purple-900/40">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Monthly Subsidy</span>
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">−{formatCurrency(scholarshipConcession)}</p>
                    </div>
                    <div className="rounded-lg border border-purple-100 bg-card p-2.5 shadow-2xs dark:border-purple-900/40">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Annual Benefit</span>
                      <p className="font-semibold text-foreground font-mono mt-0.5">{formatCurrency(scholarshipConcession * 12)}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-purple-800/80 dark:text-purple-300/80 flex items-center gap-1.5 pt-0.5">
                    <CheckCircle2 className="size-3.5 shrink-0 text-purple-600" />
                    <span>Concession automatically credited into current billing cycle fee calculation.</span>
                  </p>
                </section>
              )}

              {/* Dedicated Previous Unpaid Months & Arrears Record Section */}
              {previousDues > 0 ? (
                <section className="space-y-2.5 rounded-xl border border-amber-300/80 bg-gradient-to-br from-amber-50/70 via-amber-50/30 to-background p-4 shadow-xs dark:border-amber-800/60 dark:from-amber-950/20">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                        <History className="size-4 shrink-0" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">
                          Previous Unpaid Months & Arrears Record
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          Itemized breakdown of unpaid billing cycles carried forward
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 dark:border-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                      <Clock className="size-3 text-amber-700" />
                      {priorInfo.count} {priorInfo.count === 1 ? "Month" : "Months"} Unpaid
                    </span>
                  </div>

                  {/* Table of Unpaid Months */}
                  <div className="overflow-hidden rounded-lg border border-amber-200/70 bg-card shadow-2xs dark:border-amber-900/40">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-amber-200/60 bg-amber-100/40 text-[11px] font-semibold text-muted-foreground dark:bg-amber-950/30">
                          <tr>
                            <th className="px-3 py-2 font-medium">Unpaid Month</th>
                            <th className="px-3 py-2 font-medium">Challan #</th>
                            <th className="px-3 py-2 font-medium">Due Date</th>
                            <th className="px-3 py-2 text-right font-medium">Billed</th>
                            <th className="px-3 py-2 text-right font-medium">Paid</th>
                            <th className="px-3 py-2 text-right font-medium">Arrears</th>
                            <th className="px-3 py-2 text-center font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {priorInfo.priorChallans.map((item, idx) => (
                            <tr key={item.id || item.challanNumber || idx} className="hover:bg-amber-50/30 dark:hover:bg-amber-950/10">
                              <td className="px-3 py-2.5 font-semibold text-foreground">
                                <div className="flex items-center gap-1.5">
                                  <CalendarDays className="size-3.5 text-amber-600 shrink-0" />
                                  <span>{item.monthYear}</span>
                                </div>
                                {item.notes && (
                                  <p className="mt-0.5 pl-5 text-[10px] text-muted-foreground font-normal">
                                    {item.notes}
                                  </p>
                                )}
                              </td>
                              <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">
                                {item.challanNumber || "—"}
                              </td>
                              <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                                {item.dueDate ? formatDate(item.dueDate) : "—"}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono text-muted-foreground tabular-nums">
                                {formatCurrency(item.billedAmount ?? item.balance)}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                                {formatCurrency(item.paidAmount ?? 0)}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono font-bold text-amber-800 dark:text-amber-400 tabular-nums">
                                +{formatCurrency(item.balance)}
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  item.status === "Overdue"
                                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200"
                                    : item.status === "Partial"
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200"
                                      : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200"
                                }`}>
                                  {item.status || "Unpaid"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="border-t-2 border-amber-200 bg-amber-50/60 font-semibold text-foreground dark:border-amber-900/60 dark:bg-amber-950/30">
                          <tr>
                            <td colSpan={5} className="px-3 py-2 text-xs font-bold text-foreground">
                              Total Carried Forward Arrears ({priorInfo.count} {priorInfo.count === 1 ? "month" : "months"})
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-sm font-bold text-amber-900 dark:text-amber-300 tabular-nums">
                              +{formatCurrency(previousDues)}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 flex items-center gap-1.5 pt-0.5">
                    <AlertCircle className="size-3.5 shrink-0 text-amber-600" />
                    <span>Outstanding dues from the months above are automatically added to the current payable amount.</span>
                  </p>
                </section>
              ) : (
                <section className="flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-200">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                    <CheckCircle2 className="size-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                      Previous Months Dues: Verified Clear (No Arrears)
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      All prior monthly billing cycles have been fully settled. No carried-forward arrears apply to this challan.
                    </p>
                  </div>
                </section>
              )}

              {/* Student Fines Section (if any) */}
              {studentFines.length > 0 && (
                <section className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Institutional Fines ({studentFines.length})
                    </h3>
                    <span className="text-[11px] text-muted-foreground">Matched from Fines module</span>
                  </div>
                  <div className="divide-y rounded-xl border bg-card px-3.5">
                    {studentFines.map((fine) => (
                      <div key={fine.id} className="flex items-center justify-between gap-3 py-2.5">
                        <span className="min-w-0">
                          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <ReceiptText className="size-4 shrink-0 text-amber-600" />
                            {fine.fineType}
                          </span>
                          <span className="mt-0.5 block pl-6 text-[11px] text-muted-foreground">
                            {fine.fineNumber} · {formatDate(fine.imposedDate)} · {fine.status}
                          </span>
                        </span>
                        <span className={`shrink-0 font-mono text-sm font-semibold tabular-nums ${fine.status === "Paid" ? "text-muted-foreground" : "text-amber-700"}`}>
                          {formatCurrency(fine.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Payment Receipts & Transaction Record */}
              {paymentsList.length > 0 && (
                <section className="space-y-2 rounded-xl border border-emerald-300 bg-emerald-50/40 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                        <CreditCard className="size-4" />
                      </span>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                          Payment Receipts & Settlement Record
                        </h3>
                        <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                          Verified transactions deposited toward this challan
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                      <CheckCircle2 className="size-3 text-emerald-700" />
                      {paymentsList.length} {paymentsList.length === 1 ? "Payment" : "Payments"} Recorded
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-emerald-200/70 bg-card shadow-2xs dark:border-emerald-900/40">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-emerald-200/60 bg-emerald-100/40 text-[11px] font-semibold text-muted-foreground dark:bg-emerald-950/30">
                          <tr>
                            <th className="px-3 py-2 font-medium">Receipt / Ref #</th>
                            <th className="px-3 py-2 font-medium">Payment Date</th>
                            <th className="px-3 py-2 font-medium">Payment Mode</th>
                            <th className="px-3 py-2 text-right font-medium">Amount Received</th>
                            <th className="px-3 py-2 text-center font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {paymentsList.map((p, idx) => (
                            <tr key={p.id || idx} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10">
                              <td className="px-3 py-2.5 font-mono text-[11px] font-bold text-foreground">
                                {p.receiptNumber || `RCP-${challan.challanNumber.slice(-6)}`}
                              </td>
                              <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                                {p.paymentDate ? formatDate(p.paymentDate) : "—"}
                              </td>
                              <td className="px-3 py-2.5 text-foreground font-medium">
                                {p.paymentMethod || "Cash Counter"}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                                {formatCurrency(p.amount)}
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-200">
                                  Cleared & Deposited
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="border-t-2 border-emerald-200 bg-emerald-50/60 font-semibold text-foreground dark:border-emerald-900/60 dark:bg-emerald-950/30">
                          <tr>
                            <td colSpan={3} className="px-3 py-2 text-xs font-bold text-foreground">
                              Total Payments Received Toward This Challan
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-sm font-bold text-emerald-800 dark:text-emerald-300 tabular-nums">
                              {formatCurrency(effectivePaid)}
                            </td>
                            <td className="px-3 py-2 text-center text-[10px] text-emerald-700 font-bold">
                              Verified
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </section>
              )}

              {/* Amount Due & Settlement Calculation Summary */}
              <section className="rounded-xl border border-brand/20 bg-gradient-to-br from-brand-50/60 via-background to-brand-50/20 p-4 shadow-sm">
                <div className="space-y-3">
                  {/* Amount Due after Calculation */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-bold text-foreground">Current month charges (Gross)</span>
                    <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                      {formatCurrency(grossChargesTotal)}
                    </span>
                  </div>

                  {scholarshipConcession > 0 && (
                    <div className="flex items-center justify-between gap-4 text-xs sm:text-sm text-purple-800 dark:text-purple-300 bg-purple-50/60 dark:bg-purple-950/20 px-2.5 py-1.5 rounded-lg border border-purple-200/70 dark:border-purple-800/60 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Award className="size-3.5 shrink-0 text-purple-600" />
                        Scholarship concession ({scholarshipName} {scholarshipPercent ? `· ${scholarshipPercent}%` : ""})
                      </span>
                      <span className="font-mono font-bold tabular-nums">−{formatCurrency(scholarshipConcession)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4 border-t border-brand/10 pt-1.5">
                    <span className="text-sm font-bold text-foreground">Net current month due</span>
                    <span className="font-mono text-base font-bold tabular-nums text-brand sm:text-lg">
                      {formatCurrency(amountDue)}
                    </span>
                  </div>

                  {previousDues > 0 ? (
                    <div className="flex items-center justify-between gap-4 text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="size-3.5 shrink-0 text-amber-600" />
                        Previous months remaining dues (Arrears)
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                          {priorInfo.count} {priorInfo.count === 1 ? "month" : "months"}: {priorInfo.months.join(", ")}
                        </span>
                      </span>
                      <span className="font-mono font-semibold tabular-nums">+{formatCurrency(previousDues)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                        Previous months dues
                      </span>
                      <span className="font-medium text-emerald-700">No Arrears (Clear)</span>
                    </div>
                  )}

                  {unpaidFineTotal > 0 && (
                    <div className="flex items-center justify-between gap-4 text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <AlertCircle className="size-3.5 shrink-0 text-amber-600" />
                        Outstanding fines (from Fines module)
                      </span>
                      <span className="font-mono font-semibold tabular-nums">+{formatCurrency(unpaidFineTotal)}</span>
                    </div>
                  )}

                  <div className="border-t border-brand/15 pt-2.5">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="font-semibold text-foreground">Total payable including arrears & fines</span>
                      <span className="font-heading text-base font-bold tabular-nums text-foreground">
                        {formatCurrency(totalPayableWithFines)}
                      </span>
                    </div>
                  </div>

                  {challan.lastPaymentAmount && challan.lastPaymentAmount > 0 && (
                    <div className="flex items-center justify-between gap-4 text-sm text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50/60 dark:bg-emerald-950/30 px-2 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                        Current payment received ({challan.lastPaymentMethod || "Cash Counter"} · {challan.lastReceiptNumber || "RCP"})
                      </span>
                      <span className="font-mono font-bold tabular-nums">−{formatCurrency(challan.lastPaymentAmount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4 text-sm text-emerald-700 dark:text-emerald-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="size-3.5 shrink-0" />
                      Total paid toward challan
                    </span>
                    <span className="font-mono font-semibold tabular-nums">−{formatCurrency(effectivePaid)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-brand/15 pt-2.5 text-sm">
                    <span className="font-bold text-foreground">Remaining balance</span>
                    <span className="flex items-center gap-2">
                      <span className={`font-heading text-base font-bold tabular-nums ${remainingBalance === 0 ? "text-emerald-700 dark:text-emerald-400" : "text-amber-800 dark:text-amber-400"}`}>
                        {formatCurrency(remainingBalance)}
                      </span>
                      {remainingBalance === 0 ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
                          Paid in full
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
                          Balance due
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </section>

              {/* Dialog Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <BookOpen className="size-3.5 shrink-0" />
                  Directly synchronized with Fee Configuration submodule
                </p>
                <div className="flex items-center gap-2">
                  {onProcessPayment && remainingBalance > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="default"
                      onClick={() => {
                        onClose();
                        onProcessPayment(challan);
                      }}
                      className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                    >
                      <CreditCard className="size-3.5" />
                      Receive Payment ({formatCurrency(remainingBalance)})
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
                      Print statement
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
                    variant="default"
                    onClick={onClose}
                    className="text-xs"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
