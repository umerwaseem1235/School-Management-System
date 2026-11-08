/* ────────────────────────────────────────────────────────────────────────── */
/*  Hostel Management — domain types & seed data                              */
/* ────────────────────────────────────────────────────────────────────────── */

export type HostelBuildingType = "Boys" | "Girls";
export type HostelRoomType = "Single" | "Twin" | "Triple" | "Quad" | "Dormitory";
export type HostelRoomStatus = "Available" | "Full" | "Maintenance";
export type HostelResidentStatus = "Active" | "Checked Out" | "Waitlisted";
export type HostelWardenRole = "Chief Warden" | "Warden" | "Assistant Warden";
export type HostelWardenShift = "Day" | "Night" | "Resident";
export type HostelWardenStatus = "On Duty" | "Off Duty" | "On Leave";
export type HostelAttendanceStatus = "Present" | "Absent" | "Late" | "On Leave";
export type HostelVisitorStatus = "Approved" | "Checked Out" | "Pending";

export interface HostelBuildingRecord {
  id: string;
  code: string;
  name: string;
  type: HostelBuildingType;
  campus: string;
  address: string;
  wardenId: string;
  floors: number;
  establishedYear: number;
  facilities: string[];
}

export interface HostelRoomRecord {
  id: string;
  roomNo: string;
  buildingId: string;
  buildingName: string;
  floor: number;
  roomType: HostelRoomType;
  capacity: number;
  monthlyFee: number;
  maintenance: boolean;
  notes?: string;
}

export interface HostelAllocationRecord {
  id: string;
  allocationCode: string;
  studentName: string;
  studentRollNo: string;
  className: string;
  buildingId: string;
  buildingName: string;
  roomId: string;
  roomNo: string;
  bedNo: string;
  roomType: HostelRoomType | "";
  checkInDate: string;
  status: HostelResidentStatus;
  monthlyFee: number;
  messPlanId: string;
  guardianPhone: string;
}

export interface HostelWardenRecord {
  id: string;
  wardenCode: string;
  name: string;
  role: HostelWardenRole;
  buildingId: string;
  buildingName: string;
  shift: HostelWardenShift;
  phone: string;
  email: string;
  joinedDate: string;
  status: HostelWardenStatus;
}

export interface HostelMessPlanRecord {
  id: string;
  planCode: string;
  planName: string;
  buildingId: string;
  buildingName: string;
  vendor: string;
  monthlyRate: number;
  meals: string[];
  serviceDays: number;
  status: "Active" | "Paused";
}

export interface HostelAttendanceRecord {
  id: string;
  date: string;
  studentName: string;
  studentRollNo: string;
  buildingName: string;
  roomNo: string;
  status: HostelAttendanceStatus;
  checkInTime: string;
  remarks?: string;
}

export interface HostelVisitorRecord {
  id: string;
  visitorName: string;
  phone: string;
  cnic: string;
  residentName: string;
  residentRollNo: string;
  buildingName: string;
  roomNo: string;
  relationship: string;
  purpose: string;
  visitDate: string;
  checkInTime: string;
  checkOutTime?: string;
  status: HostelVisitorStatus;
}

export interface HostelStudentDirectoryEntry {
  id: string;
  name: string;
  rollNo: string;
  className: string;
  gender: HostelBuildingType;
}

export const HOSTEL_BUILDING_TYPES: HostelBuildingType[] = ["Boys", "Girls"];

export const HOSTEL_ROOM_TYPES: HostelRoomType[] = [
  "Single",
  "Twin",
  "Triple",
  "Quad",
  "Dormitory",
];

export const HOSTEL_MEAL_OPTIONS = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Evening Snack",
] as const;

export const HOSTEL_FACILITY_OPTIONS = [
  "Wi-Fi",
  "Laundry",
  "Study Hall",
  "Generator Backup",
  "CCTV",
  "Medical Room",
  "Sports Lounge",
  "Hot Water",
  "Housekeeping",
] as const;

