import {
  FEE_FINES,
  FEE_REVISIONS,
  FEE_SCHOLARSHIP_AWARDS,
  type FeeFineRecord,
  type FeeRevisionRecord,
  type FeeScholarshipAward,
} from "@/lib/mock/finance";
import { FEE_CHALLANS } from "@/lib/mock/operations";
import { STUDENTS } from "@/lib/mock/institution";
import type { FeeChallan, PreviousDueMonth } from "@/types";

export const FEE_CONFIG_KEY = "edusphere.finance.fee-configuration.v1";
export const FEE_FINES_KEY = "edusphere.finance.fines.v1";
export const FEE_SCHOLARSHIPS_KEY = "edusphere.finance.scholarships.v1";
export const FEE_CHALLANS_KEY = "edusphere.finance.challans.v1";

function readList<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? "null");
    return Array.isArray(value) ? (value as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function writeList<T>(key: string, records: T[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(records));
  } catch {
    // Keep the in-memory workflow usable if browser storage is unavailable.
  }
}

export function resolveMatchingTier(className: string, tiers: FeeRevisionRecord[]): FeeRevisionRecord | undefined {
  const normClass = className.trim().toLowerCase();
  const grade = Number(className.match(/grade\s*(\d+)/i)?.[1]);

  // First pass: exact single grade match in tier name (e.g. "Grade 10 Matriculation" for Grade 10)
  if (!Number.isNaN(grade)) {
    const exactGradeTier = tiers.find((r) => {
      const yearNormalized = r.academicYear.replace(/[\u2010-\u2015]/g, "-");
      if (yearNormalized !== "2026-27" && r.status !== "Active") return false;
      const tName = r.className.toLowerCase();
      const m = tName.match(/grade\s*(\d+)(?!\s*[-–]\s*\d+)/i);
      return m && Number(m[1]) === grade;
    });
    if (exactGradeTier) return exactGradeTier;
  }

  // Second pass: category / grade range matching
  return tiers.find((record) => {
    const yearNormalized = record.academicYear.replace(/[\u2010-\u2015]/g, "-");
    if (yearNormalized !== "2026-27" && record.status !== "Active") return false;
    const tierName = record.className.trim().toLowerCase();

    // Direct name match or containment
    if (tierName === normClass || tierName.includes(normClass) || normClass.includes(tierName)) return true;

    if (!Number.isNaN(grade)) {
      if (tierName.includes("pre-school") || tierName.includes("kindergarten")) return false;
      if (tierName.includes("primary")) return grade >= 1 && grade <= 5;
      if (tierName.includes("middle")) return grade >= 6 && grade <= 8;
      if (tierName.includes("matriculation") || tierName.includes("matric")) return grade >= 9 && grade <= 10;
      if (tierName.includes("o-level")) return grade >= 9 && grade <= 11;
      if (tierName.includes("a-level") || tierName.includes("fsc")) return grade >= 11 && grade <= 12;
    }
    return false;
  });
}

export function calculateTierTotal(tier: FeeRevisionRecord): number {
  const customSum = (tier.customHeads || []).reduce((s, h) => s + (Number(h.amount) || 0), 0);
  return (
    (Number(tier.tuitionFee) || 0) +
    (Number(tier.labCharges) || 0) +
    (Number(tier.sportsCharges) || 0) +
    (Number(tier.libraryFund) || 0) +
    (Number(tier.utilitySurcharge) || 0) +
    (Number(tier.otherCharges) || 0) +
    customSum
  );
}

