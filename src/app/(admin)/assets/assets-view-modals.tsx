"use client";

import * as React from "react";
import {
  Box,
  Building2,
  Calculator,
  Check,
  Copy,
  Download,
  Edit,
  FileText,
  ShieldCheck,
  Wrench,
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
  AssetAllocationRecord,
  AssetAllocationStatus,
  AssetDepreciationRecord,
  AssetMaintenanceRecord,
  AssetMaintenanceStatus,
  FixedAssetRecord,
  FixedAssetStatus,
} from "@/lib/mock/assets";
import { exportSingleAssetCardPdf } from "./assets-export";

const fieldClass =
  "h-9 w-full rounded-[4px] border border-border/80 bg-white px-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15";

/* ═══════════════════════════════════════════════════════════════════════════
   1. FIXED-ASSET MASTER VIEW & CUSTODY CONTROL MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface FixedAssetViewModalProps {
  asset: FixedAssetRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateAsset?: (
    assetId: string,
    payload: {
      status: FixedAssetStatus;
      condition: FixedAssetRecord["condition"];
      locationRoom: string;
      custodian: string;
    }
  ) => void;
  onEditAsset?: (asset: FixedAssetRecord) => void;
}

export function FixedAssetViewModal({
  asset,
  open,
  onOpenChange,
  onUpdateAsset,
  onEditAsset,
}: FixedAssetViewModalProps) {
  const [activeTab, setActiveTab] = React.useState<"overview" | "custody">(
    "overview"
  );
  const [status, setStatus] = React.useState<FixedAssetStatus>("In Service");
  const [condition, setCondition] =
    React.useState<FixedAssetRecord["condition"]>("Excellent");
  const [locationRoom, setLocationRoom] = React.useState("");
  const [custodian, setCustodian] = React.useState("");

  React.useEffect(() => {
    if (open && asset) {
      setActiveTab("overview");
      setStatus(asset.status);
      setCondition(asset.condition);
      setLocationRoom(asset.locationRoom);
      setCustodian(asset.custodian);
    }
  }, [open, asset]);

  if (!asset) return null;

  const retainedPct = Math.min(
    100,
    Math.round((asset.netBookValue / Math.max(1, asset.purchaseCost)) * 100)
  );

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`, { description: text });
    }
  };

  const handleCustodySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateAsset) {
      onUpdateAsset(asset.id, {
        status,
        condition,
        locationRoom: locationRoom.trim() || asset.locationRoom,
        custodian: custodian.trim() || asset.custodian,
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
                <Box className="size-5" />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold leading-tight text-foreground">
                  {asset.assetName}
                </DialogTitle>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <StatusBadge status={asset.status} />
                  <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/70 px-2 py-0.5 font-mono text-[11px] font-bold text-[#091d3e]">
                    {asset.assetTag}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700">
                    SN: {asset.serialNo}
                  </span>
                  <DialogDescription className="font-mono text-xs text-muted-foreground">
                    {asset.category} · {asset.campus}
                  </DialogDescription>
                </div>
              </div>
            </div>
            <div className="hidden sm:block text-right shrink-0">
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                Fixed-Asset Tag
              </p>
              <button
                type="button"
                onClick={() => handleCopy(asset.assetTag, "Asset Tag")}
                className="mt-0.5 inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-slate-50 px-2 py-0.5 font-mono text-xs font-bold text-[#091d3e] hover:border-brand/40 cursor-pointer"
              >
                <span>{asset.assetTag}</span>
                <Copy className="size-3 text-muted-foreground" />
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* 4-Column Capital Valuation Strip */}
        <dl className="grid shrink-0 grid-cols-2 divide-x divide-y divide-border/70 border-y border-border/70 bg-slate-50/70 sm:grid-cols-4 sm:divide-y-0">
          <div className="px-4 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">
              Original Capital Cost
            </dt>
            <dd className="mt-0.5 font-mono text-sm font-bold text-foreground">
              {formatCurrency(asset.purchaseCost)}
            </dd>
          </div>
          <div className="px-4 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">
              Depreciation Rate
            </dt>
            <dd className="mt-0.5 font-mono text-sm font-bold text-[#091d3e]">
              {asset.depreciationRatePct}% / Yr ({asset.usefulLifeYears} Yrs)
            </dd>
          </div>
          <div className="px-4 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">
              Accumulated Dep.
            </dt>
            <dd className="mt-0.5 font-mono text-sm font-bold text-danger">
              -{formatCurrency(asset.accumulatedDepreciation)}
            </dd>
          </div>
          <div className="px-4 py-2.5 bg-emerald-50/45">
            <dt className="text-[11px] font-semibold text-emerald-800">
              Net Book Value (NBV)
            </dt>
            <dd className="mt-0.5 font-mono text-sm font-extrabold text-emerald-700">
              {formatCurrency(asset.netBookValue)}
            </dd>
          </div>
        </dl>

        {/* Sub-Tabs */}
        <div className="flex shrink-0 items-center gap-1 border-b border-border/70 bg-white px-6 pt-2">
          {(
            [
              {
                key: "overview",
                label: "Capital Specification & Custody",
                icon: FileText,
              },
              {
                key: "custody",
                label: "Update Status & Custodian",
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
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold uppercase tracking-wider text-[10.5px] text-muted-foreground">
                    Technical Specification & Residual Book Value
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-[#091d3e]">
                    Acquired: {formatDate(asset.acquisitionDate)}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-foreground">
                  {asset.specification}
                </p>
                <div className="mt-3 pt-2.5 border-t border-border/60">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-medium text-muted-foreground">
                      Retained Book Value ({retainedPct}% of Historical Cost)
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatCurrency(asset.netBookValue)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{ width: `${retainedPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border/80 bg-white p-4 shadow-2xs space-y-2 text-xs">
                  <h4 className="font-bold uppercase tracking-wider text-[#091d3e] border-b border-border/60 pb-2">
                    Location & Physical Custody
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Campus:</span>
                    <span className="font-semibold text-foreground">
                      {asset.campus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Installed Room / Bay:
                    </span>
                    <span className="font-semibold text-foreground">
                      {asset.locationRoom}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Assigned Custodian:
                    </span>
                    <span className="font-semibold text-foreground">
                      {asset.custodian}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Physical Condition:
                    </span>
                    <span className="font-bold text-[#091d3e]">
                      {asset.condition}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-border/80 bg-white p-4 shadow-2xs space-y-2 text-xs">
                  <h4 className="font-bold uppercase tracking-wider text-[#091d3e] border-b border-border/60 pb-2">
                    OEM Supplier & Warranty
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      OEM Supplier:
                    </span>
                    <span className="font-semibold text-foreground">
                      {asset.vendorName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Serial Number:
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      {asset.serialNo}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Warranty Coverage:
                    </span>
                    <span className="font-mono font-semibold text-emerald-700">
                      Valid till {formatDate(asset.warrantyExpiry)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Useful Economic Life:
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      {asset.usefulLifeYears} Years
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "custody" && (
            <form onSubmit={handleCustodySubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Asset Operational Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as FixedAssetStatus)
                    }
                    className={fieldClass}
                  >
                    <option value="In Service">In Service (Active)</option>
                    <option value="Under Repair">
                      Under Repair / Maintenance
                    </option>
                    <option value="Retired">Retired / Decommissioned</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Physical Audit Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) =>
                      setCondition(
                        e.target.value as FixedAssetRecord["condition"]
                      )
                    }
                    className={fieldClass}
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Requires Service">Requires Service</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Assigned Building / Room Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Powerhouse Substation · Bay P-01"
                    value={locationRoom}
                    onChange={(e) => setLocationRoom(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Assigned Custodian Officer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sub-Engr. Rafaqat Ali"
                    value={custodian}
                    onChange={(e) => setCustodian(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <ActionButton type="submit" tone="primary" size="sm">
                  <Check className="size-3.5" />
                  <span>Save Custody & Condition</span>
                </ActionButton>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 bg-slate-50/60 px-6 py-3.5">
          <ActionButton
            tone="pdf"
            size="sm"
            onClick={() => {
              exportSingleAssetCardPdf(asset);
              toast.success(
                `Asset certificate ${asset.assetTag} downloaded as PDF.`
              );
            }}
          >
            <Download className="size-3.5" />
            <span>Download Certificate PDF</span>
          </ActionButton>

          <div className="flex items-center gap-2">
            {onEditAsset && (
              <ActionButton
                tone="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEditAsset(asset);
                }}
              >
                <Edit className="size-3.5" />
                <span>Edit Asset</span>
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
   2. ASSET ALLOCATION TRACKING VIEW MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface AssetAllocationViewModalProps {
  allocation: AssetAllocationRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateAllocationStatus?: (id: string, status: AssetAllocationStatus) => void;
}

export function AssetAllocationViewModal({
  allocation,
  open,
  onOpenChange,
  onUpdateAllocationStatus,
}: AssetAllocationViewModalProps) {
  const [status, setStatus] =
    React.useState<AssetAllocationStatus>("Verified");

  React.useEffect(() => {
    if (open && allocation) {
      setStatus(allocation.status);
    }
  }, [open, allocation]);

  if (!allocation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border border-border/80 bg-white p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-[#091d3e]/[0.04] via-white to-white px-6 py-4 border-b border-border/70">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#091d3e] text-white">
              <Building2 className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Custody Allocation — {allocation.allocationCode}
              </DialogTitle>
              <DialogDescription className="font-mono text-xs text-muted-foreground">
                {allocation.assetTag} · {allocation.campus} Campus
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-3.5 text-xs">
          <div className="rounded-xl border border-border/80 bg-slate-50/60 p-3.5 space-y-1">
            <p className="text-sm font-bold text-foreground">
              {allocation.assetName}
            </p>
            <p className="text-muted-foreground">
              {allocation.buildingBlock} · <strong>{allocation.roomOrLab}</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/70 p-3.5">
            <div>
              <span className="text-muted-foreground">Assigned Custodian:</span>
              <p className="font-semibold text-foreground mt-0.5">
                {allocation.assignedCustodian}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {allocation.custodianDesignation}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Department:</span>
              <p className="font-semibold text-foreground mt-0.5">
                {allocation.department}
              </p>
              <p className="font-mono text-[11px] text-emerald-700 font-bold">
                NBV: {formatCurrency(allocation.assetValue)}
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Physical Custody Verification Status
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as AssetAllocationStatus)
              }
              className={fieldClass}
            >
              <option value="Verified">Verified (Audit Reconciled)</option>
              <option value="Assigned">Assigned to Custodian</option>
              <option value="Under Repair">Under Repair</option>
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
              if (onUpdateAllocationStatus) {
                onUpdateAllocationStatus(allocation.id, status);
              }
              onOpenChange(false);
            }}
          >
            <Check className="size-3.5" />
            <span>Update Allocation</span>
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. PREVENTIVE MAINTENANCE & AMC VIEW MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface AssetMaintenanceViewModalProps {
  record: AssetMaintenanceRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateMaintenanceStatus?: (
    id: string,
    status: AssetMaintenanceStatus
  ) => void;
}

export function AssetMaintenanceViewModal({
  record,
  open,
  onOpenChange,
  onUpdateMaintenanceStatus,
}: AssetMaintenanceViewModalProps) {
  const [status, setStatus] =
    React.useState<AssetMaintenanceStatus>("Completed");

  React.useEffect(() => {
    if (open && record) {
      setStatus(record.status);
    }
  }, [open, record]);

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border border-border/80 bg-white p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-[#091d3e]/[0.04] via-white to-white px-6 py-4 border-b border-border/70">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#091d3e] text-white">
              <Wrench className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Maintenance Work Order — {record.workOrderNo}
              </DialogTitle>
              <DialogDescription className="font-mono text-xs text-muted-foreground">
                {record.assetTag} · {record.maintenanceType} · {record.campus}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-3.5 text-xs">
          <div className="rounded-xl border border-border/80 bg-slate-50/60 p-3.5 space-y-1.5">
            <p className="text-sm font-bold text-foreground">
              {record.assetName}
            </p>
            <p className="text-muted-foreground">{record.remarks}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/70 p-3.5">
            <div>
              <span className="text-muted-foreground">Service Contractor:</span>
              <p className="font-semibold text-foreground mt-0.5">
                {record.serviceVendor}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {record.technicianName} ({record.vendorPhone})
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Service Cost & AMC:</span>
              <p className="font-mono text-sm font-bold text-emerald-700 mt-0.5">
                {formatCurrency(record.serviceCost)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {record.amcCovered ? "Covered under Annual AMC" : "Spot Repair"}
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Work Order Completion Status
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as AssetMaintenanceStatus)
              }
              className={fieldClass}
            >
              <option value="Completed">Completed & Certified</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Due Soon">Due Soon</option>
              <option value="Under Repair">Under Repair</option>
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
              if (onUpdateMaintenanceStatus) {
                onUpdateMaintenanceStatus(record.id, status);
              }
              onOpenChange(false);
            }}
          >
            <Check className="size-3.5" />
            <span>Save Work Order</span>
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. IAS-16 DEPRECIATION SCHEDULE VIEW MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface AssetDepreciationViewModalProps {
  schedule: AssetDepreciationRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssetDepreciationViewModal({
  schedule,
  open,
  onOpenChange,
}: AssetDepreciationViewModalProps) {
  if (!schedule) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border border-border/80 bg-white p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-[#091d3e]/[0.04] via-white to-white px-6 py-4 border-b border-border/70">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#091d3e] text-white">
              <Calculator className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Depreciation Schedule — {schedule.scheduleCode}
              </DialogTitle>
              <DialogDescription className="font-mono text-xs text-muted-foreground">
                {schedule.assetTag} · {schedule.depreciationMethod} ·{" "}
                {schedule.campus}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-3.5 text-xs">
          <div className="rounded-xl border border-border/80 bg-slate-50/60 p-3.5">
            <p className="text-sm font-bold text-foreground">
              {schedule.assetName}
            </p>
            <p className="text-muted-foreground mt-0.5">
              Annual Rate: <strong>{schedule.annualRatePct}%</strong> · Elapsed
              Life:{" "}
              <strong>
                {schedule.elapsedYears} of {schedule.usefulLifeYears} Years
              </strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/70 p-3.5">
            <div>
              <span className="text-muted-foreground">
                Historical Capital Cost:
              </span>
              <p className="font-mono font-bold text-foreground mt-0.5">
                {formatCurrency(schedule.historicalCost)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">
                Opening Accumulated Dep:
              </span>
              <p className="font-mono font-semibold text-foreground mt-0.5">
                {formatCurrency(schedule.openingAccumulatedDep)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">
                AY 2026–27 Dep. Charge:
              </span>
              <p className="font-mono font-bold text-danger mt-0.5">
                -{formatCurrency(schedule.currentYearDepCharge)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">
                Closing Accumulated Dep:
              </span>
              <p className="font-mono font-bold text-danger mt-0.5">
                -{formatCurrency(schedule.closingAccumulatedDep)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 flex items-center justify-between">
            <div>
              <span className="text-muted-foreground block">
                Residual Salvage Value: {formatCurrency(schedule.salvageValue)}
              </span>
              <strong className="text-emerald-900">
                Closing Net Book Value (NBV):
              </strong>
            </div>
            <span className="font-mono text-base font-extrabold text-emerald-700">
              {formatCurrency(schedule.closingNetBookValue)}
            </span>
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
