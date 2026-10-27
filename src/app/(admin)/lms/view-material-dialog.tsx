"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LmsMaterial } from "@/types";
import { formatCompactClass } from "@/lib/mock/lms";
import {
  FileText,
  Download,
  Calendar,
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  FileCheck,
  Copy,
  Check,
  Presentation,
  FileSpreadsheet,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ViewMaterialDialogProps {
  material: LmsMaterial | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload?: (material: LmsMaterial) => void;
}

function getFileTypeStyle(fileType: string) {
  const upper = (fileType || "PDF").toUpperCase();
  switch (upper) {
    case "PDF":
      return {
        icon: FileText,
        container: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      };
    case "DOCX":
    case "DOC":
      return {
        icon: FileText,
        container: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      };
    case "SLIDES":
    case "PPT":
    case "PPTX":
      return {
        icon: Presentation,
        container: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      };
    case "SHEET":
    case "XLS":
    case "XLSX":
      return {
        icon: FileSpreadsheet,
        container: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      };
    default:
      return {
        icon: FileText,
        container: "bg-brand-soft text-brand border-brand/20",
        badge: "bg-brand-soft text-brand border-brand/20",
      };
  }
}

function getMaterialHighlights(subject: string, title: string): string[] {
  const s = (subject || "").toLowerCase();
  const t = (title || "").toLowerCase();

  if (s.includes("math") || t.includes("math") || t.includes("equations") || t.includes("calculus")) {
    return [
      "Core definitions, formulas, and step-by-step proofs",
      "Comprehensive solved textbook exercises & examples",
      "5-year past board exam practice questions",
      "Summary formula cheatsheet for quick exam revision",
    ];
  }
  if (s.includes("phy") || t.includes("physics")) {
    return [
      "Key laws, principles, SI units, and vector diagrams",
      "Step-by-step derivations with labeled diagrams",
      "Conceptual numerical problems with model solutions",
      "Laboratory practical guidelines and observations",
    ];
  }
  if (s.includes("chem") || t.includes("chemical") || t.includes("bonding")) {
    return [
      "Balanced chemical equations and reaction mechanisms",
      "Periodic trends, atomic structures, and bonding models",
      "Organic nomenclature and functional group comparisons",
      "Important board questions with detailed marking points",
    ];
  }
  if (s.includes("bio") || t.includes("biology") || t.includes("cell") || t.includes("genetics")) {
    return [
      "High-yield labeled biological & physiological diagrams",
      "Cell division, meiosis, and genetic replication charts",
      "Key scientific terminology and differentiation tables",
      "Past paper board questions with standard model answers",
    ];
  }
  if (s.includes("computer") || t.includes("python") || t.includes("sql") || t.includes("c++")) {
    return [
      "Syntax rules, code snippets, and variable declarations",
      "Logic gate diagrams, relational schemas, and SQL queries",
      "Algorithmic walkthroughs with dry-run trace tables",
      "Hands-on lab practical assignments and exercise tasks",
    ];
  }
  if (s.includes("urdu") || s.includes("english") || t.includes("grammar") || t.includes("mazmoon")) {
    return [
      "Grammar rules, sentence structures, and applied exercises",
      "Vocabulary lists with contextual meanings and idioms",
      "Model essays, formal letters, and comprehension passages",
      "Exam preparation guidelines according to board standards",
    ];
  }
  if (s.includes("islam") || s.includes("quran") || s.includes("pakistan") || s.includes("civics")) {
    return [
      "Authentic text references, translations, and commentary",
      "Historical timeline of events and constitutional developments",
      "Key headings, analytical points, and essay structures",
      "Past board questions with verified high-scoring outlines",
    ];
  }
  if (s.includes("account") || s.includes("econ") || s.includes("commerce")) {
    return [
      "Accounting ledger formats, journal entries, and trial balances",
      "Supply, demand, and elasticity graph interpretations",
      "Solved practical case studies and financial statements",
      "Standard board questions with complete calculation steps",
    ];
  }

  return [
    "Comprehensive lecture notes aligned with national curriculum",
    "Key concept summaries and high-yield topic overviews",
    "Solved review questions and practice problems",
    "Important tips and guidelines for term and board exams",
  ];
}

export function ViewMaterialDialog({
  material,
  open,
  onOpenChange,
  onDownload,
}: ViewMaterialDialogProps) {
  const [copied, setCopied] = React.useState(false);

  if (!material) return null;

  const compactClass = formatCompactClass(material.className);
  const fileStyle = getFileTypeStyle(material.fileType);
  const highlights = getMaterialHighlights(material.subject, material.title);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(
        `${window.location.origin}/lms/materials/${material.id}`
      );
    }
    setCopied(true);
    toast.success("Resource Link Copied", {
      description: "Direct download link copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(material);
    } else {
      toast.success("Downloading Resource", {
        description: `"${material.title}" (${material.fileType}) download started.`,
      });
    }
  };

  const uploadDateFormatted = React.useMemo(() => {
    try {
      const d = new Date(material.uploadDate);
      if (isNaN(d.getTime())) return material.uploadDate;
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return material.uploadDate;
    }
  }, [material.uploadDate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] md:max-w-[800px] w-full p-0 overflow-hidden rounded-2xl border border-border shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 bg-muted/30 border-b border-border/60 pr-12">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand shrink-0">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <DialogTitle className="text-base font-bold text-foreground truncate">
                    {material.title}
                  </DialogTitle>
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border",
                      fileStyle.badge
                    )}
                  >
                    {material.fileType}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <GraduationCap className="size-3.5 text-muted-foreground" />
                    {compactClass}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="size-3.5 text-muted-foreground" />
                    {material.subject}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5 text-muted-foreground" />
                    {material.uploadedBy}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="px-6 py-5 pb-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Hero Resource Banner Card */}
          <div className="p-4 rounded-xl border border-border/80 bg-gradient-to-r from-muted/40 via-muted/20 to-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={cn(
                  "size-12 rounded-xl flex items-center justify-center shrink-0 border shadow-xs",
                  fileStyle.container
                )}
              >
                <fileStyle.icon className="size-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-foreground truncate">
                  {material.title}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {material.fileSize || "Cloud Link"}
                  </span>
                  <span>•</span>
                  <span>{material.downloadCount} student downloads</span>
                  <span>•</span>
                  <span>Uploaded {uploadDateFormatted}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="h-8.5 px-3 text-xs gap-1.5 cursor-pointer flex-1 sm:flex-none border-border/80"
                title="Copy shareable link"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 text-muted-foreground" />
                    <span>Copy Link</span>
                  </>
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleDownload}
                className="h-8.5 px-3.5 text-xs font-semibold gap-1.5 shadow-xs cursor-pointer flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white"
              >
                <Download className="size-3.5" />
                <span>Download</span>
              </Button>
            </div>
          </div>

          {/* Two-Column Structured Section: Content Overview + File Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Left: Study Content Highlights */}
            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-brand-soft text-brand">
                  <BookOpen className="size-3.5" />
                </div>
                <h5 className="text-xs font-bold text-foreground">
                  Included Study Content
                </h5>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Instructional resource prepared by {material.uploadedBy} for {material.subject} ({compactClass}), curated for classroom learning and board exam revision.
              </p>

              <div className="space-y-2 pt-1 border-t border-border/50">
                {highlights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-foreground/90 leading-tight">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0.5">
                  Curriculum Aligned
                </Badge>
                <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0.5">
                  Verified Notes
                </Badge>
                <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0.5">
                  Print Ready
                </Badge>
              </div>
            </div>

            {/* Right: Technical & Academic Specifications */}
            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-brand-soft text-brand">
                  <FileCheck className="size-3.5" />
                </div>
                <h5 className="text-xs font-bold text-foreground">
                  Document Specifications
                </h5>
              </div>

              <div className="divide-y divide-border/50 text-xs">
                <div className="py-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Subject</span>
                  <span className="font-semibold text-foreground text-right">{material.subject}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Class & Stream</span>
                  <span className="font-semibold text-foreground text-right">{compactClass}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Uploaded By</span>
                  <span className="font-semibold text-foreground text-right">{material.uploadedBy}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Published Date</span>
                  <span className="font-semibold text-foreground text-right">{uploadDateFormatted}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Format & Size</span>
                  <span className="font-semibold text-foreground text-right">
                    {material.fileType} • {material.fileSize || "Link"}
                  </span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Student Circulation</span>
                  <span className="font-bold text-brand text-right">{material.downloadCount} Downloads</span>
                </div>
              </div>
            </div>
          </div>

          {/* Department Verification Strip */}
          <div className="px-3.5 py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-2 text-xs">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-medium text-foreground">
              Verified Teaching Document • Approved for Term Study & Exam Preparation
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
