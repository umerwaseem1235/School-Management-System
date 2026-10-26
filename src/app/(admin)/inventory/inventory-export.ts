import type {
  DepartmentalIssuanceRecord,
  InventoryItemRecord,
  InventorySupplierRecord,
  PurchaseOrderRecord,
} from "@/lib/mock/inventory";
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

/* ───────────────────── 1. Bulk Store Stock Register PDF ───────────────────── */

export function exportInventoryStockPdf(items: InventoryItemRecord[]) {
  const rowsPerPage = 18;
  const totalPages = Math.max(1, Math.ceil(items.length / rowsPerPage));
  const streams: string[] = [];
  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const totalValuation = items.reduce((s, i) => s + i.totalValue, 0);

  for (let p = 0; p < totalPages; p++) {
    const slice = items.slice(p * rowsPerPage, (p + 1) * rowsPerPage);
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
      "Institutional Store Stock & Asset Valuation Register",
      "F2",
      9,
      [0.85, 0.9, 0.98]
    );
    s += pdfText(
      40,
      532,
      `Generated: ${generatedDate}  |  Total SKUs: ${items.length}  |  Total Valuation: ${formatCurrency(
        totalValuation
      )}`,
      "F1",
      7.5,
      [0.74, 0.82, 0.92]
    );
    s += pdfText(
      730,
      548,
      `Page ${p + 1} of ${totalPages}`,
      "F2",
      9,
      [1, 1, 1]
    );

    const cols = [
      { x: 34, label: "SKU #" },
      { x: 105, label: "Item Name & Category" },
      { x: 295, label: "Campus & Store Rack" },
      { x: 445, label: "Stock Qty" },
      { x: 525, label: "Reorder" },
      { x: 585, label: "Unit Cost" },
      { x: 665, label: "Total Value" },
      { x: 750, label: "Status" },
    ];

    s += pdfRect(28, 498, 785, 20, [0.93, 0.95, 0.98]);
    for (const c of cols) {
      s += pdfText(c.x, 505, c.label, "F2", 8, [0.04, 0.11, 0.24]);
    }

    let y = 480;
    slice.forEach((item, idx) => {
      if (idx % 2 === 1) {
        s += pdfRect(28, y - 5, 785, 21, [0.97, 0.98, 0.99]);
      }
      s += pdfText(34, y, item.sku, "F2", 8);
      s += pdfText(
        105,
        y,
        `${item.name.slice(0, 32)} (${item.category.slice(0, 14)})`,
        "F1",
        8
      );
      s += pdfText(
        295,
        y,
        `${item.campus} - ${item.storeLocation.slice(0, 20)}`,
        "F1",
        7.5
      );
      s += pdfText(445, y, `${item.quantity} ${item.unit}`, "F2", 8);
      s += pdfText(525, y, `${item.reorderLevel} ${item.unit}`, "F1", 7.5);
      s += pdfText(585, y, formatCurrency(item.unitCost), "F1", 8);
      s += pdfText(
        665,
        y,
        formatCurrency(item.totalValue),
        "F2",
        8,
        [0.02, 0.45, 0.3]
      );
      s += pdfText(750, y, item.status, "F2", 8);
      y -= 22;
    });

    s += pdfText(
      34,
      24,
      "Confidential Financial & Store Record - EduSphere Super Admin Finance Suite",
      "F1",
      7.5,
      [0.45, 0.5, 0.58]
    );

    streams.push(s);
  }

  const blob = buildMinimalPdf(streams, "landscape");
  triggerBlobDownload(
    blob,
    `EduSphere-Store-Stock-Register-${new Date().toISOString().slice(0, 10)}.pdf`
  );
}

/* ───────────────────── 2. Bulk Purchase Orders PDF ───────────────────── */

