import type {
  StaffSalaryRecord,
  DisbursementAccountRecord,
  PayrollBatchSummary,
} from "@/lib/mock/payroll";
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
  chunks.push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

  const offsets: number[] = [0];
  let currentOffset = chunks.join("").length;

  for (let i = 0; i < objects.length; i++) {
    offsets.push(currentOffset);
    const objStr = `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
    chunks.push(objStr);
    currentOffset += encoder.encode(objStr).length;
  }

  const xrefStart = currentOffset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  chunks.push(xref);

  const trailer = `trailer\n<< /Size ${
    objects.length + 1
  } /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  chunks.push(trailer);

  return new Blob(chunks, { type: "application/pdf" });
}

export function exportPayrollPdf(
  salaries: StaffSalaryRecord[],
  monthLabel?: string
): void {
  const effectiveMonth = monthLabel || salaries[0]?.monthYear || "November 2026";
  const rowsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(salaries.length / rowsPerPage));
  const pagesStreams: string[] = [];

  const totalGross = salaries.reduce((s, r) => s + r.grossSalary, 0);
  const totalNet = salaries.reduce((s, r) => s + r.netSalary, 0);
  const totalDeductions = salaries.reduce((s, r) => s + r.totalDeductions, 0);

  for (let page = 0; page < totalPages; page++) {
    const pageSalaries = salaries.slice(
      page * rowsPerPage,
      (page + 1) * rowsPerPage
    );
    const streamParts: string[] = [];

    // Header
    streamParts.push("BT");
    streamParts.push("/F2 14 Tf");
    streamParts.push("40 805 Td");
    streamParts.push(`(${sanitizePdfText("EDUSPHERE SCHOOL SYSTEM - STAFF PAYROLL ROSTER")}) Tj`);
    streamParts.push("ET");

    streamParts.push("BT");
    streamParts.push("/F1 9 Tf");
    streamParts.push("40 790 Td");
    streamParts.push(
      `(${sanitizePdfText(
        `Disbursement Month: ${effectiveMonth} | Total Staff: ${salaries.length} | Generated: ${new Date().toLocaleDateString("en-PK")}`
      )}) Tj`);
    streamParts.push("ET");

    // KPI Summary
    streamParts.push("0.96 0.96 0.97 rg");
    streamParts.push("40 735 515 45 re");
    streamParts.push("f");
    streamParts.push("0.85 0.85 0.88 RG");
    streamParts.push("40 735 515 45 re");
    streamParts.push("S");

    streamParts.push("BT");
    streamParts.push("/F2 9 Tf");
    streamParts.push("0.1 0.2 0.4 rg");
    streamParts.push("55 762 Td");
    streamParts.push(`(Total Gross: ${sanitizePdfText(formatCurrency(totalGross))}) Tj`);
    streamParts.push("170 0 Td");
    streamParts.push(`(Total Deductions: ${sanitizePdfText(formatCurrency(totalDeductions))}) Tj`);
    streamParts.push("170 0 Td");
    streamParts.push(`(Total Paid: ${sanitizePdfText(formatCurrency(totalNet))}) Tj`);
    streamParts.push("ET");

    // Table Header
    const tableTop = 715;
    streamParts.push("0.9 0.92 0.96 rg");
    streamParts.push(`40 ${tableTop - 16} 515 16 re`);
    streamParts.push("f");

    streamParts.push("BT");
    streamParts.push("/F2 8 Tf");
    streamParts.push("0.05 0.1 0.2 rg");
    streamParts.push(`45 ${tableTop - 11} Td`);
    streamParts.push("(Code) Tj");
    streamParts.push("50 0 Td");
    streamParts.push("(Employee / Designation) Tj");
    streamParts.push("160 0 Td");
    streamParts.push("(Campus) Tj");
    streamParts.push("75 0 Td");
    streamParts.push("(Base Pay) Tj");
    streamParts.push("60 0 Td");
    streamParts.push("(Gross) Tj");
    streamParts.push("55 0 Td");
    streamParts.push("(Net Pay) Tj");
    streamParts.push("55 0 Td");
    streamParts.push("(Status) Tj");
    streamParts.push("ET");

    // Rows
    let y = tableTop - 30;
    for (const r of pageSalaries) {
      streamParts.push("BT");
      streamParts.push("/F1 7.5 Tf");
      streamParts.push("0.15 0.15 0.2 rg");
      streamParts.push(`45 ${y} Td`);
      streamParts.push(`(${sanitizePdfText(r.empCode)}) Tj`);
      streamParts.push("50 0 Td");
      streamParts.push(`(${sanitizePdfText(r.name.slice(0, 26))}) Tj`);
      streamParts.push("160 0 Td");
      streamParts.push(`(${sanitizePdfText(r.campus.slice(0, 14))}) Tj`);
      streamParts.push("75 0 Td");
      streamParts.push(`(${sanitizePdfText(formatCurrency(r.baseSalary))}) Tj`);
      streamParts.push("60 0 Td");
      streamParts.push(`(${sanitizePdfText(formatCurrency(r.grossSalary))}) Tj`);
      streamParts.push("55 0 Td");
      streamParts.push(`(${sanitizePdfText(formatCurrency(r.netSalary))}) Tj`);
      streamParts.push("55 0 Td");
      streamParts.push(`(${sanitizePdfText(r.status === "Disbursed" || r.status === "Paid" ? "Paid" : r.status === "Pending" ? "Unpaid" : r.status)}) Tj`);
      streamParts.push("ET");

      // separator line
      streamParts.push("0.9 0.9 0.92 RG");
      streamParts.push(`40 ${y - 4} 515 0.5 re`);
      streamParts.push("S");

      y -= 19;
    }

    // Footer
    streamParts.push("BT");
    streamParts.push("/F1 8 Tf");
    streamParts.push("0.5 0.5 0.5 rg");
    streamParts.push(`250 35 Td`);
    streamParts.push(`(Page ${page + 1} of ${totalPages}) Tj`);
    streamParts.push("ET");

    pagesStreams.push(streamParts.join("\n"));
  }

  const blob = buildMinimalPdf(pagesStreams);
  triggerBlobDownload(
    blob,
    `Edusphere-Payroll-Roster-${effectiveMonth.replace(/\s+/g, "-")}.pdf`
  );
}

