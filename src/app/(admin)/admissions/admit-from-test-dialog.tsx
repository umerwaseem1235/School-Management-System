"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Award, CheckCircle2, Search, Sparkles, UserPlus } from "lucide-react";
import {
  getQualifiedAdmissionTestCandidates,
  enrollNewStudent,
} from "@/lib/mock/admissions-storage";
import { toast } from "sonner";
import Link from "next/link";

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
  const [candidates, setCandidates] = React.useState(() =>
    getQualifiedAdmissionTestCandidates()
  );

  React.useEffect(() => {
    if (open) {
      setCandidates(getQualifiedAdmissionTestCandidates());
      setSearch("");
    }
  }, [open]);

  const filteredCandidates = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return candidates;
    return candidates.filter(
      (c) =>
        c.applicantName.toLowerCase().includes(q) ||
        c.fatherName.toLowerCase().includes(q) ||
        c.formNo.toLowerCase().includes(q) ||
        c.appliedClass.toLowerCase().includes(q)
    );
  }, [candidates, search]);

  const handleEnrollCandidate = (cand: (typeof candidates)[0]) => {
    const { student } = enrollNewStudent({
      name: cand.applicantName,
      guardian: cand.fatherName,
      phone: cand.phone || "0300-1234567",
      className: cand.appliedClass.replace("Class ", "Grade ").replace(" (Science)", "").replace(" (Computer)", ""),
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

    toast.success("Candidate Officially Enrolled!", {
      description: `${cand.applicantName} enrolled into ${student.className} (${student.admissionNumber}). Synchronized with Students SIS & Admissions Hub.`,
    });

    if (onEnrolled) onEnrolled();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-border/80 shadow-2xl">
        <DialogHeader className="border-b border-border/70 bg-gradient-to-r from-muted/40 via-muted/20 to-background px-6 py-5">
          <div className="flex items-center justify-between pr-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-b from-[#7c4424] via-[#5c3118] to-[#381e0f] text-white shadow-sm ring-1 ring-white/10">
                <Award className="size-5" />
              </div>
              <div>
                <DialogTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                  Admit Qualified Candidates
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand">
                    <Sparkles className="size-3" />
                    Entry Test Merit
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Directly admit and register students who passed the Examination Entry Test.
                </DialogDescription>
              </div>
            </div>
            <Link
              href="/admission-tests"
              onClick={() => onOpenChange(false)}
              className="text-xs font-semibold text-brand hover:underline hidden sm:inline-block"
            >
              Open Entry Tests →
            </Link>
          </div>
        </DialogHeader>

        {/* Filter bar */}
        <div className="p-4 border-b border-border/60 bg-background flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search qualified candidates by name, form #, or class…"
              className="pl-9 h-9 text-xs"
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground shrink-0">
            {filteredCandidates.length} Candidates Qualified
          </span>
        </div>

        {/* Candidate List Table */}
        <div className="max-h-[380px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-muted/40 sticky top-0 z-10">
              <TableRow className="border-b border-border/60">
                <TableHead className="text-xs font-semibold px-5 py-2.5">Candidate</TableHead>
                <TableHead className="text-xs font-semibold px-3 py-2.5 text-center">Form #</TableHead>
                <TableHead className="text-xs font-semibold px-3 py-2.5 text-center">Applied Class</TableHead>
                <TableHead className="text-xs font-semibold px-3 py-2.5 text-center">Score</TableHead>
                <TableHead className="text-xs font-semibold px-5 py-2.5 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-xs text-muted-foreground">
                    No qualified entry test candidates found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((cand) => (
                  <TableRow key={cand.id} className="hover:bg-muted/30 transition-colors border-b border-border/60">
                    <TableCell className="px-5 py-3">
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-xs text-foreground">{cand.applicantName}</span>
                        <span className="text-[11px] text-muted-foreground">S/D of {cand.fatherName}</span>
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-3 text-center font-mono text-xs text-muted-foreground">
                      {cand.formNo}
                    </TableCell>

                    <TableCell className="px-3 py-3 text-center text-xs font-medium text-foreground">
                      {cand.appliedClass}
                    </TableCell>

                    <TableCell className="px-3 py-3 text-center font-mono text-xs">
                      <Badge variant="outline" className="font-mono text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                        {cand.obtainedMarks}/{cand.totalMarks} ({cand.percentage}%)
                      </Badge>
                    </TableCell>

                    <TableCell className="px-5 py-3 text-right">
                      {cand.isAlreadyEnrolled ? (
                        <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="size-3.5" />
                          Enrolled
                        </span>
                      ) : (
                        <Button
                          size="xs"
                          onClick={() => handleEnrollCandidate(cand)}
                          className="bg-brand text-white hover:bg-brand-600 h-7.5 px-3 text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
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
      </DialogContent>
    </Dialog>
  );
}
