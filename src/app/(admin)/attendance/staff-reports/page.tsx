import { Suspense } from "react";
import { StaffReportsClient } from "./staff-reports-client";

export const metadata = {
  title: "Staff Attendance Report",
};

export const instant = false;

export default function StaffAttendanceReportsPage() {
  return (
    <Suspense fallback={null}>
      <StaffReportsClient />
    </Suspense>
  );
}
