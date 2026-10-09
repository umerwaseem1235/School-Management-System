import { PageHeader } from "@/components/shared/page-header"
import { StatCard, StatGrid } from "@/components/shared/stat-card"
import { SectionCard } from "@/components/shared/section-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { Meter } from "@/components/shared/meter"
import { Button } from "@/components/ui/button"
import { CAMPUSES } from "@/lib/mock/institution"
import { formatNumber, formatPercent } from "@/lib/format"
import { Building2, GraduationCap, Users, Wallet, MapPin, User as UserIcon } from "lucide-react"

export const metadata = { title: "Campus Management" }

export default function CampusesPage() {
  const totalCampuses = CAMPUSES.length;
  const totalStudents = CAMPUSES.reduce((acc, curr) => acc + (curr.students || 0), 0);
  const totalStaff = CAMPUSES.reduce((acc, curr) => acc + (curr.staff || 0), 0);
  const avgFeeCollection = CAMPUSES.reduce((acc, curr) => acc + (curr.feeCollectionRate || 0), 0) / CAMPUSES.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Management"
        actions={<Button>+ Add Campus</Button>}
      />

      <StatGrid>
        <StatCard label="Total Campuses" value={totalCampuses.toString()} icon={Building2} />
        <StatCard label="Total Students" value={formatNumber(totalStudents)} icon={GraduationCap} />
        <StatCard label="Total Staff" value={formatNumber(totalStaff)} icon={Users} />
        <StatCard label="Avg Fee Collection Rate" value={formatPercent(avgFeeCollection)} icon={Wallet} />
      </StatGrid>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {CAMPUSES.map((campus) => {
          const capacityUtilization = campus.students / campus.capacity;
          // Determine scale for meter: Assuming 0-1 range for utilization, multiply by 100 for percentage
          const utilValue = capacityUtilization * 100;
          const feeValue = campus.feeCollectionRate * 100;
          
          return (
            <SectionCard key={campus.id} title={campus.campusName} description={`Code: ${campus.campusCode}`}>
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    {campus.city}
                  </div>
                  <StatusBadge status={campus.status} />
                </div>
                
                <div className="flex items-center text-sm">
                  <UserIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="font-medium mr-1">Principal:</span> {campus.principal}
                </div>

                <div className="grid grid-cols-2 gap-4 py-2">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Students</div>
                    <div className="font-medium">{formatNumber(campus.students)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Staff</div>
                    <div className="font-medium">{formatNumber(campus.staff)}</div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border/50">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Capacity Utilization</span>
                      <span className="font-medium">{formatPercent(capacityUtilization)}</span>
                    </div>
                    <Meter value={utilValue} tone={utilValue > 90 ? "danger" : "success"} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Fee Collection</span>
                      <span className="font-medium">{formatPercent(campus.feeCollectionRate)}</span>
                    </div>
                    <Meter value={feeValue} tone={feeValue < 80 ? "warning" : "success"} />
                  </div>
                </div>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  )
}
