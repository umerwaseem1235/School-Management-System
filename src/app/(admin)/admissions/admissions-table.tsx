"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AcademicSelect,
  AcademicSelectContent,
  AcademicSelectItem,
  AcademicSelectTrigger,
  AcademicSelectValue,
} from "../academics/academic-dropdown";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionIconButton } from "@/components/shared/action-icon-button";
import { formatDate, formatCampusDisplay } from "@/lib/format";
import type { AdmissionApplication } from "@/types";
import {
  Award,
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  GraduationCap,
  Search,
} from "lucide-react";
import { AdmissionDetailsDialog } from "./admission-details-dialog";

interface AdmissionsTableProps {
  data: AdmissionApplication[];
}

const PAGE_SIZE = 10;

export function AdmissionsTable({ data }: AdmissionsTableProps) {
  const [search, setSearch] = React.useState("");
  const [campusFilter, setCampusFilter] = React.useState("ALL");
  const [classFilter, setClassFilter] = React.useState("ALL");
  const [pathwayFilter, setPathwayFilter] = React.useState("ALL");
  const [page, setPage] = React.useState(0);
  const [viewingAdmission, setViewingAdmission] =
    React.useState<AdmissionApplication | null>(null);

  const campusOptions = React.useMemo(() => {
    return [...new Set(data.map((a) => a.campus))]
      .sort()
      .map((c) => ({
        value: c,
        label: formatCampusDisplay(c).primary || c,
      }));
  }, [data]);

  const classOptions = React.useMemo(() => {
    return [...new Set(data.map((a) => a.appliedClass))].sort();
  }, [data]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((r) => {
      const admissionNo =
        r.admissionNumber || `SMS-2026-${r.id.slice(-4).toUpperCase()}`;
      const matchesSearch =
        q === "" ||
        r.applicant.toLowerCase().includes(q) ||
        r.guardian.toLowerCase().includes(q) ||
        r.appliedClass.toLowerCase().includes(q) ||
        admissionNo.toLowerCase().includes(q) ||
        (r.phone && r.phone.toLowerCase().includes(q));

      const matchesCampus = campusFilter === "ALL" || r.campus === campusFilter;
      const matchesClass =
        classFilter === "ALL" || r.appliedClass === classFilter;
      const pathway =
        r.admissionType === "Entry Test" || Boolean(r.score)
          ? "Entry Test"
          : "Direct Admission";
      const matchesPathway =
        pathwayFilter === "ALL" || pathway === pathwayFilter;

      return matchesSearch && matchesCampus && matchesClass && matchesPathway;
    });
  }, [data, search, campusFilter, classFilter, pathwayFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE
  );
  const startItem = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const endItem = Math.min(filtered.length, (safePage + 1) * PAGE_SIZE);

  const hasActiveFilter =
    search !== "" ||
    campusFilter !== "ALL" ||
    classFilter !== "ALL" ||
    pathwayFilter !== "ALL";

  const handleResetFilters = () => {
    setSearch("");
    setCampusFilter("ALL");
    setClassFilter("ALL");
    setPathwayFilter("ALL");
    setPage(0);
  };

  return (
    <>
      <Card className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-xs">
        {/* Table Section Header (matching Academic Management) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/70 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand shrink-0">
              <GraduationCap className="size-4" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">
                Enrolled Admissions Directory
              </h2>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-3.5 border-b border-border/60">
          <div className="relative w-full sm:w-56 lg:w-64 shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search admissions…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="pl-9 h-9 text-xs w-full bg-background/60"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 md:ml-auto">
            {/* Campus Filter */}
            <AcademicSelect
              value={campusFilter}
              onValueChange={(val) => {
                if (!val) return;
                setCampusFilter(val);
                setPage(0);
              }}
            >
              <AcademicSelectTrigger className="h-9 text-xs min-w-[175px] w-auto max-w-[235px] shrink-0 font-medium bg-background/60 hover:bg-background hover:border-brand/40 data-[popup-open]:border-brand/60 data-[popup-open]:ring-2 data-[popup-open]:ring-brand/15 transition-all duration-200">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <Building2 className="size-3.5 text-muted-foreground shrink-0 transition-colors duration-200 group-hover/select-trigger:text-brand group-data-[popup-open]/select-trigger:text-brand" />
                  <AcademicSelectValue placeholder="All Campuses" />
                </div>
              </AcademicSelectTrigger>
              <AcademicSelectContent className="w-max min-w-[var(--anchor-width)] max-h-[260px]">
                <AcademicSelectItem value="ALL" className="text-xs">
                  All Campuses
                </AcademicSelectItem>
                {campusOptions.map((c) => (
                  <AcademicSelectItem key={c.value} value={c.value} className="text-xs">
                    {c.label}
                  </AcademicSelectItem>
                ))}
              </AcademicSelectContent>
            </AcademicSelect>

            {/* Class Filter */}
            <AcademicSelect
              value={classFilter}
              onValueChange={(val) => {
                if (!val) return;
                setClassFilter(val);
                setPage(0);
              }}
            >
              <AcademicSelectTrigger className="h-9 text-xs min-w-[155px] w-auto max-w-[215px] shrink-0 font-medium bg-background/60 hover:bg-background hover:border-brand/40 data-[popup-open]:border-brand/60 data-[popup-open]:ring-2 data-[popup-open]:ring-brand/15 transition-all duration-200">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <GraduationCap className="size-3.5 text-muted-foreground shrink-0 transition-colors duration-200 group-hover/select-trigger:text-brand group-data-[popup-open]/select-trigger:text-brand" />
                  <AcademicSelectValue placeholder="All Classes" />
                </div>
              </AcademicSelectTrigger>
              <AcademicSelectContent className="w-max min-w-[var(--anchor-width)] max-h-[260px]">
                <AcademicSelectItem value="ALL" className="text-xs">
                  All Classes
                </AcademicSelectItem>
                {classOptions.map((cls) => (
                  <AcademicSelectItem key={cls} value={cls} className="text-xs">
                    {cls}
                  </AcademicSelectItem>
                ))}
              </AcademicSelectContent>
            </AcademicSelect>

            {/* Pathway Filter */}
            <AcademicSelect
              value={pathwayFilter}
              onValueChange={(val) => {
                if (!val) return;
                setPathwayFilter(val);
                setPage(0);
              }}
            >
              <AcademicSelectTrigger className="h-9 text-xs min-w-[170px] w-auto max-w-[225px] shrink-0 font-medium bg-background/60 hover:bg-background hover:border-brand/40 data-[popup-open]:border-brand/60 data-[popup-open]:ring-2 data-[popup-open]:ring-brand/15 transition-all duration-200">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <Award className="size-3.5 text-muted-foreground shrink-0 transition-colors duration-200 group-hover/select-trigger:text-brand group-data-[popup-open]/select-trigger:text-brand" />
                  <AcademicSelectValue placeholder="All Pathways" />
                </div>
              </AcademicSelectTrigger>
              <AcademicSelectContent className="w-max min-w-[var(--anchor-width)]">
                <AcademicSelectItem value="ALL" className="text-xs">
                  All Pathways
                </AcademicSelectItem>
                <AcademicSelectItem value="Entry Test" className="text-xs">
                  Entry Test Merit
                </AcademicSelectItem>
                <AcademicSelectItem value="Direct Admission" className="text-xs">
                  Direct Admission
                </AcademicSelectItem>
              </AcademicSelectContent>
            </AcademicSelect>

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

        {/* Clean Single-Line Table (uniform column spacing) */}
        <div className="w-full">
          <Table className="w-full text-sm">
            <TableHeader>
              <TableRow className="bg-muted/60 border-b border-border/70">
                <TableHead className="font-semibold text-xs text-foreground px-4 py-3 text-center whitespace-nowrap">
                  Admission #
                </TableHead>
                <TableHead className="font-semibold text-xs text-foreground px-4 py-3 text-center whitespace-nowrap">
                  Student Name
                </TableHead>
                <TableHead className="font-semibold text-xs text-foreground px-4 py-3 text-center whitespace-nowrap">
                  Class
                </TableHead>
                <TableHead className="font-semibold text-xs text-foreground px-4 py-3 text-center whitespace-nowrap">
                  Campus
                </TableHead>
                <TableHead className="font-semibold text-xs text-foreground px-4 py-3 text-center whitespace-nowrap">
                  Enrolled On
                </TableHead>
                <TableHead className="font-semibold text-xs text-foreground px-4 py-3 text-center whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-xs text-foreground px-4 py-3 text-center whitespace-nowrap">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length > 0 ? (
                pageRows.map((r) => {
                  const admissionNo =
                    r.admissionNumber ||
                    `SMS-2026-${r.id.slice(-4).toUpperCase()}`;
                  const campusInfo = formatCampusDisplay(r.campus);
                  const statusLabel =
                    r.status === "Active" ? "Enrolled" : r.status || "Enrolled";

                  return (
                    <TableRow
                      key={r.id}
                      className="hover:bg-muted/30 transition-colors border-b border-border/60"
                    >
                      {/* Admission # */}
                      <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold text-brand">
                          {admissionNo}
                        </span>
                      </TableCell>

                      {/* Student Name */}
                      <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                        <span
                          className="block max-w-[200px] mx-auto font-semibold text-[12.5px] text-foreground truncate"
                          title={r.applicant}
                        >
                          {r.applicant}
                        </span>
                      </TableCell>

                      {/* Class */}
                      <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="text-xs font-medium text-foreground">
                          {r.appliedClass}
                          {r.section ? (
                            <span className="text-muted-foreground font-normal">
                              {" "}
                              · Sec {r.section}
                            </span>
                          ) : null}
                        </span>
                      </TableCell>

                      {/* Campus */}
                      <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                        <span
                          className="block max-w-[200px] mx-auto truncate text-xs font-medium text-foreground/90"
                          title={r.campus}
                        >
                          {campusInfo.primary}
                        </span>
                      </TableCell>

                      {/* Enrolled On */}
                      <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {formatDate(r.appliedOn)}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                        <StatusBadge status={statusLabel} dot={false} />
                      </TableCell>

                      {/* Action */}
                      <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center justify-center">
                          <ActionIconButton
                            tone="view"
                            onClick={() => setViewingAdmission(r)}
                            aria-label={`View admission details for ${r.applicant}`}
                            title="View complete admission details"
                          >
                            <Eye />
                          </ActionIconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-xs text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <GraduationCap className="size-8 text-muted-foreground/50" />
                      <p className="font-medium text-sm text-foreground">
                        No enrolled students found
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search query or filters.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Clean Pagination Footer */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-3 border-t border-border/60 bg-muted/15 text-xs text-muted-foreground">
            <span className="tabular-nums">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {startItem}–{endItem}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {filtered.length}
              </span>{" "}
              records
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="h-7 px-2 gap-1 cursor-pointer"
              >
                <ChevronLeft className="size-3.5" />
                <span>Previous</span>
              </Button>
              <span className="px-2 font-mono text-[11px] font-medium text-foreground tabular-nums">
                Page {safePage + 1} / {pageCount}
              </span>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={safePage >= pageCount - 1}
                className="h-7 px-2 gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Extra Details Modal opened from View icon */}
      <AdmissionDetailsDialog
        admission={viewingAdmission}
        open={Boolean(viewingAdmission)}
        onOpenChange={(open) => {
          if (!open) setViewingAdmission(null);
        }}
      />
    </>
  );
}
