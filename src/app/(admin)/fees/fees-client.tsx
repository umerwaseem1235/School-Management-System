"use client";

import * as React from "react";
import { Download, Plus, Printer, Wallet, CreditCard, TrendingUp, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { SectionCard } from "@/components/shared/section-card";
import { ActionButton } from "@/components/shared/action-button";
import { formatCurrency, formatCurrencyCompact, formatDate, formatNumber } from "@/lib/format";
import { FEE_CHALLANS } from "@/lib/mock/operations";
import type { FeeChallan } from "@/types";
import { exportFeeChallansPdf, printFeeReport } from "./fee-export";
import { AddFeeDialog } from "./add-fee-dialog";

/* ─── Challan Table ─── */

const challanColumns: Column<FeeChallan>[] = [
  {
    key: "challanNumber",
    header: "Challan #",
    align: "center",
    cell: (r) => <span className="font-mono text-xs">{r.challanNumber}</span>,
    className: "text-center",
    headerClassName: "text-center",
  },
  {
    key: "student",
    header: "Student",
    align: "center",
    cell: (r) => (
      <div className="min-w-0 text-center">
        <p className="truncate font-medium text-foreground">{r.student}</p>
        <p className="truncate text-xs text-muted-foreground">{r.className}</p>
      </div>
    ),
    className: "text-center",
    headerClassName: "text-center",
  },
  {
    key: "campus",
    header: "Campus",
    align: "center",
    cell: (r) => <span className="text-[13px]">{r.campus}</span>,
    className: "text-center",
    headerClassName: "text-center",
  },
  {
    key: "month",
    header: "Month",
    align: "center",
    cell: (r) => <span className="text-[13px]">{r.monthYear}</span>,
    className: "text-center",
    headerClassName: "text-center",
  },
  {
    key: "dueDate",
    header: "Due Date",
    align: "center",
    cell: (r) => (
      <span className="text-[13px] tabular-nums text-muted-foreground">
        {formatDate(r.dueDate)}
      </span>
    ),
    className: "text-center",
    headerClassName: "text-center",
  },
  {
    key: "amount",
    header: "Amount Due",
    align: "center",
    cell: (r) => (
      <span className="font-mono text-[13px] font-semibold tabular-nums">
        {formatCurrency(r.totalPayable)}
      </span>
    ),
    className: "text-center",
    headerClassName: "text-center",
  },
  {
    key: "paid",
    header: "Paid",
    align: "center",
    cell: (r) => (
      <span className="font-mono text-[13px] tabular-nums text-muted-foreground">
        {formatCurrency(r.paid)}
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
        <StatusBadge status={r.status} />
      </div>
    ),
    className: "text-center",
    headerClassName: "text-center",
  },
];

const challanCampuses = [...new Set(FEE_CHALLANS.map((c) => c.campus))];

const challanFilters: FilterDef<FeeChallan>[] = [
  {
    key: "status",
    label: "Status",
    options: ["Paid", "Unpaid", "Partial", "Overdue"],
    getValue: (r) => r.status,
  },
  {
    key: "campus",
    label: "Campus",
    options: challanCampuses,
    getValue: (r) => r.campus,
  },
];

/* ─── Component ─── */

export function FeesClient() {
  const [challans, setChallans] = React.useState<FeeChallan[]>(FEE_CHALLANS);
  const [addOpen, setAddOpen] = React.useState(false);

  const totalRevenue = 15_420_000;
  const outstanding = 2_100_000;
  const collectionRate = 94.2;
  const totalStudents = 5_662;
  const paidStudents = Math.round((totalStudents * collectionRate) / 100); // 5,334

  const handleCreate = React.useCallback((challan: FeeChallan) => {
    setChallans((prev) => [challan, ...prev]);
    toast.success(
      `Fee detail added for ${challan.student} (${challan.challanNumber}).`
    );
  }, []);

  const handlePrint = () => {
    const ok = printFeeReport({ challans });
    if (ok) {
      toast.info("Opening print preview for Fee Challans…");
    }
  };

  const handleExportPdf = () => {
    const ok = exportFeeChallansPdf(challans);
    if (ok) {
      toast.success(
        `Fee Challans register (${challans.length} challans) downloaded as PDF.`
      );
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Fees & Financial Management"
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
              onClick={() => setAddOpen(true)}
            >
              <Plus />
              <span>Add Fee Detail</span>
            </ActionButton>
          </>
        }
      />

      <StatGrid>
        <StatCard
          label="Total Revenue (Oct)"
          value={formatCurrencyCompact(totalRevenue)}
          icon={Wallet}
        />
        <StatCard
          label="Outstanding Dues"
          value={formatCurrencyCompact(outstanding)}
          icon={CreditCard}
        />
        <StatCard
          label="Collection Rate"
          value={`${collectionRate}%`}
          icon={TrendingUp}
        />
        <StatCard
          label="Paid Students"
          title={`${formatNumber(paidStudents)} / ${formatNumber(totalStudents)}`}
          value={
            <span className="inline-flex items-baseline justify-center gap-1">
              <span className="font-bold text-foreground">
                {formatNumber(paidStudents)}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                / {formatNumber(totalStudents)}
              </span>
            </span>
          }
          icon={UserCheck}
        />
      </StatGrid>

      {/* Standalone Section Heading & Table Card */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg">
            Fee Challans & Collection Register
          </h2>
        </div>

        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={challans}
            columns={challanColumns}
            getRowId={(r) => r.id}
            filters={challanFilters}
            searchPlaceholder="Search challans or students…"
            searchFn={(r, q) =>
              r.student.toLowerCase().includes(q) ||
              r.challanNumber.toLowerCase().includes(q)
            }
            pageSize={8}
          />
        </SectionCard>
      </div>

      <AddFeeDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        existing={challans}
        onCreate={handleCreate}
      />
    </div>
  );
}
