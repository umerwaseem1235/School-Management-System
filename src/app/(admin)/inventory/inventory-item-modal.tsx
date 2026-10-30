"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpDown,
  ArrowUpRight,
  Check,
  Package,
} from "lucide-react";
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
import { formatNumber } from "@/lib/format";
import {
  computeStockStatus,
  type InventoryItemRecord,
} from "@/lib/mock/inventory";

interface AdjustStockModalProps {
  item: InventoryItemRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdjustStock: (itemId: string, delta: number) => void;
}

const QUICK_DELTAS = [-20, -10, -5, -1, +1, +5, +10, +20, +50];

export function InventoryItemModal({
  item,
  open,
  onOpenChange,
  onAdjustStock,
}: AdjustStockModalProps) {
  const [adjustmentInput, setAdjustmentInput] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setAdjustmentInput("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
    }
  }, [open, item?.id]);

  if (!item) return null;

  // Parse signed integer from input (supports "-5", "+5", "5", etc.)
  const parsedDelta = (() => {
    const cleaned = adjustmentInput.trim();
    if (!cleaned || cleaned === "+" || cleaned === "-") return 0;
    const n = Number(cleaned);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
  })();

  const newQuantity = Math.max(0, item.quantity + parsedDelta);
  const newStatus = computeStockStatus(newQuantity, item.reorderLevel);
  const isAdding = parsedDelta > 0;
  const isRemoving = parsedDelta < 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedDelta === 0) {
      toast.error(
        "Please enter a non-zero adjustment (e.g. +5 to add or -5 to remove)."
      );
      return;
    }

    onAdjustStock(item.id, parsedDelta);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col sm:max-w-lg gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        {/* Executive Header */}
        <DialogHeader className="shrink-0 gap-1 border-b border-border/60 bg-gradient-to-r from-slate-50/90 via-white to-white px-6 py-4.5">
          <div className="flex items-start justify-between gap-4 pr-6">
            <div className="flex min-w-0 items-center gap-3.5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#091d3e] to-[#1e3a66] text-white shadow-xs ring-1 ring-[#091d3e]/20">
                <ArrowUpDown className="size-5" />
              </span>
              <div className="min-w-0">
                <DialogTitle className="truncate text-base font-bold leading-tight text-foreground">
                  Adjust Stock — {item.name}
                </DialogTitle>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-md border border-brand/20 bg-brand-50/80 px-2 py-0.5 font-mono text-[11px] font-bold text-[#091d3e]">
                    {item.sku}
                  </span>
                  <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-slate-700">
                    {item.category}
                  </span>
                  <DialogDescription className="sr-only">
                    Update on-hand store quantity by entering a positive or
                    negative adjustment.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="space-y-4 px-6 py-5">
            {/* 3-Box Live Math Card with Symmetrical Spacing & Equal Margins */}
            <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50/70 shadow-2xs">
              <div className="grid grid-cols-3 divide-x divide-border/70">
                <div className="px-5 py-3.5">
                  <span className="block text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    Current Stock
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-mono text-xl font-extrabold tabular-nums text-[#091d3e]">
                      {formatNumber(item.quantity)}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {item.unit}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-3.5">
                  <span className="block text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    Adjustment
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    {isAdding && (
                      <ArrowUpRight className="size-4 shrink-0 text-emerald-600 self-center" />
                    )}
                    {isRemoving && (
                      <ArrowDownRight className="size-4 shrink-0 text-rose-600 self-center" />
                    )}
                    <span
                      className={cn(
                        "font-mono text-xl font-extrabold tabular-nums",
                        isAdding
                          ? "text-emerald-700"
                          : isRemoving
                          ? "text-rose-600"
                          : "text-muted-foreground"
                      )}
                    >
                      {parsedDelta > 0
                        ? `+${formatNumber(parsedDelta)}`
                        : parsedDelta < 0
                        ? formatNumber(parsedDelta)
                        : "0"}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {item.unit}
                    </span>
                  </div>
                </div>

                <div
                  className={cn(
                    "px-5 py-3.5 transition-colors",
                    isAdding
                      ? "bg-emerald-50/70"
                      : isRemoving
                      ? "bg-amber-50/60"
                      : "bg-slate-50/60"
                  )}
                >
                  <span className="block text-[10.5px] font-bold uppercase tracking-wider text-[#091d3e]">
                    New Balance
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span
                      className={cn(
                        "font-mono text-xl font-extrabold tabular-nums",
                        newStatus === "Out of Stock"
                          ? "text-rose-600"
                          : newStatus === "Low Stock"
                          ? "text-amber-700"
                          : "text-emerald-800"
                      )}
                    >
                      {formatNumber(newQuantity)}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {item.unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold text-foreground">
                Adjustment{" "}
                <span className="font-normal text-muted-foreground">
                  (positive = add stock, negative = remove stock)
                </span>
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. +10 to add, -5 to remove"
                  value={adjustmentInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^[+-]?\d*$/.test(val)) {
                      setAdjustmentInput(val);
                    }
                  }}
                  className="h-11 w-full rounded-lg border border-border/90 bg-white px-3.5 font-mono text-sm font-bold text-foreground placeholder:font-sans placeholder:font-normal placeholder:text-muted-foreground/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
                />
                {parsedDelta !== 0 && (
                  <span
                    className={cn(
                      "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-0.5 font-mono text-[11px] font-bold",
                      isAdding
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    )}
                  >
                    {item.quantity} {isAdding ? "+" : "−"}{" "}
                    {Math.abs(parsedDelta)} = {newQuantity}
                  </span>
                )}
              </div>

              {/* Quick Preset Chips */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[10.5px] font-semibold text-muted-foreground">
                  Quick Select:
                </span>
                {QUICK_DELTAS.map((d) => {
                  const label = d > 0 ? `+${d}` : `${d}`;
                  const isSelected = parsedDelta === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setAdjustmentInput(label)}
                      className={cn(
                        "cursor-pointer rounded-md border px-2 py-1 font-mono text-[11px] font-bold transition-all",
                        isSelected
                          ? d > 0
                            ? "border-emerald-600 bg-emerald-600 text-white shadow-2xs"
                            : "border-rose-600 bg-rose-600 text-white shadow-2xs"
                          : d > 0
                          ? "border-emerald-200 bg-emerald-50/60 text-emerald-800 hover:bg-emerald-100/80"
                          : "border-rose-200 bg-rose-50/60 text-rose-800 hover:bg-rose-100/80"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resulting Status & Reorder Threshold Bar */}
            <div
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs",
                newStatus === "Out of Stock"
                  ? "border-rose-200 bg-rose-50/70 text-rose-900"
                  : newStatus === "Low Stock"
                  ? "border-amber-200 bg-amber-50/70 text-amber-900"
                  : "border-slate-200/90 bg-slate-50/70 text-slate-700"
              )}
            >
              <div className="flex items-center gap-2">
                {newStatus !== "In Stock" ? (
                  <AlertTriangle
                    className={cn(
                      "size-4 shrink-0",
                      newStatus === "Out of Stock"
                        ? "text-rose-600"
                        : "text-amber-600"
                    )}
                  />
                ) : (
                  <Package className="size-4 shrink-0 text-brand" />
                )}
                <span>
                  Reorder Alert Threshold:{" "}
                  <strong className="font-mono font-bold">
                    {formatNumber(item.reorderLevel)} {item.unit}
                  </strong>
                  {newStatus === "Low Stock" &&
                    " · Stock will trigger Low Stock alert"}
                  {newStatus === "Out of Stock" &&
                    " · Item will be marked Out of Stock"}
                </span>
              </div>
              <StatusBadge status={newStatus} />
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
              <span>Adjust Stock</span>
            </ActionButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
