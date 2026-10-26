export type InventoryCategory =
  | "Stationery & Printing"
  | "Science Lab Equipment"
  | "IT & AV Hardware"
  | "Examination Supplies"
  | "Classroom Furniture"
  | "Sports & Athletics"
  | "Electrical & Maintenance"
  | "Medical & Safety";

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type PurchaseOrderStatus =
  | "Received"
  | "Ordered"
  | "Pending"
  | "Cancelled";

export type IssuanceStatus = "Issued" | "Returned" | "Pending";

export interface StockMovementEntry {
  id: string;
  timestamp: string;
  voucherRef: string;
  type: "GRN Received" | "Dept Issuance" | "Audit Check";
  qtyChange: string;
  balanceAfter: number;
  departmentOrVendor: string;
  actor: string;
  remarks: string;
}

export interface InventoryItemRecord {
  id: string;
  sku: string;
  name: string;
  specification: string;
  category: InventoryCategory;
  campus: string;
  storeLocation: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
  totalValue: number;
  supplierName: string;
  supplierNtn: string;
  supplierPhone: string;
  custodian: string;
  lastRestocked: string;
  status: StockStatus;
  movementLogs: StockMovementEntry[];
}

export interface PurchaseOrderRecord {
  id: string;
  poNumber: string;
  grnNumber: string;
  orderDate: string;
  expectedDelivery: string;
  title: string;
  itemsSummary: string;
  category: InventoryCategory;
  campus: string;
  supplierName: string;
  supplierNtn: string;
  supplierPhone: string;
  supplierBank: string;
  supplierIban: string;
  orderedQty: number;
  unit: string;
  grossAmount: number;
  gstAmount: number;
  whtDeduction: number;
  netPayable: number;
  paymentTerms: string;
  requestedBy: string;
  approvedBy: string;
  status: PurchaseOrderStatus;
}

export interface DepartmentalIssuanceRecord {
  id: string;
  issueVoucherNo: string;
  requisitionNo: string;
  issueDate: string;
  sku: string;
  itemName: string;
  category: InventoryCategory;
  campus: string;
  department: string;
  issuedTo: string;
  issuedBy: string;
  quantityIssued: number;
  unit: string;
  unitCost: number;
  totalValuation: number;
  purpose: string;
  returnable: boolean;
  status: IssuanceStatus;
}

export interface InventorySupplierRecord {
  id: string;
  supplierCode: string;
  companyName: string;
  category: InventoryCategory;
  ntn: string;
  strn: string;
  city: string;
  contactPerson: string;
  phone: string;
  email: string;
  bankName: string;
  iban: string;
  paymentTerms: string;
  totalOrdersCount: number;
  totalProcurementValue: number;
  outstandingPayable: number;
  rating: string;
  status: "Verified" | "Active";
}

export function computeStockStatus(
  quantity: number,
  reorderLevel: number
): StockStatus {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= reorderLevel) return "Low Stock";
  return "In Stock";
}

function buildMovementLogs(
  id: string,
  lastRestocked: string,
  quantity: number,
  unit: string,
  supplierName: string,
  custodian: string
): StockMovementEntry[] {
  const initialAdd = Math.max(quantity + 25, 50);
  return [
    {
      id: `${id}-mov-3`,
      timestamp: `${lastRestocked} 02:30 PM`,
      voucherRef: `AUD-2610-${id.replace("inv-", "10")}`,
      type: "Audit Check",
      qtyChange: `Verified (${quantity} ${unit})`,
      balanceAfter: quantity,
      departmentOrVendor: "Internal Store Audit Committee",
      actor: custodian,
      remarks: "Physical bin card reconciled with digital store ledger",
    },
    {
      id: `${id}-mov-2`,
      timestamp: `${lastRestocked} 11:15 AM`,
      voucherRef: `ISS-2610-${id.replace("inv-", "50")}`,
      type: "Dept Issuance",
      qtyChange: `-25 ${unit}`,
      balanceAfter: quantity,
      departmentOrVendor: "Academic Wing / Campus Requisition",
      actor: custodian,
      remarks: "Issued against approved departmental requisition slip",
    },
    {
      id: `${id}-mov-1`,
      timestamp: `${lastRestocked} 09:00 AM`,
      voucherRef: `GRN-2610-${id.replace("inv-", "30")}`,
      type: "GRN Received",
      qtyChange: `+${initialAdd} ${unit}`,
      balanceAfter: initialAdd,
      departmentOrVendor: supplierName,
      actor: "M. Kamran Siddiqui (Store Inspection)",
      remarks: "Goods received and inspected against Purchase Order",
    },
  ];
}

