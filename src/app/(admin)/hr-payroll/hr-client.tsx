"use client";

import { DataTable, type Column, type FilterDef } from "@/components/shared/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonCell } from "@/components/shared/user-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { BarSeriesChart } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/shared/section-card";
import { formatCurrency, formatCurrencyCompact, formatDate, formatCampusDisplay } from "@/lib/format";
import { EMPLOYEES, PAYROLL_RUNS, LEAVE_REQUESTS, DEPARTMENT_HEADCOUNT } from "@/lib/mock/operations";
import type { Employee, LeaveRequest } from "@/types";
import { Check, Download, FileText, Users, DollarSign, Calendar, X } from "lucide-react";

/* ─── Employee columns ─── */

const empColumns: Column<Employee>[] = [
  { key: "employee", header: "Employee", cell: (r) => <PersonCell name={r.name} subtitle={r.empCode} showAvatar={false} />, sortValue: (r) => r.name },
  { key: "designation", header: "Designation", cell: (r) => <span className="text-[13px]">{r.designation}</span>, sortValue: (r) => r.designation },
  { key: "department", header: "Department", cell: (r) => <span className="text-[13px]">{r.department}</span> },
  {
    key: "campus",
    header: "Campus",
    cell: (r) => {
      const info = formatCampusDisplay(r.campus);
      return (
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] font-medium text-foreground">{info.primary}</span>
          {info.secondary && (
            <span className="text-[11px] text-muted-foreground">{info.secondary}</span>
          )}
        </div>
      );
    },
    sortValue: (r) => r.campus,
  },
  { key: "type", header: "Type", cell: (r) => <Badge variant={r.type === "Teaching" ? "default" : "secondary"}>{r.type}</Badge> },
  { key: "joining", header: "Joined", cell: (r) => <span className="text-[13px] tabular-nums text-muted-foreground">{formatDate(r.joiningDate)}</span> },
  { key: "salary", header: "Salary", cell: (r) => <span className="font-mono text-[13px] font-semibold tabular-nums">{formatCurrency(r.basicSalary)}</span>, sortValue: (r) => r.basicSalary, className: "text-right", headerClassName: "text-right" },
  { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
];

const empDepts = [...new Set(EMPLOYEES.map((e) => e.department))];
const empCampuses = [...new Set(EMPLOYEES.map((e) => e.campus))].map((c) => ({
  value: c,
  label: formatCampusDisplay(c).label,
}));

const empFilters: FilterDef<Employee>[] = [
  { key: "department", label: "Department", allLabel: "All Departments", options: empDepts, getValue: (r) => r.department },
  {
    key: "campus",
    label: "Campus",
    allLabel: "All Campuses",
    options: empCampuses,
    triggerClassName: "min-w-48 sm:min-w-52",
    getValue: (r) => r.campus,
  },
  { key: "type", label: "Type", allLabel: "All Types", options: ["Teaching", "Non-Teaching"], getValue: (r) => r.type },
  { key: "status", label: "Status", allLabel: "All Statuses", options: ["Active", "Inactive", "Suspended", "Pending"], getValue: (r) => r.status },
];

/* ─── Leave columns ─── */

