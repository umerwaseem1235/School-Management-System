export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface InventoryItemRecord {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  unit: string;
  lastUpdated: string;
  status: StockStatus;
}

export function computeStockStatus(
  quantity: number,
  reorderLevel: number
): StockStatus {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= reorderLevel) return "Low Stock";
  return "In Stock";
}

export const INVENTORY_CATEGORIES: string[] = [
  "Stationery",
  "Examination",
  "Sports",
  "Science Lab",
  "Cleaning",
  "IT & Hardware",
  "Classroom Furniture",
  "Medical & Safety",
];

const RAW_STOCK_ITEMS: Omit<InventoryItemRecord, "status">[] = [
  {
    id: "inv-1",
    sku: "STK-101",
    name: "A4 Paper Reams",
    category: "Stationery",
    quantity: 140,
    reorderLevel: 20,
    unit: "Reams",
    lastUpdated: "2026-10-28",
  },
  {
    id: "inv-2",
    sku: "STK-102",
    name: "Ball Pens (Box)",
    category: "Stationery",
    quantity: 80,
    reorderLevel: 10,
    unit: "Boxes",
    lastUpdated: "2026-10-27",
  },
  {
    id: "inv-3",
    sku: "STK-103",
    name: "Chalk Box (Dustless)",
    category: "Stationery",
    quantity: 200,
    reorderLevel: 30,
    unit: "Boxes",
    lastUpdated: "2026-10-26",
  },
  {
    id: "inv-4",
    sku: "STK-104",
    name: "Whiteboard Markers (Box)",
    category: "Stationery",
    quantity: 65,
    reorderLevel: 15,
    unit: "Boxes",
    lastUpdated: "2026-10-25",
  },
  {
    id: "inv-5",
    sku: "STK-105",
    name: "Whiteboard Duster",
    category: "Stationery",
    quantity: 20,
    reorderLevel: 5,
    unit: "Pieces",
    lastUpdated: "2026-10-24",
  },
  {
    id: "inv-6",
    sku: "STK-106",
    name: "Cricket Bat & Kit",
    category: "Sports",
    quantity: 6,
    reorderLevel: 2,
    unit: "Units",
    lastUpdated: "2026-10-23",
  },
  {
    id: "inv-7",
    sku: "STK-107",
    name: "Footballs (Match Grade)",
    category: "Sports",
    quantity: 14,
    reorderLevel: 4,
    unit: "Units",
    lastUpdated: "2026-10-22",
  },
  {
    id: "inv-8",
    sku: "STK-108",
    name: "Exam Answer Booklets (32-Page)",
    category: "Examination",
    quantity: 320,
    reorderLevel: 50,
    unit: "Booklets",
    lastUpdated: "2026-10-25",
  },
  {
    id: "inv-9",
    sku: "STK-109",
    name: "Science Lab Glass Beakers",
    category: "Science Lab",
    quantity: 45,
    reorderLevel: 12,
    unit: "Pieces",
    lastUpdated: "2026-10-20",
  },
  {
    id: "inv-10",
    sku: "STK-110",
    name: "Floor Disinfectant & Cleaners",
    category: "Cleaning",
    quantity: 12,
    reorderLevel: 15,
    unit: "Bottles",
    lastUpdated: "2026-10-19",
  },
  {
    id: "inv-11",
    sku: "STK-111",
    name: "Liquid Handwash Refills",
    category: "Cleaning",
    quantity: 8,
    reorderLevel: 10,
    unit: "Bottles",
    lastUpdated: "2026-10-18",
  },
  {
    id: "inv-12",
    sku: "STK-112",
    name: "First Aid Medical Kits",
    category: "Medical & Safety",
    quantity: 15,
    reorderLevel: 5,
    unit: "Kits",
    lastUpdated: "2026-10-17",
  },
  {
    id: "inv-13",
    sku: "STK-113",
    name: "HDMI & Projector Display Cables",
    category: "IT & Hardware",
    quantity: 0,
    reorderLevel: 5,
    unit: "Units",
    lastUpdated: "2026-10-15",
  },
  {
    id: "inv-14",
    sku: "STK-114",
    name: "Student Classroom Desk & Chair Sets",
    category: "Classroom Furniture",
    quantity: 55,
    reorderLevel: 10,
    unit: "Sets",
    lastUpdated: "2026-10-14",
  },
];

export const INITIAL_INVENTORY_ITEMS: InventoryItemRecord[] =
  RAW_STOCK_ITEMS.map((item) => ({
    ...item,
    status: computeStockStatus(item.quantity, item.reorderLevel),
  }));

/* ────────────────────────────────────────────────────────────────────────── */
/* Stock Issuance (Store → Person)                                            */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Consumable  → item is used up (paper, chalk, markers) — never comes back.
 * Returnable  → item is lent out (cricket kit, microscope, books) — expected back.
 */
export type IssuanceType = "Consumable" | "Returnable";

export type IssuanceStatus = "Issued" | "Returned" | "Consumed";

export type IssueeRole =
  | "Teacher"
  | "Staff"
  | "Student"
  | "Department Head"
  | "Admin Office";

export const ISSUEE_ROLES: IssueeRole[] = [
  "Teacher",
  "Staff",
  "Student",
  "Department Head",
  "Admin Office",
];

export const ISSUANCE_DEPARTMENTS: string[] = [
  "Primary Section",
  "Middle Section",
  "Senior Section",
  "Science Department",
  "Sports Department",
  "Examination Cell",
  "IT Lab",
  "Administration",
  "Housekeeping",
  "Medical Room",
];

