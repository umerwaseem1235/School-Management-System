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
    availableCopies: 18,
    shelf: "MAT-E1",
    publishedYear: 2023,
    status: computeBookStatus(18, 25),
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