export const HOSTEL_CAMPUSES = [
  "Main Campus",
  "DHA Phase 5",
  "F-8 Islamabad",
  "Clifton Karachi",
] as const;

/* ───────────────────────── Buildings ───────────────────────── */

export const HOSTEL_BUILDINGS: HostelBuildingRecord[] = [
  {
    id: "bld-1",
    code: "AHB",
    name: "Al-Biruni Boys Hostel",
    type: "Boys",
    campus: "Main Campus",
    address: "Gate 2, Gulberg Campus, Lahore",
    wardenId: "wdn-1",
    floors: 3,
    establishedYear: 2018,
    facilities: [
      "Wi-Fi",
      "Laundry",
      "Study Hall",
      "Generator Backup",
      "CCTV",
    ],
  },
  {
    id: "bld-2",
    code: "FJH",
    name: "Fatima Jinnah Girls Hostel",
    type: "Girls",
    campus: "Main Campus",
    address: "Gate 4, Gulberg Campus, Lahore",
    wardenId: "wdn-2",
    floors: 3,
    establishedYear: 2019,
    facilities: [
      "Wi-Fi",
      "Laundry",
      "Study Hall",
      "Medical Room",
      "CCTV",
    ],
  },
  {
    id: "bld-3",
    code: "ISH",
    name: "Ibn-e-Sina Boys Hostel",
    type: "Boys",
    campus: "DHA Phase 5",
    address: "Sector C, DHA Phase 5, Lahore",
    wardenId: "wdn-3",
    floors: 2,
    establishedYear: 2022,
    facilities: [
      "Wi-Fi",
      "Laundry",
      "Sports Lounge",
      "Generator Backup",
      "CCTV",
    ],
  },
  {
    id: "bld-4",
    code: "ZGH",
    name: "Zainab Girls Hostel",
    type: "Girls",
    campus: "Clifton Karachi",
    address: "Block 5, Clifton, Karachi",
    wardenId: "wdn-4",
    floors: 2,
    establishedYear: 2023,
    facilities: [
      "Wi-Fi",
      "Laundry",
      "Study Hall",
      "Hot Water",
      "Housekeeping",
    ],
  },
];

/* ───────────────────────── Rooms ───────────────────────── */

