"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { PersonCell } from "@/components/shared/user-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { SectionCard } from "@/components/shared/section-card";
import { AreaTrendChart, DonutChart, DonutLegend } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatCurrencyCompact, formatDate } from "@/lib/format";
import {
  REVENUE_TREND,
  FEE_CHALLANS,
  FEE_STRUCTURES,
  SCHOLARSHIPS,
  EXPENSES,
} from "@/lib/mock/operations";
import type { FeeChallan } from "@/types";

/* ─── Challan Table ─── */

const challanColumns: Column<FeeChallan>[] = [
  {
    key: "challanNumber",
    header: "Challan #",
    cell: (r) => <span className="font-mono text-xs">{r.challanNumber}</span>,
    sortValue: (r) => r.challanNumber,
  },
  {
    key: "student",
    header: "Student",
    cell: (r) => <PersonCell name={r.student} subtitle={r.className} />,
    sortValue: (r) => r.student,
  },
  {
    key: "campus",
    header: "Campus",
    cell: (r) => <span className="text-[13px]">{r.campus}</span>,
  },
  {
    key: "month",
    header: "Month",
    cell: (r) => <span className="text-[13px]">{r.monthYear}</span>,
  },
  {
    key: "dueDate",
    header: "Due Date",
    cell: (r) => (
      <span className="text-[13px] tabular-nums text-muted-foreground">
        {formatDate(r.dueDate)}
      </span>
    ),
    sortValue: (r) => r.dueDate,
  },
  {
    key: "amount",
    header: "Amount",
    cell: (r) => (
      <span className="font-mono text-[13px] font-semibold tabular-nums">
        {formatCurrency(r.totalPayable)}
      </span>
    ),
    sortValue: (r) => r.totalPayable,
    className: "text-right",
    headerClassName: "text-right",
  },
  {
    key: "paid",
    header: "Paid",
    cell: (r) => (
      <span className="font-mono text-[13px] tabular-nums text-muted-foreground">
        {formatCurrency(r.paid)}
      </span>
    ),
    className: "text-right",
    headerClassName: "text-right",
  },
  {
    key: "status",
    header: "Status",
    cell: (r) => <StatusBadge status={r.status} />,
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

/* ─── Expense donut ─── */

const EXPENSE_COLORS = ["#353955", "#c79a3a", "#2f8f6b", "#c8463d", "#3c6fb0", "#c7841f"];
const expenseDonut = EXPENSES.map((e, i) => ({
  name: e.category,
  value: e.value,
  color: EXPENSE_COLORS[i % EXPENSE_COLORS.length],
}));

/* ─── Component ─── */

export function FeesClient() {
  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="challans" className="w-full">
        <TabsList>
          <TabsTrigger value="challans">Challans</TabsTrigger>
          <TabsTrigger value="structures">Structures</TabsTrigger>
          <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
        </TabsList>

        <TabsContent value="challans" className="mt-4">
          <SectionCard flush>
            <DataTable
              data={FEE_CHALLANS}
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
        </TabsContent>

        <TabsContent value="structures" className="mt-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEE_STRUCTURES.map((fs) => {
              const total = fs.feeHeads.reduce((s, h) => s + h.amount, 0);
              return (
                <div
                  key={fs.id}
                  className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{fs.className}</h4>
                    <Badge variant="secondary">{fs.academicYear}</Badge>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Head</TableHead>
                        <TableHead>Freq.</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fs.feeHeads.map((h, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-xs font-medium">
                            {h.headName}
                          </TableCell>
                          <TableCell className="text-xs">{h.frequency}</TableCell>
                          <TableCell className="text-right text-xs">
                            {formatCurrency(h.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-auto flex items-center justify-between border-t pt-2">
                    <span className="font-medium">Monthly Total</span>
                    <span className="font-semibold">{formatCurrency(total)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="scholarships" className="mt-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {SCHOLARSHIPS.map((s) => (
              <div
                key={s.name}
                className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold">{s.name}</h4>
                  <Badge>{s.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{s.rule}</p>
                <div className="mt-auto flex items-center justify-between pt-4 text-sm">
                  <div>
                    <span className="font-medium">{s.beneficiaries}</span>{" "}
                    beneficiaries
                  </div>
                  <div>
                    <span className="font-medium text-success">
                      {formatCurrencyCompact(s.monthlyValue)}
                    </span>{" "}
                    /mo
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Revenue Trend" description="Monthly collection (Rs in millions)">
          <AreaTrendChart
            data={REVENUE_TREND}
            xKey="month"
            series={[
              { key: "collected", label: "Collected", color: "#353955" },
              { key: "expected", label: "Expected", color: "#c79a3a" },
              { key: "expenses", label: "Expenses", color: "#c8463d" },
            ]}
            format="millions"
          />
        </SectionCard>

        <SectionCard title="Expense Breakdown" description="Category-wise distribution (Rs in millions)">
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8">
            <DonutChart
              data={expenseDonut}
              centerValue="Rs 49.3M"
              centerLabel="Total"
              format="compact"
            />
            <DonutLegend data={expenseDonut} format="compact" />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