export function exportPurchaseOrdersPdf(orders: PurchaseOrderRecord[]) {
  const streams: string[] = [];
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
    "Institutional Purchase Orders (PO) & Procurement Register",
    "F2",
    9,
    [0.85, 0.9, 0.98]
  );
  s += pdfText(
    40,
    532,
    `Generated: ${generatedDate}  |  Total Purchase Orders: ${orders.length}  |  AY 2026-27`,
    "F1",
    7.5,
    [0.74, 0.82, 0.92]
  );

  const cols = [
    { x: 34, label: "PO # / GRN #" },
    { x: 125, label: "Order Title & Category" },
    { x: 315, label: "Supplier & NTN" },
    { x: 465, label: "Campus" },
    { x: 540, label: "Gross + GST" },
    { x: 645, label: "Net Payable" },
    { x: 745, label: "Status" },
  ];

  s += pdfRect(28, 498, 785, 20, [0.93, 0.95, 0.98]);
  for (const c of cols) {
    s += pdfText(c.x, 505, c.label, "F2", 8, [0.04, 0.11, 0.24]);
  }

  let y = 478;
  orders.forEach((po, idx) => {
    if (idx % 2 === 1) {
      s += pdfRect(28, y - 5, 785, 22, [0.97, 0.98, 0.99]);
    }
    s += pdfText(34, y, `${po.poNumber}`, "F2", 8);
    s += pdfText(125, y, po.title.slice(0, 34), "F1", 8);
    s += pdfText(
      315,
      y,
      `${po.supplierName.slice(0, 22)} (${po.supplierNtn})`,
      "F1",
      7.5
    );
    s += pdfText(465, y, po.campus, "F1", 8);
    s += pdfText(
      540,
      y,
      formatCurrency(po.grossAmount + po.gstAmount),
      "F1",
      8
    );
    s += pdfText(
      645,
      y,
      formatCurrency(po.netPayable),
      "F2",
      8,
      [0.02, 0.45, 0.3]
    );
    s += pdfText(745, y, po.status, "F2", 8);
    y -= 24;
  });

  s += pdfText(
    34,
    24,
    "Confidential Procurement Record - EduSphere Super Admin Finance Suite",
    "F1",
    7.5,
    [0.45, 0.5, 0.58]
  );

  streams.push(s);
  const blob = buildMinimalPdf(streams, "landscape");
  triggerBlobDownload(
    blob,
    `EduSphere-Purchase-Orders-${new Date().toISOString().slice(0, 10)}.pdf`
  );
}

/* ───────────────────── 3. Bulk Departmental Issuance PDF ───────────────────── */

export function exportIssuancePdf(issuances: DepartmentalIssuanceRecord[]) {
  const streams: string[] = [];
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
    "Departmental Store Issuance & Requisitions Register",
    "F2",
    9,
    [0.85, 0.9, 0.98]
  );
  s += pdfText(
    40,
    532,
    `Generated: ${generatedDate}  |  Total Issuances: ${issuances.length}  |  AY 2026-27`,
    "F1",
    7.5,
    [0.74, 0.82, 0.92]
  );

  const cols = [
    { x: 34, label: "Issue Voucher #" },
    { x: 130, label: "Item & SKU" },
    { x: 315, label: "Department & Recipient" },
    { x: 505, label: "Campus" },
    { x: 585, label: "Qty Issued" },
    { x: 660, label: "Valuation" },
    { x: 745, label: "Status" },
  ];

  s += pdfRect(28, 498, 785, 20, [0.93, 0.95, 0.98]);
  for (const c of cols) {
    s += pdfText(c.x, 505, c.label, "F2", 8, [0.04, 0.11, 0.24]);
  }

  let y = 478;
  issuances.forEach((rec, idx) => {
    if (idx % 2 === 1) {
      s += pdfRect(28, y - 5, 785, 22, [0.97, 0.98, 0.99]);
    }
    s += pdfText(34, y, rec.issueVoucherNo, "F2", 8);
    s += pdfText(
      130,
      y,
      `${rec.itemName.slice(0, 28)} (${rec.sku})`,
      "F1",
      8
    );
    s += pdfText(
      315,
      y,
      `${rec.department.slice(0, 24)} - ${rec.issuedTo.slice(0, 16)}`,
      "F1",
      7.5
    );
    s += pdfText(505, y, rec.campus, "F1", 8);
    s += pdfText(585, y, `${rec.quantityIssued} ${rec.unit}`, "F2", 8);
    s += pdfText(
      660,
      y,
      formatCurrency(rec.totalValuation),
      "F2",
      8,
      [0.02, 0.45, 0.3]
    );
    s += pdfText(745, y, rec.status, "F2", 8);
    y -= 24;
  });

  s += pdfText(
    34,
    24,
    "Confidential Store Requisition Record - EduSphere Super Admin Finance Suite",
    "F1",
    7.5,
    [0.45, 0.5, 0.58]
  );

  streams.push(s);
  const blob = buildMinimalPdf(streams, "landscape");
  triggerBlobDownload(
    blob,
    `EduSphere-Departmental-Issuance-${new Date().toISOString().slice(0, 10)}.pdf`
  );
}

