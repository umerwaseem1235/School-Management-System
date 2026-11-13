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
import {
  Award,
  Building2,
  Calculator,
  ChevronDown,
  FileCheck2,
  GraduationCap,
  Laptop,
  Lock,
  Pencil,
  PhoneCall,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

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
    textColor: "text-[#381e0f]",
    bubbleBg: "bg-gradient-to-b from-[#7c4424] to-[#5c3118]",
  },
  "Campus Admin": {
    icon: Building2,
    pillBorder: "border-brand/25",
    pillBg: "bg-white",
    textColor: "text-[#381e0f]",
    bubbleBg: "bg-gradient-to-b from-[#7c4424] to-[#5c3118]",
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
    textColor: "text-[#381e0f]",
    bubbleBg: "bg-[#6e3b1f]",
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
    bubbleBg: "bg-[#6e3b1f]",
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
