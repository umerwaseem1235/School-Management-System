"use client";

import * as React from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpRight,
  Award,
  CheckCircle2,
  Filter,
  GraduationCap,
  Search,
  UserPlus,
} from "lucide-react";
import {
  getQualifiedAdmissionTestCandidates,
  enrollNewStudent,
} from "@/lib/mock/admissions-storage";
import { toast } from "sonner";

export interface AdmitFromTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnrolled?: () => void;
}

export function AdmitFromTestDialog({
  open,
  onOpenChange,
  onEnrolled,
}: AdmitFromTestDialogProps) {
  const [search, setSearch] = React.useState("");
  const [classFilter, setClassFilter] = React.useState("ALL");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [candidates, setCandidates] = React.useState(() =>
    getQualifiedAdmissionTestCandidates()
  );

  React.useEffect(() => {
    if (open) {
      setCandidates(getQualifiedAdmissionTestCandidates());
      setSearch("");
      setClassFilter("ALL");
      setStatusFilter("ALL");
    }
  }, [open]);

  const classOptions = React.useMemo(() => {
    return Array.from(new Set(candidates.map((c) => c.appliedClass))).sort();
  }, [candidates]);

  const filteredCandidates = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    return candidates.filter((c) => {
      const matchesSearch =
        !q ||
        c.applicantName.toLowerCase().includes(q) ||
        c.fatherName.toLowerCase().includes(q) ||
        c.formNo.toLowerCase().includes(q) ||
        c.appliedClass.toLowerCase().includes(q);

      const matchesClass =
        classFilter === "ALL" || c.appliedClass === classFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "pending" && !c.isAlreadyEnrolled) ||
        (statusFilter === "enrolled" && c.isAlreadyEnrolled);

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [candidates, search, classFilter, statusFilter]);

  const pendingCount = React.useMemo(
    () => candidates.filter((c) => !c.isAlreadyEnrolled).length,
    [candidates]
  );

  const hasActiveFilter =
    search !== "" || classFilter !== "ALL" || statusFilter !== "ALL";

  const handleResetFilters = () => {
    setSearch("");
    setClassFilter("ALL");
    setStatusFilter("ALL");
  };

  const handleEnrollCandidate = (cand: (typeof candidates)[0]) => {
    const { student } = enrollNewStudent({
      name: cand.applicantName,
      guardian: cand.fatherName,
      phone: cand.phone || "0300-1234567",
      className: cand.appliedClass
        .replace("Class ", "Grade ")
        .replace(" (Science)", "")
        .replace(" (Computer)", ""),
      section: "A",
      campus: cand.campus || "Main Campus — Gulberg",
      score: cand.percentage,
      admissionType: "Entry Test",
      status: "Active",
      feeStatus: "Paid",
    });

    setCandidates((prev) =>
      prev.map((c) => (c.id === cand.id ? { ...c, isAlreadyEnrolled: true } : c))
    );

    toast.success("Candidate Officially Enrolled", {
      description: `${cand.applicantName} enrolled into ${student.className} (${student.admissionNumber}).`,
    });

    if (onEnrolled) onEnrolled();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-3xl lg:max-w-4xl p-0 gap-0 overflow-hidden rounded-2xl border-border/80 shadow-2xl">
        <div className="flex flex-col max-h-[88vh]">
          {/* Header */}
          <DialogHeader className="shrink-0 border-b border-border/70 bg-gradient-to-r from-brand-50/60 via-muted/20 to-background px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pr-8">
              <div className="flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-[#7c4424] via-[#5c3118] to-[#381e0f] text-white shadow-sm ring-1 ring-white/10">
                  <Award className="size-5" />
                </div>
                <div>
                  <DialogTitle className="font-heading text-base sm:text-lg font-bold text-foreground flex flex-wrap items-center gap-2">
                    <span>Admit Qualified Candidates</span>
                    <span className="inline-flex items-center rounded-full bg-brand-50 border border-brand/20 px-2.5 py-0.5 text-[11px] font-semibold text-brand">
                      Entry Test Merit
                    </span>
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Directly admit and register students who passed the Examination Entry Test.
                  </DialogDescription>
                </div>
              </div>

              <Link
                href="/admission-tests"
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center gap-1 rounded-lg border border-brand/20 bg-background px-3 py-1.5 text-xs font-semibold text-brand shadow-2xs transition-colors hover:bg-brand-50"
              >
                <span>Open Entry Tests</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </DialogHeader>

          {/* Filter Toolbar */}
          <div className="shrink-0 flex flex-col sm:flex-row sm:items-center gap-2.5 border-b border-border/60 bg-background px-6 py-3.5">
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidates…"
                className="pl-9 h-9 text-xs w-full bg-background/60"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              <Select
                value={classFilter}
                onValueChange={(val) => val && setClassFilter(val)}
              >
                <SelectTrigger className="h-9 text-xs min-w-[155px] w-auto max-w-[220px] font-medium bg-background/60">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <GraduationCap className="size-3.5 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="All Classes" />
                  </div>
                </SelectTrigger>
                <SelectContent className="w-max min-w-[var(--anchor-width)] max-h-[240px]">
                  <SelectItem value="ALL" className="text-xs">
                    All Classes
                  </SelectItem>
                  {classOptions.map((cls) => (
                    <SelectItem key={cls} value={cls} className="text-xs">
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(val) => val && setStatusFilter(val)}
              >
                <SelectTrigger className="h-9 text-xs min-w-[140px] w-auto max-w-[190px] font-medium bg-background/60">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <Filter className="size-3.5 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="All Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="w-max min-w-[var(--anchor-width)]">
                  <SelectItem value="ALL" className="text-xs">
                    All Status
                  </SelectItem>
                  <SelectItem value="pending" className="text-xs">
                    Ready to Enroll
                  </SelectItem>
                  <SelectItem value="enrolled" className="text-xs">
                    Already Enrolled
                  </SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilter && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleResetFilters}
                  className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Candidate List Table */}
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin-light">
            <Table className="w-full text-sm">
              <TableHeader className="bg-muted/60 sticky top-0 z-10 backdrop-blur-xs">
                <TableRow className="border-b border-border/70">
                  <TableHead className="font-semibold text-xs text-foreground px-4 py-3 text-center whitespace-nowrap">
                    Form #
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-foreground px-4 py-3 text-center whitespace-nowrap">
                    Candidate
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-foreground px-4 py-3 text-center whitespace-nowrap">
                    Father&apos;s Name
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-foreground px-4 py-3 text-center whitespace-nowrap">
                    Applied Class
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-foreground px-4 py-3 text-center whitespace-nowrap">
                    Merit Score
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-foreground px-4 py-3 text-center whitespace-nowrap">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-14 text-center text-xs text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Award className="size-8 text-muted-foreground/45" />
                        <p className="text-sm font-medium text-foreground">
                          No qualified candidates found
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCandidates.map((cand) => (
                    <TableRow
                      key={cand.id}
                      className="hover:bg-muted/30 transition-colors border-b border-border/60"
                    >
                      <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold text-brand">
                          {cand.formNo}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                        <span
                          className="block max-w-[180px] mx-auto font-semibold text-[12.5px] text-foreground truncate"
                          title={cand.applicantName}
                        >
                          {cand.applicantName}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                        <span
                          className="block max-w-[180px] mx-auto text-xs font-medium text-foreground/85 truncate"
                          title={cand.fatherName}
                        >
                          {cand.fatherName}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="text-xs font-medium text-foreground">
                          {cand.appliedClass}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[11.5px] font-semibold text-emerald-700 tabular-nums">
                          {cand.obtainedMarks}/{cand.totalMarks} ({cand.percentage}%)
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                        {cand.isAlreadyEnrolled ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11.5px] font-semibold text-emerald-700">
                            <CheckCircle2 className="size-3.5" />
                            <span>Enrolled</span>
                          </span>
                        ) : (
                          <Button
                            type="button"
                            size="xs"
                            onClick={() => handleEnrollCandidate(cand)}
                            className="h-7.5 px-3 text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <UserPlus className="size-3.5" />
                            <span>Enroll Student</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <DialogFooter className="m-0 shrink-0 flex flex-row items-center justify-between gap-3 border-t border-border/70 bg-muted/25 px-6 py-3.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
              <span>
                Showing{" "}
                <strong className="font-semibold text-foreground">
                  {filteredCandidates.length}
                </strong>{" "}
                of{" "}
                <strong className="font-semibold text-foreground">
                  {candidates.length}
                </strong>{" "}
                qualified
              </span>
              {pendingCount > 0 && (
                <span className="hidden sm:inline-flex items-center rounded-full bg-brand-50 border border-brand/15 px-2 py-0.5 text-[11px] font-semibold text-brand">
                  {pendingCount} Pending
                </span>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 px-4 text-xs font-semibold cursor-pointer"
            >
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
