import { Suspense } from "react";
import { LibraryClient } from "./library-client";

export const metadata = { title: "Library" };

export default function LibraryPage() {
  return (
    <Suspense fallback={null}>
      <LibraryClient />
    </Suspense>
  );
}