export function printPayrollReport(options: {
  salaries: StaffSalaryRecord[];
  accounts: DisbursementAccountRecord[];
  batches: PayrollBatchSummary[];
  activeTab: string;
}): boolean {
  if (typeof window === "undefined") return false;



  const totalGross = options.salaries.reduce((s, r) => s + r.grossSalary, 0);
  const totalNet = options.salaries.reduce((s, r) => s + r.netSalary, 0);
  const totalDeductions = options.salaries.reduce(
    (s, r) => s + r.totalDeductions,
    0
  );
  const disbursedCount = options.salaries.filter(
    (s) => s.status === "Disbursed"
  ).length;

  const generatedDate = new Date().toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const cycleLabel = options.salaries[0]?.monthYear || "November 2026";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title></title>
  <style>
    @page {
      size: A4 landscape;
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
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #2c3e50;
      background: #ffffff;
      font-size: 9.5px;
      line-height: 1.35;
      padding: 10mm 12mm;
      box-sizing: border-box;
    }
    .sheet { max-width: 100%; margin: 0 auto; }

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
      margin-top: 2px;
    }

    /* KPI Summary Cards */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 8px;
    }
    .kpi-card {
      border: 1px solid #dee2e6;
      background: #f8f9fa;
      border-radius: 4px;
      padding: 6px 10px;
    }
    .kpi-label {
      font-size: 8px;
      font-weight: 600;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .kpi-val {
      font-size: 12px;
      font-weight: 700;
      color: #2c3e50;
      margin-top: 2px;
      font-family: "Courier New", Courier, monospace;
    }

    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
      margin-bottom: 10px;
      border: 1px solid #dee2e6;
    }
    th {
      background-color: #f1f3f5;
      color: #2c3e50;
      font-weight: 700;
      text-align: left;
      padding: 4px 6px;
      border: 1px solid #dee2e6;
      font-size: 8.5px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    th.text-center, td.text-center { text-align: center; }
    th.text-right, td.text-right { text-align: right; }
    td {
      padding: 3.5px 6px;
      border: 1px solid #dee2e6;
      vertical-align: middle;
      color: #2c3e50;
    }
    tr:nth-child(even) td { background-color: #fafbfc; }
    .mono { font-family: "Courier New", Courier, monospace; }
    .badge {
      display: inline-block;
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 8px;
      font-weight: 600;
      border: 1px solid #ced4da;
    }
    .badge-disbursed { background: #e8f5e9; color: #2e7d32; border-color: #c8e6c9; }
    .badge-pending { background: #fff8e1; color: #f57f17; border-color: #ffe082; }
    .badge-approved { background: #e3f2fd; color: #1565c0; border-color: #bbdefb; }
    .badge-hold { background: #ffebee; color: #c62828; border-color: #ffcdd2; }

    /* Signatures */
    .footer-signatures {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 30px;
      margin-top: 14px;
      page-break-inside: avoid;
    }
    .sig-item {
      text-align: center;
      border-top: 1px solid #7f8c8d;
      padding-top: 3px;
      font-size: 8px;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    /* Document Footer */
    .doc-footer {
      border-top: 1px solid #dee2e6;
      margin-top: 8px;
      padding-top: 3px;
      display: flex;
      justify-content: space-between;
      font-size: 7.5px;
      color: #95a5a6;
      page-break-inside: avoid;
    }

    @media print {
      @page {
        size: A4 landscape;
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
      th, tfoot td, tfoot th, .kpi-card, .badge {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <header class="header">
      <div class="school-name">EDUSPHERE INTERNATIONAL SYSTEM</div>
      <div class="doc-title">Staff Salary &amp; Disbursement Register</div>
      <div class="doc-meta">
        Disbursement Cycle: <strong>${cycleLabel}</strong> &bull; Generated: ${generatedDate} &bull; Total Staff Enrolled: <strong>${options.salaries.length}</strong>
      </div>
    </header>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Total Gross Payroll</div>
        <div class="kpi-val">${formatCurrency(totalGross)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Net Disbursable Amount</div>
        <div class="kpi-val" style="color: #2e7d32;">${formatCurrency(totalNet)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Statutory Withholdings (Tax &amp; PF)</div>
        <div class="kpi-val" style="color: #b71c1c;">${formatCurrency(totalDeductions)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Disbursement Progress</div>
        <div class="kpi-val">${disbursedCount} / ${options.salaries.length} Staff Cleared</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th class="text-center" style="width: 70px;">Emp Code</th>
          <th>Staff Name &amp; Designation</th>
          <th>Campus / Dept</th>
          <th class="text-right">Base Salary</th>
          <th class="text-right">Allowances</th>
          <th class="text-right">Deductions</th>
          <th class="text-right">Net Payable</th>
          <th>Disbursement Bank &amp; Account</th>
          <th class="text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        ${options.salaries
          .map(
            (s) => `
          <tr>
            <td class="text-center mono"><strong>${s.empCode}</strong></td>
            <td>
              <strong>${s.name}</strong>
              <div style="font-size: 8px; color: #6c757d;">${s.designation} (${s.type})</div>
            </td>
            <td>
              <div>${s.campus}</div>
              <div style="font-size: 8px; color: #6c757d;">${s.department}</div>
            </td>
            <td class="text-right mono">${formatCurrency(s.baseSalary)}</td>
            <td class="text-right mono" style="color: #2e7d32;">+${formatCurrency(
              s.medicalAllowance +
                s.conveyanceAllowance +
                s.houseRentAllowance +
                s.specialAllowance
            )}</td>
            <td class="text-right mono" style="color: #b71c1c;">-${formatCurrency(
              s.totalDeductions
            )}</td>
            <td class="text-right mono" style="font-weight: 700; color: #2c3e50;">${formatCurrency(
              s.netSalary
            )}</td>
            <td>
              <div><strong>${s.bankName}</strong></div>
              <div class="mono" style="font-size: 8px; color: #6c757d;">${s.accountNumber} &bull; ${s.paymentMode}</div>
            </td>
            <td class="text-center">
              <span class="badge ${
                s.status === "Paid" || s.status === "Disbursed"
                  ? "badge-disbursed"
                  : s.status === "Approved"
                  ? "badge-approved"
                  : s.status === "On Hold"
                  ? "badge-hold"
                  : "badge-pending"
              }">
                ${s.status === "Paid" || s.status === "Disbursed" ? "Paid" : s.status === "Pending" ? "Unpaid" : s.status}
              </span>
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <div class="footer-signatures">
      <div class="sig-item">Prepared By (Payroll Officer)</div>
      <div class="sig-item">Verified &amp; Audited (Internal Audit)</div>
      <div class="sig-item">Approved By (Director Finance / CFO)</div>
    </div>

    <footer class="doc-footer">
      <span>Official School Document — EduSphere Multi-Campus Management System &bull; Payroll Division</span>
      <span>Computer Generated Official Record &bull; Printed: ${generatedDate}</span>
    </footer>
  </div>
</body>
</html>`;

  return printHtml(html);









}

export function printSinglePayslip(salary: StaffSalaryRecord): boolean {
  if (typeof window === "undefined") return false;

  const generatedDate = new Date().toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const isPaid = salary.status === "Paid" || salary.status === "Disbursed";
  const isOnHold = salary.status === "On Hold";
  const statusLabel = isPaid ? "Paid & Cleared" : isOnHold ? "On Hold" : "Payment Pending (Unpaid)";
  const badgeClass = isPaid ? "badge-paid" : isOnHold ? "badge-hold" : "badge-pending";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
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
      font-size: 9.5px;
      line-height: 1.35;
      padding: 10mm 12mm;
      box-sizing: border-box;
    }
    .sheet {
      max-width: 100%;
      margin: 0 auto;
    }

    /* Clean, Simple, Centered Institutional Header */
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
      margin-top: 2px;
    }
    .badge {
      display: inline-block;
      font-size: 8px;
      font-weight: 600;
      padding: 1px 6px;
      border-radius: 3px;
      border: 1px solid #ced4da;
    }
    .badge-paid {
      background: #e8f5e9;
      color: #2e7d32;
      border-color: #c8e6c9;
    }
    .badge-pending {
      background: #fff8e1;
      color: #f57f17;
      border-color: #ffe082;
    }
    .badge-hold {
      background: #ffebee;
      color: #c62828;
      border-color: #ffcdd2;
    }

    /* Staff & Employment Details Box */
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
      font-size: 9.5px;
      font-weight: 600;
      color: #2c3e50;
    }
    .mono {
      font-family: "Courier New", Courier, monospace;
    }

    /* Side-by-side Tables */
    .tables-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 8px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .section-title {
      font-size: 9px;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 3px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
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

    /* Summary & Settlement Grid */
    .summary-wrap {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
      margin-top: 4px;
      margin-bottom: 8px;
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
      padding-top: 3px;
      font-weight: 700;
      font-size: 9.5px;
      color: #2c3e50;
    }
    .sum-row.net {
      border-top: 1.5px solid #2e7d32;
      margin-top: 3px;
      padding-top: 4px;
      font-weight: 700;
      font-size: 11px;
      color: #2e7d32;
    }
    .sum-row.net .sum-val {
      color: #2e7d32;
      font-size: 11.5px;
    }

    /* Confidentiality Notice */
    .confidential-notice {
      background: #f8f9fa;
      border: 1px dashed #ced4da;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 7.5px;
      color: #6c757d;
      line-height: 1.35;
      margin-bottom: 8px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Signatures */
    .signatures {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 10px;
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

    /* Document Footer */
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
      th, tfoot td, tfoot th, .meta-box, .summary-card, .instructions-box, .badge {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <header class="header">
      <div class="school-name">EDUSPHERE INTERNATIONAL SYSTEM</div>
      <div class="doc-title">Staff Salary Slip &amp; Compensation Statement</div>
      <div class="doc-meta">
        Disbursement Cycle: <strong>${salary.monthYear}</strong> &bull; Generated: ${generatedDate} &bull; Settlement Status: <span class="badge ${badgeClass}">${statusLabel}</span>
      </div>
    </header>

    <section class="meta-box">
      <div class="meta-item"><span class="label">Employee ID:</span><span class="value mono">${salary.empCode}</span></div>
      <div class="meta-item"><span class="label">Staff Name:</span><span class="value">${salary.name}</span></div>
      <div class="meta-item"><span class="label">Designation:</span><span class="value">${salary.designation}</span></div>
      <div class="meta-item"><span class="label">Department:</span><span class="value">${salary.department}</span></div>
      <div class="meta-item"><span class="label">Campus:</span><span class="value">${salary.campus}</span></div>
      <div class="meta-item"><span class="label">CNIC / Identity:</span><span class="value mono">${salary.cnic}</span></div>
      <div class="meta-item"><span class="label">Staff Category:</span><span class="value">${salary.type}</span></div>
      <div class="meta-item"><span class="label">Payment Mode:</span><span class="value">${salary.paymentMode}</span></div>
      <div class="meta-item"><span class="label">Disbursement Bank:</span><span class="value">${salary.bankName}</span></div>
      <div class="meta-item"><span class="label">Account / IBAN:</span><span class="value mono">${salary.accountNumber}</span></div>
      <div class="meta-item"><span class="label">Transaction Ref:</span><span class="value mono">${salary.transactionRef || "Pending Authorization"}</span></div>
      <div class="meta-item"><span class="label">Settlement Date:</span><span class="value">${salary.disbursedDate ? formatDate(salary.disbursedDate) : "Awaiting Clearance"}</span></div>
    </section>

    <div class="tables-grid">
      <!-- Earnings -->
      <div>
        <div class="section-title">Earnings &amp; Allowances</div>
        <table>
          <thead>
            <tr>
              <th>Pay Head Description</th>
              <th class="amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Basic Salary</td><td class="amount">${formatCurrency(salary.baseSalary)}</td></tr>
            <tr><td>House Rent Allowance (HRA)</td><td class="amount">${formatCurrency(salary.houseRentAllowance)}</td></tr>
            <tr><td>Medical Allowance</td><td class="amount">${formatCurrency(salary.medicalAllowance)}</td></tr>
            <tr><td>Conveyance Allowance</td><td class="amount">${formatCurrency(salary.conveyanceAllowance)}</td></tr>
            <tr><td>Special / Executive Allowance</td><td class="amount">${formatCurrency(salary.specialAllowance)}</td></tr>
          </tbody>
          <tfoot>
            <tr>
              <th>Total Gross Earnings</th>
              <th class="amount" style="color: #2e7d32;">${formatCurrency(salary.grossSalary)}</th>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Deductions -->
      <div>
        <div class="section-title">Deductions &amp; Statutory Withholdings</div>
        <table>
          <thead>
            <tr>
              <th>Deduction Head</th>
              <th class="amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Income Tax Withholding</td><td class="amount">${formatCurrency(salary.taxDeduction)}</td></tr>
            <tr><td>Provident Fund (Employee 8.33%)</td><td class="amount">${formatCurrency(salary.providentFund)}</td></tr>
            <tr><td>EOBI Statutory Contribution</td><td class="amount">${formatCurrency(salary.eobi)}</td></tr>
            <tr><td>Unpaid Leaves / Absent Days</td><td class="amount">${formatCurrency(salary.unpaidLeaveDeduction)}</td></tr>
            <tr><td>Salary Advance / Loan Recovery</td><td class="amount">${formatCurrency(salary.loanDeduction)}</td></tr>
          </tbody>
          <tfoot>
            <tr>
              <th>Total Deductions</th>
              <th class="amount" style="color: #b71c1c;">-${formatCurrency(salary.totalDeductions)}</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <div class="summary-wrap">
      <div class="instructions-box">
        <strong>Disbursement &amp; Banking Details</strong>
        • Payment Channel: <strong>${salary.paymentMode}</strong> via <strong>${salary.bankName}</strong>.<br>
        • Designated Account / IBAN: <span class="mono">${salary.accountNumber}</span>.<br>
        • Settlement Status: <strong>${statusLabel}</strong>${salary.transactionRef ? ` (Ref: <span class="mono">${salary.transactionRef}</span>)` : ""}.<br>
        • Retain this official computer-generated statement for statutory tax reporting and employee record.
      </div>

      <div class="summary-card">
        <div class="title">Net Compensation Summary</div>
        <div class="sum-row">
          <span>Total Gross Earnings:</span>
          <span class="sum-val">${formatCurrency(salary.grossSalary)}</span>
        </div>
        <div class="sum-row">
          <span>Total Statutory Deductions:</span>
          <span class="sum-val" style="color: #b71c1c;">-${formatCurrency(salary.totalDeductions)}</span>
        </div>
        <div class="sum-row total">
          <span>Net Monthly Payout:</span>
          <span class="sum-val">${formatCurrency(salary.netSalary)}</span>
        </div>
        <div class="sum-row net">
          <span>Net Take-Home Salary:</span>
          <span class="sum-val">${formatCurrency(salary.netSalary)}</span>
        </div>
      </div>
    </div>

    <div class="confidential-notice">
      <strong>Confidentiality Notice:</strong> This salary slip contains confidential compensation details issued exclusively for the named employee by EduSphere Multi-Campus Management System. For inquiries regarding tax brackets or statutory deductions, please contact the Central Payroll &amp; Accounts Division.
    </div>

    <section class="signatures">
      <div class="sign-item">Prepared by (Payroll Officer)</div>
      <div class="sign-item">Verified &amp; Audited (Director HR / Finance)</div>
      <div class="sign-item">Staff Member Acknowledgment</div>
    </section>

    <footer class="doc-footer">
      <span>Official School Document — EduSphere Multi-Campus Management System &bull; Ref: SLIP-${salary.empCode}-${salary.monthYear.replace(/[^a-zA-Z0-9]/g, "")}</span>
      <span>Computer Generated Official Record &bull; Printed: ${generatedDate}</span>
    </footer>
  </div>
</body>
</html>`;

  return printHtml(html);
}
