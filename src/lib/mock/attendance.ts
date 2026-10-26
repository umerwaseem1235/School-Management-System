import { STUDENTS, CAMPUSES } from "./institution";
import { EMPLOYEES } from "./operations";
import { CAMPUS_ATTENDANCE_TODAY } from "./analytics";

export type DailyStudentStatus = "Present" | "Absent" | "Late" | "Excused";
export type DailyStaffStatus = "Present" | "Late" | "On Leave" | "Absent" | "Half Day";
export type VerificationMethod = "Biometric" | "RFID Card" | "Mobile Geo-Fence" | "Manual Register";

export interface StudentAttendanceRecord {
  id: string;
  studentId: string;
  admissionNumber: string;
  rollNo: string;
  name: string;
  gender: "Male" | "Female";
  className: string;
  section: string;
  campus: string;
  guardian: string;
  phone: string;
  statusToday: DailyStudentStatus;
  checkInTime: string;
  verificationMethod: VerificationMethod;
  monthlyRate: number;
  daysPresentMonth: number;
  daysAbsentMonth: number;
  consecutiveAbsences: number;
  remarks?: string;
}

export interface ClassAttendanceSheet {
  id: string;
  className: string;
  section: string;
  campus: string;
  classTeacher: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  submittedAt: string;
  status: "Submitted" | "Pending";
}

export interface StaffAttendanceRecord {
  id: string;
  empId: string;
  empCode: string;
  name: string;
  designation: string;
  department: string;
  campus: string;
  type: "Teaching" | "Non-Teaching";
  shift: string;
  checkIn: string;
  checkOut: string;
  lateMinutes: number;
  workingHours: string;
  verificationMethod: VerificationMethod;
  statusToday: DailyStaffStatus;
  monthlyPunctuality: number;
  phone: string;
  email: string;
  emergencyContact: string;
  extension: string;
  daysPresentMonth: number;
  daysAbsentMonth: number;
  daysLateMonth: number;
  daysLeaveMonth: number;
  monthlyRate: number;
  remarks?: string;
}

export interface ExtendedLeaveRequest {
  id: string;
  refNo: string;
  applicant: string;
  applicantCode: string;
  applicantType: "Staff" | "Student";
  departmentOrClass: string;
  campus: string;
  leaveType: "Casual" | "Medical" | "Annual" | "Emergency" | "Short Leave";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  substituteAssigned?: string;
  hasAttachment: boolean;
  appliedOn: string;
  approvedBy?: string;
  status: "Pending" | "Approved" | "Rejected";
  leaveBalanceRemaining: number;
  leaveBalanceTotal: number;
}

export interface CampusAttendanceMatrixRow {
  campus: string;
  campusCode: string;
  studentsEnrolled: number;
  studentsPresent: number;
  studentsAbsent: number;
  studentsLate: number;
  studentRate: number;
  staffTotal: number;
  staffPresent: number;
  staffRate: number;
  smsAlertsDispatched: number;
}

export interface ChronicAbsenteeRecord {
  id: string;
  admissionNumber: string;
  name: string;
  className: string;
  campus: string;
  guardian: string;
  phone: string;
  overallRate: number;
  consecutiveDays: number;
  totalAbsencesTerm: number;
  lastWarningSent: string;
  riskLevel: "Critical" | "Warning";
}

/* ───────────────────────── Student Daily Attendance ───────────────────────── */

const studentStatuses: DailyStudentStatus[] = [
  "Present",
  "Present",
  "Present",
  "Present",
  "Present",
  "Present",
  "Present",
  "Late",
  "Absent",
  "Present",
  "Present",
  "Excused",
];

const checkInTimes = [
  "07:42 AM",
  "07:46 AM",
  "07:49 AM",
  "07:51 AM",
  "07:54 AM",
  "07:56 AM",
  "07:58 AM",
  "08:14 AM",
  "—",
  "07:44 AM",
  "07:50 AM",
  "—",
];

const studentMethods: VerificationMethod[] = [
  "RFID Card",
  "RFID Card",
  "Manual Register",
  "RFID Card",
  "Biometric",
  "RFID Card",
];

