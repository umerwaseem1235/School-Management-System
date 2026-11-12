// Pakistani School System — Admission Entry Tests Mock Data

export type AdmissionSessionStatus = "Scheduled" | "Completed";

export type ApplicantResultStatus = "Qualified" | "Not Qualified" | "Absent";

export type AdmissionDecision = "Approved" | "Waitlisted" | "Pending" | "Rejected" | "Enrolled";

export interface AdmissionTestSession {
  id: string;
  title: string;
  classGroup: string;
  subjectsTested: string;
  testDate: string; // YYYY-MM-DD
  timing: string;
  roomHall: string;
  totalMarks: number;
  qualifyingMarks: number; // Standard 50% entry test merit threshold in Pakistani schools
  supervisor: string;
  campus: string;
  academicSession: string;
  status: AdmissionSessionStatus;
}

export interface AdmissionApplicantRecord {
  id: string;
  sessionId: string;
  formNo: string;
  applicantName: string;
  fatherName: string;
  phone: string;
  appliedClass: string;
  previousSchool: string;
  obtainedMarks: number;
  totalMarks: number;
  isAbsent: boolean;
  percentage: number;
  resultStatus: ApplicantResultStatus;
  isManualQualification?: boolean;
  decision: AdmissionDecision;
  remarks: string;
}

export const ADMISSION_CLASS_GROUPS = [
  "Primary Wing (Grade 1 – Grade 5)",
  "Middle Wing (Grade 6 – Grade 8)",
  "Class 9th (Matric Science)",
  "Class 9th (Computer Science)",
  "Montessori & Prep Wing",
];

export const ADMISSION_APPLIED_CLASSES = [
  "Prep / KG",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Class 9th (Science)",
  "Class 9th (Computer)",
];

export const ADMISSION_HALLS = [
  "Main Examination Hall",
  "Junior Wing Activity Hall",
  "Academic Block — Room 102",
  "Academic Block — Room 204",
  "Library Seminar Room",
];

export const ADMISSION_SUPERVISORS = [
  "Mrs. Maryam Shah",
  "Mr. Usman Ali",
  "Dr. Saima Riaz",
  "Mr. Adeel Hassan",
  "Ms. Amina Tariq",
  "Mrs. Nida Farooq",
];