export function syncChallansWithTiers(challans: FeeChallan[], tiers: FeeRevisionRecord[]): FeeChallan[] {
  return challans.map((challan) => {
    let newAmountDue: number;
    const scholarshipConcession = challan.scholarshipConcession || 0;
    const fineCharges = challan.fineCharges || 0;
    const transportCharges = challan.transportCharges || 0;

    // If the challan has individual custom charges explicitly edited, preserve them!
    if (challan.tuitionFee !== undefined) {
      const customSum = challan.customHeads?.reduce((s, h) => s + (Number(h.amount) || 0), 0) || 0;
      const gross =
        (challan.tuitionFee || 0) +
        (challan.labCharges || 0) +
        (challan.sportsCharges || 0) +
        (challan.libraryFund || 0) +
        (challan.utilitySurcharge || 0) +
        (challan.otherCharges || 0) +
        transportCharges +
        fineCharges +
        (challan.previousDues || 0) +
        customSum;
      newAmountDue = Math.max(0, gross - scholarshipConcession);
    } else {
      const tier = resolveMatchingTier(challan.className, tiers);
      if (!tier) return challan;
      const gross = calculateTierTotal(tier) + (challan.previousDues || 0) + fineCharges + transportCharges;
      newAmountDue = Math.max(0, gross - scholarshipConcession);
    }

    let newPaid = challan.paid;
    let newStatus = challan.status;

    if (challan.status === "Paid") {
      newPaid = newAmountDue;
    } else if (challan.status === "Unpaid") {
      newPaid = 0;
    } else if (challan.status === "Partial") {
      if (newPaid >= newAmountDue) {
        newStatus = "Paid";
      }
    } else if (challan.status === "Overdue") {
      if (newPaid >= newAmountDue) {
        newStatus = "Paid";
      }
    }

    return {
      ...challan,
      totalPayable: newAmountDue,
      paid: newPaid,
      status: newStatus,
    };
  });
}

export const readFeeConfiguration = () => readList<FeeRevisionRecord>(FEE_CONFIG_KEY, FEE_REVISIONS);

export const writeFeeConfiguration = (records: FeeRevisionRecord[]) => {
  writeList(FEE_CONFIG_KEY, records);
  // Automatically update and synchronize Fee Collection challans
  const currentChallans = readList<FeeChallan>(FEE_CHALLANS_KEY, FEE_CHALLANS);
  const updatedChallans = syncChallansWithTiers(currentChallans, records);
  writeList(FEE_CHALLANS_KEY, updatedChallans);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("edusphere:fee-config-updated", {
        detail: { tiers: records, challans: updatedChallans },
      })
    );
  }
};

export function deduplicateChallans(records: FeeChallan[]): FeeChallan[] {
  const seenIds = new Set<string>();
  const seenNumbers = new Set<string>();
  const deduped: FeeChallan[] = [];

  for (const item of records) {
    const idKey = item.id ? String(item.id).trim() : "";
    const numKey = item.challanNumber ? String(item.challanNumber).trim() : "";

    if (idKey && seenIds.has(idKey)) continue;
    if (numKey && seenNumbers.has(numKey)) continue;

    if (idKey) seenIds.add(idKey);
    if (numKey) seenNumbers.add(numKey);
    deduped.push(item);
  }

  return deduped;
}