/* ───────────────────── 4. Bulk Suppliers PDF ───────────────────── */

export function exportSuppliersPdf(suppliers: InventorySupplierRecord[]) {
  const streams: string[] = [];
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
    "Approved Institutional Vendors & Suppliers Directory",
    "F2",
    9,
    [0.85, 0.9, 0.98]
  );
  s += pdfText(
    40,
    532,
    `Generated: ${generatedDate}  |  Active Suppliers: ${suppliers.length}  |  AY 2026-27`,
    "F1",
    7.5,
    [0.74, 0.82, 0.92]
  );

  const cols = [
    { x: 34, label: "Supplier Code" },
    { x: 120, label: "Company Name & Category" },
    { x: 320, label: "NTN / STRN" },
    { x: 455, label: "Contact Person & Phone" },
    { x: 625, label: "Total Volume" },
    { x: 735, label: "Status" },
  ];

  s += pdfRect(28, 498, 785, 20, [0.93, 0.95, 0.98]);
  for (const c of cols) {
    s += pdfText(c.x, 505, c.label, "F2", 8, [0.04, 0.11, 0.24]);
  }

  let y = 478;
  suppliers.forEach((sup, idx) => {
    if (idx % 2 === 1) {
      s += pdfRect(28, y - 5, 785, 22, [0.97, 0.98, 0.99]);
    }
    s += pdfText(34, y, sup.supplierCode, "F2", 8);
    s += pdfText(
      120,
      y,
      `${sup.companyName.slice(0, 28)} (${sup.category.slice(0, 14)})`,
      "F1",
      8
    );
    s += pdfText(320, y, `NTN: ${sup.ntn}`, "F1", 8);
    s += pdfText(455, y, `${sup.contactPerson} (${sup.phone})`, "F1", 7.5);
    s += pdfText(
      625,
      y,
      formatCurrency(sup.totalProcurementValue),
      "F2",
      8,
      [0.02, 0.45, 0.3]
    );
    s += pdfText(735, y, sup.status, "F2", 8);
    y -= 24;
  });

  streams.push(s);
  const blob = buildMinimalPdf(streams, "landscape");
  triggerBlobDownload(
    blob,
    `EduSphere-Approved-Suppliers-${new Date().toISOString().slice(0, 10)}.pdf`
  );
}

/* ───────────────────── 5. Single Stock Bin Card PDF ───────────────────── */

