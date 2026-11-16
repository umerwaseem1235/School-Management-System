import type {
  AdmissionDocumentRecord,
  AdmissionDossier,
  FeeStatus,
  Student,
  StudentStatus,
} from "@/types";

export type AdmissionStepId = 1 | 2 | 3 | 4 | 5 | 6;

export interface AdmissionStepMeta {
  id: AdmissionStepId;
  title: string;
  shortTitle: string;
  description: string;
}

export const ADMISSION_STEPS: AdmissionStepMeta[] = [
  {
    id: 1,
    title: "Student Information",
    shortTitle: "Student Info",
    description: "Identity, birth details & photograph",
  },
  {
    id: 2,
    title: "Parent / Guardian Information",
    shortTitle: "Parent & Guardian",
    description: "Father, mother & guardian contacts",
  },
  {
    id: 3,
    title: "Address Information",
    shortTitle: "Address",
    description: "Residential & permanent location",
  },
  {
    id: 4,
    title: "Academic & Admission Info",
    shortTitle: "Academic",
    description: "Class placement & prior schooling",
  },
  {
    id: 5,
    title: "Fee Details",
    shortTitle: "Fee Details",
    description: "Fee structure, concession & payment",
  },
  {
    id: 6,
    title: "Documents & Final Review",
    shortTitle: "Review",
    description: "Verification, draft or submit",
  },
];

export const APPLYING_CLASSES = [
  "Playgroup",
  "Nursery",
  "KG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
] as const;

export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "Not Known",
] as const;

export const RELIGIONS = [
  "Islam",
  "Christianity",
  "Hinduism",
  "Sikhism",
  "Other",
] as const;

export const PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Azad Jammu & Kashmir",
  "Gilgit-Baltistan",
] as const;

export const ACADEMIC_SESSIONS = [
  "2026-2027",
  "2025-2026",
  "2027-2028",
] as const;

export const GUARDIAN_RELATIONS = [
  "Uncle",
  "Aunt",
  "Grandfather",
  "Grandmother",
  "Elder Sibling",
  "Legal Guardian",
  "Other",
] as const;

export const SECTIONS = ["A", "B", "C", "D"] as const;

export const ADMISSION_PAYMENT_METHODS = [
  "Cash Counter",
  "Bank Challan",
  "Online Transfer",
  "Card / POS",
] as const;

export type AdmissionPaymentMethod = (typeof ADMISSION_PAYMENT_METHODS)[number];

export const ADMISSION_DISCOUNT_REASONS = [
  "None",
  "Sibling Discount",
  "Merit Scholarship",
  "Staff Ward Concession",
  "Need-Based Aid",
  "Early Bird Waiver",
] as const;

export interface FeeSchedulePreset {
  tierLabel: string;
  admissionFee: number;
  tuitionFee: number;
  securityDeposit: number;
  annualCharges: number;
}

/** Returns standard fee defaults mapped to the selected class tier. */
export function getDefaultFeeScheduleForClass(applyingClass: string): FeeSchedulePreset {
  const c = applyingClass.toLowerCase();
  if (c.includes("playgroup") || c.includes("nursery") || c === "kg") {
    return {
      tierLabel: "Pre-School & KG",
      admissionFee: 15000,
      tuitionFee: 11500,
      securityDeposit: 10000,
      annualCharges: 4500,
    };
  }
  if (/\b(6|7|8)\b/.test(c)) {
    return {
      tierLabel: "Middle School",
      admissionFee: 20000,
      tuitionFee: 15800,
      securityDeposit: 12000,
      annualCharges: 6500,
    };
  }
  if (/\b(9|10)\b/.test(c)) {
    return {
      tierLabel: "Matriculation",
      admissionFee: 25000,
      tuitionFee: 18500,
      securityDeposit: 15000,
      annualCharges: 8000,
    };
  }
  return {
    tierLabel: "Primary Tier",
    admissionFee: 18000,
    tuitionFee: 13200,
    securityDeposit: 10000,
    annualCharges: 5500,
  };
}

export interface AdmissionFormState {
  // Step 1 — Student Information
  studentFullName: string;
  dateOfBirth: string;
  gender: "Male" | "Female";
  bloodGroup: string;
  religion: string;
  nationality: string;
  bFormNumber: string;
  photoDataUrl: string;
  photoFileName: string;

