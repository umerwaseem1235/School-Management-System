"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  UserPlus,
  Wallet,
  GraduationCap,
  Megaphone,
  FileSpreadsheet,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function QuickActions({ className }: { className?: string }) {
  const router = useRouter();

  const handleAction = (href: string, label: string) => {
    toast.info(`Opening ${label}...`);
    router.push(href);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group flex h-8.5 items-center gap-2 rounded-[4px] border border-[#091d3e] bg-gradient-to-b from-[#16345f] to-[#091d3e] px-3.5 text-xs font-semibold tracking-[0.01em] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_2px_6px_-1px_rgb(9_29_62/0.35)] transition-all duration-150 hover:from-[#1e4275] hover:to-[#102848] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
          className
        )}
      >
        <Plus className="size-3.5" />
        <span className="hidden sm:inline">Quick Action</span>
        <ChevronDown className="size-3 text-white/75 transition-transform group-data-[popup-open]:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 p-1 rounded-[4px] shadow-lg border border-brand/15 bg-white"
      >
        <DropdownMenuGroup>
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Administrative Actions
          </div>

          <DropdownMenuItem
            onClick={() => handleAction("/admissions", "New Admission")}
            className="gap-2.5 rounded-[3px] px-2 py-1.5 cursor-pointer text-xs"
          >
            <span className="grid size-6 place-items-center rounded-[3px] bg-info-soft text-info">
              <UserPlus className="size-3.5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">New Admission</p>
            </div>
            <kbd className="text-[10px] font-mono text-muted-foreground">⌥A</kbd>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleAction("/fees", "Fee Collection")}
            className="gap-2.5 rounded-[3px] px-2 py-1.5 cursor-pointer text-xs"
          >
            <span className="grid size-6 place-items-center rounded-[3px] bg-warning-soft text-warning">
              <Wallet className="size-3.5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">Collect Fee</p>
            </div>
            <kbd className="text-[10px] font-mono text-muted-foreground">⌥F</kbd>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleAction("/students", "Student Registration")}
            className="gap-2.5 rounded-[3px] px-2 py-1.5 cursor-pointer text-xs"
          >
            <span className="grid size-6 place-items-center rounded-[3px] bg-success-soft text-success">
              <GraduationCap className="size-3.5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">Enroll Student</p>
            </div>
            <kbd className="text-[10px] font-mono text-muted-foreground">⌥S</kbd>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleAction("/communication", "Campus Circular")}
            className="gap-2.5 rounded-[3px] px-2 py-1.5 cursor-pointer text-xs"
          >
            <span className="grid size-6 place-items-center rounded-[3px] bg-brand-50 text-brand">
              <Megaphone className="size-3.5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">Broadcast Circular</p>
            </div>
            <kbd className="text-[10px] font-mono text-muted-foreground">⌥B</kbd>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 border-border/70" />

        <DropdownMenuItem
          onClick={() => handleAction("/reports", "Audit Report")}
          className="gap-2.5 rounded-[3px] px-2 py-1.5 cursor-pointer text-xs"
        >
          <span className="grid size-6 place-items-center rounded-[3px] bg-muted text-muted-foreground">
            <FileSpreadsheet className="size-3.5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium">Export Report</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
