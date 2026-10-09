import type {
  AcademicClass,
  ExamTerm,
  GradeBand,
  Subject,
  TimetablePeriod,
} from "@/types";

export const CLASSES: AcademicClass[] = [
  { id: "k1", className: "Playgroup", gradeLevel: -1, stream: "General", campus: "Main Campus — Gulberg", sections: 3, students: 72, subjects: 5, classTeacher: "Ms. Rimsha Ali", status: "Active" },
  { id: "k2", className: "Kindergarten", gradeLevel: 0, stream: "General", campus: "Main Campus — Gulberg", sections: 4, students: 104, subjects: 6, classTeacher: "Ms. Sadia Khan", status: "Active" },
  { id: "k3", className: "Grade 1", gradeLevel: 1, stream: "General", campus: "Main Campus — Gulberg", sections: 4, students: 128, subjects: 7, classTeacher: "Mrs. Nida Farooq", status: "Active" },
  { id: "k4", className: "Grade 5", gradeLevel: 5, stream: "General", campus: "DHA Phase 5 Campus", sections: 3, students: 96, subjects: 8, classTeacher: "Mr. Usman Ali", status: "Active" },
  { id: "k5", className: "Grade 8", gradeLevel: 8, stream: "General", campus: "F-8 Islamabad Campus", sections: 3, students: 101, subjects: 9, classTeacher: "Mrs. Maryam Shah", status: "Active" },
  { id: "k6", className: "Grade 9", gradeLevel: 9, stream: "Science", campus: "Main Campus — Gulberg", sections: 3, students: 98, subjects: 8, classTeacher: "Mr. Adeel Hassan", status: "Active" },
  { id: "k7", className: "Grade 9", gradeLevel: 9, stream: "Arts", campus: "Main Campus — Gulberg", sections: 1, students: 34, subjects: 8, classTeacher: "Ms. Kiran Aziz", status: "Active" },
  { id: "k8", className: "Grade 10", gradeLevel: 10, stream: "Science", campus: "Clifton Karachi Campus", sections: 2, students: 68, subjects: 8, classTeacher: "Mr. Bilal Saeed", status: "Active" },
  { id: "k9", className: "Grade 11", gradeLevel: 11, stream: "Commerce", campus: "DHA Phase 5 Campus", sections: 2, students: 61, subjects: 7, classTeacher: "Mr. Waqas Anwar", status: "Active" },
  { id: "k10", className: "Grade 12", gradeLevel: 12, stream: "Science", campus: "F-8 Islamabad Campus", sections: 2, students: 57, subjects: 7, classTeacher: "Dr. Saima Riaz", status: "Inactive" },
];

export const SUBJECTS: Subject[] = [
  { id: "sb1", subjectName: "Mathematics", subjectCode: "MTH-09", className: "Grade 9", isElective: false, maxMarks: 100, passMarks: 40, teacher: "Mr. Adeel Hassan" },
  { id: "sb2", subjectName: "Physics", subjectCode: "PHY-09", className: "Grade 9", isElective: false, maxMarks: 75, passMarks: 30, teacher: "Dr. Saima Riaz" },
  { id: "sb3", subjectName: "Chemistry", subjectCode: "CHM-09", className: "Grade 9", isElective: false, maxMarks: 75, passMarks: 30, teacher: "Mr. Fahad Mir" },
  { id: "sb4", subjectName: "Biology", subjectCode: "BIO-09", className: "Grade 9", isElective: true, maxMarks: 75, passMarks: 30, teacher: "Ms. Amina Tariq" },
  { id: "sb5", subjectName: "Computer Science", subjectCode: "CS-09", className: "Grade 9", isElective: true, maxMarks: 75, passMarks: 30, teacher: "Mr. Usman Ali" },
  { id: "sb6", subjectName: "English", subjectCode: "ENG-09", className: "Grade 9", isElective: false, maxMarks: 100, passMarks: 40, teacher: "Mrs. Maryam Shah" },
  { id: "sb7", subjectName: "Urdu", subjectCode: "URD-09", className: "Grade 9", isElective: false, maxMarks: 100, passMarks: 40, teacher: "Ms. Kiran Aziz" },
  { id: "sb8", subjectName: "Islamiat", subjectCode: "ISL-09", className: "Grade 9", isElective: false, maxMarks: 50, passMarks: 20, teacher: "Mr. Hafiz Zubair" },
  { id: "sb9", subjectName: "Pakistan Studies", subjectCode: "PST-09", className: "Grade 9", isElective: false, maxMarks: 50, passMarks: 20, teacher: "Mr. Waqas Anwar" },
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
