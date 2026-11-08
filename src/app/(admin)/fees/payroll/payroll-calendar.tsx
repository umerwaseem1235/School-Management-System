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
  Sparkles,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StaffSalaryRecord } from "@/lib/mock/payroll";

export const MONTHS = [
  { short: "Jan", full: "January", num: 1 },
  { short: "Feb", full: "February", num: 2 },
  { short: "Mar", full: "March", num: 3 },
  { short: "Apr", full: "April", num: 4 },
  { short: "May", full: "May", num: 5 },
  { short: "Jun", full: "June", num: 6 },
  { short: "Jul", full: "July", num: 7 },
  { short: "Aug", full: "August", num: 8 },
  { short: "Sep", full: "September", num: 9 },
  { short: "Oct", full: "October", num: 10 },
  { short: "Nov", full: "November", num: 11 },
  { short: "Dec", full: "December", num: 12 },
];

export const BASE_YEARS = [2027, 2026, 2025, 2024, 2023, 2022];

interface PayrollCalendarDropdownProps {
  value: string;
  onChange: (value: string) => void;
  salaries?: StaffSalaryRecord[];
  className?: string;
}

/**
 * Professional Year-first Payroll Calendar Selector.
 * Workflow:
 *  1. Shows the Years view first ("show the years").
 *  2. Clicking a year transitions smoothly to the Months view ("click the year the months are shown").
 *  3. Clicking a month selects that payroll cycle (e.g. "November 2026").
 *  4. Provides quick back navigation, full-year selection, and "All Cycles" reset.
 */
