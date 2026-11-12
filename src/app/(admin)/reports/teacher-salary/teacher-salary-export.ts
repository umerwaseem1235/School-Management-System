import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type {
  YearlyTeacherSalarySummary,
  MonthlyTeacherSalary,
} from "@/lib/mock/teacher-salary";
import { formatCurrency, formatPercent } from "@/lib/format";
import { printHtml } from "@/lib/print-html";

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

// ─────────────────────────────────────────────────────────────────────────────
// 1. PRINT INDIVIDUAL TEACHER ANNUAL SALARY STATEMENT (A4 PORTRAIT)
// ─────────────────────────────────────────────────────────────────────────────

export function printIndividualTeacherAnnualStatement(
  summary: YearlyTeacherSalarySummary,
  periodLabel: string = "Calendar Year 2026"
): boolean {
  if (typeof window === "undefined") return false;

  const t = summary.teacher;
  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const rowsHtml = summary.monthlyRecords
    .map(
      (m, idx) => `
      <tr class="${idx % 2 === 0 ? "even" : ""}">
        <td class="font-bold">${m.monthShort} ${summary.year}</td>
        <td class="mono" style="font-size: 8.5px;">${m.voucherNo}</td>
        <td class="text-right mono">${formatCurrency(m.baseSalary)}</td>
        <td class="text-right mono">${formatCurrency(m.houseRentAllowance)}</td>
        <td class="text-right mono">${formatCurrency(m.medicalAllowance)}</td>
        <td class="text-right mono">${formatCurrency(m.conveyanceAllowance)}</td>
        <td class="text-right mono">${formatCurrency(m.specialAllowance)}</td>
        <td class="text-right mono font-bold" style="color: #1e293b;">${formatCurrency(m.grossSalary)}</td>
        <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(m.taxDeduction)}</td>
        <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(m.providentFund)}</td>
        <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(m.eobi)}</td>
        <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(m.totalDeductions)}</td>
        <td class="text-right mono font-bold" style="color: #15803d; font-size: 9.5px;">${formatCurrency(m.netSalary)}</td>
        <td class="text-center"><span class="badge ${m.status === "Disbursed" ? "badge-paid" : m.status === "Pending" ? "badge-unpaid" : "badge-partial"}">${m.status}</span></td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Annual Teacher Salary Statement - ${t.name}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm;
    }
    @media print {
      body { margin: 0; padding: 0; }
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 9px;
      line-height: 1.35;
      margin: 0;
      padding: 10px 14px;
    }
    .header {
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 10px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header-logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-mark {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #1e3a8a, #3b82f6);
      color: #ffffff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 18px;
      letter-spacing: -0.5px;
    }
    .school-info h1 {
      margin: 0;
      font-size: 16px;
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: 0.2px;
      text-transform: uppercase;
    }
    .school-info p {
      margin: 1px 0 0;
      font-size: 9px;
      color: #64748b;
    }
    .doc-meta {
      text-align: right;
    }
    .doc-badge {
      display: inline-block;
      background: #1e3a8a;
      color: #ffffff;
      font-weight: 700;
      font-size: 10px;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }
    .doc-meta p {
      margin: 3px 0 0;
      font-size: 8.5px;
      color: #64748b;
    }

    .bio-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 12px;
    }
    .bio-item label {
      display: block;
      font-size: 7.5px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.3px;
      margin-bottom: 1px;
    }
    .bio-item span {
      display: block;
      font-size: 9.5px;
      font-weight: 600;
      color: #0f172a;
    }

    .summary-metrics {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .metric-card {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 8px;
      background: #ffffff;
      text-align: center;
    }
    .metric-card.highlight {
      background: #eff6ff;
      border-color: #bfdbfe;
    }
    .metric-card.success {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }
    .metric-card label {
      display: block;
      font-size: 7.5px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }
    .metric-card .val {
      font-size: 11px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }
    .metric-card.success .val { color: #15803d; }
    .metric-card.highlight .val { color: #1e3a8a; }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8px;
      margin-bottom: 12px;
    }
    th {
      background: #1e3a8a;
      color: #ffffff;
      text-align: left;
      padding: 5px 4px;
      font-size: 7.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }
    td {
      padding: 4px 4px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    tr.even {
      background: #f8fafc;
    }
    .total-row td {
      background: #f1f5f9;
      border-top: 2px solid #1e3a8a;
      border-bottom: 2px solid #1e3a8a;
      font-weight: 800;
      color: #0f172a;
      padding: 6px 4px;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .font-bold { font-weight: 700; }

    .badge {
      display: inline-block;
      padding: 1px 5px;
      border-radius: 9999px;
      font-size: 7px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-paid { background: #dcfce7; color: #166534; }
    .badge-partial { background: #fef3c7; color: #92400e; }
    .badge-unpaid { background: #fee2e2; color: #991b1b; }

    .declaration-box {
      border: 1px dashed #94a3b8;
      border-radius: 6px;
      background: #fafaf9;
      padding: 8px 10px;
      font-size: 8px;
      color: #475569;
      line-height: 1.4;
      margin-bottom: 14px;
    }
    .declaration-box strong { color: #0f172a; }

    .signatures-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 120px;
      gap: 12px;
      align-items: flex-end;
      padding-top: 6px;
    }
    .sig-col {
      text-align: center;
    }
    .sig-line {
      border-bottom: 1px solid #0f172a;
      margin-bottom: 4px;
      height: 32px;
    }
    .sig-name {
      font-size: 8.5px;
      font-weight: 700;
      color: #0f172a;
    }
    .sig-title {
      font-size: 7.5px;
      color: #64748b;
    }
    .seal-box {
      border: 1.5px dashed #94a3b8;
      border-radius: 6px;
      height: 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 4px;
    }
    .seal-box span {
      font-size: 7px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .footer-bar {
      margin-top: 14px;
      padding-top: 6px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 7.5px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-logo">
      <div class="logo-mark">ED</div>
      <div class="school-info">
        <h1>Edusphere Academy of Excellence</h1>
        <p>Central Directorate of Academics &amp; Faculty Affairs &middot; Reg: PK-EDU-8819</p>
        <p>Campus: ${t.campus} &middot; Tax Withholding Agent NTN: 4192083-7</p>
      </div>
    </div>
    <div class="doc-meta">
      <span class="doc-badge">Annual Teacher Remuneration Certificate</span>
      <p>Period: <strong>${periodLabel}</strong></p>
      <p>Issued: ${generatedDate} &middot; Ref: <strong>${summary.taxCertificateRef}</strong></p>
    </div>
  </div>

  <div class="bio-grid">
    <div class="bio-item">
      <label>Teacher Name</label>
      <span>${t.name}</span>
    </div>
    <div class="bio-item">
      <label>Employee Code</label>
      <span class="mono">${t.empCode}</span>
    </div>
    <div class="bio-item">
      <label>Department / Wing</label>
      <span>${t.department}</span>
    </div>
    <div class="bio-item">
      <label>Designation &amp; Grade</label>
      <span>${t.designation} (${t.gradeTier.split(" ")[0]})</span>
    </div>
    <div class="bio-item">
      <label>National Tax # (NTN)</label>
      <span class="mono">${t.ntn}</span>
    </div>
    <div class="bio-item">
      <label>CNIC Number</label>
      <span class="mono">${t.cnic}</span>
    </div>
    <div class="bio-item">
      <label>Disbursement Bank</label>
      <span>${t.bankName}</span>
    </div>
    <div class="bio-item">
      <label>Account / IBAN</label>
      <span class="mono" style="font-size: 8px;">${t.iban}</span>
    </div>
  </div>

  <div class="summary-metrics">
    <div class="metric-card highlight">
      <label>Annual Gross Pay</label>
      <div class="val mono">${formatCurrency(summary.annualGrossSalary)}</div>
    </div>
    <div class="metric-card">
      <label>Annual Basic</label>
      <div class="val mono">${formatCurrency(summary.annualBaseSalary)}</div>
    </div>
    <div class="metric-card">
      <label>Tax Withheld (WHT)</label>
      <div class="val mono" style="color: #b91c1c;">-${formatCurrency(summary.annualTaxDeducted)}</div>
    </div>
    <div class="metric-card">
      <label>PF &amp; Statutory Ded.</label>
      <div class="val mono" style="color: #b91c1c;">-${formatCurrency(summary.annualProvidentFund + summary.annualEobi)}</div>
    </div>
    <div class="metric-card success">
      <label>Net Disbursed (Annual)</label>
      <div class="val mono">${formatCurrency(summary.annualNetDisbursed)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 8%;">Month</th>
        <th style="width: 10%;">Voucher #</th>
        <th class="text-right" style="width: 7.5%;">Basic</th>
        <th class="text-right" style="width: 7%;">HRA (30%)</th>
        <th class="text-right" style="width: 6.5%;">Medical</th>
        <th class="text-right" style="width: 6.5%;">Conv.</th>
        <th class="text-right" style="width: 6.5%;">Special</th>
        <th class="text-right" style="width: 8.5%;">Gross Pay</th>
        <th class="text-right" style="width: 7%;">Inc. Tax</th>
        <th class="text-right" style="width: 7%;">PF (8.3%)</th>
        <th class="text-right" style="width: 5%;">EOBI</th>
        <th class="text-right" style="width: 7.5%;">Total Ded.</th>
        <th class="text-right" style="width: 9%;">Net Disbursed</th>
        <th class="text-center" style="width: 6%;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
      <tr class="total-row">
        <td colspan="2">ANNUAL TOTALS (12M)</td>
        <td class="text-right mono">${formatCurrency(summary.annualBaseSalary)}</td>
        <td class="text-right mono">${formatCurrency(summary.annualHra)}</td>
        <td class="text-right mono">${formatCurrency(summary.annualMedical)}</td>
        <td class="text-right mono">${formatCurrency(summary.annualConveyance)}</td>
        <td class="text-right mono">${formatCurrency(summary.annualSpecial)}</td>
        <td class="text-right mono" style="color: #1e3a8a;">${formatCurrency(summary.annualGrossSalary)}</td>
        <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(summary.annualTaxDeducted)}</td>
        <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(summary.annualProvidentFund)}</td>
        <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(summary.annualEobi)}</td>
        <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(summary.annualTotalDeductions)}</td>
        <td class="text-right mono" style="color: #15803d; font-size: 10px;">${formatCurrency(summary.annualNetDisbursed)}</td>
        <td class="text-center"><span class="badge badge-paid">${summary.monthsPaidCount}/12</span></td>
      </tr>
    </tbody>
  </table>

  <div class="declaration-box">
    <strong>STATUTORY DECLARATION &amp; CERTIFICATION:</strong> This is to certify that <strong>${t.name}</strong>, holding designation <strong>${t.designation}</strong>, has been in active faculty service during the period <strong>${periodLabel}</strong>. The compensation and statutory deductions specified above reflect complete audited disbursements transferred through recognized Pakistani banking channels. In accordance with Section 149 of the Income Tax Ordinance 2001, required withholding taxes have been deposited in the Federal Treasury.
  </div>

  <div class="signatures-grid">
    <div class="sig-col">
      <div class="sig-line"></div>
      <div class="sig-name">Senior Payroll Officer</div>
      <div class="sig-title">Finance &amp; Accounts Division</div>
    </div>
    <div class="sig-col">
      <div class="sig-line"></div>
      <div class="sig-name">Head of Human Capital</div>
      <div class="sig-title">Faculty Recruitment &amp; Records</div>
    </div>
    <div class="sig-col">
      <div class="sig-line"></div>
      <div class="sig-name">Chief Financial Officer</div>
      <div class="sig-title">Campus Principal / Director</div>
    </div>
    <div class="seal-box">
      <span>OFFICIAL INSTITUTIONAL SEAL</span>
    </div>
  </div>

  <div class="footer-bar">
    <span>Edusphere SMS &middot; Generated by Authorized Officer &middot; Verification: ${summary.taxCertificateRef}</span>
    <span>Page 1 of 1 &middot; Confidential Document &middot; Valid for Tax &amp; Official Submission</span>
  </div>
</body>
</html>`;

  return printHtml(html);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PRINT CONSOLIDATED FACULTY ANNUAL ROSTER (A4 LANDSCAPE)
// ─────────────────────────────────────────────────────────────────────────────

export function printConsolidatedFacultyAnnualReport(
  summaries: YearlyTeacherSalarySummary[],
  periodLabel: string = "Calendar Year 2026",
  campusFilter: string = "All Campuses"
): boolean {
  if (typeof window === "undefined") return false;

  const totalTeachers = summaries.length;
  const grandGross = summaries.reduce((s, r) => s + r.annualGrossSalary, 0);
  const grandTax = summaries.reduce((s, r) => s + r.annualTaxDeducted, 0);
  const grandPf = summaries.reduce((s, r) => s + r.annualProvidentFund + r.annualEobi, 0);
  const grandDed = summaries.reduce((s, r) => s + r.annualTotalDeductions, 0);
  const grandNet = summaries.reduce((s, r) => s + r.annualNetDisbursed, 0);

  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const rowsHtml = summaries
    .map(
      (s, idx) => `
      <tr class="${idx % 2 === 0 ? "even" : ""}">
        <td class="text-center mono">${idx + 1}</td>
        <td class="mono font-bold">${s.teacher.empCode}</td>
        <td class="font-bold">${s.teacher.name}</td>
        <td>${s.teacher.department}</td>
        <td>${s.teacher.campus.replace(" Campus", "")}</td>
        <td style="font-size: 7.5px;">${s.teacher.designation}</td>
        <td class="text-right mono">${formatCurrency(s.annualBaseSalary)}</td>
        <td class="text-right mono">${formatCurrency(s.annualHra + s.annualMedical + s.annualConveyance + s.annualSpecial)}</td>
        <td class="text-right mono font-bold">${formatCurrency(s.annualGrossSalary)}</td>
        <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(s.annualTaxDeducted)}</td>
        <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(s.annualProvidentFund + s.annualEobi)}</td>
        <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(s.annualTotalDeductions)}</td>
        <td class="text-right mono font-bold" style="color: #15803d;">${formatCurrency(s.annualNetDisbursed)}</td>
        <td class="text-center"><span class="badge ${s.overallStatus === "Fully Disbursed" ? "badge-paid" : "badge-partial"}">${s.monthsPaidCount}/12</span></td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Faculty Annual Salary Consolidated Roster - ${periodLabel}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 8mm 10mm;
    }
    @media print {
      body { margin: 0; padding: 0; }
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 8px;
      line-height: 1.3;
      margin: 0;
      padding: 8px 12px;
    }
    .header {
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 8px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .school-title {
      font-size: 15px;
      font-weight: 800;
      color: #1e3a8a;
      text-transform: uppercase;
      margin: 0;
    }
    .school-sub {
      font-size: 8.5px;
      color: #64748b;
      margin: 1px 0 0;
    }
    .meta-box {
      text-align: right;
    }
    .meta-title {
      font-size: 10px;
      font-weight: 700;
      background: #1e3a8a;
      color: #ffffff;
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
    }

    .kpi-row {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
      margin-bottom: 10px;
    }
    .kpi-card {
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      background: #f8fafc;
      padding: 5px 8px;
      text-align: center;
    }
    .kpi-card label {
      display: block;
      font-size: 7px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
    }
    .kpi-card .val {
      font-size: 11px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.5px;
      margin-bottom: 10px;
    }
    th {
      background: #1e3a8a;
      color: #ffffff;
      padding: 4px;
      font-size: 7px;
      text-transform: uppercase;
      font-weight: 700;
      text-align: left;
    }
    td {
      padding: 3.5px 4px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    tr.even { background: #f8fafc; }
    .total-row td {
      background: #f1f5f9;
      border-top: 2px solid #1e3a8a;
      border-bottom: 2px solid #1e3a8a;
      font-weight: 800;
      color: #0f172a;
      padding: 5px 4px;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .font-bold { font-weight: 700; }

    .badge {
      display: inline-block;
      padding: 1px 4px;
      border-radius: 9999px;
      font-size: 6.5px;
      font-weight: 700;
    }
    .badge-paid { background: #dcfce7; color: #166534; }
    .badge-partial { background: #fef3c7; color: #92400e; }

    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      padding-top: 8px;
    }
    .sig-box {
      width: 180px;
      text-align: center;
    }
    .sig-border {
      border-bottom: 1px solid #0f172a;
      margin-bottom: 4px;
      height: 24px;
    }
    .sig-label {
      font-size: 7.5px;
      font-weight: 700;
      color: #0f172a;
    }
    .sig-sub {
      font-size: 6.5px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="school-title">Edusphere Academy of Excellence</h1>
      <p class="school-sub">Consolidated Faculty Yearly Salary &amp; Statutory Deductions Audit Roster &middot; Campus: ${campusFilter}</p>
    </div>
    <div class="meta-box">
      <span class="meta-title">${periodLabel}</span>
      <p style="font-size: 7.5px; color: #64748b; margin: 3px 0 0;">Generated: ${generatedDate} &middot; Total Faculty: <strong>${totalTeachers}</strong></p>
    </div>
  </div>

  <div class="kpi-row">
    <div class="kpi-card">
      <label>Teaching Staff</label>
      <div class="val">${totalTeachers} Members</div>
    </div>
    <div class="kpi-card">
      <label>Total Annual Gross</label>
      <div class="val mono" style="color: #1e3a8a;">${formatCurrency(grandGross)}</div>
    </div>
    <div class="kpi-card">
      <label>Total Tax Withheld (WHT)</label>
      <div class="val mono" style="color: #b91c1c;">-${formatCurrency(grandTax)}</div>
    </div>
    <div class="kpi-card">
      <label>Total PF &amp; EOBI</label>
      <div class="val mono" style="color: #b91c1c;">-${formatCurrency(grandPf)}</div>
    </div>
    <div class="kpi-card">
      <label>Total Deductions</label>
      <div class="val mono" style="color: #b91c1c;">-${formatCurrency(grandDed)}</div>
    </div>
    <div class="kpi-card">
      <label>Total Net Remuneration</label>
      <div class="val mono" style="color: #15803d;">${formatCurrency(grandNet)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="text-center" style="width: 2.5%;">#</th>
        <th style="width: 7%;">Emp Code</th>
        <th style="width: 13%;">Teacher Name</th>
        <th style="width: 10%;">Department</th>
        <th style="width: 11%;">Campus</th>
        <th style="width: 12%;">Designation</th>
        <th class="text-right" style="width: 7.5%;">Annual Base</th>
        <th class="text-right" style="width: 7.5%;">Allowances</th>
        <th class="text-right" style="width: 8.5%;">Annual Gross</th>
        <th class="text-right" style="width: 7%;">WHT Tax</th>
        <th class="text-right" style="width: 6.5%;">PF &amp; EOBI</th>
        <th class="text-right" style="width: 7%;">Total Ded.</th>
        <th class="text-right" style="width: 8.5%;">Net Disbursed</th>
        <th class="text-center" style="width: 4%;">Paid</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
      <tr class="total-row">
        <td colspan="6" class="text-center">CONSOLIDATED FACULTY GRAND TOTALS (${totalTeachers} TEACHERS)</td>
        <td class="text-right mono">${formatCurrency(summaries.reduce((s, r) => s + r.annualBaseSalary, 0))}</td>
        <td class="text-right mono">${formatCurrency(summaries.reduce((s, r) => s + r.annualHra + r.annualMedical + r.annualConveyance + r.annualSpecial, 0))}</td>
        <td class="text-right mono" style="color: #1e3a8a;">${formatCurrency(grandGross)}</td>
        <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(grandTax)}</td>
        <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(grandPf)}</td>
        <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(grandDed)}</td>
        <td class="text-right mono" style="color: #15803d;">${formatCurrency(grandNet)}</td>
        <td class="text-center"><span class="badge badge-paid">100%</span></td>
      </tr>
    </tbody>
  </table>

  <div class="signatures">
    <div class="sig-box">
      <div class="sig-border"></div>
      <div class="sig-label">Prepared By: Payroll Specialist</div>
      <div class="sig-sub">Finance Division</div>
    </div>
    <div class="sig-box">
      <div class="sig-border"></div>
      <div class="sig-label">Audited By: Internal Auditor</div>
      <div class="sig-sub">Compliance &amp; Governance</div>
    </div>
    <div class="sig-box">
      <div class="sig-border"></div>
      <div class="sig-label">Certified By: Head of Human Capital</div>
      <div class="sig-sub">Faculty Management</div>
    </div>
    <div class="sig-box">
      <div class="sig-border"></div>
      <div class="sig-label">Approved By: Chief Financial Officer</div>
      <div class="sig-sub">Board of Trustees</div>
    </div>
  </div>
</body>
</html>`;

  return printHtml(html);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. PRINT OFFICIAL TEACHER ANNUAL TAX WITHHOLDING CERTIFICATE (FBR / FORM 149)
// ─────────────────────────────────────────────────────────────────────────────

export function printTeacherAnnualTaxCertificate(
  summary: YearlyTeacherSalarySummary,
  periodLabel: string = "Tax Year 2026"
): boolean {
  if (typeof window === "undefined") return false;

  const t = summary.teacher;
  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Annual Tax Withholding Certificate - ${t.name}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm 18mm; }
    @media print { body { margin: 0; padding: 0; } }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body {
      font-family: Georgia, "Times New Roman", Times, serif;
      color: #111827;
      background: #ffffff;
      font-size: 10px;
      line-height: 1.5;
      padding: 10px 15px;
    }
    .cert-frame {
      border: 3px double #1e3a8a;
      padding: 24px;
      border-radius: 4px;
    }
    .cert-header {
      text-align: center;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .cert-header h1 {
      font-size: 18px;
      font-weight: 800;
      color: #1e3a8a;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .cert-header h2 {
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      margin: 4px 0 0;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .cert-header p {
      font-size: 9px;
      color: #64748b;
      margin: 2px 0 0;
      font-family: -apple-system, sans-serif;
    }

    .cert-badge {
      display: inline-block;
      border: 1px solid #1e3a8a;
      padding: 4px 14px;
      font-weight: 800;
      font-size: 11px;
      color: #1e3a8a;
      text-transform: uppercase;
      margin: 8px 0;
      letter-spacing: 1px;
    }

    .party-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
      font-family: -apple-system, sans-serif;
      font-size: 9px;
    }
    .party-card {
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      padding: 10px 12px;
      border-radius: 4px;
    }
    .party-card h3 {
      margin: 0 0 6px;
      font-size: 9.5px;
      font-weight: 800;
      color: #1e3a8a;
      text-transform: uppercase;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 3px;
    }
    .party-field {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
    }
    .party-field span:first-child { color: #64748b; }
    .party-field span:last-child { font-weight: 700; color: #0f172a; }

    .tax-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-family: -apple-system, sans-serif;
      font-size: 9px;
    }
    .tax-table th {
      background: #1e3a8a;
      color: #ffffff;
      padding: 6px 8px;
      text-align: left;
      font-size: 8.5px;
    }
    .tax-table td {
      padding: 6px 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    .tax-table tr.highlight td {
      background: #f1f5f9;
      font-weight: 800;
      font-size: 10px;
      border-top: 2px solid #1e3a8a;
      border-bottom: 2px solid #1e3a8a;
    }
    .text-right { text-align: right; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }

    .declaration {
      font-size: 9.5px;
      line-height: 1.6;
      text-align: justify;
      margin-bottom: 24px;
      padding: 8px 12px;
      background: #fdfdfd;
      border-left: 3px solid #1e3a8a;
    }

    .sign-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      text-align: center;
      margin-top: 30px;
      font-family: -apple-system, sans-serif;
    }
    .sign-line {
      border-bottom: 1px solid #0f172a;
      height: 36px;
      margin-bottom: 4px;
    }
    .sign-name { font-size: 9px; font-weight: 800; }
    .sign-title { font-size: 7.5px; color: #64748b; }
  </style>
</head>
<body>
  <div class="cert-frame">
    <div class="cert-header">
      <h1>Edusphere Academy of Excellence</h1>
      <h2>Certificate of Deduction of Income Tax at Source</h2>
      <p>Under Section 149 / Rule 42 of the Income Tax Ordinance, 2001 (Islamic Republic of Pakistan)</p>
      <div class="cert-badge">Official Withholding Tax Certificate &middot; Tax Year ${summary.year}</div>
      <p>Certificate Serial No: <strong>${summary.taxCertificateRef}</strong> &middot; Issuance Date: <strong>${generatedDate}</strong></p>
    </div>

    <div class="party-grid">
      <div class="party-card">
        <h3>Withholding Agent (Employer)</h3>
        <div class="party-field"><span>Employer Name:</span> <span>Edusphere Educational Trust</span></div>
        <div class="party-field"><span>NTN / FTN:</span> <span class="mono">4192083-7</span></div>
        <div class="party-field"><span>Status:</span> <span>Company / Prescribed Person</span></div>
        <div class="party-field"><span>Tax Office:</span> <span>Regional Tax Office (RTO)</span></div>
        <div class="party-field"><span>Campus:</span> <span>${t.campus}</span></div>
      </div>
      <div class="party-card">
        <h3>Taxpayer / Employee (Faculty)</h3>
        <div class="party-field"><span>Faculty Name:</span> <span>${t.name}</span></div>
        <div class="party-field"><span>Employee Code:</span> <span class="mono">${t.empCode}</span></div>
        <div class="party-field"><span>CNIC Number:</span> <span class="mono">${t.cnic}</span></div>
        <div class="party-field"><span>National Tax # (NTN):</span> <span class="mono">${t.ntn}</span></div>
        <div class="party-field"><span>Designation:</span> <span>${t.designation}</span></div>
      </div>
    </div>

    <table class="tax-table">
      <thead>
        <tr>
          <th style="width: 50%;">Particulars of Remuneration</th>
          <th class="text-right" style="width: 25%;">Section Code</th>
          <th class="text-right" style="width: 25%;">Amount (PKR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Gross Remuneration / Emoluments Disbursed</td>
          <td class="text-right mono">Sec 12 / 149</td>
          <td class="text-right mono">${formatCurrency(summary.annualGrossSalary)}</td>
        </tr>
        <tr>
          <td>Less: Exempt Medical Allowance (Clause 139 Part I 2nd Sched)</td>
          <td class="text-right mono">Exempt</td>
          <td class="text-right mono" style="color: #15803d;">-${formatCurrency(summary.taxExemptAllowance)}</td>
        </tr>
        <tr style="background: #f8fafc; font-weight: 700;">
          <td>Total Net Taxable Salary</td>
          <td class="text-right mono">Taxable</td>
          <td class="text-right mono font-bold">${formatCurrency(summary.taxableIncome)}</td>
        </tr>
        <tr>
          <td>Applicable Effective Withholding Tax Rate</td>
          <td class="text-right mono">Salaried Slabs</td>
          <td class="text-right mono">${summary.effectiveTaxRate}%</td>
        </tr>
        <tr class="highlight">
          <td>TOTAL INCOME TAX WITHHELD AND REMITTED TO FBR</td>
          <td class="text-right mono">CP-149</td>
          <td class="text-right mono" style="color: #b91c1c;">${formatCurrency(summary.annualTaxDeducted)}</td>
        </tr>
      </tbody>
    </table>

    <div class="declaration">
      <strong>CERTIFICATE:</strong> Certified that an aggregate sum of <strong>${formatCurrency(summary.annualTaxDeducted)}</strong> has been deducted at source under Section 149 of the Income Tax Ordinance, 2001 from remuneration paid to <strong>${t.name}</strong> during the period 1st January ${summary.year} to 31st December ${summary.year}. The deducted tax has been remitted to the credit of the Federal Government into the State Bank of Pakistan / National Bank of Pakistan through electronic CPRs in accordance with the law.
    </div>

    <div class="sign-row">
      <div>
        <div class="sign-line"></div>
        <div class="sign-name">Taxation Officer</div>
        <div class="sign-title">Payroll &amp; Withholding Tax Section</div>
      </div>
      <div>
        <div class="sign-line"></div>
        <div class="sign-name">Director Human Resources</div>
        <div class="sign-title">Edusphere Central Administration</div>
      </div>
      <div>
        <div class="sign-line"></div>
        <div class="sign-name">Authorized Tax Signatory / CFO</div>
        <div class="sign-title">Principal Withholding Officer</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  return printHtml(html);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CLIENT-SIDE PDF DOWNLOAD USING JSPDF (A4 PORTRAIT)
// ─────────────────────────────────────────────────────────────────────────────

export function exportTeacherSalaryPdf(
  summary: YearlyTeacherSalarySummary,
  periodLabel: string = "Calendar Year 2026"
): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const t = summary.teacher;
  const pageWidth = 210;
  const marginX = 12;

  // Header banner
  doc.setFillColor(30, 58, 138); // #1e3a8a
  doc.rect(0, 0, pageWidth, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("EDUSPHERE ACADEMY OF EXCELLENCE", marginX, 10);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    `ANNUAL TEACHER SALARY STATEMENT · ${periodLabel.toUpperCase()} · ${t.campus.toUpperCase()}`,
    marginX,
    16
  );

  doc.setFontSize(7);
  doc.text(`Ref: ${summary.taxCertificateRef}`, pageWidth - marginX - 40, 16);

  // Bio card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, 28, pageWidth - marginX * 2, 22, 2, 2, "FD");

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("TEACHER NAME", marginX + 4, 34);
  doc.text("EMP CODE", marginX + 60, 34);
  doc.text("DEPARTMENT", marginX + 95, 34);
  doc.text("DESIGNATION", marginX + 135, 34);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.text(t.name, marginX + 4, 39);
  doc.text(t.empCode, marginX + 60, 39);
  doc.text(t.department, marginX + 95, 39);
  doc.text(t.designation.slice(0, 26), marginX + 135, 39);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.text("CNIC #", marginX + 4, 44);
  doc.text("NTN #", marginX + 60, 44);
  doc.text("BANK & ACCOUNT", marginX + 95, 44);
  doc.text("ANNUAL NET DISBURSED", marginX + 135, 44);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.text(t.cnic, marginX + 4, 48);
  doc.text(t.ntn, marginX + 60, 48);
  doc.text(`${t.bankName.slice(0, 16)} (${t.accountNumber.slice(-6)})`, marginX + 95, 48);

  doc.setTextColor(21, 128, 61);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(summary.annualNetDisbursed), marginX + 135, 48);

  // 12-Month Table
  const tableData = summary.monthlyRecords.map((m) => [
    m.monthShort,
    m.voucherNo,
    formatCurrency(m.baseSalary),
    formatCurrency(m.houseRentAllowance),
    formatCurrency(m.medicalAllowance + m.conveyanceAllowance + m.specialAllowance),
    formatCurrency(m.grossSalary),
    `-${formatCurrency(m.taxDeduction)}`,
    `-${formatCurrency(m.providentFund + m.eobi)}`,
    `-${formatCurrency(m.totalDeductions)}`,
    formatCurrency(m.netSalary),
    m.status,
  ]);

  // Grand totals row
  tableData.push([
    "TOTAL",
    "12 MONTHS",
    formatCurrency(summary.annualBaseSalary),
    formatCurrency(summary.annualHra),
    formatCurrency(summary.annualMedical + summary.annualConveyance + summary.annualSpecial),
    formatCurrency(summary.annualGrossSalary),
    `-${formatCurrency(summary.annualTaxDeducted)}`,
    `-${formatCurrency(summary.annualProvidentFund + summary.annualEobi)}`,
    `-${formatCurrency(summary.annualTotalDeductions)}`,
    formatCurrency(summary.annualNetDisbursed),
    `${summary.monthsPaidCount}/12`,
  ]);

  autoTable(doc, {
    startY: 54,
    head: [
      [
        "Month",
        "Voucher #",
        "Basic",
        "HRA (30%)",
        "Allowances",
        "Gross Pay",
        "Inc. Tax",
        "PF & EOBI",
        "Total Ded.",
        "Net Disbursed",
        "Status",
      ],
    ],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 6.8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 14, fontStyle: "bold" },
      1: { cellWidth: 20 },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right", fontStyle: "bold" },
      6: { halign: "right", textColor: [185, 28, 28] },
      7: { halign: "right", textColor: [185, 28, 28] },
      8: { halign: "right", textColor: [185, 28, 28] },
      9: { halign: "right", fontStyle: "bold", textColor: [21, 128, 61] },
      10: { halign: "center", cellWidth: 16 },
    },
    margin: { left: marginX, right: marginX },
  });

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 210;

  // Declaration & Signatures
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Certified that this statement reflects the true and complete remuneration disbursed to the faculty member after deduction of statutory taxes and provident fund.",
    marginX,
    finalY + 8,
    { maxWidth: pageWidth - marginX * 2 }
  );

  // Signatures
  const sigY = finalY + 22;
  doc.setDrawColor(15, 23, 42);
  doc.line(marginX, sigY, marginX + 45, sigY);
  doc.line(marginX + 65, sigY, marginX + 110, sigY);
  doc.line(marginX + 130, sigY, marginX + 175, sigY);

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Senior Payroll Officer", marginX + 4, sigY + 4);
  doc.text("Head of Human Capital", marginX + 69, sigY + 4);
  doc.text("Director of Finance / CFO", marginX + 134, sigY + 4);

  doc.save(`Edusphere-Annual-Salary-${t.empCode}-${summary.year}.pdf`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. CSV EXPORT HELPERS (SPREADSHEETS / EXCEL)
// ─────────────────────────────────────────────────────────────────────────────

export function exportConsolidatedRosterCsv(
  summaries: YearlyTeacherSalarySummary[],
  periodLabel: string = "2026"
): void {
  const headers = [
    "Employee Code",
    "Teacher Name",
    "Department",
    "Campus",
    "Designation",
    "Grade Tier",
    "CNIC",
    "NTN",
    "Bank Name",
    "Account Number",
    "Annual Base Salary",
    "Annual HRA",
    "Annual Medical",
    "Annual Conveyance",
    "Annual Special",
    "Annual Gross Salary",
    "Annual Tax Withheld",
    "Annual Provident Fund",
    "Annual EOBI",
    "Annual Total Deductions",
    "Annual Net Disbursed",
    "Months Paid",
    "Effective Tax Rate %",
    "Status",
  ];

  const rows = summaries.map((s) => [
    `"${s.teacher.empCode}"`,
    `"${s.teacher.name}"`,
    `"${s.teacher.department}"`,
    `"${s.teacher.campus}"`,
    `"${s.teacher.designation}"`,
    `"${s.teacher.gradeTier}"`,
    `"${s.teacher.cnic}"`,
    `"${s.teacher.ntn}"`,
    `"${s.teacher.bankName}"`,
    `"${s.teacher.accountNumber}"`,
    s.annualBaseSalary,
    s.annualHra,
    s.annualMedical,
    s.annualConveyance,
    s.annualSpecial,
    s.annualGrossSalary,
    s.annualTaxDeducted,
    s.annualProvidentFund,
    s.annualEobi,
    s.annualTotalDeductions,
    s.annualNetDisbursed,
    s.monthsPaidCount,
    s.effectiveTaxRate,
    `"${s.overallStatus}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerBlobDownload(blob, `Faculty_Yearly_Salary_Roster_${periodLabel.replace(/\s+/g, "_")}.csv`);
}

export function exportIndividualTeacherCsv(
  summary: YearlyTeacherSalarySummary
): void {
  const headers = [
    "Month",
    "Voucher No",
    "Base Salary",
    "House Rent Allowance",
    "Medical Allowance",
    "Conveyance Allowance",
    "Special Allowance",
    "Gross Salary",
    "Tax Deduction",
    "Provident Fund",
    "EOBI",
    "Leave Deduction",
    "Loan Deduction",
    "Total Deductions",
    "Net Salary",
    "Disbursed Date",
    "Payment Mode",
    "Transaction Ref",
    "Status",
  ];

  const rows = summary.monthlyRecords.map((m) => [
    `"${m.monthName}"`,
    `"${m.voucherNo}"`,
    m.baseSalary,
    m.houseRentAllowance,
    m.medicalAllowance,
    m.conveyanceAllowance,
    m.specialAllowance,
    m.grossSalary,
    m.taxDeduction,
    m.providentFund,
    m.eobi,
    m.unpaidLeaveDeduction,
    m.loanDeduction,
    m.totalDeductions,
    m.netSalary,
    `"${m.disbursedDate}"`,
    `"${m.paymentMode}"`,
    `"${m.transactionRef}"`,
    `"${m.status}"`,
  ]);

  // Grand totals row
  rows.push([
    `"ANNUAL TOTALS"`,
    `"-"`,
    summary.annualBaseSalary,
    summary.annualHra,
    summary.annualMedical,
    summary.annualConveyance,
    summary.annualSpecial,
    summary.annualGrossSalary,
    summary.annualTaxDeducted,
    summary.annualProvidentFund,
    summary.annualEobi,
    0,
    summary.annualOtherDeductions,
    summary.annualTotalDeductions,
    summary.annualNetDisbursed,
    `"-"`,
    `"-"`,
    `"-"`,
    `"${summary.monthsPaidCount}/12 Months"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerBlobDownload(
    blob,
    `Teacher_Annual_Salary_${summary.teacher.empCode}_${summary.year}.csv`
  );
}
