import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import {
  AreaTrendChart,
  LineTrendChart,
  BarSeriesChart,
  DonutChart,
  DonutLegend,
} from "@/components/charts";
import {
  ENROLLMENT_TREND,
  RETENTION,
  GENDER_SPLIT,
  MONTHLY_ATTENDANCE,
} from "@/lib/mock/analytics";
import { GRADE_DISTRIBUTION } from "@/lib/mock/academics";
import { REVENUE_TREND } from "@/lib/mock/operations";

export const metadata = {
  title: "Reports & Analytics",
};

const genderDonut = GENDER_SPLIT.map((g) => ({
  name: g.name,
  value: g.value,
  color: g.name === "Male" ? "#353955" : "#c79a3a",
}));

export default function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports & Analytics" />

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Enrollment Trend">
          <LineTrendChart
            data={ENROLLMENT_TREND}
            xKey="year"
            series={[{ key: "students", label: "Students", color: "#353955" }]}
          />
        </SectionCard>

        <SectionCard title="Student Retention">
          <BarSeriesChart
            data={RETENTION}
            xKey="year"
            series={[
              { key: "retention", label: "Retention Rate (%)", color: "#2f8f6b" },
              { key: "dropout", label: "Dropout Rate (%)", color: "#c8463d" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Gender Distribution">
          <div className="flex flex-col items-center justify-center gap-6">
            <DonutChart data={genderDonut} centerValue="5,662" centerLabel="Students" />
            <DonutLegend data={genderDonut} />
          </div>
        </SectionCard>

        <SectionCard title="Grade Distribution">
          <BarSeriesChart
            data={GRADE_DISTRIBUTION}
            xKey="grade"
            series={[{ key: "students", label: "Number of Students", color: "#353955" }]}
          />
        </SectionCard>

        <SectionCard title="Revenue vs Expenses">
          <AreaTrendChart
            data={REVENUE_TREND}
            xKey="month"
            series={[
              { key: "collected", label: "Collected", color: "#353955" },
              { key: "expected", label: "Expected", color: "#c79a3a" },
              { key: "expenses", label: "Expenses", color: "#c8463d" },
            ]}
            format="millions"
          />
        </SectionCard>

        <SectionCard title="Attendance Trends">
          <LineTrendChart
            data={MONTHLY_ATTENDANCE}
            xKey="month"
            series={[{ key: "rate", label: "Attendance Rate (%)", color: "#3c6fb0" }]}
            format="percent"
            yDomain={[85, 100]}
          />
        </SectionCard>
      </div>
    </>
  );
}
