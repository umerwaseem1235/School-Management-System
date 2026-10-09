"use client";

import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { PersonCell } from "@/components/shared/user-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Meter } from "@/components/shared/meter";
import { STUDENTS } from "@/lib/mock/institution";
import type { Student } from "@/types";

const columns: Column<Student>[] = [
  {
    key: "student",
    header: "Student",
    cell: (r) => <PersonCell name={r.name} subtitle={r.admissionNumber} />,
    sortValue: (r) => r.name,
  },
  {
    key: "class",
    header: "Class & Section",
    cell: (r) => <span className="text-[13px]">{r.className} - {r.section}</span>,
  },
  {
    key: "campus",
    header: "Campus",
    cell: (r) => <span className="text-[13px]">{r.campus}</span>,
  },
  {
    key: "attendance",
    header: "Attendance",
    cell: (r) => (
      <div className="flex items-center gap-2">
        <Meter value={r.attendance} className="w-16" />
        <span className="text-[13px] tabular-nums">{r.attendance}%</span>
      </div>
    ),
    sortValue: (r) => r.attendance,
  },
  {
    key: "feeStatus",
    header: "Fee Status",
    cell: (r) => <StatusBadge status={r.feeStatus} />,
  },
  {
    key: "status",
    header: "Status",
    cell: (r) => <StatusBadge status={r.status} />,
  },
];

const campuses = [...new Set(STUDENTS.map((s) => s.campus))];
const classes = [...new Set(STUDENTS.map((s) => s.className))];

const filters: FilterDef<Student>[] = [
  { key: "campus", label: "Campus", options: campuses, getValue: (r) => r.campus },
  { key: "class", label: "Class", options: classes, getValue: (r) => r.className },
  { key: "status", label: "Status", options: ["Active", "Transferred", "Alumni", "Suspended"], getValue: (r) => r.status },
];

export function StudentsTable() {
  return (
    <DataTable
      data={STUDENTS}
      columns={columns}
      getRowId={(r) => r.id}
      searchPlaceholder="Search by name or admission number…"
      searchFn={(r, q) =>
        r.name.toLowerCase().includes(q) ||
        r.admissionNumber.toLowerCase().includes(q)
      }
      filters={filters}
      selectable
      pageSize={8}
    />
  );
}
