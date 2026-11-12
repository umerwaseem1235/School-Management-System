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
import { formatCurrency } from "@/lib/format";
import { Printer, ShieldCheck, Download, Building, UserCheck } from "lucide-react";
import type { YearlyTeacherSalarySummary } from "@/lib/mock/teacher-salary";
import { printTeacherAnnualTaxCertificate } from "./teacher-salary-export";

interface TaxCertificateModalProps {
  summary: YearlyTeacherSalarySummary | null;
  periodLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaxCertificateModal({
  summary,
  periodLabel,
  open,
  onOpenChange,
}: TaxCertificateModalProps) {
  if (!summary) return null;
  const t = summary.teacher;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-border">
        {/* Certificate preview header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                FBR Annual Tax Withholding Certificate (Form 149)
              </h2>
              <p className="text-xs text-slate-400">
                Rule 42 / Section 149 Income Tax Ordinance, 2001 &middot; Ref: {summary.taxCertificateRef}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => printTeacherAnnualTaxCertificate(summary, periodLabel)}
          >
            <Printer className="size-4 mr-1.5" />
            Print Certificate
          </Button>
        </div>

        {/* Certificate Body Container styled like formal parchment/tax sheet */}
        <div className="p-6 bg-slate-50 dark:bg-muted/20">
          <div className="bg-white dark:bg-card border-2 border-slate-300 dark:border-border rounded-lg p-6 shadow-sm">
            {/* Header branding */}
            <div className="text-center border-b border-border pb-4 mb-4">
              <span className="text-[11px] font-bold tracking-wider text-blue-800 dark:text-blue-400 uppercase">
                Edusphere Academy of Excellence
              </span>
              <h3 className="text-lg font-bold font-serif text-foreground mt-0.5">
                Certificate of Deduction of Income Tax at Source
              </h3>
              <p className="text-xs text-muted-foreground">
                Issued in compliance with Section 149 of the Income Tax Ordinance, 2001
              </p>
              <div className="mt-2 inline-block px-3 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
                Tax Year {summary.year} &middot; Serial #{summary.taxCertificateRef}
              </div>
            </div>

            {/* Parties Details */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-5">
              <div className="border border-border rounded p-3 bg-muted/30">
                <span className="font-bold text-blue-900 dark:text-blue-300 block border-b border-border pb-1 mb-2">
                  Withholding Agent (Employer)
                </span>
                <div className="space-y-1 text-muted-foreground">
                  <div>Name: <span className="font-medium text-foreground">Edusphere Educational Trust</span></div>
                  <div>NTN / FTN: <span className="font-mono font-medium text-foreground">4192083-7</span></div>
                  <div>Tax Office: <span className="font-medium text-foreground">Regional Tax Office (RTO)</span></div>
                  <div>Campus: <span className="font-medium text-foreground">{t.campus}</span></div>
                </div>
              </div>

              <div className="border border-border rounded p-3 bg-muted/30">
                <span className="font-bold text-blue-900 dark:text-blue-300 block border-b border-border pb-1 mb-2">
                  Taxpayer / Faculty Member
                </span>
                <div className="space-y-1 text-muted-foreground">
                  <div>Name: <span className="font-semibold text-foreground">{t.name}</span></div>
                  <div>Employee Code: <span className="font-mono font-medium text-foreground">{t.empCode}</span></div>
                  <div>CNIC Number: <span className="font-mono font-medium text-foreground">{t.cnic}</span></div>
                  <div>NTN Number: <span className="font-mono font-medium text-foreground">{t.ntn}</span></div>
                </div>
              </div>
            </div>

            {/* Tax Computation Table */}
            <div className="border border-border rounded overflow-hidden mb-5 text-xs">
              <table className="w-full">
                <thead className="bg-muted text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-2 px-3 text-left font-semibold">Particulars of Annual Remuneration</th>
                    <th className="py-2 px-3 text-right font-semibold">Section</th>
                    <th className="py-2 px-3 text-right font-semibold">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2 px-3 text-foreground">Gross Annual Salary &amp; Emoluments Disbursed</td>
                    <td className="py-2 px-3 text-right text-muted-foreground font-mono">Sec 12 / 149</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-foreground">
                      {formatCurrency(summary.annualGrossSalary)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-foreground">
                      Less: Tax Exempt Medical Allowance (Clause 139)
                    </td>
                    <td className="py-2 px-3 text-right text-muted-foreground font-mono">Clause 139</td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                      -{formatCurrency(summary.taxExemptAllowance)}
                    </td>
                  </tr>
                  <tr className="bg-muted/40 font-semibold">
                    <td className="py-2 px-3 text-foreground">Net Taxable Remuneration Subject to Tax</td>
                    <td className="py-2 px-3 text-right text-muted-foreground font-mono">Taxable</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-foreground">
                      {formatCurrency(summary.taxableIncome)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-foreground">Effective Salaried Tax Rate Applied</td>
                    <td className="py-2 px-3 text-right text-muted-foreground font-mono">Slabs 2026</td>
                    <td className="py-2 px-3 text-right font-mono text-foreground">
                      {summary.effectiveTaxRate}%
                    </td>
                  </tr>
                  <tr className="bg-red-50 dark:bg-red-950/20 font-bold border-t-2 border-red-200 dark:border-red-900">
                    <td className="py-2.5 px-3 text-red-950 dark:text-red-200">
                      TOTAL ANNUAL INCOME TAX WITHHELD (FBR SEC 149)
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-red-700 dark:text-red-400">
                      CP-149
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-sm text-red-700 dark:text-red-400">
                      {formatCurrency(summary.annualTaxDeducted)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Certification Clause */}
            <div className="text-[11px] text-muted-foreground leading-relaxed border-l-2 border-blue-600 pl-3 mb-6">
              <strong className="text-foreground">Official Statutory Certificate:</strong> This certifies that the tax amount of{" "}
              <strong className="text-foreground">{formatCurrency(summary.annualTaxDeducted)}</strong> has been deducted at source from{" "}
              <strong className="text-foreground">{t.name}</strong> under Section 149 of the Income Tax Ordinance, 2001, and deposited in the Federal Treasury / State Bank of Pakistan. This document satisfies official requirements for annual tax return filing with the Federal Board of Revenue (FBR).
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border text-center text-xs">
              <div>
                <div className="border-b border-foreground/40 h-8 mb-1.5" />
                <span className="font-semibold block text-foreground">Accounts Officer (Taxation)</span>
                <span className="text-[10px] text-muted-foreground">Finance Division</span>
              </div>
              <div>
                <div className="border-b border-foreground/40 h-8 mb-1.5" />
                <span className="font-semibold block text-foreground">Head of Human Resources</span>
                <span className="text-[10px] text-muted-foreground">Faculty Administration</span>
              </div>
              <div>
                <div className="border-b border-foreground/40 h-8 mb-1.5" />
                <span className="font-semibold block text-foreground">Director of Finance / CFO</span>
                <span className="text-[10px] text-muted-foreground">Withholding Tax Signatory</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 bg-muted/40 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Print this certificate on official letterhead for FBR submission or visa verification.
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => printTeacherAnnualTaxCertificate(summary, periodLabel)}
            >
              <Printer className="size-4 mr-1.5" />
              Print Certificate
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
