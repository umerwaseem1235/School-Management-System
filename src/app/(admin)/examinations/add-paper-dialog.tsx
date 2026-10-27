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
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";

interface AddPaperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPaper: (entry: DatesheetEntry) => void;
  availableTerms: Array<{ id: string; examName: string }>;
  defaultTermId?: string;
  defaultClassName?: string;
}

export function AddPaperDialog({
  open,
  onOpenChange,
  onAddPaper,
  availableTerms,
  defaultTermId,
  defaultClassName,
}: AddPaperDialogProps) {
  const [termId, setTermId] = React.useState(defaultTermId || availableTerms[0]?.id || "");
  const [className, setClassName] = React.useState(defaultClassName || "Class 10th (Science)");
  const [subject, setSubject] = React.useState("Mathematics (Science)");
  const [examDate, setExamDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("08:30 AM");
  const [endTime, setEndTime] = React.useState("11:30 AM");
  const [shift, setShift] = React.useState<"Morning" | "Evening">("Morning");
  const [maxMarks, setMaxMarks] = React.useState("75");
  const [passMarks, setPassMarks] = React.useState("25");
  const [roomHall, setRoomHall] = React.useState("Exam Hall 1");
  const [invigilator, setInvigilator] = React.useState("");

  const selectedTerm = availableTerms?.find((t) => t.id === termId);

  // Sync defaultTermId or defaultClassName if opened with them
  React.useEffect(() => {
    if (defaultTermId) setTermId(defaultTermId);
    if (defaultClassName && defaultClassName !== "ALL") setClassName(defaultClassName);
  }, [defaultTermId, defaultClassName, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examDate) {
      toast.error("Please choose an examination date");
      return;
    }

    const dateObj = new Date(examDate);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = isNaN(dateObj.getTime()) ? "Monday" : days[dateObj.getDay()];

    const newPaper: DatesheetEntry = {
      id: `ds-${Date.now()}`,
      termId,
      termName: selectedTerm?.examName || "Mid-Term Examination 2026–27",
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

    onAddPaper(newPaper);
    toast.success("Paper Added to Datesheet", {
      description: `${newPaper.subject} scheduled for ${newPaper.className} on ${newPaper.examDate}.`,
    });

    onOpenChange(false);
    setExamDate("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[88vh] p-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl flex flex-col">
        {/* Header - Fixed at Top */}
        <div className="bg-gradient-to-r from-brand-soft/60 via-background to-background px-6 py-4 border-b border-border/70 shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-3 pr-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand text-cream shadow-sm shrink-0">
                <CalendarDays className="size-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold text-foreground leading-tight truncate">
                  Add Paper to Datesheet
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Schedule an examination paper with timing, room, and marks criteria.
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
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Examination Term</Label>
            <Select value={termId} onValueChange={(val) => { if (val) setTermId(val); }}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select Examination Term">
                  {selectedTerm?.examName}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableTerms.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.examName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Target Class</Label>
              <Select value={className} onValueChange={(val) => { if (val) setClassName(val); }}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[260px]">
                  {PAKISTANI_EXAM_CLASSES.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Subject</Label>
              <Select value={subject} onValueChange={(val) => { if (val) setSubject(val); }}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[260px]">
                  {PAKISTANI_EXAM_SUBJECTS.map((sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="paperDate" className="text-xs font-semibold text-foreground">
                Paper Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="paperDate"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Exam Shift</Label>
              <Select value={shift} onValueChange={(val) => { if (val) setShift(val as any); }}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Morning">Morning Shift (08:30 AM)</SelectItem>
                  <SelectItem value="Evening">Evening Shift (01:30 PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startTime" className="text-xs font-semibold text-foreground">
                Start Time
              </Label>
              <Input
                id="startTime"
                placeholder="08:30 AM"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endTime" className="text-xs font-semibold text-foreground">
                End Time
              </Label>
              <Input
                id="endTime"
                placeholder="11:30 AM"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="maxMarks" className="text-xs font-semibold text-foreground">
                Total Marks
              </Label>
              <Input
                id="maxMarks"
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
              <Label htmlFor="passMarks" className="text-xs font-semibold text-foreground">
                Pass Marks (33%)
              </Label>
              <Input
                id="passMarks"
                type="number"
                placeholder="25"
                value={passMarks}
                onChange={(e) => setPassMarks(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="roomHall" className="text-xs font-semibold text-foreground">
                Hall / Room
              </Label>
              <Input
                id="roomHall"
                placeholder="Exam Hall 1"
                value={roomHall}
                onChange={(e) => setRoomHall(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="invigilator" className="text-xs font-semibold text-foreground">
              Supervising Invigilator (Optional)
            </Label>
            <Input
              id="invigilator"
              placeholder="e.g. Mr. Tariq Mehmood"
              value={invigilator}
              onChange={(e) => setInvigilator(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          </div>

          {/* Footer - Fixed at Bottom */}
          <DialogFooter className="m-0 shrink-0 px-6 py-4 border-t border-border/70 bg-muted/20 flex items-center justify-end gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8.5 px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-brand text-cream hover:bg-brand-600 text-xs h-8.5 px-4 cursor-pointer shadow-2xs font-semibold"
            >
              Add to Datesheet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
