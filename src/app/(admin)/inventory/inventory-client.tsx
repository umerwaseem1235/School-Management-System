"use client";

import * as React from "react";
import {
  AlertTriangle,
  Boxes,
  Check,
  ChevronDown,
  Download,
  Eye,
  Landmark,
  Layers,
  Package,
  Plus,
  Printer,
  Send,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  Truck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import {
  DataTable,
  type Column,
  type FilterDef,
} from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionButton } from "@/components/shared/action-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
} from "@/lib/format";
import {
  computeStockStatus,
  INITIAL_INVENTORY_ITEMS,
  INITIAL_ISSUANCE_RECORDS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_SUPPLIERS,
  type DepartmentalIssuanceRecord,
  type InventoryItemRecord,
  type InventorySupplierRecord,
  type IssuanceStatus,
  type PurchaseOrderRecord,
  type PurchaseOrderStatus,
} from "@/lib/mock/inventory";
import {
  exportInventoryStockPdf,
  exportIssuancePdf,
  exportPurchaseOrdersPdf,
  exportSuppliersPdf,
  printInventoryRegister,
} from "./inventory-export";
import {
  InventoryItemModal,
  IssuanceViewModal,
  PurchaseOrderViewModal,
  SupplierViewModal,
} from "./inventory-item-modal";
import {
  InventoryFormModal,
  IssuanceFormModal,
  PurchaseOrderFormModal,
} from "./inventory-form-modal";

type InventoryViewTab = "stock" | "orders" | "issuance" | "suppliers";

const CAMPUS_OPTIONS = [
  "Gulberg",
  "DHA Phase 5",
  "F-8 Islamabad",
  "Clifton",
  "Bahria Town",
];

