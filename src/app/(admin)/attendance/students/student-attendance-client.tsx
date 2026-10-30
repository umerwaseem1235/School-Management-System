"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  BellRing,
  CheckCheck,
  Clock,
  Download,
  GraduationCap,
  Percent,
  Save,
  UserCheck,
  UserX,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { PersonCell } from "@/components/shared/user-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Meter } from "@/components/shared/meter";
import {
  AttendanceActionButton,
  AttendanceDatePicker,
  RowSegmented,
  type RowSegmentedOption,
} from "../_components/attendance-ui";
import { shortCampus } from "../_components/attendance-utils";
import {
  STUDENT_ATTENDANCE_RECORDS,
  STUDENT_TODAY,
  type StudentAttendanceRecord,
  type DailyStudentStatus,
} from "@/lib/mock/attendance";
import { formatNumber, formatPercent } from "@/lib/format";

const ROLL_CALL_OPTIONS: RowSegmentedOption<DailyStudentStatus>[] = [
  {
    value: "Present",
    code: "P",
    label: "Mark Present",
    activeClassName: "bg-success",
    inactiveHoverClassName: "hover:bg-success-soft/45 hover:text-success hover:ring-success/35",
  },
  {
    value: "Late",
    code: "L",
    label: "Mark Late",
    activeClassName: "bg-warning",
    inactiveHoverClassName: "hover:bg-warning-soft/45 hover:text-warning hover:ring-warning/35",
  },
  {
    value: "Absent",
    code: "A",
    label: "Mark Absent",
    activeClassName: "bg-danger",
    inactiveHoverClassName: "hover:bg-danger-soft/45 hover:text-danger hover:ring-danger/35",
  },
  {
    value: "Excused",
    code: "E",
    label: "Mark Excused",
    activeClassName: "bg-info",
    inactiveHoverClassName: "hover:bg-info-soft/45 hover:text-info hover:ring-info/35",
  },
];

const sections = [
  ...new Set(STUDENT_ATTENDANCE_RECORDS.map((s) => `Section ${s.section}`)),
].sort();

const filters: FilterDef<StudentAttendanceRecord>[] = [
  {
    key: "campus",
    label: "Campus",
    options: [...new Set(STUDENT_ATTENDANCE_RECORDS.map((s) => s.campus))],
    getValue: (r) => r.campus,
  },
  {
    key: "class",
    label: "Class",
    options: [...new Set(STUDENT_ATTENDANCE_RECORDS.map((s) => s.className))].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    ),
    getValue: (r) => r.className,
  },
  {
    key: "section",
    label: "Section",
    options: sections.length > 0 ? sections : ["Section A", "Section B", "Section C"],
    getValue: (r) => `Section ${r.section}`,
  },
  {
    key: "status",
    label: "Status",
    options: ["Present", "Late", "Absent", "Excused"],
    getValue: (r) => r.statusToday,
  },
];

const arrivalFor = (status: DailyStudentStatus) =>
  status === "Present" ? "07:52 AM" : status === "Late" ? "08:18 AM" : "—";