export const readFeeChallans = (): FeeChallan[] => {
  const stored = readList<FeeChallan>(FEE_CHALLANS_KEY, FEE_CHALLANS);
  const dedupedStored = deduplicateChallans(stored);
  // Auto-heal localStorage if duplicate items exist
  if (dedupedStored.length !== stored.length) {
    writeList(FEE_CHALLANS_KEY, dedupedStored);
  }
  // Merge default enriched properties (such as previousDuesBreakdown) if missing from stored records
  const merged = dedupedStored.map((item) => {
    const defaultMatch = FEE_CHALLANS.find((d) => d.id === item.id || d.challanNumber === item.challanNumber);
    if (defaultMatch) {
      return {
        ...defaultMatch,
        ...item,
        rollNo: item.rollNo || defaultMatch.rollNo,
        admissionNumber: item.admissionNumber || defaultMatch.admissionNumber,
        previousDues: item.previousDues !== undefined ? item.previousDues : defaultMatch.previousDues,
        previousDuesBreakdown: item.previousDuesBreakdown?.length ? item.previousDuesBreakdown : defaultMatch.previousDuesBreakdown,
        collectDate: item.collectDate || defaultMatch.collectDate || item.lastPaymentDate || defaultMatch.lastPaymentDate || item.dueDate || defaultMatch.dueDate || "2026-10-08",
        lastPaymentDate: item.lastPaymentDate || defaultMatch.lastPaymentDate || item.collectDate || defaultMatch.collectDate,
        lastPaymentMethod: item.lastPaymentMethod || defaultMatch.lastPaymentMethod,
        lastReceiptNumber: item.lastReceiptNumber || defaultMatch.lastReceiptNumber,
        payments: item.payments && item.payments.length > 0 ? item.payments : defaultMatch.payments,
        scholarshipConcession: item.scholarshipConcession !== undefined ? item.scholarshipConcession : defaultMatch.scholarshipConcession,
        scholarshipPercent: item.scholarshipPercent !== undefined ? item.scholarshipPercent : defaultMatch.scholarshipPercent,
        scholarshipName: item.scholarshipName || defaultMatch.scholarshipName,
        scholarshipAwardNo: item.scholarshipAwardNo || defaultMatch.scholarshipAwardNo,
      };
    }
    return {
      ...item,
      collectDate: item.collectDate || item.lastPaymentDate || item.dueDate || "2026-10-08",
    };
  });
  const tiers = readFeeConfiguration();
  return deduplicateChallans(syncChallansWithTiers(merged, tiers));
};

export function getStudentRollNo(challan: FeeChallan): string {
  if (challan.rollNo && challan.rollNo.trim()) {
    const val = challan.rollNo.trim();
    return val.toLowerCase().startsWith("roll") ? val : `Roll #${val}`;
  }
  const name = challan.student.trim().toLowerCase();
  const matchedStudent = STUDENTS.find((s) => s.name.trim().toLowerCase() === name);
  if (matchedStudent?.rollNo) {
    return `Roll #${matchedStudent.rollNo}`;
  }
  const lastDigits = challan.challanNumber.match(/\d+$/)?.[0];
  if (lastDigits) {
    const num = (parseInt(lastDigits.slice(-2), 10) % 40) + 10;
    return `Roll #${num}`;
  }
  return "Roll #10";
}

export function getChallanCollectionDate(challan: FeeChallan): string | undefined {
  if (challan.collectDate) return challan.collectDate;
  if (challan.lastPaymentDate) return challan.lastPaymentDate;
  if (challan.payments && challan.payments.length > 0) {
    const valid = challan.payments.filter((p) => p.paymentDate);
    if (valid.length > 0) return valid[valid.length - 1].paymentDate;
  }
  if (challan.status === "Paid" || challan.paid > 0) {
    return challan.dueDate;
  }
  return undefined;
}

export const writeFeeChallans = (records: FeeChallan[]) => {
  const deduped = deduplicateChallans(records);
  writeList(FEE_CHALLANS_KEY, deduped);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("edusphere:fee-challans-updated", {
        detail: deduped,
      })
    );
  }
};

export const readFeeFines = () => readList<FeeFineRecord>(FEE_FINES_KEY, FEE_FINES);
export const writeFeeFines = (records: FeeFineRecord[]) => {
  writeList(FEE_FINES_KEY, records);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("edusphere:fee-fines-updated", {
        detail: records,
      })
    );
  }
};

export const readFeeScholarships = () =>
  readList<FeeScholarshipAward>(FEE_SCHOLARSHIPS_KEY, FEE_SCHOLARSHIP_AWARDS);

export const writeFeeScholarships = (records: FeeScholarshipAward[]) => {
  writeList(FEE_SCHOLARSHIPS_KEY, records);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("edusphere:fee-scholarships-updated", {
        detail: records,
      })
    );
  }
};

