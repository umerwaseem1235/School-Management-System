import type {
  AcademicClass,
  ExamTerm,
  GradeBand,
  Subject,
  TimetablePeriod,
} from "@/types";

export const ACADEMIC_SECTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;

const SECTION_CO_INCHARGES = [
  "Mrs. Nida Farooq",
  "Ms. Ayesha Khan",
  "Mr. Tariq Mehmood",
  "Ms. Sadia Munir",
  "Mr. Bilal Saeed",
] as const;

/** Returns ordered section letters (e.g. ["A", "B", "C"]) for a class section count. */
export function getClassSectionLetters(sectionsCount = 1): string[] {
  const count = Math.max(1, Math.min(26, Math.round(sectionsCount || 1)));
  return Array.from({ length: count }, (_, idx) =>
    idx < ACADEMIC_SECTION_LETTERS.length
      ? ACADEMIC_SECTION_LETTERS[idx]
      : String.fromCharCode(65 + idx)
  );
}

/** Derives consistent in-charge, room number, and student count for a section. */
export function getSectionAllocation(classItem: AcademicClass, sectionIndex: number) {
  const sectionsCount = Math.max(1, classItem.sections || 1);
  const totalStudents = Math.max(0, classItem.students || 0);
  const baseCount = Math.floor(totalStudents / sectionsCount);
  const remainder = totalStudents % sectionsCount;
  const students = baseCount + (sectionIndex < remainder ? 1 : 0);
  const incharge =
    sectionIndex === 0
      ? classItem.classTeacher || SECTION_CO_INCHARGES[0]
      : SECTION_CO_INCHARGES[sectionIndex % SECTION_CO_INCHARGES.length];
  const roomNo = `Room ${Math.max(1, classItem.gradeLevel)}0${sectionIndex + 1} (Wing A)`;

  return { students, incharge, roomNo };
}

/** Normalizes academic class names without Science/Arts suffixes or section letters. */
export function normalizeAcademicClassName(name: string): string {
  return name
    .replace(/-[A-Z]$/i, "")
    .replace(/\s*\((?:Science|Arts|General|Commerce)[^)]*\)/gi, "")
    .trim();
}

/** Filters out Grade 11 and Grade 12 entries so Academic Management shows up to Grade 10th only. */
export function isAcademicDirectoryClass(className: string): boolean {
  return !/\b(?:Grade|Class)?\s*(?:11|12)(?:th)?\b/i.test(className);
}

export interface ScienceSpecializationTrack {
  id: "biology" | "computer";
  title: string;
  electiveSubject: string;
  subjectCode: string;
  leadTeacher: string;
  sectionRange: string;
  students: number;
  wing: string;
  focusSummary: string;
}

/** Returns Biology & Computer Science track breakdowns for Grade 9th & 10th classes. */
export function getScienceSpecializationTracks(
  classItem: AcademicClass
): ScienceSpecializationTrack[] {
  const isMatricClass = classItem.gradeLevel === 9 || classItem.gradeLevel === 10;

  if (!isMatricClass) return [];

  const totalSections = Math.max(2, classItem.sections || 2);
  const totalStudents = Math.max(0, classItem.students || 0);
  const letters = getClassSectionLetters(totalSections);
  const bioSectionCount = Math.ceil(totalSections / 2);
  const bioLetters = letters.slice(0, bioSectionCount);
  const csLetters = letters.slice(bioSectionCount);
  const formatSections = (arr: string[]) =>
    arr.length <= 1 ? `Section ${arr[0] || "A"}` : `Sections ${arr[0]} – ${arr[arr.length - 1]}`;

  const bioStudents = Math.round((totalStudents * bioSectionCount) / totalSections);
  const csStudents = Math.max(0, totalStudents - bioStudents);
  const gradeTag = classItem.gradeLevel === 10 ? "10" : "09";

  return [
    {
      id: "biology",
      title: "Biology Group",
      electiveSubject: "Biology",
      subjectCode: `BIO-${gradeTag}`,
      leadTeacher:
        classItem.gradeLevel === 10 ? "Mr. Adeel Hassan" : classItem.classTeacher || "Dr. Saima Riaz",
      sectionRange: formatSections(bioLetters),
      students: bioStudents,
      wing: "Medical Sciences Block",
      focusSummary: "Physics, Chemistry, Mathematics & Biology",
    },
    {
      id: "computer",
      title: "Computer Science Group",
      electiveSubject: "Computer Science",
      subjectCode: `CS-${gradeTag}`,
      leadTeacher: classItem.gradeLevel === 10 ? "Mr. Bilal Saeed" : "Mr. Usman Ali",
      sectionRange: formatSections(csLetters),
      students: csStudents,
      wing: "Computing & IT Lab Wing",
      focusSummary: "Physics, Chemistry, Mathematics & Computer Science",
    },
  ];
}

