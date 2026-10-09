import { Calculator } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = {
  title: "Accounts",
};

export default function AccountsPage() {
  return (
    <ModulePlaceholder
      title="Accounts"
      description="General accounts workspace with chart of accounts, ledger postings, vouchers, and bank reconciliation."
      icon={Calculator}
      points={[
        "Chart of accounts",
        "Ledger & vouchers",
        "Bank reconciliation",
        "Trial balance",
      ]}
    />
  );
}
