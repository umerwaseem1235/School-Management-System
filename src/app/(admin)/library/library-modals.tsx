"use client";

import * as React from "react";
import { Book, Check, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  Book as BookType,
  IssuanceRecord,
  LibraryMember,
  FineRecord,
} from "@/lib/mock/library";
import { BOOK_CATEGORIES } from "@/lib/mock/library";

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

interface AddBookModalProps extends ModalProps {
  onSave: (book: BookType) => void;
}

export function AddBookModal({ open, onClose, onSave }: AddBookModalProps) {
  const [title, setTitle] = React.useState("");
  const [author, setAuthor] = React.useState("");
  const [isbn, setIsbn] = React.useState("");
  const [category, setCategory] = React.useState("Fiction");
  const [publisher, setPublisher] = React.useState("");
  const [edition, setEdition] = React.useState("");
  const [yearPublished, setYearPublished] = React.useState("");
  const [totalCopies, setTotalCopies] = React.useState("1");
  const [location, setLocation] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setTitle("");
      setAuthor("");
      setIsbn("");
      setCategory("Fiction");
      setPublisher("");
      setEdition("");
      setYearPublished("");
      setTotalCopies("1");
      setLocation("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !isbn || !publisher || !location) return;

    const copies = Number(totalCopies) || 1;
    const book: BookType = {
      id: `BK-${Date.now()}`,
      accessionNo: `ACC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
      title,
      author,
      isbn,
      category,
      publisher,
      edition,
      yearPublished: Number(yearPublished) || new Date().getFullYear(),
      totalCopies: copies,
      availableCopies: copies,
      location,
      status: "Available",
    };

    onSave(book);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-2xl bg-background p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">Add book to catalog</h2>
            
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-xl text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold">Book title *</Label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter book title"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Author *</Label>
            <Input
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">ISBN *</Label>
            <Input
              required
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="978-X-XXX-XXXXX-X"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Category *</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              {BOOK_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Publisher *</Label>
            <Input
              required
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              placeholder="Publisher name"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Edition</Label>
            <Input
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
              placeholder="e.g., 3rd Edition"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Year published</Label>
            <Input
              type="number"
              value={yearPublished}
              onChange={(e) => setYearPublished(e.target.value)}
              placeholder="2024"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Total copies *</Label>
            <Input
              required
              type="number"
              value={totalCopies}
              onChange={(e) => setTotalCopies(e.target.value)}
              placeholder="1"
              min="1"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Location / Shelf *</Label>
            <Input
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Fiction - Shelf A3"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            <Check className="size-4" /> Add book
          </Button>
        </div>
      </form>
    </div>
  );
}

interface IssueBookModalProps extends ModalProps {
  onSave: (issuance: IssuanceRecord) => void;
  books: BookType[];
  members: LibraryMember[];
}

export function IssueBookModal({ open, onClose, onSave, books, members }: IssueBookModalProps) {
  const [bookId, setBookId] = React.useState("");
  const [memberId, setMemberId] = React.useState("");
  const [issueDate, setIssueDate] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");

  React.useEffect(() => {
    if (open) {
      const today = new Date().toISOString().split("T")[0];
      const twoWeeksLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      setIssueDate(today);
      setDueDate(twoWeeksLater);
      setBookId("");
      setMemberId("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId || !memberId || !issueDate || !dueDate) return;

    const book = books.find((b) => b.id === bookId);
    const member = members.find((m) => m.id === memberId);
    if (!book || !member) return;

    const issuance: IssuanceRecord = {
      id: `ISS-${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      accessionNo: book.accessionNo,
      memberId: member.id,
      memberName: member.name,
      memberType: member.type,
      className: member.className,
      rollNo: member.rollNo,
      department: member.department,
      issueDate,
      dueDate,
      status: "Issued",
    };

    onSave(issuance);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">Issue a book</h2>
            
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-xl text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>

        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Select book *</Label>
            <select
              required
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Choose a book</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} by {book.author} ({book.availableCopies} available)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Select member *</Label>
            <select
              required
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Choose a member</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.type}
                  {member.className && ` · ${member.className}`}
                  {member.department && ` · ${member.department}`} ({member.booksIssued}/
                  {member.maxLimit} issued)
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Issue date *</Label>
              <Input
                required
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Due date *</Label>
              <Input
                required
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={issueDate}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            <Check className="size-4" /> Issue book
          </Button>
        </div>
      </form>
    </div>
  );
}

interface ReturnBookModalProps extends ModalProps {
  onSave: (issuanceId: string, returnDate: string, fineAmount: number) => void;
  issuance: IssuanceRecord | null;
}

