"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Clock3,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  HeartPulse,
  HelpCircle,
  Info,
  Layers,
  Minus,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
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

// ─────────────────────────────────────────────────────────────────────────────
// DATA TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface PolicyQuotaItem {
  id: string;
  code: string;
  category: string;
  applicableTo: string;
  scope: "Staff" | "Students" | "All";
  annualQuota: string;
  days: number;
  payStatus: string;
  noticePeriod: string;
  carryForward: string;
  approvalAuthority: string;
  documentation: string;
  description: string;
  colorScheme: {
    badgeBg: string;
    badgeText: string;
    ringColor: string;
    accentGlow: string;
  };
}

export interface CadreEntitlement {
  id: string;
  cadre: string;
  roleCategory: "Academic" | "Administrative" | "Support" | "Student";
  casualLeave: number;
  medicalLeave: number;
  earnedLeave: number;
  emergencyLeave: number;
  specialLeave: string;
  maxAccumulation: string;
  encashable: boolean;
  approvalAuthority: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT INSTITUTIONAL DATA
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_POLICIES: PolicyQuotaItem[] = [
  {
    id: "pol-cl",
    code: "CL",
    category: "Casual Leave",
    applicableTo: "Permanent Staff",
    scope: "Staff",
    annualQuota: "10 Days",
    days: 10,
    payStatus: "100% Fully Paid",
    noticePeriod: "24 Hours Advance",
    carryForward: "Non-cumulative",
    approvalAuthority: "Campus Principal",
    documentation: "Standard Leave Slip",
    description: "Short-term personal affairs, urgent domestic matters, and unforeseen errands.",
    colorScheme: {
      badgeBg: "from-[#1e4275] to-[#091d3e]",
      badgeText: "text-white",
      ringColor: "ring-brand/20",
      accentGlow: "bg-brand/10",
    },
  },
  {
    id: "pol-ml",
    code: "ML",
    category: "Medical / Sick Leave",
    applicableTo: "Staff & Students",
    scope: "All",
    annualQuota: "12 Days",
    days: 12,
    payStatus: "100% Fully Paid",
    noticePeriod: "Day 1 by 09:00 AM",
    carryForward: "Accumulates up to 24d",
    approvalAuthority: "HR / Class Teacher",
    documentation: "Medical Certificate if >2 days",
    description: "Temporary physical incapacity due to illness, injury, or clinical isolation.",
    colorScheme: {
      badgeBg: "from-rose-600 to-rose-900",
      badgeText: "text-white",
      ringColor: "ring-rose-500/20",
      accentGlow: "bg-rose-500/10",
    },
  },
  {
    id: "pol-el",
    code: "EL",
    category: "Annual Earned Leave",
    applicableTo: "Non-Vacation Staff",
    scope: "Staff",
    annualQuota: "20 Days",
    days: 20,
    payStatus: "100% Statutory Paid",
    noticePeriod: "14 Days Prior",
    carryForward: "Encashable up to 10d",
    approvalAuthority: "HR Director / Super Admin",
    documentation: "Handover Protocol & Reliever Form",
    description: "Statutory annual rest entitlement for administrative, accounts, campus IT, and operations personnel.",
    colorScheme: {
      badgeBg: "from-emerald-700 to-teal-900",
      badgeText: "text-white",
      ringColor: "ring-emerald-500/20",
      accentGlow: "bg-emerald-500/10",
    },
  },
  {
    id: "pol-em",
    code: "EM",
    category: "Emergency & Bereavement",
    applicableTo: "Staff & Students",
    scope: "All",
    annualQuota: "7 Days",
    days: 7,
    payStatus: "100% Fully Paid",
    noticePeriod: "Immediate",
    carryForward: "Non-cumulative",
    approvalAuthority: "Campus Principal",
    documentation: "Bereavement Verification",
    description: "Compassionate relief for immediate family bereavement or critical household emergencies.",
    colorScheme: {
      badgeBg: "from-amber-600 to-amber-900",
      badgeText: "text-white",
      ringColor: "ring-amber-500/20",
      accentGlow: "bg-amber-500/10",
    },
  },
  {
    id: "pol-mpl",
    code: "MPL",
    category: "Maternity & Paternity Leave",
    applicableTo: "Permanent Staff",
    scope: "Staff",
    annualQuota: "90d / 10d",
    days: 90,
    payStatus: "100% Statutory Full Pay",
    noticePeriod: "30 Days Prior",
    carryForward: "Statutory Entitlement",
    approvalAuthority: "Director HR",
    documentation: "Medical / Birth Certificate",
    description: "Comprehensive statutory parental leave providing 90 calendar days for female personnel and 10 days for male personnel.",
    colorScheme: {
      badgeBg: "from-purple-700 to-indigo-950",
      badgeText: "text-white",
      ringColor: "ring-purple-500/20",
      accentGlow: "bg-purple-500/10",
    },
  },
  {
    id: "pol-hl",
    code: "HL",
    category: "Hajj & Pilgrimage Leave",
    applicableTo: "Staff (3+ Yrs)",
    scope: "Staff",
    annualQuota: "30 Days",
    days: 30,
    payStatus: "100% Fully Paid",
    noticePeriod: "45 Days Prior",
    carryForward: "Once in Service",
    approvalAuthority: "Board / Super Admin",
    documentation: "Hajj / Umrah E-Visa & Reliever Form",
    description: "Dedicated sacred pilgrimage leave granted once during employment tenure.",
    colorScheme: {
      badgeBg: "from-teal-700 to-cyan-950",
      badgeText: "text-white",
      ringColor: "ring-teal-500/20",
      accentGlow: "bg-teal-500/10",
    },
  },
  {
    id: "pol-sl",
    code: "SL",
    category: "Academic & Study Leave",
    applicableTo: "Teaching Faculty",
    scope: "Staff",
    annualQuota: "14 Days",
    days: 14,
    payStatus: "100% Fully Paid",
    noticePeriod: "21 Days Prior",
    carryForward: "Non-cumulative",
    approvalAuthority: "Director Academics",
    documentation: "Enrollment & Exam Schedule",
    description: "Authorized leave for higher study, research defense, and CAIE training.",
    colorScheme: {
      badgeBg: "from-blue-700 to-indigo-900",
      badgeText: "text-white",
      ringColor: "ring-blue-500/20",
      accentGlow: "bg-blue-500/10",
    },
  },
  {
    id: "pol-od",
    code: "OD",
    category: "Duty & Deputation",
    applicableTo: "Designated Staff",
    scope: "Staff",
    annualQuota: "As Sanctioned",
    days: 0,
    payStatus: "Fully Paid + Daily Allowance",
    noticePeriod: "Deputation Order",
    carryForward: "Event-based",
    approvalAuthority: "Campus Principal",
    documentation: "Official Order",
    description: "Official institutional assignments and board examination duties.",
    colorScheme: {
      badgeBg: "from-slate-700 to-slate-900",
      badgeText: "text-white",
      ringColor: "ring-slate-500/20",
      accentGlow: "bg-slate-500/10",
    },
  },
];

const CADRE_ENTITLEMENTS: CadreEntitlement[] = [
  {
    id: "c-1",
    cadre: "Senior Faculty & Heads of Department",
    roleCategory: "Academic",
    casualLeave: 10,
    medicalLeave: 12,
    earnedLeave: 0,
    emergencyLeave: 7,
    specialLeave: "Maternity (90d) / Study (14d)",
    maxAccumulation: "24 Days (ML Only)",
    encashable: false,
    approvalAuthority: "Campus Principal",
  },
  {
    id: "c-2",
    cadre: "Teaching Faculty (O/A Level & Matric/FSc)",
    roleCategory: "Academic",
    casualLeave: 10,
    medicalLeave: 12,
    earnedLeave: 0,
    emergencyLeave: 7,
    specialLeave: "Maternity (90d) / Study (10d)",
    maxAccumulation: "24 Days (ML Only)",
    encashable: false,
    approvalAuthority: "Vice Principal & HOD",
  },
  {
    id: "c-3",
    cadre: "Primary & Middle School Teachers",
    roleCategory: "Academic",
    casualLeave: 10,
    medicalLeave: 12,
    earnedLeave: 0,
    emergencyLeave: 7,
    specialLeave: "Maternity (90d) / Paternity (10d)",
    maxAccumulation: "20 Days (ML Only)",
    encashable: false,
    approvalAuthority: "Section Head / Principal",
  },
  {
    id: "c-4",
    cadre: "Administrative, Accounts & HR Officers",
    roleCategory: "Administrative",
    casualLeave: 10,
    medicalLeave: 12,
    earnedLeave: 20,
    emergencyLeave: 7,
    specialLeave: "Maternity (90d) / Hajj (30d)",
    maxAccumulation: "30 Days (EL + ML)",
    encashable: true,
    approvalAuthority: "HR Director / Super Admin",
  },
  {
    id: "c-5",
    cadre: "Campus IT & Lab Technicians",
    roleCategory: "Administrative",
    casualLeave: 10,
    medicalLeave: 12,
    earnedLeave: 15,
    emergencyLeave: 7,
    specialLeave: "Maternity (90d) / Paternity (10d)",
    maxAccumulation: "20 Days (EL + ML)",
    encashable: true,
    approvalAuthority: "Campus Administrator",
  },
  {
    id: "c-6",
    cadre: "Security, Ancillary & Transport Staff",
    roleCategory: "Support",
    casualLeave: 10,
    medicalLeave: 10,
    earnedLeave: 15,
    emergencyLeave: 7,
    specialLeave: "Emergency Relief (7d)",
    maxAccumulation: "15 Days Max",
    encashable: true,
    approvalAuthority: "Transport & Estate Manager",
  },
  {
    id: "c-7",
    cadre: "Enrolled Senior Students (Grades 9–12)",
    roleCategory: "Student",
    casualLeave: 0,
    medicalLeave: 10,
    earnedLeave: 0,
    emergencyLeave: 5,
    specialLeave: "Academic Competition (OD)",
    maxAccumulation: "Non-cumulative",
    encashable: false,
    approvalAuthority: "Class Teacher & Section Head",
  },
  {
    id: "c-8",
    cadre: "Enrolled Junior Students (Grades 1–8)",
    roleCategory: "Student",
    casualLeave: 0,
    medicalLeave: 10,
    earnedLeave: 0,
    emergencyLeave: 5,
    specialLeave: "Authorized Medical Rest",
    maxAccumulation: "Non-cumulative",
    encashable: false,
    approvalAuthority: "Class Teacher",
  },
];

const STATUTORY_RULES = [
  {
    id: "rule-1",
    title: "Advance Notice & Intimation Timelines",
    badge: "Operational Mandate",
    icon: Clock3,
    summary:
      "All planned absences require 24-hour advance submission via the ERP portal. Emergency absences must be formally communicated to the Class Teacher or Campus HR by 09:00 AM on Day 1.",
    points: [
      "Casual leave requested after 09:00 AM on the day of absence is marked as unexcused unless approved by the Principal.",
      "Annual Earned Leave requires minimum 14 calendar days prior notice with designated work reliever sign-off.",
      "Emergency absence must be accompanied by digital intimation through SMS, WhatsApp, or ERP portal.",
    ],
  },
  {
    id: "rule-2",
    title: "Consecutive Absence Limit & Sandwich Suffix/Prefix",
    badge: "Leave Clustering Policy",
    icon: CalendarCheck,
    summary:
      "Leaves cannot exceed 3 consecutive working days without prior written endorsement from the Campus Principal. Weekend and gazetted holiday sandwiching rules apply to prevent uncoordinated absenteeism.",
    points: [
      "Absences spanning Friday and Monday are subject to Principal review for academic continuity.",
      "Leaves preceding or succeeding gazetted holidays require special endorsement to prevent disruption.",
      "Unsanctioned absence beyond 3 consecutive days triggers automated SMS notice to guardians / HR review.",
    ],
  },
  {
    id: "rule-3",
    title: "Mandatory Medical Verification & Quarantine",
    badge: "Health & Safety",
    icon: HeartPulse,
    summary:
      "Any sickness absence exceeding 2 consecutive working days mandates a fitness and discharge certificate issued by a registered medical practitioner (PMC / PMDC licensed) before campus re-entry.",
    points: [
      "Contagious viral conditions (Chickenpox, Conjunctivitis, Dengue, Influenza) require mandatory isolation clearance.",
      "Students returning from medical absence must present medical fitness slip to the Campus Health Clinic.",
      "Staff cumulative sick leave beyond 14 days requires review by the Institutional Medical Board.",
    ],
  },
  {
    id: "rule-4",
    title: "Mandatory 75% Classroom Attendance Rule",
    badge: "Academic Eligibility",
    icon: GraduationCap,
    summary:
      "Under Federal Board of Intermediate and Secondary Education (FBISE) and Cambridge CAIE statutory regulations, every enrolled student must maintain at least 75% net physical classroom attendance.",
    points: [
      "Students falling below 75% attendance are barred from sitting in Mid-Term and Final Terminal Examinations.",
      "Medical leaves supported by verified hospitalization records may be granted an exceptional waiver up to 10% by the Academic Council.",
      "Parents receive automated weekly threshold warning notifications when attendance dips below 80%.",
    ],
  },
  {
    id: "rule-5",
    title: "Class Cover & Lesson Reliever Allocation",
    badge: "Faculty Governance",
    icon: BookOpen,
    summary:
      "To prevent academic disruption, every instructional faculty member must coordinate and submit a completed Lesson Handover & Relief Teacher schedule prior to departing on planned leave.",
    points: [
      "Subject Teachers must upload lesson plans, worksheets, and syllabus pacing notes for the relief teacher.",
      "Department Heads ensure zero vacant instructional periods across all secondary and higher secondary sections.",
      "Relief teaching hours are logged into the Faculty Merit Registry for supplementary appraisal credit.",
    ],
  },
  {
    id: "rule-6",
    title: "Leave Without Pay (LWP) & Encashment Protocols",
    badge: "Financial Regulation",
    icon: ShieldAlert,
    summary:
      "Absences exceeding approved quota allotments or taken without formal sanction are classified as Leave Without Pay (LWP) and deducted pro-rata from the monthly payroll cycle.",
    points: [
      "Non-vacation permanent staff are permitted to encash up to 10 days of unutilized Earned Leave at basic salary in June.",
      "Casual leaves expire on December 31 each calendar year and carry no monetary encashment value.",
      "Unauthorized absence exceeding 10 working days without notice initiates formal disciplinary proceedings under Institutional Service Rules.",
    ],
  },
];

const APPROVAL_WORKFLOW_TIERS = [
  {
    tier: "Tier 1",
    level: "First Level Clearance",
    authority: "Class Teacher / Immediate Supervisor",
    scope: "1-Day Absence (Emergency or Sickness)",
    sla: "Turnaround within 6 hours",
    description:
      "Receives morning intimation, verifies student/staff registry, logs substitute teacher requirement, and marks preliminary status in ERP.",
  },
  {
    tier: "Tier 2",
    level: "Sectional Review",
    authority: "Section Head / Vice Principal",
    scope: "2 to 3 Days Casual or Medical Leave",
    sla: "Turnaround within 12 hours",
    description:
      "Audits relief teaching assignments, verifies medical documentation if applicable, and approves or recommends for Principal sanction.",
  },
  {
    tier: "Tier 3",
    level: "Institutional Executive Sanction",
    authority: "Campus Principal",
    scope: "4 to 7 Days Absence, Bereavement, Academic Leave",
    sla: "Turnaround within 24 hours",
    description:
      "Final sanctioning authority for extended student medical leaves, faculty study leaves, and exceptional emergency dispensations.",
  },
  {
    tier: "Tier 4",
    level: "Board & Super Admin Ratification",
    authority: "Director HR & Super Administrator",
    scope: ">7 Days Absence, Earned Leave Encashment, Maternity, Hajj, LWP",
    sla: "Turnaround within 48 hours",
    description:
      "Formal corporate ratification for statutory paid maternity/hajj entitlements, payroll deductions, and long-term sabbatical arrangements.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────

export function LeavePolicyClient() {
  // State for Policies
  const [policies, setPolicies] = React.useState<PolicyQuotaItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("edusphere:leave-policies-v3");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_POLICIES;
  });

  // State for Cadres
  const [cadres, setCadres] = React.useState<CadreEntitlement[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("edusphere:leave-cadres");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return CADRE_ENTITLEMENTS;
  });