const RAW_ITEMS: Omit<
  InventoryItemRecord,
  "totalValue" | "status" | "movementLogs"
>[] = [
  {
    id: "inv-1",
    sku: "INV-SKU-101",
    name: "Double A A4 Copier Paper (80 GSM)",
    specification:
      "500 Sheets per Ream, High-Brightness Imported Laser & Photocopier Paper",
    category: "Stationery & Printing",
    campus: "Gulberg",
    storeLocation: "Central Stationery Store · Rack A-01",
    unit: "Reams",
    quantity: 420,
    reorderLevel: 100,
    unitCost: 1450,
    supplierName: "Allied Paper & Stationery Mart",
    supplierNtn: "4182910-6",
    supplierPhone: "+92 42 35714820",
    custodian: "M. Tariq Mehmood",
    lastRestocked: "2026-10-22",
  },
  {
    id: "inv-2",
    sku: "INV-SKU-102",
    name: "Olympus CX23 Binocular Microscopes",
    specification:
      "LED Illumination, Plan Achromat Objectives (4x, 10x, 40x, 100x Oil)",
    category: "Science Lab Equipment",
    campus: "DHA Phase 5",
    storeLocation: "Senior Biology Lab · Cabinet B-02",
    unit: "Units",
    quantity: 28,
    reorderLevel: 10,
    unitCost: 68500,
    supplierName: "Precision Scientific Traders (Pvt) Ltd",
    supplierNtn: "3829104-2",
    supplierPhone: "+92 42 37239910",
    custodian: "Engr. Asim Rauf",
    lastRestocked: "2026-10-18",
  },
  {
    id: "inv-3",
    sku: "INV-SKU-103",
    name: "Epson EB-E01 3300-Lumen Classroom Projectors",
    specification:
      "3LCD XGA Smart Board Compatible Ceiling-Mount Multimedia Projector",
    category: "IT & AV Hardware",
    campus: "F-8 Islamabad",
    storeLocation: "IT Hardware Vault · Bay C-04",
    unit: "Units",
    quantity: 6,
    reorderLevel: 8,
    unitCost: 135000,
    supplierName: "TechnoSphere Enterprise Solutions",
    supplierNtn: "7492018-9",
    supplierPhone: "+92 51 2874910",
    custodian: "Usman Ghani",
    lastRestocked: "2026-10-14",
  },
  {
    id: "inv-4",
    sku: "INV-SKU-104",
    name: "Watermarked Examination Answer Booklets (32-Page)",
    specification:
      "Serialized Barcoded 75 GSM Ruled Answer Scripts with Official Seal",
    category: "Examination Supplies",
    campus: "Gulberg",
    storeLocation: "Secrecy Strongroom · Vault S-01",
    unit: "Booklets",
    quantity: 8500,
    reorderLevel: 2500,
    unitCost: 65,
    supplierName: "Allied Paper & Stationery Mart",
    supplierNtn: "4182910-6",
    supplierPhone: "+92 42 35714820",
    custodian: "Dr. Salman Qureshi",
    lastRestocked: "2026-10-24",
  },
  {
    id: "inv-5",
    sku: "INV-SKU-105",
    name: "Analytical Grade Chemistry Titration Reagents Set",
    specification:
      "Molar HCl, NaOH, H2SO4, Phenolphthalein & Methyl Orange (2.5L Amber Bottles)",
    category: "Science Lab Equipment",
    campus: "Clifton",
    storeLocation: "Chemistry Chemical Store · Flammables Locker F-02",
    unit: "Kits",
    quantity: 9,
    reorderLevel: 12,
    unitCost: 24500,
    supplierName: "Precision Scientific Traders (Pvt) Ltd",
    supplierNtn: "3829104-2",
    supplierPhone: "+92 42 37239910",
    custodian: "Prof. Nadia Kamal",
    lastRestocked: "2026-10-10",
  },
  {
    id: "inv-6",
    sku: "INV-SKU-106",
    name: "Single-Student Ergonomic Beechwood Desk & Chair Set",
    specification:
      "Powder-Coated 16-Gauge Steel Frame with Laminated Book Basket",
    category: "Classroom Furniture",
    campus: "Bahria Town",
    storeLocation: "Estate Warehouse · Sector W-03",
    unit: "Sets",
    quantity: 65,
    reorderLevel: 20,
    unitCost: 14800,
    supplierName: "Interwood Institutional Furnishings",
    supplierNtn: "1948271-4",
    supplierPhone: "+92 42 35881920",
    custodian: "Col. (R) Javed Iqbal",
    lastRestocked: "2026-10-19",
  },
  {
    id: "inv-7",
    sku: "INV-SKU-107",
    name: "HP LaserJet 85A Original Black Toner Cartridges",
    specification:
      "CE285A High-Yield Original Toner for Examination & Accounts Printers",
    category: "IT & AV Hardware",
    campus: "Gulberg",
    storeLocation: "Central Stationery Store · Rack A-04",
    unit: "Cartridges",
    quantity: 0,
    reorderLevel: 10,
    unitCost: 11200,
    supplierName: "TechnoSphere Enterprise Solutions",
    supplierNtn: "7492018-9",
    supplierPhone: "+92 51 2874910",
    custodian: "M. Tariq Mehmood",
    lastRestocked: "2026-09-28",
  },
  {
    id: "inv-8",
    sku: "INV-SKU-108",
    name: "Ubiquiti UniFi Wi-Fi 6 Pro Enterprise Access Points",
    specification:
      "Dual-Band 5.3 Gbps PoE+ Ceiling Access Point for Smart Classrooms",
    category: "IT & AV Hardware",
    campus: "DHA Phase 5",
    storeLocation: "IT Hardware Vault · Bay C-01",
    unit: "Units",
    quantity: 18,
    reorderLevel: 6,
    unitCost: 54000,
    supplierName: "TechnoSphere Enterprise Solutions",
    supplierNtn: "7492018-9",
    supplierPhone: "+92 51 2874910",
    custodian: "Usman Ghani",
    lastRestocked: "2026-10-21",
  },
  {
    id: "inv-9",
    sku: "INV-SKU-109",
    name: "CA Pro English Willow Inter-Campus Cricket & Athletics Kits",
    specification:
      "Complete Tournament Bag: 2 Bats, Leg Guards, Batting Gloves, 12 Leather Balls",
    category: "Sports & Athletics",
    campus: "Gulberg",
    storeLocation: "Sports Complex Pavilion · Store S-02",
    unit: "Kits",
    quantity: 14,
    reorderLevel: 5,
    unitCost: 62000,
    supplierName: "Sialkot Premier Sports & Gear Co.",
    supplierNtn: "5291840-7",
    supplierPhone: "+92 52 4589201",
    custodian: "Coach Imranullah Khan",
    lastRestocked: "2026-10-16",
  },
  {
    id: "inv-10",
    sku: "INV-SKU-110",
    name: "Perkins 100kVA Generator Overhaul & Filter Maintenance Packs",
    specification:
      "OEM Fuel Filter, Oil Filter, Air Breather Element & 20L 15W-40 Coolant Set",
    category: "Electrical & Maintenance",
    campus: "F-8 Islamabad",
    storeLocation: "Powerhouse Plant Room · Rack M-01",
    unit: "Packs",
    quantity: 3,
    reorderLevel: 5,
    unitCost: 38500,
    supplierName: "Allied Power & Engineering Works",
    supplierNtn: "6019283-1",
    supplierPhone: "+92 42 36309182",
    custodian: "Sub-Engr. Rafaqat Ali",
    lastRestocked: "2026-10-11",
  },
  {
    id: "inv-11",
    sku: "INV-SKU-111",
    name: "Dollar Whiteboard Markers & Duster Classroom Packs",
    specification:
      "Box of 12 Non-Toxic Refillable Markers (Black, Blue, Red, Green) + 2 Magnetic Dusters",
    category: "Stationery & Printing",
    campus: "Clifton",
    storeLocation: "Campus Admin Store · Shelf B-05",
    unit: "Boxes",
    quantity: 185,
    reorderLevel: 50,
    unitCost: 1150,
    supplierName: "Allied Paper & Stationery Mart",
    supplierNtn: "4182910-6",
    supplierPhone: "+92 42 35714820",
    custodian: "M. Tariq Mehmood",
    lastRestocked: "2026-10-23",
  },
  {
    id: "inv-12",
    sku: "INV-SKU-112",
    name: "Emergency Trauma & Campus Infirmary First-Aid Cabinets",
    specification:
      "WHO-Compliant 120-Piece Medical Kit with Digital Thermometer, Oximeter & BP Apparatus",
    category: "Medical & Safety",
    campus: "Bahria Town",
    storeLocation: "Campus Medical Dispensary · Cabinet M-04",
    unit: "Units",
    quantity: 12,
    reorderLevel: 4,
    unitCost: 19500,
    supplierName: "Precision Scientific Traders (Pvt) Ltd",
    supplierNtn: "3829104-2",
    supplierPhone: "+92 42 37239910",
    custodian: "Dr. Ayesha Siddiqa",
    lastRestocked: "2026-10-20",
  },
];

