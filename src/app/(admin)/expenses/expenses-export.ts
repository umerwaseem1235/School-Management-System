import type {
  ExpenseBudgetRecord,
  ExpenseVoucherRecord,
} from "@/lib/mock/expenses";
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

function pdfText(
  x: number,
  y: number,
  text: string,
  font: "F1" | "F2" = "F1",
  size = 9,
  rgb: [number, number, number] = [0.08, 0.12, 0.2]
): string {
  const [r, g, b] = rgb;
  return `BT /${font} ${size} Tf ${r} ${g} ${b} rg ${x} ${y} Td (${sanitizePdfText(
    text
  )}) Tj ET\n`;
}

function pdfRect(
  x: number,
  y: number,
  w: number,
  h: number,
  fillRgb: [number, number, number]
): string {
  const [r, g, b] = fillRgb;
  return `${r} ${g} ${b} rg ${x} ${y} ${w} ${h} re f\n`;
}

/* ───────────────────── Bulk PDF Exports ───────────────────── */

export function exportExpensesPdf(vouchers: ExpenseVoucherRecord[]) {
  const rowsPerPage = 18;
  const totalPages = Math.max(1, Math.ceil(vouchers.length / rowsPerPage));
  const streams: string[] = [];
  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  for (let p = 0; p < totalPages; p++) {
    const slice = vouchers.slice(p * rowsPerPage, (p + 1) * rowsPerPage);
    let s = "";

    s += pdfRect(28, 526, 785, 46, [0.04, 0.11, 0.24]);
    s += pdfText(
      40,
      558,
      "EDUSPHERE MULTI-CAMPUS SYSTEM",
      "F2",
      12.5,
      [1, 1, 1]
    );
    s += pdfText(
      40,
      544,
      "Institutional Expense Vouchers Register",
      "F2",
      9,
      [0.85, 0.9, 0.98]
    );
    s += pdfText(
      40,
      532,
      `Scope: Multi-Campus System  |  Generated: ${generatedDate}  |  Total Vouchers: ${vouchers.length}  |  Page ${p + 1} of ${totalPages}`,
      "F1",
      7.5,
      [0.82, 0.88, 0.96]
    );

    s += pdfRect(28, 502, 785, 20, [0.93, 0.95, 0.98]);
    s += pdfText(34, 509, "Voucher #", "F2", 8);
    s += pdfText(115, 509, "Expense Title & Category", "F2", 8);
    s += pdfText(315, 509, "Vendor / Payee", "F2", 8);
    s += pdfText(465, 509, "Campus", "F2", 8);
    s += pdfText(540, 509, "Gross Amt", "F2", 8);
    s += pdfText(615, 509, "Tax / WHT", "F2", 8);
    s += pdfText(690, 509, "Net Payable", "F2", 8);
    s += pdfText(765, 509, "Status", "F2", 8);

    let y = 485;
    slice.forEach((v, idx) => {
      if (idx % 2 === 1) {
        s += pdfRect(28, y - 5, 785, 20, [0.975, 0.982, 0.992]);
      }
      s += pdfText(34, y, v.voucherNo, "F2", 7.5);
      s += pdfText(
        115,
        y,
        `${v.title.slice(0, 28)} (${v.category.slice(0, 14)})`,
        "F1",
        7.5
      );
      s += pdfText(315, y, v.vendorName.slice(0, 25), "F1", 7.5);
      s += pdfText(465, y, v.campus.slice(0, 12), "F1", 7.5);
      s += pdfText(540, y, formatCurrency(v.grossAmount), "F1", 7.5);
      s += pdfText(
        615,
        y,
        `+${v.taxAmount / 1000}k/-${v.whtDeduction / 1000}k`,
        "F1",
        7.5
      );
      s += pdfText(
        690,
        y,
        formatCurrency(v.netPayable),
        "F2",
        7.5,
        [0.04, 0.32, 0.18]
      );
      s += pdfText(765, y, v.status, "F2", 7.5);
      y -= 22;
    });

    streams.push(s);
  }

  const blob = buildMinimalPdf(streams, "landscape");
  triggerBlobDownload(blob, "institutional-expenses-register.pdf");
}

