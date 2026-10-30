export interface TransportRouteRecord {
  id: string;
  routeCode: string;
  routeName: string;
  monthlyFare: number;
}

export interface TransportVehicleRecord {
  id: string;
  vehicleCode: string;
  vehicleNo: string;
  model: string;
  capacity: number;
  driverName: string;
  driverPhone?: string;
  routeId: string;
  routeName: string;
}

export interface TransportAssignmentRecord {
  id: string;
  assignmentCode: string;
  studentName: string;
  studentRollNo: string;
  className: string;
  routeId: string;
  routeName: string;
  boardingStop: string;
  monthlyFare: number;
  busName?: string;
  vehicleNo?: string;
  driverName?: string;
  driverPhone?: string;
}

export interface StudentDirectoryEntry {
  id: string;
  name: string;
  rollNo: string;
  className: string;
}

export const COMMON_VEHICLE_MODELS: string[] = [
  "Hino Bus 2022",
  "Coaster 2021",
  "Toyota Coaster 2023",
  "Hino Kazaze Bus 2024",
  "Toyota HiAce Grand Cabin",
  "Isuzu Journey Coach 2022",
  "Changan Karvaan Plus 2023",
  "Hyundai County Deluxe",
];

export const COMMON_BOARDING_STOPS: string[] = [
  "Main Chowk",
  "Kalma Chowk Flyover",
  "Defence Morr",
  "Barkat Market",
  "Liberty Roundabout",
  "Doctors Hospital Stop",
  "Canal View Gate 1",
  "Thokar Niaz Baig",
  "Allama Iqbal Town Main Blvd",
  "Model Town Link Road",
  "Wapda Town Roundabout",
  "Fortress Stadium Gate",
];

export const TRANSPORT_STUDENT_DIRECTORY: StudentDirectoryEntry[] = [
  { id: "std-1", name: "Ahmed Raza Khan", rollNo: "STD-1024", className: "Grade 9-A" },
  { id: "std-2", name: "Zainab Fatima", rollNo: "STD-1041", className: "Grade 8-B" },
  { id: "std-3", name: "Muhammad Rayyan Ali", rollNo: "STD-1088", className: "Grade 10-A" },
  { id: "std-4", name: "Ayesha Siddiqa", rollNo: "STD-1102", className: "Grade 7-A" },
  { id: "std-5", name: "Hamza Tariq Mehmood", rollNo: "STD-1119", className: "Grade 6-B" },
  { id: "std-6", name: "Fatima Noor Sheikh", rollNo: "STD-1135", className: "Grade 9-B" },
  { id: "std-7", name: "Abdullah Bin Usman", rollNo: "STD-1150", className: "Grade 5-A" },
  { id: "std-8", name: "Hania Bilal Chaudhry", rollNo: "STD-1174", className: "Grade 8-A" },
  { id: "std-9", name: "Saad Salman Qureshi", rollNo: "STD-1192", className: "Grade 10-B" },
  { id: "std-10", name: "Maryam Jahangir", rollNo: "STD-1208", className: "Grade 4-A" },
  { id: "std-11", name: "Ibrahim Khawaja", rollNo: "STD-1225", className: "Grade 7-B" },
  { id: "std-12", name: "Eman Waqar Bajwa", rollNo: "STD-1240", className: "Grade 6-A" },
];

export const INITIAL_TRANSPORT_ROUTES: TransportRouteRecord[] = [
  {
    id: "rte-1",
    routeCode: "RTE-01",
    routeName: "Route A — DHA & Cantt",
    monthlyFare: 2000,
  },
  {
    id: "rte-2",
    routeCode: "RTE-02",
    routeName: "Route B — Gulberg & Johar",
    monthlyFare: 1800,
  },
  {
    id: "rte-3",
    routeCode: "RTE-03",
    routeName: "Route C — Model Town & Faisal Town",
    monthlyFare: 1900,
  },
  {
    id: "rte-4",
    routeCode: "RTE-04",
    routeName: "Route D — Bahria Town & Canal Bank",
    monthlyFare: 2500,
  },
  {
    id: "rte-5",
    routeCode: "RTE-05",
    routeName: "Route E — Wapda Town & Valencia",
    monthlyFare: 2200,
  },
  {
    id: "rte-6",
    routeCode: "RTE-06",
    routeName: "Route F — Allama Iqbal Town & Samanabad",
    monthlyFare: 1700,
  },
];

