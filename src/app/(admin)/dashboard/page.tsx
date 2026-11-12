import {
  Banknote,
  Briefcase,
  Cake,
  CalendarClock,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Home,
  Scale,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { CAMPUSES } from "@/lib/mock/institution";
import {
  ENROLLMENT_TREND,
  WEEKLY_ATTENDANCE,
  CAMPUS_ATTENDANCE_TODAY,
} from "@/lib/mock/analytics";
import {
  DASHBOARD_SNAPSHOT,
  REVENUE_TREND,
} from "@/lib/mock/operations";
import { formatCurrency, formatCurrencyCompact, formatNumber, formatPercent } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { Meter } from "@/components/shared/meter";
import { AreaTrendChart, BarSeriesChart, LineTrendChart } from "@/components/charts";

const totalStudents = CAMPUSES.reduce((s, c) => s + c.students, 0);
const totalStaff = CAMPUSES.reduce((s, c) => s + c.staff, 0);
const snap = DASHBOARD_SNAPSHOT;
const feeCollectedRate =
  (snap.receivedOct / snap.receivableOct) * 100;
const salaryDisbursedRate =
  (snap.salaryPaidOct / snap.salaryPayableOct) * 100;

function KpiGroupHeading({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
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
      {meta && (
        <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-brand ring-1 ring-brand/10">
          {meta}
        </span>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" />

      {/* People */}
      <div className="mb-6 animate-in fade-in-50 duration-500 fill-mode-both">
        <KpiGroupHeading title="People" />
        <StatGrid>
          <StatCard
            label="Total Students"
            value={formatNumber(totalStudents)}
            icon={GraduationCap}
            href="/students"
          />
          <StatCard
            label="Total Staff"
            value={formatNumber(totalStaff)}
            icon={Users}
            href="/staff"
          />
          <StatCard
            label="Total Families"
            value={formatNumber(snap.totalFamilies)}
            icon={Home}
            href="/students"
          />
          <StatCard
            label="New Admissions (Oct)"
            value="24"
            icon={UserPlus}
            href="/admissions"
          />
        </StatGrid>
      </div>

      {/* Fees — Oct 2026 */}
      <div className="mb-6 animate-in fade-in-50 duration-500 fill-mode-both">
        <KpiGroupHeading
          title={`Fees — ${snap.activeMonthLabel}`}
          meta={`${formatPercent(feeCollectedRate)} collected`}
        />
        <StatGrid>
          <StatCard
            label={`Receivable (${snap.activeMonthLabel})`}
            value={formatCurrencyCompact(snap.receivableOct)}
            icon={FileText}
            href="/fees"
          />
          <StatCard
            label={`Received (${snap.activeMonthLabel})`}
            value={formatCurrencyCompact(snap.receivedOct)}
            icon={Wallet}
            href="/fees/reports"
          />
          <StatCard
            label={`Balances (${snap.activeMonthLabel})`}
            value={formatCurrencyCompact(snap.balancesOct)}
            icon={Scale}
            href="/fees/adjustments"
          />
          <StatCard
            label="Today's Collection"
            value={formatCurrency(snap.todayCollection)}
            icon={Banknote}
            href="/fees/reports"
          />
        </StatGrid>
      </div>

      {/* Payroll & Attendance — Oct 2026 */}
      <div className="mb-6 animate-in fade-in-50 duration-500 fill-mode-both">
        <KpiGroupHeading
          title={`Payroll & Attendance — ${snap.activeMonthLabel}`}
          meta={`${formatPercent(salaryDisbursedRate)} disbursed`}
        />
        <StatGrid>
          <StatCard
            label={`Salary Payable (${snap.activeMonthLabel})`}
            value={formatCurrencyCompact(snap.salaryPayableOct)}
            icon={CalendarClock}
            href="/hr-payroll"
          />
          <StatCard
            label={`Salary Paid (${snap.activeMonthLabel})`}
            value={formatCurrencyCompact(snap.salaryPaidOct)}
            icon={CircleDollarSign}
            href="/fees/payroll"
          />
          <StatCard
            label="Total Salary Payable"
            value={formatCurrencyCompact(snap.totalSalaryPayable)}
            icon={Briefcase}
            href="/hr-payroll"
          />
          <StatCard
            label="Today's Attendance"
            value="93.8%"
            icon={ClipboardCheck}
            href="/attendance"
          />
        </StatGrid>
      </div>

      {/* Celebrations */}
      <div className="mb-6 animate-in fade-in-50 duration-500 fill-mode-both">
        <KpiGroupHeading title="Celebrations" />
        <StatGrid className="sm:grid-cols-2 lg:grid-cols-2">
          <StatCard
            label="Student Birthdays"
            value={formatNumber(snap.studentBirthdaysMonth)}
            icon={Cake}
            href="/students"
            split={[
              {
                label: "Today",
                value: formatNumber(snap.studentBirthdaysToday),
              },
              {
                label: "Month",
                value: formatNumber(snap.studentBirthdaysMonth),
              },
            ]}
          />
          <StatCard
            label="Staff Birthdays"
            value={formatNumber(snap.staffBirthdaysMonth)}
            icon={Cake}
            href="/staff"
            split={[
              {
                label: "Today",
                value: formatNumber(snap.staffBirthdaysToday),
              },
              {
                label: "Month",
                value: formatNumber(snap.staffBirthdaysMonth),
              },
            ]}
          />
        </StatGrid>
      </div>

      {/* Revenue & Enrollment */}
      <div className="mb-6 grid gap-6 lg:grid-cols-5 animate-in fade-in-50 duration-500 fill-mode-both">
        <SectionCard
          title="Revenue & Expenses"
          description="Monthly trend (Rs in millions)"
          className="lg:col-span-3"
        >
          <AreaTrendChart
            data={REVENUE_TREND}
            xKey="month"
            series={[
              { key: "collected", label: "Collected", color: "#1e4275" },
              { key: "expected", label: "Expected", color: "#0ea5e9" },
              { key: "expenses", label: "Expenses", color: "#93c5fd" },
            ]}
            format="millions"
          />
        </SectionCard>

        <SectionCard
          title="Enrollment Growth"
          description="Year-over-year student count"
          className="lg:col-span-2"
        >
          <BarSeriesChart
            data={ENROLLMENT_TREND}
            xKey="year"
            series={[{ key: "students", label: "Students", color: "#1e4275" }]}
            format="compact"
          />
        </SectionCard>
      </div>

      {/* Attendance & Campus */}
      <div className="mb-6 grid gap-6 lg:grid-cols-5 animate-in fade-in-50 duration-500 fill-mode-both">
        <SectionCard
          title="Weekly Attendance"
          description="Student vs Staff attendance %"
          className="lg:col-span-3"
        >
          <LineTrendChart
            data={WEEKLY_ATTENDANCE}
            xKey="day"
            series={[
              { key: "staff", label: "Staff", color: "#0ea5e9" },
              { key: "students", label: "Students", color: "#1e4275" },
            ]}
            format="percent"
            yDomain={[85, 100]}
            showLegend
          />
        </SectionCard>

        <SectionCard
          title="Campus Attendance Today"
          description="Breakdown by campus"
          className="lg:col-span-2"
        >
          <div className="space-y-4">
            {CAMPUS_ATTENDANCE_TODAY.map((c) => (
              <div key={c.campus}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{c.campus}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatPercent(c.rate)}
                  </span>
                </div>
                <Meter value={c.rate} />
                <div className="mt-1 flex gap-3 text-[11px] text-muted-foreground">
                  <span className="text-success">{c.present} present</span>
                  <span className="text-danger">{c.absent} absent</span>
                  <span className="text-warning">{c.late} late</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}
