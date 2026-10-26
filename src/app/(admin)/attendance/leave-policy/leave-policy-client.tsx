"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Briefcase,
  Calendar,
  Check,
  Download,
  FileCheck2,
  FileText,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AttendanceActionButton,
  DashboardFeatureCard,
  fieldClass,
} from "../_components/attendance-ui";
import { LEAVE_POLICY_QUOTAS } from "@/lib/mock/attendance";

interface PolicyQuotaItem {
  category: string;
  applicableTo: string;
  annualQuota: string;
  carryForward: string;
  approvalAuthority: string;
  days: string;
}

const POLICY_GUIDELINES = [
  {
    code: "CL",
    category: "Casual Leave",
    applicableTo: "All Permanent Staff",
    noticePeriod: "24 Hours Advance Notice",
    documentation: "Self-declaration / HOD email",
    carryForward: "Non-cumulative (Lapses Dec 31)",
    authority: "Campus Principal / HR Admin",
  },
  {
    code: "ML",
    category: "Medical / Sick Leave",
    applicableTo: "Staff & Enrolled Students",
    noticePeriod: "Intimation on Day 1",
    documentation: "Medical certificate required if > 2 days",
    carryForward: "Accumulates up to 24 days (Staff)",
    authority: "Class Teacher / HR Admin",
  },
  {
    code: "EL",
    category: "Annual Earned Leave",
    applicableTo: "Non-Vacation / Admin Staff",
    noticePeriod: "14 Days Prior Application",
    documentation: "Departmental handover plan",
    carryForward: "Encashable up to 10 days annually",
    authority: "Super Admin / HR Director",
  },
  {
    code: "EM",
    category: "Emergency / Bereavement",
    applicableTo: "All Staff & Students",
    noticePeriod: "Immediate via Call / WhatsApp",
    documentation: "Post-facto justification within 3 days",
    carryForward: "Case-by-case approval",
    authority: "Campus Principal",
  },
];

