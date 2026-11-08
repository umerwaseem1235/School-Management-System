import type { FeeChallan } from "@/types";

export interface FeeCollectionRecord {
  id: string;
  date: string; // ISO "YYYY-MM-DD"
  year: number;
  month: number; // 1-12
  challanNumber: string;
  studentName: string;
  rollNo: string;
  className: string;
  campus: string;
  amount: number;
  paymentMethod: string;
  receiptNumber: string;
  time?: string;
  academicSession: string;
}

export interface DailyCollectionSummary {
  date: string;
  formattedDate: string;
  totalAmount: number;
  receiptCount: number;
  collections: FeeCollectionRecord[];
  methods: Record<string, number>;
}

export interface MonthCollectionSummary {
  year: number;
  month: number;
  monthName: string;
  totalAmount: number;
  totalReceipts: number;
  activeCollectionDays: number;
  dailyCollections: Record<string, DailyCollectionSummary>;
}

export interface YearCollectionSummary {
  year: number;
  academicSession: string;
  totalAmount: number;
  totalReceipts: number;
  activeMonths: number;
  monthlyTotals: Record<number, number>;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Institutional Historical Fee Collections Ledger (2022 – 2026)
 * ───────────────────────────────────────────────────────────────────────────── */

export const HISTORICAL_COLLECTIONS: FeeCollectionRecord[] = [
  /* ═══════════════════════════════════════════════════════════════════════════
   * ACADEMIC YEAR 2026–27 (Current Cycle)
   * ═══════════════════════════════════════════════════════════════════════════ */
  // October 2026
  {
    id: "col-2610-01",
    date: "2026-10-02",
    year: 2026,
    month: 10,
    challanNumber: "CH-2610-004810",
    studentName: "Ali Raza",
    rollNo: "Roll #07",
    className: "Grade 5-A",
    campus: "Gulberg",
    amount: 18500,
    paymentMethod: "JazzCash",
    receiptNumber: "RCP-004810",
    time: "10:15 AM",
    academicSession: "2026–27",
  },
  {
    id: "col-2610-02",
    date: "2026-10-03",
    year: 2026,
    month: 10,
    challanNumber: "CH-2610-004811",
    studentName: "Mahnoor Tariq",
    rollNo: "Roll #09",
    className: "Grade 8-B",
    campus: "DHA Phase 5",
    amount: 22400,
    paymentMethod: "Online Banking",
    receiptNumber: "RCP-004811",
    time: "11:40 AM",
    academicSession: "2026–27",
  },
  {
    id: "col-2610-03",
    date: "2026-10-05",
    year: 2026,
    month: 10,
    challanNumber: "CH-2610-004818",
    studentName: "Taha Hussain",
    rollNo: "Roll #25",
    className: "Grade 12-A",
    campus: "F-8 Islamabad",
    amount: 39300,
    paymentMethod: "Direct Debit",
    receiptNumber: "RCP-004818",
    time: "09:30 AM",
    academicSession: "2026–27",
  },
  {
    id: "col-2610-04",
    date: "2026-10-07",
    year: 2026,
    month: 10,
    challanNumber: "CH-2610-004815",
    studentName: "Bilal Sheikh",
    rollNo: "Roll #18",
    className: "Grade 8-A",
    campus: "Gulberg",
    amount: 21100,
    paymentMethod: "Online Banking",
    receiptNumber: "RCP-004815",
    time: "12:10 PM",
    academicSession: "2026–27",
  },
  {
    id: "col-2610-05",
    date: "2026-10-08",
    year: 2026,
    month: 10,
    challanNumber: "CH-2610-004812",
    studentName: "Zain Ahmed",
    rollNo: "Roll #10",
    className: "Grade 9-A",
    campus: "Gulberg",
    amount: 25200,
    paymentMethod: "Bank Transfer",
    receiptNumber: "RCP-004812",
    time: "02:20 PM",
    academicSession: "2026–27",
  },
  {
    id: "col-2610-06",
    date: "2026-10-09",
    year: 2026,
    month: 10,
    challanNumber: "CH-2610-004814",
    studentName: "Hamza Malik",
    rollNo: "Roll #12",
    className: "Grade 10-A",
    campus: "F-8 Islamabad",
    amount: 12600,
    paymentMethod: "Cash Counter",
    receiptNumber: "RCP-004814",
    time: "10:05 AM",
    academicSession: "2026–27",
  },
  {
    id: "col-2610-07",
    date: "2026-10-10",
    year: 2026,
    month: 10,
    challanNumber: "CH-2610-004816",
    studentName: "Iqra Butt",
    rollNo: "Roll #21",
    className: "Grade 6-B",
    campus: "DHA Phase 5",
    amount: 21100,
    paymentMethod: "Cash Counter",
    receiptNumber: "RCP-004816",
    time: "01:15 PM",
    academicSession: "2026–27",
  },
  {
    id: "col-2610-08",
    date: "2026-10-12",
    year: 2026,
    month: 10,
    challanNumber: "CH-2610-004819",
    studentName: "Laiba Siddiqui",
    rollNo: "Roll #28",
    className: "Grade 3-B",
    campus: "Clifton",
    amount: 8600,
    paymentMethod: "Cash Counter",
    receiptNumber: "RCP-004819",
    time: "11:00 AM",
    academicSession: "2026–27",
  },
  {
    id: "col-2610-09",
    date: "2026-10-15",
    year: 2026,
    month: 10,
    challanNumber: "CH-2610-004822",
    studentName: "Fatima Zahra",
    rollNo: "Roll #31",
    className: "Grade 7-A",
    campus: "Clifton",
    amount: 20800,
    paymentMethod: "1Link 1Bill",
    receiptNumber: "RCP-004822",
    time: "03:45 PM",
    academicSession: "2026–27",
  },
  {
    id: "col-2610-10",
    date: "2026-10-18",
    year: 2026,
    month: 10,
    challanNumber: "CH-2610-004825",
    studentName: "Usman Farooq",
    rollNo: "Roll #34",
    className: "Grade 10-B",
    campus: "Gulberg",
    amount: 27500,
    paymentMethod: "Cheque #4491",
    receiptNumber: "RCP-004825",
    time: "11:30 AM",
    academicSession: "2026–27",
  },
  {
    id: "col-2610-11",
    date: "2026-10-22",
    year: 2026,
    month: 10,
    challanNumber: "CH-2610-004830",
    studentName: "Ahmed Raza",
    rollNo: "Roll #39",
    className: "Grade 11-B",
    campus: "DHA Phase 5",
    amount: 32000,
    paymentMethod: "Bank Deposit",
    receiptNumber: "RCP-004830",
    time: "02:10 PM",
    academicSession: "2026–27",
  },

  // September 2026
  {
    id: "col-2609-01",
    date: "2026-09-05",
    year: 2026,
    month: 9,
    challanNumber: "CH-2609-003940",
    studentName: "Haris Khan",
    rollNo: "Roll #14",
    className: "Grade 9-B",
    campus: "Gulberg",
    amount: 25200,
    paymentMethod: "Bank Transfer",
    receiptNumber: "RCP-003940",
    time: "10:00 AM",
    academicSession: "2026–27",
  },
  {
    id: "col-2609-02",
    date: "2026-09-08",
    year: 2026,
    month: 9,
    challanNumber: "CH-2609-003945",
    studentName: "Anum Sheikh",
    rollNo: "Roll #17",
    className: "Grade 10-A",
    campus: "DHA Phase 5",
    amount: 31000,
    paymentMethod: "Online Banking",
    receiptNumber: "RCP-003945",
    time: "11:30 AM",
    academicSession: "2026–27",
  },
  {
    id: "col-2609-03",
    date: "2026-09-10",
    year: 2026,
    month: 9,
    challanNumber: "CH-2609-003950",
    studentName: "Bilal Ashraf",
    rollNo: "Roll #20",
    className: "Grade 6-A",
    campus: "F-8 Islamabad",
    amount: 19800,
    paymentMethod: "Cash Counter",
    receiptNumber: "RCP-003950",
    time: "01:45 PM",
    academicSession: "2026–27",
  },
  {
    id: "col-2609-04",
    date: "2026-09-18",
    year: 2026,
    month: 9,
    challanNumber: "CH-2609-003955",
    studentName: "Omer Raza",
    rollNo: "Roll #24",
    className: "Grade 11-A",
    campus: "DHA Phase 5",
    amount: 20000,
    paymentMethod: "Cheque #8812",
    receiptNumber: "RCP-003955",
    time: "02:15 PM",
    academicSession: "2026–27",
  },
  {
    id: "col-2609-05",
    date: "2026-09-24",
    year: 2026,
    month: 9,
    challanNumber: "CH-2609-003968",
    studentName: "Sami Ullah",
    rollNo: "Roll #30",
    className: "Grade 8-B",
    campus: "Clifton",
    amount: 21100,
    paymentMethod: "EasyPaisa",
    receiptNumber: "RCP-003968",
    time: "04:30 PM",
    academicSession: "2026–27",
  },

  // August 2026
  {
    id: "col-2608-01",
    date: "2026-08-06",
    year: 2026,
    month: 8,
    challanNumber: "CH-2608-002910",
    studentName: "Zohra Begum",
    rollNo: "Roll #03",
    className: "Grade 4-B",
    campus: "Gulberg",
    amount: 16500,
    paymentMethod: "Cash Counter",
    receiptNumber: "RCP-002910",
    time: "09:40 AM",
    academicSession: "2026–27",
  },
  {
    id: "col-2608-02",
    date: "2026-08-10",
    year: 2026,
    month: 8,
    challanNumber: "CH-2608-002930",
    studentName: "Danish Qureshi",
    rollNo: "Roll #15",
    className: "Grade 7-A",
    campus: "DHA Phase 5",
    amount: 22000,
    paymentMethod: "Bank Transfer",
    receiptNumber: "RCP-002930",
    time: "11:15 AM",
    academicSession: "2026–27",
  },
  {
    id: "col-2608-03",
    date: "2026-08-18",
    year: 2026,
    month: 8,
    challanNumber: "CH-2608-002955",
    studentName: "Khadija Bibi",
    rollNo: "Roll #22",
    className: "Grade 10-A",
    campus: "F-8 Islamabad",
    amount: 28900,
    paymentMethod: "1Link 1Bill",
    receiptNumber: "RCP-002955",
    time: "03:10 PM",
    academicSession: "2026–27",
  },

  /* ═══════════════════════════════════════════════════════════════════════════
   * PREVIOUS YEAR: 2025 (Academic Year 2025–26)
   * ═══════════════════════════════════════════════════════════════════════════ */
  // October 2025
  {
    id: "col-2510-01",
    date: "2025-10-06",
    year: 2025,
    month: 10,
    challanNumber: "CH-2510-001812",
    studentName: "Asad Mehmood",
    rollNo: "Roll #08",
    className: "Grade 8-A",
    campus: "Gulberg",
    amount: 23500,
    paymentMethod: "Bank Transfer",
    receiptNumber: "RCP-2510-001",
    time: "10:30 AM",
    academicSession: "2025–26",
  },
  {
    id: "col-2510-02",
    date: "2025-10-08",
    year: 2025,
    month: 10,
    challanNumber: "CH-2510-001824",
    studentName: "Sana Riaz",
    rollNo: "Roll #14",
    className: "Grade 6-A",
    campus: "DHA Phase 5",
    amount: 19800,
    paymentMethod: "Online Banking",
    receiptNumber: "RCP-2510-002",
    time: "11:50 AM",
    academicSession: "2025–26",
  },
  {
    id: "col-2510-03",
    date: "2025-10-10",
    year: 2025,
    month: 10,
    challanNumber: "CH-2510-001835",
    studentName: "Shahzaib Tariq",
    rollNo: "Roll #19",
    className: "Grade 9-A",
    campus: "F-8 Islamabad",
    amount: 28400,
    paymentMethod: "Cash Counter",
    receiptNumber: "RCP-2510-003",
    time: "01:20 PM",
    academicSession: "2025–26",
  },
  {
    id: "col-2510-04",
    date: "2025-10-12",
    year: 2025,
    month: 10,
    challanNumber: "CH-2510-001848",
    studentName: "Mariam Noor",
    rollNo: "Roll #26",
    className: "Grade 10-B",
    campus: "Clifton",
    amount: 32100,
    paymentMethod: "1Link 1Bill",
    receiptNumber: "RCP-2510-004",
    time: "02:40 PM",
    academicSession: "2025–26",
  },
  {
    id: "col-2510-05",
    date: "2025-10-18",
    year: 2025,
    month: 10,
    challanNumber: "CH-2510-001862",
    studentName: "Farhan Ali",
    rollNo: "Roll #32",
    className: "Grade 11-A",
    campus: "Gulberg",
    amount: 35000,
    paymentMethod: "Bank Deposit",
    receiptNumber: "RCP-2510-005",
    time: "10:15 AM",
    academicSession: "2025–26",
  },

  // September 2025
  {
    id: "col-2509-01",
    date: "2025-09-05",
    year: 2025,
    month: 9,
    challanNumber: "CH-2509-001210",
    studentName: "Hamna Bilal",
    rollNo: "Roll #11",
    className: "Grade 7-B",
    campus: "DHA Phase 5",
    amount: 20500,
    paymentMethod: "JazzCash",
    receiptNumber: "RCP-2509-001",
    time: "11:00 AM",
    academicSession: "2025–26",
  },
  {
    id: "col-2509-02",
    date: "2025-09-10",
    year: 2025,
    month: 9,
    challanNumber: "CH-2509-001230",
    studentName: "Zubair Ahmed",
    rollNo: "Roll #16",
    className: "Grade 8-C",
    campus: "F-8 Islamabad",
    amount: 21000,
    paymentMethod: "Cash Counter",
    receiptNumber: "RCP-2509-002",
    time: "12:30 PM",
    academicSession: "2025–26",
  },
  {
    id: "col-2509-03",
    date: "2025-09-15",
    year: 2025,
    month: 9,
    challanNumber: "CH-2509-001255",
    studentName: "Rabia Basri",
    rollNo: "Roll #21",
    className: "Grade 5-A",
    campus: "Clifton",
    amount: 16800,
    paymentMethod: "Bank Deposit",
    receiptNumber: "RCP-2509-003",
    time: "03:15 PM",
    academicSession: "2025–26",
  },

  // May 2025
  {
    id: "col-2505-01",
    date: "2025-05-08",
    year: 2025,
    month: 5,
    challanNumber: "CH-2505-000810",
    studentName: "Kamran Siddique",
    rollNo: "Roll #05",
    className: "Grade 9-A",
    campus: "Gulberg",
    amount: 24000,
    paymentMethod: "Online Banking",
    receiptNumber: "RCP-2505-001",
    time: "10:45 AM",
    academicSession: "2024–25",
  },
  {
    id: "col-2505-02",
    date: "2025-05-12",
    year: 2025,
    month: 5,
    challanNumber: "CH-2505-000830",
    studentName: "Nimra Sheikh",
    rollNo: "Roll #18",
    className: "Grade 10-A",
    campus: "DHA Phase 5",
    amount: 27500,
    paymentMethod: "Bank Transfer",
    receiptNumber: "RCP-2505-002",
    time: "01:10 PM",
    academicSession: "2024–25",
  },

  /* ═══════════════════════════════════════════════════════════════════════════
   * PREVIOUS YEAR: 2024 (Academic Year 2024–25)
   * ═══════════════════════════════════════════════════════════════════════════ */
  // October 2024
  {
    id: "col-2410-01",
    date: "2024-10-08",
    year: 2024,
    month: 10,
    challanNumber: "CH-2410-000912",
    studentName: "Kashif Munir",
    rollNo: "Roll #09",
    className: "Grade 7-A",
    campus: "Gulberg",
    amount: 21000,
    paymentMethod: "Bank Transfer",
    receiptNumber: "RCP-2410-001",
    time: "11:20 AM",
    academicSession: "2024–25",
  },
  {
    id: "col-2410-02",
    date: "2024-10-10",
    year: 2024,
    month: 10,
    challanNumber: "CH-2410-000925",
    studentName: "Areeba Nadeem",
    rollNo: "Roll #15",
    className: "Grade 9-B",
    campus: "DHA Phase 5",
    amount: 26500,
    paymentMethod: "Online Banking",
    receiptNumber: "RCP-2410-002",
    time: "01:30 PM",
    academicSession: "2024–25",
  },
  {
    id: "col-2410-03",
    date: "2024-10-15",
    year: 2024,
    month: 10,
    challanNumber: "CH-2410-000940",
    studentName: "Daniyal Qasim",
    rollNo: "Roll #23",
    className: "Grade 10-A",
    campus: "F-8 Islamabad",
    amount: 30000,
    paymentMethod: "Cash Counter",
    receiptNumber: "RCP-2410-003",
    time: "10:15 AM",
    academicSession: "2024–25",
  },
  // September 2024
  {
    id: "col-2409-01",
    date: "2024-09-09",
    year: 2024,
    month: 9,
    challanNumber: "CH-2409-000780",
    studentName: "Sobia Akram",
    rollNo: "Roll #12",
    className: "Grade 6-B",
    campus: "Clifton",
    amount: 18200,
    paymentMethod: "1Link",
    receiptNumber: "RCP-2409-001",
    time: "02:00 PM",
    academicSession: "2024–25",
  },
  {
    id: "col-2409-02",
    date: "2024-09-12",
    year: 2024,
    month: 9,
    challanNumber: "CH-2409-000795",
    studentName: "Waqas Younas",
    rollNo: "Roll #19",
    className: "Grade 8-A",
    campus: "Gulberg",
    amount: 22800,
    paymentMethod: "Cash Counter",
    receiptNumber: "RCP-2409-002",
    time: "11:45 AM",
    academicSession: "2024–25",
  },

  /* ═══════════════════════════════════════════════════════════════════════════
   * PREVIOUS YEAR: 2023 (Academic Year 2023–24)
   * ═══════════════════════════════════════════════════════════════════════════ */
  // October 2023
  {
    id: "col-2310-01",
    date: "2023-10-09",
    year: 2023,
    month: 10,
    challanNumber: "CH-2310-000512",
    studentName: "Mohsin Raza",
    rollNo: "Roll #06",
    className: "Grade 6-A",
    campus: "Gulberg",
    amount: 19500,
    paymentMethod: "Bank Transfer",
    receiptNumber: "RCP-2310-001",
    time: "10:10 AM",
    academicSession: "2023–24",
  },
  {
    id: "col-2310-02",
    date: "2023-10-11",
    year: 2023,
    month: 10,
    challanNumber: "CH-2310-000525",
    studentName: "Aiman Noor",
    rollNo: "Roll #13",
    className: "Grade 8-B",
    campus: "DHA Phase 5",
    amount: 24000,
    paymentMethod: "Cash Counter",
    receiptNumber: "RCP-2310-002",
    time: "01:25 PM",
    academicSession: "2023–24",
  },
  {
    id: "col-2310-03",
    date: "2023-10-14",
    year: 2023,
    month: 10,
    challanNumber: "CH-2310-000540",
    studentName: "Bilal Javed",
    rollNo: "Roll #20",
    className: "Grade 9-A",
    campus: "F-8 Islamabad",
    amount: 26000,
    paymentMethod: "Online Banking",
    receiptNumber: "RCP-2310-003",
    time: "11:50 AM",
    academicSession: "2023–24",
  },

  /* ═══════════════════════════════════════════════════════════════════════════
   * PREVIOUS YEAR: 2022 (Academic Year 2022–23)
   * ═══════════════════════════════════════════════════════════════════════════ */
  // October 2022
  {
    id: "col-2210-01",
    date: "2022-10-10",
    year: 2022,
    month: 10,
    challanNumber: "CH-2210-000312",
    studentName: "Noman Bashir",
    rollNo: "Roll #04",
    className: "Grade 5-A",
    campus: "Gulberg",
    amount: 17500,
    paymentMethod: "Cash Counter",
    receiptNumber: "RCP-2210-001",
    time: "11:00 AM",
    academicSession: "2022–23",
  },
  {
    id: "col-2210-02",
    date: "2022-10-12",
    year: 2022,
    month: 10,
    challanNumber: "CH-2210-000325",
    studentName: "Sidra Batool",
    rollNo: "Roll #10",
    className: "Grade 7-A",
    campus: "DHA Phase 5",
    amount: 21500,
    paymentMethod: "Bank Transfer",
    receiptNumber: "RCP-2210-002",
    time: "02:15 PM",
    academicSession: "2022–23",
  },
];

export const AVAILABLE_YEARS = [2026, 2025, 2024, 2023, 2022];

export const MONTH_NAMES = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];