export const CLASSES: AcademicClass[] = [
  { id: "k1", className: "Grade 5", gradeLevel: 5, stream: "General", campus: "Main Campus — Gulberg", sections: 3, students: 96, subjects: 6, classTeacher: "Mrs. Nida Farooq", status: "Active" },
  { id: "k2", className: "Grade 6", gradeLevel: 6, stream: "General", campus: "Main Campus — Gulberg", sections: 3, students: 92, subjects: 5, classTeacher: "Mr. Usman Ali", status: "Active" },
  { id: "k3", className: "Grade 7", gradeLevel: 7, stream: "General", campus: "Bahria Town Campus", sections: 2, students: 68, subjects: 5, classTeacher: "Mr. Waqas Anwar", status: "Active" },
  { id: "k4", className: "Grade 8", gradeLevel: 8, stream: "General", campus: "F-8 Islamabad Campus", sections: 3, students: 101, subjects: 6, classTeacher: "Mrs. Maryam Shah", status: "Active" },
  { id: "k5", className: "Grade 9th", gradeLevel: 9, stream: "General", campus: "Main Campus — Gulberg", sections: 7, students: 214, subjects: 13, classTeacher: "Dr. Saima Riaz", status: "Active" },
  { id: "k8", className: "Grade 10th", gradeLevel: 10, stream: "General", campus: "Main Campus — Gulberg", sections: 7, students: 214, subjects: 12, classTeacher: "Mr. Adeel Hassan", status: "Active" },
];

