"use client";

import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { PersonCell } from "@/components/shared/user-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCampusDisplay } from "@/lib/format";
import { ADMISSIONS } from "@/lib/mock/institution";
import type { AdmissionApplication } from "@/types";

const columns: Column<AdmissionApplication>[] = [
  {
    key: "applicant",
    header: "Applicant",
    cell: (r) => <PersonCell name={r.applicant} subtitle={r.guardian} />,
    sortValue: (r) => r.applicant,
  },
  {
    key: "class",
    header: "Applied Class",
    cell: (r) => <span className="text-[13px]">{r.appliedClass}</span>,
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
    key: "stage",
    header: "Stage",
    cell: (r) => <StatusBadge status={r.stage} />,
  },
  {
    key: "appliedOn",
    header: "Applied On",
    cell: (r) => (
      <span className="text-[13px] tabular-nums text-muted-foreground">
        {formatDate(r.appliedOn)}
      </span>
    ),
    sortValue: (r) => r.appliedOn,
  },
  {
    key: "score",
    header: "Score",
    cell: (r) =>
      r.score ? (
        <Badge variant="outline">{r.score}%</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
    sortValue: (r) => r.score ?? 0,
  },
];

const stages = ["Inquiry", "Application", "Interview/Test", "Approved", "Enrolled"];
const uniqueCampuses = [...new Set(ADMISSIONS.map((a) => a.campus))];
const campusOptions = uniqueCampuses.map((c) => ({
  value: c,
  label: formatCampusDisplay(c).label,
}));

const filters: FilterDef<AdmissionApplication>[] = [
  { key: "stage", label: "Stage", allLabel: "All Stages", options: stages, getValue: (r) => r.stage },
  {
    key: "campus",
    label: "Campus",
    allLabel: "All Campuses",
    options: campusOptions,
    triggerClassName: "min-w-48 sm:min-w-52",
    getValue: (r) => r.campus,
  },
];

export function AdmissionsTable() {
  return (
    <DataTable
      data={ADMISSIONS}
      columns={columns}
      getRowId={(r) => r.id}
      filters={filters}
      searchPlaceholder="Search applicants…"
      searchFn={(r, q) => r.applicant.toLowerCase().includes(q)}
      pageSize={8}
    />
  );
}
