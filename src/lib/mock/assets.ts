export type FixedAssetCategory =
  | "Power & Solar Plant"
  | "IT & Server Infrastructure"
  | "Smart Classroom AV"
  | "HVAC & Climate Control"
  | "Science Lab Apparatus"
  | "Printing & Secrecy Plant"
  | "Security & Surveillance";

export type FixedAssetStatus = "In Service" | "Under Repair" | "Retired";

export type AssetAllocationStatus = "Assigned" | "Verified" | "Under Repair";

export type AssetMaintenanceStatus =
  | "Completed"
  | "Scheduled"
  | "Due Soon"
  | "Under Repair";

export type DepreciationStatus = "Depreciating" | "Fully Depreciated";

export interface FixedAssetRecord {
  id: string;
  assetTag: string;
  serialNo: string;
  assetName: string;
  specification: string;
  category: FixedAssetCategory;
  campus: string;
  locationRoom: string;
  custodian: string;
  acquisitionDate: string;
  warrantyExpiry: string;
  vendorName: string;
  purchaseCost: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  depreciationRatePct: number;
  usefulLifeYears: number;
  condition: "Excellent" | "Good" | "Requires Service";
  status: FixedAssetStatus;
}

export interface AssetAllocationRecord {
  id: string;
  allocationCode: string;
  assetTag: string;
  assetName: string;
  category: FixedAssetCategory;
  campus: string;
  buildingBlock: string;
  roomOrLab: string;
  department: string;
  assignedCustodian: string;
  custodianDesignation: string;
  assignedDate: string;
  lastAuditDate: string;
  assetValue: number;
  status: AssetAllocationStatus;
}

export interface AssetMaintenanceRecord {
  id: string;
  workOrderNo: string;
  assetTag: string;
  assetName: string;
  category: FixedAssetCategory;
  campus: string;
  maintenanceType:
    | "Quarterly Preventive AMC"
    | "Annual Calibration & QA"
    | "Filter & Coolant Overhaul"
    | "Component Replacement";
  serviceVendor: string;
  technicianName: string;
  vendorPhone: string;
  scheduledDate: string;
  nextDueDate: string;
  serviceCost: number;
  amcCovered: boolean;
  remarks: string;
  status: AssetMaintenanceStatus;
}

export interface AssetDepreciationRecord {
  id: string;
  scheduleCode: string;
  assetTag: string;
  assetName: string;
  category: FixedAssetCategory;
  campus: string;
  depreciationMethod: "Straight-Line (IAS-16)" | "Reducing Balance (WDV)";
  annualRatePct: number;
  usefulLifeYears: number;
  elapsedYears: number;
  historicalCost: number;
  openingAccumulatedDep: number;
  currentYearDepCharge: number;
  closingAccumulatedDep: number;
  salvageValue: number;
  closingNetBookValue: number;
  status: DepreciationStatus;
}