  // View Navigation
  const [activeTab, setActiveTab] = React.useState<
    "policies" | "cadres" | "rules" | "workflow"
  >("policies");

  // Filters & Search for Tab 1
  const [policyScopeFilter, setPolicyScopeFilter] = React.useState<
    "All" | "Staff" | "Students"
  >("All");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filtered Policies
  const filteredPolicies = React.useMemo(() => {
    return policies.filter((p) => {
      const matchesScope =
        policyScopeFilter === "All" ||
        (policyScopeFilter === "Staff" && (p.scope === "Staff" || p.scope === "All")) ||
        (policyScopeFilter === "Students" && (p.scope === "Students" || p.scope === "All"));

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.category.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.applicableTo.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.approvalAuthority.toLowerCase().includes(q);

      return matchesScope && matchesSearch;
    });
  }, [policies, policyScopeFilter, searchQuery]);

  // Batch Edit Dialog state
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [draftPolicies, setDraftPolicies] = React.useState<PolicyQuotaItem[]>(INITIAL_POLICIES);
  const [activeEditingId, setActiveEditingId] = React.useState<string | null>(null);

  // Single Policy Modal State
  const [singlePolicyModalOpen, setSinglePolicyModalOpen] = React.useState(false);
  const [editingSinglePolicy, setEditingSinglePolicy] = React.useState<PolicyQuotaItem | null>(null);

