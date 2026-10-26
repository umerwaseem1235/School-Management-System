import type { ExamTerm } from "@/types";

export interface DatesheetEntry {
  id: string;
  termId: string;
  termName: string;
  className: string;
  subject: string;
  examDate: string; // YYYY-MM-DD
  day: string;
  startTime: string; // e.g. "08:30 AM"
  endTime: string;   // e.g. "11:30 AM"
  shift: "Morning" | "Evening";
  maxMarks: number;
  passMarks: number;
  roomHall: string;
  invigilator?: string;
}

export interface PakistaniGradeBand {
  grade: string;
  minMarks: number;
  maxMarks: number;
  percentageRange: string;
  description: string;
  status: "Pass" | "Fail";
}

export const PAKISTANI_EXAM_TERMS: ExamTerm[] = [
  {
    id: "ex-mid-2026",
    examName: "Mid-Term Examination 2026–27",
    academicYear: "2026–2027",
    term: "Mid Term",
    startDate: "2026-12-14",
    endDate: "2026-12-24",
    campus: "All Campuses",
    classes: 14,
    progress: 75,
    status: "Scheduled",
  },
  {
    id: "ex-sendup-2027",
    examName: "Send-Up / Pre-Board Examination 2027",
    academicYear: "2026–2027",
    term: "Send-Up / Pre-Board (9th & 10th)",
    startDate: "2027-01-18",
    endDate: "2027-01-30",
    campus: "All Campuses",
    classes: 4,
    progress: 20,
    status: "Scheduled",
  },
  {
    id: "ex-annual-2027",
    examName: "Annual / Final Examination 2027",
    academicYear: "2026–2027",
    term: "Annual / Final Term",
    startDate: "2027-03-08",
    endDate: "2027-03-24",
    campus: "All Campuses",
    classes: 14,
    progress: 0,
    status: "Scheduled",
  },
  {
    id: "ex-first-2026",
    examName: "First Term Examination 2026",
    academicYear: "2026–2027",
    term: "First Term",
    startDate: "2026-09-15",
    endDate: "2026-09-25",
    campus: "All Campuses",
    classes: 14,
    progress: 100,
    status: "Published",
  },
];