export function exportSingleStockCardPdf(item: InventoryItemRecord) {
  let s = "";

  s += pdfRect(36, 742, 523, 62, [0.04, 0.11, 0.24]);
  s += pdfText(
    50,
    782,
    "EDUSPHERE MULTI-CAMPUS SYSTEM",
    "F2",
    13,
    [1, 1, 1]
  );
  s += pdfText(
    50,
    766,
    "Official Store Stock Bin Card & Asset Valuation Certificate",
    "F2",
    9.5,
    [0.85, 0.9, 0.98]
  );
  s += pdfText(
    50,
    752,
    `SKU: ${item.sku}  |  Campus: ${item.campus}  |  Status: ${item.status.toUpperCase()}`,
    "F1",
    8,
    [0.75, 0.82, 0.92]
  );

  s += pdfRect(36, 635, 523, 92, [0.96, 0.97, 0.99]);
  s += pdfText(
    48,
    710,
    "ITEM & STORAGE SPECIFICATION",
    "F2",
    9,
    [0.04, 0.11, 0.24]
  );
  s += pdfText(48, 692, `Item Name: ${item.name}`, "F2", 9.5);
  s += pdfText(
    48,
    676,
    `Specification: ${item.specification.slice(0, 75)}`,
    "F1",
    8.5
  );
  s += pdfText(
    48,
    660,
    `Category: ${item.category}   |   Store Location: ${item.storeLocation}`,
    "F1",
    8.5
  );
  s += pdfText(
    48,
    644,
    `Custodian: ${item.custodian}   |   Supplier: ${item.supplierName} (NTN: ${item.supplierNtn})`,
    "F1",
    8.5
  );

  s += pdfRect(36, 515, 523, 105, [0.95, 0.98, 0.96]);
  s += pdfText(
    48,
    602,
    "STOCK QUANTITY & VALUATION BREAKDOWN",
    "F2",
    9,
    [0.02, 0.38, 0.24]
  );
  s += pdfText(
    48,
    582,
    `Current On-Hand Balance: ${item.quantity} ${item.unit}`,
    "F2",
    9.5
  );
  s += pdfText(
    300,
    582,
    `Reorder Alert Level: ${item.reorderLevel} ${item.unit}`,
    "F1",
    9
  );
  s += pdfText(
    48,
    562,
    `Unit Cost Price (PKR): ${formatCurrency(item.unitCost)}`,
    "F1",
    9
  );
  s += pdfText(
    300,
    562,
    `Last Restocked: ${formatDate(item.lastRestocked)}`,
    "F1",
    9
  );
  s += pdfText(
    48,
    534,
    `Total Asset Valuation: ${formatCurrency(item.totalValue)}`,
    "F2",
    12,
    [0.02, 0.45, 0.3]
  );

  s += pdfText(
    48,
    485,
    "RECENT STOCK MOVEMENT LEDGER",
    "F2",
    9,
    [0.04, 0.11, 0.24]
  );
  let y = 465;
  item.movementLogs.slice(0, 6).forEach((log) => {
    s += pdfText(
      48,
      y,
      `${log.timestamp}  |  ${log.voucherRef}  |  ${log.type}: ${log.qtyChange}  |  ${log.actor}`,
      "F1",
      8
    );
    y -= 18;
  });

  s += pdfText(
    48,
    120,
    "_____________________________                           _____________________________",
    "F1",
    8.5
  );
  s += pdfText(
    48,
    106,
    "Store Officer Signature                                 Finance Controller Stamp",
    "F2",
    8.5
  );

  const blob = buildMinimalPdf([s], "portrait");
  triggerBlobDownload(blob, `Stock-Bin-Card-${item.sku}.pdf`);
}

/* ───────────────────── 6. Single Purchase Order PDF ───────────────────── */

