import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCampusDisplay } from "@/lib/format";
import type { Student } from "@/types";

export interface GeneratePDFOptions {
  students: Student[];
  title?: string;
  campusName?: string;
  filterSummary?: string;
}

export function generateStudentsPDF({
  students,
  title,
  campusName,
  filterSummary,
}: GeneratePDFOptions) {
  // Determine campus scope
  const isAll = !campusName || campusName === "all" || campusName === "All Campuses";
  const campusInfo = !isAll && campusName ? formatCampusDisplay(campusName) : null;
  const effectiveTitle =
    title ||
    (campusInfo
      ? `${campusInfo.primary} Directory & Enrollment Report`
      : "Student Directory & Enrollment Report");

  // Initialize PDF in landscape A4 mode (297mm x 210mm)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const marginX = 14;
  const usableWidth = pageWidth - marginX * 2; // 269mm

  // Summary Metrics
  const total = students.length;
  const activeCount = students.filter((s) => s.status === "Active").length;
  const maleCount = students.filter((s) => s.gender === "Male").length;
  const femaleCount = students.filter((s) => s.gender === "Female").length;
  const avgAttendance =
    students.reduce((acc, s) => acc + (s.attendance ?? 0), 0) / (total || 1);

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
  const timestamp = `${dateStr} · ${timeStr}`;

  /* ─────────────────────────────────────────────────────────────
     1. Top Brand Banner (Page 1)
     ───────────────────────────────────────────────────────────── */
  // Main navy background banner
  doc.setFillColor(30, 66, 117); // #1e4275
  doc.rect(0, 0, pageWidth, 28, "F");

  // Accent gradient/cyan border lines
  doc.setFillColor(60, 111, 176); // #3c6fb0
  doc.rect(0, 26.5, pageWidth, 1.2, "F");

  doc.setFillColor(96, 165, 250); // #60a5fa
  doc.rect(0, 27.7, pageWidth, 0.3, "F");

  // School Crest / Logo simulation box
  doc.setFillColor(45, 85, 145);
  doc.roundedRect(marginX, 4.5, 19, 19, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("ES", marginX + 9.5, 17, { align: "center" });

  // Main Header Titles
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text("EDUSPHERE SCHOOL MANAGEMENT SYSTEM", marginX + 24, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(191, 219, 254); // soft sky blue #bfdbfe
  doc.text(
    `Super Admin Console · ${effectiveTitle} · Academic Session 2026`,
    marginX + 24,
    18
  );

  doc.setFontSize(7.5);
  doc.setTextColor(147, 197, 253);
  if (campusInfo) {
    doc.text(
      `Branch Location: ${campusInfo.primary}${campusInfo.secondary ? ` (${campusInfo.secondary})` : ""} · Official Campus Registry${filterSummary ? ` · ${filterSummary}` : ""}`,
      marginX + 24,
      23
    );
  } else {
    doc.text(
      `Multi-Campus Central Repository · All Enrolled Branches${filterSummary ? ` · ${filterSummary}` : ""}`,
      marginX + 24,
      23
    );
  }

  // Metadata Right Side
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Generated: ${timestamp}`, pageWidth - marginX, 11, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(191, 219, 254);
  doc.text(
    campusInfo ? `Scope: ${campusInfo.primary}` : "Scope: All Campuses Central",
    pageWidth - marginX,
    16,
    {
      align: "right",
    }
  );

  doc.setFillColor(34, 197, 94);
  doc.circle(pageWidth - marginX - 32, 21, 1.2, "F");
  doc.setTextColor(240, 253, 244);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Official Record", pageWidth - marginX, 22, { align: "right" });

  /* ─────────────────────────────────────────────────────────────
     2. KPI Summary Cards Strip (Page 1)
     ───────────────────────────────────────────────────────────── */
  const cardY = 32;
  const cardHeight = 15;
  const cardGap = 4;
  const cardWidth = (usableWidth - cardGap * 3) / 4; // ~64mm each

  const kpis = [
    {
      label: campusInfo ? "CAMPUS ENROLLED" : "TOTAL ENROLLED",
      value: String(total),
      subtext: campusInfo ? campusInfo.primary : "All Campuses Central",
      accent: [30, 66, 117] as [number, number, number],
      valueColor: [30, 66, 117] as [number, number, number],
    },
    {
      label: "ACTIVE STUDENTS",
      value: String(activeCount),
      subtext: `${((activeCount / (total || 1)) * 100).toFixed(0)}% retention rate`,
      accent: [22, 163, 74] as [number, number, number],
      valueColor: [22, 163, 74] as [number, number, number],
    },
    {
      label: "GENDER RATIO",
      value: `${maleCount} M / ${femaleCount} F`,
      subtext: "Male / Female split",
      accent: [60, 111, 176] as [number, number, number],
      valueColor: [60, 111, 176] as [number, number, number],
    },
    {
      label: "AVERAGE ATTENDANCE",
      value: `${avgAttendance.toFixed(1)}%`,
      subtext: "Current academic term",
      accent: [14, 165, 233] as [number, number, number],
      valueColor: [14, 165, 233] as [number, number, number],
    },
  ];

  kpis.forEach((kpi, index) => {
    const x = marginX + index * (cardWidth + cardGap);

    // Card background
    doc.setFillColor(248, 250, 252); // #f8fafc
    doc.setDrawColor(226, 232, 240); // #e2e8f0
    doc.setLineWidth(0.3);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, "FD");

    // Left accent pill
    doc.setFillColor(kpi.accent[0], kpi.accent[1], kpi.accent[2]);
    doc.roundedRect(x, cardY, 2.5, cardHeight, 1, 1, "F");

    // KPI Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(kpi.label, x + 6, cardY + 4.5);

    // KPI Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(
      kpi.valueColor[0],
      kpi.valueColor[1],
      kpi.valueColor[2]
    );
    doc.text(kpi.value, x + 6, cardY + 10);

    // KPI Subtext
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(kpi.subtext, x + 6, cardY + 13.5);
  });

  /* ─────────────────────────────────────────────────────────────
     3. Table Data Preparation
     ───────────────────────────────────────────────────────────── */
  const tableHeaders = [
    [
      "#",
      "Admission ID",
      "Roll",
      "Student Name",
      "Gender",
      "Class",
      "Campus",
      "Guardian Name",
      "Phone",
      "Attendance",
      "Fee Status",
      "Status",
    ],
  ];

  const tableRows = students.map((s, idx) => {
    const campusInfo = formatCampusDisplay(s.campus);
    const campusShort = campusInfo.primary;

    return [
      String(idx + 1),
      s.admissionNumber,
      s.rollNo,
      s.name,
      s.gender,
      `${s.className} (${s.section})`,
      campusShort,
      s.guardian,
      s.phone,
      `${s.attendance}%`,
      s.feeStatus,
      s.status,
    ];
  });

  /* ─────────────────────────────────────────────────────────────
     4. Generate AutoTable
     ───────────────────────────────────────────────────────────── */
  autoTable(doc, {
    head: tableHeaders,
    body: tableRows,
    startY: 51,
    margin: { left: marginX, right: marginX, top: 16, bottom: 15 },
    theme: "plain",
    tableWidth: usableWidth,
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: { top: 2.2, bottom: 2.2, left: 1.5, right: 1.5 },
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      textColor: [30, 41, 59],
      valign: "middle",
    },
    headStyles: {
      fillColor: [30, 66, 117], // Navy
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      cellPadding: { top: 2.8, bottom: 2.8, left: 1.5, right: 1.5 },
      halign: "center",
      lineColor: [30, 66, 117],
    },
    alternateRowStyles: {
      fillColor: [250, 252, 255], // very subtle blue-slate tint
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" }, // #
      1: { cellWidth: 26, halign: "center", fontStyle: "bold" }, // Admission ID
      2: { cellWidth: 12, halign: "center" }, // Roll
      3: { cellWidth: 36, halign: "left", fontStyle: "bold" }, // Name
      4: { cellWidth: 15, halign: "center" }, // Gender
      5: { cellWidth: 23, halign: "center" }, // Class
      6: { cellWidth: 39, halign: "left" }, // Campus
      7: { cellWidth: 30, halign: "left" }, // Guardian
      8: { cellWidth: 27, halign: "center" }, // Phone
      9: { cellWidth: 19, halign: "center", fontStyle: "bold" }, // Attendance
      10: { cellWidth: 17, halign: "center" }, // Fee Status
      11: { cellWidth: 17, halign: "center" }, // Status
    },
    didDrawCell: (data) => {
      // Custom draw badge for Fee Status (Column index 10) in body
      if (data.section === "body" && data.column.index === 10) {
        const val = String(data.cell.raw);
        let bg: [number, number, number] = [241, 245, 249];
        let text: [number, number, number] = [71, 85, 105];

        if (val === "Paid") {
          bg = [220, 252, 231]; // soft green
          text = [21, 128, 61];
        } else if (val === "Partial") {
          bg = [224, 242, 254]; // soft blue
          text = [3, 105, 161];
        } else if (val === "Unpaid") {
          bg = [254, 243, 199]; // soft amber
          text = [180, 83, 9];
        } else if (val === "Overdue") {
          bg = [254, 226, 226]; // soft red
          text = [185, 28, 28];
        }

        const x = data.cell.x + 1.5;
        const y = data.cell.y + 1.2;
        const w = data.cell.width - 3;
        const h = data.cell.height - 2.4;

        doc.setFillColor(bg[0], bg[1], bg[2]);
        doc.roundedRect(x, y, w, h, 1.5, 1.5, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(text[0], text[1], text[2]);
        doc.text(val, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 0.9, {
          align: "center",
        });
      }

      // Custom draw badge for Student Status (Column index 11) in body
      if (data.section === "body" && data.column.index === 11) {
        const val = String(data.cell.raw);
        let bg: [number, number, number] = [241, 245, 249];
        let text: [number, number, number] = [71, 85, 105];

        if (val === "Active") {
          bg = [220, 252, 231]; // green
          text = [21, 128, 61];
        } else if (val === "Transferred") {
          bg = [224, 242, 254]; // info blue
          text = [3, 105, 161];
        } else if (val === "Alumni") {
          bg = [238, 242, 255]; // indigo/brand
          text = [67, 56, 202];
        } else if (val === "Suspended") {
          bg = [254, 226, 226]; // red
          text = [185, 28, 28];
        }

        const x = data.cell.x + 1.5;
        const y = data.cell.y + 1.2;
        const w = data.cell.width - 3;
        const h = data.cell.height - 2.4;

        doc.setFillColor(bg[0], bg[1], bg[2]);
        doc.roundedRect(x, y, w, h, 1.5, 1.5, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(text[0], text[1], text[2]);
        doc.text(val, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 0.9, {
          align: "center",
        });
      }
    },
    didDrawPage: (data) => {
      // Header for continuation pages (page 2+)
      if (data.pageNumber > 1) {
        doc.setFillColor(30, 66, 117);
        doc.rect(0, 0, pageWidth, 11, "F");

        doc.setFillColor(60, 111, 176);
        doc.rect(0, 10, pageWidth, 0.8, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(255, 255, 255);
        doc.text(
          campusInfo
            ? `EDUSPHERE SCHOOL MANAGEMENT SYSTEM · ${campusInfo.primary.toUpperCase()} DIRECTORY (CONTINUED)`
            : "EDUSPHERE SCHOOL MANAGEMENT SYSTEM · STUDENT DIRECTORY (CONTINUED)",
          marginX,
          6.5
        );

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(191, 219, 254);
        doc.text(`Generated: ${timestamp}`, pageWidth - marginX, 6.5, {
          align: "right",
        });
      }
    },
  });

  /* ─────────────────────────────────────────────────────────────
     5. Multi-Page Footers
     ───────────────────────────────────────────────────────────── */
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    const footerY = pageHeight - 7;

    // Divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, footerY - 3, pageWidth - marginX, footerY - 3);

    // Footer text left
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      "Confidential & Proprietary · EduSphere School Management System · Authorized Super Admin Record",
      marginX,
      footerY
    );

    // Footer text right
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - marginX,
      footerY,
      { align: "right" }
    );
  }

  // Trigger browser download with clean, informative filename
  const cleanDate = now.toISOString().slice(0, 10);
  let filename = `edusphere_students_directory_all_campuses_${cleanDate}.pdf`;
  if (campusInfo) {
    const slug = campusInfo.primary
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    filename = `edusphere_students_${slug}_${cleanDate}.pdf`;
  }

  doc.save(filename);

  return filename;
}