export const COMMON_DRIVER_NAMES: string[] = [
  "Muhammad Aslam",
  "Tariq Mehmood",
  "Ghulam Mustafa",
  "Rana Liaqat Ali",
  "Shaukat Hayat",
  "Rashid Minhas",
  "Zulfiqar Ahmed",
  "Arshad Iqbal",
];

export const INITIAL_TRANSPORT_VEHICLES: TransportVehicleRecord[] = [
  {
    id: "veh-1",
    vehicleCode: "VEH-101",
    vehicleNo: "LHR-2456",
    model: "Hino Bus 2022",
    capacity: 45,
    driverName: "Muhammad Aslam",
    driverPhone: "0300-4451920",
    routeId: "rte-1",
    routeName: "Route A — DHA & Cantt",
  },
  {
    id: "veh-2",
    vehicleCode: "VEH-102",
    vehicleNo: "LHR-7891",
    model: "Coaster 2021",
    capacity: 30,
    driverName: "Tariq Mehmood",
    driverPhone: "0321-8834102",
    routeId: "rte-2",
    routeName: "Route B — Gulberg & Johar",
  },
  {
    id: "veh-3",
    vehicleCode: "VEH-103",
    vehicleNo: "LHR-3310",
    model: "Toyota Coaster 2023",
    capacity: 32,
    driverName: "Ghulam Mustafa",
    driverPhone: "0333-4190823",
    routeId: "rte-3",
    routeName: "Route C — Model Town & Faisal Town",
  },
  {
    id: "veh-4",
    vehicleCode: "VEH-104",
    vehicleNo: "LHR-5120",
    model: "Hino Kazaze Bus 2024",
    capacity: 45,
    driverName: "Rana Liaqat Ali",
    driverPhone: "0301-7652390",
    routeId: "rte-4",
    routeName: "Route D — Bahria Town & Canal Bank",
  },
  {
    id: "veh-5",
    vehicleCode: "VEH-105",
    vehicleNo: "LHR-9044",
    model: "Isuzu Journey Coach 2022",
    capacity: 30,
    driverName: "Shaukat Hayat",
    driverPhone: "0345-6120944",
    routeId: "rte-5",
    routeName: "Route E — Wapda Town & Valencia",
  },
  {
    id: "veh-6",
    vehicleCode: "VEH-106",
    vehicleNo: "LHR-6618",
    model: "Toyota HiAce Grand Cabin",
    capacity: 18,
    driverName: "Rashid Minhas",
    driverPhone: "0302-9981234",
    routeId: "rte-6",
    routeName: "Route F — Allama Iqbal Town & Samanabad",
  },
];

