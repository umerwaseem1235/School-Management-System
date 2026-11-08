"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Check,
  CheckCircle2,
  Clock,
  Minus,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  SlidersHorizontal,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { printHtml } from "@/lib/print-html";

export interface PolicyQuotaItem {
  id: string;
  code: string;
  category: string;
  applicableTo: "Permanent Staff" | "Staff & Students" | "Non-Vacation Staff";
  scope: "Staff" | "Students" | "All";
  annualQuota: string;
  days: number;
  noticePeriod: string;
  carryForward: string;
  approvalAuthority: string;
  description: string;
}

const INITIAL_POLICIES: PolicyQuotaItem[] = [
  {
    id: "pol-cl",
    code: "CL",
    category: "Casual Leave",
    applicableTo: "Permanent Staff",
    scope: "Staff",
    annualQuota: "10 Days",
    days: 10,
    noticePeriod: "24 Hours Advance Notice",
    carryForward: "Non-cumulative (Lapses Dec 31)",
    approvalAuthority: "Campus Principal",
    description: "Short-term personal affairs, urgent domestic matters, and unforeseen errands.",
  },
  {
    id: "pol-ml",
    code: "ML",
    category: "Medical / Sick Leave",
    applicableTo: "Staff & Students",
    scope: "All",
    annualQuota: "12–15 Days",
    days: 12,
    noticePeriod: "Day 1 Intimation by 09:00 AM",
    carryForward: "Accumulates up to 24 days (Staff)",
    approvalAuthority: "Class Teacher / HR Admin",
    description: "Incapacity due to illness or injury. Medical certificate mandatory if exceeding 2 days.",
  },
  {
    id: "pol-el",
    code: "EL",
    category: "Annual Earned Leave",
    applicableTo: "Non-Vacation Staff",
    scope: "Staff",
    annualQuota: "20 Days",
    days: 20,
    noticePeriod: "14 Days Prior Notice",
    carryForward: "Encashable up to 10 days annually",
    approvalAuthority: "HR Director / Super Admin",
    description: "Statutory paid leave for non-vacation administrative and campus operations personnel.",
  },
  {
    id: "pol-em",
    code: "EM",
    category: "Emergency / Bereavement",
    applicableTo: "Staff & Students",
    scope: "All",
    annualQuota: "7 Days",
    days: 7,
    noticePeriod: "Immediate via Call / WhatsApp",
    carryForward: "Case-by-case evaluation",
    approvalAuthority: "Campus Principal",
    description: "Compassionate leave for family bereavement or severe household emergencies.",
  },
];

const CORE_RULES = [
  {
    id: "r1",
    title: "Advance Notice Requirement",
    summary: "24-hour advance intimation required for casual leaves; emergency absences notified by 09:00 AM on Day 1.",
  },
  {
    id: "r2",
    title: "Consecutive Absence Limit",
    summary: "Leaves cannot exceed 3 consecutive working days without prior written endorsement from the Campus Principal.",
  },
  {
    id: "r3",
    title: "Medical Documentation",
    summary: "A medical certificate from an authorized physician is mandatory for any sickness absence exceeding 2 consecutive days.",
  },
  {
    id: "r4",
    title: "Student 75% Attendance Rule",
    summary: "Students must maintain at least 75% net physical classroom attendance to qualify for terminal examination registration.",
  },
];

