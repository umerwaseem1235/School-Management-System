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
import { formatCampusDisplay } from "@/lib/format";
import { STUDENTS } from "@/lib/mock/institution";
import { cn } from "@/lib/utils";
import type { FeeStatus, Student, StudentStatus } from "@/types";
import { Check, ChevronDown, Eye } from "lucide-react";
import { toast } from "sonner";
import { StudentDetailsDialog } from "./student-details-dialog";

interface StudentsTableProps {
  data?: Student[];
  onStatusChange?: (id: string, newStatus: StudentStatus) => void;
  onFeeStatusChange?: (id: string, newFeeStatus: FeeStatus) => void;
  onViewStudent?: (student: Student) => void;
}

const STATUS_CONFIG: {
  status: StudentStatus;
  label: string;
  tone: "success" | "info" | "brand" | "danger";
  desc: string;
}[] = [
  {
    status: "Active",
    label: "Active",
    tone: "success",
    desc: "Currently enrolled & attending",
  },
  {
    status: "Transferred",
    label: "Transferred",
    tone: "info",
    desc: "Moved to another campus branch",
  },
  {
    status: "Alumni",
    label: "Alumni",
    tone: "brand",
    desc: "Graduated or program completed",
  },
  {
    status: "Suspended",
    label: "Suspended",
    tone: "danger",
    desc: "Temporarily blocked from classes",
  },
];

const FEE_CONFIG: {
  status: FeeStatus;
  label: string;
  tone: "success" | "warning" | "info" | "danger";
}[] = [
  { status: "Paid", label: "Paid", tone: "success" },
  { status: "Partial", label: "Partial", tone: "info" },
  { status: "Unpaid", label: "Unpaid", tone: "warning" },
  { status: "Overdue", label: "Overdue", tone: "danger" },
];