export const HOSTEL_ROOMS: HostelRoomRecord[] = [
  {
    id: "room-101",
    roomNo: "A-101",
    buildingId: "bld-1",
    buildingName: "Al-Biruni Boys Hostel",
    floor: 1,
    roomType: "Quad",
    capacity: 4,
    monthlyFee: 18000,
    maintenance: false,
  },
  {
    id: "room-102",
    roomNo: "A-102",
    buildingId: "bld-1",
    buildingName: "Al-Biruni Boys Hostel",
    floor: 1,
    roomType: "Quad",
    capacity: 4,
    monthlyFee: 18000,
    maintenance: false,
  },
  {
    id: "room-103",
    roomNo: "A-103",
    buildingId: "bld-1",
    buildingName: "Al-Biruni Boys Hostel",
    floor: 2,
    roomType: "Triple",
    capacity: 3,
    monthlyFee: 21000,
    maintenance: false,
  },
  {
    id: "room-104",
    roomNo: "A-104",
    buildingId: "bld-1",
    buildingName: "Al-Biruni Boys Hostel",
    floor: 2,
    roomType: "Twin",
    capacity: 2,
    monthlyFee: 26000,
    maintenance: false,
  },
  {
    id: "room-105",
    roomNo: "A-105",
    buildingId: "bld-1",
    buildingName: "Al-Biruni Boys Hostel",
    floor: 3,
    roomType: "Dormitory",
    capacity: 6,
    monthlyFee: 15000,
    maintenance: false,
  },
  {
    id: "room-201",
    roomNo: "B-101",
    buildingId: "bld-2",
    buildingName: "Fatima Jinnah Girls Hostel",
    floor: 1,
    roomType: "Quad",
    capacity: 4,
    monthlyFee: 18500,
    maintenance: false,
  },
  {
    id: "room-202",
    roomNo: "B-102",
    buildingId: "bld-2",
    buildingName: "Fatima Jinnah Girls Hostel",
    floor: 1,
    roomType: "Quad",
    capacity: 4,
    monthlyFee: 18500,
    maintenance: false,
  },
  {
    id: "room-203",
    roomNo: "B-201",
    buildingId: "bld-2",
    buildingName: "Fatima Jinnah Girls Hostel",
    floor: 2,
    roomType: "Triple",
    capacity: 3,
    monthlyFee: 21500,
    maintenance: false,
  },
  {
    id: "room-204",
    roomNo: "B-202",
    buildingId: "bld-2",
    buildingName: "Fatima Jinnah Girls Hostel",
    floor: 2,
    roomType: "Twin",
    capacity: 2,
    monthlyFee: 26500,
    maintenance: false,
  },
  {
    id: "room-205",
    roomNo: "B-203",
    buildingId: "bld-2",
    buildingName: "Fatima Jinnah Girls Hostel",
    floor: 3,
    roomType: "Dormitory",
    capacity: 6,
    monthlyFee: 15500,
    maintenance: false,
  },
  {
    id: "room-301",
    roomNo: "C-101",
    buildingId: "bld-3",
    buildingName: "Ibn-e-Sina Boys Hostel",
    floor: 1,
    roomType: "Quad",
    capacity: 4,
    monthlyFee: 17000,
    maintenance: false,
  },
  {
    id: "room-302",
    roomNo: "C-102",
    buildingId: "bld-3",
    buildingName: "Ibn-e-Sina Boys Hostel",
    floor: 1,
    roomType: "Quad",
    capacity: 4,
    monthlyFee: 17000,
    maintenance: false,
  },
  {
    id: "room-303",
    roomNo: "C-201",
    buildingId: "bld-3",
    buildingName: "Ibn-e-Sina Boys Hostel",
    floor: 2,
    roomType: "Triple",
    capacity: 3,
    monthlyFee: 20000,
    maintenance: false,
  },
  {
    id: "room-304",
    roomNo: "C-202",
    buildingId: "bld-3",
    buildingName: "Ibn-e-Sina Boys Hostel",
    floor: 2,
    roomType: "Twin",
    capacity: 2,
    monthlyFee: 24500,
    maintenance: false,
  },
  {
    id: "room-305",
    roomNo: "C-203",
    buildingId: "bld-3",
    buildingName: "Ibn-e-Sina Boys Hostel",
    floor: 2,
    roomType: "Dormitory",
    capacity: 6,
    monthlyFee: 14000,
    maintenance: true,
    notes: "Bathroom renovation — expected back in service 18 Nov 2026.",
  },
  {
    id: "room-401",
    roomNo: "D-101",
    buildingId: "bld-4",
    buildingName: "Zainab Girls Hostel",
    floor: 1,
    roomType: "Quad",
    capacity: 4,
    monthlyFee: 19500,
    maintenance: false,
  },
  {
    id: "room-402",
    roomNo: "D-102",
    buildingId: "bld-4",
    buildingName: "Zainab Girls Hostel",
    floor: 1,
    roomType: "Quad",
    capacity: 4,
    monthlyFee: 19500,
    maintenance: false,
  },
  {
    id: "room-403",
    roomNo: "D-201",
    buildingId: "bld-4",
    buildingName: "Zainab Girls Hostel",
    floor: 2,
    roomType: "Triple",
    capacity: 3,
    monthlyFee: 22500,
    maintenance: false,
  },
  {
    id: "room-404",
    roomNo: "D-202",
    buildingId: "bld-4",
    buildingName: "Zainab Girls Hostel",
    floor: 2,
    roomType: "Twin",
    capacity: 2,
    monthlyFee: 27500,
    maintenance: false,
  },
  {
    id: "room-405",
    roomNo: "D-203",
    buildingId: "bld-4",
    buildingName: "Zainab Girls Hostel",
    floor: 3,
    roomType: "Dormitory",
    capacity: 6,
    monthlyFee: 16000,
    maintenance: false,
  },
];