export const SUBJECTS: Subject[] = [
  // Grade 5
  { id: "sb-5-1", subjectName: "Mathematics", subjectCode: "MTH-05", className: "Grade 5", isElective: false, maxMarks: 100, passMarks: 40, teacher: "Mrs. Nida Farooq" },
  { id: "sb-5-2", subjectName: "English", subjectCode: "ENG-05", className: "Grade 5", isElective: false, maxMarks: 100, passMarks: 40, teacher: "Mrs. Maryam Shah" },
  { id: "sb-5-3", subjectName: "Urdu", subjectCode: "URD-05", className: "Grade 5", isElective: false, maxMarks: 100, passMarks: 40, teacher: "Ms. Kiran Aziz" },
  { id: "sb-5-4", subjectName: "General Science", subjectCode: "GSC-05", className: "Grade 5", isElective: false, maxMarks: 100, passMarks: 40, teacher: "Mr. Usman Ali" },
  { id: "sb-5-5", subjectName: "Social Studies", subjectCode: "SST-05", className: "Grade 5", isElective: false, maxMarks: 100, passMarks: 40, teacher: "Mr. Waqas Anwar" },
  { id: "sb-5-6", subjectName: "Islamiat", subjectCode: "ISL-05", className: "Grade 5", isElective: false, maxMarks: 50, passMarks: 20, teacher: "Mr. Hafiz Zubair" },

  // Grade 6
  { id: "sb-6-1", subjectName: "Mathematics", subjectCode: "MTH-06", className: "Grade 6", isElective: false, maxMarks: 100, passMarks: 40, teacher: "Mrs. Nida Farooq" },
  { id: "sb-6-2", subjectName: "English", subjectCode: "ENG-06", className: "Grade 6", isElective: false, maxMarks: 100, passMarks: 40, teacher: "Mrs. Maryam Shah" },
  { id: "sb-6-3", subjectName: "General Science", subjectCode: "GSC-06", className: "Grade 6", isElective: false, maxMarks: 100, passMarks: 40, teacher: "Mr. Usman Ali" },
  { id: "sb-6-4", subjectName: "Urdu", subjectCode: "URD-06", className: "Grade 6", isElective: false, maxMarks: 100, passMarks: 40, teacher: "Ms. Kiran Aziz" },
  { id: "sb-6-5", subjectName: "Computer Science", subjectCode: "CS-06", className: "Grade 6", isElective: true, maxMarks: 50, passMarks: 20, teacher: "Mr. Usman Ali" },

  // Grade 7
  { id: "sb-7-1", subjectName: "Mathematics", subjectCode: "MTH-07", className: "Grade 7", isElective: false, maxMarks: 100, passMarks: 40, teacher: "Mr. Bilal Saeed" },
  { id: "sb-7-2", subjectName: "English", subjectCode: "ENG-07", className: "Grade 7", isElective: false, maxMarks: 100, passMarks: 40, teacher: "Mrs. Maryam Shah" },
  { id: "sb-7-3", subjectName: "Social Studies", subjectCode: "SST-07", className: "Grade 7", isElective: false, maxMarks: 100, passMarks: 40, teacher: "Mr. Waqas Anwar" },
  { id: "sb-7-4", subjectName: "General Science", subjectCode: "GSC-07", className: "Grade 7", isElective: false, maxMarks: 100, passMarks: 40, teacher: "Dr. Saima Riaz" },
  { id: "sb-7-5", subjectName: "Islamiat", subjectCode: "ISL-07", className: "Grade 7", isElective: false, maxMarks: 50, passMarks: 20, teacher: "Mr. Hafiz Zubair" },

  // Grade 8
  { id: "sb-8-1", subjectName: "Mathematics", subjectCode: "MTH-08", className: "Grade 8", isElective: false, maxMarks: 100, passMarks: 40, teacher: "Mr. Bilal Saeed" },
  { id: "sb-8-2", subjectName: "English", subjectCode: "ENG-08", className: "Grade 8", isElective: false, maxMarks: 100, passMarks: 40, teacher: "Mrs. Maryam Shah" },
  { id: "sb-8-3", subjectName: "General Science", subjectCode: "GSC-08", className: "Grade 8", isElective: false, maxMarks: 100, passMarks: 40, teacher: "Dr. Saima Riaz" },
  { id: "sb-8-4", subjectName: "Urdu", subjectCode: "URD-08", className: "Grade 8", isElective: false, maxMarks: 100, passMarks: 40, teacher: "Ms. Kiran Aziz" },
  { id: "sb-8-5", subjectName: "Computer Science", subjectCode: "CS-08", className: "Grade 8", isElective: true, maxMarks: 75, passMarks: 30, teacher: "Mr. Usman Ali" },
  { id: "sb-8-6", subjectName: "Tarjuma-tul-Quran", subjectCode: "TQ-08", className: "Grade 8", isElective: false, maxMarks: 50, passMarks: 20, teacher: "Mr. Hafiz Zubair" },

  // Grade 9th
  { id: "sb-9s-1", subjectName: "Biology", subjectCode: "BIO-09", className: "Grade 9th", isElective: true, maxMarks: 75, passMarks: 30, teacher: "Ms. Amina Tariq" },
  { id: "sb-9s-2", subjectName: "Computer Science", subjectCode: "CS-09", className: "Grade 9th", isElective: true, maxMarks: 75, passMarks: 30, teacher: "Mr. Usman Ali" },
  { id: "sb-9s-3", subjectName: "Physics", subjectCode: "PHY-09", className: "Grade 9th", isElective: false, maxMarks: 75, passMarks: 30, teacher: "Dr. Saima Riaz" },
  { id: "sb-9s-4", subjectName: "Chemistry", subjectCode: "CHM-09", className: "Grade 9th", isElective: false, maxMarks: 75, passMarks: 30, teacher: "Mr. Fahad Mir" },
  { id: "sb-9s-5", subjectName: "Mathematics", subjectCode: "MTH-09", className: "Grade 9th", isElective: false, maxMarks: 75, passMarks: 30, teacher: "Mr. Adeel Hassan" },
  { id: "sb-9s-6", subjectName: "English", subjectCode: "ENG-09", className: "Grade 9th", isElective: false, maxMarks: 75, passMarks: 30, teacher: "Mrs. Maryam Shah" },
  { id: "sb-9s-7", subjectName: "Urdu", subjectCode: "URD-09", className: "Grade 9th", isElective: false, maxMarks: 75, passMarks: 30, teacher: "Ms. Kiran Aziz" },
  { id: "sb-9s-8", subjectName: "Islamiat", subjectCode: "ISL-09", className: "Grade 9th", isElective: false, maxMarks: 50, passMarks: 20, teacher: "Mr. Hafiz Zubair" },
  { id: "sb-9s-9", subjectName: "Tarjuma-tul-Quran", subjectCode: "TQ-09", className: "Grade 9th", isElective: false, maxMarks: 50, passMarks: 20, teacher: "Mr. Hafiz Zubair" },
  { id: "sb-9a-1", subjectName: "General Science", subjectCode: "GSC-09", className: "Grade 9th", isElective: false, maxMarks: 75, passMarks: 30, teacher: "Mr. Usman Ali" },
  { id: "sb-9a-2", subjectName: "General Mathematics", subjectCode: "GMTH-09", className: "Grade 9th", isElective: false, maxMarks: 75, passMarks: 30, teacher: "Mr. Bilal Saeed" },
  { id: "sb-9a-3", subjectName: "Civics", subjectCode: "CIV-09", className: "Grade 9th", isElective: true, maxMarks: 75, passMarks: 30, teacher: "Mr. Waqas Anwar" },
  { id: "sb-9a-4", subjectName: "Education (Ilm-ut-Taleem)", subjectCode: "EDU-09", className: "Grade 9th", isElective: true, maxMarks: 75, passMarks: 30, teacher: "Mrs. Shagufta Naz" },

  // Grade 10th
  { id: "sb-10s-1", subjectName: "Biology", subjectCode: "BIO-10", className: "Grade 10th", isElective: true, maxMarks: 75, passMarks: 30, teacher: "Ms. Amina Tariq" },
  { id: "sb-10s-2", subjectName: "Computer Science", subjectCode: "CS-10", className: "Grade 10th", isElective: true, maxMarks: 75, passMarks: 30, teacher: "Mr. Usman Ali" },
  { id: "sb-10s-3", subjectName: "Physics", subjectCode: "PHY-10", className: "Grade 10th", isElective: false, maxMarks: 75, passMarks: 30, teacher: "Dr. Saima Riaz" },
  { id: "sb-10s-4", subjectName: "Chemistry", subjectCode: "CHM-10", className: "Grade 10th", isElective: false, maxMarks: 75, passMarks: 30, teacher: "Mr. Fahad Mir" },
  { id: "sb-10s-5", subjectName: "Mathematics", subjectCode: "MTH-10", className: "Grade 10th", isElective: false, maxMarks: 75, passMarks: 30, teacher: "Mr. Adeel Hassan" },
  { id: "sb-10s-6", subjectName: "English", subjectCode: "ENG-10", className: "Grade 10th", isElective: false, maxMarks: 75, passMarks: 30, teacher: "Mrs. Maryam Shah" },
  { id: "sb-10s-7", subjectName: "Urdu", subjectCode: "URD-10", className: "Grade 10th", isElective: false, maxMarks: 75, passMarks: 30, teacher: "Ms. Kiran Aziz" },
  { id: "sb-10s-8", subjectName: "Pakistan Studies", subjectCode: "PST-10", className: "Grade 10th", isElective: false, maxMarks: 50, passMarks: 20, teacher: "Mr. Waqas Anwar" },
  { id: "sb-10a-1", subjectName: "General Mathematics", subjectCode: "GMTH-10", className: "Grade 10th", isElective: false, maxMarks: 75, passMarks: 30, teacher: "Mr. Bilal Saeed" },
  { id: "sb-10a-2", subjectName: "General Science", subjectCode: "GSC-10", className: "Grade 10th", isElective: false, maxMarks: 75, passMarks: 30, teacher: "Mr. Usman Ali" },
  { id: "sb-10a-3", subjectName: "Civics", subjectCode: "CIV-10", className: "Grade 10th", isElective: true, maxMarks: 75, passMarks: 30, teacher: "Mr. Waqas Anwar" },
  { id: "sb-10a-4", subjectName: "Economics", subjectCode: "ECO-10", className: "Grade 10th", isElective: true, maxMarks: 75, passMarks: 30, teacher: "Mr. Waqas Anwar" },
];

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

