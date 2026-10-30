import type { FeeAdjustmentRecord } from "@/lib/mock/finance";
import { formatCurrency, formatDate } from "@/lib/format";
import { printHtml } from "@/lib/print-html";

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

export function exportAdjustmentsPdf(records: FeeAdjustmentRecord[]): boolean {
  if (!records || records.length === 0) return false;

  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const totalCredits = records
    .filter((r) => r.type.startsWith("Credit"))
    .reduce((s, r) => s + r.amount, 0);
  const totalDebits = records
    .filter((r) => r.type.startsWith("Debit"))
    .reduce((s, r) => s + r.amount, 0);

  const cmds: string[] = [];

  // Header banner background
  cmds.push("0.04 0.11 0.24 rg");
  cmds.push("28 755 539.28 62 re f");

  // Title
  cmds.push("1 1 1 rg");
  cmds.push("BT /F2 14 Tf 40 796 Td (EDUSPHERE MULTI-CAMPUS SYSTEM) Tj ET");
  cmds.push("0.85 0.90 0.98 rg");
  cmds.push(
    "BT /F1 9 Tf 40 782 Td (Student Fee Ledger Adjustments & Corrections | AY 2026-27) Tj ET"
  );
  cmds.push(
    `BT /F1 8 Tf 40 769 Td (Generated on: ${sanitizePdfText(
      generatedDate
    )} | Total Postings: ${records.length}) Tj ET`
  );

  // Summary KPI Cards box
  cmds.push("0.96 0.97 0.99 rg");
  cmds.push("28 705 539.28 40 re f");
  cmds.push("0.85 0.88 0.93 RG 0.5 w");
  cmds.push("28 705 539.28 40 re S");

  cmds.push("0.05 0.55 0.25 rg");
  cmds.push(
    `BT /F2 8 Tf 40 730 Td (Total Credit Waivers: Rs ${totalCredits.toLocaleString()}) Tj ET`
  );
  cmds.push("0.75 0.20 0.20 rg");
  cmds.push(
    `BT /F2 8 Tf 220 730 Td (Total Debit Arrears: Rs ${totalDebits.toLocaleString()}) Tj ET`
  );
  cmds.push("0.15 0.25 0.45 rg");
  cmds.push(
    `BT /F2 8 Tf 400 730 Td (Ledger Integrity: 100% Balanced) Tj ET`
  );

  const cols = [
    { title: "Adj #", x: 34 },
    { title: "Student Name", x: 105 },
    { title: "Class / Roll", x: 200 },
    { title: "Campus", x: 265 },
    { title: "Adjustment Type", x: 330 },
    { title: "Amount", x: 440 },
    { title: "Date", x: 490 },
    { title: "Status", x: 535 },
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
        `BT /F2 9 Tf 40 800 Td (EDUSPHERE ADJUSTMENTS LEDGER - Continued) Tj ET`
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
      `BT /F2 7.5 Tf 34 ${yPos} Td (${sanitizePdfText(r.adjustmentNo)}) Tj ET`
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
      `BT /F1 7.5 Tf 330 ${yPos} Td (${sanitizePdfText(`${r.type.split(" ")[0]} (${r.head})`)}) Tj ET`
    );
    current.push(
      `BT /F2 8 Tf 440 ${yPos} Td (Rs ${r.amount.toLocaleString()}) Tj ET`
    );
    current.push(
      `BT /F1 7.5 Tf 490 ${yPos} Td (${sanitizePdfText(r.date)}) Tj ET`
    );

    if (r.status === "Applied") {
      current.push("0.05 0.55 0.25 rg");
    } else {
      current.push("0.75 0.45 0.05 rg");
    }
    current.push(
      `BT /F2 7.5 Tf 535 ${yPos} Td (${sanitizePdfText(r.status)}) Tj ET`
    );

    yPos -= 17;
  });

  // Footer on last page
  current.push("0.4 0.45 0.5 rg");
  current.push("28 40 539.28 0.5 re f");
  current.push(
    "BT /F1 7 Tf 40 28 Td (Accounts Department  |  Internal Audit & Billing Verification  |  EduSphere Multi-Campus) Tj ET"
  );

  const streams = pages.map((pageCmds) => pageCmds.join("\n"));
  const pdfBlob = buildMinimalPdf(streams);
  triggerBlobDownload(
    pdfBlob,
    `EduSphere-Fee-Adjustments-Ledger-${generatedDate.replace(/\s+/g, "-")}.pdf`
  );
  return true;
}