export function exportBudgetsPdf(budgets: ExpenseBudgetRecord[]) {
  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  let s = "";
  s += pdfRect(28, 526, 785, 46, [0.04, 0.11, 0.24]);
  s += pdfText(
    40,
    558,
    "EDUSPHERE MULTI-CAMPUS SYSTEM",
    "F2",
    12.5,
    [1, 1, 1]
  );
  s += pdfText(
    40,
    544,
    "Category Budgets & Spending Controls Register",
    "F2",
    9,
    [0.85, 0.9, 0.98]
  );
  s += pdfText(
    40,
    532,
    `Scope: Multi-Campus System  |  Generated: ${generatedDate}  |  Total Cost Centers: ${budgets.length}`,
    "F1",
    7.5,
    [0.82, 0.88, 0.96]
  );

  s += pdfRect(28, 502, 785, 20, [0.93, 0.95, 0.98]);
  s += pdfText(34, 509, "Budget Code", "F2", 8);
  s += pdfText(115, 509, "Category & Department", "F2", 8);
  s += pdfText(300, 509, "Custodian", "F2", 8);
  s += pdfText(430, 509, "Monthly Budget", "F2", 8);
  s += pdfText(525, 509, "Monthly Spent", "F2", 8);
  s += pdfText(620, 509, "YTD Utilized", "F2", 8);
  s += pdfText(740, 509, "Status", "F2", 8);

  let y = 485;
  budgets.forEach((b, idx) => {
    if (idx % 2 === 1) {
      s += pdfRect(28, y - 5, 785, 22, [0.975, 0.982, 0.992]);
    }
    s += pdfText(34, y, b.budgetCode, "F2", 8);
    s += pdfText(115, y, `${b.category} (${b.department})`, "F1", 8);
    s += pdfText(300, y, b.custodian, "F1", 8);
    s += pdfText(430, y, formatCurrency(b.monthlyAllocation), "F2", 8);
    s += pdfText(525, y, formatCurrency(b.monthlySpent), "F1", 8);
    s += pdfText(
      620,
      y,
      `${formatCurrency(b.ytdSpent)} / ${formatCurrency(b.ytdAllocation)}`,
      "F1",
      8
    );
    s += pdfText(740, y, b.status, "F2", 8);
    y -= 24;
  });

  const blob = buildMinimalPdf([s], "landscape");
  triggerBlobDownload(blob, "category-budgets-register.pdf");
}

/* ───────────────────── Single Expense Voucher Slip (PDF) ───────────────────── */

export function exportSingleExpenseVoucherPdf(voucher: ExpenseVoucherRecord) {
  let s = "";
  s += pdfRect(36, 742, 523, 62, [0.04, 0.11, 0.24]);
  s += pdfText(
    48,
    786,
    "EDUSPHERE MULTI-CAMPUS SYSTEM",
    "F2",
    13,
    [1, 1, 1]
  );
  s += pdfText(
    48,
    770,
    "Institutional Expense Disbursement Voucher",
    "F2",
    9.5,
    [0.85, 0.9, 0.98]
  );
  s += pdfText(
    48,
    754,
    `Voucher #: ${voucher.voucherNo}  |  Invoice #: ${voucher.invoiceNo}  |  Date: ${voucher.date}`,
    "F1",
    8,
    [0.82, 0.88, 0.96]
  );

  s += pdfText(50, 718, `Expense Head: ${voucher.title}`, "F2", 10);
  s += pdfText(
    50,
    702,
    `Category: ${voucher.category}  |  Department: ${voucher.department}  |  Campus: ${voucher.campus}`,
    "F1",
    9
  );
  s += pdfText(
    50,
    686,
    `Vendor: ${voucher.vendorName} (${voucher.vendorNtn})  |  Bank: ${voucher.vendorBank} (${voucher.vendorAccountNo})`,
    "F1",
    9
  );

  s += pdfRect(36, 578, 523, 90, [0.94, 0.97, 0.95]);
  s += pdfText(
    50,
    648,
    "FINANCIAL & TAXATION BREAKDOWN",
    "F2",
    10,
    [0.04, 0.3, 0.18]
  );
  s += pdfText(
    50,
    630,
    `Gross Invoice Amount:     ${formatCurrency(voucher.grossAmount)}`,
    "F1",
    9.5
  );
  s += pdfText(
    50,
    614,
    `Add GST / Sales Tax:      +${formatCurrency(voucher.taxAmount)}`,
    "F1",
    9.5
  );
  s += pdfText(
    50,
    598,
    `Less WHT Deducted:        -${formatCurrency(voucher.whtDeduction)}`,
    "F1",
    9.5
  );
  s += pdfText(
    50,
    584,
    `Net Payable Disbursed:    ${formatCurrency(voucher.netPayable)} (${voucher.paymentMode} | Ref: ${voucher.paymentRef})`,
    "F2",
    10
  );

  const blob = buildMinimalPdf([s], "portrait");
  triggerBlobDownload(blob, `${voucher.voucherNo}-expense-voucher.pdf`);
}

/* ───────────────────── Print Previews ───────────────────── */

