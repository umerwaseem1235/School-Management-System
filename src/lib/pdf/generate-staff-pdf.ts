import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCampusDisplay } from "@/lib/format";
import type { StaffMember } from "@/types";

export interface GenerateStaffPDFOptions {
  staff: StaffMember[];
  title?: string;
  campusName?: string;
  filterSummary?: string;
}

export function generateStaffPDF({
  staff,
  title,
  campusName,
  filterSummary,
}: GenerateStaffPDFOptions) {
  // Determine campus scope
  const isAll = !campusName || campusName === "all" || campusName === "All Campuses";
  const campusInfo = !isAll && campusName ? formatCampusDisplay(campusName) : null;
  const effectiveTitle =
    title ||
    (campusInfo
      ? `${campusInfo.primary} Staff & Faculty Directory`
      : "Central Staff & Faculty Directory Report");

  // Landscape A4 mode (297mm x 210mm)
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
  const total = staff.length;
  const teachingCount = staff.filter((s) => s.type === "Teaching").length;
  const nonTeachingCount = total - teachingCount;
  const activeCount = staff.filter((s) => s.status === "Active").length;

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
  doc.setFillColor(30, 66, 117); // #1e4275
  doc.rect(0, 0, pageWidth, 28, "F");

  // Accent gradient border lines
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

  // School Name & Subtitle
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("EDUSPHERE INTERNATIONAL SCHOOL SYSTEM", marginX + 24, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // #cbd5e1
  const subtitle = campusInfo
    ? `CAMPUS: ${campusInfo.primary.toUpperCase()} ${campusInfo.secondary ? `(${campusInfo.secondary.toUpperCase()})` : ""} · FACULTY DIRECTORY`
    : "CENTRAL CAMPUS NETWORK · FACULTY & ADMINISTRATIVE STAFF REGISTER";
  doc.text(subtitle, marginX + 24, 19);

  // Right-aligned report code & print timestamp
  doc.setFontSize(7.5);
  doc.setTextColor(190, 210, 240);
  doc.text("OFFICIAL STAFF DOSSIER", pageWidth - marginX, 11, { align: "right" });
  doc.text(`Generated: ${timestamp}`, pageWidth - marginX, 16, { align: "right" });
  doc.text("CONFIDENTIAL & PROPRIETARY", pageWidth - marginX, 21, { align: "right" });

  /* ─────────────────────────────────────────────────────────────
     2. Report Heading & Meta Bar
     ───────────────────────────────────────────────────────────── */
  let currentY = 34;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(effectiveTitle, marginX, currentY);

  currentY += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // slate-500
  const scopeText = campusInfo
    ? `Campus Scope: ${campusInfo.primary} (${campusInfo.secondary || "Central"}) · All Registered Staff`
    : "Scope: All Campuses (Gulberg, DHA Phase 5, F-8 Islamabad, Clifton) · Central Faculty Record";
  const filterText = filterSummary ? ` · Filter applied: ${filterSummary}` : "";
  doc.text(`${scopeText}${filterText}`, marginX, currentY);

  /* ─────────────────────────────────────────────────────────────
     3. Executive KPI Summary Strip
     ───────────────────────────────────────────────────────────── */
  currentY += 5;
  const kpiBoxHeight = 15;
  const kpiBoxWidth = (usableWidth - 9) / 4; // 4 KPI cards

  const kpis = [
    { label: "TOTAL EMPLOYEES", value: String(total), sub: "Total Staff Records" },
    { label: "TEACHING FACULTY", value: String(teachingCount), sub: `${total ? Math.round((teachingCount / total) * 100) : 0}% of Total` },
    { label: "NON-TEACHING STAFF", value: String(nonTeachingCount), sub: `${total ? Math.round((nonTeachingCount / total) * 100) : 0}% of Total` },
    { label: "ACTIVE ON DUTY", value: String(activeCount), sub: `${total ? Math.round((activeCount / total) * 100) : 0}% Operational` },
  ];

  kpis.forEach((kpi, idx) => {
    const boxX = marginX + idx * (kpiBoxWidth + 3);
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(boxX, currentY, kpiBoxWidth, kpiBoxHeight, 2, 2, "FD");

    // Top subtle brand accent bar on each box
    doc.setFillColor(idx === 0 ? 30 : idx === 1 ? 59 : idx === 2 ? 14 : 16, idx === 0 ? 66 : idx === 1 ? 130 : idx === 2 ? 165 : 185, idx === 0 ? 117 : idx === 1 ? 246 : idx === 2 ? 233 : 129);
    doc.roundedRect(boxX, currentY, kpiBoxWidth, 1.2, 0.5, 0.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, boxX + 4, currentY + 5);

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.value, boxX + 4, currentY + 10.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(kpi.sub, boxX + 4, currentY + 13.5);
  });

  currentY += kpiBoxHeight + 5;

  /* ─────────────────────────────────────────────────────────────
     4. Data Table Configuration
     ───────────────────────────────────────────────────────────── */
  const head = [
    [
      "#",
      "EMP CODE",
      "STAFF MEMBER",
      "DESIGNATION & DEPARTMENT",
      "TYPE",
      "CAMPUS BRANCH",
      "CONTACT DETAILS",
      "QUALIFICATION",
      "STATUS",
    ],
  ];

  const body = staff.map((s, index) => {
    const campusDisp = formatCampusDisplay(s.campus);
    return [
      String(index + 1).padStart(2, "0"),
      s.empCode,
      s.name,
      `${s.designation}\nDept: ${s.department}`,
      s.type,
      `${campusDisp.primary}${campusDisp.secondary ? `\n${campusDisp.secondary}` : ""}`,
      `${s.phone}\n${s.email}`,
      `${s.qualification}${s.experience ? ` · ${s.experience}` : ""}`,
      s.status,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: head,
    body: body,
    theme: "striped",
    margin: { left: marginX, right: marginX, top: 32, bottom: 16 },
    tableWidth: usableWidth,
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: { top: 2.5, right: 3, bottom: 2.5, left: 3 },
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      valign: "middle",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [30, 66, 117], // #1e4275
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "left",
      valign: "middle",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center", fontStyle: "bold", textColor: [100, 116, 139] },
      1: { cellWidth: 20, fontStyle: "bold", textColor: [30, 66, 117] },
      2: { cellWidth: 38, fontStyle: "bold" },
      3: { cellWidth: 46 },
      4: { cellWidth: 22, halign: "center" },
      5: { cellWidth: 32 },
      6: { cellWidth: 44, fontSize: 7.2 },
      7: { cellWidth: 37, fontSize: 7.2 },
      8: { cellWidth: 20, halign: "center", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      // Custom styling for Status
      if (data.section === "body" && data.column.index === 8) {
        const val = String(data.cell.raw);
        if (val === "Active") {
          data.cell.styles.textColor = [22, 101, 52]; // green-800
        } else if (val === "Inactive" || val === "Suspended") {
          data.cell.styles.textColor = [153, 27, 27]; // red-800
        } else {
          data.cell.styles.textColor = [133, 77, 14]; // amber-800
        }
      }
      // Type styling
      if (data.section === "body" && data.column.index === 4) {
        const val = String(data.cell.raw);
        if (val === "Teaching") {
          data.cell.styles.textColor = [30, 66, 117];
          data.cell.styles.fontStyle = "bold";
        } else {
          data.cell.styles.textColor = [71, 85, 105];
        }
      }
    },
    didDrawPage: (data) => {
      // Repeat header on subsequent pages
      if (data.pageNumber > 1) {
        doc.setFillColor(30, 66, 117);
        doc.rect(0, 0, pageWidth, 16, "F");

        doc.setFillColor(60, 111, 176);
        doc.rect(0, 15, pageWidth, 0.8, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text("EDUSPHERE SCHOOL SYSTEM · STAFF & FACULTY DIRECTORY", marginX, 10.5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(190, 210, 240);
        doc.text(`${campusInfo ? campusInfo.primary : "All Campuses"} · Page ${data.pageNumber}`, pageWidth - marginX, 10.5, {
          align: "right",
        });
      }

      // Professional Footer
      const footerY = pageHeight - 8;

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(marginX, footerY - 3, pageWidth - marginX, footerY - 3);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(
        "EduSphere School Management System · Human Resources & Administration Directorate",
        marginX,
        footerY
      );

      const pageStr = `Page ${data.pageNumber}`;
      doc.text(pageStr, pageWidth - marginX, footerY, { align: "right" });
    },
  });

  // Save PDF
  const filenameScope = isAll
    ? "All-Campuses"
    : campusInfo
      ? campusInfo.primary.toLowerCase().replace(/[^a-z0-9]/g, "-")
      : "Campus";
  const filename = `EduSphere-Staff-Directory-${filenameScope}-${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
