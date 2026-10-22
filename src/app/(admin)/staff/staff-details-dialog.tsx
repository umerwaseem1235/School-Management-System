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
import { StatusBadge } from "@/components/shared/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCampusDisplay, formatDate, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StaffMember, Status } from "@/types";
import {
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  Copy,
  GraduationCap,
  Mail,
  Phone,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

interface StaffDetailsDialogProps {
  staff: StaffMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (id: string, newStatus: Status) => void;
}

const STATUS_OPTIONS: {
  status: Status;
  label: string;
  tone: "success" | "neutral" | "danger" | "warning";
  desc: string;
}[] = [
  {
    status: "Active",
    label: "Active",
    tone: "success",
    desc: "Currently on duty & active",
  },
  {
    status: "Inactive",
    label: "Inactive",
    tone: "neutral",
    desc: "Deactivated / relieved / on leave",
  },
  {
    status: "Suspended",
    label: "Suspended",
    tone: "danger",
    desc: "Temporarily suspended / blocked",
  },
  {
    status: "Pending",
    label: "Pending",
    tone: "warning",
    desc: "Awaiting verification / onboarding",
  },
];

export function StaffDetailsDialog({
  staff,
  open,
  onOpenChange,
  onStatusChange,
}: StaffDetailsDialogProps) {
  const [copied, setCopied] = React.useState(false);

  if (!staff) return null;

  const campusInfo = formatCampusDisplay(staff.campus);

  const handleCopySummary = () => {
    const summary = `Staff Profile: ${staff.name}
Employee Code: ${staff.empCode}
Designation: ${staff.designation}
Department: ${staff.department}
Type: ${staff.type}
Campus: ${campusInfo.primary} (${campusInfo.secondary || staff.campus})
Phone: ${staff.phone}
Email: ${staff.email}
Qualification: ${staff.qualification}
CNIC: ${staff.cnic || "N/A"}
Experience: ${staff.experience || "N/A"}
Assigned Classes: ${staff.assignedClasses || "N/A"}
Assigned Subjects: ${staff.assignedSubjects || "General Responsibilities"}
Class Incharge: ${staff.classTeacherOf || "None"}
Status: ${staff.status}
Joined: ${staff.joiningDate}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      toast.success("Staff Profile Copied", {
        description: `Complete details for ${staff.name} copied to clipboard.`,
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyPhone = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(staff.phone);
      toast.success("Phone Number Copied", {
        description: `${staff.phone} copied to clipboard.`,
      });
    }
  };

  const handleCopyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(staff.email);
      toast.success("Email Address Copied", {
        description: `${staff.email} copied to clipboard.`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden sm:max-w-2xl border-border/80 shadow-2xl">
        {/* Header Banner */}
        <DialogHeader className="border-b border-border/70 bg-gradient-to-r from-brand-50/70 via-background to-background px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand text-cream shadow-sm font-heading font-bold text-base ring-2 ring-brand/20">
                {initials(staff.name)}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="font-heading text-lg font-bold text-foreground">
                    {staff.name}
                  </DialogTitle>
                  
                  {/* Interactive Status Selector inside Header */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="group inline-flex items-center gap-1 rounded-full outline-none transition-all hover:scale-102 active:scale-95 cursor-pointer focus-visible:ring-1 focus-visible:ring-ring"
                      title="Click to change status"
                    >
                      <StatusBadge status={staff.status} dot={false} className="cursor-pointer group-hover:brightness-95 shadow-2xs" />
                      <ChevronDown className="size-3 text-muted-foreground/60 transition-transform group-data-[popup-open]:rotate-180" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-56 p-1.5 rounded-xl shadow-xl border border-border/70 bg-popover text-popover-foreground animate-in fade-in-50 zoom-in-95 duration-100"
                    >
                      <DropdownMenuGroup className="space-y-0.5">
                        <DropdownMenuLabel className="px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Change Status
                        </DropdownMenuLabel>
                        {STATUS_OPTIONS.map((opt) => {
                          const isCurrent = opt.status === staff.status;
                          return (
                            <DropdownMenuItem
                              key={opt.status}
                              onClick={() => {
                                if (!isCurrent && onStatusChange) {
                                  onStatusChange(staff.id, opt.status);
                                }
                              }}
                              className={cn(
                                "flex items-center justify-between rounded-lg px-2 py-1.5 text-xs font-medium cursor-pointer transition-colors",
                                isCurrent ? "bg-accent/80 font-semibold" : "hover:bg-accent/50"
                              )}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className={cn(
                                    "size-2 shrink-0 rounded-full",
                                    opt.tone === "success" && "bg-success",
                                    opt.tone === "neutral" && "bg-muted-foreground",
                                    opt.tone === "danger" && "bg-danger",
                                    opt.tone === "warning" && "bg-warning"
                                  )}
                                />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[12px] leading-tight">{opt.label}</span>
                                  <span className="text-[10px] text-muted-foreground font-normal leading-tight truncate">
                                    {opt.desc}
                                  </span>
                                </div>
                              </div>
                              {isCurrent && <Check className="size-3.5 text-primary shrink-0 ml-1.5" />}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                      staff.type === "Teaching"
                        ? "bg-brand-50 text-brand"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {staff.type}
                  </span>
                  {staff.classTeacherOf && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                      Incharge: {staff.classTeacherOf}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono font-semibold text-brand bg-brand-50 px-1.5 py-0.5 rounded">
                    {staff.empCode}
                  </span>
                  <span>·</span>
                  <span className="font-medium text-foreground">{staff.designation}</span>
                  <span>·</span>
                  <span>{staff.department}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Profile Content */}
        <div className="max-h-[64vh] overflow-y-auto px-6 py-5 space-y-5">
          {/* Section 1: Employment & Professional Background */}
          <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Briefcase className="size-3.5 text-brand" />
              <span>Professional & Employment Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-background/60 p-2.5">
                <Building2 className="size-4 text-brand shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Campus Branch</p>
                  <p className="font-semibold text-foreground truncate">{campusInfo.primary}</p>
                  {campusInfo.secondary && (
                    <p className="text-[11px] text-muted-foreground truncate">{campusInfo.secondary}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-background/60 p-2.5">
                <BookOpen className="size-4 text-brand shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Department</p>
                  <p className="font-semibold text-foreground truncate">{staff.department}</p>
                  <p className="text-[11px] text-muted-foreground">{staff.type} Staff</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-background/60 p-2.5">
                <GraduationCap className="size-4 text-brand shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Qualification</p>
                  <p className="font-semibold text-foreground truncate">{staff.qualification}</p>
                  {staff.experience && (
                    <p className="text-[11px] text-muted-foreground">{staff.experience} Experience</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-background/60 p-2.5">
                <Calendar className="size-4 text-brand shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Joining Date</p>
                  <p className="font-semibold text-foreground font-mono">
                    {formatDate(staff.joiningDate)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Tenure Record</p>
                </div>
              </div>
            </div>

            {/* Assigned Classes & Subjects / Responsibilities */}
            {staff.type === "Teaching" ? (
              (staff.assignedClasses || staff.assignedSubjects) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {staff.assignedClasses && (
                    <div className="rounded-lg border border-border/50 bg-background/60 p-3">
                      <p className="text-[11px] font-medium text-muted-foreground mb-1">
                        Assigned Class(es)
                      </p>
                      <p className="font-semibold text-foreground">{staff.assignedClasses}</p>
                    </div>
                  )}
                  {staff.assignedSubjects && (
                    <div className="rounded-lg border border-border/50 bg-background/60 p-3">
                      <p className="text-[11px] font-medium text-muted-foreground mb-1">
                        Assigned Subject(s)
                      </p>
                      <p className="font-semibold text-foreground">{staff.assignedSubjects}</p>
                    </div>
                  )}
                  {staff.classTeacherOf && (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/25 p-3 sm:col-span-2">
                      <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 mb-0.5">
                        Designated Class Incharge / Homeroom Supervision
                      </p>
                      <p className="font-semibold text-foreground">{staff.classTeacherOf}</p>
                    </div>
                  )}
                </div>
              )
            ) : (
              staff.assignedSubjects && (
                <div className="rounded-lg border border-border/50 bg-background/60 p-3 text-xs">
                  <p className="text-[11px] font-medium text-muted-foreground mb-1">
                    Key Responsibilities & Scope
                  </p>
                  <p className="font-medium text-foreground">{staff.assignedSubjects}</p>
                </div>
              )
            )}
          </div>

          {/* Section 2: Contact Information */}
          <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Phone className="size-3.5 text-brand" />
              <span>Contact Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 p-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Phone className="size-4 text-brand shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Official Contact</p>
                    <p className="font-mono font-semibold text-foreground truncate">{staff.phone}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleCopyPhone}
                  className="h-7 text-xs font-medium text-brand hover:bg-brand-50 cursor-pointer"
                >
                  Copy
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 p-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Mail className="size-4 text-brand shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Official Email</p>
                    <p className="font-mono text-xs font-semibold text-foreground truncate">{staff.email}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleCopyEmail}
                  className="h-7 text-xs font-medium text-brand hover:bg-brand-50 cursor-pointer"
                >
                  Copy
                </Button>
              </div>

              {staff.cnic && (
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 p-3 sm:col-span-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand font-mono text-[10px] font-bold border border-brand/20">
                      ID
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground">National Identity Card (CNIC)</p>
                      <p className="font-mono font-semibold text-foreground truncate">{staff.cnic}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="m-0 border-t border-border/70 bg-muted/30 px-6 py-3.5 flex flex-row items-center justify-end gap-2.5 sm:justify-end">
          {staff.status === "Active" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onStatusChange?.(staff.id, "Inactive")}
              className="h-8 gap-1.5 px-3 rounded-lg text-xs font-semibold border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/60 cursor-pointer shadow-2xs transition-all active:scale-95"
              title="Deactivate staff profile"
            >
              <UserX className="size-3.5" />
              <span>Deactivate Staff</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onStatusChange?.(staff.id, "Active")}
              className="h-8 gap-1.5 px-3 rounded-lg text-xs font-semibold border-success/40 text-success hover:bg-success/10 hover:border-success/60 cursor-pointer shadow-2xs transition-all active:scale-95"
              title="Activate staff profile"
            >
              <UserCheck className="size-3.5" />
              <span>Activate Staff</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopySummary}
            className="h-8 gap-1.5 px-3 rounded-lg text-xs font-semibold border-border/80 bg-background text-foreground/90 hover:bg-muted/70 hover:text-foreground shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-success" />
                <span className="text-success">Copied</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-muted-foreground" />
                <span>Copy Details</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 px-4 rounded-lg text-xs font-semibold bg-brand text-cream hover:bg-brand-600 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
