import { Briefcase, Clock, UserCheck, Users } from "lucide-react";
import { EMPLOYEES, LEAVE_REQUESTS } from "@/lib/mock/operations";
import { formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { HRClient } from "./hr-client";

export const metadata = { title: "HR & Payroll" };

export default function HRPayrollPage() {
  const teaching = EMPLOYEES.filter((e) => e.type === "Teaching").length;
  const nonTeaching = EMPLOYEES.length - teaching;
  const pendingLeaves = LEAVE_REQUESTS.filter((l) => l.status === "Pending").length;

  return (
    <>
      <PageHeader
        title="HR & Payroll Management"
        actions={
          <>
            <Button variant="outline">
              <Briefcase className="size-4" data-icon="inline-start" /> Run Payroll
            </Button>
            <Button>
              <Users className="size-4" data-icon="inline-start" /> + Add Employee
            </Button>
          </>
        }
      />

      <StatGrid className="mb-6">
        <StatCard label="Total Employees" value={formatNumber(EMPLOYEES.length)} icon={Briefcase} />
        <StatCard label="Teaching Staff" value={formatNumber(teaching)} icon={UserCheck} />
        <StatCard label="Non-Teaching Staff" value={formatNumber(nonTeaching)} icon={Users} />
        <StatCard label="Pending Leaves" value={String(pendingLeaves)} icon={Clock} />
      </StatGrid>

      <HRClient />
    </>
  );
}
