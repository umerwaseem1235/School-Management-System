"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, FileText, X } from "lucide-react";
import type { AdmissionApplicantRecord } from "@/lib/mock/admission-tests";

export interface MeritCandidateRow extends AdmissionApplicantRecord {
  sessionTitle: string;
}

interface PrintMeritListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: MeritCandidateRow[];
  classFilterLabel: string;
}

export function PrintMeritListDialog({
  open,
  onOpenChange,
  candidates,
  classFilterLabel,
}: PrintMeritListDialogProps) {
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

  const approvedCount = candidates.filter((c) => c.decision === "Approved").length;
  const waitlistedCount = candidates.filter((c) => c.decision === "Waitlisted").length;

  const handlePrint = () => {
    try {
      const existing = document.getElementById("merit-list-print-frame");
      if (existing) existing.remove();

      const iframe = document.createElement("iframe");
      iframe.id = "merit-list-print-frame";
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

      const rowsHtml = candidates
        .map(
          (c, idx) => `
          <tr>
            <td class="center mono bold">#${idx + 1}</td>
            <td class="center mono bold">${c.formNo}</td>
            <td class="bold">${c.applicantName}</td>
            <td>${c.fatherName}</td>
            <td class="center">${c.appliedClass}</td>
            <td class="center mono bold">${c.obtainedMarks} / ${c.totalMarks} (${c.percentage}%)</td>
            <td class="center bold">${c.decision.toUpperCase()}</td>
          </tr>
        `
        )
        .join("");

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Admission Entry Test Merit List</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; color: #000 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; font-size: 10.5px; line-height: 1.4; padding: 4px; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
    .crest-wrap { display: flex; align-items: center; gap: 10px; }
    .crest { width: 42px; height: 42px; border: 1.5px solid #000; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; background: #f2f2f2; }
    .school { font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; }
    .sub { font-size: 9.5px; font-weight: 600; margin-top: 2px; }
    .badge { border: 1.5px solid #000; padding: 3px 8px; border-radius: 4px; font-size: 9px; font-weight: 800; text-transform: uppercase; }
    .date { font-size: 8.5px; font-family: monospace; margin-top: 4px; text-align: right; }
    .title { text-align: center; font-size: 13px; font-weight: 800; text-transform: uppercase; text-decoration: underline; text-underline-offset: 4px; margin-bottom: 10px; }
    .strip { display: flex; justify-content: space-between; border: 1px solid #000; background: #f7f7f7; border-radius: 4px; padding: 6px 12px; margin-bottom: 12px; font-size: 9.5px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; border: 1.5px solid #000; margin-bottom: 22px; }
    th { background: #efefef; border: 1px solid #000; padding: 6px; font-size: 9px; font-weight: 800; text-transform: uppercase; text-align: left; }
    td { border: 1px solid #000; padding: 5px 6px; font-size: 9.5px; }
    .center { text-align: center; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .bold { font-weight: 700; }
    .signs { display: flex; justify-content: space-between; margin-top: 28px; padding: 0 12px; page-break-inside: avoid; }
    .sign-col { width: 150px; text-align: center; }
    .line { border-bottom: 1.5px solid #000; margin-bottom: 4px; height: 24px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="crest-wrap">
      <div class="crest">SMS</div>
      <div>
        <div class="school">School Management System</div>
        <div class="sub">Admission Cell • Entry Test & Merit Committee (Session 2026–27)</div>
      </div>
    </div>
    <div>
      <div class="badge">Official Merit List</div>
      <div class="date">Issued: ${issueDate}</div>
    </div>
  </div>

  <div class="title">ADMISSION ENTRY TEST MERIT LIST — ${classFilterLabel.toUpperCase()}</div>

  <div class="strip">
    <span>Shortlisted Candidates: ${candidates.length}</span>
    <span>Approved for Admission: ${approvedCount}</span>
    <span>Waiting List: ${waitlistedCount}</span>
    <span>Qualifying Benchmark: Min. 50%</span>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 9%; text-align: center;">Merit #</th>
        <th style="width: 14%; text-align: center;">Form #</th>
        <th style="width: 22%;">Candidate Name</th>
        <th style="width: 20%;">Father Name</th>
        <th style="width: 15%; text-align: center;">Applied Class</th>
        <th style="width: 18%; text-align: center;">Test Score</th>
        <th style="width: 12%; text-align: center;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="signs">
    <div class="sign-col">
      <div class="line"></div>
      <div class="bold">Admission Officer</div>
      <div style="font-size: 8.5px;">Registration Office</div>
    </div>
    <div class="sign-col">
      <div class="line"></div>
      <div class="bold">Academic Coordinator</div>
      <div style="font-size: 8.5px;">Examination Cell</div>
    </div>
    <div class="sign-col">
      <div class="line"></div>
      <div class="bold">Principal</div>
      <div style="font-size: 8.5px;">Final Approval</div>
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
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 1500);
      }, 250);
    } catch {
      window.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[94vw] sm:max-w-4xl p-0 gap-0 overflow-hidden flex flex-col h-[86vh] bg-background border-border/80 shadow-2xl rounded-2xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          Admission Entry Test Merit List Preview
        </DialogTitle>

        {/* Dialog Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3.5 border-b border-border/80 bg-muted/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-soft text-brand shrink-0 ring-1 ring-brand/20">
              <FileText className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Admission Merit List Preview
              </h2>
              <p className="text-xs text-muted-foreground">
                {classFilterLabel} • {candidates.length} Shortlisted Candidates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-brand text-cream hover:bg-brand-600 gap-1.5 text-xs font-semibold h-8.5 px-3.5 shadow-xs cursor-pointer"
            >
              <Printer className="size-3.5" />
              <span>Print Merit List</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8.5 px-3 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5 mr-1" />
              Close
            </Button>
          </div>
        </div>

        {/* Preview Sheet */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/30">
          <div className="max-w-3xl mx-auto bg-white dark:bg-card border border-border/80 rounded-xl p-6 sm:p-8 shadow-sm space-y-5 text-foreground">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-lg border-2 border-foreground/80 flex items-center justify-center font-black text-sm bg-muted/20">
                  SMS
                </div>
                <div>
                  <h1 className="text-base font-extrabold uppercase tracking-tight">
                    School Management System
                  </h1>
                  <p className="text-xs font-medium text-muted-foreground">
                    Admission Cell • Entry Test & Merit Committee (Session 2026–27)
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold border border-foreground/60 px-2.5 py-1 rounded uppercase tracking-wider">
                  Official Merit List
                </span>
                <p className="text-[11px] text-muted-foreground mt-1.5 font-mono">
                  Date: {issueDate}
                </p>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-sm font-extrabold uppercase tracking-wide underline underline-offset-4">
                Admission Entry Test Merit List — {classFilterLabel}
              </h2>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg border border-border/70 bg-muted/25 text-xs font-medium">
              <span>
                Shortlisted: <strong>{candidates.length}</strong>
              </span>
              <span>
                Approved:{" "}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {approvedCount}
                </strong>
              </span>
              <span>
                Waitlisted: <strong>{waitlistedCount}</strong>
              </span>
              <span>
                Qualifying Standard: <strong>Min. 50%</strong>
              </span>
            </div>

            <div className="border border-border/80 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-muted/70 text-foreground text-[11px] font-bold uppercase border-b border-border/80">
                  <tr>
                    <th className="p-2.5 text-center w-16">Merit #</th>
                    <th className="p-2.5 text-center w-28">Form #</th>
                    <th className="p-2.5">Candidate Name</th>
                    <th className="p-2.5">Father Name</th>
                    <th className="p-2.5 text-center">Applied Class</th>
                    <th className="p-2.5 text-center">Score</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs">
                  {candidates.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-muted/20">
                      <td className="p-2.5 text-center font-mono font-bold">
                        #{idx + 1}
                      </td>
                      <td className="p-2.5 text-center font-mono font-semibold">
                        {c.formNo}
                      </td>
                      <td className="p-2.5 font-semibold text-foreground">
                        {c.applicantName}
                      </td>
                      <td className="p-2.5 text-muted-foreground">
                        {c.fatherName}
                      </td>
                      <td className="p-2.5 text-center">{c.appliedClass}</td>
                      <td className="p-2.5 text-center font-mono font-semibold">
                        {c.obtainedMarks}/{c.totalMarks} ({c.percentage}%)
                      </td>
                      <td className="p-2.5 text-center font-semibold">
                        {c.decision}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 text-center text-xs">
              <div className="space-y-1">
                <div className="border-b border-foreground/60 w-3/4 mx-auto pb-5" />
                <p className="font-bold text-foreground">Admission Officer</p>
                <p className="text-[11px] text-muted-foreground">
                  Registration Office
                </p>
              </div>
              <div className="space-y-1">
                <div className="border-b border-foreground/60 w-3/4 mx-auto pb-5" />
                <p className="font-bold text-foreground">Academic Coordinator</p>
                <p className="text-[11px] text-muted-foreground">
                  Examination Cell
                </p>
              </div>
              <div className="space-y-1">
                <div className="border-b border-foreground/60 w-3/4 mx-auto pb-5" />
                <p className="font-bold text-foreground">Principal</p>
                <p className="text-[11px] text-muted-foreground">
                  Head of Institution
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