/* ───────────────────────── Wardens ───────────────────────── */

export const HOSTEL_WARDENS: HostelWardenRecord[] = [
  {
    id: "wdn-1",
    wardenCode: "WDN-01",
    name: "Muhammad Imran Khalid",
    role: "Chief Warden",
    buildingId: "bld-1",
    buildingName: "Al-Biruni Boys Hostel",
    shift: "Resident",
    phone: "0300-8461207",
    email: "imran.khalid@opus.edu.pk",
    joinedDate: "2018-08-01",
    status: "On Duty",
  },
  {
    id: "wdn-2",
    wardenCode: "WDN-02",
    name: "Saira Yousaf",
    role: "Chief Warden",
    buildingId: "bld-2",
    buildingName: "Fatima Jinnah Girls Hostel",
    shift: "Resident",
    phone: "0321-7745093",
    email: "saira.yousaf@opus.edu.pk",
    joinedDate: "2019-07-15",
    status: "On Duty",
  },
  {
    id: "wdn-3",
    wardenCode: "WDN-03",
    name: "Adnan Rauf",
    role: "Warden",
    buildingId: "bld-3",
    buildingName: "Ibn-e-Sina Boys Hostel",
    shift: "Night",
    phone: "0333-6189045",
    email: "adnan.rauf@opus.edu.pk",
    joinedDate: "2022-04-11",
    status: "On Duty",
  },
  {
    id: "wdn-4",
    wardenCode: "WDN-04",
    name: "Hina Farooq",
    role: "Chief Warden",
    buildingId: "bld-4",
    buildingName: "Zainab Girls Hostel",
    shift: "Resident",
    phone: "0345-2298140",
    email: "hina.farooq@opus.edu.pk",
    joinedDate: "2023-02-06",
    status: "On Duty",
  },
  {
    id: "wdn-5",
    wardenCode: "WDN-05",
    name: "Rabia Nadeem",
    role: "Assistant Warden",
    buildingId: "bld-2",
    buildingName: "Fatima Jinnah Girls Hostel",
    shift: "Day",
    phone: "0302-9914478",
    email: "rabia.nadeem@opus.edu.pk",
    joinedDate: "2021-09-20",
    status: "On Leave",
  },
  {
    id: "wdn-6",
    wardenCode: "WDN-06",
    name: "Kamran Shah",
    role: "Assistant Warden",
    buildingId: "bld-1",
    buildingName: "Al-Biruni Boys Hostel",
    shift: "Night",
    phone: "0311-4027865",
    email: "kamran.shah@opus.edu.pk",
    joinedDate: "2020-11-03",
    status: "Off Duty",
  },
];

/* ───────────────────────── Mess plans ───────────────────────── */

export const HOSTEL_MESS_PLANS: HostelMessPlanRecord[] = [
  {
    id: "mess-1",
    planCode: "MESS-01",
    planName: "Standard Boys Mess — Al-Biruni",
    buildingId: "bld-1",
    buildingName: "Al-Biruni Boys Hostel",
    vendor: "Crescent Caterers",
    monthlyRate: 9500,
    meals: ["Breakfast", "Lunch", "Dinner"],
    serviceDays: 30,
    status: "Active",
  },
  {
    id: "mess-2",
    planCode: "MESS-02",
    planName: "Standard Girls Mess — Fatima Jinnah",
    buildingId: "bld-2",
    buildingName: "Fatima Jinnah Girls Hostel",
    vendor: "Al-Noor Kitchen",
    monthlyRate: 9200,
    meals: ["Breakfast", "Lunch", "Dinner"],
    serviceDays: 30,
    status: "Active",
  },
  {
    id: "mess-3",
    planCode: "MESS-03",
    planName: "Premium Boys Mess — Ibn-e-Sina",
    buildingId: "bld-3",
    buildingName: "Ibn-e-Sina Boys Hostel",
    vendor: "Royal Feast Caterers",
    monthlyRate: 12500,
    meals: ["Breakfast", "Lunch", "Dinner", "Evening Snack"],
    serviceDays: 30,
    status: "Active",
  },
  {
    id: "mess-4",
    planCode: "MESS-04",
    planName: "Premium Girls Mess — Zainab",
    buildingId: "bld-4",
    buildingName: "Zainab Girls Hostel",
    vendor: "Homely Bites",
    monthlyRate: 11800,
    meals: ["Breakfast", "Lunch", "Dinner", "Evening Snack"],
    serviceDays: 30,
    status: "Active",
  },
];

