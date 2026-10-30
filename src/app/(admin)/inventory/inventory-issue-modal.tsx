"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  Edit3,
  List,
  Minus,
  PackageCheck,
  PackageMinus,
  Plus,
  Printer,
  RotateCcw,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { printHtml } from "@/lib/print-html";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionButton } from "@/components/shared/action-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import { formatDate, formatNumber } from "@/lib/format";
import {
  computeStockStatus,
  ISSUANCE_DEPARTMENTS,
  ISSUEE_DIRECTORY,
  ISSUEE_ROLES,
  type InventoryItemRecord,
  type IssuanceStatus,
  type IssuanceType,
  type IssueeRole,
  type StockIssuanceRecord,
} from "@/lib/mock/inventory";

/** Stable reference date (avoids dynamic `new Date()` during prerender). */
export const ISSUANCE_TODAY = "2026-10-28";

const fieldClass =
  "h-10 w-full rounded-lg border border-border/90 bg-white px-3.5 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15";

const labelClass = "mb-1.5 block text-xs font-bold text-foreground";

const toggleClass =
  "inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-[#091d3e] transition-colors hover:bg-slate-200/80 cursor-pointer";

/* ────────────────────────────────────────────────────────────────────────── */
/* Shared: Issuance Status Pill                                               */
/* ────────────────────────────────────────────────────────────────────────── */

export function IssuanceStatusPill({
  status,
  overdue = false,
}: {
  status: IssuanceStatus;
  overdue?: boolean;
}) {
  if (status === "Issued" && overdue) {
    return (
      <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-rose-300 bg-rose-50 px-3 py-0.5 text-[11px] font-bold text-rose-800 shadow-2xs">
        Overdue
      </span>
    );
  }
  const styles: Record<IssuanceStatus, string> = {
    Issued: "border-amber-300/80 bg-amber-50 text-amber-900 shadow-2xs",
    Returned: "border-emerald-300/80 bg-emerald-50 text-emerald-900 shadow-2xs",
    Consumed: "border-slate-200 bg-slate-100 text-slate-700 shadow-2xs",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-full border px-3 py-0.5 text-[11px] font-semibold shadow-2xs",
        styles[status]
      )}
    >
      {status === "Issued" ? "Pending Return" : status}
    </span>
  );
}

