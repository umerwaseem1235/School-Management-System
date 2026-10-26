import type {
  CampusRealizationSummary,
  FeeDefaulterRecord,
  StudentFeeReportRecord,
} from "@/lib/mock/finance";
import type { StaffSalaryRecord } from "@/lib/mock/payroll";
import { formatCurrency, formatPercent } from "@/lib/format";

export type ReportPeriodMode = "monthly" | "annual";
export type ReportTabKey =
  | "campus-summary"
  | "student-fees"
  | "staff-salaries"
  | "defaulters";

export interface ReportExportOptions {
  activeTab: ReportTabKey;
  selectedCampus: string;
  periodMode: ReportPeriodMode;
  selectedMonth: string;
  campusList: CampusRealizationSummary[];
  studentFeesList: StudentFeeReportRecord[];
  staffSalariesList: StaffSalaryRecord[];
  defaultersList: FeeDefaulterRecord[];
}

export interface AnnualMonthMeta {
  index: number;
  fullName: string;
  shortName: string;
  code: string;
  dueDate: string;
  paidDate: string;
  variationFactor: number;
}

export const ANNUAL_MONTHS_2026: AnnualMonthMeta[] = [
  { index: 0, fullName: "January 2026", shortName: "Jan 2026", code: "2601", dueDate: "10 Jan 2026", paidDate: "05 Jan 2026", variationFactor: 1.0 },
  { index: 1, fullName: "February 2026", shortName: "Feb 2026", code: "2602", dueDate: "10 Feb 2026", paidDate: "06 Feb 2026", variationFactor: 1.0 },
  { index: 2, fullName: "March 2026", shortName: "Mar 2026", code: "2603", dueDate: "10 Mar 2026", paidDate: "05 Mar 2026", variationFactor: 1.0 },
  { index: 3, fullName: "April 2026", shortName: "Apr 2026", code: "2604", dueDate: "10 Apr 2026", paidDate: "07 Apr 2026", variationFactor: 0.94 },
  { index: 4, fullName: "May 2026", shortName: "May 2026", code: "2605", dueDate: "10 May 2026", paidDate: "05 May 2026", variationFactor: 0.99 },
  { index: 5, fullName: "June 2026", shortName: "Jun 2026", code: "2606", dueDate: "10 Jun 2026", paidDate: "04 Jun 2026", variationFactor: 0.96 },
  { index: 6, fullName: "July 2026", shortName: "Jul 2026", code: "2607", dueDate: "10 Jul 2026", paidDate: "06 Jul 2026", variationFactor: 0.95 },
  { index: 7, fullName: "August 2026", shortName: "Aug 2026", code: "2608", dueDate: "10 Aug 2026", paidDate: "05 Aug 2026", variationFactor: 0.97 },
  { index: 8, fullName: "September 2026", shortName: "Sep 2026", code: "2609", dueDate: "10 Sep 2026", paidDate: "07 Sep 2026", variationFactor: 0.98 },
  { index: 9, fullName: "October 2026", shortName: "Oct 2026", code: "2610", dueDate: "10 Oct 2026", paidDate: "05 Oct 2026", variationFactor: 1.0 },
  { index: 10, fullName: "November 2026", shortName: "Nov 2026", code: "2611", dueDate: "10 Nov 2026", paidDate: "05 Nov 2026", variationFactor: 1.0 },
  { index: 11, fullName: "December 2026", shortName: "Dec 2026", code: "2612", dueDate: "10 Dec 2026", paidDate: "04 Dec 2026", variationFactor: 1.0 },
];

export interface StudentMonthFeeRow {
  month: AnnualMonthMeta;
  challanNo: string;
  tuitionFee: number;
  labAndActivityFee: number;
  transportFee: number;
  annualCharges: number;
  scholarshipDiscount: number;
  grossFee: number;
  netPayable: number;
  paidAmount: number;
  balanceDue: number;
  paymentDate: string;
  paymentMode: string;
  status: "Paid" | "Partial" | "Unpaid" | "Overdue";
}

export interface StaffMonthSalaryRow {
  month: AnnualMonthMeta;
  voucherNo: string;
  baseSalary: number;
  houseRentAllowance: number;
  medicalAllowance: number;
  conveyanceAllowance: number;
  specialAllowance: number;
  otherAllowances: number;
  grossSalary: number;
  taxDeduction: number;
  providentFund: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  disbursedDate: string;
  paymentMode: string;
  status: "Disbursed" | "Approved" | "Pending" | "On Hold";
}

export function buildStudentAnnualMonthlyRows(
  r: StudentFeeReportRecord
): StudentMonthFeeRow[] {
  const challanSuffix = r.challanNumber.split("-").pop() ?? `00${r.rollNo}`;
  let remainingPaidPool = r.annualPaid;

  return ANNUAL_MONTHS_2026.map((m) => {
    const tuitionFee = r.tuitionFee;
    const labAndActivityFee = r.labAndActivityFee;
    const transportFee = r.transportFee;
    const annualCharges = r.annualChargesMonthly;
    const scholarshipDiscount = r.scholarshipDiscount;
    const grossFee =
      tuitionFee + labAndActivityFee + transportFee + annualCharges;
    const netPayable = r.monthlyPayable;

    const paidAmount = Math.min(netPayable, Math.max(0, remainingPaidPool));
    remainingPaidPool = Math.max(0, remainingPaidPool - paidAmount);
    const balanceDue = Math.max(0, netPayable - paidAmount);

    let status: "Paid" | "Partial" | "Unpaid" | "Overdue" = "Paid";
    if (paidAmount >= netPayable) {
      status = "Paid";
    } else if (paidAmount > 0) {
      status = "Partial";
    } else {
      status = r.status === "Overdue" ? "Overdue" : "Unpaid";
    }

    const paymentMode =
      paidAmount > 0
        ? r.paymentMode && r.paymentMode !== "Pending"
          ? r.paymentMode
          : "1Bill Online"
        : "Pending";

    return {
      month: m,
      challanNo: `CH-${m.code}-${challanSuffix}`,
      tuitionFee,
      labAndActivityFee,
      transportFee,
      annualCharges,
      scholarshipDiscount,
      grossFee,
      netPayable,
      paidAmount,
      balanceDue,
      paymentDate: paidAmount > 0 ? m.paidDate : "—",
      paymentMode,
      status,
    };
  });
}

export function buildStaffAnnualMonthlyRows(
  r: StaffSalaryRecord
): StaffMonthSalaryRow[] {
  const empSuffix = r.empCode.replace(/[^0-9]/g, "") || "0100";

  return ANNUAL_MONTHS_2026.map((m) => {
    const otherAllowances =
      r.medicalAllowance + r.conveyanceAllowance + r.specialAllowance;
    const otherDeductions =
      r.eobi + r.loanDeduction + r.unpaidLeaveDeduction;

    // Earlier months (Jan-Sep) are disbursed; Oct-Dec reflect current record status if pending/on-hold
    const monthStatus: StaffMonthSalaryRow["status"] =
      m.index < 9 ? "Disbursed" : r.status;
    const disbursedDate =
      monthStatus === "Disbursed" ? m.paidDate : "Scheduled";

    return {
      month: m,
      voucherNo: `SAL-${m.code}-${empSuffix}`,
      baseSalary: r.baseSalary,
      houseRentAllowance: r.houseRentAllowance,
      medicalAllowance: r.medicalAllowance,
      conveyanceAllowance: r.conveyanceAllowance,
      specialAllowance: r.specialAllowance,
      otherAllowances,
      grossSalary: r.grossSalary,
      taxDeduction: r.taxDeduction,
      providentFund: r.providentFund,
      otherDeductions,
      totalDeductions: r.totalDeductions,
      netSalary: r.netSalary,
      disbursedDate,
      paymentMode: r.paymentMode,
      status: monthStatus,
    };
  });
}

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