export function LeavePolicyClient() {
  const [policies, setPolicies] = React.useState<PolicyQuotaItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("edusphere:leave-policies");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_POLICIES;
  });

  // Edit Quotas Dialog state
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [draftPolicies, setDraftPolicies] = React.useState<PolicyQuotaItem[]>(INITIAL_POLICIES);
  const [activeEditingId, setActiveEditingId] = React.useState<string | null>(null);

  const handleOpenEditDialog = (specificId?: string) => {
    setDraftPolicies(policies.map((p) => ({ ...p })));
    setActiveEditingId(specificId || null);
    setEditDialogOpen(true);
  };

  const handleSaveQuotas = (e: React.FormEvent) => {
    e.preventDefault();
    setPolicies(draftPolicies);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("edusphere:leave-policies", JSON.stringify(draftPolicies));
      } catch {}
    }
    setEditDialogOpen(false);
    toast.success("Institutional leave quotas updated successfully.");
  };

  const handleResetDefaults = () => {
    setDraftPolicies(INITIAL_POLICIES.map((p) => ({ ...p })));
    toast.info("Reset draft leave quotas to standard institutional defaults.");
  };

  const handlePrintPolicy = () => {
    const generatedDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const rowsHtml = policies
      .map(
        (p) => `
        <tr>
          <td style="font-family:monospace;font-weight:700;text-align:center;">${p.code}</td>
          <td><strong>${p.category}</strong><br><span style="font-size:9px;color:#64748b;">${p.description}</span></td>
          <td>${p.applicableTo}</td>
          <td style="font-weight:bold;text-align:center;">${p.annualQuota}</td>
          <td>${p.noticePeriod}</td>
          <td>${p.carryForward}</td>
          <td><strong>${p.approvalAuthority}</strong></td>
        </tr>`
      )
      .join("");

    const rulesHtml = CORE_RULES.map(
      (r, i) => `
        <li style="margin-bottom:6px;">
          <strong>${r.title}:</strong> ${r.summary}
        </li>`
    ).join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Institutional Leave Policy (2026–27) - EduSphere</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; font-size: 10px; line-height: 1.4; }
    .header { text-align: center; border-bottom: 1.5px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; }
    .header h1 { font-size: 14px; text-transform: uppercase; margin: 0 0 2px; color: #0f172a; letter-spacing: 0.05em; font-weight: 800; }
    .header p { margin: 0; font-size: 9px; color: #64748b; }
    h2 { font-size: 11px; font-weight: 700; text-transform: uppercase; margin: 12px 0 6px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 9.5px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #f8fafc; font-weight: 700; font-size: 9px; text-transform: uppercase; color: #334155; }
    ol { padding-left: 18px; margin: 6px 0; }
    .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 35px; text-align: center; }
    .sign-line { border-top: 1px solid #64748b; padding-top: 4px; font-size: 8.5px; text-transform: uppercase; color: #475569; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <h1>EduSphere International System</h1>
    <p>Official Institutional Leave Policy & Quota Entitlements · Academic Session 2026–27</p>
    <p style="margin-top:2px;">Published on: ${generatedDate}</p>
  </div>

  <h2>1. Approved Leave Categories & Annual Quotas</h2>
  <table>
    <thead>
      <tr>
        <th style="width:7%;text-align:center;">Code</th>
        <th style="width:23%;">Category & Scope</th>
        <th style="width:16%;">Applicable To</th>
        <th style="width:12%;text-align:center;">Annual Quota</th>
        <th style="width:16%;">Notice Period</th>
        <th style="width:14%;">Carry-Forward</th>
        <th style="width:12%;">Approval Authority</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <h2>2. Statutory Governance & Administrative Guidelines</h2>
  <ol>
    ${rulesHtml}
  </ol>

  <div class="signatures">
    <div class="sign-line">Campus HR Administrator</div>
    <div class="sign-line">Campus Principal</div>
    <div class="sign-line">Director Academic Affairs</div>
  </div>
</body>
</html>`;

    printHtml(html);
  };

  return (
    <>
      {/* ───────────────────────── Page Header ───────────────────────── */}
      <PageHeader
        title="Leave Policy & Quotas"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintPolicy}
              className="gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <Printer className="size-3.5" />
              <span>Print Policy</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleOpenEditDialog()}
              className="gap-1.5 text-xs font-semibold bg-brand hover:bg-brand-dark text-white cursor-pointer"
            >
              <SlidersHorizontal className="size-3.5" />
              <span>Update Quotas</span>
            </Button>
          </div>
        }
      />

      {/* ───────────────────────── The 4 Institutional Leave Quota Cards ───────────────────────── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {policies.map((p) => (
          <div
            key={p.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-brand/12 bg-white p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_3px_rgb(9_29_62/0.05),0_10px_24px_-16px_rgb(9_29_62/0.14)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-md"
          >
            <div>
              {/* Header: Code Pill + Scope Badge */}
              <div className="flex items-center justify-between gap-2 mb-3.5">
                <span className="inline-flex size-9 items-center justify-center rounded-xl border border-brand/15 bg-brand-50/70 font-mono text-xs font-bold text-[#091d3e] shadow-2xs">
                  {p.code}
                </span>
                <span className="inline-flex items-center rounded-full border border-slate-200/90 bg-slate-50/80 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                  {p.applicableTo}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="font-heading text-sm font-bold text-foreground group-hover:text-brand transition-colors">
                  {p.category}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {p.description}
                </p>
              </div>

              {/* Annual Quota Metric Center Box */}
              <div className="my-4 rounded-xl border border-brand/10 bg-gradient-to-br from-brand-50/45 via-white to-brand-50/15 p-3.5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Annual Quota
                </span>
                <div className="mt-1 flex items-baseline justify-center gap-1.5">
                  <span className="font-mono text-3xl font-extrabold tracking-tight text-[#091d3e]">
                    {p.days}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Days / Year
                  </span>
                </div>
              </div>

              {/* Quota Rules & Specifications */}
              <div className="space-y-2 border-t border-border/60 pt-3.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="size-3 text-muted-foreground/80 shrink-0" />
                    Notice Period
                  </span>
                  <span className="font-semibold text-foreground text-right">{p.noticePeriod}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <RotateCcw className="size-3 text-muted-foreground/80 shrink-0" />
                    Carry-over
                  </span>
                  <span className="font-semibold text-foreground text-right truncate max-w-[130px]" title={p.carryForward}>
                    {p.carryForward}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <UserCheck className="size-3 text-muted-foreground/80 shrink-0" />
                    Sanction Authority
                  </span>
                  <span className="font-semibold text-foreground text-right">{p.approvalAuthority}</span>
                </div>
              </div>
            </div>

            {/* Card Action Footer */}
            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">
                <CheckCircle2 className="size-3 text-emerald-600" />
                Active Quota
              </span>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleOpenEditDialog(p.id)}
                className="gap-1.5 border-amber-200 bg-amber-50/70 text-amber-700 hover:border-amber-400 hover:bg-amber-100 hover:text-amber-800 shadow-2xs font-semibold cursor-pointer"
              >
                <Pencil className="size-3 text-amber-600" />
                <span>Adjust</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ───────────────────────── Update Leave Quotas Dialog ───────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden rounded-xl border border-border shadow-2xl bg-card">
          <DialogHeader className="px-6 py-4 border-b border-border bg-muted/20">
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-brand" />
              <span>Update Institutional Leave Quotas</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Adjust annual leave day limits for Academic Session 2026–27.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveQuotas} className="p-6 space-y-4">
            <div className="space-y-3">
              {draftPolicies.map((p, idx) => {
                const isSelected = activeEditingId ? p.id === activeEditingId : false;
                return (
                  <div
                    key={p.id}
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3.5 transition-colors",
                      isSelected
                        ? "border-brand bg-brand-50/30 dark:bg-brand-950/20"
                        : "border-border/80 bg-background"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="grid size-7 place-items-center rounded-md border border-brand/20 bg-brand-50 font-mono text-xs font-bold text-brand dark:bg-brand-950 dark:text-brand-300 shrink-0">
                        {p.code}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {p.category}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {p.applicableTo}
                        </p>
                      </div>
                    </div>

                    {/* Stepper Input */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        disabled={p.days <= 0}
                        onClick={() => {
                          const next = Math.max(0, p.days - 1);
                          setDraftPolicies((prev) =>
                            prev.map((item, i) =>
                              i === idx
                                ? { ...item, days: next, annualQuota: `${next} Days` }
                                : item
                            )
                          );
                        }}
                        className="size-7"
                      >
                        <Minus className="size-3" />
                      </Button>

                      <div className="relative flex w-20 items-center">
                        <input
                          type="number"
                          min={0}
                          max={365}
                          value={p.days}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                            setDraftPolicies((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? { ...item, days: val, annualQuota: `${val} Days` }
                                  : item
                              )
                            );
                          }}
                          className="h-7 w-full rounded-md border border-input bg-background pr-6 text-center font-mono text-xs font-bold tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                        <span className="pointer-events-none absolute right-1.5 text-[10px] text-muted-foreground">
                          d
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        disabled={p.days >= 365}
                        onClick={() => {
                          const next = p.days + 1;
                          setDraftPolicies((prev) =>
                            prev.map((item, i) =>
                              i === idx
                                ? { ...item, days: next, annualQuota: `${next} Days` }
                                : item
                            )
                          );
                        }}
                        className="size-7"
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <DialogFooter className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetDefaults}
                className="gap-1 text-xs"
              >
                <RotateCcw className="size-3" />
                <span>Reset Defaults</span>
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditDialogOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant="default"
                  className="gap-1 text-xs font-semibold bg-brand hover:bg-brand-dark text-white"
                >
                  <Check className="size-3.5" />
                  <span>Save Quotas</span>
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
