import {
  Banknote,
  Briefcase,
  Building2,
  Cake,
  CalendarClock,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Home,
  Scale,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { CAMPUSES, RECENT_ACTIVITY } from "@/lib/mock/institution";
import {
  WEEKLY_ATTENDANCE,
  CAMPUS_ATTENDANCE_TODAY,
  UPCOMING_EVENTS,
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
import {
  AreaTrendChart,
  BarSeriesChart,
  LineTrendChart,
  EnrollmentGrowthCard,
} from "@/components/charts";

const totalStudents = CAMPUSES.reduce((s, c) => s + c.students, 0);
const totalStaff = CAMPUSES.reduce((s, c) => s + c.staff, 0);
const snap = DASHBOARD_SNAPSHOT;

function KpiGroupHeading({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
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
      <div className="mb-6">
        <KpiGroupHeading title="People" />
        <StatGrid>
          <StatCard
            label="Total Students"
            value={formatNumber(totalStudents)}
            icon={GraduationCap}
          />
          <StatCard
            label="Total Staff"
            value={formatNumber(totalStaff)}
            icon={Users}
          />
          <StatCard
            label="Total Families"
            value={formatNumber(snap.totalFamilies)}
            icon={Home}
          />
          <StatCard
            label="New Admissions (Oct)"
            value="24"
            icon={UserPlus}
          />
        </StatGrid>
      </div>

      {/* Fees — Oct 2026 */}
      <div className="mb-6">
        <KpiGroupHeading
          title={`Fees — ${snap.activeMonthLabel}`}
        />
        <StatGrid>
          <StatCard
            label={`Receivable (${snap.activeMonthLabel})`}
            value={formatCurrencyCompact(snap.receivableOct)}
            icon={FileText}
          />
          <StatCard
            label={`Received (${snap.activeMonthLabel})`}
            value={formatCurrencyCompact(snap.receivedOct)}
            icon={Wallet}
          />
          <StatCard
            label={`Balances (${snap.activeMonthLabel})`}
            value={formatCurrencyCompact(snap.balancesOct)}
            icon={Scale}
          />
          <StatCard
            label="Today's Collection"
            value={formatCurrency(snap.todayCollection)}
            icon={Banknote}
          />
        </StatGrid>
      </div>

      {/* Payroll & Attendance — Oct 2026 */}
      <div className="mb-6">
        <KpiGroupHeading
          title={`Payroll & Attendance — ${snap.activeMonthLabel}`}
        />
        <StatGrid>
          <StatCard
            label={`Salary Payable (${snap.activeMonthLabel})`}
            value={formatCurrencyCompact(snap.salaryPayableOct)}
            icon={CalendarClock}
          />
          <StatCard
            label={`Salary Paid (${snap.activeMonthLabel})`}
            value={formatCurrencyCompact(snap.salaryPaidOct)}
            icon={CircleDollarSign}
          />
          <StatCard
            label="Total Salary Payable"
            value={formatCurrencyCompact(snap.totalSalaryPayable)}
            icon={Briefcase}
          />
          <StatCard
            label="Today's Attendance"
            value="93.8%"
            icon={ClipboardCheck}
          />
        </StatGrid>
      </div>

      {/* Celebrations */}
      <div className="mb-6">
        <KpiGroupHeading title="Celebrations" />
        <StatGrid className="sm:grid-cols-2 lg:grid-cols-2">
          <StatCard
            label="Student Birthdays"
            value={formatNumber(snap.studentBirthdaysMonth)}
            icon={Cake}
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
      <div className="mb-6 grid gap-6 lg:grid-cols-5">
        <SectionCard
          title="Revenue & Expenses"
          description="Monthly trend (Rs in millions)"
          className="lg:col-span-3"
        >
          <AreaTrendChart
            data={REVENUE_TREND}
            xKey="month"
            series={[
              {
                key: "collected",
                label: "Collected",
                color: "#1e4275",
                strokeWidth: 2.5,
                fillOpacity: 0.24,
              },
              {
                key: "expected",
                label: "Expected",
                color: "#0ea5e9",
                strokeWidth: 2,
                fillOpacity: 0.10,
              },
              {
                key: "expenses",
                label: "Expenses",
                color: "#3c6fb0",
                strokeWidth: 2.25,
                fillOpacity: 0.16,
              },
            ]}
            format="millions"
          />
        </SectionCard>

        <SectionCard
          title="Enrollment Growth"
          className="lg:col-span-2"
          action={
            <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-[11px] font-semibold text-success ring-1 ring-success/20">
              <TrendingUp className="size-3" />
              +5.0% YoY
            </span>
          }
        >
          <EnrollmentGrowthCard />
        </SectionCard>
      </div>

      {/* Attendance & Campus */}
      <div className="mb-6 grid gap-6 lg:grid-cols-5">
        <SectionCard
          title="Weekly Attendance"
          description="Student vs Staff attendance %"
          className="lg:col-span-3"
        >
          <LineTrendChart
            data={WEEKLY_ATTENDANCE}
            xKey="day"
            series={[
              { key: "students", label: "Students", color: "#1e4275" },
              { key: "staff", label: "Staff", color: "#3c6fb0" },
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
                <Meter value={c.rate} size="xs" gradient />
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

      {/* Campus Cards + Activity + Events */}
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        {/* Campuses */}
        <SectionCard
          title="Campuses"
          action={
            <a
              href="/campuses"
              className="text-xs font-medium text-brand hover:underline"
            >
              View all →
            </a>
          }
        >
          <div className="space-y-2.5">
            {CAMPUSES.slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-2.5 transition-all hover:bg-muted/40"
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand ring-1 ring-brand/10">
                  <Building2 className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {c.campusName.replace("Main Campus — ", "").replace(" Campus", "")}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatNumber(c.students)} students
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-brand ring-1 ring-brand/10">
                  {formatPercent(c.feeCollectionRate, 1)}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Recent Activity */}
        <SectionCard
          title="Recent Activity"
          action={
            <a
              href="/audit-logs"
              className="text-xs font-medium text-brand hover:underline"
            >
              All logs →
            </a>
          }
        >
          <div className="space-y-2.5">
            {RECENT_ACTIVITY.slice(0, 3).map((a) => {
              const iconMap = {
                admission: UserPlus,
                fee: Wallet,
                exam: CalendarClock,
                hr: Building2,
                system: ClipboardCheck,
              };
              const Icon = iconMap[a.type];
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-2.5 transition-all hover:bg-muted/40"
                >
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand ring-1 ring-brand/10">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {a.title}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {a.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                    {a.time}
                  </span>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Upcoming Events */}
        <SectionCard
          title="Upcoming Events"
          action={
            <span className="text-[11px] font-medium text-muted-foreground">
              Oct 2026
            </span>
          }
        >
          <div className="space-y-2.5">
            {UPCOMING_EVENTS.slice(0, 3).map((e) => (
              <div
                key={e.title}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-2.5 transition-all hover:bg-muted/40"
              >
                <div className="flex size-9 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-50 text-brand ring-1 ring-brand/10">
                  <span className="text-[9px] font-bold uppercase leading-none tracking-wider text-brand/70">
                    {e.month}
                  </span>
                  <span className="text-xs font-extrabold leading-none text-brand mt-0.5">
                    {e.date}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {e.title}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {e.meta}
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
