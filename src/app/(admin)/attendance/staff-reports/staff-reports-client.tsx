"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Download,
  Eye,
  Fingerprint,
  Phone,
  Printer,
  RefreshCw,
  Send,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { PersonCell, UserAvatar } from "@/components/shared/user-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Meter } from "@/components/shared/meter";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AttendanceActionButton,
  AttendanceDateRangePicker,
} from "../_components/attendance-ui";
import { shortCampus } from "../_components/attendance-utils";
import {
  STAFF_ATTENDANCE_RECORDS,
  type StaffAttendanceRecord,
} from "@/lib/mock/attendance";
import {
  downloadSingleStaffReportPdf,
  downloadStaffAttendanceReportPdf,
  formatShortDate,
  printStaffAttendanceReport,
} from "./staff-report-export";
import {
  StaffSearchSelector,
  type StaffSelectorOption,
} from "./staff-search-selector";



const campusOptions = [
  ...new Set(STAFF_ATTENDANCE_RECORDS.map((s) => s.campus)),
];

const departmentOptions = [
  ...new Set(STAFF_ATTENDANCE_RECORDS.map((s) => s.department)),
].sort();

const categoryOptions = ["Teaching", "Non-Teaching"];

const reportFilters: FilterDef<StaffAttendanceRecord>[] = [
  {
    key: "campus",
    label: "Campus",
    options: campusOptions,
    getValue: (r) => r.campus,
    className: "w-[145px]",
  },
  {
    key: "department",
    label: "Department",
    options: departmentOptions,
    getValue: (r) => r.department,
    className: "w-[165px]",
  },
  {
    key: "type",
    label: "Category",
    options: categoryOptions,
    getValue: (r) => r.type,
    className: "w-[145px]",
  },
];

const ALL_STAFF_VALUE = "all";

const ALL_STAFF_OPTIONS: StaffSelectorOption[] = Array.from(
  new Map(
    STAFF_ATTENDANCE_RECORDS.map((s) => [
      s.empId,
      {
        empId: s.empId,
        empCode: s.empCode,
        name: s.name,
        designation: s.designation,
        department: s.department,
        campus: s.campus,
        type: s.type,
        shift: s.shift,
        phone: s.phone,
        monthlyRate: s.monthlyRate,
        monthlyPunctuality: s.monthlyPunctuality,
        statusToday: s.statusToday,
      },
    ])
  ).values()
).sort((a, b) => a.name.localeCompare(b.name));

function formatShortDesignation(designation: string): string {
  return designation
    .replace(/^Senior Teacher\s*[—–-]\s*/i, "Sr. Teacher · ")
    .replace(/^Teacher\s*[—–-]\s*/i, "Teacher · ")
    .replace(/^Coordinator\s*[—–-]\s*/i, "Coord. · ")
    .replace(/^Head of\s+/i, "HOD · ")
    .replace(/Mathematics/i, "Math")
    .replace(/Computer Science/i, "CS")
    .replace(/Systems & Network Engineer/i, "Network Engineer");
}

function formatLatestStatusLine(r: StaffAttendanceRecord): string {
  if (r.statusToday === "On Leave") return "On Leave (Approved)";
  if (r.statusToday === "Absent") return "Absent (Unexcused)";
  return `${r.statusToday} (${r.checkIn})`;
}

function getStaffStandingStatus(rate: number): {
  label: string;
  tone: "success" | "warning" | "danger";
} {
  if (rate >= 85) return { label: "Compliant", tone: "success" };
  if (rate >= 75) return { label: "Warning", tone: "warning" };
  return { label: "Below 75%", tone: "danger" };
}

function staffReportSearch(r: StaffAttendanceRecord, query: string): boolean {
  const q = query.toLowerCase();
  return (
    r.name.toLowerCase().includes(q) ||
    r.empCode.toLowerCase().includes(q) ||
    r.designation.toLowerCase().includes(q) ||
    r.department.toLowerCase().includes(q) ||
    r.type.toLowerCase().includes(q) ||
    r.phone.toLowerCase().includes(q)
  );
}

