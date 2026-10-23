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
import type { AcademicClass } from "@/types";
import {
  School,
  User,
  MapPin,
  CheckCircle2,
  Users,
  Grid,
} from "lucide-react";
import { toast } from "sonner";

interface EditClassDialogProps {
  classItem: AcademicClass | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateClass: (updated: AcademicClass) => void;
}

const CAMPUS_OPTIONS = [
  "Main Campus — Gulberg",
  "DHA Phase 5 Campus",
  "F-8 Islamabad Campus",
  "Clifton Karachi Campus",
  "Bahria Town Campus",
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

export function EditClassDialog({
  classItem,
  open,
  onOpenChange,
  onUpdateClass,
}: EditClassDialogProps) {
  const [className, setClassName] = React.useState("");
  const [gradeLevel, setGradeLevel] = React.useState(9);
  const [campus, setCampus] = React.useState(CAMPUS_OPTIONS[0]);
  const [classTeacher, setClassTeacher] = React.useState(TEACHER_OPTIONS[0]);
  const [sections, setSections] = React.useState("2");
  const [students, setStudents] = React.useState("50");
  const [status, setStatus] = React.useState<"Active" | "Inactive">("Active");

  React.useEffect(() => {
    if (classItem) {
      setClassName(classItem.className);
      setGradeLevel(classItem.gradeLevel || 9);
      setCampus(classItem.campus || CAMPUS_OPTIONS[0]);
      setClassTeacher(classItem.classTeacher || TEACHER_OPTIONS[0]);
      setSections(String((classItem as any).sectionsCount || classItem.sections || 2));
      setStudents(String((classItem as any).studentsCount || classItem.students || 50));
      setStatus((classItem.status as "Active" | "Inactive") || "Active");
    }
  }, [classItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!classItem) return;
    if (!className.trim()) {
      toast.error("Class Name is required");
      return;
    }

    const updated: AcademicClass = {
      ...classItem,
      className: className.trim(),
      gradeLevel: Number(gradeLevel) || 9,
      campus,
      classTeacher,
      sections: Math.max(1, parseInt(sections, 10) || 1),
      students: Math.max(0, parseInt(students, 10) || 0),
      status,
    };

    onUpdateClass(updated);
    toast.success("Class Updated", {
      description: `"${updated.className}" has been updated successfully.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden rounded-2xl border border-border/80 shadow-xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-soft/40 via-background to-background p-6 border-b border-border/70">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand text-cream shadow-sm">
                  <School className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-semibold text-foreground">
                    Edit Academic Class
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Modify class details, campus allocation, teacher, and student capacity.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            {/* Class Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <School className="size-3.5 text-muted-foreground" />
                Class Name
              </label>
              <Input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. Grade 9th (Science - Biology)"
                className="h-9 text-xs"
                required
              />
            </div>

            {/* Campus & Grade Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  Campus
                </label>
                <Select value={campus} onValueChange={(val) => val && setCampus(val)}>
                  <SelectTrigger className="h-9 text-xs w-full">
                    <SelectValue placeholder="Select campus" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPUS_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Grade Level (1 – 12)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(parseInt(e.target.value, 10) || 1)}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            {/* Class Teacher */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-muted-foreground" />
                Class Teacher
              </label>
              <Select value={classTeacher} onValueChange={(val) => val && setClassTeacher(val)}>
                <SelectTrigger className="h-9 text-xs w-full">
                  <SelectValue placeholder="Assign teacher" />
                </SelectTrigger>
                <SelectContent className="max-h-[220px]">
                  {TEACHER_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sections & Students Count */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Grid className="size-3.5 text-muted-foreground" />
                  Sections
                </label>
                <Input
                  type="number"
                  min={1}
                  max={15}
                  value={sections}
                  onChange={(e) => setSections(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Users className="size-3.5 text-muted-foreground" />
                  Total Students
                </label>
                <Input
                  type="number"
                  min={0}
                  max={500}
                  value={students}
                  onChange={(e) => setStudents(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            {/* Class Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Class Status
              </label>
              <Select value={status} onValueChange={(val) => val && setStatus(val as "Active" | "Inactive")}>
                <SelectTrigger className="h-9 text-xs w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active" className="text-xs">Active</SelectItem>
                  <SelectItem value="Inactive" className="text-xs">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-3.5 bg-muted/30 border-t border-border/70 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-brand text-cream hover:bg-brand-600 text-xs h-8 gap-1.5"
            >
              <CheckCircle2 className="size-3.5" />
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
