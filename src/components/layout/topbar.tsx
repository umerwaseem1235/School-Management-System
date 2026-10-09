"use client";

import * as React from "react";
import {
  Building2,
  CalendarRange,
  ChevronDown,
  KeyRound,
  LogOut,
  Menu,
  Settings,
  UserRound,
  ShieldCheck,
  Command,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CAMPUSES } from "@/lib/mock/institution";
import { useSidebar } from "./sidebar-context";
import { Breadcrumbs } from "./breadcrumbs";
import { QuickActions } from "./quick-actions";
import { NotificationCenter } from "./notification-center";
import { KeyboardShortcutsDialog } from "./keyboard-shortcuts-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const YEAR_OPTIONS = [
  { id: "2026-27", label: "AY 2026–27", tag: "Current", active: true },
  { id: "2025-26", label: "AY 2025–26", tag: "Archived", active: false },
  { id: "2024-25", label: "AY 2024–25", tag: "Archived", active: false },
];

export function Topbar() {
  const { setMobileOpen } = useSidebar();
  const [selectedCampus, setSelectedCampus] = React.useState<string>("all");
  const [selectedYear, setSelectedYear] = React.useState<string>("2026-27");
  const [shortcutsOpen, setShortcutsOpen] = React.useState<boolean>(false);

  const activeCampusObj = React.useMemo(() => {
    if (selectedCampus === "all") return null;
    return CAMPUSES.find((c) => c.id === selectedCampus);
  }, [selectedCampus]);

  const activeYearObj = React.useMemo(() => {
    return YEAR_OPTIONS.find((y) => y.id === selectedYear) || YEAR_OPTIONS[0];
  }, [selectedYear]);

  const handleCampusChange = (id: string, name: string) => {
    setSelectedCampus(id);
    toast.success(`Active Campus: ${name}`);
  };

  const handleYearChange = (id: string, label: string) => {
    setSelectedYear(id);
    toast.info(`Academic Session: ${label}`);
  };

  const handleSignOut = () => {
    toast.success("Signed out successfully");
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/80 bg-white/95 px-4 backdrop-blur-md sm:px-6">
        {/* Left Section: Mobile Toggle & Breadcrumbs */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen(true)}
            className="grid size-8.5 shrink-0 place-items-center rounded-lg border border-border bg-white text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground lg:hidden"
          >
            <Menu className="size-4" />
          </button>

          <Breadcrumbs />
        </div>

        {/* Right Section: Cohesive Executive Toolbar */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Campus Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Select Campus"
              className="group hidden md:flex h-8.5 items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Building2 className="size-3.5 text-muted-foreground" />
              <span className="max-w-[130px] truncate">
                {activeCampusObj ? activeCampusObj.campusName.split("—")[0].trim() : "All Campuses"}
              </span>
              <ChevronDown className="size-3 text-muted-foreground transition-transform group-data-[popup-open]:rotate-180" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-68 p-1 rounded-xl shadow-lg border-border bg-white">
              <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Institutional Campus
              </DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() => handleCampusChange("all", "All Campuses")}
                className={cn(
                  "gap-2 rounded-lg px-2 py-1.5 cursor-pointer text-xs",
                  selectedCampus === "all" ? "bg-brand text-white" : "hover:bg-muted"
                )}
              >
                <span className="flex-1 font-medium">All Campuses (Consolidated)</span>
                {selectedCampus === "all" && <Check className="size-3.5 text-white" />}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 border-border" />

              <div className="space-y-0.5">
                {CAMPUSES.map((c) => {
                  const isSelected = selectedCampus === c.id;
                  return (
                    <DropdownMenuItem
                      key={c.id}
                      onClick={() => handleCampusChange(c.id, c.campusName)}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-2 py-1.5 cursor-pointer text-xs",
                        isSelected ? "bg-brand text-white" : "hover:bg-muted"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{c.campusName}</p>
                        <p
                          className={cn(
                            "text-[10.5px]",
                            isSelected ? "text-white/80" : "text-muted-foreground"
                          )}
                        >
                          {c.city} · {c.campusCode}
                        </p>
                      </div>
                      {isSelected && <Check className="size-3.5 text-white shrink-0 ml-1.5" />}
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Academic Session Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Select Academic Year"
              className="group hidden xl:flex h-8.5 items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CalendarRange className="size-3.5 text-muted-foreground" />
              <span>{activeYearObj.label}</span>
              <ChevronDown className="size-3 text-muted-foreground transition-transform group-data-[popup-open]:rotate-180" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl shadow-lg border-border bg-white">
              <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Academic Year
              </DropdownMenuLabel>
              {YEAR_OPTIONS.map((y) => {
                const isSelected = selectedYear === y.id;
                return (
                  <DropdownMenuItem
                    key={y.id}
                    onClick={() => handleYearChange(y.id, y.label)}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-2 py-1.5 cursor-pointer text-xs",
                        isSelected ? "bg-brand text-white" : "hover:bg-muted"
                      )}
                    >
                      <span>{y.label}</span>
                      {isSelected && <Check className="size-3.5 text-white" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Action Button */}
          <QuickActions />

          {/* Divider */}
          <div className="hidden sm:block h-4 w-px bg-border/80 mx-0.5" />

          {/* Notifications */}
          <NotificationCenter />

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="User Account"
              className="group flex h-8.5 items-center gap-2 rounded-lg border border-border bg-white pl-1 pr-2.5 text-xs transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="grid size-6.5 place-items-center rounded-md bg-brand font-heading text-[11px] font-bold text-white">
                HT
              </span>
              <div className="hidden text-left leading-tight md:block">
                <span className="block font-semibold text-foreground">Hamza Tariq</span>
              </div>
              <ChevronDown className="size-3 text-muted-foreground transition-transform group-data-[popup-open]:rotate-180" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 p-1 rounded-xl shadow-lg border-border bg-white"
            >
              <div className="px-2 py-2 border-b border-border mb-1">
                <p className="text-xs font-semibold text-foreground">Hamza Tariq</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  hamza.tariq@edusphere.edu.pk
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Super Administrator
                  </span>
                </div>
              </div>

              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => toast.info("Opening Admin Profile...")}
                  className="gap-2 rounded-lg px-2 py-1.5 cursor-pointer text-xs"
                >
                  <UserRound className="size-3.5 text-muted-foreground" />
                  <span>My Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => toast.info("2FA is active and enforced.")}
                  className="gap-2 rounded-lg px-2 py-1.5 cursor-pointer text-xs"
                >
                  <ShieldCheck className="size-3.5 text-success" />
                  <span>Security & 2FA</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setShortcutsOpen(true)}
                  className="gap-2 rounded-lg px-2 py-1.5 cursor-pointer text-xs"
                >
                  <Command className="size-3.5 text-muted-foreground" />
                  <span className="flex-1">Shortcuts</span>
                  <kbd className="text-[10px] font-mono text-muted-foreground">?</kbd>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => toast.info("Opening System Preferences...")}
                  className="gap-2 rounded-lg px-2 py-1.5 cursor-pointer text-xs"
                >
                  <Settings className="size-3.5 text-muted-foreground" />
                  <span>Preferences</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-1 border-border" />

              <DropdownMenuItem
                variant="destructive"
                onClick={handleSignOut}
                className="gap-2 rounded-lg px-2 py-1.5 cursor-pointer text-xs"
              >
                <LogOut className="size-3.5" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />
    </>
  );
}