/**
 * Automatically synchronizes an awarded or updated scholarship concession
 * with the student's fee voucher in Fee Collection.
 */
export function syncScholarshipWithFeeChallan(
  scholarship: FeeScholarshipAward,
  action: "award" | "update" | "revoke"
): FeeChallan[] {
  const currentChallans = readFeeChallans();
  const tiers = readFeeConfiguration();
  const studentName = scholarship.student.trim().toLowerCase();
  const rollDigits = scholarship.rollNo ? scholarship.rollNo.replace(/\D/g, "") : "";

  const matchingIndices: number[] = [];
  currentChallans.forEach((c, idx) => {
    const cName = c.student.trim().toLowerCase();
    const cRollDigits = c.rollNo ? c.rollNo.replace(/\D/g, "") : "";
    if (cName === studentName || (rollDigits && cRollDigits && rollDigits === cRollDigits)) {
      matchingIndices.push(idx);
    }
  });

  if (matchingIndices.length > 0) {
    matchingIndices.forEach((targetIdx) => {
      const target = { ...currentChallans[targetIdx] };
      const tier = resolveMatchingTier(target.className, tiers);
      const tuition = target.tuitionFee ?? tier?.tuitionFee ?? 18500;
      const lab = target.labCharges ?? tier?.labCharges ?? 0;
      const sports = target.sportsCharges ?? tier?.sportsCharges ?? 0;
      const transport = target.transportCharges ?? 0;
      const fine = target.fineCharges ?? 0;
      const lib = target.libraryFund ?? tier?.libraryFund ?? 0;
      const util = target.utilitySurcharge ?? tier?.utilitySurcharge ?? 0;
      const other = target.otherCharges ?? tier?.otherCharges ?? 0;
      const customSum = target.customHeads?.reduce((s, h) => s + (Number(h.amount) || 0), 0) || 0;
      const previousDues = target.previousDues || 0;

      const gross = tuition + lab + sports + transport + fine + lib + util + other + customSum + previousDues;

      if ((action === "award" || action === "update") && scholarship.status === "Active") {
        const concessionAmt = scholarship.monthlyValue > 0
          ? scholarship.monthlyValue
          : Math.round((tuition * (scholarship.concessionPercent || 0)) / 100);

        target.tuitionFee = tuition;
        target.scholarshipConcession = concessionAmt;
        target.scholarshipPercent = scholarship.concessionPercent;
        target.scholarshipName = scholarship.scholarshipName;
        target.scholarshipAwardNo = scholarship.awardNo;
        target.totalPayable = Math.max(0, gross - concessionAmt);
      } else {
        // Revoke, Lapsed or Under Review
        delete target.scholarshipConcession;
        delete target.scholarshipPercent;
        delete target.scholarshipName;
        delete target.scholarshipAwardNo;
        target.totalPayable = gross;
      }

      if (target.paid >= target.totalPayable && target.totalPayable > 0) {
        target.status = "Paid";
      } else if (target.paid > 0 && target.paid < target.totalPayable) {
        target.status = "Partial";
      } else if (target.paid === 0) {
        target.status = "Unpaid";
      }

      currentChallans[targetIdx] = target;
    });

    writeFeeChallans(currentChallans);
    return currentChallans;
  } else if ((action === "award" || action === "update") && scholarship.status === "Active") {
    // If no fee voucher exists yet for this student in Fee Collection, auto-generate one!
    const tier = resolveMatchingTier(scholarship.className, tiers);
    const tuition = tier?.tuitionFee ?? 18500;
    const lab = tier?.labCharges ?? 2500;
    const sports = tier?.sportsCharges ?? 1000;
    const other = (tier?.libraryFund || 0) + (tier?.utilitySurcharge || 0) + (tier?.otherCharges || 0) || 3200;
    const concessionAmt = scholarship.monthlyValue > 0
      ? scholarship.monthlyValue
      : Math.round((tuition * (scholarship.concessionPercent || 0)) / 100);
    const gross = tuition + lab + sports + other;
    const netTotal = Math.max(0, gross - concessionAmt);

    const [y, m] = (scholarship.awardedDate || "2026-10-08").split("-");
    const prefix = `CH-${(y || "26").slice(2)}${m || "10"}-`;
    const maxNo = currentChallans.reduce((acc, c) => {
      const n = Number(c.challanNumber.split("-").pop());
      return Number.isFinite(n) ? Math.max(acc, n) : acc;
    }, 4800);
    const challanNumber = `${prefix}${String(maxNo + 1).padStart(6, "0")}`;

    const rollFormatted = scholarship.rollNo
      ? (scholarship.rollNo.toLowerCase().startsWith("roll") ? scholarship.rollNo : `Roll #${scholarship.rollNo}`)
      : "Roll #15";

    const newChallan: FeeChallan = {
      id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      challanNumber,
      student: scholarship.student.trim(),
      rollNo: rollFormatted,
      className: scholarship.className,
      campus: scholarship.campus,
      monthYear: "Oct 2026",
      dueDate: "2026-10-30",
      tuitionFee: tuition,
      labCharges: lab,
      sportsCharges: sports,
      transportCharges: 0,
      fineCharges: 0,
      otherCharges: other,
      scholarshipConcession: concessionAmt,
      scholarshipPercent: scholarship.concessionPercent,
      scholarshipName: scholarship.scholarshipName,
      scholarshipAwardNo: scholarship.awardNo,
      totalPayable: netTotal,
      paid: 0,
      status: "Unpaid",
      collectDate: "2026-10-08",
    };

    const updated = [newChallan, ...currentChallans];
    writeFeeChallans(updated);
    return updated;
  }

  return currentChallans;
}