export function exportSinglePurchaseOrderPdf(po: PurchaseOrderRecord) {
  let s = "";

  s += pdfRect(36, 742, 523, 62, [0.04, 0.11, 0.24]);
  s += pdfText(
    50,
    782,
    "EDUSPHERE MULTI-CAMPUS SYSTEM",
    "F2",
    13,
    [1, 1, 1]
  );
  s += pdfText(
    50,
    766,
    "Official Institutional Purchase Order (PO)",
    "F2",
    9.5,
    [0.85, 0.9, 0.98]
  );
  s += pdfText(
    50,
    752,
    `PO #: ${po.poNumber}  |  GRN #: ${po.grnNumber}  |  Status: ${po.status.toUpperCase()}`,
    "F1",
    8,
    [0.75, 0.82, 0.92]
  );

  s += pdfRect(36, 625, 523, 102, [0.96, 0.97, 0.99]);
  s += pdfText(
    48,
    710,
    "SUPPLIER & PROCUREMENT SPECIFICATION",
    "F2",
    9,
    [0.04, 0.11, 0.24]
  );
  s += pdfText(48, 692, `Order Title: ${po.title}`, "F2", 9.5);
  s += pdfText(48, 676, `Line Items: ${po.itemsSummary.slice(0, 75)}`, "F1", 8.5);
  s += pdfText(
    48,
    660,
    `Supplier: ${po.supplierName} (NTN: ${po.supplierNtn})  |  Phone: ${po.supplierPhone}`,
    "F1",
    8.5
  );
  s += pdfText(
    48,
    644,
    `Settlement Bank: ${po.supplierBank} (${po.supplierIban})`,
    "F1",
    8.5
  );

  s += pdfRect(36, 495, 523, 115, [0.95, 0.98, 0.96]);
  s += pdfText(
    48,
    592,
    "FINANCIAL & TAX BREAKDOWN (PKR)",
    "F2",
    9,
    [0.02, 0.38, 0.24]
  );
  s += pdfText(
    48,
    572,
    `Gross Order Amount: ${formatCurrency(po.grossAmount)}`,
    "F1",
    9
  );
  s += pdfText(
    300,
    572,
    `Ordered Quantity: ${po.orderedQty} ${po.unit}`,
    "F1",
    9
  );
  s += pdfText(
    48,
    552,
    `Sales Tax / GST (18%): +${formatCurrency(po.gstAmount)}`,
    "F1",
    9
  );
  s += pdfText(
    300,
    552,
    `Withholding Tax (WHT): -${formatCurrency(po.whtDeduction)}`,
    "F1",
    9
  );
  s += pdfText(
    48,
    522,
    `Net Payable Order Value: ${formatCurrency(po.netPayable)}`,
    "F2",
    12,
    [0.02, 0.45, 0.3]
  );

  s += pdfText(
    48,
    455,
    `Requisitioned By: ${po.requestedBy}   |   Approved By: ${po.approvedBy}`,
    "F1",
    8.5
  );
  s += pdfText(
    48,
    438,
    `Order Date: ${formatDate(po.orderDate)}   |   Expected Delivery: ${formatDate(
      po.expectedDelivery
    )}   |   Terms: ${po.paymentTerms}`,
    "F1",
    8.5
  );

  const blob = buildMinimalPdf([s], "portrait");
  triggerBlobDownload(blob, `Purchase-Order-${po.poNumber}.pdf`);
}

/* ───────────────────── 7. Print Preview Helpers ───────────────────── */