export function printExpensesRegister(vouchers: ExpenseVoucherRecord[]): boolean {
  const win = window.open("", "_blank", "width=1100,height=800");
  if (!win) return false;

  const rowsHtml = vouchers
    .map(
      (v) => `
      <tr>
        <td><strong>${v.voucherNo}</strong><br/><span class="sub">${formatDate(v.date)} · ${v.invoiceNo}</span></td>
        <td><strong>${v.title}</strong><br/><span class="sub">${v.category} · ${v.department}</span></td>
        <td><strong>${v.vendorName}</strong><br/><span class="sub">${v.vendorNtn} · ${v.paymentMode}</span></td>
        <td>${v.campus}</td>
        <td class="mono">${formatCurrency(v.grossAmount)}</td>
        <td class="mono">+${formatCurrency(v.taxAmount)}<br/><span class="sub">WHT: -${formatCurrency(v.whtDeduction)}</span></td>
        <td class="mono"><strong>${formatCurrency(v.netPayable)}</strong></td>
        <td><span class="badge">${v.status}</span></td>
      </tr>`
    )
    .join("");

  win.document.write(`<!DOCTYPE html>
  <html>
    <head>
      <title>Institutional Expenses Register - EduSphere</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 24px; color: #0f172a; }
        .banner { background: #091d3e; color: #fff; padding: 14px 18px; border-radius: 6px; margin-bottom: 16px; }
        .banner h1 { font-size: 16px; margin: 0 0 4px; color: #fff; letter-spacing: 0.02em; font-weight: 800; }
        .banner .subhead { font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 4px; }
        .banner p.meta { font-size: 11px; color: #94a3b8; margin: 0; }
        table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; vertical-align: top; }
        th { background: #f1f5f9; font-weight: 700; color: #091d3e; }
        .sub { color: #64748b; font-size: 10.5px; }
        .mono { font-family: ui-monospace, monospace; font-size: 11px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; background: #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="banner">
        <h1>EDUSPHERE MULTI-CAMPUS SYSTEM</h1>
        <div class="subhead">Institutional Expense Vouchers Register</div>
        <p class="meta">EduSphere Finance &amp; Treasury · Total Vouchers: ${vouchers.length}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Voucher &amp; Date</th>
            <th>Expense Head &amp; Category</th>
            <th>Vendor &amp; Channel</th>
            <th>Campus</th>
            <th>Gross Amount</th>
            <th>GST &amp; WHT</th>
            <th>Net Payable</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <script>window.onload = () => { window.print(); };</script>
    </body>
  </html>`);
  win.document.close();
  return true;
}

export function printSingleExpenseVoucher(
  voucher: ExpenseVoucherRecord
): boolean {
  const win = window.open("", "_blank", "width=850,height=700");
  if (!win) return false;

  win.document.write(`<!DOCTYPE html>
  <html>
    <head>
      <title>Expense Voucher - ${voucher.voucherNo}</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 32px; color: #0f172a; }
        .banner { background: #091d3e; color: #fff; padding: 14px 18px; border-radius: 8px; margin-bottom: 16px; }
        .banner h1 { font-size: 15px; margin: 0 0 3px; color: #fff; letter-spacing: 0.04em; font-weight: 800; }
        .banner .subhead { font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 3px; }
        .banner p.meta { font-size: 10.5px; color: #94a3b8; margin: 0; }
        .card { border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 18px; }
        h2 { font-size: 14px; margin: 0 0 12px; color: #091d3e; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px dashed #e2e8f0; }
        .mono { font-family: ui-monospace, monospace; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="banner">
        <h1>EDUSPHERE MULTI-CAMPUS SYSTEM</h1>
        <div class="subhead">Institutional Expense Payment Voucher</div>
        <p class="meta">Voucher #${voucher.voucherNo} · Invoice #${voucher.invoiceNo} · Date: ${formatDate(voucher.date)} · Status: ${voucher.status}</p>
      </div>
      <div class="card">
        <h2>1. Expense &amp; Vendor Details</h2>
        <div class="row"><span>Expense Title:</span><strong>${voucher.title}</strong></div>
        <div class="row"><span>Category &amp; Dept:</span><strong>${voucher.category} (${voucher.department}) — ${voucher.campus}</strong></div>
        <div class="row"><span>Payee / Vendor:</span><strong>${voucher.vendorName} (${voucher.vendorNtn})</strong></div>
        <div class="row"><span>Bank &amp; Account:</span><span class="mono">${voucher.vendorBank} · ${voucher.vendorAccountNo}</span></div>
      </div>
      <div class="card">
        <h2>2. Financial &amp; Tax Calculation</h2>
        <div class="row"><span>Gross Invoice Amount:</span><span class="mono">${formatCurrency(voucher.grossAmount)}</span></div>
        <div class="row"><span>GST / Sales Tax Included:</span><span class="mono">+${formatCurrency(voucher.taxAmount)}</span></div>
        <div class="row"><span>Withholding Tax (WHT Deducted):</span><span class="mono">-${formatCurrency(voucher.whtDeduction)}</span></div>
        <div class="row"><span>Net Payable Amount:</span><span class="mono" style="color:#047857;font-size:15px;">${formatCurrency(voucher.netPayable)}</span></div>
        <div class="row"><span>Payment Channel &amp; Ref:</span><span class="mono">${voucher.paymentMode} (${voucher.paymentRef})</span></div>
      </div>
      <script>window.onload = () => { window.print(); };</script>
    </body>
  </html>`);
  win.document.close();
  return true;
}
