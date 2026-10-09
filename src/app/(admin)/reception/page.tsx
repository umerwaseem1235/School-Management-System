import { Phone } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = {
  title: "Reception",
};

export default function ReceptionPage() {
  return (
    <ModulePlaceholder
      title="Reception"
      description="Front-desk workspace for managing visitors, admission inquiries, appointments, and incoming calls across all campuses."
      icon={Phone}
      points={[
        "Visitor entry & gate passes",
        "Admission inquiry handling",
        "Appointment scheduling",
        "Call & message log",
      ]}
    />
  );
}
