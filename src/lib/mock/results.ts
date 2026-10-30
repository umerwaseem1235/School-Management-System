// Pakistani School System — Examination Results & Detailed Marks Certificates (DMC) Mock Data

export type ResultStatus = "Passed" | "Fail" | "Compartment";

export interface PakistaniResultStatusInfo {
  value: ResultStatus;
  label: string;
  urdu: string;
  description: string;
  tone: "success" | "danger" | "warning";
}

export const PAKISTANI_RESULT_STATUSES: PakistaniResultStatusInfo[] = [
  {
    value: "Passed",
    label: "Passed",
    urdu: "پاس",
    description: "Cleared all compulsory and elective subjects with passing marks (≥ 33%).",
    tone: "success",
  },
  {
    value: "Compartment",
    label: "Compartment",
    urdu: "کمپارٹمنٹ",
    description: "Failed in 1 or 2 subjects. Eligible for supplementary re-examination.",
    tone: "warning",
  },
  {
    value: "Fail",
    label: "Fail",
    urdu: "فیل",
    description: "Failed in 3 or more subjects or failed to achieve the passing aggregate.",
    tone: "danger",
  },
];

export type PublicationStatus = "Published" | "Under Review" | "Draft";

export interface ResultSubjectScore {
  subjectName: string;
  maxMarks: number;
  passMarks: number;
  obtainedMarks: number;
  grade: string;
  isPassed: boolean;
  remarks?: string;
}

export interface StudentTermResult {
  id: string;
  rollNo: string;
  studentName: string;
  fatherName: string;
  className: string;
  termId: string;
  termName: string;
  campus: string;
  subjects: ResultSubjectScore[];
  totalMaxMarks: number;
  totalObtainedMarks: number;
  percentage: number;
  overallGrade: string;
  position: number;
  status: ResultStatus;
  attendancePercentage: number;
  teacherRemarks: string;
  isWithheld?: boolean;
}

export interface ClassResultDeclaration {
  id: string;
  termId: string;
  termName: string;
  className: string;
  campus: string;
  totalStudents: number;
  passedCount: number;
  passPercentage: number;
  averagePercentage: number;
  status: PublicationStatus;
  declarationDate: string;
  compiledBy: string;
}

export interface GradeScaleBand {
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  description: string;
  isPass: boolean;
}

export const ACADEMIC_GRADING_SCALE: GradeScaleBand[] = [
  { grade: "A+", minPercentage: 80, maxPercentage: 100, description: "Outstanding", isPass: true },
  { grade: "A", minPercentage: 70, maxPercentage: 79.99, description: "Excellent", isPass: true },
  { grade: "B", minPercentage: 60, maxPercentage: 69.99, description: "Very Good", isPass: true },
  { grade: "C", minPercentage: 50, maxPercentage: 59.99, description: "Good", isPass: true },
  { grade: "D", minPercentage: 40, maxPercentage: 49.99, description: "Fair", isPass: true },
  { grade: "E", minPercentage: 33, maxPercentage: 39.99, description: "Minimum Pass", isPass: true },
  { grade: "F", minPercentage: 0, maxPercentage: 32.99, description: "Fail", isPass: false },
];

export function calculateGradeFromPercentage(pct: number): {
  grade: string;
  description: string;
  isPass: boolean;
} {
  if (pct >= 80) return { grade: "A+", description: "Outstanding", isPass: true };
  if (pct >= 70) return { grade: "A", description: "Excellent", isPass: true };
  if (pct >= 60) return { grade: "B", description: "Very Good", isPass: true };
  if (pct >= 50) return { grade: "C", description: "Good", isPass: true };
  if (pct >= 40) return { grade: "D", description: "Fair", isPass: true };
  if (pct >= 33) return { grade: "E", description: "Minimum Pass", isPass: true };
  return { grade: "F", description: "Fail", isPass: false };
}

export const RESULT_TERMS = [
  "Mid-Term Examination 2026–27",
  "First Term Examination 2026",
  "Send-Up Examination 2026–27",
  "Annual Examination 2026",
];

export const RESULT_CLASSES = [
  "Grade 10th (Science - Biology)",
  "Grade 10th (Science - Computer)",
  "Grade 9th (Science - Biology)",
  "Grade 9th (Science - Computer)",
  "Grade 8-A",
  "Grade 7-A",
];

