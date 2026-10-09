import { PageHeader } from "@/components/shared/page-header"
import { StatCard, StatGrid } from "@/components/shared/stat-card"
import { SectionCard } from "@/components/shared/section-card"
import { Button } from "@/components/ui/button"
import { USERS } from "@/lib/mock/institution"
import { formatNumber } from "@/lib/format"
import { Users as UsersIcon, UserCheck, ShieldCheck, Clock } from "lucide-react"
import { UsersTable } from "./users-table"

export const metadata = { title: "Users & Access Control" }

export default function UsersPage() {
  const totalUsers = USERS.length;
  const activeUsers = USERS.filter(u => u.status === "Active").length;
  const roleCount = new Set(USERS.map(u => u.role)).size;
  // Mock recent logins for today based on active users
  const recentLogins = Math.floor(activeUsers * 0.4); 

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Access Control"
        actions={<Button>+ Create User</Button>}
      />

      <StatGrid>
        <StatCard label="Total Users" value={formatNumber(totalUsers)} icon={UsersIcon} />
        <StatCard label="Active Users" value={formatNumber(activeUsers)} icon={UserCheck} />
        <StatCard label="Roles" value={roleCount.toString()} icon={ShieldCheck} />
        <StatCard label="Recent Logins (Today)" value={formatNumber(recentLogins)} icon={Clock} />
      </StatGrid>

      <SectionCard flush>
        <UsersTable data={USERS} />
      </SectionCard>
    </div>
  )
}
