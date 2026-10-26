import { STUDENTS } from "@/lib/mock/institution";
import { STUDENT_FEE_REPORTS } from "@/lib/mock/finance";
import { STAFF_SALARIES } from "@/lib/mock/payroll";
import { STAFF_MEMBERS } from "@/lib/mock/staff";

export interface AccountAccessLog {
  id: string;
  timestamp: string;
  actor: "Student" | "Parent" | "Staff" | "Student Admin" | "Staff Admin";
  event: string;
  ipAddress: string;
  device: string;
  status: "Success" | "Assigned" | "Reset" | "Alert";
}

export interface StudentAccountRecord {
  id: string;
  accountNo: string;
  admissionNumber: string;
  rollNo: string;
  studentName: string;
  gender: "Male" | "Female";
  className: string;
  section: string;
  campus: string;
  // Student Portal Credentials (Assigned by Student Admin)
  studentEmail: string;
  studentPassword: string;
  studentPortalStatus: "Active" | "Pending" | "Suspended";
  studentLastLogin: string;
  // Parent / Guardian Portal Credentials (Assigned by Student / Parent Admin)
  guardianName: string;
  guardianRelation: "Father" | "Mother" | "Legal Guardian";
  phone: string;
  parentEmail: string;
  parentPassword: string;
  parentPortalStatus: "Active" | "Pending" | "Suspended";
  parentLastLogin: string;
  // Admin Provisioning Metadata
  enrolledOn: string;
  assignedByAdmin: string;
  assignedDate: string;
  lastPasswordReset: string;
  credentialStatus: "Active" | "Pending" | "Suspended";
  accessLogs: AccountAccessLog[];
}

export type StaffPortalRole =
  | "Teacher Portal"
  | "HOD / Academic Coordinator"
  | "Campus Admin Portal"
  | "Finance & Accounts Portal"
  | "HR & Staff Admin"
  | "Staff Self-Service";

export interface StaffAccountRecord {
  id: string;
  accountNo: string;
  empCode: string;
  name: string;
  gender: "Male" | "Female";
  designation: string;
  department: string;
  campus: string;
  category: "Teaching" | "Non-Teaching";
  scaleGrade: string;
  cnic: string;
  phone: string;
  joiningDate: string;
  // Staff Portal Credentials (Assigned by Staff Admin)
  staffEmail: string;
  staffPassword: string;
  portalRole: StaffPortalRole;
  assignedModules: string[];
  assignedByAdmin: string;
  assignedDate: string;
  lastPasswordReset: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
  credentialStatus: "Active" | "Pending" | "Suspended";
  accessLogs: AccountAccessLog[];
}

function normalizeCampusShort(campus: string): string {
  const lower = campus.toLowerCase();
  if (lower.includes("gulberg") || lower.includes("main")) return "Gulberg";
  if (lower.includes("dha")) return "DHA Phase 5";
  if (lower.includes("f-8") || lower.includes("islamabad")) return "F-8 Islamabad";
  if (lower.includes("clifton") || lower.includes("karachi")) return "Clifton";
  if (lower.includes("bahria")) return "Bahria Town";
  return campus;
}

