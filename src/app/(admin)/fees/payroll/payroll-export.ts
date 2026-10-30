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
  monthLabel: string = "October 2026"
): void {
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
        `Disbursement Month: ${monthLabel} | Total Staff: ${salaries.length} | Generated: ${new Date().toLocaleDateString("en-PK")}`
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
    streamParts.push(`(Net Disbursed: ${sanitizePdfText(formatCurrency(totalNet))}) Tj`);
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
      streamParts.push(`(${sanitizePdfText(r.status)}) Tj`);
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
    `Edusphere-Payroll-Roster-${monthLabel.replace(/\s+/g, "-")}.pdf`
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

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Payroll & Salary Accounts Statement - Edusphere School System</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 16px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      border-bottom: 2px solid #091d3e;
      padding-bottom: 12px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .org-title {
      font-size: 18px;
      font-weight: 800;
      color: #091d3e;
      letter-spacing: -0.01em;
      margin: 0;
    }
    .doc-title {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      margin: 2px 0 0 0;
    }
    .doc-meta {
      font-size: 10px;
      color: #64748b;
      text-align: right;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }
    .kpi-card {
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      border-radius: 4px;
      padding: 8px 12px;
    }
    .kpi-label {
      font-size: 9px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .kpi-val {
      font-size: 15px;
      font-weight: 800;
      color: #091d3e;
      margin-top: 2px;
      font-family: monospace;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-bottom: 16px;
    }
    th {
      background-color: #091d3e;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #091d3e;
    }
    th.text-center, td.text-center { text-align: center; }
    th.text-right, td.text-right { text-align: right; }
    td {
      padding: 6px 8px;
      border: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    tr:nth-child(even) td { background-color: #f8fafc; }
    .mono { font-family: monospace; }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 8.5px;
      font-weight: 700;
    }
    .badge-disbursed { background: #dcfce7; color: #166534; }
    .badge-pending { background: #fef9c3; color: #854d0e; }
    .badge-approved { background: #e0f2fe; color: #075985; }
    .badge-hold { background: #fee2e2; color: #991b1b; }
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      font-size: 9.5px;
      color: #64748b;
    }
    .sig-line {
      border-top: 1px dashed #94a3b8;
      width: 160px;
      text-align: center;
      padding-top: 4px;
      margin-top: 32px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="org-title">EDUSPHERE SCHOOL SYSTEM</h1>
      <p class="doc-title">Central Finance Division &bull; Staff Salary & Disbursement Register</p>
    </div>
    <div class="doc-meta">
      <div>Active Cycle: <strong>October 2026</strong></div>
      <div>Printed: ${new Date().toLocaleString("en-PK")}</div>
      <div>Status: <strong>Audited Payroll</strong></div>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Total Monthly Payroll</div>
      <div class="kpi-val">${formatCurrency(totalGross)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Disbursed Amount</div>
      <div class="kpi-val" style="color: #166534;">${formatCurrency(totalNet)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Statutory Deductions (Tax & PF)</div>
      <div class="kpi-val" style="color: #b91c1c;">${formatCurrency(totalDeductions)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Disbursal Progress</div>
      <div class="kpi-val">${disbursedCount} / ${options.salaries.length} Staff</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="text-center" style="width: 75px;">Emp Code</th>
        <th>Staff Name & Designation</th>
        <th>Campus / Dept</th>
        <th class="text-right">Base Salary</th>
        <th class="text-right">Allowances</th>
        <th class="text-right">Deductions</th>
        <th class="text-right">Net Payable</th>
        <th>Disbursement Bank & Account</th>
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
            <div style="font-size: 8.5px; color: #64748b;">${s.designation} (${s.type})</div>
          </td>
          <td>
            <div>${s.campus}</div>
            <div style="font-size: 8.5px; color: #64748b;">${s.department}</div>
          </td>
          <td class="text-right mono">${formatCurrency(s.baseSalary)}</td>
          <td class="text-right mono" style="color: #15803d;">+${formatCurrency(
            s.medicalAllowance +
              s.conveyanceAllowance +
              s.houseRentAllowance +
              s.specialAllowance
          )}</td>
          <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(
            s.totalDeductions
          )}</td>
          <td class="text-right mono" style="font-weight: 700; color: #091d3e;">${formatCurrency(
            s.netSalary
          )}</td>
          <td>
            <div><strong>${s.bankName}</strong></div>
            <div class="mono" style="font-size: 8.5px; color: #475569;">${s.accountNumber} &bull; ${s.paymentMode}</div>
          </td>
          <td class="text-center">
            <span class="badge ${
              s.status === "Disbursed"
                ? "badge-disbursed"
                : s.status === "Approved"
                ? "badge-approved"
                : s.status === "On Hold"
                ? "badge-hold"
                : "badge-pending"
            }">
              ${s.status}
            </span>
          </td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="footer">
    <div>
      <div class="sig-line">Prepared By (Payroll Officer)</div>
    </div>
    <div>
      <div class="sig-line">Audited By (Internal Audit)</div>
    </div>
    <div>
      <div class="sig-line">Approved By (Director Finance)</div>
    </div>
  </div>
</body>
</html>`;

  return printHtml(html);









}

export function printSinglePayslip(salary: StaffSalaryRecord): boolean {
  if (typeof window === "undefined") return false;



  const totalAllowances =
    salary.medicalAllowance +
    salary.conveyanceAllowance +
    salary.houseRentAllowance +
    salary.specialAllowance;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Pay Slip - ${salary.empCode} - ${salary.name}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 16px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .slip-box {
      border: 2px solid #091d3e;
      border-radius: 6px;
      padding: 24px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #091d3e;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .org-title {
      font-size: 20px;
      font-weight: 800;
      color: #091d3e;
      margin: 0;
    }
    .doc-sub {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      margin: 2px 0 0 0;
    }
    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #334155;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 18px;
      font-size: 11px;
    }
    .info-item { display: flex; justify-content: space-between; }
    .info-label { color: #64748b; font-weight: 600; }
    .info-value { font-weight: 700; color: #091d3e; }
    .columns-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 18px;
    }
    .section-title {
      background: #091d3e;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      padding: 6px 10px;
      border-radius: 3px 3px 0 0;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .table-details {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      border: 1px solid #cbd5e1;
    }
    .table-details td {
      padding: 6px 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    .table-details tr:last-child td {
      font-weight: 800;
      background: #f1f5f9;
      border-top: 1px solid #cbd5e1;
    }
    .mono { font-family: monospace; }
    .text-right { text-align: right; }
    .net-box {
      background: #f0fdf4;
      border: 2px solid #86efac;
      border-radius: 4px;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .net-label { font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase; }
    .net-val { font-size: 22px; font-weight: 900; color: #14532d; font-family: monospace; }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 48px;
      padding-top: 12px;
    }
    .sig {
      border-top: 1px solid #475569;
      width: 170px;
      text-align: center;
      font-size: 10px;
      color: #475569;
      padding-top: 4px;
    }
  </style>
</head>
<body>
  <div class="slip-box">
    <div class="header">
      <div>
        <h1 class="org-title">EDUSPHERE SCHOOL SYSTEM</h1>
        <p class="doc-sub">Confidential Monthly Salary Slip</p>
      </div>
      <div class="meta-box">
        <div>Pay Period: <strong>${salary.monthYear}</strong></div>
        <div>Campus: <strong>${salary.campus}</strong></div>
        <div>Status: <strong>${salary.status}</strong></div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Employee Code:</span>
        <span class="info-value mono">${salary.empCode}</span>
      </div>
      <div class="info-item">
        <span class="info-label">CNIC:</span>
        <span class="info-value mono">${salary.cnic}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Employee Name:</span>
        <span class="info-value">${salary.name}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Department:</span>
        <span class="info-value">${salary.department}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Designation:</span>
        <span class="info-value">${salary.designation}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Disbursement Bank:</span>
        <span class="info-value">${salary.bankName}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Staff Category:</span>
        <span class="info-value">${salary.type}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Account / IBAN:</span>
        <span class="info-value mono">${salary.accountNumber}</span>
      </div>
    </div>

    <div class="columns-grid">
      <div>
        <div class="section-title">Earnings & Allowances</div>
        <table class="table-details">
          <tr><td>Basic Salary</td><td class="text-right mono">${formatCurrency(salary.baseSalary)}</td></tr>
          <tr><td>House Rent Allowance (HRA)</td><td class="text-right mono">${formatCurrency(salary.houseRentAllowance)}</td></tr>
          <tr><td>Medical Allowance</td><td class="text-right mono">${formatCurrency(salary.medicalAllowance)}</td></tr>
          <tr><td>Conveyance Allowance</td><td class="text-right mono">${formatCurrency(salary.conveyanceAllowance)}</td></tr>
          <tr><td>Special / Executive Allowance</td><td class="text-right mono">${formatCurrency(salary.specialAllowance)}</td></tr>
          <tr><td><strong>Total Gross Earnings</strong></td><td class="text-right mono font-bold">${formatCurrency(salary.grossSalary)}</td></tr>
        </table>
      </div>

      <div>
        <div class="section-title">Deductions</div>
        <table class="table-details">
          <tr><td>Income Tax Withholding</td><td class="text-right mono">${formatCurrency(salary.taxDeduction)}</td></tr>
          <tr><td>Provident Fund (Employee 8.33%)</td><td class="text-right mono">${formatCurrency(salary.providentFund)}</td></tr>
          <tr><td>EOBI Statutory Contribution</td><td class="text-right mono">${formatCurrency(salary.eobi)}</td></tr>
          <tr><td>Unpaid Leaves / Absent Days</td><td class="text-right mono">${formatCurrency(salary.unpaidLeaveDeduction)}</td></tr>
          <tr><td>Salary Advance / Loan Recovery</td><td class="text-right mono">${formatCurrency(salary.loanDeduction)}</td></tr>
          <tr><td><strong>Total Deductions</strong></td><td class="text-right mono font-bold" style="color: #b91c1c;">${formatCurrency(salary.totalDeductions)}</td></tr>
        </table>
      </div>
    </div>

    <div class="net-box">
      <div>
        <div class="net-label">Net Payable Take-Home Salary</div>
        <div style="font-size: 10px; color: #15803d; margin-top: 2px;">Disbursed via ${salary.paymentMode} (${salary.bankName})</div>
      </div>
      <div class="net-val">${formatCurrency(salary.netSalary)}</div>
    </div>

    <div class="signatures">
      <div class="sig">Accounts Officer</div>
      <div class="sig">Manager HR & Payroll</div>
      <div class="sig">Employee Signature</div>
    </div>
  </div>
</body>
</html>`;

  return printHtml(html);









}
