import { MonitorPlay } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = {
  title: "LMS",
};

export default function LmsPage() {
  return (
    <ModulePlaceholder
      title="LMS"
      description="Learning management workspace for digital courses, assignments, virtual classes, and student progress tracking."
      icon={MonitorPlay}
      points={[
        "Digital courses & lessons",
        "Assignments & submissions",
        "Virtual class schedule",
        "Learning progress reports",
      ]}
    />
  );
}