export const INITIAL_FIXED_ASSETS: FixedAssetRecord[] = [
  {
    id: "ast-1",
    assetTag: "AST-2026-101",
    serialNo: "PKN-150KVA-8841",
    assetName: "Perkins 150kVA Prime Acoustic Diesel Generator",
    specification:
      "3-Phase 400V Soundproof Canopy Generator with Auto-Transfer Switch (ATS) Panel",
    category: "Power & Solar Plant",
    campus: "Gulberg",
    locationRoom: "Main Powerhouse Substation · Bay P-01",
    custodian: "Sub-Engr. Rafaqat Ali",
    acquisitionDate: "2024-03-15",
    warrantyExpiry: "2027-03-15",
    vendorName: "Allied Power & Engineering Works",
    purchaseCost: 6850000,
    accumulatedDepreciation: 1370000,
    netBookValue: 5480000,
    depreciationRatePct: 10,
    usefulLifeYears: 10,
    condition: "Excellent",
    status: "In Service",
  },
  {
    id: "ast-2",
    assetTag: "AST-2026-102",
    serialNo: "DLL-R750-49102",
    assetName: "Dell PowerEdge R750 Campus Core Server Cluster",
    specification:
      "Dual Intel Xeon Gold 6338, 512GB ECC RAM, 16TB NVMe RAID-10 Enterprise Rack",
    category: "IT & Server Infrastructure",
    campus: "Gulberg",
    locationRoom: "Central Data Center · Rack DC-01",
    custodian: "Usman Ghani",
    acquisitionDate: "2025-01-10",
    warrantyExpiry: "2028-01-10",
    vendorName: "TechnoSphere Enterprise Solutions",
    purchaseCost: 4200000,
    accumulatedDepreciation: 840000,
    netBookValue: 3360000,
    depreciationRatePct: 20,
    usefulLifeYears: 5,
    condition: "Excellent",
    status: "In Service",
  },
  {
    id: "ast-3",
    assetTag: "AST-2026-103",
    serialNo: "PRM-75UHD-3310",
    assetName: "Promethean ActivPanel 75-Inch 4K Smart Boards (Lot of 12)",
    specification:
      "UHD Interactive Touch Displays with OPS Windows Modules for Senior Wing",
    category: "Smart Classroom AV",
    campus: "DHA Phase 5",
    locationRoom: "Senior Academic Block · Rooms 101–112",
    custodian: "Bilal Ahmed",
    acquisitionDate: "2024-08-20",
    warrantyExpiry: "2027-08-20",
    vendorName: "TechnoSphere Enterprise Solutions",
    purchaseCost: 5400000,
    accumulatedDepreciation: 1620000,
    netBookValue: 3780000,
    depreciationRatePct: 15,
    usefulLifeYears: 7,
    condition: "Excellent",
    status: "In Service",
  },
  {
    id: "ast-4",
    assetTag: "AST-2026-104",
    serialNo: "LNG-50KW-9920",
    assetName: "Longi Hi-MO 6 50kW On-Grid Solar Net-Metering Plant",
    specification:
      "88 Bifacial 580W Panels with Huawei SUN2000-50KTL-M3 Three-Phase Inverter",
    category: "Power & Solar Plant",
    campus: "F-8 Islamabad",
    locationRoom: "Academic Block Rooftop · Array S-01",
    custodian: "Col. (R) Javed Iqbal",
    acquisitionDate: "2024-05-01",
    warrantyExpiry: "2034-05-01",
    vendorName: "Premier Energy & Solar Pakistan",
    purchaseCost: 7500000,
    accumulatedDepreciation: 1500000,
    netBookValue: 6000000,
    depreciationRatePct: 10,
    usefulLifeYears: 12,
    condition: "Excellent",
    status: "In Service",
  },
  {
    id: "ast-5",
    assetTag: "AST-2026-105",
    serialNo: "GRE-24INV-7712",
    assetName: "Gree 2-Ton DC Inverter Split AC Units (Lot of 20)",
    specification:
      "24,000 BTU T3 Tropical Compressor Commercial Classroom Air Conditioners",
    category: "HVAC & Climate Control",
    campus: "Clifton",
    locationRoom: "Main Academic Block · Floors 1 & 2",
    custodian: "Engr. Tahir Mehmood",
    acquisitionDate: "2024-04-12",
    warrantyExpiry: "2027-04-12",
    vendorName: "CoolTech HVAC Engineering Services",
    purchaseCost: 4800000,
    accumulatedDepreciation: 1440000,
    netBookValue: 3360000,
    depreciationRatePct: 15,
    usefulLifeYears: 7,
    condition: "Good",
    status: "In Service",
  },
  {
    id: "ast-6",
    assetTag: "AST-2026-106",
    serialNo: "KM-BZH650-1190",
    assetName: "Konica Minolta Bizhub 650i High-Speed Secrecy Exam Press",
    specification:
      "65 PPM Heavy-Duty Digital Production Printer with Finisher & Booklet Stapler",
    category: "Printing & Secrecy Plant",
    campus: "Gulberg",
    locationRoom: "Examination Secrecy Strongroom · Vault S-02",
    custodian: "Dr. Salman Qureshi",
    acquisitionDate: "2023-11-18",
    warrantyExpiry: "2026-11-18",
    vendorName: "Office Automation Group Pakistan",
    purchaseCost: 2650000,
    accumulatedDepreciation: 1192500,
    netBookValue: 1457500,
    depreciationRatePct: 15,
    usefulLifeYears: 6,
    condition: "Requires Service",
    status: "Under Repair",
  },
  {
    id: "ast-7",
    assetTag: "AST-2026-107",
    serialNo: "NKN-E200-5504",
    assetName: "Nikon Eclipse E200 Trinocular Digital Lab Microscopes (Lot of 10)",
    specification:
      "CFI60 Infinity Optical System with 5MP HDMI Digital Projection Camera",
    category: "Science Lab Apparatus",
    campus: "Bahria Town",
    locationRoom: "A-Level Research Biology Lab · Wing B",
    custodian: "Engr. Asim Rauf",
    acquisitionDate: "2025-02-14",
    warrantyExpiry: "2028-02-14",
    vendorName: "Precision Scientific Traders (Pvt) Ltd",
    purchaseCost: 3100000,
    accumulatedDepreciation: 465000,
    netBookValue: 2635000,
    depreciationRatePct: 15,
    usefulLifeYears: 8,
    condition: "Excellent",
    status: "In Service",
  },
  {
    id: "ast-8",
    assetTag: "AST-2026-108",
    serialNo: "HIK-64NVR-8821",
    assetName: "Hikvision 64-Channel 4K IP CCTV Security & AI Command Matrix",
    specification:
      "64 Dome/Bullet PoE IP Cameras, 32TB Enterprise NVR & Control Room Video Wall",
    category: "Security & Surveillance",
    campus: "DHA Phase 5",
    locationRoom: "Campus Security Command Room · Gate 1",
    custodian: "Major (R) Tariq Aziz",
    acquisitionDate: "2024-09-01",
    warrantyExpiry: "2027-09-01",
    vendorName: "SecureNet Surveillance Systems",
    purchaseCost: 2950000,
    accumulatedDepreciation: 885000,
    netBookValue: 2065000,
    depreciationRatePct: 15,
    usefulLifeYears: 6,
    condition: "Excellent",
    status: "In Service",
  },
];

