"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import type { FeeStatus } from "@/types";
import {
  ADMISSION_DISCOUNT_REASONS,
  ADMISSION_PAYMENT_METHODS,
  calculateAdmissionFeeTotals,
  getDefaultFeeScheduleForClass,
  type AdmissionFormState,
  type AdmissionPaymentMethod,
} from "./admission-form-types";
import {
  CreditCard,
  Hash,
  Percent,
  Receipt,
  RotateCcw,
  Wallet,
} from "lucide-react";

interface StepFeeDetailsProps {
  form: AdmissionFormState;
  errors: Record<string, string>;
  onChange: <K extends keyof AdmissionFormState>(
    field: K,
    value: AdmissionFormState[K]
  ) => void;
  onClearError: (field: string) => void;
}

interface CurrencyFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

function CurrencyField({
  id,
  label,
  value,
  onChange,
  error,
}: CurrencyFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold">
        {label}
      </Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted-foreground">
          Rs
        </span>
        <Input
          id={id}
          type="number"
          min={0}
          step={100}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-9.5 pl-8.5 text-sm font-mono tabular-nums",
            error && "border-danger focus-visible:ring-danger/20"
          )}
        />
      </div>
      {error && <p className="text-[11px] text-danger">{error}</p>}
    </div>
  );
}

