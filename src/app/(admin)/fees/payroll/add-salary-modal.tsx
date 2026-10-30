"use client";

import * as React from "react";
import { AlertCircle, Check, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionButton } from "@/components/shared/action-button";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StaffSalaryRecord } from "@/lib/mock/payroll";

interface AddSalaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (record: StaffSalaryRecord) => void;
  initialData?: StaffSalaryRecord | null;
}

const CAMPUSES = [
  "Gulberg",
  "DHA Phase 5",
  "F-8 Islamabad",
  "Clifton",
  "Bahria Town",
];

const DEPARTMENTS = [
  "Sciences",
  "Languages & Literature",
  "Humanities",
  "Technology",
  "Primary",
  "Finance",
  "Admin & Operations",
];

export const DESIGNATION_GROUPS = [
  {
    group: "Academic Leadership & Heads",
    options: [
      "Principal",
      "Campus Principal",
      "Vice Principal Academics",
      "Head of Sciences",
      "Head of English",
      "Coordinator - Middle Wing",
      "Primary Wing Head",
      "Primary Wing Incharge",
      "Academic Coordinator",
    ],
  },
  {
    group: "Teaching Faculty — Sciences & Mathematics",
    options: [
      "Senior Teacher - Mathematics",
      "Senior Teacher - Physics",
      "Senior Teacher - Chemistry",
      "Teacher - Biology",
      "Teacher - Chemistry",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "Science Lab Assistant",
    ],
  },
  {
    group: "Teaching Faculty — Languages & Humanities",
    options: [
      "Teacher - English Literature",
      "Teacher - Urdu",
      "Teacher - Islamiat",
      "Teacher - Humanities",
      "English Literature",
      "Urdu Language",
      "Primary Teacher",
      "Physical Education",
    ],
  },
  {
    group: "Technology & IT",
    options: [
      "Teacher - Computer Science",
      "Computer Science",
      "Network Administrator",
      "Systems & Network Engineer",
    ],
  },
  {
    group: "Administration, Finance & Operations",
    options: [
      "Campus Accountant",
      "Accounts Officer",
      "Finance Manager",
      "HR Manager",
      "HR Executive",
      "Admin Officer",
      "Head of Campus Security",
    ],
  },
];

const ALL_DESIGNATION_OPTIONS = DESIGNATION_GROUPS.flatMap((g) => g.options);

const NON_TEACHING_DESIGNATIONS = [
  "Campus Accountant",
  "Accounts Officer",
  "Finance Manager",
  "HR Manager",
  "HR Executive",
  "Admin Officer",
  "Head of Campus Security",
  "Network Administrator",
  "Systems & Network Engineer",
  "Principal",
  "Campus Principal",
];

const BANKS = [
  "Meezan Bank Ltd.",
  "Habib Bank Limited (HBL)",
  "Allied Bank Ltd.",
  "Bank Alfalah Ltd.",
  "Askari Bank Ltd.",
  "Cash Counter",
];

const labelClass =
  "mb-1 block truncate text-[11px] font-semibold text-foreground whitespace-nowrap";

const inputClass =
  "h-8.5 w-full rounded-md border border-border/80 bg-white px-3 text-xs text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15";

const getInputClass = (hasError?: boolean, extra?: string) =>
  cn(
    "h-8.5 w-full rounded-md border bg-white px-3 text-xs text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-none focus:ring-2",
    hasError
      ? "border-danger bg-danger-soft/10 text-danger placeholder:text-danger/50 focus:border-danger focus:ring-danger/20"
      : "border-border/80 focus:border-brand focus:ring-brand/15",
    extra
  );

interface FormErrors {
  empCode?: string;
  name?: string;
  designation?: string;
  baseSalary?: string;
  houseRentAllowance?: string;
  medicalAllowance?: string;
  conveyanceAllowance?: string;
  specialAllowance?: string;
  taxDeduction?: string;
  providentFund?: string;
  loanDeduction?: string;
  accountNumber?: string;
  accountTitle?: string;
  iban?: string;
  general?: string;
}

