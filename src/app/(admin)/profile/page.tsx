import * as React from "react";
import { ProfileClient } from "./profile-client";

export const metadata = {
  title: "Administrator Profile — Super Admin",
  description: "Official institutional administrator credentials, placement, security, and authority matrix.",
};

export default function ProfilePage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-64 w-full items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        </div>
      }
    >
      <ProfileClient />
    </React.Suspense>
  );
}
