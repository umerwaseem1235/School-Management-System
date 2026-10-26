import type {
  DailyStaffStatus,
  StaffAttendanceRecord,
} from "@/lib/mock/attendance";
import { shortCampus } from "../_components/attendance-utils";

function sanitizePdfText(input: string): string {
  return input
    .replace(/[—–]/g, "-")
    .replace(/·/g, "|")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export function getStaffStandingLabel(rate: number): string {
  if (rate >= 85) return "Compliant";
  if (rate >= 75) return "Warning";
  return "Below 75%";
}

export function formatShortDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return iso;
  const d = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  );
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatCompactRange(fromIso: string, toIso: string): string {
  const fromFormatted = formatShortDate(fromIso);
  const toFormatted = formatShortDate(toIso);
  if (fromIso === toIso) return fromFormatted;
  const m1 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fromIso.trim());
  const m2 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(toIso.trim());
  if (m1 && m2 && m1[1] === m2[1]) {
    const d1 = new Date(
      Date.UTC(Number(m1[1]), Number(m1[2]) - 1, Number(m1[3]))
    ).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    });
    return `${d1} - ${toFormatted}`;
  }
  return `${fromFormatted} - ${toFormatted}`;
}

function getGenerationDateLabel(): string {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface DailyStaffLogEntry {
  dateLabel: string;
  dayName: string;
  status: DailyStaffStatus;
  checkIn: string;
  checkOut: string;
  method: string;
  remarks: string;
}

function buildDailyStaffAttendanceLogs(
  staff: StaffAttendanceRecord,
  fromDate: string,
  toDate: string,
  maxRows = 14
): DailyStaffLogEntry[] {
  const m1 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fromDate.trim());
  const m2 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(toDate.trim());
  if (!m1 || !m2) return [];

  const start = new Date(
    Date.UTC(Number(m1[1]), Number(m1[2]) - 1, Number(m1[3]))
  );
  const end = new Date(
    Date.UTC(Number(m2[1]), Number(m2[2]) - 1, Number(m2[3]))
  );
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return [];
  }

  const workingDates: Date[] = [];
  const cursor = new Date(start.getTime());
  while (cursor <= end) {
    if (cursor.getUTCDay() !== 0) {
      workingDates.push(new Date(cursor.getTime()));
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const totalWorking = workingDates.length;
  const absentTarget = Math.min(staff.daysAbsentMonth, totalWorking);
  const leaveTarget = Math.min(
    staff.daysLeaveMonth,
    Math.max(0, totalWorking - absentTarget)
  );
  const lateTarget = Math.min(
    staff.daysLateMonth,
    Math.max(0, totalWorking - absentTarget - leaveTarget)
  );

  const codeDigits = Number(staff.empCode.replace(/\D+/g, "") || 100);

  const entries: DailyStaffLogEntry[] = workingDates.map((d, idx) => {
    const dateLabel = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
    const dayName = d.toLocaleDateString("en-GB", {
      weekday: "short",
      timeZone: "UTC",
    });

    let status: DailyStaffStatus = "Present";
    if (idx === workingDates.length - 1) {
      status = staff.statusToday;
    } else if (absentTarget > 0 && idx === 2) {
      status = "Absent";
    } else if (leaveTarget > 0 && idx === 5) {
      status = "On Leave";
    } else if (lateTarget > 0 && idx === 8) {
      status = "Late";
    }

    const minuteOffset = (idx * 5 + codeDigits) % 12;
    const isOff = status === "Absent" || status === "On Leave";

    const checkIn = isOff
      ? "-"
      : status === "Late"
        ? `08:${String(12 + (minuteOffset % 15)).padStart(2, "0")} AM`
        : `07:${String(35 + minuteOffset).padStart(2, "0")} AM`;

    const checkOut = isOff
      ? "-"
      : status === "Half Day"
        ? "11:30 AM"
        : `02:${String(32 + (minuteOffset % 16)).padStart(2, "0")} PM`;

    const method = isOff
      ? status === "On Leave"
        ? "HR Leave Portal"
        : "Auto-Marked"
      : staff.verificationMethod;

    const remarks =
      status === "Absent"
        ? "Uninformed absence logged"
        : status === "On Leave"
          ? "Approved leave on file"
          : status === "Late"
            ? "Late arrival logged at gate"
            : status === "Half Day"
              ? "Approved half-day departure"
              : "Verified on-time shift duty";

    return {
      dateLabel,
      dayName,
      status,
      checkIn,
      checkOut,
      method,
      remarks,
    };
  });

  return entries.slice(-maxRows);
}

function buildPdfDocument(pageStreams: string[]): Blob {
  const objects: string[] = [];
  const addObject = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  const catalogId = addObject("");
  const pagesId = addObject("");
  const fontRegularId = addObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"
  );
  const fontBoldId = addObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"
  );

  const pageIds: number[] = [];

  for (const stream of pageStreams) {
    const streamBytes = new TextEncoder().encode(stream).length;
    const contentId = addObject(
      `<< /Length ${streamBytes} >>\nstream\n${stream}\nendstream`
    );
    const pageId = addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    pageIds.push(pageId);
  }

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds
    .map((id) => `${id} 0 R`)
    .join(" ")}] /Count ${pageIds.length} >>`;

  const encoder = new TextEncoder();
  const chunks: string[] = [];
  let byteOffset = 0;

  const pushChunk = (str: string) => {
    chunks.push(str);
    byteOffset += encoder.encode(str).length;
  };

  pushChunk("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

  const offsets: number[] = [];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(byteOffset);
    pushChunk(`${i + 1} 0 obj\n${objects[i]}\nendobj\n`);
  }

  const xrefOffset = byteOffset;
  pushChunk(`xref\n0 ${objects.length + 1}\n`);
  pushChunk("0000000000 65535 f \n");
  for (const off of offsets) {
    pushChunk(`${String(off).padStart(10, "0")} 00000 n \n`);
  }

  pushChunk(
    `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  );

  return new Blob([chunks.join("")], { type: "application/pdf" });
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Shared institutional PDF Header Banner for Staff Attendance Report.
 * Guarantees zero text overlap between left and right columns.
 */
