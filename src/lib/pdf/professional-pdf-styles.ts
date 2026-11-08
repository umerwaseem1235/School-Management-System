/**
 * Professional PDF Design System
 * Simple, clean, and business-standard styling
 */

// Professional color palette - minimal and clean
export const PDF_COLORS = {
  // Primary text and headers
  textPrimary: { r: 0.17, g: 0.24, b: 0.31 },      // #2c3e50 - Dark blue-gray
  textSecondary: { r: 0.5, g: 0.55, b: 0.55 },     // #7f8c8d - Medium gray
  
  // Backgrounds
  bgWhite: { r: 1, g: 1, b: 1 },                   // White
  bgLightGray: { r: 0.96, g: 0.97, b: 0.98 },      // Very light gray
  bgHeader: { r: 0.94, g: 0.95, b: 0.96 },         // Light gray for table headers
  
  // Borders
  borderLight: { r: 0.85, g: 0.87, b: 0.90 },      // Light gray border
  borderMedium: { r: 0.70, g: 0.73, b: 0.77 },     // Medium gray border
  
  // Status colors
  statusSuccess: { r: 0.13, g: 0.59, b: 0.34 },    // Green
  statusWarning: { r: 0.85, g: 0.50, b: 0.10 },    // Orange
  statusDanger: { r: 0.73, g: 0.15, b: 0.15 },     // Red
} as const;

// Professional font sizes and weights
export const PDF_FONTS = {
  // Title sizes
  titleLarge: 14,
  titleMedium: 12,
  titleSmall: 11,
  
  // Body text
  bodyLarge: 10,
  bodyMedium: 9,
  bodySmall: 8,
  bodyTiny: 7,
  
  // Line heights
  lineHeightNormal: 1.4,
  lineHeightCompact: 1.2,
} as const;

// Standard spacing and dimensions
export const PDF_SPACING = {
  // Page margins
  marginTop: 20,
  marginRight: 15,
  marginBottom: 20,
  marginLeft: 15,
  
  // Section gaps
  sectionGapLarge: 10,
  sectionGapMedium: 6,
  sectionGapSmall: 4,
  
  // Table padding
  tablePaddingHorizontal: 4,
  tablePaddingVertical: 3,
  
  // Standard page sizes (points)
  a4Width: 595.28,
  a4Height: 841.89,
  letterWidth: 612,
  letterHeight: 792,
} as const;

/**
 * Escape special PDF characters
 */
export function escapePdfText(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[\r\n]/g, ' ')
    .replace(/[^\x20-\x7E]/g, '');
}

/**
 * Format currency for PDF (PKR)
 */
export function formatPdfCurrency(amount: number): string {
  const num = Number(amount) || 0;
  return `Rs ${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format date for PDF
 */
export function formatPdfDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Generate professional header section
 */
export function generatePdfHeader(config: {
  schoolName: string;
  documentTitle: string;
  schoolAddress?: string;
  schoolPhone?: string;
  documentDate?: string;
}): string {
  const lines: string[] = [];
  
  // School name - centered, bold
  lines.push('BT');
  lines.push('/F2 12 Tf'); // Bold font
  lines.push('0.17 0.24 0.31 rg'); // Dark text
  lines.push(`297.64 820 Td`); // Center of A4 width
  lines.push(`(${escapePdfText(config.schoolName)}) Tj`);
  lines.push('ET');
  
  // Document title - centered
  lines.push('BT');
  lines.push('/F2 10 Tf');
  lines.push('0.17 0.24 0.31 rg');
  lines.push(`297.64 805 Td`);
  lines.push(`(${escapePdfText(config.documentTitle)}) Tj`);
  lines.push('ET');
  
  // Contact info - small, centered
  if (config.schoolAddress || config.schoolPhone) {
    const contactParts: string[] = [];
    if (config.schoolAddress) contactParts.push(config.schoolAddress);
    if (config.schoolPhone) contactParts.push(`Tel: ${config.schoolPhone}`);
    
    lines.push('BT');
    lines.push('/F1 8 Tf');
    lines.push('0.5 0.55 0.55 rg'); // Gray text
    lines.push(`297.64 792 Td`);
    lines.push(`(${escapePdfText(contactParts.join(' | '))}) Tj`);
    lines.push('ET');
  }
  
  // Horizontal line separator
  lines.push('0.85 0.87 0.90 RG'); // Light gray
  lines.push('0.5 w');
  lines.push(`${PDF_SPACING.marginLeft} 780 m`);
  lines.push(`${PDF_SPACING.a4Width - PDF_SPACING.marginRight} 780 l`);
  lines.push('S');
  
  // Document date
  if (config.documentDate) {
    lines.push('BT');
    lines.push('/F1 8 Tf');
    lines.push('0.5 0.55 0.55 rg');
    lines.push(`${PDF_SPACING.marginLeft} 768 Td`);
    lines.push(`(Generated: ${escapePdfText(config.documentDate)}) Tj`);
    lines.push('ET');
  }
  
  return lines.join('\n');
}

/**
 * Generate professional footer section
 */
export function generatePdfFooter(config: {
  pageNumber: number;
  totalPages: number;
  footerText?: string;
}): string {
  const lines: string[] = [];
  const footerY = PDF_SPACING.marginBottom + 5;
  
  // Footer line
  lines.push('0.85 0.87 0.90 RG');
  lines.push('0.5 w');
  lines.push(`${PDF_SPACING.marginLeft} ${footerY + 8} m`);
  lines.push(`${PDF_SPACING.a4Width - PDF_SPACING.marginRight} ${footerY + 8} l`);
  lines.push('S');
  
  // Footer text
  lines.push('BT');
  lines.push('/F1 7 Tf');
  lines.push('0.5 0.55 0.55 rg');
  lines.push(`${PDF_SPACING.marginLeft} ${footerY} Td`);
  lines.push(`(${escapePdfText(config.footerText || 'Official School Document')}) Tj`);
  lines.push('ET');
  
  // Page number
  lines.push('BT');
  lines.push('/F1 7 Tf');
  lines.push('0.5 0.55 0.55 rg');
  lines.push(`${PDF_SPACING.a4Width - PDF_SPACING.marginRight - 40} ${footerY} Td`);
  lines.push(`(Page ${config.pageNumber} of ${config.totalPages}) Tj`);
  lines.push('ET');
  
  return lines.join('\n');
}

/**
 * Build minimal PDF from page streams
 */
export function buildMinimalPdf(pagesStreams: string[]): Blob {
  const objects: string[] = [];
  const addObject = (content: string): number => {
    objects.push(content);
    return objects.length;
  };

  const catalogId = addObject('');
  const pagesId = addObject('');
  const fontRegularId = addObject(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
  );
  const fontBoldId = addObject(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'
  );

  const pageIds: number[] = [];
  for (const stream of pagesStreams) {
    const streamBytes = new TextEncoder().encode(stream).length;
    const contentId = addObject(
      `<< /Length ${streamBytes} >>\nstream\n${stream}\nendstream`
    );
    const pageId = addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PDF_SPACING.a4Width} ${PDF_SPACING.a4Height}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    pageIds.push(pageId);
  }

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

  const encoder = new TextEncoder();
  const chunks: string[] = [];
  let byteOffset = 0;

  const pushChunk = (str: string) => {
    chunks.push(str);
    byteOffset += encoder.encode(str).length;
  };

  pushChunk('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  const offsets: number[] = [];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(byteOffset);
    pushChunk(`${i + 1} 0 obj\n${objects[i]}\nendobj\n`);
  }

  const xrefOffset = byteOffset;
  pushChunk(`xref\n0 ${objects.length + 1}\n`);
  pushChunk('0000000000 65535 f \n');
  for (const off of offsets) {
    pushChunk(`${String(off).padStart(10, '0')} 00000 n \n`);
  }

  pushChunk(
    `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  );

  return new Blob([chunks.join('')], { type: 'application/pdf' });
}

