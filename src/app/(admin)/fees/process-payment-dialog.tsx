"use client";

import * as React from "react";
import {
  AlertCircle,
  AlertTriangle,
  Banknote,
  BookOpen,
  Building2,
  Calculator,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  DollarSign,
  Dumbbell,
  FlaskConical,
  GraduationCap,
  History,
  Library,
  ReceiptText,
  School,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import type { FeeChallan, FeeStatus } from "@/types";
import type { FeeFineRecord, FeeRevisionRecord } from "@/lib/mock/finance";
import { resolveMatchingTier, calculatePreviousMonthDues, getStudentRollNo } from "@/lib/mock/finance-storage";

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
    /** The canonical total payable computed by the dialog (currentMonthCharges + previousDues + unpaidFines + lateFee).
     *  Passed so the handler can synchronise challan.totalPayable with what the user actually saw. */
    canonicalTotalPayable?: number
  ) => void;
  fines?: FeeFineRecord[];
  feeTiers?: FeeRevisionRecord[];
  allChallans?: FeeChallan[];
}

interface LateFeeConfig {
  gracePeriodDays: number;
  dailyRate: number;
  maxLateFee: number;
  minLateFee: number;
}

// Late fee policy configuration
const LATE_FEE_CONFIG: LateFeeConfig = {
  gracePeriodDays: 0,
  dailyRate: 50, // Rs. 50 per day
  maxLateFee: 5000,
  minLateFee: 50,
};

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
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand dark:bg-brand-950/50 dark:text-brand-300">
          <Icon className="size-4 shrink-0" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{label}</p>
          {description && <p className="truncate text-[11px] text-muted-foreground">{description}</p>}
        </div>
      </div>
      <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-foreground">
        {formatCurrency(Math.round(amount))}
      </span>
    </div>
  );
}

/**
 * Calculate late fee surcharge based on overdue days
 */
function calculateLateFee(
  dueDate: string,
  paymentDate: string,
  config: LateFeeConfig = LATE_FEE_CONFIG
): { lateFee: number; daysOverdue: number; isOverdue: boolean } {
  if (!dueDate || !paymentDate) {
    return { lateFee: 0, daysOverdue: 0, isOverdue: false };
  }

  const due = new Date(dueDate);
  const payment = new Date(paymentDate);

  due.setHours(0, 0, 0, 0);
  payment.setHours(0, 0, 0, 0);

  const diffTime = payment.getTime() - due.getTime();
  const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (daysOverdue <= config.gracePeriodDays) {
    return { lateFee: 0, daysOverdue: 0, isOverdue: false };
  }

  const chargeableDays = daysOverdue - config.gracePeriodDays;
  let lateFee = chargeableDays * config.dailyRate;

  if (lateFee > 0) {
    lateFee = Math.max(config.minLateFee, lateFee);
    lateFee = Math.min(config.maxLateFee, lateFee);
  }

  return { lateFee: Math.round(lateFee), daysOverdue, isOverdue: true };
}

/**
 * Derive payment status after payment is applied
 */
function derivePaymentStatus(totalPayable: number, totalPaid: number): FeeStatus {
  if (totalPaid >= totalPayable) return "Paid";
  if (totalPaid > 0) return "Partial";
  return "Unpaid";
}

