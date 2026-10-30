"use client";

import * as React from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  CreditCard,
  Edit,
  Printer,
  RotateCcw,
  ShieldCheck,
  Unlock,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionButton } from "@/components/shared/action-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatCurrency, formatDate } from "@/lib/format";
import type { StaffSalaryRecord } from "@/lib/mock/payroll";
import { printSinglePayslip } from "./payroll-export";

interface PayslipModalProps {
  salary: StaffSalaryRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDisburse?: (id: string) => void;
  onUnlock?: (id: string) => void;
  onEdit?: (salary: StaffSalaryRecord) => void;
  onStatusChange?: (
    id: string,
    status: "Disbursed" | "Pending" | "Approved" | "On Hold",
    reason?: string
  ) => void;
}

export function PayslipModal({
  salary,
  open,
  onOpenChange,
  onDisburse,
  onUnlock,
  onEdit,
  onStatusChange,
}: PayslipModalProps) {
  if (!salary) return null;

  const otherAllowances =
    salary.medicalAllowance +
    salary.conveyanceAllowance +
    salary.specialAllowance;

  const otherDeductions =
    salary.eobi + salary.unpaidLeaveDeduction + salary.loanDeduction;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col max-h-[calc(100vh-3rem)] sm:max-w-2xl gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white"
      >
        {/* Header */}
        <DialogHeader className="shrink-0 bg-gradient-to-r from-slate-50/90 via-white to-slate-50/90 px-6 py-4 border-b border-border/70">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold leading-tight text-foreground">
                Staff Compensation Details
              </DialogTitle>
              <DialogDescription className="mt-1 font-mono text-xs text-muted-foreground">
                {salary.empCode} · {salary.monthYear} · Ref:{" "}
                {salary.transactionRef || "BATCH-2610-PENDING"}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <StatusBadge status={salary.status} />
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground/70 transition-colors hover:border-border/80 hover:bg-slate-100 hover:text-foreground focus:outline-none cursor-pointer"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto space-y-3.5 px-6 py-4 text-xs">
          {/* Employee Profile */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <UserAvatar
                name={salary.name}
                size="lg"
                className="ring-2 ring-brand/15"
              />
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-foreground">
                  {salary.name}
                </h3>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {salary.designation} · {salary.campus} · {salary.department}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right text-[11px] text-muted-foreground">
              <p className="font-mono">
                CNIC:{" "}
                <span className="font-semibold text-foreground">
                  {salary.cnic}
                </span>
              </p>
              <p className="mt-0.5">
                Joined:{" "}
                <span className="font-semibold text-foreground">
                  {formatDate(salary.joiningDate)}
                </span>
              </p>
            </div>
          </div>

          {/* Governance & Status Lifecycle Card with Integrated Workflow Buttons */}
          <div
            className={
              salary.status === "On Hold"
                ? "rounded-xl border border-rose-200/90 bg-rose-50/60 px-4 py-3"
                : salary.status === "Approved"
                ? "rounded-xl border border-emerald-200/90 bg-emerald-50/50 px-4 py-3"
                : salary.status === "Disbursed"
                ? "rounded-xl border border-emerald-200/80 bg-emerald-50/40 px-4 py-3"
                : "rounded-xl border border-border/80 bg-slate-50/70 px-4 py-3"
            }
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#091d3e] text-[10.5px]">
                  <ShieldCheck className="size-3.5 text-brand shrink-0" />
                  <span>Compensation Governance Status</span>
                </div>

                {salary.status === "Pending" && (
                  <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                    Draft salary awaiting accountant sign-off. Approve for release or place on hold if verification is required.
                  </p>
                )}

                {salary.status === "Approved" && (
                  <p className="text-[11.5px] text-emerald-900 leading-relaxed">
                    <strong>Audited &amp; Approved:</strong> Attendance, tax, and deductions verified. Cleared for bank disbursal.
                  </p>
                )}

                {salary.status === "On Hold" && (
                  <p className="text-[11.5px] text-rose-900 leading-relaxed">
                    <strong>Payment On Hold:</strong> Locked due to pending clearance or audit. Automatically bypassed during batch payouts.
                  </p>
                )}

                {salary.status === "Disbursed" && (
                  <p className="text-[11.5px] text-emerald-950 leading-relaxed">
                    Settled on{" "}
                    <strong>
                      {salary.disbursedDate
                        ? formatDate(salary.disbursedDate)
                        : "October 2026"}
                    </strong>{" "}
                    · Bank Transfer Ref:{" "}
                    <code className="font-mono font-bold text-brand">
                      {salary.transactionRef}
                    </code>
                  </p>
                )}
              </div>

              {/* Contextual Status Transition Buttons */}
              {onStatusChange && salary.status !== "Disbursed" && (
                <div className="flex items-center gap-2 shrink-0 sm:pl-3 sm:border-l sm:border-border/60">
                  {salary.status === "Pending" && (
                    <>
                      <ActionButton
                        tone="warning"
                        size="xs"
                        onClick={() => onStatusChange(salary.id, "On Hold")}
                        title="Place salary on hold pending audit or clearance"
                        className="px-2.5"
                      >
                        <AlertCircle className="size-3.5" />
                        <span>Put On Hold</span>
                      </ActionButton>
                      <ActionButton
                        tone="success"
                        size="xs"
                        onClick={() => onStatusChange(salary.id, "Approved")}
                        title="Verify and approve salary for payout"
                        className="px-2.5"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>Approve Salary</span>
                      </ActionButton>
                    </>
                  )}

                  {salary.status === "Approved" && (
                    <>
                      <ActionButton
                        tone="outline"
                        size="xs"
                        onClick={() => onStatusChange(salary.id, "Pending")}
                        title="Revert status back to Pending draft"
                        className="px-2.5"
                      >
                        <RotateCcw className="size-3.5" />
                        <span>Revert to Pending</span>
                      </ActionButton>
                      <ActionButton
                        tone="warning"
                        size="xs"
                        onClick={() => onStatusChange(salary.id, "On Hold")}
                        title="Place compensation on hold"
                        className="px-2.5"
                      >
                        <AlertCircle className="size-3.5" />
                        <span>Put On Hold</span>
                      </ActionButton>
                    </>
                  )}

                  {salary.status === "On Hold" && (
                    <>
                      <ActionButton
                        tone="outline"
                        size="xs"
                        onClick={() => onStatusChange(salary.id, "Pending")}
                        title="Release hold and return to Pending queue"
                        className="px-2.5"
                      >
                        <Unlock className="size-3.5" />
                        <span>Release Hold</span>
                      </ActionButton>
                      <ActionButton
                        tone="success"
                        size="xs"
                        onClick={() => onStatusChange(salary.id, "Approved")}
                        title="Clear hold and approve for payout"
                        className="px-2.5"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>Clear &amp; Approve</span>
                      </ActionButton>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 4-Column Compensation Summary Strip */}
          <dl className="grid grid-cols-2 divide-x divide-y divide-border/70 overflow-hidden rounded-xl border border-border/70 bg-slate-50/60 sm:grid-cols-4 sm:divide-y-0">
            <div className="px-3.5 py-2.5">
              <dt className="text-[11px] font-medium text-muted-foreground">
                Base Pay
              </dt>
              <dd className="mt-0.5 font-mono text-sm font-bold tabular-nums text-foreground">
                {formatCurrency(salary.baseSalary)}
              </dd>
            </div>
            <div className="px-3.5 py-2.5">
              <dt className="text-[11px] font-medium text-muted-foreground">
                Gross Pay
              </dt>
              <dd className="mt-0.5 font-mono text-sm font-bold tabular-nums text-foreground">
                {formatCurrency(salary.grossSalary)}
              </dd>
            </div>
            <div className="px-3.5 py-2.5">
              <dt className="text-[11px] font-medium text-muted-foreground">
                Deductions
              </dt>
              <dd className="mt-0.5 font-mono text-sm font-bold tabular-nums text-danger">
                -{formatCurrency(salary.totalDeductions)}
              </dd>
            </div>
            <div className="bg-emerald-50/50 px-3.5 py-2.5">
              <dt className="text-[11px] font-semibold text-emerald-800">
                Net Pay
              </dt>
              <dd className="mt-0.5 font-mono text-sm font-extrabold tabular-nums text-emerald-700">
                {formatCurrency(salary.netSalary)}
              </dd>
            </div>
          </dl>

          {/* Symmetrical 2-Column Earnings & Deductions Breakdown */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {/* Earnings */}
            <div className="flex flex-col justify-between overflow-hidden rounded-xl border border-border/70 bg-white">
              <div className="border-b border-border/60 bg-slate-50/80 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Earnings &amp; Allowances
              </div>
              <div className="divide-y divide-border/50">
                <div className="flex items-center justify-between px-3.5 py-2">
                  <span className="text-muted-foreground">Basic Pay</span>
                  <span className="font-mono font-semibold tabular-nums text-foreground">
                    {formatCurrency(salary.baseSalary)}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2">
                  <span className="text-muted-foreground">House Rent (HRA)</span>
                  <span className="font-mono tabular-nums text-foreground">
                    {formatCurrency(salary.houseRentAllowance)}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2">
                  <span className="text-muted-foreground">Medical &amp; Other</span>
                  <span className="font-mono tabular-nums text-foreground">
                    {formatCurrency(otherAllowances)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border/60 bg-slate-50/60 px-3.5 py-2 font-bold text-foreground">
                <span>Gross Total</span>
                <span className="font-mono tabular-nums text-[#091d3e]">
                  {formatCurrency(salary.grossSalary)}
                </span>
              </div>
            </div>

            {/* Deductions */}
            <div className="flex flex-col justify-between overflow-hidden rounded-xl border border-border/70 bg-white">
              <div className="border-b border-border/60 bg-slate-50/80 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Statutory Deductions
              </div>
              <div className="divide-y divide-border/50">
                <div className="flex items-center justify-between px-3.5 py-2">
                  <span className="text-muted-foreground">Withholding Tax</span>
                  <span className="font-mono tabular-nums text-danger">
                    -{formatCurrency(salary.taxDeduction)}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2">
                  <span className="text-muted-foreground">Provident Fund</span>
                  <span className="font-mono tabular-nums text-danger">
                    -{formatCurrency(salary.providentFund)}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2">
                  <span className="text-muted-foreground">EOBI &amp; Recoveries</span>
                  <span className="font-mono tabular-nums text-danger">
                    -{formatCurrency(otherDeductions)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border/60 bg-slate-50/60 px-3.5 py-2 font-bold text-foreground">
                <span>Total Deductions</span>
                <span className="font-mono tabular-nums text-danger">
                  -{formatCurrency(salary.totalDeductions)}
                </span>
              </div>
            </div>
          </div>

          {/* Disbursement Account Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-slate-50/50 px-4 py-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-brand ring-1 ring-border/80">
                <CreditCard className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {salary.bankName} ·{" "}
                  <span className="font-mono font-normal text-muted-foreground">
                    {salary.accountNumber}
                  </span>
                </p>
                <p className="truncate font-mono text-[11px] text-muted-foreground">
                  IBAN: {salary.iban}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center rounded-md bg-white px-2.5 py-0.5 text-[11px] font-semibold text-foreground ring-1 ring-border/80">
                {salary.paymentMode}
              </span>
              <p className="mt-1 text-[11px] text-muted-foreground font-medium">
                {salary.disbursedDate
                  ? `Disbursed ${formatDate(salary.disbursedDate)}`
                  : salary.status === "On Hold"
                  ? "Bypassed (On Hold)"
                  : salary.status === "Approved"
                  ? "Approved for Payout"
                  : "Pending Authorization"}
              </p>
            </div>
          </div>
        </div>

        {/* Clean Single-Row Footer with Balanced Left/Right Button Groups */}
        <DialogFooter className="m-0 shrink-0 flex-row items-center justify-between gap-3 rounded-none border-t border-border/70 bg-slate-50/80 px-6 py-3.5 sm:justify-between">
          <div className="flex items-center gap-2.5">
            <ActionButton
              tone="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </ActionButton>
            {onEdit && (
              <ActionButton
                tone="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(salary);
                }}
              >
                <Edit className="size-3.5" />
                <span>Edit Package</span>
              </ActionButton>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <ActionButton
              tone="outline"
              size="sm"
              onClick={() => printSinglePayslip(salary)}
            >
              <Printer className="size-3.5" />
              <span>Print Payslip</span>
            </ActionButton>

            {salary.status === "Disbursed" && onUnlock && (
              <ActionButton
                tone="warning"
                size="sm"
                onClick={() => onUnlock(salary.id)}
                title="Unlock and revert this salary record to Pending"
              >
                <Unlock className="size-3.5" />
                <span>Unlock Record</span>
              </ActionButton>
            )}

            {salary.status !== "Disbursed" &&
              salary.status !== "On Hold" &&
              onDisburse && (
                <ActionButton
                  tone="primary"
                  size="sm"
                  onClick={() => onDisburse(salary.id)}
                >
                  <Check className="size-3.5" />
                  <span>Disburse Salary</span>
                </ActionButton>
              )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
