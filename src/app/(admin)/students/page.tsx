import { STUDENTS } from "@/lib/mock/institution";
import { StudentsClient } from "./students-client";

export const metadata = {
  title: "Student Information System",
};

export default function StudentsPage() {
  return <StudentsClient initialStudents={STUDENTS} />;
}
