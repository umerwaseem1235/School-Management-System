"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, KeyRound, FileText, X } from "lucide-react";
import { cn } from "cn";
import type {
  GeneratedPaper,
  QuestionBankItem,
} from "@/lib/mock/paper-generator";

interface PrintPaperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paper: GeneratedPaper | null;
  questionBank: QuestionBankItem[];
}

export function PrintPaperDialog({
  open,
  onOpenChange,
  paper,
  questionBank,
}: PrintPaperDialogProps) {
  const [showAnswerKey, setShowAnswerKey] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setShowAnswerKey(false);
    }
  }, [open]);

  const resolvedQuestions = React.useMemo(() => {
    if (!paper) return { mcqs: [], shorts: [], longs: [], totalMarks: 0 };
    const map = new Map(questionBank.map((q) => [q.id, q]));
    const selected = paper.questionIds
      .map((id) => map.get(id))
      .filter((q): q is QuestionBankItem => Boolean(q));

    const mcqs = selected.filter((q) => q.type === "MCQ");
    const shorts = selected.filter((q) => q.type === "Short");
    const longs = selected.filter((q) => q.type === "Long");
    const totalMarks = selected.reduce((sum, q) => sum + q.marks, 0);

    return { mcqs, shorts, longs, totalMarks };
  }, [paper, questionBank]);

  if (!paper) return null;

  const { mcqs, shorts, longs, totalMarks } = resolvedQuestions;
  const mcqMarks = mcqs.reduce((s, q) => s + q.marks, 0);
  const shortMarks = shorts.reduce((s, q) => s + q.marks, 0);
  const longMarks = longs.reduce((s, q) => s + q.marks, 0);

  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const handlePrint = () => {
    try {
      const existing = document.getElementById("exam-paper-print-frame");
      if (existing) existing.remove();

      const iframe = document.createElement("iframe");
      iframe.id = "exam-paper-print-frame";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);

      const mcqHtml =
        mcqs.length > 0
          ? `<div class="section">
              <div class="sec-head">
                <span>SECTION A — OBJECTIVE (MCQs)</span>
                <span>Marks: ${mcqMarks}</span>
              </div>
              <p class="sec-note">Encircle the correct option for each question. Cutting or overwriting is not allowed.</p>
              ${mcqs
                .map(
                  (q, idx) => `
                  <div class="q-block">
                    <div class="q-line">
                      <span><strong>${idx + 1}.</strong> ${escapeHtml(q.statement)}</span>
                      <span class="q-mark">(${q.marks})</span>
                    </div>
                    ${
                      q.options
                        ? `<div class="opts">
                            <span>(A) ${escapeHtml(q.options.A)}${showAnswerKey && q.correctOption === "A" ? " ✓" : ""}</span>
                            <span>(B) ${escapeHtml(q.options.B)}${showAnswerKey && q.correctOption === "B" ? " ✓" : ""}</span>
                            <span>(C) ${escapeHtml(q.options.C)}${showAnswerKey && q.correctOption === "C" ? " ✓" : ""}</span>
                            <span>(D) ${escapeHtml(q.options.D)}${showAnswerKey && q.correctOption === "D" ? " ✓" : ""}</span>
                          </div>`
                        : ""
                    }
                    ${
                      showAnswerKey && q.correctOption
                        ? `<div class="ans-key">Answer: Option (${q.correctOption})</div>`
                        : ""
                    }
                  </div>`
                )
                .join("")}
            </div>`
          : "";

      const shortHtml =
        shorts.length > 0
          ? `<div class="section">
              <div class="sec-head">
                <span>SECTION B — SHORT QUESTIONS</span>
                <span>Marks: ${shortMarks}</span>
              </div>
              <p class="sec-note">Write brief and to-the-point answers to the following questions.</p>
              ${shorts
                .map(
                  (q, idx) => `
                  <div class="q-block">
                    <div class="q-line">
                      <span><strong>Q.${idx + 1}:</strong> ${escapeHtml(q.statement)}</span>
                      <span class="q-mark">(${q.marks})</span>
                    </div>
                    ${
                      showAnswerKey && q.answerHint
                        ? `<div class="ans-key">Marking Note: ${escapeHtml(q.answerHint)}</div>`
                        : ""
                    }
                  </div>`
                )
                .join("")}
            </div>`
          : "";

      const longHtml =
        longs.length > 0
          ? `<div class="section">
              <div class="sec-head">
                <span>SECTION C — DESCRIPTIVE / LONG QUESTIONS</span>
                <span>Marks: ${longMarks}</span>
              </div>
              <p class="sec-note">Attempt the following questions in detail with neat diagrams or steps where required.</p>
              ${longs
                .map(
                  (q, idx) => `
                  <div class="q-block">
                    <div class="q-line">
                      <span><strong>Q.${idx + 1}:</strong> ${escapeHtml(q.statement)}</span>
                      <span class="q-mark">(${q.marks})</span>
                    </div>
                    ${
                      showAnswerKey && q.answerHint
                        ? `<div class="ans-key">Marking Note: ${escapeHtml(q.answerHint)}</div>`
                        : ""
                    }
                  </div>`
                )
                .join("")}
            </div>`
          : "";

      const html = `<!DOCTYPE html>
<html>
<head>
  <title>${escapeHtml(paper.title)}</title>
  <style>
    @page { size: A4 portrait; margin: 14mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, "Times New Roman", serif; color: #111; line-height: 1.45; font-size: 12px; }
    .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 10px; margin-bottom: 10px; }
    .school { font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; }
    .campus { font-size: 11px; color: #444; margin-top: 2px; }
    .term { font-size: 13px; font-weight: 700; margin-top: 5px; }
    .meta-row { display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding: 6px 0; font-size: 12px; font-weight: 600; }
    .student-row { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px solid #aaa; padding: 8px 0; margin-bottom: 12px; font-size: 11.5px; }
    .section { margin-bottom: 16px; }
    .sec-head { display: flex; justify-content: space-between; font-weight: 700; font-size: 12.5px; background: #f3f4f6; border: 1px solid #d1d5db; padding: 4px 8px; margin-bottom: 4px; }
    .sec-note { font-style: italic; font-size: 11px; color: #444; margin-bottom: 8px; }
    .q-block { margin-bottom: 9px; page-break-inside: avoid; }
    .q-line { display: flex; justify-content: space-between; gap: 12px; }
    .q-mark { font-weight: 700; white-space: nowrap; }
    .opts { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 16px; padding-left: 18px; margin-top: 3px; font-size: 11.5px; }
    .ans-key { margin-top: 3px; padding-left: 18px; font-size: 11px; font-weight: 700; color: #065f46; }
  </style>
</head>
<body>
  <div class="header">
    <div class="school">EduSphere Grammar High School</div>
    <div class="campus">${escapeHtml(paper.campus)}</div>
    <div class="term">${escapeHtml(paper.examTerm)}${showAnswerKey ? " — TEACHER ANSWER KEY" : ""}</div>
  </div>
  <div class="meta-row">
    <span>Class: ${escapeHtml(paper.className)}</span>
    <span>Subject: ${escapeHtml(paper.subject)}</span>
    <span>Time Allowed: ${escapeHtml(paper.duration)}</span>
    <span>Maximum Marks: ${totalMarks}</span>
  </div>
  <div class="student-row">
    <span>Student Name: ___________________________________</span>
    <span>Roll No: ___________________</span>
    <span>Section: _________</span>
  </div>
  ${mcqHtml}
  ${shortHtml}
  ${longHtml}
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
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-border/70 bg-muted/30 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand text-cream shrink-0">
              <FileText className="size-4" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-bold text-foreground truncate">
                {paper.title}
              </DialogTitle>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={showAnswerKey ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAnswerKey((prev) => !prev)}
              className={cn(
                "h-8 text-xs gap-1.5 cursor-pointer",
                showAnswerKey &&
                  "bg-emerald-600 text-white hover:bg-emerald-700"
              )}
            >
              <KeyRound className="size-3.5" />
              <span>{showAnswerKey ? "Answer Key On" : "Answer Key"}</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handlePrint}
              className="h-8 text-xs gap-1.5 bg-brand text-cream hover:bg-brand-600 cursor-pointer"
            >
              <Printer className="size-3.5" />
              <span>Print Paper</span>
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

        {/* Printable Paper Sheet Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-muted/30 flex-1">
          <div className="mx-auto max-w-[680px] rounded-xl border border-border/80 bg-white text-zinc-900 shadow-sm p-6 sm:p-8 space-y-5">
            {/* Formal School Paper Header */}
            <div className="text-center border-b-2 border-zinc-900 pb-3.5">
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-zinc-900">
                EduSphere Grammar High School
              </h2>
              <p className="text-[11px] text-zinc-600 mt-0.5">{paper.campus}</p>
              <div className="mt-1.5 inline-flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                  {paper.examTerm}
                </span>
                {showAnswerKey && (
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                    Teacher Answer Key
                  </span>
                )}
              </div>
            </div>

            {/* Paper Metadata Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-zinc-300 pb-3 text-xs font-semibold text-zinc-800">
              <div>
                <span className="text-zinc-500 font-normal">Class: </span>
                {paper.className}
              </div>
              <div>
                <span className="text-zinc-500 font-normal">Subject: </span>
                {paper.subject}
              </div>
              <div>
                <span className="text-zinc-500 font-normal">Time: </span>
                {paper.duration}
              </div>
              <div className="sm:text-right">
                <span className="text-zinc-500 font-normal">Max. Marks: </span>
                <span className="font-mono font-bold">{totalMarks}</span>
              </div>
            </div>

            {/* Candidate Info Lines */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-zinc-200 pb-3 text-[11px] text-zinc-700">
              <div className="sm:col-span-2 flex items-end gap-1.5">
                <span className="font-semibold shrink-0">Student Name:</span>
                <span className="flex-1 border-b border-dotted border-zinc-400 h-4" />
              </div>
              <div className="flex items-end gap-1.5">
                <span className="font-semibold shrink-0">Roll No:</span>
                <span className="flex-1 border-b border-dotted border-zinc-400 h-4" />
              </div>
            </div>

            {/* Section A: MCQs */}
            {mcqs.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded bg-zinc-100 border border-zinc-300 px-3 py-1.5 text-xs font-bold text-zinc-900">
                  <span>SECTION A — OBJECTIVE TYPE (MCQs)</span>
                  <span className="font-mono">Marks: {mcqMarks}</span>
                </div>
                <p className="text-[11px] italic text-zinc-600">
                  Note: Encircle the correct option for each question. Cutting
                  or overwriting is not allowed.
                </p>

                <div className="space-y-3">
                  {mcqs.map((q, idx) => (
                    <div key={q.id} className="space-y-1.5 text-xs">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-zinc-900 leading-relaxed">
                          <span className="font-bold mr-1.5">{idx + 1}.</span>
                          {q.statement}
                        </p>
                        <span className="font-mono text-[11px] font-semibold text-zinc-600 shrink-0">
                          ({q.marks})
                        </span>
                      </div>

                      {q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 pl-5 text-[11.5px] text-zinc-700">
                          {(["A", "B", "C", "D"] as const).map((optKey) => {
                            const isAns =
                              showAnswerKey && q.correctOption === optKey;
                            return (
                              <div
                                key={optKey}
                                className={cn(
                                  "flex items-center gap-1.5",
                                  isAns && "font-bold text-emerald-700"
                                )}
                              >
                                <span>({optKey})</span>
                                <span>{q.options?.[optKey]}</span>
                                {isAns && <span>✓</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section B: Short Questions */}
            {shorts.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between rounded bg-zinc-100 border border-zinc-300 px-3 py-1.5 text-xs font-bold text-zinc-900">
                  <span>SECTION B — SHORT QUESTIONS</span>
                  <span className="font-mono">Marks: {shortMarks}</span>
                </div>
                <p className="text-[11px] italic text-zinc-600">
                  Note: Write brief and accurate answers to the following
                  questions.
                </p>

                <div className="space-y-2.5">
                  {shorts.map((q, idx) => (
                    <div key={q.id} className="space-y-1 text-xs">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-zinc-900 leading-relaxed">
                          <span className="font-bold mr-1.5">
                            Q.{idx + 1}:
                          </span>
                          {q.statement}
                        </p>
                        <span className="font-mono text-[11px] font-semibold text-zinc-600 shrink-0">
                          ({q.marks})
                        </span>
                      </div>
                      {showAnswerKey && q.answerHint && (
                        <p className="pl-8 text-[11px] font-semibold text-emerald-700">
                          Key: {q.answerHint}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section C: Long Questions */}
            {longs.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between rounded bg-zinc-100 border border-zinc-300 px-3 py-1.5 text-xs font-bold text-zinc-900">
                  <span>SECTION C — DESCRIPTIVE / LONG QUESTIONS</span>
                  <span className="font-mono">Marks: {longMarks}</span>
                </div>
                <p className="text-[11px] italic text-zinc-600">
                  Note: Attempt the following questions in detail with neat
                  diagrams or mathematical steps where required.
                </p>

                <div className="space-y-2.5">
                  {longs.map((q, idx) => (
                    <div key={q.id} className="space-y-1 text-xs">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-zinc-900 leading-relaxed">
                          <span className="font-bold mr-1.5">
                            Q.{idx + 1}:
                          </span>
                          {q.statement}
                        </p>
                        <span className="font-mono text-[11px] font-semibold text-zinc-600 shrink-0">
                          ({q.marks})
                        </span>
                      </div>
                      {showAnswerKey && q.answerHint && (
                        <p className="pl-8 text-[11px] font-semibold text-emerald-700">
                          Key: {q.answerHint}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mcqs.length === 0 && shorts.length === 0 && longs.length === 0 && (
              <div className="py-10 text-center text-xs text-zinc-500">
                No questions selected in this paper yet.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