export const MONTH_SHORT_NAMES = [
  "Jan", "Feb", "Mar", "Apr",
  "May", "Jun", "Jul", "Aug",
  "Sep", "Oct", "Nov", "Dec"
];

/**
 * Merge live payments recorded in active challans with the historical collections repository.
 */
export function getAllCollectionRecords(liveChallans: FeeChallan[] = []): FeeCollectionRecord[] {
  const records = [...HISTORICAL_COLLECTIONS];
  const existingIds = new Set(records.map((r) => r.id));

  // Extract real-time payments from live challans
  liveChallans.forEach((challan) => {
    // Process payments array if available
    if (challan.payments && challan.payments.length > 0) {
      challan.payments.forEach((p, idx) => {
        if (!p.paymentDate || !p.amount) return;
        const colId = `col-live-${p.id || challan.id + "-" + idx}`;
        if (!existingIds.has(colId)) {
          const pDate = new Date(p.paymentDate);
          const y = Number.isNaN(pDate.getFullYear()) ? 2026 : pDate.getFullYear();
          const m = Number.isNaN(pDate.getMonth()) ? 10 : pDate.getMonth() + 1;
          records.push({
            id: colId,
            date: p.paymentDate,
            year: y,
            month: m,
            challanNumber: challan.challanNumber,
            studentName: challan.student,
            rollNo: challan.rollNo || "Roll #—",
            className: challan.className,
            campus: challan.campus,
            amount: p.amount,
            paymentMethod: p.paymentMethod || challan.lastPaymentMethod || "Bank Transfer",
            receiptNumber: p.receiptNumber || challan.lastReceiptNumber || `RCP-${challan.challanNumber.slice(-6)}`,
            time: "11:00 AM",
            academicSession: `${y}–${String(y + 1).slice(2)}`,
          });
          existingIds.add(colId);
        }
      });
    } else if (challan.paid > 0 && (challan.collectDate || challan.lastPaymentDate)) {
      const rawDate = challan.collectDate || challan.lastPaymentDate || challan.dueDate;
      const colId = `col-live-single-${challan.id}`;
      if (!existingIds.has(colId)) {
        const pDate = new Date(rawDate);
        const y = Number.isNaN(pDate.getFullYear()) ? 2026 : pDate.getFullYear();
        const m = Number.isNaN(pDate.getMonth()) ? 10 : pDate.getMonth() + 1;
        records.push({
          id: colId,
          date: rawDate,
          year: y,
          month: m,
          challanNumber: challan.challanNumber,
          studentName: challan.student,
          rollNo: challan.rollNo || "Roll #—",
          className: challan.className,
          campus: challan.campus,
          amount: challan.paid,
          paymentMethod: challan.lastPaymentMethod || "Bank Transfer",
          receiptNumber: challan.lastReceiptNumber || `RCP-${challan.challanNumber.slice(-6)}`,
          time: "10:30 AM",
          academicSession: `${y}–${String(y + 1).slice(2)}`,
        });
        existingIds.add(colId);
      }
    }
  });

  return records;
}

