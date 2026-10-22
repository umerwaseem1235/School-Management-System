import { STAFF_MEMBERS } from "@/lib/mock/staff";
import { StaffClient } from "./staff-client";

export const metadata = {
  title: "Staff Management",
};

export default function StaffPage() {
  return <StaffClient initialStaff={STAFF_MEMBERS} />;
}
