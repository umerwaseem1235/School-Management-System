"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard, Command, Sparkles } from "lucide-react";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHORTCUT_GROUPS = [
  {
    category: "Global Navigation & Search",
    items: [
      { key: "Ctrl + K / ⌘K", description: "Open Command Palette / Search" },
      { key: "Ctrl + B / ⌘B", description: "Toggle Left Navigation Rail" },
      { key: "?", description: "View Keyboard Shortcuts cheatsheet" },
      { key: "Esc", description: "Close any modal, dialog or drawer" },
    ],
  },
  {
    category: "Quick Module Jumps",
    items: [
      { key: "Alt + 1", description: "Jump to Executive Dashboard" },
      { key: "Alt + 2", description: "Jump to Campus Network" },
      { key: "Alt + 3", description: "Jump to Admissions & Inquiries" },
      { key: "Alt + 4", description: "Jump to Student Records" },
      { key: "Alt + 5", description: "Jump to Fees & Finance" },
      { key: "Alt + 6", description: "Jump to Audit Logs & Security" },
    ],
  },
];

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden sm:max-w-lg border-border/80 shadow-2xl">
        <DialogHeader className="border-b border-border/70 bg-muted/30 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand ring-1 ring-brand/10">
              <Keyboard className="size-5" />
            </div>
            <div>
              <DialogTitle className="font-heading text-base font-bold text-brand">
                Keyboard Shortcuts
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Speed up Super Admin navigation with executive hotkeys.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-5">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.category} className="space-y-2.5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.category}
              </h4>
              <div className="divide-y divide-border/50 rounded-xl border border-border/70 bg-background/50">
                {group.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between px-3.5 py-2.5 text-xs"
                  >
                    <span className="text-foreground/90 font-medium">{item.description}</span>
                    <kbd className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/80 px-2 py-0.5 font-mono text-[11px] font-semibold text-brand shadow-2xs">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-2 rounded-xl border border-gold/30 bg-gold-soft/30 p-3 text-xs text-brand">
            <Sparkles className="size-4 text-gold shrink-0" />
            <p className="leading-snug">
              Tip: Press <span className="font-bold font-mono">Ctrl + K</span> anytime to trigger quick jump across all 12 modules and 5 campuses.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