export const STUDENT_ATTENDANCE_RECORDS: StudentAttendanceRecord[] = STUDENTS.slice(0, 36).map(
  (s, idx) => {
    const statusToday = studentStatuses[idx % studentStatuses.length];
    const checkInTime =
      statusToday === "Absent" || statusToday === "Excused"
        ? "—"
        : statusToday === "Late"
          ? `08:${11 + (idx % 18)} AM`
          : checkInTimes[idx % checkInTimes.length];
    const daysPresentMonth = 18 + (idx % 5);
    const daysAbsentMonth = statusToday === "Absent" ? 2 + (idx % 3) : idx % 3;
    const consecutiveAbsences =
      statusToday === "Absent" ? (idx % 4) + 1 : 0;

    return {
      id: `sa-${s.id}`,
      studentId: s.id,
      admissionNumber: s.admissionNumber,
      rollNo: s.rollNo,
      name: s.name,
      gender: s.gender,
      className: s.className,
      section: s.section,
      campus: s.campus,
      guardian: s.guardian,
      phone: s.phone,
      statusToday,
      checkInTime,
      verificationMethod:
        statusToday === "Absent" || statusToday === "Excused"
          ? "Manual Register"
          : studentMethods[idx % studentMethods.length],
      monthlyRate: s.attendance,
      daysPresentMonth,
      daysAbsentMonth,
      consecutiveAbsences,
      remarks:
        statusToday === "Excused"
          ? "Approved medical leave on file"
          : statusToday === "Late"
            ? "School bus route #4 delayed"
            : statusToday === "Absent" && consecutiveAbsences >= 2
              ? "Guardian notified via automated SMS"
              : undefined,
    };
  }
);

export const CLASS_ATTENDANCE_SHEETS: ClassAttendanceSheet[] = [
  {
    id: "cs-1",
    className: "Grade 10",
    section: "A",
    campus: "Main Campus — Gulberg",
    classTeacher: "Mr. Adeel Hassan",
    totalStudents: 36,
    present: 34,
    absent: 1,
    late: 1,
    excused: 0,
    submittedAt: "08:08 AM",
    status: "Submitted",
  },
  {
    id: "cs-2",
    className: "Grade 9",
    section: "A",
    campus: "Main Campus — Gulberg",
    classTeacher: "Mrs. Maryam Shah",
    totalStudents: 34,
    present: 31,
    absent: 2,
    late: 1,
    excused: 0,
    submittedAt: "08:11 AM",
    status: "Submitted",
  },
  {
    id: "cs-3",
    className: "Grade 8",
    section: "B",
    campus: "DHA Phase 5 Campus",
    classTeacher: "Mr. Usman Ali",
    totalStudents: 32,
    present: 29,
    absent: 1,
    late: 1,
    excused: 1,
    submittedAt: "08:14 AM",
    status: "Submitted",
  },
  {
    id: "cs-4",
    className: "Grade 7",
    section: "A",
    campus: "F-8 Islamabad Campus",
    classTeacher: "Dr. Saima Riaz",
    totalStudents: 35,
    present: 33,
    absent: 1,
    late: 0,
    excused: 1,
    submittedAt: "08:06 AM",
    status: "Submitted",
  },
  {
    id: "cs-5",
    className: "Grade 6",
    section: "C",
    campus: "Clifton Karachi Campus",
    classTeacher: "Ms. Kiran Aziz",
    totalStudents: 30,
    present: 26,
    absent: 3,
    late: 1,
    excused: 0,
    submittedAt: "08:19 AM",
    status: "Submitted",
  },
  {
    id: "cs-6",
    className: "Grade 5",
    section: "B",
    campus: "DHA Phase 5 Campus",
    classTeacher: "Mr. Waqas Anwar",
    totalStudents: 31,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    submittedAt: "Pending",
    status: "Pending",
  },
];

/* ───────────────────────── Staff Attendance & Biometric Logs ───────────────────────── */