/**
 * Automatically synchronizes an institutional fine (imposed, paid, waived, reopened)
 * with the student's fee voucher in Fee Collection.
 */
export function syncFineWithFeeChallan(
  fine: FeeFineRecord,
  action: "impose" | "paid" | "waived" | "reopen"
): FeeChallan[] {
  const currentChallans = readFeeChallans();
  const studentName = fine.student.trim().toLowerCase();

  const matchingIndices: number[] = [];
  currentChallans.forEach((c, idx) => {
    if (c.student.trim().toLowerCase() === studentName) {
      matchingIndices.push(idx);
    }
  });

  if (matchingIndices.length > 0) {
    // Prefer active / unpaid / overdue / partial vouchers first
    let targetIdx = matchingIndices.find((idx) => {
      const st = currentChallans[idx].status;
      return st === "Unpaid" || st === "Overdue" || st === "Partial";
    });

    if (targetIdx === undefined) {
      targetIdx = matchingIndices[0];
    }

    const target = { ...currentChallans[targetIdx] };

    if (action === "impose") {
      const prevFine = target.fineCharges || 0;
      target.fineCharges = prevFine + fine.amount;
      target.totalPayable = (target.totalPayable || 0) + fine.amount;
      if (target.status === "Paid") {
        target.status = target.paid > 0 ? "Partial" : "Unpaid";
      }
    } else if (action === "waived") {
      const prevFine = target.fineCharges || 0;
      target.fineCharges = Math.max(0, prevFine - fine.amount);
      target.totalPayable = Math.max(target.paid, (target.totalPayable || 0) - fine.amount);
      if (target.paid >= target.totalPayable && target.totalPayable > 0) {
        target.status = "Paid";
      }
    } else if (action === "paid") {
      target.paid = (target.paid || 0) + fine.amount;
      if (target.paid >= target.totalPayable) {
        target.status = "Paid";
      }
    } else if (action === "reopen") {
      target.paid = Math.max(0, (target.paid || 0) - fine.amount);
      if (target.paid < target.totalPayable) {
        target.status = target.paid > 0 ? "Partial" : "Unpaid";
      }
    }

    currentChallans[targetIdx] = target;
    writeFeeChallans(currentChallans);
    return currentChallans;
  } else if (action === "impose") {
    // If no fee voucher exists yet for this student in Fee Collection, automatically create one!
    const tiers = readFeeConfiguration();
    const tier = resolveMatchingTier(fine.className, tiers);
    const tuition = tier?.tuitionFee ?? 18500;
    const lab = tier?.labCharges ?? 2500;
    const sports = tier?.sportsCharges ?? 1000;
    const other = (tier?.libraryFund || 0) + (tier?.utilitySurcharge || 0) + (tier?.otherCharges || 0) || 3200;
    const total = tuition + lab + sports + other + fine.amount;

    const [y, m] = (fine.imposedDate || "2026-10-08").split("-");
    const prefix = `CH-${(y || "26").slice(2)}${m || "10"}-`;
    const maxNo = currentChallans.reduce((acc, c) => {
      const n = Number(c.challanNumber.split("-").pop());
      return Number.isFinite(n) ? Math.max(acc, n) : acc;
    }, 4800);
    const challanNumber = `${prefix}${String(maxNo + 1).padStart(6, "0")}`;

    const newChallan: FeeChallan = {
      id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      challanNumber,
      student: fine.student.trim(),
      rollNo: fine.rollNo ? (fine.rollNo.startsWith("Roll") ? fine.rollNo : `Roll #${fine.rollNo}`) : "Roll #15",
      className: fine.className,
      campus: fine.campus,
      monthYear: "Oct 2026",
      dueDate: fine.dueDate || "2026-10-30",
      tuitionFee: tuition,
      labCharges: lab,
      sportsCharges: sports,
      transportCharges: 0,
      fineCharges: fine.amount,
      otherCharges: other,
      totalPayable: total,
      paid: 0,
      status: "Unpaid",
      collectDate: "2026-10-08",
    };

    const updated = [newChallan, ...currentChallans];
    writeFeeChallans(updated);
    return updated;
  }
  return currentChallans;
}