export function StepFeeDetails({
  form,
  errors,
  onChange,
  onClearError,
}: StepFeeDetailsProps) {
  const classPreset = React.useMemo(
    () => getDefaultFeeScheduleForClass(form.applyingClass),
    [form.applyingClass]
  );
  const totals = React.useMemo(
    () => calculateAdmissionFeeTotals(form),
    [form]
  );

  const handleFeeFieldChange = (
    field:
      | "admissionFee"
      | "tuitionFee"
      | "securityDeposit"
      | "annualCharges"
      | "transportFee"
      | "discountAmount",
    raw: string
  ) => {
    onChange(field, raw);
    onChange("feeCustomized", true);
    onClearError(field);

    const nextDraft = { ...form, [field]: raw };
    const nextTotals = calculateAdmissionFeeTotals(nextDraft);
    if (form.feeStatus === "Paid") {
      onChange("paidAmount", String(nextTotals.netPayable));
    } else if (form.feeStatus === "Unpaid") {
      onChange("paidAmount", "0");
    }
  };

  const handleFeeStatusChange = (nextStatus: FeeStatus) => {
    onChange("feeStatus", nextStatus);
    onClearError("paidAmount");
    if (nextStatus === "Paid") {
      onChange("paidAmount", String(totals.netPayable));
    } else if (nextStatus === "Unpaid" || nextStatus === "Overdue") {
      onChange("paidAmount", "0");
    } else if (nextStatus === "Partial") {
      const half = Math.round(totals.netPayable / 2);
      if (totals.paid === 0 || totals.paid >= totals.netPayable) {
        onChange("paidAmount", String(half));
      }
    }
  };

  const handlePaidAmountChange = (raw: string) => {
    onChange("paidAmount", raw);
    onClearError("paidAmount");
    const parsed = Math.max(0, Number(raw) || 0);
    if (totals.netPayable > 0) {
      if (parsed >= totals.netPayable) {
        onChange("feeStatus", "Paid");
      } else if (parsed > 0) {
        onChange("feeStatus", "Partial");
      } else {
        onChange("feeStatus", "Unpaid");
      }
    }
  };

  const handleResetToClassDefaults = () => {
    const preset = getDefaultFeeScheduleForClass(form.applyingClass);
    const nextGross =
      preset.admissionFee +
      preset.tuitionFee +
      preset.securityDeposit +
      preset.annualCharges;
    onChange("admissionFee", String(preset.admissionFee));
    onChange("tuitionFee", String(preset.tuitionFee));
    onChange("securityDeposit", String(preset.securityDeposit));
    onChange("annualCharges", String(preset.annualCharges));
    onChange("transportFee", "0");
    onChange("discountAmount", "0");
    onChange("discountReason", "None");
    onChange("feeStatus", "Paid");
    onChange("paidAmount", String(nextGross));
    onChange("feeCustomized", false);
    onClearError("discountAmount");
    onClearError("paidAmount");
  };

  return (
    <div className="space-y-5 animate-in fade-in-0 slide-in-from-right-2 duration-200">
      {/* Card 1: Fee Schedule Breakdown */}
      <div className="rounded-xl border border-border/80 bg-card p-4 space-y-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-brand-50 text-brand flex items-center justify-center">
              <Receipt className="size-4" />
            </div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Admission Fee Schedule
            </h4>
            <span className="inline-flex items-center rounded-full bg-brand-50 border border-brand/20 px-2 py-0.5 text-[10.5px] font-semibold text-brand">
              {classPreset.tierLabel} · {form.applyingClass}
            </span>
          </div>

          {form.feeCustomized && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleResetToClassDefaults}
              className="h-7 px-2.5 text-[11px] font-medium text-muted-foreground hover:text-brand gap-1 cursor-pointer"
            >
              <RotateCcw className="size-3" />
              <span>Reset Default</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <CurrencyField
            id="adm-fee-admission"
            label="Admission Fee"
            value={form.admissionFee}
            onChange={(val) => handleFeeFieldChange("admissionFee", val)}
            error={errors.admissionFee}
          />
          <CurrencyField
            id="adm-fee-tuition"
            label="Monthly Tuition Fee"
            value={form.tuitionFee}
            onChange={(val) => handleFeeFieldChange("tuitionFee", val)}
            error={errors.tuitionFee}
          />
          <CurrencyField
            id="adm-fee-security"
            label="Security Deposit"
            value={form.securityDeposit}
            onChange={(val) => handleFeeFieldChange("securityDeposit", val)}
            error={errors.securityDeposit}
          />
          <CurrencyField
            id="adm-fee-annual"
            label="Annual & Lab Charges"
            value={form.annualCharges}
            onChange={(val) => handleFeeFieldChange("annualCharges", val)}
            error={errors.annualCharges}
          />
          <CurrencyField
            id="adm-fee-transport"
            label="Transport Fee"
            value={form.transportFee}
            onChange={(val) => handleFeeFieldChange("transportFee", val)}
            error={errors.transportFee}
          />

          <div className="space-y-1.5">
            <Label htmlFor="adm-challan-no" className="text-xs font-semibold flex items-center gap-1.5">
              <Hash className="size-3.5 text-muted-foreground" />
              Challan / Voucher #
            </Label>
            <Input
              id="adm-challan-no"
              value={form.challanNumber}
              onChange={(e) => onChange("challanNumber", e.target.value)}
              placeholder="e.g. CH-2611-4102"
              className="h-9.5 text-sm font-mono"
            />
          </div>
        </div>
      </div>

      {/* Card 2: Concession & Payment Collection */}
      <div className="rounded-xl border border-border/80 bg-card p-4 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-brand-50 text-brand flex items-center justify-center">
            <Wallet className="size-4" />
          </div>
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Concession & Payment Collection
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Concession / Discount */}
          <CurrencyField
            id="adm-fee-discount"
            label="Concession / Discount"
            value={form.discountAmount}
            onChange={(val) => handleFeeFieldChange("discountAmount", val)}
            error={errors.discountAmount}
          />

          {/* Discount Reason */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Percent className="size-3.5 text-muted-foreground" />
              Concession Category
            </Label>
            <Select
              value={form.discountReason || "None"}
              onValueChange={(val) => {
                if (val) onChange("discountReason", val);
              }}
            >
              <SelectTrigger className="h-9.5 text-sm w-full">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {ADMISSION_DISCOUNT_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Payment Status</Label>
            <Select
              value={form.feeStatus}
              onValueChange={(val) => {
                if (val) handleFeeStatusChange(val as FeeStatus);
              }}
            >
              <SelectTrigger className="h-9.5 text-sm w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid">Paid (Full Settled)</SelectItem>
                <SelectItem value="Partial">Partial Payment</SelectItem>
                <SelectItem value="Unpaid">Unpaid (Challan Issued)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount Paid Now */}
          <CurrencyField
            id="adm-fee-paid"
            label="Amount Paid"
            value={form.paidAmount}
            onChange={handlePaidAmountChange}
            error={errors.paidAmount}
          />

          {/* Payment Method */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <CreditCard className="size-3.5 text-muted-foreground" />
              Payment Method
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ADMISSION_PAYMENT_METHODS.map((method) => {
                const active = form.paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => onChange("paymentMethod", method as AdmissionPaymentMethod)}
                    className={cn(
                      "h-9.5 rounded-lg border px-2.5 text-xs font-semibold transition-all cursor-pointer truncate",
                      active
                        ? "border-brand bg-brand-50 text-brand shadow-2xs ring-2 ring-brand/15"
                        : "border-input bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {method}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Live Fee Summary Strip */}
      <div className="rounded-xl border border-brand/20 bg-brand-50/40 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border/60 bg-background px-3 py-2.5">
            <span className="text-[11px] font-medium text-muted-foreground block">
              Gross Total
            </span>
            <span className="mt-0.5 block font-mono text-sm font-bold text-foreground tabular-nums">
              Rs {formatNumber(totals.grossTotal)}
            </span>
          </div>

          <div className="rounded-lg border border-border/60 bg-background px-3 py-2.5">
            <span className="text-[11px] font-medium text-muted-foreground block">
              Concession
            </span>
            <span className="mt-0.5 block font-mono text-sm font-bold text-brand tabular-nums">
              − Rs {formatNumber(totals.discount)}
            </span>
          </div>

          <div className="rounded-lg border border-border/60 bg-background px-3 py-2.5">
            <span className="text-[11px] font-medium text-muted-foreground block">
              Net Payable
            </span>
            <span className="mt-0.5 block font-mono text-sm font-bold text-foreground tabular-nums">
              Rs {formatNumber(totals.netPayable)}
            </span>
          </div>

          <div className="rounded-lg border border-border/60 bg-background px-3 py-2.5">
            <span className="text-[11px] font-medium text-muted-foreground block">
              Balance Due
            </span>
            <span
              className={cn(
                "mt-0.5 block font-mono text-sm font-bold tabular-nums",
                totals.balanceDue === 0 ? "text-emerald-700" : "text-amber-700"
              )}
            >
              Rs {formatNumber(totals.balanceDue)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