export interface IssueeDirectoryEntry {
  id: string;
  name: string;
  role: IssueeRole;
  department: string;
}

export const ISSUEE_DIRECTORY: IssueeDirectoryEntry[] = [
  { id: "emp-1", name: "Ms. Ayesha Khan", role: "Teacher", department: "Primary Section" },
  { id: "emp-2", name: "Mr. Bilal Ahmed", role: "Teacher", department: "Senior Section" },
  { id: "emp-3", name: "Ms. Sana Javed", role: "Teacher", department: "Middle Section" },
  { id: "emp-4", name: "Dr. Imran Qureshi", role: "Department Head", department: "Science Department" },
  { id: "emp-5", name: "Coach Faisal Mehmood", role: "Staff", department: "Sports Department" },
  { id: "emp-6", name: "Mr. Usman Tariq", role: "Staff", department: "Examination Cell" },
  { id: "emp-7", name: "Mr. Hassan Raza", role: "Staff", department: "IT Lab" },
  { id: "emp-8", name: "Mrs. Nadia Shah", role: "Admin Office", department: "Administration" },
  { id: "emp-9", name: "Mr. Akram Masih", role: "Staff", department: "Housekeeping" },
  { id: "emp-10", name: "Nurse Rubina Akhtar", role: "Staff", department: "Medical Room" },
];

export interface StockIssuanceRecord {
  id: string;
  issueNo: string;
  issueDate: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  itemCategory: string;
  unit: string;
  quantity: number;
  issuedTo: string;
  issueeRole: IssueeRole;
  department: string;
  purpose: string;
  issuanceType: IssuanceType;
  expectedReturnDate: string;
  returnedDate: string;
  issuedBy: string;
  status: IssuanceStatus;
}

export const INITIAL_STOCK_ISSUANCES: StockIssuanceRecord[] = [
  {
    id: "iss-1",
    issueNo: "ISS-1006",
    issueDate: "2026-10-28",
    itemId: "inv-1",
    itemSku: "STK-101",
    itemName: "A4 Paper Reams",
    itemCategory: "Stationery",
    unit: "Reams",
    quantity: 5,
    issuedTo: "Mr. Usman Tariq",
    issueeRole: "Staff",
    department: "Examination Cell",
    purpose: "Mid-term question paper printing",
    issuanceType: "Consumable",
    expectedReturnDate: "",
    returnedDate: "",
    issuedBy: "Store Keeper",
    status: "Consumed",
  },
  {
    id: "iss-2",
    issueNo: "ISS-1005",
    issueDate: "2026-10-27",
    itemId: "inv-6",
    itemSku: "STK-106",
    itemName: "Cricket Bat & Kit",
    itemCategory: "Sports",
    unit: "Units",
    quantity: 2,
    issuedTo: "Coach Faisal Mehmood",
    issueeRole: "Staff",
    department: "Sports Department",
    purpose: "Inter-house cricket tournament",
    issuanceType: "Returnable",
    expectedReturnDate: "2026-11-05",
    returnedDate: "",
    issuedBy: "Store Keeper",
    status: "Issued",
  },
  {
    id: "iss-3",
    issueNo: "ISS-1004",
    issueDate: "2026-10-26",
    itemId: "inv-4",
    itemSku: "STK-104",
    itemName: "Whiteboard Markers (Box)",
    itemCategory: "Stationery",
    unit: "Boxes",
    quantity: 3,
    issuedTo: "Ms. Ayesha Khan",
    issueeRole: "Teacher",
    department: "Primary Section",
    purpose: "Classroom teaching — Grade 3",
    issuanceType: "Consumable",
    expectedReturnDate: "",
    returnedDate: "",
    issuedBy: "Store Keeper",
    status: "Consumed",
  },
  {
    id: "iss-4",
    issueNo: "ISS-1003",
    issueDate: "2026-10-24",
    itemId: "inv-9",
    itemSku: "STK-109",
    itemName: "Science Lab Glass Beakers",
    itemCategory: "Science Lab",
    unit: "Pieces",
    quantity: 10,
    issuedTo: "Dr. Imran Qureshi",
    issueeRole: "Department Head",
    department: "Science Department",
    purpose: "Grade 10 chemistry practicals",
    issuanceType: "Returnable",
    expectedReturnDate: "2026-10-31",
    returnedDate: "",
    issuedBy: "Store Keeper",
    status: "Issued",
  },
  {
    id: "iss-5",
    issueNo: "ISS-1002",
    issueDate: "2026-10-22",
    itemId: "inv-7",
    itemSku: "STK-107",
    itemName: "Footballs (Match Grade)",
    itemCategory: "Sports",
    unit: "Units",
    quantity: 4,
    issuedTo: "Coach Faisal Mehmood",
    issueeRole: "Staff",
    department: "Sports Department",
    purpose: "Weekly PE period",
    issuanceType: "Returnable",
    expectedReturnDate: "2026-10-25",
    returnedDate: "2026-10-25",
    issuedBy: "Store Keeper",
    status: "Returned",
  },
  {
    id: "iss-6",
    issueNo: "ISS-1001",
    issueDate: "2026-10-20",
    itemId: "inv-10",
    itemSku: "STK-110",
    itemName: "Floor Disinfectant & Cleaners",
    itemCategory: "Cleaning",
    unit: "Bottles",
    quantity: 6,
    issuedTo: "Mr. Akram Masih",
    issueeRole: "Staff",
    department: "Housekeeping",
    purpose: "Weekly campus cleaning",
    issuanceType: "Consumable",
    expectedReturnDate: "",
    returnedDate: "",
    issuedBy: "Store Keeper",
    status: "Consumed",
  },
];
