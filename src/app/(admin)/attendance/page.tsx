import { PageHeader } from "@/components/shared/page-header"
import { StatCard, StatGrid } from "@/components/shared/stat-card"
import { SectionCard } from "@/components/shared/section-card"
import { LineTrendChart } from "@/components/charts"
import { Meter } from "@/components/shared/meter"
import { PersonCell } from "@/components/shared/user-avatar"
import { ClipboardCheck, Users, UserX, UserCheck } from "lucide-react"
import { MONTHLY_ATTENDANCE, CAMPUS_ATTENDANCE_TODAY, ATTENDANCE_ALERTS } from "@/lib/mock/analytics"

export const metadata = {
  title: "Attendance Management",
}

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Attendance Management" />
      
      <StatGrid>
        <StatCard label="Today's Average" value="93.8%" icon={ClipboardCheck} />
        <StatCard label="Students Present" value="12,450" icon={Users} />
        <StatCard label="Students Absent" value="823" icon={UserX} />
        <StatCard label="Staff Attendance" value="97.2%" icon={UserCheck} />
      </StatGrid>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <SectionCard title="Attendance Trends">
            <LineTrendChart 
              data={MONTHLY_ATTENDANCE}
              xKey="month"
              series={[{ key: "rate", label: "Attendance Rate", color: "#353955" }]}
              format="percent"
              yDomain={[85, 100]}
            />
          </SectionCard>
        </div>
        <div className="lg:col-span-2">
          <SectionCard title="Campus Breakdown Today">
            <div className="space-y-4">
              {CAMPUS_ATTENDANCE_TODAY.map((campus) => (
                <div key={campus.campus} className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{campus.campus}</span>
                    <span className="text-muted-foreground">{campus.rate}%</span>
                  </div>
                  <Meter value={campus.rate} tone={campus.rate > 90 ? "success" : "warning"} size="sm" />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Attendance Alerts">
        <div className="divide-y">
          {ATTENDANCE_ALERTS.map((alert: any) => (
            <div key={alert.studentId || alert.id || alert.name} className="flex items-center justify-between py-3">
              <PersonCell name={alert.name} subtitle={`${alert.class} • ${alert.campus}`} />
              <div className="flex items-center gap-4 text-sm text-right">
                <div>
                  <div className="font-medium text-[var(--color-danger)]">{alert.rate}%</div>
                  <div className="text-muted-foreground text-xs">Overall</div>
                </div>
                <div>
                  <div className="font-medium text-[var(--color-danger)]">{alert.consecutiveAbsences} days</div>
                  <div className="text-muted-foreground text-xs">Consecutive</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
