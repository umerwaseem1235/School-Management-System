"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "@/config/navigation";
import { cn } from "@/lib/utils";

// Route to title and group mapping
const ROUTE_MAP: Record<string, { title: string; group: string }> = {
  "/": { title: "Dashboard", group: "Dashboard" },
  "/dashboard": { title: "Dashboard", group: "Dashboard" },
  "/reception": { title: "Reception", group: "Administration" },
  "/students": { title: "Students", group: "Administration" },
  "/staff": { title: "Staff", group: "Administration" },
  "/users": { title: "Users & Roles", group: "Administration" },
  "/academics": { title: "Academic Management", group: "Academics" },
  "/lms": { title: "LMS", group: "Academics" },
  "/examinations": { title: "Examinations", group: "Examinations" },
  "/tests-assessments": { title: "Tests & Assessments", group: "Examinations" },
  "/admission-tests": { title: "Admission Tests", group: "Examinations" },
  "/paper-generator": { title: "Paper Generator", group: "Examinations" },
  "/results": { title: "Results", group: "Examinations" },
  "/certificates": { title: "Certificates", group: "Examinations" },
  "/attendance": { title: "Attendance", group: "Student Life" },
  "/sports": { title: "Sports", group: "Student Life" },
  "/library": { title: "Library", group: "Student Life" },
  "/hostel": { title: "Hostel Management", group: "Student Life" },
  "/fees": { title: "Fee Management", group: "Finance" },
  "/accounts": { title: "Accounts", group: "Finance" },
  "/monthly-accounts": { title: "Monthly Accounts", group: "Finance" },
  "/expenses": { title: "Expenses", group: "Finance" },
  "/inventory": { title: "Inventory", group: "Operations" },
  "/transport": { title: "Transport", group: "Operations" },
  "/assets": { title: "Assets", group: "Operations" },
  "/announcements": { title: "Announcement", group: "Communication" },
  "/communication": { title: "Communication", group: "Communication" },
  "/settings": { title: "System Configuration", group: "Settings" },
};

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();

  const current = React.useMemo(() => {
    if (ROUTE_MAP[pathname]) return ROUTE_MAP[pathname];
    for (const [route, meta] of Object.entries(ROUTE_MAP)) {
      if (route !== "/" && pathname.startsWith(route)) return meta;
    }
    for (const group of NAV_GROUPS) {
      const match = group.items.find(
        (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
      );
      if (match) {
        return { title: match.title, group: group.label };
      }
    }
    return { title: "Super Admin", group: "Overview" };
  }, [pathname]);

  return (
    <nav aria-label="Breadcrumb" className={cn("flex min-w-0 items-center gap-2", className)}>
      <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 sm:inline shrink-0">
        {current.group}
      </span>
      <span className="hidden text-muted-foreground/40 sm:inline shrink-0">/</span>
      <h1 className="truncate font-heading text-sm font-bold tracking-tight text-foreground">
        {current.title}
      </h1>
    </nav>
  );
}
