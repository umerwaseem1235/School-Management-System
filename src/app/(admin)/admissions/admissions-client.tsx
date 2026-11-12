"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatGrid, StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  CheckCircle,
  GraduationCap,
  Plus,
  Award,
} from "lucide-react";
import { formatNumber } from "@/lib/format";
import type { AdmissionApplication, Student } from "@/types";
import { AdmissionsTable } from "./admissions-table";
import { NewAdmissionDialog } from "./new-admission-dialog";
import { AdmitFromTestDialog } from "./admit-from-test-dialog";
import {
  getStoredAdmissions,
  enrollNewStudent,
} from "@/lib/mock/admissions-storage";
import { toast } from "sonner";

interface AdmissionsClientProps {
  initialAdmissions: AdmissionApplication[];
}

export function AdmissionsClient({ initialAdmissions }: AdmissionsClientProps) {
  const [admissions, setAdmissions] = React.useState<AdmissionApplication[]>(initialAdmissions);
  const [isAdmissionOpen, setIsAdmissionOpen] = React.useState(false);
  const [isTestAdmitOpen, setIsTestAdmitOpen] = React.useState(false);

  // Sync with persistent local storage on mount and via custom window event
  React.useEffect(() => {
    const loaded = getStoredAdmissions();
    if (loaded && loaded.length > 0) {
      setAdmissions(loaded);
    }

    const handleUpdate = () => {
      setAdmissions(getStoredAdmissions());
    };

    window.addEventListener("edusphere:admissions-updated", handleUpdate);
    return () => window.removeEventListener("edusphere:admissions-updated", handleUpdate);
  }, []);

  // Dynamic statistics
  const total = admissions.length;
  const testCount = admissions.filter(
    (a) => a.admissionType === "Entry Test" || Boolean(a.score)
  ).length;
  const directCount = total - testCount;
  const activeCount = admissions.filter((a) => a.status !== "Pending").length;

  const handleAddStudent = React.useCallback(
    (newStudent: Student & { score?: number; admissionType?: "Entry Test" | "Direct Admission" }) => {
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
      });

      setAdmissions(getStoredAdmissions());

      toast.success("Student Enrolled & Registered in SIS", {
        description: `${student.name} officially admitted into ${student.className} - Sec ${student.section} (${student.admissionNumber}). Added to both Admissions & Student Directory.`,
      });
    },
    []
  );

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
              onClick={() => setIsAdmissionOpen(true)}
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

      {/* Enrolled Students Table */}
      <SectionCard flush>
        <AdmissionsTable data={admissions} />
      </SectionCard>

      {/* New Student Admission Form Modal */}
      <NewAdmissionDialog
        open={isAdmissionOpen}
        onOpenChange={setIsAdmissionOpen}
        onAddStudent={handleAddStudent}
        existingCount={admissions.length}
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
