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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CAMPUSES } from "@/lib/mock/institution";
import { formatCampusDisplay } from "@/lib/format";
import type { StaffMember } from "@/types";
import {
  BookOpen,
  Briefcase,
  GraduationCap,
  Plus,
  School,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface NewStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStaff: (newStaff: StaffMember) => void;
  existingCount: number;
}

const DEPARTMENTS = [
  "Sciences",
  "Languages",
  "Humanities",
  "Technology",
  "Primary Education",
  "Islamic Studies & Arabic",
  "Commerce & Economics",
  "Physical Education & Sports",
  "Administration",
  "Finance",
  "Operations",
] as const;

/** Comprehensive Pakistani & Cambridge curriculum subject directory */
const PAKISTANI_CURRICULUM_SUBJECTS: {
  category: string;
  subjects: string[];
}[] = [
  {
    category: "National Core & Islamic Studies",
    subjects: [
      "Urdu (اردو)",
      "English Language",
      "Islamiyat (اسلامیات)",
      "Tarjamat-ul-Quran (ترجمۃ القرآن)",
      "Nazra Quran & Tajweed (ناظرہ قرآن)",
      "Pakistan Studies (مطالعہ پاکستان)",
      "Ethics / Akhlaqiat (اخلاقیات)",
      "Arabic (عربی)",
    ],
  },
  {
    category: "Sciences (Matric / FSc / Cambridge)",
    subjects: [
      "Mathematics",
      "General Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "General Science",
      "Additional Mathematics",
      "Statistics",
    ],
  },
  {
    category: "Computer & Information Tech",
    subjects: [
      "Computer Science",
      "Information Technology (IT) / ICT",
      "Coding & Robotics",
      "Graphics & Multimedia",
    ],
  },
  {
    category: "Commerce & Business Studies (I.Com / O-Levels)",
    subjects: [
      "Principles of Accounting",
      "Business Studies / Commerce",
      "Economics",
      "Commercial Geography",
      "Banking & Finance",
      "Business Mathematics",
    ],
  },
  {
    category: "Humanities & Social Sciences",
    subjects: [
      "Social Studies / Muashrati Uloom (معاشرتی علوم)",
      "History (تاریخ)",
      "Geography (جغرافیہ)",
      "Civics (شہریت)",
      "Education (علم التعلیم)",
      "Sociology",
      "Psychology",
      "Persian (فارسی)",
      "Home Economics",
    ],
  },
  {
    category: "Primary & Early Childhood",
    subjects: [
      "English Phonics & Reading",
      "Urdu Reading & Qaida",
      "Basic Math & Numbers",
      "General Knowledge (GK)",
      "Art, Craft & Drawing",
      "Calligraphy / Khushkhati (خوشخطی)",
      "Rhymes & Storytelling",
    ],
  },
  {
    category: "Co-Curricular & Special Skills",
    subjects: [
      "Physical Education (PT / Sports)",
      "Qirat & Naat",
      "Debate & Spoken English",
      "Library Studies",
      "Life Skills & Character Building",
    ],
  },
];

/** Comprehensive Pakistani & Cambridge class catalog */
const PAKISTANI_SCHOOL_CLASSES: {
  category: string;
  classes: string[];
}[] = [
  {
    category: "Early Childhood (Pre-School)",
    classes: ["Playgroup", "Nursery", "Kindergarten (KG)", "Prep"],
  },
  {
    category: "Primary Wing (Grades 1–5)",
    classes: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Primary Combined (Grades 1–5)"],
  },
  {
    category: "Middle School (Grades 6–8)",
    classes: ["Grade 6", "Grade 7", "Grade 8", "Middle Combined (Grades 6–8)"],
  },
  {
    category: "Secondary / Matric (BISE)",
    classes: [
      "Grade 9 (Science)",
      "Grade 9 (Arts / General)",
      "Grade 10 (Science)",
      "Grade 10 (Arts / General)",
      "Matric Combined (Grades 9 & 10)",
    ],
  },
  {
    category: "Intermediate / College (HSSC)",
    classes: [
      "Grade 11 (FSc Pre-Medical)",
      "Grade 11 (FSc Pre-Engineering)",
      "Grade 11 (ICS)",
      "Grade 11 (I.Com)",
      "Grade 12 (FSc Pre-Medical)",
      "Grade 12 (FSc Pre-Engineering)",
      "Grade 12 (ICS)",
      "Grade 12 (I.Com)",
    ],
  },
  {
    category: "Cambridge International Stream",
    classes: [
      "O-Level 1 (Grade 9)",
      "O-Level 2 (Grade 10)",
      "O-Level 3 (Grade 11)",
      "AS Level (Grade 12)",
      "A2 Level (Grade 13)",
    ],
  },
  {
    category: "Campus Wings & All Grades",
    classes: [
      "Senior High Wing",
      "Middle Wing",
      "Junior Primary Wing",
      "All Classes (Whole Campus)",
    ],
  },
];

