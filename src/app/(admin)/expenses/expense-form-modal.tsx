"use client";

import * as React from "react";
import { Check, CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionButton } from "@/components/shared/action-button";
import { formatCurrency } from "@/lib/format";
import type {
  ExpenseBudgetRecord,
  ExpenseCategory,
  ExpensePaymentMode,
  ExpenseStatus,
  ExpenseVoucherRecord,
} from "@/lib/mock/expenses";

const CAMPUS_OPTIONS = [
  "Gulberg",
  "DHA Phase 5",
  "F-8 Islamabad",
  "Clifton",
  "Bahria Town",
];

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Utilities & Power",
  "Campus Maintenance",
  "Lab & Academic Supplies",
  "IT & Digital Infrastructure",
  "Transport & Fleet Fuel",
  "Events & Sports",
  "Security & Janitorial",
  "Stationery & Printing",
];

const BUDGET_CODE_MAP: Record<ExpenseCategory, string> = {
  "Utilities & Power": "BGT-UTL-01",
  "Campus Maintenance": "BGT-MNT-02",
  "Lab & Academic Supplies": "BGT-LAB-03",
  "IT & Digital Infrastructure": "BGT-ITC-04",
  "Transport & Fleet Fuel": "BGT-TRN-05",
  "Events & Sports": "BGT-EVT-06",
  "Security & Janitorial": "BGT-SEC-07",
  "Stationery & Printing": "BGT-STN-08",
};

interface ExpenseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: ExpenseVoucherRecord | null;
  totalCount: number;
  onSave: (record: ExpenseVoucherRecord) => void;
}

