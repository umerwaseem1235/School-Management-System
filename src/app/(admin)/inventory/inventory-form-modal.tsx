"use client";

import * as React from "react";
import { Check, PackagePlus, Send, ShoppingCart } from "lucide-react";
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
import { formatCurrency } from "@/lib/format";
import {
  computeStockStatus,
  type DepartmentalIssuanceRecord,
  type InventoryCategory,
  type InventoryItemRecord,
  type PurchaseOrderRecord,
} from "@/lib/mock/inventory";

const CATEGORIES: InventoryCategory[] = [
  "Stationery & Printing",
  "Science Lab Equipment",
  "IT & AV Hardware",
  "Examination Supplies",
  "Classroom Furniture",
  "Sports & Athletics",
  "Electrical & Maintenance",
  "Medical & Safety",
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
   1. ADD / EDIT STORE STOCK ITEM MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface InventoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: InventoryItemRecord | null;
  totalCount: number;
  onSave: (record: InventoryItemRecord) => void;
}

export function InventoryFormModal({
  open,
  onOpenChange,
  initialData,
  totalCount,
  onSave,
}: InventoryFormModalProps) {
  const [sku, setSku] = React.useState("");
  const [name, setName] = React.useState("");
  const [specification, setSpecification] = React.useState("");
  const [category, setCategory] = React.useState<InventoryCategory>(
    "Stationery & Printing"
  );
  const [campus, setCampus] = React.useState("Gulberg");
  const [storeLocation, setStoreLocation] = React.useState("");
  const [unit, setUnit] = React.useState("Reams");
  const [quantity, setQuantity] = React.useState("");
  const [reorderLevel, setReorderLevel] = React.useState("");
  const [unitCost, setUnitCost] = React.useState("");
  const [supplierName, setSupplierName] = React.useState("");
  const [supplierNtn, setSupplierNtn] = React.useState("");
  const [supplierPhone, setSupplierPhone] = React.useState("");
  const [custodian, setCustodian] = React.useState("");

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setSku(initialData.sku);
        setName(initialData.name);
        setSpecification(initialData.specification);
        setCategory(initialData.category);
        setCampus(initialData.campus);
        setStoreLocation(initialData.storeLocation);
        setUnit(initialData.unit);
        setQuantity(String(initialData.quantity));
        setReorderLevel(String(initialData.reorderLevel));
        setUnitCost(String(initialData.unitCost));
        setSupplierName(initialData.supplierName);
        setSupplierNtn(initialData.supplierNtn);
        setSupplierPhone(initialData.supplierPhone);
        setCustodian(initialData.custodian);
      } else {
        setSku(`INV-SKU-${101 + totalCount}`);
        setName("");
        setSpecification("");
        setCategory("Stationery & Printing");
        setCampus("Gulberg");
        setStoreLocation("");
        setUnit("Units");
        setQuantity("");
        setReorderLevel("15");
        setUnitCost("");
        setSupplierName("");
        setSupplierNtn("");
        setSupplierPhone("");
        setCustodian("M. Tariq Mehmood");
      }
    }
  }, [open, initialData, totalCount]);

  const parsedQty = Math.max(0, Number(quantity) || 0);
  const parsedReorder = Math.max(1, Number(reorderLevel) || 10);
  const parsedCost = Math.max(0, Number(unitCost) || 0);
  const computedTotal = parsedQty * parsedCost;
  const computedStatus = computeStockStatus(parsedQty, parsedReorder);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter the inventory item name.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const id = initialData ? initialData.id : `inv-${Date.now()}`;

    const record: InventoryItemRecord = {
      id,
      sku: sku.trim() || `INV-SKU-${101 + totalCount}`,
      name: name.trim(),
      specification:
        specification.trim() ||
        "Standard institutional store specification verified by QA.",
      category,
      campus,
      storeLocation:
        storeLocation.trim() || "Central Campus Store · Rack A-02",
      unit: unit.trim() || "Units",
      quantity: parsedQty,
      reorderLevel: parsedReorder,
      unitCost: parsedCost,
      totalValue: computedTotal,
      supplierName:
        supplierName.trim() || "Allied Paper & Stationery Mart",
      supplierNtn: supplierNtn.trim() || "4182910-6",
      supplierPhone: supplierPhone.trim() || "+92 42 35714820",
      custodian: custodian.trim() || "M. Tariq Mehmood",
      lastRestocked: today,
      status: computedStatus,
      movementLogs: initialData
        ? initialData.movementLogs
        : [
            {
              id: `${id}-mov-init`,
              timestamp: `${today} 10:00 AM`,
              voucherRef: `GRN-2610-${101 + totalCount}`,
              type: "GRN Received",
              qtyChange: `+${parsedQty} ${unit.trim() || "Units"}`,
              balanceAfter: parsedQty,
              departmentOrVendor:
                supplierName.trim() || "Allied Paper & Stationery Mart",
              actor: custodian.trim() || "M. Tariq Mehmood",
              remarks: "Opening store stock registered in Central Inventory",
            },
          ],
    };

    onSave(record);
    onOpenChange(false);
    toast.success(
      initialData
        ? `Inventory SKU ${record.sku} updated successfully.`
        : `New inventory SKU ${record.sku} added to central store register.`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-h-[calc(100vh-3rem)] sm:max-w-2xl gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        <DialogHeader className="shrink-0 gap-1 border-b border-border/70 px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <PackagePlus className="size-4.5 text-brand" />
            <span>
              {initialData
                ? `Edit Store Item — ${initialData.sku}`
                : "Register New Store Stock Item"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure store SKU, reorder threshold, unit valuation, and approved
            supplier credentials.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Store SKU Code" required>
              <input
                type="text"
                required
                placeholder="e.g. INV-SKU-113"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Inventory Category" required>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as InventoryCategory)
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
            <Field label="Campus Store" required>
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
            <Field label="Item Name / Title" required>
              <input
                type="text"
                required
                placeholder="e.g. Double A A4 Copier Paper (80 GSM)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Store Room & Rack Location" required>
              <input
                type="text"
                required
                placeholder="e.g. Central Stationery Store · Rack A-02"
                value={storeLocation}
                onChange={(e) => setStoreLocation(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <Field label="Technical Specification / Pack Size">
            <input
              type="text"
              placeholder="e.g. 500 Sheets per Ream, High-Brightness Laser & Photocopier Paper"
              value={specification}
              onChange={(e) => setSpecification(e.target.value)}
              className={fieldClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="On-Hand Quantity" required>
              <input
                type="number"
                min={0}
                required
                placeholder="e.g. 250"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Reorder Alert Level" required>
              <input
                type="number"
                min={1}
                required
                placeholder="e.g. 50"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Unit of Measure" required>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={fieldClass}
              >
                <option value="Units">Units</option>
                <option value="Reams">Reams</option>
                <option value="Boxes">Boxes</option>
                <option value="Kits">Kits</option>
                <option value="Sets">Sets</option>
                <option value="Booklets">Booklets</option>
                <option value="Cartridges">Cartridges</option>
                <option value="Packs">Packs</option>
              </select>
            </Field>
            <Field label="Unit Cost (PKR)" required>
              <input
                type="number"
                min={1}
                required
                placeholder="e.g. 1450"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Approved Supplier / Vendor Name">
              <input
                type="text"
                placeholder="e.g. Allied Paper & Stationery Mart"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Supplier NTN / Tax ID">
              <input
                type="text"
                placeholder="e.g. 4182910-6"
                value={supplierNtn}
                onChange={(e) => setSupplierNtn(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Supplier Contact Phone">
              <input
                type="text"
                placeholder="e.g. +92 42 35714820"
                value={supplierPhone}
                onChange={(e) => setSupplierPhone(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Store Custodian / Officer">
              <input
                type="text"
                placeholder="e.g. M. Tariq Mehmood (Store Officer)"
                value={custodian}
                onChange={(e) => setCustodian(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          {/* Live Valuation & Stock Status Preview */}
          <div className="flex items-center justify-between rounded-xl border border-brand/20 bg-brand-50/50 px-4 py-3 text-xs">
            <div>
              <span className="text-muted-foreground font-medium">
                Computed Asset Valuation ({parsedQty} {unit} ×{" "}
                {formatCurrency(parsedCost)}):
              </span>
              <p className="font-mono text-base font-extrabold text-[#091d3e] mt-0.5">
                {formatCurrency(computedTotal)}
              </p>
            </div>
            <div className="text-right">
              <span className="block text-[10.5px] font-semibold uppercase text-muted-foreground mb-1">
                Stock Control Status
              </span>
              <StatusBadge status={computedStatus} />
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
              <span>{initialData ? "Save Changes" : "Register Stock SKU"}</span>
            </ActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. CREATE INSTITUTIONAL PURCHASE ORDER (PO) MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface PurchaseOrderFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount: number;
  onSave: (po: PurchaseOrderRecord) => void;
}

export function PurchaseOrderFormModal({
  open,
  onOpenChange,
  totalCount,
  onSave,
}: PurchaseOrderFormModalProps) {
  const [title, setTitle] = React.useState("");
  const [itemsSummary, setItemsSummary] = React.useState("");
  const [category, setCategory] = React.useState<InventoryCategory>(
    "Stationery & Printing"
  );
  const [campus, setCampus] = React.useState("Gulberg");
  const [supplierName, setSupplierName] = React.useState("");
  const [supplierNtn, setSupplierNtn] = React.useState("");
  const [supplierPhone, setSupplierPhone] = React.useState("");
  const [supplierBank, setSupplierBank] = React.useState("");
  const [supplierIban, setSupplierIban] = React.useState("");
  const [orderedQty, setOrderedQty] = React.useState("");
  const [unit, setUnit] = React.useState("Units");
  const [grossAmount, setGrossAmount] = React.useState("");
  const [expectedDelivery, setExpectedDelivery] = React.useState("2026-11-05");
  const [requestedBy, setRequestedBy] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setTitle("");
      setItemsSummary("");
      setCategory("Stationery & Printing");
      setCampus("Gulberg");
      setSupplierName("");
      setSupplierNtn("");
      setSupplierPhone("");
      setSupplierBank("");
      setSupplierIban("");
      setOrderedQty("");
      setUnit("Units");
      setGrossAmount("");
      setExpectedDelivery("2026-11-05");
      setRequestedBy("");
    }
  }, [open]);

  const gross = Math.max(0, Number(grossAmount) || 0);
  const gst = Math.round(gross * 0.18);
  const wht = Math.round(gross * 0.045);
  const netPayable = gross + gst - wht;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || gross <= 0) {
      toast.error("Please enter order title and valid gross amount.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const poNumber = `PO-2610-${701 + totalCount}`;

    const newPo: PurchaseOrderRecord = {
      id: `po-${Date.now()}`,
      poNumber,
      grnNumber: "PENDING-GRN",
      orderDate: today,
      expectedDelivery,
      title: title.trim(),
      itemsSummary:
        itemsSummary.trim() || `${orderedQty || 10} ${unit} — ${title.trim()}`,
      category,
      campus,
      supplierName:
        supplierName.trim() || "Allied Paper & Stationery Mart",
      supplierNtn: supplierNtn.trim() || "4182910-6",
      supplierPhone: supplierPhone.trim() || "+92 42 35714820",
      supplierBank: supplierBank.trim() || "Meezan Bank",
      supplierIban: supplierIban.trim() || "PK44MEZN0002010104829106",
      orderedQty: Math.max(1, Number(orderedQty) || 10),
      unit,
      grossAmount: gross,
      gstAmount: gst,
      whtDeduction: wht,
      netPayable,
      paymentTerms: "100% Upon GRN Verification",
      requestedBy: requestedBy.trim() || "M. Tariq Mehmood (Store Officer)",
      approvedBy: "Hamza Tariq (Super Admin)",
      status: "Ordered",
    };

    onSave(newPo);
    onOpenChange(false);
    toast.success(`Purchase Order ${poNumber} issued to ${newPo.supplierName}.`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-h-[calc(100vh-3rem)] sm:max-w-2xl gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        <DialogHeader className="shrink-0 gap-1 border-b border-border/70 px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <ShoppingCart className="size-4.5 text-brand" />
            <span>Issue Institutional Purchase Order (PO)</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Generate an official vendor procurement order with automatic 18% GST
            and 4.5% WHT tax computation.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Purchase Order Title" required>
              <input
                type="text"
                required
                placeholder="e.g. Autumn Exam Answer Booklets & A4 Paper Lot"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Procurement Category" required>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as InventoryCategory)
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

          <Field label="Line Items & Technical Specification" required>
            <input
              type="text"
              required
              placeholder="e.g. 5,000 Watermarked 32-Page Answer Booklets + 200 Reams Double A Paper"
              value={itemsSummary}
              onChange={(e) => setItemsSummary(e.target.value)}
              className={fieldClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Approved Supplier Name" required>
              <input
                type="text"
                required
                placeholder="e.g. Allied Paper & Stationery Mart"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Supplier NTN">
              <input
                type="text"
                placeholder="e.g. 4182910-6"
                value={supplierNtn}
                onChange={(e) => setSupplierNtn(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Supplier Contact Phone">
              <input
                type="text"
                placeholder="e.g. +92 42 35714820"
                value={supplierPhone}
                onChange={(e) => setSupplierPhone(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Settlement Bank Name">
              <input
                type="text"
                placeholder="e.g. Meezan Bank / Habib Bank Limited"
                value={supplierBank}
                onChange={(e) => setSupplierBank(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Vendor IBAN / Account #">
              <input
                type="text"
                placeholder="e.g. PK44MEZN0002010104829106"
                value={supplierIban}
                onChange={(e) => setSupplierIban(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Destination Campus" required>
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
            <Field label="Total Quantity" required>
              <input
                type="number"
                min={1}
                required
                placeholder="e.g. 200"
                value={orderedQty}
                onChange={(e) => setOrderedQty(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Gross Amount (PKR)" required>
              <input
                type="number"
                min={1}
                required
                placeholder="e.g. 450000"
                value={grossAmount}
                onChange={(e) => setGrossAmount(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Expected Delivery" required>
              <input
                type="date"
                required
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <Field label="Requisitioning Officer / Department Head">
            <input
              type="text"
              placeholder="e.g. Dr. Salman Qureshi (Controller Examinations)"
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
              className={fieldClass}
            />
          </Field>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground">
                Gross: {formatCurrency(gross)} | +18% GST: {formatCurrency(gst)}{" "}
                | -4.5% WHT: {formatCurrency(wht)}
              </span>
              <p className="font-mono text-base font-extrabold text-emerald-700 mt-0.5">
                Net PO Payable: {formatCurrency(netPayable)}
              </p>
            </div>
            <StatusBadge status="Ordered" />
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
              <span>Authorize & Issue PO</span>
            </ActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. DEPARTMENTAL STORE ISSUANCE MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

interface IssuanceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryItemRecord[];
  totalCount: number;
  onSave: (record: DepartmentalIssuanceRecord) => void;
}

export function IssuanceFormModal({
  open,
  onOpenChange,
  items,
  totalCount,
  onSave,
}: IssuanceFormModalProps) {
  const [selectedSku, setSelectedSku] = React.useState(
    items[0]?.sku || "INV-SKU-101"
  );
  const [department, setDepartment] = React.useState("");
  const [issuedTo, setIssuedTo] = React.useState("");
  const [quantityIssued, setQuantityIssued] = React.useState("");
  const [purpose, setPurpose] = React.useState("");
  const [returnable, setReturnable] = React.useState(false);

  const selectedItem =
    items.find((i) => i.sku === selectedSku) || items[0] || null;

  React.useEffect(() => {
    if (open) {
      setSelectedSku(items[0]?.sku || "INV-SKU-101");
      setDepartment("");
      setIssuedTo("");
      setQuantityIssued("");
      setPurpose("");
      setReturnable(false);
    }
  }, [open, items]);

  const qty = Math.max(1, Number(quantityIssued) || 0);
  const unitCost = selectedItem ? selectedItem.unitCost : 1450;
  const totalValuation = qty * unitCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !department.trim() || !issuedTo.trim()) {
      toast.error("Please fill in the receiving department and staff custodian.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const issueVoucherNo = `ISS-2610-${501 + totalCount}`;

    const newIssuance: DepartmentalIssuanceRecord = {
      id: `iss-${Date.now()}`,
      issueVoucherNo,
      requisitionNo: `REQ-2610-${901 + totalCount * 3}`,
      issueDate: today,
      sku: selectedItem.sku,
      itemName: selectedItem.name,
      category: selectedItem.category,
      campus: selectedItem.campus,
      department: department.trim(),
      issuedTo: issuedTo.trim(),
      issuedBy: selectedItem.custodian,
      quantityIssued: qty,
      unit: selectedItem.unit,
      unitCost: selectedItem.unitCost,
      totalValuation,
      purpose:
        purpose.trim() ||
        "Issued against approved departmental store requisition.",
      returnable,
      status: "Issued",
    };

    onSave(newIssuance);
    onOpenChange(false);
    toast.success(
      `Store Issuance Voucher ${issueVoucherNo} released to ${newIssuance.department}.`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border border-border/80 bg-white p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="border-b border-border/70 px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <Send className="size-4 text-brand" />
            <span>Issue Store Stock to Department</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Record departmental stock release and deduct inventory balance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3.5">
          <Field label="Select Store SKU & Item" required>
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className={fieldClass}
            >
              {items.map((i) => (
                <option key={i.id} value={i.sku}>
                  {i.sku} — {i.name} ({i.quantity} {i.unit} in {i.campus})
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Receiving Department / Lab" required>
              <input
                type="text"
                required
                placeholder="e.g. Examination Controller Cell"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Issued To (Staff Custodian)" required>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Salman Qureshi (Controller)"
                value={issuedTo}
                onChange={(e) => setIssuedTo(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label={`Quantity to Issue (${selectedItem?.unit || "Units"})`}
              required
            >
              <input
                type="number"
                min={1}
                required
                placeholder="e.g. 25"
                value={quantityIssued}
                onChange={(e) => setQuantityIssued(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Asset Return Policy">
              <select
                value={returnable ? "returnable" : "consumable"}
                onChange={(e) =>
                  setReturnable(e.target.value === "returnable")
                }
                className={fieldClass}
              >
                <option value="consumable">Consumable (Non-Returnable)</option>
                <option value="returnable">Returnable Institutional Asset</option>
              </select>
            </Field>
          </div>

          <Field label="Requisition Purpose / Justification" required>
            <input
              type="text"
              required
              placeholder="e.g. Mid-term assessment paper printing & secrecy distribution"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className={fieldClass}
            />
          </Field>

          <div className="rounded-xl border border-brand/20 bg-brand-50/50 px-4 py-2.5 flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">
              Issued Stock Valuation:
            </span>
            <span className="font-mono text-sm font-extrabold text-[#091d3e]">
              {formatCurrency(totalValuation)}
            </span>
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
              <span>Release Store Stock</span>
            </ActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
