import type {
  DailyStudentStatus,
  StudentAttendanceRecord,
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

function getStandingLabel(rate: number): string {
  if (rate >= 85) return "Eligible";
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
  // If same year, shorten first date's year for compact table display
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

function resolveCheckOutTime(r: StudentAttendanceRecord): string {
  if (r.statusToday === "Absent" || r.statusToday === "Excused") return "-";
  return "02:15 PM";
}

interface DailyLogEntry {
  dateLabel: string;
  dayName: string;
  status: DailyStudentStatus;
  checkIn: string;
  checkOut: string;
  method: string;
  remarks: string;
}

function buildDailyAttendanceLogs(
  student: StudentAttendanceRecord,
  fromDate: string,
  toDate: string,
  maxRows = 14
): DailyLogEntry[] {
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
  const absentTarget = Math.min(student.daysAbsentMonth, totalWorking);
  const lateTarget =
    student.statusToday === "Late"
      ? Math.min(2, Math.max(0, totalWorking - absentTarget))
      : Math.min(1, Math.max(0, totalWorking - absentTarget));

  const entries: DailyLogEntry[] = workingDates.map((d, idx) => {
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

    // Distribute absences and late days deterministically across the range
    let status: DailyStudentStatus = "Present";
    if (idx === workingDates.length - 1) {
      status = student.statusToday;
    } else if (absentTarget > 0 && idx % 5 === 2 && idx < absentTarget * 5) {
      status = "Absent";
    } else if (lateTarget > 0 && idx === 3) {
      status = "Late";
    }

    const minuteOffset = (idx * 7 + Number(student.rollNo || 10)) % 14;
    const checkIn =
      status === "Absent" || status === "Excused"
        ? "-"
        : status === "Late"
          ? `08:${String(12 + (minuteOffset % 15)).padStart(2, "0")} AM`
          : `07:${String(41 + minuteOffset).padStart(2, "0")} AM`;

    const checkOut =
      status === "Absent" || status === "Excused" ? "-" : "02:15 PM";

    const method =
      status === "Absent"
        ? "Auto-Marked"
        : status === "Excused"
          ? "Leave Portal"
          : student.verificationMethod;

    const remarks =
      status === "Absent"
        ? "Guardian notified via SMS"
        : status === "Late"
          ? "Arrived after morning assembly"
          : status === "Excused"
            ? "Approved medical leave"
            : "Verified on-time arrival";

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

/**
 * Builds a standards-compliant multi-page PDF 1.4 binary document from content stream pages.
 * Fonts used:
 *   /F1 = Helvetica (regular)
 *   /F2 = Helvetica-Bold
 */
function buildPdfDocument(pageStreams: string[]): Blob {
  const objects: string[] = [];
  const addObject = (body: string) => {
    objects.push(body);
    return objects.length; // 1-based object number
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
 * Shared institutional PDF Header Banner (draws navy header with emblem, left title, vertical divider, and right metadata).
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
      "Student Attendance Report"
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
 * Generates and downloads an individual student's comprehensive Attendance Report PDF (A4 portrait).
 */
export function downloadStudentReportPdf({
  student,
  period,
  fromDate,
  toDate,
}: {
  student: StudentAttendanceRecord;
  period: string;
  fromDate: string;
  toDate: string;
}): boolean {
  const fromFormatted = formatShortDate(fromDate);
  const toFormatted = formatShortDate(toDate);
  const compactRange = formatCompactRange(fromDate, toDate);
  const generatedDate = getGenerationDateLabel();
  const standing = getStandingLabel(student.monthlyRate);
  const lateCount = student.statusToday === "Late" ? 2 : 1;
  const workingDays = Math.max(
    1,
    student.daysPresentMonth + student.daysAbsentMonth
  );
  const checkOut = resolveCheckOutTime(student);
  const campusLabel = shortCampus(student.campus);

  const cmds: string[] = [];

  // 1. Institutional Header Banner (Zero overlap)
  drawInstitutionalHeader(cmds, {
    subtitleLine: `Period: ${period}   |   Date Range: ${fromFormatted} - ${toFormatted} (${workingDays} Working Days)`,
    rightLine1: `Generated: ${generatedDate}`,
    rightLine2: `Roll #${student.rollNo}  |  ID: ${student.admissionNumber}`,
    rightLine3: `Standing: ${standing} (${student.monthlyRate}%)`,
  });

  // 2. Student Profile Card (y = 668 to 736)
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
    `BT /F2 11.5 Tf 42 718 Td (${sanitizePdfText(student.name)}) Tj ET`
  );
  cmds.push("0.30 0.36 0.45 rg");
  cmds.push(
    `BT /F2 8.2 Tf 220 718 Td (${sanitizePdfText(
      `Roll #${student.rollNo}   |   Admission No: ${student.admissionNumber}`
    )}) Tj ET`
  );
  cmds.push(
    `BT /F1 8.2 Tf 430 718 Td (${sanitizePdfText(
      `Verification: ${student.verificationMethod}`
    )}) Tj ET`
  );

  // Subtle horizontal divider inside profile card
  cmds.push("0.86 0.89 0.93 RG 0.5 w");
  cmds.push("42 710 m 555 710 l S");

  // Profile Grid Row 1
  cmds.push("0.38 0.43 0.52 rg");
  cmds.push("BT /F2 7.5 Tf 42 695 Td (CLASS & SECTION:) Tj ET");
  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F2 8.2 Tf 122 695 Td (${sanitizePdfText(
      `${student.className} - Section ${student.section}`
    )}) Tj ET`
  );

  cmds.push("0.38 0.43 0.52 rg");
  cmds.push("BT /F2 7.5 Tf 245 695 Td (CAMPUS:) Tj ET");
  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F2 8.2 Tf 288 695 Td (${sanitizePdfText(campusLabel)}) Tj ET`
  );

  cmds.push("0.38 0.43 0.52 rg");
  cmds.push("BT /F2 7.5 Tf 410 695 Td (CHECK-IN / OUT:) Tj ET");
  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F2 8.2 Tf 482 695 Td (${sanitizePdfText(
      `${student.checkInTime} / ${checkOut}`
    )}) Tj ET`
  );

  // Profile Grid Row 2
  cmds.push("0.38 0.43 0.52 rg");
  cmds.push("BT /F2 7.5 Tf 42 678 Td (GUARDIAN NAME:) Tj ET");
  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F1 8.2 Tf 122 678 Td (${sanitizePdfText(student.guardian)}) Tj ET`
  );

  cmds.push("0.38 0.43 0.52 rg");
  cmds.push("BT /F2 7.5 Tf 245 678 Td (CONTACT:) Tj ET");
  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F1 8.2 Tf 288 678 Td (${sanitizePdfText(student.phone)}) Tj ET`
  );

  cmds.push("0.38 0.43 0.52 rg");
  cmds.push("BT /F2 7.5 Tf 410 678 Td (LATEST STATUS:) Tj ET");
  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F2 8.2 Tf 482 678 Td (${sanitizePdfText(student.statusToday)}) Tj ET`
  );

  // 3. 5-Box KPI Strip (y = 608 to 656)
  const kpiCards = [
    {
      label: "WORKING DAYS",
      val: `${workingDays} Days`,
      sub: "Academic Sessions",
      accent: [0.035, 0.114, 0.243],
    },
    {
      label: "DAYS PRESENT",
      val: `${student.daysPresentMonth} Days`,
      sub: "Verified Present",
      accent: [0.12, 0.52, 0.35],
    },
    {
      label: "DAYS ABSENT",
      val: `${student.daysAbsentMonth} Days`,
      sub: "Recorded Absences",
      accent: [0.75, 0.2, 0.18],
    },
    {
      label: "LATE ARRIVALS",
      val: `${lateCount} ${lateCount === 1 ? "Day" : "Days"}`,
      sub: "After 08:00 AM",
      accent: [0.78, 0.5, 0.1],
    },
    {
      label: "ATTENDANCE RATE",
      val: `${student.monthlyRate}% (${standing})`,
      sub: "Min. Required: 75%",
      accent:
        student.monthlyRate >= 85
          ? [0.12, 0.52, 0.35]
          : student.monthlyRate >= 75
            ? [0.78, 0.5, 0.1]
            : [0.75, 0.2, 0.18],
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

    // Top Colored Accent Bar
    cmds.push(`${k.accent[0]} ${k.accent[1]} ${k.accent[2]} rg`);
    cmds.push(`${x} 653.5 ${cardWidth} 2.5 re f`);

    cmds.push("0.40 0.45 0.54 rg");
    cmds.push(
      `BT /F2 6.8 Tf ${x + 8} 642 Td (${sanitizePdfText(k.label)}) Tj ET`
    );
    cmds.push("0.035 0.114 0.243 rg");
    cmds.push(
      `BT /F2 10.5 Tf ${x + 8} 627 Td (${sanitizePdfText(k.val)}) Tj ET`
    );
    cmds.push("0.48 0.53 0.62 rg");
    cmds.push(
      `BT /F1 6.8 Tf ${x + 8} 614 Td (${sanitizePdfText(k.sub)}) Tj ET`
    );
  });

  // 4. Period Summary Table (y = 540 to 592)
  cmds.push("0.035 0.114 0.243 rg");
  cmds.push(
    `BT /F2 8.5 Tf 28 594 Td (${sanitizePdfText(
      "CUMULATIVE ATTENDANCE RECORD SUMMARY"
    )}) Tj ET`
  );

  const sumHeaderY = 568;
  cmds.push("0.086 0.204 0.373 rg");
  cmds.push(`28 ${sumHeaderY} 539.28 20 re f`);
  cmds.push("1 1 1 rg");

  const summaryCols = [
    { title: "Roll / ID", x: 33 },
    { title: "Student Name", x: 95 },
    { title: "Class & Campus", x: 202 },
    { title: "Attendance Range", x: 286 },
    { title: "Status & P/A/L", x: 372 },
    { title: "In / Out", x: 432 },
    { title: "Rate", x: 490 },
    { title: "Standing", x: 518 },
  ];
  for (const col of summaryCols) {
    cmds.push(
      `BT /F2 7 Tf ${col.x} ${sumHeaderY + 7} Td (${sanitizePdfText(
        col.title
      )}) Tj ET`
    );
  }

  const sumRowY = sumHeaderY - 26;
  cmds.push("0.98 0.985 0.995 rg");
  cmds.push(`28 ${sumRowY} 539.28 26 re f`);
  cmds.push("0.82 0.86 0.91 RG 0.6 w");
  cmds.push(`28 ${sumRowY} 539.28 26 re S`);

  const topY = sumRowY + 15;
  const subY = sumRowY + 5;

  // Col 1: Roll / ID
  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F2 7.4 Tf 33 ${topY} Td (${sanitizePdfText(
      `Roll #${student.rollNo}`
    )}) Tj ET`
  );
  cmds.push("0.42 0.47 0.55 rg");
  cmds.push(
    `BT /F1 6.6 Tf 33 ${subY} Td (${sanitizePdfText(
      student.admissionNumber
    )}) Tj ET`
  );

  // Col 2: Student Name & Guardian
  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F2 7.5 Tf 95 ${topY} Td (${sanitizePdfText(
      student.name.slice(0, 22)
    )}) Tj ET`
  );
  cmds.push("0.42 0.47 0.55 rg");
  cmds.push(
    `BT /F1 6.5 Tf 95 ${subY} Td (${sanitizePdfText(
      `G: ${student.guardian.slice(0, 18)}`
    )}) Tj ET`
  );

  // Col 3: Class & Campus (Full campus name, no truncation of Islamabad!)
  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F2 7.2 Tf 202 ${topY} Td (${sanitizePdfText(
      `${student.className} (Sec ${student.section})`
    )}) Tj ET`
  );
  cmds.push("0.42 0.47 0.55 rg");
  cmds.push(
    `BT /F1 6.5 Tf 202 ${subY} Td (${sanitizePdfText(
      campusLabel.slice(0, 18)
    )}) Tj ET`
  );

  // Col 4: Attendance Date Range
  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F2 7 Tf 286 ${topY} Td (${sanitizePdfText(compactRange)}) Tj ET`
  );
  cmds.push("0.42 0.47 0.55 rg");
  cmds.push(
    `BT /F1 6.5 Tf 286 ${subY} Td (${sanitizePdfText(
      `${workingDays} Working Days`
    )}) Tj ET`
  );

  // Col 5: Status & P/A/L
  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F2 7.2 Tf 372 ${topY} Td (${sanitizePdfText(
      student.statusToday
    )}) Tj ET`
  );
  cmds.push("0.35 0.40 0.48 rg");
  cmds.push(
    `BT /F1 6.5 Tf 372 ${subY} Td (${sanitizePdfText(
      `${student.daysPresentMonth}P / ${student.daysAbsentMonth}A / ${lateCount}L`
    )}) Tj ET`
  );

  // Col 6: In / Out
  cmds.push("0.15 0.20 0.28 rg");
  cmds.push(
    `BT /F1 6.7 Tf 432 ${topY} Td (${sanitizePdfText(
      `In: ${student.checkInTime}`
    )}) Tj ET`
  );
  cmds.push("0.42 0.47 0.55 rg");
  cmds.push(
    `BT /F1 6.4 Tf 432 ${subY} Td (${sanitizePdfText(
      `Out: ${checkOut}`
    )}) Tj ET`
  );

  // Col 7: Rate
  cmds.push("0.035 0.114 0.243 rg");
  cmds.push(
    `BT /F2 8 Tf 490 ${topY - 4} Td (${sanitizePdfText(
      `${student.monthlyRate}%`
    )}) Tj ET`
  );

  // Col 8: Standing
  if (student.monthlyRate >= 85) {
    cmds.push("0.12 0.52 0.35 rg");
  } else if (student.monthlyRate >= 75) {
    cmds.push("0.72 0.45 0.08 rg");
  } else {
    cmds.push("0.75 0.20 0.18 rg");
  }
  cmds.push(
    `BT /F2 7.2 Tf 518 ${topY} Td (${sanitizePdfText(standing)}) Tj ET`
  );
  cmds.push("0.42 0.47 0.55 rg");
  cmds.push(
    `BT /F1 6.2 Tf 518 ${subY} Td (${sanitizePdfText("Verified")}) Tj ET`
  );

  // 5. Daily Attendance Log Breakdown Table
  const dailyLogs = buildDailyAttendanceLogs(student, fromDate, toDate, 14);
  if (dailyLogs.length > 0) {
    cmds.push("0.035 0.114 0.243 rg");
    cmds.push(
      `BT /F2 8.5 Tf 28 522 Td (${sanitizePdfText(
        `DAILY ATTENDANCE REGISTER LOG (${dailyLogs.length} SESSIONS DISPLAYED)`
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
      { title: "Session Status", x: 176 },
      { title: "Check-In", x: 256 },
      { title: "Check-Out", x: 320 },
      { title: "Verification Mode", x: 384 },
      { title: "Official Remarks", x: 468 },
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

      // Status colored text
      if (entry.status === "Present") {
        cmds.push("0.12 0.52 0.35 rg");
      } else if (entry.status === "Late") {
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
    "BT /F2 7.2 Tf 48 80 Td (Prepared By (Attendance Officer)) Tj ET"
  );
  cmds.push(
    "BT /F2 7.2 Tf 236 80 Td (Verified By (Academic Coordinator)) Tj ET"
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
      `EduSphere School Management System  |  Student Attendance Report (${fromFormatted} to ${toFormatted})  |  Generated: ${generatedDate}`
    )}) Tj ET`
  );
  cmds.push("BT /F2 7.5 Tf 515 38 Td (Page 1 of 1) Tj ET");

  const slug = student.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const blob = buildPdfDocument([cmds.join("\n")]);
  triggerBlobDownload(
    blob,
    `student-attendance-report-${slug}-${fromDate}-to-${toDate}.pdf`
  );
  return true;
}

/**
 * Generates and downloads the currently fetched and filtered Student Attendance Report PDF (A4 portrait).
 * Automatically delegates to the comprehensive single-student layout when 1 student is selected.
 */
export function downloadAttendanceReportPdf({
  records,
  period,
  fromDate,
  toDate,
}: {
  records: StudentAttendanceRecord[];
  period: string;
  fromDate: string;
  toDate: string;
}): boolean {
  if (!records || records.length === 0) {
    return false;
  }

  // If filtering by a single specific student, generate the rich Individual Student Attendance Report PDF
  if (records.length === 1) {
    return downloadStudentReportPdf({
      student: records[0],
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
  const eligibleCount = records.filter((r) => r.monthlyRate >= 85).length;
  const warningCount = records.filter(
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
      rightLine2: `Total Records: ${records.length} Students`,
      rightLine3: `Page ${pageIdx + 1} of ${totalPages}`,
    });

    // 2. Summary KPI Strip on Page 1
    let tableTopY = 736;
    if (pageIdx === 0) {
      const kpiCards = [
        {
          label: "TOTAL STUDENTS",
          val: `${records.length} Students`,
          accent: [0.035, 0.114, 0.243],
        },
        {
          label: "AVG ATTENDANCE",
          val: `${avgRate}%`,
          accent: [0.16, 0.38, 0.68],
        },
        {
          label: "ELIGIBLE (>=85%)",
          val: `${eligibleCount} Students`,
          accent: [0.12, 0.52, 0.35],
        },
        {
          label: "WARNING (75-84%)",
          val: `${warningCount} Students`,
          accent: [0.78, 0.5, 0.1],
        },
        {
          label: "BELOW 75%",
          val: `${belowCount} Students`,
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
      { title: "Roll / ID", x: 33 },
      { title: "Student Name", x: 95 },
      { title: "Class & Campus", x: 202 },
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

      const lateCount = r.statusToday === "Late" ? 2 : 1;
      const workingDays = r.daysPresentMonth + r.daysAbsentMonth;
      const standing = getStandingLabel(r.monthlyRate);
      const checkOut = resolveCheckOutTime(r);
      const campusLabel = shortCampus(r.campus);
      const topLineY = nextY + 13;
      const subLineY = nextY + 4.5;

      // Col 1: Roll / ID
      cmds.push("0.08 0.12 0.20 rg");
      cmds.push(
        `BT /F2 7.2 Tf 33 ${topLineY} Td (${sanitizePdfText(
          `Roll #${r.rollNo}`
        )}) Tj ET`
      );
      cmds.push("0.42 0.47 0.55 rg");
      cmds.push(
        `BT /F1 6.4 Tf 33 ${subLineY} Td (${sanitizePdfText(
          r.admissionNumber
        )}) Tj ET`
      );

      // Col 2: Student Name & Guardian
      cmds.push("0.08 0.12 0.20 rg");
      cmds.push(
        `BT /F2 7.4 Tf 95 ${topLineY} Td (${sanitizePdfText(
          r.name.slice(0, 22)
        )}) Tj ET`
      );
      cmds.push("0.42 0.47 0.55 rg");
      cmds.push(
        `BT /F1 6.3 Tf 95 ${subLineY} Td (${sanitizePdfText(
          `G: ${r.guardian.slice(0, 18)}`
        )}) Tj ET`
      );

      // Col 3: Class / Section & Campus (Full campus name, never truncates F-8 Islamabad!)
      cmds.push("0.08 0.12 0.20 rg");
      cmds.push(
        `BT /F2 7.2 Tf 202 ${topLineY} Td (${sanitizePdfText(
          `${r.className} (Sec ${r.section})`
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
        `BT /F1 6.4 Tf 372 ${subLineY} Td (${sanitizePdfText(
          `${r.daysPresentMonth}P / ${r.daysAbsentMonth}A / ${lateCount}L`
        )}) Tj ET`
      );

      // Col 6: Check-In / Check-Out Time
      cmds.push("0.15 0.20 0.28 rg");
      cmds.push(
        `BT /F1 6.6 Tf 432 ${topLineY} Td (${sanitizePdfText(
          `In: ${r.checkInTime}`
        )}) Tj ET`
      );
      cmds.push("0.42 0.47 0.55 rg");
      cmds.push(
        `BT /F1 6.3 Tf 432 ${subLineY} Td (${sanitizePdfText(
          `Out: ${checkOut}`
        )}) Tj ET`
      );

      // Col 7: Rate
      cmds.push("0.035 0.114 0.243 rg");
      cmds.push(
        `BT /F2 7.6 Tf 490 ${topLineY - 3} Td (${sanitizePdfText(
          `${r.monthlyRate}%`
        )}) Tj ET`
      );

      // Col 8: Standing & Verification
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
        `EduSphere School Management System  |  Student Attendance Report (${fromFormatted} to ${toFormatted})  |  Generated: ${generatedDate}`
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
    `student-attendance-report-${fromDate}-to-${toDate}.pdf`
  );
  return true;
}

/**
 * Renders a print-ready A4 institutional report inside a hidden iframe and triggers the native browser Print dialog.
 * Does NOT download a PDF.
 */
export function printAttendanceReport({
  records,
  period,
  fromDate,
  toDate,
}: {
  records: StudentAttendanceRecord[];
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
  const dateCellLabel =
    fromDate === toDate ? fromFormatted : `${fromFormatted} – ${toFormatted}`;

  const avgRate = (
    records.reduce((acc, r) => acc + r.monthlyRate, 0) / records.length
  ).toFixed(1);
  const eligibleCount = records.filter((r) => r.monthlyRate >= 85).length;
  const warningCount = records.filter(
    (r) => r.monthlyRate >= 75 && r.monthlyRate < 85
  ).length;
  const belowCount = records.filter((r) => r.monthlyRate < 75).length;

  const isSingle = records.length === 1;
  const single = isSingle ? records[0] : null;
  const singleDailyLogs =
    isSingle && single ? buildDailyAttendanceLogs(single, fromDate, toDate, 15) : [];

  const rowsHtml = records
    .map((r, index) => {
      const lateCount = r.statusToday === "Late" ? 2 : 1;
      const workingDays = r.daysPresentMonth + r.daysAbsentMonth;
      const standing = getStandingLabel(r.monthlyRate);
      const checkOut = resolveCheckOutTime(r);
      const badgeClass =
        r.monthlyRate >= 85
          ? "standing-eligible"
          : r.monthlyRate >= 75
            ? "standing-warning"
            : "standing-danger";

      return `
        <tr>
          <td class="center">${index + 1}</td>
          <td>
            <div class="student-name">Roll #${r.rollNo}</div>
            <div class="sub">${r.admissionNumber}</div>
          </td>
          <td>
            <div class="student-name">${r.name}</div>
            <div class="sub">Guardian: ${r.guardian} (${r.phone})</div>
          </td>
          <td class="center">
            <div class="student-name">${r.className} — Sec ${r.section}</div>
            <div class="sub">${shortCampus(r.campus)}</div>
          </td>
          <td class="center">
            <div class="student-name">${dateCellLabel}</div>
            <div class="sub">${workingDays} working days</div>
          </td>
          <td class="center">
            <div class="student-name">${r.statusToday}</div>
            <div class="sub">
              <span class="p-count">${r.daysPresentMonth}P</span> ·
              <span class="a-count">${r.daysAbsentMonth}A</span> ·
              <span class="l-count">${lateCount}L</span>
            </div>
          </td>
          <td class="center">
            <div class="student-name">In: ${r.checkInTime}</div>
            <div class="sub">Out: ${checkOut}</div>
          </td>
          <td class="center">
            <div class="rate-val">${r.monthlyRate}%</div>
            <span class="standing-badge ${badgeClass}">${standing}</span>
          </td>
          <td>
            <div class="sub">${r.remarks || `Verified (${r.verificationMethod})`}</div>
          </td>
        </tr>
      `;
    })
    .join("");

  const dailyLogsHtml =
    isSingle && singleDailyLogs.length > 0
      ? `
      <h3 class="section-heading">Daily Attendance Register Log (${singleDailyLogs.length} Sessions)</h3>
      <table style="margin-top: 6px;">
        <thead>
          <tr>
            <th class="center" style="width: 5%;">#</th>
            <th style="width: 15%;">Date</th>
            <th class="center" style="width: 10%;">Day</th>
            <th class="center" style="width: 14%;">Status</th>
            <th class="center" style="width: 14%;">Check-In</th>
            <th class="center" style="width: 14%;">Check-Out</th>
            <th class="center" style="width: 14%;">Verification</th>
            <th style="width: 14%;">Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${singleDailyLogs
            .map(
              (entry, idx) => `
            <tr>
              <td class="center">${String(idx + 1).padStart(2, "0")}</td>
              <td><div class="student-name">${entry.dateLabel}</div></td>
              <td class="center">${entry.dayName}</td>
              <td class="center">
                <span class="standing-badge ${
                  entry.status === "Present"
                    ? "standing-eligible"
                    : entry.status === "Late"
                      ? "standing-warning"
                      : "standing-danger"
                }">${entry.status}</span>
              </td>
              <td class="center">${entry.checkIn}</td>
              <td class="center">${entry.checkOut}</td>
              <td class="center"><div class="sub">${entry.method}</div></td>
              <td><div class="sub">${entry.remarks}</div></td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `
      : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Student Attendance Report — ${fromFormatted} to ${toFormatted}</title>
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
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 10.5px;
      line-height: 1.4;
    }
    .masthead {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #091d3e;
      color: #ffffff;
      padding: 14px 18px;
      border-radius: 8px;
      border-bottom: 3px solid #eab308;
      margin-bottom: 14px;
    }
    .brand-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-box {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: #16345f;
      border: 1px solid #3f6396;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 800;
      font-size: 14px;
    }
    .school-name {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #cbd5e1;
      margin: 0;
    }
    .report-heading {
      font-size: 17px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
      margin: 2px 0 2px;
    }
    .report-sub {
      font-size: 9.5px;
      color: #dbeafe;
      margin: 0;
    }
    .meta-box {
      text-align: right;
      font-size: 9.5px;
      color: #e2e8f0;
      line-height: 1.55;
      border-left: 1px solid #334e78;
      padding-left: 16px;
    }
    .meta-box strong {
      color: #ffffff;
    }
    .profile-card {
      border: 1px solid #cbd5e1;
      border-left: 4px solid #091d3e;
      border-radius: 6px;
      background: #f8fafc;
      padding: 10px 14px;
      margin-bottom: 12px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px 16px;
      font-size: 10px;
    }
    .profile-card strong {
      color: #091d3e;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-bottom: 14px;
    }
    .kpi-card {
      border: 1px solid #cbd5e1;
      border-top: 3px solid #091d3e;
      border-radius: 6px;
      padding: 7px 10px;
      background: #f8fafc;
    }
    .kpi-label {
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #64748b;
    }
    .kpi-val {
      font-size: 13px;
      font-weight: 800;
      color: #091d3e;
      margin-top: 2px;
    }
    .section-heading {
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #091d3e;
      margin: 14px 0 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #cbd5e1;
    }
    thead {
      display: table-header-group;
    }
    tr {
      page-break-inside: avoid;
    }
    thead th {
      background: #091d3e;
      color: #ffffff;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      padding: 6px 6px;
      text-align: left;
      border: 1px solid #091d3e;
    }
    thead th.center, td.center {
      text-align: center;
    }
    tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    tbody td {
      padding: 5px 6px;
      border-bottom: 1px solid #e2e8f0;
      border-right: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    .student-name {
      font-weight: 600;
      color: #0f172a;
      font-size: 10px;
    }
    .sub {
      font-size: 9px;
      color: #64748b;
    }
    .p-count { color: #15803d; font-weight: 700; }
    .a-count { color: #b91c1c; font-weight: 700; }
    .l-count { color: #b45309; font-weight: 700; }
    .rate-val { font-weight: 700; color: #0f172a; font-size: 10px; }
    .standing-badge {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 999px;
      font-size: 8.5px;
      font-weight: 700;
      margin-top: 2px;
    }
    .standing-eligible {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #86efac;
    }
    .standing-warning {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .standing-danger {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }
    .signatures {
      margin-top: 26px;
      display: flex;
      justify-content: space-between;
      padding-top: 12px;
      page-break-inside: avoid;
    }
    .sig-block {
      width: 28%;
      border-top: 1px solid #475569;
      padding-top: 5px;
      text-align: center;
      font-size: 9.5px;
      font-weight: 600;
      color: #334155;
    }
  </style>
</head>
<body>
  <div class="masthead">
    <div class="brand-left">
      <div class="logo-box">ES</div>
      <div>
        <p class="school-name">EduSphere Multi-Campus Institution</p>
        <h1 class="report-heading">Student Attendance Report</h1>
        <p class="report-sub">Period: ${period} &nbsp;|&nbsp; Date Range: ${fromFormatted} – ${toFormatted}</p>
      </div>
    </div>
    <div class="meta-box">
      ${
        isSingle && single
          ? `<div><strong>Generated:</strong> ${generatedDate}</div>
             <div><strong>Roll #:</strong> ${single.rollNo} &nbsp;|&nbsp; <strong>ID:</strong> ${single.admissionNumber}</div>
             <div><strong>Standing:</strong> ${getStandingLabel(single.monthlyRate)} (${single.monthlyRate}%)</div>`
          : `<div><strong>Generated On:</strong> ${generatedDate}</div>
             <div><strong>Reporting Period:</strong> ${period}</div>
             <div><strong>Total Records:</strong> ${records.length} Students</div>`
      }
    </div>
  </div>

  ${
    isSingle && single
      ? `<div class="profile-card">
           <div><strong>Student Name:</strong> ${single.name}</div>
           <div><strong>Class & Section:</strong> ${single.className} — Section ${single.section}</div>
           <div><strong>Campus:</strong> ${shortCampus(single.campus)}</div>
           <div><strong>Guardian:</strong> ${single.guardian}</div>
           <div><strong>Contact Phone:</strong> ${single.phone}</div>
           <div><strong>Verification:</strong> ${single.verificationMethod}</div>
         </div>`
      : ""
  }

  <div class="kpi-grid">
    ${
      isSingle && single
        ? `<div class="kpi-card">
             <div class="kpi-label">Working Days</div>
             <div class="kpi-val">${single.daysPresentMonth + single.daysAbsentMonth} Days</div>
           </div>
           <div class="kpi-card" style="border-top-color: #15803d;">
             <div class="kpi-label">Days Present</div>
             <div class="kpi-val" style="color: #15803d;">${single.daysPresentMonth} Days</div>
           </div>
           <div class="kpi-card" style="border-top-color: #b91c1c;">
             <div class="kpi-label">Days Absent</div>
             <div class="kpi-val" style="color: #b91c1c;">${single.daysAbsentMonth} Days</div>
           </div>
           <div class="kpi-card" style="border-top-color: #b45309;">
             <div class="kpi-label">Late Arrivals</div>
             <div class="kpi-val" style="color: #b45309;">${single.statusToday === "Late" ? 2 : 1} Days</div>
           </div>
           <div class="kpi-card">
             <div class="kpi-label">Attendance Rate</div>
             <div class="kpi-val">${single.monthlyRate}% (${getStandingLabel(single.monthlyRate)})</div>
           </div>`
        : `<div class="kpi-card">
             <div class="kpi-label">Total Students</div>
             <div class="kpi-val">${records.length} Students</div>
           </div>
           <div class="kpi-card">
             <div class="kpi-label">Avg Attendance</div>
             <div class="kpi-val">${avgRate}%</div>
           </div>
           <div class="kpi-card" style="border-top-color: #15803d;">
             <div class="kpi-label">Eligible (&ge;85%)</div>
             <div class="kpi-val">${eligibleCount}</div>
           </div>
           <div class="kpi-card" style="border-top-color: #b45309;">
             <div class="kpi-label">Warning (75–84%)</div>
             <div class="kpi-val">${warningCount}</div>
           </div>
           <div class="kpi-card" style="border-top-color: #b91c1c;">
             <div class="kpi-label">Below 75%</div>
             <div class="kpi-val">${belowCount}</div>
           </div>`
    }
  </div>

  <table>
    <thead>
      <tr>
        <th class="center" style="width: 4%;">#</th>
        <th style="width: 11%;">Roll / ID</th>
        <th style="width: 20%;">Student Name</th>
        <th class="center" style="width: 14%;">Class & Campus</th>
        <th class="center" style="width: 14%;">Attendance Date</th>
        <th class="center" style="width: 11%;">Status (P/A/L)</th>
        <th class="center" style="width: 11%;">In / Out</th>
        <th class="center" style="width: 7%;">Rate</th>
        <th style="width: 8%;">Remarks</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  ${dailyLogsHtml}

  <div class="signatures">
    <div class="sig-block">Prepared By (Attendance Officer)</div>
    <div class="sig-block">Verified By (Academic Coordinator)</div>
    <div class="sig-block">Approved By (Campus Principal)</div>
  </div>
</body>
</html>`;

  const existingIframe = document.getElementById(
    "attendance-report-print-frame"
  ) as HTMLIFrameElement | null;
  if (existingIframe) {
    existingIframe.remove();
  }

  const iframe = document.createElement("iframe");
  iframe.id = "attendance-report-print-frame";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return false;
  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  }, 250);

  return true;
}
