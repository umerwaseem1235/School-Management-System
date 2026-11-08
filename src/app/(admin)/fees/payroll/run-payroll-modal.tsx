"use client";

import * as React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  Building2,
  CreditCard,
  Banknote,
  RotateCcw,
  FileCheck,
  Calendar,
  AlertCircle,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionButton } from "@/components/shared/action-button";
import { formatCurrency } from "@/lib/format";
import type { StaffSalaryRecord, DisbursementAccountRecord } from "@/lib/mock/payroll";

interface RunPayrollModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salaries: StaffSalaryRecord[];
  accounts: DisbursementAccountRecord[];
  onDisburseAll: (campus: string, bankId: string) => void;
  onUnlockPayroll?: (campus: string, reason?: string) => void;
  cycleMonth?: string;
}

type ModalView = "main" | "unlock-confirm" | "authorize-confirm";

export function RunPayrollModal({
  open,
  onOpenChange,
  salaries,
  accounts,
  onDisburseAll,
  onUnlockPayroll,
  cycleMonth = "November 2026",
}: RunPayrollModalProps) {
  const [view, setView] = React.useState<ModalView>("main");
  const [selectedCampus, setSelectedCampus] = React.useState("All Campuses");
  const [selectedBank, setSelectedBank] = React.useState(accounts[0]?.id || "acc-1");
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Unlock confirmation state
  const [unlockReason, setUnlockReason] = React.useState(
    "Salary compensation adjustment / allowances revision"
  );
  const [unlockNotes, setUnlockNotes] = React.useState("");
  const [isUnlockConfirmed, setIsUnlockConfirmed] = React.useState(false);

  // Reset view and confirmation state whenever modal is opened
  React.useEffect(() => {
    if (open) {
      setView("main");
      setIsUnlockConfirmed(false);
      setUnlockNotes("");
    }
  }, [open]);

  // Reset view when campus changes
  const handleCampusChange = (campus: string) => {
    setSelectedCampus(campus);
    setView("main");
  };

  const campusSalaries = salaries.filter(
    (s) => selectedCampus === "All Campuses" || s.campus === selectedCampus
  );

  // Separate cleared pending/approved from on-hold records
  const pendingSalaries = campusSalaries.filter(
    (s) => s.status !== "Paid" && s.status !== "Disbursed" && s.status !== "On Hold"
  );
  const onHoldSalaries = campusSalaries.filter((s) => s.status === "On Hold");
  const disbursedSalaries = campusSalaries.filter((s) => s.status === "Paid" || s.status === "Disbursed");

  const grossPayable = pendingSalaries.reduce((acc, s) => acc + s.grossSalary, 0);
  const deductions = pendingSalaries.reduce((acc, s) => acc + s.totalDeductions, 0);
  const netDisbursement = pendingSalaries.reduce((acc, s) => acc + s.netSalary, 0);

  const disbursedGross = disbursedSalaries.reduce((acc, s) => acc + s.grossSalary, 0);
  const disbursedDeductions = disbursedSalaries.reduce((acc, s) => acc + s.totalDeductions, 0);
  const disbursedNet = disbursedSalaries.reduce((acc, s) => acc + s.netSalary, 0);

  const isBatchLocked = pendingSalaries.length === 0 && disbursedSalaries.length > 0 && onHoldSalaries.length === 0;
  const activeAccount = accounts.find((a) => a.id === selectedBank) || accounts[0];

  // Execute disbursement
  const handleExecute = () => {
    if (pendingSalaries.length === 0) {
      if (onHoldSalaries.length > 0) {
        toast.warning(
          `All remaining ${onHoldSalaries.length} staff records are currently ON HOLD. Release holds to disburse them.`
        );
      } else {
        toast.info("No pending salaries to disburse for this selection.");
      }
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      onDisburseAll(selectedCampus, selectedBank);
      setIsProcessing(false);
      setView("main");
      toast.success(
        `Batch payout processed for ${pendingSalaries.length} staff members via ${activeAccount?.bankName}.`,
        {
          description:
            onHoldSalaries.length > 0
              ? `${onHoldSalaries.length} staff marked On Hold were bypassed and preserved.`
              : "Batch authorization is now finalized and locked. You can unlock it anytime to make revisions.",
          duration: 5000,
        }
      );
    }, 600);
  };

  // Confirm Unlock batch
  const handleConfirmUnlock = () => {
    if (!isUnlockConfirmed) return;
    setIsProcessing(true);
    setTimeout(() => {
      if (onUnlockPayroll) {
        onUnlockPayroll(selectedCampus, unlockReason);
      }
      setIsProcessing(false);
      setView("main");
      setIsUnlockConfirmed(false);
      setUnlockNotes("");
      toast.success(
        `Payroll batch for ${selectedCampus === "All Campuses" ? "All Campuses (Consolidated)" : selectedCampus} unlocked successfully.`,
        {
          description: `${disbursedSalaries.length} staff records reverted to Pending Authorization. Disbursement button is now re-enabled.`,
          duration: 5000,
        }
      );
    }, 450);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-h-[calc(100vh-3.5rem)] sm:max-w-xl gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        
        {/* VIEW 1: MAIN BATCH FORM */}
        {view === "main" && (
          <>
            <DialogHeader className="shrink-0 gap-1 border-b border-border/70 px-6 py-4">
              <div className="flex items-center justify-between pr-7">
                <DialogTitle className="text-base font-bold leading-tight text-foreground">
                  Process Monthly Payroll Batch
                </DialogTitle>
                {isBatchLocked ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-amber-800">
                    <Lock className="size-3 text-amber-700" />
                    <span>Locked (Disbursed)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/80 bg-emerald-50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-800">
                    <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Ready for Payout</span>
                  </span>
                )}
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-4 px-6 py-5 text-xs">
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Disbursement Cycle
                  </label>
                  <div className="flex h-9.5 items-center rounded-lg border border-border/80 bg-slate-50 px-3 text-xs font-semibold text-foreground shadow-2xs">
                    <Calendar className="mr-2 size-3.5 text-muted-foreground" />
                    {cycleMonth}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Target Campus
                  </label>
                  <select
                    value={selectedCampus}
                    onChange={(e) => handleCampusChange(e.target.value)}
                    className="h-9.5 w-full rounded-lg border border-border/80 bg-white px-3 text-xs font-medium text-foreground shadow-2xs transition-colors hover:border-border focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="All Campuses">All Campuses (Consolidated)</option>
                    <option value="Gulberg">Gulberg Campus</option>
                    <option value="DHA Phase 5">DHA Phase 5</option>
                    <option value="F-8 Islamabad">F-8 Islamabad</option>
                    <option value="Clifton">Clifton Campus</option>
                    <option value="Bahria Town">Bahria Town</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Select Institutional Clearing Bank Account
                  </label>
                  {activeAccount && (
                    <span className="font-mono text-[11px] text-muted-foreground">
                      Available: <strong className="font-semibold text-emerald-700">{formatCurrency(activeAccount.currentBalance)}</strong>
                    </span>
                  )}
                </div>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="h-9.5 w-full rounded-lg border border-border/80 bg-white px-3 text-xs font-medium text-foreground shadow-2xs transition-colors hover:border-border focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.bankName} — {a.accountTitle} ({formatCurrency(a.currentBalance)})
                    </option>
                  ))}
                </select>
                {activeAccount && (
                  <div className="flex items-center justify-between text-[11.5px] text-muted-foreground px-0.5 pt-0.5">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-muted-foreground" />
                      IBAN: <span className="font-mono font-medium text-foreground">{activeAccount.iban}</span>
                    </span>
                    <span className="font-medium text-muted-foreground">Verified EFT Channel</span>
                  </div>
                )}
              </div>

              {/* Batch Calculation Summary Card */}
              <div className="rounded-xl border border-border/80 bg-slate-50/60 p-4 space-y-3.5 shadow-2xs">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-brand-50 text-brand border border-brand/20">
                      <Receipt className="size-3.5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Batch Settlement Breakdown
                    </span>
                  </div>
                  {isBatchLocked ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-amber-800">
                      <Lock className="size-3 text-amber-700" />
                      <span>0 Staff Pending &bull; Batch Locked</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span>{pendingSalaries.length} Staff Cleared for Payout</span>
                    </span>
                  )}
                </div>

                {/* Breakdown Rows */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Total Gross Salaries:</span>
                    <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
                      {isBatchLocked ? "Rs 0" : formatCurrency(grossPayable)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Total Taxes &amp; Statutory Deductions:</span>
                    <span className="font-mono text-xs font-semibold tabular-nums text-rose-600">
                      {isBatchLocked ? "-Rs 0" : `-${formatCurrency(deductions)}`}
                    </span>
                  </div>
                </div>

                {/* Highlighted Net Payout Box */}
                <div className="flex items-center justify-between rounded-lg border border-emerald-200/90 bg-emerald-50/80 px-3.5 py-2.5">
                  <div>
                    <div className="text-xs font-bold text-foreground">Net Payout to Disburse</div>
                    <div className="text-[11px] text-muted-foreground">
                      {isBatchLocked
                        ? "Cycle completed and locked"
                        : `${pendingSalaries.length} verified electronic transfers`}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono text-base font-bold tabular-nums ${
                        isBatchLocked ? "text-muted-foreground" : "text-emerald-700"
                      }`}
                    >
                      {isBatchLocked ? "Rs 0" : formatCurrency(netDisbursement)}
                    </span>
                  </div>
                </div>

                {/* On Hold Callout banner */}
                {onHoldSalaries.length > 0 && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-amber-200/90 bg-amber-50/70 p-2.5 text-xs text-amber-950">
                    <AlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5" />
                    <div className="flex-1 text-[11.5px] leading-relaxed">
                      <strong className="font-semibold text-amber-900">
                        {onHoldSalaries.length} Staff On Hold:
                      </strong>{" "}
                      Automatically bypassed and protected from disbursement until cleared.
                    </div>
                  </div>
                )}

                {/* Paid Note / Unlock Action */}
                {disbursedSalaries.length > 0 && !isBatchLocked && (
                  <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-xs">
                    <span className="text-[11.5px] text-muted-foreground">
                      <strong className="font-semibold text-foreground">{disbursedSalaries.length} staff</strong> already paid for this selection.
                    </span>
                    <button
                      type="button"
                      onClick={() => setView("unlock-confirm")}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-950 hover:underline cursor-pointer transition-colors"
                    >
                      <Unlock className="size-3 text-amber-700" />
                      <span>Unlock Paid Records</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Locked State Callout Banner */}
              {isBatchLocked && (
                <div className="rounded-xl border border-amber-300/80 bg-amber-50/70 p-4 space-y-3 text-xs shadow-2xs">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
                      <Lock className="size-4 text-amber-700" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h6 className="font-bold text-amber-950 text-xs">
                          Payment Cycle Finalized &amp; Locked
                        </h6>
                        <span className="rounded-full bg-amber-200/90 border border-amber-300 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-900 uppercase">
                          Locked
                        </span>
                      </div>
                      <p className="text-[11.5px] leading-relaxed text-amber-900/90">
                        {cycleMonth} payroll for {selectedCampus === "All Campuses" ? "all campuses" : selectedCampus} has been authorized and paid ({disbursedSalaries.length} staff records &bull; {formatCurrency(disbursedNet)} net cleared). The payout button is locked to prevent duplicate execution.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-amber-300/60 text-[11.5px]">
                    <span className="text-amber-900/80">Need to make adjustments, revise deductions, or re-run?</span>
                    <button
                      type="button"
                      onClick={() => setView("unlock-confirm")}
                      className="inline-flex items-center gap-1.5 font-bold text-amber-950 hover:underline cursor-pointer"
                    >
                      <Unlock className="size-3.5 text-amber-700" />
                      <span>Unlock Batch Authorization</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Warning for insufficient account balance */}
              {!isBatchLocked && activeAccount && activeAccount.currentBalance < netDisbursement && (
                <div className="flex items-center gap-2 rounded bg-danger-soft/60 p-2.5 text-danger text-[11px]">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>Warning: Net payout exceeds the available balance of the selected account. Please re-fund or choose another account.</span>
                </div>
              )}
            </div>

            <DialogFooter className="m-0 shrink-0 flex-row items-center justify-between gap-2.5 rounded-none border-t border-border/70 bg-slate-50/80 px-6 py-3.5 sm:justify-between">
              <ActionButton
                tone="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isProcessing}
              >
                {isBatchLocked ? "Close" : "Cancel"}
              </ActionButton>

              <div className="flex items-center gap-2.5">
                {isBatchLocked ? (
                  <ActionButton
                    tone="warning"
                    size="sm"
                    onClick={() => setView("unlock-confirm")}
                    className="gap-1.5 font-bold shadow-xs cursor-pointer"
                  >
                    <Unlock className="size-3.5" />
                    <span>Unlock Payroll Batch</span>
                  </ActionButton>
                ) : (
                  <ActionButton
                    tone="primary"
                    size="sm"
                    onClick={() => setView("authorize-confirm")}
                    disabled={isProcessing || pendingSalaries.length === 0}
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span>
                      {isProcessing
                        ? "Transmitting Payout..."
                        : `Authorize & Pay (${pendingSalaries.length})`}
                    </span>
                  </ActionButton>
                )}
              </div>
            </DialogFooter>
          </>
        )}

        {/* VIEW 2: PROFESSIONAL UNLOCK CONFIRMATION FORM */}
        {view === "unlock-confirm" && (
          <>
            <DialogHeader className="shrink-0 gap-1 border-b border-border/70 px-6 py-4">
              <div className="flex items-center justify-between pr-7">
                <div className="flex items-center gap-2.5">
                  <div>
                    <DialogTitle className="text-base font-bold leading-tight text-foreground">
                      Unlock Payroll Batch Authorization
                    </DialogTitle>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setView("main")}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Back</span>
                </button>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-4 px-6 py-5 text-xs">
              {/* Batch Under Lock Snapshot */}
              <div className="rounded-xl border border-border/80 bg-slate-50/70 p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-amber-50 text-amber-800 border border-amber-200/70">
                      <Lock className="size-3.5 text-amber-700" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Batch Authorization Details
                    </span>
                  </div>
                  <span className="font-mono text-amber-800 bg-amber-100 border border-amber-300/80 px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1">
                    {disbursedSalaries.length} Paid Records Locked
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Disbursement Cycle:</span>
                    <span className="font-semibold text-foreground">{cycleMonth}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Target Campus:</span>
                    <span className="font-semibold text-foreground">{selectedCampus}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Settled Net Payout:</span>
                    <span className="font-mono font-bold text-emerald-700">{formatCurrency(disbursedNet)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Source Clearing Account:</span>
                    <span className="font-semibold text-foreground truncate block">{activeAccount?.bankName}</span>
                  </div>
                </div>
              </div>

              {/* Regulatory & Audit Warning Alert */}
              <div className="flex items-start gap-3 rounded-xl border border-amber-300/80 bg-amber-50/70 p-3.5 text-xs text-amber-950 shadow-2xs">
                <ShieldAlert className="size-4.5 shrink-0 mt-0.5 text-amber-700" />
                <div className="space-y-1 text-[11.5px] leading-relaxed">
                  <strong className="block font-bold text-amber-900">
                    Administrative Audit &amp; Compliance Verification
                  </strong>
                  <span>
                    Unlocking this batch releases the payment freeze and reverts all <strong>{disbursedSalaries.length} staff salary records</strong> from <strong>"Paid"</strong> back to <strong>"Pending Authorization"</strong>. This permits editing compensation figures, adjusting deductions, or re-executing batch payment.
                  </span>
                  <span className="block text-amber-900/80 pt-0.5">
                    This administrative action is recorded in the permanent institutional compliance audit trail.
                  </span>
                </div>
              </div>

              {/* Reason for Unlock Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Primary Reason for Unlock (Audit Justification) <span className="text-danger">*</span>
                </label>
                <select
                  value={unlockReason}
                  onChange={(e) => setUnlockReason(e.target.value)}
                  className="h-9.5 w-full rounded-lg border border-border/80 bg-white px-3 text-xs font-medium text-foreground shadow-2xs transition-colors hover:border-border focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="Salary compensation adjustment / allowances revision">
                    Salary compensation adjustment / allowances revision
                  </option>
                  <option value="Deduction or statutory tax recalculation">
                    Deduction or statutory tax recalculation
                  </option>
                  <option value="Clearing bank account reassignment / IBAN correction">
                    Clearing bank account reassignment / IBAN correction
                  </option>
                  <option value="Disbursement reversal & operational re-run">
                    Disbursement reversal &amp; operational re-run
                  </option>
                  <option value="Institutional compliance & executive review">
                    Institutional compliance &amp; executive review
                  </option>
                  <option value="Administrative testing & verification">
                    Administrative testing &amp; verification
                  </option>
                </select>
              </div>

              {/* Remarks Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Authorization Remarks / Ticket Reference <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Authorized by CFO for October adjustments..."
                  value={unlockNotes}
                  onChange={(e) => setUnlockNotes(e.target.value)}
                  className="h-9.5 w-full rounded-lg border border-border/80 bg-white px-3 text-xs text-foreground shadow-2xs placeholder:text-muted-foreground/60 transition-colors hover:border-border focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              {/* Executive Confirmation Checkbox */}
              <label className="flex items-start gap-3 rounded-xl border border-border/80 bg-slate-50/80 p-3.5 cursor-pointer select-none hover:bg-slate-100/70 transition-colors shadow-2xs">
                <input
                  type="checkbox"
                  checked={isUnlockConfirmed}
                  onChange={(e) => setIsUnlockConfirmed(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-border text-brand focus:ring-brand accent-brand"
                />
                <div className="text-xs leading-normal text-foreground">
                  <span className="font-semibold block mb-0.5 text-foreground">
                    Confirm Executive Clearance &amp; Batch Release
                  </span>
                  <span className="text-muted-foreground text-[11.5px]">
                    I verify that I hold administrative authority to unlock this payroll batch and revert salary records for {cycleMonth}.
                  </span>
                </div>
              </label>
            </div>

            <DialogFooter className="m-0 shrink-0 flex-row items-center justify-between gap-2.5 rounded-none border-t border-border/70 bg-slate-50/80 px-6 py-3.5 sm:justify-between">
              <ActionButton
                tone="outline"
                size="sm"
                onClick={() => setView("main")}
                disabled={isProcessing}
              >
                Cancel &amp; Keep Locked
              </ActionButton>
              <ActionButton
                tone="warning"
                size="sm"
                onClick={handleConfirmUnlock}
                disabled={!isUnlockConfirmed || isProcessing}
                className="gap-1.5 font-bold shadow-xs cursor-pointer"
              >
                <Unlock className="size-3.5" />
                <span>
                  {isProcessing ? "Releasing Lock..." : "Confirm & Unlock Batch"}
                </span>
              </ActionButton>
            </DialogFooter>
          </>
        )}

        {/* VIEW 3: DISBURSEMENT AUTHORIZATION CONFIRMATION */}
        {view === "authorize-confirm" && (
          <>
            <DialogHeader className="shrink-0 gap-1 border-b border-border/70 px-6 py-4">
              <div className="flex items-center justify-between pr-7">
                <div className="flex items-center gap-2.5">
                  <div>
                    <DialogTitle className="text-base font-bold leading-tight text-foreground">
                      Confirm Batch Payment Authorization
                    </DialogTitle>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setView("main")}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Back</span>
                </button>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-4 px-6 py-5 text-xs">
              <div className="rounded-xl border border-border/80 bg-slate-50/60 p-4 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-brand-50 text-brand border border-brand/20">
                      <FileCheck className="size-3.5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Batch Settlement Summary
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>{pendingSalaries.length} Staff Eligible</span>
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Target Campus:</span>
                    <span className="font-semibold text-foreground">{selectedCampus}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Disbursement Cycle:</span>
                    <span className="font-semibold text-foreground">{cycleMonth}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Source Clearing Account:</span>
                    <span className="font-semibold text-foreground">{activeAccount?.bankName}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Account IBAN:</span>
                    <span className="font-mono text-foreground">{activeAccount?.iban}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-2 text-muted-foreground">
                    <span>Total Gross Payable:</span>
                    <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
                      {formatCurrency(grossPayable)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total Taxes &amp; Deductions:</span>
                    <span className="font-mono text-xs font-semibold tabular-nums text-rose-600">
                      -{formatCurrency(deductions)}
                    </span>
                  </div>
                </div>

                {/* Net Total Highlight Box */}
                <div className="flex items-center justify-between rounded-lg border border-emerald-200/90 bg-emerald-50/80 px-3.5 py-2.5">
                  <div>
                    <div className="text-xs font-bold text-foreground">Total Net Fund Transfer</div>
                    <div className="text-[11px] text-muted-foreground">EFT batch payout instruction</div>
                  </div>
                  <div className="font-mono text-base font-bold tabular-nums text-emerald-700">
                    {formatCurrency(netDisbursement)}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-blue-200/80 bg-blue-50/70 p-3.5 text-xs text-blue-950 shadow-2xs">
                <CreditCard className="size-4.5 shrink-0 mt-0.5 text-blue-700" />
                <div className="space-y-1 text-[11.5px] leading-relaxed">
                  <strong className="block font-bold text-blue-900">
                    Institutional Electronic Fund Clearance Notice
                  </strong>
                  <span>
                    Confirming this action will transmit EFT instructions to <strong>{activeAccount?.bankName}</strong> for <strong>{pendingSalaries.length} staff accounts</strong>.
                  </span>
                  <span className="block text-blue-900/80 pt-0.5">
                    Upon completion, this cycle will be marked as <strong>Paid &amp; Locked</strong> to safeguard financial ledger integrity. You may unlock it later if revisions are required.
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="m-0 shrink-0 flex-row items-center justify-between gap-2.5 rounded-none border-t border-border/70 bg-slate-50/80 px-6 py-3.5 sm:justify-between">
              <ActionButton
                tone="outline"
                size="sm"
                onClick={() => setView("main")}
                disabled={isProcessing}
              >
                Back
              </ActionButton>
              <ActionButton
                tone="primary"
                size="sm"
                onClick={handleExecute}
                disabled={isProcessing}
                className="gap-1.5 font-bold cursor-pointer"
              >
                <CheckCircle2 className="size-3.5" />
                <span>
                  {isProcessing ? "Transmitting EFT Payout..." : "Confirm & Pay Funds Now"}
                </span>
              </ActionButton>
            </DialogFooter>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}