export const INITIAL_INVENTORY_ITEMS: InventoryItemRecord[] = RAW_ITEMS.map(
  (item) => ({
    ...item,
    totalValue: item.quantity * item.unitCost,
    status: computeStockStatus(item.quantity, item.reorderLevel),
    movementLogs: buildMovementLogs(
      item.id,
      item.lastRestocked,
      item.quantity,
      item.unit,
      item.supplierName,
      item.custodian
    ),
  })
);

export const INITIAL_PURCHASE_ORDERS: PurchaseOrderRecord[] = [
  {
    id: "po-1",
    poNumber: "PO-2610-701",
    grnNumber: "GRN-2610-301",
    orderDate: "2026-10-20",
    expectedDelivery: "2026-10-24",
    title: "Mid-Term Examination Answer Booklets & A4 Copier Reams",
    itemsSummary:
      "8,500 Watermarked Answer Booklets (32-Page) + 300 Reams Double A A4 Paper",
    category: "Examination Supplies",
    campus: "Gulberg",
    supplierName: "Allied Paper & Stationery Mart",
    supplierNtn: "4182910-6",
    supplierPhone: "+92 42 35714820",
    supplierBank: "Meezan Bank",
    supplierIban: "PK44MEZN0002010104829106",
    orderedQty: 8800,
    unit: "Units",
    grossAmount: 987500,
    gstAmount: 177750,
    whtDeduction: 44438,
    netPayable: 1120812,
    paymentTerms: "100% Upon GRN Verification",
    requestedBy: "Dr. Salman Qureshi (Controller Exams)",
    approvedBy: "Hamza Tariq (Super Admin)",
    status: "Received",
  },
  {
    id: "po-2",
    poNumber: "PO-2610-702",
    grnNumber: "GRN-2610-302",
    orderDate: "2026-10-15",
    expectedDelivery: "2026-10-21",
    title: "Senior Biology Lab Compound Microscopes & Slide Kits",
    itemsSummary: "15 Olympus CX23 Binocular LED Microscopes + Prepared Slides",
    category: "Science Lab Equipment",
    campus: "DHA Phase 5",
    supplierName: "Precision Scientific Traders (Pvt) Ltd",
    supplierNtn: "3829104-2",
    supplierPhone: "+92 42 37239910",
    supplierBank: "Habib Bank Limited (HBL)",
    supplierIban: "PK88HABB0004527901283901",
    orderedQty: 15,
    unit: "Units",
    grossAmount: 1027500,
    gstAmount: 184950,
    whtDeduction: 46238,
    netPayable: 1166212,
    paymentTerms: "Net 15 Days Post-Inspection",
    requestedBy: "Engr. Asim Rauf (Lab Coordinator)",
    approvedBy: "Hamza Tariq (Super Admin)",
    status: "Received",
  },
  {
    id: "po-3",
    poNumber: "PO-2610-703",
    grnNumber: "PENDING-GRN",
    orderDate: "2026-10-23",
    expectedDelivery: "2026-10-29",
    title: "HP LaserJet 85A Toner Cartridges & Classroom Projectors",
    itemsSummary:
      "25 Original HP 85A Toner Cartridges + 4 Epson EB-E01 XGA Projectors",
    category: "IT & AV Hardware",
    campus: "F-8 Islamabad",
    supplierName: "TechnoSphere Enterprise Solutions",
    supplierNtn: "7492018-9",
    supplierPhone: "+92 51 2874910",
    supplierBank: "United Bank Limited (UBL)",
    supplierIban: "PK19UNIL0109000284910293",
    orderedQty: 29,
    unit: "Units",
    grossAmount: 820000,
    gstAmount: 147600,
    whtDeduction: 36900,
    netPayable: 930700,
    paymentTerms: "50% Advance / 50% Delivery",
    requestedBy: "Usman Ghani (Head of IT)",
    approvedBy: "Hamza Tariq (Super Admin)",
    status: "Ordered",
  },
  {
    id: "po-4",
    poNumber: "PO-2610-704",
    grnNumber: "GRN-2610-304",
    orderDate: "2026-10-12",
    expectedDelivery: "2026-10-19",
    title: "New Academic Block Student Beechwood Desks & Chairs",
    itemsSummary: "65 Single-Student Ergonomic Steel & Beechwood Desk Sets",
    category: "Classroom Furniture",
    campus: "Bahria Town",
    supplierName: "Interwood Institutional Furnishings",
    supplierNtn: "1948271-4",
    supplierPhone: "+92 42 35881920",
    supplierBank: "Bank Alfalah",
    supplierIban: "PK62ALFH0029001004928174",
    orderedQty: 65,
    unit: "Sets",
    grossAmount: 962000,
    gstAmount: 173160,
    whtDeduction: 43290,
    netPayable: 1091870,
    paymentTerms: "100% Upon GRN Verification",
    requestedBy: "Col. (R) Javed Iqbal (Estate Director)",
    approvedBy: "Hamza Tariq (Super Admin)",
    status: "Received",
  },
  {
    id: "po-5",
    poNumber: "PO-2610-705",
    grnNumber: "PENDING-GRN",
    orderDate: "2026-10-25",
    expectedDelivery: "2026-11-02",
    title: "Analytical Chemistry Lab Titration Acids & Safety Glassware",
    itemsSummary: "20 Analytical Reagent Kits + 100 Borosilicate Burettes & Pipettes",
    category: "Science Lab Equipment",
    campus: "Clifton",
    supplierName: "Precision Scientific Traders (Pvt) Ltd",
    supplierNtn: "3829104-2",
    supplierPhone: "+92 42 37239910",
    supplierBank: "Habib Bank Limited (HBL)",
    supplierIban: "PK88HABB0004527901283901",
    orderedQty: 20,
    unit: "Kits",
    grossAmount: 490000,
    gstAmount: 88200,
    whtDeduction: 22050,
    netPayable: 556150,
    paymentTerms: "Net 15 Days Post-Inspection",
    requestedBy: "Prof. Nadia Kamal (HOD Chemistry)",
    approvedBy: "Pending Finance Review",
    status: "Pending",
  },
  {
    id: "po-6",
    poNumber: "PO-2610-706",
    grnNumber: "GRN-2610-306",
    orderDate: "2026-10-10",
    expectedDelivery: "2026-10-16",
    title: "Annual Inter-Campus Sports Gala Cricket & Athletics Gear",
    itemsSummary: "14 CA Pro Cricket Kits, 30 Footballs, Stopwatches & Track Hurdles",
    category: "Sports & Athletics",
    campus: "Gulberg",
    supplierName: "Sialkot Premier Sports & Gear Co.",
    supplierNtn: "5291840-7",
    supplierPhone: "+92 52 4589201",
    supplierBank: "Askari Bank",
    supplierIban: "PK71ASCM0000921800491827",
    orderedQty: 14,
    unit: "Kits",
    grossAmount: 868000,
    gstAmount: 156240,
    whtDeduction: 39060,
    netPayable: 985180,
    paymentTerms: "100% Upon GRN Verification",
    requestedBy: "Coach Imranullah Khan (Sports Director)",
    approvedBy: "Hamza Tariq (Super Admin)",
    status: "Received",
  },
  {
    id: "po-7",
    poNumber: "PO-2610-707",
    grnNumber: "PENDING-GRN",
    orderDate: "2026-10-24",
    expectedDelivery: "2026-10-30",
    title: "Standby Diesel Generator Overhaul Filters & AVR Modules",
    itemsSummary: "8 Perkins 100kVA OEM Filter Kits + 2 Automatic Voltage Regulators",
    category: "Electrical & Maintenance",
    campus: "F-8 Islamabad",
    supplierName: "Allied Power & Engineering Works",
    supplierNtn: "6019283-1",
    supplierPhone: "+92 42 36309182",
    supplierBank: "MCB Bank",
    supplierIban: "PK25MCIB0001829304958102",
    orderedQty: 8,
    unit: "Packs",
    grossAmount: 308000,
    gstAmount: 55440,
    whtDeduction: 13860,
    netPayable: 349580,
    paymentTerms: "100% Upon Delivery",
    requestedBy: "Sub-Engr. Rafaqat Ali (Plant Maintenance)",
    approvedBy: "Hamza Tariq (Super Admin)",
    status: "Ordered",
  },
  {
    id: "po-8",
    poNumber: "PO-2610-708",
    grnNumber: "CANCELLED",
    orderDate: "2026-10-08",
    expectedDelivery: "2026-10-15",
    title: "Unbranded Refilled Printer Cartridges Lot (Rejected by QA)",
    itemsSummary: "30 Remanufactured Toner Cartridges — Cancelled in favor of OEM PO-703",
    category: "IT & AV Hardware",
    campus: "Gulberg",
    supplierName: "TechnoSphere Enterprise Solutions",
    supplierNtn: "7492018-9",
    supplierPhone: "+92 51 2874910",
    supplierBank: "United Bank Limited (UBL)",
    supplierIban: "PK19UNIL0109000284910293",
    orderedQty: 30,
    unit: "Cartridges",
    grossAmount: 165000,
    gstAmount: 29700,
    whtDeduction: 7425,
    netPayable: 187275,
    paymentTerms: "Cancelled Before Dispatch",
    requestedBy: "M. Tariq Mehmood (Store Officer)",
    approvedBy: "Quality Assurance Desk",
    status: "Cancelled",
  },
];

