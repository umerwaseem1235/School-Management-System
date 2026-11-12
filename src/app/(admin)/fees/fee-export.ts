import type { FeeChallan, FeeStructure } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import type { FeeFineRecord, FeeRevisionRecord } from "@/lib/mock/finance";
import { printHtml } from "@/lib/print-html";
import { resolveMatchingTier, calculatePreviousMonthDues, getStudentRollNo } from "@/lib/mock/finance-storage";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

function resolveFeeTier(className: string, tiers: FeeRevisionRecord[]) {
  const grade = Number(className.match(/grade\s+(\d+)/i)?.[1]);
  if (!Number.isFinite(grade)) return undefined;
  return tiers.find((record) => {
    const yearNormalized = record.academicYear.replace(/[\u2010-\u2015]/g, "-");
    if (record.status !== "Active" || yearNormalized !== "2026-27") return false;
    const name = record.className.toLowerCase();
    if (name.includes("pre-school") || name.includes("kindergarten")) return false;
    if (name.includes("primary")) return grade >= 1 && grade <= 5;
    if (name.includes("middle")) return grade >= 6 && grade <= 8;
    if (name.includes("matriculation")) return grade >= 9 && grade <= 10;
    if (name.includes("o-level")) return grade >= 9 && grade <= 11;
    if (name.includes("a-level") || name.includes("fsc")) return grade >= 11 && grade <= 12;
    return false;
  });
}

function formatPdfCurrency(amount: number): string {
  return "Rs " + Number(amount || 0).toLocaleString("en-US");
}

