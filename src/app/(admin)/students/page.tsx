import { getStoredStudents } from "@/lib/mock/admissions-storage";
import { StudentsClient } from "./students-client";

export const metadata = {
  title: "Student Information System",
};

export default function StudentsPage() {
  return <StudentsClient initialStudents={getStoredStudents()} />;
}