const leaveColumns: Column<LeaveRequest>[] = [
  { key: "applicant", header: "Applicant", cell: (r) => <PersonCell name={r.applicant} subtitle={r.applicantType} />, sortValue: (r) => r.applicant },
  { key: "type", header: "Type", cell: (r) => <Badge variant={r.leaveType === "Medical" || r.leaveType === "Emergency" ? "destructive" : "secondary"}>{r.leaveType}</Badge> },
  { key: "dates", header: "Dates", cell: (r) => <span className="text-[13px] tabular-nums text-muted-foreground">{formatDate(r.startDate)} — {formatDate(r.endDate)}</span> },
  { key: "days", header: "Days", cell: (r) => <span className="font-semibold">{r.days}</span>, sortValue: (r) => r.days, className: "text-center", headerClassName: "text-center" },
  { key: "reason", header: "Reason", cell: (r) => <span className="max-w-[200px] truncate text-[13px] text-muted-foreground">{r.reason}</span> },
  { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
  {
    key: "actions",
    header: "",
    cell: (r) =>
      r.status === "Pending" ? (
        <div className="flex gap-1">
          <Button size="icon-xs" variant="outline" className="h-6 w-6 border-emerald-200 bg-emerald-50/70 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100 shadow-2xs"><Check className="size-3 text-emerald-600" /></Button>
          <Button size="icon-xs" variant="outline" className="h-6 w-6 border-rose-200 bg-rose-50/70 text-rose-700 hover:border-rose-400 hover:bg-rose-100 shadow-2xs"><X className="size-3 text-rose-600" /></Button>
        </div>
      ) : null,
    className: "w-20",
  },
];

/* ─── Component ─── */

export function HRClient() {
  return (
    <Tabs defaultValue="employees">
      <TabsList className="mb-6">
        <TabsTrigger value="employees"><Users className="size-4" data-icon="inline-start" /> Employees</TabsTrigger>
        <TabsTrigger value="payroll"><DollarSign className="size-4" data-icon="inline-start" /> Payroll</TabsTrigger>
        <TabsTrigger value="leaves"><Calendar className="size-4" data-icon="inline-start" /> Leave Requests</TabsTrigger>
      </TabsList>

      <TabsContent value="employees">
        <SectionCard
          title="Employee Directory"
          description={`${EMPLOYEES.length} employees`}
          flush
        >
          <DataTable
            data={EMPLOYEES}
            columns={empColumns}
            getRowId={(r) => r.id}
            searchPlaceholder="Search by name or code…"
            searchFn={(r, q) => r.name.toLowerCase().includes(q) || r.empCode.toLowerCase().includes(q)}
            filters={empFilters}
            pageSize={6}
          />
        </SectionCard>
      </TabsContent>

      <TabsContent value="payroll">
        <div className="space-y-6">
          <SectionCard title="Payroll History" description="Monthly payroll runs">
            <div className="space-y-3">
              {PAYROLL_RUNS.map((p) => (
                <div key={p.id} className="flex flex-col gap-3 rounded-xl border border-border/60 bg-cream/40 p-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-to-b from-[#7c4424] via-[#5c3118] to-[#381e0f] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_10px_-2px_rgba(9,29,62,0.35)] ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105"><FileText className="size-4" /></span>
                    <div>
                      <p className="font-semibold text-foreground">{p.monthYear}</p>
                      <p className="text-xs text-muted-foreground">{p.employees} employees</p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-wrap items-center gap-4 sm:justify-end">
                    {p.gross > 0 && (
                      <>
                        <div className="text-right"><p className="text-[11px] text-muted-foreground">Gross</p><p className="font-mono text-sm font-semibold tabular-nums">{formatCurrencyCompact(p.gross)}</p></div>
                        <div className="text-right"><p className="text-[11px] text-muted-foreground">Deductions</p><p className="font-mono text-sm tabular-nums text-danger">{formatCurrencyCompact(p.deductions)}</p></div>
                        <div className="text-right"><p className="text-[11px] text-muted-foreground">Net</p><p className="font-mono text-sm font-bold tabular-nums text-success">{formatCurrencyCompact(p.net)}</p></div>
                      </>
                    )}
                    <StatusBadge status={p.status} />
                    {p.status === "Disbursed" && (
                      <Button variant="outline" size="icon-sm" className="h-7 w-7 border-indigo-200 bg-indigo-50/70 text-indigo-700 hover:border-indigo-400 hover:bg-indigo-100 shadow-2xs"><Download className="size-3.5 text-indigo-600" /></Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Department Headcount" description="Teaching vs Non-Teaching staff per department">
            <BarSeriesChart
              data={DEPARTMENT_HEADCOUNT}
              xKey="department"
              series={[
                { key: "teaching", label: "Teaching", color: "#6e3b1f" },
                { key: "nonTeaching", label: "Non-Teaching", color: "#0ea5e9" },
              ]}
              stacked
              showLegend
            />
          </SectionCard>
        </div>
      </TabsContent>

      <TabsContent value="leaves">
        <SectionCard
          title="Leave Requests"
          description={`${LEAVE_REQUESTS.filter((l) => l.status === "Pending").length} pending approval`}
          flush
        >
          <DataTable
            data={LEAVE_REQUESTS}
            columns={leaveColumns}
            getRowId={(r) => r.id}
            searchPlaceholder="Search by applicant…"
            searchFn={(r, q) => r.applicant.toLowerCase().includes(q)}
            pageSize={8}
          />
        </SectionCard>
      </TabsContent>
    </Tabs>
  );
}
