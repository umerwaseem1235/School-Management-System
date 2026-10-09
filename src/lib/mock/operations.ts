import type {
  Announcement,
  AuditLog,
  Employee,
  FeeChallan,
  FeeStructure,
  LeaveRequest,
  PayrollRun,
} from "@/types";

/* ───────────────────────── Finance ───────────────────────── */

export const REVENUE_TREND = [
  { month: "Apr", collected: 41.2, expected: 44.0, expenses: 28.1 },
  { month: "May", collected: 43.8, expected: 45.2, expenses: 29.4 },
  { month: "Jun", collected: 38.5, expected: 45.2, expenses: 27.9 },
  { month: "Jul", collected: 36.1, expected: 45.2, expenses: 30.2 },
  { month: "Aug", collected: 46.9, expected: 47.8, expenses: 31.0 },
  { month: "Sep", collected: 47.6, expected: 48.5, expenses: 30.6 },
  { month: "Oct", collected: 31.4, expected: 48.5, expenses: 18.2 },
];

export const FEE_CHALLANS: FeeChallan[] = [
  { id: "f1", challanNumber: "CH-2610-004812", student: "Zain Ahmed", className: "Grade 9-A", campus: "Gulberg", monthYear: "Oct 2026", dueDate: "2026-10-10", totalPayable: 18500, paid: 18500, status: "Paid" },
  { id: "f2", challanNumber: "CH-2610-004813", student: "Ayesha Khan", className: "Grade 7-B", campus: "DHA Phase 5", monthYear: "Oct 2026", dueDate: "2026-10-10", totalPayable: 16200, paid: 0, status: "Unpaid" },
  { id: "f3", challanNumber: "CH-2610-004814", student: "Hamza Malik", className: "Grade 10-A", campus: "F-8 Islamabad", monthYear: "Oct 2026", dueDate: "2026-10-10", totalPayable: 21000, paid: 10500, status: "Partial" },
  { id: "f4", challanNumber: "CH-2609-003921", student: "Sara Qureshi", className: "Grade 5-C", campus: "Clifton", monthYear: "Sep 2026", dueDate: "2026-09-10", totalPayable: 14800, paid: 0, status: "Overdue" },
  { id: "f5", challanNumber: "CH-2610-004815", student: "Bilal Sheikh", className: "Grade 8-A", campus: "Gulberg", monthYear: "Oct 2026", dueDate: "2026-10-10", totalPayable: 17400, paid: 17400, status: "Paid" },
  { id: "f6", challanNumber: "CH-2610-004816", student: "Iqra Butt", className: "Grade 6-B", campus: "DHA Phase 5", monthYear: "Oct 2026", dueDate: "2026-10-10", totalPayable: 15600, paid: 15600, status: "Paid" },
  { id: "f7", challanNumber: "CH-2609-003955", student: "Omer Raza", className: "Grade 11-A", campus: "DHA Phase 5", monthYear: "Sep 2026", dueDate: "2026-09-10", totalPayable: 24500, paid: 12000, status: "Overdue" },
  { id: "f8", challanNumber: "CH-2610-004817", student: "Noor Javed", className: "Grade 4-A", campus: "F-8 Islamabad", monthYear: "Oct 2026", dueDate: "2026-10-10", totalPayable: 13900, paid: 0, status: "Unpaid" },
  { id: "f9", challanNumber: "CH-2610-004818", student: "Taha Hussain", className: "Grade 12-A", campus: "F-8 Islamabad", monthYear: "Oct 2026", dueDate: "2026-10-10", totalPayable: 26800, paid: 26800, status: "Paid" },
  { id: "f10", challanNumber: "CH-2610-004819", student: "Laiba Siddiqui", className: "Grade 3-B", campus: "Clifton", monthYear: "Oct 2026", dueDate: "2026-10-10", totalPayable: 13200, paid: 6600, status: "Partial" },
];

