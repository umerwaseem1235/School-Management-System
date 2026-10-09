import { Bus } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = {
  title: "Transport",
};

export default function TransportPage() {
  return (
    <ModulePlaceholder
      title="Transport"
      description="Fleet and route management with vehicle tracking, driver assignments, and student route allocation."
      icon={Bus}
      points={[
        "Routes & stops",
        "Vehicle fleet",
        "Driver assignments",
        "Student route allocation",
      ]}
    />
  );
}