  // Step 2 — Parent / Guardian Information
  fatherName: string;
  fatherCnic: string;
  fatherOccupation: string;
  fatherContact: string;
  motherName: string;
  motherContact: string;
  hasSeparateGuardian: boolean;
  guardianName: string;
  guardianRelation: string;
  guardianCnic: string;
  guardianContact: string;
  email: string;

  // Step 3 — Address Information
  currentAddress: string;
  sameAsCurrentAddress: boolean;
  permanentAddress: string;
  city: string;
  province: string;
  postalCode: string;

  // Step 4 — Academic & Admission Information
  academicSession: string;
  admissionDate: string;
  applyingClass: string;
  campus: string;
  section: string;
  rollNo: string;
  previousSchoolAttended: "Yes" | "No";
  previousSchoolName: string;
  previousClass: string;
  previousAcademicRecord: string;
  transferCertificateStatus: "Submitted" | "Pending" | "Not Applicable";
  transferCertificateNo: string;
  admissionCategory: "New" | "Transfer";
  admissionPathway: "Direct Admission" | "Entry Test";
  entryScore: string;
  status: StudentStatus;

  // Step 5 — Fee Details
  admissionFee: string;
  tuitionFee: string;
  securityDeposit: string;
  annualCharges: string;
  transportFee: string;
  discountAmount: string;
  discountReason: string;
  feeStatus: FeeStatus;
  paidAmount: string;
  paymentMethod: AdmissionPaymentMethod;
  challanNumber: string;
  feeCustomized?: boolean;

  // Step 6 — Documents
  documents: {
    studentPhoto: AdmissionDocumentRecord;
    birthCertificate: AdmissionDocumentRecord;
    fatherCnicCopy: AdmissionDocumentRecord;
    leavingCertificate: AdmissionDocumentRecord;
    academicDocuments: AdmissionDocumentRecord;
  };
}

function toMoney(val: string | number | undefined): number {
  const n = typeof val === "number" ? val : Number(val);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n);
}

export function calculateAdmissionFeeTotals(
  form: Pick<
    AdmissionFormState,
    | "admissionFee"
    | "tuitionFee"
    | "securityDeposit"
    | "annualCharges"
    | "transportFee"
    | "discountAmount"
    | "paidAmount"
  >
) {
  const admissionFee = toMoney(form.admissionFee);
  const tuitionFee = toMoney(form.tuitionFee);
  const securityDeposit = toMoney(form.securityDeposit);
  const annualCharges = toMoney(form.annualCharges);
  const transportFee = toMoney(form.transportFee);
  const grossTotal =
    admissionFee + tuitionFee + securityDeposit + annualCharges + transportFee;
  const discount = Math.min(grossTotal, toMoney(form.discountAmount));
  const netPayable = Math.max(0, grossTotal - discount);
  const paid = Math.min(netPayable, toMoney(form.paidAmount));
  const balanceDue = Math.max(0, netPayable - paid);
  return {
    admissionFee,
    tuitionFee,
    securityDeposit,
    annualCharges,
    transportFee,
    grossTotal,
    discount,
    netPayable,
    paid,
    balanceDue,
  };
}