export function InventoryClient() {
  const [activeTab, setActiveTab] = React.useState<InventoryViewTab>("stock");

  const [items, setItems] = React.useState<InventoryItemRecord[]>(
    INITIAL_INVENTORY_ITEMS
  );
  const [orders, setOrders] = React.useState<PurchaseOrderRecord[]>(
    INITIAL_PURCHASE_ORDERS
  );
  const [issuances, setIssuances] = React.useState<
    DepartmentalIssuanceRecord[]
  >(INITIAL_ISSUANCE_RECORDS);
  const [suppliers] =
    React.useState<InventorySupplierRecord[]>(INITIAL_SUPPLIERS);

  // Stock Item View & Edit Modals
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(
    null
  );
  const [itemModalOpen, setItemModalOpen] = React.useState(false);
  const [itemModalTab, setItemModalTab] = React.useState<
    "overview" | "adjust" | "ledger"
  >("overview");

  const [itemFormOpen, setItemFormOpen] = React.useState(false);
  const [editingItem, setEditingItem] =
    React.useState<InventoryItemRecord | null>(null);

  // Purchase Order View & Create Modals
  const [selectedPoId, setSelectedPoId] = React.useState<string | null>(null);
  const [poViewOpen, setPoViewOpen] = React.useState(false);
  const [poFormOpen, setPoFormOpen] = React.useState(false);

  // Departmental Issuance View & Create Modals
  const [selectedIssuanceId, setSelectedIssuanceId] = React.useState<
    string | null
  >(null);
  const [issuanceViewOpen, setIssuanceViewOpen] = React.useState(false);
  const [issuanceFormOpen, setIssuanceFormOpen] = React.useState(false);

  // Supplier View Modal
  const [selectedSupplierId, setSelectedSupplierId] = React.useState<
    string | null
  >(null);
  const [supplierViewOpen, setSupplierViewOpen] = React.useState(false);

  const selectedItem = React.useMemo(
    () => items.find((i) => i.id === selectedItemId) ?? null,
    [items, selectedItemId]
  );

  const selectedPo = React.useMemo(
    () => orders.find((o) => o.id === selectedPoId) ?? null,
    [orders, selectedPoId]
  );

  const selectedIssuance = React.useMemo(
    () => issuances.find((r) => r.id === selectedIssuanceId) ?? null,
    [issuances, selectedIssuanceId]
  );

  const selectedSupplier = React.useMemo(
    () => suppliers.find((s) => s.id === selectedSupplierId) ?? null,
    [suppliers, selectedSupplierId]
  );

  /* ───────────────────────── Dynamic KPI Aggregates ───────────────────────── */

  const stockKpis = React.useMemo(() => {
    const totalValuation = items.reduce((s, i) => s + i.totalValue, 0);
    const inStockCount = items.filter((i) => i.status === "In Stock").length;
    const lowStockCount = items.filter((i) => i.status === "Low Stock").length;
    const outOfStockCount = items.filter(
      (i) => i.status === "Out of Stock"
    ).length;
    return {
      totalValuation,
      totalSkus: items.length,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      alertTotal: lowStockCount + outOfStockCount,
    };
  }, [items]);

  const poKpis = React.useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== "Cancelled");
    const totalNet = activeOrders.reduce((s, o) => s + o.netPayable, 0);
    const receivedOrders = orders.filter((o) => o.status === "Received");
    const receivedVal = receivedOrders.reduce((s, o) => s + o.netPayable, 0);
    const openOrders = orders.filter(
      (o) => o.status === "Ordered" || o.status === "Pending"
    );
    const openVal = openOrders.reduce((s, o) => s + o.netPayable, 0);
    const totalWht = activeOrders.reduce((s, o) => s + o.whtDeduction, 0);
    return {
      totalNet,
      totalCount: orders.length,
      receivedVal,
      receivedCount: receivedOrders.length,
      openVal,
      openCount: openOrders.length,
      totalWht,
    };
  }, [orders]);

  const issuanceKpis = React.useMemo(() => {
    const totalValuation = issuances.reduce((s, r) => s + r.totalValuation, 0);
    const issuedCount = issuances.filter((r) => r.status === "Issued").length;
    const returnableCount = issuances.filter((r) => r.returnable).length;
    const pendingCount = issuances.filter((r) => r.status === "Pending").length;
    return {
      totalValuation,
      totalCount: issuances.length,
      issuedCount,
      returnableCount,
      pendingCount,
    };
  }, [issuances]);

  const supplierKpis = React.useMemo(() => {
    const totalProcurement = suppliers.reduce(
      (s, v) => s + v.totalProcurementValue,
      0
    );
    const totalOrders = suppliers.reduce((s, v) => s + v.totalOrdersCount, 0);
    const totalPayable = suppliers.reduce(
      (s, v) => s + v.outstandingPayable,
      0
    );
    const verifiedCount = suppliers.filter(
      (v) => v.status === "Verified"
    ).length;
    return {
      totalProcurement,
      totalOrders,
      totalPayable,
      verifiedCount,
    };
  }, [suppliers]);

  /* ───────────────────────── Interactive Handlers ───────────────────────── */

  const handleAdjustStock = React.useCallback(
    (
      itemId: string,
      payload: {
        mode: "restock" | "issue" | "audit";
        quantityInput: number;
        voucherRef: string;
        departmentOrVendor: string;
        actor: string;
        remarks: string;
      }
    ) => {
      const today = new Date().toISOString().slice(0, 10);
      let skuCode = "";

      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;
          skuCode = item.sku;

          const newQty =
            payload.mode === "restock"
              ? item.quantity + payload.quantityInput
              : payload.mode === "issue"
              ? Math.max(0, item.quantity - payload.quantityInput)
              : payload.quantityInput;

          const newStatus = computeStockStatus(newQty, item.reorderLevel);
          const qtyChangeLabel =
            payload.mode === "restock"
              ? `+${payload.quantityInput} ${item.unit}`
              : payload.mode === "issue"
              ? `-${payload.quantityInput} ${item.unit}`
              : `Verified (${newQty} ${item.unit})`;

          return {
            ...item,
            quantity: newQty,
            totalValue: newQty * item.unitCost,
            status: newStatus,
            lastRestocked:
              payload.mode === "restock" ? today : item.lastRestocked,
            movementLogs: [
              {
                id: `${item.id}-mov-${Date.now()}`,
                timestamp: `${today} 04:15 PM`,
                voucherRef: payload.voucherRef,
                type:
                  payload.mode === "restock"
                    ? "GRN Received"
                    : payload.mode === "issue"
                    ? "Dept Issuance"
                    : "Audit Check",
                qtyChange: qtyChangeLabel,
                balanceAfter: newQty,
                departmentOrVendor: payload.departmentOrVendor,
                actor: payload.actor,
                remarks: payload.remarks,
              },
              ...item.movementLogs,
            ],
          };
        })
      );

      toast.success(
        `Store stock balance for ${skuCode} updated and posted to ledger.`
      );
    },
    []
  );

  const handleSaveStockItem = React.useCallback(
    (record: InventoryItemRecord) => {
      setItems((prev) => {
        const exists = prev.some((i) => i.id === record.id);
        return exists
          ? prev.map((i) => (i.id === record.id ? record : i))
          : [record, ...prev];
      });
    },
    []
  );

  const handleUpdatePoStatus = React.useCallback(
    (
      poId: string,
      status: PurchaseOrderStatus,
      grnNumber: string,
      approvedBy: string
    ) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === poId ? { ...o, status, grnNumber, approvedBy } : o
        )
      );
      toast.success(`Purchase Order status updated to ${status}.`);
    },
    []
  );

  const handleCreatePo = React.useCallback((newPo: PurchaseOrderRecord) => {
    setOrders((prev) => [newPo, ...prev]);
  }, []);

  const handleCreateIssuance = React.useCallback(
    (newIssuance: DepartmentalIssuanceRecord) => {
      setIssuances((prev) => [newIssuance, ...prev]);
      // Also deduct from matching stock item
      setItems((prev) =>
        prev.map((item) => {
          if (item.sku !== newIssuance.sku) return item;
          const nextQty = Math.max(
            0,
            item.quantity - newIssuance.quantityIssued
          );
          return {
            ...item,
            quantity: nextQty,
            totalValue: nextQty * item.unitCost,
            status: computeStockStatus(nextQty, item.reorderLevel),
          };
        })
      );
    },
    []
  );

  const handleUpdateIssuanceStatus = React.useCallback(
    (id: string, status: IssuanceStatus) => {
      setIssuances((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      toast.success(`Departmental issuance status updated to ${status}.`);
    },
    []
  );

  /* ───────────────────────── 1. Store Stock Register Columns ───────────────────────── */

  const stockColumns = React.useMemo<Column<InventoryItemRecord>[]>(
    () => [
      {
        key: "sku",
        header: "SKU #",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/50 px-2 py-0.5 font-mono text-xs font-bold text-[#091d3e]">
              {r.sku}
            </span>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              Restocked {formatDate(r.lastRestocked)}
            </p>
          </div>
        ),
      },
      {
        key: "name",
        header: "Store Item & Category",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center max-w-[240px] mx-auto">
            <p className="truncate text-xs font-semibold text-foreground">
              {r.name}
            </p>
            <p className="truncate text-[10.5px] text-muted-foreground">
              {r.category} · Custodian: {r.custodian}
            </p>
          </div>
        ),
      },
      {
        key: "campus",
        header: "Campus & Bin Location",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center max-w-[190px] mx-auto">
            <p className="text-xs font-semibold text-foreground">{r.campus}</p>
            <p className="truncate text-[10.5px] text-muted-foreground">
              {r.storeLocation}
            </p>
          </div>
        ),
      },
      {
        key: "quantity",
        header: "On-Hand Stock",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span
              className={cn(
                "font-mono text-xs font-bold tabular-nums",
                r.status === "Out of Stock"
                  ? "text-danger"
                  : r.status === "Low Stock"
                  ? "text-amber-700"
                  : "text-foreground"
              )}
            >
              {r.quantity.toLocaleString()} {r.unit}
            </span>
            <p className="font-mono text-[10px] text-muted-foreground">
              Reorder @ {r.reorderLevel} {r.unit}
            </p>
          </div>
        ),
      },
      {
        key: "valuation",
        header: "Unit Cost & Valuation",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-bold tabular-nums text-emerald-700">
              {formatCurrency(r.totalValue)}
            </span>
            <p className="font-mono text-[10px] text-muted-foreground">
              {formatCurrency(r.unitCost)} / {r.unit}
            </p>
          </div>
        ),
      },
      {
        key: "supplier",
        header: "Approved Supplier",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center max-w-[180px] mx-auto">
            <p className="truncate text-xs font-semibold text-foreground">
              {r.supplierName}
            </p>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              NTN: {r.supplierNtn}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Stock Status",
        align: "center",
        cell: (r) => (
          <div className="flex justify-center">
            <StatusBadge status={r.status} />
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        cell: (r) => (
          <div className="flex items-center justify-center">
            <ActionButton
              tone="outline"
              size="xs"
              title="View stock bin card, adjust stock & movement ledger"
              onClick={() => {
                setSelectedItemId(r.id);
                setItemModalTab("overview");
                setItemModalOpen(true);
              }}
            >
              <Eye className="size-3.5" />
              <span>View</span>
            </ActionButton>
          </div>
        ),
      },
    ],
    []
  );

  const stockFilters = React.useMemo<FilterDef<InventoryItemRecord>[]>(
    () => [
      {
        key: "campus",
        label: "Campus",
        allLabel: "All Campuses",
        options: CAMPUS_OPTIONS,
        getValue: (r) => r.campus,
      },
      {
        key: "category",
        label: "Category",
        allLabel: "All Categories",
        options: [...new Set(items.map((i) => i.category))],
        getValue: (r) => r.category,
      },
      {
        key: "status",
        label: "Stock Status",
        allLabel: "All Statuses",
        options: ["In Stock", "Low Stock", "Out of Stock"],
        getValue: (r) => r.status,
      },
    ],
    [items]
  );

  /* ───────────────────────── 2. Purchase Orders Columns ───────────────────────── */

  const poColumns = React.useMemo<Column<PurchaseOrderRecord>[]>(
    () => [
      {
        key: "poNumber",
        header: "PO # / GRN #",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/50 px-2 py-0.5 font-mono text-xs font-bold text-[#091d3e]">
              {r.poNumber}
            </span>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              {formatDate(r.orderDate)} · {r.grnNumber}
            </p>
          </div>
        ),
      },
      {
        key: "title",
        header: "Procurement Order & Items",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center max-w-[240px] mx-auto">
            <p className="truncate text-xs font-semibold text-foreground">
              {r.title}
            </p>
            <p className="truncate text-[10.5px] text-muted-foreground">
              {r.category} · {r.orderedQty} {r.unit}
            </p>
          </div>
        ),
      },
      {
        key: "supplier",
        header: "Supplier & NTN",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-xs font-semibold text-foreground">
              {r.supplierName}
            </p>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              NTN: {r.supplierNtn} · {r.supplierBank}
            </p>
          </div>
        ),
      },
      {
        key: "campus",
        header: "Campus & Delivery",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-xs font-semibold text-foreground">{r.campus}</p>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              ETA: {formatDate(r.expectedDelivery)}
            </p>
          </div>
        ),
      },
      {
        key: "gross",
        header: "Gross & Tax",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
              {formatCurrency(r.grossAmount)}
            </span>
            <p className="font-mono text-[10px] text-muted-foreground">
              GST: +{formatCurrency(r.gstAmount)} · WHT: -
              {formatCurrency(r.whtDeduction)}
            </p>
          </div>
        ),
      },
      {
        key: "netPayable",
        header: "Net Payable",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-bold tabular-nums text-emerald-700">
              {formatCurrency(r.netPayable)}
            </span>
            <p className="text-[10px] text-muted-foreground">
              {r.paymentTerms}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: "PO Status",
        align: "center",
        cell: (r) => (
          <div className="flex justify-center">
            <StatusBadge status={r.status} />
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        cell: (r) => (
          <div className="flex items-center justify-center">
            <ActionButton
              tone="outline"
              size="xs"
              title="View Purchase Order, verify GRN & download PO PDF"
              onClick={() => {
                setSelectedPoId(r.id);
                setPoViewOpen(true);
              }}
            >
              <Eye className="size-3.5" />
              <span>View</span>
            </ActionButton>
          </div>
        ),
      },
    ],
    []
  );

  /* ───────────────────────── 3. Departmental Issuance Columns ───────────────────────── */

  const issuanceColumns = React.useMemo<Column<DepartmentalIssuanceRecord>[]>(
    () => [
      {
        key: "issueVoucherNo",
        header: "Issue Voucher #",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/50 px-2 py-0.5 font-mono text-xs font-bold text-[#091d3e]">
              {r.issueVoucherNo}
            </span>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              {formatDate(r.issueDate)} · {r.requisitionNo}
            </p>
          </div>
        ),
      },
      {
        key: "itemName",
        header: "Issued Store Item & SKU",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center max-w-[230px] mx-auto">
            <p className="truncate text-xs font-semibold text-foreground">
              {r.itemName}
            </p>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              {r.sku} · {r.category}
            </p>
          </div>
        ),
      },
      {
        key: "department",
        header: "Receiving Department & Custodian",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center max-w-[220px] mx-auto">
            <p className="truncate text-xs font-semibold text-foreground">
              {r.department}
            </p>
            <p className="truncate text-[10.5px] text-muted-foreground">
              {r.issuedTo}
            </p>
          </div>
        ),
      },
      {
        key: "campus",
        header: "Campus",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-xs font-semibold text-foreground">{r.campus}</p>
            <p className="text-[10.5px] text-muted-foreground">
              {r.returnable ? "Returnable Asset" : "Consumable"}
            </p>
          </div>
        ),
      },
      {
        key: "quantityIssued",
        header: "Qty & Valuation",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-bold tabular-nums text-emerald-700">
              {formatCurrency(r.totalValuation)}
            </span>
            <p className="font-mono text-[10px] text-muted-foreground">
              {r.quantityIssued} {r.unit} × {formatCurrency(r.unitCost)}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        cell: (r) => (
          <div className="flex justify-center">
            <StatusBadge status={r.status} />
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        cell: (r) => (
          <div className="flex items-center justify-center">
            <ActionButton
              tone="outline"
              size="xs"
              title="View departmental issuance slip & update return status"
              onClick={() => {
                setSelectedIssuanceId(r.id);
                setIssuanceViewOpen(true);
              }}
            >
              <Eye className="size-3.5" />
              <span>View</span>
            </ActionButton>
          </div>
        ),
      },
    ],
    []
  );

  /* ───────────────────────── 4. Approved Suppliers Columns ───────────────────────── */

  const supplierColumns = React.useMemo<Column<InventorySupplierRecord>[]>(
    () => [
      {
        key: "supplierCode",
        header: "Vendor Code",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/50 px-2 py-0.5 font-mono text-xs font-bold text-[#091d3e]">
              {r.supplierCode}
            </span>
            <p className="text-[10.5px] text-muted-foreground">{r.city}</p>
          </div>
        ),
      },
      {
        key: "companyName",
        header: "Supplier & Supply Category",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-xs font-semibold text-foreground">
              {r.companyName}
            </p>
            <p className="text-[10.5px] text-muted-foreground">
              {r.category} · Rating: {r.rating}
            </p>
          </div>
        ),
      },
      {
        key: "ntn",
        header: "FBR NTN & STRN",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-semibold text-foreground">
              NTN: {r.ntn}
            </span>
            <p className="font-mono text-[10px] text-muted-foreground">
              STRN: {r.strn}
            </p>
          </div>
        ),
      },
      {
        key: "contact",
        header: "Contact Person & Phone",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-xs font-semibold text-foreground">
              {r.contactPerson}
            </p>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              {r.phone}
            </p>
          </div>
        ),
      },
      {
        key: "volume",
        header: "Procurement Volume",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-bold tabular-nums text-emerald-700">
              {formatCurrency(r.totalProcurementValue)}
            </span>
            <p className="font-mono text-[10px] text-muted-foreground">
              {r.totalOrdersCount} POs · Due:{" "}
              {formatCurrency(r.outstandingPayable)}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Vendor Status",
        align: "center",
        cell: (r) => (
          <div className="flex justify-center">
            <StatusBadge status={r.status} />
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        cell: (r) => (
          <div className="flex items-center justify-center">
            <ActionButton
              tone="outline"
              size="xs"
              title="View vendor tax profile, banking IBAN & contract terms"
              onClick={() => {
                setSelectedSupplierId(r.id);
                setSupplierViewOpen(true);
              }}
            >
              <Eye className="size-3.5" />
              <span>View</span>
            </ActionButton>
          </div>
        ),
      },
    ],
    []
  );

  /* ───────────────────────── Header Export & Primary Action ───────────────────────── */

  const handlePrint = () => {
    const ok = printInventoryRegister(items);
    if (ok)
      toast.info("Opening print preview for institutional store inventory…");
    else toast.error("Pop-up blocked. Please allow pop-ups to print.");
  };

  const handleExportPdf = () => {
    if (activeTab === "stock") {
      exportInventoryStockPdf(items);
      toast.success(
        `Store stock & valuation register (${items.length} SKUs) downloaded as PDF.`
      );
    } else if (activeTab === "orders") {
      exportPurchaseOrdersPdf(orders);
      toast.success(
        `Purchase orders register (${orders.length} POs) downloaded as PDF.`
      );
    } else if (activeTab === "issuance") {
      exportIssuancePdf(issuances);
      toast.success(
        `Departmental issuance register (${issuances.length} vouchers) downloaded as PDF.`
      );
    } else {
      exportSuppliersPdf(suppliers);
      toast.success(
        `Approved suppliers directory (${suppliers.length} vendors) downloaded as PDF.`
      );
    }
  };

  const handlePrimaryAction = () => {
    if (activeTab === "orders") {
      setPoFormOpen(true);
    } else if (activeTab === "issuance") {
      setIssuanceFormOpen(true);
    } else {
      setEditingItem(null);
      setItemFormOpen(true);
    }
  };

  const primaryActionLabel =
    activeTab === "orders"
      ? "Create Purchase Order"
      : activeTab === "issuance"
      ? "Issue Store Stock"
      : "Add Stock Item";

  const activeTabMeta = {
    stock: {
      label: "Store Stock Register",
      count: items.length,
      icon: Package,
      subtitle: `Central Store Valuation Ledger · ${stockKpis.inStockCount} SKUs Healthy · ${stockKpis.alertTotal} Reorder Alerts`,
    },
    orders: {
      label: "Purchase Orders (POs)",
      count: orders.length,
      icon: ShoppingCart,
      subtitle: `Vendor Procurement Orders · ${poKpis.receivedCount} GRNs Verified`,
    },
    issuance: {
      label: "Departmental Issuance",
      count: issuances.length,
      icon: Send,
      subtitle: `Campus Requisition Releases · ${issuanceKpis.issuedCount} Active Issuances`,
    },
    suppliers: {
      label: "Approved Suppliers",
      count: suppliers.length,
      icon: Truck,
      subtitle: `FBR Verified Institutional Vendors · ${supplierKpis.verifiedCount} Active Contracts`,
    },
  }[activeTab];

  const ActiveTabIcon = activeTabMeta.icon;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventory"
        className="mb-0 lg:mb-0"
        actions={
          <>
            <ActionButton tone="outline" size="md" onClick={handlePrint}>
              <Printer />
              <span>Print Register</span>
            </ActionButton>
            <ActionButton tone="pdf" size="md" onClick={handleExportPdf}>
              <Download />
              <span>Export PDF</span>
            </ActionButton>
            <ActionButton tone="primary" size="md" onClick={handlePrimaryAction}>
              <Plus />
              <span>{primaryActionLabel}</span>
            </ActionButton>
          </>
        }
      />

      {/* Dynamic 4-Card KPI Strip */}
      {activeTab === "stock" && (
        <StatGrid>
          <StatCard
            label="Total Stock Valuation"
            value={`${formatCurrencyCompact(stockKpis.totalValuation)} (${stockKpis.totalSkus} SKUs)`}
            icon={Wallet}
          />
          <StatCard
            label="Healthy Store Stock"
            value={`${stockKpis.inStockCount} SKUs In Stock`}
            icon={ShieldCheck}
          />
          <StatCard
            label="Low / Out of Stock Alerts"
            value={`${stockKpis.lowStockCount} Low · ${stockKpis.outOfStockCount} Out`}
            icon={AlertTriangle}
          />
          <StatCard
            label="Approved Vendors"
            value={`${suppliers.length} FBR Verified`}
            icon={Truck}
          />
        </StatGrid>
      )}

      {activeTab === "orders" && (
        <StatGrid>
          <StatCard
            label="Active PO Volume"
            value={`${formatCurrencyCompact(poKpis.totalNet)} (${poKpis.totalCount})`}
            icon={ShoppingCart}
          />
          <StatCard
            label="GRN Verified & Received"
            value={`${formatCurrencyCompact(poKpis.receivedVal)} (${poKpis.receivedCount})`}
            icon={ShieldCheck}
          />
          <StatCard
            label="Open / In-Transit POs"
            value={`${formatCurrencyCompact(poKpis.openVal)} (${poKpis.openCount})`}
            icon={Truck}
          />
          <StatCard
            label="WHT Tax Deducted"
            value={formatCurrencyCompact(poKpis.totalWht)}
            icon={Wallet}
          />
        </StatGrid>
      )}

      {activeTab === "issuance" && (
        <StatGrid>
          <StatCard
            label="Issued Stock Valuation"
            value={`${formatCurrencyCompact(issuanceKpis.totalValuation)} (${issuanceKpis.totalCount})`}
            icon={Send}
          />
          <StatCard
            label="Released to Departments"
            value={`${issuanceKpis.issuedCount} Active Vouchers`}
            icon={Boxes}
          />
          <StatCard
            label="Returnable Lab/IT Assets"
            value={`${issuanceKpis.returnableCount} Asset Lots`}
            icon={Layers}
          />
          <StatCard
            label="Pending Store Release"
            value={`${issuanceKpis.pendingCount} Requisition`}
            icon={AlertTriangle}
          />
        </StatGrid>
      )}

      {activeTab === "suppliers" && (
        <StatGrid>
          <StatCard
            label="Total Procurement Volume"
            value={`${formatCurrencyCompact(supplierKpis.totalProcurement)} (${supplierKpis.totalOrders} POs)`}
            icon={Landmark}
          />
          <StatCard
            label="FBR Verified Vendors"
            value={`${supplierKpis.verifiedCount} Active Panel`}
            icon={ShieldCheck}
          />
          <StatCard
            label="Outstanding Payables"
            value={formatCurrencyCompact(supplierKpis.totalPayable)}
            icon={Wallet}
          />
          <StatCard
            label="Vendor SLA Rating"
            value="4.8 / 5.0 Avg"
            icon={TrendingUp}
          />
        </StatGrid>
      )}

      {/* Executive Register Selector Dropdown & Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="group inline-flex h-9 cursor-pointer items-center gap-2.5 rounded-[4px] border border-brand/20 bg-white px-3 text-xs font-semibold text-[#091d3e] shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.05)] transition-colors hover:border-brand/35 hover:bg-brand-50/40 focus:outline-none focus:ring-2 focus:ring-brand/15">
            <ActiveTabIcon className="size-3.5 shrink-0 text-brand" />
            <span className="font-semibold text-[#091d3e]">
              {activeTabMeta.label}
            </span>
            <span className="rounded-[3px] border border-brand/15 bg-brand-50/80 px-1.5 py-0.5 font-mono text-[11px] font-bold tabular-nums text-brand">
              {activeTabMeta.count}
            </span>
            <ChevronDown className="ml-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform duration-150 group-data-open:rotate-180" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className="w-[255px] rounded-[6px] border border-brand/15 bg-white p-1 shadow-[0_10px_28px_-6px_rgb(9_29_62/0.18),0_2px_6px_rgb(9_29_62/0.06)] ring-0"
          >
            {(
              [
                {
                  key: "stock" as const,
                  label: "Store Stock Register",
                  count: items.length,
                  icon: Package,
                },
                {
                  key: "orders" as const,
                  label: "Purchase Orders (POs)",
                  count: orders.length,
                  icon: ShoppingCart,
                },
                {
                  key: "issuance" as const,
                  label: "Departmental Issuance",
                  count: issuances.length,
                  icon: Send,
                },
                {
                  key: "suppliers" as const,
                  label: "Approved Suppliers",
                  count: suppliers.length,
                  icon: Truck,
                },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.key;
              return (
                <DropdownMenuItem
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-[4px] px-2.5 py-2 text-xs cursor-pointer transition-colors",
                    isSelected
                      ? "bg-brand-50/80 font-semibold text-[#091d3e] focus:bg-brand-50"
                      : "font-medium text-foreground/85 hover:bg-slate-50 focus:bg-slate-100/80"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon
                      className={cn(
                        "size-3.5 shrink-0",
                        isSelected ? "text-[#091d3e]" : "text-muted-foreground"
                      )}
                    />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "min-w-[26px] rounded-[3px] px-1.5 py-0.5 text-center font-mono text-[10.5px] font-bold tabular-nums",
                        isSelected
                          ? "bg-[#091d3e] text-white"
                          : "bg-slate-100 text-muted-foreground"
                      )}
                    >
                      {item.count}
                    </span>
                    <span className="grid size-3.5 shrink-0 place-items-center">
                      {isSelected && (
                        <Check className="size-3.5 text-[#091d3e] stroke-[2.5]" />
                      )}
                    </span>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span className="font-medium">{activeTabMeta.subtitle}</span>
        </div>
      </div>

      {/* Main Register DataTable */}
      {activeTab === "stock" && (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={items}
            columns={stockColumns}
            getRowId={(r) => r.id}
            filters={stockFilters}
            searchPlaceholder="Search SKU #, item name, store rack, custodian or supplier…"
            searchFn={(r, q) =>
              r.sku.toLowerCase().includes(q) ||
              r.name.toLowerCase().includes(q) ||
              r.category.toLowerCase().includes(q) ||
              r.storeLocation.toLowerCase().includes(q) ||
              r.supplierName.toLowerCase().includes(q) ||
              r.custodian.toLowerCase().includes(q)
            }
            pageSize={8}
            emptyMessage="No store inventory items match the selected filters."
          />
        </SectionCard>
      )}

      {activeTab === "orders" && (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={orders}
            columns={poColumns}
            getRowId={(r) => r.id}
            searchPlaceholder="Search PO #, GRN #, order title, supplier or NTN…"
            searchFn={(r, q) =>
              r.poNumber.toLowerCase().includes(q) ||
              r.grnNumber.toLowerCase().includes(q) ||
              r.title.toLowerCase().includes(q) ||
              r.supplierName.toLowerCase().includes(q) ||
              r.supplierNtn.toLowerCase().includes(q) ||
              r.campus.toLowerCase().includes(q)
            }
            pageSize={8}
            emptyMessage="No purchase orders match the search query."
          />
        </SectionCard>
      )}

      {activeTab === "issuance" && (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={issuances}
            columns={issuanceColumns}
            getRowId={(r) => r.id}
            searchPlaceholder="Search issue voucher #, requisition #, item, department or custodian…"
            searchFn={(r, q) =>
              r.issueVoucherNo.toLowerCase().includes(q) ||
              r.requisitionNo.toLowerCase().includes(q) ||
              r.itemName.toLowerCase().includes(q) ||
              r.sku.toLowerCase().includes(q) ||
              r.department.toLowerCase().includes(q) ||
              r.issuedTo.toLowerCase().includes(q)
            }
            pageSize={8}
            emptyMessage="No departmental issuance records match the search query."
          />
        </SectionCard>
      )}

      {activeTab === "suppliers" && (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={suppliers}
            columns={supplierColumns}
            getRowId={(r) => r.id}
            searchPlaceholder="Search vendor code, company name, NTN, contact person or city…"
            searchFn={(r, q) =>
              r.supplierCode.toLowerCase().includes(q) ||
              r.companyName.toLowerCase().includes(q) ||
              r.ntn.toLowerCase().includes(q) ||
              r.contactPerson.toLowerCase().includes(q) ||
              r.city.toLowerCase().includes(q) ||
              r.category.toLowerCase().includes(q)
            }
            pageSize={8}
            emptyMessage="No approved suppliers match the search query."
          />
        </SectionCard>
      )}

      {/* Interactive Modals */}
      <InventoryItemModal
        item={selectedItem}
        open={itemModalOpen}
        onOpenChange={setItemModalOpen}
        initialTab={itemModalTab}
        onAdjustStock={handleAdjustStock}
        onEditItem={(it) => {
          setEditingItem(it);
          setItemFormOpen(true);
        }}
      />

      <InventoryFormModal
        open={itemFormOpen}
        onOpenChange={setItemFormOpen}
        initialData={editingItem}
        totalCount={items.length}
        onSave={handleSaveStockItem}
      />

      <PurchaseOrderViewModal
        po={selectedPo}
        open={poViewOpen}
        onOpenChange={setPoViewOpen}
        onUpdatePoStatus={handleUpdatePoStatus}
      />

      <PurchaseOrderFormModal
        open={poFormOpen}
        onOpenChange={setPoFormOpen}
        totalCount={orders.length}
        onSave={handleCreatePo}
      />

      <IssuanceViewModal
        issuance={selectedIssuance}
        open={issuanceViewOpen}
        onOpenChange={setIssuanceViewOpen}
        onUpdateIssuanceStatus={handleUpdateIssuanceStatus}
      />

      <IssuanceFormModal
        open={issuanceFormOpen}
        onOpenChange={setIssuanceFormOpen}
        items={items}
        totalCount={issuances.length}
        onSave={handleCreateIssuance}
      />

      <SupplierViewModal
        supplier={selectedSupplier}
        open={supplierViewOpen}
        onOpenChange={setSupplierViewOpen}
      />
    </div>
  );
}
