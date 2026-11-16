"use client";

import * as React from "react";
import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { UserAvatar } from "@/components/shared/user-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionIconButton } from "@/components/shared/action-icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCampusDisplay, formatStaffRole } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StaffMember, Status } from "@/types";
import { Check, ChevronDown, Eye } from "lucide-react";

interface StaffTableProps {
  data: StaffMember[];
  onSelectStaff: (staff: StaffMember) => void;
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
    desc: "Currently on duty & active",
  },
  {
    status: "Inactive",
    label: "Inactive",
    tone: "neutral",
    desc: "Deactivated / relieved / on leave",
  },
  {
    status: "Suspended",
    label: "Suspended",
    tone: "danger",
    desc: "Temporarily suspended / blocked",
  },
  {
    status: "Pending",
    label: "Pending",
    tone: "warning",
    desc: "Awaiting verification / onboarding",
  },
];

function StaffStatusDropdown({
  status,
  onStatusChange,
}: {
  status: Status;
  onStatusChange?: (status: Status) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group inline-flex items-center gap-1 rounded-full outline-none transition-all hover:scale-102 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
        title="Click to change status or deactivate"
      >
        <StatusBadge
          status={status}
          dot={false}
          className="cursor-pointer group-hover:brightness-95 shadow-2xs"
        />
        <ChevronDown className="size-3 text-muted-foreground/60 transition-transform group-data-[popup-open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56 p-1.5 rounded-xl shadow-xl border border-border/70 bg-popover text-popover-foreground"
      >
        <DropdownMenuGroup className="space-y-0.5">
          <DropdownMenuLabel className="px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            Change Staff Status
          </DropdownMenuLabel>
          {STATUS_OPTIONS.map((opt) => {
            const isCurrent = opt.status === status;
            return (
              <DropdownMenuItem
                key={opt.status}
                selected={isCurrent}
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
                      opt.tone === "success" && "bg-success",
                      opt.tone === "neutral" && "bg-muted-foreground",
                      opt.tone === "danger" && "bg-danger",
                      opt.tone === "warning" && "bg-warning"
                    )}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[12px] leading-tight">{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground font-normal leading-tight truncate">
                      {opt.desc}
                    </span>
                  </div>
                </div>
                {isCurrent && <Check className="size-3.5 text-primary shrink-0 ml-1.5" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function StaffTable({
  data,
  onSelectStaff,
  onStatusChange,
}: StaffTableProps) {
  // Unique filter lists
  const campuses = React.useMemo(() => [...new Set(data.map((s) => s.campus))], [data]);
  const campusOptions = React.useMemo(
    () =>
      campuses.map((c) => ({
        value: c,
        label: formatCampusDisplay(c).label,
      })),
    [campuses]
  );

  const departments = React.useMemo(() => [...new Set(data.map((s) => s.department))], [data]);

  const columns = React.useMemo<Column<StaffMember>[]>(
    () => [
      {
        key: "staff",
        header: "Staff Member",
        align: "center",
        headerAlign: "center",
        className: "w-[25%] min-w-0 px-3 sm:px-4 text-center",
        headerClassName: "w-[25%] px-3 sm:px-4 text-center",
        cell: (r) => (
          <div className="w-[185px] max-w-full mx-auto flex items-center gap-2.5 text-left">
            <UserAvatar name={r.name} size="sm" className="shrink-0" />
            <span
              className="text-[13px] font-semibold text-foreground whitespace-nowrap truncate text-left"
              title={r.name}
            >
              {r.name}
            </span>
          </div>
        ),
        sortValue: (r) => r.name,
      },
      {
        key: "designation",
        header: "Role",
        align: "center",
        headerAlign: "center",
        className: "w-[18%] min-w-0 px-3 sm:px-4 text-center",
        headerClassName: "w-[18%] px-3 sm:px-4 text-center",
        cell: (r) => (
          <span
            className="text-[13px] font-medium text-foreground/90 whitespace-nowrap"
            title={r.designation}
          >
            {formatStaffRole(r.designation)}
          </span>
        ),
        sortValue: (r) => formatStaffRole(r.designation),
      },
      {
        key: "campus",
        header: "Campus",
        align: "center",
        headerAlign: "center",
        className: "w-[17%] px-3 sm:px-4 text-center",
        headerClassName: "w-[17%] px-3 sm:px-4 text-center",
        cell: (r) => {
          const info = formatCampusDisplay(r.campus);
          return (
            <span
              className="text-[13px] font-medium text-foreground whitespace-nowrap"
              title={info.secondary ? `${info.primary} (${info.secondary})` : info.primary}
            >
              {info.primary}
            </span>
          );
        },
        sortValue: (r) => r.campus,
      },
      {
        key: "contact",
        header: "Phone",
        align: "center",
        headerAlign: "center",
        className: "w-[15%] px-3 sm:px-4 text-center",
        headerClassName: "w-[15%] px-3 sm:px-4 text-center",
        cell: (r) => (
          <span className="text-[13px] font-medium text-foreground/90 tabular-nums whitespace-nowrap">
            {r.phone}
          </span>
        ),
        sortValue: (r) => r.phone,
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        headerAlign: "center",
        className: "w-[14%] px-3 sm:px-4 text-center",
        headerClassName: "w-[14%] px-3 sm:px-4 text-center",
        cell: (r) => (
          <div className="flex items-center justify-center">
            <StaffStatusDropdown
              status={r.status}
              onStatusChange={(newStatus) => onStatusChange?.(r.id, newStatus)}
            />
          </div>
        ),
        sortValue: (r) => r.status,
      },
      {
        key: "actions",
        header: "Action",
        align: "center",
        headerAlign: "center",
        className: "w-[11%] px-3 sm:px-4 text-center whitespace-nowrap",
        headerClassName: "w-[11%] px-3 sm:px-4 text-center whitespace-nowrap",
        cell: (r) => (
          <div className="flex items-center justify-center">
            <ActionIconButton
              tone="view"
              onClick={() => onSelectStaff(r)}
              aria-label={`View profile for ${r.name}`}
              title={`View complete profile: ${r.name} (${r.empCode}) — ${r.designation}`}
            >
              <Eye />
            </ActionIconButton>
          </div>
        ),
      },
    ],
    [onSelectStaff, onStatusChange]
  );

  const filters = React.useMemo<FilterDef<StaffMember>[]>(
    () => [
      {
        key: "campus",
        label: "Campus",
        allLabel: "All Campuses",
        options: campusOptions,
        triggerClassName: "w-[150px] shrink-0",
        getValue: (r) => r.campus,
      },
      {
        key: "type",
        label: "Type",
        allLabel: "All Types",
        options: ["Teaching", "Non-Teaching"],
        triggerClassName: "w-[120px] shrink-0",
        getValue: (r) => r.type,
      },
      {
        key: "department",
        label: "Department",
        allLabel: "All Departments",
        options: departments,
        triggerClassName: "w-[145px] shrink-0",
        getValue: (r) => r.department,
      },
      {
        key: "status",
        label: "Status",
        allLabel: "All Statuses",
        options: ["Active", "Inactive", "Suspended", "Pending"],
        triggerClassName: "w-[120px] shrink-0",
        getValue: (r) => r.status,
      },
    ],
    [campusOptions, departments]
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      getRowId={(r) => r.id}
      searchPlaceholder="Search staff…"
      searchFn={(r, q) =>
        r.name.toLowerCase().includes(q) ||
        r.empCode.toLowerCase().includes(q) ||
        r.designation.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.cnic ? r.cnic.toLowerCase().includes(q) : false) ||
        (r.assignedClasses ? r.assignedClasses.toLowerCase().includes(q) : false) ||
        (r.assignedSubjects ? r.assignedSubjects.toLowerCase().includes(q) : false) ||
        (r.classTeacherOf ? r.classTeacherOf.toLowerCase().includes(q) : false)
      }
      filters={filters}
      pageSize={8}
      tableClassName="w-full table-fixed"
      containerClassName="overflow-x-clip"
    />
  );
}
