import {
  VISITOR_PASSES,
  FRONT_DESK_INQUIRIES,
} from "@/lib/mock/reception";
import { ReceptionClient } from "./reception-client";

export const metadata = {
  title: "Reception",
};

export default function ReceptionPage() {
  return (
    <ReceptionClient
      initialVisitorPasses={VISITOR_PASSES}
      initialInquiries={FRONT_DESK_INQUIRIES}
    />
  );
}