function buildMinimalPdf(
  pagesStreams: string[],
  orientation: "portrait" | "landscape" = "portrait"
): Blob {
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

  const mediaBox =
    orientation === "landscape"
      ? "[0 0 841.89 595.28]"
      : "[0 0 595.28 841.89]";

  const pageIds: number[] = [];

  for (const stream of pagesStreams) {
    const streamBytes = new TextEncoder().encode(stream).length;
    const contentId = addObject(
      `<< /Length ${streamBytes} >>\nstream\n${stream}\nendstream`
    );
    const pageId = addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox ${mediaBox} /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`
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

function getPeriodLabel(
  periodMode: ReportPeriodMode,
  selectedMonth: string
): string {
  return periodMode === "annual"
    ? "Annual Consolidated - Jan to Dec 2026 (12 Months)"
    : `Monthly Cycle - ${selectedMonth}`;
}

function getTabTitle(activeTab: ReportTabKey): string {
  switch (activeTab) {
    case "student-fees":
      return "Student Fee Collection & Billing Ledger";
    case "staff-salaries":
      return "Staff Compensation & Payroll Disbursal Report";
    case "defaulters":
      return "Fee Defaulters & Aging Bracket Register";
    case "campus-summary":
    default:
      return "Campus-Wise Fee Realization & Staff Payroll Summary";
  }
}

/* ───────────────────────── 1. Consolidated PDF Export ───────────────────────── */

export function exportFeeReportsPdf(options: ReportExportOptions): boolean {
  const {
    activeTab,
    selectedCampus,
    periodMode,
    selectedMonth,
    campusList,
    studentFeesList,
    staffSalariesList,
    defaultersList,
  } = options;

  const multiplier = periodMode === "annual" ? 12 : 1;
  const periodLabel = getPeriodLabel(periodMode, selectedMonth);
  const tabTitle = getTabTitle(activeTab);

  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const totalBilled =
    campusList.reduce((s, r) => s + r.totalBilled, 0) * multiplier;
  const totalCollected =
    campusList.reduce((s, r) => s + r.totalCollected, 0) * multiplier;
  const totalPayroll =
    campusList.reduce((s, r) => s + r.staffNetPayroll, 0) * multiplier;

  const pages: string[] = [];

  const drawPageHeader = (cmds: string[], subtitleSuffix: string) => {
    cmds.push("0.04 0.11 0.24 rg");
    cmds.push("28 752 539.28 65 re f");

    cmds.push("1 1 1 rg");
    cmds.push(
      "BT /F2 13 Tf 40 798 Td (EDUSPHERE MULTI-CAMPUS SYSTEM) Tj ET"
    );
    cmds.push("0.85 0.90 0.98 rg");
    cmds.push(
      `BT /F2 9 Tf 40 783 Td (${sanitizePdfText(
        `${tabTitle}${subtitleSuffix ? ` - ${subtitleSuffix}` : ""}`
      )}) Tj ET`
    );
    cmds.push(
      `BT /F1 7.5 Tf 40 769 Td (Campus: ${sanitizePdfText(
        selectedCampus
      )}  |  Period: ${sanitizePdfText(periodLabel)}  |  Generated: ${sanitizePdfText(
        generatedDate
      )}) Tj ET`
    );

    cmds.push("0.96 0.97 0.99 rg");
    cmds.push("28 704 539.28 38 re f");
    cmds.push("0.85 0.88 0.93 RG 0.5 w");
    cmds.push("28 704 539.28 38 re S");

    cmds.push("0.08 0.12 0.20 rg");
    cmds.push(
      `BT /F2 7.5 Tf 38 727 Td (Fee Billed: Rs ${totalBilled.toLocaleString()}) Tj ET`
    );
    cmds.push("0.05 0.55 0.25 rg");
    cmds.push(
      `BT /F2 7.5 Tf 205 727 Td (Fee Collected: Rs ${totalCollected.toLocaleString()}) Tj ET`
    );
    cmds.push("0.12 0.24 0.48 rg");
    cmds.push(
      `BT /F2 7.5 Tf 385 727 Td (Staff Payroll: Rs ${totalPayroll.toLocaleString()}) Tj ET`
    );

    cmds.push("0.35 0.40 0.48 rg");
    cmds.push(
      `BT /F1 7 Tf 38 712 Td (Scope: ${sanitizePdfText(
        selectedCampus
      )} | Billing Mode: ${
        periodMode === "annual"
          ? "Annual Month-by-Month Breakdown (January - December 2026)"
          : selectedMonth
      }) Tj ET`
    );
  };

  const drawPageFooter = (cmds: string[], pageLabel: string) => {
    cmds.push("0.4 0.45 0.5 rg");
    cmds.push("28 40 539.28 0.5 re f");
    cmds.push(
      `BT /F1 7 Tf 40 28 Td (Directorate of Finance  |  Central Accounts & Audit Division  |  EduSphere Multi-Campus  |  ${sanitizePdfText(
        pageLabel
      )}) Tj ET`
    );
  };

  // When periodMode === "annual", Page 1 is ALWAYS the Complete January-to-December Month-by-Month Schedule
  if (periodMode === "annual") {
    const p1: string[] = [];
    drawPageHeader(p1, "Month-by-Month Schedule (Jan - Dec 2026)");

    let yPos = 680;
    p1.push("0.04 0.11 0.24 rg");
    p1.push(
      `BT /F2 8.5 Tf 28 ${yPos + 6} Td (SECTION 1: MONTH-BY-MONTH BREAKDOWN SCHEDULE (JANUARY - DECEMBER 2026)) Tj ET`
    );
    yPos -= 18;

    if (activeTab === "student-fees") {
      const cols = [
        { title: "Month (2026)", x: 32 },
        { title: "Tuition", x: 112 },
        { title: "Lab/Act.", x: 175 },
        { title: "Transport", x: 230 },
        { title: "Exam/Res.", x: 285 },
        { title: "Waiver", x: 340 },
        { title: "Net Payable", x: 392 },
        { title: "Realized", x: 460 },
        { title: "Balance", x: 520 },
      ];

      p1.push("0.06 0.15 0.30 rg");
      p1.push(`28 ${yPos} 539.28 19 re f`);
      p1.push("1 1 1 rg");
      for (const col of cols) {
        p1.push(`BT /F2 7 Tf ${col.x} ${yPos + 6} Td (${col.title}) Tj ET`);
      }
      yPos -= 16;

      const allStudentMonthRows = studentFeesList.map((s) =>
        buildStudentAnnualMonthlyRows(s)
      );

      let sumTuition = 0;
      let sumLab = 0;
      let sumTrans = 0;
      let sumExam = 0;
      let sumWaiver = 0;
      let sumNet = 0;
      let sumPaid = 0;
      let sumBal = 0;

      ANNUAL_MONTHS_2026.forEach((m, idx) => {
        const mTuition = allStudentMonthRows.reduce(
          (s, rows) => s + rows[idx].tuitionFee,
          0
        );
        const mLab = allStudentMonthRows.reduce(
          (s, rows) => s + rows[idx].labAndActivityFee,
          0
        );
        const mTrans = allStudentMonthRows.reduce(
          (s, rows) => s + rows[idx].transportFee,
          0
        );
        const mExam = allStudentMonthRows.reduce(
          (s, rows) => s + rows[idx].annualCharges,
          0
        );
        const mWaiver = allStudentMonthRows.reduce(
          (s, rows) => s + rows[idx].scholarshipDiscount,
          0
        );
        const mNet = allStudentMonthRows.reduce(
          (s, rows) => s + rows[idx].netPayable,
          0
        );
        const mPaid = allStudentMonthRows.reduce(
          (s, rows) => s + rows[idx].paidAmount,
          0
        );
        const mBal = allStudentMonthRows.reduce(
          (s, rows) => s + rows[idx].balanceDue,
          0
        );

        sumTuition += mTuition;
        sumLab += mLab;
        sumTrans += mTrans;
        sumExam += mExam;
        sumWaiver += mWaiver;
        sumNet += mNet;
        sumPaid += mPaid;
        sumBal += mBal;

        if (idx % 2 === 0) {
          p1.push("0.97 0.98 1 rg");
          p1.push(`28 ${yPos - 4} 539.28 16 re f`);
        }

        p1.push("0.08 0.12 0.20 rg");
        p1.push(`BT /F2 7 Tf 32 ${yPos} Td (${m.fullName}) Tj ET`);
        p1.push(
          `BT /F1 7 Tf 112 ${yPos} Td (Rs ${mTuition.toLocaleString()}) Tj ET`
        );
        p1.push(
          `BT /F1 7 Tf 175 ${yPos} Td (Rs ${mLab.toLocaleString()}) Tj ET`
        );
        p1.push(
          `BT /F1 7 Tf 230 ${yPos} Td (Rs ${mTrans.toLocaleString()}) Tj ET`
        );
        p1.push(
          `BT /F1 7 Tf 285 ${yPos} Td (Rs ${mExam.toLocaleString()}) Tj ET`
        );
        p1.push("0.05 0.55 0.25 rg");
        p1.push(
          `BT /F1 7 Tf 340 ${yPos} Td (-Rs ${mWaiver.toLocaleString()}) Tj ET`
        );
        p1.push("0.08 0.12 0.20 rg");
        p1.push(
          `BT /F2 7 Tf 392 ${yPos} Td (Rs ${mNet.toLocaleString()}) Tj ET`
        );
        p1.push("0.05 0.55 0.25 rg");
        p1.push(
          `BT /F2 7 Tf 460 ${yPos} Td (Rs ${mPaid.toLocaleString()}) Tj ET`
        );
        p1.push(mBal > 0 ? "0.75 0.15 0.15 rg" : "0.35 0.40 0.48 rg");
        p1.push(
          `BT /F2 7 Tf 520 ${yPos} Td (Rs ${mBal.toLocaleString()}) Tj ET`
        );
        yPos -= 16;
      });

      // Total row
      p1.push("0.90 0.93 0.98 rg");
      p1.push(`28 ${yPos - 5} 539.28 18 re f`);
      p1.push("0.04 0.11 0.24 rg");
      p1.push(`BT /F2 7.2 Tf 32 ${yPos} Td (TOTAL (JAN - DEC)) Tj ET`);
      p1.push(
        `BT /F2 7 Tf 112 ${yPos} Td (Rs ${sumTuition.toLocaleString()}) Tj ET`
      );
      p1.push(
        `BT /F2 7 Tf 175 ${yPos} Td (Rs ${sumLab.toLocaleString()}) Tj ET`
      );
      p1.push(
        `BT /F2 7 Tf 230 ${yPos} Td (Rs ${sumTrans.toLocaleString()}) Tj ET`
      );
      p1.push(
        `BT /F2 7 Tf 285 ${yPos} Td (Rs ${sumExam.toLocaleString()}) Tj ET`
      );
      p1.push("0.05 0.55 0.25 rg");
      p1.push(
        `BT /F2 7 Tf 340 ${yPos} Td (-Rs ${sumWaiver.toLocaleString()}) Tj ET`
      );
      p1.push("0.04 0.11 0.24 rg");
      p1.push(
        `BT /F2 7.2 Tf 392 ${yPos} Td (Rs ${sumNet.toLocaleString()}) Tj ET`
      );
      p1.push("0.05 0.55 0.25 rg");
      p1.push(
        `BT /F2 7.2 Tf 460 ${yPos} Td (Rs ${sumPaid.toLocaleString()}) Tj ET`
      );
      p1.push(sumBal > 0 ? "0.75 0.15 0.15 rg" : "0.05 0.55 0.25 rg");
      p1.push(
        `BT /F2 7.2 Tf 520 ${yPos} Td (Rs ${sumBal.toLocaleString()}) Tj ET`
      );
      yPos -= 28;
    } else if (activeTab === "staff-salaries") {
      const cols = [
        { title: "Month (2026)", x: 32 },
        { title: "Basic Pay", x: 115 },
        { title: "HRA", x: 180 },
        { title: "Med/Conv/Sp.", x: 240 },
        { title: "Gross Pay", x: 310 },
        { title: "Income Tax", x: 380 },
        { title: "PF/EOBI/Loan", x: 440 },
        { title: "Net Salary", x: 505 },
      ];

      p1.push("0.06 0.15 0.30 rg");
      p1.push(`28 ${yPos} 539.28 19 re f`);
      p1.push("1 1 1 rg");
      for (const col of cols) {
        p1.push(`BT /F2 7 Tf ${col.x} ${yPos + 6} Td (${col.title}) Tj ET`);
      }
      yPos -= 16;

      const mBase = staffSalariesList.reduce((s, r) => s + r.baseSalary, 0);
      const mHra = staffSalariesList.reduce(
        (s, r) => s + r.houseRentAllowance,
        0
      );
      const mOtherAllow = staffSalariesList.reduce(
        (s, r) =>
          s + r.medicalAllowance + r.conveyanceAllowance + r.specialAllowance,
        0
      );
      const mGross = staffSalariesList.reduce((s, r) => s + r.grossSalary, 0);
      const mTax = staffSalariesList.reduce((s, r) => s + r.taxDeduction, 0);
      const mOtherDed = staffSalariesList.reduce(
        (s, r) =>
          s + r.providentFund + r.eobi + r.loanDeduction + r.unpaidLeaveDeduction,
        0
      );
      const mNet = staffSalariesList.reduce((s, r) => s + r.netSalary, 0);

      ANNUAL_MONTHS_2026.forEach((m, idx) => {
        if (idx % 2 === 0) {
          p1.push("0.97 0.98 1 rg");
          p1.push(`28 ${yPos - 4} 539.28 16 re f`);
        }

        p1.push("0.08 0.12 0.20 rg");
        p1.push(`BT /F2 7 Tf 32 ${yPos} Td (${m.fullName}) Tj ET`);
        p1.push(
          `BT /F1 7 Tf 115 ${yPos} Td (Rs ${mBase.toLocaleString()}) Tj ET`
        );
        p1.push(
          `BT /F1 7 Tf 180 ${yPos} Td (Rs ${mHra.toLocaleString()}) Tj ET`
        );
        p1.push(
          `BT /F1 7 Tf 240 ${yPos} Td (Rs ${mOtherAllow.toLocaleString()}) Tj ET`
        );
        p1.push(
          `BT /F2 7 Tf 310 ${yPos} Td (Rs ${mGross.toLocaleString()}) Tj ET`
        );
        p1.push("0.75 0.15 0.15 rg");
        p1.push(
          `BT /F1 7 Tf 380 ${yPos} Td (-Rs ${mTax.toLocaleString()}) Tj ET`
        );
        p1.push(
          `BT /F1 7 Tf 440 ${yPos} Td (-Rs ${mOtherDed.toLocaleString()}) Tj ET`
        );
        p1.push("0.05 0.55 0.25 rg");
        p1.push(
          `BT /F2 7 Tf 505 ${yPos} Td (Rs ${mNet.toLocaleString()}) Tj ET`
        );
        yPos -= 16;
      });

      p1.push("0.90 0.93 0.98 rg");
      p1.push(`28 ${yPos - 5} 539.28 18 re f`);
      p1.push("0.04 0.11 0.24 rg");
      p1.push(`BT /F2 7.2 Tf 32 ${yPos} Td (TOTAL (JAN - DEC)) Tj ET`);
      p1.push(
        `BT /F2 7 Tf 115 ${yPos} Td (Rs ${(mBase * 12).toLocaleString()}) Tj ET`
      );
      p1.push(
        `BT /F2 7 Tf 180 ${yPos} Td (Rs ${(mHra * 12).toLocaleString()}) Tj ET`
      );
      p1.push(
        `BT /F2 7 Tf 240 ${yPos} Td (Rs ${(mOtherAllow * 12).toLocaleString()}) Tj ET`
      );
      p1.push(
        `BT /F2 7.2 Tf 310 ${yPos} Td (Rs ${(mGross * 12).toLocaleString()}) Tj ET`
      );
      p1.push("0.75 0.15 0.15 rg");
      p1.push(
        `BT /F2 7 Tf 380 ${yPos} Td (-Rs ${(mTax * 12).toLocaleString()}) Tj ET`
      );
      p1.push(
        `BT /F2 7 Tf 440 ${yPos} Td (-Rs ${(mOtherDed * 12).toLocaleString()}) Tj ET`
      );
      p1.push("0.05 0.55 0.25 rg");
      p1.push(
        `BT /F2 7.2 Tf 505 ${yPos} Td (Rs ${(mNet * 12).toLocaleString()}) Tj ET`
      );
      yPos -= 28;
    } else {
      const cols = [
        { title: "Month (2026)", x: 32 },
        { title: "Fee Billed", x: 120 },
        { title: "Fee Collected", x: 205 },
        { title: "Outstanding", x: 290 },
        { title: "Gross Payroll", x: 370 },
        { title: "Net Payroll", x: 450 },
        { title: "Net Surplus", x: 518 },
      ];

      p1.push("0.06 0.15 0.30 rg");
      p1.push(`28 ${yPos} 539.28 19 re f`);
      p1.push("1 1 1 rg");
      for (const col of cols) {
        p1.push(`BT /F2 7 Tf ${col.x} ${yPos + 6} Td (${col.title}) Tj ET`);
      }
      yPos -= 16;

      const baseBilled = campusList.reduce((s, r) => s + r.totalBilled, 0);
      const baseCollected = campusList.reduce((s, r) => s + r.totalCollected, 0);
      const baseOut = campusList.reduce((s, r) => s + r.totalOutstanding, 0);
      const baseGrossPay = campusList.reduce(
        (s, r) => s + r.staffGrossPayroll,
        0
      );
      const baseNetPay = campusList.reduce((s, r) => s + r.staffNetPayroll, 0);

      ANNUAL_MONTHS_2026.forEach((m, idx) => {
        if (idx % 2 === 0) {
          p1.push("0.97 0.98 1 rg");
          p1.push(`28 ${yPos - 4} 539.28 16 re f`);
        }
        const surplus = baseCollected - baseNetPay;
        p1.push("0.08 0.12 0.20 rg");
        p1.push(`BT /F2 7 Tf 32 ${yPos} Td (${m.fullName}) Tj ET`);
        p1.push(
          `BT /F1 7 Tf 120 ${yPos} Td (Rs ${baseBilled.toLocaleString()}) Tj ET`
        );
        p1.push("0.05 0.55 0.25 rg");
        p1.push(
          `BT /F2 7 Tf 205 ${yPos} Td (Rs ${baseCollected.toLocaleString()}) Tj ET`
        );
        p1.push("0.75 0.15 0.15 rg");
        p1.push(
          `BT /F1 7 Tf 290 ${yPos} Td (Rs ${baseOut.toLocaleString()}) Tj ET`
        );
        p1.push("0.08 0.12 0.20 rg");
        p1.push(
          `BT /F1 7 Tf 370 ${yPos} Td (Rs ${baseGrossPay.toLocaleString()}) Tj ET`
        );
        p1.push("0.12 0.24 0.48 rg");
        p1.push(
          `BT /F2 7 Tf 450 ${yPos} Td (Rs ${baseNetPay.toLocaleString()}) Tj ET`
        );
        p1.push("0.05 0.55 0.25 rg");
        p1.push(
          `BT /F2 7 Tf 518 ${yPos} Td (Rs ${surplus.toLocaleString()}) Tj ET`
        );
        yPos -= 16;
      });

      p1.push("0.90 0.93 0.98 rg");
      p1.push(`28 ${yPos - 5} 539.28 18 re f`);
      p1.push("0.04 0.11 0.24 rg");
      p1.push(`BT /F2 7.2 Tf 32 ${yPos} Td (TOTAL (JAN - DEC)) Tj ET`);
      p1.push(
        `BT /F2 7 Tf 120 ${yPos} Td (Rs ${(baseBilled * 12).toLocaleString()}) Tj ET`
      );
      p1.push("0.05 0.55 0.25 rg");
      p1.push(
        `BT /F2 7 Tf 205 ${yPos} Td (Rs ${(baseCollected * 12).toLocaleString()}) Tj ET`
      );
      p1.push("0.75 0.15 0.15 rg");
      p1.push(
        `BT /F2 7 Tf 290 ${yPos} Td (Rs ${(baseOut * 12).toLocaleString()}) Tj ET`
      );
      p1.push("0.04 0.11 0.24 rg");
      p1.push(
        `BT /F2 7 Tf 370 ${yPos} Td (Rs ${(baseGrossPay * 12).toLocaleString()}) Tj ET`
      );
      p1.push("0.12 0.24 0.48 rg");
      p1.push(
        `BT /F2 7 Tf 450 ${yPos} Td (Rs ${(baseNetPay * 12).toLocaleString()}) Tj ET`
      );
      p1.push("0.05 0.55 0.25 rg");
      p1.push(
        `BT /F2 7 Tf 518 ${yPos} Td (Rs ${((baseCollected - baseNetPay) * 12).toLocaleString()}) Tj ET`
      );
      yPos -= 28;
    }

    drawPageFooter(p1, "Page 1 of 2 - Annual Month-by-Month Schedule (Jan - Dec)");
    pages.push(p1.join("\n"));
  }

  // Page 2 (or Page 1 in Monthly mode): Detailed Register Table
  const cmds: string[] = [];
  drawPageHeader(
    cmds,
    periodMode === "annual"
      ? "Detailed Annual Register"
      : `${selectedMonth} Register`
  );

  let yPos = 676;

  if (activeTab === "student-fees") {
    const cols = [
      { title: "Roll / Challan", x: 34 },
      { title: "Student Name", x: 112 },
      { title: "Class & Campus", x: 205 },
      { title: "Tuition+Heads", x: 300 },
      { title: "Payable Fee", x: 375 },
      { title: "Paid Amount", x: 448 },
      { title: "Status", x: 522 },
    ];

    cmds.push("0.06 0.15 0.30 rg");
    cmds.push(`28 ${yPos} 539.28 20 re f`);
    cmds.push("1 1 1 rg");
    for (const col of cols) {
      cmds.push(`BT /F2 7.2 Tf ${col.x} ${yPos + 6} Td (${col.title}) Tj ET`);
    }
    yPos -= 17;

    studentFeesList.slice(0, 34).forEach((r, idx) => {
      const payable =
        periodMode === "annual" ? r.annualPayable : r.monthlyPayable;
      const paid = periodMode === "annual" ? r.annualPaid : r.monthlyPaid;
      const grossHeads =
        (r.tuitionFee +
          r.labAndActivityFee +
          r.transportFee +
          r.annualChargesMonthly) *
        multiplier;

      if (idx % 2 === 0) {
        cmds.push("0.97 0.98 1 rg");
        cmds.push(`28 ${yPos - 3} 539.28 16 re f`);
      }
      cmds.push("0.1 0.1 0.1 rg");
      cmds.push(
        `BT /F2 7 Tf 34 ${yPos} Td (#${sanitizePdfText(
          r.rollNo
        )} | ${sanitizePdfText(r.challanNumber.slice(-6))}) Tj ET`
      );
      cmds.push(
        `BT /F2 7.2 Tf 112 ${yPos} Td (${sanitizePdfText(
          r.student.slice(0, 17)
        )}) Tj ET`
      );
      cmds.push(
        `BT /F1 7 Tf 205 ${yPos} Td (${sanitizePdfText(
          `${r.className} - ${r.campus
            .replace("Main Campus — ", "")
            .replace(" Campus", "")
            .slice(0, 10)}`
        )}) Tj ET`
      );
      cmds.push(
        `BT /F1 7 Tf 300 ${yPos} Td (Rs ${grossHeads.toLocaleString()}) Tj ET`
      );
      cmds.push(
        `BT /F2 7.2 Tf 375 ${yPos} Td (Rs ${payable.toLocaleString()}) Tj ET`
      );
      cmds.push("0.05 0.55 0.25 rg");
      cmds.push(
        `BT /F2 7.2 Tf 448 ${yPos} Td (Rs ${paid.toLocaleString()}) Tj ET`
      );
      cmds.push("0.1 0.1 0.1 rg");
      cmds.push(
        `BT /F2 7 Tf 522 ${yPos} Td (${sanitizePdfText(r.status)}) Tj ET`
      );
      yPos -= 16;
    });
  } else if (activeTab === "staff-salaries") {
    const cols = [
      { title: "Emp Code", x: 34 },
      { title: "Staff Name & Role", x: 90 },
      { title: "Campus", x: 212 },
      { title: "Basic Pay", x: 282 },
      { title: "Gross Pay", x: 350 },
      { title: "Deductions", x: 420 },
      { title: "Net Salary", x: 482 },
      { title: "Status", x: 538 },
    ];

    cmds.push("0.06 0.15 0.30 rg");
    cmds.push(`28 ${yPos} 539.28 20 re f`);
    cmds.push("1 1 1 rg");
    for (const col of cols) {
      cmds.push(`BT /F2 7 Tf ${col.x} ${yPos + 6} Td (${col.title}) Tj ET`);
    }
    yPos -= 17;

    staffSalariesList.slice(0, 34).forEach((r, idx) => {
      const base = r.baseSalary * multiplier;
      const gross = r.grossSalary * multiplier;
      const deduct = r.totalDeductions * multiplier;
      const net = r.netSalary * multiplier;

      if (idx % 2 === 0) {
        cmds.push("0.97 0.98 1 rg");
        cmds.push(`28 ${yPos - 3} 539.28 16 re f`);
      }
      cmds.push("0.1 0.1 0.1 rg");
      cmds.push(
        `BT /F2 7 Tf 34 ${yPos} Td (${sanitizePdfText(r.empCode)}) Tj ET`
      );
      cmds.push(
        `BT /F2 7 Tf 90 ${yPos} Td (${sanitizePdfText(
          `${r.name.slice(0, 15)} (${r.designation.slice(0, 10)})`
        )}) Tj ET`
      );
      cmds.push(
        `BT /F1 7 Tf 212 ${yPos} Td (${sanitizePdfText(
          r.campus.slice(0, 12)
        )}) Tj ET`
      );
      cmds.push(
        `BT /F1 7 Tf 282 ${yPos} Td (Rs ${base.toLocaleString()}) Tj ET`
      );
      cmds.push(
        `BT /F1 7 Tf 350 ${yPos} Td (Rs ${gross.toLocaleString()}) Tj ET`
      );
      cmds.push("0.75 0.20 0.20 rg");
      cmds.push(
        `BT /F1 7 Tf 420 ${yPos} Td (-Rs ${deduct.toLocaleString()}) Tj ET`
      );
      cmds.push("0.05 0.55 0.25 rg");
      cmds.push(
        `BT /F2 7 Tf 482 ${yPos} Td (Rs ${net.toLocaleString()}) Tj ET`
      );
      cmds.push("0.1 0.1 0.1 rg");
      cmds.push(
        `BT /F2 6.5 Tf 538 ${yPos} Td (${sanitizePdfText(r.status)}) Tj ET`
      );
      yPos -= 16;
    });
  } else if (activeTab === "defaulters") {
    const cols = [
      { title: "Student Name", x: 34 },
      { title: "Challan #", x: 140 },
      { title: "Campus", x: 220 },
      { title: "Guardian Contact", x: 290 },
      { title: "Overdue Months", x: 390 },
      { title: "Aging Severity", x: 470 },
      { title: "Arrears", x: 530 },
    ];

    cmds.push("0.06 0.15 0.30 rg");
    cmds.push(`28 ${yPos} 539.28 20 re f`);
    cmds.push("1 1 1 rg");
    for (const col of cols) {
      cmds.push(`BT /F2 7.5 Tf ${col.x} ${yPos + 6} Td (${col.title}) Tj ET`);
    }
    yPos -= 18;

    defaultersList.forEach((r, idx) => {
      if (idx % 2 === 0) {
        cmds.push("0.97 0.98 1 rg");
        cmds.push(`28 ${yPos - 3} 539.28 17 re f`);
      }
      cmds.push("0.1 0.1 0.1 rg");
      cmds.push(
        `BT /F2 7.5 Tf 34 ${yPos} Td (${sanitizePdfText(
          r.student.slice(0, 16)
        )}) Tj ET`
      );
      cmds.push(
        `BT /F1 7.5 Tf 140 ${yPos} Td (${sanitizePdfText(
          r.challanNumber
        )}) Tj ET`
      );
      cmds.push(
        `BT /F1 7.5 Tf 220 ${yPos} Td (${sanitizePdfText(
          r.campus.slice(0, 10)
        )}) Tj ET`
      );
      cmds.push(
        `BT /F1 7.5 Tf 290 ${yPos} Td (${sanitizePdfText(r.phone)}) Tj ET`
      );
      cmds.push(
        `BT /F1 7.5 Tf 390 ${yPos} Td (${sanitizePdfText(
          r.overdueMonths.slice(0, 14)
        )}) Tj ET`
      );
      cmds.push(
        `BT /F2 7.5 Tf 470 ${yPos} Td (${sanitizePdfText(
          r.severity.slice(0, 10)
        )}) Tj ET`
      );
      cmds.push("0.75 0.20 0.20 rg");
      cmds.push(
        `BT /F2 7.5 Tf 530 ${yPos} Td (Rs ${r.balanceDue.toLocaleString()}) Tj ET`
      );
      yPos -= 17;
    });
  } else {
    const cols = [
      { title: "Campus Name", x: 34 },
      { title: "Fee Billed", x: 155 },
      { title: "Fee Collected", x: 235 },
      { title: "Outstanding", x: 320 },
      { title: "Staff Payroll", x: 400 },
      { title: "Net Surplus", x: 480 },
      { title: "Rate", x: 540 },
    ];

    cmds.push("0.06 0.15 0.30 rg");
    cmds.push(`28 ${yPos} 539.28 20 re f`);
    cmds.push("1 1 1 rg");
    for (const col of cols) {
      cmds.push(`BT /F2 7.5 Tf ${col.x} ${yPos + 6} Td (${col.title}) Tj ET`);
    }
    yPos -= 18;

    campusList.forEach((r, idx) => {
      const billed = r.totalBilled * multiplier;
      const collected = r.totalCollected * multiplier;
      const outstanding = r.totalOutstanding * multiplier;
      const payroll = r.staffNetPayroll * multiplier;
      const surplus = collected - payroll;

      if (idx % 2 === 0) {
        cmds.push("0.97 0.98 1 rg");
        cmds.push(`28 ${yPos - 3} 539.28 17 re f`);
      }
      cmds.push("0.1 0.1 0.1 rg");
      cmds.push(
        `BT /F2 7.5 Tf 34 ${yPos} Td (${sanitizePdfText(
          r.campus.replace("Main Campus — ", "Gulberg - ").slice(0, 20)
        )}) Tj ET`
      );
      cmds.push(
        `BT /F1 7 Tf 155 ${yPos} Td (Rs ${billed.toLocaleString()}) Tj ET`
      );
      cmds.push("0.05 0.55 0.25 rg");
      cmds.push(
        `BT /F2 7 Tf 235 ${yPos} Td (Rs ${collected.toLocaleString()}) Tj ET`
      );
      cmds.push("0.75 0.20 0.20 rg");
      cmds.push(
        `BT /F1 7 Tf 320 ${yPos} Td (Rs ${outstanding.toLocaleString()}) Tj ET`
      );
      cmds.push("0.12 0.24 0.48 rg");
      cmds.push(
        `BT /F2 7 Tf 400 ${yPos} Td (Rs ${payroll.toLocaleString()}) Tj ET`
      );
      cmds.push("0.05 0.55 0.25 rg");
      cmds.push(
        `BT /F2 7 Tf 480 ${yPos} Td (Rs ${surplus.toLocaleString()}) Tj ET`
      );
      cmds.push("0.04 0.11 0.24 rg");
      cmds.push(`BT /F2 7.5 Tf 540 ${yPos} Td (${r.collectionRate}%) Tj ET`);
      yPos -= 18;
    });
  }

  drawPageFooter(
    cmds,
    periodMode === "annual"
      ? "Page 2 of 2 - Detailed Annual Ledger"
      : "Page 1 of 1"
  );
  pages.push(cmds.join("\n"));

  const pdfBlob = buildMinimalPdf(pages, "portrait");
  const safeCampus = selectedCampus.replace(/[^a-zA-Z0-9]+/g, "-");
  triggerBlobDownload(
    pdfBlob,
    `EduSphere-${activeTab}-${safeCampus}-${periodMode}-${generatedDate.replace(
      /\s+/g,
      "-"
    )}.pdf`
  );
  return true;
}

/* ───────────────────────── 2. Consolidated Print Report ───────────────────────── */

export function printFeeReportsReport(options: ReportExportOptions): boolean {
  if (typeof window === "undefined") return false;

  const {
    activeTab,
    selectedCampus,
    periodMode,
    selectedMonth,
    campusList,
    studentFeesList,
    staffSalariesList,
    defaultersList,
  } = options;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    window.print();
    return true;
  }

  const multiplier = periodMode === "annual" ? 12 : 1;
  const periodLabel = getPeriodLabel(periodMode, selectedMonth);
  const tabTitle = getTabTitle(activeTab);

  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const totalBilled =
    campusList.reduce((s, r) => s + r.totalBilled, 0) * multiplier;
  const totalCollected =
    campusList.reduce((s, r) => s + r.totalCollected, 0) * multiplier;
  const totalOutstanding =
    campusList.reduce((s, r) => s + r.totalOutstanding, 0) * multiplier;
  const totalPayroll =
    campusList.reduce((s, r) => s + r.staffNetPayroll, 0) * multiplier;

  // Build Jan-Dec Month-by-Month Schedule HTML when periodMode === "annual"
  let annualMonthlyScheduleHtml = "";
  if (periodMode === "annual") {
    if (activeTab === "student-fees") {
      const allStudentRows = studentFeesList.map((s) =>
        buildStudentAnnualMonthlyRows(s)
      );
      let totTuition = 0;
      let totLab = 0;
      let totTrans = 0;
      let totExam = 0;
      let totWaiver = 0;
      let totNet = 0;
      let totPaid = 0;
      let totBal = 0;

      const mRows = ANNUAL_MONTHS_2026.map((m, idx) => {
        const tuition = allStudentRows.reduce(
          (s, r) => s + r[idx].tuitionFee,
          0
        );
        const lab = allStudentRows.reduce(
          (s, r) => s + r[idx].labAndActivityFee,
          0
        );
        const trans = allStudentRows.reduce(
          (s, r) => s + r[idx].transportFee,
          0
        );
        const exam = allStudentRows.reduce(
          (s, r) => s + r[idx].annualCharges,
          0
        );
        const waiver = allStudentRows.reduce(
          (s, r) => s + r[idx].scholarshipDiscount,
          0
        );
        const net = allStudentRows.reduce((s, r) => s + r[idx].netPayable, 0);
        const paid = allStudentRows.reduce((s, r) => s + r[idx].paidAmount, 0);
        const bal = allStudentRows.reduce((s, r) => s + r[idx].balanceDue, 0);
        const rate = net > 0 ? (paid / net) * 100 : 0;

        totTuition += tuition;
        totLab += lab;
        totTrans += trans;
        totExam += exam;
        totWaiver += waiver;
        totNet += net;
        totPaid += paid;
        totBal += bal;

        return `<tr class="${idx % 2 === 0 ? "even" : ""}">
          <td class="font-bold">${m.fullName}</td>
          <td class="mono text-center">CH-${m.code}-BATCH</td>
          <td class="text-right mono">${formatCurrency(tuition)}</td>
          <td class="text-right mono">${formatCurrency(lab)}</td>
          <td class="text-right mono">${formatCurrency(trans)}</td>
          <td class="text-right mono">${formatCurrency(exam)}</td>
          <td class="text-right mono" style="color: #15803d;">-${formatCurrency(waiver)}</td>
          <td class="text-right mono font-bold">${formatCurrency(net)}</td>
          <td class="text-right mono font-bold" style="color: #15803d;">${formatCurrency(paid)}</td>
          <td class="text-right mono font-bold" style="color: ${bal > 0 ? "#b91c1c" : "#64748b"};">${formatCurrency(bal)}</td>
          <td class="text-center mono font-bold">${formatPercent(rate)}</td>
        </tr>`;
      }).join("");

      const totRate = totNet > 0 ? (totPaid / totNet) * 100 : 0;

      annualMonthlyScheduleHtml = `
      <div class="section-block">
        <div class="section-heading">
          <span>Section 1: Month-by-Month Fee Realization Schedule (January – December 2026 | 12 Months)</span>
          <span>Scope: ${studentFeesList.length} Students · ${selectedCampus}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Billing Month</th>
              <th class="text-center">Batch Code</th>
              <th class="text-right">Tuition Fee</th>
              <th class="text-right">Lab &amp; Activity</th>
              <th class="text-right">Transport</th>
              <th class="text-right">Exam &amp; Resource</th>
              <th class="text-right">Scholarship Waiver</th>
              <th class="text-right">Net Payable</th>
              <th class="text-right">Realized / Paid</th>
              <th class="text-right">Balance Due</th>
              <th class="text-center">Realization</th>
            </tr>
          </thead>
          <tbody>
            ${mRows}
            <tr class="summary-total-row">
              <td class="font-bold">12-MONTH TOTAL (JAN – DEC)</td>
              <td class="text-center mono">AY 2026–27</td>
              <td class="text-right mono">${formatCurrency(totTuition)}</td>
              <td class="text-right mono">${formatCurrency(totLab)}</td>
              <td class="text-right mono">${formatCurrency(totTrans)}</td>
              <td class="text-right mono">${formatCurrency(totExam)}</td>
              <td class="text-right mono" style="color: #15803d;">-${formatCurrency(totWaiver)}</td>
              <td class="text-right mono">${formatCurrency(totNet)}</td>
              <td class="text-right mono" style="color: #15803d;">${formatCurrency(totPaid)}</td>
              <td class="text-right mono" style="color: ${totBal > 0 ? "#b91c1c" : "#15803d"};">${formatCurrency(totBal)}</td>
              <td class="text-center mono">${formatPercent(totRate)}</td>
            </tr>
          </tbody>
        </table>
      </div>`;
    } else if (activeTab === "staff-salaries") {
      const mBase = staffSalariesList.reduce((s, r) => s + r.baseSalary, 0);
      const mHra = staffSalariesList.reduce(
        (s, r) => s + r.houseRentAllowance,
        0
      );
      const mMedConv = staffSalariesList.reduce(
        (s, r) =>
          s + r.medicalAllowance + r.conveyanceAllowance + r.specialAllowance,
        0
      );
      const mGross = staffSalariesList.reduce((s, r) => s + r.grossSalary, 0);
      const mTax = staffSalariesList.reduce((s, r) => s + r.taxDeduction, 0);
      const mPfLoan = staffSalariesList.reduce(
        (s, r) =>
          s + r.providentFund + r.eobi + r.loanDeduction + r.unpaidLeaveDeduction,
        0
      );
      const mDed = staffSalariesList.reduce((s, r) => s + r.totalDeductions, 0);
      const mNet = staffSalariesList.reduce((s, r) => s + r.netSalary, 0);

      const mRows = ANNUAL_MONTHS_2026.map(
        (m, idx) => `<tr class="${idx % 2 === 0 ? "even" : ""}">
          <td class="font-bold">${m.fullName}</td>
          <td class="mono text-center">PR-${m.code}-BATCH</td>
          <td class="text-center">${staffSalariesList.length} Staff</td>
          <td class="text-right mono">${formatCurrency(mBase)}</td>
          <td class="text-right mono">${formatCurrency(mHra)}</td>
          <td class="text-right mono">${formatCurrency(mMedConv)}</td>
          <td class="text-right mono font-bold">${formatCurrency(mGross)}</td>
          <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(mTax)}</td>
          <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(mPfLoan)}</td>
          <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(mDed)}</td>
          <td class="text-right mono font-bold" style="color: #15803d;">${formatCurrency(mNet)}</td>
          <td class="text-center"><span class="status-badge status-paid">Disbursed</span></td>
        </tr>`
      ).join("");

      annualMonthlyScheduleHtml = `
      <div class="section-block">
        <div class="section-heading">
          <span>Section 1: Month-by-Month Staff Salary &amp; Payroll Schedule (January – December 2026 | 12 Months)</span>
          <span>Scope: ${staffSalariesList.length} Staff Members · ${selectedCampus}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Payroll Month</th>
              <th class="text-center">Batch Ref</th>
              <th class="text-center">Headcount</th>
              <th class="text-right">Basic Salary</th>
              <th class="text-right">House Rent (HRA)</th>
              <th class="text-right">Med / Conv / Spec</th>
              <th class="text-right">Gross Salary</th>
              <th class="text-right">Income Tax</th>
              <th class="text-right">PF / EOBI / Loans</th>
              <th class="text-right">Total Deductions</th>
              <th class="text-right">Net Disbursed</th>
              <th class="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            ${mRows}
            <tr class="summary-total-row">
              <td class="font-bold">12-MONTH TOTAL (JAN – DEC)</td>
              <td class="text-center mono">AY 2026–27</td>
              <td class="text-center">${staffSalariesList.length} Staff</td>
              <td class="text-right mono">${formatCurrency(mBase * 12)}</td>
              <td class="text-right mono">${formatCurrency(mHra * 12)}</td>
              <td class="text-right mono">${formatCurrency(mMedConv * 12)}</td>
              <td class="text-right mono">${formatCurrency(mGross * 12)}</td>
              <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(mTax * 12)}</td>
              <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(mPfLoan * 12)}</td>
              <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(mDed * 12)}</td>
              <td class="text-right mono" style="color: #15803d;">${formatCurrency(mNet * 12)}</td>
              <td class="text-center"><span class="status-badge status-paid">12M Verified</span></td>
            </tr>
          </tbody>
        </table>
      </div>`;
    } else {
      const mBilled = campusList.reduce((s, r) => s + r.totalBilled, 0);
      const mColl = campusList.reduce((s, r) => s + r.totalCollected, 0);
      const mOut = campusList.reduce((s, r) => s + r.totalOutstanding, 0);
      const mGrossPay = campusList.reduce(
        (s, r) => s + r.staffGrossPayroll,
        0
      );
      const mDedPay = campusList.reduce((s, r) => s + r.staffDeductions, 0);
      const mNetPay = campusList.reduce((s, r) => s + r.staffNetPayroll, 0);
      const mSurplus = mColl - mNetPay;
      const mEff = mBilled > 0 ? (mColl / mBilled) * 100 : 0;

      const mRows = ANNUAL_MONTHS_2026.map(
        (m, idx) => `<tr class="${idx % 2 === 0 ? "even" : ""}">
          <td class="font-bold">${m.fullName}</td>
          <td class="text-right mono">${formatCurrency(mBilled)}</td>
          <td class="text-right mono font-bold" style="color: #15803d;">${formatCurrency(mColl)}</td>
          <td class="text-right mono" style="color: #b91c1c;">${formatCurrency(mOut)}</td>
          <td class="text-right mono">${formatCurrency(mGrossPay)}</td>
          <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(mDedPay)}</td>
          <td class="text-right mono font-bold" style="color: #1e3a8a;">${formatCurrency(mNetPay)}</td>
          <td class="text-right mono font-bold" style="color: #15803d;">${formatCurrency(mSurplus)}</td>
          <td class="text-center mono font-bold">${formatPercent(mEff)}</td>
        </tr>`
      ).join("");

      annualMonthlyScheduleHtml = `
      <div class="section-block">
        <div class="section-heading">
          <span>Section 1: Month-by-Month Consolidated Fee &amp; Payroll Schedule (January – December 2026 | 12 Months)</span>
          <span>Scope: ${selectedCampus}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Month (2026)</th>
              <th class="text-right">Fee Billed</th>
              <th class="text-right">Fee Collected</th>
              <th class="text-right">Fee Outstanding</th>
              <th class="text-right">Staff Gross Payroll</th>
              <th class="text-right">Payroll Deductions</th>
              <th class="text-right">Staff Net Payroll</th>
              <th class="text-right">Net Campus Surplus</th>
              <th class="text-center">Efficiency</th>
            </tr>
          </thead>
          <tbody>
            ${mRows}
            <tr class="summary-total-row">
              <td class="font-bold">12-MONTH TOTAL (JAN – DEC)</td>
              <td class="text-right mono">${formatCurrency(mBilled * 12)}</td>
              <td class="text-right mono" style="color: #15803d;">${formatCurrency(mColl * 12)}</td>
              <td class="text-right mono" style="color: #b91c1c;">${formatCurrency(mOut * 12)}</td>
              <td class="text-right mono">${formatCurrency(mGrossPay * 12)}</td>
              <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(mDedPay * 12)}</td>
              <td class="text-right mono" style="color: #1e3a8a;">${formatCurrency(mNetPay * 12)}</td>
              <td class="text-right mono" style="color: #15803d;">${formatCurrency(mSurplus * 12)}</td>
              <td class="text-center mono">${formatPercent(mEff)}</td>
            </tr>
          </tbody>
        </table>
      </div>`;
    }
  }

  let tableHeaders = "";
  let rowsHtml = "";

  if (activeTab === "student-fees") {
    tableHeaders = `<tr>
      <th>Roll # / Challan</th>
      <th>Student Name</th>
      <th>Class &amp; Campus</th>
      <th class="text-center">Billing Cycle</th>
      <th class="text-right">Tuition (12M/1M)</th>
      <th class="text-right">Lab, Trans &amp; Exam</th>
      <th class="text-right">Waiver</th>
      <th class="text-right">Net Payable</th>
      <th class="text-right">Paid Amount</th>
      <th class="text-right">Balance Due</th>
      <th class="text-center">Status</th>
    </tr>`;

    rowsHtml = studentFeesList
      .map((r, idx) => {
        const payable =
          periodMode === "annual" ? r.annualPayable : r.monthlyPayable;
        const paid = periodMode === "annual" ? r.annualPaid : r.monthlyPaid;
        const balance = Math.max(0, payable - paid);
        const tuitionTotal = r.tuitionFee * multiplier;
        const otherHeadsTotal =
          (r.labAndActivityFee + r.transportFee + r.annualChargesMonthly) *
          multiplier;
        const waiverTotal = r.scholarshipDiscount * multiplier;
        return `
      <tr class="${idx % 2 === 0 ? "even" : ""}">
        <td class="mono font-bold">#${r.rollNo}<div class="sub-text">${r.challanNumber}</div></td>
        <td class="font-bold">${r.student}<div class="sub-text">F/N: ${r.fatherName}</div></td>
        <td><strong>${r.className}</strong><div class="sub-text">${r.campus}</div></td>
        <td class="text-center">${periodMode === "annual" ? "Jan–Dec 2026 (12M)" : selectedMonth}</td>
        <td class="text-right mono">${formatCurrency(tuitionTotal)}</td>
        <td class="text-right mono">${formatCurrency(otherHeadsTotal)}</td>
        <td class="text-right mono" style="color: #15803d;">-${formatCurrency(waiverTotal)}</td>
        <td class="text-right mono font-bold">${formatCurrency(payable)}</td>
        <td class="text-right mono font-bold" style="color: #15803d;">${formatCurrency(paid)}</td>
        <td class="text-right mono font-bold" style="color: ${balance > 0 ? "#b91c1c" : "#64748b"};">${formatCurrency(balance)}</td>
        <td class="text-center"><span class="status-badge ${r.status === "Paid" ? "status-paid" : "status-overdue"}">${r.status}</span></td>
      </tr>`;
      })
      .join("");
  } else if (activeTab === "staff-salaries") {
    tableHeaders = `<tr>
      <th>Emp Code</th>
      <th>Staff Name &amp; Designation</th>
      <th>Campus &amp; Dept</th>
      <th class="text-center">Cycle</th>
      <th class="text-right">Basic Salary</th>
      <th class="text-right">HRA &amp; Allowances</th>
      <th class="text-right">Gross Salary</th>
      <th class="text-right">Deductions</th>
      <th class="text-right">Net Disbursed</th>
      <th class="text-center">Status</th>
    </tr>`;

    rowsHtml = staffSalariesList
      .map((r, idx) => {
        const base = r.baseSalary * multiplier;
        const allow =
          (r.houseRentAllowance +
            r.medicalAllowance +
            r.conveyanceAllowance +
            r.specialAllowance) *
          multiplier;
        const gross = r.grossSalary * multiplier;
        const deduct = r.totalDeductions * multiplier;
        const net = r.netSalary * multiplier;
        return `
      <tr class="${idx % 2 === 0 ? "even" : ""}">
        <td class="mono font-bold">${r.empCode}</td>
        <td class="font-bold">${r.name}<div class="sub-text">${r.designation} (${r.type})</div></td>
        <td><strong>${r.campus}</strong><div class="sub-text">${r.department}</div></td>
        <td class="text-center">${periodMode === "annual" ? "Jan–Dec 2026 (12M)" : selectedMonth}</td>
        <td class="text-right mono">${formatCurrency(base)}</td>
        <td class="text-right mono">${formatCurrency(allow)}</td>
        <td class="text-right mono font-bold">${formatCurrency(gross)}</td>
        <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(deduct)}</td>
        <td class="text-right mono font-bold" style="color: #15803d;">${formatCurrency(net)}</td>
        <td class="text-center"><span class="status-badge ${r.status === "Disbursed" ? "status-paid" : "status-overdue"}">${r.status}</span></td>
      </tr>`;
      })
      .join("");
  } else if (activeTab === "defaulters") {
    tableHeaders = `<tr>
      <th>Student Name</th>
      <th>Challan #</th>
      <th>Campus</th>
      <th>Guardian Contact</th>
      <th>Overdue Billing</th>
      <th>Aging Bracket</th>
      <th class="text-right">Arrears Due</th>
    </tr>`;

    rowsHtml = defaultersList
      .map(
        (r, idx) => `
      <tr class="${idx % 2 === 0 ? "even" : ""}">
        <td class="font-bold">${r.student}<div class="sub-text">${r.className}</div></td>
        <td class="mono font-bold">${r.challanNumber}</td>
        <td>${r.campus}</td>
        <td>${r.guardianName}<div class="sub-text mono">${r.phone}</div></td>
        <td>${r.overdueMonths}<div class="sub-text" style="color: #b91c1c;">${r.daysOverdue} days</div></td>
        <td><span class="status-badge status-overdue">${r.severity}</span></td>
        <td class="text-right mono font-bold" style="color: #b91c1c;">${formatCurrency(r.balanceDue)}</td>
      </tr>`
      )
      .join("");
  } else {
    tableHeaders = `<tr>
      <th>Campus Name</th>
      <th class="text-center">Headcount</th>
      <th class="text-right">Total Fee Billed</th>
      <th class="text-right">Fee Collected</th>
      <th class="text-right">Fee Outstanding</th>
      <th class="text-right">Staff Net Payroll</th>
      <th class="text-right">Net Campus Surplus</th>
      <th class="text-center">Efficiency</th>
    </tr>`;

    rowsHtml = campusList
      .map((r, idx) => {
        const billed = r.totalBilled * multiplier;
        const collected = r.totalCollected * multiplier;
        const outstanding = r.totalOutstanding * multiplier;
        const payroll = r.staffNetPayroll * multiplier;
        const surplus = collected - payroll;
        return `
      <tr class="${idx % 2 === 0 ? "even" : ""}">
        <td class="font-bold">${r.campus}</td>
        <td class="text-center">${r.enrolledStudents} Students · ${r.staffCount} Staff</td>
        <td class="text-right mono">${formatCurrency(billed)}</td>
        <td class="text-right mono font-bold" style="color: #15803d;">${formatCurrency(collected)}</td>
        <td class="text-right mono" style="color: #b91c1c;">${formatCurrency(outstanding)}</td>
        <td class="text-right mono font-bold" style="color: #1e3a8a;">${formatCurrency(payroll)}</td>
        <td class="text-right mono font-bold" style="color: #15803d;">${formatCurrency(surplus)}</td>
        <td class="text-center mono font-bold" style="color: #0f274a;">${formatPercent(r.collectionRate)}</td>
      </tr>`;
      })
      .join("");
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${tabTitle} - EduSphere</title>
  <style>
    @page { size: A4 landscape; margin: 10mm; }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 10.5px;
    }
    .page-wrap {
      width: 100%;
      padding: 8px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: #091d3e;
      color: #ffffff;
      border-radius: 6px;
      padding: 14px 18px;
      margin-bottom: 12px;
    }
    .title {
      font-size: 16px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 3px 0;
      text-transform: uppercase;
      letter-spacing: 0.01em;
    }
    .subtitle {
      font-size: 11px;
      color: #cbd5e1;
      margin: 0;
      font-weight: 600;
    }
    .meta-box {
      text-align: right;
      font-size: 10px;
      color: #e2e8f0;
      line-height: 1.5;
    }
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }
    .kpi-card {
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      padding: 8px 12px;
      background: #f8fafc;
    }
    .kpi-label { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.03em; }
    .kpi-val { font-size: 13.5px; font-weight: 800; color: #0f274a; margin-top: 2px; }
    .section-block {
      margin-bottom: 16px;
    }
    .section-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f1f5f9;
      border-left: 4px solid #091d3e;
      padding: 6px 10px;
      margin-bottom: 6px;
      font-size: 10.5px;
      font-weight: 800;
      color: #091d3e;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5px;
    }
    th {
      background: #0f274a;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 6px 7px;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    th.text-right, td.text-right { text-align: right; }
    th.text-center, td.text-center { text-align: center; }
    td {
      padding: 5.5px 7px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    tr.even { background-color: #f8fafc; }
    tr.summary-total-row td {
      background: #e2e8f0;
      border-top: 2px solid #091d3e;
      border-bottom: 2px solid #091d3e;
      font-weight: 800;
      padding: 7px;
    }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .font-bold { font-weight: 700; }
    .sub-text { font-size: 8.5px; color: #64748b; font-weight: normal; margin-top: 1px; }
    .status-badge {
      display: inline-block;
      font-size: 8px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 3px;
    }
    .status-paid { background: #dcfce7; color: #15803d; }
    .status-overdue { background: #fee2e2; color: #b91c1c; }
    .footer-signatures {
      margin-top: 28px;
      display: flex;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px dashed #cbd5e1;
      font-size: 9.5px;
      color: #475569;
      page-break-inside: avoid;
    }
    .sig-line { width: 180px; text-align: center; border-top: 1px solid #64748b; padding-top: 4px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="page-wrap">
    <div class="header">
      <div>
        <h1 class="title">EduSphere Multi-Campus School System</h1>
        <p class="subtitle">${tabTitle} — ${periodLabel}</p>
      </div>
      <div class="meta-box">
        <div>Campus Scope: <strong>${selectedCampus}</strong></div>
        <div>Billing Mode: <strong>${periodMode === "annual" ? "Annual Consolidated (Jan – Dec 2026)" : selectedMonth}</strong></div>
        <div>Generated on: <strong>${generatedDate}</strong></div>
      </div>
    </div>

    <div class="kpi-row">
      <div class="kpi-card">
        <div class="kpi-label">Total Fee Billed (${periodMode === "annual" ? "12M Jan–Dec" : selectedMonth})</div>
        <div class="kpi-val">${formatCurrency(totalBilled)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Realized Fee Collections</div>
        <div class="kpi-val" style="color: #15803d;">${formatCurrency(totalCollected)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Outstanding Fee Balance</div>
        <div class="kpi-val" style="color: #b91c1c;">${formatCurrency(totalOutstanding)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Staff Net Payroll Outlay</div>
        <div class="kpi-val" style="color: #1e3a8a;">${formatCurrency(totalPayroll)}</div>
      </div>
    </div>

    ${annualMonthlyScheduleHtml}

    <div class="section-block">
      <div class="section-heading">
        <span>${periodMode === "annual" ? "Section 2: Individual Annual Register" : "Detailed Register"} — ${tabTitle}</span>
        <span>${selectedCampus}</span>
      </div>
      <table>
        <thead>
          ${tableHeaders}
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>

    <div class="footer-signatures">
      <div class="sig-line">Prepared By (Accounts Officer)</div>
      <div class="sig-line">Verified By (Internal Auditor)</div>
      <div class="sig-line">Approved By (Director of Finance)</div>
    </div>
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

/* ───────────────────────── 3. Single Student Statement (Print & PDF) ───────────────────────── */

export function printSingleStudentFeeStatement(
  r: StudentFeeReportRecord,
  periodMode: ReportPeriodMode,
  selectedMonth: string
): boolean {
  if (typeof window === "undefined") return false;
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    window.print();
    return true;
  }

  const multiplier = periodMode === "annual" ? 12 : 1;
  const periodLabel = getPeriodLabel(periodMode, selectedMonth);
  const payable = periodMode === "annual" ? r.annualPayable : r.monthlyPayable;
  const paid = periodMode === "annual" ? r.annualPaid : r.monthlyPaid;
  const balance = Math.max(0, payable - paid);
  const grossAnnualOrMonthly =
    (r.tuitionFee +
      r.labAndActivityFee +
      r.transportFee +
      r.annualChargesMonthly) *
    multiplier;
  const waiverTotal = r.scholarshipDiscount * multiplier;

  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const monthlyRows = buildStudentAnnualMonthlyRows(r);

  const annualMonthlyTableHtml =
    periodMode === "annual"
      ? `
    <div class="section-title">
      <span>Month-by-Month Fee Ledger (January – December 2026 | 12 Months)</span>
      <span>Academic Session: AY 2026–27</span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 12%;">Month</th>
          <th style="width: 13%;">Challan #</th>
          <th class="text-right" style="width: 9%;">Tuition</th>
          <th class="text-right" style="width: 9%;">Lab/Act.</th>
          <th class="text-right" style="width: 8%;">Trans.</th>
          <th class="text-right" style="width: 8%;">Exam/Res.</th>
          <th class="text-right" style="width: 8%;">Waiver</th>
          <th class="text-right" style="width: 10%;">Net Fee</th>
          <th class="text-right" style="width: 10%;">Paid</th>
          <th class="text-right" style="width: 8%;">Balance</th>
          <th class="text-center" style="width: 5%;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${monthlyRows
          .map(
            (mRow, idx) => `
          <tr class="${idx % 2 === 0 ? "even" : ""}">
            <td class="font-bold">${mRow.month.shortName}</td>
            <td class="mono" style="font-size: 8.5px;">${mRow.challanNo}</td>
            <td class="text-right mono">${formatCurrency(mRow.tuitionFee)}</td>
            <td class="text-right mono">${formatCurrency(mRow.labAndActivityFee)}</td>
            <td class="text-right mono">${formatCurrency(mRow.transportFee)}</td>
            <td class="text-right mono">${formatCurrency(mRow.annualCharges)}</td>
            <td class="text-right mono" style="color: #15803d;">${mRow.scholarshipDiscount > 0 ? `-${formatCurrency(mRow.scholarshipDiscount)}` : "Rs 0"}</td>
            <td class="text-right mono font-bold">${formatCurrency(mRow.netPayable)}</td>
            <td class="text-right mono font-bold" style="color: #15803d;">${formatCurrency(mRow.paidAmount)}</td>
            <td class="text-right mono font-bold" style="color: ${mRow.balanceDue > 0 ? "#b91c1c" : "#64748b"};">${formatCurrency(mRow.balanceDue)}</td>
            <td class="text-center"><span class="badge ${mRow.status === "Paid" ? "badge-paid" : mRow.status === "Partial" ? "badge-partial" : "badge-unpaid"}">${mRow.status}</span></td>
          </tr>`
          )
          .join("")}
        <tr class="total-row">
          <td colspan="2">TOTAL (JAN – DEC)</td>
          <td class="text-right mono">${formatCurrency(r.tuitionFee * 12)}</td>
          <td class="text-right mono">${formatCurrency(r.labAndActivityFee * 12)}</td>
          <td class="text-right mono">${formatCurrency(r.transportFee * 12)}</td>
          <td class="text-right mono">${formatCurrency(r.annualChargesMonthly * 12)}</td>
          <td class="text-right mono" style="color: #15803d;">-${formatCurrency(r.scholarshipDiscount * 12)}</td>
          <td class="text-right mono">${formatCurrency(payable)}</td>
          <td class="text-right mono" style="color: #15803d;">${formatCurrency(paid)}</td>
          <td class="text-right mono" style="color: ${balance > 0 ? "#b91c1c" : "#15803d"};">${formatCurrency(balance)}</td>
          <td class="text-center"><span class="badge ${balance === 0 ? "badge-paid" : "badge-unpaid"}">${balance === 0 ? "Cleared" : "Due"}</span></td>
        </tr>
      </tbody>
    </table>`
      : "";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Student Fee Statement - ${r.student}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 10.5px;
    }
    .container {
      width: 100%;
      max-width: 100%;
      padding: 4px;
    }
    .banner {
      background: #091d3e;
      color: #ffffff;
      padding: 13px 16px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .banner h1 { margin: 0; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em; color: #ffffff; }
    .banner p { margin: 3px 0 0; font-size: 10.5px; color: #cbd5e1; font-weight: 500; }
    .banner-meta { text-align: right; font-size: 10px; color: #e2e8f0; line-height: 1.45; shrink: 0; }
    .banner-meta strong { color: #ffffff; }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 10px 0;
      padding: 10px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      background: #f8fafc;
    }
    .field-label { font-size: 8.5px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.03em; }
    .field-val { font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 2px; word-break: break-word; }
    .kpi-strip {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .kpi-box {
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      padding: 6px 9px;
      background: #ffffff;
    }
    .kpi-box-label { font-size: 8px; text-transform: uppercase; color: #64748b; font-weight: 700; }
    .kpi-box-val { font-size: 11.5px; font-weight: 800; color: #091d3e; margin-top: 2px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f1f5f9;
      border-left: 3.5px solid #091d3e;
      padding: 5px 10px;
      margin: 10px 0 5px 0;
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      color: #091d3e;
      letter-spacing: 0.02em;
    }
    table {
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    th {
      background: #0f274a;
      color: #ffffff;
      padding: 5.5px 6px;
      text-align: left;
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.01em;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    td {
      padding: 5px 6px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 9.5px;
      vertical-align: middle;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    tr.even { background-color: #f8fafc; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .font-bold { font-weight: 700; }
    .total-row td {
      font-weight: 800;
      background: #e2e8f0;
      border-top: 1.5px solid #0f274a;
      border-bottom: 1.5px solid #0f274a;
      padding: 6px;
    }
    .badge {
      display: inline-block;
      padding: 1.5px 4px;
      border-radius: 3px;
      font-size: 7.5px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-paid { background: #dcfce7; color: #15803d; }
    .badge-partial { background: #fef3c7; color: #b45309; }
    .badge-unpaid { background: #fee2e2; color: #b91c1c; }
    .sig-footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #475569;
      page-break-inside: avoid;
    }
    .sig-box { width: 165px; text-align: center; border-top: 1px solid #64748b; padding-top: 4px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="banner">
      <div>
        <h1>EduSphere Multi-Campus System</h1>
        <p>Official Student Fee Statement — ${periodLabel}</p>
      </div>
      <div class="banner-meta">
        <div>Challan Ref: <strong>${r.challanNumber}</strong></div>
        <div>Ledger Status: <strong>${r.status}</strong></div>
        <div>Issued On: <strong>${generatedDate}</strong></div>
      </div>
    </div>

    <div class="grid">
      <div><div class="field-label">Student Name &amp; Roll</div><div class="field-val">${r.student} (Roll #${r.rollNo})</div></div>
      <div><div class="field-label">Father / Guardian</div><div class="field-val">${r.fatherName}</div></div>
      <div><div class="field-label">Class &amp; Section</div><div class="field-val">${r.className}</div></div>
      <div><div class="field-label">Campus &amp; Channel</div><div class="field-val">${r.campus.replace("Main Campus — ", "Gulberg · ")} (${r.paymentMode ?? "Standard"})</div></div>
    </div>

    <div class="kpi-strip">
      <div class="kpi-box">
        <div class="kpi-box-label">Gross Fee (${periodMode === "annual" ? "12M" : "1M"})</div>
        <div class="kpi-box-val">${formatCurrency(grossAnnualOrMonthly)}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-box-label">Scholarship Waiver</div>
        <div class="kpi-box-val" style="color: #15803d;">-${formatCurrency(waiverTotal)}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-box-label">Net Payable Fee</div>
        <div class="kpi-box-val">${formatCurrency(payable)}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-box-label">Total Realized / Paid</div>
        <div class="kpi-box-val" style="color: #15803d;">${formatCurrency(paid)}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-box-label">Closing Balance Due</div>
        <div class="kpi-box-val" style="color: ${balance > 0 ? "#b91c1c" : "#15803d"};">${formatCurrency(balance)}</div>
      </div>
    </div>

    ${annualMonthlyTableHtml}

    <div class="section-title">
      <span>${periodMode === "annual" ? "Annual Consolidated Fee Head Summary (12 Months)" : `Monthly Fee Head Breakdown (${selectedMonth})`}</span>
      <span>Currency: PKR (Rs)</span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 44%;">Fee Head Description</th>
          <th class="text-right" style="width: 18%;">Monthly Rate</th>
          <th class="text-center" style="width: 18%;">Billing Frequency</th>
          <th class="text-right" style="width: 20%;">Total (${periodMode === "annual" ? "Annual 12M" : "Monthly"})</th>
        </tr>
      </thead>
      <tbody>
        <tr class="even">
          <td class="font-bold">Tuition Fee</td>
          <td class="text-right mono">${formatCurrency(r.tuitionFee)}</td>
          <td class="text-center">${periodMode === "annual" ? "12 Months (Jan–Dec)" : "1 Month"}</td>
          <td class="text-right mono font-bold">${formatCurrency(r.tuitionFee * multiplier)}</td>
        </tr>
        <tr>
          <td class="font-bold">Science &amp; Computer Lab / Co-Curricular Activities</td>
          <td class="text-right mono">${formatCurrency(r.labAndActivityFee)}</td>
          <td class="text-center">${periodMode === "annual" ? "12 Months (Jan–Dec)" : "1 Month"}</td>
          <td class="text-right mono font-bold">${formatCurrency(r.labAndActivityFee * multiplier)}</td>
        </tr>
        <tr class="even">
          <td class="font-bold">School Transport &amp; Fleet Charges</td>
          <td class="text-right mono">${formatCurrency(r.transportFee)}</td>
          <td class="text-center">${periodMode === "annual" ? "12 Months (Jan–Dec)" : "1 Month"}</td>
          <td class="text-right mono font-bold">${formatCurrency(r.transportFee * multiplier)}</td>
        </tr>
        <tr>
          <td class="font-bold">Annual Resource, Library &amp; Examination Fund</td>
          <td class="text-right mono">${formatCurrency(r.annualChargesMonthly)}</td>
          <td class="text-center">${periodMode === "annual" ? "Annualized (12M)" : "Monthly Prorated"}</td>
          <td class="text-right mono font-bold">${formatCurrency(r.annualChargesMonthly * multiplier)}</td>
        </tr>
        <tr class="even">
          <td class="font-bold">Scholarship / Sibling Fee Concession</td>
          <td class="text-right mono" style="color: #15803d;">-${formatCurrency(r.scholarshipDiscount)}</td>
          <td class="text-center">Less Waiver</td>
          <td class="text-right mono font-bold" style="color: #15803d;">-${formatCurrency(r.scholarshipDiscount * multiplier)}</td>
        </tr>
        <tr class="total-row">
          <td>Net Payable Fee</td>
          <td class="text-right mono">${formatCurrency(r.monthlyPayable)} / mo</td>
          <td class="text-center">${periodMode === "annual" ? "12 Months (Jan–Dec)" : selectedMonth}</td>
          <td class="text-right mono">${formatCurrency(payable)}</td>
        </tr>
        <tr>
          <td class="font-bold">Amount Realized / Paid (${r.paymentMode ?? "Recorded"})</td>
          <td class="text-right mono" style="color: #15803d;">${formatCurrency(r.monthlyPaid)}</td>
          <td class="text-center">${r.lastPaymentDate ? `Last Paid: ${r.lastPaymentDate}` : "Recorded"}</td>
          <td class="text-right mono font-bold" style="color: #15803d;">${formatCurrency(paid)}</td>
        </tr>
        <tr class="total-row">
          <td>Closing Balance Due</td>
          <td class="text-right mono">—</td>
          <td class="text-center">${balance === 0 ? "Cleared in Full" : "Arrears Pending"}</td>
          <td class="text-right mono" style="color: ${balance > 0 ? "#b91c1c" : "#15803d"};">${formatCurrency(balance)}</td>
        </tr>
      </tbody>
    </table>

    <div class="sig-footer">
      <div class="sig-box">Parent / Guardian Signature</div>
      <div class="sig-box">Campus Accounts Officer</div>
      <div class="sig-box">Controller of Finance</div>
    </div>
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

export function exportSingleStudentFeeStatementPdf(
  r: StudentFeeReportRecord,
  periodMode: ReportPeriodMode,
  selectedMonth: string
): boolean {
  const multiplier = periodMode === "annual" ? 12 : 1;
  const periodLabel = getPeriodLabel(periodMode, selectedMonth);
  const payable = periodMode === "annual" ? r.annualPayable : r.monthlyPayable;
  const paid = periodMode === "annual" ? r.annualPaid : r.monthlyPaid;
  const balance = Math.max(0, payable - paid);
  const monthlyRows = buildStudentAnnualMonthlyRows(r);

  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const cmds: string[] = [];

  // Header Banner
  cmds.push("0.04 0.11 0.24 rg");
  cmds.push("28 756 539.28 60 re f");
  cmds.push("1 1 1 rg");
  cmds.push("BT /F2 13 Tf 40 798 Td (EDUSPHERE MULTI-CAMPUS SYSTEM) Tj ET");
  cmds.push("0.85 0.90 0.98 rg");
  cmds.push(
    `BT /F2 8.5 Tf 40 783 Td (${sanitizePdfText(
      `Official Student Fee Statement - ${periodLabel}`
    )}) Tj ET`
  );
  cmds.push(
    `BT /F1 7.5 Tf 40 768 Td (Challan: ${sanitizePdfText(
      r.challanNumber
    )}  |  Status: ${sanitizePdfText(r.status)}  |  Issued: ${sanitizePdfText(
      generatedDate
    )}) Tj ET`
  );

  // Student Profile Box
  cmds.push("0.97 0.98 1 rg");
  cmds.push("28 704 539.28 44 re f");
  cmds.push("0.82 0.86 0.92 RG 0.5 w");
  cmds.push("28 704 539.28 44 re S");

  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F2 8 Tf 36 733 Td (Student: ${sanitizePdfText(
      `${r.student} (Roll #${r.rollNo})`
    )}) Tj ET`
  );
  cmds.push(
    `BT /F2 8 Tf 300 733 Td (Father / Guardian: ${sanitizePdfText(
      r.fatherName
    )}) Tj ET`
  );
  cmds.push(
    `BT /F1 7.5 Tf 36 715 Td (Class: ${sanitizePdfText(
      r.className
    )}  |  Campus: ${sanitizePdfText(r.campus)}) Tj ET`
  );
  cmds.push(
    `BT /F1 7.5 Tf 300 715 Td (Payment Channel: ${sanitizePdfText(
      r.paymentMode ?? "Standard"
    )}) Tj ET`
  );

  let yPos = 682;

  if (periodMode === "annual") {
    cmds.push("0.04 0.11 0.24 rg");
    cmds.push(
      `BT /F2 8 Tf 28 ${yPos + 4} Td (MONTH-BY-MONTH FEE LEDGER (JANUARY - DECEMBER 2026 | 12 MONTHS)) Tj ET`
    );
    yPos -= 16;

    const cols = [
      { title: "Month", x: 32 },
      { title: "Challan #", x: 88 },
      { title: "Tuition", x: 162 },
      { title: "Lab/Act", x: 215 },
      { title: "Trans.", x: 265 },
      { title: "Exam/Res", x: 312 },
      { title: "Waiver", x: 362 },
      { title: "Net Fee", x: 410 },
      { title: "Paid", x: 465 },
      { title: "Balance", x: 520 },
    ];

    cmds.push("0.06 0.15 0.30 rg");
    cmds.push(`28 ${yPos} 539.28 17 re f`);
    cmds.push("1 1 1 rg");
    for (const c of cols) {
      cmds.push(`BT /F2 6.8 Tf ${c.x} ${yPos + 5} Td (${c.title}) Tj ET`);
    }
    yPos -= 14;

    monthlyRows.forEach((mRow, idx) => {
      if (idx % 2 === 0) {
        cmds.push("0.97 0.98 1 rg");
        cmds.push(`28 ${yPos - 3} 539.28 14 re f`);
      }
      cmds.push("0.1 0.1 0.1 rg");
      cmds.push(
        `BT /F2 6.8 Tf 32 ${yPos} Td (${mRow.month.shortName}) Tj ET`
      );
      cmds.push(
        `BT /F1 6.5 Tf 88 ${yPos} Td (${sanitizePdfText(
          mRow.challanNo
        )}) Tj ET`
      );
      cmds.push(
        `BT /F1 6.8 Tf 162 ${yPos} Td (Rs ${mRow.tuitionFee.toLocaleString()}) Tj ET`
      );
      cmds.push(
        `BT /F1 6.8 Tf 215 ${yPos} Td (Rs ${mRow.labAndActivityFee.toLocaleString()}) Tj ET`
      );
      cmds.push(
        `BT /F1 6.8 Tf 265 ${yPos} Td (Rs ${mRow.transportFee.toLocaleString()}) Tj ET`
      );
      cmds.push(
        `BT /F1 6.8 Tf 312 ${yPos} Td (Rs ${mRow.annualCharges.toLocaleString()}) Tj ET`
      );
      cmds.push("0.05 0.55 0.25 rg");
      cmds.push(
        `BT /F1 6.8 Tf 362 ${yPos} Td (-Rs ${mRow.scholarshipDiscount.toLocaleString()}) Tj ET`
      );
      cmds.push("0.08 0.12 0.20 rg");
      cmds.push(
        `BT /F2 6.8 Tf 410 ${yPos} Td (Rs ${mRow.netPayable.toLocaleString()}) Tj ET`
      );
      cmds.push("0.05 0.55 0.25 rg");
      cmds.push(
        `BT /F2 6.8 Tf 465 ${yPos} Td (Rs ${mRow.paidAmount.toLocaleString()}) Tj ET`
      );
      cmds.push(mRow.balanceDue > 0 ? "0.75 0.15 0.15 rg" : "0.35 0.40 0.48 rg");
      cmds.push(
        `BT /F2 6.8 Tf 520 ${yPos} Td (Rs ${mRow.balanceDue.toLocaleString()}) Tj ET`
      );
      yPos -= 14;
    });

    // 12M Total Row
    cmds.push("0.90 0.93 0.98 rg");
    cmds.push(`28 ${yPos - 4} 539.28 16 re f`);
    cmds.push("0.04 0.11 0.24 rg");
    cmds.push(`BT /F2 7 Tf 32 ${yPos} Td (TOTAL (12M)) Tj ET`);
    cmds.push(
      `BT /F2 6.8 Tf 162 ${yPos} Td (Rs ${(r.tuitionFee * 12).toLocaleString()}) Tj ET`
    );
    cmds.push(
      `BT /F2 6.8 Tf 215 ${yPos} Td (Rs ${(r.labAndActivityFee * 12).toLocaleString()}) Tj ET`
    );
    cmds.push(
      `BT /F2 6.8 Tf 265 ${yPos} Td (Rs ${(r.transportFee * 12).toLocaleString()}) Tj ET`
    );
    cmds.push(
      `BT /F2 6.8 Tf 312 ${yPos} Td (Rs ${(r.annualChargesMonthly * 12).toLocaleString()}) Tj ET`
    );
    cmds.push("0.05 0.55 0.25 rg");
    cmds.push(
      `BT /F2 6.8 Tf 362 ${yPos} Td (-Rs ${(r.scholarshipDiscount * 12).toLocaleString()}) Tj ET`
    );
    cmds.push("0.04 0.11 0.24 rg");
    cmds.push(
      `BT /F2 7 Tf 410 ${yPos} Td (Rs ${payable.toLocaleString()}) Tj ET`
    );
    cmds.push("0.05 0.55 0.25 rg");
    cmds.push(
      `BT /F2 7 Tf 465 ${yPos} Td (Rs ${paid.toLocaleString()}) Tj ET`
    );
    cmds.push(balance > 0 ? "0.75 0.15 0.15 rg" : "0.05 0.55 0.25 rg");
    cmds.push(
      `BT /F2 7 Tf 520 ${yPos} Td (Rs ${balance.toLocaleString()}) Tj ET`
    );
    yPos -= 24;
  }

  // Fee Head Summary Table
  cmds.push("0.04 0.11 0.24 rg");
  cmds.push(
    `BT /F2 8 Tf 28 ${yPos + 4} Td (${
      periodMode === "annual"
        ? "ANNUAL FEE HEAD SUMMARY (12 MONTHS)"
        : `MONTHLY FEE HEAD SUMMARY (${sanitizePdfText(selectedMonth)})`
    }) Tj ET`
  );
  yPos -= 16;

  cmds.push("0.06 0.15 0.30 rg");
  cmds.push(`28 ${yPos} 539.28 17 re f`);
  cmds.push("1 1 1 rg");
  cmds.push(`BT /F2 7 Tf 34 ${yPos + 5} Td (Fee Head Description) Tj ET`);
  cmds.push(`BT /F2 7 Tf 280 ${yPos + 5} Td (Monthly Rate) Tj ET`);
  cmds.push(`BT /F2 7 Tf 375 ${yPos + 5} Td (Frequency) Tj ET`);
  cmds.push(`BT /F2 7 Tf 485 ${yPos + 5} Td (Total Amount) Tj ET`);
  yPos -= 15;

  const summaryHeads = [
    {
      label: "Tuition Fee",
      monthly: `Rs ${r.tuitionFee.toLocaleString()}`,
      freq: periodMode === "annual" ? "12 Months (Jan-Dec)" : "1 Month",
      total: `Rs ${(r.tuitionFee * multiplier).toLocaleString()}`,
    },
    {
      label: "Science & Computer Lab / Activities",
      monthly: `Rs ${r.labAndActivityFee.toLocaleString()}`,
      freq: periodMode === "annual" ? "12 Months (Jan-Dec)" : "1 Month",
      total: `Rs ${(r.labAndActivityFee * multiplier).toLocaleString()}`,
    },
    {
      label: "School Transport Charges",
      monthly: `Rs ${r.transportFee.toLocaleString()}`,
      freq: periodMode === "annual" ? "12 Months (Jan-Dec)" : "1 Month",
      total: `Rs ${(r.transportFee * multiplier).toLocaleString()}`,
    },
    {
      label: "Annual Resource & Exam Fund",
      monthly: `Rs ${r.annualChargesMonthly.toLocaleString()}`,
      freq: periodMode === "annual" ? "Annualized (12M)" : "Monthly Prorated",
      total: `Rs ${(r.annualChargesMonthly * multiplier).toLocaleString()}`,
    },
    {
      label: "Scholarship / Sibling Concession",
      monthly: `-Rs ${r.scholarshipDiscount.toLocaleString()}`,
      freq: "Less Waiver",
      total: `-Rs ${(r.scholarshipDiscount * multiplier).toLocaleString()}`,
    },
    {
      label: "Net Payable Fee",
      monthly: `Rs ${r.monthlyPayable.toLocaleString()}`,
      freq: periodMode === "annual" ? "Annual (12M)" : selectedMonth,
      total: `Rs ${payable.toLocaleString()}`,
      bold: true,
    },
    {
      label: "Amount Realized / Paid",
      monthly: `Rs ${r.monthlyPaid.toLocaleString()}`,
      freq: r.paymentMode ?? "Recorded",
      total: `Rs ${paid.toLocaleString()}`,
      bold: true,
    },
    {
      label: "Closing Balance Due",
      monthly: "-",
      freq: balance === 0 ? "Cleared" : "Arrears",
      total: `Rs ${balance.toLocaleString()}`,
      bold: true,
    },
  ];

  summaryHeads.forEach((h, idx) => {
    if (h.bold) {
      cmds.push("0.92 0.95 0.99 rg");
      cmds.push(`28 ${yPos - 3} 539.28 15 re f`);
    } else if (idx % 2 === 0) {
      cmds.push("0.98 0.99 1 rg");
      cmds.push(`28 ${yPos - 3} 539.28 15 re f`);
    }
    cmds.push("0.08 0.12 0.20 rg");
    const font = h.bold ? "/F2" : "/F1";
    cmds.push(`BT ${font} 7.2 Tf 34 ${yPos} Td (${sanitizePdfText(h.label)}) Tj ET`);
    cmds.push(`BT ${font} 7.2 Tf 280 ${yPos} Td (${sanitizePdfText(h.monthly)}) Tj ET`);
    cmds.push(`BT ${font} 7 Tf 375 ${yPos} Td (${sanitizePdfText(h.freq)}) Tj ET`);
    cmds.push(`BT /F2 7.2 Tf 485 ${yPos} Td (${sanitizePdfText(h.total)}) Tj ET`);
    yPos -= 15;
  });

  // Footer
  cmds.push("0.4 0.45 0.5 rg");
  cmds.push("28 40 539.28 0.5 re f");
  cmds.push(
    "BT /F1 7 Tf 40 28 Td (Directorate of Finance  |  Official Student Fee Statement  |  EduSphere Multi-Campus) Tj ET"
  );

  const pdfBlob = buildMinimalPdf([cmds.join("\n")], "portrait");
  const safeName = r.student.replace(/[^a-zA-Z0-9]+/g, "-");
  triggerBlobDownload(
    pdfBlob,
    `Student-Fee-Statement-${safeName}-${periodMode}.pdf`
  );
  return true;
}

/* ───────────────────────── 4. Single Staff Salary Statement (Print & PDF) ───────────────────────── */

export function printSingleStaffSalaryStatement(
  r: StaffSalaryRecord,
  periodMode: ReportPeriodMode,
  selectedMonth: string
): boolean {
  if (typeof window === "undefined") return false;
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    window.print();
    return true;
  }

  const multiplier = periodMode === "annual" ? 12 : 1;
  const periodLabel = getPeriodLabel(periodMode, selectedMonth);
  const monthlyRows = buildStaffAnnualMonthlyRows(r);
  const otherAllowancesMonthly =
    r.medicalAllowance + r.conveyanceAllowance + r.specialAllowance;
  const otherDeductionsMonthly =
    r.providentFund + r.eobi + r.loanDeduction + r.unpaidLeaveDeduction;

  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const annualMonthlyTableHtml =
    periodMode === "annual"
      ? `
    <div class="section-title">
      <span>Month-by-Month Compensation &amp; Disbursal Schedule (January – December 2026 | 12 Months)</span>
      <span>Fiscal / Academic Session: 2026</span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 11%;">Month</th>
          <th style="width: 12%;">Voucher #</th>
          <th class="text-right" style="width: 10%;">Basic Pay</th>
          <th class="text-right" style="width: 9%;">HRA</th>
          <th class="text-right" style="width: 10%;">Med/Conv/Sp</th>
          <th class="text-right" style="width: 10%;">Gross Pay</th>
          <th class="text-right" style="width: 9%;">Inc. Tax</th>
          <th class="text-right" style="width: 9%;">PF/EOBI/Ln</th>
          <th class="text-right" style="width: 9%;">Total Ded.</th>
          <th class="text-right" style="width: 10%;">Net Pay</th>
          <th class="text-center" style="width: 7%;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${monthlyRows
          .map(
            (mRow, idx) => `
          <tr class="${idx % 2 === 0 ? "even" : ""}">
            <td class="font-bold">${mRow.month.shortName}</td>
            <td class="mono" style="font-size: 8px;">${mRow.voucherNo}</td>
            <td class="text-right mono">${formatCurrency(mRow.baseSalary)}</td>
            <td class="text-right mono">${formatCurrency(mRow.houseRentAllowance)}</td>
            <td class="text-right mono">${formatCurrency(mRow.otherAllowances)}</td>
            <td class="text-right mono font-bold">${formatCurrency(mRow.grossSalary)}</td>
            <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(mRow.taxDeduction)}</td>
            <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(
              mRow.providentFund + mRow.otherDeductions
            )}</td>
            <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(mRow.totalDeductions)}</td>
            <td class="text-right mono font-bold" style="color: #15803d;">${formatCurrency(mRow.netSalary)}</td>
            <td class="text-center"><span class="badge ${
              mRow.status === "Disbursed"
                ? "badge-paid"
                : mRow.status === "Approved"
                ? "badge-partial"
                : "badge-unpaid"
            }">${mRow.status}</span></td>
          </tr>`
          )
          .join("")}
        <tr class="total-row">
          <td colspan="2">TOTAL (JAN – DEC)</td>
          <td class="text-right mono">${formatCurrency(r.baseSalary * 12)}</td>
          <td class="text-right mono">${formatCurrency(r.houseRentAllowance * 12)}</td>
          <td class="text-right mono">${formatCurrency(otherAllowancesMonthly * 12)}</td>
          <td class="text-right mono">${formatCurrency(r.grossSalary * 12)}</td>
          <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(r.taxDeduction * 12)}</td>
          <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(otherDeductionsMonthly * 12)}</td>
          <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(r.totalDeductions * 12)}</td>
          <td class="text-right mono" style="color: #15803d;">${formatCurrency(r.netSalary * 12)}</td>
          <td class="text-center"><span class="badge badge-paid">12M</span></td>
        </tr>
      </tbody>
    </table>`
      : "";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Staff Salary Statement - ${r.name}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 10.5px;
    }
    .container {
      width: 100%;
      max-width: 100%;
      padding: 4px;
    }
    .banner {
      background: #091d3e;
      color: #ffffff;
      padding: 13px 16px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .banner h1 { margin: 0; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em; color: #ffffff; }
    .banner p { margin: 3px 0 0; font-size: 10.5px; color: #cbd5e1; font-weight: 500; }
    .banner-meta { text-align: right; font-size: 10px; color: #e2e8f0; line-height: 1.45; shrink: 0; }
    .banner-meta strong { color: #ffffff; }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 10px 0;
      padding: 10px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      background: #f8fafc;
    }
    .field-label { font-size: 8.5px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.03em; }
    .field-val { font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 2px; word-break: break-word; }
    .kpi-strip {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .kpi-box {
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      padding: 6px 9px;
      background: #ffffff;
    }
    .kpi-box-label { font-size: 8px; text-transform: uppercase; color: #64748b; font-weight: 700; }
    .kpi-box-val { font-size: 11.5px; font-weight: 800; color: #091d3e; margin-top: 2px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f1f5f9;
      border-left: 3.5px solid #091d3e;
      padding: 5px 10px;
      margin: 10px 0 5px 0;
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      color: #091d3e;
      letter-spacing: 0.02em;
    }
    table {
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    th {
      background: #0f274a;
      color: #ffffff;
      padding: 5.5px 6px;
      text-align: left;
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.01em;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    td {
      padding: 5px 6px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 9.5px;
      vertical-align: middle;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    tr.even { background-color: #f8fafc; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .font-bold { font-weight: 700; }
    .total-row td {
      font-weight: 800;
      background: #e2e8f0;
      border-top: 1.5px solid #0f274a;
      border-bottom: 1.5px solid #0f274a;
      padding: 6px;
    }
    .badge {
      display: inline-block;
      padding: 1.5px 4px;
      border-radius: 3px;
      font-size: 7.5px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-paid { background: #dcfce7; color: #15803d; }
    .badge-partial { background: #fef3c7; color: #b45309; }
    .badge-unpaid { background: #fee2e2; color: #b91c1c; }
    .sig-footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #475569;
      page-break-inside: avoid;
    }
    .sig-box { width: 165px; text-align: center; border-top: 1px solid #64748b; padding-top: 4px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="banner">
      <div>
        <h1>EduSphere Multi-Campus System</h1>
        <p>Official Staff Compensation Statement — ${periodLabel}</p>
      </div>
      <div class="banner-meta">
        <div>Emp Code: <strong>${r.empCode}</strong></div>
        <div>Status: <strong>${r.status}</strong></div>
        <div>Issued On: <strong>${generatedDate}</strong></div>
      </div>
    </div>

    <div class="grid">
      <div><div class="field-label">Employee Name &amp; CNIC</div><div class="field-val">${r.name} (${r.cnic})</div></div>
      <div><div class="field-label">Designation &amp; Dept</div><div class="field-val">${r.designation} · ${r.department}</div></div>
      <div><div class="field-label">Campus &amp; Category</div><div class="field-val">${r.campus} (${r.type})</div></div>
      <div><div class="field-label">Bank &amp; Account</div><div class="field-val">${r.bankName} · ${r.accountNumber}</div></div>
    </div>

    <div class="kpi-strip">
      <div class="kpi-box">
        <div class="kpi-box-label">Basic Salary (${periodMode === "annual" ? "12M" : "1M"})</div>
        <div class="kpi-box-val">${formatCurrency(r.baseSalary * multiplier)}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-box-label">Total Allowances</div>
        <div class="kpi-box-val">${formatCurrency((r.houseRentAllowance + otherAllowancesMonthly) * multiplier)}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-box-label">Gross Salary</div>
        <div class="kpi-box-val">${formatCurrency(r.grossSalary * multiplier)}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-box-label">Total Deductions</div>
        <div class="kpi-box-val" style="color: #b91c1c;">-${formatCurrency(r.totalDeductions * multiplier)}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-box-label">Net Take-Home Pay</div>
        <div class="kpi-box-val" style="color: #15803d;">${formatCurrency(r.netSalary * multiplier)}</div>
      </div>
    </div>

    ${annualMonthlyTableHtml}

    <div class="section-title">
      <span>${periodMode === "annual" ? "Annual Compensation & Deduction Head Summary (12 Months)" : `Monthly Salary Breakdown (${selectedMonth})`}</span>
      <span>Channel: ${r.paymentMode} (${r.iban})</span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 44%;">Compensation / Deduction Head</th>
          <th class="text-right" style="width: 18%;">Monthly Rate</th>
          <th class="text-center" style="width: 18%;">Head Category</th>
          <th class="text-right" style="width: 20%;">Amount (${periodMode === "annual" ? "Annual 12M" : "Monthly"})</th>
        </tr>
      </thead>
      <tbody>
        <tr class="even">
          <td class="font-bold">Basic Pay Scale</td>
          <td class="text-right mono">${formatCurrency(r.baseSalary)}</td>
          <td class="text-center">Base Earnings</td>
          <td class="text-right mono font-bold">${formatCurrency(r.baseSalary * multiplier)}</td>
        </tr>
        <tr>
          <td class="font-bold">House Rent Allowance (HRA)</td>
          <td class="text-right mono">${formatCurrency(r.houseRentAllowance)}</td>
          <td class="text-center">Allowance</td>
          <td class="text-right mono font-bold">${formatCurrency(r.houseRentAllowance * multiplier)}</td>
        </tr>
        <tr class="even">
          <td class="font-bold">Medical, Conveyance &amp; Special Allowance</td>
          <td class="text-right mono">${formatCurrency(otherAllowancesMonthly)}</td>
          <td class="text-center">Allowance</td>
          <td class="text-right mono font-bold">${formatCurrency(otherAllowancesMonthly * multiplier)}</td>
        </tr>
        <tr class="total-row">
          <td>Gross Salary Package</td>
          <td class="text-right mono">${formatCurrency(r.grossSalary)} / mo</td>
          <td class="text-center">${periodMode === "annual" ? "12 Months (Jan–Dec)" : selectedMonth}</td>
          <td class="text-right mono">${formatCurrency(r.grossSalary * multiplier)}</td>
        </tr>
        <tr>
          <td class="font-bold">Income Tax &amp; Statutory Withholding</td>
          <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(r.taxDeduction)}</td>
          <td class="text-center">Statutory Tax</td>
          <td class="text-right mono font-bold" style="color: #b91c1c;">-${formatCurrency(r.taxDeduction * multiplier)}</td>
        </tr>
        <tr class="even">
          <td class="font-bold">Provident Fund, EOBI &amp; Loan Recovery</td>
          <td class="text-right mono" style="color: #b91c1c;">-${formatCurrency(otherDeductionsMonthly)}</td>
          <td class="text-center">Deduction</td>
          <td class="text-right mono font-bold" style="color: #b91c1c;">-${formatCurrency(otherDeductionsMonthly * multiplier)}</td>
        </tr>
        <tr class="total-row">
          <td>Net Take-Home Disbursal</td>
          <td class="text-right mono" style="color: #15803d;">${formatCurrency(r.netSalary)} / mo</td>
          <td class="text-center">${r.paymentMode}</td>
          <td class="text-right mono" style="color: #15803d;">${formatCurrency(r.netSalary * multiplier)}</td>
        </tr>
      </tbody>
    </table>

    <div class="sig-footer">
      <div class="sig-box">Employee Signature</div>
      <div class="sig-box">HR &amp; Payroll Officer</div>
      <div class="sig-box">Director of Finance</div>
    </div>
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

export function exportSingleStaffSalaryStatementPdf(
  r: StaffSalaryRecord,
  periodMode: ReportPeriodMode,
  selectedMonth: string
): boolean {
  const multiplier = periodMode === "annual" ? 12 : 1;
  const periodLabel = getPeriodLabel(periodMode, selectedMonth);
  const monthlyRows = buildStaffAnnualMonthlyRows(r);
  const otherAllowancesMonthly =
    r.medicalAllowance + r.conveyanceAllowance + r.specialAllowance;
  const otherDeductionsMonthly =
    r.providentFund + r.eobi + r.loanDeduction + r.unpaidLeaveDeduction;

  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const cmds: string[] = [];

  // Header Banner
  cmds.push("0.04 0.11 0.24 rg");
  cmds.push("28 756 539.28 60 re f");
  cmds.push("1 1 1 rg");
  cmds.push("BT /F2 13 Tf 40 798 Td (EDUSPHERE MULTI-CAMPUS SYSTEM) Tj ET");
  cmds.push("0.85 0.90 0.98 rg");
  cmds.push(
    `BT /F2 8.5 Tf 40 783 Td (${sanitizePdfText(
      `Official Staff Compensation Statement - ${periodLabel}`
    )}) Tj ET`
  );
  cmds.push(
    `BT /F1 7.5 Tf 40 768 Td (Emp Code: ${sanitizePdfText(
      r.empCode
    )}  |  Status: ${sanitizePdfText(r.status)}  |  Issued: ${sanitizePdfText(
      generatedDate
    )}) Tj ET`
  );

  // Employee Profile Box
  cmds.push("0.97 0.98 1 rg");
  cmds.push("28 704 539.28 44 re f");
  cmds.push("0.82 0.86 0.92 RG 0.5 w");
  cmds.push("28 704 539.28 44 re S");

  cmds.push("0.08 0.12 0.20 rg");
  cmds.push(
    `BT /F2 8 Tf 36 733 Td (Employee: ${sanitizePdfText(
      `${r.name} (${r.empCode})`
    )}) Tj ET`
  );
  cmds.push(
    `BT /F2 8 Tf 300 733 Td (Designation: ${sanitizePdfText(
      `${r.designation} - ${r.department}`
    )}) Tj ET`
  );
  cmds.push(
    `BT /F1 7.5 Tf 36 715 Td (Campus: ${sanitizePdfText(
      `${r.campus} (${r.type})`
    )}  |  CNIC: ${sanitizePdfText(r.cnic)}) Tj ET`
  );
  cmds.push(
    `BT /F1 7.5 Tf 300 715 Td (Bank: ${sanitizePdfText(
      `${r.bankName} | A/C: ${r.accountNumber}`
    )}) Tj ET`
  );

  let yPos = 682;

  if (periodMode === "annual") {
    cmds.push("0.04 0.11 0.24 rg");
    cmds.push(
      `BT /F2 8 Tf 28 ${yPos + 4} Td (MONTH-BY-MONTH SALARY SCHEDULE (JANUARY - DECEMBER 2026 | 12 MONTHS)) Tj ET`
    );
    yPos -= 16;

    const cols = [
      { title: "Month", x: 32 },
      { title: "Voucher #", x: 86 },
      { title: "Basic Pay", x: 158 },
      { title: "HRA", x: 215 },
      { title: "Med/Conv", x: 265 },
      { title: "Gross Pay", x: 320 },
      { title: "Inc. Tax", x: 380 },
      { title: "PF/EOBI/Ln", x: 432 },
      { title: "Net Salary", x: 492 },
    ];

    cmds.push("0.06 0.15 0.30 rg");
    cmds.push(`28 ${yPos} 539.28 17 re f`);
    cmds.push("1 1 1 rg");
    for (const c of cols) {
      cmds.push(`BT /F2 6.8 Tf ${c.x} ${yPos + 5} Td (${c.title}) Tj ET`);
    }
    yPos -= 14;

    monthlyRows.forEach((mRow, idx) => {
      if (idx % 2 === 0) {
        cmds.push("0.97 0.98 1 rg");
        cmds.push(`28 ${yPos - 3} 539.28 14 re f`);
      }
      cmds.push("0.1 0.1 0.1 rg");
      cmds.push(
        `BT /F2 6.8 Tf 32 ${yPos} Td (${mRow.month.shortName}) Tj ET`
      );
      cmds.push(
        `BT /F1 6.5 Tf 86 ${yPos} Td (${sanitizePdfText(
          mRow.voucherNo
        )}) Tj ET`
      );
      cmds.push(
        `BT /F1 6.8 Tf 158 ${yPos} Td (Rs ${mRow.baseSalary.toLocaleString()}) Tj ET`
      );
      cmds.push(
        `BT /F1 6.8 Tf 215 ${yPos} Td (Rs ${mRow.houseRentAllowance.toLocaleString()}) Tj ET`
      );
      cmds.push(
        `BT /F1 6.8 Tf 265 ${yPos} Td (Rs ${mRow.otherAllowances.toLocaleString()}) Tj ET`
      );
      cmds.push(
        `BT /F2 6.8 Tf 320 ${yPos} Td (Rs ${mRow.grossSalary.toLocaleString()}) Tj ET`
      );
      cmds.push("0.75 0.15 0.15 rg");
      cmds.push(
        `BT /F1 6.8 Tf 380 ${yPos} Td (-Rs ${mRow.taxDeduction.toLocaleString()}) Tj ET`
      );
      cmds.push(
        `BT /F1 6.8 Tf 432 ${yPos} Td (-Rs ${(
          mRow.providentFund + mRow.otherDeductions
        ).toLocaleString()}) Tj ET`
      );
      cmds.push("0.05 0.55 0.25 rg");
      cmds.push(
        `BT /F2 6.8 Tf 492 ${yPos} Td (Rs ${mRow.netSalary.toLocaleString()}) Tj ET`
      );
      yPos -= 14;
    });

    // 12M Total Row
    cmds.push("0.90 0.93 0.98 rg");
    cmds.push(`28 ${yPos - 4} 539.28 16 re f`);
    cmds.push("0.04 0.11 0.24 rg");
    cmds.push(`BT /F2 7 Tf 32 ${yPos} Td (TOTAL (12M)) Tj ET`);
    cmds.push(
      `BT /F2 6.8 Tf 158 ${yPos} Td (Rs ${(r.baseSalary * 12).toLocaleString()}) Tj ET`
    );
    cmds.push(
      `BT /F2 6.8 Tf 215 ${yPos} Td (Rs ${(r.houseRentAllowance * 12).toLocaleString()}) Tj ET`
    );
    cmds.push(
      `BT /F2 6.8 Tf 265 ${yPos} Td (Rs ${(otherAllowancesMonthly * 12).toLocaleString()}) Tj ET`
    );
    cmds.push(
      `BT /F2 6.8 Tf 320 ${yPos} Td (Rs ${(r.grossSalary * 12).toLocaleString()}) Tj ET`
    );
    cmds.push("0.75 0.15 0.15 rg");
    cmds.push(
      `BT /F2 6.8 Tf 380 ${yPos} Td (-Rs ${(r.taxDeduction * 12).toLocaleString()}) Tj ET`
    );
    cmds.push(
      `BT /F2 6.8 Tf 432 ${yPos} Td (-Rs ${(otherDeductionsMonthly * 12).toLocaleString()}) Tj ET`
    );
    cmds.push("0.05 0.55 0.25 rg");
    cmds.push(
      `BT /F2 7 Tf 492 ${yPos} Td (Rs ${(r.netSalary * 12).toLocaleString()}) Tj ET`
    );
    yPos -= 24;
  }

  // Compensation Summary Table
  cmds.push("0.04 0.11 0.24 rg");
  cmds.push(
    `BT /F2 8 Tf 28 ${yPos + 4} Td (${
      periodMode === "annual"
        ? "ANNUAL COMPENSATION & DEDUCTION SUMMARY (12 MONTHS)"
        : `MONTHLY SALARY SUMMARY (${sanitizePdfText(selectedMonth)})`
    }) Tj ET`
  );
  yPos -= 16;

  cmds.push("0.06 0.15 0.30 rg");
  cmds.push(`28 ${yPos} 539.28 17 re f`);
  cmds.push("1 1 1 rg");
  cmds.push(`BT /F2 7 Tf 34 ${yPos + 5} Td (Compensation / Deduction Head) Tj ET`);
  cmds.push(`BT /F2 7 Tf 280 ${yPos + 5} Td (Monthly Rate) Tj ET`);
  cmds.push(`BT /F2 7 Tf 375 ${yPos + 5} Td (Category) Tj ET`);
  cmds.push(`BT /F2 7 Tf 485 ${yPos + 5} Td (Total Amount) Tj ET`);
  yPos -= 15;

  const summaryHeads = [
    {
      label: "Basic Pay Scale",
      monthly: `Rs ${r.baseSalary.toLocaleString()}`,
      cat: "Earnings",
      total: `Rs ${(r.baseSalary * multiplier).toLocaleString()}`,
    },
    {
      label: "House Rent Allowance (HRA)",
      monthly: `Rs ${r.houseRentAllowance.toLocaleString()}`,
      cat: "Allowance",
      total: `Rs ${(r.houseRentAllowance * multiplier).toLocaleString()}`,
    },
    {
      label: "Medical, Conveyance & Special Allowance",
      monthly: `Rs ${otherAllowancesMonthly.toLocaleString()}`,
      cat: "Allowance",
      total: `Rs ${(otherAllowancesMonthly * multiplier).toLocaleString()}`,
    },
    {
      label: "Gross Salary Package",
      monthly: `Rs ${r.grossSalary.toLocaleString()}`,
      cat: periodMode === "annual" ? "Annual (12M)" : selectedMonth,
      total: `Rs ${(r.grossSalary * multiplier).toLocaleString()}`,
      bold: true,
    },
    {
      label: "Income Tax & Statutory Withholding",
      monthly: `-Rs ${r.taxDeduction.toLocaleString()}`,
      cat: "Deduction",
      total: `-Rs ${(r.taxDeduction * multiplier).toLocaleString()}`,
    },
    {
      label: "Provident Fund, EOBI & Loan Recovery",
      monthly: `-Rs ${otherDeductionsMonthly.toLocaleString()}`,
      cat: "Deduction",
      total: `-Rs ${(otherDeductionsMonthly * multiplier).toLocaleString()}`,
    },
    {
      label: "Net Take-Home Disbursal",
      monthly: `Rs ${r.netSalary.toLocaleString()}`,
      cat: r.paymentMode,
      total: `Rs ${(r.netSalary * multiplier).toLocaleString()}`,
      bold: true,
    },
  ];

  summaryHeads.forEach((h, idx) => {
    if (h.bold) {
      cmds.push("0.92 0.95 0.99 rg");
      cmds.push(`28 ${yPos - 3} 539.28 15 re f`);
    } else if (idx % 2 === 0) {
      cmds.push("0.98 0.99 1 rg");
      cmds.push(`28 ${yPos - 3} 539.28 15 re f`);
    }
    cmds.push("0.08 0.12 0.20 rg");
    const font = h.bold ? "/F2" : "/F1";
    cmds.push(`BT ${font} 7.2 Tf 34 ${yPos} Td (${sanitizePdfText(h.label)}) Tj ET`);
    cmds.push(`BT ${font} 7.2 Tf 280 ${yPos} Td (${sanitizePdfText(h.monthly)}) Tj ET`);
    cmds.push(`BT ${font} 7 Tf 375 ${yPos} Td (${sanitizePdfText(h.cat)}) Tj ET`);
    cmds.push(`BT /F2 7.2 Tf 485 ${yPos} Td (${sanitizePdfText(h.total)}) Tj ET`);
    yPos -= 15;
  });

  // Footer
  cmds.push("0.4 0.45 0.5 rg");
  cmds.push("28 40 539.28 0.5 re f");
  cmds.push(
    "BT /F1 7 Tf 40 28 Td (Directorate of Finance  |  Official Staff Salary Statement  |  EduSphere Multi-Campus) Tj ET"
  );

  const pdfBlob = buildMinimalPdf([cmds.join("\n")], "portrait");
  const safeName = r.name.replace(/[^a-zA-Z0-9]+/g, "-");
  triggerBlobDownload(
    pdfBlob,
    `Staff-Salary-Statement-${safeName}-${periodMode}.pdf`
  );
  return true;
}