export function PayrollCalendarDropdown({
  value,
  onChange,
  salaries = [],
  className,
}: PayrollCalendarDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"years" | "months">("years");
  const [selectedYear, setSelectedYear] = React.useState<number>(2026);
  const [yearPageOffset, setYearPageOffset] = React.useState<number>(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Extract year from incoming value if present (e.g., "November 2026" or "Year 2026")
  React.useEffect(() => {
    if (value && value !== "All Cycles") {
      const parts = value.split(" ");
      const candidateYear = Number(parts[parts.length - 1]);
      if (!Number.isNaN(candidateYear) && candidateYear >= 2000 && candidateYear <= 2100) {
        setSelectedYear(candidateYear);
      }
    }
  }, [value]);

  // When opening the calendar dropdown, always start with Years view as requested
  const handleOpenToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        // Reset to years view on every open so user always sees the years first
        setViewMode("years");
      }
      return next;
    });
  };

  // Close on outside click
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

  // Close on Escape key
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Map of recorded months in the current salaries dataset
  const recordedMonthsSet = React.useMemo(() => {
    const set = new Set<string>();
    salaries.forEach((s) => {
      if (s.monthYear) set.add(s.monthYear.trim());
    });
    return set;
  }, [salaries]);

  // Unique recorded months count per year
  const recordedCyclesByYear = React.useMemo(() => {
    const map = new Map<number, number>();
    const seen = new Set<string>();
    salaries.forEach((s) => {
      if (s.monthYear && !seen.has(s.monthYear)) {
        seen.add(s.monthYear);
        const parts = s.monthYear.split(" ");
        const y = Number(parts[parts.length - 1]);
        if (!Number.isNaN(y)) {
          map.set(y, (map.get(y) || 0) + 1);
        }
      }
    });
    return map;
  }, [salaries]);

  const isFiltered = value !== "All Cycles" && Boolean(value);

  // Trigger label formatting
  const displayLabel = React.useMemo(() => {
    if (!isFiltered || value === "All Cycles") {
      return "All Cycles";
    }
    if (value.startsWith("Year ")) {
      return `All ${value.replace("Year ", "")}`;
    }
    if (value === "November 2026") {
      return "Nov 2026 (Active)";
    }
    if (value === "October 2026") {
      return "Oct 2026 (Past)";
    }
    const parts = value.split(" ");
    if (parts.length === 2) {
      const shortM = parts[0].slice(0, 3);
      return `${shortM} ${parts[1]}`;
    }
    return value;
  }, [value, isFiltered]);

  // Dynamic years list based on offset
  const displayedYears = React.useMemo(() => {
    return BASE_YEARS.map((y) => y + yearPageOffset);
  }, [yearPageOffset]);

  // User clicked a year -> transition to Months view for that year!
  const handleYearClick = (year: number) => {
    setSelectedYear(year);
    setViewMode("months");
  };

  // User clicked a month -> select the cycle!
  const handleMonthSelect = (monthFull: string, year: number) => {
    onChange(`${monthFull} ${year}`);
    setIsOpen(false);
  };

  // User selects the entire year
  const handleSelectFullYear = (year: number) => {
    onChange(`Year ${year}`);
    setIsOpen(false);
  };

  // Reset to All Cycles
  const handleResetAllCycles = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onChange("All Cycles");
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative inline-flex items-center h-9 w-full rounded-[4px] border text-xs font-medium transition-all select-none",
        isFiltered
          ? "border-brand/40 bg-brand-50/40 text-brand font-semibold shadow-xs"
          : "border-brand/18 bg-white text-foreground hover:border-brand/35 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.05)]",
        className
      )}
    >
      {/* ── Trigger Button (Left icon & Label) ── */}
      <button
        type="button"
        onClick={handleOpenToggle}
        className="flex flex-1 items-center gap-2 pl-2.5 pr-1 h-full min-w-0 outline-none rounded-l-[4px] cursor-pointer text-left"
        title={isFiltered ? `Selected cycle: ${displayLabel}. Click to browse years and months.` : "Browse payroll cycles by Year and Month"}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <CalendarDays
          className={cn(
            "size-3.5 shrink-0 transition-colors",
            isFiltered ? "text-brand" : "text-brand/75"
          )}
        />
        <span className="truncate text-xs font-semibold">{displayLabel}</span>
      </button>

      {/* ── Clear Button (✕): Resets back to All Cycles ── */}
      {isFiltered && (
        <button
          type="button"
          onClick={handleResetAllCycles}
          className="p-1 mr-0.5 rounded-full hover:bg-brand-100/70 text-brand/80 hover:text-brand transition-colors cursor-pointer shrink-0"
          title="Clear cycle filter and show all cycles"
          aria-label="Clear cycle filter"
        >
          <X className="size-3" />
        </button>
      )}

      {/* ── Chevron Down toggle ── */}
      <button
        type="button"
        onClick={handleOpenToggle}
        className="pr-2 pl-0.5 h-full flex items-center text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
        aria-label="Toggle payroll calendar menu"
      >
        <ChevronDown
          className={cn(
            "size-3 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* ── Popover Dropdown ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Payroll calendar selector"
          className="absolute left-0 top-full mt-1.5 z-50 w-[310px] sm:w-[335px] rounded-xl border border-border/80 bg-white p-3 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 dark:bg-card"
        >
          {/* ── Header: Segmented Tabs (Years / Months) & Close ── */}
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-border/60">
            <div className="flex items-center p-0.5 bg-muted/60 rounded-lg flex-1">
              <button
                type="button"
                onClick={() => setViewMode("years")}
                className={cn(
                  "flex-1 py-1 text-xs font-semibold rounded-md transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer",
                  viewMode === "years"
                    ? "bg-white text-brand shadow-xs dark:bg-card"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>Years</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("months")}
                className={cn(
                  "flex-1 py-1 text-xs font-semibold rounded-md transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer",
                  viewMode === "months"
                    ? "bg-white text-brand shadow-xs dark:bg-card"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>Months ({selectedYear})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
              title="Close calendar"
              aria-label="Close calendar"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════
              VIEW 1: YEARS VIEW ("show the years")
             ══════════════════════════════════════════════════════════ */}
          {viewMode === "years" && (
            <div className="space-y-2.5">
              {/* Year Navigation Bar */}
              <div className="flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => setYearPageOffset((prev) => prev - 3)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
                  title="Older years"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <div className="text-center">
                  <span className="text-xs font-bold text-foreground tracking-tight">
                    Select Payroll Year
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    Click a year to view all 12 months
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setYearPageOffset((prev) => prev + 3)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
                  title="Newer years"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>

              {/* Grid of Years */}
              <div className="grid grid-cols-2 gap-2">
                {displayedYears.map((yr) => {
                  const cycleCount = recordedCyclesByYear.get(yr) || 0;
                  const isCurrentActiveYear = yr === 2026;
                  const isYearSelected =
                    value.includes(String(yr)) ||
                    (selectedYear === yr && isFiltered);

                  return (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => handleYearClick(yr)}
                      className={cn(
                        "group relative flex flex-col items-start justify-between rounded-lg border p-2.5 text-left transition-all cursor-pointer",
                        isYearSelected
                          ? "border-brand bg-brand-50/50 shadow-xs ring-1 ring-brand/30"
                          : "border-border/70 bg-white hover:border-brand/40 hover:bg-muted/30 dark:bg-card"
                      )}
                    >
                      <div className="flex w-full items-center justify-between mb-1">
                        <span className="text-sm font-bold text-foreground tracking-tight">
                          {yr}
                        </span>
                        <ChevronRight className="size-3.5 text-muted-foreground/60 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                      </div>

                      <div className="flex items-center gap-1.5 w-full">
                        {isCurrentActiveYear ? (
                          <span className="inline-flex items-center gap-1 rounded-[3px] bg-emerald-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-emerald-700 border border-emerald-200/80">
                            <span className="size-1 rounded-full bg-emerald-500" />
                            Active Year
                          </span>
                        ) : cycleCount > 0 ? (
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {cycleCount} {cycleCount === 1 ? "cycle" : "cycles"} logged
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/70">
                            Archive
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* All Cycles Shortcut Button */}
              <div className="pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={handleResetAllCycles}
                  className={cn(
                    "w-full py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer",
                    value === "All Cycles"
                      ? "bg-brand text-white shadow-xs"
                      : "bg-muted/50 text-foreground hover:bg-brand-50 hover:text-brand"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="size-3.5 text-inherit" />
                    <span>View All Cycles (Historical Records)</span>
                  </span>
                  {value === "All Cycles" && <Check className="size-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              VIEW 2: MONTHS VIEW ("click the year the months are shown")
             ══════════════════════════════════════════════════════════ */}
          {viewMode === "months" && (
            <div className="space-y-2.5">
              {/* Back to Years Navigation Header */}
              <div className="flex items-center justify-between pb-1 px-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("years")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-700 transition-colors p-1 rounded hover:bg-brand-50 cursor-pointer"
                  title="Return to years list"
                >
                  <ChevronLeft className="size-3.5" />
                  <span>Years</span>
                </button>

                {/* Year Switcher (prev/next year without leaving months view) */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedYear((y) => y - 1)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
                    title={`Previous year (${selectedYear - 1})`}
                  >
                    <ChevronLeft className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("years")}
                    className="text-xs font-bold text-foreground px-1.5 py-0.5 rounded hover:bg-muted transition-colors cursor-pointer"
                    title="Click to view all years"
                  >
                    {selectedYear}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedYear((y) => y + 1)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
                    title={`Next year (${selectedYear + 1})`}
                  >
                    <ChevronRight className="size-3" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectFullYear(selectedYear)}
                  className="text-[11px] font-semibold text-brand hover:underline p-1 cursor-pointer"
                  title={`Show all records for full year ${selectedYear}`}
                >
                  All {selectedYear}
                </button>
              </div>

              {/* 3x4 Grid of 12 Months */}
              <div className="grid grid-cols-3 gap-1.5">
                {MONTHS.map((m) => {
                  const cycleKey = `${m.full} ${selectedYear}`;
                  const isSelected = value === cycleKey;
                  const hasRecords = recordedMonthsSet.has(cycleKey);
                  const isLiveActive = cycleKey === "November 2026";
                  const isPastCycle = cycleKey === "October 2026";

                  return (
                    <button
                      key={m.short}
                      type="button"
                      onClick={() => handleMonthSelect(m.full, selectedYear)}
                      className={cn(
                        "relative flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border",
                        isSelected
                          ? "bg-brand border-brand text-white shadow-xs font-bold"
                          : hasRecords
                            ? "bg-brand-50/50 border-brand/25 text-foreground hover:border-brand hover:bg-brand-50"
                            : "bg-muted/30 border-transparent text-muted-foreground hover:border-border hover:bg-muted/70 hover:text-foreground"
                      )}
                      title={`Select ${m.full} ${selectedYear}${hasRecords ? " (Payroll records found)" : ""}`}
                    >
                      <span className="leading-tight">{m.short}</span>
                      <span className="text-[9px] font-normal opacity-70 leading-none mt-0.5">
                        {m.full}
                      </span>

                      {/* Status Badges */}
                      {isLiveActive ? (
                        <span
                          className={cn(
                            "mt-1 text-[8px] font-bold px-1 rounded-full uppercase tracking-wider",
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-emerald-500 text-white"
                          )}
                        >
                          Active
                        </span>
                      ) : isPastCycle ? (
                        <span
                          className={cn(
                            "mt-1 text-[8px] font-medium px-1 rounded-full",
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200"
                          )}
                        >
                          Past
                        </span>
                      ) : hasRecords ? (
                        <span
                          className={cn(
                            "mt-1 text-[8px] font-medium px-1 rounded-full",
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                          )}
                        >
                          Logged
                        </span>
                      ) : (
                        <span className="mt-1 h-3" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Quick Select Row */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("years")}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer font-medium"
                >
                  <RotateCcw className="size-3" />
                  <span>Choose Another Year</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetAllCycles}
                  className="text-brand hover:text-brand-700 transition-colors font-semibold cursor-pointer"
                >
                  All Cycles
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
