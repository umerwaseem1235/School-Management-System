"use client";

import * as React from "react";
import { Box, Building2, Check, Wrench } from "lucide-react";
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
  AssetAllocationRecord,
  AssetMaintenanceRecord,
  FixedAssetCategory,
  FixedAssetRecord,
} from "@/lib/mock/assets";

const CATEGORIES: FixedAssetCategory[] = [
  "Power & Solar Plant",
  "IT & Server Infrastructure",
  "Smart Classroom AV",
  "HVAC & Climate Control",
  "Science Lab Apparatus",
  "Printing & Secrecy Plant",
  "Security & Surveillance",
];

const CAMPUSES = [
  "Gulberg",
  "DHA Phase 5",
  "F-8 Islamabad",
  "Clifton",
  "Bahria Town",
];

const fieldClass =
  "h-9 w-full rounded-[4px] border border-border/80 bg-white px-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. REGISTER / EDIT FIXED ASSET MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface FixedAssetFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: FixedAssetRecord | null;
  totalCount: number;
  onSave: (asset: FixedAssetRecord) => void;
}

export function FixedAssetFormModal({
  open,
  onOpenChange,
  initialData,
  totalCount,
  onSave,
}: FixedAssetFormModalProps) {
  const [assetTag, setAssetTag] = React.useState("");
  const [serialNo, setSerialNo] = React.useState("");
  const [assetName, setAssetName] = React.useState("");
  const [specification, setSpecification] = React.useState("");
  const [category, setCategory] = React.useState<FixedAssetCategory>(
    "IT & Server Infrastructure"
  );
  const [campus, setCampus] = React.useState("Gulberg");
  const [locationRoom, setLocationRoom] = React.useState("");
  const [custodian, setCustodian] = React.useState("");
  const [vendorName, setVendorName] = React.useState("");
  const [purchaseCost, setPurchaseCost] = React.useState("");
  const [depreciationRatePct, setDepreciationRatePct] = React.useState("15");
  const [usefulLifeYears, setUsefulLifeYears] = React.useState("7");
  const [warrantyExpiry, setWarrantyExpiry] = React.useState("2028-10-31");

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setAssetTag(initialData.assetTag);
        setSerialNo(initialData.serialNo);
        setAssetName(initialData.assetName);
        setSpecification(initialData.specification);
        setCategory(initialData.category);
        setCampus(initialData.campus);
        setLocationRoom(initialData.locationRoom);
        setCustodian(initialData.custodian);
        setVendorName(initialData.vendorName);
        setPurchaseCost(String(initialData.purchaseCost));
        setDepreciationRatePct(String(initialData.depreciationRatePct));
        setUsefulLifeYears(String(initialData.usefulLifeYears));
        setWarrantyExpiry(initialData.warrantyExpiry);
      } else {
        setAssetTag(`AST-2026-${101 + totalCount}`);
        setSerialNo("");
        setAssetName("");
        setSpecification("");
        setCategory("IT & Server Infrastructure");
        setCampus("Gulberg");
        setLocationRoom("");
        setCustodian("");
        setVendorName("");
        setPurchaseCost("");
        setDepreciationRatePct("15");
        setUsefulLifeYears("7");
        setWarrantyExpiry("2028-10-31");
      }
    }
  }, [open, initialData, totalCount]);

  const cost = Math.max(0, Number(purchaseCost) || 0);
  const rate = Math.max(5, Number(depreciationRatePct) || 15);
  const annualDep = Math.round((cost * rate) / 100);
  const netBookValue = Math.max(0, cost - annualDep);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim() || cost <= 0) {
      toast.error("Please enter asset name and acquisition cost.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const record: FixedAssetRecord = {
      id: initialData ? initialData.id : `ast-${Date.now()}`,
      assetTag: assetTag.trim() || `AST-2026-${101 + totalCount}`,
      serialNo: serialNo.trim() || `SN-PK-${Math.floor(10000 + Math.random() * 89999)}`,
      assetName: assetName.trim(),
      specification:
        specification.trim() ||
        "Capital equipment inspected and commissioned in institutional asset register.",
      category,
      campus,
      locationRoom:
        locationRoom.trim() || "Main Academic Wing · Ground Floor",
      custodian: custodian.trim() || "Usman Ghani",
      acquisitionDate: initialData ? initialData.acquisitionDate : today,
      warrantyExpiry,
      vendorName:
        vendorName.trim() || "TechnoSphere Enterprise Solutions",
      purchaseCost: cost,
      accumulatedDepreciation: initialData
        ? initialData.accumulatedDepreciation
        : annualDep,
      netBookValue: initialData ? initialData.netBookValue : netBookValue,
      depreciationRatePct: rate,
      usefulLifeYears: Math.max(3, Number(usefulLifeYears) || 7),
      condition: initialData ? initialData.condition : "Excellent",
      status: initialData ? initialData.status : "In Service",
    };

    onSave(record);
    onOpenChange(false);
    toast.success(
      initialData
        ? `Fixed asset ${record.assetTag} updated.`
        : `New fixed asset ${record.assetTag} capitalized in register.`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-h-[calc(100vh-3rem)] sm:max-w-2xl gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        <DialogHeader className="shrink-0 gap-1 border-b border-border/70 px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <Box className="size-4.5 text-brand" />
            <span>
              {initialData
                ? `Edit Fixed Asset — ${initialData.assetTag}`
                : "Register New Capital Fixed Asset"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Record capital acquisition cost, OEM serial number, custody
            location, and IAS-16 depreciation parameters.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Fixed-Asset Tag" required>
              <input
                type="text"
                required
                placeholder="e.g. AST-2026-109"
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="OEM Serial Number" required>
              <input
                type="text"
                required
                placeholder="e.g. DLL-R750-49102"
                value={serialNo}
                onChange={(e) => setSerialNo(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Campus" required>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className={fieldClass}
              >
                {CAMPUSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Fixed Asset Name / Lot Title" required>
              <input
                type="text"
                required
                placeholder="e.g. Perkins 150kVA Prime Acoustic Diesel Generator"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Asset Classification" required>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as FixedAssetCategory)
                }
                className={fieldClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Technical Specification & Model Details">
            <input
              type="text"
              placeholder="e.g. 3-Phase 400V Soundproof Canopy Generator with Auto-Transfer Switch Panel"
              value={specification}
              onChange={(e) => setSpecification(e.target.value)}
              className={fieldClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Installed Room / Bay Location" required>
              <input
                type="text"
                required
                placeholder="e.g. Data Center Vault · Rack DC-01"
                value={locationRoom}
                onChange={(e) => setLocationRoom(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Assigned Custodian Officer" required>
              <input
                type="text"
                required
                placeholder="e.g. Usman Ghani (Head of IT)"
                value={custodian}
                onChange={(e) => setCustodian(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="OEM Supplier / Vendor">
              <input
                type="text"
                placeholder="e.g. TechnoSphere Enterprise Solutions"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Capital Cost (PKR)" required>
              <input
                type="number"
                min={1000}
                required
                placeholder="e.g. 4200000"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Annual Dep. Rate (%)" required>
              <input
                type="number"
                min={5}
                max={50}
                required
                placeholder="e.g. 15"
                value={depreciationRatePct}
                onChange={(e) => setDepreciationRatePct(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Useful Life (Years)" required>
              <input
                type="number"
                min={2}
                max={25}
                required
                placeholder="e.g. 7"
                value={usefulLifeYears}
                onChange={(e) => setUsefulLifeYears(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Warranty Expiry" required>
              <input
                type="date"
                required
                value={warrantyExpiry}
                onChange={(e) => setWarrantyExpiry(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground">
                Annual Depreciation ({rate}%): -{formatCurrency(annualDep)} / Yr
              </span>
              <p className="font-mono text-base font-extrabold text-emerald-700 mt-0.5">
                Projected Year-1 Net Book Value: {formatCurrency(netBookValue)}
              </p>
            </div>
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <ActionButton
              type="button"
              tone="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </ActionButton>
            <ActionButton type="submit" tone="primary">
              <Check className="size-3.5" />
              <span>
                {initialData ? "Save Asset" : "Capitalize Fixed Asset"}
              </span>
            </ActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. ASSIGN ASSET CUSTODY / ALLOCATION MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface AssetAllocationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: FixedAssetRecord[];
  totalCount: number;
  onSave: (allocation: AssetAllocationRecord) => void;
}

export function AssetAllocationFormModal({
  open,
  onOpenChange,
  assets,
  totalCount,
  onSave,
}: AssetAllocationFormModalProps) {
  const [selectedTag, setSelectedTag] = React.useState(
    assets[0]?.assetTag || "AST-2026-101"
  );
  const [buildingBlock, setBuildingBlock] = React.useState("");
  const [roomOrLab, setRoomOrLab] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [assignedCustodian, setAssignedCustodian] = React.useState("");
  const [custodianDesignation, setCustodianDesignation] = React.useState("");

  const activeAsset =
    assets.find((a) => a.assetTag === selectedTag) || assets[0] || null;

  React.useEffect(() => {
    if (open) {
      setSelectedTag(assets[0]?.assetTag || "AST-2026-101");
      setBuildingBlock("");
      setRoomOrLab("");
      setDepartment("");
      setAssignedCustodian("");
      setCustodianDesignation("");
    }
  }, [open, assets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAsset || !assignedCustodian.trim() || !roomOrLab.trim()) {
      toast.error("Please fill in room/lab location and custodian officer.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const newAlloc: AssetAllocationRecord = {
      id: `alc-${Date.now()}`,
      allocationCode: `ALC-2610-${301 + totalCount}`,
      assetTag: activeAsset.assetTag,
      assetName: activeAsset.assetName,
      category: activeAsset.category,
      campus: activeAsset.campus,
      buildingBlock: buildingBlock.trim() || "Main Academic Wing",
      roomOrLab: roomOrLab.trim(),
      department: department.trim() || "Academic Operations",
      assignedCustodian: assignedCustodian.trim(),
      custodianDesignation:
        custodianDesignation.trim() || "Senior Department Custodian",
      assignedDate: today,
      lastAuditDate: today,
      assetValue: activeAsset.netBookValue,
      status: "Assigned",
    };

    onSave(newAlloc);
    onOpenChange(false);
    toast.success(
      `Custody allocation ${newAlloc.allocationCode} assigned to ${newAlloc.assignedCustodian}.`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border border-border/80 bg-white p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="border-b border-border/70 px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <Building2 className="size-4.5 text-brand" />
            <span>Assign Fixed-Asset Custody & Location</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Allocate a capital asset to a specific building block, room, and
            custodian officer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3.5">
          <Field label="Select Registered Fixed Asset" required>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className={fieldClass}
            >
              {assets.map((a) => (
                <option key={a.id} value={a.assetTag}>
                  {a.assetTag} — {a.assetName} ({a.campus})
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Building Block / Wing" required>
              <input
                type="text"
                required
                placeholder="e.g. Senior Academic Block"
                value={buildingBlock}
                onChange={(e) => setBuildingBlock(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Room / Lab / Bay Number" required>
              <input
                type="text"
                required
                placeholder="e.g. Lecture Hall 104 / Server Room"
                value={roomOrLab}
                onChange={(e) => setRoomOrLab(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <Field label="Department / Directorate" required>
            <input
              type="text"
              required
              placeholder="e.g. IT & Digital Infrastructure Directorate"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className={fieldClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Assigned Custodian Name" required>
              <input
                type="text"
                required
                placeholder="e.g. Usman Ghani"
                value={assignedCustodian}
                onChange={(e) => setAssignedCustodian(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Custodian Designation" required>
              <input
                type="text"
                required
                placeholder="e.g. Head of IT Infrastructure"
                value={custodianDesignation}
                onChange={(e) => setCustodianDesignation(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <ActionButton
              type="button"
              tone="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </ActionButton>
            <ActionButton type="submit" tone="primary">
              <Check className="size-3.5" />
              <span>Assign Custody</span>
            </ActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. SCHEDULE PREVENTIVE MAINTENANCE / AMC WORK ORDER MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface AssetMaintenanceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: FixedAssetRecord[];
  totalCount: number;
  onSave: (record: AssetMaintenanceRecord) => void;
}

export function AssetMaintenanceFormModal({
  open,
  onOpenChange,
  assets,
  totalCount,
  onSave,
}: AssetMaintenanceFormModalProps) {
  const [selectedTag, setSelectedTag] = React.useState(
    assets[0]?.assetTag || "AST-2026-101"
  );
  const [maintenanceType, setMaintenanceType] = React.useState<
    AssetMaintenanceRecord["maintenanceType"]
  >("Quarterly Preventive AMC");
  const [serviceVendor, setServiceVendor] = React.useState("");
  const [technicianName, setTechnicianName] = React.useState("");
  const [vendorPhone, setVendorPhone] = React.useState("");
  const [scheduledDate, setScheduledDate] = React.useState("2026-11-10");
  const [serviceCost, setServiceCost] = React.useState("");
  const [remarks, setRemarks] = React.useState("");

  const activeAsset =
    assets.find((a) => a.assetTag === selectedTag) || assets[0] || null;

  React.useEffect(() => {
    if (open) {
      setSelectedTag(assets[0]?.assetTag || "AST-2026-101");
      setMaintenanceType("Quarterly Preventive AMC");
      setServiceVendor("");
      setTechnicianName("");
      setVendorPhone("");
      setScheduledDate("2026-11-10");
      setServiceCost("");
      setRemarks("");
    }
  }, [open, assets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAsset || !serviceVendor.trim()) {
      toast.error("Please select an asset and enter the service contractor.");
      return;
    }

    const newRecord: AssetMaintenanceRecord = {
      id: `amc-${Date.now()}`,
      workOrderNo: `AMC-2610-${601 + totalCount}`,
      assetTag: activeAsset.assetTag,
      assetName: activeAsset.assetName,
      category: activeAsset.category,
      campus: activeAsset.campus,
      maintenanceType,
      serviceVendor: serviceVendor.trim(),
      technicianName: technicianName.trim() || "Engr. Naveed Anwar",
      vendorPhone: vendorPhone.trim() || "+92 42 36309182",
      scheduledDate,
      nextDueDate: "2027-02-10",
      serviceCost: Math.max(0, Number(serviceCost) || 35000),
      amcCovered: true,
      remarks:
        remarks.trim() ||
        "Scheduled preventive inspection and calibration under institutional AMC.",
      status: "Scheduled",
    };

    onSave(newRecord);
    onOpenChange(false);
    toast.success(
      `Maintenance Work Order ${newRecord.workOrderNo} scheduled.`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border border-border/80 bg-white p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="border-b border-border/70 px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <Wrench className="size-4.5 text-brand" />
            <span>Schedule Preventive Maintenance / AMC</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Create an official maintenance work order and assign an AMC
            contractor.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3.5">
          <Field label="Select Fixed Asset" required>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className={fieldClass}
            >
              {assets.map((a) => (
                <option key={a.id} value={a.assetTag}>
                  {a.assetTag} — {a.assetName} ({a.campus})
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Maintenance Category" required>
              <select
                value={maintenanceType}
                onChange={(e) =>
                  setMaintenanceType(
                    e.target.value as AssetMaintenanceRecord["maintenanceType"]
                  )
                }
                className={fieldClass}
              >
                <option value="Quarterly Preventive AMC">
                  Quarterly Preventive AMC
                </option>
                <option value="Annual Calibration & QA">
                  Annual Calibration & QA
                </option>
                <option value="Filter & Coolant Overhaul">
                  Filter & Coolant Overhaul
                </option>
                <option value="Component Replacement">
                  Component Replacement
                </option>
              </select>
            </Field>
            <Field label="Scheduled Service Date" required>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="AMC Contractor / Vendor" required>
              <input
                type="text"
                required
                placeholder="e.g. Allied Power & Engineering Works"
                value={serviceVendor}
                onChange={(e) => setServiceVendor(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Lead Service Engineer" required>
              <input
                type="text"
                required
                placeholder="e.g. Engr. Naveed Anwar"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Contractor Phone">
              <input
                type="text"
                placeholder="e.g. +92 42 36309182"
                value={vendorPhone}
                onChange={(e) => setVendorPhone(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Estimated Service Cost (PKR)" required>
              <input
                type="number"
                min={0}
                required
                placeholder="e.g. 35000"
                value={serviceCost}
                onChange={(e) => setServiceCost(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <Field label="Scope of Maintenance Work">
            <input
              type="text"
              placeholder="e.g. 250-Hour filter overhaul, thermal inspection & load bank certification"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className={fieldClass}
            />
          </Field>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <ActionButton
              type="button"
              tone="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </ActionButton>
            <ActionButton type="submit" tone="primary">
              <Check className="size-3.5" />
              <span>Schedule Work Order</span>
            </ActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
