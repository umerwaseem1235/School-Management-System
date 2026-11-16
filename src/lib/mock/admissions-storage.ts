import { STUDENTS } from "@/lib/mock/institution";
import {
  INITIAL_ADMISSION_APPLICANTS,
  type AdmissionApplicantRecord,
} from "@/lib/mock/admission-tests";
import type {
  AdmissionApplication,
  AdmissionDossier,
  Student,
  FeeStatus,
  StudentStatus,
} from "@/types";

export const STUDENTS_STORAGE_KEY = "edusphere.students.v2";
export const ADMISSIONS_STORAGE_KEY = "edusphere.admissions.v2";
export const ADMISSION_DRAFTS_STORAGE_KEY = "edusphere.admission-drafts.v1";

export interface StoredAdmissionDraft<T = Record<string, unknown>> {
  id: string;
  studentName: string;
  applyingClass: string;
  campus: string;
  currentStep: number;
  updatedAt: string;
  data: T;
}

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
  admissionCategory?: "New" | "Transfer";
  admissionNumber?: string;
  enrolledOn?: string;
  dossier?: AdmissionDossier;
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
  const enrolledDate = params.enrolledOn || new Date().toISOString().slice(0, 10);
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
    enrolledOn: enrolledDate,
    dossier: params.dossier,
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
    appliedOn: enrolledDate,
    score: params.score,
    rollNo,
    gender,
    admissionType,
    admissionCategory: params.admissionCategory || params.dossier?.admissionCategory,
    status: "Active",
    dossier: params.dossier,
  };

  const updatedStudents = [newStudent, ...currentStudents];
  const updatedAdmissions = [newAdmission, ...currentAdmissions];

  saveStoredStudents(updatedStudents);
  saveStoredAdmissions(updatedAdmissions);

  return { student: newStudent, admission: newAdmission };
}

/**
 * Read all saved admission drafts from localStorage.
 */
export function getStoredAdmissionDrafts<T = Record<string, unknown>>(): StoredAdmissionDraft<T>[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ADMISSION_DRAFTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredAdmissionDraft<T>[]) : [];
  } catch {
    return [];
  }
}

/**
 * Save or update an admission draft and notify listeners.
 */
export function saveAdmissionDraft<T = Record<string, unknown>>(
  draft: StoredAdmissionDraft<T>
): StoredAdmissionDraft<T>[] {
  const existing = getStoredAdmissionDrafts<T>();
  const filtered = existing.filter((d) => d.id !== draft.id);
  const updated = [draft, ...filtered];
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(ADMISSION_DRAFTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage quota issues safely
    }
    window.dispatchEvent(new CustomEvent("edusphere:admission-drafts-updated", { detail: updated }));
  }
  return updated;
}

/**
 * Delete a saved admission draft by ID and notify listeners.
 */
export function deleteAdmissionDraft(draftId: string): StoredAdmissionDraft[] {
  const existing = getStoredAdmissionDrafts();
  const updated = existing.filter((d) => d.id !== draftId);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(ADMISSION_DRAFTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
    window.dispatchEvent(new CustomEvent("edusphere:admission-drafts-updated", { detail: updated }));
  }
  return updated;
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
