// Pakistani School System - Tests & Assessments Mock Data

export type TestType =
  | "Weekly Test"
  | "Monthly Assessment"
  | "Chapter Test"
  | "Class Quiz";

export type TestStatus = "Graded" | "Scheduled" | "In Progress";

export interface ClassTest {
  id: string;
  title: string;
  testType: TestType;
  className: string;
  section: string;
  subject: string;
  subjectCode: string;
  chapterOrTopic: string;
  testDate: string; // YYYY-MM-DD
  totalMarks: number;
  passingMarks: number;
  teacherName: string;
  campus: string;
  status: TestStatus;
}

export interface StudentTestMark {
  id: string;
  testId: string;
  studentId: string;
  rollNo: string;
  studentName: string;
  fatherName: string;
  obtainedMarks: number;
  totalMarks: number;
  isAbsent: boolean;
  percentage: number;
  grade: string;
  status: "Pass" | "Fail" | "Absent";
  remarks: string;
}

export interface WeeklyRoutinePeriod {
  className: string;
  subject: string;
  testType: TestType;
  timing: string;
  teacher: string;
  marks: number;
}

export interface WeeklyRoutineDay {
  day: string;
  focus: string;
  periods: WeeklyRoutinePeriod[];
}

export const PAKISTANI_TEST_CLASSES = [
  "Class 10th (Matric Science)",
  "Class 10th (Computer Science)",
  "Class 9th (Matric Science)",
  "Class 9th (Computer Science)",
  "Grade 8-A",
  "Grade 7-A",
  "Grade 6-A",
  "Grade 5-A",
];

export const PAKISTANI_SUBJECTS_LIST = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "Urdu",
  "Islamiat",
  "Pakistan Studies",
  "General Science",
  "Tarjuma-tul-Quran",
];

export const PAKISTANI_TEACHERS_LIST = [
  "Mr. Usman Ali",
  "Dr. Saima Riaz",
  "Mr. Adeel Hassan",
  "Mrs. Maryam Shah",
  "Mrs. Nida Farooq",
  "Ms. Amina Tariq",
  "Mr. Bilal Saeed",
  "Ms. Kiran Aziz",
  "Mr. Waqas Anwar",
  "Mr. Hafiz Zubair",
];

// Calculate Grade according to Pakistani BISE Board criteria
export function calculatePakistaniGrade(percentage: number, isAbsent = false): {
  grade: string;
  status: "Pass" | "Fail" | "Absent";
} {
  if (isAbsent) {
    return { grade: "ABS", status: "Absent" };
  }
  if (percentage >= 80) return { grade: "A+", status: "Pass" };
  if (percentage >= 70) return { grade: "A", status: "Pass" };
  if (percentage >= 60) return { grade: "B", status: "Pass" };
  if (percentage >= 50) return { grade: "C", status: "Pass" };
  if (percentage >= 40) return { grade: "D", status: "Pass" };
  if (percentage >= 33) return { grade: "E", status: "Pass" };
  return { grade: "F", status: "Fail" };
}

