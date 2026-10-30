"use client";

import * as React from "react";
import { Check, ChevronDown, Edit, Edit3, List, PackagePlus } from "lucide-react";
import { toast } from "sonner";
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
import {
  computeStockStatus,
  INVENTORY_CATEGORIES,
  type InventoryItemRecord,
} from "@/lib/mock/inventory";

interface InventoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount: number;
  initialData?: InventoryItemRecord | null;
  onSave: (record: InventoryItemRecord) => void;
}

const COMMON_ITEM_SUGGESTIONS = [
  "A4 Paper Reams",
  "Ball Pens (Box)",
  "Whiteboard Markers (Box)",
  "Chalk Box (Dustless)",
  "Whiteboard Duster",
  "Exam Answer Booklets (32-Page)",
  "Cricket Bat & Kit",
  "Footballs (Match Grade)",
  "Science Lab Glass Beakers",
  "Compound Microscopes",
  "Floor Disinfectant & Cleaners",
  "Liquid Handwash Refills",
  "First Aid Medical Kits",
  "HDMI & Projector Display Cables",
  "Student Classroom Desk & Chair Sets",
];

const fieldClass =
  "h-10 w-full rounded-lg border border-border/90 bg-white px-3.5 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15";

export function InventoryFormModal({
  open,
  onOpenChange,
  totalCount,
  initialData,
  onSave,
}: InventoryFormModalProps) {
  const isEditing = Boolean(initialData);

  const [name, setName] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState(
    INVENTORY_CATEGORIES[0] ?? "Stationery"
  );
  const [isManualCategory, setIsManualCategory] = React.useState(false);
  const [manualCategoryInput, setManualCategoryInput] = React.useState("");
  const [quantity, setQuantity] = React.useState("0");
  const [reorderLevel, setReorderLevel] = React.useState("10");

  const manualInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name);
        setQuantity(String(initialData.quantity));
        setReorderLevel(String(initialData.reorderLevel));
        if (INVENTORY_CATEGORIES.includes(initialData.category)) {
          setSelectedCategory(initialData.category);
          setIsManualCategory(false);
          setManualCategoryInput("");
        } else {
          setIsManualCategory(true);
          setManualCategoryInput(initialData.category);
          setSelectedCategory("__custom__");
        }
      } else {
        setName("");
        setSelectedCategory(INVENTORY_CATEGORIES[0] ?? "Stationery");
        setIsManualCategory(false);
        setManualCategoryInput("");
        setQuantity("0");
        setReorderLevel("10");
      }
    }
  }, [open, initialData]);

  // When switching to manual input, focus the input field
  React.useEffect(() => {
    if (isManualCategory) {
      setTimeout(() => manualInputRef.current?.focus(), 60);
    }
  }, [isManualCategory]);

  const resolvedCategory = isManualCategory
    ? manualCategoryInput.trim() || "General"
    : selectedCategory;

  const numericQty = Math.max(0, Math.trunc(Number(quantity) || 0));
  const numericReorder = Math.max(0, Math.trunc(Number(reorderLevel) || 0));
  const computedStatus = computeStockStatus(numericQty, numericReorder);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter the item name.");
      return;
    }

    if (isManualCategory && !manualCategoryInput.trim()) {
      toast.error("Please enter a category name or select one from the dropdown.");
      manualInputRef.current?.focus();
      return;
    }

    const today = "2026-10-28";
    const record: InventoryItemRecord = initialData
      ? {
          ...initialData,
          name: name.trim(),
          category: resolvedCategory,
          quantity: numericQty,
          reorderLevel: numericReorder,
          lastUpdated: today,
          status: computedStatus,
        }
      : {
          id: `inv-${Date.now()}`,
          sku: `STK-${101 + totalCount}`,
          name: name.trim(),
          category: resolvedCategory,
          quantity: numericQty,
          reorderLevel: numericReorder,
          unit: "Units",
          lastUpdated: today,
          status: computedStatus,
        };

    onSave(record);
    onOpenChange(false);
    toast.success(
      isEditing
        ? `"${record.name}" updated successfully.`
        : `"${record.name}" added to store inventory under "${resolvedCategory}".`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col sm:max-w-lg gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        {/* Executive Header */}
        <DialogHeader className="shrink-0 gap-1 border-b border-border/60 bg-gradient-to-r from-slate-50/90 via-white to-white px-6 py-4.5">
          <div className="flex items-center gap-3.5 pr-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#091d3e] to-[#1e3a66] text-white shadow-xs ring-1 ring-[#091d3e]/20">
              {isEditing ? (
                <Edit className="size-5" />
              ) : (
                <PackagePlus className="size-5" />
              )}
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold leading-tight text-foreground">
                {isEditing ? `Edit Stock Item — ${initialData?.sku}` : "Add Stock Item"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {isEditing
                  ? "Update item name, category, quantity, or reorder alert threshold."
                  : "Register a new store item with category, initial quantity, and reorder alert threshold."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="space-y-4 px-6 py-5">
            {/* Item Name (with native autocomplete suggestions) */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-foreground">
                Item Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                list="item-suggestions"
                placeholder="e.g. A4 Paper Reams, Ball Pens (Box)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
              />
              <datalist id="item-suggestions">
                {COMMON_ITEM_SUGGESTIONS.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>

            {/* Category Section (Dropdown + Manual Input Toggle) */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-bold text-foreground">
                  Category <span className="text-danger">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsManualCategory(!isManualCategory);
                    if (!isManualCategory && !manualCategoryInput) {
                      setManualCategoryInput(selectedCategory);
                    }
                  }}
                  className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-brand transition-colors hover:text-[#091d3e] hover:underline"
                >
                  {isManualCategory ? (
                    <>
                      <List className="size-3.5" />
                      <span>Choose from list</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="size-3.5" />
                      <span>Manual input</span>
                    </>
                  )}
                </button>
              </div>

              {isManualCategory ? (
                /* Manual Custom Category Input */
                <div className="space-y-1.5">
                  <div className="relative">
                    <input
                      ref={manualInputRef}
                      type="text"
                      required
                      placeholder="Type custom category name (e.g. Art & Craft, Library Books)"
                      value={manualCategoryInput}
                      onChange={(e) => setManualCategoryInput(e.target.value)}
                      className={cn(fieldClass, "pr-8")}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Edit3 className="size-3.5" />
                    </span>
                  </div>
                  <p className="text-[10.5px] text-muted-foreground">
                    Custom category will be saved with this item. Click{" "}
                    <button
                      type="button"
                      onClick={() => setIsManualCategory(false)}
                      className="font-semibold text-brand underline cursor-pointer"
                    >
                      Choose from list
                    </button>{" "}
                    to select a standard preset instead.
                  </p>
                </div>
              ) : (
                /* Professional Category Dropdown Menu */
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "__custom__") {
                        setIsManualCategory(true);
                        setManualCategoryInput("");
                      } else {
                        setSelectedCategory(val);
                      }
                    }}
                    className={cn(
                      fieldClass,
                      "cursor-pointer appearance-none pr-9 font-semibold text-[#091d3e]"
                    )}
                  >
                    {INVENTORY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__custom__">
                      ✏️ Other / Custom Category (Manual Input)...
                    </option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <ChevronDown className="size-4" />
                  </span>
                </div>
              )}
            </div>

            {/* Qty & Reorder At in 2 Symmetrical Columns */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Initial Quantity (Qty)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={cn(fieldClass, "font-mono text-sm font-bold")}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Reorder At (Alert Threshold)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={reorderLevel}
                  onChange={(e) => setReorderLevel(e.target.value)}
                  className={cn(fieldClass, "font-mono text-sm font-bold")}
                />
              </div>
            </div>

            {/* Live Calculation & Status Preview Bar */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/70 px-4 py-3 text-xs">
              <div>
                <span className="font-medium text-muted-foreground">
                  Initial Stock:{" "}
                </span>
                <strong className="font-mono font-bold text-[#091d3e]">
                  {numericQty}
                </strong>
                <span className="mx-2 text-slate-300">|</span>
                <span className="font-medium text-muted-foreground">
                  Alert Below:{" "}
                </span>
                <strong className="font-mono font-bold text-[#091d3e]">
                  {numericReorder}
                </strong>
                <span className="mx-2 text-slate-300">|</span>
                <span className="font-semibold text-slate-700">
                  {resolvedCategory}
                </span>
              </div>
              <StatusBadge status={computedStatus} />
            </div>
          </div>

          {/* Footer with Symmetrical Spacing & Equal Margins */}
          <div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-border/70 bg-slate-50/60 px-6 py-4">
            <ActionButton
              type="button"
              tone="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <span>Cancel</span>
            </ActionButton>
            <ActionButton type="submit" tone="primary" size="sm">
              <Check className="size-3.5" />
              <span>{isEditing ? "Save Changes" : "Add Item"}</span>
            </ActionButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
