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
  Tag,
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

function formatTitle(str: string): string {
  if (!str) return "";
  if (str === str.toLowerCase()) {
    return str.replace(/\b[a-z]/g, (char) => char.toUpperCase());
  }
  return str;
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
        <DialogHeader className="shrink-0 gap-1 bg-gradient-to-r from-slate-50/90 via-white to-white px-6 py-4.5 border-b border-border/60">
          <div className="flex items-start justify-between gap-4 pr-7">
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#091d3e] to-[#1e3a66] text-white shadow-xs ring-1 ring-[#091d3e]/20">
                <Receipt className="size-5" />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold leading-tight text-foreground capitalize">
                  {formatTitle(voucher.title)}
                </DialogTitle>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={voucher.status} />
                  <span
                    className="inline-flex items-center gap-1.5 rounded-md border border-brand/20 bg-brand-50/70 px-2.5 py-0.5 text-[11px] font-bold text-[#091d3e] shadow-2xs"
                    title={`Expense Category: ${voucher.category}`}
                  >
                    <Tag className="size-3 text-brand" />
                    <span>{voucher.category}</span>
                  </span>
                  <DialogDescription className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span className="text-slate-300">•</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {voucher.voucherNo}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>{voucher.campus} Campus</span>
                  </DialogDescription>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end shrink-0 text-right">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Vendor Invoice
              </span>
              <button
                type="button"
                onClick={() => handleCopy(voucher.invoiceNo, "Invoice Number")}
                className="group mt-0.5 inline-flex items-center gap-1.5 font-mono text-[13px] font-bold text-[#091d3e] hover:text-brand transition-colors cursor-pointer"
                title="Click to copy invoice number"
              >
                <span>{voucher.invoiceNo}</span>
                <Copy className="size-3 text-muted-foreground opacity-60 group-hover:opacity-100" />
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* 4-Column Financial & Tax Strip */}
        <dl className="grid shrink-0 grid-cols-2 divide-x divide-y divide-border/70 border-b border-border/70 bg-slate-50/60 sm:grid-cols-4 sm:divide-y-0">
          <div className="px-5 py-3">
            <dt className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              Gross Invoice Amount
            </dt>
            <dd className="mt-1 font-mono text-base font-bold tabular-nums text-foreground">
              {formatCurrency(voucher.grossAmount)}
            </dd>
          </div>
          <div className="px-5 py-3">
            <dt className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              GST / Sales Tax
            </dt>
            <dd className="mt-1 font-mono text-base font-bold tabular-nums text-emerald-700">
              +{formatCurrency(voucher.taxAmount)}
            </dd>
          </div>
          <div className="px-5 py-3">
            <dt className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              Withholding Tax (WHT)
            </dt>
            <dd className="mt-1 font-mono text-base font-bold tabular-nums text-rose-600">
              -{formatCurrency(voucher.whtDeduction)}
            </dd>
          </div>
          <div className="px-5 py-3 bg-emerald-50/70">
            <dt className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-800">
              Net Disbursable
            </dt>
            <dd className="mt-1 font-mono text-base font-extrabold tabular-nums text-emerald-800">
              {formatCurrency(voucher.netPayable)}
            </dd>
          </div>
        </dl>

        {/* Sub-Navigation Bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/70 bg-slate-50/50 px-6 py-2.5">
          <div className="inline-flex items-center gap-1 rounded-xl bg-slate-200/60 p-1 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                activeTab === "overview"
                  ? "bg-white text-[#091d3e] shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/40"
              )}
            >
              <CreditCard className="size-3.5" />
              <span>Voucher &amp; Vendor Breakdown</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("settle")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                activeTab === "settle"
                  ? "bg-white text-emerald-800 shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/40"
              )}
            >
              <Check className="size-3.5" />
              <span>Approve &amp; Settle</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("audit")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                activeTab === "audit"
                  ? "bg-white text-[#091d3e] shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/40"
              )}
            >
              <FileText className="size-3.5" />
              <span>Audit Trail</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 font-mono text-[10px] font-bold",
                  activeTab === "audit"
                    ? "bg-[#091d3e] text-white"
                    : "bg-slate-300/80 text-slate-700"
                )}
              >
                {voucher.auditTrail.length}
              </span>
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium">Voucher Date:</span>
            <span className="font-semibold text-foreground">
              {formatDate(voucher.date)}
            </span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-xs">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Quick Approval / Disbursal Banner */}
              {voucher.status !== "Paid" && (
                <div className="flex flex-wrap items-center justify-between gap-3.5 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-emerald-50/60 to-teal-50/50 p-4 shadow-2xs">
                  <div className="flex items-center gap-3.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-2xs">
                      <Banknote className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-emerald-950">
                        Voucher Awaiting Treasury Settlement:{" "}
                        <span className="font-mono font-bold text-emerald-700 text-sm">
                          {formatCurrency(voucher.netPayable)}
                        </span>
                      </p>
                      <p className="mt-0.5 text-[11px] text-emerald-800/90 font-medium">
                        Payee: <strong>{formatTitle(voucher.vendorName)}</strong> ·{" "}
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

              {/* Classification & Requisition Scope Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-xs">
                <div className="rounded-lg bg-white p-3 border border-slate-200/80 shadow-2xs">
                  <span className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    <Tag className="size-3.5 text-brand" />
                    Expense Category
                  </span>
                  <p className="mt-1.5 font-bold text-foreground text-[13px] leading-snug">
                    {voucher.category}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-3 border border-slate-200/80 shadow-2xs">
                  <span className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    <Building2 className="size-3.5 text-brand" />
                    Originating Department
                  </span>
                  <p className="mt-1.5 font-bold text-[#091d3e] text-[13px] leading-snug">
                    {voucher.department}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-3 border border-slate-200/80 shadow-2xs">
                  <span className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    <Building2 className="size-3.5 text-brand" />
                    Operating Campus
                  </span>
                  <p className="mt-1.5 font-semibold text-slate-800 text-[13px] leading-snug">
                    {voucher.campus}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-3 border border-slate-200/80 shadow-2xs">
                  <span className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    <ShieldCheck className="size-3.5 text-brand" />
                    Budget Head Code
                  </span>
                  <p className="mt-1.5 font-mono font-bold text-brand text-[13px] leading-snug">
                    {voucher.budgetHeadCode}
                  </p>
                </div>
              </div>

              {/* Narration Box */}
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4">
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#091d3e]">
                  <FileText className="size-3.5 text-brand" />
                  <span>Expense Purpose &amp; Scope Narration</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-700 bg-white border border-slate-200/60 rounded-lg p-3 shadow-2xs font-normal">
                  {voucher.description && voucher.description.trim()
                    ? voucher.description
                    : "Institutional expenditure recorded for campus operations, maintenance, or academic procurement."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Left: Financial & Tax Breakdown */}
                <div className="flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-white shadow-2xs">
                  <div className="flex items-center justify-between border-b border-border/60 bg-slate-50/80 px-4 py-3 gap-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#091d3e]">
                      <Receipt className="size-3.5 text-brand shrink-0" />
                      <span>Taxation &amp; Net Calculation</span>
                    </span>
                    <span className="shrink-0 inline-flex items-center rounded bg-brand/10 border border-brand/20 px-2 py-0.5 font-mono text-[10px] font-bold text-brand shadow-2xs">
                      {voucher.budgetHeadCode}
                    </span>
                  </div>
                  <div className="divide-y divide-border/50 text-xs">
                    <div className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/50 transition-colors">
                      <span className="text-muted-foreground font-medium">
                        Gross Vendor Invoice
                      </span>
                      <span className="font-mono font-semibold tabular-nums text-foreground">
                        {formatCurrency(voucher.grossAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/50 transition-colors">
                      <span className="text-muted-foreground font-medium">
                        Add: Sales Tax / GST
                      </span>
                      <span className="font-mono font-semibold tabular-nums text-emerald-700">
                        +{formatCurrency(voucher.taxAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/50 transition-colors">
                      <span className="text-muted-foreground font-medium">
                        Less: Withholding Tax (FBR WHT)
                      </span>
                      <span className="font-mono font-semibold tabular-nums text-rose-600">
                        -{formatCurrency(voucher.whtDeduction)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/50 transition-colors">
                      <span className="text-muted-foreground font-medium">
                        Payment Channel
                      </span>
                      <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {voucher.paymentMode}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/50 transition-colors">
                      <span className="text-muted-foreground font-medium">
                        Transaction / Cheque Ref
                      </span>
                      <span className="font-mono font-semibold text-foreground text-[11px]">
                        {voucher.paymentRef}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/70 bg-emerald-50/60 px-4 py-3 font-bold text-emerald-950">
                    <span className="text-xs uppercase tracking-wider font-bold">Net Disbursable Amount</span>
                    <span className="font-mono text-sm tabular-nums text-emerald-800 font-extrabold">
                      {formatCurrency(voucher.netPayable)}
                    </span>
                  </div>
                </div>

                {/* Right: Vendor & Governance Details */}
                <div className="flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-white shadow-2xs">
                  <div className="flex items-center justify-between border-b border-border/60 bg-slate-50/80 px-4 py-3 gap-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#091d3e]">
                      <Building2 className="size-3.5 text-brand shrink-0" />
                      <span>Vendor &amp; Governance</span>
                    </span>
                    <span className="shrink-0 inline-flex items-center rounded bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 shadow-2xs">
                      NTN: {voucher.vendorNtn}
                    </span>
                  </div>
                  <div className="divide-y divide-border/50 text-xs">
                    <div className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/50 transition-colors">
                      <span className="text-muted-foreground font-medium">Vendor / Payee</span>
                      <span className="font-bold text-foreground">
                        {formatTitle(voucher.vendorName)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/50 transition-colors">
                      <span className="text-muted-foreground font-medium">
                        Beneficiary Bank
                      </span>
                      <span className="font-medium text-foreground inline-flex items-center gap-1.5">
                        <Landmark className="size-3.5 text-muted-foreground" />
                        <span>{voucher.vendorBank}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/50 transition-colors">
                      <span className="text-muted-foreground font-medium">Account / IBAN</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            voucher.vendorAccountNo,
                            "Vendor Account Number"
                          )
                        }
                        className="inline-flex items-center gap-1.5 font-mono font-bold text-[#091d3e] hover:text-brand cursor-pointer rounded px-1.5 py-0.5 hover:bg-slate-100 transition-colors"
                        title="Click to copy account number"
                      >
                        <span>{voucher.vendorAccountNo}</span>
                        <Copy className="size-3 text-muted-foreground" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/50 transition-colors">
                      <span className="text-muted-foreground font-medium">
                        Requisitioned By
                      </span>
                      <span className="font-medium text-foreground">
                        {voucher.requestedBy}{" "}
                        <span className="text-muted-foreground font-normal">({voucher.department})</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/50 transition-colors">
                      <span className="text-muted-foreground font-medium">
                        Authorized By
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-[#091d3e]">
                        <ShieldCheck className="size-3.5 text-emerald-600" />
                        <span>{voucher.approvedBy}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/70 bg-slate-50/80 px-4 py-3 text-[11px]">
                    <span className="text-muted-foreground font-medium">
                      Campus: <strong className="text-foreground">{voucher.campus}</strong>
                    </span>
                    <span className="font-mono text-muted-foreground font-medium">
                      Paid Date:{" "}
                      <span className="text-foreground font-semibold">
                        {voucher.paidDate ? formatDate(voucher.paidDate) : "—"}
                      </span>
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
                      {formatTitle(voucher.vendorName)})
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
        <DialogFooter className="m-0 shrink-0 flex-row flex-wrap items-center justify-between gap-2.5 rounded-none border-t border-border/70 bg-slate-50/80 px-6 py-3.5 sm:justify-between">
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
            {voucher.status !== "Paid" && activeTab !== "settle" && (
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