export const PAKISTANI_DATESHEET: DatesheetEntry[] = [
  // Class 10th (Science) - Mid-Term
  {
    id: "ds-10-1",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Class 10th (Science)",
    subject: "English (Compulsory)",
    examDate: "2026-12-14",
    day: "Monday",
    startTime: "08:30 AM",
    endTime: "11:30 AM",
    shift: "Morning",
    maxMarks: 75,
    passMarks: 25,
    roomHall: "Exam Hall 1",
    invigilator: "Mr. Tariq Mehmood",
  },
  {
    id: "ds-10-2",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Class 10th (Science)",
    subject: "Urdu (Compulsory)",
    examDate: "2026-12-15",
    day: "Tuesday",
    startTime: "08:30 AM",
    endTime: "11:30 AM",
    shift: "Morning",
    maxMarks: 75,
    passMarks: 25,
    roomHall: "Exam Hall 1",
    invigilator: "Mrs. Bushra Rehman",
  },
  {
    id: "ds-10-3",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Class 10th (Science)",
    subject: "Mathematics (Science)",
    examDate: "2026-12-17",
    day: "Thursday",
    startTime: "08:30 AM",
    endTime: "11:30 AM",
    shift: "Morning",
    maxMarks: 75,
    passMarks: 25,
    roomHall: "Exam Hall 1",
    invigilator: "Mr. Adeel Hassan",
  },
  {
    id: "ds-10-4",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Class 10th (Science)",
    subject: "Islamiat (Compulsory)",
    examDate: "2026-12-18",
    day: "Friday",
    startTime: "08:30 AM",
    endTime: "10:30 AM",
    shift: "Morning",
    maxMarks: 50,
    passMarks: 17,
    roomHall: "Hall 1 & 2",
    invigilator: "Hafiz M. Zubair",
  },
  {
    id: "ds-10-5",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Class 10th (Science)",
    subject: "Tarjuma-tul-Quran",
    examDate: "2026-12-19",
    day: "Saturday",
    startTime: "08:30 AM",
    endTime: "10:30 AM",
    shift: "Morning",
    maxMarks: 50,
    passMarks: 17,
    roomHall: "Exam Hall 1",
    invigilator: "Qari Abdul Rehman",
  },
  {
    id: "ds-10-6",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Class 10th (Science)",
    subject: "Physics (Theory)",
    examDate: "2026-12-21",
    day: "Monday",
    startTime: "08:30 AM",
    endTime: "11:00 AM",
    shift: "Morning",
    maxMarks: 60,
    passMarks: 20,
    roomHall: "Physics Lab & Hall 1",
    invigilator: "Dr. Saima Riaz",
  },
  {
    id: "ds-10-7",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Class 10th (Science)",
    subject: "Chemistry (Theory)",
    examDate: "2026-12-22",
    day: "Tuesday",
    startTime: "08:30 AM",
    endTime: "11:00 AM",
    shift: "Morning",
    maxMarks: 60,
    passMarks: 20,
    roomHall: "Chemistry Lab & Hall 1",
    invigilator: "Mr. Fahad Mir",
  },
  {
    id: "ds-10-8",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Class 10th (Science)",
    subject: "Biology / Computer Science",
    examDate: "2026-12-23",
    day: "Wednesday",
    startTime: "08:30 AM",
    endTime: "11:00 AM",
    shift: "Morning",
    maxMarks: 60,
    passMarks: 20,
    roomHall: "Bio Lab / CS Lab",
    invigilator: "Mr. Usman Ali / Ms. Amina",
  },
  {
    id: "ds-10-9",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Class 10th (Science)",
    subject: "Pakistan Studies",
    examDate: "2026-12-24",
    day: "Thursday",
    startTime: "08:30 AM",
    endTime: "10:30 AM",
    shift: "Morning",
    maxMarks: 50,
    passMarks: 17,
    roomHall: "Exam Hall 1",
    invigilator: "Mr. Waqas Anwar",
  },

  // Class 9th (Science) - Mid-Term
  {
    id: "ds-9-1",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Class 9th (Science)",
    subject: "English (Compulsory)",
    examDate: "2026-12-14",
    day: "Monday",
    startTime: "08:30 AM",
    endTime: "11:30 AM",
    shift: "Morning",
    maxMarks: 75,
    passMarks: 25,
    roomHall: "Exam Hall 2",
    invigilator: "Mrs. Maryam Shah",
  },
  {
    id: "ds-9-2",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Class 9th (Science)",
    subject: "Urdu (Compulsory)",
    examDate: "2026-12-15",
    day: "Tuesday",
    startTime: "08:30 AM",
    endTime: "11:30 AM",
    shift: "Morning",
    maxMarks: 75,
    passMarks: 25,
    roomHall: "Exam Hall 2",
    invigilator: "Ms. Kiran Aziz",
  },
  {
    id: "ds-9-3",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Class 9th (Science)",
    subject: "Mathematics",
    examDate: "2026-12-17",
    day: "Thursday",
    startTime: "08:30 AM",
    endTime: "11:30 AM",
    shift: "Morning",
    maxMarks: 75,
    passMarks: 25,
    roomHall: "Exam Hall 2",
    invigilator: "Mr. Adeel Hassan",
  },
  {
    id: "ds-9-4",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Class 9th (Science)",
    subject: "Islamiat (Compulsory)",
    examDate: "2026-12-18",
    day: "Friday",
    startTime: "08:30 AM",
    endTime: "10:30 AM",
    shift: "Morning",
    maxMarks: 50,
    passMarks: 17,
    roomHall: "Hall 2",
    invigilator: "Hafiz M. Zubair",
  },
  {
    id: "ds-9-5",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Class 9th (Science)",
    subject: "Tarjuma-tul-Quran",
    examDate: "2026-12-19",
    day: "Saturday",
    startTime: "08:30 AM",
    endTime: "10:30 AM",
    shift: "Morning",
    maxMarks: 50,
    passMarks: 17,
    roomHall: "Exam Hall 2",
    invigilator: "Qari Abdul Rehman",
  },
  {
    id: "ds-9-6",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Class 9th (Science)",
    subject: "Physics",
    examDate: "2026-12-21",
    day: "Monday",
    startTime: "08:30 AM",
    endTime: "11:00 AM",
    shift: "Morning",
    maxMarks: 60,
    passMarks: 20,
    roomHall: "Exam Hall 2",
    invigilator: "Dr. Saima Riaz",
  },
  {
    id: "ds-9-7",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Class 9th (Science)",
    subject: "Chemistry",
    examDate: "2026-12-22",
    day: "Tuesday",
    startTime: "08:30 AM",
    endTime: "11:00 AM",
    shift: "Morning",
    maxMarks: 60,
    passMarks: 20,
    roomHall: "Exam Hall 2",
    invigilator: "Mr. Fahad Mir",
  },
  {
    id: "ds-9-8",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Class 9th (Science)",
    subject: "Biology / Computer Science",
    examDate: "2026-12-23",
    day: "Wednesday",
    startTime: "08:30 AM",
    endTime: "11:00 AM",
    shift: "Morning",
    maxMarks: 60,
    passMarks: 20,
    roomHall: "Bio / CS Lab",
    invigilator: "Mr. Usman Ali",
  },

  // Grade 8 - Mid-Term
  {
    id: "ds-8-1",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Grade 8",
    subject: "English",
    examDate: "2026-12-14",
    day: "Monday",
    startTime: "08:30 AM",
    endTime: "11:00 AM",
    shift: "Morning",
    maxMarks: 100,
    passMarks: 33,
    roomHall: "Rooms 12, 14",
    invigilator: "Mrs. Nida Khan",
  },
  {
    id: "ds-8-2",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Grade 8",
    subject: "Urdu",
    examDate: "2026-12-15",
    day: "Tuesday",
    startTime: "08:30 AM",
    endTime: "11:00 AM",
    shift: "Morning",
    maxMarks: 100,
    passMarks: 33,
    roomHall: "Rooms 12, 14",
    invigilator: "Mr. Khalid Saeed",
  },
  {
    id: "ds-8-3",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Grade 8",
    subject: "Mathematics",
    examDate: "2026-12-17",
    day: "Thursday",
    startTime: "08:30 AM",
    endTime: "11:00 AM",
    shift: "Morning",
    maxMarks: 100,
    passMarks: 33,
    roomHall: "Rooms 12, 14",
    invigilator: "Mr. Adeel Hassan",
  },
  {
    id: "ds-8-4",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Grade 8",
    subject: "General Science",
    examDate: "2026-12-21",
    day: "Monday",
    startTime: "08:30 AM",
    endTime: "11:00 AM",
    shift: "Morning",
    maxMarks: 100,
    passMarks: 33,
    roomHall: "Rooms 12, 14",
    invigilator: "Dr. Saima Riaz",
  },
  {
    id: "ds-8-5",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Grade 8",
    subject: "Islamiat & Tarjuma-tul-Quran",
    examDate: "2026-12-22",
    day: "Tuesday",
    startTime: "08:30 AM",
    endTime: "10:30 AM",
    shift: "Morning",
    maxMarks: 100,
    passMarks: 33,
    roomHall: "Rooms 12, 14",
    invigilator: "Hafiz M. Zubair",
  },
  {
    id: "ds-8-6",
    termId: "ex-mid-2026",
    termName: "Mid-Term Examination 2026–27",
    className: "Grade 8",
    subject: "Computer Education / Social Studies",
    examDate: "2026-12-23",
    day: "Wednesday",
    startTime: "08:30 AM",
    endTime: "10:30 AM",
    shift: "Morning",
    maxMarks: 100,
    passMarks: 33,
    roomHall: "Rooms 12, 14",
    invigilator: "Mr. Usman Ali",
  },
];

