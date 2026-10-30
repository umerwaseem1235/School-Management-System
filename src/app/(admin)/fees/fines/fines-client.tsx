"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Printer,
  Download,
  Plus,
  Check,
  Ban,
  SlidersHorizontal,
  Eye,
  RotateCcw,
  Receipt,
  User,
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
import { FEE_FINES, type FeeFineRecord } from "@/lib/mock/finance";
import { exportFinesPdf, printFinesReport } from "./fines-export";

export function FinesClient() {
  const [records, setRecords] = React.useState<FeeFineRecord[]>(FEE_FINES);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Fine Settlement Modal state
  const [settlementOpen, setSettlementOpen] = React.useState(false);
  const [selectedFineId, setSelectedFineId] = React.useState<string | null>(null);
  const [settlementOption, setSettlementOption] = React.useState<"paid" | "waived">("paid");
  const [paidPaymentMethod, setPaidPaymentMethod] = React.useState("Cash Counter");
  const [paidReference, setPaidReference] = React.useState("");
  const [waiveReason, setWaiveReason] = React.useState("First-time Offense Exemption");
  const [waiveAuthorizedBy, setWaiveAuthorizedBy] = React.useState("Campus Principal");

  // New Fine Form states
  const [student, setStudent] = React.useState("");
  const [rollNo, setRollNo] = React.useState("");
  const [className, setClassName] = React.useState("Grade 9-A");
  const [campus, setCampus] = React.useState("Gulberg");
  const [fineType, setFineType] =
    React.useState<FeeFineRecord["fineType"]>("Late Fee Submission");
  const [amount, setAmount] = React.useState("1500");
  const [dueDate, setDueDate] = React.useState("2026-10-30");

  const selectedFine = React.useMemo(
    () => records.find((r) => r.id === selectedFineId) ?? records[0],
    [records, selectedFineId]
  );

  const totalLevied = records.reduce((s, r) => s + r.amount, 0);
  const totalCollected = records
    .filter((r) => r.status === "Paid")
    .reduce((s, r) => s + r.amount, 0);
  const totalOutstanding = records
    .filter((r) => r.status === "Unpaid")
    .reduce((s, r) => s + r.amount, 0);
  const totalWaived = records
    .filter((r) => r.status === "Waived")
    .reduce((s, r) => s + r.amount, 0);

  const openSettlementDialog = (fine?: FeeFineRecord) => {
    if (fine) {
      setSelectedFineId(fine.id);
      setSettlementOption(fine.status === "Waived" ? "waived" : "paid");
    } else {
      const firstUnpaid = records.find((r) => r.status === "Unpaid") ?? records[0];
      setSelectedFineId(firstUnpaid?.id ?? null);
      setSettlementOption("paid");
    }
    setPaidReference("");
    setWaiveReason("First-time Offense Exemption");
    setWaiveAuthorizedBy("Campus Principal");
    setSettlementOpen(true);
  };

  const handleConfirmPaid = () => {
    if (!selectedFine) return;
    setRecords((list) =>
      list.map((r) =>
        r.id === selectedFine.id
          ? {
              ...r,
              status: "Paid",
              paidDate: new Date().toISOString().slice(0, 10),
            }
          : r
      )
    );
    setSettlementOpen(false);
    toast.success(
      `Fine ${selectedFine.fineNumber} (${formatCurrency(selectedFine.amount)}) marked as Paid for ${selectedFine.student}.`
    );
  };

  const handleConfirmWaive = () => {
    if (!selectedFine) return;
    setRecords((list) =>
      list.map((r) =>
        r.id === selectedFine.id
          ? {
              ...r,
              status: "Waived",
              waivedReason: waiveReason || "Approved by Campus Principal",
              waivedBy: waiveAuthorizedBy || "Campus Principal",
            }
          : r
      )
    );
    setSettlementOpen(false);
    toast.info(
      `Fine ${selectedFine.fineNumber} waived on institutional grounds (${waiveReason}).`
    );
  };

  const handleReopenUnpaid = (fineId: string) => {
    const fine = records.find((r) => r.id === fineId);
    setRecords((list) =>
      list.map((r) =>
        r.id === fineId
          ? {
              ...r,
              status: "Unpaid",
              paidDate: undefined,
              waivedReason: undefined,
              waivedBy: undefined,
            }
          : r
      )
    );
    setSettlementOpen(false);
    toast.info(`Fine notice ${fine?.fineNumber ?? ""} reopened as Unpaid.`);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student.trim()) {
      toast.error("Please enter student name.");
      return;
    }
    const amt = Number(amount) || 0;
    if (amt <= 0) {
      toast.error("Fine amount must be greater than zero.");
      return;
    }

    const nextId = `fn-${Date.now()}`;
    const nextNo = `FN-2026-0${records.length + 195}`;
    const newFine: FeeFineRecord = {
      id: nextId,
      fineNumber: nextNo,
      student: student.trim(),
      rollNo: rollNo.trim() || "101",
      className,
      campus,
      fineType,
      amount: amt,
      imposedDate: new Date().toISOString().slice(0, 10),
      dueDate,
      status: "Unpaid",
    };

    setRecords([newFine, ...records]);
    setDialogOpen(false);
    setStudent("");
    setRollNo("");
    toast.success(`Fine notice ${nextNo} imposed successfully.`);
  };

  const columns = React.useMemo<Column<FeeFineRecord>[]>(
    () => [
      {
        key: "fineNumber",
        header: "Fine #",
        align: "center",
        className: "w-[13%] text-center whitespace-nowrap",
        headerClassName: "w-[13%] text-center whitespace-nowrap",
        cell: (r) => (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => openSettlementDialog(r)}
              title={`Fine #${r.fineNumber} — Click to choose Mark as Paid or Waived`}
              className="inline-flex items-center justify-center rounded-[4px] border border-brand/20 bg-brand-50/60 px-2.5 py-1 font-mono text-xs font-bold tracking-tight text-[#091d3e] shadow-2xs transition-all hover:border-brand/40 hover:bg-brand-100/70 cursor-pointer whitespace-nowrap select-none"
            >
              <span>{r.fineNumber}</span>
            </button>
          </div>
        ),
      },
      {
        key: "student",
        header: "Student",
        align: "center",
        className: "w-[20%] text-center",
        headerClassName: "w-[20%] text-center",
        cell: (r) => (
          <PersonCell
            name={r.student}
            subtitle={`Roll #${r.rollNo} · ${r.className}`}
            showAvatar={false}
            className="text-center"
          />
        ),
      },
      {
        key: "campus",
        header: "Campus",
        align: "center",
        className: "w-[11%] text-center",
        headerClassName: "w-[11%] text-center",
        cell: (r) => <span className="text-[13px]">{r.campus}</span>,
      },
      {
        key: "fineType",
        header: "Violation / Category",
        align: "center",
        className: "w-[15%] text-center",
        headerClassName: "w-[15%] text-center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="truncate text-xs font-semibold text-foreground">
              {r.fineType}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              Imposed: {formatDate(r.imposedDate)}
            </p>
          </div>
        ),
      },
      {
        key: "amount",
        header: "Fine Amount",
        align: "center",
        className: "w-[11%] text-center",
        headerClassName: "w-[11%] text-center",
        cell: (r) => (
          <span className="font-mono text-xs font-bold tabular-nums text-foreground">
            {formatCurrency(r.amount)}
          </span>
        ),
      },
      {
        key: "dueDate",
        header: "Due Date",
        align: "center",
        className: "w-[10%] text-center",
        headerClassName: "w-[10%] text-center",
        cell: (r) => (
          <span className="text-[13px] tabular-nums text-muted-foreground whitespace-nowrap">
            {formatDate(r.dueDate)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        className: "w-[9%] text-center",
        headerClassName: "w-[9%] text-center",
        cell: (r) => (
          <div className="flex justify-center">
            <StatusBadge
              status={
                r.status === "Paid"
                  ? "Paid"
                  : r.status === "Waived"
                  ? "Excused"
                  : "Overdue"
              }
            />
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        className: "w-[11%] text-center",
        headerClassName: "w-[11%] text-center",
        cell: (r) => (
          <div className="flex items-center justify-center">
            {r.status === "Unpaid" ? (
              <ActionButton
                tone="outline"
                size="xs"
                onClick={() => openSettlementDialog(r)}
                title="Choose Mark as Paid or Waived option"
              >
                <SlidersHorizontal className="size-3.5" />
                <span>Update</span>
              </ActionButton>
            ) : (
              <ActionButton
                tone="outline"
                size="xs"
                onClick={() => openSettlementDialog(r)}
                title="View settlement receipt & details"
              >
                <Eye className="size-3.5" />
                <span>Details</span>
              </ActionButton>
            )}
          </div>
        ),
      },
    ],
    []
  );

  const filters: FilterDef<FeeFineRecord>[] = [
    {
      key: "status",
      label: "Status",
      options: ["Unpaid", "Paid", "Waived"],
      getValue: (r) => r.status,
    },
    {
      key: "fineType",
      label: "Category",
      options: [
        "Late Fee Submission",
        "Library Overdue",
        "Disciplinary",
        "Lab Breakage",
        "ID Card Loss",
      ],
      getValue: (r) => r.fineType,
    },
    {
      key: "campus",
      label: "Campus",
      options: ["Gulberg", "DHA Phase 5", "F-8 Islamabad", "Clifton", "Bahria Town"],
      getValue: (r) => r.campus,
    },
  ];

  const handlePrint = React.useCallback(() => {
    const ok = printFinesReport(records);
    if (ok) {
      toast.info("Opening print preview for Fines & Penalties Ledger…");
    }
  }, [records]);

  const handleExportPdf = React.useCallback(() => {
    const ok = exportFinesPdf(records);
    if (ok) {
      toast.success(
        `Fines ledger (${records.length} notices) downloaded as PDF.`
      );
    }
  }, [records]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Fines & Penalties"
        className="mb-0 lg:mb-0"
        actions={
          <>
            <ActionButton
              tone="outline"
              size="md"
              onClick={() => openSettlementDialog()}
              title="Select fine number to mark as paid or waived"
            >
              <SlidersHorizontal />
              <span>Update Fine Status</span>
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
              <span>Impose Fine</span>
            </ActionButton>
          </>
        }
      />

      {/* KPI Cards */}
      <StatGrid>
        <StatCard
          label="Total Fines Levied"
          value={formatCurrency(totalLevied)}
          icon={AlertCircle}
        />
        <StatCard
          label="Collected & Realized"
          value={formatCurrency(totalCollected)}
          icon={CheckCircle2}
        />
        <StatCard
          label="Outstanding Penalties"
          value={formatCurrency(totalOutstanding)}
          icon={Clock}
        />
        <StatCard
          label="Waived on Merit"
          value={formatCurrency(totalWaived)}
          icon={ShieldAlert}
        />
      </StatGrid>

      {/* Standalone Section Heading & Table Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg">
            Institutional Fines & Violation Ledger
          </h2>
        </div>

        {/* Table Section */}
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={records}
            columns={columns}
            getRowId={(r) => r.id}
            filters={filters}
            searchPlaceholder="Search by student, fine # or roll…"
            searchFn={(r, q) =>
              r.student.toLowerCase().includes(q) ||
              r.fineNumber.toLowerCase().includes(q) ||
              r.rollNo.includes(q)
            }
            pageSize={8}
          />
        </SectionCard>
      </div>

      {/* Fine Status Settlement Dialog (Mark as Paid or Waived Options) */}
      <Dialog open={settlementOpen} onOpenChange={setSettlementOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
          {selectedFine && (
            <>
              <DialogHeader className="gap-1 px-6 py-5">
                <div className="flex items-start justify-between gap-4 pr-8">
                  <div className="min-w-0">
                    <DialogTitle className="text-base font-bold leading-tight text-foreground">
                      Fine Status Resolution
                    </DialogTitle>
                    <DialogDescription className="mt-1 font-mono text-xs text-muted-foreground">
                      Fine Notice {selectedFine.fineNumber} · Due {formatDate(selectedFine.dueDate)}
                    </DialogDescription>
                  </div>
                  <StatusBadge
                    status={
                      selectedFine.status === "Paid"
                        ? "Paid"
                        : selectedFine.status === "Waived"
                        ? "Excused"
                        : "Overdue"
                    }
                  />
                </div>
              </DialogHeader>

              <div className="space-y-4.5 border-t border-border/70 px-6 py-5">
                {/* Fine Number Selector Dropdown */}
                <Field label="Fine Number">
                  <select
                    value={selectedFine.id}
                    onChange={(e) => setSelectedFineId(e.target.value)}
                    className={fieldClass}
                  >
                    {records.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.fineNumber} — {r.student} ({r.className}) · Rs {r.amount.toLocaleString()} [{r.status}]
                      </option>
                    ))}
                  </select>
                </Field>

                {/* Fine Summary Details Card */}
                <div className="rounded-xl border border-border/70 bg-slate-50/70 p-3.5 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-[13px]">
                      {selectedFine.student}
                    </span>
                    <span className="font-mono text-sm font-bold text-foreground">
                      {formatCurrency(selectedFine.amount)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-muted-foreground text-[11.5px]">
                    <span>
                      Roll #{selectedFine.rollNo} · {selectedFine.className} · {selectedFine.campus}
                    </span>
                    <span className="rounded bg-brand-50 px-2 py-0.5 font-semibold text-brand ring-1 ring-brand/15">
                      {selectedFine.fineType}
                    </span>
                  </div>
                </div>

                {/* Status Options: Mark as Paid vs Waived */}
                {selectedFine.status === "Unpaid" ? (
                  <div className="space-y-3.5">
                    <label className="text-xs font-bold text-foreground">
                      Select Settlement Option:
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSettlementOption("paid")}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all cursor-pointer",
                          settlementOption === "paid"
                            ? "border-emerald-500 bg-emerald-50/80 text-emerald-900 shadow-xs ring-1 ring-emerald-500/30"
                            : "border-border/70 bg-white text-muted-foreground hover:bg-slate-50"
                        )}
                      >
                        <CheckCircle2 className="size-5 text-emerald-600" />
                        <span className="text-xs font-bold">Mark as Paid</span>
                        <span className="text-[10px] text-muted-foreground">
                          Record fee payment receipt
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSettlementOption("waived")}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all cursor-pointer",
                          settlementOption === "waived"
                            ? "border-amber-500 bg-amber-50/80 text-amber-900 shadow-xs ring-1 ring-amber-500/30"
                            : "border-border/70 bg-white text-muted-foreground hover:bg-slate-50"
                        )}
                      >
                        <Ban className="size-5 text-amber-600" />
                        <span className="text-xs font-bold">Waive Fine</span>
                        <span className="text-[10px] text-muted-foreground">
                          Excuse penalty on merit
                        </span>
                      </button>
                    </div>

                    {settlementOption === "paid" ? (
                      <div className="space-y-3 rounded-lg border border-emerald-500/25 bg-emerald-50/40 p-3.5">
                        <Field label="Payment Collection Mode">
                          <select
                            value={paidPaymentMethod}
                            onChange={(e) => setPaidPaymentMethod(e.target.value)}
                            className={fieldClass}
                          >
                            <option>Cash Counter</option>
                            <option>Bank Transfer / 1Bill Online</option>
                            <option>Challan Ledger Adjustment</option>
                            <option>Cheque Deposit</option>
                          </select>
                        </Field>
                        <Field label="Receipt / Transaction Ref (Optional)">
                          <input
                            type="text"
                            placeholder="e.g. REC-2610-8421 or Bank Scroll Ref"
                            value={paidReference}
                            onChange={(e) => setPaidReference(e.target.value)}
                            className={fieldClass}
                          />
                        </Field>
                      </div>
                    ) : (
                      <div className="space-y-3 rounded-lg border border-amber-500/25 bg-amber-50/40 p-3.5">
                        <Field label="Reason for Waiver">
                          <select
                            value={waiveReason}
                            onChange={(e) => setWaiveReason(e.target.value)}
                            className={fieldClass}
                          >
                            <option>First-time Offense Exemption</option>
                            <option>Approved by Campus Principal</option>
                            <option>Verified Medical Leave / Hospitalization</option>
                            <option>Administrative Billing Correction</option>
                            <option>Financial Hardship Relief</option>
                          </select>
                        </Field>
                        <Field label="Authorized Authority">
                          <select
                            value={waiveAuthorizedBy}
                            onChange={(e) => setWaiveAuthorizedBy(e.target.value)}
                            className={fieldClass}
                          >
                            <option>Campus Principal</option>
                            <option>Directorate of Finance</option>
                            <option>Proctorial & Discipline Board</option>
                            <option>Central Bursar Office</option>
                          </select>
                        </Field>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-border/70 bg-muted/40 p-3.5 text-xs space-y-2">
                    <div className="flex items-center justify-between font-semibold text-foreground">
                      <span>Fine Resolution Status:</span>
                      <span className="font-bold">
                        {selectedFine.status === "Paid" ? "Paid & Settled" : "Waived & Excused"}
                      </span>
                    </div>
                    {selectedFine.status === "Paid" && selectedFine.paidDate && (
                      <p className="text-muted-foreground text-[11px]">
                        Payment recorded on {formatDate(selectedFine.paidDate)} and credited to fine ledger.
                      </p>
                    )}
                    {selectedFine.status === "Waived" && (
                      <p className="text-muted-foreground text-[11px]">
                        Waived on grounds of: {selectedFine.waivedReason ?? "Principal Approval"} ({selectedFine.waivedBy ?? "Campus Principal"}).
                      </p>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter className="m-0 flex-row items-center justify-end gap-2 rounded-none border-t border-border/70 bg-muted/30 px-6 py-4">
                <ActionButton
                  tone="outline"
                  size="sm"
                  onClick={() => setSettlementOpen(false)}
                >
                  Close
                </ActionButton>

                {selectedFine.status === "Unpaid" ? (
                  settlementOption === "paid" ? (
                    <ActionButton
                      tone="success"
                      size="sm"
                      onClick={handleConfirmPaid}
                    >
                      <Check className="size-3.5" />
                      <span>Confirm Mark as Paid</span>
                    </ActionButton>
                  ) : (
                    <ActionButton
                      tone="danger"
                      size="sm"
                      onClick={handleConfirmWaive}
                    >
                      <Ban className="size-3.5" />
                      <span>Confirm Waive Fine</span>
                    </ActionButton>
                  )
                ) : (
                  <ActionButton
                    tone="outline"
                    size="sm"
                    onClick={() => handleReopenUnpaid(selectedFine.id)}
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Reopen as Unpaid</span>
                  </ActionButton>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Impose Fine Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-brand" />
              <span>Impose Fine Notice</span>
            </DialogTitle>
            <DialogDescription>
              Record an institutional fine penalty or late fee notice against a student account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3.5 py-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Student Name">
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayesha Khan"
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Roll Number">
                <input
                  type="text"
                  placeholder="e.g. 412"
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Violation Category">
                <select
                  value={fineType}
                  onChange={(e) => setFineType(e.target.value as any)}
                  className={fieldClass}
                >
                  <option>Late Fee Submission</option>
                  <option>Library Overdue</option>
                  <option>Disciplinary</option>
                  <option>Lab Breakage</option>
                  <option>ID Card Loss</option>
                  <option>Uniform Infraction</option>
                </select>
              </Field>
              <Field label="Fine Amount (Rs)">
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 1500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Due Date">
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <DialogFooter className="pt-2 flex items-center justify-end gap-2">
              <ActionButton tone="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </ActionButton>
              <ActionButton type="submit" tone="primary">
                <Check />
                <span>Impose Fine Notice</span>
              </ActionButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