export function normalizeCampusName(campus?: string | null): string {
  if (!campus) return "";
  return campus
    .replace(/[\u2013\u2014\-]/g, "-")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

export function isCampusMatch(
  recordCampus?: string | null,
  selectedCampus?: string | null
): boolean {
  if (
    !selectedCampus ||
    selectedCampus === "ALL" ||
    selectedCampus === "all" ||
    selectedCampus === "All Campuses" ||
    selectedCampus === "All Branches"
  ) {
    return true;
  }
  return normalizeCampusName(recordCampus) === normalizeCampusName(selectedCampus);
}

export function evaluateApplicantScore(
  obtained: number,
  total: number,
  qualifying: number,
  isAbsent: boolean
): {
  percentage: number;
  resultStatus: ApplicantResultStatus;
  defaultDecision: AdmissionDecision;
  remarks: string;
} {
  if (isAbsent) {
    return {
      percentage: 0,
      resultStatus: "Absent",
      defaultDecision: "Pending",
      remarks: "Candidate absent on test day",
    };
  }

  const percentage = total > 0 ? Number(((obtained / total) * 100).toFixed(1)) : 0;

  if (obtained >= qualifying) {
    const highMerit = percentage >= 75;
    return {
      percentage,
      resultStatus: "Qualified",
      defaultDecision: highMerit ? "Approved" : "Waitlisted",
      remarks: highMerit
        ? "Cleared on merit — recommended for admission"
        : "Cleared entry test — subject to seat availability",
    };
  }

  return {
    percentage,
    resultStatus: "Not Qualified",
    defaultDecision: "Rejected",
    remarks: "Below 50% qualifying threshold",
  };
}

export const INITIAL_ADMISSION_SESSIONS: AdmissionTestSession[] = [
  {
    id: "adm-ses-01",
    title: "Matric Intake Entry Test — Batch A",
    classGroup: "Class 9th (Matric Science)",
    subjectsTested: "English, Mathematics, Physics & Urdu",
    testDate: "2026-10-18",
    timing: "09:00 AM – 11:30 AM",
    roomHall: "Main Examination Hall",
    totalMarks: 100,
    qualifyingMarks: 50,
    supervisor: "Mr. Usman Ali",
    campus: "Main Campus — Gulberg",
    academicSession: "2026–27",
    status: "Completed",
  },
  {
    id: "adm-ses-02",
    title: "Middle Wing Admission Assessment",
    classGroup: "Middle Wing (Grade 6 – Grade 8)",
    subjectsTested: "English, Urdu, Mathematics & General Science",
    testDate: "2026-10-21",
    timing: "09:00 AM – 11:00 AM",
    roomHall: "Academic Block — Room 102",
    totalMarks: 100,
    qualifyingMarks: 50,
    supervisor: "Mrs. Maryam Shah",
    campus: "Main Campus — Gulberg",
    academicSession: "2026–27",
    status: "Completed",
  },
  {
    id: "adm-ses-03",
    title: "Primary Wing Entry Test — October",
    classGroup: "Primary Wing (Grade 1 – Grade 5)",
    subjectsTested: "English, Urdu & Basic Mathematics",
    testDate: "2026-10-24",
    timing: "09:30 AM – 11:00 AM",
    roomHall: "Junior Wing Activity Hall",
    totalMarks: 50,
    qualifyingMarks: 25,
    supervisor: "Ms. Amina Tariq",
    campus: "DHA Phase 5 Campus",
    academicSession: "2026–27",
    status: "Completed",
  },
  {
    id: "adm-ses-04",
    title: "Class 9th Computer Science Entry Test",
    classGroup: "Class 9th (Computer Science)",
    subjectsTested: "English, Mathematics, Computer & Urdu",
    testDate: "2026-11-05",
    timing: "09:00 AM – 11:30 AM",
    roomHall: "Academic Block — Room 204",
    totalMarks: 100,
    qualifyingMarks: 50,
    supervisor: "Mr. Adeel Hassan",
    campus: "F-8 Islamabad Campus",
    academicSession: "2026–27",
    status: "Scheduled",
  },
  {
    id: "adm-ses-05",
    title: "Montessori & Prep Oral Interaction",
    classGroup: "Montessori & Prep Wing",
    subjectsTested: "Oral Readiness, Phonics & Basic Numeracy",
    testDate: "2026-11-08",
    timing: "10:00 AM – 12:00 PM",
    roomHall: "Junior Wing Activity Hall",
    totalMarks: 50,
    qualifyingMarks: 25,
    supervisor: "Mrs. Nida Farooq",
    campus: "Main Campus — Gulberg",
    academicSession: "2026–27",
    status: "Scheduled",
  },
  {
    id: "adm-ses-06",
    title: "DHA Matric Intake Assessment (Science)",
    classGroup: "Class 9th (Matric Science)",
    subjectsTested: "English, Mathematics, Physics & Urdu",
    testDate: "2026-11-12",
    timing: "09:00 AM – 11:30 AM",
    roomHall: "Academic Block — Room 102",
    totalMarks: 100,
    qualifyingMarks: 50,
    supervisor: "Mrs. Maryam Shah",
    campus: "DHA Phase 5 Campus",
    academicSession: "2026–27",
    status: "Scheduled",
  },
  {
    id: "adm-ses-07",
    title: "Capital Middle Wing Admission Test",
    classGroup: "Middle Wing (Grade 6 – Grade 8)",
    subjectsTested: "English, Urdu, Mathematics & General Science",
    testDate: "2026-10-22",
    timing: "09:30 AM – 11:30 AM",
    roomHall: "Main Examination Hall",
    totalMarks: 100,
    qualifyingMarks: 50,
    supervisor: "Dr. Saima Riaz",
    campus: "F-8 Islamabad Campus",
    academicSession: "2026–27",
    status: "Completed",
  },
  {
    id: "adm-ses-08",
    title: "Clifton Middle School Entry Assessment",
    classGroup: "Middle Wing (Grade 6 – Grade 8)",
    subjectsTested: "English, Urdu, Mathematics & General Science",
    testDate: "2026-10-25",
    timing: "09:00 AM – 11:00 AM",
    roomHall: "Main Examination Hall",
    totalMarks: 100,
    qualifyingMarks: 50,
    supervisor: "Mr. Adeel Hassan",
    campus: "Clifton Karachi Campus",
    academicSession: "2026–27",
    status: "Completed",
  },
  {
    id: "adm-ses-09",
    title: "Karachi Matric Intake Entry Test",
    classGroup: "Class 9th (Matric Science)",
    subjectsTested: "English, Mathematics, Physics & Chemistry",
    testDate: "2026-11-15",
    timing: "09:30 AM – 12:00 PM",
    roomHall: "Library Seminar Room",
    totalMarks: 100,
    qualifyingMarks: 50,
    supervisor: "Mrs. Nida Farooq",
    campus: "Clifton Karachi Campus",
    academicSession: "2026–27",
    status: "Scheduled",
  },
  {
    id: "adm-ses-10",
    title: "Bahria Town Junior Entry Assessment",
    classGroup: "Primary Wing (Grade 1 – Grade 5)",
    subjectsTested: "English, Urdu & Basic Mathematics",
    testDate: "2026-10-27",
    timing: "10:00 AM – 11:30 AM",
    roomHall: "Junior Wing Activity Hall",
    totalMarks: 50,
    qualifyingMarks: 25,
    supervisor: "Ms. Amina Tariq",
    campus: "Bahria Town Campus",
    academicSession: "2026–27",
    status: "Completed",
  },
  {
    id: "adm-ses-11",
    title: "Bahria Town Computer Science Intake",
    classGroup: "Class 9th (Computer Science)",
    subjectsTested: "English, Mathematics, Computer & Urdu",
    testDate: "2026-11-18",
    timing: "09:00 AM – 11:30 AM",
    roomHall: "Academic Block — Room 204",
    totalMarks: 100,
    qualifyingMarks: 50,
    supervisor: "Mr. Usman Ali",
    campus: "Bahria Town Campus",
    academicSession: "2026–27",
    status: "Scheduled",
  },
];

export const INITIAL_ADMISSION_APPLICANTS: Record<string, AdmissionApplicantRecord[]> = {
  "adm-ses-01": [
    {
      id: "app-101",
      sessionId: "adm-ses-01",
      formNo: "ADM-26-101",
      applicantName: "Abdullah Nasir",
      fatherName: "Nasir Mahmood",
      phone: "0322-8899001",
      appliedClass: "Class 9th (Science)",
      previousSchool: "Allied School — Model Town",
      obtainedMarks: 88,
      totalMarks: 100,
      isAbsent: false,
      percentage: 88,
      resultStatus: "Qualified",
      decision: "Approved",
      remarks: "Cleared on merit — recommended for admission",
    },
    {
      id: "app-102",
      sessionId: "adm-ses-01",
      formNo: "ADM-26-102",
      applicantName: "Hassan Javed",
      fatherName: "Javed Akhtar",
      phone: "0333-9988776",
      appliedClass: "Class 9th (Science)",
      previousSchool: "Dar-e-Arqam High School",
      obtainedMarks: 82,
      totalMarks: 100,
      isAbsent: false,
      percentage: 82,
      resultStatus: "Qualified",
      decision: "Approved",
      remarks: "Strong performance in Mathematics & Physics",
    },
    {
      id: "app-103",
      sessionId: "adm-ses-01",
      formNo: "ADM-26-103",
      applicantName: "Ayesha Siddiqa",
      fatherName: "Tariq Siddiqui",
      phone: "0300-4455123",
      appliedClass: "Class 9th (Science)",
      previousSchool: "The Educators — Johar Campus",
      obtainedMarks: 91,
      totalMarks: 100,
      isAbsent: false,
      percentage: 91,
      resultStatus: "Qualified",
      decision: "Approved",
      remarks: "Top merit score in Batch A",
    },
    {
      id: "app-104",
      sessionId: "adm-ses-01",
      formNo: "ADM-26-104",
      applicantName: "Muhammad Huzaifa",
      fatherName: "Khalid Pervez",
      phone: "0321-6677334",
      appliedClass: "Class 9th (Science)",
      previousSchool: "Punjab Public High School",
      obtainedMarks: 64,
      totalMarks: 100,
      isAbsent: false,
      percentage: 64,
      resultStatus: "Qualified",
      decision: "Waitlisted",
      remarks: "Cleared entry test — subject to seat availability",
    },
    {
      id: "app-105",
      sessionId: "adm-ses-01",
      formNo: "ADM-26-105",
      applicantName: "Subhan Ali",
      fatherName: "Arshad Ali",
      phone: "0345-7722109",
      appliedClass: "Class 9th (Science)",
      previousSchool: "Crescent Model School",
      obtainedMarks: 41,
      totalMarks: 100,
      isAbsent: false,
      percentage: 41,
      resultStatus: "Not Qualified",
      decision: "Rejected",
      remarks: "Below 50% qualifying threshold",
    },
    {
      id: "app-106",
      sessionId: "adm-ses-01",
      formNo: "ADM-26-106",
      applicantName: "Daniyal Raza",
      fatherName: "Syed Raza Gilani",
      phone: "0312-9087112",
      appliedClass: "Class 9th (Science)",
      previousSchool: "Garrison Boys High School",
      obtainedMarks: 0,
      totalMarks: 100,
      isAbsent: true,
      percentage: 0,
      resultStatus: "Absent",
      decision: "Pending",
      remarks: "Candidate absent on test day",
    },
  ],
  "adm-ses-02": [
    {
      id: "app-201",
      sessionId: "adm-ses-02",
      formNo: "ADM-26-201",
      applicantName: "Mahnoor Asif",
      fatherName: "Asif Iqbal",
      phone: "0312-4455667",
      appliedClass: "Grade 7",
      previousSchool: "Foundation Public School",
      obtainedMarks: 86,
      totalMarks: 100,
      isAbsent: false,
      percentage: 86,
      resultStatus: "Qualified",
      decision: "Approved",
      remarks: "Excellent English & Mathematics concepts",
    },
    {
      id: "app-202",
      sessionId: "adm-ses-02",
      formNo: "ADM-26-202",
      applicantName: "Ibrahim Yousaf",
      fatherName: "Yousaf Raza",
      phone: "0302-6677889",
      appliedClass: "Grade 8",
      previousSchool: "Army Public School (APS)",
      obtainedMarks: 89,
      totalMarks: 100,
      isAbsent: false,
      percentage: 89,
      resultStatus: "Qualified",
      decision: "Approved",
      remarks: "Cleared on merit — recommended for admission",
    },
    {
      id: "app-203",
      sessionId: "adm-ses-02",
      formNo: "ADM-26-203",
      applicantName: "Eman Fatima",
      fatherName: "Tahir Mehmood",
      phone: "0321-7654321",
      appliedClass: "Grade 6",
      previousSchool: "Lahore Grammar Junior Wing",
      obtainedMarks: 78,
      totalMarks: 100,
      isAbsent: false,
      percentage: 78,
      resultStatus: "Qualified",
      decision: "Approved",
      remarks: "Cleared on merit — recommended for admission",
    },
    {
      id: "app-204",
      sessionId: "adm-ses-02",
      formNo: "ADM-26-204",
      applicantName: "Zain-ul-Abideen",
      fatherName: "Waqar Hussain",
      phone: "0334-5511998",
      appliedClass: "Grade 7",
      previousSchool: "National Grammar School",
      obtainedMarks: 58,
      totalMarks: 100,
      isAbsent: false,
      percentage: 58,
      resultStatus: "Qualified",
      decision: "Waitlisted",
      remarks: "Cleared entry test — placed on waiting list",
    },
    {
      id: "app-205",
      sessionId: "adm-ses-02",
      formNo: "ADM-26-205",
      applicantName: "Haris Mahmood",
      fatherName: "Mahmood Ahmad",
      phone: "0301-8844220",
      appliedClass: "Grade 6",
      previousSchool: "Divisional Public School",
      obtainedMarks: 39,
      totalMarks: 100,
      isAbsent: false,
      percentage: 39,
      resultStatus: "Not Qualified",
      decision: "Rejected",
      remarks: "Below 50% qualifying threshold",
    },
  ],
  "adm-ses-03": [
    {
      id: "app-301",
      sessionId: "adm-ses-03",
      formNo: "ADM-26-301",
      applicantName: "Zoya Kamal",
      fatherName: "Kamal Ahmed",
      phone: "0335-2233445",
      appliedClass: "Grade 2",
      previousSchool: "Bloomfield Hall Junior",
      obtainedMarks: 46,
      totalMarks: 50,
      isAbsent: false,
      percentage: 92,
      resultStatus: "Qualified",
      decision: "Approved",
      remarks: "Outstanding reading & numeracy skills",
    },
    {
      id: "app-302",
      sessionId: "adm-ses-03",
      formNo: "ADM-26-302",
      applicantName: "Rayyan Sheikh",
      fatherName: "Adnan Sheikh",
      phone: "0301-5566778",
      appliedClass: "Grade 4",
      previousSchool: "St. Peter's Junior School",
      obtainedMarks: 41,
      totalMarks: 50,
      isAbsent: false,
      percentage: 82,
      resultStatus: "Qualified",
      decision: "Approved",
      remarks: "Cleared on merit — recommended for admission",
    },
    {
      id: "app-303",
      sessionId: "adm-ses-03",
      formNo: "ADM-26-303",
      applicantName: "Hafsa Imran",
      fatherName: "Imran Butt",
      phone: "0346-9900112",
      appliedClass: "Grade 5",
      previousSchool: "Allied Junior Campus",
      obtainedMarks: 44,
      totalMarks: 50,
      isAbsent: false,
      percentage: 88,
      resultStatus: "Qualified",
      decision: "Approved",
      remarks: "Cleared on merit — recommended for admission",
    },
    {
      id: "app-304",
      sessionId: "adm-ses-03",
      formNo: "ADM-26-304",
      applicantName: "Ali Raza",
      fatherName: "Raza Khan",
      phone: "0300-1234567",
      appliedClass: "Grade 1",
      previousSchool: "Little Angels Montessori",
      obtainedMarks: 29,
      totalMarks: 50,
      isAbsent: false,
      percentage: 58,
      resultStatus: "Qualified",
      decision: "Waitlisted",
      remarks: "Cleared entry test — subject to seat availability",
    },
  ],
  "adm-ses-07": [
    {
      id: "app-701",
      sessionId: "adm-ses-07",
      formNo: "ADM-26-701",
      applicantName: "Zaid Bin Tariq",
      fatherName: "Tariq Mahmood",
      phone: "0301-5566771",
      appliedClass: "Grade 8",
      previousSchool: "Islamabad Model College",
      obtainedMarks: 94,
      totalMarks: 100,
      isAbsent: false,
      percentage: 94,
      resultStatus: "Qualified",
      decision: "Approved",
      remarks: "Top merit score in Islamabad Zone",
    },
    {
      id: "app-702",
      sessionId: "adm-ses-07",
      formNo: "ADM-26-702",
      applicantName: "Hania Imran",
      fatherName: "Imran Farooq",
      phone: "0332-9988112",
      appliedClass: "Grade 7",
      previousSchool: "Roots Millennium Islamabad",
      obtainedMarks: 85,
      totalMarks: 100,
      isAbsent: false,
      percentage: 85,
      resultStatus: "Qualified",
      decision: "Approved",
      remarks: "Cleared on merit — recommended for admission",
    },
    {
      id: "app-703",
      sessionId: "adm-ses-07",
      formNo: "ADM-26-703",
      applicantName: "Hamza Shafiq",
      fatherName: "Shafiq Ur Rehman",
      phone: "0321-4455889",
      appliedClass: "Grade 6",
      previousSchool: "Beaconhouse Margalla Campus",
      obtainedMarks: 68,
      totalMarks: 100,
      isAbsent: false,
      percentage: 68,
      resultStatus: "Qualified",
      decision: "Waitlisted",
      remarks: "Cleared entry test — subject to seat availability",
    },
    {
      id: "app-704",
      sessionId: "adm-ses-07",
      formNo: "ADM-26-704",
      applicantName: "Saad Riaz",
      fatherName: "Riaz Ahmed",
      phone: "0345-1122334",
      appliedClass: "Grade 8",
      previousSchool: "OPF Boys College",
      obtainedMarks: 44,
      totalMarks: 100,
      isAbsent: false,
      percentage: 44,
      resultStatus: "Not Qualified",
      decision: "Rejected",
      remarks: "Below 50% qualifying threshold",
    },
  ],
  "adm-ses-08": [
    {
      id: "app-801",
      sessionId: "adm-ses-08",
      formNo: "ADM-26-801",
      applicantName: "Syed Bilal Shah",
      fatherName: "Syed Anwar Shah",
      phone: "0300-2211998",
      appliedClass: "Grade 7",
      previousSchool: "Karachi Grammar School",
      obtainedMarks: 91,
      totalMarks: 100,
      isAbsent: false,
      percentage: 91,
      resultStatus: "Qualified",
      decision: "Approved",
      remarks: "Highest marks in Clifton Campus Entry Batch",
    },
    {
      id: "app-802",
      sessionId: "adm-ses-08",
      formNo: "ADM-26-802",
      applicantName: "Alishba Khan",
      fatherName: "Zahid Khan",
      phone: "0321-7788990",
      appliedClass: "Grade 6",
      previousSchool: "St. Patrick's High School",
      obtainedMarks: 83,
      totalMarks: 100,
      isAbsent: false,
      percentage: 83,
      resultStatus: "Qualified",
      decision: "Approved",
      remarks: "Cleared on merit — recommended for admission",
    },
    {
      id: "app-803",
      sessionId: "adm-ses-08",
      formNo: "ADM-26-803",
      applicantName: "Rehan Siddiqui",
      fatherName: "Kamran Siddiqui",
      phone: "0333-6655443",
      appliedClass: "Grade 8",
      previousSchool: "The City School PAF Chapter",
      obtainedMarks: 72,
      totalMarks: 100,
      isAbsent: false,
      percentage: 72,
      resultStatus: "Qualified",
      decision: "Waitlisted",
      remarks: "Good score — waitlisted for Clifton morning shift",
    },
    {
      id: "app-804",
      sessionId: "adm-ses-08",
      formNo: "ADM-26-804",
      applicantName: "Farhan Ali",
      fatherName: "Ali Nawaz",
      phone: "0312-3344556",
      appliedClass: "Grade 6",
      previousSchool: "BVS Parsi High School",
      obtainedMarks: 38,
      totalMarks: 100,
      isAbsent: false,
      percentage: 38,
      resultStatus: "Not Qualified",
      decision: "Rejected",
      remarks: "Below 50% qualifying threshold",
    },
  ],
  "adm-ses-10": [
    {
      id: "app-1001",
      sessionId: "adm-ses-10",
      formNo: "ADM-26-1001",
      applicantName: "Dua Noor",
      fatherName: "Noor ul Hassan",
      phone: "0305-6677889",
      appliedClass: "Grade 3",
      previousSchool: "Bahria Foundation School",
      obtainedMarks: 47,
      totalMarks: 50,
      isAbsent: false,
      percentage: 94,
      resultStatus: "Qualified",
      decision: "Approved",
      remarks: "Exceptional literacy & arithmetic aptitude",
    },
    {
      id: "app-1002",
      sessionId: "adm-ses-10",
      formNo: "ADM-26-1002",
      applicantName: "Shahzain Babar",
      fatherName: "Babar Azam",
      phone: "0323-1122445",
      appliedClass: "Grade 4",
      previousSchool: "Roots Millennium Bahria",
      obtainedMarks: 43,
      totalMarks: 50,
      isAbsent: false,
      percentage: 86,
      resultStatus: "Qualified",
      decision: "Approved",
      remarks: "Cleared on merit — recommended for admission",
    },
    {
      id: "app-1003",
      sessionId: "adm-ses-10",
      formNo: "ADM-26-1003",
      applicantName: "Zainab Kashif",
      fatherName: "Kashif Munir",
      phone: "0345-8899001",
      appliedClass: "Grade 2",
      previousSchool: "Beaconhouse Bahria Campus",
      obtainedMarks: 34,
      totalMarks: 50,
      isAbsent: false,
      percentage: 68,
      resultStatus: "Qualified",
      decision: "Waitlisted",
      remarks: "Cleared entry test — subject to seat availability",
    },
    {
      id: "app-1004",
      sessionId: "adm-ses-10",
      formNo: "ADM-26-1004",
      applicantName: "Ahmed Raza",
      fatherName: "Raza Ali",
      phone: "0300-9900112",
      appliedClass: "Grade 1",
      previousSchool: "Smart School Bahria",
      obtainedMarks: 18,
      totalMarks: 50,
      isAbsent: false,
      percentage: 36,
      resultStatus: "Not Qualified",
      decision: "Rejected",
      remarks: "Below 50% qualifying threshold",
    },
  ],
};

export function generateDefaultApplicantsForSession(
  session: AdmissionTestSession
): AdmissionApplicantRecord[] {
  const defaultClass = session.classGroup.includes("9th (Computer")
    ? "Class 9th (Computer)"
    : session.classGroup.includes("9th")
    ? "Class 9th (Science)"
    : session.classGroup.includes("Middle")
    ? "Grade 6"
    : session.classGroup.includes("Primary")
    ? "Grade 3"
    : "Prep / KG";

  const sampleCandidates = [
    {
      name: "Muhammad Ayan",
      father: "Kashif Mehmood",
      phone: "0300-8811223",
      school: "Allied School",
    },
    {
      name: "Anaya Zahid",
      father: "Zahid Latif",
      phone: "0321-4499881",
      school: "The Educators",
    },
    {
      name: "Mustafa Kamran",
      father: "Kamran Shafi",
      phone: "0333-7711204",
      school: "Dar-e-Arqam School",
    },
    {
      name: "Hoorain Tariq",
      father: "Tariq Aziz",
      phone: "0345-6600912",
      school: "Beacon Light Junior",
    },
  ];

  const prefix = String(Math.floor(400 + (session.id.length * 17) % 500));

  return sampleCandidates.map((c, idx) => ({
    id: `app-${session.id}-${idx + 1}`,
    sessionId: session.id,
    formNo: `ADM-26-${prefix}${idx + 1}`,
    applicantName: c.name,
    fatherName: c.father,
    phone: c.phone,
    appliedClass: defaultClass,
    previousSchool: c.school,
    obtainedMarks: 0,
    totalMarks: session.totalMarks,
    isAbsent: false,
    percentage: 0,
    resultStatus: "Not Qualified",
    decision: "Pending",
    remarks: "Awaiting entry test evaluation",
  }));
}
