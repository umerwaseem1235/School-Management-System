/**
 * Domain types for the Super Admin UI.
 * These mirror the MongoDB collections described in the SMS specification
 * so that the UI can later be wired to real Server Actions / API routes
 * without changing component contracts.
 */

export type ID = string;

export type Status = "Active" | "Inactive" | "Suspended" | "Pending";

export type Role =
  | "Super Admin"
  | "HR Admin"
  | "Teacher"
  | "Student"
  | "Parent";

export interface Campus {
  id: ID;
  campusName: string;
  campusCode: string;
  city: string;
  address: string;
  contactEmail: string;
  phone: string;
  principal: string;
  students: number;
  staff: number;
  capacity: number;
  feeCollectionRate: number;
  status: Status;
  established: number;
}

export interface User {
  id: ID;
  name: string;
  email: string;
  role: Role;
  campus: string;
  status: Status;
  lastLogin: string;
  avatar?: string;
}

export type AdmissionStage =
  | "Inquiry"
  | "Application"
  | "Interview/Test"
  | "Approved"
  | "Enrolled";

export interface AdmissionApplication {
  id: ID;
  applicant: string;
  guardian: string;
  phone: string;
  appliedClass: string;
  campus: string;
  stage: AdmissionStage;
  appliedOn: string;
  score?: number;
}

export type StudentStatus = "Active" | "Transferred" | "Alumni" | "Suspended";

export interface Student {
  id: ID;
  admissionNumber: string;
  rollNo: string;
  name: string;
  gender: "Male" | "Female";
  className: string;
  section: string;
  campus: string;
  guardian: string;
  phone: string;
  attendance: number;
  feeStatus: FeeStatus;
  status: StudentStatus;
  enrolledOn: string;
}

export interface AcademicClass {
  id: ID;
  className: string;
  gradeLevel: number;
  stream: "General" | "Science" | "Arts" | "Commerce";
  campus: string;
  sections: number;
  students: number;
  subjects: number;
  classTeacher: string;
  status: Status;
}

export interface Subject {
  id: ID;
  subjectName: string;
  subjectCode: string;
  className: string;
  isElective: boolean;
  maxMarks: number;
  passMarks: number;
  teacher: string;
}

export interface TimetablePeriod {
  start: string;
  end: string;
  subject: string;
  teacher: string;
  room: string;
}

export type AttendanceStatus = "P" | "A" | "L" | "H" | "E";

export interface ExamTerm {
  id: ID;
  examName: string;
  academicYear: string;
  term: string;
  startDate: string;
  endDate: string;
  campus: string;
  classes: number;
  progress: number;
  status: "Scheduled" | "Ongoing" | "Marks Entry" | "Moderation" | "Published";
}

export interface GradeBand {
  grade: string;
  min: number;
  max: number;
  gpa: number;
  remark: string;
}

export type FeeStatus = "Paid" | "Unpaid" | "Partial" | "Overdue";

export interface FeeChallan {
  id: ID;
  challanNumber: string;
  student: string;
  className: string;
  campus: string;
  monthYear: string;
  dueDate: string;
  totalPayable: number;
  paid: number;
  status: FeeStatus;
}

export interface FeeHead {
  headName: string;
  amount: number;
  frequency: "Monthly" | "Quarterly" | "Annual" | "One-time";
}

export interface FeeStructure {
  id: ID;
  className: string;
  academicYear: string;
  feeHeads: FeeHead[];
}

export interface Employee {
  id: ID;
  empCode: string;
  name: string;
  designation: string;
  department: string;
  campus: string;
  type: "Teaching" | "Non-Teaching";
  joiningDate: string;
  basicSalary: number;
  status: Status;
}

export interface PayrollRun {
  id: ID;
  monthYear: string;
  employees: number;
  gross: number;
  deductions: number;
  net: number;
  status: "Draft" | "Processing" | "Approved" | "Disbursed";
}

export interface LeaveRequest {
  id: ID;
  applicant: string;
  applicantType: "Staff" | "Student";
  leaveType: "Casual" | "Medical" | "Annual" | "Emergency";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

export type AnnouncementAudience =
  | "All School"
  | "Campus-wide"
  | "Class-specific"
  | "Role-specific";

export interface Announcement {
  id: ID;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  channels: ("SMS" | "WhatsApp" | "Email" | "In-App")[];
  author: string;
  publishedAt: string;
  reach: number;
  status: "Published" | "Scheduled" | "Draft";
}

export interface AuditLog {
  id: ID;
  timestamp: string;
  actor: string;
  role: Role;
  action: string;
  module: string;
  target: string;
  ip: string;
  severity: "Info" | "Warning" | "Critical";
}

export interface ActivityItem {
  id: ID;
  title: string;
  description: string;
  time: string;
  type: "admission" | "fee" | "exam" | "hr" | "system";
}
