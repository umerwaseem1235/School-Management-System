"use client";

import * as React from "react";
import {
  AlertTriangle,
  Box,
  Building2,
  Calculator,
  Check,
  ChevronDown,
  Download,
  Eye,
  Plus,
  Printer,
  ShieldCheck,
  TrendingDown,
  Wallet,
  Wrench,
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
  INITIAL_ASSET_ALLOCATIONS,
  INITIAL_ASSET_DEPRECIATION,
  INITIAL_ASSET_MAINTENANCE,
  INITIAL_FIXED_ASSETS,
  type AssetAllocationRecord,
  type AssetAllocationStatus,
  type AssetDepreciationRecord,
  type AssetMaintenanceRecord,
  type AssetMaintenanceStatus,
  type FixedAssetRecord,
  type FixedAssetStatus,
} from "@/lib/mock/assets";
import {
  exportAssetAllocationsPdf,
  exportAssetDepreciationPdf,
  exportAssetMaintenancePdf,
  exportFixedAssetsPdf,
  printFixedAssetsRegister,
} from "./assets-export";
import {
  AssetAllocationViewModal,
  AssetDepreciationViewModal,
  AssetMaintenanceViewModal,
  FixedAssetViewModal,
} from "./assets-view-modals";
import {
  AssetAllocationFormModal,
  AssetMaintenanceFormModal,
  FixedAssetFormModal,
} from "./assets-form-modals";

type AssetsViewTab =
  | "register"
  | "allocations"
  | "maintenance"
  | "depreciation";

const CAMPUS_OPTIONS = [
  "Gulberg",
  "DHA Phase 5",
  "F-8 Islamabad",
  "Clifton",
  "Bahria Town",
];

