import { Award } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = {
  title: "Results",
};

export default function ResultsPage() {
  return (
    <ModulePlaceholder
      title="Results"
      description="Compile examination results, publish report cards and transcripts, and analyze institutional performance."
      icon={Award}
      points={[
        "Result compilation",
        "Report cards & transcripts",
        "Result publication control",
        "Performance analytics",
      ]}
    />
  );
}
