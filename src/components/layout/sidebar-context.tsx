"use client";

import * as React from "react";

interface SidebarState {
  collapsed: boolean;
  toggleCollapsed: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = React.createContext<SidebarState | null>(null);

const STORAGE_KEY = "sms.sidebar.collapsed";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Restore persisted preference after mount (avoids SSR mismatch).
  React.useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "1") setCollapsed(true);
  }, []);

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((prev) => {
      localStorage.setItem(STORAGE_KEY, prev ? "0" : "1");
      return !prev;
    });
  }, []);

  const value = React.useMemo(
    () => ({ collapsed, toggleCollapsed, mobileOpen, setMobileOpen }),
    [collapsed, toggleCollapsed, mobileOpen]
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
