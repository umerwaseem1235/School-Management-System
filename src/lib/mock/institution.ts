import type {
  ActivityItem,
  AdmissionApplication,
  Campus,
  Student,
  User,
} from "@/types";

export const CAMPUSES: Campus[] = [
  {
    id: "c1",
    campusName: "Main Campus — Gulberg",
    campusCode: "LHR-01",
    city: "Lahore",
    address: "45-B Main Boulevard, Gulberg III",
    contactEmail: "gulberg@edusphere.edu.pk",
    phone: "+92 42 3571 2200",
    principal: "Dr. Ayesha Siddiqui",
    students: 1842,
    staff: 146,
    capacity: 2100,
    feeCollectionRate: 94.2,
    status: "Active",
    established: 2004,
  },
  {
    id: "c2",
    campusName: "DHA Phase 5 Campus",
    campusCode: "LHR-02",
    city: "Lahore",
    address: "Plot 12, Sector C, DHA Phase 5",
    contactEmail: "dha@edusphere.edu.pk",
    phone: "+92 42 3589 4410",
    principal: "Mr. Imran Qureshi",
    students: 1326,
    staff: 112,
    capacity: 1500,
    feeCollectionRate: 91.6,
    status: "Active",
    established: 2011,
  },
  {
    id: "c3",
    campusName: "F-8 Islamabad Campus",
    campusCode: "ISB-01",
    city: "Islamabad",
    address: "Street 21, F-8/2",
    contactEmail: "f8@edusphere.edu.pk",
    phone: "+92 51 2281 3300",
    principal: "Mrs. Sana Malik",
    students: 1104,
    staff: 94,
    capacity: 1300,
    feeCollectionRate: 89.3,
    status: "Active",
    established: 2014,
  },
  {
    id: "c4",
    campusName: "Clifton Karachi Campus",
    campusCode: "KHI-01",
    city: "Karachi",
    address: "Block 5, Clifton",
    contactEmail: "clifton@edusphere.edu.pk",
    phone: "+92 21 3583 7710",
    principal: "Mr. Faisal Rahman",
    students: 978,
    staff: 86,
    capacity: 1200,
    feeCollectionRate: 86.8,
    status: "Active",
    established: 2017,
  },
  {
    id: "c5",
    campusName: "Bahria Town Campus",
    campusCode: "RWP-01",
    city: "Rawalpindi",
    address: "Phase 7, Bahria Town",
    contactEmail: "bahria@edusphere.edu.pk",
    phone: "+92 51 5730 1120",
    principal: "Ms. Hira Javed",
    students: 412,
    staff: 41,
    capacity: 900,
    feeCollectionRate: 82.1,
    status: "Pending",
    established: 2025,
  },
];

export const CAMPUS_NAMES = CAMPUSES.map((c) => c.campusName);