export const INITIAL_ISSUANCE_RECORDS: DepartmentalIssuanceRecord[] = [
  {
    id: "iss-1",
    issueVoucherNo: "ISS-2610-501",
    requisitionNo: "REQ-2610-901",
    issueDate: "2026-10-25",
    sku: "INV-SKU-104",
    itemName: "Watermarked Examination Answer Booklets (32-Page)",
    category: "Examination Supplies",
    campus: "Gulberg",
    department: "Examination Controller Cell",
    issuedTo: "Dr. Salman Qureshi (Controller Examinations)",
    issuedBy: "M. Tariq Mehmood",
    quantityIssued: 2500,
    unit: "Booklets",
    unitCost: 65,
    totalValuation: 162500,
    purpose: "Mid-Term Autumn 2026 Examination Secrecy Distribution (Grades 9–12)",
    returnable: false,
    status: "Issued",
  },
  {
    id: "iss-2",
    issueVoucherNo: "ISS-2610-502",
    requisitionNo: "REQ-2610-904",
    issueDate: "2026-10-24",
    sku: "INV-SKU-101",
    itemName: "Double A A4 Copier Paper (80 GSM)",
    category: "Stationery & Printing",
    campus: "Gulberg",
    department: "Paper Generation & Printing Cell",
    issuedTo: "Hafiz Noman Siddiqui (Printing Supervisor)",
    issuedBy: "M. Tariq Mehmood",
    quantityIssued: 80,
    unit: "Reams",
    unitCost: 1450,
    totalValuation: 116000,
    purpose: "Question paper printing for October assessment cycle",
    returnable: false,
    status: "Issued",
  },
  {
    id: "iss-3",
    issueVoucherNo: "ISS-2610-503",
    requisitionNo: "REQ-2610-908",
    issueDate: "2026-10-22",
    sku: "INV-SKU-102",
    itemName: "Olympus CX23 Binocular Microscopes",
    category: "Science Lab Equipment",
    campus: "DHA Phase 5",
    department: "Senior Biology & Life Sciences Lab",
    issuedTo: "Dr. Farzana Waheed (HOD Biology)",
    issuedBy: "Engr. Asim Rauf",
    quantityIssued: 10,
    unit: "Units",
    unitCost: 68500,
    totalValuation: 685000,
    purpose: "Permanent lab bench allocation for A-Level Biology Practical Wing",
    returnable: true,
    status: "Issued",
  },
  {
    id: "iss-4",
    issueVoucherNo: "ISS-2610-504",
    requisitionNo: "REQ-2610-911",
    issueDate: "2026-10-21",
    sku: "INV-SKU-108",
    itemName: "Ubiquiti UniFi Wi-Fi 6 Pro Enterprise Access Points",
    category: "IT & AV Hardware",
    campus: "DHA Phase 5",
    department: "IT & Digital Infrastructure Directorate",
    issuedTo: "Zeeshan Haider (Network Engineer)",
    issuedBy: "Usman Ghani",
    quantityIssued: 6,
    unit: "Units",
    unitCost: 54000,
    totalValuation: 324000,
    purpose: "Digital LMS coverage expansion in Senior Wing Floor 2",
    returnable: true,
    status: "Issued",
  },
  {
    id: "iss-5",
    issueVoucherNo: "ISS-2610-505",
    requisitionNo: "REQ-2610-915",
    issueDate: "2026-10-20",
    sku: "INV-SKU-106",
    itemName: "Single-Student Ergonomic Beechwood Desk & Chair Set",
    category: "Classroom Furniture",
    campus: "Bahria Town",
    department: "Middle School Academic Wing",
    issuedTo: "Mrs. Samina Tariq (Section Head Grades 6–8)",
    issuedBy: "Col. (R) Javed Iqbal",
    quantityIssued: 30,
    unit: "Sets",
    unitCost: 14800,
    totalValuation: 444000,
    purpose: "Seating setup for newly inaugurated Section Grade 8-C",
    returnable: true,
    status: "Issued",
  },
  {
    id: "iss-6",
    issueVoucherNo: "ISS-2610-506",
    requisitionNo: "REQ-2610-919",
    issueDate: "2026-10-18",
    sku: "INV-SKU-109",
    itemName: "CA Pro English Willow Inter-Campus Cricket & Athletics Kits",
    category: "Sports & Athletics",
    campus: "Gulberg",
    department: "Directorate of Physical Education & Sports",
    issuedTo: "Coach Imranullah Khan (Sports Coordinator)",
    issuedBy: "M. Tariq Mehmood",
    quantityIssued: 4,
    unit: "Kits",
    unitCost: 62000,
    totalValuation: 248000,
    purpose: "Issued for Regional Inter-Campus T20 Championship (Returned post-event)",
    returnable: true,
    status: "Returned",
  },
  {
    id: "iss-7",
    issueVoucherNo: "ISS-2610-507",
    requisitionNo: "REQ-2610-923",
    issueDate: "2026-10-25",
    sku: "INV-SKU-103",
    itemName: "Epson EB-E01 3300-Lumen Classroom Projectors",
    category: "IT & AV Hardware",
    campus: "F-8 Islamabad",
    department: "Main Auditorium & Seminar Hall",
    issuedTo: "Bilal Ahmed (AV Coordinator)",
    issuedBy: "Usman Ghani",
    quantityIssued: 2,
    unit: "Units",
    unitCost: 135000,
    totalValuation: 270000,
    purpose: "Pending Principal authorization for Auditorium dual-projection rig",
    returnable: true,
    status: "Pending",
  },
  {
    id: "iss-8",
    issueVoucherNo: "ISS-2610-508",
    requisitionNo: "REQ-2610-926",
    issueDate: "2026-10-23",
    sku: "INV-SKU-111",
    itemName: "Dollar Whiteboard Markers & Duster Classroom Packs",
    category: "Stationery & Printing",
    campus: "Clifton",
    department: "Academic Faculty Staffroom",
    issuedTo: "Ms. Hina Riaz (Academic Coordinator)",
    issuedBy: "M. Tariq Mehmood",
    quantityIssued: 45,
    unit: "Boxes",
    unitCost: 1150,
    totalValuation: 51750,
    purpose: "Monthly classroom consumables distribution for 45 lecture rooms",
    returnable: false,
    status: "Issued",
  },
];

