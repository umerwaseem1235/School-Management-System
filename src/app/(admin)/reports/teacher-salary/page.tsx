import { Suspense } from "react";
import { TeacherSalaryClient } from "./teacher-salary-client";

export const metadata = {
  title: "Teacher Yearly Salary Report — Reports & Analytics",
};

export default function TeacherSalaryReportPage() {
  return (
    <Suspense fallback={null}>
      <TeacherSalaryClient />
    </Suspense>
  );
}
