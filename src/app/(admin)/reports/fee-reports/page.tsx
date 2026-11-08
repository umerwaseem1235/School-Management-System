import { ReportsClient } from "@/app/(admin)/fees/reports/reports-client";

export const metadata = {
  title: "Fee Reports — Reports & Analytics",
};

export default function FeeReportsPage() {
  return <ReportsClient title="Fee Reports" />;
}
