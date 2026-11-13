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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LmsAssignment, LmsCourse } from "@/types";
import { formatCompactClass, PAKISTANI_SCHOOL_CLASSES } from "@/lib/mock/lms";
import { FilePlus, Calendar, Award, User, BookOpen, GraduationCap } from "lucide-react";
import { toast } from "sonner";

interface CreateAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAssignment: (assignment: LmsAssignment) => void;
  courses: LmsCourse[];
  defaultCourseId?: string;
}

export function CreateAssignmentDialog({
  open,
  onOpenChange,
  onAddAssignment,
  courses,
  defaultCourseId,
}: CreateAssignmentDialogProps) {
  const [title, setTitle] = React.useState("");
  const [selectedCourseId, setSelectedCourseId] = React.useState(defaultCourseId || courses[0]?.id || "");
  const [className, setClassName] = React.useState(courses[0]?.className || PAKISTANI_SCHOOL_CLASSES[4]);
  const [teacher, setTeacher] = React.useState(courses[0]?.teacher || "Mr. Adeel Hassan");
  const [dueDate, setDueDate] = React.useState("2026-10-28");
  const [maxMarks, setMaxMarks] = React.useState("20");
  const [instructions, setInstructions] = React.useState("");

  // Update class and teacher when subject selection changes
  const handleCourseChange = React.useCallback((courseId: string) => {
    setSelectedCourseId(courseId);
    const matched = courses.find((c) => c.id === courseId);
    if (matched) {
      setClassName(matched.className);
      setTeacher(matched.teacher);
    }
  }, [courses]);

  const resetForm = () => {
    setTitle("");
    if (courses[0]) {
      setSelectedCourseId(courses[0].id);
      setClassName(courses[0].className);
      setTeacher(courses[0].teacher);
    }
    setDueDate("2026-10-28");
    setMaxMarks("20");
    setInstructions("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please provide a homework title.");
      return;
    }

    const matchedCourse = courses.find((c) => c.id === selectedCourseId);
    const parsedMarks = parseInt(maxMarks, 10);

    const newAssignment: LmsAssignment = {
      id: `asg-${Date.now()}`,
      title: title.trim(),
      courseName: matchedCourse ? matchedCourse.title : "General Classwork",
      className: className.trim() || "All Sections",
      teacher: teacher.trim() || "Subject Teacher",
      dueDate: dueDate || "2026-10-28",
      totalSubmissions: 0,
      totalStudents: matchedCourse ? matchedCourse.enrolledStudents : 30,
      maxMarks: isNaN(parsedMarks) || parsedMarks <= 0 ? 20 : parsedMarks,
      status: "Active",
    };

    onAddAssignment(newAssignment);
    toast.success("Homework Assigned", {
      description: `"${newAssignment.title}" was assigned to ${formatCompactClass(newAssignment.className)}.`,
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
      <DialogContent className="sm:max-w-[560px] md:max-w-[600px] w-full p-0 overflow-hidden rounded-2xl border border-border shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 bg-muted/30 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <FilePlus className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Assign Homework
              </DialogTitle>
              <DialogDescription className="sr-only">
                Assign classwork or homework with a due date and total marks.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Homework Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Homework Title <span className="text-danger">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Linear Equations Exercise 3.2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-sm"
              required
            />
          </div>

          {/* Subject Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-muted-foreground" />
              Subject
            </label>
            <Select
              value={selectedCourseId}
              onValueChange={(val) => {
                if (val) handleCourseChange(val);
              }}
            >
              <SelectTrigger className="h-9 text-sm w-full">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.subject} — {formatCompactClass(course.className)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class & Teacher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <GraduationCap className="size-3.5 text-muted-foreground" />
                Class
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
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <User className="size-3.5 text-muted-foreground" />
                Teacher
              </label>
              <Input
                type="text"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Due Date & Total Marks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Calendar className="size-3.5 text-muted-foreground" />
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Award className="size-3.5 text-muted-foreground" />
                Total Marks
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Homework Note (Optional)
            </label>
            <Textarea
              placeholder="e.g. Complete Questions 1 to 5 neatly in your notebook..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              className="text-sm min-h-[72px]"
            />
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
              size="lg"
              className="px-4 cursor-pointer"
            >
              Assign Homework
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
