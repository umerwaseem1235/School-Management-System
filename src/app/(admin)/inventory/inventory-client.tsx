"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  Boxes,
  CalendarClock,
  Check,
  ChevronDown,
  ClipboardList,
  Download,
  Edit,
  Eye,
  Layers,
  Package,
  PackageMinus,
  Plus,
  Printer,
  RotateCcw,
  ShieldCheck,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { cn } from "@/lib/utils";
import { formatDate, formatNumber } from "@/lib/format";
import {
  computeStockStatus,
  INITIAL_INVENTORY_ITEMS,
  INITIAL_STOCK_ISSUANCES,
  type InventoryItemRecord,
  type StockIssuanceRecord,
} from "@/lib/mock/inventory";
import {
  exportInventoryStockPdf,
  exportIssuanceRegisterPdf,
  printInventoryRegister,
  printIssuanceRegister,
} from "./inventory-export";
import { InventoryItemModal } from "./inventory-item-modal";
import { InventoryFormModal } from "./inventory-form-modal";
import {
  ISSUANCE_TODAY,
  IssuanceStatusPill,
  IssuanceViewModal,
  IssueStockModal,
  ReturnStockModal,
  isIssuanceOverdue,
} from "./inventory-issue-modal";

type InventoryTab = "stock" | "issuance";

