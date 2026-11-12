/* ────────────────────────────────────────────────────────────────────────────
 * Library – Book Catalogue (Opus SMS Super-Admin)
 * ──────────────────────────────────────────────────────────────────────────── */

export type LibraryBookCategory =
  | "Fiction"
  | "Non-Fiction"
  | "Science"
  | "Mathematics"
  | "History"
  | "Islamic Studies"
  | "Computer Science"
  | "Reference"
  | "Children"
  | "Other";

export const LIBRARY_BOOK_CATEGORIES: LibraryBookCategory[] = [
  "Fiction",
  "Non-Fiction",
  "Science",
  "Mathematics",
  "History",
  "Islamic Studies",
  "Computer Science",
  "Reference",
  "Children",
  "Other",
];

export type LibraryBookStatus = "Available" | "Low Stock" | "Out of Stock";

export interface LibraryBookRecord {
  id: string;
  bookCode: string;
  title: string;
  author: string;
  isbn: string;
  category: LibraryBookCategory;
  totalCopies: number;
  availableCopies: number;
  shelf: string;
  publishedYear: number;
  status: LibraryBookStatus;
  remarks: string;
}

export const computeBookStatus = (
  available: number,
  total: number
): LibraryBookStatus => {
  if (available <= 0) return "Out of Stock";
  if (total > 0 && available <= Math.max(1, Math.ceil(total * 0.2)))
    return "Low Stock";
  return "Available";
};

export const INITIAL_LIBRARY_BOOKS: LibraryBookRecord[] = [
  {
    id: "lb-1",
    bookCode: "BK-001",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    isbn: "978-0262033848",
    category: "Computer Science",
    totalCopies: 6,
    availableCopies: 4,
    shelf: "CS-A1",
    publishedYear: 2009,
    status: computeBookStatus(4, 6),
    remarks: "CLRS 3rd edition",
  },
  {
    id: "lb-2",
    bookCode: "BK-002",
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    isbn: "978-0553380163",
    category: "Science",
    totalCopies: 4,
    availableCopies: 2,
    shelf: "SCI-B2",
    publishedYear: 1988,
    status: computeBookStatus(2, 4),
    remarks: "Popular science classic",
  },
  {
    id: "lb-3",
    bookCode: "BK-003",
    title: "The Sealed Nectar",
    author: "Safi-ur-Rahman al-Mubarakpuri",
    isbn: "978-1591440710",
    category: "Islamic Studies",
    totalCopies: 5,
    availableCopies: 5,
    shelf: "ISL-C1",
    publishedYear: 1979,
    status: computeBookStatus(5, 5),
    remarks: "Biography of Prophet (PBUH)",
  },
  {
    id: "lb-4",
    bookCode: "BK-004",
    title: "Pakistan: A Modern History",
    author: "Ian Talbot",
    isbn: "978-1848858891",
    category: "History",
    totalCopies: 3,
    availableCopies: 1,
    shelf: "HIS-D3",
    publishedYear: 2009,
    status: computeBookStatus(1, 3),
    remarks: "Reference for Pakistan Studies",
  },
  {
    id: "lb-5",
    bookCode: "BK-005",
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    category: "Computer Science",
    totalCopies: 4,
    availableCopies: 0,
    shelf: "CS-A2",
    publishedYear: 2008,
    status: computeBookStatus(0, 4),
    remarks: "All copies issued",
  },
  {
    id: "lb-6",
    bookCode: "BK-006",
    title: "Mathematics for Class 9",
    author: "Punjab Textbook Board",
    isbn: "978-9690123456",
    category: "Mathematics",
    totalCopies: 25,
    availableCopies: 22,
    shelf: "MAT-E1",
    publishedYear: 2023,
    status: computeBookStatus(22, 25),
    remarks: "Class 9 textbook",
  },
  {
    id: "lb-7",
    bookCode: "BK-007",
    title: "Charlotte's Web",
    author: "E. B. White",
    isbn: "978-0064400558",
    category: "Children",
    totalCopies: 8,
    availableCopies: 7,
    shelf: "CHD-F1",
    publishedYear: 1952,
    status: computeBookStatus(7, 8),
    remarks: "Junior reading",
  },
  {
    id: "lb-8",
    bookCode: "BK-008",
    title: "Oxford Dictionary",
    author: "Oxford University Press",
    isbn: "978-0199571123",
    category: "Reference",
    totalCopies: 2,
    availableCopies: 2,
    shelf: "REF-G1",
    publishedYear: 2010,
    status: computeBookStatus(2, 2),
    remarks: "Reference only — not issuable",
  },
  {
    id: "lb-9",
    bookCode: "BK-009",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "978-0061120084",
    category: "Fiction",
    totalCopies: 6,
    availableCopies: 5,
    shelf: "FIC-H2",
    publishedYear: 1960,
    status: computeBookStatus(5, 6),
    remarks: "Classic novel",
  },
  {
    id: "lb-10",
    bookCode: "BK-010",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    isbn: "978-0062316097",
    category: "Non-Fiction",
    totalCopies: 3,
    availableCopies: 3,
    shelf: "NF-I1",
    publishedYear: 2015,
    status: computeBookStatus(3, 3),
    remarks: "History of humankind",
  },
];