export const USERS: User[] = [
  { id: "u1", name: "Hamza Tariq", email: "hamza.tariq@edusphere.edu.pk", role: "Super Admin", campus: "All Campuses", status: "Active", lastLogin: "2026-10-07T07:42:00Z" },
  { id: "u2", name: "Nadia Hussain", email: "nadia.h@edusphere.edu.pk", role: "HR Admin", campus: "Main Campus — Gulberg", status: "Active", lastLogin: "2026-10-07T06:15:00Z" },
  { id: "u3", name: "Usman Ali", email: "usman.ali@edusphere.edu.pk", role: "Teacher", campus: "DHA Phase 5 Campus", status: "Active", lastLogin: "2026-10-07T05:58:00Z" },
  { id: "u4", name: "Maryam Shah", email: "maryam.shah@edusphere.edu.pk", role: "Teacher", campus: "Main Campus — Gulberg", status: "Active", lastLogin: "2026-10-06T14:22:00Z" },
  { id: "u5", name: "Zain Ahmed", email: "zain.ahmed@student.edusphere.pk", role: "Student", campus: "Main Campus — Gulberg", status: "Active", lastLogin: "2026-10-06T18:40:00Z" },
  { id: "u6", name: "Kamran Ahmed", email: "kamran.ahmed@gmail.com", role: "Parent", campus: "Main Campus — Gulberg", status: "Active", lastLogin: "2026-10-05T20:11:00Z" },
  { id: "u7", name: "Rabia Noor", email: "rabia.noor@edusphere.edu.pk", role: "HR Admin", campus: "F-8 Islamabad Campus", status: "Active", lastLogin: "2026-10-07T04:30:00Z" },
  { id: "u8", name: "Bilal Saeed", email: "bilal.saeed@edusphere.edu.pk", role: "Teacher", campus: "Clifton Karachi Campus", status: "Suspended", lastLogin: "2026-09-21T09:12:00Z" },
  { id: "u9", name: "Fatima Zahra", email: "fatima.z@student.edusphere.pk", role: "Student", campus: "F-8 Islamabad Campus", status: "Active", lastLogin: "2026-10-06T16:02:00Z" },
  { id: "u10", name: "Ahsan Iqbal", email: "ahsan.iqbal@outlook.com", role: "Parent", campus: "DHA Phase 5 Campus", status: "Inactive", lastLogin: "2026-08-30T19:45:00Z" },
  { id: "u11", name: "Saad Mehmood", email: "saad.m@edusphere.edu.pk", role: "Teacher", campus: "Bahria Town Campus", status: "Pending", lastLogin: "2026-10-01T10:00:00Z" },
  { id: "u12", name: "Hina Rauf", email: "hina.rauf@edusphere.edu.pk", role: "Super Admin", campus: "All Campuses", status: "Active", lastLogin: "2026-10-06T11:18:00Z" },
];

export const ADMISSIONS: AdmissionApplication[] = [
  { id: "a1", applicant: "Ali Raza", guardian: "Raza Khan", phone: "0300-1234567", appliedClass: "Grade 1", campus: "Main Campus — Gulberg", stage: "Inquiry", appliedOn: "2026-10-06" },
  { id: "a2", applicant: "Eman Fatima", guardian: "Tahir Mehmood", phone: "0321-7654321", appliedClass: "Grade 6", campus: "DHA Phase 5 Campus", stage: "Inquiry", appliedOn: "2026-10-05" },
  { id: "a3", applicant: "Hassan Javed", guardian: "Javed Akhtar", phone: "0333-9988776", appliedClass: "Grade 9", campus: "F-8 Islamabad Campus", stage: "Application", appliedOn: "2026-10-03" },
  { id: "a4", applicant: "Aiza Khan", guardian: "Shahid Khan", phone: "0345-1122334", appliedClass: "KG", campus: "Main Campus — Gulberg", stage: "Application", appliedOn: "2026-10-02" },
  { id: "a5", applicant: "Rayyan Sheikh", guardian: "Adnan Sheikh", phone: "0301-5566778", appliedClass: "Grade 4", campus: "Clifton Karachi Campus", stage: "Application", appliedOn: "2026-10-01" },
  { id: "a6", applicant: "Mahnoor Asif", guardian: "Asif Iqbal", phone: "0312-4455667", appliedClass: "Grade 7", campus: "DHA Phase 5 Campus", stage: "Interview/Test", appliedOn: "2026-09-28", score: 78 },
  { id: "a7", applicant: "Abdullah Nasir", guardian: "Nasir Mahmood", phone: "0322-8899001", appliedClass: "Grade 11", campus: "Main Campus — Gulberg", stage: "Interview/Test", appliedOn: "2026-09-26", score: 84 },
  { id: "a8", applicant: "Zoya Kamal", guardian: "Kamal Ahmed", phone: "0335-2233445", appliedClass: "Grade 2", campus: "F-8 Islamabad Campus", stage: "Approved", appliedOn: "2026-09-22", score: 91 },
  { id: "a9", applicant: "Ibrahim Yousaf", guardian: "Yousaf Raza", phone: "0302-6677889", appliedClass: "Grade 8", campus: "Bahria Town Campus", stage: "Approved", appliedOn: "2026-09-20", score: 88 },
  { id: "a10", applicant: "Hafsa Imran", guardian: "Imran Butt", phone: "0346-9900112", appliedClass: "Grade 5", campus: "Main Campus — Gulberg", stage: "Enrolled", appliedOn: "2026-09-15", score: 93 },
  { id: "a11", applicant: "Taha Siddiqui", guardian: "Omer Siddiqui", phone: "0311-3344556", appliedClass: "Grade 10", campus: "Clifton Karachi Campus", stage: "Enrolled", appliedOn: "2026-09-12", score: 86 },
];

