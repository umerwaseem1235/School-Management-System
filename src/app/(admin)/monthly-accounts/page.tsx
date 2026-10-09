import { Receipt } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = {
  title: "Monthly Accounts",
};

export default function MonthlyAccountsPage() {
  return (
    <ModulePlaceholder
      title="Monthly Accounts"
      description="Month-end closing workspace with monthly statements, summaries, and comparative financial reports."
      icon={Receipt}
      points={[
        "Month-end closing",
        "Monthly statements",
        "Income & expense summary",
        "Comparative reports",
      ]}
    />
  );
}
