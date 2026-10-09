import { BadgeCheck } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = {
  title: "Certificates",
};

export default function CertificatesPage() {
  return (
    <ModulePlaceholder
      title="Certificates"
      description="Issue and verify leaving certificates, character certificates, and achievement awards with serial control."
      icon={BadgeCheck}
      points={[
        "Leaving certificates",
        "Character certificates",
        "Achievement awards",
        "Online verification",
      ]}
    />
  );
}
