"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  BookCheck,
  BookOpen,
  BookUp,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  Edit,
  Eye,
  GraduationCap,
  Layers,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { cn } from "@/lib/utils";
import { formatDate, formatNumber } from "@/lib/format";
import {
  INITIAL_LIBRARY_BOOKS,
  INITIAL_LIBRARY_ISSUANCES,
  computeBookStatus,
  getEffectiveIssuanceStatus,
  isLibraryIssuanceOverdue,
  type LibraryBookRecord,
  type LibraryIssuanceRecord,
} from "@/lib/mock/library";
import { LibraryBookFormModal, DeleteLibraryBookModal } from "./library-form-modals";
import {
  AssignBookModal,
  LibraryIssuanceStatusBadge,
  ReturnBookModal,
  ViewIssuanceModal,
} from "./library-issuance-modals";

type LibraryTab = "catalogue" | "issuance";

export function LibraryClient() {
  const searchParams = useSearchParams();
  const initialView =
    searchParams.get("view") === "issuance" ? "issuance" : "catalogue";

  const [activeTab, setActiveTab] = React.useState<LibraryTab>(initialView);
  const [books, setBooks] = React.useState<LibraryBookRecord[]>(
    INITIAL_LIBRARY_BOOKS
  );
  const [issuances, setIssuances] = React.useState<LibraryIssuanceRecord[]>(
    INITIAL_LIBRARY_ISSUANCES
  );
  const [issueSeq, setIssueSeq] = React.useState<number>(
    INITIAL_LIBRARY_ISSUANCES.length + 1
  );

  // Book Catalogue Modals
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingBook, setEditingBook] = React.useState<LibraryBookRecord | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = React.useState<{
    id: string;
    title: string;
  } | null>(null);

  // Book Assignment & Return Modals
  const [assignModalOpen, setAssignModalOpen] = React.useState(false);
  const [preselectedBookId, setPreselectedBookId] = React.useState<
    string | null
  >(null);
  const [returnTarget, setReturnTarget] =
    React.useState<LibraryIssuanceRecord | null>(null);
  const [viewTarget, setViewTarget] =
    React.useState<LibraryIssuanceRecord | null>(null);

  // KPIs for Catalogue
  const catalogueKpis = React.useMemo(() => {
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

  // KPIs for Issuance Register
  const issuanceKpis = React.useMemo(() => {
    const active = issuances.filter((r) => r.status === "Issued");
    const activeCount = active.length;
    const studentActive = active.filter(
      (r) => r.borrowerType === "Student"
    ).length;
    const staffActive = active.filter(
      (r) => r.borrowerType === "Staff"
    ).length;
    const overdueCount = active.filter((r) =>
      isLibraryIssuanceOverdue(r)
    ).length;
    const returnedCount = issuances.filter(
      (r) => r.status === "Returned"
    ).length;
    return {
      activeCount,
      studentActive,
      staffActive,
      overdueCount,
      returnedCount,
    };
  }, [issuances]);

  // Catalogue handlers
  const handleSaveBook = React.useCallback((record: LibraryBookRecord) => {
    setBooks((prev) => {
      const exists = prev.some((b) => b.id === record.id);
      return exists
        ? prev.map((b) => (b.id === record.id ? record : b))
        : [record, ...prev];
    });
  }, []);

  const handleDeleteBook = React.useCallback((id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Open Assign Modal (optionally pre-selecting a specific book)
  const openAssignModal = React.useCallback((bookId: string | null = null) => {
    setPreselectedBookId(bookId);
    setAssignModalOpen(true);
  }, []);

  // Issuance handlers (keep Book Catalogue copy counts synchronized)
  const handleAssignBook = React.useCallback((record: LibraryIssuanceRecord) => {
    setIssuances((prev) => [record, ...prev]);
    setIssueSeq((seq) => seq + 1);
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== record.bookId) return b;
        const nextAvailable = Math.max(0, b.availableCopies - 1);
        return {
          ...b,
          availableCopies: nextAvailable,
          status: computeBookStatus(nextAvailable, b.totalCopies),
        };
      })
    );
  }, []);

  const handleConfirmReturn = React.useCallback(
    (issuanceId: string, returnDate: string, returnRemarks: string) => {
      const target = issuances.find((r) => r.id === issuanceId);
      if (!target || target.status === "Returned") return;

      setIssuances((prev) =>
        prev.map((r) =>
          r.id === issuanceId
            ? {
                ...r,
                status: "Returned",
                returnedDate: returnDate,
                remarks: returnRemarks || r.remarks,
              }
            : r
        )
      );

      setBooks((prev) =>
        prev.map((b) => {
          if (b.id !== target.bookId) return b;
          const nextAvailable = Math.min(b.totalCopies, b.availableCopies + 1);
          return {
            ...b,
            availableCopies: nextAvailable,
            status: computeBookStatus(nextAvailable, b.totalCopies),
          };
        })
      );

      toast.success(
        `Returned "${target.bookTitle}" from ${target.borrowerName}`
      );
    },
    [issuances]
  );

  // Columns: Tab 1 (Book Catalogue)
  const catalogueColumns = React.useMemo<Column<LibraryBookRecord>[]>(
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
        className: "w-[140px]",
      },
      {
        key: "shelf",
        header: "Shelf",
        cell: (r) => (
          <span className="font-mono text-xs text-foreground/70">{r.shelf}</span>
        ),
        sortValue: (r) => r.shelf,
        className: "w-[85px]",
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
        className: "w-[155px]",
        cell: (r) => (
          <div className="flex items-center justify-center gap-1">
            <ActionButton
              tone="info"
              size="xs"
              disabled={r.availableCopies <= 0}
              title={
                r.availableCopies <= 0
                  ? "No copies available to assign"
                  : `Assign "${r.title}" to a borrower`
              }
              onClick={() => openAssignModal(r.id)}
            >
              <BookUp className="h-3 w-3" />
              <span>Assign</span>
            </ActionButton>
            <ActionButton
              tone="outline"
              size="xs"
              title="Edit book details"
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
              title="Delete book"
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
    [openAssignModal]
  );

  const catalogueFilters = React.useMemo<FilterDef<LibraryBookRecord>[]>(
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

  // Columns: Tab 2 (Book Issuance & Assignment)
  const issuanceColumns = React.useMemo<Column<LibraryIssuanceRecord>[]>(
    () => [
      {
        key: "issueCode",
        header: "Issue #",
        cell: (r) => (
          <span className="font-mono text-[11px] font-semibold text-brand/80 whitespace-nowrap">
            {r.issueCode}
          </span>
        ),
        sortValue: (r) => r.issueCode,
        className: "w-[115px]",
      },
      {
        key: "bookTitle",
        header: "Book",
        cell: (r) => (
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground truncate">
              {r.bookTitle}
            </div>
            <div className="text-[10px] text-muted-foreground truncate mt-0.5">
              {r.bookCode}
            </div>
          </div>
        ),
        sortValue: (r) => r.bookTitle,
      },
      {
        key: "borrower",
        header: "Assigned To",
        cell: (r) => (
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground truncate">
              {r.borrowerName}
            </div>
            <div className="text-[10px] text-muted-foreground truncate mt-0.5">
              {r.borrowerType} · {r.borrowerIdentifier}
            </div>
          </div>
        ),
        sortValue: (r) => r.borrowerName,
      },
      {
        key: "issueDate",
        header: "Issue Date",
        cell: (r) => (
          <span className="text-xs text-foreground/80 whitespace-nowrap">
            {formatDate(r.issueDate)}
          </span>
        ),
        sortValue: (r) => r.issueDate,
        className: "w-[110px]",
      },
      {
        key: "dueDate",
        header: "Due Date",
        cell: (r) => {
          const overdue = isLibraryIssuanceOverdue(r);
          return (
            <span
              className={cn(
                "text-xs whitespace-nowrap",
                overdue
                  ? "text-rose-600 font-semibold"
                  : "text-foreground/80"
              )}
            >
              {formatDate(r.dueDate)}
            </span>
          );
        },
        sortValue: (r) => r.dueDate,
        className: "w-[110px]",
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        headerAlign: "center",
        cell: (r) => <LibraryIssuanceStatusBadge record={r} />,
        sortValue: (r) => getEffectiveIssuanceStatus(r),
        className: "w-[110px]",
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        headerAlign: "center",
        className: "w-[125px]",
        cell: (r) => (
          <div className="flex items-center justify-center gap-1">
            {r.status === "Issued" && (
              <ActionButton
                tone="success"
                size="xs"
                title="Mark book as returned"
                onClick={() => setReturnTarget(r)}
              >
                <RotateCcw className="h-3 w-3" />
                <span>Return</span>
              </ActionButton>
            )}
            <ActionButton
              tone="outline"
              size="xs"
              title="View issuance details"
              onClick={() => setViewTarget(r)}
            >
              <Eye className="h-3 w-3" />
            </ActionButton>
          </div>
        ),
      },
    ],
    []
  );

  const issuanceFilters = React.useMemo<FilterDef<LibraryIssuanceRecord>[]>(
    () => [
      {
        key: "status",
        label: "Status",
        allLabel: "All Statuses",
        options: ["Issued", "Overdue", "Returned"],
        getValue: (r) => getEffectiveIssuanceStatus(r),
      },
      {
        key: "borrowerType",
        label: "Borrower",
        allLabel: "All Borrowers",
        options: ["Student", "Staff"],
        getValue: (r) => r.borrowerType,
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Library"
        className="mb-0 lg:mb-0"
        actions={
          <>
            <ActionButton
              tone={activeTab === "issuance" ? "primary" : "outline"}
              size="md"
              onClick={() => openAssignModal(null)}
            >
              <BookCheck />
              <span>Assign Book</span>
            </ActionButton>
            <ActionButton
              tone={activeTab === "catalogue" ? "primary" : "outline"}
              size="md"
              onClick={() => {
                setEditingBook(null);
                setFormOpen(true);
              }}
            >
              <Plus />
              <span>Add Book</span>
            </ActionButton>
          </>
        }
      />

      {/* Context-aware Executive KPI Cards */}
      {activeTab === "catalogue" ? (
        <StatGrid>
          <StatCard
            icon={BookOpen}
            label="Total Titles"
            value={formatNumber(catalogueKpis.totalTitles)}
            title={`${catalogueKpis.totalTitles} distinct titles in catalogue`}
          />
          <StatCard
            icon={Layers}
            label="Total Copies"
            value={formatNumber(catalogueKpis.totalCopies)}
            title={`${formatNumber(catalogueKpis.totalCopies)} total copies`}
          />
          <StatCard
            icon={CheckCircle2}
            label="Available"
            value={formatNumber(catalogueKpis.availableCopies)}
            title={`${formatNumber(catalogueKpis.availableCopies)} copies available on shelf`}
          />
          <StatCard
            icon={BookUp}
            label="Issued"
            value={formatNumber(catalogueKpis.issuedCopies)}
            title={`${catalogueKpis.outOfStock} out of stock · ${catalogueKpis.lowStock} low stock`}
          />
        </StatGrid>
      ) : (
        <StatGrid>
          <StatCard
            icon={BookCheck}
            label="Active Issuances"
            value={formatNumber(issuanceKpis.activeCount)}
            title="Books currently checked out to borrowers"
          />
          <StatCard
            icon={GraduationCap}
            label="Student Loans"
            value={formatNumber(issuanceKpis.studentActive)}
            title={`${issuanceKpis.staffActive} staff / faculty loans active`}
          />
          <StatCard
            icon={RotateCcw}
            label="Returned"
            value={formatNumber(issuanceKpis.returnedCount)}
            title="Completed book returns logged"
          />
          <StatCard
            icon={CalendarClock}
            label="Overdue Books"
            value={formatNumber(issuanceKpis.overdueCount)}
            className={
              issuanceKpis.overdueCount > 0
                ? "border-rose-300/80 bg-rose-50/30 ring-1 ring-rose-200"
                : undefined
            }
            title="Books past their expected return due date"
          />
        </StatGrid>
      )}

      {/* Executive Module Section Dropdown Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Select Library Section"
            className="group inline-flex h-9 min-w-[235px] items-center justify-between gap-2.5 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 px-3 text-xs font-semibold text-foreground shadow-2xs hover:border-slate-300 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer select-none"
          >
            <div className="flex items-center gap-2 min-w-0">
              {activeTab === "catalogue" ? (
                <BookOpen className="size-4 text-[#091d3e] shrink-0" />
              ) : (
                <BookCheck className="size-4 text-[#091d3e] shrink-0" />
              )}
              <span className="truncate">
                {activeTab === "catalogue"
                  ? "Book Catalogue"
                  : "Book Issuance & Assignment"}
              </span>
            </div>
            <ChevronDown className="size-3.5 text-muted-foreground transition-transform duration-200 group-data-[popup-open]:rotate-180 shrink-0" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="w-64 p-1 rounded-xl shadow-lg border border-slate-200 bg-white text-popover-foreground animate-in fade-in-50 zoom-in-95 duration-100"
          >
            <DropdownMenuItem
              onClick={() => setActiveTab("catalogue")}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs cursor-pointer transition-colors outline-none",
                activeTab === "catalogue"
                  ? "bg-slate-100 font-semibold text-foreground"
                  : "hover:bg-slate-50 text-slate-700 font-medium"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <BookOpen className="size-4 text-slate-500 shrink-0" />
                <span className="truncate">Book Catalogue</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-mono text-[10.5px] font-bold rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                  {books.length}
                </span>
                {activeTab === "catalogue" && (
                  <Check className="size-3.5 text-foreground" />
                )}
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setActiveTab("issuance")}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs cursor-pointer transition-colors outline-none",
                activeTab === "issuance"
                  ? "bg-slate-100 font-semibold text-foreground"
                  : "hover:bg-slate-50 text-slate-700 font-medium"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <BookCheck className="size-4 text-slate-500 shrink-0" />
                <span className="truncate">Book Issuance &amp; Assignment</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-mono text-[10.5px] font-bold rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                  {issuanceKpis.activeCount}
                </span>
                {activeTab === "issuance" && (
                  <Check className="size-3.5 text-foreground" />
                )}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Right Context / Health Pill */}
        <div className="flex items-center gap-2 pr-1">
          {activeTab === "catalogue" ? (
            catalogueKpis.outOfStock > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/90 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 shadow-2xs">
                <AlertTriangle className="size-3.5 text-amber-600" />
                {catalogueKpis.outOfStock} Title
                {catalogueKpis.outOfStock > 1 ? "s" : ""} Out of Stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/90 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 shadow-2xs">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                All Titles In Stock
              </span>
            )
          ) : issuanceKpis.overdueCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/90 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-800 shadow-2xs">
              <CalendarClock className="size-3.5 text-rose-600" />
              {issuanceKpis.overdueCount} Overdue Return
              {issuanceKpis.overdueCount > 1 ? "s" : ""}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/90 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 shadow-2xs">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              All Loans On Schedule
            </span>
          )}
        </div>
      </div>

      {/* Tab 1: Book Catalogue */}
      {activeTab === "catalogue" && (
        <SectionCard flush contentClassName="pt-5">
          <DataTable<LibraryBookRecord>
            data={books}
            columns={catalogueColumns}
            getRowId={(r) => r.id}
            filters={catalogueFilters}
            tableClassName="min-w-[920px]"
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
      )}

      {/* Tab 2: Book Issuance & Assignment Register */}
      {activeTab === "issuance" && (
        <SectionCard flush contentClassName="pt-5">
          <DataTable<LibraryIssuanceRecord>
            data={issuances}
            columns={issuanceColumns}
            getRowId={(r) => r.id}
            filters={issuanceFilters}
            tableClassName="min-w-[840px]"
            searchFn={(r, q) => {
              const lower = q.toLowerCase();
              return (
                r.issueCode.toLowerCase().includes(lower) ||
                r.bookTitle.toLowerCase().includes(lower) ||
                r.bookCode.toLowerCase().includes(lower) ||
                r.borrowerName.toLowerCase().includes(lower) ||
                r.borrowerIdentifier.toLowerCase().includes(lower) ||
                r.campus.toLowerCase().includes(lower)
              );
            }}
            searchPlaceholder="Search issue #, book or borrower…"
            pageSize={10}
            emptyMessage="No book issuance records match your search."
          />
        </SectionCard>
      )}

      {/* Book Add / Edit Modal */}
      <LibraryBookFormModal
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditingBook(null);
        }}
        totalCount={books.length}
        initialData={editingBook}
        onSave={handleSaveBook}
      />

      {/* Delete Book Confirmation */}
      {deleteTarget && (
        <DeleteLibraryBookModal
          open={true}
          onOpenChange={(v) => {
            if (!v) setDeleteTarget(null);
          }}
          bookName={deleteTarget.title}
          onConfirm={() => {
            handleDeleteBook(deleteTarget.id);
            setDeleteTarget(null);
          }}
        />
      )}

      {/* Assign Book Modal */}
      <AssignBookModal
        open={assignModalOpen}
        onOpenChange={(v) => {
          setAssignModalOpen(v);
          if (!v) setPreselectedBookId(null);
        }}
        books={books}
        preselectedBookId={preselectedBookId}
        nextIssueNumber={issueSeq}
        onAssign={handleAssignBook}
      />

      {/* Return Book Modal */}
      <ReturnBookModal
        open={Boolean(returnTarget)}
        onOpenChange={(v) => {
          if (!v) setReturnTarget(null);
        }}
        record={returnTarget}
        onConfirmReturn={handleConfirmReturn}
      />

      {/* View & Print Issue Slip Modal */}
      <ViewIssuanceModal
        open={Boolean(viewTarget)}
        onOpenChange={(v) => {
          if (!v) setViewTarget(null);
        }}
        record={viewTarget}
        onRequestReturn={(rec) => setReturnTarget(rec)}
      />
    </div>
  );
}