// Initial Class Tests
export const INITIAL_CLASS_TESTS: ClassTest[] = [
  {
    id: "test-01",
    title: "Monthly Assessment - October (Quadratic Equations)",
    testType: "Monthly Assessment",
    className: "Class 10th (Matric Science)",
    section: "A",
    subject: "Mathematics",
    subjectCode: "MTH-10",
    chapterOrTopic: "Ch 1: Quadratic Equations & Ch 2: Theory of Equations",
    testDate: "2026-10-24",
    totalMarks: 50,
    passingMarks: 17,
    teacherName: "Mr. Usman Ali",
    campus: "Main Campus — Gulberg",
    status: "Graded",
  },
  {
    id: "test-02",
    title: "Weekly Test #4: Simple Harmonic Motion & Waves",
    testType: "Weekly Test",
    className: "Class 10th (Matric Science)",
    section: "A",
    subject: "Physics",
    subjectCode: "PHY-10",
    chapterOrTopic: "Unit 10: Simple Harmonic Motion & Waves (Exercise 10.1 - 10.3)",
    testDate: "2026-10-22",
    totalMarks: 25,
    passingMarks: 8,
    teacherName: "Mr. Adeel Hassan",
    campus: "Main Campus — Gulberg",
    status: "Graded",
  },
  {
    id: "test-03",
    title: "Chapter 9 Review Test: Chemical Equilibrium",
    testType: "Chapter Test",
    className: "Class 10th (Matric Science)",
    section: "A",
    subject: "Chemistry",
    subjectCode: "CHM-10",
    chapterOrTopic: "Ch 9: Reversible Reactions & Dynamic Equilibrium",
    testDate: "2026-10-20",
    totalMarks: 25,
    passingMarks: 8,
    teacherName: "Dr. Saima Riaz",
    campus: "Main Campus — Gulberg",
    status: "Graded",
  },
  {
    id: "test-04",
    title: "Weekly Test #5: Levels of Biological Organization",
    testType: "Weekly Test",
    className: "Class 9th (Matric Science)",
    section: "A",
    subject: "Biology",
    subjectCode: "BIO-09",
    chapterOrTopic: "Ch 1: Introduction to Biology & Muslim Scientists",
    testDate: "2026-10-23",
    totalMarks: 25,
    passingMarks: 8,
    teacherName: "Ms. Amina Tariq",
    campus: "Main Campus — Gulberg",
    status: "Graded",
  },
  {
    id: "test-05",
    title: "Monthly Assessment - October (Algorithms & Flowcharts)",
    testType: "Monthly Assessment",
    className: "Class 9th (Computer Science)",
    section: "A",
    subject: "Computer Science",
    subjectCode: "CS-09",
    chapterOrTopic: "Unit 1: Problem Solving, Flowcharts & Algorithm Design",
    testDate: "2026-10-25",
    totalMarks: 50,
    passingMarks: 17,
    teacherName: "Mr. Usman Ali",
    campus: "F-8 Islamabad Campus",
    status: "Graded",
  },
  {
    id: "test-06",
    title: "Grammar & Comprehension Test: Direct / Indirect",
    testType: "Weekly Test",
    className: "Class 9th (Matric Science)",
    section: "A",
    subject: "English",
    subjectCode: "ENG-09",
    chapterOrTopic: "Unit 1: The Saviour of Mankind & Direct/Indirect Speech",
    testDate: "2026-10-18",
    totalMarks: 25,
    passingMarks: 8,
    teacherName: "Mrs. Maryam Shah",
    campus: "Main Campus — Gulberg",
    status: "Graded",
  },
  {
    id: "test-07",
    title: "General Science Monthly Test: Ecology & Habitats",
    testType: "Monthly Assessment",
    className: "Grade 8-A",
    section: "A",
    subject: "General Science",
    subjectCode: "GSC-08",
    chapterOrTopic: "Chapter 1: Ecology & Cellular Organization",
    testDate: "2026-10-21",
    totalMarks: 50,
    passingMarks: 17,
    teacherName: "Dr. Saima Riaz",
    campus: "DHA Phase 5 Campus",
    status: "Graded",
  },
  {
    id: "test-08",
    title: "Urdu Grammar & Khulasa Test",
    testType: "Weekly Test",
    className: "Grade 7-A",
    section: "A",
    subject: "Urdu",
    subjectCode: "URD-07",
    chapterOrTopic: "سبق: دیہاتی اور شہری زندگی کا فرق ، گرائمر: اسم نکرہ کی اقسام",
    testDate: "2026-10-19",
    totalMarks: 25,
    passingMarks: 8,
    teacherName: "Ms. Kiran Aziz",
    campus: "Clifton Karachi Campus",
    status: "Graded",
  },
  {
    id: "test-09",
    title: "Islamiat Surah & Ahadith Evaluation",
    testType: "Weekly Test",
    className: "Grade 6-A",
    section: "A",
    subject: "Islamiat",
    subjectCode: "ISL-06",
    chapterOrTopic: "ایمانیات و عبادات، سورۃ الفاتحہ و حدیث نمبر 1 تا 3 مع ترجمہ",
    testDate: "2026-10-17",
    totalMarks: 25,
    passingMarks: 8,
    teacherName: "Mr. Hafiz Zubair",
    campus: "Main Campus — Gulberg",
    status: "Graded",
  },
  {
    id: "test-10",
    title: "Upcoming Monthly Assessment: Physics Electrostatics",
    testType: "Monthly Assessment",
    className: "Class 10th (Matric Science)",
    section: "A",
    subject: "Physics",
    subjectCode: "PHY-10",
    chapterOrTopic: "Unit 13: Electrostatics (Coulomb's Law, Electric Field, Capacitors)",
    testDate: "2026-11-04",
    totalMarks: 50,
    passingMarks: 17,
    teacherName: "Mr. Adeel Hassan",
    campus: "Main Campus — Gulberg",
    status: "Scheduled",
  },
  {
    id: "test-11",
    title: "Upcoming Weekly Test #6: Factorization & Algebraic Fractions",
    testType: "Weekly Test",
    className: "Class 9th (Matric Science)",
    section: "A",
    subject: "Mathematics",
    subjectCode: "MTH-09",
    chapterOrTopic: "Ch 5: Factorization (Ex 5.1 & 5.2)",
    testDate: "2026-11-06",
    totalMarks: 25,
    passingMarks: 8,
    teacherName: "Mr. Usman Ali",
    campus: "Main Campus — Gulberg",
    status: "Scheduled",
  },
  {
    id: "test-12",
    title: "Upcoming Chapter Test: Acid, Bases & Salts",
    testType: "Chapter Test",
    className: "Class 10th (Matric Science)",
    section: "A",
    subject: "Chemistry",
    subjectCode: "CHM-10",
    chapterOrTopic: "Ch 10: Concepts of Acids and Bases, pH scale",
    testDate: "2026-11-08",
    totalMarks: 25,
    passingMarks: 8,
    teacherName: "Dr. Saima Riaz",
    campus: "Main Campus — Gulberg",
    status: "Scheduled",
  },
];

