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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { CAMPUSES } from "@/lib/mock/institution";
import { formatCampusDisplay, formatDateTime, initials } from "@/lib/format";
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
  Lock,
  Mail,
  Pencil,
  Phone,
  Plus,
  Receipt,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateUser: (updatedUser: User) => void;
  onStatusChange?: (id: string, newStatus: Status) => void;
}

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

const ALL_ROLES: Role[] = [
  "Teacher",
  "Student",
  "HR Admin",
  "Accountant",
  "Parent",
  "Campus Admin",
  "Principal",
  "Super Admin",
  "Exam Controller",
  "Receptionist",
  "IT Support",
];

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onUpdateUser,
  onStatusChange,
}: EditUserDialogProps) {
  // Tabs: profile | security
  const [activeTab, setActiveTab] = React.useState<"profile" | "security">("profile");

  // Core Identity State
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [role, setRole] = React.useState<Role>("Teacher");
  const [campus, setCampus] = React.useState<string>(CAMPUSES[0].campusName);
  const [status, setStatus] = React.useState<Status>("Active");

  // Extended Contextual Fields
  const [department, setDepartment] = React.useState("");
  const [designation, setDesignation] = React.useState("");
  const [employeeCode, setEmployeeCode] = React.useState("");
  const [studentRollNo, setStudentRollNo] = React.useState("");
  const [guardianName, setGuardianName] = React.useState("");
  const [selectedSubjects, setSelectedSubjects] = React.useState<string[]>([]);
  const [customSubjectInput, setCustomSubjectInput] = React.useState("");
  const [selectedClasses, setSelectedClasses] = React.useState<string[]>([]);
  const [customClassInput, setCustomClassInput] = React.useState("");

  // Password Reset State
  const [newPassword, setNewPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [requirePasswordChange, setRequirePasswordChange] = React.useState(false);
  const [sendResetEmail, setSendResetEmail] = React.useState(true);
  const [copiedPassword, setCopiedPassword] = React.useState(false);

  // Sync state whenever the selected user changes
  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
      setRole(user.role);
      setCampus(user.campus || CAMPUSES[0].campusName);
      setStatus(user.status);
      setDepartment(user.department || "");
      setDesignation(user.designation || "");
      setEmployeeCode(user.employeeCode || "");
      setStudentRollNo(user.studentRollNo || "");
      setGuardianName(user.guardianName || "");

      if (user.assignedSubjects) {
        setSelectedSubjects(
          user.assignedSubjects.split(",").map((s) => s.trim()).filter(Boolean)
        );
      } else {
        setSelectedSubjects(user.role === "Teacher" ? ["Mathematics"] : []);
      }

      if (user.assignedClasses) {
        setSelectedClasses(
          user.assignedClasses.split(",").map((s) => s.trim()).filter(Boolean)
        );
      } else {
        setSelectedClasses(user.role === "Teacher" ? ["Grade 9", "Grade 10"] : []);
      }

      setNewPassword("");
      setShowPassword(false);
      setRequirePasswordChange(false);
      setSendResetEmail(true);
      setActiveTab("profile");
    }
  }, [user]);

  if (!user) return null;

  // Toggle helpers for subjects & classes
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

  const generateStrongPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    const special = "@#$!";
    let generated = "Edu";
    for (let i = 0; i < 5; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    generated += special.charAt(Math.floor(Math.random() * special.length));
    generated += String(Math.floor(10 + Math.random() * 89));
    setNewPassword(generated);
    return generated;
  };

  const handleCopyPassword = () => {
    if (!newPassword) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(newPassword);
      setCopiedPassword(true);
      toast.success("Password Copied", {
        description: "Temporary reset password copied to clipboard.",
      });
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const isSuperAdmin = user.role === "Super Admin";

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSuperAdmin) {
      toast.error("Protected Account", {
        description: "Super Admin accounts cannot be modified or changed.",
      });
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter the user's name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const updatedUser: User = {
      ...user,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      role,
      campus: role === "Super Admin" ? "All Campuses" : campus,
      status,
      department: department.trim() || undefined,
      designation: designation.trim() || undefined,
      employeeCode: employeeCode.trim() || undefined,
      studentRollNo: studentRollNo.trim() || undefined,
      guardianName: guardianName.trim() || undefined,
      assignedSubjects:
        selectedSubjects.length > 0 ? selectedSubjects.join(", ") : undefined,
      assignedClasses:
        selectedClasses.length > 0 ? selectedClasses.join(", ") : undefined,
    };

    onUpdateUser(updatedUser);

    if (newPassword.trim()) {
      toast.info("Password Reset Applied", {
        description: sendResetEmail
          ? `New credentials generated and dispatched to ${updatedUser.email}.`
          : `New password configured for ${updatedUser.name}.`,
      });
    }

    toast.success("User Profile Updated", {
      description: `${updatedUser.name} (${updatedUser.role}) changes saved successfully.`,
    });

    onOpenChange(false);
  };

  const campusInfo = formatCampusDisplay(user.campus);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden sm:max-w-2xl border border-border shadow-2xl rounded-2xl">
        {/* Banner Header with User Overview */}
        <DialogHeader className="px-6 pt-5 pb-4 bg-gradient-to-r from-muted/60 via-background to-background border-b border-border/70 pr-12">
          <div className="flex items-center gap-3.5">
            <div className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand font-heading text-sm font-bold ring-1 ring-brand/20 shadow-2xs">
              {initials(name || user.name)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-base font-heading font-bold text-foreground">
                  {name || user.name}
                </DialogTitle>
                <StatusBadge status={status} />
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[11px] font-medium text-foreground">
                  {user.email}
                </span>
                <span>·</span>
                <span>{campusInfo.primary}</span>
                {user.lastLogin && (
                  <>
                    <span>·</span>
                    <span className="tabular-nums">
                      Last Login: {formatDateTime(user.lastLogin)}
                    </span>
                  </>
                )}
              </DialogDescription>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 pt-3">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === "profile"
                  ? "bg-brand text-cream shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Account Profile & Assignments
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === "security"
                  ? "bg-brand text-cream shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Security, Status & Password
            </button>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSave} className="px-6 py-5 space-y-5 max-h-[72vh] overflow-y-auto overflow-x-hidden">
          {isSuperAdmin && (
            <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/80 text-red-950 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-200 text-xs flex items-start gap-2.5 shadow-2xs">
              <ShieldAlert className="size-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-red-900 dark:text-red-100">
                  Protected Super Admin Account
                </p>
                <p className="text-[11.5px] text-red-700 dark:text-red-300 leading-relaxed">
                  Super Admin is the root institutional account. Its credentials, role, campus scope, and operational status are permanently protected against modifications, password overrides, and deactivation.
                </p>
              </div>
            </div>
          )}

          <fieldset disabled={isSuperAdmin} className="min-w-0 w-full space-y-5 group-disabled:opacity-85 border-0 p-0 m-0">
          {activeTab === "profile" && (
            <div className="space-y-4 min-w-0">
              {/* Core User Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Official Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 min-w-0">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Contact Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">System Role</label>
                  <Select value={role} onValueChange={(val) => val && setRole(val as Role)}>
                    <SelectTrigger className="w-full h-9 text-xs bg-background">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_ROLES.map((r) => (
                        <SelectItem key={r} value={r} className="text-xs">
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Campus Scope</label>
                  <Select
                    value={role === "Super Admin" ? "All Campuses" : campus}
                    disabled={role === "Super Admin"}
                    onValueChange={(val) => val && setCampus(val)}
                  >
                    <SelectTrigger className="w-full h-9 text-xs bg-background">
                      <SelectValue placeholder="Select Campus" />
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

              {/* Contextual Section for Teachers */}
              {role === "Teacher" && (
                <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/30 dark:bg-indigo-950/20 dark:border-indigo-800 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="size-4 text-indigo-600" />
                    <span className="text-xs font-semibold text-foreground">
                      Teacher Academic Assignments
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-foreground">Staff ID</label>
                      <input
                        type="text"
                        value={employeeCode}
                        onChange={(e) => setEmployeeCode(e.target.value)}
                        placeholder="e.g. TCH-041"
                        className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-mono text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-foreground">Designation / Incharge</label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Faculty (Grade 10-A Incharge)"
                        className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground"
                      />
                    </div>
                  </div>

                  {/* Teaching Subjects */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-foreground">
                      Assigned Subjects ({selectedSubjects.length})
                    </label>
                    <div className="flex flex-wrap gap-1 p-1 rounded-lg border border-border bg-background/80 max-h-24 overflow-y-auto">
                      {COMMON_SUBJECTS.map((sub) => {
                        const active = selectedSubjects.includes(sub);
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => toggleSubject(sub)}
                            className={`text-[11px] px-2 py-0.5 rounded border transition-all cursor-pointer ${
                              active
                                ? "bg-indigo-600 text-white border-indigo-600 font-medium"
                                : "bg-muted text-foreground hover:bg-muted/80 border-border/80"
                            }`}
                          >
                            {active && <Check className="inline-block size-2.5 mr-1" />}
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customSubjectInput}
                        onChange={(e) => setCustomSubjectInput(e.target.value)}
                        onKeyDown={handleAddCustomSubject}
                        placeholder="Add other subject..."
                        className="flex-1 h-7 px-2.5 rounded-lg border border-border bg-background text-xs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={handleAddCustomSubject}
                        className="h-7 text-xs cursor-pointer"
                      >
                        <Plus className="size-3" />
                        <span>Add</span>
                      </Button>
                    </div>
                  </div>

                  {/* Assigned Classes */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-foreground">
                      Assigned Classes ({selectedClasses.length})
                    </label>
                    <div className="flex flex-wrap gap-1 p-1 rounded-lg border border-border bg-background/80">
                      {COMMON_GRADES.map((cls) => {
                        const active = selectedClasses.includes(cls);
                        return (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => toggleClass(cls)}
                            className={`text-[11px] px-2 py-0.5 rounded border transition-all cursor-pointer ${
                              active
                                ? "bg-indigo-600 text-white border-indigo-600 font-medium"
                                : "bg-muted text-foreground hover:bg-muted/80 border-border/80"
                            }`}
                          >
                            {active && <Check className="inline-block size-2.5 mr-1" />}
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
                        placeholder="Add custom class (e.g. Grade 9-B)..."
                        className="flex-1 h-7 px-2.5 rounded-lg border border-border bg-background text-xs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={handleAddCustomClass}
                        className="h-7 text-xs cursor-pointer"
                      >
                        <Plus className="size-3" />
                        <span>Add</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Contextual Section for Students */}
              {role === "Student" && (
                <div className="p-3.5 rounded-xl border border-cyan-200 bg-cyan-50/30 dark:bg-cyan-950/20 dark:border-cyan-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <UserIcon className="size-4 text-cyan-600" />
                    <span className="text-xs font-semibold text-foreground">
                      Student Academic & Guardian Information
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-foreground">Roll / Admission No</label>
                      <input
                        type="text"
                        value={studentRollNo}
                        onChange={(e) => setStudentRollNo(e.target.value)}
                        placeholder="STD-2026-1049"
                        className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-mono text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-foreground">Academic Stream / Group</label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Student · Matric Science"
                        className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-foreground">Enrolled Class & Section</label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Grade 10 (Section A)"
                        className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-foreground">Guardian / Father Name</label>
                      <input
                        type="text"
                        value={guardianName}
                        onChange={(e) => setGuardianName(e.target.value)}
                        placeholder="e.g. Kamran Ahmed"
                        className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contextual Section for Parents */}
              {role === "Parent" && (
                <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/30 dark:bg-orange-950/20 dark:border-orange-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-orange-600" />
                    <span className="text-xs font-semibold text-foreground">
                      Parent / Guardian Information
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-foreground">Linked Student Record(s)</label>
                      <input
                        type="text"
                        value={guardianName}
                        onChange={(e) => setGuardianName(e.target.value)}
                        placeholder="e.g. Zain Ahmed (STD-1049)"
                        className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-foreground">Relationship & Profession</label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Father (Business Executive)"
                        className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contextual Section for HR, Accounts, Admin */}
              {role !== "Teacher" && role !== "Student" && role !== "Parent" && (
                <div className="p-3.5 rounded-xl border border-brand/25 bg-brand-50/20 dark:bg-brand-950/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="size-4 text-brand" />
                    <span className="text-xs font-semibold text-foreground">
                      Staff & Operational Details
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-foreground">Staff ID / Code</label>
                      <input
                        type="text"
                        value={employeeCode}
                        onChange={(e) => setEmployeeCode(e.target.value)}
                        placeholder="e.g. EMP-HR-002"
                        className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-mono text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-foreground">Designation</label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Senior HR Manager"
                        className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-foreground">Department / Cell</label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Human Resources"
                        className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-5">
              {/* Account Status Control */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">Account Access Status</h4>
                    <p className="text-[11px] text-muted-foreground">
                      Control whether this user is allowed to authenticate and access their portal.
                    </p>
                  </div>
                  <StatusBadge status={status} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setStatus("Active")}
                    className={`p-2 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer ${
                      status === "Active"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : "border-border bg-background hover:bg-muted text-foreground"
                    }`}
                  >
                    Active
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("Inactive")}
                    className={`p-2 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer ${
                      status === "Inactive"
                        ? "border-slate-500 bg-slate-100 text-slate-800 font-semibold ring-1 ring-slate-500 dark:bg-slate-800 dark:text-slate-200"
                        : "border-border bg-background hover:bg-muted text-foreground"
                    }`}
                  >
                    Inactive
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("Suspended")}
                    className={`p-2 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer ${
                      status === "Suspended"
                        ? "border-red-500 bg-red-50 text-red-800 font-semibold ring-1 ring-red-500 dark:bg-red-950/50 dark:text-red-300"
                        : "border-border bg-background hover:bg-muted text-foreground"
                    }`}
                  >
                    Suspended
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("Pending")}
                    className={`p-2 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer ${
                      status === "Pending"
                        ? "border-amber-500 bg-amber-50 text-amber-800 font-semibold ring-1 ring-amber-500 dark:bg-amber-950/50 dark:text-amber-300"
                        : "border-border bg-background hover:bg-muted text-foreground"
                    }`}
                  >
                    Pending
                  </button>
                </div>
              </div>

              {/* Password Reset Section */}
              <div className="p-4 rounded-xl border border-border bg-background space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="size-4 text-brand" />
                    <span className="text-xs font-semibold text-foreground">
                      Reset Password / Generate Temporary Credentials
                    </span>
                  </div>
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
                    placeholder="Enter new password or leave blank to keep unchanged..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-9 pl-3 pr-20 rounded-lg border border-border bg-background text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                  <div className="absolute right-1.5 flex items-center gap-1">
                    {newPassword && (
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

                {newPassword && (
                  <p className="text-[11px] text-emerald-600 font-medium">
                    New password entered. Click &ldquo;Save Changes&rdquo; below to update the account.
                  </p>
                )}

                <div className="space-y-2 pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={requirePasswordChange}
                      onChange={(e) => setRequirePasswordChange(e.target.checked)}
                      className="size-4 rounded border-border text-brand focus:ring-brand/30 accent-brand cursor-pointer"
                    />
                    <span className="text-foreground font-medium">
                      Require user to change password on their next login
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sendResetEmail}
                      onChange={(e) => setSendResetEmail(e.target.checked)}
                      className="size-4 rounded border-border text-brand focus:ring-brand/30 accent-brand cursor-pointer"
                    />
                    <span className="text-foreground font-medium">
                      Send email alert to user with updated credentials
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
          </fieldset>

          {/* Footer Actions */}
          <DialogFooter className="pt-4 border-t border-border/60 flex items-center justify-between sm:justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs cursor-pointer"
            >
              {isSuperAdmin ? "Close" : "Cancel"}
            </Button>
            {!isSuperAdmin && (
              <Button
                type="submit"
                size="sm"
                className="bg-brand text-cream hover:bg-brand-600 text-xs px-5 cursor-pointer shadow-sm font-semibold"
              >
                Save Changes
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