/* ───────────────────────── Residents & allocations ───────────────────────── */

/** Deliberately ordered by building so generated rooms stay single-gender. */
const ACTIVE_RESIDENT_NAMES = [
  // Al-Biruni Boys Hostel — 15 residents
  "Ahmed Raza Khan",
  "Muhammad Rayyan Ali",
  "Hamza Tariq Mehmood",
  "Abdullah Bin Usman",
  "Saad Salman Qureshi",
  "Ibrahim Khawaja",
  "Hassan Ali Raza",
  "Usman Ghani",
  "Bilal Ahmed",
  "Umer Farooq",
  "Talha Javed",
  "Ali Hamza",
  "Fahad Mustafa",
  "Daniyal Qureshi",
  "Awais Raza",
  // Fatima Jinnah Girls Hostel — 14 residents
  "Zainab Fatima",
  "Ayesha Siddiqa",
  "Fatima Noor Sheikh",
  "Hania Bilal Chaudhry",
  "Maryam Jahangir",
  "Eman Waqar Bajwa",
  "Areeba Nadeem",
  "Laiba Aslam",
  "Amna Tariq",
  "Zara Sheikh",
  "Iqra Butt",
  "Nimra Shahid",
  "Rida Batool",
  "Sana Malik",
  // Ibn-e-Sina Boys Hostel — 11 residents
  "Arsalan Khan",
  "Shahzaib Akram",
  "Sameer Abbas",
  "Haris Nadeem",
  "Zohaib Hassan",
  "Yousaf Jamal",
  "Moiz Ahmed",
  "Rehan Butt",
  "Nazim Hussain",
  "Ayan Sadiq",
  "Farhan Iqbal",
  // Zainab Girls Hostel — 13 residents
  "Mehwish Anwar",
  "Komal Farooq",
  "Hira Naeem",
  "Anam Zahid",
  "Rabia Saleem",
  "Aiman Riaz",
  "Alina Shafiq",
  "Samina Yousaf",
  "Hadia Mansoor",
  "Eshaal Tariq",
  "Mahnoor Baig",
  "Sumbal Javed",
  "Mishal Tariq",
];

/** Bed occupancy plan per room — sums to 53 active residents. */
const OCCUPANCY_PLAN: Record<string, number> = {
  "room-101": 4,
  "room-102": 3,
  "room-103": 3,
  "room-104": 2,
  "room-105": 3,
  "room-201": 3,
  "room-202": 3,
  "room-203": 3,
  "room-204": 2,
  "room-205": 3,
  "room-301": 3,
  "room-302": 3,
  "room-303": 3,
  "room-304": 2,
  "room-305": 0,
  "room-401": 3,
  "room-402": 3,
  "room-403": 2,
  "room-404": 2,
  "room-405": 3,
};

const CLASS_CYCLE = [
  "Grade 9-A",
  "Grade 10-B",
  "Grade 8-A",
  "Grade 9-B",
  "Grade 7-A",
  "Grade 10-A",
  "Grade 6-B",
  "Grade 8-B",
];

const MESS_PLAN_BY_BUILDING: Record<string, string> = {
  "bld-1": "mess-1",
  "bld-2": "mess-2",
  "bld-3": "mess-3",
  "bld-4": "mess-4",
};

const pad2 = (value: number) => String(value).padStart(2, "0");

function generatedCheckInDate(index: number): string {
  const months = ["08", "09", "10"] as const;
  const month = months[index % months.length];
  const day = ((index * 5) % 28) + 1;
  return `2026-${month}-${pad2(day)}`;
}

