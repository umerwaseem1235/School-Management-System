import { Suspense } from "react";
import { ScholarshipsClient } from "./scholarships-client";

export const metadata = {
  title: "Scholarships & Concessions — EduSphere Multi-Campus",
};

export default function ScholarshipsPage() {
  return (
    <Suspense fallback={null}>
      <ScholarshipsClient />
    </Suspense>
  );
}
