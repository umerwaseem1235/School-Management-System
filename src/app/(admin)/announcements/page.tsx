import { Megaphone } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = {
  title: "Announcement",
};

export default function AnnouncementsPage() {
  return (
    <ModulePlaceholder
      title="Announcement"
      description="Publish institutional notices and circulars with audience targeting and delivery history."
      icon={Megaphone}
      points={[
        "Notice publishing",
        "Audience targeting",
        "Scheduled announcements",
        "Delivery history",
      ]}
    />
  );
}
