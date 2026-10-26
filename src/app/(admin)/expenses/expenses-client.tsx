"use client";

import * as React from "react";
import {
  AlertCircle,
  Banknote,
  Check,
  ChevronDown,
  CreditCard,
  Download,
  Eye,
  Layers,
  PieChart,
  Plus,
  Printer,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import {
  DataTable,
  type Column,
  type FilterDef,
} from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionButton } from "@/components/shared/action-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
} from "@/lib/format";
import {
  INITIAL_EXPENSE_BUDGETS,
  INITIAL_EXPENSE_VOUCHERS,
  type ExpenseBudgetRecord,
  type ExpensePaymentMode,
  type ExpenseStatus,
  type ExpenseVoucherRecord,
} from "@/lib/mock/expenses";
import {
  exportBudgetsPdf,
  exportExpensesPdf,
  printExpensesRegister,
} from "./expenses-export";
import { ExpenseVoucherModal } from "./expense-voucher-modal";
import { BudgetViewModal, ExpenseFormModal } from "./expense-form-modal";

type ExpensesViewTab = "vouchers" | "budgets";

const CAMPUS_OPTIONS = [
  "Gulberg",
  "DHA Phase 5",
  "F-8 Islamabad",
  "Clifton",
  "Bahria Town",
];

export function ExpensesClient() {
  const [activeTab, setActiveTab] = React.useState<ExpensesViewTab>("vouchers");
  const [vouchers, setVouchers] = React.useState<ExpenseVoucherRecord[]>(
    INITIAL_EXPENSE_VOUCHERS
  );
  const [budgets, setBudgets] = React.useState<ExpenseBudgetRecord[]>(
    INITIAL_EXPENSE_BUDGETS
  );

  // Voucher View Modal
  const [selectedVoucherId, setSelectedVoucherId] = React.useState<
    string | null
  >(null);
  const [voucherModalOpen, setVoucherModalOpen] = React.useState(false);
  const [voucherModalTab, setVoucherModalTab] = React.useState<
    "overview" | "settle" | "audit"
  >("overview");

  // Voucher Create/Edit Modal
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingVoucher, setEditingVoucher] =
    React.useState<ExpenseVoucherRecord | null>(null);

  // Budget View/Edit Modal
  const [selectedBudgetId, setSelectedBudgetId] = React.useState<string | null>(
    null
  );
  const [budgetModalOpen, setBudgetModalOpen] = React.useState(false);

  const selectedVoucher = React.useMemo(
    () => vouchers.find((v) => v.id === selectedVoucherId) ?? null,
    [vouchers, selectedVoucherId]
  );

  const selectedBudget = React.useMemo(
    () => budgets.find((b) => b.id === selectedBudgetId) ?? null,
    [budgets, selectedBudgetId]
  );

  /* ───────────────────────── KPI Aggregates ───────────────────────── */

  const voucherKpis = React.useMemo(() => {
    const totalNet = vouchers.reduce((s, v) => s + v.netPayable, 0);
    const paidVouchers = vouchers.filter((v) => v.status === "Paid");
    const paidAmount = paidVouchers.reduce((s, v) => s + v.netPayable, 0);
    const pendingVouchers = vouchers.filter(
      (v) => v.status === "Pending" || v.status === "Approved"
    );
    const pendingAmount = pendingVouchers.reduce((s, v) => s + v.netPayable, 0);
    const totalWht = vouchers.reduce((s, v) => s + v.whtDeduction, 0);
    return {
      totalNet,
      totalCount: vouchers.length,
      paidAmount,
      paidCount: paidVouchers.length,
      pendingAmount,
      pendingCount: pendingVouchers.length,
      totalWht,
    };
  }, [vouchers]);

  const budgetKpis = React.useMemo(() => {
    const monthlyBudget = budgets.reduce((s, b) => s + b.monthlyAllocation, 0);
    const monthlySpent = budgets.reduce((s, b) => s + b.monthlySpent, 0);
    const committed = budgets.reduce((s, b) => s + b.committedPending, 0);
    const available = Math.max(0, monthlyBudget - monthlySpent - committed);
    const utilPct =
      monthlyBudget > 0
        ? Math.round(((monthlySpent + committed) / monthlyBudget) * 100)
        : 0;
    return {
      monthlyBudget,
      monthlySpent,
      committed,
      available,
      utilPct,
    };
  }, [budgets]);

  /* ───────────────────────── Handlers ───────────────────────── */

  const openVoucher = React.useCallback(
    (
      v: ExpenseVoucherRecord,
      tab: "overview" | "settle" | "audit" = "overview"
    ) => {
      setSelectedVoucherId(v.id);
      setVoucherModalTab(tab);
      setVoucherModalOpen(true);
    },
    []
  );

  const openBudget = React.useCallback((b: ExpenseBudgetRecord) => {
    setSelectedBudgetId(b.id);
    setBudgetModalOpen(true);
  }, []);

  const handleSettleVoucher = React.useCallback(
    (
      voucherId: string,
      payload: {
        status: ExpenseStatus;
        paymentMode: ExpensePaymentMode;
        paymentRef: string;
        approvedBy: string;
        remarks: string;
      }
    ) => {
      const today = new Date().toISOString().slice(0, 10);
      let voucherNo = "";

      setVouchers((prev) =>
        prev.map((v) => {
          if (v.id !== voucherId) return v;
          voucherNo = v.voucherNo;
          return {
            ...v,
            status: payload.status,
            paymentMode: payload.paymentMode,
            paymentRef: payload.paymentRef,
            paidDate: payload.status === "Paid" ? today : v.paidDate,
            approvedBy: payload.approvedBy,
            auditTrail: [
              {
                id: `${v.id}-aud-${Date.now()}`,
                timestamp: `${today} 03:45 PM`,
                actor: payload.approvedBy,
                role: "Finance Controller",
                action: `${payload.remarks} (Ref: ${payload.paymentRef})`,
                status:
                  payload.status === "Paid"
                    ? "Paid"
                    : payload.status === "Approved"
                    ? "Approved"
                    : payload.status === "Rejected"
                    ? "Rejected"
                    : "Verified",
              },
              ...v.auditTrail,
            ],
          };
        })
      );

      toast.success(
        `Expense voucher ${voucherNo} updated to ${payload.status}.`
      );
    },
    []
  );

  const handleSaveVoucher = React.useCallback((record: ExpenseVoucherRecord) => {
    setVouchers((prev) => {
      const exists = prev.some((v) => v.id === record.id);
      return exists
        ? prev.map((v) => (v.id === record.id ? record : v))
        : [record, ...prev];
    });
  }, []);

  const handleUpdateBudget = React.useCallback(
    (budgetId: string, monthlyAllocation: number, custodian: string) => {
      const today = new Date().toISOString().slice(0, 10);
      setBudgets((prev) =>
        prev.map((b) =>
          b.id === budgetId
            ? {
                ...b,
                monthlyAllocation,
                ytdAllocation: monthlyAllocation * 10,
                custodian,
                lastUpdated: today,
              }
            : b
        )
      );
      toast.success("Category budget allocation limit updated.");
    },
    []
  );

  /* ───────────────────────── Vouchers Table Columns (No Shuffling Arrows, Single View Button) ───────────────────────── */

  const voucherColumns = React.useMemo<Column<ExpenseVoucherRecord>[]>(
    () => [
      {
        key: "voucherNo",
        header: "Voucher #",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/50 px-2 py-0.5 font-mono text-xs font-bold text-[#091d3e]">
              {r.voucherNo}
            </span>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              {formatDate(r.date)} · {r.invoiceNo}
            </p>
          </div>
        ),
      },
      {
        key: "title",
        header: "Expense Head & Category",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center max-w-[230px] mx-auto">
            <p className="truncate text-xs font-semibold text-foreground">
              {r.title}
            </p>
            <p className="truncate text-[10.5px] text-muted-foreground">
              {r.category} · {r.department}
            </p>
          </div>
        ),
      },
      {
        key: "vendor",
        header: "Vendor / Payee",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-xs font-semibold text-foreground">
              {r.vendorName}
            </p>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              {r.vendorNtn} · {r.paymentMode}
            </p>
          </div>
        ),
      },
      {
        key: "campus",
        header: "Campus",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-xs font-semibold text-foreground">{r.campus}</p>
            <p className="font-mono text-[10.5px] text-brand">
              {r.budgetHeadCode}
            </p>
          </div>
        ),
      },
      {
        key: "gross",
        header: "Gross & Tax",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
              {formatCurrency(r.grossAmount)}
            </span>
            <p className="font-mono text-[10px] text-muted-foreground">
              GST: +{formatCurrency(r.taxAmount)} · WHT: -
              {formatCurrency(r.whtDeduction)}
            </p>
          </div>
        ),
      },
      {
        key: "netPayable",
        header: "Net Payable",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-bold tabular-nums text-emerald-700">
              {formatCurrency(r.netPayable)}
            </span>
            <p className="font-mono text-[10px] text-muted-foreground">
              {r.paymentRef}
            </p>
          </div>
        ),
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
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        cell: (r) => (
          <div className="flex items-center justify-center">
            <ActionButton
              tone="outline"
              size="xs"
              title="View expense voucher, vendor details & approval workflow"
              onClick={() => openVoucher(r, "overview")}
            >
              <Eye className="size-3.5" />
              <span>View</span>
            </ActionButton>
          </div>
        ),
      },
    ],
    [openVoucher]
  );

  const voucherFilters = React.useMemo<FilterDef<ExpenseVoucherRecord>[]>(
    () => [
      {
        key: "campus",
        label: "Campus",
        allLabel: "All Campuses",
        options: CAMPUS_OPTIONS,
        getValue: (r) => r.campus,
      },
      {
        key: "category",
        label: "Category",
        allLabel: "All Categories",
        options: [...new Set(vouchers.map((v) => v.category))],
        getValue: (r) => r.category,
      },
      {
        key: "status",
        label: "Status",
        allLabel: "All Statuses",
        options: ["Paid", "Approved", "Pending", "Rejected"],
        getValue: (r) => r.status,
      },
    ],
    [vouchers]
  );

  /* ───────────────────────── Category Budgets Columns ───────────────────────── */

  const budgetColumns = React.useMemo<Column<ExpenseBudgetRecord>[]>(
    () => [
      {
        key: "budgetCode",
        header: "Budget Code",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="inline-flex items-center rounded-md border border-brand/15 bg-brand-50/50 px-2 py-0.5 font-mono text-xs font-bold text-[#091d3e]">
              {r.budgetCode}
            </span>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              Updated {formatDate(r.lastUpdated)}
            </p>
          </div>
        ),
      },
      {
        key: "category",
        header: "Expense Category & Dept",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <p className="text-xs font-semibold text-foreground">
              {r.category}
            </p>
            <p className="text-[10.5px] text-muted-foreground">
              {r.department} · Custodian: {r.custodian}
            </p>
          </div>
        ),
      },
      {
        key: "monthlyAllocation",
        header: "Monthly Limit",
        align: "center",
        cell: (r) => (
          <span className="font-mono text-xs font-bold tabular-nums text-[#091d3e]">
            {formatCurrency(r.monthlyAllocation)}
          </span>
        ),
      },
      {
        key: "monthlySpent",
        header: "Spent & Committed",
        align: "center",
        cell: (r) => (
          <div className="space-y-0.5 text-center">
            <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
              {formatCurrency(r.monthlySpent)}
            </span>
            <p className="font-mono text-[10px] text-amber-700">
              Pending: +{formatCurrency(r.committedPending)}
            </p>
          </div>
        ),
      },
      {
        key: "available",
        header: "Available Balance",
        align: "center",
        cell: (r) => {
          const avail = Math.max(
            0,
            r.monthlyAllocation - r.monthlySpent - r.committedPending
          );
          const utilPct = Math.min(
            100,
            Math.round(
              ((r.monthlySpent + r.committedPending) / r.monthlyAllocation) *
                100
            )
          );
          return (
            <div className="space-y-0.5 text-center">
              <span className="font-mono text-xs font-bold tabular-nums text-emerald-700">
                {formatCurrency(avail)}
              </span>
              <p className="font-mono text-[10px] text-muted-foreground">
                {utilPct}% Utilized
              </p>
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Control Status",
        align: "center",
        cell: (r) => (
          <div className="flex justify-center">
            <StatusBadge status={r.status} />
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        cell: (r) => (
          <div className="flex items-center justify-center">
            <ActionButton
              tone="outline"
              size="xs"
              title="View & adjust category budget allocation"
              onClick={() => openBudget(r)}
            >
              <Eye className="size-3.5" />
              <span>View</span>
            </ActionButton>
          </div>
        ),
      },
    ],
    [openBudget]
  );

  /* ───────────────────────── Header Actions ───────────────────────── */

  const handlePrint = () => {
    const ok = printExpensesRegister(vouchers);
    if (ok) toast.info("Opening print preview for institutional expenses…");
    else toast.error("Pop-up blocked. Allow pop-ups to print.");
  };

  const handleExportPdf = () => {
    if (activeTab === "vouchers") {
      exportExpensesPdf(vouchers);
      toast.success(
        `Institutional expenses register (${vouchers.length} vouchers) downloaded as PDF.`
      );
    } else {
      exportBudgetsPdf(budgets);
      toast.success(
        `Category budgets & spending controls (${budgets.length} heads) downloaded as PDF.`
      );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Expenses"
        className="mb-0 lg:mb-0"
        actions={
          <>
            <ActionButton tone="outline" size="md" onClick={handlePrint}>
              <Printer />
              <span>Print Register</span>
            </ActionButton>
            <ActionButton tone="pdf" size="md" onClick={handleExportPdf}>
              <Download />
              <span>Export PDF</span>
            </ActionButton>
            <ActionButton
              tone="primary"
              size="md"
              onClick={() => {
                setEditingVoucher(null);
                setFormOpen(true);
              }}
            >
              <Plus />
              <span>Record Expense</span>
            </ActionButton>
          </>
        }
      />

      {/* Dynamic KPI Stat Cards */}
      {activeTab === "vouchers" ? (
        <StatGrid>
          <StatCard
            label="Total Expenses (Oct)"
            value={`${formatCurrencyCompact(voucherKpis.totalNet)} (${voucherKpis.totalCount})`}
            icon={CreditCard}
          />
          <StatCard
            label="Disbursed / Paid"
            value={`${formatCurrencyCompact(voucherKpis.paidAmount)} (${voucherKpis.paidCount} Paid)`}
            icon={Banknote}
          />
          <StatCard
            label="Pending Settlement"
            value={`${formatCurrencyCompact(voucherKpis.pendingAmount)} (${voucherKpis.pendingCount})`}
            icon={AlertCircle}
          />
          <StatCard
            label="WHT Tax Deducted"
            value={formatCurrencyCompact(voucherKpis.totalWht)}
            icon={ShieldCheck}
          />
        </StatGrid>
      ) : (
        <StatGrid>
          <StatCard
            label="Monthly Budget Limit"
            value={formatCurrencyCompact(budgetKpis.monthlyBudget)}
            icon={Wallet}
          />
          <StatCard
            label="Utilized Spend (Oct)"
            value={`${formatCurrencyCompact(budgetKpis.monthlySpent)} (${budgetKpis.utilPct}%)`}
            icon={TrendingUp}
          />
          <StatCard
            label="Committed Vouchers"
            value={formatCurrencyCompact(budgetKpis.committed)}
            icon={Receipt}
          />
          <StatCard
            label="Available Headroom"
            value={formatCurrencyCompact(budgetKpis.available)}
            icon={PieChart}
          />
        </StatGrid>
      )}

      {/* Expense Register Selector Dropdown (Clean Single-Line Executive Control) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="group inline-flex h-9 cursor-pointer items-center gap-2.5 rounded-[4px] border border-brand/20 bg-white px-3 text-xs font-semibold text-[#091d3e] shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.05)] transition-colors hover:border-brand/35 hover:bg-brand-50/40 focus:outline-none focus:ring-2 focus:ring-brand/15">
            {activeTab === "vouchers" ? (
              <Receipt className="size-3.5 shrink-0 text-brand" />
            ) : (
              <Layers className="size-3.5 shrink-0 text-brand" />
            )}
            <span className="font-semibold text-[#091d3e]">
              {activeTab === "vouchers"
                ? "Expense Vouchers"
                : "Category Budgets"}
            </span>
            <span className="rounded-[3px] border border-brand/15 bg-brand-50/80 px-1.5 py-0.5 font-mono text-[11px] font-bold tabular-nums text-brand">
              {activeTab === "vouchers" ? vouchers.length : budgets.length}
            </span>
            <ChevronDown className="ml-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform duration-150 group-data-open:rotate-180" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className="w-[235px] rounded-[6px] border border-brand/15 bg-white p-1 shadow-[0_10px_28px_-6px_rgb(9_29_62/0.18),0_2px_6px_rgb(9_29_62/0.06)] ring-0"
          >
            {(
              [
                {
                  key: "vouchers" as const,
                  label: "Expense Vouchers",
                  count: vouchers.length,
                  icon: Receipt,
                },
                {
                  key: "budgets" as const,
                  label: "Category Budgets",
                  count: budgets.length,
                  icon: Layers,
                },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.key;
              return (
                <DropdownMenuItem
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-[4px] px-2.5 py-2 text-xs cursor-pointer transition-colors",
                    isSelected
                      ? "bg-brand-50/80 font-semibold text-[#091d3e] focus:bg-brand-50"
                      : "font-medium text-foreground/85 hover:bg-slate-50 focus:bg-slate-100/80"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon
                      className={cn(
                        "size-3.5 shrink-0",
                        isSelected ? "text-[#091d3e]" : "text-muted-foreground"
                      )}
                    />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "min-w-[26px] rounded-[3px] px-1.5 py-0.5 text-center font-mono text-[10.5px] font-bold tabular-nums",
                        isSelected
                          ? "bg-[#091d3e] text-white"
                          : "bg-slate-100 text-muted-foreground"
                      )}
                    >
                      {item.count}
                    </span>
                    <span className="grid size-3.5 shrink-0 place-items-center">
                      {isSelected && (
                        <Check className="size-3.5 text-[#091d3e] stroke-[2.5]" />
                      )}
                    </span>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span className="font-medium">
            {activeTab === "vouchers"
              ? `Institutional Expense Ledger · ${voucherKpis.paidCount} Vouchers Settled`
              : `Category Spending Controls · ${budgetKpis.utilPct}% Monthly Budget Utilized`}
          </span>
        </div>
      </div>

      {/* Main DataTable */}
      {activeTab === "vouchers" ? (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={vouchers}
            columns={voucherColumns}
            getRowId={(r) => r.id}
            filters={voucherFilters}
            searchPlaceholder="Search voucher #, invoice #, expense title, vendor or NTN…"
            searchFn={(r, q) =>
              r.voucherNo.toLowerCase().includes(q) ||
              r.invoiceNo.toLowerCase().includes(q) ||
              r.title.toLowerCase().includes(q) ||
              r.vendorName.toLowerCase().includes(q) ||
              r.vendorNtn.toLowerCase().includes(q) ||
              r.category.toLowerCase().includes(q) ||
              r.department.toLowerCase().includes(q)
            }
            pageSize={8}
            emptyMessage="No expense vouchers match the selected filters."
          />
        </SectionCard>
      ) : (
        <SectionCard flush contentClassName="pt-5">
          <DataTable
            data={budgets}
            columns={budgetColumns}
            getRowId={(r) => r.id}
            searchPlaceholder="Search budget code, expense category, department or custodian…"
            searchFn={(r, q) =>
              r.budgetCode.toLowerCase().includes(q) ||
              r.category.toLowerCase().includes(q) ||
              r.department.toLowerCase().includes(q) ||
              r.custodian.toLowerCase().includes(q)
            }
            pageSize={8}
            emptyMessage="No budget categories match the search query."
          />
        </SectionCard>
      )}

      {/* Modals */}
      <ExpenseVoucherModal
        voucher={selectedVoucher}
        open={voucherModalOpen}
        onOpenChange={setVoucherModalOpen}
        initialTab={voucherModalTab}
        onSettleVoucher={handleSettleVoucher}
        onEditVoucher={(v) => {
          setEditingVoucher(v);
          setFormOpen(true);
        }}
      />

      <ExpenseFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingVoucher}
        totalCount={vouchers.length}
        onSave={handleSaveVoucher}
      />

      <BudgetViewModal
        budget={selectedBudget}
        open={budgetModalOpen}
        onOpenChange={setBudgetModalOpen}
        onUpdateBudget={handleUpdateBudget}
      />
    </div>
  );
}