const EXTRA_STAFF = [
  {
    id: "em11",
    empCode: "EMP-0164",
    name: "Mr. Fahad Mir",
    designation: "Senior Teacher — Chemistry",
    department: "Sciences",
    campus: "Main Campus — Gulberg",
    type: "Teaching" as const,
  },
  {
    id: "em12",
    empCode: "EMP-0192",
    name: "Ms. Amina Tariq",
    designation: "Teacher — Biology",
    department: "Sciences",
    campus: "DHA Phase 5 Campus",
    type: "Teaching" as const,
  },
  {
    id: "em13",
    empCode: "EMP-0238",
    name: "Mr. Hafiz Zubair",
    designation: "Teacher — Islamiat",
    department: "Humanities",
    campus: "F-8 Islamabad Campus",
    type: "Teaching" as const,
  },
  {
    id: "em14",
    empCode: "EMP-0290",
    name: "Mr. Waqas Anwar",
    designation: "Coordinator — Middle Wing",
    department: "Administration",
    campus: "DHA Phase 5 Campus",
    type: "Teaching" as const,
  },
  {
    id: "em15",
    empCode: "EMP-0318",
    name: "Mrs. Nida Farooq",
    designation: "Primary Wing Head",
    department: "Primary",
    campus: "Main Campus — Gulberg",
    type: "Teaching" as const,
  },
  {
    id: "em16",
    empCode: "EMP-0341",
    name: "Mr. Kamran Siddiqui",
    designation: "Systems & Network Engineer",
    department: "Technology",
    campus: "Main Campus — Gulberg",
    type: "Non-Teaching" as const,
  },
  {
    id: "em17",
    empCode: "EMP-0376",
    name: "Ms. Rabia Noor",
    designation: "HR Executive",
    department: "Human Resources",
    campus: "F-8 Islamabad Campus",
    type: "Non-Teaching" as const,
  },
  {
    id: "em18",
    empCode: "EMP-0405",
    name: "Mr. Imran Qureshi",
    designation: "Campus Principal",
    department: "Administration",
    campus: "DHA Phase 5 Campus",
    type: "Non-Teaching" as const,
  },
];

const combinedEmployees = [
  ...EMPLOYEES.map((e) => ({
    id: e.id,
    empCode: e.empCode,
    name: e.name,
    designation: e.designation,
    department: e.department,
    campus:
      e.campus === "Gulberg"
        ? "Main Campus — Gulberg"
        : e.campus === "DHA Phase 5"
          ? "DHA Phase 5 Campus"
          : e.campus === "F-8 Islamabad"
            ? "F-8 Islamabad Campus"
            : e.campus === "Clifton"
              ? "Clifton Karachi Campus"
              : "Bahria Town Campus",
    type: e.type,
  })),
  ...EXTRA_STAFF,
];

const staffStatuses: DailyStaffStatus[] = [
  "Present",
  "Present",
  "On Leave",
  "Present",
  "Present",
  "Present",
  "Late",
  "Absent",
  "Present",
  "Half Day",
  "Present",
  "Present",
  "Late",
  "Present",
  "Present",
  "Present",
  "Present",
  "Present",
];

