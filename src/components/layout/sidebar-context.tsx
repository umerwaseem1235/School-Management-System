"use client";

import * as React from "react";

interface SidebarState {
  isLocked: boolean;
  isHovered: boolean;
  setIsHovered: (hovered: boolean) => void;
  isExpanded: boolean;
  collapsed: boolean;
  toggleSidebar: () => void;
  toggleCollapsed: () => void;
  isPinned: boolean;
  togglePinned: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = React.createContext<SidebarState | null>(null);

const STORAGE_LOCKED_KEY = "sms.sidebar.locked";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Restore persisted preference after mount (avoids SSR mismatch).
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_LOCKED_KEY);
      if (stored !== null) {
        setIsLocked(stored === "1");
      }
    } catch {
      // localStorage may fail in some environments
    }
  }, []);

  const toggleSidebar = React.useCallback(() => {
    setIsLocked((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_LOCKED_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  }, []);

  const isExpanded = isLocked || isHovered;
  const collapsed = !isExpanded;

  const value = React.useMemo(
    () => ({
      isLocked,
      isHovered,
      setIsHovered,
      isExpanded,
      collapsed,
      toggleSidebar,
      toggleCollapsed: toggleSidebar,
      isPinned: isLocked,
      togglePinned: toggleSidebar,
      mobileOpen,
      setMobileOpen,
    }),
    [isLocked, isHovered, isExpanded, collapsed, toggleSidebar, mobileOpen]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within <SidebarProvider>");
  return ctx;
}