export function isIssuanceOverdue(r: StockIssuanceRecord): boolean {
  return (
    r.status === "Issued" &&
    Boolean(r.expectedReturnDate) &&
    r.expectedReturnDate < ISSUANCE_TODAY
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 1. Issue Stock Modal                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

interface IssueStockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryItemRecord[];
  /** Pre-selects an item when opened from a stock row's "Issue" button. */
  preselectedItemId?: string | null;
  nextIssueNumber: number;
  onIssue: (record: StockIssuanceRecord) => void;
}

export function IssueStockModal({
  open,
  onOpenChange,
  items,
  preselectedItemId,
  nextIssueNumber,
  onIssue,
}: IssueStockModalProps) {
  const [itemId, setItemId] = React.useState("");
  const [quantity, setQuantity] = React.useState("1");

  const [isManualPerson, setIsManualPerson] = React.useState(false);
  const [personId, setPersonId] = React.useState("");
  const [manualPersonName, setManualPersonName] = React.useState("");
  const [role, setRole] = React.useState<IssueeRole>("Teacher");

  const [isManualDept, setIsManualDept] = React.useState(false);
  const [department, setDepartment] = React.useState(
    ISSUANCE_DEPARTMENTS[0] ?? "Administration"
  );
  const [manualDept, setManualDept] = React.useState("");

  const [issuanceType, setIssuanceType] =
    React.useState<IssuanceType>("Consumable");
  const [issueDate, setIssueDate] = React.useState(ISSUANCE_TODAY);
  const [expectedReturnDate, setExpectedReturnDate] = React.useState("");
  const [purpose, setPurpose] = React.useState("");
  const [issuedBy, setIssuedBy] = React.useState("Store Keeper");

  const qtyInputRef = React.useRef<HTMLInputElement>(null);

  // Reset the form each time the modal opens
  React.useEffect(() => {
    if (!open) return;
    const firstAvailable = items.find((i) => i.quantity > 0);
    const initialItem =
      (preselectedItemId && items.find((i) => i.id === preselectedItemId)) ||
      firstAvailable;
    setItemId(initialItem?.id ?? "");
    setQuantity("1");
    setIsManualPerson(false);
    setPersonId("");
    setManualPersonName("");
    setRole("Teacher");
    setIsManualDept(false);
    setDepartment(ISSUANCE_DEPARTMENTS[0] ?? "Administration");
    setManualDept("");
    setIssuanceType(
      initialItem && ["Sports", "Science Lab", "IT & Hardware"].includes(initialItem.category)
        ? "Returnable"
        : "Consumable"
    );
    setIssueDate(ISSUANCE_TODAY);
    setExpectedReturnDate("");
    setPurpose("");
    setIssuedBy("Store Keeper");
    if (preselectedItemId) {
      setTimeout(() => qtyInputRef.current?.select(), 80);
    }
  }, [open, preselectedItemId, items]);

  const selectedItem = items.find((i) => i.id === itemId) ?? null;
  const available = selectedItem?.quantity ?? 0;
  const numericQty = Math.max(0, Math.trunc(Number(quantity) || 0));
  const exceedsStock = numericQty > available;
  const remaining = Math.max(0, available - numericQty);
  const remainingStatus = selectedItem
    ? computeStockStatus(remaining, selectedItem.reorderLevel)
    : "In Stock";

  const directoryPerson = ISSUEE_DIRECTORY.find((p) => p.id === personId);
  const resolvedPerson = isManualPerson
    ? manualPersonName.trim()
    : directoryPerson?.name ?? "";
  const resolvedDept = isManualDept ? manualDept.trim() : department;

  const handlePersonSelect = (value: string) => {
    if (value === "__manual__") {
      setIsManualPerson(true);
      return;
    }
    setPersonId(value);
    const p = ISSUEE_DIRECTORY.find((x) => x.id === value);
    if (p) {
      setRole(p.role);
      if (ISSUANCE_DEPARTMENTS.includes(p.department)) {
        setIsManualDept(false);
        setDepartment(p.department);
      } else {
        setIsManualDept(true);
        setManualDept(p.department);
      }
    }
  };

  const stepQty = (delta: number) => {
    setQuantity((prev) => {
      const next = Math.max(1, Math.trunc(Number(prev) || 0) + delta);
      return String(available > 0 ? Math.min(next, available) : next);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) {
      toast.error("Please select the item to issue.");
      return;
    }
    if (numericQty <= 0) {
      toast.error("Please enter a quantity of at least 1.");
      qtyInputRef.current?.focus();
      return;
    }
    if (exceedsStock) {
      toast.error(
        `Only ${available} ${selectedItem.unit} of "${selectedItem.name}" available in store.`
      );
      qtyInputRef.current?.focus();
      return;
    }
    if (!resolvedPerson) {
      toast.error("Please select or enter the name of the person receiving the item.");
      return;
    }
    if (!resolvedDept) {
      toast.error("Please select or enter the department / class.");
      return;
    }
    if (issuanceType === "Returnable" && !expectedReturnDate) {
      toast.error("Please set the expected return date for returnable items.");
      return;
    }
    if (
      issuanceType === "Returnable" &&
      expectedReturnDate &&
      expectedReturnDate < issueDate
    ) {
      toast.error("Expected return date cannot be before the issue date.");
      return;
    }

    const record: StockIssuanceRecord = {
      id: `iss-${Date.now()}`,
      issueNo: `ISS-${nextIssueNumber}`,
      issueDate,
      itemId: selectedItem.id,
      itemSku: selectedItem.sku,
      itemName: selectedItem.name,
      itemCategory: selectedItem.category,
      unit: selectedItem.unit,
      quantity: numericQty,
      issuedTo: resolvedPerson,
      issueeRole: role,
      department: resolvedDept,
      purpose: purpose.trim() || "General use",
      issuanceType,
      expectedReturnDate: issuanceType === "Returnable" ? expectedReturnDate : "",
      returnedDate: "",
      issuedBy: issuedBy.trim() || "Store Keeper",
      status: issuanceType === "Returnable" ? "Issued" : "Consumed",
    };

    onIssue(record);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col sm:max-w-2xl gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        {/* Executive Header */}
        <DialogHeader className="shrink-0 gap-1 border-b border-border/60 bg-gradient-to-r from-slate-50/90 via-white to-white px-6 py-4.5">
          <div className="flex items-center gap-3.5 pr-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#091d3e] to-[#1e3a66] text-white shadow-xs ring-1 ring-[#091d3e]/20">
              <PackageMinus className="size-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold leading-tight text-foreground">
                Issue Stock
              </DialogTitle>
              <DialogDescription className="sr-only">
                Hand over store items to a teacher, staff member or department. The issued quantity is deducted from stock automatically.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {/* Live Stock Math Card (Symmetrical & Equal Spacing from Above and Below) */}
            <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50/70 shadow-2xs">
              <div className="grid grid-cols-3 divide-x divide-border/70">
                <div className="px-5 py-3.5">
                  <span className="block text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    Available in Store
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-mono text-xl font-extrabold tabular-nums text-[#091d3e]">
                      {formatNumber(available)}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {selectedItem?.unit ?? "Units"}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-3.5">
                  <span className="block text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    Issuing
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    {numericQty > 0 && (
                      <ArrowDownRight className="size-4 shrink-0 text-rose-600 self-center" />
                    )}
                    <span
                      className={cn(
                        "font-mono text-xl font-extrabold tabular-nums",
                        numericQty > 0 ? "text-rose-600" : "text-muted-foreground"
                      )}
                    >
                      {numericQty > 0 ? `−${formatNumber(numericQty)}` : "0"}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {selectedItem?.unit ?? "Units"}
                    </span>
                  </div>
                </div>

                <div
                  className={cn(
                    "px-5 py-3.5 transition-colors",
                    exceedsStock
                      ? "bg-rose-50/80"
                      : remainingStatus === "Out of Stock"
                      ? "bg-rose-50/60"
                      : remainingStatus === "Low Stock"
                      ? "bg-amber-50/60"
                      : "bg-emerald-50/60"
                  )}
                >
                  <span className="block text-[10.5px] font-bold uppercase tracking-wider text-[#091d3e]">
                    Remaining After Issue
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span
                      className={cn(
                        "font-mono text-xl font-extrabold tabular-nums",
                        exceedsStock || remainingStatus === "Out of Stock"
                          ? "text-rose-600"
                          : remainingStatus === "Low Stock"
                          ? "text-amber-700"
                          : "text-emerald-800"
                      )}
                    >
                      {exceedsStock ? "—" : formatNumber(remaining)}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {selectedItem?.unit ?? "Units"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* ── Section 1: Item & Quantity ── */}
            <section className="space-y-3.5">
              <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#091d3e]">
                <span className="grid size-5 place-items-center rounded-md bg-[#091d3e] font-mono text-[10px] text-white">
                  1
                </span>
                Item &amp; Quantity
              </h4>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Item <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={itemId}
                      onChange={(e) => {
                        setItemId(e.target.value);
                        setQuantity("1");
                        const it = items.find((i) => i.id === e.target.value);
                        if (it) {
                          setIssuanceType(
                            ["Sports", "Science Lab", "IT & Hardware"].includes(it.category)
                              ? "Returnable"
                              : "Consumable"
                          );
                        }
                      }}
                      className={cn(fieldClass, "appearance-none pr-9 cursor-pointer")}
                    >
                      <option value="" disabled>
                        Select item to issue...
                      </option>
                      {items.map((i) => (
                        <option key={i.id} value={i.id} disabled={i.quantity <= 0}>
                          {i.name} — {formatNumber(i.quantity)} {i.unit} available
                          {i.quantity <= 0 ? " (Out of Stock)" : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  {selectedItem && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md border border-brand/20 bg-brand-50/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#091d3e]">
                        {selectedItem.sku}
                      </span>
                      <span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                        {selectedItem.category}
                      </span>
                      <span className="text-[10.5px] font-medium text-muted-foreground">
                        Reorder at {formatNumber(selectedItem.reorderLevel)}{" "}
                        {selectedItem.unit}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Quantity <span className="text-danger">*</span>
                  </label>
                  <div
                    className={cn(
                      "flex h-10 items-stretch overflow-hidden rounded-lg border bg-white focus-within:ring-2",
                      exceedsStock
                        ? "border-rose-400 focus-within:ring-rose-200"
                        : "border-border/90 focus-within:border-brand focus-within:ring-brand/15"
                    )}
                  >
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => stepQty(-1)}
                      className="grid w-9 shrink-0 place-items-center border-r border-border/80 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 cursor-pointer"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <input
                      ref={qtyInputRef}
                      type="number"
                      min={1}
                      max={available || undefined}
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full min-w-0 bg-transparent text-center font-mono text-sm font-extrabold text-foreground focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => stepQty(1)}
                      className="grid w-9 shrink-0 place-items-center border-l border-border/80 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <p
                    className={cn(
                      "mt-1.5 text-[10.5px] font-semibold",
                      exceedsStock ? "text-rose-600" : "text-muted-foreground"
                    )}
                  >
                    {exceedsStock
                      ? `Exceeds stock — max ${formatNumber(available)}`
                      : `Max ${formatNumber(available)} ${selectedItem?.unit ?? ""}`}
                  </p>
                </div>
              </div>
            </section>

            {/* ── Section 2: Issued To ── */}
            <section className="space-y-3.5 border-t border-dashed border-border/80 pt-5">
              <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#091d3e]">
                <span className="grid size-5 place-items-center rounded-md bg-[#091d3e] font-mono text-[10px] text-white">
                  2
                </span>
                Issued To (Receiving Person)
              </h4>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-xs font-bold text-foreground">
                    Person Name <span className="text-danger">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsManualPerson((p) => !p)}
                    className={toggleClass}
                  >
                    {isManualPerson ? (
                      <>
                        <List className="size-3" />
                        <span>Select from staff directory</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="size-3" />
                        <span>Manual input</span>
                      </>
                    )}
                  </button>
                </div>
                {!isManualPerson ? (
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <select
                      value={personId}
                      onChange={(e) => handlePersonSelect(e.target.value)}
                      className={cn(fieldClass, "appearance-none pl-9 pr-9 cursor-pointer")}
                    >
                      <option value="" disabled>
                        Select teacher / staff member...
                      </option>
                      {ISSUEE_DIRECTORY.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.role}, {p.department}
                        </option>
                      ))}
                      <option value="__manual__">
                        ✏️ Other Person (Manual Input)...
                      </option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                ) : (
                  <input
                    type="text"
                    autoFocus
                    placeholder="Enter full name of the receiving person..."
                    value={manualPersonName}
                    onChange={(e) => setManualPersonName(e.target.value)}
                    className={fieldClass}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Role / Designation</label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as IssueeRole)}
                      className={cn(fieldClass, "appearance-none pr-9 cursor-pointer")}
                    >
                      {ISSUEE_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="block text-xs font-bold text-foreground">
                      Department / Class <span className="text-danger">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsManualDept((p) => !p)}
                      className={toggleClass}
                    >
                      {isManualDept ? (
                        <>
                          <List className="size-3" />
                          <span>Dropdown</span>
                        </>
                      ) : (
                        <>
                          <Edit3 className="size-3" />
                          <span>Manual input</span>
                        </>
                      )}
                    </button>
                  </div>
                  {!isManualDept ? (
                    <div className="relative">
                      <select
                        value={department}
                        onChange={(e) => {
                          if (e.target.value === "__manual__") {
                            setIsManualDept(true);
                          } else {
                            setDepartment(e.target.value);
                          }
                        }}
                        className={cn(fieldClass, "appearance-none pr-9 cursor-pointer")}
                      >
                        {ISSUANCE_DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                        <option value="__manual__">
                          ✏️ Other / Class (Manual Input)...
                        </option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. Grade 7-B, Library"
                      value={manualDept}
                      onChange={(e) => setManualDept(e.target.value)}
                      className={fieldClass}
                    />
                  )}
                </div>
              </div>
            </section>

            {/* ── Section 3: Issuance Details ── */}
            <section className="space-y-3.5 border-t border-dashed border-border/80 pt-5">
              <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#091d3e]">
                <span className="grid size-5 place-items-center rounded-md bg-[#091d3e] font-mono text-[10px] text-white">
                  3
                </span>
                Issuance Details
              </h4>

              {/* Issuance Type Segmented Control */}
              <div>
                <label className={labelClass}>Issuance Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      {
                        value: "Consumable",
                        title: "Consumable",
                        hint: "Used up — not returned (paper, chalk, markers)",
                        icon: PackageMinus,
                      },
                      {
                        value: "Returnable",
                        title: "Returnable",
                        hint: "Lent out — comes back to store (kits, apparatus)",
                        icon: RotateCcw,
                      },
                    ] as const
                  ).map((opt) => {
                    const active = issuanceType === opt.value;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setIssuanceType(opt.value)}
                        className={cn(
                          "flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-left transition-all cursor-pointer",
                          active
                            ? "border-[#091d3e] bg-[#091d3e]/[0.04] ring-2 ring-[#091d3e]/15"
                            : "border-border/80 bg-white hover:border-slate-300 hover:bg-slate-50"
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg",
                            active
                              ? "bg-[#091d3e] text-white"
                              : "bg-slate-100 text-slate-500"
                          )}
                        >
                          <Icon className="size-3.5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs font-bold text-foreground">
                            {opt.title}
                          </span>
                          <span className="block text-[10.5px] leading-snug text-muted-foreground">
                            {opt.hint}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Issue Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className={cn(fieldClass, "font-mono")}
                  />
                </div>
                {issuanceType === "Returnable" ? (
                  <div>
                    <label className={labelClass}>
                      Expected Return Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={issueDate}
                      value={expectedReturnDate}
                      onChange={(e) => setExpectedReturnDate(e.target.value)}
                      className={cn(fieldClass, "font-mono")}
                    />
                  </div>
                ) : (
                  <div>
                    <label className={labelClass}>Issued By</label>
                    <input
                      type="text"
                      placeholder="Store Keeper"
                      value={issuedBy}
                      onChange={(e) => setIssuedBy(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                )}
              </div>

              <div
                className={cn(
                  "grid grid-cols-1 gap-4",
                  issuanceType === "Returnable" && "sm:grid-cols-3"
                )}
              >
                <div className={cn(issuanceType === "Returnable" && "sm:col-span-2")}>
                  <label className={labelClass}>Purpose / Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Mid-term exam printing, Grade 5 classroom use"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                {issuanceType === "Returnable" && (
                  <div>
                    <label className={labelClass}>Issued By</label>
                    <input
                      type="text"
                      placeholder="Store Keeper"
                      value={issuedBy}
                      onChange={(e) => setIssuedBy(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Low-stock / Out-of-stock consequence notice */}
            {selectedItem && !exceedsStock && numericQty > 0 && remainingStatus !== "In Stock" && (
              <div
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs",
                  remainingStatus === "Out of Stock"
                    ? "border-rose-200 bg-rose-50/70 text-rose-900"
                    : "border-amber-200 bg-amber-50/70 text-amber-900"
                )}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={cn(
                      "size-4 shrink-0",
                      remainingStatus === "Out of Stock" ? "text-rose-600" : "text-amber-600"
                    )}
                  />
                  <span>
                    After this issue only{" "}
                    <strong className="font-mono">
                      {formatNumber(remaining)} {selectedItem.unit}
                    </strong>{" "}
                    will remain —{" "}
                    {remainingStatus === "Out of Stock"
                      ? "item will be marked Out of Stock."
                      : `below reorder level (${selectedItem.reorderLevel}). Low Stock alert will trigger.`}
                  </span>
                </div>
                <StatusBadge status={remainingStatus} />
              </div>
            )}
          </div>

          {/* Footer with Symmetrical Spacing & Equal Margins */}
          <div className="shrink-0 flex items-center justify-between gap-4 border-t border-border/70 bg-slate-50/60 px-6 py-4">
            <p className="min-w-0 truncate text-xs font-medium text-muted-foreground">
              {selectedItem && resolvedPerson && numericQty > 0 && !exceedsStock ? (
                <>
                  <strong className="text-foreground">
                    {formatNumber(numericQty)} {selectedItem.unit}
                  </strong>{" "}
                  of {selectedItem.name} →{" "}
                  <strong className="text-foreground">{resolvedPerson}</strong>
                </>
              ) : (
                "Fill in the item, quantity and receiving person."
              )}
            </p>
            <div className="flex shrink-0 items-center gap-2.5">
              <ActionButton
                type="button"
                tone="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <span>Cancel</span>
              </ActionButton>
              <ActionButton
                type="submit"
                tone="primary"
                size="sm"
                disabled={!selectedItem || exceedsStock || numericQty <= 0}
                className="disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="size-3.5" />
                <span>Issue Stock</span>
              </ActionButton>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 2. Issue Slip (View) Modal                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

interface IssuanceViewModalProps {
  record: StockIssuanceRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReturn?: (record: StockIssuanceRecord) => void;
}

export function IssuanceViewModal({
  record,
  open,
  onOpenChange,
  onReturn,
}: IssuanceViewModalProps) {
  if (!record) return null;
  const overdue = isIssuanceOverdue(record);

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Issue Date", value: formatDate(record.issueDate) },
    {
      label: "Issuance Type",
      value: (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold shadow-2xs",
            record.issuanceType === "Returnable"
              ? "border-sky-200 bg-sky-50 text-sky-800"
              : "border-slate-200 bg-slate-100 text-slate-700"
          )}
        >
          {record.issuanceType === "Returnable" ? (
            <RotateCcw className="size-3 text-sky-600" />
          ) : (
            <PackageMinus className="size-3 text-slate-500" />
          )}
          {record.issuanceType}
        </span>
      ),
    },
    { label: "Issued To", value: record.issuedTo },
    { label: "Role / Designation", value: record.issueeRole },
    { label: "Department / Class", value: record.department },
    { label: "Issued By", value: record.issuedBy },
    {
      label: "Expected Return",
      value:
        record.issuanceType === "Returnable" && record.expectedReturnDate
          ? formatDate(record.expectedReturnDate)
          : "Not applicable (Consumable)",
    },
    {
      label: "Returned On",
      value: record.returnedDate
        ? formatDate(record.returnedDate)
        : record.issuanceType === "Returnable"
        ? "Pending return"
        : "Consumed",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col sm:max-w-lg gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        <DialogHeader className="shrink-0 gap-1 border-b border-border/60 bg-gradient-to-r from-slate-50/90 via-white to-white px-6 py-4.5">
          <div className="flex items-center gap-3.5 pr-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#091d3e] to-[#1e3a66] text-white shadow-xs ring-1 ring-[#091d3e]/20">
              <ClipboardList className="size-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold leading-tight text-foreground">
                Issue Slip — {record.issueNo}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Store issuance record for {record.issuedTo}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          {/* Item Summary Card */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-slate-50/70 px-4 py-3.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">
                {record.itemName}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="rounded-md border border-brand/20 bg-brand-50/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#091d3e]">
                  {record.itemSku}
                </span>
                <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                  {record.itemCategory}
                </span>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <span className="block font-mono text-2xl font-extrabold tabular-nums text-[#091d3e]">
                {formatNumber(record.quantity)}
              </span>
              <span className="text-[10.5px] font-semibold text-muted-foreground">
                {record.unit} issued
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-3">
            {rows.map((r) => (
              <div key={r.label}>
                <span className="block text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                  {r.label}
                </span>
                <span className="mt-0.5 block text-xs font-semibold text-foreground">
                  {r.value}
                </span>
              </div>
            ))}
          </div>

          <div>
            <span className="block text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              Purpose / Remarks
            </span>
            <p className="mt-0.5 text-xs font-medium text-foreground">{record.purpose}</p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/80 px-4 py-2.5 text-xs">
            <span className="font-semibold text-muted-foreground">Status</span>
            <IssuanceStatusPill status={record.status} overdue={overdue} />
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-border/70 bg-slate-50/60 px-6 py-4">
          <ActionButton
            type="button"
            tone="outline"
            size="sm"
            onClick={() => printIssueSlip(record)}
          >
            <Printer className="size-3.5" />
            <span>Print Slip</span>
          </ActionButton>
          {record.status === "Issued" && onReturn && (
            <ActionButton
              type="button"
              tone="success"
              size="sm"
              onClick={() => onReturn(record)}
            >
              <RotateCcw className="size-3.5" />
              <span>Mark Returned</span>
            </ActionButton>
          )}
          <ActionButton
            type="button"
            tone="primary"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            <span>Close</span>
          </ActionButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function printIssueSlip(r: StockIssuanceRecord) {
  const html = `<!DOCTYPE html>
<html><head><title>Issue Slip ${r.issueNo}</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; padding: 32px; }
  .head { background: #091d3e; color: #fff; padding: 16px 20px; border-radius: 8px; }
  .head h1 { margin: 0; font-size: 16px; }
  .head p { margin: 4px 0 0; font-size: 11px; opacity: .8; }
  table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 12px; }
  td { border: 1px solid #cbd5e1; padding: 9px 12px; }
  td.l { background: #f1f5f9; font-weight: 700; color: #091d3e; width: 38%; }
  .sig { display: flex; justify-content: space-between; margin-top: 64px; font-size: 11px; }
  .sig div { border-top: 1px solid #0f172a; padding-top: 6px; width: 40%; text-align: center; }
</style></head>
<body>
  <div class="head"><h1>STORE ISSUE SLIP — ${r.issueNo}</h1><p>Opus School Management System · Store Inventory</p></div>
  <table>
    <tr><td class="l">Issue Date</td><td>${formatDate(r.issueDate)}</td></tr>
    <tr><td class="l">Item</td><td><strong>${r.itemName}</strong> (${r.itemSku})</td></tr>
    <tr><td class="l">Category</td><td>${r.itemCategory}</td></tr>
    <tr><td class="l">Quantity Issued</td><td><strong>${formatNumber(r.quantity)} ${r.unit}</strong></td></tr>
    <tr><td class="l">Issued To</td><td>${r.issuedTo} — ${r.issueeRole}</td></tr>
    <tr><td class="l">Department / Class</td><td>${r.department}</td></tr>
    <tr><td class="l">Issuance Type</td><td>${r.issuanceType}</td></tr>
    <tr><td class="l">Expected Return</td><td>${r.expectedReturnDate ? formatDate(r.expectedReturnDate) : "—"}</td></tr>
    <tr><td class="l">Purpose</td><td>${r.purpose}</td></tr>
    <tr><td class="l">Issued By</td><td>${r.issuedBy}</td></tr>
  </table>
  <div class="sig"><div>Store Keeper Signature</div><div>Receiver Signature</div></div>
</body></html>`;

  printHtml(html);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 3. Return Stock Modal (Returnable items → back to store)                   */
/* ────────────────────────────────────────────────────────────────────────── */

interface ReturnStockModalProps {
  record: StockIssuanceRecord | null;
  currentStock: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmReturn: (record: StockIssuanceRecord, returnDate: string) => void;
}

export function ReturnStockModal({
  record,
  currentStock,
  open,
  onOpenChange,
  onConfirmReturn,
}: ReturnStockModalProps) {
  const [returnDate, setReturnDate] = React.useState(ISSUANCE_TODAY);

  React.useEffect(() => {
    if (open) setReturnDate(ISSUANCE_TODAY);
  }, [open]);

  if (!record) return null;
  const newStock = currentStock + record.quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col sm:max-w-md gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        <DialogHeader className="shrink-0 gap-1 border-b border-border/60 bg-gradient-to-r from-emerald-50/70 via-white to-white px-6 py-4.5">
          <div className="flex items-center gap-3.5 pr-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <PackageCheck className="size-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold leading-tight text-foreground">
                Receive Returned Stock
              </DialogTitle>
              <DialogDescription className="sr-only">
                {record.issueNo} · {record.issuedTo}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-3 divide-x divide-border/70 overflow-hidden rounded-xl border border-border/80 bg-slate-50/60 text-center">
            <div className="px-3 py-3">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                In Store
              </span>
              <span className="mt-0.5 block font-mono text-lg font-extrabold text-[#091d3e]">
                {formatNumber(currentStock)}
              </span>
            </div>
            <div className="px-3 py-3">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Returning
              </span>
              <span className="mt-0.5 block font-mono text-lg font-extrabold text-emerald-700">
                +{formatNumber(record.quantity)}
              </span>
            </div>
            <div className="bg-emerald-50/70 px-3 py-3">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#091d3e]">
                New Balance
              </span>
              <span className="mt-0.5 block font-mono text-lg font-extrabold text-emerald-800">
                {formatNumber(newStock)}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">
              {formatNumber(record.quantity)} {record.unit}
            </strong>{" "}
            of <strong className="text-foreground">{record.itemName}</strong> will be
            added back to store stock automatically.
          </p>

          <div>
            <label className={labelClass}>
              <CalendarDays className="mr-1 inline size-3.5 -translate-y-px text-muted-foreground" />
              Return Date
            </label>
            <input
              type="date"
              min={record.issueDate}
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className={cn(fieldClass, "font-mono")}
            />
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-border/70 bg-slate-50/60 px-6 py-4">
          <ActionButton
            type="button"
            tone="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            <span>Cancel</span>
          </ActionButton>
          <ActionButton
            type="button"
            tone="success"
            size="sm"
            onClick={() => {
              onConfirmReturn(record, returnDate || ISSUANCE_TODAY);
              onOpenChange(false);
            }}
          >
            <Check className="size-3.5" />
            <span>Confirm Return</span>
          </ActionButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
