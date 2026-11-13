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
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatCampusDisplay, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { User } from "@/types";
import {
  BookOpen,
  Briefcase,
  Building2,
  Check,
  Clock,
  Copy,
  GraduationCap,
  Hash,
  Lock,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { RoleBadge } from "./users-table";

interface ViewUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditUser?: (user: User) => void;
}

interface DetailField {
  label: string;
  value: string;
  icon: LucideIcon;
  mono?: boolean;
  fullWidth?: boolean;
}

function splitCsv(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ViewUserDialog({
  user,
  open,
  onOpenChange,
  onEditUser,
}: ViewUserDialogProps) {
  const [copiedUserId, setCopiedUserId] = React.useState<string | null>(null);
  const copiedSummary = copiedUserId === user?.id;

  if (!user) return null;

  const isSuperAdmin = user.role === "Super Admin";
  const campusInfo = formatCampusDisplay(user.campus);
  const assignedClasses = splitCsv(user.assignedClasses);
  const assignedSubjects = splitCsv(user.assignedSubjects);

  const primaryFields: DetailField[] = [
    {
      label: "Email Address",
      value: user.email,
      icon: Mail,
    },
    {
      label: "Phone Number",
      value: user.phone || "Not provided",
      icon: Phone,
      mono: Boolean(user.phone),
    },
    {
      label: "Role & Title",
      value: user.designation ? `${user.role} — ${user.designation}` : user.role,
      icon: Briefcase,
    },
    {
      label: "Last Login",
      value: user.lastLogin ? formatDateTime(user.lastLogin) : "Never logged in",
      icon: Clock,
    },
    {
      label: "Campus / Scope",
      value:
        campusInfo.secondary && campusInfo.secondary !== campusInfo.primary
          ? `${campusInfo.primary} (${campusInfo.secondary})`
          : campusInfo.primary,
      icon: Building2,
    },
    {
      label: "Department",
      value: user.department || "General Administration",
      icon: ShieldCheck,
    },
  ];

  if (user.employeeCode) {
    primaryFields.push({
      label: "Employee Code",
      value: user.employeeCode,
      icon: Hash,
      mono: true,
    });
  }

  if (user.studentRollNo) {
    primaryFields.push({
      label: "Student Roll No.",
      value: user.studentRollNo,
      icon: GraduationCap,
      mono: true,
    });
  }

  if (user.guardianName) {
    primaryFields.push({
      label: user.role === "Parent" ? "Linked Student / Child" : "Guardian Name",
      value: user.guardianName,
      icon: Users,
      fullWidth: !user.employeeCode && !user.studentRollNo,
    });
  }

  const handleCopyEmail = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(user.email);
    toast.success("Email Copied", {
      description: `${user.email} copied to clipboard.`,
    });
  };

  const handleCopySummary = () => {
    if (!navigator.clipboard) return;
    const lines = [
      `Name: ${user.name}`,
      `Email: ${user.email}`,
      `Role: ${user.role}`,
      ...(user.designation ? [`Designation: ${user.designation}`] : []),
      `Status: ${user.status}`,
      `Campus: ${user.campus}`,
      ...(user.department ? [`Department: ${user.department}`] : []),
      ...(user.phone ? [`Phone: ${user.phone}`] : []),
      ...(user.employeeCode ? [`Employee Code: ${user.employeeCode}`] : []),
      ...(user.studentRollNo ? [`Roll No: ${user.studentRollNo}`] : []),
      ...(user.guardianName ? [`Guardian / Linked: ${user.guardianName}`] : []),
      ...(assignedClasses.length > 0 ? [`Classes: ${assignedClasses.join(", ")}`] : []),
      ...(assignedSubjects.length > 0 ? [`Subjects: ${assignedSubjects.join(", ")}`] : []),
      `Last Login: ${user.lastLogin ? formatDateTime(user.lastLogin) : "Never"}`,
    ];

    navigator.clipboard.writeText(lines.join("\n"));
    const targetId = user.id;
    setCopiedUserId(targetId);
    toast.success("User Summary Copied", {
      description: `Account details for ${user.name} copied to clipboard.`,
    });
    setTimeout(() => {
      setCopiedUserId((prev) => (prev === targetId ? null : prev));
    }, 2000);
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setCopiedUserId(null);
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-md sm:max-w-[580px] max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 gap-0 border-border/80 shadow-2xl">
        {/* Top Profile Header */}
        <DialogHeader className="border-b border-border/70 bg-gradient-to-r from-brand-50/75 via-background to-background px-6 py-5 text-left">
          <div className="flex items-start justify-between gap-4 pr-6">
            <div className="flex items-center gap-3.5 min-w-0">
              <UserAvatar
                name={user.name}
                size="lg"
                className="rounded-2xl ring-2 ring-brand/15 shadow-xs"
              />
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="font-heading text-lg font-bold tracking-tight text-foreground truncate">
                    {user.name}
                  </DialogTitle>
                  <StatusBadge status={user.status} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <RoleBadge role={user.role} className="h-6 text-[11px] pr-2.5" />
                  {isSuperAdmin && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-red-200/80 bg-red-50/70 px-2 py-0.5 text-[11px] font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
                      <Lock className="size-3" />
                      <span>Root Protected</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* Core Profile & Account Fields */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {primaryFields.map((field) => {
              const Icon = field.icon;
              const isEmail = field.label === "Email Address";
              return (
                <div
                  key={field.label}
                  className={cn(
                    "rounded-xl border border-border/70 bg-muted/20 px-3.5 py-2.5 transition-colors hover:bg-muted/35",
                    field.fullWidth && "sm:col-span-2"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <Icon className="size-3.5 text-brand/80 shrink-0" />
                      {field.label}
                    </span>
                    {isEmail && (
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        title="Copy email address"
                        aria-label="Copy email address"
                        className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground cursor-pointer"
                      >
                        <Copy className="size-3" />
                      </button>
                    )}
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-[13px] font-medium text-foreground break-words",
                      field.mono && "font-mono tracking-tight"
                    )}
                  >
                    {field.value}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Academic / Class & Subject Assignments (when present) */}
          {(assignedClasses.length > 0 || assignedSubjects.length > 0) && (
            <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <BookOpen className="size-3.5 text-brand" />
                <span>Academic Scope & Assignments</span>
              </h4>

              {assignedClasses.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Assigned Classes
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedClasses.map((cls) => (
                      <span
                        key={cls}
                        className="inline-flex items-center rounded-md border border-brand/20 bg-brand-50/60 px-2 py-0.5 text-xs font-medium text-brand dark:bg-brand/15 dark:text-brand-foreground"
                      >
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {assignedSubjects.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Assigned Subjects
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedSubjects.map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 text-xs font-medium text-foreground"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="border-t border-border/70 bg-muted/20 px-6 py-3.5 flex-row items-center justify-between sm:justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopySummary}
            className="gap-1.5 cursor-pointer"
          >
            {copiedSummary ? (
              <>
                <Check className="size-3.5 text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </Button>

          <div className="flex items-center gap-2">
            {onEditUser && !isSuperAdmin && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEditUser(user);
                }}
                className="gap-1.5 border-amber-300/80 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-800/70 dark:text-amber-400 cursor-pointer"
              >
                <Pencil className="size-3.5" />
                <span>Edit User</span>
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
