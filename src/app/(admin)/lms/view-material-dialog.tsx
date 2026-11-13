"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { LmsMaterial } from "@/types";
import { formatCompactClass, formatLmsDate } from "@/lib/mock/lms";
import {
  FileText,
  Download,
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  FileCheck,
  Copy,
  Check,
  Presentation,
  FileSpreadsheet,
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

  if (s.includes("math") || t.includes("math") || t.includes("equations")) {
    return [
      "Key definitions, formulas, and worked examples",
      "Solved textbook exercises for class practice",
      "Revision practice questions for class tests",
    ];
  }
  if (s.includes("phy") || t.includes("physics")) {
    return [
      "Important laws, definitions, and SI units",
      "Simple labeled diagrams and formulas",
      "Solved numericals and short questions",
    ];
  }
  if (s.includes("chem") || t.includes("chemical") || t.includes("acids")) {
    return [
      "Important chemical equations and properties",
      "Chapter summary tables and definitions",
      "Solved short and long chapter questions",
    ];
  }
  if (s.includes("bio") || t.includes("biology") || t.includes("cell")) {
    return [
      "Clear labeled biological diagrams",
      "Important terms and differences tables",
      "Chapter exercise questions and answers",
    ];
  }
  if (s.includes("computer") || t.includes("flowchart") || t.includes("html")) {
    return [
      "Step-by-step examples and diagrams",
      "Practice worksheet exercises for lab period",
      "Solved short questions from textbook chapters",
    ];
  }
  if (s.includes("urdu") || s.includes("english") || t.includes("grammar") || t.includes("mazmoon")) {
    return [
      "Grammar rules and practice sentences",
      "Important vocabulary, idioms, and meanings",
      "Model essays, letters, and comprehension notes",
    ];
  }
  if (s.includes("islam") || s.includes("quran") || s.includes("pakistan") || s.includes("civics")) {
    return [
      "Important translations and chapter points",
      "Key dates, events, and summary headings",
      "Solved textbook exercise questions",
    ];
  }

  return [
    "Clear chapter notes aligned with school syllabus",
    "Key topic summaries for easy revision",
    "Solved practice questions for class tests",
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

  const uploadDateFormatted = formatLmsDate(material.uploadDate);

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
                className="h-8.5 px-3.5 gap-1.5 cursor-pointer flex-1 sm:flex-none"
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
                Prepared by {material.uploadedBy} for {material.subject} ({compactClass}) for classroom teaching and exam revision.
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
            </div>

            {/* Right: Note Details */}
            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-brand-soft text-brand">
                  <FileCheck className="size-3.5" />
                </div>
                <h5 className="text-xs font-bold text-foreground">
                  Note Details
                </h5>
              </div>

              <div className="divide-y divide-border/50 text-xs">
                <div className="py-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Subject</span>
                  <span className="font-semibold text-foreground text-right">{material.subject}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Class</span>
                  <span className="font-semibold text-foreground text-right">{compactClass}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Teacher</span>
                  <span className="font-semibold text-foreground text-right">{material.uploadedBy}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Upload Date</span>
                  <span className="font-semibold text-foreground text-right">{uploadDateFormatted}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Format & Size</span>
                  <span className="font-semibold text-foreground text-right">
                    {material.fileType} • {material.fileSize || "Link"}
                  </span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Downloads</span>
                  <span className="font-bold text-brand text-right">{material.downloadCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