export function ExpenseFormModal({
  open,
  onOpenChange,
  initialData,
  totalCount,
  onSave,
}: ExpenseFormModalProps) {
  const isEditing = Boolean(initialData);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] =
    React.useState<ExpenseCategory>("Utilities & Power");
  const [department, setDepartment] = React.useState("Facilities & Estate");
  const [campus, setCampus] = React.useState("Gulberg");
  const [invoiceNo, setInvoiceNo] = React.useState("");
  const [date, setDate] = React.useState("2026-10-26");

  const [vendorName, setVendorName] = React.useState("");
  const [vendorNtn, setVendorNtn] = React.useState("NTN-4192837-1");
  const [vendorBank, setVendorBank] = React.useState("Meezan Bank Ltd.");
  const [vendorAccountNo, setVendorAccountNo] =
    React.useState("MEZN-0201-88192011");

  const [grossAmount, setGrossAmount] = React.useState("150000");
  const [taxAmount, setTaxAmount] = React.useState("12000");
  const [whtDeduction, setWhtDeduction] = React.useState("6000");
  const [paymentMode, setPaymentMode] =
    React.useState<ExpensePaymentMode>("Bank Transfer");
  const [requestedBy, setRequestedBy] = React.useState(
    "Engr. Tariq Mehmood"
  );
  const [status, setStatus] = React.useState<ExpenseStatus>("Pending");

  React.useEffect(() => {
    if (!open) return;
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setCategory(initialData.category);
      setDepartment(initialData.department);
      setCampus(initialData.campus);
      setInvoiceNo(initialData.invoiceNo);
      setDate(initialData.date);
      setVendorName(initialData.vendorName);
      setVendorNtn(initialData.vendorNtn);
      setVendorBank(initialData.vendorBank);
      setVendorAccountNo(initialData.vendorAccountNo);
      setGrossAmount(String(initialData.grossAmount));
      setTaxAmount(String(initialData.taxAmount));
      setWhtDeduction(String(initialData.whtDeduction));
      setPaymentMode(initialData.paymentMode);
      setRequestedBy(initialData.requestedBy);
      setStatus(initialData.status);
    } else {
      const nextNum = 401 + totalCount;
      setTitle("");
      setDescription("");
      setCategory("Utilities & Power");
      setDepartment("Facilities & Estate");
      setCampus("Gulberg");
      setInvoiceNo(`INV-2610-${nextNum}`);
      setDate(new Date().toISOString().slice(0, 10));
      setVendorName("");
      setVendorNtn("NTN-4192837-1");
      setVendorBank("Meezan Bank Ltd.");
      setVendorAccountNo("MEZN-0201-88192011");
      setGrossAmount("150000");
      setTaxAmount("12000");
      setWhtDeduction("6000");
      setPaymentMode("Bank Transfer");
      setRequestedBy("Department Head");
      setStatus("Pending");
    }
  }, [open, initialData, totalCount]);

  const numericGross = Math.max(0, Number(grossAmount) || 0);
  const numericTax = Math.max(0, Number(taxAmount) || 0);
  const numericWht = Math.max(0, Number(whtDeduction) || 0);
  const computedNet = Math.max(0, numericGross + numericTax - numericWht);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !vendorName.trim() || numericGross <= 0) {
      toast.error(
        "Please provide an Expense Title, Vendor Name, and valid Gross Amount."
      );
      return;
    }

    const seq = 400 + totalCount + 1;
    const voucherNo = initialData?.voucherNo ?? `EXP-2610-${seq}`;

    const record: ExpenseVoucherRecord = {
      id: initialData?.id ?? `exp-${Date.now()}`,
      voucherNo,
      invoiceNo: invoiceNo.trim() || `INV-2610-${seq}`,
      date,
      title: title.trim(),
      description:
        description.trim() ||
        `${title.trim()} (${category} — ${campus} Campus)`,
      category,
      department: department.trim() || "Operations",
      campus,
      vendorName: vendorName.trim(),
      vendorNtn: vendorNtn.trim(),
      vendorPhone: initialData?.vendorPhone ?? "042-35719283",
      vendorBank: vendorBank.trim(),
      vendorAccountNo: vendorAccountNo.trim(),
      grossAmount: numericGross,
      taxAmount: numericTax,
      whtDeduction: numericWht,
      netPayable: computedNet,
      paymentMode,
      paymentRef:
        status === "Paid"
          ? initialData?.paymentRef &&
            !initialData.paymentRef.startsWith("PENDING")
            ? initialData.paymentRef
            : `FT-2610-${Math.floor(100000 + Math.random() * 899999)}`
          : "PENDING-AUTH",
      paidDate: status === "Paid" ? date : "—",
      requestedBy: requestedBy.trim() || "Department Head",
      approvedBy:
        status === "Paid" || status === "Approved"
          ? "Hamza Tariq (Super Admin)"
          : "Pending Review",
      status,
      budgetHeadCode: BUDGET_CODE_MAP[category] ?? "BGT-GEN-01",
      auditTrail: initialData?.auditTrail ?? [
        {
          id: `aud-${Date.now()}`,
          timestamp: `${date} 10:00 AM`,
          actor: requestedBy.trim() || "Department Head",
          role: "Department Requisitioner",
          action: "Expense voucher recorded in institutional ledger",
          status: status === "Paid" ? "Paid" : "Submitted",
        },
      ],
    };

    onSave(record);
    onOpenChange(false);
    toast.success(
      isEditing
        ? `Expense voucher ${record.voucherNo} updated.`
        : `Expense voucher ${record.voucherNo} (${formatCurrency(
            record.netPayable
          )}) recorded.`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-h-[calc(100vh-3rem)] sm:max-w-2xl gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        <DialogHeader className="shrink-0 bg-gradient-to-r from-[#091d3e]/[0.04] via-white to-white px-6 py-4 border-b border-border/70">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[#091d3e] text-white">
              <CreditCard className="size-4" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {isEditing
                  ? "Edit Institutional Expense Voucher"
                  : "Record Institutional Expense Voucher"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Log vendor invoice, category budget head, taxation, and disbursement details.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs"
        >
          {/* Section 1: Expense Head & Scope */}
          <div className="rounded-xl border border-border/80 bg-slate-50/50 p-4 space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#091d3e]">
              1. Expense Classification &amp; Campus
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Expense Title / Purpose
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Commercial Electricity Bill"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Invoice #
                </label>
                <input
                  type="text"
                  required
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Expense Category
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as ExpenseCategory)
                  }
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-2.5 text-xs text-foreground"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Department
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Campus
                </label>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-2.5 text-xs text-foreground"
                >
                  {CAMPUS_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                Detailed Narration / Scope
              </label>
              <input
                type="text"
                placeholder="Brief justification and billing scope…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs text-foreground"
              />
            </div>
          </div>

          {/* Section 2: Vendor & Banking */}
          <div className="rounded-xl border border-border/80 bg-slate-50/50 p-4 space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#091d3e]">
              2. Vendor / Payee &amp; Banking Details
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Vendor / Payee Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LESCO Commercial / Sigma Labs"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Vendor Tax NTN / STRN #
                </label>
                <input
                  type="text"
                  value={vendorNtn}
                  onChange={(e) => setVendorNtn(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Beneficiary Bank
                </label>
                <input
                  type="text"
                  value={vendorBank}
                  onChange={(e) => setVendorBank(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Vendor Account / IBAN
                </label>
                <input
                  type="text"
                  value={vendorAccountNo}
                  onChange={(e) => setVendorAccountNo(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financial & Taxation */}
          <div className="rounded-xl border border-brand/20 bg-brand-50/25 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#091d3e]">
                3. Financial &amp; Taxation Breakdown (PKR)
              </h4>
              <span className="font-mono text-xs font-extrabold text-emerald-700">
                Net Payable: {formatCurrency(computedNet)}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Gross Amount (Rs)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={grossAmount}
                  onChange={(e) => setGrossAmount(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs font-bold text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  GST / Sales Tax (+)
                </label>
                <input
                  type="number"
                  min={0}
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  WHT Deducted (-)
                </label>
                <input
                  type="number"
                  min={0}
                  value={whtDeduction}
                  onChange={(e) => setWhtDeduction(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs text-danger"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) =>
                    setPaymentMode(e.target.value as ExpensePaymentMode)
                  }
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-2.5 text-xs text-foreground"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Crossed Cheque">Crossed Cheque</option>
                  <option value="Corporate Card">Corporate Card</option>
                  <option value="Petty Cash">Petty Cash</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Requisitioned By
                </label>
                <input
                  type="text"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ExpenseStatus)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-2.5 text-xs text-foreground"
                >
                  <option value="Pending">Pending Approval</option>
                  <option value="Approved">Approved for Payment</option>
                  <option value="Paid">Paid (Disbursed)</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <ActionButton
              tone="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </ActionButton>
            <ActionButton type="submit" tone="primary" size="sm">
              <Check className="size-3.5" />
              <span>
                {isEditing ? "Save Voucher Changes" : "Record Expense Voucher"}
              </span>
            </ActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ───────────────────── Category Budget Allocation View/Edit Modal ───────────────────── */

interface BudgetViewModalProps {
  budget: ExpenseBudgetRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateBudget?: (
    budgetId: string,
    monthlyAllocation: number,
    custodian: string
  ) => void;
}

export function BudgetViewModal({
  budget,
  open,
  onOpenChange,
  onUpdateBudget,
}: BudgetViewModalProps) {
  const [monthlyAlloc, setMonthlyAlloc] = React.useState("");
  const [custodian, setCustodian] = React.useState("");

  React.useEffect(() => {
    if (open && budget) {
      setMonthlyAlloc(String(budget.monthlyAllocation));
      setCustodian(budget.custodian);
    }
  }, [open, budget]);

  if (!budget) return null;

  const remaining = Math.max(
    0,
    budget.monthlyAllocation - budget.monthlySpent - budget.committedPending
  );
  const utilPct =
    budget.monthlyAllocation > 0
      ? Math.min(
          100,
          Math.round(
            ((budget.monthlySpent + budget.committedPending) /
              budget.monthlyAllocation) *
              100
          )
        )
      : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(monthlyAlloc) || budget.monthlyAllocation;
    if (onUpdateBudget) {
      onUpdateBudget(
        budget.id,
        numeric,
        custodian.trim() || budget.custodian
      );
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col sm:max-w-xl gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        <DialogHeader className="bg-gradient-to-r from-[#091d3e]/[0.04] via-white to-white px-6 py-4 border-b border-border/70">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[#091d3e] text-white">
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {budget.category} ({budget.budgetCode})
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {budget.department} · Custodian: {budget.custodian}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3 rounded-xl border border-border/70 bg-slate-50/70 p-3.5 text-center">
            <div>
              <span className="text-[10.5px] font-semibold uppercase text-muted-foreground">
                Monthly Budget
              </span>
              <p className="mt-0.5 font-mono text-sm font-bold text-[#091d3e]">
                {formatCurrency(budget.monthlyAllocation)}
              </p>
            </div>
            <div>
              <span className="text-[10.5px] font-semibold uppercase text-muted-foreground">
                Spent + Committed
              </span>
              <p className="mt-0.5 font-mono text-sm font-bold text-amber-700">
                {formatCurrency(budget.monthlySpent + budget.committedPending)}{" "}
                ({utilPct}%)
              </p>
            </div>
            <div>
              <span className="text-[10.5px] font-semibold uppercase text-muted-foreground">
                Available Balance
              </span>
              <p className="mt-0.5 font-mono text-sm font-bold text-emerald-700">
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground">
                Monthly Budget Limit (PKR)
              </label>
              <input
                type="number"
                required
                min={50000}
                value={monthlyAlloc}
                onChange={(e) => setMonthlyAlloc(e.target.value)}
                className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs font-bold text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground">
                Budget Custodian / HOD
              </label>
              <input
                type="text"
                required
                value={custodian}
                onChange={(e) => setCustodian(e.target.value)}
                className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs text-foreground"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <ActionButton
              tone="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </ActionButton>
            <ActionButton type="submit" tone="primary" size="sm">
              <Check className="size-3.5" />
              <span>Update Budget Limit</span>
            </ActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
