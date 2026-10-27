"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DatesheetEntry } from "@/lib/mock/examinations";
import type { ExamTerm } from "@/types";
import {
  Printer,
  School,
  ShieldCheck,
  CalendarDays,
  FileText,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/format";

interface PrintDatesheetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: DatesheetEntry[];
  allEntries?: DatesheetEntry[];
  termName?: string;
  selectedClass?: string;
  selectedTermId?: string;
  terms?: ExamTerm[];
  onSelectTerm?: (termId: string) => void;
  onSelectClass?: (className: string) => void;
}

export function PrintDatesheetDialog({
  open,
  onOpenChange,
  entries,
  allEntries,
  termName: initialTermName,
  selectedClass: initialClass = "ALL",
  selectedTermId: initialTermId = "ALL",
  terms = [],
}: PrintDatesheetDialogProps) {
  // Local filter states for in-dialog preview customization
  // Default to the active term so dates from different exam cycles are not mixed together
  const defaultTermId = React.useMemo(() => {
    if (initialTermId && initialTermId !== "ALL") return initialTermId;
    return terms[0]?.id || "ex-mid-2026";
  }, [initialTermId, terms]);

  const [dialogTermId, setDialogTermId] = React.useState<string>(defaultTermId);
  const [dialogClass, setDialogClass] = React.useState<string>(initialClass);

  // Sync with props whenever dialog opens
  React.useEffect(() => {
    if (open) {
      setDialogTermId(
        initialTermId && initialTermId !== "ALL"
          ? initialTermId
          : terms[0]?.id || "ex-mid-2026"
      );
      setDialogClass(initialClass);
    }
  }, [open, initialTermId, initialClass, terms]);

  // Derive unique classes from data
  const dataSource = allEntries && allEntries.length > 0 ? allEntries : entries;

  const availableClasses = React.useMemo(() => {
    const classSet = new Set<string>();
    dataSource.forEach((e) => {
      if (e.className) classSet.add(e.className);
    });
    return Array.from(classSet).sort();
  }, [dataSource]);

  // Active term object and term name
  const activeTermObj = React.useMemo(() => {
    if (dialogTermId === "ALL") return null;
    return terms.find((t) => t.id === dialogTermId) || null;
  }, [dialogTermId, terms]);

  const activeTermName = React.useMemo(() => {
    if (activeTermObj) return activeTermObj.examName;
    if (dialogTermId === "ALL") return "All Examination Terms";
    if (initialTermName && initialTermName !== "Examination Schedule") {
      return initialTermName;
    }
    return "Mid-Term Examination 2026–27";
  }, [activeTermObj, dialogTermId, initialTermName]);

  // Filtered entries for the preview sheet
  const displayEntries = React.useMemo(() => {
    let list = dataSource;

    if (dialogTermId !== "ALL") {
      list = list.filter((e) => e.termId === dialogTermId);
    }

    if (dialogClass !== "ALL") {
      list = list.filter((e) => e.className === dialogClass);
    }

    // Sort chronologically by date, then by class
    return [...list].sort((a, b) => {
      const dateA = new Date(a.examDate).getTime();
      const dateB = new Date(b.examDate).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.className.localeCompare(b.className);
    });
  }, [dataSource, dialogTermId, dialogClass]);

  const [currentDate, setCurrentDate] = React.useState("27 Oct 2026");

  React.useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    );
  }, []);

  /**
   * Seamless A4 Print Engine:
   * Uses an off-screen hidden iframe to print the exact A4 layout.
   * Completely avoids opening any new popup window/tab (about:blank),
   * ensuring no leftover tabs remain when printing or canceling.
   */
  const handlePrint = () => {
    try {
      const oldFrame = document.getElementById("datesheet-print-frame");
      if (oldFrame) {
        oldFrame.remove();
      }

      const iframe = document.createElement("iframe");
      iframe.id = "datesheet-print-frame";
      iframe.style.position = "fixed";
      iframe.style.top = "-9999px";
      iframe.style.left = "-9999px";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      iframe.style.visibility = "hidden";
      document.body.appendChild(iframe);

      const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!frameDoc || !iframe.contentWindow) {
        window.print();
        return;
      }

      const rowsHtml = displayEntries
        .map((entry, idx) => {
          const dateStr = formatDate(entry.examDate);
          const classCell =
            dialogClass === "ALL"
              ? `<td class="class-cell"><span class="class-badge">${entry.className}</span></td>`
              : "";
          const invigilatorHtml = entry.invigilator
            ? `<span class="sub-invig">Invigilator: ${entry.invigilator}</span>`
            : "";

          return `
            <tr>
              <td class="center mono bold">${idx + 1}</td>
              <td>
                <span class="bold block">${dateStr}</span>
                <span class="muted text-xs">${entry.day}</span>
              </td>
              ${classCell}
              <td>
                <span class="bold block">${entry.subject}</span>
                ${invigilatorHtml}
              </td>
              <td class="center mono">
                <span class="bold block">${entry.startTime} – ${entry.endTime}</span>
                <span class="shift-sub">${entry.shift} Shift</span>
              </td>
              <td class="center mono">
                <span class="bold">${entry.maxMarks}</span>
                <span class="muted text-xs"> (Pass: ${entry.passMarks})</span>
              </td>
              <td class="center bold">${entry.roomHall}</td>
            </tr>
          `;
        })
        .join("");

      const classHeaderCol =
        dialogClass === "ALL"
          ? `<th style="width: 16%;">Class</th>`
          : "";

      const colWidths =
        dialogClass === "ALL"
          ? {
              idx: "4%",
              date: "17%",
              subject: "27%",
              timing: "15%",
              marks: "11%",
              room: "10%",
            }
          : {
              idx: "5%",
              date: "20%",
              subject: "33%",
              timing: "17%",
              marks: "11%",
              room: "14%",
            };

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${activeTermName} - Datesheet (${dialogClass === "ALL" ? "All Classes" : dialogClass})</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm 10mm 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #000000;
      background: #ffffff;
      font-size: 10px;
      line-height: 1.35;
      padding: 4px;
    }
    .header-wrap {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #000000;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .crest-block {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .crest-box {
      width: 44px;
      height: 44px;
      background: #000000;
      color: #ffffff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 14px;
      letter-spacing: 1px;
      border: 1.5px solid #000000;
    }
    .school-title {
      font-size: 15px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #000000;
    }
    .school-sub {
      font-size: 10.5px;
      font-weight: 700;
      color: #000000;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 1px;
    }
    .school-affil {
      font-size: 9.5px;
      color: #333333;
      margin-top: 1px;
    }
    .badge-wrap {
      text-align: right;
    }
    .official-badge {
      display: inline-block;
      padding: 3px 10px;
      background: #ffffff;
      color: #000000;
      border: 1.5px solid #000000;
      border-radius: 9999px;
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .issue-date {
      font-size: 9.5px;
      color: #333333;
      margin-top: 4px;
      font-family: monospace;
    }
    .doc-title {
      text-align: center;
      font-size: 13.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.75px;
      text-decoration: underline;
      text-underline-offset: 4px;
      margin-bottom: 12px;
      color: #000000;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      background: #ffffff;
      border: 1.5px solid #000000;
      border-radius: 6px;
      padding: 7px 10px;
      margin-bottom: 14px;
    }
    .meta-item .label {
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: #333333;
      letter-spacing: 0.5px;
      display: block;
    }
    .meta-item .val {
      font-size: 10.5px;
      font-weight: 800;
      color: #000000;
      display: block;
      margin-top: 1px;
    }
    table {
      width: 100% !important;
      border-collapse: collapse;
      margin-bottom: 14px;
      table-layout: fixed;
      border: 1.5px solid #000000;
    }
    th {
      background: #f0f0f0;
      color: #000000;
      font-weight: 800;
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 6px 8px;
      border: 1px solid #000000;
      text-align: left;
    }
    th.center, td.center {
      text-align: center;
    }
    td {
      padding: 6px 8px;
      border: 1px solid #000000;
      font-size: 10px;
      color: #000000;
      vertical-align: middle;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    tr:nth-child(even) td {
      background: #fafafa;
    }
    .bold {
      font-weight: 700;
      color: #000000;
    }
    .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .block {
      display: block;
    }
    .muted {
      color: #333333;
    }
    .text-xs {
      font-size: 9px;
    }
    .sub-invig {
      font-size: 8.5px;
      color: #333333;
      margin-top: 2px;
      display: block;
    }
    .shift-sub {
      font-size: 8.5px;
      color: #333333;
      text-transform: uppercase;
      display: block;
      margin-top: 1px;
    }
    .class-badge {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 9px;
      font-weight: 700;
      background: #ffffff;
      color: #000000;
      border: 1px solid #000000;
    }
    .inst-box {
      border: 1.5px solid #000000;
      background: #ffffff;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 18px;
      page-break-inside: avoid;
    }
    .inst-title {
      font-weight: 800;
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
      color: #000000;
    }
    .inst-list {
      padding-left: 14px;
      font-size: 9.5px;
      color: #000000;
      line-height: 1.45;
    }
    .inst-list li {
      margin-bottom: 2px;
    }
    .sign-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 0 10px;
      margin-top: 20px;
      page-break-inside: avoid;
    }
    .sign-col {
      text-align: center;
      width: 160px;
    }
    .sign-line {
      border-bottom: 1.5px solid #000000;
      margin-bottom: 5px;
    }
    .sign-name {
      font-size: 10px;
      font-weight: 700;
      color: #000000;
      display: block;
    }
    .sign-dept {
      font-size: 9px;
      color: #333333;
      display: block;
    }
    .seal-box {
      width: 64px;
      height: 64px;
      border: 1.5px dashed #000000;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      font-family: monospace;
      color: #000000;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="header-wrap">
    <div class="crest-block">
      <div class="crest-box">SMS</div>
      <div>
        <h1 class="school-title">School Management System</h1>
        <p class="school-sub">Office of the Controller of Examinations</p>
        <p class="school-affil">Affiliated with Board of Intermediate & Secondary Education</p>
      </div>
    </div>
    <div class="badge-wrap">
      <span class="official-badge">Official Datesheet</span>
      <p class="issue-date">Issue Date: ${currentDate}</p>
    </div>
  </div>

  <div class="doc-title">${activeTermName} Schedule</div>

  <div class="meta-grid">
    <div class="meta-item">
      <span class="label">Class / Cohort</span>
      <span class="val">${dialogClass === "ALL" ? `All Enrolled Classes (${availableClasses.length})` : dialogClass}</span>
    </div>
    <div class="meta-item">
      <span class="label">Academic Session</span>
      <span class="val">2026 – 2027</span>
    </div>
    <div class="meta-item">
      <span class="label">Exam Timing & Shift</span>
      <span class="val">08:30 – 11:30 AM</span>
    </div>
    <div class="meta-item">
      <span class="label">Reporting Time</span>
      <span class="val">08:15 AM Sharp</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="center" style="width: ${colWidths.idx};">#</th>
        <th style="width: ${colWidths.date};">Date & Day</th>
        ${classHeaderCol}
        <th style="width: ${colWidths.subject};">Subject Paper</th>
        <th class="center" style="width: ${colWidths.timing};">Timing & Shift</th>
        <th class="center" style="width: ${colWidths.marks};">Marks (Total/Pass)</th>
        <th class="center" style="width: ${colWidths.room};">Exam Room</th>
      </tr>
    </thead>
    <tbody>
      ${
        displayEntries.length > 0
          ? rowsHtml
          : `<tr><td colspan="${dialogClass === "ALL" ? 7 : 6}" class="center" style="padding: 24px; color: #333333;">No examination papers scheduled for the selected criteria.</td></tr>`
      }
    </tbody>
  </table>

  <div class="inst-box">
    <div class="inst-title">Important Instructions for Candidates:</div>
    <ol class="inst-list">
      <li>Students must report to the examination hall in full school uniform at least <strong>15 minutes before</strong> commencement (08:15 AM). Late arrivals exceeding 15 minutes will not be admitted.</li>
      <li>Original <strong>Roll Number Slip</strong> and transparent clipboard are strictly mandatory for entry into the examination hall.</li>
      <li>Mobile phones, smartwatches, digital devices, books, or notes are <strong>strictly prohibited</strong> inside the examination room.</li>
      <li>Minimum passing marks in each individual subject paper are <strong>33%</strong> as per academic board criteria.</li>
      <li>Students are strictly advised to bring their own stationery. Lending or borrowing supplies during the exam is forbidden.</li>
      <li>No candidate will be permitted to hand over the answer sheet or leave the examination hall before half time has elapsed.</li>
    </ol>
  </div>

  <div class="sign-row">
    <div class="sign-col">
      <div class="sign-line"></div>
      <span class="sign-name">Controller of Examinations</span>
      <span class="sign-dept">Central Examination Cell</span>
    </div>
    <div class="seal-box">
      <span>Official</span>
      <span>Seal / Stamp</span>
    </div>
    <div class="sign-col">
      <div class="sign-line"></div>
      <span class="sign-name">Principal / Head of School</span>
      <span class="sign-dept">School Management System</span>
    </div>
  </div>
</body>
</html>`;

      frameDoc.open();
      frameDoc.write(html);
      frameDoc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();

        // Automatically clean up the iframe element after print action
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 1500);
      }, 250);
    } catch {
      window.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[940px] md:max-w-[1040px] lg:max-w-[1100px] w-full p-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl max-h-[92vh] flex flex-col print:border-none print:shadow-none print:max-w-none print:w-full print:m-0 print:p-0 print:overflow-visible"
      >
        <DialogTitle className="sr-only">
          {activeTermName} - Official Examination Datesheet Document Preview
        </DialogTitle>

        {/* Modal Toolbar (Hidden during print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-muted/40 border-b border-border/70 print:hidden shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand shadow-2xs shrink-0">
              <FileText className="size-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-foreground block truncate">
                Official Examination Datesheet
              </span>
              <span className="text-[11px] text-muted-foreground block truncate">
                Institutional A4 Format • {displayEntries.length} Papers Scheduled
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Term Filter */}
            {terms.length > 0 && (
              <Select
                value={dialogTermId}
                onValueChange={(val) => {
                  if (val) setDialogTermId(val);
                }}
              >
                <SelectTrigger className="h-8 text-xs w-[170px] sm:w-[190px] font-medium bg-background shrink-0">
                  <SelectValue placeholder="Select Exam Term" />
                </SelectTrigger>
                <SelectContent className="max-h-[260px]">
                  <SelectItem value="ALL">All Exam Terms</SelectItem>
                  {terms.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.term || t.examName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Class Filter */}
            {availableClasses.length > 0 && (
              <Select
                value={dialogClass}
                onValueChange={(val) => {
                  if (val) setDialogClass(val);
                }}
              >
                <SelectTrigger className="h-8 text-xs w-[145px] sm:w-[165px] font-medium bg-background shrink-0">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent className="max-h-[260px]">
                  <SelectItem value="ALL">All Classes</SelectItem>
                  {availableClasses.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Action Buttons */}
            <Button
              type="button"
              size="sm"
              onClick={handlePrint}
              className="bg-brand text-cream hover:bg-brand-600 text-xs h-8 px-3.5 gap-1.5 cursor-pointer shadow-2xs font-semibold"
              title="Print official datesheet document"
            >
              <Printer className="size-3.5" />
              <span>Print</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8 px-2.5 cursor-pointer text-muted-foreground hover:text-foreground"
              title="Close preview"
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        {/* Scrollable Canvas Area (Background canvas on screen, direct sheet on print) */}
        <div className="flex-1 min-h-0 p-4 sm:p-6 md:p-8 overflow-y-auto bg-muted/30 print:bg-white print:p-0 print:m-0 print:overflow-visible">
          {/* Authentic Document Paper Sheet */}
          <div
            id="printable-datesheet-sheet"
            className="max-w-4xl mx-auto bg-card text-foreground rounded-2xl border border-border/80 shadow-lg p-6 sm:p-8 space-y-6 print:shadow-none print:border-none print:p-0 print:max-w-none print:w-full print:rounded-none print:bg-white print:text-black"
          >
            {/* 1. Distinguished Institutional Letterhead */}
            <div className="border-b-2 border-border/80 pb-5 space-y-3 print:border-black/70">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3.5">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-brand text-cream shadow-md ring-4 ring-brand/10 shrink-0 print:bg-slate-900 print:text-white print:border print:border-black/30">
                    <School className="size-7" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase text-foreground print:text-black leading-tight">
                      School Management System
                    </h1>
                    <p className="text-xs font-semibold text-brand print:text-black uppercase tracking-wider mt-0.5">
                      Office of the Controller of Examinations
                    </p>
                    <p className="text-[11px] text-muted-foreground print:text-gray-600 mt-0.5">
                      Affiliated with Board of Intermediate & Secondary Education
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right shrink-0">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-brand-soft text-brand border border-brand/20 print:border-black/40 print:text-black print:bg-transparent">
                    Official Datesheet
                  </span>
                  <p className="text-[11px] text-muted-foreground print:text-gray-600 mt-1 font-mono">
                    Issue Date: {currentDate}
                  </p>
                </div>
              </div>

              {/* Title Strip */}
              <div className="pt-2 text-center">
                <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-foreground print:text-black underline underline-offset-4 decoration-brand/40 print:decoration-black">
                  {activeTermName} Schedule
                </h2>
              </div>
            </div>

            {/* 2. Key Metadata Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/70 text-xs print:bg-gray-100 print:border-black/20">
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground print:text-gray-600 block">
                  Class / Cohort
                </span>
                <span className="font-bold text-foreground print:text-black truncate block">
                  {dialogClass === "ALL"
                    ? `All Enrolled Classes (${availableClasses.length})`
                    : dialogClass}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground print:text-gray-600 block">
                  Academic Session
                </span>
                <span className="font-bold text-foreground print:text-black block">
                  2026 – 2027
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground print:text-gray-600 block">
                  Exam Timing & Shift
                </span>
                <span className="font-bold text-foreground print:text-black block font-mono">
                  08:30 – 11:30 AM
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground print:text-gray-600 block">
                  Reporting Time
                </span>
                <span className="font-bold text-brand print:text-black block font-mono">
                  08:15 AM Sharp
                </span>
              </div>
            </div>

            {/* 3. Official Datesheet Table */}
            <div className="rounded-xl border border-border/80 overflow-x-auto shadow-2xs print:border-black/30 print:shadow-none bg-card print:overflow-visible print:w-full">
              <table className="w-full min-w-[700px] print:min-w-0 print:w-full text-xs text-left border-collapse print:table-fixed">
                <thead className="bg-muted/70 text-foreground font-semibold border-b border-border/70 uppercase tracking-wider text-[11px] print:bg-gray-200 print:text-black print:border-black/30">
                  <tr>
                    <th className="px-3 py-2.5 w-10 print:w-[5%] text-center font-bold">#</th>
                    <th className="px-3 py-2.5 min-w-[125px] print:w-[18%]">Date & Day</th>
                    {dialogClass === "ALL" && (
                      <th className="px-3 py-2.5 min-w-[140px] print:w-[16%]">Class</th>
                    )}
                    <th className="px-3 py-2.5 min-w-[180px] print:w-[30%]">Subject Paper</th>
                    <th className="px-3 py-2.5 text-center min-w-[125px] print:w-[17%]">Timing & Shift</th>
                    <th className="px-3 py-2.5 text-center min-w-[110px] print:w-[12%]">Marks (Total/Pass)</th>
                    <th className="px-3 py-2.5 text-center min-w-[110px] print:w-[13%]">Exam Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 print:divide-black/20">
                  {displayEntries.length > 0 ? (
                    displayEntries.map((entry, idx) => (
                      <tr
                        key={entry.id}
                        className="hover:bg-muted/30 print:hover:bg-transparent break-inside-avoid transition-colors"
                      >
                        <td className="px-3 py-2 text-center font-mono font-bold text-muted-foreground print:text-gray-600">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 font-medium whitespace-nowrap">
                          <span className="font-bold text-foreground print:text-black block">
                            {formatDate(entry.examDate)}
                          </span>
                          <span className="text-muted-foreground print:text-gray-600 text-[11px]">
                            {entry.day}
                          </span>
                        </td>
                        {dialogClass === "ALL" && (
                          <td className="px-3 py-2 font-medium text-foreground print:text-black whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-brand-soft text-brand border border-brand/15 print:border-black/20 print:text-black print:bg-transparent">
                              {entry.className}
                            </span>
                          </td>
                        )}
                        <td className="px-3 py-2 text-foreground print:text-black">
                          <span className="font-bold text-foreground print:text-black block">
                            {entry.subject}
                          </span>
                          {entry.invigilator && (
                            <span className="block text-[10px] font-normal text-muted-foreground print:text-gray-500 mt-0.5">
                              Invigilator: {entry.invigilator}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center font-mono whitespace-nowrap">
                          <span className="font-semibold text-foreground print:text-black block">
                            {entry.startTime} – {entry.endTime}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase print:text-gray-500 font-sans">
                            {entry.shift} Shift
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center font-mono whitespace-nowrap">
                          <span className="font-bold text-foreground print:text-black">
                            {entry.maxMarks}
                          </span>
                          <span className="text-muted-foreground text-[11px] ml-1 print:text-gray-600">
                            (Pass: {entry.passMarks})
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center text-foreground print:text-black whitespace-nowrap font-medium">
                          {entry.roomHall}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={dialogClass === "ALL" ? 7 : 6}
                        className="px-4 py-12 text-center text-muted-foreground text-xs"
                      >
                        <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                          <CalendarDays className="size-8 text-muted-foreground/40" />
                          <span className="font-semibold text-foreground text-sm">
                            No Examination Papers Found
                          </span>
                          <span className="text-xs text-muted-foreground max-w-sm">
                            No papers are scheduled for the selected term and class filter.
                            Select another class or term above to preview the datesheet.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. Important Instructions for Candidates */}
            <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-2.5 text-xs break-inside-avoid print:bg-transparent print:border-black/30">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-brand print:text-black" />
                <h3 className="font-bold text-foreground print:text-black uppercase tracking-wider text-[11.5px]">
                  Important Instructions for Candidates:
                </h3>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground print:text-black text-[11.5px] leading-relaxed">
                <li>
                  Students must report to the examination hall in full school uniform at least <strong>15 minutes before</strong> commencement (08:15 AM). Late arrivals exceeding 15 minutes will not be admitted.
                </li>
                <li>
                  Original <strong>Roll Number Slip</strong> and transparent clipboard are strictly mandatory for entry into the examination hall.
                </li>
                <li>
                  Mobile phones, smartwatches, digital devices, books, or notes are <strong>strictly prohibited</strong> inside the examination room.
                </li>
                <li>
                  Minimum passing marks in each individual subject paper are <strong>33%</strong> as per academic board criteria.
                </li>
                <li>
                  Students are strictly advised to bring their own stationery. Lending or borrowing supplies during the exam is forbidden.
                </li>
                <li>
                  No candidate will be permitted to hand over the answer sheet or leave the examination hall before half time has elapsed.
                </li>
              </ol>
            </div>

            {/* 5. Attestation & Signatures Section */}
            <div className="pt-6 sm:pt-10 flex items-end justify-between text-xs text-foreground print:text-black px-4 break-inside-avoid">
              <div className="text-center space-y-1.5">
                <div className="w-44 border-b-2 border-foreground/70 print:border-black/70 pb-1" />
                <span className="font-bold block text-xs">Controller of Examinations</span>
                <span className="text-[11px] text-muted-foreground print:text-gray-600">Central Examination Cell</span>
              </div>

              <div className="hidden sm:flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-border/80 text-[10px] text-muted-foreground/80 uppercase font-mono tracking-widest text-center size-20 print:border-black/40 print:text-gray-500">
                <span>Official</span>
                <span>Seal / Stamp</span>
              </div>

              <div className="text-center space-y-1.5">
                <div className="w-44 border-b-2 border-foreground/70 print:border-black/70 pb-1" />
                <span className="font-bold block text-xs">Principal / Head of School</span>
                <span className="text-[11px] text-muted-foreground print:text-gray-600">School Management System</span>
              </div>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
