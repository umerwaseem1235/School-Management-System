"use client";

import * as React from "react";
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  Plus,
  Check,
  CheckCheck,
  X,
  Eye,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Phone,
  MessageSquareQuote,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionButton } from "@/components/shared/action-button";
import { PersonCell, UserAvatar } from "@/components/shared/user-avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, fieldClass } from "../../attendance/_components/attendance-kit";
import { formatCurrency, formatDate } from "@/lib/format";
import { FEE_REFUNDS, type FeeRefundRecord } from "@/lib/mock/finance";
import { exportRefundPdf, printRefundReport } from "./refund-export";

const DECIDER = "Hamza Tariq (Super Admin)";

const refundFilters: FilterDef<FeeRefundRecord>[] = [
  {
    key: "status",
    label: "Approval Status",
    options: ["Pending", "Approved", "Processed", "Rejected"],
    getValue: (r) => r.status,
  },
  {
    key: "requestedByRole",
    label: "Notified By",
    options: ["Parent", "Student"],
    getValue: (r) => r.requestedByRole ?? "Parent",
  },
  {
    key: "reason",
    label: "Reason",
    options: [
      "Admission Cancellation",
      "Security Deposit",
      "Double Payment",
      "Transport Discontinuation",
    ],
    getValue: (r) => r.reason,
  },
  {
    key: "campus",
    label: "Campus",
    options: ["Gulberg", "DHA Phase 5", "F-8 Islamabad", "Clifton", "Bahria Town"],
    getValue: (r) => r.campus,
  },
];