export const INITIAL_ASSET_ALLOCATIONS: AssetAllocationRecord[] = [
  {
    id: "alc-1",
    allocationCode: "ALC-2610-301",
    assetTag: "AST-2026-101",
    assetName: "Perkins 150kVA Prime Acoustic Diesel Generator",
    category: "Power & Solar Plant",
    campus: "Gulberg",
    buildingBlock: "Main Utility & Engineering Compound",
    roomOrLab: "Powerhouse Substation · Bay P-01",
    department: "Facilities & Estate Engineering",
    assignedCustodian: "Sub-Engr. Rafaqat Ali",
    custodianDesignation: "Chief Electrical Supervisor",
    assignedDate: "2024-03-18",
    lastAuditDate: "2026-10-15",
    assetValue: 5480000,
    status: "Verified",
  },
  {
    id: "alc-2",
    allocationCode: "ALC-2610-302",
    assetTag: "AST-2026-102",
    assetName: "Dell PowerEdge R750 Campus Core Server Cluster",
    category: "IT & Server Infrastructure",
    campus: "Gulberg",
    buildingBlock: "Admin & Central IT Tower",
    roomOrLab: "Data Center Vault · Rack DC-01",
    department: "IT & Digital Infrastructure Directorate",
    assignedCustodian: "Usman Ghani",
    custodianDesignation: "Head of IT Infrastructure",
    assignedDate: "2025-01-12",
    lastAuditDate: "2026-10-20",
    assetValue: 3360000,
    status: "Verified",
  },
  {
    id: "alc-3",
    allocationCode: "ALC-2610-303",
    assetTag: "AST-2026-103",
    assetName: "Promethean ActivPanel 75-Inch 4K Smart Boards (Lot of 12)",
    category: "Smart Classroom AV",
    campus: "DHA Phase 5",
    buildingBlock: "Senior Academic Block",
    roomOrLab: "Lecture Halls 101 to 112",
    department: "Senior School Academic Council",
    assignedCustodian: "Bilal Ahmed",
    custodianDesignation: "Multimedia & AV Coordinator",
    assignedDate: "2024-08-25",
    lastAuditDate: "2026-10-18",
    assetValue: 3780000,
    status: "Assigned",
  },
  {
    id: "alc-4",
    allocationCode: "ALC-2610-304",
    assetTag: "AST-2026-104",
    assetName: "Longi Hi-MO 6 50kW On-Grid Solar Net-Metering Plant",
    category: "Power & Solar Plant",
    campus: "F-8 Islamabad",
    buildingBlock: "Main Academic Block Rooftop",
    roomOrLab: "Solar Array Zone S-01 & Inverter Room",
    department: "Estate & Energy Conservation Wing",
    assignedCustodian: "Col. (R) Javed Iqbal",
    custodianDesignation: "Director Estate & Operations",
    assignedDate: "2024-05-05",
    lastAuditDate: "2026-10-22",
    assetValue: 6000000,
    status: "Verified",
  },
  {
    id: "alc-5",
    allocationCode: "ALC-2610-305",
    assetTag: "AST-2026-105",
    assetName: "Gree 2-Ton DC Inverter Split AC Units (Lot of 20)",
    category: "HVAC & Climate Control",
    campus: "Clifton",
    buildingBlock: "Main Academic Wing",
    roomOrLab: "Classrooms Floor 1 & Floor 2",
    department: "Campus Administration & Facilities",
    assignedCustodian: "Engr. Tahir Mehmood",
    custodianDesignation: "HVAC Maintenance Engineer",
    assignedDate: "2024-04-15",
    lastAuditDate: "2026-10-10",
    assetValue: 3360000,
    status: "Assigned",
  },
  {
    id: "alc-6",
    allocationCode: "ALC-2610-306",
    assetTag: "AST-2026-106",
    assetName: "Konica Minolta Bizhub 650i High-Speed Secrecy Exam Press",
    category: "Printing & Secrecy Plant",
    campus: "Gulberg",
    buildingBlock: "Examination Controller Block",
    roomOrLab: "Secrecy Strongroom · Vault S-02",
    department: "Examination & Paper Generation Cell",
    assignedCustodian: "Dr. Salman Qureshi",
    custodianDesignation: "Controller of Examinations",
    assignedDate: "2023-11-20",
    lastAuditDate: "2026-10-24",
    assetValue: 1457500,
    status: "Under Repair",
  },
  {
    id: "alc-7",
    allocationCode: "ALC-2610-307",
    assetTag: "AST-2026-107",
    assetName: "Nikon Eclipse E200 Trinocular Digital Lab Microscopes (Lot of 10)",
    category: "Science Lab Apparatus",
    campus: "Bahria Town",
    buildingBlock: "Science & Innovation Wing",
    roomOrLab: "A-Level Biology Research Lab",
    department: "Department of Biological Sciences",
    assignedCustodian: "Engr. Asim Rauf",
    custodianDesignation: "Chief Lab Coordinator",
    assignedDate: "2025-02-18",
    lastAuditDate: "2026-10-19",
    assetValue: 2635000,
    status: "Verified",
  },
  {
    id: "alc-8",
    allocationCode: "ALC-2610-308",
    assetTag: "AST-2026-108",
    assetName: "Hikvision 64-Channel 4K IP CCTV Security & AI Command Matrix",
    category: "Security & Surveillance",
    campus: "DHA Phase 5",
    buildingBlock: "Main Perimeter Gatehouse",
    roomOrLab: "Security Command Center · Room G-01",
    department: "Campus Security & Vigilance",
    assignedCustodian: "Major (R) Tariq Aziz",
    custodianDesignation: "Chief Security Officer",
    assignedDate: "2024-09-05",
    lastAuditDate: "2026-10-21",
    assetValue: 2065000,
    status: "Verified",
  },
];