export function createInitialAdmissionFormState(
  defaultCampus = "Main Campus — Gulberg"
): AdmissionFormState {
  const today = new Date().toISOString().slice(0, 10);
  const initialClass = "Class 1";
  const feeDefaults = getDefaultFeeScheduleForClass(initialClass);
  const initialPayable =
    feeDefaults.admissionFee +
    feeDefaults.tuitionFee +
    feeDefaults.securityDeposit +
    feeDefaults.annualCharges;
  const challanSuffix = String(Math.floor(1000 + Math.random() * 8999));

  return {
    studentFullName: "",
    dateOfBirth: "",
    gender: "Male",
    bloodGroup: "",
    religion: "",
    nationality: "Pakistani",
    bFormNumber: "",
    photoDataUrl: "",
    photoFileName: "",

    fatherName: "",
    fatherCnic: "",
    fatherOccupation: "",
    fatherContact: "",
    motherName: "",
    motherContact: "",
    hasSeparateGuardian: false,
    guardianName: "",
    guardianRelation: "Uncle",
    guardianCnic: "",
    guardianContact: "",
    email: "",

    currentAddress: "",
    sameAsCurrentAddress: false,
    permanentAddress: "",
    city: "",
    province: "Punjab",
    postalCode: "",

    academicSession: "2026-2027",
    admissionDate: today,
    applyingClass: initialClass,
    campus: defaultCampus,
    section: "A",
    rollNo: String(Math.floor(10 + Math.random() * 40)),
    previousSchoolAttended: "No",
    previousSchoolName: "",
    previousClass: "",
    previousAcademicRecord: "",
    transferCertificateStatus: "Not Applicable",
    transferCertificateNo: "",
    admissionCategory: "New",
    admissionPathway: "Direct Admission",
    entryScore: "85",
    status: "Active",

    admissionFee: String(feeDefaults.admissionFee),
    tuitionFee: String(feeDefaults.tuitionFee),
    securityDeposit: String(feeDefaults.securityDeposit),
    annualCharges: String(feeDefaults.annualCharges),
    transportFee: "0",
    discountAmount: "0",
    discountReason: "None",
    feeStatus: "Paid",
    paidAmount: String(initialPayable),
    paymentMethod: "Cash Counter",
    challanNumber: `CH-2611-${challanSuffix}`,
    feeCustomized: false,

    documents: {
      studentPhoto: { verified: false },
      birthCertificate: { verified: false },
      fatherCnicCopy: { verified: false },
      leavingCertificate: { verified: false },
      academicDocuments: { verified: false },
    },
  };
}

/** Formats 13 digits as XXXXX-XXXXXXX-X when typing CNICs cleanly. */
export function formatCnicInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

/** Formats Pakistani mobile numbers cleanly if numeric (e.g. 0300-1234567). */
export function formatPhoneInput(raw: string): string {
  if (raw.startsWith("+")) return raw.slice(0, 16);
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

/** Computes readable age string from YYYY-MM-DD date of birth. */
export function calculateAgeLabel(dob: string): string {
  if (!dob) return "";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "";
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
    years -= 1;
    months += 12;
  }
  if (now.getDate() < birth.getDate()) {
    months = (months + 11) % 12;
  }
  if (years < 0) return "";
  if (years === 0) return `${months} mo${months === 1 ? "" : "s"}`;
  return `${years} yr${years === 1 ? "" : "s"}${months > 0 ? ` ${months} mo` : ""}`;
}

