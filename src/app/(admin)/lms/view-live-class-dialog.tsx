"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import type { LmsLiveClass } from "@/types";
import { formatCompactClass } from "@/lib/mock/lms";
import {
  Video,
  Calendar,
  Clock,
  Users,
  GraduationCap,
  TrendingUp,
  BookOpen,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ViewLiveClassDialogProps {
  liveClass: LmsLiveClass | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoin?: (liveClass: LmsLiveClass) => void;
}

export function ViewLiveClassDialog({
  liveClass,
  open,
  onOpenChange,
  onJoin,
}: ViewLiveClassDialogProps) {
  const [copied, setCopied] = React.useState(false);

  if (!liveClass) return null;

  const compactClass = formatCompactClass(liveClass.className);
  const isLive = liveClass.status === "Live Now";
  const isCompleted = liveClass.status === "Completed";

  const handleCopyLink = () => {
    const link =
      liveClass.joinUrl ||
      `https://school.lms.edu.pk/live/${liveClass.platform.toLowerCase().replace(/\s+/g, "-")}/${liveClass.id}`;
    navigator.clipboard?.writeText(link);
    setCopied(true);
    toast.success("Meeting link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const paceStatus = isLive
    ? {
        label: "Live Broadcast Active",
        tone: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      }
    : isCompleted
    ? {
        label: "Session Finished • Recording Saved",
        tone: "bg-muted text-muted-foreground border-border",
      }
    : {
        label: "Scheduled Classroom Session",
        tone: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl border border-border shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 bg-muted/30 border-b border-border/60">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl shrink-0",
                  isLive
                    ? "bg-emerald-500/15 text-emerald-600"
                    : "bg-brand-soft text-brand"
                )}
              >
                <Video className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base font-bold text-foreground truncate">
                    {liveClass.title}
                  </DialogTitle>
                  {isLive ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Live Now
                    </span>
                  ) : (
                    <StatusBadge status={liveClass.status} dot={false} />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <GraduationCap className="size-3.5 text-muted-foreground" />
                    {compactClass}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="size-3.5 text-muted-foreground" />
                    {liveClass.subject}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5 text-muted-foreground" />
                    {liveClass.teacher}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body: Scrollable */}
        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Prominent Session Status & Schedule Progress Dashboard */}
          <div className="p-4 rounded-xl border border-border/70 bg-gradient-to-b from-card to-muted/20 space-y-3.5">
            {/* Top Bar */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-brand-soft text-brand">
                  <Radio className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    Virtual Classroom Session Status
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Real-time lecture timing & attendance progress
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "text-[11px] font-semibold px-2 py-0.5 rounded-full border",
                  paceStatus.tone
                )}
              >
                {paceStatus.label}
              </span>
            </div>

            {/* Visual Schedule Track */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
                    {liveClass.startTime}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    scheduled start time ({liveClass.date})
                  </span>
                </div>
                <span className="text-xs font-semibold text-foreground font-mono">
                  {liveClass.startTime} – {liveClass.endTime}
                </span>
              </div>

              <div className="relative w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/40">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isLive
                      ? "bg-emerald-500 animate-pulse"
                      : isCompleted
                      ? "bg-muted-foreground/40"
                      : "bg-blue-600"
                  )}
                  style={{ width: isLive ? "65%" : isCompleted ? "100%" : "25%" }}
                />
              </div>

              {/* Milestones timeline */}
              <div className="grid grid-cols-3 pt-1 text-[10px] text-muted-foreground">
                <div className="text-left">
                  <span className="font-semibold text-foreground">Setup</span> Room Opens
                </div>
                <div className="text-center">
                  <span className="font-semibold text-foreground">Lecture</span> Live Instruction
                </div>
                <div className="text-right">
                  <span className="font-semibold text-foreground">Q&A</span> Session Wrap-up
                </div>
              </div>
            </div>

            {/* 4-KPI Metric Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-border/50">
              <div className="p-2.5 rounded-lg bg-card border border-border/60">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </p>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {liveClass.date}
                </p>
                <p className="text-[10px] text-muted-foreground">Scheduled day</p>
              </div>
              <div className="p-2.5 rounded-lg bg-card border border-border/60">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Timing
                </p>
                <p className="text-sm font-bold text-brand mt-0.5 font-mono">
                  {liveClass.startTime}
                </p>
                <p className="text-[10px] text-muted-foreground">To {liveClass.endTime}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-card border border-border/60">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Platform
                </p>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {liveClass.platform}
                </p>
                <p className="text-[10px] text-muted-foreground">HD video bridge</p>
              </div>
              <div className="p-2.5 rounded-lg bg-card border border-border/60">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Target Class
                </p>
                <p className="text-sm font-bold text-foreground mt-0.5 truncate">
                  {compactClass}
                </p>
                <p className="text-[10px] text-muted-foreground">34 Enrolled</p>
              </div>
            </div>
          </div>

          {/* Meeting Link & Access Details */}
          <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                Authorized Meeting Access
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {liveClass.platform}
              </Badge>
            </div>

            <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/60 text-xs font-mono">
              <span className="text-muted-foreground truncate">
                {liveClass.joinUrl ||
                  `https://school.lms.edu.pk/live/${liveClass.platform.toLowerCase().replace(/\s+/g, "-")}/${liveClass.id}`}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleCopyLink}
                className="h-6 px-2 text-[11px] gap-1 shrink-0 cursor-pointer"
              >
                {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
              <div>
                <span className="font-semibold text-foreground">Meeting ID: </span>
                <span className="font-mono">849 2039 1102</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">Passcode: </span>
                <span className="font-mono">SMS#2026</span>
              </div>
            </div>
          </div>

          {/* Lecture Agenda & Class Etiquette */}
          <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-2">
            <p className="text-xs font-bold text-foreground">
              Session Agenda & Lecture Outline
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside leading-relaxed">
              <li>Comprehensive review of textbook concepts and chapter theorems.</li>
              <li>Live interactive problem solving and board-pattern questions.</li>
              <li>Open student question-and-answer period with screen annotations.</li>
            </ul>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10.5px] bg-muted/60 text-muted-foreground border border-border/50">
                Camera & Mic Ready
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10.5px] bg-muted/60 text-muted-foreground border border-border/50">
                Attendance Recorded
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10.5px] bg-muted/60 text-muted-foreground border border-border/50">
                Cloud Recording Enabled
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-3 border-t border-border/60 bg-muted/10 flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8 px-3 cursor-pointer"
          >
            Close
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (onJoin) {
                onJoin(liveClass);
              } else {
                toast.success(`Launching ${liveClass.platform} session...`);
                if (liveClass.joinUrl) {
                  window.open(liveClass.joinUrl, "_blank", "noopener,noreferrer");
                }
              }
              onOpenChange(false);
            }}
            disabled={isCompleted}
            className={cn(
              "text-xs h-8 px-3.5 font-semibold cursor-pointer shadow-xs",
              isLive
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : isCompleted
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 text-white"
            )}
          >
            <ExternalLink className="size-3 mr-1.5" />
            {isLive ? "Join Live Session" : isCompleted ? "Session Ended" : "Launch Meeting"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