function generatedPhone(index: number): string {
  return `0300-${String(1000137 + index * 137).slice(0, 7)}`;
}

function buildAllocations(): HostelAllocationRecord[] {
  const records: HostelAllocationRecord[] = [];
  let nameIndex = 0;

  HOSTEL_ROOMS.forEach((room) => {
    const planned = OCCUPANCY_PLAN[room.id] ?? 0;
    for (let bed = 1; bed <= planned; bed += 1) {
      const studentName = ACTIVE_RESIDENT_NAMES[nameIndex];
      if (!studentName) return;

      records.push({
        id: `alloc-${nameIndex + 1}`,
        allocationCode: `HST-${String(101 + nameIndex).padStart(3, "0")}`,
        studentName,
        studentRollNo: `STD-${1200 + nameIndex}`,
        className: CLASS_CYCLE[nameIndex % CLASS_CYCLE.length],
        buildingId: room.buildingId,
        buildingName: room.buildingName,
        roomId: room.id,
        roomNo: room.roomNo,
        bedNo: `Bed ${bed}`,
        roomType: room.roomType,
        checkInDate: generatedCheckInDate(nameIndex),
        status: "Active",
        monthlyFee: room.monthlyFee,
        messPlanId: MESS_PLAN_BY_BUILDING[room.buildingId] ?? "",
        guardianPhone: generatedPhone(nameIndex),
      });

      nameIndex += 1;
    }
  });

  // Recently checked-out residents retain their historical room reference.
  const checkedOut = [
    {
      id: "alloc-checkedout-1",
      name: "Waleed Akhtar",
      className: "Grade 11-A",
      buildingId: "bld-3",
      buildingName: "Ibn-e-Sina Boys Hostel",
      roomId: "room-301",
      roomNo: "C-101",
      bedNo: "Bed 4",
      roomType: "Quad" as HostelRoomType,
      monthlyFee: 17000,
    },
    {
      id: "alloc-checkedout-2",
      name: "Ifra Aziz",
      className: "Grade 10-A",
      buildingId: "bld-4",
      buildingName: "Zainab Girls Hostel",
      roomId: "room-401",
      roomNo: "D-101",
      bedNo: "Bed 4",
      roomType: "Quad" as HostelRoomType,
      monthlyFee: 19500,
    },
  ];

  checkedOut.forEach((entry, index) => {
    records.push({
      id: entry.id,
      allocationCode: `HST-${String(201 + index).padStart(3, "0")}`,
      studentName: entry.name,
      studentRollNo: `STD-${1400 + index}`,
      className: entry.className,
      buildingId: entry.buildingId,
      buildingName: entry.buildingName,
      roomId: entry.roomId,
      roomNo: entry.roomNo,
      bedNo: entry.bedNo,
      roomType: entry.roomType,
      checkInDate: "2026-04-12",
      status: "Checked Out",
      monthlyFee: 0,
      messPlanId: "",
      guardianPhone: generatedPhone(nameIndex + index),
    });
  });

  const waitlisted = [
    {
      name: "Noor ul Ain",
      className: "Grade 8-A",
      buildingId: "bld-2",
      buildingName: "Fatima Jinnah Girls Hostel",
    },
    {
      name: "Azan Malik",
      className: "Grade 9-A",
      buildingId: "bld-1",
      buildingName: "Al-Biruni Boys Hostel",
    },
  ];

  waitlisted.forEach((entry, index) => {
    records.push({
      id: `alloc-waitlist-${index + 1}`,
      allocationCode: `HST-${String(301 + index).padStart(3, "0")}`,
      studentName: entry.name,
      studentRollNo: `STD-${1450 + index}`,
      className: entry.className,
      buildingId: entry.buildingId,
      buildingName: entry.buildingName,
      roomId: "",
      roomNo: "",
      bedNo: "",
      roomType: "",
      checkInDate: "",
      status: "Waitlisted",
      monthlyFee: 0,
      messPlanId: "",
      guardianPhone: generatedPhone(nameIndex + index),
    });
  });

  return records;
}

