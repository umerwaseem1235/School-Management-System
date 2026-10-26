import { cn } from "@/lib/utils";

const tones = {
  brand: "bg-gradient-to-r from-[#091d3e] via-[#16345f] to-[#1e4275]",
  "blue-gradient": "bg-gradient-to-r from-[#091d3e] via-[#16345f] to-[#1e4275]",
  "premium-blue": "bg-gradient-to-r from-[#091d3e] via-[#16345f] to-[#234e8a]",
  "dark-blue": "bg-gradient-to-r from-[#091d3e] via-[#16345f] to-[#1e4275]",
  "ocean-blue": "bg-gradient-to-r from-[#1e4275] via-[#0284c7] to-[#38bdf8]",
  "sky-blue": "bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8]",
  "light-blue": "bg-gradient-to-r from-[#38bdf8] to-[#93c5fd]",
  gold: "bg-gradient-to-r from-amber-500 to-amber-400",
  success: "bg-gradient-to-r from-emerald-600 to-teal-400",
  warning: "bg-gradient-to-r from-amber-500 to-orange-400",
  danger: "bg-gradient-to-r from-rose-600 to-red-400",
  info: "bg-gradient-to-r from-blue-600 to-sky-400",
  ocean: "bg-gradient-to-r from-[#1e4275] via-[#0284c7] to-[#38bdf8]",
} as const;

const sizeClasses = {
  xs: "h-1.5",
  sm: "h-2",
  md: "h-2.5",
  lg: "h-3",
} as const;

/** Lightweight, server-renderable progress bar using a cohesive blue spectrum by default. */
export function Meter({
  value,
  tone,
  className,
  size = "xs",
  gradient: _gradient,
}: {
  value: number;
  tone?: keyof typeof tones;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  /** Accepted for compatibility; tones are already gradients. */
  gradient?: boolean;
}) {
  const auto: keyof typeof tones = "dark-blue";

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/80 shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.06)]",
        sizeClasses[size],
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-out shadow-[0_1px_2px_rgba(9,29,62,0.28)]",
          tones[tone ?? auto]
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
