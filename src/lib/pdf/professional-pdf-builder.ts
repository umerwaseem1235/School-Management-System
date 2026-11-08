/**
 * Professional PDF Builder
 * Clean, simple, and professional PDF generation utilities
 * Follows standard business document formatting
 */

export interface PDFHeaderConfig {
  schoolName: string;
  schoolAddress?: string;
  schoolPhone?: string;
  schoolEmail?: string;
  logoUrl?: string;
}

export interface PDFDocumentConfig {
  title: string;
  subtitle?: string;
  header: PDFHeaderConfig;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'letter';
}

/**
 * Standard professional colors - simple and clean
 */
export const PROFESSIONAL_COLORS = {
  primary: '#2c3e50',      // Dark blue-gray for headers
  secondary: '#34495e',    // Slightly lighter for subheaders
  text: '#2c3e50',         // Dark text for readability
  lightText: '#7f8c8d',    // Light gray for secondary text
  border: '#bdc3c7',       // Light gray for borders
  background: '#ecf0f1',   // Very light gray for table headers
  white: '#ffffff',
} as const;

/**
 * Standard professional fonts
 */
export const PROFESSIONAL_FONTS = {
  title: { size: 16, weight: 'bold' as const },
  subtitle: { size: 12, weight: 'normal' as const },
  heading: { size: 11, weight: 'bold' as const },
  body: { size: 10, weight: 'normal' as const },
  small: { size: 9, weight: 'normal' as const },
  tiny: { size: 8, weight: 'normal' as const },
} as const;

/**
 * Standard spacing and margins
 */
export const PROFESSIONAL_SPACING = {
  pageMargin: { top: 20, right: 15, bottom: 20, left: 15 },
  sectionGap: 8,
  lineHeight: 1.4,
  tablePadding: { horizontal: 5, vertical: 4 },
} as const;

/**
 * Build a minimal PDF with professional styling
 */
export function buildProfessionalPdf(
  content: string,
  filename: string = 'document.pdf'
): Blob {
  const blob = new Blob([content], { type: 'application/pdf' });
  return blob;
}

/**
 * Generate PDF header with school information
 */
export function generatePdfHeader(config: PDFHeaderConfig): string {
  const lines: string[] = [];
  
  lines.push(`(${config.schoolName}) Tj`);
  
  if (config.schoolAddress) {
    lines.push(`(${config.schoolAddress}) Tj`);
  }
  
  const contactInfo: string[] = [];
  if (config.schoolPhone) contactInfo.push(`Tel: ${config.schoolPhone}`);
  if (config.schoolEmail) contactInfo.push(`Email: ${config.schoolEmail}`);
  
  if (contactInfo.length > 0) {
    lines.push(`(${contactInfo.join(' | ')}) Tj`);
  }
  
  return lines.join('\n');
}

/**
 * Generate PDF footer with page number and date
 */
export function generatePdfFooter(pageNumber: number, totalPages: number): string {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  return `Page ${pageNumber} of ${totalPages} | Generated: ${date}`;
}

/**
 * Format currency for PDF display
 */
export function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format date for PDF display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time for PDF display
 */
export function formatTime(time: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Escape special characters for PDF strings
 */
export function escapePdfString(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r/g, '')
    .replace(/\n/g, ' ');
}

/**
 * Calculate column widths based on content
 */
export function calculateColumnWidths(
  headers: string[],
  pageWidth: number,
  margin: number = 30
): number[] {
  const availableWidth = pageWidth - (margin * 2);
  const columnCount = headers.length;
  const equalWidth = availableWidth / columnCount;
  
  return Array(columnCount).fill(equalWidth);
}

/**
 * Wrap text to fit within specified width
 */
export function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number = 10
): string[] {
  const charWidth = fontSize * 0.5; // Approximate character width
  const maxChars = Math.floor(maxWidth / charWidth);
  
  if (text.length <= maxChars) return [text];
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxChars) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Generate table row with borders
 */
