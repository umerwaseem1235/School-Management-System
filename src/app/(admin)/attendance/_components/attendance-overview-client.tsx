"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  ChevronDown,
  ClipboardCheck,
  Fingerprint,
  GraduationCap,
  MapPin,
  Percent,
  Radio,
  Smartphone,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { Meter } from "@/components/shared/meter";
import { PersonCell } from "@/components/shared/user-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { DonutChart, LineTrendChart } from "@/components/charts";
import { AttendanceActionButton } from "./attendance-ui";
import { shortCampus } from "./attendance-utils";
import { WEEKLY_ATTENDANCE, CAMPUS_ATTENDANCE_TODAY } from "@/lib/mock/analytics";
import {
  CAMPUS_ATTENDANCE_MATRIX,
  CHRONIC_ABSENTEES,
  CHRONIC_SUMMARY,
  EXTENDED_LEAVE_REQUESTS,
  STAFF_ATTENDANCE_RECORDS,
  STAFF_TODAY,
  STUDENT_TODAY,
  TODAY_DISTRIBUTION_DONUT,
} from "@/lib/mock/attendance";
import { CAMPUSES } from "@/lib/mock/institution";
import { formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Campus option type
// ─────────────────────────────────────────────────────────────────────────────

type CampusOption = {
  value: string; // campus ID or "all"
  label: string;
  code?: string;
  city?: string;
};

const ALL_CAMPUSES_VALUE = "all";

const CAMPUS_OPTIONS: CampusOption[] = [
  { value: ALL_CAMPUSES_VALUE, label: "All Campuses" },
  ...CAMPUSES.map((c) => ({
    value: c.id,
    label: c.campusName,
    code: c.campusCode,
    city: c.city,
  })),
];

// ─────────────────────────────────────────────────────────────────────────────
// Derived stats per campus selection
// ─────────────────────────────────────────────────────────────────────────────

interface StudentKPIs {
  enrolled: number;
  present: number;
  absent: number;
  late: number;
  rate: number;
}

interface StaffKPIs {
  total: number;
  onDuty: number;
  onLeave: number;
  absent: number;
  rate: number;
}

function deriveStudentKPIs(campusId: string): StudentKPIs {
  if (campusId === ALL_CAMPUSES_VALUE) {
    return STUDENT_TODAY;
  }
  const campus = CAMPUSES.find((c) => c.id === campusId);
  if (!campus) return STUDENT_TODAY;

  const matrixRow = CAMPUS_ATTENDANCE_MATRIX.find(
    (r) => r.campus === campus.campusName
  );
  if (!matrixRow) return STUDENT_TODAY;

  const enrolled = matrixRow.studentsEnrolled;
  const present = matrixRow.studentsPresent;
  const absent = matrixRow.studentsAbsent;
  const late = matrixRow.studentsLate;
  return {
    enrolled,
    present,
    absent,
    late,
    rate: Math.round(((present + late) / enrolled) * 1000) / 10,
  };
}

function deriveStaffKPIs(campusId: string): StaffKPIs {
  if (campusId === ALL_CAMPUSES_VALUE) {
    const onDuty = STAFF_TODAY.present + STAFF_TODAY.late;
    return {
      total: STAFF_TODAY.total,
      onDuty,
      onLeave: STAFF_TODAY.onLeave,
      absent: STAFF_TODAY.absent,
      rate: STAFF_TODAY.rate,
    };
  }
  const campus = CAMPUSES.find((c) => c.id === campusId);
  if (!campus) {
    const onDuty = STAFF_TODAY.present + STAFF_TODAY.late;
    return {
      total: STAFF_TODAY.total,
      onDuty,
      onLeave: STAFF_TODAY.onLeave,
      absent: STAFF_TODAY.absent,
      rate: STAFF_TODAY.rate,
    };
  }

  const staffForCampus = STAFF_ATTENDANCE_RECORDS.filter(
    (s) => s.campus === campus.campusName
  );
  const total = staffForCampus.length;
  const present = staffForCampus.filter((s) => s.statusToday === "Present").length;
  const late = staffForCampus.filter((s) => s.statusToday === "Late").length;
  const onLeave = staffForCampus.filter((s) => s.statusToday === "On Leave").length;
  const absent = staffForCampus.filter((s) => s.statusToday === "Absent").length;
  const onDuty = present + late;
  const safeTotal = total > 0 ? total : 1;
  return {
    total,
    onDuty,
    onLeave,
    absent,
    rate: Math.round((onDuty / safeTotal) * 1000) / 10,
  };
}

function deriveDonut(campusId: string) {
  if (campusId === ALL_CAMPUSES_VALUE) return TODAY_DISTRIBUTION_DONUT;
  const kpi = deriveStudentKPIs(campusId);
  return [
    { name: "Present", value: kpi.present, color: "#127c52" },
    { name: "Late", value: kpi.late, color: "#c7841f" },
    { name: "Absent", value: kpi.absent, color: "#c8463d" },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Campus Selector Dropdown
// ─────────────────────────────────────────────────────────────────────────────

function CampusSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const selected = CAMPUS_OPTIONS.find((o) => o.value === value) ?? CAMPUS_OPTIONS[0];

  // Close on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex h-9 min-w-[220px] items-center justify-between gap-2 rounded-[5px] border px-3 text-xs font-semibold transition-all duration-150 select-none outline-none",
          "border-brand/18 bg-white text-foreground",
          "shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.06)]",
          "hover:border-brand/35 hover:bg-brand-50/40",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20",
          open && "border-brand/35 bg-brand-50/30 ring-3 ring-ring/15"
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {value === ALL_CAMPUSES_VALUE ? (
            <Building2 className="size-3.5 shrink-0 text-brand" />
          ) : (
            <MapPin className="size-3.5 shrink-0 text-brand" />
          )}
          <span className="truncate">{selected.label}</span>
          {selected.code && (
            <span className="shrink-0 rounded-[3px] bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-brand ring-1 ring-brand/12">
              {selected.code}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select campus"
          className={cn(
            "absolute right-0 top-full z-50 mt-1.5 min-w-[260px] overflow-hidden rounded-[6px] border border-brand/15",
            "bg-white shadow-[0_4px_16px_-4px_rgb(9_29_62/0.18),0_1px_4px_rgb(9_29_62/0.08)]",
            "animate-in fade-in-0 slide-in-from-top-1 duration-150"
          )}
        >
          {/* All campuses */}
          <div className="border-b border-brand/10 p-1">
            <button
              role="option"
              aria-selected={value === ALL_CAMPUSES_VALUE}
              onClick={() => { onChange(ALL_CAMPUSES_VALUE); setOpen(false); }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-[4px] px-3 py-2 text-xs font-semibold transition-colors",
                value === ALL_CAMPUSES_VALUE
                  ? "bg-gradient-to-r from-[#381e0f] to-[#6e3b1f] text-white"
                  : "text-foreground hover:bg-brand-50/70"
              )}
            >
              <Building2 className={cn("size-3.5 shrink-0", value === ALL_CAMPUSES_VALUE ? "text-white/80" : "text-brand")} />
              <span>All Campuses</span>
              <span className={cn(
                "ml-auto rounded-[3px] px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                value === ALL_CAMPUSES_VALUE
                  ? "bg-white/15 text-white"
                  : "bg-brand-50 text-brand ring-1 ring-brand/12"
              )}>
                {formatNumber(STUDENT_TODAY.enrolled)} students
              </span>
            </button>
          </div>

          {/* Individual campuses */}
          <div className="p-1">
            {CAMPUS_OPTIONS.filter((o) => o.value !== ALL_CAMPUSES_VALUE).map((opt) => {
              const matrixRow = CAMPUS_ATTENDANCE_MATRIX.find(
                (r) => r.campus === CAMPUSES.find((c) => c.id === opt.value)?.campusName
              );
              const isActive = value === opt.value;
              return (
                <button
                  key={opt.value}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-[4px] px-3 py-2.5 text-xs font-semibold transition-colors",
                    isActive
                      ? "bg-gradient-to-r from-[#381e0f] to-[#6e3b1f] text-white"
                      : "text-foreground hover:bg-brand-50/70"
                  )}
                >
                  <MapPin className={cn("size-3.5 shrink-0", isActive ? "text-white/80" : "text-brand")} />
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate">{opt.label}</p>
                    {opt.city && (
                      <p className={cn("text-[10px] font-medium", isActive ? "text-white/60" : "text-muted-foreground")}>
                        {opt.city} · {opt.code}
                      </p>
                    )}
                  </div>
                  {matrixRow && (
                    <div className={cn(
                      "ml-auto shrink-0 text-right text-[10px] font-bold tabular-nums",
                      isActive ? "text-white/80" : "text-muted-foreground"
                    )}>
                      <p>{formatPercent(matrixRow.studentRate)}</p>
                      <p className={cn("font-medium", isActive ? "text-white/50" : "text-muted-foreground/60")}>
                        rate
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated number (smooth transition on value change)
// ─────────────────────────────────────────────────────────────────────────────

function AnimatedValue({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Campus context badge shown next to section headings
// ─────────────────────────────────────────────────────────────────────────────

function CampusBadge({ campusId }: { campusId: string }) {
  if (campusId === ALL_CAMPUSES_VALUE) {
    return (
      <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand ring-1 ring-brand/12">
        All Campuses
      </span>
    );
  }
  const campus = CAMPUSES.find((c) => c.id === campusId);
  if (!campus) return null;
  return (
    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand ring-1 ring-brand/12">
      {campus.campusCode}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section heading (matches KpiGroupHeading style)
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeading({
  title,
  campusId,
  className,
}: {
  title: string;
  campusId: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="h-4 w-1 shrink-0 rounded-full bg-gradient-to-b from-primary to-primary/40"
      />
      <h2 className="shrink-0 font-heading text-sm font-bold tracking-tight text-foreground">
        {title}
      </h2>
      <span
        aria-hidden
        className="h-px flex-1 bg-gradient-to-r from-border via-border/60 to-transparent"
      />
      <CampusBadge campusId={campusId} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main client component
// ─────────────────────────────────────────────────────────────────────────────

export function AttendanceOverviewClient() {
  const [selectedCampus, setSelectedCampus] = React.useState(ALL_CAMPUSES_VALUE);

  const studentKPIs = React.useMemo(
    () => deriveStudentKPIs(selectedCampus),
    [selectedCampus]
  );
  const staffKPIs = React.useMemo(
    () => deriveStaffKPIs(selectedCampus),
    [selectedCampus]
  );
  const donutData = React.useMemo(
    () => deriveDonut(selectedCampus),
    [selectedCampus]
  );

  const pendingLeaves = React.useMemo(
    () =>
      EXTENDED_LEAVE_REQUESTS.filter((l) => {
        if (l.status !== "Pending") return false;
        if (selectedCampus === ALL_CAMPUSES_VALUE) return true;
        const campus = CAMPUSES.find((c) => c.id === selectedCampus);
        return campus ? l.campus === campus.campusName : true;
      }),
    [selectedCampus]
  );

  const staffPending = pendingLeaves.filter((l) => l.applicantType === "Staff").length;
  const studentPending = pendingLeaves.length - staffPending;

  const filteredChronic = React.useMemo(
    () =>
      CHRONIC_ABSENTEES.filter((a) => {
        if (selectedCampus === ALL_CAMPUSES_VALUE) return true;
        const campus = CAMPUSES.find((c) => c.id === selectedCampus);
        return campus ? a.campus === campus.campusName : true;
      }),
    [selectedCampus]
  );

  const campusMatrixFiltered = React.useMemo(
    () =>
      selectedCampus === ALL_CAMPUSES_VALUE
        ? CAMPUS_ATTENDANCE_MATRIX
        : CAMPUS_ATTENDANCE_MATRIX.filter((r) => {
            const campus = CAMPUSES.find((c) => c.id === selectedCampus);
            return campus ? r.campus === campus.campusName : true;
          }),
    [selectedCampus]
  );

  const selectedCampusName =
    selectedCampus === ALL_CAMPUSES_VALUE
      ? "All Campuses"
      : CAMPUSES.find((c) => c.id === selectedCampus)?.campusName ?? "All Campuses";

  // Compute biometric breakdown proportionally from donut data
  const totalPresent = studentKPIs.present + studentKPIs.late;
  const biometric = Math.round(totalPresent * 0.31);
  const rfid = Math.round(totalPresent * 0.58);
  const mobile = totalPresent - biometric - rfid;

  return (
    <>
      {/* ── Page-level filter bar ───────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/10 bg-white/80 px-4 py-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_1px_3px_rgb(9_29_62/0.06)] backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#381e0f] to-[#6e3b1f] shadow-[0_4px_10px_-3px_rgb(9_29_62/0.45)]">
            <Building2 className="size-4 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Viewing data for
            </p>
            <p className="text-xs font-bold text-foreground">{selectedCampusName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live stream indicator */}
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-xs">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span>Live Biometric &amp; RFID Stream</span>
          </div>

          <CampusSelector value={selectedCampus} onChange={setSelectedCampus} />
        </div>
      </div>

      {/* ── Student Attendance KPIs ─────────────────────────────────────── */}
      <div className="mb-6">
        <SectionHeading title="Student Attendance — Today" campusId={selectedCampus} />
        <StatGrid className="sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            key={`enrolled-${selectedCampus}`}
            label="Total Enrolled"
            value={
              <AnimatedValue key={`${selectedCampus}-enrolled`}>
                {formatNumber(studentKPIs.enrolled)}
              </AnimatedValue>
            }
            icon={GraduationCap}
          />
          <StatCard
            key={`present-${selectedCampus}`}
            label="Present Today"
            value={
              <AnimatedValue key={`${selectedCampus}-present`}>
                {formatNumber(studentKPIs.present)}
              </AnimatedValue>
            }
            icon={UserCheck}
          />
          <StatCard
            key={`absent-${selectedCampus}`}
            label="Absent Today"
            value={
              <AnimatedValue key={`${selectedCampus}-absent`}>
                {formatNumber(studentKPIs.absent)}
              </AnimatedValue>
            }
            icon={UserX}
          />
          <StatCard
            key={`late-${selectedCampus}`}
            label="Late Arrivals"
            value={
              <AnimatedValue key={`${selectedCampus}-late`}>
                {formatNumber(studentKPIs.late)}
              </AnimatedValue>
            }
            icon={CalendarClock}
          />
          <StatCard
            key={`rate-${selectedCampus}`}
            label="Attendance Rate"
            value={
              <AnimatedValue key={`${selectedCampus}-rate`}>
                {formatPercent(studentKPIs.rate)}
              </AnimatedValue>
            }
            icon={Percent}
          />
        </StatGrid>
      </div>

      {/* ── Staff Attendance KPIs ───────────────────────────────────────── */}
      <div className="mb-6">
        <SectionHeading title="Staff Attendance — Today" campusId={selectedCampus} />
        <StatGrid className="sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            key={`staff-total-${selectedCampus}`}
            label="Total Staff"
            value={
              <AnimatedValue key={`${selectedCampus}-staff-total`}>
                {formatNumber(staffKPIs.total)}
              </AnimatedValue>
            }
            icon={Users}
          />
          <StatCard
            key={`staff-duty-${selectedCampus}`}
            label="Staff On Duty"
            value={
              <AnimatedValue key={`${selectedCampus}-staff-duty`}>
                {formatNumber(staffKPIs.onDuty)}
              </AnimatedValue>
            }
            icon={UserCheck}
          />
          <StatCard
            key={`staff-leave-${selectedCampus}`}
            label="On Approved Leave"
            value={
              <AnimatedValue key={`${selectedCampus}-staff-leave`}>
                {formatNumber(staffKPIs.onLeave)}
              </AnimatedValue>
            }
            icon={CalendarClock}
          />
          <StatCard
            key={`staff-absent-${selectedCampus}`}
            label="Unexcused Absences"
            value={
              <AnimatedValue key={`${selectedCampus}-staff-absent`}>
                {formatNumber(staffKPIs.absent)}
              </AnimatedValue>
            }
            icon={UserX}
          />
          <StatCard
            key={`staff-rate-${selectedCampus}`}
            label="Duty Rate Today"
            value={
              <AnimatedValue key={`${selectedCampus}-staff-rate`}>
                {formatPercent(staffKPIs.rate)}
              </AnimatedValue>
            }
            icon={ClipboardCheck}
          />
        </StatGrid>
      </div>

      {/* ── Charts & Campus Breakdown ───────────────────────────────────── */}
      <div className="mb-6 grid gap-6 lg:grid-cols-5">
        <SectionCard
          title="Weekly Attendance Trajectory"
          className="lg:col-span-3 flex flex-col justify-between"
          contentClassName="flex-1 flex flex-col justify-between"
        >
          <LineTrendChart
            data={WEEKLY_ATTENDANCE}
            xKey="day"
            series={[
              { key: "staff", label: "Staff", color: "#0ea5e9" },
              { key: "students", label: "Students", color: "#6e3b1f" },
            ]}
            format="percent"
            yDomain={[88, 100]}
            className="h-[310px] w-full"
            showLegend
          />
        </SectionCard>

        <SectionCard
          title={
            selectedCampus === ALL_CAMPUSES_VALUE
              ? "Campus Real-Time Attendance"
              : "Campus Attendance Snapshot"
          }
          className="lg:col-span-2 flex flex-col justify-between"
          contentClassName="flex-1 flex flex-col justify-between"
        >
          <div className="space-y-3.5">
            {campusMatrixFiltered.map((c) => (
              <div key={c.campus} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{c.campus}</span>
                  <span className="font-bold tabular-nums text-foreground">
                    {formatPercent(c.studentRate)}
                  </span>
                </div>
                <Meter
                  value={c.studentRate}
                  size="xs"
                  tone="dark-blue"
                  className="h-1"
                />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="text-emerald-700 font-medium">
                    {formatNumber(c.studentsPresent)} students · {c.staffPresent} staff
                  </span>
                  <span className="text-danger font-medium">
                    {c.studentsAbsent} absent
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Tri-column Intelligence Feeds ──────────────────────────────── */}
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        {/* Column 1: Intake Distribution */}
        <SectionCard title="Today's Intake Distribution">
          <div className="flex flex-col items-center">
            <DonutChart
              data={donutData}
              centerValue={formatPercent(studentKPIs.rate)}
              centerLabel="Present Rate"
              className="h-[210px] w-full"
            />
            <div className="mt-3 w-full space-y-2 border-t border-border/60 pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Fingerprint className="size-3.5 text-brand" />
                  Biometric Scanners
                </span>
                <span className="font-semibold text-foreground">
                  31% ({formatNumber(biometric)})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Radio className="size-3.5 text-brand" />
                  RFID Gate Smartcards
                </span>
                <span className="font-semibold text-foreground">
                  58% ({formatNumber(rfid)})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Smartphone className="size-3.5 text-brand" />
                  Mobile Geo-Fence &amp; App
                </span>
                <span className="font-semibold text-foreground">
                  7% ({formatNumber(mobile)})
                </span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Column 2: Pending Leave Queue */}
        <SectionCard
          title="Pending Leave Queue"
          action={
            <Link href="/attendance/leave-requests">
              <AttendanceActionButton size="xs" tone="outline">
                Review All ({pendingLeaves.length}) →
              </AttendanceActionButton>
            </Link>
          }
        >
          {pendingLeaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <ClipboardCheck className="size-8 text-emerald-500/60" />
              <p className="text-xs font-semibold text-muted-foreground">
                No pending leave requests
              </p>
              <p className="text-[11px] text-muted-foreground/70">
                for {selectedCampusName}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingLeaves.slice(0, 4).map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-cream/30 p-3 transition-colors hover:bg-brand-50/40"
                >
                  <div className="min-w-0 flex-1">
                    <PersonCell
                      name={l.applicant}
                      subtitle={`${l.applicantType} · ${l.leaveType} (${l.days}d)`}
                      showAvatar={false}
                    />
                  </div>
                  <StatusBadge status={l.status} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Column 3: Chronic Absentee Watchlist */}
        <SectionCard
          title="Chronic Absentee Watchlist (<75%)"
          action={
            <Link href="/reports/student-attendance">
              <AttendanceActionButton size="xs" tone="outline">
                All Alerts ({filteredChronic.length > 0 ? filteredChronic.length : CHRONIC_SUMMARY.belowThreshold}) →
              </AttendanceActionButton>
            </Link>
          }
        >
          {filteredChronic.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <AlertTriangle className="size-8 text-emerald-500/60" />
              <p className="text-xs font-semibold text-muted-foreground">
                No chronic absentees
              </p>
              <p className="text-[11px] text-muted-foreground/70">
                for {selectedCampusName}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredChronic.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-cream/30 p-3 transition-colors hover:bg-brand-50/40"
                >
                  <div className="min-w-0 flex-1">
                    <PersonCell
                      name={a.name}
                      subtitle={`${a.className} · ${shortCampus(a.campus)}`}
                      showAvatar={false}
                    />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold tabular-nums text-danger">
                      {formatPercent(a.overallRate)}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {a.consecutiveDays}d consecutive
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
