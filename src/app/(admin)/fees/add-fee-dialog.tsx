"use client";

import * as React from "react";
import { Check, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { ActionButton } from "@/components/shared/action-button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, fieldClass } from "../attendance/_components/attendance-kit";
import { StatusBadge } from "@/components/shared/status-badge";
import type { FeeChallan, FeeStatus } from "@/types";

const CAMPUS_OPTIONS = [
  "Gulberg",
  "DHA Phase 5",
  "F-8 Islamabad",
  "Clifton",
  "Bahria Town",
];
const GRADE_OPTIONS = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);
const SECTION_OPTIONS = ["A", "B", "C", "D"];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export type StatusOption = "auto" | FeeStatus;

interface FormState {
  student: string;
  grade: string;
  section: string;
  campus: string;
  month: string; // yyyy-mm
  dueDate: string; // yyyy-mm-dd
  totalPayable: string;
  paid: string;
  statusMode: StatusOption;
}

const INITIAL_FORM: FormState = {
  student: "",
  grade: "Grade 9",
  section: "A",
  campus: "Gulberg",
  month: "2026-10",
  dueDate: "2026-10-10",
  totalPayable: "",
  paid: "0",
  statusMode: "auto",
};

/**
 * Derives the fee challan settlement status.
 * - If paid is 0, the status is "Unpaid".
 * - If paid is between 0 and total, the status is "Partial".
 * - If paid is equal to or exceeds total, the status is "Paid".
 */
export function deriveStatus(total: number, paid: number): FeeStatus {
  if (total > 0 && paid >= total) return "Paid";
  if (paid > 0 && paid < total) return "Partial";
  return "Unpaid";
}

function formatMonthYear(ym: string): string {
  const [y, m] = ym.split("-");
  const idx = Number(m) - 1;
  return `${MONTH_NAMES[idx] ?? m} ${y}`;
}

function nextChallanNumber(existing: FeeChallan[], ym: string): string {
  const [y, m] = ym.split("-");
  const prefix = `CH-${y.slice(2)}${m}-`;
  const max = existing.reduce((acc, c) => {
    const n = Number(c.challanNumber.split("-").pop());
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 4800);
  return `${prefix}${String(max + 1).padStart(6, "0")}`;
}

export function AddFeeDialog({
  open,
  onOpenChange,
  existing,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing: FeeChallan[];
  onCreate: (challan: FeeChallan) => void;
}) {
  const [form, setForm] = React.useState<FormState>(INITIAL_FORM);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setForm(INITIAL_FORM);
      setError(null);
    }
  }, [open]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const total = Number(form.totalPayable) || 0;
  const paid = Number(form.paid) || 0;
  const autoStatus = deriveStatus(total, paid);
  const effectiveStatus: FeeStatus =
    form.statusMode === "auto" ? autoStatus : form.statusMode;
  const balance = Math.max(0, total - paid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.student.trim();
    if (!name) return setError("Student name is required.");
    if (total <= 0) return setError("Amount due must be greater than zero.");
    if (paid < 0) return setError("Paid amount cannot be negative.");
    if (paid > total) return setError("Paid amount cannot exceed the amount due.");

    onCreate({
      id: `f${Date.now()}`,
      challanNumber: nextChallanNumber(existing, form.month),
      student: name,
      className: `${form.grade}-${form.section}`,
      campus: form.campus,
      monthYear: formatMonthYear(form.month),
      dueDate: form.dueDate,
      totalPayable: total,
      paid,
      status: effectiveStatus,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-[4px] bg-gradient-to-b from-[#16345f] to-[#091d3e] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]">
              <Receipt className="size-4" />
            </span>
            Add Student Fee Detail
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1" noValidate>
          <Field label="Student Name">
            <input
              type="text"
              className={fieldClass}
              placeholder="e.g. Ahmed Raza"
              value={form.student}
              onChange={(e) => set("student", e.target.value)}
              autoFocus
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Class">
              <select
                className={fieldClass}
                value={form.grade}
                onChange={(e) => set("grade", e.target.value)}
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </Field>
            <Field label="Section">
              <select
                className={fieldClass}
                value={form.section}
                onChange={(e) => set("section", e.target.value)}
              >
                {SECTION_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Campus">
              <select
                className={fieldClass}
                value={form.campus}
                onChange={(e) => set("campus", e.target.value)}
              >
                {CAMPUS_OPTIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Billing Month">
              <input
                type="month"
                className={fieldClass}
                value={form.month}
                onChange={(e) => {
                  const m = e.target.value;
                  setForm((f) => ({
                    ...f,
                    month: m,
                    dueDate: m ? `${m}-10` : f.dueDate,
                  }));
                }}
              />
            </Field>
            <Field label="Due Date">
              <input
                type="date"
                className={fieldClass}
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Amount Due (Rs)">
              <input
                type="number"
                min={0}
                className={cn(fieldClass, "tabular-nums")}
                placeholder="e.g. 24500"
                value={form.totalPayable}
                onChange={(e) => set("totalPayable", e.target.value)}
              />
            </Field>
            <Field label="Amount Paid (Rs)">
              <input
                type="number"
                min={0}
                className={cn(fieldClass, "tabular-nums")}
                placeholder="e.g. 24500"
                value={form.paid}
                onChange={(e) => set("paid", e.target.value)}
              />
            </Field>
            <Field label="Status">
              <select
                className={fieldClass}
                value={form.statusMode}
                onChange={(e) => set("statusMode", e.target.value as StatusOption)}
              >
                <option value="auto">Auto ({autoStatus})</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 divide-x divide-border/60 rounded-[4px] border border-brand/15 bg-brand-50/40 py-2.5 text-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Balance
              </p>
              <p className="mt-0.5 text-sm font-bold tabular-nums text-foreground">
                {formatCurrency(balance)}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Status
              </p>
              <div className="mt-1 flex items-center justify-center">
                <StatusBadge status={effectiveStatus} />
              </div>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-[4px] border border-danger/30 bg-danger-soft/50 px-3 py-2 text-xs font-medium text-danger"
            >
              {error}
            </p>
          )}

          <DialogFooter className="flex items-center justify-end gap-2 pt-1">
            <ActionButton tone="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </ActionButton>
            <ActionButton type="submit" tone="primary">
              <Check />
              Save Fee Detail
            </ActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