export const INITIAL_ASSET_MAINTENANCE: AssetMaintenanceRecord[] = [
  {
    id: "amc-1",
    workOrderNo: "AMC-2610-601",
    assetTag: "AST-2026-101",
    assetName: "Perkins 150kVA Prime Acoustic Diesel Generator",
    category: "Power & Solar Plant",
    campus: "Gulberg",
    maintenanceType: "Filter & Coolant Overhaul",
    serviceVendor: "Allied Power & Engineering Works",
    technicianName: "Engr. Naveed Anwar",
    vendorPhone: "+92 42 36309182",
    scheduledDate: "2026-10-18",
    nextDueDate: "2027-01-18",
    serviceCost: 48500,
    amcCovered: true,
    remarks: "250-Hour oil, fuel filter, air breather replacement & load bank test completed.",
    status: "Completed",
  },
  {
    id: "amc-2",
    workOrderNo: "AMC-2610-602",
    assetTag: "AST-2026-106",
    assetName: "Konica Minolta Bizhub 650i High-Speed Secrecy Exam Press",
    category: "Printing & Secrecy Plant",
    campus: "Gulberg",
    maintenanceType: "Component Replacement",
    serviceVendor: "Office Automation Group Pakistan",
    technicianName: "M. Kashif Siddiqui",
    vendorPhone: "+92 42 35761920",
    scheduledDate: "2026-10-25",
    nextDueDate: "2027-01-25",
    serviceCost: 64000,
    amcCovered: false,
    remarks: "Fuser drum unit & high-speed paper feed rollers replacement prior to Mid-Term print run.",
    status: "Under Repair",
  },
  {
    id: "amc-3",
    workOrderNo: "AMC-2610-603",
    assetTag: "AST-2026-104",
    assetName: "Longi Hi-MO 6 50kW On-Grid Solar Net-Metering Plant",
    category: "Power & Solar Plant",
    campus: "F-8 Islamabad",
    maintenanceType: "Quarterly Preventive AMC",
    serviceVendor: "Premier Energy & Solar Pakistan",
    technicianName: "Engr. Haris Mehmood",
    vendorPhone: "+92 51 2829104",
    scheduledDate: "2026-10-20",
    nextDueDate: "2027-01-20",
    serviceCost: 22000,
    amcCovered: true,
    remarks: "Thermographic panel inspection, inverter string testing & deionized array washing.",
    status: "Completed",
  },
  {
    id: "amc-4",
    workOrderNo: "AMC-2610-604",
    assetTag: "AST-2026-105",
    assetName: "Gree 2-Ton DC Inverter Split AC Units (Lot of 20)",
    category: "HVAC & Climate Control",
    campus: "Clifton",
    maintenanceType: "Quarterly Preventive AMC",
    serviceVendor: "CoolTech HVAC Engineering Services",
    technicianName: "Ustad Rashid Khan",
    vendorPhone: "+92 21 35849102",
    scheduledDate: "2026-10-29",
    nextDueDate: "2027-02-28",
    serviceCost: 40000,
    amcCovered: true,
    remarks: "R-410A refrigerant pressure check, condenser coil jet service & filter sanitization.",
    status: "Due Soon",
  },
  {
    id: "amc-5",
    workOrderNo: "AMC-2610-605",
    assetTag: "AST-2026-102",
    assetName: "Dell PowerEdge R750 Campus Core Server Cluster",
    category: "IT & Server Infrastructure",
    campus: "Gulberg",
    maintenanceType: "Annual Calibration & QA",
    serviceVendor: "TechnoSphere Enterprise Solutions",
    technicianName: "Syed Daniyal Raza",
    vendorPhone: "+92 51 2874910",
    scheduledDate: "2026-11-05",
    nextDueDate: "2027-05-05",
    serviceCost: 35000,
    amcCovered: true,
    remarks: "iDRAC firmware security patch, RAID array health scrub & redundant PSU failover test.",
    status: "Scheduled",
  },
  {
    id: "amc-6",
    workOrderNo: "AMC-2610-606",
    assetTag: "AST-2026-107",
    assetName: "Nikon Eclipse E200 Trinocular Digital Lab Microscopes (Lot of 10)",
    category: "Science Lab Apparatus",
    campus: "Bahria Town",
    maintenanceType: "Annual Calibration & QA",
    serviceVendor: "Precision Scientific Traders (Pvt) Ltd",
    technicianName: "Dr. Arshad Mahmood",
    vendorPhone: "+92 42 37239910",
    scheduledDate: "2026-10-14",
    nextDueDate: "2027-04-14",
    serviceCost: 28000,
    amcCovered: true,
    remarks: "Optical alignment, anti-fungal objective lens treatment & stage micrometer calibration.",
    status: "Completed",
  },
];