export function ReturnBookModal({ open, onClose, onSave, issuance }: ReturnBookModalProps) {
  const [returnDate, setReturnDate] = React.useState("");
  const [fineAmount, setFineAmount] = React.useState("0");

  React.useEffect(() => {
    if (open && issuance) {
      const today = new Date().toISOString().split("T")[0];
      setReturnDate(today);

      // Calculate fine if overdue (Rs. 10 per day)
      const dueDate = new Date(issuance.dueDate);
      const todayDate = new Date(today);
      if (todayDate > dueDate) {
        const daysOverdue = Math.ceil(
          (todayDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        setFineAmount(String(daysOverdue * 10));
      } else {
        setFineAmount("0");
      }
    }
  }, [open, issuance]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issuance || !returnDate) return;

    onSave(issuance.id, returnDate, Number(fineAmount) || 0);
    onClose();
  };

  if (!open || !issuance) return null;

  const dueDate = new Date(issuance.dueDate);
  const returnDateObj = new Date(returnDate);
  const isOverdue = returnDateObj > dueDate;
  const daysOverdue = isOverdue
    ? Math.ceil((returnDateObj.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">Return book</h2>
            
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-xl text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand">
              <Book className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold">{issuance.bookTitle}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Issued to: {issuance.memberName}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Issue date: {new Date(issuance.issueDate).toLocaleDateString()} · Due date:{" "}
                {new Date(issuance.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Return date *</Label>
            <Input
              required
              type="date"
              value={returnDate}
              onChange={(e) => {
                setReturnDate(e.target.value);
                const newReturnDate = new Date(e.target.value);
                if (newReturnDate > dueDate) {
                  const days = Math.ceil(
                    (newReturnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  setFineAmount(String(days * 10));
                } else {
                  setFineAmount("0");
                }
              }}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {isOverdue && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-semibold text-amber-900">
                ⚠️ Overdue by {daysOverdue} {daysOverdue === 1 ? "day" : "days"}
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Fine rate: Rs. 10 per day · Calculated fine: Rs. {daysOverdue * 10}
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Fine amount (Rs.)</Label>
            <Input
              type="number"
              value={fineAmount}
              onChange={(e) => setFineAmount(e.target.value)}
              min="0"
              step="10"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            <Check className="size-4" /> Process return
          </Button>
        </div>
      </form>
    </div>
  );
}

interface AddMemberModalProps extends ModalProps {
  onSave: (member: LibraryMember) => void;
}

export function AddMemberModal({ open, onClose, onSave }: AddMemberModalProps) {
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<"Student" | "Staff" | "Faculty">("Student");
  const [className, setClassName] = React.useState("");
  const [rollNo, setRollNo] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setName("");
      setType("Student");
      setClassName("");
      setRollNo("");
      setDepartment("");
      setEmail("");
      setPhone("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    const member: LibraryMember = {
      id: `${type === "Student" ? "STU" : type === "Faculty" ? "FAC" : "STF"}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
      name,
      type,
      className: type === "Student" ? className : undefined,
      rollNo: type === "Student" ? rollNo : undefined,
      department: type !== "Student" ? department : undefined,
      email,
      phone,
      membershipDate: new Date().toISOString().split("T")[0],
      status: "Active",
      booksIssued: 0,
      maxLimit: type === "Student" ? 3 : 5,
      totalFines: 0,
    };

    onSave(member);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">Add library member</h2>
            
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-xl text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>

        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Member name *</Label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Member type *</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "Student" | "Staff" | "Faculty")}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Staff">Staff</option>
            </select>
          </div>

          {type === "Student" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Class</Label>
                <Input
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g., Grade 10-A"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Roll no.</Label>
                <Input
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  placeholder="e.g., 1042"
                />
              </div>
            </div>
          )}

          {type !== "Student" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Department</Label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., English Department"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Email *</Label>
            <Input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Phone *</Label>
            <Input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92-XXX-XXXXXXX"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            <Check className="size-4" /> Add member
          </Button>
        </div>
      </form>
    </div>
  );
}

interface ProcessFineModalProps extends ModalProps {
  onSave: (fineId: string, action: "paid" | "waived", waiveReason?: string) => void;
  fine: FineRecord | null;
}

export function ProcessFineModal({ open, onClose, onSave, fine }: ProcessFineModalProps) {
  const [action, setAction] = React.useState<"paid" | "waived">("paid");
  const [waiveReason, setWaiveReason] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setAction("paid");
      setWaiveReason("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fine) return;
    if (action === "waived" && !waiveReason) return;

    onSave(fine.id, action, waiveReason || undefined);
    onClose();
  };

  if (!open || !fine) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">Process fine</h2>
            
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-xl text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700">
              <User className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold">{fine.memberName}</h3>
              <p className="mt-1 text-xs text-muted-foreground">Book: {fine.bookTitle}</p>
              <p className="mt-1 text-xs text-muted-foreground">{fine.reason}</p>
              <p className="mt-2 font-heading text-lg font-bold text-amber-700">
                Rs. {fine.fineAmount}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Action *</Label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as "paid" | "waived")}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="paid">Mark as paid</option>
              <option value="waived">Waive fine</option>
            </select>
          </div>

          {action === "waived" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Waive reason *</Label>
              <Input
                required
                value={waiveReason}
                onChange={(e) => setWaiveReason(e.target.value)}
                placeholder="e.g., First offense waiver, Special circumstances"
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            <Check className="size-4" /> {action === "paid" ? "Mark paid" : "Waive fine"}
          </Button>
        </div>
      </form>
    </div>
  );
}
