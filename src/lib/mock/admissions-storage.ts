import { STUDENTS } from "@/lib/mock/institution";
import {
  INITIAL_ADMISSION_APPLICANTS,
  type AdmissionApplicantRecord,
} from "@/lib/mock/admission-tests";
import type { AdmissionApplication, Student, FeeStatus, StudentStatus } from "@/types";

export const STUDENTS_STORAGE_KEY = "edusphere.students.v2";
export const ADMISSIONS_STORAGE_KEY = "edusphere.admissions.v2";

function readList<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function writeList<T>(key: string, records: T[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(records));
  } catch {
    // Keep in memory if storage fails
  }
}

/**
 * Creates canonical initial enrolled admissions directly synced from student records.
 * Ensures the Admissions module only displays actual enrolled students.
 */
function createInitialAdmissions(): AdmissionApplication[] {
  return STUDENTS.map((s, idx) => {
    const isEntryTest = idx % 3 === 0;
    const testScore = isEntryTest ? 75 + ((idx * 7) % 23) : undefined;
    return {
      id: `adm-${s.id}`,
      admissionNumber: s.admissionNumber,
      applicant: s.name,
      guardian: s.guardian,
      phone: s.phone,
      appliedClass: s.className,
      section: s.section,
      campus: s.campus,
      stage: "Enrolled",
      appliedOn: s.enrolledOn,
      score: testScore,
      rollNo: s.rollNo,
      gender: s.gender,
      admissionType: isEntryTest ? "Entry Test" : "Direct Admission",
      status: "Active",
    };
  });
}

/**
 * Read all stored students (persisted in localStorage).
 */
export function getStoredStudents(): Student[] {
  return readList<Student>(STUDENTS_STORAGE_KEY, STUDENTS);
}

/**
 * Persist students list and dispatch update notification.
 */
export function saveStoredStudents(students: Student[]) {
  writeList(STUDENTS_STORAGE_KEY, students);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("edusphere:students-updated", { detail: students }));
  }
}

/**
 * Read all stored enrolled admissions.
 */
export function getStoredAdmissions(): AdmissionApplication[] {
  return readList<AdmissionApplication>(ADMISSIONS_STORAGE_KEY, createInitialAdmissions());
}

/**
 * Persist admissions list and dispatch update notification.
 */
export function saveStoredAdmissions(admissions: AdmissionApplication[]) {
  writeList(ADMISSIONS_STORAGE_KEY, admissions);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("edusphere:admissions-updated", { detail: admissions }));
  }
}

export interface EnrollStudentParams {
  name: string;
  gender?: "Male" | "Female";
  className: string;
  section?: string;
  campus: string;
  guardian: string;
  phone: string;
  rollNo?: string;
  feeStatus?: FeeStatus;
  status?: StudentStatus;
  score?: number;
  admissionType?: "Entry Test" | "Direct Admission";
  admissionNumber?: string;
}

/**
 * Centrally enroll a new student:
 * 1. Generates official admission number (e.g. SMS-2026-0460)
 * 2. Adds student to the Student Information System (Students submodule)
 * 3. Adds matching formal enrolled record to Admissions submodule
 * 4. Dispatches synchronized update events to all active listeners
 */
export function enrollNewStudent(params: EnrollStudentParams): {
  student: Student;
  admission: AdmissionApplication;
} {
  const currentStudents = getStoredStudents();
  const currentAdmissions = getStoredAdmissions();

  const nextSeq = 412 + currentStudents.length + 1;
  const admissionNumber =
    params.admissionNumber || `SMS-2026-${String(nextSeq).padStart(4, "0")}`;
  const rollNo = params.rollNo || String(Math.floor(10 + Math.random() * 40));
  const section = params.section || "A";
  const gender = params.gender || "Male";
  const feeStatus = params.feeStatus || "Paid";
  const status = params.status || "Active";
  const today = new Date().toISOString().slice(0, 10);
  const studentId = `s-${Date.now()}`;
  const admissionId = `adm-${Date.now()}`;
  const admissionType = params.admissionType || (params.score ? "Entry Test" : "Direct Admission");

  const newStudent: Student = {
    id: studentId,
    admissionNumber,
    rollNo,
    name: params.name.trim(),
    gender,
    className: params.className,
    section,
    campus: params.campus,
    guardian: params.guardian.trim(),
    phone: params.phone.trim(),
    attendance: 100,
    feeStatus,
    status,
    enrolledOn: today,
  };

  const newAdmission: AdmissionApplication = {
    id: admissionId,
    admissionNumber,
    applicant: params.name.trim(),
    guardian: params.guardian.trim(),
    phone: params.phone.trim(),
    appliedClass: params.className,
    section,
    campus: params.campus,
    stage: "Enrolled",
    appliedOn: today,
    score: params.score,
    rollNo,
    gender,
    admissionType,
    status: "Active",
  };

  const updatedStudents = [newStudent, ...currentStudents];
  const updatedAdmissions = [newAdmission, ...currentAdmissions];

  saveStoredStudents(updatedStudents);
  saveStoredAdmissions(updatedAdmissions);

  return { student: newStudent, admission: newAdmission };
}

/**
 * Returns list of qualified entry-test candidates from the Admission Tests module
 * who are eligible to be enrolled into the Admissions & Students directory.
 */
export function getQualifiedAdmissionTestCandidates(): (AdmissionApplicantRecord & {
  campus: string;
  isAlreadyEnrolled: boolean;
})[] {
  const currentStudents = getStoredStudents();
  const enrolledNames = new Set(currentStudents.map((s) => s.name.trim().toLowerCase()));

  const results: (AdmissionApplicantRecord & { campus: string; isAlreadyEnrolled: boolean })[] = [];

  Object.values(INITIAL_ADMISSION_APPLICANTS).forEach((applicants) => {
    applicants.forEach((cand) => {
      if (cand.resultStatus === "Qualified" && !cand.isAbsent) {
        const isAlreadyEnrolled =
          cand.decision === "Enrolled" ||
          enrolledNames.has(cand.applicantName.trim().toLowerCase());

        results.push({
          ...cand,
          campus: "Main Campus — Gulberg",
          isAlreadyEnrolled,
        });
      }
    });
  });

  return results.sort((a, b) => b.percentage - a.percentage);
}