// Student cohort for standard tests
export interface StudentRosterItem {
  studentId: string;
  rollNo: string;
  studentName: string;
  fatherName: string;
}

export const PAKISTANI_STUDENT_ROSTER: StudentRosterItem[] = [
  { studentId: "std-01", rollNo: "01", studentName: "Muhammad Bilal", fatherName: "Tariq Bilal" },
  { studentId: "std-02", rollNo: "02", studentName: "Fatima Zahra", fatherName: "Dr. Zahid Mehmood" },
  { studentId: "std-03", rollNo: "03", studentName: "Usman Tariq", fatherName: "Tariq Jameel" },
  { studentId: "std-04", rollNo: "04", studentName: "Zainab Bibi", fatherName: "Muhammad Aslam" },
  { studentId: "std-05", rollNo: "05", studentName: "Hamza Ahmed", fatherName: "Ahmed Nadeem" },
  { studentId: "std-06", rollNo: "06", studentName: "Ayesha Khan", fatherName: "Shahid Khan" },
  { studentId: "std-07", rollNo: "07", studentName: "Muhammad Ali Raza", fatherName: "Raza Ali" },
  { studentId: "std-08", rollNo: "08", studentName: "Syeda Maryam", fatherName: "Syed Kamran Shah" },
  { studentId: "std-09", rollNo: "09", studentName: "Abdullah Nasir", fatherName: "Nasir Mahmood" },
  { studentId: "std-10", rollNo: "10", studentName: "Mahnoor Asif", fatherName: "Asif Iqbal" },
  { studentId: "std-11", rollNo: "11", studentName: "Rayyan Sheikh", fatherName: "Adnan Sheikh" },
  { studentId: "std-12", rollNo: "12", studentName: "Zoya Kamal", fatherName: "Kamal Ahmed" },
  { studentId: "std-13", rollNo: "13", studentName: "Ibrahim Yousaf", fatherName: "Yousaf Raza" },
  { studentId: "std-14", rollNo: "14", studentName: "Hafsa Imran", fatherName: "Imran Butt" },
  { studentId: "std-15", rollNo: "15", studentName: "Taha Siddiqui", fatherName: "Omer Siddiqui" },
  { studentId: "std-16", rollNo: "16", studentName: "Hassan Javed", fatherName: "Javed Akhtar" },
  { studentId: "std-17", rollNo: "17", studentName: "Eman Fatima", fatherName: "Tahir Mehmood" },
  { studentId: "std-18", rollNo: "18", studentName: "Saad Mehmood", fatherName: "Mehmood Ul Hassan" },
  { studentId: "std-19", rollNo: "19", studentName: "Amna Raza", fatherName: "Raza Farooq" },
  { studentId: "std-20", rollNo: "20", studentName: "Omer Farooq", fatherName: "Farooq Azam" },
];

