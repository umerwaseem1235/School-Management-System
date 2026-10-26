"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import {
  Check,
  ChevronsUpDown,
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
import type { DailyStudentStatus } from "@/lib/mock/attendance";

export interface StudentSelectorOption {
  studentId: string;
  name: string;
  rollNo: string;
  className: string;
  section: string;
  campus: string;
  admissionNumber: string;
  gender?: "Male" | "Female";
  guardian?: string;
  phone?: string;
  monthlyRate?: number;
  statusToday?: DailyStudentStatus;
}

interface StudentSearchSelectorProps {
  options: StudentSelectorOption[];
  value: string;
  onChange: (studentId: string) => void;
  onSelectAndFetch?: (studentId: string) => void;
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

export function StudentSearchSelector({
  options,
  value,
  onChange,
  onSelectAndFetch,
  allValue = "all",
  disabled = false,
  className,
  size = "md",
}: StudentSearchSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedClassFilter, setSelectedClassFilter] =
    React.useState<string>("all");
  const [selectedCampusFilter, setSelectedCampusFilter] =
    React.useState<string>("all");

  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const listContainerRef = React.useRef<HTMLDivElement>(null);

  // Extract unique classes and campuses
  const classOptions = React.useMemo(() => {
    const set = new Set(options.map((o) => o.className));
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
  }, [options]);

  const campusOptions = React.useMemo(() => {
    const set = new Set(options.map((o) => o.campus));
    return Array.from(set).sort();
  }, [options]);

  const selectedStudent = React.useMemo(() => {
    if (value === allValue) return null;
    return options.find((o) => o.studentId === value) || null;
  }, [value, allValue, options]);