const firstNames = ["Zain", "Ayesha", "Hamza", "Fatima", "Ali", "Maryam", "Usman", "Hira", "Bilal", "Sara", "Ahmed", "Iqra", "Hassan", "Amna", "Saad", "Noor", "Omer", "Zara", "Taha", "Laiba"];
const lastNames = ["Ahmed", "Khan", "Malik", "Qureshi", "Siddiqui", "Sheikh", "Butt", "Raza", "Javed", "Hussain"];
const classes = ["Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"];
const sections = ["A", "B", "C"];
const feeStatuses = ["Paid", "Paid", "Paid", "Partial", "Unpaid", "Overdue"] as const;
const studentStatuses = ["Active", "Active", "Active", "Active", "Active", "Active", "Transferred", "Alumni", "Suspended"] as const;

export const STUDENTS: Student[] = Array.from({ length: 48 }, (_, i) => {
  const first = firstNames[i % firstNames.length];
  const last = lastNames[(i * 3) % lastNames.length];
  const female = ["Ayesha", "Fatima", "Maryam", "Hira", "Sara", "Iqra", "Amna", "Noor", "Zara", "Laiba"].includes(first);
  return {
    id: `s${i + 1}`,
    admissionNumber: `SMS-2026-${String(412 + i).padStart(4, "0")}`,
    rollNo: `${10 + (i % 40)}`,
    name: `${first} ${last}`,
    gender: female ? "Female" : "Male",
    className: classes[i % classes.length],
    section: sections[i % sections.length],
    campus: CAMPUSES[i % 4].campusName,
    guardian: `${lastNames[(i + 2) % lastNames.length]} ${last}`,
    phone: `03${(i % 5) + 0}${i % 10}-${String(1000000 + i * 7919).slice(0, 7)}`,
    attendance: 72 + ((i * 7) % 27),
    feeStatus: feeStatuses[i % feeStatuses.length],
    status: studentStatuses[i % studentStatuses.length],
    enrolledOn: `20${20 + (i % 7)}-0${(i % 9) + 1}-1${i % 9}`,
  };
});

export const RECENT_ACTIVITY: ActivityItem[] = [
  { id: "r1", title: "Fee batch generated", description: "1,326 challans for October — DHA Phase 5", time: "12 min ago", type: "fee" },
  { id: "r2", title: "New admission enrolled", description: "Hafsa Imran → Grade 5-B, Gulberg", time: "38 min ago", type: "admission" },
  { id: "r3", title: "Mid-Term datesheet published", description: "Grades 6–10, all campuses", time: "1 hr ago", type: "exam" },
  { id: "r4", title: "September payroll approved", description: "479 employees · Rs 38.4M net", time: "3 hr ago", type: "hr" },
  { id: "r5", title: "Role permissions updated", description: "HR Admin — Recruitment module enabled", time: "Yesterday", type: "system" },
  { id: "r6", title: "Bulk SMS delivered", description: "Absence alerts sent to 214 guardians", time: "Yesterday", type: "system" },
];
