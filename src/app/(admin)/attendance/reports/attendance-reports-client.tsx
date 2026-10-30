"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  CalendarDays,
  Download,
  Eye,
  Phone,
  Printer,
  RefreshCw,
  Send,
  UserRound,
  X,
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
  STUDENT_ATTENDANCE_RECORDS,
  type StudentAttendanceRecord,
} from "@/lib/mock/attendance";
import {
  downloadAttendanceReportPdf,
  downloadStudentReportPdf,
  formatShortDate,
  printAttendanceReport,
} from "./attendance-report-export";
import {
  StudentSearchSelector,
  type StudentSelectorOption,
} from "./student-search-selector";



const campusOptions = [
  ...new Set(STUDENT_ATTENDANCE_RECORDS.map((s) => s.campus)),
];

const classOptions = [
  ...new Set(STUDENT_ATTENDANCE_RECORDS.map((s) => s.className)),
].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const sectionOptions = [
  ...new Set(STUDENT_ATTENDANCE_RECORDS.map((s) => `Section ${s.section}`)),
].sort();

const reportFilters: FilterDef<StudentAttendanceRecord>[] = [
  {
    key: "campus",
    label: "Campus",
    options: campusOptions,
    getValue: (r) => r.campus,
  },
  {
    key: "class",
    label: "Class",
    options: classOptions,
    getValue: (r) => r.className,
  },
  {
    key: "section",
    label: "Section",
    options:
      sectionOptions.length > 0
        ? sectionOptions
        : ["Section A", "Section B", "Section C"],
    getValue: (r) => `Section ${r.section}`,
  },
];

const ALL_STUDENTS_VALUE = "all";

const ALL_STUDENT_OPTIONS: StudentSelectorOption[] = Array.from(
  new Map(
    STUDENT_ATTENDANCE_RECORDS.map((s) => [
      s.studentId,
      {
        studentId: s.studentId,
        name: s.name,
        rollNo: s.rollNo,
        className: s.className,
        section: s.section,
        campus: s.campus,
        admissionNumber: s.admissionNumber,
        gender: s.gender,
        guardian: s.guardian,
        phone: s.phone,
        monthlyRate: s.monthlyRate,
        statusToday: s.statusToday,
      },
    ])
  ).values()
).sort((a, b) => a.name.localeCompare(b.name));

function getEligibilityStatus(rate: number): {
  label: string;
  tone: "success" | "warning" | "danger";
} {
  if (rate >= 85) return { label: "Eligible", tone: "success" };
  if (rate >= 75) return { label: "Warning", tone: "warning" };
  return { label: "Below 75%", tone: "danger" };
}

function attendanceReportSearch(r: StudentAttendanceRecord, query: string): boolean {
  const q = query.toLowerCase();
  return (
    r.name.toLowerCase().includes(q) ||
    r.admissionNumber.toLowerCase().includes(q) ||
    r.rollNo.toLowerCase().includes(q) ||
    r.guardian.toLowerCase().includes(q) ||
    r.className.toLowerCase().includes(q)
  );
}