export const HOSTEL_ALLOCATIONS: HostelAllocationRecord[] = buildAllocations();

/** Students who do not yet hold a hostel bed — available for new allocation. */
const UNALLOCATED_STUDENT_NAMES: Array<{
  name: string;
  className: string;
  gender: HostelBuildingType;
}> = [
  { name: "Bilal Ahmed Siddiqui", className: "Grade 9-A", gender: "Boys" },
  { name: "Areeba Shahid", className: "Grade 8-B", gender: "Girls" },
  { name: "Dania Kamran", className: "Grade 10-A", gender: "Girls" },
  { name: "Faizan Ali Raza", className: "Grade 9-B", gender: "Boys" },
  { name: "Hammad Sheikh", className: "Grade 11-A", gender: "Boys" },
  { name: "Iman Fatima", className: "Grade 8-A", gender: "Girls" },
  { name: "Junaid Akram", className: "Grade 10-B", gender: "Boys" },
  { name: "Kashaf Noor", className: "Grade 9-A", gender: "Girls" },
  { name: "Muneeb Ur Rehman", className: "Grade 7-B", gender: "Boys" },
  { name: "Nida Yasmin", className: "Grade 11-B", gender: "Girls" },
  { name: "Owais Ahmed", className: "Grade 12-A", gender: "Boys" },
  { name: "Sahar Zia", className: "Grade 10-B", gender: "Girls" },
];

export const HOSTEL_STUDENT_DIRECTORY: HostelStudentDirectoryEntry[] =
  UNALLOCATED_STUDENT_NAMES.map((student, index) => ({
    id: `student-${index + 1}`,
    name: student.name,
    rollNo: `STD-${1500 + index}`,
    className: student.className,
    gender: student.gender,
  }));

/* ───────────────────────── Hostel attendance ───────────────────────── */

const ATTENDANCE_REMARKS: Record<number, string> = {
  2: "Late return — study hall session",
  5: "Approved medical leave",
  8: "Missed evening roll call",
  11: "Approved family leave",
  14: "Late return — sports practice",
  17: "Sick bay observation",
};

function buildAttendance(): HostelAttendanceRecord[] {
  const active = HOSTEL_ALLOCATIONS.filter(
    (allocation) => allocation.status === "Active"
  );

  return active.slice(0, 24).map((allocation, index) => {
    let status: HostelAttendanceStatus = "Present";
    if (index % 11 === 0) status = "On Leave";
    else if (index % 9 === 0) status = "Absent";
    else if (index % 7 === 0) status = "Late";

    const isAway = status === "Absent" || status === "On Leave";

    return {
      id: `att-${index + 1}`,
      date: "2026-11-04",
      studentName: allocation.studentName,
      studentRollNo: allocation.studentRollNo,
      buildingName: allocation.buildingName,
      roomNo: allocation.roomNo,
      status,
      checkInTime: isAway ? "—" : `19:${pad2((index * 3) % 60)}`,
      remarks: ATTENDANCE_REMARKS[index],
    };
  });
}

export const HOSTEL_ATTENDANCE: HostelAttendanceRecord[] = buildAttendance();

/* ───────────────────────── Visitor log ───────────────────────── */

