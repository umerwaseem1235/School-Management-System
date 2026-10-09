import { FileText } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = {
  title: "Admission Tests",
};

export default function AdmissionTestsPage() {
  return (
    <ModulePlaceholder
      title="Admission Tests"
      description="Organize entry tests for applicants — scheduling, evaluation, merit lists, and admission decisions."
      icon={FileText}
      points={[
        "Test session scheduling",
        "Applicant shortlisting",
        "Marks & evaluation",
        "Merit list generation",
      ]}
    />
  );
}
