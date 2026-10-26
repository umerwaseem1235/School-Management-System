import type {
  AssetAllocationRecord,
  AssetDepreciationRecord,
  AssetMaintenanceRecord,
  FixedAssetRecord,
} from "@/lib/mock/assets";
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

/* ───────────────────── 1. Bulk Fixed-Asset Register PDF ───────────────────── */

export function exportFixedAssetsPdf(assets: FixedAssetRecord[]) {
  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const totalCost = assets.reduce((s, a) => s + a.purchaseCost, 0);
  const totalNbv = assets.reduce((s, a) => s + a.netBookValue, 0);
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
    "Institutional Fixed-Asset Master & Net Book Value Register",
    "F2",
    9,
    [0.85, 0.9, 0.98]
  );
  s += pdfText(
    40,
    532,
    `Generated: ${generatedDate}  |  Total Assets: ${assets.length}  |  Cost: ${formatCurrency(
      totalCost
    )}  |  Net Book Value: ${formatCurrency(totalNbv)}`,
    "F1",
    7.5,
    [0.74, 0.82, 0.92]
  );

  const cols = [
    { x: 34, label: "Asset Tag" },
    { x: 115, label: "Asset Name & Category" },
    { x: 315, label: "Campus & Location" },
    { x: 465, label: "Custodian" },
    { x: 565, label: "Purchase Cost" },
    { x: 655, label: "Net Book Value" },
    { x: 745, label: "Status" },
  ];

  s += pdfRect(28, 498, 785, 20, [0.93, 0.95, 0.98]);
  for (const c of cols) {
    s += pdfText(c.x, 505, c.label, "F2", 8, [0.04, 0.11, 0.24]);
  }

  let y = 478;
  assets.forEach((a, idx) => {
    if (idx % 2 === 1) {
      s += pdfRect(28, y - 5, 785, 22, [0.97, 0.98, 0.99]);
    }
    s += pdfText(34, y, a.assetTag, "F2", 8);
    s += pdfText(
      115,
      y,
      `${a.assetName.slice(0, 32)} (${a.category.slice(0, 14)})`,
      "F1",
      8
    );
    s += pdfText(
      315,
      y,
      `${a.campus} - ${a.locationRoom.slice(0, 18)}`,
      "F1",
      7.5
    );
    s += pdfText(465, y, a.custodian.slice(0, 18), "F1", 8);
    s += pdfText(565, y, formatCurrency(a.purchaseCost), "F1", 8);
    s += pdfText(
      655,
      y,
      formatCurrency(a.netBookValue),
      "F2",
      8,
      [0.02, 0.45, 0.3]
    );
    s += pdfText(745, y, a.status, "F2", 8);
    y -= 24;
  });

  s += pdfText(
    34,
    24,
    "Confidential Fixed-Asset Record - EduSphere Super Admin Operations Suite",
    "F1",
    7.5,
    [0.45, 0.5, 0.58]
  );

  const blob = buildMinimalPdf([s], "landscape");
  triggerBlobDownload(
    blob,
    `EduSphere-Fixed-Assets-Register-${new Date().toISOString().slice(0, 10)}.pdf`
  );
}

/* ───────────────────── 2. Bulk Asset Allocations PDF ───────────────────── */

