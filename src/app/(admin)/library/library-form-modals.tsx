"use client";

import * as React from "react";
import { AlertTriangle, BookPlus, Edit } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionButton } from "@/components/shared/action-button";
import {
  LIBRARY_BOOK_CATEGORIES,
  computeBookStatus,
  type LibraryBookCategory,
  type LibraryBookRecord,
} from "@/lib/mock/library";

const fieldClass =
  "h-10 w-full rounded-lg border border-border/90 bg-white px-3.5 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15";

const labelClass = "block text-[11px] font-semibold text-foreground/80 mb-1.5";

interface LibraryBookFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount: number;
  initialData?: LibraryBookRecord | null;
  onSave: (record: LibraryBookRecord) => void;
}

export function LibraryBookFormModal({
  open,
  onOpenChange,
  totalCount,
  initialData,
  onSave,
}: LibraryBookFormModalProps) {
  const isEditing = Boolean(initialData);

  const [title, setTitle] = React.useState("");
  const [author, setAuthor] = React.useState("");
  const [isbn, setIsbn] = React.useState("");
  const [category, setCategory] = React.useState<LibraryBookCategory>("Fiction");
  const [totalCopies, setTotalCopies] = React.useState("1");
  const [availableCopies, setAvailableCopies] = React.useState("1");
  const [shelf, setShelf] = React.useState("");
  const [publishedYear, setPublishedYear] = React.useState("");
  const [remarks, setRemarks] = React.useState("");

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.title);
        setAuthor(initialData.author);
        setIsbn(initialData.isbn);
        setCategory(initialData.category);
        setTotalCopies(String(initialData.totalCopies));
        setAvailableCopies(String(initialData.availableCopies));
        setShelf(initialData.shelf);
        setPublishedYear(String(initialData.publishedYear));
        setRemarks(initialData.remarks);
      } else {
        setTitle("");
        setAuthor("");
        setIsbn("");
        setCategory("Fiction");
        setTotalCopies("1");
        setAvailableCopies("1");
        setShelf("");
        setPublishedYear("");
        setRemarks("");
      }
    }
  }, [open, initialData]);

  const canSave =
    title.trim() && author.trim() && shelf.trim() && Number(totalCopies) > 0;

  const handleSave = () => {
    if (!canSave) return;
    const total = Math.max(1, Math.round(Number(totalCopies) || 1));
    const available = Math.min(
      total,
      Math.max(0, Math.round(Number(availableCopies) || 0))
    );
    const record: LibraryBookRecord = {
      id: initialData?.id ?? `lb-${Date.now()}`,
      bookCode:
        initialData?.bookCode ??
        `BK-${String(totalCount + 1).padStart(3, "0")}`,
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      category,
      totalCopies: total,
      availableCopies: available,
      shelf: shelf.trim(),
      publishedYear: Number(publishedYear) || new Date().getFullYear(),
      status: computeBookStatus(available, total),
      remarks: remarks.trim(),
    };
    onSave(record);
    onOpenChange(false);
    toast.success(
      isEditing
        ? `Book "${record.title}" updated successfully`
        : `Book "${record.title}" added successfully`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/60 bg-gradient-to-b from-slate-50/80 to-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10">
              {isEditing ? (
                <Edit className="h-4 w-4 text-brand" />
              ) : (
                <BookPlus className="h-4 w-4 text-brand" />
              )}
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                {isEditing ? "Edit Book" : "Add Book"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {isEditing
                  ? "Update the book details below"
                  : "Fill in the details to register a new book"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                className={fieldClass}
                placeholder="e.g. Clean Code"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Author</label>
              <input
                type="text"
                className={fieldClass}
                placeholder="e.g. Robert C. Martin"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>ISBN</label>
              <input
                type="text"
                className={fieldClass}
                placeholder="978-..."
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select
                className={fieldClass}
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as LibraryBookCategory)
                }
              >
                {LIBRARY_BOOK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Total Copies</label>
              <input
                type="number"
                min="1"
                className={fieldClass}
                value={totalCopies}
                onChange={(e) => setTotalCopies(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Available</label>
              <input
                type="number"
                min="0"
                className={fieldClass}
                value={availableCopies}
                onChange={(e) => setAvailableCopies(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Published Year</label>
              <input
                type="number"
                min="1900"
                className={fieldClass}
                value={publishedYear}
                onChange={(e) => setPublishedYear(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Shelf Location</label>
              <input
                type="text"
                className={fieldClass}
                placeholder="e.g. CS-A1"
                value={shelf}
                onChange={(e) => setShelf(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Remarks</label>
              <input
                type="text"
                className={fieldClass}
                placeholder="Optional notes..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-border/70 bg-slate-50/60 px-6 py-4">
          <ActionButton
            tone="outline"
            size="md"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </ActionButton>
          <ActionButton
            tone="primary"
            size="md"
            onClick={handleSave}
            disabled={!canSave}
          >
            {isEditing ? "Update" : "Save"}
          </ActionButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteLibraryBookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookName: string;
  onConfirm: () => void;
}

export function DeleteLibraryBookModal({
  open,
  onOpenChange,
  bookName,
  onConfirm,
}: DeleteLibraryBookModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden">
        <div className="px-6 pt-6 pb-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <DialogHeader className="items-center">
            <DialogTitle className="text-sm font-bold text-foreground">
              Delete Book
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Are you sure you want to permanently remove{" "}
              <span className="font-semibold text-foreground">
                &quot;{bookName}&quot;
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="shrink-0 flex items-center justify-center gap-2.5 border-t border-border/70 bg-slate-50/60 px-6 py-4">
          <ActionButton
            tone="outline"
            size="md"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </ActionButton>
          <ActionButton
            tone="danger"
            size="md"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
              toast.success(`Book "${bookName}" deleted`);
            }}
          >
            Delete
          </ActionButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