export function LeavePolicyClient() {
  const [policyQuotas, setPolicyQuotas] = React.useState<PolicyQuotaItem[]>(() =>
    LEAVE_POLICY_QUOTAS.map((q) => {
      const match = q.annualQuota.match(/\d+/);
      return {
        ...q,
        days: match ? match[0] : "10",
      };
    })
  );

  const [policyDialogOpen, setPolicyDialogOpen] = React.useState(false);
  const [draftQuotas, setDraftQuotas] = React.useState(policyQuotas);

  const openPolicyEditor = () => {
    setDraftQuotas(policyQuotas.map((q) => ({ ...q })));
    setPolicyDialogOpen(true);
  };

  const handleSavePolicyQuotas = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = draftQuotas.map((q) => {
      const numDays = Math.max(0, Number(q.days) || 0);
      return {
        ...q,
        days: String(numDays),
        annualQuota: `${numDays} ${numDays === 1 ? "Day" : "Days"}`,
      };
    });
    setPolicyQuotas(updated);
    setPolicyDialogOpen(false);
    toast.success("Institutional leave policy quotas updated successfully.");
  };

  return (
    <>
      <PageHeader
        title="Leave Policy & Quotas"
        actions={
          <>
            <AttendanceActionButton
              tone="outline"
              onClick={() => toast.success("Leave policy document exported as PDF")}
            >
              <Download />
              Export Policy PDF
            </AttendanceActionButton>
            <AttendanceActionButton tone="primary" onClick={openPolicyEditor}>
              <SlidersHorizontal />
              Update Leave Quotas
            </AttendanceActionButton>
          </>
        }
      />

      {/* Policy Overview KPI Cards */}
      <div className="mb-6">
        <StatGrid className="max-w-none sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Leave Categories"
            value={`${policyQuotas.length} Categories`}
            icon={Briefcase}
          />
          <StatCard
            label="Max Annual Entitlement"
            value="20 Days / Year"
            icon={Calendar}
          />
          <StatCard
            label="Medical & Sick Allowance"
            value="12–15 Days"
            icon={FileCheck2}
          />
          <StatCard
            label="Approval Hierarchy"
            value="3 Tiers"
            icon={ShieldCheck}
          />
        </StatGrid>
      </div>

      <div className="space-y-6">
        {/* Section 1: Leave Categories & Quota Cards */}
        <SectionCard
          title="Institutional Leave Policy & Quotas (2026–27)"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {policyQuotas.map((rule) => (
              <DashboardFeatureCard
                key={rule.category}
                icon={ShieldCheck}
                title={rule.category}
                subtitle={rule.applicableTo}
                badge={<Badge>{rule.annualQuota}</Badge>}
                footer={
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Approval Authority</span>
                    <span className="font-semibold text-foreground">
                      {rule.approvalAuthority}
                    </span>
                  </div>
                }
              >
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Carry-Forward Rule:
                  </span>{" "}
                  {rule.carryForward}
                </p>
              </DashboardFeatureCard>
            ))}
          </div>
        </SectionCard>

        {/* Section 2: Policy Governance & Documentation Matrix */}
        <SectionCard
          title="Institutional Governance & Approval Matrix"
          flush
        >
          <div className="overflow-x-auto scrollbar-thin-light">
            <table className="w-full min-w-[720px] table-fixed text-sm">
              <thead>
                <tr className="border-y border-[#dbe4f0] bg-gradient-to-b from-[#f8fafd] via-[#f4f7fc] to-[#eef3fa] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.95)]">
                  <th className="py-3 pl-6 pr-3 text-center font-heading text-xs font-semibold text-foreground/80 w-[24%]">
                    Category & Code
                  </th>
                  <th className="py-3 px-3 text-center font-heading text-xs font-semibold text-foreground/80 w-[18%]">
                    Target Beneficiaries
                  </th>
                  <th className="py-3 px-3 text-center font-heading text-xs font-semibold text-foreground/80 w-[16%]">
                    Notice Period
                  </th>
                  <th className="py-3 px-3 text-center font-heading text-xs font-semibold text-foreground/80 w-[22%]">
                    Documentation Rule
                  </th>
                  <th className="py-3 pr-6 pl-3 text-center font-heading text-xs font-semibold text-foreground/80 w-[20%]">
                    Approval Authority
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {POLICY_GUIDELINES.map((item) => (
                  <tr key={item.code} className="transition-colors hover:bg-brand-50/30">
                    <td className="py-3.5 pl-6 pr-3">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-7 shrink-0 place-items-center rounded bg-brand/10 font-mono text-[11px] font-bold text-brand">
                          {item.code}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground">{item.category}</p>
                          <p className="text-[11px] text-muted-foreground">{item.carryForward}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="text-xs text-foreground font-medium">
                        {item.applicableTo}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center text-xs text-muted-foreground font-medium">
                      {item.noticePeriod}
                    </td>
                    <td className="py-3.5 px-3 text-center text-xs text-muted-foreground">
                      {item.documentation}
                    </td>
                    <td className="py-3.5 pr-6 pl-3 text-center">
                      <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/50 px-2 py-0.5 text-[11px] font-semibold text-brand">
                        {item.authority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {/* Update Institutional Leave Policy & Quotas Dialog */}
      <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Institutional Leave Quotas</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSavePolicyQuotas} className="space-y-3.5 py-1">
            <div className="space-y-2.5">
              {draftQuotas.map((rule, idx) => (
                <div
                  key={rule.category}
                  className="flex items-center justify-between gap-4 rounded-xl border border-brand/15 bg-slate-50/70 px-4 py-3 shadow-2xs"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-foreground">
                      {rule.category}
                    </h4>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {rule.applicableTo}
                    </p>
                  </div>

                  <div className="relative flex w-32 shrink-0 items-center">
                    <input
                      type="number"
                      min={0}
                      max={365}
                      required
                      aria-label={`${rule.category} allowed days`}
                      className={cn(fieldClass, "h-9 pr-12 font-semibold tabular-nums")}
                      value={rule.days}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setDraftQuotas((prev) =>
                          prev.map((item, i) =>
                            i === idx
                              ? {
                                  ...item,
                                  days: raw,
                                  annualQuota: `${Number(raw) || 0} Days`,
                                }
                              : item
                          )
                        );
                      }}
                    />
                    <span className="pointer-events-none absolute right-3 text-[11px] font-semibold text-muted-foreground">
                      Days
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="flex items-center justify-between gap-2 pt-2 sm:justify-between">
              <AttendanceActionButton
                type="button"
                tone="outline"
                onClick={() => {
                  const defaults = LEAVE_POLICY_QUOTAS.map((q) => {
                    const match = q.annualQuota.match(/\d+/);
                    return {
                      ...q,
                      days: match ? match[0] : "10",
                    };
                  });
                  setDraftQuotas(defaults);
                  toast.info("Reset draft leave quotas to institutional defaults.");
                }}
              >
                <RotateCcw />
                Reset Defaults
              </AttendanceActionButton>
              <div className="flex items-center gap-2">
                <AttendanceActionButton
                  type="button"
                  tone="outline"
                  onClick={() => setPolicyDialogOpen(false)}
                >
                  Cancel
                </AttendanceActionButton>
                <AttendanceActionButton type="submit" tone="primary">
                  <Check />
                  Save Leave Quotas
                </AttendanceActionButton>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
