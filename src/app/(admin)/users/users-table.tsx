"use client";

import * as React from "react";
import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { PersonCell } from "@/components/shared/user-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTime, formatCampusDisplay } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Role, Status, User } from "@/types";
import { ChevronDown, Lock, Pencil } from "lucide-react";

interface UserTableProps {
  data: User[];
  onSelectUser?: (user: User) => void;
  onStatusChange?: (id: string, newStatus: Status) => void;
}

const STATUS_OPTIONS: {
  status: Status;
  label: string;
  tone: "success" | "neutral" | "danger" | "warning";
  desc: string;
}[] = [
  {
    status: "Active",
    label: "Active",
    tone: "success",
    desc: "Permitted to login & access portal",
  },
  {
    status: "Inactive",
    label: "Deactivated (Inactive)",
    tone: "neutral",
    desc: "Login access revoked; records kept",
  },
  {
    status: "Suspended",
    label: "Suspended",
    tone: "danger",
    desc: "Temporarily blocked from portal",
  },
  {
    status: "Pending",
    label: "Pending Verification",
    tone: "warning",
    desc: "Awaiting activation / first login",
  },
];

function UserStatusDropdown({
  status,
  onStatusChange,
}: {
  status: Status;
  onStatusChange?: (status: Status) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group inline-flex items-center gap-1 rounded-full outline-none transition-all hover:scale-102 active:scale-95 cursor-pointer focus-visible:ring-1 focus-visible:ring-ring"
        title="Click to toggle status or deactivate user"
      >
        <StatusBadge status={status} dot={false} className="cursor-pointer group-hover:brightness-95 shadow-2xs text-[11px] py-0.5" />
        <ChevronDown className="size-3 text-muted-foreground/60 transition-transform group-data-[popup-open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 p-1.5 rounded-xl shadow-xl border border-border/70 bg-popover text-popover-foreground animate-in fade-in-50 zoom-in-95 duration-100"
      >
        <DropdownMenuGroup className="space-y-0.5">
          <DropdownMenuLabel className="px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            Account Access Status
          </DropdownMenuLabel>
          {STATUS_OPTIONS.map((opt) => {
            const isCurrent = opt.status === status;
            return (
              <DropdownMenuItem
                key={opt.status}
                onClick={() => {
                  if (!isCurrent && onStatusChange) {
                    onStatusChange(opt.status);
                  }
                }}
                className={cn(
                  "flex items-center justify-between rounded-lg px-2 py-1.5 text-xs font-medium cursor-pointer transition-colors",
                  isCurrent ? "bg-accent/80 font-semibold" : "hover:bg-accent/50"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      opt.tone === "success" && "bg-emerald-600",
                      opt.tone === "neutral" && "bg-slate-400",
                      opt.tone === "danger" && "bg-red-600",
                      opt.tone === "warning" && "bg-amber-500"
                    )}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground font-normal truncate">
                      {opt.desc}
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getRoleBadgeStyle(role: Role): string {
  switch (role) {
    case "Super Admin":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900";
    case "Campus Admin":
      return "bg-brand-50 text-brand border-brand/20 dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand/40";
    case "Principal":
      return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900";
    case "HR Admin":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900";
    case "Accountant":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900";
    case "Exam Controller":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900";
    case "Receptionist":
      return "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900";
    case "Teacher":
      return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900";
    case "IT Support":
      return "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    case "Student":
      return "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-900";
    case "Parent":
      return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

const ALL_ROLES: Role[] = [
  "Teacher",
  "Student",
  "HR Admin",
  "Accountant",
  "Parent",
  "Super Admin",
  "Campus Admin",
  "Principal",
  "Exam Controller",
  "Receptionist",
  "IT Support",
];

const filters: FilterDef<User>[] = [
  {
    key: "role",
    label: "Role",
    options: ALL_ROLES,
    getValue: (row) => row.role,
    triggerClassName: "h-9 text-xs min-w-[110px] max-w-[140px]",
  },
  {
    key: "status",
    label: "Status",
    options: ["Active", "Pending", "Suspended", "Inactive"],
    getValue: (row) => row.status,
    triggerClassName: "h-9 text-xs min-w-[105px] max-w-[130px]",
  },
];

export function UsersTable({ data, onSelectUser, onStatusChange }: UserTableProps) {
  const columns = React.useMemo<Column<User>[]>(
    () => [
      {
        key: "name",
        header: "User & Profile",
        align: "left",
        cell: (row) => {
          let detailTag = "";
          if (row.role === "Teacher") {
            detailTag = row.assignedSubjects ? row.assignedSubjects : "Faculty";
          } else if (row.role === "Student") {
            detailTag = row.studentRollNo ? row.studentRollNo : "Student";
          } else if (row.role === "Parent") {
            detailTag = row.guardianName ? `Child: ${row.guardianName}` : "Parent Portal";
          } else if (row.role === "HR Admin") {
            detailTag = row.designation || "HR Operations";
          } else if (row.role === "Accountant") {
            detailTag = row.designation || "Accounts & Finance";
          } else if (row.designation) {
            detailTag = row.designation;
          }

          const subtitle = detailTag ? `${row.email} · ${detailTag}` : row.email;
          return <PersonCell name={row.name} subtitle={subtitle} />;
        },
        sortValue: (row) => row.name,
      },
      {
        key: "role",
        header: "Role",
        align: "center",
        cell: (row) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getRoleBadgeStyle(
              row.role
            )}`}
          >
            {row.role}
          </span>
        ),
        sortValue: (row) => row.role,
        className: "whitespace-nowrap",
      },
      {
        key: "campus",
        header: "Campus / Scope",
        align: "center",
        cell: (row) => {
          const info = formatCampusDisplay(row.campus);
          const secondaryDisplay =
            row.role === "Teacher" && row.assignedClasses
              ? row.assignedClasses
              : row.role === "Student" && row.assignedClasses
              ? row.assignedClasses
              : row.department || info.secondary || "Central Operations";

          return (
            <div className="inline-flex flex-col items-center justify-center leading-tight min-w-0">
              <span className="text-[13px] font-medium text-foreground truncate">
                {info.primary}
              </span>
              <span
                className="text-[11px] text-muted-foreground truncate max-w-[180px]"
                title={secondaryDisplay}
              >
                {secondaryDisplay}
              </span>
            </div>
          );
        },
        sortValue: (row) => row.campus,
      },
      {
        key: "lastLogin",
        header: "Last Login",
        align: "center",
        cell: (row) => (
          <span className="text-[12px] tabular-nums text-muted-foreground whitespace-nowrap">
            {row.lastLogin ? formatDateTime(row.lastLogin) : "Never"}
          </span>
        ),
        sortValue: (row) => row.lastLogin ?? "",
        className: "whitespace-nowrap",
      },
      {
        key: "actions",
        header: "Status / Actions",
        align: "center",
        cell: (row) => {
          const isSuperAdmin = row.role === "Super Admin";

          if (isSuperAdmin) {
            return (
              <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                {/* Static Protected Status Badge - no dropdown */}
                <StatusBadge status={row.status} />

                {/* Root Protected Account Pill */}
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-muted-foreground bg-muted/60 border border-border/80 shadow-2xs select-none"
                  title="Root Super Admin account is protected against modification and deactivation."
                >
                  <Lock className="size-3 text-red-600 dark:text-red-400" />
                  <span>Protected</span>
                </span>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-center gap-2 whitespace-nowrap">
              {/* Clickable Status Badge Dropdown */}
              <UserStatusDropdown
                status={row.status}
                onStatusChange={(newStatus) => onStatusChange?.(row.id, newStatus)}
              />

              {/* Quick Edit Button */}
              {onSelectUser && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => onSelectUser(row)}
                  className="h-7 gap-1 px-2.5 rounded-lg text-xs font-semibold border-border/80 text-brand hover:bg-brand-50 hover:text-brand hover:border-brand/40 shadow-2xs transition-all active:scale-95 cursor-pointer"
                  title="Edit user details, assignments, or reset password"
                >
                  <Pencil className="size-3" />
                  <span>Edit</span>
                </Button>
              )}
            </div>
          );
        },
        className: "whitespace-nowrap",
      },
    ],
    [onSelectUser, onStatusChange]
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      getRowId={(r) => r.id}
      filters={filters}
      searchPlaceholder="Search users…"
      searchFn={(r, q) => {
        const query = q.toLowerCase();
        return (
          r.name.toLowerCase().includes(query) ||
          r.email.toLowerCase().includes(query) ||
          r.role.toLowerCase().includes(query) ||
          (r.campus ? r.campus.toLowerCase().includes(query) : false) ||
          (r.department ? r.department.toLowerCase().includes(query) : false) ||
          (r.employeeCode ? r.employeeCode.toLowerCase().includes(query) : false) ||
          (r.studentRollNo ? r.studentRollNo.toLowerCase().includes(query) : false) ||
          (r.assignedSubjects ? r.assignedSubjects.toLowerCase().includes(query) : false) ||
          (r.assignedClasses ? r.assignedClasses.toLowerCase().includes(query) : false) ||
          (r.guardianName ? r.guardianName.toLowerCase().includes(query) : false) ||
          (r.designation ? r.designation.toLowerCase().includes(query) : false)
        );
      }}
      pageSize={8}
      tableClassName="w-full text-sm"
    />
  );
}
