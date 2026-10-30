import { Suspense } from "react";
import { InventoryClient } from "./inventory-client";

export const metadata = {
  title: "Inventory",
};

export default function InventoryPage() {
  return (
    <Suspense fallback={null}>
      <InventoryClient />
    </Suspense>
  );
}
