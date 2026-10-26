"use client";

import * as React from "react";
import {
  Scale,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Printer,
  Download,
  Plus,
  Check,
  Eye,
  Pencil,
  FileText,
  Calendar,
  School,
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
import {
  FEE_ADJUSTMENTS,
  type FeeAdjustmentRecord,
} from "@/lib/mock/finance";
import {
  exportAdjustmentsPdf,
  printAdjustmentsReport,
  printAdjustmentVoucher,
} from "./adjustments-export";

export function AdjustmentsClient() {
  const [records, setRecords] = React.useState<FeeAdjustmentRecord[]>(FEE_ADJUSTMENTS);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedAdjustment, setSelectedAdjustment] =
    React.useState<FeeAdjustmentRecord | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);

  // Form states
  const [student, setStudent] = React.useState("");
  const [rollNo, setRollNo] = React.useState("");
  const [className, setClassName] = React.useState("Grade 10-A");
  const [campus, setCampus] = React.useState("Gulberg");
  const [type, setType] = React.useState<FeeAdjustmentRecord["type"]>(
    "Credit (Discount/Waiver)"
  );
  const [head, setHead] = React.useState<FeeAdjustmentRecord["head"]>("Tuition");
  const [amount, setAmount] = React.useState("3000");
  const [reason, setReason] = React.useState("Retroactive fee adjustment approved by Accounts");
  const [authorizedBy, setAuthorizedBy] = React.useState("Campus Principal");

  const totalCredits = records
    .filter((r) => r.type.startsWith("Credit"))
    .reduce((s, r) => s + r.amount, 0);
  const totalDebits = records
    .filter((r) => r.type.startsWith("Debit"))
    .reduce((s, r) => s + r.amount, 0);
  const pendingApprovals = records.filter((r) => r.status === "Pending Approval").length;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student.trim()) {
      toast.error("Please enter student name.");
      return;
    }
    const amt = Number(amount) || 0;
    if (amt <= 0) {
      toast.error("Adjustment amount must be positive.");
      return;
    }

    const nextId = `adj-${Date.now()}`;
    const nextNo = `ADJ-2026-0${records.length + 123}`;
    const newRecord: FeeAdjustmentRecord = {
      id: nextId,
      adjustmentNo: nextNo,
      challanNumber: `CH-2610-00${Math.floor(4800 + Math.random() * 500)}`,
      student: student.trim(),
      rollNo: rollNo.trim() || "101",
      className,
      campus,
      type,
      amount: amt,
      head,
      reason,
      date: new Date().toISOString().slice(0, 10),
      authorizedBy: authorizedBy || "Finance Officer",
      status: "Applied",
    };

    setRecords([newRecord, ...records]);
    setDialogOpen(false);
    setStudent("");
    setRollNo("");
    toast.success(`Adjustment entry ${nextNo} posted to student ledger.`);
  };

  // Edit modal state
  const [editingAdjustment, setEditingAdjustment] =
    React.useState<FeeAdjustmentRecord | null>(null);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);

  // Edit Form states
  const [editStudent, setEditStudent] = React.useState("");
  const [editRollNo, setEditRollNo] = React.useState("");
  const [editClassName, setEditClassName] = React.useState("Grade 10-A");
  const [editCampus, setEditCampus] = React.useState("Gulberg");
  const [editType, setEditType] = React.useState<FeeAdjustmentRecord["type"]>(
    "Credit (Discount/Waiver)"
  );
  const [editHead, setEditHead] = React.useState<FeeAdjustmentRecord["head"]>("Tuition");
  const [editAmount, setEditAmount] = React.useState("3000");
  const [editReason, setEditReason] = React.useState("");
  const [editAuthorizedBy, setEditAuthorizedBy] = React.useState("Campus Principal");
  const [editStatus, setEditStatus] =
    React.useState<FeeAdjustmentRecord["status"]>("Applied");

  const handleOpenEdit = React.useCallback((record: FeeAdjustmentRecord) => {
    setEditingAdjustment(record);
    setEditStudent(record.student);
    setEditRollNo(record.rollNo);
    setEditClassName(record.className);
    setEditCampus(record.campus);
    setEditType(record.type);
    setEditHead(record.head);
    setEditAmount(String(record.amount));
    setEditReason(record.reason);
    setEditAuthorizedBy(record.authorizedBy);
    setEditStatus(record.status);
    setEditDialogOpen(true);
  }, []);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdjustment) return;
    if (!editStudent.trim()) {
      toast.error("Please enter student name.");
      return;
    }
    const amt = Number(editAmount) || 0;
    if (amt <= 0) {
      toast.error("Adjustment amount must be positive.");
      return;
    }

    const updatedRecord: FeeAdjustmentRecord = {
      ...editingAdjustment,
      student: editStudent.trim(),
      rollNo: editRollNo.trim() || editingAdjustment.rollNo,
      className: editClassName,
      campus: editCampus,
      type: editType,
      head: editHead,
      amount: amt,
      reason: editReason.trim() || editingAdjustment.reason,
      authorizedBy: editAuthorizedBy.trim() || editingAdjustment.authorizedBy,
      status: editStatus,
    };

    setRecords((prev) =>
      prev.map((r) => (r.id === editingAdjustment.id ? updatedRecord : r))
    );

    if (selectedAdjustment && selectedAdjustment.id === editingAdjustment.id) {
      setSelectedAdjustment(updatedRecord);
    }

    setEditDialogOpen(false);
    toast.success(
      `Adjustment ${editingAdjustment.adjustmentNo} for ${updatedRecord.student} updated successfully.`
    );
  };

  const columns = React.useMemo<Column<FeeAdjustmentRecord>[]>(
    () => [
    {
      key: "adjustmentNo",
      header: "Adjustment #",
      align: "center",
      cell: (r) => (
        <button
          type="button"
          onClick={() => {
            setSelectedAdjustment(r);
            setViewDialogOpen(true);
          }}
          title="Click to view adjustment justification & ledger details"
          className="font-mono text-xs font-bold text-foreground hover:text-brand hover:underline cursor-pointer transition-colors"
        >
          {r.adjustmentNo}
        </button>
      ),
      className: "w-[12%] !px-3 text-center",
      headerClassName: "w-[12%] !px-3 text-center",
    },
    {
      key: "student",
      header: "Student",
      align: "center",
      className: "w-[16%] !px-3 text-center",
      headerClassName: "w-[16%] !px-3 text-center",
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
      key: "campus",
      header: "Campus & Class",
      align: "center",
      className: "w-[14%] !px-3 text-center",
      headerClassName: "w-[14%] !px-3 text-center",
      cell: (r) => (
        <div className="space-y-0.5 text-center">
          <p className="text-[13px] font-semibold text-foreground">{r.campus}</p>
          <p className="text-xs text-muted-foreground">{r.className}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Adjustment Type",
      align: "center",
      cell: (r) => {
        const isCredit = r.type.startsWith("Credit");
        return (
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-tight shadow-2xs whitespace-nowrap",
                isCredit
                  ? "border border-emerald-500/25 bg-emerald-50/90 text-emerald-700"
                  : "border border-amber-500/30 bg-amber-50/90 text-amber-800"
              )}
            >
              {isCredit ? (
                <ArrowDownLeft className="size-3 stroke-[2.5] text-emerald-600" />
              ) : (
                <ArrowUpRight className="size-3 stroke-[2.5] text-amber-700" />
              )}
              <span>{isCredit ? "Credit" : "Debit"}</span>
            </span>
            <span className="text-xs font-semibold text-foreground whitespace-nowrap">
              {r.head}
            </span>
          </div>
        );
      },
      className: "w-[15%] !px-2.5 text-center",
      headerClassName: "w-[15%] !px-2.5 text-center",
    },
    {
      key: "amount",
      header: "Adjustment Value",
      align: "center",
      cell: (r) => (
        <span
          className={`font-mono text-xs font-bold tabular-nums ${
            r.type.startsWith("Credit") ? "text-emerald-700" : "text-amber-800"
          }`}
        >
          {r.type.startsWith("Credit") ? "-" : "+"}
          {formatCurrency(r.amount)}
        </span>
      ),
      className: "w-[12%] !px-3 text-center",
      headerClassName: "w-[12%] !px-3 text-center",
    },
    {
      key: "date",
      header: "Date",
      align: "center",
      cell: (r) => (
        <span className="text-[13px] tabular-nums text-muted-foreground whitespace-nowrap">
          {formatDate(r.date)}
        </span>
      ),
      className: "w-[9%] !px-2 text-center",
      headerClassName: "w-[9%] !px-2 text-center",
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      cell: (r) => (
        <div className="flex justify-center">
          <StatusBadge
            status={r.status === "Applied" ? "Paid" : "Pending"}
          />
        </div>
      ),
      className: "w-[8%] !px-2 text-center",
      headerClassName: "w-[8%] !px-2 text-center",
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      className: "w-[14%] !px-2 text-center",
      headerClassName: "w-[14%] !px-2 text-center",
      cell: (r) => (
        <div className="flex items-center justify-center gap-1.5">
          <ActionButton
            tone="outline"
            size="xs"
            title={`View justification: ${r.reason}`}
            onClick={() => {
              setSelectedAdjustment(r);
              setViewDialogOpen(true);
            }}
          >
            <Eye className="size-3.5" />
            <span>View</span>
          </ActionButton>
          <ActionButton
            tone="outline"
            size="xs"
            title="Edit adjustment entry"
            onClick={() => handleOpenEdit(r)}
          >
            <Pencil className="size-3.5" />
            <span>Edit</span>
          </ActionButton>
        </div>
      ),
    },
  ], [handleOpenEdit]);

  const filters: FilterDef<FeeAdjustmentRecord>[] = [
    {
      key: "status",
      label: "Status",
      options: ["Applied", "Pending Approval", "Reversed"],
      getValue: (r) => r.status,
    },
    {
      key: "head",
      label: "Fee Head",
      options: ["Tuition", "Annual Charges", "Transport", "Examination Fee"],
      getValue: (r) => r.head,
    },
    {
      key: "campus",
      label: "Campus",
      options: ["Gulberg", "DHA Phase 5", "F-8 Islamabad", "Clifton", "Bahria Town"],
      getValue: (r) => r.campus,
    },
  ];

  const handlePrint = React.useCallback(() => {
    const ok = printAdjustmentsReport(records);
    if (ok) {
      toast.info("Opening print preview for Fee Adjustments Ledger…");
    }
  }, [records]);

  const handleExportPdf = React.useCallback(() => {
    const ok = exportAdjustmentsPdf(records);
    if (ok) {
      toast.success(
        `Adjustments register (${records.length} postings) downloaded as PDF.`
      );
    }
  }, [records]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Fee Adjustments"
        className="mb-0 lg:mb-0"
        actions={
          <>
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
              <span>Post Adjustment</span>
            </ActionButton>
          </>
        }
      />

      {/* KPI Cards */}
      <StatGrid>
        <StatCard
          label="Total Credit Waivers"
          value={formatCurrency(totalCredits)}
          icon={ArrowDownLeft}
        />
        <StatCard
          label="Total Debit Arrears"
          value={formatCurrency(totalDebits)}
          icon={ArrowUpRight}
        />
        <StatCard
          label="Pending Authorizations"
          value={`${pendingApprovals} Pending`}
          icon={Scale}
        />
        <StatCard
          label="Ledger Integrity"
          value="100% Balanced"
          icon={ShieldCheck}
        />
      </StatGrid>

      {/* Standalone Section Heading & Main Table */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg">
            Student Fee Ledger Adjustments
          </h2>
        </div>

        {/* Main Table */}
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={records}
            columns={columns}
            getRowId={(r) => r.id}
            filters={filters}
            searchPlaceholder="Search by student, adjustment #, challan or reason…"
            searchFn={(r, q) =>
              r.student.toLowerCase().includes(q) ||
              r.adjustmentNo.toLowerCase().includes(q) ||
              r.challanNumber.toLowerCase().includes(q) ||
              r.className.toLowerCase().includes(q) ||
              r.campus.toLowerCase().includes(q) ||
              r.reason.toLowerCase().includes(q)
            }
            pageSize={8}
          />
        </SectionCard>
      </div>

      {/* Post Adjustment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="size-4 text-brand" />
              <span>Post Student Fee Adjustment</span>
            </DialogTitle>
            <DialogDescription>
              Create a signed credit or debit ledger adjustment on an existing student challan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3.5 py-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Student Name">
                <input
                  type="text"
                  required
                  placeholder="e.g. Hamza Malik"
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Roll Number">
                <input
                  type="text"
                  placeholder="e.g. 219"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Class">
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className={fieldClass}
                >
                  <option>Grade 6-A</option>
                  <option>Grade 7-B</option>
                  <option>Grade 8-C</option>
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Adjustment Direction">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className={fieldClass}
                >
                  <option>Credit (Discount/Waiver)</option>
                  <option>Debit (Arrears/Add-on)</option>
                </select>
              </Field>
              <Field label="Fee Head">
                <select
                  value={head}
                  onChange={(e) => setHead(e.target.value as any)}
                  className={fieldClass}
                >
                  <option>Tuition</option>
                  <option>Annual Charges</option>
                  <option>Transport</option>
                  <option>Examination Fee</option>
                  <option>Security Fund</option>
                </select>
              </Field>
              <Field label="Amount (Rs)">
                <input
                  type="number"
                  min={1}
                  required
                  placeholder="e.g. 5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <Field label="Justification / Audit Remark">
              <input
                type="text"
                required
                placeholder="e.g. Approved proration for mid-term admission"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={fieldClass}
              />
            </Field>

            <Field label="Authorizing Authority">
              <input
                type="text"
                placeholder="e.g. Principal Secretariat / Accounts Committee"
                value={authorizedBy}
                onChange={(e) => setAuthorizedBy(e.target.value)}
                className={fieldClass}
              />
            </Field>

            <DialogFooter className="pt-2 flex items-center justify-end gap-2">
              <ActionButton tone="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </ActionButton>
              <ActionButton type="submit" tone="primary">
                <Check />
                Commit Adjustment
              </ActionButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Adjustment Justification & Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          {selectedAdjustment && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      <Scale className="size-4 text-brand" />
                      <span>Adjustment Justification & Details</span>
                    </DialogTitle>
                    <DialogDescription className="font-mono text-xs text-muted-foreground">
                      Ref: {selectedAdjustment.adjustmentNo} · Challan: {selectedAdjustment.challanNumber}
                    </DialogDescription>
                  </div>
                  <StatusBadge
                    status={selectedAdjustment.status === "Applied" ? "Paid" : "Pending"}
                  />
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* 1. Official Audit Justification & Reason Callout (Key Focus) */}
                <div className="rounded-xl border border-brand/20 bg-brand-50/50 p-4 shadow-2xs">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-brand">
                    <FileText className="size-3.5 text-brand" />
                    <span>Official Justification & Audit Reason</span>
                  </div>
                  <p className="mt-2 text-[13.5px] font-medium leading-relaxed text-foreground">
                    &ldquo;{selectedAdjustment.reason}&rdquo;
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-brand/15 pt-2.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-brand" />
                      Authorized by:{" "}
                      <strong className="font-semibold text-foreground">
                        {selectedAdjustment.authorizedBy}
                      </strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      Effective Date:{" "}
                      <strong className="font-medium text-foreground">
                        {formatDate(selectedAdjustment.date)}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* 2. Beneficiary Student & Campus Profile Card */}
                <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-slate-50/70 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar
                      name={selectedAdjustment.student}
                      size="lg"
                      className="ring-2 ring-brand/15"
                    />
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-bold text-foreground">
                        {selectedAdjustment.student}
                      </h4>
                      <p className="truncate text-xs text-muted-foreground">
                        Roll #{selectedAdjustment.rollNo} · {selectedAdjustment.className}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 self-start rounded-md border border-brand/20 bg-white px-2.5 py-1 text-xs font-semibold text-brand sm:self-center shadow-2xs">
                    <School className="size-3.5" />
                    <span>{selectedAdjustment.campus} Campus</span>
                  </div>
                </div>

                {/* 3. Financial Impact & Ledger Breakdown Grid */}
                <div className="grid grid-cols-3 divide-x divide-border/70 overflow-hidden rounded-xl border border-border/70 bg-white shadow-2xs">
                  <div className="p-3 text-center">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Adjustment Direction
                    </span>
                    <p className="mt-1 flex items-center justify-center gap-1 text-xs font-bold text-foreground">
                      {selectedAdjustment.type.startsWith("Credit") ? (
                        <>
                          <ArrowDownLeft className="size-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Credit (Waiver)</span>
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="size-3.5 text-amber-600" />
                          <span className="text-amber-800">Debit (Arrears)</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="p-3 text-center">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Fee Head
                    </span>
                    <p className="mt-1 text-xs font-bold text-foreground">
                      {selectedAdjustment.head}
                    </p>
                  </div>
                  <div
                    className={`p-3 text-center ${
                      selectedAdjustment.type.startsWith("Credit")
                        ? "bg-emerald-50/40"
                        : "bg-amber-50/40"
                    }`}
                  >
                    <span
                      className={`text-[11px] font-semibold ${
                        selectedAdjustment.type.startsWith("Credit")
                          ? "text-emerald-800"
                          : "text-amber-800"
                      }`}
                    >
                      Adjustment Value
                    </span>
                    <p
                      className={`mt-1 font-mono text-base font-bold tabular-nums ${
                        selectedAdjustment.type.startsWith("Credit")
                          ? "text-emerald-700"
                          : "text-amber-800"
                      }`}
                    >
                      {selectedAdjustment.type.startsWith("Credit") ? "-" : "+"}
                      {formatCurrency(selectedAdjustment.amount)}
                    </p>
                  </div>
                </div>

                {/* 4. Ledger Audit Metadata */}
                <div className="rounded-xl border border-border/70 bg-white p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Adjustment Voucher Ref</span>
                    <span className="font-mono font-semibold text-foreground">
                      {selectedAdjustment.adjustmentNo}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Associated Challan Ref</span>
                    <span className="font-mono font-semibold text-foreground">
                      {selectedAdjustment.challanNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ledger Posting Status</span>
                    <span className="font-medium text-foreground">
                      {selectedAdjustment.status === "Applied"
                        ? "Applied to Student Ledger"
                        : "Pending Approval"}
                    </span>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                <ActionButton
                  tone="outline"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Close
                </ActionButton>
                <div className="flex items-center gap-2">
                  <ActionButton
                    tone="outline"
                    onClick={() => {
                      printAdjustmentVoucher(selectedAdjustment);
                    }}
                  >
                    <Printer className="size-3.5" />
                    <span>Print Voucher</span>
                  </ActionButton>
                  <ActionButton
                    tone="primary"
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleOpenEdit(selectedAdjustment);
                    }}
                  >
                    <Pencil className="size-3.5" />
                    <span>Edit Adjustment</span>
                  </ActionButton>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Adjustment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="size-4 text-brand" />
              <span>Edit Fee Adjustment</span>
            </DialogTitle>
            <DialogDescription>
              {editingAdjustment && (
                <span>
                  Update details for {editingAdjustment.adjustmentNo} ({editingAdjustment.challanNumber}).
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-3.5 py-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Student Name">
                <input
                  type="text"
                  required
                  placeholder="e.g. Hamza Malik"
                  value={editStudent}
                  onChange={(e) => setEditStudent(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Roll Number">
                <input
                  type="text"
                  placeholder="e.g. 219"
                  value={editRollNo}
                  onChange={(e) => setEditRollNo(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Class">
                <select
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  className={fieldClass}
                >
                  <option>Grade 6-A</option>
                  <option>Grade 7-B</option>
                  <option>Grade 8-C</option>
                  <option>Grade 9-A</option>
                  <option>Grade 10-A</option>
                  <option>Grade 11-A</option>
                  <option>Grade 12-A</option>
                </select>
              </Field>
              <Field label="Campus">
                <select
                  value={editCampus}
                  onChange={(e) => setEditCampus(e.target.value)}
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Adjustment Direction">
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as any)}
                  className={fieldClass}
                >
                  <option>Credit (Discount/Waiver)</option>
                  <option>Debit (Arrears/Add-on)</option>
                </select>
              </Field>
              <Field label="Fee Head">
                <select
                  value={editHead}
                  onChange={(e) => setEditHead(e.target.value as any)}
                  className={fieldClass}
                >
                  <option>Tuition</option>
                  <option>Annual Charges</option>
                  <option>Transport</option>
                  <option>Examination Fee</option>
                  <option>Security Fund</option>
                </select>
              </Field>
              <Field label="Amount (Rs)">
                <input
                  type="number"
                  min={1}
                  required
                  placeholder="e.g. 5000"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Status">
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className={fieldClass}
                >
                  <option>Applied</option>
                  <option>Pending Approval</option>
                  <option>Reversed</option>
                </select>
              </Field>
              <Field label="Authorizing Authority">
                <input
                  type="text"
                  placeholder="e.g. Principal Secretariat / Accounts Committee"
                  value={editAuthorizedBy}
                  onChange={(e) => setEditAuthorizedBy(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <Field label="Justification / Audit Remark">
              <input
                type="text"
                required
                placeholder="e.g. Approved proration for mid-term admission"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className={fieldClass}
              />
            </Field>

            <DialogFooter className="pt-2 flex items-center justify-end gap-2">
              <ActionButton tone="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </ActionButton>
              <ActionButton type="submit" tone="primary">
                <Check />
                Save Changes
              </ActionButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
