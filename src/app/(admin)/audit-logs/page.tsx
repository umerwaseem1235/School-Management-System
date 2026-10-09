import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { ScrollText, AlertTriangle, Activity, Users } from "lucide-react";
import { AUDIT_LOGS } from "@/lib/mock/operations";
import { AuditTable } from "./audit-table";

export const metadata = {
  title: "Audit Logs & Security",
};

export default function AuditLogsPage() {
  const totalEvents = AUDIT_LOGS.length;
  const criticalEvents = AUDIT_LOGS.filter(l => l.severity === "Critical").length;
  const todaysActions = AUDIT_LOGS.length; // all mock events count as "today"
  const activeAdmins = new Set(AUDIT_LOGS.map(l => l.actor)).size;

  return (
    <>
      <PageHeader
        title="Audit Logs & Security"
        actions={
          <Button variant="outline" data-icon="inline-start">
            <ScrollText className="h-4 w-4" />
            Export Logs
          </Button>
        }
      />
      
      <div className="mb-6">
        <StatGrid>
          <StatCard
            label="Total Events"
            value={totalEvents.toString()}
            icon={ScrollText}
          />
          <StatCard
            label="Critical Events"
            value={criticalEvents.toString()}
            icon={AlertTriangle}
          />
          <StatCard
            label="Today's Actions"
            value={todaysActions.toString()}
            icon={Activity}
          />
          <StatCard
            label="Active Admins"
            value={activeAdmins.toString()}
            icon={Users}
          />
        </StatGrid>
      </div>

      <SectionCard flush>
        <AuditTable data={AUDIT_LOGS} />
      </SectionCard>
    </>
  );
}