/* ────────────────────────────────────────────────────────────────────────────
 * Library – Book Issuance & Assignment Register
 * ──────────────────────────────────────────────────────────────────────────── */

/** Stable reference date (avoids dynamic `new Date()` during SSR prerender). */
export const LIBRARY_TODAY = "2026-10-28";

export type LibraryBorrowerType = "Student" | "Staff";

export type LibraryIssuanceStatus = "Issued" | "Returned" | "Overdue";

export interface LibraryIssuanceRecord {
  id: string;
  issueCode: string;
  bookId: string;
  bookCode: string;
  bookTitle: string;
  bookAuthor: string;
  bookCategory: LibraryBookCategory;
  shelf: string;
  borrowerType: LibraryBorrowerType;
  borrowerId: string;
  borrowerName: string;
  borrowerIdentifier: string;
  campus: string;
  issueDate: string;
  dueDate: string;
  returnedDate: string;
  issuedBy: string;
  remarks: string;
  status: "Issued" | "Returned";
}

export function isLibraryIssuanceOverdue(
  record: LibraryIssuanceRecord,
  referenceDate: string = LIBRARY_TODAY
): boolean {
  return (
    record.status === "Issued" &&
    Boolean(record.dueDate) &&
    record.dueDate < referenceDate
  );
}

export function getEffectiveIssuanceStatus(
  record: LibraryIssuanceRecord
): LibraryIssuanceStatus {
  if (isLibraryIssuanceOverdue(record)) return "Overdue";
  return record.status;
}

export function addDaysToIso(isoDate: string, days: number): string {
  const parts = isoDate.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return isoDate;
  const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + days));
  return dt.toISOString().slice(0, 10);
}

