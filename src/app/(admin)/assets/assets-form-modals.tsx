"use client";

import * as React from "react";
import { AlertTriangle, ChevronDown, PackagePlus, Edit } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionButton } from "@/components/shared/action-button";
import { cn } from "@/lib/utils";
import {
  ASSET_CATEGORIES,
  ASSET_CONDITIONS,
  CONDITION_COLORS,
  type AssetCategory,
  type AssetCondition,
  type AssetRecord,
} from "@/lib/mock/assets";

/* ═══════════════════════════════════════════════════════════════════════════
 *  Shared Field Styles
 * ═══════════════════════════════════════════════════════════════════════════ */

const fieldClass =
  "h-10 w-full rounded-lg border border-border/90 bg-white px-3.5 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15";

const labelClass = "block text-[11px] font-semibold text-foreground/80 mb-1.5";

/* ═══════════════════════════════════════════════════════════════════════════
 *  Add / Edit Asset Modal
 * ═══════════════════════════════════════════════════════════════════════════ */

interface AssetFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount: number;
  initialData?: AssetRecord | null;
  onSave: (record: AssetRecord) => void;
}

export function AssetFormModal({
  open,
  onOpenChange,
  totalCount,
  initialData,
  onSave,
}: AssetFormModalProps) {
  const isEditing = Boolean(initialData);

  const [name, setName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [condition, setCondition] = React.useState<AssetCondition>("Good");
  const [purchaseDate, setPurchaseDate] = React.useState("");
  const [category, setCategory] = React.useState<AssetCategory>(
    "IT & Computing"
  );
  const [purchaseCost, setPurchaseCost] = React.useState("0");
  const [quantity, setQuantity] = React.useState("1");
  const [remarks, setRemarks] = React.useState("");

  // Dropdown open states
  const [conditionOpen, setConditionOpen] = React.useState(false);
  const [categoryOpen, setCategoryOpen] = React.useState(false);

  // Close dropdowns on outside click
  const conditionRef = React.useRef<HTMLDivElement>(null);
  const categoryRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        conditionRef.current &&
        !conditionRef.current.contains(e.target as Node)
      )
        setConditionOpen(false);
      if (
        categoryRef.current &&
        !categoryRef.current.contains(e.target as Node)
      )
        setCategoryOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name);
        setLocation(initialData.location);
        setCondition(initialData.condition);
        setPurchaseDate(initialData.purchaseDate);
        setCategory(initialData.category);
        setPurchaseCost(String(initialData.purchaseCost));
        setQuantity(String(initialData.quantity));
        setRemarks(initialData.remarks);
      } else {
        setName("");
        setLocation("");
        setCondition("Good");
        setPurchaseDate("");
        setCategory("IT & Computing");
        setPurchaseCost("0");
        setQuantity("1");
        setRemarks("");
      }
      setConditionOpen(false);
      setCategoryOpen(false);
    }
  }, [open, initialData]);

  const canSave = name.trim() && location.trim() && purchaseDate;

  const handleSave = () => {
    if (!canSave) return;

    const record: AssetRecord = {
      id: initialData?.id ?? `ast-${Date.now()}`,
      assetCode:
        initialData?.assetCode ??
        `AST-${String(totalCount + 1).padStart(3, "0")}`,
      name: name.trim(),
      location: location.trim(),
      condition,
      purchaseDate,
      category,
      purchaseCost: Math.max(0, Number(purchaseCost) || 0),
      quantity: Math.max(1, Math.round(Number(quantity) || 1)),
      remarks: remarks.trim(),
    };

    onSave(record);
    onOpenChange(false);
    toast.success(
      isEditing
        ? `Asset "${record.name}" updated successfully`
        : `Asset "${record.name}" added successfully`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        {/* ─── Header ─── */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/60 bg-gradient-to-b from-slate-50/80 to-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10">
              {isEditing ? (
                <Edit className="h-4 w-4 text-brand" />
              ) : (
                <PackagePlus className="h-4 w-4 text-brand" />
              )}
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                {isEditing ? "Edit Asset" : "Add Asset"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {isEditing
                  ? "Update the asset details below"
                  : "Fill in the details to register a new asset"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ─── Form Body ─── */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Row 1: Name + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name</label>
              <input
                type="text"
                className={fieldClass}
                placeholder="e.g. Projector — Room 5"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input
                type="text"
                className={fieldClass}
                placeholder="e.g. Room 5 / Science Lab"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Row 2: Condition + Purchase Date */}
          <div className="grid grid-cols-2 gap-4">
            {/* Condition Custom Dropdown */}
            <div>
              <label className={labelClass}>Condition</label>
              <div ref={conditionRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setConditionOpen(!conditionOpen);
                    setCategoryOpen(false);
                  }}
                  className={cn(
                    fieldClass,
                    "flex items-center justify-between cursor-pointer select-none"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        CONDITION_COLORS[condition].dot
                      )}
                    />
                    <span>{condition}</span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground transition-transform",
                      conditionOpen && "rotate-180"
                    )}
                  />
                </button>

                {conditionOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border border-border/80 bg-white shadow-lg py-1 animate-in fade-in-0 zoom-in-95 duration-150">
                    {ASSET_CONDITIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCondition(c);
                          setConditionOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-medium hover:bg-slate-50 transition-colors",
                          condition === c &&
                            "bg-brand/5 text-brand font-semibold"
                        )}
                      >
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            CONDITION_COLORS[c].dot
                          )}
                        />
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Purchase Date */}
            <div>
              <label className={labelClass}>Purchase Date</label>
              <input
                type="date"
                className={cn(fieldClass, "appearance-none")}
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
          </div>

          {/* Row 3: Category + Cost */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category Custom Dropdown */}
            <div>
              <label className={labelClass}>Category</label>
              <div ref={categoryRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setCategoryOpen(!categoryOpen);
                    setConditionOpen(false);
                  }}
                  className={cn(
                    fieldClass,
                    "flex items-center justify-between cursor-pointer select-none"
                  )}
                >
                  <span className="truncate">{category}</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0",
                      categoryOpen && "rotate-180"
                    )}
                  />
                </button>

                {categoryOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border border-border/80 bg-white shadow-lg py-1 max-h-48 overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-150">
                    {ASSET_CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCategory(c);
                          setCategoryOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center px-3.5 py-2 text-xs font-medium hover:bg-slate-50 transition-colors text-left",
                          category === c &&
                            "bg-brand/5 text-brand font-semibold"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Purchase Cost */}
            <div>
              <label className={labelClass}>Purchase Cost (PKR)</label>
              <input
                type="number"
                min="0"
                className={fieldClass}
                placeholder="e.g. 250000"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(e.target.value)}
              />
            </div>
          </div>

          {/* Row 4: Quantity + Remarks */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Quantity</label>
              <input
                type="number"
                min="1"
                className={fieldClass}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Remarks</label>
              <input
                type="text"
                className={fieldClass}
                placeholder="Optional notes..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-border/70 bg-slate-50/60 px-6 py-4">
          <ActionButton
            tone="outline"
            size="md"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </ActionButton>
          <ActionButton
            tone="primary"
            size="md"
            onClick={handleSave}
            disabled={!canSave}
          >
            {isEditing ? "Update" : "Save"}
          </ActionButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Delete Confirmation Modal
 * ═══════════════════════════════════════════════════════════════════════════ */

interface DeleteAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetName: string;
  onConfirm: () => void;
}

export function DeleteAssetModal({
  open,
  onOpenChange,
  assetName,
  onConfirm,
}: DeleteAssetModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden">
        <div className="px-6 pt-6 pb-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <DialogHeader className="items-center">
            <DialogTitle className="text-sm font-bold text-foreground">
              Delete Asset
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Are you sure you want to permanently remove{" "}
              <span className="font-semibold text-foreground">
                &quot;{assetName}&quot;
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="shrink-0 flex items-center justify-center gap-2.5 border-t border-border/70 bg-slate-50/60 px-6 py-4">
          <ActionButton
            tone="outline"
            size="md"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </ActionButton>
          <ActionButton
            tone="danger"
            size="md"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
              toast.success(`Asset "${assetName}" deleted`);
            }}
          >
            Delete
          </ActionButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