const POPULAR_SUBJECT_CHIPS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English Language",
  "Urdu (اردو)",
  "Islamiyat (اسلامیات)",
  "Tarjamat-ul-Quran (ترجمۃ القرآن)",
  "Pakistan Studies (مطالعہ پاکستان)",
  "General Science",
  "Social Studies (معاشرتی علوم)",
  "Accounting",
];

const POPULAR_CLASS_CHIPS = [
  "Grade 9 (Science)",
  "Grade 10 (Science)",
  "Grade 8",
  "Grade 7",
  "Grade 6",
  "O-Levels",
  "A-Levels",
  "FSc / ICS",
  "Primary (1–5)",
  "Early Years (KG)",
];

export function NewStaffDialog({
  open,
  onOpenChange,
  onAddStaff,
  existingCount,
}: NewStaffDialogProps) {
  // Personal Info
  const [name, setName] = React.useState("");
  const [gender, setGender] = React.useState<"Male" | "Female">("Male");
  const [cnic, setCnic] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");

  // Employment Info
  const [designation, setDesignation] = React.useState("");
  const [department, setDepartment] = React.useState<string>(DEPARTMENTS[0]);
  const [type, setType] = React.useState<"Teaching" | "Non-Teaching">("Teaching");
  const [campus, setCampus] = React.useState<string>(CAMPUSES[0].campusName);
  const [qualification, setQualification] = React.useState("");
  const [experience, setExperience] = React.useState("");
  const [joiningDate, setJoiningDate] = React.useState("");

  // Teaching Assignments (Tag Arrays + Custom Inputs)
  const [selectedClasses, setSelectedClasses] = React.useState<string[]>([]);
  const [customClassInput, setCustomClassInput] = React.useState("");

  const [selectedSubjects, setSelectedSubjects] = React.useState<string[]>([]);
  const [customSubjectInput, setCustomSubjectInput] = React.useState("");

  // Class Incharge (Homeroom Teacher)
  const [isClassIncharge, setIsClassIncharge] = React.useState(false);
  const [classInchargeSection, setClassInchargeSection] = React.useState("");

  // Non-Teaching Scope
  const [nonTeachingScope, setNonTeachingScope] = React.useState("");

  const resetForm = () => {
    setName("");
    setGender("Male");
    setCnic("");
    setPhone("");
    setEmail("");
    setDesignation("");
    setDepartment(DEPARTMENTS[0]);
    setType("Teaching");
    setCampus(CAMPUSES[0].campusName);
    setQualification("");
    setExperience("");
    setJoiningDate("");
    setSelectedClasses([]);
    setCustomClassInput("");
    setSelectedSubjects([]);
    setCustomSubjectInput("");
    setIsClassIncharge(false);
    setClassInchargeSection("");
    setNonTeachingScope("");
  };

  // Helper functions for class tags
  const handleAddClass = (cls: string) => {
    const trimmed = cls.trim();
    if (!trimmed) return;
    const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
    setSelectedClasses((prev) => {
      const set = new Set([...prev, ...parts]);
      return Array.from(set);
    });
    setCustomClassInput("");
  };

  const handleRemoveClass = (cls: string) => {
    setSelectedClasses((prev) => prev.filter((c) => c !== cls));
  };

  // Helper functions for subject tags
  const handleAddSubject = (sub: string) => {
    const trimmed = sub.trim();
    if (!trimmed) return;
    const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
    setSelectedSubjects((prev) => {
      const set = new Set([...prev, ...parts]);
      return Array.from(set);
    });
    setCustomSubjectInput("");
  };

  const handleRemoveSubject = (sub: string) => {
    setSelectedSubjects((prev) => prev.filter((s) => s !== sub));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter the staff member's full name.");
      return;
    }
    if (!designation.trim()) {
      toast.error("Please enter the official designation.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please provide a contact phone number.");
      return;
    }
    if (!qualification.trim()) {
      toast.error("Please enter academic / professional qualification.");
      return;
    }

    // Auto-include any pending text from custom inputs if user forgot to click Add
    let finalClasses = [...selectedClasses];
    if (customClassInput.trim()) {
      const pendingParts = customClassInput.split(",").map((p) => p.trim()).filter(Boolean);
      finalClasses = Array.from(new Set([...finalClasses, ...pendingParts]));
    }

    let finalSubjects = [...selectedSubjects];
    if (customSubjectInput.trim()) {
      const pendingParts = customSubjectInput.split(",").map((p) => p.trim()).filter(Boolean);
      finalSubjects = Array.from(new Set([...finalSubjects, ...pendingParts]));
    }

    if (type === "Teaching") {
      if (finalClasses.length === 0) {
        toast.error("Please assign at least one class / grade for teaching staff.");
        return;
      }
      if (finalSubjects.length === 0) {
        toast.error("Please assign at least one subject for teaching staff.");
        return;
      }
    }

    const empCode = `STF-${String(1001 + existingCount).padStart(4, "0")}`;

    const newStaff: StaffMember = {
      id: `stf-${Date.now()}`,
      empCode,
      name: name.trim(),
      gender,
      cnic: cnic.trim() || undefined,
      designation: designation.trim(),
      department,
      campus,
      type,
      joiningDate: joiningDate || new Date().toISOString().slice(0, 10),
      phone: phone.trim(),
      email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, ".")}@edusphere.edu.pk`,
      qualification: qualification.trim(),
      experience: experience.trim() || "1 Year",
      assignedClasses: type === "Teaching" ? finalClasses.join(", ") : undefined,
      assignedSubjects:
        type === "Teaching"
          ? finalSubjects.join(", ")
          : nonTeachingScope.trim() || undefined,
      classTeacherOf:
        type === "Teaching" && isClassIncharge && classInchargeSection.trim()
          ? classInchargeSection.trim()
          : undefined,
      status: "Active",
    };

    onAddStaff(newStaff);
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
      <DialogContent className="max-w-md p-0 overflow-hidden sm:max-w-2xl border border-border shadow-2xl rounded-2xl">
        {/* Header Banner */}
        <DialogHeader className="px-6 pt-5 pb-4 bg-gradient-to-r from-brand-50/70 via-background to-background border-b border-border/70">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-brand text-cream shadow-sm ring-2 ring-brand/20">
              <UserPlus className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-heading font-bold text-foreground">
                Register New Staff Member
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Onboard teaching faculty or administrative staff with comprehensive school assignments.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[74vh] overflow-y-auto">
          {/* Section 1: Basic Personal & Contact Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <UserCheck className="size-3.5 text-brand" />
              <span>Personal & Contact Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hafiz Muhammad Salman"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Gender</label>
                <Select
                  value={gender}
                  onValueChange={(val) => {
                    if (val) setGender(val as "Male" | "Female");
                  }}
                >
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male" className="text-xs">
                      Male
                    </SelectItem>
                    <SelectItem value="Female" className="text-xs">
                      Female
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Phone Number <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0300-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  CNIC Number <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="35202-1234567-1"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Official Email</label>
                <input
                  type="email"
                  placeholder="salman@edusphere.edu.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Employment & Institutional Placement */}
          <div className="space-y-3 pt-1 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <School className="size-3.5 text-brand" />
              <span>Role & Institutional Placement</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Designation <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Subject Specialist — Physics"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Staff Type</label>
                <Select
                  value={type}
                  onValueChange={(val) => {
                    if (val) setType(val as "Teaching" | "Non-Teaching");
                  }}
                >
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue placeholder="Staff Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Teaching" className="text-xs font-semibold text-brand">
                      Teaching Faculty
                    </SelectItem>
                    <SelectItem value="Non-Teaching" className="text-xs font-medium text-muted-foreground">
                      Non-Teaching Staff
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Department</label>
                <Select
                  value={department}
                  onValueChange={(val) => {
                    if (val) setDepartment(val);
                  }}
                >
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept} className="text-xs">
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Campus Branch</label>
                <Select
                  value={campus}
                  onValueChange={(val) => {
                    if (val) setCampus(val);
                  }}
                >
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue placeholder="Select Campus" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPUSES.map((c) => (
                      <SelectItem key={c.id} value={c.campusName} className="text-xs">
                        {formatCampusDisplay(c.campusName).primary}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Qualification <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M.Phil Physics / B.Ed"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Experience</label>
                <input
                  type="text"
                  placeholder="e.g. 7 Years"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3: TEACHING ACADEMIC ASSIGNMENTS OR NON-TEACHING SCOPE */}
          {type === "Teaching" ? (
            <div className="p-4 rounded-xl border border-brand/25 bg-gradient-to-b from-brand-50/30 to-background space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-brand/15 pb-2">
                <div className="flex items-center gap-2">
                  <div className="grid size-6 place-items-center rounded-md bg-brand text-cream">
                    <GraduationCap className="size-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-foreground">
                      Teaching Academic Assignment
                    </span>
                    <p className="text-[10.5px] text-muted-foreground">
                      Tailored for Pakistani Boards (BISE/Federal) & Cambridge (O/A Levels)
                    </p>
                  </div>
                </div>
                <span className="text-[10.5px] font-medium text-brand bg-brand-50 border border-brand/20 px-2 py-0.5 rounded-full">
                  Pakistani & Cambridge Curriculum
                </span>
              </div>

              {/* 1. SEPARATE ASSIGNED CLASS(ES) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <School className="size-3.5 text-brand" />
                    <span>
                      Assigned Class(es) / Grade Level <span className="text-danger">*</span>
                    </span>
                  </label>
                  {selectedClasses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedClasses([])}
                      className="text-[10.5px] text-muted-foreground hover:text-danger cursor-pointer"
                    >
                      Clear all ({selectedClasses.length})
                    </button>
                  )}
                </div>

                {/* Active Selected Class Badges */}
                <div className="flex flex-wrap items-center gap-1.5 min-h-[34px] p-2 rounded-lg border border-border/80 bg-background">
                  {selectedClasses.length === 0 ? (
                    <span className="text-xs text-muted-foreground/60 italic">
                      No classes assigned yet. Choose from catalog or type any class/section below.
                    </span>
                  ) : (
                    selectedClasses.map((cls) => (
                      <span
                        key={cls}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-muted text-foreground border border-border/80 shadow-2xs"
                      >
                        <span>{cls}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveClass(cls)}
                          className="hover:bg-muted-foreground/20 rounded-full p-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title={`Remove ${cls}`}
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Dropdown Catalog + Custom Class Entry */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Select
                    onValueChange={(val) => {
                      if (val) handleAddClass(val as string);
                    }}
                  >
                    <SelectTrigger className="w-full h-8.5 text-xs bg-background">
                      <SelectValue placeholder="Browse School Classes / Grades..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {PAKISTANI_SCHOOL_CLASSES.map((grp) => (
                        <SelectGroup key={grp.category}>
                          <SelectLabel className="font-semibold text-brand text-[11px] bg-muted/40 py-1">
                            {grp.category}
                          </SelectLabel>
                          {grp.classes.map((c) => (
                            <SelectItem key={c} value={c} className="text-xs">
                              {c}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Or type custom class/section (e.g. 9-A Science)..."
                      value={customClassInput}
                      onChange={(e) => setCustomClassInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddClass(customClassInput);
                        }
                      }}
                      className="w-full h-8.5 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => handleAddClass(customClassInput)}
                      className="h-8.5 px-2.5 shrink-0 text-xs font-medium cursor-pointer"
                    >
                      <Plus className="size-3.5 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Quick Class Chips */}
                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                  <span className="text-[10px] text-muted-foreground font-medium mr-1">
                    Quick Add:
                  </span>
                  {POPULAR_CLASS_CHIPS.map((chip) => {
                    const isSelected = selectedClasses.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          if (isSelected) handleRemoveClass(chip);
                          else handleAddClass(chip);
                        }}
                        className={`text-[10.5px] px-2 py-0.5 rounded-md border transition-all cursor-pointer shadow-2xs ${
                          isSelected
                            ? "bg-brand text-cream border-brand font-semibold"
                            : "bg-background hover:bg-brand-50 border-border/80 text-muted-foreground hover:text-brand"
                        }`}
                      >
                        {isSelected ? `✓ ${chip}` : `+ ${chip}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. SEPARATE ASSIGNED SUBJECT(S) - COMPLETE FREEDOM FOR ANY SUBJECT */}
              <div className="space-y-2 pt-2 border-t border-brand/15">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <BookOpen className="size-3.5 text-brand" />
                    <span>
                      Assigned Subject(s) <span className="text-danger">*</span>
                    </span>
                  </label>
                  {selectedSubjects.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedSubjects([])}
                      className="text-[10.5px] text-muted-foreground hover:text-danger cursor-pointer"
                    >
                      Clear all ({selectedSubjects.length})
                    </button>
                  )}
                </div>

                {/* Active Selected Subject Badges */}
                <div className="flex flex-wrap items-center gap-1.5 min-h-[34px] p-2 rounded-lg border border-border/80 bg-background">
                  {selectedSubjects.length === 0 ? (
                    <span className="text-xs text-muted-foreground/60 italic">
                      No subjects assigned yet. Select from Pakistani curriculum catalog or type any subject below.
                    </span>
                  ) : (
                    selectedSubjects.map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-brand-50 text-brand border border-brand/20 shadow-2xs"
                      >
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(sub)}
                          className="hover:bg-brand/20 rounded-full p-0.5 text-brand transition-colors cursor-pointer"
                          title={`Remove ${sub}`}
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Dropdown Catalog + Custom Subject Entry */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Select
                    onValueChange={(val) => {
                      if (val) handleAddSubject(val as string);
                    }}
                  >
                    <SelectTrigger className="w-full h-8.5 text-xs bg-background">
                      <SelectValue placeholder="Browse Curriculum Subject Catalog..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {PAKISTANI_CURRICULUM_SUBJECTS.map((grp) => (
                        <SelectGroup key={grp.category}>
                          <SelectLabel className="font-semibold text-brand text-[11px] bg-muted/40 py-1">
                            {grp.category}
                          </SelectLabel>
                          {grp.subjects.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Type ANY other subject (e.g. Sindhi, Robotics)..."
                      value={customSubjectInput}
                      onChange={(e) => setCustomSubjectInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSubject(customSubjectInput);
                        }
                      }}
                      className="w-full h-8.5 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => handleAddSubject(customSubjectInput)}
                      className="h-8.5 px-2.5 shrink-0 text-xs font-medium cursor-pointer"
                    >
                      <Plus className="size-3.5 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Quick Subject Chips */}
                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                  <span className="text-[10px] text-muted-foreground font-medium mr-1">
                    Quick Add:
                  </span>
                  {POPULAR_SUBJECT_CHIPS.map((chip) => {
                    const isSelected = selectedSubjects.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          if (isSelected) handleRemoveSubject(chip);
                          else handleAddSubject(chip);
                        }}
                        className={`text-[10.5px] px-2 py-0.5 rounded-md border transition-all cursor-pointer shadow-2xs ${
                          isSelected
                            ? "bg-brand text-cream border-brand font-semibold"
                            : "bg-background hover:bg-brand-50 border-border/80 text-muted-foreground hover:text-brand"
                        }`}
                      >
                        {isSelected ? `✓ ${chip}` : `+ ${chip}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. CLASS INCHARGE / HOMEROOM TEACHER (Pakistani School Feature) */}
              <div className="pt-2 border-t border-brand/15 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isClassIncharge}
                      onChange={(e) => setIsClassIncharge(e.target.checked)}
                      className="size-4 rounded border-border text-brand focus:ring-brand/30 accent-brand cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-foreground">
                      Appoint as Class Incharge / Class Teacher
                    </span>
                  </label>
                  <span className="text-[10px] text-muted-foreground">Homeroom Incharge</span>
                </div>

                {isClassIncharge && (
                  <div className="pl-6 animate-in fade-in-50 duration-150">
                    <input
                      type="text"
                      placeholder="e.g. Grade 9-A (Science) or Grade 10-B"
                      value={classInchargeSection}
                      onChange={(e) => setClassInchargeSection(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-brand/30 bg-background text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all"
                    />
                    <p className="text-[10.5px] text-muted-foreground mt-1">
                      This teacher will oversee daily morning assembly attendance, conduct, and parent meetings for this section.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* NON-TEACHING SCOPE */
            <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="grid size-6 place-items-center rounded-md bg-muted text-foreground">
                  <Briefcase className="size-3.5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-foreground">
                    Administrative & Operational Scope
                  </span>
                  <p className="text-[10.5px] text-muted-foreground">
                    Define operational responsibilities and station assignment
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Key Responsibilities & Scope <span className="text-danger">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Student fee vouchers, billing collection, ledger reconciliation, bank deposits, and monthly financial reporting..."
                  value={nonTeachingScope}
                  onChange={(e) => setNonTeachingScope(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                />
              </div>
            </div>
          )}

          {/* Dialog Footer Actions */}
          <DialogFooter className="pt-4 border-t border-border/60 flex items-center justify-end gap-2.5">
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
              className="bg-brand text-cream hover:bg-brand-600 text-xs px-5 cursor-pointer shadow-sm font-semibold"
            >
              Register Staff Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
