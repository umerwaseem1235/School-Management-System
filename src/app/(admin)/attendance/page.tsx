import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  ClipboardCheck,
  Fingerprint,
  GraduationCap,
  Percent,
  Radio,
  Smartphone,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { Meter } from "@/components/shared/meter";
import { PersonCell } from "@/components/shared/user-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  DonutChart,
  LineTrendChart,
} from "@/components/charts";
import {
  AttendanceActionButton,
} from "./_components/attendance-ui";
import { shortCampus } from "./_components/attendance-utils";
import {
  WEEKLY_ATTENDANCE,
  CAMPUS_ATTENDANCE_TODAY,
} from "@/lib/mock/analytics";
import {
  CAMPUS_ATTENDANCE_MATRIX,
  CHRONIC_ABSENTEES,
  CHRONIC_SUMMARY,
  EXTENDED_LEAVE_REQUESTS,
  STAFF_TODAY,
  STUDENT_TODAY,
  TODAY_DISTRIBUTION_DONUT,
} from "@/lib/mock/attendance";
import { formatNumber, formatPercent } from "@/lib/format";

export const metadata = {
  title: "Attendance Overview — EduSphere Multi-Campus",
};

export default function AttendancePage() {
  const pendingLeaves = EXTENDED_LEAVE_REQUESTS.filter(
    (l) => l.status === "Pending"
  );
  const staffPending = pendingLeaves.filter(
    (l) => l.applicantType === "Staff"
  ).length;
  const studentPending = pendingLeaves.length - staffPending;
  const staffOnDuty = STAFF_TODAY.present + STAFF_TODAY.late;

  return (
    <>
      <PageHeader
        title="Attendance Overview"
        actions={
          <>
            <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-xs">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span>Live Biometric & RFID Stream</span>
            </div>
          </>
        }
      />

      {/* Student Attendance — Today */}
      <div className="mb-6">
        <StatGrid className="sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total Enrolled"
            value={formatNumber(STUDENT_TODAY.enrolled)}
            icon={GraduationCap}
          />
          <StatCard
            label="Present Today"
            value={formatNumber(STUDENT_TODAY.present)}
            icon={UserCheck}
          />
          <StatCard
            label="Absent Today"
            value={formatNumber(STUDENT_TODAY.absent)}
            icon={UserX}
          />
          <StatCard
            label="Late Arrivals"
            value={formatNumber(STUDENT_TODAY.late)}
            icon={CalendarClock}
          />
          <StatCard
            label="Attendance Rate"
            value={formatPercent(STUDENT_TODAY.rate)}
            icon={Percent}
          />
        </StatGrid>
      </div>

      {/* Staff Attendance & Leaves — Today */}
      <div className="mb-6">
        <StatGrid className="sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total Staff"
            value={formatNumber(STAFF_TODAY.total)}
            icon={Users}
          />
          <StatCard
            label="Staff On Duty"
            value={formatNumber(staffOnDuty)}
            icon={UserCheck}
          />
          <StatCard
            label="On Approved Leave"
            value={formatNumber(STAFF_TODAY.onLeave)}
            icon={CalendarClock}
          />
          <StatCard
            label="Unexcused Absences"
            value={formatNumber(STAFF_TODAY.absent)}
            icon={UserX}
          />
          <StatCard
            label="Duty Rate Today"
            value={formatPercent(STAFF_TODAY.rate)}
            icon={ClipboardCheck}
          />
        </StatGrid>
      </div>

      {/* Charts & Campus Breakdown (3+2 grid layout) */}
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
              { key: "students", label: "Students", color: "#1e4275" },
            ]}
            format="percent"
            yDomain={[88, 100]}
            className="h-[310px] w-full"
            showLegend
          />
        </SectionCard>

        <SectionCard
          title="Campus Real-Time Attendance"
          className="lg:col-span-2 flex flex-col justify-between"
          contentClassName="flex-1 flex flex-col justify-between"
        >
          <div className="space-y-3.5">
            {CAMPUS_ATTENDANCE_MATRIX.map((c) => (
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

      {/* Tri-column Intelligence & Action Feeds */}
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        {/* Column 1: Today's Student Attendance Distribution */}
        <SectionCard
          title="Today's Intake Distribution"
        >
          <div className="flex flex-col items-center">
            <DonutChart
              data={TODAY_DISTRIBUTION_DONUT}
              centerValue={formatPercent(STUDENT_TODAY.rate)}
              centerLabel="Present Rate"
              className="h-[210px] w-full"
            />
            <div className="mt-3 w-full space-y-2 border-t border-border/60 pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Fingerprint className="size-3.5 text-brand" />
                  Biometric Scanners
                </span>
                <span className="font-semibold text-foreground">31% (1,024)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Radio className="size-3.5 text-brand" />
                  RFID Gate Smartcards
                </span>
                <span className="font-semibold text-foreground">58% (1,915)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Smartphone className="size-3.5 text-brand" />
                  Mobile Geo-Fence & App
                </span>
                <span className="font-semibold text-foreground">7% (231)</span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Column 2: Pending Leave Requests */}
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
        </SectionCard>

        {/* Column 3: Chronic Absenteeism Watchlist */}
        <SectionCard
          title="Chronic Absentee Watchlist (<75%)"
          action={
            <Link href="/attendance/reports">
              <AttendanceActionButton size="xs" tone="outline">
                All Alerts ({CHRONIC_SUMMARY.belowThreshold}) →
              </AttendanceActionButton>
            </Link>
          }
        >
          <div className="space-y-3">
            {CHRONIC_ABSENTEES.slice(0, 4).map((a) => (
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
        </SectionCard>
      </div>
    </>
  );
}
