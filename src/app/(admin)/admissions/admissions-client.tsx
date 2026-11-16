"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatGrid, StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  CheckCircle,
  GraduationCap,
  Plus,
  Award,
  FileEdit,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import { formatDate, formatNumber } from "@/lib/format";
import type { AdmissionApplication, Student } from "@/types";
import { AdmissionsTable } from "./admissions-table";
import { NewAdmissionDialog } from "./new-admission-dialog";
import { AdmitFromTestDialog } from "./admit-from-test-dialog";
import type { AdmissionFormState } from "./admission-form/admission-form-types";
import {
  getStoredAdmissions,
  enrollNewStudent,
  getStoredAdmissionDrafts,
  deleteAdmissionDraft,
  type StoredAdmissionDraft,
} from "@/lib/mock/admissions-storage";
import { toast } from "sonner";

interface AdmissionsClientProps {
  initialAdmissions: AdmissionApplication[];
}

export function AdmissionsClient({ initialAdmissions }: AdmissionsClientProps) {
  const [admissions, setAdmissions] = React.useState<AdmissionApplication[]>(initialAdmissions);
  const [drafts, setDrafts] = React.useState<StoredAdmissionDraft<AdmissionFormState>[]>([]);
  const [resumingDraft, setResumingDraft] =
    React.useState<StoredAdmissionDraft<AdmissionFormState> | null>(null);
  const [isAdmissionOpen, setIsAdmissionOpen] = React.useState(false);
  const [isTestAdmitOpen, setIsTestAdmitOpen] = React.useState(false);

  // Sync with persistent local storage on mount and via custom window event
  React.useEffect(() => {
    const loaded = getStoredAdmissions();
    if (loaded && loaded.length > 0) {
      setAdmissions(loaded);
    }
    setDrafts(getStoredAdmissionDrafts<AdmissionFormState>());

    const handleUpdate = () => {
      setAdmissions(getStoredAdmissions());
    };
    const handleDraftsUpdate = () => {
      setDrafts(getStoredAdmissionDrafts<AdmissionFormState>());
    };

    window.addEventListener("edusphere:admissions-updated", handleUpdate);
    window.addEventListener("edusphere:admission-drafts-updated", handleDraftsUpdate);
    return () => {
      window.removeEventListener("edusphere:admissions-updated", handleUpdate);
      window.removeEventListener("edusphere:admission-drafts-updated", handleDraftsUpdate);
    };
  }, []);

  // Dynamic statistics
  const total = admissions.length;
  const testCount = admissions.filter(
    (a) => a.admissionType === "Entry Test" || Boolean(a.score)
  ).length;
  const directCount = total - testCount;
  const activeCount = admissions.filter((a) => a.status !== "Pending").length;

  const handleAddStudent = React.useCallback(
    (
      newStudent: Student & {
        score?: number;
        admissionType?: "Entry Test" | "Direct Admission";
        admissionCategory?: "New" | "Transfer";
      }
    ) => {
      const { student } = enrollNewStudent({
        name: newStudent.name,
        gender: newStudent.gender,
        className: newStudent.className,
        section: newStudent.section,
        campus: newStudent.campus,
        guardian: newStudent.guardian,
        phone: newStudent.phone,
        rollNo: newStudent.rollNo,
        feeStatus: newStudent.feeStatus,
        status: newStudent.status,
        score: newStudent.score,
        admissionType: newStudent.admissionType,
        admissionCategory: newStudent.admissionCategory,
        enrolledOn: newStudent.enrolledOn,
        dossier: newStudent.dossier,
      });

      setAdmissions(getStoredAdmissions());

      toast.success("Student Enrolled & Registered in SIS", {
        description: `${student.name} officially admitted into ${student.className} - Sec ${student.section} (${student.admissionNumber}). Added to both Admissions & Student Directory.`,
      });
    },
    []
  );

  const handleOpenNewAdmission = () => {
    setResumingDraft(null);
    setIsAdmissionOpen(true);
  };

  const handleResumeDraft = (draft: StoredAdmissionDraft<AdmissionFormState>) => {
    setResumingDraft(draft);
    setIsAdmissionOpen(true);
  };

  const handleDiscardDraft = (draft: StoredAdmissionDraft<AdmissionFormState>) => {
    deleteAdmissionDraft(draft.id);
    setDrafts(getStoredAdmissionDrafts<AdmissionFormState>());
    toast.info("Draft Removed", {
      description: `Draft for "${draft.studentName}" was discarded.`,
    });
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader
        title="Admissions & Enrollment Hub"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsTestAdmitOpen(true)}
              className="gap-2 cursor-pointer"
              title="Admit candidates who qualified the Examination Entry Test"
            >
              <Award className="size-4 text-brand" />
              <span>Admit from Entry Test</span>
            </Button>

            <Button
              size="lg"
              onClick={handleOpenNewAdmission}
              className="gap-2 cursor-pointer"
            >
              <Plus className="size-4" data-icon="inline-start" />
              <span>New Admission</span>
            </Button>
          </div>
        }
      />

      {/* KPI Stat Cards */}
      <StatGrid>
        <StatCard
          label="Total Enrolled Students"
          value={formatNumber(total)}
          icon={GraduationCap}
          title="Total officially enrolled students"
        />
        <StatCard
          label="Via Entry Test Merit"
          value={formatNumber(testCount)}
          icon={Award}
          title="Admissions through Examination Entry Tests"
        />
        <StatCard
          label="Direct Admissions"
          value={formatNumber(directCount)}
          icon={UserPlus}
          title="Direct walk-in and transfer admissions"
        />
        <StatCard
          label="Active in SIS"
          value={formatNumber(activeCount)}
          icon={CheckCircle}
          title="Active registered students attending classes"
        />
      </StatGrid>

      {/* Saved Admission Drafts */}
      {drafts.length > 0 && (
        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/60 dark:border-amber-800/60 dark:bg-amber-950/20 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <FileEdit className="size-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">
                  Saved Admission Drafts ({drafts.length})
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Resume incomplete 6-step admission applications saved by admissions staff.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="flex items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-card px-3.5 py-2.5 shadow-2xs"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {draft.studentName}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {draft.applyingClass} · Step {draft.currentStep}/6 · {formatDate(draft.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={() => handleResumeDraft(draft)}
                    className="h-7 px-2 text-[11px] font-semibold text-brand border-brand/30 hover:bg-brand-50 gap-1 cursor-pointer"
                  >
                    <span>Resume</span>
                    <ArrowUpRight className="size-3" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => handleDiscardDraft(draft)}
                    title="Discard draft"
                    className="size-7 text-muted-foreground hover:text-danger hover:bg-danger/10 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enrolled Students Table */}
      <AdmissionsTable data={admissions} />

      {/* New Student Admission Form Modal */}
      <NewAdmissionDialog
        open={isAdmissionOpen}
        onOpenChange={(nextOpen) => {
          setIsAdmissionOpen(nextOpen);
          if (!nextOpen) setResumingDraft(null);
        }}
        onAddStudent={handleAddStudent}
        existingCount={admissions.length}
        initialDraft={resumingDraft}
        onDraftSaved={() => setDrafts(getStoredAdmissionDrafts<AdmissionFormState>())}
        onDraftSubmitted={() => setDrafts(getStoredAdmissionDrafts<AdmissionFormState>())}
      />

      {/* Admit from Entry Test Modal */}
      <AdmitFromTestDialog
        open={isTestAdmitOpen}
        onOpenChange={setIsTestAdmitOpen}
        onEnrolled={() => setAdmissions(getStoredAdmissions())}
      />
    </div>
  );
}
