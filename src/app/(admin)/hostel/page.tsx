import { Building2 } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = {
  title: "Hostel Management",
};

export default function HostelPage() {
  return (
    <ModulePlaceholder
      title="Hostel Management"
      description="Manage hostel buildings, room allocation, warden assignments, and mess operations for resident students."
      icon={Building2}
      points={[
        "Buildings & room inventory",
        "Room allocation",
        "Warden assignments",
        "Mess & attendance",
      ]}
    />
  );
}
