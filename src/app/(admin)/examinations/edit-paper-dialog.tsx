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
import type { DatesheetEntry } from "@/lib/mock/examinations";
import {
  PAKISTANI_EXAM_CLASSES,
  PAKISTANI_EXAM_SUBJECTS,
} from "@/lib/mock/examinations";
import { Edit3, Building2, Check } from "lucide-react";
import { toast } from "sonner";

interface EditPaperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: DatesheetEntry | null;
  onUpdatePaper: (updated: DatesheetEntry) => void;
  availableTerms: Array<{ id: string; examName: string }>;
}

export function EditPaperDialog({
  open,
  onOpenChange,
  entry,
  onUpdatePaper,
  availableTerms,
}: EditPaperDialogProps) {
  const [termId, setTermId] = React.useState("");
  const [className, setClassName] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [examDate, setExamDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("08:30 AM");
  const [endTime, setEndTime] = React.useState("11:30 AM");
  const [shift, setShift] = React.useState<"Morning" | "Evening">("Morning");
  const [maxMarks, setMaxMarks] = React.useState("75");
  const [passMarks, setPassMarks] = React.useState("25");
  const [roomHall, setRoomHall] = React.useState("Exam Hall 1");
  const [invigilator, setInvigilator] = React.useState("");

  // Sync state when entry or open changes
  React.useEffect(() => {
    if (entry) {
      setTermId(entry.termId || availableTerms[0]?.id || "");
      setClassName(entry.className || "Class 10th (Science)");
      setSubject(entry.subject || "Mathematics (Science)");
      setExamDate(entry.examDate || "");
      setStartTime(entry.startTime || "08:30 AM");
      setEndTime(entry.endTime || "11:30 AM");
      setShift(entry.shift || "Morning");
      setMaxMarks(String(entry.maxMarks || 75));
      setPassMarks(String(entry.passMarks || 25));
      setRoomHall(entry.roomHall || "Exam Hall 1");
      setInvigilator(entry.invigilator || "");
    }
  }, [entry, open, availableTerms]);

  const selectedTerm = availableTerms?.find((t) => t.id === termId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry) return;

    if (!examDate) {
      toast.error("Please choose an examination date.");
      return;
    }

    const dateObj = new Date(examDate);
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = isNaN(dateObj.getTime())
      ? entry.day || "Monday"
      : days[dateObj.getDay()];

    const updatedPaper: DatesheetEntry = {
      ...entry,
      termId,
      termName: selectedTerm?.examName || entry.termName,
      className,
      subject,
      examDate,
      day: dayName,
      startTime,
      endTime,
      shift,
      maxMarks: parseInt(maxMarks, 10) || 75,
      passMarks: parseInt(passMarks, 10) || 25,
      roomHall: roomHall.trim() || "Exam Hall 1",
      invigilator: invigilator.trim() || undefined,
    };

    onUpdatePaper(updatedPaper);
    onOpenChange(false);
  };

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[88vh] p-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl flex flex-col">
        {/* Header - Fixed at Top */}
        <div className="bg-gradient-to-r from-brand-soft/60 via-background to-background px-6 py-4 border-b border-border/70 shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-3 pr-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand text-cream shadow-sm shrink-0">
                <Edit3 className="size-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold text-foreground leading-tight truncate">
                  Edit Scheduled Paper
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Update examination hall, timings, date, or invigilator.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form Body - Scrollable Container */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col min-h-0 flex-1 overflow-hidden"
        >
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* Examination Term */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Examination Term
              </Label>
              <Select
                value={termId}
                onValueChange={(val) => {
                  if (val) setTermId(val);
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Examination Term">
                    {selectedTerm?.examName || entry.termName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableTerms.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-xs">
                      {t.examName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class & Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Class / Cohort
                </Label>
                <Select
                  value={className}
                  onValueChange={(val) => {
                    if (val) setClassName(val);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[260px]">
                    {PAKISTANI_EXAM_CLASSES.map((cls) => (
                      <SelectItem key={cls} value={cls} className="text-xs">
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Subject Paper
                </Label>
                <Select
                  value={subject}
                  onValueChange={(val) => {
                    if (val) setSubject(val);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[260px]">
                    {PAKISTANI_EXAM_SUBJECTS.map((sub) => (
                      <SelectItem key={sub} value={sub} className="text-xs">
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date & Shift */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="editPaperDate"
                  className="text-xs font-semibold text-foreground"
                >
                  Paper Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="editPaperDate"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Exam Shift
                </Label>
                <Select
                  value={shift}
                  onValueChange={(val) => {
                    if (val) setShift(val as "Morning" | "Evening");
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Morning" className="text-xs">
                      Morning Shift (08:30 AM)
                    </SelectItem>
                    <SelectItem value="Evening" className="text-xs">
                      Evening Shift (01:30 PM)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Timings */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="editStartTime"
                  className="text-xs font-semibold text-foreground"
                >
                  Start Time
                </Label>
                <Input
                  id="editStartTime"
                  placeholder="08:30 AM"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="editEndTime"
                  className="text-xs font-semibold text-foreground"
                >
                  End Time
                </Label>
                <Input
                  id="editEndTime"
                  placeholder="11:30 AM"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Exam Hall / Room (Highlighted) */}
            <div className="space-y-1.5 p-3 rounded-xl border border-brand/20 bg-brand-soft/20">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-brand">
                <Building2 className="size-3.5" />
                <span>Exam Room / Examination Hall</span>
              </div>
              <Input
                id="editRoomHall"
                placeholder="e.g. Exam Hall 1, Room 204, Senior Science Lab"
                value={roomHall}
                onChange={(e) => setRoomHall(e.target.value)}
                className="h-9 text-xs bg-background"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Assigned location where candidates will appear for this paper.
              </p>
            </div>

            {/* Marks */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="editMaxMarks"
                  className="text-xs font-semibold text-foreground"
                >
                  Total Marks
                </Label>
                <Input
                  id="editMaxMarks"
                  type="number"
                  placeholder="75"
                  value={maxMarks}
                  onChange={(e) => {
                    setMaxMarks(e.target.value);
                    const m = parseInt(e.target.value, 10);
                    if (!isNaN(m)) setPassMarks(String(Math.ceil(m * 0.33)));
                  }}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="editPassMarks"
                  className="text-xs font-semibold text-foreground"
                >
                  Pass Marks (33% Min)
                </Label>
                <Input
                  id="editPassMarks"
                  type="number"
                  placeholder="25"
                  value={passMarks}
                  onChange={(e) => setPassMarks(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Invigilator */}
            <div className="space-y-1.5">
              <Label
                htmlFor="editInvigilator"
                className="text-xs font-semibold text-foreground"
              >
                Supervising Invigilator (Optional)
              </Label>
              <Input
                id="editInvigilator"
                placeholder="e.g. Mr. Tariq Mehmood, Dr. Saima Riaz"
                value={invigilator}
                onChange={(e) => setInvigilator(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Footer - Professional Action Button with Balanced Padding & Margins */}
          <DialogFooter className="m-0 shrink-0 px-6 py-4 border-t border-border/70 bg-muted/30 flex items-center justify-end sm:justify-end">
            <Button
              type="submit"
              size="sm"
              className="h-9 px-6 text-xs font-semibold rounded-lg bg-brand text-cream hover:bg-brand-600 shadow-sm cursor-pointer transition-all duration-150 inline-flex items-center gap-2"
            >
              <Check className="size-3.5" />
              <span>Save Changes</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
