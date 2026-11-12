import type { StaffSalaryRecord } from "./payroll";
import { STAFF_MEMBERS } from "./staff";
import { STAFF_SALARIES } from "./payroll";

export interface TeacherProfile {
  id: string;
  empCode: string;
  name: string;
  gender: "Male" | "Female";
  designation: string;
  department: string;
  campus: string;
  gradeTier: string;
  joiningDate: string;
  cnic: string;
  ntn: string;
  email: string;
  phone: string;
  qualification: string;
  assignedSubjects: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  paymentMode: "Bank Transfer" | "Cheque" | "Cash";
  status: "Active" | "On Leave" | "Probation";
}

export interface MonthlyTeacherSalary {
  monthKey: string; // e.g. "2026-01"
  monthName: string; // e.g. "January 2026"
  monthShort: string; // e.g. "Jan"
  voucherNo: string;
  baseSalary: number;
  houseRentAllowance: number;
  medicalAllowance: number;
  conveyanceAllowance: number;
  specialAllowance: number;
  grossSalary: number;
  taxDeduction: number;
  providentFund: number;
  eobi: number;
  unpaidLeaveDeduction: number;
  loanDeduction: number;
  totalDeductions: number;
  netSalary: number;
  disbursedDate: string;
  paymentMode: "Bank Transfer" | "Cheque" | "Cash";
  transactionRef: string;
  status: "Disbursed" | "Paid" | "Approved" | "Pending" | "On Hold";
}

export interface YearlyTeacherSalarySummary {
  teacher: TeacherProfile;
  year: number;
  sessionLabel: string;
  monthlyRecords: MonthlyTeacherSalary[];
  annualBaseSalary: number;
  annualHra: number;
  annualMedical: number;
  annualConveyance: number;
  annualSpecial: number;
  annualGrossSalary: number;
  annualTaxDeducted: number;
  annualProvidentFund: number;
  annualEobi: number;
  annualOtherDeductions: number;
  annualTotalDeductions: number;
  annualNetDisbursed: number;
  monthsPaidCount: number;
  averageMonthlyGross: number;
  averageMonthlyNet: number;
  taxableIncome: number;
  taxExemptAllowance: number;
  effectiveTaxRate: number;
  taxCertificateRef: string;
  overallStatus: "Fully Disbursed" | "In Progress" | "Pending Audit";
}

// ─────────────────────────────────────────────────────────────────────────────
// Master Faculty Profiles
// ─────────────────────────────────────────────────────────────────────────────

