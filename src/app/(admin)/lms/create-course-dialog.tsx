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
import type { LmsCourse } from "@/types";
import { PAKISTANI_SCHOOL_CLASSES, PAKISTANI_SCHOOL_SUBJECTS } from "@/lib/mock/lms";
import { BookOpen, GraduationCap, MapPin, Layers } from "lucide-react";
import { toast } from "sonner";

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCourse: (course: LmsCourse) => void;
}

const SUBJECT_OPTIONS = PAKISTANI_SCHOOL_SUBJECTS;

const CAMPUS_OPTIONS = [
  "Main Campus — Gulberg",
  "DHA Phase 5 Campus",
  "F-8 Islamabad Campus",
  "Clifton Karachi Campus",
  "Bahria Town Campus",
];

export function CreateCourseDialog({
  open,
  onOpenChange,
  onAddCourse,
}: CreateCourseDialogProps) {
  const [title, setTitle] = React.useState("");
  const [courseCode, setCourseCode] = React.useState("");
  const [className, setClassName] = React.useState<string>(PAKISTANI_SCHOOL_CLASSES[7]);
  const [subject, setSubject] = React.useState("Mathematics");
  const [teacher, setTeacher] = React.useState("Mr. Adeel Hassan");
  const [campus, setCampus] = React.useState(CAMPUS_OPTIONS[0]);
  const [totalLessons, setTotalLessons] = React.useState("30");
  const [enrolledStudents, setEnrolledStudents] = React.useState("32");

  const resetForm = () => {
    setTitle("");
    setCourseCode("");
    setClassName(PAKISTANI_SCHOOL_CLASSES[7]);
    setSubject("Mathematics");
    setTeacher("Mr. Adeel Hassan");
    setCampus(CAMPUS_OPTIONS[0]);
    setTotalLessons("30");
    setEnrolledStudents("32");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseCode.trim()) {
      toast.error("Please fill in course title and course code.");
      return;
    }

    const newCourse: LmsCourse = {
      id: `lms-c${Date.now()}`,
      title: title.trim(),
      courseCode: courseCode.trim().toUpperCase(),
      className: className.trim(),
      subject,
      teacher: teacher.trim() || "Lead Instructor",
      campus,
      totalLessons: parseInt(totalLessons, 10) || 28,
      completedLessons: 0,
      enrolledStudents: parseInt(enrolledStudents, 10) || 30,
      activeAssignments: 0,
      status: "Active",
      colorTone: "brand",
    };

    onAddCourse(newCourse);
    toast.success("Course Created", {
      description: `Course "${newCourse.title}" is now added to the curriculum.`,
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
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border border-border shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 bg-muted/30 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <BookOpen className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Add Academic Course
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Set up a new digital curriculum track, syllabus modules, and enrolled class.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Course Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Course Title <span className="text-danger">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Grade 10 Mathematics (Core)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-sm"
              required
            />
          </div>

          {/* Course Code & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Course Code <span className="text-danger">*</span>
              </label>
              <Input
                type="text"
                placeholder="MTH-10"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="h-9 text-sm uppercase"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <BookOpen className="size-3.5 text-muted-foreground" />
                Subject
              </label>
              <Select
                value={subject}
                onValueChange={(val) => {
                  if (val) setSubject(val);
                }}
              >
                <SelectTrigger className="h-9 text-sm w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[260px]">
                  {SUBJECT_OPTIONS.map((sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Target Class & Teacher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <GraduationCap className="size-3.5 text-muted-foreground" />
                Target Class
              </label>
              <Select
                value={className}
                onValueChange={(val) => {
                  if (val) setClassName(val);
                }}
              >
                <SelectTrigger className="h-9 text-sm w-full">
                  <SelectValue placeholder="Select target class" />
                </SelectTrigger>
                <SelectContent>
                  {PAKISTANI_SCHOOL_CLASSES.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Lead Teacher</label>
              <Input
                type="text"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Campus */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1">
              <MapPin className="size-3.5 text-muted-foreground" />
              Campus
            </label>
            <Select
              value={campus}
              onValueChange={(val) => {
                if (val) setCampus(val);
              }}
            >
              <SelectTrigger className="h-9 text-sm w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMPUS_OPTIONS.map((camp) => (
                  <SelectItem key={camp} value={camp}>
                    {camp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lessons & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Layers className="size-3.5 text-muted-foreground" />
                Planned Lessons
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={totalLessons}
                onChange={(e) => setTotalLessons(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Enrolled Students</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={enrolledStudents}
                onChange={(e) => setEnrolledStudents(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border/60 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="text-xs h-9 px-4 bg-primary hover:bg-primary/90 text-white shadow-xs font-semibold"
            >
              Add Course
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
