import { Suspense } from "react";
import { AttendanceReportsClient } from "@/app/(admin)/attendance/reports/attendance-reports-client";

export const metadata = {
  title: "Student Attendance Report — Reports & Analytics",
};

export default function StudentAttendanceReportPage() {
  return (
    <Suspense fallback={null}>
      <AttendanceReportsClient />
    </Suspense>
  );
}
