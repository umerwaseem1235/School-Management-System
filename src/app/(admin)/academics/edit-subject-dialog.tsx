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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Subject } from "@/types";
import { PAKISTANI_SCHOOL_CLASSES, PAKISTANI_SCHOOL_SUBJECTS } from "@/lib/mock/lms";
import {
  BookOpen,
  GraduationCap,
  User,
  CheckCircle2,
  Award,
  Hash,
  Layers,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface EditSubjectDialogProps {
  subject: Subject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSubject: (updatedSubject: Subject) => void;
  onDeleteSubject?: (id: string) => void;
}

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

export function EditSubjectDialog({
  subject,
  open,
  onOpenChange,
  onUpdateSubject,
  onDeleteSubject,
}: EditSubjectDialogProps) {
  const [subjectName, setSubjectName] = React.useState("");
  const [isCustomName, setIsCustomName] = React.useState(false);
  const [subjectCode, setSubjectCode] = React.useState("");
  const [className, setClassName] = React.useState("");
  const [isElective, setIsElective] = React.useState(false);
  const [maxMarks, setMaxMarks] = React.useState("100");
  const [passMarks, setPassMarks] = React.useState("40");
  const [teacher, setTeacher] = React.useState("");

  // Sync state whenever the subject prop changes
  React.useEffect(() => {
    if (subject) {
      setSubjectName(subject.subjectName);
      setIsCustomName(!PAKISTANI_SCHOOL_SUBJECTS.includes(subject.subjectName as any));
      setSubjectCode(subject.subjectCode || "");
      setClassName(subject.className || "");
      setIsElective(!!subject.isElective);
      setMaxMarks(String(subject.maxMarks || 100));
      setPassMarks(String(subject.passMarks || 40));
      setTeacher(subject.teacher || TEACHER_OPTIONS[0]);
    }
  }, [subject]);

  const handleSubjectSelect = (val: string) => {
    if (val === "__custom__") {
      setIsCustomName(true);
      return;
    }
    setIsCustomName(false);
    setSubjectName(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) return;

    const trimmedName = subjectName.trim();
    if (!trimmedName) {
      toast.error("Subject name cannot be empty.");
      return;
    }

    const trimmedCode = subjectCode.trim().toUpperCase();
    if (!trimmedCode) {
      toast.error("Subject code cannot be empty.");
      return;
    }

    const parsedMax = parseInt(maxMarks, 10);
    const parsedPass = parseInt(passMarks, 10);

    if (isNaN(parsedMax) || parsedMax <= 0) {
      toast.error("Maximum marks must be a positive number.");
      return;
    }

    if (isNaN(parsedPass) || parsedPass < 0) {
      toast.error("Passing marks cannot be negative.");
      return;
    }

    if (parsedPass > parsedMax) {
      toast.error("Passing marks cannot exceed maximum marks.");
      return;
    }

    const updated: Subject = {
      ...subject,
      subjectName: trimmedName,
      subjectCode: trimmedCode,
      className,
      isElective,
      maxMarks: parsedMax,
      passMarks: parsedPass,
      teacher,
    };

    onUpdateSubject(updated);
    toast.success("Subject Updated Successfully", {
      description: `"${trimmedName}" (${trimmedCode}) for ${className} has been updated.`,
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!subject) return;
    if (confirm(`Are you sure you want to remove "${subject.subjectName}"?`)) {
      onDeleteSubject?.(subject.id);
      toast.info("Subject Removed", {
        description: `"${subject.subjectName}" was removed from the curriculum.`,
      });
      onOpenChange(false);
    }
  };

  if (!subject) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border border-border shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 bg-muted/30 border-b border-border/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand shrink-0">
                <BookOpen className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-foreground">
                  Edit Subject
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Update subject details, allocated class, marks grading, and assigned teacher.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Subject Name Standard vs Custom */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1">
              <BookOpen className="size-3.5 text-muted-foreground" />
              Subject Standard <span className="text-danger">*</span>
            </label>
            <Select
              value={isCustomName ? "__custom__" : subjectName}
              onValueChange={(val) => {
                if (val) handleSubjectSelect(val);
              }}
            >
              <SelectTrigger className="h-9 text-sm w-full">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent className="max-h-[260px]">
                {PAKISTANI_SCHOOL_SUBJECTS.map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
                <SelectItem value="__custom__">Custom Subject Name...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isCustomName && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Custom Subject Title <span className="text-danger">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Advanced Arabic & Linguistics"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
          )}

          {/* Code & Target Class */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Hash className="size-3.5 text-muted-foreground" />
                Subject Code <span className="text-danger">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. MTH-09"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                className="h-9 text-sm uppercase font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <GraduationCap className="size-3.5 text-muted-foreground" />
                Allocated Class
              </label>
              <Select
                value={className}
                onValueChange={(val) => {
                  if (val) setClassName(val);
                }}
              >
                <SelectTrigger className="h-9 text-sm w-full">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="max-h-[260px]">
                  {PAKISTANI_SCHOOL_CLASSES.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Classification: Core vs Elective */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1">
              <Layers className="size-3.5 text-muted-foreground" />
              Subject Classification
            </label>
            <Select
              value={isElective ? "elective" : "core"}
              onValueChange={(val) => setIsElective(val === "elective")}
            >
              <SelectTrigger className="h-9 text-sm w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="core">Core / Compulsory Subject</SelectItem>
                <SelectItem value="elective">Elective / Optional Subject</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Marks Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Award className="size-3.5 text-muted-foreground" />
                Maximum Marks
              </label>
              <Input
                type="number"
                min="10"
                max="200"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Passing Marks (Cut-off)
              </label>
              <Input
                type="number"
                min="0"
                max="200"
                value={passMarks}
                onChange={(e) => setPassMarks(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
          </div>

          {/* Assigned Teacher */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1">
              <User className="size-3.5 text-muted-foreground" />
              Assigned Instructor / Teacher
            </label>
            <Select
              value={teacher}
              onValueChange={(val) => {
                if (val) setTeacher(val);
              }}
            >
              <SelectTrigger className="h-9 text-sm w-full">
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent className="max-h-[240px]">
                {TEACHER_OPTIONS.map((tch) => (
                  <SelectItem key={tch} value={tch}>
                    {tch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-3 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            {onDeleteSubject ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-9 text-xs text-danger hover:bg-danger-soft/20 hover:text-danger cursor-pointer mr-auto"
              >
                <Trash2 className="size-3.5 mr-1" />
                Remove Subject
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 self-end sm:self-auto">
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
                className="h-9 text-xs font-semibold bg-primary hover:bg-primary/90 text-white cursor-pointer gap-1.5"
              >
                <CheckCircle2 className="size-3.5 text-white" />
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