export const STAFF_ATTENDANCE_RECORDS: StaffAttendanceRecord[] = combinedEmployees.map(
  (emp, idx) => {
    const statusToday = staffStatuses[idx % staffStatuses.length];
    const isLate = statusToday === "Late";
    const isAbsentOrLeave = statusToday === "Absent" || statusToday === "On Leave";
    const isHalfDay = statusToday === "Half Day";

    const checkIn = isAbsentOrLeave
      ? "—"
      : isLate
        ? `08:${12 + (idx % 19)} AM`
        : `07:${34 + (idx % 14)} AM`;

    const checkOut = isAbsentOrLeave
      ? "—"
      : isHalfDay
        ? "11:30 AM"
        : `02:${32 + (idx % 22)} PM`;

    const lateMinutes = isLate ? 12 + (idx % 19) : 0;

    const totalWorkingDays = 16;
    const presetAbsences = [1, 0, 1, 1, 0, 2, 3, 5, 1, 2, 0, 1, 3, 0, 1, 0, 2, 1];
    const daysAbsentMonth = presetAbsences[idx % presetAbsences.length];
    const daysLeaveMonth = statusToday === "On Leave" ? 1 : idx % 5 === 0 ? 1 : 0;
    const daysPresentMonth = Math.max(
      10,
      totalWorkingDays - daysAbsentMonth
    );
    const daysLateMonth = isLate ? 2 : idx % 3 === 0 ? 1 : 0;
    const monthlyRate = Math.round((daysPresentMonth / totalWorkingDays) * 100);
    const phone = `03${String(10 + (idx % 35)).padStart(2, "0")}-${String(
      4102300 + idx * 14231
    ).slice(0, 7)}`;
    const cleanName = emp.name
      .toLowerCase()
      .replace(/^(dr|mr|mrs|ms|hafiz)\.?\s+/i, "")
      .trim()
      .replace(/[^a-z0-9]+/g, ".");
    const email = `${cleanName}@edusphere.edu.pk`;
    const emergencyContact = `03${String(20 + (idx % 29)).padStart(2, "0")}-${String(
      5214800 + idx * 8321
    ).slice(0, 7)}`;
    const extension = `Ext. ${101 + ((idx * 23) % 390)}`;

    return {
      id: `sta-${emp.id}`,
      empId: emp.id,
      empCode: emp.empCode,
      name: emp.name,
      designation: emp.designation,
      department: emp.department,
      campus: emp.campus,
      type: emp.type,
      shift: emp.type === "Teaching" ? "07:45 AM – 02:30 PM" : "08:00 AM – 04:00 PM",
      checkIn,
      checkOut,
      lateMinutes,
      workingHours: isAbsentOrLeave ? "6h 45m avg" : isHalfDay ? "3h 48m" : `6h ${45 + (idx % 14)}m`,
      verificationMethod:
        idx % 4 === 0
          ? "RFID Card"
          : idx % 7 === 0
            ? "Mobile Geo-Fence"
            : "Biometric",
      statusToday,
      monthlyPunctuality: 99 - (idx % 11),
      phone,
      email,
      emergencyContact,
      extension,
      daysPresentMonth,
      daysAbsentMonth,
      daysLateMonth,
      daysLeaveMonth,
      monthlyRate,
      remarks:
        statusToday === "On Leave"
          ? "Approved leave on HR portal"
          : statusToday === "Late"
            ? `Late arrival (+${lateMinutes}m) logged at gate`
            : statusToday === "Absent"
              ? "Uninformed absence — HR notification sent"
              : statusToday === "Half Day"
                ? "Approved short leave after 11:30 AM"
                : "Verified on-time shift attendance",
    };
  }
);

const DEPARTMENT_ROWS = [
  { department: "Sciences", total: 98, present: 90, late: 3, onLeave: 3, absent: 2 },
  { department: "Languages & Literature", total: 80, present: 74, late: 2, onLeave: 3, absent: 1 },
  { department: "Humanities", total: 63, present: 59, late: 2, onLeave: 1, absent: 1 },
  { department: "Technology", total: 46, present: 44, late: 1, onLeave: 1, absent: 0 },
  { department: "Primary Wing", total: 114, present: 108, late: 4, onLeave: 1, absent: 1 },
  { department: "Admin & Operations", total: 78, present: 76, late: 1, onLeave: 1, absent: 0 },
];

export const DEPARTMENT_ATTENDANCE_SUMMARY = DEPARTMENT_ROWS.map((d) => ({
  ...d,
  rate: Math.round(((d.present + d.late) / d.total) * 1000) / 10,
}));