/**
 * Standard Pakistani Board (BISE / Federal Board) Grading System:
 * Universally adopted by Pakistani private and government educational institutions.
 */
export const PAKISTANI_BOARD_GRADING_SCALE: PakistaniGradeBand[] = [
  {
    grade: "A-1",
    minMarks: 80,
    maxMarks: 100,
    percentageRange: "80% – 100%",
    description: "Outstanding",
    status: "Pass",
  },
  {
    grade: "A",
    minMarks: 70,
    maxMarks: 79,
    percentageRange: "70% – 79%",
    description: "Excellent",
    status: "Pass",
  },
  {
    grade: "B",
    minMarks: 60,
    maxMarks: 69,
    percentageRange: "60% – 69%",
    description: "Very Good",
    status: "Pass",
  },
  {
    grade: "C",
    minMarks: 50,
    maxMarks: 59,
    percentageRange: "50% – 59%",
    description: "Good",
    status: "Pass",
  },
  {
    grade: "D",
    minMarks: 40,
    maxMarks: 49,
    percentageRange: "40% – 49%",
    description: "Fair",
    status: "Pass",
  },
  {
    grade: "E",
    minMarks: 33,
    maxMarks: 39,
    percentageRange: "33% – 39%",
    description: "Minimum Pass",
    status: "Pass",
  },
  {
    grade: "F",
    minMarks: 0,
    maxMarks: 32,
    percentageRange: "Below 33%",
    description: "Fail / Re-appear",
    status: "Fail",
  },
];

