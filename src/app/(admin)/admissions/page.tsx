import { PageHeader } from "@/components/shared/page-header";
import { StatGrid, StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { UserPlus, FileText, ClipboardList, CheckCircle, GraduationCap } from "lucide-react";
import { ADMISSIONS } from "@/lib/mock/institution";
import { formatNumber } from "@/lib/format";
import { AdmissionsTable } from "./admissions-table";

export const metadata = { title: "Admissions Pipeline" };

const STAGES = ["Inquiry", "Application", "Interview/Test", "Approved", "Enrolled"] as const;

export default function AdmissionsPage() {
  const total = ADMISSIONS.length;
  const inqCount = ADMISSIONS.filter((a) => a.stage === "Inquiry").length;
  const appCount = ADMISSIONS.filter((a) => a.stage === "Application").length;
  const approvedCount = ADMISSIONS.filter((a) => a.stage === "Approved").length;
  const enrolledCount = ADMISSIONS.filter((a) => a.stage === "Enrolled").length;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader
        title="Admissions Pipeline"
        actions={
          <Button>
            <UserPlus className="size-4" data-icon="inline-start" /> + New Application
          </Button>
        }
      />

      <StatGrid>
        <StatCard label="Total Applications" value={formatNumber(total)} icon={FileText} />
        <StatCard label="Inquiries" value={formatNumber(inqCount)} icon={UserPlus} />
        <StatCard label="Approved" value={formatNumber(approvedCount)} icon={CheckCircle} />
        <StatCard label="Enrolled" value={formatNumber(enrolledCount)} icon={GraduationCap} />
      </StatGrid>

      {/* Pipeline stages visual */}
      <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {STAGES.map((stage, idx) => {
          const count = ADMISSIONS.filter((a) => a.stage === stage).length;
          return (
            <div key={stage} className="flex shrink-0 items-center gap-2">
              <div className="flex min-w-[120px] flex-col rounded-lg border bg-background px-4 py-2">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{stage}</span>
                <span className="text-xl font-semibold">{count}</span>
              </div>
              {idx < STAGES.length - 1 && (
                <div className="text-muted-foreground/30">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SectionCard flush>
        <AdmissionsTable />
      </SectionCard>
    </div>
  );
}
