import { Suspense } from "react";
import { AttendanceReportsClient } from "./attendance-reports-client";

export const metadata = {
  title: "Student Attendance Report",
};

export const instant = false;

export default function AttendanceReportsPage() {
  return (
    <Suspense fallback={null}>
      <AttendanceReportsClient />
    </Suspense>
  );
}