export function printInventoryRegister(items: InventoryItemRecord[]): boolean {
  const win = window.open("", "_blank", "width=1080,height=780");
  if (!win) return false;

  const totalValue = items.reduce((s, i) => s + i.totalValue, 0);
  const lowCount = items.filter((i) => i.status !== "In Stock").length;

  const rowsHtml = items
    .map(
      (i) => `
      <tr>
        <td class="mono bold">${i.sku}<br/><span class="muted">${i.campus}</span></td>
        <td><strong>${i.name}</strong><br/><span class="muted">${i.category} · ${i.storeLocation}</span></td>
        <td>${i.supplierName}<br/><span class="muted mono">NTN: ${i.supplierNtn}</span></td>
        <td class="mono center bold">${i.quantity} ${i.unit}</td>
        <td class="mono center">${i.reorderLevel} ${i.unit}</td>
        <td class="mono right">${formatCurrency(i.unitCost)}</td>
        <td class="mono right bold emerald">${formatCurrency(i.totalValue)}</td>
        <td class="center"><span class="badge badge-${i.status
          .toLowerCase()
          .replace(/\s+/g, "-")}">${i.status}</span></td>
      </tr>`
    )
    .join("");

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>EduSphere — Institutional Store Stock Register</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #0f172a; padding: 28px; background: #fff; }
    .banner {
      background: #091d3e;
      color: #ffffff;
      padding: 18px 22px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .banner h1 { font-size: 18px; font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; }
    .banner p { font-size: 12px; color: #cbd5e1; margin-top: 3px; font-weight: 500; }
    .banner .meta { text-align: right; font-size: 11px; color: #e2e8f0; line-height: 1.5; }
    .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px; }
    .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; }
    .kpi span { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600; }
    .kpi strong { display: block; font-size: 15px; color: #091d3e; margin-top: 3px; font-family: monospace; }
    table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
    th { background: #091d3e; color: #fff; text-align: left; padding: 8px 10px; font-size: 10.5px; text-transform: uppercase; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
    tr:nth-child(even) { background: #f8fafc; }
    .mono { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
    .bold { font-weight: 700; }
    .emerald { color: #047857; }
    .muted { font-size: 10px; color: #64748b; }
    .right { text-align: right; }
    .center { text-align: center; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; }
    .badge-in-stock { background: #d1fae5; color: #065f46; }
    .badge-low-stock { background: #fef3c7; color: #92400e; }
    .badge-out-of-stock { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <div class="banner">
    <div>
      <h1>EDUSPHERE MULTI-CAMPUS SYSTEM</h1>
      <p>Institutional Store Stock & Asset Valuation Register — AY 2026–27</p>
    </div>
    <div class="meta">
      <div><strong>Date:</strong> ${new Date().toLocaleDateString("en-GB")}</div>
      <div><strong>Total SKUs:</strong> ${items.length}</div>
      <div><strong>Authority:</strong> Finance & Central Store</div>
    </div>
  </div>
  <div class="kpis">
    <div class="kpi"><span>Total Stock Valuation</span><strong>${formatCurrency(
      totalValue
    )}</strong></div>
    <div class="kpi"><span>Active Store SKUs</span><strong>${
      items.length
    } Items</strong></div>
    <div class="kpi"><span>Healthy Stock Items</span><strong>${
      items.length - lowCount
    } In Stock</strong></div>
    <div class="kpi"><span>Reorder / Low Alerts</span><strong>${lowCount} Alerts</strong></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>SKU # / Campus</th>
        <th>Item Name & Store Location</th>
        <th>Approved Supplier</th>
        <th class="center">On-Hand Qty</th>
        <th class="center">Reorder Level</th>
        <th class="right">Unit Cost</th>
        <th class="right">Total Value</th>
        <th class="center">Status</th>
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

export function printSingleStockCard(item: InventoryItemRecord): boolean {
  const win = window.open("", "_blank", "width=850,height=680");
  if (!win) return false;

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Stock Bin Card — ${item.sku}</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 32px; color: #0f172a; }
    .card { border: 2px solid #091d3e; border-radius: 12px; padding: 24px; }
    .banner {
      background: #091d3e;
      color: #ffffff;
      padding: 16px 20px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .banner h1 { font-size: 16px; font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; margin: 0; }
    .banner p { font-size: 11.5px; color: #cbd5e1; margin: 3px 0 0 0; }
    .banner .meta { text-align: right; font-size: 11px; color: #e2e8f0; font-family: monospace; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; font-size: 12.5px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; }
    .val { font-weight: 700; margin-top: 3px; color: #0f172a; }
    .net { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
    .net strong { font-size: 18px; color: #047857; font-family: monospace; }
  </style>
</head>
<body>
  <div class="card">
    <div class="banner">
      <div>
        <h1>EDUSPHERE MULTI-CAMPUS SYSTEM</h1>
        <p>Official Store Stock Bin Card · ${item.campus} Campus</p>
      </div>
      <div class="meta">
        <div><strong>${item.sku}</strong></div>
        <div>Status: ${item.status}</div>
      </div>
    </div>
    <div class="grid">
      <div class="box"><div class="label">Item Name & Category</div><div class="val">${
        item.name
      } (${item.category})</div></div>
      <div class="box"><div class="label">Store Location & Custodian</div><div class="val">${
        item.storeLocation
      } · ${item.custodian}</div></div>
      <div class="box"><div class="label">On-Hand Stock vs Reorder Level</div><div class="val">${
        item.quantity
      } ${item.unit} (Reorder: ${item.reorderLevel} ${item.unit})</div></div>
      <div class="box"><div class="label">Approved Supplier & Unit Cost</div><div class="val">${
        item.supplierName
      } · ${formatCurrency(item.unitCost)} / ${item.unit}</div></div>
    </div>
    <div class="net">
      <span><strong>Total Stock Asset Valuation</strong> (Last Restocked: ${formatDate(
        item.lastRestocked
      )})</span>
      <strong>${formatCurrency(item.totalValue)}</strong>
    </div>
  </div>
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`);
  win.document.close();
  return true;
}
