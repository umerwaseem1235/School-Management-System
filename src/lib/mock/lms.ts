import type { LmsAssignment, LmsCourse, LmsLiveClass, LmsMaterial } from "@/types";

export const PAKISTANI_SCHOOL_CLASSES = [
  "Grade 5-A",
  "Grade 6-A",
  "Grade 7-A",
  "Grade 8-A",
  "Grade 9th (Science - Biology)",
  "Grade 9th (Science - Computer)",
  "Grade 9th (Arts)",
  "Grade 10th (Science - Biology)",
  "Grade 10th (Science - Computer)",
  "Grade 10th (Arts)",
] as const;

/**
 * Standard School Subjects (Grades 5 to 10):
 * - Compulsory (English, Urdu, Islamiat, Tarjuma-tul-Quran, Ethics, Pakistan Studies)
 * - Science Group (Physics, Chemistry, Biology, Mathematics, Computer Science)
 * - Primary, Middle & Arts Group (General Science, General Mathematics, Social Studies, History, Geography, Civics, Education, Home Economics, Fine Arts, Arabic)
 */
export const PAKISTANI_SCHOOL_SUBJECTS = [
  "Arabic",
  "Biology",
  "Chemistry",
  "Civics",
  "Computer Science",
  "Economics",
  "Education (Ilm-ut-Taleem)",
  "English",
  "Ethics",
  "Fine Arts",
  "General Knowledge",
  "General Mathematics",
  "General Science",
  "Geography",
  "Health & Physical Education",
  "History",
  "Home Economics",
  "Islamiat",
  "Mathematics",
  "Pakistan Studies",
  "Physics",
  "Social Studies",
  "Tarjuma-tul-Quran",
  "Urdu",
] as const;

/**
 * Academic sorter for Pakistani school classes:
 * Orders strictly by Grade level (Playgroup -> Nursery -> KG -> Grade 1..12)
 * and sub-orders by stream (Biology -> Computer -> Arts/General -> Pre-Engineering -> Commerce).
 */
export function sortPakistaniClasses(classes: readonly string[] | string[]): string[] {
  const getGradeNumber = (className: string): number => {
    const lower = className.toLowerCase();
    if (lower.includes("playgroup")) return -2;
    if (lower.includes("nursery")) return -1;
    if (lower.includes("kindergarten") || lower.includes("kg") || lower.includes("prep")) return 0;

    const match = className.match(/(?:grade|class)?\s*(\d+)/i);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return 999;
  };

  const getStreamRank = (className: string): number => {
    const lower = className.toLowerCase();
    // 9th/10th and 11th/12th streams ordering
    if (lower.includes("bio") || lower.includes("pre-med")) return 1;
    if (lower.includes("pre-eng")) return 2;
    if (lower.includes("computer") || lower.includes("ics")) return 3;
    if (lower.includes("science")) return 1;
    if (lower.includes("arts") || lower.includes("general") || lower.includes("humanities")) return 4;
    if (lower.includes("commerce") || lower.includes("i.com")) return 5;
    return 10;
  };

  return [...classes].sort((a, b) => {
    const gradeA = getGradeNumber(a);
    const gradeB = getGradeNumber(b);

    if (gradeA !== gradeB) {
      return gradeA - gradeB;
    }

    const streamA = getStreamRank(a);
    const streamB = getStreamRank(b);
    if (streamA !== streamB) {
      return streamA - streamB;
    }

    return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  });
}

/**
 * Formats lengthy class names into standard concise Pakistani school designations:
 * e.g. "Grade 10th (Science - Biology)" -> "Class 10 (Bio)"
 *      "Grade 9th (Arts)"               -> "Class 9 (Arts)"
 */
