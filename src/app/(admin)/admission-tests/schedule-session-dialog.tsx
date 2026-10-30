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
  ADMISSION_CLASS_GROUPS,
  ADMISSION_HALLS,
  ADMISSION_SUPERVISORS,
  type AdmissionTestSession,
} from "@/lib/mock/admission-tests";
import { CAMPUSES } from "@/lib/mock/institution";
import { CalendarPlus, Check } from "lucide-react";
import { toast } from "sonner";

interface ScheduleSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSession: (session: AdmissionTestSession) => void;
}

type TimeSegmentId =
  | "startHour"
  | "startMinute"
  | "startPeriod"
  | "endHour"
  | "endMinute"
  | "endPeriod";

export function ScheduleSessionDialog({
  open,
  onOpenChange,
  onAddSession,
}: ScheduleSessionDialogProps) {
  const [title, setTitle] = React.useState("");
  const [classGroup, setClassGroup] = React.useState(ADMISSION_CLASS_GROUPS[0]);
  const [subjectsTested, setSubjectsTested] = React.useState(
    "English, Urdu & Mathematics"
  );
  const [testDate, setTestDate] = React.useState("2026-11-10");
  const [startHour, setStartHour] = React.useState("09");
  const [startMinute, setStartMinute] = React.useState("00");
  const [startPeriod, setStartPeriod] = React.useState<"AM" | "PM">("AM");
  const [endHour, setEndHour] = React.useState("11");
  const [endMinute, setEndMinute] = React.useState("00");
  const [endPeriod, setEndPeriod] = React.useState<"AM" | "PM">("AM");
  const [roomHall, setRoomHall] = React.useState(ADMISSION_HALLS[0]);
  const [totalMarks, setTotalMarks] = React.useState<number>(100);
  const [qualifyingMarks, setQualifyingMarks] = React.useState<number>(50);
  const [supervisor, setSupervisor] = React.useState(ADMISSION_SUPERVISORS[0]);
  const [campus, setCampus] = React.useState(
    CAMPUSES[0]?.campusName || "Main Campus — Gulberg"
  );

  const startHourRef = React.useRef<HTMLInputElement>(null);
  const startMinuteRef = React.useRef<HTMLInputElement>(null);
  const startPeriodRef = React.useRef<HTMLButtonElement>(null);
  const endHourRef = React.useRef<HTMLInputElement>(null);
  const endMinuteRef = React.useRef<HTMLInputElement>(null);
  const endPeriodRef = React.useRef<HTMLButtonElement>(null);
  const pendingDigitRef = React.useRef<{
    segment: TimeSegmentId;
    digit: number;
  } | null>(null);

  React.useEffect(() => {
    if (open) {
      setTestDate(new Date().toISOString().split("T")[0]);
      pendingDigitRef.current = null;
    }
  }, [open]);

  const focusSegment = (segment: TimeSegmentId) => {
    const map: Record<
      TimeSegmentId,
      React.RefObject<HTMLElement | null>
    > = {
      startHour: startHourRef,
      startMinute: startMinuteRef,
      startPeriod: startPeriodRef,
      endHour: endHourRef,
      endMinute: endMinuteRef,
      endPeriod: endPeriodRef,
    };
    map[segment].current?.focus();
  };

  const applyHourDigit = (which: "start" | "end", digit: number) => {
    const segment: TimeSegmentId = which === "start" ? "startHour" : "endHour";
    const nextSeg: TimeSegmentId =
      which === "start" ? "startMinute" : "endMinute";
    const setHour = which === "start" ? setStartHour : setEndHour;
    const setPeriod = which === "start" ? setStartPeriod : setEndPeriod;

    if (pendingDigitRef.current?.segment !== segment) {
      if (digit >= 2 && digit <= 9) {
        setHour(`0${digit}`);
        pendingDigitRef.current = null;
        focusSegment(nextSeg);
      } else {
        setHour(digit === 0 ? "00" : "01");
        pendingDigitRef.current = { segment, digit };
      }
    } else {
      const combined = pendingDigitRef.current.digit * 10 + digit;
      pendingDigitRef.current = null;
      if (combined === 0) {
        setHour("12");
      } else if (combined <= 12) {
        setHour(String(combined).padStart(2, "0"));
      } else {
        setHour(String(combined - 12).padStart(2, "0"));
        setPeriod("PM");
      }
      focusSegment(nextSeg);
    }
  };

  const applyMinuteDigit = (which: "start" | "end", digit: number) => {
    const segment: TimeSegmentId =
      which === "start" ? "startMinute" : "endMinute";
    const nextSeg: TimeSegmentId =
      which === "start" ? "startPeriod" : "endPeriod";
    const setMinute = which === "start" ? setStartMinute : setEndMinute;

    if (pendingDigitRef.current?.segment !== segment) {
      if (digit >= 6 && digit <= 9) {
        setMinute(`0${digit}`);
        pendingDigitRef.current = null;
        focusSegment(nextSeg);
      } else {
        setMinute(`0${digit}`);
        pendingDigitRef.current = { segment, digit };
      }
    } else {
      const combined = pendingDigitRef.current.digit * 10 + digit;
      pendingDigitRef.current = null;
      setMinute(String(Math.min(59, combined)).padStart(2, "0"));
      focusSegment(nextSeg);
    }
  };

  const handleHourKeyDown = (
    which: "start" | "end",
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const currentVal = which === "start" ? startHour : endHour;
    const setHour = which === "start" ? setStartHour : setEndHour;
    const nextSeg: TimeSegmentId =
      which === "start" ? "startMinute" : "endMinute";
    const prevSeg: TimeSegmentId | null =
      which === "start" ? null : "startPeriod";

    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      applyHourDigit(which, Number(e.key));
      return;
    }
    if (e.key === ":" || e.key === "ArrowRight") {
      e.preventDefault();
      if (currentVal === "00") setHour("12");
      pendingDigitRef.current = null;
      focusSegment(nextSeg);
      return;
    }
    if ((e.key === "ArrowLeft" || e.key === "Backspace") && prevSeg) {
      e.preventDefault();
      if (currentVal === "00") setHour("12");
      pendingDigitRef.current = null;
      focusSegment(prevSeg);
      return;
    }
    if (e.key === "Backspace") {
      e.preventDefault();
      pendingDigitRef.current = null;
      setHour(which === "start" ? "09" : "11");
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      pendingDigitRef.current = null;
      const next = ((Number(currentVal) || 12) % 12) + 1;
      setHour(String(next).padStart(2, "0"));
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      pendingDigitRef.current = null;
      const next = (((Number(currentVal) || 12) - 2 + 12) % 12) + 1;
      setHour(String(next).padStart(2, "0"));
      return;
    }
  };

  const handleMinuteKeyDown = (
    which: "start" | "end",
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const currentVal = which === "start" ? startMinute : endMinute;
    const setMinute = which === "start" ? setStartMinute : setEndMinute;
    const setPeriod = which === "start" ? setStartPeriod : setEndPeriod;
    const prevSeg: TimeSegmentId =
      which === "start" ? "startHour" : "endHour";
    const nextSeg: TimeSegmentId =
      which === "start" ? "startPeriod" : "endPeriod";

    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      applyMinuteDigit(which, Number(e.key));
      return;
    }
    if (e.key === "a" || e.key === "A" || e.key === "p" || e.key === "P") {
      e.preventDefault();
      pendingDigitRef.current = null;
      setPeriod(e.key.toUpperCase() === "A" ? "AM" : "PM");
      if (which === "start") focusSegment("endHour");
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      pendingDigitRef.current = null;
      focusSegment(nextSeg);
      return;
    }
    if (e.key === "ArrowLeft" || e.key === "Backspace") {
      e.preventDefault();
      if (e.key === "Backspace") setMinute("00");
      pendingDigitRef.current = null;
      focusSegment(prevSeg);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      pendingDigitRef.current = null;
      const next = ((Number(currentVal) || 0) + 1) % 60;
      setMinute(String(next).padStart(2, "0"));
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      pendingDigitRef.current = null;
      const next = ((Number(currentVal) || 0) - 1 + 60) % 60;
      setMinute(String(next).padStart(2, "0"));
      return;
    }
  };

  const handlePeriodKeyDown = (
    which: "start" | "end",
    e: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    const setPeriod = which === "start" ? setStartPeriod : setEndPeriod;
    const prevSeg: TimeSegmentId =
      which === "start" ? "startMinute" : "endMinute";

    if (e.key === "a" || e.key === "A") {
      e.preventDefault();
      setPeriod("AM");
      if (which === "start") focusSegment("endHour");
      return;
    }
    if (e.key === "p" || e.key === "P") {
      e.preventDefault();
      setPeriod("PM");
      if (which === "start") focusSegment("endHour");
      return;
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      setPeriod((prev) => (prev === "AM" ? "PM" : "AM"));
      return;
    }
    if (e.key === "ArrowRight" && which === "start") {
      e.preventDefault();
      focusSegment("endHour");
      return;
    }
    if (e.key === "ArrowLeft" || e.key === "Backspace") {
      e.preventDefault();
      focusSegment(prevSeg);
      return;
    }
    if (which === "start" && /^[0-9]$/.test(e.key)) {
      e.preventDefault();
      const digit = Number(e.key);
      if (digit >= 2 && digit <= 9) {
        setEndHour(`0${digit}`);
        pendingDigitRef.current = null;
        focusSegment("endMinute");
      } else {
        setEndHour(digit === 0 ? "00" : "01");
        focusSegment("endHour");
        pendingDigitRef.current = { segment: "endHour", digit };
      }
    }
  };

  const handleClassGroupChange = (group: string) => {
    setClassGroup(group);
    if (group.includes("Montessori")) {
      setSubjectsTested("Oral Readiness, Phonics & Basic Numeracy");
      setTotalMarks(50);
      setQualifyingMarks(25);
      setStartHour("09");
      setStartMinute("00");
      setStartPeriod("AM");
      setEndHour("10");
      setEndMinute("30");
      setEndPeriod("AM");
    } else if (group.includes("Primary")) {
      setSubjectsTested("English, Urdu & Basic Mathematics");
      setTotalMarks(50);
      setQualifyingMarks(25);
      setStartHour("09");
      setStartMinute("00");
      setStartPeriod("AM");
      setEndHour("10");
      setEndMinute("30");
      setEndPeriod("AM");
    } else if (group.includes("Computer")) {
      setSubjectsTested("English, Mathematics, Computer & Urdu");
      setTotalMarks(100);
      setQualifyingMarks(50);
      setStartHour("09");
      setStartMinute("00");
      setStartPeriod("AM");
      setEndHour("11");
      setEndMinute("00");
      setEndPeriod("AM");
    } else if (group.includes("9th")) {
      setSubjectsTested("English, Mathematics, Physics & Urdu");
      setTotalMarks(100);
      setQualifyingMarks(50);
      setStartHour("09");
      setStartMinute("00");
      setStartPeriod("AM");
      setEndHour("11");
      setEndMinute("00");
      setEndPeriod("AM");
    } else {
      setSubjectsTested("English, Urdu, Mathematics & General Science");
      setTotalMarks(100);
      setQualifyingMarks(50);
      setStartHour("09");
      setStartMinute("00");
      setStartPeriod("AM");
      setEndHour("11");
      setEndMinute("00");
      setEndPeriod("AM");
    }
  };

  const handleTotalMarksChange = (marks: number) => {
    setTotalMarks(marks);
    setQualifyingMarks(Math.ceil(marks * 0.5));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a session title.");
      return;
    }

    if (!subjectsTested.trim()) {
      toast.error("Please specify the subjects tested.");
      return;
    }

    const safeStartHour = startHour === "00" ? "12" : startHour.padStart(2, "0");
    const safeEndHour = endHour === "00" ? "12" : endHour.padStart(2, "0");
    const formattedTiming = `${safeStartHour}:${startMinute.padStart(2, "0")} ${startPeriod} – ${safeEndHour}:${endMinute.padStart(2, "0")} ${endPeriod}`;

    const newSession: AdmissionTestSession = {
      id: `adm-ses-${Date.now()}`,
      title: title.trim(),
      classGroup,
      subjectsTested: subjectsTested.trim(),
      testDate,
      timing: formattedTiming,
      roomHall: roomHall.trim() || "Main Examination Hall",
      totalMarks,
      qualifyingMarks,
      supervisor,
      campus,
      academicSession: "2026–27",
      status: "Scheduled",
    };

    onAddSession(newSession);
    toast.success("Admission entry test session scheduled.");
    setTitle("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[88vh] p-0 gap-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-soft/60 via-background to-background px-6 py-4 border-b border-border/70 shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-3 pr-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand text-cream shadow-sm shrink-0">
                <CalendarPlus className="size-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold text-foreground leading-tight">
                  Schedule Entry Test Session
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Set up a new admission test batch for incoming applicants.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col min-h-0 flex-1 overflow-hidden"
        >
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="admTitle" className="text-xs font-semibold">
                Session Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="admTitle"
                placeholder="e.g. Spring Intake Entry Test — Batch 2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            {/* Class Group & Campus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Class Wing / Group</Label>
                <Select
                  value={classGroup}
                  onValueChange={(val) => {
                    if (val) handleClassGroupChange(val);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMISSION_CLASS_GROUPS.map((g) => (
                      <SelectItem key={g} value={g} className="text-xs">
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Campus</Label>
                <Select
                  value={campus}
                  onValueChange={(val) => {
                    if (val) setCampus(val);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPUSES.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.campusName}
                        className="text-xs"
                      >
                        {c.campusName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subjects Tested */}
            <div className="space-y-1.5">
              <Label htmlFor="admSubjects" className="text-xs font-semibold">
                Subjects Tested <span className="text-destructive">*</span>
              </Label>
              <Input
                id="admSubjects"
                placeholder="e.g. English, Urdu & Mathematics"
                value={subjectsTested}
                onChange={(e) => setSubjectsTested(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            {/* Date & Timing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="admDate" className="text-xs font-semibold">
                  Test Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="admDate"
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admStartHour" className="text-xs font-semibold">
                  Test Timing <span className="text-destructive">*</span>
                </Label>
                <div
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      startHourRef.current?.focus();
                    }
                  }}
                  className="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 text-xs transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30"
                >
                  {/* Start Time */}
                  <div className="flex items-center gap-0.5">
                    <input
                      ref={startHourRef}
                      id="admStartHour"
                      type="text"
                      inputMode="numeric"
                      aria-label="Start hour"
                      value={startHour}
                      onChange={() => {}}
                      onFocus={() => {
                        pendingDigitRef.current = null;
                      }}
                      onBlur={() => {
                        pendingDigitRef.current = null;
                        if (startHour === "00") setStartHour("12");
                      }}
                      onKeyDown={(e) => handleHourKeyDown("start", e)}
                      className="h-6 w-5 rounded bg-transparent text-center font-mono text-xs font-medium tabular-nums text-foreground outline-none caret-transparent selection:bg-transparent focus:bg-brand/15 focus:font-semibold focus:text-brand cursor-pointer"
                    />
                    <span className="font-mono font-semibold text-muted-foreground select-none">
                      :
                    </span>
                    <input
                      ref={startMinuteRef}
                      type="text"
                      inputMode="numeric"
                      aria-label="Start minute"
                      value={startMinute}
                      onChange={() => {}}
                      onFocus={() => {
                        pendingDigitRef.current = null;
                      }}
                      onBlur={() => {
                        pendingDigitRef.current = null;
                      }}
                      onKeyDown={(e) => handleMinuteKeyDown("start", e)}
                      className="h-6 w-5 rounded bg-transparent text-center font-mono text-xs font-medium tabular-nums text-foreground outline-none caret-transparent selection:bg-transparent focus:bg-brand/15 focus:font-semibold focus:text-brand cursor-pointer"
                    />
                    <button
                      ref={startPeriodRef}
                      type="button"
                      aria-label="Start AM or PM"
                      onClick={() =>
                        setStartPeriod((prev) => (prev === "AM" ? "PM" : "AM"))
                      }
                      onKeyDown={(e) => handlePeriodKeyDown("start", e)}
                      className="ml-0.5 h-6 rounded bg-muted/70 px-1.5 text-[10px] font-semibold tracking-wide text-foreground/80 transition-colors hover:bg-muted focus:bg-brand focus:text-cream outline-none cursor-pointer select-none"
                    >
                      {startPeriod}
                    </button>
                  </div>

                  <span className="px-1 text-[11px] font-medium text-muted-foreground/70 select-none">
                    –
                  </span>

                  {/* End Time */}
                  <div className="flex items-center gap-0.5">
                    <input
                      ref={endHourRef}
                      type="text"
                      inputMode="numeric"
                      aria-label="End hour"
                      value={endHour}
                      onChange={() => {}}
                      onFocus={() => {
                        pendingDigitRef.current = null;
                      }}
                      onBlur={() => {
                        pendingDigitRef.current = null;
                        if (endHour === "00") setEndHour("12");
                      }}
                      onKeyDown={(e) => handleHourKeyDown("end", e)}
                      className="h-6 w-5 rounded bg-transparent text-center font-mono text-xs font-medium tabular-nums text-foreground outline-none caret-transparent selection:bg-transparent focus:bg-brand/15 focus:font-semibold focus:text-brand cursor-pointer"
                    />
                    <span className="font-mono font-semibold text-muted-foreground select-none">
                      :
                    </span>
                    <input
                      ref={endMinuteRef}
                      type="text"
                      inputMode="numeric"
                      aria-label="End minute"
                      value={endMinute}
                      onChange={() => {}}
                      onFocus={() => {
                        pendingDigitRef.current = null;
                      }}
                      onBlur={() => {
                        pendingDigitRef.current = null;
                      }}
                      onKeyDown={(e) => handleMinuteKeyDown("end", e)}
                      className="h-6 w-5 rounded bg-transparent text-center font-mono text-xs font-medium tabular-nums text-foreground outline-none caret-transparent selection:bg-transparent focus:bg-brand/15 focus:font-semibold focus:text-brand cursor-pointer"
                    />
                    <button
                      ref={endPeriodRef}
                      type="button"
                      aria-label="End AM or PM"
                      onClick={() =>
                        setEndPeriod((prev) => (prev === "AM" ? "PM" : "AM"))
                      }
                      onKeyDown={(e) => handlePeriodKeyDown("end", e)}
                      className="ml-0.5 h-6 rounded bg-muted/70 px-1.5 text-[10px] font-semibold tracking-wide text-foreground/80 transition-colors hover:bg-muted focus:bg-brand focus:text-cream outline-none cursor-pointer select-none"
                    >
                      {endPeriod}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Hall & Supervisor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Exam Hall / Room</Label>
                <Select
                  value={roomHall}
                  onValueChange={(val) => {
                    if (val) setRoomHall(val);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMISSION_HALLS.map((h) => (
                      <SelectItem key={h} value={h} className="text-xs">
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Test Supervisor</Label>
                <Select
                  value={supervisor}
                  onValueChange={(val) => {
                    if (val) setSupervisor(val);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMISSION_SUPERVISORS.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Marks */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="admTotalMarks" className="text-xs font-semibold">
                  Total Marks
                </Label>
                <Input
                  id="admTotalMarks"
                  type="number"
                  min="20"
                  max="200"
                  value={totalMarks}
                  onChange={(e) => handleTotalMarksChange(Number(e.target.value))}
                  className="h-9 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admQualMarks" className="text-xs font-semibold">
                  Qualifying Marks (50%)
                </Label>
                <Input
                  id="admQualMarks"
                  type="number"
                  min="1"
                  max={totalMarks}
                  value={qualifyingMarks}
                  onChange={(e) => setQualifyingMarks(Number(e.target.value))}
                  className="h-9 text-xs font-mono"
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter className="m-0 px-6 py-4 border-t border-border/70 bg-muted/20 flex flex-row items-center justify-end shrink-0">
            <Button
              type="submit"
              className="h-9 px-6 rounded-lg text-xs font-semibold bg-brand text-cream hover:bg-brand-600 shadow-xs cursor-pointer gap-1.5"
            >
              <Check className="size-3.5" />
              <span>Save Session</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
