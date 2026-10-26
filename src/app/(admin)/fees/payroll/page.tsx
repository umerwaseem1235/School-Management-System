import { PayrollClient } from "./payroll-client";

export const metadata = {
  title: "Staff Payroll — EduSphere Multi-Campus",
  description:
    "Institutional staff payroll roster, salary structures, deductions, and corporate bank disbursement accounts.",
};

export default function PayrollPage() {
  return <PayrollClient />;
}
