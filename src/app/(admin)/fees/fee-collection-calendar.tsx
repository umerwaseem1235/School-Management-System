"use client";

import * as React from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import type { FeeChallan } from "@/types";
import { ALL } from "@/components/shared/data-table";
import {
  AVAILABLE_YEARS,
  MONTH_NAMES,
  MONTH_SHORT_NAMES,
  getAllCollectionRecords,
} from "@/lib/mock/historical-collections";

interface FeeCollectionCalendarProps {
  value: string;
  onChange: (value: string) => void;
  challans?: FeeChallan[];
  className?: string;
  onOpenFullModal?: () => void;
}

export function isAllDateFilter(val?: string | null): boolean {
  if (!val) return true;
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();
  return (
    val === ALL ||
    lower === "all" ||
    lower === "__all__" ||
    lower === "all dates" ||
    lower === "all collection dates"
  );
}

/**
 * Professional Date / Month / Year Picker for Fee Collection.
 * Purely handles date, month, and year selection and triggers immediate page updates.
 * Provides a dedicated cross button to instantly reset back to all challans.
 */
export function FeeCollectionCalendarDropdown({
  value,
  onChange,
  challans = [],
  className,
}: FeeCollectionCalendarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"date" | "month" | "year">("date");
  const [viewYear, setViewYear] = React.useState<number>(2026);
  const [viewMonth, setViewMonth] = React.useState<number>(10); // 1-12 (October)
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Sync state from incoming prop value
  React.useEffect(() => {
    if (value && value.startsWith("date:")) {
      const iso = value.slice(5);
      const parsed = new Date(iso);
      if (!Number.isNaN(parsed.getTime())) {
        setViewYear(parsed.getFullYear());
        setViewMonth(parsed.getMonth() + 1);
      }
    } else if (value && value.startsWith("month:")) {
      const parts = value.slice(6).split("-");
      if (parts.length === 2) {
        setViewYear(Number(parts[0]));
        setViewMonth(Number(parts[1]));
      }
    } else if (value && value.startsWith("year:")) {
      const y = Number(value.slice(5));
      if (!Number.isNaN(y)) {
        setViewYear(y);
      }
    }
  }, [value]);

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Set of dates that have fee collections recorded
  const activeDatesSet = React.useMemo(() => {
    const dates = new Set<string>();
    const allRecords = getAllCollectionRecords(challans);
    allRecords.forEach((r) => dates.add(r.date));
    challans.forEach((c) => {
      if (c.collectDate) dates.add(c.collectDate);
      if (c.lastPaymentDate) dates.add(c.lastPaymentDate);
      if (c.payments) {
        c.payments.forEach((p) => {
          if (p.paymentDate) dates.add(p.paymentDate);
        });
      }
    });
    return dates;
  }, [challans]);

  const isFiltered = !isAllDateFilter(value);

  // Formatted trigger label
  const displayLabel = React.useMemo(() => {
    if (!isFiltered) {
      return "Collection Date";
    }
    if (value.startsWith("date:")) {
      return formatDate(value.slice(5));
    }
    if (value.startsWith("month:")) {
      const parts = value.slice(6).split("-");
      if (parts.length === 2) {
        const mIdx = Number(parts[1]) - 1;
        const name = MONTH_SHORT_NAMES[mIdx] || parts[1];
        return `${name} ${parts[0]}`;
      }
    }
    if (value.startsWith("year:")) {
      return `AY ${value.slice(5)}`;
    }
    return value;
  }, [value, isFiltered]);

  // Days in current view month
  const daysInMonth = React.useMemo(() => {
    return new Date(viewYear, viewMonth, 0).getDate();
  }, [viewYear, viewMonth]);

  // First day offset (0 = Sunday)
  const firstDayOffset = React.useMemo(() => {
    return new Date(viewYear, viewMonth - 1, 1).getDay();
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMode === "year") {
      setViewYear((y) => y - 5);
      return;
    }
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMode === "year") {
      setViewYear((y) => y + 5);
      return;
    }
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const iso = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(`date:${iso}`);
    setIsOpen(false);
  };

  const handleSelectMonth = (monthIdx: number) => {
    const ym = `${viewYear}-${String(monthIdx + 1).padStart(2, "0")}`;
    onChange(`month:${ym}`);
    setIsOpen(false);
  };

  const handleSelectYear = (year: number) => {
    onChange(`year:${year}`);
    setIsOpen(false);
  };

  // Dedicated handler to reset back to all challans
  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(ALL);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative inline-flex items-center h-9 rounded-[4px] border text-xs font-medium transition-all select-none",
        isFiltered
          ? "border-brand/40 bg-brand-50/50 text-brand font-semibold shadow-xs"
          : "border-brand/18 bg-white text-foreground hover:border-brand/30 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.05)]",
        className
      )}
    >
      {/* ── Left label & calendar icon (opens picker) ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 pl-3 pr-1.5 h-full outline-none rounded-l-[4px] cursor-pointer"
        title={isFiltered ? `Active date filter: ${displayLabel}. Click to change.` : "Filter fee records by Date, Month, or Year"}
      >
        <CalendarDays className={cn("size-3.5 shrink-0", isFiltered ? "text-brand" : "text-brand/80")} />
        <span className="truncate max-w-[120px] sm:max-w-[155px]">{displayLabel}</span>
      </button>

      {/* ── Cross button (✕): resets filter and shows ALL challans just like before ── */}
      {isFiltered && (
        <button
          type="button"
          onClick={handleClear}
          className="p-1 mr-0.5 rounded-full hover:bg-brand-200/60 text-brand/80 hover:text-brand transition-colors cursor-pointer"
          title="Clear date filter and show all challans"
          aria-label="Clear date filter and show all challans"
        >
          <X className="size-3.5" />
        </button>
      )}

      {/* ── Down chevron icon (opens picker) ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="pr-2.5 pl-1 h-full flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
        aria-label="Toggle calendar menu"
      >
        <ChevronDown
          className={cn("size-3 shrink-0 transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>

      {/* ─── Clean Date/Month/Year Picker Popover ─── */}
      {isOpen && (
        <div className="absolute right-0 sm:right-auto sm:left-0 top-full mt-1.5 z-50 w-[315px] sm:w-[325px] rounded-xl border border-border/80 bg-white p-3 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 dark:bg-card">
          {/* ── Top View Mode Segmented Bar & Close Button ── */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="flex-1 flex items-center p-0.5 bg-muted/60 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode("date")}
                className={cn(
                  "flex-1 py-1 text-xs font-semibold rounded-md transition-all text-center",
                  viewMode === "date"
                    ? "bg-white text-brand shadow-xs dark:bg-card"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Date View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("month")}
                className={cn(
                  "flex-1 py-1 text-xs font-semibold rounded-md transition-all text-center",
                  viewMode === "month"
                    ? "bg-white text-brand shadow-xs dark:bg-card"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Month View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("year")}
                className={cn(
                  "flex-1 py-1 text-xs font-semibold rounded-md transition-all text-center",
                  viewMode === "year"
                    ? "bg-white text-brand shadow-xs dark:bg-card"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Year View
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Close calendar"
              aria-label="Close calendar"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {/* ── Month & Year Navigation Header ── */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
              title="Previous"
            >
              <ChevronLeft className="size-4" />
            </button>

            <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
              {viewMode === "date" && (
                <span>
                  {MONTH_NAMES[viewMonth - 1]} {viewYear}
                </span>
              )}
              {viewMode === "month" && (
                <span>Academic Session {viewYear}</span>
              )}
              {viewMode === "year" && (
                <span>Historical Academic Years</span>
              )}
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
              title="Next"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* ── Mode 1: Daily Calendar Grid (1 to 31) ── */}
          {viewMode === "date" && (
            <div>
              {/* Weekday Labels */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <span key={day} className="text-[10px] font-semibold text-muted-foreground/80">
                    {day}
                  </span>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Empty padding cells */}
                {Array.from({ length: firstDayOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-7 w-7" />
                ))}

                {/* Days of current month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const d = i + 1;
                  const iso = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                  const isSelected = value === `date:${iso}`;
                  const hasCollections = activeDatesSet.has(iso);
                  const isToday = iso === "2026-10-08";

                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => handleSelectDay(d)}
                      className={cn(
                        "h-7 w-7 mx-auto rounded-md text-xs font-medium flex flex-col items-center justify-center relative transition-all",
                        isSelected
                          ? "bg-brand text-white font-bold shadow-xs scale-105"
                          : isToday
                            ? "border border-brand/40 text-brand font-semibold hover:bg-brand-50"
                            : "text-foreground hover:bg-muted/80"
                      )}
                      title={`Select ${formatDate(iso)}${hasCollections ? " (Collections recorded)" : ""}`}
                    >
                      <span className="leading-none">{d}</span>
                      {hasCollections && !isSelected && (
                        <span className="absolute bottom-0.5 size-1 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Select Current Month */}
              <button
                type="button"
                onClick={() => handleSelectMonth(viewMonth - 1)}
                className="w-full mt-2.5 py-1 text-[11px] font-medium text-brand hover:text-brand-700 bg-brand-50/60 hover:bg-brand-50 rounded-md transition-colors text-center cursor-pointer"
              >
                Select Full Month ({MONTH_NAMES[viewMonth - 1]} {viewYear})
              </button>
            </div>
          )}

          {/* ── Mode 2: Month Grid (Jan–Dec) ── */}
          {viewMode === "month" && (
            <div className="grid grid-cols-3 gap-2 py-1">
              {MONTH_SHORT_NAMES.map((mName, idx) => {
                const ym = `${viewYear}-${String(idx + 1).padStart(2, "0")}`;
                const isSelected = value === `month:${ym}`;

                return (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => handleSelectMonth(idx)}
                    className={cn(
                      "py-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer",
                      isSelected
                        ? "bg-brand text-white shadow-xs"
                        : "bg-muted/40 text-foreground hover:bg-brand-50 hover:text-brand"
                    )}
                  >
                    <div>{mName}</div>
                    <div className="text-[10px] opacity-75 font-normal">{viewYear}</div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Mode 3: Year Selector ── */}
          {viewMode === "year" && (
            <div className="flex flex-col gap-1.5 py-1">
              {AVAILABLE_YEARS.map((yr) => {
                const isSelected = value === `year:${yr}`;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => handleSelectYear(yr)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-all cursor-pointer",
                      isSelected
                        ? "bg-brand text-white font-semibold shadow-xs"
                        : "bg-muted/40 text-foreground hover:bg-brand-50 hover:text-brand"
                    )}
                  >
                    <span>Academic Year {yr}–{String(yr + 1).slice(2)}</span>
                    {isSelected ? (
                      <Check className="size-3.5" />
                    ) : (
                      <span className="text-[11px] text-muted-foreground font-mono">Archive</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Bottom Controls ── */}
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/60 text-[11px]">
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium cursor-pointer"
              title="Show all challans without date filter"
            >
              <RotateCcw className="size-3" />
              <span>All Dates (Show All Challans)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onChange("date:2026-10-08");
                setIsOpen(false);
              }}
              className="text-brand hover:text-brand-700 font-semibold cursor-pointer"
            >
              Today (08 Oct 2026)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Keep export for backwards compatibility if referenced anywhere
export function FeeCollectionCalendarModal() {
  return null;
}