export const HOSTEL_VISITORS: HostelVisitorRecord[] = [
  {
    id: "vis-1",
    visitorName: "Muhammad Asif Khan",
    phone: "0300-5567120",
    cnic: "35202-1234567-1",
    residentName: "Ahmed Raza Khan",
    residentRollNo: "STD-1200",
    buildingName: "Al-Biruni Boys Hostel",
    roomNo: "A-101",
    relationship: "Father",
    purpose: "Monthly visit & fee submission",
    visitDate: "2026-11-04",
    checkInTime: "16:20",
    status: "Approved",
  },
  {
    id: "vis-2",
    visitorName: "Samina Yousaf",
    phone: "0321-8841092",
    cnic: "35201-7654321-8",
    residentName: "Zainab Fatima",
    residentRollNo: "STD-1215",
    buildingName: "Fatima Jinnah Girls Hostel",
    roomNo: "B-101",
    relationship: "Mother",
    purpose: "Deliver winter clothing",
    visitDate: "2026-11-04",
    checkInTime: "15:05",
    status: "Approved",
  },
  {
    id: "vis-3",
    visitorName: "Imtiaz Ahmed",
    phone: "0333-7719024",
    cnic: "35202-2468135-3",
    residentName: "Arsalan Khan",
    residentRollNo: "STD-1229",
    buildingName: "Ibn-e-Sina Boys Hostel",
    roomNo: "C-101",
    relationship: "Uncle",
    purpose: "Guardian meeting with warden",
    visitDate: "2026-11-04",
    checkInTime: "14:40",
    status: "Approved",
  },
  {
    id: "vis-4",
    visitorName: "Nadia Farooq",
    phone: "0345-6612098",
    cnic: "35201-9988776-4",
    residentName: "Mehwish Anwar",
    residentRollNo: "STD-1240",
    buildingName: "Zainab Girls Hostel",
    roomNo: "D-101",
    relationship: "Aunt",
    purpose: "Birthday visit",
    visitDate: "2026-11-03",
    checkInTime: "17:10",
    checkOutTime: "18:25",
    status: "Checked Out",
  },
  {
    id: "vis-5",
    visitorName: "Faisal Mehmood",
    phone: "0301-3355779",
    cnic: "35202-5544332-9",
    residentName: "Muhammad Rayyan Ali",
    residentRollNo: "STD-1201",
    buildingName: "Al-Biruni Boys Hostel",
    roomNo: "A-101",
    relationship: "Brother",
    purpose: "Collect books & supplies",
    visitDate: "2026-11-03",
    checkInTime: "11:30",
    checkOutTime: "12:15",
    status: "Checked Out",
  },
  {
    id: "vis-6",
    visitorName: "Ayesha Siddiqui",
    phone: "0300-9928410",
    cnic: "35201-4433221-2",
    residentName: "Ayesha Siddiqa",
    residentRollNo: "STD-1216",
    buildingName: "Fatima Jinnah Girls Hostel",
    roomNo: "B-101",
    relationship: "Sister",
    purpose: "Weekend pickup authorization",
    visitDate: "2026-11-02",
    checkInTime: "09:15",
    checkOutTime: "09:50",
    status: "Checked Out",
  },
  {
    id: "vis-7",
    visitorName: "Javed Iqbal",
    phone: "0311-7745321",
    cnic: "35202-1122334-5",
    residentName: "Haris Nadeem",
    residentRollNo: "STD-1230",
    buildingName: "Ibn-e-Sina Boys Hostel",
    roomNo: "C-102",
    relationship: "Father",
    purpose: "Medical appointment",
    visitDate: "2026-11-02",
    checkInTime: "13:20",
    checkOutTime: "16:00",
    status: "Checked Out",
  },
  {
    id: "vis-8",
    visitorName: "Rukhsana Tariq",
    phone: "0321-6677890",
    cnic: "35201-6677889-1",
    residentName: "Eshaal Tariq",
    residentRollNo: "STD-1237",
    buildingName: "Zainab Girls Hostel",
    roomNo: "D-101",
    relationship: "Mother",
    purpose: "Parent-teacher meeting",
    visitDate: "2026-11-05",
    checkInTime: "—",
    status: "Pending",
  },
  {
    id: "vis-9",
    visitorName: "Shahid Mehmood",
    phone: "0333-1122445",
    cnic: "35202-8899001-7",
    residentName: "Hamza Tariq Mehmood",
    residentRollNo: "STD-1202",
    buildingName: "Al-Biruni Boys Hostel",
    roomNo: "A-102",
    relationship: "Father",
    purpose: "Weekend home visit approval",
    visitDate: "2026-11-05",
    checkInTime: "—",
    status: "Pending",
  },
];
