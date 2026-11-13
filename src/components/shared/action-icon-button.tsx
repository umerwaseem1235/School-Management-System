"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ActionIconTone =
  | "view"
  | "edit"
  | "delete"
  | "approve"
  | "indigo"
  | "purple"
  | "neutral";

export const ACTION_ICON_TONES: Record<ActionIconTone, string> = {
  view: "border-blue-200/80 bg-blue-50/75 text-blue-700 hover:border-blue-300 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/60",
  edit: "border-amber-200/80 bg-amber-50/75 text-amber-700 hover:border-amber-300 hover:bg-amber-100 hover:text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/60",
  delete: "border-rose-200/80 bg-rose-50/75 text-rose-600 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60",
  approve: "border-emerald-200/80 bg-emerald-50/75 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60",
  indigo: "border-indigo-200/80 bg-indigo-50/75 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-100 hover:text-indigo-800 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/60",
  purple: "border-purple-200/80 bg-purple-50/75 text-purple-700 hover:border-purple-300 hover:bg-purple-100 hover:text-purple-800 dark:border-purple-800/60 dark:bg-purple-950/40 dark:text-purple-400 dark:hover:bg-purple-900/60",
  neutral: "border-border/80 bg-muted/50 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground dark:bg-muted/30 dark:hover:bg-muted/60",
};

export interface ActionIconButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "variant" | "size"> {
  tone?: ActionIconTone;
}

/**
 * Standardized compact square action icon button styled after the Academic Management table actions.
 */
export function ActionIconButton({
  tone = "neutral",
  className,
  type = "button",
  ...props
}: ActionIconButtonProps) {
  return (
    <Button
      type={type}
      variant="ghost"
      size="icon-sm"
      className={cn(
        "size-7 rounded-md border transition-all duration-150 cursor-pointer shadow-2xs active:scale-95 disabled:opacity-45 disabled:pointer-events-none [&_svg]:size-3.5",
        ACTION_ICON_TONES[tone],
        className
      )}
      {...props}
    />
  );
}