export function AttendanceReportsClient() {
  const [fromDate, setFromDate] = React.useState("2026-10-01");
  const [toDate, setToDate] = React.useState("2026-10-19");

  // Applied report state (only updated when Fetch Report is clicked)
  const [appliedFromDate, setAppliedFromDate] = React.useState("2026-10-01");
  const [appliedToDate, setAppliedToDate] = React.useState("2026-10-19");
  const [selectedStudentId, setSelectedStudentId] =
    React.useState<string>(ALL_STUDENTS_VALUE);
  const [appliedStudentId, setAppliedStudentId] =
    React.useState<string>(ALL_STUDENTS_VALUE);
  const [records, setRecords] = React.useState<StudentAttendanceRecord[]>(
    STUDENT_ATTENDANCE_RECORDS
  );
  const [workingDaysCount, setWorkingDaysCount] = React.useState<number>(16);
  const [hasFetched, setHasFetched] = React.useState<boolean>(true);
  const [isFetching, setIsFetching] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [viewingStudent, setViewingStudent] =
    React.useState<StudentAttendanceRecord | null>(null);

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
    async (targetStudentId?: string) => {
      const studentToFetch =
        typeof targetStudentId === "string" ? targetStudentId : selectedStudentId;

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
        if (studentToFetch && studentToFetch !== ALL_STUDENTS_VALUE) {
          params.set("studentId", studentToFetch);
        }
        const response = await fetch(`/api/attendance/reports?${params.toString()}`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        const payload = await response.json();

        if (!response.ok) {
          const errText =
            payload?.error || "Failed to fetch student attendance report.";
          setErrorMessage(errText);
          toast.error(errText);
          setIsFetching(false);
          return;
        }

        const nextRecords: StudentAttendanceRecord[] = Array.isArray(payload.records)
          ? payload.records
          : [];
        const nextWorkingDays =
          typeof payload.workingDays === "number" ? payload.workingDays : 0;

        setRecords(nextRecords);
        setWorkingDaysCount(nextWorkingDays);
        setAppliedFromDate(fromDate);
        setAppliedToDate(toDate);
        setAppliedStudentId(studentToFetch);
        setSelectedStudentId(studentToFetch);
        setHasFetched(true);
        setIsFetching(false);

        const rangeText = `${formatShortDate(fromDate)} – ${formatShortDate(toDate)}`;
        if (nextRecords.length === 0) {
          toast.info(`No attendance records found for ${rangeText}.`);
        } else if (studentToFetch !== ALL_STUDENTS_VALUE && nextRecords.length > 0) {
          const single = nextRecords[0];
          toast.success(
            `Fetched attendance report for ${single.name} (Roll #${single.rollNo} · ${single.className}) for ${rangeText} (${nextWorkingDays} working days).`
          );
        } else {
          toast.success(
            `Fetched ${nextRecords.length} student attendance records for ${rangeText} (${nextWorkingDays} working days).`
          );
        }
      } catch {
        const msg =
          "Unable to retrieve attendance records. Please check your connection and try again.";
        setErrorMessage(msg);
        toast.error(msg);
        setIsFetching(false);
      }
    },
    [fromDate, toDate, selectedStudentId]
  );

  const appliedRangeLabel = React.useMemo(
    () => `${formatShortDate(appliedFromDate)} – ${formatShortDate(appliedToDate)}`,
    [appliedFromDate, appliedToDate]
  );

  const appliedStudent = React.useMemo(() => {
    if (appliedStudentId === ALL_STUDENTS_VALUE) return null;
    return (
      ALL_STUDENT_OPTIONS.find((s) => s.studentId === appliedStudentId) || null
    );
  }, [appliedStudentId]);

  const handleResetToAllStudents = React.useCallback(async () => {
    setSelectedStudentId(ALL_STUDENTS_VALUE);
    setIsFetching(true);
    setErrorMessage(null);
    try {
      const params = new URLSearchParams({
        fromDate: appliedFromDate,
        toDate: appliedToDate,
      });
      const response = await fetch(`/api/attendance/reports?${params.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      const payload = await response.json();
      if (response.ok) {
        const nextRecords: StudentAttendanceRecord[] = Array.isArray(payload.records)
          ? payload.records
          : [];
        setRecords(nextRecords);
        setAppliedStudentId(ALL_STUDENTS_VALUE);
        toast.success(
          `Showing all ${nextRecords.length} student records for ${appliedRangeLabel}.`
        );
      }
    } finally {
      setIsFetching(false);
    }
  }, [appliedFromDate, appliedToDate, appliedRangeLabel]);

  const columns = React.useMemo<Column<StudentAttendanceRecord>[]>(
    () => [
      {
        key: "student",
        header: "Student",
        headerAlign: "left",
        align: "left",
        className: "w-[22%]",
        headerClassName: "w-[22%] text-left",
        cell: (r) => (
          <PersonCell
            name={r.name}
            subtitle={`Roll #${r.rollNo} · ${r.admissionNumber}`}
            showAvatar={false}
          />
        ),
      },
      {
        key: "class",
        header: "Class & Campus",
        align: "center",
        className: "w-[15%] whitespace-nowrap",
        headerClassName: "w-[15%]",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-[13px] font-semibold text-foreground">
              {r.className} — Sec {r.section}
            </p>
            <p className="text-xs text-muted-foreground">
              {shortCampus(r.campus)}
            </p>
          </div>
        ),
      },
      {
        key: "guardian",
        header: "Guardian",
        align: "center",
        className: "w-[15%] whitespace-nowrap",
        headerClassName: "w-[15%]",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-[13px] font-medium text-foreground">
              {r.guardian}
            </p>
            <p className="text-xs tabular-nums text-muted-foreground">
              {r.phone}
            </p>
          </div>
        ),
      },
      {
        key: "summary",
        header: "Present / Absent / Late",
        align: "center",
        className: "w-[16%] whitespace-nowrap",
        headerClassName: "w-[16%]",
        cell: (r) => {
          const lateCount = r.statusToday === "Late" ? 2 : 1;
          return (
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
                <span className="font-semibold text-warning">{lateCount}L</span>
              </div>
              <p className="text-[10.5px] text-muted-foreground tabular-nums">
                {r.statusToday} ({r.checkInTime})
              </p>
            </div>
          );
        },
      },
      {
        key: "rate",
        header: "Attendance Rate",
        align: "center",
        className: "w-[13%]",
        headerClassName: "w-[13%]",
        cell: (r) => {
          const workingDays = r.daysPresentMonth + r.daysAbsentMonth;
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
                {r.daysPresentMonth}/{workingDays} days
              </p>
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Standing",
        align: "center",
        className: "w-[13%]",
        headerClassName: "w-[13%]",
        cell: (r) => {
          const standing = getEligibilityStatus(r.monthlyRate);
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
        className: "w-[14%] whitespace-nowrap",
        headerClassName: "w-[14%]",
        cell: (r) => (
          <div className="flex items-center justify-center gap-1.5">
            <AttendanceActionButton
              size="xs"
              tone="outline"
              onClick={() => setViewingStudent(r)}
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
                downloadStudentReportPdf({
                  student: r,
                  period,
                  fromDate: appliedFromDate,
                  toDate: appliedToDate,
                });
                toast.success(
                  `Attendance report for ${r.name} (${appliedRangeLabel}) downloaded as PDF.`
                );
              }}
            >
              <Download />
            </AttendanceActionButton>
          </div>
        ),
      },
    ],
    [period, appliedFromDate, appliedToDate, appliedRangeLabel]
  );

  const canExportOrPrint =
    hasFetched && !isFetching && records.length > 0;

  return (
    <>
      <PageHeader
        title="Student Attendance Report"
        actions={
          <>

            <AttendanceActionButton
              tone="outline"
              disabled={!canExportOrPrint}
              onClick={() => {
                if (records.length === 0) {
                  toast.error("No attendance report records available to print.");
                  return;
                }
                const ok = printAttendanceReport({
                  records,
                  period,
                  fromDate: appliedFromDate,
                  toDate: appliedToDate,
                });
                if (ok) {
                  toast.info(
                    `Opening print dialog for ${records.length} student records (${appliedRangeLabel})…`
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
                  toast.error("No attendance report records available to export.");
                  return;
                }
                const ok = downloadAttendanceReportPdf({
                  records,
                  period,
                  fromDate: appliedFromDate,
                  toDate: appliedToDate,
                });
                if (ok) {
                  toast.success(
                    `Student Attendance Report (${records.length} records · ${appliedRangeLabel}) downloaded as PDF.`
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
        title={`Student Attendance Report — ${period}`}
        flush
        action={
          <div className="flex flex-wrap items-center gap-2">
            {/* Searchable Specific Student Selector */}
            <StudentSearchSelector
              options={ALL_STUDENT_OPTIONS}
              value={selectedStudentId}
              allValue={ALL_STUDENTS_VALUE}
              disabled={isFetching}
              size="md"
              onChange={(nextId) => {
                setSelectedStudentId(nextId);
                if (errorMessage) setErrorMessage(null);
              }}
              onSelectAndFetch={(nextId) => {
                setSelectedStudentId(nextId);
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
        {appliedStudent && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#dbe4f0] bg-brand-soft/30 px-6 py-2.5 text-xs">
            <div className="flex items-center gap-2 text-brand font-medium">
              <span className="font-semibold text-foreground">Active Student Filter:</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 font-semibold text-brand shadow-2xs border border-brand/20">
                <UserRound className="size-3 text-brand" />
                {appliedStudent.name} (Roll #{appliedStudent.rollNo} · {appliedStudent.className} Sec {appliedStudent.section})
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetToAllStudents}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand underline-offset-4 hover:underline"
            >
              Show all students
            </button>
          </div>
        )}
        <DataTable
          data={records}
          columns={columns}
          getRowId={(r) => r.id}
          emptyMessage={
            appliedStudent
              ? `No student attendance records found for ${appliedStudent.name} for ${appliedRangeLabel}.`
              : `No student attendance records found for ${appliedRangeLabel}.`
          }
          searchPlaceholder="Search student by name, roll no, or ID..."
          searchFn={attendanceReportSearch}
          filters={reportFilters}
          pageSize={10}
        />
      </SectionCard>

      {/* Student Attendance Report Details Modal */}
      <Dialog
        open={Boolean(viewingStudent)}
        onOpenChange={(open) => {
          if (!open) setViewingStudent(null);
        }}
      >
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
          {viewingStudent && (
            <>
              <DialogHeader className="gap-1 border-b border-border/70 px-6 py-5">
                <div className="flex items-start justify-between gap-4 pr-8">
                  <div>
                    <DialogTitle className="text-base font-bold text-foreground">
                      Student Attendance Report
                    </DialogTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {appliedRangeLabel} · {viewingStudent.admissionNumber}
                    </p>
                  </div>
                  <StatusBadge
                    status={getEligibilityStatus(viewingStudent.monthlyRate).label}
                    tone={getEligibilityStatus(viewingStudent.monthlyRate).tone}
                  />
                </div>
              </DialogHeader>

              <div className="space-y-5 px-6 py-5">
                <div className="flex items-center gap-3.5">
                  <UserAvatar
                    name={viewingStudent.name}
                    size="lg"
                    className="ring-2 ring-brand/15"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-bold text-foreground">
                      {viewingStudent.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Roll #{viewingStudent.rollNo} · {viewingStudent.className} — Section{" "}
                      {viewingStudent.section} · {shortCampus(viewingStudent.campus)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-brand/15 bg-slate-50/70 p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground">
                      Cumulative Attendance Rate ({appliedRangeLabel})
                    </span>
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {viewingStudent.monthlyRate}%
                    </span>
                  </div>
                  <Meter
                    value={viewingStudent.monthlyRate}
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
                        {viewingStudent.daysPresentMonth} Days
                      </p>
                    </div>
                    <div className="rounded-lg border border-danger/20 bg-danger-soft/50 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-danger">
                        Absent
                      </p>
                      <p className="mt-0.5 text-sm font-bold tabular-nums text-danger">
                        {viewingStudent.daysAbsentMonth} Days
                      </p>
                    </div>
                    <div className="rounded-lg border border-warning/25 bg-warning-soft/50 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-warning">
                        Late
                      </p>
                      <p className="mt-0.5 text-sm font-bold tabular-nums text-warning">
                        {viewingStudent.statusToday === "Late" ? 2 : 1} Days
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-border/80 bg-white p-3">
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                      <Phone className="size-3 text-brand" />
                      Guardian Contact
                    </span>
                    <p className="mt-1 font-semibold text-foreground">
                      {viewingStudent.guardian}
                    </p>
                    <p className="text-[11px] tabular-nums text-muted-foreground">
                      {viewingStudent.phone}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/80 bg-white p-3">
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                      <CalendarDays className="size-3 text-brand" />
                      Latest Scan Status
                    </span>
                    <p className="mt-1 font-semibold text-foreground">
                      {viewingStudent.statusToday} ({viewingStudent.checkInTime})
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {viewingStudent.verificationMethod}
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
                      `Attendance summary SMS sent to ${viewingStudent.guardian} (${viewingStudent.phone}).`
                    );
                  }}
                >
                  <Send />
                  Send to Guardian
                </AttendanceActionButton>
                <div className="flex items-center gap-2">
                  <AttendanceActionButton
                    size="sm"
                    tone="outline"
                    onClick={() => setViewingStudent(null)}
                  >
                    Close
                  </AttendanceActionButton>
                  <AttendanceActionButton
                    size="sm"
                    tone="primary"
                    onClick={() => {
                      downloadStudentReportPdf({
                        student: viewingStudent,
                        period,
                        fromDate: appliedFromDate,
                        toDate: appliedToDate,
                      });
                      toast.success(
                        `Downloaded PDF report for ${viewingStudent.name}.`
                      );
                      setViewingStudent(null);
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