export function generateTableRow(
  cells: string[],
  widths: number[],
  x: number,
  y: number,
  height: number,
  isHeader: boolean = false
): string {
  let content = '';
  let currentX = x;
  
  // Draw cell backgrounds for headers
  if (isHeader) {
    content += `0.95 0.95 0.95 rg\n`; // Light gray background
    for (let i = 0; i < cells.length; i++) {
      content += `${currentX} ${y} ${widths[i]} ${height} re f\n`;
      currentX += widths[i];
    }
  }
  
  // Draw borders
  content += `0.7 0.7 0.7 RG\n`; // Gray border color
  content += `0.5 w\n`; // Border width
  currentX = x;
  
  for (let i = 0; i < cells.length; i++) {
    content += `${currentX} ${y} ${widths[i]} ${height} re S\n`;
    currentX += widths[i];
  }
  
  // Draw text
  content += `BT\n`;
  content += `0.17 0.24 0.31 rg\n`; // Dark text color
  content += `/F1 ${isHeader ? '10' : '9'} Tf\n`;
  currentX = x;
  
  for (let i = 0; i < cells.length; i++) {
    const cellX = currentX + 3; // Left padding
    const cellY = y + height - 8; // Vertical centering
    content += `${cellX} ${cellY} Td (${escapePdfString(cells[i])}) Tj\n`;
    content += `${-cellX} ${-cellY} Td\n`; // Reset position
    currentX += widths[i];
  }
  
  content += `ET\n`;
  
  return content;
}

/**
 * Build a simple professional PDF document
 */
export function buildSimplePdf(config: {
  header: PDFHeaderConfig;
  title: string;
  subtitle?: string;
  content: string;
  pageWidth?: number;
  pageHeight?: number;
}): string {
  const pageWidth = config.pageWidth || 595; // A4 width in points
  const pageHeight = config.pageHeight || 842; // A4 height in points
  
  let yPos = pageHeight - 40;
  
  let pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 ${pageWidth} ${pageHeight}]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
/F2 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Bold
>>
>>
>>
>>
endobj

4 0 obj
<<
/Length 5 0 R
>>
stream
BT
`;

  // School Header
  pdfContent += `/F2 14 Tf\n`;
  pdfContent += `0.17 0.24 0.31 rg\n`; // Dark color
  pdfContent += `${pageWidth / 2 - 100} ${yPos} Td\n`;
  pdfContent += `(${escapePdfString(config.header.schoolName)}) Tj\n`;
  yPos -= 15;
  
  if (config.header.schoolAddress) {
    pdfContent += `/F1 9 Tf\n`;
    pdfContent += `0.5 0.55 0.55 rg\n`; // Gray color
    pdfContent += `${pageWidth / 2 - 100} ${yPos} Td\n`;
    pdfContent += `(${escapePdfString(config.header.schoolAddress)}) Tj\n`;
    yPos -= 12;
  }
  
  const contactInfo: string[] = [];
  if (config.header.schoolPhone) contactInfo.push(`Tel: ${config.header.schoolPhone}`);
  if (config.header.schoolEmail) contactInfo.push(`Email: ${config.header.schoolEmail}`);
  
  if (contactInfo.length > 0) {
    pdfContent += `/F1 8 Tf\n`;
    pdfContent += `${pageWidth / 2 - 100} ${yPos} Td\n`;
    pdfContent += `(${escapePdfString(contactInfo.join(' | '))}) Tj\n`;
    yPos -= 20;
  }
  
  // Horizontal line
  pdfContent += `ET\n`;
  pdfContent += `0.7 0.7 0.7 RG\n`;
  pdfContent += `1 w\n`;
  pdfContent += `40 ${yPos} m\n`;
  pdfContent += `${pageWidth - 40} ${yPos} l\n`;
  pdfContent += `S\n`;
  yPos -= 20;
  
  // Document Title
  pdfContent += `BT\n`;
  pdfContent += `/F2 12 Tf\n`;
  pdfContent += `0.17 0.24 0.31 rg\n`;
  pdfContent += `${pageWidth / 2 - 80} ${yPos} Td\n`;
  pdfContent += `(${escapePdfString(config.title)}) Tj\n`;
  yPos -= 15;
  
  if (config.subtitle) {
    pdfContent += `/F1 10 Tf\n`;
    pdfContent += `0.5 0.55 0.55 rg\n`;
    pdfContent += `${pageWidth / 2 - 80} ${yPos} Td\n`;
    pdfContent += `(${escapePdfString(config.subtitle)}) Tj\n`;
    yPos -= 20;
  }
  
  // Main content
  pdfContent += config.content;
  
  // Footer
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  pdfContent += `/F1 8 Tf\n`;
  pdfContent += `0.5 0.55 0.55 rg\n`;
  pdfContent += `40 30 Td\n`;
  pdfContent += `(Generated: ${date}) Tj\n`;
  
  pdfContent += `ET\n`;
  pdfContent += `endstream
endobj

5 0 obj
${pdfContent.length}
endobj

xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000350 00000 n
0000${String(pdfContent.length + 350).padStart(10, '0')} 00000 n

trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
${pdfContent.length + 370}
%%EOF`;

  return pdfContent;
}
