"use client";

import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { PersonCell } from "@/components/shared/user-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/format";
import type { AuditLog } from "@/types";

const columns: Column<AuditLog>[] = [
  {
    key: "timestamp",
    header: "Timestamp",
    cell: (r) => (
      <span className="text-[13px] tabular-nums text-muted-foreground">
        {formatDateTime(r.timestamp)}
      </span>
    ),
    sortValue: (r) => r.timestamp,
  },
  {
    key: "actor",
    header: "Actor",
    cell: (r) => <PersonCell name={r.actor} subtitle={r.role} />,
    sortValue: (r) => r.actor,
  },
  {
    key: "action",
    header: "Action",
    cell: (r) => <span className="text-[13px] font-medium">{r.action}</span>,
  },
  {
    key: "module",
    header: "Module",
    cell: (r) => <span className="text-[13px]">{r.module}</span>,
  },
  {
    key: "target",
    header: "Target",
    cell: (r) => <span className="text-[13px] text-muted-foreground">{r.target}</span>,
  },
  {
    key: "ip",
    header: "IP Address",
    cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.ip}</span>,
  },
  {
    key: "severity",
    header: "Severity",
    cell: (r) => <StatusBadge status={r.severity} />,
  },
];

const modules = ["Users", "Settings", "Admissions", "Finance", "Academics"];

const filters: FilterDef<AuditLog>[] = [
  {
    key: "severity",
    label: "Severity",
    options: ["Info", "Warning", "Critical"],
    getValue: (r) => r.severity,
  },
  {
    key: "module",
    label: "Module",
    options: modules,
    getValue: (r) => r.module,
  },
];

export function AuditTable({ data }: { data: AuditLog[] }) {
  return (
    <DataTable
      data={data}
      columns={columns}
      getRowId={(r) => r.id}
      searchPlaceholder="Search by actor, action or target…"
      searchFn={(r, q) =>
        r.actor.toLowerCase().includes(q) ||
        r.action.toLowerCase().includes(q) ||
        r.target.toLowerCase().includes(q)
      }
      filters={filters}
      pageSize={10}
    />
  );
}