export const PAKISTANI_EXAM_CLASSES = [
  "Playgroup",
  "Nursery",
  "Prep / KG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Grade 8",
  "Class 9th (Science)",
  "Class 9th (Arts)",
  "Class 10th (Science)",
  "Class 10th (Arts)",
];

export const PAKISTANI_EXAM_SUBJECTS = [
  "English (Compulsory)",
  "Urdu (Compulsory)",
  "Mathematics (Science)",
  "General Mathematics (Arts)",
  "Islamiat (Compulsory)",
  "Tarjuma-tul-Quran",
  "Pakistan Studies",
  "Physics (Theory)",
  "Chemistry (Theory)",
  "Biology",
  "Computer Science",
  "General Science",
  "Social Studies",
  "General Knowledge",
  "Ethics (for non-Muslim students)",
];

export interface ClassSubjectConfig {
  subject: string;
  maxMarks: number;
  passMarks: number;
}

/**
 * Standard Pakistani curriculum subjects mapped by class level
 */
export function getClassSubjectsForDatesheet(className: string): ClassSubjectConfig[] {
  const lower = className.toLowerCase();

  if (lower.includes("10") && lower.includes("science")) {
    return [
      { subject: "English (Compulsory)", maxMarks: 75, passMarks: 25 },
      { subject: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25 },
      { subject: "Mathematics (Science)", maxMarks: 75, passMarks: 25 },
      { subject: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17 },
      { subject: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17 },
      { subject: "Physics (Theory)", maxMarks: 60, passMarks: 20 },
      { subject: "Chemistry (Theory)", maxMarks: 60, passMarks: 20 },
      { subject: "Biology / Computer Science", maxMarks: 60, passMarks: 20 },
      { subject: "Pakistan Studies", maxMarks: 50, passMarks: 17 },
    ];
  }

  if (lower.includes("10") && lower.includes("arts")) {
    return [
      { subject: "English (Compulsory)", maxMarks: 75, passMarks: 25 },
      { subject: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25 },
      { subject: "General Mathematics", maxMarks: 75, passMarks: 25 },
      { subject: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17 },
      { subject: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17 },
      { subject: "General Science", maxMarks: 75, passMarks: 25 },
      { subject: "Education / Civics", maxMarks: 75, passMarks: 25 },
      { subject: "Pakistan Studies", maxMarks: 50, passMarks: 17 },
    ];
  }

  if (lower.includes("9") && lower.includes("science")) {
    return [
      { subject: "English (Compulsory)", maxMarks: 75, passMarks: 25 },
      { subject: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25 },
      { subject: "Mathematics", maxMarks: 75, passMarks: 25 },
      { subject: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17 },
      { subject: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17 },
      { subject: "Physics", maxMarks: 60, passMarks: 20 },
      { subject: "Chemistry", maxMarks: 60, passMarks: 20 },
      { subject: "Biology / Computer Science", maxMarks: 60, passMarks: 20 },
    ];
  }

  if (lower.includes("9") && lower.includes("arts")) {
    return [
      { subject: "English (Compulsory)", maxMarks: 75, passMarks: 25 },
      { subject: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25 },
      { subject: "General Mathematics", maxMarks: 75, passMarks: 25 },
      { subject: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17 },
      { subject: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17 },
      { subject: "General Science", maxMarks: 75, passMarks: 25 },
      { subject: "Economics / Civics", maxMarks: 75, passMarks: 25 },
    ];
  }

  if (lower.includes("8") || lower.includes("7") || lower.includes("6")) {
    return [
      { subject: "English", maxMarks: 100, passMarks: 33 },
      { subject: "Urdu", maxMarks: 100, passMarks: 33 },
      { subject: "Mathematics", maxMarks: 100, passMarks: 33 },
      { subject: "General Science", maxMarks: 100, passMarks: 33 },
      { subject: "Islamiat & Tarjuma-tul-Quran", maxMarks: 100, passMarks: 33 },
      { subject: "Computer Education", maxMarks: 75, passMarks: 25 },
      { subject: "Social Studies / History & Geography", maxMarks: 75, passMarks: 25 },
    ];
  }

  if (
    lower.includes("5") ||
    lower.includes("4") ||
    lower.includes("3") ||
    lower.includes("2") ||
    lower.includes("1")
  ) {
    return [
      { subject: "English", maxMarks: 100, passMarks: 33 },
      { subject: "Urdu", maxMarks: 100, passMarks: 33 },
      { subject: "Mathematics", maxMarks: 100, passMarks: 33 },
      { subject: "General Science", maxMarks: 100, passMarks: 33 },
      { subject: "Islamiat / Nazra Quran", maxMarks: 50, passMarks: 17 },
      { subject: "Social Studies / General Knowledge", maxMarks: 50, passMarks: 17 },
    ];
  }

  // Pre-school (Playgroup, Nursery, Prep / KG)
  return [
    { subject: "English (Oral & Written)", maxMarks: 50, passMarks: 17 },
    { subject: "Urdu (Oral & Written)", maxMarks: 50, passMarks: 17 },
    { subject: "Mathematics (Numbers & Counting)", maxMarks: 50, passMarks: 17 },
    { subject: "General Knowledge & Conversation", maxMarks: 50, passMarks: 17 },
    { subject: "Nazra Quran & Islamic Rhymes", maxMarks: 50, passMarks: 17 },
  ];
}

