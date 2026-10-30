import { formatDate, formatNumber } from "@/lib/format";
import { printHtml } from "@/lib/print-html";
import type {
  InventoryItemRecord,
  StockIssuanceRecord,
} from "@/lib/mock/inventory";

function escapePdf(s: string): string {
  return s
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function pdfText(
  x: number,
  y: number,
  text: string,
  font: "F1" | "F2" = "F1",
  size = 9,
  rgb: [number, number, number] = [0.08, 0.12, 0.2]
): string {
  return `BT /${font} ${size} Tf ${rgb[0]} ${rgb[1]} ${rgb[2]} rg ${x} ${y} Td (${escapePdf(
    text
  )}) Tj ET\n`;
}

function pdfRect(
  x: number,
  y: number,
  w: number,
  h: number,
  rgb: [number, number, number]
): string {
  return `${rgb[0]} ${rgb[1]} ${rgb[2]} rg ${x} ${y} ${w} ${h} re f\n`;
}

function buildMultiPagePdf(streams: string[], width = 842, height = 595): Blob {
  const objects: string[] = [];
  const pageCount = streams.length;
  const firstPageObj = 5;

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  const kids = Array.from(
    { length: pageCount },
    (_, i) => `${firstPageObj + i * 2} 0 R`
  ).join(" ");
  objects.push(
    `2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>\nendobj\n`
  );
  objects.push(
    "3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
  );
  objects.push(
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n"
  );

  streams.forEach((stream, idx) => {
    const pageObjNum = firstPageObj + idx * 2;
    const contentObjNum = pageObjNum + 1;
    objects.push(
      `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjNum} 0 R >>\nendobj\n`
    );
    objects.push(
      `${contentObjNum} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`
    );
  });

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function exportInventoryStockPdf(items: InventoryItemRecord[]) {
  const rowsPerPage = 18;
  const pages: InventoryItemRecord[][] = [];
  for (let i = 0; i < items.length; i += rowsPerPage) {
    pages.push(items.slice(i, i + rowsPerPage));
  }
  if (pages.length === 0) pages.push([]);

  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
  const lowCount = items.filter((i) => i.status !== "In Stock").length;

  const streams = pages.map((pageRows, pageIdx) => {
    let s = "";
    s += pdfRect(0, 535, 842, 60, [0.035, 0.114, 0.243]);
    s += pdfText(
      36,
      565,
      "AL-NOOR INTERNATIONAL SCHOOL SYSTEM — STORE INVENTORY REGISTER",
      "F2",
      13,
      [1, 1, 1]
    );
    s += pdfText(
      36,
      548,
      `Total Items: ${items.length}   |   Total Available Units: ${formatNumber(
        totalUnits
      )}   |   Low/Out of Stock Alerts: ${lowCount}   |   Page ${pageIdx + 1} of ${
        pages.length
      }`,
      "F1",
      8.5,
      [0.82, 0.88, 0.96]
    );

    s += pdfRect(36, 502, 770, 22, [0.93, 0.95, 0.98]);
    s += pdfText(46, 510, "SKU", "F2", 8.5);
    s += pdfText(130, 510, "Item Name", "F2", 8.5);
    s += pdfText(380, 510, "Category", "F2", 8.5);
    s += pdfText(530, 510, "Available Qty", "F2", 8.5);
    s += pdfText(640, 510, "Reorder At", "F2", 8.5);
    s += pdfText(730, 510, "Status", "F2", 8.5);

    let y = 484;
    pageRows.forEach((row, idx) => {
      if (idx % 2 === 1) {
        s += pdfRect(36, y - 6, 770, 20, [0.975, 0.98, 0.99]);
      }
      s += pdfText(46, y, row.sku, "F2", 8.5);
      s += pdfText(130, y, row.name.slice(0, 42), "F1", 8.5);
      s += pdfText(380, y, row.category, "F1", 8.5);
      s += pdfText(
        530,
        y,
        `${formatNumber(row.quantity)} ${row.unit}`,
        "F2",
        8.5
      );
      s += pdfText(
        640,
        y,
        `${formatNumber(row.reorderLevel)} ${row.unit}`,
        "F1",
        8.5
      );
      s += pdfText(730, y, row.status, "F2", 8.5);
      y -= 22;
    });

    return s;
  });

  const blob = buildMultiPagePdf(streams);
  triggerDownload(blob, "store-inventory-register.pdf");
}

export function printInventoryRegister(items: InventoryItemRecord[]): boolean {
  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
  const lowCount = items.filter((i) => i.status !== "In Stock").length;

  const rowsHtml = items
    .map(
      (r) => `
      <tr>
        <td class="mono">${r.sku}</td>
        <td><strong>${r.name}</strong></td>
        <td>${r.category}</td>
        <td class="mono center"><strong>${formatNumber(r.quantity)}</strong></td>
        <td class="mono center">${formatNumber(r.reorderLevel)}</td>
        <td class="center">${r.status}</td>
        <td class="mono center">${formatDate(r.lastUpdated)}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Store Stock Register</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 28px; color: #0f172a; }
    h1 { margin: 0 0 6px; font-size: 18px; color: #091d3e; }
    p.sub { margin: 0 0 18px; font-size: 12px; color: #475569; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
    th { background: #f1f5f9; font-weight: 700; color: #091d3e; }
    .mono { font-family: ui-monospace, monospace; }
    .center { text-align: center; }
  </style>
</head>
<body>
  <h1>Store Stock Inventory Register</h1>
  <p class="sub">Total Items: ${items.length} &middot; Total Available Units: ${formatNumber(
    totalUnits
  )} &middot; Low/Out of Stock Alerts: ${lowCount}</p>
  <table>
    <thead>
      <tr>
        <th>SKU #</th>
        <th>Item Name</th>
        <th>Category</th>
        <th class="center">Qty</th>
        <th class="center">Reorder At</th>
        <th class="center">Status</th>
        <th class="center">Last Updated</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</body>
</html>`;

  return printHtml(html);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Stock Issuance Register — PDF & Print                                      */
/* ────────────────────────────────────────────────────────────────────────── */

function issuanceStatusLabel(r: StockIssuanceRecord): string {
  return r.status === "Issued" ? "Pending Return" : r.status;
}

export function exportIssuanceRegisterPdf(records: StockIssuanceRecord[]) {
  const rowsPerPage = 18;
  const pages: StockIssuanceRecord[][] = [];
  for (let i = 0; i < records.length; i += rowsPerPage) {
    pages.push(records.slice(i, i + rowsPerPage));
  }
  if (pages.length === 0) pages.push([]);

  const totalUnits = records.reduce((s, r) => s + r.quantity, 0);
  const pending = records.filter((r) => r.status === "Issued").length;

  const streams = pages.map((pageRows, pageIdx) => {
    let s = "";
    s += pdfRect(0, 535, 842, 60, [0.035, 0.114, 0.243]);
    s += pdfText(
      36,
      565,
      "AL-NOOR INTERNATIONAL SCHOOL SYSTEM — STOCK ISSUANCE REGISTER",
      "F2",
      13,
      [1, 1, 1]
    );
    s += pdfText(
      36,
      548,
      `Total Issuances: ${records.length}   |   Units Issued: ${formatNumber(
        totalUnits
      )}   |   Pending Returns: ${pending}   |   Page ${pageIdx + 1} of ${pages.length}`,
      "F1",
      8.5,
      [0.82, 0.88, 0.96]
    );

    s += pdfRect(36, 502, 770, 22, [0.93, 0.95, 0.98]);
    s += pdfText(44, 510, "Issue #", "F2", 8.5);
    s += pdfText(104, 510, "Date", "F2", 8.5);
    s += pdfText(172, 510, "Item", "F2", 8.5);
    s += pdfText(360, 510, "Qty", "F2", 8.5);
    s += pdfText(420, 510, "Issued To", "F2", 8.5);
    s += pdfText(560, 510, "Department", "F2", 8.5);
    s += pdfText(670, 510, "Type", "F2", 8.5);
    s += pdfText(735, 510, "Status", "F2", 8.5);

    let y = 484;
    pageRows.forEach((r, idx) => {
      if (idx % 2 === 1) {
        s += pdfRect(36, y - 6, 770, 20, [0.975, 0.98, 0.99]);
      }
      s += pdfText(44, y, r.issueNo, "F2", 8);
      s += pdfText(104, y, formatDate(r.issueDate), "F1", 8);
      s += pdfText(172, y, r.itemName.slice(0, 34), "F1", 8);
      s += pdfText(360, y, `${formatNumber(r.quantity)} ${r.unit}`.slice(0, 12), "F2", 8);
      s += pdfText(420, y, r.issuedTo.slice(0, 26), "F1", 8);
      s += pdfText(560, y, r.department.slice(0, 20), "F1", 8);
      s += pdfText(670, y, r.issuanceType, "F1", 8);
      s += pdfText(735, y, issuanceStatusLabel(r), "F2", 8);
      y -= 22;
    });
    return s;
  });

  const blob = buildMultiPagePdf(streams);
  triggerDownload(blob, "stock-issuance-register.pdf");
}

export function printIssuanceRegister(records: StockIssuanceRecord[]): boolean {
  const totalUnits = records.reduce((s, r) => s + r.quantity, 0);
  const pending = records.filter((r) => r.status === "Issued").length;

  const rowsHtml = records
    .map(
      (r) => `
      <tr>
        <td class="mono">${r.issueNo}</td>
        <td class="mono">${formatDate(r.issueDate)}</td>
        <td><strong>${r.itemName}</strong><br/><span class="muted">${r.itemSku}</span></td>
        <td class="mono center"><strong>${formatNumber(r.quantity)}</strong> ${r.unit}</td>
        <td><strong>${r.issuedTo}</strong><br/><span class="muted">${r.issueeRole}</span></td>
        <td>${r.department}</td>
        <td>${r.purpose}</td>
        <td class="center">${r.issuanceType}</td>
        <td class="center">${issuanceStatusLabel(r)}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Stock Issuance Register</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 28px; color: #0f172a; }
    h1 { margin: 0 0 6px; font-size: 18px; color: #091d3e; }
    p.sub { margin: 0 0 18px; font-size: 12px; color: #475569; }
    table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
    th, td { border: 1px solid #cbd5e1; padding: 7px 9px; text-align: left; vertical-align: top; }
    th { background: #f1f5f9; font-weight: 700; color: #091d3e; }
    .mono { font-family: ui-monospace, monospace; }
    .center { text-align: center; }
    .muted { color: #64748b; font-size: 10.5px; }
  </style>
</head>
<body>
  <h1>Stock Issuance Register</h1>
  <p class="sub">Total Issuances: ${records.length} &middot; Units Issued: ${formatNumber(
    totalUnits
  )} &middot; Pending Returns: ${pending}</p>
  <table>
    <thead>
      <tr>
        <th>Issue #</th><th>Date</th><th>Item</th><th class="center">Qty</th>
        <th>Issued To</th><th>Department</th><th>Purpose</th>
        <th class="center">Type</th><th class="center">Status</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</body>
</html>`;

  return printHtml(html);
}