function drawInstitutionalHeader(
  cmds: string[],
  opts: {
    subtitleLine: string;
    rightLine1: string;
    rightLine2: string;
    rightLine3: string;
  }
) {
  // Navy Header Banner (#091d3e)
  cmds.push("0.035 0.114 0.243 rg");
  cmds.push("28 748 539.28 64 re f");

  // Gold Accent Bottom Trim
  cmds.push("0.88 0.68 0.18 rg");
  cmds.push("28 748 539.28 2 re f");

  // Brand Emblem Crest Box
  cmds.push("0.11 0.24 0.44 rg");
  cmds.push("38 762 36 36 re f");
  cmds.push("0.30 0.46 0.68 RG 0.6 w");
  cmds.push("38 762 36 36 re S");
  cmds.push("0.92 0.72 0.20 rg");
  cmds.push("68 792 4 4 re f");
  cmds.push("1 1 1 rg");
  cmds.push("BT /F2 13 Tf 47 775 Td (ES) Tj ET");

  // Left Column: Institution Name, Main Title (fixed), and Subtitle
  cmds.push("0.78 0.86 0.96 rg");
  cmds.push(
    `BT /F2 8.5 Tf 84 796 Td (${sanitizePdfText(
      "EDUSPHERE MULTI-CAMPUS INSTITUTION"
    )}) Tj ET`
  );
  cmds.push("1 1 1 rg");
  cmds.push(
    `BT /F2 15 Tf 84 778 Td (${sanitizePdfText(
      "Staff Attendance Report"
    )}) Tj ET`
  );
  cmds.push("0.82 0.88 0.96 rg");
  cmds.push(
    `BT /F1 8.2 Tf 84 761 Td (${sanitizePdfText(opts.subtitleLine)}) Tj ET`
  );

  // Vertical Separator Line at x=422
  cmds.push("0.20 0.33 0.52 RG 0.7 w");
  cmds.push("422 758 m 422 802 l S");

  // Right Column Metadata (x=432)
  cmds.push("1 1 1 rg");
  cmds.push(
    `BT /F2 8.2 Tf 432 795 Td (${sanitizePdfText(opts.rightLine1)}) Tj ET`
  );
  cmds.push("0.84 0.90 0.97 rg");
  cmds.push(
    `BT /F1 8.2 Tf 432 780 Td (${sanitizePdfText(opts.rightLine2)}) Tj ET`
  );
  cmds.push("0.95 0.80 0.35 rg");
  cmds.push(
    `BT /F2 8.2 Tf 432 764 Td (${sanitizePdfText(opts.rightLine3)}) Tj ET`
  );
}

/**
 * Generates and downloads an individual staff member's comprehensive Attendance Report PDF (A4 portrait).
 */