export const FEE_STRUCTURES: FeeStructure[] = [
  {
    id: "fs1",
    className: "Primary (Grade 1–5)",
    academicYear: "2026–27",
    feeHeads: [
      { headName: "Tuition Fee", amount: 11500, frequency: "Monthly" },
      { headName: "Computer Lab", amount: 800, frequency: "Monthly" },
      { headName: "Sports & Activities", amount: 600, frequency: "Monthly" },
      { headName: "Annual Charges", amount: 9000, frequency: "Annual" },
      { headName: "Admission Fee", amount: 25000, frequency: "One-time" },
    ],
  },
  {
    id: "fs2",
    className: "Middle (Grade 6–8)",
    academicYear: "2026–27",
    feeHeads: [
      { headName: "Tuition Fee", amount: 13800, frequency: "Monthly" },
      { headName: "Science Lab", amount: 1000, frequency: "Monthly" },
      { headName: "Computer Lab", amount: 900, frequency: "Monthly" },
      { headName: "Sports & Activities", amount: 700, frequency: "Monthly" },
      { headName: "Annual Charges", amount: 11000, frequency: "Annual" },
    ],
  },
  {
    id: "fs3",
    className: "Secondary (Grade 9–10)",
    academicYear: "2026–27",
    feeHeads: [
      { headName: "Tuition Fee", amount: 16200, frequency: "Monthly" },
      { headName: "Science Lab", amount: 1400, frequency: "Monthly" },
      { headName: "Board Registration", amount: 6500, frequency: "Annual" },
      { headName: "Examination Fee", amount: 3500, frequency: "Quarterly" },
      { headName: "Annual Charges", amount: 13000, frequency: "Annual" },
    ],
  },
];

export const SCHOLARSHIPS = [
  { name: "Sibling Discount", type: "Concession", rule: "2nd child 10%, 3rd+ child 15%", beneficiaries: 642, monthlyValue: 1148000 },
  { name: "Merit Scholarship", type: "Scholarship", rule: "≥ 90% in finals — 50% tuition", beneficiaries: 186, monthlyValue: 1395000 },
  { name: "Need-Based Aid", type: "Financial Aid", rule: "Committee approved — up to 100%", beneficiaries: 94, monthlyValue: 1082000 },
  { name: "Staff Ward Concession", type: "Concession", rule: "Children of employees — 50%", beneficiaries: 121, monthlyValue: 905000 },
];

export const EXPENSES = [
  { category: "Salaries", value: 38.4 },
  { category: "Utilities", value: 4.2 },
  { category: "Maintenance", value: 2.6 },
  { category: "Supplies", value: 1.8 },
  { category: "Technology", value: 1.4 },
  { category: "Events", value: 0.9 },
];

/* ───────────────────────── HR & Payroll ───────────────────────── */

export const EMPLOYEES: Employee[] = [
  { id: "em1", empCode: "EMP-0012", name: "Dr. Ayesha Siddiqui", designation: "Principal", department: "Administration", campus: "Gulberg", type: "Non-Teaching", joiningDate: "2008-08-01", basicSalary: 420000, status: "Active" },
  { id: "em2", empCode: "EMP-0148", name: "Mr. Adeel Hassan", designation: "Senior Teacher — Mathematics", department: "Sciences", campus: "Gulberg", type: "Teaching", joiningDate: "2014-03-15", basicSalary: 165000, status: "Active" },
  { id: "em3", empCode: "EMP-0211", name: "Mrs. Maryam Shah", designation: "Head of English", department: "Languages", campus: "Gulberg", type: "Teaching", joiningDate: "2016-08-01", basicSalary: 158000, status: "Active" },
  { id: "em4", empCode: "EMP-0274", name: "Mr. Usman Ali", designation: "Teacher — Computer Science", department: "Technology", campus: "DHA Phase 5", type: "Teaching", joiningDate: "2019-01-10", basicSalary: 118000, status: "Active" },
  { id: "em5", empCode: "EMP-0302", name: "Dr. Saima Riaz", designation: "Senior Teacher — Physics", department: "Sciences", campus: "F-8 Islamabad", type: "Teaching", joiningDate: "2015-09-01", basicSalary: 172000, status: "Active" },
  { id: "em6", empCode: "EMP-0355", name: "Ms. Nadia Hussain", designation: "HR Manager", department: "Human Resources", campus: "Gulberg", type: "Non-Teaching", joiningDate: "2017-05-22", basicSalary: 185000, status: "Active" },
  { id: "em7", empCode: "EMP-0389", name: "Mr. Tariq Mehmood", designation: "Accounts Officer", department: "Finance", campus: "DHA Phase 5", type: "Non-Teaching", joiningDate: "2018-11-05", basicSalary: 128000, status: "Active" },
  { id: "em8", empCode: "EMP-0412", name: "Mr. Bilal Saeed", designation: "Teacher — Chemistry", department: "Sciences", campus: "Clifton", type: "Teaching", joiningDate: "2020-08-01", basicSalary: 104000, status: "Suspended" },
  { id: "em9", empCode: "EMP-0447", name: "Ms. Kiran Aziz", designation: "Teacher — Urdu", department: "Languages", campus: "Gulberg", type: "Teaching", joiningDate: "2021-02-15", basicSalary: 96000, status: "Active" },
  { id: "em10", empCode: "EMP-0481", name: "Mr. Saad Mehmood", designation: "Teacher — Biology", department: "Sciences", campus: "Bahria Town", type: "Teaching", joiningDate: "2026-09-01", basicSalary: 92000, status: "Pending" },
];

