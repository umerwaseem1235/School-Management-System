import type { FeeChallan, FeeStructure } from "@/types";
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

export function exportFeeChallansPdf(challans: FeeChallan[]): boolean {
  if (!challans || challans.length === 0) return false;

  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const totalPayable = challans.reduce((s, c) => s + c.totalPayable, 0);
  const totalPaid = challans.reduce((s, c) => s + c.paid, 0);
  const totalBalance = totalPayable - totalPaid;

  const cmds: string[] = [];

  // Header banner background
  cmds.push("0.04 0.11 0.24 rg");
  cmds.push("28 755 539.28 62 re f");

  // Title
  cmds.push("1 1 1 rg");
  cmds.push("BT /F2 14 Tf 40 796 Td (EDUSPHERE MULTI-CAMPUS SYSTEM) Tj ET");
  cmds.push("0.85 0.90 0.98 rg");
  cmds.push("BT /F1 9 Tf 40 782 Td (Fee Challans & Collection Register | AY 2026-27) Tj ET");
  cmds.push(
    `BT /F1 8 Tf 40 769 Td (Generated on: ${sanitizePdfText(
      generatedDate
    )} | Total Challans: ${challans.length}) Tj ET`
  );

  // Summary KPI Cards box
  cmds.push("0.96 0.97 0.99 rg");
  cmds.push("28 705 539.28 40 re f");
  cmds.push("0.85 0.88 0.93 RG 0.5 w");
  cmds.push("28 705 539.28 40 re S");

  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F2 8 Tf 40 730 Td (Total Amount Due: Rs ${totalPayable.toLocaleString()}) Tj ET`
  );
  cmds.push("0.05 0.55 0.25 rg");
  cmds.push(
    `BT /F2 8 Tf 220 730 Td (Total Collected: Rs ${totalPaid.toLocaleString()}) Tj ET`
  );
  cmds.push("0.75 0.20 0.20 rg");
  cmds.push(
    `BT /F2 8 Tf 400 730 Td (Outstanding Balance: Rs ${totalBalance.toLocaleString()}) Tj ET`
  );

  const cols = [
    { title: "Challan #", x: 34 },
    { title: "Student Name", x: 120 },
    { title: "Class", x: 215 },
    { title: "Campus", x: 280 },
    { title: "Due Date", x: 350 },
    { title: "Amount Due", x: 415 },
    { title: "Paid", x: 475 },
    { title: "Status", x: 525 },
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
  let curY = 675;
  drawTableHeader(current, curY);
  curY -= 20;

  challans.forEach((r, idx) => {
    if (curY < 70) {
      current = [];
      pages.push(current);
      curY = 790;
      drawTableHeader(current, curY);
      curY -= 20;
    }
    const bg = idx % 2 === 0 ? "1 1 1" : "0.97 0.98 0.99";
    current.push(`${bg} rg`);
    current.push(`28 ${curY} 539.28 20 re f`);
    current.push("0.88 0.90 0.94 RG 0.4 w");
    current.push(`28 ${curY} 539.28 20 re S`);

    current.push("0.10 0.15 0.22 rg");
    current.push(`BT /F2 7 Tf 34 ${curY + 6} Td (${sanitizePdfText(r.challanNumber)}) Tj ET`);
    current.push(`BT /F1 7.5 Tf 120 ${curY + 6} Td (${sanitizePdfText(r.student.slice(0, 24))}) Tj ET`);
    current.push(`BT /F1 7 Tf 215 ${curY + 6} Td (${sanitizePdfText(r.className)}) Tj ET`);
    current.push(`BT /F1 7 Tf 280 ${curY + 6} Td (${sanitizePdfText(r.campus)}) Tj ET`);
    current.push(`BT /F1 7 Tf 350 ${curY + 6} Td (${sanitizePdfText(formatDate(r.dueDate))}) Tj ET`);
    current.push(`BT /F2 7 Tf 415 ${curY + 6} Td (${r.totalPayable.toLocaleString("en-US")}) Tj ET`);
    current.push(`BT /F1 7 Tf 475 ${curY + 6} Td (${r.paid.toLocaleString("en-US")}) Tj ET`);

    if (r.status === "Paid") current.push("0.05 0.55 0.20 rg");
    else if (r.status === "Overdue") current.push("0.80 0.15 0.15 rg");
    else if (r.status === "Partial") current.push("0.85 0.50 0.10 rg");
    else current.push("0.40 0.45 0.55 rg");

    current.push(`BT /F2 7 Tf 525 ${curY + 6} Td (${r.status}) Tj ET`);
    curY -= 20;
  });

  pages.forEach((pg, i) => {
    pg.push("0.45 0.50 0.58 rg");
    pg.push("BT /F1 7.5 Tf 40 50 Td (Official Accounts Department Record - Confidential Document) Tj ET");
    pg.push(`BT /F1 7.5 Tf 480 50 Td (Page ${i + 1} of ${pages.length}) Tj ET`);
    if (i === pages.length - 1) {
      pg.push("BT /F1 7.5 Tf 40 36 Td (Accounts Officer Signature: ________________) Tj ET");
    }
  });

  const pdfBlob = buildMinimalPdf(pages.map((pg) => pg.join("\n")));
  triggerBlobDownload(pdfBlob, "EduSphere_Fee_Challans_Oct_2026.pdf");
  return true;
}

export function exportFeeStructuresPdf(structures: FeeStructure[]): boolean {
  if (!structures || structures.length === 0) return false;

  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const cmds: string[] = [];

  // Header banner background
  cmds.push("0.04 0.11 0.24 rg");
  cmds.push("28 755 539.28 62 re f");

  cmds.push("1 1 1 rg");
  cmds.push("BT /F2 14 Tf 40 796 Td (EDUSPHERE MULTI-CAMPUS SYSTEM) Tj ET");
  cmds.push("0.85 0.90 0.98 rg");
  cmds.push("BT /F1 9 Tf 40 782 Td (Institutional Grade-Wise Fee Structures | AY 2026-27) Tj ET");
  cmds.push(
    `BT /F1 8 Tf 40 769 Td (Generated on: ${sanitizePdfText(
      generatedDate
    )} | Grade Classes: ${structures.length}) Tj ET`
  );

  let curY = 720;
  structures.forEach((fs) => {
    const total = fs.feeHeads.reduce((s, h) => s + h.amount, 0);

    cmds.push("0.96 0.97 0.99 rg");
    cmds.push(`28 ${curY - 14} 539.28 20 re f`);
    cmds.push("0.85 0.88 0.93 RG 0.5 w");
    cmds.push(`28 ${curY - 14} 539.28 20 re S`);

    cmds.push("0.06 0.15 0.30 rg");
    cmds.push(
      `BT /F2 8.5 Tf 36 ${curY - 8} Td (${sanitizePdfText(
        fs.className
      )} - Academic Session ${sanitizePdfText(fs.academicYear)}) Tj ET`
    );
    cmds.push(
      `BT /F2 8.5 Tf 420 ${curY - 8} Td (Monthly Total: Rs ${total.toLocaleString()}) Tj ET`
    );

    curY -= 22;

    fs.feeHeads.forEach((h) => {
      cmds.push("0.15 0.20 0.28 rg");
      cmds.push(`BT /F1 7.5 Tf 45 ${curY - 6} Td (* ${sanitizePdfText(h.headName)}) Tj ET`);
      cmds.push(`BT /F1 7 Tf 260 ${curY - 6} Td (${sanitizePdfText(h.frequency)}) Tj ET`);
      cmds.push(`BT /F2 7.5 Tf 420 ${curY - 6} Td (Rs ${h.amount.toLocaleString()}) Tj ET`);
      curY -= 14;
    });

    curY -= 12;
  });

  cmds.push("0.45 0.50 0.58 rg");
  cmds.push("BT /F1 7.5 Tf 40 50 Td (Institutional Fee Governance Matrix - Approved by Central Directorate) Tj ET");

  const pdfBlob = buildMinimalPdf([cmds.join("\n")]);
  triggerBlobDownload(pdfBlob, "EduSphere_Fee_Structures_2026-27.pdf");
  return true;
}

export function printFeeReport({
  tab = "challans",
  challans,
  structures = [],
}: {
  tab?: "challans" | "structures";
  challans: FeeChallan[];
  structures?: FeeStructure[];
}): boolean {
  if (typeof window === "undefined" || !document) return false;

  const existingIframe = document.getElementById("fee-report-print-frame");
  if (existingIframe) {
    existingIframe.remove();
  }

  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const iframe = document.createElement("iframe");
  iframe.id = "fee-report-print-frame";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return false;

  let contentHtml = "";

  if (tab === "challans") {
    const totalPayable = challans.reduce((s, c) => s + c.totalPayable, 0);
    const totalPaid = challans.reduce((s, c) => s + c.paid, 0);
    const totalBalance = totalPayable - totalPaid;

    contentHtml = `
      <div class="header">
        <div class="org-title">EDUSPHERE MULTI-CAMPUS SYSTEM</div>
        <div class="doc-title">Fee Challans & Collection Register</div>
        <div class="doc-meta">Academic Session 2026–27 · October Billing Cycle · Generated: ${generatedDate}</div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">TOTAL AMOUNT DUE</div>
          <div class="kpi-val">${formatCurrency(totalPayable)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">TOTAL COLLECTED</div>
          <div class="kpi-val text-success">${formatCurrency(totalPaid)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">OUTSTANDING BALANCE</div>
          <div class="kpi-val text-danger">${formatCurrency(totalBalance)}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 16%;">Challan #</th>
            <th style="width: 20%;">Student Name</th>
            <th style="width: 14%;">Class</th>
            <th style="width: 14%;">Campus</th>
            <th style="width: 12%;">Due Date</th>
            <th style="width: 12%; text-align: right;">Amount Due</th>
            <th style="width: 12%; text-align: right;">Paid</th>
            <th style="width: 12%; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${challans
            .map(
              (c) => `
            <tr>
              <td class="mono font-bold">${c.challanNumber}</td>
              <td class="font-bold">${c.student}</td>
              <td>${c.className}</td>
              <td>${c.campus}</td>
              <td>${formatDate(c.dueDate)}</td>
              <td style="text-align: right; font-weight: 600;">${formatCurrency(c.totalPayable)}</td>
              <td style="text-align: right;">${formatCurrency(c.paid)}</td>
              <td style="text-align: center;">
                <span class="status-badge status-${c.status.toLowerCase()}">${c.status}</span>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  } else {
    contentHtml = `
      <div class="header">
        <div class="org-title">EDUSPHERE MULTI-CAMPUS SYSTEM</div>
        <div class="doc-title">Institutional Grade-Wise Fee Structures</div>
        <div class="doc-meta">Approved Tuition & Head Schedules · AY 2026–27 · Generated: ${generatedDate}</div>
      </div>

      <div class="structures-grid">
        ${structures
          .map((fs) => {
            const total = fs.feeHeads.reduce((s, h) => s + h.amount, 0);
            return `
            <div class="structure-card">
              <div class="structure-header">
                <span class="font-bold">${fs.className}</span>
                <span class="badge">${fs.academicYear}</span>
              </div>
              <table style="margin-top: 8px;">
                <thead>
                  <tr>
                    <th>Fee Head</th>
                    <th>Frequency</th>
                    <th style="text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${fs.feeHeads
                    .map(
                      (h) => `
                    <tr>
                      <td>${h.headName}</td>
                      <td>${h.frequency}</td>
                      <td style="text-align: right; font-weight: 600;">${formatCurrency(h.amount)}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
              <div class="structure-footer">
                <span>Monthly Total</span>
                <span class="font-bold" style="color: #091d3e;">${formatCurrency(total)}</span>
              </div>
            </div>
          `;
          })
          .join("")}
      </div>
    `;
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Fee Management Report - EduSphere</title>
        <style>
          @page { size: A4; margin: 16mm 14mm; }
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            font-size: 11px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .header {
            border-bottom: 2px solid #091d3e;
            padding-bottom: 8px;
            margin-bottom: 14px;
          }
          .org-title {
            font-size: 15px;
            font-weight: 800;
            color: #091d3e;
            letter-spacing: -0.01em;
          }
          .doc-title {
            font-size: 13px;
            font-weight: 700;
            color: #1e293b;
            margin-top: 2px;
          }
          .doc-meta {
            font-size: 9.5px;
            color: #64748b;
            margin-top: 2px;
          }
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 14px;
          }
          .kpi-card {
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            border-radius: 6px;
            padding: 8px 10px;
          }
          .kpi-label {
            font-size: 9px;
            font-weight: 700;
            color: #64748b;
          }
          .kpi-val {
            font-size: 14px;
            font-weight: 800;
            color: #091d3e;
            margin-top: 2px;
          }
          .text-success { color: #15803d !important; }
          .text-danger { color: #b91c1c !important; }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-bottom: 16px;
          }
          th {
            background-color: #f1f5f9;
            color: #334155;
            font-weight: 700;
            text-align: left;
            padding: 6px 8px;
            border-top: 1px solid #cbd5e1;
            border-bottom: 1px solid #cbd5e1;
          }
          td {
            padding: 6px 8px;
            border-bottom: 1px solid #e2e8f0;
          }
          tr:nth-child(even) td {
            background-color: #fafbfc;
          }
          .mono { font-family: monospace; }
          .font-bold { font-weight: 700; }
          .status-badge {
            display: inline-block;
            font-size: 8.5px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
          }
          .status-paid { background: #dcfce7; color: #15803d; }
          .status-unpaid { background: #fee2e2; color: #b91c1c; }
          .status-partial { background: #fef3c7; color: #b45309; }
          .status-overdue { background: #fecdd3; color: #9f1239; }
          .badge {
            background: #e2e8f0;
            color: #334155;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 600;
          }
          .structures-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .structure-card {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px;
            background: #ffffff;
            break-inside: avoid;
          }
          .structure-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
          }
          .structure-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
            margin-top: 6px;
            font-size: 10.5px;
          }
          .footer-signatures {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            padding-top: 12px;
            border-top: 1px dashed #cbd5e1;
            font-size: 9.5px;
            color: #475569;
          }
        </style>
      </head>
      <body>
        ${contentHtml}
        <div class="footer-signatures">
          <div>Prepared by: Accounts Department Officer</div>
          <div>Authorized Signature: _______________________</div>
          <div>Official Stamp & Date: _______________________</div>
        </div>
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  }, 300);

  return true;
}
