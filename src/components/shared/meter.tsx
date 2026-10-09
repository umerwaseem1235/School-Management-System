import { cn } from "@/lib/utils";

const tones = {
  brand: "bg-brand",
  gold: "bg-gold",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
} as const;

/** Lightweight, server-renderable progress bar. */
export function Meter({
  value,
  tone,
  className,
  size = "md",
}: {
  value: number;
  tone?: keyof typeof tones;
  className?: string;
  size?: "sm" | "md";
}) {
  const auto = value >= 90 ? "success" : value >= 75 ? "brand" : value >= 60 ? "warning" : "danger";
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "w-full overflow-hidden rounded-full bg-muted",
        size === "sm" ? "h-1.5" : "h-2",
        className
      )}
    >
      <div
        className={cn("h-full rounded-full transition-all", tones[tone ?? auto])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
