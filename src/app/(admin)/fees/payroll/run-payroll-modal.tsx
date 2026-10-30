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
}

type ModalView = "main" | "unlock-confirm" | "authorize-confirm";

export function RunPayrollModal({
  open,
  onOpenChange,
  salaries,
  accounts,
  onDisburseAll,
  onUnlockPayroll,
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
    (s) => s.status !== "Disbursed" && s.status !== "On Hold"
  );
  const onHoldSalaries = campusSalaries.filter((s) => s.status === "On Hold");
  const disbursedSalaries = campusSalaries.filter((s) => s.status === "Disbursed");

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
                <DialogTitle className="text-base font-bold leading-tight text-foreground flex items-center gap-2">
                  <Banknote className="size-4.5 text-brand" />
                  <span>Process Monthly Payroll Batch</span>
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-foreground block mb-1">
                    Disbursement Cycle
                  </label>
                  <div className="flex h-9 items-center rounded-[4px] border border-border/80 bg-cream/40 px-3 font-semibold text-foreground">
                    October 2026
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-foreground block mb-1">
                    Target Campus
                  </label>
                  <select
                    value={selectedCampus}
                    onChange={(e) => handleCampusChange(e.target.value)}
                    className="h-9 w-full rounded-[4px] border border-border/80 bg-white px-3 text-xs text-foreground focus:border-brand focus:outline-none"
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

              <div>
                <label className="text-[11px] font-semibold text-foreground block mb-1">
                  Select Institutional Clearing Bank Account
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-border/80 bg-white px-3 text-xs text-foreground focus:border-brand focus:outline-none"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.bankName} — {a.accountTitle} (Bal: {formatCurrency(a.currentBalance)})
                    </option>
                  ))}
                </select>
                {activeAccount && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    IBAN: <span className="font-mono text-foreground">{activeAccount.iban}</span> &bull; Available Balance: <strong className="text-success">{formatCurrency(activeAccount.currentBalance)}</strong>
                  </p>
                )}
              </div>

              {/* Batch Calculation Summary */}
              <div className="rounded-lg border border-border/80 bg-cream/30 p-3.5 space-y-2.5">
                <h5 className="font-bold text-[#091d3e] text-[11px] uppercase tracking-wider flex items-center justify-between">
                  <span>Batch Settlement Breakdown</span>
                  {isBatchLocked ? (
                    <span className="font-mono font-bold text-amber-800 bg-amber-100/90 border border-amber-300/80 px-2 py-0.5 rounded text-[10.5px] inline-flex items-center gap-1">
                      <Lock className="size-3 text-amber-700" />
                      0 STAFF PENDING &bull; BATCH LOCKED
                    </span>
                  ) : (
                    <span className="font-mono font-bold text-foreground">
                      {pendingSalaries.length} Staff Cleared for Payout
                    </span>
                  )}
                </h5>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Gross Salaries:</span>
                    <span className="font-mono font-medium">
                      {isBatchLocked ? "Rs 0" : formatCurrency(grossPayable)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Taxes &amp; Statutory Deductions:</span>
                    <span className="font-mono text-danger">
                      {isBatchLocked ? "-Rs 0" : `-${formatCurrency(deductions)}`}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-1.5 font-bold">
                    <span className="text-foreground">Net Payout to Disburse:</span>
                    <span className={`font-mono text-sm ${isBatchLocked ? "text-muted-foreground" : "text-success"}`}>
                      {isBatchLocked ? "Rs 0" : formatCurrency(netDisbursement)}
                    </span>
                  </div>
                </div>

                {/* On Hold Callout banner */}
                {onHoldSalaries.length > 0 && (
                  <div className="rounded-md border border-rose-200 bg-rose-50/90 p-2.5 text-xs text-rose-950 flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium">
                      <AlertTriangle className="size-4 text-rose-700 shrink-0" />
                      <span>
                        <strong>{onHoldSalaries.length} Staff On Hold:</strong> Automatically bypassed and protected from disbursement until cleared.
                      </span>
                    </span>
                  </div>
                )}

                {/* Sub-note if salaries already disbursed */}
                {disbursedSalaries.length > 0 && !isBatchLocked && (
                  <div className="border-t border-border/60 pt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {disbursedSalaries.length} staff already disbursed for this selection.
                    </span>
                    <button
                      type="button"
                      onClick={() => setView("unlock-confirm")}
                      className="font-semibold text-amber-800 hover:text-amber-950 inline-flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Unlock className="size-3 text-amber-700" />
                      <span>Unlock Disbursed Records</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Locked State Callout Banner */}
              {isBatchLocked && (
                <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 p-3.5 space-y-2 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-amber-500/20 text-amber-800">
                      <Lock className="size-4 text-amber-700" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h6 className="font-bold text-amber-950 text-xs">
                          Disbursement Cycle Finalized &amp; Locked
                        </h6>
                        <span className="rounded-full bg-amber-200/90 border border-amber-300 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-900 uppercase">
                          Locked
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-900/90">
                        October 2026 payroll for {selectedCampus === "All Campuses" ? "all campuses" : selectedCampus} has been authorized and disbursed ({disbursedSalaries.length} staff records &bull; {formatCurrency(disbursedNet)} net cleared). The payout button is locked to prevent duplicate execution.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-amber-500/20 text-[11px]">
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
                        : `Authorize & Disburse (${pendingSalaries.length})`}
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
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-800 border border-amber-500/30">
                    <Unlock className="size-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold leading-tight text-foreground">
                      Unlock Payroll Batch Authorization
                    </DialogTitle>
                    <p className="text-[11px] text-muted-foreground">
                      Administrative Security Clearance &bull; October 2026 Cycle
                    </p>
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
              <div className="rounded-lg border border-border/80 bg-slate-50/80 p-3.5 space-y-2">
                <div className="flex items-center justify-between font-bold text-[#091d3e] text-[11px] uppercase tracking-wider">
                  <span>Batch Authorization Details</span>
                  <span className="font-mono text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                    <Lock className="size-3 text-amber-700" />
                    {disbursedSalaries.length} Records Locked
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border/60">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Disbursement Cycle:</span>
                    <span className="font-semibold text-foreground">October 2026</span>
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
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/35 bg-amber-50/90 p-3 text-xs text-amber-950">
                <ShieldAlert className="size-4.5 shrink-0 mt-0.5 text-amber-700" />
                <div className="space-y-1 text-[11px] leading-relaxed">
                  <strong className="block font-bold text-amber-900">
                    Administrative Audit &amp; Compliance Verification
                  </strong>
                  <span>
                    Unlocking this batch releases the disbursement freeze and reverts all <strong>{disbursedSalaries.length} staff salary records</strong> from <strong>"Disbursed"</strong> back to <strong>"Pending Authorization"</strong>. This permits editing compensation figures, adjusting deductions, or re-executing batch disbursement.
                  </span>
                  <span className="block text-amber-900/80 pt-0.5">
                    This administrative action is recorded in the permanent institutional compliance audit trail.
                  </span>
                </div>
              </div>

              {/* Reason for Unlock Selector */}
              <div>
                <label className="text-[11px] font-semibold text-foreground block mb-1">
                  Primary Reason for Unlock (Audit Justification) <span className="text-danger">*</span>
                </label>
                <select
                  value={unlockReason}
                  onChange={(e) => setUnlockReason(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-border/80 bg-white px-3 text-xs text-foreground focus:border-brand focus:outline-none"
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
              <div>
                <label className="text-[11px] font-semibold text-foreground block mb-1">
                  Authorization Remarks / Ticket Reference <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Authorized by CFO for October adjustments..."
                  value={unlockNotes}
                  onChange={(e) => setUnlockNotes(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-border/80 bg-white px-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-brand focus:outline-none"
                />
              </div>

              {/* Executive Confirmation Checkbox */}
              <label className="flex items-start gap-2.5 rounded-lg border border-border/80 bg-cream/40 p-3 cursor-pointer select-none hover:bg-cream/60 transition-colors">
                <input
                  type="checkbox"
                  checked={isUnlockConfirmed}
                  onChange={(e) => setIsUnlockConfirmed(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-border text-brand focus:ring-brand accent-[#091d3e]"
                />
                <div className="text-[11px] leading-tight text-foreground">
                  <span className="font-semibold block mb-0.5 text-foreground">
                    Confirm Executive Clearance &amp; Batch Release
                  </span>
                  <span className="text-muted-foreground">
                    I verify that I hold administrative authority to unlock this payroll batch and revert salary records for October 2026.
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
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold leading-tight text-foreground">
                      Confirm Batch Disbursement Authorization
                    </DialogTitle>
                    <p className="text-[11px] text-muted-foreground">
                      Electronic Fund Transfer (EFT) Clearance &bull; October 2026 Cycle
                    </p>
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
              <div className="rounded-lg border border-border/80 bg-cream/30 p-3.5 space-y-2">
                <h5 className="font-bold text-[#091d3e] text-[11px] uppercase tracking-wider flex items-center justify-between">
                  <span>Batch Settlement Summary</span>
                  <span className="font-mono font-bold text-foreground">
                    {pendingSalaries.length} Staff Eligible
                  </span>
                </h5>
                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Campus:</span>
                    <span className="font-semibold text-foreground">{selectedCampus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Disbursement Cycle:</span>
                    <span className="font-semibold text-foreground">October 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Source Clearing Account:</span>
                    <span className="font-semibold text-foreground">{activeAccount?.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account IBAN:</span>
                    <span className="font-mono text-foreground">{activeAccount?.iban}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-1.5">
                    <span className="text-muted-foreground">Total Gross Payable:</span>
                    <span className="font-mono font-medium">{formatCurrency(grossPayable)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Taxes &amp; Deductions:</span>
                    <span className="font-mono text-danger">-{formatCurrency(deductions)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-1.5 font-bold">
                    <span className="text-foreground">Total Net Fund Transfer:</span>
                    <span className="font-mono text-success text-base">{formatCurrency(netDisbursement)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-blue-500/30 bg-blue-50/80 p-3 text-xs text-blue-950">
                <CreditCard className="size-4.5 shrink-0 mt-0.5 text-blue-700" />
                <div className="space-y-1 text-[11px] leading-relaxed">
                  <strong className="block font-bold text-blue-900">
                    Institutional Electronic Fund Clearance Notice
                  </strong>
                  <span>
                    Confirming this action will transmit EFT instructions to <strong>{activeAccount?.bankName}</strong> for <strong>{pendingSalaries.length} staff accounts</strong>.
                  </span>
                  <span className="block text-blue-900/80 pt-0.5">
                    Upon completion, this cycle will be marked as <strong>Disbursed &amp; Locked</strong> to safeguard financial ledger integrity. You may unlock it later if revisions are required.
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
                  {isProcessing ? "Transmitting EFT Payout..." : "Confirm & Disburse Funds Now"}
                </span>
              </ActionButton>
            </DialogFooter>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}
