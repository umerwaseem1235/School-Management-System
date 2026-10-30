import type { AssetRecord } from "@/lib/mock/assets";
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

function buildMinimalPdf(
  pagesStreams: string[],
  orientation: "portrait" | "landscape" = "landscape"
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

  pushChunk("%PDF-1.4\n");
  const offsets: number[] = [];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(byteOffset);
    pushChunk(`${i + 1} 0 obj\n${objects[i]}\nendobj\n`);
  }

  const xrefOffset = byteOffset;
  pushChunk("xref\n");
  pushChunk(`0 ${objects.length + 1}\n`);
  pushChunk("0000000000 65535 f \n");
  for (const off of offsets) {
    pushChunk(`${String(off).padStart(10, "0")} 00000 n \n`);
  }
  pushChunk("trailer\n");
  pushChunk(
    `<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\n`
  );
  pushChunk("startxref\n");
  pushChunk(`${xrefOffset}\n%%EOF\n`);

  return new Blob([chunks.join("")], { type: "application/pdf" });
}

/* ───────────────────────── PDF Export ───────────────────────── */

export function exportAssetsPdf(records: AssetRecord[]) {
  const headerY = 560;
  const colX = [30, 100, 310, 450, 560, 680, 770];
  const headers = [
    "Code",
    "Name",
    "Location",
    "Category",
    "Condition",
    "Purchase Date",
    "Cost",
  ];

  const pages: string[] = [];
  const rowsPerPage = 22;

  for (let page = 0; page < Math.ceil(records.length / rowsPerPage); page++) {
    const pageRecords = records.slice(
      page * rowsPerPage,
      (page + 1) * rowsPerPage
    );
    let stream = "";

    // Title
    stream += `BT /F2 14 Tf 30 ${headerY + 20} Td (Opus SMS - Asset Register) Tj ET\n`;
    stream += `BT /F1 8 Tf 630 ${headerY + 20} Td (Generated: ${sanitizePdfText(new Date().toLocaleDateString())}) Tj ET\n`;

    // Header line
    stream += `0.92 0.92 0.92 rg 28 ${headerY - 6} 790 18 re f\n`;
    stream += `0 0 0 rg\n`;
    headers.forEach((h, i) => {
      stream += `BT /F2 7.5 Tf ${colX[i]} ${headerY} Td (${sanitizePdfText(h)}) Tj ET\n`;
    });

    // Rows
    pageRecords.forEach((r, idx) => {
      const y = headerY - 22 - idx * 22;
      if (idx % 2 === 0) {
        stream += `0.97 0.97 0.97 rg 28 ${y - 6} 790 18 re f\n`;
        stream += `0 0 0 rg\n`;
      }
      const cells = [
        r.assetCode,
        r.name.length > 36 ? r.name.slice(0, 33) + "..." : r.name,
        r.location,
        r.category,
        r.condition,
        formatDate(r.purchaseDate),
        formatCurrency(r.purchaseCost),
      ];
      cells.forEach((c, i) => {
        stream += `BT /F1 7 Tf ${colX[i]} ${y} Td (${sanitizePdfText(c)}) Tj ET\n`;
      });
    });

    // Page number
    stream += `BT /F1 7 Tf 400 20 Td (Page ${page + 1} of ${Math.ceil(records.length / rowsPerPage)}) Tj ET\n`;
    pages.push(stream);
  }

  const blob = buildMinimalPdf(pages, "landscape");
  triggerBlobDownload(blob, `asset-register-${Date.now()}.pdf`);
}

/* ───────────────────────── Print ───────────────────────── */

export function printAssetRegister(records: AssetRecord[]): boolean {
  const rows = records
    .map(
      (r) => `
    <tr>
      <td>${r.assetCode}</td>
      <td>${r.name}</td>
      <td>${r.location}</td>
      <td>${r.category}</td>
      <td>
        <span style="display:inline-flex;align-items:center;gap:5px;">
          <span style="width:8px;height:8px;border-radius:50%;background:${
            r.condition === "New"
              ? "#10b981"
              : r.condition === "Good"
                ? "#22c55e"
                : r.condition === "Fair"
                  ? "#f59e0b"
                  : "#ef4444"
          }"></span>
          ${r.condition}
        </span>
      </td>
      <td>${formatDate(r.purchaseDate)}</td>
      <td style="text-align:right">${formatCurrency(r.purchaseCost)}</td>
    </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
<title>Asset Register — Opus SMS</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #1e293b; }
  h1 { font-size: 18px; color: #091d3e; margin-bottom: 4px; }
  p.sub { font-size: 11px; color: #64748b; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { background: #f1f5f9; color: #334155; text-align: left; padding: 8px 10px; border-bottom: 2px solid #e2e8f0; font-weight: 600; }
  td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) td { background: #f8fafc; }
  @media print { @page { size: landscape; margin: 10mm; } }
</style>
</head>
<body>
<h1>Asset Register</h1>
<p class="sub">Opus SMS · ${records.length} records · Printed: ${new Date().toLocaleDateString()}</p>
<table>
<thead><tr>
  <th>Code</th><th>Name</th><th>Location</th><th>Category</th><th>Condition</th><th>Purchase Date</th><th style="text-align:right">Cost</th>
</tr></thead>
<tbody>${rows}</tbody>
</table>
</body></html>`;

  return printHtml(html);
}
