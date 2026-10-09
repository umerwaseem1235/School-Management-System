export const ENROLLMENT_TREND = [
  { year: "2020", students: 3920 },
  { year: "2021", students: 4180 },
  { year: "2022", students: 4510 },
  { year: "2023", students: 4870 },
  { year: "2024", students: 5140 },
  { year: "2025", students: 5395 },
  { year: "2026", students: 5662 },
];

export const WEEKLY_ATTENDANCE = [
  { day: "Mon", students: 94.2, staff: 97.1 },
  { day: "Tue", students: 95.8, staff: 98.3 },
  { day: "Wed", students: 93.1, staff: 96.4 },
  { day: "Thu", students: 92.7, staff: 97.8 },
  { day: "Fri", students: 89.4, staff: 95.2 },
  { day: "Sat", students: 91.6, staff: 96.9 },
];

export const CAMPUS_ATTENDANCE_TODAY = [
  { campus: "Gulberg", present: 1748, absent: 61, late: 33, rate: 94.9 },
  { campus: "DHA Phase 5", present: 1244, absent: 52, late: 30, rate: 93.8 },
  { campus: "F-8 Islamabad", present: 1029, absent: 47, late: 28, rate: 93.2 },
  { campus: "Clifton", present: 893, absent: 58, late: 27, rate: 91.3 },
  { campus: "Bahria Town", present: 381, absent: 20, late: 11, rate: 92.5 },
];

export const MONTHLY_ATTENDANCE = [
  { month: "Apr", rate: 95.1 },
  { month: "May", rate: 93.8 },
  { month: "Jun", rate: 88.2 },
  { month: "Jul", rate: 90.4 },
  { month: "Aug", rate: 94.6 },
  { month: "Sep", rate: 95.3 },
  { month: "Oct", rate: 93.9 },
];

export const ATTENDANCE_ALERTS = [
  { name: "Hassan Javed", className: "Grade 9-B", campus: "F-8 Islamabad", rate: 68.4, consecutive: 4 },
  { name: "Amna Raza", className: "Grade 7-A", campus: "Clifton", rate: 71.2, consecutive: 3 },
  { name: "Saad Butt", className: "Grade 10-C", campus: "Gulberg", rate: 72.8, consecutive: 2 },
  { name: "Zara Khan", className: "Grade 6-B", campus: "DHA Phase 5", rate: 73.5, consecutive: 3 },
];

export const GENDER_SPLIT = [
  { name: "Male", value: 2948, fill: "var(--color-male)" },
  { name: "Female", value: 2714, fill: "var(--color-female)" },
];

export const RETENTION = [
  { year: "2021", retention: 91.2, dropout: 3.1 },
  { year: "2022", retention: 92.4, dropout: 2.8 },
  { year: "2023", retention: 93.1, dropout: 2.4 },
  { year: "2024", retention: 94.0, dropout: 2.1 },
  { year: "2025", retention: 94.8, dropout: 1.9 },
  { year: "2026", retention: 95.3, dropout: 1.6 },
];

export const UPCOMING_EVENTS = [
  { date: "12", month: "Oct", title: "Mid-Term Examinations begin", meta: "All campuses · Grades 6–10" },
  { date: "17", month: "Oct", title: "Parent–Teacher Meeting", meta: "Gulberg · Grades 1–5" },
  { date: "24", month: "Oct", title: "Inter-Campus Science Fair", meta: "F-8 Islamabad" },
  { date: "31", month: "Oct", title: "October payroll cut-off", meta: "HR & Finance" },
];