export function exportAssetAllocationsPdf(
  allocations: AssetAllocationRecord[]
) {
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
    "Departmental & Custodian Fixed-Asset Allocation Register",
    "F2",
    9,
    [0.85, 0.9, 0.98]
  );
  s += pdfText(
    40,
    532,
    `Generated: ${generatedDate}  |  Total Allocations: ${allocations.length}  |  AY 2026-27`,
    "F1",
    7.5,
    [0.74, 0.82, 0.92]
  );

  const cols = [
    { x: 34, label: "Allocation #" },
    { x: 115, label: "Asset & Tag #" },
    { x: 305, label: "Campus & Room/Lab" },
    { x: 475, label: "Custodian & Dept" },
    { x: 645, label: "Asset Value" },
    { x: 740, label: "Status" },
  ];

  s += pdfRect(28, 498, 785, 20, [0.93, 0.95, 0.98]);
  for (const c of cols) {
    s += pdfText(c.x, 505, c.label, "F2", 8, [0.04, 0.11, 0.24]);
  }

  let y = 478;
  allocations.forEach((a, idx) => {
    if (idx % 2 === 1) {
      s += pdfRect(28, y - 5, 785, 22, [0.97, 0.98, 0.99]);
    }
    s += pdfText(34, y, a.allocationCode, "F2", 8);
    s += pdfText(
      115,
      y,
      `${a.assetName.slice(0, 28)} (${a.assetTag})`,
      "F1",
      8
    );
    s += pdfText(305, y, `${a.campus} - ${a.roomOrLab.slice(0, 20)}`, "F1", 7.5);
    s += pdfText(
      475,
      y,
      `${a.assignedCustodian} (${a.department.slice(0, 16)})`,
      "F1",
      7.5
    );
    s += pdfText(
      645,
      y,
      formatCurrency(a.assetValue),
      "F2",
      8,
      [0.02, 0.45, 0.3]
    );
    s += pdfText(740, y, a.status, "F2", 8);
    y -= 24;
  });

  const blob = buildMinimalPdf([s], "landscape");
  triggerBlobDownload(
    blob,
    `EduSphere-Asset-Allocations-${new Date().toISOString().slice(0, 10)}.pdf`
  );
}

/* ───────────────────── 3. Bulk Maintenance Schedules PDF ───────────────────── */

export function exportAssetMaintenancePdf(
  maintenance: AssetMaintenanceRecord[]
) {
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
    "Fixed-Asset Preventive Maintenance & AMC Schedule Register",
    "F2",
    9,
    [0.85, 0.9, 0.98]
  );
  s += pdfText(
    40,
    532,
    `Generated: ${generatedDate}  |  Total AMC Work Orders: ${maintenance.length}  |  AY 2026-27`,
    "F1",
    7.5,
    [0.74, 0.82, 0.92]
  );

  const cols = [
    { x: 34, label: "Work Order #" },
    { x: 120, label: "Asset & Maintenance Type" },
    { x: 335, label: "Service Vendor & Tech" },
    { x: 515, label: "Scheduled / Next Due" },
    { x: 645, label: "Service Cost" },
    { x: 740, label: "Status" },
  ];

  s += pdfRect(28, 498, 785, 20, [0.93, 0.95, 0.98]);
  for (const c of cols) {
    s += pdfText(c.x, 505, c.label, "F2", 8, [0.04, 0.11, 0.24]);
  }

  let y = 478;
  maintenance.forEach((m, idx) => {
    if (idx % 2 === 1) {
      s += pdfRect(28, y - 5, 785, 22, [0.97, 0.98, 0.99]);
    }
    s += pdfText(34, y, m.workOrderNo, "F2", 8);
    s += pdfText(
      120,
      y,
      `${m.assetName.slice(0, 26)} (${m.maintenanceType})`,
      "F1",
      7.5
    );
    s += pdfText(
      335,
      y,
      `${m.serviceVendor.slice(0, 20)} - ${m.technicianName}`,
      "F1",
      7.5
    );
    s += pdfText(
      515,
      y,
      `${formatDate(m.scheduledDate)} -> ${formatDate(m.nextDueDate)}`,
      "F1",
      7.5
    );
    s += pdfText(
      645,
      y,
      formatCurrency(m.serviceCost),
      "F2",
      8,
      [0.02, 0.45, 0.3]
    );
    s += pdfText(740, y, m.status, "F2", 8);
    y -= 24;
  });

  const blob = buildMinimalPdf([s], "landscape");
  triggerBlobDownload(
    blob,
    `EduSphere-Asset-Maintenance-${new Date().toISOString().slice(0, 10)}.pdf`
  );
}

/* ───────────────────── 4. Bulk Depreciation Ledger PDF ───────────────────── */