// Helper to seed student marks for any test
export function generateMockMarksForTest(test: ClassTest): StudentTestMark[] {
  // Preset mock scores based on test id for realistic distribution
  const scorePresets: Record<string, number[]> = {
    "test-01": [48, 49, 44, 46, 38, 45, 32, 47, 49, 39, 41, 46, 35, 43, 28, 42, 44, 15, 40, 36], // out of 50
    "test-02": [24, 25, 22, 23, 19, 23, 16, 24, 25, 20, 21, 23, 18, 22, 14, 21, 22, 7, 20, 18],  // out of 25
    "test-03": [23, 24, 21, 22, 18, 22, 17, 23, 24, 19, 20, 22, 16, 21, 15, 20, 22, 6, 19, 17],  // out of 25
    "test-04": [24, 25, 23, 24, 20, 23, 18, 24, 25, 21, 22, 24, 19, 23, 16, 22, 23, 8, 21, 19],  // out of 25
    "test-05": [46, 48, 42, 45, 36, 44, 30, 46, 48, 38, 40, 45, 34, 42, 26, 40, 43, 14, 38, 35], // out of 50
    "test-06": [22, 24, 20, 22, 17, 21, 15, 22, 23, 18, 19, 21, 16, 20, 13, 19, 21, 8, 18, 16],  // out of 25
    "test-07": [45, 47, 41, 44, 35, 43, 29, 45, 47, 37, 39, 44, 33, 41, 25, 39, 42, 16, 37, 34], // out of 50
    "test-08": [23, 25, 21, 23, 18, 22, 16, 23, 24, 19, 20, 22, 17, 21, 14, 20, 22, 7, 19, 17],  // out of 25
    "test-09": [24, 25, 22, 24, 19, 23, 17, 24, 25, 20, 21, 23, 18, 22, 15, 21, 23, 8, 20, 18],  // out of 25
  };

  const scores = scorePresets[test.id] || [];

  return PAKISTANI_STUDENT_ROSTER.map((student, idx) => {
    // Student 18 is absent in test-01, otherwise has scores
    const isAbsent = test.id === "test-01" && idx === 17;
    let obtained = 0;

    if (!isAbsent) {
      if (idx < scores.length) {
        obtained = scores[idx];
      } else {
        // Fallback realistic marks if beyond presets
        const ratio = 0.5 + (idx % 5) * 0.1;
        obtained = Math.round(test.totalMarks * ratio);
      }
    }

    const pct = isAbsent
      ? 0
      : Number(((obtained / test.totalMarks) * 100).toFixed(1));
    const gradeObj = calculatePakistaniGrade(pct, isAbsent);

    let remarks = "Satisfactory";
    if (gradeObj.grade === "A+") remarks = "Outstanding Performance";
    else if (gradeObj.grade === "A") remarks = "Excellent Work";
    else if (gradeObj.grade === "B") remarks = "Good Effort";
    else if (gradeObj.grade === "C") remarks = "Average; Needs Revision";
    else if (gradeObj.grade === "D" || gradeObj.grade === "E") remarks = "Remedial Coaching Recommended";
    else if (gradeObj.grade === "F") remarks = "Failed; Re-test Mandatory";
    else if (isAbsent) remarks = "Absent from Assessment";

    return {
      id: `mark-${test.id}-${student.studentId}`,
      testId: test.id,
      studentId: student.studentId,
      rollNo: student.rollNo,
      studentName: student.studentName,
      fatherName: student.fatherName,
      obtainedMarks: isAbsent ? 0 : obtained,
      totalMarks: test.totalMarks,
      isAbsent,
      percentage: pct,
      grade: gradeObj.grade,
      status: gradeObj.status,
      remarks,
    };
  });
}