  // Filter students based on query and class/campus filters
  const filteredStudents = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return options.filter((s) => {
      if (selectedClassFilter !== "all" && s.className !== selectedClassFilter) {
        return false;
      }
      if (
        isModalOpen &&
        selectedCampusFilter !== "all" &&
        s.campus !== selectedCampusFilter
      ) {
        return false;
      }
      if (!q) return true;
      const cleanQ = q.replace(/^#/, "");
      return (
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(cleanQ) ||
        `roll #${s.rollNo}`.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q) ||
        `section ${s.section}`.toLowerCase().includes(q) ||
        (s.guardian && s.guardian.toLowerCase().includes(q)) ||
        (s.campus && s.campus.toLowerCase().includes(q))
      );
    });
  }, [
    options,
    searchQuery,
    selectedClassFilter,
    selectedCampusFilter,
    isModalOpen,
  ]);

  // Focus search input when popover opens and reset state when it closes
  React.useEffect(() => {
    if (isOpen) {
      setFocusedIndex(-1);
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 30);
      return () => clearTimeout(timer);
    } else if (!isModalOpen) {
      setSearchQuery("");
      setSelectedClassFilter("all");
    }
  }, [isOpen, isModalOpen]);

  // Reset keyboard focus when query or filter changes
  React.useEffect(() => {
    setFocusedIndex(-1);
  }, [searchQuery, selectedClassFilter]);

  // Auto-scroll keyboard focused option into view
  React.useEffect(() => {
    if (focusedIndex >= 0 && listContainerRef.current) {
      const items =
        listContainerRef.current.querySelectorAll('[role="option"]');
      const target = items[focusedIndex] as HTMLElement | undefined;
      target?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex]);

  const handleSelectStudent = React.useCallback(
    (studentId: string, immediateFetch = true) => {
      onChange(studentId);
      setIsOpen(false);
      setIsModalOpen(false);
      if (immediateFetch && onSelectAndFetch) {
        onSelectAndFetch(studentId);
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

  // Handle keyboard navigation inside the open popover
  const handlePopupKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    const totalItems = 1 + filteredStudents.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev <= 0 ? totalItems - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex === 0) {
        handleSelectStudent(allValue, true);
      } else if (focusedIndex > 0 && focusedIndex <= filteredStudents.length) {
        const picked = filteredStudents[focusedIndex - 1];
        if (picked) {
          handleSelectStudent(picked.studentId, true);
        }
      } else if (filteredStudents.length === 1 && searchQuery.trim()) {
        handleSelectStudent(filteredStudents[0].studentId, true);
      }
    }
  };

  return (
    <>
      <div className={cn("inline-flex items-center gap-1.5", className)}>
        <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
          <PopoverPrimitive.Trigger
            disabled={disabled}
            aria-label="Filter by specific student"
            className={cn(
              "group inline-flex cursor-pointer items-center justify-between border bg-white text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.05)] transition-all hover:bg-slate-50/70 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 outline-none select-none",
              size === "md"
                ? "h-9 w-[280px] min-w-[280px] max-w-[280px] rounded-[6px] border-[#cbd5e1] px-3 text-[13px] font-semibold gap-2.5 hover:border-brand/40"
                : "h-8 w-[230px] min-w-[230px] max-w-[230px] rounded-[4px] border-brand/18 px-2.5 text-xs font-semibold gap-2 hover:border-brand/35",
              isOpen && "border-ring ring-2 ring-ring/20 bg-slate-50/80",
              selectedStudent && "border-brand/35 bg-brand-50/35",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
              {selectedStudent ? (
                <span
                  className={cn(
                    "grid shrink-0 place-items-center rounded-full bg-[#091d3e] font-bold text-white shadow-xs",
                    size === "md" ? "size-5 text-[10.5px]" : "size-4.5 text-[9px]"
                  )}
                >
                  {selectedStudent.name.charAt(0)}
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
                {selectedStudent
                  ? `${selectedStudent.name} · #${selectedStudent.rollNo} (${selectedStudent.className})`
                  : `All Students (${options.length})`}
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
                aria-label="Student search options"
                className="w-[360px] sm:w-[410px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-[#cfdbe9] bg-white text-foreground shadow-[0_22px_48px_-12px_rgba(9,29,62,0.28),0_4px_16px_rgba(9,29,62,0.08)] ring-1 ring-brand/10 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 duration-100"
              >
                {/* Top Search & Grade Filter Bar */}
                <div className="border-b border-[#e2e8f0] bg-[#f8fafd] p-3 space-y-2.5">
                  <div className="relative flex items-center">
                    <Search className="pointer-events-none absolute left-2.5 size-3.5 text-brand" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by student name, roll #, grade, ID..."
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
                        {filteredStudents.length}
                      </span>
                    )}
                  </div>

                  {/* Wrap Grade Filter Chips cleanly without native scrollbars */}
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedClassFilter("all")}
                      className={cn(
                        "cursor-pointer rounded-[4px] px-2 py-0.5 text-[11px] font-semibold transition-all",
                        selectedClassFilter === "all"
                          ? "bg-brand text-white shadow-2xs"
                          : "border border-brand/15 bg-white text-muted-foreground hover:border-brand/30 hover:bg-brand-50/60 hover:text-brand"
                      )}
                    >
                      All Classes
                    </button>
                    {classOptions.map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() =>
                          setSelectedClassFilter((prev) =>
                            prev === cls ? "all" : cls
                          )
                        }
                        className={cn(
                          "cursor-pointer rounded-[4px] px-2 py-0.5 text-[11px] font-semibold transition-all",
                          selectedClassFilter === cls
                            ? "bg-brand text-white shadow-2xs"
                            : "border border-brand/15 bg-white text-muted-foreground hover:border-brand/30 hover:bg-brand-50/60 hover:text-brand"
                        )}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pinned Option: All Students */}
                <div className="border-b border-[#edf2f7] bg-white p-1.5">
                  <div
                    role="option"
                    aria-selected={value === allValue}
                    onClick={() => handleSelectStudent(allValue, true)}
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
                          All Students ({options.length})
                        </p>
                        <p className="truncate text-[11px] font-normal text-muted-foreground">
                          Aggregated attendance report across all classes
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

                {/* Section Header: Specific Students */}
                <div className="flex items-center justify-between border-b border-[#edf2f7] bg-[#f8fafd] px-3 py-1.5">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    Select Specific Student ({filteredStudents.length})
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

                {/* Scrollable Specific Students List */}
                <div
                  ref={listContainerRef}
                  className="max-h-[250px] overflow-y-auto divide-y divide-slate-100 bg-white p-1 text-xs"
                >
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s, index) => {
                      const isSelected = value === s.studentId;
                      const itemIndex = index + 1;
                      const isKeyboardFocused = focusedIndex === itemIndex;

                      return (
                        <div
                          key={s.studentId}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleSelectStudent(s.studentId, true)}
                          className={cn(
                            "group flex cursor-pointer items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 transition-colors",
                            isKeyboardFocused
                              ? "bg-brand-50"
                              : "hover:bg-slate-50",
                            isSelected && "bg-brand-50/70"
                          )}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2.5">
                            <UserAvatar
                              name={s.name}
                              size="sm"
                              className="size-7 shrink-0 text-[10px] ring-1 ring-brand/15"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold text-foreground leading-tight">
                                <HighlightMatch
                                  text={s.name}
                                  query={searchQuery}
                                />
                              </p>
                              <div className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-muted-foreground">
                                <span className="inline-flex shrink-0 items-center rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-foreground tabular-nums">
                                  Roll #{s.rollNo}
                                </span>
                                <span className="shrink-0 font-semibold text-brand">
                                  {s.className} (Sec {s.section})
                                </span>
                                <span className="shrink-0 text-muted-foreground/40">
                                  ·
                                </span>
                                <span className="truncate">
                                  {shortCampus(s.campus)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {typeof s.monthlyRate === "number" && (
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                                  s.monthlyRate >= 85
                                    ? "bg-success-soft text-success"
                                    : s.monthlyRate >= 75
                                      ? "bg-warning-soft text-warning"
                                      : "bg-danger-soft text-danger"
                                )}
                              >
                                {s.monthlyRate}%
                              </span>
                            )}
                            {isSelected ? (
                              <span className="grid size-5 place-items-center rounded-full bg-brand text-white shadow-2xs">
                                <Check className="size-3" />
                              </span>
                            ) : (
                              <span className="rounded border border-brand/20 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                                Select
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="space-y-2 px-4 py-7 text-center">
                      <SearchX className="mx-auto size-6 text-muted-foreground/60" />
                      <p className="text-xs font-semibold text-foreground">
                        No matching students found
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        No student matched &ldquo;{searchQuery}&rdquo;
                        {selectedClassFilter !== "all"
                          ? ` in ${selectedClassFilter}`
                          : ""}
                        .
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedClassFilter("all");
                          searchInputRef.current?.focus();
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded border border-brand/20 bg-white px-2.5 py-1 text-[11px] font-semibold text-brand hover:bg-brand-50"
                      >
                        Reset search
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer with Keyboard Hints & Modal Trigger */}
                <div className="flex items-center justify-between border-t border-[#e2e8f0] bg-[#f8fafd] px-3 py-2 text-[10.5px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-slate-300 bg-white px-1 py-0.2 text-[9px] font-semibold text-foreground">
                      ↑↓
                    </kbd>
                    <span>navigate</span>
                    <kbd className="ml-1 rounded border border-slate-300 bg-white px-1 py-0.2 text-[9px] font-semibold text-foreground">
                      ↵
                    </kbd>
                    <span>select</span>
                    <kbd className="ml-1 rounded border border-slate-300 bg-white px-1 py-0.2 text-[9px] font-semibold text-foreground">
                      esc
                    </kbd>
                    <span>close</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setIsModalOpen(true);
                    }}
                    className="cursor-pointer font-bold text-brand hover:underline"
                  >
                    Full Directory ↗
                  </button>
                </div>
              </PopoverPrimitive.Popup>
            </PopoverPrimitive.Positioner>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      </div>

      {/* Dedicated Student Search & Selection Dialog Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <DialogHeader className="border-b border-border/70 bg-gradient-to-r from-slate-50 to-white px-6 py-4.5">
            <div className="flex items-start justify-between gap-4 pr-6">
              <div>
                <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                  <UserRound className="size-4.5 text-brand" />
                  Select Specific Student for Attendance Report
                </DialogTitle>
                <DialogDescription className="mt-1 text-xs text-muted-foreground">
                  Search across {options.length} students by name, roll number,
                  class, admission ID, or guardian to load individual attendance
                  records.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Modal Filters Bar */}
          <div className="space-y-3 border-b border-border/60 bg-slate-50/70 p-4">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student by name, roll #, admission ID, guardian, or class..."
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white pl-9 pr-8 text-xs font-medium text-foreground placeholder:text-muted-foreground shadow-2xs outline-none transition-colors hover:border-brand/35 focus:border-ring focus:ring-2 focus:ring-ring/25"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 grid size-5 -translate-y-1/2 cursor-pointer place-items-center rounded text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Campus Selector */}
              <select
                value={selectedCampusFilter}
                onChange={(e) => setSelectedCampusFilter(e.target.value)}
                aria-label="Filter by campus"
                className="h-9 rounded-[4px] border border-brand/20 bg-white px-3 text-xs font-semibold text-foreground shadow-2xs outline-none transition-colors hover:border-brand/35 focus:border-ring focus:ring-2 focus:ring-ring/25"
              >
                <option value="all">
                  All Campuses ({campusOptions.length})
                </option>
                {campusOptions.map((c) => (
                  <option key={c} value={c}>
                    {shortCampus(c)}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="mr-1 flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                <SlidersHorizontal className="size-3" />
                Class:
              </span>
              <button
                type="button"
                onClick={() => setSelectedClassFilter("all")}
                className={cn(
                  "cursor-pointer rounded-[4px] px-2.5 py-1 text-xs font-semibold transition-all",
                  selectedClassFilter === "all"
                    ? "bg-brand text-white shadow-2xs"
                    : "border border-brand/15 bg-white text-muted-foreground hover:bg-brand-50 hover:text-brand"
                )}
              >
                All Classes ({options.length})
              </button>
              {classOptions.map((cls) => {
                const countInClass = options.filter(
                  (s) => s.className === cls
                ).length;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() =>
                      setSelectedClassFilter((prev) =>
                        prev === cls ? "all" : cls
                      )
                    }
                    className={cn(
                      "cursor-pointer rounded-[4px] px-2.5 py-1 text-xs font-semibold transition-all",
                      selectedClassFilter === cls
                        ? "bg-brand text-white shadow-2xs"
                        : "border border-brand/15 bg-white text-muted-foreground hover:bg-brand-50 hover:text-brand"
                    )}
                  >
                    {cls} ({countInClass})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Student Grid */}
          <div className="max-h-[380px] overflow-y-auto bg-white p-4 sm:p-5">
            {filteredStudents.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {filteredStudents.map((s) => {
                  const isCurrent = value === s.studentId;
                  return (
                    <div
                      key={s.studentId}
                      onClick={() => handleSelectStudent(s.studentId, true)}
                      className={cn(
                        "group relative flex cursor-pointer flex-col justify-between gap-3 rounded-xl border p-3.5 text-xs transition-all",
                        isCurrent
                          ? "border-brand bg-brand-50/40 ring-2 ring-brand/15 shadow-xs"
                          : "border-border/80 bg-white hover:border-brand/40 hover:bg-slate-50/50 hover:shadow-xs"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <UserAvatar
                          name={s.name}
                          size="md"
                          className="size-9 shrink-0 text-xs ring-2 ring-brand/10"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="truncate text-sm font-bold text-foreground">
                              <HighlightMatch
                                text={s.name}
                                query={searchQuery}
                              />
                            </h4>
                            {isCurrent && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
                                <Check className="size-2.5" />
                                Active
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-foreground tabular-nums">
                              Roll #{s.rollNo}
                            </span>
                            <span>·</span>
                            <span className="font-semibold text-brand">
                              {s.className} (Sec {s.section})
                            </span>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10.5px] text-muted-foreground">
                            <span>{shortCampus(s.campus)}</span>
                            <span>·</span>
                            <span className="font-mono text-[10px] tabular-nums">
                              {s.admissionNumber}
                            </span>
                          </div>

                          {s.guardian && (
                            <p className="mt-1.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                              <Phone className="size-3 shrink-0 text-muted-foreground/80" />
                              <span>
                                {s.guardian} ({s.phone})
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Footer: Metrics & Action */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                        <div className="flex items-center gap-2">
                          {typeof s.monthlyRate === "number" && (
                            <span
                              className={cn(
                                "rounded px-2 py-0.5 text-[10.5px] font-bold tabular-nums",
                                s.monthlyRate >= 85
                                  ? "bg-success-soft text-success"
                                  : s.monthlyRate >= 75
                                    ? "bg-warning-soft text-warning"
                                    : "bg-danger-soft text-danger"
                              )}
                            >
                              {s.monthlyRate}% Rate
                            </span>
                          )}
                          {s.statusToday && (
                            <span className="text-[10px] text-muted-foreground">
                              Today:{" "}
                              <strong className="text-foreground">
                                {s.statusToday}
                              </strong>
                            </span>
                          )}
                        </div>

                        <span
                          className={cn(
                            "rounded-[4px] px-2.5 py-1 text-xs font-semibold transition-colors",
                            isCurrent
                              ? "bg-brand text-white"
                              : "border border-brand/20 bg-white text-brand group-hover:bg-brand group-hover:text-white"
                          )}
                        >
                          {isCurrent ? "Selected" : "Select Student"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 py-12 text-center">
                <SearchX className="mx-auto size-9 text-muted-foreground/60" />
                <h4 className="text-sm font-bold text-foreground">
                  No students found
                </h4>
                <p className="mx-auto max-w-sm text-xs text-muted-foreground">
                  No students match your query &ldquo;{searchQuery}&rdquo; with
                  the active filters. Try clearing your search term or selecting
                  &ldquo;All Classes&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedClassFilter("all");
                    setSelectedCampusFilter("all");
                  }}
                  className="cursor-pointer rounded-[4px] border border-brand/20 bg-white px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand-50"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          <DialogFooter className="m-0 flex flex-row items-center justify-between border-t border-border/70 bg-slate-50/70 px-6 py-3 sm:justify-between">
            <button
              type="button"
              onClick={handleResetToAll}
              className="cursor-pointer text-xs font-semibold text-brand hover:underline"
            >
              Reset to All Students ({options.length})
            </button>
            <div className="flex items-center gap-2">
              <AttendanceActionButton
                size="sm"
                tone="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </AttendanceActionButton>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
