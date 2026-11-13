"use client";

import * as React from "react";
import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { ActionIconButton } from "@/components/shared/action-icon-button";
import { PersonCell } from "@/components/shared/user-avatar";
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
import {
  Award,
  Ban,
  Building2,
  Calculator,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  GraduationCap,
  Laptop,
  Lock,
  Pencil,
  PhoneCall,
  Power,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

interface UserTableProps {
  data: User[];
  onViewUser?: (user: User) => void;
  onSelectUser?: (user: User) => void;
  onStatusChange?: (id: string, newStatus: Status) => void;
}

const STATUS_ICON_STYLES: Record<
  Status,
  {
    icon: React.ComponentType<{ className?: string }>;
    className: string;
    label: string;
  }
> = {
  Active: {
    icon: CheckCircle2,
    className:
      "border-emerald-200/80 bg-emerald-50/75 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60",
    label: "Active",
  },
  Inactive: {
    icon: Power,
    className:
      "border-slate-200/90 bg-slate-100/80 text-slate-600 hover:border-slate-300 hover:bg-slate-200/75 dark:border-slate-700/70 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800",
    label: "Inactive (Deactivated)",
  },
  Suspended: {
    icon: Ban,
    className:
      "border-red-200/80 bg-red-50/75 text-red-700 hover:border-red-300 hover:bg-red-100 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60",
    label: "Suspended",
  },
  Pending: {
    icon: Clock,
    className:
      "border-amber-200/80 bg-amber-50/75 text-amber-700 hover:border-amber-300 hover:bg-amber-100 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/60",
    label: "Pending Verification",
  },
};

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
  const cfg = STATUS_ICON_STYLES[status] ?? STATUS_ICON_STYLES.Active;
  const Icon = cfg.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex size-7 shrink-0 items-center justify-center rounded-md border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          cfg.className
        )}
        title={`Status: ${cfg.label} — Click to change`}
        aria-label={`Account status: ${cfg.label}. Click to change`}
      >
        <Icon className="size-3.5" />
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

const ROLE_CONFIGS: Record<
  Role,
  {
    icon: React.ComponentType<{ className?: string }>;
    pillBorder: string;
    pillBg: string;
    textColor: string;
    bubbleBg: string;
  }
> = {
  "Super Admin": {
    icon: ShieldCheck,
    pillBorder: "border-brand/25",
    pillBg: "bg-white",
    textColor: "text-[#091d3e]",
    bubbleBg: "bg-gradient-to-b from-[#1e4275] to-[#091d3e]",
  },
  "Campus Admin": {
    icon: Building2,
    pillBorder: "border-brand/25",
    pillBg: "bg-white",
    textColor: "text-[#091d3e]",
    bubbleBg: "bg-gradient-to-b from-[#1e4275] to-[#091d3e]",
  },
  Principal: {
    icon: Award,
    pillBorder: "border-purple-300/80",
    pillBg: "bg-purple-50/40",
    textColor: "text-purple-800",
    bubbleBg: "bg-gradient-to-br from-purple-600 to-indigo-900",
  },
  Teacher: {
    icon: UserCheck,
    pillBorder: "border-slate-200/90",
    pillBg: "bg-white",
    textColor: "text-[#091d3e]",
    bubbleBg: "bg-[#091d3e]",
  },
  Student: {
    icon: GraduationCap,
    pillBorder: "border-sky-300/80",
    pillBg: "bg-sky-50/40",
    textColor: "text-sky-700",
    bubbleBg: "bg-gradient-to-br from-sky-400 to-sky-600",
  },
  Parent: {
    icon: Users,
    pillBorder: "border-amber-300/80",
    pillBg: "bg-amber-50/40",
    textColor: "text-amber-800",
    bubbleBg: "bg-gradient-to-br from-amber-500 to-orange-600",
  },
  "HR Admin": {
    icon: UserCheck,
    pillBorder: "border-indigo-300/80",
    pillBg: "bg-indigo-50/40",
    textColor: "text-indigo-800",
    bubbleBg: "bg-gradient-to-br from-indigo-600 to-slate-900",
  },
  Accountant: {
    icon: Calculator,
    pillBorder: "border-emerald-300/80",
    pillBg: "bg-emerald-50/40",
    textColor: "text-emerald-800",
    bubbleBg: "bg-gradient-to-br from-emerald-600 to-teal-800",
  },
  "Exam Controller": {
    icon: FileCheck2,
    pillBorder: "border-blue-300/80",
    pillBg: "bg-blue-50/40",
    textColor: "text-blue-800",
    bubbleBg: "bg-gradient-to-br from-blue-600 to-indigo-800",
  },
  Receptionist: {
    icon: PhoneCall,
    pillBorder: "border-teal-300/80",
    pillBg: "bg-teal-50/40",
    textColor: "text-teal-800",
    bubbleBg: "bg-gradient-to-br from-teal-600 to-cyan-800",
  },
  "IT Support": {
    icon: Laptop,
    pillBorder: "border-slate-300/80",
    pillBg: "bg-slate-50/40",
    textColor: "text-slate-800",
    bubbleBg: "bg-gradient-to-br from-slate-700 to-slate-900",
  },
};

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  const cfg = ROLE_CONFIGS[role] || {
    icon: UserCheck,
    pillBorder: "border-border/80",
    pillBg: "bg-white",
    textColor: "text-foreground",
    bubbleBg: "bg-[#091d3e]",
  };
  const Icon = cfg.icon;

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-2 rounded-full border py-0 pl-1 pr-3 text-xs font-semibold shadow-[0_1px_2px_rgb(9_29_62/0.05)] select-none whitespace-nowrap transition-transform duration-150 hover:scale-[1.02]",
        cfg.pillBorder,
        cfg.pillBg,
        cfg.textColor,
        className
      )}
    >
      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full text-white shadow-2xs ring-1 ring-white/20",
          cfg.bubbleBg
        )}
      >
        <Icon className="size-3 text-white" />
      </span>
      <span className="leading-none">{role}</span>
    </span>
  );
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