export const INITIAL_LIBRARY_ISSUANCES: LibraryIssuanceRecord[] = [
  {
    id: "lib-iss-1",
    issueCode: "ISS-2026-001",
    bookId: "lb-1",
    bookCode: "BK-001",
    bookTitle: "Introduction to Algorithms",
    bookAuthor: "Thomas H. Cormen",
    bookCategory: "Computer Science",
    shelf: "CS-A1",
    borrowerType: "Student",
    borrowerId: "s5",
    borrowerName: "Ali Malik",
    borrowerIdentifier: "Grade 9-B · Roll 14",
    campus: "Main Campus — Gulberg",
    issueDate: "2026-10-20",
    dueDate: "2026-11-03",
    returnedDate: "",
    issuedBy: "Librarian",
    remarks: "Programming Olympiad prep",
    status: "Issued",
  },
  {
    id: "lib-iss-2",
    issueCode: "ISS-2026-002",
    bookId: "lb-1",
    bookCode: "BK-001",
    bookTitle: "Introduction to Algorithms",
    bookAuthor: "Thomas H. Cormen",
    bookCategory: "Computer Science",
    shelf: "CS-A1",
    borrowerType: "Staff",
    borrowerId: "stf-4",
    borrowerName: "Mr. Usman Ali",
    borrowerIdentifier: "STF-1004 · Technology",
    campus: "DHA Phase 5 Campus",
    issueDate: "2026-10-16",
    dueDate: "2026-11-15",
    returnedDate: "",
    issuedBy: "Librarian",
    remarks: "Faculty reference copy",
    status: "Issued",
  },
  {
    id: "lib-iss-3",
    issueCode: "ISS-2026-003",
    bookId: "lb-2",
    bookCode: "BK-002",
    bookTitle: "A Brief History of Time",
    bookAuthor: "Stephen Hawking",
    bookCategory: "Science",
    shelf: "SCI-B2",
    borrowerType: "Staff",
    borrowerId: "stf-5",
    borrowerName: "Dr. Saima Riaz",
    borrowerIdentifier: "STF-1005 · Sciences",
    campus: "F-8 Islamabad Campus",
    issueDate: "2026-10-18",
    dueDate: "2026-11-17",
    returnedDate: "",
    issuedBy: "Librarian",
    remarks: "Senior Physics seminar",
    status: "Issued",
  },
  {
    id: "lib-iss-4",
    issueCode: "ISS-2026-004",
    bookId: "lb-2",
    bookCode: "BK-002",
    bookTitle: "A Brief History of Time",
    bookAuthor: "Stephen Hawking",
    bookCategory: "Science",
    shelf: "SCI-B2",
    borrowerType: "Student",
    borrowerId: "s6",
    borrowerName: "Maryam Siddiqui",
    borrowerIdentifier: "Grade 10-C · Roll 15",
    campus: "DHA Phase 5 Campus",
    issueDate: "2026-10-08",
    dueDate: "2026-10-22",
    returnedDate: "",
    issuedBy: "Librarian",
    remarks: "Science club assignment",
    status: "Issued",
  },
  {
    id: "lib-iss-5",
    issueCode: "ISS-2026-005",
    bookId: "lb-4",
    bookCode: "BK-004",
    bookTitle: "Pakistan: A Modern History",
    bookAuthor: "Ian Talbot",
    bookCategory: "History",
    shelf: "HIS-D3",
    borrowerType: "Student",
    borrowerId: "s3",
    borrowerName: "Hamza Butt",
    borrowerIdentifier: "Grade 7-C · Roll 12",
    campus: "F-8 Islamabad Campus",
    issueDate: "2026-10-21",
    dueDate: "2026-11-04",
    returnedDate: "",
    issuedBy: "Librarian",
    remarks: "Pakistan Studies research",
    status: "Issued",
  },
  {
    id: "lib-iss-6",
    issueCode: "ISS-2026-006",
    bookId: "lb-4",
    bookCode: "BK-004",
    bookTitle: "Pakistan: A Modern History",
    bookAuthor: "Ian Talbot",
    bookCategory: "History",
    shelf: "HIS-D3",
    borrowerType: "Student",
    borrowerId: "s10",
    borrowerName: "Sara Raza",
    borrowerIdentifier: "Grade 8-B · Roll 19",
    campus: "DHA Phase 5 Campus",
    issueDate: "2026-10-10",
    dueDate: "2026-10-24",
    returnedDate: "",
    issuedBy: "Librarian",
    remarks: "Essay competition",
    status: "Issued",
  },
  {
    id: "lib-iss-7",
    issueCode: "ISS-2026-007",
    bookId: "lb-5",
    bookCode: "BK-005",
    bookTitle: "Clean Code",
    bookAuthor: "Robert C. Martin",
    bookCategory: "Computer Science",
    shelf: "CS-A2",
    borrowerType: "Student",
    borrowerId: "s6",
    borrowerName: "Maryam Siddiqui",
    borrowerIdentifier: "Grade 10-C · Roll 15",
    campus: "DHA Phase 5 Campus",
    issueDate: "2026-10-22",
    dueDate: "2026-11-05",
    returnedDate: "",
    issuedBy: "Librarian",
    remarks: "CS project",
    status: "Issued",
  },
  {
    id: "lib-iss-8",
    issueCode: "ISS-2026-008",
    bookId: "lb-5",
    bookCode: "BK-005",
    bookTitle: "Clean Code",
    bookAuthor: "Robert C. Martin",
    bookCategory: "Computer Science",
    shelf: "CS-A2",
    borrowerType: "Staff",
    borrowerId: "stf-4",
    borrowerName: "Mr. Usman Ali",
    borrowerIdentifier: "STF-1004 · Technology",
    campus: "DHA Phase 5 Campus",
    issueDate: "2026-10-15",
    dueDate: "2026-11-14",
    returnedDate: "",
    issuedBy: "Librarian",
    remarks: "Course lab preparation",
    status: "Issued",
  },
  {
    id: "lib-iss-9",
    issueCode: "ISS-2026-009",
    bookId: "lb-5",
    bookCode: "BK-005",
    bookTitle: "Clean Code",
    bookAuthor: "Robert C. Martin",
    bookCategory: "Computer Science",
    shelf: "CS-A2",
    borrowerType: "Student",
    borrowerId: "s5",
    borrowerName: "Ali Malik",
    borrowerIdentifier: "Grade 9-B · Roll 14",
    campus: "Main Campus — Gulberg",
    issueDate: "2026-10-23",
    dueDate: "2026-11-06",
    returnedDate: "",
    issuedBy: "Librarian",
    remarks: "Coding club reading",
    status: "Issued",
  },
  {
    id: "lib-iss-10",
    issueCode: "ISS-2026-010",
    bookId: "lb-5",
    bookCode: "BK-005",
    bookTitle: "Clean Code",
    bookAuthor: "Robert C. Martin",
    bookCategory: "Computer Science",
    shelf: "CS-A2",
    borrowerType: "Student",
    borrowerId: "s4",
    borrowerName: "Fatima Hussain",
    borrowerIdentifier: "Grade 8-A · Roll 13",
    campus: "Clifton Karachi Campus",
    issueDate: "2026-10-09",
    dueDate: "2026-10-23",
    returnedDate: "",
    issuedBy: "Librarian",
    remarks: "Web dev elective",
    status: "Issued",
  },
  {
    id: "lib-iss-11",
    issueCode: "ISS-2026-011",
    bookId: "lb-6",
    bookCode: "BK-006",
    bookTitle: "Mathematics for Class 9",
    bookAuthor: "Punjab Textbook Board",
    bookCategory: "Mathematics",
    shelf: "MAT-E1",
    borrowerType: "Student",
    borrowerId: "s5",
    borrowerName: "Ali Malik",
    borrowerIdentifier: "Grade 9-B · Roll 14",
    campus: "Main Campus — Gulberg",
    issueDate: "2026-10-24",
    dueDate: "2026-11-07",
    returnedDate: "",
    issuedBy: "Librarian",
    remarks: "Temporary textbook loan",
    status: "Issued",
  },
  {
    id: "lib-iss-12",
    issueCode: "ISS-2026-012",
    bookId: "lb-6",
    bookCode: "BK-006",
    bookTitle: "Mathematics for Class 9",
    bookAuthor: "Punjab Textbook Board",
    bookCategory: "Mathematics",
    shelf: "MAT-E1",
    borrowerType: "Staff",
    borrowerId: "stf-2",
    borrowerName: "Mr. Adeel Hassan",
    borrowerIdentifier: "STF-1002 · Sciences",
    campus: "Main Campus — Gulberg",
    issueDate: "2026-10-14",
    dueDate: "2026-11-13",
    returnedDate: "",
    issuedBy: "Librarian",
    remarks: "Lesson worksheet preparation",
    status: "Issued",
  },
  {
    id: "lib-iss-13",
    issueCode: "ISS-2026-013",
    bookId: "lb-6",
    bookCode: "BK-006",
    bookTitle: "Mathematics for Class 9",
    bookAuthor: "Punjab Textbook Board",
    bookCategory: "Mathematics",
    shelf: "MAT-E1",
    borrowerType: "Student",
    borrowerId: "s9",
    borrowerName: "Bilal Sheikh",
    borrowerIdentifier: "Grade 7-A · Roll 18",
    campus: "Main Campus — Gulberg",
    issueDate: "2026-10-25",
    dueDate: "2026-11-08",
    returnedDate: "",
    issuedBy: "Librarian",
    remarks: "Math foundation practice",
    status: "Issued",
  },
  {
    id: "lib-iss-14",
    issueCode: "ISS-2026-014",
    bookId: "lb-7",
    bookCode: "BK-007",
    bookTitle: "Charlotte's Web",
    bookAuthor: "E. B. White",
    bookCategory: "Children",
    shelf: "CHD-F1",
    borrowerType: "Student",
    borrowerId: "s1",
    borrowerName: "Zain Ahmed",
    borrowerIdentifier: "Grade 5-A · Roll 10",
    campus: "Main Campus — Gulberg",
    issueDate: "2026-10-26",
    dueDate: "2026-11-09",
    returnedDate: "",
    issuedBy: "Librarian",
    remarks: "Junior book report",
    status: "Issued",
  },
  {
    id: "lib-iss-15",
    issueCode: "ISS-2026-015",
    bookId: "lb-9",
    bookCode: "BK-009",
    bookTitle: "To Kill a Mockingbird",
    bookAuthor: "Harper Lee",
    bookCategory: "Fiction",
    shelf: "FIC-H2",
    borrowerType: "Staff",
    borrowerId: "stf-3",
    borrowerName: "Mrs. Maryam Shah",
    borrowerIdentifier: "STF-1003 · Languages",
    campus: "Main Campus — Gulberg",
    issueDate: "2026-10-19",
    dueDate: "2026-11-18",
    returnedDate: "",
    issuedBy: "Librarian",
    remarks: "Literature module curriculum",
    status: "Issued",
  },
  {
    id: "lib-iss-16",
    issueCode: "ISS-2026-016",
    bookId: "lb-3",
    bookCode: "BK-003",
    bookTitle: "The Sealed Nectar",
    bookAuthor: "Safi-ur-Rahman al-Mubarakpuri",
    bookCategory: "Islamic Studies",
    shelf: "ISL-C1",
    borrowerType: "Student",
    borrowerId: "s2",
    borrowerName: "Ayesha Qureshi",
    borrowerIdentifier: "Grade 6-B · Roll 11",
    campus: "DHA Phase 5 Campus",
    issueDate: "2026-10-05",
    dueDate: "2026-10-19",
    returnedDate: "2026-10-18",
    issuedBy: "Librarian",
    remarks: "Returned in good condition",
    status: "Returned",
  },
  {
    id: "lib-iss-17",
    issueCode: "ISS-2026-017",
    bookId: "lb-10",
    bookCode: "BK-010",
    bookTitle: "Sapiens",
    bookAuthor: "Yuval Noah Harari",
    bookCategory: "Non-Fiction",
    shelf: "NF-I1",
    borrowerType: "Student",
    borrowerId: "s8",
    borrowerName: "Hira Khan",
    borrowerIdentifier: "Grade 6-C · Roll 17",
    campus: "Clifton Karachi Campus",
    issueDate: "2026-10-02",
    dueDate: "2026-10-16",
    returnedDate: "2026-10-15",
    issuedBy: "Librarian",
    remarks: "Returned on time",
    status: "Returned",
  },
  {
    id: "lib-iss-18",
    issueCode: "ISS-2026-018",
    bookId: "lb-2",
    bookCode: "BK-002",
    bookTitle: "A Brief History of Time",
    bookAuthor: "Stephen Hawking",
    bookCategory: "Science",
    shelf: "SCI-B2",
    borrowerType: "Student",
    borrowerId: "s7",
    borrowerName: "Usman Javed",
    borrowerIdentifier: "Grade 5-B · Roll 16",
    campus: "F-8 Islamabad Campus",
    issueDate: "2026-10-01",
    dueDate: "2026-10-15",
    returnedDate: "2026-10-14",
    issuedBy: "Librarian",
    remarks: "Returned intact",
    status: "Returned",
  },
];
