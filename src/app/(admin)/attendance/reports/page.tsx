import { redirect } from "next/navigation";

export default function LegacyAttendanceReportsPage() {
  redirect("/reports/student-attendance");
}