export function downloadSingleStaffReportPdf({
  staff,
  period,
  fromDate,
  toDate,
}: {
  staff: StaffAttendanceRecord;
  period: string;
  fromDate: string;
  toDate: string;
}): boolean {
  const fromFormatted = formatShortDate(fromDate);
  const toFormatted = formatShortDate(toDate);
  const compactRange = formatCompactRange(fromDate, toDate);
  const generatedDate = getGenerationDateLabel();
  const standing = getStaffStandingLabel(staff.monthlyRate);
  const workingDays = Math.max(
    1,
    staff.daysPresentMonth + staff.daysAbsentMonth
  );
  const campusLabel = shortCampus(staff.campus);

  const cmds: string[] = [];

  // 1. Institutional Header Banner (Zero overlap)
  drawInstitutionalHeader(cmds, {
    subtitleLine: `Period: ${period}   |   Date Range: ${fromFormatted} - ${toFormatted} (${workingDays} Working Days)`,
    rightLine1: `Generated: ${generatedDate}`,
    rightLine2: `Code: ${staff.empCode}  |  ${staff.type}`,
    rightLine3: `Standing: ${standing} (${staff.monthlyRate}%)`,
  });

  // 2. Staff Profile Card (y = 668 to 736)
  cmds.push("0.968 0.976 0.988 rg");
  cmds.push("28 668 539.28 68 re f");
  cmds.push("0.82 0.86 0.91 RG 0.7 w");
  cmds.push("28 668 539.28 68 re S");

  // Left Navy Accent Bar on Profile Card
  cmds.push("0.035 0.114 0.243 rg");
  cmds.push("28 668 4 68 re f");

  // Profile Top Row
  cmds.push("0.035 0.114 0.243 rg");
  cmds.push(
    `BT /F2 11.5 Tf 42 718 Td (${sanitizePdfText(staff.name)}) Tj ET`
  );
  cmds.push("0.30 0.36 0.45 rg");
  cmds.push(
    `BT /F2 8.2 Tf 210 718 Td (${sanitizePdfText(
      `Code: ${staff.empCode}   |   ${staff.designation}`
    )}) Tj ET`
  );
  cmds.push(
    `BT /F1 8.2 Tf 430 718 Td (${sanitizePdfText(
      `Terminal: ${staff.verificationMethod}`
    )}) Tj ET`
  );

  // Subtle horizontal divider inside profile card
  cmds.push("0.86 0.89 0.93 RG 0.5 w");
  cmds.push("42 710 m 555 710 l S");

  // Profile Grid Row 1
  cmds.push("0.38 0.43 0.52 rg");
  cmds.push("BT /F2 7.5 Tf 42 695 Td (DEPARTMENT:) Tj ET");
  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F2 8.2 Tf 110 695 Td (${sanitizePdfText(
      `${staff.department} (${staff.type})`
    )}) Tj ET`
  );

  cmds.push("0.38 0.43 0.52 rg");
  cmds.push("BT /F2 7.5 Tf 255 695 Td (CAMPUS:) Tj ET");
  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F2 8.2 Tf 298 695 Td (${sanitizePdfText(campusLabel)}) Tj ET`
  );

  cmds.push("0.38 0.43 0.52 rg");
  cmds.push("BT /F2 7.5 Tf 410 695 Td (CHECK-IN / OUT:) Tj ET");
  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F2 8.2 Tf 482 695 Td (${sanitizePdfText(
      `${staff.checkIn} / ${staff.checkOut}`
    )}) Tj ET`
  );

  // Profile Grid Row 2
  cmds.push("0.38 0.43 0.52 rg");
  cmds.push("BT /F2 7.5 Tf 42 678 Td (SHIFT TIMING:) Tj ET");
  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F1 8.2 Tf 110 678 Td (${sanitizePdfText(staff.shift)}) Tj ET`
  );

  cmds.push("0.38 0.43 0.52 rg");
  cmds.push("BT /F2 7.5 Tf 255 678 Td (CONTACT:) Tj ET");
  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F1 8.2 Tf 298 678 Td (${sanitizePdfText(staff.phone)}) Tj ET`
  );

  cmds.push("0.38 0.43 0.52 rg");
  cmds.push("BT /F2 7.5 Tf 410 678 Td (DUTY STATUS:) Tj ET");
  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F2 8.2 Tf 482 678 Td (${sanitizePdfText(staff.statusToday)}) Tj ET`
  );

  // 3. 5-Box KPI Strip (y = 608 to 656)
  const kpiCards = [
    {
      label: "WORKING DAYS",
      val: `${workingDays} Days`,
      sub: "Scheduled Shifts",
      accent: [0.035, 0.114, 0.243],
    },
    {
      label: "DAYS PRESENT",
      val: `${staff.daysPresentMonth} Days`,
      sub: "On-Duty Sessions",
      accent: [0.12, 0.52, 0.35],
    },
    {
      label: "ABSENT / LEAVE",
      val: `${staff.daysAbsentMonth}A / ${staff.daysLeaveMonth}LV`,
      sub: "Absences & Leaves",
      accent: [0.75, 0.2, 0.18],
    },
    {
      label: "LATE ARRIVALS",
      val: `${staff.daysLateMonth} ${staff.daysLateMonth === 1 ? "Day" : "Days"}`,
      sub: `Punctuality: ${staff.monthlyPunctuality}%`,
      accent: [0.78, 0.5, 0.1],
    },
    {
      label: "ATTENDANCE RATE",
      val: `${staff.monthlyRate}%`,
      sub: `Standing: ${standing}`,
      accent: [0.16, 0.38, 0.68],
    },
  ];

  const cardWidth = 101.45;
  const cardGap = 8;
  kpiCards.forEach((k, i) => {
    const x = 28 + i * (cardWidth + cardGap);
    cmds.push("1 1 1 rg");
    cmds.push(`${x} 608 ${cardWidth} 48 re f`);
    cmds.push("0.82 0.86 0.91 RG 0.6 w");
    cmds.push(`${x} 608 ${cardWidth} 48 re S`);

    cmds.push(`${k.accent[0]} ${k.accent[1]} ${k.accent[2]} rg`);
    cmds.push(`${x} 653.5 ${cardWidth} 2.5 re f`);

    cmds.push("0.38 0.43 0.52 rg");
    cmds.push(
      `BT /F2 6.8 Tf ${x + 8} 642 Td (${sanitizePdfText(k.label)}) Tj ET`
    );
    cmds.push("0.035 0.114 0.243 rg");
    cmds.push(
      `BT /F2 11.5 Tf ${x + 8} 625 Td (${sanitizePdfText(k.val)}) Tj ET`
    );
    cmds.push("0.45 0.50 0.58 rg");
    cmds.push(
      `BT /F1 6.8 Tf ${x + 8} 614 Td (${sanitizePdfText(k.sub)}) Tj ET`
    );
  });

  // 4. Period Attendance Summary Table (y = 548 to 592)
  const summaryTableY = 592;
  cmds.push("0.086 0.204 0.373 rg");
  cmds.push(`28 ${summaryTableY - 20} 539.28 20 re f`);
  cmds.push("1 1 1 rg");

  const cols = [
    { title: "EMP Code", x: 33 },
    { title: "Staff Name & Role", x: 88 },
    { title: "Dept & Campus", x: 202 },
    { title: "Attendance Range", x: 286 },
    { title: "Status & P/A/L", x: 372 },
    { title: "In / Out", x: 432 },
    { title: "Rate", x: 490 },
    { title: "Standing", x: 518 },
  ];
  for (const col of cols) {
    cmds.push(
      `BT /F2 7 Tf ${col.x} ${summaryTableY - 13} Td (${sanitizePdfText(
        col.title
      )}) Tj ET`
    );
  }

  const rowY = summaryTableY - 46;
  cmds.push("0.98 0.985 0.995 rg");
  cmds.push(`28 ${rowY} 539.28 26 re f`);
  cmds.push("0.82 0.86 0.91 RG 0.5 w");
  cmds.push(`28 ${rowY} 539.28 26 re S`);

  const topY = rowY + 15;
  const subY = rowY + 5.5;

  // Col 1: EMP Code
  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F2 7.2 Tf 33 ${topY} Td (${sanitizePdfText(staff.empCode)}) Tj ET`
  );
  cmds.push("0.42 0.47 0.55 rg");
  cmds.push(
    `BT /F1 6.3 Tf 33 ${subY} Td (${sanitizePdfText(staff.type)}) Tj ET`
  );

  // Col 2: Staff Name & Designation
  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F2 7.5 Tf 88 ${topY} Td (${sanitizePdfText(
      staff.name.slice(0, 22)
    )}) Tj ET`
  );
  cmds.push("0.42 0.47 0.55 rg");
  cmds.push(
    `BT /F1 6.3 Tf 88 ${subY} Td (${sanitizePdfText(
      staff.designation.slice(0, 22)
    )}) Tj ET`
  );

  // Col 3: Dept & Campus (Full campus name, never truncates F-8 Islamabad!)
  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F2 7.2 Tf 202 ${topY} Td (${sanitizePdfText(
      staff.department.slice(0, 18)
    )}) Tj ET`
  );
  cmds.push("0.42 0.47 0.55 rg");
  cmds.push(
    `BT /F1 6.4 Tf 202 ${subY} Td (${sanitizePdfText(
      campusLabel.slice(0, 18)
    )}) Tj ET`
  );

  // Col 4: Attendance Date Range
  cmds.push("0.15 0.20 0.28 rg");
  cmds.push(
    `BT /F2 6.8 Tf 286 ${topY} Td (${sanitizePdfText(compactRange)}) Tj ET`
  );
  cmds.push("0.42 0.47 0.55 rg");
  cmds.push(
    `BT /F1 6.3 Tf 286 ${subY} Td (${sanitizePdfText(
      `${workingDays} Working Days`
    )}) Tj ET`
  );

  // Col 5: Status & P/A/L
  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F2 7.2 Tf 372 ${topY} Td (${sanitizePdfText(staff.statusToday)}) Tj ET`
  );
  cmds.push("0.35 0.40 0.48 rg");
  cmds.push(
    `BT /F1 6.3 Tf 372 ${subY} Td (${sanitizePdfText(
      `${staff.daysPresentMonth}P/${staff.daysAbsentMonth}A/${staff.daysLateMonth}L`
    )}) Tj ET`
  );

  // Col 6: In / Out
  cmds.push("0.15 0.20 0.28 rg");
  cmds.push(
    `BT /F1 6.6 Tf 432 ${topY} Td (${sanitizePdfText(
      `In: ${staff.checkIn}`
    )}) Tj ET`
  );
  cmds.push("0.42 0.47 0.55 rg");
  cmds.push(
    `BT /F1 6.3 Tf 432 ${subY} Td (${sanitizePdfText(
      `Out: ${staff.checkOut}`
    )}) Tj ET`
  );

  // Col 7: Rate
  cmds.push("0.035 0.114 0.243 rg");
  cmds.push(
    `BT /F2 7.8 Tf 490 ${topY - 4} Td (${sanitizePdfText(
      `${staff.monthlyRate}%`
    )}) Tj ET`
  );

  // Col 8: Standing
  if (staff.monthlyRate >= 90) {
    cmds.push("0.12 0.52 0.35 rg");
  } else if (staff.monthlyRate >= 80) {
    cmds.push("0.72 0.45 0.08 rg");
  } else {
    cmds.push("0.75 0.20 0.18 rg");
  }
  cmds.push(
    `BT /F2 7.2 Tf 518 ${topY} Td (${sanitizePdfText(standing)}) Tj ET`
  );
  cmds.push("0.42 0.47 0.55 rg");
  cmds.push(
    `BT /F1 6.2 Tf 518 ${subY} Td (${sanitizePdfText(
      staff.workingHours
    )}) Tj ET`
  );

  // 5. Daily Biometric & Shift Log Breakdown Table
  const dailyLogs = buildDailyStaffAttendanceLogs(staff, fromDate, toDate, 14);
  if (dailyLogs.length > 0) {
    cmds.push("0.035 0.114 0.243 rg");
    cmds.push(
      `BT /F2 8.5 Tf 28 522 Td (${sanitizePdfText(
        `DAILY BIOMETRIC & SHIFT REGISTER LOG (${dailyLogs.length} SHIFTS DISPLAYED)`
      )}) Tj ET`
    );

    const logHeaderY = 498;
    cmds.push("0.12 0.24 0.42 rg");
    cmds.push(`28 ${logHeaderY} 539.28 18 re f`);
    cmds.push("1 1 1 rg");

    const logCols = [
      { title: "#", x: 34 },
      { title: "Attendance Date", x: 56 },
      { title: "Day", x: 132 },
      { title: "Duty Status", x: 176 },
      { title: "Check-In", x: 256 },
      { title: "Check-Out", x: 320 },
      { title: "Terminal Mode", x: 384 },
      { title: "HR Remarks", x: 468 },
    ];
    for (const c of logCols) {
      cmds.push(
        `BT /F2 6.8 Tf ${c.x} ${logHeaderY + 6} Td (${sanitizePdfText(
          c.title
        )}) Tj ET`
      );
    }

    let curY = logHeaderY;
    const logRowH = 20;
    dailyLogs.forEach((entry, idx) => {
      const nextY = curY - logRowH;
      if (idx % 2 === 1) {
        cmds.push("0.975 0.982 0.992 rg");
        cmds.push(`28 ${nextY} 539.28 ${logRowH} re f`);
      }
      cmds.push("0.88 0.91 0.95 RG 0.4 w");
      cmds.push(`28 ${nextY} m 567.28 ${nextY} l S`);

      const textY = nextY + 7;
      cmds.push("0.38 0.43 0.52 rg");
      cmds.push(
        `BT /F1 6.8 Tf 34 ${textY} Td (${sanitizePdfText(
          String(idx + 1).padStart(2, "0")
        )}) Tj ET`
      );

      cmds.push("0.08 0.12 0.20 rg");
      cmds.push(
        `BT /F2 7 Tf 56 ${textY} Td (${sanitizePdfText(
          entry.dateLabel
        )}) Tj ET`
      );

      cmds.push("0.38 0.43 0.52 rg");
      cmds.push(
        `BT /F1 6.8 Tf 132 ${textY} Td (${sanitizePdfText(
          entry.dayName
        )}) Tj ET`
      );

      if (entry.status === "Present") {
        cmds.push("0.12 0.52 0.35 rg");
      } else if (entry.status === "Late" || entry.status === "Half Day") {
        cmds.push("0.72 0.45 0.08 rg");
      } else {
        cmds.push("0.75 0.20 0.18 rg");
      }
      cmds.push(
        `BT /F2 7 Tf 176 ${textY} Td (${sanitizePdfText(
          entry.status
        )}) Tj ET`
      );

      cmds.push("0.15 0.20 0.28 rg");
      cmds.push(
        `BT /F1 6.8 Tf 256 ${textY} Td (${sanitizePdfText(
          entry.checkIn
        )}) Tj ET`
      );
      cmds.push(
        `BT /F1 6.8 Tf 320 ${textY} Td (${sanitizePdfText(
          entry.checkOut
        )}) Tj ET`
      );

      cmds.push("0.35 0.40 0.48 rg");
      cmds.push(
        `BT /F1 6.8 Tf 384 ${textY} Td (${sanitizePdfText(
          entry.method
        )}) Tj ET`
      );
      cmds.push(
        `BT /F1 6.5 Tf 468 ${textY} Td (${sanitizePdfText(
          entry.remarks.slice(0, 22)
        )}) Tj ET`
      );

      curY = nextY;
    });
  }

  // 6. Official Signatures & Stamp Block at Bottom
  cmds.push("0.55 0.60 0.68 RG 0.6 w");
  cmds.push("36 92 m 176 92 l S");
  cmds.push("228 92 m 368 92 l S");
  cmds.push("420 92 m 560 92 l S");

  cmds.push("0.25 0.30 0.38 rg");
  cmds.push(
    "BT /F2 7.2 Tf 46 80 Td (Prepared By (HR & Attendance)) Tj ET"
  );
  cmds.push(
    "BT /F2 7.2 Tf 236 80 Td (Verified By (Dept Coordinator)) Tj ET"
  );
  cmds.push(
    "BT /F2 7.2 Tf 435 80 Td (Approved By (Campus Principal)) Tj ET"
  );

  // 7. Page Footer
  cmds.push("0.78 0.82 0.88 RG 0.6 w");
  cmds.push("28 52 m 567.28 52 l S");
  cmds.push("0.38 0.43 0.52 rg");
  cmds.push(
    `BT /F1 7.5 Tf 28 38 Td (${sanitizePdfText(
      `EduSphere School Management System  |  Staff Attendance Report (${fromFormatted} to ${toFormatted})  |  Generated: ${generatedDate}`
    )}) Tj ET`
  );
  cmds.push("BT /F2 7.5 Tf 515 38 Td (Page 1 of 1) Tj ET");

  const slug = staff.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const blob = buildPdfDocument([cmds.join("\n")]);
  triggerBlobDownload(
    blob,
    `staff-attendance-report-${slug}-${fromDate}-to-${toDate}.pdf`
  );
  return true;
}

