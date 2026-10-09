import { cn } from "@/lib/utils";

type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral" | "brand" | "gold";

const tones: Record<BadgeTone, string> = {
  success: "bg-success-soft text-success ring-success/15",
  warning: "bg-warning-soft text-warning ring-warning/15",
  danger: "bg-danger-soft text-danger ring-danger/15",
  info: "bg-info-soft text-info ring-info/15",
  neutral: "bg-muted text-muted-foreground ring-border",
  brand: "bg-brand-50 text-brand ring-brand/10",
  gold: "bg-gold-soft text-gold ring-gold/20",
};

/** Maps any domain status string to a visual tone. */
const STATUS_TONE: Record<string, BadgeTone> = {
  // generic
  Active: "success",
  Inactive: "neutral",
  Suspended: "danger",
  Pending: "warning",
  // fees
  Paid: "success",
  Unpaid: "warning",
  Partial: "info",
  Overdue: "danger",
  // students
  Transferred: "info",
  Alumni: "brand",
  // admissions
  Inquiry: "neutral",
  Application: "info",
  "Interview/Test": "warning",
  Approved: "success",
  Enrolled: "brand",
  Rejected: "danger",
  // exams
  Scheduled: "info",
  Ongoing: "warning",
  "Marks Entry": "gold",
  Moderation: "warning",
  Published: "success",
  // payroll
  Draft: "neutral",
  Processing: "warning",
  Disbursed: "brand",
  // audit
  Info: "info",
  Warning: "warning",
  Critical: "danger",
};

interface StatusBadgeProps {
  status: string;
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({ status, tone, dot = true, className }: StatusBadgeProps) {
  const resolved = tone ?? STATUS_TONE[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ring-1 ring-inset",
        tones[resolved],
        className
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {status}
    </span>
  );
}