/**
 * Trigger download of blob
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Generate simple table with professional styling
 */
export function generateSimpleTable(config: {
  startY: number;
  headers: string[];
  rows: string[][];
  columnWidths: number[];
  rowHeight?: number;
}): { content: string; endY: number } {
  const lines: string[] = [];
  const rowHeight = config.rowHeight || 18;
  const margin = PDF_SPACING.marginLeft;
  let currentY = config.startY;
  
  // Draw header row
  lines.push('0.94 0.95 0.96 rg'); // Light gray background
  lines.push(`${margin} ${currentY} ${config.columnWidths.reduce((a, b) => a + b, 0)} ${rowHeight} re f`);
  
  // Header borders
  lines.push('0.70 0.73 0.77 RG'); // Medium gray border
  lines.push('0.5 w');
  lines.push(`${margin} ${currentY} ${config.columnWidths.reduce((a, b) => a + b, 0)} ${rowHeight} re S`);
  
  // Header text
  lines.push('BT');
  lines.push('/F2 9 Tf'); // Bold
  lines.push('0.17 0.24 0.31 rg'); // Dark text
  
  let xPos = margin + PDF_SPACING.tablePaddingHorizontal;
  config.headers.forEach((header, i) => {
    lines.push(`${xPos} ${currentY + rowHeight - 12} Td (${escapePdfText(header)}) Tj`);
    lines.push(`${-xPos} ${-(currentY + rowHeight - 12)} Td`);
    xPos += config.columnWidths[i];
  });
  
  lines.push('ET');
  currentY -= rowHeight;
  
  // Draw data rows
  config.rows.forEach((row, rowIndex) => {
    // Alternating row colors
    if (rowIndex % 2 === 0) {
      lines.push('1 1 1 rg'); // White
    } else {
      lines.push('0.98 0.99 0.99 rg'); // Very light gray
    }
    lines.push(`${margin} ${currentY} ${config.columnWidths.reduce((a, b) => a + b, 0)} ${rowHeight} re f`);
    
    // Row borders
    lines.push('0.85 0.87 0.90 RG'); // Light gray border
    lines.push('0.3 w');
    lines.push(`${margin} ${currentY} ${config.columnWidths.reduce((a, b) => a + b, 0)} ${rowHeight} re S`);
    
    // Row text
    lines.push('BT');
    lines.push('/F1 8 Tf'); // Regular font
    lines.push('0.17 0.24 0.31 rg');
    
    xPos = margin + PDF_SPACING.tablePaddingHorizontal;
    row.forEach((cell, i) => {
      lines.push(`${xPos} ${currentY + rowHeight - 12} Td (${escapePdfText(cell)}) Tj`);
      lines.push(`${-xPos} ${-(currentY + rowHeight - 12)} Td`);
      xPos += config.columnWidths[i];
    });
    
    lines.push('ET');
    currentY -= rowHeight;
  });
  
  return {
    content: lines.join('\n'),
    endY: currentY,
  };
}
