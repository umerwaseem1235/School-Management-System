"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  PAKISTANI_TEST_CLASSES,
  PAKISTANI_SUBJECTS_LIST,
  PAKISTANI_TEACHERS_LIST,
  type ClassTest,
  type TestType,
} from "@/lib/mock/tests-assessments";
import { CalendarPlus, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface ScheduleTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTest: (test: ClassTest) => void;
}

export function ScheduleTestDialog({
  open,
  onOpenChange,
  onAddTest,
}: ScheduleTestDialogProps) {
  const [title, setTitle] = React.useState("");
  const [testType, setTestType] = React.useState<TestType>("Weekly Test");
  const [className, setClassName] = React.useState(PAKISTANI_TEST_CLASSES[0]);
  const [section, setSection] = React.useState("A");
  const [subject, setSubject] = React.useState(PAKISTANI_SUBJECTS_LIST[0]);
  const [testDate, setTestDate] = React.useState("2026-10-27");
  const [totalMarks, setTotalMarks] = React.useState<number>(25);

  React.useEffect(() => {
    if (open) {
      setTestDate(new Date().toISOString().split("T")[0]);
    }
  }, [open]);
  const [passingMarks, setPassingMarks] = React.useState<number>(8);
  const [chapterOrTopic, setChapterOrTopic] = React.useState("");
  const [teacherName, setTeacherName] = React.useState(PAKISTANI_TEACHERS_LIST[0]);

  // Adjust default passing marks when total marks change (33% Pakistani standard)
  const handleTotalMarksChange = (marks: number) => {
    setTotalMarks(marks);
    setPassingMarks(Math.ceil(marks * 0.33));
  };

  const handleTestTypeChange = (type: TestType) => {
    setTestType(type);
    if (type === "Monthly Assessment") {
      setTotalMarks(50);
      setPassingMarks(17);
    } else if (type === "Weekly Test" || type === "Chapter Test") {
      setTotalMarks(25);
      setPassingMarks(8);
    } else if (type === "Class Quiz") {
      setTotalMarks(15);
      setPassingMarks(5);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a test title or description.");
      return;
    }

    if (!chapterOrTopic.trim()) {
      toast.error("Please specify syllabus or chapter topics covered.");
      return;
    }

    const newTest: ClassTest = {
      id: `test-${Date.now()}`,
      title: title.trim(),
      testType,
      className,
      section,
      subject,
      subjectCode: subject.slice(0, 3).toUpperCase(),
      chapterOrTopic: chapterOrTopic.trim(),
      testDate,
      totalMarks,
      passingMarks,
      teacherName,
      campus: "Main Campus — Gulberg",
      status: "Scheduled",
    };

    onAddTest(newTest);
    toast.success("Class test scheduled successfully!");

    // Reset form
    setTitle("");
    setChapterOrTopic("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
              <CalendarPlus className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Schedule New Class Test
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Register a weekly test, monthly assessment, or chapter evaluation.
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Test Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold">
              Test Title / Assessment Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Unit 3 Test: Linear Equations & Inequalities"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs h-9"
              required
            />
          </div>

          {/* Test Type & Class */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assessment Type</Label>
              <Select
                value={testType}
                onValueChange={(val) => {
                  if (val) handleTestTypeChange(val as TestType);
                }}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Weekly Test">Weekly Test (25 Marks)</SelectItem>
                  <SelectItem value="Monthly Assessment">Monthly Assessment (50 Marks)</SelectItem>
                  <SelectItem value="Chapter Test">Chapter / Unit Test (25 Marks)</SelectItem>
                  <SelectItem value="Class Quiz">Surprise Quiz (15 Marks)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Class / Cohort</Label>
              <Select
                value={className}
                onValueChange={(val) => {
                  if (val) setClassName(val);
                }}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {PAKISTANI_TEST_CLASSES.map((c) => (
                    <SelectItem key={c} value={c} className="text-xs">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject & Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">Subject</Label>
              <Select
                value={subject}
                onValueChange={(val) => {
                  if (val) setSubject(val);
                }}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {PAKISTANI_SUBJECTS_LIST.map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Section</Label>
              <Select
                value={section}
                onValueChange={(val) => {
                  if (val) setSection(val);
                }}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date & Marks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="testDate" className="text-xs font-semibold">
                Test Date
              </Label>
              <Input
                id="testDate"
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="totalMarks" className="text-xs font-semibold">
                Total Marks
              </Label>
              <Input
                id="totalMarks"
                type="number"
                min="5"
                max="100"
                value={totalMarks}
                onChange={(e) => handleTotalMarksChange(Number(e.target.value))}
                className="text-xs h-9 font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="passMarks" className="text-xs font-semibold">
                Pass Marks (33% Min)
              </Label>
              <Input
                id="passMarks"
                type="number"
                min="1"
                max={totalMarks}
                value={passingMarks}
                onChange={(e) => setPassingMarks(Number(e.target.value))}
                className="text-xs h-9 font-mono"
                required
              />
            </div>
          </div>

          {/* Syllabus Topics */}
          <div className="space-y-1.5">
            <Label htmlFor="syllabus" className="text-xs font-semibold">
              Syllabus / Chapter Topics Covered <span className="text-destructive">*</span>
            </Label>
            <Input
              id="syllabus"
              placeholder="e.g. Chapter 4: Ex 4.1 to 4.4 and Short Questions from Chapter Review"
              value={chapterOrTopic}
              onChange={(e) => setChapterOrTopic(e.target.value)}
              className="text-xs h-9"
              required
            />
          </div>

          {/* Teacher Incharge */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Subject Teacher</Label>
            <Select
              value={teacherName}
              onValueChange={(val) => {
                if (val) setTeacherName(val);
              }}
            >
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {PAKISTANI_TEACHERS_LIST.map((t) => (
                  <SelectItem key={t} value={t} className="text-xs">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-brand text-brand-foreground hover:bg-brand/90 text-xs h-9"
            >
              Schedule Test
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