export function StaffReportsClient() {
  const [fromDate, setFromDate] = React.useState("2026-10-01");
  const [toDate, setToDate] = React.useState("2026-10-19");

  // Applied report state (only updated when Fetch Report is clicked or staff selected)
  const [appliedFromDate, setAppliedFromDate] = React.useState("2026-10-01");
  const [appliedToDate, setAppliedToDate] = React.useState("2026-10-19");
  const [selectedStaffId, setSelectedStaffId] =
    React.useState<string>(ALL_STAFF_VALUE);
  const [appliedStaffId, setAppliedStaffId] =
    React.useState<string>(ALL_STAFF_VALUE);
  const [records, setRecords] = React.useState<StaffAttendanceRecord[]>(
    STAFF_ATTENDANCE_RECORDS
  );
  const [workingDaysCount, setWorkingDaysCount] = React.useState<number>(16);
  const [hasFetched, setHasFetched] = React.useState<boolean>(true);
  const [isFetching, setIsFetching] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [viewingStaff, setViewingStaff] =
    React.useState<StaffAttendanceRecord | null>(null);

  const period = React.useMemo(() => {
    const m1 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(appliedFromDate.trim());
    const m2 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(appliedToDate.trim());
    if (m1 && m2 && m1[1] === m2[1] && m1[2] === m2[2]) {
      const d = new Date(Date.UTC(Number(m1[1]), Number(m1[2]) - 1, 1));
      return d.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
    }
    return `${formatShortDate(appliedFromDate)} – ${formatShortDate(appliedToDate)}`;
  }, [appliedFromDate, appliedToDate]);

  const handleFetchReport = React.useCallback(
    async (targetStaffId?: string) => {
      const staffToFetch =
        typeof targetStaffId === "string" ? targetStaffId : selectedStaffId;

      if (!fromDate || !toDate) {
        const msg = "Please select both From Date and To Date.";
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      if (toDate < fromDate) {
        const msg = "To Date cannot be earlier than From Date.";
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      setErrorMessage(null);
      setIsFetching(true);

      try {
        const params = new URLSearchParams({
          fromDate,
          toDate,
        });
        if (staffToFetch && staffToFetch !== ALL_STAFF_VALUE) {
          params.set("staffId", staffToFetch);
        }
        const response = await fetch(
          `/api/attendance/staff-reports?${params.toString()}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );

        const payload = await response.json();

        if (!response.ok) {
          const errText =
            payload?.error || "Failed to fetch staff attendance report.";
          setErrorMessage(errText);
          toast.error(errText);
          setIsFetching(false);
          return;
        }

        const nextRecords: StaffAttendanceRecord[] = Array.isArray(payload.records)
          ? payload.records
          : [];
        const nextWorkingDays =
          typeof payload.workingDays === "number" ? payload.workingDays : 0;

        setRecords(nextRecords);
        setWorkingDaysCount(nextWorkingDays);
        setAppliedFromDate(fromDate);
        setAppliedToDate(toDate);
        setAppliedStaffId(staffToFetch);
        setSelectedStaffId(staffToFetch);
        setHasFetched(true);
        setIsFetching(false);

        const rangeText = `${formatShortDate(fromDate)} – ${formatShortDate(toDate)}`;
        if (nextRecords.length === 0) {
          toast.info(`No staff attendance records found for ${rangeText}.`);
        } else if (staffToFetch !== ALL_STAFF_VALUE && nextRecords.length > 0) {
          const single = nextRecords[0];
          toast.success(
            `Fetched attendance report for ${single.name} (${single.empCode} · ${single.department}) for ${rangeText} (${nextWorkingDays} working days).`
          );
        } else {
          toast.success(
            `Fetched ${nextRecords.length} staff attendance records for ${rangeText} (${nextWorkingDays} working days).`
          );
        }
      } catch {
        const msg =
          "Unable to retrieve staff attendance records. Please check your connection and try again.";
        setErrorMessage(msg);
        toast.error(msg);
        setIsFetching(false);
      }
    },
    [fromDate, toDate, selectedStaffId]
  );

  const appliedRangeLabel = React.useMemo(
    () => `${formatShortDate(appliedFromDate)} – ${formatShortDate(appliedToDate)}`,
    [appliedFromDate, appliedToDate]
  );

  const appliedStaff = React.useMemo(() => {
    if (appliedStaffId === ALL_STAFF_VALUE) return null;
    return ALL_STAFF_OPTIONS.find((s) => s.empId === appliedStaffId) || null;
  }, [appliedStaffId]);

  const handleResetToAllStaff = React.useCallback(async () => {
    setSelectedStaffId(ALL_STAFF_VALUE);
    setIsFetching(true);
    setErrorMessage(null);
    try {
      const params = new URLSearchParams({
        fromDate: appliedFromDate,
        toDate: appliedToDate,
      });
      const response = await fetch(
        `/api/attendance/staff-reports?${params.toString()}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        }
      );
      const payload = await response.json();
      if (response.ok) {
        const nextRecords: StaffAttendanceRecord[] = Array.isArray(payload.records)
          ? payload.records
          : [];
        setRecords(nextRecords);
        setAppliedStaffId(ALL_STAFF_VALUE);
        toast.success(
          `Showing all ${nextRecords.length} staff records for ${appliedRangeLabel}.`
        );
      }
    } finally {
      setIsFetching(false);
    }
  }, [appliedFromDate, appliedToDate, appliedRangeLabel]);

  const columns = React.useMemo<Column<StaffAttendanceRecord>[]>(
    () => [
      {
        key: "employee",
        header: "Staff Member",
        headerAlign: "center",
        align: "left",
        className: "w-[21%] pr-3",
        headerClassName: "w-[21%] pr-3 text-center",
        cell: (r) => (
          <PersonCell
            name={r.name}
            subtitle={`${r.empCode} · ${formatShortDesignation(r.designation)}`}
            showAvatar={false}
          />
        ),
      },
      {
        key: "department",
        header: "Department & Campus",
        align: "center",
        className: "w-[17%] px-3 whitespace-nowrap",
        headerClassName: "w-[17%] px-3",
        cell: (r) => (
          <div className="mx-auto max-w-full space-y-0.5 text-center overflow-hidden">
            <p className="truncate text-[13px] font-semibold text-foreground">
              {r.department}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {r.type} · {shortCampus(r.campus)}
            </p>
          </div>
        ),
      },
      {
        key: "shift",
        header: "Shift & Terminal",
        align: "center",
        className: "w-[16%] px-3 whitespace-nowrap",
        headerClassName: "w-[16%] px-3",
        cell: (r) => (
          <div className="mx-auto max-w-full space-y-0.5 text-center overflow-hidden">
            <p className="truncate text-[12.5px] font-medium text-foreground tabular-nums">
              {r.shift}
            </p>
            <p className="truncate text-xs text-muted-foreground tabular-nums">
              {r.verificationMethod} · {r.workingHours}
            </p>
          </div>
        ),
      },
      {
        key: "summary",
        header: "Present / Absent / Late",
        align: "center",
        className: "w-[15%] px-3 whitespace-nowrap",
        headerClassName: "w-[15%] px-3",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <div className="flex items-center justify-center gap-2 text-xs tabular-nums">
              <span className="font-semibold text-success">
                {r.daysPresentMonth}P
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span className="font-semibold text-danger">
                {r.daysAbsentMonth}A
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span className="font-semibold text-warning">
                {r.daysLateMonth}L
              </span>
            </div>
            <p className="text-[10.5px] text-muted-foreground tabular-nums">
              {formatLatestStatusLine(r)}
            </p>
          </div>
        ),
      },
      {
        key: "rate",
        header: "Attendance Rate",
        align: "center",
        className: "w-[11%] px-2",
        headerClassName: "w-[11%] px-2",
        cell: (r) => {
          const totalDays =
            r.daysPresentMonth + r.daysAbsentMonth || workingDaysCount;
          return (
            <div className="mx-auto w-16 space-y-1.5 text-center">
              <div className="flex justify-center text-xs">
                <span className="font-semibold tabular-nums text-foreground">
                  {r.monthlyRate}%
                </span>
              </div>
              <Meter
                value={r.monthlyRate}
                size="xs"
                tone="dark-blue"
                className="h-1"
              />
              <p className="text-[10.5px] text-muted-foreground leading-none tabular-nums">
                {r.daysPresentMonth}/{totalDays} days
              </p>
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Standing",
        align: "center",
        className: "w-[9%] px-2",
        headerClassName: "w-[9%] px-2",
        cell: (r) => {
          const standing = getStaffStandingStatus(r.monthlyRate);
          return (
            <div className="flex justify-center">
              <StatusBadge status={standing.label} tone={standing.tone} />
            </div>
          );
        },
      },
      {
        key: "actions",
        header: "Action",
        align: "center",
        className: "w-[11%] px-3 whitespace-nowrap",
        headerClassName: "w-[11%] px-3",
        cell: (r) => (
          <div className="flex items-center justify-center gap-1.5">
            <AttendanceActionButton
              size="xs"
              tone="outline"
              onClick={() => setViewingStaff(r)}
            >
              <Eye />
              View
            </AttendanceActionButton>
            <AttendanceActionButton
              size="xs"
              tone="outline"
              title={`Download ${r.name}'s report`}
              aria-label={`Download ${r.name}'s report`}
              onClick={() => {
                downloadSingleStaffReportPdf({
                  staff: r,
                  period,
                  fromDate: appliedFromDate,
                  toDate: appliedToDate,
                });
                toast.success(
                  `Staff attendance report for ${r.name} (${appliedRangeLabel}) downloaded as PDF.`
                );
              }}
            >
              <Download />
            </AttendanceActionButton>
          </div>
        ),
      },
    ],
    [period, appliedFromDate, appliedToDate, appliedRangeLabel, workingDaysCount]
  );

  const canExportOrPrint =
    hasFetched && !isFetching && records.length > 0;

  return (
    <>
      <PageHeader
        title="Staff Attendance Report"
        actions={
          <>

            <AttendanceActionButton
              tone="outline"
              disabled={!canExportOrPrint}
              onClick={() => {
                if (records.length === 0) {
                  toast.error("No staff attendance report records available to print.");
                  return;
                }
                const ok = printStaffAttendanceReport({
                  records,
                  period,
                  fromDate: appliedFromDate,
                  toDate: appliedToDate,
                });
                if (ok) {
                  toast.info(
                    `Opening print dialog for ${records.length} staff records (${appliedRangeLabel})…`
                  );
                }
              }}
            >
              <Printer />
              Print Report
            </AttendanceActionButton>
            <AttendanceActionButton
              tone="primary"
              disabled={!canExportOrPrint}
              onClick={() => {
                if (records.length === 0) {
                  toast.error("No staff attendance report records available to export.");
                  return;
                }
                const ok = downloadStaffAttendanceReportPdf({
                  records,
                  period,
                  fromDate: appliedFromDate,
                  toDate: appliedToDate,
                });
                if (ok) {
                  toast.success(
                    `Staff Attendance Report (${records.length} records · ${appliedRangeLabel}) downloaded as PDF.`
                  );
                }
              }}
            >
              <Download />
              Export PDF
            </AttendanceActionButton>
          </>
        }
      />

      {errorMessage && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2.5 rounded-xl border border-danger/30 bg-danger-soft/50 px-4 py-3 text-xs font-semibold text-danger shadow-2xs"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <SectionCard
        title={`Staff Attendance Report — ${period}`}
        flush
        action={
          <div className="flex flex-wrap items-center gap-2">
            {/* Searchable Specific Staff Selector */}
            <StaffSearchSelector
              options={ALL_STAFF_OPTIONS}
              value={selectedStaffId}
              allValue={ALL_STAFF_VALUE}
              disabled={isFetching}
              size="md"
              onChange={(nextId) => {
                setSelectedStaffId(nextId);
                if (errorMessage) setErrorMessage(null);
              }}
              onSelectAndFetch={(nextId) => {
                setSelectedStaffId(nextId);
                if (errorMessage) setErrorMessage(null);
                handleFetchReport(nextId);
              }}
            />

            <AttendanceDateRangePicker
              fromDate={fromDate}
              toDate={toDate}
              onFromChange={(nextFrom) => {
                setFromDate(nextFrom);
                if (errorMessage) setErrorMessage(null);
              }}
              onToChange={(nextTo) => {
                setToDate(nextTo);
                if (errorMessage) setErrorMessage(null);
              }}
              size="md"
            />
            <AttendanceActionButton
              size="md"
              tone="primary"
              disabled={isFetching}
              onClick={() => handleFetchReport()}
            >
              <RefreshCw className={isFetching ? "animate-spin" : ""} />
              {isFetching ? "Fetching…" : "Fetch Report"}
            </AttendanceActionButton>
          </div>
        }
      >
        {appliedStaff && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#dbe4f0] bg-brand-soft/30 px-6 py-2.5 text-xs">
            <div className="flex items-center gap-2 text-brand font-medium">
              <span className="font-semibold text-foreground">
                Active Staff Filter:
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 font-semibold text-brand shadow-2xs border border-brand/20">
                <UserRound className="size-3 text-brand" />
                {appliedStaff.name} ({appliedStaff.empCode} · {appliedStaff.department})
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetToAllStaff}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand underline-offset-4 hover:underline"
            >
              Show all staff
            </button>
          </div>
        )}
        <DataTable
          data={records}
          columns={columns}
          getRowId={(r) => r.id}
          emptyMessage={
            appliedStaff
              ? `No staff attendance records found for ${appliedStaff.name} for ${appliedRangeLabel}.`
              : `No staff attendance records found for ${appliedRangeLabel}.`
          }
          searchPlaceholder="Search staff by name, code, or dept..."
          searchFn={staffReportSearch}
          filters={reportFilters}
          pageSize={10}
        />
      </SectionCard>

      {/* Staff Attendance Report Details Modal */}
      <Dialog
        open={Boolean(viewingStaff)}
        onOpenChange={(open) => {
          if (!open) setViewingStaff(null);
        }}
      >
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
          {viewingStaff && (
            <>
              <DialogHeader className="gap-1 border-b border-border/70 px-6 py-5">
                <div className="flex items-start justify-between gap-4 pr-8">
                  <div>
                    <DialogTitle className="text-base font-bold text-foreground">
                      Staff Attendance Report
                    </DialogTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {appliedRangeLabel} · {viewingStaff.empCode}
                    </p>
                  </div>
                  <StatusBadge
                    status={getStaffStandingStatus(viewingStaff.monthlyRate).label}
                    tone={getStaffStandingStatus(viewingStaff.monthlyRate).tone}
                  />
                </div>
              </DialogHeader>

              <div className="space-y-5 px-6 py-5">
                <div className="flex items-center gap-3.5">
                  <UserAvatar
                    name={viewingStaff.name}
                    size="lg"
                    className="ring-2 ring-brand/15"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-bold text-foreground">
                      {viewingStaff.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {viewingStaff.empCode} · {viewingStaff.designation} ·{" "}
                      {viewingStaff.department} ({shortCampus(viewingStaff.campus)})
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-brand/15 bg-slate-50/70 p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground">
                      Cumulative Attendance Rate ({appliedRangeLabel})
                    </span>
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {viewingStaff.monthlyRate}%
                    </span>
                  </div>
                  <Meter
                    value={viewingStaff.monthlyRate}
                    size="xs"
                    tone="dark-blue"
                    className="h-1"
                  />
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                    <div className="rounded-lg border border-success/20 bg-success-soft/50 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-success">
                        Present
                      </p>
                      <p className="mt-0.5 text-sm font-bold tabular-nums text-success">
                        {viewingStaff.daysPresentMonth} Days
                      </p>
                    </div>
                    <div className="rounded-lg border border-danger/20 bg-danger-soft/50 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-danger">
                        Absent
                      </p>
                      <p className="mt-0.5 text-sm font-bold tabular-nums text-danger">
                        {viewingStaff.daysAbsentMonth} Days
                      </p>
                    </div>
                    <div className="rounded-lg border border-warning/25 bg-warning-soft/50 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-warning">
                        Late
                      </p>
                      <p className="mt-0.5 text-sm font-bold tabular-nums text-warning">
                        {viewingStaff.daysLateMonth} Days
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-border/80 bg-white p-3">
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                      <Phone className="size-3 text-brand" />
                      Staff Contact & Category
                    </span>
                    <p className="mt-1 font-semibold text-foreground">
                      {viewingStaff.type} Staff
                    </p>
                    <p className="text-[11px] tabular-nums text-muted-foreground">
                      {viewingStaff.phone}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/80 bg-white p-3">
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                      <Fingerprint className="size-3 text-brand" />
                      Shift & Terminal Log
                    </span>
                    <p className="mt-1 font-semibold text-foreground">
                      {formatLatestStatusLine(viewingStaff)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {viewingStaff.verificationMethod} · {viewingStaff.shift}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="m-0 flex-row items-center justify-between gap-2 border-t border-border/70 bg-muted/30 px-6 py-4 sm:justify-between">
                <AttendanceActionButton
                  size="sm"
                  tone="outline"
                  onClick={() => {
                    toast.success(
                      `Attendance summary dispatched to ${viewingStaff.name} (${viewingStaff.phone}).`
                    );
                  }}
                >
                  <Send />
                  Send to Staff
                </AttendanceActionButton>
                <div className="flex items-center gap-2">
                  <AttendanceActionButton
                    size="sm"
                    tone="outline"
                    onClick={() => setViewingStaff(null)}
                  >
                    Close
                  </AttendanceActionButton>
                  <AttendanceActionButton
                    size="sm"
                    tone="primary"
                    onClick={() => {
                      downloadSingleStaffReportPdf({
                        staff: viewingStaff,
                        period,
                        fromDate: appliedFromDate,
                        toDate: appliedToDate,
                      });
                      toast.success(
                        `Downloaded PDF report for ${viewingStaff.name}.`
                      );
                      setViewingStaff(null);
                    }}
                  >
                    <Download />
                    Download PDF
                  </AttendanceActionButton>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