export function StudentAttendanceClient() {
  const [records, setRecords] = React.useState<StudentAttendanceRecord[]>(
    STUDENT_ATTENDANCE_RECORDS
  );
  const [selectedDate, setSelectedDate] = React.useState("2026-10-12");

  const tally = React.useMemo(() => {
    const count = (s: DailyStudentStatus) =>
      records.filter((r) => r.statusToday === s).length;
    const present = count("Present");
    const late = count("Late");
    const absent = count("Absent");
    const excused = count("Excused");
    const total = records.length;
    const rate = total > 0 ? ((present + late) / total) * 100 : 0;
    return { total, present, late, absent, excused, rate };
  }, [records]);

  const applyStatus = React.useCallback(
    (ids: Set<string>, status: DailyStudentStatus) => {
      setRecords((prev) =>
        prev.map((r) =>
          ids.has(r.id)
            ? { ...r, statusToday: status, checkInTime: arrivalFor(status) }
            : r
        )
      );
    },
    []
  );

  const handleRollCall = React.useCallback(
    (record: StudentAttendanceRecord, status: DailyStudentStatus) => {
      applyStatus(new Set([record.id]), status);
      toast.success(`${record.name} marked ${status}`);
    },
    [applyStatus]
  );

  const columns = React.useMemo<Column<StudentAttendanceRecord>[]>(
    () => [
      {
        key: "student",
        header: "Student",
        headerAlign: "left",
        align: "left",
        className: "w-[24%]",
        headerClassName: "w-[24%] text-left",
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
        className: "w-[16%] whitespace-nowrap",
        headerClassName: "w-[16%]",
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
        key: "arrival",
        header: "Arrival Scan",
        align: "center",
        className: "w-[15%] whitespace-nowrap",
        headerClassName: "w-[15%]",
        cell: (r) => (
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-[13px] font-semibold tabular-nums text-foreground">
              {r.checkInTime}
            </p>
            <p className="text-xs text-muted-foreground">
              {r.checkInTime === "—" ? "No scan" : r.verificationMethod}
            </p>
          </div>
        ),
      },
      {
        key: "monthly",
        header: "Monthly Rate",
        align: "center",
        className: "w-[15%]",
        headerClassName: "w-[15%]",
        cell: (r) => {
          const textTone =
            r.monthlyRate >= 93
              ? "text-[#091d3e]"
              : r.monthlyRate >= 85
                ? "text-[#1d4ed8]"
                : r.monthlyRate >= 75
                  ? "text-[#0284c7]"
                  : "text-[#0369a1]";
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
                {r.daysPresentMonth}P · {r.daysAbsentMonth}A
              </p>
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        className: "w-[14%]",
        headerClassName: "w-[14%]",
        cell: (r) => (
          <div className="flex justify-center">
            <StatusBadge status={r.statusToday} />
          </div>
        ),
      },
      {
        key: "rollcall",
        header: "Roll Call",
        align: "center",
        className: "w-[16%] whitespace-nowrap",
        headerClassName: "w-[16%]",
        cell: (r) => (
          <div className="flex justify-center">
            <RowSegmented
              size="sm"
              options={ROLL_CALL_OPTIONS}
              value={r.statusToday}
              onChange={(next) => handleRollCall(r, next)}
            />
          </div>
        ),
      },
    ],
    [handleRollCall]
  );

  return (
    <>
      <PageHeader
        title="Student Attendance"
        actions={
          <>
            <AttendanceActionButton
              tone="outline"
              onClick={() =>
                toast.info(
                  `SMS absence alerts queued for ${tally.absent} guardians.`
                )
              }
            >
              <BellRing />
              Notify Guardians ({tally.absent})
            </AttendanceActionButton>
            <AttendanceActionButton
              tone="outline"
              onClick={() => toast.success("Student register exported as CSV")}
            >
              <Download />
              Export CSV
            </AttendanceActionButton>
          </>
        }
      />

      {/* Institution-wide Student Attendance KPIs */}
      <div className="mb-6">
        <StatGrid className="max-w-none sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total Enrolled"
            value={formatNumber(STUDENT_TODAY.enrolled)}
            icon={GraduationCap}
          />
          <StatCard
            label="Students Present"
            value={formatNumber(STUDENT_TODAY.present)}
            icon={UserCheck}
          />
          <StatCard
            label="Students Absent"
            value={formatNumber(STUDENT_TODAY.absent)}
            icon={UserX}
          />
          <StatCard
            label="Late Arrivals"
            value={formatNumber(STUDENT_TODAY.late)}
            icon={Clock}
          />
          <StatCard
            label="Attendance Percentage"
            value={formatPercent(STUDENT_TODAY.rate)}
            icon={Percent}
          />
        </StatGrid>
      </div>

      {/* Attendance Details Section Header & Actions Bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-base font-bold tracking-tight text-foreground md:text-lg">
          Attendance Details
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <AttendanceDatePicker
            value={selectedDate}
            onChange={setSelectedDate}
          />
          <AttendanceActionButton
            tone="success"
            onClick={() => {
              applyStatus(new Set(records.map((r) => r.id)), "Present");
              toast.success("All students in current register marked Present");
            }}
          >
            <CheckCheck />
            Mark All Present
          </AttendanceActionButton>
          <AttendanceActionButton
            tone="danger"
            onClick={() => {
              applyStatus(new Set(records.map((r) => r.id)), "Absent");
              toast.error("All students in current register marked Absent");
            }}
          >
            <UserX />
            Mark All Absent
          </AttendanceActionButton>
          <AttendanceActionButton
            tone="primary"
            onClick={() =>
              toast.success(`Attendance register for ${selectedDate} saved.`)
            }
          >
            <Save />
            Save Register
          </AttendanceActionButton>
        </div>
      </div>

      <SectionCard flush contentClassName="pt-5">
        <DataTable
          data={records}
          columns={columns}
          getRowId={(r) => r.id}
          searchPlaceholder="Search student by name, ID..."
          searchFn={(r, q) =>
            r.name.toLowerCase().includes(q) ||
            r.admissionNumber.toLowerCase().includes(q) ||
            r.rollNo.toLowerCase().includes(q) ||
            r.guardian.toLowerCase().includes(q)
          }
          filters={filters}
          pageSize={10}
        />
      </SectionCard>
    </>
  );
}