export const PAYROLL_RUNS: PayrollRun[] = [
  { id: "p1", monthYear: "October 2026", employees: 479, gross: 0, deductions: 0, net: 0, status: "Draft" },
  { id: "p2", monthYear: "September 2026", employees: 479, gross: 43_820_000, deductions: 5_410_000, net: 38_410_000, status: "Approved" },
  { id: "p3", monthYear: "August 2026", employees: 474, gross: 43_160_000, deductions: 5_320_000, net: 37_840_000, status: "Disbursed" },
  { id: "p4", monthYear: "July 2026", employees: 468, gross: 42_480_000, deductions: 5_240_000, net: 37_240_000, status: "Disbursed" },
  { id: "p5", monthYear: "June 2026", employees: 466, gross: 42_310_000, deductions: 5_210_000, net: 37_100_000, status: "Disbursed" },
];

export const LEAVE_REQUESTS: LeaveRequest[] = [
  { id: "l1", applicant: "Mrs. Maryam Shah", applicantType: "Staff", leaveType: "Medical", startDate: "2026-10-08", endDate: "2026-10-10", days: 3, reason: "Post-surgery recovery", status: "Pending" },
  { id: "l2", applicant: "Mr. Usman Ali", applicantType: "Staff", leaveType: "Casual", startDate: "2026-10-14", endDate: "2026-10-14", days: 1, reason: "Family commitment", status: "Pending" },
  { id: "l3", applicant: "Zain Ahmed (Grade 9-A)", applicantType: "Student", leaveType: "Medical", startDate: "2026-10-06", endDate: "2026-10-07", days: 2, reason: "Fever — doctor's note attached", status: "Approved" },
  { id: "l4", applicant: "Ms. Kiran Aziz", applicantType: "Staff", leaveType: "Annual", startDate: "2026-12-20", endDate: "2026-12-31", days: 10, reason: "Annual vacation", status: "Pending" },
  { id: "l5", applicant: "Mr. Tariq Mehmood", applicantType: "Staff", leaveType: "Emergency", startDate: "2026-10-02", endDate: "2026-10-03", days: 2, reason: "Family emergency", status: "Approved" },
  { id: "l6", applicant: "Hira Qureshi (Grade 6-C)", applicantType: "Student", leaveType: "Casual", startDate: "2026-10-09", endDate: "2026-10-09", days: 1, reason: "Wedding in family", status: "Rejected" },
];

export const DEPARTMENT_HEADCOUNT = [
  { department: "Sciences", teaching: 86, nonTeaching: 12 },
  { department: "Languages", teaching: 74, nonTeaching: 6 },
  { department: "Humanities", teaching: 58, nonTeaching: 5 },
  { department: "Technology", teaching: 32, nonTeaching: 14 },
  { department: "Primary", teaching: 96, nonTeaching: 18 },
  { department: "Admin & Ops", teaching: 0, nonTeaching: 78 },
];

/* ───────────────────────── Communication ───────────────────────── */

export const ANNOUNCEMENTS: Announcement[] = [
  { id: "n1", title: "Mid-Term Examination Datesheet Released", body: "The Mid-Term datesheet for Grades 6–10 has been published. Exams commence on 12 October.", audience: "All School", channels: ["SMS", "WhatsApp", "Email", "In-App"], author: "Academic Office", publishedAt: "2026-10-07T06:00:00Z", reach: 5662, status: "Published" },
  { id: "n2", title: "Parent–Teacher Meeting — Saturday", body: "PTM for Grades 1–5 will be held on Saturday, 17 October from 9:00 AM to 1:00 PM.", audience: "Campus-wide", channels: ["WhatsApp", "In-App"], author: "Gulberg Principal Office", publishedAt: "2026-10-06T09:30:00Z", reach: 1842, status: "Published" },
  { id: "n3", title: "October Fee Challans Issued", body: "Fee challans for October are now available on the parent portal. Due date: 10 October.", audience: "Role-specific", channels: ["SMS", "WhatsApp", "Email"], author: "Finance Department", publishedAt: "2026-10-01T05:00:00Z", reach: 5250, status: "Published" },
  { id: "n4", title: "Quaid Day Holiday Notice", body: "School will remain closed on 25 December on account of Quaid-e-Azam Day.", audience: "All School", channels: ["In-App", "Email"], author: "Administration", publishedAt: "2026-12-20T05:00:00Z", reach: 0, status: "Scheduled" },
  { id: "n5", title: "Science Fair Registration", body: "Grade 8 students can register for the inter-campus science fair until 30 October.", audience: "Class-specific", channels: ["In-App"], author: "Science Department", publishedAt: "", reach: 0, status: "Draft" },
];