function buildStudentFeeStatementHtml(
  challan: FeeChallan,
  tiers: FeeRevisionRecord[],
  fines: FeeFineRecord[],
  allChallans: FeeChallan[] = []
) {
  const tier = resolveMatchingTier(challan.className, tiers);
  const studentFines = fines.filter((fine) => fine.student.trim().toLowerCase() === challan.student.trim().toLowerCase());
  const unpaidFineTotal = studentFines.filter((fine) => fine.status === "Unpaid").reduce((sum, fine) => sum + fine.amount, 0);

  const priorInfo = calculatePreviousMonthDues(challan, allChallans);
  const previousDues = challan.previousDues !== undefined && challan.previousDues > 0 ? challan.previousDues : (priorInfo.total ?? 0);

  const tuitionFee = challan.tuitionFee ?? tier?.tuitionFee ?? 0;
  const labCharges = challan.labCharges ?? tier?.labCharges ?? 0;
  const sportsCharges = challan.sportsCharges ?? tier?.sportsCharges ?? 0;
  const transportCharges = challan.transportCharges ?? 0;
  const fineCharges = challan.fineCharges ?? 0;
  const libraryFund = challan.libraryFund ?? tier?.libraryFund ?? 0;
  const utilitySurcharge = challan.utilitySurcharge ?? tier?.utilitySurcharge ?? 0;
  const otherCharges = challan.otherCharges ?? tier?.otherCharges ?? 0;
  const customHeads = challan.customHeads ?? tier?.customHeads ?? [];

  const feeRows: [string, number][] = [];
  if (tier || challan.tuitionFee !== undefined || transportCharges > 0 || fineCharges > 0) {
    feeRows.push(["Tuition fee", tuitionFee]);
    feeRows.push(["Lab charges", labCharges]);
    feeRows.push(["Sports and activities", sportsCharges]);
    if (transportCharges > 0) {
      feeRows.push(["Transport charges", transportCharges]);
    }
    if (fineCharges > 0) {
      feeRows.push(["Fine charges", fineCharges]);
    }
    feeRows.push(["Library fund", libraryFund]);
    feeRows.push(["Utilities and maintenance", utilitySurcharge]);
    if (otherCharges > 0) {
      feeRows.push(["Other charges", otherCharges]);
    }
    for (const head of customHeads) {
      feeRows.push([head.name, head.amount]);
    }
    if (challan.scholarshipConcession && challan.scholarshipConcession > 0) {
      feeRows.push([
        `Less: Scholarship Concession (${challan.scholarshipName || "Scholarship"}${challan.scholarshipPercent ? ` - ${challan.scholarshipPercent}%` : ""})`,
        -challan.scholarshipConcession,
      ]);
    }
  } else {
    feeRows.push(["Fee charges (itemized configuration unavailable)", challan.totalPayable]);
  }

  const calculatedAmountDue = feeRows.reduce((sum, [, amount]) => sum + Number(amount), 0);
  const unattachedFines = Math.max(0, unpaidFineTotal - fineCharges);
  const totalPayableWithDuesAndFines = calculatedAmountDue + previousDues + unattachedFines;

  // Deduplicate any identical payment entries
  const rawPayments = challan.payments && challan.payments.length > 0 ? challan.payments : [];
  const seenP = new Set<string>();
  const dedupedList = rawPayments.filter((p) => {
    const key = `${p.receiptNumber || ""}-${p.paymentDate || ""}-${p.amount}-${p.paymentMethod || ""}`;
    if (seenP.has(key)) return false;
    seenP.add(key);
    return true;
  });

  const sumOfPayments = dedupedList.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const actualPaidAmount = sumOfPayments > 0 ? sumOfPayments : (challan.paid ?? 0);
  const effectivePaid = Math.min(totalPayableWithDuesAndFines, actualPaidAmount);
  const remainingBalance = Math.max(0, totalPayableWithDuesAndFines - effectivePaid);

  const paymentsList = dedupedList.length > 0
    ? dedupedList
    : effectivePaid > 0
      ? [{
          id: "pay-1",
          receiptNumber: challan.lastReceiptNumber || `RCP-${challan.challanNumber.slice(-6)}`,
          paymentDate: challan.lastPaymentDate || challan.dueDate,
          paymentMethod: challan.lastPaymentMethod || "Cash (Campus Counter)",
          amount: challan.lastPaymentAmount || effectivePaid,
        }]
      : [];

  const rows = feeRows
    .map(([label, amount]) => {
      const num = Number(amount);
      const isConcession = num < 0;
      const formattedAmt = isConcession ? `−${formatCurrency(Math.abs(num))}` : formatCurrency(num);
      const rowStyle = isConcession ? ' style="background-color: #f0fdf4; color: #166534; font-weight: 600;"' : "";
      const amtStyle = isConcession ? ' style="color: #166534; font-weight: bold;"' : "";
      return `<tr${rowStyle}><td>${label}</td><td class="amount"${amtStyle}>${formattedAmt}</td></tr>`;
    })
    .join("");
  const fineRows = studentFines.length
    ? studentFines.map((fine) => `<tr><td>${fine.fineType} <span class="mono">(${fine.fineNumber} | ${formatDate(fine.imposedDate)})</span></td><td class="amount">${formatCurrency(fine.amount)}</td></tr>`).join("")
    : `<tr><td colspan="2" class="text-center" style="color: #6c757d; font-size: 9px;">No institutional fines recorded for this student in the current cycle.</td></tr>`;
  const generated = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const previousDuesHtml = previousDues > 0 ? `
    <section class="section">
      <div class="section-title">
        <span>Previous Unpaid Months & Arrears Record</span>
        <span class="badge">${priorInfo.count} ${priorInfo.count === 1 ? "Month" : "Months"} Unpaid</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Unpaid Month</th>
            <th>Challan #</th>
            <th>Due Date</th>
            <th class="amount">Billed</th>
            <th class="amount">Paid</th>
            <th class="amount">Arrears</th>
            <th class="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          ${priorInfo.priorChallans.map((p) => `
            <tr>
              <td><strong>${p.monthYear}</strong>${p.notes ? `<span style="display:block;font-size:8px;color:#6c757d;">${p.notes}</span>` : ""}</td>
              <td class="mono">${p.challanNumber || "—"}</td>
              <td>${p.dueDate ? formatDate(p.dueDate) : "—"}</td>
              <td class="amount">${formatCurrency(p.billedAmount ?? p.balance)}</td>
              <td class="amount">${formatCurrency(p.paidAmount ?? 0)}</td>
              <td class="amount" style="font-weight: bold;">+${formatCurrency(p.balance)}</td>
              <td class="text-center"><span class="badge">${p.status || "Unpaid"}</span></td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr>
            <th colspan="5">Total Previous Months Arrears (Carried Forward)</th>
            <th class="amount" style="font-weight: bold;">+${formatCurrency(previousDues)}</th>
            <th></th>
          </tr>
        </tfoot>
      </table>
    </section>
  ` : `
    <section class="section">
      <div class="clear-notice">
        <strong>Previous Dues Status:</strong> Fully Cleared — All prior monthly billing cycles have been settled in full. (Rs 0 Arrears)
      </div>
    </section>
  `;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title></title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #2c3e50;
      background: #ffffff;
      font-size: 10px;
      line-height: 1.35;
      padding: 10mm 12mm;
      box-sizing: border-box;
    }
    .sheet {
      max-width: 100%;
      margin: 0 auto;
    }
    
    /* Header: Simple, Clean, Centered */
    .header {
      text-align: center;
      padding-bottom: 6px;
      margin-bottom: 8px;
      border-bottom: 1.2px solid #bdc3c7;
    }
    .school-name {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #2c3e50;
      text-transform: uppercase;
    }
    .doc-title {
      font-size: 10.5px;
      font-weight: 600;
      color: #2c3e50;
      margin-top: 2px;
    }
    .doc-meta {
      font-size: 8.5px;
      color: #7f8c8d;
      margin-top: 1px;
    }

    /* Document Info Box */
    .meta-box {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 5px 10px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 6px 10px;
      margin-bottom: 8px;
    }
    .meta-item .label {
      font-size: 8px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: #6c757d;
      display: block;
      margin-bottom: 1px;
    }
    .meta-item .value {
      font-size: 10px;
      font-weight: 600;
      color: #2c3e50;
    }

    /* Sections */
    .section {
      margin-bottom: 8px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .section-title {
      font-size: 9.5px;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 3px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .section-title .badge {
      font-size: 8px;
      font-weight: 600;
      color: #495057;
      background: #ecf0f1;
      border: 1px solid #ced4da;
      padding: 1px 5px;
      border-radius: 3px;
      text-transform: none;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #dee2e6;
      font-size: 9px;
    }
    th {
      background: #f1f3f5;
      color: #2c3e50;
      font-weight: 700;
      text-align: left;
      padding: 3.5px 6px;
      border: 1px solid #dee2e6;
      font-size: 8.5px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    td {
      padding: 3px 6px;
      border: 1px solid #dee2e6;
      color: #2c3e50;
    }
    tr:nth-child(even) td {
      background: #fafbfc;
    }
    tfoot td, tfoot th {
      background: #f8f9fa;
      font-weight: 700;
      border-top: 1.2px solid #bdc3c7;
      color: #2c3e50;
    }
    .amount {
      text-align: right;
      font-family: "Courier New", Courier, monospace;
      font-weight: 600;
      white-space: nowrap;
    }
    .mono {
      font-family: "Courier New", Courier, monospace;
    }
    .text-center {
      text-align: center;
    }
    .badge {
      font-size: 8px;
      font-weight: 600;
      color: #495057;
      background: #ecf0f1;
      border: 1px solid #ced4da;
      padding: 1px 4px;
      border-radius: 2px;
    }
    .clear-notice {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 5px 8px;
      font-size: 8.5px;
      color: #495057;
    }

    /* Summary & Settlement Grid */
    .summary-wrap {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-top: 6px;
      margin-bottom: 10px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .instructions-box {
      flex: 1;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 6px 9px;
      font-size: 8px;
      color: #6c757d;
      line-height: 1.4;
    }
    .instructions-box strong {
      display: block;
      color: #2c3e50;
      font-size: 8.5px;
      margin-bottom: 3px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .summary-card {
      width: 270px;
      border: 1px solid #bdc3c7;
      border-radius: 4px;
      background: #f8f9fa;
      padding: 6px 10px;
    }
    .summary-card .title {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: #2c3e50;
      border-bottom: 1px solid #dee2e6;
      padding-bottom: 3px;
      margin-bottom: 4px;
    }
    .sum-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2px 0;
      font-size: 9px;
      color: #495057;
    }
    .sum-row .sum-val {
      font-family: "Courier New", Courier, monospace;
      font-weight: 600;
      color: #2c3e50;
    }
    .sum-row.total {
      border-top: 1.2px solid #bdc3c7;
      margin-top: 3px;
      padding-top: 4px;
      font-weight: 700;
      font-size: 10px;
      color: #2c3e50;
    }
    .sum-row.balance {
      border-top: 1px dashed #bdc3c7;
      margin-top: 3px;
      padding-top: 3px;
      font-weight: 700;
      font-size: 10px;
      color: #2c3e50;
    }

    /* Signatures */
    .signatures {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 25px;
      margin-top: 16px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .sign-item {
      text-align: center;
      border-top: 1px solid #7f8c8d;
      padding-top: 3px;
      font-size: 8px;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    /* Footer Note */
    .doc-footer {
      border-top: 1px solid #dee2e6;
      margin-top: 8px;
      padding-top: 3px;
      display: flex;
      justify-content: space-between;
      font-size: 7.5px;
      color: #95a5a6;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    @media print {
      @page {
        size: A4 portrait;
        margin: 0 !important;
      }
      html, body {
        margin: 0 !important;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body {
        padding: 10mm 12mm !important;
      }
      .sheet {
        max-width: 100% !important;
        margin: 0 auto !important;
      }
      th, tfoot td, tfoot th, .meta-box, .summary-card, .instructions-box {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
<main class="sheet">
  <header class="header">
    <div class="school-name">EDUSPHERE INTERNATIONAL SYSTEM</div>
    <div class="doc-title">Student Fee Statement</div>
    <div class="doc-meta">Academic Year 2026-27 | Generated: ${generated}</div>
  </header>

  <section class="meta-box">
    <div class="meta-item"><span class="label">Challan Number:</span><span class="value mono">${challan.challanNumber}</span></div>
    <div class="meta-item"><span class="label">Student Name:</span><span class="value">${challan.student}</span></div>
    <div class="meta-item"><span class="label">Roll Number:</span><span class="value mono">${getStudentRollNo(challan)}</span></div>
    <div class="meta-item"><span class="label">Class:</span><span class="value">${challan.className}</span></div>
    <div class="meta-item"><span class="label">Campus:</span><span class="value">${challan.campus}</span></div>
    <div class="meta-item"><span class="label">Billing Month:</span><span class="value">${challan.monthYear}</span></div>
    <div class="meta-item"><span class="label">Due Date:</span><span class="value">${formatDate(challan.dueDate)}</span></div>
    <div class="meta-item"><span class="label">Fee Status:</span><span class="value">${challan.status}</span></div>
    <div class="meta-item"><span class="label">Previous Dues:</span><span class="value">${previousDues > 0 ? `${formatCurrency(previousDues)} (${priorInfo.count} ${priorInfo.count === 1 ? "month" : "months"})` : "Rs 0 (Nil / Clear)"}</span></div>
    ${effectivePaid > 0 ? `
      <div class="meta-item"><span class="label">Amount Paid:</span><span class="value" style="color: #2e7d32;">${formatCurrency(effectivePaid)}</span></div>
      <div class="meta-item"><span class="label">Payment Date:</span><span class="value mono">${challan.lastPaymentDate ? formatDate(challan.lastPaymentDate) : formatDate(challan.dueDate)}</span></div>
      <div class="meta-item"><span class="label">Payment Mode:</span><span class="value">${challan.lastPaymentMethod || "Cash"}</span></div>
      <div class="meta-item"><span class="label">Receipt / Ref #:</span><span class="value mono">${challan.lastReceiptNumber || `RCP-${challan.challanNumber.slice(-6)}`}</span></div>
    ` : ""}
  </section>

  <section class="section">
    <div class="section-title">
      <span>Current Month Fee Breakdown</span>
      <span class="badge">Session ${tier?.academicYear ?? "2026-27"}</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>Fee Description</th>
          <th class="amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
      <tfoot>
        <tr>
          <th>Current Month Calculated Fee Charges</th>
          <th class="amount">${formatCurrency(calculatedAmountDue)}</th>
        </tr>
      </tfoot>
    </table>
  </section>

  ${previousDuesHtml}

  ${studentFines.length > 0 ? `
    <section class="section">
      <div class="section-title"><span>Institutional Fines and Penalties</span></div>
      <table>
        <thead>
          <tr>
            <th>Fine Description and Reference</th>
            <th class="amount">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${fineRows}
        </tbody>
        <tfoot>
          <tr>
            <th>Total Outstanding Fines</th>
            <th class="amount">${formatCurrency(unpaidFineTotal)}</th>
          </tr>
        </tfoot>
      </table>
    </section>
  ` : ""}

  ${paymentsList.length > 0 ? `
    <section class="section">
      <div class="section-title">
        <span>Payment Receipts & Transaction Record</span>
        <span class="badge" style="background:#e8f5e9;color:#2e7d32;border:1px solid #c8e6c9;">
          ${remainingBalance === 0 ? "Fully Cleared" : "Payment Recorded"}
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Receipt / Ref #</th>
            <th>Payment Date</th>
            <th>Payment Mode / Channel</th>
            <th class="amount">Amount Received</th>
            <th class="text-center">Deposit Status</th>
          </tr>
        </thead>
        <tbody>
          ${paymentsList.map((p) => `
            <tr>
              <td class="mono"><strong>${p.receiptNumber || `RCP-${challan.challanNumber.slice(-6)}`}</strong></td>
              <td>${p.paymentDate ? formatDate(p.paymentDate) : formatDate(challan.dueDate)}</td>
              <td>${p.paymentMethod || "Cash (Campus Counter)"}</td>
              <td class="amount" style="font-weight: bold; color: #2e7d32;">${formatCurrency(p.amount)}</td>
              <td class="text-center"><span class="badge" style="background:#e8f5e9;color:#2e7d32;border:1px solid #c8e6c9;">Cleared & Deposited</span></td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr>
            <th colspan="3">Total Payments Received Toward This Challan</th>
            <th class="amount" style="font-weight: bold; color: #2e7d32;">${formatCurrency(effectivePaid)}</th>
            <th class="text-center" style="font-size: 8px; color: #2e7d32;">Verified</th>
          </tr>
        </tfoot>
      </table>
    </section>
  ` : ""}

  <div class="summary-wrap">
    <div class="instructions-box">
      <strong>Payment Instructions</strong>
      • Payment accepted at all authorized bank branches and campus accounts desk.<br>
      • For online/ATM transfers, quote Challan Number: <span class="mono">${challan.challanNumber}</span>.<br>
      • Late fee surcharge of Rs 50/day applies automatically after due date.<br>
      • Retain this official computer-generated statement for school record.
    </div>

    <div class="summary-card">
      <div class="title">Payment Summary</div>
      <div class="sum-row">
        <span>Current Month Charges:</span>
        <span class="sum-val">${formatCurrency(calculatedAmountDue)}</span>
      </div>
      ${previousDues > 0 ? `
        <div class="sum-row">
          <span>Previous Dues (${priorInfo.count} ${priorInfo.count === 1 ? "mo" : "mos"}):</span>
          <span class="sum-val">+${formatCurrency(previousDues)}</span>
        </div>
      ` : `
        <div class="sum-row">
          <span>Previous Dues:</span>
          <span class="sum-val">Rs 0 (Nil)</span>
        </div>
      `}
      ${unpaidFineTotal > 0 ? `
        <div class="sum-row">
          <span>Fines:</span>
          <span class="sum-val">+${formatCurrency(unpaidFineTotal)}</span>
        </div>
      ` : ""}
      <div class="sum-row total">
        <span>Total Payable:</span>
        <span class="sum-val">${formatCurrency(totalPayableWithDuesAndFines)}</span>
      </div>
      ${challan.lastPaymentAmount && challan.lastPaymentAmount > 0 ? `
        <div class="sum-row" style="color: #2e7d32; font-weight: 600;">
          <span>Current Payment Received (${challan.lastPaymentMethod || "Cash"}):</span>
          <span class="sum-val">-${formatCurrency(challan.lastPaymentAmount)}</span>
        </div>
      ` : ""}
      <div class="sum-row" style="color: ${effectivePaid > 0 ? "#2e7d32" : "inherit"}; font-weight: ${effectivePaid > 0 ? "600" : "normal"};">
        <span>Total Paid Toward Challan:</span>
        <span class="sum-val">-${formatCurrency(effectivePaid)}</span>
      </div>
      <div class="sum-row balance">
        <span>Remaining Balance Due:</span>
        <span class="sum-val" style="color: ${remainingBalance === 0 ? "#2e7d32" : "#b71c1c"};">
          ${formatCurrency(remainingBalance)}
        </span>
      </div>
    </div>
  </div>

  <section class="signatures">
    <div class="sign-item">Prepared by (Accounts Clerk)</div>
    <div class="sign-item">Verified by (Campus Finance Head)</div>
    <div class="sign-item">Parent / Depositor Signature</div>
  </section>

  <footer class="doc-footer">
    <span>Official School Document — EduSphere Multi-Campus Management System</span>
    <span>Computer Generated Official Record</span>
  </footer>
</main>
</body>
</html>`;
}

export function printStudentFeeStatement(
  challan: FeeChallan,
  tiers: FeeRevisionRecord[],
  fines: FeeFineRecord[],
  allChallans: FeeChallan[] = []
) {
  return printHtml(buildStudentFeeStatementHtml(challan, tiers, fines, allChallans));
}

export function exportStudentFeeStatementPdf(
  challan: FeeChallan,
  tiers: FeeRevisionRecord[],
  fines: FeeFineRecord[],
  allChallans: FeeChallan[] = []
) {
  if (typeof window === "undefined") return false;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  const tier = resolveMatchingTier(challan.className, tiers);
  const studentFines = fines.filter((fine) => fine.student.trim().toLowerCase() === challan.student.trim().toLowerCase());
  const unpaidFineTotal = studentFines.filter((fine) => fine.status === "Unpaid").reduce((sum, fine) => sum + fine.amount, 0);

  const priorInfo = calculatePreviousMonthDues(challan, allChallans);
  const previousDues = challan.previousDues !== undefined && challan.previousDues > 0 ? challan.previousDues : (priorInfo.total ?? 0);

  const tuitionFee = challan.tuitionFee ?? tier?.tuitionFee ?? 0;
  const labCharges = challan.labCharges ?? tier?.labCharges ?? 0;
  const sportsCharges = challan.sportsCharges ?? tier?.sportsCharges ?? 0;
  const transportCharges = challan.transportCharges ?? 0;
  const fineCharges = challan.fineCharges ?? 0;
  const libraryFund = challan.libraryFund ?? tier?.libraryFund ?? 0;
  const utilitySurcharge = challan.utilitySurcharge ?? tier?.utilitySurcharge ?? 0;
  const otherCharges = challan.otherCharges ?? tier?.otherCharges ?? 0;
  const customHeads = challan.customHeads ?? tier?.customHeads ?? [];

  const customHeadsSum = customHeads.reduce((s, h) => s + (Number(h.amount) || 0), 0);
  const scholarshipConcession = challan.scholarshipConcession || 0;
  const grossChargesTotal =
    tier || challan.tuitionFee !== undefined || transportCharges > 0 || fineCharges > 0
      ? tuitionFee + labCharges + sportsCharges + transportCharges + fineCharges + libraryFund + utilitySurcharge + otherCharges + customHeadsSum
      : (challan.totalPayable + scholarshipConcession);

  const calculatedChargesTotal = Math.max(0, grossChargesTotal - scholarshipConcession);

  const additionalAdjustments =
    tier && challan.totalPayable > calculatedChargesTotal
      ? challan.totalPayable - calculatedChargesTotal
      : 0;

  const amountDue = calculatedChargesTotal + additionalAdjustments;
  const totalPayableWithDuesAndFines = amountDue + previousDues + unpaidFineTotal;

  // Deduplicate any identical payment entries
  const rawPaymentsPdf = challan.payments && challan.payments.length > 0 ? challan.payments : [];
  const seenPdfP = new Set<string>();
  const dedupedPdfList = rawPaymentsPdf.filter((p) => {
    const key = `${p.receiptNumber || ""}-${p.paymentDate || ""}-${p.amount}-${p.paymentMethod || ""}`;
    if (seenPdfP.has(key)) return false;
    seenPdfP.add(key);
    return true;
  });

  const sumOfPdfPayments = dedupedPdfList.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const actualPdfPaid = sumOfPdfPayments > 0 ? sumOfPdfPayments : (challan.paid ?? 0);
  const effectivePaid = Math.min(totalPayableWithDuesAndFines, actualPdfPaid);
  const remainingBalance = Math.max(0, totalPayableWithDuesAndFines - effectivePaid);

  const paymentsList = dedupedPdfList.length > 0
    ? dedupedPdfList
    : effectivePaid > 0
      ? [{
          id: "pay-1",
          receiptNumber: challan.lastReceiptNumber || `RCP-${challan.challanNumber.slice(-6)}`,
          paymentDate: challan.lastPaymentDate || challan.dueDate,
          paymentMethod: challan.lastPaymentMethod || "Cash (Campus Counter)",
          amount: challan.lastPaymentAmount || effectivePaid,
        }]
      : [];

  // 1. Clean Professional Header - Centered & Monochrome
  let currentY = 16;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(44, 62, 80);
  doc.text("EDUSPHERE INTERNATIONAL SYSTEM", pageWidth / 2, currentY, { align: "center" });
  
  currentY += 5.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Student Fee Statement", pageWidth / 2, currentY, { align: "center" });
  
  currentY += 4.5;
  doc.setFontSize(8);
  doc.setTextColor(108, 117, 125);
  doc.text("Academic Year 2026-27", pageWidth / 2, currentY, { align: "center" });
  
  // Header separator line
  currentY += 3.5;
  doc.setDrawColor(189, 195, 199);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  
  currentY += 6;

  // 2. Document Info Section - Simple Neutral Gray Box
  const boxStartY = currentY;
  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(222, 226, 230);
  doc.setLineWidth(0.2);
  doc.rect(margin, boxStartY, contentWidth, 28, "FD");
  
  // Left column
  currentY = boxStartY + 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(108, 117, 125);
  doc.text("Challan Number:", margin + 4, currentY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(44, 62, 80);
  doc.text(challan.challanNumber, margin + 35, currentY);
  
  currentY += 5;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(108, 117, 125);
  doc.text("Student Name:", margin + 4, currentY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(44, 62, 80);
  doc.text(`${challan.student} (${getStudentRollNo(challan)})`, margin + 35, currentY);
  
  currentY += 5;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(108, 117, 125);
  doc.text("Class:", margin + 4, currentY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(44, 62, 80);
  doc.text(challan.className, margin + 35, currentY);

  currentY += 5;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(108, 117, 125);
  doc.text("Previous Dues:", margin + 4, currentY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(44, 62, 80);
  doc.text(previousDues > 0 ? `${formatPdfCurrency(previousDues)} (${priorInfo.count} ${priorInfo.count === 1 ? "month" : "months"} overdue)` : "Rs 0 (Nil / Clear)", margin + 35, currentY);
  
  // Right column
  currentY = boxStartY + 5;
  const rightColX = pageWidth / 2 + 10;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(108, 117, 125);
  doc.text("Campus:", rightColX, currentY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(44, 62, 80);
  doc.text(challan.campus, rightColX + 25, currentY);
  
  currentY += 5;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(108, 117, 125);
  doc.text("Billing Month:", rightColX, currentY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(44, 62, 80);
  doc.text(challan.monthYear, rightColX + 25, currentY);
  
  currentY += 5;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(108, 117, 125);
  doc.text("Due Date:", rightColX, currentY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(44, 62, 80);
  doc.text(formatDate(challan.dueDate), rightColX + 25, currentY);
  
  currentY += 5;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(108, 117, 125);
  doc.text("Status:", rightColX, currentY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(44, 62, 80);
  doc.text(challan.status, rightColX + 25, currentY);

  currentY = boxStartY + 31;

  // 3. Current Month Fee Breakdown Table - Clean Neutral
  const feeRows: string[][] = [];
  if (tier || challan.tuitionFee !== undefined || transportCharges > 0 || fineCharges > 0) {
    let idx = 1;
    feeRows.push([String(idx++), "Tuition Fee", formatPdfCurrency(tuitionFee)]);
    if (labCharges > 0) {
      feeRows.push([String(idx++), "Lab Charges", formatPdfCurrency(labCharges)]);
    }
    if (sportsCharges > 0) {
      feeRows.push([String(idx++), "Sports & Activities", formatPdfCurrency(sportsCharges)]);
    }
    if (transportCharges > 0) {
      feeRows.push([String(idx++), "Transport Charges", formatPdfCurrency(transportCharges)]);
    }
    if (fineCharges > 0) {
      feeRows.push([String(idx++), "Fine Charges", formatPdfCurrency(fineCharges)]);
    }
    if (libraryFund > 0) {
      feeRows.push([String(idx++), "Library Fund", formatPdfCurrency(libraryFund)]);
    }
    if (utilitySurcharge > 0) {
      feeRows.push([String(idx++), "Utilities & Maintenance", formatPdfCurrency(utilitySurcharge)]);
    }
    if (otherCharges > 0) {
      feeRows.push([String(idx++), "Other Charges", formatPdfCurrency(otherCharges)]);
    }
    for (const head of customHeads) {
      feeRows.push([String(idx++), head.name, formatPdfCurrency(head.amount)]);
    }
    if (challan.scholarshipConcession && challan.scholarshipConcession > 0) {
      feeRows.push([
        String(idx++),
        `Less: Scholarship Concession (${challan.scholarshipName || "Scholarship"}${challan.scholarshipPercent ? ` - ${challan.scholarshipPercent}%` : ""})`,
        `-Rs ${challan.scholarshipConcession.toLocaleString()}`,
      ]);
    }
  } else {
    feeRows.push(["1", "Fee Amount", formatPdfCurrency(challan.totalPayable)]);
  }

  if (additionalAdjustments > 0) {
    feeRows.push([String(feeRows.length + 1), "Additional Adjustments", formatPdfCurrency(additionalAdjustments)]);
  }

  autoTable(doc, {
    startY: currentY,
    head: [["#", "Current Month Fee Description", "Amount"]],
    body: feeRows,
    foot: [["", "Current Month Subtotal", formatPdfCurrency(amountDue)]],
    theme: "plain",
    styles: { 
      font: "helvetica", 
      fontSize: 8.5, 
      cellPadding: 2.5,
      textColor: [44, 62, 80],
      lineColor: [222, 226, 230],
      lineWidth: 0.1,
    },
    headStyles: { 
      fillColor: [241, 243, 245], 
      textColor: [44, 62, 80],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    footStyles: { 
      fillColor: [248, 249, 250],
      textColor: [44, 62, 80],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: contentWidth - 45 },
      2: { cellWidth: 35, halign: "right", fontStyle: "bold" },
    },
    margin: { left: margin, right: margin },
  });

  let afterTableY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 130;

  // 4. Previous Unpaid Months & Arrears Record Table - Clean Neutral
  if (previousDues > 0 && priorInfo.priorChallans.length > 0) {
    if (afterTableY + 40 > pageHeight - 35) {
      doc.addPage();
      afterTableY = 16;
    } else {
      afterTableY += 4;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(44, 62, 80);
    doc.text(`Previous Unpaid Months & Arrears Record (${priorInfo.count} ${priorInfo.count === 1 ? "Month" : "Months"} Pending)`, margin, afterTableY + 3);

    const arrearsRows = priorInfo.priorChallans.map((p, idx) => [
      String(idx + 1),
      p.monthYear,
      p.challanNumber || "—",
      p.dueDate ? formatDate(p.dueDate) : "—",
      formatPdfCurrency(p.billedAmount ?? p.balance),
      formatPdfCurrency(p.paidAmount ?? 0),
      formatPdfCurrency(p.balance),
      p.status || "Unpaid",
    ]);

    autoTable(doc, {
      startY: afterTableY + 5,
      head: [["#", "Unpaid Month", "Challan #", "Due Date", "Billed", "Paid", "Arrears", "Status"]],
      body: arrearsRows,
      foot: [["", "", "", "Total Previous Arrears Carried Forward", "", "", formatPdfCurrency(previousDues), ""]],
      theme: "plain",
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2.2,
        textColor: [44, 62, 80],
        lineColor: [222, 226, 230],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [241, 243, 245],
        textColor: [44, 62, 80],
        fontStyle: "bold",
        fontSize: 8,
      },
      footStyles: {
        fillColor: [248, 249, 250],
        textColor: [44, 62, 80],
        fontStyle: "bold",
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        1: { cellWidth: 26, fontStyle: "bold" },
        2: { cellWidth: 32, font: "courier", fontSize: 7.5 },
        3: { cellWidth: 24, halign: "center" },
        4: { cellWidth: 22, halign: "right" },
        5: { cellWidth: 22, halign: "right" },
        6: { cellWidth: 24, halign: "right", fontStyle: "bold" },
        7: { cellWidth: contentWidth - 158, halign: "center" },
      },
      margin: { left: margin, right: margin },
    });

    afterTableY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? afterTableY;
  } else {
    afterTableY += 3;
    doc.setFillColor(248, 249, 250);
    doc.setDrawColor(222, 226, 230);
    doc.setLineWidth(0.2);
    doc.rect(margin, afterTableY, contentWidth, 5.5, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(108, 117, 125);
    doc.text("Previous Dues Status: Fully Cleared (No outstanding arrears from prior billing cycles)", margin + 4, afterTableY + 3.8);
    afterTableY += 6.5;
  }

  // 5. Fines Section (if applicable)
  if (studentFines.length > 0) {
    if (afterTableY + 28 > pageHeight - 35) {
      doc.addPage();
      afterTableY = 16;
    } else {
      afterTableY += 4;
    }

    autoTable(doc, {
      startY: afterTableY,
      head: [["Fine Type", "Fine Number", "Amount"]],
      body: studentFines.map((f) => [f.fineType, f.fineNumber, formatPdfCurrency(f.amount)]),
      foot: [["", "Total Fines", formatPdfCurrency(unpaidFineTotal)]],
      theme: "plain",
      styles: { 
        font: "helvetica", 
        fontSize: 8.5, 
        cellPadding: 2.5,
        textColor: [44, 62, 80],
        lineColor: [222, 226, 230],
        lineWidth: 0.1,
      },
      headStyles: { 
        fillColor: [241, 243, 245],
        textColor: [44, 62, 80],
        fontStyle: "bold",
        fontSize: 8.5,
      },
      footStyles: { 
        fillColor: [248, 249, 250],
        textColor: [44, 62, 80],
        fontStyle: "bold",
        fontSize: 8.5,
      },
      columnStyles: {
        0: { cellWidth: contentWidth - 70 },
        1: { cellWidth: 35, halign: "center" },
        2: { cellWidth: 35, halign: "right", fontStyle: "bold" },
      },
      margin: { left: margin, right: margin },
    });

    afterTableY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? afterTableY;
  }

  // 5b. Payment Receipts & Transaction Record (if any payment made)
  if (paymentsList.length > 0) {
    if (afterTableY + 28 > pageHeight - 35) {
      doc.addPage();
      afterTableY = 16;
    } else {
      afterTableY += 4;
    }

    autoTable(doc, {
      startY: afterTableY,
      head: [["Receipt / Ref #", "Payment Date", "Payment Mode", "Amount Received", "Status"]],
      body: paymentsList.map((p) => [
        p.receiptNumber || `RCP-${challan.challanNumber.slice(-6)}`,
        p.paymentDate ? formatDate(p.paymentDate) : formatDate(challan.dueDate),
        p.paymentMethod || "Cash (Campus Counter)",
        formatPdfCurrency(p.amount),
        "Cleared & Deposited",
      ]),
      foot: [["", "", "Total Payments Received", formatPdfCurrency(effectivePaid), "Verified"]],
      theme: "plain",
      styles: { 
        font: "helvetica", 
        fontSize: 8.5, 
        cellPadding: 2.5,
        textColor: [44, 62, 80],
        lineColor: [222, 226, 230],
        lineWidth: 0.1,
      },
      headStyles: { 
        fillColor: [241, 243, 245],
        textColor: [44, 62, 80],
        fontStyle: "bold",
        fontSize: 8.5,
      },
      footStyles: { 
        fillColor: [232, 245, 233],
        textColor: [46, 125, 50],
        fontStyle: "bold",
        fontSize: 8.5,
      },
      columnStyles: {
        0: { cellWidth: 38, fontStyle: "bold" },
        1: { cellWidth: 28 },
        2: { cellWidth: contentWidth - 126 },
        3: { cellWidth: 32, halign: "right", fontStyle: "bold", textColor: [46, 125, 50] },
        4: { cellWidth: 28, halign: "center", textColor: [46, 125, 50] },
      },
      margin: { left: margin, right: margin },
    });

    afterTableY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? afterTableY;
  }

  // 6. Payment Summary & Payment Instructions - Symmetrical Neutral Boxes
  const summaryBoxW = 78;
  const instructGap = 6;
  const instructBoxW = contentWidth - summaryBoxW - instructGap; // 96mm
  const instructBoxX = margin; // 15mm
  const summaryBoxX = margin + instructBoxW + instructGap; // 117mm
  const hasCurrentPayment = Boolean(challan.lastPaymentAmount && challan.lastPaymentAmount > 0);
  const boxH = Math.max(38, (unpaidFineTotal > 0 ? 43 : 38) + (hasCurrentPayment ? 4.5 : 0));

  let summaryY = afterTableY + 6;
  if (summaryY + boxH + 28 > pageHeight - 12) {
    doc.addPage();
    summaryY = 18;
  }

  // 7. Payment Instructions Box (Left)
  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(222, 226, 230);
  doc.setLineWidth(0.2);
  doc.rect(instructBoxX, summaryY, instructBoxW, boxH, "FD");

  let instructY = summaryY + 5.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(44, 62, 80);
  doc.text("Payment Instructions", instructBoxX + 4, instructY);

  instructY += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(108, 117, 125);

  const instructions = [
    "Payment accepted at authorized bank branches & accounts desk.",
    `For online or ATM transfers, quote Challan: ${challan.challanNumber}`,
    "Surcharge of Rs 50/day applies automatically after due date.",
    "Retain this official computer-generated receipt for school records.",
  ];

  const maxBulletWidth = instructBoxW - 8;
  instructions.forEach((line) => {
    const wrapped = doc.splitTextToSize(`• ${line}`, maxBulletWidth);
    doc.text(wrapped, instructBoxX + 4, instructY);
    instructY += (Array.isArray(wrapped) ? wrapped.length : 1) * 3.7 + 1.2;
  });

  // 8. Payment Summary Box (Right)
  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(222, 226, 230);
  doc.setLineWidth(0.2);
  doc.rect(summaryBoxX, summaryY, summaryBoxW, boxH, "FD");

  let summaryTextY = summaryY + 5.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(44, 62, 80);
  doc.text("Payment Summary", summaryBoxX + 4, summaryTextY);

  summaryTextY += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(108, 117, 125);
  doc.text("Current Charges:", summaryBoxX + 4, summaryTextY);
  doc.setTextColor(44, 62, 80);
  doc.text(formatPdfCurrency(amountDue), summaryBoxX + summaryBoxW - 4, summaryTextY, { align: "right" });

  if (previousDues > 0) {
    summaryTextY += 4.5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(108, 117, 125);
    const arrearsLabel = `Previous Arrears (${priorInfo.count} ${priorInfo.count === 1 ? "mo" : "mos"}):`;
    doc.text(arrearsLabel, summaryBoxX + 4, summaryTextY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 62, 80);
    doc.text("+" + formatPdfCurrency(previousDues), summaryBoxX + summaryBoxW - 4, summaryTextY, { align: "right" });
  } else {
    summaryTextY += 4.5;
    doc.setTextColor(108, 117, 125);
    doc.text("Previous Dues:", summaryBoxX + 4, summaryTextY);
    doc.setTextColor(44, 62, 80);
    doc.text("Rs 0 (Nil)", summaryBoxX + summaryBoxW - 4, summaryTextY, { align: "right" });
  }

  if (unpaidFineTotal > 0) {
    summaryTextY += 4.5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(108, 117, 125);
    doc.text("Outstanding Fines:", summaryBoxX + 4, summaryTextY);
    doc.setTextColor(44, 62, 80);
    doc.text("+" + formatPdfCurrency(unpaidFineTotal), summaryBoxX + summaryBoxW - 4, summaryTextY, { align: "right" });
  }

  summaryTextY += 1.5;
  doc.setDrawColor(222, 226, 230);
  doc.line(summaryBoxX + 4, summaryTextY, summaryBoxX + summaryBoxW - 4, summaryTextY);
  
  summaryTextY += 4.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(44, 62, 80);
  doc.text("Total Payable:", summaryBoxX + 4, summaryTextY);
  doc.text(formatPdfCurrency(totalPayableWithDuesAndFines), summaryBoxX + summaryBoxW - 4, summaryTextY, { align: "right" });

  if (hasCurrentPayment && challan.lastPaymentAmount) {
    summaryTextY += 4.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(46, 125, 50);
    const payMethodLabel = `Current Payment (${challan.lastPaymentMethod || "Cash"}):`;
    doc.text(payMethodLabel, summaryBoxX + 4, summaryTextY);
    doc.setFont("helvetica", "bold");
    doc.text("-" + formatPdfCurrency(challan.lastPaymentAmount), summaryBoxX + summaryBoxW - 4, summaryTextY, { align: "right" });
  }

  summaryTextY += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  if (effectivePaid > 0) {
    doc.setTextColor(46, 125, 50);
  } else {
    doc.setTextColor(108, 117, 125);
  }
  doc.text("Total Paid Toward Challan:", summaryBoxX + 4, summaryTextY);
  doc.setFont("helvetica", effectivePaid > 0 ? "bold" : "normal");
  const paidPrefix = effectivePaid > 0 ? "-" : "";
  doc.text(paidPrefix + formatPdfCurrency(effectivePaid), summaryBoxX + summaryBoxW - 4, summaryTextY, { align: "right" });

  summaryTextY += 4.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(44, 62, 80);
  doc.text("Remaining Balance:", summaryBoxX + 4, summaryTextY);
  doc.text(formatPdfCurrency(remainingBalance), summaryBoxX + summaryBoxW - 4, summaryTextY, { align: "right" });

  // 9. Signature Section (Symmetrical & Centered)
  let signY = summaryY + boxH + 13;
  if (signY + 16 > pageHeight - 12) {
    doc.addPage();
    signY = 25;
  }
  
  const signLineWidth = 48;
  const signGap = (contentWidth - (signLineWidth * 3)) / 2; // 18mm

  const sign1Start = margin;
  const sign1End = sign1Start + signLineWidth;
  const sign1Center = (sign1Start + sign1End) / 2;

  const sign2Start = sign1End + signGap;
  const sign2End = sign2Start + signLineWidth;
  const sign2Center = (sign2Start + sign2End) / 2;

  const sign3Start = sign2End + signGap;
  const sign3End = pageWidth - margin;
  const sign3Center = (sign3Start + sign3End) / 2;

  doc.setDrawColor(189, 195, 199);
  doc.setLineWidth(0.2);

  doc.line(sign1Start, signY, sign1End, signY);
  doc.line(sign2Start, signY, sign2End, signY);
  doc.line(sign3Start, signY, sign3End, signY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(108, 117, 125);
  doc.text("Prepared by (Accounts Clerk)", sign1Center, signY + 4, { align: "center" });
  doc.text("Verified by (Finance Head)", sign2Center, signY + 4, { align: "center" });
  doc.text("Parent / Depositor Signature", sign3Center, signY + 4, { align: "center" });

  // 10. Footer
  const footY = pageHeight - 12;
  doc.setDrawColor(222, 226, 230);
  doc.setLineWidth(0.2);
  doc.line(margin, footY, pageWidth - margin, footY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(127, 140, 141);
  doc.text("Official School Document — EduSphere Multi-Campus System", margin, footY + 3.5);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margin, footY + 3.5, { align: "right" });

  const safeName = challan.student.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  doc.save("fee-statement-" + safeName + "-" + challan.challanNumber + ".pdf");
  return true;
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

  // Simple professional header
  cmds.push("BT /F2 12 Tf 0.17 0.24 0.31 rg 297.64 820 Td (EDUSPHERE MULTI-CAMPUS SYSTEM) Tj ET");
  cmds.push("BT /F2 10 Tf 0.17 0.24 0.31 rg 297.64 805 Td (Fee Challans Register) Tj ET");
  cmds.push(`BT /F1 8 Tf 0.5 0.55 0.55 rg 297.64 792 Td (Academic Year 2026-27 | Generated: ${sanitizePdfText(generatedDate)}) Tj ET`);

  // Header line separator
  cmds.push("0.85 0.87 0.90 RG 0.5 w");
  cmds.push("28 780 539.28 0 re S");

  // Summary information box
  cmds.push("0.96 0.97 0.98 rg");
  cmds.push("28 750 539.28 24 re f");
  cmds.push("0.85 0.87 0.90 RG 0.3 w");
  cmds.push("28 750 539.28 24 re S");

  cmds.push("0.17 0.24 0.31 rg");
  cmds.push(`BT /F1 8 Tf 35 760 Td (Total Records: ${challans.length}) Tj ET`);
  cmds.push(`BT /F1 8 Tf 160 760 Td (Total Due: Rs ${totalPayable.toLocaleString()}) Tj ET`);
  cmds.push("0.17 0.24 0.31 rg");
  cmds.push(`BT /F1 8 Tf 300 760 Td (Collected: Rs ${totalPaid.toLocaleString()}) Tj ET`);
  cmds.push("0.17 0.24 0.31 rg");
  cmds.push(`BT /F1 8 Tf 440 760 Td (Balance: Rs ${totalBalance.toLocaleString()}) Tj ET`);

  // Table columns
  const cols = [
    { title: "Challan No", x: 34 },
    { title: "Student Name", x: 115 },
    { title: "Class", x: 220 },
    { title: "Campus", x: 280 },
    { title: "Collect Date", x: 350 },
    { title: "Amount", x: 430 },
    { title: "Paid", x: 480 },
    { title: "Status", x: 528 },
  ];

  const drawTableHeader = (target: string[], y: number) => {
    // Header background
    target.push("0.94 0.95 0.96 rg");
    target.push(`28 ${y} 539.28 18 re f`);
    target.push("0.70 0.73 0.77 RG 0.3 w");
    target.push(`28 ${y} 539.28 18 re S`);
    
    // Header text
    target.push("0.17 0.24 0.31 rg");
    for (const col of cols) {
      target.push(`BT /F2 8 Tf ${col.x} ${y + 6} Td (${col.title}) Tj ET`);
    }
  };

  const pages: string[][] = [cmds];
  let current = cmds;
  let curY = 720;
  drawTableHeader(current, curY);
  curY -= 18;

  challans.forEach((r, idx) => {
    if (curY < 60) {
      current = [];
      pages.push(current);
      curY = 810;
      drawTableHeader(current, curY);
      curY -= 18;
    }
    
    // Row background (alternating)
    const bg = idx % 2 === 0 ? "1 1 1" : "0.98 0.99 0.99";
    current.push(`${bg} rg`);
    current.push(`28 ${curY} 539.28 16 re f`);
    
    // Row border
    current.push("0.85 0.87 0.90 RG 0.2 w");
    current.push(`28 ${curY} 539.28 16 re S`);

    // Row data
    current.push("0.17 0.24 0.31 rg");
    current.push(`BT /F1 7.5 Tf 34 ${curY + 5} Td (${sanitizePdfText(r.challanNumber)}) Tj ET`);
    current.push(`BT /F1 7.5 Tf 115 ${curY + 5} Td (${sanitizePdfText(r.student.slice(0, 22))}) Tj ET`);
    current.push(`BT /F1 7.5 Tf 220 ${curY + 5} Td (${sanitizePdfText(r.className)}) Tj ET`);
    current.push(`BT /F1 7.5 Tf 280 ${curY + 5} Td (${sanitizePdfText(r.campus)}) Tj ET`);
    const rawCollect = r.collectDate || r.lastPaymentDate;
    const collectDateStr = rawCollect && r.paid > 0 ? formatDate(rawCollect) : "-";
    current.push(`BT /F1 7.5 Tf 350 ${curY + 5} Td (${sanitizePdfText(collectDateStr)}) Tj ET`);
    current.push(`BT /F2 7.5 Tf 430 ${curY + 5} Td (${r.totalPayable.toLocaleString("en-US")}) Tj ET`);
    current.push(`BT /F1 7.5 Tf 480 ${curY + 5} Td (${r.paid.toLocaleString("en-US")}) Tj ET`);

    // Status with color
    if (r.status === "Paid") current.push("0.13 0.59 0.34 rg");
    else if (r.status === "Overdue") current.push("0.73 0.15 0.15 rg");
    else if (r.status === "Partial") current.push("0.85 0.50 0.10 rg");
    else current.push("0.50 0.55 0.55 rg");

    current.push(`BT /F2 7.5 Tf 528 ${curY + 5} Td (${r.status}) Tj ET`);
    curY -= 16;
  });

  // Add footers to all pages
  pages.forEach((pg, i) => {
    // Footer line
    pg.push("0.85 0.87 0.90 RG 0.3 w");
    pg.push("28 40 539.28 0 re S");
    
    // Footer text
    pg.push("0.5 0.55 0.55 rg");
    pg.push("BT /F1 7 Tf 28 32 Td (Official School Document - Fee Challans Register) Tj ET");
    pg.push(`BT /F1 7 Tf 540 32 Td (Page ${i + 1} of ${pages.length}) Tj ET`);
    
    // Signature line on last page
    if (i === pages.length - 1) {
      pg.push("BT /F1 7 Tf 28 20 Td (Prepared By: ___________________) Tj ET");
      pg.push("BT /F1 7 Tf 400 20 Td (Date: ___________________) Tj ET");
    }
  });

  const pdfBlob = buildMinimalPdf(pages.map((pg) => pg.join("\n")));
  triggerBlobDownload(pdfBlob, `Fee_Challans_Register_${generatedDate.replace(/\s+/g, '_')}.pdf`);
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

  // Simple professional header
  cmds.push("BT /F2 12 Tf 0.17 0.24 0.31 rg 297.64 820 Td (EDUSPHERE MULTI-CAMPUS SYSTEM) Tj ET");
  cmds.push("BT /F2 10 Tf 0.17 0.24 0.31 rg 297.64 805 Td (Fee Structures Register) Tj ET");
  cmds.push(`BT /F1 8 Tf 0.5 0.55 0.55 rg 297.64 792 Td (Academic Year 2026-27 | Generated: ${sanitizePdfText(generatedDate)}) Tj ET`);

  // Header line separator
  cmds.push("0.85 0.87 0.90 RG 0.5 w");
  cmds.push("28 780 539.28 0 re S");

  let curY = 760;
  
  structures.forEach((fs, idx) => {
    const total = fs.feeHeads.reduce((s, h) => s + h.amount, 0);

    // Check if we need a new page
    const requiredSpace = 30 + (fs.feeHeads.length * 14) + 12;
    if (curY - requiredSpace < 60) {
      // Add footer to current page
      cmds.push("0.85 0.87 0.90 RG 0.3 w");
      cmds.push("28 40 539.28 0 re S");
      cmds.push("0.5 0.55 0.55 rg");
      cmds.push("BT /F1 7 Tf 28 32 Td (Official School Document - Fee Structures Register) Tj ET");
      
      // Start new page
      const newPage: string[] = [];
      cmds.push("--- PAGE BREAK ---"); // This will be handled in multi-page builder
      curY = 810;
    }

    // Class header box
    cmds.push("0.96 0.97 0.98 rg");
    cmds.push(`28 ${curY - 16} 539.28 16 re f`);
    cmds.push("0.70 0.73 0.77 RG 0.3 w");
    cmds.push(`28 ${curY - 16} 539.28 16 re S`);

    cmds.push("0.17 0.24 0.31 rg");
    cmds.push(
      `BT /F2 9 Tf 35 ${curY - 10} Td (${sanitizePdfText(
        fs.className
      )} - ${sanitizePdfText(fs.academicYear)}) Tj ET`
    );
    cmds.push(
      `BT /F2 9 Tf 460 ${curY - 10} Td (Total: Rs ${total.toLocaleString()}) Tj ET`
    );

    curY -= 18;

    // Fee heads
    fs.feeHeads.forEach((h, hIdx) => {
      const bg = hIdx % 2 === 0 ? "1 1 1" : "0.98 0.99 0.99";
      cmds.push(`${bg} rg`);
      cmds.push(`35 ${curY - 12} 532.28 12 re f`);
      
      cmds.push("0.85 0.87 0.90 RG 0.2 w");
      cmds.push(`35 ${curY - 12} 532.28 12 re S`);

      cmds.push("0.17 0.24 0.31 rg");
      cmds.push(`BT /F1 7.5 Tf 40 ${curY - 8} Td (${sanitizePdfText(h.headName)}) Tj ET`);
      cmds.push(`BT /F1 7.5 Tf 320 ${curY - 8} Td (${sanitizePdfText(h.frequency)}) Tj ET`);
      cmds.push(`BT /F2 7.5 Tf 460 ${curY - 8} Td (Rs ${h.amount.toLocaleString()}) Tj ET`);
      
      curY -= 12;
    });

    curY -= 10;
  });

  // Footer
  cmds.push("0.85 0.87 0.90 RG 0.3 w");
  cmds.push("28 40 539.28 0 re S");
  cmds.push("0.5 0.55 0.55 rg");
  cmds.push("BT /F1 7 Tf 28 32 Td (Official School Document - Fee Structures Register) Tj ET");
  cmds.push("BT /F1 7 Tf 540 32 Td (Page 1 of 1) Tj ET");
  cmds.push("BT /F1 7 Tf 28 20 Td (Approved By: ___________________) Tj ET");

  const pdfBlob = buildMinimalPdf([cmds.join("\n")]);
  triggerBlobDownload(pdfBlob, `Fee_Structures_${generatedDate.replace(/\s+/g, '_')}.pdf`);
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
        <div class="doc-title">Fee Challans Register</div>
        <div class="doc-meta">Academic Year 2026-27 | Generated: ${generatedDate}</div>
      </div>

      <div class="summary-box">
        <div class="summary-item">
          <span class="label">Total Records:</span>
          <span class="value">${challans.length}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total Due:</span>
          <span class="value">${formatCurrency(totalPayable)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Collected:</span>
          <span class="value">${formatCurrency(totalPaid)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Balance:</span>
          <span class="value">${formatCurrency(totalBalance)}</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Challan No</th>
            <th>Student Name</th>
            <th>Class</th>
            <th>Campus</th>
            <th>Collect Date</th>
            <th style="text-align: right;">Amount</th>
            <th style="text-align: right;">Paid</th>
            <th style="text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${challans
            .map((c) => {
              const cDate = c.collectDate || c.lastPaymentDate;
              const collectStr = cDate && c.paid > 0 ? formatDate(cDate) : "—";
              return `
            <tr>
              <td class="font-bold">${c.challanNumber}</td>
              <td>${c.student}</td>
              <td>${c.className}</td>
              <td>${c.campus}</td>
              <td>${collectStr}</td>
              <td style="text-align: right; font-weight: 600;">${formatCurrency(c.totalPayable)}</td>
              <td style="text-align: right;">${formatCurrency(c.paid)}</td>
              <td style="text-align: center;">
                <span class="status-badge status-${c.status.toLowerCase()}">${c.status}</span>
              </td>
            </tr>
          `;
            })
            .join("")}
        </tbody>
      </table>
    `;
  } else {
    contentHtml = `
      <div class="header">
        <div class="org-title">EDUSPHERE MULTI-CAMPUS SYSTEM</div>
        <div class="doc-title">Fee Structures Register</div>
        <div class="doc-meta">Academic Year 2026-27 | Generated: ${generatedDate}</div>
      </div>

      ${structures
        .map((fs) => {
          const total = fs.feeHeads.reduce((s, h) => s + h.amount, 0);
          return `
          <div class="structure-section">
            <div class="structure-header">
              <span class="class-name">${fs.className}</span>
              <span class="academic-year">${fs.academicYear}</span>
              <span class="total-amount">Total: ${formatCurrency(total)}</span>
            </div>
            <table>
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
          </div>
        `;
        })
        .join("")}
    `;
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title></title>
        <style>
          @page { size: A4 landscape; margin: 0; }
          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            background: #ffffff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #2c3e50;
            font-size: 10px;
            line-height: 1.4;
            padding: 12mm 15mm;
          }
          @media print {
            @page { size: A4 landscape; margin: 0 !important; }
            html, body { margin: 0 !important; }
            body { padding: 12mm 15mm !important; }
          }
          .header {
            text-align: center;
            border-bottom: 1px solid #bdc3c7;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .org-title {
            font-size: 14px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 3px;
          }
          .doc-title {
            font-size: 12px;
            font-weight: bold;
            color: #34495e;
            margin-bottom: 3px;
          }
          .doc-meta {
            font-size: 8px;
            color: #7f8c8d;
          }
          .summary-box {
            display: flex;
            justify-content: space-around;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 8px;
            margin-bottom: 12px;
          }
          .summary-item {
            text-align: center;
          }
          .summary-item .label {
            font-size: 8px;
            color: #6c757d;
            display: block;
            margin-bottom: 2px;
          }
          .summary-item .value {
            font-size: 10px;
            font-weight: bold;
            color: #2c3e50;
          }
          .text-success { color: #2c3e50 !important; }
          .text-danger { color: #2c3e50 !important; }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
            margin-bottom: 15px;
          }
          th {
            background-color: #ecf0f1;
            color: #2c3e50;
            font-weight: bold;
            text-align: left;
            padding: 5px 6px;
            border: 1px solid #bdc3c7;
          }
          td {
            padding: 4px 6px;
            border: 1px solid #dee2e6;
          }
          tr:nth-child(even) td {
            background-color: #f8f9fa;
          }
          .font-bold { font-weight: bold; }
          .status-badge {
            display: inline-block;
            font-size: 8px;
            font-weight: bold;
            padding: 2px 5px;
            border-radius: 3px;
          }
          .status-paid { background: #f8f9fa; color: #2c3e50; border: 1px solid #dee2e6; }
          .status-unpaid { background: #f8f9fa; color: #2c3e50; border: 1px solid #dee2e6; }
          .status-partial { background: #f8f9fa; color: #2c3e50; border: 1px solid #dee2e6; }
          .status-overdue { background: #f8f9fa; color: #2c3e50; border: 1px solid #dee2e6; }
          .structure-section {
            margin-bottom: 15px;
            break-inside: avoid;
          }
          .structure-header {
            background: #ecf0f1;
            padding: 6px 8px;
            border: 1px solid #bdc3c7;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
          }
          .structure-header .class-name {
            font-weight: bold;
            font-size: 10px;
          }
          .structure-header .academic-year {
            font-size: 8px;
            color: #7f8c8d;
          }
          .structure-header .total-amount {
            font-weight: bold;
            font-size: 9px;
          }
          .footer-signatures {
            margin-top: 25px;
            display: flex;
            justify-content: space-between;
            padding-top: 10px;
            border-top: 1px solid #dee2e6;
            font-size: 8px;
            color: #6c757d;
          }
        </style>
      </head>
      <body>
        ${contentHtml}
        <div class="footer-signatures">
          <div>Prepared By: _________________</div>
          <div>Verified By: _________________</div>
          <div>Date: _________________</div>
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