/** Institution-wide staff figures for today (single source of truth for KPIs). */
export const STAFF_TODAY = (() => {
  const total = DEPARTMENT_ROWS.reduce((a, d) => a + d.total, 0);
  const present = DEPARTMENT_ROWS.reduce((a, d) => a + d.present, 0);
  const late = DEPARTMENT_ROWS.reduce((a, d) => a + d.late, 0);
  const onLeave = DEPARTMENT_ROWS.reduce((a, d) => a + d.onLeave, 0);
  const absent = DEPARTMENT_ROWS.reduce((a, d) => a + d.absent, 0);
  return {
    total,
    present,
    late,
    onLeave,
    absent,
    rate: Math.round(((present + late) / total) * 1000) / 10,
    previousRate: 96.8,
  };
})();

/* ───────────────────────── Extended Leave Requests ───────────────────────── */

export const EXTENDED_LEAVE_REQUESTS: ExtendedLeaveRequest[] = [
  {
    id: "lv-101",
    refNo: "LV-2026-0841",
    applicant: "Mrs. Maryam Shah",
    applicantCode: "EMP-0211",
    applicantType: "Staff",
    departmentOrClass: "Languages & Literature · Head of English",
    campus: "Main Campus — Gulberg",
    leaveType: "Medical",
    startDate: "2026-10-12",
    endDate: "2026-10-14",
    days: 3,
    reason: "Post-op follow-up & rest advised by consultant physician",
    substituteAssigned: "Ms. Kiran Aziz",
    hasAttachment: true,
    appliedOn: "2026-10-10",
    status: "Pending",
    leaveBalanceRemaining: 9,
    leaveBalanceTotal: 12,
  },
  {
    id: "lv-102",
    refNo: "LV-2026-0842",
    applicant: "Mr. Usman Ali",
    applicantCode: "EMP-0274",
    applicantType: "Staff",
    departmentOrClass: "Technology · Computer Science",
    campus: "DHA Phase 5 Campus",
    leaveType: "Casual",
    startDate: "2026-10-15",
    endDate: "2026-10-15",
    days: 1,
    reason: "Personal family commitment in Islamabad",
    substituteAssigned: "Mr. Kamran Siddiqui",
    hasAttachment: false,
    appliedOn: "2026-10-11",
    status: "Pending",
    leaveBalanceRemaining: 6,
    leaveBalanceTotal: 10,
  },
  {
    id: "lv-103",
    refNo: "LV-2026-0843",
    applicant: "Zain Ahmed",
    applicantCode: "2026-0412",
    applicantType: "Student",
    departmentOrClass: "Grade 9 - A",
    campus: "Main Campus — Gulberg",
    leaveType: "Medical",
    startDate: "2026-10-12",
    endDate: "2026-10-13",
    days: 2,
    reason: "Viral fever — medical slip submitted by guardian (Kamran Ahmed)",
    hasAttachment: true,
    appliedOn: "2026-10-11",
    status: "Pending",
    leaveBalanceRemaining: 11,
    leaveBalanceTotal: 15,
  },
  {
    id: "lv-104",
    refNo: "LV-2026-0844",
    applicant: "Ms. Kiran Aziz",
    applicantCode: "EMP-0447",
    applicantType: "Staff",
    departmentOrClass: "Languages & Literature · Urdu",
    campus: "Main Campus — Gulberg",
    leaveType: "Annual",
    startDate: "2026-12-21",
    endDate: "2026-12-30",
    days: 8,
    reason: "Winter family travel abroad during term break",
    substituteAssigned: "Mrs. Nida Farooq",
    hasAttachment: false,
    appliedOn: "2026-10-09",
    status: "Pending",
    leaveBalanceRemaining: 14,
    leaveBalanceTotal: 20,
  },
  {
    id: "lv-105",
    refNo: "LV-2026-0845",
    applicant: "Fatima Zahra",
    applicantCode: "2026-0415",
    applicantType: "Student",
    departmentOrClass: "Grade 10 - A",
    campus: "F-8 Islamabad Campus",
    leaveType: "Casual",
    startDate: "2026-10-16",
    endDate: "2026-10-17",
    days: 2,
    reason: "Representing school at National Youth Debate Championship",
    hasAttachment: true,
    appliedOn: "2026-10-11",
    status: "Pending",
    leaveBalanceRemaining: 13,
    leaveBalanceTotal: 15,
  },
  {
    id: "lv-106",
    refNo: "LV-2026-0838",
    applicant: "Mr. Tariq Mehmood",
    applicantCode: "EMP-0389",
    applicantType: "Staff",
    departmentOrClass: "Finance · Accounts Officer",
    campus: "DHA Phase 5 Campus",
    leaveType: "Emergency",
    startDate: "2026-10-05",
    endDate: "2026-10-06",
    days: 2,
    reason: "Urgent domestic medical emergency",
    approvedBy: "Dr. Ayesha Siddiqui",
    hasAttachment: true,
    appliedOn: "2026-10-05",
    status: "Approved",
    leaveBalanceRemaining: 5,
    leaveBalanceTotal: 7,
  },
  {
    id: "lv-107",
    refNo: "LV-2026-0835",
    applicant: "Dr. Saima Riaz",
    applicantCode: "EMP-0302",
    applicantType: "Staff",
    departmentOrClass: "Sciences · Senior Teacher Physics",
    campus: "F-8 Islamabad Campus",
    leaveType: "Short Leave",
    startDate: "2026-10-08",
    endDate: "2026-10-08",
    days: 1,
    reason: "HEC curriculum committee meeting (11:30 AM onwards)",
    substituteAssigned: "Mr. Fahad Mir",
    approvedBy: "Mrs. Sana Malik",
    hasAttachment: true,
    appliedOn: "2026-10-07",
    status: "Approved",
    leaveBalanceRemaining: 8,
    leaveBalanceTotal: 10,
  },
  {
    id: "lv-108",
    refNo: "LV-2026-0831",
    applicant: "Hamza Malik",
    applicantCode: "2026-0414",
    applicantType: "Student",
    departmentOrClass: "Grade 7 - C",
    campus: "F-8 Islamabad Campus",
    leaveType: "Medical",
    startDate: "2026-10-02",
    endDate: "2026-10-04",
    days: 3,
    reason: "Dental surgery recovery",
    approvedBy: "Mrs. Sana Malik",
    hasAttachment: true,
    appliedOn: "2026-10-01",
    status: "Approved",
    leaveBalanceRemaining: 10,
    leaveBalanceTotal: 15,
  },
  {
    id: "lv-109",
    refNo: "LV-2026-0829",
    applicant: "Hira Qureshi",
    applicantCode: "2026-0419",
    applicantType: "Student",
    departmentOrClass: "Grade 6 - B",
    campus: "Clifton Karachi Campus",
    leaveType: "Casual",
    startDate: "2026-10-13",
    endDate: "2026-10-16",
    days: 4,
    reason: "Out-of-city wedding during Mid-Term Exam week",
    approvedBy: "Mr. Faisal Rahman",
    hasAttachment: false,
    appliedOn: "2026-10-08",
    status: "Rejected",
    leaveBalanceRemaining: 12,
    leaveBalanceTotal: 15,
  },
  {
    id: "lv-110",
    refNo: "LV-2026-0824",
    applicant: "Mr. Saad Mehmood",
    applicantCode: "EMP-0481",
    applicantType: "Staff",
    departmentOrClass: "Sciences · Teacher Biology",
    campus: "Bahria Town Campus",
    leaveType: "Casual",
    startDate: "2026-10-01",
    endDate: "2026-10-02",
    days: 2,
    reason: "Relocation logistics during probation period",
    approvedBy: "Ms. Hira Javed",
    hasAttachment: false,
    appliedOn: "2026-09-29",
    status: "Rejected",
    leaveBalanceRemaining: 10,
    leaveBalanceTotal: 10,
  },
];

