export type ExpenseCategory =
  | "Utilities & Power"
  | "Campus Maintenance"
  | "Lab & Academic Supplies"
  | "IT & Digital Infrastructure"
  | "Transport & Fleet Fuel"
  | "Events & Sports"
  | "Security & Janitorial"
  | "Stationery & Printing";

export type ExpensePaymentMode =
  | "Bank Transfer"
  | "Crossed Cheque"
  | "Petty Cash"
  | "Corporate Card";

export type ExpenseStatus = "Paid" | "Approved" | "Pending" | "Rejected";

export interface ExpenseAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  status: "Submitted" | "Verified" | "Approved" | "Paid" | "Rejected";
}

export interface ExpenseVoucherRecord {
  id: string;
  voucherNo: string;
  invoiceNo: string;
  date: string;
  title: string;
  description: string;
  category: ExpenseCategory;
  department: string;
  campus: string;
  // Vendor & Payee Details
  vendorName: string;
  vendorNtn: string;
  vendorPhone: string;
  vendorBank: string;
  vendorAccountNo: string;
  // Financial Breakdown
  grossAmount: number;
  taxAmount: number; // GST / Sales tax included
  whtDeduction: number; // Withholding tax deducted at source
  netPayable: number;
  paymentMode: ExpensePaymentMode;
  paymentRef: string;
  paidDate: string;
  // Governance
  requestedBy: string;
  approvedBy: string;
  status: ExpenseStatus;
  budgetHeadCode: string;
  auditTrail: ExpenseAuditEntry[];
}

export interface ExpenseBudgetRecord {
  id: string;
  budgetCode: string;
  category: ExpenseCategory;
  department: string;
  campus: string;
  custodian: string;
  monthlyAllocation: number;
  monthlySpent: number;
  committedPending: number;
  ytdAllocation: number;
  ytdSpent: number;
  lastUpdated: string;
  status: "Active" | "Warning" | "Critical";
}

function buildAuditTrail(
  id: string,
  date: string,
  requestedBy: string,
  approvedBy: string,
  status: ExpenseStatus,
  paymentRef: string
): ExpenseAuditEntry[] {
  const logs: ExpenseAuditEntry[] = [
    {
      id: `${id}-aud-1`,
      timestamp: `${date} 09:30 AM`,
      actor: requestedBy,
      role: "Department Requisitioner",
      action: "Expense requisition and vendor invoice uploaded",
      status: "Submitted",
    },
    {
      id: `${id}-aud-2`,
      timestamp: `${date} 11:45 AM`,
      actor: "M. Kamran Siddiqui",
      role: "Internal Audit Officer",
      action: "Vendor NTN, tax calculation, and budget head verified",
      status: "Verified",
    },
  ];

  if (status === "Approved" || status === "Paid") {
    logs.push({
      id: `${id}-aud-3`,
      timestamp: `${date} 02:15 PM`,
      actor: approvedBy,
      role: "Finance Controller",
      action: "Voucher approved for disbursement under institutional policy",
      status: "Approved",
    });
  }

  if (status === "Paid") {
    logs.push({
      id: `${id}-aud-4`,
      timestamp: `${date} 04:20 PM`,
      actor: "Treasury Desk",
      role: "Accounts & Disbursal",
      action: `Payment settled via bank reference ${paymentRef}`,
      status: "Paid",
    });
  }

  if (status === "Rejected") {
    logs.push({
      id: `${id}-aud-3`,
      timestamp: `${date} 03:10 PM`,
      actor: approvedBy,
      role: "Finance Controller",
      action: "Voucher returned — supporting comparative quotation required",
      status: "Rejected",
    });
  }

  return logs.reverse();
}

