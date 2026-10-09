import { Trophy } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = {
  title: "Sports",
};

export default function SportsPage() {
  return (
    <ModulePlaceholder
      title="Sports"
      description="Manage sports teams, fixtures, coaching schedules, and athletic achievements across the institution."
      icon={Trophy}
      points={[
        "Teams & player rosters",
        "Fixtures & tournaments",
        "Coaching schedules",
        "Medals & achievements",
      ]}
    />
  );
}