/** Resizes an image file to a lightweight JPEG DataURL for safe persistence in localStorage. */
export function compressImageToDataUrl(file: File, maxSize = 260): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(String(reader.result || ""));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.84));
      };
      img.onerror = () => reject(new Error("Invalid image file"));
      img.src = String(reader.result || "");
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Validates a specific step and returns a field -> error message map. */
export function validateAdmissionStep(
  step: AdmissionStepId,
  form: AdmissionFormState
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step === 1) {
    if (!form.studentFullName.trim()) {
      errors.studentFullName = "Student full name is required";
    }
    if (!form.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required";
    } else if (new Date(form.dateOfBirth) > new Date()) {
      errors.dateOfBirth = "Date of birth cannot be in the future";
    }
    if (!form.nationality.trim()) {
      errors.nationality = "Nationality is required";
    }
    if (!form.bFormNumber.trim()) {
      errors.bFormNumber = "B-Form / Birth Certificate number is required";
    }
  }

  if (step === 2) {
    if (!form.fatherName.trim()) {
      errors.fatherName = "Father's full name is required";
    }
    if (!form.fatherCnic.trim()) {
      errors.fatherCnic = "Father's CNIC is required";
    } else if (form.fatherCnic.replace(/\D/g, "").length < 13) {
      errors.fatherCnic = "Enter a valid 13-digit CNIC (e.g. 35202-1234567-1)";
    }
    if (!form.fatherContact.trim()) {
      errors.fatherContact = "Father's contact number is required";
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Enter a valid email address";
    }
    if (form.hasSeparateGuardian) {
      if (!form.guardianName.trim()) {
        errors.guardianName = "Guardian full name is required";
      }
      if (!form.guardianContact.trim()) {
        errors.guardianContact = "Guardian contact number is required";
      }
    }
  }

  if (step === 3) {
    if (!form.currentAddress.trim()) {
      errors.currentAddress = "Current residential address is required";
    }
    if (!form.sameAsCurrentAddress && !form.permanentAddress.trim()) {
      errors.permanentAddress = "Permanent address is required";
    }
    if (!form.city.trim()) {
      errors.city = "City is required";
    }
    if (!form.province.trim()) {
      errors.province = "Province is required";
    }
  }

  if (step === 4) {
    if (!form.academicSession) {
      errors.academicSession = "Academic session is required";
    }
    if (!form.admissionDate) {
      errors.admissionDate = "Admission date is required";
    }
    if (!form.applyingClass) {
      errors.applyingClass = "Applying class is required";
    }
    if (form.previousSchoolAttended === "Yes") {
      if (!form.previousSchoolName.trim()) {
        errors.previousSchoolName = "Previous school name is required";
      }
      if (!form.previousClass.trim()) {
        errors.previousClass = "Previous class is required";
      }
    }
  }

  if (step === 5) {
    const numericFields: Array<[keyof AdmissionFormState, string]> = [
      ["admissionFee", "Admission fee"],
      ["tuitionFee", "Monthly tuition fee"],
      ["securityDeposit", "Security deposit"],
      ["annualCharges", "Annual charges"],
      ["transportFee", "Transport fee"],
      ["discountAmount", "Discount amount"],
      ["paidAmount", "Paid amount"],
    ];

    for (const [key, label] of numericFields) {
      const raw = String(form[key] ?? "").trim();
      const parsed = raw === "" ? 0 : Number(raw);
      if (!Number.isFinite(parsed) || parsed < 0) {
        errors[key] = `${label} must be 0 or greater`;
      }
    }

    const grossTotal =
      toMoney(form.admissionFee) +
      toMoney(form.tuitionFee) +
      toMoney(form.securityDeposit) +
      toMoney(form.annualCharges) +
      toMoney(form.transportFee);

    if (toMoney(form.discountAmount) > grossTotal) {
      errors.discountAmount = "Concession cannot exceed gross total";
    }

    const netPayable = Math.max(0, grossTotal - Math.min(grossTotal, toMoney(form.discountAmount)));
    if (toMoney(form.paidAmount) > netPayable) {
      errors.paidAmount = "Paid amount cannot exceed net payable";
    }
  }

  return errors;
}

export type SubmittedAdmissionStudent = Student & {
  score?: number;
  admissionType?: "Entry Test" | "Direct Admission";
  admissionCategory?: "New" | "Transfer";
  feeStatus: FeeStatus;
  status: StudentStatus;
};

