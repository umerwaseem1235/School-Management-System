/**
 * Simple Professional PDF Generator
 * Clean, minimal, business-standard design for all school documents
 * No fancy colors, no premium styling - just professional simplicity
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Simple professional color palette
export const COLORS = {
  // Text colors
  darkText: [44, 62, 80] as [number, number, number],      // #2c3e50
  mediumText: [108, 117, 125] as [number, number, number], // #6c757d
  lightText: [127, 140, 141] as [number, number, number],  // #7f8c8d
  
  // Background colors
  white: [255, 255, 255] as [number, number, number],
  lightGray: [248, 249, 250] as [number, number, number],  // #f8f9fa
  tableHeader: [236, 239, 241] as [number, number, number], // #ecf0f1
  
  // Border colors
  borderLight: [222, 226, 230] as [number, number, number], // #dee2e6
  borderMedium: [189, 195, 199] as [number, number, number], // #bdc3c7
  
  // Status colors (minimal, professional)
  success: [22, 160, 133] as [number, number, number],      // #16a085
  warning: [214, 137, 16] as [number, number, number],      // #d68910
  danger: [192, 57, 43] as [number, number, number],        // #c0392b
} as const;

/**
 * Add simple professional header to PDF
 */
export function addSimpleHeader(
  doc: jsPDF,
  config: {
    schoolName: string;
    documentTitle: string;
    subtitle?: string;
    generatedDate?: string;
  }
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 15;

  // School name - centered, bold
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.darkText);
  doc.text(config.schoolName, pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 6;
  
  // Document title - centered
  doc.setFontSize(10);
  doc.text(config.documentTitle, pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 5;
  
  // Subtitle if provided
  if (config.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.mediumText);
    doc.text(config.subtitle, pageWidth / 2, currentY, { align: 'center' });
    currentY += 4;
  }
  
  // Header separator line
  currentY += 2;
  doc.setDrawColor(...COLORS.borderMedium);
  doc.setLineWidth(0.3);
  doc.line(15, currentY, pageWidth - 15, currentY);
  
  currentY += 2;
  
  // Generated date (small, right-aligned)
  if (config.generatedDate) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.lightText);
    doc.text(`Generated: ${config.generatedDate}`, pageWidth - 15, currentY, { align: 'right' });
    currentY += 3;
  }
  
  return currentY + 3; // Return Y position for next content
}

/**
 * Add simple professional footer to PDF
 */
export function addSimpleFooter(
  doc: jsPDF,
  pageNumber: number,
  totalPages: number,
  footerText: string = 'Official School Document'
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = pageHeight - 10;
  
  // Footer line
  doc.setDrawColor(...COLORS.borderLight);
  doc.setLineWidth(0.2);
  doc.line(15, footerY - 3, pageWidth - 15, footerY - 3);
  
  // Footer text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.lightText);
  doc.text(footerText, 15, footerY);
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 15, footerY, { align: 'right' });
}

/**
 * Create simple info box with label-value pairs
 */
export function addInfoBox(
  doc: jsPDF,
  startY: number,
  items: Array<{ label: string; value: string }>,
  columns: number = 2
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const boxWidth = pageWidth - margin * 2;
  const boxHeight = Math.ceil(items.length / columns) * 6 + 6;
  const colWidth = boxWidth / columns;
  
  // Draw box background
  doc.setFillColor(...COLORS.lightGray);
  doc.setDrawColor(...COLORS.borderLight);
  doc.setLineWidth(0.2);
  doc.rect(margin, startY, boxWidth, boxHeight, 'FD');
  
  // Add items
  let currentY = startY + 5;
  let currentCol = 0;
  
  items.forEach((item, index) => {
    const xPos = margin + 3 + (currentCol * colWidth);
    
    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.mediumText);
    doc.text(item.label + ':', xPos, currentY);
    
    // Value
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.darkText);
    const labelWidth = doc.getTextWidth(item.label + ': ');
    doc.text(item.value, xPos + labelWidth, currentY);
    
    currentCol++;
    if (currentCol >= columns) {
      currentCol = 0;
      currentY += 6;
    }
  });
  
  return startY + boxHeight + 5;
}

