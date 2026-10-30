"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coffee,
  Download,
  FileCheck2,
  FileText,
  HeartPulse,
  Info,
  Layers,
  Minus,
  Palmtree,
  Plus,
  Printer,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tag,
  UserCheck,
  Users,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AttendanceActionButton,
  fieldClass,
} from "../_components/attendance-ui";
import { LEAVE_POLICY_QUOTAS } from "@/lib/mock/attendance";
import { printHtml } from "@/lib/print-html";

interface PolicyQuotaItem {
  category: string;
  applicableTo: string;
  annualQuota: string;
  carryForward: string;
  approvalAuthority: string;
  days: string;
}

interface PolicyTheme {
  code: string;
  icon: React.ElementType;
  badgeTone: string;
  gradient: string;
  border: string;
  accent: string;
  pillBg: string;
  pillText: string;
  iconBg: string;
  iconColor: string;
  specs: {
    notice: string;
    carry: string;
    doc: string;
    consecutive: string;
  };
  workflow: string[];
}

const POLICY_GUIDELINES = [
  {
    code: "CL",
    category: "Casual Leave",
    applicableTo: "All Permanent Staff",
    noticePeriod: "24 Hours Advance Notice",
    documentation: "Self-declaration / HOD Email",
    carryForward: "Non-cumulative (Lapses Dec 31)",
    authority: "Campus Principal / HR Admin",
    scope: "Permanent Staff",
  },
  {
    code: "ML",
    category: "Medical / Sick Leave",
    applicableTo: "Staff & Enrolled Students",
    noticePeriod: "Intimation on Day 1 by 09:00 AM",
    documentation: "Medical certificate required if > 2 days",
    carryForward: "Accumulates up to 24 days (Staff)",
    authority: "Class Teacher / HR Admin",
    scope: "All Staff & Students",
  },
  {
    code: "EL",
    category: "Annual Earned Leave",
    applicableTo: "Non-Vacation / Admin Staff",
    noticePeriod: "14 Days Prior Formal Notice",
    documentation: "Departmental handover plan",
    carryForward: "Encashable up to 10 days annually",
    authority: "Super Admin / HR Director",
    scope: "Non-Vacation Staff",
  },
  {
    code: "EM",
    category: "Emergency / Bereavement",
    applicableTo: "All Staff & Students",
    noticePeriod: "Immediate via Call / WhatsApp",
    documentation: "Post-facto justification within 3 days",
    carryForward: "Case-by-case approval",
    authority: "Campus Principal",
    scope: "All Staff & Students",
  },
];

const COMPLIANCE_RULES = [
  {
    id: "cap",
    title: "Consecutive Absence Ceiling",
    icon: CalendarCheck,
    tag: "Duration Rule",
    tagTone: "bg-blue-50 text-blue-700 border-blue-200/80",
    description:
      "Casual leave cannot be combined with annual vacation or extended beyond 3 consecutive working days without prior written endorsement from the Campus Principal.",
  },
  {
    id: "sandwich",
    title: "Sandwich Rule & Gazetted Exemption",
    icon: Clock,
    tag: "Exemption Clause",
    tagTone: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    description:
      "Sundays and gazetted institutional holidays falling within an authorized leave duration are exempted from balance deductions unless continuous absence exceeds 5 working days.",
  },
  {
    id: "encash",
    title: "Earned Leave Encashment Standard",
    icon: Award,
    tag: "Payroll Settlement",
    tagTone: "bg-purple-50 text-purple-700 border-purple-200/80",
    description:
      "Non-vacation permanent staff with more than 15 unutilized earned leave days at fiscal close can apply for encashment of up to 10 days calculated at 100% of Basic Monthly Pay.",
  },
  {
    id: "attendance",
    title: "Student 75% Regulatory Threshold",
    icon: ShieldAlert,
    tag: "Academic Compliance",
    tagTone: "bg-rose-50 text-rose-700 border-rose-200/80",
    description:
      "Enrolled students must maintain a minimum of 75% net physical classroom attendance post-leave deductions to qualify for midterm and terminal examination registration.",
  },
];

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Digital Requisition",
    role: "Staff / Student Portal",
    description:
      "Submit digital leave request with supporting documents, dates, and work handover coverage.",
    icon: FileText,
    badge: "Origin",
  },
  {
    step: "02",
    title: "Department Endorsement",
    role: "HOD / Class Teacher",
    description:
      "Review curriculum impact, verify syllabus coverage, and endorse substitute teacher allocation.",
    icon: UserCheck,
    badge: "Tier 1",
  },
  {
    step: "03",
    title: "Executive Sanction",
    role: "Campus Principal / HR",
    description:
      "Statutory verification against institutional quotas, carry-forward balance, and sanction granting.",
    icon: ShieldCheck,
    badge: "Tier 2 / 3",
  },
  {
    step: "04",
    title: "Automated System Sync",
    role: "Attendance & Payroll ERP",
    description:
      "Real-time quota balance debit, biometric device log sync, and automated notification to applicant.",
    icon: Workflow,
    badge: "Settled",
  },
];

