"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  Printer,
  Download,
  FileSpreadsheet,
  FileText,
  Building2,
  Calendar,
  CreditCard,
  Briefcase,
  ShieldCheck,
  Percent,
} from "lucide-react";
import type { YearlyTeacherSalarySummary } from "@/lib/mock/teacher-salary";
import {
  printIndividualTeacherAnnualStatement,
  exportTeacherSalaryPdf,
  exportIndividualTeacherCsv,
} from "./teacher-salary-export";

interface TeacherSalaryModalProps {
  summary: YearlyTeacherSalarySummary | null;
  periodLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenTaxCert?: (summary: YearlyTeacherSalarySummary) => void;
}

export function TeacherSalaryModal({
  summary,
  periodLabel,
  open,
  onOpenChange,
  onOpenTaxCert,
}: TeacherSalaryModalProps) {
  if (!summary) return null;
  const t = summary.teacher;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0 gap-0 border-border/80">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <UserAvatar
                name={t.name}
                className="size-14 text-lg border-2 border-white/20 bg-white/10 text-white font-bold"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold font-heading">{t.name}</h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/15 text-blue-100">
                    {t.empCode}
                  </span>
                  <StatusBadge
                    status={summary.overallStatus}
                    tone={summary.overallStatus === "Fully Disbursed" ? "success" : "warning"}
                    className="capitalize"
                  />
                </div>
                <p className="text-sm text-blue-200 mt-1">
                  {t.designation} &middot; {t.department} &middot; {t.campus}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/15 hover:bg-white/25 text-white border-0 shadow-sm"
                onClick={() => printIndividualTeacherAnnualStatement(summary, periodLabel)}
              >
                <Printer className="size-4 mr-1.5" />
                Print Statement
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/15 hover:bg-white/25 text-white border-0 shadow-sm"
                onClick={() => exportTeacherSalaryPdf(summary, periodLabel)}
              >
                <Download className="size-4 mr-1.5" />
                PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Bio & Banking strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50 dark:bg-muted/40 border-b border-border text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Academic Grade</span>
            <span className="font-semibold text-foreground">{t.gradeTier}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">CNIC &amp; NTN</span>
            <span className="font-mono font-medium text-foreground">{t.cnic} | {t.ntn}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Remuneration Bank</span>
            <span className="font-semibold text-foreground">{t.bankName}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Account / IBAN</span>
            <span className="font-mono text-foreground text-[11px] truncate block">{t.iban}</span>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-5 border-b border-border">
          <div className="rounded-lg border border-border p-3 bg-card shadow-xs">
            <span className="text-[11px] text-muted-foreground block">Annual Gross</span>
            <span className="text-base font-bold text-foreground font-mono">
              {formatCurrency(summary.annualGrossSalary)}
            </span>
          </div>
          <div className="rounded-lg border border-border p-3 bg-card shadow-xs">
            <span className="text-[11px] text-muted-foreground block">Annual Basic</span>
            <span className="text-base font-bold text-foreground font-mono">
              {formatCurrency(summary.annualBaseSalary)}
            </span>
          </div>
          <div className="rounded-lg border border-border p-3 bg-card shadow-xs">
            <span className="text-[11px] text-muted-foreground block">Tax Withheld (WHT)</span>
            <span className="text-base font-bold text-red-600 dark:text-red-400 font-mono">
              -{formatCurrency(summary.annualTaxDeducted)}
            </span>
          </div>
          <div className="rounded-lg border border-border p-3 bg-card shadow-xs">
            <span className="text-[11px] text-muted-foreground block">PF &amp; Deductions</span>
            <span className="text-base font-bold text-red-600 dark:text-red-400 font-mono">
              -{formatCurrency(summary.annualTotalDeductions - summary.annualTaxDeducted)}
            </span>
          </div>
          <div className="rounded-lg border border-emerald-500/30 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block font-medium">
              Annual Net Disbursed
            </span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatCurrency(summary.annualNetDisbursed)}
            </span>
          </div>
        </div>

        {/* 12-Month Table */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Calendar className="size-4 text-blue-600" />
              12-Month Compensation &amp; Deductions Breakdown ({periodLabel})
            </h3>
            <span className="text-xs text-muted-foreground">
              {summary.monthsPaidCount} of 12 Months Disbursed
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/70 text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2.5 px-3 text-left font-semibold">Month</th>
                  <th className="py-2.5 px-3 text-left font-semibold">Voucher #</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Basic Pay</th>
                  <th className="py-2.5 px-3 text-right font-semibold">HRA</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Allowances</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Gross Pay</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Tax (WHT)</th>
                  <th className="py-2.5 px-3 text-right font-semibold">PF &amp; EOBI</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Total Ded.</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Net Pay</th>
                  <th className="py-2.5 px-3 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summary.monthlyRecords.map((m, idx) => (
                  <tr key={m.monthKey} className={idx % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                    <td className="py-2 px-3 font-medium text-foreground">{m.monthShort} {summary.year}</td>
                    <td className="py-2 px-3 font-mono text-[11px] text-muted-foreground">{m.voucherNo}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatCurrency(m.baseSalary)}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatCurrency(m.houseRentAllowance)}</td>
                    <td className="py-2 px-3 text-right font-mono">
                      {formatCurrency(m.medicalAllowance + m.conveyanceAllowance + m.specialAllowance)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-foreground">
                      {formatCurrency(m.grossSalary)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-red-600 dark:text-red-400">
                      -{formatCurrency(m.taxDeduction)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-red-600 dark:text-red-400">
                      -{formatCurrency(m.providentFund + m.eobi)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-red-600 dark:text-red-400">
                      -{formatCurrency(m.totalDeductions)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(m.netSalary)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          m.status === "Disbursed"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : m.status === "Pending"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {/* Grand totals row */}
                <tr className="bg-slate-100 dark:bg-muted font-bold border-t-2 border-border text-foreground">
                  <td colSpan={2} className="py-2.5 px-3">ANNUAL GRAND TOTALS</td>
                  <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(summary.annualBaseSalary)}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(summary.annualHra)}</td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {formatCurrency(summary.annualMedical + summary.annualConveyance + summary.annualSpecial)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-blue-900 dark:text-blue-300">
                    {formatCurrency(summary.annualGrossSalary)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-red-600 dark:text-red-400">
                    -{formatCurrency(summary.annualTaxDeducted)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-red-600 dark:text-red-400">
                    -{formatCurrency(summary.annualProvidentFund + summary.annualEobi)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-red-600 dark:text-red-400">
                    -{formatCurrency(summary.annualTotalDeductions)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatCurrency(summary.annualNetDisbursed)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {summary.monthsPaidCount}/12
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer actions */}
        <DialogFooter className="p-4 bg-muted/30 border-t border-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onOpenTaxCert && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  onOpenChange(false);
                  onOpenTaxCert(summary);
                }}
              >
                <ShieldCheck className="size-4 mr-1.5 text-blue-600" />
                View Annual Tax Certificate
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => exportIndividualTeacherCsv(summary)}
            >
              <FileSpreadsheet className="size-4 mr-1.5 text-emerald-600" />
              Export CSV
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => printIndividualTeacherAnnualStatement(summary, periodLabel)}
            >
              <Printer className="size-4 mr-1.5" />
              Print Official Statement
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
