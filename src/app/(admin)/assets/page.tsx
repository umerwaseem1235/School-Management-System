import { Box } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = {
  title: "Assets",
};

export default function AssetsPage() {
  return (
    <ModulePlaceholder
      title="Assets"
      description="Fixed-asset register with allocation tracking, maintenance schedules, and depreciation records."
      icon={Box}
      points={[
        "Asset register",
        "Allocation tracking",
        "Maintenance schedules",
        "Depreciation records",
      ]}
    />
  );
}