export const PERIOD_SLOTS = [
  { start: "08:00", end: "08:45" },
  { start: "08:45", end: "09:30" },
  { start: "09:30", end: "10:15" },
  { start: "10:15", end: "10:35", isBreak: true },
  { start: "10:35", end: "11:20" },
  { start: "11:20", end: "12:05" },
  { start: "12:05", end: "12:50" },
];

const T = (subject: string, teacher: string, room: string): Omit<TimetablePeriod, "start" | "end"> => ({ subject, teacher, room });

/** Timetable for Grade 9 Science — Section A */
export const TIMETABLE: Record<(typeof DAYS)[number], (Omit<TimetablePeriod, "start" | "end"> | null)[]> = {
  Monday: [T("Mathematics", "A. Hassan", "R-201"), T("Physics", "S. Riaz", "Lab-1"), T("English", "M. Shah", "R-201"), null, T("Chemistry", "F. Mir", "Lab-2"), T("Urdu", "K. Aziz", "R-201"), T("Computer Science", "U. Ali", "CS-Lab")],
  Tuesday: [T("Physics", "S. Riaz", "Lab-1"), T("Mathematics", "A. Hassan", "R-201"), T("Islamiat", "H. Zubair", "R-201"), null, T("English", "M. Shah", "R-201"), T("Biology", "A. Tariq", "Lab-3"), T("Pakistan Studies", "W. Anwar", "R-201")],
  Wednesday: [T("Chemistry", "F. Mir", "Lab-2"), T("English", "M. Shah", "R-201"), T("Mathematics", "A. Hassan", "R-201"), null, T("Urdu", "K. Aziz", "R-201"), T("Physics", "S. Riaz", "Lab-1"), T("Computer Science", "U. Ali", "CS-Lab")],
  Thursday: [T("Mathematics", "A. Hassan", "R-201"), T("Biology", "A. Tariq", "Lab-3"), T("Chemistry", "F. Mir", "Lab-2"), null, T("Islamiat", "H. Zubair", "R-201"), T("English", "M. Shah", "R-201"), T("Pakistan Studies", "W. Anwar", "R-201")],
  Friday: [T("English", "M. Shah", "R-201"), T("Mathematics", "A. Hassan", "R-201"), T("Physics", "S. Riaz", "Lab-1"), null, T("Urdu", "K. Aziz", "R-201"), null, null],
};

