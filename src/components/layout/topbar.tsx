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

export interface AcademicYearOption {
  id: string;
  label: string;
  tag: "Upcoming" | "Current" | "Archived";
  active?: boolean;
}

const YEAR_OPTIONS: AcademicYearOption[] = [
  { id: "2027-28", label: "AY 2027–28", tag: "Upcoming", active: false },
  { id: "2026-27", label: "AY 2026–27", tag: "Current", active: true },
  { id: "2025-26", label: "AY 2025–26", tag: "Archived", active: false },
  { id: "2024-25", label: "AY 2024–25", tag: "Archived", active: false },
  { id: "2023-24", label: "AY 2023–24", tag: "Archived", active: false },
  { id: "2022-23", label: "AY 2022–23", tag: "Archived", active: false },
  { id: "2021-22", label: "AY 2021–22", tag: "Archived", active: false },
  { id: "2020-21", label: "AY 2020–21", tag: "Archived", active: false },
  { id: "2019-20", label: "AY 2019–20", tag: "Archived", active: false },
  { id: "2018-19", label: "AY 2018–19", tag: "Archived", active: false },
  { id: "2017-18", label: "AY 2017–18", tag: "Archived", active: false },
  { id: "2016-17", label: "AY 2016–17", tag: "Archived", active: false },
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
    return (
      YEAR_OPTIONS.find((y) => y.id === selectedYear) ||
      YEAR_OPTIONS.find((y) => y.active) ||
      YEAR_OPTIONS[0]
    );
  }, [selectedYear]);

  const handleCampusChange = (id: string) => {
    setSelectedCampus(id);
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
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#0D1C42]/14 bg-gradient-to-b from-[#eef3fc]/95 via-[#e8effb]/95 to-[#e1ebfa]/95 px-4 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_2px_10px_-3px_rgba(13,28,66,0.08)] sm:px-6">
        {/* Left Section: Mobile Drawer Toggle & Breadcrumbs */}
        <div className="flex min-w-0 items-center gap-3" suppressHydrationWarning>
          <button
            type="button"
            aria-label="Open navigation menu"
            suppressHydrationWarning
            onClick={() => setMobileOpen(true)}
            className="grid size-8.5 shrink-0 place-items-center rounded-[4px] border border-brand/18 bg-white text-foreground/85 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.06)] transition-all duration-150 hover:border-brand/35 hover:bg-brand-50/60 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 lg:hidden"
          >
            <Menu className="size-4" />
          </button>

          <Breadcrumbs />
        </div>

        {/* Right Section: Cohesive Executive Toolbar */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Campus Switcher (Names Only) */}
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Select Campus"
              className="group hidden md:flex h-8.5 items-center gap-2 rounded-[4px] border border-brand/18 bg-white px-3 text-xs font-semibold tracking-[0.01em] text-foreground/85 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.06)] transition-all duration-150 hover:border-brand/35 hover:bg-brand-50/60 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 data-[state=open]:border-[#091d3e] data-[state=open]:bg-brand-50/70"
            >
              <Building2 className="size-3.5 text-muted-foreground transition-colors group-hover:text-brand" />
              <span className="max-w-[140px] truncate">
                {activeCampusObj ? activeCampusObj.campusName.split("—")[0].trim() : "All Campuses"}
              </span>
              <ChevronDown className="size-3 text-muted-foreground transition-transform group-hover:text-brand group-data-[popup-open]:rotate-180" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-52 p-1 rounded-[4px] shadow-lg border border-brand/15 bg-white"
            >
              <DropdownMenuGroup className="space-y-0.5">
                <DropdownMenuItem
                  onClick={() => handleCampusChange("all")}
                  className={cn(
                    "flex items-center justify-between rounded-[3px] px-2.5 py-1.5 cursor-pointer text-xs font-medium transition-colors",
                    selectedCampus === "all"
                      ? "border border-[#091d3e] bg-gradient-to-b from-[#16345f] to-[#091d3e] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2)] focus:bg-[#091d3e] focus:text-white"
                      : "text-foreground hover:bg-[#eef3fc]"
                  )}
                >
                  <span className="truncate">All Campuses</span>
                  {selectedCampus === "all" && <Check className="size-3.5 text-white shrink-0 ml-2" />}
                </DropdownMenuItem>

                {CAMPUSES.map((c) => {
                  const isSelected = selectedCampus === c.id;
                  const cleanName = c.campusName.split("—")[0].trim();
                  return (
                    <DropdownMenuItem
                      key={c.id}
                      onClick={() => handleCampusChange(c.id)}
                      className={cn(
                        "flex items-center justify-between rounded-[3px] px-2.5 py-1.5 cursor-pointer text-xs font-medium transition-colors",
                        isSelected
                          ? "border border-[#091d3e] bg-gradient-to-b from-[#16345f] to-[#091d3e] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2)] focus:bg-[#091d3e] focus:text-white"
                          : "text-foreground hover:bg-[#eef3fc]"
                      )}
                    >
                      <span className="truncate">{cleanName}</span>
                      {isSelected && <Check className="size-3.5 text-white shrink-0 ml-2" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Academic Session Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Select Academic Year"
              className="group hidden md:flex h-8.5 items-center gap-2 rounded-[4px] border border-brand/18 bg-white px-3 text-xs font-semibold tracking-[0.01em] text-foreground/85 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.06)] transition-all duration-150 hover:border-brand/35 hover:bg-brand-50/60 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 data-[state=open]:border-[#091d3e] data-[state=open]:bg-brand-50/70"
            >
              <CalendarRange className="size-3.5 text-muted-foreground transition-colors group-hover:text-brand" />
              <span>{activeYearObj.label}</span>
              <ChevronDown className="size-3 text-muted-foreground transition-transform group-hover:text-brand group-data-[popup-open]:rotate-180" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-60 p-1.5 rounded-[4px] shadow-xl border border-brand/15 bg-white"
            >
              <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/70 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Academic Year
                </span>
                <span className="rounded-[3px] bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand ring-1 ring-brand/15">
                  {YEAR_OPTIONS.length} Sessions
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto scrollbar-thin-light space-y-0.5 pr-0.5">
                {YEAR_OPTIONS.map((y) => {
                  const isSelected = selectedYear === y.id;
                  return (
                    <DropdownMenuItem
                      key={y.id}
                      onClick={() => handleYearChange(y.id, y.label)}
                      className={cn(
                        "flex items-center justify-between rounded-[3px] px-2.5 py-1.5 cursor-pointer text-xs font-medium transition-colors",
                        isSelected
                          ? "border border-[#091d3e] bg-gradient-to-b from-[#16345f] to-[#091d3e] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2)] focus:bg-[#091d3e] focus:text-white"
                          : "text-foreground hover:bg-[#eef3fc]"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span>{y.label}</span>
                        {y.tag === "Current" && (
                          <span
                            className={cn(
                              "rounded-[3px] px-1.5 py-0.5 text-[9.5px] font-semibold tracking-tight",
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            )}
                          >
                            Current
                          </span>
                        )}
                        {y.tag === "Upcoming" && (
                          <span
                            className={cn(
                              "rounded-[3px] px-1.5 py-0.5 text-[9.5px] font-semibold tracking-tight",
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            )}
                          >
                            Upcoming
                          </span>
                        )}
                        {y.tag === "Archived" && !isSelected && (
                          <span className="text-[10px] text-muted-foreground font-normal">
                            Past
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="size-3.5 text-white shrink-0 ml-2" />}
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Action Button */}
          <QuickActions />

          {/* Divider */}
          <div className="hidden sm:block h-4 w-px bg-[#0D1C42]/15 mx-0.5" />

          {/* Notifications */}
          <NotificationCenter />

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="User Account"
              className="group flex h-8.5 items-center gap-2 rounded-[4px] border border-brand/18 bg-white pl-1.5 pr-2.5 text-xs font-semibold tracking-[0.01em] text-foreground/85 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(9_29_62/0.06)] transition-all duration-150 hover:border-brand/35 hover:bg-brand-50/60 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 data-[state=open]:border-[#091d3e] data-[state=open]:bg-brand-50/70"
            >
              <span className="grid size-6 place-items-center rounded-[3px] bg-gradient-to-b from-[#16345f] to-[#091d3e] font-heading text-[10.5px] font-bold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]">
                HT
              </span>
              <div className="hidden text-left leading-tight md:block">
                <span className="block font-semibold text-foreground">Hamza Tariq</span>
              </div>
              <ChevronDown className="size-3 text-muted-foreground transition-transform group-hover:text-brand group-data-[popup-open]:rotate-180" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 p-1 rounded-[4px] shadow-lg border border-brand/15 bg-white"
            >
              <div className="px-2.5 py-2 border-b border-border/70 mb-1">
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
                  className="gap-2 rounded-[3px] px-2.5 py-1.5 cursor-pointer text-xs"
                >
                  <UserRound className="size-3.5 text-muted-foreground" />
                  <span>My Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => toast.info("2FA is active and enforced.")}
                  className="gap-2 rounded-[3px] px-2.5 py-1.5 cursor-pointer text-xs"
                >
                  <ShieldCheck className="size-3.5 text-success" />
                  <span>Security & 2FA</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setShortcutsOpen(true)}
                  className="gap-2 rounded-[3px] px-2.5 py-1.5 cursor-pointer text-xs"
                >
                  <Command className="size-3.5 text-muted-foreground" />
                  <span className="flex-1">Shortcuts</span>
                  <kbd className="text-[10px] font-mono text-muted-foreground">?</kbd>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => toast.info("Opening System Preferences...")}
                  className="gap-2 rounded-[3px] px-2.5 py-1.5 cursor-pointer text-xs"
                >
                  <Settings className="size-3.5 text-muted-foreground" />
                  <span>Preferences</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-1 border-border/70" />

              <DropdownMenuItem
                variant="destructive"
                onClick={handleSignOut}
                className="gap-2 rounded-[3px] px-2.5 py-1.5 cursor-pointer text-xs"
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
