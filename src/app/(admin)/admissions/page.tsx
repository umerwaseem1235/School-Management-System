import { getStoredAdmissions } from "@/lib/mock/admissions-storage";
import { AdmissionsClient } from "./admissions-client";

export const metadata = {
  title: "Admissions & Enrollment — Administration",
};

export default function AdmissionsPage() {
  return <AdmissionsClient initialAdmissions={getStoredAdmissions()} />;
}
