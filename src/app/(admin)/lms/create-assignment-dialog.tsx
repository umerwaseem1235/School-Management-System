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
import { PAKISTANI_SCHOOL_CLASSES } from "@/lib/mock/lms";
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
  const [className, setClassName] = React.useState(courses[0]?.className || PAKISTANI_SCHOOL_CLASSES[7]);
  const [teacher, setTeacher] = React.useState(courses[0]?.teacher || "Mr. Adeel Hassan");
  const [dueDate, setDueDate] = React.useState("2026-10-28");
  const [maxMarks, setMaxMarks] = React.useState("25");
  const [instructions, setInstructions] = React.useState("");

  // Update class and teacher when course selection changes
  const handleCourseChange = React.useCallback((courseId: string) => {
    setSelectedCourseId(courseId);
    const matched = courses.find((c) => c.id === courseId);
    if (matched) {
      setClassName(matched.className);
      setTeacher(matched.teacher);
    }
  }, [courses]);

  React.useEffect(() => {
    if (defaultCourseId && open) {
      handleCourseChange(defaultCourseId);
    }
  }, [defaultCourseId, open, handleCourseChange]);

  const resetForm = () => {
    setTitle("");
    if (courses[0]) {
      setSelectedCourseId(courses[0].id);
      setClassName(courses[0].className);
      setTeacher(courses[0].teacher);
    }
    setDueDate("2026-10-28");
    setMaxMarks("25");
    setInstructions("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please provide an assignment title.");
      return;
    }

    const matchedCourse = courses.find((c) => c.id === selectedCourseId);
    const parsedMarks = parseInt(maxMarks, 10);

    const newAssignment: LmsAssignment = {
      id: `asg-${Date.now()}`,
      title: title.trim(),
      courseName: matchedCourse ? matchedCourse.title : "General Coursework",
      className: className.trim() || "All Sections",
      teacher: teacher.trim() || "Course Instructor",
      dueDate: dueDate || "2026-10-28",
      totalSubmissions: 0,
      totalStudents: matchedCourse ? matchedCourse.enrolledStudents : 30,
      maxMarks: isNaN(parsedMarks) || parsedMarks <= 0 ? 25 : parsedMarks,
      status: "Active",
    };

    onAddAssignment(newAssignment);
    toast.success("Assignment Published", {
      description: `"${newAssignment.title}" was published for ${newAssignment.className}.`,
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
                Create New Assignment
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Assign homework, lab tasks, or assessments to enrolled students.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Assignment Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Assignment Title <span className="text-danger">*</span>
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

          {/* Course Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-muted-foreground" />
              Related Course
            </label>
            <Select
              value={selectedCourseId}
              onValueChange={(val) => {
                if (val) handleCourseChange(val);
              }}
            >
              <SelectTrigger className="h-9 text-sm w-full">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title} ({course.courseCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class & Teacher (Auto-filled but editable) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <GraduationCap className="size-3.5 text-muted-foreground" />
                Target Class / Section
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
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <User className="size-3.5 text-muted-foreground" />
                Instructor / Teacher
              </label>
              <Input
                type="text"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Due Date & Maximum Marks */}
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
                Max Marks
              </label>
              <Input
                type="number"
                min="1"
                max="200"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Instructions / Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Task Guidelines & Instructions (Optional)
            </label>
            <Textarea
              placeholder="Provide submission guidelines, reference textbook pages, or rubric details..."
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
              className="text-xs h-9 px-4 bg-primary hover:bg-primary/90 text-white shadow-xs font-semibold"
            >
              Publish Assignment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
