"use client";

import * as React from "react";
import {
  AlertCircle,
  Check,
  Clock,
  Receipt,
  Calculator,
  Plus,
  X,
  Award,
} from "lucide-react";
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
import type { FeeRevisionRecord } from "@/lib/mock/finance";
import { resolveMatchingTier, calculatePreviousMonthDues, readFeeScholarships } from "@/lib/mock/finance-storage";
import { useBranches } from "@/context/branches-context";

const CAMPUS_OPTIONS = [
  "Gulberg",
  "DHA Phase 5",
  "F-8 Islamabad",
  "Clifton",
  "Bahria Town",
];
const GRADE_OPTIONS = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);
const SECTION_OPTIONS = ["A", "B", "C", "D"];
const PAYMENT_METHODS = [
  "Cash Counter",
  "Bank Transfer",
  "Online Banking",
  "JazzCash",
  "Direct Debit",
];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export type StatusOption = "auto" | FeeStatus;

export interface FeeChargeItem {
  id: string;
  name: string;
  amount: string;
}

interface FormState {
  student: string;
  rollNo?: string;
  grade: string;
  section: string;
  campus: string;
  month: string; // yyyy-mm
  dueDate: string; // yyyy-mm-dd
  // Payment settlement
  paid: string;
  collectDate: string;
  paymentMethod: string;
  statusMode: StatusOption;
}

const INITIAL_FORM: FormState = {
  student: "",
  rollNo: "",
  grade: "Grade 9",
  section: "A",
  campus: "Gulberg",
  month: "2026-10",
  dueDate: "2026-10-10",
  paid: "0",
  collectDate: "2026-10-08",
  paymentMethod: "Cash Counter",
  statusMode: "auto",
};

