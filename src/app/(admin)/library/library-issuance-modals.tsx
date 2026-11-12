"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  BookCheck,
  BookOpen,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  Printer,
  RotateCcw,
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
import { formatDate, formatNumber } from "@/lib/format";
import { printHtml } from "@/lib/print-html";
import { CAMPUS_NAMES, STUDENTS } from "@/lib/mock/institution";
import { STAFF_MEMBERS } from "@/lib/mock/staff";
import {
  LIBRARY_TODAY,
  addDaysToIso,
  computeBookStatus,
  getEffectiveIssuanceStatus,
  isLibraryIssuanceOverdue,
  type LibraryBookRecord,
  type LibraryBorrowerType,
  type LibraryIssuanceRecord,
} from "@/lib/mock/library";

const fieldClass =
  "h-10 w-full rounded-lg border border-border/90 bg-white px-3.5 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15";

const labelClass = "block text-[11px] font-semibold text-foreground/80 mb-1.5";

const toggleClass =
  "inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-[#091d3e] transition-colors hover:bg-slate-200/80 cursor-pointer";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function diffDaysIso(fromIso: string, toIso: string): number {
  const a = fromIso.split("-").map(Number);
  const b = toIso.split("-").map(Number);
  if (a.length !== 3 || b.length !== 3) return 0;
  const msA = Date.UTC(a[0], a[1] - 1, a[2]);
  const msB = Date.UTC(b[0], b[1] - 1, b[2]);
  return Math.max(0, Math.round((msB - msA) / 86400000));
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Shared: Library Issuance Status Badge                                      */
/* ────────────────────────────────────────────────────────────────────────── */

export function LibraryIssuanceStatusBadge({
  record,
}: {
  record: LibraryIssuanceRecord;
}) {
  const effective = getEffectiveIssuanceStatus(record);
  const tone =
    effective === "Returned"
      ? "success"
      : effective === "Overdue"
      ? "danger"
      : "brand";
  return <StatusBadge status={effective} tone={tone} />;
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 1. Assign Book Modal                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

interface AssignBookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  books: LibraryBookRecord[];
  /** Pre-selects a book when clicked from a Catalogue row's "Assign" button. */
  preselectedBookId?: string | null;
  nextIssueNumber: number;
  onAssign: (record: LibraryIssuanceRecord) => void;
}

export function AssignBookModal({
  open,
  onOpenChange,
  books,
  preselectedBookId,
  nextIssueNumber,
  onAssign,
}: AssignBookModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <AssignBookDialogContent
          key={`${preselectedBookId ?? "none"}-${nextIssueNumber}`}
          books={books}
          preselectedBookId={preselectedBookId}
          nextIssueNumber={nextIssueNumber}
          onClose={() => onOpenChange(false)}
          onAssign={onAssign}
        />
      )}
    </Dialog>
  );
}