export function RefundClient() {
  const [records, setRecords] = React.useState<FeeRefundRecord[]>(FEE_REFUNDS);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [selectedRefundId, setSelectedRefundId] = React.useState<string | null>(null);
  const [adminRemarks, setAdminRemarks] = React.useState("");

  // Form state for logging a student/parent refund request
  const [requestedByRole, setRequestedByRole] = React.useState<"Parent" | "Student">("Parent");
  const [requestedByName, setRequestedByName] = React.useState("");
  const [contactPhone, setContactPhone] = React.useState("");
  const [student, setStudent] = React.useState("");
  const [rollNo, setRollNo] = React.useState("");
  const [className, setClassName] = React.useState("Grade 9-A");
  const [campus, setCampus] = React.useState("Gulberg");
  const [originalAmount, setOriginalAmount] = React.useState("");
  const [refundAmount, setRefundAmount] = React.useState("");
  const [reason, setReason] = React.useState<FeeRefundRecord["reason"]>(
    "Admission Cancellation"
  );
  const [paymentMethod, setPaymentMethod] =
    React.useState<FeeRefundRecord["paymentMethod"]>("Crossed Cheque");
  const [notificationNote, setNotificationNote] = React.useState("");

  const selectedRefund = React.useMemo(
    () => records.find((r) => r.id === selectedRefundId) ?? null,
    [records, selectedRefundId]
  );

  const totalRefunded = records
    .filter((r) => r.status === "Approved" || r.status === "Processed")
    .reduce((s, r) => s + r.refundAmount, 0);
  const pendingCount = records.filter((r) => r.status === "Pending").length;
  const approvedAndProcessedCount = records.filter(
    (r) => r.status === "Approved" || r.status === "Processed"
  ).length;
  const totalClaims = records.reduce((s, r) => s + r.refundAmount, 0);

  const handleDecision = React.useCallback(
    (
      record: FeeRefundRecord,
      nextStatus: FeeRefundRecord["status"],
      remarks?: string
    ) => {
      const today = new Date().toISOString().slice(0, 10);
      const cleanRemarks = remarks?.trim();
      setRecords((prev) =>
        prev.map((item) => {
          if (item.id !== record.id) return item;
          if (nextStatus === "Pending") {
            return {
              ...item,
              status: "Pending",
              approvedBy: undefined,
              approvedDate: undefined,
            };
          }
          return {
            ...item,
            status: nextStatus,
            approvedDate: today,
            approvedBy: cleanRemarks
              ? `${DECIDER} (${cleanRemarks})`
              : DECIDER,
          };
        })
      );

      if (nextStatus === "Approved") {
        toast.success(
          `Refund ${record.refundNo} (${formatCurrency(record.refundAmount)}) approved for ${record.student}.`
        );
      } else if (nextStatus === "Processed") {
        toast.success(
          `Refund ${record.refundNo} marked as Disbursed / Processed via ${record.paymentMethod}.`
        );
      } else if (nextStatus === "Rejected") {
        toast.error(
          `Refund claim ${record.refundNo} for ${record.student} has been rejected.`
        );
      } else {
        toast.info(`Refund claim ${record.refundNo} reopened for admin review.`);
      }
    },
    []
  );

  const handleApproveAllPending = React.useCallback(() => {
    const pendingList = records.filter((r) => r.status === "Pending");
    if (pendingList.length === 0) {
      toast.info("All student & parent refund requests have already been reviewed.");
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    setRecords((prev) =>
      prev.map((r) =>
        r.status === "Pending"
          ? {
              ...r,
              status: "Approved",
              approvedDate: today,
              approvedBy: DECIDER,
            }
          : r
      )
    );
    toast.success(
      `Approved all ${pendingList.length} pending student & parent refund notifications.`
    );
  }, [records]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student.trim()) {
      toast.error("Please enter student name.");
      return;
    }
    const orig = Number(originalAmount) || 0;
    const ref = Number(refundAmount) || 0;
    if (ref <= 0 || (orig > 0 && ref > orig)) {
      toast.error("Refund amount must be positive and not exceed original amount.");
      return;
    }

    const nextId = `rf-${Date.now()}`;
    const nextNo = `RF-2026-00${records.length + 81}`;
    const senderLabel =
      requestedByName.trim() ||
      (requestedByRole === "Parent"
        ? `Parent of ${student.trim()}`
        : `${student.trim()} (Student Portal)`);

    const newRecord: FeeRefundRecord = {
      id: nextId,
      refundNo: nextNo,
      challanNumber: `CH-2610-00${Math.floor(4000 + Math.random() * 1000)}`,
      student: student.trim(),
      rollNo: rollNo.trim() || "101",
      className,
      campus,
      originalAmount: orig || ref,
      refundAmount: ref,
      reason,
      paymentMethod,
      requestDate: new Date().toISOString().slice(0, 10),
      status: "Pending",
      requestedByRole,
      requestedByName: senderLabel,
      contactPhone: contactPhone.trim() || "+92 300 0000000",
      notificationNote:
        notificationNote.trim() ||
        `${requestedByRole} submitted a refund notification for ${reason.toLowerCase()}.`,
    };

    setRecords([newRecord, ...records]);
    setDialogOpen(false);
    setStudent("");
    setRollNo("");
    setRequestedByName("");
    setContactPhone("");
    setOriginalAmount("");
    setRefundAmount("");
    setNotificationNote("");
    toast.success(
      `Refund notification ${nextNo} logged and queued for Admin Approval.`
    );
  };

  const handlePrint = React.useCallback(() => {
    const ok = printRefundReport(records);
    if (ok) {
      toast.info("Opening print preview for Student Fee Refund Ledger…");
    }
  }, [records]);

  const handleExportPdf = React.useCallback(() => {
    const ok = exportRefundPdf(records);
    if (ok) {
      toast.success(
        `Refund register (${records.length} claims) downloaded as PDF.`
      );
    }
  }, [records]);

  const refundColumns = React.useMemo<Column<FeeRefundRecord>[]>(
    () => [
      {
        key: "refundNo",
        header: "Refund #",
        align: "center",
        className: "w-[12%] text-center",
        headerClassName: "w-[12%] text-center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-bold text-foreground">
              {r.refundNo}
            </span>
            <p className="font-mono text-[11px] text-muted-foreground">
              {r.challanNumber}
            </p>
          </div>
        ),
      },
      {
        key: "student",
        header: "Student",
        align: "center",
        className: "w-[18%] text-center",
        headerClassName: "w-[18%] text-center",
        cell: (r) => (
          <PersonCell
            name={r.student}
            subtitle={`Roll #${r.rollNo}`}
            showAvatar={false}
            className="text-center"
          />
        ),
      },
      {
        key: "classCampus",
        header: "Class & Campus",
        align: "center",
        className: "w-[15%] text-center",
        headerClassName: "w-[15%] text-center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="truncate text-[13px] font-semibold text-foreground">
              {r.className}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {r.campus}
            </p>
          </div>
        ),
      },
      {
        key: "notifiedBy",
        header: "Notified By",
        align: "center",
        className: "w-[15%] text-center",
        headerClassName: "w-[15%] text-center",
        cell: (r) => {
          const isParent = (r.requestedByRole ?? "Parent") === "Parent";
          return (
            <div className="flex flex-col items-center justify-center gap-1">
              <span
                className={cn(
                  "inline-flex h-6 items-center gap-1.5 rounded-md border px-2 text-[11px] font-semibold shadow-2xs",
                  isParent
                    ? "border-brand/20 bg-white text-brand"
                    : "border-sky-400/40 bg-sky-50/70 text-sky-700"
                )}
              >
                <span
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded-[4px] text-white",
                    isParent
                      ? "bg-brand"
                      : "bg-gradient-to-br from-sky-400 to-sky-600"
                  )}
                >
                  {isParent ? (
                    <UserCheck className="size-2.5" />
                  ) : (
                    <GraduationCap className="size-2.5" />
                  )}
                </span>
                <span className="leading-none">
                  {isParent ? "Parent" : "Student"}
                </span>
              </span>
              {r.requestedByName && (
                <span className="max-w-[140px] truncate text-[10.5px] text-muted-foreground">
                  {r.requestedByName.replace(/\s*\(.*?\)\s*/g, "")}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "refundAmount",
        header: "Refund Claim",
        align: "center",
        className: "w-[14%] text-center",
        headerClassName: "w-[14%] text-center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-[13px] font-bold tabular-nums text-foreground">
              {formatCurrency(r.refundAmount)}
            </span>
            <p className="font-mono text-[10.5px] tabular-nums text-muted-foreground">
              Paid: {formatCurrency(r.originalAmount)}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Approval Status",
        align: "center",
        className: "w-[12%] text-center",
        headerClassName: "w-[12%] text-center",
        cell: (r) => (
          <div className="flex flex-col items-center justify-center gap-0.5">
            <StatusBadge status={r.status} />
            <span className="max-w-[110px] truncate text-[10px] text-muted-foreground">
              {r.status === "Pending"
                ? "Awaiting Admin"
                : r.approvedBy
                ? r.approvedBy.split(" (")[0]
                : formatDate(r.requestDate)}
            </span>
          </div>
        ),
      },
      {
        key: "actions",
        header: "Refund Approval",
        align: "center",
        className: "w-[14%] px-2.5 text-center",
        headerClassName: "w-[14%] text-center",
        cell: (r) => (
          <div className="flex items-center justify-center">
            <ActionButton
              tone="outline"
              size="xs"
              title="View notification details & approval controls"
              onClick={() => {
                setSelectedRefundId(r.id);
                setAdminRemarks("");
                setViewDialogOpen(true);
              }}
            >
              <Eye className="size-3.5" />
              <span>View</span>
            </ActionButton>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Refund Management"
        className="mb-0 lg:mb-0"
        actions={
          <>
            <ActionButton
              tone="success"
              size="md"
              onClick={handleApproveAllPending}
            >
              <CheckCheck />
              <span>Approve Pending ({pendingCount})</span>
            </ActionButton>
            <ActionButton tone="outline" size="md" onClick={handlePrint}>
              <Printer />
              <span>Print</span>
            </ActionButton>
            <ActionButton tone="pdf" size="md" onClick={handleExportPdf}>
              <Download />
              <span>Export PDF</span>
            </ActionButton>
            <ActionButton
              tone="primary"
              size="md"
              onClick={() => setDialogOpen(true)}
            >
              <Plus />
              <span>Initiate Refund</span>
            </ActionButton>
          </>
        }
      />

      {/* KPI Cards */}
      <StatGrid>
        <StatCard
          label="Total Refund Claims"
          value={formatCurrency(totalClaims)}
          icon={RotateCcw}
        />
        <StatCard
          label="Pending Approval"
          value={`${pendingCount} Claims`}
          icon={Clock}
        />
        <StatCard
          label="Disbursed & Processed"
          value={formatCurrency(totalRefunded)}
          icon={CheckCircle2}
        />
        <StatCard
          label="Approved Clearance"
          value={`${approvedAndProcessedCount} Approved`}
          icon={ShieldCheck}
        />
      </StatGrid>

      {/* Standalone Section Heading & Table Card */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg">
            Student Fee Refund Ledger
          </h2>
        </div>

        {/* Main Table Section */}
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={records}
            columns={refundColumns}
            getRowId={(r) => r.id}
            filters={refundFilters}
            searchPlaceholder="Search by student, parent/guardian, refund # or challan…"
            searchFn={(r, q) =>
              r.student.toLowerCase().includes(q) ||
              r.refundNo.toLowerCase().includes(q) ||
              r.challanNumber.toLowerCase().includes(q) ||
              r.className.toLowerCase().includes(q) ||
              r.campus.toLowerCase().includes(q) ||
              (r.requestedByName?.toLowerCase().includes(q) ?? false)
            }
            pageSize={8}
          />
        </SectionCard>
      </div>

      {/* View & Approve Refund Notification Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
          {selectedRefund && (
            <>
              <DialogHeader className="gap-1 px-6 py-5">
                <div className="flex items-start justify-between gap-4 pr-8">
                  <div className="min-w-0">
                    <DialogTitle className="text-base font-bold leading-tight text-foreground">
                      Refund Notification &amp; Approval Review
                    </DialogTitle>
                    <DialogDescription className="mt-1 font-mono text-xs text-muted-foreground">
                      {selectedRefund.refundNo} · Challan {selectedRefund.challanNumber} · Requested{" "}
                      {formatDate(selectedRefund.requestDate)}
                    </DialogDescription>
                  </div>
                  <StatusBadge status={selectedRefund.status} />
                </div>
              </DialogHeader>

              <div className="space-y-5 border-t border-border/70 px-6 py-5">
                {/* Student & Parent/Student Notification Source */}
                <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <UserAvatar
                      name={selectedRefund.student}
                      size="lg"
                      className="ring-2 ring-brand/15"
                    />
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-foreground">
                        {selectedRefund.student}
                      </h3>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        Roll #{selectedRefund.rollNo} · {selectedRefund.className} ·{" "}
                        {selectedRefund.campus}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-1 border-t border-border/60 pt-2.5 sm:items-end sm:border-t-0 sm:pt-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Notification Sent By
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-brand/15 bg-white px-2.5 py-1 text-xs font-bold text-brand shadow-2xs">
                      {(selectedRefund.requestedByRole ?? "Parent") === "Parent" ? (
                        <UserCheck className="size-3.5 text-brand" />
                      ) : (
                        <GraduationCap className="size-3.5 text-sky-600" />
                      )}
                      <span>
                        {selectedRefund.requestedByName ??
                          `${selectedRefund.requestedByRole ?? "Parent"} Portal`}
                      </span>
                    </span>
                    {selectedRefund.contactPhone && (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                        <Phone className="size-3" />
                        {selectedRefund.contactPhone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Financial Summary Grid */}
                <dl className="grid grid-cols-3 divide-x divide-border/70 overflow-hidden rounded-xl border border-border/70 bg-white">
                  <div className="px-4 py-3">
                    <dt className="text-[11px] font-medium text-muted-foreground">
                      Original Paid
                    </dt>
                    <dd className="mt-1 font-mono text-sm font-bold tabular-nums text-foreground">
                      {formatCurrency(selectedRefund.originalAmount)}
                    </dd>
                  </div>
                  <div className="bg-emerald-50/40 px-4 py-3">
                    <dt className="text-[11px] font-semibold text-emerald-800">
                      Refund Claimed
                    </dt>
                    <dd className="mt-1 font-mono text-sm font-bold tabular-nums text-emerald-700">
                      {formatCurrency(selectedRefund.refundAmount)}
                    </dd>
                  </div>
                  <div className="px-4 py-3">
                    <dt className="text-[11px] font-medium text-muted-foreground">
                      Settlement Mode
                    </dt>
                    <dd className="mt-1 truncate text-xs font-bold text-foreground">
                      {selectedRefund.paymentMethod}
                    </dd>
                  </div>
                </dl>

                {/* Notification Reason & Message from Student / Parent */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <MessageSquareQuote className="size-3.5 text-brand" />
                      {selectedRefund.requestedByRole ?? "Parent"} Notification Statement
                    </span>
                    <span className="rounded-md border border-brand/15 bg-brand-50/60 px-2 py-0.5 text-[11px] font-semibold text-brand">
                      {selectedRefund.reason}
                    </span>
                  </div>
                  <p className="rounded-lg border-l-2 border-brand bg-slate-50/70 py-2.5 pl-3.5 pr-3 text-xs leading-relaxed text-foreground">
                    {selectedRefund.notificationNote ??
                      `Refund claim submitted for ${selectedRefund.reason} against Challan ${selectedRefund.challanNumber}.`}
                  </p>
                </div>

                {/* Approval Decision Info or Remarks Input */}
                {selectedRefund.status === "Pending" ? (
                  <Field label="Admin Approval / Verification Remarks (Optional)">
                    <input
                      type="text"
                      placeholder="e.g. Verified bank scroll & challan receipt; approved for settlement…"
                      value={adminRemarks}
                      onChange={(e) => setAdminRemarks(e.target.value)}
                      className={fieldClass}
                    />
                  </Field>
                ) : (
                  <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 px-3.5 py-2.5 text-xs">
                    <span className="text-muted-foreground">
                      Decision Recorded By:{" "}
                      <strong className="font-semibold text-foreground">
                        {selectedRefund.approvedBy ?? DECIDER}
                      </strong>
                    </span>
                    {selectedRefund.approvedDate && (
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {formatDate(selectedRefund.approvedDate)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter className="m-0 flex-row flex-wrap items-center justify-end gap-2 rounded-none border-t border-border/70 bg-muted/30 px-6 py-4">
                <ActionButton
                  tone="outline"
                  size="sm"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Close
                </ActionButton>

                {selectedRefund.status === "Pending" && (
                  <>
                    <ActionButton
                      tone="danger"
                      size="sm"
                      onClick={() => {
                        handleDecision(selectedRefund, "Rejected", adminRemarks);
                        setViewDialogOpen(false);
                      }}
                    >
                      <X className="size-3.5" />
                      <span>Reject Claim</span>
                    </ActionButton>
                    <ActionButton
                      tone="success"
                      size="sm"
                      onClick={() => {
                        handleDecision(selectedRefund, "Approved", adminRemarks);
                        setViewDialogOpen(false);
                      }}
                    >
                      <Check className="size-3.5" />
                      <span>Approve Refund</span>
                    </ActionButton>
                  </>
                )}

                {selectedRefund.status === "Approved" && (
                  <>
                    <ActionButton
                      tone="outline"
                      size="sm"
                      onClick={() => {
                        handleDecision(selectedRefund, "Pending");
                        setViewDialogOpen(false);
                      }}
                    >
                      <RotateCcw className="size-3.5" />
                      <span>Reopen</span>
                    </ActionButton>
                    <ActionButton
                      tone="primary"
                      size="sm"
                      onClick={() => {
                        handleDecision(selectedRefund, "Processed", adminRemarks);
                        setViewDialogOpen(false);
                      }}
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>Mark Disbursed</span>
                    </ActionButton>
                  </>
                )}

                {(selectedRefund.status === "Processed" ||
                  selectedRefund.status === "Rejected") && (
                  <ActionButton
                    tone="outline"
                    size="sm"
                    onClick={() => {
                      handleDecision(selectedRefund, "Pending");
                      setViewDialogOpen(false);
                    }}
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Reopen for Review</span>
                  </ActionButton>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Log Student / Parent Refund Request Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="size-4 text-brand" />
              <span>Log Student / Parent Refund Claim</span>
            </DialogTitle>
            <DialogDescription>
              Record an incoming refund notification from a parent/guardian or student for administrative approval.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Notification Sent By">
                <select
                  value={requestedByRole}
                  onChange={(e) =>
                    setRequestedByRole(e.target.value as "Parent" | "Student")
                  }
                  className={fieldClass}
                >
                  <option value="Parent">Parent / Guardian</option>
                  <option value="Student">Student</option>
                </select>
              </Field>
              <Field
                label={
                  requestedByRole === "Parent"
                    ? "Parent / Guardian Name"
                    : "Applicant Contact / Portal ID"
                }
              >
                <input
                  type="text"
                  placeholder={
                    requestedByRole === "Parent"
                      ? "e.g. Mr. Tariq Mehmood (Father)"
                      : "e.g. Student Portal / Roll #104"
                  }
                  value={requestedByName}
                  onChange={(e) => setRequestedByName(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Student Name">
                <input
                  type="text"
                  required
                  placeholder="e.g. Zainab Tariq"
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Roll Number">
                <input
                  type="text"
                  placeholder="e.g. 104"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Class / Grade">
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className={fieldClass}
                >
                  <option>Grade 6-A</option>
                  <option>Grade 7-B</option>
                  <option>Grade 8-A</option>
                  <option>Grade 9-A</option>
                  <option>Grade 10-A</option>
                  <option>Grade 11-A</option>
                  <option>Grade 12-A</option>
                </select>
              </Field>
              <Field label="Campus">
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className={fieldClass}
                >
                  <option>Gulberg</option>
                  <option>DHA Phase 5</option>
                  <option>F-8 Islamabad</option>
                  <option>Clifton</option>
                  <option>Bahria Town</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Original Paid (Rs)">
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 45000"
                  value={originalAmount}
                  onChange={(e) => setOriginalAmount(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Refund Claimed (Rs)">
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 15000"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Refund Reason">
                <select
                  value={reason}
                  onChange={(e) =>
                    setReason(e.target.value as FeeRefundRecord["reason"])
                  }
                  className={fieldClass}
                >
                  <option>Admission Cancellation</option>
                  <option>Security Deposit</option>
                  <option>Double Payment</option>
                  <option>Transport Discontinuation</option>
                  <option>Class Downgrade</option>
                </select>
              </Field>
              <Field label="Settlement Mode">
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value as FeeRefundRecord["paymentMethod"]
                    )
                  }
                  className={fieldClass}
                >
                  <option>Crossed Cheque</option>
                  <option>Bank Transfer</option>
                  <option>Adjusted in Ledger</option>
                </select>
              </Field>
            </div>

            <Field label="Parent / Student Notification Statement">
              <input
                type="text"
                placeholder="e.g. Relocating to Islamabad; security deposit refund requested with cleared dues."
                value={notificationNote}
                onChange={(e) => setNotificationNote(e.target.value)}
                className={fieldClass}
              />
            </Field>

            <DialogFooter className="flex items-center justify-end gap-2 pt-2">
              <ActionButton tone="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </ActionButton>
              <ActionButton type="submit" tone="primary">
                <Check />
                <span>Queue for Approval</span>
              </ActionButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