/**
 * Derives the fee challan settlement status.
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

function getGradeFeeDefaults(gradeStr: string, tiers?: FeeRevisionRecord[]) {
  const tier = tiers ? resolveMatchingTier(gradeStr, tiers) : undefined;
  if (!tier) {
    return {
      tuitionFee: "18500",
      labCharges: "2500",
      sportsCharges: "1000",
      transportCharges: "0",
      fineCharges: "0",
      otherCharges: "3200",
    };
  }
  const otherSum = (tier.libraryFund || 0) + (tier.utilitySurcharge || 0) + (tier.otherCharges || 0);
  return {
    tuitionFee: String(tier.tuitionFee || 18500),
    labCharges: String(tier.labCharges || 2500),
    sportsCharges: String(tier.sportsCharges || 1000),
    transportCharges: "0",
    fineCharges: "0",
    otherCharges: String(otherSum || 3200),
  };
}

function getInitialCharges(gradeStr: string, tiers?: FeeRevisionRecord[]): FeeChargeItem[] {
  const defaults = getGradeFeeDefaults(gradeStr, tiers);
  return [
    { id: "c-tuition", name: "Tuition Fee", amount: defaults.tuitionFee },
    { id: "c-lab", name: "Lab Charges", amount: defaults.labCharges },
    { id: "c-sports", name: "Sports Charges", amount: defaults.sportsCharges },
    { id: "c-transport", name: "Transport Charges", amount: defaults.transportCharges },
    { id: "c-fine", name: "Fine Charges", amount: defaults.fineCharges },
    { id: "c-other", name: "Other Charges", amount: defaults.otherCharges },
  ];
}

export function AddFeeDialog({
  open,
  onOpenChange,
  existing,
  onCreate,
  feeTiers,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing: FeeChallan[];
  onCreate: (challan: FeeChallan) => void;
  feeTiers?: FeeRevisionRecord[];
}) {
  const { activeBranches } = useBranches();
  const campusList = React.useMemo(() => activeBranches.map((b) => b.campusName.split("—")[0].trim()), [activeBranches]);
  const [form, setForm] = React.useState<FormState>(INITIAL_FORM);
  const [charges, setCharges] = React.useState<FeeChargeItem[]>(() =>
    getInitialCharges(INITIAL_FORM.grade, feeTiers)
  );
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setForm({
        ...INITIAL_FORM,
        paid: "0",
        collectDate: "2026-10-08",
        statusMode: "auto",
      });
      setCharges(getInitialCharges(INITIAL_FORM.grade, feeTiers));
      setError(null);
    }
  }, [open, feeTiers]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Dynamic Charge Handlers
  const handleChargeChange = (id: string, field: "name" | "amount", value: string) => {
    setCharges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleAddCharge = () => {
    const newId = `ch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setCharges((prev) => [...prev, { id: newId, name: "", amount: "" }]);
  };

  const handleRemoveCharge = (id: string) => {
    setCharges((prev) => prev.filter((c) => c.id !== id));
  };

  // Calculate sum of individual dynamic charge heads
  const totalCharges = React.useMemo(() => {
    return charges.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  }, [charges]);

  const priorInfo = React.useMemo(() => {
    if (!form.student.trim()) return null;
    const tempChallan: FeeChallan = {
      id: "temp",
      challanNumber: "temp",
      student: form.student.trim(),
      className: `${form.grade}-${form.section}`,
      campus: form.campus,
      monthYear: formatMonthYear(form.month),
      dueDate: form.dueDate,
      totalPayable: 0,
      paid: 0,
      status: "Unpaid",
    };
    const res = calculatePreviousMonthDues(tempChallan, existing);
    return res.total > 0 ? res : null;
  }, [form.student, form.grade, form.section, form.campus, form.month, form.dueDate, existing]);

  const activeScholarship = React.useMemo(() => {
    if (!form.student.trim()) return null;
    const schs = readFeeScholarships();
    const stName = form.student.trim().toLowerCase();
    const rollClean = form.rollNo ? form.rollNo.replace(/\D/g, "") : "";
    return schs.find(
      (s) =>
        s.status === "Active" &&
        (s.student.trim().toLowerCase() === stName ||
          (rollClean && s.rollNo.replace(/\D/g, "") === rollClean))
    );
  }, [form.student, form.rollNo]);

  const scholarshipDeduction = activeScholarship ? activeScholarship.monthlyValue : 0;
  const previousDues = priorInfo ? priorInfo.total : 0;
  const total = Math.max(0, totalCharges + previousDues - scholarshipDeduction);
  const paid = Number(form.paid) || 0;
  const autoStatus = deriveStatus(total, paid);
  const effectiveStatus: FeeStatus =
    form.statusMode === "auto" ? autoStatus : form.statusMode;
  const balance = Math.max(0, total - paid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.student.trim();
    if (!name) return setError("Student name is required.");
    if (total <= 0) return setError("Total fee charges must be greater than zero.");
    if (paid < 0) return setError("Paid amount cannot be negative.");
    if (paid > total) {
      return setError(
        `Paid amount (Rs ${paid.toLocaleString()}) cannot exceed the total payable amount (Rs ${total.toLocaleString()}).`
      );
    }
    if (!form.dueDate) return setError("Due date is required.");

    const collectionDate = form.collectDate || form.dueDate || "2026-10-08";
    const paymentDate = paid > 0 ? collectionDate : undefined;

    // Categorize charges into standard fields and custom heads
    let tuition = 0;
    let lab = 0;
    let sports = 0;
    let transport = 0;
    let fine = 0;
    let other = 0;
    const customHeads: Array<{ id: string; name: string; amount: number }> = [];

    charges.forEach((c) => {
      const chargeName = c.name.trim();
      const amt = Math.max(0, parseFloat(c.amount) || 0);
      const lower = chargeName.toLowerCase();

      if (lower.includes("tuition")) {
        tuition += amt;
      } else if (lower.includes("lab")) {
        lab += amt;
      } else if (lower.includes("sport")) {
        sports += amt;
      } else if (lower.includes("transport") || lower.includes("van") || lower.includes("bus")) {
        transport += amt;
      } else if (lower.includes("fine") || lower.includes("penalty")) {
        fine += amt;
      } else if (lower === "other" || lower === "other charges" || lower.includes("other")) {
        other += amt;
      } else if (chargeName) {
        customHeads.push({
          id: c.id,
          name: chargeName,
          amount: amt,
        });
      }
    });

    onCreate({
      id: `f${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      challanNumber: nextChallanNumber(existing, form.month),
      student: name,
      rollNo: form.rollNo?.trim() || `Roll #${Math.floor(Math.random() * 40) + 10}`,
      className: `${form.grade}-${form.section}`,
      campus: form.campus,
      monthYear: formatMonthYear(form.month),
      dueDate: form.dueDate,
      tuitionFee: tuition,
      labCharges: lab,
      sportsCharges: sports,
      transportCharges: transport,
      fineCharges: fine,
      otherCharges: other,
      scholarshipConcession: activeScholarship ? activeScholarship.monthlyValue : undefined,
      scholarshipPercent: activeScholarship ? activeScholarship.concessionPercent : undefined,
      scholarshipName: activeScholarship ? activeScholarship.scholarshipName : undefined,
      scholarshipAwardNo: activeScholarship ? activeScholarship.awardNo : undefined,
      customHeads: customHeads.length > 0 ? customHeads : undefined,
      totalPayable: total,
      paid,
      status: effectiveStatus,
      collectDate: collectionDate,
      lastPaymentDate: paymentDate,
      lastPaymentMethod: form.paymentMethod || "Cash Counter",
      lastReceiptNumber: paid > 0 ? `RCP-${Date.now().toString().slice(-6)}` : undefined,
      lastPaymentAmount: paid > 0 ? paid : undefined,
      payments: paid > 0 ? [
        {
          id: `pay-${Date.now()}`,
          receiptNumber: `RCP-${Date.now().toString().slice(-6)}`,
          paymentDate: collectionDate,
          paymentMethod: form.paymentMethod,
          amount: paid,
        },
      ] : undefined,
      previousDues: previousDues,
      previousDuesBreakdown: priorInfo ? priorInfo.priorChallans : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="pb-2 border-b border-border/60">
          <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
            <Receipt className="size-5 text-brand" />
            <span>Add Student Fee Detail</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1" noValidate>
          {/* ── Section 1: Student Information ── */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Field label="Student Name *">
                <input
                  type="text"
                  className={fieldClass}
                  placeholder="e.g. Ahmed Raza"
                  value={form.student}
                  onChange={(e) => set("student", e.target.value)}
                  autoFocus
                  required
                />
              </Field>
            </div>
            <div>
              <Field label="Roll No (Optional)">
                <input
                  type="text"
                  className={fieldClass}
                  placeholder="e.g. Roll #15"
                  value={form.rollNo ?? ""}
                  onChange={(e) => set("rollNo", e.target.value)}
                />
              </Field>
            </div>
          </div>

          {/* Active Scholarship Detection Banner */}
          {activeScholarship && (
            <div className="flex items-center justify-between rounded-lg border border-purple-200/90 bg-purple-50/80 px-3 py-2 text-xs text-purple-900 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded bg-purple-200 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                  <Award className="size-3" />
                </span>
                <span className="font-semibold">
                  Active Scholarship Detected: {activeScholarship.scholarshipName} ({activeScholarship.concessionPercent}% Off)
                </span>
              </div>
              <span className="font-mono font-bold text-purple-800 dark:text-purple-300">
                −Rs {activeScholarship.monthlyValue.toLocaleString()} Concession
              </span>
            </div>
          )}

          {/* ── Section 2: Class, Section & Campus ── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <Field label="Class">
                <select
                  className={fieldClass}
                  value={form.grade}
                  onChange={(e) => {
                    const nextGrade = e.target.value;
                    const defaults = getGradeFeeDefaults(nextGrade, feeTiers);
                    setForm((f) => ({ ...f, grade: nextGrade }));
                    setCharges((prev) => {
                      return prev.map((c) => {
                        const lower = c.name.toLowerCase();
                        if (lower.includes("tuition")) return { ...c, amount: defaults.tuitionFee };
                        if (lower.includes("lab")) return { ...c, amount: defaults.labCharges };
                        if (lower.includes("sport")) return { ...c, amount: defaults.sportsCharges };
                        if (lower.includes("other") || lower === "other charges") {
                          return { ...c, amount: defaults.otherCharges };
                        }
                        return c;
                      });
                    });
                  }}
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div>
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
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Field label="Campus">
                <select
                  className={fieldClass}
                  value={form.campus}
                  onChange={(e) => set("campus", e.target.value)}
                >
                  {(campusList.length > 0 ? campusList : CAMPUS_OPTIONS).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* ── Section 3: Billing Month, Due Date & Collect Date ── */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Field label="Billing Month *">
                <div className="relative">
                  <input
                    type="month"
                    className={cn(
                      fieldClass,
                      "w-full font-medium text-foreground cursor-pointer focus:ring-2 focus:ring-brand/30"
                    )}
                    value={form.month}
                    onChange={(e) => {
                      const m = e.target.value;
                      setForm((f) => ({
                        ...f,
                        month: m,
                        dueDate: m ? `${m}-10` : f.dueDate,
                        collectDate: m ? `${m}-08` : f.collectDate,
                      }));
                    }}
                  />
                </div>
              </Field>
            </div>
            <div>
              <Field label="Due Date *">
                <div className="relative">
                  <input
                    type="date"
                    className={cn(
                      fieldClass,
                      "w-full font-medium text-foreground cursor-pointer focus:ring-2 focus:ring-brand/30"
                    )}
                    value={form.dueDate}
                    onChange={(e) => set("dueDate", e.target.value)}
                  />
                </div>
              </Field>
            </div>
            <div>
              <Field label="Collect Date *">
                <div className="relative">
                  <input
                    type="date"
                    className={cn(
                      fieldClass,
                      "w-full font-medium text-foreground cursor-pointer focus:ring-2 focus:ring-brand/30"
                    )}
                    value={form.collectDate}
                    onChange={(e) => set("collectDate", e.target.value)}
                  />
                </div>
              </Field>
            </div>
          </div>

          {/* ── Prior Unpaid Dues Notice (if detected) ── */}
          {priorInfo && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50/80 p-2.5 text-xs text-amber-900">
              <Clock className="size-4 shrink-0 text-amber-600" />
              <span>
                <strong>Prior Arrears Detected:</strong> Rs {priorInfo.total.toLocaleString()} across{" "}
                {priorInfo.count} unpaid {priorInfo.count === 1 ? "month" : "months"} ({priorInfo.months.join(", ")}). Added to total due automatically.
              </span>
            </div>
          )}

          {/* ── Section 4: Dynamic Itemized Fee Heads & Charges ── */}
          <div className="rounded-xl border border-brand/20 bg-muted/20 p-3.5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Calculator className="size-4 text-brand" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Itemized Fee Heads &amp; Charges (Rs)
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-brand bg-brand-50 px-2 py-0.5 rounded border border-brand/15">
                  Subtotal: {formatCurrency(totalCharges)}
                </span>
                <button
                  type="button"
                  onClick={handleAddCharge}
                  className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100 shadow-2xs"
                >
                  <Plus className="size-3.5" />
                  <span>Add Charge</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-0.5">
              {charges.map((charge) => (
                <div key={charge.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Fee head / charge name (e.g. Tuition Fee)"
                    value={charge.name}
                    onChange={(e) => handleChargeChange(charge.id, "name", e.target.value)}
                    className={cn(
                      fieldClass,
                      "h-8 flex-1 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 shadow-2xs"
                    )}
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Amount"
                    value={charge.amount}
                    onChange={(e) => handleChargeChange(charge.id, "amount", e.target.value)}
                    className={cn(
                      fieldClass,
                      "h-8 w-32 sm:w-36 text-right font-mono text-xs font-semibold tabular-nums text-foreground shadow-2xs"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCharge(charge.id)}
                    title={`Remove ${charge.name || "charge"}`}
                    className="flex size-8 shrink-0 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-700 shadow-2xs"
                    aria-label="Remove charge"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}

              {charges.length === 0 && (
                <div className="rounded-lg border border-dashed border-border/80 p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    No charges added. Click &quot;Add Charge&quot; to add a fee head.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Section 5: Payment Collection & Status ── */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Amount Paid (Rs)">
              <input
                type="number"
                min={0}
                className={cn(fieldClass, "tabular-nums font-mono font-semibold")}
                placeholder="0"
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

            <Field label="Payment Method">
              <select
                className={fieldClass}
                value={form.paymentMethod}
                onChange={(e) => set("paymentMethod", e.target.value)}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* ── Section 6: Real-time Settlement Summary Box ── */}
          <div className="grid grid-cols-4 divide-x divide-border/60 rounded-xl border border-brand/20 bg-brand-50/50 py-3 text-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Due
              </p>
              <p className="mt-0.5 text-sm font-bold font-mono tabular-nums text-foreground">
                {formatCurrency(total)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Paid
              </p>
              <p className="mt-0.5 text-sm font-bold font-mono tabular-nums text-emerald-600">
                {formatCurrency(paid)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Remaining Balance
              </p>
              <p className="mt-0.5 text-sm font-bold font-mono tabular-nums text-foreground">
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
              className="rounded-lg border border-danger/30 bg-danger-soft/50 px-3 py-2 text-xs font-medium text-danger flex items-center gap-1.5"
            >
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
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
