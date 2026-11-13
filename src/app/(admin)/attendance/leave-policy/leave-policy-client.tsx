"use client";

import * as React from "react";
import { toast } from "sonner";
import {
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
  Info,
  Layers,
  Minus,
  Pencil,
  Percent,
  PieChart,
  Plus,
  Printer,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
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
import { AreaTrendChart, DonutChart, type DonutSlice } from "@/components/charts";
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
      badgeBg: "from-[#7c4424] to-[#5c3118]",
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
      badgeBg: "from-[#5c3118] to-[#381e0f]",
      badgeText: "text-white",
      ringColor: "ring-[#5c3118]/20",
      accentGlow: "bg-[#5c3118]/10",
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
      badgeBg: "from-[#c28b38] to-[#7c4424]",
      badgeText: "text-white",
      ringColor: "ring-[#c28b38]/20",
      accentGlow: "bg-[#c28b38]/10",
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
      badgeBg: "from-emerald-700 to-teal-900",
      badgeText: "text-white",
      ringColor: "ring-emerald-500/20",
      accentGlow: "bg-emerald-500/10",
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
// STAFF LEAVE ANALYTICS DATA (PERCENTAGES & TRENDS)
// ─────────────────────────────────────────────────────────────────────────────

interface StaffLeaveCategoryMetric {
  id: string;
  code: string;
  name: string;
  percentage: number; // percentage share of staff leaves
  days: number; // days availed across staff
  annualQuotaDays: number;
  color: string;
  payStatus: string;
  targetCadres: string;
  authority: string;
}

const STAFF_LEAVE_CATEGORIES: StaffLeaveCategoryMetric[] = [
  {
    id: "pol-cl",
    code: "CL",
    name: "Casual Leave",
    percentage: 38.5,
    days: 462,
    annualQuotaDays: 10,
    color: "#7c4424", // Cognac brown
    payStatus: "100% Fully Paid",
    targetCadres: "All Teaching & Support Staff",
    authority: "Campus Principal",
  },
  {
    id: "pol-ml",
    code: "ML",
    name: "Medical / Sick Leave",
    percentage: 27.5,
    days: 330,
    annualQuotaDays: 12,
    color: "#be123c", // Crimson Rose
    payStatus: "100% Fully Paid",
    targetCadres: "All Academic & Admin Staff",
    authority: "HR / Campus Clinic",
  },
  {
    id: "pol-el",
    code: "EL",
    name: "Annual Earned Leave",
    percentage: 19.5,
    days: 234,
    annualQuotaDays: 20,
    color: "#5c3118", // Deep Saddle Brown
    payStatus: "Statutory Paid",
    targetCadres: "Non-Vacation Officers & IT",
    authority: "HR Director",
  },
  {
    id: "pol-mpl",
    code: "MPL",
    name: "Maternity / Parental",
    percentage: 8.5,
    days: 102,
    annualQuotaDays: 90,
    color: "#c28b38", // Warm Bronze Gold
    payStatus: "Statutory Paid",
    targetCadres: "Permanent Staff Members",
    authority: "Director HR / Board",
  },
  {
    id: "pol-sl",
    code: "SL",
    name: "Duty & Study Special",
    percentage: 6.0,
    days: 72,
    annualQuotaDays: 14,
    color: "#047857", // Deep Forest Emerald
    payStatus: "Fully Paid",
    targetCadres: "Instructional Teaching Faculty",
    authority: "Director Academics",
  },
];

interface MonthlyStaffLeavePoint {
  [key: string]: string | number;
  month: string;
  fullName: string;
  overall: number; // overall % of staff on leave
  teaching: number; // % of teaching faculty on leave
  admin: number; // % of admin & support staff on leave
  threshold: number; // institutional ceiling 8.0%
}

const MONTHLY_STAFF_LEAVE_TREND: MonthlyStaffLeavePoint[] = [
  { month: "Aug", fullName: "August 2026", overall: 3.2, teaching: 2.8, admin: 3.8, threshold: 8.0 },
  { month: "Sep", fullName: "September 2026", overall: 4.5, teaching: 4.2, admin: 5.1, threshold: 8.0 },
  { month: "Oct", fullName: "October 2026", overall: 6.8, teaching: 7.1, admin: 6.2, threshold: 8.0 },
  { month: "Nov", fullName: "November 2026", overall: 5.2, teaching: 4.9, admin: 5.8, threshold: 8.0 },
  { month: "Dec", fullName: "December 2026", overall: 9.4, teaching: 10.2, admin: 7.8, threshold: 8.0 },
  { month: "Jan", fullName: "January 2027", overall: 4.8, teaching: 4.4, admin: 5.5, threshold: 8.0 },
  { month: "Feb", fullName: "February 2027", overall: 5.6, teaching: 5.8, admin: 5.2, threshold: 8.0 },
  { month: "Mar", fullName: "March 2027", overall: 7.1, teaching: 7.5, admin: 6.4, threshold: 8.0 },
  { month: "Apr", fullName: "April 2027", overall: 4.2, teaching: 3.9, admin: 4.8, threshold: 8.0 },
  { month: "May", fullName: "May 2027", overall: 8.6, teaching: 9.2, admin: 7.4, threshold: 8.0 },
];

const CADRE_STAFF_BENCHMARKS = [
  {
    cadre: "Instructional Teaching Faculty",
    role: "Academic Cadre",
    activeStaff: 128,
    leaveSharePercent: 61.8,
    avgLeaveRate: "6.01%",
    totalDaysAvailed: 742,
    color: "#7c4424",
  },
  {
    cadre: "Administrative & Accounts Officers",
    role: "Administrative Cadre",
    activeStaff: 62,
    leaveSharePercent: 23.7,
    avgLeaveRate: "5.62%",
    totalDaysAvailed: 284,
    color: "#c28b38",
  },
  {
    cadre: "IT, Lab & Auxiliary Support Personnel",
    role: "Support Cadre",
    activeStaff: 60,
    leaveSharePercent: 14.5,
    avgLeaveRate: "6.18%",
    totalDaysAvailed: 174,
    color: "#5c3118",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────

export function LeavePolicyClient() {
  // State for Policies (persisted in localStorage)
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

  // Hover state for interactive donut
  const [activeDonutIndex, setActiveDonutIndex] = React.useState<number | null>(null);

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
  const handleOpenSingleAdjust = (policyId: string) => {
    const found = policies.find((p) => p.id === policyId) || INITIAL_POLICIES.find((p) => p.id === policyId);
    if (found) {
      setEditingSinglePolicy({ ...found });
      setSinglePolicyModalOpen(true);
    }
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
          <td style="font-weight:bold;text-align:center;font-size:10.5px;color:#381e0f;">${p.days > 0 ? `${p.days} Days` : p.annualQuota}</td>
          <td><span style="color:#381e0f;font-weight:600;">${p.payStatus}</span></td>
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
          <td style="text-align:center;font-weight:bold;color:#7c4424;">${c.casualLeave > 0 ? `${c.casualLeave}d` : "—"}</td>
          <td style="text-align:center;font-weight:bold;color:#be123c;">${c.medicalLeave > 0 ? `${c.medicalLeave}d` : "—"}</td>
          <td style="text-align:center;font-weight:bold;color:#047857;">${c.earnedLeave > 0 ? `${c.earnedLeave}d` : "—"}</td>
          <td style="text-align:center;font-weight:bold;color:#b45309;">${c.emergencyLeave > 0 ? `${c.emergencyLeave}d` : "—"}</td>
          <td><span style="font-size:8px;padding:2px 4px;background:#f1f5f9;border-radius:3px;">${c.specialLeave}</span></td>
          <td style="font-size:8.5px;">${c.maxAccumulation}</td>
          <td style="text-align:center;font-size:8px;">${c.encashable ? "Yes (10d)" : "No"}</td>
          <td style="font-size:8px;font-weight:600;">${c.approvalAuthority}</td>
        </tr>`
      )
      .join("");

    const rulesHtml = STATUTORY_RULES.map(
      (r) => `
      <div style="margin-bottom: 12px; page-break-inside: avoid; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px;">
        <div style="font-size: 10px; font-weight: bold; color: #381e0f; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 4px;">
          ${r.title} <span style="float:right;font-size:8px;color:#7c4424;font-weight:normal;">[${r.badge}]</span>
        </div>
        <p style="font-size: 8.5px; color: #475569; margin: 0 0 6px 0; line-height: 1.3;">${r.summary}</p>
        <ul style="margin: 0; padding-left: 14px; font-size: 8px; color: #334155; line-height: 1.35;">
          ${r.points.map((p) => `<li>${p}</li>`).join("")}
        </ul>
      </div>`
    ).join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Institutional Leave Policy & Staff Entitlements Gazette · 2026–27</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; font-size: 9.5px; color: #0f172a; line-height: 1.3; }
    .header-logo { font-size: 17px; font-weight: 800; color: #381e0f; letter-spacing: -0.3px; }
    .header-sub { font-size: 9px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .header-ref { font-size: 8.5px; color: #334155; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0 16px 0; }
    th { background: #381e0f; color: #ffffff; font-size: 8.5px; text-transform: uppercase; font-weight: 700; padding: 5px 6px; border: 1px solid #381e0f; }
    td { padding: 4.5px 6px; border: 1px solid #cbd5e1; font-size: 8.5px; vertical-align: top; }
    h2 { font-size: 11px; font-weight: 800; color: #381e0f; border-bottom: 1.5px solid #7c4424; padding-bottom: 3px; margin: 14px 0 6px 0; text-transform: uppercase; letter-spacing: 0.3px; }
    .footer-signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 24px; padding-top: 10px; border-top: 1px solid #cbd5e1; }
    .sign-box { border-bottom: 1px dashed #64748b; height: 35px; margin-bottom: 4px; font-weight: bold; font-size: 8.5px; display: flex; align-items: flex-end; }
    .sign-title { font-size: 8px; color: #64748b; text-transform: uppercase; }
  </style>
</head>
<body>
  <table style="border:none;margin-bottom:8px;">
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

  <h2>Section 2: Cadre-Wise Entitlement Matrix (Teaching, Admin, Support)</h2>
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

  // Convert categories into Donut slices for Graph 1
  const donutData: DonutSlice[] = React.useMemo(() => {
    return STAFF_LEAVE_CATEGORIES.map((c) => ({
      name: `${c.name} (${c.code})`,
      value: c.percentage,
      color: c.color,
    }));
  }, []);

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
              className="gap-2 cursor-pointer shadow-xs rounded-[4px] border-brand/20 hover:border-brand hover:bg-brand-50"
            >
              <Printer className="size-4 text-brand" />
              <span>Print Policy</span>
            </Button>
            <Button
              variant="default"
              size="default"
              onClick={() => handleOpenEditDialog()}
              className="gap-2 cursor-pointer rounded-[4px] bg-gradient-to-r from-[#7c4424] to-[#5c3118] hover:from-[#6e3b1f] hover:to-[#381e0f] text-white shadow-sm"
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
          value="49 Days Max"
          icon={CalendarDays}
          split={[
            { label: "Vacation Cadre", value: "29d" },
            { label: "Non-Vacation", value: "49d" },
          ]}
        />
        <StatCard
          label="Institutional Staff Utilization"
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
            { label: "Staff Target", value: "92%" },
            { label: "Exam Mandate", value: "75%" },
          ]}
        />
      </StatGrid>

      {/* ───────────────────────── TWO CORE STAFF LEAVE GRAPHS ───────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ── GRAPH 1: Staff Leave Distribution by Category (%) ── */}
        <SectionCard
          title={
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-md bg-brand-50 border border-brand/20 text-brand">
                <PieChart className="size-4 text-brand" />
              </span>
              <span className="font-heading font-bold text-base text-foreground">
                Staff Leave Distribution by Category (%)
              </span>
            </div>
          }
          description="Percentage allocation and volume of 1,200 sanctioned staff leave days across statutory categories"
          className="lg:col-span-5 flex flex-col justify-between"
          contentClassName="flex-1 flex flex-col justify-between p-5 space-y-4"
        >
          {/* Interactive Donut Display */}
          <div className="relative py-2">
            <DonutChart
              data={donutData}
              centerValue="64.2%"
              centerLabel="Staff Availed"
              format="percent"
              activeIndex={activeDonutIndex}
              onHoverIndex={setActiveDonutIndex}
              className="h-[210px] w-full max-w-[210px]"
            />
          </div>

          {/* Category-by-Category Percentage Breakdown List */}
          <div className="space-y-2.5 border-t border-border/70 pt-4">
            {STAFF_LEAVE_CATEGORIES.map((cat, idx) => {
              const isHovered = activeDonutIndex === idx;
              return (
                <div
                  key={cat.id}
                  onMouseEnter={() => setActiveDonutIndex(idx)}
                  onMouseLeave={() => setActiveDonutIndex(null)}
                  className={cn(
                    "group/item flex items-center justify-between gap-3 p-2 rounded-lg transition-all border",
                    isHovered
                      ? "bg-brand-50/60 border-brand/30 shadow-2xs"
                      : "bg-slate-50/50 hover:bg-slate-100/70 border-slate-200/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="size-3 rounded-full shrink-0 ring-2 ring-white shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-[3px] bg-white border border-slate-200 text-slate-800">
                          {cat.code}
                        </span>
                        <span className="text-xs font-bold text-foreground truncate">
                          {cat.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {cat.targetCadres} · <span className="font-semibold text-emerald-700">{cat.payStatus}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 text-right">
                    <div>
                      <span className="font-mono text-xs font-bold tabular-nums text-foreground">
                        {cat.percentage}%
                      </span>
                      <p className="text-[10px] text-muted-foreground tabular-nums">
                        {cat.days} days
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleOpenSingleAdjust(cat.id)}
                      title={`Adjust ${cat.name} Quota`}
                      className="opacity-60 group-hover/item:opacity-100 hover:bg-brand-50 hover:text-brand cursor-pointer size-6 rounded-[4px]"
                    >
                      <Pencil className="size-3 text-brand" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Context Summary */}
          <div className="rounded-lg bg-amber-50/70 border border-amber-200/80 p-2.5 text-xs text-amber-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold">
              <Info className="size-3.5 text-amber-700 shrink-0" />
              Casual Leave (38.5%) and Medical Leave (27.5%) form 66.0% of all staff absences.
            </span>
            <span className="font-mono text-[10px] font-bold text-amber-800 shrink-0 ml-2">
              1,200 Days Total
            </span>
          </div>
        </SectionCard>

        {/* ── GRAPH 2: Monthly Staff Leave Utilization Trend (%) ── */}
        <SectionCard
          title={
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-md bg-brand-50 border border-brand/20 text-brand">
                <TrendingUp className="size-4 text-brand" />
              </span>
              <span className="font-heading font-bold text-base text-foreground">
                Monthly Staff Leave Utilization Rate (%)
              </span>
            </div>
          }
          description="Academic session month-by-month percentage of personnel on sanctioned leave vs. 8.0% institutional ceiling"
          className="lg:col-span-7 flex flex-col justify-between"
          contentClassName="flex-1 flex flex-col justify-between p-5 space-y-4"
        >
          {/* Main Area Trend Chart */}
          <div className="py-1">
            <AreaTrendChart
              data={MONTHLY_STAFF_LEAVE_TREND}
              xKey="month"
              series={[
                {
                  key: "overall",
                  label: "Overall Staff Leave Rate (%)",
                  color: "#7c4424",
                  strokeWidth: 2.75,
                  fillOpacity: 0.3,
                },
                {
                  key: "teaching",
                  label: "Teaching Faculty (%)",
                  color: "#c28b38",
                  strokeWidth: 2,
                  fillOpacity: 0.15,
                },
                {
                  key: "admin",
                  label: "Admin & Support (%)",
                  color: "#5c3118",
                  strokeWidth: 2,
                  fillOpacity: 0.1,
                },
              ]}
              format="percent"
              yDomain={[0, 12]}
              className="h-[280px] w-full"
              showLegend
            />
          </div>

          {/* Monthly Trajectory Performance Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border/70 pt-4">
            <div className="rounded-lg bg-slate-50/80 border border-slate-200/80 p-2.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Session Average
              </span>
              <span className="font-mono text-base font-black text-[#381e0f]">
                5.94%
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                Within 8% Target
              </span>
            </div>

            <div className="rounded-lg bg-rose-50/80 border border-rose-200/80 p-2.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                Peak Absence Month
              </span>
              <span className="font-mono text-base font-black text-rose-900">
                9.4%
              </span>
              <span className="text-[10px] text-rose-700 font-semibold block mt-0.5">
                December (Winter Recess)
              </span>
            </div>

            <div className="rounded-lg bg-emerald-50/80 border border-emerald-200/80 p-2.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                Lowest Absence Month
              </span>
              <span className="font-mono text-base font-black text-emerald-900">
                3.2%
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                August (Term Opening)
              </span>
            </div>

            <div className="rounded-lg bg-brand-50/60 border border-brand/20 p-2.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand block">
                Statutory Ceiling
              </span>
              <span className="font-mono text-base font-black text-brand">
                8.0% Max
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold block mt-0.5">
                Escalation Alert Line
              </span>
            </div>
          </div>

          {/* Month Trend Explanation Footer */}
          <div className="rounded-lg bg-slate-50 border border-slate-200/70 p-3 text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-medium text-[11px]">
              <Sparkles className="size-3.5 text-brand shrink-0" />
              Staff leave rates peaked during December (9.4%) and May (8.6%) corresponding with exam transitions.
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 text-[10px] bg-emerald-50 px-2 py-0.5 rounded-[4px] border border-emerald-200 shrink-0">
              <CheckCircle2 className="size-3" />
              94.2% Staff Availability Met
            </span>
          </div>
        </SectionCard>
      </div>

      {/* ───────────────────────── CADRE-WISE STAFF LEAVE BENCHMARK STRIP ───────────────────────── */}
      <SectionCard
        title={
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-brand" />
            <span className="font-heading font-bold text-sm text-foreground">
              Staff Leave Share &amp; Average Leave Rate by Cadre
            </span>
          </div>
        }
        description="Consolidated leave breakdown per staff group across teaching, administration, and support services"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CADRE_STAFF_BENCHMARKS.map((cadre) => (
            <div
              key={cadre.cadre}
              className="rounded-xl border border-brand/12 bg-white p-4 shadow-xs hover:border-brand/30 transition-all hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand bg-brand-50 px-2 py-0.5 rounded-[4px] border border-brand/20">
                  {cadre.role}
                </span>
                <span className="font-mono text-xs font-bold text-muted-foreground">
                  {cadre.activeStaff} Active Staff
                </span>
              </div>

              <h4 className="font-heading text-sm font-bold text-foreground">
                {cadre.cadre}
              </h4>

              <div className="mt-3.5 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 p-2 border border-slate-200/60">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Share of Total Leaves
                  </span>
                  <span className="font-mono text-lg font-black text-[#381e0f]">
                    {cadre.leaveSharePercent}%
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    {cadre.totalDaysAvailed} days
                  </span>
                </div>

                <div className="rounded-lg bg-slate-50 p-2 border border-slate-200/60">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Avg Monthly Rate
                  </span>
                  <span className="font-mono text-lg font-black text-brand">
                    {cadre.avgLeaveRate}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium block">
                    Compliant
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

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
                        className="size-7 cursor-pointer rounded-[4px]"
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
                        className="size-7 cursor-pointer rounded-[4px]"
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
                className="gap-1.5 text-xs cursor-pointer rounded-[4px]"
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
                  className="text-xs cursor-pointer rounded-[4px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant="default"
                  className="gap-1.5 text-xs font-semibold cursor-pointer rounded-[4px] bg-gradient-to-r from-[#7c4424] to-[#5c3118] text-white"
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
                  Carry-Forward &amp; Lapsing Rule
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
                  Policy Description &amp; Scope
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
                  className="text-xs cursor-pointer rounded-[4px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant="default"
                  className="gap-1.5 text-xs font-semibold cursor-pointer rounded-[4px] bg-gradient-to-r from-[#7c4424] to-[#5c3118] text-white"
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
