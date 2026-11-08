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
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionButton } from "@/components/shared/action-button";
import { Button } from "@/components/ui/button";
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
import { exportFeeConfigurationPdf, printFeeConfigurationReport } from "./fee-configuration-export";
import { readFeeConfiguration, writeFeeConfiguration } from "@/lib/mock/finance-storage";

export function FeeConfigurationClient() {
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
  const [otherCharges, setOtherCharges] = React.useState("0");
  const [annualIncreasePercent, setAnnualIncreasePercent] = React.useState("8.8");
  const [customHeads, setCustomHeads] = React.useState<Array<{ id: string; name: string; amount: string }>>([]);

  React.useEffect(() => {
    setRecords(readFeeConfiguration());
  }, []);

  const updateRecords = (next: FeeRevisionRecord[] | ((current: FeeRevisionRecord[]) => FeeRevisionRecord[])) => {
    setRecords((current) => {
      const updated = typeof next === "function" ? next(current) : next;
      writeFeeConfiguration(updated);
      return updated;
    });
  };

  const customHeadsTotal = customHeads.reduce(
    (acc, h) => acc + (Number(h.amount) || 0),
    0
  );
  const totalCalculated =
    (Number(tuitionFee) || 0) +
    (Number(labCharges) || 0) +
    (Number(sportsCharges) || 0) +
    (Number(libraryFund) || 0) +
    (Number(utilitySurcharge) || 0) +
    (Number(otherCharges) || 0) +
    customHeadsTotal;

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
      setOtherCharges(String(rec.otherCharges ?? 0));
      setAnnualIncreasePercent(rec.percentageChange != null ? String(rec.percentageChange) : "0");
      setCustomHeads(
        rec.customHeads?.map((h) => ({ id: h.id, name: h.name, amount: String(h.amount) })) || []
      );
    } else {
      setEditingRecord(null);
      setClassName("Grade 10 Matriculation");
      setAcademicYear("2026–27");
      setTuitionFee("18500");
      setLabCharges("2500");
      setSportsCharges("1000");
      setLibraryFund("1000");
      setUtilitySurcharge("2200");
      setOtherCharges("0");
      setAnnualIncreasePercent("8.8");
      setCustomHeads([]);
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

    const cleanedCustomHeads = customHeads
      .filter((h) => h.name.trim() !== "")
      .map((h) => ({
        id: h.id || `head-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: h.name.trim(),
        amount: Number(h.amount) || 0,
      }));
    const numOtherCharges = Number(otherCharges) || 0;

    const parsedPercent = Number(annualIncreasePercent) || 0;

    if (editingRecord) {
      updateRecords((list) =>
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
                otherCharges: numOtherCharges,
                customHeads: cleanedCustomHeads,
                totalMonthly: totalCalculated,
                percentageChange: Number(parsedPercent.toFixed(1)),
                status: "Active",
              }
            : item
        )
      );
      toast.success(`Fee structure for ${className} updated and synced with Fee Collection.`);
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
        otherCharges: numOtherCharges,
        customHeads: cleanedCustomHeads,
        totalMonthly: totalCalculated,
        previousMonthly: totalCalculated,
        percentageChange: Number(parsedPercent.toFixed(1)),
        effectiveDate: "2026-08-01",
        status: "Active",
      };
      updateRecords([newRec, ...records]);
      toast.success(`New fee tier for ${className} created and synced with Fee Collection.`);
    }
    setDialogOpen(false);
  };

  const columns: Column<FeeRevisionRecord>[] = [
    {
      key: "class",
      header: "Class",
      headerAlign: "center",
      align: "center",
      className: "w-[24%] text-center",
      headerClassName: "w-[24%] text-center",
      cell: (r) => (
        <span className="font-semibold text-foreground text-[13px]">{r.className}</span>
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
      header: "Annual Increase %",
      align: "center",
      cell: (r) => (
        <span className="font-mono text-xs font-semibold text-brand tabular-nums">
          {r.percentageChange > 0 ? `+${formatPercent(r.percentageChange)}` : formatPercent(r.percentageChange)}
        </span>
      ),
      className: "text-center",
      headerClassName: "text-center whitespace-nowrap",
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
            className="border-amber-200 bg-amber-50/70 text-amber-700 hover:border-amber-400 hover:bg-amber-100 hover:text-amber-800 shadow-2xs"
            onClick={() => openEditor(r)}
          >
            <Edit className="size-3 text-amber-600" />
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
    const ok = printFeeConfigurationReport(records);
    if (ok) {
      toast.info("Opening print preview for Class Fee Master Schedule…");
    }
  }, [records]);

  const handleExportPdf = React.useCallback(() => {
    const ok = exportFeeConfigurationPdf(records);
    if (ok) {
      toast.success(
        `Fee master schedule (${records.length} class tiers) downloaded as PDF.`
      );
    }
  }, [records]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Fee Configuration"
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
            hideSortArrows
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
            <DialogTitle>
              {editingRecord ? `Revise Fee — ${editingRecord.className}` : "Add Class Fee Structure"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Configure monthly fee heads.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3.5 py-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
              <Field label="Annual Increase (%)">
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="e.g. 8.8"
                    value={annualIncreasePercent}
                    onChange={(e) => setAnnualIncreasePercent(e.target.value)}
                    className={`${fieldClass} pr-7 font-mono font-medium`}
                  />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    %
                  </span>
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Tuition Fee (Monthly)">
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 18500"
                  value={tuitionFee}
                  onChange={(e) => setTuitionFee(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Lab Charges">
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 2500"
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
                  placeholder="e.g. 1000"
                  value={sportsCharges}
                  onChange={(e) => setSportsCharges(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Library Fund">
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 1000"
                  value={libraryFund}
                  onChange={(e) => setLibraryFund(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Utility Surcharge">
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 1500"
                  value={utilitySurcharge}
                  onChange={(e) => setUtilitySurcharge(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Other Charges (Misc / Additional)">
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 500"
                  value={otherCharges}
                  onChange={(e) => setOtherCharges(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <div className="flex items-end pb-0.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCustomHeads((prev) => [
                      ...prev,
                      {
                        id: `ch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                        name: "",
                        amount: "",
                      },
                    ])
                  }
                  className="w-full text-xs h-9 border-dashed border-primary/40 text-primary hover:bg-primary/5 gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Custom Fee Head
                </Button>
              </div>
            </div>

            {customHeads.length > 0 && (
              <div className="space-y-2 rounded-md border border-border/70 bg-muted/20 p-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Custom Fee Heads ({customHeads.length})
                  </p>
                  <span className="text-[11px] text-muted-foreground">
                    Subtotal: Rs {customHeadsTotal.toLocaleString()}
                  </span>
                </div>
                <div className="space-y-2">
                  {customHeads.map((head, idx) => (
                    <div key={head.id || idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Fee Head (e.g. Examination / Security)"
                        value={head.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomHeads((prev) =>
                            prev.map((h, i) => (i === idx ? { ...h, name: val } : h))
                          );
                        }}
                        className={`${fieldClass} flex-1`}
                      />
                      <input
                        type="number"
                        min={0}
                        placeholder="Amount"
                        value={head.amount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomHeads((prev) =>
                            prev.map((h, i) => (i === idx ? { ...h, amount: val } : h))
                          );
                        }}
                        className={`${fieldClass} w-28`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setCustomHeads((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        title="Remove head"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Calculation Preview Banner */}
            <div className="rounded-[4px] border border-brand/20 bg-brand-50/50 p-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-muted-foreground font-medium">Computed Total Monthly Fee:</span>
                <p className="font-heading text-base font-bold text-brand mt-0.5">
                  {formatCurrency(totalCalculated)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand font-mono">
                  +{Number(annualIncreasePercent || 0).toFixed(1)}% Annual Increase
                </span>
                <span className="rounded bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                  AY {academicYear}
                </span>
              </div>
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