export function InventoryClient() {
  const [activeTab, setActiveTab] = React.useState<InventoryTab>("stock");

  const [items, setItems] = React.useState<InventoryItemRecord[]>(
    INITIAL_INVENTORY_ITEMS
  );
  const [issuances, setIssuances] = React.useState<StockIssuanceRecord[]>(
    INITIAL_STOCK_ISSUANCES
  );

  // Adjust Stock Modal State
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(
    null
  );
  const [adjustModalOpen, setAdjustModalOpen] = React.useState(false);

  // Add / Edit Stock Item Modal State
  const [editingItem, setEditingItem] =
    React.useState<InventoryItemRecord | null>(null);
  const [addFormOpen, setAddFormOpen] = React.useState(false);

  // Issue Stock Modal State
  const [issueModalOpen, setIssueModalOpen] = React.useState(false);
  const [issuePreselectId, setIssuePreselectId] = React.useState<
    string | null
  >(null);

  // Issue Slip (View) & Return Modal State
  const [viewIssuanceId, setViewIssuanceId] = React.useState<string | null>(
    null
  );
  const [returnIssuanceId, setReturnIssuanceId] = React.useState<
    string | null
  >(null);

  const selectedItem = React.useMemo(
    () => items.find((i) => i.id === selectedItemId) ?? null,
    [items, selectedItemId]
  );
  const viewIssuance = React.useMemo(
    () => issuances.find((r) => r.id === viewIssuanceId) ?? null,
    [issuances, viewIssuanceId]
  );
  const returnIssuance = React.useMemo(
    () => issuances.find((r) => r.id === returnIssuanceId) ?? null,
    [issuances, returnIssuanceId]
  );
  const returnItemStock = React.useMemo(
    () =>
      returnIssuance
        ? items.find((i) => i.id === returnIssuance.itemId)?.quantity ?? 0
        : 0,
    [items, returnIssuance]
  );

  const nextIssueNumber = React.useMemo(() => {
    const nums = issuances
      .map((r) => Number(r.issueNo.replace(/\D/g, "")))
      .filter((n) => Number.isFinite(n));
    return (nums.length ? Math.max(...nums) : 1000) + 1;
  }, [issuances]);

  /* ───────────────────────── Dynamic KPI Aggregates ───────────────────────── */

  const stockKpis = React.useMemo(() => {
    const totalItems = items.length;
    const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
    const inStockCount = items.filter((i) => i.status === "In Stock").length;
    const lowStockCount = items.filter((i) => i.status === "Low Stock").length;
    const outOfStockCount = items.filter(
      (i) => i.status === "Out of Stock"
    ).length;
    const alertTotal = lowStockCount + outOfStockCount;

    return {
      totalItems,
      totalUnits,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      alertTotal,
    };
  }, [items]);

  const issuanceKpis = React.useMemo(() => {
    const totalIssuances = issuances.length;
    const unitsIssued = issuances.reduce((s, r) => s + r.quantity, 0);
    const pendingReturns = issuances.filter((r) => r.status === "Issued").length;
    const overdue = issuances.filter(isIssuanceOverdue).length;
    const issuedToday = issuances.filter(
      (r) => r.issueDate === ISSUANCE_TODAY
    ).length;
    return { totalIssuances, unitsIssued, pendingReturns, overdue, issuedToday };
  }, [issuances]);

  /* ───────────────────────── Interactive Handlers ───────────────────────── */

  const handleAdjustStock = React.useCallback(
    (itemId: string, delta: number) => {
      let itemName = "";
      let previousQty = 0;
      let updatedQty = 0;

      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;
          itemName = item.name;
          previousQty = item.quantity;
          updatedQty = Math.max(0, item.quantity + delta);

          return {
            ...item,
            quantity: updatedQty,
            lastUpdated: ISSUANCE_TODAY,
            status: computeStockStatus(updatedQty, item.reorderLevel),
          };
        })
      );

      const sign = delta > 0 ? `+${delta}` : `${delta}`;
      toast.success(
        `${itemName} stock adjusted (${sign}): ${previousQty} → ${updatedQty}`
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

  /** Issue → automatically deducts the issued quantity from store stock. */
  const handleIssueStock = React.useCallback(
    (record: StockIssuanceRecord) => {
      const item = items.find((i) => i.id === record.itemId);
      if (!item) return;
      if (record.quantity > item.quantity) {
        toast.error(`Only ${item.quantity} ${item.unit} available.`);
        return;
      }
      const updatedQty = item.quantity - record.quantity;
      const newStatus = computeStockStatus(updatedQty, item.reorderLevel);

      setItems((prev) =>
        prev.map((i) =>
          i.id === record.itemId
            ? {
                ...i,
                quantity: updatedQty,
                lastUpdated: record.issueDate,
                status: newStatus,
              }
            : i
        )
      );
      setIssuances((prev) => [record, ...prev]);

      toast.success(
        `${record.issueNo}: ${record.quantity} ${item.unit} of "${item.name}" issued to ${record.issuedTo}. Stock ${item.quantity} → ${updatedQty}`
      );
      if (newStatus !== "In Stock") {
        toast.warning(
          `"${item.name}" is now ${newStatus} (${updatedQty} left, reorder at ${item.reorderLevel}).`
        );
      }
    },
    [items]
  );

  /** Return → adds the quantity back into store stock. */
  const handleConfirmReturn = React.useCallback(
    (record: StockIssuanceRecord, returnDate: string) => {
      const item = items.find((i) => i.id === record.itemId);
      const previousQty = item?.quantity ?? 0;
      const updatedQty = previousQty + record.quantity;

      setItems((prev) =>
        prev.map((i) =>
          i.id === record.itemId
            ? {
                ...i,
                quantity: updatedQty,
                lastUpdated: returnDate,
                status: computeStockStatus(updatedQty, i.reorderLevel),
              }
            : i
        )
      );
      setIssuances((prev) =>
        prev.map((r) =>
          r.id === record.id
            ? { ...r, status: "Returned", returnedDate: returnDate }
            : r
        )
      );
      setViewIssuanceId(null);
      toast.success(
        `${record.quantity} ${record.unit} of "${record.itemName}" returned by ${record.issuedTo}. Stock ${previousQty} → ${updatedQty}`
      );
    },
    [items]
  );

  const openIssueModal = (itemId: string | null = null) => {
    setIssuePreselectId(itemId);
    setIssueModalOpen(true);
  };

  const handlePrint = () => {
    const ok =
      activeTab === "stock"
        ? printInventoryRegister(items)
        : printIssuanceRegister(issuances);
    if (ok)
      toast.info(
        activeTab === "stock"
          ? "Opening print preview for store stock items…"
          : "Opening print preview for issuance register…"
      );
    else toast.error("Pop-up blocked. Please allow pop-ups to print.");
  };

  const handleExportPdf = () => {
    if (activeTab === "stock") {
      exportInventoryStockPdf(items);
      toast.success(
        `Store inventory register (${items.length} items) downloaded as PDF.`
      );
    } else {
      exportIssuanceRegisterPdf(issuances);
      toast.success(
        `Issuance register (${issuances.length} records) downloaded as PDF.`
      );
    }
  };

  /* ───────────────────────── Stock Items Columns ───────────────────────── */

  const stockColumns = React.useMemo<Column<InventoryItemRecord>[]>(
    () => [
      {
        key: "name",
        header: "Name",
        align: "center",
        className: "w-[23%] px-4 text-center",
        headerClassName: "w-[23%] px-4 text-center whitespace-nowrap",
        cell: (r) => (
          <div className="flex flex-col items-center justify-center gap-0.5 text-center">
            <p className="text-[13px] font-bold text-foreground">{r.name}</p>
            <span className="font-mono text-[10.5px] font-medium text-muted-foreground">
              {r.sku}
            </span>
          </div>
        ),
      },
      {
        key: "category",
        header: "Category",
        align: "center",
        className: "w-[14%] px-3 text-center",
        headerClassName: "w-[14%] px-3 text-center whitespace-nowrap",
        cell: (r) => (
          <div className="flex justify-center">
            <span className="inline-flex items-center rounded-md border border-slate-200/90 bg-slate-100/80 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-700">
              {r.category}
            </span>
          </div>
        ),
      },
      {
        key: "quantity",
        header: "Qty",
        align: "center",
        className: "w-[10%] px-3 text-center",
        headerClassName: "w-[10%] px-3 text-center whitespace-nowrap",
        cell: (r) => (
          <div className="flex flex-col items-center justify-center text-center">
            <span
              className={cn(
                "font-mono text-sm font-extrabold tabular-nums",
                r.status === "Out of Stock"
                  ? "text-danger"
                  : r.status === "Low Stock"
                  ? "text-amber-700"
                  : "text-[#091d3e]"
              )}
            >
              {formatNumber(r.quantity)}
            </span>
          </div>
        ),
      },
      {
        key: "reorderLevel",
        header: "Reorder At",
        align: "center",
        className: "w-[10%] px-3 text-center",
        headerClassName: "w-[10%] px-3 text-center whitespace-nowrap",
        cell: (r) => (
          <span className="font-mono text-xs font-semibold tabular-nums text-muted-foreground">
            {formatNumber(r.reorderLevel)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        className: "w-[12%] px-3 text-center",
        headerClassName: "w-[12%] px-3 text-center whitespace-nowrap",
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
        className: "w-[31%] px-3 text-center",
        headerClassName: "w-[31%] px-3 text-center whitespace-nowrap",
        cell: (r) => (
          <div className="flex items-center justify-center gap-1.5">
            <ActionButton
              tone="primary"
              size="xs"
              disabled={r.quantity <= 0}
              title={
                r.quantity <= 0
                  ? `${r.name} is out of stock`
                  : `Issue ${r.name} to a teacher / staff member`
              }
              onClick={() => openIssueModal(r.id)}
            >
              <PackageMinus className="size-3.5" />
              <span>Issue</span>
            </ActionButton>
            <ActionButton
              tone="outline"
              size="xs"
              title={`Adjust stock quantity for ${r.name}`}
              onClick={() => {
                setSelectedItemId(r.id);
                setAdjustModalOpen(true);
              }}
            >
              <ArrowUpDown className="size-3.5" />
              <span>Adjust</span>
            </ActionButton>
            <ActionButton
              tone="outline"
              size="xs"
              title={`Edit details for ${r.name}`}
              onClick={() => {
                setEditingItem(r);
                setAddFormOpen(true);
              }}
            >
              <Edit className="size-3.5" />
              <span>Edit</span>
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
        key: "category",
        label: "Category",
        allLabel: "All Categories",
        options: [...new Set(items.map((i) => i.category))],
        getValue: (r) => r.category,
      },
      {
        key: "status",
        label: "Status",
        allLabel: "All Statuses",
        options: ["In Stock", "Low Stock", "Out of Stock"],
        getValue: (r) => r.status,
      },
    ],
    [items]
  );

  /* ───────────────────────── Issuance Register Columns ───────────────────────── */

  const issuanceColumns = React.useMemo<Column<StockIssuanceRecord>[]>(
    () => [
      {
        key: "issueNo",
        header: "Issue # / Date",
        align: "center",
        className: "w-[15%] px-3 text-center",
        headerClassName: "w-[15%] px-3 text-center whitespace-nowrap",
        sortValue: (r) => r.issueDate + r.issueNo,
        cell: (r) => (
          <div className="flex flex-col items-center justify-center gap-0.5">
            <span className="font-mono text-xs font-extrabold text-[#091d3e]">
              {r.issueNo}
            </span>
            <span className="font-mono text-[10.5px] font-medium text-muted-foreground">
              {formatDate(r.issueDate)}
            </span>
          </div>
        ),
      },
      {
        key: "itemName",
        header: "Item",
        align: "center",
        className: "w-[25%] px-3 text-center",
        headerClassName: "w-[25%] px-3 text-center whitespace-nowrap",
        cell: (r) => (
          <p className="text-[13px] font-bold text-foreground truncate">
            {r.itemName}
          </p>
        ),
      },
      {
        key: "quantity",
        header: "Qty Issued",
        align: "center",
        className: "w-[12%] px-3 text-center",
        headerClassName: "w-[12%] px-3 text-center whitespace-nowrap",
        sortValue: (r) => r.quantity,
        cell: (r) => (
          <div className="flex flex-col items-center">
            <span className="font-mono text-sm font-extrabold tabular-nums text-rose-600">
              −{formatNumber(r.quantity)}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {r.unit}
            </span>
          </div>
        ),
      },
      {
        key: "issuedTo",
        header: "Issued To",
        align: "center",
        className: "w-[18%] px-3 text-center",
        headerClassName: "w-[18%] px-3 text-center whitespace-nowrap",
        cell: (r) => (
          <p className="text-[12.5px] font-bold text-foreground truncate">
            {r.issuedTo}
          </p>
        ),
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        className: "w-[14%] px-3 text-center",
        headerClassName: "w-[14%] px-3 text-center whitespace-nowrap",
        cell: (r) => (
          <div className="flex items-center justify-center">
            <IssuanceStatusPill status={r.status} overdue={isIssuanceOverdue(r)} />
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        className: "w-[16%] px-3 text-center",
        headerClassName: "w-[16%] px-3 text-center whitespace-nowrap",
        cell: (r) => (
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-[68px] shrink-0">
              <ActionButton
                tone="outline"
                size="xs"
                className="w-full justify-center"
                title={`View issue slip ${r.issueNo}`}
                onClick={() => setViewIssuanceId(r.id)}
              >
                <Eye className="size-3.5" />
                <span>View</span>
              </ActionButton>
            </div>
            <div className="w-[74px] shrink-0">
              {r.status === "Issued" ? (
                <ActionButton
                  tone="success"
                  size="xs"
                  className="w-full justify-center"
                  title={`Receive ${r.itemName} back from ${r.issuedTo}`}
                  onClick={() => setReturnIssuanceId(r.id)}
                >
                  <Undo2 className="size-3.5" />
                  <span>Return</span>
                </ActionButton>
              ) : null}
            </div>
          </div>
        ),
      },
    ],
    []
  );

  const issuanceFilters = React.useMemo<FilterDef<StockIssuanceRecord>[]>(
    () => [
      {
        key: "status",
        label: "Status",
        allLabel: "All Statuses",
        options: ["Pending Return", "Returned", "Consumed"],
        getValue: (r) => (r.status === "Issued" ? "Pending Return" : r.status),
      },
      {
        key: "type",
        label: "Type",
        allLabel: "All Types",
        options: ["Consumable", "Returnable"],
        getValue: (r) => r.issuanceType,
      },
      {
        key: "department",
        label: "Department",
        allLabel: "All Departments",
        options: [...new Set(issuances.map((r) => r.department))],
        getValue: (r) => r.department,
      },
    ],
    [issuances]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Store Inventory"
        className="mb-0 lg:mb-0"
        actions={
          <>
            <ActionButton tone="outline" size="md" onClick={handlePrint}>
              <Printer />
              <span>Print</span>
            </ActionButton>
            <ActionButton tone="pdf" size="md" onClick={handleExportPdf}>
              <Download />
              <span>Export PDF</span>
            </ActionButton>
            <ActionButton
              tone="outline"
              size="md"
              onClick={() => openIssueModal(null)}
            >
              <PackageMinus />
              <span>Issue Stock</span>
            </ActionButton>
            <ActionButton
              tone="primary"
              size="md"
              onClick={() => {
                setEditingItem(null);
                setAddFormOpen(true);
              }}
            >
              <Plus />
              <span>Add Stock Item</span>
            </ActionButton>
          </>
        }
      />

      {/* Executive KPI Cards (context-aware per tab) */}
      {activeTab === "stock" ? (
        <StatGrid>
          <StatCard
            label="Total Items"
            value={formatNumber(stockKpis.totalItems)}
            title={`${stockKpis.totalItems} distinct items in store catalog`}
            icon={Package}
          />
          <StatCard
            label="Total Units"
            value={formatNumber(stockKpis.totalUnits)}
            title={`${formatNumber(stockKpis.totalUnits)} total units available in store`}
            icon={Boxes}
          />
          <StatCard
            label="In Stock (OK)"
            value={formatNumber(stockKpis.inStockCount)}
            title={`${stockKpis.inStockCount} items above reorder threshold`}
            icon={ShieldCheck}
          />
          <StatCard
            label="Low Stock Alerts"
            value={formatNumber(stockKpis.alertTotal)}
            className={
              stockKpis.alertTotal > 0
                ? "border-amber-300/80 bg-amber-50/30 ring-1 ring-amber-200"
                : undefined
            }
            title={`${stockKpis.lowStockCount} Low Stock · ${stockKpis.outOfStockCount} Out of Stock`}
            icon={AlertTriangle}
          />
        </StatGrid>
      ) : (
        <StatGrid>
          <StatCard
            label="Total Issuances"
            value={formatNumber(issuanceKpis.totalIssuances)}
            title={`${issuanceKpis.issuedToday} issued today`}
            icon={ClipboardList}
          />
          <StatCard
            label="Units Issued"
            value={formatNumber(issuanceKpis.unitsIssued)}
            title="Total units handed out from store"
            icon={PackageMinus}
          />
          <StatCard
            label="Pending Returns"
            value={formatNumber(issuanceKpis.pendingReturns)}
            title="Returnable items still with staff"
            icon={RotateCcw}
          />
          <StatCard
            label="Overdue Returns"
            value={formatNumber(issuanceKpis.overdue)}
            className={
              issuanceKpis.overdue > 0
                ? "border-rose-300/80 bg-rose-50/30 ring-1 ring-rose-200"
                : undefined
            }
            title="Returnable items past their expected return date"
            icon={CalendarClock}
          />
        </StatGrid>
      )}

      {/* Executive Register Dropdown Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
        {/* Clean & Professional Register Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Select Inventory Register"
            className="group inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 px-3 text-xs font-semibold text-foreground shadow-2xs hover:border-slate-300 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer select-none"
          >
            {activeTab === "stock" ? (
              <Boxes className="size-4 text-[#091d3e]" />
            ) : (
              <ClipboardList className="size-4 text-[#091d3e]" />
            )}
            <span>
              {activeTab === "stock" ? "Stock Register" : "Issuance Register"}
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground transition-transform duration-200 group-data-[popup-open]:rotate-180" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="w-48 p-1 rounded-xl shadow-lg border border-slate-200 bg-white text-popover-foreground animate-in fade-in-50 zoom-in-95 duration-100"
          >
            <DropdownMenuItem
              onClick={() => setActiveTab("stock")}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs cursor-pointer transition-colors outline-none",
                activeTab === "stock"
                  ? "bg-slate-100 font-semibold text-foreground"
                  : "hover:bg-slate-50 text-slate-700 font-medium"
              )}
            >
              <div className="flex items-center gap-2">
                <Boxes className="size-4 text-slate-500" />
                <span>Stock Register</span>
              </div>
              {activeTab === "stock" && (
                <Check className="size-3.5 text-foreground" />
              )}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setActiveTab("issuance")}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs cursor-pointer transition-colors outline-none",
                activeTab === "issuance"
                  ? "bg-slate-100 font-semibold text-foreground"
                  : "hover:bg-slate-50 text-slate-700 font-medium"
              )}
            >
              <div className="flex items-center gap-2">
                <ClipboardList className="size-4 text-slate-500" />
                <span>Issuance Register</span>
              </div>
              {activeTab === "issuance" && (
                <Check className="size-3.5 text-foreground" />
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dynamic Context & Health Indicator */}
        <div className="flex items-center gap-2 pr-1">
          {activeTab === "stock" && (
            stockKpis.alertTotal > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/90 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 shadow-2xs">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                {stockKpis.alertTotal} Item{stockKpis.alertTotal > 1 ? "s" : ""} Need Reorder
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/90 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 shadow-2xs">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                All Stock Levels Healthy
              </span>
            )
          )}
        </div>
      </div>

      {/* Tab 1: Stock Register */}
      {activeTab === "stock" && (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={items}
            columns={stockColumns}
            getRowId={(r) => r.id}
            filters={stockFilters}
            tableClassName="min-w-[980px] table-fixed"
            searchPlaceholder="Search item name, SKU or category…"
            searchFn={(r, q) =>
              r.name.toLowerCase().includes(q) ||
              r.category.toLowerCase().includes(q) ||
              r.sku.toLowerCase().includes(q)
            }
            pageSize={8}
            emptyMessage="No stock items match your search."
          />
        </SectionCard>
      )}

      {/* Tab 2: Issuance Register */}
      {activeTab === "issuance" && (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={issuances}
            columns={issuanceColumns}
            getRowId={(r) => r.id}
            filters={issuanceFilters}
            tableClassName="min-w-[1020px] table-fixed"
            searchPlaceholder="Search issue #, item, person or department…"
            searchFn={(r, q) =>
              r.issueNo.toLowerCase().includes(q) ||
              r.itemName.toLowerCase().includes(q) ||
              r.itemSku.toLowerCase().includes(q) ||
              r.issuedTo.toLowerCase().includes(q) ||
              r.department.toLowerCase().includes(q) ||
              r.purpose.toLowerCase().includes(q)
            }
            pageSize={8}
            emptyMessage="No issuance records found. Click “Issue Stock” to hand out items."
          />
        </SectionCard>
      )}

      {/* Adjust Stock Modal (+5 / -5) */}
      <InventoryItemModal
        item={selectedItem}
        open={adjustModalOpen}
        onOpenChange={setAdjustModalOpen}
        onAdjustStock={handleAdjustStock}
      />

      {/* Add / Edit Stock Item Modal */}
      <InventoryFormModal
        open={addFormOpen}
        onOpenChange={(open) => {
          setAddFormOpen(open);
          if (!open) setEditingItem(null);
        }}
        totalCount={items.length}
        initialData={editingItem}
        onSave={handleSaveStockItem}
      />

      {/* Issue Stock Modal (auto-deducts quantity) */}
      <IssueStockModal
        open={issueModalOpen}
        onOpenChange={(open) => {
          setIssueModalOpen(open);
          if (!open) setIssuePreselectId(null);
        }}
        items={items}
        preselectedItemId={issuePreselectId}
        nextIssueNumber={nextIssueNumber}
        onIssue={handleIssueStock}
      />

      {/* Issue Slip Viewer */}
      <IssuanceViewModal
        record={viewIssuance}
        open={Boolean(viewIssuance)}
        onOpenChange={(open) => {
          if (!open) setViewIssuanceId(null);
        }}
        onReturn={(r) => setReturnIssuanceId(r.id)}
      />

      {/* Return Stock Modal (adds quantity back) */}
      <ReturnStockModal
        record={returnIssuance}
        currentStock={returnItemStock}
        open={Boolean(returnIssuance)}
        onOpenChange={(open) => {
          if (!open) setReturnIssuanceId(null);
        }}
        onConfirmReturn={handleConfirmReturn}
      />
    </div>
  );
}
