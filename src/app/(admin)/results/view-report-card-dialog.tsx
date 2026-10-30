"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, Award, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudentTermResult } from "@/lib/mock/results";

interface ViewReportCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: StudentTermResult | null;
}

export function ViewReportCardDialog({
  open,
  onOpenChange,
  result,
}: ViewReportCardDialogProps) {
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

  if (!result) return null;

  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const handlePrint = () => {
    try {
      const existing = document.getElementById("report-card-print-frame");
      if (existing) existing.remove();

      const iframe = document.createElement("iframe");
      iframe.id = "report-card-print-frame";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);

      const subjectsRows = result.subjects
        .map(
          (sub, idx) => `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td><strong>${escapeHtml(sub.subjectName)}</strong></td>
          <td style="text-align: center;">${sub.maxMarks}</td>
          <td style="text-align: center;">${sub.passMarks}</td>
          <td style="text-align: center; font-weight: bold;">${sub.obtainedMarks}</td>
          <td style="text-align: center; font-weight: bold; color: ${sub.isPassed ? "#065f46" : "#b91c1c"};">${escapeHtml(sub.grade)}</td>
          <td>${escapeHtml(sub.remarks || (sub.isPassed ? "Pass" : "Compartment"))}</td>
        </tr>`
        )
        .join("");

      const html = `<!DOCTYPE html>
<html>
<head>
  <title>Progress Report — ${escapeHtml(result.studentName)} (${escapeHtml(result.rollNo)})</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, "Times New Roman", serif; color: #111; line-height: 1.45; font-size: 12px; }
    .border-frame { border: 3px double #1f2937; padding: 18px; border-radius: 6px; }
    .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 10px; margin-bottom: 12px; }
    .school { font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
    .campus { font-size: 11px; color: #444; margin-top: 2px; }
    .title { font-size: 14px; font-weight: 700; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .term { font-size: 12px; font-weight: 600; color: #374151; margin-top: 2px; }
    .info-table { width: 100%; margin-bottom: 14px; font-size: 12px; border-collapse: collapse; }
    .info-table td { padding: 4px 6px; }
    .label { font-weight: bold; width: 15%; color: #374151; }
    .val { width: 35%; border-bottom: 1px dotted #9ca3af; font-weight: 600; }
    .marks-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11.5px; }
    .marks-table th, .marks-table td { border: 1px solid #374151; padding: 6px 8px; }
    .marks-table th { background: #f3f4f6; font-weight: bold; text-align: center; }
    .summary-strip { display: flex; justify-content: space-between; background: #f9fafb; border: 1.5px solid #1f2937; padding: 8px 12px; margin-bottom: 14px; font-weight: bold; font-size: 12px; }
    .remarks-box { border: 1px solid #d1d5db; background: #fff; padding: 10px; border-radius: 4px; margin-bottom: 24px; font-size: 11.5px; }
    .remarks-title { font-weight: bold; margin-bottom: 4px; text-transform: uppercase; font-size: 11px; color: #374151; }
    .signatures { display: flex; justify-content: space-between; margin-top: 40px; padding: 0 10px; font-size: 12px; text-align: center; }
    .sig-line { width: 140px; border-top: 1px solid #111; padding-top: 4px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="border-frame">
    <div class="header">
      <div class="school">EduSphere Grammar High School</div>
      <div class="campus">${escapeHtml(result.campus)}</div>
      <div class="title">Official Detailed Marks Certificate (DMC)</div>
      <div class="term">${escapeHtml(result.termName)}</div>
    </div>

    <table class="info-table">
      <tr>
        <td class="label">Student Name:</td>
        <td class="val">${escapeHtml(result.studentName)}</td>
        <td class="label">Roll Number:</td>
        <td class="val">${escapeHtml(result.rollNo)}</td>
      </tr>
      <tr>
        <td class="label">Father's Name:</td>
        <td class="val">${escapeHtml(result.fatherName)}</td>
        <td class="label">Class:</td>
        <td class="val">${escapeHtml(result.className)}</td>
      </tr>
      <tr>
        <td class="label">Attendance:</td>
        <td class="val">${result.attendancePercentage}%</td>
        <td class="label">Issue Date:</td>
        <td class="val">${escapeHtml(issueDate)}</td>
      </tr>
    </table>

    <table class="marks-table">
      <thead>
        <tr>
          <th style="width: 6%;">Sr.</th>
          <th style="width: 38%; text-align: left;">Subject Name</th>
          <th style="width: 12%;">Max Marks</th>
          <th style="width: 12%;">Pass Marks</th>
          <th style="width: 12%;">Obtained</th>
          <th style="width: 8%;">Grade</th>
          <th style="width: 12%; text-align: left;">Remarks</th>
        </tr>
      </thead>
      <tbody>
        ${subjectsRows}
      </tbody>
    </table>

    <div class="summary-strip">
      <span>Total: ${result.totalObtainedMarks} / ${result.totalMaxMarks}</span>
      <span>Percentage: ${result.percentage.toFixed(1)}%</span>
      <span>Grade: ${escapeHtml(result.overallGrade)}</span>
      <span>Class Position: ${result.position}${result.position === 1 ? "st" : result.position === 2 ? "nd" : result.position === 3 ? "rd" : "th"}</span>
      <span>Result: <strong style="color: ${result.status === "Passed" ? "#065f46" : result.status === "Compartment" ? "#b45309" : "#b91c1c"};">${escapeHtml(result.status)}</strong></span>
    </div>

    <div class="remarks-box">
      <div class="remarks-title">Class Teacher &amp; Evaluator Remarks</div>
      <div>${escapeHtml(result.teacherRemarks)}</div>
    </div>

    <div class="signatures">
      <div class="sig-line">Class Teacher</div>
      <div class="sig-line">Controller of Exams</div>
      <div class="sig-line">Principal</div>
    </div>
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
        className="sm:max-w-[760px] max-h-[92vh] p-0 gap-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl flex flex-col"
      >
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-border/70 bg-muted/30 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand text-cream shrink-0">
              <Award className="size-4" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-bold text-foreground truncate">
                Detailed Marks Certificate (DMC) — {result.studentName}
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
              <span>Print Report Card</span>
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

        {/* Printable Report Card Sheet */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-muted/30 flex-1">
          <div className="mx-auto max-w-[660px] rounded-xl border-2 border-border/90 bg-white text-zinc-900 shadow-md p-6 sm:p-8 space-y-5">
            {/* School Header */}
            <div className="text-center border-b-2 border-zinc-900 pb-3">
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-zinc-900">
                EduSphere Grammar High School
              </h2>
              <p className="text-[11px] text-zinc-600 mt-0.5">{result.campus}</p>
              <div className="mt-1.5 inline-flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                  {result.termName}
                </span>
                <span className="rounded bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand uppercase">
                  Progress Report
                </span>
              </div>
            </div>

            {/* Student Profile Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-b border-zinc-200 pb-3 text-xs text-zinc-800">
              <div>
                <span className="text-zinc-500 font-normal">Student: </span>
                <span className="font-semibold">{result.studentName}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-normal">Roll No: </span>
                <span className="font-mono font-bold">{result.rollNo}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-normal">Father Name: </span>
                <span className="font-semibold">{result.fatherName}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-normal">Class: </span>
                <span className="font-semibold">{result.className}</span>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="rounded-lg border border-zinc-300 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-zinc-100 border-b border-zinc-300 text-zinc-700 font-bold">
                    <th className="py-2 px-2.5 text-center w-8">#</th>
                    <th className="py-2 px-3 text-left">Subject</th>
                    <th className="py-2 px-2 text-center w-16">Max</th>
                    <th className="py-2 px-2 text-center w-16">Pass</th>
                    <th className="py-2 px-2 text-center w-20 font-bold">Obtained</th>
                    <th className="py-2 px-2 text-center w-14">Grade</th>
                    <th className="py-2 px-3 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {result.subjects.map((sub, idx) => (
                    <tr key={sub.subjectName} className="hover:bg-zinc-50">
                      <td className="py-1.5 px-2.5 text-center text-zinc-500">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 px-3 font-medium text-zinc-900">
                        {sub.subjectName}
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono text-zinc-600">
                        {sub.maxMarks}
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono text-zinc-600">
                        {sub.passMarks}
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono font-bold text-zinc-900">
                        {sub.obtainedMarks}
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <span
                          className={cn(
                            "inline-block px-1.5 py-0.5 rounded text-[10px] font-bold font-mono",
                            sub.isPassed
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          )}
                        >
                          {sub.grade}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-zinc-600 text-[11px] truncate">
                        {sub.remarks || (sub.isPassed ? "Pass" : "Compartment")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Performance Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 rounded-lg border-2 border-zinc-900 bg-zinc-50 p-3 text-center text-xs">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Total Marks</p>
                <p className="font-mono font-bold text-sm text-zinc-900">
                  {result.totalObtainedMarks} / {result.totalMaxMarks}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Percentage</p>
                <p className="font-mono font-bold text-sm text-brand">
                  {result.percentage.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Overall Grade</p>
                <p className="font-mono font-bold text-sm text-emerald-700">
                  {result.overallGrade}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Position</p>
                <p className="font-bold text-sm text-amber-700">
                  {result.position === 1
                    ? "1st Place"
                    : result.position === 2
                      ? "2nd Place"
                      : result.position === 3
                        ? "3rd Place"
                        : `${result.position}th Place`}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Status</p>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold mt-0.5",
                    result.status === "Passed"
                      ? "bg-emerald-100 text-emerald-800"
                      : result.status === "Compartment"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                  )}
                >
                  {result.status === "Passed" ? (
                    <CheckCircle2 className="size-3" />
                  ) : (
                    <AlertCircle className="size-3" />
                  )}
                  <span>{result.status}</span>
                </span>
              </div>
            </div>

            {/* Attendance & Teacher Remarks */}
            <div className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3.5 text-xs">
              <div className="flex items-center justify-between text-zinc-700 pb-1.5 border-b border-zinc-200">
                <span className="font-semibold">Term Attendance:</span>
                <span className="font-mono font-bold text-zinc-900">
                  {result.attendancePercentage}% Attendance
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Class Teacher &amp; Head Remarks:
                </p>
                <p className="text-zinc-800 leading-relaxed italic">
                  &ldquo;{result.teacherRemarks}&rdquo;
                </p>
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-6 grid grid-cols-3 gap-6 text-center text-xs text-zinc-700">
              <div className="border-t border-zinc-400 pt-1.5 font-medium">
                Class Teacher
              </div>
              <div className="border-t border-zinc-400 pt-1.5 font-medium">
                Controller of Exams
              </div>
              <div className="border-t border-zinc-400 pt-1.5 font-medium">
                Principal
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