export interface TimelineStats {
  totalSubjects: number;
  totalCalendarDays: number;
  workingDays: number;
  suggestedGapDays: number;
  isDateRangeTight: boolean;
}

/**
 * Calculates timeline statistics for auto datesheet balancing
 */
export function calculateTimelineStats(
  className: string,
  startDate: string,
  endDate: string
): TimelineStats {
  const subjects = getClassSubjectsForDatesheet(className);
  const totalSubjects = subjects.length;

  if (!startDate || !endDate) {
    return {
      totalSubjects,
      totalCalendarDays: 0,
      workingDays: 0,
      suggestedGapDays: 0,
      isDateRangeTight: false,
    };
  }

  const [sY, sM, sD] = startDate.split("-").map(Number);
  const [eY, eM, eD] = endDate.split("-").map(Number);
  const start = new Date(sY, sM - 1, sD);
  const end = new Date(eY, eM - 1, eD);

  if (end < start) {
    return {
      totalSubjects,
      totalCalendarDays: 0,
      workingDays: 0,
      suggestedGapDays: 0,
      isDateRangeTight: true,
    };
  }

  let calendarDays = 0;
  let workingDays = 0;
  const curr = new Date(start);

  while (curr <= end) {
    calendarDays++;
    if (curr.getDay() !== 0) {
      workingDays++;
    }
    curr.setDate(curr.getDate() + 1);
  }

  const isDateRangeTight = workingDays < totalSubjects;
  const excessDays = Math.max(0, workingDays - totalSubjects);
  const suggestedGapDays =
    totalSubjects > 1 ? Math.floor(excessDays / (totalSubjects - 1)) : 0;

  return {
    totalSubjects,
    totalCalendarDays: calendarDays,
    workingDays,
    suggestedGapDays,
    isDateRangeTight,
  };
}

/**
 * Intelligent Datesheet Generator for Pakistani Schools
 * Automatically balances papers across the Start Date to End Date window.
 * If exams are fewer and days are more, automatically injects balanced study gap
 * days so the datesheet neatly spans the whole timeline while skipping Sundays.
 */