function getCategoryTheme(categoryName: string): PolicyTheme {
  const lower = categoryName.toLowerCase();
  if (lower.includes("casual")) {
    return {
      code: "CL-101",
      icon: Coffee,
      badgeTone: "border-sky-200/90 bg-sky-50/90 text-sky-800",
      gradient: "from-sky-500/10 via-sky-500/5 to-transparent",
      border: "border-sky-200/80 hover:border-sky-400/80",
      accent: "text-sky-700",
      pillBg: "bg-sky-50 border-sky-200/90",
      pillText: "text-sky-800",
      iconBg: "bg-gradient-to-br from-sky-500 to-blue-600 shadow-sky-500/20",
      iconColor: "text-white",
      specs: {
        notice: "24 Hours Advance Notice",
        carry: "Non-cumulative (Lapses Dec 31)",
        doc: "Self-Declaration / HOD Email",
        consecutive: "Max 3 Consecutive Days",
      },
      workflow: ["Applicant", "Department HOD", "Campus Principal"],
    };
  }
  if (lower.includes("medical") || lower.includes("sick")) {
    return {
      code: "ML-102",
      icon: HeartPulse,
      badgeTone: "border-emerald-200/90 bg-emerald-50/90 text-emerald-800",
      gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
      border: "border-emerald-200/80 hover:border-emerald-400/80",
      accent: "text-emerald-700",
      pillBg: "bg-emerald-50 border-emerald-200/90",
      pillText: "text-emerald-800",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20",
      iconColor: "text-white",
      specs: {
        notice: "Day 1 Intimation by 09:00 AM",
        carry: "Accumulates up to 24 Days (Staff)",
        doc: "Medical Certificate if > 2 Days",
        consecutive: "Max 15 Consecutive Days",
      },
      workflow: ["Medical Notice", "Class Teacher / HOD", "HR Admin Desk"],
    };
  }
  if (lower.includes("earned") || lower.includes("annual")) {
    return {
      code: "EL-103",
      icon: Award,
      badgeTone: "border-indigo-200/90 bg-indigo-50/90 text-indigo-800",
      gradient: "from-indigo-500/10 via-violet-500/5 to-transparent",
      border: "border-indigo-200/80 hover:border-indigo-400/80",
      accent: "text-indigo-700",
      pillBg: "bg-indigo-50 border-indigo-200/90",
      pillText: "text-indigo-800",
      iconBg: "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/20",
      iconColor: "text-white",
      specs: {
        notice: "14 Days Prior Formal Notice",
        carry: "Encashable up to 10 Days Annually",
        doc: "Departmental Handover Plan",
        consecutive: "Max 10 Working Days",
      },
      workflow: ["Formal Plan", "Faculty Director", "Super Admin / HR"],
    };
  }
  return {
    code: "EM-104",
    icon: AlertCircle,
    badgeTone: "border-rose-200/90 bg-rose-50/90 text-rose-800",
    gradient: "from-rose-500/10 via-amber-500/5 to-transparent",
    border: "border-rose-200/80 hover:border-rose-400/80",
    accent: "text-rose-700",
    pillBg: "bg-rose-50 border-rose-200/90",
    pillText: "text-rose-800",
    iconBg: "bg-gradient-to-br from-rose-500 to-amber-600 shadow-rose-500/20",
    iconColor: "text-white",
    specs: {
      notice: "Immediate (Call / WhatsApp)",
      carry: "Case-by-case approval",
      doc: "Post-facto justification within 3 Days",
      consecutive: "Max 7 Days per Incident",
    },
    workflow: ["Emergency Call", "Direct Review", "Campus Principal"],
  };
}

