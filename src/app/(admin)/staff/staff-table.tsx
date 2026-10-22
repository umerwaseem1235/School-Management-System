"use client";

import * as React from "react";
import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
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
import { formatCampusDisplay, initials } from "@/lib/format";
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
        className="group inline-flex items-center gap-1 rounded-full outline-none transition-all hover:scale-102 active:scale-95 cursor-pointer focus-visible:ring-1 focus-visible:ring-ring"
        title="Click to change status or deactivate"
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
            Change Staff Status
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
        cell: (r) => (
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand font-heading text-xs font-bold ring-1 ring-brand/20">
              {initials(r.name)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-foreground text-[13px] leading-tight truncate">
                {r.name}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground mt-0.5">
                {r.empCode}
              </span>
            </div>
          </div>
        ),
        sortValue: (r) => r.name,
        className: "px-4 py-3",
        headerClassName: "px-4",
      },
      {
        key: "designation",
        header: "Role & Department",
        cell: (r) => (
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-foreground leading-tight truncate">
              {r.designation}
            </span>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground">
                {r.department}
              </span>
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] font-semibold ${
                  r.type === "Teaching"
                    ? "bg-brand-50 text-brand"
                    : "bg-muted/80 text-muted-foreground"
                }`}
              >
                {r.type}
              </span>
            </div>
          </div>
        ),
        sortValue: (r) => r.designation,
        className: "px-4 py-3",
        headerClassName: "px-4",
      },
      {
        key: "campus",
        header: "Campus",
        cell: (r) => {
          const info = formatCampusDisplay(r.campus);
          return (
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-xs font-medium text-foreground truncate">{info.primary}</span>
              {info.secondary && (
                <span className="text-[11px] text-muted-foreground truncate">{info.secondary}</span>
              )}
            </div>
          );
        },
        sortValue: (r) => r.campus,
        className: "px-4 py-3",
        headerClassName: "px-4",
      },
      {
        key: "contact",
        header: "Phone",
        cell: (r) => (
          <span className="text-xs font-mono font-medium text-foreground whitespace-nowrap">
            {r.phone}
          </span>
        ),
        sortValue: (r) => r.phone,
        className: "px-4 py-3 whitespace-nowrap",
        headerClassName: "px-4",
      },
      {
        key: "actions",
        header: "Status / Action",
        cell: (r) => (
          <div className="flex items-center justify-end gap-2 whitespace-nowrap">
            {/* Clickable Status Badge Dropdown */}
            <StaffStatusDropdown
              status={r.status}
              onStatusChange={(newStatus) => onStatusChange?.(r.id, newStatus)}
            />

            {/* Quick View Button */}
            <Button
              variant="outline"
              size="xs"
              onClick={() => onSelectStaff(r)}
              className="h-7 gap-1 px-2.5 rounded-lg text-xs font-semibold border-border/80 text-brand hover:bg-brand-50 hover:text-brand hover:border-brand/40 shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="View Complete Staff Details"
            >
              <Eye className="size-3.5" />
              <span>View</span>
            </Button>
          </div>
        ),
        className: "px-4 py-3 text-right whitespace-nowrap",
        headerClassName: "px-4 text-right",
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
      tableClassName="w-full text-sm"
    />
  );
}
