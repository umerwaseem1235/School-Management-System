import { USERS } from "@/lib/mock/institution";
import { UsersClient } from "./users-client";

export const metadata = {
  title: "Users & Access Control",
};

export default function UsersPage() {
  return <UsersClient initialUsers={USERS} />;
}
