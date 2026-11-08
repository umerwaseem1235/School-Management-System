import { PageHeader } from "@/components/shared/page-header";
import { AttendanceOverviewClient } from "./_components/attendance-overview-client";

export const metadata = {
  title: "Attendance Overview — EduSphere Multi-Campus",
};

export default function AttendancePage() {
  return (
    <>
      <PageHeader title="Attendance Overview" />
      <AttendanceOverviewClient />
    </>
  );
}