function StudentStatusDropdown({
  status,
  studentName,
  onStatusChange,
}: {
  status: StudentStatus;
  studentName: string;
  onStatusChange?: (status: StudentStatus) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group inline-flex items-center gap-1 rounded-full outline-none transition-all hover:scale-102 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
        title="Click to change student status"
      >
        <StatusBadge status={status} dot={false} className="cursor-pointer group-hover:brightness-95 shadow-2xs" />
        <ChevronDown className="size-3 text-muted-foreground/60 transition-transform group-data-[popup-open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56 p-1.5 rounded-xl shadow-xl border border-border/70 bg-popover text-popover-foreground animate-in fade-in-50 zoom-in-95 duration-100"
      >
        <DropdownMenuGroup className="space-y-0.5">
          <DropdownMenuLabel className="px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            Change Status
          </DropdownMenuLabel>
          {STATUS_CONFIG.map((opt) => {
            const isCurrent = opt.status === status;
            return (
              <DropdownMenuItem
                key={opt.status}
                onClick={() => {
                  if (!isCurrent && onStatusChange) {
                    onStatusChange(opt.status);
                    toast.success("Status Updated", {
                      description: `${studentName} is now marked as ${opt.label}.`,
                    });
                  }
                }}
                className={cn(
                  "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors",
                  isCurrent ? "bg-accent/80 font-semibold" : "hover:bg-accent/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      opt.tone === "success" && "bg-success",
                      opt.tone === "info" && "bg-info",
                      opt.tone === "brand" && "bg-brand",
                      opt.tone === "danger" && "bg-danger"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="text-[12px]">{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground font-normal leading-tight">
                      {opt.desc}
                    </span>
                  </div>
                </div>
                {isCurrent && <Check className="size-3.5 text-primary shrink-0" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FeeStatusDropdown({
  status,
  studentName,
  onFeeStatusChange,
}: {
  status: FeeStatus;
  studentName: string;
  onFeeStatusChange?: (status: FeeStatus) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group inline-flex items-center gap-1 rounded-full outline-none transition-all hover:scale-102 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
        title="Click to update fee status"
      >
        <StatusBadge status={status} dot={false} className="cursor-pointer group-hover:brightness-95 shadow-2xs" />
        <ChevronDown className="size-3 text-muted-foreground/60 transition-transform group-data-[popup-open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-44 p-1.5 rounded-xl shadow-xl border border-border/70 bg-popover text-popover-foreground animate-in fade-in-50 zoom-in-95 duration-100"
      >
        <DropdownMenuGroup className="space-y-0.5">
          <DropdownMenuLabel className="px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            Update Fee Status
          </DropdownMenuLabel>
          {FEE_CONFIG.map((opt) => {
            const isCurrent = opt.status === status;
            return (
              <DropdownMenuItem
                key={opt.status}
                onClick={() => {
                  if (!isCurrent && onFeeStatusChange) {
                    onFeeStatusChange(opt.status);
                    toast.success("Fee Status Updated", {
                      description: `${studentName}'s fee is marked as ${opt.label}.`,
                    });
                  }
                }}
                className={cn(
                  "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors",
                  isCurrent ? "bg-accent/80 font-semibold" : "hover:bg-accent/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      opt.tone === "success" && "bg-success",
                      opt.tone === "info" && "bg-info",
                      opt.tone === "warning" && "bg-warning",
                      opt.tone === "danger" && "bg-danger"
                    )}
                  />
                  <span className="text-[12px]">{opt.label}</span>
                </div>
                {isCurrent && <Check className="size-3.5 text-primary shrink-0" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function StudentsTable({
  data = STUDENTS,
  onStatusChange,
  onFeeStatusChange,
  onViewStudent,
}: StudentsTableProps) {
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);

  const activeStudent = React.useMemo(
    () => (selectedStudent ? data.find((s) => s.id === selectedStudent.id) ?? selectedStudent : null),
    [data, selectedStudent]
  );

  const columns = React.useMemo<Column<Student>[]>(
    () => [
      {
        key: "student",
        header: "Student",
        cell: (r) => <PersonCell name={r.name} subtitle={r.admissionNumber} />,
        sortValue: (r) => r.name,
      },
      {
        key: "class",
        header: "Class & Section",
        cell: (r) => (
          <span className="text-[13px] font-medium text-foreground/90">
            {r.className} - {r.section}
          </span>
        ),
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
        key: "feeStatus",
        header: "Fee Status",
        cell: (r) => (
          <FeeStatusDropdown
            status={r.feeStatus}
            studentName={r.name}
            onFeeStatusChange={(newStatus) => onFeeStatusChange?.(r.id, newStatus)}
          />
        ),
        sortValue: (r) => r.feeStatus,
      },
      {
        key: "status",
        header: "Status",
        cell: (r) => (
          <StudentStatusDropdown
            status={r.status}
            studentName={r.name}
            onStatusChange={(newStatus) => onStatusChange?.(r.id, newStatus)}
          />
        ),
        sortValue: (r) => r.status,
      },
      {
        key: "actions",
        header: "",
        cell: (r) => (
          <div className="flex items-center justify-end pr-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                onViewStudent?.(r);
                setSelectedStudent(r);
              }}
              className="h-7.5 gap-1.5 px-3 rounded-lg text-xs font-semibold text-foreground/80 border-border/80 hover:border-brand/40 hover:bg-brand-50 hover:text-brand shadow-2xs transition-all duration-150 active:scale-95"
            >
              <Eye className="size-3.5 text-brand" />
              <span>View</span>
            </Button>
          </div>
        ),
        className: "w-24 text-right",
      },
    ],
    [onStatusChange, onFeeStatusChange, onViewStudent]
  );

  const uniqueCampuses = React.useMemo(
    () => [...new Set(data.map((s) => s.campus))],
    [data]
  );

  const campusOptions = React.useMemo(
    () =>
      uniqueCampuses.map((c) => ({
        value: c,
        label: formatCampusDisplay(c).label,
      })),
    [uniqueCampuses]
  );

  const classes = React.useMemo(
    () => [...new Set(data.map((s) => s.className))],
    [data]
  );

  const filters = React.useMemo<FilterDef<Student>[]>(
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
        key: "class",
        label: "Class",
        allLabel: "All Classes",
        options: classes,
        triggerClassName: "w-[130px] shrink-0",
        getValue: (r) => r.className,
      },
      {
        key: "status",
        label: "Status",
        allLabel: "All Statuses",
        options: ["Active", "Transferred", "Alumni", "Suspended"],
        triggerClassName: "w-[120px] shrink-0",
        getValue: (r) => r.status,
      },
    ],
    [campusOptions, classes]
  );

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        searchPlaceholder="Search students…"
        searchFn={(r, q) =>
          r.name.toLowerCase().includes(q) ||
          r.admissionNumber.toLowerCase().includes(q) ||
          r.rollNo.toLowerCase().includes(q)
        }
        filters={filters}
        pageSize={8}
      />
      <StudentDetailsDialog
        student={activeStudent}
        open={Boolean(activeStudent)}
        onOpenChange={(open) => {
          if (!open) setSelectedStudent(null);
        }}
      />
    </>
  );
}
