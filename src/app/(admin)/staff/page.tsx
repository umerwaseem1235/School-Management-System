import { Users } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = {
  title: "Staff",
};

export default function StaffPage() {
  return (
    <ModulePlaceholder
      title="Staff"
      description="Central directory of teaching and non-teaching staff with profiles, department assignments, and employment lifecycle."
      icon={Users}
      points={[
        "Staff directory & profiles",
        "Department assignments",
        "Joining & exit records",
        "Documents & contracts",
      ]}
    />
  );
}