const RAW_EXPENSES: Omit<ExpenseVoucherRecord, "netPayable" | "auditTrail">[] = [
  {
    id: "exp-1",
    voucherNo: "EXP-2610-401",
    invoiceNo: "LESCO-2610-8821",
    date: "2026-10-24",
    title: "Monthly Commercial Electricity & Solar Net-Metering Bill",
    description:
      "October 2026 commercial grid consumption and transformer maintenance charges for Main Academic Block.",
    category: "Utilities & Power",
    department: "Facilities & Estate",
    campus: "Gulberg",
    vendorName: "LESCO Commercial Billing",
    vendorNtn: "NTN-0819201-4",
    vendorPhone: "042-99204811",
    vendorBank: "National Bank of Pakistan",
    vendorAccountNo: "NBP-0042-99182736",
    grossAmount: 485000,
    taxAmount: 38000,
    whtDeduction: 12000,
    paymentMode: "Bank Transfer",
    paymentRef: "FT-2610-991821",
    paidDate: "2026-10-24",
    requestedBy: "Engr. Tariq Mehmood",
    approvedBy: "Hamza Tariq (Super Admin)",
    status: "Paid",
    budgetHeadCode: "BGT-UTL-01",
  },
  {
    id: "exp-2",
    voucherNo: "EXP-2610-402",
    invoiceNo: "PSO-FLT-9012",
    date: "2026-10-23",
    title: "School Bus Fleet Diesel & Lubricant Replenishment",
    description:
      "Bulk diesel supply (2,400 Liters) and engine oil servicing for 14 student transport buses.",
    category: "Transport & Fleet Fuel",
    department: "Transport Operations",
    campus: "DHA Phase 5",
    vendorName: "Pakistan State Oil (PSO Fleet Card)",
    vendorNtn: "NTN-1102938-7",
    vendorPhone: "021-111-111-776",
    vendorBank: "Habib Bank Limited (HBL)",
    vendorAccountNo: "HBL-0184-77281920",
    grossAmount: 640000,
    taxAmount: 24000,
    whtDeduction: 14000,
    paymentMode: "Corporate Card",
    paymentRef: "PSO-2610-7741",
    paidDate: "2026-10-23",
    requestedBy: "Capt. (R) Sajjad Haider",
    approvedBy: "Hamza Tariq (Super Admin)",
    status: "Paid",
    budgetHeadCode: "BGT-TRN-05",
  },
  {
    id: "exp-3",
    voucherNo: "EXP-2610-403",
    invoiceNo: "SCI-LAB-3319",
    date: "2026-10-22",
    title: "Senior Chemistry & Biology Lab Glassware & Reagents",
    description:
      "Analytical grade titration chemicals, digital microscopes, and safety equipment for O/A-Level labs.",
    category: "Lab & Academic Supplies",
    department: "Science Faculty",
    campus: "F-8 Islamabad",
    vendorName: "Sigma Scientific & Lab Instruments",
    vendorNtn: "NTN-4419283-2",
    vendorPhone: "051-2871920",
    vendorBank: "Meezan Bank Ltd.",
    vendorAccountNo: "MEZN-0201-55192831",
    grossAmount: 310000,
    taxAmount: 18500,
    whtDeduction: 13500,
    paymentMode: "Crossed Cheque",
    paymentRef: "CHQ-884120",
    paidDate: "2026-10-22",
    requestedBy: "Dr.Ayesha Siddiqui",
    approvedBy: "Director Academics",
    status: "Paid",
    budgetHeadCode: "BGT-LAB-03",
  },
  {
    id: "exp-4",
    voucherNo: "EXP-2610-404",
    invoiceNo: "NET-FBR-7710",
    date: "2026-10-22",
    title: "Dedicated Enterprise Fiber Optic & Cloud LMS Hosting",
    description:
      "200 Mbps symmetrical fiber optic lease line and AWS cloud server hosting for LMS & parent portal.",
    category: "IT & Digital Infrastructure",
    department: "IT & Systems",
    campus: "Gulberg",
    vendorName: "Nayatel / Transworld Enterprise",
    vendorNtn: "NTN-3301928-9",
    vendorPhone: "051-111-114-444",
    vendorBank: "Bank Alfalah Ltd.",
    vendorAccountNo: "ALFH-5512-33918271",
    grossAmount: 225000,
    taxAmount: 19500,
    whtDeduction: 9500,
    paymentMode: "Bank Transfer",
    paymentRef: "PENDING-DISB",
    paidDate: "—",
    requestedBy: "Usman Ghani (IT Head)",
    approvedBy: "Finance Controller",
    status: "Approved",
    budgetHeadCode: "BGT-ITC-04",
  },
  {
    id: "exp-5",
    voucherNo: "EXP-2610-405",
    invoiceNo: "HVAC-MNT-118",
    date: "2026-10-21",
    title: "Auditorium HVAC Chiller Servicing & Classroom Paint Work",
    description:
      "Pre-winter servicing of 24 inverter AC units and acoustic wall refurbishment in Main Auditorium.",
    category: "Campus Maintenance",
    department: "Civil & Maintenance",
    campus: "Clifton",
    vendorName: "CoolTech Engineering Services",
    vendorNtn: "NTN-5581920-1",
    vendorPhone: "021-35829104",
    vendorBank: "Allied Bank Ltd.",
    vendorAccountNo: "ABL-0184-66291827",
    grossAmount: 380000,
    taxAmount: 22000,
    whtDeduction: 17000,
    paymentMode: "Bank Transfer",
    paymentRef: "PENDING-AUTH",
    paidDate: "—",
    requestedBy: "Zafar Iqbal (Estate Mgr)",
    approvedBy: "Pending Review",
    status: "Pending",
    budgetHeadCode: "BGT-MNT-02",
  },
  {
    id: "exp-6",
    voucherNo: "EXP-2610-406",
    invoiceNo: "PRN-EXM-5502",
    date: "2026-10-20",
    title: "Mid-Term Answer Booklets & Security Watermarked Stationery",
    description:
      "Printing of 15,000 barcoded examination answer scripts, OMR sheets, and official campus letterheads.",
    category: "Stationery & Printing",
    department: "Examination Cell",
    campus: "Gulberg",
    vendorName: "Oxford Press & Security Printers",
    vendorNtn: "NTN-2291837-5",
    vendorPhone: "042-35719283",
    vendorBank: "Meezan Bank Ltd.",
    vendorAccountNo: "MEZN-0201-88492011",
    grossAmount: 195000,
    taxAmount: 11000,
    whtDeduction: 8000,
    paymentMode: "Crossed Cheque",
    paymentRef: "CHQ-884115",
    paidDate: "2026-10-20",
    requestedBy: "Controller Examinations",
    approvedBy: "Hamza Tariq (Super Admin)",
    status: "Paid",
    budgetHeadCode: "BGT-STN-08",
  },
  {
    id: "exp-7",
    voucherNo: "EXP-2610-407",
    invoiceNo: "SEC-GRD-992",
    date: "2026-10-19",
    title: "Campus Security Guards & Walkthrough Gate Maintenance",
    description:
      "Monthly deployment contract for 18 armed security personnel, CCTV DVR storage upgrade, and metal detectors.",
    category: "Security & Janitorial",
    department: "Campus Security",
    campus: "Bahria Town",
    vendorName: "Askari Guards & Vigilance Pvt Ltd.",
    vendorNtn: "NTN-7718293-6",
    vendorPhone: "051-5591827",
    vendorBank: "Askari Bank Ltd.",
    vendorAccountNo: "AKBL-0319-11293847",
    grossAmount: 420000,
    taxAmount: 28000,
    whtDeduction: 18000,
    paymentMode: "Bank Transfer",
    paymentRef: "FT-2610-774910",
    paidDate: "2026-10-19",
    requestedBy: "Maj. (R) Haroon Rasheed",
    approvedBy: "Hamza Tariq (Super Admin)",
    status: "Paid",
    budgetHeadCode: "BGT-SEC-07",
  },
  {
    id: "exp-8",
    voucherNo: "EXP-2610-408",
    invoiceNo: "SPT-GAL-310",
    date: "2026-10-18",
    title: "Annual Inter-Campus Sports Gala Trophies, Kits & Track Setup",
    description:
      "Procurement of cricket/football team kits, championship shields, medals, and synthetic turf marking.",
    category: "Events & Sports",
    department: "Sports Directorate",
    campus: "DHA Phase 5",
    vendorName: "Forward Sports & Athletics Co.",
    vendorNtn: "NTN-6619283-3",
    vendorPhone: "052-3571829",
    vendorBank: "United Bank Ltd. (UBL)",
    vendorAccountNo: "UBL-0914-44192837",
    grossAmount: 275000,
    taxAmount: 14500,
    whtDeduction: 9500,
    paymentMode: "Bank Transfer",
    paymentRef: "PENDING-DISB",
    paidDate: "—",
    requestedBy: "Coach Imran Butt",
    approvedBy: "Director Student Affairs",
    status: "Approved",
    budgetHeadCode: "BGT-EVT-06",
  },
  {
    id: "exp-9",
    voucherNo: "EXP-2610-409",
    invoiceNo: "SNG-GAS-441",
    date: "2026-10-17",
    title: "Hostel Mess & Science Lab Sui Gas & Water Tanker Supply",
    description:
      "Monthly SNGPL utility bill for boarding kitchen and laboratory Bunsen burner network.",
    category: "Utilities & Power",
    department: "Facilities & Estate",
    campus: "F-8 Islamabad",
    vendorName: "Sui Northern Gas Pipelines (SNGPL)",
    vendorNtn: "NTN-0918273-1",
    vendorPhone: "051-9211829",
    vendorBank: "Habib Bank Limited (HBL)",
    vendorAccountNo: "HBL-0184-33192837",
    grossAmount: 165000,
    taxAmount: 12000,
    whtDeduction: 4000,
    paymentMode: "Bank Transfer",
    paymentRef: "FT-2610-661829",
    paidDate: "2026-10-17",
    requestedBy: "Warden Khalid Mehmood",
    approvedBy: "Hamza Tariq (Super Admin)",
    status: "Paid",
    budgetHeadCode: "BGT-UTL-01",
  },
  {
    id: "exp-10",
    voucherNo: "EXP-2610-410",
    invoiceNo: "IT-SMR-812",
    date: "2026-10-16",
    title: "Interactive 75-Inch 4K Smart Boards for Junior Wing",
    description:
      "Supply and wall-mounting of 4 touch-enabled interactive flat panels for Grade 6 & 7 smart classrooms.",
    category: "IT & Digital Infrastructure",
    department: "IT & Systems",
    campus: "Gulberg",
    vendorName: "Interactive Tech Solutions Pvt Ltd.",
    vendorNtn: "NTN-8829102-4",
    vendorPhone: "042-35881920",
    vendorBank: "Meezan Bank Ltd.",
    vendorAccountNo: "MEZN-0201-99182731",
    grossAmount: 580000,
    taxAmount: 42000,
    whtDeduction: 22000,
    paymentMode: "Bank Transfer",
    paymentRef: "PENDING-AUTH",
    paidDate: "—",
    requestedBy: "Usman Ghani (IT Head)",
    approvedBy: "Pending Review",
    status: "Pending",
    budgetHeadCode: "BGT-ITC-04",
  },
  {
    id: "exp-11",
    voucherNo: "EXP-2610-411",
    invoiceNo: "JAN-CLN-209",
    date: "2026-10-15",
    title: "Eco-Friendly Disinfectants, Washroom Supplies & RO Filters",
    description:
      "Monthly replenishment of drinking water RO membrane filters, hand sanitizers, and janitorial consumables.",
    category: "Security & Janitorial",
    department: "Administration",
    campus: "Clifton",
    vendorName: "Metro Cash & Carry Corporate",
    vendorNtn: "NTN-3391820-8",
    vendorPhone: "021-111-786-622",
    vendorBank: "Habib Bank Limited (HBL)",
    vendorAccountNo: "HBL-5512-22918374",
    grossAmount: 128000,
    taxAmount: 8500,
    whtDeduction: 4500,
    paymentMode: "Petty Cash",
    paymentRef: "PCV-2610-119",
    paidDate: "2026-10-15",
    requestedBy: "Admin Officer Clifton",
    approvedBy: "Campus Principal",
    status: "Paid",
    budgetHeadCode: "BGT-SEC-07",
  },
  {
    id: "exp-12",
    voucherNo: "EXP-2610-412",
    invoiceNo: "FUR-REP-604",
    date: "2026-10-14",
    title: "Ergonomic Student Desks & Library Bookrack Refurbishment",
    description:
      "Polishing and structural repair of 85 classroom dual-desks and laminated oak shelving for Senior Library.",
    category: "Campus Maintenance",
    department: "Civil & Maintenance",
    campus: "Bahria Town",
    vendorName: "Interwood Institutional Projects",
    vendorNtn: "NTN-1928374-5",
    vendorPhone: "042-111-203-203",
    vendorBank: "Allied Bank Ltd.",
    vendorAccountNo: "ABL-0319-77281922",
    grossAmount: 245000,
    taxAmount: 16000,
    whtDeduction: 11000,
    paymentMode: "Crossed Cheque",
    paymentRef: "REJECTED-QT",
    paidDate: "—",
    requestedBy: "Estate Supervisor",
    approvedBy: "Finance Controller",
    status: "Rejected",
    budgetHeadCode: "BGT-MNT-02",
  },
];