export const EXAM_TERMS: ExamTerm[] = [
  { id: "e1", examName: "First Monthly Assessment", academicYear: "2026–27", term: "Term 1", startDate: "2026-04-20", endDate: "2026-04-25", campus: "All Campuses", classes: 14, progress: 100, status: "Published" },
  { id: "e2", examName: "Mid-Term Examination", academicYear: "2026–27", term: "Term 1", startDate: "2026-10-12", endDate: "2026-10-24", campus: "All Campuses", classes: 14, progress: 35, status: "Scheduled" },
  { id: "e3", examName: "Science Practical Assessment", academicYear: "2026–27", term: "Term 1", startDate: "2026-09-22", endDate: "2026-09-30", campus: "Main Campus — Gulberg", classes: 4, progress: 72, status: "Marks Entry" },
  { id: "e4", examName: "Second Monthly Assessment", academicYear: "2026–27", term: "Term 1", startDate: "2026-08-18", endDate: "2026-08-22", campus: "All Campuses", classes: 14, progress: 90, status: "Moderation" },
  { id: "e5", examName: "Final Examination", academicYear: "2025–26", term: "Term 2", startDate: "2026-02-15", endDate: "2026-03-05", campus: "All Campuses", classes: 14, progress: 100, status: "Published" },
];

