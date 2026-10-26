"use client";

import * as React from "react";
import {
  Check,
  GraduationCap,
  KeyRound,
  Landmark,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionButton } from "@/components/shared/action-button";
import type {
  StaffAccountRecord,
  StaffPortalRole,
  StudentAccountRecord,
} from "@/lib/mock/accounts";

const CAMPUS_OPTIONS = [
  "Gulberg",
  "DHA Phase 5",
  "F-8 Islamabad",
  "Clifton",
  "Bahria Town",
];

const CLASS_OPTIONS = [
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

const PORTAL_ROLES: StaffPortalRole[] = [
  "Teacher Portal",
  "HOD / Academic Coordinator",
  "Campus Admin Portal",
  "Finance & Accounts Portal",
  "HR & Staff Admin",
  "Staff Self-Service",
];

function makeSmartPassword(prefix: "Std" | "Prt" | "Stf", name: string): string {
  const clean =
    name
      .replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "")
      .replace(/[^a-zA-Z]/g, "")
      .slice(0, 5) || "User";
  const token = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  const num = Math.floor(100 + Math.random() * 899);
  return `${prefix}@${token}#${num}`;
}

/* ───────────────────── Student & Parent Account Form Modal ───────────────────── */

interface StudentAccountFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: StudentAccountRecord | null;
  totalCount: number;
  onSave: (record: StudentAccountRecord) => void;
}

