"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Clock3,
  FileText,
  Inbox,
  Layers,
  Phone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  align?: "left" | "center" | "right";
  headerAlign?: "left" | "center" | "right";
  icon?: LucideIcon;
  cell: (row: T) => React.ReactNode;
  /** Returns a primitive used for sorting. Enables sorting when provided. */
  sortValue?: (row: T) => string | number;
  className?: string;
  headerClassName?: string;
}

function resolveHeaderIcon(key: string, header: React.ReactNode): LucideIcon {
  const headerStr = typeof header === "string" ? header : "";
  const token = `${key} ${headerStr}`.toLowerCase();
  if (
    token.includes("student") ||
    token.includes("employee") ||
    token.includes("applicant") ||
    token.includes("teacher") ||
    token.includes("person")
  ) {
    return UserRound;
  }
  if (
    token.includes("class") ||
    token.includes("campus") ||
    token.includes("department") ||
    token.includes("wing")
  ) {
    return Building2;
  }
  if (
    token.includes("arrival") ||
    token.includes("scan") ||
    token.includes("check") ||
    token.includes("time")
  ) {
    return Clock3;
  }
  if (
    token.includes("rate") ||
    token.includes("monthly") ||
    token.includes("cumulative") ||
    token.includes("trend")
  ) {
    return TrendingUp;
  }
  if (token.includes("status") || token.includes("risk")) {
    return ShieldCheck;
  }
  if (
    token.includes("roll") ||
    token.includes("action") ||
    token.includes("override") ||
    token.includes("decision")
  ) {
    return SlidersHorizontal;
  }
  if (
    token.includes("date") ||
    token.includes("streak") ||
    token.includes("duration") ||
    token.includes("days")
  ) {
    return CalendarDays;
  }
  if (token.includes("guardian") || token.includes("phone") || token.includes("contact")) {
    return Phone;
  }
  if (token.includes("leave") || token.includes("reason") || token.includes("type")) {
    return FileText;
  }
  return Layers;
}

export type FilterOption = string | { value: string; label: string };

export interface FilterDef<T> {
  key: string;
  label: string;
  allLabel?: string;
  options?: FilterOption[];
  getValue: (row: T) => string;
  className?: string;
  triggerClassName?: string;
  dependsOn?: {
    key: string;
    getOptions?: (parentValue: string) => string[];
  };
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  searchPlaceholder?: string;
  searchFn?: (row: T, query: string) => boolean;
  filters?: FilterDef<T>[];
  pageSize?: number;
  selectable?: boolean;
  toolbar?: React.ReactNode;
  bulkActions?: (selected: string[]) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
  tableClassName?: string;
}

const ALL = "__all__";

/**
 * Generic, typed client-side data table.
 * Search, filters, sorting, pagination and selection are handled locally;
 * swap `data` for server-paginated results when wiring the backend.
 */
