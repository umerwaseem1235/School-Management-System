"use client";

import { ChevronsLeft, LogOut } from "lucide-react";
import { NAV_GROUPS } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { BrandLogo } from "./brand-logo";
import { useSidebar } from "./sidebar-context";
import { CollapsibleNavGroup } from "./collapsible-nav";

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
        "flex-1 space-y-2.5 px-3 py-5",
        // Collapsed rail must not clip the floating submenu cards.
        collapsed ? "overflow-visible" : "scrollbar-thin overflow-y-auto"
      )}
    >
      <div className={cn(collapsed && "space-y-2 pt-1")}>
        {NAV_GROUPS.map((group) => (
          <CollapsibleNavGroup
            key={group.label}
            group={group}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </nav>
  );
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="border-t border-sidebar-border p-3">
        <div className="mx-auto grid size-9 place-items-center rounded-full bg-cream font-heading text-xs font-bold text-brand">
          HT
        </div>
      </div>
    );
  }
  return (
    <div className="border-t border-sidebar-border p-4">
      <div className="flex items-center gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-cream font-heading text-xs font-bold text-brand">
          HT
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">Hamza Tariq</p>
          <p className="truncate text-xs text-sidebar-muted">Super Administrator</p>
        </div>
        <button
          type="button"
          aria-label="Sign out"
          className="grid size-8 place-items-center rounded-lg text-sidebar-muted transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  );
}

/** Desktop sidebar (≥ lg) — collapsible rail. */
export function AppSidebar() {
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 flex-col bg-gradient-to-b from-[#1e4275] via-[#12294d] to-[#091d3e] text-sidebar-foreground transition-[width] duration-300 ease-out lg:flex",
        collapsed ? "w-[76px]" : "w-[264px]"
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-border/80 bg-white",
          collapsed ? "justify-center px-2" : "justify-between px-5"
        )}
      >
        <BrandLogo collapsed={collapsed} />
        {!collapsed && (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Collapse sidebar"
            className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-brand-50 hover:text-brand"
          >
            <ChevronsLeft className="size-4" />
          </button>
        )}
      </div>
      {collapsed && (
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label="Expand sidebar"
          className="mx-auto mt-3 grid size-7 place-items-center rounded-md text-sidebar-muted transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronsLeft className="size-4 rotate-180" />
        </button>
      )}
      <SidebarBody collapsed={collapsed} />
      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}

/** Mobile drawer (< lg). */
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
        <div className="flex h-16 shrink-0 items-center border-b border-border/80 bg-white px-5">
          <BrandLogo />
        </div>
        <SidebarBody collapsed={false} onNavigate={() => setMobileOpen(false)} />
        <SidebarFooter collapsed={false} />
      </SheetContent>
    </Sheet>
  );
}
