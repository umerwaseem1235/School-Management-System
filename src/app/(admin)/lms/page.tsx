import { LmsClient } from "./lms-client";
import {
  LMS_COURSES,
  LMS_ASSIGNMENTS,
  LMS_MATERIALS,
} from "@/lib/mock/lms";

export const metadata = {
  title: "School LMS — Subjects, Homework & Study Notes",
  description: "School-level class subjects, syllabus progress, daily homework, and study notes.",
};

export default function LmsPage() {
  return (
    <LmsClient
      initialCourses={LMS_COURSES}
      initialAssignments={LMS_ASSIGNMENTS}
      initialMaterials={LMS_MATERIALS}
    />
  );
}