export const LEAVE_POLICY_QUOTAS = [
  {
    category: "Casual Leave (CL)",
    applicableTo: "All Permanent Staff",
    annualQuota: "10 Days",
    carryForward: "Non-cumulative (lapses Dec 31)",
    approvalAuthority: "Campus Principal / HR Admin",
  },
  {
    category: "Medical / Sick Leave (ML)",
    applicableTo: "Staff & Enrolled Students",
    annualQuota: "12 Days (Staff) · 15 Days (Student)",
    carryForward: "Up to 24 days for Staff with medical cert",
    approvalAuthority: "Class Teacher / HR Admin",
  },
  {
    category: "Annual Earned Leave (EL)",
    applicableTo: "Non-Vacation / Admin Staff",
    annualQuota: "20 Days",
    carryForward: "Encashable up to 10 days annually",
    approvalAuthority: "Super Admin / HR Director",
  },
  {
    category: "Emergency / Bereavement",
    applicableTo: "All Staff & Students",
    annualQuota: "7 Days",
    carryForward: "Case-by-case approval",
    approvalAuthority: "Campus Principal",
  },
];

/* ───────────────────────── Attendance Reports & Analytics ───────────────────────── */

export const MONTHLY_COMPARISON_TREND = [
  { month: "Apr", students: 95.1, staff: 97.8, target: 94.0 },
  { month: "May", students: 93.8, staff: 97.1, target: 94.0 },
  { month: "Jun", students: 88.2, staff: 95.4, target: 94.0 },
  { month: "Jul", students: 90.4, staff: 96.2, target: 94.0 },
  { month: "Aug", students: 94.6, staff: 98.1, target: 94.0 },
  { month: "Sep", students: 95.3, staff: 98.4, target: 94.0 },
  { month: "Oct", students: 93.9, staff: 97.2, target: 94.0 },
];

