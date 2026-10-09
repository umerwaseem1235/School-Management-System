import { PageHeader } from "@/components/shared/page-header";
import { StatGrid, StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Activity, Download, Plus } from "lucide-react";
import { STUDENTS } from "@/lib/mock/institution";
import { formatNumber, formatPercent } from "@/lib/format";
import { StudentsTable } from "./students-table";

export const metadata = {
  title: "Student Information System",
};

export default function StudentsPage() {
  const total = STUDENTS.length;
  const activeCount = STUDENTS.filter((s) => s.status === "Active").length;
  const maleCount = STUDENTS.filter((s) => s.gender === "Male").length;
  const femaleCount = STUDENTS.filter((s) => s.gender === "Female").length;
  const avgAttendance =
    STUDENTS.reduce((acc, s) => acc + (s.attendance ?? 0), 0) / (total || 1);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader
        title="Student Information System"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="size-4" data-icon="inline-start" />
              Export CSV
            </Button>
            <Button>
              <Plus className="size-4" data-icon="inline-start" />
              New Admission
            </Button>
          </div>
        }
      />

      <StatGrid>
        <StatCard label="Total Students" value={formatNumber(total)} icon={Users} />
        <StatCard label="Active Students" value={formatNumber(activeCount)} icon={UserCheck} />
        <StatCard
          label="Gender Split"
          value={`${maleCount} M / ${femaleCount} F`}
          icon={Users}
        />
        <StatCard
          label="Avg Attendance"
          value={formatPercent(avgAttendance / 100)}
          icon={Activity}
        />
      </StatGrid>

      <SectionCard flush>
        <StudentsTable />
      </SectionCard>
    </div>
  );
}
