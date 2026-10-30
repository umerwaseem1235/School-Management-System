/* ────────────────────────────────────────────────────────────────────────────
 * Assets  –  Simplified Data Model  (Opus SMS Super-Admin)
 * ──────────────────────────────────────────────────────────────────────────── */

export type AssetCondition = "New" | "Good" | "Fair" | "Poor";

export type AssetCategory =
  | "IT & Computing"
  | "Power & Energy"
  | "Furniture"
  | "Lab Equipment"
  | "Transport"
  | "Sports & Recreation"
  | "Appliance"
  | "AV & Multimedia"
  | "Security"
  | "Other";

export const ASSET_CATEGORIES: AssetCategory[] = [
  "IT & Computing",
  "Power & Energy",
  "Furniture",
  "Lab Equipment",
  "Transport",
  "Sports & Recreation",
  "Appliance",
  "AV & Multimedia",
  "Security",
  "Other",
];

export const ASSET_CONDITIONS: AssetCondition[] = [
  "New",
  "Good",
  "Fair",
  "Poor",
];

export interface AssetRecord {
  id: string;
  assetCode: string;
  name: string;
  category: AssetCategory;
  location: string;
  condition: AssetCondition;
  purchaseDate: string;
  purchaseCost: number;
  quantity: number;
  remarks: string;
}

/**
 * Maps each condition to its display colour class tokens.
 */
export const CONDITION_COLORS: Record<
  AssetCondition,
  { dot: string; text: string; bg: string }
> = {
  New: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  Good: {
    dot: "bg-green-500",
    text: "text-green-700",
    bg: "bg-green-50",
  },
  Fair: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50",
  },
  Poor: {
    dot: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-50",
  },
};

/* ───────────────────────── Sample Data ───────────────────────── */

export const INITIAL_ASSETS: AssetRecord[] = [
  {
    id: "ast-1",
    assetCode: "AST-001",
    name: "Computer Lab PCs (20)",
    category: "IT & Computing",
    location: "Computer Lab",
    condition: "Good",
    purchaseDate: "2025-04-27",
    purchaseCost: 2400000,
    quantity: 20,
    remarks: "Dell Optiplex 7090 i5 Desktops with 24-inch monitors",
  },
  {
    id: "ast-2",
    assetCode: "AST-002",
    name: "Generator 15 kVA",
    category: "Power & Energy",
    location: "Back Yard",
    condition: "Fair",
    purchaseDate: "2023-06-27",
    purchaseCost: 850000,
    quantity: 1,
    remarks: "Perkins diesel generator with auto-transfer switch",
  },
  {
    id: "ast-3",
    assetCode: "AST-003",
    name: "Library Shelves",
    category: "Furniture",
    location: "Library",
    condition: "New",
    purchaseDate: "2026-07-27",
    purchaseCost: 320000,
    quantity: 12,
    remarks: "Steel book racks with adjustable shelving — 6-tier",
  },
  {
    id: "ast-4",
    assetCode: "AST-004",
    name: "Projector — Class 8",
    category: "AV & Multimedia",
    location: "Class 8 Room",
    condition: "Good",
    purchaseDate: "2025-08-27",
    purchaseCost: 185000,
    quantity: 1,
    remarks: "Epson EB-X51 3LCD XGA Projector with ceiling mount",
  },
  {
    id: "ast-5",
    assetCode: "AST-005",
    name: "School Bus — Route 1",
    category: "Transport",
    location: "Garage",
    condition: "Good",
    purchaseDate: "2024-08-27",
    purchaseCost: 6500000,
    quantity: 1,
    remarks: "Hino AK1J 2024 — 52-seater AC coach",
  },
  {
    id: "ast-6",
    assetCode: "AST-006",
    name: "Science Lab Microscopes (10)",
    category: "Lab Equipment",
    location: "Science Lab",
    condition: "Good",
    purchaseDate: "2024-12-27",
    purchaseCost: 450000,
    quantity: 10,
    remarks: "Nikon Eclipse E200 compound microscopes with digital camera",
  },
  {
    id: "ast-7",
    assetCode: "AST-007",
    name: "Sports Equipment Set",
    category: "Sports & Recreation",
    location: "Store Room",
    condition: "Good",
    purchaseDate: "2026-01-27",
    purchaseCost: 175000,
    quantity: 1,
    remarks: "Cricket, football, badminton, basketball complete kits",
  },
  {
    id: "ast-8",
    assetCode: "AST-008",
    name: "Water Cooler",
    category: "Appliance",
    location: "Corridor B",
    condition: "Poor",
    purchaseDate: "2024-04-27",
    purchaseCost: 65000,
    quantity: 1,
    remarks: "Industrial water cooler — compressor needs replacement",
  },
  {
    id: "ast-9",
    assetCode: "AST-009",
    name: "CCTV Camera System (16-Ch)",
    category: "Security",
    location: "Security Room",
    condition: "Good",
    purchaseDate: "2025-03-15",
    purchaseCost: 380000,
    quantity: 16,
    remarks: "Hikvision 4MP IP cameras with 4TB NVR",
  },
  {
    id: "ast-10",
    assetCode: "AST-010",
    name: "Smart Boards (4)",
    category: "AV & Multimedia",
    location: "Senior Wing",
    condition: "New",
    purchaseDate: "2026-09-10",
    purchaseCost: 960000,
    quantity: 4,
    remarks: "Promethean ActivPanel 65-inch interactive displays",
  },
];
