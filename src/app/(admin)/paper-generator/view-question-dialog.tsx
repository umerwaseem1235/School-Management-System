"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HelpCircle, CheckCircle2 } from "lucide-react";
import { cn } from "cn";
import type { QuestionBankItem } from "@/lib/mock/paper-generator";

interface ViewQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: QuestionBankItem | null;
}

export function ViewQuestionDialog({
  open,
  onOpenChange,
  question,
}: ViewQuestionDialogProps) {
  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[88vh] p-0 gap-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-soft/60 via-background to-background px-6 py-4 border-b border-border/70 shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-3 pr-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand text-cream shadow-sm shrink-0">
                <HelpCircle className="size-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold text-foreground leading-tight">
                  {question.subject} — {question.className}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
                  {question.chapter}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Meta Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand">
              {question.type === "MCQ"
                ? "MCQ (Objective)"
                : `${question.type} Question`}
            </span>
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                question.difficulty === "Easy"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : question.difficulty === "Medium"
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    : "bg-rose-500/10 text-rose-700 dark:text-rose-400"
              )}
            >
              {question.difficulty}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-muted text-foreground">
              {question.marks} {question.marks === 1 ? "Mark" : "Marks"}
            </span>
          </div>

          {/* Question Statement */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Question Statement
            </p>
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {question.statement}
            </p>
          </div>

          {/* Options or Answer Hint */}
          {question.type === "MCQ" && question.options ? (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Options & Correct Answer
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(["A", "B", "C", "D"] as const).map((key) => {
                  const isCorrect = question.correctOption === key;
                  return (
                    <div
                      key={key}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs",
                        isCorrect
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold"
                          : "border-border/70 bg-background text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={cn(
                            "flex size-5 items-center justify-center rounded text-[11px] font-bold shrink-0",
                            isCorrect
                              ? "bg-emerald-600 text-white"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {key}
                        </span>
                        <span className="truncate">
                          {question.options?.[key]}
                        </span>
                      </div>
                      {isCorrect && (
                        <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : question.answerHint ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                Answer Key / Marking Note
              </p>
              <p className="text-xs text-foreground/90 leading-relaxed">
                {question.answerHint}
              </p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