export function exportAssetDepreciationPdf(
  depreciation: AssetDepreciationRecord[]
) {
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
    "Fixed-Asset IAS-16 Depreciation & Book Valuation Schedule",
    "F2",
    9,
    [0.85, 0.9, 0.98]
  );
  s += pdfText(
    40,
    532,
    `Generated: ${generatedDate}  |  Total Schedules: ${depreciation.length}  |  AY 2026-27`,
    "F1",
    7.5,
    [0.74, 0.82, 0.92]
  );

  const cols = [
    { x: 34, label: "Schedule #" },
    { x: 115, label: "Asset & Method" },
    { x: 325, label: "Rate / Life" },
    { x: 415, label: "Historical Cost" },
    { x: 520, label: "Annual Charge" },
    { x: 625, label: "Net Book Value" },
    { x: 735, label: "Status" },
  ];

  s += pdfRect(28, 498, 785, 20, [0.93, 0.95, 0.98]);
  for (const c of cols) {
    s += pdfText(c.x, 505, c.label, "F2", 8, [0.04, 0.11, 0.24]);
  }

  let y = 478;
  depreciation.forEach((d, idx) => {
    if (idx % 2 === 1) {
      s += pdfRect(28, y - 5, 785, 22, [0.97, 0.98, 0.99]);
    }
    s += pdfText(34, y, d.scheduleCode, "F2", 8);
    s += pdfText(
      115,
      y,
      `${d.assetName.slice(0, 28)} (${d.depreciationMethod})`,
      "F1",
      7.5
    );
    s += pdfText(
      325,
      y,
      `${d.annualRatePct}% (${d.elapsedYears}/${d.usefulLifeYears} Yrs)`,
      "F2",
      8
    );
    s += pdfText(415, y, formatCurrency(d.historicalCost), "F1", 8);
    s += pdfText(520, y, formatCurrency(d.currentYearDepCharge), "F1", 8);
    s += pdfText(
      625,
      y,
      formatCurrency(d.closingNetBookValue),
      "F2",
      8,
      [0.02, 0.45, 0.3]
    );
    s += pdfText(735, y, d.status, "F2", 8);
    y -= 24;
  });

  const blob = buildMinimalPdf([s], "landscape");
  triggerBlobDownload(
    blob,
    `EduSphere-Asset-Depreciation-${new Date().toISOString().slice(0, 10)}.pdf`
  );
}

/* ───────────────────── 5. Single Asset Valuation Certificate PDF ───────────────────── */

export function exportSingleAssetCardPdf(asset: FixedAssetRecord) {
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
    "Official Fixed-Asset Custody & Book Valuation Certificate",
    "F2",
    9.5,
    [0.85, 0.9, 0.98]
  );
  s += pdfText(
    50,
    752,
    `Asset Tag: ${asset.assetTag}  |  Serial #: ${asset.serialNo}  |  Campus: ${asset.campus}`,
    "F1",
    8,
    [0.75, 0.82, 0.92]
  );

  s += pdfRect(36, 625, 523, 102, [0.96, 0.97, 0.99]);
  s += pdfText(
    48,
    710,
    "ASSET & CUSTODY SPECIFICATION",
    "F2",
    9,
    [0.04, 0.11, 0.24]
  );
  s += pdfText(48, 692, `Asset Name: ${asset.assetName}`, "F2", 9.5);
  s += pdfText(
    48,
    676,
    `Specification: ${asset.specification.slice(0, 75)}`,
    "F1",
    8.5
  );
  s += pdfText(
    48,
    660,
    `Location: ${asset.locationRoom}   |   Custodian: ${asset.custodian}`,
    "F1",
    8.5
  );
  s += pdfText(
    48,
    644,
    `Vendor: ${asset.vendorName}   |   Warranty Till: ${formatDate(
      asset.warrantyExpiry
    )}`,
    "F1",
    8.5
  );

  s += pdfRect(36, 495, 523, 115, [0.95, 0.98, 0.96]);
  s += pdfText(
    48,
    592,
    "CAPITAL COST & DEPRECIATION SUMMARY (PKR)",
    "F2",
    9,
    [0.02, 0.38, 0.24]
  );
  s += pdfText(
    48,
    572,
    `Original Acquisition Cost: ${formatCurrency(asset.purchaseCost)}`,
    "F1",
    9
  );
  s += pdfText(
    300,
    572,
    `Depreciation Rate: ${asset.depreciationRatePct}% / Annum (${asset.usefulLifeYears} Yrs)`,
    "F1",
    9
  );
  s += pdfText(
    48,
    552,
    `Accumulated Depreciation: -${formatCurrency(asset.accumulatedDepreciation)}`,
    "F1",
    9
  );
  s += pdfText(
    48,
    522,
    `Current Net Book Value (NBV): ${formatCurrency(asset.netBookValue)}`,
    "F2",
    12,
    [0.02, 0.45, 0.3]
  );

  const blob = buildMinimalPdf([s], "portrait");
  triggerBlobDownload(blob, `Fixed-Asset-Certificate-${asset.assetTag}.pdf`);
}

