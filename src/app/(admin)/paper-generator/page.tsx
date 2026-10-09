import { FileStack } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = {
  title: "Paper Generator",
};

export default function PaperGeneratorPage() {
  return (
    <ModulePlaceholder
      title="Paper Generator"
      description="Build balanced exam papers from the question bank with automatic marks distribution and printable formats."
      icon={FileStack}
      points={[
        "Question bank management",
        "Auto paper composition",
        "Marks distribution control",
        "Print-ready paper formats",
      ]}
    />
  );
}