function slugifyName(name: string): string {
  return name
    .replace(/^(Dr|Mr|Mrs|Ms|Prof)\.?\s+/i, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

function capFirst(name: string): string {
  const clean = name
    .replace(/^(Dr|Mr|Mrs|Ms|Prof)\.?\s+/i, "")
    .trim()
    .split(/\s+/)[0] || "User";
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

function buildStudentAccessLogs(
  studentId: string,
  studentName: string,
  guardianName: string,
  assignedDate: string,
  lastReset: string
): AccountAccessLog[] {
  return [
    {
      id: `${studentId}-log-1`,
      timestamp: "2026-10-25 08:42 AM",
      actor: "Student",
      event: `Student portal sign-in (${studentName})`,
      ipAddress: "103.255.4.18",
      device: "Chrome · Windows 11",
      status: "Success",
    },
    {
      id: `${studentId}-log-2`,
      timestamp: "2026-10-24 07:15 PM",
      actor: "Parent",
      event: `Parent portal sign-in (${guardianName})`,
      ipAddress: "39.42.118.94",
      device: "EduSphere Parent App · iOS",
      status: "Success",
    },
    {
      id: `${studentId}-log-3`,
      timestamp: `${lastReset} 11:20 AM`,
      actor: "Student Admin",
      event: "Student & Parent portal credentials verified / updated by Admin",
      ipAddress: "192.168.10.14",
      device: "Admin Console · Campus Server",
      status: "Reset",
    },
    {
      id: `${studentId}-log-4`,
      timestamp: `${assignedDate} 09:00 AM`,
      actor: "Student Admin",
      event: "Initial Student & Parent email and password provisioned",
      ipAddress: "192.168.10.10",
      device: "Admin Console · Campus Server",
      status: "Assigned",
    },
  ];
}

function buildStaffAccessLogs(
  staffId: string,
  staffName: string,
  assignedDate: string,
  lastReset: string
): AccountAccessLog[] {
  return [
    {
      id: `${staffId}-log-1`,
      timestamp: "2026-10-26 08:12 AM",
      actor: "Staff",
      event: `Staff portal sign-in (${staffName})`,
      ipAddress: "103.255.6.42",
      device: "Edge · Windows 11",
      status: "Success",
    },
    {
      id: `${staffId}-log-2`,
      timestamp: `${lastReset} 02:30 PM`,
      actor: "Staff Admin",
      event: "Staff portal password & role permissions updated by Staff Admin",
      ipAddress: "192.168.1.25",
      device: "HR & Staff Admin Console",
      status: "Reset",
    },
    {
      id: `${staffId}-log-3`,
      timestamp: `${assignedDate} 10:15 AM`,
      actor: "Staff Admin",
      event: "Official staff email & login password assigned by Staff Admin",
      ipAddress: "192.168.1.20",
      device: "HR & Staff Admin Console",
      status: "Assigned",
    },
  ];
}

function buildAllStudentAccounts(): StudentAccountRecord[] {
  const accounts: StudentAccountRecord[] = [];
  const seenNames = new Set<string>();

  const femaleNames = [
    "ayesha",
    "sara",
    "iqra",
    "noor",
    "laiba",
    "hania",
    "dua",
    "mahnoor",
    "zainab",
    "fatima",
    "amna",
    "maryam",
    "hira",
    "zara",
  ];

  const studentAdmins = [
    "Student Admin — Gulberg",
    "Student Admin — DHA",
    "Student Admin — Islamabad",
    "Parent & Student Desk",
  ];

  // 1. Seed from STUDENT_FEE_REPORTS (16 records)
  STUDENT_FEE_REPORTS.forEach((sfr, index) => {
    seenNames.add(sfr.student.toLowerCase());
    const campusShort = normalizeCampusShort(sfr.campus);
    const [clsPart, secPart] = sfr.className.includes("-")
      ? sfr.className.split("-")
      : [sfr.className, "A"];

    const firstWord = sfr.student.split(" ")[0]?.toLowerCase() ?? "";
    const isFemale = femaleNames.includes(firstWord);
    const stdSlug = slugifyName(sfr.student);
    const prtSlug = slugifyName(sfr.fatherName);
    const stdToken = capFirst(sfr.student);
    const prtToken = capFirst(sfr.fatherName);
    const codeNum = 2601 + index;

    const credentialStatus: StudentAccountRecord["credentialStatus"] =
      index % 11 === 9
        ? "Suspended"
        : index % 7 === 5
        ? "Pending"
        : "Active";

    const assignedDate = `2026-08-0${(index % 8) + 1}`;
    const lastPasswordReset = `2026-09-${String(10 + (index % 18)).padStart(2, "0")}`;

    accounts.push({
      id: `std-acc-${index + 1}`,
      accountNo: `STD-ACC-${codeNum}`,
      admissionNumber: `2026-${String(401 + index).padStart(4, "0")}`,
      rollNo: sfr.rollNo,
      studentName: sfr.student,
      gender: isFemale ? "Female" : "Male",
      className: clsPart.trim(),
      section: secPart.trim(),
      campus: campusShort,
      studentEmail: `${stdSlug}.${sfr.rollNo}@student.opus.edu.pk`,
      studentPassword: `Std@${stdToken}#${sfr.rollNo}`,
      studentPortalStatus: credentialStatus,
      studentLastLogin:
        credentialStatus === "Pending"
          ? "Never"
          : `2026-10-${String(18 + (index % 8)).padStart(2, "0")} 08:${String(15 + (index % 40)).padStart(2, "0")} AM`,
      guardianName: sfr.fatherName,
      guardianRelation: "Father",
      phone: `+92 3${index % 5}${index % 9} ${String(4102938 + index * 19381).slice(0, 7)}`,
      parentEmail: `${prtSlug}.${sfr.rollNo}@parent.opus.edu.pk`,
      parentPassword: `Prt@${prtToken}#${sfr.rollNo}`,
      parentPortalStatus: credentialStatus,
      parentLastLogin:
        credentialStatus === "Pending"
          ? "Never"
          : `2026-10-${String(17 + (index % 8)).padStart(2, "0")} 07:${String(10 + (index % 45)).padStart(2, "0")} PM`,
      enrolledOn: `202${2 + (index % 4)}-08-1${index % 9}`,
      assignedByAdmin: studentAdmins[index % studentAdmins.length],
      assignedDate,
      lastPasswordReset,
      credentialStatus,
      accessLogs: buildStudentAccessLogs(
        `std-acc-${index + 1}`,
        sfr.student,
        sfr.fatherName,
        assignedDate,
        lastPasswordReset
      ),
    });
  });

  // 2. Include remaining students from STUDENTS
  STUDENTS.forEach((st, idx) => {
    const key = st.name.toLowerCase();
    if (
      seenNames.has(key) &&
      accounts.some(
        (a) =>
          a.studentName.toLowerCase() === key &&
          a.className.toLowerCase() === st.className.toLowerCase()
      )
    ) {
      return;
    }

    const seq = accounts.length + 1;
    const campusShort =
      idx % 9 === 8 ? "Bahria Town" : normalizeCampusShort(st.campus);
    const stdSlug = slugifyName(st.name);
    const prtSlug = slugifyName(st.guardian);
    const stdToken = capFirst(st.name);
    const prtToken = capFirst(st.guardian);

    const credentialStatus: StudentAccountRecord["credentialStatus"] =
      st.status === "Suspended"
        ? "Suspended"
        : idx % 8 === 6
        ? "Pending"
        : "Active";

    const assignedDate = `2026-08-${String(10 + (idx % 15)).padStart(2, "0")}`;
    const lastPasswordReset = `2026-09-${String(12 + (idx % 16)).padStart(2, "0")}`;

    accounts.push({
      id: `std-acc-${seq}`,
      accountNo: `STD-ACC-${String(2600 + seq)}`,
      admissionNumber: st.admissionNumber,
      rollNo: st.rollNo,
      studentName: st.name,
      gender: st.gender,
      className: st.className,
      section: st.section,
      campus: campusShort,
      studentEmail: `${stdSlug}.${st.rollNo}@student.opus.edu.pk`,
      studentPassword: `Std@${stdToken}#${st.rollNo}`,
      studentPortalStatus: credentialStatus,
      studentLastLogin:
        credentialStatus === "Pending"
          ? "Never"
          : `2026-10-${String(15 + (idx % 10)).padStart(2, "0")} 09:${String(10 + (idx % 45)).padStart(2, "0")} AM`,
      guardianName: st.guardian,
      guardianRelation: idx % 5 === 0 ? "Mother" : "Father",
      phone: st.phone,
      parentEmail: `${prtSlug}.${st.rollNo}@parent.opus.edu.pk`,
      parentPassword: `Prt@${prtToken}#${st.rollNo}`,
      parentPortalStatus: credentialStatus,
      parentLastLogin:
        credentialStatus === "Pending"
          ? "Never"
          : `2026-10-${String(14 + (idx % 11)).padStart(2, "0")} 08:${String(12 + (idx % 40)).padStart(2, "0")} PM`,
      enrolledOn: st.enrolledOn,
      assignedByAdmin: studentAdmins[idx % studentAdmins.length],
      assignedDate,
      lastPasswordReset,
      credentialStatus,
      accessLogs: buildStudentAccessLogs(
        `std-acc-${seq}`,
        st.name,
        st.guardian,
        assignedDate,
        lastPasswordReset
      ),
    });
  });

  return accounts;
}

function resolveStaffPortalRole(
  designation: string,
  department: string,
  category: "Teaching" | "Non-Teaching"
): { role: StaffPortalRole; modules: string[] } {
  const d = `${designation} ${department}`.toLowerCase();
  if (d.includes("principal") || d.includes("director") || d.includes("head")) {
    return {
      role: "Campus Admin Portal",
      modules: [
        "Campus Dashboard",
        "Staff & Student Directory",
        "Attendance Approvals",
        "Exam & Results Oversight",
      ],
    };
  }
  if (d.includes("coordinator") || d.includes("senior")) {
    return {
      role: "HOD / Academic Coordinator",
      modules: [
        "Department Timetable",
        "Teacher Attendance",
        "LMS & Syllabus Review",
        "Exam Moderation",
      ],
    };
  }
  if (d.includes("account") || d.includes("finance") || d.includes("bursar")) {
    return {
      role: "Finance & Accounts Portal",
      modules: [
        "Fee Collection",
        "Challan Verification",
        "Payroll Vouchers",
        "Financial Reports",
      ],
    };
  }
  if (d.includes("hr") || d.includes("admin") || d.includes("registrar")) {
    return {
      role: "HR & Staff Admin",
      modules: [
        "Staff Records",
        "Leave Management",
        "Account Provisioning",
        "Reception & Admissions",
      ],
    };
  }
  if (category === "Teaching") {
    return {
      role: "Teacher Portal",
      modules: [
        "Class Attendance",
        "LMS & Assignments",
        "Exam Marks Entry",
        "Leave Application",
      ],
    };
  }
  return {
    role: "Staff Self-Service",
    modules: [
      "Attendance Check-In",
      "Leave Portal",
      "Salary Slips View",
      "Announcements",
    ],
  };
}

function buildAllStaffAccounts(): StaffAccountRecord[] {
  const accounts: StaffAccountRecord[] = [];
  const seenNames = new Set<string>();

  const staffAdmins = [
    "Staff Admin — HR & IT",
    "Staff Admin — Central Office",
    "Campus IT Administrator",
  ];

  // 1. Seed from STAFF_SALARIES (15 records)
  STAFF_SALARIES.forEach((sal, index) => {
    const cleanName = sal.name.replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "").toLowerCase();
    seenNames.add(cleanName);

    const campusShort = normalizeCampusShort(sal.campus);
    const isFemale = /^(Mrs|Ms|Dr\.\s+(Farah|Ayesha|Saima))/i.test(sal.name);
    const scaleGrade =
      sal.baseSalary >= 140000
        ? "Scale A1"
        : sal.baseSalary >= 105000
        ? "Scale A2"
        : sal.baseSalary >= 85000
        ? "Scale A3"
        : "Scale S1";

    const matchedMember = STAFF_MEMBERS.find(
      (m) =>
        m.name.replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "").toLowerCase() === cleanName
    );

    const empDigits = sal.empCode.replace(/[^0-9]/g, "") || String(101 + index);
    const staffSlug = slugifyName(sal.name);
    const staffToken = capFirst(sal.name);
    const { role, modules } = resolveStaffPortalRole(
      sal.designation,
      sal.department,
      sal.type
    );

    const credentialStatus: StaffAccountRecord["credentialStatus"] =
      sal.status === "On Hold"
        ? "Suspended"
        : index % 8 === 6
        ? "Pending"
        : "Active";

    const assignedDate = `2026-08-0${(index % 7) + 1}`;
    const lastPasswordReset = `2026-09-${String(10 + (index % 15)).padStart(2, "0")}`;

    accounts.push({
      id: `stf-acc-${index + 1}`,
      accountNo: `STF-ACC-${String(1001 + index)}`,
      empCode: sal.empCode,
      name: sal.name,
      gender: matchedMember?.gender ?? (isFemale ? "Female" : "Male"),
      designation: sal.designation,
      department: sal.department,
      campus: campusShort,
      category: sal.type,
      scaleGrade,
      cnic: sal.cnic,
      phone:
        matchedMember?.phone ??
        `03${(index % 4) + 1}${(index * 3) % 9}-${String(4182910 + index * 23191).slice(0, 7)}`,
      joiningDate: sal.joiningDate,
      staffEmail: `${staffSlug}@staff.opus.edu.pk`,
      staffPassword: `Stf@${staffToken}#${empDigits}`,
      portalRole: role,
      assignedModules: modules,
      assignedByAdmin: staffAdmins[index % staffAdmins.length],
      assignedDate,
      lastPasswordReset,
      lastLogin:
        credentialStatus === "Pending"
          ? "Never"
          : `2026-10-${String(20 + (index % 6)).padStart(2, "0")} 08:${String(10 + (index % 45)).padStart(2, "0")} AM`,
      twoFactorEnabled: index % 3 !== 2,
      credentialStatus,
      accessLogs: buildStaffAccessLogs(
        `stf-acc-${index + 1}`,
        sal.name,
        assignedDate,
        lastPasswordReset
      ),
    });
  });

  // 2. Include remaining staff from STAFF_MEMBERS
  STAFF_MEMBERS.forEach((member, idx) => {
    const cleanName = member.name
      .replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "")
      .toLowerCase();
    if (seenNames.has(cleanName)) return;
    seenNames.add(cleanName);

    const seq = accounts.length + 1;
    const campusShort = normalizeCampusShort(member.campus);
    const isPrincipalOrHead = /Principal|Director|Chief|Head/i.test(
      member.designation
    );
    const isSenior = /Senior|Coordinator|Specialist|Lead/i.test(
      member.designation
    );
    const scaleGrade = isPrincipalOrHead
      ? "Scale A1"
      : isSenior
      ? "Scale A2"
      : "Scale A3";

    const empDigits =
      member.empCode.replace(/[^0-9]/g, "") || String(100 + seq);
    const staffSlug = slugifyName(member.name);
    const staffToken = capFirst(member.name);
    const { role, modules } = resolveStaffPortalRole(
      member.designation,
      member.department,
      member.type
    );

    const credentialStatus: StaffAccountRecord["credentialStatus"] =
      member.status === "Inactive"
        ? "Suspended"
        : idx % 7 === 5
        ? "Pending"
        : "Active";

    const assignedDate = `2026-08-${String(10 + (idx % 14)).padStart(2, "0")}`;
    const lastPasswordReset = `2026-09-${String(12 + (idx % 14)).padStart(2, "0")}`;

    accounts.push({
      id: `stf-acc-${seq}`,
      accountNo: `STF-ACC-${String(1000 + seq)}`,
      empCode: member.empCode,
      name: member.name,
      gender: member.gender,
      designation: member.designation,
      department: member.department,
      campus: campusShort,
      category: member.type,
      scaleGrade,
      cnic:
        member.cnic ??
        `3520${(idx % 2) + 1}-${String(1928371 + idx * 412839).slice(0, 7)}-${(idx % 9) + 1}`,
      phone: member.phone,
      joiningDate: member.joiningDate,
      staffEmail: `${staffSlug}@staff.opus.edu.pk`,
      staffPassword: `Stf@${staffToken}#${empDigits}`,
      portalRole: role,
      assignedModules: modules,
      assignedByAdmin: staffAdmins[idx % staffAdmins.length],
      assignedDate,
      lastPasswordReset,
      lastLogin:
        credentialStatus === "Pending"
          ? "Never"
          : `2026-10-${String(19 + (idx % 7)).padStart(2, "0")} 08:${String(12 + (idx % 40)).padStart(2, "0")} AM`,
      twoFactorEnabled: idx % 2 === 0,
      credentialStatus,
      accessLogs: buildStaffAccessLogs(
        `stf-acc-${seq}`,
        member.name,
        assignedDate,
        lastPasswordReset
      ),
    });
  });

  return accounts;
}

export const INITIAL_STUDENT_ACCOUNTS: StudentAccountRecord[] =
  buildAllStudentAccounts();

export const INITIAL_STAFF_ACCOUNTS: StaffAccountRecord[] =
  buildAllStaffAccounts();