/**
 * Create simple summary box with key metrics
 */
export function addSummaryBox(
  doc: jsPDF,
  startY: number,
  metrics: Array<{ label: string; value: string; highlight?: 'success' | 'warning' | 'danger' }>
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const boxWidth = pageWidth - margin * 2;
  const itemWidth = boxWidth / metrics.length;
  const boxHeight = 14;
  
  // Draw container
  doc.setFillColor(...COLORS.lightGray);
  doc.setDrawColor(...COLORS.borderLight);
  doc.setLineWidth(0.2);
  doc.rect(margin, startY, boxWidth, boxHeight, 'FD');
  
  // Add metrics
  metrics.forEach((metric, index) => {
    const xPos = margin + (index * itemWidth) + itemWidth / 2;
    
    // Label (small, uppercase)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.mediumText);
    doc.text(metric.label.toUpperCase(), xPos, startY + 5, { align: 'center' });
    
    // Value (larger, bold)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    
    if (metric.highlight === 'success') {
      doc.setTextColor(...COLORS.success);
    } else if (metric.highlight === 'warning') {
      doc.setTextColor(...COLORS.warning);
    } else if (metric.highlight === 'danger') {
      doc.setTextColor(...COLORS.danger);
    } else {
      doc.setTextColor(...COLORS.darkText);
    }
    
    doc.text(metric.value, xPos, startY + 11, { align: 'center' });
  });
  
  return startY + boxHeight + 5;
}

/**
 * Add simple professional table using autoTable
 */
export function addSimpleTable(
  doc: jsPDF,
  config: {
    startY: number;
    headers: string[];
    rows: (string | number)[][];
    columnWidths?: number[];
    footerRows?: (string | number)[][];
  }
): number {
  autoTable(doc, {
    startY: config.startY,
    head: [config.headers],
    body: config.rows.map(row => row.map(cell => String(cell))),
    foot: config.footerRows ? config.footerRows.map(row => row.map(cell => String(cell))) : undefined,
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3,
      textColor: COLORS.darkText,
      lineColor: COLORS.borderLight,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: COLORS.tableHeader,
      textColor: COLORS.darkText,
      fontStyle: 'bold',
      fontSize: 9,
    },
    footStyles: {
      fillColor: COLORS.lightGray,
      textColor: COLORS.darkText,
      fontStyle: 'bold',
      fontSize: 9,
    },
    columnStyles: config.columnWidths ? 
      config.columnWidths.reduce((acc, width, index) => {
        acc[index] = { cellWidth: width };
        return acc;
      }, {} as Record<number, { cellWidth: number }>) : 
      undefined,
    margin: { left: 15, right: 15 },
  });
  
  const finalY = (doc as any).lastAutoTable?.finalY ?? config.startY;
  return finalY + 5;
}

/**
 * Add signature section
 */
export function addSignatureSection(
  doc: jsPDF,
  startY: number,
  signatures: string[]
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const sigWidth = (pageWidth - margin * 2 - (signatures.length - 1) * 10) / signatures.length;
  
  doc.setDrawColor(...COLORS.borderMedium);
  doc.setLineWidth(0.2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.mediumText);
  
  signatures.forEach((sig, index) => {
    const xPos = margin + index * (sigWidth + 10);
    
    // Signature line
    doc.line(xPos, startY, xPos + sigWidth, startY);
    
    // Signature label
    doc.text(sig, xPos, startY + 4);
  });
  
  return startY + 10;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `Rs ${Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get current generation date
 */
export function getGenerationDate(): string {
  return new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Create a new PDF with standard settings
 */
export function createSimplePDF(orientation: 'portrait' | 'landscape' = 'portrait'): jsPDF {
  return new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });
}
