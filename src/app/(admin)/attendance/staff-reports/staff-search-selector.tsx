"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import {
  Briefcase,
  Check,
  ChevronsUpDown,
  Fingerprint,
  Phone,
  Search,
  SearchX,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/shared/user-avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AttendanceActionButton } from "../_components/attendance-ui";
import { shortCampus } from "../_components/attendance-utils";
import type { DailyStaffStatus } from "@/lib/mock/attendance";

export interface StaffSelectorOption {
  empId: string;
  empCode: string;
  name: string;
  designation: string;
  department: string;
  campus: string;
  type: "Teaching" | "Non-Teaching";
  shift?: string;
  phone?: string;
  monthlyRate?: number;
  monthlyPunctuality?: number;
  statusToday?: DailyStaffStatus;
}

interface StaffSearchSelectorProps {
  options: StaffSelectorOption[];
  value: string;
  onChange: (empId: string) => void;
  onSelectAndFetch?: (empId: string) => void;
  allValue?: string;
  disabled?: boolean;
  className?: string;
  size?: "md" | "sm";
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="rounded-[2px] bg-brand-100/90 px-0.5 font-bold text-brand"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

export function StaffSearchSelector({
  options,
  value,
  onChange,
  onSelectAndFetch,
  allValue = "all",
  disabled = false,
  className,
  size = "md",
}: StaffSearchSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] =
    React.useState<string>("all");
  const [selectedCampusFilter, setSelectedCampusFilter] =
    React.useState<string>("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    React.useState<string>("all");

  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const listContainerRef = React.useRef<HTMLDivElement>(null);

  const departmentOptions = React.useMemo(() => {
    const set = new Set(options.map((o) => o.department));
    return Array.from(set).sort();
  }, [options]);

  const campusOptions = React.useMemo(() => {
    const set = new Set(options.map((o) => o.campus));
    return Array.from(set).sort();
  }, [options]);

  const selectedStaff = React.useMemo(() => {
    if (value === allValue) return null;
    return options.find((o) => o.empId === value) || null;
  }, [value, allValue, options]);

  const filteredStaff = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return options.filter((s) => {
      if (selectedDeptFilter !== "all" && s.department !== selectedDeptFilter) {
        return false;
      }
      if (
        isModalOpen &&
        selectedCampusFilter !== "all" &&
        s.campus !== selectedCampusFilter
      ) {
        return false;
      }
      if (
        isModalOpen &&
        selectedCategoryFilter !== "all" &&
        s.type !== selectedCategoryFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.empCode.toLowerCase().includes(q) ||
        s.designation.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q) ||
        (s.campus && s.campus.toLowerCase().includes(q)) ||
        (s.phone && s.phone.toLowerCase().includes(q))
      );
    });
  }, [
    options,
    searchQuery,
    selectedDeptFilter,
    selectedCampusFilter,
    selectedCategoryFilter,
    isModalOpen,
  ]);

  React.useEffect(() => {
    if (isOpen) {
      setFocusedIndex(-1);
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 30);
      return () => clearTimeout(timer);
    } else if (!isModalOpen) {
      setSearchQuery("");
      setSelectedDeptFilter("all");
    }
  }, [isOpen, isModalOpen]);

  React.useEffect(() => {
    setFocusedIndex(-1);
  }, [searchQuery, selectedDeptFilter]);

  React.useEffect(() => {
    if (focusedIndex >= 0 && listContainerRef.current) {
      const items =
        listContainerRef.current.querySelectorAll('[role="option"]');
      const target = items[focusedIndex] as HTMLElement | undefined;
      target?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex]);

  const handleSelectStaff = React.useCallback(
    (empId: string, immediateFetch = true) => {
      onChange(empId);
      setIsOpen(false);
      setIsModalOpen(false);
      if (immediateFetch && onSelectAndFetch) {
        onSelectAndFetch(empId);
      }
    },
    [onChange, onSelectAndFetch]
  );

  const handleResetToAll = React.useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      e?.preventDefault();
      onChange(allValue);
      setIsOpen(false);
      setIsModalOpen(false);
      if (onSelectAndFetch) {
        onSelectAndFetch(allValue);
      }
    },
    [allValue, onChange, onSelectAndFetch]
  );

  const handlePopupKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    const totalItems = 1 + filteredStaff.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev <= 0 ? totalItems - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex === 0) {
        handleSelectStaff(allValue, true);
      } else if (focusedIndex > 0 && focusedIndex <= filteredStaff.length) {
        const picked = filteredStaff[focusedIndex - 1];
        if (picked) {
          handleSelectStaff(picked.empId, true);
        }
      } else if (filteredStaff.length === 1 && searchQuery.trim()) {
        handleSelectStaff(filteredStaff[0].empId, true);
      }
    }
  };

  return (
    <>
      <div className={cn("inline-flex items-center gap-1.5", className)}>
        <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
          <PopoverPrimitive.Trigger
            disabled={disabled}
            aria-label="Filter by specific staff member"
            className={cn(
              "group inline-flex cursor-pointer items-center justify-between border bg-white text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.05)] transition-all hover:bg-slate-50/70 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 outline-none select-none",
              size === "md"
                ? "h-9 w-[280px] min-w-[280px] max-w-[280px] rounded-[6px] border-[#cbd5e1] px-3 text-[13px] font-semibold gap-2.5 hover:border-brand/40"
                : "h-8 w-[230px] min-w-[230px] max-w-[230px] rounded-[4px] border-brand/18 px-2.5 text-xs font-semibold gap-2 hover:border-brand/35",
              isOpen && "border-ring ring-2 ring-ring/20 bg-slate-50/80",
              selectedStaff && "border-brand/35 bg-brand-50/35",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
              {selectedStaff ? (
                <span
                  className={cn(
                    "grid shrink-0 place-items-center rounded-full bg-[#091d3e] font-bold text-white shadow-xs",
                    size === "md" ? "size-5 text-[10.5px]" : "size-4.5 text-[9px]"
                  )}
                >
                  {selectedStaff.name.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s+/i, "").charAt(0)}
                </span>
              ) : (
                <Users
                  className={cn(
                    "shrink-0 text-brand",
                    size === "md" ? "size-4" : "size-3.5"
                  )}
                />
              )}
              <span className="truncate font-semibold text-foreground">
                {selectedStaff
                  ? `${selectedStaff.name} · ${selectedStaff.empCode} (${selectedStaff.department})`
                  : `All Staff (${options.length})`}
              </span>
            </span>

            <ChevronsUpDown
              className={cn(
                "shrink-0 text-muted-foreground/80 transition-colors group-hover:text-foreground",
                size === "md" ? "size-4 ml-1.5" : "size-3.5 ml-1"
              )}
            />
          </PopoverPrimitive.Trigger>

          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Positioner
              side="bottom"
              align="start"
              sideOffset={6}
              collisionPadding={12}
              className="isolate z-[100] outline-none"
            >
              <PopoverPrimitive.Popup
                initialFocus={searchInputRef}
                onKeyDown={handlePopupKeyDown}
                role="listbox"
                aria-label="Staff search options"
                className="w-[370px] sm:w-[420px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-[#cfdbe9] bg-white text-foreground shadow-[0_22px_48px_-12px_rgba(9,29,62,0.28),0_4px_16px_rgba(9,29,62,0.08)] ring-1 ring-brand/10 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 duration-100"
              >
                {/* Top Search & Department Filter Bar */}
                <div className="border-b border-[#e2e8f0] bg-[#f8fafd] p-3 space-y-2.5">
                  <div className="relative flex items-center">
                    <Search className="pointer-events-none absolute left-2.5 size-3.5 text-brand" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by staff name, EMP code, role, dept..."
                      className="h-8.5 w-full rounded-[5px] border border-brand/20 bg-white pl-8 pr-16 text-xs font-medium text-foreground placeholder:text-muted-foreground/75 shadow-2xs outline-none transition-colors hover:border-brand/35 focus:border-brand focus:ring-2 focus:ring-brand/15"
                    />
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          searchInputRef.current?.focus();
                        }}
                        title="Clear search"
                        className="absolute right-2 grid size-5 cursor-pointer place-items-center rounded text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                      >
                        <X className="size-3.5" />
                      </button>
                    ) : (
                      <span className="pointer-events-none absolute right-2.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                        {filteredStaff.length}
                      </span>
                    )}
                  </div>

                  {/* Department Filter Chips */}
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedDeptFilter("all")}
                      className={cn(
                        "cursor-pointer rounded-[4px] px-2 py-0.5 text-[11px] font-semibold transition-all",
                        selectedDeptFilter === "all"
                          ? "bg-brand text-white shadow-2xs"
                          : "border border-brand/15 bg-white text-muted-foreground hover:border-brand/30 hover:bg-brand-50/60 hover:text-brand"
                      )}
                    >
                      All Depts
                    </button>
                    {departmentOptions.map((dept) => (
                      <button
                        key={dept}
                        type="button"
                        onClick={() =>
                          setSelectedDeptFilter((prev) =>
                            prev === dept ? "all" : dept
                          )
                        }
                        className={cn(
                          "cursor-pointer rounded-[4px] px-2 py-0.5 text-[11px] font-semibold transition-all",
                          selectedDeptFilter === dept
                            ? "bg-brand text-white shadow-2xs"
                            : "border border-brand/15 bg-white text-muted-foreground hover:border-brand/30 hover:bg-brand-50/60 hover:text-brand"
                        )}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pinned Option: All Staff */}
                <div className="border-b border-[#edf2f7] bg-white p-1.5">
                  <div
                    role="option"
                    aria-selected={value === allValue}
                    onClick={() => handleSelectStaff(allValue, true)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-xs transition-colors",
                      focusedIndex === 0
                        ? "bg-brand-50 text-brand"
                        : "hover:bg-slate-50",
                      value === allValue && "bg-brand-50/70 font-semibold text-brand"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-lg border",
                          value === allValue
                            ? "border-brand bg-brand text-white shadow-2xs"
                            : "border-brand/15 bg-brand-50 text-brand"
                        )}
                      >
                        <Users className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground leading-tight">
                          All Staff ({options.length})
                        </p>
                        <p className="truncate text-[11px] font-normal text-muted-foreground">
                          Aggregated attendance report across all departments
                        </p>
                      </div>
                    </div>
                    {value === allValue && (
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand text-white">
                        <Check className="size-3" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Section Header: Specific Staff */}
                <div className="flex items-center justify-between border-b border-[#edf2f7] bg-[#f8fafd] px-3 py-1.5">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    Select Specific Staff ({filteredStaff.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-bold text-brand hover:underline"
                  >
                    <Sparkles className="size-3 text-brand" />
                    Directory View ↗
                  </button>
                </div>

                {/* Scrollable Specific Staff List */}
                <div
                  ref={listContainerRef}
                  className="max-h-[250px] overflow-y-auto divide-y divide-slate-100 bg-white p-1 text-xs"
                >
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map((s, index) => {
                      const isSelected = value === s.empId;
                      const itemIndex = index + 1;
                      const isKeyboardFocused = focusedIndex === itemIndex;

                      return (
                        <div
                          key={s.empId}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleSelectStaff(s.empId, true)}
                          className={cn(
                            "flex cursor-pointer items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 transition-colors",
                            isKeyboardFocused
                              ? "bg-brand-50 text-foreground"
                              : "hover:bg-slate-50",
                            isSelected && "bg-brand-50/75"
                          )}
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <UserAvatar
                              name={s.name}
                              size="sm"
                              className={cn(
                                "shrink-0",
                                isSelected && "ring-2 ring-brand"
                              )}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate font-semibold text-foreground">
                                  <HighlightMatch
                                    text={s.name}
                                    query={searchQuery}
                                  />
                                </span>
                                <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-700">
                                  <HighlightMatch
                                    text={s.empCode}
                                    query={searchQuery}
                                  />
                                </span>
                              </div>
                              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                                <HighlightMatch
                                  text={s.designation}
                                  query={searchQuery}
                                />{" "}
                                ·{" "}
                                <span className="font-medium text-foreground/75">
                                  {s.department}
                                </span>{" "}
                                · {shortCampus(s.campus)}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {typeof s.monthlyRate === "number" && (
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums",
                                  s.monthlyRate >= 90
                                    ? "bg-emerald-50 text-emerald-700"
                                    : s.monthlyRate >= 80
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-rose-50 text-rose-700"
                                )}
                              >
                                {s.monthlyRate}%
                              </span>
                            )}
                            {isSelected && (
                              <span className="grid size-5 place-items-center rounded-full bg-brand text-white">
                                <Check className="size-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                      <div className="grid size-9 place-items-center rounded-full bg-slate-100 text-muted-foreground">
                        <SearchX className="size-4" />
                      </div>
                      <p className="mt-2 text-xs font-semibold text-foreground">
                        No matching staff found
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Try searching by another name, EMP code, or department.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedDeptFilter("all");
                          searchInputRef.current?.focus();
                        }}
                        className="mt-2.5 cursor-pointer rounded-[4px] border border-brand/20 bg-white px-2.5 py-1 text-[11px] font-semibold text-brand hover:bg-brand-50"
                      >
                        Reset search filters
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Bar */}
                <div className="flex items-center justify-between border-t border-[#e2e8f0] bg-[#f8fafd] px-3 py-2 text-[10.5px] text-muted-foreground">
                  <span>
                    Use <kbd className="rounded border bg-white px-1 py-0.5 font-mono text-[9.5px]">↑</kbd>{" "}
                    <kbd className="rounded border bg-white px-1 py-0.5 font-mono text-[9.5px]">↓</kbd>{" "}
                    & <kbd className="rounded border bg-white px-1 py-0.5 font-mono text-[9.5px]">Enter</kbd> to select
                  </span>
                  {selectedStaff && (
                    <button
                      type="button"
                      onClick={(e) => handleResetToAll(e)}
                      className="cursor-pointer font-semibold text-brand hover:underline"
                    >
                      Reset to All Staff
                    </button>
                  )}
                </div>
              </PopoverPrimitive.Popup>
            </PopoverPrimitive.Positioner>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      </div>

      {/* Full Searchable Staff Directory Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="border-b border-border/70 bg-[#f8fafd] px-6 py-4">
            <div className="flex items-center justify-between gap-3 pr-6">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-lg bg-brand text-white shadow-xs">
                  <Briefcase className="size-4.5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-foreground">
                    Search & Select Specific Staff Member
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Search across {options.length} faculty and administrative staff by name, EMP code, department, or campus.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Directory Search & Multi-Filter Bar */}
          <div className="border-b border-border/70 bg-white px-6 py-3.5 space-y-3">
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type staff name, employee code (e.g. EMP-0104), role, or phone..."
                  autoFocus
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white pl-9 pr-8 text-xs font-medium text-foreground placeholder:text-muted-foreground/75 shadow-2xs outline-none transition-colors focus:border-brand focus:ring-3 focus:ring-brand/15"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 grid size-5 cursor-pointer place-items-center rounded text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  aria-label="Filter by Department"
                  className="h-9 rounded-[4px] border border-brand/18 bg-white px-2.5 text-xs font-semibold text-foreground outline-none focus:border-brand"
                >
                  <option value="all">All Departments</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedCampusFilter}
                  onChange={(e) => setSelectedCampusFilter(e.target.value)}
                  aria-label="Filter by Campus"
                  className="h-9 rounded-[4px] border border-brand/18 bg-white px-2.5 text-xs font-semibold text-foreground outline-none focus:border-brand"
                >
                  <option value="all">All Campuses</option>
                  {campusOptions.map((camp) => (
                    <option key={camp} value={camp}>
                      {shortCampus(camp)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <SlidersHorizontal className="size-3 text-brand" />
                Showing <strong className="text-foreground">{filteredStaff.length}</strong> of{" "}
                {options.length} staff members
              </span>
              {(searchQuery ||
                selectedDeptFilter !== "all" ||
                selectedCampusFilter !== "all" ||
                selectedCategoryFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDeptFilter("all");
                    setSelectedCampusFilter("all");
                    setSelectedCategoryFilter("all");
                  }}
                  className="cursor-pointer font-semibold text-brand hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Directory Results Grid */}
          <div className="max-h-[360px] overflow-y-auto bg-slate-50/50 p-4">
            {filteredStaff.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {filteredStaff.map((s) => {
                  const isSelected = value === s.empId;
                  return (
                    <button
                      key={s.empId}
                      type="button"
                      onClick={() => handleSelectStaff(s.empId, true)}
                      className={cn(
                        "group flex w-full cursor-pointer items-start justify-between gap-3 rounded-xl border bg-white p-3 text-left transition-all hover:border-brand/45 hover:shadow-sm",
                        isSelected
                          ? "border-brand bg-brand-50/40 ring-2 ring-brand/20"
                          : "border-border/80"
                      )}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <UserAvatar
                          name={s.name}
                          size="md"
                          className="mt-0.5 shrink-0 ring-1 ring-brand/15"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-xs font-bold text-foreground group-hover:text-brand">
                              <HighlightMatch text={s.name} query={searchQuery} />
                            </p>
                            <span className="shrink-0 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-brand">
                              {s.empCode}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] font-medium text-foreground/80 truncate">
                            {s.designation}
                          </p>
                          <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                            {s.department} ({s.type}) · {shortCampus(s.campus)}
                          </p>
                          {s.phone && (
                            <p className="mt-1 flex items-center gap-1 text-[10.5px] text-muted-foreground">
                              <Phone className="size-2.5 text-brand/70" />
                              <span className="truncate">{s.phone}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end justify-between gap-2">
                        {typeof s.monthlyRate === "number" && (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums",
                              s.monthlyRate >= 90
                                ? "bg-emerald-50 text-emerald-700"
                                : s.monthlyRate >= 80
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-rose-50 text-rose-700"
                            )}
                          >
                            {s.monthlyRate}%
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-[4px] bg-brand-50/80 px-2 py-0.5 text-[10px] font-bold text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                          {isSelected ? "Selected" : "Select →"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <SearchX className="size-8 text-muted-foreground/60" />
                <p className="mt-2 text-sm font-bold text-foreground">
                  No staff members match your search criteria
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try clearing the department or campus filter or searching by another keyword.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="m-0 flex-row items-center justify-between border-t border-border/70 bg-[#f8fafd] px-6 py-3.5 sm:justify-between">
            <AttendanceActionButton
              size="sm"
              tone="outline"
              onClick={() => handleSelectStaff(allValue, true)}
            >
              <Users />
              View All Staff ({options.length})
            </AttendanceActionButton>
            <AttendanceActionButton
              size="sm"
              tone="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </AttendanceActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