/**
 * Get daily collection summary for a specific date (YYYY-MM-DD).
 */
export function getDailyCollectionSummary(
  targetDate: string,
  records: FeeCollectionRecord[]
): DailyCollectionSummary | null {
  const matches = records.filter((r) => r.date === targetDate);
  if (matches.length === 0) return null;

  const totalAmount = matches.reduce((sum, r) => sum + r.amount, 0);
  const methods: Record<string, number> = {};
  matches.forEach((r) => {
    methods[r.paymentMethod] = (methods[r.paymentMethod] || 0) + r.amount;
  });

  const parsed = new Date(targetDate);
  const formattedDate = parsed.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return {
    date: targetDate,
    formattedDate,
    totalAmount,
    receiptCount: matches.length,
    collections: matches,
    methods,
  };
}

/**
 * Get collection matrix for a specific month and year.
 */
export function getMonthCollectionSummary(
  year: number,
  month: number, // 1-12
  records: FeeCollectionRecord[]
): MonthCollectionSummary {
  const monthRecords = records.filter((r) => r.year === year && r.month === month);
  const dailyCollections: Record<string, DailyCollectionSummary> = {};

  monthRecords.forEach((r) => {
    if (!dailyCollections[r.date]) {
      const summary = getDailyCollectionSummary(r.date, monthRecords);
      if (summary) dailyCollections[r.date] = summary;
    }
  });

  const totalAmount = monthRecords.reduce((s, r) => s + r.amount, 0);
  const monthName = MONTH_NAMES[month - 1] || `Month ${month}`;

  return {
    year,
    month,
    monthName,
    totalAmount,
    totalReceipts: monthRecords.length,
    activeCollectionDays: Object.keys(dailyCollections).length,
    dailyCollections,
  };
}