export function AssetsClient() {
  const [activeTab, setActiveTab] =
    React.useState<AssetsViewTab>("register");

  const [assets, setAssets] = React.useState<FixedAssetRecord[]>(
    INITIAL_FIXED_ASSETS
  );
  const [allocations, setAllocations] = React.useState<
    AssetAllocationRecord[]
  >(INITIAL_ASSET_ALLOCATIONS);
  const [maintenance, setMaintenance] = React.useState<
    AssetMaintenanceRecord[]
  >(INITIAL_ASSET_MAINTENANCE);
  const [depreciation, setDepreciation] = React.useState<
    AssetDepreciationRecord[]
  >(INITIAL_ASSET_DEPRECIATION);

  // Asset View & Create/Edit Modals
  const [selectedAssetId, setSelectedAssetId] = React.useState<string | null>(
    null
  );
  const [assetViewOpen, setAssetViewOpen] = React.useState(false);
  const [assetFormOpen, setAssetFormOpen] = React.useState(false);
  const [editingAsset, setEditingAsset] =
    React.useState<FixedAssetRecord | null>(null);

  // Allocation View & Create Modals
  const [selectedAllocationId, setSelectedAllocationId] = React.useState<
    string | null
  >(null);
  const [allocationViewOpen, setAllocationViewOpen] = React.useState(false);
  const [allocationFormOpen, setAllocationFormOpen] = React.useState(false);

  // Maintenance View & Create Modals
  const [selectedMaintenanceId, setSelectedMaintenanceId] = React.useState<
    string | null
  >(null);
  const [maintenanceViewOpen, setMaintenanceViewOpen] = React.useState(false);
  const [maintenanceFormOpen, setMaintenanceFormOpen] = React.useState(false);

  // Depreciation View Modal
  const [selectedDepreciationId, setSelectedDepreciationId] = React.useState<
    string | null
  >(null);
  const [depreciationViewOpen, setDepreciationViewOpen] =
    React.useState(false);

  const selectedAsset = React.useMemo(
    () => assets.find((a) => a.id === selectedAssetId) ?? null,
    [assets, selectedAssetId]
  );

  const selectedAllocation = React.useMemo(
    () => allocations.find((a) => a.id === selectedAllocationId) ?? null,
    [allocations, selectedAllocationId]
  );

  const selectedMaintenance = React.useMemo(
    () => maintenance.find((m) => m.id === selectedMaintenanceId) ?? null,
    [maintenance, selectedMaintenanceId]
  );

  const selectedDepreciation = React.useMemo(
    () => depreciation.find((d) => d.id === selectedDepreciationId) ?? null,
    [depreciation, selectedDepreciationId]
  );

  /* ───────────────────────── Dynamic KPI Aggregates ───────────────────────── */

  const registerKpis = React.useMemo(() => {
    const totalCost = assets.reduce((s, a) => s + a.purchaseCost, 0);
    const totalDep = assets.reduce((s, a) => s + a.accumulatedDepreciation, 0);
    const totalNbv = assets.reduce((s, a) => s + a.netBookValue, 0);
    const inServiceCount = assets.filter(
      (a) => a.status === "In Service"
    ).length;
    return {
      totalCost,
      totalDep,
      totalNbv,
      totalCount: assets.length,
      inServiceCount,
    };
  }, [assets]);

  const allocationKpis = React.useMemo(() => {
    const verifiedCount = allocations.filter(
      (a) => a.status === "Verified"
    ).length;
    const totalAllocatedValue = allocations.reduce(
      (s, a) => s + a.assetValue,
      0
    );
    return {
      totalCount: allocations.length,
      verifiedCount,
      totalAllocatedValue,
    };
  }, [allocations]);

  const maintenanceKpis = React.useMemo(() => {
    const completedCount = maintenance.filter(
      (m) => m.status === "Completed"
    ).length;
    const pendingCount = maintenance.filter(
      (m) => m.status !== "Completed"
    ).length;
    const totalServiceCost = maintenance.reduce(
      (s, m) => s + m.serviceCost,
      0
    );
    const amcCount = maintenance.filter((m) => m.amcCovered).length;
    return {
      totalCount: maintenance.length,
      completedCount,
      pendingCount,
      totalServiceCost,
      amcCount,
    };
  }, [maintenance]);

  const depreciationKpis = React.useMemo(() => {
    const totalHistorical = depreciation.reduce(
      (s, d) => s + d.historicalCost,
      0
    );
    const currentYearCharge = depreciation.reduce(
      (s, d) => s + d.currentYearDepCharge,
      0
    );
    const closingAccumulated = depreciation.reduce(
      (s, d) => s + d.closingAccumulatedDep,
      0
    );
    const closingNbv = depreciation.reduce(
      (s, d) => s + d.closingNetBookValue,
      0
    );
    return {
      totalHistorical,
      currentYearCharge,
      closingAccumulated,
      closingNbv,
    };
  }, [depreciation]);

  /* ───────────────────────── Interactive Handlers ───────────────────────── */

  const handleUpdateAsset = React.useCallback(
    (
      assetId: string,
      payload: {
        status: FixedAssetStatus;
        condition: FixedAssetRecord["condition"];
        locationRoom: string;
        custodian: string;
      }
    ) => {
      setAssets((prev) =>
        prev.map((a) => (a.id === assetId ? { ...a, ...payload } : a))
      );
      toast.success("Fixed-asset custody & condition updated.");
    },
    []
  );

  const handleSaveAsset = React.useCallback((record: FixedAssetRecord) => {
    setAssets((prev) => {
      const exists = prev.some((a) => a.id === record.id);
      return exists
        ? prev.map((a) => (a.id === record.id ? record : a))
        : [record, ...prev];
    });
    // Also add a depreciation schedule if newly created
    setDepreciation((prev) => {
      if (prev.some((d) => d.assetTag === record.assetTag)) return prev;
      return [
        {
          id: `dep-${Date.now()}`,
          scheduleCode: `DEP-AY26-${801 + prev.length}`,
          assetTag: record.assetTag,
          assetName: record.assetName,
          category: record.category,
          campus: record.campus,
          depreciationMethod: "Straight-Line (IAS-16)",
          annualRatePct: record.depreciationRatePct,
          usefulLifeYears: record.usefulLifeYears,
          elapsedYears: 1,
          historicalCost: record.purchaseCost,
          openingAccumulatedDep: 0,
          currentYearDepCharge: record.accumulatedDepreciation,
          closingAccumulatedDep: record.accumulatedDepreciation,
          salvageValue: Math.round(record.purchaseCost * 0.1),
          closingNetBookValue: record.netBookValue,
          status: "Depreciating",
        },
        ...prev,
      ];
    });
  }, []);

  const handleUpdateAllocationStatus = React.useCallback(
    (id: string, status: AssetAllocationStatus) => {
      setAllocations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      toast.success(`Asset allocation status updated to ${status}.`);
    },
    []
  );

  const handleCreateAllocation = React.useCallback(
    (newAlloc: AssetAllocationRecord) => {
      setAllocations((prev) => [newAlloc, ...prev]);
    },
    []
  );

  const handleUpdateMaintenanceStatus = React.useCallback(
    (id: string, status: AssetMaintenanceStatus) => {
      setMaintenance((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status } : m))
      );
      toast.success(`Maintenance work order updated to ${status}.`);
    },
    []
  );

  const handleCreateMaintenance = React.useCallback(
    (newRecord: AssetMaintenanceRecord) => {
      setMaintenance((prev) => [newRecord, ...prev]);
    },
    []
  );

  /* ───────────────────────── 1. Asset Register Columns ───────────────────────── */

  const registerColumns = React.useMemo<Column<FixedAssetRecord>[]>(
    () => [
      {
        key: "assetTag",
        header: "Asset Tag / Serial #",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/50 px-2 py-0.5 font-mono text-xs font-bold text-[#091d3e]">
              {r.assetTag}
            </span>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              SN: {r.serialNo}
            </p>
          </div>
        ),
      },
      {
        key: "assetName",
        header: "Fixed Asset & Category",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center max-w-[245px] mx-auto">
            <p className="truncate text-xs font-semibold text-foreground">
              {r.assetName}
            </p>
            <p className="truncate text-[10.5px] text-muted-foreground">
              {r.category} · {r.vendorName}
            </p>
          </div>
        ),
      },
      {
        key: "campus",
        header: "Campus & Installed Location",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center max-w-[195px] mx-auto">
            <p className="text-xs font-semibold text-foreground">{r.campus}</p>
            <p className="truncate text-[10.5px] text-muted-foreground">
              {r.locationRoom}
            </p>
          </div>
        ),
      },
      {
        key: "custodian",
        header: "Custodian & Warranty",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-xs font-semibold text-foreground">
              {r.custodian}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              Warranty: {formatDate(r.warrantyExpiry)}
            </p>
          </div>
        ),
      },
      {
        key: "purchaseCost",
        header: "Cost & Dep.",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
              {formatCurrency(r.purchaseCost)}
            </span>
            <p className="font-mono text-[10px] text-danger">
              Dep ({r.depreciationRatePct}%): -
              {formatCurrency(r.accumulatedDepreciation)}
            </p>
          </div>
        ),
      },
      {
        key: "netBookValue",
        header: "Net Book Value",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-bold tabular-nums text-emerald-700">
              {formatCurrency(r.netBookValue)}
            </span>
            <p className="text-[10px] text-muted-foreground">
              Condition: {r.condition}
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
              title="View fixed-asset valuation certificate & custody details"
              onClick={() => {
                setSelectedAssetId(r.id);
                setAssetViewOpen(true);
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

  const registerFilters = React.useMemo<FilterDef<FixedAssetRecord>[]>(
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
        options: [...new Set(assets.map((a) => a.category))],
        getValue: (r) => r.category,
      },
      {
        key: "status",
        label: "Status",
        allLabel: "All Statuses",
        options: ["In Service", "Under Repair", "Retired"],
        getValue: (r) => r.status,
      },
    ],
    [assets]
  );

  /* ───────────────────────── 2. Allocation Tracking Columns ───────────────────────── */

  const allocationColumns = React.useMemo<Column<AssetAllocationRecord>[]>(
    () => [
      {
        key: "allocationCode",
        header: "Allocation #",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/50 px-2 py-0.5 font-mono text-xs font-bold text-[#091d3e]">
              {r.allocationCode}
            </span>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              {r.assetTag}
            </p>
          </div>
        ),
      },
      {
        key: "assetName",
        header: "Allocated Fixed Asset",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center max-w-[235px] mx-auto">
            <p className="truncate text-xs font-semibold text-foreground">
              {r.assetName}
            </p>
            <p className="text-[10.5px] text-muted-foreground">
              {r.category} · Assigned {formatDate(r.assignedDate)}
            </p>
          </div>
        ),
      },
      {
        key: "location",
        header: "Campus, Building & Room",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center max-w-[210px] mx-auto">
            <p className="text-xs font-semibold text-foreground">
              {r.campus} · {r.roomOrLab}
            </p>
            <p className="truncate text-[10.5px] text-muted-foreground">
              {r.buildingBlock}
            </p>
          </div>
        ),
      },
      {
        key: "custodian",
        header: "Custodian & Department",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-xs font-semibold text-foreground">
              {r.assignedCustodian}
            </p>
            <p className="text-[10.5px] text-muted-foreground">
              {r.department}
            </p>
          </div>
        ),
      },
      {
        key: "assetValue",
        header: "Book Valuation",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-bold tabular-nums text-emerald-700">
              {formatCurrency(r.assetValue)}
            </span>
            <p className="font-mono text-[10px] text-muted-foreground">
              Audited {formatDate(r.lastAuditDate)}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Audit Status",
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
              title="View asset room allocation & physical audit verification"
              onClick={() => {
                setSelectedAllocationId(r.id);
                setAllocationViewOpen(true);
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

  /* ───────────────────────── 3. Maintenance Schedules Columns ───────────────────────── */

  const maintenanceColumns = React.useMemo<Column<AssetMaintenanceRecord>[]>(
    () => [
      {
        key: "workOrderNo",
        header: "Work Order #",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/50 px-2 py-0.5 font-mono text-xs font-bold text-[#091d3e]">
              {r.workOrderNo}
            </span>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              {r.assetTag}
            </p>
          </div>
        ),
      },
      {
        key: "assetName",
        header: "Asset & Maintenance Scope",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center max-w-[235px] mx-auto">
            <p className="truncate text-xs font-semibold text-foreground">
              {r.assetName}
            </p>
            <p className="text-[10.5px] text-brand font-semibold">
              {r.maintenanceType} · {r.campus}
            </p>
          </div>
        ),
      },
      {
        key: "serviceVendor",
        header: "AMC Contractor & Engineer",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-xs font-semibold text-foreground">
              {r.serviceVendor}
            </p>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              {r.technicianName} · {r.vendorPhone}
            </p>
          </div>
        ),
      },
      {
        key: "schedule",
        header: "Service & Next Due",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-semibold text-foreground">
              {formatDate(r.scheduledDate)}
            </span>
            <p className="font-mono text-[10px] text-muted-foreground">
              Next Due: {formatDate(r.nextDueDate)}
            </p>
          </div>
        ),
      },
      {
        key: "serviceCost",
        header: "Service Cost",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-bold tabular-nums text-emerald-700">
              {formatCurrency(r.serviceCost)}
            </span>
            <p className="text-[10px] text-muted-foreground">
              {r.amcCovered ? "AMC Contract" : "Spot Repair"}
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
              title="View AMC work order details & update completion status"
              onClick={() => {
                setSelectedMaintenanceId(r.id);
                setMaintenanceViewOpen(true);
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

  /* ───────────────────────── 4. Depreciation Records Columns ───────────────────────── */

  const depreciationColumns = React.useMemo<Column<AssetDepreciationRecord>[]>(
    () => [
      {
        key: "scheduleCode",
        header: "Schedule #",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/50 px-2 py-0.5 font-mono text-xs font-bold text-[#091d3e]">
              {r.scheduleCode}
            </span>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              {r.assetTag} · {r.campus}
            </p>
          </div>
        ),
      },
      {
        key: "assetName",
        header: "Fixed Asset & IAS-16 Method",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center max-w-[235px] mx-auto">
            <p className="truncate text-xs font-semibold text-foreground">
              {r.assetName}
            </p>
            <p className="text-[10.5px] text-muted-foreground">
              {r.depreciationMethod} · {r.annualRatePct}% / Yr ({r.elapsedYears}/
              {r.usefulLifeYears} Yrs)
            </p>
          </div>
        ),
      },
      {
        key: "historicalCost",
        header: "Historical Cost",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
              {formatCurrency(r.historicalCost)}
            </span>
            <p className="font-mono text-[10px] text-muted-foreground">
              Salvage: {formatCurrency(r.salvageValue)}
            </p>
          </div>
        ),
      },
      {
        key: "currentYearDepCharge",
        header: "AY 26–27 Dep. Charge",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-bold tabular-nums text-danger">
              -{formatCurrency(r.currentYearDepCharge)}
            </span>
            <p className="font-mono text-[10px] text-muted-foreground">
              Accum: -{formatCurrency(r.closingAccumulatedDep)}
            </p>
          </div>
        ),
      },
      {
        key: "closingNetBookValue",
        header: "Closing Book Value",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-bold tabular-nums text-emerald-700">
              {formatCurrency(r.closingNetBookValue)}
            </span>
            <p className="font-mono text-[10px] text-muted-foreground">
              {Math.round(
                (r.closingNetBookValue / Math.max(1, r.historicalCost)) * 100
              )}
              % Retained
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
              title="View full IAS-16 depreciation schedule & salvage value"
              onClick={() => {
                setSelectedDepreciationId(r.id);
                setDepreciationViewOpen(true);
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
    const ok = printFixedAssetsRegister(assets);
    if (ok) toast.info("Opening print preview for fixed-asset master register…");
    else toast.error("Pop-up blocked. Please allow pop-ups to print.");
  };

  const handleExportPdf = () => {
    if (activeTab === "register") {
      exportFixedAssetsPdf(assets);
      toast.success(
        `Fixed-asset master register (${assets.length} assets) downloaded as PDF.`
      );
    } else if (activeTab === "allocations") {
      exportAssetAllocationsPdf(allocations);
      toast.success(
        `Asset custody allocations (${allocations.length} records) downloaded as PDF.`
      );
    } else if (activeTab === "maintenance") {
      exportAssetMaintenancePdf(maintenance);
      toast.success(
        `Preventive maintenance & AMC schedule (${maintenance.length} work orders) downloaded as PDF.`
      );
    } else {
      exportAssetDepreciationPdf(depreciation);
      toast.success(
        `IAS-16 depreciation schedule (${depreciation.length} records) downloaded as PDF.`
      );
    }
  };

  const handlePrimaryAction = () => {
    if (activeTab === "allocations") {
      setAllocationFormOpen(true);
    } else if (activeTab === "maintenance") {
      setMaintenanceFormOpen(true);
    } else {
      setEditingAsset(null);
      setAssetFormOpen(true);
    }
  };

  const primaryActionLabel =
    activeTab === "allocations"
      ? "Assign Asset Custody"
      : activeTab === "maintenance"
      ? "Schedule Maintenance"
      : "Register Fixed Asset";

  const activeTabMeta = {
    register: {
      label: "Asset Register",
      count: assets.length,
      icon: Box,
      subtitle: `Institutional Capital Assets · ${registerKpis.inServiceCount} In Service · Net Book Value ${formatCurrencyCompact(registerKpis.totalNbv)}`,
    },
    allocations: {
      label: "Allocation Tracking",
      count: allocations.length,
      icon: Building2,
      subtitle: `Custodian & Room Assignments · ${allocationKpis.verifiedCount} Physical Audits Verified`,
    },
    maintenance: {
      label: "Maintenance Schedules",
      count: maintenance.length,
      icon: Wrench,
      subtitle: `Preventive AMC & Calibration · ${maintenanceKpis.amcCount} Assets Under Active AMC`,
    },
    depreciation: {
      label: "Depreciation Records",
      count: depreciation.length,
      icon: Calculator,
      subtitle: `IAS-16 Book Valuation Ledger · AY 2026–27 Charge ${formatCurrencyCompact(depreciationKpis.currentYearCharge)}`,
    },
  }[activeTab];

  const ActiveTabIcon = activeTabMeta.icon;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Assets"
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
            <ActionButton
              tone="primary"
              size="md"
              onClick={handlePrimaryAction}
            >
              <Plus />
              <span>{primaryActionLabel}</span>
            </ActionButton>
          </>
        }
      />

      {/* Dynamic 4-Card KPI Strip */}
      {activeTab === "register" && (
        <StatGrid>
          <StatCard
            label="Historical Capital Cost"
            value={`${formatCurrencyCompact(registerKpis.totalCost)} (${registerKpis.totalCount} Lots)`}
            icon={Wallet}
          />
          <StatCard
            label="Current Net Book Value"
            value={formatCurrencyCompact(registerKpis.totalNbv)}
            icon={Box}
          />
          <StatCard
            label="Accumulated Depreciation"
            value={formatCurrencyCompact(registerKpis.totalDep)}
            icon={TrendingDown}
          />
          <StatCard
            label="Active In-Service Assets"
            value={`${registerKpis.inServiceCount} / ${registerKpis.totalCount} Operational`}
            icon={ShieldCheck}
          />
        </StatGrid>
      )}

      {activeTab === "allocations" && (
        <StatGrid>
          <StatCard
            label="Allocated Capital Assets"
            value={`${allocationKpis.totalCount} Assigned Lots`}
            icon={Building2}
          />
          <StatCard
            label="Audit Reconciled Custody"
            value={`${allocationKpis.verifiedCount} Verified`}
            icon={ShieldCheck}
          />
          <StatCard
            label="Custody Book Valuation"
            value={formatCurrencyCompact(allocationKpis.totalAllocatedValue)}
            icon={Wallet}
          />
          <StatCard
            label="Multi-Campus Coverage"
            value="5 Campuses Audited"
            icon={Box}
          />
        </StatGrid>
      )}

      {activeTab === "maintenance" && (
        <StatGrid>
          <StatCard
            label="Active AMC Work Orders"
            value={`${maintenanceKpis.totalCount} Schedules`}
            icon={Wrench}
          />
          <StatCard
            label="Completed Inspections"
            value={`${maintenanceKpis.completedCount} Certified`}
            icon={ShieldCheck}
          />
          <StatCard
            label="Upcoming / Repair Orders"
            value={`${maintenanceKpis.pendingCount} Active`}
            icon={AlertTriangle}
          />
          <StatCard
            label="AMC & Service Spend"
            value={formatCurrencyCompact(maintenanceKpis.totalServiceCost)}
            icon={Wallet}
          />
        </StatGrid>
      )}

      {activeTab === "depreciation" && (
        <StatGrid>
          <StatCard
            label="Gross Capitalized Cost"
            value={formatCurrencyCompact(depreciationKpis.totalHistorical)}
            icon={Wallet}
          />
          <StatCard
            label="AY 2026–27 Dep. Charge"
            value={formatCurrencyCompact(depreciationKpis.currentYearCharge)}
            icon={TrendingDown}
          />
          <StatCard
            label="Closing Accumulated Dep."
            value={formatCurrencyCompact(depreciationKpis.closingAccumulated)}
            icon={Calculator}
          />
          <StatCard
            label="Closing Net Book Value"
            value={formatCurrencyCompact(depreciationKpis.closingNbv)}
            icon={ShieldCheck}
          />
        </StatGrid>
      )}

      {/* Executive Register Selector Dropdown */}
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
                  key: "register" as const,
                  label: "Asset Register",
                  count: assets.length,
                  icon: Box,
                },
                {
                  key: "allocations" as const,
                  label: "Allocation Tracking",
                  count: allocations.length,
                  icon: Building2,
                },
                {
                  key: "maintenance" as const,
                  label: "Maintenance Schedules",
                  count: maintenance.length,
                  icon: Wrench,
                },
                {
                  key: "depreciation" as const,
                  label: "Depreciation Records",
                  count: depreciation.length,
                  icon: Calculator,
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
      {activeTab === "register" && (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={assets}
            columns={registerColumns}
            getRowId={(r) => r.id}
            filters={registerFilters}
            searchPlaceholder="Search asset tag #, serial #, asset name, location room or custodian…"
            searchFn={(r, q) =>
              r.assetTag.toLowerCase().includes(q) ||
              r.serialNo.toLowerCase().includes(q) ||
              r.assetName.toLowerCase().includes(q) ||
              r.category.toLowerCase().includes(q) ||
              r.locationRoom.toLowerCase().includes(q) ||
              r.custodian.toLowerCase().includes(q) ||
              r.vendorName.toLowerCase().includes(q)
            }
            pageSize={8}
            emptyMessage="No fixed assets match the selected filters."
          />
        </SectionCard>
      )}

      {activeTab === "allocations" && (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={allocations}
            columns={allocationColumns}
            getRowId={(r) => r.id}
            searchPlaceholder="Search allocation code, asset tag, room/lab, department or custodian…"
            searchFn={(r, q) =>
              r.allocationCode.toLowerCase().includes(q) ||
              r.assetTag.toLowerCase().includes(q) ||
              r.assetName.toLowerCase().includes(q) ||
              r.roomOrLab.toLowerCase().includes(q) ||
              r.department.toLowerCase().includes(q) ||
              r.assignedCustodian.toLowerCase().includes(q)
            }
            pageSize={8}
            emptyMessage="No asset custody allocations match the search query."
          />
        </SectionCard>
      )}

      {activeTab === "maintenance" && (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={maintenance}
            columns={maintenanceColumns}
            getRowId={(r) => r.id}
            searchPlaceholder="Search work order #, asset tag, contractor, technician or maintenance type…"
            searchFn={(r, q) =>
              r.workOrderNo.toLowerCase().includes(q) ||
              r.assetTag.toLowerCase().includes(q) ||
              r.assetName.toLowerCase().includes(q) ||
              r.serviceVendor.toLowerCase().includes(q) ||
              r.technicianName.toLowerCase().includes(q) ||
              r.maintenanceType.toLowerCase().includes(q)
            }
            pageSize={8}
            emptyMessage="No maintenance work orders match the search query."
          />
        </SectionCard>
      )}

      {activeTab === "depreciation" && (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={depreciation}
            columns={depreciationColumns}
            getRowId={(r) => r.id}
            searchPlaceholder="Search depreciation schedule #, asset tag, asset name or method…"
            searchFn={(r, q) =>
              r.scheduleCode.toLowerCase().includes(q) ||
              r.assetTag.toLowerCase().includes(q) ||
              r.assetName.toLowerCase().includes(q) ||
              r.depreciationMethod.toLowerCase().includes(q) ||
              r.campus.toLowerCase().includes(q)
            }
            pageSize={8}
            emptyMessage="No depreciation schedules match the search query."
          />
        </SectionCard>
      )}

      {/* Interactive Modals */}
      <FixedAssetViewModal
        asset={selectedAsset}
        open={assetViewOpen}
        onOpenChange={setAssetViewOpen}
        onUpdateAsset={handleUpdateAsset}
        onEditAsset={(ast) => {
          setEditingAsset(ast);
          setAssetFormOpen(true);
        }}
      />

      <FixedAssetFormModal
        open={assetFormOpen}
        onOpenChange={setAssetFormOpen}
        initialData={editingAsset}
        totalCount={assets.length}
        onSave={handleSaveAsset}
      />

      <AssetAllocationViewModal
        allocation={selectedAllocation}
        open={allocationViewOpen}
        onOpenChange={setAllocationViewOpen}
        onUpdateAllocationStatus={handleUpdateAllocationStatus}
      />

      <AssetAllocationFormModal
        open={allocationFormOpen}
        onOpenChange={setAllocationFormOpen}
        assets={assets}
        totalCount={allocations.length}
        onSave={handleCreateAllocation}
      />

      <AssetMaintenanceViewModal
        record={selectedMaintenance}
        open={maintenanceViewOpen}
        onOpenChange={setMaintenanceViewOpen}
        onUpdateMaintenanceStatus={handleUpdateMaintenanceStatus}
      />

      <AssetMaintenanceFormModal
        open={maintenanceFormOpen}
        onOpenChange={setMaintenanceFormOpen}
        assets={assets}
        totalCount={maintenance.length}
        onSave={handleCreateMaintenance}
      />

      <AssetDepreciationViewModal
        schedule={selectedDepreciation}
        open={depreciationViewOpen}
        onOpenChange={setDepreciationViewOpen}
      />
    </div>
  );
}
