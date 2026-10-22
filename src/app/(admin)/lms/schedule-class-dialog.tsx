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
import type { LmsLiveClass } from "@/types";
import { PAKISTANI_SCHOOL_CLASSES, PAKISTANI_SCHOOL_SUBJECTS } from "@/lib/mock/lms";
import { Video, Calendar, Clock, Globe, BookOpen, GraduationCap } from "lucide-react";
import { toast } from "sonner";

interface ScheduleClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduleClass: (liveClass: LmsLiveClass) => void;
}

const SUBJECT_OPTIONS = PAKISTANI_SCHOOL_SUBJECTS;

export function ScheduleClassDialog({
  open,
  onOpenChange,
  onScheduleClass,
}: ScheduleClassDialogProps) {
  const [title, setTitle] = React.useState("");
  const [subject, setSubject] = React.useState("Mathematics");
  const [className, setClassName] = React.useState<string>(PAKISTANI_SCHOOL_CLASSES[7]);
  const [teacher, setTeacher] = React.useState("Mr. Adeel Hassan");
  const [date, setDate] = React.useState("2026-10-21");
  const [startTime, setStartTime] = React.useState("10:00 AM");
  const [endTime, setEndTime] = React.useState("11:00 AM");
  const [platform, setPlatform] = React.useState<LmsLiveClass["platform"]>("Google Meet");
  const [joinUrl, setJoinUrl] = React.useState("https://meet.google.com/new");

  const resetForm = () => {
    setTitle("");
    setSubject("Mathematics");
    setClassName(PAKISTANI_SCHOOL_CLASSES[7]);
    setTeacher("Mr. Adeel Hassan");
    setDate("2026-10-21");
    setStartTime("10:00 AM");
    setEndTime("11:00 AM");
    setPlatform("Google Meet");
    setJoinUrl("https://meet.google.com/new");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title for the virtual class.");
      return;
    }

    const newClass: LmsLiveClass = {
      id: `live-${Date.now()}`,
      title: title.trim(),
      subject,
      className: className.trim(),
      teacher: teacher.trim() || "Course Teacher",
      date: date || "2026-10-21",
      startTime: startTime || "10:00 AM",
      endTime: endTime || "11:00 AM",
      platform,
      status: "Upcoming",
      joinUrl: joinUrl.trim() || "https://meet.google.com",
    };

    onScheduleClass(newClass);
    toast.success("Virtual Class Scheduled", {
      description: `"${newClass.title}" scheduled for ${newClass.date} at ${newClass.startTime}.`,
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
              <Video className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Schedule Virtual Class
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Set up a live lecture, webinar, or revision session for students.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Class Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Session Title / Topic <span className="text-danger">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Physics: Practical Discussion & Numerical Solving"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-sm"
              required
            />
          </div>

          {/* Subject & Class */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          </div>

          {/* Teacher & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Teacher / Host</label>
              <Input
                type="text"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Platform</label>
              <Select
                value={platform}
                onValueChange={(val) => {
                  if (val) setPlatform(val as LmsLiveClass["platform"]);
                }}
              >
                <SelectTrigger className="h-9 text-sm w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Google Meet">Google Meet</SelectItem>
                  <SelectItem value="Zoom">Zoom</SelectItem>
                  <SelectItem value="MS Teams">Microsoft Teams</SelectItem>
                  <SelectItem value="Internal LMS">Internal LMS Portal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Calendar className="size-3.5 text-muted-foreground" />
                Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Clock className="size-3.5 text-muted-foreground" />
                Start Time
              </label>
              <Input
                type="text"
                placeholder="10:00 AM"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Clock className="size-3.5 text-muted-foreground" />
                End Time
              </label>
              <Input
                type="text"
                placeholder="11:00 AM"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Meeting Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1">
              <Globe className="size-3.5 text-muted-foreground" />
              Direct Meeting Link
            </label>
            <Input
              type="url"
              placeholder="https://meet.google.com/..."
              value={joinUrl}
              onChange={(e) => setJoinUrl(e.target.value)}
              className="h-9 text-sm"
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
              Schedule Session
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