export function AddSalaryModal({
  open,
  onOpenChange,
  onSave,
  initialData,
}: AddSalaryModalProps) {
  const [empCode, setEmpCode] = React.useState("EMP-0720");
  const [name, setName] = React.useState("");
  const [designation, setDesignation] = React.useState("");
  const [isCustom, setIsCustom] = React.useState(false);
  const [department, setDepartment] = React.useState("Sciences");
  const [campus, setCampus] = React.useState("Gulberg");
  const [type, setType] = React.useState<"Teaching" | "Non-Teaching">("Teaching");
  const [baseSalary, setBaseSalary] = React.useState(110000);
  const [medicalAllowance, setMedicalAllowance] = React.useState(11000);
  const [conveyanceAllowance, setConveyanceAllowance] = React.useState(9000);
  const [houseRentAllowance, setHouseRentAllowance] = React.useState(33000);
  const [specialAllowance, setSpecialAllowance] = React.useState(5000);
  const [taxDeduction, setTaxDeduction] = React.useState(11000);
  const [providentFund, setProvidentFund] = React.useState(9160);
  const [eobi, setEobi] = React.useState(1500);
  const [loanDeduction, setLoanDeduction] = React.useState(0);
  const [bankName, setBankName] = React.useState("Meezan Bank Ltd.");
  const [accountTitle, setAccountTitle] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [iban, setIban] = React.useState("");
  const [paymentMode, setPaymentMode] = React.useState<
    "Bank Transfer" | "Cheque" | "Cash"
  >("Bank Transfer");
  const [errors, setErrors] = React.useState<FormErrors>({});

  const clearError = (field: keyof FormErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  React.useEffect(() => {
    setErrors({});
    if (initialData) {
      setEmpCode(initialData.empCode);
      setName(initialData.name);
      const isKnown = ALL_DESIGNATION_OPTIONS.includes(initialData.designation);
      setIsCustom(!isKnown && Boolean(initialData.designation));
      setDesignation(initialData.designation);
      setDepartment(initialData.department);
      setCampus(initialData.campus);
      setType(initialData.type);
      setBaseSalary(initialData.baseSalary);
      setMedicalAllowance(initialData.medicalAllowance);
      setConveyanceAllowance(initialData.conveyanceAllowance);
      setHouseRentAllowance(initialData.houseRentAllowance);
      setSpecialAllowance(initialData.specialAllowance);
      setTaxDeduction(initialData.taxDeduction);
      setProvidentFund(initialData.providentFund);
      setEobi(initialData.eobi);
      setLoanDeduction(initialData.loanDeduction);
      setBankName(initialData.bankName);
      setAccountTitle(initialData.accountTitle);
      setAccountNumber(initialData.accountNumber);
      setIban(initialData.iban);
      setPaymentMode(initialData.paymentMode);
    } else {
      setEmpCode(`EMP-0${Math.floor(700 + Math.random() * 290)}`);
      setName("");
      setIsCustom(false);
      setDesignation("");
      setDepartment("Sciences");
      setCampus("Gulberg");
      setType("Teaching");
      setBaseSalary(110000);
      setMedicalAllowance(11000);
      setConveyanceAllowance(9000);
      setHouseRentAllowance(33000);
      setSpecialAllowance(5000);
      setTaxDeduction(11000);
      setProvidentFund(9160);
      setEobi(1500);
      setLoanDeduction(0);
      setBankName("Meezan Bank Ltd.");
      setAccountTitle("");
      setAccountNumber("");
      setIban("");
      setPaymentMode("Bank Transfer");
    }
  }, [initialData, open]);

  const applyDesignationDefaults = (desig: string) => {
    if (NON_TEACHING_DESIGNATIONS.includes(desig)) {
      setType("Non-Teaching");
    } else {
      setType("Teaching");
    }

    if (
      desig.includes("Sciences") ||
      desig.includes("Physics") ||
      desig.includes("Chemistry") ||
      desig.includes("Biology") ||
      desig.includes("Mathematics") ||
      desig === "Science Lab Assistant"
    ) {
      setDepartment("Sciences");
    } else if (
      desig.includes("English") ||
      desig.includes("Urdu") ||
      desig.includes("Languages")
    ) {
      setDepartment("Languages & Literature");
    } else if (
      desig.includes("Computer") ||
      desig.includes("Network") ||
      desig.includes("Systems")
    ) {
      setDepartment("Technology");
    } else if (desig.includes("Account") || desig.includes("Finance")) {
      setDepartment("Finance");
    } else if (desig.includes("Primary")) {
      setDepartment("Primary");
    } else if (
      desig.includes("Principal") ||
      desig.includes("HR") ||
      desig.includes("Security") ||
      desig.includes("Admin")
    ) {
      setDepartment("Admin & Operations");
    } else if (
      desig.includes("Humanities") ||
      desig.includes("Islamiat") ||
      desig.includes("Physical Education")
    ) {
      setDepartment("Humanities");
    }
  };

  const handleBaseSalaryChange = (val: number) => {
    setBaseSalary(val);
    clearError("baseSalary");
    clearError("general");
    setHouseRentAllowance(Math.round(val * 0.3));
    setMedicalAllowance(Math.round(val * 0.1));
    setProvidentFund(Math.round(val * 0.0833));
    setTaxDeduction(val > 100000 ? Math.round((val - 50000) * 0.12) : 2500);
  };

  const grossSalary =
    Number(baseSalary) +
    Number(medicalAllowance) +
    Number(conveyanceAllowance) +
    Number(houseRentAllowance) +
    Number(specialAllowance);

  const totalDeductions =
    Number(taxDeduction) +
    Number(providentFund) +
    Number(eobi) +
    Number(loanDeduction);

  const netSalary = Math.max(0, grossSalary - totalDeductions);

  const validateForm = (): FormErrors => {
    const errs: FormErrors = {};

    // 1. Staff Profile
    if (!empCode.trim()) {
      errs.empCode = "Employee code is required.";
    }

    if (!name.trim()) {
      errs.name = "Full name is required.";
    } else if (name.trim().length < 2) {
      errs.name = "Full name must be at least 2 characters.";
    }

    if (!designation.trim()) {
      errs.designation = "Designation is required.";
    }

    // 2. Compensation & Deductions
    if (!baseSalary || Number(baseSalary) <= 0) {
      errs.baseSalary = "Base pay must be greater than Rs 0.";
    }
    if (Number(houseRentAllowance) < 0) {
      errs.houseRentAllowance = "Cannot be negative.";
    }
    if (Number(medicalAllowance) < 0) {
      errs.medicalAllowance = "Cannot be negative.";
    }
    if (Number(conveyanceAllowance) < 0) {
      errs.conveyanceAllowance = "Cannot be negative.";
    }
    if (Number(specialAllowance) < 0) {
      errs.specialAllowance = "Cannot be negative.";
    }
    if (Number(taxDeduction) < 0) {
      errs.taxDeduction = "Cannot be negative.";
    }
    if (Number(providentFund) < 0) {
      errs.providentFund = "Cannot be negative.";
    }
    if (Number(loanDeduction) < 0) {
      errs.loanDeduction = "Cannot be negative.";
    }

    if (totalDeductions > grossSalary) {
      errs.general = `Total deductions (${formatCurrency(totalDeductions)}) exceed gross earnings (${formatCurrency(grossSalary)}). Net salary cannot be negative.`;
    }

    // 3. Disbursement Bank Account
    if (paymentMode !== "Cash") {
      if (!accountNumber.trim()) {
        errs.accountNumber = "Account number is required.";
      } else if (accountNumber.trim().replace(/[-\s]/g, "").length < 8) {
        errs.accountNumber = "Account number must be at least 8 digits.";
      }

      if (!accountTitle.trim()) {
        errs.accountTitle = "Account title is required.";
      }

      const cleanIban = iban.trim().replace(/[\s-]/g, "").toUpperCase();
      if (paymentMode === "Bank Transfer") {
        if (!cleanIban) {
          errs.iban = "24-character IBAN is required for bank transfer.";
        } else if (!cleanIban.startsWith("PK")) {
          errs.iban = "Pakistani IBAN must start with 'PK' (e.g. PK36MEZN...).";
        } else if (cleanIban.length !== 24) {
          errs.iban = `IBAN must be exactly 24 characters (currently ${cleanIban.length}).`;
        }
      } else if (cleanIban && (cleanIban.length !== 24 || !cleanIban.startsWith("PK"))) {
        errs.iban = "IBAN must be exactly 24 characters starting with 'PK'.";
      }
    }

    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError || "Please fill in all required fields properly.");
      return;
    }

    setErrors({});
    const cleanIban = iban.trim().replace(/[\s-]/g, "").toUpperCase();

    const newRecord: StaffSalaryRecord = {
      id: initialData?.id || `sal-${Date.now()}`,
      empCode: empCode.trim(),
      name: name.trim(),
      designation: designation.trim(),
      department,
      campus,
      type,
      monthYear: "October 2026",
      baseSalary: Number(baseSalary),
      medicalAllowance: Number(medicalAllowance) || 0,
      conveyanceAllowance: Number(conveyanceAllowance) || 0,
      houseRentAllowance: Number(houseRentAllowance) || 0,
      specialAllowance: Number(specialAllowance) || 0,
      grossSalary,
      taxDeduction: Number(taxDeduction) || 0,
      providentFund: Number(providentFund) || 0,
      eobi: Number(eobi) || 0,
      unpaidLeaveDeduction: initialData?.unpaidLeaveDeduction || 0,
      loanDeduction: Number(loanDeduction) || 0,
      totalDeductions,
      netSalary,
      bankName,
      accountTitle: accountTitle.trim() || name.trim(),
      accountNumber: accountNumber.trim(),
      iban: cleanIban,
      paymentMode,
      status: initialData?.status || "Pending",
      cnic: initialData?.cnic || "35201-1928374-1",
      joiningDate: initialData?.joiningDate || "2026-10-01",
    };

    onSave(newRecord);
    toast.success(
      initialData
        ? `Salary package updated for ${name}.`
        : `Salary profile created for ${name} (${empCode}).`
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col max-h-[calc(100vh-3.5rem)] sm:max-h-[min(700px,calc(100vh-4rem))] sm:max-w-2xl gap-0 overflow-hidden p-0 rounded-2xl border border-border/80 shadow-2xl bg-white"
      >
        {/* Header — Upper Side with Gradient Icon & Dedicated Close */}
        <DialogHeader className="shrink-0 bg-gradient-to-r from-slate-50/90 via-white to-slate-50/90 px-6 py-4 border-b border-border/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-b from-[#16345f] to-[#091d3e] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]">
                <Wallet className="size-4.5" />
              </span>
              <div>
                <DialogTitle className="text-base font-bold leading-tight text-foreground">
                  {initialData
                    ? "Update Staff Salary Account"
                    : "Add Staff Salary Account"}
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                  Configure employee profile, monthly compensation structure, and disbursement bank account.
                </DialogDescription>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-1.5 text-muted-foreground/70 transition-colors hover:bg-slate-100 hover:text-foreground focus:outline-none"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5 text-xs">
            {/* Section 1: Staff Profile */}
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand/90">
                Staff Profile
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
                <div className="sm:col-span-1">
                  <label className={labelClass}>Emp Code *</label>
                  <input
                    type="text"
                    value={empCode}
                    onChange={(e) => {
                      setEmpCode(e.target.value);
                      clearError("empCode");
                    }}
                    className={getInputClass(Boolean(errors.empCode), "font-mono")}
                    placeholder="e.g. EMP-0732"
                    required
                  />
                  {errors.empCode && (
                    <p className="mt-1 flex items-center gap-1 text-[10.5px] font-medium text-danger">
                      <AlertCircle className="size-3 shrink-0" />
                      <span>{errors.empCode}</span>
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Salman Qureshi"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearError("name");
                    }}
                    className={getInputClass(Boolean(errors.name))}
                    required
                  />
                  {errors.name && (
                    <p className="mt-1 flex items-center gap-1 text-[10.5px] font-medium text-danger">
                      <AlertCircle className="size-3 shrink-0" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className={labelClass}>Designation *</label>
                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustom(false);
                          setDesignation("");
                          clearError("designation");
                        }}
                        className="mb-1 text-[10px] font-medium text-brand hover:underline"
                      >
                        Choose from list
                      </button>
                    )}
                  </div>
                  {isCustom ? (
                    <input
                      type="text"
                      placeholder="e.g. Head of Physics"
                      value={designation}
                      onChange={(e) => {
                        setDesignation(e.target.value);
                        clearError("designation");
                      }}
                      className={getInputClass(Boolean(errors.designation))}
                      autoFocus
                      required
                    />
                  ) : (
                    <select
                      value={designation}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__custom__") {
                          setIsCustom(true);
                          setDesignation("");
                        } else {
                          setDesignation(val);
                          clearError("designation");
                          applyDesignationDefaults(val);
                        }
                      }}
                      className={getInputClass(Boolean(errors.designation))}
                      required
                    >
                      <option value="" disabled>
                        Select Designation…
                      </option>
                      {DESIGNATION_GROUPS.map((g) => (
                        <optgroup key={g.group} label={g.group}>
                          {g.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                      <optgroup label="Custom">
                        <option value="__custom__">Other (Custom Designation)…</option>
                      </optgroup>
                    </select>
                  )}
                  {errors.designation && (
                    <p className="mt-1 flex items-center gap-1 text-[10.5px] font-medium text-danger">
                      <AlertCircle className="size-3 shrink-0" />
                      <span>{errors.designation}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={inputClass}
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Campus</label>
                  <select
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    className={inputClass}
                  >
                    {CAMPUSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Staff Category</label>
                  <select
                    value={type}
                    onChange={(e) =>
                      setType(e.target.value as "Teaching" | "Non-Teaching")
                    }
                    className={inputClass}
                  >
                    <option value="Teaching">Teaching Staff</option>
                    <option value="Non-Teaching">Non-Teaching Staff</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Monthly Salary Breakdown */}
            <div className="space-y-2.5 border-t border-border/70 pt-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand/90">
                Monthly Compensation &amp; Deductions (PKR)
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <label className={labelClass}>Base Pay *</label>
                  <input
                    type="number"
                    placeholder="e.g. 85000"
                    value={baseSalary}
                    onChange={(e) =>
                      handleBaseSalaryChange(Number(e.target.value))
                    }
                    className={getInputClass(
                      Boolean(errors.baseSalary),
                      "font-mono tabular-nums"
                    )}
                    min={0}
                    required
                  />
                  {errors.baseSalary && (
                    <p className="mt-1 flex items-center gap-1 text-[10.5px] font-medium text-danger">
                      <AlertCircle className="size-3 shrink-0" />
                      <span>{errors.baseSalary}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>House Rent (30%)</label>
                  <input
                    type="number"
                    placeholder="e.g. 25500"
                    value={houseRentAllowance}
                    onChange={(e) => {
                      setHouseRentAllowance(Number(e.target.value));
                      clearError("houseRentAllowance");
                      clearError("general");
                    }}
                    className={getInputClass(
                      Boolean(errors.houseRentAllowance),
                      "font-mono tabular-nums"
                    )}
                    min={0}
                  />
                  {errors.houseRentAllowance && (
                    <p className="mt-1 text-[10.5px] font-medium text-danger">
                      {errors.houseRentAllowance}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Medical (10%)</label>
                  <input
                    type="number"
                    placeholder="e.g. 8500"
                    value={medicalAllowance}
                    onChange={(e) => {
                      setMedicalAllowance(Number(e.target.value));
                      clearError("medicalAllowance");
                      clearError("general");
                    }}
                    className={getInputClass(
                      Boolean(errors.medicalAllowance),
                      "font-mono tabular-nums"
                    )}
                    min={0}
                  />
                  {errors.medicalAllowance && (
                    <p className="mt-1 text-[10.5px] font-medium text-danger">
                      {errors.medicalAllowance}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Conveyance</label>
                  <input
                    type="number"
                    placeholder="e.g. 6000"
                    value={conveyanceAllowance}
                    onChange={(e) => {
                      setConveyanceAllowance(Number(e.target.value));
                      clearError("conveyanceAllowance");
                      clearError("general");
                    }}
                    className={getInputClass(
                      Boolean(errors.conveyanceAllowance),
                      "font-mono tabular-nums"
                    )}
                    min={0}
                  />
                  {errors.conveyanceAllowance && (
                    <p className="mt-1 text-[10.5px] font-medium text-danger">
                      {errors.conveyanceAllowance}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Special Allowance</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={specialAllowance}
                    onChange={(e) => {
                      setSpecialAllowance(Number(e.target.value));
                      clearError("specialAllowance");
                      clearError("general");
                    }}
                    className={getInputClass(
                      Boolean(errors.specialAllowance),
                      "font-mono tabular-nums"
                    )}
                    min={0}
                  />
                  {errors.specialAllowance && (
                    <p className="mt-1 text-[10.5px] font-medium text-danger">
                      {errors.specialAllowance}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Withholding Tax</label>
                  <input
                    type="number"
                    placeholder="e.g. 4250"
                    value={taxDeduction}
                    onChange={(e) => {
                      setTaxDeduction(Number(e.target.value));
                      clearError("taxDeduction");
                      clearError("general");
                    }}
                    className={getInputClass(
                      Boolean(errors.taxDeduction),
                      "font-mono tabular-nums"
                    )}
                    min={0}
                  />
                  {errors.taxDeduction && (
                    <p className="mt-1 text-[10.5px] font-medium text-danger">
                      {errors.taxDeduction}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Provident Fund</label>
                  <input
                    type="number"
                    placeholder="e.g. 7000"
                    value={providentFund}
                    onChange={(e) => {
                      setProvidentFund(Number(e.target.value));
                      clearError("providentFund");
                      clearError("general");
                    }}
                    className={getInputClass(
                      Boolean(errors.providentFund),
                      "font-mono tabular-nums"
                    )}
                    min={0}
                  />
                  {errors.providentFund && (
                    <p className="mt-1 text-[10.5px] font-medium text-danger">
                      {errors.providentFund}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Loan Recovery</label>
                  <input
                    type="number"
                    placeholder="e.g. 0"
                    value={loanDeduction}
                    onChange={(e) => {
                      setLoanDeduction(Number(e.target.value));
                      clearError("loanDeduction");
                      clearError("general");
                    }}
                    className={getInputClass(
                      Boolean(errors.loanDeduction),
                      "font-mono tabular-nums"
                    )}
                    min={0}
                  />
                  {errors.loanDeduction && (
                    <p className="mt-1 text-[10.5px] font-medium text-danger">
                      {errors.loanDeduction}
                    </p>
                  )}
                </div>
              </div>

              {errors.general && (
                <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-soft/50 px-3 py-2 text-xs font-semibold text-danger">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errors.general}</span>
                </div>
              )}

              {/* Live Calculation Summary Strip */}
              <dl className="grid grid-cols-3 divide-x divide-border/80 overflow-hidden rounded-xl border border-border/80 bg-slate-50/80 shadow-2xs">
                <div className="px-4 py-2.5 text-center">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Gross Earnings
                  </dt>
                  <dd className="mt-0.5 font-mono text-sm font-bold tabular-nums text-foreground">
                    {formatCurrency(grossSalary)}
                  </dd>
                </div>
                <div className="px-4 py-2.5 text-center">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Total Deductions
                  </dt>
                  <dd className="mt-0.5 font-mono text-sm font-bold tabular-nums text-danger">
                    -{formatCurrency(totalDeductions)}
                  </dd>
                </div>
                <div className="bg-emerald-500/10 px-4 py-2.5 text-center">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Net Disbursed
                  </dt>
                  <dd className="mt-0.5 font-mono text-sm font-extrabold tabular-nums text-emerald-700">
                    {formatCurrency(netSalary)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Section 3: Disbursement Bank Account */}
            <div className="space-y-2.5 border-t border-border/70 pt-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand/90">
                Disbursement Bank Account
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Bank Name</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className={inputClass}
                  >
                    {BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Disbursal Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => {
                      const mode = e.target.value as "Bank Transfer" | "Cheque" | "Cash";
                      setPaymentMode(mode);
                      if (mode === "Cash") {
                        clearError("accountNumber");
                        clearError("accountTitle");
                        clearError("iban");
                      }
                    }}
                    className={inputClass}
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Crossed Cheque</option>
                    <option value="Cash">Cash Counter</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>
                    Account Number {paymentMode !== "Cash" && <span className="text-danger">*</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="0201-0103984712"
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value);
                      clearError("accountNumber");
                    }}
                    className={getInputClass(
                      Boolean(errors.accountNumber),
                      "font-mono"
                    )}
                  />
                  {errors.accountNumber && (
                    <p className="mt-1 flex items-center gap-1 text-[10.5px] font-medium text-danger">
                      <AlertCircle className="size-3 shrink-0" />
                      <span>{errors.accountNumber}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Account Title {paymentMode !== "Cash" && <span className="text-danger">*</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Salman Qureshi"
                    value={accountTitle}
                    onChange={(e) => {
                      setAccountTitle(e.target.value);
                      clearError("accountTitle");
                    }}
                    className={getInputClass(Boolean(errors.accountTitle))}
                  />
                  {errors.accountTitle && (
                    <p className="mt-1 flex items-center gap-1 text-[10.5px] font-medium text-danger">
                      <AlertCircle className="size-3 shrink-0" />
                      <span>{errors.accountTitle}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>
                    IBAN (24 Characters) {paymentMode === "Bank Transfer" && <span className="text-danger">*</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="PK36MEZN0002010103984712"
                    value={iban}
                    onChange={(e) => {
                      setIban(e.target.value);
                      clearError("iban");
                    }}
                    maxLength={24}
                    className={getInputClass(
                      Boolean(errors.iban),
                      "font-mono uppercase"
                    )}
                  />
                  {errors.iban && (
                    <p className="mt-1 flex items-center gap-1 text-[10.5px] font-medium text-danger">
                      <AlertCircle className="size-3 shrink-0" />
                      <span>{errors.iban}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer — Lower Side with Live Net Disbursed Indicator */}
          <DialogFooter className="m-0 shrink-0 flex-row items-center justify-between rounded-none border-t border-border/80 bg-slate-50/80 px-6 py-3.5 sm:justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
              <span className="text-[11px] font-medium text-muted-foreground">
                Net Disbursed:{" "}
                <span className="font-mono font-bold text-emerald-700">
                  {formatCurrency(netSalary)}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <ActionButton
                tone="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </ActionButton>
              <ActionButton tone="primary" size="sm" type="submit">
                <Check className="size-3.5" />
                <span>{initialData ? "Save Changes" : "Create Salary Profile"}</span>
              </ActionButton>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
