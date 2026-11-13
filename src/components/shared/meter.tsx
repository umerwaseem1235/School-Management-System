import { cn } from "@/lib/utils";

const tones = {
  brand: "bg-gradient-to-r from-[#a05a2c] via-[#7c4424] to-[#5c3118]",
  "blue-gradient": "bg-gradient-to-r from-[#a05a2c] via-[#7c4424] to-[#5c3118]",
  "premium-blue": "bg-gradient-to-r from-[#c28b38] via-[#7c4424] to-[#381e0f]",
  "dark-blue": "bg-gradient-to-r from-[#7c4424] via-[#5c3118] to-[#381e0f]",
  "ocean-blue": "bg-gradient-to-r from-[#a05a2c] via-[#7c4424] to-[#5c3118]",
  "sky-blue": "bg-gradient-to-r from-[#c28b38] via-[#c28b38] to-[#7c4424]",
  "light-blue": "bg-gradient-to-r from-[#ebdcc6] to-[#c28b38]",
  gold: "bg-gradient-to-r from-amber-500 to-amber-400",
  success: "bg-gradient-to-r from-emerald-600 to-teal-400",
  warning: "bg-gradient-to-r from-amber-500 to-orange-400",
  danger: "bg-gradient-to-r from-rose-600 to-red-400",
  info: "bg-gradient-to-r from-violet-700 to-purple-500",
  ocean: "bg-gradient-to-r from-[#a05a2c] via-[#7c4424] to-[#5c3118]",
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
          "h-full rounded-full transition-all duration-500 ease-out shadow-[0_1px_2px_rgba(56,30,15,0.28)]",
          tones[tone ?? auto]
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
