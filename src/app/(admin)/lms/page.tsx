import { LmsClient } from "./lms-client";
import {
  LMS_COURSES,
  LMS_ASSIGNMENTS,
  LMS_MATERIALS,
  LMS_LIVE_CLASSES,
} from "@/lib/mock/lms";

export const metadata = {
  title: "LMS — Learning Management System",
  description: "Courses, syllabus progress, homework assignments, and virtual classrooms.",
};

export default function LmsPage() {
  return (
    <LmsClient
      initialCourses={LMS_COURSES}
      initialAssignments={LMS_ASSIGNMENTS}
      initialMaterials={LMS_MATERIALS}
      initialLiveClasses={LMS_LIVE_CLASSES}
    />
  );
}
