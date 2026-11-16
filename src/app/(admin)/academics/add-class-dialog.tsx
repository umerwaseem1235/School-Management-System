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
import {
  AcademicSelect,
  AcademicSelectContent,
  AcademicSelectItem,
  AcademicSelectTrigger,
  AcademicSelectValue,
} from "./academic-dropdown";
import type { AcademicClass } from "@/types";
import {
  getClassSectionLetters,
  normalizeAcademicClassName,
  isAcademicDirectoryClass,
} from "@/lib/mock/academics";
import { PAKISTANI_SCHOOL_CLASSES } from "@/lib/mock/lms";
import { useBranches } from "@/context/branches-context";
import {
  GraduationCap,
  School,
  User,
  Layers,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface AddClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddClass: (newClass: AcademicClass) => void;
}

const CAMPUS_OPTIONS = [
  "Main Campus — Gulberg",
  "DHA Phase 5 Campus",
  "F-8 Islamabad Campus",
  "Clifton Karachi Campus",
  "Bahria Town Campus",
];

const STANDARD_ACADEMIC_CLASSES = Array.from(
  new Set(
    PAKISTANI_SCHOOL_CLASSES
      .map(normalizeAcademicClassName)
      .filter(isAcademicDirectoryClass)
  )
);

const STREAM_OPTIONS: Array<AcademicClass["stream"]> = [
  "General",
  "Science",
  "Arts",
  "Commerce",
];

const TEACHER_OPTIONS = [
  "Mr. Adeel Hassan",
  "Dr. Saima Riaz",
  "Ms. Kiran Aziz",
  "Mr. Usman Ali",
  "Mrs. Maryam Shah",
  "Mr. Bilal Saeed",
  "Mr. Fahad Mir",
  "Ms. Amina Tariq",
  "Mrs. Nida Farooq",
  "Mr. Waqas Anwar",
  "Mr. Hafiz Zubair",
  "Mrs. Shagufta Naz",
];

