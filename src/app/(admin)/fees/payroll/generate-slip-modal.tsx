"use client";

import * as React from "react";
import { FileText, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { type StaffSalaryRecord } from "@/lib/mock/payroll";

interface AllowanceRow {
  label: string;
  amount: string;
}

interface DeductionRow {
  label: string;
  amount: string;
}

interface GenerateSlipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (record: StaffSalaryRecord) => void;
  defaultMonthYear?: string;
  existingStaff: StaffSalaryRecord[];
}

const MONTH_NAMES: Record<string, string> = {
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  "10": "October",
  "11": "November",
  "12": "December",
};

function parseMonthYear(monthInput: string): string {
  // monthInput is "YYYY-MM"
  if (!monthInput) return "";
  const [year, month] = monthInput.split("-");
  return `${MONTH_NAMES[month] ?? month} ${year}`;
}

function defaultMonthInputFromString(monthYear: string): string {
  // monthYear is like "November 2026"
  const months: Record<string, string> = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };
  if (!monthYear) return "";
  const parts = monthYear.split(" ");
  if (parts.length < 2) return "";
  const monthNum = months[parts[0]] ?? "01";
  const year = parts[1] ?? new Date().getFullYear().toString();
  return `${year}-${monthNum}`;
}

export function GenerateSlipModal({
  open,
  onOpenChange,
  onGenerate,
  defaultMonthYear,
  existingStaff,
}: GenerateSlipModalProps) {
  // Get unique staff (by empCode)
  const uniqueStaff = React.useMemo(() => {
    const seen = new Set<string>();
    return existingStaff.filter((s) => {
      if (seen.has(s.empCode)) return false;
      seen.add(s.empCode);
      return true;
    });
  }, [existingStaff]);

  const [selectedEmpCode, setSelectedEmpCode] = React.useState("");
  const [monthInput, setMonthInput] = React.useState(
    defaultMonthInputFromString(defaultMonthYear ?? "")
  );
  const [basicSalary, setBasicSalary] = React.useState("");
  const [workingDays, setWorkingDays] = React.useState("26");
  const [presentDays, setPresentDays] = React.useState("26");
  const [allowances, setAllowances] = React.useState<AllowanceRow[]>([
    { label: "HRA", amount: "" },
    { label: "Transport Allowance", amount: "" },
  ]);
  const [deductions, setDeductions] = React.useState<DeductionRow[]>([
    { label: "Provident Fund", amount: "" },
    { label: "Professional Tax", amount: "" },
  ]);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setSelectedEmpCode("");
      setMonthInput(defaultMonthInputFromString(defaultMonthYear ?? ""));
      setBasicSalary("");
      setWorkingDays("26");
      setPresentDays("26");
      setAllowances([
        { label: "HRA", amount: "" },
        { label: "Transport Allowance", amount: "" },
      ]);
      setDeductions([
        { label: "Provident Fund", amount: "" },
        { label: "Professional Tax", amount: "" },
      ]);
    }
  }, [open, defaultMonthYear]);

  // Auto-fill basic salary when staff is selected
  const handleStaffSelect = (empCode: string) => {
    setSelectedEmpCode(empCode);
    if (empCode) {
      const staff = uniqueStaff.find((s) => s.empCode === empCode);
      if (staff) {
        setBasicSalary(String(staff.baseSalary));
      }
    } else {
      setBasicSalary("");
    }
  };

  // Live net pay calculation
  const netPay = React.useMemo(() => {
    const basic = parseFloat(basicSalary) || 0;
    const totalAllowances = allowances.reduce(
      (sum, a) => sum + (parseFloat(a.amount) || 0),
      0
    );
    const totalDeductionsAmt = deductions.reduce(
      (sum, d) => sum + (parseFloat(d.amount) || 0),
      0
    );
    return basic + totalAllowances - totalDeductionsAmt;
  }, [basicSalary, allowances, deductions]);

  // Allowance handlers
  const handleAllowanceChange = (
    index: number,
    field: "label" | "amount",
    value: string
  ) => {
    setAllowances((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  };

  const handleAddAllowance = () => {
    setAllowances((prev) => [...prev, { label: "", amount: "" }]);
  };

  const handleRemoveAllowance = (index: number) => {
    setAllowances((prev) => prev.filter((_, i) => i !== index));
  };

  // Deduction handlers
  const handleDeductionChange = (
    index: number,
    field: "label" | "amount",
    value: string
  ) => {
    setDeductions((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    );
  };

  const handleAddDeduction = () => {
    setDeductions((prev) => [...prev, { label: "", amount: "" }]);
  };

  const handleRemoveDeduction = (index: number) => {
    setDeductions((prev) => prev.filter((_, i) => i !== index));
  };

  // Generate slip
  const handleGenerate = () => {
    if (!selectedEmpCode) {
      toast.error("Please select a staff member.");
      return;
    }
    if (!monthInput) {
      toast.error("Please select a salary month.");
      return;
    }
    const basic = parseFloat(basicSalary) || 0;
    if (basic <= 0) {
      toast.error("Basic salary must be greater than 0.");
      return;
    }

    const staffTemplate = uniqueStaff.find((s) => s.empCode === selectedEmpCode);
    if (!staffTemplate) {
      toast.error("Selected staff not found.");
      return;
    }

    const monthYear = parseMonthYear(monthInput);

    // Map allowances
    const hraRow = allowances.find((a) => a.label === "HRA");
    const transportRow = allowances.find(
      (a) => a.label === "Transport Allowance"
    );
    const medicalRow = allowances.find((a) =>
      a.label.toLowerCase().includes("medical")
    );
    const houseRentAllowance = parseFloat(hraRow?.amount ?? "") || 0;
    const conveyanceAllowance =
      parseFloat(transportRow?.amount ?? "") || 0;
    const medicalAllowance = parseFloat(medicalRow?.amount ?? "") || 0;
    const specialAllowance = allowances
      .filter(
        (a) =>
          a.label !== "HRA" &&
          a.label !== "Transport Allowance" &&
          !a.label.toLowerCase().includes("medical")
      )
      .reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);

    const totalAllowances = allowances.reduce(
      (sum, a) => sum + (parseFloat(a.amount) || 0),
      0
    );
    const grossSalary = basic + totalAllowances;

    // Map deductions
    const taxRow = deductions.find((d) =>
      d.label.toLowerCase().includes("tax")
    );
    const providentRow = deductions.find((d) =>
      d.label.toLowerCase().includes("provident")
    );
    const eobiRow = deductions.find((d) =>
      d.label.toLowerCase().includes("eobi")
    );
    const taxDeduction = parseFloat(taxRow?.amount ?? "") || 0;
    const providentFund = parseFloat(providentRow?.amount ?? "") || 0;
    const eobi = parseFloat(eobiRow?.amount ?? "") || 0;

    const totalDeductionsAmt = deductions.reduce(
      (sum, d) => sum + (parseFloat(d.amount) || 0),
      0
    );
    const netSalary = grossSalary - totalDeductionsAmt;

    const record: StaffSalaryRecord = {
      id: `slip-${Date.now()}`,
      empCode: staffTemplate.empCode,
      name: staffTemplate.name,
      designation: staffTemplate.designation,
      department: staffTemplate.department,
      campus: staffTemplate.campus,
      type: staffTemplate.type,
      cnic: staffTemplate.cnic,
      joiningDate: staffTemplate.joiningDate,
      bankName: staffTemplate.bankName,
      accountTitle: staffTemplate.accountTitle,
      accountNumber: staffTemplate.accountNumber,
      iban: staffTemplate.iban,
      paymentMode: staffTemplate.paymentMode,
      monthYear,
      baseSalary: basic,
      houseRentAllowance,
      conveyanceAllowance,
      medicalAllowance,
      specialAllowance,
      grossSalary,
      taxDeduction,
      providentFund,
      eobi,
      unpaidLeaveDeduction: 0,
      loanDeduction: 0,
      totalDeductions: totalDeductionsAmt,
      netSalary,
      status: "Pending",
    };

    onGenerate(record);
    toast.success(
      `Salary slip generated for ${staffTemplate.name} — ${monthYear}`
    );
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#0f172a] px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <FileText className="size-5 text-white/80" />
            <h2 className="text-base font-bold tracking-tight">
              Generate Salary Slip
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex size-8 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="space-y-5">
            {/* Row 1: Staff Member + Salary Month */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Staff Member <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedEmpCode}
                  onChange={(e) => handleStaffSelect(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">— Select staff —</option>
                  {uniqueStaff.map((s) => (
                    <option key={s.empCode} value={s.empCode}>
                      {s.name} ({s.empCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Salary Month <span className="text-rose-500">*</span>
                </label>
                <input
                  type="month"
                  value={monthInput}
                  onChange={(e) => setMonthInput(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Row 2: Basic Salary + Working Days */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Basic Salary <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(e.target.value)}
                  placeholder="0"
                  min={0}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Working Days
                </label>
                <input
                  type="number"
                  value={workingDays}
                  onChange={(e) => setWorkingDays(e.target.value)}
                  min={0}
                  max={31}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Present Days
                </label>
                <input
                  type="number"
                  value={presentDays}
                  onChange={(e) => setPresentDays(e.target.value)}
                  min={0}
                  max={31}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Allowances Section */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">
                  Allowances
                </h3>
                <button
                  type="button"
                  onClick={handleAddAllowance}
                  className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  <Plus className="size-3" />
                  Add Allowance
                </button>
              </div>
              <div className="space-y-2.5">
                {allowances.map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Allowance name"
                      value={row.label}
                      onChange={(e) =>
                        handleAllowanceChange(i, "label", e.target.value)
                      }
                      className="h-8 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={row.amount}
                      onChange={(e) =>
                        handleAllowanceChange(i, "amount", e.target.value)
                      }
                      min={0}
                      className="h-8 w-32 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAllowance(i)}
                      className="flex size-8 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100"
                      aria-label="Remove allowance"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
                {allowances.length === 0 && (
                  <p className="text-center text-xs text-slate-400">
                    No allowances added yet.
                  </p>
                )}
              </div>
            </div>

            {/* Deductions Section */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">
                  Deductions
                </h3>
                <button
                  type="button"
                  onClick={handleAddDeduction}
                  className="flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                >
                  <Plus className="size-3" />
                  Add Deduction
                </button>
              </div>
              <div className="space-y-2.5">
                {deductions.map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Deduction name"
                      value={row.label}
                      onChange={(e) =>
                        handleDeductionChange(i, "label", e.target.value)
                      }
                      className="h-8 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={row.amount}
                      onChange={(e) =>
                        handleDeductionChange(i, "amount", e.target.value)
                      }
                      min={0}
                      className="h-8 w-32 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDeduction(i)}
                      className="flex size-8 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100"
                      aria-label="Remove deduction"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
                {deductions.length === 0 && (
                  <p className="text-center text-xs text-slate-400">
                    No deductions added yet.
                  </p>
                )}
              </div>
            </div>

            {/* Net Pay Preview */}
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-3.5">
              <span className="text-sm font-semibold text-slate-600">
                Net Pay Preview
              </span>
              <span className="text-xl font-black tabular-nums text-emerald-700">
                Rs {netPay.toLocaleString("en-US")}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 active:bg-emerald-800"
          >
            <Trash2 className="hidden" aria-hidden />
            <FileText className="size-4" />
            Generate Slip
          </button>
        </div>
      </div>
    </div>
  );
}