export interface PreviousDuesSummary {
  total: number;
  count: number;
  details: string;
  months: string[];
  priorChallans: PreviousDueMonth[];
  isClear: boolean;
}

export function calculatePreviousMonthDues(
  challan: FeeChallan,
  allChallans: FeeChallan[] = []
): PreviousDuesSummary {
  const studentName = challan.student.trim().toLowerCase();

  // 1. Check if the challan has an explicit previousDuesBreakdown array
  if (challan.previousDuesBreakdown && challan.previousDuesBreakdown.length > 0) {
    const priorChallans = challan.previousDuesBreakdown;
    const calculatedSum = priorChallans.reduce((sum, item) => sum + item.balance, 0);
    const total = challan.previousDues !== undefined ? challan.previousDues : calculatedSum;
    const months = priorChallans.map((c) => c.monthYear);
    const details = priorChallans.map((c) => `${c.monthYear}: Rs ${c.balance.toLocaleString()}`).join(", ");
    return {
      total,
      count: priorChallans.length,
      details,
      months,
      priorChallans,
      isClear: total <= 0,
    };
  }

  // 2. Check dynamic prior challans in allChallans for the same student
  const prior = allChallans.filter(
    (c) =>
      c.id !== challan.id &&
      c.student.trim().toLowerCase() === studentName &&
      c.dueDate < challan.dueDate &&
      c.totalPayable > c.paid
  );

  if (prior.length > 0) {
    const priorChallans: PreviousDueMonth[] = prior.map((c) => ({
      id: c.id,
      monthYear: c.monthYear,
      challanNumber: c.challanNumber,
      dueDate: c.dueDate,
      billedAmount: c.totalPayable,
      paidAmount: c.paid,
      balance: Math.max(0, c.totalPayable - c.paid),
      status: c.status,
      notes: c.status === "Overdue" ? "Billing cycle overdue" : "Remaining balance",
    }));

    const total = challan.previousDues !== undefined && challan.previousDues > 0
      ? challan.previousDues
      : priorChallans.reduce((sum, item) => sum + item.balance, 0);
    const months = priorChallans.map((c) => c.monthYear);
    const details = priorChallans.map((c) => `${c.monthYear}: Rs ${c.balance.toLocaleString()}`).join(", ");

    return {
      total,
      count: priorChallans.length,
      details,
      months,
      priorChallans,
      isClear: total <= 0,
    };
  }

  // 3. If previousDues was explicitly provided on the challan (> 0)
  if (challan.previousDues !== undefined && challan.previousDues > 0) {
    const total = challan.previousDues;
    
    // Synthesize realistic prior month breakdown based on the current monthYear
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const parts = (challan.monthYear || "").split(" ");
    const curMonthName = parts[0] || "Oct";
    const curYear = parseInt(parts[1] || "2026", 10);
    const curMonthIdx = MONTHS.indexOf(curMonthName);
    
    const prevMonthIdx1 = curMonthIdx > 0 ? curMonthIdx - 1 : 11;
    const prevYear1 = curMonthIdx > 0 ? curYear : curYear - 1;
    const m1Str = `${MONTHS[prevMonthIdx1]} ${prevYear1}`;
    
    const prevMonthIdx2 = prevMonthIdx1 > 0 ? prevMonthIdx1 - 1 : 11;
    const prevYear2 = prevMonthIdx1 > 0 ? prevYear1 : prevYear1 - 1;
    const m2Str = `${MONTHS[prevMonthIdx2]} ${prevYear2}`;

    let priorChallans: PreviousDueMonth[];

    if (total > 25000) {
      const m1Bal = Math.round(total * 0.6);
      const m2Bal = total - m1Bal;
      priorChallans = [
        {
          id: "synth-1",
          monthYear: m1Str,
          challanNumber: `CH-${String(prevYear1).slice(2)}${String(prevMonthIdx1 + 1).padStart(2, "0")}-003921`,
          dueDate: `${prevYear1}-${String(prevMonthIdx1 + 1).padStart(2, "0")}-10`,
          billedAmount: m1Bal,
          paidAmount: 0,
          balance: m1Bal,
          status: "Overdue",
          notes: "Full billing cycle outstanding",
        },
        {
          id: "synth-2",
          monthYear: m2Str,
          challanNumber: `CH-${String(prevYear2).slice(2)}${String(prevMonthIdx2 + 1).padStart(2, "0")}-002819`,
          dueDate: `${prevYear2}-${String(prevMonthIdx2 + 1).padStart(2, "0")}-10`,
          billedAmount: m2Bal + 5000,
          paidAmount: 5000,
          balance: m2Bal,
          status: "Partial",
          notes: "Remaining balance after partial payment",
        },
      ];
    } else {
      priorChallans = [
        {
          id: "synth-1",
          monthYear: m1Str,
          challanNumber: `CH-${String(prevYear1).slice(2)}${String(prevMonthIdx1 + 1).padStart(2, "0")}-003921`,
          dueDate: `${prevYear1}-${String(prevMonthIdx1 + 1).padStart(2, "0")}-10`,
          billedAmount: total,
          paidAmount: 0,
          balance: total,
          status: "Overdue",
          notes: "Prior cycle dues carried forward",
        },
      ];
    }

    const months = priorChallans.map((c) => c.monthYear);
    const details = priorChallans.map((c) => `${c.monthYear}: Rs ${c.balance.toLocaleString()}`).join(", ");

    return {
      total,
      count: priorChallans.length,
      details,
      months,
      priorChallans,
      isClear: false,
    };
  }

  // 4. Fully clear / no previous dues
  return {
    total: 0,
    count: 0,
    details: "No remaining dues from prior cycles",
    months: [],
    priorChallans: [],
    isClear: true,
  };
}
