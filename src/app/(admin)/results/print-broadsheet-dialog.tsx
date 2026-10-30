"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudentTermResult } from "@/lib/mock/results";

interface PrintBroadsheetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: StudentTermResult[];
  classNameLabel: string;
  termLabel: string;
}

export function PrintBroadsheetDialog({
  open,
  onOpenChange,
  results,
  classNameLabel,
  termLabel,
}: PrintBroadsheetDialogProps) {
  const [issueDate, setIssueDate] = React.useState("29 Oct 2026");

  React.useEffect(() => {
    if (open) {
      setIssueDate(
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      );
    }
  }, [open]);

  if (results.length === 0) return null;

  const passedCount = results.filter((r) => r.status === "Passed").length;
  const passRate = ((passedCount / results.length) * 100).toFixed(1);

  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const handlePrint = () => {
    try {
      const existing = document.getElementById("broadsheet-print-frame");
      if (existing) existing.remove();

      const iframe = document.createElement("iframe");
      iframe.id = "broadsheet-print-frame";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);

      const rowsHtml = results
        .map(
          (r) => `
        <tr>
          <td style="text-align: center; font-weight: bold;">${escapeHtml(r.rollNo)}</td>
          <td><strong>${escapeHtml(r.studentName)}</strong><br/><span style="font-size: 10px; color: #555;">s/o ${escapeHtml(r.fatherName)}</span></td>
          <td style="text-align: center; font-family: monospace;">${r.totalObtainedMarks} / ${r.totalMaxMarks}</td>
          <td style="text-align: center; font-family: monospace; font-weight: bold;">${r.percentage.toFixed(1)}%</td>
          <td style="text-align: center; font-weight: bold;">${escapeHtml(r.overallGrade)}</td>
          <td style="text-align: center; font-weight: bold;">${r.position}${r.position === 1 ? "st" : r.position === 2 ? "nd" : r.position === 3 ? "rd" : "th"}</td>
          <td style="text-align: center; font-weight: bold; color: ${r.status === "Passed" ? "#065f46" : r.status === "Compartment" ? "#b45309" : "#b91c1c"};">${escapeHtml(r.status)}</td>
        </tr>`
        )
        .join("");

      const html = `<!DOCTYPE html>
<html>
<head>
  <title>Result Gazette — ${escapeHtml(classNameLabel)} (${escapeHtml(termLabel)})</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, "Times New Roman", serif; color: #111; line-height: 1.4; font-size: 11.5px; }
    .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 10px; }
    .school { font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; }
    .campus { font-size: 11px; color: #444; margin-top: 1px; }
    .title { font-size: 13px; font-weight: 700; margin-top: 4px; text-transform: uppercase; }
    .meta-row { display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding: 5px 0; margin-bottom: 10px; font-size: 11.5px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px; }
    th, td { border: 1px solid #374151; padding: 5px 7px; }
    th { background: #f3f4f6; text-align: center; font-weight: bold; }
    .footer { display: flex; justify-content: space-between; margin-top: 30px; padding: 0 15px; font-size: 11px; text-align: center; }
    .sig-line { width: 150px; border-top: 1px solid #111; padding-top: 4px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <div class="school">EduSphere Grammar High School</div>
    <div class="campus">Class Result Gazette &amp; Broadsheet</div>
    <div class="title">${escapeHtml(termLabel)}</div>
  </div>
  <div class="meta-row">
    <span>Class: ${escapeHtml(classNameLabel)}</span>
    <span>Total Students: ${results.length}</span>
    <span>Passed: ${passedCount} (${passRate}%)</span>
    <span>Date: ${escapeHtml(issueDate)}</span>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 10%;">Roll No</th>
        <th style="width: 32%; text-align: left;">Student Name &amp; Father's Name</th>
        <th style="width: 16%;">Marks (Obt / Max)</th>
        <th style="width: 12%;">Percentage</th>
        <th style="width: 10%;">Grade</th>
        <th style="width: 10%;">Position</th>
        <th style="width: 10%;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
  <div class="footer">
    <div class="sig-line">Prepared By (Class Teacher)</div>
    <div class="sig-line">Verified By (Exam Controller)</div>
    <div class="sig-line">Approved By (Principal)</div>
  </div>
</body>
</html>`;

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
        iframe.contentWindow?.focus();
        setTimeout(() => {
          iframe.contentWindow?.print();
        }, 250);
      }
    } catch {
      window.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[780px] max-h-[90vh] p-0 gap-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl flex flex-col"
      >
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-border/70 bg-muted/30 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand text-cream shrink-0">
              <FileSpreadsheet className="size-4" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-bold text-foreground truncate">
                Class Gazette Broadsheet — {classNameLabel}
              </DialogTitle>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handlePrint}
              className="h-8 text-xs gap-1.5 bg-brand text-cream hover:bg-brand-600 cursor-pointer shadow-xs"
            >
              <Printer className="size-3.5" />
              <span>Print Broadsheet</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground cursor-pointer ml-1"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Sheet Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-muted/30 flex-1">
          <div className="rounded-xl border border-border/80 bg-white text-zinc-900 shadow-md p-6 space-y-4">
            <div className="text-center border-b pb-3 border-zinc-900">
              <h2 className="text-base font-bold uppercase tracking-wide">
                EduSphere Grammar High School
              </h2>
              <p className="text-xs text-zinc-600">Official Class Result Broadsheet</p>
              <p className="text-xs font-bold text-zinc-800 mt-1">{termLabel} — {classNameLabel}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-700 border-b border-zinc-200 pb-2">
              <span>Total Students: <strong>{results.length}</strong></span>
              <span>Passed: <strong className="text-emerald-700">{passedCount}</strong> ({passRate}%)</span>
              <span>Date: <strong>{issueDate}</strong></span>
            </div>

            <div className="rounded-lg border border-zinc-300 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-zinc-100 border-b border-zinc-300 text-zinc-800 font-bold">
                    <th className="py-2 px-2 text-center w-14">Roll No</th>
                    <th className="py-2 px-3 text-left">Student & Father Name</th>
                    <th className="py-2 px-2 text-center w-24">Marks</th>
                    <th className="py-2 px-2 text-center w-16">%</th>
                    <th className="py-2 px-2 text-center w-14">Grade</th>
                    <th className="py-2 px-2 text-center w-14">Rank</th>
                    <th className="py-2 px-2 text-center w-20">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {results.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-50">
                      <td className="py-2 px-2 text-center font-mono font-semibold text-zinc-900">
                        {r.rollNo}
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-zinc-900">{r.studentName}</div>
                        <div className="text-[11px] text-zinc-500">s/o {r.fatherName}</div>
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-zinc-700">
                        {r.totalObtainedMarks} / {r.totalMaxMarks}
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-zinc-900">
                        {r.percentage.toFixed(1)}%
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-emerald-800">
                        {r.overallGrade}
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-amber-700">
                        {r.position}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold",
                            r.status === "Passed"
                              ? "bg-emerald-100 text-emerald-800"
                              : r.status === "Compartment"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                          )}>
                            {r.status}
                          </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
