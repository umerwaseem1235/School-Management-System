"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ClassTest, StudentTestMark } from "@/lib/mock/tests-assessments";
import { Printer, School, ShieldCheck, X, FileText, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/format";

interface PrintAwardListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: ClassTest | null;
  marks: StudentTestMark[];
}

export function PrintAwardListDialog({
  open,
  onOpenChange,
  test,
  marks,
}: PrintAwardListDialogProps) {
  const [currentDate, setCurrentDate] = React.useState("27 Oct 2026");

  React.useEffect(() => {
    if (open) {
      setCurrentDate(
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      );
    }
  }, [open]);

  if (!test) return null;

  // Compute summary stats
  const totalStudents = marks.length;
  const absentCount = marks.filter((m) => m.isAbsent).length;
  const appearedCount = totalStudents - absentCount;
  const passedCount = marks.filter((m) => !m.isAbsent && m.status === "Pass").length;
  const failedCount = marks.filter((m) => !m.isAbsent && m.status === "Fail").length;
  const passRate =
    appearedCount > 0 ? ((passedCount / appearedCount) * 100).toFixed(1) : "0.0";

  const highestScore =
    appearedCount > 0 ? Math.max(...marks.filter((m) => !m.isAbsent).map((m) => m.obtainedMarks)) : 0;

  const averageScore =
    appearedCount > 0
      ? (
          marks.filter((m) => !m.isAbsent).reduce((acc, m) => acc + m.obtainedMarks, 0) /
          appearedCount
        ).toFixed(1)
      : "0";

  const handlePrint = () => {
    try {
      const existingIframe = document.getElementById("award-list-print-frame");
      if (existingIframe) {
        existingIframe.remove();
      }

      const iframe = document.createElement("iframe");
      iframe.id = "award-list-print-frame";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);

      const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!frameDoc) {
        window.print();
        return;
      }

      const rowsHtml = marks
        .map((m, idx) => {
          const isAbs = m.isAbsent;
          const statusClass = isAbs ? "fail" : m.status === "Pass" ? "pass" : "fail";
          const obtainedStr = isAbs ? "ABS" : m.obtainedMarks.toString();
          const pctStr = isAbs ? "—" : `${m.percentage}%`;
          const gradeStr = isAbs ? "ABS" : m.grade;
          const statusStr = isAbs ? "ABSENT" : m.status.toUpperCase();

          return `
            <tr>
              <td class="center mono bold">${idx + 1}</td>
              <td class="center mono bold">${m.rollNo}</td>
              <td class="bold">${m.studentName}</td>
              <td class="muted">${m.fatherName}</td>
              <td class="center mono">${m.totalMarks}</td>
              <td class="center mono bold ${isAbs ? "muted" : ""}">${obtainedStr}</td>
              <td class="center mono">${pctStr}</td>
              <td class="center mono bold">${gradeStr}</td>
              <td class="center bold ${statusClass}">${statusStr}</td>
              <td class="text-xs muted">${m.remarks || "—"}</td>
            </tr>
          `;
        })
        .join("");

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Official Award List - ${test.subject} (${test.className})</title>
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
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    .crest-block {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .crest-box {
      width: 44px;
      height: 44px;
      border: 1.5px solid #000000;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 14px;
      letter-spacing: 1px;
      color: #000000;
      background: #f0f0f0;
    }
    .school-title {
      font-size: 15px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #000000;
      line-height: 1.15;
    }
    .school-sub {
      font-size: 9.5px;
      font-weight: 700;
      color: #000000;
      margin-top: 2px;
    }
    .school-affil {
      font-size: 8.5px;
      color: #333333;
    }
    .badge-wrap {
      text-align: right;
    }
    .official-badge {
      display: inline-block;
      font-size: 9px;
      font-weight: 800;
      border: 1.5px solid #000000;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #ffffff;
      color: #000000;
    }
    .issue-date {
      font-size: 8.5px;
      color: #333333;
      margin-top: 4px;
      font-family: monospace;
    }
    .doc-title {
      text-align: center;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.75px;
      text-decoration: underline;
      text-underline-offset: 4px;
      margin-bottom: 10px;
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
      margin-bottom: 10px;
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
      font-size: 10px;
      font-weight: 800;
      color: #000000;
      display: block;
      margin-top: 1px;
    }
    .stats-strip {
      display: flex;
      justify-content: space-between;
      background: #f7f7f7;
      border: 1px solid #000000;
      border-radius: 4px;
      padding: 5px 12px;
      margin-bottom: 10px;
      font-size: 9px;
    }
    .stats-strip div {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .stats-strip .k {
      color: #444;
      font-weight: 600;
    }
    .stats-strip .v {
      font-weight: 800;
      color: #000;
    }
    table {
      width: 100% !important;
      border-collapse: collapse;
      margin-bottom: 12px;
      table-layout: fixed;
      border: 1.5px solid #000000;
    }
    th {
      background: #f0f0f0;
      color: #000000;
      font-weight: 800;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 5px 6px;
      border: 1px solid #000000;
      text-align: left;
    }
    td {
      padding: 4px 6px;
      border: 1px solid #000000;
      font-size: 9.5px;
      color: #000000;
      vertical-align: middle;
    }
    tr:nth-child(even) {
      background-color: #fafafa;
    }
    .center {
      text-align: center;
    }
    .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .bold {
      font-weight: 700;
    }
    .muted {
      color: #444444;
    }
    .text-xs {
      font-size: 8.5px;
    }
    .pass {
      color: #000000;
    }
    .fail {
      color: #000000;
      text-decoration: underline;
    }
    .sign-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 0 10px;
      margin-top: 18px;
      page-break-inside: avoid;
    }
    .sign-col {
      text-align: center;
      width: 130px;
    }
    .sign-line {
      border-bottom: 1.5px solid #000000;
      margin-bottom: 4px;
    }
    .sign-name {
      font-size: 9.5px;
      font-weight: 700;
      color: #000000;
      display: block;
    }
    .sign-dept {
      font-size: 8.5px;
      color: #333333;
      display: block;
    }
    .seal-box {
      width: 58px;
      height: 58px;
      border: 1.5px dashed #000000;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 7.5px;
      font-family: monospace;
      color: #000000;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="header-wrap">
    <div class="crest-block">
      <div class="crest-box">SMS</div>
      <div>
        <h1 class="school-title">School Management System</h1>
        <p class="school-sub">Academic Cell · Continuous Assessment & Evaluation Register</p>
        <p class="school-affil">Affiliated with Board of Intermediate & Secondary Education (BISE)</p>
      </div>
    </div>
    <div class="badge-wrap">
      <span class="official-badge">Official Award List</span>
      <p class="issue-date">Date: ${currentDate}</p>
    </div>
  </div>

  <div class="doc-title">CLASS TEST AWARD LIST / نتیجہ شیٹ</div>

  <div class="meta-grid">
    <div class="meta-item">
      <span class="label">Class & Section</span>
      <span class="val">${test.className} (Sec: ${test.section})</span>
    </div>
    <div class="meta-item">
      <span class="label">Subject & Code</span>
      <span class="val">${test.subject} (${test.subjectCode})</span>
    </div>
    <div class="meta-item">
      <span class="label">Assessment Type</span>
      <span class="val">${test.testType}</span>
    </div>
    <div class="meta-item">
      <span class="label">Conducted Date</span>
      <span class="val">${formatDate(test.testDate)}</span>
    </div>
    <div class="meta-item">
      <span class="label">Total Marks</span>
      <span class="val">${test.totalMarks} Marks</span>
    </div>
    <div class="meta-item">
      <span class="label">Pass Benchmark</span>
      <span class="val">${test.passingMarks} Marks (33% Min)</span>
    </div>
    <div class="meta-item" style="grid-column: span 2;">
      <span class="label">Teacher Incharge</span>
      <span class="val">${test.teacherName}</span>
    </div>
  </div>

  <div class="stats-strip">
    <div><span class="k">Enrolled:</span> <span class="v">${totalStudents}</span></div>
    <div><span class="k">Appeared:</span> <span class="v">${appearedCount}</span></div>
    <div><span class="k">Passed:</span> <span class="v">${passedCount}</span></div>
    <div><span class="k">Failed:</span> <span class="v">${failedCount}</span></div>
    <div><span class="k">Absent:</span> <span class="v">${absentCount}</span></div>
    <div><span class="k">Pass Rate:</span> <span class="v">${passRate}%</span></div>
    <div><span class="k">Class Avg:</span> <span class="v">${averageScore}/${test.totalMarks}</span></div>
    <div><span class="k">Highest:</span> <span class="v">${highestScore}/${test.totalMarks}</span></div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 5%; text-align: center;">Sr#</th>
        <th style="width: 7%; text-align: center;">Roll#</th>
        <th style="width: 22%;">Student Name</th>
        <th style="width: 19%;">Father Name</th>
        <th style="width: 8%; text-align: center;">Max</th>
        <th style="width: 9%; text-align: center;">Obt</th>
        <th style="width: 8%; text-align: center;">%</th>
        <th style="width: 7%; text-align: center;">Grade</th>
        <th style="width: 7%; text-align: center;">Status</th>
        <th style="width: 14%;">Remarks</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="sign-row">
    <div class="sign-col">
      <div class="sign-line"></div>
      <span class="sign-name">${test.teacherName}</span>
      <span class="sign-dept">Subject Teacher</span>
    </div>
    <div class="sign-col">
      <div class="sign-line"></div>
      <span class="sign-name">Class Incharge</span>
      <span class="sign-dept">Section ${test.section} Incharge</span>
    </div>
    <div class="seal-box">
      <span>Official</span>
      <span>Stamp</span>
    </div>
    <div class="sign-col">
      <div class="sign-line"></div>
      <span class="sign-name">Vice Principal</span>
      <span class="sign-dept">Academic Cell</span>
    </div>
    <div class="sign-col">
      <div class="sign-line"></div>
      <span class="sign-name">Principal</span>
      <span class="sign-dept">Head of School</span>
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
        className="max-w-[94vw] sm:max-w-4xl p-0 gap-0 overflow-hidden flex flex-col h-[88vh] bg-background border-border/80 shadow-2xl rounded-2xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          Official Class Test Award List Preview
        </DialogTitle>

        {/* Dialog Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3.5 border-b border-border/80 bg-muted/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-soft text-brand font-bold text-xs shrink-0 ring-1 ring-brand/20">
              <FileText className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                Official Award List Preview
                <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border/60">
                  {test.subject} · {test.className}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Standard Pakistani School Board award list sheet (A4 Print Ready)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-brand text-brand-foreground hover:bg-brand/90 gap-1.5 text-xs font-semibold h-8 shadow-xs"
            >
              <Printer className="size-3.5" />
              <span>Print Award List</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5 mr-1" />
              Close
            </Button>
          </div>
        </div>

        {/* Paper Sheet Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/30">
          <div className="max-w-3xl mx-auto bg-white dark:bg-card border border-border/80 rounded-xl p-6 sm:p-8 shadow-sm space-y-5 text-foreground">
            {/* Institution Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-lg border-2 border-foreground/80 flex items-center justify-center font-black text-sm tracking-wider bg-muted/20">
                  SMS
                </div>
                <div>
                  <h1 className="text-base font-extrabold uppercase tracking-tight text-foreground">
                    School Management System
                  </h1>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Academic Cell · Continuous Assessment & Evaluation Register
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Affiliated with Board of Intermediate & Secondary Education (BISE)
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold border border-foreground/60 px-2 py-1 rounded uppercase tracking-wider">
                  Official Award List
                </span>
                <p className="text-[11px] text-muted-foreground mt-1.5 font-mono">
                  Date: {currentDate}
                </p>
              </div>
            </div>

            {/* Title */}
            <div className="text-center">
              <h2 className="text-sm font-extrabold uppercase tracking-wide underline underline-offset-4">
                Class Test Award List (نتیجہ ٹیسٹ)
              </h2>
            </div>

            {/* Metadata Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg border border-border/80 bg-muted/10 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Class & Section
                </span>
                <span className="font-bold text-foreground">
                  {test.className} (Sec: {test.section})
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Subject
                </span>
                <span className="font-bold text-foreground">
                  {test.subject} ({test.subjectCode})
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Assessment Type
                </span>
                <span className="font-bold text-foreground">{test.testType}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Conducted Date
                </span>
                <span className="font-bold text-foreground">
                  {formatDate(test.testDate)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Total Marks
                </span>
                <span className="font-bold text-foreground">{test.totalMarks} Marks</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Passing Benchmark
                </span>
                <span className="font-bold text-foreground">
                  {test.passingMarks} Marks (33%)
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Teacher Incharge
                </span>
                <span className="font-bold text-foreground">{test.teacherName}</span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg border border-border/60 bg-muted/30 text-xs font-medium">
              <span>Enrolled: <strong>{totalStudents}</strong></span>
              <span>Appeared: <strong>{appearedCount}</strong></span>
              <span>Passed: <strong className="text-emerald-600 dark:text-emerald-400">{passedCount}</strong></span>
              <span>Failed: <strong className="text-rose-600 dark:text-rose-400">{failedCount}</strong></span>
              <span>Absent: <strong>{absentCount}</strong></span>
              <span>Pass Rate: <strong>{passRate}%</strong></span>
              <span>Class Avg: <strong>{averageScore}/{test.totalMarks}</strong></span>
              <span>Highest: <strong>{highestScore}/{test.totalMarks}</strong></span>
            </div>

            {/* Table */}
            <div className="border border-border/80 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-muted/70 text-foreground text-[11px] font-bold uppercase border-b border-border/80">
                  <tr>
                    <th className="p-2 text-center w-10">Sr#</th>
                    <th className="p-2 text-center w-14">Roll#</th>
                    <th className="p-2">Student Name</th>
                    <th className="p-2">Father Name</th>
                    <th className="p-2 text-center w-14">Total</th>
                    <th className="p-2 text-center w-14">Obtained</th>
                    <th className="p-2 text-center w-12">%</th>
                    <th className="p-2 text-center w-14">Grade</th>
                    <th className="p-2 text-center w-16">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono text-[11px]">
                  {marks.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-muted/20">
                      <td className="p-2 text-center">{idx + 1}</td>
                      <td className="p-2 text-center font-bold">{m.rollNo}</td>
                      <td className="p-2 font-sans font-semibold text-foreground">
                        {m.studentName}
                      </td>
                      <td className="p-2 font-sans text-muted-foreground">
                        {m.fatherName}
                      </td>
                      <td className="p-2 text-center">{m.totalMarks}</td>
                      <td className="p-2 text-center font-bold">
                        {m.isAbsent ? <span className="text-muted-foreground font-sans">ABS</span> : m.obtainedMarks}
                      </td>
                      <td className="p-2 text-center">
                        {m.isAbsent ? "—" : `${m.percentage}%`}
                      </td>
                      <td className="p-2 text-center font-bold">
                        {m.isAbsent ? "ABS" : m.grade}
                      </td>
                      <td className="p-2 text-center">
                        {m.isAbsent ? (
                          <span className="text-muted-foreground font-sans font-semibold">
                            ABSENT
                          </span>
                        ) : m.status === "Pass" ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-sans font-bold">
                            PASS
                          </span>
                        ) : (
                          <span className="text-rose-700 dark:text-rose-400 font-sans font-bold">
                            FAIL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-4 gap-4 pt-6 text-center text-xs">
              <div className="space-y-1">
                <div className="border-b border-foreground/60 w-3/4 mx-auto pb-4"></div>
                <p className="font-bold text-foreground">{test.teacherName}</p>
                <p className="text-[10px] text-muted-foreground">Subject Teacher</p>
              </div>
              <div className="space-y-1">
                <div className="border-b border-foreground/60 w-3/4 mx-auto pb-4"></div>
                <p className="font-bold text-foreground">Class Incharge</p>
                <p className="text-[10px] text-muted-foreground">Section {test.section}</p>
              </div>
              <div className="space-y-1">
                <div className="border-b border-foreground/60 w-3/4 mx-auto pb-4"></div>
                <p className="font-bold text-foreground">Vice Principal</p>
                <p className="text-[10px] text-muted-foreground">Academic Cell</p>
              </div>
              <div className="space-y-1">
                <div className="border-b border-foreground/60 w-3/4 mx-auto pb-4"></div>
                <p className="font-bold text-foreground">Principal</p>
                <p className="text-[10px] text-muted-foreground">Head of School</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
