import { Suspense } from "react";
import { StaffReportsClient } from "@/app/(admin)/attendance/staff-reports/staff-reports-client";

export const metadata = {
  title: "Staff Attendance Report — Reports & Analytics",
};

export default function StaffAttendanceReportPage() {
  return (
    <Suspense fallback={null}>
      <StaffReportsClient />
    </Suspense>
  );
}
