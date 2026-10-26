"use client";

import * as React from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  Building2,
  Check,
  ClipboardCheck,
  Copy,
  Download,
  Edit,
  FileText,
  Landmark,
  Package,
  Printer,
  ShieldCheck,
  Truck,
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
  DepartmentalIssuanceRecord,
  InventoryItemRecord,
  InventorySupplierRecord,
  IssuanceStatus,
  PurchaseOrderRecord,
  PurchaseOrderStatus,
} from "@/lib/mock/inventory";
import {
  exportSinglePurchaseOrderPdf,
  exportSingleStockCardPdf,
  printSingleStockCard,
} from "./inventory-export";

const fieldClass =
  "h-9 w-full rounded-[4px] border border-border/80 bg-white px-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15";

/* ═══════════════════════════════════════════════════════════════════════════
   1. STORE STOCK ITEM VIEW & ADJUSTMENT MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface InventoryItemModalProps {
  item: InventoryItemRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: "overview" | "adjust" | "ledger";
  onAdjustStock?: (
    itemId: string,
    payload: {
      mode: "restock" | "issue" | "audit";
      quantityInput: number;
      voucherRef: string;
      departmentOrVendor: string;
      actor: string;
      remarks: string;
    }
  ) => void;
  onEditItem?: (item: InventoryItemRecord) => void;
}

export function InventoryItemModal({
  item,
  open,
  onOpenChange,
  initialTab = "overview",
  onAdjustStock,
  onEditItem,
}: InventoryItemModalProps) {
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "adjust" | "ledger"
  >(initialTab);

  const [adjustMode, setAdjustMode] = React.useState<
    "restock" | "issue" | "audit"
  >("restock");
  const [qtyInput, setQtyInput] = React.useState("50");
  const [voucherRef, setVoucherRef] = React.useState("");
  const [deptOrVendor, setDeptOrVendor] = React.useState("");
  const [actor, setActor] = React.useState("");
  const [remarks, setRemarks] = React.useState("");

  React.useEffect(() => {
    if (open && item) {
      setActiveTab(initialTab);
      setAdjustMode(item.status === "In Stock" ? "issue" : "restock");
      setQtyInput(item.status === "In Stock" ? "10" : "50");
      setVoucherRef(
        item.status === "In Stock"
          ? `ISS-2610-${Math.floor(510 + Math.random() * 89)}`
          : `GRN-2610-${Math.floor(310 + Math.random() * 89)}`
      );
      setDeptOrVendor(
        item.status === "In Stock"
          ? "Main Academic Block / Faculty Requisition"
          : item.supplierName
      );
      setActor(`${item.custodian} (Store Officer)`);
      setRemarks(
        item.status === "In Stock"
          ? "Issued against approved departmental requisition slip."
          : "Replenished stock received and verified against supplier delivery challan."
      );
    }
  }, [open, item, initialTab]);

  if (!item) return null;

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`, { description: text });
    }
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedQty = Math.max(0, Number(qtyInput) || 0);
    if (adjustMode !== "audit" && parsedQty <= 0) {
      toast.error("Please enter a valid quantity greater than zero.");
      return;
    }
    if (onAdjustStock) {
      onAdjustStock(item.id, {
        mode: adjustMode,
        quantityInput: parsedQty,
        voucherRef: voucherRef.trim() || "STR-2610-VERIFIED",
        departmentOrVendor: deptOrVendor.trim() || item.supplierName,
        actor: actor.trim() || item.custodian,
        remarks:
          remarks.trim() || "Updated via institutional store stock control.",
      });
      setActiveTab("overview");
    }
  };

  const stockRatio = Math.min(
    100,
    Math.round((item.quantity / Math.max(1, item.reorderLevel * 3)) * 100)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-h-[calc(100vh-3rem)] sm:max-w-3xl gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        {/* Header */}
        <DialogHeader className="shrink-0 gap-1 bg-gradient-to-r from-[#091d3e]/[0.04] via-white to-white px-6 py-4.5">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#091d3e] text-white shadow-xs">
                <Package className="size-5" />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold leading-tight text-foreground">
                  {item.name}
                </DialogTitle>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <StatusBadge status={item.status} />
                  <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/70 px-2 py-0.5 font-mono text-[11px] font-bold text-[#091d3e]">
                    {item.sku}
                  </span>
                  <DialogDescription className="font-mono text-xs text-muted-foreground">
                    {item.category} · {item.campus}
                  </DialogDescription>
                </div>
              </div>
            </div>
            <div className="hidden sm:block text-right shrink-0">
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                Store SKU Code
              </p>
              <button
                type="button"
                onClick={() => handleCopy(item.sku, "SKU Code")}
                className="mt-0.5 inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-slate-50 px-2 py-0.5 font-mono text-xs font-bold text-[#091d3e] hover:border-brand/40 cursor-pointer"
              >
                <span>{item.sku}</span>
                <Copy className="size-3 text-muted-foreground" />
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* 4-Column Stock & Valuation Strip */}
        <dl className="grid shrink-0 grid-cols-2 divide-x divide-y divide-border/70 border-y border-border/70 bg-slate-50/70 sm:grid-cols-4 sm:divide-y-0">
          <div className="px-4 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">
              On-Hand Stock Balance
            </dt>
            <dd className="mt-0.5 font-mono text-sm font-bold tabular-nums text-foreground">
              {item.quantity.toLocaleString()} {item.unit}
            </dd>
          </div>
          <div className="px-4 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">
              Reorder Alert Level
            </dt>
            <dd className="mt-0.5 font-mono text-sm font-bold tabular-nums text-amber-700">
              {item.reorderLevel.toLocaleString()} {item.unit}
            </dd>
          </div>
          <div className="px-4 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">
              Unit Cost Price
            </dt>
            <dd className="mt-0.5 font-mono text-sm font-bold tabular-nums text-foreground">
              {formatCurrency(item.unitCost)}
            </dd>
          </div>
          <div className="px-4 py-2.5 bg-emerald-50/45">
            <div className="flex items-center justify-between">
              <dt className="text-[11px] font-semibold text-emerald-800">
                Total Valuation
              </dt>
              {activeTab !== "adjust" && (
                <button
                  type="button"
                  onClick={() => setActiveTab("adjust")}
                  className="inline-flex items-center gap-1 rounded bg-emerald-700 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-2xs hover:bg-emerald-800 cursor-pointer"
                >
                  <Boxes className="size-2.5" />
                  <span>Adjust</span>
                </button>
              )}
            </div>
            <dd className="mt-0.5 font-mono text-sm font-extrabold tabular-nums text-emerald-700">
              {formatCurrency(item.totalValue)}
            </dd>
          </div>
        </dl>

        {/* Sub-Tabs */}
        <div className="flex shrink-0 items-center gap-1 border-b border-border/70 bg-white px-6 pt-2">
          {(
            [
              {
                key: "overview",
                label: "Item & Supplier Details",
                icon: FileText,
              },
              {
                key: "adjust",
                label: "Restock / Issue Stock",
                icon: Boxes,
              },
              {
                key: "ledger",
                label: `Stock Movement Ledger (${item.movementLogs.length})`,
                icon: ShieldCheck,
              },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-semibold transition-colors cursor-pointer",
                  active
                    ? "border-[#091d3e] text-[#091d3e]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {activeTab === "overview" && (
            <>
              <div className="rounded-xl border border-border/80 bg-slate-50/50 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-[10.5px] text-muted-foreground">
                    Technical Specification & Bin Location
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-[#091d3e]">
                    Last Restocked: {formatDate(item.lastRestocked)}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-foreground">
                  {item.specification}
                </p>
                <div className="mt-3 pt-2.5 border-t border-border/60">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-medium text-muted-foreground">
                      Stock Buffer Health ({item.quantity} {item.unit} on hand vs{" "}
                      {item.reorderLevel} {item.unit} threshold)
                    </span>
                    <span className="font-mono font-bold text-[#091d3e]">
                      {stockRatio}% Capacity
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        item.status === "Out of Stock"
                          ? "bg-danger"
                          : item.status === "Low Stock"
                          ? "bg-amber-500"
                          : "bg-emerald-600"
                      )}
                      style={{ width: `${Math.max(4, stockRatio)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Store & Custodian Card */}
                <div className="rounded-xl border border-border/80 bg-white p-4 shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                    <Building2 className="size-4 text-[#091d3e]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#091d3e]">
                      Store Location & Governance
                    </h4>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Campus:</span>
                      <span className="font-semibold text-foreground">
                        {item.campus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Store & Rack:
                      </span>
                      <span className="font-semibold text-foreground">
                        {item.storeLocation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Store Custodian:
                      </span>
                      <span className="font-semibold text-foreground">
                        {item.custodian}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Accounting Unit:
                      </span>
                      <span className="font-mono font-semibold text-[#091d3e]">
                        {item.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Supplier Card */}
                <div className="rounded-xl border border-border/80 bg-white p-4 shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                    <Truck className="size-4 text-[#091d3e]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#091d3e]">
                      Approved Vendor / Supplier
                    </h4>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vendor Name:</span>
                      <span className="font-semibold text-foreground">
                        {item.supplierName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        FBR Tax NTN:
                      </span>
                      <span className="font-mono font-semibold text-foreground">
                        {item.supplierNtn}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Vendor Contact:
                      </span>
                      <span className="font-mono text-foreground">
                        {item.supplierPhone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Contract Rate:
                      </span>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatCurrency(item.unitCost)} / {item.unit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "adjust" && (
            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {(
                  [
                    {
                      key: "restock" as const,
                      title: "Receive Stock (+ GRN)",
                      desc: "Add newly delivered units to store balance",
                      icon: ArrowUpRight,
                    },
                    {
                      key: "issue" as const,
                      title: "Issue to Dept (- Slip)",
                      desc: "Deduct units issued to campus department",
                      icon: ArrowDownRight,
                    },
                    {
                      key: "audit" as const,
                      title: "Physical Audit Set",
                      desc: "Set exact reconciled physical count",
                      icon: ClipboardCheck,
                    },
                  ] as const
                ).map((m) => {
                  const Icon = m.icon;
                  const active = adjustMode === m.key;
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setAdjustMode(m.key)}
                      className={cn(
                        "flex flex-col items-start rounded-xl border p-3 text-left transition-all cursor-pointer",
                        active
                          ? "border-[#091d3e] bg-brand-50/60 ring-2 ring-[#091d3e]/10"
                          : "border-border/80 bg-white hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#091d3e]">
                        <Icon className="size-3.5" />
                        <span>{m.title}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {m.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    {adjustMode === "restock"
                      ? `Quantity Received (${item.unit})`
                      : adjustMode === "issue"
                      ? `Quantity to Issue (${item.unit})`
                      : `Verified Physical Count (${item.unit})`}{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    placeholder="e.g. 50"
                    value={qtyInput}
                    onChange={(e) => setQtyInput(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    {adjustMode === "restock"
                      ? "GRN / Delivery Challan #"
                      : adjustMode === "issue"
                      ? "Issue Voucher / Requisition #"
                      : "Audit Verification Reference #"}{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GRN-2610-315 or ISS-2610-512"
                    value={voucherRef}
                    onChange={(e) => setVoucherRef(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    {adjustMode === "restock"
                      ? "Delivering Supplier / Vendor"
                      : "Receiving Department / Wing"}{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Physics Lab or Allied Paper Mart"
                    value={deptOrVendor}
                    onChange={(e) => setDeptOrVendor(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Authorizing Store Officer{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. M. Tariq Mehmood (Store Officer)"
                    value={actor}
                    onChange={(e) => setActor(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Store Ledger Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inspected and entered into central store bin card."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div className="flex justify-end pt-1">
                <ActionButton type="submit" tone="primary" size="md">
                  <Check className="size-3.5" />
                  <span>Post Stock Movement</span>
                </ActionButton>
              </div>
            </form>
          )}

          {activeTab === "ledger" && (
            <div className="space-y-2.5">
              {item.movementLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border/80 bg-white p-3 shadow-2xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="rounded border border-brand/15 bg-brand-50/70 px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-[#091d3e]">
                        {log.voucherRef}
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {log.type} — {log.departmentOrVendor}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {log.remarks}
                    </p>
                    <p className="font-mono text-[10.5px] text-muted-foreground">
                      {log.timestamp} · By {log.actor}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={cn(
                        "font-mono text-xs font-bold",
                        log.qtyChange.startsWith("+")
                          ? "text-emerald-700"
                          : log.qtyChange.startsWith("-")
                          ? "text-amber-700"
                          : "text-[#091d3e]"
                      )}
                    >
                      {log.qtyChange}
                    </span>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      Bal: {log.balanceAfter} {item.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 bg-slate-50/60 px-6 py-3.5">
          <div className="flex items-center gap-2">
            <ActionButton
              tone="outline"
              size="sm"
              onClick={() => {
                const ok = printSingleStockCard(item);
                if (!ok) toast.error("Allow pop-ups to print bin card.");
              }}
            >
              <Printer className="size-3.5" />
              <span>Print Bin Card</span>
            </ActionButton>
            <ActionButton
              tone="pdf"
              size="sm"
              onClick={() => {
                exportSingleStockCardPdf(item);
                toast.success(`Stock bin card ${item.sku} downloaded as PDF.`);
              }}
            >
              <Download className="size-3.5" />
              <span>Download PDF</span>
            </ActionButton>
          </div>

          <div className="flex items-center gap-2">
            {onEditItem && (
              <ActionButton
                tone="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEditItem(item);
                }}
              >
                <Edit className="size-3.5" />
                <span>Edit Item</span>
              </ActionButton>
            )}
            <ActionButton
              tone="primary"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <span>Close</span>
            </ActionButton>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. PURCHASE ORDER VIEW & GRN RECEIVING MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface PurchaseOrderViewModalProps {
  po: PurchaseOrderRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdatePoStatus?: (
    poId: string,
    status: PurchaseOrderStatus,
    grnNumber: string,
    approvedBy: string
  ) => void;
}

export function PurchaseOrderViewModal({
  po,
  open,
  onOpenChange,
  onUpdatePoStatus,
}: PurchaseOrderViewModalProps) {
  const [status, setStatus] = React.useState<PurchaseOrderStatus>("Received");
  const [grnNumber, setGrnNumber] = React.useState("");
  const [approvedBy, setApprovedBy] = React.useState(
    "Hamza Tariq (Super Admin)"
  );

  React.useEffect(() => {
    if (open && po) {
      setStatus(po.status === "Pending" ? "Ordered" : "Received");
      setGrnNumber(
        po.grnNumber && po.grnNumber !== "PENDING-GRN"
          ? po.grnNumber
          : `GRN-2610-${Math.floor(310 + Math.random() * 89)}`
      );
      setApprovedBy(
        po.approvedBy !== "Pending Finance Review"
          ? po.approvedBy
          : "Hamza Tariq (Super Admin)"
      );
    }
  }, [open, po]);

  if (!po) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdatePoStatus) {
      onUpdatePoStatus(
        po.id,
        status,
        status === "Received"
          ? grnNumber.trim() || "GRN-2610-VERIFIED"
          : po.grnNumber,
        approvedBy.trim() || "Hamza Tariq (Super Admin)"
      );
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-h-[calc(100vh-3rem)] sm:max-w-2xl gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        <DialogHeader className="shrink-0 gap-1 bg-gradient-to-r from-[#091d3e]/[0.04] via-white to-white px-6 py-4.5">
          <div className="flex items-center gap-3.5 pr-8">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#091d3e] text-white">
              <Truck className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {po.title}
              </DialogTitle>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <StatusBadge status={po.status} />
                <span className="rounded border border-brand/15 bg-brand-50/70 px-2 py-0.5 font-mono text-[11px] font-bold text-[#091d3e]">
                  {po.poNumber}
                </span>
                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700">
                  GRN: {po.grnNumber}
                </span>
                <DialogDescription className="text-xs text-muted-foreground">
                  {po.campus} · {po.category}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Financial Breakdown Strip */}
        <dl className="grid shrink-0 grid-cols-2 divide-x divide-y divide-border/70 border-y border-border/70 bg-slate-50/70 sm:grid-cols-4 sm:divide-y-0">
          <div className="px-4 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">
              Gross PO Value
            </dt>
            <dd className="mt-0.5 font-mono text-sm font-bold text-foreground">
              {formatCurrency(po.grossAmount)}
            </dd>
          </div>
          <div className="px-4 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">
              Sales Tax (18% GST)
            </dt>
            <dd className="mt-0.5 font-mono text-sm font-bold text-foreground">
              +{formatCurrency(po.gstAmount)}
            </dd>
          </div>
          <div className="px-4 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">
              WHT Deducted
            </dt>
            <dd className="mt-0.5 font-mono text-sm font-bold text-danger">
              -{formatCurrency(po.whtDeduction)}
            </dd>
          </div>
          <div className="px-4 py-2.5 bg-emerald-50/50">
            <dt className="text-[11px] font-semibold text-emerald-800">
              Net Order Payable
            </dt>
            <dd className="mt-0.5 font-mono text-sm font-extrabold text-emerald-700">
              {formatCurrency(po.netPayable)}
            </dd>
          </div>
        </dl>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        >
          <div className="rounded-xl border border-border/80 bg-slate-50/50 p-3.5 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="font-semibold text-muted-foreground">
                Ordered Items ({po.orderedQty} {po.unit}):
              </span>
              <span className="font-mono text-[11px] font-semibold text-[#091d3e]">
                Delivery: {formatDate(po.expectedDelivery)}
              </span>
            </div>
            <p className="font-medium text-foreground">{po.itemsSummary}</p>
            <div className="pt-2 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11.5px]">
              <div>
                <span className="text-muted-foreground">Supplier: </span>
                <strong className="text-foreground">{po.supplierName}</strong> (
                <span className="font-mono">{po.supplierNtn}</span>)
              </div>
              <div>
                <span className="text-muted-foreground">Bank IBAN: </span>
                <span className="font-mono font-semibold text-[#091d3e]">
                  {po.supplierBank} · {po.supplierIban}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Requisitioner: </span>
                <span className="font-medium text-foreground">
                  {po.requestedBy}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Payment Terms: </span>
                <span className="font-medium text-foreground">
                  {po.paymentTerms}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                PO & Delivery Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as PurchaseOrderStatus)
                }
                className={fieldClass}
              >
                <option value="Received">Received (GRN Verified)</option>
                <option value="Ordered">Ordered (Dispatched)</option>
                <option value="Pending">Pending Approval</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                Goods Received Note (GRN #)
              </label>
              <input
                type="text"
                placeholder="e.g. GRN-2610-318"
                value={grnNumber}
                onChange={(e) => setGrnNumber(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                Authorizing Authority
              </label>
              <input
                type="text"
                placeholder="e.g. Hamza Tariq (Super Admin)"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <DialogFooter className="pt-2 flex flex-wrap items-center justify-between gap-2">
            <ActionButton
              type="button"
              tone="pdf"
              size="sm"
              onClick={() => {
                exportSinglePurchaseOrderPdf(po);
                toast.success(`Purchase Order ${po.poNumber} downloaded.`);
              }}
            >
              <Download className="size-3.5" />
              <span>Download PO PDF</span>
            </ActionButton>
            <div className="flex items-center gap-2">
              <ActionButton
                type="button"
                tone="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </ActionButton>
              <ActionButton type="submit" tone="primary" size="sm">
                <Check className="size-3.5" />
                <span>Update Purchase Order</span>
              </ActionButton>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. DEPARTMENTAL ISSUANCE VIEW MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface IssuanceViewModalProps {
  issuance: DepartmentalIssuanceRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateIssuanceStatus?: (id: string, status: IssuanceStatus) => void;
}

export function IssuanceViewModal({
  issuance,
  open,
  onOpenChange,
  onUpdateIssuanceStatus,
}: IssuanceViewModalProps) {
  const [status, setStatus] = React.useState<IssuanceStatus>("Issued");

  React.useEffect(() => {
    if (open && issuance) {
      setStatus(issuance.status);
    }
  }, [open, issuance]);

  if (!issuance) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border border-border/80 bg-white p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-[#091d3e]/[0.04] via-white to-white px-6 py-4 border-b border-border/70">
          <DialogTitle className="text-base font-bold text-foreground">
            Departmental Store Issuance — {issuance.issueVoucherNo}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Requisition #{issuance.requisitionNo} · {issuance.campus} Campus
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-3.5 text-xs">
          <div className="rounded-xl border border-border/80 bg-slate-50/60 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-[#091d3e]">
                {issuance.sku} · {issuance.category}
              </span>
              <StatusBadge status={issuance.status} />
            </div>
            <p className="text-sm font-bold text-foreground">
              {issuance.itemName}
            </p>
            <p className="text-muted-foreground">{issuance.purpose}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/70 p-3.5">
            <div>
              <span className="text-[10.5px] uppercase font-semibold text-muted-foreground">
                Receiving Department
              </span>
              <p className="font-semibold text-foreground mt-0.5">
                {issuance.department}
              </p>
            </div>
            <div>
              <span className="text-[10.5px] uppercase font-semibold text-muted-foreground">
                Issued To Custodian
              </span>
              <p className="font-semibold text-foreground mt-0.5">
                {issuance.issuedTo}
              </p>
            </div>
            <div>
              <span className="text-[10.5px] uppercase font-semibold text-muted-foreground">
                Quantity Issued
              </span>
              <p className="font-mono font-bold text-[#091d3e] mt-0.5">
                {issuance.quantityIssued} {issuance.unit} (@{" "}
                {formatCurrency(issuance.unitCost)})
              </p>
            </div>
            <div>
              <span className="text-[10.5px] uppercase font-semibold text-muted-foreground">
                Total Valuation
              </span>
              <p className="font-mono font-bold text-emerald-700 mt-0.5">
                {formatCurrency(issuance.totalValuation)}
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Issuance Voucher Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as IssuanceStatus)}
              className={fieldClass}
            >
              <option value="Issued">Issued to Department</option>
              <option value="Returned">Returned to Central Store</option>
              <option value="Pending">Pending Store Release</option>
            </select>
          </div>
        </div>

        <DialogFooter className="border-t border-border/70 bg-slate-50/60 px-6 py-3 flex items-center justify-end gap-2">
          <ActionButton
            tone="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </ActionButton>
          <ActionButton
            tone="primary"
            size="sm"
            onClick={() => {
              if (onUpdateIssuanceStatus) {
                onUpdateIssuanceStatus(issuance.id, status);
              }
              onOpenChange(false);
            }}
          >
            <Check className="size-3.5" />
            <span>Save Status</span>
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. APPROVED SUPPLIER PROFILE VIEW MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface SupplierViewModalProps {
  supplier: InventorySupplierRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupplierViewModal({
  supplier,
  open,
  onOpenChange,
}: SupplierViewModalProps) {
  if (!supplier) return null;

  const copyIban = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(supplier.iban);
      toast.success("Vendor IBAN copied to clipboard", {
        description: supplier.iban,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border border-border/80 bg-white p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-[#091d3e]/[0.04] via-white to-white px-6 py-4 border-b border-border/70">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#091d3e] text-white">
              <Landmark className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {supplier.companyName}
              </DialogTitle>
              <DialogDescription className="font-mono text-xs text-muted-foreground">
                {supplier.supplierCode} · {supplier.category} · {supplier.city}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/80 bg-slate-50/50 p-3.5">
            <div>
              <span className="text-[10.5px] uppercase font-semibold text-muted-foreground">
                FBR NTN / STRN
              </span>
              <p className="font-mono font-bold text-foreground mt-0.5">
                NTN: {supplier.ntn}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                STRN: {supplier.strn}
              </p>
            </div>
            <div>
              <span className="text-[10.5px] uppercase font-semibold text-muted-foreground">
                Primary Contact Person
              </span>
              <p className="font-semibold text-foreground mt-0.5">
                {supplier.contactPerson}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {supplier.phone} · {supplier.email}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] uppercase font-bold text-[#091d3e]">
                Settlement Banking & IBAN
              </span>
              <button
                type="button"
                onClick={copyIban}
                className="inline-flex items-center gap-1 rounded border border-border px-2 py-0.5 font-mono text-[11px] font-semibold text-[#091d3e] hover:bg-slate-50 cursor-pointer"
              >
                <Copy className="size-3" />
                <span>Copy IBAN</span>
              </button>
            </div>
            <p className="font-semibold text-foreground">{supplier.bankName}</p>
            <p className="font-mono text-xs font-bold text-[#091d3e]">
              {supplier.iban}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Contract Terms: {supplier.paymentTerms} · Vendor Rating:{" "}
              <strong>{supplier.rating}</strong>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-xl bg-emerald-50/50 border border-emerald-200/70 p-3 text-center">
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                POs Executed
              </span>
              <p className="font-mono text-sm font-bold text-[#091d3e]">
                {supplier.totalOrdersCount} Orders
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                Total Volume
              </span>
              <p className="font-mono text-sm font-bold text-emerald-700">
                {formatCurrency(supplier.totalProcurementValue)}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                Payable Due
              </span>
              <p className="font-mono text-sm font-bold text-amber-700">
                {formatCurrency(supplier.outstandingPayable)}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/70 bg-slate-50/60 px-6 py-3 flex justify-end">
          <ActionButton
            tone="primary"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
