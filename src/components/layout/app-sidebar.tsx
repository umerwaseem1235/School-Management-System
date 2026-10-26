"use client";

import * as React from "react";
import { Menu, LogOut } from "lucide-react";
import { NAV_GROUPS } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { BrandLogo } from "./brand-logo";
import { useSidebar } from "./sidebar-context";
import { CollapsibleNavGroup } from "./collapsible-nav";

/* -------------------------------- Navigation Body -------------------------------- */

function SidebarBody({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "flex-1 px-3 py-4 space-y-1.5",
        collapsed
          ? "overflow-y-auto no-scrollbar"
          : "scrollbar-thin overflow-y-auto overflow-x-hidden"
      )}
    >
      <div className="space-y-1.5">
        {NAV_GROUPS.map((group) => (
          <CollapsibleNavGroup
            key={group.label}
            group={group}
            collapsed={collapsed}
            sidebarExpanded={!collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </nav>
  );
}

/* --------------------------------- Sidebar Footer --------------------------------- */

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="border-t border-white/10 p-3 shrink-0 overflow-hidden">
      <div className="flex items-center gap-3">
        <div
          title="Hamza Tariq (Super Admin)"
          className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15 font-heading text-xs font-bold text-white shadow-inner transition-colors duration-200 hover:bg-white/25"
        >
          HT
        </div>
        <div
          className={cn(
            "min-w-0 flex-1 whitespace-nowrap overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none",
            collapsed
              ? "pointer-events-none opacity-0 -translate-x-2"
              : "opacity-100 translate-x-0 delay-75"
          )}
        >
          <p className="truncate text-xs font-semibold text-white">Hamza Tariq</p>
          <p className="truncate text-[10.5px] text-white/60">Super Administrator</p>
        </div>
        <button
          type="button"
          aria-label="Sign out"
          title="Sign out"
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-lg text-white/60 transition-all duration-200 hover:bg-white/10 hover:text-white",
            collapsed
              ? "pointer-events-none opacity-0 scale-90"
              : "opacity-100 scale-100 delay-75"
          )}
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  );
}

/* -------------------------- Desktop Controlled Sidebar -------------------------- */

export function AppSidebar() {
  const { isLocked, isExpanded, collapsed, toggleSidebar, setIsHovered } = useSidebar();

  const enterTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = React.useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    // 40ms subtle hover debounce prevents accidental triggers during rapid mouse pass-through
    enterTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 40);
  }, [setIsHovered]);

  const handleMouseLeave = React.useCallback(() => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }
    // 140ms grace period so moving quickly across items doesn't snap shut abruptly
    leaveTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 140);
  }, [setIsHovered]);

  React.useEffect(() => {
    return () => {
      if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  return (
    <>
      {/* 
        Document Flow Spacer:
        Guarantees that the main page content is NEVER covered or behind the sidebar.
        Expands and contracts in lockstep with the sidebar.
      */}
      <div
        aria-hidden="true"
        className={cn(
          "hidden shrink-0 transition-[width] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] lg:block motion-reduce:transition-none",
          isExpanded ? "w-[264px]" : "w-[72px]"
        )}
      />

      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="Sidebar navigation"
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 hidden h-svh flex-col overflow-hidden",
          "bg-gradient-to-b from-[#1e4275] via-[#12294d] to-[#091d3e] text-sidebar-foreground",
          "transition-[width,box-shadow] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] lg:flex motion-reduce:transition-none",
          isExpanded
            ? "w-[264px] shadow-[4px_0_28px_0_rgba(9,29,62,0.42)] border-r border-white/10"
            : "w-[72px] shadow-[2px_0_8px_0_rgba(9,29,62,0.18)] border-r border-white/5"
        )}
      >
        {/* Sidebar Header with Brand Logo & Burger Action */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-border/80 bg-white transition-colors overflow-hidden",
            isExpanded
              ? "justify-between px-3.5"
              : "justify-center px-2 cursor-pointer hover:bg-slate-50"
          )}
          onClick={collapsed ? toggleSidebar : undefined}
          title={collapsed ? "Click to lock sidebar expanded" : undefined}
        >
          <BrandLogo collapsed={!isExpanded} />
          {isExpanded && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleSidebar();
              }}
              title={isLocked ? "Collapse to compact rail (hover to expand)" : "Lock sidebar expanded"}
              aria-label={isLocked ? "Collapse sidebar" : "Lock sidebar expanded"}
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
                isLocked
                  ? "bg-brand text-white shadow-xs hover:bg-brand/90"
                  : "text-muted-foreground hover:bg-brand-50 hover:text-brand"
              )}
            >
              <Menu className="size-4.5" />
            </button>
          )}
        </div>

        {/* Navigation Modules */}
        <SidebarBody collapsed={!isExpanded} />

        {/* Sidebar Footer */}
        <SidebarFooter collapsed={!isExpanded} />
      </aside>
    </>
  );
}

/* --------------------------- Mobile Drawer (< lg screens) --------------------------- */

export function MobileSidebar() {
  const { mobileOpen, setMobileOpen } = useSidebar();

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[280px] gap-0 border-none bg-gradient-to-b from-[#1e4275] via-[#12294d] to-[#091d3e] p-0 text-sidebar-foreground"
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/80 bg-white px-5">
          <BrandLogo collapsed={false} />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            title="Close navigation"
            aria-label="Close navigation"
            className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-brand-50 hover:text-brand"
          >
            <Menu className="size-4.5" />
          </button>
        </div>
        <SidebarBody collapsed={false} onNavigate={() => setMobileOpen(false)} />
        <SidebarFooter collapsed={false} />
      </SheetContent>
    </Sheet>
  );
}
