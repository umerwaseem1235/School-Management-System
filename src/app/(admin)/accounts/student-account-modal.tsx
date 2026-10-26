"use client";

import * as React from "react";
import {
  Check,
  Copy,
  Download,
  Edit,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  Lock,
  Printer,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionButton } from "@/components/shared/action-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import type {
  AccountAccessLog,
  StudentAccountRecord,
} from "@/lib/mock/accounts";
import {
  exportSingleStudentAccountPdf,
  printSingleStudentAccountStatement,
} from "./accounts-export";

interface StudentAccountModalProps {
  account: StudentAccountRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: "overview" | "logs" | "reset";
  accountMode?: "student" | "parent";
  onUpdateCredentials?: (
    accountId: string,
    payload: {
      studentEmail: string;
      studentPassword: string;
      parentEmail: string;
      parentPassword: string;
      credentialStatus: StudentAccountRecord["credentialStatus"];
      assignedByAdmin: string;
    }
  ) => void;
  onEditAccount?: (account: StudentAccountRecord) => void;
}

export function StudentAccountModal({
  account,
  open,
  onOpenChange,
  initialTab = "overview",
  accountMode = "student",
  onUpdateCredentials,
  onEditAccount,
}: StudentAccountModalProps) {
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "logs" | "reset"
  >(initialTab);
  const [showPass, setShowPass] = React.useState(false);

  // Credential assignment / reset form state
  const [studentEmail, setStudentEmail] = React.useState("");
  const [studentPassword, setStudentPassword] = React.useState("");
  const [parentEmail, setParentEmail] = React.useState("");
  const [parentPassword, setParentPassword] = React.useState("");
  const [credentialStatus, setCredentialStatus] =
    React.useState<StudentAccountRecord["credentialStatus"]>("Active");
  const [assignedByAdmin, setAssignedByAdmin] = React.useState("");

  React.useEffect(() => {
    if (open && account) {
      setActiveTab(initialTab);
      setShowPass(false);
      setStudentEmail(account.studentEmail);
      setStudentPassword(account.studentPassword);
      setParentEmail(account.parentEmail);
      setParentPassword(account.parentPassword);
      setCredentialStatus(
        accountMode === "parent"
          ? account.parentPortalStatus
          : account.studentPortalStatus
      );
      setAssignedByAdmin(
        accountMode === "parent"
          ? account.assignedByAdmin.replace("Student Admin", "Parent Admin")
          : account.assignedByAdmin
      );
    }
  }, [open, account, initialTab, accountMode]);

  if (!account) return null;

  const isParentMode = accountMode === "parent";
  const displayAccountNo = isParentMode
    ? account.accountNo.replace("STD-", "PRT-")
    : account.accountNo;
  const activeEmail = isParentMode ? account.parentEmail : account.studentEmail;
  const activePassword = isParentMode
    ? account.parentPassword
    : account.studentPassword;
  const activeStatus = isParentMode
    ? account.parentPortalStatus
    : account.studentPortalStatus;
  const activeLastLogin = isParentMode
    ? account.parentLastLogin
    : account.studentLastLogin;
  const activeAdmin = isParentMode
    ? account.assignedByAdmin.replace("Student Admin", "Parent Admin")
    : account.assignedByAdmin;

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`, {
        description: text,
      });
    }
  };

  const generatePassword = (prefix: "Std" | "Prt", name: string) => {
    const clean =
      name
        .replace(/[^a-zA-Z]/g, "")
        .slice(0, 5)
        .charAt(0)
        .toUpperCase() +
      name
        .replace(/[^a-zA-Z]/g, "")
        .slice(1, 5)
        .toLowerCase();
    const rand = Math.floor(100 + Math.random() * 899);
    return `${prefix}@${clean || "User"}#${rand}`;
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isParentMode && (!studentEmail.trim() || !studentPassword.trim())) {
      toast.error("Student email and password are required.");
      return;
    }
    if (isParentMode && (!parentEmail.trim() || !parentPassword.trim())) {
      toast.error("Parent email and password are required.");
      return;
    }
    if (onUpdateCredentials) {
      onUpdateCredentials(account.id, {
        studentEmail: studentEmail.trim(),
        studentPassword: studentPassword.trim(),
        parentEmail: parentEmail.trim(),
        parentPassword: parentPassword.trim(),
        credentialStatus,
        assignedByAdmin:
          assignedByAdmin.trim() ||
          (isParentMode ? "Parent Admin" : "Student Admin"),
      });
      setActiveTab("overview");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-h-[calc(100vh-3rem)] sm:max-w-2xl gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white">
        {/* Clean Executive Header */}
        <DialogHeader className="shrink-0 gap-1 border-b border-border/70 bg-gradient-to-r from-[#091d3e]/[0.04] via-white to-white px-6 py-4">
          <div className="flex items-center justify-between gap-4 pr-8">
            <div className="flex items-center gap-3.5 min-w-0">
              <UserAvatar
                name={isParentMode ? account.guardianName : account.studentName}
                size="lg"
                className="ring-2 ring-brand/15 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-base font-bold leading-tight text-foreground">
                    {isParentMode
                      ? `${account.guardianName} (${account.guardianRelation})`
                      : account.studentName}
                  </DialogTitle>
                  <StatusBadge status={activeStatus} />
                  <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/70 px-2 py-0.5 font-mono text-[11px] font-bold text-[#091d3e]">
                    {displayAccountNo}
                  </span>
                </div>
                <DialogDescription className="mt-1 font-mono text-xs text-muted-foreground truncate">
                  {isParentMode
                    ? `Student: ${account.studentName} · Roll #${account.rollNo} · ${account.className}-${account.section} · ${account.campus}`
                    : `Roll #${account.rollNo} · Adm #${account.admissionNumber} · ${account.className}-${account.section} · ${account.campus}`}
                </DialogDescription>
              </div>
            </div>

            <div className="hidden sm:block text-right shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Assigned By
              </p>
              <span className="mt-0.5 inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-slate-50 px-2.5 py-0.5 text-xs font-bold text-[#091d3e] whitespace-nowrap">
                <ShieldCheck className="size-3.5 text-brand shrink-0" />
                <span>{activeAdmin}</span>
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Clean Single-Line Navigation Bar (Never Wraps) */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/70 bg-slate-50/60 px-6 py-2.5">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-[4px] px-3 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                activeTab === "overview"
                  ? "bg-[#091d3e] text-white shadow-2xs"
                  : "text-muted-foreground hover:bg-white hover:text-foreground"
              )}
            >
              <KeyRound className="size-3.5 shrink-0" />
              <span>
                {isParentMode ? "Parent Credentials" : "Student Credentials"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("reset")}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-[4px] px-3 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                activeTab === "reset"
                  ? "bg-emerald-700 text-white shadow-2xs"
                  : "text-emerald-800 bg-emerald-500/10 hover:bg-emerald-500/20"
              )}
            >
              <Lock className="size-3.5 shrink-0" />
              <span>Reset Email &amp; Password</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("logs")}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-[4px] px-3 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                activeTab === "logs"
                  ? "bg-[#091d3e] text-white shadow-2xs"
                  : "text-muted-foreground hover:bg-white hover:text-foreground"
              )}
            >
              <FileText className="size-3.5 shrink-0" />
              <span>Access Logs</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 font-mono text-[10px]",
                  activeTab === "logs"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200/80 text-foreground"
                )}
              >
                {account.accessLogs.length}
              </span>
            </button>
          </div>

          <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-muted-foreground whitespace-nowrap">
            <span>Last Reset:</span>
            <strong className="font-semibold text-foreground">
              {formatDate(account.lastPasswordReset)}
            </strong>
          </span>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-xs">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Primary Login Credentials Box (Full Width, Zero Truncation) */}
              <div className="overflow-hidden rounded-xl border border-brand/20 bg-white shadow-2xs">
                <div className="flex items-center justify-between border-b border-border/60 bg-slate-50/90 px-4 py-2.5">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#091d3e]">
                    <KeyRound className="size-3.5 text-brand" />
                    <span>
                      {isParentMode
                        ? "Assigned Parent Portal Login Credentials"
                        : "Assigned Student Portal Login Credentials"}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `Email: ${activeEmail} | Password: ${activePassword}`,
                        isParentMode
                          ? "Parent Login Credentials"
                          : "Student Login Credentials"
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-[4px] border border-brand/20 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#091d3e] hover:bg-brand-50 cursor-pointer"
                  >
                    <Copy className="size-3 text-brand" />
                    <span>Copy Both</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 divide-y divide-border/60 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                  {/* Left: Assigned Email */}
                  <div className="p-4 bg-white">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                        {isParentMode
                          ? "Assigned Parent Email"
                          : "Assigned Student Email"}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            activeEmail,
                            isParentMode ? "Parent Email" : "Student Email"
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-[4px] border border-border/80 bg-slate-50 px-2 py-0.5 text-[10.5px] font-semibold text-foreground hover:bg-slate-100 cursor-pointer"
                      >
                        <Copy className="size-2.5" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <p className="mt-2 font-mono text-[13px] font-bold text-[#091d3e] break-all">
                      {activeEmail}
                    </p>
                  </div>

                  {/* Right: Assigned Password */}
                  <div className="p-4 bg-emerald-50/35">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-900">
                        Assigned Password
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowPass((v) => !v)}
                          className="inline-flex items-center gap-1 rounded-[4px] border border-border/80 bg-white px-2 py-0.5 text-[10.5px] font-semibold text-foreground hover:bg-slate-100 cursor-pointer"
                        >
                          {showPass ? (
                            <EyeOff className="size-3" />
                          ) : (
                            <Eye className="size-3" />
                          )}
                          <span>{showPass ? "Hide" : "Show"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              activePassword,
                              isParentMode
                                ? "Parent Password"
                                : "Student Password"
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-[4px] bg-emerald-700 px-2 py-0.5 text-[10.5px] font-semibold text-white hover:bg-emerald-800 cursor-pointer"
                        >
                          <Copy className="size-2.5" />
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 font-mono text-[13px] font-bold text-emerald-800">
                      {showPass ? activePassword : "••••••••••••"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Structured Account & Login Details Table */}
              <div className="overflow-hidden rounded-xl border border-border/80 bg-white shadow-2xs">
                <div className="border-b border-border/60 bg-slate-50/80 px-4 py-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#091d3e]">
                    {isParentMode
                      ? "Parent Account & Linked Student Information"
                      : "Student Account & Login Information"}
                  </span>
                </div>

                <div className="grid grid-cols-1 divide-y divide-border/60 sm:grid-cols-2 sm:divide-x">
                  <div className="divide-y divide-border/60">
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-muted-foreground">Account #</span>
                      <span className="font-mono font-bold text-[#091d3e]">
                        {displayAccountNo}
                      </span>
                    </div>
                    {isParentMode ? (
                      <>
                        <div className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-muted-foreground">
                            Parent / Guardian
                          </span>
                          <span className="font-semibold text-foreground">
                            {account.guardianName} ({account.guardianRelation})
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-muted-foreground">
                            Registered Phone
                          </span>
                          <span className="font-mono font-semibold text-foreground">
                            {account.phone}
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-muted-foreground">
                            Student (Ward)
                          </span>
                          <span className="font-semibold text-foreground">
                            {account.studentName} (Roll #{account.rollNo})
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-muted-foreground">
                            Student Name
                          </span>
                          <span className="font-semibold text-foreground">
                            {account.studentName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-muted-foreground">
                            Roll # &amp; Admission #
                          </span>
                          <span className="font-mono font-semibold text-foreground">
                            Roll #{account.rollNo} · {account.admissionNumber}
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-muted-foreground">
                            Parent / Guardian
                          </span>
                          <span className="font-semibold text-foreground">
                            {account.guardianName} ({account.guardianRelation})
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="divide-y divide-border/60">
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-muted-foreground">Class</span>
                      <span className="font-semibold text-foreground">
                        {account.className}-{account.section}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-muted-foreground">Campus</span>
                      <span className="font-semibold text-foreground">
                        {account.campus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-muted-foreground">Assigned By</span>
                      <span className="font-semibold text-foreground">
                        {activeAdmin}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-muted-foreground">Last Login</span>
                      <span className="font-mono font-semibold text-[#091d3e]">
                        {activeLastLogin}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reset" && (
            <form onSubmit={handleSaveCredentials} className="space-y-4">
              {!isParentMode ? (
                <div className="rounded-xl border border-brand/20 bg-slate-50/70 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#091d3e]">
                    Assign / Reset Student Portal Credentials ({account.studentName})
                  </h4>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Assigned Student Email
                      </label>
                      <input
                        type="email"
                        required
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs text-foreground focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Assigned Student Password
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setStudentPassword(
                              generatePassword("Std", account.studentName)
                            )
                          }
                          className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand hover:underline cursor-pointer"
                        >
                          <RefreshCw className="size-3" />
                          <span>Auto-Generate</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs font-bold text-emerald-700 focus:border-brand focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-brand/20 bg-slate-50/70 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#091d3e]">
                    Assign / Reset Parent Portal Credentials ({account.guardianName})
                  </h4>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Assigned Parent Email
                      </label>
                      <input
                        type="email"
                        required
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs text-foreground focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Assigned Parent Password
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setParentPassword(
                              generatePassword("Prt", account.guardianName)
                            )
                          }
                          className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand hover:underline cursor-pointer"
                        >
                          <RefreshCw className="size-3" />
                          <span>Auto-Generate</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={parentPassword}
                        onChange={(e) => setParentPassword(e.target.value)}
                        className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs font-bold text-emerald-700 focus:border-brand focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Portal Account Status
                  </label>
                  <select
                    value={credentialStatus}
                    onChange={(e) =>
                      setCredentialStatus(
                        e.target.value as StudentAccountRecord["credentialStatus"]
                      )
                    }
                    className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  >
                    <option value="Active">Active (Login Permitted)</option>
                    <option value="Pending">Pending Activation</option>
                    <option value="Suspended">Suspended (Access Locked)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Assigned By Admin
                  </label>
                  <input
                    type="text"
                    value={assignedByAdmin}
                    onChange={(e) => setAssignedByAdmin(e.target.value)}
                    className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs text-foreground focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <ActionButton
                  tone="outline"
                  size="sm"
                  onClick={() => setActiveTab("overview")}
                >
                  Cancel
                </ActionButton>
                <ActionButton type="submit" tone="success" size="sm">
                  <Check className="size-3.5" />
                  <span>Save &amp; Assign Credentials</span>
                </ActionButton>
              </div>
            </form>
          )}

          {activeTab === "logs" && (
            <div className="overflow-hidden rounded-xl border border-border/80 bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/70 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-3.5 py-2.5 text-left">Timestamp</th>
                    <th className="px-3.5 py-2.5 text-center">Portal Actor</th>
                    <th className="px-3.5 py-2.5 text-left">
                      Activity / Event
                    </th>
                    <th className="px-3.5 py-2.5 text-left">Device &amp; IP</th>
                    <th className="px-3.5 py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {account.accessLogs.map((log: AccountAccessLog) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="px-3.5 py-2.5 font-mono text-[11px] text-foreground whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="px-3.5 py-2.5 text-center font-semibold text-[#091d3e] whitespace-nowrap">
                        {log.actor}
                      </td>
                      <td className="px-3.5 py-2.5 text-foreground">
                        {log.event}
                      </td>
                      <td className="px-3.5 py-2.5 text-muted-foreground whitespace-nowrap">
                        {log.device} ·{" "}
                        <span className="font-mono text-[10.5px]">
                          {log.ipAddress}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <StatusBadge
                          status={
                            log.status === "Success" ? "Active" : "Verified"
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="m-0 shrink-0 flex-row flex-wrap items-center justify-between gap-2.5 rounded-none border-t border-border/70 bg-muted/30 px-6 py-3.5 sm:justify-between">
          <div className="flex items-center gap-2">
            <ActionButton
              tone="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </ActionButton>
            {onEditAccount && (
              <ActionButton
                tone="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEditAccount(account);
                }}
              >
                <Edit className="size-3.5" />
                <span>Edit Account</span>
              </ActionButton>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ActionButton
              tone="outline"
              size="sm"
              onClick={() => {
                const ok = printSingleStudentAccountStatement(account);
                if (!ok) {
                  toast.error(
                    "Pop-up blocked. Allow pop-ups to print the credential slip."
                  );
                }
              }}
            >
              <Printer className="size-3.5" />
              <span>Print Slip</span>
            </ActionButton>
            <ActionButton
              tone="pdf"
              size="sm"
              onClick={() => {
                exportSingleStudentAccountPdf(account);
                toast.success(
                  `Login credential slip for ${
                    isParentMode ? account.guardianName : account.studentName
                  } downloaded as PDF.`
                );
              }}
            >
              <Download className="size-3.5" />
              <span>Download PDF</span>
            </ActionButton>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
