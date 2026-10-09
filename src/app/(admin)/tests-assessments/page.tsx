import { FileQuestion } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = {
  title: "Tests & Assessments",
};

export default function TestsAssessmentsPage() {
  return (
    <ModulePlaceholder
      title="Tests & Assessments"
      description="Plan and evaluate class tests, quizzes, and periodic assessments with grading and performance analysis."
      icon={FileQuestion}
      points={[
        "Class tests & quizzes",
        "Marks entry & grading",
        "Assessment schedules",
        "Performance analysis",
      ]}
    />
  );
}