export const DATESHEET = [
  { date: "2026-10-12", day: "Mon", subject: "English", classes: "Grades 6–10", time: "09:00 – 12:00", rooms: "Exam Hall A, B", invigilators: 18 },
  { date: "2026-10-13", day: "Tue", subject: "Mathematics", classes: "Grades 6–10", time: "09:00 – 12:00", rooms: "Exam Hall A, B", invigilators: 18 },
  { date: "2026-10-15", day: "Thu", subject: "Physics / General Science", classes: "Grades 6–10", time: "09:00 – 11:30", rooms: "Exam Hall A", invigilators: 12 },
  { date: "2026-10-16", day: "Fri", subject: "Urdu", classes: "Grades 6–10", time: "09:00 – 11:30", rooms: "Exam Hall A, B", invigilators: 16 },
  { date: "2026-10-19", day: "Mon", subject: "Chemistry / Social Studies", classes: "Grades 6–10", time: "09:00 – 11:30", rooms: "Exam Hall B", invigilators: 12 },
  { date: "2026-10-21", day: "Wed", subject: "Islamiat", classes: "Grades 6–10", time: "09:00 – 10:30", rooms: "Exam Hall A", invigilators: 10 },
  { date: "2026-10-23", day: "Fri", subject: "Computer Science / Biology", classes: "Grades 9–10", time: "09:00 – 11:30", rooms: "CS-Lab, Lab-3", invigilators: 8 },
];

export const GRADE_SCALE: GradeBand[] = [
  { grade: "A+", min: 90, max: 100, gpa: 4.0, remark: "Outstanding" },
  { grade: "A", min: 80, max: 89, gpa: 3.7, remark: "Excellent" },
  { grade: "B+", min: 75, max: 79, gpa: 3.3, remark: "Very Good" },
  { grade: "B", min: 70, max: 74, gpa: 3.0, remark: "Good" },
  { grade: "C", min: 60, max: 69, gpa: 2.5, remark: "Satisfactory" },
  { grade: "D", min: 50, max: 59, gpa: 2.0, remark: "Needs Improvement" },
  { grade: "E", min: 40, max: 49, gpa: 1.0, remark: "Marginal Pass" },
  { grade: "F", min: 0, max: 39, gpa: 0.0, remark: "Fail" },
];

export const GRADE_DISTRIBUTION = [
  { grade: "A+", students: 412 },
  { grade: "A", students: 868 },
  { grade: "B+", students: 1024 },
  { grade: "B", students: 1186 },
  { grade: "C", students: 1032 },
  { grade: "D", students: 624 },
  { grade: "E", students: 318 },
  { grade: "F", students: 198 },
];

export const TOP_PERFORMERS = [
  { name: "Fatima Zahra", className: "Grade 10-A", campus: "F-8 Islamabad", percentage: 97.4, gpa: 4.0 },
  { name: "Abdullah Nasir", className: "Grade 9-A", campus: "Gulberg", percentage: 96.8, gpa: 4.0 },
  { name: "Ayesha Malik", className: "Grade 8-B", campus: "DHA Phase 5", percentage: 95.9, gpa: 4.0 },
  { name: "Taha Siddiqui", className: "Grade 10-B", campus: "Clifton", percentage: 95.1, gpa: 4.0 },
  { name: "Zoya Kamal", className: "Grade 7-A", campus: "F-8 Islamabad", percentage: 94.6, gpa: 4.0 },
];
