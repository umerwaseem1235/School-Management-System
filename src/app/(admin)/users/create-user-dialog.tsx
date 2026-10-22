"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CAMPUSES } from "@/lib/mock/institution";
import { formatCampusDisplay } from "@/lib/format";
import type { Role, Status, User } from "@/types";
import {
  BookOpen,
  Briefcase,
  Building2,
  Check,
  Copy,
  Eye,
  EyeOff,
  GraduationCap,
  Key,
  Plus,
  Receipt,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser: (newUser: User) => void;
  existingCount: number;
}

type UserCategory = "teacher" | "student" | "hr" | "accountant" | "parent" | "admin";

interface RoleConfig {
  role: Role;
  label: string;
  category: "Leadership & Admin" | "Financial & Ops" | "Academic" | "Portals";
  badgeTone: string;
  description: string;
  permissions: string[];
}

const ROLES_CATALOG: RoleConfig[] = [
  {
    role: "Teacher",
    label: "Teacher / Faculty",
    category: "Academic",
    badgeTone: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
    description: "Daily class attendance, classroom marks entry, LMS curriculum, and student homework.",
    permissions: ["Class Attendance", "Marks Entry", "Timetable Access", "LMS Portal"],
  },
  {
    role: "Student",
    label: "Student Portal User",
    category: "Portals",
    badgeTone: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800",
    description: "Personal student portal access for homework, timetable, exam grades, and library books.",
    permissions: ["LMS Access", "View Report Cards", "Timetable Schedule", "Library Borrowing"],
  },
  {
    role: "HR Admin",
    label: "HR & Staff Manager",
    category: "Leadership & Admin",
    badgeTone: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    description: "Faculty recruitment, staff onboarding, biometric attendance, leaves, and compliance records.",
    permissions: ["Staff Onboarding", "Faculty Leaves", "Attendance Logs", "Payroll Processing"],
  },
  {
    role: "Accountant",
    label: "Accountant / Finance Officer",
    category: "Financial & Ops",
    badgeTone: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    description: "Fee voucher generation, student payments, ledger accounts, cash receipts, and expense tracking.",
    permissions: ["Fee Vouchers", "Challan Reconciliation", "Expense Vouchers", "Cash & Bank Ledgers"],
  },
  {
    role: "Parent",
    label: "Parent / Guardian Portal User",
    category: "Portals",
    badgeTone: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
    description: "Parent portal access for child attendance, fee vouchers, online payments, and progress cards.",
    permissions: ["Child Attendance", "Fee Challans", "Progress Cards", "Teacher Messaging"],
  },
  {
    role: "Campus Admin",
    label: "Campus Admin",
    category: "Leadership & Admin",
    badgeTone: "bg-brand-50 text-brand border-brand/20 dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand/40",
    description: "Full administrative oversight and management for their assigned campus branch.",
    permissions: ["Branch Oversight", "Staff Directory", "Student Admissions", "Campus Reports"],
  },
  {
    role: "Principal",
    label: "Principal / Head of Institution",
    category: "Leadership & Admin",
    badgeTone: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
    description: "Academic leadership, teacher evaluations, disciplinary reviews, and student promotion.",
    permissions: ["Academic Approval", "Teacher Appraisals", "Student Affairs", "Institutional Reports"],
  },
  {
    role: "Super Admin",
    label: "Super Admin (Institutional Owner)",
    category: "Leadership & Admin",
    badgeTone: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
    description: "Unrestricted institutional access across all campuses, users, billing, and system settings.",
    permissions: ["All Campuses", "User Management", "Audit Logs", "System Settings", "Financial Approval"],
  },
  {
    role: "Exam Controller",
    label: "Examination Controller",
    category: "Financial & Ops",
    badgeTone: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
    description: "Term assessment creation, timetable date sheets, marks moderation, grading, and report cards.",
    permissions: ["Exam Scheduling", "Date Sheets", "Marks Moderation", "Report Card Publishing"],
  },
  {
    role: "Receptionist",
    label: "Receptionist / Front Desk Officer",
    category: "Financial & Ops",
    badgeTone: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
    description: "Front-desk visitor check-in, visitor badges, parent inquiries, and gate parcel tracking.",
    permissions: ["Visitor Passes", "Inquiry Logging", "Front Desk Appointments", "Gate Security"],
  },
  {
    role: "IT Support",
    label: "IT Support / System Operator",
    category: "Financial & Ops",
    badgeTone: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    description: "Password resets, lab workstations, smart classrooms, and hardware maintenance.",
    permissions: ["Credential Resets", "Lab Workstations", "Smart Class Tech", "System Diagnostics"],
  },
];

const COMMON_SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "Urdu",
  "Islamiyat",
  "Pakistan Studies",
  "General Science",
  "Social Studies",
  "Economics",
  "Accounting",
];

const COMMON_GRADES = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11 (FSc/ICS)",
  "Grade 12",
  "O-Levels",
  "A-Levels",
];

