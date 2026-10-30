"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CalendarClock,
  Check,
  CheckCheck,
  Download,
  FileCheck2,
  FileText,
  FileX2,
  GraduationCap,
  MapPin,
  Paperclip,
  Pencil,
  Plus,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { PersonCell, UserAvatar } from "@/components/shared/user-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Meter } from "@/components/shared/meter";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  AttendanceActionButton,
  Field,
  fieldClass,
} from "../_components/attendance-ui";
import { shortCampus } from "../_components/attendance-utils";
import {
  EXTENDED_LEAVE_REQUESTS,
  type ExtendedLeaveRequest,
} from "@/lib/mock/attendance";
import { formatDate, formatNumber } from "@/lib/format";

type Status = ExtendedLeaveRequest["status"];

const CAMPUS_OPTIONS = [
  ...new Set(EXTENDED_LEAVE_REQUESTS.map((l) => l.campus)),
];

const LEAVE_TYPE_CONFIG: Record<
  string,
  { label: string; text: string; bg: string; ring: string; dot: string }
> = {
  Medical: {
    label: "Medical",
    text: "text-danger",
    bg: "bg-danger-soft/75",
    ring: "ring-danger/25",
    dot: "bg-danger",
  },
  Emergency: {
    label: "Emergency",
    text: "text-warning",
    bg: "bg-warning-soft/80",
    ring: "ring-warning/30",
    dot: "bg-warning",
  },
  Annual: {
    label: "Annual",
    text: "text-success",
    bg: "bg-success-soft/75",
    ring: "ring-success/25",
    dot: "bg-success",
  },
  Casual: {
    label: "Casual",
    text: "text-brand",
    bg: "bg-brand-50/80",
    ring: "ring-brand/15",
    dot: "bg-brand",
  },
  "Short Leave": {
    label: "Short Leave",
    text: "text-info",
    bg: "bg-info-soft/75",
    ring: "ring-info/25",
    dot: "bg-info",
  },
};

const tableFilters: FilterDef<ExtendedLeaveRequest>[] = [
  {
    key: "applicantType",
    label: "Applicant",
    options: ["Staff", "Student"],
    getValue: (r) => r.applicantType,
  },
  {
    key: "leaveType",
    label: "Leave Type",
    options: ["Casual", "Medical", "Annual", "Emergency", "Short Leave"],
    getValue: (r) => r.leaveType,
  },
  {
    key: "campus",
    label: "Campus",
    options: CAMPUS_OPTIONS,
    getValue: (r) => r.campus,
  },
  {
    key: "status",
    label: "Status",
    options: ["Pending", "Approved", "Rejected"],
    getValue: (r) => r.status,
  },
];

const DECIDER = "Hamza Tariq (Super Admin)";

