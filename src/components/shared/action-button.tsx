import * as React from "react";
import { cn } from "@/lib/utils";

export type ActionButtonTone =
  | "primary"
  | "outline"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "pdf";

export type ActionButtonSize = "md" | "sm" | "xs";

const ACTION_TONE_CLASSES: Record<ActionButtonTone, string> = {
  primary:
    "border-[#091d3e] bg-gradient-to-b from-[#16345f] to-[#091d3e] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_2px_6px_-1px_rgb(9_29_62/0.35)] hover:from-[#1e4275] hover:to-[#102848] hover:text-white",
  outline:
    "border-brand/18 bg-white text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.05)] hover:border-brand/35 hover:bg-brand-50/50 hover:text-brand",
  success:
    "border-success/35 bg-success-soft/55 text-success shadow-[inset_0_1px_0_rgb(255_255_255/0.75),0_1px_2px_rgb(47_143_107/0.08)] hover:border-success hover:bg-success hover:text-white",
  danger:
    "border-danger/35 bg-danger-soft/55 text-danger shadow-[inset_0_1px_0_rgb(255_255_255/0.75),0_1px_2px_rgb(200_70_61/0.08)] hover:border-danger hover:bg-danger hover:text-white",
  warning:
    "border-warning/35 bg-warning-soft/55 text-warning shadow-[inset_0_1px_0_rgb(255_255_255/0.75),0_1px_2px_rgb(199_132_31/0.08)] hover:border-warning hover:bg-warning hover:text-white",
  info:
    "border-info/35 bg-info-soft/55 text-info shadow-[inset_0_1px_0_rgb(255_255_255/0.75),0_1px_2px_rgb(60_111_176/0.08)] hover:border-info hover:bg-info hover:text-white",
  pdf:
    "border-[#091d3e] bg-gradient-to-b from-[#16345f] to-[#091d3e] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_2px_6px_-1px_rgb(9_29_62/0.35)] hover:from-[#1e4275] hover:to-[#102848] hover:text-white",
};

const ACTION_SIZE_CLASSES: Record<ActionButtonSize, string> = {
  md: "h-9.5 gap-2 rounded-[4px] px-4 text-xs [&_svg]:size-3.5",
  sm: "h-8 gap-1.5 rounded-[4px] px-3 text-xs [&_svg]:size-3.5",
  xs: "h-7 gap-1.5 rounded-[4px] px-2.5 text-[11px] [&_svg]:size-3",
};

export function ActionButton({
  tone = "outline",
  size = "md",
  className,
  children,
  type = "button",
  ...props
}: React.ComponentProps<"button"> & {
  tone?: ActionButtonTone;
  size?: ActionButtonSize;
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center border font-semibold tracking-[0.01em] whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        ACTION_TONE_CLASSES[tone],
        ACTION_SIZE_CLASSES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