/** Staff present (incl. late) per campus — sums to the 464 on-duty headcount. */
const CAMPUS_STAFF_ON_DUTY = [143, 109, 91, 82, 39];

const round1 = (n: number) => Math.round(n * 10) / 10;

export const CAMPUS_ATTENDANCE_MATRIX: CampusAttendanceMatrixRow[] = CAMPUSES.map((c, idx) => {
  const today = CAMPUS_ATTENDANCE_TODAY[idx];
  const staffPresent = CAMPUS_STAFF_ON_DUTY[idx];
  return {
    campus: c.campusName,
    campusCode: c.campusCode,
    studentsEnrolled: c.students,
    studentsPresent: today.present,
    studentsAbsent: today.absent,
    studentsLate: today.late,
    studentRate: round1(((today.present + today.late) / c.students) * 100),
    staffTotal: c.staff,
    staffPresent,
    staffRate: round1((staffPresent / c.staff) * 100),
    smsAlertsDispatched: today.absent,
  };
});

const sumOf = <T,>(rows: T[], pick: (row: T) => number) =>
  rows.reduce((acc, row) => acc + pick(row), 0);

/** Institution-wide student figures for today (single source of truth for KPIs). */
export const STUDENT_TODAY = (() => {
  const enrolled = sumOf(CAMPUS_ATTENDANCE_MATRIX, (r) => r.studentsEnrolled);
  const present = sumOf(CAMPUS_ATTENDANCE_MATRIX, (r) => r.studentsPresent);
  const late = sumOf(CAMPUS_ATTENDANCE_MATRIX, (r) => r.studentsLate);
  const absent = sumOf(CAMPUS_ATTENDANCE_MATRIX, (r) => r.studentsAbsent);
  return {
    enrolled,
    present,
    late,
    absent,
    rate: round1(((present + late) / enrolled) * 100),
    previousRate: 94.6,
  };
})();

export const TODAY_DISTRIBUTION_DONUT = [
  { name: "Present", value: STUDENT_TODAY.present, color: "#1e4275" },
  { name: "Late", value: STUDENT_TODAY.late, color: "#0ea5e9" },
  { name: "Absent", value: STUDENT_TODAY.absent, color: "#93c5fd" },
];

/** Headline figures for the chronic-absenteeism programme. */
export const CHRONIC_SUMMARY = {
  belowThreshold: 42,
  critical: 14,
  warning: 28,
  perfectAttendanceStudents: 542,
  perfectAttendanceStaff: 76,
  smsDeliveryRate: 97.6,
};

