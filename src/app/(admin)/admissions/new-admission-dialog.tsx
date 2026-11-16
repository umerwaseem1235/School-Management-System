"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBranches } from "@/context/branches-context";
import {
  deleteAdmissionDraft,
  saveAdmissionDraft,
  type StoredAdmissionDraft,
} from "@/lib/mock/admissions-storage";
import {
  ADMISSION_STEPS,
  buildAdmissionDraftPayload,
  buildStudentSubmission,
  createInitialAdmissionFormState,
  getDefaultFeeScheduleForClass,
  validateAdmissionStep,
  type AdmissionFormState,
  type AdmissionStepId,
  type SubmittedAdmissionStudent,
} from "./admission-form/admission-form-types";
import { StepStudentInfo } from "./admission-form/step-student-info";
import { StepParentGuardian } from "./admission-form/step-parent-guardian";
import { StepAddressInfo } from "./admission-form/step-address-info";
import { StepAcademicInfo } from "./admission-form/step-academic-info";
import { StepFeeDetails } from "./admission-form/step-fee-details";
import { StepDocumentsReview } from "./admission-form/step-documents-review";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileCheck2,
  GraduationCap,
  MapPin,
  Receipt,
  Save,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

export interface NewAdmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStudent: (student: SubmittedAdmissionStudent) => void;
  existingCount: number;
  initialDraft?: StoredAdmissionDraft<AdmissionFormState> | null;
  onDraftSaved?: () => void;
  onDraftSubmitted?: (draftId: string) => void;
}

const STEP_ICONS: Record<AdmissionStepId, React.ComponentType<{ className?: string }>> = {
  1: User,
  2: Users,
  3: MapPin,
  4: GraduationCap,
  5: Receipt,
  6: FileCheck2,
};