export function UsersTable({ data, onViewUser, onSelectUser, onStatusChange }: UserTableProps) {
  const columns = React.useMemo<Column<User>[]>(
    () => [
      {
        key: "name",
        header: "User & Profile",
        align: "left",
        cell: (row) => <PersonCell name={row.name} />,
        sortValue: (row) => row.name,
      },
      {
        key: "role",
        header: "Role",
        align: "center",
        headerAlign: "center",
        cell: (row) => (
          <div className="flex items-center justify-center">
            <RoleBadge role={row.role} />
          </div>
        ),
        sortValue: (row) => row.role,
        className: "whitespace-nowrap",
      },
      {
        key: "campus",
        header: "Campus / Scope",
        align: "center",
        headerAlign: "center",
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
        headerAlign: "center",
        cell: (row) => (
          <span className="text-[12px] tabular-nums text-muted-foreground whitespace-nowrap">
            {row.lastLogin ? formatDateTime(row.lastLogin) : "Never"}
          </span>
        ),
        sortValue: (row) => row.lastLogin ?? "",
        className: "whitespace-nowrap",
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        headerAlign: "center",
        cell: (row) => {
          const isSuperAdmin = row.role === "Super Admin";
          if (isSuperAdmin) {
            const cfg = STATUS_ICON_STYLES[row.status] ?? STATUS_ICON_STYLES.Active;
            const StatusIcon = cfg.icon;
            return (
              <div className="flex items-center justify-center">
                <span
                  className={cn(
                    "inline-flex size-7 shrink-0 items-center justify-center rounded-md border select-none",
                    cfg.className
                  )}
                  title={`Status: ${cfg.label} (Protected root account)`}
                  aria-label={`Status: ${cfg.label}`}
                >
                  <StatusIcon className="size-3.5" />
                </span>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-center">
              <UserStatusDropdown
                status={row.status}
                onStatusChange={(newStatus) => onStatusChange?.(row.id, newStatus)}
              />
            </div>
          );
        },
        sortValue: (row) => row.status,
        className: "whitespace-nowrap",
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        headerAlign: "center",
        cell: (row) => {
          const isSuperAdmin = row.role === "Super Admin";

          return (
            <div className="inline-flex items-center justify-center gap-1 whitespace-nowrap">
              {onViewUser && (
                <ActionIconButton
                  tone="view"
                  onClick={() => onViewUser(row)}
                  aria-label={`View details for ${row.name}`}
                  title="View full user details"
                >
                  <Eye />
                </ActionIconButton>
              )}

              {isSuperAdmin ? (
                <span
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-rose-200/80 bg-rose-50/75 text-rose-600 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-400 select-none shadow-2xs"
                  title="Protected root account — editing is locked"
                  aria-label="Protected root account"
                >
                  <Lock className="size-3.5" />
                </span>
              ) : (
                onSelectUser && (
                  <ActionIconButton
                    tone="edit"
                    onClick={() => onSelectUser(row)}
                    aria-label={`Edit ${row.name}`}
                    title="Edit user details, assignments, or reset password"
                  >
                    <Pencil />
                  </ActionIconButton>
                )
              )}
            </div>
          );
        },
        className: "whitespace-nowrap",
      },
    ],
    [onViewUser, onSelectUser, onStatusChange]
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