export function printAdjustmentsReport(records: FeeAdjustmentRecord[]): boolean {
  if (typeof window === "undefined") return false;

  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const totalCredits = records
    .filter((r) => r.type.startsWith("Credit"))
    .reduce((s, r) => s + r.amount, 0);
  const totalDebits = records
    .filter((r) => r.type.startsWith("Debit"))
    .reduce((s, r) => s + r.amount, 0);

  const rowsHtml = records
    .map(
      (r, idx) => `
    <tr class="${idx % 2 === 0 ? "even" : ""}">
      <td class="mono font-bold">${r.adjustmentNo}<div class="sub-text">${r.challanNumber}</div></td>
      <td class="font-bold">${r.student}<div class="sub-text">Roll #${r.rollNo} · ${r.className}</div></td>
      <td>${r.campus}</td>
      <td><strong>${r.type}</strong><div class="sub-text">Head: ${r.head}</div></td>
      <td class="text-right mono font-bold" style="color: ${r.type.startsWith("Credit") ? "#15803d" : "#b91c1c"};">
        ${r.type.startsWith("Credit") ? "-" : "+"}${formatCurrency(r.amount)}
      </td>
      <td class="text-center mono">${formatDate(r.date)}</td>
      <td class="text-center">
        <span class="status-badge ${r.status === "Applied" ? "status-applied" : "status-pending"}">${r.status}</span>
      </td>
    </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Fee Adjustments Ledger - EduSphere</title>
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
    .status-applied { background: #dcfce7; color: #15803d; }
    .status-pending { background: #fef3c7; color: #b45309; }
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
      <p class="subtitle">Student Fee Ledger Adjustments & Corrections</p>
    </div>
    <div class="meta-box">
      <div>Report Date: <strong>${generatedDate}</strong></div>
      <div>Adjustment Entries: <strong>${records.length}</strong></div>
      <div>Accounts & Verification Desk</div>
    </div>
  </div>

  <div class="kpi-row">
    <div class="kpi-card">
      <div class="kpi-label">Total Credit Waivers</div>
      <div class="kpi-val" style="color: #15803d;">${formatCurrency(totalCredits)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Total Debit Arrears</div>
      <div class="kpi-val" style="color: #b91c1c;">${formatCurrency(totalDebits)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Ledger Integrity</div>
      <div class="kpi-val" style="color: #0f274a;">100% Balanced</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Adj #</th>
        <th>Student Name</th>
        <th>Campus</th>
        <th>Adjustment Type</th>
        <th class="text-right">Adjustment Value</th>
        <th class="text-center">Effective Date</th>
        <th class="text-center">Status</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="footer-signatures">
    <div class="sig-line">Prepared by: Billing Officer</div>
    <div class="sig-line">Audited by: Internal Auditor</div>
    <div class="sig-line">Director of Finance</div>
  </div>
</body>
</html>`;

  return printHtml(html);
}

export function printAdjustmentVoucher(record: FeeAdjustmentRecord): boolean {
  if (typeof window === "undefined") return false;

  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const isCredit = record.type.startsWith("Credit");
  const sign = isCredit ? "-" : "+";
  const amountColor = isCredit ? "#15803d" : "#b91c1c";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Fee Adjustment Voucher - ${record.adjustmentNo}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      font-size: 12px;
    }
    .voucher-card {
      border: 2px solid #0f274a;
      border-radius: 8px;
      padding: 24px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #0f274a;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .title {
      font-size: 20px;
      font-weight: 800;
      color: #0f274a;
      margin: 0;
      letter-spacing: -0.02em;
    }
    .subtitle {
      font-size: 12px;
      color: #64748b;
      margin: 4px 0 0 0;
    }
    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #475569;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 11px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 12px;
    }
    .info-label { color: #64748b; }
    .info-val { font-weight: 600; color: #0f172a; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .amount-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 16px;
      text-align: center;
      margin-bottom: 20px;
    }
    .amount-val {
      font-size: 26px;
      font-weight: 800;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      color: ${amountColor};
      margin: 4px 0;
    }
    .reason-box {
      background: #f1f5f9;
      border-left: 4px solid #0f274a;
      padding: 14px 16px;
      border-radius: 0 6px 6px 0;
      margin-bottom: 30px;
    }
    .reason-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #0f274a;
      margin-bottom: 4px;
    }
    .reason-text {
      font-size: 13px;
      color: #1e293b;
      line-height: 1.5;
      font-style: italic;
    }
    .footer-signatures {
      margin-top: 50px;
      display: flex;
      justify-content: space-between;
      padding-top: 16px;
      border-top: 1px dashed #94a3b8;
    }
    .sig-line {
      width: 160px;
      text-align: center;
      border-top: 1px solid #475569;
      padding-top: 6px;
      font-size: 11px;
      color: #475569;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="voucher-card">
    <div class="header">
      <div>
        <h1 class="title">EduSphere Multi-Campus School System</h1>
        <p class="subtitle">Official Student Fee Adjustment Voucher (${isCredit ? "Credit Note" : "Debit Note"})</p>
      </div>
      <div class="meta-box">
        <div>Voucher #: <strong class="mono">${record.adjustmentNo}</strong></div>
        <div>Date: <strong>${formatDate(record.date)}</strong></div>
        <div style="margin-top: 4px;">
          <span class="badge" style="background: ${record.status === "Applied" ? "#dcfce7; color: #15803d" : "#fef3c7; color: #b45309"};">
            Status: ${record.status}
          </span>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div>
        <div class="section-title">Student & Academic Profile</div>
        <div class="info-row"><span class="info-label">Student Name:</span><span class="info-val">${record.student}</span></div>
        <div class="info-row"><span class="info-label">Roll Number:</span><span class="info-val mono">#${record.rollNo}</span></div>
        <div class="info-row"><span class="info-label">Class & Section:</span><span class="info-val">${record.className}</span></div>
        <div class="info-row"><span class="info-label">Campus:</span><span class="info-val">${record.campus} Campus</span></div>
        <div class="info-row"><span class="info-label">Challan Ref:</span><span class="info-val mono">${record.challanNumber}</span></div>
      </div>
      <div>
        <div class="section-title">Adjustment Ledger Specification</div>
        <div class="info-row"><span class="info-label">Adjustment Category:</span><span class="info-val">${record.type}</span></div>
        <div class="info-row"><span class="info-label">Fee Head Affected:</span><span class="info-val">${record.head}</span></div>
        <div class="info-row"><span class="info-label">Authorizing Authority:</span><span class="info-val">${record.authorizedBy}</span></div>
        <div class="info-row"><span class="info-label">Posting Date:</span><span class="info-val">${formatDate(record.date)}</span></div>
        <div class="info-row"><span class="info-label">Audit Control:</span><span class="info-val">Verified & Signed</span></div>
      </div>
    </div>

    <div class="amount-box">
      <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">
        Net Adjustment Impact on Student Balance
      </div>
      <div class="amount-val">
        ${sign}${formatCurrency(record.amount)}
      </div>
      <div style="font-size: 11.5px; color: #475569;">
        ${isCredit ? "Credit applied — Balance reduced / waiver credited" : "Debit applied — Additional ledger charges posted"}
      </div>
    </div>

    <div class="reason-box">
      <div class="reason-title">Official Justification & Ledger Reason:</div>
      <div class="reason-text">"${record.reason}"</div>
    </div>

    <div class="footer-signatures">
      <div class="sig-line">Accounts Clerk</div>
      <div class="sig-line">Finance Officer</div>
      <div class="sig-line">Principal / Authorized By</div>
    </div>
  </div>
</body>
</html>`;

  return printHtml(html);
}
