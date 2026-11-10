"use client";

import * as React from "react";
import { BookOpen, Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import {
  DataTable,
  type Column,
  type FilterDef,
} from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionButton } from "@/components/shared/action-button";
import { formatNumber } from "@/lib/format";
import {
  INITIAL_LIBRARY_BOOKS,
  type LibraryBookRecord,
} from "@/lib/mock/library";
import { LibraryBookFormModal, DeleteLibraryBookModal } from "./library-form-modals";

export function LibraryClient() {
  const [books, setBooks] = React.useState<LibraryBookRecord[]>(
    INITIAL_LIBRARY_BOOKS
  );

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingBook, setEditingBook] = React.useState<LibraryBookRecord | null>(
    null
  );

  const [deleteTarget, setDeleteTarget] = React.useState<{
    id: string;
    title: string;
  } | null>(null);

  const kpis = React.useMemo(() => {
    const totalTitles = books.length;
    const totalCopies = books.reduce((s, b) => s + b.totalCopies, 0);
    const availableCopies = books.reduce((s, b) => s + b.availableCopies, 0);
    const issuedCopies = totalCopies - availableCopies;
    const outOfStock = books.filter((b) => b.status === "Out of Stock").length;
    const lowStock = books.filter((b) => b.status === "Low Stock").length;
    return {
      totalTitles,
      totalCopies,
      availableCopies,
      issuedCopies,
      outOfStock,
      lowStock,
    };
  }, [books]);

  const handleSave = React.useCallback((record: LibraryBookRecord) => {
    setBooks((prev) => {
      const exists = prev.some((b) => b.id === record.id);
      return exists
        ? prev.map((b) => (b.id === record.id ? record : b))
        : [record, ...prev];
    });
  }, []);

  const handleDelete = React.useCallback((id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const columns = React.useMemo<Column<LibraryBookRecord>[]>(
    () => [
      {
        key: "bookCode",
        header: "Code",
        cell: (r) => (
          <span className="font-mono text-[11px] font-semibold text-brand/80">
            {r.bookCode}
          </span>
        ),
        sortValue: (r) => r.bookCode,
        className: "w-[90px]",
      },
      {
        key: "title",
        header: "Title / Author",
        cell: (r) => (
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground truncate">
              {r.title}
            </div>
            <div className="text-[10px] text-muted-foreground truncate mt-0.5">
              {r.author}
            </div>
          </div>
        ),
        sortValue: (r) => r.title,
      },
      {
        key: "category",
        header: "Category",
        cell: (r) => (
          <span className="text-xs text-foreground/80">{r.category}</span>
        ),
        sortValue: (r) => r.category,
      },
      {
        key: "copies",
        header: "Copies (Avail / Total)",
        align: "center",
        headerAlign: "center",
        cell: (r) => (
          <div className="flex flex-col items-center">
            <span className="font-mono text-sm font-extrabold tabular-nums text-[#091d3e]">
              {r.availableCopies} / {r.totalCopies}
            </span>
          </div>
        ),
        sortValue: (r) => r.availableCopies,
        className: "w-[130px]",
      },
      {
        key: "shelf",
        header: "Shelf",
        cell: (r) => (
          <span className="font-mono text-xs text-foreground/70">{r.shelf}</span>
        ),
        sortValue: (r) => r.shelf,
        className: "w-[90px]",
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        headerAlign: "center",
        cell: (r) => (
          <StatusBadge
            status={r.status}
            tone={
              r.status === "Available"
                ? "success"
                : r.status === "Low Stock"
                ? "warning"
                : "danger"
            }
          />
        ),
        sortValue: (r) => r.status,
        className: "w-[120px]",
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        headerAlign: "center",
        className: "w-[100px]",
        cell: (r) => (
          <div className="flex items-center justify-center gap-1">
            <ActionButton
              tone="outline"
              size="xs"
              onClick={() => {
                setEditingBook(r);
                setFormOpen(true);
              }}
            >
              <Edit className="h-3 w-3" />
            </ActionButton>
            <ActionButton
              tone="danger"
              size="xs"
              onClick={() =>
                setDeleteTarget({ id: r.id, title: r.title })
              }
            >
              <Trash2 className="h-3 w-3" />
            </ActionButton>
          </div>
        ),
      },
    ],
    []
  );

  const filters = React.useMemo<FilterDef<LibraryBookRecord>[]>(
    () => [
      {
        key: "category",
        label: "Category",
        allLabel: "All Categories",
        options: [...new Set(books.map((b) => b.category))],
        getValue: (r: LibraryBookRecord) => r.category,
      },
      {
        key: "status",
        label: "Status",
        allLabel: "All Statuses",
        options: ["Available", "Low Stock", "Out of Stock"],
        getValue: (r: LibraryBookRecord) => r.status,
      },
    ],
    [books]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Library Catalogue"
        className="mb-0 lg:mb-0"
        actions={
          <ActionButton
            tone="primary"
            size="md"
            onClick={() => {
              setEditingBook(null);
              setFormOpen(true);
            }}
          >
            <Plus />
            <span>Add Book</span>
          </ActionButton>
        }
      />

      <StatGrid>
        <StatCard
          icon={BookOpen}
          label="Total Titles"
          value={formatNumber(kpis.totalTitles)}
          title={`${kpis.totalTitles} distinct titles in catalogue`}
        />
        <StatCard
          icon={BookOpen}
          label="Total Copies"
          value={formatNumber(kpis.totalCopies)}
          title={`${formatNumber(kpis.totalCopies)} total copies`}
        />
        <StatCard
          icon={BookOpen}
          label="Available"
          value={formatNumber(kpis.availableCopies)}
          title={`${formatNumber(kpis.availableCopies)} copies available`}
        />
        <StatCard
          icon={BookOpen}
          label="Issued"
          value={formatNumber(kpis.issuedCopies)}
          title={`${kpis.outOfStock} out of stock · ${kpis.lowStock} low stock`}
        />
      </StatGrid>

      <SectionCard flush contentClassName="pt-5">
        <DataTable<LibraryBookRecord>
          data={books}
          columns={columns}
          getRowId={(r) => r.id}
          filters={filters}
          searchFn={(r, q) => {
            const lower = q.toLowerCase();
            return (
              r.title.toLowerCase().includes(lower) ||
              r.author.toLowerCase().includes(lower) ||
              r.bookCode.toLowerCase().includes(lower) ||
              r.category.toLowerCase().includes(lower) ||
              r.isbn.toLowerCase().includes(lower)
            );
          }}
          searchPlaceholder="Search title, author, code or ISBN…"
          pageSize={10}
          emptyMessage="No books match your search."
        />
      </SectionCard>

      <LibraryBookFormModal
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditingBook(null);
        }}
        totalCount={books.length}
        initialData={editingBook}
        onSave={handleSave}
      />

      {deleteTarget && (
        <DeleteLibraryBookModal
          open={true}
          onOpenChange={(v) => {
            if (!v) setDeleteTarget(null);
          }}
          bookName={deleteTarget.title}
          onConfirm={() => {
            handleDelete(deleteTarget.id);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}