const ACADEMIC_STREAMS = [
  "General / Primary Wing",
  "Matric — Science (Biology)",
  "Matric — Computer Science",
  "Matric — Arts & Humanities",
  "Intermediate — FSc Pre-Medical",
  "Intermediate — FSc Pre-Engineering",
  "Intermediate — ICS (Computer Science)",
  "Intermediate — I.Com (Commerce)",
  "Cambridge — O-Levels",
  "Cambridge — A-Levels",
];

export function CreateUserDialog({
  open,
  onOpenChange,
  onAddUser,
  existingCount,
}: CreateUserDialogProps) {
  // Category & Role State
  const [category, setCategory] = React.useState<UserCategory>("teacher");
  const [role, setRole] = React.useState<Role>("Teacher");

  // Common Identity State
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [campus, setCampus] = React.useState<string>(CAMPUSES[0].campusName);
  const [status, setStatus] = React.useState<Status>("Active");

  // Credentials & Security
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [requirePasswordChange, setRequirePasswordChange] = React.useState(true);
  const [sendWelcomeEmail, setSendWelcomeEmail] = React.useState(true);
  const [copiedPassword, setCopiedPassword] = React.useState(false);

  // --- Role Specific: Teacher State ---
  const [teacherStaffId, setTeacherStaffId] = React.useState("TCH-2026-0" + (existingCount + 1));
  const [teacherQualification, setTeacherQualification] = React.useState("M.Sc / B.Ed");
  const [selectedSubjects, setSelectedSubjects] = React.useState<string[]>(["Mathematics"]);
  const [customSubjectInput, setCustomSubjectInput] = React.useState("");
  const [selectedClasses, setSelectedClasses] = React.useState<string[]>(["Grade 9", "Grade 10"]);
  const [customClassInput, setCustomClassInput] = React.useState("");
  const [classIncharge, setClassIncharge] = React.useState("None");

  // --- Role Specific: Student State ---
  const [studentRollNo, setStudentRollNo] = React.useState("STD-2026-10" + String(existingCount + 1).padStart(2, "0"));
  const [studentGrade, setStudentGrade] = React.useState("Grade 9");
  const [studentSection, setStudentSection] = React.useState("Section A");
  const [studentStream, setStudentStream] = React.useState(ACADEMIC_STREAMS[1]);
  const [studentGuardianName, setStudentGuardianName] = React.useState("");
  const [studentGuardianPhone, setStudentGuardianPhone] = React.useState("");

  // --- Role Specific: HR Admin State ---
  const [hrEmployeeCode, setHrEmployeeCode] = React.useState("EMP-HR-0" + (existingCount + 1));
  const [hrDesignation, setHrDesignation] = React.useState("HR & Staff Manager");
  const [hrDepartment, setHrDepartment] = React.useState("Human Resources (HR)");
  const [hrGradeTier, setHrGradeTier] = React.useState("Grade M-1 (Executive)");

  // --- Role Specific: Accountant State ---
  const [accStaffId, setAccStaffId] = React.useState("ACC-2026-0" + (existingCount + 1));
  const [accDesignation, setAccDesignation] = React.useState("Senior Accountant");
  const [accCounter, setAccCounter] = React.useState("Main Fee Collection Counter 1");
  const [accPostingLimit, setAccPostingLimit] = React.useState("Up to PKR 250,000 (Standard Vouchers)");

  // --- Role Specific: Parent State ---
  const [parentChildName, setParentChildName] = React.useState("");
  const [parentRelationship, setParentRelationship] = React.useState("Father");
  const [parentCnic, setParentCnic] = React.useState("");
  const [parentOccupation, setParentOccupation] = React.useState("");
  const [parentWhatsappAlerts, setParentWhatsappAlerts] = React.useState(true);

  // --- Role Specific: Administrative State (Principal, Admin, etc.) ---
  const [adminStaffId, setAdminStaffId] = React.useState("ADM-2026-0" + (existingCount + 1));
  const [adminOfficeRoom, setAdminOfficeRoom] = React.useState("Main Administration Wing");
  const [adminDesignation, setAdminDesignation] = React.useState("Campus Administrator");

  // Sync category when role changes directly
  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    if (newRole === "Teacher") setCategory("teacher");
    else if (newRole === "Student") setCategory("student");
    else if (newRole === "HR Admin") setCategory("hr");
    else if (newRole === "Accountant") setCategory("accountant");
    else if (newRole === "Parent") setCategory("parent");
    else setCategory("admin");
  };

  // Sync role when category tab is clicked
  const handleCategorySelect = (newCategory: UserCategory) => {
    setCategory(newCategory);
    if (newCategory === "teacher") setRole("Teacher");
    else if (newCategory === "student") setRole("Student");
    else if (newCategory === "hr") setRole("HR Admin");
    else if (newCategory === "accountant") setRole("Accountant");
    else if (newCategory === "parent") setRole("Parent");
    else if (newCategory === "admin") {
      if (role !== "Campus Admin" && role !== "Principal" && role !== "Super Admin" && role !== "Exam Controller" && role !== "Receptionist" && role !== "IT Support") {
        setRole("Campus Admin");
      }
    }
  };

  // Password Generation Helper
  const generateStrongPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    const special = "@#$!";
    let generated = "Edu";
    for (let i = 0; i < 5; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    generated += special.charAt(Math.floor(Math.random() * special.length));
    generated += String(Math.floor(10 + Math.random() * 89));
    setPassword(generated);
    return generated;
  };

  const handleCopyPassword = () => {
    if (!password) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(password);
      setCopiedPassword(true);
      toast.success("Password Copied", {
        description: "Temporary password copied to clipboard.",
      });
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  // Reset form
  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setCategory("teacher");
    setRole("Teacher");
    setCampus(CAMPUSES[0].campusName);
    setStatus("Active");
    setPassword("");
    setShowPassword(false);
    setRequirePasswordChange(true);
    setSendWelcomeEmail(true);
    setSelectedSubjects(["Mathematics"]);
    setSelectedClasses(["Grade 9", "Grade 10"]);
    setCustomSubjectInput("");
    setCustomClassInput("");
    setStudentGuardianName("");
    setStudentGuardianPhone("");
    setParentChildName("");
    setParentCnic("");
    setParentOccupation("");
  };

  // Subject toggling for teachers
  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleAddCustomSubject = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const trimmed = customSubjectInput.trim();
    if (!trimmed) return;
    if (!selectedSubjects.includes(trimmed)) {
      setSelectedSubjects((prev) => [...prev, trimmed]);
    }
    setCustomSubjectInput("");
  };

  // Class toggling for teachers
  const toggleClass = (cls: string) => {
    setSelectedClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const handleAddCustomClass = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const trimmed = customClassInput.trim();
    if (!trimmed) return;
    if (!selectedClasses.includes(trimmed)) {
      setSelectedClasses((prev) => [...prev, trimmed]);
    }
    setCustomClassInput("");
  };

  // Active Role Config
  const activeRoleConfig = React.useMemo(
    () => ROLES_CATALOG.find((r) => r.role === role) || ROLES_CATALOG[0],
    [role]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter the user's full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid official email address.");
      return;
    }

    // Auto-generate password if blank
    const finalPassword = password.trim() || generateStrongPassword();
    const newUserId = `u-${Date.now()}`;

    // Construct user object with role-specific metadata
    const newUser: User = {
      id: newUserId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      role,
      campus: role === "Super Admin" ? "All Campuses" : campus,
      status,
      lastLogin: "", // Initial account
    };

    // Attach role-tailored attributes
    if (category === "teacher") {
      newUser.department = "Academic Faculty";
      newUser.employeeCode = teacherStaffId;
      newUser.designation = classIncharge !== "None" ? `Faculty (${classIncharge})` : "Teacher / Faculty";
      newUser.assignedSubjects = selectedSubjects.length > 0 ? selectedSubjects.join(", ") : undefined;
      newUser.assignedClasses = selectedClasses.length > 0 ? selectedClasses.join(", ") : undefined;
    } else if (category === "student") {
      newUser.department = `${studentGrade} · ${studentSection}`;
      newUser.studentRollNo = studentRollNo;
      newUser.assignedClasses = `${studentGrade} (${studentSection})`;
      newUser.designation = `Student · ${studentStream}`;
      newUser.guardianName = studentGuardianName.trim() || undefined;
      if (!newUser.phone && studentGuardianPhone.trim()) {
        newUser.phone = studentGuardianPhone.trim();
      }
    } else if (category === "hr") {
      newUser.department = hrDepartment;
      newUser.employeeCode = hrEmployeeCode;
      newUser.designation = hrDesignation;
    } else if (category === "accountant") {
      newUser.department = "Accounts & Finance";
      newUser.employeeCode = accStaffId;
      newUser.designation = `${accDesignation} (${accCounter})`;
    } else if (category === "parent") {
      newUser.department = "Parent Body";
      newUser.designation = `${parentRelationship} (${parentOccupation || "Parent"})`;
      newUser.guardianName = parentChildName.trim() || undefined;
    } else {
      newUser.department = adminOfficeRoom;
      newUser.employeeCode = adminStaffId;
      newUser.designation = adminDesignation || role;
    }

    onAddUser(newUser);

    if (sendWelcomeEmail) {
      toast.info("Welcome Email Dispatched", {
        description: `Login credentials and activation link delivered to ${newUser.email}.`,
      });
    }

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-w-md p-0 overflow-hidden sm:max-w-3xl border border-border shadow-2xl rounded-2xl">
        {/* Header Banner */}
        <DialogHeader className="px-6 pt-5 pb-4 bg-gradient-to-r from-brand-50/80 via-background to-background border-b border-border/70">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-brand text-cream shadow-sm ring-2 ring-brand/20">
              <UserPlus className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-heading font-bold text-foreground">
                Create User & Access Account
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Onboard teachers, students, HR staff, accountants, and parents with role-tailored profiles.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto overflow-x-hidden">
          {/* USER TYPE / CATEGORY SELECTOR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Select Account Type / User Category <span className="text-danger">*</span>
              </label>
              <span className={`text-[10.5px] px-2 py-0.5 rounded-full border font-semibold ${activeRoleConfig.badgeTone}`}>
                Current Role: {role}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {/* Teacher */}
              <button
                type="button"
                onClick={() => handleCategorySelect("teacher")}
                className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  category === "teacher"
                    ? "border-indigo-500 bg-indigo-50/70 text-indigo-900 font-semibold shadow-xs ring-2 ring-indigo-500/20 dark:bg-indigo-950/50 dark:text-indigo-200"
                    : "border-border/80 bg-background hover:bg-muted/50 text-foreground"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${category === "teacher" ? "bg-indigo-600 text-white" : "bg-muted text-muted-foreground"}`}>
                  <GraduationCap className="size-4" />
                </div>
                <span className="text-[11.5px] leading-tight">Teacher / Faculty</span>
              </button>

              {/* Student */}
              <button
                type="button"
                onClick={() => handleCategorySelect("student")}
                className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  category === "student"
                    ? "border-cyan-500 bg-cyan-50/70 text-cyan-900 font-semibold shadow-xs ring-2 ring-cyan-500/20 dark:bg-cyan-950/50 dark:text-cyan-200"
                    : "border-border/80 bg-background hover:bg-muted/50 text-foreground"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${category === "student" ? "bg-cyan-600 text-white" : "bg-muted text-muted-foreground"}`}>
                  <UserIcon className="size-4" />
                </div>
                <span className="text-[11.5px] leading-tight">Student Portal</span>
              </button>

              {/* HR Admin */}
              <button
                type="button"
                onClick={() => handleCategorySelect("hr")}
                className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  category === "hr"
                    ? "border-amber-500 bg-amber-50/70 text-amber-900 font-semibold shadow-xs ring-2 ring-amber-500/20 dark:bg-amber-950/50 dark:text-amber-200"
                    : "border-border/80 bg-background hover:bg-muted/50 text-foreground"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${category === "hr" ? "bg-amber-600 text-white" : "bg-muted text-muted-foreground"}`}>
                  <Briefcase className="size-4" />
                </div>
                <span className="text-[11.5px] leading-tight">HR & Staff</span>
              </button>

              {/* Accountant */}
              <button
                type="button"
                onClick={() => handleCategorySelect("accountant")}
                className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  category === "accountant"
                    ? "border-emerald-500 bg-emerald-50/70 text-emerald-900 font-semibold shadow-xs ring-2 ring-emerald-500/20 dark:bg-emerald-950/50 dark:text-emerald-200"
                    : "border-border/80 bg-background hover:bg-muted/50 text-foreground"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${category === "accountant" ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>
                  <Receipt className="size-4" />
                </div>
                <span className="text-[11.5px] leading-tight">Accountant / Finance</span>
              </button>

              {/* Parent */}
              <button
                type="button"
                onClick={() => handleCategorySelect("parent")}
                className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  category === "parent"
                    ? "border-orange-500 bg-orange-50/70 text-orange-900 font-semibold shadow-xs ring-2 ring-orange-500/20 dark:bg-orange-950/50 dark:text-orange-200"
                    : "border-border/80 bg-background hover:bg-muted/50 text-foreground"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${category === "parent" ? "bg-orange-600 text-white" : "bg-muted text-muted-foreground"}`}>
                  <Users className="size-4" />
                </div>
                <span className="text-[11.5px] leading-tight">Parent / Guardian</span>
              </button>

              {/* Admin / Leadership */}
              <button
                type="button"
                onClick={() => handleCategorySelect("admin")}
                className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  category === "admin"
                    ? "border-brand bg-brand-50/70 text-brand font-semibold shadow-xs ring-2 ring-brand/20 dark:bg-brand-950/50 dark:text-brand-200"
                    : "border-border/80 bg-background hover:bg-muted/50 text-foreground"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${category === "admin" ? "bg-brand text-cream" : "bg-muted text-muted-foreground"}`}>
                  <ShieldCheck className="size-4" />
                </div>
                <span className="text-[11.5px] leading-tight">Administration</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: IDENTITY & BASE PROFILE */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <UserCheck className="size-3.5 text-brand" />
              <span>User Identity & Contact</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    category === "teacher"
                      ? "e.g. Prof. Tariq Mehmood"
                      : category === "student"
                      ? "e.g. Zain Ahmed"
                      : category === "parent"
                      ? "e.g. Kamran Ahmed"
                      : category === "hr"
                      ? "e.g. Nadia Hussain"
                      : "e.g. Engr. Bilal Farooq"
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Official Email / Username <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder={
                    category === "student"
                      ? "zain.ahmed@student.edusphere.pk"
                      : category === "parent"
                      ? "kamran.ahmed@gmail.com"
                      : "user@edusphere.edu.pk"
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Phone / WhatsApp Number
                </label>
                <input
                  type="tel"
                  placeholder="0300-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Campus / Branch Scope <span className="text-danger">*</span>
                </label>
                <Select
                  value={role === "Super Admin" ? "All Campuses" : campus}
                  disabled={role === "Super Admin"}
                  onValueChange={(val) => {
                    if (val) setCampus(val);
                  }}
                >
                  <SelectTrigger className="w-full h-9 text-xs bg-background">
                    <SelectValue placeholder="Select Campus Scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Campuses" className="text-xs font-semibold text-brand">
                      All Campuses (Central Access)
                    </SelectItem>
                    {CAMPUSES.map((c) => (
                      <SelectItem key={c.id} value={c.campusName} className="text-xs">
                        {formatCampusDisplay(c.campusName).primary}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* SECTION 2: CONTEXTUAL ROLE-SPECIFIC FORM */}

          {/* === A) TEACHER FORM === */}
          {category === "teacher" && (
            <div className="p-4 rounded-xl border border-indigo-200/90 bg-indigo-50/30 dark:bg-indigo-950/20 dark:border-indigo-800/60 space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-200/70 pb-2">
                <div className="flex items-center gap-2">
                  <div className="grid size-7 place-items-center rounded-lg bg-indigo-600 text-white">
                    <GraduationCap className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      Teacher Academic Profile & Subject Assignments
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Assign faculty code, teaching subjects, grades, and class teacher incharge status.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Faculty / Staff ID</label>
                  <input
                    type="text"
                    value={teacherStaffId}
                    onChange={(e) => setTeacherStaffId(e.target.value)}
                    placeholder="e.g. TCH-2026-042"
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Highest Academic Qualification</label>
                  <input
                    type="text"
                    value={teacherQualification}
                    onChange={(e) => setTeacherQualification(e.target.value)}
                    placeholder="e.g. M.Sc Mathematics, B.Ed"
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Teaching Subjects */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">
                    Assigned Teaching Subjects ({selectedSubjects.length} selected)
                  </label>
                  <span className="text-[10.5px] text-muted-foreground">Click to toggle or type below</span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 rounded-lg border border-border/70 bg-background/80">
                  {COMMON_SUBJECTS.map((sub) => {
                    const active = selectedSubjects.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleSubject(sub)}
                        className={`text-xs px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                          active
                            ? "bg-indigo-600 text-white border-indigo-600 font-medium"
                            : "bg-muted/40 text-foreground hover:bg-muted border-border/80"
                        }`}
                      >
                        {active && <Check className="inline-block size-3 mr-1" />}
                        {sub}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Subject Adder */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSubjectInput}
                    onChange={(e) => setCustomSubjectInput(e.target.value)}
                    onKeyDown={handleAddCustomSubject}
                    placeholder="Add other subject (e.g. Arabic, Art & Design, Ethics)..."
                    className="flex-1 h-8 px-3 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-indigo-500/30"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCustomSubject}
                    className="h-8 text-xs cursor-pointer gap-1"
                  >
                    <Plus className="size-3" />
                    <span>Add</span>
                  </Button>
                </div>
              </div>

              {/* Assigned Grades & Classes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">
                    Assigned Classes & Sections ({selectedClasses.length} selected)
                  </label>
                </div>

                <div className="flex flex-wrap gap-1.5 p-1.5 rounded-lg border border-border/70 bg-background/80">
                  {COMMON_GRADES.map((cls) => {
                    const active = selectedClasses.includes(cls);
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => toggleClass(cls)}
                        className={`text-xs px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                          active
                            ? "bg-indigo-600 text-white border-indigo-600 font-medium"
                            : "bg-muted/40 text-foreground hover:bg-muted border-border/80"
                        }`}
                      >
                        {active && <Check className="inline-block size-3 mr-1" />}
                        {cls}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customClassInput}
                    onChange={(e) => setCustomClassInput(e.target.value)}
                    onKeyDown={handleAddCustomClass}
                    placeholder="Specific section (e.g. Grade 9-A, Grade 10-C)..."
                    className="flex-1 h-8 px-3 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-indigo-500/30"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCustomClass}
                    className="h-8 text-xs cursor-pointer gap-1"
                  >
                    <Plus className="size-3" />
                    <span>Add</span>
                  </Button>
                </div>
              </div>

              {/* Class Teacher Incharge Selection */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Class Teacher / Incharge Appointment
                </label>
                <Select value={classIncharge} onValueChange={(val) => val && setClassIncharge(val)}>
                  <SelectTrigger className="w-full h-9 text-xs bg-background">
                    <SelectValue placeholder="Select Incharge Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None" className="text-xs">
                      Not a Class Incharge (Subject Teacher Only)
                    </SelectItem>
                    <SelectItem value="Grade 8-A Incharge" className="text-xs">
                      Class Incharge — Grade 8-A
                    </SelectItem>
                    <SelectItem value="Grade 9-A Incharge" className="text-xs">
                      Class Incharge — Grade 9-A
                    </SelectItem>
                    <SelectItem value="Grade 9-B Incharge" className="text-xs">
                      Class Incharge — Grade 9-B
                    </SelectItem>
                    <SelectItem value="Grade 10-A Incharge" className="text-xs">
                      Class Incharge — Grade 10-A
                    </SelectItem>
                    <SelectItem value="Grade 10-B Incharge" className="text-xs">
                      Class Incharge — Grade 10-B
                    </SelectItem>
                    <SelectItem value="Grade 11-A Incharge" className="text-xs">
                      Class Incharge — Grade 11-A (Pre-Medical)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* === B) STUDENT FORM === */}
          {category === "student" && (
            <div className="p-4 rounded-xl border border-cyan-200/90 bg-cyan-50/30 dark:bg-cyan-950/20 dark:border-cyan-800/60 space-y-4">
              <div className="flex items-center justify-between border-b border-cyan-200/70 pb-2">
                <div className="flex items-center gap-2">
                  <div className="grid size-7 place-items-center rounded-lg bg-cyan-600 text-white">
                    <UserIcon className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      Student Academic Profile & Guardian Linkage
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Assign student roll number, enrolled class, section, stream, and guardian contact.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground">
                      Student Roll / Admission ID <span className="text-danger">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setStudentRollNo("STD-2026-" + Math.floor(1000 + Math.random() * 9000))}
                      className="text-[10.5px] text-cyan-700 dark:text-cyan-400 hover:underline cursor-pointer"
                    >
                      Regenerate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={studentRollNo}
                    onChange={(e) => setStudentRollNo(e.target.value)}
                    placeholder="e.g. STD-2026-1049"
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Academic Stream / Group</label>
                  <Select value={studentStream} onValueChange={(val) => val && setStudentStream(val)}>
                    <SelectTrigger className="w-full h-9 text-xs bg-background">
                      <SelectValue placeholder="Select Stream" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACADEMIC_STREAMS.map((st) => (
                        <SelectItem key={st} value={st} className="text-xs">
                          {st}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Enrolled Class / Grade</label>
                  <Select value={studentGrade} onValueChange={(val) => val && setStudentGrade(val)}>
                    <SelectTrigger className="w-full h-9 text-xs bg-background">
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_GRADES.map((g) => (
                        <SelectItem key={g} value={g} className="text-xs">
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Assigned Section</label>
                  <Select value={studentSection} onValueChange={(val) => val && setStudentSection(val)}>
                    <SelectTrigger className="w-full h-9 text-xs bg-background">
                      <SelectValue placeholder="Select Section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Section A" className="text-xs">Section A (Rose)</SelectItem>
                      <SelectItem value="Section B" className="text-xs">Section B (Tulip)</SelectItem>
                      <SelectItem value="Section C" className="text-xs">Section C (Jasmine)</SelectItem>
                      <SelectItem value="Section D" className="text-xs">Section D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 border-t border-cyan-200/50">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Father / Guardian Name</label>
                  <input
                    type="text"
                    value={studentGuardianName}
                    onChange={(e) => setStudentGuardianName(e.target.value)}
                    placeholder="e.g. Muhammad Tariq Mehmood"
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Guardian Emergency Phone</label>
                  <input
                    type="tel"
                    value={studentGuardianPhone}
                    onChange={(e) => setStudentGuardianPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* === C) HR & STAFF FORM === */}
          {category === "hr" && (
            <div className="p-4 rounded-xl border border-amber-200/90 bg-amber-50/30 dark:bg-amber-950/20 dark:border-amber-800/60 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200/70 pb-2">
                <div className="flex items-center gap-2">
                  <div className="grid size-7 place-items-center rounded-lg bg-amber-600 text-white">
                    <Briefcase className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      HR & Staff Personnel Profile
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Set employee code, official HR designation, department wing, and managerial tier.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">HR Employee Code</label>
                  <input
                    type="text"
                    value={hrEmployeeCode}
                    onChange={(e) => setHrEmployeeCode(e.target.value)}
                    placeholder="e.g. EMP-HR-014"
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Official Designation</label>
                  <input
                    type="text"
                    value={hrDesignation}
                    onChange={(e) => setHrDesignation(e.target.value)}
                    placeholder="e.g. HR & Recruitment Manager"
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Assigned Department Wing</label>
                  <Select value={hrDepartment} onValueChange={(val) => val && setHrDepartment(val)}>
                    <SelectTrigger className="w-full h-9 text-xs bg-background">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Human Resources (HR)" className="text-xs">Human Resources (HR)</SelectItem>
                      <SelectItem value="Personnel & Recruitment Cell" className="text-xs">Personnel & Recruitment Cell</SelectItem>
                      <SelectItem value="Faculty Payroll & Welfare" className="text-xs">Faculty Payroll & Welfare</SelectItem>
                      <SelectItem value="General Administration" className="text-xs">General Administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Administrative Scale / Grade</label>
                  <Select value={hrGradeTier} onValueChange={(val) => val && setHrGradeTier(val)}>
                    <SelectTrigger className="w-full h-9 text-xs bg-background">
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Grade M-1 (Executive)" className="text-xs">Grade M-1 (Executive Directorate)</SelectItem>
                      <SelectItem value="Grade M-2 (Managerial)" className="text-xs">Grade M-2 (Managerial Head)</SelectItem>
                      <SelectItem value="Officer Scale BPS-17" className="text-xs">Officer Scale BPS-17</SelectItem>
                      <SelectItem value="Officer Scale BPS-16" className="text-xs">Officer Scale BPS-16</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* === D) ACCOUNTANT / FINANCE FORM === */}
          {category === "accountant" && (
            <div className="p-4 rounded-xl border border-emerald-200/90 bg-emerald-50/30 dark:bg-emerald-950/20 dark:border-emerald-800/60 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-200/70 pb-2">
                <div className="flex items-center gap-2">
                  <div className="grid size-7 place-items-center rounded-lg bg-emerald-600 text-white">
                    <Receipt className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      Accounts & Finance Officer Profile
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Configure fee counters, accounts ledger permissions, and voucher limits.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Accounts Staff ID</label>
                  <input
                    type="text"
                    value={accStaffId}
                    onChange={(e) => setAccStaffId(e.target.value)}
                    placeholder="e.g. ACC-2026-004"
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Finance Designation</label>
                  <Select value={accDesignation} onValueChange={(val) => val && setAccDesignation(val)}>
                    <SelectTrigger className="w-full h-9 text-xs bg-background">
                      <SelectValue placeholder="Select Designation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Senior Accountant" className="text-xs">Senior Accountant</SelectItem>
                      <SelectItem value="Fee Collection Cashier" className="text-xs">Fee Collection Cashier</SelectItem>
                      <SelectItem value="Accounts & Ledger Officer" className="text-xs">Accounts & Ledger Officer</SelectItem>
                      <SelectItem value="Internal Financial Auditor" className="text-xs">Internal Financial Auditor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Assigned Fee Counter / Desk</label>
                  <Select value={accCounter} onValueChange={(val) => val && setAccCounter(val)}>
                    <SelectTrigger className="w-full h-9 text-xs bg-background">
                      <SelectValue placeholder="Select Counter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Main Fee Collection Counter 1" className="text-xs">Main Fee Collection Counter 1</SelectItem>
                      <SelectItem value="Fee Collection Counter 2" className="text-xs">Fee Collection Counter 2</SelectItem>
                      <SelectItem value="Accounts Directorate — Desk A" className="text-xs">Accounts Directorate — Desk A</SelectItem>
                      <SelectItem value="Student Billing & Challans Cell" className="text-xs">Student Billing & Challans Cell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Authorized Posting Limit</label>
                  <Select value={accPostingLimit} onValueChange={(val) => val && setAccPostingLimit(val)}>
                    <SelectTrigger className="w-full h-9 text-xs bg-background">
                      <SelectValue placeholder="Select Limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Up to PKR 50,000 (Daily Counter Receipts)" className="text-xs">
                        Up to PKR 50,000 (Daily Counter Receipts)
                      </SelectItem>
                      <SelectItem value="Up to PKR 250,000 (Standard Vouchers)" className="text-xs">
                        Up to PKR 250,000 (Standard Vouchers)
                      </SelectItem>
                      <SelectItem value="Unlimited Institutional Ledgers & Bank Reconciliation" className="text-xs">
                        Unlimited Ledgers & Bank Reconciliation
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* === E) PARENT / GUARDIAN FORM === */}
          {category === "parent" && (
            <div className="p-4 rounded-xl border border-orange-200/90 bg-orange-50/30 dark:bg-orange-950/20 dark:border-orange-800/60 space-y-4">
              <div className="flex items-center justify-between border-b border-orange-200/70 pb-2">
                <div className="flex items-center gap-2">
                  <div className="grid size-7 place-items-center rounded-lg bg-orange-600 text-white">
                    <Users className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      Parent / Guardian Portal & Student Linkage
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Link parent portal account to child admission records, CNIC verification, and alerts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Linked Student(s) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={parentChildName}
                    onChange={(e) => setParentChildName(e.target.value)}
                    placeholder="e.g. STD-2026-1049 (Zain Ahmed)"
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Relationship to Student</label>
                  <Select value={parentRelationship} onValueChange={(val) => val && setParentRelationship(val)}>
                    <SelectTrigger className="w-full h-9 text-xs bg-background">
                      <SelectValue placeholder="Select Relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Father" className="text-xs">Father</SelectItem>
                      <SelectItem value="Mother" className="text-xs">Mother</SelectItem>
                      <SelectItem value="Legal Guardian / Uncle" className="text-xs">Legal Guardian / Uncle</SelectItem>
                      <SelectItem value="Elder Sibling" className="text-xs">Elder Sibling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">CNIC / National Identity No</label>
                  <input
                    type="text"
                    value={parentCnic}
                    onChange={(e) => setParentCnic(e.target.value)}
                    placeholder="35202-1234567-1"
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Parent Profession / Occupation</label>
                  <input
                    type="text"
                    value={parentOccupation}
                    onChange={(e) => setParentOccupation(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={parentWhatsappAlerts}
                  onChange={(e) => setParentWhatsappAlerts(e.target.checked)}
                  className="size-4 rounded border-border text-orange-600 focus:ring-orange-500/30 accent-orange-600 cursor-pointer"
                />
                <span className="text-xs text-foreground font-medium">
                  Enable instant WhatsApp & SMS notifications for child attendance and fee vouchers
                </span>
              </label>
            </div>
          )}

          {/* === F) ADMINISTRATION FORM (PRINCIPAL, CAMPUS ADMIN, SUPER ADMIN, ETC) === */}
          {category === "admin" && (
            <div className="p-4 rounded-xl border border-brand/25 bg-brand-50/20 dark:bg-brand-950/20 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-brand/15 pb-2">
                <div className="flex items-center gap-2">
                  <div className="grid size-7 place-items-center rounded-lg bg-brand text-cream">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      Administrative & Institutional Leadership Profile
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Select specific administrative role, office cell, and institutional scope.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Administrative System Role <span className="text-danger">*</span>
                  </label>
                  <Select value={role} onValueChange={(val) => val && handleRoleChange(val as Role)}>
                    <SelectTrigger className="w-full h-9 text-xs bg-background">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Campus Admin" className="text-xs font-medium">Campus Admin</SelectItem>
                      <SelectItem value="Principal" className="text-xs font-medium">Principal / Head of School</SelectItem>
                      <SelectItem value="Super Admin" className="text-xs font-medium text-red-600">Super Admin (All Campuses)</SelectItem>
                      <SelectItem value="Exam Controller" className="text-xs font-medium">Examination Controller</SelectItem>
                      <SelectItem value="Receptionist" className="text-xs font-medium">Receptionist / Front Desk</SelectItem>
                      <SelectItem value="IT Support" className="text-xs font-medium">IT Support / Systems Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Official Staff / Admin ID</label>
                  <input
                    type="text"
                    value={adminStaffId}
                    onChange={(e) => setAdminStaffId(e.target.value)}
                    placeholder="e.g. ADM-2026-001"
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Office Cell / Room</label>
                  <input
                    type="text"
                    value={adminOfficeRoom}
                    onChange={(e) => setAdminOfficeRoom(e.target.value)}
                    placeholder="e.g. Principal Secretariat — Block A"
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Official Job Title</label>
                  <input
                    type="text"
                    value={adminDesignation}
                    onChange={(e) => setAdminDesignation(e.target.value)}
                    placeholder="e.g. Head of Institution / Vice Principal"
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>
              </div>

              {/* Granted Scope tags */}
              <div className="rounded-lg border border-border/60 bg-background/90 p-3 space-y-2 text-xs">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {activeRoleConfig.description}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider mr-1">
                    Granted Permissions:
                  </span>
                  {activeRoleConfig.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-medium bg-muted text-foreground border border-border/70"
                    >
                      <Check className="size-3 text-emerald-600" />
                      <span>{perm}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: CREDENTIALS & SECURITY */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Key className="size-3.5 text-brand" />
              <span>Authentication & Credentials</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Password Input & Generator */}
              <div className="sm:col-span-2 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">
                    Initial Password <span className="text-[10.5px] text-muted-foreground">(Leave blank to auto-generate)</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    className="text-[10.5px] font-semibold text-brand hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="size-3" />
                    <span>Generate Strong</span>
                  </button>
                </div>

                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter or generate temporary password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-9 pl-3 pr-20 rounded-lg border border-border bg-background text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                  />
                  <div className="absolute right-1.5 flex items-center gap-1">
                    {password && (
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="p-1 text-muted-foreground hover:text-foreground cursor-pointer rounded"
                        title="Copy password"
                      >
                        {copiedPassword ? (
                          <Check className="size-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-muted-foreground hover:text-foreground cursor-pointer rounded"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Account Status</label>
                <Select
                  value={status}
                  onValueChange={(val) => {
                    if (val) setStatus(val as Status);
                  }}
                >
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active" className="text-xs font-semibold text-emerald-600">
                      Active
                    </SelectItem>
                    <SelectItem value="Pending" className="text-xs font-semibold text-amber-600">
                      Pending Verification
                    </SelectItem>
                    <SelectItem value="Inactive" className="text-xs font-medium text-muted-foreground">
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Enterprise Security Checkboxes */}
            <div className="space-y-2 pt-1 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={requirePasswordChange}
                  onChange={(e) => setRequirePasswordChange(e.target.checked)}
                  className="size-4 rounded border-border text-brand focus:ring-brand/30 accent-brand cursor-pointer"
                />
                <span className="text-foreground font-medium">
                  Require user to change password on first login
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sendWelcomeEmail}
                  onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                  className="size-4 rounded border-border text-brand focus:ring-brand/30 accent-brand cursor-pointer"
                />
                <span className="text-foreground font-medium">
                  Send welcome email with credentials & portal access guidelines
                </span>
              </label>
            </div>
          </div>

          {/* Dialog Footer Actions */}
          <DialogFooter className="pt-4 border-t border-border/60 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-brand text-cream hover:bg-brand-600 text-xs px-5 cursor-pointer shadow-sm font-semibold"
            >
              Create {category === "teacher" ? "Teacher" : category === "student" ? "Student" : category === "hr" ? "HR Staff" : category === "accountant" ? "Accountant" : category === "parent" ? "Parent" : "User"} Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