export function generateClassDatesheet({
  termId,
  termName,
  className,
  startDate,
  endDate,
  gapMode = "auto",
  startTime = "08:30 AM",
  endTime = "11:30 AM",
  shift = "Morning",
  roomHall = "Exam Hall 1",
  gapDays = 0,
}: {
  termId: string;
  termName: string;
  className: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  gapMode?: "auto" | "fixed_0" | "fixed_1" | "fixed_2";
  startTime?: string;
  endTime?: string;
  shift?: "Morning" | "Evening";
  roomHall?: string;
  gapDays?: number;
}): DatesheetEntry[] {
  const subjects = getClassSubjectsForDatesheet(className);
  const result: DatesheetEntry[] = [];
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const [sY, sM, sD] = startDate.split("-").map(Number);
  const start = new Date(sY, sM - 1, sD);

  // If auto gap mode and endDate is provided, distribute papers evenly across the working days
  if (gapMode === "auto" && endDate) {
    const [eY, eM, eD] = endDate.split("-").map(Number);
    const end = new Date(eY, eM - 1, eD);

    // Collect available working dates (skipping Sundays)
    const availableWorkingDates: { dateStr: string; dayName: string }[] = [];
    const curr = new Date(start);

    while (curr <= end) {
      if (curr.getDay() !== 0) {
        const year = curr.getFullYear();
        const month = String(curr.getMonth() + 1).padStart(2, "0");
        const day = String(curr.getDate()).padStart(2, "0");
        availableWorkingDates.push({
          dateStr: `${year}-${month}-${day}`,
          dayName: daysOfWeek[curr.getDay()],
        });
      }
      curr.setDate(curr.getDate() + 1);
    }

    const totalWorkingDays = availableWorkingDates.length;
    const totalPapers = subjects.length;

    // Case 1: Ample working days to fit all papers (totalWorkingDays >= totalPapers)
    if (totalWorkingDays >= totalPapers) {
      // Calculate balanced indices across the timeline
      for (let i = 0; i < totalPapers; i++) {
        const index =
          totalPapers === 1
            ? 0
            : Math.round((i * (totalWorkingDays - 1)) / (totalPapers - 1));

        const selectedDay = availableWorkingDates[index];

        result.push({
          id: `ds-gen-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          termId,
          termName,
          className,
          subject: subjects[i].subject,
          examDate: selectedDay.dateStr,
          day: selectedDay.dayName,
          startTime,
          endTime,
          shift,
          maxMarks: subjects[i].maxMarks,
          passMarks: subjects[i].passMarks,
          roomHall,
        });
      }

      return result;
    }

    // Case 2: Date range is tight (totalWorkingDays < totalPapers)
    // Use all available days, then continue advancing consecutively past endDate
    const advanceCurr = new Date(start);
    for (let i = 0; i < totalPapers; i++) {
      while (advanceCurr.getDay() === 0) {
        advanceCurr.setDate(advanceCurr.getDate() + 1);
      }

      const year = advanceCurr.getFullYear();
      const month = String(advanceCurr.getMonth() + 1).padStart(2, "0");
      const day = String(advanceCurr.getDate()).padStart(2, "0");

      result.push({
        id: `ds-gen-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        termId,
        termName,
        className,
        subject: subjects[i].subject,
        examDate: `${year}-${month}-${day}`,
        day: daysOfWeek[advanceCurr.getDay()],
        startTime,
        endTime,
        shift,
        maxMarks: subjects[i].maxMarks,
        passMarks: subjects[i].passMarks,
        roomHall,
      });

      advanceCurr.setDate(advanceCurr.getDate() + 1);
    }

    return result;
  }

  // Fixed gap mode (or fallback when auto without endDate)
  let effectiveGap = gapDays;
  if (gapMode === "fixed_0") effectiveGap = 0;
  if (gapMode === "fixed_1") effectiveGap = 1;
  if (gapMode === "fixed_2") effectiveGap = 2;

  const currentDate = new Date(start);

  for (let i = 0; i < subjects.length; i++) {
    while (currentDate.getDay() === 0) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dateStr = String(currentDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${dateStr}`;
    const dayName = daysOfWeek[currentDate.getDay()];

    result.push({
      id: `ds-gen-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      termId,
      termName,
      className,
      subject: subjects[i].subject,
      examDate: formattedDate,
      day: dayName,
      startTime,
      endTime,
      shift,
      maxMarks: subjects[i].maxMarks,
      passMarks: subjects[i].passMarks,
      roomHall,
    });

    currentDate.setDate(currentDate.getDate() + 1 + effectiveGap);
    while (currentDate.getDay() === 0) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return result;
}