export function StudentAccountFormModal({
  open,
  onOpenChange,
  initialData,
  totalCount,
  onSave,
}: StudentAccountFormModalProps) {
  const isEditing = Boolean(initialData);

  const [studentName, setStudentName] = React.useState("");
  const [rollNo, setRollNo] = React.useState("");
  const [admissionNumber, setAdmissionNumber] = React.useState("");
  const [className, setClassName] = React.useState("Grade 9");
  const [section, setSection] = React.useState("A");
  const [campus, setCampus] = React.useState("Gulberg");
  const [studentEmail, setStudentEmail] = React.useState("");
  const [studentPassword, setStudentPassword] = React.useState("");

  const [guardianName, setGuardianName] = React.useState("");
  const [guardianRelation, setGuardianRelation] =
    React.useState<StudentAccountRecord["guardianRelation"]>("Father");
  const [phone, setPhone] = React.useState("");
  const [parentEmail, setParentEmail] = React.useState("");
  const [parentPassword, setParentPassword] = React.useState("");

  const [assignedByAdmin, setAssignedByAdmin] = React.useState(
    "Student Admin — Gulberg"
  );
  const [credentialStatus, setCredentialStatus] =
    React.useState<StudentAccountRecord["credentialStatus"]>("Active");

  React.useEffect(() => {
    if (!open) return;
    if (initialData) {
      setStudentName(initialData.studentName);
      setRollNo(initialData.rollNo);
      setAdmissionNumber(initialData.admissionNumber);
      setClassName(initialData.className);
      setSection(initialData.section);
      setCampus(initialData.campus);
      setStudentEmail(initialData.studentEmail);
      setStudentPassword(initialData.studentPassword);
      setGuardianName(initialData.guardianName);
      setGuardianRelation(initialData.guardianRelation);
      setPhone(initialData.phone);
      setParentEmail(initialData.parentEmail);
      setParentPassword(initialData.parentPassword);
      setAssignedByAdmin(initialData.assignedByAdmin);
      setCredentialStatus(initialData.credentialStatus);
    } else {
      const nextRoll = String(100 + totalCount + 1);
      setStudentName("");
      setRollNo(nextRoll);
      setAdmissionNumber(`2026-${String(400 + totalCount + 1).padStart(4, "0")}`);
      setClassName("Grade 9");
      setSection("A");
      setCampus("Gulberg");
      setStudentEmail(`student.${nextRoll}@student.edusphere.edu.pk`);
      setStudentPassword(`Std@Student#${nextRoll}`);
      setGuardianName("");
      setGuardianRelation("Father");
      setPhone("+92 300 4100000");
      setParentEmail(`parent.${nextRoll}@parent.edusphere.edu.pk`);
      setParentPassword(`Prt@Parent#${nextRoll}`);
      setAssignedByAdmin("Student Admin — Gulberg");
      setCredentialStatus("Active");
    }
  }, [open, initialData, totalCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !guardianName.trim()) {
      toast.error("Please provide both Student Name and Parent/Guardian Name.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const seq = totalCount + 1;

    const record: StudentAccountRecord = {
      id: initialData?.id ?? `std-acc-${Date.now()}`,
      accountNo: initialData?.accountNo ?? `STD-ACC-${2600 + seq}`,
      admissionNumber: admissionNumber.trim(),
      rollNo: rollNo.trim(),
      studentName: studentName.trim(),
      gender: initialData?.gender ?? "Male",
      className,
      section,
      campus,
      studentEmail: studentEmail.trim(),
      studentPassword: studentPassword.trim(),
      studentPortalStatus: credentialStatus,
      studentLastLogin: initialData?.studentLastLogin ?? "Never",
      guardianName: guardianName.trim(),
      guardianRelation,
      phone: phone.trim(),
      parentEmail: parentEmail.trim(),
      parentPassword: parentPassword.trim(),
      parentPortalStatus: credentialStatus,
      parentLastLogin: initialData?.parentLastLogin ?? "Never",
      enrolledOn: initialData?.enrolledOn ?? today,
      assignedByAdmin: assignedByAdmin.trim() || "Student Admin",
      assignedDate: initialData?.assignedDate ?? today,
      lastPasswordReset: today,
      credentialStatus,
      accessLogs: initialData?.accessLogs ?? [
        {
          id: `log-${Date.now()}`,
          timestamp: `${today} 10:00 AM`,
          actor: "Student Admin",
          event: "Student & Parent portal login emails and passwords provisioned",
          ipAddress: "192.168.10.10",
          device: "Admin Console",
          status: "Assigned",
        },
      ],
    };

    onSave(record);
    onOpenChange(false);
    toast.success(
      isEditing
        ? `Student & Parent credentials updated for ${record.studentName}.`
        : `Student & Parent portal account provisioned for ${record.studentName}.`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-h-[calc(100vh-3rem)] sm:max-w-2xl gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        <DialogHeader className="shrink-0 bg-gradient-to-r from-[#091d3e]/[0.04] via-white to-white px-6 py-4 border-b border-border/70">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[#091d3e] text-white">
              <GraduationCap className="size-4" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {isEditing
                  ? "Edit Student & Parent Portal Credentials"
                  : "Assign Student & Parent Portal Credentials"}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs"
        >
          {/* Student Profile & Credentials */}
          <div className="rounded-xl border border-border/80 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#091d3e]">
                1. Student Details &amp; Portal Credentials (Student Admin)
              </h4>
              <button
                type="button"
                onClick={() => {
                  const slug =
                    studentName
                      .trim()
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, ".")
                      .replace(/^\.+|\.+$/g, "") || "student";
                  setStudentEmail(`${slug}.${rollNo}@student.edusphere.edu.pk`);
                  setStudentPassword(makeSmartPassword("Std", studentName));
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline cursor-pointer"
              >
                <RefreshCw className="size-3" />
                <span>Auto-Fill Student Login</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Student Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zain Ahmed"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs text-foreground focus:border-brand focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Roll #
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1049"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs text-foreground focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Class
                </label>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-2.5 text-xs text-foreground"
                >
                  {CLASS_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Section
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-2.5 text-xs text-foreground"
                >
                  {["A", "B", "C", "D"].map((s) => (
                    <option key={s} value={s}>
                      Section {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Campus
                </label>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-2.5 text-xs text-foreground"
                >
                  {CAMPUS_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Assigned Student Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="student.1049@student.edusphere.edu.pk"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs text-foreground focus:border-brand focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Assigned Student Password
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Std@Zain#1049"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs font-bold text-emerald-700 focus:border-brand focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Parent / Guardian Details & Credentials */}
          <div className="rounded-xl border border-border/80 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#091d3e]">
                2. Parent / Guardian Portal Credentials (Parent Admin)
              </h4>
              <button
                type="button"
                onClick={() => {
                  const slug =
                    guardianName
                      .trim()
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, ".")
                      .replace(/^\.+|\.+$/g, "") || "parent";
                  setParentEmail(`${slug}.${rollNo}@parent.edusphere.edu.pk`);
                  setParentPassword(makeSmartPassword("Prt", guardianName));
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline cursor-pointer"
              >
                <RefreshCw className="size-3" />
                <span>Auto-Fill Parent Login</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Guardian Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Ahmed"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Relation
                </label>
                <select
                  value={guardianRelation}
                  onChange={(e) =>
                    setGuardianRelation(
                      e.target.value as StudentAccountRecord["guardianRelation"]
                    )
                  }
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-2.5 text-xs text-foreground"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Legal Guardian">Legal Guardian</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Guardian Phone
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0300-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Assigned Parent Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="parent.1049@parent.edusphere.edu.pk"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Assigned Parent Password
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prt@Tariq#1049"
                  value={parentPassword}
                  onChange={(e) => setParentPassword(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs font-bold text-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Provisioning Meta */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                Assigned By (Admin)
              </label>
              <input
                type="text"
                placeholder="e.g. Student Admin — Gulberg Campus"
                value={assignedByAdmin}
                onChange={(e) => setAssignedByAdmin(e.target.value)}
                className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs text-foreground"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                Portal Account Status
              </label>
              <select
                value={credentialStatus}
                onChange={(e) =>
                  setCredentialStatus(
                    e.target.value as StudentAccountRecord["credentialStatus"]
                  )
                }
                className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-2.5 text-xs text-foreground"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending Activation</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <ActionButton
              tone="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </ActionButton>
            <ActionButton type="submit" tone="primary" size="sm">
              <Check className="size-3.5" />
              <span>
                {isEditing
                  ? "Save Credential Changes"
                  : "Provision Student & Parent Account"}
              </span>
            </ActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ───────────────────── Staff Account Form Modal ───────────────────── */

interface StaffAccountFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: StaffAccountRecord | null;
  totalCount: number;
  onSave: (record: StaffAccountRecord) => void;
}

export function StaffAccountFormModal({
  open,
  onOpenChange,
  initialData,
  totalCount,
  onSave,
}: StaffAccountFormModalProps) {
  const isEditing = Boolean(initialData);

  const [name, setName] = React.useState("");
  const [empCode, setEmpCode] = React.useState("");
  const [designation, setDesignation] = React.useState("Senior Lecturer");
  const [department, setDepartment] = React.useState("Mathematics");
  const [category, setCategory] =
    React.useState<StaffAccountRecord["category"]>("Teaching");
  const [campus, setCampus] = React.useState("Gulberg");
  const [phone, setPhone] = React.useState("");
  const [cnic, setCnic] = React.useState("");

  const [staffEmail, setStaffEmail] = React.useState("");
  const [staffPassword, setStaffPassword] = React.useState("");
  const [portalRole, setPortalRole] =
    React.useState<StaffPortalRole>("Teacher Portal");
  const [assignedByAdmin, setAssignedByAdmin] = React.useState(
    "Staff Admin — HR & IT"
  );
  const [credentialStatus, setCredentialStatus] =
    React.useState<StaffAccountRecord["credentialStatus"]>("Active");

  React.useEffect(() => {
    if (!open) return;
    if (initialData) {
      setName(initialData.name);
      setEmpCode(initialData.empCode);
      setDesignation(initialData.designation);
      setDepartment(initialData.department);
      setCategory(initialData.category);
      setCampus(initialData.campus);
      setPhone(initialData.phone);
      setCnic(initialData.cnic);
      setStaffEmail(initialData.staffEmail);
      setStaffPassword(initialData.staffPassword);
      setPortalRole(initialData.portalRole);
      setAssignedByAdmin(initialData.assignedByAdmin);
      setCredentialStatus(initialData.credentialStatus);
    } else {
      const nextNum = 101 + totalCount;
      setName("");
      setEmpCode(`EMP-${nextNum}`);
      setDesignation("Senior Lecturer");
      setDepartment("Mathematics");
      setCategory("Teaching");
      setCampus("Gulberg");
      setPhone("0300-4182910");
      setCnic("35202-1928371-1");
      setStaffEmail(`staff.${nextNum}@staff.edusphere.edu.pk`);
      setStaffPassword(`Stf@Staff#${nextNum}`);
      setPortalRole("Teacher Portal");
      setAssignedByAdmin("Staff Admin — HR & IT");
      setCredentialStatus("Active");
    }
  }, [open, initialData, totalCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !staffEmail.trim() || !staffPassword.trim()) {
      toast.error("Please enter Staff Name, Official Email, and Password.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const seq = totalCount + 1;

    const record: StaffAccountRecord = {
      id: initialData?.id ?? `stf-acc-${Date.now()}`,
      accountNo: initialData?.accountNo ?? `STF-ACC-${1000 + seq}`,
      empCode: empCode.trim(),
      name: name.trim(),
      gender: initialData?.gender ?? "Male",
      designation: designation.trim(),
      department: department.trim(),
      campus,
      category,
      scaleGrade: initialData?.scaleGrade ?? "Scale A2",
      cnic: cnic.trim(),
      phone: phone.trim(),
      joiningDate: initialData?.joiningDate ?? today,
      staffEmail: staffEmail.trim(),
      staffPassword: staffPassword.trim(),
      portalRole,
      assignedModules: initialData?.assignedModules ?? [
        "Class Attendance",
        "LMS & Assignments",
        "Exam Marks Entry",
        "Leave Application",
      ],
      assignedByAdmin: assignedByAdmin.trim() || "Staff Admin — HR & IT",
      assignedDate: initialData?.assignedDate ?? today,
      lastPasswordReset: today,
      lastLogin: initialData?.lastLogin ?? "Never",
      twoFactorEnabled: initialData?.twoFactorEnabled ?? true,
      credentialStatus,
      accessLogs: initialData?.accessLogs ?? [
        {
          id: `log-${Date.now()}`,
          timestamp: `${today} 10:15 AM`,
          actor: "Staff Admin",
          event: "Official staff portal email and password provisioned",
          ipAddress: "192.168.1.20",
          device: "HR & Staff Admin Console",
          status: "Assigned",
        },
      ],
    };

    onSave(record);
    onOpenChange(false);
    toast.success(
      isEditing
        ? `Staff portal credentials updated for ${record.name}.`
        : `Staff portal account assigned to ${record.name}.`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-h-[calc(100vh-3rem)] sm:max-w-2xl gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        <DialogHeader className="shrink-0 bg-gradient-to-r from-[#091d3e]/[0.04] via-white to-white px-6 py-4 border-b border-border/70">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[#091d3e] text-white">
              <Landmark className="size-4" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {isEditing
                  ? "Edit Staff Portal Credentials"
                  : "Assign Staff Portal Email & Password"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Provision official staff login email, password, and portal access role (Staff Admin).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs"
        >
          <div className="rounded-xl border border-border/80 bg-slate-50/50 p-4 space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#091d3e]">
              1. Staff Member Profile
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Staff Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ayesha Siddiqui"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Employee Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EMP-104 or TCH-041"
                  value={empCode}
                  onChange={(e) => setEmpCode(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Designation
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Lecturer / Head of Dept"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Department
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics & Sciences"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Campus
                </label>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-2.5 text-xs text-foreground"
                >
                  {CAMPUS_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#091d3e]">
                2. Assigned Staff Email &amp; Password (Staff Admin)
              </h4>
              <button
                type="button"
                onClick={() => {
                  const slug =
                    name
                      .replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "")
                      .trim()
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, ".")
                      .replace(/^\.+|\.+$/g, "") || "staff";
                  setStaffEmail(`${slug}@staff.edusphere.edu.pk`);
                  setStaffPassword(makeSmartPassword("Stf", name));
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline cursor-pointer"
              >
                <RefreshCw className="size-3" />
                <span>Auto-Generate Credentials</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Assigned Staff Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="ayesha.siddiqui@staff.edusphere.edu.pk"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Assigned Staff Password
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stf@Ayesha#104"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs font-bold text-emerald-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Portal Role
                </label>
                <select
                  value={portalRole}
                  onChange={(e) =>
                    setPortalRole(e.target.value as StaffPortalRole)
                  }
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-2.5 text-xs text-foreground"
                >
                  {PORTAL_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Assigned By
                </label>
                <input
                  type="text"
                  placeholder="e.g. Staff Admin — HR & IT Directorate"
                  value={assignedByAdmin}
                  onChange={(e) => setAssignedByAdmin(e.target.value)}
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Account Status
                </label>
                <select
                  value={credentialStatus}
                  onChange={(e) =>
                    setCredentialStatus(
                      e.target.value as StaffAccountRecord["credentialStatus"]
                    )
                  }
                  className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-2.5 text-xs text-foreground"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending Activation</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <ActionButton
              tone="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </ActionButton>
            <ActionButton type="submit" tone="primary" size="sm">
              <KeyRound className="size-3.5" />
              <span>
                {isEditing
                  ? "Save Staff Credentials"
                  : "Assign Staff Email & Password"}
              </span>
            </ActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
