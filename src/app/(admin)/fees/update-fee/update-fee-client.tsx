"use client";

import * as React from "react";
import {
  SlidersHorizontal,
  TrendingUp,
  Layers,
  Calendar,
  Printer,
  Download,
  Plus,
  Check,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionButton } from "@/components/shared/action-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, fieldClass } from "../../attendance/_components/attendance-kit";
import { formatCurrency, formatPercent } from "@/lib/format";
import { FEE_REVISIONS, type FeeRevisionRecord } from "@/lib/mock/finance";
import { exportFeeRevisionsPdf, printFeeRevisionsReport } from "./update-fee-export";

export function UpdateFeeClient() {
  const [records, setRecords] = React.useState<FeeRevisionRecord[]>(FEE_REVISIONS);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingRecord, setEditingRecord] = React.useState<FeeRevisionRecord | null>(null);

  // Form states
  const [className, setClassName] = React.useState("");
  const [academicYear, setAcademicYear] = React.useState("2026–27");
  const [tuitionFee, setTuitionFee] = React.useState("16000");
  const [labCharges, setLabCharges] = React.useState("2000");
  const [sportsCharges, setSportsCharges] = React.useState("1000");
  const [libraryFund, setLibraryFund] = React.useState("800");
  const [utilitySurcharge, setUtilitySurcharge] = React.useState("2000");

  const totalCalculated =
    (Number(tuitionFee) || 0) +
    (Number(labCharges) || 0) +
    (Number(sportsCharges) || 0) +
    (Number(libraryFund) || 0) +
    (Number(utilitySurcharge) || 0);

  const openEditor = (rec?: FeeRevisionRecord) => {
    if (rec) {
      setEditingRecord(rec);
      setClassName(rec.className);
      setAcademicYear(rec.academicYear);
      setTuitionFee(String(rec.tuitionFee));
      setLabCharges(String(rec.labCharges));
      setSportsCharges(String(rec.sportsCharges));
      setLibraryFund(String(rec.libraryFund));
      setUtilitySurcharge(String(rec.utilitySurcharge));
    } else {
      setEditingRecord(null);
      setClassName("Grade 10 Matriculation");
      setAcademicYear("2026–27");
      setTuitionFee("18500");
      setLabCharges("2500");
      setSportsCharges("1000");
      setLibraryFund("1000");
      setUtilitySurcharge("2200");
    }
    setDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const t = Number(tuitionFee) || 0;
    if (!className.trim()) {
      toast.error("Please specify class or tier name.");
      return;
    }
    if (t <= 0) {
      toast.error("Tuition fee must be greater than zero.");
      return;
    }

    if (editingRecord) {
      const prev = editingRecord.previousMonthly || editingRecord.totalMonthly;
      const pct = prev > 0 ? ((totalCalculated - prev) / prev) * 100 : 0;
      setRecords((list) =>
        list.map((item) =>
          item.id === editingRecord.id
            ? {
                ...item,
                className,
                academicYear,
                tuitionFee: t,
                labCharges: Number(labCharges) || 0,
                sportsCharges: Number(sportsCharges) || 0,
                libraryFund: Number(libraryFund) || 0,
                utilitySurcharge: Number(utilitySurcharge) || 0,
                totalMonthly: totalCalculated,
                percentageChange: Number(pct.toFixed(1)),
                status: "Active",
              }
            : item
        )
      );
      toast.success(`Fee structure for ${className} updated successfully.`);
    } else {
      const newRec: FeeRevisionRecord = {
        id: `rev-${Date.now()}`,
        className,
        academicYear,
        tuitionFee: t,
        labCharges: Number(labCharges) || 0,
        sportsCharges: Number(sportsCharges) || 0,
        libraryFund: Number(libraryFund) || 0,
        utilitySurcharge: Number(utilitySurcharge) || 0,
        totalMonthly: totalCalculated,
        previousMonthly: totalCalculated,
        percentageChange: 0,
        effectiveDate: "2026-08-01",
        status: "Active",
      };
      setRecords([newRec, ...records]);
      toast.success(`New fee tier for ${className} created.`);
    }
    setDialogOpen(false);
  };

  const columns: Column<FeeRevisionRecord>[] = [
    {
      key: "class",
      header: "Class / Tier",
      headerAlign: "center",
      align: "left",
      className: "w-[24%]",
      headerClassName: "w-[24%] text-center",
      cell: (r) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-foreground text-xs">{r.className}</p>
          <p className="text-[11px] text-muted-foreground">Session: {r.academicYear}</p>
        </div>
      ),
    },
    {
      key: "tuition",
      header: "Tuition Fee",
      align: "center",
      cell: (r) => (
        <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
          {formatCurrency(r.tuitionFee)}
        </span>
      ),
      className: "text-center",
      headerClassName: "text-center",
    },
    {
      key: "lab",
      header: "Lab Charges",
      align: "center",
      cell: (r) => (
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {formatCurrency(r.labCharges)}
        </span>
      ),
      className: "text-center",
      headerClassName: "text-center",
    },
    {
      key: "utilities",
      header: "Utilities & Sports",
      align: "center",
      cell: (r) => (
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {formatCurrency(r.utilitySurcharge + r.sportsCharges)}
        </span>
      ),
      className: "text-center",
      headerClassName: "text-center",
    },
    {
      key: "totalMonthly",
      header: "Monthly Total",
      align: "center",
      cell: (r) => (
        <span className="font-mono text-xs font-bold text-foreground tabular-nums">
          {formatCurrency(r.totalMonthly)}
        </span>
      ),
      className: "text-center",
      headerClassName: "text-center",
    },
    {
      key: "percentageChange",
      header: "Revision %",
      align: "center",
      cell: (r) => (
        <span className="font-mono text-xs font-semibold text-brand tabular-nums">
          +{formatPercent(r.percentageChange)}
        </span>
      ),
      className: "text-center",
      headerClassName: "text-center",
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      cell: (r) => (
        <div className="flex justify-center">
          <StatusBadge
            status={
              r.status === "Active"
                ? "Active"
                : r.status === "Under Review"
                ? "Pending"
                : "Inactive"
            }
          />
        </div>
      ),
      className: "text-center",
      headerClassName: "text-center",
    },
    {
      key: "action",
      header: "Action",
      align: "center",
      cell: (r) => (
        <div className="flex justify-center">
          <ActionButton
            tone="outline"
            size="xs"
            onClick={() => openEditor(r)}
          >
            <Edit />
            <span>Revise</span>
          </ActionButton>
        </div>
      ),
      className: "text-center",
      headerClassName: "text-center",
    },
  ];

  const avgRevision =
    records.reduce((s, r) => s + r.percentageChange, 0) / (records.length || 1);

  const handlePrint = React.useCallback(() => {
    const ok = printFeeRevisionsReport(records);
    if (ok) {
      toast.info("Opening print preview for Class Fee Master Schedule…");
    }
  }, [records]);

  const handleExportPdf = React.useCallback(() => {
    const ok = exportFeeRevisionsPdf(records);
    if (ok) {
      toast.success(
        `Fee master schedule (${records.length} class tiers) downloaded as PDF.`
      );
    }
  }, [records]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Update Fee & Revisions"
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
              onClick={() => openEditor()}
            >
              <Plus />
              <span>Add Class Structure</span>
            </ActionButton>
          </>
        }
      />

      {/* KPI Cards */}
      <StatGrid>
        <StatCard
          label="Active Fee Tiers"
          value={`${records.length} Classes`}
          icon={Layers}
        />
        <StatCard
          label="Average Annual Escalation"
          value={`+${avgRevision.toFixed(1)}%`}
          icon={TrendingUp}
        />
        <StatCard
          label="Scheduled Academic Year"
          value="AY 2026–27"
          icon={Calendar}
        />
        <StatCard
          label="Governance Approval"
          value="100% Board Ratified"
          icon={SlidersHorizontal}
        />
      </StatGrid>

      {/* Standalone Section Heading & DataTable */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg">
            Class-wise Fee Head Master Schedule
          </h2>
        </div>

        {/* DataTable */}
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={records}
            columns={columns}
            getRowId={(r) => r.id}
            searchPlaceholder="Search tier or academic year…"
            searchFn={(r, q) =>
              r.className.toLowerCase().includes(q) ||
              r.academicYear.toLowerCase().includes(q)
            }
            pageSize={8}
          />
        </SectionCard>
      </div>

      {/* Fee Editor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-brand" />
              <span>{editingRecord ? `Revise Fee — ${editingRecord.className}` : "Add Class Fee Structure"}</span>
            </DialogTitle>
            <DialogDescription>
              Configure monthly fee heads and review the resulting total calculation before ratifying.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3.5 py-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Class / Tier Name">
                <input
                  type="text"
                  required
                  placeholder="e.g. Middle School (Grades 6-8)"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Academic Session">
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className={fieldClass}
                >
                  <option>2026–27</option>
                  <option>2027–28</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Tuition Fee (Monthly)">
                <input
                  type="number"
                  required
                  min={1}
                  value={tuitionFee}
                  onChange={(e) => setTuitionFee(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Lab Charges">
                <input
                  type="number"
                  min={0}
                  value={labCharges}
                  onChange={(e) => setLabCharges(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Sports & Gym">
                <input
                  type="number"
                  min={0}
                  value={sportsCharges}
                  onChange={(e) => setSportsCharges(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Library Fund">
                <input
                  type="number"
                  min={0}
                  value={libraryFund}
                  onChange={(e) => setLibraryFund(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Utility Surcharge">
                <input
                  type="number"
                  min={0}
                  value={utilitySurcharge}
                  onChange={(e) => setUtilitySurcharge(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            {/* Live Calculation Preview Banner */}
            <div className="rounded-[4px] border border-brand/20 bg-brand-50/50 p-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-muted-foreground font-medium">Computed Total Monthly Fee:</span>
                <p className="font-heading text-base font-bold text-brand mt-0.5">
                  {formatCurrency(totalCalculated)}
                </p>
              </div>
              <span className="rounded bg-brand/10 px-2 py-1 text-[11px] font-semibold text-brand">
                Ratified AY 2026–27
              </span>
            </div>

            <DialogFooter className="pt-2 flex items-center justify-end gap-2">
              <ActionButton tone="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </ActionButton>
              <ActionButton type="submit" tone="primary">
                <Check />
                Save Revision
              </ActionButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