export function DataTable<T>({
  data,
  columns,
  getRowId,
  searchPlaceholder = "Search…",
  searchFn,
  filters = [],
  pageSize = 8,
  selectable = false,
  toolbar,
  bulkActions,
  emptyMessage = "No records found.",
  className,
  tableClassName,
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState("");
  const [filterState, setFilterState] = React.useState<Record<string, string>>({});
  const [sort, setSort] = React.useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = React.useState(0);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = data.filter((row) => {
      if (q && searchFn && !searchFn(row, q)) return false;
      return filters.every((f) => {
        if (f.dependsOn) {
          const parentVal = filterState[f.dependsOn.key];
          if (!parentVal || parentVal === ALL) {
            return true;
          }
        }
        const v = filterState[f.key];
        return !v || v === ALL || f.getValue(row) === v;
      });
    });
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sortValue) {
        const sv = col.sortValue;
        rows = [...rows].sort((a, b) => {
          const av = sv(a);
          const bv = sv(b);
          const cmp = av < bv ? -1 : av > bv ? 1 : 0;
          return sort.dir === "asc" ? cmp : -cmp;
        });
      }
    }
    return rows;
  }, [data, query, searchFn, filters, filterState, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const allOnPageSelected =
    pageRows.length > 0 && pageRows.every((r) => selected.has(getRowId(r)));

  const toggleAllOnPage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      pageRows.forEach((r) =>
        allOnPageSelected ? next.delete(getRowId(r)) : next.add(getRowId(r))
      );
      return next;
    });
  };

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleSort = (key: string) =>
    setSort((s) =>
      !s || s.key !== key
        ? { key, dir: "asc" }
        : s.dir === "asc"
          ? { key, dir: "desc" }
          : null
    );

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Toolbar */}
      <div className="flex flex-col gap-2 px-6 pb-5 lg:flex-row lg:items-center">
        {searchFn && (
          <div className="relative w-full sm:w-72 lg:w-72 shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-[4px] border border-brand/18 bg-white pl-9 pr-3 text-xs font-medium text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.05)] outline-none transition-colors placeholder:font-normal placeholder:text-muted-foreground/85 hover:border-brand/30 focus:border-ring focus:bg-white focus:ring-3 focus:ring-ring/20"
            />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          {filters.map((f) => {
            if (f.dependsOn) {
              const parentVal = filterState[f.dependsOn.key];
              if (!parentVal || parentVal === ALL) {
                return null;
              }
            }

            const currentOptions =
              (f.dependsOn?.getOptions
                ? f.dependsOn.getOptions(filterState[f.dependsOn.key] || "")
                : f.options) || [];

            const isCampus =
              f.key.toLowerCase().includes("campus") ||
              f.label.toLowerCase().includes("campus");

            const formatOptLabel = (raw: string) => {
              if (isCampus) {
                if (/^Main(\s+Campus)?(\s*[-—–]\s*Gulberg)?$/i.test(raw) || /^Gulberg$/i.test(raw)) {
                  return "Main Campus";
                }
                return raw
                  .replace(/\s*[-—–]\s*Gulberg$/i, "")
                  .replace(/\s+Campus$/i, "")
                  .replace(/^Campus\s+/i, "")
                  .trim();
              }
              return raw;
            };

            const defaultAllLabel = f.allLabel
              ? f.allLabel
              : f.label.toLowerCase() === "class"
                ? "All Class"
                : f.label.toLowerCase() === "section"
                  ? "All Sections"
                  : f.label.toLowerCase() === "department"
                    ? "All Departments"
                    : f.label.toLowerCase() === "category"
                      ? "All Categories"
                      : `All ${f.label}`;

            const items = [
              { value: ALL, label: defaultAllLabel },
              ...currentOptions.map((o) =>
                typeof o === "string"
                  ? { value: o, label: formatOptLabel(o) }
                  : { value: o.value, label: o.label }
              ),
            ];

            const selectNode = (
              <Select
                key={f.key}
                items={items}
                value={filterState[f.key] ?? ALL}
                onValueChange={(v) => {
                  setFilterState((s) => {
                    const next = { ...s, [f.key]: String(v) };
                    filters.forEach((other) => {
                      if (other.dependsOn?.key === f.key) {
                        delete next[other.key];
                      }
                    });
                    return next;
                  });
                  setPage(0);
                }}
              >
                <SelectTrigger
                  className={cn(
                    "h-9! w-[140px] rounded-[4px] border-brand/18 bg-white text-xs font-medium shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.05)] hover:border-brand/30",
                    f.className,
                    f.triggerClassName
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="min-w-[var(--anchor-width)] w-auto max-w-[220px]">
                  {items.map((it) => (
                    <SelectItem key={it.value} value={it.value}>
                      {it.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );

            if (f.dependsOn) {
              return (
                <div
                  key={f.key}
                  className="animate-in fade-in-0 slide-in-from-left-3 zoom-in-95 duration-200 ease-out fill-mode-forwards"
                >
                  {selectNode}
                </div>
              );
            }

            return selectNode;
          })}
          {selectable && selected.size > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-brand-50 py-1 pl-3 pr-1 text-xs font-medium text-brand">
              {selected.size} selected
              {bulkActions?.(Array.from(selected))}
            </div>
          )}
          {toolbar}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin-light">
        <table className={cn("w-full text-sm", tableClassName ?? "min-w-[720px] table-fixed")}>
          <thead>
            <tr className="border-y border-[#dbe4f0] bg-gradient-to-b from-[#f8fafd] via-[#f4f7fc] to-[#eef3fa] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.95)]">
              {selectable && (
                <th className="relative w-11 py-3.5 pl-5 pr-2 after:pointer-events-none after:absolute after:right-0 after:top-1/2 after:h-4 after:w-px after:-translate-y-1/2 after:bg-[#d8e2f0]">
                  <Checkbox
                    checked={allOnPageSelected}
                    onCheckedChange={toggleAllOnPage}
                    aria-label="Select all rows on page"
                  />
                </th>
              )}
              {columns.map((col) => {
                const active = Boolean(col.sortValue && sort?.key === col.key);
                const headerAlign =
                  col.headerAlign ??
                  (col.headerClassName?.includes("text-center")
                    ? "center"
                    : col.headerClassName?.includes("text-right")
                    ? "right"
                    : col.headerClassName?.includes("text-left")
                    ? "left"
                    : col.align ??
                      (col.className?.includes("text-center")
                        ? "center"
                        : col.className?.includes("text-right")
                        ? "right"
                        : "left"));
                const isCenter = headerAlign === "center";
                const isRight = headerAlign === "right";

                return (
                  <th
                    key={col.key}
                    className={cn(
                      "relative whitespace-nowrap px-5 py-3.5 align-middle select-none not-last:after:pointer-events-none not-last:after:absolute not-last:after:right-0 not-last:after:top-1/2 not-last:after:h-4 not-last:after:w-px not-last:after:-translate-y-1/2 not-last:after:bg-[#d8e2f0]",
                      isCenter ? "text-center" : isRight ? "text-right" : "text-left",
                      active &&
                        "bg-[#e8f0fe]/45 before:pointer-events-none before:absolute before:inset-x-3 before:bottom-0 before:h-[2px] before:rounded-full before:bg-[#1d4ed8]",
                      col.headerClassName
                    )}
                  >
                    {col.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={cn(
                          "group/th inline-flex cursor-pointer items-center gap-1.5 rounded-lg py-0.5 transition-colors",
                          isCenter
                            ? "w-full justify-center text-center"
                            : isRight
                            ? "w-full justify-end text-right"
                            : "text-left",
                          active
                            ? "text-[#091d3e]"
                            : "text-[#1e293b] hover:text-[#091d3e]"
                        )}
                      >
                        {col.icon && (
                          <col.icon
                            className={cn(
                              "size-3.5 shrink-0 transition-colors",
                              active
                                ? "text-[#1d4ed8]"
                                : "text-[#091d3e]/55 group-hover/th:text-[#091d3e]"
                            )}
                          />
                        )}
                        <span className="text-[12.5px] font-bold tracking-[-0.01em]">
                          {col.header}
                        </span>
                        <span
                          className={cn(
                            "grid size-4 shrink-0 place-items-center rounded transition-all duration-150",
                            active
                              ? "text-[#1d4ed8]"
                              : "text-[#94a3b8] group-hover/th:text-[#091d3e]"
                          )}
                        >
                          {!active ? (
                            <ChevronsUpDown className="size-3.5" strokeWidth={2} />
                          ) : sort?.dir === "asc" ? (
                            <ArrowUp className="size-3" strokeWidth={2.4} />
                          ) : (
                            <ArrowDown className="size-3" strokeWidth={2.4} />
                          )}
                        </span>
                      </button>
                    ) : (
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 py-0.5 text-[#1e293b]",
                          isCenter
                            ? "w-full justify-center text-center"
                            : isRight
                            ? "w-full justify-end text-right"
                            : ""
                        )}
                      >
                        {typeof col.header === "string" ? (
                          <>
                            {col.icon && (
                              <col.icon className="size-3.5 text-[#091d3e]/60 shrink-0" />
                            )}
                            <span className="text-[12.5px] font-bold tracking-[-0.01em]">
                              {col.header}
                            </span>
                          </>
                        ) : (
                          col.header
                        )}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-16">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Inbox className="size-8 opacity-50" />
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
            {pageRows.map((row) => {
              const id = getRowId(row);
              const isSel = selected.has(id);
              return (
                <tr
                  key={id}
                  className={cn(
                    "h-[61px] transition-colors hover:bg-cream/60",
                    isSel && "bg-brand-50/60"
                  )}
                >
                  {selectable && (
                    <td className="py-3 pl-5">
                      <Checkbox
                        checked={isSel}
                        onCheckedChange={() => toggleRow(id)}
                        aria-label="Select row"
                      />
                    </td>
                  )}
                  {columns.map((col) => {
                    const cellAlign =
                      col.align ??
                      (col.className?.includes("text-center")
                        ? "center"
                        : col.className?.includes("text-right")
                        ? "right"
                        : col.className?.includes("text-left")
                        ? "left"
                        : col.headerAlign === "center"
                        ? "left"
                        : col.headerClassName?.includes("text-center")
                        ? "center"
                        : col.headerClassName?.includes("text-right")
                        ? "right"
                        : "left");
                    return (
                      <td
                        key={col.key}
                        className={cn(
                          "overflow-hidden px-5 py-3 align-middle",
                          cellAlign === "center" && "text-center",
                          cellAlign === "right" && "text-right",
                          col.className
                        )}
                      >
                        {col.cell(row)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {/* Filler rows so card height and column widths remain 100% constant on partial pages */}
            {pageRows.length > 0 &&
              pageRows.length < pageSize &&
              Array.from({ length: pageSize - pageRows.length }).map((_, idx) => (
                <tr
                  key={`filler-row-${idx}`}
                  aria-hidden="true"
                  className={cn(
                    "h-[61px] select-none pointer-events-none",
                    idx === 0 ? "border-border/60" : "border-transparent"
                  )}
                >
                  {selectable && (
                    <td className="h-[61px] py-3 pl-5 border-none">
                      <div className="size-4 invisible" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={`filler-cell-${idx}-${col.key}`}
                      className={cn("h-[61px] px-5 py-3 border-none", col.className)}
                    >
                      <div className="h-[37px] invisible select-none">&nbsp;</div>
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 border-t border-border/70 px-6 py-3.5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 tabular-nums select-none">
          <span>Showing</span>
          <span className="inline-flex h-6 w-[52px] shrink-0 items-center justify-center rounded-[3px] border border-brand/15 bg-white font-semibold tabular-nums text-foreground shadow-2xs">
            {filtered.length === 0 ? 0 : safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, filtered.length)}
          </span>
          <span>
            of <strong className="font-semibold text-foreground">{filtered.length}</strong> entries
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <PagerButton disabled={safePage === 0} onClick={() => setPage(safePage - 1)} label="Previous page">
            <ChevronLeft className="size-3.5" />
          </PagerButton>
          {Array.from({ length: pageCount }, (_, i) => i)
            .filter((i) => i === 0 || i === pageCount - 1 || Math.abs(i - safePage) <= 1)
            .map((i, idx, arr) => (
              <React.Fragment key={i}>
                {idx > 0 && i - arr[idx - 1] > 1 && (
                  <span className="px-1 text-muted-foreground/60 select-none">…</span>
                )}
                <PagerButton active={i === safePage} onClick={() => setPage(i)} label={`Page ${i + 1}`}>
                  {i + 1}
                </PagerButton>
              </React.Fragment>
            ))}
          <PagerButton
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage(safePage + 1)}
            label="Next page"
          >
            <ChevronRight className="size-3.5" />
          </PagerButton>
        </div>
      </div>
    </div>
  );
}

function PagerButton({
  children,
  onClick,
  disabled,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-[4px] border text-xs font-semibold tabular-nums transition-all select-none cursor-pointer",
        active
          ? "border-[#091d3e] bg-gradient-to-b from-[#16345f] to-[#091d3e] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_2px_4px_rgb(9_29_62/0.25)]"
          : "border-brand/18 bg-white text-foreground/80 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.05)] hover:border-brand/35 hover:bg-brand-50/50 hover:text-brand",
        disabled &&
          "pointer-events-none cursor-not-allowed border-border/50 bg-muted/30 text-muted-foreground/35 shadow-none opacity-60"
      )}
    >
      {children}
    </button>
  );
}
