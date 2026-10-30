import { Suspense } from "react";
import { TransportClient } from "./transport-client";

export const metadata = {
  title: "Transport",
};

export default function TransportPage() {
  return (
    <Suspense fallback={null}>
      <TransportClient />
    </Suspense>
  );
}