export function LeaveRequestsClient() {
  const [requests, setRequests] = React.useState<ExtendedLeaveRequest[]>(
    EXTENDED_LEAVE_REQUESTS
  );
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [selectedRequest, setSelectedRequest] = React.useState<ExtendedLeaveRequest | null>(null);


  // New-request form
  const [applicantType, setApplicantType] = React.useState<"Staff" | "Student">(
    "Staff"
  );
  const [applicantName, setApplicantName] = React.useState("");
  const [departmentOrClass, setDepartmentOrClass] = React.useState("");
  const [campus, setCampus] = React.useState(CAMPUS_OPTIONS[0]);
  const [leaveType, setLeaveType] =
    React.useState<ExtendedLeaveRequest["leaveType"]>("Casual");
  const [startDate, setStartDate] = React.useState("2026-10-14");
  const [endDate, setEndDate] = React.useState("2026-10-15");
  const [substitute, setSubstitute] = React.useState("");
  const [reason, setReason] = React.useState("");

  const counts = React.useMemo(() => {
    const by = (s: Status) => requests.filter((r) => r.status === s).length;
    const staffTotal = requests.filter((r) => r.applicantType === "Staff").length;
    const studentTotal = requests.filter(
      (r) => r.applicantType === "Student"
    ).length;
    return {
      all: requests.length,
      pending: by("Pending"),
      approved: by("Approved"),
      rejected: by("Rejected"),
      staffTotal,
      studentTotal,
      approvedDays: requests
        .filter((r) => r.status === "Approved")
        .reduce((acc, r) => acc + r.days, 0),
      staffPending: requests.filter(
        (r) => r.status === "Pending" && r.applicantType === "Staff"
      ).length,
      studentPending: requests.filter(
        (r) => r.status === "Pending" && r.applicantType === "Student"
      ).length,
    };
  }, [requests]);

  const decide = React.useCallback((ids: Set<string>, status: Status) => {
    setRequests((prev) =>
      prev.map((r) =>
        ids.has(r.id)
          ? {
              ...r,
              status,
              approvedBy: status === "Pending" ? undefined : DECIDER,
            }
          : r
      )
    );
  }, []);

  const handleDecision = React.useCallback(
    (request: ExtendedLeaveRequest, status: Status) => {
      decide(new Set([request.id]), status);
      if (status === "Approved")
        toast.success(`Approved leave for ${request.applicant}`);
      else if (status === "Rejected")
        toast.error(`Rejected leave for ${request.applicant}`);
      else toast.info(`Reopened request for ${request.applicant}`);
    },
    [decide]
  );

  const handleApproveAllPending = () => {
    const pendingIds = requests
      .filter((r) => r.status === "Pending")
      .map((r) => r.id);
    if (pendingIds.length === 0) {
      toast.info("No pending leave requests to approve.");
      return;
    }
    decide(new Set(pendingIds), "Approved");
    toast.success(`Approved all ${pendingIds.length} pending requests.`);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !reason.trim()) {
      toast.error("Please enter applicant name and reason.");
      return;
    }
    const days = Math.max(
      1,
      Math.round(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          86_400_000
      ) + 1
    );
    const next: ExtendedLeaveRequest = {
      id: `lv-${Date.now()}`,
      refNo: `LV-2026-${String(846 + requests.length).padStart(4, "0")}`,
      applicant: applicantName.trim(),
      applicantCode:
        applicantType === "Staff"
          ? `EMP-${String(500 + requests.length).padStart(4, "0")}`
          : `2026-${String(450 + requests.length).padStart(4, "0")}`,
      applicantType,
      departmentOrClass:
        departmentOrClass.trim() ||
        (applicantType === "Staff" ? "Sciences · Teaching" : "Grade 9 - A"),
      campus,
      leaveType,
      startDate,
      endDate,
      days,
      reason: reason.trim(),
      substituteAssigned:
        applicantType === "Staff" && substitute.trim()
          ? substitute.trim()
          : undefined,
      hasAttachment: leaveType === "Medical",
      appliedOn: "2026-10-12",
      status: "Pending",
      leaveBalanceRemaining: 9,
      leaveBalanceTotal: 12,
    };
    setRequests((prev) => [next, ...prev]);
    setDialogOpen(false);
    setApplicantName("");
    setDepartmentOrClass("");
    setSubstitute("");
    setReason("");
    toast.success(`Request ${next.refNo} logged for ${next.applicant}`);
  };

  const columns = React.useMemo<Column<ExtendedLeaveRequest>[]>(
    () => [
      {
        key: "applicant",
        header: "Applicant Name",
        headerAlign: "left",
        align: "left",
        className: "w-[22%]",
        headerClassName: "w-[22%] text-left",
        cell: (r) => (
          <PersonCell
            name={r.applicant}
            subtitle={`${r.refNo} · ${r.applicantCode}`}
            showAvatar={false}
          />
        ),
      },
      {
        key: "category",
        header: "Category",
        align: "center",
        cell: (r) => {
          const isStaff = r.applicantType === "Staff";
          return (
            <div className="flex items-center justify-center">
              <span
                className={cn(
                  "inline-flex h-7 w-[92px] items-center gap-2 rounded-lg border bg-white py-0 pl-1 pr-2.5 text-xs font-semibold shadow-[0_1px_2px_rgb(9_29_62/0.05)]",
                  isStaff
                    ? "border-brand/20 text-brand"
                    : "border-sky-400/40 bg-sky-50/70 text-sky-700"
                )}
              >
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-md",
                    isStaff ? "bg-brand text-white" : "bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-[0_2px_6px_-1px_rgb(14_165_233/0.45)]"
                  )}
                >
                  {isStaff ? (
                    <UserCheck className="size-3" />
                  ) : (
                    <GraduationCap className="size-3" />
                  )}
                </span>
                <span className="leading-none">{r.applicantType}</span>
              </span>
            </div>
          );
        },
      },
      {
        key: "period",
        header: "Leave Period",
        align: "center",
        cell: (r) => (
          <div className="flex items-center justify-center gap-2 whitespace-nowrap text-xs tabular-nums">
            <span className="font-semibold text-foreground">
              {formatDate(r.startDate)}
            </span>
            <ArrowRight className="size-3 shrink-0 text-muted-foreground/70" />
            <span className="font-semibold text-foreground">
              {formatDate(r.endDate)}
            </span>
          </div>
        ),
      },
      {
        key: "quota",
        header: "Quota Left",
        align: "center",
        cell: (r) => {
          const pct = Math.round(
            (r.leaveBalanceRemaining / r.leaveBalanceTotal) * 100
          );
          return (
            <div className="mx-auto w-16 space-y-1.5 text-center">
              <div className="flex justify-center text-xs">
                <span className="font-bold tabular-nums text-foreground">
                  {r.leaveBalanceRemaining}/{r.leaveBalanceTotal}d
                </span>
              </div>
              <Meter
                value={pct}
                size="xs"
                tone="dark-blue"
                className="h-1"
              />
            </div>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        headerClassName: "text-center",
        cell: (r) => (
          <div className="flex items-center justify-center">
            <AttendanceActionButton
              size="xs"
              tone="outline"
              title="View full details"
              onClick={() => {
                setSelectedRequest(r);
                setViewDialogOpen(true);
              }}
            >
              <Eye className="size-3.5" />
              View
            </AttendanceActionButton>
          </div>
        ),
      },
    ],
    [handleDecision]
  );

  return (
    <>
      <PageHeader
        title="Leave Requests"
        actions={
          <>
            <AttendanceActionButton
              tone="success"
              onClick={handleApproveAllPending}
            >
              <CheckCheck />
              Approve Pending ({counts.pending})
            </AttendanceActionButton>
            <AttendanceActionButton
              tone="outline"
              onClick={() =>
                toast.success("Leave ledger exported as Excel (.xlsx)")
              }
            >
              <Download />
              Export Ledger
            </AttendanceActionButton>
            <AttendanceActionButton
              tone="primary"
              onClick={() => setDialogOpen(true)}
            >
              <Plus />
              New Leave Request
            </AttendanceActionButton>
          </>
        }
      />

      {/* Top 4 Dashboard StatCards */}
      <div className="mb-6">
        <StatGrid className="max-w-none sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Pending Approval"
            value={formatNumber(counts.pending)}
            icon={CalendarClock}
          />
          <StatCard
            label="Approved Leaves"
            value={formatNumber(counts.approved)}
            icon={FileCheck2}
          />
          <StatCard
            label="Rejected Leaves"
            value={formatNumber(counts.rejected)}
            icon={FileX2}
          />
          <StatCard
            label="Total Applications"
            value={formatNumber(counts.all)}
            icon={Users}
          />
        </StatGrid>
      </div>

      <SectionCard
        title="Unified Leave Applications Register"
        flush
      >
        <DataTable
          data={requests}
          columns={columns}
          getRowId={(r) => r.id}
          searchPlaceholder="Search applicant by name, ID..."
          searchFn={(r, q) =>
            r.applicant.toLowerCase().includes(q) ||
            r.applicantCode.toLowerCase().includes(q) ||
            r.refNo.toLowerCase().includes(q) ||
            r.leaveType.toLowerCase().includes(q)
          }
          filters={tableFilters}
          pageSize={8}
        />
      </SectionCard>

      {/* New Leave Request Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Leave Request</DialogTitle>
            <DialogDescription>
              Log a leave application on behalf of a staff member or student.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3.5 py-1">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Applicant Category">
                <select
                  className={fieldClass}
                  value={applicantType}
                  onChange={(e) =>
                    setApplicantType(e.target.value as "Staff" | "Student")
                  }
                >
                  <option value="Staff">Staff Member</option>
                  <option value="Student">Student</option>
                </select>
              </Field>
              <Field label="Leave Type">
                <select
                  className={fieldClass}
                  value={leaveType}
                  onChange={(e) =>
                    setLeaveType(
                      e.target.value as ExtendedLeaveRequest["leaveType"]
                    )
                  }
                >
                  <option value="Casual">Casual Leave</option>
                  <option value="Medical">Medical Leave</option>
                  <option value="Annual">Annual Leave</option>
                  <option value="Emergency">Emergency Leave</option>
                  <option value="Short Leave">Short Leave</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Full Name">
                <input
                  required
                  className={fieldClass}
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder={
                    applicantType === "Staff"
                      ? "Mr. Adeel Hassan"
                      : "Ayesha Khan"
                  }
                />
              </Field>
              <Field
                label={
                  applicantType === "Staff"
                    ? "Department & Role"
                    : "Class & Section"
                }
              >
                <input
                  className={fieldClass}
                  value={departmentOrClass}
                  onChange={(e) => setDepartmentOrClass(e.target.value)}
                  placeholder={
                    applicantType === "Staff"
                      ? "Sciences · Senior Teacher"
                      : "Grade 8 - B"
                  }
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Campus">
                <select
                  className={fieldClass}
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                >
                  {CAMPUS_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {shortCampus(c)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Start Date">
                <input
                  type="date"
                  className={fieldClass}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Field>
              <Field label="End Date">
                <input
                  type="date"
                  className={fieldClass}
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Field>
            </div>

            {applicantType === "Staff" && (
              <Field label="Substitute Teacher (Optional)">
                <input
                  className={fieldClass}
                  value={substitute}
                  onChange={(e) => setSubstitute(e.target.value)}
                  placeholder="e.g. Mr. Fahad Mir"
                />
              </Field>
            )}

            <Field label="Reason">
              <textarea
                required
                rows={2}
                className="w-full rounded-lg border border-input bg-white p-2.5 text-sm outline-none focus:border-ring"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide reason for leave request…"
              />
            </Field>

            <DialogFooter>
              <AttendanceActionButton
                type="button"
                tone="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </AttendanceActionButton>
              <AttendanceActionButton type="submit" tone="primary">
                Submit Request
              </AttendanceActionButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
          {selectedRequest && (
            <>
              {/* Header — equal 24px padding on every side */}
              <DialogHeader className="gap-1 px-6 py-5">
                <div className="flex items-start justify-between gap-4 pr-8">
                  <div className="min-w-0">
                    <DialogTitle className="text-base font-bold leading-tight text-foreground">
                      Leave Request Details
                    </DialogTitle>
                    <DialogDescription className="mt-1 font-mono text-xs text-muted-foreground">
                      {selectedRequest.refNo} · Applied {formatDate(selectedRequest.appliedOn)}
                    </DialogDescription>
                  </div>
                  <StatusBadge status={selectedRequest.status} />
                </div>
              </DialogHeader>

              {/* Body */}
              <div className="space-y-6 border-t border-border/70 px-6 py-6">
                {/* Applicant */}
                <div className="flex items-center gap-4">
                  <UserAvatar
                    name={selectedRequest.applicant}
                    size="lg"
                    className="ring-2 ring-brand/15"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-bold text-foreground">
                      {selectedRequest.applicant}
                    </h3>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {selectedRequest.departmentOrClass.replace(
                        /^Languages(\s*·|\s*$)/i,
                        "Languages & Literature$1"
                      )}{" "}
                      · {shortCampus(selectedRequest.campus)} ·{" "}
                      <span className="font-mono">{selectedRequest.applicantCode}</span>
                    </p>
                  </div>
                </div>

                {/* Key facts — evenly divided columns */}
                <dl
                  className={cn(
                    "grid divide-x divide-border/70 overflow-hidden rounded-xl border border-border/70 bg-slate-50/60",
                    selectedRequest.substituteAssigned ? "grid-cols-3" : "grid-cols-2"
                  )}
                >
                  <div className="px-4 py-3.5">
                    <dt className="text-[11px] font-medium text-muted-foreground">Leave Type</dt>
                    <dd className="mt-1.5">
                      {(() => {
                        const cfg =
                          LEAVE_TYPE_CONFIG[selectedRequest.leaveType] ?? {
                            label: selectedRequest.leaveType,
                            text: "text-foreground",
                            bg: "bg-muted",
                            ring: "ring-border",
                            dot: "bg-muted-foreground",
                          };
                        return (
                          <span
                            className={cn(
                              "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
                              cfg.bg,
                              cfg.text,
                              cfg.ring
                            )}
                          >
                            {cfg.label}
                          </span>
                        );
                      })()}
                    </dd>
                  </div>
                  <div className="px-4 py-3.5">
                    <dt className="text-[11px] font-medium text-muted-foreground">Duration</dt>
                    <dd className="mt-1.5 text-sm font-bold leading-none text-foreground">
                      {selectedRequest.days} {selectedRequest.days === 1 ? "day" : "days"}
                    </dd>
                  </div>
                  {selectedRequest.substituteAssigned && (
                    <div className="px-4 py-3.5">
                      <dt className="text-[11px] font-medium text-muted-foreground">Substitute</dt>
                      <dd className="mt-1.5 truncate text-sm font-bold leading-none text-foreground">
                        {selectedRequest.substituteAssigned}
                      </dd>
                    </div>
                  )}
                </dl>

                {/* Reason */}
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Reason
                    </p>
                    {selectedRequest.hasAttachment && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                        <Paperclip className="size-3" /> Certificate attached
                      </span>
                    )}
                  </div>
                  <p className="mt-2 border-l-2 border-brand/30 pl-3.5 text-[13px] leading-relaxed text-foreground">
                    {selectedRequest.reason}
                  </p>
                </div>

                {selectedRequest.approvedBy && (
                  <p className="text-[11px] text-muted-foreground">
                    Decided by{" "}
                    <span className="font-semibold text-foreground">{selectedRequest.approvedBy}</span>
                  </p>
                )}
              </div>

              {/* Footer — equal 24px side padding, 16px vertical */}
              <DialogFooter className="m-0 flex-row items-center justify-end gap-2.5 rounded-none border-t border-border/70 bg-muted/30 px-6 py-4">
                <AttendanceActionButton
                  size="sm"
                  tone="outline"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Close
                </AttendanceActionButton>
                {selectedRequest.status === "Pending" ? (
                  <>
                    <AttendanceActionButton
                      size="sm"
                      tone="danger"
                      onClick={() => {
                        handleDecision(selectedRequest, "Rejected");
                        setViewDialogOpen(false);
                      }}
                    >
                      <X className="size-3.5" />
                      Reject
                    </AttendanceActionButton>
                    <AttendanceActionButton
                      size="sm"
                      tone="success"
                      onClick={() => {
                        handleDecision(selectedRequest, "Approved");
                        setViewDialogOpen(false);
                      }}
                    >
                      <Check className="size-3.5" />
                      Approve
                    </AttendanceActionButton>
                  </>
                ) : (
                  <AttendanceActionButton
                    size="sm"
                    tone="outline"
                    onClick={() => {
                      handleDecision(selectedRequest, "Pending");
                      setViewDialogOpen(false);
                    }}
                  >
                    Reopen
                  </AttendanceActionButton>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