export const INITIAL_ASSET_DEPRECIATION: AssetDepreciationRecord[] = [
  {
    id: "dep-1",
    scheduleCode: "DEP-AY26-801",
    assetTag: "AST-2026-101",
    assetName: "Perkins 150kVA Prime Acoustic Diesel Generator",
    category: "Power & Solar Plant",
    campus: "Gulberg",
    depreciationMethod: "Straight-Line (IAS-16)",
    annualRatePct: 10,
    usefulLifeYears: 10,
    elapsedYears: 2,
    historicalCost: 6850000,
    openingAccumulatedDep: 685000,
    currentYearDepCharge: 685000,
    closingAccumulatedDep: 1370000,
    salvageValue: 685000,
    closingNetBookValue: 5480000,
    status: "Depreciating",
  },
  {
    id: "dep-2",
    scheduleCode: "DEP-AY26-802",
    assetTag: "AST-2026-102",
    assetName: "Dell PowerEdge R750 Campus Core Server Cluster",
    category: "IT & Server Infrastructure",
    campus: "Gulberg",
    depreciationMethod: "Straight-Line (IAS-16)",
    annualRatePct: 20,
    usefulLifeYears: 5,
    elapsedYears: 1,
    historicalCost: 4200000,
    openingAccumulatedDep: 0,
    currentYearDepCharge: 840000,
    closingAccumulatedDep: 840000,
    salvageValue: 420000,
    closingNetBookValue: 3360000,
    status: "Depreciating",
  },
  {
    id: "dep-3",
    scheduleCode: "DEP-AY26-803",
    assetTag: "AST-2026-103",
    assetName: "Promethean ActivPanel 75-Inch 4K Smart Boards (Lot of 12)",
    category: "Smart Classroom AV",
    campus: "DHA Phase 5",
    depreciationMethod: "Reducing Balance (WDV)",
    annualRatePct: 15,
    usefulLifeYears: 7,
    elapsedYears: 2,
    historicalCost: 5400000,
    openingAccumulatedDep: 810000,
    currentYearDepCharge: 810000,
    closingAccumulatedDep: 1620000,
    salvageValue: 540000,
    closingNetBookValue: 3780000,
    status: "Depreciating",
  },
  {
    id: "dep-4",
    scheduleCode: "DEP-AY26-804",
    assetTag: "AST-2026-104",
    assetName: "Longi Hi-MO 6 50kW On-Grid Solar Net-Metering Plant",
    category: "Power & Solar Plant",
    campus: "F-8 Islamabad",
    depreciationMethod: "Straight-Line (IAS-16)",
    annualRatePct: 10,
    usefulLifeYears: 12,
    elapsedYears: 2,
    historicalCost: 7500000,
    openingAccumulatedDep: 750000,
    currentYearDepCharge: 750000,
    closingAccumulatedDep: 1500000,
    salvageValue: 750000,
    closingNetBookValue: 6000000,
    status: "Depreciating",
  },
  {
    id: "dep-5",
    scheduleCode: "DEP-AY26-805",
    assetTag: "AST-2026-105",
    assetName: "Gree 2-Ton DC Inverter Split AC Units (Lot of 20)",
    category: "HVAC & Climate Control",
    campus: "Clifton",
    depreciationMethod: "Reducing Balance (WDV)",
    annualRatePct: 15,
    usefulLifeYears: 7,
    elapsedYears: 2,
    historicalCost: 4800000,
    openingAccumulatedDep: 720000,
    currentYearDepCharge: 720000,
    closingAccumulatedDep: 1440000,
    salvageValue: 480000,
    closingNetBookValue: 3360000,
    status: "Depreciating",
  },
  {
    id: "dep-6",
    scheduleCode: "DEP-AY26-806",
    assetTag: "AST-2026-106",
    assetName: "Konica Minolta Bizhub 650i High-Speed Secrecy Exam Press",
    category: "Printing & Secrecy Plant",
    campus: "Gulberg",
    depreciationMethod: "Straight-Line (IAS-16)",
    annualRatePct: 15,
    usefulLifeYears: 6,
    elapsedYears: 3,
    historicalCost: 2650000,
    openingAccumulatedDep: 795000,
    currentYearDepCharge: 397500,
    closingAccumulatedDep: 1192500,
    salvageValue: 265000,
    closingNetBookValue: 1457500,
    status: "Depreciating",
  },
  {
    id: "dep-7",
    scheduleCode: "DEP-AY26-807",
    assetTag: "AST-2026-107",
    assetName: "Nikon Eclipse E200 Trinocular Digital Lab Microscopes (Lot of 10)",
    category: "Science Lab Apparatus",
    campus: "Bahria Town",
    depreciationMethod: "Straight-Line (IAS-16)",
    annualRatePct: 15,
    usefulLifeYears: 8,
    elapsedYears: 1,
    historicalCost: 3100000,
    openingAccumulatedDep: 0,
    currentYearDepCharge: 465000,
    closingAccumulatedDep: 465000,
    salvageValue: 310000,
    closingNetBookValue: 2635000,
    status: "Depreciating",
  },
  {
    id: "dep-8",
    scheduleCode: "DEP-AY26-808",
    assetTag: "AST-2026-108",
    assetName: "Hikvision 64-Channel 4K IP CCTV Security & AI Command Matrix",
    category: "Security & Surveillance",
    campus: "DHA Phase 5",
    depreciationMethod: "Reducing Balance (WDV)",
    annualRatePct: 15,
    usefulLifeYears: 6,
    elapsedYears: 2,
    historicalCost: 2950000,
    openingAccumulatedDep: 442500,
    currentYearDepCharge: 442500,
    closingAccumulatedDep: 885000,
    salvageValue: 295000,
    closingNetBookValue: 2065000,
    status: "Depreciating",
  },
];
