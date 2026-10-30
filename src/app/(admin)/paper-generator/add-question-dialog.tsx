"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PAPER_CLASSES,
  PAPER_SUBJECTS,
  type QuestionBankItem,
  type QuestionDifficulty,
  type QuestionType,
} from "@/lib/mock/paper-generator";
import { FilePlus2, Check } from "lucide-react";
import { cn } from "cn";
import { toast } from "sonner";

interface AddQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddQuestion: (question: QuestionBankItem) => void;
  defaultClass?: string;
  defaultSubject?: string;
}

export function AddQuestionDialog({
  open,
  onOpenChange,
  onAddQuestion,
  defaultClass,
  defaultSubject,
}: AddQuestionDialogProps) {
  const [className, setClassName] = React.useState(
    defaultClass || PAPER_CLASSES[1]
  );
  const [subject, setSubject] = React.useState(
    defaultSubject || PAPER_SUBJECTS[0]
  );
  const [chapter, setChapter] = React.useState("");
  const [type, setType] = React.useState<QuestionType>("MCQ");
  const [difficulty, setDifficulty] =
    React.useState<QuestionDifficulty>("Medium");
  const [marks, setMarks] = React.useState<number>(1);
  const [statement, setStatement] = React.useState("");
  const [optA, setOptA] = React.useState("");
  const [optB, setOptB] = React.useState("");
  const [optC, setOptC] = React.useState("");
  const [optD, setOptD] = React.useState("");
  const [correctOption, setCorrectOption] = React.useState<
    "A" | "B" | "C" | "D"
  >("A");
  const [answerHint, setAnswerHint] = React.useState("");

  React.useEffect(() => {
    if (open) {
      if (defaultClass) setClassName(defaultClass);
      if (defaultSubject) setSubject(defaultSubject);
    }
  }, [open, defaultClass, defaultSubject]);

  const handleTypeChange = (nextType: QuestionType) => {
    setType(nextType);
    if (nextType === "MCQ") setMarks(1);
    else if (nextType === "Short") setMarks(2);
    else setMarks(5);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!chapter.trim()) {
      toast.error("Please enter the chapter or unit name.");
      return;
    }

    if (!statement.trim()) {
      toast.error("Please enter the question statement.");
      return;
    }

    if (
      type === "MCQ" &&
      (!optA.trim() || !optB.trim() || !optC.trim() || !optD.trim())
    ) {
      toast.error("Please fill all four MCQ options (A, B, C, and D).");
      return;
    }

    const newQuestion: QuestionBankItem = {
      id: `qb-${Date.now()}`,
      className,
      subject,
      chapter: chapter.trim(),
      type,
      difficulty,
      marks: Math.max(1, marks),
      statement: statement.trim(),
      ...(type === "MCQ"
        ? {
            options: {
              A: optA.trim(),
              B: optB.trim(),
              C: optC.trim(),
              D: optD.trim(),
            },
            correctOption,
          }
        : {
            answerHint: answerHint.trim() || undefined,
          }),
    };

    onAddQuestion(newQuestion);
    toast.success("Question added to the Question Bank.");

    setChapter("");
    setStatement("");
    setOptA("");
    setOptB("");
    setOptC("");
    setOptD("");
    setAnswerHint("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[88vh] p-0 gap-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-soft/60 via-background to-background px-6 py-4 border-b border-border/70 shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-3 pr-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand text-cream shadow-sm shrink-0">
                <FilePlus2 className="size-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold text-foreground leading-tight">
                  Add Question to Bank
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Save a reusable MCQ, short, or long question for exam papers.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Body */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col min-h-0 flex-1 overflow-hidden"
        >
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* Class & Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Class</Label>
                <Select
                  value={className}
                  onValueChange={(val) => {
                    if (val) setClassName(val);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAPER_CLASSES.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Subject</Label>
                <Select
                  value={subject}
                  onValueChange={(val) => {
                    if (val) setSubject(val);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAPER_SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Type, Difficulty, Marks */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Question Type</Label>
                <Select
                  value={type}
                  onValueChange={(val) => {
                    if (val) handleTypeChange(val as QuestionType);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MCQ" className="text-xs">
                      MCQ (Objective)
                    </SelectItem>
                    <SelectItem value="Short" className="text-xs">
                      Short Question
                    </SelectItem>
                    <SelectItem value="Long" className="text-xs">
                      Long Question
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Difficulty</Label>
                <Select
                  value={difficulty}
                  onValueChange={(val) => {
                    if (val) setDifficulty(val as QuestionDifficulty);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy" className="text-xs">
                      Easy
                    </SelectItem>
                    <SelectItem value="Medium" className="text-xs">
                      Medium
                    </SelectItem>
                    <SelectItem value="Hard" className="text-xs">
                      Hard
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="qMarks" className="text-xs font-semibold">
                  Marks
                </Label>
                <Input
                  id="qMarks"
                  type="number"
                  min={1}
                  max={25}
                  value={marks}
                  onChange={(e) => setMarks(Number(e.target.value) || 1)}
                  className="h-9 text-xs font-mono"
                  required
                />
              </div>
            </div>

            {/* Chapter */}
            <div className="space-y-1.5">
              <Label htmlFor="qChapter" className="text-xs font-semibold">
                Chapter / Unit <span className="text-destructive">*</span>
              </Label>
              <Input
                id="qChapter"
                placeholder="e.g. Unit 2: Kinematics"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            {/* Question Statement */}
            <div className="space-y-1.5">
              <Label htmlFor="qStatement" className="text-xs font-semibold">
                Question Statement <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="qStatement"
                rows={3}
                placeholder="Type the complete question text…"
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 resize-none"
                required
              />
            </div>

            {/* Conditional MCQ Options or Subjective Answer Note */}
            {type === "MCQ" ? (
              <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Answer Options & Key
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-muted-foreground mr-1">
                      Correct:
                    </span>
                    {(["A", "B", "C", "D"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setCorrectOption(opt)}
                        className={cn(
                          "size-6 rounded-md text-[11px] font-bold transition-colors cursor-pointer",
                          correctOption === opt
                            ? "bg-emerald-600 text-white shadow-2xs"
                            : "bg-background border border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Input
                    placeholder="Option A"
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                  <Input
                    placeholder="Option B"
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                  <Input
                    placeholder="Option C"
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                  <Input
                    placeholder="Option D"
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="qHint" className="text-xs font-semibold">
                  Answer Key / Marking Note{" "}
                  <span className="text-muted-foreground font-normal">
                    (Optional)
                  </span>
                </Label>
                <Input
                  id="qHint"
                  placeholder="e.g. 1 mark for definition + 1 mark for formula"
                  value={answerHint}
                  onChange={(e) => setAnswerHint(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            )}
          </div>

          <DialogFooter className="m-0 px-6 py-4 border-t border-border/70 bg-muted/20 flex flex-row items-center justify-end shrink-0">
            <Button
              type="submit"
              className="h-9 px-6 rounded-lg text-xs font-semibold bg-brand text-cream hover:bg-brand-600 shadow-xs cursor-pointer gap-1.5"
            >
              <Check className="size-3.5" />
              <span>Save Question</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