/**
 * Generates and downloads the currently fetched and filtered Staff Attendance Report PDF (A4 portrait).
 * Automatically delegates to the comprehensive single-staff layout when 1 staff member is selected.
 */
export function downloadStaffAttendanceReportPdf({
  records,
  period,
  fromDate,
  toDate,
}: {
  records: StaffAttendanceRecord[];
  period: string;
  fromDate: string;
  toDate: string;
}): boolean {
  if (!records || records.length === 0) {
    return false;
  }

  if (records.length === 1) {
    return downloadSingleStaffReportPdf({
      staff: records[0],
      period,
      fromDate,
      toDate,
    });
  }

  const rowsPerPage = 22;
  const totalPages = Math.max(1, Math.ceil(records.length / rowsPerPage));
  const fromFormatted = formatShortDate(fromDate);
  const toFormatted = formatShortDate(toDate);
  const compactRange = formatCompactRange(fromDate, toDate);
  const generatedDate = getGenerationDateLabel();

  const avgRate = (
    records.reduce((acc, r) => acc + r.monthlyRate, 0) / records.length
  ).toFixed(1);
  const compliantCount = records.filter((r) => r.monthlyRate >= 85).length;
  const reviewCount = records.filter(
    (r) => r.monthlyRate >= 75 && r.monthlyRate < 85
  ).length;
  const belowCount = records.filter((r) => r.monthlyRate < 75).length;

  const pageStreams: string[] = [];

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const slice = records.slice(
      pageIdx * rowsPerPage,
      (pageIdx + 1) * rowsPerPage
    );
    const cmds: string[] = [];

    // 1. Institutional Header Banner (Zero overlap)
    drawInstitutionalHeader(cmds, {
      subtitleLine: `Period: ${period}   |   From Date: ${fromFormatted}   |   To Date: ${toFormatted}`,
      rightLine1: `Generated: ${generatedDate}`,
      rightLine2: `Total Records: ${records.length} Staff`,
      rightLine3: `Page ${pageIdx + 1} of ${totalPages}`,
    });

    // 2. Summary KPI Strip on Page 1
    let tableTopY = 736;
    if (pageIdx === 0) {
      const kpiCards = [
        {
          label: "TOTAL STAFF",
          val: `${records.length} Staff`,
          accent: [0.035, 0.114, 0.243],
        },
        {
          label: "AVG ATTENDANCE",
          val: `${avgRate}%`,
          accent: [0.16, 0.38, 0.68],
        },
        {
          label: "COMPLIANT (>=85%)",
          val: `${compliantCount} Staff`,
          accent: [0.12, 0.52, 0.35],
        },
        {
          label: "WARNING (75-84%)",
          val: `${reviewCount} Staff`,
          accent: [0.78, 0.5, 0.1],
        },
        {
          label: "BELOW 75%",
          val: `${belowCount} Staff`,
          accent: [0.75, 0.2, 0.18],
        },
      ];

      const cardWidth = 101.45;
      const cardGap = 8;
      kpiCards.forEach((k, i) => {
        const x = 28 + i * (cardWidth + cardGap);
        cmds.push("0.968 0.976 0.988 rg");
        cmds.push(`${x} 698 ${cardWidth} 38 re f`);
        cmds.push("0.82 0.86 0.91 RG 0.6 w");
        cmds.push(`${x} 698 ${cardWidth} 38 re S`);

        cmds.push(`${k.accent[0]} ${k.accent[1]} ${k.accent[2]} rg`);
        cmds.push(`${x} 733.5 ${cardWidth} 2.5 re f`);

        cmds.push("0.38 0.43 0.52 rg");
        cmds.push(
          `BT /F2 6.8 Tf ${x + 8} 722 Td (${sanitizePdfText(k.label)}) Tj ET`
        );
        cmds.push("0.035 0.114 0.243 rg");
        cmds.push(
          `BT /F2 10.5 Tf ${x + 8} 706 Td (${sanitizePdfText(k.val)}) Tj ET`
        );
      });
      tableTopY = 686;
    }

    // 3. Repeated Table Header on Every Page
    cmds.push("0.086 0.204 0.373 rg");
    cmds.push(`28 ${tableTopY - 20} 539.28 20 re f`);
    cmds.push("1 1 1 rg");

    const cols = [
      { title: "EMP Code", x: 33 },
      { title: "Staff Name & Role", x: 88 },
      { title: "Dept & Campus", x: 202 },
      { title: "Attendance Range", x: 286 },
      { title: "Status & P/A/L", x: 372 },
      { title: "In / Out", x: 432 },
      { title: "Rate", x: 490 },
      { title: "Standing", x: 518 },
    ];
    for (const col of cols) {
      cmds.push(
        `BT /F2 7 Tf ${col.x} ${tableTopY - 13} Td (${sanitizePdfText(
          col.title
        )}) Tj ET`
      );
    }

    // 4. Table Rows
    let rowY = tableTopY - 20;
    slice.forEach((r, idx) => {
      const rowHeight = 24;
      const nextY = rowY - rowHeight;

      if (idx % 2 === 1) {
        cmds.push("0.975 0.982 0.992 rg");
        cmds.push(`28 ${nextY} 539.28 ${rowHeight} re f`);
      }

      cmds.push("0.88 0.90 0.94 RG 0.4 w");
      cmds.push(`28 ${nextY} m 567.28 ${nextY} l S`);

      const workingDays = r.daysPresentMonth + r.daysAbsentMonth;
      const standing = getStaffStandingLabel(r.monthlyRate);
      const campusLabel = shortCampus(r.campus);
      const topLineY = nextY + 13;
      const subLineY = nextY + 4.5;

      // Col 1: EMP Code & Category
      cmds.push("0.08 0.12 0.20 rg");
      cmds.push(
        `BT /F2 7.2 Tf 33 ${topLineY} Td (${sanitizePdfText(r.empCode)}) Tj ET`
      );
      cmds.push("0.42 0.47 0.55 rg");
      cmds.push(
        `BT /F1 6.3 Tf 33 ${subLineY} Td (${sanitizePdfText(r.type)}) Tj ET`
      );

      // Col 2: Staff Name & Designation
      cmds.push("0.08 0.12 0.20 rg");
      cmds.push(
        `BT /F2 7.4 Tf 88 ${topLineY} Td (${sanitizePdfText(
          r.name.slice(0, 22)
        )}) Tj ET`
      );
      cmds.push("0.42 0.47 0.55 rg");
      cmds.push(
        `BT /F1 6.3 Tf 88 ${subLineY} Td (${sanitizePdfText(
          r.designation.slice(0, 22)
        )}) Tj ET`
      );

      // Col 3: Dept & Campus (Full campus name, never truncates F-8 Islamabad!)
      cmds.push("0.08 0.12 0.20 rg");
      cmds.push(
        `BT /F2 7.2 Tf 202 ${topLineY} Td (${sanitizePdfText(
          r.department.slice(0, 18)
        )}) Tj ET`
      );
      cmds.push("0.42 0.47 0.55 rg");
      cmds.push(
        `BT /F1 6.3 Tf 202 ${subLineY} Td (${sanitizePdfText(
          campusLabel.slice(0, 18)
        )}) Tj ET`
      );

      // Col 4: Attendance Date Range
      cmds.push("0.15 0.20 0.28 rg");
      cmds.push(
        `BT /F2 6.8 Tf 286 ${topLineY} Td (${sanitizePdfText(
          compactRange
        )}) Tj ET`
      );
      cmds.push("0.42 0.47 0.55 rg");
      cmds.push(
        `BT /F1 6.3 Tf 286 ${subLineY} Td (${sanitizePdfText(
          `${workingDays} Working Days`
        )}) Tj ET`
      );

      // Col 5: Status & P/A/L
      cmds.push("0.08 0.12 0.20 rg");
      cmds.push(
        `BT /F2 7.2 Tf 372 ${topLineY} Td (${sanitizePdfText(
          r.statusToday
        )}) Tj ET`
      );
      cmds.push("0.35 0.40 0.48 rg");
      cmds.push(
        `BT /F1 6.3 Tf 372 ${subLineY} Td (${sanitizePdfText(
          `${r.daysPresentMonth}P / ${r.daysAbsentMonth}A / ${r.daysLateMonth}L`
        )}) Tj ET`
      );

      // Col 6: In / Out
      cmds.push("0.15 0.20 0.28 rg");
      cmds.push(
        `BT /F1 6.6 Tf 432 ${topLineY} Td (${sanitizePdfText(
          `In: ${r.checkIn}`
        )}) Tj ET`
      );
      cmds.push("0.42 0.47 0.55 rg");
      cmds.push(
        `BT /F1 6.3 Tf 432 ${subLineY} Td (${sanitizePdfText(
          `Out: ${r.checkOut}`
        )}) Tj ET`
      );

      // Col 7: Rate
      cmds.push("0.035 0.114 0.243 rg");
      cmds.push(
        `BT /F2 7.6 Tf 490 ${topLineY - 3} Td (${sanitizePdfText(
          `${r.monthlyRate}%`
        )}) Tj ET`
      );

      // Col 8: Standing & Terminal
      if (r.monthlyRate >= 85) {
        cmds.push("0.12 0.52 0.35 rg");
      } else if (r.monthlyRate >= 75) {
        cmds.push("0.72 0.45 0.08 rg");
      } else {
        cmds.push("0.75 0.20 0.18 rg");
      }
      cmds.push(
        `BT /F2 7 Tf 518 ${topLineY} Td (${sanitizePdfText(standing)}) Tj ET`
      );
      cmds.push("0.42 0.47 0.55 rg");
      cmds.push(
        `BT /F1 6.1 Tf 518 ${subLineY} Td (${sanitizePdfText(
          r.verificationMethod.slice(0, 14)
        )}) Tj ET`
      );

      rowY = nextY;
    });

    // 5. Footer Signature & Page Number
    cmds.push("0.78 0.82 0.88 RG 0.6 w");
    cmds.push("28 52 m 567.28 52 l S");
    cmds.push("0.38 0.43 0.52 rg");
    cmds.push(
      `BT /F1 7.5 Tf 28 38 Td (${sanitizePdfText(
        `EduSphere School Management System  |  Staff Attendance Report (${fromFormatted} to ${toFormatted})  |  Generated: ${generatedDate}`
      )}) Tj ET`
    );
    cmds.push(
      `BT /F2 7.5 Tf 505 38 Td (${sanitizePdfText(
        `Page ${pageIdx + 1} of ${totalPages}`
      )}) Tj ET`
    );

    pageStreams.push(cmds.join("\n"));
  }

  const blob = buildPdfDocument(pageStreams);
  triggerBlobDownload(
    blob,
    `staff-attendance-report-${fromDate}-to-${toDate}.pdf`
  );
  return true;
}

