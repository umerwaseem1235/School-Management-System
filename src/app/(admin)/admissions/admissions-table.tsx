"use client";

import * as React from "react";
import Link from "next/link";
import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { PersonCell } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCampusDisplay } from "@/lib/format";
import type { AdmissionApplication } from "@/types";
import { Award, CheckCircle2, ExternalLink, GraduationCap } from "lucide-react";

const columns: Column<AdmissionApplication>[] = [
  {
    key: "admissionNumber",
    header: "Admission #",
    cell: (r) => (
      <span className="font-mono text-xs font-bold text-brand bg-brand-50/70 border border-brand/20 px-2 py-0.5 rounded-md whitespace-nowrap">
        {r.admissionNumber || `SMS-2026-${r.id.slice(-4).toUpperCase()}`}
      </span>
    ),
    sortValue: (r) => r.admissionNumber || r.id,
  },
  {
    key: "applicant",
    header: "Enrolled Student",
    cell: (r) => (
      <div className="flex flex-col">
        <PersonCell name={r.applicant} subtitle={r.guardian ? `S/D of ${r.guardian}` : undefined} />
        {r.phone && (
          <span className="text-[10.5px] text-muted-foreground/80 pl-9 font-mono">
            {r.phone}
          </span>
        )}
      </div>
    ),
    sortValue: (r) => r.applicant,
  },
  {
    key: "class",
    header: "Class & Section",
    cell: (r) => (
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span className="text-[13px] font-semibold text-foreground">
          {r.appliedClass}
        </span>
        {r.section && (
          <span className="text-[11px] font-medium text-muted-foreground bg-muted px-1.5 py-0.2 rounded border border-border/50">
            Sec {r.section}
          </span>
        )}
      </div>
    ),
    sortValue: (r) => r.appliedClass,
  },
  {
    key: "campus",
    header: "Campus",
    cell: (r) => {
      const info = formatCampusDisplay(r.campus);
      return (
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] font-medium text-foreground">{info.primary}</span>
          {info.secondary && (
            <span className="text-[11px] text-muted-foreground">{info.secondary}</span>
          )}
        </div>
      );
    },
    sortValue: (r) => r.campus,
  },
  {
    key: "admissionType",
    header: "Admission Pathway",
    cell: (r) => {
      const isTest = r.admissionType === "Entry Test" || Boolean(r.score);
      return isTest ? (
        <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Award className="size-3 text-emerald-600 shrink-0" />
          <span>Entry Test {r.score ? `(${r.score}%)` : ""}</span>
        </div>
      ) : (
        <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <GraduationCap className="size-3 text-slate-500 shrink-0" />
          <span>Direct Admission</span>
        </div>
      );
    },
    sortValue: (r) => (r.score ? 1 : 0),
  },
  {
    key: "appliedOn",
    header: "Enrolled On",
    cell: (r) => (
      <span className="text-[13px] tabular-nums text-muted-foreground whitespace-nowrap">
        {formatDate(r.appliedOn)}
      </span>
    ),
    sortValue: (r) => r.appliedOn,
  },
  {
    key: "status",
    header: "Status",
    align: "center",
    cell: () => (
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <CheckCircle2 className="size-3" />
          Enrolled
        </span>
      </div>
    ),
  },
  {
    key: "action",
    header: "SIS Action",
    align: "right",
    cell: (r) => (
      <div className="flex items-center justify-end">
        <Link
          href={`/students?search=${encodeURIComponent(r.applicant)}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer group"
          title="Open student record in Student Information System"
        >
          <span>View in SIS</span>
          <ExternalLink className="size-3 opacity-70 group-hover:opacity-100" />
        </Link>
      </div>
    ),
  },
];

interface AdmissionsTableProps {
  data: AdmissionApplication[];
}

export function AdmissionsTable({ data }: AdmissionsTableProps) {
  const uniqueCampuses = React.useMemo(() => {
    return [...new Set(data.map((a) => a.campus))].sort();
  }, [data]);

  const campusOptions = React.useMemo(() => {
    return uniqueCampuses.map((c) => ({
      value: c,
      label: formatCampusDisplay(c).label,
    }));
  }, [uniqueCampuses]);

  const uniqueClasses = React.useMemo(() => {
    return [...new Set(data.map((a) => a.appliedClass))].sort();
  }, [data]);

  const pathwayOptions = [
    { value: "Entry Test", label: "Entry Test Merit" },
    { value: "Direct Admission", label: "Direct Admission" },
  ];

  const filters: FilterDef<AdmissionApplication>[] = React.useMemo(
    () => [
      {
        key: "campus",
        label: "Campus",
        allLabel: "All Campuses",
        options: campusOptions,
        triggerClassName: "min-w-44 sm:min-w-48",
        getValue: (r) => r.campus,
      },
      {
        key: "appliedClass",
        label: "Class",
        allLabel: "All Classes",
        options: uniqueClasses,
        triggerClassName: "min-w-36",
        getValue: (r) => r.appliedClass,
      },
      {
        key: "pathway",
        label: "Pathway",
        allLabel: "All Pathways",
        options: pathwayOptions,
        triggerClassName: "min-w-40",
        getValue: (r) =>
          r.admissionType === "Entry Test" || Boolean(r.score)
            ? "Entry Test"
            : "Direct Admission",
      },
    ],
    [campusOptions, uniqueClasses]
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      getRowId={(r) => r.id}
      filters={filters}
      searchPlaceholder="Search enrolled students, admission #, guardian or class…"
      searchFn={(r, q) =>
        Boolean(
          r.applicant.toLowerCase().includes(q) ||
          r.guardian.toLowerCase().includes(q) ||
          r.appliedClass.toLowerCase().includes(q) ||
          (r.admissionNumber && r.admissionNumber.toLowerCase().includes(q)) ||
          (r.phone && r.phone.includes(q))
        )
      }
      pageSize={10}
    />
  );
}