export const TEACHER_PROFILES: TeacherProfile[] = [
  {
    id: "tch-1",
    empCode: "EMP-0142",
    name: "Mrs. Maryam Shah",
    gender: "Female",
    designation: "Head of Sciences & Senior Lecturer",
    department: "Sciences",
    campus: "Main Campus — Gulberg",
    gradeTier: "Scale A1 (Senior Faculty)",
    joiningDate: "2016-08-15",
    cnic: "35201-1892341-2",
    ntn: "7219401-4",
    email: "maryam.shah@edusphere.edu.pk",
    phone: "0333-4129851",
    qualification: "M.Phil. Chemistry (Gold Medalist)",
    assignedSubjects: "Advanced Chemistry, O/A Levels Chemistry",
    bankName: "Meezan Bank Ltd.",
    accountTitle: "Maryam Shah",
    accountNumber: "0201-0103984712",
    iban: "PK36MEZN0002010103984712",
    paymentMode: "Bank Transfer",
    status: "Active",
  },
  {
    id: "tch-2",
    empCode: "EMP-0189",
    name: "Mr. Usman Ali",
    gender: "Male",
    designation: "Head of Computer Science & Robotics",
    department: "Technology & CS",
    campus: "Main Campus — Gulberg",
    gradeTier: "Scale A1 (Senior Faculty)",
    joiningDate: "2017-09-01",
    cnic: "35202-7712390-1",
    ntn: "8190244-8",
    email: "usman.ali@edusphere.edu.pk",
    phone: "0345-8819204",
    qualification: "M.S. Computer Science",
    assignedSubjects: "Computer Science, AI & Python Lab",
    bankName: "Habib Bank Limited (HBL)",
    accountTitle: "Usman Ali",
    accountNumber: "0042-7901882410",
    iban: "PK58HABB0000427901882410",
    paymentMode: "Bank Transfer",
    status: "Active",
  },
  {
    id: "tch-3",
    empCode: "EMP-0981",
    name: "Mr. Umer",
    gender: "Male",
    designation: "Senior Physics Faculty & Academic Lead",
    department: "Sciences",
    campus: "F-8 Islamabad Campus",
    gradeTier: "Scale A1 (Senior Faculty)",
    joiningDate: "2020-03-01",
    cnic: "35201-1928374-1",
    ntn: "6519283-2",
    email: "umer.sciences@edusphere.edu.pk",
    phone: "0300-8419205",
    qualification: "M.Sc. Applied Physics",
    assignedSubjects: "Physics (Grade 9 & 10, O-Levels)",
    bankName: "Meezan Bank Ltd.",
    accountTitle: "Mr. Umer",
    accountNumber: "0201-0819204812",
    iban: "PK36MEZN0002010819204812",
    paymentMode: "Bank Transfer",
    status: "Active",
  },
  {
    id: "tch-4",
    empCode: "STF-1002",
    name: "Mr. Adeel Hassan",
    gender: "Male",
    designation: "Senior Subject Specialist — Mathematics",
    department: "Mathematics",
    campus: "Main Campus — Gulberg",
    gradeTier: "Scale A2 (Subject Specialist)",
    joiningDate: "2014-03-15",
    cnic: "35202-4519283-7",
    ntn: "5419203-1",
    email: "adeel.hassan@edusphere.edu.pk",
    phone: "0321-4509182",
    qualification: "M.Phil. Applied Mathematics",
    assignedSubjects: "Pure Mathematics, Statistics Grade 11-12",
    bankName: "Allied Bank Ltd.",
    accountTitle: "Adeel Hassan",
    accountNumber: "0491-0029103847",
    iban: "PK19ABPA0004910029103847",
    paymentMode: "Bank Transfer",
    status: "Active",
  },
  {
    id: "tch-5",
    empCode: "STF-1005",
    name: "Dr. Saima Riaz",
    gender: "Female",
    designation: "Senior Subject Specialist — Physics",
    department: "Sciences",
    campus: "F-8 Islamabad Campus",
    gradeTier: "Scale A1 (Senior Faculty)",
    joiningDate: "2015-09-01",
    cnic: "37405-8819234-4",
    ntn: "9102834-5",
    email: "saima.riaz@edusphere.edu.pk",
    phone: "0300-5541289",
    qualification: "Ph.D. Theoretical Physics",
    assignedSubjects: "Physics (A-Levels & IGCSE)",
    bankName: "Meezan Bank Ltd.",
    accountTitle: "Dr. Saima Riaz",
    accountNumber: "0201-0982736152",
    iban: "PK36MEZN0002010982736152",
    paymentMode: "Bank Transfer",
    status: "Active",
  },
  {
    id: "tch-6",
    empCode: "EMP-0248",
    name: "Mr. Kamran Akmal",
    gender: "Male",
    designation: "Director Physical Education & Sports",
    department: "Arts & Sports",
    campus: "DHA Phase 5 Campus",
    gradeTier: "Scale A2 (Subject Specialist)",
    joiningDate: "2019-01-15",
    cnic: "35201-8192034-5",
    ntn: "3491028-9",
    email: "kamran.sports@edusphere.edu.pk",
    phone: "0301-4419208",
    qualification: "M.Sc. Sports Sciences",
    assignedSubjects: "Physical Health & Fitness, Athletics",
    bankName: "Allied Bank Ltd.",
    accountTitle: "Kamran Akmal",
    accountNumber: "0010-8837261524",
    iban: "PK19ABPA0000108837261524",
    paymentMode: "Bank Transfer",
    status: "Active",
  },
  {
    id: "tch-7",
    empCode: "EMP-0312",
    name: "Ms. Ayesha Siddiqa",
    gender: "Female",
    designation: "Head of English & World Literature",
    department: "English & Languages",
    campus: "DHA Phase 5 Campus",
    gradeTier: "Scale A1 (Senior Faculty)",
    joiningDate: "2018-08-01",
    cnic: "35202-9918273-6",
    ntn: "4519283-7",
    email: "ayesha.siddiqa@edusphere.edu.pk",
    phone: "0333-8819201",
    qualification: "M.Phil. English Literature",
    assignedSubjects: "English Literature, Creative Writing",
    bankName: "Meezan Bank Ltd.",
    accountTitle: "Ayesha Siddiqa",
    accountNumber: "0201-0554192834",
    iban: "PK36MEZN0002010554192834",
    paymentMode: "Bank Transfer",
    status: "Active",
  },
  {
    id: "tch-8",
    empCode: "EMP-0335",
    name: "Mr. Tariq Jamil",
    gender: "Male",
    designation: "Senior Chemistry Faculty",
    department: "Sciences",
    campus: "Main Campus — Gulberg",
    gradeTier: "Scale A2 (Subject Specialist)",
    joiningDate: "2021-02-01",
    cnic: "35201-6619284-3",
    ntn: "2819204-6",
    email: "tariq.jamil@edusphere.edu.pk",
    phone: "0322-9918274",
    qualification: "M.Sc. Organic Chemistry",
    assignedSubjects: "Chemistry Grade 9-10 & Lab Work",
    bankName: "Allied Bank Ltd.",
    accountTitle: "Tariq Jamil",
    accountNumber: "0491-0088192736",
    iban: "PK19ABPA0004910088192736",
    paymentMode: "Bank Transfer",
    status: "Active",
  },
  {
    id: "tch-9",
    empCode: "EMP-0391",
    name: "Mrs. Saima Bukhari",
    gender: "Female",
    designation: "Senior Biology Faculty",
    department: "Sciences",
    campus: "Main Campus — Gulberg",
    gradeTier: "Scale A2 (Subject Specialist)",
    joiningDate: "2019-11-15",
    cnic: "35202-3349182-8",
    ntn: "1928374-2",
    email: "saima.bukhari@edusphere.edu.pk",
    phone: "0346-5519283",
    qualification: "M.Phil. Molecular Biology",
    assignedSubjects: "Biology, Microbiology, Biotechnology",
    bankName: "Meezan Bank Ltd.",
    accountTitle: "Saima Bukhari",
    accountNumber: "0201-0771928491",
    iban: "PK36MEZN0002010771928491",
    paymentMode: "Bank Transfer",
    status: "Active",
  },
  {
    id: "tch-10",
    empCode: "EMP-0418",
    name: "Mr. Bilal Hassan",
    gender: "Male",
    designation: "Senior Mathematics Lecturer",
    department: "Mathematics",
    campus: "Clifton Campus",
    gradeTier: "Scale A2 (Subject Specialist)",
    joiningDate: "2020-08-15",
    cnic: "42301-7719284-9",
    ntn: "3819204-5",
    email: "bilal.hassan@edusphere.edu.pk",
    phone: "0302-8819273",
    qualification: "M.Sc. Applied Mathematics",
    assignedSubjects: "Calculus & Pure Math (Grade 11-12)",
    bankName: "Habib Bank Limited (HBL)",
    accountTitle: "Bilal Hassan",
    accountNumber: "0042-9918274619",
    iban: "PK58HABB0000429918274619",
    paymentMode: "Bank Transfer",
    status: "Active",
  },
  {
    id: "tch-11",
    empCode: "EMP-0477",
    name: "Ms. Noreen Khalid",
    gender: "Female",
    designation: "Subject Specialist — Urdu Language & History",
    department: "English & Languages",
    campus: "Bahria Town Campus",
    gradeTier: "Scale A2 (Subject Specialist)",
    joiningDate: "2021-09-01",
    cnic: "35201-4419283-2",
    ntn: "4918273-1",
    email: "noreen.khalid@edusphere.edu.pk",
    phone: "0311-6619284",
    qualification: "M.A. Urdu & Pakistan Studies",
    assignedSubjects: "Urdu Literature, Pakistan Studies",
    bankName: "Meezan Bank Ltd.",
    accountTitle: "Noreen Khalid",
    accountNumber: "0201-0441928371",
    iban: "PK36MEZN0002010441928371",
    paymentMode: "Bank Transfer",
    status: "Active",
  },
  {
    id: "tch-12",
    empCode: "EMP-0512",
    name: "Mr. Kashif Mehmood",
    gender: "Male",
    designation: "Lecturer Pakistan Studies & Civics",
    department: "Social Studies & Humanities",
    campus: "Main Campus — Gulberg",
    gradeTier: "Scale A3 (Junior Faculty)",
    joiningDate: "2022-01-10",
    cnic: "35202-1192847-5",
    ntn: "5819204-9",
    email: "kashif.mehmood@edusphere.edu.pk",
    phone: "0331-5519284",
    qualification: "M.Sc. Political Science",
    assignedSubjects: "Pakistan Studies, Civics, Global Perspectives",
    bankName: "Habib Bank Limited (HBL)",
    accountTitle: "Kashif Mehmood",
    accountNumber: "0042-5519283741",
    iban: "PK58HABB0000425519283741",
    paymentMode: "Bank Transfer",
    status: "Active",
  },
  {
    id: "tch-13",
    empCode: "STF-1012",
    name: "Mr. Farooq Qureshi",
    gender: "Male",
    designation: "Subject Specialist — Chemistry",
    department: "Sciences",
    campus: "Clifton Campus",
    gradeTier: "Scale A2 (Subject Specialist)",
    joiningDate: "2019-04-10",
    cnic: "42101-9918274-1",
    ntn: "6918273-0",
    email: "farooq.qureshi@edusphere.edu.pk",
    phone: "0300-4491823",
    qualification: "M.Phil. Analytical Chemistry",
    assignedSubjects: "Inorganic Chemistry, Lab Safety",
    bankName: "Bank Alfalah",
    accountTitle: "Farooq Qureshi",
    accountNumber: "0192-1002938471",
    iban: "PK82ALFH0001921002938471",
    paymentMode: "Bank Transfer",
    status: "Active",
  },
  {
    id: "tch-14",
    empCode: "STF-1013",
    name: "Ms. Hira Javed",
    gender: "Female",
    designation: "Instructor Fine Arts & Visual Design",
    department: "Arts & Sports",
    campus: "Main Campus — Gulberg",
    gradeTier: "Scale A3 (Junior Faculty)",
    joiningDate: "2021-08-15",
    cnic: "35201-7719284-8",
    ntn: "7819204-2",
    email: "hira.javed@edusphere.edu.pk",
    phone: "0323-8819203",
    qualification: "BFA Visual Arts (NCA)",
    assignedSubjects: "Art & Design, Calligraphy, Digital Graphics",
    bankName: "Meezan Bank Ltd.",
    accountTitle: "Hira Javed",
    accountNumber: "0201-0881927364",
    iban: "PK36MEZN0002010881927364",
    paymentMode: "Bank Transfer",
    status: "Active",
  },
  {
    id: "tch-15",
    empCode: "STF-1015",
    name: "Mrs. Naila Pervez",
    gender: "Female",
    designation: "Senior Faculty — Economics & Commerce",
    department: "Social Studies & Humanities",
    campus: "DHA Phase 5 Campus",
    gradeTier: "Scale A2 (Subject Specialist)",
    joiningDate: "2018-09-01",
    cnic: "35202-5519284-1",
    ntn: "8918273-4",
    email: "naila.pervez@edusphere.edu.pk",
    phone: "0345-4419205",
    qualification: "M.Sc. Economics (LSE)",
    assignedSubjects: "Economics (O/A Levels), Commerce",
    bankName: "Meezan Bank Ltd.",
    accountTitle: "Naila Pervez",
    accountNumber: "0201-0991827463",
    iban: "PK36MEZN0002010991827463",
    paymentMode: "Bank Transfer",
    status: "Active",
  },
  {
    id: "tch-16",
    empCode: "STF-1016",
    name: "Mr. Salman Bashir",
    gender: "Male",
    designation: "Senior Accounting & Finance Faculty",
    department: "Social Studies & Humanities",
    campus: "Bahria Town Campus",
    gradeTier: "Scale A2 (Subject Specialist)",
    joiningDate: "2019-10-15",
    cnic: "35201-8819203-4",
    ntn: "9819204-7",
    email: "salman.bashir@edusphere.edu.pk",
    phone: "0332-9918275",
    qualification: "CA Finalist / M.Com",
    assignedSubjects: "Principles of Accounting, Business Finance",
    bankName: "Habib Bank Limited (HBL)",
    accountTitle: "Salman Bashir",
    accountNumber: "0042-8819273645",
    iban: "PK58HABB0000428819273645",
    paymentMode: "Bank Transfer",
    status: "Active",
  },
  {
    id: "tch-17",
    empCode: "STF-1019",
    name: "Mrs. Rabia Tariq",
    gender: "Female",
    designation: "Subject Specialist — Islamic Studies",
    department: "English & Languages",
    campus: "F-8 Islamabad Campus",
    gradeTier: "Scale A3 (Junior Faculty)",
    joiningDate: "2020-01-15",
    cnic: "37405-4419283-7",
    ntn: "1829304-8",
    email: "rabia.tariq@edusphere.edu.pk",
    phone: "0300-8819274",
    qualification: "M.A. Islamic Studies & Arabic",
    assignedSubjects: "Islamic Studies (Middle & Senior School)",
    bankName: "Meezan Bank Ltd.",
    accountTitle: "Rabia Tariq",
    accountNumber: "0201-0661928374",
    iban: "PK36MEZN0002010661928374",
    paymentMode: "Bank Transfer",
    status: "Active",
  },
  {
    id: "tch-18",
    empCode: "STF-1021",
    name: "Ms. Zunaira Tahir",
    gender: "Female",
    designation: "Mathematics Junior Faculty",
    department: "Mathematics",
    campus: "Main Campus — Gulberg",
    gradeTier: "Scale A3 (Junior Faculty)",
    joiningDate: "2022-03-01",
    cnic: "35201-3319284-9",
    ntn: "2918274-1",
    email: "zunaira.tahir@edusphere.edu.pk",
    phone: "0321-7719284",
    qualification: "M.Sc. Mathematics",
    assignedSubjects: "General Mathematics (Grade 6 to 8)",
    bankName: "Allied Bank Ltd.",
    accountTitle: "Zunaira Tahir",
    accountNumber: "0491-0077192834",
    iban: "PK19ABPA0004910077192834",
    paymentMode: "Bank Transfer",
    status: "Active",
  },
  {
    id: "tch-19",
    empCode: "STF-1023",
    name: "Mrs. Shazia Naeem",
    gender: "Female",
    designation: "Senior Primary Wing Faculty Coordinator",
    department: "Sciences",
    campus: "Clifton Campus",
    gradeTier: "Scale A2 (Subject Specialist)",
    joiningDate: "2017-02-10",
    cnic: "42201-6619284-5",
    ntn: "3918274-3",
    email: "shazia.naeem@edusphere.edu.pk",
    phone: "0312-8819204",
    qualification: "M.Ed. Early Childhood & Elementary Education",
    assignedSubjects: "Primary Science & English Coordination",
    bankName: "Bank Alfalah",
    accountTitle: "Shazia Naeem",
    accountNumber: "0192-1008819273",
    iban: "PK82ALFH0001921008819273",
    paymentMode: "Bank Transfer",
    status: "Active",
  },
  {
    id: "tch-20",
    empCode: "STF-1024",
    name: "Mr. Junaid Iqbal",
    gender: "Male",
    designation: "Instructor Computer Science & Programming",
    department: "Technology & CS",
    campus: "Bahria Town Campus",
    gradeTier: "Scale A3 (Junior Faculty)",
    joiningDate: "2021-11-01",
    cnic: "35202-8819204-6",
    ntn: "4918204-6",
    email: "junaid.iqbal@edusphere.edu.pk",
    phone: "0345-6619284",
    qualification: "BS Computer Science (FAST)",
    assignedSubjects: "Intro to Coding, Scratch & Web Basics",
    bankName: "Habib Bank Limited (HBL)",
    accountTitle: "Junaid Iqbal",
    accountNumber: "0042-6619283741",
    iban: "PK58HABB0000426619283741",
    paymentMode: "Bank Transfer",
    status: "Active",
  },
];