function AssignBookDialogContent({
  books,
  preselectedBookId,
  nextIssueNumber,
  onClose,
  onAssign,
}: {
  books: LibraryBookRecord[];
  preselectedBookId?: string | null;
  nextIssueNumber: number;
  onClose: () => void;
  onAssign: (record: LibraryIssuanceRecord) => void;
}) {
  const activeStudents = React.useMemo(
    () => STUDENTS.filter((s) => s.status === "Active"),
    []
  );
  const activeStaff = React.useMemo(
    () => STAFF_MEMBERS.filter((s) => s.status === "Active"),
    []
  );

  const [bookId, setBookId] = React.useState(() => {
    const firstIssuable = books.find(
      (b) => b.availableCopies > 0 && b.category !== "Reference"
    );
    const fallbackAvailable = books.find((b) => b.availableCopies > 0);
    const chosenBook =
      (preselectedBookId &&
        books.find((b) => b.id === preselectedBookId && b.availableCopies > 0)) ||
      firstIssuable ||
      fallbackAvailable ||
      null;
    return chosenBook?.id ?? "";
  });

  const [borrowerType, setBorrowerType] =
    React.useState<LibraryBorrowerType>("Student");

  const [isManualBorrower, setIsManualBorrower] = React.useState(false);
  const [selectedBorrowerId, setSelectedBorrowerId] = React.useState(
    () => activeStudents[0]?.id ?? ""
  );
  const [manualName, setManualName] = React.useState("");
  const [manualIdentifier, setManualIdentifier] = React.useState("");
  const [manualCampus, setManualCampus] = React.useState(
    CAMPUS_NAMES[0] ?? "Main Campus — Gulberg"
  );

  const [issueDate, setIssueDate] = React.useState(LIBRARY_TODAY);
  const [dueDate, setDueDate] = React.useState(() =>
    addDaysToIso(LIBRARY_TODAY, 14)
  );
  const [issuedBy, setIssuedBy] = React.useState("Librarian");
  const [remarks, setRemarks] = React.useState("");

  const handleBorrowerTypeSwitch = (nextType: LibraryBorrowerType) => {
    setBorrowerType(nextType);
    setIsManualBorrower(false);
    if (nextType === "Student") {
      setSelectedBorrowerId(activeStudents[0]?.id ?? "");
      setDueDate(addDaysToIso(issueDate, 14));
    } else {
      setSelectedBorrowerId(activeStaff[0]?.id ?? "");
      setDueDate(addDaysToIso(issueDate, 30));
    }
  };

  const selectedBook = books.find((b) => b.id === bookId) ?? null;
  const available = selectedBook?.availableCopies ?? 0;
  const remaining = Math.max(0, available - 1);
  const remainingStatus = selectedBook
    ? computeBookStatus(remaining, selectedBook.totalCopies)
    : "Available";

  const selectedStudent =
    borrowerType === "Student" && !isManualBorrower
      ? activeStudents.find((s) => s.id === selectedBorrowerId) ?? null
      : null;

  const selectedStaff =
    borrowerType === "Staff" && !isManualBorrower
      ? activeStaff.find((s) => s.id === selectedBorrowerId) ?? null
      : null;

  const resolvedName = isManualBorrower
    ? manualName.trim()
    : borrowerType === "Student"
    ? selectedStudent?.name ?? ""
    : selectedStaff?.name ?? "";

  const resolvedIdentifier = isManualBorrower
    ? manualIdentifier.trim() ||
      (borrowerType === "Student" ? "External / Walk-in" : "Staff Member")
    : borrowerType === "Student" && selectedStudent
    ? `${selectedStudent.className}-${selectedStudent.section} · Roll ${selectedStudent.rollNo}`
    : borrowerType === "Staff" && selectedStaff
    ? `${selectedStaff.empCode} · ${selectedStaff.department}`
    : "";

  const resolvedCampus = isManualBorrower
    ? manualCampus
    : borrowerType === "Student"
    ? selectedStudent?.campus ?? CAMPUS_NAMES[0]
    : selectedStaff?.campus ?? CAMPUS_NAMES[0];

  const canAssign =
    Boolean(selectedBook) &&
    available > 0 &&
    Boolean(resolvedName) &&
    Boolean(issueDate) &&
    Boolean(dueDate) &&
    dueDate >= issueDate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) {
      toast.error("Please select a book to assign.");
      return;
    }
    if (selectedBook.availableCopies <= 0) {
      toast.error(`"${selectedBook.title}" currently has no available copies.`);
      return;
    }
    if (!resolvedName) {
      toast.error("Please select or enter the borrower's name.");
      return;
    }
    if (!dueDate || dueDate < issueDate) {
      toast.error("Due date must be on or after the issue date.");
      return;
    }

    const issueCode = `ISS-2026-${String(nextIssueNumber).padStart(3, "0")}`;
    const record: LibraryIssuanceRecord = {
      id: `lib-iss-seq-${nextIssueNumber}`,
      issueCode,
      bookId: selectedBook.id,
      bookCode: selectedBook.bookCode,
      bookTitle: selectedBook.title,
      bookAuthor: selectedBook.author,
      bookCategory: selectedBook.category,
      shelf: selectedBook.shelf,
      borrowerType,
      borrowerId: isManualBorrower
        ? `manual-${nextIssueNumber}`
        : selectedBorrowerId,
      borrowerName: resolvedName,
      borrowerIdentifier: resolvedIdentifier,
      campus: resolvedCampus,
      issueDate,
      dueDate,
      returnedDate: "",
      issuedBy: issuedBy.trim() || "Librarian",
      remarks: remarks.trim() || "Issued from library circulation desk",
      status: "Issued",
    };

    onAssign(record);
    onClose();
    toast.success(
      `Assigned "${selectedBook.title}" to ${resolvedName} (${record.issueCode})`
    );
  };

  return (
    <DialogContent className="flex max-h-[92vh] flex-col sm:max-w-2xl gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
      <DialogHeader className="shrink-0 gap-1 border-b border-border/60 bg-gradient-to-r from-slate-50/90 via-white to-white px-6 py-4.5">
        <div className="flex items-center gap-3 pr-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10">
            <BookCheck className="h-4 w-4 text-brand" />
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-base font-bold leading-tight text-foreground">
              Assign Book to Borrower
            </DialogTitle>
            <DialogDescription className="text-[11.5px] text-muted-foreground mt-0.5">
              Issue an available library title to a student or faculty member and set a return due date.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Live Copy Math Card */}
          <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50/70 shadow-2xs">
            <div className="grid grid-cols-3 divide-x divide-border/70">
              <div className="px-4 py-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Available Copies
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-mono text-xl font-extrabold tabular-nums text-[#091d3e]">
                    {formatNumber(available)}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    / {selectedBook?.totalCopies ?? 0} total
                  </span>
                </div>
              </div>

              <div className="px-4 py-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Assigning Now
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <ArrowDownRight className="size-4 shrink-0 text-brand self-center" />
                  <span className="font-mono text-xl font-extrabold tabular-nums text-brand">
                    −1
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Copy
                  </span>
                </div>
              </div>

              <div
                className={cn(
                  "px-4 py-3 transition-colors",
                  available <= 0
                    ? "bg-rose-50/70"
                    : remainingStatus === "Out of Stock"
                    ? "bg-rose-50/60"
                    : remainingStatus === "Low Stock"
                    ? "bg-amber-50/60"
                    : "bg-emerald-50/60"
                )}
              >
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#091d3e]">
                  Remaining Shelf Stock
                </span>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-xl font-extrabold tabular-nums text-[#091d3e]">
                    {selectedBook && available > 0
                      ? formatNumber(remaining)
                      : "0"}
                  </span>
                  <StatusBadge
                    status={
                      !selectedBook || available <= 0
                        ? "Out of Stock"
                        : remainingStatus
                    }
                    tone={
                      !selectedBook ||
                      available <= 0 ||
                      remainingStatus === "Out of Stock"
                        ? "danger"
                        : remainingStatus === "Low Stock"
                        ? "warning"
                        : "success"
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 1. Book Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-foreground/80">
                Select Book Title *
              </label>
              {selectedBook && (
                <span className="text-[10.5px] font-mono text-muted-foreground">
                  Shelf {selectedBook.shelf} · {selectedBook.category}
                </span>
              )}
            </div>
            <select
              className={fieldClass}
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
            >
              <option value="" disabled>
                Select a book from catalogue…
              </option>
              {books.map((b) => (
                <option
                  key={b.id}
                  value={b.id}
                  disabled={b.availableCopies <= 0}
                >
                  {b.bookCode} — {b.title} ({b.availableCopies}/{b.totalCopies}{" "}
                  avail.)
                  {b.availableCopies <= 0 ? " [Out of Stock]" : ""}
                  {b.category === "Reference" ? " [Reference]" : ""}
                </option>
              ))}
            </select>

            {selectedBook?.category === "Reference" && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-[11px] font-medium text-amber-900">
                <AlertTriangle className="size-3.5 shrink-0 text-amber-600" />
                <span>
                  Marked as <strong>Reference</strong> (
                  {selectedBook.remarks || "in-library reading"}). Confirm
                  supervisor approval before checkout.
                </span>
              </div>
            )}
          </div>

          {/* 2. Borrower Type + Selection */}
          <div className="space-y-3 rounded-xl border border-border/70 bg-slate-50/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Assign To Borrower
              </span>
              <div className="inline-flex rounded-lg border border-border/80 bg-white p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleBorrowerTypeSwitch("Student")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors cursor-pointer",
                    borrowerType === "Student"
                      ? "bg-[#091d3e] text-white shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <GraduationCap className="size-3.5" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBorrowerTypeSwitch("Staff")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors cursor-pointer",
                    borrowerType === "Staff"
                      ? "bg-[#091d3e] text-white shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Briefcase className="size-3.5" />
                  <span>Staff / Faculty</span>
                </button>
              </div>
            </div>

            {!isManualBorrower ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-foreground/80">
                    {borrowerType === "Student"
                      ? "Select Student from Directory *"
                      : "Select Staff Member from Directory *"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsManualBorrower(true)}
                    className={toggleClass}
                  >
                    Enter manually
                  </button>
                </div>

                {borrowerType === "Student" ? (
                  <select
                    className={fieldClass}
                    value={selectedBorrowerId}
                    onChange={(e) => setSelectedBorrowerId(e.target.value)}
                  >
                    {activeStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.className}-{s.section} (Roll {s.rollNo}) ·{" "}
                        {s.campus}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    className={fieldClass}
                    value={selectedBorrowerId}
                    onChange={(e) => setSelectedBorrowerId(e.target.value)}
                  >
                    {activeStaff.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} — {st.empCode} · {st.department} ({st.campus})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-foreground/80">
                    Manual {borrowerType} Entry
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsManualBorrower(false)}
                    className={toggleClass}
                  >
                    Pick from directory
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input
                      type="text"
                      className={fieldClass}
                      placeholder={
                        borrowerType === "Student"
                          ? "e.g. Abdullah Tariq"
                          : "e.g. Mr. Imran Raza"
                      }
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      {borrowerType === "Student"
                        ? "Class & Roll No."
                        : "Emp Code / Dept"}
                    </label>
                    <input
                      type="text"
                      className={fieldClass}
                      placeholder={
                        borrowerType === "Student"
                          ? "e.g. Grade 9-A · Roll 22"
                          : "e.g. STF-1045 · English"
                      }
                      value={manualIdentifier}
                      onChange={(e) => setManualIdentifier(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Campus</label>
                    <select
                      className={fieldClass}
                      value={manualCampus}
                      onChange={(e) => setManualCampus(e.target.value)}
                    >
                      {CAMPUS_NAMES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Issue & Due Dates + Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Issue Date *</label>
              <input
                type="date"
                className={fieldClass}
                value={issueDate}
                onChange={(e) => {
                  const nextIssue = e.target.value;
                  setIssueDate(nextIssue);
                  if (nextIssue && dueDate < nextIssue) {
                    setDueDate(
                      addDaysToIso(nextIssue, borrowerType === "Staff" ? 30 : 14)
                    );
                  }
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-foreground/80">
                  Return Due Date *
                </label>
                <div className="flex items-center gap-1">
                  {[7, 14, 30].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDueDate(addDaysToIso(issueDate, days))}
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-brand-50 hover:text-brand text-muted-foreground transition-colors cursor-pointer"
                    >
                      +{days}d
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="date"
                min={issueDate}
                className={fieldClass}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* 4. Issued By & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Issued By</label>
              <input
                type="text"
                className={fieldClass}
                placeholder="Librarian"
                value={issuedBy}
                onChange={(e) => setIssuedBy(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Remarks / Notes</label>
              <input
                type="text"
                className={fieldClass}
                placeholder="Optional assignment note or condition…"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-between gap-2.5 border-t border-border/70 bg-slate-50/60 px-6 py-4">
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            Issue ref:{" "}
            <span className="font-mono font-semibold text-foreground">
              ISS-2026-{String(nextIssueNumber).padStart(3, "0")}
            </span>
          </span>
          <div className="flex items-center gap-2.5 ml-auto">
            <ActionButton tone="outline" size="md" onClick={onClose}>
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              tone="primary"
              size="md"
              disabled={!canAssign}
            >
              <BookCheck className="size-3.5" />
              <span>Assign Book</span>
            </ActionButton>
          </div>
        </div>
      </form>
    </DialogContent>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 2. Return Book Modal                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

interface ReturnBookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: LibraryIssuanceRecord | null;
  onConfirmReturn: (
    issuanceId: string,
    returnDate: string,
    remarks: string
  ) => void;
}

export function ReturnBookModal({
  open,
  onOpenChange,
  record,
  onConfirmReturn,
}: ReturnBookModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && record && (
        <ReturnBookDialogContent
          key={record.id}
          record={record}
          onClose={() => onOpenChange(false)}
          onConfirmReturn={onConfirmReturn}
        />
      )}
    </Dialog>
  );
}

function ReturnBookDialogContent({
  record,
  onClose,
  onConfirmReturn,
}: {
  record: LibraryIssuanceRecord;
  onClose: () => void;
  onConfirmReturn: (
    issuanceId: string,
    returnDate: string,
    remarks: string
  ) => void;
}) {
  const [returnDate, setReturnDate] = React.useState(LIBRARY_TODAY);
  const [remarks, setRemarks] = React.useState("Returned in good condition");

  const isOverdue = isLibraryIssuanceOverdue(record);
  const overdueDays = isOverdue ? diffDaysIso(record.dueDate, LIBRARY_TODAY) : 0;

  return (
    <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-white">
      <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/60 bg-gradient-to-b from-slate-50/80 to-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <DialogTitle className="text-sm font-bold text-foreground">
              Return Book to Shelf
            </DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground">
              Confirm return for {record.issueCode}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="px-6 py-5 space-y-4">
        <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-foreground">
              {record.bookTitle}
            </span>
            <span className="font-mono text-[11px] font-bold text-brand">
              {record.bookCode}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Borrowed by{" "}
            <span className="font-semibold text-foreground">
              {record.borrowerName}
            </span>{" "}
            ({record.borrowerIdentifier})
          </p>
          <p className="text-[11px] text-muted-foreground">
            Issued {formatDate(record.issueDate)} · Due{" "}
            {formatDate(record.dueDate)}
          </p>
        </div>

        {isOverdue && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-800">
            <AlertTriangle className="size-4 shrink-0 text-rose-600" />
            <span>
              Overdue by {overdueDays} day{overdueDays === 1 ? "" : "s"} (Due{" "}
              {formatDate(record.dueDate)}).
            </span>
          </div>
        )}

        <div>
          <label className={labelClass}>Return Date</label>
          <input
            type="date"
            min={record.issueDate}
            className={fieldClass}
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-foreground/80">
              Condition / Return Remarks
            </label>
          </div>
          <input
            type="text"
            className={fieldClass}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Returned in good condition"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[
              "Returned in good condition",
              "Minor cover wear",
              "Late return acknowledged",
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setRemarks(preset)}
                className="rounded-md border border-border/80 bg-slate-50 px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground hover:bg-slate-100 hover:text-foreground cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-border/70 bg-slate-50/60 px-6 py-4">
        <ActionButton tone="outline" size="md" onClick={onClose}>
          Cancel
        </ActionButton>
        <ActionButton
          tone="success"
          size="md"
          onClick={() => {
            onConfirmReturn(record.id, returnDate, remarks.trim());
            onClose();
          }}
        >
          <RotateCcw className="size-3.5" />
          <span>Confirm Return</span>
        </ActionButton>
      </div>
    </DialogContent>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 3. Extend / Renew Due Date Modal                                           */
/* ────────────────────────────────────────────────────────────────────────── */

interface ExtendDueDateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: LibraryIssuanceRecord | null;
  onExtend: (issuanceId: string, newDueDate: string, remarks: string) => void;
}

export function ExtendDueDateModal({
  open,
  onOpenChange,
  record,
  onExtend,
}: ExtendDueDateModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && record && (
        <ExtendDueDateDialogContent
          key={`${record.id}-${record.dueDate}`}
          record={record}
          onClose={() => onOpenChange(false)}
          onExtend={onExtend}
        />
      )}
    </Dialog>
  );
}

function ExtendDueDateDialogContent({
  record,
  onClose,
  onExtend,
}: {
  record: LibraryIssuanceRecord;
  onClose: () => void;
  onExtend: (issuanceId: string, newDueDate: string, remarks: string) => void;
}) {
  const baseForPreset =
    record.dueDate < LIBRARY_TODAY ? LIBRARY_TODAY : record.dueDate;

  const [newDueDate, setNewDueDate] = React.useState(() =>
    addDaysToIso(baseForPreset, 7)
  );
  const [remarks, setRemarks] = React.useState(record.remarks);

  return (
    <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-white">
      <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/60 bg-gradient-to-b from-slate-50/80 to-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10">
            <CalendarClock className="h-4 w-4 text-brand" />
          </div>
          <div>
            <DialogTitle className="text-sm font-bold text-foreground">
              Renew / Extend Due Date
            </DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground">
              {record.bookTitle} · {record.borrowerName}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="px-6 py-5 space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/20 px-4 py-3 text-xs">
          <span className="text-muted-foreground">Current Due Date</span>
          <span className="font-mono font-bold text-foreground">
            {formatDate(record.dueDate)}
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-foreground/80">
              New Due Date
            </label>
            <div className="flex items-center gap-1">
              {[7, 14, 21].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setNewDueDate(addDaysToIso(baseForPreset, d))}
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-brand-50 hover:text-brand text-muted-foreground transition-colors cursor-pointer"
                >
                  +{d}d
                </button>
              ))}
            </div>
          </div>
          <input
            type="date"
            min={record.issueDate}
            className={fieldClass}
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Remarks</label>
          <input
            type="text"
            className={fieldClass}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Reason for renewal…"
          />
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-border/70 bg-slate-50/60 px-6 py-4">
        <ActionButton tone="outline" size="md" onClick={onClose}>
          Cancel
        </ActionButton>
        <ActionButton
          tone="primary"
          size="md"
          disabled={!newDueDate || newDueDate < record.issueDate}
          onClick={() => {
            onExtend(record.id, newDueDate, remarks.trim());
            onClose();
          }}
        >
          Update Due Date
        </ActionButton>
      </div>
    </DialogContent>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 4. View & Print Issuance Slip Modal                                        */
/* ────────────────────────────────────────────────────────────────────────── */

interface ViewIssuanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: LibraryIssuanceRecord | null;
  onRequestReturn: (record: LibraryIssuanceRecord) => void;
}

export function ViewIssuanceModal({
  open,
  onOpenChange,
  record,
  onRequestReturn,
}: ViewIssuanceModalProps) {
  if (!record) return null;

  const effectiveStatus = getEffectiveIssuanceStatus(record);

  const handlePrintSlip = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Library Issue Slip — ${escapeHtml(record.issueCode)}</title>
  <style>
    @page { size: A5 portrait; margin: 14mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; font-size: 12px; line-height: 1.5; }
    .box { border: 1.5px solid #091d3e; border-radius: 8px; padding: 18px; }
    .hdr { border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 16px; font-weight: 800; color: #091d3e; }
    .code { font-family: monospace; font-weight: 700; font-size: 13px; background: #f1f5f9; padding: 3px 8px; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    td { padding: 6px 4px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    td.lbl { width: 36%; color: #475569; font-weight: 600; }
    td.val { font-weight: 600; color: #0f172a; }
    .sig { margin-top: 28px; display: flex; justify-content: space-between; font-size: 11px; color: #475569; }
    .sig div { border-top: 1px solid #94a3b8; width: 42%; text-align: center; padding-top: 4px; }
  </style>
</head>
<body>
  <div class="box">
    <div class="hdr">
      <div>
        <div class="title">Library Book Issue Slip</div>
        <div style="font-size: 11px; color: #64748b;">Campus Library &amp; Resource Center</div>
      </div>
      <div class="code">${escapeHtml(record.issueCode)}</div>
    </div>
    <table>
      <tr><td class="lbl">Status</td><td class="val">${escapeHtml(effectiveStatus)}</td></tr>
      <tr><td class="lbl">Book Title</td><td class="val">${escapeHtml(record.bookTitle)} (${escapeHtml(record.bookCode)})</td></tr>
      <tr><td class="lbl">Author / Shelf</td><td class="val">${escapeHtml(record.bookAuthor)} · Shelf ${escapeHtml(record.shelf)}</td></tr>
      <tr><td class="lbl">Assigned To</td><td class="val">${escapeHtml(record.borrowerName)} (${escapeHtml(record.borrowerType)})</td></tr>
      <tr><td class="lbl">Class / ID</td><td class="val">${escapeHtml(record.borrowerIdentifier)}</td></tr>
      <tr><td class="lbl">Campus</td><td class="val">${escapeHtml(record.campus)}</td></tr>
      <tr><td class="lbl">Issue Date</td><td class="val">${escapeHtml(formatDate(record.issueDate))}</td></tr>
      <tr><td class="lbl">Due Date</td><td class="val">${escapeHtml(formatDate(record.dueDate))}</td></tr>
      ${record.returnedDate ? `<tr><td class="lbl">Returned On</td><td class="val">${escapeHtml(formatDate(record.returnedDate))}</td></tr>` : ""}
      <tr><td class="lbl">Issued By</td><td class="val">${escapeHtml(record.issuedBy)}</td></tr>
      <tr><td class="lbl">Remarks</td><td class="val">${escapeHtml(record.remarks || "—")}</td></tr>
    </table>
    <div class="sig">
      <div>Borrower Signature</div>
      <div>Librarian Stamp &amp; Sign</div>
    </div>
  </div>
</body>
</html>`;
    printHtml(html);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-white">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/60 bg-gradient-to-b from-slate-50/80 to-white">
          <div className="flex items-center justify-between gap-3 pr-6">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                <BookOpen className="h-4 w-4 text-brand" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-sm font-bold text-foreground truncate">
                  Book Issuance Slip · {record.issueCode}
                </DialogTitle>
                <DialogDescription className="text-[11px] text-muted-foreground">
                  Circulation record &amp; borrower details
                </DialogDescription>
              </div>
            </div>
            <LibraryIssuanceStatusBadge record={record} />
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 text-xs">
          <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                Book Details
              </span>
              <span className="font-mono text-[11px] font-semibold text-brand">
                {record.bookCode} · Shelf {record.shelf}
              </span>
            </div>
            <p className="text-sm font-bold text-foreground">
              {record.bookTitle}
            </p>
            <p className="text-[11.5px] text-muted-foreground">
              by {record.bookAuthor} · {record.bookCategory}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/80 bg-white p-4">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Borrower ({record.borrowerType})
              </span>
              <span className="mt-0.5 block font-semibold text-foreground">
                {record.borrowerName}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                {record.borrowerIdentifier}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Campus
              </span>
              <span className="mt-0.5 block font-semibold text-foreground">
                {record.campus}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                Issued by {record.issuedBy}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Issue Date
              </span>
              <span className="mt-0.5 block font-mono font-semibold text-foreground">
                {formatDate(record.issueDate)}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {record.returnedDate ? "Returned Date" : "Return Due Date"}
              </span>
              <span
                className={cn(
                  "mt-0.5 block font-mono font-semibold",
                  effectiveStatus === "Overdue"
                    ? "text-rose-600"
                    : effectiveStatus === "Returned"
                    ? "text-emerald-700"
                    : "text-foreground"
                )}
              >
                {record.returnedDate
                  ? `${formatDate(record.returnedDate)} (Due ${formatDate(
                      record.dueDate
                    )})`
                  : formatDate(record.dueDate)}
              </span>
            </div>
          </div>

          {record.remarks && (
            <div className="rounded-lg border border-border/70 bg-slate-50/70 px-3.5 py-2.5 text-[11.5px] text-muted-foreground">
              <span className="font-semibold text-foreground">Remarks: </span>
              {record.remarks}
            </div>
          )}
        </div>

        <div className="shrink-0 flex items-center justify-between gap-2.5 border-t border-border/70 bg-slate-50/60 px-6 py-4">
          <ActionButton tone="outline" size="md" onClick={handlePrintSlip}>
            <Printer className="size-3.5" />
            <span>Print Slip</span>
          </ActionButton>
          <div className="flex items-center gap-2">
            {record.status === "Issued" && (
              <ActionButton
                tone="success"
                size="md"
                onClick={() => {
                  onOpenChange(false);
                  onRequestReturn(record);
                }}
              >
                <RotateCcw className="size-3.5" />
                <span>Mark Returned</span>
              </ActionButton>
            )}
            <ActionButton
              tone="primary"
              size="md"
              onClick={() => onOpenChange(false)}
            >
              Close
            </ActionButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
