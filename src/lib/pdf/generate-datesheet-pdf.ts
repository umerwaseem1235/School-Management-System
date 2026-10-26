import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate } from "@/lib/format";
import type { DatesheetEntry } from "@/lib/mock/examinations";

export interface GenerateDatesheetPDFOptions {
  entries: DatesheetEntry[];
  termName?: string;
  selectedClass?: string;
}

export function generateDatesheetPDF({
  entries,
  termName = "Mid-Term Examination 2026–27",
  selectedClass = "ALL",
}: GenerateDatesheetPDFOptions) {
  // A4 Portrait dimensions in mm: 210 x 297
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 12;
  const usableWidth = pageWidth - marginX * 2; // 186mm

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  /* ─────────────────────────────────────────────────────────────
     1. Header Brand Banner
     ───────────────────────────────────────────────────────────── */
  // Navy background header banner
  doc.setFillColor(30, 66, 117); // #1e4275 (Primary Brand Navy)
  doc.rect(0, 0, pageWidth, 28, "F");

  // Accent divider lines
  doc.setFillColor(60, 111, 176); // #3c6fb0
  doc.rect(0, 26.5, pageWidth, 1.2, "F");
  doc.setFillColor(96, 165, 250); // #60a5fa
  doc.rect(0, 27.7, pageWidth, 0.3, "F");

  // School Emblem / Logo simulation box
  doc.setFillColor(45, 85, 145);
  doc.roundedRect(marginX, 4.5, 19, 19, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("SMS", marginX + 9.5, 16.5, { align: "center" });

  // Main Institutional Titles
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("SCHOOL MANAGEMENT SYSTEM", marginX + 24, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(191, 219, 254); // soft sky blue #bfdbfe
  doc.text(
    "Office of the Controller of Examinations · Affiliated with Academic Board",
    marginX + 24,
    18
  );

  doc.setFontSize(7.5);
  doc.setTextColor(147, 197, 253);
  doc.text(
    `Official Examination Datesheet · Issue Date: ${dateStr}`,
    marginX + 24,
    23
  );

  /* ─────────────────────────────────────────────────────────────
     2. Document Title & Parameter Cards
     ───────────────────────────────────────────────────────────── */
  // Document Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(`${termName.toUpperCase()} DATE SHEET`, pageWidth / 2, 36, {
    align: "center",
  });

  // Parameters Info Grid
  const cardY = 41;
  const cardHeight = 11;
  const cardWidth = usableWidth / 4 - 2;

  const metadataCards = [
    {
      label: "CLASS / GRADE",
      value: selectedClass === "ALL" ? "All Enrolled Classes" : selectedClass,
    },
    { label: "ACADEMIC YEAR", value: "2026 – 2027" },
    { label: "EXAM SHIFT", value: "Morning (08:30 – 11:30)" },
    { label: "REPORTING TIME", value: "08:15 AM Sharp" },
  ];

  metadataCards.forEach((c, i) => {
    const x = marginX + i * (cardWidth + 2.6);
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(c.label, x + 3, cardY + 4);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(c.value, x + 3, cardY + 8.5);
  });

  /* ─────────────────────────────────────────────────────────────
     3. Datesheet Table (autoTable)
     ───────────────────────────────────────────────────────────── */
  const isAllClass = selectedClass === "ALL";

  const headRow = isAllClass
    ? [
        "#",
        "Date & Day",
        "Class",
        "Subject Paper",
        "Timing & Shift",
        "Marks (Max/Pass)",
        "Hall / Room",
      ]
    : [
        "#",
        "Date & Day",
        "Subject Paper",
        "Timing & Shift",
        "Marks (Max/Pass)",
        "Hall / Room",
      ];

  const tableRows = entries.map((e, idx) => {
    const dateFormatted = `${formatDate(e.examDate)} (${e.day})`;
    const timing = `${e.startTime} – ${e.endTime}`;
    const marks = `${e.maxMarks} (Pass: ${e.passMarks})`;

    if (isAllClass) {
      return [
        String(idx + 1),
        dateFormatted,
        e.className,
        e.subject,
        timing,
        marks,
        e.roomHall,
      ];
    }
    return [
      String(idx + 1),
      dateFormatted,
      e.subject,
      timing,
      marks,
      e.roomHall,
    ];
  });

  autoTable(doc, {
    head: [headRow],
    body: tableRows,
    startY: 56,
    margin: { left: marginX, right: marginX, bottom: 42 },
    theme: "plain",
    tableWidth: usableWidth,
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: { top: 2.2, bottom: 2.2, left: 2, right: 2 },
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      textColor: [30, 41, 59],
      valign: "middle",
    },
    headStyles: {
      fillColor: [30, 66, 117], // Brand navy
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      cellPadding: { top: 2.6, bottom: 2.6, left: 2, right: 2 },
      halign: "center",
      lineColor: [30, 66, 117],
    },
    alternateRowStyles: {
      fillColor: [250, 252, 255], // subtle tint
    },
    columnStyles: isAllClass
      ? {
          0: { cellWidth: 8, halign: "center", fontStyle: "bold" },
          1: { cellWidth: 36, halign: "left" },
          2: { cellWidth: 26, halign: "left" },
          3: { cellWidth: 44, halign: "left", fontStyle: "bold" },
          4: { cellWidth: 30, halign: "center" },
          5: { cellWidth: 24, halign: "center" },
          6: { cellWidth: 18, halign: "center" },
        }
      : {
          0: { cellWidth: 8, halign: "center", fontStyle: "bold" },
          1: { cellWidth: 42, halign: "left" },
          2: { cellWidth: 54, halign: "left", fontStyle: "bold" },
          3: { cellWidth: 36, halign: "center" },
          4: { cellWidth: 26, halign: "center" },
          5: { cellWidth: 20, halign: "center" },
        },
  });

  /* ─────────────────────────────────────────────────────────────
     4. Important Candidate Instructions & Signatures (Attached After Table)
     ───────────────────────────────────────────────────────────── */
  const finalY = (doc as any).lastAutoTable?.finalY || 180;
  let currentY = finalY + 5;

  // Check if we have enough room on the page for instructions & signature, else add page
  if (currentY > 215) {
    doc.addPage();
    currentY = 20;
  }

  // Instructions Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, currentY, usableWidth, 34, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(30, 66, 117);
  doc.text("IMPORTANT INSTRUCTIONS FOR CANDIDATES:", marginX + 3.5, currentY + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);

  const instructions = [
    "1. Punctuality: Candidates must be seated in their examination room at least 15 minutes before exam commencement (08:15 AM).",
    "2. Mandatory Documents: Original Roll Number Slip and student photo identity card are compulsory for admission.",
    "3. Prohibited Devices: Mobile phones, smartwatches, digital wristbands, and unapproved materials are strictly prohibited.",
    "4. Passing Benchmark: Minimum 33% marks are required in each individual paper (theory & practical components) to pass.",
    "5. Stationery & Supplies: Candidates must bring transparent clipboards and their own stationery. Borrowing is forbidden.",
    "6. Dismissal Policy: No student will be permitted to hand over the answer script or leave the room before half time has elapsed.",
  ];

  instructions.forEach((inst, i) => {
    doc.text(inst, marginX + 3.5, currentY + 9 + i * 4);
  });

  // Signatures Section
  const sigY = currentY + 42;

  // Left: Controller of Examinations
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.4);
  doc.line(marginX + 5, sigY, marginX + 50, sigY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("Controller of Examinations", marginX + 27.5, sigY + 4, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Central Examination Cell", marginX + 27.5, sigY + 7.5, {
    align: "center",
  });

  // Center: Official Seal Placeholder
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.roundedRect(pageWidth / 2 - 12, sigY - 10, 24, 18, 2, 2, "D");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text("OFFICIAL SEAL", pageWidth / 2, sigY - 2, { align: "center" });
  doc.text("INSTITUTION", pageWidth / 2, sigY + 2, { align: "center" });

  // Right: Principal / Head of School
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.4);
  doc.line(pageWidth - marginX - 50, sigY, pageWidth - marginX - 5, sigY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("Principal / Head of School", pageWidth - marginX - 27.5, sigY + 4, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("School Management System", pageWidth - marginX - 27.5, sigY + 7.5, {
    align: "center",
  });

  /* ─────────────────────────────────────────────────────────────
     5. Page Footer (Timestamp & Page Number)
     ───────────────────────────────────────────────────────────── */
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `School Management System · Generated on ${dateStr} ${timeStr}`,
      marginX,
      pageHeight - 6
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginX, pageHeight - 6, {
      align: "right",
    });
  }

  // File download
  const cleanTerm = termName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  const filename = `Datesheet_${cleanTerm}.pdf`;
  doc.save(filename);
  return filename;
}
