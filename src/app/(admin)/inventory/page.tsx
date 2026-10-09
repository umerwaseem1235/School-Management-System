import { Package } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = {
  title: "Inventory",
};

export default function InventoryPage() {
  return (
    <ModulePlaceholder
      title="Inventory"
      description="Stock control workspace for store items, suppliers, purchase orders, and departmental issuance."
      icon={Package}
      points={[
        "Stock levels & alerts",
        "Supplier management",
        "Purchase orders",
        "Departmental issuance",
      ]}
    />
  );
}
