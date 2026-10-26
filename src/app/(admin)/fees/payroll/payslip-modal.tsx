"use client";

import * as React from "react";
import {
  Printer,
  CreditCard,
  Check,
  Edit,
  Unlock,
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
}

export function PayslipModal({
  salary,
  open,
  onOpenChange,
  onDisburse,
  onUnlock,
  onEdit,
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
      <DialogContent className="flex flex-col max-h-[calc(100vh-3.5rem)] sm:max-w-xl gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        {/* Header — equal 24px padding */}
        <DialogHeader className="shrink-0 gap-1 px-6 py-5">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold leading-tight text-foreground">
                Staff Compensation Details
              </DialogTitle>
              <DialogDescription className="mt-1 font-mono text-xs text-muted-foreground">
                {salary.empCode} · {salary.monthYear} · Ref:{" "}
                {salary.transactionRef || "BATCH-2610-PENDING"}
              </DialogDescription>
            </div>
            <StatusBadge status={salary.status} />
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto space-y-5 border-t border-border/70 px-6 py-5 text-xs">
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
                CNIC: <span className="font-semibold text-foreground">{salary.cnic}</span>
              </p>
              <p className="mt-0.5">
                Joined: <span className="font-semibold text-foreground">{formatDate(salary.joiningDate)}</span>
              </p>
            </div>
          </div>

          {/* 4-Column Compensation Summary Strip */}
          <dl className="grid grid-cols-2 divide-x divide-y divide-border/70 overflow-hidden rounded-xl border border-border/70 bg-slate-50/60 sm:grid-cols-4 sm:divide-y-0">
            <div className="px-3.5 py-3">
              <dt className="text-[11px] font-medium text-muted-foreground">
                Base Pay
              </dt>
              <dd className="mt-1 font-mono text-sm font-bold tabular-nums text-foreground">
                {formatCurrency(salary.baseSalary)}
              </dd>
            </div>
            <div className="px-3.5 py-3">
              <dt className="text-[11px] font-medium text-muted-foreground">
                Gross Pay
              </dt>
              <dd className="mt-1 font-mono text-sm font-bold tabular-nums text-foreground">
                {formatCurrency(salary.grossSalary)}
              </dd>
            </div>
            <div className="px-3.5 py-3">
              <dt className="text-[11px] font-medium text-muted-foreground">
                Deductions
              </dt>
              <dd className="mt-1 font-mono text-sm font-bold tabular-nums text-danger">
                -{formatCurrency(salary.totalDeductions)}
              </dd>
            </div>
            <div className="bg-emerald-50/50 px-3.5 py-3">
              <dt className="text-[11px] font-semibold text-emerald-800">
                Net Pay
              </dt>
              <dd className="mt-1 font-mono text-sm font-extrabold tabular-nums text-emerald-700">
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
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-slate-50/50 px-4 py-3">
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
              <p className="mt-1 text-[11px] text-muted-foreground">
                {salary.disbursedDate
                  ? `Disbursed ${formatDate(salary.disbursedDate)}`
                  : "Pending Disbursal"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer — equal 24px side padding, 16px vertical */}
        <DialogFooter className="m-0 shrink-0 flex-row flex-wrap items-center justify-between gap-2.5 rounded-none border-t border-border/70 bg-muted/30 px-6 py-4 sm:justify-between">
          <div className="flex items-center gap-2">
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

          <div className="flex items-center gap-2">
            {salary.status === "Disbursed" && onUnlock && (
              <ActionButton
                tone="warning"
                size="sm"
                onClick={() => {
                  onUnlock(salary.id);
                  onOpenChange(false);
                }}
                title="Unlock and revert this salary record to Pending"
              >
                <Unlock className="size-3.5" />
                <span>Unlock Record</span>
              </ActionButton>
            )}
            {salary.status !== "Disbursed" && onDisburse && (
              <ActionButton
                tone="success"
                size="sm"
                onClick={() => onDisburse(salary.id)}
              >
                <Check className="size-3.5" />
                <span>Disburse Salary</span>
              </ActionButton>
            )}
            <ActionButton
              tone="primary"
              size="sm"
              onClick={() => printSinglePayslip(salary)}
            >
              <Printer className="size-3.5" />
              <span>Print Payslip</span>
            </ActionButton>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
