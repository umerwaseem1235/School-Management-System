"use client";

import * as React from "react";
import {
  AlertCircle,
  Book,
  BookOpen,
  CheckCircle2,
  Clock,
  DollarSign,
  Library as LibraryIcon,
  Plus,
  Search,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger, TabBadge } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import {
  INITIAL_BOOKS,
  INITIAL_ISSUANCES,
  INITIAL_MEMBERS,
  INITIAL_FINES,
  type Book as BookType,
  type IssuanceRecord,
  type LibraryMember,
  type FineRecord,
} from "@/lib/mock/library";
import {
  AddBookModal,
  IssueBookModal,
  ReturnBookModal,
  AddMemberModal,
  ProcessFineModal,
} from "./library-modals";

type LibraryTab = "catalog" | "issuance" | "members" | "fines";

export function LibraryClient() {
  const [activeTab, setActiveTab] = React.useState<LibraryTab>("catalog");
  const [books, setBooks] = React.useState<BookType[]>(INITIAL_BOOKS);
  const [issuances, setIssuances] = React.useState<IssuanceRecord[]>(INITIAL_ISSUANCES);
  const [members, setMembers] = React.useState<LibraryMember[]>(INITIAL_MEMBERS);
  const [fines, setFines] = React.useState<FineRecord[]>(INITIAL_FINES);

  const [searchCatalog, setSearchCatalog] = React.useState("");
  const [searchIssuance, setSearchIssuance] = React.useState("");
  const [searchMembers, setSearchMembers] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [memberTypeFilter, setMemberTypeFilter] = React.useState("All");

  // Modals
  const [addBookModal, setAddBookModal] = React.useState(false);
  const [issueBookModal, setIssueBookModal] = React.useState(false);
  const [returnBookModal, setReturnBookModal] = React.useState(false);
  const [addMemberModal, setAddMemberModal] = React.useState(false);
  const [processFineModal, setProcessFineModal] = React.useState(false);
  const [selectedIssuance, setSelectedIssuance] = React.useState<IssuanceRecord | null>(null);
  const [selectedFine, setSelectedFine] = React.useState<FineRecord | null>(null);

  // KPIs
  const kpis = React.useMemo(() => {
    const totalBooks = books.reduce((sum, b) => sum + b.totalCopies, 0);
    const availableBooks = books.reduce((sum, b) => sum + b.availableCopies, 0);
    const booksIssued = issuances.filter((i) => i.status === "Issued").length;
    const overdueBooks = issuances.filter((i) => i.status === "Overdue").length;
    const activeMembers = members.filter((m) => m.status === "Active").length;
    const pendingFines = fines
      .filter((f) => f.status === "Pending")
      .reduce((sum, f) => sum + f.fineAmount, 0);

    return {
      totalBooks,
      availableBooks,
      booksIssued,
      overdueBooks,
      activeMembers,
      pendingFines,
    };
  }, [books, issuances, members, fines]);

  // Filtered data
  const filteredBooks = React.useMemo(() => {
    return books.filter((b) => {
      const matchesSearch = `${b.title} ${b.author} ${b.isbn} ${b.accessionNo}`
        .toLowerCase()
        .includes(searchCatalog.toLowerCase());
      const matchesCategory = categoryFilter === "All" || b.category === categoryFilter;
      const matchesStatus = statusFilter === "All" || b.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [books, searchCatalog, categoryFilter, statusFilter]);

  const filteredIssuances = React.useMemo(() => {
    return issuances.filter((i) =>
      `${i.bookTitle} ${i.memberName} ${i.accessionNo} ${i.rollNo || ""}`
        .toLowerCase()
        .includes(searchIssuance.toLowerCase())
    );
  }, [issuances, searchIssuance]);

  const filteredMembers = React.useMemo(() => {
    return members.filter((m) => {
      const matchesSearch = `${m.name} ${m.email} ${m.rollNo || ""} ${m.department || ""}`
        .toLowerCase()
        .includes(searchMembers.toLowerCase());
      const matchesType = memberTypeFilter === "All" || m.type === memberTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [members, searchMembers, memberTypeFilter]);

  // Handlers
  const handleAddBook = React.useCallback((book: BookType) => {
    setBooks((prev) => [book, ...prev]);
    toast.success("Book added to catalog");
  }, []);

  const handleIssueBook = React.useCallback(
    (issuance: IssuanceRecord) => {
      setIssuances((prev) => [issuance, ...prev]);
      setBooks((prev) =>
        prev.map((b) =>
          b.id === issuance.bookId
            ? {
                ...b,
                availableCopies: b.availableCopies - 1,
                status:
                  b.availableCopies - 1 === 0
                    ? "Out of Stock"
                    : b.availableCopies - 1 <= 3
                    ? "Low Stock"
                    : "Available",
              }
            : b
        )
      );
      setMembers((prev) =>
        prev.map((m) =>
          m.id === issuance.memberId ? { ...m, booksIssued: m.booksIssued + 1 } : m
        )
      );
      toast.success(`Book issued to ${issuance.memberName}`);
    },
    []
  );

  const handleReturnBook = React.useCallback(
    (issuanceId: string, returnDate: string, fineAmount: number) => {
      const issuance = issuances.find((i) => i.id === issuanceId);
      if (!issuance) return;

      const isOverdue = new Date(returnDate) > new Date(issuance.dueDate);
      const status = isOverdue ? "Overdue" : "Returned";

      setIssuances((prev) =>
        prev.map((i) =>
          i.id === issuanceId
            ? { ...i, returnDate, status, fineAmount: isOverdue ? fineAmount : undefined }
            : i
        )
      );

      setBooks((prev) =>
        prev.map((b) =>
          b.id === issuance.bookId
            ? {
                ...b,
                availableCopies: b.availableCopies + 1,
                status:
                  b.availableCopies + 1 > 3 ? "Available" : b.availableCopies + 1 > 0 ? "Low Stock" : "Out of Stock",
              }
            : b
        )
      );

      setMembers((prev) =>
        prev.map((m) =>
          m.id === issuance.memberId
            ? { ...m, booksIssued: m.booksIssued - 1, totalFines: m.totalFines + (isOverdue ? fineAmount : 0) }
            : m
        )
      );

      if (isOverdue && fineAmount > 0) {
        const daysOverdue = Math.ceil(
          (new Date(returnDate).getTime() - new Date(issuance.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        const fine: FineRecord = {
          id: `FIN-${Date.now()}`,
          memberId: issuance.memberId,
          memberName: issuance.memberName,
          bookTitle: issuance.bookTitle,
          issueId: issuanceId,
          fineAmount,
          reason: `Book returned ${daysOverdue} days late`,
          dueDate: issuance.dueDate,
          returnDate,
          daysOverdue,
          status: "Pending",
        };
        setFines((prev) => [fine, ...prev]);
        toast.warning(`Book returned late. Fine: ${formatCurrency(fineAmount)}`);
      } else {
        toast.success("Book returned successfully");
      }
    },
    [issuances]
  );

  const handleAddMember = React.useCallback((member: LibraryMember) => {
    setMembers((prev) => [member, ...prev]);
    toast.success(`Member ${member.name} registered`);
  }, []);

  const handleProcessFine = React.useCallback((fineId: string, action: "paid" | "waived", waiveReason?: string) => {
    setFines((prev) =>
      prev.map((f) =>
        f.id === fineId
          ? {
              ...f,
              status: action === "paid" ? "Paid" : "Waived",
              paidDate: action === "paid" ? new Date().toISOString().split("T")[0] : undefined,
              waivedBy: action === "waived" ? waiveReason : undefined,
            }
          : f
      )
    );

    const fine = fines.find((f) => f.id === fineId);
    if (fine && action === "paid") {
      setMembers((prev) =>
        prev.map((m) => (m.id === fine.memberId ? { ...m, totalFines: Math.max(0, m.totalFines - fine.fineAmount) } : m))
      );
    }

    toast.success(action === "paid" ? "Fine payment recorded" : "Fine waived successfully");
  }, [fines]);

  const categories = React.useMemo(() => {
    const cats = Array.from(new Set(books.map((b) => b.category))).sort();
    return ["All", ...cats];
  }, [books]);

  return (
    <>
      <PageHeader
        title="Library"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setAddMemberModal(true)}>
              <User className="size-4" /> Add member
            </Button>
            <Button onClick={() => setAddBookModal(true)}>
              <Plus className="size-4" /> Add book
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e3a5f] via-[#2d5a8c] to-[#3b7cb8] px-6 py-7 text-white shadow-lg md:px-8">
          <div className="absolute -right-16 -top-32 size-80 rounded-full border border-white/10" />
          <div className="absolute right-4 top-8 size-56 rounded-full border border-white/10" />
          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/80">
                <LibraryIcon className="size-3.5" /> RESOURCE CENTER · AY 2026–27
              </div>
              <h2 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
                Knowledge lives in every book.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-blue-100/80">
                Manage catalog, issuance desk, memberships, and fine collection—all in one place.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <div className="grid size-11 place-items-center rounded-lg bg-white/15">
                  <BookOpen className="size-5" />
                </div>
                <p className="mt-2 text-xs text-blue-100/70">Currently issued</p>
                <p className="mt-0.5 font-heading text-xl font-bold">{kpis.booksIssued}</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <div className="grid size-11 place-items-center rounded-lg bg-white/15">
                  <AlertCircle className="size-5" />
                </div>
                <p className="mt-2 text-xs text-blue-100/70">Overdue</p>
                <p className="mt-0.5 font-heading text-xl font-bold">{kpis.overdueBooks}</p>
              </div>
            </div>
          </div>
        </section>

        {/* KPI Cards */}
        <StatGrid>
          <StatCard label="Total books" value={kpis.totalBooks} icon={Book} />
          <StatCard label="Available" value={kpis.availableBooks} icon={CheckCircle2} />
          <StatCard label="Active members" value={kpis.activeMembers} icon={Users} />
          <StatCard label="Pending fines" value={formatCurrency(kpis.pendingFines)} icon={DollarSign} />
        </StatGrid>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LibraryTab)}>
          <TabsList>
            <TabsTrigger value="catalog">
              <Book className="size-3.5" />
              Book catalog
              <TabBadge>{books.length}</TabBadge>
            </TabsTrigger>
            <TabsTrigger value="issuance">
              <BookOpen className="size-3.5" />
              Issue & return
              <TabBadge>{kpis.booksIssued}</TabBadge>
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="size-3.5" />
              Members
              <TabBadge>{members.length}</TabBadge>
            </TabsTrigger>
            <TabsTrigger value="fines">
              <DollarSign className="size-3.5" />
              Fines
              <TabBadge>{fines.filter((f) => f.status === "Pending").length}</TabBadge>
            </TabsTrigger>
          </TabsList>

          {/* Book Catalog Tab */}
          <TabsContent value="catalog">
            <SectionCard
              title="Book catalog"
              description="Browse and manage your library collection"
              action={
                <Button size="sm" onClick={() => setAddBookModal(true)}>
                  <Plus className="size-4" /> Add book
                </Button>
              }
            >
              <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    value={searchCatalog}
                    onChange={(e) => setSearchCatalog(e.target.value)}
                    placeholder="Search by title, author, ISBN…"
                    className="pl-9"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option>All</option>
                  <option>Available</option>
                  <option>Low Stock</option>
                  <option>Out of Stock</option>
                </select>
              </div>

              <div className="space-y-2">
                {filteredBooks.map((book) => (
                  <article
                    key={book.id}
                    className="flex flex-col gap-3 rounded-xl border border-border/70 p-3.5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center"
                  >
                    <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand">
                      <Book className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold">{book.title}</h3>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {book.category}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            book.status === "Available" && "bg-emerald-50 text-emerald-700",
                            book.status === "Low Stock" && "bg-amber-50 text-amber-700",
                            book.status === "Out of Stock" && "bg-red-50 text-red-700"
                          )}
                        >
                          {book.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        by {book.author} · ISBN: {book.isbn}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Accession: {book.accessionNo} · Location: {book.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs sm:text-right">
                      <div>
                        <p className="font-semibold text-foreground">
                          {book.availableCopies} / {book.totalCopies}
                        </p>
                        <p className="mt-1 text-muted-foreground">Available</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={book.availableCopies === 0}
                        onClick={() => {
                          setIssueBookModal(true);
                        }}
                      >
                        Issue
                      </Button>
                    </div>
                  </article>
                ))}
                {filteredBooks.length === 0 && (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    No books match your search criteria.
                  </div>
                )}
              </div>
            </SectionCard>
          </TabsContent>

          {/* Issuance Tab */}
          <TabsContent value="issuance">
            <SectionCard
              title="Issue & return desk"
              description="Track book issuance and returns"
              action={
                <Button size="sm" onClick={() => setIssueBookModal(true)}>
                  <Plus className="size-4" /> Issue book
                </Button>
              }
            >
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    value={searchIssuance}
                    onChange={(e) => setSearchIssuance(e.target.value)}
                    placeholder="Search by book, member, accession number…"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {filteredIssuances.map((issuance) => (
                  <article
                    key={issuance.id}
                    className="flex flex-col gap-3 rounded-xl border border-border/70 p-3.5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center"
                  >
                    <div
                      className={cn(
                        "grid size-12 shrink-0 place-items-center rounded-lg",
                        issuance.status === "Issued" && "bg-blue-50 text-blue-700",
                        issuance.status === "Returned" && "bg-emerald-50 text-emerald-700",
                        issuance.status === "Overdue" && "bg-red-50 text-red-700"
                      )}
                    >
                      {issuance.status === "Issued" && <BookOpen className="size-5" />}
                      {issuance.status === "Returned" && <CheckCircle2 className="size-5" />}
                      {issuance.status === "Overdue" && <AlertCircle className="size-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold">{issuance.bookTitle}</h3>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            issuance.status === "Issued" && "bg-blue-50 text-blue-700",
                            issuance.status === "Returned" && "bg-emerald-50 text-emerald-700",
                            issuance.status === "Overdue" && "bg-red-50 text-red-700"
                          )}
                        >
                          {issuance.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Issued to: {issuance.memberName} · {issuance.memberType}
                        {issuance.className && ` · ${issuance.className}`}
                        {issuance.department && ` · ${issuance.department}`}
                      </p>
                      <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Issue: {new Date(issuance.issueDate).toLocaleDateString()}</span>
                        <span>Due: {new Date(issuance.dueDate).toLocaleDateString()}</span>
                        {issuance.returnDate && (
                          <span>Returned: {new Date(issuance.returnDate).toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {issuance.fineAmount !== undefined && issuance.fineAmount > 0 && (
                        <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                          Fine: {formatCurrency(issuance.fineAmount)}
                        </span>
                      )}
                      {issuance.status === "Issued" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedIssuance(issuance);
                            setReturnBookModal(true);
                          }}
                        >
                          Return
                        </Button>
                      )}
                    </div>
                  </article>
                ))}
                {filteredIssuances.length === 0 && (
                  <div className="py-12 text-center text-sm text-muted-foreground">No issuance records found.</div>
                )}
              </div>
            </SectionCard>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <SectionCard
              title="Library members"
              description="Manage student, faculty, and staff memberships"
              action={
                <Button size="sm" onClick={() => setAddMemberModal(true)}>
                  <Plus className="size-4" /> Add member
                </Button>
              }
            >
              <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    value={searchMembers}
                    onChange={(e) => setSearchMembers(e.target.value)}
                    placeholder="Search members…"
                    className="pl-9"
                  />
                </div>
                <select
                  value={memberTypeFilter}
                  onChange={(e) => setMemberTypeFilter(e.target.value)}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option>All</option>
                  <option>Student</option>
                  <option>Faculty</option>
                  <option>Staff</option>
                </select>
              </div>

              <div className="space-y-2">
                {filteredMembers.map((member) => (
                  <article
                    key={member.id}
                    className="flex flex-col gap-3 rounded-xl border border-border/70 p-3.5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center"
                  >
                    <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-700">
                      <User className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold">{member.name}</h3>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {member.type}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            member.status === "Active" && "bg-emerald-50 text-emerald-700",
                            member.status === "Suspended" && "bg-red-50 text-red-700",
                            member.status === "Expired" && "bg-gray-50 text-gray-700"
                          )}
                        >
                          {member.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {member.className && `${member.className} · Roll No: ${member.rollNo}`}
                        {member.department && member.department}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {member.email} · {member.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {member.booksIssued} / {member.maxLimit}
                        </p>
                        <p className="mt-1 text-muted-foreground">Books issued</p>
                      </div>
                      {member.totalFines > 0 && (
                        <div className="text-right">
                          <p className="font-semibold text-red-700">{formatCurrency(member.totalFines)}</p>
                          <p className="mt-1 text-muted-foreground">Fines</p>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
                {filteredMembers.length === 0 && (
                  <div className="py-12 text-center text-sm text-muted-foreground">No members found.</div>
                )}
              </div>
            </SectionCard>
          </TabsContent>

          {/* Fines Tab */}
          <TabsContent value="fines">
            <SectionCard title="Fines & penalties" description="Manage overdue fines and payments">
              <div className="space-y-2">
                {fines.map((fine) => (
                  <article
                    key={fine.id}
                    className="flex flex-col gap-3 rounded-xl border border-border/70 p-3.5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center"
                  >
                    <div
                      className={cn(
                        "grid size-12 shrink-0 place-items-center rounded-lg",
                        fine.status === "Pending" && "bg-amber-50 text-amber-700",
                        fine.status === "Paid" && "bg-emerald-50 text-emerald-700",
                        fine.status === "Waived" && "bg-blue-50 text-blue-700"
                      )}
                    >
                      <DollarSign className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold">{fine.memberName}</h3>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            fine.status === "Pending" && "bg-amber-50 text-amber-700",
                            fine.status === "Paid" && "bg-emerald-50 text-emerald-700",
                            fine.status === "Waived" && "bg-blue-50 text-blue-700"
                          )}
                        >
                          {fine.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Book: {fine.bookTitle}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {fine.reason} · Due: {new Date(fine.dueDate).toLocaleDateString()} · Returned:{" "}
                        {new Date(fine.returnDate).toLocaleDateString()}
                      </p>
                      {fine.waivedBy && <p className="mt-1 text-xs text-blue-700">Waived: {fine.waivedBy}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-heading text-lg font-bold text-foreground">{formatCurrency(fine.fineAmount)}</p>
                        <p className="text-xs text-muted-foreground">{fine.daysOverdue} days</p>
                      </div>
                      {fine.status === "Pending" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedFine(fine);
                            setProcessFineModal(true);
                          }}
                        >
                          Process
                        </Button>
                      )}
                    </div>
                  </article>
                ))}
                {fines.length === 0 && (
                  <div className="py-12 text-center text-sm text-muted-foreground">No fine records found.</div>
                )}
              </div>
            </SectionCard>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <AddBookModal open={addBookModal} onClose={() => setAddBookModal(false)} onSave={handleAddBook} />
      <IssueBookModal
        open={issueBookModal}
        onClose={() => setIssueBookModal(false)}
        onSave={handleIssueBook}
        books={books.filter((b) => b.availableCopies > 0)}
        members={members.filter((m) => m.status === "Active" && m.booksIssued < m.maxLimit)}
      />
      <ReturnBookModal
        open={returnBookModal}
        onClose={() => {
          setReturnBookModal(false);
          setSelectedIssuance(null);
        }}
        onSave={handleReturnBook}
        issuance={selectedIssuance}
      />
      <AddMemberModal open={addMemberModal} onClose={() => setAddMemberModal(false)} onSave={handleAddMember} />
      <ProcessFineModal
        open={processFineModal}
        onClose={() => {
          setProcessFineModal(false);
          setSelectedFine(null);
        }}
        onSave={handleProcessFine}
        fine={selectedFine}
      />
    </>
  );
}