function NewAdmissionDialogBody({
  onOpenChange,
  onAddStudent,
  existingCount,
  initialDraft = null,
  onDraftSaved,
  onDraftSubmitted,
}: Omit<NewAdmissionDialogProps, "open">) {
  const { activeBranches } = useBranches();
  const defaultCampus = activeBranches[0]?.campusName || "Main Campus — Gulberg";

  const [step, setStep] = React.useState<AdmissionStepId>(() => {
    const initial = initialDraft?.currentStep || 1;
    return Math.min(6, Math.max(1, initial)) as AdmissionStepId;
  });

  const [form, setForm] = React.useState<AdmissionFormState>(() => {
    const base = createInitialAdmissionFormState(defaultCampus);
    if (!initialDraft?.data) return base;
    return {
      ...base,
      ...initialDraft.data,
      documents: {
        ...base.documents,
        ...(initialDraft.data.documents || {}),
      },
    };
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [activeDraftId, setActiveDraftId] = React.useState<string | null>(
    () => initialDraft?.id || null
  );
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFieldChange = React.useCallback(
    <K extends keyof AdmissionFormState>(field: K, value: AdmissionFormState[K]) => {
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        if (field === "applyingClass" && !prev.feeCustomized && typeof value === "string") {
          const preset = getDefaultFeeScheduleForClass(value);
          const presetPayable =
            preset.admissionFee +
            preset.tuitionFee +
            preset.securityDeposit +
            preset.annualCharges +
            (Number(prev.transportFee) || 0) -
            (Number(prev.discountAmount) || 0);
          next.admissionFee = String(preset.admissionFee);
          next.tuitionFee = String(preset.tuitionFee);
          next.securityDeposit = String(preset.securityDeposit);
          next.annualCharges = String(preset.annualCharges);
          if (prev.feeStatus === "Paid") {
            next.paidAmount = String(Math.max(0, presetPayable));
          }
        }
        return next;
      });
    },
    []
  );

  const handleClearError = React.useCallback((field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleNextStep = () => {
    const stepErrors = validateAdmissionStep(step, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error("Please complete all required fields in this step");
      return;
    }
    setErrors({});
    if (step < 6) {
      setStep((prev) => (prev + 1) as AdmissionStepId);
      scrollToTop();
    }
  };

  const handlePrevStep = () => {
    setErrors({});
    if (step > 1) {
      setStep((prev) => (prev - 1) as AdmissionStepId);
      scrollToTop();
    }
  };

  const handleStepClick = (targetStep: AdmissionStepId) => {
    if (targetStep === step) return;
    if (targetStep < step) {
      setErrors({});
      setStep(targetStep);
      scrollToTop();
      return;
    }

    for (let s = step; s < targetStep; s++) {
      const stepErrors = validateAdmissionStep(s as AdmissionStepId, form);
      if (Object.keys(stepErrors).length > 0) {
        setStep(s as AdmissionStepId);
        setErrors(stepErrors);
        toast.error(`Please complete Step ${s} before advancing`);
        scrollToTop();
        return;
      }
    }

    setErrors({});
    setStep(targetStep);
    scrollToTop();
  };

  const handleSaveAsDraft = () => {
    const payload = buildAdmissionDraftPayload(form, step, activeDraftId);
    saveAdmissionDraft<AdmissionFormState>(payload);
    setActiveDraftId(payload.id);
    toast.success("Admission Saved as Draft", {
      description: `${payload.studentName} (${form.applyingClass}) saved at Step ${step}. You can resume it anytime from Saved Drafts.`,
    });
    onDraftSaved?.();
    onOpenChange(false);
  };

  const handleSubmitAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 6) {
      handleNextStep();
      return;
    }

    for (const s of [1, 2, 3, 4, 5] as AdmissionStepId[]) {
      const stepErrors = validateAdmissionStep(s, form);
      if (Object.keys(stepErrors).length > 0) {
        setStep(s);
        setErrors(stepErrors);
        toast.error(`Missing required fields in Step ${s}: ${ADMISSION_STEPS[s - 1].title}`);
        scrollToTop();
        return;
      }
    }

    const newStudent = buildStudentSubmission(form, existingCount);
    onAddStudent(newStudent);

    if (activeDraftId) {
      deleteAdmissionDraft(activeDraftId);
      onDraftSubmitted?.(activeDraftId);
    }

    onOpenChange(false);
  };

  const activeStepMeta = ADMISSION_STEPS[step - 1];
  const progressPercent = ((step - 1) / (ADMISSION_STEPS.length - 1)) * 100;

  return (
    <form onSubmit={handleSubmitAdmission} className="flex flex-col max-h-[90vh]">
      {/* Header */}
      <DialogHeader className="border-b border-border/70 bg-gradient-to-r from-brand-50/60 via-muted/20 to-background px-6 pt-5 pb-4 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3 pr-8">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-[#7c4424] via-[#5c3118] to-[#381e0f] text-white shadow-sm ring-1 ring-white/10">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <DialogTitle className="font-heading text-base sm:text-lg font-bold text-brand flex flex-wrap items-center gap-2">
                <span>New Student Admission</span>
                <span className="inline-flex items-center rounded-full bg-brand-50 border border-brand/20 px-2.5 py-0.5 text-[11px] font-medium text-brand">
                  {form.academicSession}
                </span>
                {activeDraftId && (
                  <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10.5px] font-semibold text-amber-800">
                    Draft Resumed
                  </span>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Step {step} of 6 — {activeStepMeta.title}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* 6-Step Progress Stepper */}
        <div className="relative mt-4 pt-1">
          <div
            aria-hidden
            className="hidden sm:block absolute top-[21px] left-7 right-7 h-0.5 bg-border/80 rounded-full"
          >
            <div
              className="h-full bg-gradient-to-r from-brand to-gold rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-6 gap-1 sm:gap-2 relative z-10">
            {ADMISSION_STEPS.map((s) => {
              const Icon = STEP_ICONS[s.id];
              const isCompleted = s.id < step;
              const isCurrent = s.id === step;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleStepClick(s.id)}
                  className={cn(
                    "group flex flex-col items-center gap-1.5 rounded-xl px-1.5 py-1 text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
                    isCurrent && "bg-brand-50/70 sm:bg-transparent"
                  )}
                >
                  <span
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-200 shadow-2xs",
                      isCompleted &&
                        "bg-emerald-600 border-emerald-600 text-white",
                      isCurrent &&
                        "bg-brand border-brand text-white ring-4 ring-brand/15 scale-105",
                      !isCompleted &&
                        !isCurrent &&
                        "bg-background border-border text-muted-foreground group-hover:border-brand/40 group-hover:text-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="size-4" />
                    ) : (
                      <Icon className="size-3.5" />
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-[10.5px] leading-tight font-medium hidden sm:block truncate max-w-full",
                      isCurrent && "font-bold text-brand",
                      isCompleted && "text-emerald-700 font-semibold",
                      !isCompleted && !isCurrent && "text-muted-foreground"
                    )}
                  >
                    {s.shortTitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </DialogHeader>

      {/* Step Body */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto px-6 py-5 scrollbar-thin-light"
      >
        {step === 1 && (
          <StepStudentInfo
            form={form}
            errors={errors}
            onChange={handleFieldChange}
            onClearError={handleClearError}
          />
        )}
        {step === 2 && (
          <StepParentGuardian
            form={form}
            errors={errors}
            onChange={handleFieldChange}
            onClearError={handleClearError}
          />
        )}
        {step === 3 && (
          <StepAddressInfo
            form={form}
            errors={errors}
            onChange={handleFieldChange}
            onClearError={handleClearError}
          />
        )}
        {step === 4 && (
          <StepAcademicInfo
            form={form}
            errors={errors}
            onChange={handleFieldChange}
            onClearError={handleClearError}
          />
        )}
        {step === 5 && (
          <StepFeeDetails
            form={form}
            errors={errors}
            onChange={handleFieldChange}
            onClearError={handleClearError}
          />
        )}
        {step === 6 && (
          <StepDocumentsReview
            form={form}
            onChange={handleFieldChange}
            onJumpToStep={(target) => {
              setErrors({});
              setStep(target);
              scrollToTop();
            }}
          />
        )}
      </div>

      {/* Footer Navigation & Actions */}
      <DialogFooter className="m-0 shrink-0 grid grid-cols-2 gap-2.5 rounded-b-2xl border-t border-border/70 bg-muted/25 px-6 py-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
        <div className="col-span-1 order-2 sm:order-1 flex items-center">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handlePrevStep}
              className="w-full sm:w-auto gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Previous</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto cursor-pointer"
            >
              Cancel
            </Button>
          )}
        </div>

        <div className="contents sm:order-2 sm:flex sm:items-center sm:gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={handleSaveAsDraft}
            className="col-span-1 order-3 sm:order-none w-full sm:w-auto gap-1.5 cursor-pointer"
          >
            <Save className="size-3.5" />
            <span>Save as Draft</span>
          </Button>

          {step < 6 ? (
            <Button
              type="button"
              size="lg"
              onClick={handleNextStep}
              className="col-span-2 order-1 sm:order-none w-full sm:w-auto px-5 gap-1.5 cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="size-3.5" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="lg"
              className="col-span-2 order-1 sm:order-none w-full sm:w-auto px-5 gap-1.5 cursor-pointer"
            >
              <UserPlus className="size-3.5" />
              <span>Submit Admission</span>
            </Button>
          )}
        </div>
      </DialogFooter>
    </form>
  );
}

export function NewAdmissionDialog({
  open,
  onOpenChange,
  ...rest
}: NewAdmissionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden sm:max-w-3xl lg:max-w-4xl border-border/80 shadow-2xl rounded-2xl">
        <NewAdmissionDialogBody
          key={open ? (rest.initialDraft?.id || "new-admission-open") : "new-admission-closed"}
          onOpenChange={onOpenChange}
          {...rest}
        />
      </DialogContent>
    </Dialog>
  );
}
