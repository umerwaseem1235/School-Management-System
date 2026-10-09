import { Wallet, CreditCard, TrendingUp, Award } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { formatCurrencyCompact } from "@/lib/format";
import { SCHOLARSHIPS } from "@/lib/mock/operations";
import { FeesClient } from "./fees-client";

export const metadata = { title: "Fees & Financial Management" };

export default function FeesPage() {
  const totalRevenue = 15_420_000;
  const outstanding = 2_100_000;
  const collectionRate = 94.2;
  const totalScholarships = SCHOLARSHIPS.reduce((acc, s) => acc + s.beneficiaries, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Fees & Financial Management" />

      <StatGrid>
        <StatCard label="Total Revenue (Oct)" value={formatCurrencyCompact(totalRevenue)} icon={Wallet} />
        <StatCard label="Outstanding Dues" value={formatCurrencyCompact(outstanding)} icon={CreditCard} />
        <StatCard label="Collection Rate" value={`${collectionRate}%`} icon={TrendingUp} />
        <StatCard label="Scholarships Awarded" value={totalScholarships.toString()} icon={Award} />
      </StatGrid>

      <FeesClient />
    </div>
  );
}