/* ───────────────────── 6. Print Preview Helpers ───────────────────── */

export function printFixedAssetsRegister(assets: FixedAssetRecord[]): boolean {
  const win = window.open("", "_blank", "width=1080,height=780");
  if (!win) return false;

  const totalCost = assets.reduce((s, a) => s + a.purchaseCost, 0);
  const totalDep = assets.reduce((s, a) => s + a.accumulatedDepreciation, 0);
  const totalNbv = assets.reduce((s, a) => s + a.netBookValue, 0);

  const rowsHtml = assets
    .map(
      (a) => `
      <tr>
        <td class="mono bold">${a.assetTag}<br/><span class="muted">${a.serialNo}</span></td>
        <td><strong>${a.assetName}</strong><br/><span class="muted">${a.category} · ${a.locationRoom}</span></td>
        <td>${a.campus}<br/><span class="muted">${a.custodian}</span></td>
        <td class="mono right">${formatCurrency(a.purchaseCost)}</td>
        <td class="mono right">${formatCurrency(a.accumulatedDepreciation)} (${a.depreciationRatePct}%)</td>
        <td class="mono right bold emerald">${formatCurrency(a.netBookValue)}</td>
        <td class="center"><span class="badge">${a.status}</span></td>
      </tr>`
    )
    .join("");

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>EduSphere — Fixed-Asset Master Register</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #0f172a; padding: 28px; background: #fff; }
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
    .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; background: #d1fae5; color: #065f46; }
  </style>
</head>
<body>
  <div class="banner">
    <div>
      <h1>EDUSPHERE MULTI-CAMPUS SYSTEM</h1>
      <p>Institutional Fixed-Asset & Capital Book Valuation Register — AY 2026–27</p>
    </div>
    <div class="meta">
      <div><strong>Date:</strong> ${new Date().toLocaleDateString("en-GB")}</div>
      <div><strong>Total Assets:</strong> ${assets.length} Capital Lots</div>
      <div><strong>Authority:</strong> Operations & Estate Control</div>
    </div>
  </div>
  <div class="kpis">
    <div class="kpi"><span>Historical Capital Cost</span><strong>${formatCurrency(
      totalCost
    )}</strong></div>
    <div class="kpi"><span>Accumulated Depreciation</span><strong>${formatCurrency(
      totalDep
    )}</strong></div>
    <div class="kpi"><span>Net Book Value (NBV)</span><strong>${formatCurrency(
      totalNbv
    )}</strong></div>
    <div class="kpi"><span>Active Capital Lots</span><strong>${
      assets.length
    } Registered</strong></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Asset Tag / Serial #</th>
        <th>Fixed Asset & Location</th>
        <th>Campus & Custodian</th>
        <th class="right">Historical Cost</th>
        <th class="right">Accumulated Dep.</th>
        <th class="right">Net Book Value</th>
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
