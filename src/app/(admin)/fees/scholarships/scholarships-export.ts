import type { FeeScholarshipAward } from "@/lib/mock/finance";
import { formatCurrency, formatDate } from "@/lib/format";

function sanitizePdfText(input: string): string {
  return input
    .replace(/[—–]/g, "-")
    .replace(/·/g, "|")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
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

function buildMinimalPdf(pagesStreams: string[]): Blob {
  const objects: string[] = [];
  const addObject = (content: string): number => {
    objects.push(content);
    return objects.length;
  };

  const catalogId = addObject("");
  const pagesId = addObject("");
  const fontRegularId = addObject(
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`
  );
  const fontBoldId = addObject(
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`
  );

  const pageIds: number[] = [];

  for (const stream of pagesStreams) {
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

export function exportScholarshipsPdf(records: FeeScholarshipAward[]): boolean {
  if (!records || records.length === 0) return false;

  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const totalMonthlySubsidy = records.reduce((s, r) => s + r.monthlyValue, 0);

  const cmds: string[] = [];

  // Header banner background
  cmds.push("0.04 0.11 0.24 rg");
  cmds.push("28 755 539.28 62 re f");

  // Title
  cmds.push("1 1 1 rg");
  cmds.push("BT /F2 14 Tf 40 796 Td (EDUSPHERE MULTI-CAMPUS SYSTEM) Tj ET");
  cmds.push("0.85 0.90 0.98 rg");
  cmds.push(
    "BT /F1 9 Tf 40 782 Td (Institutional Scholarship & Fee Concession Register | AY 2026-27) Tj ET"
  );
  cmds.push(
    `BT /F1 8 Tf 40 769 Td (Generated on: ${sanitizePdfText(
      generatedDate
    )} | Total Awards: ${records.length} | Monthly Subsidy: Rs ${totalMonthlySubsidy.toLocaleString()}) Tj ET`
  );

  // Summary KPI Cards box
  cmds.push("0.96 0.97 0.99 rg");
  cmds.push("28 705 539.28 40 re f");
  cmds.push("0.85 0.88 0.93 RG 0.5 w");
  cmds.push("28 705 539.28 40 re S");

  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F2 8 Tf 40 730 Td (Total Beneficiaries: ${records.length} Students) Tj ET`
  );
  cmds.push("0.05 0.55 0.25 rg");
  cmds.push(
    `BT /F2 8 Tf 220 730 Td (Monthly Subsidy: Rs ${totalMonthlySubsidy.toLocaleString()}) Tj ET`
  );
  cmds.push("0.15 0.25 0.45 rg");
  cmds.push(
    `BT /F2 8 Tf 400 730 Td (Schemes: Merit, Need-Based, Sibling & Ward) Tj ET`
  );

  const cols = [
    { title: "Award #", x: 34 },
    { title: "Student Beneficiary", x: 105 },
    { title: "Class / Roll", x: 200 },
    { title: "Campus", x: 265 },
    { title: "Scheme / Program", x: 330 },
    { title: "Concession", x: 430 },
    { title: "Monthly Subsidy", x: 480 },
    { title: "Status", x: 540 },
  ];

  const drawTableHeader = (target: string[], y: number) => {
    target.push("0.06 0.15 0.30 rg");
    target.push(`28 ${y} 539.28 20 re f`);
    target.push("1 1 1 rg");
    for (const col of cols) {
      target.push(`BT /F2 7.5 Tf ${col.x} ${y + 6} Td (${col.title}) Tj ET`);
    }
  };

  const pages: string[][] = [cmds];
  let current = cmds;
  let yPos = 680;
  drawTableHeader(current, yPos);
  yPos -= 18;

  records.forEach((r, idx) => {
    if (yPos < 65) {
      const nextCmds: string[] = [];
      nextCmds.push("0.04 0.11 0.24 rg");
      nextCmds.push("28 790 539.28 26 re f");
      nextCmds.push("1 1 1 rg");
      nextCmds.push(
        `BT /F2 9 Tf 40 800 Td (EDUSPHERE SCHOLARSHIPS REGISTER - Continued) Tj ET`
      );
      yPos = 760;
      drawTableHeader(nextCmds, yPos);
      yPos -= 18;
      pages.push(nextCmds);
      current = nextCmds;
    }

    if (idx % 2 === 0) {
      current.push("0.97 0.98 1 rg");
      current.push(`28 ${yPos - 3} 539.28 17 re f`);
    }

    current.push("0.1 0.1 0.1 rg");
    current.push(
      `BT /F2 7.5 Tf 34 ${yPos} Td (${sanitizePdfText(r.awardNo)}) Tj ET`
    );
    current.push(
      `BT /F1 7.5 Tf 105 ${yPos} Td (${sanitizePdfText(r.student.slice(0, 16))}) Tj ET`
    );
    current.push(
      `BT /F1 7.5 Tf 200 ${yPos} Td (${sanitizePdfText(`${r.rollNo} - ${r.className.slice(0, 9)}`)}) Tj ET`
    );
    current.push(
      `BT /F1 7.5 Tf 265 ${yPos} Td (${sanitizePdfText(r.campus.slice(0, 10))}) Tj ET`
    );
    current.push(
      `BT /F1 7.5 Tf 330 ${yPos} Td (${sanitizePdfText(r.scholarshipName.slice(0, 18))}) Tj ET`
    );
    current.push(
      `BT /F2 7.5 Tf 430 ${yPos} Td (${r.concessionPercent}% Off) Tj ET`
    );
    current.push(
      `BT /F2 7.5 Tf 480 ${yPos} Td (Rs ${r.monthlyValue.toLocaleString()}) Tj ET`
    );

    current.push("0.05 0.55 0.25 rg");
    current.push(
      `BT /F2 7.5 Tf 540 ${yPos} Td (${sanitizePdfText(r.status)}) Tj ET`
    );

    yPos -= 17;
  });

  // Footer on last page
  current.push("0.4 0.45 0.5 rg");
  current.push("28 40 539.28 0.5 re f");
  current.push(
    "BT /F1 7 Tf 40 28 Td (Academic Board  |  Scholarship & Concession Committee  |  EduSphere Multi-Campus) Tj ET"
  );

  const streams = pages.map((pageCmds) => pageCmds.join("\n"));
  const pdfBlob = buildMinimalPdf(streams);
  triggerBlobDownload(
    pdfBlob,
    `EduSphere-Scholarships-Register-${generatedDate.replace(/\s+/g, "-")}.pdf`
  );
  return true;
}

export function printScholarshipsReport(records: FeeScholarshipAward[]): boolean {
  if (typeof window === "undefined") return false;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    window.print();
    return true;
  }

  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const totalMonthlySubsidy = records.reduce((s, r) => s + r.monthlyValue, 0);

  const rowsHtml = records
    .map(
      (r, idx) => `
    <tr class="${idx % 2 === 0 ? "even" : ""}">
      <td class="mono font-bold">${r.awardNo}</td>
      <td class="font-bold">${r.student}<div class="sub-text">Roll #${r.rollNo} · ${r.className}</div></td>
      <td>${r.campus}</td>
      <td>${r.scholarshipName}<div class="sub-text">${r.authority}</div></td>
      <td class="text-center font-bold" style="color: #0284c7;">${r.concessionPercent}% Off</td>
      <td class="text-right mono font-bold" style="color: #0f172a;">${formatCurrency(r.monthlyValue)}</td>
      <td class="text-center mono">${formatDate(r.awardedDate)}</td>
      <td class="text-center">
        <span class="status-badge status-active">${r.status}</span>
      </td>
    </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Scholarships & Concessions Register - EduSphere</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 16px;
      font-size: 11px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f274a;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .title {
      font-size: 18px;
      font-weight: 800;
      color: #0f274a;
      margin: 0 0 2px 0;
      text-transform: uppercase;
      letter-spacing: -0.01em;
    }
    .subtitle {
      font-size: 11px;
      color: #475569;
      margin: 0;
    }
    .meta-box {
      text-align: right;
      font-size: 10px;
      color: #64748b;
    }
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }
    .kpi-card {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 8px 12px;
      background: #f8fafc;
    }
    .kpi-label { font-size: 9.5px; text-transform: uppercase; color: #64748b; font-weight: 600; }
    .kpi-val { font-size: 14px; font-weight: 800; color: #0f274a; margin-top: 2px; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    th {
      background: #0f274a;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 6px 8px;
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    th.text-right, td.text-right { text-align: right; }
    th.text-center, td.text-center { text-align: center; }
    td {
      padding: 6px 8px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    tr.even { background-color: #f8fafc; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .font-bold { font-weight: 700; }
    .sub-text { font-size: 9px; color: #64748b; font-weight: normal; margin-top: 1px; }
    .status-badge {
      display: inline-block;
      font-size: 8.5px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 3px;
    }
    .status-active { background: #dcfce7; color: #15803d; }
    .footer-signatures {
      margin-top: 36px;
      display: flex;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px dashed #cbd5e1;
      font-size: 10px;
      color: #475569;
    }
    .sig-line { width: 170px; text-align: center; border-top: 1px solid #94a3b8; padding-top: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">EduSphere Multi-Campus School System</h1>
      <p class="subtitle">Institutional Scholarship & Concession Register</p>
    </div>
    <div class="meta-box">
      <div>Report Date: <strong>${generatedDate}</strong></div>
      <div>Active Beneficiaries: <strong>${records.length}</strong></div>
      <div>Academic Governance Committee</div>
    </div>
  </div>

  <div class="kpi-row">
    <div class="kpi-card">
      <div class="kpi-label">Active Beneficiaries</div>
      <div class="kpi-val">${records.length} Students</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Total Monthly Subsidy</div>
      <div class="kpi-val" style="color: #15803d;">${formatCurrency(totalMonthlySubsidy)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Governance Ratification</div>
      <div class="kpi-val" style="color: #0f274a;">100% Ratified</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Award #</th>
        <th>Beneficiary Student</th>
        <th>Campus</th>
        <th>Scheme / Program</th>
        <th class="text-center">Concession</th>
        <th class="text-right">Monthly Subsidy</th>
        <th class="text-center">Awarded On</th>
        <th class="text-center">Status</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="footer-signatures">
    <div class="sig-line">Scholarship Committee Head</div>
    <div class="sig-line">Director of Finance</div>
    <div class="sig-line">Academic Board Chairperson</div>
  </div>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };

  return true;
}
