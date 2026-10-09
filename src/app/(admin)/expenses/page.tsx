import { CreditCard } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = {
  title: "Expenses",
};

export default function ExpensesPage() {
  return (
    <ModulePlaceholder
      title="Expenses"
      description="Track institutional expenses with approval workflows, category budgets, and spending controls."
      icon={CreditCard}
      points={[
        "Expense recording",
        "Approval workflows",
        "Category budgets",
        "Spending analytics",
      ]}
    />
  );
}