/** Builds a normalized Student + AdmissionDossier payload from the 5-step form state. */
export function buildStudentSubmission(
  form: AdmissionFormState,
  existingCount: number
): SubmittedAdmissionStudent {
  const nextNumber = 412 + existingCount + 1;
  const admissionNumber = `SMS-2026-${String(nextNumber).padStart(4, "0")}`;
  const parsedScore =
    form.admissionPathway === "Entry Test"
      ? Math.min(100, Math.max(0, parseInt(form.entryScore, 10) || 85))
      : undefined;

  const primaryGuardian = form.hasSeparateGuardian
    ? form.guardianName.trim()
    : form.fatherName.trim();
  const primaryPhone = form.hasSeparateGuardian
    ? form.guardianContact.trim()
    : form.fatherContact.trim();
  const effectivePermanentAddress = form.sameAsCurrentAddress
    ? form.currentAddress.trim()
    : form.permanentAddress.trim();
  const hasPriorSchool = form.previousSchoolAttended === "Yes";
  const feeTotals = calculateAdmissionFeeTotals(form);
  const derivedFeeStatus: FeeStatus =
    feeTotals.netPayable === 0 || feeTotals.balanceDue === 0
      ? "Paid"
      : feeTotals.paid > 0
      ? "Partial"
      : form.feeStatus === "Overdue"
      ? "Overdue"
      : "Unpaid";

  const dossier: AdmissionDossier = {
    dateOfBirth: form.dateOfBirth,
    bloodGroup: form.bloodGroup || undefined,
    religion: form.religion || undefined,
    nationality: form.nationality.trim(),
    bFormNumber: form.bFormNumber.trim(),
    photoDataUrl: form.photoDataUrl || undefined,
    photoFileName: form.photoFileName || undefined,

    fatherName: form.fatherName.trim(),
    fatherCnic: form.fatherCnic.trim(),
    fatherOccupation: form.fatherOccupation.trim() || undefined,
    fatherContact: form.fatherContact.trim(),
    motherName: form.motherName.trim() || undefined,
    motherContact: form.motherContact.trim() || undefined,
    hasSeparateGuardian: form.hasSeparateGuardian,
    guardianName: form.hasSeparateGuardian ? form.guardianName.trim() : undefined,
    guardianRelation: form.hasSeparateGuardian ? form.guardianRelation : undefined,
    guardianCnic: form.hasSeparateGuardian ? form.guardianCnic.trim() || undefined : undefined,
    guardianContact: form.hasSeparateGuardian ? form.guardianContact.trim() : undefined,
    email: form.email.trim() || undefined,

    currentAddress: form.currentAddress.trim(),
    permanentAddress: effectivePermanentAddress,
    city: form.city.trim(),
    province: form.province,
    postalCode: form.postalCode.trim() || undefined,

    academicSession: form.academicSession,
    admissionDate: form.admissionDate,
    previousSchoolAttended: form.previousSchoolAttended,
    ...(hasPriorSchool
      ? {
          previousSchoolName: form.previousSchoolName.trim(),
          previousClass: form.previousClass.trim(),
          previousAcademicRecord: form.previousAcademicRecord.trim() || undefined,
          transferCertificate: form.transferCertificateNo.trim()
            ? `${form.transferCertificateStatus} (${form.transferCertificateNo.trim()})`
            : form.transferCertificateStatus,
        }
      : {}),
    admissionCategory: form.admissionCategory,

    feeDetails: {
      admissionFee: feeTotals.admissionFee,
      tuitionFee: feeTotals.tuitionFee,
      securityDeposit: feeTotals.securityDeposit,
      annualCharges: feeTotals.annualCharges,
      transportFee: feeTotals.transportFee,
      discountAmount: feeTotals.discount,
      discountReason:
        feeTotals.discount > 0 && form.discountReason && form.discountReason !== "None"
          ? form.discountReason
          : undefined,
      totalPayable: feeTotals.netPayable,
      paidAmount: feeTotals.paid,
      paymentMethod: form.paymentMethod,
      challanNumber: form.challanNumber.trim() || undefined,
      feeStatus: derivedFeeStatus,
    },

    documents: {
      studentPhoto: form.documents.studentPhoto,
      birthCertificate: form.documents.birthCertificate,
      fatherCnicCopy: form.documents.fatherCnicCopy,
      ...(hasPriorSchool
        ? {
            leavingCertificate: form.documents.leavingCertificate,
            academicDocuments: form.documents.academicDocuments,
          }
        : {}),
    },
  };

  return {
    id: `s-${Date.now()}`,
    admissionNumber,
    rollNo: form.rollNo.trim() || String(Math.floor(10 + Math.random() * 40)),
    name: form.studentFullName.trim(),
    gender: form.gender,
    className: form.applyingClass,
    section: form.section,
    campus: form.campus,
    guardian: primaryGuardian,
    phone: primaryPhone,
    attendance: 100,
    feeStatus: derivedFeeStatus,
    status: form.status,
    enrolledOn: form.admissionDate || new Date().toISOString().slice(0, 10),
    score: parsedScore,
    admissionType: form.admissionPathway,
    admissionCategory: form.admissionCategory,
    dossier,
  };
}

/** Builds a serializable draft payload for localStorage persistence. */
export function buildAdmissionDraftPayload(
  form: AdmissionFormState,
  step: AdmissionStepId,
  existingDraftId: string | null
) {
  const id = existingDraftId || `draft-${Date.now()}`;
  const studentName = form.studentFullName.trim() || "Untitled Applicant";
  return {
    id,
    studentName,
    applyingClass: form.applyingClass,
    campus: form.campus,
    currentStep: step,
    updatedAt: new Date().toISOString(),
    data: form,
  };
}