export const INITIAL_SUPPLIERS: InventorySupplierRecord[] = [
  {
    id: "sup-1",
    supplierCode: "SUP-2026-01",
    companyName: "Allied Paper & Stationery Mart",
    category: "Stationery & Printing",
    ntn: "4182910-6",
    strn: "03-04-4182-910-46",
    city: "Lahore",
    contactPerson: "Haji Muhammad Saleem",
    phone: "+92 42 35714820",
    email: "procurement@alliedpaper.com.pk",
    bankName: "Meezan Bank",
    iban: "PK44MEZN0002010104829106",
    paymentTerms: "100% Upon GRN Verification",
    totalOrdersCount: 18,
    totalProcurementValue: 4850000,
    outstandingPayable: 0,
    rating: "4.9 / 5.0",
    status: "Verified",
  },
  {
    id: "sup-2",
    supplierCode: "SUP-2026-02",
    companyName: "Precision Scientific Traders (Pvt) Ltd",
    category: "Science Lab Equipment",
    ntn: "3829104-2",
    strn: "03-01-3829-104-28",
    city: "Lahore",
    contactPerson: "Dr. Arshad Mahmood",
    phone: "+92 42 37239910",
    email: "orders@precisionscientific.pk",
    bankName: "Habib Bank Limited (HBL)",
    iban: "PK88HABB0004527901283901",
    paymentTerms: "Net 15 Days Post-Inspection",
    totalOrdersCount: 11,
    totalProcurementValue: 6420000,
    outstandingPayable: 556150,
    rating: "4.8 / 5.0",
    status: "Verified",
  },
  {
    id: "sup-3",
    supplierCode: "SUP-2026-03",
    companyName: "TechnoSphere Enterprise Solutions",
    category: "IT & AV Hardware",
    ntn: "7492018-9",
    strn: "07-02-7492-018-19",
    city: "Islamabad",
    contactPerson: "Syed Daniyal Raza",
    phone: "+92 51 2874910",
    email: "enterprise@technosphere.com.pk",
    bankName: "United Bank Limited (UBL)",
    iban: "PK19UNIL0109000284910293",
    paymentTerms: "50% Advance / 50% Delivery",
    totalOrdersCount: 14,
    totalProcurementValue: 8940000,
    outstandingPayable: 930700,
    rating: "4.9 / 5.0",
    status: "Verified",
  },
  {
    id: "sup-4",
    supplierCode: "SUP-2026-04",
    companyName: "Interwood Institutional Furnishings",
    category: "Classroom Furniture",
    ntn: "1948271-4",
    strn: "03-09-1948-271-64",
    city: "Lahore",
    contactPerson: "Omer Farooq Sheikh",
    phone: "+92 42 35881920",
    email: "corporate@interwood.pk",
    bankName: "Bank Alfalah",
    iban: "PK62ALFH0029001004928174",
    paymentTerms: "100% Upon GRN Verification",
    totalOrdersCount: 7,
    totalProcurementValue: 5390000,
    outstandingPayable: 0,
    rating: "4.7 / 5.0",
    status: "Verified",
  },
  {
    id: "sup-5",
    supplierCode: "SUP-2026-05",
    companyName: "Sialkot Premier Sports & Gear Co.",
    category: "Sports & Athletics",
    ntn: "5291840-7",
    strn: "04-02-5291-840-55",
    city: "Sialkot",
    contactPerson: "Khawaja Rizwan Anwar",
    phone: "+92 52 4589201",
    email: "sales@sialkotpremiersports.pk",
    bankName: "Askari Bank",
    iban: "PK71ASCM0000921800491827",
    paymentTerms: "100% Upon GRN Verification",
    totalOrdersCount: 6,
    totalProcurementValue: 2150000,
    outstandingPayable: 0,
    rating: "4.8 / 5.0",
    status: "Active",
  },
  {
    id: "sup-6",
    supplierCode: "SUP-2026-06",
    companyName: "Allied Power & Engineering Works",
    category: "Electrical & Maintenance",
    ntn: "6019283-1",
    strn: "03-05-6019-283-12",
    city: "Lahore",
    contactPerson: "Engr. Tahir Mehmood",
    phone: "+92 42 36309182",
    email: "service@alliedpower.com.pk",
    bankName: "MCB Bank",
    iban: "PK25MCIB0001829304958102",
    paymentTerms: "100% Upon Delivery",
    totalOrdersCount: 9,
    totalProcurementValue: 1890000,
    outstandingPayable: 349580,
    rating: "4.7 / 5.0",
    status: "Active",
  },
];