export const CHRONIC_ABSENTEES: ChronicAbsenteeRecord[] = [
  {
    id: "ca-1",
    admissionNumber: "2026-0424",
    name: "Hassan Javed",
    className: "Grade 9 - B",
    campus: "F-8 Islamabad Campus",
    guardian: "Javed Akhtar",
    phone: "0333-9988776",
    overallRate: 68.4,
    consecutiveDays: 4,
    totalAbsencesTerm: 19,
    lastWarningSent: "2026-10-10",
    riskLevel: "Critical",
  },
  {
    id: "ca-2",
    admissionNumber: "2026-0425",
    name: "Amna Raza",
    className: "Grade 7 - A",
    campus: "Clifton Karachi Campus",
    guardian: "Raza Hussain",
    phone: "0321-4455889",
    overallRate: 71.2,
    consecutiveDays: 3,
    totalAbsencesTerm: 16,
    lastWarningSent: "2026-10-09",
    riskLevel: "Critical",
  },
  {
    id: "ca-3",
    admissionNumber: "2026-0426",
    name: "Saad Butt",
    className: "Grade 10 - C",
    campus: "Main Campus — Gulberg",
    guardian: "Imran Butt",
    phone: "0300-8877665",
    overallRate: 72.8,
    consecutiveDays: 2,
    totalAbsencesTerm: 15,
    lastWarningSent: "2026-10-08",
    riskLevel: "Warning",
  },
  {
    id: "ca-4",
    admissionNumber: "2026-0429",
    name: "Zara Khan",
    className: "Grade 6 - B",
    campus: "DHA Phase 5 Campus",
    guardian: "Shahid Khan",
    phone: "0345-1122334",
    overallRate: 73.5,
    consecutiveDays: 3,
    totalAbsencesTerm: 14,
    lastWarningSent: "2026-10-10",
    riskLevel: "Warning",
  },
  {
    id: "ca-5",
    admissionNumber: "2026-0435",
    name: "Bilal Sheikh",
    className: "Grade 8 - A",
    campus: "Main Campus — Gulberg",
    guardian: "Adnan Sheikh",
    phone: "0301-5566778",
    overallRate: 74.1,
    consecutiveDays: 2,
    totalAbsencesTerm: 13,
    lastWarningSent: "2026-10-07",
    riskLevel: "Warning",
  },
  {
    id: "ca-6",
    admissionNumber: "2026-0441",
    name: "Omer Raza",
    className: "Grade 10 - B",
    campus: "DHA Phase 5 Campus",
    guardian: "Yousaf Raza",
    phone: "0302-6677889",
    overallRate: 69.8,
    consecutiveDays: 5,
    totalAbsencesTerm: 18,
    lastWarningSent: "2026-10-11",
    riskLevel: "Critical",
  },
];

export const ATTENDANCE_REPORT_TEMPLATES = [
  {
    id: "rt-1",
    title: "Monthly Class Attendance Register (Form-B)",
    description: "Day-by-day P/A/L matrix for all sections, ready for principal signature & board audit.",
    format: "PDF / XLSX",
    frequency: "Monthly",
    lastGenerated: "Oct 12, 2026 · 08:30 AM",
  },
  {
    id: "rt-2",
    title: "Staff Biometric & Payroll Deduction Sheet",
    description: "Consolidated late arrivals, short leaves, and uninformed absences linked to October payroll.",
    format: "CSV / XLSX",
    frequency: "Monthly Payroll Cut-off",
    lastGenerated: "Oct 11, 2026 · 05:15 PM",
  },
  {
    id: "rt-3",
    title: "Board Exam Eligibility (<75% Attendance Defaulters)",
    description: "List of secondary & higher-secondary students falling below mandatory 75% board threshold.",
    format: "PDF",
    frequency: "Term-wise",
    lastGenerated: "Oct 10, 2026 · 11:00 AM",
  },
  {
    id: "rt-4",
    title: "Daily Campus Absentee SMS Dispatch Log",
    description: "Delivery audit trail of automated WhatsApp & SMS alerts sent to parents of absent students.",
    format: "CSV",
    frequency: "Daily",
    lastGenerated: "Oct 12, 2026 · 09:00 AM",
  },
];