export function ProcessPaymentDialog({
  open,
  onOpenChange,
  challan,
  onProcessPayment,
  fines = [],
  feeTiers = [],
  allChallans = [],
}: ProcessPaymentDialogProps) {
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentDate, setPaymentDate] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("Cash");
  const [referenceNumber, setReferenceNumber] = React.useState("");
  const [manualLateFee, setManualLateFee] = React.useState("");
  const [useManualLateFee, setUseManualLateFee] = React.useState(false);
  const [waivedReason, setWaivedReason] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Match class fee configuration tier
  const tier = React.useMemo(() => {
    return challan ? resolveMatchingTier(challan.className, feeTiers) : undefined;
  }, [challan, feeTiers]);

  // Calculate carried-forward previous months arrears
  const priorInfo = React.useMemo(() => {
    return challan
      ? calculatePreviousMonthDues(challan, allChallans)
      : { total: 0, count: 0, details: "", months: [], priorChallans: [], isClear: true };
  }, [challan, allChallans]);

  const previousDues = Math.round(
    challan?.previousDues !== undefined && challan.previousDues > 0
      ? challan.previousDues
      : (priorInfo.total ?? 0)
  );

  // Extract individual charge heads from the challan custom override or class configuration
  const tuitionFee = Math.round(challan?.tuitionFee ?? tier?.tuitionFee ?? 0);
  const labCharges = Math.round(challan?.labCharges ?? tier?.labCharges ?? 0);
  const sportsCharges = Math.round(challan?.sportsCharges ?? tier?.sportsCharges ?? 0);
  const libraryFund = Math.round(challan?.libraryFund ?? tier?.libraryFund ?? 0);
  const utilitySurcharge = Math.round(challan?.utilitySurcharge ?? tier?.utilitySurcharge ?? 0);
  const otherCharges = Math.round(challan?.otherCharges ?? tier?.otherCharges ?? 0);
  const customHeads = challan?.customHeads ?? tier?.customHeads ?? [];
  const customHeadsSum = customHeads.reduce((s, h) => s + (Math.round(Number(h.amount)) || 0), 0);

  // Calculated sum of all monthly fee heads
  const calculatedChargesTotal =
    tier || challan?.tuitionFee !== undefined
      ? tuitionFee + labCharges + sportsCharges + libraryFund + utilitySurcharge + otherCharges + customHeadsSum
      : Math.round(challan?.totalPayable ?? 0);

  // Supplemental adjustment if total payable exceeds heads + arrears
  const additionalAdjustments =
    tier && challan && challan.totalPayable > (calculatedChargesTotal + previousDues)
      ? Math.round(challan.totalPayable - (calculatedChargesTotal + previousDues))
      : 0;

  const currentMonthCharges = calculatedChargesTotal + additionalAdjustments;
  const headCount = (tier ? 5 : 1) + (otherCharges > 0 ? 1 : 0) + customHeads.length;

  // Student institutional fines matching
  const studentFines = React.useMemo(() => {
    if (!challan || !fines) return [];
    const name = challan.student.trim().toLowerCase();
    return fines.filter(
      (fine) => fine.student.trim().toLowerCase() === name
    );
  }, [challan, fines]);

  const unpaidFineTotal = React.useMemo(() => {
    return studentFines
      .filter((fine) => fine.status === "Unpaid")
      .reduce((sum, fine) => sum + Math.round(fine.amount), 0);
  }, [studentFines]);

  const hasExplicitLateFee = React.useMemo(() => {
    return studentFines.some(
      (fine) => fine.status === "Unpaid" && fine.fineType.toLowerCase().includes("late fee")
    );
  }, [studentFines]);

  // Calculate automatic late fee from payment date vs due date
  const { lateFee: autoLateFee, daysOverdue, isOverdue } = calculateLateFee(
    challan?.dueDate ?? "",
    paymentDate
  );

  // If student already has an explicit late fee in Fines module, avoid duplicate automatic surcharge
  const effectiveAutoLateFee = hasExplicitLateFee ? 0 : autoLateFee;

  const effectiveLateFee = useManualLateFee
    ? Math.round(Number(manualLateFee) || 0)
    : effectiveAutoLateFee;

  // Base total payable across Current Month + Arrears + Fines.
  // MUST use currentMonthCharges (= calculatedChargesTotal + additionalAdjustments)
  // so that any supplemental challan adjustment is included in the payable total,
  // matching exactly the "Current month charges" figure shown in the breakdown above.
  const baseTotalPayable = Math.round(currentMonthCharges + previousDues + unpaidFineTotal);
  
  // Total payable including any dynamically calculated or adjusted late fee
  const totalPayableWithLateFee = Math.round(baseTotalPayable + effectiveLateFee);

  // Prior amount already paid
  const priorPaid = Math.round(challan?.paid ?? 0);

  // Remaining balance before this new payment
  const remainingBeforeThisPayment = Math.max(0, Math.round(totalPayableWithLateFee - priorPaid));

  // Numeric payment entered now
  const paymentAmt = Math.round(Number(paymentAmount) || 0);

  // Validation flags
  const isExcessAmount = paymentAmt > remainingBeforeThisPayment;
  const excessDifference = Math.max(0, paymentAmt - remainingBeforeThisPayment);

  // Resulting payment & balance after this transaction
  const totalPaidAfterPayment = priorPaid + (isExcessAmount ? remainingBeforeThisPayment : paymentAmt);
  const finalBalance = Math.max(0, Math.round(totalPayableWithLateFee - (priorPaid + paymentAmt)));
  const finalStatus = derivePaymentStatus(totalPayableWithLateFee, priorPaid + paymentAmt);

  // Initialize dialog state when opened
  React.useEffect(() => {
    if (open && challan) {
      const today = new Date().toISOString().split("T")[0];
      setPaymentDate(today);

      // Start with empty input as explicitly requested so users can type fresh payment without pre-filled values
      setPaymentAmount("");

      setPaymentMethod("Cash");
      setReferenceNumber(`RCP-${challan.challanNumber.slice(-6)}`);
      setManualLateFee("");
      setUseManualLateFee(false);
      setWaivedReason("");
      setError(null);
      setIsSubmitting(false);
    }
  }, [open, challan]);

  if (!challan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);

    if (!paymentDate) {
      return setError("Payment date is required.");
    }

    if (paymentAmt <= 0) {
      return setError("Payment amount must be greater than zero.");
    }

    if (paymentAmt > remainingBeforeThisPayment) {
      return setError(
        `Payment amount (${formatCurrency(paymentAmt)}) cannot exceed the maximum payable balance of ${formatCurrency(remainingBeforeThisPayment)}.`
      );
    }

    if (useManualLateFee && effectiveLateFee !== effectiveAutoLateFee && !waivedReason.trim()) {
      return setError("Please provide a reason for the manual late fee adjustment or waiver.");
    }

    setIsSubmitting(true);
    onProcessPayment(
      challan.id,
      paymentAmt,
      effectiveLateFee,
      paymentDate,
      paymentMethod,
      referenceNumber || `RCP-${challan.challanNumber.slice(-6)}`,
      totalPayableWithLateFee
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="grid size-7 place-items-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <CreditCard className="size-4" />
            </span>
            <span>Process Fee Payment</span>
            <span className="inline-flex items-center justify-center rounded-md border border-brand/15 bg-brand-50/50 px-2 py-0.5 font-mono text-xs font-bold tracking-tight text-[#091d3e]">
              {challan.challanNumber}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-1" noValidate>
          {/* ─── 1. Student Overview Header ─── */}
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
                <div className="mt-1.5">
                  <span className="inline-flex items-center justify-center rounded-md border border-brand/15 bg-brand-50/50 px-2.5 py-1 font-mono text-xs font-bold tracking-tight text-[#091d3e]">
                    {challan.challanNumber}
                  </span>
                </div>
              </div>
              <StatusBadge status={challan.status} />
            </div>

            <div className="mt-3.5 grid grid-cols-2 gap-3 border-t pt-3 text-xs sm:grid-cols-4">
              <div>
                <p className="text-muted-foreground">Billing period</p>
                <p className="mt-1 font-semibold text-foreground">{challan.monthYear}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Due date</p>
                <p className="mt-1 font-semibold text-foreground">{formatDate(challan.dueDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Previous dues</p>
                <p className={`mt-1 font-semibold ${previousDues > 0 ? "text-amber-800 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"}`}>
                  {previousDues > 0
                    ? `${formatCurrency(previousDues)} (${priorInfo.count} ${priorInfo.count === 1 ? "month" : "months"})`
                    : "Rs 0 (Nil / Clear)"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount due</p>
                <p className="mt-1 font-mono font-bold text-foreground">
                  {formatCurrency(remainingBeforeThisPayment)}
                </p>
              </div>
            </div>
          </section>

          {/* ─── 2. Current Month Itemized Fee Breakdown ─── */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Current Month Fee Breakdown</h3>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-semibold text-brand dark:bg-brand-950/50 dark:text-brand-300">
                {tier ? `Session ${tier.academicYear}` : "Standard charges"}
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border bg-card">
              <div className="divide-y px-3 py-1">
                {tier ? (
                  <>
                    <Charge
                      label="Tuition fee"
                      amount={tuitionFee}
                      icon={School}
                      description="Core academic instruction fee"
                    />
                    <Charge
                      label="Lab charges"
                      amount={labCharges}
                      icon={FlaskConical}
                      description="Science & computer laboratories"
                    />
                    <Charge
                      label="Sports & activities"
                      amount={sportsCharges}
                      icon={Dumbbell}
                      description="Sports facilities, equipment & activities"
                    />
                    <Charge
                      label="Library fund"
                      amount={libraryFund}
                      icon={Library}
                      description="Library books & digital catalog access"
                    />
                    <Charge
                      label="Utilities & maintenance"
                      amount={utilitySurcharge}
                      icon={Wallet}
                      description="Campus electricity, facilities & amenities"
                    />
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
                        amount={Number(head.amount) || 0}
                        icon={ReceiptText}
                        description="Custom configured fee head"
                      />
                    ))}
                  </>
                ) : (
                  <>
                    <Charge
                      label="Fee charges (standard configuration)"
                      amount={calculatedChargesTotal}
                      icon={Wallet}
                    />
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

              {/* Total Calculated Fee Charges Bar */}
              <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-2.5">
                <span className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Calculator className="size-4 text-brand" />
                  Total calculated fee charges
                  <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-900 dark:bg-brand-900/60 dark:text-brand-200">
                    {headCount} {headCount === 1 ? "head" : "heads"}
                  </span>
                </span>
                <span className="font-mono text-sm font-bold tabular-nums text-foreground">
                  {formatCurrency(currentMonthCharges)}
                </span>
              </div>
            </div>
          </section>

          {/* ─── 3. Previous Unpaid Months & Arrears Record ─── */}
          {previousDues > 0 && priorInfo.priorChallans && priorInfo.priorChallans.length > 0 ? (
            <section className="space-y-2 rounded-xl border border-amber-300 bg-amber-50/40 p-3.5 dark:border-amber-900/60 dark:bg-amber-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    <History className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                      Previous Unpaid Months & Arrears Record
                    </h3>
                    <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
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
                          <td className="px-3 py-2 font-semibold text-foreground">
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
                          <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                            {item.challanNumber || "—"}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                            {item.dueDate ? formatDate(item.dueDate) : "—"}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-muted-foreground tabular-nums">
                            {formatCurrency(Math.round(item.billedAmount ?? item.balance))}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                            {formatCurrency(Math.round(item.paidAmount ?? 0))}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-amber-800 dark:text-amber-400 tabular-nums">
                            +{formatCurrency(Math.round(item.balance))}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                item.status === "Overdue"
                                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200"
                                  : item.status === "Partial"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200"
                                    : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200"
                              }`}
                            >
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

          {/* ─── 4. Student Institutional Fines Section ─── */}
          {studentFines.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Institutional Fines ({studentFines.length})
                </h3>
                <span className="text-[11px] text-muted-foreground">Matched from Fines submodule</span>
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
                    <span
                      className={`shrink-0 font-mono text-sm font-semibold tabular-nums ${
                        fine.status === "Paid" ? "text-muted-foreground" : "text-amber-700 font-bold"
                      }`}
                    >
                      {formatCurrency(Math.round(fine.amount))}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ─── 5. Record Payment & Transaction Details ─── */}
          <section className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b pb-3">
              <span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-brand dark:bg-brand-950 dark:text-brand-300">
                <CreditCard className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-foreground">Record Payment Details</h3>
                <p className="text-xs text-muted-foreground">
                  Specify received payment amount, transaction mode and deposit date
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Payment Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="Cash">Cash (Campus Counter)</option>
                  <option value="Bank Transfer">Bank Transfer (1Link / IBFT)</option>
                  <option value="Online Portal">Online Portal / Card</option>
                  <option value="Cheque / Pay Order">Cheque / Pay Order</option>
                  <option value="POS Counter">POS Card Terminal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Receipt / Ref #
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. RCP-004812"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            {/* Payment Amount Input & Quick Fill Presets */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Amount Received (Rs) <span className="text-danger">*</span>
                </label>
                <span className="text-[11px] font-medium text-muted-foreground">
                  Max Payable: <span className="font-bold text-foreground">{formatCurrency(remainingBeforeThisPayment)}</span>
                </span>
              </div>

              <div
                className={cn(
                  "flex h-10 w-full items-center rounded-lg border bg-background shadow-xs transition-all focus-within:ring-2",
                  isExcessAmount
                    ? "border-rose-500 bg-rose-50/20 focus-within:ring-rose-500/30"
                    : "border-input focus-within:border-brand focus-within:ring-brand/20"
                )}
              >
                <span className="flex h-full select-none items-center rounded-l-lg border-r border-border/80 bg-muted/40 px-3.5 text-xs font-bold text-muted-foreground/90">
                  Rs
                </span>
                <input
                  type="number"
                  min="1"
                  max={remainingBeforeThisPayment}
                  step="1"
                  value={paymentAmount}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setPaymentAmount(raw);
                    const val = Number(raw) || 0;
                    if (val > remainingBeforeThisPayment) {
                      setError(
                        `Amount (${formatCurrency(val)}) cannot exceed total payable balance of ${formatCurrency(remainingBeforeThisPayment)}.`
                      );
                    } else {
                      setError(null);
                    }
                  }}
                  placeholder="Enter the amount"
                  className="h-full w-full rounded-r-lg bg-transparent px-3.5 text-sm font-semibold tabular-nums text-foreground placeholder:text-xs placeholder:font-normal placeholder:text-muted-foreground focus:outline-none"
                  required
                />
              </div>

              {/* Excess Amount Warning Banner */}
              {isExcessAmount && (
                <div className="mt-2.5 flex items-start justify-between gap-2.5 rounded-lg border border-rose-300 bg-rose-50 p-2.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">
                        Amount exceeds total payable balance!
                      </p>
                      <p className="text-[11px] text-rose-700 dark:text-rose-300">
                        You entered {formatCurrency(paymentAmt)}, which is {formatCurrency(excessDifference)} more than the total balance of {formatCurrency(remainingBeforeThisPayment)}.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPaymentAmount(String(remainingBeforeThisPayment));
                      setError(null);
                    }}
                    className="h-6 text-[11px] font-bold border-rose-300 bg-rose-100/70 text-rose-900 hover:bg-rose-200 dark:border-rose-800 dark:bg-rose-900/60 dark:text-rose-100 shrink-0 cursor-pointer"
                  >
                    Set to Max ({formatCurrency(remainingBeforeThisPayment)})
                  </Button>
                </div>
              )}

              {/* Quick Preset Buttons (only valid amounts shown) */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {remainingBeforeThisPayment > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPaymentAmount(String(remainingBeforeThisPayment));
                      setError(null);
                    }}
                    className="h-7 text-[11px] font-semibold border-brand/30 hover:bg-brand-50 hover:text-brand"
                  >
                    Pay Full Balance ({formatCurrency(remainingBeforeThisPayment)})
                  </Button>
                )}

                {currentMonthCharges > 0 && currentMonthCharges < remainingBeforeThisPayment && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPaymentAmount(String(currentMonthCharges));
                      setError(null);
                    }}
                    className="h-7 text-[11px] font-medium"
                  >
                    Current Month ({formatCurrency(currentMonthCharges)})
                  </Button>
                )}

                {previousDues > 0 && previousDues <= remainingBeforeThisPayment && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPaymentAmount(String(previousDues));
                      setError(null);
                    }}
                    className="h-7 text-[11px] font-medium text-amber-800 border-amber-300 hover:bg-amber-50"
                  >
                    Arrears Only ({formatCurrency(previousDues)})
                  </Button>
                )}

                {remainingBeforeThisPayment >= 1000 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPaymentAmount(String(Math.round(remainingBeforeThisPayment / 2)));
                      setError(null);
                    }}
                    className="h-7 text-[11px] font-medium text-muted-foreground"
                  >
                    50% Installment ({formatCurrency(Math.round(remainingBeforeThisPayment / 2))})
                  </Button>
                )}
              </div>
            </div>

            {/* Overdue Late Surcharge Section */}
            {isOverdue && !hasExplicitLateFee && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs dark:border-amber-900/60 dark:bg-amber-950/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-amber-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-900 dark:text-amber-200">
                        Overdue Surcharge Applicable ({daysOverdue} days overdue)
                      </p>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300">
                        Due: {formatDate(challan.dueDate)} · Daily rate: Rs {LATE_FEE_CONFIG.dailyRate}/day
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-amber-900 dark:text-amber-200 tabular-nums">
                    +{formatCurrency(autoLateFee)}
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-amber-200/60 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[11px] font-medium text-amber-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useManualLateFee}
                      onChange={(e) => setUseManualLateFee(e.target.checked)}
                      className="rounded border-amber-300"
                    />
                    <span>Adjust or Waive Late Surcharge</span>
                  </label>
                  {useManualLateFee && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">Override Rs:</span>
                      <input
                        type="number"
                        min="0"
                        value={manualLateFee}
                        onChange={(e) => setManualLateFee(e.target.value)}
                        placeholder="0"
                        className="w-24 rounded border border-input bg-background px-2 py-1 text-xs font-mono font-semibold"
                      />
                    </div>
                  )}
                </div>

                {useManualLateFee && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Reason for late surcharge adjustment/waiver (required)..."
                      value={waivedReason}
                      onChange={(e) => setWaivedReason(e.target.value)}
                      className="w-full rounded border border-input bg-background px-2.5 py-1.5 text-xs text-foreground"
                    />
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ─── 6. Live Settlement & Real-time Balance Breakdown ─── */}
          <section className="rounded-xl border border-brand/20 bg-gradient-to-br from-brand-50/60 via-background to-brand-50/20 p-4 shadow-sm">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs sm:text-sm font-bold text-foreground">Current month charges</span>
                <span className="font-mono text-sm sm:text-base font-bold tabular-nums text-foreground">
                  {formatCurrency(currentMonthCharges)}
                </span>
              </div>

              {previousDues > 0 && (
                <div className="flex items-center justify-between gap-4 text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="size-3.5 shrink-0 text-amber-600" />
                    Previous months remaining dues (Arrears)
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                      {priorInfo.count} {priorInfo.count === 1 ? "month" : "months"}
                    </span>
                  </span>
                  <span className="font-mono font-semibold tabular-nums">+{formatCurrency(previousDues)}</span>
                </div>
              )}

              {unpaidFineTotal > 0 && (
                <div className="flex items-center justify-between gap-4 text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <AlertCircle className="size-3.5 shrink-0 text-amber-600" />
                    Outstanding fines (Fines module)
                  </span>
                  <span className="font-mono font-semibold tabular-nums">+{formatCurrency(unpaidFineTotal)}</span>
                </div>
              )}

              {effectiveLateFee > 0 && (
                <div className="flex items-center justify-between gap-4 text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="size-3.5 shrink-0 text-amber-600" />
                    Late fee surcharge
                    {useManualLateFee && <span className="text-[10px] text-muted-foreground">(Manual)</span>}
                  </span>
                  <span className="font-mono font-semibold tabular-nums">+{formatCurrency(effectiveLateFee)}</span>
                </div>
              )}

              <div className="border-t border-brand/15 pt-2">
                <div className="flex items-center justify-between gap-4 text-xs sm:text-sm">
                  <span className="font-semibold text-foreground">Total payable including arrears & fines</span>
                  <span className="font-mono text-sm sm:text-base font-bold tabular-nums text-foreground">
                    {formatCurrency(totalPayableWithLateFee)}
                  </span>
                </div>
              </div>

              {priorPaid > 0 && (
                <div className="flex items-center justify-between gap-4 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 shrink-0 text-muted-foreground" />
                    Paid previously toward challan
                  </span>
                  <span className="font-mono font-semibold tabular-nums">−{formatCurrency(priorPaid)}</span>
                </div>
              )}

              {/* Dynamic Payment Being Received Now */}
              <div
                className={cn(
                  "flex items-center justify-between gap-4 text-xs sm:text-sm font-bold px-2.5 py-2 rounded-lg border",
                  isExcessAmount
                    ? "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-300"
                    : paymentAmt > 0
                      ? "bg-emerald-50/70 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-300"
                      : "bg-muted/40 text-muted-foreground border-border"
                )}
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2
                    className={cn(
                      "size-4 shrink-0",
                      isExcessAmount ? "text-rose-600" : paymentAmt > 0 ? "text-emerald-600" : "text-muted-foreground"
                    )}
                  />
                  {paymentAmt > 0
                    ? `Payment receiving now (${paymentMethod})`
                    : "No payment amount entered yet"}
                </span>
                <span className="font-mono text-sm sm:text-base tabular-nums">
                  {isExcessAmount ? (
                    <span className="text-rose-600 dark:text-rose-400">
                      −{formatCurrency(paymentAmt)} (Exceeds Due!)
                    </span>
                  ) : paymentAmt > 0 ? (
                    <span>−{formatCurrency(paymentAmt)}</span>
                  ) : (
                    <span>Rs 0</span>
                  )}
                </span>
              </div>

              {/* Dynamic Resulting Remaining Balance */}
              <div className="flex items-center justify-between gap-4 border-t border-brand/15 pt-2.5 text-sm">
                <span className="font-bold text-foreground">Remaining balance after payment</span>
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-heading text-base sm:text-lg font-bold tabular-nums",
                      isExcessAmount
                        ? "text-rose-700 dark:text-rose-400"
                        : finalBalance === 0 && paymentAmt > 0
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-amber-800 dark:text-amber-400"
                    )}
                  >
                    {isExcessAmount ? (
                      <span>Rs 0 (Overpayment: +{formatCurrency(excessDifference)})</span>
                    ) : (
                      formatCurrency(finalBalance)
                    )}
                  </span>
                  {!isExcessAmount && (
                    finalBalance === 0 && paymentAmt > 0 ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
                        Paid in full
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
                        Balance due
                      </span>
                    )
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-brand/10 pt-2 text-xs">
                <span className="text-muted-foreground">New challan status:</span>
                <StatusBadge status={isExcessAmount ? "Unpaid" : finalStatus} />
              </div>
            </div>
          </section>

          {error && (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-soft/50 px-3.5 py-2.5 text-xs font-medium text-danger"
            >
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="default"
              disabled={isSubmitting || isExcessAmount || paymentAmt <= 0}
              className={cn(
                "gap-1.5 text-xs font-semibold cursor-pointer",
                isSubmitting || isExcessAmount || paymentAmt <= 0
                  ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              )}
            >
              <Check className="size-4" />
              {isSubmitting
                ? "Processing…"
                : isExcessAmount
                  ? `Exceeds Max Due (${formatCurrency(remainingBeforeThisPayment)})`
                  : paymentAmt > 0
                    ? `Process Payment (${formatCurrency(paymentAmt)})`
                    : "Enter Received Amount"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
