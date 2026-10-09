import { Library } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = {
  title: "Library",
};

export default function LibraryPage() {
  return (
    <ModulePlaceholder
      title="Library"
      description="Library workspace for catalog management, book issuance and returns, memberships, and fine collection."
      icon={Library}
      points={[
        "Book catalog & search",
        "Issue & return desk",
        "Member management",
        "Fines & reservations",
      ]}
    />
  );
}
