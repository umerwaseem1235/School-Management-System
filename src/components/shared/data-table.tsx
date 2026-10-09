"use client";

import * as React from "react";
import {
  ArrowDownUp,
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Search,
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
  header: string;
  cell: (row: T) => React.ReactNode;
  /** Returns a primitive used for sorting. Enables sorting when provided. */
  sortValue?: (row: T) => string | number;
  className?: string;
  headerClassName?: string;
}

export interface FilterDef<T> {
  key: string;
  label: string;
  options: string[];
  getValue: (row: T) => string;
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
      <div className="flex flex-col gap-3 px-5 pb-4 lg:flex-row lg:items-center">
        {searchFn && (
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-lg border border-input bg-background/60 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-white focus:ring-3 focus:ring-ring/20"
            />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => {
            const items = [{ value: ALL, label: `All ${f.label}` }, ...f.options.map((o) => ({ value: o, label: o }))];
            return (
              <Select
                key={f.key}
                items={items}
                value={filterState[f.key] ?? ALL}
                onValueChange={(v) => {
                  setFilterState((s) => ({ ...s, [f.key]: String(v) }));
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-9! min-w-36 rounded-lg bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {items.map((it) => (
                    <SelectItem key={it.value} value={it.value}>
                      {it.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          })}
        </div>
        <div className="flex items-center gap-2 lg:ml-auto">
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
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-y border-border/70 bg-muted/60">
              {selectable && (
                <th className="w-10 py-3 pl-5">
                  <Checkbox
                    checked={allOnPageSelected}
                    onCheckedChange={toggleAllOnPage}
                    aria-label="Select all rows on page"
                  />
                </th>
              )}
              {columns.map((col) => {
                const active = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    className={cn(
                      "whitespace-nowrap px-5 py-3 text-left text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground",
                      col.headerClassName
                    )}
                  >
                    {col.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={cn(
                          "inline-flex items-center gap-1 uppercase transition-colors hover:text-brand",
                          active && "text-brand"
                        )}
                      >
                        {col.header}
                        {!active ? (
                          <ArrowDownUp className="size-3 opacity-50" />
                        ) : sort?.dir === "asc" ? (
                          <ArrowUp className="size-3" />
                        ) : (
                          <ArrowDown className="size-3" />
                        )}
                      </button>
                    ) : (
                      col.header
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
                    "transition-colors hover:bg-cream/60",
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
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-5 py-3 align-middle", col.className)}>
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-border/70 px-5 py-3.5 text-xs text-muted-foreground sm:flex-row">
        <p>
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filtered.length === 0 ? 0 : safePage * pageSize + 1}–
            {Math.min((safePage + 1) * pageSize, filtered.length)}
          </span>{" "}
          of <span className="font-semibold text-foreground">{filtered.length}</span> records
        </p>
        <div className="flex items-center gap-1">
          <PagerButton disabled={safePage === 0} onClick={() => setPage(safePage - 1)} label="Previous page">
            <ChevronLeft className="size-4" />
          </PagerButton>
          {Array.from({ length: pageCount }, (_, i) => i)
            .filter((i) => i === 0 || i === pageCount - 1 || Math.abs(i - safePage) <= 1)
            .map((i, idx, arr) => (
              <React.Fragment key={i}>
                {idx > 0 && i - arr[idx - 1] > 1 && <span className="px-1">…</span>}
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
            <ChevronRight className="size-4" />
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
        "grid h-8 min-w-8 place-items-center rounded-lg px-2 text-xs font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40",
        active ? "bg-brand text-cream" : "text-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}