function printLeavePolicyDocument(quotas: PolicyQuotaItem[]): boolean {
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const rowsHtml = quotas
    .map(
      (q, idx) => `
      <tr>
        <td style="font-weight:700; color:#091d3e;">${idx + 1}. ${q.category}</td>
        <td>${q.applicableTo}</td>
        <td style="font-family:monospace; font-weight:700; color:#047857; text-align:center;">${q.annualQuota}</td>
        <td>${q.carryForward}</td>
        <td style="font-weight:600; color:#1e3a8a;">${q.approvalAuthority}</td>
      </tr>`
    )
    .join("");

  const guidelinesHtml = POLICY_GUIDELINES.map(
    (g) => `
    <tr>
      <td style="font-weight:700; color:#091d3e;"><span style="display:inline-block; padding:2px 6px; background:#e0e7ff; color:#1e3a8a; border-radius:4px; font-size:10px; margin-right:6px;">${g.code}</span>${g.category}</td>
      <td>${g.applicableTo}</td>
      <td>${g.noticePeriod}</td>
      <td>${g.documentation}</td>
      <td>${g.carryForward}</td>
      <td style="font-weight:600;">${g.authority}</td>
    </tr>`
  ).join("");

  const html = `<!DOCTYPE html>
  <html>
    <head>
      <title>Institutional Leave Policy &amp; Quotas (2026–27) - EduSphere</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 28px; color: #0f172a; line-height: 1.45; font-size: 11.5px; }
        .banner { background: #091d3e; color: #fff; padding: 18px 22px; border-radius: 8px; margin-bottom: 20px; }
        .banner h1 { font-size: 18px; margin: 0 0 4px; color: #fff; letter-spacing: 0.02em; font-weight: 800; }
        .banner .subhead { font-size: 12px; font-weight: 600; color: #93c5fd; margin-bottom: 6px; }
        .banner .meta { font-size: 11px; color: #cbd5e1; margin: 0; }
        h2 { font-size: 13.5px; font-weight: 700; color: #091d3e; margin: 20px 0 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px; }
        th, td { border: 1px solid #cbd5e1; padding: 7px 9px; text-align: left; vertical-align: middle; }
        th { background: #f1f5f9; font-weight: 700; color: #091d3e; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.03em; }
        .rule-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; }
        .rule-card strong { color: #091d3e; }
        .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #cbd5e1; font-size: 10px; color: #64748b; display: flex; justify-content: space-between; }
      </style>
    </head>
    <body>
      <div class="banner">
        <h1>EDUSPHERE MULTI-CAMPUS SYSTEM</h1>
        <div class="subhead">Institutional Leave Policy &amp; Statutory Quota Directive (Academic Session 2026–27)</div>
        <p class="meta">Governance &amp; HR Secretariat · Policy Ref: HR-POL-2026-LV · Date: ${dateStr} · Version: 4.2 Approved</p>
      </div>

      <h2>1. Leave Quota Allocations &amp; Entitlements</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 26%;">Leave Category</th>
            <th style="width: 24%;">Eligible Beneficiaries</th>
            <th style="width: 14%; text-align: center;">Annual Quota</th>
            <th style="width: 20%;">Carry-Forward &amp; Lapses</th>
            <th style="width: 16%;">Approval Authority</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>

      <h2>2. Institutional Governance &amp; Approval Matrix</h2>
      <table>
        <thead>
          <tr>
            <th>Category &amp; Code</th>
            <th>Target Group</th>
            <th>Notice Period</th>
            <th>Documentation Rule</th>
            <th>Lapse / Carry-Forward</th>
            <th>Approval Authority</th>
          </tr>
        </thead>
        <tbody>${guidelinesHtml}</tbody>
      </table>

      <h2>3. Statutory Clauses &amp; Regulatory Guidelines</h2>
      <div class="rule-card">
        <strong>1. Consecutive Leave Cap:</strong> Casual leave cannot exceed three (3) consecutive working days without prior written endorsement from the Campus Principal.
      </div>
      <div class="rule-card">
        <strong>2. Weekend &amp; Gazetted Holiday Exemption (Sandwich Rule):</strong> Sundays and statutory gazetted holidays within approved leave periods are exempted from balance deductions unless total absence exceeds 5 consecutive working days.
      </div>
      <div class="rule-card">
        <strong>3. Medical Fitness Certification:</strong> Sick leave exceeding two (2) days requires verified medical documentation upon return to duty.
      </div>
      <div class="rule-card">
        <strong>4. Student Minimum Attendance Threshold:</strong> Students must maintain a net 75% classroom attendance post-leave to qualify for terminal examinations.
      </div>

      <div class="footer">
        <span>EduSphere Multi-Campus Human Resources &amp; Academic Syndicate Directive</span>
        <span>Confidential &amp; Proprietary Institutional Policy · Printed ${dateStr}</span>
      </div>
    </body>
  </html>`;

  return printHtml(html);
}

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
  const [filterScope, setFilterScope] = React.useState<string>("All");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

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

  const handlePrint = () => {
    const ok = printLeavePolicyDocument(policyQuotas);
    if (ok) {
      toast.success("Institutional leave policy document sent to print / PDF export.");
    } else {
      toast.error("Failed to initialize print dialog.");
    }
  };

  const filteredGuidelines = React.useMemo(() => {
    return POLICY_GUIDELINES.filter((item) => {
      const matchScope =
        filterScope === "All" ||
        (filterScope === "Staff" && item.scope.toLowerCase().includes("staff")) ||
        (filterScope === "Students" &&
          (item.scope.toLowerCase().includes("students") ||
            item.applicableTo.toLowerCase().includes("student")));

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.category.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.authority.toLowerCase().includes(q) ||
        item.applicableTo.toLowerCase().includes(q);

      return matchScope && matchSearch;
    });
  }, [filterScope, searchQuery]);

  return (
    <>
      <PageHeader
        title="Leave Policy & Quotas"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AttendanceActionButton
              tone="outline"
              onClick={handlePrint}
              title="Print official institutional leave policy directive"
            >
              <Printer className="size-3.5" />
              <span>Print Policy</span>
            </AttendanceActionButton>
            <AttendanceActionButton
              tone="outline"
              onClick={handlePrint}
              title="Export official leave policy as formatted PDF"
            >
              <Download className="size-3.5" />
              <span>Export Policy PDF</span>
            </AttendanceActionButton>
            <AttendanceActionButton
              tone="primary"
              onClick={openPolicyEditor}
              title="Update institutional annual quotas and carry-forward allocations"
            >
              <SlidersHorizontal className="size-3.5" />
              <span>Update Leave Quotas</span>
            </AttendanceActionButton>
          </div>
        }
      />

      {/* ───────────────────────── Executive KPI Cards ───────────────────────── */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_1px_2px_rgb(9_29_62/0.05),0_12px_28px_-16px_rgb(9_29_62/0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-12px_rgb(9_29_62/0.2)]">
          <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-blue-500/5 blur-xl transition-all group-hover:scale-125" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Leave Categories
            </span>
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xs">
              <Layers className="size-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
                {policyQuotas.length} Categories
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
              Active across 5 Campuses
            </p>
          </div>
          <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px]">
            <span className="font-semibold text-slate-700">Directive Ref:</span>
            <span className="font-mono font-bold text-brand">AY 2026–27</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_1px_2px_rgb(9_29_62/0.05),0_12px_28px_-16px_rgb(9_29_62/0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-12px_rgb(9_29_62/0.2)]">
          <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-indigo-500/5 blur-xl transition-all group-hover:scale-125" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Max Entitlement
            </span>
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xs">
              <CalendarClock className="size-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
                20 Days / Year
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <span className="inline-block size-1.5 rounded-full bg-indigo-500" />
              Earned Leave Cap (Admin Staff)
            </p>
          </div>
          <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px]">
            <span className="font-semibold text-slate-700">Encashment Rule:</span>
            <span className="font-semibold text-emerald-700">Up to 10 Days</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_1px_2px_rgb(9_29_62/0.05),0_12px_28px_-16px_rgb(9_29_62/0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-12px_rgb(9_29_62/0.2)]">
          <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-emerald-500/5 blur-xl transition-all group-hover:scale-125" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Medical Allowance
            </span>
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xs">
              <HeartPulse className="size-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
                12–15 Days
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <span className="inline-block size-1.5 rounded-full bg-teal-500" />
              12d Staff · 15d Enrolled Students
            </p>
          </div>
          <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px]">
            <span className="font-semibold text-slate-700">Accumulation:</span>
            <span className="font-semibold text-teal-800">Max 24 Days (Staff)</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_1px_2px_rgb(9_29_62/0.05),0_12px_28px_-16px_rgb(9_29_62/0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-12px_rgb(9_29_62/0.2)]">
          <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-amber-500/5 blur-xl transition-all group-hover:scale-125" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Approval Hierarchy
            </span>
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#091d3e] to-[#1e3a66] text-white shadow-xs">
              <ShieldCheck className="size-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
                3 Tiers
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <span className="inline-block size-1.5 rounded-full bg-amber-500" />
              HOD → Principal → Super Admin
            </p>
          </div>
          <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px]">
            <span className="font-semibold text-slate-700">Audit Compliance:</span>
            <span className="font-semibold text-brand">100% Digital Log</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* ───────────────────────── Section 1: Leave Categories & Quotas ───────────────────────── */}
        <SectionCard
          title="Institutional Leave Policy & Quota Entitlements (2026–27)"
          description="Statutory leave quotas, carry-forward provisions, and governing rules approved by the Academic Syndicate."
          action={
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-brand/20 bg-brand-50/70 px-2.5 py-1 text-xs font-semibold text-brand shadow-2xs">
                <Sparkles className="size-3 text-brand" />
                <span>Directive v4.2 Active</span>
              </span>
              <AttendanceActionButton
                size="xs"
                tone="primary"
                onClick={openPolicyEditor}
              >
                <SlidersHorizontal className="size-3" />
                <span>Adjust Quotas</span>
              </AttendanceActionButton>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-4.5 md:grid-cols-2">
            {policyQuotas.map((rule) => {
              const theme = getCategoryTheme(rule.category);
              const IconComponent = theme.icon;

              return (
                <div
                  key={rule.category}
                  className={cn(
                    "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
                    theme.border
                  )}
                >
                  {/* Subtle ambient corner gradient */}
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-gradient-to-br blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-60",
                      theme.gradient
                    )}
                  />

                  <div>
                    {/* Card Header */}
                    <div className="relative flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={cn(
                            "grid size-11 shrink-0 place-items-center rounded-xl shadow-xs transition-transform duration-200 group-hover:scale-105",
                            theme.iconBg,
                            theme.iconColor
                          )}
                        >
                          <IconComponent className="size-5" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider">
                              {theme.code}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="truncate text-xs font-medium text-muted-foreground">
                              {rule.applicableTo}
                            </span>
                          </div>
                          <h3 className="mt-0.5 truncate text-[15px] font-bold text-foreground tracking-tight">
                            {rule.category}
                          </h3>
                        </div>
                      </div>

                      {/* Entitlement Quota Pill */}
                      <span
                        className={cn(
                          "shrink-0 inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-mono font-bold shadow-2xs tabular-nums",
                          theme.badgeTone
                        )}
                        title={`Annual Quota: ${rule.annualQuota}`}
                      >
                        {rule.annualQuota}
                      </span>
                    </div>

                    {/* Key Policy Specifications Strip (2x2 Grid) */}
                    <div className="relative mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg border border-slate-200/70 bg-slate-50/70 p-2.5 transition-colors hover:bg-slate-50">
                        <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                          <Clock className="size-3 text-brand shrink-0" />
                          <span>Advance Notice</span>
                        </div>
                        <p className="mt-1 font-semibold text-slate-800 line-clamp-1" title={theme.specs.notice}>
                          {theme.specs.notice}
                        </p>
                      </div>

                      <div className="rounded-lg border border-slate-200/70 bg-slate-50/70 p-2.5 transition-colors hover:bg-slate-50">
                        <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                          <RotateCcw className="size-3 text-emerald-600 shrink-0" />
                          <span>Carry-Forward</span>
                        </div>
                        <p className="mt-1 font-semibold text-slate-800 line-clamp-1" title={rule.carryForward}>
                          {rule.carryForward}
                        </p>
                      </div>

                      <div className="rounded-lg border border-slate-200/70 bg-slate-50/70 p-2.5 transition-colors hover:bg-slate-50">
                        <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                          <FileText className="size-3 text-blue-600 shrink-0" />
                          <span>Documentation</span>
                        </div>
                        <p className="mt-1 font-semibold text-slate-800 line-clamp-1" title={theme.specs.doc}>
                          {theme.specs.doc}
                        </p>
                      </div>

                      <div className="rounded-lg border border-slate-200/70 bg-slate-50/70 p-2.5 transition-colors hover:bg-slate-50">
                        <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                          <CalendarCheck className="size-3 text-indigo-600 shrink-0" />
                          <span>Consecutive Cap</span>
                        </div>
                        <p className="mt-1 font-semibold text-slate-800 line-clamp-1" title={theme.specs.consecutive}>
                          {theme.specs.consecutive}
                        </p>
                      </div>
                    </div>

                    {/* Approval Chain Stepper */}
                    <div className="relative mt-3 rounded-lg border border-dashed border-slate-200 bg-white/80 p-2 text-xs">
                      <div className="flex items-center justify-between text-[10.5px] text-muted-foreground font-semibold mb-1">
                        <span>Approval Hierarchy Chain</span>
                        <span className="font-mono text-brand font-bold">3 Tiers</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                        <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5">
                          {theme.workflow[0]}
                        </span>
                        <ChevronRight className="size-3 text-slate-400 shrink-0" />
                        <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5">
                          {theme.workflow[1]}
                        </span>
                        <ChevronRight className="size-3 text-slate-400 shrink-0" />
                        <span className="inline-flex items-center rounded bg-brand-50 px-1.5 py-0.5 text-brand font-bold">
                          {theme.workflow[2]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="relative mt-4 flex items-center justify-between border-t border-slate-200/70 pt-3 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                      <span>Authority:</span>
                      <strong className="text-foreground font-semibold">
                        {rule.approvalAuthority}
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={openPolicyEditor}
                      className="inline-flex items-center gap-1 font-semibold text-brand hover:text-brand-dark transition-colors cursor-pointer text-xs"
                    >
                      <span>Configure</span>
                      <ChevronRight className="size-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* ───────────────────────── Section 2: Institutional Governance Matrix ───────────────────────── */}
        <SectionCard
          title="Institutional Governance & Approval Matrix"
          description="Detailed operational notice periods, statutory verification standards, and sanction authorities."
          flush
          action={
            <div className="flex flex-wrap items-center gap-2">
              {/* Search input */}
              <div className="relative flex items-center w-56">
                <Search className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter matrix..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-full rounded-[4px] border border-brand/20 bg-white pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 text-muted-foreground hover:text-foreground cursor-pointer text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Scope filter pills */}
              <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
                {["All", "Staff", "Students"].map((scope) => (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => setFilterScope(scope)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
                      filterScope === scope
                        ? "bg-white text-[#091d3e] shadow-2xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {scope}
                  </button>
                ))}
              </div>
            </div>
          }
        >
          <div className="overflow-x-auto scrollbar-thin-light">
            <table className="w-full min-w-[760px] table-fixed text-sm">
              <thead>
                <tr className="border-y border-[#dbe4f0] bg-gradient-to-b from-[#f8fafd] via-[#f4f7fc] to-[#eef3fa] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.95)]">
                  <th className="py-3 pl-6 pr-3 text-left font-heading text-xs font-semibold text-foreground/80 w-[24%]">
                    Category &amp; Directive Code
                  </th>
                  <th className="py-3 px-3 text-center font-heading text-xs font-semibold text-foreground/80 w-[18%]">
                    Target Beneficiaries
                  </th>
                  <th className="py-3 px-3 text-center font-heading text-xs font-semibold text-foreground/80 w-[16%]">
                    Notice Window
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
                {filteredGuidelines.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                      No leave policy categories matched the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredGuidelines.map((item) => (
                    <tr
                      key={item.code}
                      className="transition-colors hover:bg-brand-50/30 group"
                    >
                      <td className="py-3.5 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand/10 font-mono text-xs font-bold text-brand ring-1 ring-brand/15">
                            {item.code}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground leading-snug">
                              {item.category}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                              {item.carryForward}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {item.applicableTo}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1 text-xs text-slate-800 font-medium">
                          <Clock className="size-3 text-muted-foreground" />
                          <span>{item.noticePeriod}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="text-xs text-muted-foreground font-normal">
                          {item.documentation}
                        </span>
                      </td>
                      <td className="py-3.5 pr-6 pl-3 text-center">
                        <span className="inline-flex items-center rounded-md border border-brand/20 bg-brand-50/70 px-2.5 py-1 text-xs font-bold text-brand shadow-2xs">
                          {item.authority}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* ───────────────────────── Section 3: Statutory Rules & Compliance Standards ───────────────────────── */}
        <SectionCard
          title="Institutional Leave Rules & Compliance Standards"
          description="Mandatory administrative directives governing consecutive absence, holiday sandwiching, and student thresholds."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COMPLIANCE_RULES.map((rule) => {
              const RuleIcon = rule.icon;
              return (
                <div
                  key={rule.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 shadow-2xs hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="grid size-8 place-items-center rounded-lg bg-white border border-slate-200 shadow-2xs text-[#091d3e]">
                        <RuleIcon className="size-4 text-brand" />
                      </span>
                      <span
                        className={cn(
                          "rounded-md border px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider",
                          rule.tagTone
                        )}
                      >
                        {rule.tag}
                      </span>
                    </div>

                    <h4 className="mt-3 text-xs font-bold text-foreground leading-snug">
                      {rule.title}
                    </h4>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed font-normal">
                      {rule.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                    <span>Enforcement:</span>
                    <span className="text-emerald-700 font-bold">Mandatory</span>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* ───────────────────────── Section 4: Workflow Architecture Pipeline ───────────────────────── */}
        <SectionCard
          title="Multi-Tier Leave Governance & Verification Workflow"
          description="End-to-end institutional workflow from digital requisition to biometric sync and payroll settlement."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.step}
                  className="relative flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-extrabold text-brand">
                        STEP {step.step}
                      </span>
                      <span className="rounded bg-brand-50 border border-brand/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-brand">
                        {step.badge}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-slate-100 text-[#091d3e]">
                        <StepIcon className="size-3.5 text-brand" />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">
                          {step.title}
                        </h4>
                        <p className="text-[10.5px] font-medium text-brand">
                          {step.role}
                        </p>
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-muted-foreground">
                    <span>Validation SLA</span>
                    <span className="font-semibold text-slate-700">Within 24 Hours</span>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* ───────────────────────── Update Institutional Leave Quotas Dialog ───────────────────────── */}
      <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
        <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden rounded-2xl border border-border shadow-2xl bg-white">
          <DialogHeader className="bg-gradient-to-r from-slate-50 via-white to-white px-6 py-4.5 border-b border-border/70">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#091d3e] to-[#1e3a66] text-white shadow-xs">
                <SlidersHorizontal className="size-5" />
              </span>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Update Institutional Leave Quotas
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Adjust annual day limits and entitlements for Academic Session 2026–27.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSavePolicyQuotas} className="p-6 space-y-4">
            <div className="rounded-xl border border-brand/20 bg-brand-50/40 p-3.5 text-xs text-[#091d3e]">
              <div className="flex items-center gap-2 font-bold">
                <Info className="size-4 text-brand shrink-0" />
                <span>Institutional Quota Adjustment Rules</span>
              </div>
              <p className="mt-1 text-slate-600 leading-relaxed font-normal">
                Modifications apply globally across all campuses for the current academic session. Leave balance calculations for enrolled students and active staff will synchronize upon saving.
              </p>
            </div>

            <div className="space-y-3">
              {draftQuotas.map((rule, idx) => {
                const theme = getCategoryTheme(rule.category);
                const ItemIcon = theme.icon;
                const currentVal = Number(rule.days) || 0;

                const adjustDays = (delta: number) => {
                  const nextVal = Math.max(0, Math.min(365, currentVal + delta));
                  setDraftQuotas((prev) =>
                    prev.map((item, i) =>
                      i === idx
                        ? {
                            ...item,
                            days: String(nextVal),
                            annualQuota: `${nextVal} Days`,
                          }
                        : item
                    )
                  );
                };

                return (
                  <div
                    key={rule.category}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 shadow-2xs hover:border-brand/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-lg text-white shadow-2xs",
                          theme.iconBg
                        )}
                      >
                        <ItemIcon className="size-4.5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-muted-foreground">
                            {theme.code}
                          </span>
                          <span className="text-slate-300">•</span>
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {rule.category}
                          </h4>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                          {rule.applicableTo}
                        </p>
                      </div>
                    </div>

                    {/* Stepper Controls */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => adjustDays(-1)}
                        disabled={currentVal <= 0}
                        title="Decrease quota by 1 day"
                        className="grid size-8 place-items-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-2xs hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      >
                        <Minus className="size-3.5" />
                      </button>

                      <div className="relative flex w-24 items-center">
                        <input
                          type="number"
                          min={0}
                          max={365}
                          required
                          aria-label={`${rule.category} allowed days`}
                          className={cn(
                            fieldClass,
                            "h-8 pr-10 text-center font-mono font-bold text-xs"
                          )}
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
                        <span className="pointer-events-none absolute right-2 text-[10.5px] font-semibold text-muted-foreground">
                          Days
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => adjustDays(1)}
                        disabled={currentVal >= 365}
                        title="Increase quota by 1 day"
                        className="grid size-8 place-items-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-2xs hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <DialogFooter className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-4 sm:justify-between">
              <AttendanceActionButton
                type="button"
                tone="outline"
                size="sm"
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
                <RotateCcw className="size-3.5" />
                <span>Reset Defaults</span>
              </AttendanceActionButton>
              <div className="flex items-center gap-2">
                <AttendanceActionButton
                  type="button"
                  tone="outline"
                  size="sm"
                  onClick={() => setPolicyDialogOpen(false)}
                >
                  Cancel
                </AttendanceActionButton>
                <AttendanceActionButton type="submit" tone="primary" size="sm">
                  <Check className="size-3.5" />
                  <span>Save Quotas</span>
                </AttendanceActionButton>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