// Base salaries for each teacher index/profile to create realistic compensation ranges
const TEACHER_BASE_COMPENSATION: Record<string, { base: number; special: number; conveyance: number }> = {
  "EMP-0142": { base: 145000, special: 10000, conveyance: 12000 }, // Maryam Shah
  "EMP-0189": { base: 128000, special: 8000, conveyance: 10000 },  // Usman Ali
  "EMP-0981": { base: 110000, special: 5000, conveyance: 9000 },   // Mr. Umer
  "STF-1002": { base: 135000, special: 7500, conveyance: 11000 },  // Adeel Hassan
  "STF-1005": { base: 155000, special: 12000, conveyance: 12000 }, // Dr. Saima Riaz
  "EMP-0248": { base: 105000, special: 4000, conveyance: 8500 },   // Kamran Akmal
  "EMP-0312": { base: 132000, special: 7000, conveyance: 10500 },  // Ayesha Siddiqa
  "EMP-0335": { base: 118000, special: 5500, conveyance: 9500 },   // Tariq Jamil
  "EMP-0391": { base: 122000, special: 6000, conveyance: 10000 },  // Saima Bukhari
  "EMP-0418": { base: 126000, special: 6500, conveyance: 10000 },  // Bilal Hassan
  "EMP-0477": { base: 102000, special: 4500, conveyance: 8500 },   // Noreen Khalid
  "EMP-0512": { base: 92000, special: 3500, conveyance: 8000 },    // Kashif Mehmood
  "STF-1012": { base: 120000, special: 5500, conveyance: 9500 },   // Farooq Qureshi
  "STF-1013": { base: 88000, special: 3000, conveyance: 7500 },    // Hira Javed
  "STF-1015": { base: 130000, special: 7000, conveyance: 10500 },  // Naila Pervez
  "STF-1016": { base: 124000, special: 6000, conveyance: 10000 },  // Salman Bashir
  "STF-1019": { base: 94000, special: 3500, conveyance: 8000 },    // Rabia Tariq
  "STF-1021": { base: 86000, special: 3000, conveyance: 7500 },    // Zunaira Tahir
  "STF-1023": { base: 125000, special: 6500, conveyance: 10000 },  // Shazia Naeem
  "STF-1024": { base: 90000, special: 3500, conveyance: 8000 },    // Junaid Iqbal
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_SHORTS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Helper to compute progressive salaried tax for Pakistan FBR 2026 guidelines
function computeTaxForSalary(monthlyGross: number): number {
  const annualGross = monthlyGross * 12;
  // FBR Salaried Slabs:
  // Up to 600k: 0
  // 600k to 1.2M: 5% of excess
  // 1.2M to 2.2M: 30,000 + 15% of excess
  // 2.2M to 3.2M: 180,000 + 25% of excess
  // Above 3.2M: 430,000 + 35% of excess
  let annualTax = 0;
  if (annualGross <= 600000) {
    annualTax = 0;
  } else if (annualGross <= 1200000) {
    annualTax = (annualGross - 600000) * 0.05;
  } else if (annualGross <= 2200000) {
    annualTax = 30000 + (annualGross - 1200000) * 0.15;
  } else if (annualGross <= 3200000) {
    annualTax = 180000 + (annualGross - 2200000) * 0.25;
  } else {
    annualTax = 430000 + (annualGross - 3200000) * 0.35;
  }
  return Math.round(annualTax / 12);
}

/**
 * Generate full 12-month salary records for a specific teacher and year
 */
export function generateTeacherMonthlySalaries(
  teacher: TeacherProfile,
  year: number
): MonthlyTeacherSalary[] {
  const comp = TEACHER_BASE_COMPENSATION[teacher.empCode] || {
    base: 100000,
    special: 5000,
    conveyance: 8000,
  };

  // Adjust base slightly for past years (e.g. 2025: 92%, 2024: 84%)
  let yearFactor = 1.0;
  if (year === 2025) yearFactor = 0.91;
  else if (year === 2024) yearFactor = 0.82;
  else if (year === 2023) yearFactor = 0.74;

  const baseSalary = Math.round((comp.base * yearFactor) / 100) * 100;
  const houseRentAllowance = Math.round(baseSalary * 0.3); // 30% HRA
  const medicalAllowance = Math.round(baseSalary * 0.1);   // 10% Medical
  const conveyanceAllowance = Math.round((comp.conveyance * yearFactor) / 100) * 100;
  const specialAllowance = Math.round((comp.special * yearFactor) / 100) * 100;

  // Current date anchor: November 2026
  const isCurrentYear = year === 2026;
  const currentMonthIdx = 10; // November (0-indexed)

  return MONTH_NAMES.map((mName, mIdx) => {
    const monthNum = String(mIdx + 1).padStart(2, "0");
    const monthKey = `${year}-${monthNum}`;
    const voucherNo = `SLP-${year}${monthNum}-${teacher.empCode.replace("EMP-", "").replace("STF-", "")}`;

    // Eid / Mid-Year Academic Performance Bonus in June or March
    let bonusSpecial = specialAllowance;
    if (mIdx === 5) {
      // June Academic Year End bonus
      bonusSpecial += Math.round(baseSalary * 0.15);
    }

    const grossSalary =
      baseSalary +
      houseRentAllowance +
      medicalAllowance +
      conveyanceAllowance +
      bonusSpecial;

    const taxDeduction = computeTaxForSalary(grossSalary);
    const providentFund = Math.round(baseSalary * 0.0833); // 8.33% employee PF
    const eobi = 1500; // Standard EOBI employee contribution

    // Occasional leaves or loan adjustment in month 3 and month 8
    let unpaidLeaveDeduction = 0;
    let loanDeduction = 0;
    if (mIdx === 3 && teacher.id === "tch-2") loanDeduction = 5000;
    if (mIdx === 7 && teacher.id === "tch-6") unpaidLeaveDeduction = 3500;

    const totalDeductions =
      taxDeduction +
      providentFund +
      eobi +
      unpaidLeaveDeduction +
      loanDeduction;

    const netSalary = grossSalary - totalDeductions;

    // Disbursed date is 5th of that month
    const disbursedDate = `${year}-${monthNum}-05`;

    // Status: If current year (2026), months up to October are Disbursed, November is Disbursed/Approved, December is Pending/Scheduled
    let status: "Disbursed" | "Paid" | "Approved" | "Pending" | "On Hold" = "Disbursed";
    if (isCurrentYear) {
      if (mIdx < 10) {
        status = "Disbursed";
      } else if (mIdx === 10) {
        status = "Disbursed";
      } else {
        status = "Pending";
      }
    } else {
      status = "Disbursed";
    }

    const transactionRef = `FT${year}${monthNum}${String(1000 + mIdx * 17).slice(0, 4)}${teacher.empCode.slice(-3)}`;

    return {
      monthKey,
      monthName: `${mName} ${year}`,
      monthShort: MONTH_SHORTS[mIdx],
      voucherNo,
      baseSalary,
      houseRentAllowance,
      medicalAllowance,
      conveyanceAllowance,
      specialAllowance: bonusSpecial,
      grossSalary,
      taxDeduction,
      providentFund,
      eobi,
      unpaidLeaveDeduction,
      loanDeduction,
      totalDeductions,
      netSalary,
      disbursedDate,
      paymentMode: teacher.paymentMode,
      transactionRef,
      status,
    };
  });
}

/**
 * Generate the consolidated yearly summary for a teacher
 */
export function buildTeacherYearlySummary(
  teacher: TeacherProfile,
  year: number = 2026,
  sessionLabel: string = "Calendar Year 2026"
): YearlyTeacherSalarySummary {
  const monthlyRecords = generateTeacherMonthlySalaries(teacher, year);

  const annualBaseSalary = monthlyRecords.reduce((s, r) => s + r.baseSalary, 0);
  const annualHra = monthlyRecords.reduce((s, r) => s + r.houseRentAllowance, 0);
  const annualMedical = monthlyRecords.reduce((s, r) => s + r.medicalAllowance, 0);
  const annualConveyance = monthlyRecords.reduce((s, r) => s + r.conveyanceAllowance, 0);
  const annualSpecial = monthlyRecords.reduce((s, r) => s + r.specialAllowance, 0);
  const annualGrossSalary = monthlyRecords.reduce((s, r) => s + r.grossSalary, 0);
  const annualTaxDeducted = monthlyRecords.reduce((s, r) => s + r.taxDeduction, 0);
  const annualProvidentFund = monthlyRecords.reduce((s, r) => s + r.providentFund, 0);
  const annualEobi = monthlyRecords.reduce((s, r) => s + r.eobi, 0);
  const annualOtherDeductions = monthlyRecords.reduce(
    (s, r) => s + r.unpaidLeaveDeduction + r.loanDeduction,
    0
  );
  const annualTotalDeductions = monthlyRecords.reduce(
    (s, r) => s + r.totalDeductions,
    0
  );
  const annualNetDisbursed = monthlyRecords.reduce((s, r) => s + r.netSalary, 0);

  const monthsPaidCount = monthlyRecords.filter(
    (r) => r.status === "Disbursed" || r.status === "Paid"
  ).length;

  const averageMonthlyGross = Math.round(annualGrossSalary / 12);
  const averageMonthlyNet = Math.round(annualNetDisbursed / 12);

  // FBR Clause 139: Medical allowance up to 10% of basic pay is exempt from income tax
  const taxExemptAllowance = Math.min(annualMedical, Math.round(annualBaseSalary * 0.1));
  const taxableIncome = Math.max(0, annualGrossSalary - taxExemptAllowance);
  const effectiveTaxRate = annualGrossSalary > 0
    ? Number(((annualTaxDeducted / annualGrossSalary) * 100).toFixed(1))
    : 0;

  const taxCertificateRef = `FBR-WHT-${year}-${teacher.empCode.replace("EMP-", "").replace("STF-", "")}-01`;

  const overallStatus =
    monthsPaidCount === 12
      ? "Fully Disbursed"
      : monthsPaidCount >= 10
      ? "In Progress"
      : "Pending Audit";

  return {
    teacher,
    year,
    sessionLabel,
    monthlyRecords,
    annualBaseSalary,
    annualHra,
    annualMedical,
    annualConveyance,
    annualSpecial,
    annualGrossSalary,
    annualTaxDeducted,
    annualProvidentFund,
    annualEobi,
    annualOtherDeductions,
    annualTotalDeductions,
    annualNetDisbursed,
    monthsPaidCount,
    averageMonthlyGross,
    averageMonthlyNet,
    taxableIncome,
    taxExemptAllowance,
    effectiveTaxRate,
    taxCertificateRef,
    overallStatus,
  };
}

/**
 * Return all faculty yearly summaries for a selected year
 */
export function getAllTeacherYearlySummaries(
  year: number = 2026,
  sessionLabel: string = "Calendar Year 2026"
): YearlyTeacherSalarySummary[] {
  return TEACHER_PROFILES.map((teacher) =>
    buildTeacherYearlySummary(teacher, year, sessionLabel)
  );
}

export const AVAILABLE_YEARS = [
  { value: "2026", label: "2026 (Current Year)", year: 2026, session: "Calendar Year 2026" },
  { value: "2025", label: "2025 (Audited Prior Year)", year: 2025, session: "Calendar Year 2025" },
  { value: "2024", label: "2024 (Historical)", year: 2024, session: "Calendar Year 2024" },
  { value: "AY 2026–27", label: "AY 2026–27 (Academic Session)", year: 2026, session: "Academic Session 2026–27" },
  { value: "AY 2025–26", label: "AY 2025–26 (Academic Session)", year: 2025, session: "Academic Session 2025–26" },
];

export const AVAILABLE_CAMPUSES = [
  "All Campuses",
  "Main Campus — Gulberg",
  "DHA Phase 5 Campus",
  "F-8 Islamabad Campus",
  "Clifton Campus",
  "Bahria Town Campus",
];

export const AVAILABLE_DEPARTMENTS = [
  "All Departments",
  "Sciences",
  "Mathematics",
  "English & Languages",
  "Technology & CS",
  "Social Studies & Humanities",
  "Arts & Sports",
];
