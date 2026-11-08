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
  Plus,
  Trash2,
  Calculator,
  Award,
  CheckCircle2,
  AlertCircle,
  Percent,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import {
  RESULT_TERMS,
  RESULT_CLASSES,
  calculateGradeFromPercentage,
  type StudentTermResult,
  type ResultSubjectScore,
  type ResultStatus,
} from "@/lib/mock/results";
import { useBranches } from "@/context/branches-context";
import { cn } from "@/lib/utils";

interface AddResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddResult: (newResult: StudentTermResult) => void;
  defaultClassName?: string;
  defaultTermName?: string;
  defaultCampus?: string;
}

export function getDefaultSubjects(className: string): ResultSubjectScore[] {
  if (className.includes("Computer")) {
    return [
      { subjectName: "English (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 65, grade: "A", isPassed: true },
      { subjectName: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 62, grade: "A", isPassed: true },
      { subjectName: "Mathematics (Science)", maxMarks: 75, passMarks: 25, obtainedMarks: 68, grade: "A+", isPassed: true },
      { subjectName: "Computer Science", maxMarks: 75, passMarks: 25, obtainedMarks: 66, grade: "A", isPassed: true },
      { subjectName: "Physics", maxMarks: 75, passMarks: 25, obtainedMarks: 60, grade: "B", isPassed: true },
      { subjectName: "Chemistry", maxMarks: 75, passMarks: 25, obtainedMarks: 58, grade: "B", isPassed: true },
      { subjectName: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17, obtainedMarks: 44, grade: "A+", isPassed: true },
      { subjectName: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17, obtainedMarks: 42, grade: "A+", isPassed: true },
    ];
  }

  if (className.includes("Grade 8") || className.includes("Grade 7")) {
    return [
      { subjectName: "English", maxMarks: 100, passMarks: 33, obtainedMarks: 82, grade: "A+", isPassed: true },
      { subjectName: "Urdu", maxMarks: 100, passMarks: 33, obtainedMarks: 78, grade: "A", isPassed: true },
      { subjectName: "Mathematics", maxMarks: 100, passMarks: 33, obtainedMarks: 85, grade: "A+", isPassed: true },
      { subjectName: "General Science", maxMarks: 100, passMarks: 33, obtainedMarks: 80, grade: "A+", isPassed: true },
      { subjectName: "Social Studies", maxMarks: 100, passMarks: 33, obtainedMarks: 75, grade: "A", isPassed: true },
      { subjectName: "Islamiat", maxMarks: 50, passMarks: 17, obtainedMarks: 44, grade: "A+", isPassed: true },
      { subjectName: "Computer Studies", maxMarks: 50, passMarks: 17, obtainedMarks: 42, grade: "A+", isPassed: true },
    ];
  }

  // Default Science (Biology)
  return [
    { subjectName: "English (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 68, grade: "A+", isPassed: true },
    { subjectName: "Urdu (Compulsory)", maxMarks: 75, passMarks: 25, obtainedMarks: 64, grade: "A", isPassed: true },
    { subjectName: "Mathematics (Science)", maxMarks: 75, passMarks: 25, obtainedMarks: 70, grade: "A+", isPassed: true },
    { subjectName: "Biology", maxMarks: 75, passMarks: 25, obtainedMarks: 67, grade: "A+", isPassed: true },
    { subjectName: "Physics", maxMarks: 75, passMarks: 25, obtainedMarks: 63, grade: "A", isPassed: true },
    { subjectName: "Chemistry", maxMarks: 75, passMarks: 25, obtainedMarks: 61, grade: "B", isPassed: true },
    { subjectName: "Islamiat (Compulsory)", maxMarks: 50, passMarks: 17, obtainedMarks: 45, grade: "A+", isPassed: true },
    { subjectName: "Tarjuma-tul-Quran", maxMarks: 50, passMarks: 17, obtainedMarks: 43, grade: "A+", isPassed: true },
  ];
}

export function computeResultSummary(subjects: ResultSubjectScore[]) {
  const totalMaxMarks = subjects.reduce(
    (acc, curr) => acc + (Number(curr.maxMarks) || 0),
    0
  );
  const totalObtainedMarks = subjects.reduce(
    (acc, curr) => acc + (Number(curr.obtainedMarks) || 0),
    0
  );

  const percentage =
    totalMaxMarks > 0 ? (totalObtainedMarks / totalMaxMarks) * 100 : 0;
  const gradeInfo = calculateGradeFromPercentage(percentage);

  // Count subjects where obtainedMarks < passMarks
  const failedSubjects = subjects.filter(
    (s) => (Number(s.obtainedMarks) || 0) < (Number(s.passMarks) || 0)
  ).length;

  let status: ResultStatus = "Passed";
  if (failedSubjects >= 3 || percentage < 33) {
    status = "Fail";
  } else if (failedSubjects > 0) {
    status = "Compartment";
  }

  return {
    totalMaxMarks,
    totalObtainedMarks,
    percentage: Number(percentage.toFixed(2)),
    overallGrade: gradeInfo.grade,
    gradeDescription: gradeInfo.description,
    status,
    failedSubjects,
  };
}

export function AddResultDialog({
  open,
  onOpenChange,
  onAddResult,
  defaultClassName,
  defaultTermName,
  defaultCampus,
}: AddResultDialogProps) {
  const { branches } = useBranches();

  // Student & Exam Metadata
  const [className, setClassName] = React.useState(
    defaultClassName && defaultClassName !== "ALL"
      ? defaultClassName
      : RESULT_CLASSES[0]
  );
  const [termName, setTermName] = React.useState(
    defaultTermName && defaultTermName !== "ALL"
      ? defaultTermName
      : RESULT_TERMS[0]
  );
  const [campus, setCampus] = React.useState(() => {
    if (defaultCampus && defaultCampus !== "ALL") return defaultCampus;
    return branches[0]?.campusName || "Main Campus — Gulberg";
  });
  const [studentName, setStudentName] = React.useState("");
  const [rollNo, setRollNo] = React.useState("");
  const [fatherName, setFatherName] = React.useState("");
  const [attendance, setAttendance] = React.useState<number | "">(95);
  const [teacherRemarks, setTeacherRemarks] = React.useState("");

  // Subjects state
  const [subjects, setSubjects] = React.useState<ResultSubjectScore[]>(() =>
    getDefaultSubjects(className)
  );

  // Reset or change subjects when class changes
  const handleClassChange = (newClass: string) => {
    setClassName(newClass);
    setSubjects(getDefaultSubjects(newClass));
  };

  // Sync default filters if dialog opens
  React.useEffect(() => {
    if (open) {
      if (defaultClassName && defaultClassName !== "ALL") {
        setClassName(defaultClassName);
        setSubjects(getDefaultSubjects(defaultClassName));
      }
      if (defaultTermName && defaultTermName !== "ALL") {
        setTermName(defaultTermName);
      }
      if (defaultCampus && defaultCampus !== "ALL") {
        setCampus(defaultCampus);
      } else if (branches.length > 0 && !campus) {
        setCampus(branches[0].campusName);
      }
    }
  }, [open, defaultClassName, defaultTermName, defaultCampus, branches, campus]);

  // Compute live summary
  const summary = React.useMemo(() => computeResultSummary(subjects), [subjects]);

  // Handle single subject mark update
  const handleSubjectMarkChange = (index: number, rawVal: string) => {
    setSubjects((prev) => {
      const next = [...prev];
      const s = { ...next[index] };
      const val = rawVal === "" ? 0 : Math.max(0, parseInt(rawVal, 10) || 0);
      s.obtainedMarks = Math.min(s.maxMarks * 2, val); // Safe upper bound
      const pct = s.maxMarks > 0 ? (s.obtainedMarks / s.maxMarks) * 100 : 0;
      s.grade = calculateGradeFromPercentage(pct).grade;
      s.isPassed = s.obtainedMarks >= s.passMarks;
      next[index] = s;
      return next;
    });
  };

  // Handle single subject max marks update
  const handleSubjectMaxChange = (index: number, rawVal: string) => {
    setSubjects((prev) => {
      const next = [...prev];
      const s = { ...next[index] };
      const max = Math.max(1, parseInt(rawVal, 10) || 100);
      s.maxMarks = max;
      s.passMarks = Math.ceil(max * 0.33);
      const pct = (s.obtainedMarks / s.maxMarks) * 100;
      s.grade = calculateGradeFromPercentage(pct).grade;
      s.isPassed = s.obtainedMarks >= s.passMarks;
      next[index] = s;
      return next;
    });
  };

  // Handle subject name change
  const handleSubjectNameChange = (index: number, name: string) => {
    setSubjects((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], subjectName: name };
      return next;
    });
  };

  // Add new subject row
  const handleAddSubjectRow = () => {
    setSubjects((prev) => [
      ...prev,
      {
        subjectName: `Elective ${prev.length + 1}`,
        maxMarks: 75,
        passMarks: 25,
        obtainedMarks: 50,
        grade: "B",
        isPassed: true,
      },
    ]);
  };

  // Remove subject row
  const handleRemoveSubjectRow = (index: number) => {
    if (subjects.length <= 1) {
      toast.error("At least one subject is required");
      return;
    }
    setSubjects((prev) => prev.filter((_, idx) => idx !== index));
  };

  const resetForm = () => {
    setStudentName("");
    setRollNo("");
    setFatherName("");
    setAttendance(95);
    setTeacherRemarks("");
    setSubjects(getDefaultSubjects(className));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim()) {
      toast.error("Please enter the student's name");
      return;
    }

    if (!rollNo.trim()) {
      toast.error("Please enter a roll number");
      return;
    }

    if (!fatherName.trim()) {
      toast.error("Please enter the father's name");
      return;
    }

    const newResult: StudentTermResult = {
      id: `res-${Date.now().toString().slice(-4)}`,
      rollNo: rollNo.trim(),
      studentName: studentName.trim(),
      fatherName: fatherName.trim(),
      className,
      termId: `term-${Date.now()}`,
      termName,
      campus,
      subjects,
      totalMaxMarks: summary.totalMaxMarks,
      totalObtainedMarks: summary.totalObtainedMarks,
      percentage: summary.percentage,
      overallGrade: summary.overallGrade,
      position: 1, // Will be sorted by ResultsPage
      status: summary.status,
      attendancePercentage: typeof attendance === "number" ? attendance : 95,
      teacherRemarks:
        teacherRemarks.trim() ||
        (summary.status === "Passed"
          ? "Good academic performance with strong commitment."
          : summary.status === "Compartment"
          ? "Eligible for supplementary examination in compartment subjects."
          : "Needs substantial improvement and focused guidance."),
    };

    onAddResult(newResult);
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] max-h-[92vh] overflow-y-auto p-0 gap-0 rounded-2xl border border-border/80 shadow-2xl flex flex-col">
        {/* Modal Header */}
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-border/70 bg-gradient-to-br from-brand-50/60 via-background to-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand text-white shadow-md ring-4 ring-brand/10">
              <Award className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                Add Student Examination Result
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Record subject-wise marks for a student. Percentage, grade, and pass status are calculated automatically in real time.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Section 1: Academic & Student Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <GraduationCap className="size-3.5 text-brand" />
              <span>Student &amp; Examination Scope</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Class Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="res-class" className="text-xs font-medium">
                  Class / Section <span className="text-destructive">*</span>
                </Label>
                <Select value={className} onValueChange={(val) => val && handleClassChange(val)}>
                  <SelectTrigger id="res-class" className="h-9 text-xs">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {RESULT_CLASSES.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Examination Term */}
              <div className="space-y-1.5">
                <Label htmlFor="res-term" className="text-xs font-medium">
                  Examination Term <span className="text-destructive">*</span>
                </Label>
                <Select value={termName} onValueChange={(val) => val && setTermName(val)}>
                  <SelectTrigger id="res-term" className="h-9 text-xs">
                    <SelectValue placeholder="Select Term" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {RESULT_TERMS.map((t) => (
                      <SelectItem key={t} value={t} className="text-xs">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Campus / Branch */}
              <div className="space-y-1.5">
                <Label htmlFor="res-campus" className="text-xs font-medium">
                  Campus / Branch
                </Label>
                <Select value={campus} onValueChange={(val) => val && setCampus(val)}>
                  <SelectTrigger id="res-campus" className="h-9 text-xs">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.campusName} className="text-xs">
                        {b.campusName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
              {/* Roll No */}
              <div className="space-y-1.5 sm:col-span-1">
                <Label htmlFor="res-rollno" className="text-xs font-medium">
                  Roll No <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="res-rollno"
                  placeholder="e.g. 1015"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="h-9 text-xs font-mono font-bold"
                  required
                />
              </div>

              {/* Student Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="res-name" className="text-xs font-medium">
                  Student Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="res-name"
                  placeholder="e.g. Daniyal Ahmed"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="h-9 text-xs font-semibold"
                  required
                />
              </div>

              {/* Father Name */}
              <div className="space-y-1.5 sm:col-span-1">
                <Label htmlFor="res-father" className="text-xs font-medium">
                  Father Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="res-father"
                  placeholder="e.g. Ahmed Raza"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Subject Marks Table */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="size-3.5 text-brand" />
                <span>Subject-wise Marks Entry</span>
              </h4>

              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleAddSubjectRow}
                className="h-7 text-xs gap-1 border-dashed text-brand hover:text-brand hover:bg-brand-50 cursor-pointer"
              >
                <Plus className="size-3" />
                <span>Add Subject</span>
              </Button>
            </div>

            <div className="rounded-xl border border-border/80 overflow-hidden shadow-2xs">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/70 text-foreground font-semibold">
                    <th className="py-2.5 pl-3 pr-2 text-left w-[36%]">Subject</th>
                    <th className="py-2.5 px-2 text-center w-[16%]">Max Marks</th>
                    <th className="py-2.5 px-2 text-center w-[15%]">Pass</th>
                    <th className="py-2.5 px-2 text-center w-[20%] text-brand font-bold">Obtained</th>
                    <th className="py-2.5 px-2 text-center w-[13%]">Grade</th>
                    <th className="py-2.5 pr-3 pl-1 text-center w-[10px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {subjects.map((sub, idx) => {
                    const isExceeding = sub.obtainedMarks > sub.maxMarks;
                    return (
                      <tr
                        key={idx}
                        className={cn(
                          "transition-colors hover:bg-muted/30",
                          !sub.isPassed && "bg-rose-50/30 dark:bg-rose-950/20"
                        )}
                      >
                        <td className="py-2 pl-3 pr-2">
                          <Input
                            value={sub.subjectName}
                            onChange={(e) => handleSubjectNameChange(idx, e.target.value)}
                            className="h-8 text-xs font-medium bg-background"
                            placeholder="Subject Name"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <Input
                            type="number"
                            min="10"
                            max="200"
                            value={sub.maxMarks}
                            onChange={(e) => handleSubjectMaxChange(idx, e.target.value)}
                            className="h-8 text-xs text-center font-mono bg-background w-16 mx-auto"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span className="font-mono text-xs text-muted-foreground">
                            {sub.passMarks}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex flex-col items-center">
                            <Input
                              type="number"
                              min="0"
                              max={sub.maxMarks}
                              value={sub.obtainedMarks}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => handleSubjectMarkChange(idx, e.target.value)}
                              className={cn(
                                "h-8 text-xs text-center font-mono font-bold w-20 mx-auto",
                                isExceeding
                                  ? "border-destructive text-destructive bg-destructive/10"
                                  : sub.isPassed
                                  ? "border-emerald-500/40 text-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20"
                                  : "border-rose-500/40 text-rose-700 bg-rose-50/50 dark:bg-rose-950/20"
                              )}
                            />
                            {isExceeding && (
                              <span className="text-[10px] text-destructive leading-tight mt-0.5">
                                Max {sub.maxMarks}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span
                            className={cn(
                              "inline-block px-2 py-0.5 rounded text-[11px] font-bold font-mono",
                              sub.grade === "A+" || sub.grade === "A"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                : sub.grade === "B"
                                ? "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                                : sub.grade === "C"
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                : "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                            )}
                          >
                            {sub.grade}
                          </span>
                        </td>
                        <td className="py-2 pr-3 pl-1 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            disabled={subjects.length <= 1}
                            onClick={() => handleRemoveSubjectRow(idx)}
                            className="text-muted-foreground hover:text-destructive cursor-pointer disabled:opacity-30"
                            title="Remove Subject"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Live Auto-Calculated Result Summary Card */}
          <div className="rounded-2xl border-2 border-brand/20 bg-gradient-to-br from-brand-50/50 via-background to-muted/30 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/70">
              <div className="flex items-center gap-2">
                <Calculator className="size-4 text-brand" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Live Computed Results
                </span>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                Automatic real-time calculation
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {/* Total Marks */}
              <div className="p-2.5 rounded-xl bg-background border border-border/70 shadow-2xs">
                <span className="text-[11px] text-muted-foreground block font-medium">Total Marks</span>
                <span className="font-mono text-sm sm:text-base font-bold text-foreground">
                  {summary.totalObtainedMarks}{" "}
                  <span className="text-xs font-normal text-muted-foreground">/ {summary.totalMaxMarks}</span>
                </span>
              </div>

              {/* Percentage */}
              <div className="p-2.5 rounded-xl bg-background border border-border/70 shadow-2xs">
                <span className="text-[11px] text-muted-foreground block font-medium">Percentage</span>
                <span className="font-mono text-sm sm:text-base font-bold text-brand">
                  {summary.percentage}%
                </span>
              </div>

              {/* Overall Grade */}
              <div className="p-2.5 rounded-xl bg-background border border-border/70 shadow-2xs">
                <span className="text-[11px] text-muted-foreground block font-medium">Overall Grade</span>
                <span
                  className={cn(
                    "inline-block font-mono text-sm sm:text-base font-bold px-2 py-0.5 rounded",
                    summary.overallGrade === "A+" || summary.overallGrade === "A"
                      ? "text-emerald-700 dark:text-emerald-400"
                      : summary.overallGrade === "B"
                      ? "text-blue-700 dark:text-blue-400"
                      : summary.overallGrade === "C"
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-rose-700 dark:text-rose-400"
                  )}
                >
                  Grade {summary.overallGrade}
                </span>
              </div>

              {/* Status */}
              <div className="p-2.5 rounded-xl bg-background border border-border/70 shadow-2xs">
                <span className="text-[11px] text-muted-foreground block font-medium">Final Status</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 font-bold text-xs sm:text-sm px-2 py-0.5 rounded-full mt-0.5",
                    summary.status === "Passed"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : summary.status === "Compartment"
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      : "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                  )}
                >
                  {summary.status === "Passed" ? (
                    <CheckCircle2 className="size-3.5" />
                  ) : (
                    <AlertCircle className="size-3.5" />
                  )}
                  {summary.status}
                </span>
              </div>
            </div>

            {/* Supplementary note */}
            {summary.status === "Compartment" && (
              <p className="text-[11px] text-amber-700 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/60 text-center font-medium">
                Student has failed in {summary.failedSubjects} subject(s) and is eligible for supplementary compartment examination.
              </p>
            )}
            {summary.status === "Fail" && (
              <p className="text-[11px] text-rose-700 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200/60 text-center font-medium">
                Student failed in {summary.failedSubjects} subject(s) or scored below the minimum 33% aggregate.
              </p>
            )}
          </div>

          {/* Section 4: Attendance & Teacher Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="res-att" className="text-xs font-medium">
                Attendance %
              </Label>
              <Input
                id="res-att"
                type="number"
                min="0"
                max="100"
                placeholder="95"
                value={attendance}
                onFocus={(e) => e.target.select()}
                onChange={(e) =>
                  setAttendance(
                    e.target.value === "" ? "" : Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0))
                  )
                }
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-3">
              <Label htmlFor="res-remarks" className="text-xs font-medium">
                Teacher / Controller Remarks
              </Label>
              <Input
                id="res-remarks"
                placeholder="e.g. Excellent academic performance and analytical skills."
                value={teacherRemarks}
                onChange={(e) => setTeacherRemarks(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-border/70">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs bg-brand text-brand-foreground hover:bg-brand/90 gap-1.5 shadow-sm cursor-pointer"
            >
              <Award className="size-4" />
              <span>Save &amp; Publish Result</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
