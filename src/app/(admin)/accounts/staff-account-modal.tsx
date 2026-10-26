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
  StaffAccountRecord,
  StaffPortalRole,
} from "@/lib/mock/accounts";
import {
  exportSingleStaffAccountPdf,
  printSingleStaffAccountStatement,
} from "./accounts-export";

const PORTAL_ROLES: StaffPortalRole[] = [
  "Teacher Portal",
  "HOD / Academic Coordinator",
  "Campus Admin Portal",
  "Finance & Accounts Portal",
  "HR & Staff Admin",
  "Staff Self-Service",
];

interface StaffAccountModalProps {
  account: StaffAccountRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: "overview" | "logs" | "reset";
  onUpdateStaffCredentials?: (
    accountId: string,
    payload: {
      staffEmail: string;
      staffPassword: string;
      portalRole: StaffPortalRole;
      credentialStatus: StaffAccountRecord["credentialStatus"];
      assignedByAdmin: string;
      twoFactorEnabled: boolean;
    }
  ) => void;
  onEditAccount?: (account: StaffAccountRecord) => void;
}

export function StaffAccountModal({
  account,
  open,
  onOpenChange,
  initialTab = "overview",
  onUpdateStaffCredentials,
  onEditAccount,
}: StaffAccountModalProps) {
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "logs" | "reset"
  >(initialTab);
  const [showPass, setShowPass] = React.useState(false);

  const [staffEmail, setStaffEmail] = React.useState("");
  const [staffPassword, setStaffPassword] = React.useState("");
  const [portalRole, setPortalRole] =
    React.useState<StaffPortalRole>("Teacher Portal");
  const [credentialStatus, setCredentialStatus] =
    React.useState<StaffAccountRecord["credentialStatus"]>("Active");
  const [assignedByAdmin, setAssignedByAdmin] = React.useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(true);

  React.useEffect(() => {
    if (open && account) {
      setActiveTab(initialTab);
      setShowPass(false);
      setStaffEmail(account.staffEmail);
      setStaffPassword(account.staffPassword);
      setPortalRole(account.portalRole);
      setCredentialStatus(account.credentialStatus);
      setAssignedByAdmin(account.assignedByAdmin);
      setTwoFactorEnabled(account.twoFactorEnabled);
    }
  }, [open, account, initialTab]);

  if (!account) return null;

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`, {
        description: text,
      });
    }
  };

  const generateStaffPassword = (name: string) => {
    const clean =
      name
        .replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "")
        .replace(/[^a-zA-Z]/g, "")
        .slice(0, 5)
        .charAt(0)
        .toUpperCase() +
      name
        .replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "")
        .replace(/[^a-zA-Z]/g, "")
        .slice(1, 5)
        .toLowerCase();
    const rand = Math.floor(100 + Math.random() * 899);
    return `Stf@${clean || "Staff"}#${rand}`;
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffEmail.trim() || !staffPassword.trim()) {
      toast.error("Staff email and password are required.");
      return;
    }
    if (onUpdateStaffCredentials) {
      onUpdateStaffCredentials(account.id, {
        staffEmail: staffEmail.trim(),
        staffPassword: staffPassword.trim(),
        portalRole,
        credentialStatus,
        assignedByAdmin: assignedByAdmin.trim() || "Staff Admin — HR & IT",
        twoFactorEnabled,
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
                name={account.name}
                size="lg"
                className="ring-2 ring-brand/15 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-base font-bold leading-tight text-foreground">
                    {account.name}
                  </DialogTitle>
                  <StatusBadge status={account.credentialStatus} />
                  <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/70 px-2 py-0.5 font-mono text-[11px] font-bold text-[#091d3e]">
                    {account.accountNo}
                  </span>
                </div>
                <DialogDescription className="mt-1 font-mono text-xs text-muted-foreground truncate">
                  {account.empCode} · {account.designation} ·{" "}
                  {account.department} · {account.campus}
                </DialogDescription>
              </div>
            </div>

            <div className="hidden sm:block text-right shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Assigned By
              </p>
              <span className="mt-0.5 inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-slate-50 px-2.5 py-0.5 text-xs font-bold text-[#091d3e] whitespace-nowrap">
                <ShieldCheck className="size-3.5 text-brand shrink-0" />
                <span>{account.assignedByAdmin}</span>
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Clean Single-Line Navigation Bar */}
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
              <span>Staff Credentials</span>
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
              {/* Primary Login Credentials Box */}
              <div className="overflow-hidden rounded-xl border border-brand/20 bg-white shadow-2xs">
                <div className="flex items-center justify-between border-b border-border/60 bg-slate-50/90 px-4 py-2.5">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#091d3e]">
                    <KeyRound className="size-3.5 text-brand" />
                    <span>Assigned Staff Portal Login Credentials</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `Email: ${account.staffEmail} | Password: ${account.staffPassword}`,
                        "Staff Login Credentials"
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-[4px] border border-brand/20 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#091d3e] hover:bg-brand-50 cursor-pointer"
                  >
                    <Copy className="size-3 text-brand" />
                    <span>Copy Both</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 divide-y divide-border/60 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                  <div className="p-4 bg-white">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                        Assigned Staff Email
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(account.staffEmail, "Staff Email")
                        }
                        className="inline-flex items-center gap-1 rounded-[4px] border border-border/80 bg-slate-50 px-2 py-0.5 text-[10.5px] font-semibold text-foreground hover:bg-slate-100 cursor-pointer"
                      >
                        <Copy className="size-2.5" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <p className="mt-2 font-mono text-[13px] font-bold text-[#091d3e] break-all">
                      {account.staffEmail}
                    </p>
                  </div>

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
                            handleCopy(account.staffPassword, "Staff Password")
                          }
                          className="inline-flex items-center gap-1 rounded-[4px] bg-emerald-700 px-2 py-0.5 text-[10.5px] font-semibold text-white hover:bg-emerald-800 cursor-pointer"
                        >
                          <Copy className="size-2.5" />
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 font-mono text-[13px] font-bold text-emerald-800">
                      {showPass ? account.staffPassword : "••••••••••••"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Structured Staff Account & Login Information */}
              <div className="overflow-hidden rounded-xl border border-border/80 bg-white shadow-2xs">
                <div className="border-b border-border/60 bg-slate-50/80 px-4 py-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#091d3e]">
                    Staff Account &amp; Login Information
                  </span>
                </div>

                <div className="grid grid-cols-1 divide-y divide-border/60 sm:grid-cols-2 sm:divide-x">
                  <div className="divide-y divide-border/60">
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-muted-foreground">Account #</span>
                      <span className="font-mono font-bold text-[#091d3e]">
                        {account.accountNo}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-muted-foreground">
                        Staff Member
                      </span>
                      <span className="font-semibold text-foreground">
                        {account.name} ({account.empCode})
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-muted-foreground">
                        Department &amp; Role
                      </span>
                      <span className="font-semibold text-foreground">
                        {account.department} · {account.designation}
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
                  </div>

                  <div className="divide-y divide-border/60">
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-muted-foreground">Campus</span>
                      <span className="font-semibold text-foreground">
                        {account.campus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-muted-foreground">Portal Role</span>
                      <span className="font-semibold text-[#091d3e]">
                        {account.portalRole}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-muted-foreground">Assigned By</span>
                      <span className="font-semibold text-foreground">
                        {account.assignedByAdmin}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-muted-foreground">Last Login</span>
                      <span className="font-mono font-semibold text-[#091d3e]">
                        {account.lastLogin}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reset" && (
            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div className="rounded-xl border border-brand/20 bg-slate-50/70 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#091d3e]">
                  Assign / Reset Staff Portal Credentials ({account.name})
                </h4>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Assigned Staff Email
                    </label>
                    <input
                      type="email"
                      required
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs text-foreground focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Assigned Staff Password
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setStaffPassword(generateStaffPassword(account.name))
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
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 font-mono text-xs font-bold text-emerald-700 focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Assigned Portal Role
                  </label>
                  <select
                    value={portalRole}
                    onChange={(e) =>
                      setPortalRole(e.target.value as StaffPortalRole)
                    }
                    className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  >
                    {PORTAL_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Portal Account Status
                  </label>
                  <select
                    value={credentialStatus}
                    onChange={(e) =>
                      setCredentialStatus(
                        e.target.value as StaffAccountRecord["credentialStatus"]
                      )
                    }
                    className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  >
                    <option value="Active">Active (Login Permitted)</option>
                    <option value="Pending">Pending Activation</option>
                    <option value="Suspended">Suspended (Access Locked)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Assigned By (Staff Admin)
                  </label>
                  <input
                    type="text"
                    value={assignedByAdmin}
                    onChange={(e) => setAssignedByAdmin(e.target.value)}
                    className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs text-foreground focus:border-brand focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Two-Factor Authentication (2FA)
                  </label>
                  <select
                    value={twoFactorEnabled ? "enabled" : "disabled"}
                    onChange={(e) =>
                      setTwoFactorEnabled(e.target.value === "enabled")
                    }
                    className="h-9 w-full rounded-[4px] border border-brand/20 bg-white px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  >
                    <option value="enabled">Enabled (OTP Required)</option>
                    <option value="disabled">Standard Password Only</option>
                  </select>
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
                    <th className="px-3.5 py-2.5 text-center">Actor</th>
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
                printSingleStaffAccountStatement(account);
                toast.info(
                  `Opening print preview for ${account.name}'s credential slip…`
                );
              }}
            >
              <Printer className="size-3.5" />
              <span>Print Slip</span>
            </ActionButton>
            <ActionButton
              tone="pdf"
              size="sm"
              onClick={() => {
                exportSingleStaffAccountPdf(account);
                toast.success(
                  `Staff credential slip PDF downloaded for ${account.name}.`
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
