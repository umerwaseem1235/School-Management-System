"use client";

import * as React from "react";
import {
  AlertCircle,
  Banknote,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Landmark,
  PieChart,
  Printer,
  Receipt,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingUp,
  Wallet,
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
import {
  INITIAL_EXPENSE_BUDGETS,
  type ExpenseAuditEntry,
  type ExpensePaymentMode,
  type ExpenseStatus,
  type ExpenseVoucherRecord,
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

interface VoucherLineItem {
  id: string;
  itemNo: number;
  description: string;
  specs: string;
  quantity: string;
  unitPrice: number;
  totalPrice: number;
}

function getVoucherLineItems(voucher: ExpenseVoucherRecord): VoucherLineItem[] {
  switch (voucher.voucherNo) {
    case "EXP-2610-401":
      return [
        {
          id: "li-1",
          itemNo: 1,
          description: "Off-Peak Commercial Tariff (Academic & Admin Blocks)",
          specs: "Main Substation Grid Meter # LSC-881290-A",
          quantity: "12,800 kWh",
          unitPrice: 25,
          totalPrice: 320000,
        },
        {
          id: "li-2",
          itemNo: 2,
          description: "Peak-Hours Heavy Load Surcharge (Evening Labs)",
          specs: "Tariff Category A-2 Commercial Peak",
          quantity: "2,500 kWh",
          unitPrice: 38,
          totalPrice: 95000,
        },
        {
          id: "li-3",
          itemNo: 3,
          description: "Transformer Maintenance & Net-Metering Credit Settlement",
          specs: "Quarterly inspection fee & bi-directional solar sync",
          quantity: "1 Unit",
          unitPrice: 70000,
          totalPrice: 70000,
        },
      ];
    case "EXP-2610-402":
      return [
        {
          id: "li-1",
          itemNo: 1,
          description: "High Speed Diesel (HSD) - Fleet Tank Replenishment",
          specs: "Euro-5 Compliant fuel for 14 student transport buses",
          quantity: "1,800 Liters",
          unitPrice: 280,
          totalPrice: 504000,
        },
        {
          id: "li-2",
          itemNo: 2,
          description: "Heavy Vehicle Engine Oil 15W-40 (Bulk Servicing)",
          specs: "PSO DEO MAX / API CI-4 for routine oil change",
          quantity: "6 Cans (20L)",
          unitPrice: 15000,
          totalPrice: 90000,
        },
        {
          id: "li-3",
          itemNo: 3,
          description: "Brake Fluid, Radiator Coolant & Fleet Filter Pack",
          specs: "Consumable servicing kit for coaster buses",
          quantity: "1 Lot",
          unitPrice: 46000,
          totalPrice: 46000,
        },
      ];
    case "EXP-2610-403":
      return [
        {
          id: "li-1",
          itemNo: 1,
          description: "Borosilicate Glassware & Titration Burettes Set",
          specs: "Class A certified laboratory beakers, flasks, and pipettes",
          quantity: "35 Kits",
          unitPrice: 3200,
          totalPrice: 112000,
        },
        {
          id: "li-2",
          itemNo: 2,
          description: "Analytical Grade Chemistry Reagents & Titration Acids",
          specs: "High-purity sulfuric acid, sodium hydroxide, organic indicators",
          quantity: "18 Bottles",
          unitPrice: 6000,
          totalPrice: 108000,
        },
        {
          id: "li-3",
          itemNo: 3,
          description: "High-Precision Digital Electronic Analytical Balances",
          specs: "0.001g sensitivity with motorized internal calibration",
          quantity: "3 Units",
          unitPrice: 30000,
          totalPrice: 90000,
        },
      ];
    case "EXP-2610-404":
      return [
        {
          id: "li-1",
          itemNo: 1,
          description: "Dedicated 200 Mbps Symmetrical CIR Fiber Optic Lease Line",
          specs: "Primary enterprise broadband circuit with 99.9% uptime SLA",
          quantity: "1 Month",
          unitPrice: 135000,
          totalPrice: 135000,
        },
        {
          id: "li-2",
          itemNo: 2,
          description: "AWS Cloud LMS Server Infrastructure & Encrypted Backups",
          specs: "Dedicated cloud hosting tier for parent portal & SIS databases",
          quantity: "1 Month",
          unitPrice: 65000,
          totalPrice: 65000,
        },
        {
          id: "li-3",
          itemNo: 3,
          description: "Static Public IP Subnet Allocation Block (/29)",
          specs: "8 routable IPv4 addresses for firewalls & VPN gateways",
          quantity: "1 Block",
          unitPrice: 25000,
          totalPrice: 25000,
        },
      ];
    case "EXP-2610-405":
      return [
        {
          id: "li-1",
          itemNo: 1,
          description: "Auditorium Central Chiller HVAC Seasonal Maintenance Overhaul",
          specs: "Compressor coil flushing, duct sanitization, and bearing greasing",
          quantity: "2 Systems",
          unitPrice: 130000,
          totalPrice: 260000,
        },
        {
          id: "li-2",
          itemNo: 2,
          description: "Eco-Friendly R-410A Non-Ozone Depleting Refrigerant Gas",
          specs: "Factory sealed pressurised cylinders for chiller top-up",
          quantity: "3 Cylinders",
          unitPrice: 25000,
          totalPrice: 75000,
        },
        {
          id: "li-3",
          itemNo: 3,
          description: "Premium Low-VOC Antimicrobial Classroom Interior Paint",
          specs: "Lead-free washable emulsion for corridor and hall refurbishment",
          quantity: "8 Cans",
          unitPrice: 5000,
          totalPrice: 40000,
        },
      ];
    default: {
      const part1 = Math.round(voucher.grossAmount * 0.7);
      const part2 = voucher.grossAmount - part1;
      return [
        {
          id: "li-def-1",
          itemNo: 1,
          description: `${voucher.title} — Primary Requisition / Contract Scope`,
          specs: `Authorized for ${voucher.department} under budget code ${voucher.budgetHeadCode}`,
          quantity: "1 Job / Lot",
          unitPrice: part1,
          totalPrice: part1,
        },
        {
          id: "li-def-2",
          itemNo: 2,
          description: "Consumables, Logistics, Quality Assurance & Auxiliary Handling",
          specs: `Standard fulfillment per vendor invoice ${voucher.invoiceNo}`,
          quantity: "1 Lot",
          unitPrice: part2,
          totalPrice: part2,
        },
      ];
    }
  }
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

  const lineItems = React.useMemo(
    () => (voucher ? getVoucherLineItems(voucher) : []),
    [voucher]
  );

  const matchingBudget = React.useMemo(() => {
    if (!voucher) return null;
    return (
      INITIAL_EXPENSE_BUDGETS.find(
        (b) => b.budgetCode === voucher.budgetHeadCode
      ) ?? INITIAL_EXPENSE_BUDGETS[0]
    );
  }, [voucher]);

  const monthlyLimit = matchingBudget?.monthlyAllocation ?? 500000;
  const spentMtd = matchingBudget?.monthlySpent ?? 0;
  const impactPct =
    monthlyLimit > 0
      ? Math.round((voucher.netPayable / monthlyLimit) * 100)
      : 0;
  const utilPct =
    monthlyLimit > 0
      ? Math.min(
          100,
          Math.round(((spentMtd + voucher.netPayable) / monthlyLimit) * 100)
        )
      : 0;
  const remainingBudget = Math.max(
    0,
    monthlyLimit - spentMtd - (voucher.status === "Paid" ? 0 : voucher.netPayable)
  );

  const attachments = React.useMemo(() => {
    if (!voucher) return [];
    return [
      {
        id: "att-1",
        title: "Vendor Tax Invoice & Sales Tax Spec",
        fileName: `TAX-INV-${voucher.invoiceNo}.pdf`,
        size: "1.4 MB",
        type: "FBR Compliant E-Invoice",
        date: formatDate(voucher.date),
      },
      {
        id: "att-2",
        title: "Goods Receipt Note (GRN) Inspection",
        fileName: `GRN-${voucher.voucherNo}.pdf`,
        size: "780 KB",
        type: "Store Inspection Sign-Off",
        date: formatDate(voucher.date),
      },
      {
        id: "att-3",
        title: "Comparative Quotation & Approval Form",
        fileName: `PO-EVAL-${voucher.voucherNo}.pdf`,
        size: "920 KB",
        type: "Procurement Committee Approval",
        date: formatDate(voucher.date),
      },
    ];
  }, [voucher]);

  const handlePreviewAttachment = (fileName: string) => {
    toast.info(`Opening verified document: ${fileName}`, {
      description: "Cryptographic signature verified against institutional key.",
    });
  };

  const handleDownloadAttachment = (fileName: string) => {
    toast.success(`Downloading verified attachment: ${fileName}`, {
      description: "Archived in institutional secure vault.",
    });
  };

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
      <DialogContent className="flex flex-col max-h-[calc(100vh-3rem)] sm:max-w-4xl lg:max-w-[960px] gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        {/* Header */}
        <DialogHeader className="shrink-0 gap-1 bg-gradient-to-r from-slate-50/90 via-white to-white px-6 py-4.5 border-b border-border/60">
          <div className="flex items-start justify-between gap-4 pr-7">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold leading-tight text-foreground capitalize">
                  {formatTitle(voucher.title)}
                </DialogTitle>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={voucher.status} />
                  <span
                    className="inline-flex items-center gap-1.5 rounded-md border border-brand/20 bg-brand-50/70 px-2.5 py-0.5 text-[11px] font-bold text-[#381e0f] shadow-2xs"
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
                className="group mt-0.5 inline-flex items-center gap-1.5 font-mono text-[13px] font-bold text-[#381e0f] hover:text-brand transition-colors cursor-pointer"
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
                  ? "bg-white text-[#381e0f] shadow-2xs"
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
                  ? "bg-white text-[#381e0f] shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/40"
              )}
            >
              <FileText className="size-3.5" />
              <span>Audit Trail</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 font-mono text-[10px] font-bold",
                  activeTab === "audit"
                    ? "bg-[#381e0f] text-white"
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
                  <p className="mt-1.5 font-bold text-[#381e0f] text-[13px] leading-snug">
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
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#381e0f]">
                  <FileText className="size-3.5 text-brand" />
                  <span>Expense Purpose &amp; Scope Narration</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-700 bg-white border border-slate-200/60 rounded-lg p-3 shadow-2xs font-normal">
                  {voucher.description && voucher.description.trim()
                    ? voucher.description
                    : "Institutional expenditure recorded for campus operations, maintenance, or academic procurement."}
                </p>
              </div>

              {/* Itemized Line Items Breakdown Table */}
              <div className="overflow-hidden rounded-xl border border-border/80 bg-white shadow-2xs">
                <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-slate-50 via-slate-50/80 to-white px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="size-4 text-brand" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#381e0f]">
                      Procurement Line Items &amp; Itemized Breakdown
                    </span>
                  </div>
                  <span className="inline-flex items-center rounded-md border border-brand/20 bg-brand-50/80 px-2 py-0.5 font-mono text-[10.5px] font-bold text-brand">
                    {lineItems.length} Deliverable Lines
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#381e0f] bg-gradient-to-r from-[#7c4424] via-[#5c3118] to-[#381e0f] text-[10.5px] font-bold uppercase tracking-wider text-white">
                        <th className="px-3.5 py-2.5 text-center w-12">#</th>
                        <th className="px-3.5 py-2.5 text-left">Item Description &amp; Technical Specifications</th>
                        <th className="px-3.5 py-2.5 text-center w-28">Quantity</th>
                        <th className="px-3.5 py-2.5 text-right w-32">Unit Price</th>
                        <th className="px-3.5 py-2.5 text-right w-36">Total (Rs)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {lineItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-3.5 py-2.5 text-center font-mono font-bold text-slate-500">
                            {item.itemNo}
                          </td>
                          <td className="px-3.5 py-2.5">
                            <p className="font-bold text-foreground text-xs">{item.description}</p>
                            <p className="text-[11px] text-muted-foreground">{item.specs}</p>
                          </td>
                          <td className="px-3.5 py-2.5 text-center font-semibold text-slate-700 whitespace-nowrap">
                            {item.quantity}
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-mono tabular-nums text-slate-700">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-mono font-bold tabular-nums text-[#381e0f]">
                            {formatCurrency(item.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border/70 bg-slate-50/90 font-semibold text-xs">
                        <td colSpan={4} className="px-3.5 py-2 text-right text-muted-foreground uppercase text-[10.5px]">
                          Subtotal (Gross Invoiced Amount):
                        </td>
                        <td className="px-3.5 py-2 text-right font-mono font-bold text-foreground tabular-nums">
                          {formatCurrency(voucher.grossAmount)}
                        </td>
                      </tr>
                      <tr className="bg-slate-50/90 text-xs">
                        <td colSpan={4} className="px-3.5 py-1 text-right text-emerald-800 uppercase text-[10.5px] font-semibold">
                          Add: Sales Tax / GST (STRN Verified):
                        </td>
                        <td className="px-3.5 py-1 text-right font-mono font-bold text-emerald-700 tabular-nums">
                          +{formatCurrency(voucher.taxAmount)}
                        </td>
                      </tr>
                      <tr className="bg-slate-50/90 text-xs">
                        <td colSpan={4} className="px-3.5 py-1 text-right text-rose-700 uppercase text-[10.5px] font-semibold">
                          Less: Withholding Tax (FBR WHT Sec 153):
                        </td>
                        <td className="px-3.5 py-1 text-right font-mono font-bold text-rose-600 tabular-nums">
                          -{formatCurrency(voucher.whtDeduction)}
                        </td>
                      </tr>
                      <tr className="border-t-2 border-emerald-500/50 bg-emerald-50/80 font-bold text-xs text-emerald-950">
                        <td colSpan={4} className="px-3.5 py-2.5 text-right uppercase tracking-wider text-[11px] font-extrabold">
                          Total Net Disbursable Take-Home:
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-mono font-extrabold text-sm text-emerald-800 tabular-nums">
                          {formatCurrency(voucher.netPayable)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Left: Financial & Tax Breakdown */}
                <div className="flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-white shadow-2xs">
                  <div className="flex items-center justify-between border-b border-border/60 bg-slate-50/80 px-4 py-3 gap-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#381e0f]">
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
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#381e0f]">
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
                        className="inline-flex items-center gap-1.5 font-mono font-bold text-[#381e0f] hover:text-brand cursor-pointer rounded px-1.5 py-0.5 hover:bg-slate-100 transition-colors"
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
                      <span className="inline-flex items-center gap-1 font-semibold text-[#381e0f]">
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

              {/* Budget Head Utilization & Cost Center Health */}
              <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
                  <div className="flex items-center gap-2">
                    <PieChart className="size-4 text-brand" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#381e0f]">
                        Budget Allocation &amp; Cost Center Health
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Head: <strong className="text-foreground">{matchingBudget?.category || voucher.category}</strong> ({voucher.budgetHeadCode}) · Custodian: {matchingBudget?.custodian || "Finance Controller"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold shadow-2xs",
                      utilPct > 90
                        ? "border-rose-200 bg-rose-50 text-rose-800"
                        : utilPct > 70
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : "border-emerald-200 bg-emerald-50 text-emerald-800"
                    )}
                  >
                    {utilPct}% Budget Utilized
                  </span>
                </div>

                <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/70">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Monthly Ceiling</span>
                    <p className="mt-1 font-mono font-bold text-foreground text-xs">{formatCurrency(monthlyLimit)}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/70">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Spent MTD</span>
                    <p className="mt-1 font-mono font-semibold text-slate-800 text-xs">{formatCurrency(spentMtd)}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/70">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">This Voucher Impact</span>
                    <p className="mt-1 font-mono font-bold text-brand text-xs">
                      {formatCurrency(voucher.netPayable)} ({impactPct}%)
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-50/60 p-2.5 border border-emerald-200/70">
                    <span className="text-[10px] font-bold uppercase text-emerald-800">Remaining Balance</span>
                    <p className="mt-1 font-mono font-extrabold text-emerald-800 text-xs">{formatCurrency(remainingBudget)}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-[10.5px] text-muted-foreground font-medium">
                    <span>Fiscal Head Health Status</span>
                    <span>{formatCurrency(spentMtd + voucher.netPayable)} of {formatCurrency(monthlyLimit)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        utilPct > 90 ? "bg-rose-500" : utilPct > 70 ? "bg-amber-500" : "bg-emerald-500"
                      )}
                      style={{ width: `${Math.min(100, utilPct)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Fiscal Audit & Tax Compliance */}
              <div className="rounded-xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-blue-50/20 p-4 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#381e0f]">
                      Taxation Compliance &amp; Federal Treasury Audit
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 shadow-2xs">
                    <CheckCircle2 className="size-3 text-emerald-600" />
                    FBR Active Taxpayer (ATL Verified)
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-lg bg-white p-3 border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                      Withholding Tax Law
                    </span>
                    <p className="mt-1 font-semibold text-slate-900 text-[11.5px]">
                      Income Tax Ord. Sec 153(1)(b)
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                      Standard rate withheld at source: <strong className="text-rose-600 font-mono">-{formatCurrency(voucher.whtDeduction)}</strong>
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3 border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                      CPR Challan Reference
                    </span>
                    <p className="mt-1 font-mono font-bold text-brand text-[11.5px]">
                      CPR-2026-TX-{voucher.voucherNo.replace(/[^0-9]/g, "") || "881920"}
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-emerald-700 font-medium">
                      Deposited into Federal Treasury Account
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3 border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                      Sales Tax (STRN Status)
                    </span>
                    <p className="mt-1 font-mono font-bold text-slate-900 text-[11.5px]">
                      STRN: 32-77-8761-002-19
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                      Input credit eligibility: <strong className="text-emerald-700">100% Verified</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Verified Document Attachments */}
              <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="size-4 text-brand" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#381e0f]">
                      Verified Audit Attachments &amp; Scanned Documents
                    </span>
                  </div>
                  <span className="text-[10.5px] font-medium text-muted-foreground">
                    3 Cryptographically Verified Files
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex flex-col justify-between rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-rose-50 text-rose-600 border border-rose-200/80 font-bold text-[10px]">
                            PDF
                          </span>
                          <span className="inline-flex items-center gap-1 rounded bg-white px-1.5 py-0.5 text-[9.5px] font-bold text-slate-600 border border-slate-200 shadow-2xs">
                            <CheckCircle2 className="size-2.5 text-emerald-600" />
                            Verified
                          </span>
                        </div>
                        <p className="mt-2 text-xs font-bold text-foreground leading-snug line-clamp-1">
                          {att.title}
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground truncate" title={att.fileName}>
                          {att.fileName}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {att.size} · Uploaded {att.date}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-200/60">
                        <ActionButton
                          tone="outline"
                          size="xs"
                          className="flex-1 justify-center"
                          onClick={() => handlePreviewAttachment(att.fileName)}
                        >
                          <Eye className="size-3" />
                          <span>Preview</span>
                        </ActionButton>
                        <ActionButton
                          tone="outline"
                          size="xs"
                          className="flex-1 justify-center"
                          onClick={() => handleDownloadAttachment(att.fileName)}
                        >
                          <Download className="size-3" />
                          <span>Download</span>
                        </ActionButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3-Stage Executive Approval Hierarchy */}
              <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#381e0f]">
                    Executive Approval Hierarchy &amp; Audit Status
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        1. Requisition
                      </span>
                      <span className="size-2 rounded-full bg-emerald-500" />
                    </div>
                    <p className="mt-1.5 font-bold text-xs text-foreground">{voucher.requestedBy}</p>
                    <p className="text-[10.5px] text-muted-foreground">{voucher.department}</p>
                    <p className="mt-1.5 font-mono text-[10px] text-slate-500">
                      {formatDate(voucher.date)} · Signed
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        2. Fiscal Audit
                      </span>
                      <span className="size-2 rounded-full bg-emerald-500" />
                    </div>
                    <p className="mt-1.5 font-bold text-xs text-foreground">M. Kamran Siddiqui</p>
                    <p className="text-[10.5px] text-muted-foreground">Internal Audit Officer</p>
                    <p className="mt-1.5 font-mono text-[10px] text-slate-500">
                      Budget Head {voucher.budgetHeadCode} Verified
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        3. Final Authorization
                      </span>
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          voucher.status === "Paid" || voucher.status === "Approved"
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        )}
                      />
                    </div>
                    <p className="mt-1.5 font-bold text-xs text-foreground">{voucher.approvedBy}</p>
                    <p className="text-[10.5px] text-muted-foreground">Super Administrator / Controller</p>
                    <p className="mt-1.5 font-mono text-[10px] text-slate-500">
                      {voucher.status === "Paid"
                        ? "Treasury Settled"
                        : voucher.status === "Approved"
                        ? "Disbursal Cleared"
                        : "Awaiting Authorization"}
                    </p>
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
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#381e0f]">
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
                      className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs font-bold text-[#381e0f] focus:border-brand focus:outline-none"
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
