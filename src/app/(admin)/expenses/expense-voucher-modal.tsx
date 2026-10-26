"use client";

import * as React from "react";
import {
  Banknote,
  Building2,
  Check,
  Copy,
  CreditCard,
  Download,
  Edit,
  FileText,
  Landmark,
  Printer,
  Receipt,
  ShieldCheck,
} from "lucide-react";
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
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/format";
import type {
  ExpenseAuditEntry,
  ExpensePaymentMode,
  ExpenseStatus,
  ExpenseVoucherRecord,
} from "@/lib/mock/expenses";
import {
  exportSingleExpenseVoucherPdf,
  printSingleExpenseVoucher,
} from "./expenses-export";

interface ExpenseVoucherModalProps {
  voucher: ExpenseVoucherRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: "overview" | "settle" | "audit";
  onSettleVoucher?: (
    voucherId: string,
    payload: {
      status: ExpenseStatus;
      paymentMode: ExpensePaymentMode;
      paymentRef: string;
      approvedBy: string;
      remarks: string;
    }
  ) => void;
  onEditVoucher?: (voucher: ExpenseVoucherRecord) => void;
}

export function ExpenseVoucherModal({
  voucher,
  open,
  onOpenChange,
  initialTab = "overview",
  onSettleVoucher,
  onEditVoucher,
}: ExpenseVoucherModalProps) {
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "settle" | "audit"
  >(initialTab);

  const [newStatus, setNewStatus] = React.useState<ExpenseStatus>("Paid");
  const [paymentMode, setPaymentMode] =
    React.useState<ExpensePaymentMode>("Bank Transfer");
  const [paymentRef, setPaymentRef] = React.useState("");
  const [approvedBy, setApprovedBy] = React.useState(
    "Hamza Tariq (Super Admin)"
  );
  const [remarks, setRemarks] = React.useState("");

  React.useEffect(() => {
    if (open && voucher) {
      setActiveTab(initialTab);
      setNewStatus(voucher.status === "Paid" ? "Paid" : "Paid");
      setPaymentMode(voucher.paymentMode);
      setPaymentRef(
        voucher.paymentRef && !voucher.paymentRef.startsWith("PENDING")
          ? voucher.paymentRef
          : `FT-2610-${Math.floor(100000 + Math.random() * 899999)}`
      );
      setApprovedBy(
        voucher.approvedBy !== "Pending Review"
          ? voucher.approvedBy
          : "Hamza Tariq (Super Admin)"
      );
      setRemarks(
        `Verified against budget head ${voucher.budgetHeadCode} and settled.`
      );
    }
  }, [open, voucher, initialTab]);

  if (!voucher) return null;

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`, {
        description: text,
      });
    }
  };

  const handleSubmitSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSettleVoucher) {
      onSettleVoucher(voucher.id, {
        status: newStatus,
        paymentMode,
        paymentRef: paymentRef.trim() || "FT-2610-VERIFIED",
        approvedBy: approvedBy.trim() || "Hamza Tariq (Super Admin)",
        remarks:
          remarks.trim() || "Processed via institutional expense control.",
      });
      setActiveTab("overview");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-h-[calc(100vh-3rem)] sm:max-w-3xl gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        {/* Header */}
        <DialogHeader className="shrink-0 gap-1 bg-gradient-to-r from-[#091d3e]/[0.04] via-white to-white px-6 py-4.5">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#091d3e] text-white shadow-xs">
                <Receipt className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-base font-bold leading-tight text-foreground">
                    {voucher.title}
                  </DialogTitle>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <StatusBadge status={voucher.status} />
                  <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/70 px-2 py-0.5 font-mono text-[11px] font-bold text-[#091d3e]">
                    {voucher.voucherNo}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700">
                    {voucher.budgetHeadCode}
                  </span>
                  <DialogDescription className="font-mono text-xs text-muted-foreground">
                    {voucher.category} · {voucher.campus}
                  </DialogDescription>
                </div>
              </div>
            </div>
            <div className="hidden sm:block text-right shrink-0">
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                Vendor Invoice #
              </p>
              <button
                type="button"
                onClick={() => handleCopy(voucher.invoiceNo, "Invoice Number")}
                className="mt-0.5 inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-slate-50 px-2 py-0.5 font-mono text-xs font-bold text-[#091d3e] hover:border-brand/40 cursor-pointer"
              >
                <span>{voucher.invoiceNo}</span>
                <Copy className="size-3 text-muted-foreground" />
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* 4-Column Financial & Tax Strip */}
        <dl className="grid shrink-0 grid-cols-2 divide-x divide-y divide-border/70 border-y border-border/70 bg-slate-50/70 sm:grid-cols-4 sm:divide-y-0">
          <div className="px-4 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">
              Gross Invoice Amount
            </dt>
            <dd className="mt-0.5 font-mono text-sm font-bold tabular-nums text-foreground">
              {formatCurrency(voucher.grossAmount)}
            </dd>
          </div>
          <div className="px-4 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">
              GST / Sales Tax
            </dt>
            <dd className="mt-0.5 font-mono text-sm font-bold tabular-nums text-foreground">
              +{formatCurrency(voucher.taxAmount)}
            </dd>
          </div>
          <div className="px-4 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">
              Withholding Tax (WHT)
            </dt>
            <dd className="mt-0.5 font-mono text-sm font-bold tabular-nums text-danger">
              -{formatCurrency(voucher.whtDeduction)}
            </dd>
          </div>
          <div className="px-4 py-2.5 bg-emerald-50/45">
            <div className="flex items-center justify-between">
              <dt className="text-[11px] font-semibold text-emerald-800">
                Net Payable
              </dt>
              {voucher.status !== "Paid" && activeTab !== "settle" && (
                <button
                  type="button"
                  onClick={() => setActiveTab("settle")}
                  className="inline-flex items-center gap-1 rounded bg-emerald-700 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-2xs hover:bg-emerald-800 cursor-pointer"
                >
                  <Check className="size-2.5" />
                  <span>Settle</span>
                </button>
              )}
            </div>
            <dd className="mt-0.5 font-mono text-sm font-extrabold tabular-nums text-emerald-700">
              {formatCurrency(voucher.netPayable)}
            </dd>
          </div>
        </dl>

        {/* Sub-Navigation Bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/70 bg-white px-6 py-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                activeTab === "overview"
                  ? "bg-[#091d3e] text-white shadow-xs"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
              )}
            >
              <CreditCard className="size-3.5" />
              <span>Voucher &amp; Vendor Breakdown</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("settle")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                activeTab === "settle"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
              )}
            >
              <Check className="size-3.5" />
              <span>Approve &amp; Settle Payment</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("audit")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                activeTab === "audit"
                  ? "bg-[#091d3e] text-white shadow-xs"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
              )}
            >
              <FileText className="size-3.5" />
              <span>Approval &amp; Audit Trail</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 font-mono text-[10px]",
                  activeTab === "audit"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200/80 text-foreground"
                )}
              >
                {voucher.auditTrail.length}
              </span>
            </button>
          </div>
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>
              Date:{" "}
              <strong className="text-foreground">
                {formatDate(voucher.date)}
              </strong>
            </span>
          </span>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-xs">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Quick Approval / Disbursal Banner */}
              {voucher.status !== "Paid" && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white shadow-2xs">
                      <Banknote className="size-4" />
                    </span>
                    <div>
                      <p className="font-semibold text-emerald-950">
                        Voucher Awaiting Settlement:{" "}
                        <span className="font-mono font-bold text-emerald-700">
                          {formatCurrency(voucher.netPayable)}
                        </span>
                      </p>
                      <p className="text-[11px] text-emerald-800/90">
                        Payee: <strong>{voucher.vendorName}</strong> ·{" "}
                        {voucher.vendorBank} ({voucher.vendorAccountNo})
                      </p>
                    </div>
                  </div>
                  <ActionButton
                    tone="success"
                    size="sm"
                    onClick={() => setActiveTab("settle")}
                  >
                    <Check className="size-3.5" />
                    <span>Approve &amp; Pay Voucher</span>
                  </ActionButton>
                </div>
              )}

              {/* Narration Box */}
              <div className="rounded-xl border border-border/80 bg-slate-50/60 p-3.5">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                  Expense Narration &amp; Scope
                </span>
                <p className="mt-1 text-xs leading-relaxed text-foreground">
                  {voucher.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Left: Financial & Tax Breakdown */}
                <div className="flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-white shadow-2xs">
                  <div className="flex items-center justify-between border-b border-border/60 bg-slate-50/80 px-4 py-2.5">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#091d3e]">
                      <Receipt className="size-3.5 text-brand" />
                      <span>Taxation &amp; Net Calculation</span>
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-brand">
                      {voucher.budgetHeadCode}
                    </span>
                  </div>
                  <div className="divide-y divide-border/50">
                    <div className="flex items-center justify-between px-4 py-2.2">
                      <span className="text-muted-foreground">
                        Gross Vendor Invoice
                      </span>
                      <span className="font-mono font-semibold tabular-nums text-foreground">
                        {formatCurrency(voucher.grossAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.2">
                      <span className="text-muted-foreground">
                        Add: Sales Tax / GST
                      </span>
                      <span className="font-mono tabular-nums text-foreground">
                        +{formatCurrency(voucher.taxAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.2">
                      <span className="text-muted-foreground">
                        Less: Withholding Tax (FBR WHT)
                      </span>
                      <span className="font-mono font-semibold tabular-nums text-danger">
                        -{formatCurrency(voucher.whtDeduction)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.2">
                      <span className="text-muted-foreground">
                        Payment Channel
                      </span>
                      <span className="font-semibold text-foreground">
                        {voucher.paymentMode}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.2">
                      <span className="text-muted-foreground">
                        Transaction / Cheque Ref
                      </span>
                      <span className="font-mono font-semibold text-foreground">
                        {voucher.paymentRef}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/70 bg-emerald-50/45 px-4 py-2.5 font-bold text-emerald-950">
                    <span>Net Disbursable Amount</span>
                    <span className="font-mono text-sm tabular-nums text-emerald-700">
                      {formatCurrency(voucher.netPayable)}
                    </span>
                  </div>
                </div>

                {/* Right: Vendor & Governance Details */}
                <div className="flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-white shadow-2xs">
                  <div className="flex items-center justify-between border-b border-border/60 bg-slate-50/80 px-4 py-2.5">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#091d3e]">
                      <Building2 className="size-3.5 text-brand" />
                      <span>Vendor &amp; Approval Governance</span>
                    </span>
                    <span className="font-mono text-[10.5px] font-semibold text-muted-foreground">
                      {voucher.vendorNtn}
                    </span>
                  </div>
                  <div className="divide-y divide-border/50">
                    <div className="flex items-center justify-between px-4 py-2.2">
                      <span className="text-muted-foreground">Vendor / Payee</span>
                      <span className="font-semibold text-foreground">
                        {voucher.vendorName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.2">
                      <span className="text-muted-foreground">
                        Beneficiary Bank
                      </span>
                      <span className="font-medium text-foreground">
                        {voucher.vendorBank}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.2">
                      <span className="text-muted-foreground">Account / IBAN</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            voucher.vendorAccountNo,
                            "Vendor Account Number"
                          )
                        }
                        className="inline-flex items-center gap-1.5 font-mono font-bold text-[#091d3e] hover:text-brand cursor-pointer"
                      >
                        <span>{voucher.vendorAccountNo}</span>
                        <Copy className="size-3 text-muted-foreground" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.2">
                      <span className="text-muted-foreground">
                        Requisitioned By
                      </span>
                      <span className="font-medium text-foreground">
                        {voucher.requestedBy} ({voucher.department})
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.2">
                      <span className="text-muted-foreground">
                        Authorized By
                      </span>
                      <span className="font-semibold text-[#091d3e]">
                        {voucher.approvedBy}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/70 bg-slate-50/80 px-4 py-2.5 text-[11px]">
                    <span className="text-muted-foreground">
                      Campus: <strong>{voucher.campus}</strong>
                    </span>
                    <span className="font-mono text-muted-foreground">
                      Paid Date: {voucher.paidDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settle" && (
            <form onSubmit={handleSubmitSettlement} className="space-y-4">
              <div className="rounded-xl border border-brand/20 bg-brand-50/30 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#091d3e]">
                      Voucher Approval &amp; Disbursal Control
                    </h4>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Authorize or settle payment for{" "}
                      <strong>{voucher.voucherNo}</strong> (
                      {voucher.vendorName})
                    </p>
                  </div>
                  <span className="font-mono text-sm font-extrabold text-emerald-700">
                    Net: {formatCurrency(voucher.netPayable)}
                  </span>
                </div>

                <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Voucher Decision / Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) =>
                        setNewStatus(e.target.value as ExpenseStatus)
                      }
                      className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs font-semibold text-foreground focus:border-brand focus:outline-none"
                    >
                      <option value="Paid">
                        Approve &amp; Mark Paid (Disbursed)
                      </option>
                      <option value="Approved">
                        Approve for Treasury Disbursal
                      </option>
                      <option value="Pending">Keep Pending Audit</option>
                      <option value="Rejected">
                        Reject / Return Requisition
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Disbursement Channel
                    </label>
                    <select
                      value={paymentMode}
                      onChange={(e) =>
                        setPaymentMode(e.target.value as ExpensePaymentMode)
                      }
                      className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                    >
                      <option value="Bank Transfer">
                        Bank Transfer (IBFT / RTGS)
                      </option>
                      <option value="Crossed Cheque">Crossed Cheque</option>
                      <option value="Corporate Card">
                        Institutional Corporate Card
                      </option>
                      <option value="Petty Cash">Campus Petty Cash</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Bank / Cheque Reference #
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs font-bold text-[#091d3e] focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Approving Authority
                    </label>
                    <input
                      type="text"
                      required
                      value={approvedBy}
                      onChange={(e) => setApprovedBy(e.target.value)}
                      className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs text-foreground focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-3 space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Audit / Disbursal Remarks
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs text-foreground focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <ActionButton
                  tone="outline"
                  size="sm"
                  onClick={() => setActiveTab("overview")}
                >
                  Cancel
                </ActionButton>
                <ActionButton type="submit" tone="success" size="sm">
                  <Check className="size-3.5" />
                  <span>Confirm &amp; Update Voucher</span>
                </ActionButton>
              </div>
            </form>
          )}

          {activeTab === "audit" && (
            <div className="overflow-hidden rounded-xl border border-border/80 bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/70 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-3.5 py-2.5 text-left">Timestamp</th>
                    <th className="px-3.5 py-2.5 text-left">Officer &amp; Role</th>
                    <th className="px-3.5 py-2.5 text-left">Workflow Action</th>
                    <th className="px-3.5 py-2.5 text-center">Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {voucher.auditTrail.map((entry: ExpenseAuditEntry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/70">
                      <td className="px-3.5 py-2.5 font-mono text-[11px] text-foreground">
                        {entry.timestamp}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <p className="font-semibold text-foreground">
                          {entry.actor}
                        </p>
                        <p className="text-[10.5px] text-muted-foreground">
                          {entry.role}
                        </p>
                      </td>
                      <td className="px-3.5 py-2.5 text-foreground">
                        {entry.action}
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <StatusBadge status={entry.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="m-0 shrink-0 flex-row flex-wrap items-center justify-between gap-2.5 rounded-none border-t border-border/70 bg-muted/30 px-6 py-3.5 sm:justify-between">
          <div className="flex items-center gap-2">
            <ActionButton
              tone="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </ActionButton>
            {onEditVoucher && (
              <ActionButton
                tone="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEditVoucher(voucher);
                }}
              >
                <Edit className="size-3.5" />
                <span>Edit Voucher</span>
              </ActionButton>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== "settle" && (
              <ActionButton
                tone="success"
                size="sm"
                onClick={() => setActiveTab("settle")}
              >
                <Check className="size-3.5" />
                <span>Approve / Settle</span>
              </ActionButton>
            )}
            <ActionButton
              tone="outline"
              size="sm"
              onClick={() => {
                exportSingleExpenseVoucherPdf(voucher);
                toast.success(
                  `Expense voucher PDF downloaded (${voucher.voucherNo}).`
                );
              }}
            >
              <Download className="size-3.5" />
              <span>Download PDF</span>
            </ActionButton>
            <ActionButton
              tone="primary"
              size="sm"
              onClick={() => {
                printSingleExpenseVoucher(voucher);
                toast.info(
                  `Opening print preview for voucher ${voucher.voucherNo}…`
                );
              }}
            >
              <Printer className="size-3.5" />
              <span>Print Voucher</span>
            </ActionButton>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
