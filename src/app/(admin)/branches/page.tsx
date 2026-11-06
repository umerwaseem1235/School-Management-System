import { CAMPUSES } from "@/lib/mock/institution";
import { BranchesClient } from "./branches-client";

export const metadata = {
  title: "Branches",
};

export default function BranchesPage() {
  return <BranchesClient initialBranches={CAMPUSES} />;
}