  // Handlers for Batch Edit
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
        localStorage.setItem("edusphere:leave-policies-v3", JSON.stringify(draftPolicies));
      } catch {}
    }
    setEditDialogOpen(false);
    toast.success("Institutional leave quotas successfully synchronized.");
  };

  const handleResetDefaults = () => {
    setDraftPolicies(INITIAL_POLICIES.map((p) => ({ ...p })));
    toast.info("Draft quotas reset to standard institutional baseline.");
  };

  // Handlers for Single Policy Adjust
  const handleOpenSingleAdjust = (policy: PolicyQuotaItem) => {
    setEditingSinglePolicy({ ...policy });
    setSinglePolicyModalOpen(true);
  };

  const handleSaveSinglePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSinglePolicy) return;

    setPolicies((prev) =>
      prev.map((p) => (p.id === editingSinglePolicy.id ? editingSinglePolicy : p))
    );
    if (typeof window !== "undefined") {
      try {
        const updated = policies.map((p) =>
          p.id === editingSinglePolicy.id ? editingSinglePolicy : p
        );
        localStorage.setItem("edusphere:leave-policies-v3", JSON.stringify(updated));
      } catch {}
    }
    setSinglePolicyModalOpen(false);
    toast.success(`Policy for ${editingSinglePolicy.category} updated successfully.`);
  };

  // Official Print Document Generation
  const handlePrintPolicy = () => {
    const generatedDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const categoryRows = policies
      .map(
        (p) => `
        <tr>
          <td style="font-family:monospace;font-weight:700;text-align:center;background:#f8fafc;">${p.code}</td>
          <td>
            <strong>${p.category}</strong><br>
            <span style="font-size:8.5px;color:#64748b;">${p.description}</span>
          </td>
          <td><span style="display:inline-block;padding:2px 5px;background:#f1f5f9;border-radius:3px;font-size:8px;font-weight:600;">${p.applicableTo}</span></td>
          <td style="font-weight:bold;text-align:center;font-size:10.5px;color:#091d3e;">${p.days > 0 ? `${p.days} Days` : p.annualQuota}</td>
          <td><span style="color:#047857;font-weight:600;">${p.payStatus}</span></td>
          <td style="font-size:8.5px;">${p.noticePeriod}</td>
          <td style="font-size:8.5px;">${p.carryForward}</td>
          <td style="font-weight:600;font-size:8.5px;">${p.approvalAuthority}</td>
        </tr>`
      )
      .join("");

    const cadreRows = cadres
      .map(
        (c) => `
        <tr>
          <td><strong>${c.cadre}</strong><br><span style="font-size:8px;color:#64748b;">${c.roleCategory} Cadre</span></td>
          <td style="text-align:center;font-weight:bold;">${c.casualLeave}d</td>
          <td style="text-align:center;font-weight:bold;">${c.medicalLeave}d</td>
          <td style="text-align:center;font-weight:bold;">${c.earnedLeave > 0 ? `${c.earnedLeave}d` : "—"}</td>
          <td style="text-align:center;font-weight:bold;">${c.emergencyLeave}d</td>
          <td style="font-size:8.5px;">${c.specialLeave}</td>
          <td style="font-size:8.5px;">${c.maxAccumulation}</td>
          <td style="text-align:center;">${c.encashable ? '<strong style="color:#047857;">Yes</strong>' : '<span style="color:#94a3b8;">No</span>'}</td>
          <td style="font-size:8.5px;font-weight:600;">${c.approvalAuthority}</td>
        </tr>`
      )
      .join("");

    const rulesHtml = STATUTORY_RULES.map(
      (r, idx) => `
        <div style="margin-bottom:10px;page-break-inside:avoid;">
          <h4 style="margin:0 0 3px;font-size:9.5px;color:#091d3e;text-transform:uppercase;">
            ${idx + 1}. ${r.title} — <span style="font-weight:normal;color:#64748b;">${r.badge}</span>
          </h4>
          <p style="margin:0 0 4px;font-size:8.5px;color:#334155;line-height:1.4;">${r.summary}</p>
          <ul style="margin:0;padding-left:14px;font-size:8px;color:#475569;">
            ${r.points.map((pt) => `<li style="margin-bottom:2px;">${pt}</li>`).join("")}
          </ul>
        </div>`
    ).join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Institutional Leave Policy & Entitlement Framework (AY 2026–27) - EduSphere</title>
  <style>
    @page { size: A4 portrait; margin: 10mm 12mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; font-size: 9px; line-height: 1.35; margin: 0; }
    .header-table { width: 100%; border-bottom: 2px solid #091d3e; padding-bottom: 8px; margin-bottom: 12px; }
    .header-logo { font-size: 15px; font-weight: 900; color: #091d3e; text-transform: uppercase; letter-spacing: 0.05em; }
    .header-sub { font-size: 8.5px; color: #475569; font-weight: 500; margin-top: 2px; }
    .header-ref { font-size: 8px; font-family: monospace; color: #64748b; text-align: right; }
    h2 { font-size: 10.5px; font-weight: 800; text-transform: uppercase; margin: 12px 0 6px; color: #091d3e; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 8.5px; }
    th, td { border: 1px solid #cbd5e1; padding: 4.5px 6px; text-align: left; vertical-align: top; }
    th { background: #091d3e; color: #ffffff; font-weight: 700; font-size: 8px; text-transform: uppercase; letter-spacing: 0.03em; }
    .footer-signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 30px; text-align: center; page-break-inside: avoid; }
    .sign-box { border-top: 1px solid #64748b; padding-top: 4px; font-size: 8px; font-weight: 700; text-transform: uppercase; color: #334155; }
    .sign-title { font-size: 7.5px; font-weight: normal; color: #64748b; margin-top: 1px; }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="border:none;padding:0;">
        <div class="header-logo">EduSphere International System</div>
        <div class="header-sub">Directorate of Academic Governance & Human Resources · Academic Session 2026–27</div>
      </td>
      <td style="border:none;padding:0;text-align:right;">
        <div class="header-ref">Ref No: EDUS/HR-ATT/2026-POL-04</div>
        <div class="header-ref">Date of Gazette: ${generatedDate}</div>
        <div class="header-ref">Classification: Official Statutory Policy</div>
      </td>
    </tr>
  </table>

  <h2>Section 1: Approved Leave Categories & Institutional Quotas</h2>
  <table>
    <thead>
      <tr>
        <th style="width:5%;text-align:center;">Code</th>
        <th style="width:23%;">Category & Scope</th>
        <th style="width:16%;">Target Cadre</th>
        <th style="width:9%;text-align:center;">Annual Quota</th>
        <th style="width:11%;">Remuneration</th>
        <th style="width:13%;">Notice Requirement</th>
        <th style="width:11%;">Carry-Over</th>
        <th style="width:12%;">Approval Authority</th>
      </tr>
    </thead>
    <tbody>
      ${categoryRows}
    </tbody>
  </table>

  <h2>Section 2: Cadre-Wise Entitlement Matrix (Teaching, Admin, Support, Students)</h2>
  <table>
    <thead>
      <tr>
        <th style="width:26%;">Cadre / Hierarchy</th>
        <th style="width:6%;text-align:center;">CL</th>
        <th style="width:6%;text-align:center;">ML</th>
        <th style="width:6%;text-align:center;">EL</th>
        <th style="width:6%;text-align:center;">EM</th>
        <th style="width:20%;">Special Leave Entitlements</th>
        <th style="width:13%;">Accumulation Cap</th>
        <th style="width:7%;text-align:center;">Encash</th>
        <th style="width:10%;">Approval</th>
      </tr>
    </thead>
    <tbody>
      ${cadreRows}
    </tbody>
  </table>

  <h2>Section 3: Statutory Regulations, Attendance Thresholds & Enforcement</h2>
  <div style="column-count: 2; column-gap: 15px;">
    ${rulesHtml}
  </div>

  <div class="footer-signatures">
    <div>
      <div class="sign-box">Campus HR Administrator</div>
      <div class="sign-title">Human Resource & Establishment Division</div>
    </div>
    <div>
      <div class="sign-box">Campus Principal</div>
      <div class="sign-title">Head of Institutional Campus Operations</div>
    </div>
    <div>
      <div class="sign-box">Director of Academic Affairs</div>
      <div class="sign-title">Central Educational Executive Board</div>
    </div>
  </div>
</body>
</html>`;

    printHtml(html);
  };

  return (
    <div className="space-y-6">
      {/* ───────────────────────── Page Header ───────────────────────── */}
      <PageHeader
        title="Leave Policy & Quotas"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="default"
              onClick={handlePrintPolicy}
              className="gap-2 cursor-pointer shadow-xs"
            >
              <Printer className="size-4" />
              <span>Print Policy</span>
            </Button>
            <Button
              variant="default"
              size="default"
              onClick={() => handleOpenEditDialog()}
              className="gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="size-4" />
              <span>Update Quotas</span>
            </Button>
          </div>
        }
      />

      {/* ───────────────────────── Executive KPI Stat Cards ───────────────────────── */}
      <StatGrid className="max-w-none sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Annual Staff Quota Pool"
          value="49 Days"
          icon={CalendarDays}
          split={[
            { label: "Vacation Cadre", value: "29d" },
            { label: "Non-Vacation", value: "49d" },
          ]}
        />
        <StatCard
          label="Institutional Utilization"
          value="64.2%"
          icon={TrendingUp}
          split={[
            { label: "Days Availed", value: "11.4d" },
            { label: "Remaining", value: "17.6d" },
          ]}
        />
        <StatCard
          label="Carry-Forward Cap"
          value="24 Days Max"
          icon={RotateCcw}
          split={[
            { label: "Annual Lapsing", value: "Dec 31" },
            { label: "Encashable", value: "10d/yr" },
          ]}
        />
        <StatCard
          label="Mandatory Attendance"
          value="75.0% Min"
          icon={ShieldCheck}
          split={[
            { label: "Staff Standard", value: "92%" },
            { label: "Exam Mandate", value: "75%" },
          ]}
        />
      </StatGrid>

      {/* ───────────────────────── Navigation Tabs ───────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 dark:bg-muted/40 border border-slate-200/80 dark:border-border">
          <button
            type="button"
            onClick={() => setActiveTab("policies")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-[4px] text-xs font-semibold transition-all cursor-pointer",
              activeTab === "policies"
                ? "bg-gradient-to-r from-[#16345f] to-[#091d3e] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-muted-foreground dark:hover:text-foreground"
            )}
          >
            <Layers className="size-3.5" />
            <span>Policy Categories & Quotas</span>
            <span
              className={cn(
                "ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full",
                activeTab === "policies"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 text-slate-700"
              )}
            >
              {policies.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cadres")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-[4px] text-xs font-semibold transition-all cursor-pointer",
              activeTab === "cadres"
                ? "bg-gradient-to-r from-[#16345f] to-[#091d3e] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-muted-foreground dark:hover:text-foreground"
            )}
          >
            <Briefcase className="size-3.5" />
            <span>Cadre Entitlement Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rules")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-[4px] text-xs font-semibold transition-all cursor-pointer",
              activeTab === "rules"
                ? "bg-gradient-to-r from-[#16345f] to-[#091d3e] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-muted-foreground dark:hover:text-foreground"
            )}
          >
            <ShieldCheck className="size-3.5" />
            <span>Statutory Regulations & Rules</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("workflow")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-[4px] text-xs font-semibold transition-all cursor-pointer",
              activeTab === "workflow"
                ? "bg-gradient-to-r from-[#16345f] to-[#091d3e] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-muted-foreground dark:hover:text-foreground"
            )}
          >
            <UserCheck className="size-3.5" />
            <span>Sanctioning & Escalation</span>
          </button>
        </div>

        {/* Academic Session Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Building2 className="size-3.5 text-brand" />
          <span>Institutional Quota Framework · Session 2026–27</span>
        </div>
      </div>

      {/* ───────────────────────── TAB 1: POLICY CATEGORIES & QUOTAS ───────────────────────── */}
      {activeTab === "policies" && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-brand/10 shadow-[0_1px_3px_rgb(9_29_62/0.05)]">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search category code, name, notice rules, or authority..."
                className="h-9 w-full rounded-[4px] border border-input bg-background pl-9 pr-8 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Scope Filter Pills */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                Filter:
              </span>
              {(["All", "Staff", "Students"] as const).map((scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setPolicyScopeFilter(scope)}
                  className={cn(
                    "px-3 py-1 rounded-[4px] text-xs font-semibold transition-all cursor-pointer",
                    policyScopeFilter === scope
                      ? "bg-brand-50 text-brand border border-brand/25 font-bold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-slate-50 border border-transparent"
                  )}
                >
                  {scope === "All" ? "All Policies" : scope === "Staff" ? "Staff Only" : "Students"}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {filteredPolicies.map((p) => (
              <div
                key={p.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-brand/12 bg-white p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_3px_rgb(9_29_62/0.05),0_10px_24px_-16px_rgb(9_29_62/0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-brand/35 hover:shadow-[0_8px_24px_-6px_rgba(9,29,62,0.18)]"
              >
                {/* Ambient sapphire top glow beam */}
                <span
                  aria-hidden
                  className="absolute inset-x-8 top-0 h-[2.5px] rounded-full bg-gradient-to-r from-transparent via-[#1e4275] to-transparent opacity-80 transition-all duration-500 group-hover:inset-x-3 group-hover:h-[3px] group-hover:via-[#3f6396]"
                />

                <div>
                  {/* Header: Code Badge + Applicability Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={cn(
                        "inline-flex size-9 items-center justify-center rounded-lg bg-gradient-to-b font-mono text-xs font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_6px_rgba(9,29,62,0.3)] ring-1 ring-white/10",
                        p.colorScheme.badgeBg,
                        p.colorScheme.badgeText
                      )}
                    >
                      {p.code}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-slate-200/90 bg-slate-50/90 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 shadow-2xs">
                      {p.applicableTo}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="mb-2">
                    <h3 className="font-heading text-sm font-bold text-foreground group-hover:text-brand transition-colors">
                      {p.category}
                    </h3>
                  </div>

                  {/* Annual Quota Spotlight */}
                  <div className="my-3.5 rounded-lg border border-brand/10 bg-gradient-to-b from-slate-50/80 to-white p-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">
                      Annual Quota
                    </span>
                    <div className="mt-0.5 flex items-baseline justify-center gap-1.5">
                      <span className="font-mono text-2xl font-black tracking-tight text-[#091d3e]">
                        {p.days > 0 ? p.days : p.annualQuota}
                      </span>
                      {p.days > 0 && (
                        <span className="text-xs font-semibold text-slate-500">
                          Days / Year
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Key Specifications */}
                  <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="size-3 text-muted-foreground/70 shrink-0" />
                        Notice Period
                      </span>
                      <span className="font-semibold text-foreground">
                        {p.noticePeriod}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <RotateCcw className="size-3 text-muted-foreground/70 shrink-0" />
                        Carry-over
                      </span>
                      <span className="font-semibold text-foreground">
                        {p.carryForward}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <UserCheck className="size-3 text-muted-foreground/70 shrink-0" />
                        Sanction Authority
                      </span>
                      <span className="font-semibold text-foreground">
                        {p.approvalAuthority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[4px] border border-emerald-200/80">
                    <CheckCircle2 className="size-3 text-emerald-600" />
                    <span>Active Quota</span>
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleOpenSingleAdjust(p)}
                    className="h-7 px-2.5 rounded-[4px] border-brand/20 hover:border-brand hover:bg-brand-50 text-foreground font-semibold cursor-pointer shadow-2xs gap-1.5 text-xs"
                  >
                    <Pencil className="size-3 text-brand" />
                    <span>Adjust</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────── TAB 2: CADRE ENTITLEMENT MATRIX ───────────────────────── */}
      {activeTab === "cadres" && (
        <SectionCard
          title="Cadre-Wise Leave Entitlement Matrix"
          description="Institutional distribution of leave allowances across academic, administrative, and student hierarchies"
          flush
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#091d3e] text-white">
                <tr>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">
                    Cadre / Designation
                  </th>
                  <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-center">
                    Casual (CL)
                  </th>
                  <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-center">
                    Medical (ML)
                  </th>
                  <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-center">
                    Earned (EL)
                  </th>
                  <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-center">
                    Emergency
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">
                    Special Entitlements
                  </th>
                  <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px]">
                    Accumulation Cap
                  </th>
                  <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-center">
                    Encashable?
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">
                    Approval Authority
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-white">
                {cadres.map((c, idx) => (
                  <tr
                    key={c.id}
                    className={cn(
                      "hover:bg-brand-50/30 transition-colors",
                      idx % 2 === 1 ? "bg-slate-50/40" : "bg-white"
                    )}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-foreground text-xs">{c.cadre}</div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                        {c.roleCategory} Cadre
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-brand">
                      {c.casualLeave > 0 ? `${c.casualLeave}d` : "—"}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-rose-700">
                      {c.medicalLeave > 0 ? `${c.medicalLeave}d` : "—"}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                      {c.earnedLeave > 0 ? `${c.earnedLeave}d` : "—"}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-700">
                      {c.emergencyLeave > 0 ? `${c.emergencyLeave}d` : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200">
                        {c.specialLeave}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs font-semibold text-muted-foreground">
                      {c.maxAccumulation}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {c.encashable ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          Yes (10d)
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground text-[11px]">
                      {c.approvalAuthority}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* ───────────────────────── TAB 3: STATUTORY REGULATIONS & RULES ───────────────────────── */}
      {activeTab === "rules" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {STATUTORY_RULES.map((rule) => {
            const Icon = rule.icon;
            return (
              <div
                key={rule.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-brand/12 bg-white p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_3px_rgb(9_29_62/0.05),0_10px_24px_-16px_rgb(9_29_62/0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-brand/35 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-b from-[#1e4275] to-[#091d3e] text-white shadow-sm ring-1 ring-white/10">
                      <Icon className="size-4" />
                    </span>
                    <span className="inline-flex items-center rounded-full border border-brand/20 bg-brand-50/80 px-2.5 py-0.5 text-[10px] font-bold text-brand uppercase tracking-wider">
                      {rule.badge}
                    </span>
                  </div>

                  <h3 className="font-heading text-sm font-bold text-foreground group-hover:text-brand transition-colors">
                    {rule.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {rule.summary}
                  </p>

                  <div className="mt-4 space-y-2 border-t border-border/70 pt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Operational Clauses & Standards:
                    </span>
                    <ul className="space-y-1.5">
                      {rule.points.map((pt, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-[11px] text-slate-700 leading-snug"
                        >
                          <ChevronRight className="size-3 text-brand shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 font-semibold text-brand">
                    <ShieldCheck className="size-3 text-brand" />
                    Enforced by Academic Council
                  </span>
                  <span className="font-mono text-[10px]">AY 2026–27</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ───────────────────────── TAB 4: SANCTIONING & APPROVAL ESCALATION ───────────────────────── */}
      {activeTab === "workflow" && (
        <SectionCard
          title="Institutional Leave Sanctioning Hierarchy"
          description="Formal escalation pathways and Service Level Agreements (SLAs) for leave authorizations"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {APPROVAL_WORKFLOW_TIERS.map((tier, idx) => (
              <div
                key={tier.tier}
                className="relative flex flex-col justify-between rounded-xl border border-brand/15 bg-white p-5 shadow-xs transition-all hover:-translate-y-1 hover:border-brand/40"
              >
                {/* Step badge */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center justify-center size-7 rounded-md bg-gradient-to-b from-[#1e4275] to-[#091d3e] text-white font-mono text-xs font-bold shadow-2xs">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
                      {tier.sla}
                    </span>
                  </div>

                  <h4 className="font-heading text-sm font-bold text-foreground">
                    {tier.authority}
                  </h4>
                  <p className="text-[11px] font-semibold text-brand mt-0.5">
                    {tier.level}
                  </p>

                  <div className="my-3 rounded-lg bg-slate-50 p-2.5 border border-slate-200/80 text-xs font-medium text-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      Sanction Jurisdiction:
                    </span>
                    {tier.scope}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="size-3 text-emerald-600" />
                    Formal Sign-off Required
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ───────────────────────── UPDATE INSTITUTIONAL QUOTAS DIALOG (BATCH) ───────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-xl border border-border shadow-2xl bg-card">
          <DialogHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-slate-50 to-brand-50/30">
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-brand" />
              <span>Update Institutional Leave Quotas (Session 2026–27)</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Adjust statutory annual leave day allocations for Academic Session 2026–27. Changes apply across all campus portals.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveQuotas} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="grid size-8 place-items-center rounded-md border border-brand/20 bg-brand-50 font-mono text-xs font-bold text-brand dark:bg-brand-950 dark:text-brand-300 shrink-0">
                        {p.code}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {p.category}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {p.applicableTo} · <span className="text-emerald-700 font-medium">{p.payStatus}</span>
                        </p>
                      </div>
                    </div>

                    {/* Stepper Input */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
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
                        className="size-7 cursor-pointer"
                      >
                        <Minus className="size-3" />
                      </Button>

                      <div className="relative flex w-24 items-center">
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
                          className="h-8 w-full rounded-[4px] border border-input bg-background pr-6 text-center font-mono text-xs font-bold tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                        <span className="pointer-events-none absolute right-2 text-[10px] text-muted-foreground">
                          days
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
                        className="size-7 cursor-pointer"
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
                className="gap-1.5 text-xs cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset Defaults</span>
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditDialogOpen(false)}
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant="default"
                  className="gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  <Check className="size-3.5" />
                  <span>Save Quotas</span>
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ───────────────────────── ADJUST SINGLE POLICY MODAL ───────────────────────── */}
      <Dialog open={singlePolicyModalOpen} onOpenChange={setSinglePolicyModalOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-xl border border-border shadow-2xl bg-card">
          <DialogHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-slate-50 to-brand-50/30">
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Pencil className="size-4 text-brand" />
              <span>Adjust Policy: {editingSinglePolicy?.category}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure parameters, notice requirements, carry-forward terms, and sanctioning authority.
            </DialogDescription>
          </DialogHeader>

          {editingSinglePolicy && (
            <form onSubmit={handleSaveSinglePolicy} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1 uppercase tracking-wider">
                    Annual Quota (Days)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={365}
                    value={editingSinglePolicy.days}
                    onChange={(e) =>
                      setEditingSinglePolicy({
                        ...editingSinglePolicy,
                        days: Math.max(0, parseInt(e.target.value, 10) || 0),
                        annualQuota: `${Math.max(0, parseInt(e.target.value, 10) || 0)} Days`,
                      })
                    }
                    className="h-8 w-full rounded-[4px] border border-input bg-background px-3 font-mono text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1 uppercase tracking-wider">
                    Remuneration / Pay
                  </label>
                  <input
                    type="text"
                    value={editingSinglePolicy.payStatus}
                    onChange={(e) =>
                      setEditingSinglePolicy({
                        ...editingSinglePolicy,
                        payStatus: e.target.value,
                      })
                    }
                    className="h-8 w-full rounded-[4px] border border-input bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1 uppercase tracking-wider">
                  Target Cadre / Applicability
                </label>
                <input
                  type="text"
                  value={editingSinglePolicy.applicableTo}
                  onChange={(e) =>
                    setEditingSinglePolicy({
                      ...editingSinglePolicy,
                      applicableTo: e.target.value,
                    })
                  }
                  className="h-8 w-full rounded-[4px] border border-input bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1 uppercase tracking-wider">
                    Notice Period
                  </label>
                  <input
                    type="text"
                    value={editingSinglePolicy.noticePeriod}
                    onChange={(e) =>
                      setEditingSinglePolicy({
                        ...editingSinglePolicy,
                        noticePeriod: e.target.value,
                      })
                    }
                    className="h-8 w-full rounded-[4px] border border-input bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1 uppercase tracking-wider">
                    Sanction Authority
                  </label>
                  <input
                    type="text"
                    value={editingSinglePolicy.approvalAuthority}
                    onChange={(e) =>
                      setEditingSinglePolicy({
                        ...editingSinglePolicy,
                        approvalAuthority: e.target.value,
                      })
                    }
                    className="h-8 w-full rounded-[4px] border border-input bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1 uppercase tracking-wider">
                  Carry-Forward & Lapsing Rule
                </label>
                <input
                  type="text"
                  value={editingSinglePolicy.carryForward}
                  onChange={(e) =>
                    setEditingSinglePolicy({
                      ...editingSinglePolicy,
                      carryForward: e.target.value,
                    })
                  }
                  className="h-8 w-full rounded-[4px] border border-input bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1 uppercase tracking-wider">
                  Policy Description & Scope
                </label>
                <textarea
                  rows={3}
                  value={editingSinglePolicy.description}
                  onChange={(e) =>
                    setEditingSinglePolicy({
                      ...editingSinglePolicy,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-[4px] border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <DialogFooter className="flex items-center justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSinglePolicyModalOpen(false)}
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant="default"
                  className="gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  <Check className="size-3.5" />
                  <span>Update Policy</span>
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
