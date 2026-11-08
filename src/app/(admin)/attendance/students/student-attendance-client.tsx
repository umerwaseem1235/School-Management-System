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
import {
  DataTable,
  type Column,
  type FilterDef,
  ALL,
} from "@/components/shared/data-table";

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
  CAMPUS_ATTENDANCE_MATRIX,
  STUDENT_ATTENDANCE_RECORDS,
  STUDENT_TODAY,
  type StudentAttendanceRecord,
  type DailyStudentStatus,
} from "@/lib/mock/attendance";
import { CAMPUSES } from "@/lib/mock/institution";
import { formatNumber, formatPercent } from "@/lib/format";

// ─────────────────────────────────────────────────────────────────────────────
// Roll call segmented options
// ─────────────────────────────────────────────────────────────────────────────

const ROLL_CALL_OPTIONS: RowSegmentedOption<DailyStudentStatus>[] = [
  {
    value: "Present",
    code: "P",
    label: "Mark Present",
    activeClassName: "bg-success",
    inactiveHoverClassName:
      "hover:bg-success-soft/45 hover:text-success hover:ring-success/35",
  },
  {
    value: "Late",
    code: "L",
    label: "Mark Late",
    activeClassName: "bg-warning",
    inactiveHoverClassName:
      "hover:bg-warning-soft/45 hover:text-warning hover:ring-warning/35",
  },
  {
    value: "Absent",
    code: "A",
    label: "Mark Absent",
    activeClassName: "bg-danger",
    inactiveHoverClassName:
      "hover:bg-danger-soft/45 hover:text-danger hover:ring-danger/35",
  },
  {
    value: "Excused",
    code: "E",
    label: "Mark Excused",
    activeClassName: "bg-info",
    inactiveHoverClassName:
      "hover:bg-info-soft/45 hover:text-info hover:ring-info/35",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Options for Table Filters
// ─────────────────────────────────────────────────────────────────────────────

const CAMPUS_FILTER_OPTIONS = [
  ...new Set([
    ...CAMPUSES.map((c) => c.campusName),
    ...STUDENT_ATTENDANCE_RECORDS.map((s) => s.campus),
  ]),
];

const CLASS_OPTIONS = [
  ...new Set(STUDENT_ATTENDANCE_RECORDS.map((s) => s.className)),
].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const sections = [
  ...new Set(STUDENT_ATTENDANCE_RECORDS.map((s) => `Section ${s.section}`)),
].sort();
const SECTION_OPTIONS =
  sections.length > 0 ? sections : ["Section A", "Section B", "Section C"];

// ─────────────────────────────────────────────────────────────────────────────
// Campus KPI Derivation
// ─────────────────────────────────────────────────────────────────────────────

interface StudentKPIs {
  enrolled: number;
  present: number;
  absent: number;
  late: number;
  rate: number;
}

function deriveKPIs(campusValue: string): StudentKPIs {
  if (!campusValue || campusValue === ALL || campusValue === "all") {
    return {
      enrolled: STUDENT_TODAY.enrolled,
      present: STUDENT_TODAY.present,
      absent: STUDENT_TODAY.absent,
      late: STUDENT_TODAY.late,
      rate: STUDENT_TODAY.rate,
    };
  }

  const row = CAMPUS_ATTENDANCE_MATRIX.find(
    (r) =>
      r.campus.toLowerCase() === campusValue.toLowerCase() ||
      r.campus.toLowerCase().includes(campusValue.toLowerCase()) ||
      campusValue.toLowerCase().includes(r.campus.toLowerCase())
  );

  if (!row) {
    return {
      enrolled: STUDENT_TODAY.enrolled,
      present: STUDENT_TODAY.present,
      absent: STUDENT_TODAY.absent,
      late: STUDENT_TODAY.late,
      rate: STUDENT_TODAY.rate,
    };
  }

  const enrolled = row.studentsEnrolled;
  const present = row.studentsPresent;
  const absent = row.studentsAbsent;
  const late = row.studentsLate;
  const rate = Math.round(((present + late) / (enrolled || 1)) * 1000) / 10;

  return { enrolled, present, absent, late, rate };
}

// ─────────────────────────────────────────────────────────────────────────────
// Smooth animated KPI value
// ─────────────────────────────────────────────────────────────────────────────

function KpiValue({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block animate-in fade-in-0 slide-in-from-bottom-1 duration-300 fill-mode-both">
      {children}
    </span>
  );
}

const arrivalFor = (status: DailyStudentStatus) =>
  status === "Present" ? "07:52 AM" : status === "Late" ? "08:18 AM" : "—";

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function StudentAttendanceClient() {
  const [selectedCampus, setSelectedCampus] = React.useState<string>(ALL);
  const [selectedDate, setSelectedDate] = React.useState("2026-10-12");

  // Editable records for roll call
  const [records, setRecords] = React.useState<StudentAttendanceRecord[]>(
    STUDENT_ATTENDANCE_RECORDS
  );

  // Derive KPI metrics dynamically according to the selected campus
  const kpis = React.useMemo(() => deriveKPIs(selectedCampus), [selectedCampus]);

  // Absent notification count for current campus selection
  const absentCount = React.useMemo(() => {
    const visible = records.filter(
      (r) =>
        selectedCampus === ALL ||
        r.campus.toLowerCase() === selectedCampus.toLowerCase() ||
        r.campus.toLowerCase().includes(selectedCampus.toLowerCase())
    );
    return visible.filter((r) => r.statusToday === "Absent").length;
  }, [records, selectedCampus]);

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

  // Table Columns
  const columns = React.useMemo<Column<StudentAttendanceRecord>[]>(
    () => [
      {
        key: "student",
        header: "Student",
        headerAlign: "center",
        align: "center",
        className: "w-[24%] text-center",
        headerClassName: "w-[24%] text-center",
        cell: (r) => (
          <span className="text-[13px] font-semibold text-foreground">
            {r.name}
          </span>
        ),
      },
      {
        key: "class",
        header: "Class",
        align: "center",
        className: "w-[16%] whitespace-nowrap text-center",
        headerClassName: "w-[16%] text-center",
        cell: (r) => (
          <span className="text-[13px] font-medium text-foreground">
            {r.className} — Sec {r.section}
          </span>
        ),
      },
      {
        key: "arrival",
        header: "Arrival Scan",
        align: "center",
        className: "w-[15%] whitespace-nowrap text-center",
        headerClassName: "w-[15%] text-center",
        cell: (r) => (
          <span className="text-[13px] font-semibold tabular-nums text-foreground">
            {r.checkInTime}
          </span>
        ),
      },
      {
        key: "monthly",
        header: "Monthly Rate",
        align: "center",
        className: "w-[15%] text-center",
        headerClassName: "w-[15%] text-center",
        cell: (r) => (
          <span className="inline-flex items-center justify-center rounded-md border border-brand/15 bg-brand-50/50 px-2.5 py-0.5 font-mono text-xs font-bold text-[#091d3e]">
            {r.monthlyRate}%
          </span>
        ),
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

  // Table Filters: Campus filter is placed alongside Class, Section, and Status!
  const filters = React.useMemo<FilterDef<StudentAttendanceRecord>[]>(
    () => [
      {
        key: "campus",
        label: "Campus",
        allLabel: "All Campus",
        options: CAMPUS_FILTER_OPTIONS,
        getValue: (r) => r.campus,
        value: selectedCampus,
        onChange: (val) => setSelectedCampus(val),
        triggerClassName: "w-[145px] sm:w-[155px]",
      },
      {
        key: "class",
        label: "Class",
        allLabel: "All Class",
        options: CLASS_OPTIONS,
        getValue: (r) => r.className,
      },
      {
        key: "section",
        label: "Section",
        allLabel: "All Sections",
        options: SECTION_OPTIONS,
        getValue: (r) => `Section ${r.section}`,
      },
      {
        key: "status",
        label: "Status",
        allLabel: "All Status",
        options: ["Present", "Late", "Absent", "Excused"],
        getValue: (r) => r.statusToday,
      },
    ],
    [selectedCampus]
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
                toast.info(`SMS alerts queued for ${absentCount} absent guardians.`)
              }
            >
              <BellRing />
              Notify Guardians ({absentCount})
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

      {/* ── 5 KPI cards — update live whenever campus changes ────────── */}
      <div className="mb-6">
        <StatGrid className="max-w-none sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total Enrolled"
            value={
              <KpiValue key={`enrolled-${selectedCampus}`}>
                {formatNumber(kpis.enrolled)}
              </KpiValue>
            }
            icon={GraduationCap}
          />
          <StatCard
            label="Students Present"
            value={
              <KpiValue key={`present-${selectedCampus}`}>
                {formatNumber(kpis.present)}
              </KpiValue>
            }
            icon={UserCheck}
          />
          <StatCard
            label="Students Absent"
            value={
              <KpiValue key={`absent-${selectedCampus}`}>
                {formatNumber(kpis.absent)}
              </KpiValue>
            }
            icon={UserX}
          />
          <StatCard
            label="Late Arrivals"
            value={
              <KpiValue key={`late-${selectedCampus}`}>
                {formatNumber(kpis.late)}
              </KpiValue>
            }
            icon={Clock}
          />
          <StatCard
            label="Attendance Percentage"
            value={
              <KpiValue key={`rate-${selectedCampus}`}>
                {formatPercent(kpis.rate)}
              </KpiValue>
            }
            icon={Percent}
          />
        </StatGrid>
      </div>

      {/* ── Attendance Details section header & actions ──────────────── */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-base font-bold tracking-tight text-foreground md:text-lg">
          Attendance Details
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <AttendanceDatePicker value={selectedDate} onChange={setSelectedDate} />
          <AttendanceActionButton
            tone="success"
            onClick={() => {
              applyStatus(new Set(records.map((r) => r.id)), "Present");
              toast.success("All visible students marked Present");
            }}
          >
            <CheckCheck />
            Mark All Present
          </AttendanceActionButton>
          <AttendanceActionButton
            tone="danger"
            onClick={() => {
              applyStatus(new Set(records.map((r) => r.id)), "Absent");
              toast.error("All visible students marked Absent");
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

      {/* ── DataTable with Campus dropdown alongside Class, Section & Status ── */}
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
