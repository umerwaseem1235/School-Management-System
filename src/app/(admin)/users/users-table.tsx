"use client";

import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { PersonCell } from "@/components/shared/user-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import type { User } from "@/types";

interface UserTableProps {
  data: User[];
}

const columns: Column<User>[] = [
  {
    key: "name",
    header: "User",
    cell: (row) => <PersonCell name={row.name} subtitle={row.email} />,
    sortValue: (row) => row.name,
  },
  {
    key: "role",
    header: "Role",
    cell: (row) => <Badge variant="secondary">{row.role}</Badge>,
  },
  {
    key: "campus",
    header: "Campus",
    cell: (row) => <span className="text-[13px]">{row.campus}</span>,
  },
  {
    key: "status",
    header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "lastLogin",
    header: "Last Login",
    cell: (row) => (
      <span className="text-[13px] tabular-nums text-muted-foreground">
        {row.lastLogin ? formatDateTime(row.lastLogin) : "Never"}
      </span>
    ),
    sortValue: (row) => row.lastLogin ?? "",
  },
];

const roles = ["Super Admin", "Admin", "Principal", "Teacher", "Accountant", "IT Support"];

const filters: FilterDef<User>[] = [
  {
    key: "role",
    label: "Role",
    options: roles,
    getValue: (row) => row.role,
  },
  {
    key: "status",
    label: "Status",
    options: ["Active", "Inactive", "Locked"],
    getValue: (row) => row.status,
  },
];

export function UsersTable({ data }: UserTableProps) {
  return (
    <DataTable
      data={data}
      columns={columns}
      getRowId={(r) => r.id}
      filters={filters}
      searchPlaceholder="Search users by name or email…"
      searchFn={(r, q) =>
        r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
      }
      pageSize={8}
    />
  );
}