export const INITIAL_STUDENT_RESULTS: StudentTermResult[] = [
  // ================= Grade 10th (Science - Biology) — Mid-Term 2026–27 =================
  {
    id: "res-101",
    rollNo: "1001",
    studentName: "Muhammad Hamza",
    fatherName: "Tariq Mahmood",
    className: "Grade 10th (Science - Biology)",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    campus: "Main Campus — Gulberg",
    totalMaxMarks: 550,
    totalObtainedMarks: 502,
    percentage: 91.27,
    overallGrade: "A+",
    position: 1,
    status: "Passed",
    attendancePercentage: 96,
    teacherRemarks: "Exceptional academic performance and analytical skills. Maintains first position in class.",
    subjects: [
      { subjectName: "English (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 68, grade: "A+", isPassed: true, remarks: "Fluent expression" },
      { subjectName: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 67, grade: "A+", isPassed: true, remarks: "Very neat handwriting" },
      { subjectName: "Mathematics (Science)", maxMarks: 75, passMarks: 25, obtainedMarks: 72, grade: "A+", isPassed: true, remarks: "Excellent algebra solving" },
      { subjectName: "Biology", maxMarks: 75, passMarks: 25, obtainedMarks: 70, grade: "A+", isPassed: true, remarks: "Clear diagrammatic work" },
      { subjectName: "Physics", maxMarks: 75, passMarks: 25, obtainedMarks: 69, grade: "A+", isPassed: true, remarks: "Strong conceptual understanding" },
      { subjectName: "Chemistry", maxMarks: 75, passMarks: 25, obtainedMarks: 66, grade: "A", isPassed: true, remarks: "Good lab aptitude" },
      { subjectName: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17, obtainedMarks: 46, grade: "A+", isPassed: true, remarks: "Outstanding" },
      { subjectName: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17, obtainedMarks: 44, grade: "A+", isPassed: true, remarks: "Accurate translation" },
    ],
  },
  {
    id: "res-102",
    rollNo: "1002",
    studentName: "Ayesha Fatima",
    fatherName: "Dr. Rashid Minhas",
    className: "Grade 10th (Science - Biology)",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    campus: "Main Campus — Gulberg",
    totalMaxMarks: 550,
    totalObtainedMarks: 488,
    percentage: 88.73,
    overallGrade: "A+",
    position: 2,
    status: "Passed",
    attendancePercentage: 98,
    teacherRemarks: "Brilliant, disciplined and thoroughly consistent in all scientific subjects.",
    subjects: [
      { subjectName: "English (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 70, grade: "A+", isPassed: true, remarks: "Excellent vocabulary" },
      { subjectName: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 65, grade: "A", isPassed: true, remarks: "Very good" },
      { subjectName: "Mathematics (Science)", maxMarks: 75, passMarks: 25, obtainedMarks: 68, grade: "A+", isPassed: true, remarks: "Sound logical steps" },
      { subjectName: "Biology", maxMarks: 75, passMarks: 25, obtainedMarks: 71, grade: "A+", isPassed: true, remarks: "Highest in Botany unit" },
      { subjectName: "Physics", maxMarks: 75, passMarks: 25, obtainedMarks: 64, grade: "A", isPassed: true, remarks: "Well prepared" },
      { subjectName: "Chemistry", maxMarks: 75, passMarks: 25, obtainedMarks: 62, grade: "A", isPassed: true, remarks: "Good chemical equations" },
      { subjectName: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17, obtainedMarks: 45, grade: "A+", isPassed: true, remarks: "Excellent" },
      { subjectName: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17, obtainedMarks: 43, grade: "A+", isPassed: true, remarks: "Very good" },
    ],
  },
  {
    id: "res-103",
    rollNo: "1003",
    studentName: "Zainab Bibi",
    fatherName: "Muhammad Farooq",
    className: "Grade 10th (Science - Biology)",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    campus: "Main Campus — Gulberg",
    totalMaxMarks: 550,
    totalObtainedMarks: 462,
    percentage: 84.00,
    overallGrade: "A+",
    position: 3,
    status: "Passed",
    attendancePercentage: 94,
    teacherRemarks: "Secured third position with high marks in Biology and English. Keep up the high standard.",
    subjects: [
      { subjectName: "English (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 66, grade: "A", isPassed: true },
      { subjectName: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 63, grade: "A", isPassed: true },
      { subjectName: "Mathematics (Science)", maxMarks: 75, passMarks: 25, obtainedMarks: 61, grade: "A", isPassed: true },
      { subjectName: "Biology", maxMarks: 75, passMarks: 25, obtainedMarks: 67, grade: "A+", isPassed: true },
      { subjectName: "Physics", maxMarks: 75, passMarks: 25, obtainedMarks: 60, grade: "A", isPassed: true },
      { subjectName: "Chemistry", maxMarks: 75, passMarks: 25, obtainedMarks: 58, grade: "B", isPassed: true },
      { subjectName: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17, obtainedMarks: 44, grade: "A+", isPassed: true },
      { subjectName: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17, obtainedMarks: 43, grade: "A+", isPassed: true },
    ],
  },
  {
    id: "res-104",
    rollNo: "1004",
    studentName: "Bilal Ahmed",
    fatherName: "Zulfiqar Ali",
    className: "Grade 10th (Science - Biology)",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    campus: "Main Campus — Gulberg",
    totalMaxMarks: 550,
    totalObtainedMarks: 425,
    percentage: 77.27,
    overallGrade: "A",
    position: 4,
    status: "Passed",
    attendancePercentage: 91,
    teacherRemarks: "Very good progress overall. Focus slightly more on Chemistry numericals for board prep.",
    subjects: [
      { subjectName: "English (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 60, grade: "A", isPassed: true },
      { subjectName: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 58, grade: "B", isPassed: true },
      { subjectName: "Mathematics (Science)", maxMarks: 75, passMarks: 25, obtainedMarks: 57, grade: "B", isPassed: true },
      { subjectName: "Biology", maxMarks: 75, passMarks: 25, obtainedMarks: 62, grade: "A", isPassed: true },
      { subjectName: "Physics", maxMarks: 75, passMarks: 25, obtainedMarks: 56, grade: "B", isPassed: true },
      { subjectName: "Chemistry", maxMarks: 75, passMarks: 25, obtainedMarks: 52, grade: "C", isPassed: true },
      { subjectName: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17, obtainedMarks: 41, grade: "A+", isPassed: true },
      { subjectName: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17, obtainedMarks: 39, grade: "A", isPassed: true },
    ],
  },
  {
    id: "res-105",
    rollNo: "1005",
    studentName: "Syed Ali Raza",
    fatherName: "Syed Qasim Raza",
    className: "Grade 10th (Science - Biology)",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    campus: "Main Campus — Gulberg",
    totalMaxMarks: 550,
    totalObtainedMarks: 395,
    percentage: 71.82,
    overallGrade: "A",
    position: 5,
    status: "Passed",
    attendancePercentage: 88,
    teacherRemarks: "Active participant in class. Can easily achieve A+ grade with daily homework practice.",
    subjects: [
      { subjectName: "English (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 55, grade: "B", isPassed: true },
      { subjectName: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 54, grade: "B", isPassed: true },
      { subjectName: "Mathematics (Science)", maxMarks: 75, passMarks: 25, obtainedMarks: 51, grade: "C", isPassed: true },
      { subjectName: "Biology", maxMarks: 75, passMarks: 25, obtainedMarks: 58, grade: "B", isPassed: true },
      { subjectName: "Physics", maxMarks: 75, passMarks: 25, obtainedMarks: 53, grade: "C", isPassed: true },
      { subjectName: "Chemistry", maxMarks: 75, passMarks: 25, obtainedMarks: 49, grade: "C", isPassed: true },
      { subjectName: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17, obtainedMarks: 38, grade: "A", isPassed: true },
      { subjectName: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17, obtainedMarks: 37, grade: "A", isPassed: true },
    ],
  },
  {
    id: "res-106",
    rollNo: "1006",
    studentName: "Fatima Zahra",
    fatherName: "Anwar ul Haq",
    className: "Grade 10th (Science - Biology)",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    campus: "Main Campus — Gulberg",
    totalMaxMarks: 550,
    totalObtainedMarks: 358,
    percentage: 65.09,
    overallGrade: "B",
    position: 6,
    status: "Passed",
    attendancePercentage: 92,
    teacherRemarks: "Satisfactory overall result. Needs additional tutoring in Physics and Mathematics.",
    subjects: [
      { subjectName: "English (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 52, grade: "C", isPassed: true },
      { subjectName: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 56, grade: "B", isPassed: true },
      { subjectName: "Mathematics (Science)", maxMarks: 75, passMarks: 25, obtainedMarks: 44, grade: "D", isPassed: true },
      { subjectName: "Biology", maxMarks: 75, passMarks: 25, obtainedMarks: 54, grade: "B", isPassed: true },
      { subjectName: "Physics", maxMarks: 75, passMarks: 25, obtainedMarks: 42, grade: "D", isPassed: true },
      { subjectName: "Chemistry", maxMarks: 75, passMarks: 25, obtainedMarks: 46, grade: "D", isPassed: true },
      { subjectName: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17, obtainedMarks: 34, grade: "B", isPassed: true },
      { subjectName: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17, obtainedMarks: 30, grade: "B", isPassed: true },
    ],
  },
  {
    id: "res-107",
    rollNo: "1007",
    studentName: "Usman Ghani",
    fatherName: "Karamat Ullah",
    className: "Grade 10th (Science - Biology)",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    campus: "Main Campus — Gulberg",
    totalMaxMarks: 550,
    totalObtainedMarks: 295,
    percentage: 53.64,
    overallGrade: "C",
    position: 7,
    status: "Passed",
    attendancePercentage: 83,
    teacherRemarks: "Average performance. Requires immediate focus on sciences and regular attendance.",
    subjects: [
      { subjectName: "English (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 42, grade: "D", isPassed: true },
      { subjectName: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 46, grade: "D", isPassed: true },
      { subjectName: "Mathematics (Science)", maxMarks: 75, passMarks: 25, obtainedMarks: 38, grade: "E", isPassed: true },
      { subjectName: "Biology", maxMarks: 75, passMarks: 25, obtainedMarks: 45, grade: "D", isPassed: true },
      { subjectName: "Physics", maxMarks: 75, passMarks: 25, obtainedMarks: 36, grade: "E", isPassed: true },
      { subjectName: "Chemistry", maxMarks: 75, passMarks: 25, obtainedMarks: 35, grade: "E", isPassed: true },
      { subjectName: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17, obtainedMarks: 28, grade: "C", isPassed: true },
      { subjectName: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17, obtainedMarks: 25, grade: "C", isPassed: true },
    ],
  },
  {
    id: "res-108",
    rollNo: "1008",
    studentName: "Hassan Tariq",
    fatherName: "Tariq Jameel",
    className: "Grade 10th (Science - Biology)",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    campus: "Main Campus — Gulberg",
    totalMaxMarks: 550,
    totalObtainedMarks: 228,
    percentage: 41.45,
    overallGrade: "D",
    position: 8,
    status: "Compartment",
    attendancePercentage: 74,
    teacherRemarks: "Failed in Physics. Eligible for compartment re-examination before pre-board exams.",
    subjects: [
      { subjectName: "English (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 36, grade: "E", isPassed: true },
      { subjectName: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 40, grade: "D", isPassed: true },
      { subjectName: "Mathematics (Science)", maxMarks: 75, passMarks: 25, obtainedMarks: 33, grade: "E", isPassed: true },
      { subjectName: "Biology", maxMarks: 75, passMarks: 25, obtainedMarks: 37, grade: "E", isPassed: true },
      { subjectName: "Physics", maxMarks: 75, passMarks: 25, obtainedMarks: 19, grade: "F", isPassed: false, remarks: "Compartment" },
      { subjectName: "Chemistry", maxMarks: 75, passMarks: 25, obtainedMarks: 32, grade: "E", isPassed: true },
      { subjectName: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17, obtainedMarks: 18, grade: "E", isPassed: true },
      { subjectName: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17, obtainedMarks: 20, grade: "E", isPassed: true },
    ],
  },
  {
    id: "res-109",
    rollNo: "1009",
    studentName: "Danish Munir",
    fatherName: "Munir Hussain",
    className: "Grade 10th (Science - Biology)",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    campus: "Main Campus — Gulberg",
    totalMaxMarks: 550,
    totalObtainedMarks: 168,
    percentage: 30.55,
    overallGrade: "F",
    position: 9,
    status: "Fail",
    attendancePercentage: 62,
    teacherRemarks: "Failed in 3 science subjects (Mathematics, Physics, Chemistry). Failed to obtain minimum pass marks in science subjects. Declared Fail.",
    subjects: [
      { subjectName: "English (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 28, grade: "E", isPassed: true },
      { subjectName: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 32, grade: "E", isPassed: true },
      { subjectName: "Mathematics (Science)", maxMarks: 75, passMarks: 25, obtainedMarks: 16, grade: "F", isPassed: false, remarks: "Fail" },
      { subjectName: "Biology", maxMarks: 75, passMarks: 25, obtainedMarks: 30, grade: "E", isPassed: true },
      { subjectName: "Physics", maxMarks: 75, passMarks: 25, obtainedMarks: 18, grade: "F", isPassed: false, remarks: "Fail" },
      { subjectName: "Chemistry", maxMarks: 75, passMarks: 25, obtainedMarks: 17, grade: "F", isPassed: false, remarks: "Fail" },
      { subjectName: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17, obtainedMarks: 14, grade: "F", isPassed: false, remarks: "Fail" },
      { subjectName: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17, obtainedMarks: 13, grade: "F", isPassed: false, remarks: "Fail" },
    ],
  },
  {
    id: "res-110",
    rollNo: "1010",
    studentName: "Khadija Tul Kubra",
    fatherName: "Tariq Mehmood",
    className: "Grade 10th (Science - Biology)",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    campus: "Main Campus — Gulberg",
    totalMaxMarks: 550,
    totalObtainedMarks: 442,
    percentage: 80.36,
    overallGrade: "A+",
    position: 4,
    status: "Passed",
    attendancePercentage: 95,
    teacherRemarks: "Outstanding academic record. Outstanding academic record with A+ grade in all subjects. Cleared examination with distinction.",
    subjects: [
      { subjectName: "English (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 64, grade: "A", isPassed: true },
      { subjectName: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 62, grade: "A", isPassed: true },
      { subjectName: "Mathematics (Science)", maxMarks: 75, passMarks: 25, obtainedMarks: 66, grade: "A+", isPassed: true },
      { subjectName: "Biology", maxMarks: 75, passMarks: 25, obtainedMarks: 65, grade: "A", isPassed: true },
      { subjectName: "Physics", maxMarks: 75, passMarks: 25, obtainedMarks: 58, grade: "B", isPassed: true },
      { subjectName: "Chemistry", maxMarks: 75, passMarks: 25, obtainedMarks: 55, grade: "B", isPassed: true },
      { subjectName: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17, obtainedMarks: 37, grade: "A", isPassed: true },
      { subjectName: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17, obtainedMarks: 35, grade: "A", isPassed: true },
    ],
  },
  {
    id: "res-111",
    rollNo: "1011",
    studentName: "Shahmeer Abbasi",
    fatherName: "Naveed Abbasi",
    className: "Grade 10th (Science - Biology)",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    campus: "Main Campus — Gulberg",
    totalMaxMarks: 550,
    totalObtainedMarks: 0,
    percentage: 0.0,
    overallGrade: "F",
    position: 11,
    status: "Fail",
    attendancePercentage: 35,
    teacherRemarks: "Candidate was absent across examination sessions (0 marks aggregate). Result declared Fail.",
    subjects: [
      { subjectName: "English (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 0, grade: "F", isPassed: false, remarks: "Absent" },
      { subjectName: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 0, grade: "F", isPassed: false, remarks: "Absent" },
      { subjectName: "Mathematics (Science)", maxMarks: 75, passMarks: 25, obtainedMarks: 0, grade: "F", isPassed: false, remarks: "Absent" },
      { subjectName: "Biology", maxMarks: 75, passMarks: 25, obtainedMarks: 0, grade: "F", isPassed: false, remarks: "Absent" },
      { subjectName: "Physics", maxMarks: 75, passMarks: 25, obtainedMarks: 0, grade: "F", isPassed: false, remarks: "Absent" },
      { subjectName: "Chemistry", maxMarks: 75, passMarks: 25, obtainedMarks: 0, grade: "F", isPassed: false, remarks: "Absent" },
      { subjectName: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17, obtainedMarks: 0, grade: "F", isPassed: false, remarks: "Absent" },
      { subjectName: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17, obtainedMarks: 0, grade: "F", isPassed: false, remarks: "Absent" },
    ],
  },

  // ================= Grade 9th (Science - Computer) — Mid-Term 2026–27 =================
  {
    id: "res-201",
    rollNo: "9001",
    studentName: "Maryam Noor",
    fatherName: "Sheikh Noor Elahi",
    className: "Grade 9th (Science - Computer)",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    campus: "Main Campus — Gulberg",
    totalMaxMarks: 550,
    totalObtainedMarks: 494,
    percentage: 89.82,
    overallGrade: "A+",
    position: 1,
    status: "Passed",
    attendancePercentage: 97,
    teacherRemarks: "Outstanding aptitude in Computer Science & Mathematics. First in class.",
    subjects: [
      { subjectName: "English (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 69, grade: "A+", isPassed: true },
      { subjectName: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 66, grade: "A", isPassed: true },
      { subjectName: "Mathematics (Science)", maxMarks: 75, passMarks: 25, obtainedMarks: 73, grade: "A+", isPassed: true },
      { subjectName: "Computer Science", maxMarks: 75, passMarks: 25, obtainedMarks: 72, grade: "A+", isPassed: true },
      { subjectName: "Physics", maxMarks: 75, passMarks: 25, obtainedMarks: 65, grade: "A", isPassed: true },
      { subjectName: "Chemistry", maxMarks: 75, passMarks: 25, obtainedMarks: 63, grade: "A", isPassed: true },
      { subjectName: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17, obtainedMarks: 44, grade: "A+", isPassed: true },
      { subjectName: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17, obtainedMarks: 42, grade: "A+", isPassed: true },
    ],
  },
  {
    id: "res-202",
    rollNo: "9002",
    studentName: "Abdullah Khan",
    fatherName: "Jahangir Khan",
    className: "Grade 9th (Science - Computer)",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    campus: "Main Campus — Gulberg",
    totalMaxMarks: 550,
    totalObtainedMarks: 450,
    percentage: 81.82,
    overallGrade: "A+",
    position: 2,
    status: "Passed",
    attendancePercentage: 93,
    teacherRemarks: "Excellent logic building skills. Consistent throughout the examination.",
    subjects: [
      { subjectName: "English (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 62, grade: "A", isPassed: true },
      { subjectName: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 60, grade: "A", isPassed: true },
      { subjectName: "Mathematics (Science)", maxMarks: 75, passMarks: 25, obtainedMarks: 68, grade: "A+", isPassed: true },
      { subjectName: "Computer Science", maxMarks: 75, passMarks: 25, obtainedMarks: 67, grade: "A+", isPassed: true },
      { subjectName: "Physics", maxMarks: 75, passMarks: 25, obtainedMarks: 58, grade: "B", isPassed: true },
      { subjectName: "Chemistry", maxMarks: 75, passMarks: 25, obtainedMarks: 55, grade: "B", isPassed: true },
      { subjectName: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17, obtainedMarks: 41, grade: "A+", isPassed: true },
      { subjectName: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17, obtainedMarks: 39, grade: "A", isPassed: true },
    ],
  },
  {
    id: "res-203",
    rollNo: "9003",
    studentName: "Mahnoor Imran",
    fatherName: "Imran Qureshi",
    className: "Grade 9th (Science - Computer)",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    campus: "Main Campus — Gulberg",
    totalMaxMarks: 550,
    totalObtainedMarks: 410,
    percentage: 74.55,
    overallGrade: "A",
    position: 3,
    status: "Passed",
    attendancePercentage: 95,
    teacherRemarks: "Good academic standing. Keep improving Chemistry concepts.",
    subjects: [
      { subjectName: "English (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 58, grade: "B", isPassed: true },
      { subjectName: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 56, grade: "B", isPassed: true },
      { subjectName: "Mathematics (Science)", maxMarks: 75, passMarks: 25, obtainedMarks: 60, grade: "A", isPassed: true },
      { subjectName: "Computer Science", maxMarks: 75, passMarks: 25, obtainedMarks: 62, grade: "A", isPassed: true },
      { subjectName: "Physics", maxMarks: 75, passMarks: 25, obtainedMarks: 52, grade: "C", isPassed: true },
      { subjectName: "Chemistry", maxMarks: 75, passMarks: 25, obtainedMarks: 46, grade: "D", isPassed: true },
      { subjectName: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17, obtainedMarks: 39, grade: "A", isPassed: true },
      { subjectName: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17, obtainedMarks: 37, grade: "A", isPassed: true },
    ],
  },
  {
    id: "res-204",
    rollNo: "9004",
    studentName: "Zeeshan Ali",
    fatherName: "Liaquat Ali",
    className: "Grade 9th (Science - Computer)",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    campus: "Main Campus — Gulberg",
    totalMaxMarks: 550,
    totalObtainedMarks: 335,
    percentage: 60.91,
    overallGrade: "B",
    position: 4,
    status: "Passed",
    attendancePercentage: 86,
    teacherRemarks: "Satisfactory. Needs practice with programming lab tasks and Physics formulas.",
    subjects: [
      { subjectName: "English (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 48, grade: "C", isPassed: true },
      { subjectName: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 50, grade: "C", isPassed: true },
      { subjectName: "Mathematics (Science)", maxMarks: 75, passMarks: 25, obtainedMarks: 45, grade: "D", isPassed: true },
      { subjectName: "Computer Science", maxMarks: 75, passMarks: 25, obtainedMarks: 51, grade: "C", isPassed: true },
      { subjectName: "Physics", maxMarks: 75, passMarks: 25, obtainedMarks: 42, grade: "D", isPassed: true },
      { subjectName: "Chemistry", maxMarks: 75, passMarks: 25, obtainedMarks: 38, grade: "E", isPassed: true },
      { subjectName: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17, obtainedMarks: 32, grade: "B", isPassed: true },
      { subjectName: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17, obtainedMarks: 29, grade: "C", isPassed: true },
    ],
  },
  {
    id: "res-205",
    rollNo: "9005",
    studentName: "Subhan Tariq",
    fatherName: "Tariq Javed",
    className: "Grade 9th (Science - Computer)",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    campus: "Main Campus — Gulberg",
    totalMaxMarks: 550,
    totalObtainedMarks: 432,
    percentage: 78.55,
    overallGrade: "A",
    position: 3,
    status: "Passed",
    attendancePercentage: 92,
    teacherRemarks: "Qualifies academic criteria with distinction. Promoted with commendation.",
    subjects: [
      { subjectName: "English (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 62, grade: "A", isPassed: true },
      { subjectName: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 60, grade: "A", isPassed: true },
      { subjectName: "Mathematics (Science)", maxMarks: 75, passMarks: 25, obtainedMarks: 65, grade: "A", isPassed: true },
      { subjectName: "Computer Science", maxMarks: 75, passMarks: 25, obtainedMarks: 68, grade: "A+", isPassed: true },
      { subjectName: "Physics", maxMarks: 75, passMarks: 25, obtainedMarks: 56, grade: "B", isPassed: true },
      { subjectName: "Chemistry", maxMarks: 75, passMarks: 25, obtainedMarks: 52, grade: "C", isPassed: true },
      { subjectName: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17, obtainedMarks: 36, grade: "A", isPassed: true },
      { subjectName: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17, obtainedMarks: 33, grade: "B", isPassed: true },
    ],
  },

  // ================= Grade 8-A — Mid-Term 2026–27 =================
  {
    id: "res-301",
    rollNo: "8001",
    studentName: "Dua Fatima",
    fatherName: "Syed Imran Shah",
    className: "Grade 8-A",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    campus: "Main Campus — Gulberg",
    totalMaxMarks: 525,
    totalObtainedMarks: 482,
    percentage: 91.81,
    overallGrade: "A+",
    position: 1,
    status: "Passed",
    attendancePercentage: 99,
    teacherRemarks: "Exceptional student with highest aggregate marks in Middle Section.",
    subjects: [
      { subjectName: "English", maxMarks: 100, passMarks: 40, obtainedMarks: 94, grade: "A+", isPassed: true },
      { subjectName: "Mathematics", maxMarks: 100, passMarks: 40, obtainedMarks: 95, grade: "A+", isPassed: true },
      { subjectName: "General Science", maxMarks: 100, passMarks: 40, obtainedMarks: 91, grade: "A+", isPassed: true },
      { subjectName: "Urdu", maxMarks: 100, passMarks: 40, obtainedMarks: 88, grade: "A+", isPassed: true },
      { subjectName: "Computer Science", maxMarks: 75, passMarks: 30, obtainedMarks: 70, grade: "A+", isPassed: true },
      { subjectName: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 20, obtainedMarks: 44, grade: "A+", isPassed: true },
    ],
  },
  {
    id: "res-302",
    rollNo: "8002",
    studentName: "Ahmed Raza",
    fatherName: "Muhammad Raza",
    className: "Grade 8-A",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    campus: "Main Campus — Gulberg",
    totalMaxMarks: 525,
    totalObtainedMarks: 441,
    percentage: 84.00,
    overallGrade: "A+",
    position: 2,
    status: "Passed",
    attendancePercentage: 94,
    teacherRemarks: "Very sharp mind. Performs very well in analytical subjects.",
    subjects: [
      { subjectName: "English", maxMarks: 100, passMarks: 40, obtainedMarks: 84, grade: "A+", isPassed: true },
      { subjectName: "Mathematics", maxMarks: 100, passMarks: 40, obtainedMarks: 89, grade: "A+", isPassed: true },
      { subjectName: "General Science", maxMarks: 100, passMarks: 40, obtainedMarks: 82, grade: "A+", isPassed: true },
      { subjectName: "Urdu", maxMarks: 100, passMarks: 40, obtainedMarks: 80, grade: "A+", isPassed: true },
      { subjectName: "Computer Science", maxMarks: 75, passMarks: 30, obtainedMarks: 65, grade: "A+", isPassed: true },
      { subjectName: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 20, obtainedMarks: 41, grade: "A+", isPassed: true },
    ],
  },
];

export const INITIAL_CLASS_DECLARATIONS: ClassResultDeclaration[] = [
  {
    id: "dec-1",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Grade 10th (Science - Biology)",
    campus: "Main Campus — Gulberg",
    totalStudents: 11,
    passedCount: 8,
    passPercentage: 72.7,
    averagePercentage: 66.8,
    status: "Published",
    declarationDate: "2026-10-24",
    compiledBy: "Mr. Adeel Hassan (Class Teacher)",
  },
  {
    id: "dec-2",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Grade 9th (Science - Computer)",
    campus: "Main Campus — Gulberg",
    totalStudents: 4,
    passedCount: 4,
    passPercentage: 100.0,
    averagePercentage: 76.7,
    status: "Published",
    declarationDate: "2026-10-25",
    compiledBy: "Mr. Usman Ali (Class Teacher)",
  },
  {
    id: "dec-3",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Grade 8-A",
    campus: "Main Campus — Gulberg",
    totalStudents: 2,
    passedCount: 2,
    passPercentage: 100.0,
    averagePercentage: 87.9,
    status: "Published",
    declarationDate: "2026-10-22",
    compiledBy: "Mrs. Maryam Shah (Class Teacher)",
  },
  {
    id: "dec-4",
    termId: "ex-first-2026",
    termName: "First Term Examination 2026",
    className: "Grade 10th (Science - Biology)",
    campus: "Main Campus — Gulberg",
    totalStudents: 8,
    passedCount: 8,
    passPercentage: 100.0,
    averagePercentage: 78.4,
    status: "Published",
    declarationDate: "2026-09-28",
    compiledBy: "Mr. Adeel Hassan (Class Teacher)",
  },
  {
    id: "dec-5",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Grade 10th (Science - Computer)",
    campus: "DHA Phase 5 Campus",
    totalStudents: 6,
    passedCount: 5,
    passPercentage: 83.3,
    averagePercentage: 68.2,
    status: "Draft",
    declarationDate: "2026-10-28",
    compiledBy: "Mr. Bilal Saeed (Class Teacher)",
  },
];