export function AddClassDialog({
  open,
  onOpenChange,
  onAddClass,
}: AddClassDialogProps) {
  const [className, setClassName] = React.useState<string>(STANDARD_ACADEMIC_CLASSES[4] || "Grade 9th");
  const [customName, setCustomName] = React.useState("");
  const [isCustom, setIsCustom] = React.useState(false);
  const [gradeLevel, setGradeLevel] = React.useState("9");
  const { activeBranches } = useBranches();
  const [stream, setStream] = React.useState<AcademicClass["stream"]>("General");
  const [campus, setCampus] = React.useState(activeBranches[0]?.campusName || "Main Campus — Gulberg");
  const [classTeacher, setClassTeacher] = React.useState(TEACHER_OPTIONS[0]);
  const [sections, setSections] = React.useState("2");
  const [students, setStudents] = React.useState("60");
  const [subjects, setSubjects] = React.useState("8");
  const [status, setStatus] = React.useState<AcademicClass["status"]>("Active");

  // Auto-detect stream and grade level when a standard class is picked
  const handleStandardClassSelect = (val: string) => {
    if (val === "__custom__") {
      setIsCustom(true);
      return;
    }
    setIsCustom(false);
    setClassName(val);

    const lower = val.toLowerCase();
    // Detect grade level
    const match = val.match(/(?:grade|class)?\s*(\d+)/i);
    if (match && match[1]) {
      setGradeLevel(match[1]);
    } else if (lower.includes("playgroup")) {
      setGradeLevel("-1");
    } else if (lower.includes("nursery")) {
      setGradeLevel("0");
    } else if (lower.includes("kg") || lower.includes("kindergarten")) {
      setGradeLevel("0");
    }

    // Detect stream
    if (lower.includes("commerce") || lower.includes("i.com")) {
      setStream("Commerce");
    } else if (lower.includes("art") || lower.includes("humanities")) {
      setStream("Arts");
    } else if (
      lower.includes("bio") ||
      lower.includes("computer") ||
      lower.includes("science") ||
      lower.includes("pre-med") ||
      lower.includes("pre-eng") ||
      lower.includes("ics")
    ) {
      setStream("Science");
    } else {
      setStream("General");
    }
  };

  const resetForm = () => {
    setClassName(STANDARD_ACADEMIC_CLASSES[4] || "Grade 9th");
    setCustomName("");
    setIsCustom(false);
    setGradeLevel("9");
    setStream("General");
    setCampus(activeBranches[0]?.campusName || "Main Campus — Gulberg");
    setClassTeacher(TEACHER_OPTIONS[0]);
    setSections("2");
    setStudents("60");
    setSubjects("8");
    setStatus("Active");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalClassName = isCustom ? customName.trim() : className;
    if (!finalClassName) {
      toast.error("Please provide a valid class name.");
      return;
    }

    const parsedGrade = parseInt(gradeLevel, 10);
    const parsedSections = Math.max(1, parseInt(sections, 10) || 1);
    const parsedStudents = Math.max(0, parseInt(students, 10) || 0);
    const parsedSubjects = Math.max(1, parseInt(subjects, 10) || 8);

    const newAcademicClass: AcademicClass = {
      id: `cls-${Date.now()}`,
      className: finalClassName,
      gradeLevel: isNaN(parsedGrade) ? 9 : parsedGrade,
      stream,
      campus,
      sections: parsedSections,
      students: parsedStudents,
      subjects: parsedSubjects,
      classTeacher,
      status,
    };

    onAddClass(newAcademicClass);
    toast.success("Class Registered Successfully", {
      description: `"${finalClassName}" has been assigned to ${campus}.`,
    });
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border border-border shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 bg-muted/30 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand shrink-0">
              <School className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Add Academic Class
              </DialogTitle>
              <DialogDescription className="sr-only">
                Register a new class level, stream, and campus section allocation.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Class Title Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1">
              <GraduationCap className="size-3.5 text-muted-foreground" />
              Class / Grade Standard <span className="text-danger">*</span>
            </label>
            <AcademicSelect
              value={isCustom ? "__custom__" : className}
              onValueChange={(val) => {
                if (val) handleStandardClassSelect(val);
              }}
            >
              <AcademicSelectTrigger className="h-9 text-sm w-full">
                <AcademicSelectValue placeholder="Select class standard" />
              </AcademicSelectTrigger>
              <AcademicSelectContent className="max-h-[260px]">
                {STANDARD_ACADEMIC_CLASSES.map((cls) => (
                  <AcademicSelectItem key={cls} value={cls}>
                    {cls}
                  </AcademicSelectItem>
                ))}
                <AcademicSelectItem value="__custom__">Custom Class Name...</AcademicSelectItem>
              </AcademicSelectContent>
            </AcademicSelect>
          </div>

          {/* Custom Name if selected */}
          {isCustom && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Custom Class Name <span className="text-danger">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Grade 9 - Section C (Cambridge / O-Level)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
          )}

          {/* Grade Level & Academic Stream */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Numerical Grade Level <span className="text-danger">*</span>
              </label>
              <Input
                type="number"
                min="-2"
                max="10"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Layers className="size-3.5 text-muted-foreground" />
                Academic Stream
              </label>
              <AcademicSelect
                value={stream}
                onValueChange={(val) => {
                  if (val) setStream(val as AcademicClass["stream"]);
                }}
              >
                <AcademicSelectTrigger className="h-9 text-sm w-full">
                  <AcademicSelectValue />
                </AcademicSelectTrigger>
                <AcademicSelectContent>
                  {STREAM_OPTIONS.map((st) => (
                    <AcademicSelectItem key={st} value={st}>
                      {st} Stream
                    </AcademicSelectItem>
                  ))}
                </AcademicSelectContent>
              </AcademicSelect>
            </div>
          </div>

          {/* Campus & Class Teacher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <MapPin className="size-3.5 text-muted-foreground" />
                Campus Allocation
              </label>
              <AcademicSelect
                value={campus}
                onValueChange={(val) => {
                  if (val) setCampus(val);
                }}
              >
                <AcademicSelectTrigger className="h-9 text-sm w-full">
                  <AcademicSelectValue />
                </AcademicSelectTrigger>
                <AcademicSelectContent>
                  {activeBranches.map((c) => (
                    <AcademicSelectItem key={c.id} value={c.campusName}>
                      {c.campusName}
                    </AcademicSelectItem>
                  ))}
                </AcademicSelectContent>
              </AcademicSelect>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <User className="size-3.5 text-muted-foreground" />
                Class In-charge / Teacher
              </label>
              <AcademicSelect
                value={classTeacher}
                onValueChange={(val) => {
                  if (val) setClassTeacher(val);
                }}
              >
                <AcademicSelectTrigger className="h-9 text-sm w-full">
                  <AcademicSelectValue />
                </AcademicSelectTrigger>
                <AcademicSelectContent className="max-h-[240px]">
                  {TEACHER_OPTIONS.map((tch) => (
                    <AcademicSelectItem key={tch} value={tch}>
                      {tch}
                    </AcademicSelectItem>
                  ))}
                </AcademicSelectContent>
              </AcademicSelect>
            </div>
          </div>

          {/* Sections, Student Capacity, and Subjects */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Sections
              </label>
              <AcademicSelect
                value={sections}
                onValueChange={(val) => {
                  if (val) setSections(val);
                }}
              >
                <AcademicSelectTrigger className="h-9 text-sm w-full">
                  <AcademicSelectValue placeholder="Select sections" />
                </AcademicSelectTrigger>
                <AcademicSelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => {
                    const letters = getClassSectionLetters(count);
                    const rangeLabel =
                      letters.length === 1
                        ? letters[0]
                        : `${letters[0]}–${letters[letters.length - 1]}`;
                    return (
                      <AcademicSelectItem key={count} value={String(count)}>
                        {count} {count === 1 ? "Sec" : "Secs"} ({rangeLabel})
                      </AcademicSelectItem>
                    );
                  })}
                </AcademicSelectContent>
              </AcademicSelect>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Students
              </label>
              <Input
                type="number"
                min="0"
                max="300"
                value={students}
                onChange={(e) => setStudents(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Subjects
              </label>
              <Input
                type="number"
                min="1"
                max="15"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Initial Status
            </label>
            <AcademicSelect
              value={status}
              onValueChange={(val) => {
                if (val) setStatus(val as AcademicClass["status"]);
              }}
            >
              <AcademicSelectTrigger className="h-9 text-sm w-full">
                <AcademicSelectValue />
              </AcademicSelectTrigger>
              <AcademicSelectContent>
                <AcademicSelectItem value="Active">Active (In Session)</AcademicSelectItem>
                <AcademicSelectItem value="Inactive">Inactive</AcademicSelectItem>
              </AcademicSelectContent>
            </AcademicSelect>
          </div>

          <DialogFooter className="pt-3 border-t border-border/60 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs font-medium cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-9 text-xs font-semibold cursor-pointer gap-1.5"
            >
              <CheckCircle2 className="size-3.5 text-white" />
              Save Class
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
