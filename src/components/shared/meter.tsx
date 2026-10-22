import { cn } from "@/lib/utils";

const tones = {
  brand: "bg-brand",
  gold: "bg-gold",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  ocean: "bg-[#3c6fb0]",
} as const;

const sizes = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2",
  lg: "h-2.5",
} as const;

/** Lightweight, server-renderable progress bar. */
export function Meter({
  value,
  tone,
  color,
  gradient,
  className,
  indicatorClassName,
  size = "md",
}: {
  value: number;
  tone?: keyof typeof tones;
  color?: string;
  gradient?: boolean | string;
  className?: string;
  indicatorClassName?: string;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const auto = value >= 90 ? "success" : value >= 75 ? "brand" : value >= 60 ? "warning" : "danger";
  const gradientStyle =
    typeof gradient === "string"
      ? gradient
      : gradient === true
        ? "linear-gradient(90deg, #1e4275 0%, #3c6fb0 55%, #60a5fa 100%)"
        : undefined;

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "w-full overflow-hidden rounded-full bg-muted/70",
        sizes[size] ?? "h-2",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300",
          !color && !gradient && tones[tone ?? auto],
          indicatorClassName
        )}
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          ...(gradientStyle
            ? { background: gradientStyle }
            : color
              ? color.includes("gradient")
                ? { background: color }
                : { backgroundColor: color }
              : {}),
        }}
      />
    </div>
  );
}