export function formatCompactClass(className: string): string {
  if (!className) return "";
  return className
    .replace(/(?:Grade|Class)?\s*10(?:th)?\s*\((?:Science\s*-\s*)?Bio(?:logy)?\)/i, "Class 10 (Bio)")
    .replace(/(?:Grade|Class)?\s*10(?:th)?\s*\((?:Science\s*-\s*)?Comp(?:uter)?\)/i, "Class 10 (CS)")
    .replace(/(?:Grade|Class)?\s*10(?:th)?\s*\(Arts\)/i, "Class 10 (Arts)")
    .replace(/(?:Grade|Class)?\s*9(?:th)?\s*\((?:Science\s*-\s*)?Bio(?:logy)?\)/i, "Class 9 (Bio)")
    .replace(/(?:Grade|Class)?\s*9(?:th)?\s*\((?:Science\s*-\s*)?Comp(?:uter)?\)/i, "Class 9 (CS)")
    .replace(/(?:Grade|Class)?\s*9(?:th)?\s*\(Arts\)/i, "Class 9 (Arts)")
    .replace(/Grade\s+/i, "Class ");
}

/**
 * Extracts a concise subject name from a course title:
 * e.g. "Grade 10 Mathematics" -> "Mathematics"
 *      "Grade 9 Physics" -> "Physics"
 */
export function formatCourseSubject(courseName: string): string {
  if (!courseName) return "";
  const lower = courseName.toLowerCase();
  if (lower.includes("math")) {
    if (lower.includes("general math")) return "General Mathematics";
    return "Mathematics";
  }
  if (lower.includes("physics")) return "Physics";
  if (lower.includes("chemistry")) return "Chemistry";
  if (lower.includes("biology")) return "Biology";
  if (lower.includes("computer")) return "Computer Science";
  if (lower.includes("urdu")) return "Urdu";
  if (lower.includes("english")) return "English";
  if (lower.includes("islam") || lower.includes("islamiat")) return "Islamiat";
  if (lower.includes("tarjuma") || lower.includes("quran")) return "Tarjuma-tul-Quran";
  if (lower.includes("pakistan studies")) return "Pakistan Studies";
  if (lower.includes("civics")) return "Civics";
  if (lower.includes("general science") || lower.includes("science")) return "General Science";
  if (lower.includes("economics")) return "Economics";
  if (lower.includes("geography")) return "Geography";
  if (lower.includes("social studies")) return "Social Studies";
  if (lower.includes("education")) return "Education";

  return courseName
    .replace(/^Grade\s+\d+(?:th)?\s*/i, "")
    .replace(/\s*\([^\)]+\)/g, "")
    .trim();
}

