import { NextRequest, NextResponse } from "next/server";
import {
  STUDENT_ATTENDANCE_RECORDS,
  type DailyStudentStatus,
  type StudentAttendanceRecord,
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
  const className = searchParams.get("class") ?? "";
  const section = searchParams.get("section") ?? "";
  const studentId =
    searchParams.get("studentId") ?? searchParams.get("student") ?? "";

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

  // Academic records exist within 2020-01-01 .. 2027-12-31
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

  // Deduplicate and filter records
  const seenIds = new Set<string>();
  const filteredBase = STUDENT_ATTENDANCE_RECORDS.filter((r) => {
    if (seenIds.has(r.studentId)) return false;
    seenIds.add(r.studentId);
    if (studentId && studentId !== "all") {
      const match =
        r.studentId === studentId ||
        r.id === studentId ||
        r.rollNo === studentId ||
        r.admissionNumber.toLowerCase() === studentId.toLowerCase() ||
        r.name.toLowerCase() === studentId.toLowerCase();
      if (!match) return false;
    }
    if (campus && r.campus !== campus) return false;
    if (className && r.className !== className) return false;
    if (section && `Section ${r.section}` !== section && r.section !== section) {
      return false;
    }
    return true;
  });

  const statusPool: DailyStudentStatus[] = [
    "Present",
    "Present",
    "Present",
    "Present",
    "Present",
    "Present",
    "Late",
    "Absent",
    "Present",
    "Excused",
  ];

  const records: StudentAttendanceRecord[] = filteredBase.map((r, idx) => {
    // Deterministic calculation for the selected date window
    const seed = (idx * 17 + rangeHash) % 100;
    const baseRate = Math.min(
      100,
      Math.max(62, r.monthlyRate + ((seed % 7) - 3))
    );
    const present = Math.min(
      workingDays,
      Math.max(0, Math.round((workingDays * baseRate) / 100))
    );
    const absent = Math.max(0, workingDays - present);
    const computedRate = Math.round((present / workingDays) * 100);

    const statusForRange =
      workingDays === 1
        ? present === 1
          ? statusPool[(idx + endDaySeed) % statusPool.length] === "Late"
            ? "Late"
            : "Present"
          : "Absent"
        : r.statusToday;

    const checkInTime =
      statusForRange === "Absent" || statusForRange === "Excused"
        ? "—"
        : statusForRange === "Late"
          ? `08:${String(11 + ((idx + endDaySeed) % 18)).padStart(2, "0")} AM`
          : `07:${String(42 + ((idx + startDaySeed) % 16)).padStart(2, "0")} AM`;

    return {
      ...r,
      statusToday: statusForRange,
      checkInTime,
      daysPresentMonth: present,
      daysAbsentMonth: absent,
      monthlyRate: computedRate,
      remarks:
        statusForRange === "Excused"
          ? "Approved medical leave on file"
          : statusForRange === "Late"
            ? "School bus route #4 delayed"
            : computedRate < 75
              ? "Below 75% threshold — Guardian notified"
              : r.remarks,
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