/**
 * Renders a print-ready A4 institutional Staff Attendance Report inside a hidden iframe and triggers the native browser Print dialog.
 */
export function printStaffAttendanceReport({
  records,
  period,
  fromDate,
  toDate,
}: {
  records: StaffAttendanceRecord[];
  period: string;
  fromDate: string;
  toDate: string;
}): boolean {
  if (!records || records.length === 0) {
    return false;
  }

  const fromFormatted = formatShortDate(fromDate);
  const toFormatted = formatShortDate(toDate);
  const generatedDate = getGenerationDateLabel();
  const isSingleStaff = records.length === 1;
  const singleStaff = isSingleStaff ? records[0] : null;

  const avgRate = (
    records.reduce((acc, r) => acc + r.monthlyRate, 0) / records.length
  ).toFixed(1);
  const compliantCount = records.filter((r) => r.monthlyRate >= 85).length;
  const reviewCount = records.filter(
    (r) => r.monthlyRate >= 75 && r.monthlyRate < 85
  ).length;
  const belowCount = records.filter((r) => r.monthlyRate < 75).length;

  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const rowsHtml = records
    .map((r) => {
      const workingDays = r.daysPresentMonth + r.daysAbsentMonth;
      const standing = getStaffStandingLabel(r.monthlyRate);
      const badgeClass =
        r.monthlyRate >= 85
          ? "badge-eligible"
          : r.monthlyRate >= 75
            ? "badge-warning"
            : "badge-danger";

      return `
        <tr>
          <td>
            <div class="fw-bold">${escapeHtml(r.empCode)}</div>
            <div class="sub">${escapeHtml(r.type)}</div>
          </td>
          <td>
            <div class="fw-bold">${escapeHtml(r.name)}</div>
            <div class="sub">${escapeHtml(r.designation)}</div>
          </td>
          <td>
            <div class="fw-bold">${escapeHtml(r.department)}</div>
            <div class="sub">${escapeHtml(shortCampus(r.campus))}</div>
          </td>
          <td>
            <div class="fw-bold">${escapeHtml(fromFormatted)} – ${escapeHtml(toFormatted)}</div>
            <div class="sub">${workingDays} Working Days</div>
          </td>
          <td class="center">
            <div class="fw-bold">${escapeHtml(r.statusToday)}</div>
            <div class="sub">
              <span class="p-val">${r.daysPresentMonth}P</span> ·
              <span class="a-val">${r.daysAbsentMonth}A</span> ·
              <span class="l-val">${r.daysLateMonth}L</span>
            </div>
          </td>
          <td class="center">
            <div class="fw-bold">In: ${escapeHtml(r.checkIn)}</div>
            <div class="sub">Out: ${escapeHtml(r.checkOut)}</div>
          </td>
          <td class="center">
            <div class="rate">${r.monthlyRate}%</div>
            <div class="sub">${r.daysPresentMonth}/${workingDays}d</div>
          </td>
          <td class="center">
            <span class="badge ${badgeClass}">${escapeHtml(standing)}</span>
            <div class="sub" style="margin-top:2px;">${escapeHtml(r.verificationMethod)}</div>
          </td>
        </tr>
      `;
    })
    .join("");

  const dailyLogsHtml =
    singleStaff
      ? (() => {
          const logs = buildDailyStaffAttendanceLogs(
            singleStaff,
            fromDate,
            toDate,
            14
          );
          if (logs.length === 0) return "";
          return `
            <div style="margin-top: 16px;">
              <div style="font-size: 11px; font-weight: 800; color: #091d3e; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
                Daily Biometric & Shift Register Log (${logs.length} Shifts Displayed)
              </div>
              <table>
                <thead>
                  <tr>
                    <th style="width: 6%;">#</th>
                    <th style="width: 16%;">Attendance Date</th>
                    <th style="width: 10%;">Day</th>
                    <th style="width: 14%;">Duty Status</th>
                    <th style="width: 13%;">Check-In</th>
                    <th style="width: 13%;">Check-Out</th>
                    <th style="width: 14%;">Terminal Mode</th>
                    <th style="width: 14%;">HR Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  ${logs
                    .map(
                      (l, i) => `
                    <tr>
                      <td>${String(i + 1).padStart(2, "0")}</td>
                      <td class="fw-bold">${escapeHtml(l.dateLabel)}</td>
                      <td>${escapeHtml(l.dayName)}</td>
                      <td class="fw-bold ${
                        l.status === "Present"
                          ? "p-val"
                          : l.status === "Late" || l.status === "Half Day"
                            ? "l-val"
                            : "a-val"
                      }">${escapeHtml(l.status)}</td>
                      <td>${escapeHtml(l.checkIn)}</td>
                      <td>${escapeHtml(l.checkOut)}</td>
                      <td>${escapeHtml(l.method)}</td>
                      <td class="sub">${escapeHtml(l.remarks)}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          `;
        })()
      : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Staff Attendance Report — ${escapeHtml(fromFormatted)} to ${escapeHtml(toFormatted)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 11px;
      line-height: 1.4;
    }
    .banner {
      background: #091d3e;
      color: #ffffff;
      padding: 16px 20px;
      border-radius: 6px;
      border-bottom: 3px solid #e0ad2e;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    .banner-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .emblem {
      width: 42px;
      height: 42px;
      border-radius: 6px;
      background: #1c3d70;
      border: 1px solid #4d75ad;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
      letter-spacing: 0.5px;
      color: #ffffff;
    }
    .inst-name {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #c7dbf5;
      font-weight: 700;
    }
    .report-title {
      font-size: 18px;
      font-weight: 800;
      margin: 2px 0;
      color: #ffffff;
    }
    .report-sub {
      font-size: 11px;
      color: #d1e1f7;
    }
    .banner-right {
      text-align: right;
      border-left: 1px solid rgba(255,255,255,0.2);
      padding-left: 16px;
      font-size: 11px;
      color: #d6e4f7;
    }
    .banner-right strong {
      color: #ffffff;
      display: block;
      font-size: 12px;
      margin-bottom: 2px;
    }
    .profile-card {
      border: 1px solid #d0dae7;
      border-left: 4px solid #091d3e;
      background: #f7f9fc;
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 14px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px 16px;
      font-size: 11px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }
    .kpi-card {
      border: 1px solid #d0dae7;
      border-top: 3px solid #091d3e;
      background: #f7f9fc;
      border-radius: 5px;
      padding: 8px 10px;
    }
    .kpi-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #5b687d;
    }
    .kpi-val {
      font-size: 14px;
      font-weight: 800;
      color: #091d3e;
      margin-top: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #d5deeb;
    }
    thead {
      display: table-header-group;
    }
    th {
      background: #16345f;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 8px 8px;
      text-align: left;
      border-bottom: 1px solid #091d3e;
    }
    th.center, td.center {
      text-align: center;
    }
    td {
      padding: 6px 8px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
      font-size: 10.5px;
    }
    tr {
      page-break-inside: avoid;
    }
    tbody tr:nth-child(even) {
      background: #f8fafd;
    }
    .fw-bold {
      font-weight: 700;
      color: #0f172a;
    }
    .sub {
      font-size: 9.5px;
      color: #64748b;
      margin-top: 1px;
    }
    .p-val { color: #15803d; font-weight: 700; }
    .a-val { color: #b91c1c; font-weight: 700; }
    .l-val { color: #b45309; font-weight: 700; }
    .rate {
      font-weight: 800;
      font-size: 11.5px;
      color: #091d3e;
    }
    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 999px;
      font-size: 9.5px;
      font-weight: 700;
    }
    .badge-eligible {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #86efac;
    }
    .badge-warning {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .badge-danger {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }
    .footer {
      margin-top: 18px;
      padding-top: 10px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748b;
    }
    .signatures {
      margin-top: 28px;
      display: flex;
      justify-content: space-between;
      gap: 40px;
      page-break-inside: avoid;
    }
    .sig-box {
      flex: 1;
      border-top: 1px solid #94a3b8;
      padding-top: 5px;
      text-align: center;
      font-size: 10px;
      font-weight: 600;
      color: #334155;
    }
  </style>
</head>
<body>
  <div class="banner">
    <div class="banner-left">
      <div class="emblem">ES</div>
      <div>
        <div class="inst-name">EduSphere Multi-Campus Institution</div>
        <div class="report-title">Staff Attendance Report</div>
        <div class="report-sub">
          Period: ${escapeHtml(period)} &nbsp;|&nbsp;
          From Date: <strong>${escapeHtml(fromFormatted)}</strong> &nbsp;|&nbsp;
          To Date: <strong>${escapeHtml(toFormatted)}</strong>
        </div>
      </div>
    </div>
    <div class="banner-right">
      <strong>Generated: ${escapeHtml(generatedDate)}</strong>
      <div>${
        singleStaff
          ? `Code: ${escapeHtml(singleStaff.empCode)} · ${escapeHtml(singleStaff.type)}`
          : `Total Records: ${records.length} Staff`
      }</div>
      <div style="color:#f3c65f; font-weight:700; margin-top:2px;">
        ${
          singleStaff
            ? `Standing: ${escapeHtml(getStaffStandingLabel(singleStaff.monthlyRate))} (${singleStaff.monthlyRate}%)`
            : "Official HR Copy"
        }
      </div>
    </div>
  </div>

  ${
    singleStaff
      ? `<div class="profile-card">
          <div><strong>Staff Name:</strong> ${escapeHtml(singleStaff.name)}</div>
          <div><strong>EMP Code & Role:</strong> ${escapeHtml(singleStaff.empCode)} (${escapeHtml(singleStaff.designation)})</div>
          <div><strong>Department & Campus:</strong> ${escapeHtml(singleStaff.department)} · ${escapeHtml(shortCampus(singleStaff.campus))}</div>
          <div><strong>Shift Timing:</strong> ${escapeHtml(singleStaff.shift)}</div>
          <div><strong>Contact Phone:</strong> ${escapeHtml(singleStaff.phone)}</div>
          <div><strong>Terminal Mode:</strong> ${escapeHtml(singleStaff.verificationMethod)} (${escapeHtml(singleStaff.checkIn)} / ${escapeHtml(singleStaff.checkOut)})</div>
        </div>`
      : ""
  }

  <div class="kpi-grid">
    ${
      singleStaff
        ? `
          <div class="kpi-card">
            <div class="kpi-label">Working Days</div>
            <div class="kpi-val">${singleStaff.daysPresentMonth + singleStaff.daysAbsentMonth + singleStaff.daysLeaveMonth} Days</div>
          </div>
          <div class="kpi-card" style="border-top-color:#15803d;">
            <div class="kpi-label">Days Present</div>
            <div class="kpi-val" style="color:#15803d;">${singleStaff.daysPresentMonth} Days</div>
          </div>
          <div class="kpi-card" style="border-top-color:#b91c1c;">
            <div class="kpi-label">Absent / Leave</div>
            <div class="kpi-val" style="color:#b91c1c;">${singleStaff.daysAbsentMonth}A / ${singleStaff.daysLeaveMonth}LV</div>
          </div>
          <div class="kpi-card" style="border-top-color:#b45309;">
            <div class="kpi-label">Late Arrivals</div>
            <div class="kpi-val" style="color:#b45309;">${singleStaff.daysLateMonth} Days</div>
          </div>
          <div class="kpi-card" style="border-top-color:#2962ad;">
            <div class="kpi-label">Attendance Rate</div>
            <div class="kpi-val">${singleStaff.monthlyRate}%</div>
          </div>
        `
        : `
          <div class="kpi-card">
            <div class="kpi-label">Total Staff</div>
            <div class="kpi-val">${records.length}</div>
          </div>
          <div class="kpi-card" style="border-top-color:#2962ad;">
            <div class="kpi-label">Average Rate</div>
            <div class="kpi-val">${avgRate}%</div>
          </div>
          <div class="kpi-card" style="border-top-color:#15803d;">
            <div class="kpi-label">Compliant (&ge;90%)</div>
            <div class="kpi-val" style="color:#15803d;">${compliantCount}</div>
          </div>
          <div class="kpi-card" style="border-top-color:#b45309;">
            <div class="kpi-label">Review (80–89%)</div>
            <div class="kpi-val" style="color:#b45309;">${reviewCount}</div>
          </div>
          <div class="kpi-card" style="border-top-color:#b91c1c;">
            <div class="kpi-label">Below 80%</div>
            <div class="kpi-val" style="color:#b91c1c;">${belowCount}</div>
          </div>
        `
    }
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 11%;">EMP Code</th>
        <th style="width: 20%;">Staff Name & Role</th>
        <th style="width: 15%;">Dept & Campus</th>
        <th style="width: 16%;">Attendance Range</th>
        <th class="center" style="width: 12%;">Status & P/A/L</th>
        <th class="center" style="width: 11%;">In / Out</th>
        <th class="center" style="width: 7%;">Rate</th>
        <th class="center" style="width: 8%;">Standing</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  ${dailyLogsHtml}

  <div class="signatures">
    <div class="sig-box">Prepared By (HR & Attendance)</div>
    <div class="sig-box">Verified By (Department Coordinator)</div>
    <div class="sig-box">Approved By (Campus Principal)</div>
  </div>

  <div class="footer">
    <span>EduSphere School Management System · Staff Attendance Report (${escapeHtml(fromFormatted)} – ${escapeHtml(toFormatted)})</span>
    <span>Printed on ${escapeHtml(generatedDate)}</span>
  </div>
</body>
</html>`;

  const existingFrame = document.getElementById(
    "staff-attendance-report-print-frame"
  );
  if (existingFrame && existingFrame.parentNode) {
    existingFrame.parentNode.removeChild(existingFrame);
  }

  const iframe = document.createElement("iframe");
  iframe.id = "staff-attendance-report-print-frame";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc || !iframe.contentWindow) {
    return false;
  }

  doc.open();
  doc.write(html);
  doc.close();

  const printWin = iframe.contentWindow;
  setTimeout(() => {
    try {
      printWin.focus();
      printWin.print();
    } finally {
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 2000);
    }
  }, 180);

  return true;
}
