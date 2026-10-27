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
import type { LmsMaterial } from "@/types";
import { PAKISTANI_SCHOOL_CLASSES, PAKISTANI_SCHOOL_SUBJECTS } from "@/lib/mock/lms";
import { UploadCloud, FileText, Link as LinkIcon, BookOpen, GraduationCap } from "lucide-react";
import { toast } from "sonner";

interface UploadMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadMaterial: (material: LmsMaterial) => void;
}

const SUBJECT_OPTIONS = PAKISTANI_SCHOOL_SUBJECTS;

const CLASS_OPTIONS = PAKISTANI_SCHOOL_CLASSES;

export function UploadMaterialDialog({
  open,
  onOpenChange,
  onUploadMaterial,
}: UploadMaterialDialogProps) {
  const [title, setTitle] = React.useState("");
  const [subject, setSubject] = React.useState("Mathematics");
  const [className, setClassName] = React.useState<string>(PAKISTANI_SCHOOL_CLASSES[4]);
  const [fileType, setFileType] = React.useState<LmsMaterial["fileType"]>("PDF");
  const [uploadedBy, setUploadedBy] = React.useState("Mr. Adeel Hassan");
  const [fileName, setFileName] = React.useState("");
  const [linkUrl, setLinkUrl] = React.useState("");

  const resetForm = () => {
    setTitle("");
    setSubject("Mathematics");
    setClassName(PAKISTANI_SCHOOL_CLASSES[4]);
    setFileType("PDF");
    setUploadedBy("Mr. Adeel Hassan");
    setFileName("");
    setLinkUrl("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (!title) {
        // Auto-suggest title based on filename (strip extension)
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please provide a resource title.");
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);

    const newMaterial: LmsMaterial = {
      id: `mat-${Date.now()}`,
      title: title.trim(),
      subject,
      className,
      fileType,
      fileSize: fileType === "LINK" ? undefined : fileName ? "2.5 MB" : "1.8 MB",
      uploadedBy: uploadedBy.trim() || "Staff Admin",
      uploadDate: dateStr,
      downloadCount: 0,
      url: fileType === "LINK" ? linkUrl.trim() : undefined,
    };

    onUploadMaterial(newMaterial);
    toast.success("Learning Material Uploaded", {
      description: `"${newMaterial.title}" is now available for ${newMaterial.className}.`,
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
      <DialogContent className="sm:max-w-[540px] md:max-w-[580px] w-full p-0 overflow-hidden rounded-2xl border border-border shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 bg-muted/30 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <UploadCloud className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Upload Learning Material
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Share syllabus notes, past papers, presentations, or video resources.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Material Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Document / Resource Title <span className="text-danger">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Chapter 5: Thermochemistry Lecture Notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-sm"
              required
            />
          </div>

          {/* Subject & Class Selection */}
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
                Grade / Class
              </label>
              <Select
                value={className}
                onValueChange={(val) => {
                  if (val) setClassName(val);
                }}
              >
                <SelectTrigger className="h-9 text-sm w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_OPTIONS.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Type & Uploader */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">File Format</label>
              <Select
                value={fileType}
                onValueChange={(val) => {
                  if (val) setFileType(val as LmsMaterial["fileType"]);
                }}
              >
                <SelectTrigger className="h-9 text-sm w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF Document</SelectItem>
                  <SelectItem value="DOCX">Word Document (.docx)</SelectItem>
                  <SelectItem value="SLIDES">Slide Deck (PowerPoint)</SelectItem>
                  <SelectItem value="VIDEO">Video Lecture</SelectItem>
                  <SelectItem value="LINK">External Web Link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Uploaded By</label>
              <Input
                type="text"
                value={uploadedBy}
                onChange={(e) => setUploadedBy(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Dynamic file or URL field */}
          {fileType === "LINK" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <LinkIcon className="size-3.5 text-muted-foreground" />
                Resource URL
              </label>
              <Input
                type="url"
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <FileText className="size-3.5 text-muted-foreground" />
                Select File (PDF, DOCX, PPT)
              </label>
              <div className="border border-dashed border-border rounded-lg p-3 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
                <input
                  type="file"
                  id="material-upload"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="material-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-1"
                >
                  <UploadCloud className="size-6 text-muted-foreground" />
                  <span className="text-xs font-medium text-brand hover:underline">
                    {fileName ? fileName : "Click to select a file from device"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Max size: 25 MB per document
                  </span>
                </label>
              </div>
            </div>
          )}

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
              Save & Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