export function formatLmsDate(value: string): string {
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

export const LMS_COURSES: LmsCourse[] = [
  {
    id: "lms-c1",
    title: "Grade 10 Mathematics",
    courseCode: "MTH-10",
    className: "Grade 10th (Science - Biology)",
    subject: "Mathematics",
    teacher: "Mr. Adeel Hassan",
    campus: "Main Campus — Gulberg",
    totalLessons: 32,
    completedLessons: 24,
    enrolledStudents: 34,
    activeAssignments: 2,
    status: "Active",
    colorTone: "brand",
  },
  {
    id: "lms-c2",
    title: "Grade 9 Physics",
    courseCode: "PHY-09",
    className: "Grade 9th (Science - Biology)",
    subject: "Physics",
    teacher: "Dr. Saima Riaz",
    campus: "Main Campus — Gulberg",
    totalLessons: 28,
    completedLessons: 20,
    enrolledStudents: 32,
    activeAssignments: 2,
    status: "Active",
    colorTone: "ocean",
  },
  {
    id: "lms-c3",
    title: "Grade 10 Chemistry",
    courseCode: "CHM-10",
    className: "Grade 10th (Science - Biology)",
    subject: "Chemistry",
    teacher: "Mr. Fahad Mir",
    campus: "DHA Phase 5 Campus",
    totalLessons: 30,
    completedLessons: 22,
    enrolledStudents: 31,
    activeAssignments: 1,
    status: "Active",
    colorTone: "success",
  },
  {
    id: "lms-c4",
    title: "Grade 9 Computer Science",
    courseCode: "CS-09",
    className: "Grade 9th (Science - Computer)",
    subject: "Computer Science",
    teacher: "Mr. Usman Ali",
    campus: "F-8 Islamabad Campus",
    totalLessons: 24,
    completedLessons: 18,
    enrolledStudents: 28,
    activeAssignments: 1,
    status: "Active",
    colorTone: "brand",
  },
  {
    id: "lms-c5",
    title: "Grade 10 Computer Science",
    courseCode: "CS-10",
    className: "Grade 10th (Science - Computer)",
    subject: "Computer Science",
    teacher: "Mr. Usman Ali",
    campus: "F-8 Islamabad Campus",
    totalLessons: 26,
    completedLessons: 19,
    enrolledStudents: 29,
    activeAssignments: 1,
    status: "Active",
    colorTone: "ocean",
  },
  {
    id: "lms-c6",
    title: "Grade 9 General Science",
    courseCode: "GSC-09",
    className: "Grade 9th (Arts)",
    subject: "General Science",
    teacher: "Mr. Usman Ali",
    campus: "Clifton Karachi Campus",
    totalLessons: 22,
    completedLessons: 17,
    enrolledStudents: 26,
    activeAssignments: 1,
    status: "Active",
    colorTone: "gold",
  },
  {
    id: "lms-c7",
    title: "Grade 10 Pakistan Studies",
    courseCode: "PST-10",
    className: "Grade 10th (Arts)",
    subject: "Pakistan Studies",
    teacher: "Mr. Waqas Anwar",
    campus: "Clifton Karachi Campus",
    totalLessons: 20,
    completedLessons: 16,
    enrolledStudents: 33,
    activeAssignments: 1,
    status: "Active",
    colorTone: "ocean",
  },
  {
    id: "lms-c8",
    title: "Grade 8 English",
    courseCode: "ENG-08",
    className: "Grade 8-A",
    subject: "English",
    teacher: "Mrs. Maryam Shah",
    campus: "Main Campus — Gulberg",
    totalLessons: 26,
    completedLessons: 21,
    enrolledStudents: 35,
    activeAssignments: 1,
    status: "Active",
    colorTone: "gold",
  },
  {
    id: "lms-c12",
    title: "Grade 7 Social Studies",
    courseCode: "SST-07",
    className: "Grade 7-A",
    subject: "Social Studies",
    teacher: "Mr. Waqas Anwar",
    campus: "Bahria Town Campus",
    totalLessons: 22,
    completedLessons: 18,
    enrolledStudents: 32,
    activeAssignments: 1,
    status: "Active",
    colorTone: "gold",
  },
  {
    id: "lms-c13",
    title: "Grade 6 General Science",
    courseCode: "SCI-06",
    className: "Grade 6-A",
    subject: "General Science",
    teacher: "Mr. Usman Ali",
    campus: "Main Campus — Gulberg",
    totalLessons: 24,
    completedLessons: 19,
    enrolledStudents: 30,
    activeAssignments: 1,
    status: "Active",
    colorTone: "success",
  },
  {
    id: "lms-c14",
    title: "Grade 5 Mathematics",
    courseCode: "MTH-05",
    className: "Grade 5-A",
    subject: "Mathematics",
    teacher: "Mrs. Nida Farooq",
    campus: "Main Campus — Gulberg",
    totalLessons: 28,
    completedLessons: 23,
    enrolledStudents: 29,
    activeAssignments: 1,
    status: "Active",
    colorTone: "brand",
  },
  {
    id: "lms-c17",
    title: "Grade 10 Urdu",
    courseCode: "URD-10",
    className: "Grade 10th (Science - Biology)",
    subject: "Urdu",
    teacher: "Ms. Kiran Aziz",
    campus: "Main Campus — Gulberg",
    totalLessons: 30,
    completedLessons: 22,
    enrolledStudents: 34,
    activeAssignments: 1,
    status: "Active",
    colorTone: "brand",
  },
  {
    id: "lms-c18",
    title: "Grade 9 Islamiat",
    courseCode: "ISL-09",
    className: "Grade 9th (Science - Biology)",
    subject: "Islamiat",
    teacher: "Mr. Hafiz Zubair",
    campus: "Main Campus — Gulberg",
    totalLessons: 24,
    completedLessons: 18,
    enrolledStudents: 32,
    activeAssignments: 1,
    status: "Active",
    colorTone: "success",
  },
  {
    id: "lms-c19",
    title: "Grade 9 Tarjuma-tul-Quran",
    courseCode: "TQ-09",
    className: "Grade 9th (Arts)",
    subject: "Tarjuma-tul-Quran",
    teacher: "Qari Muhammad Imran",
    campus: "Main Campus — Gulberg",
    totalLessons: 20,
    completedLessons: 15,
    enrolledStudents: 26,
    activeAssignments: 1,
    status: "Active",
    colorTone: "gold",
  },
  {
    id: "lms-c20",
    title: "Grade 10 General Mathematics",
    courseCode: "GMTH-10",
    className: "Grade 10th (Arts)",
    subject: "General Mathematics",
    teacher: "Mr. Bilal Saeed",
    campus: "Clifton Karachi Campus",
    totalLessons: 28,
    completedLessons: 21,
    enrolledStudents: 33,
    activeAssignments: 1,
    status: "Active",
    colorTone: "brand",
  },
  {
    id: "lms-c21",
    title: "Grade 9 Biology",
    courseCode: "BIO-09",
    className: "Grade 9th (Science - Biology)",
    subject: "Biology",
    teacher: "Ms. Amina Tariq",
    campus: "DHA Phase 5 Campus",
    totalLessons: 30,
    completedLessons: 20,
    enrolledStudents: 32,
    activeAssignments: 1,
    status: "Active",
    colorTone: "success",
  },
  {
    id: "lms-c22",
    title: "Grade 10 Civics",
    courseCode: "CIV-10",
    className: "Grade 10th (Arts)",
    subject: "Civics",
    teacher: "Mr. Waqas Anwar",
    campus: "Clifton Karachi Campus",
    totalLessons: 22,
    completedLessons: 16,
    enrolledStudents: 28,
    activeAssignments: 1,
    status: "Active",
    colorTone: "ocean",
  },
  {
    id: "lms-c24",
    title: "Grade 9 Education",
    courseCode: "EDU-09",
    className: "Grade 9th (Arts)",
    subject: "Education (Ilm-ut-Taleem)",
    teacher: "Mrs. Shagufta Naz",
    campus: "F-8 Islamabad Campus",
    totalLessons: 24,
    completedLessons: 17,
    enrolledStudents: 24,
    activeAssignments: 1,
    status: "Active",
    colorTone: "gold",
  },
];

export const LMS_ASSIGNMENTS: LmsAssignment[] = [
  // Primary (Grade 5)
  {
    id: "asg-1",
    title: "Fractions & Decimals Worksheet",
    courseName: "Grade 5 Primary Mathematics",
    className: "Grade 5-A",
    teacher: "Mrs. Nida Farooq",
    dueDate: "2026-10-25",
    totalSubmissions: 27,
    totalStudents: 29,
    maxMarks: 20,
    status: "Active",
  },
  {
    id: "asg-2",
    title: "Mazmoon: Mera Watan",
    courseName: "Grade 5 Primary Urdu",
    className: "Grade 5-A",
    teacher: "Ms. Kiran Aziz",
    dueDate: "2026-10-23",
    totalSubmissions: 29,
    totalStudents: 29,
    maxMarks: 15,
    status: "Graded",
  },

  // Middle School (Grades 6, 7, 8)
  {
    id: "asg-3",
    title: "Digestive System Diagram",
    courseName: "Grade 6 General Science & Environment",
    className: "Grade 6-A",
    teacher: "Mr. Usman Ali",
    dueDate: "2026-10-26",
    totalSubmissions: 26,
    totalStudents: 30,
    maxMarks: 20,
    status: "Active",
  },
  {
    id: "asg-4",
    title: "Story: A Rainy Day",
    courseName: "Grade 6 English Comp",
    className: "Grade 6-A",
    teacher: "Mrs. Maryam Shah",
    dueDate: "2026-10-22",
    totalSubmissions: 28,
    totalStudents: 30,
    maxMarks: 15,
    status: "Active",
  },
  {
    id: "asg-5",
    title: "Rivers & Dams Map Work",
    courseName: "Grade 7 Social Studies & Geography",
    className: "Grade 7-A",
    teacher: "Mr. Waqas Anwar",
    dueDate: "2026-10-27",
    totalSubmissions: 22,
    totalStudents: 32,
    maxMarks: 20,
    status: "Active",
  },
  {
    id: "asg-6",
    title: "Linear Equations Ex 5.2",
    courseName: "Grade 7 Mathematics",
    className: "Grade 7-A",
    teacher: "Mr. Bilal Saeed",
    dueDate: "2026-10-20",
    totalSubmissions: 32,
    totalStudents: 32,
    maxMarks: 25,
    status: "Graded",
  },
  {
    id: "asg-7",
    title: "Essay: Sustainability",
    courseName: "Grade 8 English Language & Comp",
    className: "Grade 8-A",
    teacher: "Mrs. Maryam Shah",
    dueDate: "2026-10-21",
    totalSubmissions: 35,
    totalStudents: 35,
    maxMarks: 20,
    status: "Graded",
  },
  {
    id: "asg-8",
    title: "Chemical Reactions",
    courseName: "Grade 8 General Science",
    className: "Grade 8-A",
    teacher: "Dr. Saima Riaz",
    dueDate: "2026-10-28",
    totalSubmissions: 25,
    totalStudents: 35,
    maxMarks: 20,
    status: "Active",
  },

  // 9th Class (Science Bio, Science Computer, Arts)
  {
    id: "asg-9",
    title: "Motion & Laws Worksheet",
    courseName: "Grade 9 Physics",
    className: "Grade 9th (Science - Biology)",
    teacher: "Dr. Saima Riaz",
    dueDate: "2026-10-24",
    totalSubmissions: 28,
    totalStudents: 32,
    maxMarks: 20,
    status: "Active",
  },
  {
    id: "asg-10",
    title: "Cell Division Diagrams",
    courseName: "Grade 9 Biology",
    className: "Grade 9th (Science - Biology)",
    teacher: "Ms. Amina Tariq",
    dueDate: "2026-10-27",
    totalSubmissions: 29,
    totalStudents: 32,
    maxMarks: 20,
    status: "Active",
  },
  {
    id: "asg-11",
    title: "Flowcharts & Problem Solving",
    courseName: "Grade 9 Computer Science",
    className: "Grade 9th (Science - Computer)",
    teacher: "Mr. Usman Ali",
    dueDate: "2026-10-26",
    totalSubmissions: 21,
    totalStudents: 28,
    maxMarks: 15,
    status: "Active",
  },
  {
    id: "asg-12",
    title: "Health & Nutrition",
    courseName: "Grade 9 General Science",
    className: "Grade 9th (Arts)",
    teacher: "Mr. Usman Ali",
    dueDate: "2026-10-25",
    totalSubmissions: 24,
    totalStudents: 26,
    maxMarks: 20,
    status: "Active",
  },
  {
    id: "asg-13",
    title: "Urdu Grammar & Tashbih",
    courseName: "Grade 9 Urdu",
    className: "Grade 9th (Arts)",
    teacher: "Ms. Kiran Aziz",
    dueDate: "2026-10-21",
    totalSubmissions: 26,
    totalStudents: 26,
    maxMarks: 15,
    status: "Graded",
  },

  // 10th Class (Science Bio, Science Computer, Arts)
  {
    id: "asg-14",
    title: "Quadratic Equations Ex 1.2",
    courseName: "Grade 10 Mathematics",
    className: "Grade 10th (Science - Biology)",
    teacher: "Mr. Adeel Hassan",
    dueDate: "2026-10-25",
    totalSubmissions: 31,
    totalStudents: 34,
    maxMarks: 20,
    status: "Active",
  },
  {
    id: "asg-15",
    title: "Acids, Bases & Salts Questions",
    courseName: "Grade 10 Chemistry",
    className: "Grade 10th (Science - Biology)",
    teacher: "Mr. Fahad Mir",
    dueDate: "2026-10-27",
    totalSubmissions: 24,
    totalStudents: 31,
    maxMarks: 20,
    status: "Active",
  },
  {
    id: "asg-16",
    title: "HTML Basics Worksheet",
    courseName: "Grade 10 Computer Science",
    className: "Grade 10th (Science - Computer)",
    teacher: "Mr. Usman Ali",
    dueDate: "2026-10-28",
    totalSubmissions: 26,
    totalStudents: 29,
    maxMarks: 20,
    status: "Active",
  },
  {
    id: "asg-17",
    title: "Pakistan History Chapter 3",
    courseName: "Grade 10 Pakistan Studies",
    className: "Grade 10th (Arts)",
    teacher: "Mr. Waqas Anwar",
    dueDate: "2026-10-18",
    totalSubmissions: 33,
    totalStudents: 33,
    maxMarks: 15,
    status: "Past Due",
  },
  {
    id: "asg-18",
    title: "Percentage & Zakat Ex 1.1",
    courseName: "Grade 10 General Mathematics",
    className: "Grade 10th (Arts)",
    teacher: "Mr. Bilal Saeed",
    dueDate: "2026-10-26",
    totalSubmissions: 30,
    totalStudents: 33,
    maxMarks: 20,
    status: "Active",
  },
];

export const LMS_MATERIALS: LmsMaterial[] = [
  {
    id: "mat-1",
    title: "Quadratic Equations Notes",
    subject: "Mathematics",
    className: "Grade 10th (Science - Biology)",
    fileType: "PDF",
    fileSize: "2.4 MB",
    uploadedBy: "Mr. Adeel Hassan",
    uploadDate: "2026-10-14",
    downloadCount: 128,
  },
  {
    id: "mat-2",
    title: "Physics Formula Sheet",
    subject: "Physics",
    className: "Grade 9th (Science - Biology)",
    fileType: "PDF",
    fileSize: "1.8 MB",
    uploadedBy: "Dr. Saima Riaz",
    uploadDate: "2026-10-12",
    downloadCount: 142,
  },
  {
    id: "mat-3",
    title: "Acids & Bases Revision Slides",
    subject: "Chemistry",
    className: "Grade 10th (Science - Biology)",
    fileType: "SLIDES",
    fileSize: "3.1 MB",
    uploadedBy: "Mr. Fahad Mir",
    uploadDate: "2026-10-15",
    downloadCount: 96,
  },
  {
    id: "mat-4",
    title: "Flowcharts & Binary Worksheet",
    subject: "Computer Science",
    className: "Grade 9th (Science - Computer)",
    fileType: "DOCX",
    fileSize: "850 KB",
    uploadedBy: "Mr. Usman Ali",
    uploadDate: "2026-10-10",
    downloadCount: 114,
  },
  {
    id: "mat-5",
    title: "English Grammar & Tenses Guide",
    subject: "English",
    className: "Grade 8-A",
    fileType: "PDF",
    fileSize: "1.2 MB",
    uploadedBy: "Mrs. Maryam Shah",
    uploadDate: "2026-10-08",
    downloadCount: 165,
  },
  {
    id: "mat-6",
    title: "Chapter 1–4 Revision Practice Sheet",
    subject: "Mathematics",
    className: "Grade 10th (Science - Biology)",
    fileType: "PDF",
    fileSize: "3.2 MB",
    uploadedBy: "Mr. Adeel Hassan",
    uploadDate: "2026-10-05",
    downloadCount: 210,
  },
  {
    id: "mat-8",
    title: "General Science Chapter Notes",
    subject: "General Science",
    className: "Grade 9th (Arts)",
    fileType: "PDF",
    fileSize: "2.1 MB",
    uploadedBy: "Mr. Usman Ali",
    uploadDate: "2026-10-09",
    downloadCount: 76,
  },
  {
    id: "mat-9",
    title: "Fractions & Mental Math Drills",
    subject: "Mathematics",
    className: "Grade 5-A",
    fileType: "PDF",
    fileSize: "1.1 MB",
    uploadedBy: "Mrs. Nida Farooq",
    uploadDate: "2026-10-07",
    downloadCount: 92,
  },
  {
    id: "mat-10",
    title: "HTML Tags Practice Notes",
    subject: "Computer Science",
    className: "Grade 10th (Science - Computer)",
    fileType: "PDF",
    fileSize: "1.7 MB",
    uploadedBy: "Mr. Usman Ali",
    uploadDate: "2026-10-13",
    downloadCount: 85,
  },
  {
    id: "mat-11",
    title: "Urdu Grammar & Essay Notes",
    subject: "Urdu",
    className: "Grade 10th (Science - Biology)",
    fileType: "PDF",
    fileSize: "2.8 MB",
    uploadedBy: "Ms. Kiran Aziz",
    uploadDate: "2026-10-16",
    downloadCount: 178,
  },
  {
    id: "mat-12",
    title: "Ahadith & Short Questions Notes",
    subject: "Islamiat",
    className: "Grade 9th (Science - Biology)",
    fileType: "PDF",
    fileSize: "1.9 MB",
    uploadedBy: "Mr. Hafiz Zubair",
    uploadDate: "2026-10-15",
    downloadCount: 145,
  },
  {
    id: "mat-13",
    title: "Surah Al-Anfal Translation Notes",
    subject: "Tarjuma-tul-Quran",
    className: "Grade 9th (Arts)",
    fileType: "PDF",
    fileSize: "2.6 MB",
    uploadedBy: "Qari Muhammad Imran",
    uploadDate: "2026-10-17",
    downloadCount: 160,
  },
  {
    id: "mat-14",
    title: "Zakat & Percentage Solved Examples",
    subject: "General Mathematics",
    className: "Grade 10th (Arts)",
    fileType: "PDF",
    fileSize: "1.3 MB",
    uploadedBy: "Mr. Bilal Saeed",
    uploadDate: "2026-10-12",
    downloadCount: 112,
  },
  {
    id: "mat-15",
    title: "Civics Chapter 1–3 Summary",
    subject: "Civics",
    className: "Grade 10th (Arts)",
    fileType: "SLIDES",
    fileSize: "2.2 MB",
    uploadedBy: "Mr. Waqas Anwar",
    uploadDate: "2026-10-14",
    downloadCount: 94,
  },
];

export const LMS_LIVE_CLASSES: LmsLiveClass[] = [
  {
    id: "live-1",
    title: "Mathematics: Quadratic Equations Revision",
    subject: "Mathematics",
    className: "Grade 10th (Science - Biology)",
    teacher: "Mr. Adeel Hassan",
    date: "2026-10-23",
    startTime: "09:30 AM",
    endTime: "10:30 AM",
    platform: "Google Meet",
    status: "Live Now",
    joinUrl: "https://meet.google.com/edu-math-live",
  },
  {
    id: "live-2",
    title: "Physics: Motion & Numericals Help Session",
    subject: "Physics",
    className: "Grade 9th (Science - Biology)",
    teacher: "Dr. Saima Riaz",
    date: "2026-10-23",
    startTime: "11:30 AM",
    endTime: "12:30 PM",
    platform: "Zoom",
    status: "Upcoming",
    joinUrl: "https://zoom.us/j/987654321",
  },
  {
    id: "live-4",
    title: "Computer Science: HTML Class Practice",
    subject: "Computer Science",
    className: "Grade 10th (Science - Computer)",
    teacher: "Mr. Usman Ali",
    date: "2026-10-24",
    startTime: "12:00 PM",
    endTime: "01:00 PM",
    platform: "Zoom",
    status: "Upcoming",
    joinUrl: "https://zoom.us/j/987654322",
  },
  {
    id: "live-5",
    title: "Computer Science: Flowcharts Review",
    subject: "Computer Science",
    className: "Grade 9th (Science - Computer)",
    teacher: "Mr. Usman Ali",
    date: "2026-10-21",
    startTime: "08:30 AM",
    endTime: "09:30 AM",
    platform: "MS Teams",
    status: "Completed",
    joinUrl: "https://teams.microsoft.com",
  },
];