/**
 * Get yearly collection summary for any year (2026, 2025, 2024, etc.).
 */
export function getYearCollectionSummary(
  year: number,
  records: FeeCollectionRecord[]
): YearCollectionSummary {
  const yearRecords = records.filter((r) => r.year === year);
  const totalAmount = yearRecords.reduce((s, r) => s + r.amount, 0);
  const monthlyTotals: Record<number, number> = {};

  yearRecords.forEach((r) => {
    monthlyTotals[r.month] = (monthlyTotals[r.month] || 0) + r.amount;
  });

  return {
    year,
    academicSession: `${year}–${String(year + 1).slice(2)}`,
    totalAmount,
    totalReceipts: yearRecords.length,
    activeMonths: Object.keys(monthlyTotals).length,
    monthlyTotals,
  };
}

/**
 * Converts historical FeeCollectionRecords into FeeChallan instances so they render seamlessly
 * in the main Fee Challans & Collection Register DataTable when a historical date, month, or year is selected!
 */
export function getMergedChallans(liveChallans: FeeChallan[]): FeeChallan[] {
  const seenIds = new Set<string>();
  const seenNumbers = new Set<string>();
  const merged: FeeChallan[] = [];

  for (const c of liveChallans) {
    const idKey = c.id ? String(c.id).trim() : "";
    const numKey = c.challanNumber ? String(c.challanNumber).trim() : "";
    if (idKey && seenIds.has(idKey)) continue;
    if (numKey && seenNumbers.has(numKey)) continue;
    if (idKey) seenIds.add(idKey);
    if (numKey) seenNumbers.add(numKey);
    merged.push(c);
  }

  HISTORICAL_COLLECTIONS.forEach((hist) => {
    const histId = hist.id;
    const histNum = hist.challanNumber;
    if (!seenNumbers.has(histNum) && !seenIds.has(histId)) {
      seenIds.add(histId);
      seenNumbers.add(histNum);
      merged.push({
        id: hist.id,
        challanNumber: hist.challanNumber,
        student: hist.studentName,
        rollNo: hist.rollNo,
        className: hist.className,
        campus: hist.campus,
        monthYear: `${MONTH_SHORT_NAMES[hist.month - 1]} ${hist.year}`,
        dueDate: hist.date,
        collectDate: hist.date,
        lastPaymentDate: hist.date,
        lastPaymentMethod: hist.paymentMethod,
        lastReceiptNumber: hist.receiptNumber,
        lastPaymentAmount: hist.amount,
        totalPayable: hist.amount,
        paid: hist.amount,
        status: "Paid",
        payments: [
          {
            id: `pay-${hist.id}`,
            receiptNumber: hist.receiptNumber,
            paymentDate: hist.date,
            paymentMethod: hist.paymentMethod,
            amount: hist.amount,
          },
        ],
      });
    }
  });

  return merged;
}