export const INITIAL_EXPENSE_VOUCHERS: ExpenseVoucherRecord[] =
  RAW_EXPENSES.map((item) => {
    const netPayable = item.grossAmount + item.taxAmount - item.whtDeduction;
    return {
      ...item,
      netPayable,
      auditTrail: buildAuditTrail(
        item.id,
        item.date,
        item.requestedBy,
        item.approvedBy,
        item.status,
        item.paymentRef
      ),
    };
  });

export const INITIAL_EXPENSE_BUDGETS: ExpenseBudgetRecord[] = [
  {
    id: "bgt-1",
    budgetCode: "BGT-UTL-01",
    category: "Utilities & Power",
    department: "Facilities & Estate",
    campus: "All Campuses",
    custodian: "Engr. Tariq Mehmood",
    monthlyAllocation: 950000,
    monthlySpent: 681000,
    committedPending: 95000,
    ytdAllocation: 9500000,
    ytdSpent: 7120000,
    lastUpdated: "2026-10-24",
    status: "Active",
  },
  {
    id: "bgt-2",
    budgetCode: "BGT-MNT-02",
    category: "Campus Maintenance",
    department: "Civil & Maintenance",
    campus: "All Campuses",
    custodian: "Zafar Iqbal",
    monthlyAllocation: 700000,
    monthlySpent: 385000,
    committedPending: 250000,
    ytdAllocation: 7000000,
    ytdSpent: 5890000,
    lastUpdated: "2026-10-21",
    status: "Warning",
  },
  {
    id: "bgt-3",
    budgetCode: "BGT-LAB-03",
    category: "Lab & Academic Supplies",
    department: "Science & Academics",
    campus: "All Campuses",
    custodian: "Dr. Ayesha Siddiqui",
    monthlyAllocation: 500000,
    monthlySpent: 315000,
    committedPending: 45000,
    ytdAllocation: 5000000,
    ytdSpent: 3420000,
    lastUpdated: "2026-10-22",
    status: "Active",
  },
  {
    id: "bgt-4",
    budgetCode: "BGT-ITC-04",
    category: "IT & Digital Infrastructure",
    department: "IT & Systems",
    campus: "All Campuses",
    custodian: "Usman Ghani",
    monthlyAllocation: 900000,
    monthlySpent: 235000,
    committedPending: 600000,
    ytdAllocation: 9000000,
    ytdSpent: 7850000,
    lastUpdated: "2026-10-22",
    status: "Warning",
  },
  {
    id: "bgt-5",
    budgetCode: "BGT-TRN-05",
    category: "Transport & Fleet Fuel",
    department: "Transport Operations",
    campus: "All Campuses",
    custodian: "Capt. (R) Sajjad Haider",
    monthlyAllocation: 850000,
    monthlySpent: 650000,
    committedPending: 80000,
    ytdAllocation: 8500000,
    ytdSpent: 6910000,
    lastUpdated: "2026-10-23",
    status: "Active",
  },
  {
    id: "bgt-6",
    budgetCode: "BGT-EVT-06",
    category: "Events & Sports",
    department: "Sports Directorate",
    campus: "All Campuses",
    custodian: "Coach Imran Butt",
    monthlyAllocation: 400000,
    monthlySpent: 280000,
    committedPending: 35000,
    ytdAllocation: 4000000,
    ytdSpent: 2640000,
    lastUpdated: "2026-10-18",
    status: "Active",
  },
  {
    id: "bgt-7",
    budgetCode: "BGT-SEC-07",
    category: "Security & Janitorial",
    department: "Campus Security",
    campus: "All Campuses",
    custodian: "Maj. (R) Haroon Rasheed",
    monthlyAllocation: 650000,
    monthlySpent: 562000,
    committedPending: 30000,
    ytdAllocation: 6500000,
    ytdSpent: 5710000,
    lastUpdated: "2026-10-19",
    status: "Active",
  },
  {
    id: "bgt-8",
    budgetCode: "BGT-STN-08",
    category: "Stationery & Printing",
    department: "Examination Cell",
    campus: "All Campuses",
    custodian: "Controller Examinations",
    monthlyAllocation: 350000,
    monthlySpent: 198000,
    committedPending: 25000,
    ytdAllocation: 3500000,
    ytdSpent: 2490000,
    lastUpdated: "2026-10-20",
    status: "Active",
  },
];