export const CHANNEL_STATS = [
  { channel: "SMS", sent: 18420, delivered: 17986, rate: 97.6 },
  { channel: "WhatsApp", sent: 22140, delivered: 21802, rate: 98.5 },
  { channel: "Email", sent: 9870, delivered: 9214, rate: 93.4 },
  { channel: "In-App", sent: 31250, delivered: 31250, rate: 100 },
];

/* ───────────────────────── Dashboard snapshot (Oct 2026) ─────────────────────────
   Central source for the executive KPI cards. Fee figures tie to REVENUE_TREND
   (Oct: expected 48.5M, collected 31.4M); payroll figures tie to PAYROLL_RUNS
   (Sep net 38.41M approved, Oct draft for 479 employees). */

export const DASHBOARD_SNAPSHOT = {
  activeMonthLabel: "Oct 2026",
  totalFamilies: 3854,
  receivableOct: 48_500_000,
  receivedOct: 31_400_000,
  balancesOct: 48_500_000 - 31_400_000,
  todayCollection: 1_284_500,
  todayReceipts: 142,
  outstandingChallans: 1986,
  collectionRateOct: 31.4 / 48.5,
  salaryPayableOct: 44_150_000,
  salaryPaidOct: 9_450_000,
  salaryHeadcountOct: 479,
  // Sep approved batch (38.41M) still pending + Oct unpaid balance
  totalSalaryPayable: 38_410_000 + (44_150_000 - 9_450_000),
  studentBirthdaysToday: 6,
  studentBirthdaysMonth: 148,
  staffBirthdaysToday: 1,
  staffBirthdaysMonth: 22,
};

/* ───────────────────────── Audit ───────────────────────── */

export const AUDIT_LOGS: AuditLog[] = [
  { id: "al1", timestamp: "2026-10-07T07:41:12Z", actor: "Hamza Tariq", role: "Super Admin", action: "Published exam datesheet", module: "Examinations", target: "Mid-Term 2026–27", ip: "39.45.112.18", severity: "Info" },
  { id: "al2", timestamp: "2026-10-07T07:12:48Z", actor: "Nadia Hussain", role: "HR Admin", action: "Approved payroll batch", module: "Payroll", target: "September 2026", ip: "39.45.112.42", severity: "Warning" },
  { id: "al3", timestamp: "2026-10-07T06:55:03Z", actor: "Hina Rauf", role: "Super Admin", action: "Fee override applied", module: "Fees", target: "CH-2610-004814 (−Rs 2,000)", ip: "182.180.54.9", severity: "Critical" },
  { id: "al4", timestamp: "2026-10-07T06:20:31Z", actor: "Usman Ali", role: "Teacher", action: "Modified marks", module: "Examinations", target: "Grade 9-A · CS · Practical", ip: "111.88.20.7", severity: "Warning" },
  { id: "al5", timestamp: "2026-10-07T05:48:19Z", actor: "Hamza Tariq", role: "Super Admin", action: "Updated role permissions", module: "RBAC", target: "HR Admin", ip: "39.45.112.18", severity: "Critical" },
  { id: "al6", timestamp: "2026-10-07T05:30:00Z", actor: "System", role: "Super Admin", action: "Automated backup completed", module: "System", target: "Atlas snapshot #2291", ip: "—", severity: "Info" },
  { id: "al7", timestamp: "2026-10-06T16:04:55Z", actor: "Hina Rauf", role: "Super Admin", action: "Deleted user account", module: "Users", target: "temp.staff@edusphere.edu.pk", ip: "182.180.54.9", severity: "Critical" },
  { id: "al8", timestamp: "2026-10-06T14:22:10Z", actor: "Maryam Shah", role: "Teacher", action: "Marked attendance", module: "Attendance", target: "Grade 8-B (31 students)", ip: "111.88.20.31", severity: "Info" },
  { id: "al9", timestamp: "2026-10-06T11:18:44Z", actor: "Rabia Noor", role: "HR Admin", action: "Created employee profile", module: "HR", target: "EMP-0481 Saad Mehmood", ip: "103.255.4.66", severity: "Info" },
  { id: "al10", timestamp: "2026-10-06T09:02:37Z", actor: "Hamza Tariq", role: "Super Admin", action: "Approved student transfer", module: "Students", target: "SMS-2026-0431 → F-8 Islamabad", ip: "39.45.112.18", severity: "Warning" },
];
