import { Suspense } from "react";
import { HostelClient } from "./hostel-client";

export const metadata = {
  title: "Hostel Management",
};

export default function HostelPage() {
  return (
    <Suspense fallback={null}>
      <HostelClient />
    </Suspense>
  );
}
