import { NextRequest, NextResponse } from "next/server";
import {
  STAFF_ATTENDANCE_RECORDS,
  type DailyStaffStatus,
  type StaffAttendanceRecord,
} from "@/lib/mock/attendance";

function parseUtcDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const d = new Date(Date.UTC(year, month, day));
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month ||
    d.getUTCDate() !== day
  ) {
    return null;
  }
  return d;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fromDate = searchParams.get("fromDate") ?? "";
  const toDate = searchParams.get("toDate") ?? "";
  const campus = searchParams.get("campus") ?? "";
  const department = searchParams.get("department") ?? "";
  const categoryType = searchParams.get("type") ?? "";
  const staffId =
    searchParams.get("staffId") ?? searchParams.get("empId") ?? "";

  if (!fromDate || !toDate) {
    return NextResponse.json(
      { error: "Both From Date and To Date are required." },
      { status: 400 }
    );
  }

  const start = parseUtcDate(fromDate);
  const end = parseUtcDate(toDate);

  if (!start || !end) {
    return NextResponse.json(
      { error: "Invalid date format. Expected YYYY-MM-DD." },
      { status: 400 }
    );
  }

  if (end.getTime() < start.getTime()) {
    return NextResponse.json(
      { error: "To Date cannot be earlier than From Date." },
      { status: 400 }
    );
  }

  // Academic & HR records exist within 2020-01-01 .. 2027-12-31
  const minSession = Date.UTC(2020, 0, 1);
  const maxSession = Date.UTC(2027, 11, 31);
  if (end.getTime() < minSession || start.getTime() > maxSession) {
    return NextResponse.json({
      records: [],
      workingDays: 0,
      fromDate,
      toDate,
      generatedAt: new Date().toISOString(),
    });
  }

  // Count working days inclusive of both boundary dates (excluding Sundays)
  let workingDays = 0;
  const cursor = new Date(start.getTime());
  while (cursor.getTime() <= end.getTime()) {
    if (cursor.getUTCDay() !== 0) {
      workingDays += 1;
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  if (workingDays === 0) {
    return NextResponse.json({
      records: [],
      workingDays: 0,
      fromDate,
      toDate,
      generatedAt: new Date().toISOString(),
    });
  }

  const startDaySeed =
    start.getUTCFullYear() * 372 +
    (start.getUTCMonth() + 1) * 31 +
    start.getUTCDate();
  const endDaySeed =
    end.getUTCFullYear() * 372 +
    (end.getUTCMonth() + 1) * 31 +
    end.getUTCDate();
  const rangeHash = startDaySeed * 13 + endDaySeed * 7;

  // Deduplicate and filter staff records
  const seenIds = new Set<string>();
  const filteredBase = STAFF_ATTENDANCE_RECORDS.filter((r) => {
    if (seenIds.has(r.empId)) return false;
    seenIds.add(r.empId);
    if (staffId && staffId !== "all") {
      const match =
        r.empId === staffId ||
        r.id === staffId ||
        r.empCode.toLowerCase() === staffId.toLowerCase() ||
        r.name.toLowerCase() === staffId.toLowerCase();
      if (!match) return false;
    }
    if (campus && r.campus !== campus) return false;
    if (department && r.department !== department) return false;
    if (categoryType && r.type !== categoryType) return false;
    return true;
  });

  const statusPool: DailyStaffStatus[] = [
    "Present",
    "Present",
    "Present",
    "Present",
    "Present",
    "Late",
    "On Leave",
    "Present",
    "Half Day",
    "Absent",
  ];

  const records: StaffAttendanceRecord[] = filteredBase.map((r, idx) => {
    const seed = (idx * 19 + rangeHash) % 100;
    const baseRate = Math.min(
      100,
      Math.max(72, r.monthlyRate + ((seed % 7) - 3))
    );

    const present = Math.min(
      workingDays,
      Math.max(0, Math.round((workingDays * baseRate) / 100))
    );
    const absentDays = Math.max(0, workingDays - present);
    const leaveDays =
      absentDays > 0 && r.statusToday === "On Leave" ? 1 : 0;
    const lateDays =
      r.statusToday === "Late"
        ? Math.min(3, Math.max(1, (seed % 3) + 1))
        : seed % 3 === 0
          ? 1
          : 0;

    const computedRate = Math.min(
      100,
      Math.round((present / workingDays) * 100)
    );
    const computedPunctuality = Math.min(
      100,
      Math.max(78, computedRate - lateDays * 2)
    );

    const statusForRange: DailyStaffStatus =
      workingDays === 1
        ? present === 1
          ? statusPool[(idx + endDaySeed) % statusPool.length] === "Late"
            ? "Late"
            : "Present"
          : leaveDays > 0
            ? "On Leave"
            : "Absent"
        : r.statusToday;

    const isOff =
      statusForRange === "Absent" || statusForRange === "On Leave";
    const isHalf = statusForRange === "Half Day";
    const isLate = statusForRange === "Late";

    const checkIn = isOff
      ? "—"
      : isLate
        ? `08:${String(12 + ((idx + endDaySeed) % 18)).padStart(2, "0")} AM`
        : `07:${String(35 + ((idx + startDaySeed) % 14)).padStart(2, "0")} AM`;

    const checkOut = isOff
      ? "—"
      : isHalf
        ? "11:30 AM"
        : `02:${String(30 + ((idx + endDaySeed) % 20)).padStart(2, "0")} PM`;

    const lateMinutes = isLate ? 12 + ((idx + endDaySeed) % 18) : 0;

    return {
      ...r,
      statusToday: statusForRange,
      checkIn,
      checkOut,
      lateMinutes,
      workingHours: isOff
        ? "6h 45m avg"
        : isHalf
          ? "3h 48m"
          : `6h ${String(45 + ((idx + startDaySeed) % 14)).padStart(2, "0")}m`,
      daysPresentMonth: present,
      daysAbsentMonth: absentDays,
      daysLateMonth: lateDays,
      daysLeaveMonth: leaveDays,
      monthlyRate: computedRate,
      monthlyPunctuality: computedPunctuality,
      remarks:
        statusForRange === "On Leave"
          ? "Approved leave on HR portal"
          : statusForRange === "Late"
            ? `Late arrival (+${lateMinutes}m) logged at gate`
            : statusForRange === "Absent"
              ? "Uninformed absence — HR notification sent"
              : statusForRange === "Half Day"
                ? "Approved short leave after 11:30 AM"
                : "Verified on-time shift attendance",
    };
  });

  return NextResponse.json({
    records,
    workingDays,
    fromDate,
    toDate,
    generatedAt: new Date().toISOString(),
  });
}