// Generate all initial marks
export const INITIAL_TEST_MARKS: Record<string, StudentTestMark[]> = {};
INITIAL_CLASS_TESTS.forEach((test) => {
  INITIAL_TEST_MARKS[test.id] = generateMockMarksForTest(test);
});

// Standard Pakistani School Weekly Testing Timetable Routine
export const WEEKLY_TEST_ROUTINE: WeeklyRoutineDay[] = [
  {
    day: "Monday",
    focus: "Mathematics & Quantitative Assessment",
    periods: [
      { className: "Class 10th (Matric)", subject: "Mathematics", testType: "Weekly Test", timing: "08:30 AM – 09:15 AM", teacher: "Mr. Usman Ali", marks: 25 },
      { className: "Class 9th (Matric)", subject: "Mathematics", testType: "Weekly Test", timing: "09:20 AM – 10:05 AM", teacher: "Mr. Usman Ali", marks: 25 },
      { className: "Grade 8-A", subject: "Mathematics", testType: "Weekly Test", timing: "10:30 AM – 11:15 AM", teacher: "Mr. Bilal Saeed", marks: 25 },
    ],
  },
  {
    day: "Tuesday",
    focus: "Physics & Computer Sciences",
    periods: [
      { className: "Class 10th (Science)", subject: "Physics", testType: "Weekly Test", timing: "08:30 AM – 09:15 AM", teacher: "Mr. Adeel Hassan", marks: 25 },
      { className: "Class 9th (Computer)", subject: "Computer Science", testType: "Weekly Test", timing: "09:20 AM – 10:05 AM", teacher: "Mr. Usman Ali", marks: 25 },
      { className: "Grade 7-A", subject: "General Science", testType: "Weekly Test", timing: "11:20 AM – 12:05 PM", teacher: "Dr. Saima Riaz", marks: 25 },
    ],
  },
  {
    day: "Wednesday",
    focus: "Chemistry & Life Sciences (Biology)",
    periods: [
      { className: "Class 10th (Science)", subject: "Chemistry", testType: "Weekly Test", timing: "08:30 AM – 09:15 AM", teacher: "Dr. Saima Riaz", marks: 25 },
      { className: "Class 9th (Science)", subject: "Biology", testType: "Weekly Test", timing: "09:20 AM – 10:05 AM", teacher: "Ms. Amina Tariq", marks: 25 },
      { className: "Grade 6-A", subject: "General Science", testType: "Weekly Test", timing: "10:30 AM – 11:15 AM", teacher: "Mrs. Nida Farooq", marks: 25 },
    ],
  },
  {
    day: "Thursday",
    focus: "English Language & Grammar",
    periods: [
      { className: "Class 10th (All Sections)", subject: "English", testType: "Weekly Test", timing: "08:30 AM – 09:15 AM", teacher: "Mrs. Maryam Shah", marks: 25 },
      { className: "Class 9th (All Sections)", subject: "English", testType: "Weekly Test", timing: "09:20 AM – 10:05 AM", teacher: "Mrs. Maryam Shah", marks: 25 },
      { className: "Grade 8-A", subject: "English", testType: "Weekly Test", timing: "11:20 AM – 12:05 PM", teacher: "Mrs. Maryam Shah", marks: 25 },
    ],
  },
  {
    day: "Friday",
    focus: "Urdu, Islamiat & Tarjuma-tul-Quran",
    periods: [
      { className: "Class 10th (All Sections)", subject: "Pakistan Studies", testType: "Weekly Test", timing: "08:15 AM – 09:00 AM", teacher: "Mr. Waqas Anwar", marks: 25 },
      { className: "Class 9th (All Sections)", subject: "Islamiat / Quran", testType: "Weekly Test", timing: "09:05 AM – 09:50 AM", teacher: "Mr. Hafiz Zubair", marks: 25 },
      { className: "Grade 7-A & 6-A", subject: "Urdu Literature", testType: "Weekly Test", timing: "10:10 AM – 10:55 AM", teacher: "Ms. Kiran Aziz", marks: 25 },
    ],
  },
];
