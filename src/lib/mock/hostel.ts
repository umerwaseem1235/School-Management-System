/* ────────────────────────────────────────────────────────────────────────────
 * Hostel Management – Room Register (Opus SMS Super-Admin)
 * ──────────────────────────────────────────────────────────────────────────── */

export type HostelRoomType = "AC" | "Non-AC";
export type HostelRoomStatus = "Available" | "Full" | "Maintenance";

export interface HostelRoomRecord {
  id: string;
  roomCode: string;
  hostel: string;
  block: string;
  roomNo: string;
  type: HostelRoomType;
  capacity: number;
  occupied: number;
  warden: string;
  status: HostelRoomStatus;
  remarks: string;
}

export const HOSTEL_ROOM_TYPES: HostelRoomType[] = ["AC", "Non-AC"];

export const computeRoomStatus = (
  occupied: number,
  capacity: number
): HostelRoomStatus => {
  if (occupied >= capacity) return "Full";
  return "Available";
};

export const INITIAL_HOSTEL_ROOMS: HostelRoomRecord[] = [
  {
    id: "hr-1",
    roomCode: "HR-001",
    hostel: "Boys Hostel",
    block: "A",
    roomNo: "101",
    type: "Non-AC",
    capacity: 4,
    occupied: 4,
    warden: "Mr. Ahmed",
    status: "Full",
    remarks: "Ground floor",
  },
  {
    id: "hr-2",
    roomCode: "HR-002",
    hostel: "Boys Hostel",
    block: "A",
    roomNo: "102",
    type: "AC",
    capacity: 2,
    occupied: 1,
    warden: "Mr. Ahmed",
    status: "Available",
    remarks: "",
  },
  {
    id: "hr-3",
    roomCode: "HR-003",
    hostel: "Boys Hostel",
    block: "B",
    roomNo: "201",
    type: "Non-AC",
    capacity: 6,
    occupied: 5,
    warden: "Mr. Bilal",
    status: "Available",
    remarks: "Near mess",
  },
  {
    id: "hr-4",
    roomCode: "HR-004",
    hostel: "Girls Hostel",
    block: "A",
    roomNo: "101",
    type: "AC",
    capacity: 2,
    occupied: 2,
    warden: "Ms. Fatima",
    status: "Full",
    remarks: "",
  },
  {
    id: "hr-5",
    roomCode: "HR-005",
    hostel: "Girls Hostel",
    block: "B",
    roomNo: "205",
    type: "Non-AC",
    capacity: 4,
    occupied: 0,
    warden: "Ms. Fatima",
    status: "Maintenance",
    remarks: "Under repair",
  },
  {
    id: "hr-6",
    roomCode: "HR-006",
    hostel: "Boys Hostel",
    block: "C",
    roomNo: "301",
    type: "AC",
    capacity: 3,
    occupied: 2,
    warden: "Mr. Usman",
    status: "Available",
    remarks: "",
  },
];