export const INITIAL_TRANSPORT_ASSIGNMENTS: TransportAssignmentRecord[] = [
  {
    id: "asn-1",
    assignmentCode: "ASN-201",
    studentName: "Ahmed Raza Khan",
    studentRollNo: "STD-1024",
    className: "Grade 9-A",
    routeId: "rte-1",
    routeName: "Route A — DHA & Cantt",
    boardingStop: "Defence Morr",
    monthlyFare: 2000,
    busName: "Hino Bus 2022",
    vehicleNo: "LHR-2456",
    driverName: "Muhammad Aslam",
    driverPhone: "0300-4451920",
  },
  {
    id: "asn-2",
    assignmentCode: "ASN-202",
    studentName: "Zainab Fatima",
    studentRollNo: "STD-1041",
    className: "Grade 8-B",
    routeId: "rte-2",
    routeName: "Route B — Gulberg & Johar",
    boardingStop: "Liberty Roundabout",
    monthlyFare: 1800,
    busName: "Coaster 2021",
    vehicleNo: "LHR-7891",
    driverName: "Tariq Mehmood",
    driverPhone: "0321-8834102",
  },
  {
    id: "asn-3",
    assignmentCode: "ASN-203",
    studentName: "Muhammad Rayyan Ali",
    studentRollNo: "STD-1088",
    className: "Grade 10-A",
    routeId: "rte-1",
    routeName: "Route A — DHA & Cantt",
    boardingStop: "Fortress Stadium Gate",
    monthlyFare: 2000,
    busName: "Hino Bus 2022",
    vehicleNo: "LHR-2456",
    driverName: "Muhammad Aslam",
    driverPhone: "0300-4451920",
  },
  {
    id: "asn-4",
    assignmentCode: "ASN-204",
    studentName: "Ayesha Siddiqa",
    studentRollNo: "STD-1102",
    className: "Grade 7-A",
    routeId: "rte-3",
    routeName: "Route C — Model Town & Faisal Town",
    boardingStop: "Barkat Market",
    monthlyFare: 1900,
    busName: "Toyota Coaster 2023",
    vehicleNo: "LHR-3310",
    driverName: "Ghulam Mustafa",
    driverPhone: "0333-4190823",
  },
  {
    id: "asn-5",
    assignmentCode: "ASN-205",
    studentName: "Hamza Tariq Mehmood",
    studentRollNo: "STD-1119",
    className: "Grade 6-B",
    routeId: "rte-4",
    routeName: "Route D — Bahria Town & Canal Bank",
    boardingStop: "Canal View Gate 1",
    monthlyFare: 2500,
    busName: "Hino Kazaze Bus 2024",
    vehicleNo: "LHR-5120",
    driverName: "Rana Liaqat Ali",
    driverPhone: "0301-7652390",
  },
  {
    id: "asn-6",
    assignmentCode: "ASN-206",
    studentName: "Fatima Noor Sheikh",
    studentRollNo: "STD-1135",
    className: "Grade 9-B",
    routeId: "rte-5",
    routeName: "Route E — Wapda Town & Valencia",
    boardingStop: "Wapda Town Roundabout",
    monthlyFare: 2200,
    busName: "Isuzu Journey Coach 2022",
    vehicleNo: "LHR-9044",
    driverName: "Shaukat Hayat",
    driverPhone: "0345-6120944",
  },
  {
    id: "asn-7",
    assignmentCode: "ASN-207",
    studentName: "Abdullah Bin Usman",
    studentRollNo: "STD-1150",
    className: "Grade 5-A",
    routeId: "rte-2",
    routeName: "Route B — Gulberg & Johar",
    boardingStop: "Doctors Hospital Stop",
    monthlyFare: 1800,
    busName: "Coaster 2021",
    vehicleNo: "LHR-7891",
    driverName: "Tariq Mehmood",
    driverPhone: "0321-8834102",
  },
  {
    id: "asn-8",
    assignmentCode: "ASN-208",
    studentName: "Hania Bilal Chaudhry",
    studentRollNo: "STD-1174",
    className: "Grade 8-A",
    routeId: "rte-6",
    routeName: "Route F — Allama Iqbal Town & Samanabad",
    boardingStop: "Allama Iqbal Town Main Blvd",
    monthlyFare: 1700,
    busName: "Toyota HiAce Grand Cabin",
    vehicleNo: "LHR-6618",
    driverName: "Rashid Minhas",
    driverPhone: "0302-9981234",
  },
  {
    id: "asn-9",
    assignmentCode: "ASN-209",
    studentName: "Saad Salman Qureshi",
    studentRollNo: "STD-1192",
    className: "Grade 10-B",
    routeId: "rte-3",
    routeName: "Route C — Model Town & Faisal Town",
    boardingStop: "Model Town Link Road",
    monthlyFare: 1900,
    busName: "Toyota Coaster 2023",
    vehicleNo: "LHR-3310",
    driverName: "Ghulam Mustafa",
    driverPhone: "0333-4190823",
  },
  {
    id: "asn-10",
    assignmentCode: "ASN-210",
    studentName: "Maryam Jahangir",
    studentRollNo: "STD-1208",
    className: "Grade 4-A",
    routeId: "rte-4",
    routeName: "Route D — Bahria Town & Canal Bank",
    boardingStop: "Thokar Niaz Baig",
    monthlyFare: 2500,
    busName: "Hino Kazaze Bus 2024",
    vehicleNo: "LHR-5120",
    driverName: "Rana Liaqat Ali",
    driverPhone: "0301-7652390",
  },
  {
    id: "asn-11",
    assignmentCode: "ASN-211",
    studentName: "Ibrahim Khawaja",
    studentRollNo: "STD-1225",
    className: "Grade 7-B",
    routeId: "rte-5",
    routeName: "Route E — Wapda Town & Valencia",
    boardingStop: "Wapda Town Roundabout",
    monthlyFare: 2200,
    busName: "Isuzu Journey Coach 2022",
    vehicleNo: "LHR-9044",
    driverName: "Shaukat Hayat",
    driverPhone: "0345-6120944",
  },
  {
    id: "asn-12",
    assignmentCode: "ASN-212",
    studentName: "Eman Waqar Bajwa",
    studentRollNo: "STD-1240",
    className: "Grade 6-A",
    routeId: "rte-6",
    routeName: "Route F — Allama Iqbal Town & Samanabad",
    boardingStop: "Main Chowk",
    monthlyFare: 1700,
    busName: "Toyota HiAce Grand Cabin",
    vehicleNo: "LHR-6618",
    driverName: "Rashid Minhas",
    driverPhone: "0302-9981234",
  },
];
